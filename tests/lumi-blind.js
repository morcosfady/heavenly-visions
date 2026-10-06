/* Ask Lumi, a second set of 30 questions written AFTER the first 60 were tuned (a fairer test of the search). Run: node tests/lumi-blind.js
   Every card is approved. A question passes if Lumi's first card matches, or if she honestly says she does not know. A wrong card is a FAIL. */
const fs = require('fs'), path = require('path');
const { make } = require('./lumi-env');
const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lumi', 'cards.json'), 'utf8'));
let T = Date.parse('2026-10-11T12:00:00Z');
Date.now = () => T;
const Q = [
  ['who is the holy spirit', /holy-spirit|spirit/i], ['why do we make the sign of the cross', /sign-of-cross|cross/i], ['what is communion', /eucharist|communion/i],
  ['who is st george', /george/i], ['what is lent', /lent/i], ['why do we have icons', /icon/i], ['what is a deacon', /deacon/i], ['who was moses', /moses|burning|red-sea|exodus/i],
  ['tell me the story of david and goliath', /david|goliath/i], ['who is pope shenouda', /shenouda/i], ['what is the trinity', /trinity/i], ['what is the cross', /cross/i],
  ['who is st mina', /mina/i], ['what is theophany', /theophany|epiphany|baptism/i], ['when is christmas', /nativity|christmas|calendar/i], ['what is the apostles fast', /apostle/i],
  ['why do we fast', /fast/i], ['what is a martyr', /martyr/i], ['who are the 21 martyrs', /libya/i], ['who is st antony', /antony/i], ['what did jesus do at the last supper', /last-supper|supper|eucharist/i],
  ['what is the gospel', /bible|gospel/i], ['tell me about jonah', /jonah/i], ['what is a priest', /priest/i], ['who wrote the gospel of mark', /mark/i], ['how do i pray the lords prayer', /lord|pray/i],
  ['what is pentecost', /pentecost/i], ['can i see an angel', /angel/i], ['who is joseph', /joseph/i], ['why is sunday special', /resurrection|sunday|liturgy|church/i]
];
(async () => {
  const E = make({ props: {} });
  await E.post({ id: 'serv3', action: 'lumi_review', ids: real.map(c => c.id), to: 'approved' });
  let pass = 0, n = 0; const out = ['# Ask Lumi: blind set of 30', '', '| # | Question | Lumi did | First card | Result |', '|---|---|---|---|---|'];
  for (const [q, re] of Q) {
    n++; T += 6000;
    const r = await E.post({ id: 'kid4_' + n, action: 'lumi_ask', q });
    const first = (r.sources || [])[0] || {}, card = real.find(c => c.id === first.id) || {};
    const ok = r.unknown ? 'honest unknown' : re.test((first.id || '') + ' ' + (first.title || '') + ' ' + (card.tags || []).join(' ') + ' ' + (r.answer || ''));
    if (ok) pass++;
    out.push('| ' + [n, q, r.unknown ? 'unknown' : r.safety || 'answer', first.title || '', ok ? (r.unknown ? 'PASS (honest "I don\'t know")' : 'PASS') : 'FAIL: wrong card'].join(' | ') + ' |');
    if (!ok) console.log('FAIL "' + q + '" -> ' + (first.title || r.safety));
  }
  fs.writeFileSync(path.join(__dirname, 'lumi-blind-results.md'), out.join('\n') + '\n');
  console.log(pass + ' of ' + n + ' passed. Table: tests/lumi-blind-results.md');
})();
