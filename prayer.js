/* Heavenly Visions: My Prayers. A kid picks a daily prayer goal, ticks each prayer off (Agpeya hours or Morning / Afternoon / Night),
   sees a progress ring and a streak, and gets reminders. Everything is saved on the phone (hv_pray). Reminders show while the app is open
   or when it is opened (the bell, a Home card, and a phone notification if allowed). Each prayer is 1 star, the server stops at 5 a day. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>dkey(new Date());

/* the seven hours of the Agpeya, with a short kid friendly line */
const AGPEYA=[
 {id:"prime",ic:"🌅",n:"Prime",s:"1st hour · Sunrise",t:"06:00",x:"We thank God for a new day and remember the Resurrection."},
 {id:"third",ic:"☀️",n:"Third hour",s:"9 in the morning",t:"09:00",x:"We remember the day the Holy Spirit came to the disciples."},
 {id:"sixth",ic:"🌞",n:"Sixth hour",s:"Noon",t:"12:00",x:"We remember Jesus on the Cross, who loves us so much."},
 {id:"ninth",ic:"⛅",n:"Ninth hour",s:"3 in the afternoon",t:"15:00",x:"We remember Jesus' death, and the thief who believed in Him."},
 {id:"eleventh",ic:"🌇",n:"Eleventh hour",s:"Sunset · Vespers",t:"17:00",x:"We thank God for the day and remember Jesus taken down from the Cross."},
 {id:"twelfth",ic:"🌙",n:"Twelfth hour",s:"Bedtime · Compline",t:"21:00",x:"We ask God to keep us safe and give us a peaceful night."},
 {id:"midnight",ic:"⭐",n:"Midnight prayer",s:"In the night",t:"00:00",x:"We stay awake in heart, waiting for Jesus to come again."}];
const SIMPLE=[
 {id:"morning",ic:"🌅",n:"Morning prayer",s:"When you wake up",t:"07:00",x:"Thank God for a new day and ask Him to be with you."},
 {id:"afternoon",ic:"☀️",n:"Afternoon prayer",s:"After school",t:"15:00",x:"Take a quiet moment with Jesus in the middle of your day."},
 {id:"night",ic:"🌙",n:"Night prayer",s:"Before bed",t:"20:30",x:"Thank God for today and ask Him to keep you safe."}];
/* when the goal is small, these are the hours we suggest first */
const ICN={prime:'sunstar',third:'dove',sixth:'cross',ninth:'cloud',eleventh:'church',twelfth:'moon',midnight:'star',morning:'sunstar',afternoon:'cloud',night:'moon'};
const ico=(id,sz,fb)=>window.hvIcon?hvIcon(ICN[id]||'pray',sz||46):fb;
const PRIORITY={agpeya:["prime","twelfth","ninth","sixth","third","eleventh","midnight"],simple:["morning","night","afternoon"]};

const load=()=>{let s=null;try{s=JSON.parse(localStorage.getItem("hv_pray")||"null")}catch{}
  if(!s)s={mode:"simple",plan:{agpeya:["prime","twelfth"],simple:["morning","night"]},times:{},remind:true,days:{}};
  s.plan=s.plan||{};s.plan.agpeya=s.plan.agpeya||["prime","twelfth"];s.plan.simple=s.plan.simple||["morning","night"];s.times=s.times||{};s.days=s.days||{};return s};
const save=s=>{try{const d=Object.keys(s.days).sort();while(d.length>60)delete s.days[d.shift()];localStorage.setItem("hv_pray",JSON.stringify(s));if(window.hvSyncSoon)hvSyncSoon()}catch{}};
const list=s=>s.mode==="agpeya"?AGPEYA:SIMPLE;
const planOf=s=>s.plan[s.mode].filter(id=>list(s).some(h=>h.id===id));
const timeOf=(s,h)=>s.times[h.id]||h.t;
const doneOf=(s,d)=>(s.days[d||today()]||[]);
const goalOf=s=>Math.max(1,planOf(s).length);
const hm=t=>{const [h,m]=t.split(":").map(Number);return h*60+m};
const nice=t=>{const [h,m]=t.split(":").map(Number);return (h%12||12)+":"+pad(m)+" "+(h<12?"AM":"PM")};
/* days where the goal was reached, counted back from today (today does not break the streak until it ends) */
function streak(s){let n=0;const x=new Date();const g=goalOf(s);
  if(doneOf(s,dkey(x)).length<g)x.setDate(x.getDate()-1);
  while(doneOf(s,dkey(x)).length>=g){n++;x.setDate(x.getDate()-1)}return n}
