/* Heavenly Visions: offline helpers. A friendly banner when the phone is offline, a queue for stars earned offline,
   a small copy of the last announcements and events, and the "Available offline" chip. */
(function(){
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};

/* last good copy of small lists (announcements, events) */
window.hvCacheSet=(k,v)=>jset("hv_oc_"+k,{t:Date.now(),v});
window.hvCacheGet=k=>{const c=jget("hv_oc_"+k,null);return c?c.v:null};
window.hvOffline=()=>navigator.onLine===false;

/* banner */
const bar=document.createElement("div");bar.id="offbar";bar.setAttribute("role","status");bar.hidden=true;
bar.innerHTML=`<span>📴</span> You are offline. Saved things still work.`;
document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(bar));
if(document.body)document.body.appendChild(bar);
const paint=()=>{bar.hidden=navigator.onLine!==false;document.documentElement.classList.toggle("is-offline",navigator.onLine===false)};
addEventListener("offline",paint);
addEventListener("online",()=>{paint();flush(true);if(window.toast)toast("Back online ✅")});
paint();

/* stars earned while offline wait here and are sent later (the server still checks every one) */
window.hvQueueAward=function(kind,ref,label,n){const q=jget("hv_queue",[]);if(q.some(x=>x.kind===kind&&x.ref===ref))return;q.push({kind,ref,label,n,t:Date.now()});jset("hv_queue",q.slice(-60));
  if(window.toast)toast("Saved. Your stars will arrive when you are online ⭐")};
let flushing=false;
async function flush(){if(flushing||navigator.onLine===false||!window.hvAcct||!hvAcct()||!window.hvAward)return;flushing=true;
  try{const q=jget("hv_queue",[]);jset("hv_queue",[]);
    for(const x of q){if(Date.now()-x.t>7*86400000)continue;await hvAward(x.kind,x.ref,x.label,x.n)}}
  finally{flushing=false}}
window.hvFlushQueue=flush;
setTimeout(flush,4000);

/* "Available offline" chip for the home screen */
window.hvOfflineChip=function(){
  const ok=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
  return ok?`<span class="offchip" title="The app works without internet for lessons, quizzes, games and the calendar">✅ Available offline</span>`:""};

const st=document.createElement("style");
st.textContent=`
#offbar{position:fixed;left:50%;top:max(8px,env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2650;padding:8px 16px;border-radius:999px;background:#3a2f12;color:#ffe9a8;border:1px solid #e3b45c;font-weight:800;font-size:.85rem;box-shadow:0 8px 24px rgba(0,0,0,.4);white-space:nowrap}
#offbar[hidden]{display:none}
.offchip{display:none}
.offdot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px color-mix(in srgb,var(--good) 28%,transparent)}
`;
document.head.appendChild(st);
})();
