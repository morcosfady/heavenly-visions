/* Heavenly Visions: Games backend (Google Apps Script).
   Stores published games in Script Properties (no extra Google permissions needed).
   Each game is cut into 8000 character pieces because one property holds about 9 KB. */

/* One-time code for creating the very first priest. Change it in the script editor. */
var SETUP_CODE = 'CHANGE_ME';
/* Only this email can become the Master, and only with the setup code. */
var MASTER_EMAIL = 'CHANGE_ME';

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
    return out({ ok: true, rows: [] });
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

/* STARS CONFIG: change the numbers here. student / servant = stars for one action.
   per = stars per unit (the phone sends n units, at most max). min and max clamp n for games.
   cap = most stars one person can earn from this kind in one day (Chicago time). 0 = no cap. */
var RULES = {
  attend: { student: 10, servant: 5, cap: 0 },
  lesson: { student: 5, servant: 0, cap: 30 },
  selfplay: { student: 10, servant: 0, min: 3, max: 10, cap: 60 },
  publish: { student: 0, servant: 20, cap: 0 },
  livewin: { student: 0, servant: 0, cap: 0 },
  quiz: { student: 0, servant: 0, per: 1, max: 10, cap: 40 },
  quizbonus: { student: 5, servant: 0, cap: 15 },
  verse: { student: 5, servant: 0, cap: 5 },
  color: { student: 2, servant: 0, cap: 10 },
  bible: { student: 2, servant: 0, cap: 10 },
  prayer: { student: 1, servant: 0, cap: 5 }
};
var STREAK_BONUS = 10;
var STREAK_EVERY = 4;

/* Shop: id = [price, slot]. Must match the list in kids.js. */
var SHOP = {
  hat_cap: [15, 'hat'], hat_shepherd: [30, 'hat'], hat_crown: [80, 'hat'], hat_mitre: [150, 'hat'],
  halo_gold: [40, 'halo'], halo_stars: [90, 'halo'],
  wings_white: [70, 'wings'], wings_gold: [160, 'wings'],
  robe_royal: [70, 'robe'], robe_light: [130, 'robe'], robe_blue: [20, 'robe'], robe_green: [25, 'robe'],
  pet_fish: [25, 'pet'], pet_lamb: [40, 'pet'], pet_dove: [60, 'pet'], pet_lion: [110, 'pet'],
  bg_cloud: [20, 'bg'], bg_desert: [30, 'bg'], bg_church: [40, 'bg'], bg_stars: [50, 'bg'], bg_ark: [60, 'bg'], bg_rainbow: [120, 'bg'],
  frame_gold: [40, 'frame'], frame_rainbow: [90, 'frame'], frame_glow: [150, 'frame']
};
var AV_RANGES = { skin: 6, hair: 6, hc: 8, eyes: 4, fit: 6, acc: 3 };

/* Badges: key and the rule that earns it. Names and hints are in kids.js. */
var BADGE_RULES = {
  first_star: function (u) { return u.score >= 1; },
  stars_100: function (u) { return u.score >= 100; },
  stars_500: function (u) { return u.score >= 500; },
  first_sunday: function (u) { return (u.cnt.attend || 0) >= 1; },
  sunday_10: function (u) { return (u.cnt.attend || 0) >= 10; },
  streak_4: function (u) { return !!u.sb; },
  shopper: function (u) { return (u.own || []).length >= 1; },
  collector: function (u) { return (u.own || []).length >= 8; },
  quiz_whiz: function (u) { return (u.cnt.quizbonus || 0) >= 3; },
  gamer: function (u) { return (u.cnt.selfplay || 0) >= 10; },
  scholar: function (u) { return (u.cnt.lesson || 0) >= 10; },
  reader: function (u) { return (u.cnt.bible || 0) >= 10; },
  artist: function (u) { return (u.cnt.color || 0) >= 5; },
  verse_7: function (u) { return (u.cnt.verse || 0) >= 7; }
};

function evalBadges(u) {
  u.cnt = u.cnt || {};
  u.badges = u.badges || [];
  var fresh = [];
  Object.keys(BADGE_RULES).forEach(function (k) {
    if (u.badges.indexOf(k) < 0 && BADGE_RULES[k](u)) { u.badges.push(k); fresh.push(k); }
  });
  return fresh;
}

