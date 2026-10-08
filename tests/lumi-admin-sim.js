/* Ask Lumi, Phase 5 checks (servant dashboard: gold answers, reports, settings, alerts, servant mode). Run: node tests/lumi-admin-sim.js
   Runs the real helper with fake Google services. Lumi is FREE: nothing here calls an AI or any paid service. */
const fs = require('fs'), path = require('path');
const { make } = require('./lumi-env');
const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lumi', 'cards.json'), 'utf8'));
let fails = 0;
const ok = (n, c) => { console.log(c ? 'PASS' : 'FAIL', n); if (!c) fails++ };
let T = Date.parse('2026-10-11T12:00:00Z');
Date.now = () => T;
const words = t => String(t).split(/\s+/).filter(Boolean).length;

(async () => {
  const E = make({ props: {} });
  const post = (id, action, extra) => E.post(Object.assign({ id, action }, extra || {}));
  const ask = async (id, q, extra) => { T += 6000; return post(id, 'lumi_ask', Object.assign({ q }, extra || {})) };
  await post('serv3', 'lumi_review', { ids: real.map(c => c.id), to: 'approved' });

  /* ---------- who can use the dashboard ---------- */
  for (const a of ['lumi_gold_list', 'lumi_report', 'lumi_cfg_get', 'lumi_alerts']) ok('kids cannot use ' + a, (await post('kid3a', a)).error === 'denied');
  ok('kids cannot save or delete gold answers', (await post('kid3a', 'lumi_gold_save', { gold: { q: ['why do we kiss the priest hand'], a: 'We kiss the hand to show respect for the priest and his service.' } })).error === 'denied' && (await post('kid3a', 'lumi_gold_delete', { gid: 'abcdef12' })).error === 'denied');
  ok('kids cannot change the settings', (await post('kid3a', 'lumi_cfg_set', { cfg: { on: false } })).error === 'denied');
  ok('a bad token gets nothing', (await E.post({ id: 'serv3', token: 'no', action: 'lumi_gold_list' })).error === 'denied');

  /* ---------- gold answers ---------- */
  let r = await post('serv3', 'lumi_gold_save', { gold: { q: ["Why do we kiss the priest's hand?", 'kiss hand priest'], a: 'We kiss the hand of the priest to show respect for his service — he serves at the altar for us. See https://example.com/x', v: { text: 'Honour all men.', ref: '1 Peter 2:17' } } });
  ok('a servant can write a gold answer', r.ok && /^[a-z0-9]{8}$/.test(r.id));
  const gid = r.id, list = await post('serv3', 'lumi_gold_list');
  ok('the list shows it with who wrote it', list.ok && list.items.length === 1 && list.items[0].by === 'serv3' && list.items[0].q.length === 2);
  ok('dashes and web addresses are cleaned out', !/[–—]|https?:/.test(list.items[0].a));
  r = await ask('kid3a', "why do we kiss the priests hand");
  ok('Lumi uses the gold answer word for word before any card', r.gold && /show respect for his service/.test(r.answer) && r.verse && r.verse.ref === '1 Peter 2:17' && r.sources[0].label.indexOf('servants') > 0);
  r = await post('serv3', 'lumi_gold_save', { gold: { id: gid, q: ["Why do we kiss the priest's hand?"], a: 'We kiss the priest hand to say thank you for his care of the church family.' } });
  ok('a gold answer can be edited', r.ok && r.id === gid && (await post('coord3', 'lumi_gold_list')).items[0].a.indexOf('thank you') > 0);
  ok('editing a gold answer that does not exist is refused', (await post('serv3', 'lumi_gold_save', { gold: { id: 'nonexist1', q: ['why is the sky blue'], a: 'This is a long enough answer for the test to run properly.' } })).error === 'none');
  ok('a gold answer needs a question and a real answer', (await post('serv3', 'lumi_gold_save', { gold: { q: [], a: 'long enough answer here for the test' } })).error === 'missing' && (await post('serv3', 'lumi_gold_save', { gold: { q: ['a question here'], a: 'short' } })).error === 'missing');
  ok('a gold answer can be deleted', (await post('abouna', 'lumi_gold_delete', { gid })).ok && (await post('serv3', 'lumi_gold_list')).items.length === 0);
  r = await ask('kid3a', "why do we kiss the priests hand");
  ok('after deleting it Lumi goes back to the cards', !r.gold);
  for (let i = 0; i < 60; i++) await post('serv3', 'lumi_gold_save', { gold: { q: ['question number ' + i + ' about church'], a: 'Answer number ' + i + ' that is long enough for the rules.' } });
  ok('there is a limit of 60 gold answers', (await post('serv3', 'lumi_gold_save', { gold: { q: ['one more question here'], a: 'One more answer that is long enough.' } })).error === 'full');

  /* ---------- the questions report ---------- */
  const R = make({ props: {} });
  await R.post({ id: 'serv3', action: 'lumi_review', ids: real.map(c => c.id).filter(id => !/incense|cymbals/.test(id)), to: 'approved' });
  const rask = async (id, q) => { T += 6000; return R.post({ id, action: 'lumi_ask', q }) };
  for (let i = 0; i < 3; i++) await rask('kid' + (3 + i) + 'a', 'What is baptism?');
  await rask('kid3b', 'Why do we use incense?'); await rask('kid4b', 'why do we use incense');
  await rask('kid5b', 'What is the Trinity?');
  const mh = (await R.post({ id: 'kid3a', action: 'lumi_hist' })).items[0];
  await R.post({ id: 'kid3a', action: 'lumi_fb', ts: mh.ts, v: 'down' });
  const rep = await R.post({ id: 'coord3', action: 'lumi_report' });
  ok('the report counts the most asked questions', rep.ok && rep.top[0].q && rep.top[0].n === 3 && /baptism/i.test(rep.top[0].q) && rep.totals.asked >= 6);
  ok('the report lists unanswered questions (no approved card)', rep.unanswered.length === 1 && /incense/i.test(rep.unanswered[0].q) && rep.unanswered[0].n === 2 && rep.totals.unanswered === 2);
  ok('the report lists thumbs down answers with the answer Lumi gave', rep.down.length === 1 && /baptism/i.test(rep.down[0].q) && rep.down[0].a.length > 10 && rep.down[0].g === 'Grade 3');
  ok('the report never shows kid names or ids', !/kid\d/.test(JSON.stringify(rep)));
  ok('a servant can see the report', (await R.post({ id: 'serv3', action: 'lumi_report' })).ok);
  ok('last month is empty', (await R.post({ id: 'serv3', action: 'lumi_report', month: '2026-09' })).totals.asked === 0);
  ok('a bad month falls back to this month', (await R.post({ id: 'serv3', action: 'lumi_report', month: 'x' })).month === '2026-10');
  ok('the report stays small enough to store', Object.keys(R.props).filter(k => /^lm[ruda]_/.test(k)).every(k => R.props[k].length < 9000));

  /* ---------- settings ---------- */
  let c = await post('serv3', 'lumi_cfg_get');
  ok('a servant can read the settings but not change them', c.ok && c.canEdit === false && c.cfg.on === true && c.cfg.perKid === 20 && c.cfg.perDay === 150);
  ok('a servant cannot change the settings', (await post('serv3', 'lumi_cfg_set', { cfg: { on: false } })).error === 'denied');
  c = await post('coord3', 'lumi_cfg_get'); ok('a coordinator can edit the settings', c.canEdit === true && c.grades.length === 14);
  r = await post('abouna', 'lumi_cfg_set', { cfg: { on: true, perKid: 8, perDay: 90, grades: ['Grade 3', 'Grade 4', 'Nonsense'] } });
  ok('the priest saves the settings (unknown grades are dropped)', r.ok && r.cfg.perKid === 8 && r.cfg.perDay === 90 && r.cfg.grades.join() === 'Grade 3,Grade 4');
  r = await post('coord3', 'lumi_cfg_set', { cfg: { on: true, perKid: 9999, perDay: 1, grades: [] } });
  ok('limits are kept in a safe range', r.cfg.perKid === 100 && r.cfg.perDay === 10);
  await post('coord3', 'lumi_cfg_set', { cfg: { on: true, perKid: 2, perDay: 90, grades: ['Grade 4'] } });
  r = await ask('kid3a', 'What is baptism?'); ok('a grade that is not allowed gets the resting message', r.blocked === 'closed');
  r = await ask('kid4a', 'What is baptism?'); ok('an allowed grade can ask', r.ok && !r.blocked);
  await ask('kid4a', 'What is baptism?'); r = await ask('kid4a', 'What is baptism?'); ok('the new per kid limit works (2 a day)', r.blocked === 'nap');
  await post('coord3', 'lumi_cfg_set', { cfg: { on: false } });
  r = await ask('kid4b', 'What is baptism?'); ok('switching Lumi off closes her', r.blocked === 'closed');

  /* ---------- servant mode ---------- */
  await post('coord3', 'lumi_cfg_set', { cfg: { on: true, perKid: 20, perDay: 150, grades: [] } });
  const normal = await ask('serv3', 'Tell me about St. George');
  const deep = await ask('serv3', 'Tell me about St. George', { deep: true });
  ok('servant mode gives a longer answer than the normal one', deep.ok && deep.deep === true && words(deep.answer) > words(normal.answer) && deep.verse !== undefined);
  ok('servant mode shows the references and the St-Takla page to read more', Array.isArray(deep.refs) && Array.isArray(deep.urls) && deep.urls.every(x => /^https:\/\/st-takla\.org\//.test(x.url)) && Array.isArray(deep.more));
  const kidTry = await ask('kid3a', 'Tell me about St. George', { deep: true });
  ok('a kid cannot switch servant mode on', !kidTry.deep && !kidTry.urls && words(kidTry.answer) <= 171);
  await post('coord3', 'lumi_cfg_set', { cfg: { on: false } });
  r = await ask('serv3', 'Tell me about St. George', { deep: true });
  ok('servants can still use servant mode when Lumi is off for the kids', r.ok && r.deep === true);
  r = await ask('serv3', 'what is the best video game', { deep: true }); ok('safety rules still apply in servant mode', r.safety === 'offtopic');
  await post('coord3', 'lumi_cfg_set', { cfg: { on: true } });

  /* ---------- alerts ---------- */
  await ask('kid3a', 'I feel so sad and alone'); await ask('kid5a', 'my friends bully me');
  const al = await post('abouna', 'lumi_alerts');
  ok('the priest sees both alerts', al.items.length === 2);
  ok('a servant sees only their class', (await post('serv3', 'lumi_alerts')).items.length === 1);
  const a3 = (await post('serv3', 'lumi_alerts')).items[0];
  ok('the servant can read that kid\'s recent questions', (await post('serv3', 'lumi_hist', { kid: a3.kid })).items.length >= 1);
  ok('and mark the alert seen with a note', (await post('serv3', 'lumi_alert_seen', { aid: a3.id, note: 'Talked with the family' })).ok && (await post('coord3', 'lumi_alerts')).items.find(x => x.id === a3.id).seen === 1);
  ok('nothing ever called a paid service', E.aiCalls.length === 0 && R.aiCalls.length === 0);
  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})();
