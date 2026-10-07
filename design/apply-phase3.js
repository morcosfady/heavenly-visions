/* Phase 3 (layout and structure) edits. Already applied; kept to read the change. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => {
    if (a instanceof RegExp) { if (!a.test(s)) console.log('MISSING in ' + file + ': ' + a); s = s.replace(a, () => b) }
    else { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 80)); s = s.replace(a, () => b) }
  });
  fs.writeFileSync(file, s);
};

/* ===================== index.html ===================== */
edit('index.html', [
  ['<script src="clay2.js?v=2"></script>', '<script src="clay2.js?v=2"></script>\n<script src="layout.js?v=1"></script>'],
  /* hero header */
  ['function topbar(title,ic,sub,back="home"){', 'function topbar(title,ic,sub,back="home",chips){\n  if(window.hvHero)return hvHero(title,ic,sub,back,chips);'],
  /* Home: continue card with progress */
  ['return `<button class="cont2" data-go="l-${L.g}-${L.n}"><span class="th">${th}<span class="pl">${hvIcon("play2",14)}</span></span><span><small>Continue</small><b>${esc(l[0]+" "+l[1])}</b></span></button>`',
   'const tot=(CUR[L.g]||[]).reduce((a,b)=>a+b[1].length,0),dn=(CUR[L.g]||[]).reduce((a,b)=>a+b[1].filter(x=>isDone(L.g,x[0])).length,0),pct=tot?Math.max(4,Math.round(dn/tot*100)):0;return `<button class="cont2" data-go="l-${L.g}-${L.n}"><span class="th">${th}<span class="pl">${hvIcon("play2",14)}</span></span><span class="cn"><small>Continue where you left off</small><b>${esc(l[0]+" "+l[1])}</b><span class="cbar" aria-label="${dn} of ${tot} lessons done"><i style="width:${pct}%"></i></span></span></button>`'],
  /* Home footer: calmer workshop button */
  ['<button class="workshop" data-go="servants">${window.hvIcon?hvIcon("tools",18):""}Servants Workshop</button><div id="offchip"></div>', '<button class="workshop" data-go="servants">🔒 Servants Workshop <small>for servants</small></button><div id="offchip"></div>'],
  /* games: remember the last one */
  ['else if(h==="g-memory")memory();else if(h==="g-scramble")scramble();', 'else if(h==="g-memory"){store.set("lastGame","g-memory");memory()}else if(h==="g-scramble"){store.set("lastGame","g-scramble");scramble()}'],
  /* attendance gate */
  [/if\(!acc\)\{app\.innerHTML=`\$\{topbar\("Attendance","✋","Login first"\)\}[\s\S]*?Login or create profile<\/button><\/div>`;return\}/,
   'if(!acc){app.innerHTML=`${topbar("Attendance","✋","Check in every Sunday")}${hvGate({scene:"notes",title:"Check in every Sunday",lead:"Make a profile and your Sundays are saved.",benefits:[["star","Earn stars every Sunday"],["flame","See your streak grow"],["notes","Your teacher sees you came"]],preview:"streak",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`;return}']
]);

