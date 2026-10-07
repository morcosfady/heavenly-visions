/* Round 2 edits: clay tile icons, notes icon for Attendance, nicer Post news button, calendar day selection, Lumi chat avatar fix, theme follows the phone again.
   Already applied; kept so the change is easy to read. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 70)); s = s.replace(a, () => b) });
  fs.writeFileSync(file, s);
};

/* ---------- design.js ---------- */
const clay = {
  notes: '<rect x="18" y="14" width="64" height="76" rx="11" fill="url(#hvB)"/><rect x="18" y="14" width="64" height="76" rx="11" fill="url(#hvH)"/><rect x="29" y="28" width="42" height="54" rx="6" fill="#fff"/><rect x="36" y="6" width="28" height="16" rx="7" fill="url(#hvY)"/><g stroke="#b7c3de" stroke-width="4" stroke-linecap="round"><path d="M36 42h14M36 54h14M36 66h14"/></g><circle cx="62" cy="62" r="13" fill="url(#hvG)"/><path d="M56 62l4 4 8-9" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  megaphone: '<path d="M14 40h20l34-20v60L34 60H14z" fill="url(#hvO)"/><path d="M14 40h20l34-20v60L34 60H14z" fill="url(#hvH)"/><rect x="26" y="58" width="14" height="26" rx="6" fill="#c9501f"/><rect x="70" y="30" width="8" height="40" rx="4" fill="url(#hvY)"/><path d="M84 36c6 8 6 20 0 28M92 28c10 12 10 32 0 44" stroke="#ffd36b" stroke-width="5" fill="none" stroke-linecap="round"/>',
  note: '<ellipse cx="30" cy="72" rx="15" ry="11" fill="url(#hvP)"/><ellipse cx="72" cy="62" rx="15" ry="11" fill="url(#hvP)"/><rect x="40" y="24" width="9" height="48" rx="3" fill="url(#hvP)"/><rect x="82" y="14" width="9" height="48" rx="3" fill="url(#hvP)"/><path d="M40 24L91 12v16L40 40z" fill="url(#hvP)"/><ellipse cx="30" cy="72" rx="15" ry="11" fill="url(#hvH)"/>',
  teddy: '<circle cx="24" cy="28" r="13" fill="url(#hvT)"/><circle cx="76" cy="28" r="13" fill="url(#hvT)"/><circle cx="24" cy="28" r="6" fill="#f3c9a0"/><circle cx="76" cy="28" r="6" fill="#f3c9a0"/><circle cx="50" cy="54" r="34" fill="url(#hvT)"/><circle cx="50" cy="54" r="34" fill="url(#hvH)"/><ellipse cx="50" cy="66" rx="16" ry="12" fill="#f6dcbc"/><circle cx="38" cy="48" r="4.5" fill="#3a2a1a"/><circle cx="62" cy="48" r="4.5" fill="#3a2a1a"/><ellipse cx="50" cy="61" rx="5.5" ry="4" fill="#3a2a1a"/><path d="M50 65v5M44 71q6 5 12 0" stroke="#3a2a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  balloon: '<path d="M50 90q-6-8 2-16" stroke="#9aa3b2" stroke-width="3" fill="none"/><path d="M44 78l6-8 6 8z" fill="#e0405f"/><ellipse cx="50" cy="40" rx="28" ry="34" fill="url(#hvR)"/><ellipse cx="50" cy="40" rx="28" ry="34" fill="url(#hvH)"/><ellipse cx="38" cy="26" rx="6" ry="10" fill="#fff" opacity=".45" transform="rotate(20 38 26)"/>',
  lion: '<circle cx="50" cy="50" r="42" fill="url(#hvO)"/><circle cx="50" cy="52" r="29" fill="url(#hvY)"/><circle cx="50" cy="52" r="29" fill="url(#hvH)"/><circle cx="28" cy="30" r="9" fill="url(#hvY)"/><circle cx="72" cy="30" r="9" fill="url(#hvY)"/><circle cx="40" cy="46" r="4" fill="#3a2a1a"/><circle cx="60" cy="46" r="4" fill="#3a2a1a"/><ellipse cx="50" cy="60" rx="9" ry="7" fill="#fbe7c4"/><path d="M46 57h8l-4 5z" fill="#3a2a1a"/><path d="M50 62v4M44 67q6 4 12 0" stroke="#3a2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  dove: '<path d="M10 54c20-2 28-18 40-32 4 14 20 18 38 14-8 12-18 14-26 16 8 8 4 20-8 24-18 6-34-4-44-22z" fill="#fff"/><path d="M10 54c20-2 28-18 40-32 4 14 20 18 38 14-8 12-18 14-26 16 8 8 4 20-8 24-18 6-34-4-44-22z" fill="url(#hvH)"/><path d="M50 22c-4 10-12 16-22 20" stroke="#b7c3de" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="76" cy="38" r="3" fill="#3a2a1a"/><path d="M88 36l8 3-8 3z" fill="#f0a030"/>',
  church: '<rect x="20" y="52" width="60" height="38" rx="4" fill="#f6ead2"/><path d="M14 54L50 28l36 26z" fill="url(#hvY)"/><path d="M50 14v14M44 20h12" stroke="#d79a24" stroke-width="5" stroke-linecap="round"/><path d="M42 90V70a8 8 0 0 1 16 0v20z" fill="url(#hvN)"/><rect x="26" y="60" width="10" height="14" rx="5" fill="#9db4d8"/><rect x="64" y="60" width="10" height="14" rx="5" fill="#9db4d8"/>',
  cross: '<rect x="41" y="8" width="18" height="84" rx="7" fill="url(#hvY)"/><rect x="10" y="36" width="80" height="18" rx="7" fill="url(#hvY)"/><rect x="41" y="8" width="18" height="84" rx="7" fill="url(#hvH)"/><circle cx="50" cy="45" r="7" fill="#fff" opacity=".55"/>',
  globe: '<circle cx="50" cy="50" r="40" fill="url(#hvB)"/><path d="M28 34c8-8 18-6 20 2s-8 10-6 18-14 4-16-6-4-8 2-14zM60 54c8-4 16 2 14 12s-12 16-18 8 0-16 4-20z" fill="#6fd69a"/><circle cx="50" cy="50" r="40" fill="url(#hvH)"/>',
  flame: '<path d="M50 8c4 18 26 28 26 54a26 26 0 0 1-52 0c0-14 8-20 14-30 2 8 6 12 10 12 4-12-2-22 2-36z" fill="url(#hvO)"/><path d="M50 50c2 10 14 14 14 28a14 14 0 0 1-28 0c0-8 6-12 8-20 2 4 4 6 6 4z" fill="url(#hvY)"/>',
  shield: '<path d="M50 8l34 12v28c0 24-18 38-34 44C34 86 16 72 16 48V20z" fill="url(#hvB)"/><path d="M50 8l34 12v28c0 24-18 38-34 44C34 86 16 72 16 48V20z" fill="url(#hvH)"/><rect x="45" y="26" width="10" height="44" rx="4" fill="#fff"/><rect x="30" y="38" width="40" height="10" rx="4" fill="#fff"/>',
  crown: '<path d="M12 74L18 28l24 24 8-30 8 30 24-24 6 46z" fill="url(#hvY)"/><path d="M12 74L18 28l24 24 8-30 8 30 24-24 6 46z" fill="url(#hvH)"/><rect x="12" y="74" width="76" height="12" rx="5" fill="#d79a24"/><circle cx="50" cy="60" r="5" fill="#e0405f"/><circle cx="30" cy="64" r="4" fill="#4a8fd8"/><circle cx="70" cy="64" r="4" fill="#4a8fd8"/>',
  candle: '<rect x="36" y="40" width="28" height="50" rx="7" fill="#fff6dc"/><rect x="36" y="40" width="28" height="50" rx="7" fill="url(#hvH)"/><path d="M50 8c2 8 12 12 12 22a12 12 0 0 1-24 0c0-6 4-8 6-14 2 4 4 4 6 2z" fill="url(#hvO)"/><path d="M50 22c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 2 2 3 2 3 1z" fill="url(#hvY)"/><path d="M50 40v-6" stroke="#6b4a2a" stroke-width="3"/>',
  cap: '<path d="M50 20L94 40 50 60 6 40z" fill="url(#hvN)"/><path d="M26 52v18c0 6 48 6 48 0V52L50 64z" fill="#3c3f9e"/><path d="M88 43v26" stroke="#ffd36b" stroke-width="4" stroke-linecap="round"/><circle cx="88" cy="72" r="5" fill="url(#hvY)"/>',
  calendar: '<rect x="12" y="18" width="76" height="70" rx="12" fill="#fff"/><path d="M12 30a12 12 0 0 1 12-12h52a12 12 0 0 1 12 12v10H12z" fill="url(#hvR)"/><rect x="28" y="8" width="9" height="20" rx="4" fill="#9aa3b2"/><rect x="63" y="8" width="9" height="20" rx="4" fill="#9aa3b2"/><g fill="#b7c3de"><rect x="24" y="50" width="12" height="10" rx="3"/><rect x="44" y="50" width="12" height="10" rx="3"/><rect x="64" y="50" width="12" height="10" rx="3"/><rect x="24" y="68" width="12" height="10" rx="3"/><rect x="44" y="68" width="12" height="10" rx="3" fill="#e3b45c"/></g>',
  halo: '<ellipse cx="50" cy="16" rx="22" ry="7" fill="none" stroke="url(#hvY)" stroke-width="6"/><circle cx="50" cy="56" r="30" fill="url(#hvS)"/><circle cx="50" cy="56" r="30" fill="url(#hvH)"/><circle cx="39" cy="54" r="3.6" fill="#3a2a1a"/><circle cx="61" cy="54" r="3.6" fill="#3a2a1a"/><path d="M40 66q10 9 20 0" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="63" r="5" fill="#ff9aa6" opacity=".6"/><circle cx="68" cy="63" r="5" fill="#ff9aa6" opacity=".6"/>',
  heart: '<path d="M50 88C16 62 8 42 12 28c4-14 24-18 38-4 14-14 34-10 38 4 4 14-4 34-38 60z" fill="url(#hvR)"/><path d="M50 88C16 62 8 42 12 28c4-14 24-18 38-4 14-14 34-10 38 4 4 14-4 34-38 60z" fill="url(#hvH)"/>',
  pig: '<circle cx="24" cy="26" r="11" fill="#f4a3b4"/><circle cx="76" cy="26" r="11" fill="#f4a3b4"/><circle cx="50" cy="52" r="36" fill="#f9bccb"/><circle cx="50" cy="52" r="36" fill="url(#hvH)"/><ellipse cx="50" cy="62" rx="16" ry="12" fill="#f08aa0"/><circle cx="44" cy="62" r="3" fill="#a03a55"/><circle cx="56" cy="62" r="3" fill="#a03a55"/><circle cx="36" cy="44" r="4" fill="#3a2a1a"/><circle cx="64" cy="44" r="4" fill="#3a2a1a"/>',
  palm: '<path d="M52 92c-4-20-2-40 6-58" stroke="#a8683a" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="url(#hvG)"><ellipse cx="30" cy="34" rx="24" ry="9" transform="rotate(-28 30 34)"/><ellipse cx="78" cy="30" rx="24" ry="9" transform="rotate(26 78 30)"/><ellipse cx="38" cy="18" rx="22" ry="8" transform="rotate(-62 38 18)"/><ellipse cx="68" cy="16" rx="22" ry="8" transform="rotate(60 68 16)"/><ellipse cx="54" cy="28" rx="20" ry="8" transform="rotate(-8 54 28)"/></g>',
  cards: '<rect x="12" y="22" width="48" height="62" rx="9" fill="url(#hvB)" transform="rotate(-12 36 53)"/><rect x="40" y="16" width="48" height="62" rx="9" fill="#fff" transform="rotate(10 64 47)"/><path d="M64 30l5 10 11 1.5-8 8 2 11-10-5.5-10 5.5 2-11-8-8 11-1.5z" fill="url(#hvY)" transform="rotate(10 64 47)"/>',
  abc: '<rect x="10" y="16" width="80" height="68" rx="14" fill="url(#hvB)"/><rect x="10" y="16" width="80" height="68" rx="14" fill="url(#hvH)"/><text x="50" y="62" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#fff">abc</text>'
};
const clayStr = Object.entries(clay).map(([k, v]) => '  ' + k + ':`' + v + '`').join(',\n');
const CLAYMAP = { '🎶': 'note', '🎵': 'note', '🧸': 'teddy', '🎈': 'balloon', '🦁': 'lion', '🕊': 'dove', '⛪': 'church', '✝': 'cross', '🌍': 'globe', '🔥': 'flame', '🛡': 'shield', '👑': 'crown', '🕯': 'candle', '🎓': 'cap', '🗓': 'calendar', '😇': 'halo', '💙': 'heart', '🐖': 'pig', '🌴': 'palm', '🃏': 'cards', '🔤': 'abc', '⭐': 'star', '📖': 'book', '🏆': 'trophy', '🎮': 'game', '🌙': 'moon', '🎨': 'palette' };

