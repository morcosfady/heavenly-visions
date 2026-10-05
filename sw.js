const C='hv-v33';const F=['./','index.html','builder.js','profile.js','sync.js','theme.css','theme.js','qr.js','live.js','curriculum.js','verses.js','lessongames.js','manifest.json','icon-192.png','icon-512.png','intro-poster.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.endsWith('.mp4')||u.pathname.endsWith('.mp3')||e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.status===200){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request)))});
