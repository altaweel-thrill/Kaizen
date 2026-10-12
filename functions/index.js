const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const { createHash } = require('node:crypto');
const { validateLead } = require('./lead');
const { getAuth } = require('firebase-admin/auth');
const { createAdminHandler } = require('./admin');

initializeApp();
const db = getFirestore();
const values = key => (process.env[key] || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
exports.adminAssessments = onRequest({ region: 'europe-west1', maxInstances: 3, timeoutSeconds: 30 },
  createAdminHandler({ db, verifyIdToken: token => getAuth().verifyIdToken(token, true),
    adminEmails: () => values('ADMIN_EMAILS'), allowedOrigins: () => values('ALLOWED_ORIGINS'),
    serverTimestamp: () => FieldValue.serverTimestamp() }));
exports.submitAssessment = onRequest({ region: 'europe-west1', maxInstances: 3, timeoutSeconds: 30 }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  const origin = req.get('Origin');
  if (!origin || !origins.includes(origin)) return res.status(403).json({ ok: false });
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (Number(req.get('Content-Length') || 0) > 8192) return res.status(413).json({ ok: false });
  let lead;
  try { lead = validateLead(req.body); }
  catch { return res.status(400).json({ ok: false, message: 'Please review the form fields.' }); }
  const requestId = req.body.requestId;
  const fingerprint = createHash('sha256').update(JSON.stringify(lead)).digest('hex');
  const ref = db.collection('assessmentLeads').doc(requestId);
  const now = Date.now();
  const bucket = createHash('sha256').update(`${process.env.GCLOUD_PROJECT}:${req.ip}:${Math.floor(now / 3600000)}`).digest('hex');
  const rateRef = db.collection('assessmentRateLimits').doc(bucket);
  try {
    await db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) {
        if (existing.data().fingerprint !== fingerprint) throw new Error('CONFLICT');
        return;
      }
      const rate = await tx.get(rateRef);
      const count = rate.exists ? rate.data().count : 0;
      if (count >= 10) throw new Error('RATE_LIMIT');
      tx.set(rateRef, { count: count + 1, expiresAt: Timestamp.fromMillis(now + 86400000) });
      tx.create(ref, { ...lead, fingerprint, createdAt: FieldValue.serverTimestamp(), status: 'new' });
    });
    return res.status(200).json({ ok: true, requestId });
  } catch (error) {
    const code = error.message === 'RATE_LIMIT' ? 429 : error.message === 'CONFLICT' ? 409 : 503;
    return res.status(code).json({ ok: false, message: 'Unable to save this request. Please try again.' });
  }
});