function sha(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  return bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

function randomText() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

var ROLES = ['student', 'servant', 'coordinator', 'priest', 'master'];

function isStaff(role) { return role !== 'student'; }

function isTop(role) { return role === 'priest' || role === 'master'; }

function pointsFor(role, kind, n) {
  var rule = RULES[kind];
  if (!rule) return 0;
  var base = role === 'student' ? rule.student : rule.servant;
  var units = Math.floor(Number(n));
  if (rule.per) return role === 'student' ? Math.max(0, Math.min(rule.max, units || 0)) * rule.per : 0;
  if (rule.min && base) return Math.max(rule.min, Math.min(rule.max, units || rule.max));
  return base;
}

function publicUser(u) {
  return { id: u.id, username: u.username, name: u.name, church: u.church, role: u.role,
    grade: u.grade, req: u.req || '', score: u.score, log: u.log, joined: u.joined,
    spent: u.spent || 0, own: u.own || [], av: u.av || null, badges: u.badges || [] };
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

function allUsers(p) {
  var all = p.getProperties();
  return Object.keys(all).filter(function (k) { return k.indexOf('u_') === 0; }).map(function (k) { return JSON.parse(all[k]); });
}

function anyPriest(p) {
  return allUsers(p).some(function (u) { return u.role === 'priest'; });
}

function contactUser(u) {
  return { id: u.id, name: u.name, church: u.church, role: u.role, req: u.req || '', grade: u.grade,
    phone: u.phone, email: u.email, score: u.score, joined: u.joined };
}

function accessAction(p, me, b) {
  if (me.role !== 'coordinator' && !isTop(me.role)) return { ok: false, error: 'denied' };
  var users = allUsers(p).filter(function (u) { return u.id !== me.id; });
  if (b.action === 'access_list') {
    var mine = users.filter(function (u) {
      if (me.role === 'master') return u.role !== 'student' || u.req;
      if (me.role === 'priest') return (u.role !== 'student' && u.role !== 'master') || u.req;
      return u.grade === me.grade && (u.role === 'servant' || u.req === 'servant');
    });
    return { ok: true, pending: mine.filter(function (u) { return u.req; }).map(contactUser),
      team: mine.filter(function (u) { return !u.req && u.role !== 'student'; }).map(contactUser) };
  }
  var raw = p.getProperty('u_' + b.target);
  if (!raw) return { ok: false, error: 'missing' };
  var t = JSON.parse(raw);
  var role = b.role, grade = b.grade === undefined ? t.grade : String(b.grade).slice(0, 20);
  if ((t.role === 'master' || role === 'master' || t.req === 'master') && me.role !== 'master') return { ok: false, error: 'denied' };
  if (t.role === 'master' && b.action !== 'access_reject' && role !== 'master') return { ok: false, error: 'denied' };
  if (me.role === 'coordinator') {
    var isMyServant = t.grade === me.grade && (t.role === 'servant' || t.req === 'servant');
    if (!isMyServant || grade !== me.grade) return { ok: false, error: 'denied' };
    if (role && role !== 'servant' && role !== 'student') return { ok: false, error: 'denied' };
  }
  if (b.action === 'access_reject') { t.req = ''; }
  else if (b.action === 'access_set') {
    var newRole = role || t.req || t.role;
    if (ROLES.indexOf(newRole) < 0) return { ok: false, error: 'missing' };
    t.role = newRole; t.req = ''; t.grade = grade;
  }
  if (t.id === me.id && !isTop(t.role)) return { ok: false, error: 'denied' };
  saveUser(p, t);
  return { ok: true };
}

/* Sunday School attendance: a coordinator or higher sets a 3 digit code for today, students type it to check in. */
function today() { return Utilities.formatDate(new Date(), 'America/Chicago', 'yyyy-MM-dd'); }

function attendAction(p, b) {
  if (b.token) {
    var acct = getUser(p, b);
    if (!acct) return { ok: false, error: 'auth' };
    return attendAccount(p, acct, b);
  }
  var day = today();
  var raw = p.getProperty('att_code');
  var c = raw ? JSON.parse(raw) : null;
  if (!c || c.day !== day) return { ok: false, error: 'nocode' };
  if (String(b.code || '').trim() !== c.code) return { ok: false, error: 'code' };
  var name = String(b.name || '').trim().slice(0, 40), grade = String(b.grade || '').slice(0, 20);
  if (!name) return { ok: false, error: 'missing' };
  var key = 'att_' + day;
  var list = JSON.parse(p.getProperty(key) || '[]');
  var id = name.toLowerCase() + '|' + grade;
  var seen = list.some(function (x) { return (x.n.toLowerCase() + '|' + x.g) === id; });
  if (seen) return { ok: false, error: 'already' };
  if (list.length >= 150) return { ok: false, error: 'full' };
  list.push({ n: name, g: grade, t: Date.now() });
  p.setProperty(key, JSON.stringify(list));
  return { ok: true };
}

function attSetAction(p, me, b) {
  if (me.role !== 'coordinator' && !isTop(me.role)) return { ok: false, error: 'denied' };
  var day = today();
  if (b.action === 'att_set') {
    var code = String(b.code || '').trim();
    if (!/^[0-9]{3}$/.test(code)) return { ok: false, error: 'code' };
    var saved = JSON.stringify({ day: day, code: code, by: me.name });
    p.setProperty('att_code', saved);
    p.setProperty('att_code|' + me.church, saved);
    return { ok: true, day: day, code: code };
  }
  var raw = p.getProperty('att_code|' + me.church) || p.getProperty('att_code');
  var c = raw ? JSON.parse(raw) : null;
  var list = JSON.parse(p.getProperty('att_' + day) || '[]').filter(function (x) {
    if (me.role === 'master') return true;
    if (x.c && x.c !== me.church) return false;
    return isTop(me.role) || x.g === me.grade;
  });
  return { ok: true, day: day, code: c && c.day === day ? c.code : '', by: c && c.day === day ? c.by : '', list: list };
}

/* ---------- Attendance Sheet ----------
   Storage (small on purpose, Script Properties hold about 500 KB):
   a_<id>                one person's check-ins, 6 characters each: day number (3, base 36) + minute of the day (3, base 36)
   ss_<church>|<grade>   days when someone in that class checked in (a "session"), 3 characters each
   ns_<church>|<grade>   days a coordinator marked "no Sunday School" (grade * means the whole church)
   Day number = days since 2026-01-01. All stats are made here, each role only gets what it may see. */

var EPOCH = Date.UTC(2026, 0, 1);

function dayNum(s) { var a = String(s).split('-'); return Math.round((Date.UTC(+a[0], +a[1] - 1, +a[2]) - EPOCH) / 86400000); }

function dayStr(n) {
  var d = new Date(EPOCH + n * 86400000);
  return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
}

function pad36(n, w) { var s = n.toString(36); while (s.length < w) s = '0' + s; return s; }

function clock(m) { return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }

function nowMinutes() {
  var a = Utilities.formatDate(new Date(), 'America/Chicago', 'HH:mm').split(':');
  return +a[0] * 60 + +a[1];
}

function dayList(str) {
  var out = [];
  for (var i = 0; i + 3 <= (str || '').length; i += 3) out.push(parseInt(str.substr(i, 3), 36));
  return out;
}

function addDay(p, key, d) {
  var cur = p.getProperty(key) || '';
  if (dayList(cur).indexOf(d) < 0) p.setProperty(key, cur + pad36(d, 3));
}

function attendAccount(p, me, b) {
  var day = today();
  var raw = p.getProperty('att_code|' + me.church) || p.getProperty('att_code');
  var c = raw ? JSON.parse(raw) : null;
  if (!c || c.day !== day) return { ok: false, error: 'nocode' };
  if (String(b.code || '').trim() !== c.code) return { ok: false, error: 'code' };
  var d = dayNum(day), key = 'a_' + me.id;
  var cur = p.getProperty(key) || '';
  var counts = me.role === 'student' || me.role === 'servant';
  if (counts) {
    if (!me.grade) return { ok: false, error: 'nograde' };
    for (var i = 0; i + 6 <= cur.length; i += 6) if (parseInt(cur.substr(i, 3), 36) === d) return { ok: false, error: 'already' };
    var nos = dayList(p.getProperty('ns_' + me.church + '|' + me.grade)).concat(dayList(p.getProperty('ns_' + me.church + '|*')));
    if (nos.indexOf(d) >= 0) return { ok: false, error: 'nosunday' };
    p.setProperty(key, cur + pad36(d, 3) + pad36(nowMinutes(), 3));
    addDay(p, 'ss_' + me.church + '|' + me.grade, d);
  }
  var listKey = 'att_' + day;
  var list = JSON.parse(p.getProperty(listKey) || '[]');
  if (list.length < 150) {
    list.push({ n: me.name, g: me.grade, c: me.church, t: Date.now() });
    p.setProperty(listKey, JSON.stringify(list));
  }
  var bonus = 0;
  if (me.role === 'student') {
    var st = streakNow(p, me);
    if (st > 0 && st % STREAK_EVERY === 0) {
      var u2 = JSON.parse(p.getProperty('u_' + me.id));
      u2.score += STREAK_BONUS;
      u2.sb = true;
      u2.cnt = u2.cnt || {};
      u2.cnt.streak = (u2.cnt.streak || 0) + 1;
      u2.log = (u2.log || []);
      u2.log.unshift({ k: 'streak', p: STREAK_BONUS, t: Date.now(), n: st + ' Sundays in a row' });
      u2.log = u2.log.slice(0, 15);
      evalBadges(u2);
      saveUser(p, u2);
      bonus = STREAK_BONUS;
    }
  }
  return { ok: true, bonus: bonus };
}

function streakNow(p, me) {
  var ctx = { all: {} };
  ctx.all['ss_' + me.church + '|' + me.grade] = p.getProperty('ss_' + me.church + '|' + me.grade) || '';
  ctx.all['ns_' + me.church + '|' + me.grade] = p.getProperty('ns_' + me.church + '|' + me.grade) || '';
  ctx.all['ns_' + me.church + '|*'] = p.getProperty('ns_' + me.church + '|*') || '';
  ctx.all['a_' + me.id] = p.getProperty('a_' + me.id) || '';
  var joined = Math.floor(((me.joined || 0) - EPOCH) / 86400000);
  var sess = sessionDays(ctx, me.church, me.grade, joined, 99999);
  return streaks(sess, checkinsOf(ctx, me.id)).cur;
}

function attCtx(p) {
  var all = p.getProperties(), users = [];
  Object.keys(all).forEach(function (k) { if (k.indexOf('u_') === 0) users.push(JSON.parse(all[k])); });
  return { all: all, users: users };
}

function canSee(me, u) {
  if (me.role === 'master') return true;
  if (me.role === 'priest') return u.church === me.church;
  if (me.role === 'coordinator') return u.church === me.church && u.grade === me.grade;
  if (me.role === 'servant') return u.role === 'student' && !u.req && u.church === me.church && u.grade === me.grade;
  return u.id === me.id;
}

function sessionDays(ctx, church, grade, from, to) {
  var ss = dayList(ctx.all['ss_' + church + '|' + grade]);
  var ns = dayList(ctx.all['ns_' + church + '|' + grade]).concat(dayList(ctx.all['ns_' + church + '|*']));
  return ss.filter(function (d) { return ns.indexOf(d) < 0 && d >= from && d <= to; }).sort(function (x, y) { return x - y; });
}

function checkinsOf(ctx, id) {
  var s = ctx.all['a_' + id] || '', out = {};
  for (var i = 0; i + 6 <= s.length; i += 6) out[parseInt(s.substr(i, 3), 36)] = parseInt(s.substr(i + 3, 3), 36);
  return out;
}

function streaks(sess, ci) {
  var cur = 0, best = 0, run = 0, i;
  for (i = 0; i < sess.length; i++) { if (ci[sess[i]] !== undefined) { run++; if (run > best) best = run; } else run = 0; }
  for (i = sess.length - 1; i >= 0 && ci[sess[i]] !== undefined; i--) cur++;
  return { cur: cur, best: best };
}

function statsOf(ctx, u, from, to) {
  var joined = Math.floor(((u.joined || 0) - EPOCH) / 86400000);
  var sess = sessionDays(ctx, u.church, u.grade, Math.max(joined, from || 0), to === undefined ? 99999 : to);
  var ci = checkinsOf(ctx, u.id);
  var present = sess.filter(function (d) { return ci[d] !== undefined; });
  var st = streaks(sess, ci);
  var all = Object.keys(ci).map(Number).sort(function (x, y) { return x - y; });
  var last3 = sess.slice(-3);
  var missed3 = last3.length === 3 && last3.every(function (d) { return ci[d] === undefined; });
  var pct = sess.length >= 2 ? Math.round(present.length * 100 / sess.length) : null;
  return { u: u, sess: sess, ci: ci, present: present, joined: joined, pct: pct, streak: st.cur, best: st.best,
    last: all.length ? dayStr(all[all.length - 1]) : '', first: all.length ? dayStr(all[0]) : '',
    spark: sess.slice(-8).map(function (d) { return ci[d] !== undefined ? 1 : 0; }),
    fu: missed3 ? 'missed3' : (pct !== null && pct < 50 ? 'low' : '') };
}

function rowOf(s) {
  return { id: s.u.id, name: s.u.name, role: s.u.role, grade: s.u.grade, church: s.u.church, pct: s.pct, present: s.present.length,
    sessions: s.sess.length, missed: s.sess.length - s.present.length, streak: s.streak, best: s.best, last: s.last,
    spark: s.spark, fu: s.fu };
}

function rankRows(rows) {
  rows.sort(function (a, b) {
    var pa = a.pct === null ? -1 : a.pct, pb = b.pct === null ? -1 : b.pct;
    if (pb !== pa) return pb - pa;
    if (b.streak !== a.streak) return b.streak - a.streak;
    return a.name < b.name ? -1 : 1;
  });
  return rows;
}

function pooled(list) {
  var pr = 0, se = 0;
  list.forEach(function (s) { pr += s.present.length; se += s.sess.length; });
  return se ? Math.round(pr * 100 / se) : null;
}

function rangeStart(range, t) {
  if (range === 'month') return t - 30;
  if (range === '3m') return t - 91;
  if (range === 'year') {
    var a = dayStr(t).split('-'), y = +a[0] - (+a[1] < 9 ? 1 : 0);
    return dayNum(y + '-09-01');
  }
  return 0;
}

function summary(ctx, list, t) {
  var recent = list.map(function (s) { return statsOf(ctx, s.u, t - 30, t); });
  var before = list.map(function (s) { return statsOf(ctx, s.u, t - 61, t - 31); });
  var a = pooled(recent), c = pooled(before);
  var lastDay = 0;
  list.forEach(function (s) { if (s.sess.length && s.sess[s.sess.length - 1] > lastDay) lastDay = s.sess[s.sess.length - 1]; });
  var presentLast = list.filter(function (s) { return lastDay && s.ci[lastDay] !== undefined; }).length;
  return { avg: pooled(list), kids: list.length, presentLast: presentLast, lastDay: lastDay ? dayStr(lastDay) : '',
    trend: a === null || c === null ? null : a - c };
}

function weeklyTrend(kids, servants) {
  var days = {};
  kids.concat(servants).forEach(function (s) { s.sess.forEach(function (d) { days[d] = 1; }); });
  var ds = Object.keys(days).map(Number).sort(function (x, y) { return x - y; }).slice(-12);
  return ds.map(function (d) {
    function at(list) {
      var pr = 0, el = 0;
      list.forEach(function (s) { if (s.sess.indexOf(d) >= 0) { el++; if (s.ci[d] !== undefined) pr++; } });
      return el ? Math.round(pr * 100 / el) : null;
    }
    return { d: dayStr(d), kids: at(kids), servants: at(servants) };
  });
}

function detailOf(ctx, s, t) {
  var u = s.u;
  var offs = dayList(ctx.all['ns_' + u.church + '|' + u.grade]).concat(dayList(ctx.all['ns_' + u.church + '|*']));
  var cal = s.sess.map(function (d) { return { d: dayStr(d), s: s.ci[d] !== undefined ? 'p' : 'm', t: s.ci[d] !== undefined ? clock(s.ci[d]) : '' }; });
  offs.filter(function (d, i) { return d >= s.joined && d <= t && offs.indexOf(d) === i; }).forEach(function (d) { cal.push({ d: dayStr(d), s: 'n', t: '' }); });
  cal.sort(function (x, y) { return x.d < y.d ? -1 : 1; });
  var months = {};
  s.sess.forEach(function (d) {
    var m = dayStr(d).slice(0, 7);
    months[m] = months[m] || { m: m, p: 0, n: 0 };
    months[m].n++;
    if (s.ci[d] !== undefined) months[m].p++;
  });
  var monthly = Object.keys(months).sort().map(function (k) { return months[k]; });
  var perfect = monthly.some(function (m) { return m.n >= 2 && m.p === m.n; });
  var row = rowOf(s);
  row.first = s.first;
  row.joined = dayStr(s.joined);
  row.cal = cal.slice(-60);
  row.monthly = monthly.slice(-12);
  row.badges = [
    { k: 'first', ic: '🌱', name: 'First Sunday', how: 'Check in once', got: s.present.length >= 1 },
    { k: 'row4', ic: '🔥', name: '4 in a row', how: 'Come 4 Sundays in a row', got: s.best >= 4 },
    { k: 'perfect', ic: '🌟', name: 'Perfect month', how: 'Come every Sunday of a month', got: perfect },
    { k: 'ten', ic: '🏅', name: '10 Sundays', how: 'Come 10 times', got: s.present.length >= 10 },
    { k: 'row8', ic: '👑', name: '8 in a row', how: 'Come 8 Sundays in a row', got: s.best >= 8 }
  ];
  row.history = s.present.slice(-20).reverse().map(function (d) { return { d: dayStr(d), t: clock(s.ci[d]) }; });
  return row;
}

function attStatsAction(p, me, b) {
  var ctx = attCtx(p), t = dayNum(today());
  var from = rangeStart(b.range, t);
  var isKid = me.role === 'student', isServant = me.role === 'servant';
  var top = me.role === 'coordinator' || isTop(me.role);
  if (b.action === 'att_my') {
    if (!isKid && !isServant) return { ok: false, error: 'none' };
    return { ok: true, today: dayStr(t), me: detailOf(ctx, statsOf(ctx, me, 0, t), t) };
  }
  if (b.action === 'att_person') {
    var raw = ctx.users.filter(function (u) { return u.id === b.target; })[0];
    if (!raw || !canSee(me, raw)) return { ok: false, error: 'denied' };
    if (raw.role !== 'student' && raw.role !== 'servant') return { ok: false, error: 'denied' };
    if (raw.role === 'servant' && isServant && raw.id !== me.id) return { ok: false, error: 'denied' };
    return { ok: true, today: dayStr(t), person: detailOf(ctx, statsOf(ctx, raw, from, t), t) };
  }
  if (isKid) return { ok: false, error: 'denied' };
  if (b.action === 'att_class') {
    var church = me.church, grade = me.grade;
    if (isTop(me.role)) { grade = String(b.grade || ''); if (me.role === 'master') church = String(b.church || me.church); }
    var kids = ctx.users.filter(function (u) { return u.role === 'student' && !u.req && u.church === church && u.grade === grade && canSee(me, u); })
      .map(function (u) { return statsOf(ctx, u, from, t); });
    var rows = rankRows(kids.map(rowOf));
    return { ok: true, today: dayStr(t), grade: grade, church: church, summary: summary(ctx, kids, t), rows: rows,
      followup: rows.filter(function (r) { return r.fu; }) };
  }
  if (!top) return { ok: false, error: 'denied' };
  if (b.action === 'att_days') {
    var d = String(b.day || '');
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) return { ok: false, error: 'missing' };
    var g = me.role === 'coordinator' ? me.grade : String(b.grade || '*');
    var key = 'ns_' + me.church + '|' + g, n = dayNum(d);
    var cur = dayList(p.getProperty(key)).filter(function (x) { return x !== n; });
    if (b.off) cur.push(n);
    p.setProperty(key, cur.map(function (x) { return pad36(x, 3); }).join(''));
    return { ok: true };
  }
  var stats = ctx.users.filter(function (u) { return canSee(me, u) && (u.role === 'servant' || (u.role === 'student' && !u.req)); })
    .map(function (u) { return statsOf(ctx, u, from, t); });
  var kidS = stats.filter(function (s) { return s.u.role === 'student'; });
  var srvS = stats.filter(function (s) { return s.u.role === 'servant'; });
  if (b.action === 'att_csv') {
    var only = b.scope === 'class' ? String(b.grade || me.grade) : '';
    var lines = ['Name,Role,Class,Percent,Present,Missed,Streak,Last seen'];
    var q = function (v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    rankRows(stats.filter(function (s) { return !only || s.u.grade === only; }).map(rowOf)).forEach(function (r) {
      lines.push([q(r.name), r.role, q(r.grade), r.pct === null ? '' : r.pct, r.present, r.missed, r.streak, r.last].join(','));
    });
    return { ok: true, csv: lines.join('\n') };
  }
  var groups = {};
  kidS.forEach(function (s) { var k = s.u.church + '|' + s.u.grade; (groups[k] = groups[k] || []).push(s); });
  var classes = Object.keys(groups).map(function (k) {
    var l = groups[k];
    return { grade: l[0].u.grade, church: l[0].u.church, avg: pooled(l), kids: l.length };
  }).sort(function (x, y) { return (y.avg === null ? -1 : y.avg) - (x.avg === null ? -1 : x.avg); });
  var rowsK = rankRows(kidS.map(rowOf)), rowsS = rankRows(srvS.map(rowOf));
  var ks = summary(ctx, kidS, t), ss = summary(ctx, srvS, t);
  var off = {};
  Object.keys(ctx.all).forEach(function (k) {
    if (k.indexOf('ns_' + me.church + '|') === 0 && (me.role !== 'coordinator' || k === 'ns_' + me.church + '|' + me.grade || k === 'ns_' + me.church + '|*')) {
      dayList(ctx.all[k]).forEach(function (x) { off[dayStr(x)] = 1; });
    }
  });
  return { ok: true, today: dayStr(t), kpi: { kidsPct: ks.avg, servantsPct: ss.avg, presentLast: ks.presentLast, lastDay: ks.lastDay,
    kids: kidS.length, servants: srvS.length, trend: ks.trend }, weekly: weeklyTrend(kidS, srvS), classes: classes,
    kids: rowsK, servants: rowsS, followup: rowsK.concat(rowsS).filter(function (r) { return r.fu; }), off: Object.keys(off).sort() };
}

/* One email, one person. Gmail ignores dots and +tags, so we do too. */
function normEmail(e) {
  var x = String(e || '').trim().toLowerCase();
  var at = x.lastIndexOf('@');
  if (at < 1) return x;
  var local = x.slice(0, at), dom = x.slice(at + 1);
  if (dom === 'googlemail.com') dom = 'gmail.com';
  if (dom === 'gmail.com') local = local.split('+')[0].replace(/\./g, '');
  return local + '@' + dom;
}

function emailTaken(p, email, exceptId) {
  var n = normEmail(email);
  return allUsers(p).some(function (u) { return u.id !== exceptId && normEmail(u.email) === n; });
}

/* ---------- Servants tools: lesson planner, announcements, follow up ----------
   lp_<church>|<grade>|<yyyy-mm>   lessons of one class for one month (one lesson per date)
   an_<church>                    announcements of one church
   fu_<church>|<grade>            follow up status and notes, by kid id
   Every request is checked here: who you are decides which church and class you can touch. */

function cleanText(v, n) { return String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n); }

function isDate(v) { return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(v)); }

