/* Heavenly Visions: Resource Library (links only) and Events and Trips Calendar.
   The server decides who can read or add what. This file draws it. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])};
const diff=(a,b)=>Math.round((parse(b)-parse(a))/86400000);
const nice=s=>parse(s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
async function call(body){const a=A();const r=await fetch(window.GAMES_URL,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const isStaff=()=>{const a=A();return !!(a&&a.user.role!=="student"&&!a.user.req)};
const canEvents=()=>{const a=A();return !!(a&&(a.user.role==="coordinator"||a.user.role==="priest"||a.user.role==="master"))};
const CNT=n=>n<0?"Past":n===0?"Today":n===1?"Tomorrow":"in "+n+" days";

/* ========== RESOURCE LIBRARY ========== */
const TYPES={worksheet:["📄","Worksheet"],coloring:["🎨","Coloring"],craft:["✂️","Craft"],song:["🎵","Song"],slides:["🖼️","Slides"],video:["🎬","Video"],link:["🔗","Link"]};
const L={items:[],q:"",grade:"all",type:"all",topic:"all"};
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch{return ""}};
function previewOf(u){
  let m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);if(m)return `<div class="rsvid"><iframe src="https://drive.google.com/file/d/${m[1]}/preview" title="Preview" loading="lazy"></iframe></div>`;
  m=u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);if(m)return `<div class="rsvid"><iframe src="https://www.youtube.com/embed/${m[1]}" allowfullscreen title="Video"></iframe></div>`;
  if(/\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(u))return `<img class="rsimg" src="${E(u)}" alt="Preview" loading="lazy">`;
  return `<div class="empty">This link opens in a new tab.</div>`}
async function library(){
  if(window.hvLock&&hvLock())return;
  if(!isStaff()){app.innerHTML=`${topbar("Library","📚","Servants only","servants")}<div class="empty">This is for approved servants.</div>`;return}
  app.innerHTML=`${topbar("Resource Library","📚","Worksheets, crafts, songs and slides","servants")}<div class="ds-skel" style="height:140px"></div>`;
  try{const r=await call({action:"rs_list"});if(!r.ok)throw 0;L.items=r.items}catch{app.innerHTML=`${topbar("Resource Library","📚","","servants")}<div class="card sec" style="text-align:center"><b>Could not load</b><button class="btn gold" id="rt">Try again</button></div>`;document.getElementById("rt").onclick=library;return}
  drawLib()}
function drawLib(){
  const grades=["all",...new Set(L.items.map(x=>x.grade).filter(g=>g!=="all"))],topics=["all",...new Set(L.items.map(x=>x.topic).filter(Boolean))];
  const q=L.q.trim().toLowerCase(),now=Date.now();
  const list=L.items.filter(x=>(L.grade==="all"||x.grade===L.grade||x.grade==="all")&&(L.type==="all"||x.type===L.type)&&(L.topic==="all"||x.topic===L.topic)&&(!q||(x.title+" "+x.topic).toLowerCase().includes(q)));
  const a=A().user;
  app.innerHTML=`${topbar("Resource Library","📚","Worksheets, crafts, songs and slides","servants")}
  <input class="as-search" id="rsq" type="search" placeholder="Search" value="${E(L.q)}" aria-label="Search the library">
  <div class="ds-chips" id="rsg">${grades.map(g=>`<button class="ds-chip" data-g="${E(g)}" aria-pressed="${L.grade===g}">${g==="all"?"All classes":E(g)}</button>`).join("")}</div>
  <div class="ds-chips" id="rst">${["all",...Object.keys(TYPES)].map(t=>`<button class="ds-chip" data-t="${t}" aria-pressed="${L.type===t}">${t==="all"?"All types":TYPES[t][0]+" "+TYPES[t][1]}</button>`).join("")}</div>
  ${topics.length>2?`<div class="ds-chips" id="rso">${topics.map(t=>`<button class="ds-chip" data-o="${E(t)}" aria-pressed="${L.topic===t}">${t==="all"?"All topics":E(t)}</button>`).join("")}</div>`:""}
  <button class="btn gold" id="rsadd">➕ Add a link</button>
  <div class="list">${list.length?list.map(x=>{const t=TYPES[x.type]||TYPES.link,isNew=now-x.ts<14*86400000;return `<button class="rsc" data-open="${x.id}"><span class="rsi">${t[0]}</span><span class="rsm"><b>${E(x.title)}</b><small>${t[1]} · ${x.grade==="all"?"All classes":E(x.grade)}${x.topic?" · "+E(x.topic):""} · ${E(host(x.url))}</small></span>${isNew?`<span class="spl" style="--sc:#e86f8a">New</span>`:""}</button>`}).join(""):`<div class="ds-empty"><div class="em">📚</div><b>${L.items.length?"Nothing matches":"The library is empty"}</b>${L.items.length?"Try other filters.":"Add the first worksheet or craft link."}</div>`}</div>
  <div class="tag">Links only. Put files in Google Drive, set sharing to "Anyone with the link", and paste the link here.</div>`;
  const re=()=>drawLib();
  document.getElementById("rsq").oninput=e=>{L.q=e.target.value;const pos=e.target.selectionStart;re();const n=document.getElementById("rsq");n.focus();n.setSelectionRange(pos,pos)};
  document.getElementById("rsg").onclick=e=>{const b=e.target.closest("[data-g]");if(b){L.grade=b.dataset.g;re()}};
  document.getElementById("rst").onclick=e=>{const b=e.target.closest("[data-t]");if(b){L.type=b.dataset.t;re()}};
  const so=document.getElementById("rso");if(so)so.onclick=e=>{const b=e.target.closest("[data-o]");if(b){L.topic=b.dataset.o;re()}};
  document.getElementById("rsadd").onclick=addRes;
  app.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openRes(L.items.find(x=>x.id===b.dataset.open)))}
