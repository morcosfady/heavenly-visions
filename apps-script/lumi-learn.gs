/* Heavenly Visions: Ask Lumi, Phase 4 (learning modes). FOURTH FILE in the helper Apps Script project (name it lumi-learn).
   FREE: no AI. Everything is built on the server from APPROVED cards only, so a mode can only teach what a servant approved.
   Action lumi_learn with mode:
     quiz     {topic}   5 multiple choice questions (the question is the card title, the right answer is the card's first sentence)
     saints   {}        5 rounds of "Guess the saint" (clues come from the saint card with the name hidden, 4 saint names to pick from)
     stories  {}        the list of stories a kid can pick (approved Bible and saint cards)
     story    {sid}     one story as short pages, with a tiny question at the end
     words    {}        church words and what they mean (approved word cards)
     tour     {}        the church tour, stop by stop (approved church cards, in walking order)
   Stars are given by the app itself (the existing quiz and bible rules with their daily caps), not here. */
var LM_TOUR = [['church-door-nave', 'door', 'The door and the nave'], ['church-icons', 'icons', 'The icons'], ['church-candles', 'candles', 'The candles'], ['church-iconostasis', 'iconostasis', 'The iconostasis'],
  ['church-haykal', 'haykal', 'The Haykal'], ['church-altar', 'altar', 'The altar'], ['church-incense', 'incense', 'The incense'], ['church-domes-cross', 'dome', 'The domes and the cross']];
var LM_TOPICS = { saints: ['saint-'], feasts: ['feast-', 'fast-'], church: ['church-', 'sac-', 'faith-', 'hist-'], bible: ['bible-', 'virtue-'], words: ['word-', 'pray-'], all: [''] };