/* which church and class this person may manage */
function svScope(me, b) {
  if (!isStaff(me.role) || me.req) return null;
  if (me.role === 'servant' || me.role === 'coordinator') return { church: me.church, grade: me.grade };
  var grade = cleanText(b.grade, 20);
  if (me.role === 'priest') return { church: me.church, grade: grade || '' };
  return { church: cleanText(b.church, 50) || me.church, grade: grade || '' };
}

function canManageGrade(me, church, grade) {
  if (!isStaff(me.role) || me.req) return false;
  if (me.role === 'master') return true;
  if (me.role === 'priest') return church === me.church;
  return church === me.church && grade === me.grade;
}

function monthKey(church, grade, ym) { return 'lp_' + church + '|' + grade + '|' + ym; }

function readJson(p, key, dflt) {
  var raw = p.getProperty(key);
  if (!raw) return dflt;
  try { return JSON.parse(raw); } catch (e) { return dflt; }
}

function cleanLesson(l) {
  var m = [];
  (Array.isArray(l.materials) ? l.materials : []).slice(0, 8).forEach(function (x) { var t = cleanText(x, 40); if (t) m.push(t); });
  return {
    date: String(l.date), title: cleanText(l.title, 60), reading: cleanText(l.reading, 60),
    video: /^[A-Za-z0-9_-]{11}$/.test(String(l.video || '')) ? String(l.video) : '',
    verse: cleanText(l.verse, 200), verseRef: cleanText(l.verseRef, 40), game: cleanText(l.game, 40), quiz: cleanText(l.quiz, 20),
    craft: cleanText(l.craft, 120), materials: m, notes: cleanText(l.notes, 200),
    status: ['draft', 'ready', 'done'].indexOf(l.status) >= 0 ? l.status : 'draft'
  };
}

