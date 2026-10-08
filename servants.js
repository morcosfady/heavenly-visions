/* Heavenly Visions: servants tools (Lesson Planner with Sunday Mode, Announcements, Follow up list)
   and what kids see from them (This Sunday card, announcement cards).
   Every permission is checked on the server. This file only draws what comes back. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])};
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const nice=s=>parse(s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const niceLong=s=>parse(s).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
async function call(body){const a=A();const r=await fetch(window.GAMES_URL,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const isStaff=()=>{const a=A();return !!(a&&a.user.role!=="student"&&!a.user.req)};
const wide=()=>{const a=A();return a&&(a.user.role==="priest"||a.user.role==="master")};
const S={view:"week",grade:"",month:null,pubGames:null};
const gradeNow=()=>{const a=A();return wide()?(S.grade||""):a.user.grade};
const gradeKey=g=>({"Pre K":"prek","KG":"kg"}[g]||(/^Grade (\d+)$/.test(g)?"g"+g.slice(6):""));
function sundays(from,n){const d=parse(from);const out=[];let x=addDays(d,(7-d.getDay())%7);for(let i=0;i<n;i++){out.push(dkey(x));x=addDays(x,7)}return out}
const STATUS={draft:["Draft","#9a9ec4"],ready:["Ready","#3fae6a"],done:["Done","#4a8fd8"]};
const chip=s=>`<span class="spl" style="--sc:${STATUS[s][1]}">${STATUS[s][0]}</span>`;

/* ---------- tool cards on the Servants Workshop page ---------- */
const TEMPLATES=[["Bring a Bible","Please bring your Bible next Sunday.","📖","bring"],["No class","There is no Sunday School this week. See you next Sunday!","🚫","church"],["Trip reminder","Please remember the trip. Bring a lunch and a water bottle.","🚌","church"],["Great job","Great job everyone today! Keep it up.","🌟","church"]];
window.hvPostBtn=function(){return isStaff()?`<div class="postwrap"><button class="postcard" data-go="announce" aria-label="Post news to your class"><span class="pci">${window.hvIcon?hvIcon("megaphone",44):""}</span><span class="pct"><b>Post news</b><small>to your class</small></span></button></div>`:""};
window.hvQuickNews=function(){
  if(!isStaff())return "";
  return `<form class="card sec" id="qnf"><h2>📢 Quick news</h2><label class="field">Title<input id="qnt" maxlength="50" required></label><label class="field">Message<textarea id="qnm" maxlength="300" rows="2" required class="as-search"></textarea></label>
   ${A().user.role==="coordinator"?`<label class="field">Send to<select id="qng"><option value="mine">My class (${E(A().user.grade)})</option><option value="all">Everyone</option></select></label>`:""}
   <button class="btn gold" type="submit">📢 Post now</button><div id="qnmsg" role="status" class="tag"></div><button type="button" class="btn alt" data-go="announce">More options</button></form>`};
document.addEventListener("submit",async e=>{if(e.target.id!=="qnf")return;e.preventDefault();const m=document.getElementById("qnmsg"),u=A().user;m.textContent="Posting...";
  const g=document.getElementById("qng"),grades=u.role==="coordinator"?(g&&g.value==="all"?["all"]:[u.grade]):u.role==="servant"?[u.grade]:["all"];
  try{const r=await call({action:"an_save",a:{title:document.getElementById("qnt").value,msg:document.getElementById("qnm").value,ic:"📢",cat:"church",date:"",exp:"",pin:false,grades}});
    if(r.ok){toast("Posted ✅");e.target.reset();m.textContent="Posted. Kids will see it on the home screen."}else m.textContent="Could not post. Fill the title and message."}catch{m.textContent="No internet connection."}});
window.hvSvTools=function(){
  if(!isStaff())return "";
  const top=["coordinator","priest","master"].includes(A().user.role);
  return `<div class="svtools"><button class="svt" style="--tc:var(--c-serv)" data-go="planner"><span>📝</span><b>Lesson Planner</b><small>Plan each Sunday</small></button>
   <button class="svt" style="--tc:var(--c-games)" data-go="announce"><span>📢</span><b>Announcements</b><small>Tell your class</small></button>
   <button class="svt" style="--tc:var(--c-kids)" data-go="followup"><span>📞</span><b>Follow up</b><small>Kids who missed</small></button>
   <button class="svt" style="--tc:var(--c-church)" data-go="library"><span>📚</span><b>Library</b><small>Worksheets and links</small></button>${top?`<button class="svt" style="--tc:var(--c-cal)" data-go="events"><span>🎉</span><b>Events and trips</b><small>Add or change events</small></button>`:""}${window.hvAiTool?hvAiTool():""}${window.hvLumiTool?hvLumiTool():""}${top?`
   <button class="svt" style="--tc:var(--c-church)" data-go="report"><span>📊</span><b>Monthly report</b><small>For Abouna</small></button>`:""}</div>`};

function gate(title,ic,back){
  if(window.hvLock&&hvLock())return true;
  const a=A();if(!a||!isStaff()){app.innerHTML=`${topbar(title,ic,"Servants only",back||"servants")}<div class="empty">This is for approved servants.</div>`;return true}
  if(!wide()&&!a.user.grade){app.innerHTML=`${topbar(title,ic,"Servants only",back||"servants")}<div class="note">Set your class in your profile first.</div>`;return true}
  return false}
function gradePick(){if(!wide())return `<div class="tag">Class: <b>${E(A().user.grade)}</b></div>`;
  return `<label class="field" style="max-width:260px">Class<select id="svgrade"><option value="">Choose a class</option>${GRADES.map(g=>`<option ${g===S.grade?"selected":""}>${g}</option>`).join("")}</select></label>`}
function wireGrade(re){const s=document.getElementById("svgrade");if(s)s.onchange=()=>{S.grade=s.value;re()}}

