/* Heavenly Visions: accounts, profile, scores and leaderboard.
   Accounts live in the Google Apps Script backend (GAMES_URL). The phone keeps the login token (localStorage hv_acct). */
(function(){
const st=document.createElement("style");
st.textContent=`
.loginbtn{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:14px;display:flex;align-items:center;gap:6px;border:0;cursor:pointer;padding:8px 14px;border-radius:999px;font-weight:800;font-size:.85rem;color:#2b1d05;background:linear-gradient(135deg,#f6d27a,#e3b45c);box-shadow:0 4px 12px rgba(227,180,92,.4)}
.loginbtn .sc{background:rgba(43,29,5,.15);padding:2px 8px;border-radius:999px}
.hubhead{position:relative}
.seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.seg button{padding:12px;border-radius:14px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:800;font-size:1rem}
.seg button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft)}
.pf-hero{text-align:center;padding:22px 16px;border-radius:24px;color:#fff;background:linear-gradient(145deg,#2f8fc0,#8e6bd1);box-shadow:var(--shadow)}
.pf-av{font-size:3.4rem;width:88px;height:88px;line-height:88px;margin:0 auto 6px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.6)}
.pf-name{font-family:var(--display);font-size:1.4rem;font-weight:800}
.pf-sub{opacity:.9;font-weight:700;font-size:.9rem;margin-top:2px}
.pf-score{margin-top:12px;font-size:2.6rem;font-weight:900;line-height:1}
.pf-score small{display:block;font-size:.8rem;font-weight:800;opacity:.85;letter-spacing:.08em}
.pf-bar{height:10px;border-radius:99px;background:rgba(255,255,255,.25);margin:12px 6px 4px;overflow:hidden}
.pf-bar i{display:block;height:100%;border-radius:99px;background:#f6d27a}
.pf-lv{font-weight:800}
.avs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.avs button{font-size:1.6rem;width:46px;height:46px;border-radius:50%;border:2px solid var(--line);background:var(--surface)}
.avs button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft)}
.lbrow{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line)}
.lbrow.me{border-color:var(--gold);background:var(--gold-soft)}
.lbrow b{flex:1}.lbrow .pt{font-weight:900;color:var(--gold)}
.lgrow{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-weight:700}
.lgrow:last-child{border:0}
`;
document.head.appendChild(st);

const GU=()=>window.GAMES_URL||"";
const AVATARS=["😇","🦁","🐑","🕊️","⭐","👑","🌈","🔥","🦋","🐟","📖","✝️"];
const LEVELS=[[0,"Seedling","🌱"],[50,"Helper","🕊️"],[150,"Disciple","✝️"],[300,"Light Bearer","🕯️"],[600,"Champion","👑"]];
const TIER={student:["🎒","Student"],servant:["🙏","Servant"],coordinator:["🧭","Coordinator"],priest:["⛪","Priest"],master:["👑","Master"]};
const isStaff=r=>r!=="student";
const isTop=r=>r==="priest"||r==="master";
const SIGNUP_ROLES=["student","servant","coordinator","priest"];
const KIND={attend:"Checked in",selfplay:"Played a game",publish:"Published a game",livewin:"Won a live game"};
const acct=()=>{try{return JSON.parse(localStorage.getItem("hv_acct")||"null")}catch{return null}};
const setAcct=a=>{try{a?localStorage.setItem("hv_acct",JSON.stringify(a)):localStorage.removeItem("hv_acct")}catch{}};
async function api(body){const r=await fetch(GU(),{method:"POST",body:JSON.stringify(body)});return r.json()}
function level(score){let i=0;LEVELS.forEach((l,k)=>{if(score>=l[0])i=k});const cur=LEVELS[i],nx=LEVELS[i+1];
  return {name:cur[1],ic:cur[2],pct:nx?Math.round((score-cur[0])/(nx[0]-cur[0])*100):100,next:nx?nx[0]-score:0,nxName:nx?nx[1]:""}}

/* login button on the home page (top right) */
window.acctChip=function(){const head=document.querySelector(".hubhead");if(!head||!GU())return;
  const a=acct();const b=document.createElement("button");b.className="loginbtn";
  b.dataset.go=a?"profile":"login";
  b.innerHTML=a?`<span>${a.avatar||"😇"}</span><span class="sc">⭐ ${a.user.score}</span>`:`👤 Login`;
  head.appendChild(b)};

/* give points (called from the app) */
window.hvAward=async function(kind,ref,label){const a=acct();if(!a||!GU())return;
  try{const j=await api({action:"award",id:a.user.id,token:a.token,kind,ref,label});
    if(j.ok){a.user=j.user;setAcct(a);if(j.added){toast("+"+j.added+" points ⭐");if(window.confetti)confetti()}}
    else if(j.error==="auth")setAcct(null)}catch{}};

/* ---------- login / create profile ---------- */
function authPage(mode){
  app.innerHTML=`${topbar("Profile","👤",mode==="login"?"Welcome back":"Make your profile")}
  <div class="seg" role="group"><button data-m="login" aria-pressed="${mode==="login"}">Login</button><button data-m="signup" aria-pressed="${mode==="signup"}">Create profile</button></div>
  <form class="card sec" id="af" autocomplete="on"></form>`;
  app.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>authPage(b.dataset.m));
  const f=$("#af");
  if(mode==="login"){
    f.innerHTML=`<label class="field">Username or email<input id="u" required autocapitalize="none" autocomplete="username"></label>
     <label class="field">Password<input id="p" type="password" required autocomplete="current-password"></label>
     <button class="btn gold" type="submit">Login</button><div id="am" class="tag" role="status"></div>`;
    f.onsubmit=async e=>{e.preventDefault();const m=$("#am");m.textContent="Checking…";
      try{const j=await api({action:"login",username:$("#u").value,password:$("#p").value});
        if(!j.ok){m.innerHTML=`<span class="err">Wrong username or password.</span>`;return}
        setAcct({token:j.token,user:j.user,avatar:AVATARS[0]});toast("Welcome "+j.user.name+" 👋");go("profile")}
      catch{m.innerHTML=`<span class="err">No internet connection.</span>`}};
    return}
  let role="student";
  const draw=()=>{f.innerHTML=`<div class="seg" role="group">${SIGNUP_ROLES.concat(role==="master"?["master"]:[]).map(r=>`<button type="button" data-r="${r}" aria-pressed="${role===r}">${TIER[r][0]} ${TIER[r][1]}</button>`).join("")}</div>
   ${role==="master"?`<div class="note">👑 Master setup: needs the setup code and the master email.</div>`:role!=="student"?`<div class="note">⏳ ${role==="servant"?"A coordinator or priest":"A priest"} must approve you. For now you can view the app as a guest. 🙏</div>`:""}
   <label class="field">Full name<input id="n" required maxlength="40" autocomplete="name"></label>
   <label class="field">${role==="student"?"Your grade":"Grade you serve or lead"}<select id="g" required><option value="">Choose…</option>${SECTIONS.filter(s=>/^(prek|kg|g\d+)$/.test(s.id)).map(s=>`<option>${s.name}</option>`).join("")}</select></label>
   <label class="field">Church name<input id="c" required maxlength="50"></label>
   <label class="field">Phone ${role==="student"?"(optional)":""}<input id="ph" type="tel" ${role!=="student"?"required":""} maxlength="25" autocomplete="tel"></label>
   <label class="field">Email ${role==="student"?"(optional)":""}<input id="em" type="email" ${role!=="student"?"required":""} maxlength="60" autocomplete="email"></label>
   ${role==="priest"||role==="master"?`<label class="field">Setup code ${role==="priest"?"(only for the very first priest)":""}<input id="sc" autocomplete="off"></label>`:""}
   <label class="field">Choose a username<input id="u" required minlength="3" maxlength="20" autocapitalize="none" pattern="[A-Za-z0-9_.]+" autocomplete="username"></label>
   <label class="field">Password (6 or more)<input id="p" type="password" required minlength="6" autocomplete="new-password"></label>
   <button class="btn gold" type="submit">Create my profile</button><div id="am" class="tag" role="status"></div>
   <button type="button" class="back" id="mst" style="margin:6px auto 0">${role==="master"?"← Back":"👑 Master setup"}</button>`;
    $("#mst").onclick=()=>{const keep=["n","c","ph","em","u","g"].map(i=>$("#"+i).value);role=role==="master"?"student":"master";draw();["n","c","ph","em","u","g"].forEach((i,k)=>$("#"+i).value=keep[k])};
    f.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{role=b.dataset.r;const keep=["n","c","ph","em","u","g"].map(i=>$("#"+i).value);draw();["n","c","ph","em","u","g"].forEach((i,k)=>$("#"+i).value=keep[k])})};
  draw();
  f.onsubmit=async e=>{e.preventDefault();const m=$("#am");m.textContent="Creating…";
    try{const j=await api({action:"signup",role,name:$("#n").value,grade:$("#g").value,church:$("#c").value,phone:$("#ph").value,email:$("#em").value,username:$("#u").value,password:$("#p").value,setup:$("#sc")?$("#sc").value:""});
      if(!j.ok){m.innerHTML=`<span class="err">${j.error==="master"?"Master setup failed. Check the code and email, or a Master already exists.":j.error==="taken"?"That username is taken, try another.":j.error==="username"?"Username: 3 to 20 letters or numbers.":j.error==="password"?"Password needs 6 or more characters.":"Please fill everything in."}</span>`;return}
      setAcct({token:j.token,user:j.user,avatar:AVATARS[0]});confetti();toast(j.user.req?"Profile created. Waiting for approval ⏳":"Profile created 🎉");go("profile")}
    catch{m.innerHTML=`<span class="err">No internet connection.</span>`}}}

