/* Heavenly Visions: Ask Lumi. Phase 1: the Lumi cards review screen for servants (approve, reject, edit, add, test search).
   The cards live in lumi/cards.json. What a servant decides is stored by the AI helper script (apps-script/lumi.gs), never in this app.
   Only approved cards can ever be used to answer a kid. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const isStaff=()=>{const a=A();return !!(a&&a.user.role!=="student"&&!a.user.req)};
const URL_=()=>window.hvAiUrl?hvAiUrl():"";
async function call(body){const a=A();const r=await fetch(URL_(),{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const TOPICS=["saint","feast","fast","sacrament","prayer","bible","church","history","virtue","trinity","mary","jesus","liturgy","calendar","martyr","angel","prophet","icon"];
const SOURCES=["Bible (KJV)","Bible (WEB)","Heavenly Visions kid summary of Coptic Orthodox teaching","Heavenly Visions kid summary, Synaxarium style","Heavenly Visions app content","St-Takla.org (our own words)"];
const S={cards:[],counts:null,status:"pending",topic:"",verify:false,q:"",shown:15,found:null};

window.hvLumiTool=function(){return isStaff()?`<button class="svt" style="--tc:var(--c-bed)" data-go="lumi-cards"><span>🐑</span><b>Lumi</b><small id="lmbadge">Cards, answers, alerts</small></button>`:""};
/* a small note on the Lumi tool card when a worried child needs a servant (called when the Servants page opens) */
window.hvLumiBadge=async function(){if(!isStaff()||!URL_())return;try{const r=await call({action:"lumi_alerts"});const n=r.ok?r.items.filter(x=>!x.seen).length:0;const b=document.getElementById("lmbadge");if(b&&n){b.textContent="🚨 "+n+" new alert"+(n>1?"s":"");b.style.color="#d4553b";b.style.fontWeight="900"}}catch{}};
const VIEWS=[["cards","🗂️ Cards"],["gold","⭐ Answers"],["report","📊 Questions"],["alerts","🚨 Alerts"],["settings","⚙️ Settings"]];
const when=ts=>new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});

function counts(){const c=S.counts||{pending:0,approved:0,rejected:0,verify:0};
  return [["pending","Waiting",c.pending],["approved","Approved",c.approved],["rejected","Rejected",c.rejected],["all","All",c.total||0]]}
function filtered(){
  return S.cards.filter(c=>(S.status==="all"||c.status===S.status)&&(!S.topic||c.tags.includes(S.topic))&&(!S.verify||c.verify)).filter(c=>!S.found||S.found.includes(c.id))}
function card(c){
  const st={pending:["Waiting","#9a9ec4"],approved:["Approved","#3fae6a"],rejected:["Rejected","#d4553b"]}[c.status];
  return `<article class="lmc" data-id="${E(c.id)}"><div class="lmh"><b>${E(c.title)}</b><span class="spl" style="--sc:${st[1]}">${st[0]}</span></div>
   <div class="lmm">${c.verify?`<span class="lmv" title="A reviewer should double check this card">⚠️ Please check</span>`:""}${c.isnew?`<span class="lmn">New</span>`:c.edited?`<span class="lmn">Edited</span>`:""}<span class="lml">${{little:"Little kids",older:"Older kids",all:"All ages"}[c.level]}</span>${c.tags.slice(0,4).map(t=>`<span class="lmt">${E(t)}</span>`).join("")}</div>
   <p class="lmx">${E(c.text)}</p>
   ${c.verse?`<div class="lmverse">“${E(c.verse.text)}” <b>${E(c.verse.ref)}</b></div>`:""}
   <div class="tag">📚 ${E(c.source)}${c.ref?" · "+E(c.ref):""}${c.url?` · <a class="lmu" href="${E(c.url)}" target="_blank" rel="noopener">Open the page ↗</a>`:""}</div>
   <div class="lmact"><button class="btn gold" data-ap="${E(c.id)}" ${c.status==="approved"?"disabled":""}>✅ Approve</button><button class="btn alt" data-rj="${E(c.id)}" ${c.status==="rejected"?"disabled":""}>❌ Reject</button><button class="btn alt" data-ed="${E(c.id)}">✏️ Edit</button>${c.status!=="pending"?`<button class="btn alt" data-pd="${E(c.id)}">↩ Back to waiting</button>`:""}</div></article>`}