/* ========== prep checklist (saved on this phone) and the recap for parents ========== */
const PREP=["Read the lesson and the Bible reading","Print the worksheet or craft","Gather the materials","Test the video","Pray for your class"];
const prepKey=(d,g)=>"hv_prep_"+d+"_"+g;
const prepList=(d,g)=>{const on=jget(prepKey(d,g),[]);return `<details class="prep"><summary>Prep checklist (${on.length} of ${PREP.length})</summary>${PREP.map((p,i)=>`<label class="plm"><input type="checkbox" data-prep="${i}" data-pd="${d}" data-pg="${E(g)}" ${on.includes(i)?"checked":""}> ${p}</label>`).join("")}</details>`};
document.addEventListener("change",e=>{const c=e.target.closest&&e.target.closest("[data-prep]");if(!c)return;const k=prepKey(c.dataset.pd,c.dataset.pg),on=jget(k,[]).filter(x=>x!==+c.dataset.prep);if(c.checked)on.push(+c.dataset.prep);jset(k,on);const s=c.closest(".prep").querySelector("summary");if(s)s.textContent="Prep checklist ("+on.length+" of "+PREP.length+")"});
const recap=(l,g,d)=>"Hello parents! "+String.fromCodePoint(127775)+"\nThis Sunday in "+g+" ("+nice(d)+") we learned: "+l.title+"."+(l.reading?"\nBible reading: "+l.reading+".":"")+(l.verse?"\nMemory verse: "+l.verse+(l.verseRef?" ("+l.verseRef+")":"")+".":"")+"\nPlease practice the verse with your child this week. See you next Sunday! God bless you.";
/* ========== LESSON PLANNER ========== */
async function planner(){
  if(gate("Lesson Planner","📝"))return;
  const t=dkey(new Date()),g=gradeNow();
  app.innerHTML=`${topbar("Lesson Planner","📝","One lesson card for each Sunday")}${gradePick()}<div class="ds-seg" id="plseg">${[["week","This week"],["month","Month"],["year","Year"]].map(v=>`<button data-v="${v[0]}" aria-pressed="${S.view===v[0]}">${v[1]}</button>`).join("")}</div><div id="plbody" class="sec"><div class="ds-skel" style="height:120px"></div></div>`;
  wireGrade(planner);
  document.getElementById("plseg").onclick=e=>{const b=e.target.closest("[data-v]");if(!b)return;S.view=b.dataset.v;planner()};
  const body=document.getElementById("plbody");
  if(!g){body.innerHTML=`<div class="empty">Choose a class to start.</div>`;return}
  const now=new Date();let from=addDays(now,-7),to=addDays(now,150);
  if(S.view==="month"){if(!S.month)S.month=new Date(now.getFullYear(),now.getMonth(),1);from=new Date(S.month.getFullYear(),S.month.getMonth(),1);to=new Date(S.month.getFullYear(),S.month.getMonth()+1,0)}
  if(S.view==="year"){from=new Date(now.getFullYear(),0,1);to=new Date(now.getFullYear(),11,31)}
  let lessons=[];
  try{const r=await call({action:"lp_list",grade:wide()?g:undefined,from:dkey(from),to:dkey(to)});if(!r.ok)throw 0;lessons=r.lessons;
    if(S.view==="year"){const r2=await call({action:"lp_list",grade:wide()?g:undefined,from:dkey(addDays(from,200)),to:dkey(to)});if(r2.ok)lessons=lessons.concat(r2.lessons.filter(x=>!lessons.some(y=>y.date===x.date)))}}
  catch{body.innerHTML=`<div class="card sec" style="text-align:center"><b>Could not load</b><p class="tag">Check your internet and try again.</p><button class="btn gold" id="rt">Try again</button></div>`;document.getElementById("rt").onclick=planner;return}
  const by={};lessons.forEach(l=>by[l.date]=l);
  const card=d=>{const l=by[d],isNext=d>=t;return `<div class="plcard ${d===sundays(t,1)[0]?"now":""}"><div class="pld"><b>${nice(d)}</b>${l?chip(l.status):`<span class="spl" style="--sc:#9a9ec4">Not planned</span>`}</div>
    <div class="plt">${l?E(l.title):"Nothing planned yet"}</div>${l&&l.reading?`<div class="tag">📖 ${E(l.reading)}</div>`:""}
    <div class="two"><button class="btn ${l?"alt":"gold"}" data-go="plan-${d}">${l?"✏️ Edit":"➕ Plan it"}</button>${l?`<button class="btn" data-go="sunday-${d}">▶ Sunday Mode</button>`:""}</div>${l?`<a class="btn alt" href="${wa("This Sunday, "+nice(d)+": "+l.title+(l.reading?"\nReading: "+l.reading:"")+(l.verse?"\nVerse: "+l.verse:""))}" target="_blank" rel="noopener">📲 Share on WhatsApp</a>`:""}${l?`${prepList(d,g)}<a class="btn alt" href="${wa(recap(l,g,d))}" target="_blank" rel="noopener">💌 Recap for parents</a>`:""}</div>`};
  if(S.view==="week")body.innerHTML=sundays(t,5).map(card).join("");
  else if(S.view==="month"){const label=S.month.toLocaleDateString("en-US",{month:"long",year:"numeric"});
    body.innerHTML=`<div class="calnav"><button class="btn alt" id="pm" aria-label="Previous month">◀</button><h2 style="margin:0">${label}</h2><button class="btn alt" id="nm" aria-label="Next month">▶</button></div>${sundays(dkey(from),6).filter(d=>parse(d).getMonth()===S.month.getMonth()).map(card).join("")}`;
    document.getElementById("pm").onclick=()=>{S.month=new Date(S.month.getFullYear(),S.month.getMonth()-1,1);planner()};document.getElementById("nm").onclick=()=>{S.month=new Date(S.month.getFullYear(),S.month.getMonth()+1,1);planner()}}
  else body.innerHTML=`<div class="tag">${now.getFullYear()}: tap a Sunday</div><div class="plyear">${sundays(dkey(from),54).filter(d=>parse(d).getFullYear()===now.getFullYear()).map(d=>{const l=by[d];return `<button class="pyd" data-go="plan-${d}" style="--sc:${l?STATUS[l.status][1]:"transparent"}" aria-label="${nice(d)}, ${l?STATUS[l.status][0]+": "+E(l.title):"not planned"}"><b>${parse(d).getDate()}</b><small>${parse(d).toLocaleDateString("en-US",{month:"short"})}</small></button>`}).join("")}</div><div class="as-leg" style="display:flex;gap:12px;flex-wrap:wrap;font-size:.78rem;font-weight:800;color:var(--muted)"><span>🟢 Ready</span><span>🔵 Done</span><span>⚪ Draft</span></div>`}

