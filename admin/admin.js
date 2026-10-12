import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, browserSessionPersistence, setPersistence, onAuthStateChanged,
  signInWithEmailAndPassword, sendEmailVerification,
  sendPasswordResetEmail, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';

const app = initializeApp({
  apiKey: 'AIzaSyDmXe4ccoVpxacUS3wqbCO0xs_cllx-dFA', authDomain: 'kaizen-44bef.firebaseapp.com',
  projectId: 'kaizen-44bef', appId: '1:149846076478:web:77af83ec0a3d6d5ae0f56f',
});
const auth = getAuth(app);
if (['kaizen-44bef.web.app', 'kaizen-44bef.firebaseapp.com'].includes(location.hostname)) {
  document.querySelectorAll('[data-site-link]').forEach(link => { link.href = 'https://kaizenfit.sa/'; });
}
auth.languageCode = 'ar';
const managerEmail = 'altaweel@thrillagency.net';
const endpoint = 'https://europe-west1-kaizen-44bef.cloudfunctions.net/adminAssessments';
const labels = { new: 'جديد', contacted: 'تم التواصل', scheduled: 'تم تحديد موعد', completed: 'مكتمل', archived: 'مؤرشف' };
const focusLabels = {
  'Muscle Architecture & V-Taper Frame': 'البناء العضلي وهندسة القوام',
  'Fat Loss & Body Recomposition': 'إعادة تشكيل الجسم وخفض الدهون',
  'Executive Strength, Posture & Longevity': 'القوة والوضعية والصحة طويلة المدى',
};
const windowLabels = {
  'Early Morning (6:00 AM – 9:00 AM) — Executive Peak Slot': 'صباحًا · 6:00 – 9:00',
  'Mid-Morning (9:00 AM – 12:00 PM)': 'منتصف الصباح · 9:00 – 12:00',
  'Afternoon & Evening (2:00 PM – 9:00 PM) — Prime Window': 'بعد الظهر والمساء · 2:00 – 9:00',
};
const $ = id => document.getElementById(id);
const state = { leads: [], cursor: null, selected: null, loading: false, timer: null };
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function notice(id, text, type = '') {
  $(id).textContent = text;
  $(id).classList.toggle('error', type === 'error');
  $(id).classList.toggle('success', type === 'success');
}
function show(view) {
  for (const id of ['login-view', 'verification-view', 'dashboard-view']) $(id).hidden = id !== view;
}
function dateLabel(value) {
  if (!value || Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', calendar: 'gregory', timeZone: 'Asia/Riyadh' }).format(new Date(value));
}
function errorLabel(error) {
  const errors = {
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة.',
    'auth/wrong-password': 'البريد أو كلمة المرور غير صحيحة.',
    'auth/user-not-found': 'البريد أو كلمة المرور غير صحيحة.',
    'auth/email-already-in-use': 'الحساب موجود بالفعل. سجّل الدخول أو استعد كلمة المرور.',
    'auth/weak-password': 'استخدم كلمة مرور قوية من 10 أحرف على الأقل.',
    'auth/too-many-requests': 'محاولات كثيرة. انتظر قليلًا ثم جرّب مرة أخرى.',
    'auth/network-request-failed': 'تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.',
    'access-denied': 'هذا الحساب غير مخوّل للوصول إلى لوحة الإدارة.',
    'verify-email': 'يجب تأكيد بريد حساب المدير أولًا.',
    'invalid-session': 'انتهت الجلسة. سجّل الدخول مرة أخرى.',
    'sign-in-required': 'سجّل الدخول للوصول إلى الطلبات.',
  };
  return errors[error.code] || 'تعذر إكمال العملية. حاول مرة أخرى.';
}
async function api(method = 'GET', body, cursor) {
  const user = auth.currentUser;
  if (!user) throw Object.assign(new Error(), { code: 'sign-in-required' });
  const token = await user.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const url = cursor ? `${endpoint}?cursor=${encodeURIComponent(cursor)}` : endpoint;
    const response = await fetch(url, { method, signal: controller.signal,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw Object.assign(new Error(), { code: result.code || 'service-unavailable' });
    return result;
  } finally { clearTimeout(timeout); }
}
function render() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const status = $('status-filter').value;
  const leads = state.leads.filter(lead => (status === 'all' || lead.status === status)
    && (!query || `${lead.fullName} ${lead.whatsappMobile} ${focusLabels[lead.primaryFocus] || lead.primaryFocus}`.toLocaleLowerCase().includes(query)));
  const rows = document.createDocumentFragment();
  for (const lead of leads) {
    const row = node('tr');
    const client = node('td', 'client-cell'); client.dataset.label = 'العميل';
    client.append(node('span', 'client-name', lead.fullName));
    const phone = node('span', 'client-phone', lead.whatsappMobile); phone.dir = 'ltr'; client.append(phone);
    const focus = node('td', 'focus-cell'); focus.dataset.label = 'هدف التقييم';
    focus.append(node('span', '', focusLabels[lead.primaryFocus] || lead.primaryFocus));
    const date = node('td', 'date-cell', dateLabel(lead.createdAt)); date.dataset.label = 'تاريخ الطلب';
    const statusCell = node('td'); statusCell.dataset.label = 'الحالة';
    statusCell.append(node('span', `badge badge-${Object.hasOwn(labels, lead.status) ? lead.status : 'new'}`, labels[lead.status] || lead.status));
    const action = node('td'); action.dataset.label = 'التفاصيل';
    const button = node('button', 'row-button', 'عرض الطلب'); button.type = 'button';
    button.setAttribute('aria-label', `عرض طلب ${lead.fullName}`);
    button.addEventListener('click', () => openDetails(lead)); action.append(button);
    row.append(client, focus, date, statusCell, action); rows.append(row);
  }
  $('request-rows').replaceChildren(rows);
  $('empty-state').hidden = !!leads.length || state.loading;
  $('result-count').textContent = `${leads.length} طلب معروض · ${state.leads.length} طلب محمّل`;
  $('load-more').hidden = !state.cursor;
}
async function load(more = false) {
  if (state.loading || !auth.currentUser?.emailVerified) return;
  const uid = auth.currentUser.uid;
  state.loading = true;
  $('refresh-button').disabled = true; $('load-more').disabled = true;
  notice('dashboard-status', more ? 'جارٍ تحميل المزيد…' : 'جارٍ تحديث الطلبات…');
  try {
    const result = await api('GET', undefined, more ? state.cursor : null);
    if (auth.currentUser?.uid !== uid) return;
    state.leads = more ? [...state.leads, ...result.leads.filter(lead => !state.leads.some(existing => existing.id === lead.id))] : result.leads;
    state.cursor = result.nextCursor;
    for (const status of ['total', 'new', 'contacted', 'scheduled']) $(`stat-${status}`).textContent = result.stats[status] ?? 0;
    $('nav-count').textContent = result.stats.new ?? 0;
    $('last-updated').textContent = `آخر تحديث ${new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Riyadh' }).format(new Date())}`;
    notice('dashboard-status', '');
  } catch (error) {
    if (auth.currentUser?.uid !== uid) return;
    notice('dashboard-status', errorLabel(error), 'error');
    if (['access-denied', 'invalid-session', 'sign-in-required'].includes(error.code)) {
      await signOut(auth); notice('login-status', errorLabel(error), 'error');
    }
  } finally {
    state.loading = false; $('refresh-button').disabled = false; $('load-more').disabled = false;
    render();
  }
}
function openDetails(lead) {
  state.selected = lead.id;
  $('detail-title').textContent = lead.fullName;
  const fields = [
    ['رقم واتساب', lead.whatsappMobile], ['تاريخ الطلب', dateLabel(lead.createdAt)],
    ['الهدف الأساسي', focusLabels[lead.primaryFocus] || lead.primaryFocus],
    ['وقت التدريب المفضّل', windowLabels[lead.preferredTrainingWindow] || lead.preferredTrainingWindow],
    ['وجود إصابات أو حالات صحية', lead.healthReadiness === 'Yes' ? 'نعم' : 'لا'],
    ['الحالة الحالية', labels[lead.status] || lead.status],
    ['معلومات الاستعداد الصحي', lead.healthReadiness === 'Yes' ? lead.healthDetails : 'لا توجد حالات مذكورة'],
  ];
  const fragment = document.createDocumentFragment();
  fields.forEach(([label, value], index) => {
    const field = node('div', `detail-field${index === fields.length - 1 ? ' full' : ''}`);
    field.append(node('span', '', label)); const text = node('p', '', value);
    if (index === 0) text.dir = 'ltr'; field.append(text); fragment.append(field);
  });
  $('detail-fields').replaceChildren(fragment);
  $('detail-status').value = lead.status;
  const digits = lead.whatsappMobile.replace(/\D/g, '');
  $('detail-whatsapp').href = `https://wa.me/${digits}?text=${encodeURIComponent(`مرحبًا ${lead.fullName}، معك Kaizen Fitness بخصوص طلب التقييم الخاص.`)}`;
  notice('detail-notice', ''); $('detail-modal').showModal();
}
async function handleUser(user) {
  clearInterval(state.timer);
  if (!user) {
    state.leads = []; state.cursor = null; state.selected = null;
    $('request-rows').replaceChildren(); $('detail-fields').replaceChildren();
    if ($('detail-modal').open) $('detail-modal').close();
    $('user-email').textContent = ''; show('login-view'); return;
  }
  if (user.email?.toLowerCase() !== managerEmail) {
    await signOut(auth); notice('login-status', 'هذا الحساب غير مخوّل للوصول إلى لوحة الإدارة.', 'error'); return;
  }
  if (!user.emailVerified) {
    $('verify-email').textContent = user.email; show('verification-view'); return;
  }
  $('user-email').textContent = user.email; show('dashboard-view');
  await load();
  if (auth.currentUser?.uid === user.uid) state.timer = setInterval(() => { if (!document.hidden && !$('detail-modal').open) load(); }, 60000);
}
function credentials() {
  const email = $('email').value.trim(); const password = $('password').value;
  if (!$('login-form').reportValidity()) return null;
  return { email, password };
}
async function loginAction() {
  const values = credentials(); if (!values) return;
  $('login-button').disabled = true;
  notice('login-status', 'جارٍ التحقق من الحساب…');
  try {
    await signInWithEmailAndPassword(auth, values.email, values.password);
    $('password').value = '';
  } catch (error) {
    notice(auth.currentUser && !auth.currentUser.emailVerified ? 'verification-status' : 'login-status', errorLabel(error), 'error');
  } finally { $('login-button').disabled = false; }
}
$('login-form').addEventListener('submit', event => { event.preventDefault(); loginAction(); });
$('toggle-password').addEventListener('click', () => {
  const hidden = $('password').type === 'password'; $('password').type = hidden ? 'text' : 'password';
  $('toggle-password').textContent = hidden ? 'إخفاء' : 'إظهار';
  $('toggle-password').setAttribute('aria-label', hidden ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
});
$('reset-password').addEventListener('click', async () => {
  const email = $('email').value.trim();
  if (!email || !$('email').reportValidity()) return;
  $('reset-password').disabled = true;
  try { await sendPasswordResetEmail(auth, email); notice('login-status', 'إذا كان الحساب موجودًا، سيصل رابط استعادة كلمة المرور إلى بريدك.', 'success'); }
  catch (error) { notice('login-status', errorLabel(error), 'error'); }
  finally { $('reset-password').disabled = false; }
});
for (const id of ['logout-button', 'verification-logout']) $(id).addEventListener('click', () => signOut(auth).catch(error => notice('login-status', errorLabel(error), 'error')));
$('check-verification').addEventListener('click', async () => {
  $('check-verification').disabled = true;
  try {
    await auth.currentUser.reload(); await auth.currentUser.getIdToken(true);
    if (!auth.currentUser.emailVerified) notice('verification-status', 'لم يتم تأكيد البريد بعد. افتح رابط التأكيد ثم حاول مجددًا.');
    else await handleUser(auth.currentUser);
  } catch (error) { notice('verification-status', errorLabel(error), 'error'); }
  finally { $('check-verification').disabled = false; }
});
$('resend-verification').addEventListener('click', async () => {
  $('resend-verification').disabled = true;
  try { await sendEmailVerification(auth.currentUser); notice('verification-status', 'أُرسل رابط التأكيد إلى بريدك.', 'success'); }
  catch (error) { notice('verification-status', errorLabel(error), 'error'); }
  finally { setTimeout(() => { $('resend-verification').disabled = false; }, 60000); }
});
$('refresh-button').addEventListener('click', () => load());
$('load-more').addEventListener('click', () => load(true));
$('search').addEventListener('input', render); $('status-filter').addEventListener('change', render);
$('close-detail').addEventListener('click', () => $('detail-modal').close());
$('detail-modal').addEventListener('click', event => { if (event.target === $('detail-modal')) $('detail-modal').close(); });
$('status-form').addEventListener('submit', async event => {
  event.preventDefault(); if ($('save-status').disabled) return;
  const id = state.selected, status = $('detail-status').value;
  $('save-status').disabled = true; notice('detail-notice', 'جارٍ حفظ الحالة…');
  try {
    await api('PATCH', { id, status });
    const lead = state.leads.find(item => item.id === id); if (lead) lead.status = status;
    notice('detail-notice', 'حُفظت الحالة بنجاح.', 'success'); render(); await load();
  } catch (error) { notice('detail-notice', errorLabel(error), 'error'); }
  finally { $('save-status').disabled = false; }
});
try { await setPersistence(auth, browserSessionPersistence); onAuthStateChanged(auth, user => { handleUser(user).catch(error => notice('login-status', errorLabel(error), 'error')); }); }
catch (error) { notice('login-status', errorLabel(error), 'error'); }