function week(s){const out=[],x=new Date();x.setDate(x.getDate()-6);for(let i=0;i<7;i++){const k=dkey(x);out.push({k,d:x.toLocaleDateString("en-US",{weekday:"narrow"}),n:doneOf(s,k).length,t:k===today()});x.setDate(x.getDate()+1)}return out}

/* ---------- the page ---------- */
const ring=(done,goal)=>{const r=54,c=2*Math.PI*r,p=Math.min(1,done/goal);return `<svg viewBox="0 0 140 140" class="pr-ring" role="img" aria-label="${done} of ${goal} prayers today"><circle cx="70" cy="70" r="${r}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="13"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="url(#prg)" stroke-width="13" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 70 70)" class="pr-arc"/><defs><linearGradient id="prg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#f0a93e"/></linearGradient></defs></svg>`};
function nextDue(s){const now=new Date(),m=now.getHours()*60+now.getMinutes(),d=doneOf(s);
  const pend=planOf(s).map(id=>list(s).find(h=>h.id===id)).filter(h=>h&&!d.includes(h.id)).sort((a,b)=>hm(timeOf(s,a))-hm(timeOf(s,b)));
  return pend.find(h=>hm(timeOf(s,h))<=m)||pend[0]||null}
function page(){
  const s=load(),done=doneOf(s),goal=goalOf(s),plan=planOf(s),nd=nextDue(s),st=streak(s);
  const reached=plan.filter(id=>done.includes(id)).length>=goal;
  app.innerHTML=`${topbar("My prayers","🙏","Pray with Jesus, one prayer at a time")}
  <div class="ds-seg" id="prm" role="group" aria-label="Prayer style"><button data-m="simple" aria-pressed="${s.mode==="simple"}">Morning, afternoon, night</button><button data-m="agpeya" aria-pressed="${s.mode==="agpeya"}">The 7 Agpeya hours</button></div>
  <section class="card pr-top" aria-label="Today"><div class="pr-ringbox">${ring(plan.filter(id=>done.includes(id)).length,goal)}<div class="pr-mid"><b>${plan.filter(id=>done.includes(id)).length}<small>/${goal}</small></b><span>today</span></div></div>
    <div class="pr-side"><div class="pr-goal"><span>My goal</span><div class="pr-step"><button id="gm" aria-label="Fewer prayers a day">−</button><b id="gn">${goal}</b><button id="gp" aria-label="More prayers a day">+</button></div><small>prayers a day</small></div>
    <div class="pr-streak"><b>🔥 ${st}</b><small>${st===1?"day":"days"} in a row</small></div></div></section>
  <div class="pr-week" aria-label="This week">${week(s).map(w=>`<span class="${w.t?"today":""} ${w.n>=goal?"ok":w.n?"part":""}"><i>${w.n>=goal?"✓":w.n?w.n:""}</i><small>${w.d}</small></span>`).join("")}</div>
  <p class="pr-msg" role="status">${reached?"🎉 You reached your goal today! Jesus is so happy you talked with Him.":nd?`Next: <b>${E(nd.n)}</b> around ${nice(timeOf(s,nd))}. You can do it!`:"Pick a time for your first prayer below."}</p>
  <div class="pr-list">${list(s).map(h=>{const on=plan.includes(h.id),dn=done.includes(h.id),isn=nd&&nd.id===h.id&&!dn;
    return `<article class="card pr-card ${dn?"done":""} ${on?"plan":""} ${isn?"next":""}"><span class="pr-ic" aria-hidden="true">${ico(h.id,48,h.ic)}</span><div class="pr-tx"><b>${E(h.n)}</b><small>${E(h.s)} · ${nice(timeOf(s,h))}</small><p>${E(h.x)}</p>${on?`<em class="pr-tag">In my plan</em>`:""}</div>
      <button class="pr-btn ${dn?"on":""}" data-h="${h.id}" aria-pressed="${dn}" aria-label="${dn?"Undo":"I prayed"} ${E(h.n)}">${dn?"✓":"🙏"}<span>${dn?"Prayed":"I prayed"}</span></button></article>`}).join("")}</div>
  <div class="pr-acts"><button class="btn alt" id="prplan">⚙️ Choose my prayer times</button><button class="btn alt" id="prrem">${s.remind?"🔔 Reminders: on":"🔕 Reminders: off"}</button></div>
  <p class="tag pr-note">Reminders show when the app is open and when you open it. Allow phone notifications to get a nudge too.</p>`;
  document.getElementById("prm").onclick=e=>{const b=e.target.closest("[data-m]");if(!b)return;const s2=load();s2.mode=b.dataset.m;save(s2);page()};
  document.getElementById("gp").onclick=()=>setGoal(+1);document.getElementById("gm").onclick=()=>setGoal(-1);
  app.querySelector(".pr-list").onclick=e=>{const b=e.target.closest("[data-h]");if(b)tick(b.dataset.h)};
  document.getElementById("prplan").onclick=planSheet;
  document.getElementById("prrem").onclick=()=>{const s2=load();s2.remind=!s2.remind;save(s2);if(s2.remind)askPerm();page()}}
