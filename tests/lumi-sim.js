/* Ask Lumi, library checks. Run: node tests/lumi-sim.js
   Runs the real helper script (ai-helper.gs + lumi.gs) with fake Google services. No key, no internet. */
const fs = require('fs'), path = require('path');
const { make } = require('./lumi-env');
let fails = 0;
const ok = (n, c) => { console.log(c ? 'PASS' : 'FAIL', n); if (!c) fails++ };
const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lumi', 'cards.json'), 'utf8'));

/* a tiny fixed library so the search rules are tested the same way every time */
const mk = (id, title, text, tags, kw, level) => ({ id, title, text: text + ' ' + 'x '.repeat(10), tags, kw, level: level || 'all', source: 'Heavenly Visions app content', ref: '', links: [], verse: null, verify: false, approved: false });
const SMALL = [
  mk('mary', 'Who is the Theotokos?', 'St. Mary is the mother of Jesus and we call her the Theotokos.', ['mary', 'saint'], ['mary', 'virgin mary', 'theotokos', 'mother of god']),
  mk('incense', 'Why do we use incense?', 'Incense rises like our prayers to God in church.', ['church', 'liturgy'], ['incense', 'smoke', 'censer']),
  mk('fast', 'What is fasting?', 'Fasting means eating less or no animal foods to pray more.', ['fast'], ['fasting', 'lent', 'vegan']),
  mk('noah', 'Noah and the ark', 'Noah built a big boat and God saved his family and the animals.', ['bible'], ['noah', 'ark', 'flood', 'rainbow'], 'little'),
  mk('baptism', 'Baptism', 'Baptism is the first sacrament, the water of new life.', ['sacrament'], ['baptized', 'baptised', 'water']),
  mk('easter', 'The Resurrection', 'Jesus rose from the dead on the third day. We call it Pascha.', ['jesus', 'feast'], ['easter', 'pascha', 'risen'])
];