function draw(){
  const list=filtered(),shown=list.slice(0,S.shown),c=S.counts||{};
  const root=document.getElementById("lmroot");if(!root)return;
  root.innerHTML=`<div class="ds-chips lmstat" id="lmst" role="group" aria-label="Show">${counts().map(x=>`<button class="ds-chip" data-st="${x[0]}" aria-pressed="${S.status===x[0]}">${x[1]} (${x[2]})</button>`).join("")}</div>
   <div class="lmtools"><label class="field">Topic<select id="lmtp"><option value="">All topics</option>${TOPICS.map(t=>`<option ${S.topic===t?"selected":""}>${t}</option>`).join("")}</select></label>
    <label class="plm"><input type="checkbox" id="lmvf" ${S.verify?"checked":""}> ⚠️ Only cards to double check${c.verify?` (${c.verify} waiting)`:""}</label></div>
   <form class="lmsearch" id="lmsf"><label class="field">Try a question (test the search)<input id="lmq" maxlength="200" placeholder="Why do we use incense?" value="${E(S.q)}"></label><div class="two"><button class="btn alt" type="submit">🔎 Search</button><button class="btn alt" type="button" id="lmclr">Clear</button></div>
    <div class="tag" id="lmqm" role="status">${S.found?(S.found.length?S.found.length+" cards match. Showing them below.":"No card matches. Lumi would say it does not know."):"Search shows which cards Lumi would find, best first."}</div></form>
   <div class="two"><button class="btn gold" id="lmadd">➕ Add a card</button><button class="btn alt" id="lmall" ${list.length&&S.status==="pending"?"":"disabled"}>✅ Approve the ${list.filter(x=>!x.verify&&x.status==="pending").length} shown without ⚠️</button></div>
   <div id="lmlist">${shown.length?shown.map(card).join(""):`<div class="empty" data-ic="🐑">${S.status==="pending"?"Nothing waiting. Well done!":"No cards here."}</div>`}</div>
   ${list.length>shown.length?`<button class="btn alt" id="lmmore">Show more (${list.length-shown.length} left)</button>`:""}`;
  wire()}

async function review(ids,to){
  try{const r=await call({action:"lumi_review",ids,to});if(!r.ok)throw 0;ids.forEach(id=>{const k=S.cards.find(x=>x.id===id);if(k)k.status=to});S.counts=r.counts;draw();toast(to==="approved"?"Approved ✅":to==="rejected"?"Rejected":"Moved back to waiting")}catch{toast("Could not save. Check your internet.")}}

