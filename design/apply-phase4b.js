/* Phase 4b: the Bible (tabs, groups, search, recently read) and a better reading view. Already applied; kept to read the change. */
const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');
const a0 = h.indexOf('function bible(){');
const a1 = h.indexOf('function bibleBook(name)');
if (a0 < 0 || a1 < 0) throw new Error('bible() not found');
const bibleNew = `const BGROUPS=[["Law",0,5,"#d98a2b"],["History",5,17,"#4a8fd8"],["Wisdom",17,22,"#8e6bd1"],["Prophets",22,39,"#e8584f"],["Gospels",39,43,"#3fae6a"],["Acts",43,44,"#2eb5a6"],["Letters",44,65,"#e3b45c"],["Revelation",65,66,"#d4553b"]];
function bible(){const last=store.get("lastRead",null),recent=store.get("recent",[]),tab=store.get("btab","ot");
  const grp=g=>\`<section class="bgrp" style="--gc:\${g[3]}"><h3><i></i>\${g[0]}<small>\${g[2]-g[1]} books</small></h3><div class="books">\${BOOKS.slice(g[1],g[2]).map(b=>\`<button class="bk" data-book="\${b[0].toLowerCase()}" data-go="b-\${encodeURIComponent(b[0])}">\${b[0]}<small>\${b[1]} ch</small></button>\`).join("")}</div></section>\`;
  app.innerHTML=\`\${topbar("The Bible","📖","Choose a book","home",["66 books",last?"Reading "+esc(last.b)+" "+last.c:""])}
  \${last?\`<button class="bcont" data-go="b-\${encodeURIComponent(last.b)}-\${last.c}"><span aria-hidden="true">\${hvIcon("book",36)}</span><span><small>Continue reading</small><b>\${esc(last.b)} \${last.c}</b></span><i>Open</i></button>\`:""}
  \${recent.length?\`<div class="brec" aria-label="Recently read"><small>Recently read</small>\${recent.map(r=>\`<button class="ds-chip" data-go="b-\${encodeURIComponent(r.b)}-\${r.c}">\${esc(r.b)} \${r.c}</button>\`).join("")}</div>\`:""}
  <label class="search"><span aria-hidden="true">🔍</span><input id="bq" type="search" placeholder="Find a book (e.g. John, Psalms)" autocomplete="off"></label>
  <div class="ds-seg bseg" id="btab" role="tablist"><button data-t="ot" aria-pressed="\${tab==="ot"}" role="tab">Old Testament</button><button data-t="nt" aria-pressed="\${tab==="nt"}" role="tab">New Testament</button></div>
  <div id="bgroups">\${BGROUPS.filter(g=>tab==="ot"?g[1]<39:g[1]>=39).map(grp).join("")}</div>
  <div id="bres" class="books" hidden></div>\`;
  $("#btab").onclick=e=>{const b=e.target.closest("[data-t]");if(!b)return;store.set("btab",b.dataset.t);bible()};
  $("#bq").addEventListener("input",e=>{const t=e.target.value.trim().toLowerCase(),res=$("#bres"),gr=$("#bgroups");
    if(!t){res.hidden=true;gr.hidden=false;return}
    const m=BOOKS.filter(b=>b[0].toLowerCase().includes(t));
    res.innerHTML=m.length?m.map(b=>\`<button class="bk" data-go="b-\${encodeURIComponent(b[0])}">\${b[0]}<small>\${b[1]} ch</small></button>\`).join(""):\`<div class="empty">No book matches "\${esc(e.target.value)}"</div>\`;res.hidden=false;gr.hidden=true})}
`;
h = h.slice(0, a0) + bibleNew + h.slice(a1);

/* bibleBook: chips */
h = h.replace('app.innerHTML=`${topbar(b[0],"📖","Choose a chapter","bible")}<div class="chaps">', 'app.innerHTML=`${topbar(b[0],"📖","Choose a chapter","bible",[b[1]+" chapters"])}<div class="chaps">');

