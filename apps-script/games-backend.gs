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
  lesson: { student: 5, servant: 0 },
  selfplay: { student: 10, servant: 0 },
  publish: { student: 0, servant: 20 },
  livewin: { student: 0, servant: 0 }
};

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

function pointsFor(role, kind) {
  var rule = RULES[kind];
  if (!rule) return 0;
  return role === 'student' ? rule.student : rule.servant;
}

function publicUser(u) {
  return { id: u.id, username: u.username, name: u.name, church: u.church, role: u.role,
    grade: u.grade, req: u.req || '', score: u.score, log: u.log, joined: u.joined };
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
    p.setProperty('att_code', JSON.stringify({ day: day, code: code, by: me.name }));
    return { ok: true, day: day, code: code };
  }
  var raw = p.getProperty('att_code');
  var c = raw ? JSON.parse(raw) : null;
  var list = JSON.parse(p.getProperty('att_' + day) || '[]');
  return { ok: true, day: day, code: c && c.day === day ? c.code : '', by: c && c.day === day ? c.by : '', list: list };
}

/* Welcome emails (made from emails/welcome-*.html by apps-script/embed-emails.py). {{name}} and {{church}} are filled in when sending. */
var EMAIL_TPL = {"student": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Welcome to Heavenly Visions</title>\n</head>\n<body style=\"margin:0;padding:0;background:#141a2b;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#141a2b;padding:24px 12px;\">\n<tr><td align=\"center\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;\">\n\n  <tr><td align=\"center\" style=\"padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);\">\n    <img src=\"https://morcosfady.github.io/heavenly-visions/logo.png\" width=\"230\" alt=\"Heavenly Visions\" style=\"display:block;width:230px;max-width:70%;height:auto;border:0;\">\n    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;\">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <div style=\"font-size:42px;line-height:1;\">&#10013;&#65039;</div>\n    <h1 style=\"margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;\">Welcome, {{name}}!</h1>\n    <div style=\"display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;\">&#127890; Student</div>\n    <p style=\"margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;\">We are so happy you joined the Heavenly Visions family at<br><b style=\"color:#f3ecdf;\">{{church}}</b> &#128591;</p>\n  </td></tr>\n\n  <tr><td style=\"padding:20px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;\">\n      <tr><td style=\"padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;\">\n        &ldquo;Let the little children come to Me.&rdquo;<br>\n        <span style=\"color:#e3b45c;font-weight:bold;\">Matthew 19:14</span>\n      </td></tr>\n    </table>\n  </td></tr>\n\n  <tr><td style=\"padding:24px 28px 4px;\">\n    <h2 style=\"margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;\">What is waiting for you</h2>\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:15px;line-height:1.5;color:#e8e2d6;\"><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127916;</td><td style=\"padding:8px 0;\"><b>Sunday School</b><br><span style=\"color:#b9b6c6;\">Lesson videos for every grade</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127918;</td><td style=\"padding:8px 0;\"><b>Games</b><br><span style=\"color:#b9b6c6;\">Play, match and learn with your class</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127942;</td><td style=\"padding:8px 0;\"><b>Quizzes</b><br><span style=\"color:#b9b6c6;\">Test what you know and collect stars</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128214;</td><td style=\"padding:8px 0;\"><b>The Bible</b><br><span style=\"color:#b9b6c6;\">Read God&rsquo;s Word anywhere</span></td></tr></table>\n  </td></tr>\n\n  <tr><td style=\"padding:16px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:linear-gradient(135deg,#f6d27a,#e3b45c);border-radius:18px;\">\n      <tr><td align=\"center\" style=\"padding:20px 18px;color:#2b1d05;\">\n        <div style=\"font-size:30px;\">&#11088;</div>\n        <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;margin:4px 0;\">Collect points and level up</div>\n        <div style=\"font-size:14px;line-height:1.6;\">Check in at class (+10), finish games (+10) and win live challenges (+50).<br>Grow from <b>Seedling</b> to <b>Champion</b> &#128081;</div>\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <a href=\"https://morcosfady.github.io/heavenly-visions/#profile\" style=\"display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;\">Open Heavenly Visions &#8594;</a>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;\">\n    Glory be to God forever. Amen. &#10013;&#65039;<br>\n    You received this email because you created a profile on Heavenly Visions.<br>\n    <a href=\"https://www.youtube.com/@Heavenly-Visions1\" style=\"color:#e3b45c;text-decoration:none;\">Watch us on YouTube</a>\n  </td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n", "servant": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Welcome to Heavenly Visions</title>\n</head>\n<body style=\"margin:0;padding:0;background:#141a2b;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#141a2b;padding:24px 12px;\">\n<tr><td align=\"center\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;\">\n\n  <tr><td align=\"center\" style=\"padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);\">\n    <img src=\"https://morcosfady.github.io/heavenly-visions/logo.png\" width=\"230\" alt=\"Heavenly Visions\" style=\"display:block;width:230px;max-width:70%;height:auto;border:0;\">\n    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;\">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <div style=\"font-size:42px;line-height:1;\">&#10013;&#65039;</div>\n    <h1 style=\"margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;\">Welcome, {{name}}!</h1>\n    <div style=\"display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;\">&#128591; Servant</div>\n    <p style=\"margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;\">Thank you for serving with us at<br><b style=\"color:#f3ecdf;\">{{church}}</b> &#128591;</p>\n  </td></tr>\n\n  <tr><td style=\"padding:20px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;\">\n      <tr><td style=\"padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;\">\n        &ldquo;Let the little children come to Me.&rdquo;<br>\n        <span style=\"color:#e3b45c;font-weight:bold;\">Matthew 19:14</span>\n      </td></tr>\n    </table>\n  </td></tr>\n\n  <tr><td style=\"padding:24px 28px 4px;\">\n    <h2 style=\"margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;\">Your tools as a servant</h2>\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:15px;line-height:1.5;color:#e8e2d6;\"><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128736;&#65039;</td><td style=\"padding:8px 0;\"><b>Servants Workshop</b><br><span style=\"color:#b9b6c6;\">Build Kahoot quizzes, Jeopardy, word searches and more in minutes</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#9995;</td><td style=\"padding:8px 0;\"><b>Attendance</b><br><span style=\"color:#b9b6c6;\">See who checked in to your class today</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127916;</td><td style=\"padding:8px 0;\"><b>Lessons</b><br><span style=\"color:#b9b6c6;\">Every lesson video, ready to share with parents</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128214;</td><td style=\"padding:8px 0;\"><b>The Bible</b><br><span style=\"color:#b9b6c6;\">Read God&rsquo;s Word anywhere</span></td></tr></table>\n  </td></tr>\n\n  <tr><td style=\"padding:16px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:linear-gradient(135deg,#f6d27a,#e3b45c);border-radius:18px;\">\n      <tr><td align=\"center\" style=\"padding:20px 18px;color:#2b1d05;\">\n        <div style=\"font-size:30px;\">&#11088;</div>\n        <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;margin:4px 0;\">You earn points too</div>\n        <div style=\"font-size:14px;line-height:1.6;\">Check in at class (+5) and publish a game for the kids (+20).<br>Every game you share helps a child learn &#127775;</div>\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td style=\"padding:18px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;\">\n      <tr><td style=\"padding:16px 18px;font-size:14px;line-height:1.6;color:#e8e2d6;\">\n        &#9203; <b style=\"color:#f6d27a;\">Waiting for approval</b><br>Your request to serve is waiting for approval from a coordinator or priest. We will let you know as soon as it is approved. Until then you can enjoy the app as a guest. &#128591;\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <a href=\"https://morcosfady.github.io/heavenly-visions/#profile\" style=\"display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;\">Open my profile &#8594;</a>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;\">\n    Glory be to God forever. Amen. &#10013;&#65039;<br>\n    You received this email because you created a profile on Heavenly Visions.<br>\n    <a href=\"https://www.youtube.com/@Heavenly-Visions1\" style=\"color:#e3b45c;text-decoration:none;\">Watch us on YouTube</a>\n  </td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n", "coordinator": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Welcome to Heavenly Visions</title>\n</head>\n<body style=\"margin:0;padding:0;background:#141a2b;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#141a2b;padding:24px 12px;\">\n<tr><td align=\"center\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;\">\n\n  <tr><td align=\"center\" style=\"padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);\">\n    <img src=\"https://morcosfady.github.io/heavenly-visions/logo.png\" width=\"230\" alt=\"Heavenly Visions\" style=\"display:block;width:230px;max-width:70%;height:auto;border:0;\">\n    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;\">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <div style=\"font-size:42px;line-height:1;\">&#10013;&#65039;</div>\n    <h1 style=\"margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;\">Welcome, {{name}}!</h1>\n    <div style=\"display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;\">&#129517; Coordinator</div>\n    <p style=\"margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;\">Thank you for leading your grade at<br><b style=\"color:#f3ecdf;\">{{church}}</b> &#128591;</p>\n  </td></tr>\n\n  <tr><td style=\"padding:20px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;\">\n      <tr><td style=\"padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;\">\n        &ldquo;Let the little children come to Me.&rdquo;<br>\n        <span style=\"color:#e3b45c;font-weight:bold;\">Matthew 19:14</span>\n      </td></tr>\n    </table>\n  </td></tr>\n\n  <tr><td style=\"padding:24px 28px 4px;\">\n    <h2 style=\"margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;\">Your tools as a coordinator</h2>\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:15px;line-height:1.5;color:#e8e2d6;\"><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128273;</td><td style=\"padding:8px 0;\"><b>Manage access</b><br><span style=\"color:#b9b6c6;\">Welcome and approve the servants in your grade</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128736;&#65039;</td><td style=\"padding:8px 0;\"><b>Servants Workshop</b><br><span style=\"color:#b9b6c6;\">Build games and quizzes for your class</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#9995;</td><td style=\"padding:8px 0;\"><b>Attendance</b><br><span style=\"color:#b9b6c6;\">See who checked in today</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127916;</td><td style=\"padding:8px 0;\"><b>Lessons</b><br><span style=\"color:#b9b6c6;\">Every lesson video in one place</span></td></tr></table>\n  </td></tr>\n\n  <tr><td style=\"padding:16px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:linear-gradient(135deg,#f6d27a,#e3b45c);border-radius:18px;\">\n      <tr><td align=\"center\" style=\"padding:20px 18px;color:#2b1d05;\">\n        <div style=\"font-size:30px;\">&#11088;</div>\n        <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;margin:4px 0;\">You earn points too</div>\n        <div style=\"font-size:14px;line-height:1.6;\">Check in at class (+5) and publish a game for the kids (+20).</div>\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td style=\"padding:18px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;\">\n      <tr><td style=\"padding:16px 18px;font-size:14px;line-height:1.6;color:#e8e2d6;\">\n        &#9203; <b style=\"color:#f6d27a;\">Waiting for approval</b><br>Your request to serve as a coordinator is waiting for approval from a priest. We will let you know as soon as it is approved. Until then you can enjoy the app as a guest. &#128591;\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <a href=\"https://morcosfady.github.io/heavenly-visions/#profile\" style=\"display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;\">Open my profile &#8594;</a>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;\">\n    Glory be to God forever. Amen. &#10013;&#65039;<br>\n    You received this email because you created a profile on Heavenly Visions.<br>\n    <a href=\"https://www.youtube.com/@Heavenly-Visions1\" style=\"color:#e3b45c;text-decoration:none;\">Watch us on YouTube</a>\n  </td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n", "priest": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Welcome to Heavenly Visions</title>\n</head>\n<body style=\"margin:0;padding:0;background:#141a2b;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#141a2b;padding:24px 12px;\">\n<tr><td align=\"center\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;\">\n\n  <tr><td align=\"center\" style=\"padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);\">\n    <img src=\"https://morcosfady.github.io/heavenly-visions/logo.png\" width=\"230\" alt=\"Heavenly Visions\" style=\"display:block;width:230px;max-width:70%;height:auto;border:0;\">\n    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;\">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <div style=\"font-size:42px;line-height:1;\">&#10013;&#65039;</div>\n    <h1 style=\"margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;\">Welcome, {{name}}!</h1>\n    <div style=\"display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;\">&#9962; Priest</div>\n    <p style=\"margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;\">Welcome, and thank you for your blessing on our app at<br><b style=\"color:#f3ecdf;\">{{church}}</b> &#128591;</p>\n  </td></tr>\n\n  <tr><td style=\"padding:20px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;\">\n      <tr><td style=\"padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;\">\n        &ldquo;Let the little children come to Me.&rdquo;<br>\n        <span style=\"color:#e3b45c;font-weight:bold;\">Matthew 19:14</span>\n      </td></tr>\n    </table>\n  </td></tr>\n\n  <tr><td style=\"padding:24px 28px 4px;\">\n    <h2 style=\"margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;\">What you can do</h2>\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:15px;line-height:1.5;color:#e8e2d6;\"><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128273;</td><td style=\"padding:8px 0;\"><b>Manage access</b><br><span style=\"color:#b9b6c6;\">Approve coordinators and servants, and assign their grades</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128101;</td><td style=\"padding:8px 0;\"><b>Your team</b><br><span style=\"color:#b9b6c6;\">See everyone who serves, with their contact details</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127916;</td><td style=\"padding:8px 0;\"><b>Lessons</b><br><span style=\"color:#b9b6c6;\">Every lesson video in one place</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128214;</td><td style=\"padding:8px 0;\"><b>The Bible</b><br><span style=\"color:#b9b6c6;\">Read God&rsquo;s Word anywhere</span></td></tr></table>\n  </td></tr>\n\n  <tr><td style=\"padding:18px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;\">\n      <tr><td style=\"padding:16px 18px;font-size:14px;line-height:1.6;color:#e8e2d6;\">\n        &#9203; <b style=\"color:#f6d27a;\">Waiting for approval</b><br>Your request is waiting for approval. We will let you know as soon as it is approved. Until then you can view the app as a guest. &#128591;\n      </td></tr>\n    </table>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <a href=\"https://morcosfady.github.io/heavenly-visions/#profile\" style=\"display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;\">Open my profile &#8594;</a>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;\">\n    Glory be to God forever. Amen. &#10013;&#65039;<br>\n    You received this email because you created a profile on Heavenly Visions.<br>\n    <a href=\"https://www.youtube.com/@Heavenly-Visions1\" style=\"color:#e3b45c;text-decoration:none;\">Watch us on YouTube</a>\n  </td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n", "master": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Welcome to Heavenly Visions</title>\n</head>\n<body style=\"margin:0;padding:0;background:#141a2b;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#141a2b;padding:24px 12px;\">\n<tr><td align=\"center\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;\">\n\n  <tr><td align=\"center\" style=\"padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);\">\n    <img src=\"https://morcosfady.github.io/heavenly-visions/logo.png\" width=\"230\" alt=\"Heavenly Visions\" style=\"display:block;width:230px;max-width:70%;height:auto;border:0;\">\n    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;\">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <div style=\"font-size:42px;line-height:1;\">&#10013;&#65039;</div>\n    <h1 style=\"margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;\">Welcome, {{name}}!</h1>\n    <div style=\"display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;\">&#128081; Master</div>\n    <p style=\"margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;\">Your Master profile is ready for<br><b style=\"color:#f3ecdf;\">{{church}}</b> &#128591;</p>\n  </td></tr>\n\n  <tr><td style=\"padding:20px 28px 4px;\">\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;\">\n      <tr><td style=\"padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;\">\n        &ldquo;Let the little children come to Me.&rdquo;<br>\n        <span style=\"color:#e3b45c;font-weight:bold;\">Matthew 19:14</span>\n      </td></tr>\n    </table>\n  </td></tr>\n\n  <tr><td style=\"padding:24px 28px 4px;\">\n    <h2 style=\"margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;\">Everything you control</h2>\n    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:15px;line-height:1.5;color:#e8e2d6;\"><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128273;</td><td style=\"padding:8px 0;\"><b>Manage access</b><br><span style=\"color:#b9b6c6;\">Approve priests, coordinators and servants, and assign grades</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#128736;&#65039;</td><td style=\"padding:8px 0;\"><b>Servants Workshop</b><br><span style=\"color:#b9b6c6;\">Build and publish games and quizzes</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#127942;</td><td style=\"padding:8px 0;\"><b>Leaderboard</b><br><span style=\"color:#b9b6c6;\">See how the whole community is growing</span></td></tr><tr><td width=\"44\" style=\"padding:8px 0;font-size:26px;\" valign=\"top\">&#9962;</td><td style=\"padding:8px 0;\"><b>Churches</b><br><span style=\"color:#b9b6c6;\">Every Coptic Orthodox church in Dallas Fort Worth</span></td></tr></table>\n  </td></tr>\n\n  <tr><td align=\"center\" style=\"padding:28px 28px 8px;\">\n    <a href=\"https://morcosfady.github.io/heavenly-visions/#profile\" style=\"display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;\">Open my profile &#8594;</a>\n  </td></tr>\n  <tr><td align=\"center\" style=\"padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;\">\n    Glory be to God forever. Amen. &#10013;&#65039;<br>\n    You received this email because you created a profile on Heavenly Visions.<br>\n    <a href=\"https://www.youtube.com/@Heavenly-Visions1\" style=\"color:#e3b45c;text-decoration:none;\">Watch us on YouTube</a>\n  </td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>\n"};

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

function escHtml(t) {
  return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sendWelcome(u) {
  try {
    var tpl = EMAIL_TPL[u.req || u.role];
    if (!tpl || !u.email) return;
    var html = tpl.replace(/\{\{name\}\}/g, escHtml(u.first || u.name)).replace(/\{\{church\}\}/g, escHtml(u.church));
    MailApp.sendEmail({ to: u.email, subject: 'Welcome to Heavenly Visions', htmlBody: html, name: 'Heavenly Visions', replyTo: MASTER_EMAIL });
  } catch (err) {}
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
    sendWelcome(u);
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
    var pts = pointsFor(me.role, b.kind);
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
    if (['signup', 'login', 'me', 'update', 'award', 'attend'].indexOf(b.action) >= 0 || b.action.indexOf('att_') === 0 || b.action.indexOf('access_') === 0 || b.action.indexOf('sync_') === 0 || b.action.indexOf('live_') === 0) return out(accountAction(p, b));
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
