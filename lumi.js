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
const SOURCES=["Bible (KJV)","Bible (WEB)","Heavenly Visions kid summary of Coptic Orthodox teaching","Heavenly Visions kid summary, Synaxarium style","Heavenly Visions app content"];
const S={cards:[],counts:null,status:"pending",topic:"",verify:false,q:"",shown:15,found:null};

window.hvLumiTool=function(){return isStaff()?`<button class="svt" style="--tc:var(--c-bed)" data-go="lumi-cards"><span>🐑</span><b>Lumi cards</b><small>Check what Lumi knows</small></button>`:""};

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
   <div class="tag">📚 ${E(c.source)}${c.ref?" · "+E(c.ref):""}</div>
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

function editSheet(c){
  const n=!c;c=c||{id:"",title:"",text:"",tags:[],kw:[],level:"all",source:SOURCES[2],ref:"",verify:false};
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
      level:document.getElementById("lmel").value,source:document.getElementById("lmes").value,ref:document.getElementById("lmer").value,verify:document.getElementById("lmev").checked,links:c.links||[],verse:c.verse||null};
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

function page(){
  if(window.hvLock&&hvLock())return;
  const t=topbar("Lumi cards","🐑","What Lumi may say","servants");
  if(!isStaff()){app.innerHTML=`${t}<div class="empty">This is for approved servants.</div>`;return}
  if(!URL_()){app.innerHTML=`${t}<div class="soonbox" style="--sc:var(--c-bed)"><div class="em" aria-hidden="true">🐑</div><span class="chipsoon">Not switched on yet</span><ul><li>Lumi needs the helper script set up first (see HANDOFF).</li></ul></div>`;return}
  app.innerHTML=`${t}<div class="note">Lumi only answers from <b>approved</b> cards. Read each card. Approve it only if it is correct and kind. Cards marked ⚠️ have details that need a double check.</div><div id="lmroot" class="sec"><div class="ds-skel" style="height:140px"></div></div>`;
  load()}

window.lumiRoute=function(h){if(h==="lumi-cards"){page();return true}return false};

const st=document.createElement("style");
st.textContent=`.lmstat{margin-top:4px}.lmtools{display:flex;flex-direction:column;gap:6px}
.lmc{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:var(--r-l);border:1px solid var(--glass-b);background:var(--glass)}
.lmh{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.lmh b{font-family:var(--display);font-size:var(--fs-l)}
.lmm{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.lmt,.lml,.lmn{font-size:.78rem;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--line);color:var(--ink)}.lml{background:var(--gold-soft)}.lmn{background:var(--sky-soft)}
.lmv{font-size:.82rem;font-weight:900;padding:3px 10px;border-radius:999px;background:#ffe9a8;color:#5a3d00}
.lmx{margin:0;line-height:1.55;white-space:pre-wrap}.lmverse{border-left:4px solid var(--gold);padding:6px 12px;font-style:italic}
.lmact{display:flex;flex-wrap:wrap;gap:8px}.lmact .btn{flex:1 1 120px}
.lmsearch{display:flex;flex-direction:column;gap:6px}`;
document.head.appendChild(st);
})();
