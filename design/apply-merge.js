/* Merges "My Treasures" into the Me tab: one page (avatar, shop, badges, earn) plus an Account tab. Already applied; kept to read the change. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 80)); s = s.replace(a, () => b) });
  fs.writeFileSync(file, s);
};

/* ---------- profile.js: the account part becomes a tab, the old page is only the login gate ---------- */
let p = fs.readFileSync('profile.js', 'utf8');
const a0 = p.indexOf('async function profile(){');
const a1 = p.indexOf('/* ---------- manage access ---------- */');
const acctFn = `/* The Account tab of the Me page (kids.js shows it). Name, role, church, recent points, log out, delete account. */
window.hvAccountTab=function(box){
  const a=acct();if(!a||!box)return;const u=a.user;
  box.innerHTML=\`\${u.req?\`<div class="note">⏳ Your request to be a <b>\${TIER[u.req][1]}</b> is waiting for approval. For now you can view the app as a guest. 🙏</div>\`:""}
    <div class="pf-name" style="text-align:left">\${esc(u.name)}</div>
    <div class="pf-sub" style="text-align:left">\${TIER[u.role][0]} \${TIER[u.role][1]}\${u.grade?" · "+esc(u.grade):""}<br>\${esc(u.church)}</div>
    \${u.role==="coordinator"||isTop(u.role)?\`<button class="btn gold" data-go="access" style="margin-top:10px">🔑 Manage access <span id="pendN"></span></button>\`:""}
    <b style="display:block;margin-top:14px">Recent points</b><div id="lg">\${u.log&&u.log.length?u.log.map(l=>\`<div class="lgrow"><span>\${KIND[l.k]||l.k}\${l.n?" · "+esc(l.n):""}</span><span>+\${l.p}</span></div>\`).join(""):\`<div class="tag">No points yet. Check in at class to start! ✋</div>\`}</div>
    <button class="btn alt" id="out" style="margin-top:14px">Log out</button>
    <button class="btn alt" id="delacct" style="opacity:.8">🗑 Delete my account</button><a class="tag privlink" href="privacy.html">Privacy policy</a>\`;
  box.querySelector("#out").onclick=()=>{if(confirm("Log out?")){setAcct(null);go("home")}};
  box.querySelector("#delacct").onclick=async()=>{if(u.role==="master"){toast("The master account cannot be deleted here");return}
    if(!confirm("Delete your account and all your stars, avatar and attendance? This cannot be undone."))return;const pw=prompt("Type your password to confirm:");if(!pw)return;
    try{const j=await api({action:"acct_delete",id:u.id,token:a.token,password:pw});if(j.ok){setAcct(null);try{["hv_avmap","hv_notifs","hv_queue","hv_verse","hv_prayed","hv_gallery"].forEach(k=>localStorage.removeItem(k))}catch{}toast("Your account was deleted");go("home")}else toast(j.error==="login"?"Wrong password":"Could not delete. Try again.")}catch{toast("No internet connection")}};
  if(u.role==="coordinator"||isTop(u.role))api({action:"access_list",id:u.id,token:a.token}).then(j=>{const e=box.querySelector("#pendN");if(e&&j.ok&&j.pending.length)e.textContent="("+j.pending.length+" waiting)"}).catch(()=>{});
};

`;
/* keep the original delete error text exactly as it was */
const old = p.slice(a0, a1);
const m = old.match(/toast\(j\.error==="login"\?"Wrong password":"[^"]*"\)\}catch\{toast\("[^"]*"\)\}\};/);
let fixed = acctFn;
if (m) fixed = acctFn.replace(/toast\(j\.error==="login"\?"Wrong password":"Could not delete\. Try again\."\)\}catch\{toast\("No internet connection"\)\}\};/, m[0]);
p = p.slice(0, a0) + fixed + p.slice(a1);
p = p.replace('if(h==="profile"){profile();return true}', 'if(h==="profile"){if(!acct()){authPage("login");return true}return false}/* logged in: kids.js shows the Me page */');
p = p.replace('const MASTER_AV', 'const MASTER_AV');
fs.writeFileSync('profile.js', p);

/* ---------- kids.js: the Me page ---------- */
edit('kids.js', [
  ['function kidsPage(){\n  const a=A();if(!a){loginNeeded();return}',
   'const bodyOf=u=>S.tab==="avatar"?avatarTab(u):S.tab==="shop"?shopTab(u):S.tab==="badges"?badgesTab(u):S.tab==="account"?`<div id="kcAcct"></div>`:earnTab();\nconst drawAcct=()=>{if(S.tab==="account"&&window.hvAccountTab)hvAccountTab(document.getElementById("kcAcct"))};\nfunction kidsPage(){\n  const a=A();if(!a){loginNeeded();return}'],
  ['app.innerHTML=`${topbar("My Treasures","🌟","Your stars and avatar")}<div class="kc-wrap">${hero(u)}<div class="kc-main">',
   'app.innerHTML=`${topbar("Me","🌟","Your stars, avatar and account")}<div class="kc-wrap">${hero(u)}<div class="kc-main">'],
  ['["earn","⭐ Earn"]]', '["earn","⭐ Earn"],["account","⚙️ Account"]]'],
  ['<section class="card sec" id="kcBody">${S.tab==="avatar"?avatarTab(u):S.tab==="shop"?shopTab(u):S.tab==="badges"?badgesTab(u):earnTab()}</section></div></div>`;',
   '<section class="card sec" id="kcBody">${bodyOf(u)}</section></div></div>`;'],
  ['  wire(u)}\n\nfunction refresh()', '  wire(u);drawAcct()}\n\nfunction refresh()'],
  ['body.innerHTML=S.tab==="avatar"?avatarTab(u):S.tab==="shop"?shopTab(u):S.tab==="badges"?badgesTab(u):earnTab();wireBody(u)}', 'body.innerHTML=bodyOf(u);wireBody(u);drawAcct()}'],
  ['window.kidsRoute=function(h){if(h==="kids"){S.cur=null;kidsPage();return true}return false};', 'window.kidsRoute=function(h){if(h==="kids"||h==="profile"){S.cur=null;kidsPage();return true}return false};'],
  ['function loginNeeded(){app.innerHTML=`${topbar("My Treasures","🌟","Your stars and avatar")}', 'function loginNeeded(){app.innerHTML=`${topbar("Me","🌟","Your stars, avatar and account")}']
]);

/* ---------- shell.js: My Treasures leaves the "More to explore" doors ---------- */
edit('shell.js', [['  ["kids","star","My Treasures","Stars, avatar, shop","--c-kids"],\n', '']]);

/* ---------- index.html versions ---------- */
let h = fs.readFileSync('index.html', 'utf8');
h = h.replace('kids.js?v=4', 'kids.js?v=5').replace('profile.js?v=13', 'profile.js?v=14').replace('shell.js?v=5', 'shell.js?v=6');
fs.writeFileSync('index.html', h);
console.log('done');
