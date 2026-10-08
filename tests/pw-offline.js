/* Offline check: load the app with the service worker, go offline, reload, visit key pages. Same setup as pw-routes.js.
   NODE_PATH=<pw>/node_modules node tests/pw-offline.js   (needs python -m http.server 8001; the API is not needed offline) */
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_day', new Date().toDateString()) });
  const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 90)));
  await page.goto('http://localhost:8001/index.html?nointro=1#home'); await page.waitForTimeout(2500);
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000); /* the shell is cached in the background */
  let bad = 0; const say = (ok, m) => { console.log((ok ? 'ok   ' : 'FAIL ') + m); if (!ok) bad++ };
  say(await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller)), 'service worker controls the page');
  await ctx.setOffline(true); await page.reload(); await page.waitForTimeout(2500);
  say(await page.evaluate(() => document.querySelectorAll('.door').length >= 5), 'Home renders offline');
  for (const r of ['media', 'm-g3', 'quizzes', 'quiz-nayrouz', 'games', 'g-memory', 'calendar', 'verse', 'coloring', 'bible']) {
    await page.evaluate(h => { location.hash = '#' + h }, r); await page.waitForTimeout(700);
    say(await page.evaluate(() => (document.getElementById('app').innerText || '').trim().length > 20), r + ' shows content offline');
  }
  say(errs.length === 0, 'no page errors offline' + (errs.length ? ': ' + errs[0] : ''));
  await browser.close(); console.log(bad ? bad + ' problems' : 'OFFLINE OK'); process.exit(bad ? 1 : 0);
})();
