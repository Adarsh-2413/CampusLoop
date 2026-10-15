import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

describe('Phase 5 — Cart & Orders Lifecycle Tests', () => {
  let server;
  let baseUrl;
  let buyerToken;
  let otherBuyerToken;

  test.before((t, done) => {
    process.env.JWT_SECRET = 'test_secret_for_unit_tests_123456';

    const mockBuyer = {
      _id: '64d8a1b2c3d4e5f6a7b8c9d2',
      email: 'buyer@college.edu',
      role: 'BUYER'
    };
    buyerToken = generateToken(mockBuyer);

    const mockOtherBuyer = {
      _id: '64d8a1b2c3d4e5f6a7b8c9d3',
      email: 'otherbuyer@college.edu',
      role: 'BUYER'
    };
    otherBuyerToken = generateToken(mockOtherBuyer);

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

  test('GET /api/cart rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/cart`);
    assert.strictEqual(res.status, 401);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });

  test('GET /api/cart returns 200 with cart structure for authenticated student', async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.items));
    assert.strictEqual(typeof body.data.subtotalPaise, 'number');
    assert.strictEqual(typeof body.data.itemCount, 'number');
  });

  test('POST /api/cart/items rejects invalid product ID with 400', async () => {
    const res = await fetch(`${baseUrl}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        productId: 'invalid-id',
        quantity: 1
      })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_PRODUCT_ID');
  });

  test('POST /api/orders rejects empty order items array with 400', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        items: [],
        buyerPhone: '+91 98765 43210'
      })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'EMPTY_ORDER');
  });

  test('POST /api/orders rejects missing contact phone number with 400', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        items: [{ productId: '64d8a1b2c3d4e5f6a7b8c9d0', quantity: 1 }]
      })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MISSING_CONTACT_PHONE');
  });

  test('POST /api/orders creates pending order with unique orderNumber and integer paise total', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        items: [{ productId: '64d8a1b2c3d4e5f6a7b8c9d0', quantity: 1 }],
        buyerPhone: '+91 98765 43210',
        handoverLocation: 'Campus Central Library Entrance / Lawn'
      })
    });
    assert.strictEqual(res.status, 201);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.order);
    assert.ok(body.data.order.orderNumber.startsWith('CL-'));
    assert.strictEqual(body.data.order.paymentStatus, 'PENDING_PAYMENT');
    assert.strictEqual(Number.isInteger(body.data.order.totalAmountPaise), true);
  });

  test('GET /api/orders/my returns 200 with list of user orders', async () => {
    const res = await fetch(`${baseUrl}/api/orders/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.orders));
  });

  test('GET /api/orders/:id with invalid ID returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/orders/invalid-order-id`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_ID');
  });
});
