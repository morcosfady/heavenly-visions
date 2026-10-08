/* AI helper checks. Run: node tests/ai-sim.js
   Runs apps-script/ai-helper.gs with a fake games backend and a fake AI answer. No real key and no real internet. */
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'ai-helper.gs'), 'utf8').replace("var MAIN_URL = 'CHANGE_ME';", "var MAIN_URL = 'https://main.test/exec';");
const store = {}; let key = 'sk-test', aiCalls = 0, aiMode = 'good';
const props = { getProperty: k => (k in store ? store[k] : (k === 'ANTHROPIC_KEY' && key ? key : null)), setProperty: (k, v) => { store[k] = v } };
const PropertiesService = { getScriptProperties: () => props };
const USERS = { s1: { id: 's1', token: 't1', role: 'servant', req: '' }, st: { id: 'st', token: 'tk', role: 'student', req: '' }, pend: { id: 'pend', token: 'tp', role: 'student', req: 'servant' }, c1: { id: 'c1', token: 'tc', role: 'coordinator', req: '' } };
const GOOD = { games: [
  { t: 'kahoot', title: 'Noah quiz', items: [{ q: 'Who built the ark?', a: 'Noah', b: 'Moses', c: 'David', d: 'Paul', ok: 'a' }, { q: 'Bad', a: 'x' }] },
  { t: 'verse', title: 'Verse', items: [{ text: 'God saw that it was *good*.', ref: 'Genesis 1:31' }] },
  { t: 'wordsearch', title: 'Words', items: [{ w: 'ark!!', hint: 'boat' }, { w: 'no' }] },
  { t: 'hack', title: 'x', items: [{ text: 'x' }] },
  { t: 'whoami', title: 'Who', items: [{ ans: 'Noah', clues: ['I built a boat', 'I had a rainbow promise'] }] }] };
const UrlFetchApp = { fetch: (url, o) => {
  if (url.indexOf('main.test') >= 0) { const b = JSON.parse(o.payload); const u = USERS[b.id]; return { getContentText: () => JSON.stringify(u && u.token === b.token ? { ok: true, user: u } : { ok: false, error: 'auth' }), getResponseCode: () => 200 } }
  aiCalls++; if (aiMode === 'fail') return { getResponseCode: () => 500, getContentText: () => '' };
  const text = aiMode === 'junk' ? 'sorry' : 'Here you go: ' + JSON.stringify(GOOD);
  return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ content: [{ text }] }) } } };
const Utilities = { formatDate: () => '2026-10-11' };
const CacheService = { getScriptCache: () => ({ get: () => null, put() {}, remove() {} }) };
const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
const ContentService = { MimeType: { JSON: 1 }, createTextOutput: s => ({ s, setMimeType() { return this } }) };
const { doPost } = new Function('PropertiesService', 'CacheService', 'UrlFetchApp', 'Utilities', 'LockService', 'ContentService', src + '; return {doPost}')(PropertiesService, CacheService, UrlFetchApp, Utilities, LockService, ContentService);
const call = b => JSON.parse(doPost({ postData: { contents: JSON.stringify(b) } }).s);
const ok = (n, c) => console.log(c ? 'PASS' : 'FAIL', n);
const req = (id, extra) => Object.assign({ id, token: USERS[id] && USERS[id].token, topic: 'Noah', grade: 'Grade 3', kinds: [{ kind: 'kahoot', n: 3 }, { kind: 'verse', n: 1 }, { kind: 'wordsearch', n: 4 }, { kind: 'whoami', n: 1 }] }, extra);
ok('student is refused', call(req('st')).error === 'denied');
ok('pending servant is refused', call(req('pend')).error === 'denied');
ok('wrong token is refused', call(Object.assign(req('s1'), { token: 'bad' })).error === 'denied');
ok('no AI call was made for refused users', aiCalls === 0);
const r = call(req('s1'));
ok('servant gets games back', r.ok && r.games.length === 4 && r.left === 7);
ok('bad items are dropped', r.games.find(g => g.t === 'kahoot').items.length === 1 && r.games.find(g => g.t === 'wordsearch').items.length === 1);
ok('unknown game types are dropped', !r.games.some(g => g.t === 'hack'));
ok('words are cleaned to letters and capitals', r.games.find(g => g.t === 'wordsearch').items[0].w === 'ARK');
ok('who am I clues become one text with lines', r.games.find(g => g.t === 'whoami').items[0].clues.split('\n').length === 2);
ok('missing topic and text is refused', call(req('s1', { topic: '', text: '' })).error === 'missing');
ok('no game kinds is refused', call(req('s1', { kinds: [] })).error === 'missing');
for (let i = 0; i < 7; i++) call(req('s1'));
ok('daily limit per person stops the 9th request', call(req('s1')).error === 'limit');
const before = aiCalls; call(req('s1'));
ok('a stopped request makes no AI call', aiCalls === before);
ok('another servant still works', call(req('c1')).ok === true);
aiMode = 'fail'; ok('AI failure is reported and not counted', call(req('c1')).error === 'ai' && call(req('c1')).error === 'ai');
aiMode = 'junk'; ok('junk from the AI is reported', call(req('c1')).error === 'ai');
aiMode = 'good'; key = ''; ok('missing key is reported', call(req('c1')).error === 'nokey');
key = 'sk-test';
