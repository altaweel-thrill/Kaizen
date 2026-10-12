// Run manually after deployment. Creates and removes only its own synthetic test lead.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const cliBase = '/opt/homebrew/lib/node_modules/firebase-tools/lib/';
const auth = require(cliBase + 'auth.js');
const { Client } = require(cliBase + 'apiv2.js');
const project = 'kaizen-44bef';
const requestId = randomUUID();
const payload = {
  requestId, fullName: 'KAIZEN INTEGRATION TEST ' + requestId,
  whatsappMobile: '+966500000000', source: 'Kaizen Fitness Website',
  primaryFocus: 'Muscle Architecture & V-Taper Frame',
  preferredTrainingWindow: 'Mid-Morning (9:00 AM – 12:00 PM)',
  healthReadiness: 'No', healthDetails: 'None', submittedAt: new Date().toISOString(),
};
const endpoint = 'https://europe-west1-kaizen-44bef.cloudfunctions.net/submitAssessment';
const docPath = `/projects/${project}/databases/(default)/documents/assessmentLeads/${requestId}`;
const client = new Client({ urlPrefix: 'https://firestore.googleapis.com', apiVersion: 'v1' });
async function submit(body, origin = 'https://altaweel-thrill.github.io') {
  return fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
  });
}
async function main() {
  const options = { project };
  auth.setActiveAccount(options, auth.getGlobalDefaultAccount());
  await require(cliBase + 'requireAuth.js').requireAuth(options);
  let saved = false;
  try {
    const first = await submit(payload);
    assert.equal(first.status, 200, 'First submission failed: ' + await first.clone().text());
    assert.equal((await first.json()).requestId, requestId);
    saved = true;
    const original = (await client.get(docPath)).body;
    assert.equal(original.fields.fullName.stringValue, payload.fullName);
    assert.equal(original.fields.status.stringValue, 'new');
    assert.ok(original.fields.createdAt.timestampValue);
    assert.equal((await submit(payload)).status, 200);
    const afterRetry = (await client.get(docPath)).body;
    assert.equal(afterRetry.updateTime, original.updateTime, 'Retry changed the stored record.');
    assert.equal((await submit({ ...payload, fullName: 'Changed test' })).status, 409);
    assert.equal((await submit({ ...payload, whatsappMobile: 'invalid' })).status, 400);
    assert.equal((await submit(payload, 'https://unapproved.example')).status, 403);
    const publicRead = await fetch('https://firestore.googleapis.com/v1' + docPath);
    assert.equal(publicRead.status, 403, 'Public Firestore reads must remain blocked.');
    console.log('PASS: saved in Firestore, retry unchanged, conflicting/invalid requests rejected, public reads denied.');
  } finally {
    if (saved) {
      const current = (await client.get(docPath)).body;
      if (current.fields.fullName.stringValue === payload.fullName) {
        await client.delete(docPath);
        console.log('Removed the synthetic test lead: ' + requestId);
      }
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
