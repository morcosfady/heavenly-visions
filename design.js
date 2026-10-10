/* Heavenly Visions: design v2 ("Sky Garden"). Icon system, bottom tab bar, theme switch, Home polish.
   hvIcon(name,size,alt): clay 3D icons (doors, tiles) and rounded line icons (buttons, tabs), all inline SVG, no emoji.
   To add an icon: add a line to CLAY or LINE below, then use hvIcon("name",48).
   Everything here is optional: if this file fails the app still works. */
(function(){
const root=document.documentElement;

/* ---------- theme: light by default, the sun/moon button in the top bar switches ---------- */
const MODES=["dusk","light","dark"],MODE_NAME={dusk:"Twilight",light:"Sunrise",dark:"Night"};
const getTheme=()=>"dusk";/* one look only: Twilight */
function applyMode(m){root.dataset.theme=m==="light"?"light":"dark";if(m==="dusk")root.dataset.tone="dusk";else delete root.dataset.tone;
  try{window.dispatchEvent(new Event("resize"))}catch{}/* the sky redraws its stars */
  try{const mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.content=m==="light"?"#a9d8f2":m==="dusk"?"#2a2f6b":"#0b1030"}catch{}}
const setTheme=m=>{try{localStorage.setItem("hv_theme",m)}catch{}applyMode(m)};
applyMode(getTheme());
window.hvGetLook=getTheme;window.hvSetLook=m=>{if(MODES.includes(m)){setTheme(m);const b=document.getElementById("sbTheme");if(b)b.innerHTML=hvIcon(MODE_ICON[m],22)}};
const MODE_ICON={dusk:"sunset",light:"sun",dark:"moon"};

/* ---------- shared gradients (defined once, used by every clay icon) ---------- */
const defs=document.createElement("div");
defs.setAttribute("aria-hidden","true");defs.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
defs.innerHTML=`<svg width="0" height="0"><defs>
<linearGradient id="hvB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ea"/><stop offset="1" stop-color="#2f6fb8"/></linearGradient>
<linearGradient id="hvP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cf0"/><stop offset="1" stop-color="#6a47c2"/></linearGradient>
<linearGradient id="hvY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#d79a24"/></linearGradient>
<linearGradient id="hvS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3c2"/><stop offset="1" stop-color="#f0a86a"/></linearGradient>
<linearGradient id="hvN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b94e8"/><stop offset="1" stop-color="#3c3f9e"/></linearGradient>
<linearGradient id="hvT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0a56a"/><stop offset="1" stop-color="#a8683a"/></linearGradient>
<linearGradient id="hvR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8aa6"/><stop offset="1" stop-color="#e0405f"/></linearGradient>
<linearGradient id="hvG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd69a"/><stop offset="1" stop-color="#2c9c5a"/></linearGradient>
<linearGradient id="hvO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb27a"/><stop offset="1" stop-color="#e0622f"/></linearGradient>
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
/* more clay icons (tiles, headers) */
Object.assign(CLAY,{
  notes:`<rect x="18" y="14" width="64" height="76" rx="11" fill="url(#hvB)"/><rect x="18" y="14" width="64" height="76" rx="11" fill="url(#hvH)"/><rect x="29" y="28" width="42" height="54" rx="6" fill="#fff"/><rect x="36" y="6" width="28" height="16" rx="7" fill="url(#hvY)"/><g stroke="#b7c3de" stroke-width="4" stroke-linecap="round"><path d="M36 42h14M36 54h14M36 66h14"/></g><circle cx="62" cy="62" r="13" fill="url(#hvG)"/><path d="M56 62l4 4 8-9" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  megaphone:`<path d="M14 40h20l34-20v60L34 60H14z" fill="url(#hvO)"/><path d="M14 40h20l34-20v60L34 60H14z" fill="url(#hvH)"/><rect x="26" y="58" width="14" height="26" rx="6" fill="#c9501f"/><rect x="70" y="30" width="8" height="40" rx="4" fill="url(#hvY)"/><path d="M84 36c6 8 6 20 0 28M92 28c10 12 10 32 0 44" stroke="#ffd36b" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  note:`<ellipse cx="30" cy="72" rx="15" ry="11" fill="url(#hvP)"/><ellipse cx="72" cy="62" rx="15" ry="11" fill="url(#hvP)"/><rect x="40" y="24" width="9" height="48" rx="3" fill="url(#hvP)"/><rect x="82" y="14" width="9" height="48" rx="3" fill="url(#hvP)"/><path d="M40 24L91 12v16L40 40z" fill="url(#hvP)"/><ellipse cx="30" cy="72" rx="15" ry="11" fill="url(#hvH)"/>`,
  teddy:`<circle cx="24" cy="28" r="13" fill="url(#hvT)"/><circle cx="76" cy="28" r="13" fill="url(#hvT)"/><circle cx="24" cy="28" r="6" fill="#f3c9a0"/><circle cx="76" cy="28" r="6" fill="#f3c9a0"/><circle cx="50" cy="54" r="34" fill="url(#hvT)"/><circle cx="50" cy="54" r="34" fill="url(#hvH)"/><ellipse cx="50" cy="66" rx="16" ry="12" fill="#f6dcbc"/><circle cx="38" cy="48" r="4.5" fill="#3a2a1a"/><circle cx="62" cy="48" r="4.5" fill="#3a2a1a"/><ellipse cx="50" cy="61" rx="5.5" ry="4" fill="#3a2a1a"/><path d="M50 65v5M44 71q6 5 12 0" stroke="#3a2a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  balloon:`<path d="M50 90q-6-8 2-16" stroke="#9aa3b2" stroke-width="3" fill="none"/><path d="M44 78l6-8 6 8z" fill="#e0405f"/><ellipse cx="50" cy="40" rx="28" ry="34" fill="url(#hvR)"/><ellipse cx="50" cy="40" rx="28" ry="34" fill="url(#hvH)"/><ellipse cx="38" cy="26" rx="6" ry="10" fill="#fff" opacity=".45" transform="rotate(20 38 26)"/>`,
  lion:`<circle cx="50" cy="50" r="42" fill="url(#hvO)"/><circle cx="50" cy="52" r="29" fill="url(#hvY)"/><circle cx="50" cy="52" r="29" fill="url(#hvH)"/><circle cx="28" cy="30" r="9" fill="url(#hvY)"/><circle cx="72" cy="30" r="9" fill="url(#hvY)"/><circle cx="40" cy="46" r="4" fill="#3a2a1a"/><circle cx="60" cy="46" r="4" fill="#3a2a1a"/><ellipse cx="50" cy="60" rx="9" ry="7" fill="#fbe7c4"/><path d="M46 57h8l-4 5z" fill="#3a2a1a"/><path d="M50 62v4M44 67q6 4 12 0" stroke="#3a2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  dove:`<path d="M10 54c20-2 28-18 40-32 4 14 20 18 38 14-8 12-18 14-26 16 8 8 4 20-8 24-18 6-34-4-44-22z" fill="#fff"/><path d="M10 54c20-2 28-18 40-32 4 14 20 18 38 14-8 12-18 14-26 16 8 8 4 20-8 24-18 6-34-4-44-22z" fill="url(#hvH)"/><path d="M50 22c-4 10-12 16-22 20" stroke="#b7c3de" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="76" cy="38" r="3" fill="#3a2a1a"/><path d="M88 36l8 3-8 3z" fill="#f0a030"/>`,
  church:`<rect x="20" y="52" width="60" height="38" rx="4" fill="#f6ead2"/><path d="M14 54L50 28l36 26z" fill="url(#hvY)"/><path d="M50 14v14M44 20h12" stroke="#d79a24" stroke-width="5" stroke-linecap="round"/><path d="M42 90V70a8 8 0 0 1 16 0v20z" fill="url(#hvN)"/><rect x="26" y="60" width="10" height="14" rx="5" fill="#9db4d8"/><rect x="64" y="60" width="10" height="14" rx="5" fill="#9db4d8"/>`,
  cross:`<rect x="41" y="8" width="18" height="84" rx="7" fill="url(#hvY)"/><rect x="10" y="36" width="80" height="18" rx="7" fill="url(#hvY)"/><rect x="41" y="8" width="18" height="84" rx="7" fill="url(#hvH)"/><circle cx="50" cy="45" r="7" fill="#fff" opacity=".55"/>`,
  globe:`<circle cx="50" cy="50" r="40" fill="url(#hvB)"/><path d="M28 34c8-8 18-6 20 2s-8 10-6 18-14 4-16-6-4-8 2-14zM60 54c8-4 16 2 14 12s-12 16-18 8 0-16 4-20z" fill="#6fd69a"/><circle cx="50" cy="50" r="40" fill="url(#hvH)"/>`,
  flame:`<path d="M50 8c4 18 26 28 26 54a26 26 0 0 1-52 0c0-14 8-20 14-30 2 8 6 12 10 12 4-12-2-22 2-36z" fill="url(#hvO)"/><path d="M50 50c2 10 14 14 14 28a14 14 0 0 1-28 0c0-8 6-12 8-20 2 4 4 6 6 4z" fill="url(#hvY)"/>`,
  shield:`<path d="M50 8l34 12v28c0 24-18 38-34 44C34 86 16 72 16 48V20z" fill="url(#hvB)"/><path d="M50 8l34 12v28c0 24-18 38-34 44C34 86 16 72 16 48V20z" fill="url(#hvH)"/><rect x="45" y="26" width="10" height="44" rx="4" fill="#fff"/><rect x="30" y="38" width="40" height="10" rx="4" fill="#fff"/>`,
  crown:`<path d="M12 74L18 28l24 24 8-30 8 30 24-24 6 46z" fill="url(#hvY)"/><path d="M12 74L18 28l24 24 8-30 8 30 24-24 6 46z" fill="url(#hvH)"/><rect x="12" y="74" width="76" height="12" rx="5" fill="#d79a24"/><circle cx="50" cy="60" r="5" fill="#e0405f"/><circle cx="30" cy="64" r="4" fill="#4a8fd8"/><circle cx="70" cy="64" r="4" fill="#4a8fd8"/>`,
  candle:`<rect x="36" y="40" width="28" height="50" rx="7" fill="#fff6dc"/><rect x="36" y="40" width="28" height="50" rx="7" fill="url(#hvH)"/><path d="M50 8c2 8 12 12 12 22a12 12 0 0 1-24 0c0-6 4-8 6-14 2 4 4 4 6 2z" fill="url(#hvO)"/><path d="M50 22c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 2 2 3 2 3 1z" fill="url(#hvY)"/><path d="M50 40v-6" stroke="#6b4a2a" stroke-width="3"/>`,
  cap:`<path d="M50 20L94 40 50 60 6 40z" fill="url(#hvN)"/><path d="M26 52v18c0 6 48 6 48 0V52L50 64z" fill="#3c3f9e"/><path d="M88 43v26" stroke="#ffd36b" stroke-width="4" stroke-linecap="round"/><circle cx="88" cy="72" r="5" fill="url(#hvY)"/>`,
  calendar:`<rect x="12" y="18" width="76" height="70" rx="12" fill="#fff"/><path d="M12 30a12 12 0 0 1 12-12h52a12 12 0 0 1 12 12v10H12z" fill="url(#hvR)"/><rect x="28" y="8" width="9" height="20" rx="4" fill="#9aa3b2"/><rect x="63" y="8" width="9" height="20" rx="4" fill="#9aa3b2"/><g fill="#b7c3de"><rect x="24" y="50" width="12" height="10" rx="3"/><rect x="44" y="50" width="12" height="10" rx="3"/><rect x="64" y="50" width="12" height="10" rx="3"/><rect x="24" y="68" width="12" height="10" rx="3"/><rect x="44" y="68" width="12" height="10" rx="3" fill="#e3b45c"/></g>`,
  halo:`<ellipse cx="50" cy="16" rx="22" ry="7" fill="none" stroke="url(#hvY)" stroke-width="6"/><circle cx="50" cy="56" r="30" fill="url(#hvS)"/><circle cx="50" cy="56" r="30" fill="url(#hvH)"/><circle cx="39" cy="54" r="3.6" fill="#3a2a1a"/><circle cx="61" cy="54" r="3.6" fill="#3a2a1a"/><path d="M40 66q10 9 20 0" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="63" r="5" fill="#ff9aa6" opacity=".6"/><circle cx="68" cy="63" r="5" fill="#ff9aa6" opacity=".6"/>`,
  heart:`<path d="M50 88C16 62 8 42 12 28c4-14 24-18 38-4 14-14 34-10 38 4 4 14-4 34-38 60z" fill="url(#hvR)"/><path d="M50 88C16 62 8 42 12 28c4-14 24-18 38-4 14-14 34-10 38 4 4 14-4 34-38 60z" fill="url(#hvH)"/>`,
  pig:`<circle cx="24" cy="26" r="11" fill="#f4a3b4"/><circle cx="76" cy="26" r="11" fill="#f4a3b4"/><circle cx="50" cy="52" r="36" fill="#f9bccb"/><circle cx="50" cy="52" r="36" fill="url(#hvH)"/><ellipse cx="50" cy="62" rx="16" ry="12" fill="#f08aa0"/><circle cx="44" cy="62" r="3" fill="#a03a55"/><circle cx="56" cy="62" r="3" fill="#a03a55"/><circle cx="36" cy="44" r="4" fill="#3a2a1a"/><circle cx="64" cy="44" r="4" fill="#3a2a1a"/>`,
  palm:`<path d="M52 92c-4-20-2-40 6-58" stroke="#a8683a" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="url(#hvG)"><ellipse cx="30" cy="34" rx="24" ry="9" transform="rotate(-28 30 34)"/><ellipse cx="78" cy="30" rx="24" ry="9" transform="rotate(26 78 30)"/><ellipse cx="38" cy="18" rx="22" ry="8" transform="rotate(-62 38 18)"/><ellipse cx="68" cy="16" rx="22" ry="8" transform="rotate(60 68 16)"/><ellipse cx="54" cy="28" rx="20" ry="8" transform="rotate(-8 54 28)"/></g>`,
  cards:`<rect x="12" y="22" width="48" height="62" rx="9" fill="url(#hvB)" transform="rotate(-12 36 53)"/><rect x="40" y="16" width="48" height="62" rx="9" fill="#fff" transform="rotate(10 64 47)"/><path d="M64 30l5 10 11 1.5-8 8 2 11-10-5.5-10 5.5 2-11-8-8 11-1.5z" fill="url(#hvY)" transform="rotate(10 64 47)"/>`,
  abc:`<rect x="10" y="16" width="80" height="68" rx="14" fill="url(#hvB)"/><rect x="10" y="16" width="80" height="68" rx="14" fill="url(#hvH)"/><text x="50" y="62" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#fff">abc</text>`
});
const CLAYMAP=Object.assign({'📅':'calendar'},{"🎶":"note","🎵":"note","🧸":"teddy","🎈":"balloon","🦁":"lion","🕊":"dove","⛪":"church","✝":"cross","🌍":"globe","🔥":"flame","🛡":"shield","👑":"crown","🕯":"candle","🎓":"cap","🗓":"calendar","😇":"halo","💙":"heart","🐖":"pig","🌴":"palm","🃏":"cards","🔤":"abc","⭐":"star","📖":"book","🏆":"trophy","🎮":"game","🌙":"moon","🎨":"palette"});
window.HV_CLAY=CLAY;window.HV_CLAYMAP=CLAYMAP;
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
  sunset:'<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/>',
  calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  tools:'<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.5 2.5-2.2-.6-.6-2.2z"/>',
  login:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10"/>',
  play2:'<path d="M8 5l11 7-11 7z"/>',
  starline:'<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 17l-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/>'
};
/* 3D clay pictures made for the main icons (icons3d/NAME.webp and NAME@2x.webp). Used from 40 px up; small sizes keep the drawn icon. */
const IMG3D=new Set(["book","game","trophy","notes","megaphone","calendar","palette","moon","star","cross","church","dove","pray","user","toolbox","lock"]);
window.HV_IMG3D=IMG3D;
window.hvIcon=function(name,size,alt){
  size=size||24;
  if(IMG3D.has(name)&&size>=40)return `<img class="hvi img3d" src="icons3d/${name}.webp" srcset="icons3d/${name}.webp 1x, icons3d/${name}@2x.webp 2x" width="${size}" height="${size}" decoding="async" ${alt?`alt="${alt}"`:`alt="" aria-hidden="true"`}>`;
  if(CLAY[name])return `<svg class="hvi clay" viewBox="0 0 100 100" width="${size}" height="${size}" filter="url(#hvD)" ${alt?`role="img" aria-label="${alt}"`:'aria-hidden="true"'}>${CLAY[name]}</svg>`;
  if(LINE[name])return `<svg class="hvi line" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${alt?`role="img" aria-label="${alt}"`:'aria-hidden="true"'}>${LINE[name]}</svg>`;
  return "";
};
window.hvThemeButton=function(){return ""};

