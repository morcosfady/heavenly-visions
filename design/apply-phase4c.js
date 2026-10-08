/* Phase 4c: Calendar (list or month view, a sheet for a day, glowing feasts, fasting bands, a clay icon on the top card). Already applied. */
const fs = require('fs');
let s = fs.readFileSync('faith.js', 'utf8');
const R = (a, b) => { if (a instanceof RegExp ? !a.test(s) : !s.includes(a)) console.log('MISSING: ' + String(a).slice(0, 80)); s = s.replace(a, () => b) };

/* top card: a clay icon of today's feast, saint or the calendar */
R('<section class="card tcal"><div class="tag">', '<section class="card tcal"><span class="tcal-ic" aria-hidden="true">${window.hvCalIcon?(hvCalIcon((fe||sa||{}).id,"",84)||hvIcon("calendar",84)):""}</span><div class="tag">');
/* a view toggle */
R('<section class="card sec"><h2>Coming up</h2><div class="list">', '<div class="ds-seg calseg" id="calview" role="tablist"><button data-v="list" role="tab">Coming up</button><button data-v="month" role="tab">Month</button></div>\n  <section class="card sec" id="calup"><h2>Coming up</h2><div class="list">');
R('<section class="card sec"><div class="calnav">', '<section class="card sec" id="calmonth"><div class="calnav">');
R('  drawMonth();if(window.hvLoadEvents)', '  const setView=v=>{CALVIEW=v;try{localStorage.setItem("hv_calview",v)}catch{}document.getElementById("calup").hidden=v!=="list";document.getElementById("calmonth").hidden=v!=="month";document.querySelectorAll("#calview button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v))};\n  document.getElementById("calview").onclick=e=>{const b=e.target.closest("[data-v]");if(b)setView(b.dataset.v)};setView(CALVIEW);\n  drawMonth();if(window.hvLoadEvents)');
R('let CALM=null,CALSEL="";', 'let CALM=null,CALSEL="",CALVIEW=(()=>{try{return localStorage.getItem("hv_calview")==="month"?"month":"list"}catch{return "list"}})();');
/* cells: feast glow and fasting bands */
R('cells+=`<button class="cd ${diffDays(t,dt)===0?"now":""}${dkey(dt)===CALSEL?" sel":""}"', 'cells+=`<button class="cd ${diffDays(t,dt)===0?"now":""}${dkey(dt)===CALSEL?" sel":""}${e.some(x=>x.type==="feast")?" feast":""}${fast?" fastd":""}"');
/* a day opens a sheet */
const a = s.indexOf('document.getElementById("cday").innerHTML=`');
const b = s.indexOf('\n', a);
const line = s.slice(a, b);
const inner = line.match(/innerHTML=`([\s\S]*)`;try\{document\.getElementById\("cday"\)\.scrollIntoView[^\n]*$/);
if (!inner) console.log('MISSING: cday line shape');
else s = s.slice(0, a) + 'if(window.sheet)sheet(`<h3>${dt.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</h3><div class="tag">${c.day} ${c.name}, ${c.year} (Coptic)</div>' +
  inner[1].replace(/^<b>[\s\S]*?<\/b> \(\$\{c\.day\} \$\{c\.name\}\)/, '') + '`,"Day details");' + s.slice(b);
fs.writeFileSync('faith.js', s);

let h = fs.readFileSync('index.html', 'utf8');
h = h.replace(/faith\.js\?v=(\d+)/, (m, v) => 'faith.js?v=' + (+v + 1)).replace(/layout2\.css\?v=(\d+)/, (m, v) => 'layout2.css?v=' + (+v + 1));
fs.writeFileSync('index.html', h);

let c = fs.readFileSync('layout2.css', 'utf8');
c += `
/* ---------- Phase 4c: Calendar ---------- */
.tcal{position:relative;overflow:hidden}.tcal-ic{position:absolute;right:12px;top:10px;filter:drop-shadow(0 6px 12px rgba(0,0,0,.4));animation:hvfloat 5.5s ease-in-out infinite}
.tcal::before{content:"";position:absolute;right:-20px;top:-30px;width:180px;height:180px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,205,120,.5),transparent);pointer-events:none}
.calseg{width:100%;margin:6px 0 10px}.calseg button{flex:1}
.cd.feast{box-shadow:0 0 14px rgba(243,197,106,.7);border-color:rgba(243,197,106,.9)}
.cd.fastd{background:linear-gradient(180deg,rgba(142,107,209,.28),rgba(142,107,209,.12));border-color:rgba(142,107,209,.5)}
.cd.sel{z-index:1}
#cday{display:none}
@media (prefers-reduced-motion:reduce){.tcal-ic{animation:none}}
`;
fs.writeFileSync('layout2.css', c);
console.log('4c done');
