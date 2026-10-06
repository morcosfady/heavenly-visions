/* Ask Lumi, Phase 4 checks (Quiz me, Guess the saint, stories, words, church tour). Run: node tests/lumi-learn-sim.js
   Runs the real helper with fake Google services. Lumi is FREE: nothing here calls an AI or any paid service. */
const fs = require('fs'), path = require('path');
const { make } = require('./lumi-env');
const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lumi', 'cards.json'), 'utf8'));
let fails = 0;
const ok = (n, c) => { console.log(c ? 'PASS' : 'FAIL', n); if (!c) fails++ };
const sents = c => c.text.trim().replace(/\b(St|Dr|Fr)\./g, '$1\u0001').match(/[^.!?]+[.!?]+(\s|$)/g).map(s => s.replace(/\u0001/g, '.').trim()).filter(s => s.split(' ').length >= 4);

(async () => {
  const E = make({ props: {} });
  const learn = (id, mode, extra) => E.post(Object.assign({ id, action: 'lumi_learn', mode }, extra || {}));
  let r = await learn('kid3a', 'quiz', { topic: 'saints' });
  ok('with nothing approved there is no quiz (nothing is taught)', r.ok === false && r.error === 'few');
  ok('and no other mode works either', (await learn('kid3a', 'saints')).error === 'few' && (await learn('kid3a', 'tour')).error === 'few' && (await learn('kid3a', 'words')).error === 'few' && (await learn('kid3a', 'stories')).items.length === 0);
  await E.post({ id: 'serv3', action: 'lumi_review', ids: real.map(c => c.id), to: 'approved' });

  /* ---------- quiz ---------- */
  const byId = id => real.find(c => c.id === id);
  for (const topic of ['all', 'saints', 'feasts', 'church', 'bible', 'words']) {
    r = await learn('kid3a', 'quiz', { topic });
    ok('quiz "' + topic + '" has well formed questions', r.ok && r.items.length >= 3 && r.items.every(it => it.opts.length === 4 && new Set(it.opts).size === 4 && it.ok >= 0 && it.ok < 4 && it.q && it.why));
    ok('the right answer comes from the question\'s own card (' + topic + ')', r.items.every(it => { const c = byId(it.id), a = it.opts[it.ok]; return c && sents(c).some(s => s.indexOf(a.slice(0, 30)) === 0) }));
    if (topic !== 'all') {
      const pre = { saints: /^saint-/, feasts: /^(feast|fast)-/, church: /^(church|sac|faith|hist)-/, bible: /^(bible|virtue)-/, words: /^(word|pray)-/ }[topic];
      ok('quiz "' + topic + '" only uses its own topic', r.items.every(it => pre.test(it.id)));
    }
  }
  r = await learn('kid3a', 'quiz', { topic: 'saints' });
  ok('wrong answers never mention the subject of the question', r.items.every(it => {
    const c = byId(it.id), keys = c.title.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(w => w.length >= 5 && !/^(which|sentence|tells|about|apostle|great)$/.test(w));
    return it.opts.every((o, i) => i === it.ok || !keys.some(k => o.toLowerCase().includes(k)));
  }));
  ok('little kids get a quiz too', (await learn('kid2a', 'quiz', { topic: 'bible' })).items.length >= 3);
  r = await learn('kid3a', 'quiz', { topic: 'nonsense' });
  ok('an unknown topic means all topics', r.ok && r.topic === 'all');

  /* ---------- guess the saint ---------- */
  r = await learn('kid3a', 'saints');
  ok('guess the saint has 5 rounds with clues and 4 names', r.ok && r.rounds.length === 5 && r.rounds.every(x => x.clues.length >= 2 && x.clues.length <= 4 && x.opts.length === 4 && x.opts[x.ok] === x.name));
  ok('the saint\'s name is hidden in the clues', r.rounds.every(x => {
    const toks = x.name.split(/[\s.]+/).filter(w => w.length >= 3 && !/^(saint|pope|archangel|the|anba|and|of)$/i.test(w));
    return x.clues.every(c => toks.every(t => !new RegExp('\\b' + t + '\\b', 'i').test(c)));
  }));
  ok('the 5 saints are different', new Set(r.rounds.map(x => x.id)).size === 5);
  ok('the saint names are real saint card titles', r.rounds.every(x => real.some(c => c.id === x.id && c.title.indexOf(x.name) >= 0)));

  /* ---------- stories ---------- */
  const list = await learn('kid3a', 'stories');
  ok('the story list has Bible and saint stories', list.ok && list.items.length >= 40 && list.items.some(i => i.kind === 'bible') && list.items.some(i => i.kind === 'saint'));
  const noah = list.items.find(i => /noah/i.test(i.title)) || list.items.find(i => i.kind === 'bible');
  r = await learn('kid3a', 'story', { sid: noah.id });
  ok('a story has short pages and a tiny question', r.ok && r.pages.length >= 2 && r.pages.length <= 8 && r.pages.every(p => p.length < 700) && /Bible|bravest/.test(r.ask));
  const rl = await learn('kid2a', 'story', { sid: noah.id });
  ok('little kids get one sentence per page', rl.ok && rl.pages.length >= r.pages.length && rl.verse === null);
  ok('the pages are the card text in order', r.pages.join(' ').replace(/\s+/g, ' ').indexOf(byId(noah.id).text.slice(0, 30)) === 0);
  ok('a card that is not a story cannot be opened as one', (await learn('kid3a', 'story', { sid: 'faith-trinity-one-god' })).error === 'none' && (await learn('kid3a', 'story', { sid: 'nope' })).error === 'none');

  /* ---------- words ---------- */
  r = await learn('kid3a', 'words');
  ok('church words with their meanings', r.ok && r.items.length >= 8 && r.items.every(w => w.word && w.word.length < 30 && w.text.length > 30));
  ok('the words are cleaned up (Theotokos, Kyrie eleison)', r.items.some(w => w.word === 'Theotokos') && r.items.some(w => /Kyrie eleison/.test(w.word)) && !r.items.some(w => /\?|^What /.test(w.word)));

  /* ---------- church tour ---------- */
  r = await learn('kid3a', 'tour');
  const spots = r.stops ? r.stops.map(s => s.spot) : [];
  ok('the church tour walks in order from the door to the altar', r.ok && r.stops.length >= 6 && spots[0] === 'door' && spots.indexOf('iconostasis') < spots.indexOf('altar'));
  await E.post({ id: 'serv3', action: 'lumi_review', ids: ['church-altar', 'church-haykal'], to: 'rejected' });
  r = await learn('kid3a', 'tour');
  ok('a rejected card is left out of the tour', r.ok && !r.stops.some(s => s.spot === 'altar' || s.spot === 'haykal'));
  ok('and out of the quiz', (await learn('kid3a', 'quiz', { topic: 'church' })).items.every(i => i.id !== 'church-altar'));

  /* ---------- rules ---------- */
  ok('a bad token gets nothing', (await E.post({ id: 'kid3a', token: 'no', action: 'lumi_learn', mode: 'quiz' })).error === 'denied');
  ok('an unknown mode is refused', (await learn('kid3a', 'hack')).error === 'bad');
  E.props.lm_cfg = JSON.stringify({ on: false });
  ok('when Lumi is switched off the modes are closed too', (await learn('kid3a', 'quiz')).blocked === 'closed');
  ok('nothing ever called a paid service', E.aiCalls.length === 0);
  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})();
