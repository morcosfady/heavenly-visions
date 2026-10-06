/* TEST ONLY. Builds the real AI helper (ai-helper.gs + lumi.gs) with fake Google services, a fake games backend and a fake AI.
   Users: an id that starts with "kid" is a student, "serv" a servant, "coord" a coordinator, "abouna" a priest, anything else a servant.
   make({ cards: [...] or path, ai: fn(requestBody) -> answer text }) returns { post(body), props, cache, day } */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
exports.make = function (opts) {
  opts = opts || {};
  const src = ['ai-helper.gs', 'lumi.gs', 'lumi-ask.gs', 'lumi-learn.gs', 'lumi-admin.gs'].map(f => fs.readFileSync(path.join(root, 'apps-script', f), 'utf8')).join('\n').replace("var MAIN_URL = 'CHANGE_ME';", "var MAIN_URL = 'https://main.test/exec';");
  const props = opts.props || { ANTHROPIC_KEY: 'sk-fake' }, cacheMap = {};
  const env = { day: '2026-10-11', fetches: 0, aiCalls: [], cardsFetches: 0 };
  const PropertiesService = { getScriptProperties: () => ({
    getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v) },
    getProperties: () => Object.assign({}, props), deleteProperty: k => { delete props[k] }, getKeys: () => Object.keys(props) }) };
  const CacheService = { getScriptCache: () => ({ get: k => (k in cacheMap ? cacheMap[k] : null), put: (k, v) => { if (String(v).length > 100000) throw new Error('cache value too big'); cacheMap[k] = String(v) }, remove: k => { delete cacheMap[k] } }) };
  const cards = typeof opts.cards === 'string' ? fs.readFileSync(opts.cards, 'utf8') : JSON.stringify(opts.cards || JSON.parse(fs.readFileSync(path.join(root, 'lumi', 'cards.json'), 'utf8')));
  const UrlFetchApp = { fetch: (url, o) => {
    env.fetches++;
    if (url.indexOf('main.test') >= 0) {
      const b = JSON.parse(o.payload), id = String(b.id || '');
      if (opts.whoFn) { const w = opts.whoFn(id); if (w && b.token === 'ok') return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: true, user: Object.assign({ id, req: '', church: 'St Test' }, w) }) } }
      if (b.token !== 'ok') return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: false }) };
      const gm = id.match(/(\d+)/), grade = gm ? (+gm[1] <= 12 ? 'Grade ' + gm[1] : 'Grade 3') : (opts.grade || 'Grade 3');
      const role = /^(kid|k\d)/.test(id) ? 'student' : /^coord/.test(id) ? 'coordinator' : /^abouna/.test(id) ? 'priest' : 'servant';
      return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: true, user: { id, role, req: '', name: id, grade: /^(prek|kg)/i.test(id) ? (/^kg/i.test(id) ? 'KG' : 'Pre K') : grade, church: /^other/.test(id) ? 'St Other' : 'St Test' } }) };
    }
    if (url.indexOf('lumi/cards.json') >= 0) { env.cardsFetches++; return { getResponseCode: () => 200, getContentText: () => cards } }
    if (url.indexOf('anthropic') >= 0) {
      const body = JSON.parse(o.payload); env.aiCalls.push(body);
      const t = opts.ai ? opts.ai(body) : '{}';
      if (t === null) return { getResponseCode: () => 500, getContentText: () => 'err' };
      return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ content: [{ text: t }] }) };
    }
    return { getResponseCode: () => 404, getContentText: () => '' } } };
  let n = 0;
  const Utilities = { formatDate: () => env.day, getUuid: () => (++n).toString(16).padStart(8, '0') + '-bbbb-cccc-dddd-000000000000' };
  const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
  const ContentService = { MimeType: { JSON: 1 }, createTextOutput: s => ({ s, setMimeType() { return this } }) };
  const lib = new Function('PropertiesService', 'CacheService', 'UrlFetchApp', 'Utilities', 'LockService', 'ContentService', src + '; return {doPost, lumiSearch, lumiAll}')(PropertiesService, CacheService, UrlFetchApp, Utilities, LockService, ContentService);
  env.post = body => JSON.parse(lib.doPost({ postData: { contents: JSON.stringify(Object.assign({ token: 'ok' }, body)) } }).s);
  env.lib = lib; env.props = props; env.cache = cacheMap;
  return env;
};
