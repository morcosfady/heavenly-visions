/* Heavenly Visions: Ask Lumi, the chat screen (Phase 2).
   Lumi the Little Lamb answers kid questions about God and the Church from approved cards.
   PHASE 2 uses a SAMPLE ANSWER ENGINE that runs on this device so the design can be seen (it reads lumi/cards.json, approved or not).
   Phase 3 replaces fakeAnswer() with the real server (search, AI, safety). The answer shape stays the same:
   { answer, verse:{text,ref}|null, sources:[{id,title,label}], links:[routes], mood, followups:[strings] }
   English only. No audio. History and saved answers live on this device (hv_lumi). */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ================= Lumi, the little lamb (original drawing) ================= */
window.hvLumiSvg=function(mood,size,cls){
  mood=mood||"happy";const s=size||120;
  const closed=mood==="praying"||mood==="sleepy";
  const eyes=closed?`<path d="M79 105 Q86 99 93 105" fill="none" stroke="#2b2540" stroke-width="3.2" stroke-linecap="round"/><path d="M107 105 Q114 99 121 105" fill="none" stroke="#2b2540" stroke-width="3.2" stroke-linecap="round"/>`
   :`<g class="lm-eyes"><circle cx="86" cy="104" r="8" fill="#2b2540"/><circle cx="114" cy="104" r="8" fill="#2b2540"/><circle cx="${mood==="thinking"?84:88}" cy="${mood==="thinking"?100:101}" r="3" fill="#fff"/><circle cx="${mood==="thinking"?112:116}" cy="${mood==="thinking"?100:101}" r="3" fill="#fff"/></g>`;
  const mouth={happy:`<path d="M91 124 Q100 133 109 124" fill="none" stroke="#b55a6a" stroke-width="3" stroke-linecap="round"/>`,
    excited:`<path d="M90 122 Q100 138 110 122 Z" fill="#b55a6a"/><path d="M95 129 Q100 133 105 129" fill="#f48fa0"/>`,
    gentle:`<path d="M93 125 Q100 130 107 125" fill="none" stroke="#b55a6a" stroke-width="3" stroke-linecap="round"/>`,
    thinking:`<path d="M95 126 L106 125" fill="none" stroke="#b55a6a" stroke-width="3" stroke-linecap="round"/>`,
    praying:`<path d="M93 125 Q100 130 107 125" fill="none" stroke="#b55a6a" stroke-width="3" stroke-linecap="round"/>`,
    sleepy:`<ellipse cx="100" cy="126" rx="4" ry="3" fill="#b55a6a"/>`}[mood]||"";
  const extra={thinking:`<g class="lm-dots"><circle cx="150" cy="58" r="4" fill="#9fc6ee"/><circle cx="162" cy="46" r="5.5" fill="#9fc6ee"/><circle cx="178" cy="30" r="8" fill="#9fc6ee"/></g>`,
    excited:`<g class="lm-spark" fill="#f6c453"><path d="M34 62 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M168 74 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/></g>`,
    sleepy:`<g fill="#9fc6ee" font-family="Nunito,sans-serif" font-weight="900"><text x="146" y="62" font-size="22">z</text><text x="162" y="44" font-size="28">Z</text></g>`}[mood]||"";
  const hooves=mood==="praying"?`<ellipse cx="94" cy="152" rx="9" ry="12" fill="#fdebd9" stroke="#e7c9b0" stroke-width="2" transform="rotate(14 94 152)"/><ellipse cx="106" cy="152" rx="9" ry="12" fill="#fdebd9" stroke="#e7c9b0" stroke-width="2" transform="rotate(-14 106 152)"/>`:"";
  return `<svg class="lumi-svg lm-${mood} ${cls||""}" viewBox="0 0 200 200" width="${s}" height="${s}" role="img" aria-label="Lumi the little lamb, ${mood}" xmlns="http://www.w3.org/2000/svg">
   <g class="lm-body"><ellipse class="lm-halo" cx="100" cy="36" rx="32" ry="8.5" fill="none" stroke="#f6c453" stroke-width="5"/>
   <g fill="#fff" stroke="#dfe9f6" stroke-width="2"><circle cx="100" cy="132" r="56"/><circle cx="52" cy="96" r="25"/><circle cx="148" cy="96" r="25"/><circle cx="68" cy="62" r="24"/><circle cx="132" cy="62" r="24"/><circle cx="100" cy="52" r="24"/><circle cx="50" cy="136" r="22"/><circle cx="150" cy="136" r="22"/><circle cx="76" cy="164" r="22"/><circle cx="124" cy="164" r="22"/></g>
   <ellipse cx="62" cy="106" rx="12" ry="19" fill="#fdebd9" stroke="#e7c9b0" stroke-width="2" transform="rotate(-28 62 106)"/><ellipse cx="138" cy="106" rx="12" ry="19" fill="#fdebd9" stroke="#e7c9b0" stroke-width="2" transform="rotate(28 138 106)"/>
   <ellipse cx="62" cy="108" rx="5.5" ry="11" fill="#f6b8c0" transform="rotate(-28 62 108)"/><ellipse cx="138" cy="108" rx="5.5" ry="11" fill="#f6b8c0" transform="rotate(28 138 108)"/>
   <ellipse cx="100" cy="110" rx="38" ry="34" fill="#fdebd9" stroke="#e7c9b0" stroke-width="2"/>
   <path d="M70 82 Q100 66 130 82 Q124 70 100 66 Q76 70 70 82Z" fill="#fff"/>
   ${eyes}<ellipse cx="72" cy="119" rx="8" ry="5.5" fill="#f4a3b0" opacity=".65"/><ellipse cx="128" cy="119" rx="8" ry="5.5" fill="#f4a3b0" opacity=".65"/>
   <ellipse cx="100" cy="116" rx="4.5" ry="3.2" fill="#e08a96"/>${mouth}
   <path d="M80 144 Q100 166 120 144" fill="none" stroke="#e3b45c" stroke-width="2.6" stroke-linecap="round"/><g fill="#e3b45c"><rect x="97" y="156" width="6" height="18" rx="2"/><rect x="91" y="161" width="18" height="6" rx="2"/></g>
   ${hooves}</g>${extra}</svg>`};