/* ---------- edit one Sunday ---------- */
const EMPTY=d=>({date:d,title:"",reading:"",video:"",verse:"",verseRef:"",game:"",quiz:"",craft:"",materials:[],notes:"",status:"draft"});
async function editPlan(date){
  if(gate("Plan a Sunday","📝","planner"))return;
  const g=gradeNow();if(!g){go("planner");return}
  app.innerHTML=`${topbar("Plan a Sunday","📝",niceLong(date),"planner")}<div class="ds-skel" style="height:200px"></div>`;
  let l=null;
  try{const r=await call({action:"lp_list",grade:wide()?g:undefined,from:date,to:date});l=(r.lessons||[]).find(x=>x.date===date)||null}catch{}
  if(!S.pubGames){try{S.pubGames=(await (await fetch(window.GAMES_URL+"?action=list")).json()).games||[]}catch{S.pubGames=[]}}
  l=l||EMPTY(date);const old=l.title?date:"";
  const gk=gradeKey(g),cur=(typeof CUR!=="undefined"&&CUR[gk])||[];
  const curOpts=cur.flatMap(b=>b[1].map(x=>`<option value="${gk}|${x[0]}">${E(x[0]+" "+x[1])}</option>`)).join("");
  const vids=(typeof V!=="undefined"?V:[]).slice().sort((a,b)=>a[1]<b[1]?-1:1);
  const games=(S.pubGames||[]).filter(x=>!x.church||x.church===(A().user.church||""));
  app.innerHTML=`${topbar("Plan a Sunday","📝",niceLong(date),"planner")}
  <form class="card sec" id="plf">
   <label class="field">Start from the curriculum<select id="plcur"><option value="">Choose a lesson to fill the form</option>${curOpts}</select></label>
   <label class="field">Title<input id="pltitle" maxlength="60" required value="${E(l.title)}" placeholder="Example: Noah and the Ark"></label>
   <label class="field">Bible reading<input id="plread" maxlength="60" value="${E(l.reading)}" placeholder="Genesis 6 to 9"></label>
   <label class="field">Memory verse<input id="plverse" maxlength="200" value="${E(l.verse)}"></label><label class="field">Verse reference<input id="plvref" maxlength="40" value="${E(l.verseRef||"")}" placeholder="Genesis 1:1"></label>
   <label class="field">Lesson video<select id="plvid"><option value="">None</option>${vids.map(v=>`<option value="${v[0]}" ${v[0]===l.video?"selected":""}>${E(v[1])}</option>`).join("")}</select></label>
   <label class="field">Game<select id="plgame"><option value="">None</option>${games.map(x=>`<option value="${E(x.id)}" ${x.id===l.game?"selected":""}>${E(x.title||x.id)}</option>`).join("")}</select></label>
   <label class="field">Quiz<select id="plquiz"><option value="">None</option>${(typeof QUIZZES!=="undefined"?QUIZZES:[]).map(q=>`<option value="${q.id}" ${q.id===l.quiz?"selected":""}>${E(q.name)}</option>`).join("")}</select></label>
   <label class="field">Activity or craft idea<input id="plcraft" maxlength="120" value="${E(l.craft)}"></label>
   <div class="field"><span>Materials to bring</span><div id="plmat" class="plmat">${l.materials.map((m,i)=>`<label class="plm"><input type="checkbox" checked data-m="${E(m)}"> ${E(m)}</label>`).join("")}</div><div class="two"><input id="plnewm" maxlength="40" placeholder="Add an item" class="as-search"><button type="button" class="btn alt" id="pladdm">Add</button></div></div>
   <label class="field">Notes (only servants see these)<textarea id="plnotes" maxlength="200" rows="3" class="as-search">${E(l.notes)}</textarea></label>
   <div class="field"><span>Status</span><div class="ds-chips" id="plst">${["draft","ready","done"].map(s=>`<button type="button" class="ds-chip" data-s="${s}" aria-pressed="${l.status===s}">${STATUS[s][0]}</button>`).join("")}</div><div class="tag">Ready lessons show on the kids' This Sunday card.</div></div>
   <button class="btn gold" type="submit">💾 Save</button><div id="plmsg" role="status" class="tag"></div></form>
  ${old?`<div class="two"><button class="btn" data-go="sunday-${date}">▶ Sunday Mode</button><button class="btn alt" id="pldup">📋 Copy</button></div><button class="btn alt" id="pldel">🗑️ Delete this lesson</button>`:""}`;
  let status=l.status;
  document.getElementById("plst").onclick=e=>{const b=e.target.closest("[data-s]");if(!b)return;status=b.dataset.s;document.querySelectorAll("#plst [data-s]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  document.getElementById("plcur").onchange=e=>{const k=e.target.value;if(!k)return;const [gg,n]=k.split("|"),les=typeof lessonOf==="function"?lessonOf(gg,n):null;if(!les)return;
    document.getElementById("pltitle").value=les[2]||les[1]||"";const v=(typeof LVERSE!=="undefined"?LVERSE:{})[k];if(v){document.getElementById("plverse").value=v[0];document.getElementById("plvref").value=v[1];document.getElementById("plread").value=v[1]}
    const vid=(typeof LV!=="undefined"?LV:{})[k];if(vid&&vid[0])document.getElementById("plvid").value=vid[0]};
  document.getElementById("pladdm").onclick=()=>{const i=document.getElementById("plnewm"),v=i.value.trim();if(!v)return;const lab=document.createElement("label");lab.className="plm";lab.innerHTML=`<input type="checkbox" checked data-m="${E(v)}"> ${E(v)}`;document.getElementById("plmat").appendChild(lab);i.value=""};
  document.getElementById("plf").onsubmit=async e=>{e.preventDefault();const m=document.getElementById("plmsg");m.textContent="Saving...";
    const lesson={date,title:document.getElementById("pltitle").value,reading:document.getElementById("plread").value,verse:document.getElementById("plverse").value,verseRef:document.getElementById("plvref").value,video:document.getElementById("plvid").value,game:document.getElementById("plgame").value,quiz:document.getElementById("plquiz").value,craft:document.getElementById("plcraft").value,materials:[...document.querySelectorAll("#plmat input:checked")].map(x=>x.dataset.m),notes:document.getElementById("plnotes").value,status};
    try{const r=await call({action:"lp_save",grade:wide()?g:undefined,lesson,oldDate:old});if(r.ok){toast("Saved ✅");go("planner")}else m.innerHTML=`<span class="err">${r.error==="full"?"This month is full. Shorten the notes.":"Could not save. Check the title."}</span>`}
    catch{m.innerHTML=`<span class="err">No internet connection.</span>`}};
  const del=document.getElementById("pldel");if(del)del.onclick=async()=>{if(!confirm("Delete this lesson?"))return;await call({action:"lp_delete",grade:wide()?g:undefined,date});toast("Deleted");go("planner")};
  const dup=document.getElementById("pldup");if(dup)dup.onclick=()=>dupSheet(date,g)}
function dupSheet(date,g){
  const next=dkey(addDays(parse(date),7));
  const sh=sheet(`<h3>📋 Copy this lesson</h3><label class="field">To Sunday<input type="date" id="dpd" value="${next}"></label>${wide()||A().user.role==="coordinator"&&false?`<label class="field">To class<select id="dpg">${GRADES.map(x=>`<option ${x===g?"selected":""}>${x}</option>`).join("")}</select></label>`:""}<button class="btn gold" id="dpgo">Copy</button><div id="dpm" class="tag"></div>`,"Copy lesson");
  sh.querySelector("#dpgo").onclick=async()=>{try{const r=await call({action:"lp_dup",grade:wide()?g:undefined,date,toDate:sh.querySelector("#dpd").value,toGrade:sh.querySelector("#dpg")?sh.querySelector("#dpg").value:undefined});if(r.ok){closeSheet();toast("Copied as a draft ✅")}else sh.querySelector("#dpm").innerHTML=`<span class="err">Could not copy.</span>`}catch{sh.querySelector("#dpm").innerHTML=`<span class="err">No internet connection.</span>`}}}

/* ---------- Sunday Mode: one big step at a time, made for the TV ---------- */
async function sundayMode(date,startStep){
  if(gate("Sunday Mode","▶","planner"))return;
  const g=gradeNow();if(!g){go("planner");return}
  const r=await call({action:"lp_list",grade:wide()?g:undefined,from:date,to:date}).catch(()=>null);const l=r&&(r.lessons||[]).find(x=>x.date===date);
  if(!l){toast("Plan this Sunday first");go("plan-"+date);return}
  const steps=[{k:"open",ic:"🙏",t:"Opening prayer",html:()=>`<div class="smtext">Our Father who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from the evil one. Amen.</div>`}];
  steps.push({k:"title",ic:"📖",t:l.title,html:()=>`<div class="smtext big">${E(l.title)}</div>${l.reading?`<div class="smsub">${E(l.reading)}</div>`:""}`});
  if(l.verse)steps.push({k:"verse",ic:"📜",t:"Memory verse",html:()=>`<div class="smtext big">“${E(l.verse)}”</div><div class="smsub">${E(l.verseRef||"")}</div>`});
  if(l.video)steps.push({k:"video",ic:"🎬",t:"Video",html:()=>`<div class="smvid"><iframe src="https://www.youtube-nocookie.com/embed/${l.video}?rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Lesson video"></iframe></div>`});
  if(l.craft)steps.push({k:"craft",ic:"✂️",t:"Activity",html:()=>`<div class="smtext big">${E(l.craft)}</div>${l.materials.length?`<div class="smsub">You need: ${l.materials.map(E).join(", ")}</div>`:""}`});
  if(l.game)steps.push({k:"game",ic:"🎮",t:"Game",html:()=>`<div class="smtext">Time to play!</div><button class="btn gold smgo" data-sgo="gplay-${E(l.game)}">🎮 Open the game</button>`});
  if(l.quiz)steps.push({k:"quiz",ic:"🏆",t:"Quiz",html:()=>`<div class="smtext">Let's test what we learned!</div><button class="btn gold smgo" data-sgo="quiz-${E(l.quiz)}">🏆 Open the quiz</button>`});
  steps.push({k:"close",ic:"🙏",t:"Closing prayer",html:()=>`<div class="smtext big">Holy God, Holy Mighty, Holy Immortal, who was crucified for us, have mercy on us. Thank You, Jesus, for today. Amen.</div><button class="btn gold smgo" id="smdone">✅ Finish and mark done</button>`});
  let i=Math.min(startStep||0,steps.length-1);
  const o=document.createElement("div");o.className="sunday";o.setAttribute("role","dialog");o.setAttribute("aria-label","Sunday Mode");document.body.appendChild(o);
  const stop=()=>{o.remove();try{sessionStorage.removeItem("hv_sunday")}catch{}removeFab()};
  const draw=()=>{const s=steps[i];try{sessionStorage.setItem("hv_sunday",JSON.stringify({date,i}))}catch{}
    o.innerHTML=`<div class="smtop"><button class="back" id="smx">✕ Exit</button><div class="smdots">${steps.map((x,k)=>`<i class="${k===i?"on":k<i?"done":""}"></i>`).join("")}</div></div>
    <div class="smstage"><div class="smic" aria-hidden="true">${s.ic}</div><h1 class="smh">${s.k==="title"?"Today's lesson":E(s.t)}</h1>${s.html()}</div>
    <div class="smnav"><button class="btn alt" id="smp" ${i===0?"disabled":""}>◀ Back</button><button class="btn gold" id="smn" ${i===steps.length-1?"disabled":""}>Next ▶</button></div>`;
    o.querySelector("#smx").onclick=stop;o.querySelector("#smp").onclick=()=>{i--;draw()};o.querySelector("#smn").onclick=()=>{i++;draw()};
    const go2=o.querySelector("[data-sgo]");if(go2)go2.onclick=()=>{o.style.display="none";location.hash=go2.dataset.sgo;showFab(date,i,o)};
    const dn=o.querySelector("#smdone");if(dn)dn.onclick=async()=>{try{await call({action:"lp_save",grade:wide()?g:undefined,lesson:Object.assign({},l,{status:"done"}),oldDate:date});toast("Marked done ✅")}catch{}stop();go("planner")}};
  draw();document.addEventListener("keydown",function k(e){if(!document.body.contains(o)){document.removeEventListener("keydown",k);return}if(e.key==="Escape")stop();if(e.key==="ArrowRight"&&i<steps.length-1){i++;draw()}if(e.key==="ArrowLeft"&&i>0){i--;draw()}})}
let fab=null;
function showFab(date,i,o){removeFab();fab=document.createElement("button");fab.className="ds-fab smfab";fab.textContent="↩";fab.setAttribute("aria-label","Back to Sunday Mode");fab.onclick=()=>{removeFab();o.style.display="";if(location.hash!=="#sunday-"+date)history.replaceState(null,"","#sunday-"+date)};document.body.appendChild(fab)}
function removeFab(){if(fab){fab.remove();fab=null}}

/* ========== ANNOUNCEMENTS ========== */
const CATS={event:["🎉","Event","#e86f8a"],church:["⛪","Church","#4b57c9"],bring:["📚","Bring something","#2a9d8f"],important:["⚠️","Important","#e8794a"]};
const ICONS=["📢","🎉","⛪","📚","🚌","🍕","🎒","🙏","⭐","🎨"];
async function announce(){
  if(gate("Announcements","📢"))return;
  app.innerHTML=`${topbar("Announcements","📢","Tell your class")}<div class="ds-skel" style="height:120px"></div>`;
  let items=[];try{const r=await call({action:"an_list"});if(r.ok)items=r.items}catch{app.innerHTML=`${topbar("Announcements","📢","Tell your class")}<div class="empty">No internet connection.</div>`;return}
  const a=A().user;
  app.innerHTML=`${topbar("Announcements","📢","Tell your class")}
  <form class="card sec" id="anf"><h2>New announcement</h2>
   <div class="field"><span>Quick start</span><div class="ds-chips" id="ant2">${TEMPLATES.map((t,k)=>`<button type="button" class="ds-chip" data-t="${k}">${t[2]} ${t[0]}</button>`).join("")}</div></div>
   <label class="field">Title<input id="ant" maxlength="50" required></label>
   <label class="field">Message<textarea id="anm" maxlength="300" rows="3" required class="as-search"></textarea></label>
   <div class="field"><span>Picture</span><div class="ds-chips" id="ani">${ICONS.map((x,k)=>`<button type="button" class="ds-chip" data-i="${x}" aria-label="Picture ${k+1}" aria-pressed="${k===0}">${x}</button>`).join("")}</div></div>
   <div class="field"><span>Kind</span><div class="ds-chips" id="anc">${Object.keys(CATS).map((k,n)=>`<button type="button" class="ds-chip" data-c="${k}" aria-pressed="${n===1}">${CATS[k][0]} ${CATS[k][1]}</button>`).join("")}</div></div>
   <label class="field">Event date (optional)<input type="date" id="and"></label><label class="field">Hide after (optional)<input type="date" id="ane"></label>
   <label class="plm"><input type="checkbox" id="anp"> 📌 Pin to the top</label>
   ${a.role==="master"?`<label class="plm"><input type="checkbox" id="angl"> 🌍 Send to ALL churches</label>`:""}
   ${a.role==="servant"?`<div class="tag">This goes to <b>${E(a.grade)}</b>.</div>`:a.role==="coordinator"?`<label class="field">Send to<select id="ang"><option value="mine">My class (${E(a.grade)})</option><option value="all">Everyone</option></select></label>`:`<div class="field"><span>Send to</span><div class="ds-chips" id="angs"><button type="button" class="ds-chip" data-g="all" aria-pressed="true">Everyone</button>${GRADES.map(x=>`<button type="button" class="ds-chip" data-g="${x}" aria-pressed="false">${x}</button>`).join("")}</div></div>`}
   <button class="btn gold" type="submit">📢 Post it</button><div id="anmsg" role="status" class="tag"></div></form>
  <section class="sec"><h2>Posted</h2>${items.length?items.map(x=>annCard(x,true)).join(""):`<div class="empty">Nothing posted yet.</div>`}</section>`;
  let icon="📢",cat="church";
  document.getElementById("ant2").onclick=e=>{const b=e.target.closest("[data-t]");if(!b)return;const t=TEMPLATES[+b.dataset.t];document.getElementById("ant").value=t[0];document.getElementById("anm").value=t[1];icon=t[2];cat=t[3];document.querySelectorAll("#ani [data-i]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.i===icon));document.querySelectorAll("#anc [data-c]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.c===cat))};
  document.getElementById("ani").onclick=e=>{const b=e.target.closest("[data-i]");if(!b)return;icon=b.dataset.i;document.querySelectorAll("#ani [data-i]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  document.getElementById("anc").onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;cat=b.dataset.c;document.querySelectorAll("#anc [data-c]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  const gs=document.getElementById("angs");if(gs)gs.onclick=e=>{const b=e.target.closest("[data-g]");if(!b)return;if(b.dataset.g==="all")gs.querySelectorAll("[data-g]").forEach(x=>x.setAttribute("aria-pressed",x===b));else{gs.querySelector("[data-g=all]").setAttribute("aria-pressed","false");b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true")}};
  document.getElementById("anf").onsubmit=async e=>{e.preventDefault();const m=document.getElementById("anmsg");m.textContent="Posting...";
    let grades=[];if(a.role==="coordinator")grades=document.getElementById("ang").value==="all"?["all"]:[a.grade];else if(a.role!=="servant"){grades=[...document.querySelectorAll("#angs [aria-pressed=true]")].map(x=>x.dataset.g);if(!grades.length)grades=["all"]}
    try{const r=await call({action:"an_save",a:{title:document.getElementById("ant").value,msg:document.getElementById("anm").value,ic:icon,cat,date:document.getElementById("and").value,exp:document.getElementById("ane").value,pin:document.getElementById("anp").checked,grades,global:!!(document.getElementById("angl")&&document.getElementById("angl").checked)}});if(r.ok){toast("Posted ✅");announce()}else m.innerHTML=`<span class="err">Could not post. Fill the title and message.</span>`}catch{m.innerHTML=`<span class="err">No internet connection.</span>`}};
  app.querySelectorAll("[data-adel]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this announcement?"))return;try{const r=await call({action:"an_delete",aid:b.dataset.adel});if(r.ok){toast("Deleted");announce()}else toast("You cannot delete this one")}catch{toast("No internet connection")}})}
const wa=t=>"https://wa.me/?text="+encodeURIComponent(t);
function annCard(x,mine){const c=CATS[x.cat]||CATS.church,seen=jget("hv_an_seen",[]).includes(x.id);
  return `<article class="anc" style="--ac:${c[2]}" data-aid="${x.id}"><div class="ani">${E(x.ic||c[0])}</div><div class="anb"><div class="ank">${c[0]} ${c[1]}${x.pin?" · 📌":""}${!mine&&!seen?`<i class="andot" role="img" aria-label="New"></i>`:""}</div><b data-keep>${E(x.title)}</b><p data-keep>${E(x.msg)}</p>${x.date?`<div class="tag">📅 ${niceLong(x.date)}</div>`:""}<small>${E(x.by||"")}${x.grades&&x.grades[0]!=="all"?" · "+E(x.grades.join(", ")):""}</small></div>${mine?`<a class="mini sharebtn" href="${wa(x.title+"\n"+x.msg+(x.date?"\n"+niceLong(x.date):""))}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">📲</a><button class="mini" data-adel="${x.id}" aria-label="Delete">🗑️</button>`:`<button class="mini" data-ahide="${x.id}" aria-label="Dismiss">✕</button>`}</article>`}

/* kids: announcement cards on the home screen and a full list */
window.hvLoadAnn=async function(){
  const a=A(),box=document.getElementById("annbox");if(!a||!box||!window.GAMES_URL)return;
  let list=null,off=false;try{const r=await call({action:"an_list"});if(r.ok){list=r.items;if(window.hvCacheSet)hvCacheSet("an",list)}}catch{}
  if(!list&&window.hvCacheGet){list=hvCacheGet("an");off=!!list}
  try{if(!list||!document.getElementById("annbox"))return;const hide=jget("hv_an_hide",[]);
    const items=list.filter(x=>!hide.includes(x.id));if(!items.length)return;
    const unread=items.filter(x=>!jget("hv_an_seen",[]).includes(x.id)).length;
    box.innerHTML=`<section class="sec" aria-label="Announcements"><h2 class="sech"><span>📢 News${unread?` <i class="andot"></i>`:""}${off?` <small class="spl" style="--sc:#9a9ec4">Offline</small>`:""}</span></h2><div class="today">${items.slice(0,4).map(x=>annCard(x,false)).join("")}</div>${items.length>4?`<button class="btn alt" data-go="news">See all (${items.length})</button>`:""}</section>`}
  catch{}};
async function newsPage(){
  const a=A();app.innerHTML=`${topbar("News","📢","From your teachers")}<div id="nl" class="sec">${window.hvSkeleton?hvSkeleton("cards"):`<div class="ds-skel" style="height:100px"></div>`}</div>`;
  if(!a){document.getElementById("nl").innerHTML=hvGate({scene:"megaphone",title:"News from your church",lead:"Your teachers post news for your class here.",benefits:[["megaphone","Trips, reminders and events"],["calendar","Dates you do not want to miss"]],primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]});return}
  try{const r=await call({action:"an_list"});const hide=jget("hv_an_hide",[]);const it=r.ok?r.items.filter(x=>!hide.includes(x.id)):[];
    document.getElementById("nl").innerHTML=it.length?it.map(x=>annCard(x,false)).join(""):hvEmpty("megaphone","No news yet","Check back on Sunday!");
    jset("hv_an_seen",it.map(x=>x.id).concat(jget("hv_an_seen",[])).slice(0,60))}catch{document.getElementById("nl").innerHTML=`<div class="empty">No internet connection.</div>`}}

/* kids: This Sunday card */
window.hvThisSunday=async function(){
  const a=A(),strip=document.querySelector(".today");if(!a||!strip||!window.GAMES_URL||!a.user.grade)return;
  try{const r=await call({action:"lp_this"});if(!r.ok||!r.lesson||!document.querySelector(".today"))return;const l=r.lesson;
    const b=document.createElement("button");b.className="tcard";b.style.setProperty("--tc","var(--c-media)");b.id="thisSunday";
    b.innerHTML=`<span class="k">📝 This Sunday</span><span class="t">${E(l.title)}</span><span class="s">${nice(l.date)}${l.reading?" · "+E(l.reading):""}</span><span class="em" aria-hidden="true">📖</span>`;
    b.onclick=()=>sheet(`<h3>${E(l.title)}</h3><div class="tag">${niceLong(l.date)}</div>${l.reading?`<div class="card">📖 <b>${E(l.reading)}</b></div>`:""}${l.verse?`<div class="parch" style="padding:16px"><div class="pk">Memory verse</div><p class="ptxt" style="font-size:1.1rem">“${E(l.verse)}”</p><div class="pref on">${E(l.verseRef||"")}</div></div>`:""}${l.video?`<button class="btn gold" data-v="${E(l.video)}">▶ Watch the video</button>`:""}`,"This Sunday");
    strip.insertBefore(b,strip.firstChild)}catch{}};

/* ========== FOLLOW UP ========== */
async function followup(){
  if(gate("Follow up","📞"))return;
  const g=gradeNow();
  app.innerHTML=`${topbar("Follow up","📞","Kids who missed 3 Sundays or are under 50%")}${gradePick()}<div id="fub" class="sec"><div class="ds-skel" style="height:140px"></div></div>`;
  wireGrade(followup);
  const body=document.getElementById("fub");if(!g){body.innerHTML=`<div class="empty">Choose a class to start.</div>`;return}
  let r;try{r=await call({action:"fu_list",grade:wide()?g:undefined});if(!r.ok)throw 0}catch{body.innerHTML=`<div class="card sec" style="text-align:center"><b>Could not load</b><button class="btn gold" id="rt">Try again</button></div>`;document.getElementById("rt").onclick=followup;return}
  const pct=r.total?Math.round(r.done*100/r.total):100;
  const day=ms=>ms?new Date(ms).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"";
  body.innerHTML=`<div class="card fuhead">${hvChart.ring(pct,{size:110,color:"var(--gold)"})}<div><b>${r.done} of ${r.total} followed up this month</b><div class="tag">Gentle calls and visits make a big difference 💛</div></div></div>
  ${r.rows.length?r.rows.map(k=>`<article class="fucard ${k.urgency}"><div class="fuh"><span class="as-av">${E(k.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase())}</span><div><b>${E(k.name)}</b><div class="tag">${k.fu==="missed3"?"Hasn't come for 3 Sundays":"Under 50% so far"} · ${k.pct===null?"":k.pct+"%"} · last here ${k.last?day(Date.parse(k.last)):"never"}</div></div></div>
   <div class="fust">${k.c?`<span>✅ Contacted ${day(k.c)}</span>`:""}${k.v?`<span>🏠 Visited ${day(k.v)}</span>`:""}</div>${k.n.length?`<div class="funotes">${k.n.map(n=>`<div>📝 ${E(n.x)} <small>${E(n.by)} · ${day(n.t)}</small></div>`).join("")}</div>`:""}
   <div class="fuact"><button class="btn alt" data-fu="contacted" data-id="${k.id}">Contacted ✅</button><button class="btn alt" data-fu="visited" data-id="${k.id}">Visited 🏠</button><button class="btn alt" data-fu="note" data-id="${k.id}">Add note</button></div></article>`).join(""):`<div class="ds-empty"><div class="em">🌟</div><b>Everyone is doing well</b>Nobody needs a follow up right now.</div>`}`;
  body.onclick=async e=>{const b=e.target.closest("[data-fu]");if(!b)return;let note="";
    if(b.dataset.fu==="note"){note=prompt("Add a short note (no phone numbers):");if(!note)return}
    b.disabled=true;try{const x=await call({action:"fu_set",grade:wide()?g:undefined,target:b.dataset.id,kind:b.dataset.fu,note});if(x.ok){toast("Saved ✅");followup()}else{toast("Could not save");b.disabled=false}}catch{toast("No internet connection");b.disabled=false}}}

/* ---------- routes ---------- */
window.servantsRoute=function(h){
  if(h==="planner"){planner();return true}
  if(h.startsWith("plan-")){editPlan(h.slice(5));return true}
  if(h.startsWith("sunday-")){sundayMode(h.slice(7));return true}
  if(h==="announce"){announce();return true}
  if(h==="news"){newsPage();return true}
  if(h==="followup"){followup();return true}
  return false};
document.addEventListener("click",e=>{const h=e.target.closest("[data-ahide]");if(h){const hide=jget("hv_an_hide",[]);hide.push(h.dataset.ahide);jset("hv_an_hide",hide);h.closest(".anc").remove();return}
  const c=e.target.closest(".anc[data-aid]");if(c&&!e.target.closest("button")){const s=jget("hv_an_seen",[]);if(!s.includes(c.dataset.aid)){s.push(c.dataset.aid);jset("hv_an_seen",s);c.querySelector(".andot")?.remove()}}});

const st=document.createElement("style");
st.textContent=`
.svtools{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}@media (min-width:600px){.svtools{grid-template-columns:repeat(4,1fr)}}.svt{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 6px;border-radius:var(--r-m);border:1px solid color-mix(in srgb,var(--tc) 55%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--tc) 22%,var(--glass)),var(--glass));color:var(--ink);font:inherit;text-align:center}
.svt span{font-size:2rem}.svt b{font-family:var(--display);font-size:.9rem}.svt small{color:var(--muted);font-weight:700;font-size:.7rem}
.plcard{display:flex;flex-direction:column;gap:6px;padding:14px;border-radius:var(--r-l);border:1px solid var(--glass-b);background:var(--glass)}.plcard.now{border-color:var(--gold);box-shadow:0 0 22px -8px var(--gold)}
.pld{display:flex;justify-content:space-between;align-items:center;gap:8px}.plt{font-family:var(--display);font-weight:800;font-size:var(--fs-l)}
.spl{border-radius:999px;padding:3px 12px;background:color-mix(in srgb,var(--sc) 24%,transparent);color:var(--ink);font-weight:900;font-size:.74rem;border:1px solid var(--sc)}
.plyear{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px}.pyd{display:flex;flex-direction:column;align-items:center;padding:6px 2px;border-radius:12px;border:2px solid var(--sc);background:color-mix(in srgb,var(--sc) 20%,transparent);color:var(--ink);font:inherit;min-height:52px}.pyd b{font-size:1rem}.pyd small{font-size:.62rem;color:var(--muted);font-weight:700}
.plmat{display:flex;flex-direction:column;gap:4px}.postbtn{min-height:52px}
.postwrap{display:flex;justify-content:center;margin:14px 0 4px}
.postcard{position:relative;display:inline-flex;align-items:center;gap:6px;min-height:58px;padding:6px 26px 6px 66px;border-radius:999px;border:1.5px solid rgba(255,255,255,.55);background:linear-gradient(135deg,#ffd978,#e0a030 60%,#c98418);color:#2b1d05;font:inherit;text-align:left;box-shadow:0 12px 24px -10px rgba(170,110,20,.75),inset 0 1px 0 rgba(255,255,255,.6);overflow:visible;transition:transform .15s}
.postcard::after{content:"";position:absolute;left:0;right:0;top:0;bottom:0;border-radius:inherit;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);background-size:250% 100%;background-position:150% 0;animation:postshine 5s ease-in-out infinite;pointer-events:none}
@keyframes postshine{0%,70%{background-position:150% 0}100%{background-position:-50% 0}}
.postcard .pci{position:absolute;left:-6px;top:50%;width:64px;height:64px;margin-top:-34px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#fff,#fff3d6 70%);box-shadow:0 8px 16px -6px rgba(120,70,10,.6),0 0 0 3px rgba(255,255,255,.7);transform:rotate(-12deg);animation:postbob 3.6s ease-in-out infinite}
@keyframes postbob{0%,100%{transform:rotate(-12deg) translateY(0)}50%{transform:rotate(-6deg) translateY(-3px)}}
.postcard .pct{display:flex;flex-direction:column;line-height:1.1}.postcard b{font-family:var(--display);font-size:1.2rem}.postcard small{font-weight:800;opacity:.75;font-size:.8rem}
.postcard:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.postcard::after,.postcard .pci{animation:none}}
.sharebtn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:inherit}
.plm{display:flex;align-items:center;gap:8px;min-height:44px;font-weight:700}.plm input{width:22px;height:22px}
textarea.as-search{resize:vertical}
.sunday{position:fixed;inset:0;z-index:2700;display:flex;flex-direction:column;gap:12px;padding:18px max(18px,env(safe-area-inset-left)) calc(18px + env(safe-area-inset-bottom,0px));background:radial-gradient(circle at 50% 0,#27306a,#0a0f2e 70%);color:#fff}
.smtop{display:flex;align-items:center;justify-content:space-between;gap:12px}.smdots{display:flex;gap:8px}.smdots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.25);display:block}.smdots i.on{background:#f6d27a;box-shadow:0 0 12px #f6d27a;transform:scale(1.3)}.smdots i.done{background:#f6d27a}
.smstage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;overflow:auto}.smic{font-size:clamp(3rem,10vw,6rem)}
.smh{font-family:var(--display);font-size:clamp(1.6rem,4vw,3rem);color:#f6d27a}.smtext{font-size:clamp(1.2rem,3vw,2.2rem);line-height:1.5;font-weight:700;max-width:34ch}.smtext.big{font-family:var(--display);font-size:clamp(1.6rem,4.4vw,3.2rem)}.smsub{font-size:clamp(1rem,2.4vw,1.6rem);color:#f6d27a;font-weight:800}
.smvid{position:relative;width:min(100%,1000px);aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#000}.smvid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.smgo{font-size:1.4rem;padding:22px 34px}.smnav{display:flex;gap:12px}.smnav .btn{flex:1;font-size:1.3rem;padding:18px}
.smfab{bottom:90px}
.anc{display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:var(--r-l);border:1px solid color-mix(in srgb,var(--ac) 60%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--ac) 20%,var(--glass)),var(--glass));position:relative}
.today .anc{min-height:150px}.ani{font-size:2.4rem}.anb{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.anb p{margin:0;font-weight:700;line-height:1.4}.anb small{color:var(--muted);font-weight:700}.ank{font-size:var(--fs-s);font-weight:900;color:var(--ac);text-transform:uppercase;letter-spacing:.06em}
.andot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff5a5f;box-shadow:0 0 8px #ff5a5f;margin-left:6px}
.fuhead{display:flex;align-items:center;gap:14px}.fucard{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:var(--r-l);border:1px solid var(--glass-b);background:var(--glass);border-left:6px solid var(--c-serv)}
.fucard.high{border-left-color:var(--low)}.fucard.mid{border-left-color:var(--mid)}.fuh{display:flex;gap:12px;align-items:center}.fust{display:flex;gap:10px;flex-wrap:wrap;font-weight:800;font-size:var(--fs-s)}.funotes{display:flex;flex-direction:column;gap:4px;font-size:var(--fs-s);font-weight:700}.funotes small{color:var(--muted)}
.fuact{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fuact .btn{padding:10px 4px;font-size:.82rem}
`;
document.head.appendChild(st);
})();
