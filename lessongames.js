/* Lesson games: a menu plus 6 games built from each lesson's memory verse */
(function(){
const GAMES=[["vp","🧩","Verse puzzle","Put the words in order"],["miss","✏️","Missing words","Fill in the blanks"],["mem","🧠","Memory match","Find the pairs"],["scr","🔀","Word scramble","Fix the letters"],["tf","⚡","True or false","Is the verse right?"],["ws","🔍","Word search","Find hidden words"],["fc","🃏","Flashcards","Flip and learn"]];
const COLORS=["#3fae6a","#8e6bd1","#d4553b","#2f8fc0","#e3b45c","#e86f8a","#b9852b"];
const rnd=a=>a.slice().sort(()=>Math.random()-.5);
const clean=w=>w.replace(/[^A-Za-z']/g,"");
const keyWords=t=>[...new Set(t.split(/\s+/).map(clean).filter(w=>w.length>=4).map(w=>w.toLowerCase()))];
const pool=()=>[...new Set(Object.values(LVERSE).flatMap(x=>(x[0]||"").split(/\s+/).map(clean)).filter(w=>w.length>=4).map(w=>w.toLowerCase()))];
const st=document.createElement("style");
st.textContent=".mcard{aspect-ratio:1;border:0;border-radius:14px;background:linear-gradient(135deg,#2a3560,#4a3a78);color:transparent;font:inherit;font-weight:800;font-size:.78rem;padding:2px;box-shadow:var(--shadow)}.mcard.up{color:#fff;background:linear-gradient(135deg,#2f8fc0,#4a7bd0)}.mcard.ok{color:#fff;background:#3fae6a}.mgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.wsg{display:grid;grid-template-columns:repeat(9,1fr);gap:3px}.wsc{aspect-ratio:1;border:0;border-radius:8px;background:var(--surface);color:inherit;font:inherit;font-weight:800;font-size:1rem;padding:0}.wsc.sel{background:#e3b45c;color:#222}.wsc.found{background:#3fae6a;color:#fff}.wsw{display:inline-block;margin:3px 6px;font-weight:800}.wsw.done{text-decoration:line-through;opacity:.5}.fcard{width:100%;min-height:220px;border:0;border-radius:22px;padding:22px;background:linear-gradient(135deg,#2a3560,#4a3a78);color:#fff;font:inherit;font-size:1.25rem;font-weight:800;box-shadow:var(--shadow)}.blank{border-bottom:3px solid #e3b45c;padding:0 8px}.fill{color:#6fe09a}.tfbtn{flex:1}";
document.head.appendChild(st);
function ctx(g,n){const l=lessonOf(g,n),v=verseOf(g,n);return l&&v&&v[0]?{g,n,l,t:v[0],r:v[1]||""}:null}
const head=(c,title,sub)=>topbar(title,"🎮",sub||c.l[0]+" - "+c.l[1],"gm-"+c.g+"-"+c.n);
function menu(g,n){const c=ctx(g,n);if(!c)return go("l-"+g+"-"+n);
  app.innerHTML=`${topbar("Games","🎮",c.l[0]+" - "+c.l[1],"l-"+g+"-"+n)}<div class="grid">${GAMES.map((x,i)=>`<button class="tile" style="--c:${COLORS[i]}" data-go="${x[0]==="vp"?"vp-"+g+"-"+n:"lg-"+x[0]+"-"+g+"-"+n}"><span class="ic">${x[1]}</span><span class="nm">${x[2]}</span><span class="ct">${x[3]}</span></button>`).join("")}</div>`}
function finish(c,key,title,bad){const stars=bad===0?3:bad<=2?2:1;confetti();if(window.hvAward)hvAward("selfplay",key+"-"+c.g+"-"+c.n,title);
  app.innerHTML=`${head(c,title)}<div class="card sec" style="text-align:center"><div class="stars">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div><b>${bad===0?"Perfect! 🎉":"Well done! 🎉"}</b><div class="tag">${esc(c.r)}</div><div class="btns"><button class="btn gold" data-go="lg-${key}-${c.g}-${c.n}">🔁 Play again</button><button class="btn alt" data-go="gm-${c.g}-${c.n}">🎮 More games</button></div></div>`}
function nope(c){toast("Not enough words for this game 🙂");go("gm-"+c.g+"-"+c.n)}

function miss(c){const words=c.t.split(/\s+/),ok=words.map((w,i)=>i).filter(i=>clean(words[i]).length>=3);if(ok.length<1)return nope(c);
  const idx=rnd(ok).slice(0,Math.min(3,Math.max(1,Math.floor(words.length/4)))).sort((a,b)=>a-b),need=idx.map(i=>clean(words[i]).toLowerCase());
  const bank=rnd([...idx.map(i=>clean(words[i])),...rnd(pool().filter(w=>!need.includes(w))).slice(0,3)]);let filled=0,bad=0;const used=new Set();
  function draw(){app.innerHTML=`${head(c,"Missing words")}<div class="card sec"><div class="tag">Tap the missing words in order</div><div style="font-size:1.2rem;font-weight:800;line-height:1.7">${words.map((w,i)=>{const k=idx.indexOf(i);return k<0?esc(w):k<filled?`<span class="fill">${esc(w)}</span>`:`<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`}).join(" ")}</div></div>
    <div>${bank.map((w,i)=>used.has(i)?"":`<button class="chip" data-i="${i}">${esc(w)}</button>`).join("")}</div>`;
    app.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(bank[i].toLowerCase()===need[filled]){used.add(i);filled++;filled===idx.length?finish(c,"miss","Missing words",bad):draw()}else{bad++;toast("Not that one, try again 🙂")}})}
  draw()}

function mem(c){const kw=rnd(keyWords(c.t)).slice(0,6);if(kw.length<3)return nope(c);
  const cards=rnd([...kw,...kw]);let open=[],got=0,moves=0,lock=false;
  app.innerHTML=`${head(c,"Memory match")}<div class="card sec"><div class="tag">Find the matching words · <span id="mv">0</span> moves</div></div><div class="mgrid">${cards.map((w,i)=>`<button class="mcard" data-i="${i}">${esc(w)}</button>`).join("")}</div>`;
  app.querySelectorAll(".mcard").forEach(b=>b.onclick=()=>{if(lock||b.classList.contains("up")||b.classList.contains("ok"))return;b.classList.add("up");open.push(b);
    if(open.length===2){moves++;$("#mv").textContent=moves;const[a,d]=open;
      if(cards[+a.dataset.i]===cards[+d.dataset.i]){a.classList.replace("up","ok");d.classList.replace("up","ok");open=[];got++;if(got===kw.length)setTimeout(()=>finish(c,"mem","Memory match",moves-kw.length>6?3:moves-kw.length>3?2:0),500)}
      else{lock=true;setTimeout(()=>{a.classList.remove("up");d.classList.remove("up");open=[];lock=false},800)}}})}

function scr(c){const ws=rnd(keyWords(c.t).filter(w=>w.length<=9)).slice(0,5);if(ws.length<2)return nope(c);let i=0,bad=0;
  function word(){const w=ws[i];let ls=rnd(w.split("").map((x,k)=>k));while(w.length>1&&ls.map(k=>w[k]).join("")===w&&new Set(w).size>1)ls=rnd(ls);let pick=[];
    function draw(){app.innerHTML=`${head(c,"Word scramble","Word "+(i+1)+" of "+ws.length)}<div class="card sec" style="text-align:center"><div class="tag">Tap the letters in the right order</div><div style="font-size:2rem;font-weight:800;letter-spacing:6px;min-height:2.6rem">${esc(pick.map(k=>w[k]).join("").toUpperCase())||"…"}</div></div>
      <div style="text-align:center">${ls.filter(k=>!pick.includes(k)).map(k=>`<button class="chip" data-k="${k}">${esc(w[k].toUpperCase())}</button>`).join("")}</div>`;
      app.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(w[k]===w[pick.length]){pick.push(k);if(pick.length===w.length){toast("✅ "+w);i++;i<ws.length?word():finish(c,"scr","Word scramble",bad)}else draw()}else{bad++;toast("Not that letter 🙂")}})}
    draw()}
  word()}