function editSheet(c,pre){
  const n=!c;c=c||{id:"",title:pre||"",text:"",tags:[],kw:[],level:"all",source:SOURCES[2],ref:"",verify:false};
  sheet(`<h3>${n?"➕ New card":"✏️ Edit card"}</h3><form id="lmef" class="sec"><label class="field">Title<input id="lmet" maxlength="80" required value="${E(c.title)}"></label>
   <label class="field">Text (what Lumi may say, about 70 to 200 words)<textarea id="lmex" rows="7" maxlength="1800" required class="as-search">${E(c.text)}</textarea></label>
   <label class="field">Topics (comma separated)<input id="lmeg" value="${E(c.tags.join(", "))}" placeholder="saint, martyr"></label>
   <label class="field">Search words kids might type (comma separated)<input id="lmek" value="${E(c.kw.join(", "))}" placeholder="mary, theotokos, virgin mary"></label>
   <label class="field">For<select id="lmel">${[["all","All ages"],["little","Little kids (Pre K to Grade 2)"],["older","Older kids (Grade 3 and up)"]].map(x=>`<option value="${x[0]}" ${c.level===x[0]?"selected":""}>${x[1]}</option>`).join("")}</select></label>
   <label class="field">Where the facts come from<select id="lmes">${SOURCES.map(x=>`<option ${c.source===x?"selected":""}>${E(x)}</option>`).join("")}</select></label>
   <label class="field">Reference (Bible verse or note)<input id="lmer" maxlength="100" value="${E(c.ref)}"></label>
   <label class="plm"><input type="checkbox" id="lmev" ${c.verify?"checked":""}> ⚠️ Someone should double check this</label>
   <div class="tag">After you save, the card goes back to Waiting. Approve it again so Lumi can use it.</div>
   <button class="btn gold" type="submit">💾 Save</button><div id="lmem" class="tag" role="status"></div></form>`,"Edit card");
  document.getElementById("lmef").onsubmit=async e=>{e.preventDefault();const m=document.getElementById("lmem");m.textContent="Saving...";
    const split=v=>v.split(",").map(x=>x.trim()).filter(Boolean);
    const card={id:c.id,title:document.getElementById("lmet").value,text:document.getElementById("lmex").value,tags:split(document.getElementById("lmeg").value),kw:split(document.getElementById("lmek").value),
      level:document.getElementById("lmel").value,source:document.getElementById("lmes").value,ref:document.getElementById("lmer").value,verify:document.getElementById("lmev").checked,links:c.links||[],verse:c.verse||null,url:c.url||""};
    try{const r=await call({action:"lumi_save",card});if(!r.ok){m.textContent=r.error==="missing"?"Add a title and some text.":"Could not save.";return}closeSheet();toast("Saved. Approve it when you are ready.");await load(true)}catch{m.textContent="No internet connection."}}}

function wire(){
  const $=id=>document.getElementById(id);
  $("lmst").onclick=e=>{const b=e.target.closest("[data-st]");if(!b)return;S.status=b.dataset.st;S.shown=15;draw()};
  $("lmtp").onchange=e=>{S.topic=e.target.value;S.shown=15;draw()};
  $("lmvf").onchange=e=>{S.verify=e.target.checked;S.shown=15;draw()};
  $("lmsf").onsubmit=async e=>{e.preventDefault();const q=$("lmq").value.trim();S.q=q;if(!q){S.found=null;draw();return}
    try{const r=await call({action:"lumi_search",q,all:true,level:"older"});if(!r.ok)throw 0;S.found=r.results.map(x=>x.id);S.status="all";S.topic="";S.verify=false;S.shown=15;draw();
      const order=r.results.map(x=>x.id);const l=$("lmlist");if(l){[...l.querySelectorAll(".lmc")].sort((a,b)=>order.indexOf(a.dataset.id)-order.indexOf(b.dataset.id)).forEach(n=>l.appendChild(n))}}catch{toast("Search did not work. Check your internet.")}};
  $("lmclr").onclick=()=>{S.q="";S.found=null;draw()};
  $("lmadd").onclick=()=>editSheet(null);
  $("lmall").onclick=()=>{const ids=filtered().filter(x=>!x.verify&&x.status==="pending").map(x=>x.id);if(!ids.length)return toast("Nothing to approve here");if(confirm("Approve "+ids.length+" cards? Only do this after you have read them."))review(ids,"approved")};
  const more=$("lmmore");if(more)more.onclick=()=>{S.shown+=15;draw()};
  $("lmlist").onclick=e=>{const b=e.target.closest("[data-ap],[data-rj],[data-pd],[data-ed]");if(!b)return;
    if(b.dataset.ap)review([b.dataset.ap],"approved");else if(b.dataset.rj)review([b.dataset.rj],"rejected");else if(b.dataset.pd)review([b.dataset.pd],"pending");else editSheet(S.cards.find(x=>x.id===b.dataset.ed))}}

async function load(keep){
  const root=document.getElementById("lmroot");if(!root)return;
  try{const r=await call({action:"lumi_cards"});if(!r.ok)throw r.error;S.cards=r.cards;S.counts=r.counts;if(!keep)S.shown=15;draw()}
  catch(err){root.innerHTML=`<div class="empty" data-ic="🐑">${err==="nocards"?"Lumi could not load the cards. The app owner needs to check the cards link.":err==="denied"?"This is for approved servants.":"Could not reach the helper. Check your internet."}</div>`}}

