/* TEST MODE ONLY. Runs the real backend (apps-script/games-backend.gs) in memory with fake people and 12 fake Sundays,
   so the Attendance Sheet can be tried on localhost. It never touches the real Google script or real data.
   Run: node tests/att-server.js   then open http://localhost:8001/?api=http://localhost:8788#attsheet
   http://localhost:8788/creds shows the fake logins (role to id and token). */
const fs = require('fs'), crypto = require('crypto'), http = require('http');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'apps-script', 'games-backend.gs'), 'utf8')
  .replace("var SETUP_CODE = 'CHANGE_ME';", "var SETUP_CODE = 'T';").replace("var MASTER_EMAIL = 'CHANGE_ME';", "var MASTER_EMAIL = 'm@test.x';");
const store = {};
let SIMDAY = '2026-10-05';
const PropertiesService = { getScriptProperties: () => ({ getProperty: k => (k in store ? store[k] : null), setProperty: (k, v) => { store[k] = v },
  deleteProperty: k => { delete store[k] }, getProperties: () => Object.assign({}, store) }) };
const Utilities = { DigestAlgorithm: { SHA_256: 1 }, computeDigest: (a, t) => [...crypto.createHash('sha256').update(t).digest()].map(b => b > 127 ? b - 256 : b),
  getUuid: () => crypto.randomUUID(), formatDate: (d, tz, f) => (f && f.indexOf('HH') >= 0 ? '09:' + String(40 + Math.floor(Math.random() * 20)) : SIMDAY) };
const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
const MailApp = { sendEmail() {} };
const ContentService = { MimeType: { JSON: 1 }, createTextOutput: s => ({ s, setMimeType() { return this } }) };
const { doPost } = new Function('PropertiesService', 'Utilities', 'LockService', 'ContentService', 'MailApp', src + '; return {doPost}')(PropertiesService, Utilities, LockService, ContentService, MailApp);
const call = b => JSON.parse(doPost({ postData: { contents: JSON.stringify(b) } }).s);
const CH = 'St. Mark (Prosper)', T = {};
const EP = Date.UTC(2026, 0, 1), dn = s => Math.round((Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) - EP) / 86400000);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const su = (un, name, role, grade) => { const [first, ...rest] = name.split(' '); const r = call({ action: 'signup', username: un, password: 'secret1', first, last: rest.join(' ') || 'X', church: CH, role, grade, phone: '1', email: un + '@test.x', setup: 'T' });
  T[un] = { id: r.user.id, token: r.token, role: r.user.role }; return r };
const AS = (un, b) => call(Object.assign({ id: T[un].id, token: T[un].token }, b));
su('abouna', 'Abouna Mark', 'priest', '');
su('coord3', 'Mariam Gerges', 'coordinator', 'Grade 3'); AS('abouna', { action: 'access_set', target: T.coord3.id, role: 'coordinator', grade: 'Grade 3' });
su('serv3', 'Mina Samir', 'servant', 'Grade 3'); AS('coord3', { action: 'access_set', target: T.serv3.id, grade: 'Grade 3' });
su('serv3b', 'Sara Fawzy', 'servant', 'Grade 3'); AS('coord3', { action: 'access_set', target: T.serv3b.id, grade: 'Grade 3' });
su('serv4', 'Peter Adel', 'servant', 'Grade 4'); AS('abouna', { action: 'access_set', target: T.serv4.id, role: 'servant', grade: 'Grade 4' });
const kids3 = ['Mariam Hany', 'Youssef Nabil', 'Kyrillos Emad', 'Marina Sameh', 'George Wael', 'Teresa Maged', 'Abanoub Samy', 'David Fady'];
const kids4 = ['Joseph Adel', 'Rita Medhat', 'Antonios Hany', 'Veronica Ayman', 'Mark Kamal'];
kids3.forEach((n, i) => su('k3_' + i, n, 'student', 'Grade 3')); kids4.forEach((n, i) => su('k4_' + i, n, 'student', 'Grade 4'));
const prob = {}; Object.keys(T).forEach(u => { prob[u] = u.startsWith('k') || u.startsWith('serv') ? 0.25 + rnd() * 0.75 : 0 });
prob.k3_0 = 1; prob.k3_1 = 0.9; prob.k3_6 = 0.2; prob.k3_7 = 0.05;
Object.keys(T).forEach(u => { const k = 'u_' + T[u].id, x = JSON.parse(store[k]); x.joined = EP + dn('2026-07-10') * 86400000; store[k] = JSON.stringify(x) });
for (let i = 0; i < 12; i++) {
  const d = new Date(Date.UTC(2026, 6, 19 + 7 * i)); SIMDAY = d.toISOString().slice(0, 10);
  if (SIMDAY === '2026-08-30') { AS('coord3', { action: 'att_days', day: SIMDAY, off: true }); AS('abouna', { action: 'att_days', day: SIMDAY, off: true, grade: '*' }); continue }
  AS('coord3', { action: 'att_set', code: '123' });
  Object.keys(prob).forEach(u => { if (prob[u] && rnd() < prob[u]) call({ action: 'attend', id: T[u].id, token: T[u].token, code: '123' }) });
}
SIMDAY = '2026-10-05';
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return }
  if (req.method === 'GET') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(Object.fromEntries(Object.keys(T).map(u => [u, { user: JSON.parse(store['u_' + T[u].id]), token: T[u].token }])))); return }
  let body = ''; req.on('data', c => body += c); req.on('end', () => { res.setHeader('Content-Type', 'application/json'); res.end(doPost({ postData: { contents: body } }).s) });
}).listen(8788, () => console.log('fake backend on http://localhost:8788'));
