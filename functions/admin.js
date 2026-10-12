const STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'archived'];
const validId = id => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id);

function createAdminHandler({ db, verifyIdToken, adminEmails, allowedOrigins, serverTimestamp }) {
  return async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const origin = req.get('Origin');
    if (!origin || !allowedOrigins().includes(origin)) return res.status(403).json({ ok: false });
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ ok: false });
    const bearer = /^Bearer (.+)$/.exec(req.get('Authorization') || '');
    if (!bearer) return res.status(401).json({ ok: false, code: 'sign-in-required' });
    let user;
    try { user = await verifyIdToken(bearer[1]); }
    catch { return res.status(401).json({ ok: false, code: 'invalid-session' }); }
    const email = (user.email || '').toLowerCase();
    if (!adminEmails().includes(email)) return res.status(403).json({ ok: false, code: 'access-denied' });
    if (user.email_verified !== true) return res.status(403).json({ ok: false, code: 'verify-email' });
    const collection = db.collection('assessmentLeads');
    try {
      if (req.method === 'PATCH') {
        const { id, status } = req.body || {};
        if (!validId(id) || !STATUSES.includes(status)) return res.status(400).json({ ok: false });
        const ref = collection.doc(id);
        if (!(await ref.get()).exists) return res.status(404).json({ ok: false });
        await ref.update({ status, updatedAt: serverTimestamp(), updatedBy: email });
        return res.status(200).json({ ok: true });
      }
      let query = collection.orderBy('createdAt', 'desc').limit(51);
      if (req.query.cursor) {
        if (!validId(req.query.cursor)) return res.status(400).json({ ok: false });
        const cursor = await collection.doc(req.query.cursor).get();
        if (!cursor.exists) return res.status(400).json({ ok: false });
        query = query.startAfter(cursor);
      }
      const [snapshot, total, ...counts] = await Promise.all([
        query.get(), collection.count().get(),
        ...STATUSES.map(status => collection.where('status', '==', status).count().get()),
      ]);
      const records = snapshot.docs.slice(0, 50);
      const date = value => value?.toDate?.().toISOString() || null;
      const leads = records.map(doc => {
        const lead = doc.data();
        return { id: doc.id, fullName: lead.fullName || '', whatsappMobile: lead.whatsappMobile || '',
          primaryFocus: lead.primaryFocus || '', preferredTrainingWindow: lead.preferredTrainingWindow || '',
          healthReadiness: lead.healthReadiness || '', healthDetails: lead.healthDetails || '',
          status: lead.status || 'new', createdAt: date(lead.createdAt), updatedAt: date(lead.updatedAt) };
      });
      const stats = { total: total.data().count };
      STATUSES.forEach((status, index) => { stats[status] = counts[index].data().count; });
      return res.status(200).json({ ok: true, user: { email }, leads, stats,
        nextCursor: snapshot.docs.length > 50 ? records[records.length - 1].id : null });
    } catch {
      return res.status(503).json({ ok: false, code: 'service-unavailable' });
    }
  };
}
module.exports = { createAdminHandler, STATUSES };
