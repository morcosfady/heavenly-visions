/* Heavenly Visions: Class Arena (class vs class, never kid vs kid) and the printable Monthly Report.
   Scores and numbers come from the server. Kids only get class level numbers. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
async function call(body){const a=A();const r=await fetch(window.GAMES_URL,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const monthName=m=>{const a=m.split("-");return new Date(+a[0],+a[1]-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"})};
const canSet=()=>{const a=A();return !!(a&&(a.user.role==="coordinator"||a.user.role==="priest"||a.user.role==="master"))};
const secOf=g=>(typeof SECTIONS!=="undefined"&&SECTIONS.find(s=>s.name===g))||{ic:"🏫",c:"#8e6bd1"};

/* ========== ARENA ========== */
function celebrate(h){
  const o=document.createElement("div");o.className="lvup";o.setAttribute("role","dialog");o.setAttribute("aria-label","Competition winner");
  const sc=secOf(h.winner);
  o.innerHTML=`<div class="lvbox"><div class="lvglow"></div><div class="lvic">🏆</div><div class="lvk">${E(monthName(h.m)).toUpperCase()} WINNER</div><div class="lvn">${sc.ic} ${E(h.winner)}</div>${h.prize?`<div class="lvk" style="letter-spacing:.1em">Prize: ${E(h.prize)}</div>`:""}<button class="btn gold" id="lvok">Congratulations!</button></div>`;
  document.body.appendChild(o);if(window.confetti){confetti();setTimeout(confetti,1200)}
  const close=()=>o.remove();o.querySelector("#lvok").onclick=close;o.addEventListener("click",e=>{if(e.target===o)close()});o.querySelector("#lvok").focus()}
function checkEnd(r){const h=r&&r.hall&&r.hall[0];if(!h||!h.winner)return;const seen=jget("hv_cp_seen",[]);if(seen.includes(h.m))return;seen.push(h.m);jset("hv_cp_seen",seen.slice(-12));celebrate(h)}
window.hvArenaCheck=async function(){const a=A();if(!a||!window.GAMES_URL||!a.user.grade&&a.user.role==="student")return;
  const k=new Date().toISOString().slice(0,10);if(jget("hv_cp_day","")===k)return;jset("hv_cp_day",k);
  try{const r=await call({action:"cp_state"});if(r.ok)checkEnd(r)}catch{}};