function setGoal(d){const s=load(),pr=PRIORITY[s.mode],max=list(s).length;let n=goalOf(s)+d;n=Math.max(1,Math.min(max,n));
  /* keep the picked times, then add or drop by our suggested order */
  let plan=planOf(s).slice();
  if(d>0){const add=pr.find(id=>!plan.includes(id));if(add)plan.push(add)}else{const drop=[...pr].reverse().find(id=>plan.includes(id));if(drop&&plan.length>1)plan.splice(plan.indexOf(drop),1)}
  s.plan[s.mode]=plan;save(s);page()}
function tick(id){const s=load(),k=today(),d=s.days[k]||(s.days[k]=[]),i=d.indexOf(id);
  if(i>=0){d.splice(i,1);save(s);page();return}
  d.push(id);save(s);
  const g=goalOf(s),was=planOf(s).filter(x=>d.includes(x)).length;
  try{navigator.vibrate&&navigator.vibrate(18)}catch{}
  if(window.hvAward)hvAward("prayer",k+"-"+id,"Prayer",1);
  if(was>=g&&window.confetti)confetti();
  page();
  const b=app.querySelector(`[data-h="${id}"]`);if(b){b.classList.add("pop")}
  toast(was>=g?"🎉 Goal reached! Great job praying today":"🙏 +1 star. Thank you for praying!")}

function planSheet(){
  const s=load(),h=list(s),plan=planOf(s);
  const sh=sheet(`<h3>⚙️ My prayer times</h3><div class="tag">Pick the prayers you want to do each day. Your goal is how many you pick. Change the time if you like.</div>
   <div class="pr-pl">${h.map(x=>`<label class="pr-row"><input type="checkbox" data-p="${x.id}" ${plan.includes(x.id)?"checked":""}><span class="pr-ic" aria-hidden="true">${ico(x.id,40,x.ic)}</span><span class="pr-rn"><b>${E(x.n)}</b><small>${E(x.s)}</small></span><input type="time" data-t="${x.id}" value="${timeOf(s,x)}" aria-label="Time for ${E(x.n)}"></label>`).join("")}</div>
   <button class="btn gold" id="prsave">Save my plan</button>`,"My prayer times");
  sh.querySelector("#prsave").onclick=()=>{const s2=load();const ids=[...sh.querySelectorAll("[data-p]:checked")].map(i=>i.dataset.p);
    if(!ids.length){toast("Pick at least one prayer 🙏");return}
    s2.plan[s2.mode]=ids;sh.querySelectorAll("[data-t]").forEach(i=>{if(i.value)s2.times[i.dataset.t]=i.value});save(s2);closeSheet();page();toast("Your prayer plan is saved ✅")}}

