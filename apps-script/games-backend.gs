/* Heavenly Visions: Games backend (Google Apps Script).
   Stores published games in Script Properties (no extra Google permissions needed).
   Each game is cut into 8000 character pieces because one property holds about 9 KB. */

var PIN = '496691';

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = PropertiesService.getScriptProperties();
  var a = e.parameter.action;
  if (a === 'list') {
    return out({ ok: true, games: JSON.parse(p.getProperty('index') || '[]') });
  }
  if (a === 'get') {
    var id = e.parameter.id;
    var n = Number(p.getProperty('n_' + id));
    if (!n) return out({ ok: false });
    var s = '';
    for (var i = 0; i < n; i++) s += p.getProperty('c_' + id + '_' + i);
    return out({ ok: true, game: JSON.parse(s) });
  }
  if (a === 'leaderboard') {
    var all = p.getProperties();
    var rows = Object.keys(all).filter(function (k) { return k.indexOf('u_') === 0; }).map(function (k) {
      var u = JSON.parse(all[k]);
      return { n: u.name, s: u.score, r: u.role, g: u.grade };
    });
    rows.sort(function (x, y) { return y.s - x.s; });
    return out({ ok: true, rows: rows.slice(0, 30) });
  }
  return out({ ok: false });
}

function removeGame(p, id) {
  var n = Number(p.getProperty('n_' + id)) || 0;
  for (var i = 0; i < n; i++) p.deleteProperty('c_' + id + '_' + i);
  p.deleteProperty('n_' + id);
  var index = JSON.parse(p.getProperty('index') || '[]');
  return index.filter(function (g) { return g.id !== id; });
}


/* ---------- accounts and scores ---------- */

var RULES = {
  attend: { student: 10, servant: 5 },
  selfplay: { student: 10, servant: 0 },
  publish: { student: 0, servant: 20 },
  livewin: { student: 50, servant: 0 }
};

function sha(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  return bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

function randomText() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

function publicUser(u) {
  return { id: u.id, username: u.username, name: u.name, church: u.church, role: u.role,
    grade: u.grade, score: u.score, log: u.log, joined: u.joined };
}

function saveUser(p, u) {
  p.setProperty('u_' + u.id, JSON.stringify(u));
}

function getUser(p, b) {
  var raw = p.getProperty('u_' + b.id);
  if (!raw) return null;
  var u = JSON.parse(raw);
  return u.tok && u.tok === b.token ? u : null;
}

function accountAction(p, b) {
  if (b.action === 'signup') {
    var un = String(b.username || '').trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(un)) return { ok: false, error: 'username' };
    if (String(b.password || '').length < 6) return { ok: false, error: 'password' };
    if (!String(b.name || '').trim() || !String(b.church || '').trim()) return { ok: false, error: 'missing' };
    if (b.role !== 'student' && b.role !== 'servant') return { ok: false, error: 'missing' };
    if (p.getProperty('un_' + un)) return { ok: false, error: 'taken' };
    var salt = randomText();
    var u = { id: randomText().slice(0, 12), username: un, name: String(b.name).trim().slice(0, 40),
      phone: String(b.phone || '').slice(0, 25), email: String(b.email || '').slice(0, 60),
      church: String(b.church).trim().slice(0, 50), role: b.role, grade: String(b.grade || '').slice(0, 20),
      salt: salt, hash: sha(salt + b.password), tok: randomText(), score: 0, log: [], done: [], joined: Date.now() };
    p.setProperty('un_' + un, u.id);
    saveUser(p, u);
    return { ok: true, token: u.tok, user: publicUser(u) };
  }
  if (b.action === 'login') {
    var id = p.getProperty('un_' + String(b.username || '').trim().toLowerCase());
    var raw = id && p.getProperty('u_' + id);
    if (!raw) return { ok: false, error: 'login' };
    var v = JSON.parse(raw);
    if (v.hash !== sha(v.salt + String(b.password || ''))) return { ok: false, error: 'login' };
    v.tok = randomText();
    saveUser(p, v);
    return { ok: true, token: v.tok, user: publicUser(v) };
  }
  var me = getUser(p, b);
  if (!me) return { ok: false, error: 'auth' };
  if (b.action === 'me') return { ok: true, user: publicUser(me) };
  if (b.action === 'update') {
    me.name = String(b.name || me.name).trim().slice(0, 40);
    me.church = String(b.church || me.church).trim().slice(0, 50);
    me.grade = String(b.grade || '').slice(0, 20);
    me.phone = String(b.phone || '').slice(0, 25);
    me.email = String(b.email || '').slice(0, 60);
    saveUser(p, me);
    return { ok: true, user: publicUser(me) };
  }
  if (b.action === 'award') {
    var rule = RULES[b.kind];
    var pts = rule ? rule[me.role] : 0;
    var key = b.kind + ':' + String(b.ref || '').slice(0, 40);
    if (!pts || me.done.indexOf(key) >= 0) return { ok: true, added: 0, user: publicUser(me) };
    me.done.push(key);
    if (me.done.length > 300) me.done.shift();
    me.score += pts;
    me.log.unshift({ k: b.kind, p: pts, t: Date.now(), n: String(b.label || '').slice(0, 40) });
    me.log = me.log.slice(0, 15);
    saveUser(p, me);
    return { ok: true, added: pts, user: publicUser(me) };
  }
  return { ok: false };
}

function doPost(e) {
  var b = JSON.parse(e.postData.contents);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = PropertiesService.getScriptProperties();
    if (['signup', 'login', 'me', 'update', 'award'].indexOf(b.action) >= 0) return out(accountAction(p, b));
    if (b.pin !== PIN) return out({ ok: false, error: 'pin' });
    if (b.action === 'check') return out({ ok: true });
    if (b.action === 'delete') {
      p.setProperty('index', JSON.stringify(removeGame(p, b.id)));
      return out({ ok: true });
    }
    if (b.action === 'save') {
      var g = b.game;
      var index = removeGame(p, g.id);
      var s = JSON.stringify(g);
      var n = Math.ceil(s.length / 8000);
      try {
        for (var i = 0; i < n; i++) p.setProperty('c_' + g.id + '_' + i, s.substr(i * 8000, 8000));
        p.setProperty('n_' + g.id, String(n));
        index.unshift({ id: g.id, t: g.t, title: g.title, grade: g.grade, lesson: g.lesson, updated: g.updated });
        p.setProperty('index', JSON.stringify(index));
      } catch (err) {
        p.setProperty('index', JSON.stringify(removeGame(p, g.id)));
        return out({ ok: false, error: 'full' });
      }
      return out({ ok: true });
    }
    return out({ ok: false });
  } finally {
    lock.releaseLock();
  }
}
