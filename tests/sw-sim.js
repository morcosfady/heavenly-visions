/* Service worker logic check. Run: node tests/sw-sim.js
   Loads sw.js with fake caches and fetch, then plays online and offline requests. */
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const stores = {}; let online = true; const handlers = {};
const abs = r => (typeof r === 'string' ? new URL(r, 'http://x/').href : r.url);
const mkCache = name => (stores[name] = stores[name] || new Map(), { match: async (r) => stores[name].get(abs(r)) || [...stores[name]].find(([k]) => k.split('?')[0] === abs(r).split('?')[0])?.[1], put: async (r, v) => { stores[name].set(typeof r === 'string' ? r : r.url, v) }, add: async f => { stores[name].set('http://x/' + f, { ok: true, body: f, clone() { return this } }) }, keys: async () => [...stores[name].keys()].map(url => ({ url })), delete: async r => stores[name].delete(r.url) });
const caches = { open: async n => mkCache(n), keys: async () => Object.keys(stores), delete: async n => delete stores[n], match: async (r, o) => { for (const n of Object.keys(stores)) { const c = mkCache(n); const v = await c.match(r); if (v) return v } } };
const self = { addEventListener: (t, f) => { handlers[t] = f }, skipWaiting() {}, clients: { claim() {} }, location: { origin: 'http://x' } };
const fetchFn = async req => { if (!online) throw new Error('offline'); return { ok: true, status: 200, type: 'basic', body: 'net:' + req.url, clone() { return this } } };
new Function('self', 'caches', 'fetch', 'location', 'URL', 'Promise', src + ';')(self, caches, fetchFn, self.location, URL, Promise);
const call = req => new Promise(res => { handlers.fetch({ request: req, respondWith: p => res(p) }) || res(undefined) });
const ok = (n, c) => console.log(c ? 'PASS' : 'FAIL', n);
(async () => {
  await new Promise(r => handlers.install({ waitUntil: p => p.then(r) }));
  ok('shell is pre-cached', stores['hv-v80-shell'].size >= 20);
  const page = { method: 'GET', url: 'http://x/index.html', mode: 'navigate' };
  ok('online page comes from the network', (await call(page)).body.startsWith('net:'));
  online = false;
  ok('offline page comes from the cache', (await call(page)).body !== undefined);
  ok('offline script with a version tag still works', !!(await call({ method: 'GET', url: 'http://x/shell.js?v=3', mode: 'no-cors' })));
  ok('offline unknown page falls back to index', !!(await call({ method: 'GET', url: 'http://x/somewhere', mode: 'navigate' })));
  online = true;
  await call({ method: 'GET', url: 'https://bible-api.com/John%203', mode: 'cors' });
  await new Promise(r => setTimeout(r, 20));
  online = false;
  ok('bible chapter is saved after the first read', !!(await call({ method: 'GET', url: 'https://bible-api.com/John%203', mode: 'cors' })));
  ok('POST requests are never touched', (await call({ method: 'POST', url: 'https://script.google.com/x' })) === undefined);
  ok('video files are left alone', (await call({ method: 'GET', url: 'http://x/intro.mp4', mode: 'no-cors' })) === undefined);
  online = true;
  await call({ method: 'GET', url: 'https://script.google.com/macros/s/ABC/exec?action=list', mode: 'cors' });
  await new Promise(r => setTimeout(r, 20));
  online = false;
  ok('games list is served from the saved copy offline', !!(await call({ method: 'GET', url: 'https://script.google.com/macros/s/ABC/exec?action=list', mode: 'cors' })));
  await new Promise(r => handlers.activate({ waitUntil: p => p.then(r) }));
  ok('old caches are removed on activate', !Object.keys(stores).some(k => k.startsWith('hv-v4') && !k.startsWith('hv-v54')));
})();
