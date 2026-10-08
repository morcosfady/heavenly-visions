/* Playwright check of every route (uses the real Chrome, no browser download).
   Setup once: mkdir pw && cd pw && npm i playwright-core. Then, with the local server on 8001 and the fake backends on 8788 and 8789:
   NODE_PATH=<pw>/node_modules node tests/pw-routes.js [user] [widths comma list]
   Checks per route, width and motion setting: console errors, sideways scroll, controls smaller than 44 px, controls covered by the tab bar or Lumi button
   at the bottom of the page, emojis that are still emojis. Plus the overlay, Lumi button and intro checks. */
const { chromium } = require('playwright-core');
const U = process.argv[2] || 'k3_1', WIDTHS = (process.argv[3] || '360,390,768,1024,1366').split(',').map(Number);
const ROUTES = 'home,media,m-kg,m-g3,m-feasts,m-saints,attendance,attsheet,servants,quizzes,quiz-nayrouz,bible,b-Genesis,b-Genesis-1,games,g-memory,g-scramble,verse,calendar,bedtime,coloring,color-gallery,kids,me,profile,report,planner,announce,news,followup,library,events,login,lumi,lumi-cards,lumi-settings,builder,join,lumi-gold,lumi-report,lumi-alerts,g-trivia,g-wordsearch,g-storyorder,g-versequest,prayers,oldthing'.split(',');
const BASE = 'http://localhost:8001/index.html?api=http://localhost:8788&nointro=1&ai=http://localhost:8789';
const EMO = /\p{Extended_Pictographic}/u;
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const seed = await (await fetch('http://localhost:8788/')).json();
  const day = new Date().toDateString();
  const ctxFor = async (w, reduce, extra) => {
    if (U === 'none') extra = Object.assign({ noacct: 1, hv_welcomed: '1' }, extra || {});
    const c = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 800 }, reducedMotion: reduce ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
    await c.addInitScript(([acct, day, extra]) => { try { if (!(extra && extra.noacct)) localStorage.setItem('hv_acct', JSON.stringify(acct)); localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_seen', '1'); localStorage.setItem('hv_intro_day', day); localStorage.setItem('hv_notifs', '[]'); Object.entries(extra || {}).filter(([k]) => k !== 'noacct').forEach(([k, v]) => v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)) } catch (e) {} }, [{ user: (seed[U] || seed.k3_1).user, token: (seed[U] || seed.k3_1).token }, day, extra]);
    return c;
  };
  let bad = 0; const say = (...a) => { bad++; console.log(...a) };
  for (const reduce of [false, true]) for (const w of WIDTHS) {
    const ctx = await ctxFor(w, reduce), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 100))); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon/.test(m.text())) errs.push('console ' + m.text().slice(0, 100)) });
    await page.goto(BASE + '#home'); await page.waitForTimeout(1800);
    let n = 0;
    for (const r of ROUTES) {
      errs.length = 0;
      await page.evaluate(h => { location.hash = '#' + h }, r); await page.waitForTimeout(900);
      const res = await page.evaluate(async () => {
        const de = document.documentElement, out = { small: [], covered: [], emoji: [] };
        document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button]').forEach(el => { const b = el.getBoundingClientRect(); if (!b.width || !b.height || getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden]')) return; if (el.matches('input[type=checkbox],input[type=radio]') && el.closest('label') && el.closest('label').getBoundingClientRect().height >= 44) return; if ((b.width < 44 || b.height < 44) && !el.closest('.hve')) out.small.push((el.id || el.className || el.tagName).toString().slice(0, 24) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height)) });
        window.scrollTo(0, 1e6); await new Promise(r => setTimeout(r, 250));
        const H = de.scrollHeight;
        document.querySelectorAll('button,a[href],input,select,textarea').forEach(el => { const b = el.getBoundingClientRect(); if (b.width < 8 || b.bottom < 0 || b.top > innerHeight || el.closest('#tabbar,#lmfab,[hidden]') || b.bottom + scrollY < H - 150) return; const p = document.elementFromPoint(b.left + b.width / 2, Math.min(Math.max(b.top + b.height / 2, 1), innerHeight - 1)); if (p && !el.contains(p) && !p.contains(el) && !p.closest('label')) out.covered.push((el.textContent || el.id || '').trim().slice(0, 20) + ' <- ' + (p.id || p.className || p.tagName).toString().slice(0, 20)) });
        window.scrollTo(0, 0);
        const tw = document.createTreeWalker(document.getElementById('app'), NodeFilter.SHOW_TEXT); while (tw.nextNode()) { const t = tw.currentNode; if (/\p{Extended_Pictographic}/u.test(t.nodeValue) && !t.parentElement.closest('[data-keep],textarea,input,select,option,.avs,.lm-kb,.sb-av,.pf-av')) out.emoji.push(t.nodeValue.trim().slice(0, 20)) }
        out.hscroll = de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth + '>' + de.clientWidth : 0; out.hash = location.hash; return out });
      const p = []; if (res.hscroll) p.push('hscroll ' + res.hscroll); if (errs.length) p.push('ERR ' + errs.slice(0, 2).join(' | ')); if (res.covered.length) p.push('COVERED ' + res.covered.slice(0, 2).join('; ')); if (res.small.length) p.push('SMALL ' + res.small.slice(0, 3).join('; ')); if (res.emoji.length) p.push('EMOJI ' + res.emoji.slice(0, 2).join(','));
      if ((r === 'prayers' || r === 'oldthing') && res.hash !== '#home') p.push('did not go home: ' + res.hash);
      if (p.length) say((reduce ? 'RM ' : '') + w + ' ' + r + ' :: ' + p.join('  ')); n++;
    }
    await ctx.close();
  }
  /* overlay, Lumi button and intro checks at 390 */
  { const ctx = await ctxFor(390, false, { hv_welcomed: null, noacct: 1 }), page = await ctx.newPage();
    await page.goto(BASE + '#home'); await page.waitForTimeout(1500);
    const w = await page.evaluate(() => { const s = document.querySelector('.sheet'); if (!s) return 'no welcome sheet'; const btn = [...s.querySelectorAll('button')].find(b => /just looking/i.test(b.textContent)); if (!btn) return 'no looking button'; const b = btn.getBoundingClientRect(), p = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); const tb = document.getElementById('tabbar'), fab = document.getElementById('lmfab'); return { reachable: btn.contains(p), bottomOk: b.bottom <= innerHeight, tabHidden: getComputedStyle(tb).visibility, fabHidden: fab ? getComputedStyle(fab).visibility : 'none', locked: getComputedStyle(document.body).overflow, focusIn: !!document.activeElement.closest('.sheet') } });
    console.log('welcome sheet:', JSON.stringify(w)); if (!w.reachable || !w.bottomOk || w.tabHidden !== 'hidden' || !w.locked) bad++;
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ sheet: !!document.querySelector('.sheet'), tab: getComputedStyle(document.getElementById('tabbar')).visibility })); console.log('after Escape:', JSON.stringify(after)); if (after.sheet || after.tab === 'hidden') bad++;
    await page.evaluate(() => { location.hash = '#media' }); await page.waitForTimeout(800);
    await page.mouse.wheel(0, 600); await page.waitForTimeout(500);
    const away = await page.evaluate(() => document.getElementById('lmfab') && document.getElementById('lmfab').classList.contains('away')); await page.mouse.wheel(0, -600); await page.waitForTimeout(500);
    const back = await page.evaluate(() => !document.getElementById('lmfab').classList.contains('away')); console.log('lumi button hides on scroll down:', away, ' shows on scroll up:', back); if (!away || !back) bad++;
    await ctx.close(); }
  { /* intro: first open of the day is full, later opens are short, reduced motion has none */
    for (const [label, extra, reduce] of [['first open', { hv_intro_day: null }, false], ['second open', {}, false], ['reduced motion', { hv_intro_day: null }, true]]) {
      const ctx = await ctxFor(390, reduce, extra), page = await ctx.newPage(); await page.goto(BASE.replace('&nointro=1', '') + '#home'); await page.waitForTimeout(250);
      const t0 = Date.now(); const present = await page.evaluate(() => !!document.getElementById('intro')); await page.waitForFunction(() => !document.getElementById('intro'), null, { timeout: 5000 }).catch(() => {}); const gone = Date.now() - t0;
      console.log('intro ' + label + ': shown=' + present + ', gone after ~' + gone + ' ms'); await ctx.close(); } }
  await browser.close(); console.log(bad ? bad + ' problems' : 'ALL CLEAN'); process.exit(bad ? 1 : 0);
})();
