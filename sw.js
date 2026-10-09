/* Heavenly Visions service worker.
   App shell: pre-cached, network first so updates arrive, cache when offline.
   Bible chapters and YouTube thumbnails: saved after the first view. Lesson lists from the backend: last good copy.
   Bump V when files change. */
const V='hv-v109',SHELL=V+'-shell',BIBLE='hv-bible',IMG='hv-img',API='hv-api';
const KEEP=[SHELL,BIBLE,IMG,API];
const F=['./','index.html','app.js','builder.js','profile.js','sync.js','theme.css','theme.js','ds.css','ds.js','design.js','clay2.js','layout.js','motion.js','motion.css','layout2.css','design-icons.js','intro.js','shell.js','kids.js','engage.js','games2.js','dailyverses.js','faith.js','bedtime.js','coloring.js','servants.js','church.js','arena.js','aihelper.js','lumi.js','lumi-chat.js','lumi-learn.js','privacy.html','offline.js','notify.js','welcome.js','qr.js','live.js','curriculum.js','verses.js','lessongames.js','attsheet.js','manifest.json','icon-180.png','icon-192.png','icon-512.png','logo.png','logo.webp','intro-poster.jpg',...['book','game','trophy','notes','megaphone','calendar','palette','moon','star','cross','church','dove','pray','user','toolbox','lock'].map(n=>'icons3d/'+n+'.webp')];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>Promise.allSettled(F.map(f=>c.add(f)))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>!KEEP.includes(x)).map(x=>caches.delete(x)))));self.clients.claim()});
const trim=async(name,max)=>{const c=await caches.open(name),k=await c.keys();if(k.length>max)await Promise.all(k.slice(0,k.length-max).map(x=>c.delete(x)))};
const swr=(req,name,max)=>caches.open(name).then(async c=>{const hit=await c.match(req);const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){c.put(req,r.clone());if(max)trim(name,max)}return r}).catch(()=>hit);return hit||net});
const netFirst=(req,name)=>fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(name).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req,{ignoreSearch:name===SHELL}).then(h=>h||(req.mode==='navigate'?caches.match('index.html',{ignoreSearch:true}):undefined)));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){if(/\.mp4$/.test(u.pathname))return;e.respondWith(netFirst(r,SHELL));return}
  if(u.hostname==='bible-api.com'){e.respondWith(swr(r,BIBLE,400));return}
  if(u.hostname==='i.ytimg.com'||u.hostname==='img.youtube.com'){e.respondWith(swr(r,IMG,150));return}
  if(u.hostname==='script.google.com'&&/[?&]action=(list|get)\b/.test(u.search)){e.respondWith(netFirst(r,API));return}
});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
