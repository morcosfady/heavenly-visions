/* Heavenly Visions: four more games. Bible Trivia, Word Search, Story Order, Verse Quest. No audio, works offline. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const pick=(a,n)=>shuffle(a).slice(0,n);
const dayKey=()=>new Date().toISOString().slice(0,10);
const best=(id,v)=>{try{const b=JSON.parse(localStorage.getItem("hv_g2best")||"{}");if(v!=null&&(b[id]==null||v>b[id])){b[id]=v;localStorage.setItem("hv_g2best",JSON.stringify(b))}return b[id]}catch{return null}};
const award=(id,title)=>{if(window.hvAward)hvAward("selfplay",id+"-"+dayKey(),title)};
const stars=(ok,total)=>ok===total?3:ok>=total-1?2:ok>=Math.ceil(total/2)?1:0;
function endScreen(title,ic,ok,total,again,msg){
  const st=stars(ok,total);if(st===3&&window.confetti)confetti();best(again,ok);award(again,title);
  app.innerHTML=`${topbar(title,ic,"Finished","games")}
  <div class="qcard" style="text-align:center"><div class="stars stq-row" aria-label="${st} of 3 stars">${[1,2,3].map(n=>`<span class="stq${n<=st?"":" off"}" style="--i:${n}">${hvIcon("star",56)}</span>`).join("")}</div>
  <h2 style="font-size:1.6rem">${ok} / ${total}</h2><p class="tag" style="margin:0">${msg||(st===3?"Perfect! God bless you!":st===2?"Great job!":"Good try! Play again.")}</p>
  <div class="btns"><button class="btn gold" data-go="${again}" data-again>Play again</button><button class="btn alt" data-go="games">All games</button></div></div>`}

/* ---------- Bible Trivia: 10 random questions from every quiz ---------- */
function trivia(){
  const all=[];(typeof QUIZZES!=="undefined"?QUIZZES:[]).forEach(q=>q.q.forEach(x=>all.push({t:x[0],o:x[1],a:x[2]})));
  const list=pick(all,Math.min(10,all.length));let i=0,score=0,streak=0;
  function draw(){
    const x=list[i],opts=x.o.map((s,k)=>({s,k}));const o=shuffle(opts);
    app.innerHTML=`${topbar("Bible Trivia","🎯",`Question ${i+1} of ${list.length}`,"games",[score+" right",streak>1?streak+" in a row":""].filter(Boolean))}
    <div class="qcard"><div class="qprog"><i style="width:${i/list.length*100}%"></i></div><div class="q">${E(x.t)}</div>
    <div class="opts">${o.map((p,j)=>`<button class="opt" data-k="${p.k}"><i class="ab">${"ABCD"[j]}</i><span>${E(p.s)}</span></button>`).join("")}</div><div id="fb" role="status"></div></div>`;
    app.querySelectorAll(".opt").forEach(b=>b.addEventListener("click",()=>{
      const k=+b.dataset.k;app.querySelectorAll(".opt").forEach(z=>{z.disabled=true;if(+z.dataset.k===x.a)z.classList.add("right")});
      if(k===x.a){score++;streak++;document.getElementById("fb").innerHTML=`<p class="ok">${streak>2?"On fire! "+streak+" in a row!":"Correct!"}</p>`}else{streak=0;b.classList.add("wrong");document.getElementById("fb").innerHTML=`<p class="err">Not quite. The right answer is in green.</p>`}
      setTimeout(()=>{i++;i<list.length?draw():endScreen("Bible Trivia","🎯",score,list.length,"g-trivia")},1200)}))}
  draw()}

/* ---------- Word Search ---------- */
const THEMES={people:["Bible heroes",["NOAH","DAVID","MOSES","DANIEL","JONAH","RUTH","ESTHER","ABRAHAM","JOSEPH","MARY","PETER","PAUL","MARK","LUKE","JOHN","SAMUEL","ELIJAH","ISAAC"]],
 places:["Bible places",["EGYPT","ZION","EDEN","SINAI","JORDAN","CARMEL","NAZARETH","GALILEE","BETHANY","HEBRON","SHILOH","ARARAT"]],
 church:["In church",["ALTAR","CROSS","ICON","INCENSE","PRAYER","BIBLE","PRIEST","CHOIR","DEACON","HYMN","GOSPEL","CANDLE"]]};