/* ================= Gold answers: the official answer a servant writes ================= */
function root(){return document.getElementById("lmroot")}
function bad(msg){const r=root();if(r)r.innerHTML=`<div class="empty" data-ic="🐑">${msg}</div>`}
function fail(err){bad(err==="denied"?"This is for approved servants.":err==="nocards"?"Lumi could not load the cards. The app owner needs to check the cards link.":"Could not reach the helper. Check your internet.")}
async function goldView(){
  root().innerHTML=`<div class="ds-skel" style="height:120px"></div>`;
  try{const r=await call({action:"lumi_gold_list"});if(!r.ok)throw r.error;
    root().innerHTML=`<div class="note">A <b>gold answer</b> is the official answer a servant writes. When a child asks something like one of its questions, Lumi gives this answer <b>word for word</b>, before she looks at any card.</div>
     <button class="btn gold" id="lgnew">➕ Write a gold answer</button>
     ${r.items.length?r.items.map(g=>`<article class="lmc"><div class="lmm">${g.q.map(x=>`<span class="lmt">${E(x)}</span>`).join("")}</div><p class="lmx">${E(g.a)}</p>${g.v?`<div class="lmverse">“${E(g.v.text)}” <b>${E(g.v.ref)}</b></div>`:""}<div class="tag">Written by ${E(g.by||"a servant")}${g.ts?" · "+when(g.ts):""}</div>
      <div class="lmact"><button class="btn alt" data-ge="${E(g.id)}">✏️ Edit</button><button class="btn alt" data-gd="${E(g.id)}">🗑️ Delete</button></div></article>`).join(""):`<div class="empty" data-ic="⭐">No gold answers yet. Write one for a question kids ask a lot.</div>`}`;
    document.getElementById("lgnew").onclick=()=>goldSheet(null);
    root().onclick=async e=>{const b=e.target.closest("[data-ge],[data-gd]");if(!b)return;
      if(b.dataset.ge)return goldSheet(r.items.find(x=>x.id===b.dataset.ge));
      if(!confirm("Delete this gold answer?"))return;try{const d=await call({action:"lumi_gold_delete",gid:b.dataset.gd});if(!d.ok)throw 0;toast("Deleted");goldView()}catch{toast("Could not delete. Check your internet.")}}
  }catch(err){fail(err)}}
function goldSheet(g,pre){
  g=g||{q:pre&&pre.q?[pre.q]:[],a:"",v:null};
  sheet(`<h3>⭐ ${g.id?"Edit gold answer":"New gold answer"}</h3>${pre&&pre.old?`<div class="note">Lumi said: “${E(pre.old)}”</div>`:""}<form id="lgf" class="sec">
   <label class="field">Questions kids might ask (one per line, up to 4)<textarea id="lgq" rows="3" maxlength="500" class="as-search" required>${E(g.q.join("\n"))}</textarea></label>
   <label class="field">The official answer (20 to 700 letters)<textarea id="lga" rows="6" maxlength="700" class="as-search" required>${E(g.a)}</textarea></label>
   <label class="field">Bible verse, if you want one (optional)<input id="lgv" maxlength="300" value="${E(g.v?g.v.text:"")}"></label><label class="field">Verse reference<input id="lgr" maxlength="50" value="${E(g.v?g.v.ref:"")}"></label>
   <div class="tag">Write it so a child can read it. No web addresses.</div><button class="btn gold" type="submit">💾 Save</button><div id="lgm" class="tag" role="status"></div></form>`,"Gold answer");
  document.getElementById("lgf").onsubmit=async e=>{e.preventDefault();const m=document.getElementById("lgm");m.textContent="Saving...";
    const v=document.getElementById("lgv").value.trim(),rf=document.getElementById("lgr").value.trim();
    const gold={id:g.id,q:document.getElementById("lgq").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,4),a:document.getElementById("lga").value.trim(),v:v&&rf?{text:v,ref:rf}:null};
    try{const r=await call({action:"lumi_gold_save",gold});if(!r.ok){m.textContent=r.error==="full"?"There are too many gold answers. Delete one first.":"Add a question and an answer of at least 20 letters.";return}closeSheet();toast("Saved ⭐");S.view="gold";view()}catch{m.textContent="No internet connection."}}}

