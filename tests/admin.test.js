const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdminHandler } = require('../functions/admin');
const id = '3dc1bfd8-aa48-41dc-8975-36c19bbf44f4';
function fixture() {
  const stored = { fullName: 'Test Client', whatsappMobile: '+966500000000', primaryFocus: 'Focus',
    preferredTrainingWindow: 'Morning', healthReadiness: 'No', healthDetails: 'None', status: 'new',
    fingerprint: 'must-not-be-exposed', createdAt: { toDate: () => new Date('2026-10-12T06:00:00Z') } };
  const ref = { get: async () => ({ exists: true, id, data: () => stored }), update: async fields => Object.assign(stored, fields) };
  const doc = { id, data: () => stored };
  const collection = { doc: () => ref,
    orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [doc] }), startAfter() { return this; } }) }),
    count: () => ({ get: async () => ({ data: () => ({ count: 1 }) }) }),
    where: (_, __, status) => ({ count: () => ({ get: async () => ({ data: () => ({ count: stored.status === status ? 1 : 0 }) }) }) }),
  };
  const db = { collection: () => collection };
  const handler = createAdminHandler({ db, allowedOrigins: () => ['http://localhost:8765'],
    adminEmails: () => ['admin@example.com'], serverTimestamp: () => 'server-time',
    verifyIdToken: async token => {
      if (token === 'revoked') throw new Error('revoked');
      return { email: token === 'other' ? 'other@example.com' : 'admin@example.com', email_verified: token !== 'unverified' };
    } });
  async function request({ method = 'GET', token = 'good', body, origin = 'http://localhost:8765', query = {} } = {}) {
    const res = { code: 200, headers: {}, set(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.body = data; }, send() {} };
    await handler({ method, body, query, get: key => ({ Origin: origin, Authorization: token ? 'Bearer ' + token : '' })[key] }, res);
    return res;
  }
  return { request, stored };
}
test('refuses missing, revoked, non-manager and unverified credentials', async () => {
  const f = fixture();
  for (const [token, code] of [[null, 401], ['revoked', 401], ['other', 403], ['unverified', 403]]) {
    const response = await f.request({ token }); assert.equal(response.code, code); assert.equal(response.body.leads, undefined);
  }
  assert.equal((await f.request({ origin: 'https://untrusted.example' })).code, 403);
});
test('allows authenticated reads without exposing internal fingerprints', async () => {
  const response = await fixture().request();
  assert.equal(response.code, 200);
  assert.equal(response.body.leads[0].fullName, 'Test Client');
  assert.equal(response.body.leads[0].createdAt, '2026-10-12T06:00:00.000Z');
  assert.equal(response.body.leads[0].fingerprint, undefined);
  assert.equal(response.body.stats.new, 1);
  assert.equal(response.body.nextCursor, null);
});
test('only accepts known statuses and updates status with an audit timestamp', async () => {
  const f = fixture();
  assert.equal((await f.request({ method: 'PATCH', body: { id, status: 'delete' } })).code, 400);
  const result = await f.request({ method: 'PATCH', body: { id, status: 'scheduled', fullName: 'Injected' } });
  assert.equal(result.code, 200); assert.equal(f.stored.status, 'scheduled');
  assert.equal(f.stored.fullName, 'Test Client'); assert.equal(f.stored.updatedBy, 'admin@example.com');
  assert.equal(f.stored.updatedAt, 'server-time');
  assert.equal((await f.request()).body.stats.scheduled, 1);
});
test('permits CORS preflight without credentials but rejects arbitrary cursors and methods', async () => {
  const f = fixture();
  assert.equal((await f.request({ method: 'OPTIONS', token: null })).code, 204);
  assert.equal((await f.request({ method: 'DELETE' })).code, 405);
  assert.equal((await f.request({ query: { cursor: '../other' } })).code, 400);
});