edit('design.js', [
  ['const getTheme=()=>{try{return localStorage.getItem("hv_theme")||"light"}catch{return "light"}};\nconst setTheme=t=>{try{localStorage.setItem("hv_theme",t)}catch{}root.dataset.theme=t};\nroot.dataset.theme=getTheme();',
   'const getTheme=()=>{try{return localStorage.getItem("hv_theme")||""}catch{return ""}};\nconst setTheme=t=>{try{localStorage.setItem("hv_theme",t)}catch{}root.dataset.theme=t};\nconst isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;\nif(getTheme())root.dataset.theme=getTheme();/* no saved choice: follow the phone */'],
  ['const dark=root.dataset.theme==="dark";return `<button class="sb-theme"', 'const dark=isDark();return `<button class="sb-theme"'],
  ['setTheme(root.dataset.theme==="dark"?"light":"dark");const b=document.getElementById("sbTheme");if(b){const dark=root.dataset.theme==="dark";', 'setTheme(isDark()?"light":"dark");const b=document.getElementById("sbTheme");if(b){const dark=isDark();'],
  ['  palette:`', '  palette:`'],
  ['/* ---------- line icons', '/* more clay icons (tiles, headers) */\nObject.assign(CLAY,{\n' + clayStr + '\n});\nconst CLAYMAP=' + JSON.stringify(CLAYMAP) + ';\n/* ---------- line icons'],
  ['<radialGradient id="hvH"', '<linearGradient id="hvT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0a56a"/><stop offset="1" stop-color="#a8683a"/></linearGradient>\n<linearGradient id="hvR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8aa6"/><stop offset="1" stop-color="#e0405f"/></linearGradient>\n<linearGradient id="hvG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd69a"/><stop offset="1" stop-color="#2c9c5a"/></linearGradient>\n<linearGradient id="hvO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb27a"/><stop offset="1" stop-color="#e0622f"/></linearGradient>\n<radialGradient id="hvH"'],
  /* swapper: big tile emojis become clay icons */
  ['  const dot=window.HV_DOTS&&HV_DOTS[k];', '  const cl=CLAYMAP[k];if(cl&&CLAY[cl]&&big)return `<i class="hve hve-clay" aria-hidden="true">${hvIcon(cl,64)}</i>`;\n  const dot=window.HV_DOTS&&HV_DOTS[k];'],
  ['function emoSvg(e){', 'function emoSvg(e,big){'],
  ['const s=emoSvg(e);if(s)', 'const s=emoSvg(e,big);if(s)'],
  ['    const t=n.nodeValue;let last=0', '    const big=!!n.parentElement.closest(".tile .ic");\n    const t=n.nodeValue;let last=0'],
  ['.hve-dot{', '.hve-clay{width:1.4em;height:1.4em;vertical-align:-.3em}.hve-clay svg{width:100%;height:100%;fill:initial;stroke:none}\n.tile .ic{font-size:2.3rem}\n.hve-dot{']
]);