function lmShuffle(a) { var r = a.slice(), i, j, t; for (i = r.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
function lmApproved(all) { return all.filter(function (c) { return c.status === 'approved'; }); }
function lmPool(all, topic) {
  var pre = LM_TOPICS[topic] || LM_TOPICS.all;
  return lmApproved(all).filter(function (c) { return pre.some(function (p) { return c.id.indexOf(p) === 0; }); });
}
function lmSent(card) { return lmSentences(card.text).map(function (s) { return s.trim(); }).filter(function (s) { return s.split(' ').length >= 4; }); }
function lmFirstSentence(card, level) {
  var sn = lmSent(card); if (!sn.length) return '';
  var s = sn[0];
  if (level === 'little' && sn.length > 1 && sn[1].length < s.length) s = sn[1];
  return lmDash(clip(s, 150));
}
function lmKeys(title) {
  var stop = { who: 1, what: 1, why: 1, how: 1, the: 1, and: 1, does: 1, mean: 1, this: 1, that: 1, with: 1, have: 1, for: 1, are: 1, was: 1, our: 1, use: 1 };
  return lmNorm(title).split(' ').filter(function (w) { return w.length >= 4 && !stop[w]; }).map(lmStem);
}
function lmQuestionText(card) { var t = card.title.trim(); return /\?$/.test(t) ? t : 'Which sentence tells about "' + t.replace(/[?]/g, '') + '"?'; }

function lmQuiz(all, topic, level) {
  var pool = lmPool(all, topic), wide = lmApproved(all);
  if (pool.length < 4) { if (topic === 'all' || wide.length < 4) return null; pool = wide; }
  var pref = pool.filter(function (c) { return c.level === 'all' || c.level === level; });
  var pick = lmShuffle(pref.length >= 5 ? pref : pool).slice(0, 5), items = [];
  pick.forEach(function (card) {
    var right = lmFirstSentence(card, level); if (!right) return;
    var keys = lmKeys(card.title), seen = {};
    seen[right] = 1;
    var others = lmShuffle(pool.length >= 8 ? pool : wide).filter(function (c) { return c.id !== card.id; }), wrong = [];
    for (var i = 0; i < others.length && wrong.length < 3; i++) {
      var s = lmFirstSentence(others[i], level);
      if (!s || seen[s]) continue;
      var sw = lmWords(s);
      if (keys.some(function (k) { return sw.indexOf(k) >= 0; })) continue;
      seen[s] = 1; wrong.push(s);
    }
    if (wrong.length < 3) return;
    var opts = lmShuffle([right].concat(wrong)), sn = lmSent(card);
    items.push({ id: card.id, q: lmQuestionText(card), opts: opts, ok: opts.indexOf(right), why: lmDash(clip(sn[1] || sn[0], 160)) });
  });
  return items.length ? { ok: true, mode: 'quiz', topic: topic, items: items } : null;
}

function lmSaintName(title) { return title.replace(/^Who (is|are|was) /i, '').replace(/\?$/, '').trim(); }
function lmSaints(all, level) {
  var pool = lmPool(all, 'saints').filter(function (c) { return c.id.indexOf('martyrs') < 0; }); if (pool.length < 4) return null;
  var rounds = [];
  lmShuffle(pool).some(function (card) {
    var name = lmSaintName(card.title), toks = name.split(/[\s.]+/).filter(function (w) { return w.length >= 3 && !/^(saint|pope|archangel|the|anba|and|of)$/i.test(w); });
    var mask = function (s) {
      var out = s;
      toks.forEach(function (tk) { out = out.replace(new RegExp('\\b' + tk.replace(/[^A-Za-z]/g, '') + '\\b', 'gi'), 'this saint'); });
      out = out.replace(/(?:The\s+)?(?:(?:Pope|Archangel|Anba|Abba|St\.?|Saint)\s+)?this saint(?:\s+(?:the|of|in)?\s*this saint)*/gi, 'this saint').replace(/this saint (?:I|II|III|IV|V|VI)\b/g, 'this saint');
      return out.charAt(0).toUpperCase() + out.slice(1);
    };
    var clues = lmSent(card).slice(0, 6).map(function (s) { return lmDash(clip(mask(s), 150)); }).filter(function (s, i, a) { return a.indexOf(s) === i; }).slice(0, 4);
    if (clues.length < 2) return false;
    var others = lmShuffle(pool).filter(function (c) { return c.id !== card.id; }).slice(0, 3).map(function (c) { return lmSaintName(c.title); });
    var opts = lmShuffle([name].concat(others));
    rounds.push({ id: card.id, clues: clues, opts: opts, ok: opts.indexOf(name), name: name });
    return rounds.length >= 5;
  });
  return rounds.length >= 3 ? { ok: true, mode: 'saints', rounds: rounds } : null;
}

function lmStoryList(all) {
  var list = lmApproved(all).filter(function (c) { return /^(bible-|saint-)/.test(c.id); });
  return { ok: true, mode: 'stories', items: list.map(function (c) { return { id: c.id, title: c.title, kind: c.id.indexOf('saint-') === 0 ? 'saint' : 'bible' }; }) };
}
function lmStory(all, id, level) {
  var card = lmApproved(all).filter(function (c) { return c.id === id && /^(bible-|saint-)/.test(c.id); })[0];
  if (!card) return { ok: false, error: 'none' };
  var sn = lmSentences(card.text).map(function (s) { return lmDash(s.trim()); }).filter(Boolean), per = level === 'little' ? 1 : 2, pages = [];
  for (var i = 0; i < sn.length && pages.length < (level === 'little' ? 14 : 8); i += per) pages.push(sn.slice(i, i + per).join(' '));
  var ask = card.id.indexOf('bible-') === 0 ? 'Can you find this story in your Bible? 📖' : 'What do you think was the bravest thing in this story? 🐑';
  return { ok: true, mode: 'story', id: card.id, title: card.title, kind: card.id.indexOf('saint-') === 0 ? 'saint' : 'bible', pages: pages, ask: ask, ref: card.ref || '', verse: level !== 'little' && card.verse ? card.verse : null,
    links: (card.links || []).slice(0, 2), label: lmLabel(card) };
}

function lmWordOf(title) { var m = title.match(/^What (?:does|is) (?:the )?(?:word )?(.+?)(?: mean)?\?$/i); return (m ? m[1] : title.replace(/\?$/, '')).replace(/^the /i, ''); }
function lmWords4(all, level) {
  var list = lmApproved(all).filter(function (c) { return c.id.indexOf('word-') === 0; });
  return { ok: true, mode: 'words', items: list.map(function (c) { return { id: c.id, word: lmWordOf(c.title), text: lmCap(lmDash(lmSentences(c.text).slice(0, level === 'little' ? 3 : 5).join('').trim()), level), label: lmLabel(c) }; }) };
}

function lmTour(all, level) {
  var byId = {}; lmApproved(all).forEach(function (c) { byId[c.id] = c; });
  var stops = LM_TOUR.filter(function (t) { return byId[t[0]]; }).map(function (t) {
    var c = byId[t[0]];
    return { id: c.id, spot: t[1], name: t[2], text: lmCap(lmDash(lmSentences(c.text).slice(0, level === 'little' ? 3 : 5).join('').trim()), level), label: lmLabel(c), links: (c.links || []).slice(0, 1) };
  });
  return stops.length >= 3 ? { ok: true, mode: 'tour', stops: stops } : null;
}

function lmLearn(b, u) {
  var level = lmLevel(u), all = lumiAll(false), mode = String(b.mode || ''), r;
  if (!all) return { ok: false, error: 'nocards' };
  var cfg = lmCfg(PropertiesService.getScriptProperties());
  if (!cfg.on || (cfg.grades.length && u.role === 'student' && cfg.grades.indexOf(u.grade) < 0)) return { ok: true, blocked: 'closed' };
  if (mode === 'quiz') { var topic = LM_TOPICS[b.topic] ? b.topic : 'all'; r = lmQuiz(all, topic, level); }
  else if (mode === 'saints') r = lmSaints(all, level);
  else if (mode === 'stories') return lmStoryList(all);
  else if (mode === 'story') return lmStory(all, clip(b.sid, 60), level);
  else if (mode === 'words') r = lmWords4(all, level);
  else if (mode === 'tour') r = lmTour(all, level);
  else return { ok: false, error: 'bad' };
  if (r && r.items && !r.items.length) r = null;
  return r || { ok: false, error: 'few' };
}
