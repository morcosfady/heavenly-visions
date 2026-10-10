/* Heavenly Visions: Permissions. A small button at the bottom of Home for servants, coordinators and priests.
   - New requests: a servant who signs up is shown to the coordinator of that grade and to the Abouna of the church.
     A coordinator or a priest who signs up is shown only to the Abouna. Approvers get a bell notification and a number on the button.
   - The church team tree: Abouna, then every grade with its coordinator and servants. Every approved servant, coordinator and Abouna can see it.
   - Only coordinators (their own grade) and Abouna (the whole church) can accept or decline.
   The server decides who sees what (access_list and team_tree in games-backend.gs). The app checks for new requests when it opens and every few minutes. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const NAME={priest:"Abouna",coordinator:"Coordinator",servant:"Servant",master:"Master"};
const GR=["Pre K","KG","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const staff=a=>!!(a&&a.user&&a.user.role!=="student"&&!a.user.req);
const approver=a=>!!(a&&a.user&&!a.user.req&&(a.user.role==="coordinator"||a.user.role==="priest"||a.user.role==="master"));
async function call(body){const a=A();const r=await fetch(window.GAMES_URL,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const gi=g=>{const i=GR.indexOf(g);return i<0?99:i};
const init=n=>(String(n||"?").trim()[0]||"?").toUpperCase();

/* ---------- requests: badge and bell ---------- */
let pendN=0;
function paintBadge(){document.querySelectorAll(".perm-badge").forEach(b=>{b.hidden=!pendN;b.textContent=pendN>9?"9+":pendN})}
async function scan(){
  const a=A();if(!approver(a)||!window.GAMES_URL||navigator.onLine===false)return;
  try{const r=await call({action:"access_list"});if(!r.ok)return;pendN=r.pending.length;paintBadge();
    if(window.hvNotify)r.pending.forEach(u=>{const who=NAME[u.req]||"team member";
      hvNotify({id:"req-"+u.id+"-"+u.req,ic:"🔑",t:u.name+" wants to join as "+who,m:(u.grade?u.grade+" · ":"")+"Tap to accept or decline",go:"perm"})})}catch{}}
setInterval(scan,180000);

/* ---------- Home button ---------- */
function homeButton(){
  const a=A();if(!staff(a))return;
  const f=document.querySelector("footer");if(!f||document.getElementById("permbtn"))return;
  const b=document.createElement("button");b.id="permbtn";b.className="perm-btn";b.dataset.go="perm";
  b.innerHTML=`<span aria-hidden="true">🔑</span> Permissions <i class="perm-badge" hidden></i>`;
  const w=f.querySelector(".workshop");if(w)w.after(b);else f.prepend(b);
  paintBadge()}
const old=window.hvHomeInit;
window.hvHomeInit=function(){if(old)old.apply(this,arguments);try{homeButton();scan()}catch{}};

/* ---------- the page ---------- */
const node=(u,me)=>`<div class="pm-node r-${u.role} ${u.id===me?"me":""}"><span class="pm-av" aria-hidden="true">${E(init(u.name))}</span><span class="pm-nm"><b>${E(u.name)}${u.id===me?" (you)":""}</b><small>${NAME[u.role]||""}${u.grade?" · "+E(u.grade):""}</small></span></div>`;
function treeHTML(t,me){
  const st=t.staff||[],ab=st.filter(u=>u.role==="priest"),co=st.filter(u=>u.role==="coordinator"),se=st.filter(u=>u.role==="servant");
  const grades=[...new Set([...co,...se].map(u=>u.grade||""))].sort((x,y)=>gi(x)-gi(y)||x.localeCompare(y));
  return `<section class="pm-tree" aria-label="Church team">
    <div class="pm-church"><span aria-hidden="true">⛪</span><div><b>${E(t.church||"Your church")}</b><small>${ab.length} Abouna · ${co.length} coordinator${co.length===1?"":"s"} · ${se.length} servant${se.length===1?"":"s"}</small></div></div>
    <div class="pm-level"><h3>Abouna</h3><div class="pm-row">${ab.length?ab.map(u=>node(u,me)).join(""):`<p class="tag">No Abouna yet.</p>`}</div></div>
    <div class="pm-trunk" aria-hidden="true"></div>
    <div class="pm-grades">${grades.length?grades.map(g=>{const c=co.filter(u=>(u.grade||"")===g),s=se.filter(u=>(u.grade||"")===g);
      return `<div class="pm-branch"><div class="pm-gh">${E(g||"No grade yet")}</div>${c.map(u=>node(u,me)).join("")}${s.map(u=>node(u,me)).join("")}${c.length?"":`<p class="tag pm-none">No coordinator yet</p>`}</div>`}).join(""):`<p class="tag">No coordinators or servants yet.</p>`}</div></section>`}