function ymOf(date) { return String(date).slice(0, 7); }

function planAction(p, me, b) {
  if (b.action === 'lp_this') {
    if (!me.grade) return { ok: true, lesson: null };
    var t = today(), best = null;
    [t.slice(0, 7), dayStr(dayNum(t) + 31).slice(0, 7)].forEach(function (ym) {
      readJson(p, monthKey(me.church, me.grade, ym), []).forEach(function (l) {
        if (l.date >= t && l.status !== 'draft' && (!best || l.date < best.date)) best = l;
      });
    });
    if (!best) return { ok: true, lesson: null };
    return { ok: true, lesson: { date: best.date, title: best.title, reading: best.reading, verse: best.verse, verseRef: best.verseRef, video: best.video, game: best.game, quiz: best.quiz } };
  }
  var sc = svScope(me, b);
  if (!sc || !sc.grade) return { ok: false, error: 'denied' };
  if (b.action === 'lp_list') {
    var from = isDate(b.from) ? b.from : today(), to = isDate(b.to) ? b.to : dayStr(dayNum(from) + 120);
    var out = [], d = dayNum(from), seen = {};
    for (var i = 0; i <= 8; i++) {
      var ym = dayStr(d).slice(0, 7);
      if (!seen[ym]) { seen[ym] = 1; readJson(p, monthKey(sc.church, sc.grade, ym), []).forEach(function (l) { if (l.date >= from && l.date <= to) out.push(l); }); }
      d += 31;
    }
    out.sort(function (x, y) { return x.date < y.date ? -1 : 1; });
    return { ok: true, grade: sc.grade, lessons: out };
  }
  if (b.action === 'lp_save') {
    var l = b.lesson || {};
    if (!isDate(l.date) || !cleanText(l.title, 60).trim()) return { ok: false, error: 'missing' };
    var lesson = cleanLesson(l);
    if (b.oldDate && isDate(b.oldDate) && b.oldDate !== lesson.date) lpRemove(p, sc, b.oldDate);
    var key = monthKey(sc.church, sc.grade, ymOf(lesson.date));
    var list = readJson(p, key, []).filter(function (x) { return x.date !== lesson.date; });
    lesson.by = me.name; lesson.at = Date.now();
    list.push(lesson);
    var txt = JSON.stringify(list);
    if (txt.length > 8800) return { ok: false, error: 'full' };
    p.setProperty(key, txt);
    return { ok: true, lesson: lesson };
  }
  if (b.action === 'lp_delete') {
    if (!isDate(b.date)) return { ok: false, error: 'missing' };
    lpRemove(p, sc, b.date);
    return { ok: true };
  }
  if (b.action === 'lp_dup') {
    if (!isDate(b.date) || !isDate(b.toDate)) return { ok: false, error: 'missing' };
    var toGrade = cleanText(b.toGrade, 20) || sc.grade;
    if (!canManageGrade(me, sc.church, toGrade)) return { ok: false, error: 'denied' };
    var src = readJson(p, monthKey(sc.church, sc.grade, ymOf(b.date)), []).filter(function (x) { return x.date === b.date; })[0];
    if (!src) return { ok: false, error: 'missing' };
    var copy = JSON.parse(JSON.stringify(src));
    copy.date = b.toDate; copy.status = 'draft'; copy.by = me.name; copy.at = Date.now();
    var k2 = monthKey(sc.church, toGrade, ymOf(copy.date));
    var l2 = readJson(p, k2, []).filter(function (x) { return x.date !== copy.date; });
    l2.push(copy);
    var t2 = JSON.stringify(l2);
    if (t2.length > 8800) return { ok: false, error: 'full' };
    p.setProperty(k2, t2);
    return { ok: true };
  }
  return { ok: false, error: 'missing' };
}