function tf(c){const kw=keyWords(c.t),p=pool();if(!kw.length)return nope(c);const words=c.t.split(/\s+/);let q=0,bad=0;
  const items=rnd([0,1,2,3,4,5]).map(k=>{if(k%2===0)return{s:c.t,a:true};const i=words.findIndex(w=>clean(w).toLowerCase()===rnd(kw)[0]);const j=i<0?0:i;const w2=rnd(p.filter(x=>x!==clean(words[j]).toLowerCase()))[0]||"nothing";return{s:words.map((w,x)=>x===j?w2:w).join(" "),a:false}});
  function draw(){const x=items[q];app.innerHTML=`${head(c,"True or false","Question "+(q+1)+" of "+items.length)}<div class="card sec"><div class="tag">Is this the right verse?</div><div style="font-size:1.2rem;font-weight:800">“${esc(x.s)}”</div><div class="tag">${esc(c.r)}</div></div>
    <div class="btns" style="display:flex;gap:10px"><button class="btn tfbtn" data-a="1">✅ True</button><button class="btn alt tfbtn" data-a="0">❌ False</button></div><div id="fb" role="status"></div>`;
    app.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const right=(b.dataset.a==="1")===x.a;if(!right)bad++;app.querySelectorAll("[data-a]").forEach(z=>z.disabled=true);
      $("#fb").innerHTML=right?`<p class="ok">Correct! 🎉</p>`:`<p class="err">Not quite. ${x.a?"That was the real verse.":"A word was changed."}</p>`;
      setTimeout(()=>{q++;q<items.length?draw():finish(c,"tf","True or false",bad)},1200)})}
  draw()}

