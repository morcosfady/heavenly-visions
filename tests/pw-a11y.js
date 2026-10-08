/* Accessibility scan with axe-core (WCAG 2 A and AA) on every route. Setup: in the pw folder run npm i playwright-core axe-core.
   NODE_PATH=<pw>/node_modules node tests/pw-a11y.js [user] [width] */
const { chromium } = require('playwright-core');
const U = process.argv[2] || 'k3_1', W = +(process.argv[3] || 390);
const ROUTES = 'home,media,m-g3,l-g3-2.5,attendance,attsheet,servants,quizzes,quiz-nayrouz,bible,b-Genesis,b-Genesis-1,games,g-memory,g-scramble,verse,calendar,bedtime,coloring,color-gallery,me,news,events,login,lumi,lumi-cards,lumi-settings,announce,planner,library,followup,report'.split(',');
const BASE = 'http://localhost:8001/index.html?api=http://localhost:8788&nointro=1&ai=http://localhost:8789';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const seed = await (await fetch('http://localhost:8788/')).json();
  const axeSrc = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const ctx = await browser.newContext({ viewport: { width: W, height: W < 600 ? 844 : 800 }, serviceWorkers: 'block' });
  await ctx.addInitScript(([a]) => { localStorage.setItem('hv_acct', JSON.stringify(a)); localStorage.setItem('hv_welcomed', '1'); localStorage.setItem('hv_intro_day', new Date().toDateString()); localStorage.setItem('hv_lumi_tapped', '1') }, [{ user: (seed[U] || seed.k3_1).user, token: (seed[U] || seed.k3_1).token }]);
  const page = await ctx.newPage(); await page.goto(BASE + '#home'); await page.waitForTimeout(1800);
  let bad = 0, total = {};
  for (const r of ROUTES) {
    await page.evaluate(h => { location.hash = '#' + h }, r); await page.waitForTimeout(1100);
    await page.evaluate(axeSrc);
    const res = await page.evaluate(async () => { const x = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }, resultTypes: ['violations'] }); return x.violations.map(v => ({ id: v.id, n: v.nodes.length, impact: v.impact, ex: v.nodes.slice(0, 2).map(n => (n.html || '').slice(0, 90) + ' :: ' + ((n.any[0] || n.all[0] || n.none[0] || {}).message || '').slice(0, 120)) })) });
    res.forEach(v => { total[v.id] = (total[v.id] || 0) + v.n; bad++; console.log(r + ' :: ' + v.id + ' x' + v.n + ' (' + v.impact + ')\n     ' + v.ex.join('\n     ')) });
  }
  console.log('\nviolation totals:', JSON.stringify(total)); await browser.close(); process.exit(bad ? 1 : 0);
})();