function openRes(x){const a=A().user,mine=a.role!=="servant"||x.byGrade===a.grade;
  sheet(`<h3>${(TYPES[x.type]||TYPES.link)[0]} ${E(x.title)}</h3><div class="tag">${x.grade==="all"?"All classes":E(x.grade)}${x.topic?" · "+E(x.topic):""} · added by ${E(x.by)}</div>${previewOf(x.url)}
   <a class="btn gold" href="${E(x.url)}" target="_blank" rel="noopener noreferrer">Open the link ↗</a><div class="tag">Opens ${E(host(x.url))}</div>${mine?`<button class="btn alt" id="rsdel">🗑️ Delete</button>`:""}`,"Resource");
  const d=document.getElementById("rsdel");if(d)d.onclick=async()=>{if(!confirm("Delete this link?"))return;try{const r=await call({action:"rs_delete",rid:x.id});if(r.ok){closeSheet();toast("Deleted");library()}else toast("You cannot delete this one")}catch{toast("No internet connection")}}}
function addRes(){
  const a=A().user,wide=a.role!=="servant";
  const sh=sheet(`<h3>➕ Add a link</h3><form id="rsf" class="sec"><label class="field">Title<input id="rst1" maxlength="60" required></label><label class="field">Link (https)<input id="rsu" type="url" required placeholder="https://drive.google.com/..."></label>
   <label class="field">Type<select id="rsty">${Object.keys(TYPES).map(t=>`<option value="${t}">${TYPES[t][0]} ${TYPES[t][1]}</option>`).join("")}</select></label>
   <label class="field">Class<select id="rsgr">${wide?`<option value="all">All classes</option>${GRADES.map(g=>`<option>${g}</option>`).join("")}`:`<option value="${E(a.grade)}">${E(a.grade)}</option><option value="all">All classes</option>`}</select></label>
   <label class="field">Topic (optional)<input id="rsto" maxlength="30" placeholder="Example: Noah"></label><button class="btn gold" type="submit">Save</button><div id="rsm" class="tag" role="status"></div></form>`,"Add a link");
  sh.querySelector("#rsf").onsubmit=async e=>{e.preventDefault();const m=sh.querySelector("#rsm");m.textContent="Saving...";
    try{const r=await call({action:"rs_save",r:{title:sh.querySelector("#rst1").value,url:sh.querySelector("#rsu").value,type:sh.querySelector("#rsty").value,grade:sh.querySelector("#rsgr").value,topic:sh.querySelector("#rsto").value}});
      if(r.ok){closeSheet();toast("Added ✅");library()}else m.innerHTML=`<span class="err">The link must start with https:// and the title cannot be empty.</span>`}catch{m.innerHTML=`<span class="err">No internet connection.</span>`}}}

