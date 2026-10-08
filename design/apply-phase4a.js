/* Phase 4a: Sunday School tiles with progress rings, nicer lesson rows, the lesson page. Already applied; kept to read the change. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => {
    if (a instanceof RegExp) { if (!a.test(s)) console.log('MISSING in ' + file + ': ' + a); s = s.replace(a, () => b) }
    else { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 80)); s = s.replace(a, () => b) }
  });
  fs.writeFileSync(file, s);
};

/* a green clay check that draws itself, used for "done" */
edit('clay2.js', [["  verse:'", "  check:'<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"url(#hvG)\"/><circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"url(#hvH)\"/><path class=\"ck\" d=\"M30 52l14 14 28-32\" stroke=\"#fff\" stroke-width=\"10\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" pathLength=\"1\"/>',\n  verse:'"]]);

edit('index.html', [
  /* class tiles with a progress ring */
  ['const n=CUR[s.id]?CUR[s.id].reduce((a,b)=>a+b[1].length,0):inSec(s.id).length;\n    return `<button class="tile ${n?"":"soon"}" style="--c:${s.c}" data-go="m-${s.id}"><span class="ic">${s.ic}</span>',
   'const n=CUR[s.id]?CUR[s.id].reduce((a,b)=>a+b[1].length,0):inSec(s.id).length,dn=CUR[s.id]?CUR[s.id].reduce((a,b)=>a+b[1].filter(l=>isDone(s.id,l[0])).length,0):0,pc=n?Math.round(dn/n*100):0;\n    return `<button class="tile ${n?"":"soon"}" style="--c:${s.c}" data-go="m-${s.id}">${CUR[s.id]&&n?`<span class="pring" style="--p:${pc}" role="img" aria-label="${dn} of ${n} lessons done"><b>${pc}%</b></span>`:""}<span class="ic">${s.ic}</span>'],
  /* lesson rows in a class: duration, done, new */
  ['const row=l=>{const v=lessonVids(s.id,l[0])[0],ti=`${isDone(s.id,l[0])?"✅ ":""}${l[0]} - ${esc(l[1])}`;\n    return v?`<button class="row" data-go="l-${s.id}-${l[0]}"><span class="thumb">${s.ic}<img src="https://i.ytimg.com/vi/${v[0]}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"></span><span style="min-width:0"><span class="t">${ti}</span></span></button>`',
   'const NEWV=["BHKgrAQCs3A","gMAFxDCTzr8","ZDRMmShq1jg"];\n  const row=l=>{const v=lessonVids(s.id,l[0])[0],dn=isDone(s.id,l[0]),ti=`${l[0]} - ${esc(l[1])}`;\n    return v?`<button class="row${dn?" isdone":""}" data-go="l-${s.id}-${l[0]}"><span class="thumb">${s.ic}<img src="https://i.ytimg.com/vi/${v[0]}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="dur">${v[2]}</span>${NEWV.includes(v[0])?`<span class="newb">New</span>`:""}</span><span style="min-width:0"><span class="t">${ti}</span>${dn?`<span class="dnchip">${hvIcon("check",16)} Done</span>`:""}</span></button>`'],
  /* lesson page */
  [/\$\{\(\(\)=>\{const vs=lessonVids\(g,n\),v=vs\[0\];if\(!v\)return `<div class="vcard soon">[\s\S]*?<small>\$\{esc\(v\[1\]\)\}<\/small><\/div><\/button>`\}\)\(\)\}/,
   '${(()=>{const vs=lessonVids(g,n),v=vs[0];if(!v)return `<div class="vhero soon">${hvScene("clap","sleepy",96)}<b>Video coming soon</b><small>Check back soon!</small></div>`;\n     return `<button class="vhero" ${vs.length>1?`data-go="lv-${g}-${n}"`:`data-v="${v[0]}"`} aria-label="${vs.length>1?"Watch the videos":"Watch the video"}"><img src="https://i.ytimg.com/vi/${v[0]}/hqdefault.jpg" alt=""><span class="vglow" aria-hidden="true"></span><span class="vplay2" aria-hidden="true">${hvIcon("play2",30)}</span><span class="vdur">${v[2]}</span><span class="vlab"><b>${vs.length>1?"Watch the videos ("+vs.length+")":"Watch the video"}</b><small>${esc(v[1])}</small></span></button>`})()}'],
  ['<button class="tile" style="--c:#3fae6a" data-la="verse" ${at}><span class="ic">📖</span><span class="nm">Bible verse</span></button>\n    <button class="tile" style="--c:#8e6bd1" data-la="quiz" ${at}><span class="ic">🏆</span><span class="nm">Quiz</span></button>\n    <button class="tile" style="--c:#d4553b" data-la="game" ${at}><span class="ic">🎮</span><span class="nm">Games</span></button>\n    <button class="tile" style="--c:#e3b45c" data-la="done" ${at}><span class="ic">${dn?"✅":"⬜"}</span><span class="nm">${dn?"Done!":"Mark as done"}</span></button>',
   '<button class="acard" style="--c:#3fae6a" data-la="verse" ${at}><span class="ai">${hvIcon("verse",52)}</span><span class="an"><b>Bible verse</b><small>Read it and learn it</small></span></button>\n    <button class="acard" style="--c:#8e6bd1" data-la="quiz" ${at}><span class="ai">${hvIcon("trophy",52)}</span><span class="an"><b>Quiz</b><small>Test what you learned</small></span></button>\n    <button class="acard" style="--c:#d4553b" data-la="game" ${at}><span class="ai">${hvIcon("game",52)}</span><span class="an"><b>Games</b><small>Play with the verse</small></span></button>\n    <button class="acard${dn?" done":""}" style="--c:#e3b45c" data-la="done" ${at} aria-pressed="${dn}"><span class="ai">${dn?hvIcon("check",52):`<span class="emptyck"></span>`}</span><span class="an"><b>${dn?"Done!":"Mark as done"}</b><small>${dn?"Great job. Tap to undo":"Earn stars for this lesson"}</small></span></button>'],
  [/\$\{staff\?`<a class="door d-games wide"[\s\S]*?For servants only<\/small><\/button>`\}/,
   '${staff?`<a class="curcard" href="https://drive.google.com/file/d/${CUR_PDF[g]}/view" target="_blank" rel="noopener"><span class="ai">${hvIcon("book",44)}</span><span class="an"><b>Curriculum material</b><small>${l[3]?"Open the book, page "+l[3]:"Open the book"}</small></span><span class="cg">Open</span></a>`\n   :`<button class="curcard locked" data-act="lockmsg"><span class="ai">${hvIcon("lock",44)}</span><span class="an"><b>Curriculum material</b><small>For servants only</small></span></button>`}']
]);
let h = fs.readFileSync('index.html', 'utf8');
h = h.replace(/layout2\.css\?v=(\d+)/, (m, v) => 'layout2.css?v=' + (+v + 1)).replace(/clay2\.js\?v=(\d+)/, (m, v) => 'clay2.js?v=' + (+v + 1));
fs.writeFileSync('index.html', h);

let c = fs.readFileSync('layout2.css', 'utf8');
c += `
/* ---------- Phase 4a: Sunday School and the lesson page ---------- */
.tile{position:relative}
.pring{position:absolute;right:12px;top:12px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--gold) calc(var(--p)*1%),rgba(255,255,255,.18) 0)}
.pring::before{content:"";position:absolute;inset:4px;border-radius:50%;background:var(--surface,#3b4284)}.pring b{position:relative;font-size:.62rem;font-weight:900}
.row .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.thumb .dur{position:absolute;right:6px;bottom:6px;padding:2px 7px;border-radius:8px;background:rgba(0,0,0,.65);color:#fff;font-size:.72rem;font-weight:800}
.newb{position:absolute;left:6px;top:6px;padding:2px 8px;border-radius:999px;background:linear-gradient(135deg,#ffd978,#e0a030);color:#2b1d05;font-size:.68rem;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.dnchip{display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:2px 10px 2px 4px;border-radius:999px;background:rgba(63,174,106,.2);color:#8fe0b0;font-weight:800;font-size:.74rem}
.row.isdone .thumb::after{content:"";position:absolute;inset:0;background:rgba(20,60,40,.28)}
.vhero{position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;padding:0;border-radius:26px;overflow:hidden;background:#111;box-shadow:0 18px 34px -16px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.16);color:#fff;text-align:left}
.vhero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vhero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(8,10,40,.82))}
.vglow{position:absolute;left:50%;top:44%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,220,140,.55),transparent);animation:hvpulse2 3s ease-in-out infinite}
@keyframes hvpulse2{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.1)}}
.vplay2{position:absolute;left:50%;top:44%;width:76px;height:76px;margin:-38px 0 0 -38px;z-index:2;border-radius:50%;display:grid;place-items:center;color:#2f6fb8;background:rgba(255,255,255,.95);box-shadow:0 0 0 6px rgba(255,255,255,.3),0 10px 24px rgba(0,0,0,.5);transition:transform .2s}
.vplay2 svg{margin-left:4px}.vhero:hover .vplay2,.vhero:active .vplay2{transform:scale(1.1)}
.vhero .vdur{position:absolute;right:12px;top:12px;z-index:2;padding:3px 10px;border-radius:999px;background:rgba(0,0,0,.6);font-weight:800;font-size:.8rem}
.vhero .vlab{position:absolute;z-index:2;left:16px;right:16px;bottom:12px;display:flex;flex-direction:column}.vhero .vlab b{font-family:var(--display);font-size:1.15rem}.vhero .vlab small{opacity:.85;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vhero.soon{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;background:var(--glass);aspect-ratio:auto;min-height:190px;padding:14px;border:1.5px dashed var(--glass-b);box-shadow:none}.vhero.soon::after{display:none}.vhero.soon small{opacity:.8}
.acard{display:flex;align-items:center;gap:12px;min-height:84px;padding:12px 14px;border-radius:22px;border:1px solid var(--glass-b);background:radial-gradient(130% 160% at 100% 0%,color-mix(in srgb,var(--c) 38%,transparent),transparent 62%),var(--glass);color:var(--ink);text-align:left;font:inherit;box-shadow:var(--sh);transition:transform .15s}
.acard:active{transform:scale(.97)}.acard .ai{flex:none;display:grid;place-items:center;width:56px;height:56px}.acard .an{display:flex;flex-direction:column;min-width:0}.acard .an b{font-family:var(--display);font-size:1.05rem}.acard .an small{color:var(--muted);font-weight:700}
.emptyck{width:40px;height:40px;border-radius:50%;border:3px dashed var(--gold)}
.acard.done{border-color:rgba(63,174,106,.8);box-shadow:0 0 22px rgba(63,174,106,.35),var(--sh)}
.acard.done .ck{stroke-dasharray:1;stroke-dashoffset:1;animation:hvdraw .6s .1s ease-out forwards}
@keyframes hvdraw{to{stroke-dashoffset:0}}
.row .dnchip svg .ck{stroke-dasharray:1;stroke-dashoffset:0}
.curcard{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:10px 14px;border-radius:20px;border:1px solid var(--glass-b);background:rgba(10,14,50,.38);color:var(--ink);text-align:left;font:inherit;text-decoration:none}
.curcard .ai{flex:none;display:grid;place-items:center;width:48px;height:48px}.curcard .an{flex:1;display:flex;flex-direction:column}.curcard .an b{font-family:var(--display)}.curcard small{color:var(--muted);font-weight:700}.curcard .cg{padding:6px 14px;border-radius:999px;background:var(--gold);color:#2b1d05;font-weight:900;font-size:.82rem}
.curcard.locked{opacity:.85}
@media (min-width:700px){.acard{min-height:92px}}
@media (prefers-reduced-motion:reduce){.vglow,.acard.done .ck{animation:none!important}.acard.done .ck{stroke-dashoffset:0}}
`;
fs.writeFileSync('layout2.css', c);
console.log('4a done');
