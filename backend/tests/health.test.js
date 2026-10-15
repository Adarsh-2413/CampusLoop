import { test, describe } from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import http from 'node:http';

describe('Phase 2 — Backend Health & Error Handling Tests', () => {
  let server;
  let baseUrl;

  test.before((t, done) => {
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

  test('GET /api/health returns 200 and healthy JSON contract', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.message.includes('healthy'));
    assert.ok(body.data);
    assert.strictEqual(typeof body.data.uptimeSeconds, 'number');
    assert.ok(['DISCONNECTED', 'CONNECTED', 'CONNECTING'].includes(body.data.database));
  });

  test('GET /api/nonexistent-route returns 404 with standard error JSON', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route`);
    assert.strictEqual(res.status, 404);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ROUTE_NOT_FOUND');
    assert.ok(body.error.includes('ROUTE_NOT_FOUND') || body.error.includes('Endpoint not found'));
  });

  test('POST with invalid JSON returns 400 Bad Request with MALFORMED_JSON code', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ this is invalid json :::'
    });
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'MALFORMED_JSON');
  });
});
