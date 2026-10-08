/* Heavenly Visions: Ask Lumi, Phase 3. THIRD FILE in the helper Apps Script project (name it lumi-ask), next to ai-helper.gs and lumi.gs.
   FREE: no AI model, no API key, no paid service. Lumi answers ONLY from approved cards, composed on the server from the card text.
   This is where a kid's question is answered. Everything is checked on the server:
   1. Safety words first (a worried child is always answered with care and a private alert is made for the servants).
   2. Limits (one question every 5 seconds, 20 a day per kid, 150 a day for everyone, all changeable in lm_cfg).
   3. A servant's GOLD answer if one matches (used word for word).
   4. Search the APPROVED cards only. No card found means Lumi says she does not know and the question is logged for the servants.
   5. The answer is the best card's own text, shortened for the child's age, with its verse, source chips and app links.
   Where things are stored (Script Properties of this project):
     lm_cfg  settings {on, perKid, perDay, grades}         lmt_<id> last question time           lmq_<id>_<day>, lmq_all_<day> daily counts
     lmh_<id> a kid's last 6 questions (short)             lma_<church> worry alerts (newest 25)   lmu_<yyyy-mm> unanswered questions
     lmr_<yyyy-mm> question counts (anonymous)             lmd_<yyyy-mm> answers marked thumbs down  lmg_<n> gold answers {q:[...], a:"...", v:{text,ref}}
   Script Properties hold about 500 KB in total. Everything above is kept small on purpose. */
