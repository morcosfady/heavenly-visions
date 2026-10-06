/* Heavenly Visions: Ask Lumi, knowledge library part (Phase 1).
   This is a SECOND FILE inside the same Apps Script project as ai-helper.gs (File, New, Script, name it lumi).
   It uses MAIN_URL, who(), out(), clip(), today(), PropertiesService and LockService from ai-helper.gs.
   Where things live:
   - The cards are in the repo, lumi/cards.json, published with the app (CARDS_URL). Nothing there is approved.
   - What a servant did (approve, reject, edit, add) is stored here in Script Properties of THIS project, not in the games backend:
       lm_a  approved card ids, comma separated      lm_r  rejected card ids, comma separated
       lmc_<id>  one edited or new card as JSON (about 1 KB each)
   - Only approved cards can ever be used to answer a kid (lumiSearch with onlyApproved).
   Everything below is checked on the server. Only approved servants, coordinators, priests and masters can use the review actions.
   Kid actions (lumi_ask, lumi_hist for their own history, lumi_fb) are handled in the third file, lumi-ask.gs. */
var CARDS_URL = 'https://morcosfady.github.io/heavenly-visions/lumi/cards.json';
var LM_TAGS = ['saint', 'feast', 'fast', 'sacrament', 'prayer', 'bible', 'church', 'history', 'virtue', 'trinity', 'mary', 'jesus', 'liturgy', 'calendar', 'martyr', 'angel', 'prophet', 'icon'];
var LM_CHUNK = 40000;

/* words that mean the same thing for search. Each row is one group. */
var LM_SYN = [
  ['mary', 'virgin', 'theotokos', 'mother of god', 'our lady', 'madonna', 'stmary'],
  ['jesus', 'christ', 'savior', 'saviour', 'messiah', 'emmanuel'],
  ['god', 'lord', 'father'],
  ['church', 'temple', 'cathedral', 'sanctuary'],
  ['communion', 'eucharist', 'qurbana', 'korban', 'offering', 'host', 'bread', 'wine'],
  ['baptism', 'baptize', 'baptise', 'baptized', 'baptised', 'christening'],
  ['priest', 'abouna', 'abouna', 'father', 'clergy', 'qes'],
  ['pope', 'patriarch', 'tawadros', 'shenouda', 'kyrillos'],
  ['fast', 'fasting', 'lent', 'abstain', 'vegan', 'nineveh'],
  ['christmas', 'nativity', 'birth', 'born', 'bethlehem'],
  ['easter', 'pascha', 'resurrection', 'risen', 'resurrected'],
  ['cross', 'crucifixion', 'crucified', 'golgotha', 'calvary'],
  ['haykal', 'altar', 'sanctuary', 'iconostasis'],
  ['incense', 'censer', 'smoke', 'thurible'],
  ['icon', 'icons', 'picture', 'painting'],
  ['agpeya', 'hours', 'prayer book', 'prayers'],
  ['pray', 'prayer', 'prayers', 'praying'],
  ['martyr', 'martyrs', 'martyrdom', 'persecution'],
  ['angel', 'angels', 'michael', 'gabriel', 'archangel'],
  ['nayrouz', 'new year', 'coptic new year', 'tout'],
  ['liturgy', 'mass', 'qodas', 'service', 'worship'],
  ['bible', 'scripture', 'scriptures', 'testament', 'gospel'],
  ['sin', 'sins', 'wrong', 'forgive', 'forgiveness', 'confession', 'repent', 'repentance'],
  ['egypt', 'egyptian', 'holy family'],
  ['spirit', 'holy spirit', 'paraclete', 'pentecost'],
  ['trinity', 'three persons', 'father son holy spirit'],
  ['saint', 'saints', 'holy', 'synaxarium'],
  ['heaven', 'paradise', 'kingdom'],
  ['marriage', 'matrimony', 'wedding', 'married']
];
var LM_STOP = { a: 1, an: 1, the: 1, is: 1, are: 1, was: 1, were: 1, do: 1, does: 1, did: 1, to: 1, of: 1, in: 1, on: 1, at: 1, it: 1, its: 1, and: 1, or: 1, for: 1, why: 1, what: 1, who: 1, how: 1, when: 1, where: 1, which: 1, can: 1, we: 1, you: 1, i: 1, me: 1, my: 1, our: 1, us: 1, they: 1, them: 1, that: 1, this: 1, with: 1, about: 1, tell: 1, please: 1, there: 1, so: 1, be: 1, have: 1, has: 1, had: 1, will: 1, would: 1, should: 1, could: 1, from: 1, by: 1, as: 1, if: 1, not: 1, no: 1, yes: 1, am: 1, lumi: 1, know: 1, mean: 1, means: 1, called: 1, say: 1, said: 1, kid: 1, kids: 1, child: 1, children: 1, best: 1, game: 1, games: 1, video: 1, videos: 1, people: 1, thing: 1, things: 1 };