/* ========== EVENTS AND TRIPS ========== */
const CATS={trip:["🚌","Trip","#2a9d8f"],retreat:["⛺","Retreat","#8e6bd1"],feast:["🎉","Feast","#e3b45c"],convention:["🏛️","Convention","#4b57c9"],service:["⛪","Service","#e86f8a"]};
let EV=null,EVP=null;
window.hvLoadEvents=function(force){const a=A();if(!a||!window.GAMES_URL)return Promise.resolve([]);if(EV&&!force)return Promise.resolve(EV);if(EVP&&!force)return EVP;
  EVP=call({action:"ev_list"}).then(r=>{EV=r.ok?r.items:[];if(r.ok&&window.hvCacheSet)hvCacheSet("ev",EV);window.hvEvCache=EV;window.hvEvCan=!!r.canEdit;EVP=null;return EV}).catch(()=>{EVP=null;if(!EV&&window.hvCacheGet){EV=hvCacheGet("ev")||[];window.hvEvCache=EV}return EV||[]});return EVP};
const upcoming=l=>{const t=dkey(new Date());return l.filter(e=>(e.end||e.date)>=t)};
function ics(e){const esc=s=>String(s||"").replace(/\\/g,"\\\\").replace(/[,;]/g,m=>"\\"+m).replace(/\n/g,"\\n");
  const ds=e.date.replace(/-/g,""),de=(e.end||e.date),endNext=dkey(new Date(parse(de).getTime()+86400000)).replace(/-/g,"");
  const t=e.time?e.time.replace(":","")+"00":"";
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Heavenly Visions//EN","BEGIN:VEVENT","UID:"+e.id+"@heavenly-visions","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z",
    e.time?"DTSTART:"+ds+"T"+t:"DTSTART;VALUE=DATE:"+ds,e.time?"DTEND:"+de.replace(/-/g,"")+"T"+pad(Math.min(23,+e.time.slice(0,2)+2))+e.time.slice(3,5)+"00":"DTEND;VALUE=DATE:"+endNext,
    "SUMMARY:"+esc(e.title),"LOCATION:"+esc(e.place),"DESCRIPTION:"+esc(e.desc),"END:VEVENT","END:VCALENDAR"];
  return lines.join("\r\n")}
function downloadIcs(e){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics(e)],{type:"text/calendar"}));a.download=e.title.replace(/\W+/g,"-")+".ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function evCard(e){const c=CATS[e.cat]||CATS.service,n=diff(dkey(new Date()),e.date),past=(e.end||e.date)<dkey(new Date());
  return `<button class="evc ${past?"past":""}" style="--ec:${c[2]}" data-ev="${e.id}"><span class="evi" aria-hidden="true">${E(e.ic||c[0])}</span><span class="evk">${c[0]} ${c[1]}</span><b>${E(e.title)}</b><span class="evd">${nice(e.date)}${e.end?" to "+nice(e.end):""}${e.time?" · "+E(e.time):""}</span>${e.place?`<span class="evd">📍 ${E(e.place)}</span>`:""}<span class="evn">${past?"Past":CNT(n)}</span></button>`}
function evSheet(e){const c=CATS[e.cat]||CATS.service;
  const sh=sheet(`<div class="evbig" style="--ec:${c[2]}"><span>${E(e.ic||c[0])}</span></div><h3>${E(e.title)}</h3><div class="tag">${c[0]} ${c[1]} · ${nice(e.date)}${e.end?" to "+nice(e.end):""}${e.time?" · "+E(e.time):""}</div>${e.place?`<div class="card">📍 <b>${E(e.place)}</b></div>`:""}${e.desc?`<p style="margin:0;font-weight:700;line-height:1.5">${E(e.desc)}</p>`:""}<div class="tag">For: ${e.grades[0]==="all"?"everyone":E(e.grades.join(", "))}</div>
   <button class="btn gold" id="evics">📅 Add to my calendar</button>${canEvents()?`<div class="two"><button class="btn alt" id="eved">✏️ Edit</button><button class="btn alt" id="evdl">🗑️ Delete</button></div>`:""}`,"Event");
  sh.querySelector("#evics").onclick=()=>downloadIcs(e);
  const ed=sh.querySelector("#eved");if(ed)ed.onclick=()=>evForm(e);
  const dl=sh.querySelector("#evdl");if(dl)dl.onclick=async()=>{if(!confirm("Delete this event?"))return;try{const r=await call({action:"ev_delete",eid:e.id});if(r.ok){closeSheet();toast("Deleted");await hvLoadEvents(true);events()}else toast("You cannot delete this one")}catch{toast("No internet connection")}}}
