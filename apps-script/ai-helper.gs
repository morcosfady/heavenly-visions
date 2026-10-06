/* Heavenly Visions AI Lesson Helper (Google Apps Script, its OWN project, separate from the games backend).
   Why separate: it needs permission to call the internet (UrlFetchApp). Keeping it apart means the live games backend never changes its permissions.
   Setup (once, by the app owner):
   1. script.google.com, New project, paste this file.
   2. Project Settings, Script Properties, add  ANTHROPIC_KEY  with your Anthropic API key. The key lives ONLY here.
   3. Set MAIN_URL below to the games backend web app URL (the one in index.html as GAMES_URL).
   4. Deploy, New deployment, Web app, Execute as: Me, Who has access: Anyone. Approve the permission screen.
   5. Paste the new web app URL into AI_URL at the top of aihelper.js in the app, then push.
   Checks on every request: the caller must be an approved servant, coordinator, priest or master (asked from the games backend),
   and has a daily limit per person and a daily limit for everyone. Nothing is stored except those two counters.
   Ask Lumi: the second file lumi.gs (same project) handles the actions that start with lumi_ (see lumi.gs). */
var MAIN_URL = 'CHANGE_ME';
var MODEL = 'claude-haiku-4-5-20251001';
var PER_USER_PER_DAY = 8;
var ALL_PER_DAY = 60;
var MAX_TEXT = 3000;

var KINDS = {
  kahoot: { label: 'Kahoot quiz questions', def: 6, max: 12 },
  whoami: { label: 'Who Am I characters', def: 3, max: 6 },
  order: { label: 'Story order events', def: 5, max: 8 },
  verse: { label: 'Memory verses', def: 2, max: 4 },
  wordsearch: { label: 'Word search words', def: 8, max: 12 },
  match: { label: 'Matching pairs', def: 6, max: 10 },
  hangman: { label: 'Guess the word words', def: 6, max: 12 },
  crossword: { label: 'Crossword words with clues', def: 7, max: 12 },
  wheel: { label: 'Wheel questions', def: 8, max: 16 },
  jeopardy: { label: 'Jeopardy categories', def: 1, max: 3 }
};

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function today() { return Utilities.formatDate(new Date(), 'America/Chicago', 'yyyy-MM-dd'); }

function who(b, allowStudent) {
  var r = UrlFetchApp.fetch(MAIN_URL, { method: 'post', contentType: 'text/plain', payload: JSON.stringify({ action: 'me', id: b.id, token: b.token }), muteHttpExceptions: true });
  var j;
  try { j = JSON.parse(r.getContentText()); } catch (e) { return null; }
  if (!j || !j.ok || !j.user) return null;
  var u = j.user;
  if (!allowStudent && (u.role === 'student' || u.req)) return null;
  return u;
}

function clip(v, n) { return String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }

/* keep only the fields the Game Builder knows, with sane lengths */
function clean(kind, it) {
  it = it || {};
  if (kind === 'kahoot') {
    var ok = ['a', 'b', 'c', 'd'].indexOf(it.ok) >= 0 ? it.ok : 'a';
    var o = { q: clip(it.q, 160), a: clip(it.a, 60), b: clip(it.b, 60), c: clip(it.c, 60), d: clip(it.d, 60), ok: ok };
    return o.q && o.a && o.b && o[ok] ? o : null;
  }
  if (kind === 'whoami') {
    var clues = (Array.isArray(it.clues) ? it.clues : String(it.clues || '').split('\n')).map(function (c) { return clip(c, 120); }).filter(function (c) { return c; }).slice(0, 6);
    return it.ans && clues.length >= 2 ? { ans: clip(it.ans, 40), clues: clues.join('\n') } : null;
  }
  if (kind === 'order') return it.text ? { text: clip(it.text, 120) } : null;
  if (kind === 'verse') return it.text ? { text: clip(it.text, 220), ref: clip(it.ref, 40) } : null;
  if (kind === 'wordsearch' || kind === 'hangman') { var w = clip(it.w, 12).replace(/[^A-Za-z ]/g, ''); return w.replace(/ /g, '').length >= 3 ? { w: w.toUpperCase(), hint: clip(it.hint, 80) } : null; }
  if (kind === 'crossword') { var cw = clip(it.w, 12).replace(/[^A-Za-z]/g, ''); return cw.length >= 3 && it.clue ? { w: cw.toUpperCase(), clue: clip(it.clue, 100) } : null; }
  if (kind === 'match') return it.l && it.r ? { l: clip(it.l, 40), r: clip(it.r, 40) } : null;
  if (kind === 'wheel') return it.text ? { text: clip(it.text, 120), ans: clip(it.ans, 60) } : null;
  if (kind === 'jeopardy') {
    var o2 = { name: clip(it.name, 40) };
    [100, 200, 300, 400, 500].forEach(function (p) { o2['q' + p] = clip(it['q' + p], 140); o2['a' + p] = clip(it['a' + p], 60); });
    return o2.name && o2.q100 && o2.a100 ? o2 : null;
  }
  return null;
}

