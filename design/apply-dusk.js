/* Adds the third look "Twilight" (dusk): between the bright morning and the dark night. Default for everyone. Already applied. */
const fs = require('fs');
let d = fs.readFileSync('design.js', 'utf8');
const R = (a, b) => { if (!d.includes(a)) console.log('MISSING: ' + a.slice(0, 70)); d = d.replace(a, () => b) };

/* modes: dusk (default), light, dark. dusk is the dark theme with a lighter twilight sky, data-tone="dusk" */
R(`const getTheme=()=>{try{return localStorage.getItem("hv_theme")||""}catch{return ""}};
const setTheme=t=>{try{localStorage.setItem("hv_theme",t)}catch{}root.dataset.theme=t};
const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
if(getTheme())root.dataset.theme=getTheme();/* no saved choice: follow the phone */`,
`const MODES=["dusk","light","dark"],MODE_NAME={dusk:"Twilight",light:"Sunrise",dark:"Night"};
const getTheme=()=>{try{const t=localStorage.getItem("hv_theme");return MODES.includes(t)?t:"dusk"}catch{return "dusk"}};
function applyMode(m){root.dataset.theme=m==="light"?"light":"dark";if(m==="dusk")root.dataset.tone="dusk";else delete root.dataset.tone;
  try{window.dispatchEvent(new Event("resize"))}catch{}/* the sky redraws its stars */
  try{const mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.content=m==="light"?"#a9d8f2":m==="dusk"?"#2a2f6b":"#0b1030"}catch{}}
const setTheme=m=>{try{localStorage.setItem("hv_theme",m)}catch{}applyMode(m)};
applyMode(getTheme());
window.hvGetLook=getTheme;window.hvSetLook=m=>{if(MODES.includes(m)){setTheme(m);const b=document.getElementById("sbTheme");if(b)b.innerHTML=hvIcon(MODE_ICON[m],22)}};
const MODE_ICON={dusk:"sunset",light:"sun",dark:"moon"};`);
R('window.hvThemeButton=function(){const dark=isDark();return `<button class="sb-theme" id="sbTheme" aria-label="${dark?"Switch to light":"Switch to dark"}">${hvIcon(dark?"sun":"moon",22)}</button>`};',
  'window.hvThemeButton=function(){const m=getTheme();return `<button class="sb-theme" id="sbTheme" aria-label="Change the look. Now: ${MODE_NAME[m]}">${hvIcon(MODE_ICON[m],22)}</button>`};');
/* the click handler */
const a = d.indexOf('document.addEventListener("click",e=>{if(e.target.closest("#sbTheme")){');
const b = d.indexOf('\n', a);
d = d.slice(0, a) + 'document.addEventListener("click",e=>{if(e.target.closest("#sbTheme")){const m=MODES[(MODES.indexOf(getTheme())+1)%MODES.length];setTheme(m);const bt=document.getElementById("sbTheme");if(bt){bt.innerHTML=hvIcon(MODE_ICON[m],22);bt.setAttribute("aria-label","Change the look. Now: "+MODE_NAME[m])}if(window.toast)toast("Look: "+MODE_NAME[m])}});' + d.slice(b);
/* the sunset icon */
R("  moon:'<path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"/>',", "  moon:'<path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"/>',\n  sunset:'<path d=\"M12 10V2\"/><path d=\"m4.93 10.93 1.41 1.41\"/><path d=\"M2 18h2\"/><path d=\"M20 18h2\"/><path d=\"m19.07 10.93-1.41 1.41\"/><path d=\"M22 22H2\"/><path d=\"m16 6-4 4-4-4\"/><path d=\"M16 18a4 4 0 0 0-8 0\"/>',");
/* twilight tokens */
R('.hvi{display:block;flex:none}', `.hvi{display:block;flex:none}
:root[data-tone="dusk"]{
  --bg:#2c3270;--surface:#3b4284;--ink:#fff7ea;--muted:#d2d3f0;--gold:#f3c56a;--gold-soft:#4d4673;--sky-soft:#3a5a96;--line:#5a609e;--shadow:0 8px 22px rgba(18,20,70,.42);
  --bg-base:#2a2f6b;--sky-top:#1f2b66;--sky-mid:#5a56a3;--sky-bot:#d98aa8;
  --aur1:rgba(255,200,110,.55);--aur2:rgba(120,170,255,.42);--aur3:rgba(235,140,205,.36);
  --rays:rgba(255,222,150,.26);--halo:rgba(255,205,120,.66);--cloud:rgba(255,236,226,.2);--stars-op:1;--grain-op:.05;
  --glass:rgba(58,64,128,.6);--glass-b:rgba(255,255,255,.2);--glass-hi:rgba(255,255,255,.14);--sh:0 12px 30px -14px rgba(14,16,60,.65)}
:root[data-tone="dusk"] .sk-px .au1{opacity:1}
:root[data-tone="dusk"] .rays{opacity:.6}
.lookrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.lookrow button{min-height:44px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-weight:800}.lookrow button[aria-pressed="true"]{background:var(--gold-soft);border-color:var(--gold)}`);
fs.writeFileSync('design.js', d);

/* Account tab: a Look chooser */
let p = fs.readFileSync('profile.js', 'utf8');
const anchor = '<label class="sndrow">';
if (!p.includes(anchor)) console.log('MISSING sndrow');
p = p.replace(anchor, '<b style="display:block;margin-top:14px">Look</b><div class="lookrow" id="lookRow">${[["dusk","Twilight"],["light","Sunrise"],["dark","Night"]].map(m=>`<button type="button" data-look="${m[0]}" aria-pressed="${window.hvGetLook&&hvGetLook()===m[0]}">${m[1]}</button>`).join("")}</div>\n    ' + anchor);
p = p.replace('box.querySelector("#sndTog").onchange=', 'box.querySelector("#lookRow").onclick=e=>{const b=e.target.closest("[data-look]");if(!b||!window.hvSetLook)return;hvSetLook(b.dataset.look);box.querySelectorAll("[data-look]").forEach(x=>x.setAttribute("aria-pressed",x===b))};\n  box.querySelector("#sndTog").onchange=');
fs.writeFileSync('profile.js', p);

let h = fs.readFileSync('index.html', 'utf8');
h = h.replace('design.js?v=9', 'design.js?v=10').replace('profile.js?v=15', 'profile.js?v=16');
fs.writeFileSync('index.html', h);
console.log('done');