/* ---------- reminders ---------- */
function askPerm(){try{if("Notification" in window&&Notification.permission==="default")Notification.requestPermission()}catch{}}
function remind(){
  const s=load();if(!s.remind||!window.hvNotify)return;const now=new Date(),m=now.getHours()*60+now.getMinutes(),k=today(),d=doneOf(s);
  const due=planOf(s).map(id=>list(s).find(h=>h.id===id)).filter(h=>h&&!d.includes(h.id)&&hm(timeOf(s,h))<=m&&m-hm(timeOf(s,h))<180).sort((a,b)=>hm(timeOf(s,b))-hm(timeOf(s,a)))[0];
  if(!due)return;
  const fresh=hvNotify({id:"pray-"+k+"-"+due.id,ic:due.ic,t:"Time for "+due.n+" 🙏",m:"You have prayed "+planOf(s).filter(x=>d.includes(x)).length+" of "+goalOf(s)+" today",go:"pray"});
  if(fresh){try{if(typeof toast==="function"&&location.hash.slice(1)!=="pray")toast("🙏 Time for "+due.n);
    if("Notification" in window&&Notification.permission==="granted"&&document.visibilityState!=="visible")new Notification("Time for "+due.n+" 🙏",{body:"Tap to pray. You can do it!",icon:"icon-192.png",tag:"hv-pray"})}catch{}}}
setInterval(remind,60000);

/* ---------- Home card ---------- */
function homeCard(){
  const box=document.getElementById("annbox");if(!box||document.getElementById("prhome"))return;
  const s=load(),goal=goalOf(s),n=planOf(s).filter(id=>doneOf(s).includes(id)).length,st=streak(s),nd=nextDue(s);
  const c=document.createElement("button");c.id="prhome";c.className="pr-home";c.dataset.go="pray";
  c.innerHTML=`<span class="pr-hr">${ring(n,goal)}<b>${n}/${goal}</b></span><span class="pr-ht"><b>🙏 My prayers</b><small>${n>=goal?"Goal reached today! 🎉":nd?"Next: "+E(nd.n)+" at "+nice(timeOf(s,nd)):"Set your daily goal"}${st?` · 🔥 ${st}`:""}</small></span><span class="pr-go" aria-hidden="true">›</span>`;
  (document.querySelector('.doors')||box).before(c)}
const oldInit=window.hvHomeInit;
window.hvHomeInit=function(){if(oldInit)oldInit.apply(this,arguments);try{homeCard();remind()}catch{}};
window.hvPrayCount=()=>{const s=load();return{done:planOf(s).filter(id=>doneOf(s).includes(id)).length,goal:goalOf(s),streak:streak(s)}};
window.prayRoute=function(h){if(h==="pray"){page();return true}return false};
setTimeout(remind,2500);