function lmNorm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function lmStem(w) {
  if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
  if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /es$/.test(w) && /(ss|sh|ch|x)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
  if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
  return w;
}
function lmWords(s) { return lmNorm(s).split(' ').filter(function (w) { return w && !LM_STOP[w]; }).map(lmStem); }

var LM_SYNIDX = null;
function lmSynIndex() {
  if (LM_SYNIDX) return LM_SYNIDX;
  LM_SYNIDX = {};
  LM_SYN.forEach(function (g, gi) {
    g.forEach(function (term) {
      lmWords(term).forEach(function (w) { (LM_SYNIDX[w] = LM_SYNIDX[w] || {})[gi] = 1; });
    });
  });
  return LM_SYNIDX;
}
/* a question turns into words plus their synonyms (synonyms count a bit less) */
function lmQuery(q) {
  var base = lmWords(q), idx = lmSynIndex(), main = {}, extra = {};
  var norm = lmNorm(q);
  base.forEach(function (w) { main[w] = 1; });
  base.forEach(function (w) {
    var gs = idx[w];
    if (!gs) return;
    Object.keys(gs).forEach(function (gi) {
      LM_SYN[gi].forEach(function (term) { lmWords(term).forEach(function (x) { if (!main[x]) extra[x] = 1; }); });
    });
  });
  /* multi word synonyms like "mother of god" */
  LM_SYN.forEach(function (g) {
    var hit = g.some(function (t) { return t.indexOf(' ') >= 0 && norm.indexOf(t) >= 0; });
    if (hit) g.forEach(function (t) { lmWords(t).forEach(function (x) { if (!main[x]) extra[x] = 1; }); });
  });
  return { main: Object.keys(main), extra: Object.keys(extra), norm: norm };
}

function lmIndex(c) {
  if (c._ix) return c._ix;
  c._ix = {
    title: lmWords(c.title), kw: lmWords((c.kw || []).join(' ')), tags: lmWords((c.tags || []).join(' ')), text: lmWords(c.text),
    titleN: lmNorm(c.title), kwN: lmNorm((c.kw || []).join(' | '))
  };
  return c._ix;
}
function lmHas(arr, w) { return arr.indexOf(w) >= 0; }

/* the best cards for a question. level is 'little' or 'older'. onlyApproved keeps unapproved cards out. */
function lumiSearch(cards, q, level, n, onlyApproved, minScore) {
  var Q = lmQuery(q);
  if (!Q.main.length) return [];
  var pool = cards.filter(function (c) { return !onlyApproved || c.status === 'approved'; });
  var df = {};
  pool.forEach(function (c) { var ix = lmIndex(c), seen = {}; ix.title.concat(ix.kw, ix.tags, ix.text).forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1 } }); });
  var N = Math.max(pool.length, 1);
  var idf = function (w) { return Math.log(1 + N / (1 + (df[w] || 0))); };
  var scored = pool.map(function (c) {
    var ix = lmIndex(c), s = 0, hits = 0;
    Q.main.forEach(function (w) {
      var h = 0;
      if (lmHas(ix.title, w)) { s += 6 * idf(w); h = 1; }
      if (lmHas(ix.kw, w)) { s += 5 * idf(w); h = 1; }
      if (lmHas(ix.tags, w)) { s += 3 * idf(w); h = 1; }
      if (lmHas(ix.text, w)) { s += 1.2 * idf(w); h = 1; }
      hits += h;
    });
    Q.extra.forEach(function (w) {
      if (lmHas(ix.title, w)) s += 2.5 * idf(w);
      if (lmHas(ix.kw, w)) s += 2 * idf(w);
      if (lmHas(ix.tags, w)) s += 1.2 * idf(w);
    });
    if (Q.norm.length > 4 && (ix.titleN.indexOf(Q.norm) >= 0 || ix.kwN.indexOf(Q.norm) >= 0)) s += 8;
    var coverage = hits / Q.main.length;
    s *= 0.5 + 0.5 * coverage;
    if (level === 'little' && c.level === 'older') s *= 0.8;
    if (level === 'older' && c.level === 'little') s *= 0.85;
    return { c: c, s: s };
  }).filter(function (x) { return x.s >= (minScore === undefined ? 4 : minScore); });
  scored.sort(function (a, b) { return b.s - a.s; });
  return scored.slice(0, n || 5).map(function (x) { var o = lmPublic(x.c); o.score = Math.round(x.s * 10) / 10; return o; });
}