function lpRemove(p, sc, date) {
  var key = monthKey(sc.church, sc.grade, ymOf(date));
  p.setProperty(key, JSON.stringify(readJson(p, key, []).filter(function (x) { return x.date !== date; })));
}

var AN_CATS = ['event', 'church', 'bring', 'important'];

function annAction(p, me, b) {
  var key = 'an_' + me.church, t = today();
  var all = readJson(p, key, []).filter(function (a) { return !a.exp || a.exp >= t; });
  if (b.action === 'an_list') {
    var rows = all.filter(function (a) {
      if (a.date && a.date < dayStr(dayNum(t) - 1)) return false;
      if (isStaff(me.role) && !me.req) return true;
      return !a.grades.length || a.grades.indexOf('all') >= 0 || a.grades.indexOf(me.grade) >= 0;
    });
    rows.sort(function (x, y) { return (y.pin ? 1 : 0) - (x.pin ? 1 : 0) || y.ts - x.ts; });
    return { ok: true, items: rows, mine: isStaff(me.role) && !me.req };
  }
  if (!isStaff(me.role) || me.req) return { ok: false, error: 'denied' };
  if (b.action === 'an_save') {
    var a = b.a || {};
    var title = cleanText(a.title, 50).trim(), msg = cleanText(a.msg, 300).trim();
    if (!title || !msg) return { ok: false, error: 'missing' };
    var grades;
    if (me.role === 'servant') grades = [me.grade];
    else if (me.role === 'coordinator') grades = (Array.isArray(a.grades) && a.grades.indexOf('all') >= 0) ? ['all'] : [me.grade];
    else grades = Array.isArray(a.grades) ? a.grades.slice(0, 14).map(function (g) { return cleanText(g, 20); }) : ['all'];
    var item = { id: a.id && /^[a-z0-9]{6,12}$/.test(a.id) ? a.id : randomText().slice(0, 8), title: title, msg: msg, ic: cleanText(a.ic, 8) || '📢',
      cat: AN_CATS.indexOf(a.cat) >= 0 ? a.cat : 'church', date: isDate(a.date) ? a.date : '', exp: isDate(a.exp) ? a.exp : '', pin: !!a.pin,
      grades: grades, by: me.name, byRole: me.role, byGrade: me.grade, ts: Date.now() };
    var prev = all.filter(function (x) { return x.id === item.id; })[0];
    if (prev && !(me.role !== 'servant' || prev.byGrade === me.grade)) return { ok: false, error: 'denied' };
    var list = all.filter(function (x) { return x.id !== item.id; });
    list.push(item);
    list.sort(function (x, y) { return y.ts - x.ts; });
    while (JSON.stringify(list).length > 8800 && list.length > 1) list.pop();
    p.setProperty(key, JSON.stringify(list));
    return { ok: true, item: item };
  }
  if (b.action === 'an_delete') {
    var target = all.filter(function (x) { return x.id === b.aid; })[0];
    if (!target) return { ok: true };
    var mayDelete = me.role === 'priest' || me.role === 'master' || (me.role === 'coordinator' && (target.byGrade === me.grade || target.grades.indexOf(me.grade) >= 0)) || (me.role === 'servant' && target.byGrade === me.grade && target.grades.length === 1 && target.grades[0] === me.grade);
    if (!mayDelete) return { ok: false, error: 'denied' };
    p.setProperty(key, JSON.stringify(all.filter(function (x) { return x.id !== b.aid; })));
    return { ok: true };
  }
  return { ok: false, error: 'missing' };
}

