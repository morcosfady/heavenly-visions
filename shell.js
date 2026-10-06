/* Heavenly Visions: app shell. Top bar (avatar, stars, language), Today strip, new doors, first visit welcome,
   "coming soon" pages for the sections that arrive in later phases, and the #ds design system page. */
(function(){
const A=()=>window.hvAcct&&hvAcct();
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const lang=()=>{try{return localStorage.getItem("hv_lang")||"en"}catch{return "en"}};
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
  const a=A(),l=lang();
  const me=a?`<button class="sb-me" data-go="profile" aria-label="My profile"><span class="sb-av">${avOf(a)}</span><span class="nm">${E((a.user.first||a.user.name||"").split(" ")[0])}</span></button>`
    :`<button class="sb-login" data-go="login">👤 Login</button>`;
  const stars=a?`<button class="sb-stars" id="sbStars" data-go="profile" aria-label="${balOf(a)} stars"><i>⭐</i><span id="sbN">${balOf(a)}</span></button>`:"";
  return `<div class="shellbar">${me}<div class="sb-right">${stars}<div class="sb-lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="${l==="en"}">EN</button><button data-lang="ar" aria-pressed="${l==="ar"}" lang="ar">ع</button></div></div></div>`};

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
  const nudge=window.hvPrayerNudge?hvPrayerNudge():null;
  return `<section aria-label="Today" class="sec"><h2 class="sech"><span>Today</span></h2>
  <div class="today">
   <button class="tcard verse2" style="--tc:var(--gold)" data-go="verse"><span class="k">📖 Verse of the day${done?" ✅":""}</span><span class="t">“${E(tv[0])}”</span><span class="s">${E(tv[1])} · ${done?"Done today! Open your verse jar":"Tap to learn it"}</span></button>
   ${nudge?`<button class="tcard" style="--tc:var(--c-pray)" data-go="pr-${nudge.id}"><span class="k">🙏 Prayer time</span><span class="t">${E(nudge.t)}</span><span class="s">Tap to pray</span><span class="em" aria-hidden="true">🕯️</span></button>`:""}
   <button class="tcard" style="--tc:var(--c-cal)" data-go="calendar"><span class="k">📅 ${E(g)}</span><span class="t">${c.day} ${c.name}, ${c.year}</span><span class="s">${E(lead)}</span><span class="em" aria-hidden="true">🗓️</span></button>
   <button class="tcard" id="nextEvent" style="--tc:var(--c-church)" data-go="events"><span class="k">🎉 Next event</span><span class="t">No events yet</span><span class="s">Trips, retreats and feasts will show here.</span><span class="em" aria-hidden="true">⛪</span></button>
  </div></section>`};

const MORE=[
  ["kids","🌟","Kids Corner","Stars, avatar, shop","--c-kids"],
  ["bedtime","🛏️","Bedtime","Songs and stories","--c-bed"],
  ["prayers","🙏","Prayers","Talk to God","--c-pray"],
  ["coloring","🎨","Coloring","Color and keep","--c-color"],
  ["calendar","📅","Calendar","Feasts and events","--c-cal"]];
window.hvMoreDoors=function(){
  return `<section class="sec" aria-label="More to explore"><h2 class="sech"><span>More to explore</span></h2><nav class="doors2">${MORE.map((m,i)=>`<button class="mdoor${i===4?" last":""}" style="--dc:var(${m[4]})" data-go="${m[0]}"><span class="big" aria-hidden="true">${m[1]}</span><b>${m[2]}</b><small>${m[3]}</small></button>`).join("")}</nav></section>`};

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
   <div class="ds-skel" style="height:60px"></div><div class="ds-empty"><div class="em">🌤️</div><b>Nothing here yet</b>See you Sunday! 🙏</div></section>`;
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

/* ---------- clicks: language toggle and soon cards ---------- */
document.addEventListener("click",e=>{
  const l=e.target.closest("[data-lang]");
  if(l){const v=l.dataset.lang;try{localStorage.setItem("hv_lang",v)}catch{}
    document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b===l));
    document.documentElement.lang=v;
    if(v==="ar")toast("العربية قريباً. Arabic is coming in a later update.");return}
  if(e.target.closest("[data-soon]"))toast("The daily verse challenge is coming in Phase 3 ✨")});
document.documentElement.lang=lang();

window.hvHomeInit=function(){setTimeout(welcome,900);if(window.hvLoadAnn)hvLoadAnn();if(window.hvThisSunday)hvThisSunday();if(window.hvNextEvent)hvNextEvent()};
})();
