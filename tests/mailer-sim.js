/* Mailer simulation. Run: node tests/mailer-sim.js
   Runs apps-script/welcome-mailer.gs with fake Apps Script services and checks the "access ready" email rules. */
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'welcome-mailer.gs'), 'utf8').replace("var MAIL_SECRET = 'CHANGE_ME';", "var MAIL_SECRET = 'mailsecret1';");
const cache = {}, sent = [];
const CacheService = { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v } }) };
const MailApp = { sendEmail: m => sent.push(m) };
const Utilities = { computeHmacSha256Signature: (t, k) => [...crypto.createHmac('sha256', k).update(t).digest()].map(b => b > 127 ? b - 256 : b) };
const ContentService = { MimeType: { JSON: 1 }, createTextOutput: s => ({ s, setMimeType() { return this } }) };
const { doPost } = new Function('CacheService', 'MailApp', 'Utilities', 'ContentService', src + '; return {doPost}')(CacheService, MailApp, Utilities, ContentService);
const TOKEN = (src.match(/var TOKEN = '([^']+)'/) || [])[1];
const post = b => JSON.parse(doPost({ postData: { contents: JSON.stringify(b) } }).s);
const ok = (n, c) => console.log(c ? 'PASS' : 'FAIL', n);
const mail = o => { const m = Object.assign({ to: 'new@x.com', first: 'Mariam', role: 'servant', grade: 'Grade 3', church: 'St. Mark', by: 'Abouna Mark', ts: Date.now() }, o); m.sig = crypto.createHmac('sha256', 'mailsecret1').update([m.to, m.first, m.role, m.grade, m.church, m.by, m.ts].join('|')).digest('hex'); return m; };
ok('sends the access email for signed data', post({ token: TOKEN, kind: 'granted', mail: mail() }).ok && sent.length === 1);
ok('subject, sender name and address', sent[0].subject === 'Your Heavenly Visions access is ready' && sent[0].name === 'Heavenly Visions' && sent[0].to === 'new@x.com');
ok('fills in name, church, grade and giver', /Your access is ready, Mariam!/.test(sent[0].htmlBody) && /St\. Mark/.test(sent[0].htmlBody) && /Grade 3/.test(sent[0].htmlBody) && /Abouna Mark/.test(sent[0].htmlBody) && !/\{\{/.test(sent[0].htmlBody));
ok('same person twice is sent once', post({ token: TOKEN, kind: 'granted', mail: mail() }).skipped === 'already sent' && sent.length === 1);
ok('wrong token is refused', post({ token: 'x', kind: 'granted', mail: mail({ to: 'a@x.com' }) }).error === 'auth');
const bad = mail({ to: 'b@x.com' }); bad.role = 'priest';
ok('changed data (bad signature) is refused', post({ token: TOKEN, kind: 'granted', mail: bad }).error === 'auth' && sent.length === 1);
ok('unsigned data is refused', post({ token: TOKEN, kind: 'granted', mail: Object.assign(mail({ to: 'c@x.com' }), { sig: '' }) }).error === 'auth');
ok('old data (over 2 hours) is refused', post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'd@x.com', ts: Date.now() - 3 * 3600 * 1000 }) }).error === 'auth');
ok('student and master are not valid for this email', post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'e@x.com', role: 'student' }) }).error === 'auth' && post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'e@x.com', role: 'master' }) }).error === 'auth');
post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'f@x.com', first: '<b>x</b>' }) });
ok('html in names is escaped', !/<b>x<\/b>/.test(sent[sent.length - 1].htmlBody));
ok('Abouna and coordinator versions exist', post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'g@x.com', role: 'priest', grade: '' }) }).ok && post({ token: TOKEN, kind: 'granted', mail: mail({ to: 'h@x.com', role: 'coordinator' }) }).ok);
ok('the old welcome email still works', post({ token: TOKEN, to: 'old@x.com', first: 'Mina', church: 'St', role: 'student' }).ok);