/* bibleRead: compact header, progress bar, floating pill, swipe, recently read */
const r0 = h.indexOf('async function bibleRead(name,ch){');
const r1 = h.indexOf('/* ================= HELPERS ================= */');
const readNew = `async function bibleRead(name,ch){const b=BOOKS.find(x=>x[0]===name);if(!b)return bible();ch=Math.min(Math.max(1,ch),b[1]);
  const fs=store.get("fs",1.08),bt=store.get("bt","web")==="kjv"?"kjv":"web";store.set("lastRead",{b:name,c:ch});
  store.set("recent",[{b:name,c:ch}].concat(store.get("recent",[]).filter(r=>r.b!==name)).slice(0,5));
  if(window.hvAward)hvAward("bible",name+"-"+ch,name+" "+ch);
  const bi=BOOKS.indexOf(b),prev=ch>1?[name,ch-1]:bi>0?[BOOKS[bi-1][0],BOOKS[bi-1][1]]:null,next=ch<b[1]?[name,ch+1]:bi<BOOKS.length-1?[BOOKS[bi+1][0],1]:null;
  const gt=x=>x?\`b-\${encodeURIComponent(x[0])}-\${x[1]}\`:"";
  const link=(x,l)=>x?\`<button class="btn alt" data-go="\${gt(x)}">\${l}</button>\`:"";
  app.innerHTML=\`<div class="rprog" aria-hidden="true"><i id="rpi"></i></div>
  <div class="topbar hvbar"><button class="back" data-go="b-\${encodeURIComponent(name)}">← Back</button><span class="hvmini" aria-hidden="true"><b>\${name} \${ch}</b></span></div>
  <header class="chead"><small>\${bt==="kjv"?"King James Version":"World English Bible"}</small><h1>\${name} \${ch}</h1><i class="orn" aria-hidden="true"></i></header>
  <article class="reader" id="rd" style="--fs:\${fs}rem"><p class="tag">Loading…</p></article>
  <div class="navrow">\${link(prev,"‹ Previous")}\${link(next,"Next ›")}</div>
  <a class="btn alt" href="https://www.biblegateway.com/passage/?search=\${encodeURIComponent(name+" "+ch)}&version=NKJV" target="_blank" rel="noopener">Read in NKJV ↗</a>
  <div class="rpill" role="toolbar" aria-label="Reading options"><div class="seg" role="group" aria-label="Translation"><button data-bt="web" aria-pressed="\${bt==="web"}">WEB</button><button data-bt="kjv" aria-pressed="\${bt==="kjv"}">KJV</button></div><span class="rsep"></span><div class="seg" role="group" aria-label="Text size"><button data-fs="-1" aria-label="Smaller text">A−</button><button data-fs="1" aria-label="Bigger text">A+</button></div></div>\`;
  app.querySelectorAll("[data-bt]").forEach(x=>x.onclick=()=>{store.set("bt",x.dataset.bt);bibleRead(name,ch)});
  app.querySelectorAll("[data-fs]").forEach(x=>x.onclick=()=>{let f=store.get("fs",1.08)+(+x.dataset.fs)*.1;f=Math.min(1.8,Math.max(.9,f));store.set("fs",f);$("#rd").style.setProperty("--fs",f+"rem")});
  /* reading progress and swipe between chapters */
  const pr=()=>{const i=document.getElementById("rpi");if(!i){removeEventListener("scroll",pr);return}const m=document.documentElement.scrollHeight-innerHeight;i.style.width=(m>0?Math.min(100,scrollY/m*100):0)+"%"};
  addEventListener("scroll",pr,{passive:true});
  const rd=$("#rd");let sx=0,sy=0,st=0;
  rd.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
  rd.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Date.now()-st<700&&Math.abs(dx)>90&&Math.abs(dx)>Math.abs(dy)*2){const t=dx<0?next:prev;if(t)go(gt(t))}});
  try{const r=await fetch(\`https://bible-api.com/\${encodeURIComponent(name+" "+ch)}?translation=\${bt}\`);const j=await r.json();if(!j.verses)throw 0;
    $("#rd").innerHTML=j.verses.map(v=>\`<sup>\${v.verse}</sup>\${esc(v.text.trim())} \`).join("")}
  catch{const rd=$("#rd");if(rd)rd.innerHTML=\`<p class="err">Couldn't load this chapter. Check your internet, or tap "Read in NKJV".</p>\`}}

`;
h = h.slice(0, r0) + readNew + h.slice(r1);
h = h.replace(/layout2\.css\?v=(\d+)/, (m, v) => 'layout2.css?v=' + (+v + 1));
fs.writeFileSync('index.html', h);