/* ---------- Home: Attendance uses the notes icon ---------- */
edit('index.html', [["door('d-att', 'attendance', 'hand'", "door('d-att', 'attendance', 'notes'"]].filter(() => false));
let h = fs.readFileSync('index.html', 'utf8');
h = h.replace('<span class="big">${hvIcon("hand",96)}</span><b>Attendance', '<span class="big">${hvIcon("notes",96)}</span><b>Attendance');
h = h.replace('design.js?v=4', 'design.js?v=5');
fs.writeFileSync('index.html', h);

/* ---------- Post news button ---------- */
edit('servants.js', [
  ['window.hvPostBtn=function(){return isStaff()?`<button class="btn gold postbtn" data-go="announce">📢 Post news</button>`:""};',
   'window.hvPostBtn=function(){return isStaff()?`<button class="postcard" data-go="announce"><span class="pci">${window.hvIcon?hvIcon("megaphone",48):""}</span><span class="pct"><b>Post news</b><small>Tell your class what is happening</small></span><span class="pcg" aria-hidden="true">${window.hvIcon?hvIcon("play2",16):""}</span></button>`:""};'],
  ['.postbtn{min-height:52px}', '.postbtn{min-height:52px}\n.postcard{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:10px 14px;border-radius:22px;border:1px solid rgba(255,255,255,.35);background:linear-gradient(135deg,#f0c866,#c98f2a);color:#2b1d05;text-align:left;font:inherit;box-shadow:0 14px 26px -14px rgba(150,100,20,.7),inset 0 1px 0 rgba(255,255,255,.5);margin:10px 0;position:relative;overflow:hidden}\n.postcard::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.35),transparent 50%);pointer-events:none}\n.postcard .pci{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.4)}\n.postcard .pct{flex:1;display:flex;flex-direction:column}.postcard b{font-family:var(--display);font-size:1.15rem}.postcard small{font-weight:800;opacity:.8}\n.postcard .pcg{width:32px;height:32px;border-radius:50%;background:rgba(43,29,5,.14);display:grid;place-items:center}\n.postcard:active{transform:scale(.98)}']
]);

