const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { validateLead } = require('../functions/lead');
const payload = {
  requestId: '4b0c051f-6299-48fd-b1d5-53f0ecb455a1',
  fullName: 'Test Client', whatsappMobile: '+966500000000',
  primaryFocus: 'Muscle Architecture & V-Taper Frame',
  preferredTrainingWindow: 'Mid-Morning (9:00 AM – 12:00 PM)',
  healthReadiness: 'No', healthDetails: 'discard',
};
function backend() {
  const records = new Map();
  const db = {
    collection: name => ({ doc: id => ({ key: name + '/' + id }) }),
    runTransaction: async fn => {
      const writes = [];
      await fn({
        get: async ref => ({ exists: records.has(ref.key), data: () => records.get(ref.key) }),
        create: (ref, data) => writes.push(() => records.set(ref.key, data)),
        set: (ref, data) => writes.push(() => records.set(ref.key, data)),
      });
      writes.forEach(write => write());
    },
  };
  const stubs = {
    'firebase-admin/app': { initializeApp() {} },
    'firebase-admin/firestore': { getFirestore: () => db,
      FieldValue: { serverTimestamp: () => 'server-time' }, Timestamp: { fromMillis: ms => ms } },
    'firebase-functions/v2/https': { onRequest: (_, handler) => handler },
    './lead': { validateLead },
    './admin': require('../functions/admin'),
    'firebase-admin/auth': { getAuth: () => ({ verifyIdToken: async () => ({}) }) },
  };
  const handlers = {};
  vm.runInNewContext(fs.readFileSync(require.resolve('../functions/index'), 'utf8'), {
    exports: handlers, Date, process: { env: { ALLOWED_ORIGINS: 'https://example.com', GCLOUD_PROJECT: 'test' } },
    require: name => stubs[name] || require(name),
  });
  async function submit(body = payload, origin = 'https://example.com') {
    const res = { code: 200, set() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, send() {} };
    await handlers.submitAssessment({ method: 'POST', body, ip: '127.0.0.1', get: key => key === 'Origin' ? origin : '' }, res);
    return res;
  }
  return { submit, records, handlers };
}
test('validates fields server-side and discards health details for No', () => {
  assert.equal(validateLead(payload).healthDetails, 'None');
  for (const fields of [{ whatsappMobile: '+15551234567' }, { primaryFocus: 'unknown' }, { healthReadiness: 'Yes', healthDetails: '' }]) {
    assert.throws(() => validateLead({ ...payload, ...fields }));
  }
});
test('saves once, acknowledges retries and rejects changed payloads and other origins', async () => {
  const b = backend();
  assert.equal((await b.submit()).body.ok, true);
  assert.equal((await b.submit()).body.ok, true);
  assert.equal([...b.records.keys()].filter(key => key.startsWith('assessmentLeads/')).length, 1);
  assert.equal((await b.submit({ ...payload, fullName: 'Changed Client' })).code, 409);
  assert.equal((await b.submit(payload, 'https://other.com')).code, 403);
});
test('stores without email and limits new submissions', async () => {
  const b = backend();
  await b.submit();
  assert.equal(b.records.get('assessmentLeads/' + payload.requestId).status, 'new');
  assert.equal(b.handlers.emailAssessment, undefined);
  for (let n = 0; n < 9; n++) {
    assert.equal((await b.submit({ ...payload, requestId: '4b0c051f-6299-48fd-b1d5-' + String(n).padStart(12, '0') })).code, 200);
  }
  assert.equal((await b.submit({ ...payload, requestId: '4b0c051f-6299-48fd-b1d5-999999999999' })).code, 429);
});
