/* TEST MODE ONLY. Serves the AI helper script on http://localhost:8789 with a fake AI answer and a fake "everyone is a servant" check,
   so the AI Helper screen can be tried: http://localhost:8001/?ai=http://localhost:8789#ai . No key, no internet, nothing real. */
const fs = require('fs'), path = require('path'), http = require('http');
const src = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'ai-helper.gs'), 'utf8').replace("var MAIN_URL = 'CHANGE_ME';", "var MAIN_URL = 'https://main.test/exec';");
const store = { ANTHROPIC_KEY: 'sk-fake' };
const PropertiesService = { getScriptProperties: () => ({ getProperty: k => (k in store ? store[k] : null), setProperty: (k, v) => { store[k] = v } }) };
const GOOD = { games: [
  { t: 'kahoot', title: 'Noah and the Ark quiz', items: [{ q: 'Who built the ark?', a: 'Noah', b: 'Moses', c: 'David', d: 'Paul', ok: 'a' }, { q: 'How many of each animal came in?', a: 'One', b: 'Two', c: 'Three', d: 'Ten', ok: 'b' }, { q: 'What did the dove bring back?', a: 'A fish', b: 'A flower', c: 'An olive leaf', d: 'A stone', ok: 'c' }] },
  { t: 'verse', title: 'Verse for Noah', items: [{ text: 'I set My *rainbow* in the *cloud*.', ref: 'Genesis 9:13' }] },
  { t: 'wordsearch', title: 'Noah words', items: [{ w: 'ARK', hint: 'The big boat' }, { w: 'DOVE', hint: 'Brought a leaf' }, { w: 'RAIN', hint: 'Fell for days' }, { w: 'NOAH', hint: 'Built the ark' }] }] };
const UrlFetchApp = { fetch: (url, o) => {
  if (url.indexOf('main.test') >= 0) { const b = JSON.parse(o.payload); return { getContentText: () => JSON.stringify({ ok: true, user: { id: b.id, role: 'servant', req: '' } }), getResponseCode: () => 200 } }
  return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ content: [{ text: JSON.stringify(GOOD) }] }) } } };
const Utilities = { formatDate: () => '2026-10-11' };
const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
const ContentService = { MimeType: { JSON: 1 }, createTextOutput: s => ({ s, setMimeType() { return this } }) };
const { doPost } = new Function('PropertiesService', 'UrlFetchApp', 'Utilities', 'LockService', 'ContentService', src + '; return {doPost}')(PropertiesService, UrlFetchApp, Utilities, LockService, ContentService);
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return }
  let body = ''; req.on('data', c => body += c); req.on('end', () => { res.setHeader('Content-Type', 'application/json'); setTimeout(() => res.end(doPost({ postData: { contents: body || '{}' } }).s), 1500) });
}).listen(8789, () => console.log('fake AI helper on http://localhost:8789'));