/* ================= the sample answer engine (Phase 2 only) ================= */
const SYN=[["mary","virgin","theotokos","mother of god","our lady","madonna"],["jesus","christ","savior","saviour","messiah"],["church","temple","cathedral"],["communion","eucharist","qurbana","korban","offering"],
  ["baptism","baptize","baptized","baptised","christening"],["priest","abouna","clergy"],["pope","patriarch"],["fast","fasting","lent","abstain","vegan"],["christmas","nativity","birth","born","bethlehem"],["easter","pascha","resurrection","risen"],
  ["cross","crucifixion","crucified","golgotha"],["haykal","altar","sanctuary","iconostasis"],["incense","censer","smoke"],["icon","icons","picture"],["agpeya","hours","prayer book"],["pray","prayer","prayers","praying"],
  ["martyr","martyrs","martyrdom"],["angel","angels","michael","gabriel","archangel"],["nayrouz","new year","tout"],["liturgy","mass","qodas","service","worship"],["bible","scripture","testament","gospel"],
  ["sin","forgive","forgiveness","confession","repent"],["egypt","holy family"],["spirit","holy spirit","pentecost"],["trinity","three persons"],["saint","saints","synaxarium"]];
const STOP=new Set("a an the is are was were do does did to of in on at it its and or for why what who how when where which can we you i me my our us they them that this with about tell please there so be have has had will would should could from by as if not no yes am lumi know mean means called say said".split(" "));
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
const stem=w=>w.length>5&&/ing$/.test(w)?w.slice(0,-3):w.length>4&&/ies$/.test(w)?w.slice(0,-3)+"y":w.length>3&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w.length>4&&/ed$/.test(w)?w.slice(0,-2):w;
const words=s=>norm(s).split(" ").filter(w=>w&&!STOP.has(w)).map(stem);
let CARDS=null,LOADING=null;
function loadCards(){if(CARDS)return Promise.resolve(CARDS);if(LOADING)return LOADING;
  LOADING=fetch("lumi/cards.json").then(r=>{if(!r.ok)throw 0;return r.json()}).then(c=>{CARDS=c.map(x=>Object.assign(x,{_t:words(x.title),_k:words((x.kw||[]).join(" ")),_g:words((x.tags||[]).join(" ")),_x:words(x.text)}));return CARDS}).catch(()=>{LOADING=null;throw 0});return LOADING}