/* ================= Questions report (anonymous) ================= */
const monthsList=()=>{const o=[],d=new Date();for(let i=0;i<6;i++){const x=new Date(d.getFullYear(),d.getMonth()-i,1);o.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"))}return o};
const monthName=m=>{const a=m.split("-");return new Date(+a[0],+a[1]-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"})};
async function reportView(month){
  root().innerHTML=`<div class="ds-skel" style="height:120px"></div>`;
  try{const r=await call({action:"lumi_report",month:month||undefined});if(!r.ok)throw r.error;
    const q=(x,k)=>`<div class="lmrow"><span class="lmq">${E(x.q)}</span><small>${k}</small><div class="lmact"><button class="btn alt" data-gq="${E(x.q)}">⭐ Write an answer</button><button class="btn alt" data-cq="${E(x.q)}">➕ Add a card</button></div></div>`;
    root().innerHTML=`<label class="field">Month<select id="lrm">${monthsList().map(m=>`<option value="${m}" ${m===r.month?"selected":""}>${monthName(m)}</option>`).join("")}</select></label>
     <div class="ds-chips"><span class="ds-chip">${r.totals.asked} questions</span><span class="ds-chip">${r.totals.distinct} different</span><span class="ds-chip">${r.totals.unanswered} Lumi could not answer</span><span class="ds-chip">${r.totals.down} 👎</span></div>
     <div class="note">This list is anonymous. It never shows who asked.</div>
     <h2 class="ll-h">❓ Lumi could not answer</h2>${r.unanswered.length?r.unanswered.map(x=>q(x,"asked "+x.n+(x.n>1?" times":" time"))).join(""):`<div class="empty" data-ic="🎉">Nothing here. Lumi knew every answer.</div>`}
     <h2 class="ll-h">🔥 Asked the most</h2>${r.top.length?r.top.map(x=>q(x,"asked "+x.n+(x.n>1?" times":" time")+(x.u?" · "+x.u+" without an answer":"")+(x.dn?" · "+x.dn+" 👎":""))).join(""):`<div class="empty" data-ic="🐑">No questions yet this month.</div>`}
     <h2 class="ll-h">👎 Answers a child did not like</h2>${r.down.length?r.down.map(x=>`<div class="lmrow"><span class="lmq">${E(x.q)}</span><p class="lmx">Lumi said: ${E(x.a)}</p><small>${E(x.g||"")} · ${when(x.ts)}</small><div class="lmact"><button class="btn alt" data-gq="${E(x.q)}" data-old="${E(x.a)}">⭐ Write a better answer</button></div></div>`).join(""):`<div class="empty" data-ic="👍">No thumbs down.</div>`}`;
    document.getElementById("lrm").onchange=e=>reportView(e.target.value);
    root().onclick=e=>{const b=e.target.closest("[data-gq],[data-cq]");if(!b)return;if(b.dataset.gq)return goldSheet(null,{q:b.dataset.gq,old:b.dataset.old});S.view="cards";view(()=>editSheet(null,b.dataset.cq))}
  }catch(err){fail(err)}}

/* ================= Alerts: a child may need help ================= */
async function alertsView(){
  root().innerHTML=`<div class="ds-skel" style="height:120px"></div>`;
  try{const r=await call({action:"lumi_alerts"});if(!r.ok)throw r.error;
    const open=r.items.filter(x=>!x.seen),done=r.items.filter(x=>x.seen);
    const card=a=>`<article class="lmc lmalert ${a.seen?"":"new"}"><div class="lmh"><b>${E(a.kn||"A child")}</b><span class="spl" style="--sc:${a.seen?"#3fae6a":"#d4553b"}">${a.seen?"Seen ✅":"New"}</span></div><div class="tag">${E(a.gr||"")} · ${when(a.ts)}</div>
      <p class="lmx">“${E(a.q)}”</p>${a.seen&&a.note?`<div class="tag">Note: ${E(a.note)}${a.by?" ("+E(a.by)+")":""}</div>`:""}
      <div class="lmact"><button class="btn alt" data-ah="${E(a.kid)}" data-an="${E(a.kn||"")}">🕘 Recent questions</button>${a.seen?"":`<button class="btn gold" data-as="${E(a.id)}">✅ I saw this</button>`}</div></article>`;
    root().innerHTML=`<div class="note">When a child writes something that sounds like they are hurt, unsafe or very sad, Lumi answers warmly and tells them to talk to a grown-up. <b>You</b> see it here, privately. Please reach out to the child or the family in person.</div>
     ${open.length?open.map(card).join(""):`<div class="empty" data-ic="💛">No new alerts.</div>`}${done.length?`<h2 class="ll-h">Done</h2>${done.map(card).join("")}`:""}`;
    root().onclick=async e=>{const b=e.target.closest("[data-ah],[data-as]");if(!b)return;
      if(b.dataset.ah){try{const h=await call({action:"lumi_hist",kid:b.dataset.ah});if(!h.ok)throw 0;sheet(`<h3>🕘 ${E(b.dataset.an||"Recent questions")}</h3>${h.items.length?h.items.map(x=>`<div class="lmrow"><span class="lmq">${E(x.q)}</span><small>${when(x.ts)}</small></div>`).join(""):`<div class="empty" data-ic="🐑">Nothing yet.</div>`}`,"Recent questions")}catch{toast("You cannot open this one.")}return}
      const note=prompt("Add a short note (optional). For example: Called the family.","")||"";
      try{const d=await call({action:"lumi_alert_seen",aid:b.dataset.as,note});if(!d.ok)throw 0;toast("Marked as seen ✅");alertsView()}catch{toast("Could not save. Check your internet.")}}
  }catch(err){fail(err)}}

/* ================= Settings (coordinator, priest, master change them) ================= */
async function settingsView(){
  root().innerHTML=`<div class="ds-skel" style="height:120px"></div>`;
  try{const r=await call({action:"lumi_cfg_get"});if(!r.ok)throw r.error;const c=r.cfg,can=r.canEdit,dis=can?"":"disabled";
    root().innerHTML=`<form class="card sec" id="lsf"><h2>⚙️ Lumi settings</h2><div class="tag">${r.today} questions asked today by everyone.</div>
     ${can?"":`<div class="note">Only a coordinator or priest can change these. You can see them.</div>`}
     <label class="plm"><input type="checkbox" id="lson" ${c.on?"checked":""} ${dis}> 🐑 Lumi is on for the children</label>
     <label class="field">Questions each child can ask per day<input type="number" id="lsk" min="1" max="100" value="${c.perKid}" ${dis}></label>
     <label class="field">Questions for the whole app per day<input type="number" id="lsd" min="10" max="1000" value="${c.perDay}" ${dis}></label>
     <div class="field"><span>Which grades can use Lumi (none selected means all)</span><div class="ds-chips" id="lsg">${r.grades.map(g=>`<button type="button" class="ds-chip" data-g="${E(g)}" aria-pressed="${c.grades.includes(g)}" ${dis}>${E(g)}</button>`).join("")}</div></div>
     ${can?`<button class="btn gold" type="submit">💾 Save settings</button>`:""}<div id="lsm" class="tag" role="status"></div></form>`;
    document.getElementById("lsg").onclick=e=>{const b=e.target.closest("[data-g]");if(b&&can)b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true")};
    document.getElementById("lsf").onsubmit=async e=>{e.preventDefault();if(!can)return;const m=document.getElementById("lsm");m.textContent="Saving...";
      const cfg={on:document.getElementById("lson").checked,perKid:+document.getElementById("lsk").value,perDay:+document.getElementById("lsd").value,grades:[...document.querySelectorAll("#lsg [aria-pressed=true]")].map(x=>x.dataset.g)};
      try{const d=await call({action:"lumi_cfg_set",cfg});if(!d.ok)throw d.error;m.textContent="Saved ✅"}catch(er){m.textContent=er==="denied"?"Only a coordinator or priest can change this.":"Could not save. Check your internet."}}
  }catch(err){fail(err)}}

function view(after){
  const r=root();if(!r)return;r.onclick=null;
  document.querySelectorAll("#lmviews button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S.view));
  const go=S.view==="gold"?goldView:S.view==="report"?reportView:S.view==="alerts"?alertsView:S.view==="settings"?settingsView:load;
  Promise.resolve(go()).then(()=>{if(after)after()})}

function page(v){
  if(window.hvLock&&hvLock())return;
  S.view=v||"cards";
  const t=topbar("Lumi","🐑","Cards, answers and alerts","servants");
  if(!isStaff()){app.innerHTML=`${t}<div class="empty">This is for approved servants.</div>`;return}
  if(!URL_()){app.innerHTML=`${t}<div class="soonbox" style="--sc:var(--c-bed)"><div class="em" aria-hidden="true">🐑</div><span class="chipsoon">Not switched on yet</span><ul><li>Lumi needs the helper script set up first (see HANDOFF).</li></ul></div>`;return}
  app.innerHTML=`${t}<div class="ds-seg lmviews" id="lmviews" role="tablist">${VIEWS.map(x=>`<button data-v="${x[0]}" aria-pressed="${S.view===x[0]}" role="tab">${x[1]}</button>`).join("")}</div>
   ${S.view==="cards"?`<div class="note">Lumi only answers from <b>approved</b> cards. Read each card. Approve it only if it is correct and kind. Cards marked ⚠️ have details that need a double check.</div>`:""}<div id="lmroot" class="sec"><div class="ds-skel" style="height:140px"></div></div>`;
  document.getElementById("lmviews").onclick=e=>{const b=e.target.closest("[data-v]");if(!b)return;S.view=b.dataset.v;view()};
  view()}

window.lumiRoute=function(h){const m={"lumi-cards":"cards","lumi-gold":"gold","lumi-report":"report","lumi-alerts":"alerts","lumi-settings":"settings"};if(m[h]){page(m[h]);return true}return false};

const st=document.createElement("style");
st.textContent=`.lmstat{margin-top:4px}.lmtools{display:flex;flex-direction:column;gap:6px}
.lmc{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:var(--r-l);border:1px solid var(--glass-b);background:var(--glass)}
.lmh{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.lmh b{font-family:var(--display);font-size:var(--fs-l)}
.lmm{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.lmt,.lml,.lmn{font-size:.78rem;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--line);color:var(--ink)}.lml{background:var(--gold-soft)}.lmn{background:var(--sky-soft)}
.lmv{font-size:.82rem;font-weight:900;padding:3px 10px;border-radius:999px;background:#ffe9a8;color:#5a3d00}
.lmx{margin:0;line-height:1.55;white-space:pre-wrap}.lmverse{border-left:4px solid var(--gold);padding:6px 12px;font-style:italic}
.lmact{display:flex;flex-wrap:wrap;gap:8px}.lmact .btn{flex:1 1 120px}
.lmu{display:inline-flex;align-items:center;min-height:44px;font-weight:800;color:var(--gold)}
.lmsearch{display:flex;flex-direction:column;gap:6px}
.lmviews{flex-wrap:wrap;gap:4px;border-radius:20px}.ds-seg.lmviews button{white-space:nowrap;flex:1 1 30%;min-width:96px;padding:8px 10px}
.lmrow{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:var(--r-m);border:1px solid var(--glass-b);background:var(--glass)}.lmq{font-weight:900}.lmrow small{color:var(--muted);font-weight:700}
.lmalert.new{border-color:#d4553b}.ll-h{margin:6px 0 0;font-size:1.15rem}`;
document.head.appendChild(st);
})();