function prompt(b, wanted) {
  var system = 'You write Sunday School game content for a Coptic Orthodox church. Be theologically careful and faithful to Orthodox teaching. ' +
    'Use only facts you are sure of from the Bible and well known saints. If the teacher pasted lesson text, use ONLY that text and the Bible. Never invent miracles, dates or quotes. ' +
    'Keep everything age appropriate, kind and simple for the age given. Prefer Bible references. Do not mention politics or other denominations. ' +
    'Reply with ONE JSON object and nothing else, no markdown, no comments.';
  var spec = wanted.map(function (w) { return '- ' + w.kind + ': ' + w.n + ' items (' + KINDS[w.kind].label + ')'; }).join('\n');
  var shapes = '{"games":[{"t":"kahoot","title":"...","items":[{"q":"...","a":"...","b":"...","c":"...","d":"...","ok":"a"}]},' +
    '{"t":"whoami","title":"...","items":[{"ans":"...","clues":["hardest clue","...","easiest clue"]}]},' +
    '{"t":"order","title":"...","items":[{"text":"first event"},{"text":"second event"}]},' +
    '{"t":"verse","title":"...","items":[{"text":"The Lord is my *shepherd*; I shall not *want*.","ref":"Psalm 23:1"}]},' +
    '{"t":"wordsearch","title":"...","items":[{"w":"ARK","hint":"..."}]},{"t":"hangman","title":"...","items":[{"w":"NOAH","hint":"..."}]},' +
    '{"t":"crossword","title":"...","items":[{"w":"NOAH","clue":"..."}]},{"t":"match","title":"...","items":[{"l":"...","r":"..."}]},' +
    '{"t":"wheel","title":"...","items":[{"text":"question","ans":"answer"}]},' +
    '{"t":"jeopardy","title":"...","items":[{"name":"Category","q100":"...","a100":"...","q200":"...","a200":"...","q300":"...","a300":"...","q400":"...","a400":"...","q500":"...","a500":"..."}]}]}';
  var user = 'Topic: ' + clip(b.topic, 120) + '\nClass: ' + clip(b.grade, 40) + ' (write for this age)\n' +
    (b.text ? 'Lesson text from the teacher (use only this):\n' + clip(b.text, MAX_TEXT) + '\n' : '') +
    'Make these games:\n' + spec + '\nWord search, hangman and crossword words must be single words, letters only, 3 to 10 letters, found in the lesson. ' +
    'Kahoot questions need 4 choices and one right answer, and the right answer position should vary. In verse items put *stars* around 2 or 3 words to hide. ' +
    'Only include the game types listed. JSON shape (only the listed types):\n' + shapes;
  return { system: system, user: user };
}

function claude(p) {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_KEY');
  if (!key) return { error: 'nokey' };
  var r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: MODEL, max_tokens: 4000, system: p.system, messages: [{ role: 'user', content: p.user }] })
  });
  if (r.getResponseCode() !== 200) return { error: 'ai' };
  var j;
  try { j = JSON.parse(r.getContentText()); } catch (e) { return { error: 'ai' }; }
  var text = (j.content && j.content[0] && j.content[0].text) || '';
  var a = text.indexOf('{'), z = text.lastIndexOf('}');
  if (a < 0 || z < a) return { error: 'ai' };
  try { return { data: JSON.parse(text.slice(a, z + 1)) }; } catch (e) { return { error: 'ai' }; }
}

function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad' }); }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var isLumi = String(b.action || '').indexOf('lumi_') === 0;
    var u = who(b, isLumi);
    if (!u) return out({ ok: false, error: 'denied' });
    if (isLumi) return out(lumiPost(b, u));
    var topic = clip(b.topic, 120);
    if (!topic && !clip(b.text, 10)) return out({ ok: false, error: 'missing' });
    var wanted = [];
    (Array.isArray(b.kinds) ? b.kinds : []).slice(0, 6).forEach(function (k) {
      var kind = clip(k && k.kind, 12);
      if (!KINDS[kind]) return;
      var n = Math.max(1, Math.min(KINDS[kind].max, Math.floor(Number(k.n)) || KINDS[kind].def));
      wanted.push({ kind: kind, n: n });
    });
    if (!wanted.length) return out({ ok: false, error: 'missing' });
    var p = PropertiesService.getScriptProperties(), day = today();
    var ku = 'u_' + u.id + '_' + day, ka = 'all_' + day;
    var mine = Number(p.getProperty(ku) || 0), all = Number(p.getProperty(ka) || 0);
    if (mine >= PER_USER_PER_DAY) return out({ ok: false, error: 'limit', left: 0 });
    if (all >= ALL_PER_DAY) return out({ ok: false, error: 'busy' });
    var res = claude(prompt(b, wanted));
    if (res.error) return out({ ok: false, error: res.error });
    p.setProperty(ku, String(mine + 1));
    p.setProperty(ka, String(all + 1));
    var games = [];
    ((res.data && res.data.games) || []).forEach(function (g) {
      var w = wanted.filter(function (x) { return x.kind === g.t; })[0];
      if (!w) return;
      var items = (Array.isArray(g.items) ? g.items : []).slice(0, w.n).map(function (it) { return clean(g.t, it); }).filter(function (it) { return it; });
      if (items.length) games.push({ t: g.t, title: clip(g.title, 60) || clip(topic, 60), items: items });
    });
    return out({ ok: true, games: games, left: PER_USER_PER_DAY - mine - 1 });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return out({ ok: true, service: 'heavenly visions ai helper' }); }