const st=document.createElement("style");
st.textContent=`
.pr-top{display:flex;align-items:center;gap:16px;padding:18px;background:linear-gradient(135deg,rgba(255,226,154,.16),rgba(120,110,230,.14))}
.pr-ringbox{position:relative;width:132px;height:132px;flex:none}.pr-ring{width:100%;height:100%;filter:drop-shadow(0 0 14px rgba(255,214,130,.4))}.pr-arc{transition:stroke-dasharray .7s cubic-bezier(.2,.8,.2,1)}
.pr-mid{position:absolute;inset:0;display:grid;place-content:center;text-align:center}.pr-mid b{font-size:2.3rem;line-height:1;font-weight:900}.pr-mid b small{font-size:1.1rem;color:var(--muted)}.pr-mid span{font-weight:800;color:var(--muted);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase}
.pr-side{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0}.pr-goal{display:flex;flex-direction:column;gap:2px}.pr-goal>span{font-weight:900;color:var(--gold);font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}.pr-goal small{color:var(--muted);font-weight:700}
.pr-step{display:flex;align-items:center;gap:10px}.pr-step b{font-size:1.9rem;min-width:30px;text-align:center}.pr-step button{width:44px;height:44px;border-radius:50%;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font-size:1.5rem;font-weight:900;line-height:1}
.pr-streak{display:flex;align-items:baseline;gap:8px}.pr-streak b{font-size:1.3rem}.pr-streak small{color:var(--muted);font-weight:800}
.pr-week{display:flex;justify-content:space-between;gap:6px;margin:12px 2px 4px}.pr-week span{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.pr-week i{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:900;border:2px dashed rgba(255,255,255,.25);color:var(--muted)}.pr-week .part i{border-style:solid;border-color:var(--gold);color:var(--gold)}.pr-week .ok i{background:linear-gradient(135deg,#ffe29a,#f0a93e);border:0;color:#2b1d05;box-shadow:0 0 14px rgba(255,214,130,.55)}.pr-week .today i{outline:2px solid var(--gold);outline-offset:2px}.pr-week small{font-weight:800;color:var(--muted)}
.pr-msg{margin:6px 2px 10px;text-align:center;font-weight:800}
.pr-list{display:flex;flex-direction:column;gap:10px}
.pr-card{display:flex;align-items:center;gap:12px;padding:14px;position:relative;transition:transform .2s,box-shadow .3s}.pr-card.plan{border-color:rgba(243,197,106,.55)}.pr-card.next{box-shadow:0 0 0 2px var(--gold),0 0 26px rgba(255,214,130,.35)}.pr-card.done{opacity:.88;background:linear-gradient(135deg,rgba(80,200,140,.2),rgba(255,255,255,.05))}
.pr-ic{font-size:2.1rem;flex:none;width:46px;text-align:center}.pr-tx{flex:1;min-width:0}.pr-tx b{display:block;font-size:1.05rem}.pr-tx small{color:var(--muted);font-weight:800}.pr-tx p{margin:4px 0 0;font-size:.86rem;color:var(--muted);line-height:1.35}.pr-tag{display:inline-block;margin-top:6px;font-style:normal;font-weight:900;font-size:.7rem;color:#2b1d05;background:var(--gold);border-radius:999px;padding:2px 9px}
.pr-btn{flex:none;width:76px;min-height:76px;border-radius:22px;border:0;background:linear-gradient(160deg,#ffe29a,#f0a93e);color:#2b1d05;font-size:1.7rem;font-weight:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 8px 18px -6px rgba(240,169,62,.7);transition:transform .15s}.pr-btn span{font-size:.68rem;font-weight:900}.pr-btn:active{transform:scale(.93)}.pr-btn.on{background:linear-gradient(160deg,#7ee0a8,#38b36f);color:#05301a;box-shadow:0 8px 18px -6px rgba(56,179,111,.7)}.pr-btn.pop{animation:prpop .5s cubic-bezier(.2,1.6,.4,1)}@keyframes prpop{0%{transform:scale(.7)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
.pr-acts{display:flex;gap:10px;margin:14px 0 4px;flex-wrap:wrap}.pr-acts .btn{flex:1;min-width:160px}.pr-note{text-align:center;margin-top:6px}
.pr-pl{display:flex;flex-direction:column;gap:8px;margin:12px 0}.pr-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;border:1px solid var(--line);background:var(--surface)}.pr-row input[type=checkbox]{width:24px;height:24px;accent-color:#f0a93e;flex:none}.pr-rn{flex:1;display:flex;flex-direction:column;min-width:0}.pr-rn small{color:var(--muted);font-weight:700}.pr-row input[type=time]{font:inherit;font-weight:800;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);padding:6px;min-height:40px}
.pr-home{display:flex;align-items:center;gap:14px;width:100%;margin:6px 0 14px;padding:12px 14px;border-radius:22px;border:1px solid rgba(243,197,106,.5);background:linear-gradient(135deg,rgba(255,226,154,.2),rgba(120,110,230,.18));color:var(--ink);text-align:left;font:inherit;box-shadow:0 10px 26px -12px rgba(240,169,62,.6)}
.pr-hr{position:relative;width:62px;height:62px;flex:none}.pr-hr .pr-ring{width:100%;height:100%;filter:none}.pr-hr b{position:absolute;inset:0;display:grid;place-items:center;font-size:.95rem;font-weight:900}
.pr-ht{flex:1;display:flex;flex-direction:column;min-width:0}.pr-ht b{font-size:1.05rem}.pr-ht small{color:var(--muted);font-weight:800}.pr-go{font-size:1.8rem;color:var(--gold)}
@media (prefers-reduced-motion:reduce){.pr-arc,.pr-btn.pop{animation:none;transition:none}}
`;
document.head.appendChild(st);
})();
