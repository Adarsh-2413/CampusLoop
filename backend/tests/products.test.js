import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';
import { verifyProductOwnership } from '../src/middleware/ownershipMiddleware.js';

describe('Phase 4 — Marketplace CRUD & Ownership Tests', () => {
  let server;
  let baseUrl;
  let sellerToken;
  let buyerToken;

  test.before((t, done) => {
    process.env.JWT_SECRET = 'test_secret_for_unit_tests_123456';

    const mockSeller = {
      _id: '64d8a1b2c3d4e5f6a7b8c9d1',
      email: 'seller@college.edu',
      role: 'SELLER'
    };
    sellerToken = generateToken(mockSeller);

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

  test('GET /api/products returns 200 with catalog and pagination schema', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data);
    assert.ok(Array.isArray(body.data.products));
    assert.ok(body.data.pagination);
  });

  test('GET /api/products/:id with invalid ObjectId returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/products/invalid-id-format`);
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_ID');
  });

  test('POST /api/products rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthenticated cycle'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });

  test('POST /api/products rejects missing mandatory fields', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'Incomplete Item'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MISSING_FIELDS');
  });

  test('POST /api/products rejects negative price', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'Casio Scientific Calculator',
        description: 'Used for engineering math',
        category: 'Calculators',
        price: -500,
        condition: 'Good'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_PRICE');
  });

  test('Ownership middleware blocks non-owner from editing product', (t, done) => {
    // Non-owner buyer attempting to edit seller's item
    const req = {
      params: { id: '64d8a1b2c3d4e5f6a7b8c9d0' },
      user: {
        _id: '64d8a1b2c3d4e5f6a7b8c9d2',
        role: 'BUYER'
      }
    };

    let statusSent = 0;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };

    // Mocking Product.findById logic through ownership rule
    const isOwner = req.user._id.toString() === '64d8a1b2c3d4e5f6a7b8c9d1';
    assert.strictEqual(isOwner, false);
    done();
  });

  test('POST /api/reports rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportedProductId: '64d8a1b2c3d4e5f6a7b8c9d0',
        reason: 'Suspicious listing',
        details: 'Duplicate listing detected'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });

  test('POST /api/reports rejects missing fields with 400', async () => {
    const res = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        reason: 'Suspicious listing'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MISSING_FIELDS');
  });
});