function reqHTML(u,a){
  const top=a.user.role==="priest"||a.user.role==="master",canGrade=top&&u.req!=="priest"&&u.req!=="master";
  return `<article class="card pm-req" data-u="${E(u.id)}"><div class="pm-rh"><span class="pm-av" aria-hidden="true">${E(init(u.name))}</span><div><b>${E(u.name)}</b><small>wants to join as <strong>${E(NAME[u.req]||u.req)}</strong>${u.grade?" · "+E(u.grade):""}</small></div></div>
   <small class="pm-ct">${E(u.church||"")}${u.phone?" · "+E(u.phone):""}${u.email?" · "+E(u.email):""}</small>
   ${canGrade?`<label class="field pm-g">Grade<select data-g><option value="">Choose…</option>${GR.map(g=>`<option ${g===u.grade?"selected":""}>${g}</option>`).join("")}</select></label>`:""}
   <div class="pm-ac"><button class="btn gold" data-ok>✅ Accept</button><button class="btn alt" data-no>Decline</button></div></article>`}
async function page(){
  const a=A();
  if(!a){go("login");return}
  if(!staff(a)){app.innerHTML=`${topbar("Permissions","🔑","For servants, coordinators and Abouna")}<div class="empty">This page is for approved servants, coordinators and Abouna.</div>`;return}
  app.innerHTML=`${topbar("Permissions","🔑","Your church team and join requests")}<div id="pm" class="sec"><div class="tag" style="text-align:center">Loading your church team…</div></div>`;
  let t,r=null;
  try{[t,r]=await Promise.all([call({action:"team_tree"}),approver(a)?call({action:"access_list"}):Promise.resolve(null)])}
  catch{document.getElementById("pm").innerHTML=`<div class="err">No internet connection. Try again.</div>`;return}
  const box=document.getElementById("pm");if(!box)return;
  if(!t||!t.ok){box.innerHTML=`<div class="err">${t&&t.error==="auth"?"Please log in again.":"Could not load the team."}</div>`;return}
  const pend=r&&r.ok?r.pending:[];pendN=pend.length;paintBadge();
  box.innerHTML=`${approver(a)?`<section class="pm-wait" aria-label="Waiting for you"><h2 class="sech"><span>⏳ Waiting for you (${pend.length})</span></h2>${pend.length?pend.map(u=>reqHTML(u,a)).join(""):`<div class="ds-empty"><div class="em">👍</div><b>Nobody is waiting</b>New requests show up here, and in your bell.</div>`}</section>`:`<p class="tag pm-info">You can see your church team here. Coordinators and Abouna accept new servants.</p>`}
   ${treeHTML(t,a.user.id)}
   ${approver(a)?`<button class="btn alt" data-go="access" style="margin-top:12px">⚙️ Change roles and grades</button>`:""}`;
  box.querySelectorAll(".pm-req").forEach(c=>{
    const u=pend.find(x=>x.id===c.dataset.u);
    c.querySelector("[data-ok]").onclick=async e=>{
      const gs=c.querySelector("[data-g]");let grade=u.grade||"";
      if(a.user.role==="coordinator")grade=a.user.grade;else if(gs){grade=gs.value;if(!grade&&u.req!=="priest"){toast("Choose a grade first");return}}
      e.target.disabled=true;
      try{const x=await call({action:"access_set",target:u.id,role:u.req,grade});if(x.ok){toast("✅ "+u.name+" is now "+(NAME[u.req]||"on the team"));page()}else{toast("Not allowed");e.target.disabled=false}}catch{toast("No internet connection");e.target.disabled=false}};
    c.querySelector("[data-no]").onclick=async e=>{
      if(!confirm("Decline "+u.name+"?"))return;e.target.disabled=true;
      try{const x=await call({action:"access_reject",target:u.id});if(x.ok){toast("Declined");page()}else{toast("Not allowed");e.target.disabled=false}}catch{toast("No internet connection");e.target.disabled=false}}})}
