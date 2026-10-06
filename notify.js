/* Heavenly Visions: in-app notifications (the bell). Nothing is sent to the phone lock screen.
   The app checks for news when it opens: new announcements, new games for your class, Sunday School tomorrow,
   a new daily verse, events tomorrow, level ups and badges. Everything is kept on this phone. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
async function call(body){const a=A();const r=await fetch(window.GAMES_URL,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const list=()=>jget("hv_notifs",[]);
const unread=()=>list().filter(n=>!n.read).length;

window.hvNotify=function(n){const l=list();if(l.some(x=>x.id===n.id))return false;l.unshift(Object.assign({ts:Date.now(),read:false},n));jset("hv_notifs",l.slice(0,40));paint();return true};
function paint(){const b=document.getElementById("sbBell");if(!b)return;const n=unread(),dot=b.querySelector(".sb-badge");
  if(dot){dot.hidden=!n;dot.textContent=n>9?"9+":n}b.setAttribute("aria-label",n?n+" new notifications":"Notifications")}
window.hvBellPaint=paint;

function panel(){
  const l=list();
  const sh=sheet(`<h3>🔔 Notifications</h3>${l.length?`<div class="nlist">${l.map((n,i)=>`<button class="nit ${n.read?"":"new"}" data-i="${i}"><span class="ni">${E(n.ic||"🔔")}</span><span class="nm"><b>${E(n.t)}</b>${n.m?`<small>${E(n.m)}</small>`:""}<small>${ago(n.ts)}</small></span>${n.read?"":`<i class="andot"></i>`}</button>`).join("")}</div><button class="btn alt" id="nread">Mark all as read</button>`:`<div class="ds-empty"><div class="em">🔔</div><b>All caught up</b>New things will show here.</div>`}`,"Notifications");
  sh.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b){const l2=list(),n=l2[+b.dataset.i];if(!n)return;n.read=true;jset("hv_notifs",l2);paint();closeSheet();if(n.go)go(n.go);return}
    if(e.target.closest("#nread")){const l2=list();l2.forEach(n=>n.read=true);jset("hv_notifs",l2);paint();closeSheet()}})}
function ago(ts){const m=Math.round((Date.now()-ts)/60000);return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" hours ago":Math.round(m/1440)+" days ago"}
document.addEventListener("click",e=>{if(e.target.closest("#sbBell")){e.preventDefault();e.stopPropagation();scan().finally(()=>{});panel()}},true);

/* what to check, each time the app opens (at most once every 10 minutes) */
let last=0;
async function scan(force){
  const a=A();if(!a||!window.GAMES_URL||navigator.onLine===false)return;
  if(!force&&Date.now()-last<600000)return;last=Date.now();
  const today=dkey(new Date()),tomorrow=dkey(new Date(Date.now()+86400000));
  try{const v=JSON.parse(localStorage.getItem("hv_verse")||"{}").days||{};const h=new Date().getHours();
    if(h>=6&&!v[today])hvNotify({id:"verse-"+today,ic:"📜",t:"Your daily verse is ready",m:"Learn it and earn 5 stars",go:"verse"})}catch{}
  const u=a.user;
  try{const r=await call({action:"an_list"});if(r.ok){hvCacheSet&&hvCacheSet("an",r.items);const seen=jget("hv_an_seen",[]);
    r.items.slice(0,5).forEach(x=>{if(!seen.includes(x.id)&&!(r.mine&&x.by===u.name))hvNotify({id:"an-"+x.id,ic:x.ic||"📢",t:"New: "+x.title,m:"From "+(x.by||"your teachers"),go:"news"})})}}catch{}
  if(u.grade){try{const r=await call({action:"lp_this"});if(r.ok&&r.lesson&&(r.lesson.date===tomorrow||r.lesson.date===today))hvNotify({id:"sun-"+r.lesson.date,ic:"📝",t:r.lesson.date===today?"Sunday School is today":"Sunday School is tomorrow",m:r.lesson.title,go:"home"})}catch{}}
  try{const g=(await (await fetch(window.GAMES_URL+"?action=list")).json()).games||[];const key="hv_seen_games",first=!localStorage.getItem(key),seen=jget(key,[]);
    const mine=g.filter(x=>(!x.church||x.church===u.church)&&(!u.grade||!x.grade||((typeof SECTIONS!=="undefined"&&SECTIONS.find(s=>s.id===x.grade)||{}).name===u.grade)));
    mine.forEach(x=>{if(!seen.includes(x.id)){seen.push(x.id);if(!first)hvNotify({id:"game-"+x.id,ic:"🎮",t:"New game: "+(x.title||"Game"),m:"Ready for your class",go:"gplay-"+x.id})}});jset(key,seen.slice(-80))}catch{}
  try{const ev=window.hvLoadEvents?await hvLoadEvents():[];ev.filter(x=>x.date===tomorrow).forEach(x=>hvNotify({id:"ev-"+x.id+"-"+x.date,ic:x.ic||"🎉",t:x.title+" is tomorrow",m:x.place||"",go:"events"}))}catch{}
  paint()}
window.hvNotifScan=scan;

/* level ups, badges and the Arena winner make a note too */
const lu=window.hvLevelUp;if(lu)window.hvLevelUp=function(l){hvNotify({id:"lv-"+l.name,ic:l.ic,t:"Level up! You are a "+l.name,go:"kids"});return lu(l)};
const bt=window.hvBadgeToast;if(bt)window.hvBadgeToast=function(keys){(keys||[]).forEach(k=>hvNotify({id:"bd-"+k,ic:"🏅",t:"You earned a new badge",go:"kids"}));return bt(keys)};

const st=document.createElement("style");
st.textContent=`
.sb-bell{position:relative;width:44px;height:44px;min-height:44px;border-radius:50%;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font-size:1.2rem}
.sb-badge{position:absolute;right:-2px;top:-2px;min-width:20px;height:20px;border-radius:999px;background:#ff5a5f;color:#fff;font-style:normal;font-weight:900;font-size:.7rem;display:grid;place-items:center;padding:0 5px;border:2px solid var(--bg)}
.sb-badge[hidden]{display:none}
.nlist{display:flex;flex-direction:column;gap:8px}.nit{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px;border-radius:var(--r-m);border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit}.nit.new{border-color:var(--gold);box-shadow:0 0 14px -6px var(--gold)}
.ni{font-size:1.6rem}.nm{flex:1;display:flex;flex-direction:column;min-width:0}.nm small{color:var(--muted);font-weight:700}
`;
document.head.appendChild(st);
})();
