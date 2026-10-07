/* Heavenly Visions: app shell. Top bar (avatar, stars), Today strip, new doors, first visit welcome,
   "coming soon" pages for the sections that arrive in later phases, and the #ds design system page. */
(function(){
const A=()=>window.hvAcct&&hvAcct();
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const avOf=a=>{if(window.hvAvatarOf&&a&&a.user&&a.user.av)return hvAvatarOf(a,36);const v=a&&(a.avatar||"😇");return v==="logo"?`<img src="logo.png" alt="" style="width:100%;height:100%;object-fit:contain">`:v};
const balOf=a=>(a.user.score||0)-(a.user.spent||0);

/* ---------- Coptic date (Reingold and Dershowitz, fixed day 1825030 = 1 Tout, year 1) ---------- */
const MONTHS=["Tout","Baba","Hator","Kiahk","Toba","Amshir","Baramhat","Baramouda","Bashans","Paoni","Epep","Mesori","Nasie"];
function copticDate(d){
  const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate();
  const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  const jdn=day+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
  const epoch=1825030,fixed=(Y,M,D)=>epoch-1+365*(Y-1)+Math.floor(Y/4)+30*(M-1)+D;
  const year=Math.floor((4*(jdn-epoch)+1463)/1461),month=Math.floor((jdn-fixed(year,1,1))/30)+1,dd=jdn+1-fixed(year,month,1);
  return {year,month,day:dd,name:MONTHS[month-1]};
}
window.hvCopticDate=copticDate;

/* ---------- top bar ---------- */
window.hvTopBar=function(){
  const a=A();
  const me=a?`<button class="sb-me" data-go="profile" aria-label="My profile"><span class="sb-av">${avOf(a)}</span><span class="nm">${E((a.user.first||a.user.name||"").split(" ")[0])}</span></button>`
    :`<button class="sb-login" data-go="login">${window.hvIcon?hvIcon("login",20):""}Login</button>`;
  const stars=a?`<button class="sb-stars" id="sbStars" data-go="profile" aria-label="${balOf(a)} stars"><i>${window.hvIcon?hvIcon("starline",20):"⭐"}</i><span id="sbN">${balOf(a)}</span></button>`:"";
  const bell=a?`<button class="sb-bell" id="sbBell" aria-label="Notifications">${window.hvIcon?hvIcon("bell",22):"🔔"}<i class="sb-badge" hidden></i></button>`:"";
  return `<div class="shellbar">${me}<div class="sb-right">${window.hvThemeButton?hvThemeButton():""}${bell}${stars}</div></div>`};

/* the counter pops and stars fly in when points are added (called by hvAward) */
window.hvRefreshBarAvatar=function(){const a=A(),el=document.querySelector(".sb-av");if(a&&el)el.innerHTML=avOf(a)};
window.hvStarsRefresh=function(added){
  const a=A(),n=document.getElementById("sbN"),b=document.getElementById("sbStars");
  if(a&&n){n.textContent=balOf(a);if(b){b.setAttribute("aria-label",balOf(a)+" stars");b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");
    if(window.hvFx&&added)hvFx.fly(document.body,b,"⭐",Math.min(6,added))}}};

/* ---------- today strip ---------- */
window.hvToday=function(v){
  const now=new Date(),c=copticDate(now);
  const g=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  let tv=v,done=false;
  try{if(window.hvTodayVerse)tv=[hvTodayVerse().text,hvTodayVerse().ref];const m=JSON.parse(localStorage.getItem("hv_verse")||"{}").days||{};const k=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");done=!!m[k]}catch{}
  const cal=window.hvCalToday?hvCalToday():{ev:[],fast:null};
  const sa=cal.ev.find(x=>x.type==="saint"),fe=cal.ev.find(x=>x.type==="feast");
  const lead=fe?fe.ic+" "+fe.t:sa?sa.ic+" "+sa.t:cal.fast?"🌙 "+cal.fast.t:"Feasts, fasts and saints";
  return `<section aria-label="Today" class="sec"><h2 class="sech"><span>Today</span></h2>
  <div class="today" id="todayStrip">
   <button class="tcard verse2" style="--tc:var(--gold)" data-go="verse"><span class="k">${window.hvIcon?hvIcon("book",16):""}Verse of the day${done?" ✅":""}</span><span class="t">“${E(tv[0])}”</span><span class="s">${E(tv[1])} · ${done?"Done today! Open your verse jar":"Tap to learn it"}</span></button>
   <button class="tcard" style="--tc:var(--c-cal)" data-go="calendar"><span class="k">${window.hvIcon?hvIcon("calendar",16):""}${E(g)}</span><span class="t">${c.day} ${c.name}, ${c.year}</span><span class="s">${E(lead)}</span><span class="em" aria-hidden="true">🗓️</span></button>
   <button class="tcard" id="nextEvent" style="--tc:var(--c-church)" data-go="events"><span class="k">${window.hvIcon?hvIcon("flag",16):""}Next event</span><span class="t">No events yet</span><span class="s">Trips, retreats and feasts will show here.</span><span class="em" aria-hidden="true">⛪</span></button>
  </div><div class="tdots" id="tdots" aria-hidden="true"></div></section>`};

const MORE=[
  ["bedtime","moon","Bedtime","Stories and prayer","--c-bed"],
  ["coloring","palette","Coloring","Color and keep","--c-color"],
  ["calendar","📅","Calendar","Feasts and events","--c-cal"]];
function calIcon(){const d=new Date();return `<span class="calicon"><i>${d.toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</i><b>${d.getDate()}</b></span>`}
window.hvMoreDoors=function(){
  return `<section class="sec" aria-label="More to explore"><h2 class="sech"><span>More to explore</span></h2><nav class="doors2">${MORE.map((m,i)=>`<button class="mdoor" style="--dc:var(${m[4]})" data-go="${m[0]}"><span class="big" aria-hidden="true">${m[0]==="calendar"?calIcon():(window.hvIcon?hvIcon(m[1],54):m[1])}</span><b>${m[2]}</b><small>${m[3]}</small></button>`).join("")}</nav></section>`};

/* ---------- coming soon pages ---------- */
const SOON={};
function soonPage(k){
  const s=SOON[k],c=copticDate(new Date());
  app.innerHTML=`${topbar(s.t,s.ic,"Coming soon")}
  <div class="soonbox" style="--sc:var(${s.c})"><div class="em" aria-hidden="true">${s.ic}</div><span class="chipsoon">Coming in ${s.p}</span>
   <ul>${s.l.map(x=>`<li>✨ ${x}</li>`).join("")}</ul>
   ${k==="calendar"?`<div class="card" style="width:100%"><b>Today</b><div class="tag">${c.day} ${c.name}, ${c.year} (Coptic)</div></div>`:""}</div>`}

/* ---------- design system page (#ds) ---------- */
function dsPage(){
  const demo=[["Mon",1],["Tue",0],["Wed",1],["Thu",1],["Fri",0],["Sat",1],["Sun",1]];
  app.innerHTML=`${topbar("Design system","🎨","Components used everywhere")}
  <section class="card sec"><h2>Colors</h2><div class="ds-chips">${[["Media","--c-media"],["Attendance","--c-att"],["Games","--c-games"],["Quizzes","--c-quiz"],["Bible","--c-bible"],["Kids","--c-kids"],["Bedtime","--c-bed"],["Prayers","--c-pray"],["Coloring","--c-color"],["Calendar","--c-cal"],["Servants","--c-serv"],["Church","--c-church"]].map(c=>`<span class="ds-chip" style="background:var(${c[1]});border-color:transparent;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4)">${c[0]}</span>`).join("")}</div></section>
  <section class="card sec"><h2>Chips and segmented</h2><div class="ds-chips"><button class="ds-chip" aria-pressed="true">All</button><button class="ds-chip" aria-pressed="false">80%+</button><button class="ds-chip" aria-pressed="false">Under 50%</button></div>
   <div class="ds-seg"><button aria-pressed="true">Day</button><button aria-pressed="false">Week</button><button aria-pressed="false">Month</button></div></section>
  <section class="card sec" id="dsCharts"><h2>Charts</h2><div style="display:flex;justify-content:center">${hvChart.ring(86,{label:"Great"})}</div>
   ${hvChart.bar([{l:"Jul",v:60},{l:"Aug",v:80},{l:"Sep",v:92},{l:"Oct",v:70}])}
   ${hvChart.line([{v:[50,70,60,80,90],color:"var(--gold)"},{v:[40,45,70,65,75],color:"var(--sky)"}],["Jul 19","Aug 2","Aug 16","Aug 30","Sep 13"],{label:"Trend"})}
   <div>${hvChart.spark([1,1,0,1,1,1,0,1])}</div>${hvChart.heat(demo.map(d=>({l:d[0],on:d[1]})))}
   <div class="ds-bar"><i style="--w:68%"></i></div></section>
  <section class="card sec"><h2>Stats and badges</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><div class="ds-stat"><b>12</b>Sundays</div><div class="ds-stat"><b>🔥 4</b>Streak</div><div class="ds-stat"><b>⭐ 120</b>Stars</div></div>
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"><div class="ds-badge on"><i>🌱</i>First Sunday</div><div class="ds-badge on"><i>🔥</i>4 in a row</div><div class="ds-badge lock"><i>🏅</i>10 Sundays</div><div class="ds-badge lock"><i>👑</i>8 in a row</div></div></section>
  <section class="card sec"><h2>Buttons and states</h2><button class="btn gold" id="dsBurst">⭐ Star burst</button><button class="btn" id="dsToast">Show a toast</button><button class="btn" id="dsSheet">Open a sheet</button>
   <div class="ds-skel" style="height:60px"></div><div class="ds-empty"><div class="em">📭</div><b>Nothing here yet</b>See you Sunday! 🙏</div></section>`;
  const r=document.getElementById("dsCharts");hvChart.play(r);
  document.querySelectorAll(".ds-bar").forEach(b=>requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add("go"))));
  document.getElementById("dsBurst").onclick=e=>{const b=e.currentTarget.getBoundingClientRect();hvFx.burst(b.left+b.width/2,b.top,"⭐",12)};
  document.getElementById("dsToast").onclick=()=>toast("+10 stars ⭐");
  document.getElementById("dsSheet").onclick=()=>sheet(`<h3>A bottom sheet</h3><p class="tag">Sheets slide up from the bottom and close with the button or Escape.</p>`,"Example");
  document.querySelectorAll(".ds-chip[aria-pressed],.ds-seg button").forEach(b=>b.addEventListener("click",()=>{const p=b.parentElement;p.querySelectorAll("[aria-pressed]").forEach(x=>x.setAttribute("aria-pressed",x===b))}))}

/* ---------- routes ---------- */
window.shellRoute=function(h){
  if(SOON[h]){soonPage(h);return true}
  if(h==="ds"){dsPage();return true}
  return false};

/* ---------- first visit welcome ---------- */
function welcome(){
  let seen=false;try{seen=!!localStorage.getItem("hv_welcomed")}catch{}
  if(seen||A()||!window.GAMES_URL)return;
  try{localStorage.setItem("hv_welcomed","1")}catch{}
  sheet(`<h3>Welcome to Heavenly Visions! ✝️</h3><p class="tag" style="margin:0">Who are you?</p>
   <div class="wl-who"><button data-go="login" data-close><i>👧</i><span>I am a student<small>Create a profile to earn stars and check in</small></span></button>
   <button data-go="login" data-close><i>🙏</i><span>I am a servant or coordinator<small>Login to open the Servants Workshop</small></span></button>
   <button data-close><i>👀</i><span>Just looking around<small>You can login any time from the top</small></span></button></div>`,"Welcome")}

/* ---------- clicks ---------- */
document.addEventListener("click",e=>{
  if(e.target.closest("[data-soon]"))toast("Coming soon ✨")});
try{localStorage.removeItem("hv_lang")}catch{}
document.documentElement.lang="en";

/* dots under the Today strip follow the swipe */
function todayDots(){const s=document.getElementById("todayStrip"),d=document.getElementById("tdots");if(!s||!d||s.scrollWidth<=s.clientWidth+4){if(d)d.hidden=true;return}
  const n=s.children.length;d.innerHTML=Array.from({length:n},(_,i)=>`<i class="${i?"":"on"}"></i>`).join("");
  s.addEventListener("scroll",()=>{const k=Math.round(s.scrollLeft/Math.max(1,(s.scrollWidth-s.clientWidth))*(n-1));d.querySelectorAll("i").forEach((x,j)=>x.classList.toggle("on",j===k))},{passive:true})}

/* the welcome sheet waits for the logo splash to finish, then shows right away */
function welcomeSoon(){if(document.getElementById("intro"))return setTimeout(welcomeSoon,120);if((location.hash||"#home")==="#home"||location.hash==="")welcome()}

window.hvHomeInit=function(){welcomeSoon();todayDots();if(window.hvLoadAnn)hvLoadAnn();if(window.hvThisSunday)hvThisSunday();if(window.hvNextEvent)hvNextEvent();if(window.hvNotifScan)hvNotifScan();if(window.hvBellPaint)hvBellPaint();const oc=document.getElementById("offchip");if(oc&&window.hvOfflineChip)oc.innerHTML=hvOfflineChip()};
})();