function wordsearch(){
  const N=9,th=THEMES[pick(Object.keys(THEMES),1)[0]],words=pick(th[1],6).sort((a,b)=>b.length-a.length);
  const g=Array.from({length:N},()=>Array(N).fill(""));const DIRS=[[1,0],[0,1],[1,1]];
  words.forEach(w=>{for(let t=0;t<200;t++){const d=DIRS[Math.floor(Math.random()*3)],x=Math.floor(Math.random()*N),y=Math.floor(Math.random()*N),ex=x+d[0]*(w.length-1),ey=y+d[1]*(w.length-1);
    if(ex>=N||ey>=N)continue;let ok=true;for(let k=0;k<w.length;k++){const c=g[y+d[1]*k][x+d[0]*k];if(c&&c!==w[k]){ok=false;break}}
    if(!ok)continue;for(let k=0;k<w.length;k++)g[y+d[1]*k][x+d[0]*k]=w[k];return}});
  const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!g[y][x])g[y][x]=A[Math.floor(Math.random()*26)];
  const found=new Set(),lit=new Set();let first=null;
  function draw(msg){
    app.innerHTML=`${topbar("Word Search","🔎",th[0],"games",[found.size+" of "+words.length+" found"])}
    <p class="tag" style="text-align:center;margin:4px 0 8px">Tap the first letter, then the last letter.</p>
    <div class="wsgrid" style="--n:${N}">${g.map((r,y)=>r.map((c,x)=>`<button class="wsc${lit.has(x+","+y)?" f":""}${first&&first[0]===x&&first[1]===y?" s":""}" data-x="${x}" data-y="${y}" aria-label="${c}">${c}</button>`).join("")).join("")}</div>
    <div class="wswords">${words.map(w=>`<span class="${found.has(w)?"d":""}">${w}</span>`).join("")}</div><div id="fb" role="status">${msg||""}</div>
    <button class="btn alt" data-go="g-wordsearch" data-again>New puzzle</button>`;
    app.querySelectorAll(".wsc").forEach(b=>b.addEventListener("click",()=>tap(+b.dataset.x,+b.dataset.y)))}
  function tap(x,y){
    if(!first){first=[x,y];return draw()}
    const [x0,y0]=first;first=null;const dx=Math.sign(x-x0),dy=Math.sign(y-y0),len=Math.max(Math.abs(x-x0),Math.abs(y-y0))+1;
    if(!(x===x0||y===y0||Math.abs(x-x0)===Math.abs(y-y0)))return draw(`<p class="err">Pick letters in a straight line.</p>`);
    let s="",cells=[];for(let k=0;k<len;k++){s+=g[y0+dy*k][x0+dx*k];cells.push((x0+dx*k)+","+(y0+dy*k))}
    const r=s.split("").reverse().join(""),w=words.find(q=>!found.has(q)&&(q===s||q===r));
    if(w){found.add(w);cells.forEach(c=>lit.add(c));if(found.size===words.length){endScreen("Word Search","🔎",words.length,words.length,"g-wordsearch","You found every word!");return}draw(`<p class="ok">You found ${w}!</p>`)}else draw(`<p class="err">Not a word on the list. Try again.</p>`)}
  draw()}

/* ---------- Story Order: put the events in the right order ---------- */
const STORIES=[
 ["Noah and the ark","🌈",["God tells Noah to build an ark","The animals come into the ark","The flood covers the earth","A dove brings an olive leaf","A rainbow shines in the sky"]],
 ["Jesus is born","⭐",["The angel visits Mary","Mary and Joseph go to Bethlehem","Jesus is born in a manger","The shepherds come to see Him","The wise men bring gifts"]],
 ["Moses","🧺",["Baby Moses floats in a basket","God speaks from the burning bush","God sends ten plagues on Egypt","The sea opens for God's people","God gives the Ten Commandments"]],
 ["David and Goliath","👑",["David takes care of the sheep","David brings food to his brothers","David meets Goliath","A stone from the sling hits Goliath","David becomes king"]],
 ["Daniel and the lions","🦁",["Daniel prays to God","Men trick the king","Daniel is put in the lions' den","God sends an angel to shut their mouths","The king praises God"]],
 ["Jonah","🐋",["God tells Jonah to go to Nineveh","Jonah sails away on a ship","A big storm comes","A big fish swallows Jonah","Jonah prays and the fish lets him go"]],
 ["Creation","🌍",["God makes light","God makes the sky and the sea","God makes the sun, moon and stars","God makes the fish and the birds","God makes people"]],
 ["Holy Week","✝️",["Jesus rides into Jerusalem","Jesus shares the Last Supper","Jesus dies on the cross","Jesus rises on the third day","Jesus shows Himself to the disciples"]]];
