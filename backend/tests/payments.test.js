import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import crypto from 'node:crypto';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';
import { verifyPaymentSignature, verifyWebhookSignature } from '../src/utils/crypto.js';

describe('Phase 6 — Razorpay Payments & Webhooks Tests', () => {
  let server;
  let baseUrl;
  let buyerToken;
  const mockSecret = 'test_razorpay_secret_key_12345';
  const mockWebhookSecret = 'test_webhook_secret_key_67890';

  test.before((t, done) => {
    process.env.JWT_SECRET = 'test_secret_for_unit_tests_123456';
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;

    const mockBuyer = {
      _id: '64d8a1b2c3d4e5f6a7b8c9d2',
      email: 'buyer@college.edu',
      role: 'BUYER'
    };
    buyerToken = generateToken(mockBuyer);

    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  test.after((t, done) => {
    server.close(done);
  });

  test('POST /api/payments/create-order rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: '64d8a1b2c3d4e5f6a7b8c9d0' })
    });
    assert.strictEqual(res.status, 401);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });

  test('verifyPaymentSignature correctly validates authentic HMAC-SHA256 signature', () => {
    const orderId = 'order_simulated_991823';
    const paymentId = 'pay_simulated_552190';
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(payload)
      .digest('hex');

    const result = verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
      secret: mockSecret
    });

    assert.strictEqual(result, true);
  });

  test('verifyPaymentSignature rejects tampered or fraudulent signature', () => {
    const orderId = 'order_simulated_991823';
    const paymentId = 'pay_simulated_552190';
    const tamperedSignature = 'tampered_fake_signature_hash_00000000000000000000000000000000';

    const result = verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: tamperedSignature,
      secret: mockSecret
    });

    assert.strictEqual(result, false);
  });

  test('POST /api/payments/verify rejects invalid payment signature with 400', async () => {
    const res = await fetch(`${baseUrl}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        orderId: '64d8a1b2c3d4e5f6a7b8c9d0',
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_456',
        razorpaySignature: 'invalid_tampered_signature_payload'
      })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_SIGNATURE');
  });

  test('POST /api/payments/verify succeeds when HMAC-SHA256 signature matches key secret', async () => {
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(payload)
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        orderId: '64d8a1b2c3d4e5f6a7b8c9d0',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature
      })
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.paymentStatus, 'PAID');
    assert.strictEqual(body.data.fulfillmentStatus, 'READY_FOR_HANDOVER');
  });

  test('POST /api/payments/webhook rejects requests missing X-Razorpay-Signature header', async () => {
    const res = await fetch(`${baseUrl}/api/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'order.paid' })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MISSING_WEBHOOK_SIGNATURE');
  });

  test('POST /api/payments/webhook rejects requests with invalid signature', async () => {
    const res = await fetch(`${baseUrl}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'invalid_raw_body_signature_hash'
      },
      body: JSON.stringify({ event: 'order.paid', id: 'evt_123' })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_WEBHOOK_SIGNATURE');
  });

  test('POST /api/payments/webhook accepts valid raw body webhook signature', async () => {
    const webhookPayload = JSON.stringify({
      event: 'order.paid',
      id: 'evt_test_778899',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_7788',
            order_id: 'order_test_7788',
            amount: 85000,
            currency: 'INR'
          }
        }
      }
    });

    const validWebhookSig = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(Buffer.from(webhookPayload, 'utf-8'))
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validWebhookSig
      },
      body: webhookPayload
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });
});