async function arena(){
  const a=A();app.innerHTML=`${topbar("Class Arena","🏟️","Class against class","home")}<div id="arb" class="sec"><div class="ds-skel" style="height:220px"></div></div>`;
  if(!a){document.getElementById("arb").innerHTML=`<div class="card sec" style="text-align:center"><b>Login to join the Arena</b><button class="btn gold" data-go="login">👤 Login or create profile</button></div>`;return}
  let r;try{r=await call({action:"cp_state"});if(!r.ok)throw 0}catch{document.getElementById("arb").innerHTML=`<div class="card sec" style="text-align:center"><b>Could not load</b><button class="btn gold" id="rt">Try again</button></div>`;document.getElementById("rt").onclick=arena;return}
  checkEnd(r);
  const b=document.getElementById("arb"),st=r.standings,top=st.slice(0,3),max=Math.max(1,...st.map(x=>x.score));
  const now=new Date(),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),pct=Math.round(now.getDate()*100/dim);
  const order=[top[1],top[0],top[2]].filter(Boolean);const place=x=>top.indexOf(x)+1;
  b.innerHTML=`<div class="card ar-head"><div><b>${monthName(r.month)}</b><div class="tag">${r.active?"Competition is on":"No competition running"}</div></div>${r.active&&r.prize?`<span class="ar-prize">🎁 ${E(r.prize)}</span>`:""}</div>
  ${r.active?`<div><div class="ds-bar" id="arm" aria-label="Month progress"><i style="--w:${pct}%"></i></div><div class="tag">${dim-now.getDate()} days left this month</div></div>`:""}
  ${st.length?`<div class="podium" role="img" aria-label="Top classes" style="grid-template-columns:repeat(${order.length},minmax(0,1fr));max-width:${order.length*130}px;margin-inline:auto;width:100%">${order.map(x=>{const sc=secOf(x.grade),p=place(x);return `<div class="pod p${p}" style="--pc:${sc.c}"><div class="pod-ic">${p===1?"🏆":sc.ic}</div><div class="pod-bar" style="--h:${Math.max(24,Math.round(x.score/max*100))}%"><b>${x.score}</b></div><div class="pod-n">${E(x.grade)}</div><div class="pod-m">${["🥇","🥈","🥉"][p-1]}</div></div>`}).join("")}</div>`:`<div class="ds-empty"><div class="em">🏟️</div><b>No classes yet</b>Kids with a class will show here.</div>`}
  <section class="card sec"><h2>All classes</h2>${st.map((x,i)=>{const sc=secOf(x.grade);return `<div class="ar-row ${x.grade===r.mine?"me":""}" style="--pc:${sc.c}"><span class="ar-rk">${i+1}</span><span class="ar-ic">${sc.ic}</span><span class="ar-n"><b>${E(x.grade)}${x.grade===r.mine?" (you)":""}</b><span class="ds-bar"><i style="--w:${x.score}%;background:${sc.c}"></i></span><small>Attendance ${x.att===null?"none yet":x.att+"%"} · ${x.stars} stars per kid · ${x.kids} kids</small></span><b class="ar-s">${x.score}</b></div>`}).join("")}<div class="tag">Score = ${Math.round(r.weights.att*100)}% attendance + ${Math.round(r.weights.stars*100)}% stars per kid (${r.weights.target} stars per kid is full marks). Small and big classes compete fairly.</div></section>
  ${canSet()?`<section class="card sec"><h2>Run the competition</h2>${r.active?`<button class="btn alt" id="arstop">⏹ End it now and pick the winner</button>`:`<label class="field">Prize (optional)<input id="arpr" maxlength="80" placeholder="Example: Pizza party"></label><button class="btn gold" id="arstart">▶ Start this month's competition</button>`}</section>`:""}
  ${r.hall.length?`<section class="card sec"><h2>🏛️ Hall of Fame</h2>${r.hall.map(h=>`<div class="hf"><span class="hf-m">${monthName(h.m)}</span><b>${secOf(h.winner).ic} ${E(h.winner||"No winner")}</b><small>${h.score} points${h.prize?" · "+E(h.prize):""}</small></div>`).join("")}</section>`:""}`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{b.classList.add("go");document.querySelectorAll(".pod-bar").forEach(x=>x.classList.add("up"))}));
  const go2=async(on)=>{try{const x=await call({action:"cp_set",on,prize:on?document.getElementById("arpr").value:""});if(x.ok){toast(on?"Competition started 🏁":"Competition ended 🏆");arena()}else toast("Not allowed")}catch{toast("No internet connection")}};
  const s1=document.getElementById("arstart");if(s1)s1.onclick=()=>go2(true);const s2=document.getElementById("arstop");if(s2)s2.onclick=()=>{if(confirm("End the competition now?"))go2(false)}}

