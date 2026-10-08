/* Asks the real helper logic many kid questions and prints what Lumi would answer (card title and score), or "unknown" / "off topic".
   Run: node tests/lumi-eval.js [questions.txt]   Review the output by eye: this is how wrong or weird answers are found. */
const fs = require('fs'), path = require('path');
const { make } = require('./lumi-env.js');
const file = process.argv[2] || path.join(__dirname, 'lumi-eval-questions.txt');
const qs = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
let T = 1.8e12; Date.now = () => T;
(async () => {
  const E = make({ props: {} });
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lumi', 'cards.json'), 'utf8'));
  for (let i = 0; i < real.length; i += 150) await E.post({ id: 'serv3', action: 'lumi_review', ids: real.slice(i, i + 150).map(c => c.id), to: 'approved' });
  const byId = {}; real.forEach(c => byId[c.id] = c);
  let n = 0;
  for (const q of qs) {
    T += 6000; n++; E.day = '2027-01-' + String(10 + Math.floor(n / 25)).padStart(2, '0');
    const r = await E.post({ id: 'kid' + (3 + n % 40) + 'a', action: 'lumi_ask', q });
    let out;
    if (r.gold) out = 'GOLD';
    else if (r.blocked) out = '!! blocked ' + r.blocked;
    else if (r.unknown) out = '-- UNKNOWN (asks servant)';
    else if (r.answer && /^(I'm Lumi, a little lamb|Hi friend)/.test(r.answer)) out = '-- about Lumi';
    else if (r.safety === 'offtopic') out = '-- off topic';
    else if (r.safety && r.safety !== 'ok' && !(r.sources || []).length) out = '-- safety:' + r.safety;
    else out = (r.sources || []).map(s => s.id + ' | ' + s.title).join('  +  ');
    console.log(q.padEnd(58) + ' => ' + out);
  }
})();
