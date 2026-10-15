import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

describe('Phase 7 — Admin Moderation & Audit Logging Tests', () => {
  let server;
  let baseUrl;
  let adminToken;
  let buyerToken;
  const adminId = '64d8a1b2c3d4e5f6a7b8c9d0';
  const buyerId = '64d8a1b2c3d4e5f6a7b8c9d1';

  test.before((t, done) => {
    process.env.JWT_SECRET = 'test_secret_for_unit_tests_123456';

    const mockAdmin = {
      _id: adminId,
      id: adminId,
      email: 'admin.moderator@nitk.edu.in',
      role: 'ADMIN'
    };

    const mockBuyer = {
      _id: buyerId,
      id: buyerId,
      email: 'buyer.student@nitk.edu.in',
      role: 'BUYER'
    };

    adminToken = generateToken(mockAdmin);
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

  test('GET /api/admin/dashboard rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.strictEqual(res.status, 401);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });

  test('GET /api/admin/dashboard rejects non-admin student role with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${buyerToken}`
      }
    });
    assert.strictEqual(res.status, 403);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'FORBIDDEN');
  });

  test('GET /api/admin/dashboard returns 200 with platform integrity metrics for ADMIN', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.totalUsers !== undefined);
    assert.ok(body.data.activeProducts !== undefined);
    assert.ok(body.data.openReports !== undefined);
  });

  test('GET /api/admin/reports returns list of peer reports for ADMIN', async () => {
    const res = await fetch(`${baseUrl}/api/admin/reports`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.reports));
    assert.ok(body.data.total >= 0);
  });

  test('PATCH /api/admin/reports/:id rejects invalid status with 400', async () => {
    const res = await fetch(`${baseUrl}/api/admin/reports/507f1f77bcf86cd799439011`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'INVALID_STATUS' })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_STATUS');
  });

  test('PATCH /api/admin/reports/:id successfully updates status to DISMISSED or RESOLVED', async () => {
    const res = await fetch(`${baseUrl}/api/admin/reports/507f1f77bcf86cd799439011`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'DISMISSED',
        adminNotes: 'Verified genuine seller duplicate listing closed.'
      })
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'DISMISSED');
  });

  test('PATCH /api/admin/products/:id/status delists prohibited or suspicious product', async () => {
    const res = await fetch(`${baseUrl}/api/admin/products/507f1f77bcf86cd799439099/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'INACTIVE',
        reason: 'Violates hostel power appliance policy'
      })
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'INACTIVE');
  });

  test('GET /api/admin/users lists registered accounts for administrative oversight', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.users));
  });

  test('PATCH /api/admin/users/:id/status prevents self-suspension by logged in admin', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users/${adminId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'SUSPENDED',
        reason: 'Attempt self suspend'
      })
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'SELF_MODERATION_BLOCKED');
  });

  test('GET /api/admin/audit-logs returns audit logs trail for compliance', async () => {
    const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.logs));
  });
});