function fuAction(p, me, b) {
  var sc = svScope(me, b);
  if (!sc || !sc.grade) return { ok: false, error: 'denied' };
  var key = 'fu_' + sc.church + '|' + sc.grade, map = readJson(p, key, {});
  var ctx = attCtx(p), t = dayNum(today());
  var month = today().slice(0, 7);
  if (b.action === 'fu_list') {
    var kids = ctx.users.filter(function (u) { return u.role === 'student' && !u.req && u.church === sc.church && u.grade === sc.grade && canSee(me, u); })
      .map(function (u) { return statsOf(ctx, u, 0, t); }).filter(function (s) { return s.fu; });
    var rows = kids.map(function (s) {
      var st = map[s.u.id] || {}, r = rowOf(s);
      r.c = st.c || 0; r.v = st.v || 0; r.n = st.n || [];
      var urgent = s.fu === 'missed3' && s.pct !== null && s.pct < 50;
      r.urgency = urgent ? 'high' : (s.fu === 'missed3' ? 'mid' : 'low');
      return r;
    });
    var rank = { high: 0, mid: 1, low: 2 };
    rows.sort(function (x, y) { return (rank[x.urgency] - rank[y.urgency]) || (x.name < y.name ? -1 : 1); });
    var done = rows.filter(function (r) { return (r.c && dayStr(Math.floor((r.c - EPOCH) / 86400000)).slice(0, 7) === month) || (r.v && dayStr(Math.floor((r.v - EPOCH) / 86400000)).slice(0, 7) === month); }).length;
    return { ok: true, grade: sc.grade, rows: rows, done: done, total: rows.length };
  }
  if (b.action === 'fu_set') {
    var kid = ctx.users.filter(function (u) { return u.id === b.target; })[0];
    if (!kid || kid.role !== 'student' || kid.req || kid.church !== sc.church || kid.grade !== sc.grade || !canSee(me, kid)) return { ok: false, error: 'denied' };
    var st2 = map[kid.id] || { n: [] };
    var kind = b.kind;
    if (kind === 'contacted') st2.c = Date.now();
    else if (kind === 'visited') st2.v = Date.now();
    else if (kind === 'note') {
      var x = cleanText(b.note, 120).trim();
      if (!x) return { ok: false, error: 'missing' };
      st2.n = (st2.n || []).concat([{ t: Date.now(), by: me.name, x: x }]).slice(-3);
    } else return { ok: false, error: 'missing' };
    map[kid.id] = st2;
    var txt = JSON.stringify(map);
    if (txt.length > 8500) {
      Object.keys(map).sort(function (a, c2) { return Math.max(map[a].c || 0, map[a].v || 0) - Math.max(map[c2].c || 0, map[c2].v || 0); }).slice(0, 4).forEach(function (k) { if (k !== kid.id) delete map[k]; });
      txt = JSON.stringify(map);
    }
    p.setProperty(key, txt);
    return { ok: true };
  }
  return { ok: false, error: 'missing' };
}