/* games() and quizzes() rewritten */
let h = fs.readFileSync('index.html', 'utf8');
const g0 = h.indexOf('function games(){');
const g1 = h.indexOf('const MEM=[');
const gamesNew = `function games(){
  const last=store.get("lastGame",""),LG={"g-memory":["Bible Match","cards"],"g-scramble":["Name Scramble","abc"]}[last];
  app.innerHTML=\`\${topbar("Games","🎮","Play & learn","home",["2 games","more soon"])}
  <button class="ticket" data-go="join"><span class="tk-l"><b>Enter a game code</b><small>Join your servant's live game</small></span><span class="tk-r" aria-hidden="true">\${hvIcon("target",52)}</span></button>
  \${LG?\`<button class="lastrow" data-go="\${last}"><span aria-hidden="true">\${hvIcon(LG[1],38)}</span><span><small>Last played</small><b>\${LG[0]}</b></span><span class="lr-go">Play again</span></button>\`:""}
  <section class="sec"><h2 class="sech"><span>Play now</span></h2>
  <div class="grid ggrid">
   <button class="gcard" style="--c:#2f8fc0" data-go="g-memory"><span class="gc-art" aria-hidden="true">\${hvIcon("cards",92)}</span><span class="gc-t"><b>Bible Match</b><small>Find the pairs</small></span><span class="gc-m"><i>2 min</i><i>Easy</i></span></button>
   <button class="gcard" style="--c:#d98a2b" data-go="g-scramble"><span class="gc-art" aria-hidden="true">\${hvIcon("abc",92)}</span><span class="gc-t"><b>Name Scramble</b><small>Fix the Bible names</small></span><span class="gc-m"><i>3 min</i><i>Medium</i></span></button>
  </div></section>
  <div id="kidGames"></div>
  <section class="sec"><h2 class="sech"><span>Coming soon</span></h2>
  <div class="grid ggrid">\${[["Bible Trivia","target","#8e6bd1"],["Word Search","frame","#3fae6a"],["Story Order","scroll","#e86f8a"]].map(c=>\`<div class="gcard soon" style="--c:\${c[2]}" aria-label="\${c[0]}, coming soon"><span class="gc-art" aria-hidden="true">\${hvIcon(c[1],80)}</span><span class="gc-t"><b>\${c[0]}</b><small>Coming soon</small></span><span class="gc-lock" aria-hidden="true">\${hvIcon("lock",30)}</span></div>\`).join("")}</div></section>\`;
  if(window.kidGames)kidGames($("#kidGames"))}
`;
h = h.slice(0, g0) + gamesNew + h.slice(g1);
const q0 = h.indexOf('function quizzes(){');
const q1 = h.indexOf('const starsFor=');
const quizzesNew = `function quizzes(){const best=store.get("best",{});
  const diff=n=>n<=5?"Easy":n<=8?"Medium":"Hard",star=(q)=>{const n=best[q.id]!=null?starsFor(best[q.id],q.q.length):0;return \`<span class="qstars" aria-label="\${n} of 3 stars">\${"★".repeat(n)}\${"☆".repeat(3-n)}</span>\`};
  const rec=QUIZZES.find(q=>best[q.id]==null),done=QUIZZES.filter(q=>best[q.id]!=null).length;
  const card=q=>\`<button class="qcov" style="--c:\${q.c}" data-go="quiz-\${q.id}"><span class="ic" aria-hidden="true">\${q.ic}</span><span class="qc-t"><b>\${q.name}</b><small>\${best[q.id]!=null?"Best: "+best[q.id]+" of "+q.q.length:q.q.length+" questions"}</small></span><span class="qc-m"><i>\${diff(q.q.length)}</i>\${star(q)}</span></button>\`;
  app.innerHTML=\`\${topbar("Quizzes","🏆","Pick a quiz, earn stars","home",[QUIZZES.length+" quizzes",done+" done"])}
  \${rec?\`<section class="sec"><h2 class="sech"><span>Recommended for you</span></h2><div class="grid qlist">\${card(rec)}</div></section>\`:""}
  <section class="sec"><h2 class="sech"><span>All quizzes</span></h2><div class="grid qlist">\${QUIZZES.map(card).join("")}</div></section>
  <div class="note">🆕 More quizzes come with new lessons.</div>\`}
`;
h = h.slice(0, q0) + quizzesNew + h.slice(q1);
/* quiz play: A B C D badges, dots, lesson link, Lumi hint */
h = h.replace('<div class="qcard"><div class="qprog"><i style="width:${i/order.length*100}%"></i></div><div class="q">${esc(x.t)}</div>\n    <div class="opts">${x.o.map(o=>`<button class="opt" data-k="${o.k}">${esc(o.s)}</button>`).join("")}</div><div id="fb" role="status"></div></div>`;',
  '<div class="qcard"><div class="qprog"><i style="width:${i/order.length*100}%"></i></div><div class="qdots" aria-hidden="true">${order.map((_,j)=>`<i class="${j<i?"dn":j===i?"now":""}"></i>`).join("")}</div><div class="q">${esc(x.t)}</div>\n    <div class="opts">${x.o.map((o,j)=>`<button class="opt" data-k="${o.k}"><i class="ab">${"ABCD"[j]}</i><span>${esc(o.s)}</span></button>`).join("")}</div><div id="fb" role="status"></div></div>\n    <div class="qhint"><span class="qh-l" aria-hidden="true">${window.hvLumiSvg?hvLumiSvg("thinking",44):""}</span><p>Take your time. Read every answer first.</p></div>\n    ${Q.v?`<button class="qlesson" data-v="${Q.v}"><span class="qth"><img src="https://i.ytimg.com/vi/${Q.v}/mqdefault.jpg" alt="" loading="lazy"><i>${hvIcon("play2",14)}</i></span><span><small>Need a hint?</small><b>Watch the lesson</b></span></button>`:""}`;');
