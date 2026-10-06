/* Heavenly Visions: Ask Lumi, Phase 4: learning modes inside Lumi's chat (Learn tab).
   Quiz me, Guess the saint, Tell me a story, What does it mean?, Church tour.
   FREE: the helper (apps-script/lumi-learn.gs) builds every mode from APPROVED cards. Stars use the app's own quiz and bible rules (with their daily caps).
   English only, no audio. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const URL_=()=>window.hvAiUrl?hvAiUrl():"";
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const day=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
async function call(body){const a=A(),url=URL_();if(!a||!url)throw "off";const r=await (await fetch(url,{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token,action:"lumi_learn"},body))})).json();
  if(r.blocked)throw "closed";if(!r.ok)throw r.error||"net";return r}
const MODES=[["quiz","❓","Quiz me","Five questions. Earn stars!"],["saints","🕵️","Guess the saint","Clues, then guess who"],["stories","📜","Tell me a story","Bible and saint stories"],["words","🔤","What does it mean?","Church words explained"],["tour","⛪","Church tour","Walk through the church"]];
const TOPICS=[["all","All"],["saints","Saints"],["feasts","Feasts and fasts"],["church","The church"],["bible","Bible"],["words","Words and prayers"]];
let H=null;
const face=(m,s)=>window.hvLumiSvg?hvLumiSvg(m,s||64):"";
const bubble=(m,html)=>`<div class="ll-say"><div class="ll-face">${face(m,64)}</div><div class="ll-bub">${html}</div></div>`;
const back=(to)=>`<button class="back ll-back" data-lb="${to||"menu"}">← ${to==="menu"||!to?"Learn":"Back"}</button>`;
function stars(kind,ref,label,n){try{if(window.hvAward&&A())hvAward(kind,ref,label,n)}catch{}}
function party(){try{if(window.confetti)confetti();if(window.hvFx)hvFx.burst(innerWidth/2,innerHeight/3,"⭐",12)}catch{}}
function problem(err){
  const m={few:"Lumi is still learning about this. Ask your servant to approve more cards 🐑",closed:"Lumi is resting right now 💤 Ask your servant or Abouna!",off:"Lumi is still sleeping 💤 She is not switched on yet.",none:"I could not find that one. Try another 🐑"}[err]||"Lumi is sleeping 💤 I could not reach my helper. Check your internet and try again.";
  H.innerHTML=`${back()}${bubble("sleepy",`<p class="ll-t">${E(m)}</p>`)}`;wire()}
function loading(){H.innerHTML=`<div class="ds-skel" style="height:160px"></div>`}

/* ---------- menu ---------- */
function menu(){
  H.innerHTML=`${bubble("excited",`<p class="ll-t">Let's learn together! What shall we do?</p>`)}<div class="ll-grid">${MODES.map(m=>`<button class="ll-tile" data-mode="${m[0]}"><span class="ic" aria-hidden="true">${m[1]}</span><b>${m[2]}</b><small>${m[3]}</small></button>`).join("")}</div>`;wire()}

/* ---------- quiz ---------- */
function quizStart(topic){
  if(!topic){H.innerHTML=`${back()}${bubble("happy",`<p class="ll-t">Pick a topic for your quiz!</p>`)}<div class="ds-chips ll-chips">${TOPICS.map(t=>`<button class="ds-chip" data-topic="${t[0]}">${t[1]}</button>`).join("")}</div>`;wire();return}
  loading();call({mode:"quiz",topic}).then(r=>{Q={items:r.items,i:0,score:0,topic,done:false};quizAsk()}).catch(problem)}
let Q=null;
function quizAsk(){
  const it=Q.items[Q.i];
  H.innerHTML=`${back()}<div class="ll-prog">Question ${Q.i+1} of ${Q.items.length}<i style="--w:${Math.round(Q.i/Q.items.length*100)}%"></i></div>${bubble("thinking",`<p class="ll-t">${E(it.q)}</p>`)}
   <div class="ll-opts">${it.opts.map((o,k)=>`<button class="ll-opt" data-pick="${k}">${E(o)}</button>`).join("")}</div><div id="llnote"></div>`;wire()}
function quizPick(k){
  const it=Q.items[Q.i],right=k===it.ok;if(Q.done)return;Q.done=true;if(right)Q.score++;
  document.querySelectorAll(".ll-opt").forEach((b,j)=>{b.disabled=true;if(j===it.ok)b.classList.add("good");else if(j===k)b.classList.add("bad")});
  const last=Q.i===Q.items.length-1;
  document.getElementById("llnote").innerHTML=`${bubble(right?"excited":"gentle",`<p class="ll-t"><b>${right?"Yes! Well done! 🎉":"Not quite. That's OK!"}</b></p><p class="ll-t">💡 ${E(it.why)}</p>`)}<button class="btn gold ll-next" data-next="1">${last?"See my score ➜":"Next question ➜"}</button>`;
  if(right&&window.hvFx&&!reduce()){const b=document.querySelector(".ll-opt.good").getBoundingClientRect();hvFx.burst(b.left+b.width/2,b.top,"⭐",6)}
  document.getElementById("llnote").scrollIntoView({block:"nearest",behavior:reduce()?"auto":"smooth"});wire()}
function quizNext(){Q.done=false;Q.i++;if(Q.i<Q.items.length)return quizAsk();quizEnd()}
function quizEnd(){
  const s=Q.score,n=Q.items.length,ref="lumi-quiz-"+Q.topic+"-"+day();
  stars("quiz",ref,"Quiz with Lumi",s);if(s===n)stars("quizbonus",ref,"Perfect quiz with Lumi");
  if(s>=n-1)party();
  H.innerHTML=`${back()}<div class="ll-end">${face(s>=n-1?"excited":"happy",120)}<h2>You got ${s} of ${n}!</h2><p class="ll-t">${s===n?"Perfect! 🌟":s>=n-1?"Great job! 🎉":s>=2?"Good try! Let's learn more.":"Every question helps us learn. Try again!"}</p><p class="tag">⭐ Stars are added for your answers (up to the daily limit).</p></div>
   <div class="two"><button class="btn gold" data-mode="quiz">🔁 Play again</button><button class="btn alt" data-lb="menu">Back to Learn</button></div>`;wire()}

/* ---------- guess the saint ---------- */
let G=null;
function saintsStart(){loading();call({mode:"saints"}).then(r=>{G={rounds:r.rounds,i:0,score:0,shown:1,done:false};saintRound()}).catch(problem)}
function saintRound(){
  const r=G.rounds[G.i];G.shown=1;G.done=false;
  H.innerHTML=`${back()}<div class="ll-prog">Saint ${G.i+1} of ${G.rounds.length}<i style="--w:${Math.round(G.i/G.rounds.length*100)}%"></i></div>
   ${bubble("thinking",`<p class="ll-t"><b>Who am I?</b></p><div id="llclues"></div>`)}<button class="btn alt" id="llmore" data-more="1">💡 Another clue</button>
   <div class="ll-opts">${r.opts.map((o,k)=>`<button class="ll-opt" data-spick="${k}">${E(o)}</button>`).join("")}</div><div id="llnote"></div>`;paintClues();wire()}
function paintClues(){const r=G.rounds[G.i];document.getElementById("llclues").innerHTML=r.clues.slice(0,G.shown).map((c,k)=>`<p class="ll-t ll-clue">🔎 Clue ${k+1}: ${E(c)}</p>`).join("");
  const m=document.getElementById("llmore");if(m)m.hidden=G.shown>=r.clues.length}
function saintPick(k){
  const r=G.rounds[G.i];if(G.done)return;G.done=true;const right=k===r.ok;if(right)G.score++;
  document.querySelectorAll(".ll-opt").forEach((b,j)=>{b.disabled=true;if(j===r.ok)b.classList.add("good");else if(j===k)b.classList.add("bad")});const m=document.getElementById("llmore");if(m)m.hidden=true;
  const last=G.i===G.rounds.length-1;
  document.getElementById("llnote").innerHTML=`${bubble(right?"excited":"gentle",`<p class="ll-t"><b>${right?"You got it! 🎉":"It was "+E(r.name)+"."}</b></p>${right?`<p class="ll-t">${E(r.name)}${G.shown===1?" (with just one clue!)":""}</p>`:""}`)}<button class="btn gold ll-next" data-snext="1">${last?"See my score ➜":"Next saint ➜"}</button>`;
  document.getElementById("llnote").scrollIntoView({block:"nearest",behavior:reduce()?"auto":"smooth"});wire()}
function saintNext(){G.i++;if(G.i<G.rounds.length)return saintRound();
  const s=G.score,n=G.rounds.length;stars("quiz","lumi-saints-"+day(),"Guess the saint with Lumi",s);if(s===n)stars("quizbonus","lumi-saints-"+day(),"Perfect Guess the saint");if(s>=n-1)party();
  H.innerHTML=`${back()}<div class="ll-end">${face(s>=n-1?"excited":"happy",120)}<h2>You knew ${s} of ${n} saints!</h2><p class="ll-t">${s>=n-1?"Wonderful! 🌟":"Good try! Saints are friends who love Jesus."}</p><p class="tag">⭐ Stars are added for your answers (up to the daily limit).</p></div><div class="two"><button class="btn gold" data-mode="saints">🔁 Play again</button><button class="btn alt" data-lb="menu">Back to Learn</button></div>`;wire()}

/* ---------- stories ---------- */
let ST=null;
function storiesList(){loading();call({mode:"stories"}).then(r=>{
  if(!r.items.length)return problem("few");
  const sec=(t,k)=>{const l=r.items.filter(i=>i.kind===k);return l.length?`<h2 class="ll-h">${t}</h2><div class="ll-slist">${l.map(i=>`<button class="ll-story" data-story="${E(i.id)}"><span aria-hidden="true">${k==="bible"?"📖":"👼"}</span>${E(i.title)}</button>`).join("")}</div>`:""};
  H.innerHTML=`${back()}${bubble("happy",`<p class="ll-t">Which story would you like to hear? 📜</p>`)}${sec("Bible stories","bible")}${sec("Saints","saint")}`;wire()}).catch(problem)}
function storyOpen(id){loading();call({mode:"story",sid:id}).then(r=>{ST={s:r,p:0};storyPage()}).catch(problem)}
function storyPage(){
  const s=ST.s,last=ST.p===s.pages.length,txt=last?null:s.pages[ST.p];
  H.innerHTML=`${back("stories")}<h2 class="ll-h">${E(s.title)}</h2><div class="ll-dots" aria-hidden="true">${s.pages.concat(["end"]).map((_,k)=>`<i class="${k<=ST.p?"on":""}"></i>`).join("")}</div>
   ${last?`${bubble("excited",`<p class="ll-t"><b>The end!</b></p><p class="ll-t">${E(s.ask)}</p>${s.verse?`<div class="lm-verse">“${E(s.verse.text)}”<b>${E(s.verse.ref)}</b></div>`:""}${s.ref?`<div class="lm-src"><span class="lm-chip">${E(s.label)}</span></div>`:""}`)}
    <div class="ll-acts"><button class="btn gold" data-askme="${E(s.title)}">💬 Ask Lumi about it</button>${(s.links||[]).filter(r=>!/^l-/.test(r)).map(r=>`<button class="btn alt" data-go="${E(r)}">${/^quiz/.test(r)?"🏆 Take the quiz":/^b-/.test(r)?"📖 Read it in the Bible":"Learn more"}</button>`).join("")}</div>${window.lumiVideoHtml?lumiVideoHtml({videos:s.videos,links:s.links}):""}`
    :`<div class="ll-page"><p class="ll-ptxt">${E(txt)}</p></div>`}
   <div class="two"><button class="btn alt" data-spage="-1" ${ST.p===0?"disabled":""}>⬅ Back</button>${last?`<button class="btn alt" data-lb="stories">More stories</button>`:`<button class="btn gold" data-spage="1">Next ➡</button>`}</div>`;
  if(last&&s.kind==="bible")stars("bible","lumi-story-"+s.id+"-"+day(),s.title);wire()}

/* ---------- words ---------- */
function wordsPage(sel){loading();call({mode:"words"}).then(r=>{
  const w=r.items.find(x=>x.id===sel);
  H.innerHTML=`${back()}${bubble(w?"praying":"happy",`<p class="ll-t">${w?`<b>${E(w.word)}</b>`:"Tap a word to learn what it means! 🔤"}</p>${w?`<p class="ll-t">${E(w.text)}</p><div class="lm-src"><span class="lm-chip">${E(w.label)}</span></div>`:""}`)}
   <div class="ds-chips ll-chips">${r.items.map(x=>`<button class="ds-chip" data-word="${E(x.id)}" aria-pressed="${x.id===sel}">${E(x.word)}</button>`).join("")}</div>`;wire()}).catch(problem)}

/* ---------- church tour ---------- */
const TOURIC={door:"🚪",icons:"🖼️",candles:"🕯️",iconostasis:"🏛️",haykal:"⛪",altar:"✝️",incense:"💨",dome:"⛪"};
let TR=null;
function plan(spot){
  const h=k=>`data-spot="${k}" class="${spot===k?"hot":""}"`;
  return `<svg class="ll-plan" viewBox="0 0 220 300" role="img" aria-label="Plan of a church. The highlighted part is where we are now.">
   <rect x="14" y="104" width="192" height="180" rx="6" fill="#f6ecd6" stroke="#b9945a" stroke-width="3"/><rect x="54" y="14" width="112" height="84" rx="6" fill="#ffeab4" stroke="#b9945a" stroke-width="3"/>
   <g fill="#c9a266" opacity=".7">${[130,150,170,190,210,230,250].map(y=>`<rect x="40" y="${y}" width="56" height="9" rx="3"/><rect x="124" y="${y}" width="56" height="9" rx="3"/>`).join("")}</g>
   <g ${h("dome")}><circle cx="110" cy="60" r="46" fill="none" stroke="#4a8fd8" stroke-width="4" stroke-dasharray="7 6"/></g>
   <g ${h("haykal")}><rect x="58" y="18" width="104" height="76" rx="5" fill="#ffd978" opacity=".9"/></g>
   <g ${h("altar")}><rect x="88" y="38" width="44" height="24" rx="4" fill="#fff" stroke="#b9945a" stroke-width="2"/><rect x="107" y="26" width="6" height="14" fill="#d4a017"/><rect x="102" y="30" width="16" height="5" fill="#d4a017"/></g>
   <g ${h("iconostasis")}><rect x="14" y="98" width="192" height="12" rx="3" fill="#8d6b2f"/>${[28,52,76,100,124,148,172,190].map(x=>`<rect x="${x}" y="99" width="12" height="10" rx="2" fill="#f4d58d"/>`).join("")}</g>
   <g ${h("candles")}>${[34,64,156,186].map(x=>`<circle cx="${x}" cy="124" r="5" fill="#ffb02e"/><rect x="${x-2}" y="128" width="4" height="9" fill="#fff3d6"/>`).join("")}</g>
   <g ${h("icons")}>${[140,170,200,230,260].map(y=>`<rect x="16" y="${y}" width="9" height="20" rx="2" fill="#6f55c9"/><rect x="195" y="${y}" width="9" height="20" rx="2" fill="#6f55c9"/>`).join("")}</g>
   <g ${h("incense")}><circle cx="110" cy="190" r="22" fill="#cfe6ff" opacity=".75"/><circle cx="104" cy="182" r="9" fill="#e9f3ff" opacity=".9"/><circle cx="118" cy="194" r="11" fill="#e9f3ff" opacity=".9"/></g>
   <g ${h("door")}><rect x="88" y="278" width="44" height="12" rx="2" fill="#8d6b2f"/><path d="M110 262 l-10 12 h20z" fill="#3fae6a"/></g></svg>`}
function tourStart(){loading();call({mode:"tour"}).then(r=>{TR={stops:r.stops,i:0};tourStop()}).catch(problem)}
function tourStop(){
  const s=TR.stops[TR.i],last=TR.i===TR.stops.length-1;
  H.innerHTML=`${back()}<div class="ll-prog">Stop ${TR.i+1} of ${TR.stops.length}<i style="--w:${Math.round(TR.i/TR.stops.length*100)}%"></i></div>
   <div class="ll-tour"><div class="ll-planbox">${plan(s.spot)}</div><div class="ll-tbody"><div class="ll-stop"><span aria-hidden="true">${TOURIC[s.spot]||"⛪"}</span><h2>${E(s.name)}</h2></div>${bubble(last?"excited":"happy",`<p class="ll-t">${E(s.text)}</p><div class="lm-src"><span class="lm-chip">${E(s.label)}</span></div>`)}</div></div>
   <div class="two"><button class="btn alt" data-tour="-1" ${TR.i===0?"disabled":""}>⬅ Back</button>${last?`<button class="btn gold" data-lb="menu">Finish the tour 🎉</button>`:`<button class="btn gold" data-tour="1">Next stop ➡</button>`}</div>`;wire()}

/* ---------- clicks ---------- */
function wire(){
  H.onclick=e=>{
    const t=e.target.closest("button");if(!t)return;
    if(t.dataset.mode){const m=t.dataset.mode;return m==="quiz"?quizStart():m==="saints"?saintsStart():m==="stories"?storiesList():m==="words"?wordsPage():tourStart()}
    if(t.dataset.lb){return t.dataset.lb==="stories"?storiesList():menu()}
    if(t.dataset.topic)return quizStart(t.dataset.topic);
    if(t.dataset.pick!==undefined)return quizPick(+t.dataset.pick);
    if(t.dataset.next)return quizNext();
    if(t.dataset.more){G.shown=Math.min(G.rounds[G.i].clues.length,G.shown+1);return paintClues()}
    if(t.dataset.spick!==undefined)return saintPick(+t.dataset.spick);
    if(t.dataset.snext)return saintNext();
    if(t.dataset.story)return storyOpen(t.dataset.story);
    if(t.dataset.spage){ST.p=Math.max(0,Math.min(ST.s.pages.length,ST.p+(+t.dataset.spage)));return storyPage()}
    if(t.dataset.askme&&window.lumiGoAsk)return lumiGoAsk("Tell me about: "+t.dataset.askme);
    if(t.dataset.word)return wordsPage(t.dataset.word);
    if(t.dataset.tour){TR.i=Math.max(0,Math.min(TR.stops.length-1,TR.i+(+t.dataset.tour)));return tourStop()}}}

window.lumiLearnMount=function(host,startMode){
  H=host;host.className="ll-host";
  if(!URL_()){host.innerHTML=bubble("sleepy",`<p class="ll-t">Lumi is still sleeping 💤</p>`);return}
  if(startMode==="quiz")return quizStart();if(startMode==="saints")return saintsStart();if(startMode==="stories")return storiesList();if(startMode==="words")return wordsPage();if(startMode==="tour")return tourStart();
  menu()};
window.lumiLearnModes=MODES;

const st=document.createElement("style");
st.textContent=`
.ll-host{display:flex;flex-direction:column;gap:12px}.ll-say{display:flex;gap:10px;align-items:flex-end}.ll-face{flex:none;width:64px;height:64px}
.ll-bub{flex:1;min-width:0;padding:12px 14px;border-radius:20px 20px 20px 6px;background:var(--glass);border:1px solid var(--glass-b);display:flex;flex-direction:column;gap:8px}.ll-bub .ll-t{margin:0;font-size:1.12rem;line-height:1.5}
.ll-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.ll-tile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:16px;min-height:120px;border-radius:var(--r-l);border:1px solid var(--glass-b);background:linear-gradient(160deg,color-mix(in srgb,#7fb7ee 22%,var(--glass)),var(--glass));color:var(--ink);font:inherit}
.ll-tile .ic{font-size:2.2rem}.ll-tile b{font-family:var(--display);font-size:1.1rem}.ll-tile small{color:var(--muted);font-weight:700}
.ll-back{align-self:flex-start}.ll-h{margin:0;font-size:1.2rem}.ll-chips .ds-chip{min-height:48px}
.ll-opts{display:flex;flex-direction:column;gap:10px}.ll-opt{min-height:56px;padding:12px 16px;border-radius:16px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;font-size:1.05rem;text-align:left;line-height:1.4}
.ll-opt.good{border-color:var(--good,#3fae6a);background:color-mix(in srgb,var(--good,#3fae6a) 22%,var(--surface))}.ll-opt.bad{border-color:var(--bad,#d4553b);background:color-mix(in srgb,var(--bad,#d4553b) 18%,var(--surface))}
.ll-next{margin-top:8px}.ll-prog{font-weight:900;color:var(--muted);font-size:.9rem;display:flex;flex-direction:column;gap:6px}.ll-prog i{display:block;height:8px;border-radius:99px;background:var(--line);position:relative;overflow:hidden}.ll-prog i::after{content:"";position:absolute;inset:0;width:var(--w);background:var(--gold);border-radius:99px}
.ll-end{text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px}.ll-end h2{margin:0}
.ll-clue{padding:6px 0;border-bottom:1px dashed var(--line)}.ll-slist{display:flex;flex-direction:column;gap:8px}.ll-story{display:flex;align-items:center;gap:10px;min-height:52px;padding:10px 14px;border-radius:16px;border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit;font-weight:700;text-align:left}
.ll-dots{display:flex;gap:6px}.ll-dots i{width:10px;height:10px;border-radius:50%;background:var(--line)}.ll-dots i.on{background:var(--gold)}
.ll-page{padding:22px 18px;border-radius:var(--r-l);background:linear-gradient(160deg,color-mix(in srgb,var(--gold) 14%,var(--glass)),var(--glass));border:1px solid var(--glass-b);min-height:150px;display:flex;align-items:center}.ll-ptxt{margin:0;font-size:1.3rem;line-height:1.65;font-weight:600}
.ll-acts{display:flex;flex-wrap:wrap;gap:8px}.ll-acts .btn{flex:1 1 160px}
.ll-tour{display:flex;flex-direction:column;gap:12px}.ll-planbox{align-self:center;width:min(220px,60vw);padding:8px;border-radius:var(--r-l);background:var(--glass);border:1px solid var(--glass-b)}.ll-plan{width:100%;height:auto;display:block}
.ll-plan [data-spot]{opacity:.45;transition:opacity .3s}.ll-plan [data-spot].hot{opacity:1;filter:drop-shadow(0 0 5px #ffb02e);animation:llpulse 1.6s ease-in-out infinite}
@keyframes llpulse{0%,100%{opacity:.8}50%{opacity:1}}.ll-stop{display:flex;align-items:center;gap:10px}.ll-stop span{font-size:2rem}.ll-stop h2{margin:0}
@media (min-width:700px){.ll-tour{flex-direction:row;align-items:flex-start}.ll-tbody{flex:1;display:flex;flex-direction:column;gap:10px}}
.lm-modes{display:flex;flex-wrap:wrap;gap:8px}.lm-modes button{min-height:44px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit;font-weight:800}
@media (prefers-reduced-motion:reduce){.ll-plan [data-spot].hot{animation:none}}`;
document.head.appendChild(st);
})();