let c = fs.readFileSync('layout2.css', 'utf8');
c += `
/* ---------- Phase 4b: the Bible ---------- */
.bcont{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:10px 16px;margin-bottom:12px;border-radius:20px;border:1px solid rgba(243,197,106,.6);background:linear-gradient(135deg,rgba(243,197,106,.28),var(--glass));color:var(--ink);font:inherit;text-align:left}
.bcont>span:nth-child(2){flex:1;display:flex;flex-direction:column}.bcont small{color:var(--muted);font-weight:800}.bcont b{font-family:var(--display);font-size:1.1rem}.bcont i{font-style:normal;padding:6px 14px;border-radius:999px;background:var(--gold);color:#2b1d05;font-weight:900;font-size:.82rem}
.brec{display:flex;align-items:center;gap:8px;overflow-x:auto;margin:0 -16px 12px;padding:0 16px;scrollbar-width:none}.brec::-webkit-scrollbar{display:none}.brec small{flex:none;color:var(--muted);font-weight:800}.brec .ds-chip{flex:none}
.bseg{width:100%;margin:6px 0 4px}.bseg button{flex:1}
.bgrp{margin-top:14px}.bgrp h3{display:flex;align-items:center;gap:8px;font-family:var(--display);font-size:1.05rem;margin-bottom:8px}.bgrp h3 i{width:12px;height:12px;border-radius:50%;background:var(--gc);box-shadow:0 0 10px var(--gc)}.bgrp h3 small{margin-left:auto;color:var(--muted);font-family:var(--body);font-weight:800;font-size:.76rem}
.books{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.bk{position:relative;display:flex;flex-direction:column;gap:0;min-height:52px;padding:8px 12px 8px 16px;border:1px solid var(--glass-b);border-radius:14px;background:var(--glass);color:var(--ink);text-align:left;font:inherit;font-weight:800;overflow:hidden}
.bgrp .bk::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--gc)}.bk small{color:var(--muted);font-weight:700;font-size:.72rem}
@media (min-width:700px){.books{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}
.rprog{position:fixed;left:0;right:0;top:0;height:4px;z-index:60;background:rgba(255,255,255,.12)}.rprog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffe29a,#e3b45c);box-shadow:0 0 8px rgba(243,197,106,.8)}
.chead{text-align:center;margin:10px 0 14px}.chead small{color:var(--muted);font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:.72rem}.chead h1{font-size:var(--fs-xl);margin:2px 0 6px}
.orn{display:block;height:14px;width:140px;margin:0 auto;background:linear-gradient(90deg,transparent,#e3b45c 30%,#e3b45c 70%,transparent) center/100% 2px no-repeat;position:relative}.orn::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;background:#e3b45c;transform:rotate(45deg)}
.reader{line-height:1.95!important;font-size:var(--fs,1.08rem);max-width:68ch;margin-inline:auto}.reader sup{color:var(--gold);font-weight:900;font-size:.7em;margin:0 3px 0 6px}
.rpill{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:var(--glass);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--glass-b);box-shadow:0 10px 24px -10px rgba(0,0,0,.6)}
.rpill .seg{display:flex;gap:4px}.rpill .seg button{min-width:44px;min-height:44px;border-radius:999px;border:0;background:transparent;color:var(--ink);font-weight:900}.rpill .seg button[aria-pressed="true"]{background:var(--gold);color:#2b1d05}.rsep{width:1px;height:24px;background:var(--glass-b)}
.reader+.navrow{margin-bottom:84px}
`;
fs.writeFileSync('layout2.css', c);
console.log('4b done');