fs.writeFileSync('index.html', h);

/* ===================== shell.js: more doors and the offline dot ===================== */
edit('shell.js', [
  ['return `<section class="sec" aria-label="More to explore"><h2 class="sech"><span>More to explore</span></h2><nav class="doors2">${MORE.map((m,i)=>`<button class="mdoor" style="--dc:var(${m[4]})" data-go="${m[0]}"><span class="big" aria-hidden="true">${m[0]==="calendar"?calIcon():(window.hvIcon?hvIcon(m[1],54):m[1])}</span><b>${m[2]}</b><small>${m[3]}</small></button>`).join("")}</nav></section>`};',
   `const two=MORE.filter(m=>m[0]!=="calendar"),cal=new Date(),cd=copticDate(cal),up=window.hvUpcoming?hvUpcoming(2):[];
  return \`<section class="sec" aria-label="More to explore"><h2 class="sech"><span>More to explore</span></h2><nav class="doors2 two">\${two.map((m,i)=>\`<button class="mdoor" style="--dc:var(\${m[4]})" data-go="\${m[0]}"><span class="big" aria-hidden="true">\${window.hvIcon?hvIcon(m[1],54):m[1]}</span><b>\${m[2]}</b><small>\${m[3]}</small></button>\`).join("")}</nav>
   <button class="calwide" data-go="calendar"><span class="cw-l"><span class="cw-date">\${calIcon()}<span><small>Today</small><b>\${cd.day} \${cd.name}, \${cd.year}</b></span></span><span class="cw-go">Open the calendar</span></span>
   \${up.length?\`<span class="cw-up">\${up.map(x=>\`<span class="cw-row">\${window.hvCalIcon?hvCalIcon(x.id,x.ic,34):""}<span><b>\${E(x.t)}</b><small>\${x.d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</small></span><i>\${x.n===1?"Tomorrow":"in "+x.n+" days"}</i></span>\`).join("")}</span>\`:""}</button></section>\`};`],
  ['  return `<div class="shellbar">${me}<div class="sb-right">', '  const off=navigator.serviceWorker&&navigator.serviceWorker.controller?`<span class="offdot" role="img" aria-label="Works without internet" title="Works without internet"></span>`:"";\n  return `<div class="shellbar">${me}<div class="sb-right">${off}']
]);
/* ===================== faith.js: hvUpcoming ===================== */
edit('faith.js', [
  ['const CNT=n=>', 'window.hvUpcoming=function(n){const t=today(),out=[];const fb=[];[t.getFullYear(),t.getFullYear()+1].forEach(y=>fastsOf(y).forEach(f=>{if(f.s>t&&diffDays(t,f.s)<=400)fb.push({d:f.s,type:"feast",ic:"🌙",t:f.t+" begins",id:"fast-"+f.id})}));\n  allEv(addDays(t,1),addDays(t,400)).filter(x=>x.type==="feast").concat(fb).sort((x,y)=>x.d-y.d).slice(0,n).forEach(x=>out.push({id:x.id,t:x.t,ic:x.ic,d:x.d,n:diffDays(t,x.d)}));return out};\nconst CNT=n=>']
]);
console.log('part 1 done');