/* ---------- Lumi chat: the user avatar can be the logo ---------- */
edit('lumi-chat.js', [
  ['function avatar(){const a=A();return a?(window.hvAvatarOf&&a.user.av?hvAvatarOf(a,34):`<span>${E(a.avatar||"😇")}</span>`):"<span>🙂</span>"}',
   'function avatar(){const a=A();if(!a)return "<span>🙂</span>";if(window.hvAvatarOf&&a.user.av)return hvAvatarOf(a,34);const v=a.avatar||"😇";return v==="logo"?`<img src="logo.png" alt="" width="34" height="34" style="width:34px;height:34px;object-fit:contain;border-radius:50%;display:block">`:`<span>${E(v)}</span>`}']
]);

/* ---------- Calendar: tapping a day marks it and shows its details right under the grid ---------- */
edit('faith.js', [
  ['document.getElementById("cgrid").onclick=e=>{const b=e.target.closest("[data-d]");if(!b)return;',
   'document.getElementById("cgrid").onclick=e=>{const b=e.target.closest("[data-d]");if(!b)return;document.querySelectorAll("#cgrid .cd.sel").forEach(x=>{x.classList.remove("sel");x.removeAttribute("aria-pressed")});b.classList.add("sel");b.setAttribute("aria-pressed","true");CALSEL=b.dataset.d;'],
  ['let CALM=null;', 'let CALM=null,CALSEL="";'],
  ['cells+=`<button class="cd ${diffDays(t,dt)===0?"now":""}"', 'cells+=`<button class="cd ${diffDays(t,dt)===0?"now":""}${dkey(dt)===CALSEL?" sel":""}"']
]);
console.log('done');