function expand(q){const main=new Set(words(q)),extra=new Set(),n=norm(q);
  SYN.forEach(g=>{const hit=[...main].some(w=>g.some(t=>words(t).includes(w)))||g.some(t=>t.includes(" ")&&n.includes(t));if(hit)g.forEach(t=>words(t).forEach(w=>{if(!main.has(w))extra.add(w)}))});return {main:[...main],extra:[...extra],n}}
function search(q,level){const Q=expand(q);if(!Q.main.length)return [];const N=CARDS.length,df={};
  CARDS.forEach(c=>new Set([...c._t,...c._k,...c._g,..._x(c)]).forEach(w=>df[w]=(df[w]||0)+1));
  const idf=w=>Math.log(1+N/(1+(df[w]||0)));
  return CARDS.map(c=>{let s=0,hits=0;Q.main.forEach(w=>{let h=0;if(c._t.includes(w)){s+=6*idf(w);h=1}if(c._k.includes(w)){s+=5*idf(w);h=1}if(c._g.includes(w)){s+=3*idf(w);h=1}if(c._x.includes(w)){s+=1.2*idf(w);h=1}hits+=h});
    Q.extra.forEach(w=>{if(c._t.includes(w))s+=2.5*idf(w);if(c._k.includes(w))s+=2*idf(w);if(c._g.includes(w))s+=1.2*idf(w)});
    if(Q.n.length>4&&(norm(c.title).includes(Q.n)||c._kn&&c._kn.includes(Q.n)))s+=8;s*=.5+.5*hits/Q.main.length;
    if(level==="little"&&c.level==="older")s*=.8;if(level==="older"&&c.level==="little")s*=.85;return {c,s}}).filter(x=>x.s>=4).sort((a,b)=>b.s-a.s).slice(0,4)}
const _x=c=>c._x;
const sentences=t=>t.match(/[^.!?]+[.!?]+(\s|$)/g)||[t];
const MOOD={prayer:"praying",sacrament:"gentle",martyr:"gentle",fast:"gentle"};
const label=c=>c.source.startsWith("Bible")?"📖 "+(c.ref||"Bible"):c.source.startsWith("St-Takla")?"📚 St-Takla.org":/Synaxarium/.test(c.source)?"📜 Synaxarium":/app content/.test(c.source)?"🏠 Our lessons":"⛪ Church teaching";
async function fakeAnswer(q,level){
  await loadCards();const hits=search(q,level);
  if(!hits.length)return {answer:"That's a great question! I don't know that one yet. Ask your servant or Abouna on Sunday 🙏",verse:null,sources:[],links:[],mood:"gentle",followups:[],unknown:true};
  const top=hits[0].c,sn=sentences(top.text.trim()),n=level==="little"?3:7;
  const tail=level==="little"?" 🐑":"";
  const rel=CARDS.filter(c=>c.id!==top.id&&c.tags.some(t=>top.tags.includes(t))).sort((a,b)=>(b.tags.filter(t=>top.tags.includes(t)).length)-(a.tags.filter(t=>top.tags.includes(t)).length)).slice(0,3).map(c=>c.title);
  const mood=top.tags.map(t=>MOOD[t]).find(Boolean)||(level==="little"?"happy":"happy");
  return {answer:sn.slice(0,n).join("").trim()+tail,verse:top.verse||null,sources:hits.slice(0,3).map(h=>({id:h.c.id,title:h.c.title,label:label(h.c)})).filter((x,i,arr)=>arr.findIndex(y=>y.label===x.label)===i).slice(0,2),links:(top.links||[]).slice(0,2),mood,followups:rel}}