window.permRoute=function(h){if(h==="perm"){page();return true}return false};

const st=document.createElement("style");
st.textContent=`
.perm-btn{position:relative;display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:8px 16px;min-height:44px;border-radius:999px;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit;font-weight:800;font-size:.9rem}
.perm-badge{min-width:20px;height:20px;border-radius:999px;background:#ff5a5f;color:#fff;font-style:normal;font-weight:900;font-size:.72rem;display:inline-grid;place-items:center;padding:0 6px}.perm-badge[hidden]{display:none}
.pm-info{text-align:center;margin:0 0 8px}
.pm-req{display:flex;flex-direction:column;gap:8px;padding:14px;margin-bottom:10px;border-color:rgba(243,197,106,.55)}.pm-rh{display:flex;align-items:center;gap:12px}.pm-rh small{display:block;color:var(--muted);font-weight:700}.pm-ct{color:var(--muted);font-weight:700;word-break:break-word}.pm-ac{display:flex;gap:10px}.pm-ac .btn{flex:1}.pm-g select{width:100%}
.pm-av{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:1.05rem;color:#2b1d05;background:linear-gradient(135deg,#ffe29a,#f0a93e)}
.pm-tree{margin-top:14px;padding:14px;border-radius:24px;border:1px solid var(--glass-b);background:var(--glass)}
.pm-church{display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:1px solid var(--line)}.pm-church>span{font-size:1.8rem}.pm-church b{display:block;line-height:1.2}.pm-church small{color:var(--muted);font-weight:800}
.pm-level h3,.pm-gh{margin:12px 0 8px;font-size:.78rem;letter-spacing:.09em;text-transform:uppercase;color:var(--gold);font-weight:900}
.pm-row{display:flex;flex-direction:column;gap:8px}
.pm-node{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:16px;border:1px solid var(--line);background:var(--surface)}.pm-node .pm-av{width:36px;height:36px;font-size:.95rem}.pm-nm{display:flex;flex-direction:column;min-width:0}.pm-nm b{line-height:1.2;word-break:break-word}.pm-nm small{color:var(--muted);font-weight:800}
.pm-node.me{box-shadow:0 0 0 2px var(--gold)}
.r-priest .pm-av{background:linear-gradient(135deg,#ffe29a,#f0a93e)}.r-coordinator .pm-av{background:linear-gradient(135deg,#9be7d3,#35b79a)}.r-servant .pm-av{background:linear-gradient(135deg,#a9d4ff,#5b8fe0)}.r-priest{border-color:rgba(243,197,106,.6)}.r-coordinator{border-color:rgba(53,183,154,.55)}
.pm-trunk{width:2px;height:18px;margin:6px 0 0 21px;background:var(--gold)}
.pm-grades{margin-left:21px;padding-left:16px;border-left:2px solid var(--gold);display:flex;flex-direction:column;gap:12px}
.pm-branch{position:relative;display:flex;flex-direction:column;gap:8px}.pm-branch::before{content:"";position:absolute;left:-18px;top:14px;width:16px;height:2px;background:var(--gold)}.pm-branch .pm-gh{margin:0}.pm-none{margin:0}
`;
document.head.appendChild(st);
})();