function storyorder(){
  const [name,ic,ev]=pick(STORIES,1)[0],cards=shuffle(ev.map((t,k)=>({t,k})));let seq=[];
  function draw(msg){
    app.innerHTML=`${topbar("Story Order",ic,name,"games")}
    <p class="tag" style="text-align:center;margin:4px 0 8px">Tap the events in the order they happened.</p>
    <div class="sorder">${cards.map(c=>{const n=seq.indexOf(c.k);return `<button class="so${n>=0?" on":""}" data-k="${c.k}" aria-pressed="${n>=0}"><i>${n>=0?n+1:""}</i><span>${E(c.t)}</span></button>`}).join("")}</div>
    <div id="fb" role="status">${msg||""}</div>
    <div class="btns">${seq.length===cards.length?`<button class="btn gold" id="soCheck">Check my order</button>`:""}<button class="btn alt" id="soReset">Start over</button></div>`;
    app.querySelectorAll(".so").forEach(b=>b.onclick=()=>{const k=+b.dataset.k,i=seq.indexOf(k);if(i>=0)seq.splice(i,1);else seq.push(k);draw()});
    document.getElementById("soReset").onclick=()=>{seq=[];draw()};
    const c=document.getElementById("soCheck");if(c)c.onclick=()=>{
      const ok=seq.filter((k,i)=>k===i).length;
      if(ok===cards.length)return endScreen("Story Order",ic,ok,ok,"g-storyorder","You put the whole story in order!");
      seq=[];draw(`<p class="err">${ok} in the right place. Try again!</p>`)}}
  draw()}

/* ---------- Verse Quest: fill in the missing word ---------- */
function versequest(){
  const src=typeof LVERSE!=="undefined"?LVERSE:{},pool=[];
  Object.keys(src).forEach(k=>{const v=src[k];if(!v||!v[0]||/\.\.\./.test(v[0]))return;const w=v[0].split(" ");if(w.length>=6&&v[0].length<=120)pool.push(v)});
  const uniq=[];const seen=new Set();pool.forEach(v=>{if(!seen.has(v[1])){seen.add(v[1]);uniq.push(v)}});
  if(uniq.length<5){app.innerHTML=`${topbar("Verse Quest","📜","Fill in the missing word","games")}<p class="tag">Verses are loading. Try again in a moment.</p>`;return}
  const rounds=pick(uniq,5),words=[...new Set(uniq.join(" ").toLowerCase().replace(/[^a-z' ]/g," ").split(/\s+/).filter(w=>w.length>3))];
  let i=0,score=0;
  function draw(){
    const [txt,ref]=rounds[i],toks=txt.split(" "),cand=toks.map((w,k)=>[w.replace(/[^A-Za-z']/g,""),k]).filter(p=>p[0].length>3&&p[1]>0);
    const [ans,at]=cand.length?cand[Math.floor(Math.random()*cand.length)]:[toks[1].replace(/[^A-Za-z']/g,""),1];
    const wrong=pick(words.filter(w=>w!==ans.toLowerCase()),3),opts=shuffle([ans.toLowerCase(),...wrong]);
    const shown=toks.map((w,k)=>k===at?w.replace(ans,'<u class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'):E(w)).join(" ");
    app.innerHTML=`${topbar("Verse Quest","📜",`Verse ${i+1} of ${rounds.length}`,"games",[score+" right"])}
    <div class="qcard"><div class="qprog"><i style="width:${i/rounds.length*100}%"></i></div><div class="q vq">${shown}</div><div class="tag" style="text-align:center">${E(ref)}</div>
    <div class="opts">${opts.map((o,j)=>`<button class="opt" data-w="${E(o)}"><i class="ab">${"ABCD"[j]}</i><span>${E(o)}</span></button>`).join("")}</div><div id="fb" role="status"></div></div>`;
    app.querySelectorAll(".opt").forEach(b=>b.addEventListener("click",()=>{
      const ok=b.dataset.w===ans.toLowerCase();app.querySelectorAll(".opt").forEach(z=>{z.disabled=true;if(z.dataset.w===ans.toLowerCase())z.classList.add("right")});
      if(ok){score++;document.getElementById("fb").innerHTML=`<p class="ok">Correct!</p>`}else{b.classList.add("wrong");document.getElementById("fb").innerHTML=`<p class="err">The missing word was "${E(ans)}".</p>`}
      setTimeout(()=>{i++;i<rounds.length?draw():endScreen("Verse Quest","📜",score,rounds.length,"g-versequest")},1500)}))}
  draw()}

window.games2Route=function(h){
  const M={"g-trivia":trivia,"g-wordsearch":wordsearch,"g-storyorder":storyorder,"g-versequest":versequest};
  if(!M[h])return false;try{localStorage.setItem("hv_lastGame",JSON.stringify(h))}catch{}M[h]();return true};
window.games2Best=best;
})();