var LM_MSG = {
  worry: "I'm really glad you told me. You are loved by God and by us. Please tell a grown-up you trust right now, like your mom, dad, servant or Abouna 💛",
  bad: "Let's use kind words together 🐑 I love talking about God and the Church. Want to ask me something about Jesus or the saints?",
  adult: "That is an important question, and it is best to talk about it with your mom, dad, servant or Abouna 🙏 I am here for questions about God and the Church.",
  unknown: "That's a great question! I don't know that one yet. Ask your servant or Abouna on Sunday 🙏",
  about: "I'm Lumi, a little lamb who loves talking about God and the Church! Your servants made me to help you learn. Ask me about Jesus, the saints, the feasts or the Bible 🐑",
  hello: "Hi friend! 🐑 I'm Lumi, a little lamb. You can ask me about Jesus, the saints, the feasts, the church and the Bible. What would you like to know?",
  off: "I'm a little lamb who loves talking about God and the Church! Want to know about one of these? 🐑",
  nap: "Lumi needs a nap 💤 Come back tomorrow!",
  slow: "One moment! Let me finish thinking 🐑",
  closed: "Lumi is resting right now 💤 Ask your servant or Abouna!"
};
var LM_BAD = /\b(fuck\w*|shit\w*|bitch\w*|asshole|dick|pussy|cunt|slut|whore|porn\w*|nigg\w*|retard\w*|stupid|idiot|moron|dumb|shut up|hate you)\b/i;
var LM_BAD_MASKED = /\bf[u*]{1,3}c?k\w*|\bs[h*]{1,2}[i*]t\b|\bb[i*]tch\w*/i;
/* sh1t, f**k, $hit: the common ways to hide a bad word */
function lmIsBad(q) {
  var plain = String(q).toLowerCase().replace(/[01345@$!7]/g, function (c) { return { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '@': 'a', '$': 's', '!': 'i', '7': 't' }[c]; });
  return LM_BAD.test(q) || LM_BAD.test(plain) || LM_BAD_MASKED.test(String(q).toLowerCase());
}
var LM_ADULT = /\b(sex\w*|naked|nude|rape\w*|condom|pregnan\w*|masturbat\w*)\b/i;
var LM_WORRY = [/\bkill (my ?self|me)\b/i, /\bsuicid\w*/i, /\bwant(ed)? to die\b/i, /\bwanna die\b/i, /\bhurt(ing)? (my ?self|me)\b/i, /\bcut(ting)? (my ?self|my (arm|wrist)s?)\b/i,
  /\bend my life\b/i, /\bhate my ?self\b/i, /\b(nobody|no one) (loves|likes|cares about) me\b/i, /\bbull(y|ied|ies|ying)\b/i, /\b(hits|hit|beats|beat|hurts|slaps) me\b/i,
  /\babus(e|ed|ing)\b/i, /\btouch(ed|es|ing)? me\b/i, /\bnot safe\b/i, /\bunsafe\b/i, /\brun(ning)? away\b/i, /\b(i am|i'm|im|i feel|feel(ing)?) (so |very |really )?(sad|lonely|alone|depressed|hopeless)\b/i,
  /\beveryone hates me\b/i, /\bi have no friends\b/i, /\bno friends\b/i, /\bwant to disappear\b/i, /\bscared (to go )?home\b/i, /\bafraid (of|to go) (my )?(dad|mom|home|house)\b/i,
  /\b(mean|nasty|cruel) to me\b/i, /\bmake(s)? fun of me\b/i, /\blaugh(s|ed)? at me\b/i, /\bnobody (plays|talks) (with|to) me\b/i, /\bcry(ing)? (every|all)\b/i, /\bi (am|'m) (so )?scared\b/i, /\bbeing hurt\b/i, /\bhurts? (a lot|so much)\b/i];
var LM_SENSITIVE = /\b(never heard (of|about) (jesus|god|christ)|(people|those) who (never|do not|don't|dont) (know|believe|hear)|non.?christians?|unbaptized|who goes to hell|died|dies|dead|death|funeral|passed away|hell|punish\w*|nightmare\w*|scary dream\w*|devil|demon\w*|satan\w*|ghost\w*|end of the world|world (will )?ends?|ends? of (the )?world|doomsday|apocalypse|(when|if|after) (we|i|you|people) die|after death|going to die|will i die|am i going to die|divorce\w*|fighting|parents fight\w*|islam\w*|muslim\w*|buddh\w*|hindu\w*|jewish|judaism|atheis\w*|catholic\w*|protestant\w*)\b/i;
var LM_FAMILY = /\b(died|dies|dead|death|funeral|passed away|(when|if|after) (we|i|you|people) die|after death|going to die|will i die|divorce\w*|fighting|parents fight\w*)\b/i;
var LM_ABOUT = /\b(your name|who are you|what are you|who (made|created|built) you|how old are you|are you (real|alive|a robot|a lamb|a person|human|an? ai)|why are you a lamb|why is lumi a lamb|what is lumi|who is lumi)\b/i;
var LM_HELLO = /^(hi|hello|hey|hiya|good (morning|afternoon|evening|night)|bye|goodbye|see you( later)?|thanks?|thank you|help|help me|what can you do|what can i ask( you)?|you are (funny|nice|cool|great|smart)|i love you( lumi)?|i like you)( lumi)?s*[.!?]*$/i;
var LM_TRICK = /\b(ignore (all |any )?(your |the |previous |these )?(rules|instructions)|system prompt|you are now|pretend (you are|to be|you're)|repeat after me|jailbreak|act as (a|an)|forget (your|all|the) (rules|instructions)|developer mode)\b/i;
var LM_GENERIC = { kid: 1, child: 1, best: 1, good: 1, bad: 1, big: 1, game: 1, video: 1, people: 1, thing: 1, day: 1, time: 1, like: 1, love: 1, make: 1, new: 1, old: 1, help: 1, little: 1 };

function lmNow() { return Date.now(); }
function lmCfg(p) {
  var c = {}; try { c = JSON.parse(p.getProperty('lm_cfg') || '{}'); } catch (e) { }
  return { on: c.on !== false, perKid: Number(c.perKid) > 0 ? Number(c.perKid) : 20, perDay: Number(c.perDay) > 0 ? Number(c.perDay) : 150, grades: Array.isArray(c.grades) ? c.grades : [] };
}
function lmLevel(u) {
  if (u.role !== 'student') return 'older';
  return ['Pre K', 'KG', 'Grade 1', 'Grade 2'].indexOf(u.grade) >= 0 ? 'little' : 'older';
}
function lmClean(q) { return String(q === undefined || q === null ? '' : q).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200); }
function lmDash(t) { return String(t).replace(/[–—]/g, ', ').replace(/https?:\/\/\S+/g, '').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim(); }
function lmCap(text, level) {
  var max = level === 'little' ? 70 : 170, ws = String(text).split(/\s+/);
  if (ws.length <= max) return text;
  var cut = ws.slice(0, max).join(' '), i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return i > 20 ? cut.slice(0, i + 1) : cut + '.';
}
function lmLabel(c) {
  var s = c.source || '';
  return s.indexOf('Bible') === 0 ? '📖 ' + (c.ref || 'Bible') : s.indexOf('St-Takla') === 0 ? '📚 St-Takla.org' : /Synaxarium/.test(s) ? '📜 Synaxarium' : /app content/.test(s) ? '🏠 Our lessons' : '⛪ Church teaching';
}
function lmMonth() { return today().slice(0, 7); }

/* counters per day. Old counters are removed when the day changes. */
function lmPurge(p, day) {
  if (p.getProperty('lm_day') === day) return;
  Object.keys(p.getProperties()).forEach(function (k) { if ((k.indexOf('lmq_') === 0 && k.slice(-10) !== day) || k.indexOf('lmt_') === 0) p.deleteProperty(k); });
  p.setProperty('lm_day', day);
}
function lmReply(r, extra) {
  var o = { ok: true, answer: r.answer, verse: r.verse || null, sources: r.sources || [], links: r.links || [], mood: r.mood || 'happy', followups: r.followups || [], ts: lmNow() };
  if (extra) for (var k in extra) o[k] = extra[k];
  return o;
}
function lmBlocked(kind, msg, mood) { return { ok: true, blocked: kind, answer: msg, mood: mood, sources: [], links: [], followups: [], verse: null, ts: lmNow() }; }
function lmPickTitles(all, n, seed) {
  var ap = all.filter(function (c) { return c.status === 'approved'; });
  if (!ap.length) return [];
  var out = [], i = Math.abs(seed || 0) % ap.length;
  for (var t = 0; t < ap.length && out.length < n; t++, i += 7) { var title = ap[i % ap.length].title; if (out.indexOf(title) < 0) out.push(title); }
  return out;
}

/* ---------- small stores ---------- */
function lmJson(p, k, d) { try { var v = p.getProperty(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lmSaveCapped(p, k, list) { while (JSON.stringify(list).length > 8600 && list.length > 1) list.pop(); p.setProperty(k, JSON.stringify(list)); }
function lmHistAdd(p, u, q, a, ids) {
  var k = 'lmh_' + u.id, h = lmJson(p, k, null) || { e: [] };
  h.g = u.grade || ''; h.c = u.church || ''; h.n = clip(u.name, 40);
  h.e.unshift({ q: clip(q, 90), a: clip(a, 120), ts: lmNow(), s: ids.slice(0, 3) });
  h.e = h.e.slice(0, 6);
  p.setProperty(k, JSON.stringify(h));
}
function lmUnanswered(p, q) {
  var k = 'lmu_' + lmMonth(), list = lmJson(p, k, []), key = lmWords(q).sort().join(' ');
  var hit = list.filter(function (x) { return x.k === key; })[0];
  if (hit) { hit.n++; hit.d = today(); } else list.unshift({ k: key, q: clip(q, 90), n: 1, d: today() });
  lmSaveCapped(p, k, list);
}
function lmCount(p, q, un) {
  var k = 'lmr_' + lmMonth(), list = lmJson(p, k, []), key = lmWords(q).sort().join(' ');
  if (!key) return;
  var hit = list.filter(function (x) { return x.k === key; })[0];
  if (un) { if (!hit) return; hit.u = (hit.u || 0) + 1; }   /* an unanswered question was already counted when it was asked */
  else if (hit) hit.n++; else list.push({ k: key, q: clip(q, 70), n: 1, u: 0, dn: 0 });
  list.sort(function (x, y) { return y.n - x.n; });
  lmSaveCapped(p, k, list);
}
function lmAlertAdd(p, u, q) {
  var k = 'lma_' + (u.church || ''), list = lmJson(p, k, []);
  list.unshift({ id: Utilities.getUuid().replace(/-/g, '').slice(0, 8), kid: u.id, kn: clip(u.name, 40), gr: u.grade || '', q: clip(q, 200), ts: lmNow(), seen: 0, note: '' });
  lmSaveCapped(p, k, list);
}

/* ---------- gold answers: a servant wrote the official answer for a question ---------- */
function lmGold(p, q) {
  var K = {}; lmWords(q).forEach(function (w) { K[w] = 1; });
  var kn = Object.keys(K).length; if (!kn) return null;
  var keys = Object.keys(p.getProperties()).filter(function (k) { return k.indexOf('lmg_') === 0; });
  for (var i = 0; i < keys.length; i++) {
    var g = lmJson(p, keys[i], null); if (!g || !g.a || !Array.isArray(g.q)) continue;
    for (var j = 0; j < g.q.length; j++) {
      var G = lmWords(g.q[j]); if (!G.length) continue;
      if (G.every(function (w) { return K[w]; }) && kn <= G.length + 2) return g;
    }
  }
  return null;
}

/* ---------- the answer: the best card, shortened for the child's age ---------- */
function lmSentences(t) {
  var s = String(t).trim().replace(/\b(St|Dr|Fr|Mr|Mrs)\./g, '$1\u0001'), m = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s];
  return m.map(function (x) { return x.replace(/\u0001/g, '.'); });
}
function lmCompose(card, level, sensitive, deep) {
  var sn = lmSentences(card.text), n = deep ? 14 : sensitive ? 2 : level === 'little' ? 3 : 7;
  var text = deep ? lmDash(sn.slice(0, n).join('').trim()) : lmCap(lmDash(sn.slice(0, n).join('').trim()), level);
  if (sensitive) text += ' It is also good to talk about this with a servant, Abouna or your parents 🙏';
  else if (level === 'older' && card.tags.indexOf('bible') >= 0 && !(card.links || []).some(function (r) { return /^b-/.test(r); })) text += ' Can you find this story in your Bible? 📖';
  var mood = sensitive ? 'gentle' : card.tags.indexOf('prayer') >= 0 ? 'praying' : (card.tags.indexOf('martyr') >= 0 || card.tags.indexOf('sacrament') >= 0 || card.tags.indexOf('fast') >= 0) ? 'gentle' : 'happy';
  return { answer: text, verse: level !== 'little' && card.verse && card.verse.text ? { text: card.verse.text, ref: card.verse.ref } : null, mood: mood };
}

/* ---------- ask ---------- */
function lmAsk(b, u) {
  var p = PropertiesService.getScriptProperties(), q = lmClean(b.q), level = lmLevel(u), cfg = lmCfg(p), day = today(), now = lmNow();
  var deep = !!b.deep && u.role !== 'student' && !u.req;   /* servant mode: longer answers with references, for lesson preparation */
  if (!q) return { ok: false, error: 'missing' };
  if (!cfg.on && !deep) return lmBlocked('closed', LM_MSG.closed, 'gentle');
  if (cfg.on && cfg.grades.length && u.role === 'student' && cfg.grades.indexOf(u.grade) < 0) return lmBlocked('closed', LM_MSG.closed, 'gentle');
  /* worry first: a child who needs help is never turned away by a limit */
  if (LM_WORRY.some(function (re) { return re.test(q); })) {
    lmAlertAdd(p, u, q); lmHistAdd(p, u, q, LM_MSG.worry, []);
    return lmReply({ answer: LM_MSG.worry, mood: 'gentle' }, { safety: 'worry' });
  }
  lmPurge(p, day);
  var all = lumiAll(false);
  if (!all) return { ok: false, error: 'nocards' };
  var kq = 'lmq_' + u.id + '_' + day, ka = 'lmq_all_' + day, tk = 'lmt_' + u.id;
  var mine = Number(p.getProperty(kq) || 0), total = Number(p.getProperty(ka) || 0), last = Number(p.getProperty(tk) || 0);
  if (now - last < 5000) return lmBlocked('slow', LM_MSG.slow, 'thinking');
  var staffUser = u.role !== 'student' && !u.req;   /* servants and Abouna test Lumi a lot, so they get a bigger limit */
  if (mine >= (deep || staffUser ? Math.max(cfg.perKid, 100) : cfg.perKid) || (total >= cfg.perDay && !deep && !staffUser)) return lmBlocked('nap', LM_MSG.nap, 'gentle');
  p.setProperty(tk, String(now)); p.setProperty(kq, String(mine + 1)); p.setProperty(ka, String(total + 1));
  var seed = q.length + now % 97;
  if (lmIsBad(q)) return lmReply({ answer: LM_MSG.bad, mood: 'gentle', followups: lmPickTitles(all, 3, seed) }, { safety: 'bad' });
  if (LM_ADULT.test(q)) { lmHistAdd(p, u, q, LM_MSG.adult, []); return lmReply({ answer: LM_MSG.adult, mood: 'gentle' }, { safety: 'adult' }); }
  if (LM_TRICK.test(q)) return lmReply({ answer: LM_MSG.off, mood: 'happy', followups: lmPickTitles(all, 3, seed) }, { safety: 'offtopic' });
  if (LM_HELLO.test(q.trim())) return lmReply({ answer: LM_MSG.hello, mood: 'happy', followups: lmPickTitles(all, 3, seed) }, { safety: 'ok' });
  if (LM_ABOUT.test(q)) return lmReply({ answer: LM_MSG.about, mood: 'happy', followups: lmPickTitles(all, 3, seed) }, { safety: 'ok' });
  var sensitive = LM_SENSITIVE.test(q);
  /* family loss and family trouble are for a grown-up, not for a card */
  if (LM_FAMILY.test(q) && !/\b(jesus|christ|cross|lord|saint|martyr)\b/i.test(q)) { lmHistAdd(p, u, q, LM_MSG.adult, []); return lmReply({ answer: LM_MSG.adult, mood: 'gentle' }, { safety: 'sensitive' }); }
  lmCount(p, q, false);
  var gold = lmGold(p, q);
  if (gold) {
    lmHistAdd(p, u, q, gold.a, []);
    return lmReply({ answer: lmDash(gold.a), verse: gold.v && gold.v.text ? gold.v : null, sources: [{ id: 'gold', title: 'Servant answer', label: '⭐ From your servants' }], mood: 'happy' }, { gold: true });
  }
  var hits = lumiSearch(all, q, level, 5, true, 4);
  /* a name or word that no card knows (and only a weak match) means Lumi does not know, she does not guess */
  if (hits.length && lmLastUnknown.length && lmWords(q).length <= 5 && hits[0].score < 25 && !deep) hits = [];
  if (!hits.length) {
    if (sensitive) { lmHistAdd(p, u, q, LM_MSG.adult, []); lmUnanswered(p, q); return lmReply({ answer: LM_MSG.adult, mood: 'gentle' }, { safety: 'sensitive' }); }
    var vocab = lmQuery(q), idx = lmSynIndex();
    var churchy = /\b(st|saint|anba|abouna|pope|coptic|orthodox|church|jesus|christ|god|bible|lord|priest|angel|mary)\b/i.test(q) || vocab.main.some(function (w) { return !LM_GENERIC[w] && !/^[0-9]+$/.test(w) && (idx[w] || all.some(function (c) { var ix = lmIndex(c); return lmHas(ix.kw, w) || lmHas(ix.tags, w); })); });
    if (churchy) { lmUnanswered(p, q); lmCount(p, q, true); lmHistAdd(p, u, q, LM_MSG.unknown, []); return lmReply({ answer: LM_MSG.unknown, mood: 'gentle' }, { unknown: true }); }
    lmHistAdd(p, u, q, LM_MSG.off, []);
    return lmReply({ answer: LM_MSG.off, mood: 'happy', followups: lmPickTitles(all, 3, seed) }, { safety: 'offtopic' });
  }
  if (sensitive && hits[0].score < 30 && !deep) { lmHistAdd(p, u, q, LM_MSG.adult, []); lmUnanswered(p, q); return lmReply({ answer: LM_MSG.adult, mood: 'gentle' }, { safety: 'sensitive' }); }
  var top = hits[0], card = all.filter(function (c) { return c.id === top.id; })[0], ans = lmCompose(card, level, sensitive, deep);
  var close = hits.filter(function (h, i) { return i === 0 || h.score >= top.score * 0.75; }).slice(0, deep ? 3 : 2).map(function (h) { return all.filter(function (c) { return c.id === h.id; })[0]; });
  var sources = close.map(function (c) { return { id: c.id, title: c.title, label: lmLabel(c) }; }).filter(function (x, i, arr) { return arr.map(function (y) { return y.label; }).indexOf(x.label) === i; });
  lmHistAdd(p, u, q, ans.answer, close.map(function (c) { return c.id; }));
  var extra = { safety: sensitive ? 'sensitive' : 'ok', videos: (card.videos || []).slice(0, 2) };
  if (deep) {
    extra.deep = true;
    extra.refs = close.filter(function (c) { return c.ref; }).map(function (c) { return { title: c.title, ref: c.ref }; });
    extra.urls = close.filter(function (c) { return c.url; }).map(function (c) { return { title: c.title, url: c.url }; });
    extra.more = lmRelated(all, card);
  }
  return lmReply({ answer: ans.answer, verse: ans.verse, sources: sources, links: (card.links || []).slice(0, 2), mood: ans.mood, followups: lmRelated(all, card) }, extra);
}
function lmRelated(all, card) {
  if (!card) return [];
  var shared = function (c) { return c.tags.filter(function (t) { return card.tags.indexOf(t) >= 0; }).length; };
  return all.filter(function (c) { return c.status === 'approved' && c.id !== card.id && shared(c) > 0; }).sort(function (a, b) { return shared(b) - shared(a); }).slice(0, 3).map(function (c) { return c.title; });
}

/* ---------- a kid's own history, or a servant looking at a kid in their care ---------- */
function lmCanSee(me, h) {
  if (me.role === 'master') return true;
  if (me.role === 'priest' || me.role === 'coordinator') return me.church === h.c;
  if (me.role === 'servant') return me.church === h.c && me.grade === h.g;
  return false;
}
function lmHist(b, u, staff) {
  var p = PropertiesService.getScriptProperties(), id = b.kid && staff ? clip(b.kid, 40) : u.id;
  if (b.kid && !staff && b.kid !== u.id) return { ok: false, error: 'denied' };
  var h = lmJson(p, 'lmh_' + id, null);
  if (!h) return { ok: true, items: [], kid: { id: id } };
  if (id !== u.id && !lmCanSee(u, h)) return { ok: false, error: 'denied' };
  return { ok: true, items: h.e, kid: { id: id, name: h.n, grade: h.g } };
}
function lmFeedback(b, u) {
  var p = PropertiesService.getScriptProperties(), h = lmJson(p, 'lmh_' + u.id, null), v = b.v === 'down' ? 'down' : b.v === 'up' ? 'up' : '';
  if (!h || !v) return { ok: true };
  var e = h.e.filter(function (x) { return x.ts === Number(b.ts); })[0];
  if (!e || e.f === v) return { ok: true };
  e.f = v; p.setProperty('lmh_' + u.id, JSON.stringify(h));
  if (v === 'down') {
    var k = 'lmd_' + lmMonth(), list = lmJson(p, k, []);
    list.unshift({ q: e.q, a: e.a, s: e.s, ts: e.ts, g: h.g, c: h.c });
    lmSaveCapped(p, k, list);
    var rk = 'lmr_' + lmMonth(), rl = lmJson(p, rk, []), key = lmWords(e.q).sort().join(' '), hit = rl.filter(function (x) { return x.k === key; })[0];
    if (hit) { hit.dn = (hit.dn || 0) + 1; lmSaveCapped(p, rk, rl); }
  }
  return { ok: true };
}

/* ---------- worry alerts for servants (the screen comes in Phase 5) ---------- */
function lmAlerts(b, u) {
  var p = PropertiesService.getScriptProperties(), k = 'lma_' + (u.church || ''), list = lmJson(p, k, []);
  var mine = function (a) { return u.role === 'master' || u.role === 'priest' || u.role === 'coordinator' || a.gr === u.grade; };
  if (b.action === 'lumi_alert_seen') {
    var a = list.filter(function (x) { return x.id === b.aid; })[0];
    if (!a || !mine(a)) return { ok: false, error: 'denied' };
    a.seen = 1; a.note = clip(b.note, 200); a.by = clip(u.name, 40); p.setProperty(k, JSON.stringify(list));
    return { ok: true };
  }
  return { ok: true, items: list.filter(mine), church: u.church };
}
