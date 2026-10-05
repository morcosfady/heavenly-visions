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
    f.innerHTML=`<label class="field">Username<input id="u" required autocapitalize="none" autocomplete="username"></label>
     <label class="field">Password<input id="p" type="password" required autocomplete="current-password"></label>
     <button class="btn gold" type="submit">Login</button><div id="am" class="tag" role="status"></div>`;
    f.onsubmit=async e=>{e.preventDefault();const m=$("#am");m.textContent="Checking…";
      try{const j=await api({action:"login",username:$("#u").value,password:$("#p").value});
        if(!j.ok){m.innerHTML=`<span class="err">Wrong username or password.</span>`;return}
        setAcct({token:j.token,user:j.user,avatar:AVATARS[0]});toast("Welcome "+j.user.name+" 👋");go("profile")}
      catch{m.innerHTML=`<span class="err">No internet connection.</span>`}};
    return}
  let role="student";
  const draw=()=>{f.innerHTML=`<div class="seg" role="group"><button type="button" data-r="student" aria-pressed="${role==="student"}">🎒 Student</button><button type="button" data-r="servant" aria-pressed="${role==="servant"}">🙏 Servant</button></div>
   <label class="field">Full name<input id="n" required maxlength="40" autocomplete="name"></label>
   <label class="field">${role==="student"?"Your grade":"Grade you serve"}<select id="g" required><option value="">Choose…</option>${SECTIONS.filter(s=>/^(prek|kg|g\d+)$/.test(s.id)).map(s=>`<option>${s.name}</option>`).join("")}</select></label>
   <label class="field">Church name<input id="c" required maxlength="50"></label>
   <label class="field">Phone ${role==="student"?"(optional)":""}<input id="ph" type="tel" ${role==="servant"?"required":""} maxlength="25" autocomplete="tel"></label>
   <label class="field">Email ${role==="student"?"(optional)":""}<input id="em" type="email" ${role==="servant"?"required":""} maxlength="60" autocomplete="email"></label>
   <label class="field">Choose a username<input id="u" required minlength="3" maxlength="20" autocapitalize="none" pattern="[A-Za-z0-9_.]+" autocomplete="username"></label>
   <label class="field">Password (6 or more)<input id="p" type="password" required minlength="6" autocomplete="new-password"></label>
   <button class="btn gold" type="submit">Create my profile</button><div id="am" class="tag" role="status"></div>`;
    f.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{role=b.dataset.r;const keep=["n","c","ph","em","u"].map(i=>$("#"+i).value);draw();["n","c","ph","em","u"].forEach((i,k)=>$("#"+i).value=keep[k])})};
  draw();
  f.onsubmit=async e=>{e.preventDefault();const m=$("#am");m.textContent="Creating…";
    try{const j=await api({action:"signup",role,name:$("#n").value,grade:$("#g").value,church:$("#c").value,phone:$("#ph").value,email:$("#em").value,username:$("#u").value,password:$("#p").value});
      if(!j.ok){m.innerHTML=`<span class="err">${j.error==="taken"?"That username is taken, try another.":j.error==="username"?"Username: 3 to 20 letters or numbers.":j.error==="password"?"Password needs 6 or more characters.":"Please fill everything in."}</span>`;return}
      setAcct({token:j.token,user:j.user,avatar:AVATARS[0]});confetti();toast("Profile created 🎉");go("profile")}
    catch{m.innerHTML=`<span class="err">No internet connection.</span>`}}}

/* ---------- profile ---------- */
async function profile(){
  let a=acct();if(!a){authPage("login");return}
  const draw=()=>{const u=a.user,lv=level(u.score);
    app.innerHTML=`${topbar("My Profile","👤",u.role==="servant"?"Servant":"Student")}
    <div class="pf-hero"><div class="pf-av" id="avBig">${a.avatar||AVATARS[0]}</div>
      <div class="pf-name">${esc(u.name)}</div>
      <div class="pf-sub">${u.role==="servant"?"🙏 Servant":"🎒 Student"} · ${esc(u.grade||"")} · ${esc(u.church)}</div>
      <div class="pf-score">⭐ ${u.score}<small>POINTS</small></div>
      <div class="pf-bar"><i style="width:${lv.pct}%"></i></div>
      <div class="pf-lv">${lv.ic} ${lv.name}${lv.next?` · ${lv.next} more to ${lv.nxName}`:" · top level!"}</div></div>
    <section class="card sec"><b>Pick your picture</b><div class="avs">${AVATARS.map(x=>`<button data-av="${x}" aria-pressed="${(a.avatar||AVATARS[0])===x}">${x}</button>`).join("")}</div></section>
    <section class="card sec"><b>How to get points</b><div class="tag">${u.role==="servant"?"✅ Check in at class +5<br>🛠️ Publish a game +20":"✅ Check in at class +10<br>🎮 Finish a game +10<br>🏆 Win a live class game +50"}</div></section>
    <section class="card sec"><b>Recent points</b><div id="lg">${u.log&&u.log.length?u.log.map(l=>`<div class="lgrow"><span>${KIND[l.k]||l.k}${l.n?" · "+esc(l.n):""}</span><span>+${l.p}</span></div>`).join(""):`<div class="tag">No points yet. Check in at class to start! ✋</div>`}</div></section>
    <section class="card sec"><b>🏅 Leaderboard</b><div id="lb" class="sec"><div class="tag">Loading…</div></div></section>
    <button class="btn alt" id="out">Log out</button>`;
    app.querySelectorAll("[data-av]").forEach(b=>b.onclick=()=>{a.avatar=b.dataset.av;setAcct(a);draw()});
    $("#out").onclick=()=>{if(confirm("Log out?")){setAcct(null);go("home")}};
    fetch(GU()+"?action=leaderboard").then(r=>r.json()).then(j=>{const el=$("#lb");if(!el)return;
      el.innerHTML=(j.rows||[]).slice(0,10).map((r,i)=>`<div class="lbrow ${r.n===u.name&&r.s===u.score?"me":""}"><span>${["🥇","🥈","🥉"][i]||i+1}</span><b>${esc(r.n)}</b><span class="tag">${r.r==="servant"?"🙏":"🎒"} ${esc(r.g||"")}</span><span class="pt">${r.s}</span></div>`).join("")||`<div class="tag">Nobody yet.</div>`}).catch(()=>{});
  };
  draw();
  try{const j=await api({action:"me",id:a.user.id,token:a.token});
    if(j.ok){a.user=j.user;setAcct(a);if(location.hash==="#profile")draw()}else if(j.error==="auth"){setAcct(null);toast("Please login again");authPage("login")}}catch{}}

window.profileRoute=function(h){
  if(h==="login"){authPage(acct()?"login":"login");return true}
  if(h==="signup"){authPage("signup");return true}
  if(h==="profile"){profile();return true}
  return false};
})();