/* ================= suggestions by grade and season ================= */
const LITTLE=["Who is Jesus?","Who is St. Mary?","Tell me about Noah","Why do we go to church?","Who is Archangel Michael?","Why do we pray?","Who made the world?","What is baptism?"];
const OLDER=["What is the Trinity?","Why do we use incense?","What is Nayrouz?","Who is St. Mark?","What is the Liturgy?","What are the seven sacraments?","Why do we fast?","What is the iconostasis?"];
const levelOf=()=>{const a=A(),g=a&&a.user.grade;return g&&!["Pre K","KG","Grade 1","Grade 2"].includes(g)?"older":"little"};
function seasonal(){const o=[];try{const c=window.hvCalToday?hvCalToday():null;if(c){
  if(c.fast){const t=c.fast.t||"";o.push(/Nativity/i.test(t)?"Why do we fast before Christmas?":/Great Lent/i.test(t)?"What is Great Lent?":/Apostles/i.test(t)?"What is the Apostles Fast?":/Mary/i.test(t)?"Why do we fast for St. Mary?":"What is fasting?")}
  const fe=c.ev.find(x=>x.type==="feast"),sa=c.ev.find(x=>x.type==="saint");if(fe)o.unshift("What is "+fe.t+"?");else if(sa)o.unshift("Who is "+sa.t+"?")}}catch{}return o}
function suggestions(n){const pool=levelOf()==="little"?LITTLE:OLDER,day=Math.floor(Date.now()/864e5);const rot=pool.slice(day%pool.length).concat(pool.slice(0,day%pool.length));return seasonal().concat(rot).filter((q,i,a)=>a.indexOf(q)===i).slice(0,n||4)}

/* ================= state ================= */
const S={tab:"chat",msgs:[],busy:false,mood:"happy",emoji:false};
const hist=()=>jget("hv_lumi",[]);
const saveHist=h=>jset("hv_lumi",h.slice(0,60));
const LINKTXT=r=>/^quiz-/.test(r)?["🏆","Take the quiz"]:/^l-/.test(r)?["▶","Watch the lesson"]:r==="calendar"?["📅","See in calendar"]:r==="m-saints"?["👼","More saints"]:r==="m-feasts"?["🎉","More feasts"]:r==="verse"?["📜","Daily verse"]:r==="games"?["🎮","Play a game"]:/^b-|^bible$/.test(r)?["📖","Read it in the Bible"]:r==="bedtime"?["🌙","Bedtime stories"]:r==="coloring"?["🎨","Coloring"]:null;
const EMOJIS=["😊","🙏","✝️","⭐","📖","🕊️","🐑","❤️","🎉","😮","🤔","👍"];

function avatar(){const a=A();return a?(window.hvAvatarOf&&a.user.av?hvAvatarOf(a,34):`<span>${E(a.avatar||"😇")}</span>`):"<span>🙂</span>"}
function ansHtml(en,saved){const a=en.a;
  return `<div class="lm-msg lm-l"><div class="lm-face">${hvLumiSvg(a.mood,38)}</div><div class="lm-bub" data-e="${en.id}">
   <p class="lm-t">${E(a.answer)}</p>
   ${a.verse?`<div class="lm-verse">“${E(a.verse.text)}”<b>${E(a.verse.ref)}</b></div>`:""}
   ${a.sources&&a.sources.length?`<div class="lm-src">${a.sources.map(s=>`<span class="lm-chip">${E(s.label)}</span>`).join("")}</div>`:""}
   ${a.links&&a.links.length?`<div class="lm-links">${a.links.map(r=>{const t=LINKTXT(r);return t?`<button class="lm-lb" data-go="${E(r)}">${t[0]} ${t[1]}</button>`:""}).join("")}</div>`:""}
   <div class="lm-fb"><button class="lm-ic" data-fb="up" aria-label="Good answer" aria-pressed="${en.fb==="up"}">👍</button><button class="lm-ic" data-fb="down" aria-label="Not a good answer" aria-pressed="${en.fb==="down"}">👎</button><button class="lm-ic" data-sv="1" aria-label="Save this answer" aria-pressed="${!!en.saved}">${en.saved?"⭐":"☆"}</button></div>
   ${a.followups&&a.followups.length?`<div class="lm-fu">${a.followups.map(f=>`<button class="lm-sug" data-q="${E(f)}">${E(f)}</button>`).join("")}</div>`:""}</div></div>`}
