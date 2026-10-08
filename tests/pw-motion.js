/* Playwright check of the motion system: page transitions (tab, forward, back), the shared element, quiz feedback, result stars,
   the match-game flip, and that nothing animates with reduced motion. Same setup as tests/pw-routes.js.
   NODE_PATH=<pw>/node_modules node tests/pw-motion.js [videoDir] */
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:8001/index.html?api=http://localhost:8788&nointro=1&ai=http://localhost:8789';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const seed = await (await fetch('http://localhost:8788/')).json(), day = new Date().toDateString(), vdir = process.argv[2];
  let bad = 0; const say = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) bad++ };
  for (const reduce of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduce ? 'reduce' : 'no-preference', serviceWorkers: 'block', ...(vdir && !reduce ? { recordVideo: { dir: vdir, size: { width: 390, height: 844 } } } : {}) });
    await ctx.addInitScript(([a, day]) => { localStorage.setItem('hv_acct', JSON.stringify(a)); localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_day', day); localStorage.setItem('hv_lumi_tapped', '1'); window.__vt = []; const o = document.startViewTransition; if (o) document.startViewTransition = function (f) { window.__vt.push(document.documentElement.dataset.vt || ''); return o.call(document, f) } }, [{ user: seed.k3_1.user, token: seed.k3_1.token }, day]);
    const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto(BASE + '#home'); await page.waitForTimeout(2200);
    await page.click('#tabbar [data-tab="learn"]'); await page.waitForTimeout(900);
    await page.click('#grades .tile >> nth=2'); await page.waitForTimeout(900);
    await page.click('.hvbar .back'); await page.waitForTimeout(900);
    const vt = await page.evaluate(() => window.__vt);
    if (reduce) say(vt.length === 0, 'reduced motion: no page transitions (' + vt.length + ')');
    else say(vt.includes('tab') && vt.includes('fwd') && vt.includes('back'), 'transitions used: ' + vt.join(','));
    /* quiz */
    await page.evaluate(() => { location.hash = '#quiz-nayrouz' }); await page.waitForTimeout(900);
    const hasAB = await page.evaluate(() => document.querySelectorAll('.opt .ab').length); say(hasAB >= 3, 'answer badges: ' + hasAB);
    for (let i = 0; i < 5; i++) {
      await page.click('.opt >> nth=0'); await page.waitForTimeout(150);
      if (i === 0) { const st = await page.evaluate(() => ({ right: !!document.querySelector('.opt.right'), wrong: !!document.querySelector('.opt.wrong') })); say(st.right, 'right answer marked (wrong marked: ' + st.wrong + ')') }
      await page.waitForTimeout(1350);
    }
    await page.waitForTimeout(1500);
    const end = await page.evaluate(() => ({ stars: document.querySelectorAll('.stq').length, score: (document.getElementById('qsc') || {}).textContent })); say(end.stars === 3 && /\d \/ 5/.test(end.score || ''), 'result stars ' + end.stars + ', score "' + end.score + '"');
    /* match game */
    await page.evaluate(() => { location.hash = '#g-memory' }); await page.waitForTimeout(900);
    await page.click('.mc >> nth=0'); await page.waitForTimeout(200);
    const flip = await page.evaluate(() => { const f = document.querySelector('.mc.open .f'); return f ? getComputedStyle(f).animationName : 'none' }); say(reduce ? flip === 'none' : flip === 'hvflip', 'card flip animation: ' + flip);
    say(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
    await ctx.close();
  }
  await browser.close(); console.log(bad ? bad + ' problems' : 'MOTION OK'); process.exit(bad ? 1 : 0);
})();