/* ---------- profile ---------- */
async function profile(){
  let a=acct();if(!a){authPage("login");return}
  const draw=()=>{const u=a.user,lv=level(u.score);
    app.innerHTML=`${topbar("My Profile","👤",TIER[u.role][1])}
    ${u.req?`<div class="note">⏳ Your request to be a <b>${TIER[u.req][1]}</b> is waiting for approval. For now you can view the app as a guest. 🙏</div>`:""}
    ${u.role==="coordinator"||isTop(u.role)?`<button class="btn gold" data-go="access">🔑 Manage access <span id="pendN"></span></button>`:""}
    <div class="pf-hero"><div class="pf-av" id="avBig">${a.avatar||AVATARS[0]}</div>
      <div class="pf-name">${esc(u.name)}</div>
      <div class="pf-sub">${TIER[u.role][0]} ${TIER[u.role][1]} · ${esc(u.grade||"")} · ${esc(u.church)}</div>
      <div class="pf-score">⭐ ${u.score}<small>POINTS</small></div>
      <div class="pf-bar"><i style="width:${lv.pct}%"></i></div>
      <div class="pf-lv">${lv.ic} ${lv.name}${lv.next?` · ${lv.next} more to ${lv.nxName}`:" · top level!"}</div></div>
    <section class="card sec"><b>Pick your picture</b><div class="avs">${AVATARS.map(x=>`<button data-av="${x}" aria-pressed="${(a.avatar||AVATARS[0])===x}">${x}</button>`).join("")}</div></section>
    <section class="card sec"><b>How to get points</b><div class="tag">${isStaff(u.role)?"✅ Check in at class +5<br>🛠️ Publish a game +20":"✅ Check in at class +10<br>🎮 Finish a game +10<br>🏆 Win a live class game +50"}</div></section>
    <section class="card sec"><b>Recent points</b><div id="lg">${u.log&&u.log.length?u.log.map(l=>`<div class="lgrow"><span>${KIND[l.k]||l.k}${l.n?" · "+esc(l.n):""}</span><span>+${l.p}</span></div>`).join(""):`<div class="tag">No points yet. Check in at class to start! ✋</div>`}</div></section>
    <section class="card sec"><b>🏅 Leaderboard</b><div id="lb" class="sec"><div class="tag">Loading…</div></div></section>
    <button class="btn alt" id="out">Log out</button>`;
    app.querySelectorAll("[data-av]").forEach(b=>b.onclick=()=>{a.avatar=b.dataset.av;setAcct(a);draw()});
    $("#out").onclick=()=>{if(confirm("Log out?")){setAcct(null);go("home")}};
    if(u.role==="coordinator"||isTop(u.role))api({action:"access_list",id:u.id,token:a.token}).then(j=>{const e=$("#pendN");if(e&&j.ok&&j.pending.length)e.textContent="("+j.pending.length+" waiting)"}).catch(()=>{});
    fetch(GU()+"?action=leaderboard").then(r=>r.json()).then(j=>{const el=$("#lb");if(!el)return;
      el.innerHTML=(j.rows||[]).slice(0,10).map((r,i)=>`<div class="lbrow ${r.n===u.name&&r.s===u.score?"me":""}"><span>${["🥇","🥈","🥉"][i]||i+1}</span><b>${esc(r.n)}</b><span class="tag">${(TIER[r.r]||TIER.student)[0]} ${esc(r.g||"")}</span><span class="pt">${r.s}</span></div>`).join("")||`<div class="tag">Nobody yet.</div>`}).catch(()=>{});
  };
  draw();
  try{const j=await api({action:"me",id:a.user.id,token:a.token});
    if(j.ok){a.user=j.user;setAcct(a);if(location.hash==="#profile")draw()}else if(j.error==="auth"){setAcct(null);toast("Please login again");authPage("login")}}catch{}}