function evForm(e){
  const a=A().user,top=a.role!=="coordinator";e=e||{ic:"🎉",cat:"trip",grades:["all"]};
  const sh=sheet(`<h3>${e.id?"Edit":"New"} event</h3><form id="evf" class="sec"><label class="field">Title<input id="evt" maxlength="60" required value="${E(e.title||"")}"></label>
   <div class="field"><span>Picture</span><div class="ds-chips" id="evic">${["🎉","🚌","⛺","⛪","🍕","🎂","🎶","⚽","🏖️","🎄","🕊️","📖"].map(x=>`<button type="button" class="ds-chip" data-i="${x}" aria-pressed="${x===e.ic}">${x}</button>`).join("")}</div></div>
   <label class="field">Kind<select id="evc">${Object.keys(CATS).map(k=>`<option value="${k}" ${k===e.cat?"selected":""}>${CATS[k][0]} ${CATS[k][1]}</option>`).join("")}</select></label>
   <label class="field">Date<input type="date" id="evd" required value="${E(e.date||"")}"></label><label class="field">Last day (optional)<input type="date" id="eve" value="${E(e.end||"")}"></label>
   <label class="field">Time (optional)<input type="time" id="evtm" value="${E(e.time||"")}"></label><label class="field">Place<input id="evp" maxlength="60" value="${E(e.place||"")}"></label>
   <label class="field">Details<textarea id="evde" maxlength="300" rows="3" class="as-search">${E(e.desc||"")}</textarea></label>
   ${top?`<div class="field"><span>Classes</span><div class="ds-chips" id="evg"><button type="button" class="ds-chip" data-g="all" aria-pressed="${e.grades[0]==="all"}">Everyone</button>${GRADES.map(g=>`<button type="button" class="ds-chip" data-g="${g}" aria-pressed="${e.grades.includes(g)}">${g}</button>`).join("")}</div></div>`:`<label class="field">Send to<select id="evg2"><option value="mine">My class (${E(a.grade)})</option><option value="all" ${e.grades[0]==="all"?"selected":""}>Everyone</option></select></label>`}
   <button class="btn gold" type="submit">💾 Save</button><div id="evm" class="tag" role="status"></div></form>`,"Event form");
  let icon=e.ic;
  sh.querySelector("#evic").onclick=ev=>{const b=ev.target.closest("[data-i]");if(!b)return;icon=b.dataset.i;sh.querySelectorAll("#evic [data-i]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  const gs=sh.querySelector("#evg");if(gs)gs.onclick=ev=>{const b=ev.target.closest("[data-g]");if(!b)return;if(b.dataset.g==="all")gs.querySelectorAll("[data-g]").forEach(x=>x.setAttribute("aria-pressed",x===b));else{gs.querySelector("[data-g=all]").setAttribute("aria-pressed","false");b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true")}};
  sh.querySelector("#evf").onsubmit=async ev=>{ev.preventDefault();const m=sh.querySelector("#evm");m.textContent="Saving...";
    let grades=top?[...sh.querySelectorAll("#evg [aria-pressed=true]")].map(x=>x.dataset.g):(sh.querySelector("#evg2").value==="all"?["all"]:[a.grade]);if(!grades.length)grades=["all"];
    try{const r=await call({action:"ev_save",e:{id:e.id,title:sh.querySelector("#evt").value,ic:icon,cat:sh.querySelector("#evc").value,date:sh.querySelector("#evd").value,end:sh.querySelector("#eve").value,time:sh.querySelector("#evtm").value,place:sh.querySelector("#evp").value,desc:sh.querySelector("#evde").value,grades}});
      if(r.ok){closeSheet();toast("Saved ✅");await hvLoadEvents(true);events()}else m.innerHTML=`<span class="err">Could not save. Fill the title and date.</span>`}catch{m.innerHTML=`<span class="err">No internet connection.</span>`}}}
async function events(){
  const a=A();app.innerHTML=`${topbar("Events and Trips","🎉","What is coming up","home")}<div id="evb" class="sec"><div class="ds-skel" style="height:160px"></div></div>`;
  if(!a){document.getElementById("evb").innerHTML=`<div class="card sec" style="text-align:center"><b>Login to see events</b><button class="btn gold" data-go="login">👤 Login or create profile</button></div>`;return}
  const list=await hvLoadEvents(true),up=upcoming(list),past=list.filter(e=>!up.includes(e)).reverse();
  const b=document.getElementById("evb");
  b.innerHTML=`${canEvents()?`<button class="btn gold" id="evadd">➕ Add an event</button>`:""}
   ${up.length?`<div class="evrow">${up.map(evCard).join("")}</div>`:`<div class="ds-empty"><div class="em">🗓️</div><b>No events yet</b>Trips, retreats and feasts will show here.</div>`}
   <button class="btn alt" data-go="calendar">📅 Open the full calendar</button>
   ${past.length?`<h2 class="sech"><span>Earlier</span></h2><div class="evrow">${past.slice(0,6).map(evCard).join("")}</div>`:""}`;
  b.onclick=e=>{const c=e.target.closest("[data-ev]");if(c)return evSheet(list.find(x=>x.id===c.dataset.ev));if(e.target.closest("#evadd"))evForm()}}
/* home: the next event card */
window.hvNextEvent=async function(){
  const el=document.getElementById("nextEvent");if(!el)return;
  const l=upcoming(await hvLoadEvents());const e=l[0];if(!e||!document.getElementById("nextEvent"))return;
  const c=CATS[e.cat]||CATS.service,n=diff(dkey(new Date()),e.date);
  el.querySelector(".t").textContent=e.title;el.querySelector(".s").textContent=nice(e.date)+" · "+CNT(n);el.querySelector(".k").textContent=c[0]+" Next event";el.querySelector(".em").textContent=e.ic||c[0];el.dataset.go="events"};

/* ---------- routes ---------- */
window.churchRoute=function(h){
  if(h==="library"){library();return true}
  if(h==="events"){events();return true}
  return false};

const st=document.createElement("style");
st.textContent=`
.rsc{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:var(--r-m);border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit}.rsi{font-size:1.8rem}.rsm{flex:1;min-width:0;display:flex;flex-direction:column}.rsm small{color:var(--muted);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rsvid{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:#000}.rsvid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.rsimg{width:100%;border-radius:14px}
.evrow{display:grid;grid-auto-flow:column;grid-auto-columns:min(82%,300px);gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px}.evrow>*{scroll-snap-align:start}
@media (min-width:900px){.evrow{grid-auto-flow:row;grid-template-columns:repeat(3,1fr);grid-auto-columns:auto;overflow:visible}}
.evc{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:3px;min-height:190px;padding:16px;border-radius:var(--r-l);border:0;text-align:left;color:#fff;font:inherit;background:linear-gradient(150deg,var(--ec),color-mix(in srgb,var(--ec) 45%,#10162e));box-shadow:0 14px 26px -12px var(--ec)}
.evc::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(0,0,0,.35));pointer-events:none}.evc>*{position:relative}.evc.past{filter:grayscale(.7);opacity:.6}
.evi{position:absolute!important;right:10px;top:6px;font-size:4rem;animation:floaty 6s ease-in-out infinite}.evk{font-size:var(--fs-s);font-weight:900;letter-spacing:.06em;text-transform:uppercase;opacity:.95;margin-top:auto}.evc b{font-family:var(--display);font-size:1.25rem}.evd{font-weight:800;font-size:var(--fs-s);opacity:.95}
.evn{align-self:flex-start;margin-top:6px;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.25);font-weight:900;font-size:.8rem;backdrop-filter:blur(4px)}
.evbig{display:grid;place-items:center;height:130px;border-radius:var(--r-l);font-size:5rem;background:linear-gradient(150deg,var(--ec),color-mix(in srgb,var(--ec) 45%,#10162e))}
@media (prefers-reduced-motion:reduce){.evi{animation:none}}
`;
document.head.appendChild(st);
})();