function accountAction(p, b) {
  if (b.action === 'signup') {
    var un = String(b.username || '').trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(un)) return { ok: false, error: 'username' };
    if (String(b.password || '').length < 6) return { ok: false, error: 'password' };
    var first = String(b.first || '').trim(), last = String(b.last || '').trim();
    var fullName = first && last ? first + ' ' + last : String(b.name || '').trim();
    if (!fullName || !String(b.church || '').trim()) return { ok: false, error: 'missing' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email || '').trim())) return { ok: false, error: 'email' };
    if (ROLES.indexOf(b.role) < 0) return { ok: false, error: 'missing' };
    if (b.role !== 'master' && emailTaken(p, b.email, '')) return { ok: false, error: 'emailtaken' };
    if (p.getProperty('un_' + un)) return { ok: false, error: 'taken' };
    var salt = randomText();
    var u = { id: randomText().slice(0, 12), username: un, name: fullName.slice(0, 40), first: first.slice(0, 20), last: last.slice(0, 20),
      phone: String(b.phone || '').slice(0, 25), email: String(b.email || '').slice(0, 60),
      church: String(b.church).trim().slice(0, 50), role: 'student', req: '', grade: String(b.grade || '').slice(0, 20),
      salt: salt, hash: sha(salt + b.password), tok: randomText(), score: 0, log: [], done: [], joined: Date.now() };
    if (b.role === 'master') {
      var okMaster = SETUP_CODE !== 'CHANGE_ME' && b.setup === SETUP_CODE && String(b.email || '').trim().toLowerCase() === MASTER_EMAIL
        && !allUsers(p).some(function (x) { return x.role === 'master'; });
      if (!okMaster) return { ok: false, error: 'master' };
      u.role = 'master';
    } else if (b.role !== 'student') {
      if (b.role === 'priest' && !anyPriest(p) && SETUP_CODE !== 'CHANGE_ME' && b.setup === SETUP_CODE) u.role = 'priest';
      else u.req = b.role;
    }
    p.setProperty('un_' + un, u.id);
    saveUser(p, u);
    return { ok: true, token: u.tok, user: publicUser(u) };
  }
  if (b.action === 'login') {
    var who = String(b.username || '').trim().toLowerCase();
    var id = p.getProperty('un_' + who);
    if (!id && who.indexOf('@') > 0) {
      var hit = allUsers(p).filter(function (x) { return String(x.email || '').toLowerCase() === who; })[0];
      id = hit && hit.id;
    }
    var raw = id && p.getProperty('u_' + id);
    if (!raw) return { ok: false, error: 'login' };
    var v = JSON.parse(raw);
    if (v.hash !== sha(v.salt + String(b.password || ''))) return { ok: false, error: 'login' };
    v.tok = randomText();
    saveUser(p, v);
    return { ok: true, token: v.tok, user: publicUser(v) };
  }
  if (b.action === 'attend') return attendAction(p, b);
  var me = getUser(p, b);
  if (!me) return { ok: false, error: 'auth' };
  if (b.action === 'me') return { ok: true, user: publicUser(me) };
  if (b.action === 'update') {
    me.name = String(b.name || me.name).trim().slice(0, 40);
    me.church = String(b.church || me.church).trim().slice(0, 50);
    me.grade = String(b.grade || '').slice(0, 20);
    me.phone = String(b.phone || '').slice(0, 25);
    if (String(b.email || '').trim() && emailTaken(p, b.email, me.id)) return { ok: false, error: 'emailtaken' };
    me.email = String(b.email || '').slice(0, 60);
    saveUser(p, me);
    return { ok: true, user: publicUser(me) };
  }
  if (b.action.indexOf('access_') === 0) return accessAction(p, me, b);
  if (b.action === 'att_set' || b.action === 'att_state') return attSetAction(p, me, b);
  if (/^att_(my|class|all|person|days|csv)$/.test(b.action)) return attStatsAction(p, me, b);
  if (/^lp_/.test(b.action)) return planAction(p, me, b);
  if (/^an_/.test(b.action)) return annAction(p, me, b);
  if (/^fu_/.test(b.action)) return fuAction(p, me, b);
  if (b.action === 'live_finish') {
    if (!isStaff(me.role)) return { ok: false, error: 'denied' };
    var sid = String(b.sid || '').slice(0, 30), list = (b.results || []).slice(0, 120), given = 0;
    list.forEach(function (r) {
      var rawU = p.getProperty('u_' + r.u);
      if (!rawU) return;
      var t = JSON.parse(rawU), key = 'live:' + sid;
      if (t.role !== 'student' || t.done.indexOf(key) >= 0) return;
      var pts = r.p === 1 ? 50 : r.p === 2 ? 30 : r.p === 3 ? 20 : 10;
      t.done.push(key);
      if (t.done.length > 300) t.done.shift();
      t.score += pts;
      t.log.unshift({ k: 'live', p: pts, t: Date.now(), n: String(b.title || '').slice(0, 40) });
      t.log = t.log.slice(0, 15);
      saveUser(p, t);
      given++;
    });
    return { ok: true, awarded: given };
  }
  if (b.action === 'sync_get') {
    var pr = p.getProperty('p_' + me.id);
    var dn = Number(p.getProperty('dn_' + me.id)) || 0, ds = '';
    for (var i = 0; i < dn; i++) ds += p.getProperty('d_' + me.id + '_' + i);
    return { ok: true, prefs: pr ? JSON.parse(pr) : {}, drafts: ds ? JSON.parse(ds) : [] };
  }
  if (b.action === 'sync_set') {
    if (b.prefs !== undefined) {
      var ps = JSON.stringify(b.prefs);
      if (ps.length > 8000) return { ok: false, error: 'full' };
      p.setProperty('p_' + me.id, ps);
    }
    if (b.drafts !== undefined) {
      var s = JSON.stringify(b.drafts);
      if (s.length > 60000) return { ok: false, error: 'full' };
      var old = Number(p.getProperty('dn_' + me.id)) || 0;
      var n = Math.ceil(s.length / 8000);
      for (var j = 0; j < n; j++) p.setProperty('d_' + me.id + '_' + j, s.substr(j * 8000, 8000));
      for (var k = n; k < old; k++) p.deleteProperty('d_' + me.id + '_' + k);
      p.setProperty('dn_' + me.id, String(n));
    }
    return { ok: true };
  }
  if (b.action === 'award') {
    var pts = pointsFor(me.role, b.kind, b.n);
    var key = b.kind + ':' + String(b.ref || '').slice(0, 40);
    if (!pts || me.done.indexOf(key) >= 0) return { ok: true, added: 0, user: publicUser(me), badges: [] };
    var rule = RULES[b.kind], day = today();
    if (!me.dc || me.dc.d !== day) me.dc = { d: day, s: {} };
    if (rule.cap) {
      pts = Math.min(pts, Math.max(0, rule.cap - (me.dc.s[b.kind] || 0)));
      if (!pts) return { ok: true, added: 0, capped: true, user: publicUser(me), badges: [] };
    }
    me.dc.s[b.kind] = (me.dc.s[b.kind] || 0) + pts;
    me.done.push(key);
    if (me.done.length > 300) me.done.shift();
    me.score += pts;
    me.cnt = me.cnt || {};
    me.cnt[b.kind] = (me.cnt[b.kind] || 0) + 1;
    me.log.unshift({ k: b.kind, p: pts, t: Date.now(), n: String(b.label || '').slice(0, 40) });
    me.log = me.log.slice(0, 15);
    var fresh = evalBadges(me);
    saveUser(p, me);
    return { ok: true, added: pts, user: publicUser(me), badges: fresh };
  }
  if (b.action === 'shop_buy') {
    var item = SHOP[b.item];
    me.own = me.own || [];
    if (!item) return { ok: false, error: 'item' };
    if (me.own.indexOf(b.item) >= 0) return { ok: false, error: 'owned' };
    if (me.score - (me.spent || 0) < item[0]) return { ok: false, error: 'poor' };
    me.spent = (me.spent || 0) + item[0];
    me.own.push(b.item);
    var fresh2 = evalBadges(me);
    saveUser(p, me);
    return { ok: true, user: publicUser(me), badges: fresh2 };
  }
  if (b.action === 'avatar_set') {
    var av = b.av || {}, clean = {};
    for (var k in AV_RANGES) {
      var v = Math.floor(Number(av[k]));
      if (!(v >= 0 && v < AV_RANGES[k])) return { ok: false, error: 'avatar' };
      clean[k] = v;
    }
    var slots = ['hat', 'halo', 'wings', 'robe', 'pet', 'bg', 'frame'];
    for (var i = 0; i < slots.length; i++) {
      var id = String(av[slots[i]] || '');
      if (id && (!SHOP[id] || SHOP[id][1] !== slots[i] || (me.own || []).indexOf(id) < 0)) return { ok: false, error: 'avatar' };
      clean[slots[i]] = id;
    }
    me.av = clean;
    saveUser(p, me);
    return { ok: true, user: publicUser(me) };
  }
  return { ok: false };
}

