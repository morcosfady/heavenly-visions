/* Scroll smoothness with the CPU slowed 4x (a cheap Android phone). Measures frame times while scrolling the heaviest pages.
   NODE_PATH=<pw>/node_modules node tests/pw-fps.js */
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:8001/index.html?api=http://localhost:8788&nointro=1&ai=http://localhost:8789';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const seed = await (await fetch('http://localhost:8788/')).json();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  await ctx.addInitScript(([a]) => { localStorage.setItem('hv_acct', JSON.stringify(a)); localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_day', new Date().toDateString()); localStorage.setItem('hv_lumi_tapped', '1') }, [{ user: seed.k3_1.user, token: seed.k3_1.token }]);
  const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bad = 0;
  for (const r of ['home', 'media', 'm-g3', 'bible', 'calendar', 'games']) {
    await page.goto(BASE + '#' + r); await page.waitForTimeout(2500);
    const res = await page.evaluate(async () => {
      const max = document.documentElement.scrollHeight - innerHeight; if (max < 200) return null;
      const times = []; let last = performance.now(), y = 0, dir = 1;
      await new Promise(done => { (function f(t) { times.push(t - last); last = t; y += 14 * dir; if (y >= max) dir = -1; if (y <= 0) dir = 1; scrollTo(0, y); if (times.length < 120) requestAnimationFrame(f); else done() })(performance.now()) });
      times.shift(); const s = times.slice().sort((a, b) => a - b); const avg = times.reduce((a, b) => a + b, 0) / times.length;
      return { fps: Math.round(1000 / avg), p95: Math.round(s[Math.floor(s.length * .95)]), worst: Math.round(s[s.length - 1]) } });
    if (!res) { console.log(r + ': page too short to scroll'); continue }
    const ok = res.fps >= 45 && res.p95 <= 34; if (!ok) bad++; console.log((ok ? 'ok   ' : 'SLOW ') + r + ': ' + res.fps + ' fps, 95th percentile ' + res.p95 + ' ms, worst ' + res.worst + ' ms');
  }
  await browser.close(); console.log(bad ? bad + ' slow pages' : 'SMOOTH'); process.exit(bad ? 1 : 0);
})();