/* ---------- bottom tab bar ---------- */
const TABS=[["home","home","Home"],["learn","media","Learn"],["play","games","Play"],["me","me","Me"]];
const GROUP={ // route prefix -> tab
  home:"home",media:"learn",m:"learn",bible:"learn",b:"learn",verse:"learn",vp:"learn",calendar:"learn",
  games:"play",quizzes:"play",coloring:"play",arena:"play",bedtime:"play",pray:"home",perm:"me",
  lumi:"lumi",profile:"me",kids:"me",me:"me",attendance:"me",attsheet:"me",login:"me",servants:"me",events:"home",news:"home"};
const SHOW=new Set(["home","media","m","b","news","games","quizzes","bible","verse","calendar","events","kids","profile","me","attendance","bedtime","pray","perm","coloring","servants","login","arena"]);
const route=()=>{const h=decodeURIComponent(location.hash.slice(1)||"home");return {h,k:h.split("-")[0]}};
let bar=null,ind=null;
function hasLumi(){return !!(window.hvAiUrl&&hvAiUrl())}
function buildBar(){
  bar=document.createElement("nav");bar.id="tabbar";bar.setAttribute("aria-label","Main");
  const tabs=TABS;
  bar.style.setProperty("--n",tabs.length);
  bar.innerHTML=`<i class="tb-ind" aria-hidden="true"></i>`+tabs.map(t=>`<a class="tb" href="#${t[1]}" data-tab="${t[0]}">${hvIcon(t[0],26)}<span>${t[2]}</span></a>`).join("");
  document.body.appendChild(bar);ind=bar.querySelector(".tb-ind");
  bar.addEventListener("click",()=>{try{navigator.vibrate&&navigator.vibrate(10)}catch{}});
}
let _fy=0;function fabScroll(){/* Lumi stays on screen while scrolling */}
addEventListener("scroll",fabScroll,{passive:true});addEventListener("hashchange",()=>{const b=document.getElementById("lmfab");if(b){b.classList.remove("away");_fy=0}});
function fab(show){
  let b=document.getElementById("lmfab");
  if(!hasLumi()||!window.hvLumiSvg){if(b)b.hidden=true;return}
  if(!b){b=document.createElement("button");b.id="lmfab";b.className="lm-fab";b.setAttribute("aria-label","Ask Lumi, questions about God and the Church");
    b.innerHTML=`<span class="lm-fab-i" aria-hidden="true">${hvLumiSvg("happy",40)}</span><b>Ask Lumi</b>`;b.onclick=()=>{try{localStorage.setItem("hv_lumi_tapped","1")}catch{}location.hash="lumi"};try{if(!localStorage.getItem("hv_lumi_tapped"))b.classList.add("lab")}catch{}document.body.appendChild(b)}
  b.hidden=!show}