/* ---------- manage access ---------- */
const GRADE_NAMES=()=>SECTIONS.filter(s=>/^(prek|kg|g\d+)$/.test(s.id)).map(s=>s.name);
async function accessPage(){
  const a=acct();if(!a||!(a.user.role==="coordinator"||isTop(a.user.role))){go("profile");return}
  const priest=isTop(a.user.role),master=a.user.role==="master";
  app.innerHTML=`${topbar("Manage Access","🔑",TIER[a.user.role][1],"profile")}<div id="ac" class="sec"><div class="tag">Loading…</div></div>`;
  let j;try{j=await api({action:"access_list",id:a.user.id,token:a.token})}catch{$("#ac").innerHTML=`<div class="err">No internet connection.</div>`;return}
  if(!j.ok){$("#ac").innerHTML=`<div class="err">Not allowed.</div>`;return}
  const gsel=(id,cur)=>`<select data-g="${id}">${GRADE_NAMES().map(g=>`<option ${g===cur?"selected":""}>${g}</option>`).join("")}</select>`;
  const who=u=>`<b>${esc(u.name)}</b><div class="tag">${esc(u.church)} · ${esc(u.grade||"no grade")}<br>📞 ${esc(u.phone||"-")} · ✉️ ${esc(u.email||"-")}</div>`;
  const pend=u=>`<div class="card sec" data-u="${u.id}">${who(u)}<div class="tag">Wants to be: <b>${TIER[u.req][0]} ${TIER[u.req][1]}</b></div>
    ${priest?`<label class="field">Grade${gsel(u.id,u.grade)}</label>`:""}
    <div class="two"><button class="btn gold" data-do="approve" data-id="${u.id}" data-req="${u.req}">✅ Approve</button><button class="btn alt" data-do="reject" data-id="${u.id}">✖ Reject</button></div></div>`;
  const team=u=>`<div class="card sec" data-u="${u.id}">${who(u)}<div class="tag">${TIER[u.role][0]} ${TIER[u.role][1]}</div>
    ${priest?`<div class="two"><label class="field">Role<select data-r="${u.id}">${["servant","coordinator","priest"].concat(master?["master"]:[]).concat(["student"]).map(r=>`<option value="${r}" ${r===u.role?"selected":""}>${TIER[r][1]}</option>`).join("")}</select></label><label class="field">Grade${gsel(u.id,u.grade)}</label></div>
    <button class="btn gold" data-do="save" data-id="${u.id}">💾 Save</button>`:`<button class="btn alt" data-do="revoke" data-id="${u.id}">Remove access</button>`}</div>`;
  $("#ac").innerHTML=`<h2 style="margin:6px 0">⏳ Waiting (${j.pending.length})</h2>${j.pending.map(pend).join("")||`<div class="empty">Nobody is waiting 👍</div>`}
   <h2 style="margin:14px 0 6px">👥 Team (${j.team.length})</h2>${j.team.map(team).join("")||`<div class="empty">No team yet.</div>`}`;
  app.querySelectorAll("[data-do]").forEach(b=>b.onclick=async()=>{const id=b.dataset.id,box=app.querySelector(`[data-u="${id}"]`),gs=box.querySelector("[data-g]"),rs=box.querySelector("[data-r]");
    const body={id:a.user.id,token:a.token,target:id};
    if(b.dataset.do==="reject")body.action="access_reject";
    else{body.action="access_set";if(gs)body.grade=gs.value;
      if(b.dataset.do==="approve")body.role=b.dataset.req;
      if(b.dataset.do==="revoke"){body.role="student";if(!confirm("Remove access?"))return}
      if(b.dataset.do==="save"&&rs)body.role=rs.value}
    b.disabled=true;try{const r=await api(body);if(r.ok){toast("Done ✅");accessPage()}else{toast("Not allowed");b.disabled=false}}catch{toast("No internet connection");b.disabled=false}})}

/* lock for servant-only pages: returns true when it showed the lock screen */
window.hvLock=function(){
  if(!GU())return false;const a=acct();
  if(a&&isStaff(a.user.role))return false;
  app.innerHTML=`${topbar("Servants Workshop","🛠️","Servants only")}<div class="card sec" style="text-align:center">
   <div style="font-size:3rem">🔒</div>
   ${!a?`<b>Login to continue</b><p class="tag">Servants, coordinators and priests need an approved profile.</p><button class="btn gold" data-go="login">👤 Login or create profile</button>`
   :a.user.req?`<b>Waiting for approval ⏳</b><p class="tag">Your request to be a ${TIER[a.user.req][1]} has not been approved yet.</p>`
   :`<b>This is for servants</b><p class="tag">Ask your coordinator or priest for access.</p>`}</div>`;
  return true};
window.hvAcct=acct;

window.profileRoute=function(h){
  if(h==="access"){accessPage();return true}
  if(h==="login"){authPage(acct()?"login":"login");return true}
  if(h==="signup"){authPage("signup");return true}
  if(h==="profile"){profile();return true}
  return false};
})();
