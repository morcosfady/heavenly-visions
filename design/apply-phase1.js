/* Phase 1 (bugs): dead Prayers route, overlay stacking, Lumi button, no audio, intro rules, #me route. Already applied; kept to read the change. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => {
    if (a instanceof RegExp) { if (!a.test(s)) console.log('MISSING in ' + file + ': ' + a); s = s.replace(a, () => b) }
    else { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 70)); s = s.replace(a, () => b) }
  });
  fs.writeFileSync(file, s);
};

/* ---- 1.1 dead Prayers ---- */
edit('faith.js', [
  [/\s*<div class="two"><button class="btn gold" data-go="prayers">[^\n]*<\/button><\/div>/, ''],
  [/\n  if\(h==="prayers"\)\{prayersPage\(\);return true\}\n  if\(h\.startsWith\("pr-"\)\)\{prayerPage\(h\.slice\(3\)\);return true\}/, ''],
  [/\n\.prgrid \.prtile\.done\{[^\n]*/, ''],
  [/\n\.prayer\{[^\n]*/, ''],
  [/\n\.candle\{[^\n]*/, ''],
  [/\n\.candle i\{[^\n]*/, ''],
  [/\n@keyframes flick\{[^\n]*/, '']
]);
edit('theme.js', [['prayers:"#a86fd0",', '']]);
edit('index.html', [
  [')))hub();window.scrollTo(0,0)}', '))){hub();if(h!=="home"){try{history.replaceState(null,"","#home")}catch{}toast("That page moved")}}window.scrollTo(0,0)}'],
  /* ---- 1.2 overlays above the tab bar ---- */
  ['justify-content:center;z-index:20}', 'justify-content:center;z-index:2500;overscroll-behavior:contain}'],
  ['font-weight:800;z-index:60}', 'font-weight:800;z-index:2600}'],
  ['#confetti{position:fixed;inset:0;pointer-events:none;z-index:70}', '#confetti{position:fixed;inset:0;pointer-events:none;z-index:2800}'],
  ['.sheet{width:min(720px,100%);max-height:92%;', '.sheet{width:min(720px,100%);max-height:92dvh;overscroll-behavior:contain;'],
  /* sheet(): scroll lock, focus trap, swipe down, focus return */
  ['function sheet(html,label){closeSheet();const scrim=document.createElement("div");scrim.className="scrim";\n  scrim.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label||"")}"><button class="close" data-close>✕ Close</button>${html}</div>`;\n  document.body.appendChild(scrim);scrim.addEventListener("click",e=>{if(e.target===scrim)closeSheet()});return scrim}\nfunction closeSheet(){document.querySelector(".scrim")?.remove()}',
   'let _sheetFrom=null;\nfunction sheet(html,label){closeSheet(true);_sheetFrom=document.activeElement;const scrim=document.createElement("div");scrim.className="scrim";\n  scrim.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label||"")}" tabindex="-1"><button class="close" data-close>✕ Close</button>${html}</div>`;\n  document.body.appendChild(scrim);document.body.classList.add("sheet-open");scrim.addEventListener("click",e=>{if(e.target===scrim)closeSheet()});\n  const sh=scrim.querySelector(".sheet");\n  /* focus trap: Tab stays inside the sheet */\n  scrim.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const f=[...sh.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\\"-1\\"])")].filter(x=>x.offsetParent!==null);if(!f.length){e.preventDefault();return}const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});\n  /* swipe down to close (only when the sheet is scrolled to the top) */\n  let y0=null;sh.addEventListener("touchstart",e=>{y0=sh.scrollTop<=0?e.touches[0].clientY:null},{passive:true});\n  sh.addEventListener("touchmove",e=>{if(y0===null)return;const dy=e.touches[0].clientY-y0;if(dy>0)sh.style.transform=`translateY(${Math.min(dy,200)}px)`},{passive:true});\n  sh.addEventListener("touchend",e=>{if(y0===null)return;const dy=(e.changedTouches[0].clientY)-y0;y0=null;if(dy>90)closeSheet();else sh.style.transform=""});\n  setTimeout(()=>{const c=sh.querySelector("[autofocus],input,textarea,select");(c||sh).focus({preventScroll:true})},30);\n  return scrim}\nfunction closeSheet(keep){document.querySelector(".scrim")?.remove();document.body.classList.remove("sheet-open");if(!keep&&_sheetFrom&&_sheetFrom.isConnected&&_sheetFrom!==document.body){try{_sheetFrom.focus({preventScroll:true})}catch{}}if(!keep)_sheetFrom=null}'],
  ['</style>', 'body.sheet-open{overflow:hidden}body.sheet-open #tabbar,body.sheet-open #lmfab{opacity:0;pointer-events:none;visibility:hidden}.sheet:focus{outline:none}\n</style>']
]);
edit('kids.js', [['.lvup{position:fixed;inset:0;z-index:80;', '.lvup{position:fixed;inset:0;z-index:2700;']]);
edit('offline.js', [['z-index:75;', 'z-index:2650;']]);
edit('servants.js', [['.sunday{position:fixed;inset:0;z-index:90;', '.sunday{position:fixed;inset:0;z-index:2700;']]);
edit('ds.css', [['.burst{position:fixed;pointer-events:none;z-index:70;', '.burst{position:fixed;pointer-events:none;z-index:2800;']]);

/* ---- 1.3 / 1.5 design.js: Lumi button, bottom padding, #me ---- */
edit('design.js', [
  ['const TABS=[["home","home","Home"],["learn","media","Learn"],["play","games","Play"],["me","profile","Me"]];', 'const TABS=[["home","home","Home"],["learn","media","Learn"],["play","games","Play"],["me","me","Me"]];'],
  ['kids:"me",attendance:"me"', 'kids:"me",me:"me",attendance:"me"'],
  ['"kids","profile","attendance"', '"kids","profile","me","attendance"'],
  ['body.hasTabs #app{padding-bottom:calc(104px + env(safe-area-inset-bottom))!important}', 'body.hasTabs #app{padding-bottom:calc(150px + env(safe-area-inset-bottom))!important}'],
  /* new Lumi button look */
  [/\.lm-fab\{position:fixed;right:6px;[^\n]*\n\.lm-fab-i\{[^\n]*\n\.lm-fab b\{[^\n]*\n@media \(min-width:900px\)\{\.lm-fab\{[^\n]*\}/,
   `.lm-fab{position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:950;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;padding:0;cursor:pointer;min-width:52px;min-height:52px;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .2s}.lm-fab[hidden]{display:none}
.lm-fab.away{transform:translateY(24px);opacity:0;pointer-events:none}
.lm-fab-i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--glass);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 0 2px rgba(243,197,106,.85),0 8px 20px -6px rgba(10,12,50,.6),0 0 18px rgba(243,197,106,.35);transition:transform .15s}.lm-fab-i .lumi-svg{filter:none;width:40px;height:40px}.lm-fab:active .lm-fab-i{transform:scale(.92)}
.lm-fab b{font-size:.68rem;font-weight:900;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.7);white-space:nowrap;display:none}.lm-fab.lab b{display:block}
@media (min-width:900px){.lm-fab{bottom:24px;right:max(24px,calc((100vw - 1100px)/2 + 12px))}}`],
  ['hvLumiSvg("happy",56)}</span><b>Ask Lumi</b>', 'hvLumiSvg("happy",40)}</span><b>Ask Lumi</b>'],
  /* hide on scroll down, show on scroll up; label until first tap */
  ['function fab(show){', 'let _fy=0;function fabScroll(){const b=document.getElementById("lmfab");if(!b)return;const y=scrollY,dn=y>_fy+6&&y>80,up=y<_fy-6||y<80;if(dn)b.classList.add("away");else if(up)b.classList.remove("away");_fy=y}\naddEventListener("scroll",fabScroll,{passive:true});addEventListener("hashchange",()=>{const b=document.getElementById("lmfab");if(b){b.classList.remove("away");_fy=0}});\nfunction fab(show){'],
  ['b.onclick=()=>{location.hash="lumi"};document.body.appendChild(b)}', 'b.onclick=()=>{try{localStorage.setItem("hv_lumi_tapped","1")}catch{}location.hash="lumi"};try{if(!localStorage.getItem("hv_lumi_tapped"))b.classList.add("lab")}catch{}document.body.appendChild(b)}']
]);

/* ---- 1.4 no audio ---- */
let intro = fs.readFileSync('intro.js', 'utf8');
const c0 = intro.indexOf('/* ---------- the chime');
const c1 = intro.indexOf('/* ---------- styles ---------- */');
intro = intro.slice(0, c0) + intro.slice(c1);
intro = intro.replace(/\/\* Heavenly Visions: the opening moment\.[\s\S]*?\*\/\n/, '/* Heavenly Visions: the opening moment. Light rays, rings of light, rising gold dust, the logo blooming in with a shine and the tagline appearing letter by letter.\n   No sound anywhere in the app. Full intro (max 2.5 s) on the first open of the day, a quick 0.6 s logo fade after that, none with reduced motion. Tap anywhere to skip. */\n');
intro = intro.replace('const soundOn=()=>{try{return localStorage.getItem("hv_sound")!=="off"}catch{return true}};\n', '');
intro = intro.replace(/window\.hvIntro=function\(intro,end\)\{\n  let done=false;/, 'window.hvIntro=function(intro,end){\n  if(reduce){intro.remove();return}\n  const day=new Date().toDateString();let first=true;try{first=localStorage.getItem("hv_intro_day")!==day;localStorage.setItem("hv_intro_day",day)}catch{}\n  let done=false;');
intro = intro.replace('  chime();\n', '');
intro = intro.replace('setTimeout(finish,reduce?1200:2500)};', 'setTimeout(finish,first?2500:600)};');
intro = intro.replace('requestAnimationFrame(()=>requestAnimationFrame(()=>{intro.classList.add("go");end.classList.add("show");if(!reduce)dust(cv,performance.now()+2600)}));', 'if(!first)intro.classList.add("short");\n  requestAnimationFrame(()=>requestAnimationFrame(()=>{intro.classList.add("go");end.classList.add("show");if(first)dust(cv,performance.now()+2600)}));');
intro = intro.replace('@media (prefers-reduced-motion:reduce)', '#intro.short .in-rays,#intro.short .in-ring,#intro.short .in-ring2,#intro.short .in-dust{display:none}#intro.short.go .intro-logo{animation:inshort .3s ease-out both}#intro.short .intro-logo p span{animation:none;opacity:1;transform:none}#intro.short.go .intro-logo img{animation:none}#intro.short.out{animation:inout2 .3s forwards}\n@keyframes inshort{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:reduce)');
fs.writeFileSync('intro.js', intro);
edit('profile.js', [
  [/\n    <label class="sndrow">[^\n]*<\/label>/, ''],
  [/\n  box\.querySelector\("#sndTog"\)\.onchange=[^\n]*/, ''],
  [/const SNDCSS=document\.createElement\("style"\);[^\n]*\n/, '']
]);
edit('shell.js', [['try{localStorage.removeItem("hv_lang")}catch{}', 'try{localStorage.removeItem("hv_lang");localStorage.removeItem("hv_sound")}catch{}']]);
edit('kids.js', [['if(h==="kids"||h==="profile")', 'if(h==="kids"||h==="profile"||h==="me")']]);
edit('profile.js', [['if(h==="profile"){if(!acct())', 'if(h==="profile"||h==="me"){if(!acct())']]);
console.log('done');