function kidHtml(q){return `<div class="lm-msg lm-k"><div class="lm-bub lm-kb"><p class="lm-t">${E(q)}</p></div><div class="lm-av">${avatar()}</div></div>`}
const typing=()=>`<div class="lm-msg lm-l" id="lmtyping"><div class="lm-face">${hvLumiSvg("thinking",38)}</div><div class="lm-bub"><span class="lm-dot"></span><span class="lm-dot"></span><span class="lm-dot"></span></div></div>`;

function hero(){return `<div class="lm-hero"><div class="lm-big" id="lmbig">${hvLumiSvg(S.mood,128)}</div><div class="lm-name"><h1>Ask Lumi</h1><div class="tag">Your little lamb helper <span class="lm-prev">Preview</span></div></div></div>`}
function todayCard(){let t=null;try{const c=window.hvCalToday?hvCalToday():null;if(c){const x=c.ev.find(e=>e.type==="feast")||c.ev.find(e=>e.type==="saint");if(x)t={ic:x.ic,t:x.t,q:x.type==="feast"?"What is "+x.t+"?":"Who is "+x.t+"?"}}}catch{}
  return t?`<div class="lm-today"><span class="lm-ti" aria-hidden="true">${t.ic}</span><div><div class="k">Today</div><b>${E(t.t)}</b></div><button class="btn alt" data-q="${E(t.q)}">Ask Lumi about it</button></div>`:""}