(async () => {
  /* ---------- the search ---------- */
  const e = make({ cards: SMALL });
  const all = e.lib.lumiAll(false).map(c => Object.assign(c, { status: 'approved' }));
  const top = q => { const r = e.lib.lumiSearch(all, q, 'older', 3, true, 4); return r.length ? r[0].id : null };
  ok('Mary finds the Theotokos card', top('Who is Mary?') === 'mary');
  ok('Virgin Mary finds it', top('tell me about the virgin mary') === 'mary');
  ok('mother of God finds it', top('why is she called mother of God') === 'mary');
  ok('plural words work (baptisms)', top('what happens in baptisms') === 'baptism');
  ok('baptized finds Baptism', top('when was I baptized') === 'baptism');
  ok('Easter finds the Resurrection', top('what is easter') === 'easter');
  ok('smoke finds incense', top('why is there smoke in church') === 'incense');
  ok('lent finds fasting', top('what is lent') === 'fast');
  ok('flood finds Noah', top('why was there a flood') === 'noah');
  ok('nonsense finds nothing', top('xyzzy plugh') === null);
  ok('off topic finds nothing', top('what is the best video game') === null);
  ok('empty question finds nothing', top('') === null && top('   ') === null);
  ok('only stop words find nothing', top('what is the') === null);
  const pend = e.lib.lumiAll(false);
  ok('unapproved cards are never returned to kids', e.lib.lumiSearch(pend, 'who is mary', 'older', 3, true, 4).length === 0);
  ok('reviewers can still search unapproved cards', e.lib.lumiSearch(pend, 'who is mary', 'older', 3, false, 4).length > 0);
  ok('little kids prefer little cards', (() => { const r = e.lib.lumiSearch(all, 'noah ark', 'little', 3, true, 4); return r.length && r[0].id === 'noah' })());

  /* ---------- review actions ---------- */
  const E = make({ cards: SMALL });
  const cardsOf = async id => E.post({ id, action: 'lumi_cards' });
  ok('kids cannot read the cards', (await cardsOf('kid1')).error === 'denied');
  ok('kids cannot approve', (await E.post({ id: 'kid1', action: 'lumi_review', ids: ['mary'], to: 'approved' })).error === 'denied');
  ok('bad token is denied', (await E.post({ id: 'serv1', token: 'no', action: 'lumi_cards' })).error === 'denied');
  const l1 = await cardsOf('serv1');
  ok('a servant sees all cards waiting', l1.ok && l1.cards.length === 6 && l1.counts.pending === 6 && l1.counts.approved === 0);
  let r = await E.post({ id: 'serv1', action: 'lumi_review', ids: ['mary', 'incense'], to: 'approved' });
  ok('approve works', r.ok && r.counts.approved === 2 && r.counts.pending === 4);
  r = await E.post({ id: 'coord1', action: 'lumi_review', ids: ['fast'], to: 'rejected' });
  ok('reject works', r.ok && r.counts.rejected === 1);
  r = await E.post({ id: 'abouna', action: 'lumi_review', ids: ['nope-not-a-card'], to: 'approved' });
  ok('unknown ids are ignored', r.ok && r.counts.approved === 2);
  r = await E.post({ id: 'serv1', action: 'lumi_review', ids: ['mary'], to: 'weird' });
  ok('bad status is refused', r.error === 'bad');
  r = await E.post({ id: 'serv1', action: 'lumi_search', q: 'who is mary' });
  ok('search on the server returns approved cards only', r.ok && r.results.length === 1 && r.results[0].id === 'mary' && r.results[0].status === 'approved');
  r = await E.post({ id: 'serv1', action: 'lumi_search', q: 'noah and the ark' });
  ok('a waiting card is not found for kids', r.ok && r.results.length === 0);
  r = await E.post({ id: 'serv1', action: 'lumi_search', q: 'noah and the ark', all: true });
  ok('a reviewer can include waiting cards', r.ok && r.results.length === 1 && r.results[0].id === 'noah');

  /* ---------- edit and add ---------- */
  const mary = (await cardsOf('serv1')).cards.find(c => c.id === 'mary');
  r = await E.post({ id: 'serv1', action: 'lumi_save', card: Object.assign({}, mary, { text: mary.text + ' She is also called Our Lady.' }) });
  ok('edit saves', r.ok && r.id === 'mary');
  const after = (await cardsOf('serv1')).cards.find(c => c.id === 'mary');
  ok('an edited card goes back to waiting and is marked edited', after.status === 'pending' && after.edited && /Our Lady/.test(after.text));
  r = await E.post({ id: 'serv1', action: 'lumi_save', card: { title: 'A new card', text: 'This is a brand new card that a servant wrote for the little ones in the class today.', tags: ['church'], kw: ['new'], level: 'little', source: 'Heavenly Visions app content' } });
  ok('adding a card works', r.ok && /^x-/.test(r.id));
  const l3 = await cardsOf('serv1');
  ok('the new card is listed, waiting and marked new', l3.cards.length === 7 && l3.cards.find(c => c.id === r.id).isnew && l3.cards.find(c => c.id === r.id).status === 'pending');
  r = await E.post({ id: 'serv1', action: 'lumi_save', card: { title: 'Too short', text: 'No.' } });
  ok('a card with no real text is refused', r.error === 'missing');
  ok('an edit survives a reload of the base cards', (await E.post({ id: 'serv1', action: 'lumi_refresh' })).ok && (await cardsOf('serv1')).cards.find(c => c.id === 'mary').edited);

  /* ---------- the cache ---------- */
  const C = make({ cards: SMALL });
  await C.post({ id: 'serv1', action: 'lumi_cards' }); await C.post({ id: 'serv1', action: 'lumi_cards' }); await C.post({ id: 'serv1', action: 'lumi_cards' });
  ok('the cards link is fetched once and then cached', C.cardsFetches === 1);
  const BIG = make({ cards: real });
  ok('the real library fits in the cache chunks', (await BIG.post({ id: 'serv1', action: 'lumi_cards' })).ok);

  /* ---------- the real library ---------- */
  ok('the real library has about 150 cards', real.length >= 140);
  ok('every real card starts as not approved', real.every(c => c.approved === false));
  const stats = await BIG.post({ id: 'serv1', action: 'lumi_cards' });
  ok('nothing in the real library is approved yet', stats.counts.approved === 0 && stats.counts.pending === real.length);
  const BA = make({ cards: real }), allReal = BA.lib.lumiAll(false).map(c => Object.assign(c, { status: 'approved' }));
  const hit = (q, re) => { const r = BA.lib.lumiSearch(allReal, q, 'older', 3, true, 4); return r.some(x => re.test(x.id + ' ' + x.title + ' ' + x.tags.join(' '))) };
  const probes = [['Who is St. Mary?', /mary|theotokos/i], ['Why do we use incense?', /incense/i], ['What is fasting?', /fast/i], ['Tell me about Noah', /noah/i],
    ['What is baptism?', /baptism/i], ['Who is St. George?', /george/i], ['What is Nayrouz?', /nayrouz/i], ['What is the Trinity?', /trinity/i], ['Why do we pray?', /pray/i],
    ['What is the iconostasis?', /iconostasis|icon/i], ['What happened on Palm Sunday?', /palm/i], ['Who is Archangel Michael?', /michael/i], ['David and Goliath', /david|goliath/i], ['What is the Liturgy?', /liturgy/i]];
  probes.forEach(p => ok('real library finds: ' + p[0], hit(p[0], p[1])));
  const none = ['what is the best video game', 'how do I fix my bike', 'xyzzy plugh', 'minecraft', 'pizza recipe'];
  none.forEach(q => ok('real library finds nothing for: ' + q, BA.lib.lumiSearch(allReal, q, 'older', 3, true, 4).length === 0));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})();
