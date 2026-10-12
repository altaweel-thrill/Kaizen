// Browser checks use isolated synthetic auth/API fixtures, never real customer data.
const { chromium } = require('/Users/ahmadaltaweel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const output = process.env.KAIZEN_QA_OUTPUT || '/private/tmp/kaizen-admin-qa';
const leads = [{ id: '3dc1bfd8-aa48-41dc-8975-36c19bbf44f4', fullName: 'عميل تجريبي', whatsappMobile: '+966500000000',
  primaryFocus: 'Muscle Architecture & V-Taper Frame', preferredTrainingWindow: 'Mid-Morning (9:00 AM – 12:00 PM)',
  healthReadiness: 'Yes', healthDetails: 'تفاصيل تجريبية للتحقق من تخطيط العرض فقط.', status: 'new', createdAt: '2026-10-12T06:46:57Z' }];
const fakeAuth = `let listener;
const auth={currentUser:null};
export const browserSessionPersistence={};
export const getAuth=()=>auth;
export const setPersistence=async()=>{};
export function onAuthStateChanged(_,callback){listener=callback;queueMicrotask(()=>callback(null));}
export async function signInWithEmailAndPassword(){auth.currentUser={uid:'fixture',email:'altaweel@thrillagency.net',emailVerified:true,getIdToken:async()=>'fixture-token'};listener(auth.currentUser);return{user:auth.currentUser};}
export const createUserWithEmailAndPassword=signInWithEmailAndPassword;
export const sendEmailVerification=async()=>{};
export const sendPasswordResetEmail=async()=>{};
export async function signOut(){auth.currentUser=null;listener(null);}`;
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext();
    await context.route('https://www.gstatic.com/firebasejs/**/firebase-app.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export const initializeApp=()=>({});' }));
    await context.route('https://www.gstatic.com/firebasejs/**/firebase-auth.js', route => route.fulfill({ contentType: 'text/javascript', body: fakeAuth }));
    await context.route('**/adminAssessments*', async route => {
      if (route.request().method() === 'PATCH') { leads[0].status = route.request().postDataJSON().status; return route.fulfill({ json: { ok: true } }); }
      return route.fulfill({ json: { ok: true, leads, nextCursor: null, stats: { total: 1, new: leads[0].status === 'new' ? 1 : 0, contacted: 0, scheduled: leads[0].status === 'scheduled' ? 1 : 0 } } });
    });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://localhost:8766/admin/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(output, 'login-desktop.png'), fullPage: true });
    await page.locator('#email').fill('altaweel@thrillagency.net');
    await page.locator('#password').fill('fixture-password');
    await page.locator('#login-button').click();
    await page.locator('#request-rows tr').waitFor();
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}`);
      await page.screenshot({ path: path.join(output, `dashboard-${width}.png`), fullPage: true });
    }
    await page.locator('#search').fill('غير موجود');
    await page.locator('#empty-state').waitFor({ state: 'visible' });
    await page.locator('#search').fill('');
    await page.locator('.row-button').click();
    await page.locator('#detail-modal').waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(output, 'detail-mobile.png'), fullPage: true });
    assert.match(await page.locator('#detail-fields').innerText(), /تفاصيل تجريبية/);
    await page.locator('#detail-status').selectOption('scheduled');
    await page.locator('#save-status').click();
    await page.locator('#detail-notice').filter({ hasText: 'حُفظت الحالة بنجاح' }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#stat-scheduled').innerText(), '1');
    await page.locator('#status-filter').selectOption('new');
    await page.locator('#empty-state').waitFor({ state: 'visible' });
    await page.locator('#logout-button').click();
    await page.locator('#login-view').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#request-rows tr').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: login, search, status filtering, details, status update, logout, and responsive layouts at 375/768/1024/1440px.');
    console.log('Screenshots: ' + output);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