function page(){
  const a=A();
  const top=`<div class="topbar"><button class="back" data-go="home">← Back</button></div>`;
  if(!a){app.innerHTML=`${top}<div class="lm-wrap">${hero()}<div class="card sec" style="text-align:center"><b>Login to chat with Lumi</b><p class="tag" style="margin:4px 0 8px">Lumi knows you by your profile, so only you see your questions.</p><button class="btn gold" data-go="login">👤 Login</button></div></div>`;return}
  S.msgs=[];S.mood="happy";
  app.innerHTML=`${top}<div class="lm-wrap">${hero()}
   <div class="ds-seg" id="lmtabs" role="tablist">${[["chat","💬 Chat"],["mine","🕘 My questions"],["saved","⭐ Saved"]].map(t=>`<button data-tab="${t[0]}" aria-pressed="${S.tab===t[0]}" role="tab">${t[1]}</button>`).join("")}</div>
   <div id="lmbody"></div></div>`;
  document.getElementById("lmtabs").onclick=e=>{const b=e.target.closest("[data-tab]");if(!b)return;S.tab=b.dataset.tab;document.querySelectorAll("#lmtabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()};
  draw();
  try{const lq=new URLSearchParams(location.search).get("lq");if(lq&&location.hostname==="localhost")setTimeout(()=>ask(lq),500)}catch{}}

function setMood(m){S.mood=m;const b=document.getElementById("lmbig");if(b)b.innerHTML=hvLumiSvg(m,128)}
function draw(){
  const body=document.getElementById("lmbody");if(!body)return;
  if(S.tab==="chat"){
    body.innerHTML=`${todayCard()}<div id="lmlog" class="lm-log" aria-live="polite">${S.msgs.length?"":`<div class="lm-msg lm-l"><div class="lm-face">${hvLumiSvg("happy",38)}</div><div class="lm-bub"><p class="lm-t">Hi ${E(((A().user.first||A().user.name||"friend")+"").split(" ")[0])}! I'm Lumi, a little lamb who loves talking about God and the Church. What would you like to know? 🐑</p></div></div>`}</div>
     <div id="lmsug" class="lm-sugs">${S.msgs.length?"":`<div class="lm-sugh">Try asking</div>${suggestions(4).map(q=>`<button class="lm-sug" data-q="${E(q)}">${E(q)}</button>`).join("")}`}</div>
     <form id="lmform" class="lm-form" autocomplete="off"><div id="lmemo" class="lm-emo" hidden>${EMOJIS.map(x=>`<button type="button" class="lm-ic" data-em="${x}" aria-label="Add ${x}">${x}</button>`).join("")}</div>
      <div class="lm-row"><button type="button" class="lm-ic" id="lmem" aria-label="Pick an emoji" aria-expanded="false">😊</button><input id="lmin" maxlength="200" placeholder="Ask Lumi a question… 🐑" aria-label="Your question"><button class="lm-send" type="submit" aria-label="Send">➤</button></div><div class="lm-cnt" id="lmcnt" hidden></div></form>`;
    wireChat();S.msgs.forEach(m=>appendEntry(m));scrollEnd();return}
  const h=hist(),list=S.tab==="saved"?h.filter(x=>x.saved):h;
  body.innerHTML=list.length?`<div class="lm-hl">${list.map(x=>`<button class="lm-hi" data-open="${x.id}"><span class="lm-hq">${E(x.q)}</span><span class="lm-ha">${E(x.a.answer.slice(0,90))}${x.a.answer.length>90?"…":""}</span><small>${new Date(x.ts).toLocaleDateString("en-US",{month:"short",day:"numeric"})}${x.saved?" · ⭐":""}</small></button>`).join("")}</div>`
    :`<div class="ds-empty"><div class="em">${S.tab==="saved"?"⭐":"🕘"}</div><b>${S.tab==="saved"?"No saved answers yet":"No questions yet"}</b>${S.tab==="saved"?"Tap the star under an answer to keep it here.":"Ask Lumi something and it will show up here."}</div>`;
  body.onclick=e=>{const b=e.target.closest("[data-open]");if(!b)return;const x=hist().find(y=>y.id===b.dataset.open);if(!x)return;
    sheet(`<h3>${E(x.q)}</h3><div class="lm-sheet">${ansHtml(x)}</div>`,"Answer")}}

function appendEntry(en){const log=document.getElementById("lmlog");if(!log)return;log.insertAdjacentHTML("beforeend",kidHtml(en.q)+ansHtml(en))}
function scrollEnd(){const f=document.getElementById("lmform");if(f)f.scrollIntoView({block:"end",behavior:reduce()?"auto":"smooth"})}

async function ask(q){
  q=q.trim().slice(0,200);if(!q||S.busy)return;S.busy=true;
  const log=document.getElementById("lmlog"),sug=document.getElementById("lmsug"),inp=document.getElementById("lmin");if(!log)return S.busy=false;
  if(inp)inp.value="";if(sug)sug.innerHTML="";
  log.insertAdjacentHTML("beforeend",kidHtml(q)+typing());setMood("thinking");scrollEnd();
  const t0=Date.now();let a;
  try{a=await fakeAnswer(q,levelOf())}catch{a=null}
  await new Promise(r=>setTimeout(r,Math.max(0,(reduce()?150:900)-(Date.now()-t0))));
  document.getElementById("lmtyping")?.remove();
  if(!a){log.insertAdjacentHTML("beforeend",`<div class="lm-msg lm-l"><div class="lm-face">${hvLumiSvg("sleepy",38)}</div><div class="lm-bub"><p class="lm-t">Lumi is sleeping 💤 I could not reach my cards. Check your internet and try again.</p></div></div>`);setMood("sleepy");S.busy=false;scrollEnd();return}
  const en={id:uid(),q,a,ts:Date.now(),level:levelOf()};
  S.msgs.push(en);const h=hist();h.unshift(en);saveHist(h);
  log.insertAdjacentHTML("beforeend",ansHtml(en));setMood(a.mood);
  if(a.followups&&a.followups.length===0&&sug)sug.innerHTML=`<div class="lm-sugh">Try asking</div>${suggestions(3).map(x=>`<button class="lm-sug" data-q="${E(x)}">${E(x)}</button>`).join("")}`;
  S.busy=false;scrollEnd();}

function wireChat(){
  const form=document.getElementById("lmform"),inp=document.getElementById("lmin"),cnt=document.getElementById("lmcnt"),body=document.getElementById("lmbody");
  form.onsubmit=e=>{e.preventDefault();ask(inp.value)};
  inp.oninput=()=>{const n=inp.value.length;cnt.hidden=n<150;cnt.textContent=(200-n)+" letters left"};
  document.getElementById("lmem").onclick=e=>{const p=document.getElementById("lmemo");p.hidden=!p.hidden;e.currentTarget.setAttribute("aria-expanded",!p.hidden)};
  form.addEventListener("click",e=>{const b=e.target.closest("[data-em]");if(b){inp.value=(inp.value+b.dataset.em).slice(0,200);inp.focus()}});
  body.onclick=e=>{
    const q=e.target.closest("[data-q]");if(q)return ask(q.dataset.q);
    const bub=e.target.closest(".lm-bub[data-e]");if(!bub)return;const id=bub.dataset.e,h=hist(),en=h.find(x=>x.id===id);if(!en)return;
    const fb=e.target.closest("[data-fb]"),sv=e.target.closest("[data-sv]");
    if(fb){en.fb=en.fb===fb.dataset.fb?"":fb.dataset.fb;saveHist(h);bub.querySelectorAll("[data-fb]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.fb===en.fb));toast(en.fb==="down"?"Thanks. A servant will take a look 🙏":en.fb==="up"?"Thank you! 🐑":"OK")}
    if(sv){en.saved=!en.saved;saveHist(h);sv.setAttribute("aria-pressed",en.saved);sv.textContent=en.saved?"⭐":"☆";toast(en.saved?"Saved ⭐":"Removed from saved")}}}

/* ================= home door and route ================= */
window.hvLumiDoor=function(){return `<button class="door d-lumi wide" data-go="lumi"><span class="big lm-peek" aria-hidden="true">${hvLumiSvg("happy",92)}</span><b>Ask Lumi</b><small>Questions about God and the Church</small></button>`};
window.lumiChatRoute=function(h){if(h==="lumi"){page();return true}return false};

const st=document.createElement("style");
st.textContent=`
.lumi-svg{display:block;overflow:visible;filter:drop-shadow(0 6px 10px rgba(40,70,120,.25))}
.lm-halo{filter:drop-shadow(0 0 6px rgba(246,196,83,.9));animation:lmhalo 3.6s ease-in-out infinite}
.lm-body{animation:lmbob 3.4s ease-in-out infinite;transform-origin:50% 90%}.lm-thinking .lm-body{animation:lmtilt 2.6s ease-in-out infinite}.lm-excited .lm-body{animation:lmjump .9s ease-in-out infinite}
.lm-eyes{animation:lmblink 5s infinite;transform-box:fill-box;transform-origin:center}
.lm-dots circle{animation:lmpop 1.6s ease-in-out infinite}.lm-dots circle:nth-child(2){animation-delay:.25s}.lm-dots circle:nth-child(3){animation-delay:.5s}
.lm-spark{animation:lmhalo 1.2s ease-in-out infinite}
@keyframes lmbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes lmtilt{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(3deg)}}
@keyframes lmjump{0%,100%{transform:translateY(0)}40%{transform:translateY(-9px)}}@keyframes lmblink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes lmhalo{0%,100%{opacity:.75}50%{opacity:1}}@keyframes lmpop{0%,100%{opacity:.35}50%{opacity:1}}
.d-lumi{background:linear-gradient(135deg,#4d9fe0 0%,#2b6fb8 60%,#24589a 100%)!important;grid-column:1/-1;min-height:128px}
.doors .d-lumi{grid-column:1/-1}.d-lumi .big{right:14px;top:10px;font-size:1rem}.d-lumi .big .lumi-svg{filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
.lm-wrap{display:flex;flex-direction:column;gap:12px;max-width:760px;margin-inline:auto;width:100%}
.lm-hero{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:var(--r-l);background:linear-gradient(135deg,rgba(150,200,245,.28),rgba(255,255,255,.08));border:1px solid var(--glass-b)}
.lm-big{flex:none;width:128px;height:128px}.lm-name h1{margin:0}.lm-prev{display:inline-block;margin-left:6px;font-size:.7rem;font-weight:900;padding:2px 8px;border-radius:999px;background:var(--gold-soft);color:var(--ink);vertical-align:middle}
.lm-today{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:var(--r-l);border:1px solid color-mix(in srgb,var(--gold) 50%,transparent);background:var(--glass)}.lm-today>div{flex:1;min-width:140px}.lm-ti{font-size:2rem}.lm-today .k{font-size:.75rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
.lm-log{display:flex;flex-direction:column;gap:12px;min-height:120px}
.lm-msg{display:flex;gap:8px;align-items:flex-end;animation:rise .25s cubic-bezier(.2,.8,.2,1) both}.lm-k{justify-content:flex-end}
.lm-face{flex:none;width:38px;height:38px}.lm-av{flex:none;width:34px;height:34px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:var(--glass);font-size:1.4rem}
.lm-bub{max-width:min(82%,560px);padding:12px 14px;border-radius:20px 20px 20px 6px;background:var(--glass);border:1px solid var(--glass-b);box-shadow:0 4px 14px -6px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:8px}
.lm-kb{border-radius:20px 20px 6px 20px;background:var(--gold);color:#2b1d05;border-color:transparent}
.lm-t{margin:0;font-size:1.1rem;line-height:1.55}
.lm-verse{border:2px solid var(--gold);border-radius:14px;padding:10px 12px;background:color-mix(in srgb,var(--gold) 12%,transparent);font-family:var(--display);font-size:1.02rem;line-height:1.45}.lm-verse b{display:block;margin-top:4px;font-family:inherit;font-size:.85rem;color:var(--gold)}
.lm-src,.lm-links,.lm-fu,.lm-sugs{display:flex;flex-wrap:wrap;gap:8px}.lm-chip{font-size:.78rem;font-weight:800;padding:4px 10px;border-radius:999px;background:var(--line);color:var(--ink)}
.lm-lb,.lm-sug{min-height:44px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--gold);background:transparent;color:var(--ink);font:inherit;font-weight:800;font-size:.95rem;text-align:left}
.lm-lb{background:color-mix(in srgb,var(--gold) 18%,transparent)}.lm-sugh{width:100%;font-weight:900;color:var(--muted);font-size:.85rem}
.lm-fb{display:flex;gap:4px}.lm-ic{min-width:44px;min-height:44px;border-radius:50%;border:0;background:transparent;font-size:1.25rem}.lm-ic[aria-pressed="true"]{background:color-mix(in srgb,var(--gold) 25%,transparent)}
.lm-dot{display:inline-block;width:10px;height:10px;margin:0 3px;border-radius:50%;background:var(--muted);animation:lmdot 1s ease-in-out infinite}.lm-dot:nth-child(2){animation-delay:.15s}.lm-dot:nth-child(3){animation-delay:.3s}
@keyframes lmdot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
.lm-form{position:sticky;bottom:0;display:flex;flex-direction:column;gap:6px;padding:10px 0 calc(8px + env(safe-area-inset-bottom,0px));background:linear-gradient(180deg,transparent,var(--bg) 30%)}
.lm-row{display:flex;gap:8px;align-items:center}.lm-row input{flex:1;min-width:0;min-height:52px;border-radius:999px;padding:0 18px;font-size:1.1rem;border:2px solid var(--line);background:var(--surface);color:var(--ink)}
.lm-send{flex:none;width:52px;height:52px;border-radius:50%;border:0;background:var(--gold);color:#2b1d05;font-size:1.3rem;font-weight:900}
.lm-emo{display:flex;flex-wrap:wrap;gap:2px;padding:6px;border-radius:18px;background:var(--glass);border:1px solid var(--glass-b)}.lm-emo[hidden]{display:none}.lm-cnt{font-size:.8rem;color:var(--muted);text-align:right}
.lm-hl{display:flex;flex-direction:column;gap:10px}.lm-hi{display:flex;flex-direction:column;gap:2px;text-align:left;padding:12px 14px;min-height:56px;border-radius:var(--r-m);border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit}.lm-hq{font-weight:900}.lm-ha{color:var(--muted);font-size:.9rem}.lm-hi small{color:var(--muted)}
.lm-sheet .lm-msg{animation:none}
@media (max-width:420px){.lm-big{width:96px;height:96px}.lm-big .lumi-svg{width:96px;height:96px}.lm-bub{max-width:86%}}
@media (prefers-reduced-motion:reduce){.lm-body,.lm-halo,.lm-eyes,.lm-dots circle,.lm-spark,.lm-dot,.lm-msg{animation:none!important}}`;
document.head.appendChild(st);
})();