/* ========== MONTHLY REPORT ========== */
function monthOptions(){const o=[],d=new Date();for(let i=0;i<12;i++){const x=new Date(d.getFullYear(),d.getMonth()-i,1),v=x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0");o.push(`<option value="${v}">${monthName(v)}</option>`)}return o.join("")}
function reportPage(){
  const a=A();if(!a||!(a.user.role==="coordinator"||a.user.role==="priest"||a.user.role==="master")){app.innerHTML=`${topbar("Monthly Report","📊","Coordinators and priests","servants")}<div class="empty">This is for coordinators and priests.</div>`;return}
  app.innerHTML=`${topbar("Monthly Report","📊","For Abouna and the team","servants")}
  <div class="card sec"><label class="field">Month<select id="rpm">${monthOptions()}</select></label><button class="btn gold" id="rpgo">📊 Generate monthly report</button><div id="rpmsg" class="tag" role="status"></div></div><div id="rpout"></div>`;
  document.getElementById("rpgo").onclick=async()=>{const m=document.getElementById("rpm").value,msg=document.getElementById("rpmsg");msg.textContent="Building the report...";
    try{const r=await call({action:"rp_month",month:m});if(!r.ok)throw 0;msg.textContent="";document.getElementById("rpout").innerHTML=reportHtml(r);hvChart.play(document.getElementById("rpout"));
      document.getElementById("rpprint").onclick=()=>print();document.getElementById("rpout").scrollIntoView({behavior:"smooth"})}
    catch{msg.innerHTML=`<span class="err">Could not build the report. Check your internet.</span>`}}}
function reportHtml(r){
  const k=r.kpi,p=v=>v===null?"No data":v+"%",tr=k.trend===null?"":(k.trend>0?"▲ "+k.trend+" points vs last month":k.trend<0?"▼ "+(-k.trend)+" points vs last month":"Same as last month");
  const logo=typeof LOGO!=="undefined"?`<img src="${LOGO}" alt="Heavenly Visions" class="rp-logo">`:"";
  const wk=r.weekly.map(w=>w.d.slice(5));
  return `<div class="noprint"><button class="btn gold" id="rpprint">🖨️ Print or save as PDF</button><div class="tag">In the print window choose "Save as PDF" as the printer.</div></div>
  <article class="rp" id="rp">
   <header class="rp-cover">${logo}<h1>Sunday School Report</h1><div class="rp-month">${E(monthName(r.month))}</div><div class="rp-sub">${E(r.church)} · ${E(r.scope)}</div></header>
   <section class="rp-kpis">${[["Kids attendance",p(k.kidsPct),tr],["Servants attendance",p(k.servantsPct),""],["Kids who came",k.presentKids+" of "+k.kids,""],["Total kids",k.kids,"New this month: "+k.newKids],["Total servants",k.servants,""]].map(x=>`<div class="rp-k"><b>${x[1]}</b><span>${x[0]}</span><small>${E(x[2])}</small></div>`).join("")}</section>
   <section class="rp-sec"><h2>Attendance each Sunday</h2>${r.weekly.length>1?hvChart.line([{v:r.weekly.map(w=>w.kids),color:"#b9852b"},{v:r.weekly.map(w=>w.servants),color:"#2f8fc0"}],wk,{label:"Weekly attendance"})+`<div class="rp-leg"><span style="color:#b9852b">● Kids</span><span style="color:#2f8fc0">● Servants</span></div>`:`<p class="rp-n">Not enough Sundays this month to draw a line.</p>`}</section>
   <section class="rp-sec"><h2>Classes</h2>${r.classes.length?hvChart.bar(r.classes.slice(0,8).map(c=>({l:c.grade.replace("Grade ","G"),v:c.avg||0,color:"#b9852b"}))):"<p class=\"rp-n\">No classes yet.</p>"}${r.classes.length?`<ol class="rp-top">${r.classes.slice(0,3).map(c=>`<li><b>${E(c.grade)}</b> ${c.avg===null?"no data":c.avg+"%"} <small>${c.kids} kids</small></li>`).join("")}</ol>`:""}</section>
   <section class="rp-grid"><div class="rp-sec"><h2>Servants</h2><p>${r.servants.total} servants. Average attendance ${p(r.servants.avg)}. ${r.servants.strong} are at 80% or more.</p></div>
    <div class="rp-sec"><h2>Follow up</h2><p>${r.followup.flagged} kids needed a follow up. ${r.followup.followed} were contacted or visited this month.</p></div></section>
   <section class="rp-sec"><h2>Learning at home</h2><div class="rp-act">${[["🎮",r.activity.games,"games"],["🏆",r.activity.quizzes,"quizzes"],["📜",r.activity.verses,"daily verses"],["🙏",r.activity.prayers,"prayers"],["🎨",r.activity.coloring,"coloring pages"],["⭐",r.activity.stars,"stars earned"]].map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join("")}</div></section>
   <section class="rp-grid"><div class="rp-sec"><h2>Events</h2>${r.events.length?`<ul>${r.events.map(e=>`<li>${E(e.ic||"🎉")} <b>${E(e.title)}</b> <small>${E(e.date)}${e.place?" · "+E(e.place):""}</small></li>`).join("")}</ul>`:"<p class=\"rp-n\">No events this month.</p>"}</div>
    <div class="rp-sec"><h2>Class competition</h2>${r.winner?`<p>🏆 Winner: <b>${E(r.winner.winner||"none")}</b> with ${r.winner.score} points.${r.winner.prize?" Prize: "+E(r.winner.prize)+".":""}</p>`:"<p class=\"rp-n\">No competition result this month.</p>"}</div></section>
   <footer class="rp-foot">Made ${E(r.generated)} · Glory be to God forever. Amen. ✝</footer></article>`}

/* ---------- routes and tool card ---------- */
window.arenaRoute=function(h){if(h==="arena"){arena();return true}if(h==="report"){reportPage();return true}return false};

const st=document.createElement("style");
st.textContent=`
.ar-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.ar-prize{padding:6px 14px;border-radius:999px;background:var(--gold-soft);font-weight:900;color:var(--ink)}
.podium{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:end;min-height:260px;padding:10px 4px}
.pod{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.pod-ic{font-size:2.4rem}.pod.p1 .pod-ic{font-size:3.2rem;animation:floaty 4s ease-in-out infinite}
.pod-bar{width:100%;height:0;max-height:180px;border-radius:14px 14px 4px 4px;background:linear-gradient(180deg,var(--pc),color-mix(in srgb,var(--pc) 55%,#10162e));display:flex;align-items:flex-start;justify-content:center;padding-top:8px;color:#fff;font-size:1.5rem;transition:height 1.2s cubic-bezier(.2,.8,.2,1);box-shadow:0 10px 24px -10px var(--pc)}
.pod-bar.up{height:calc(var(--h)*1.8)}.pod-n{font-family:var(--display);font-weight:800;font-size:var(--fs-s)}.pod-m{font-size:1.4rem}
.ar-row{display:grid;grid-template-columns:28px 34px 1fr auto;gap:10px;align-items:center;padding:8px;border-radius:14px}.ar-row.me{background:var(--gold-soft);box-shadow:0 0 0 2px var(--gold)}.ar-rk{font-weight:900;text-align:center;color:var(--muted)}.ar-ic{font-size:1.6rem}.ar-n{display:flex;flex-direction:column;gap:3px;min-width:0}.ar-n small{color:var(--muted);font-weight:700;font-size:.74rem}.ar-s{font-family:var(--display);font-size:1.3rem}
.hf{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:8px 0;border-bottom:1px solid var(--line)}.hf-m{font-weight:900;color:var(--gold);grid-column:1/-1}.hf small{color:var(--muted);font-weight:700}
.rp{--ink:#1c1c2e;--muted:#5b5b73;--line:#ddd3bb;--gold:#b9852b;--good:#2c9c5a;--bg:#fff;--surface:#fff;background:#fff;color:#1c1c2e;border-radius:6px;padding:28px;max-width:820px;margin:12px auto;font-family:var(--body,Nunito,sans-serif);box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:20px}
.rp h1,.rp h2{font-family:var(--display);color:#1c1c2e;margin:0}.rp h2{font-size:1.15rem;border-bottom:2px solid #b9852b;padding-bottom:4px}.rp h2::after{display:none}
.rp-cover{text-align:center;border-bottom:4px double #b9852b;padding-bottom:16px}.rp-logo{width:150px;margin:0 auto 8px;display:block}.rp-cover h1{font-size:1.8rem}.rp-month{font-family:var(--display);font-size:1.4rem;color:#b9852b;font-weight:800}.rp-sub{color:#5b5b73;font-weight:700}
.rp-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.rp-k{border:1.5px solid #b9852b;border-radius:10px;padding:10px;text-align:center;display:flex;flex-direction:column}.rp-k b{font-family:var(--display);font-size:1.5rem}.rp-k span{font-weight:800;font-size:.8rem}.rp-k small{color:#5b5b73;font-weight:700}
.rp-sec{display:flex;flex-direction:column;gap:8px}.rp-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media (max-width:560px){.rp-grid{grid-template-columns:1fr}}
.rp-leg{display:flex;gap:14px;font-weight:800;font-size:.8rem}.rp-top{margin:0;padding-left:20px}.rp-act{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}.rp-act div{text-align:center;border:1px solid #ddd3bb;border-radius:10px;padding:8px;display:flex;flex-direction:column}.rp-act span{font-size:1.5rem}.rp-act b{font-family:var(--display);font-size:1.3rem}.rp-act small{color:#5b5b73;font-weight:700}
.rp-n{color:#5b5b73;font-weight:700;margin:0}.rp-foot{text-align:center;color:#5b5b73;font-weight:700;border-top:1px solid #ddd3bb;padding-top:10px;font-size:.85rem}.rp ul{margin:0;padding-left:18px}.rp p{margin:0;line-height:1.5}
.rp .as-bars span,.rp svg text{fill:#5b5b73;color:#1c1c2e}
@media print{@page{size:A4;margin:12mm}html,body{background:#fff!important}#sky,.shellbar,.topbar,.title-row,.noprint,.card,.toast,#confetti,.ds-fab{display:none!important}.rp{box-shadow:none;margin:0;max-width:none;padding:0}#app>*:not(#rpout){display:none!important}#app,#rpout{display:block!important}.rp *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media (prefers-reduced-motion:reduce){.pod-bar{transition:none}.pod.p1 .pod-ic{animation:none}}
`;
document.head.appendChild(st);
})();
