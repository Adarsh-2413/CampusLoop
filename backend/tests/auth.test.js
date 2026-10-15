import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';
import { validateCollegeEmail } from '../src/utils/emailValidator.js';
import { generateToken, verifyToken } from '../src/utils/token.js';
import { requireRole } from '../src/middleware/authMiddleware.js';

describe('Phase 3 — Authentication & RBAC Tests', () => {
  let server;
  let baseUrl;

  test.before((t, done) => {
    process.env.COLLEGE_EMAIL_DOMAINS = 'college.edu,nit.ac.in,dtu.ac.in';
    process.env.JWT_SECRET = 'test_secret_for_unit_tests_123456';
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

  test('validateCollegeEmail accepts valid configured college domains', () => {
    const res1 = validateCollegeEmail('student@college.edu');
    assert.strictEqual(res1.valid, true);

    const res2 = validateCollegeEmail('researcher@nit.ac.in');
    assert.strictEqual(res2.valid, true);

    const res3 = validateCollegeEmail('roll123@sub.college.edu');
    assert.strictEqual(res3.valid, true);
  });

  test('validateCollegeEmail rejects non-college public domains', () => {
    const res1 = validateCollegeEmail('scammer@gmail.com');
    assert.strictEqual(res1.valid, false);
    assert.ok(res1.message.includes('not in the allowed campus domain list'));

    const res2 = validateCollegeEmail('bot@yahoo.com');
    assert.strictEqual(res2.valid, false);

    const res3 = validateCollegeEmail('invalid-email-string');
    assert.strictEqual(res3.valid, false);
  });

  test('JWT generation and signature verification works', () => {
    const mockUser = {
      _id: '64d8a1b2c3d4e5f6a7b8c9d0',
      email: 'test@college.edu',
      role: 'BUYER'
    };

    const token = generateToken(mockUser);
    assert.ok(token);

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, mockUser._id);
    assert.strictEqual(decoded.email, mockUser.email);
    assert.strictEqual(decoded.role, mockUser.role);
  });

  test('Role-based middleware requireRole permits authorized role and rejects unauthorized', (t, done) => {
    const middleware = requireRole(['ADMIN']);

    // Unauthorized buyer
    const reqBuyer = { user: { role: 'BUYER' } };
    let statusSent = 0;
    let jsonSent = null;
    const resBuyer = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };

    middleware(reqBuyer, resBuyer, () => {});
    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.code, 'FORBIDDEN');

    // Authorized admin
    const reqAdmin = { user: { role: 'ADMIN' } };
    let nextCalled = false;
    middleware(reqAdmin, {}, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    done();
  });

  test('POST /api/auth/register rejects role escalation to ADMIN', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@college.edu',
        password: 'Password@123',
        college: 'National Institute of Technology',
        role: 'ADMIN'
      })
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ROLE_ESCALATION_BLOCKED');
  });

  test('POST /api/auth/register rejects missing mandatory fields', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Incomplete User'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MISSING_FIELDS');
  });

  test('POST /api/auth/register rejects non-college email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Public User',
        email: 'random@gmail.com',
        password: 'Password@123',
        college: 'National Institute of Technology'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'INVALID_COLLEGE_EMAIL');
  });

  test('GET /api/auth/me rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'UNAUTHORIZED');
  });
});