/* ---------- loading the library ---------- */
function lmLoadBase(force) {
  var cache = CacheService.getScriptCache();
  if (!force) {
    var n = Number(cache.get('lmbase_n') || 0), parts = [];
    for (var i = 0; i < n; i++) { var p = cache.get('lmbase_' + i); if (p === null) { parts = null; break; } parts.push(p); }
    if (n && parts) { try { return JSON.parse(parts.join('')); } catch (e) { } }
  }
  var r = UrlFetchApp.fetch(CARDS_URL, { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return null;
  var text = r.getContentText(), cards;
  try { cards = JSON.parse(text); } catch (e) { return null; }
  if (!Array.isArray(cards)) return null;
  var chunks = Math.ceil(text.length / LM_CHUNK);
  try {
    for (var k = 0; k < chunks; k++) cache.put('lmbase_' + k, text.slice(k * LM_CHUNK, (k + 1) * LM_CHUNK), 21600);
    cache.put('lmbase_n', String(chunks), 21600);
  } catch (e) { }
  return cards;
}

function lmIds(p, key) { var v = p.getProperty(key) || ''; var o = {}; v.split(',').forEach(function (x) { if (x) o[x] = 1; }); return o; }
function lmSaveIds(p, key, o) { p.setProperty(key, Object.keys(o).join(',')); }

function lmFix(c) {
  var o = {
    id: clip(c.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, ''), title: clip(c.title, 80), text: clip(c.text, 1800),
    tags: (Array.isArray(c.tags) ? c.tags : []).map(function (t) { return clip(t, 24).toLowerCase().replace(/[^a-z0-9-]/g, ''); }).filter(function (t) { return t; }).slice(0, 6),
    kw: (Array.isArray(c.kw) ? c.kw : []).map(function (t) { return clip(t, 30).toLowerCase(); }).filter(function (t) { return t; }).slice(0, 12),
    level: ['little', 'older', 'all'].indexOf(c.level) >= 0 ? c.level : 'all',
    source: clip(c.source, 100), ref: clip(c.ref, 100),
    links: (Array.isArray(c.links) ? c.links : []).map(function (t) { return clip(t, 40); }).filter(function (t) { return /^[A-Za-z0-9 .-]+$/.test(t); }).slice(0, 4),
    verse: c.verse && c.verse.text && c.verse.ref ? { text: clip(c.verse.text, 300), ref: clip(c.verse.ref, 50) } : null,
    verify: !!c.verify, url: /^https:\/\/(www\.)?st-takla\.org\//.test(String(c.url || '')) ? clip(c.url, 300) : ''
  };
  return o;
}
function lmPublic(c) {
  return { id: c.id, title: c.title, text: c.text, tags: c.tags, kw: c.kw, level: c.level, source: c.source, ref: c.ref, links: c.links || [], verse: c.verse || null, verify: !!c.verify, url: c.url || '', status: c.status, edited: !!c.edited, isnew: !!c.isnew };
}

/* every card with its status: base cards, then what a servant changed, then the cards a servant added */
function lumiAll(force) {
  var base = lmLoadBase(force);
  if (!base) return null;
  var p = PropertiesService.getScriptProperties(), ok = lmIds(p, 'lm_a'), no = lmIds(p, 'lm_r'), props = p.getProperties(), byId = {}, out = [];
  base.forEach(function (c) { byId[c.id] = c; });
  Object.keys(props).forEach(function (k) {
    if (k.indexOf('lmc_') !== 0) return;
    var c; try { c = JSON.parse(props[k]); } catch (e) { return; }
    c.edited = true;
    c.isnew = !byId[c.id] || !!c.isnew;
    byId[c.id] = c;
  });
  Object.keys(byId).forEach(function (id) {
    var c = Object.assign({}, byId[id]);
    c.status = ok[id] ? 'approved' : no[id] ? 'rejected' : 'pending';
    out.push(c);
  });
  return out;
}

function lumiPost(b, u) {
  var p = PropertiesService.getScriptProperties(), act = b.action;
  var staff = u.role !== 'student' && !u.req;
  if (act === 'lumi_ask') return lmAsk(b, u);
  if (act === 'lumi_learn') return lmLearn(b, u);
  if (act === 'lumi_hist') return lmHist(b, u, staff);
  if (act === 'lumi_fb') return lmFeedback(b, u);
  if (!staff) return { ok: false, error: 'denied' };
  if (act === 'lumi_alerts' || act === 'lumi_alert_seen') return lmAlerts(b, u);
  if (/^lumi_(gold_|report|cfg_)/.test(act)) return lmAdmin(b, u);
  if (act === 'lumi_refresh') { CacheService.getScriptCache().remove('lmbase_n'); var r = lumiAll(true); return r ? { ok: true, n: r.length } : { ok: false, error: 'nocards' }; }
  var all = lumiAll(false);
  if (!all) return { ok: false, error: 'nocards' };
  if (act === 'lumi_cards') {
    return { ok: true, cards: all.map(lmPublic), counts: lmCounts(all) };
  }
  if (act === 'lumi_review') {
    var ids = Array.isArray(b.ids) ? b.ids.slice(0, 200) : [b.cid], to = b.to;
    if (['approved', 'rejected', 'pending'].indexOf(to) < 0) return { ok: false, error: 'bad' };
    var known = {}; all.forEach(function (c) { known[c.id] = 1; });
    var ok = lmIds(p, 'lm_a'), no = lmIds(p, 'lm_r');
    ids.forEach(function (id) {
      if (!known[id]) return;
      delete ok[id]; delete no[id];
      if (to === 'approved') ok[id] = 1; else if (to === 'rejected') no[id] = 1;
    });
    lmSaveIds(p, 'lm_a', ok); lmSaveIds(p, 'lm_r', no);
    return { ok: true, counts: lmCounts(lumiAll(false)) };
  }
  if (act === 'lumi_save') {
    var c = lmFix(b.card || {});
    if (!c.title || c.text.split(' ').length < 8) return { ok: false, error: 'missing' };
    var exists = all.filter(function (x) { return x.id === c.id; })[0];
    if (!c.id || !exists) c.id = 'x-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8), c.isnew = true;
    else if (exists.isnew) c.isnew = true;
    if (JSON.stringify(c).length > 3500) return { ok: false, error: 'big' };
    p.setProperty('lmc_' + c.id, JSON.stringify(c));
    var ok2 = lmIds(p, 'lm_a'), no2 = lmIds(p, 'lm_r');
    delete ok2[c.id]; delete no2[c.id];
    lmSaveIds(p, 'lm_a', ok2); lmSaveIds(p, 'lm_r', no2);
    return { ok: true, id: c.id };
  }
  if (act === 'lumi_search') {
    var q = clip(b.q, 200), level = b.level === 'little' ? 'little' : 'older';
    return { ok: true, results: lumiSearch(all, q, level, 6, !b.all, 4).map(function (r) { return { id: r.id, title: r.title, score: r.score, status: r.status, level: r.level }; }) };
  }
  return { ok: false, error: 'bad' };
}
function lmCounts(all) {
  var o = { pending: 0, approved: 0, rejected: 0, verify: 0, total: all.length };
  all.forEach(function (c) { o[c.status]++; if (c.verify && c.status === 'pending') o.verify++; });
  return o;
}
