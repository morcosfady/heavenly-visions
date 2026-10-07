/* Heavenly Visions: design v2 ("Sky Garden"). Icon system, bottom tab bar, theme switch, Home polish.
   hvIcon(name,size,alt): clay 3D icons (doors, tiles) and rounded line icons (buttons, tabs), all inline SVG, no emoji.
   To add an icon: add a line to CLAY or LINE below, then use hvIcon("name",48).
   Everything here is optional: if this file fails the app still works. */
(function(){
const root=document.documentElement;

/* ---------- theme: light by default, the sun/moon button in the top bar switches ---------- */
const getTheme=()=>{try{return localStorage.getItem("hv_theme")||"light"}catch{return "light"}};
const setTheme=t=>{try{localStorage.setItem("hv_theme",t)}catch{}root.dataset.theme=t};
root.dataset.theme=getTheme();

/* ---------- shared gradients (defined once, used by every clay icon) ---------- */
const defs=document.createElement("div");
defs.setAttribute("aria-hidden","true");defs.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
defs.innerHTML=`<svg width="0" height="0"><defs>
<linearGradient id="hvB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ea"/><stop offset="1" stop-color="#2f6fb8"/></linearGradient>
<linearGradient id="hvP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cf0"/><stop offset="1" stop-color="#6a47c2"/></linearGradient>
<linearGradient id="hvY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#d79a24"/></linearGradient>
<linearGradient id="hvS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3c2"/><stop offset="1" stop-color="#f0a86a"/></linearGradient>
<linearGradient id="hvN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b94e8"/><stop offset="1" stop-color="#3c3f9e"/></linearGradient>
<radialGradient id="hvH" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="hvD" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#10163a" flood-opacity=".34"/></filter>
</defs></svg>`;
document.body.prepend(defs);

/* ---------- clay icons (viewBox 0 0 100 100) ---------- */
const CLAY={
  clap:`<rect x="12" y="38" width="76" height="46" rx="11" fill="url(#hvB)"/><rect x="12" y="38" width="76" height="46" rx="11" fill="url(#hvH)"/><g transform="rotate(-11 50 33)"><rect x="10" y="18" width="80" height="19" rx="7" fill="#fff"/><g fill="#2f6fb8"><rect x="20" y="18" width="10" height="19" transform="skewX(-25)"/><rect x="40" y="18" width="10" height="19" transform="skewX(-25)"/><rect x="60" y="18" width="10" height="19" transform="skewX(-25)"/></g></g><circle cx="50" cy="62" r="11" fill="#fff" opacity=".92"/><path d="M46 56 L58 62 L46 68Z" fill="#2f6fb8"/>`,
  hand:`<g fill="url(#hvS)"><rect x="27" y="22" width="11" height="44" rx="5.5"/><rect x="39" y="12" width="11" height="52" rx="5.5"/><rect x="51" y="16" width="11" height="48" rx="5.5"/><rect x="63" y="26" width="11" height="40" rx="5.5"/><rect x="22" y="50" width="56" height="38" rx="19"/><rect x="10" y="48" width="11" height="32" rx="5.5" transform="rotate(-38 15 64)"/></g><rect x="22" y="50" width="56" height="38" rx="19" fill="url(#hvH)"/>`,
  game:`<rect x="8" y="30" width="84" height="46" rx="23" fill="url(#hvP)"/><rect x="8" y="30" width="84" height="46" rx="23" fill="url(#hvH)"/><rect x="24" y="47" width="22" height="8" rx="4" fill="#fff"/><rect x="31" y="40" width="8" height="22" rx="4" fill="#fff"/><circle cx="66" cy="48" r="6" fill="#ffd36b"/><circle cx="77" cy="57" r="6" fill="#ff8aa6"/>`,
  trophy:`<path d="M26 18h48v24a24 24 0 0 1-48 0z" fill="url(#hvY)"/><path d="M26 24H14v8a14 14 0 0 0 14 14M74 24h12v8a14 14 0 0 1-14 14" fill="none" stroke="#d79a24" stroke-width="7" stroke-linecap="round"/><rect x="43" y="62" width="14" height="14" fill="#d79a24"/><rect x="30" y="76" width="40" height="12" rx="6" fill="url(#hvP)"/><path d="M50 26l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#fff" opacity=".88"/>`,
  book:`<path d="M8 30Q30 20 50 30V82Q30 72 8 82Z" fill="#fff"/><path d="M92 30Q70 20 50 30V82Q70 72 92 82Z" fill="#f3ead8"/><path d="M50 30V82" stroke="#d79a24" stroke-width="3"/><path d="M16 42Q30 37 42 42M16 54Q30 49 42 54M58 42Q70 37 84 42M58 54Q70 49 84 54" stroke="#9db4d8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 12h12v22H44z" fill="#e0622f"/><path d="M8 82Q30 72 50 82Q70 72 92 82V88Q70 78 50 88Q30 78 8 88Z" fill="url(#hvB)"/>`,
  star:`<path d="M50 8l12.5 26.5 29 3.6-21.4 20 5.6 28.7L50 72.5 24.3 86.8l5.6-28.7L8.5 38.1l29-3.6z" fill="url(#hvY)"/><path d="M50 8l12.5 26.5 29 3.6-21.4 20 5.6 28.7L50 72.5 24.3 86.8l5.6-28.7L8.5 38.1l29-3.6z" fill="url(#hvH)"/>`,
  moon:`<path d="M62 10a40 40 0 1 0 28 62A34 34 0 0 1 62 10z" fill="url(#hvN)"/><path d="M62 10a40 40 0 1 0 28 62A34 34 0 0 1 62 10z" fill="url(#hvH)"/><path d="M72 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffe29a"/>`,
  palette:`<path d="M50 10C26 10 8 28 8 50s18 40 40 40c8 0 10-6 6-11-4-6 0-12 8-12h14c10 0 16-6 16-16C92 28 74 10 50 10z" fill="#f3ead8"/><path d="M50 10C26 10 8 28 8 50s18 40 40 40c8 0 10-6 6-11-4-6 0-12 8-12h14c10 0 16-6 16-16C92 28 74 10 50 10z" fill="url(#hvH)"/><circle cx="30" cy="42" r="8" fill="#e8584f"/><circle cx="48" cy="28" r="8" fill="#ffd36b"/><circle cx="68" cy="34" r="8" fill="#3fae6a"/><circle cx="76" cy="54" r="8" fill="#4a8fd8"/>`
};
/* ---------- line icons (viewBox 0 0 24 24, stroke 1.8) ---------- */
const LINE={
  home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  learn:'<path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0zM21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z"/>',
  play:'<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="16" cy="12" r=".6"/><circle cx="18" cy="14" r=".6"/>',
  lumi:'<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  me:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
  bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/>',
  calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  tools:'<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.5 2.5-2.2-.6-.6-2.2z"/>',
  login:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10"/>',
  play2:'<path d="M8 5l11 7-11 7z"/>',
  starline:'<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 17l-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/>'
};
window.hvIcon=function(name,size,alt){
  size=size||24;
  if(CLAY[name])return `<svg class="hvi clay" viewBox="0 0 100 100" width="${size}" height="${size}" filter="url(#hvD)" ${alt?`role="img" aria-label="${alt}"`:'aria-hidden="true"'}>${CLAY[name]}</svg>`;
  if(LINE[name])return `<svg class="hvi line" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${alt?`role="img" aria-label="${alt}"`:'aria-hidden="true"'}>${LINE[name]}</svg>`;
  return "";
};
window.hvThemeButton=function(){const dark=root.dataset.theme==="dark";return `<button class="sb-theme" id="sbTheme" aria-label="${dark?"Switch to light":"Switch to dark"}">${hvIcon(dark?"sun":"moon",22)}</button>`};

/* ---------- bottom tab bar ---------- */
const TABS=[["home","home","Home"],["learn","media","Learn"],["play","games","Play"],["lumi","lumi","Lumi"],["me","profile","Me"]];
const GROUP={ // route prefix -> tab
  home:"home",media:"learn",m:"learn",bible:"learn",b:"learn",verse:"learn",vp:"learn",calendar:"learn",
  games:"play",quizzes:"play",coloring:"play",arena:"play",bedtime:"play",
  lumi:"lumi",profile:"me",kids:"me",attendance:"me",attsheet:"me",login:"me",servants:"me",events:"me"};
const SHOW=new Set(["home","media","m","games","quizzes","bible","verse","calendar","events","kids","profile","attendance","bedtime","coloring","servants","login","arena"]);
const route=()=>{const h=decodeURIComponent(location.hash.slice(1)||"home");return {h,k:h.split("-")[0]}};
let bar=null,ind=null;
function hasLumi(){return !!(window.hvAiUrl&&hvAiUrl())}
function buildBar(){
  bar=document.createElement("nav");bar.id="tabbar";bar.setAttribute("aria-label","Main");
  const tabs=TABS.filter(t=>t[0]!=="lumi"||hasLumi());
  bar.style.setProperty("--n",tabs.length);
  bar.innerHTML=`<i class="tb-ind" aria-hidden="true"></i>`+tabs.map(t=>`<a class="tb" href="#${t[1]}" data-tab="${t[0]}">${hvIcon(t[0],26)}<span>${t[2]}</span></a>`).join("");
  document.body.appendChild(bar);ind=bar.querySelector(".tb-ind");
  bar.addEventListener("click",()=>{try{navigator.vibrate&&navigator.vibrate(10)}catch{}});
}
function updateBar(){
  if(!bar)return;
  const {h,k}=route();
  const show=SHOW.has(k)&&!(k==="b"&&/^b-.+-\d+$/.test(h));
  bar.hidden=!show;document.body.classList.toggle("hasTabs",show);
  const cur=GROUP[k]||"";
  const tabs=[...bar.querySelectorAll(".tb")];
  tabs.forEach((t,i)=>{const on=t.dataset.tab===cur;t.classList.toggle("on",on);if(on){t.setAttribute("aria-current","page");ind.style.transform=`translateX(${i*100}%)`;ind.style.opacity=1}else t.removeAttribute("aria-current")});
  if(!tabs.some(t=>t.classList.contains("on")))ind.style.opacity=0;
}
function init(){buildBar();updateBar();addEventListener("hashchange",updateBar);
  document.addEventListener("click",e=>{if(e.target.closest("#sbTheme")){setTheme(root.dataset.theme==="dark"?"light":"dark");const b=document.getElementById("sbTheme");if(b){const dark=root.dataset.theme==="dark";b.innerHTML=hvIcon(dark?"sun":"moon",22);b.setAttribute("aria-label",dark?"Switch to light":"Switch to dark")}}});
  /* the Lumi tab appears once the helper link is known (aihelper.js loads after this file) */
  setTimeout(()=>{if(bar&&hasLumi()&&!bar.querySelector('[data-tab="lumi"]')){bar.remove();buildBar();updateBar()}},0)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
.hvi{display:block;flex:none}
#tabbar{position:fixed;left:0;right:0;bottom:0;z-index:900;display:grid;grid-template-columns:repeat(var(--n,5),1fr);padding:8px 8px calc(10px + env(safe-area-inset-bottom));background:var(--glass);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%);border-top:1px solid var(--glass-b);box-shadow:0 -10px 30px -18px rgba(0,0,0,.4)}
#tabbar[hidden]{display:none}
#tabbar .tb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:52px;color:var(--mute,#7a7494);text-decoration:none;font-weight:800;font-size:.74rem;position:relative;-webkit-tap-highlight-color:transparent;transition:color .2s}
#tabbar .tb svg{transition:transform .2s cubic-bezier(.34,1.56,.64,1),fill .2s}
#tabbar .tb.on{color:var(--gold-d,#b9822a)}
:root[data-theme="dark"] #tabbar .tb.on{color:#e3b45c}
#tabbar .tb.on svg{transform:translateY(-2px) scale(1.08);fill:rgba(227,180,92,.28)}
#tabbar .tb:active svg{transform:scale(.9)}
#tabbar .tb-ind{position:absolute;left:8px;top:0;width:calc((100% - 16px) / var(--n,5));height:4px;display:flex;justify-content:center;pointer-events:none;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s}
#tabbar .tb-ind::after{content:"";width:28px;height:4px;border-radius:0 0 4px 4px;background:#e3b45c;box-shadow:0 0 10px rgba(227,180,92,.7)}
body.hasTabs #app{padding-bottom:calc(104px + env(safe-area-inset-bottom))!important}
@media (min-width:900px){
  #tabbar{left:0;right:auto;top:0;bottom:0;width:92px;grid-template-columns:1fr;align-content:center;gap:6px;padding:16px 8px;border-top:0;border-right:1px solid var(--glass-b);box-shadow:10px 0 30px -18px rgba(0,0,0,.4)}
  #tabbar .tb-ind{display:none}
  #tabbar .tb.on{background:rgba(227,180,92,.2);border-radius:18px}
  body.hasTabs #app{padding-bottom:40px!important;margin-left:max(92px,calc((100vw - 1100px)/2 + 92px))}
}
.sb-theme{width:44px;height:44px;min-height:44px;border-radius:50%;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);display:grid;place-items:center;padding:0}
.sb-bell svg,.sb-login svg{display:inline-block;vertical-align:-4px}
.sb-login{display:inline-flex;align-items:center;gap:8px}
.sb-stars i svg{color:#d79a24;fill:#f6c453}
.sb-stars i{display:inline-grid;place-items:center}
/* Home: greeting, continue card, doors, Lumi tip */
.hubhead img{width:min(130px,36vw)}
.hubhead .tag{display:none}
.greet{margin:6px 0 14px}.greet h1{font-size:var(--fs-xl);line-height:1.15}.greet p{margin:2px 0 0;font-weight:700;color:var(--mute,#6a6486)}
.cont2{display:flex;gap:12px;align-items:center;width:100%;padding:12px;border-radius:24px;border:1px solid var(--glass-b);background:linear-gradient(135deg,rgba(124,196,234,.30),var(--glass));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:var(--ink);text-align:left;font:inherit;margin-bottom:14px;min-height:76px;box-shadow:var(--sh)}
.cont2 .th{width:96px;height:64px;border-radius:14px;overflow:hidden;flex:none;background:linear-gradient(135deg,#2f6fb8,#7cc4ea);display:grid;place-items:center;position:relative}
.cont2 .th img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.cont2 .th .pl{position:relative;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.92);color:#2f6fb8;display:grid;place-items:center}
.cont2 small{display:block;font-weight:800;color:var(--mute,#6a6486);font-size:.8rem}.cont2 b{display:block;font-size:var(--fs-m);line-height:1.2}
.doors .door{box-shadow:0 14px 28px -14px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.28)}
.doors .door::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.30),transparent 46%);pointer-events:none}
.doors .door .big{font-size:0;opacity:1;filter:none;right:8px;top:6px}
.doors .door:not(.wide){min-height:150px}.doors .door:not(.wide) .big svg{width:64px;height:64px}.doors .door.wide .big svg{width:96px;height:96px}.doors .door.wide .big{right:14px;top:4px}
.doors .door .big svg{animation:hvfloat 5.5s ease-in-out infinite}
.doors .door:nth-child(2) .big svg{animation-delay:-1.2s}.doors .door:nth-child(3) .big svg{animation-delay:-2.4s}.doors .door:nth-child(4) .big svg{animation-delay:-3.6s}.doors .door:nth-child(5) .big svg{animation-delay:-4.8s}
@keyframes hvfloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1.5deg)}}
.mdoor .big svg{width:54px;height:54px}.mdoor .big{font-size:0}
.tipbub{display:flex;gap:10px;align-items:center;margin-top:14px;padding:10px 14px;border-radius:20px;background:var(--glass);border:1px solid var(--glass-b);width:100%;color:var(--ink);font:inherit;text-align:left;min-height:64px}
.tipbub p{margin:0;font-weight:700;font-size:var(--fs-m)}
.tcard .k svg{display:inline-block;vertical-align:-4px;margin-right:4px}
.workshop svg{display:inline-block;vertical-align:-4px;margin-right:6px}
@media (prefers-reduced-motion:reduce){.doors .door .big svg{animation:none!important}#tabbar .tb-ind,#tabbar .tb svg{transition:none}}
`;
document.head.appendChild(st);

/* ---------- Home pieces used by index.html ---------- */
window.hvGreeting=function(){
  const a=window.hvAcct&&hvAcct(),h=new Date().getHours(),d=new Date().getDay();
  const part=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const nm=a&&a.user?(a.user.first||a.user.name||"").split(" ")[0]:"";
  const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sub=d===0?"Happy Sunday! Time to check in.":["Ready for today's story?","Pick a lesson and press play.","What will you learn today?"][d%3];
  return `<div class="greet"><h1>${part}${nm?", "+E(nm):""}</h1><p>${sub}</p></div>`};
const TIPS=["Tap a lesson and press play. Then try its quiz!","Learn the verse of the day to earn stars.","Check in on Sunday to keep your streak.","Ask me anything about God and the Church."];
window.hvLumiTip=function(){
  if(!window.hvLumiSvg)return "";
  const tip=TIPS[new Date().getDate()%TIPS.length];
  return `<button class="tipbub" data-go="${hasLumi()?"lumi":"home"}"><span style="width:48px;height:48px;flex:none">${hvLumiSvg("happy",48)}</span><p>${tip}</p></button>`};
})();
