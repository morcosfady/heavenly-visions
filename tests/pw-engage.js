/* Playwright check of the engagement features: weekly goal, reading plan, install/reminder cards, bedtime streak, and the four new games.
   NODE_PATH=<pw>/node_modules node tests/pw-engage.js   (local server on 8001) */
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:8001/index.html?nointro=1';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  let bad = 0; const say = (...a) => { bad++; console.log('FAIL', ...a) };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_visits', '3'); localStorage.setItem('hv_intro_day', new Date().toDateString()) } catch {} });
  const page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|favicon/.test(m.text())) errs.push(m.text().slice(0, 120)) });
  await page.goto(BASE + '#home'); await page.waitForTimeout(1500);
  // weekly goal card
  if (!await page.$('.wkgoal')) say('no weekly goal card on Home');
  await page.evaluate(() => { hvAward('lesson', 'a'); hvAward('lesson', 'b'); hvAward('lesson', 'c'); hvAward('quiz', 'q1'); hvAward('bible', 'John-1'); hvAward('bible', 'John-2') });
  await page.waitForTimeout(1800);
  if (!await page.$('.sheet, #sheet, [role=dialog]')) say('weekly goal celebration did not open');
  await page.evaluate(() => { closeSheet(); location.reload() }); await page.waitForTimeout(1500);
  if (!await page.$('.wkgoal.ok')) say('weekly goal not marked done after reload');
  // reading plan
  await page.goto(BASE + '#bible'); await page.waitForTimeout(1200);
  const plan = await page.$('.plancard'); if (!plan) say('no reading plan card');
  else { const t = await plan.innerText(); if (!/John 1/.test(t)) say('plan should start at John 1: ' + t.replace(/\n/g, ' ')) }
  await page.evaluate(() => { location.hash = '#b-John-1' }); await page.waitForTimeout(2500);
  await page.goto(BASE + '#bible'); await page.waitForTimeout(1200);
  const t2 = await (await page.$('.plancard')).innerText(); if (!/Done for today/.test(t2)) say('plan not marked done: ' + t2.replace(/\n/g, ' '));
  // bedtime
  await page.goto(BASE + '#bedtime'); await page.waitForTimeout(1000);
  await page.click('#btabs [data-tab=prayer]'); await page.click('#prayed'); await page.waitForTimeout(400);
  if (!/1 night/.test(await page.innerText('#pstreak'))) say('bedtime streak not shown');
  await page.click('#btabs [data-tab=stories]'); await page.click('[data-st]'); await page.click('[data-fav]'); await page.waitForTimeout(200);
  // games
  for (const g of ['g-trivia', 'g-wordsearch', 'g-storyorder', 'g-versequest']) {
    errs.length = 0; await page.goto(BASE + '#games'); await page.waitForTimeout(600);
    await page.evaluate(h => { location.hash = '#' + h }, g); await page.waitForTimeout(900);
    const h1 = await page.innerText('h1').catch(() => ''); if (!h1) say(g, 'no heading');
    if (g === 'g-trivia') { for (let i = 0; i < 10; i++) { await page.click('.opt'); await page.waitForTimeout(1300) } }
    if (g === 'g-versequest') { for (let i = 0; i < 5; i++) { await page.click('.opt'); await page.waitForTimeout(1700) } }
    if (g === 'g-storyorder') {
      for (let i = 0; i < 5; i++) { const n = await page.$$('.so'); await n[i].click(); await page.waitForTimeout(100) }
      await page.click('#soCheck'); await page.waitForTimeout(500);
      const txt = await page.innerText('#app'); if (!/Story Order|Finished|Try again|right place/.test(txt)) say(g, 'no result');
    }
    if (g === 'g-wordsearch') {
      // cheat: read the grid from the DOM, find the first word position by scanning
      const ok = await page.evaluate(() => { const cells = [...document.querySelectorAll('.wsc')], N = Math.sqrt(cells.length), words = [...document.querySelectorAll('.wswords span')].map(s => s.textContent); const at = (x, y) => cells[y * N + x]; let found = 0;
        for (const w of words) { let done = false; for (let y = 0; y < N && !done; y++) for (let x = 0; x < N && !done; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1]]) { const ex = x + dx * (w.length - 1), ey = y + dy * (w.length - 1); if (ex >= N || ey >= N) continue; let s = ''; for (let k = 0; k < w.length; k++) s += at(x + dx * k, y + dy * k).textContent; if (s === w) { at(x, y).click(); const c2 = document.querySelectorAll('.wsc'); document.querySelectorAll('.wsc')[ey * N + ex].click(); found++; done = true; break } } }
        return found });
      if (ok < 6) say(g, 'could only auto-find ' + ok + ' of 6 words');
      await page.waitForTimeout(600);
    }
    if (g !== 'g-storyorder' && g !== 'g-wordsearch') { await page.waitForTimeout(600); const txt = await page.innerText('#app'); if (!/Finished|\/ /.test(txt)) say(g, 'no end screen: ' + txt.slice(0, 80).replace(/\n/g, ' ')) }
    if (errs.length) say(g, 'console errors', errs.join(' | '));
  }
  await page.goto(BASE + '#games'); await page.waitForTimeout(800);
  const cards = (await page.$$('.gcard')).length; if (cards < 6) say('games page shows ' + cards + ' game cards');
  console.log(bad ? bad + ' problems' : 'all engagement checks passed'); await browser.close();
})();