function updateBar(){
  if(!bar)return;
  const {h,k}=route();
  const show=SHOW.has(k)&&!(k==="b"&&/^b-.+-\d+$/.test(h));
  bar.hidden=!show;fab(show);document.body.classList.toggle("hasTabs",show);
  const cur=GROUP[k]||"";
  const tabs=[...bar.querySelectorAll(".tb")];
  tabs.forEach((t,i)=>{const on=t.dataset.tab===cur;t.classList.toggle("on",on);if(on){t.setAttribute("aria-current","page");ind.style.transform=`translateX(${i*100}%)`;ind.style.opacity=1}else t.removeAttribute("aria-current")});
  if(!tabs.some(t=>t.classList.contains("on")))ind.style.opacity=0;
}
function init(){buildBar();updateBar();addEventListener("hashchange",updateBar);
  document.addEventListener("click",e=>{if(e.target.closest("#sbTheme")){const m=MODES[(MODES.indexOf(getTheme())+1)%MODES.length];setTheme(m);const bt=document.getElementById("sbTheme");if(bt){bt.innerHTML=hvIcon(MODE_ICON[m],22);bt.setAttribute("aria-label","Change the look. Now: "+MODE_NAME[m])}if(window.toast)toast("Look: "+MODE_NAME[m])}});
  /* the Lumi tab appears once the helper link is known (aihelper.js loads after this file) */
  setTimeout(updateBar,0)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
.hvi{display:block;flex:none}
:root[data-theme][data-tone="dusk"]{
  --bg:#2c3270;--surface:#3b4284;--ink:#fff7ea;--muted:#d2d3f0;--gold:#f3c56a;--gold-soft:#4d4673;--sky-soft:#3a5a96;--line:#5a609e;--shadow:0 8px 22px rgba(18,20,70,.42);
  --bg-base:#2a2f6b;--sky-top:#1f2b66;--sky-mid:#5a56a3;--sky-bot:#d98aa8;
  --aur1:rgba(255,200,110,.55);--aur2:rgba(120,170,255,.42);--aur3:rgba(235,140,205,.36);
  --rays:rgba(255,222,150,.26);--halo:rgba(255,205,120,.66);--cloud:rgba(255,236,226,.2);--stars-op:1;--grain-op:.05;
  --glass:rgba(58,64,128,.6);--glass-b:rgba(255,255,255,.2);--glass-hi:rgba(255,255,255,.14);--sh:0 12px 30px -14px rgba(14,16,60,.65)}
:root[data-theme][data-tone="dusk"] .sk-px .au1{opacity:1}
:root[data-theme][data-tone="dusk"] .rays{opacity:.6}
.lookrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.lookrow button{min-height:44px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-weight:800}.lookrow button[aria-pressed="true"]{background:var(--gold-soft);border-color:var(--gold)}
#tabbar{position:fixed;left:0;right:0;bottom:0;z-index:900;display:grid;grid-template-columns:repeat(var(--n,5),1fr);padding:8px 8px calc(10px + env(safe-area-inset-bottom));background:var(--glass);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%);border-top:1px solid var(--glass-b);box-shadow:0 -10px 30px -18px rgba(0,0,0,.4)}
#tabbar[hidden]{display:none}
#tabbar .tb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:52px;color:var(--muted,#6f6a73);text-decoration:none;font-weight:800;font-size:.74rem;position:relative;-webkit-tap-highlight-color:transparent;transition:color .2s}
#tabbar .tb svg{transition:transform .2s cubic-bezier(.34,1.56,.64,1),fill .2s}
#tabbar .tb.on{color:var(--gold-d,#b9822a)}
:root[data-theme="dark"] #tabbar .tb.on{color:#e3b45c}
#tabbar .tb.on svg{transform:translateY(-2px) scale(1.08);fill:rgba(227,180,92,.28)}
#tabbar .tb:active svg{transform:scale(.9)}
#tabbar .tb-ind{position:absolute;left:8px;top:0;width:calc((100% - 16px) / var(--n,5));height:4px;display:flex;justify-content:center;pointer-events:none;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s}
#tabbar .tb-ind::after{content:"";width:28px;height:4px;border-radius:0 0 4px 4px;background:#e3b45c;box-shadow:0 0 10px rgba(227,180,92,.7)}
body.hasTabs #app{padding-bottom:calc(150px + env(safe-area-inset-bottom))!important}
@media (min-width:900px){
  #tabbar{left:0;right:auto;top:0;bottom:0;width:92px;grid-template-columns:1fr;align-content:center;gap:6px;padding:16px 8px;border-top:0;border-right:1px solid var(--glass-b);box-shadow:10px 0 30px -18px rgba(0,0,0,.4)}
  #tabbar .tb-ind{display:none}
  #tabbar .tb.on{background:rgba(227,180,92,.2);border-radius:18px}
  body.hasTabs #app{padding-bottom:40px!important;margin-left:max(92px,calc((100vw - 1100px)/2 + 92px))}
}
.lm-fab{position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:950;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;padding:0;cursor:pointer;min-width:52px;min-height:52px;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .2s}.lm-fab[hidden]{display:none}
.lm-fab.away{transform:translateY(24px);opacity:0;pointer-events:none}
.lm-fab-i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--glass);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 0 2px rgba(243,197,106,.85),0 8px 20px -6px rgba(10,12,50,.6),0 0 18px rgba(243,197,106,.35);transition:transform .15s}.lm-fab-i .lumi-svg{filter:none;width:40px;height:40px}.lm-fab:active .lm-fab-i{transform:scale(.92)}
.lm-fab b{font-size:.68rem;font-weight:900;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.7);white-space:nowrap;display:none}.lm-fab.lab b{display:block}
@media (min-width:900px){.lm-fab{bottom:24px;right:max(24px,calc((100vw - 1100px)/2 + 12px))}}
.shellbar{position:relative;z-index:6}
.hubhead,.hubhead::before{pointer-events:none}
.sb-theme{width:44px;height:44px;min-height:44px;border-radius:50%;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);display:grid;place-items:center;padding:0}
.sb-bell svg,.sb-login svg{display:inline-block;vertical-align:-4px}
.sb-login{display:inline-flex;align-items:center;gap:8px}
.sb-stars i svg{color:#d79a24;fill:#f6c453}
.sb-stars i{display:inline-grid;place-items:center}
/* Home: greeting, continue card, doors, Lumi tip */
.hubhead img{width:min(190px,50vw);filter:drop-shadow(0 0 22px rgba(255,205,110,.65)) brightness(1.06)}
.hubhead .tag{display:none}
.greet{margin:2px 0 16px;text-align:center}.greet h1{font-size:var(--fs-xl);line-height:1.15}.greet p{margin:2px 0 0;font-weight:700;color:var(--muted,#6f6a73)}
.cont2{display:flex;gap:12px;align-items:center;width:100%;padding:12px;border-radius:24px;border:1px solid var(--glass-b);background:linear-gradient(135deg,rgba(124,196,234,.30),var(--glass));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:var(--ink);text-align:left;font:inherit;margin-bottom:14px;min-height:76px;box-shadow:var(--sh)}
.cont2 .th{width:96px;height:64px;border-radius:14px;overflow:hidden;flex:none;background:linear-gradient(135deg,#2f6fb8,#7cc4ea);display:grid;place-items:center;position:relative}
.cont2 .th img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.cont2 .th .pl{position:relative;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.92);color:#2f6fb8;display:grid;place-items:center}
.cont2 small{display:block;font-weight:800;color:var(--muted,#6f6a73);font-size:.8rem}.cont2 b{display:block;font-size:var(--fs-m);line-height:1.2}
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

/* ---------- emoji swapper: shows the line icons (design-icons.js) instead of phone emojis in the app screens ----------
   Keeps emojis inside text people typed (data-keep, inputs, kid chat bubbles, the avatar picker). Unknown emojis are left alone. */
const EMO=/(?:\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)/gu;
const SKIP="textarea,input,select,option,script,style,svg,canvas,[contenteditable],[data-keep],.avs,.lm-kb,.sb-av,.pf-av,.hve";
const BIGCTX=".title-row,.tile .ic,.upi,.saintic,.em,.evi,.evbig,.ani,.mdoor .big,.ds-badge i,.kc-badges i,.soonbox .em,.ds-empty .em,.empty,.fe,.tcard .em,.tile .nm,.ic,.here,.kc-stars,.note";
function bigSpot(el){if(!el)return false;if(el.closest(BIGCTX))return true;try{return parseFloat(getComputedStyle(el).fontSize)>=28}catch{return false}}
function emoSvg(e,big){
  const k=e.replace(/\uFE0F/g,"");
  if(k==="🐑"&&window.hvLumiSvg)return `<i class="hve hve-lumi" role="img" aria-label="Lumi">${hvLumiSvg("happy",26)}</i>`;
  const cl=CLAYMAP[k];if(cl&&CLAY[cl]&&big)return `<i class="hve hve-clay" aria-hidden="true">${hvIcon(cl,64)}</i>`;
  const dot=window.HV_DOTS&&HV_DOTS[k];if(dot)return `<i class="hve hve-dot" aria-hidden="true" style="--c:${dot}"></i>`;
  const m=window.HV_EMOJI&&HV_EMOJI[k],inner=m&&window.HV_LUCIDE&&HV_LUCIDE[m[0]];if(!inner)return null;
  return `<i class="hve${m[1]?" col":""}" aria-hidden="true"${m[1]?` style="color:${m[1]}"`:""}><svg viewBox="0 0 24 24">${inner}</svg></i>`;
}
function swap(root){
  if(!window.HV_EMOJI||!root||root.nodeType!==1&&root.nodeType!==11)return;
  const base=root.nodeType===1?root:root.firstElementChild&&root;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    if(!n.nodeValue||!/\p{Extended_Pictographic}/u.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
    const p=n.parentElement;return p&&!p.closest(SKIP)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const list=[];while(w.nextNode())list.push(w.currentNode);
  list.forEach(n=>{
    const big=bigSpot(n.parentElement);
    const t=n.nodeValue;let last=0,html="",changed=false;
    t.replace(EMO,(e,i)=>{const s=emoSvg(e,big);if(s){html+=escT(t.slice(last,i))+s;last=i+e.length;changed=true}return e});
    if(!changed)return;html+=escT(t.slice(last));
    const sp=document.createElement("span");sp.className="hvs";sp.innerHTML=html;n.replaceWith(...sp.childNodes)});
}
const escT=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
window.hvSwapEmoji=swap;
let pend=new Set(),tick=0;
function queue(n){pend.add(n);if(!tick)tick=requestAnimationFrame(()=>{tick=0;const l=[...pend];pend.clear();l.forEach(x=>{if(x.isConnected)swap(x)})})}
function startSwap(){swap(document.body);new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(n=>{if(n.nodeType===1&&!n.classList.contains("hve"))queue(n);else if(n.nodeType===3&&n.parentElement)queue(n.parentElement)})}}).observe(document.body,{childList:true,subtree:true})}
const ST2=document.createElement("style");
ST2.textContent=`.hve{display:inline-block;width:1.18em;height:1.18em;vertical-align:-.22em;line-height:1;flex:none;font-style:normal}
.hve svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.hve.col svg{fill:currentColor;fill-opacity:.2}
.hve-clay{width:1.4em;height:1.4em;vertical-align:-.3em}.title-row .hve-clay{width:52px;height:52px}.note .hve-clay,.tile .nm .hve-clay,.kc-stars .hve-clay{width:28px;height:28px;vertical-align:-.45em}.here .hve-clay{width:56px;height:56px}.title-row>span{font-size:2.4rem!important}.upi .hve-clay,.upi svg{width:40px;height:40px}.saintic .hve-clay{width:64px;height:64px}.hve-clay svg{width:100%;height:100%;fill:initial;stroke:none}
.tile .ic{font-size:2.3rem}
:root[data-theme="dark"] .hve.col{filter:brightness(1.5) saturate(1.1)}
.hve-dot{width:.8em;height:.8em;border-radius:50%;background:var(--c);vertical-align:-.05em;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.hve-lumi{width:1.5em;height:1.5em;vertical-align:-.45em}.hve-lumi svg{stroke:none;fill:initial;width:100%;height:100%}.hve-lumi svg *{stroke-width:revert}`;
document.head.appendChild(ST2);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startSwap);else startSwap();

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
  return `<button class="tipbub" data-go="${hasLumi()?"lumi":"home"}"><span class="tb-face" aria-hidden="true">${hvLumiSvg("happy",56)}</span><span class="tb-bub"><small>Lumi says</small><p>${tip}</p>${hasLumi()?`<span class="tb-ask">Ask now</span>`:""}</span></button>`};
})();
