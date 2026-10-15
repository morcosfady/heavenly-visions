/* Playwright check of "Give access" on the Permissions page (Abouna and coordinator), phone width.
   With the local server on 8001 and the fake backend on 8788:  NODE_PATH=<pw>/node_modules node tests/pw-grant.js */
const { chromium } = require('playwright-core');
const BASE = 'http://localhost:8001/index.html?api=http://localhost:8788&nointro=1&ai=http://localhost:8789';
let bad = 0; const ok = (n, c) => { console.log(c ? 'PASS' : 'FAIL', n); if (!c) bad++; };
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const seed = await (await fetch('http://localhost:8788/')).json();
  const open = async who => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx.addInitScript(([a]) => { localStorage.setItem('hv_acct', JSON.stringify(a)); localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_day', new Date().toDateString()); }, [{ token: seed[who].token, user: seed[who].user }]);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await p.goto(BASE + '#perm'); await p.waitForSelector('.pm-give', { timeout: 8000 });
    return { p, errs };
  };
  /* coordinator: servant only, own grade, church fixed */
  let { p, errs } = await open('coord3');
  ok('coordinator sees Give access', await p.locator('.pm-give').count() === 1);
  ok('coordinator role list has only Servant', (await p.locator('#pgrole option').allInnerTexts()).join() === 'Servant');
  ok('coordinator grade is fixed to own grade', await p.locator('#pggr').isDisabled() && await p.locator('#pggr').inputValue() === 'Grade 3');
  await p.fill('#pgq', 'k3_2'); await p.waitForTimeout(900);
  const hits = await p.locator('#pgr button').allInnerTexts();
  ok('search finds a student of the church', hits.length > 0);
  if (hits.length) { await p.locator('#pgr button').first().click(); await p.click('#pggo'); await p.waitForTimeout(1500); }
  ok('person is now on the Grade 3 team', hits.length > 0 && await p.locator('.pm-tree').innerText().then(t => hits[0].split('\n')[0] && t.includes(hits[0].split('\n')[0])));
  /* invite by email */
  await p.click('.pm-tabs [data-m=inv]'); await p.fill('#pge', 'newservant@test.x'); await p.fill('#pgn', 'New Servant'); await p.click('#pggo'); await p.waitForTimeout(1500);
  ok('invite appears in the waiting list', (await p.locator('.pm-inv').allInnerTexts()).join().includes('newservant@test.x'));
  await p.locator('[data-un]').first().evaluate(() => { window.confirm = () => true; }); await p.locator('[data-un]').first().click(); await p.waitForTimeout(1200);
  ok('invite can be cancelled', await p.locator('.pm-inv').count() === 0);
  ok('no sideways scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok('no page errors (coordinator)', errs.length === 0);
  await p.screenshot({ path: 'qa-shots/grant-coordinator.png', fullPage: true });
  /* Abouna: three roles, grade hides for Abouna */
  ({ p, errs } = await open('abouna'));
  ok('Abouna role list', (await p.locator('#pgrole option').allInnerTexts()).join() === 'Servant,Coordinator,Abouna');
  await p.selectOption('#pgrole', 'priest'); ok('grade hidden for Abouna role', await p.locator('#pggw').isHidden());
  await p.selectOption('#pgrole', 'coordinator'); ok('grade shown for coordinator role', await p.locator('#pggw').isVisible());
  await p.fill('#pgq', 'Peter'); await p.waitForTimeout(900);
  ok('Abouna finds a servant', await p.locator('#pgr button').count() > 0);
  await p.screenshot({ path: 'qa-shots/grant-abouna.png', fullPage: true });
  ok('no page errors (Abouna)', errs.length === 0);
  await browser.close(); console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
})();