function doPost(e) {
  var b = JSON.parse(e.postData.contents);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = PropertiesService.getScriptProperties();
    if (['signup', 'login', 'me', 'update', 'award', 'attend', 'shop_buy', 'avatar_set'].indexOf(b.action) >= 0 || b.action.indexOf('att_') === 0 || b.action.indexOf('lp_') === 0 || b.action.indexOf('an_') === 0 || b.action.indexOf('fu_') === 0 || b.action.indexOf('access_') === 0 || b.action.indexOf('sync_') === 0 || b.action.indexOf('live_') === 0) return out(accountAction(p, b));
    var who = getUser(p, b);
    if (!who || !isStaff(who.role)) return out({ ok: false, error: 'denied' });
    if (b.action === 'delete') {
      p.setProperty('index', JSON.stringify(removeGame(p, b.gid)));
      return out({ ok: true });
    }
    if (b.action === 'save') {
      var g = b.game;
      g.church = who.church || '';
      var index = removeGame(p, g.id);
      var s = JSON.stringify(g);
      var n = Math.ceil(s.length / 8000);
      try {
        for (var i = 0; i < n; i++) p.setProperty('c_' + g.id + '_' + i, s.substr(i * 8000, 8000));
        p.setProperty('n_' + g.id, String(n));
        index.unshift({ id: g.id, t: g.t, title: g.title, grade: g.grade, lesson: g.lesson, church: g.church, updated: g.updated });
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