function ws(c){const ws0=rnd(keyWords(c.t).filter(w=>w.length>=4&&w.length<=9)).slice(0,5);if(ws0.length<2)return nope(c);
  const N=9,grid=Array.from({length:N},()=>Array(N).fill("")),dirs=[[0,1],[1,0],[1,1]],words=[];
  ws0.forEach(w=>{for(let t=0;t<200;t++){const d=dirs[Math.floor(Math.random()*3)],r=Math.floor(Math.random()*N),cc=Math.floor(Math.random()*N);
    const er=r+d[0]*(w.length-1),ec=cc+d[1]*(w.length-1);if(er>=N||ec>=N)continue;let ok=true;
    for(let k=0;k<w.length;k++){const x=grid[r+d[0]*k][cc+d[1]*k];if(x&&x!==w[k].toUpperCase())ok=false}
    if(!ok)continue;for(let k=0;k<w.length;k++)grid[r+d[0]*k][cc+d[1]*k]=w[k].toUpperCase();words.push(w);break}});
  if(words.length<2)return nope(c);
  const L="ABCDEFGHIJKLMNOPRSTUVWY";for(let r=0;r<N;r++)for(let k=0;k<N;k++)if(!grid[r][k])grid[r][k]=L[Math.floor(Math.random()*L.length)];
  const found=new Set();let start=null,bad=0;
  function draw(){app.innerHTML=`${head(c,"Word search")}<div class="card sec"><div class="tag">Tap the first and last letter of each word</div><div>${words.map(w=>`<span class="wsw ${found.has(w)?"done":""}">${esc(w.toUpperCase())}</span>`).join("")}</div></div>
    <div class="wsg">${grid.map((row,r)=>row.map((ch,k)=>`<button class="wsc ${cells.has(r+","+k)?"found":""} ${start&&start[0]===r&&start[1]===k?"sel":""}" data-r="${r}" data-c="${k}">${ch}</button>`).join("")).join("")}</div>`;
    app.querySelectorAll(".wsc").forEach(b=>b.onclick=()=>{const r=+b.dataset.r,k=+b.dataset.c;if(!start){start=[r,k];return draw()}
      const dr=r-start[0],dc=k-start[1],len=Math.max(Math.abs(dr),Math.abs(dc))+1;let hit="";
      if(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)){const sr=Math.sign(dr),sc=Math.sign(dc),cs=[];let s="";for(let i=0;i<len;i++){cs.push([start[0]+sr*i,start[1]+sc*i]);s+=grid[start[0]+sr*i][start[1]+sc*i]}
        const m=words.find(w=>!found.has(w)&&(w.toUpperCase()===s||w.toUpperCase()===s.split("").reverse().join("")));if(m){found.add(m);cs.forEach(x=>cells.add(x[0]+","+x[1]));hit=m}}
      start=null;if(!hit){bad++;toast("Not a word, try again 🙂")}
      found.size===words.length?finish(c,"ws","Word search",bad>4?3:bad>2?2:0):draw()})}
  const cells=new Set();draw()}

function fc(g,n){const bl=(CUR[g]||[]).find(b=>b[1].some(l=>l[0]===n));const deck=(bl?bl[1]:[]).filter(l=>verseOf(g,l[0])&&verseOf(g,l[0])[0]);if(!deck.length)return go("gm-"+g+"-"+n);
  let i=Math.max(0,deck.findIndex(l=>l[0]===n)),flip=false;
  function draw(){const l=deck[i],v=verseOf(g,l[0]);app.innerHTML=`${topbar("Flashcards","🃏",(i+1)+" of "+deck.length,"gm-"+g+"-"+n)}
    <button class="fcard" id="fcard">${flip?`“${esc(v[0])}”<div class="tag" style="color:#e3b45c">${esc(v[1])}</div>`:`${esc(l[0])} - ${esc(l[1])}<div class="tag" style="color:#cfd6ee">Tap to see the verse</div>`}</button>
    <div class="btns"><button class="btn alt" id="pv" ${i?"":"disabled"}>⬅️ Back</button><button class="btn gold" id="nx" ${i<deck.length-1?"":"disabled"}>Next ➡️</button></div>`;
    $("#fcard").onclick=()=>{flip=!flip;draw()};$("#pv").onclick=()=>{i--;flip=false;draw()};$("#nx").onclick=()=>{i++;flip=false;draw()}}
  draw()}

window.lgRoute=function(h){
  if(h.startsWith("gm-")){const p=h.slice(3).split("-");menu(p[0],p[1]);return true}
  if(h.startsWith("lg-")){const p=h.slice(3).split("-"),k=p[0],c=ctx(p[1],p[2]);
    if(k==="fc"){fc(p[1],p[2]);return true}
    if(!c){go("l-"+p[1]+"-"+p[2]);return true}
    ({miss,mem,scr,tf,ws})[k](c);return true}
  return false};
})();
