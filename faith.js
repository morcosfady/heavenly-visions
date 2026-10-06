/* Heavenly Visions: Daily Verse Challenge, Prayer Corner, Coptic Calendar.
   Verses come from verses.js (the curriculum memory verses). Dates are computed here (no data needed).
   Prayer texts and the saint list are STARTER content that Fady must review (see HANDOFF). */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}if(window.hvSyncSoon)hvSyncSoon()};
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>new Date();
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);return x};
const diffDays=(a,b)=>Math.round((new Date(b.getFullYear(),b.getMonth(),b.getDate())-new Date(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
const dayOfYear=d=>Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(d.getFullYear(),0,0))/86400000);

/* ---------- speech ---------- */
const AR=()=>window.hvLang&&hvLang()==="ar";
function voices(){return window.speechSynthesis?speechSynthesis.getVoices().filter(v=>new RegExp("^"+(AR()?"ar":"en"),"i").test(v.lang)):[]}
function speak(text){if(!window.speechSynthesis)return toast("This phone cannot read aloud");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.85;u.lang=AR()?"ar-SA":"en-US";
  const want=jget("hv_voice",""),v=voices().find(x=>x.name===want);if(v)u.voice=v;speechSynthesis.speak(u)}
function voicePicker(){const vs=voices();if(vs.length<2)return "";const cur=jget("hv_voice","");
  return `<label class="field" style="max-width:260px"><span class="tag">Voice</span><select id="fvoice">${vs.map(v=>`<option value="${E(v.name)}" ${v.name===cur?"selected":""}>${E(v.name)}</option>`).join("")}</select></label>`}
function wirePicker(){const s=document.getElementById("fvoice");if(s)s.onchange=()=>jset("hv_voice",s.value)}
if(window.speechSynthesis)speechSynthesis.onvoiceschanged=()=>{};

/* ========== DAILY VERSE ========== */
function pool(group){
  const L=typeof LVERSE!=="undefined"?LVERSE:{};const out=[];
  Object.keys(L).forEach(k=>{const v=L[k];if(!v[0]||/\.\.\.|…/.test(v[0])||v[0].length<18)return;const g=k.split("|")[0];
    const little=["prek","kg","g1","g2"].includes(g);
    if(group==="little"?(little&&v[0].length<=90):(!little&&["g3","g4","g5"].includes(g)||(g==="g2"&&v[0].length>70)))out.push({text:v[0].trim(),ref:v[1]})});
  const seen={};return out.filter(v=>seen[v.ref]?false:(seen[v.ref]=1))}
function groupOf(){const a=A();const g=a&&a.user.grade;return g&&!["Pre K","KG","Grade 1","Grade 2"].includes(g)?"older":"little"}
function verseFor(d,group){const p=pool(group||groupOf());if(!p.length)return {text:"Let the little children come to Me.",ref:"Matthew 19:14"};return p[dayOfYear(d)*7%p.length]}
window.hvTodayVerse=()=>verseFor(today());
const vstate=()=>jget("hv_verse",{days:{}});
function vstreak(){const st=vstate().days;let n=0,d=today();if(!st[dkey(d)])d=addDays(d,-1);while(st[dkey(d)]){n++;d=addDays(d,-1)}return n}
const words=t=>t.split(/\s+/).filter(Boolean);
const clean=w=>w.replace(/[^A-Za-z']/g,"").toLowerCase();
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const V={step:0,ok:false};
function versePage(){
  const v=verseFor(today()),done=!!vstate().days[dkey(today())];V.v=v;V.step=done?4:0;
  app.innerHTML=`${topbar("Daily Verse","📜","One verse a day","home")}<div id="vbox" class="sec"></div>`;
  drawVerse()}
function dots(){const st=vstate().days,t=today(),start=addDays(t,-t.getDay());
  return `<div class="vweek" role="img" aria-label="This week">${(window.hvWeekdayInitials?hvWeekdayInitials():["S","M","T","W","T","F","S"]).map((n,i)=>{const d=addDays(start,i),on=!!st[dkey(d)],now=diffDays(t,d)===0;return `<span class="${on?"on":""} ${now?"now":""}">${on?"✓":n}</span>`}).join("")}</div>`}
function flame(){const n=vstreak();return `<div class="vflame"><span style="font-size:${(2+Math.min(n,10)*.18).toFixed(2)}rem" class="fl" aria-hidden="true">🔥</span><b>${n}</b><small>${n===1?"day":"days"} in a row</small></div>`}
function drawVerse(){
  const box=document.getElementById("vbox"),v=V.v,s=V.step;
  const head=`<div class="vtop">${flame()}${dots()}</div>`;
  if(s===0){const w=words(v.text);
    box.innerHTML=`${head}<div class="parch" aria-live="polite"><div class="pk">Step 1 of 3. Read it</div><p class="ptxt">${w.map((x,i)=>`<span style="animation-delay:${reduce()?0:i*140}ms">${E(x)} </span>`).join("")}</p><div class="pref" style="animation-delay:${reduce()?0:w.length*140+200}ms">${E(v.ref)}</div></div>
    <div class="two"><button class="btn alt" id="vlisten">🔊 Listen</button><button class="btn gold" id="vnext">I read it ➜</button></div>${voicePicker()}`;
    document.getElementById("vlisten").onclick=()=>speak(v.text+". "+v.ref);document.getElementById("vnext").onclick=()=>{speechSynthesis&&speechSynthesis.cancel();V.step=1;V.game=null;drawVerse()};wirePicker();return}
  if(s===1){const w=words(v.text),parity=dayOfYear(today())%2;
    if(!V.game)V.game=(parity===1&&w.length<=9&&w.length>=3)?{t:"order",w:shuffle(w.map((x,i)=>({x,i}))),got:[]}:blanks(w);
    const g=V.game;
    if(g.t==="order"){box.innerHTML=`${head}<div class="parch"><div class="pk">Step 2 of 3. Put the words in order</div><p class="ptxt vgot" aria-live="polite">${g.got.map(o=>E(o.x)).join(" ")||"..."}</p></div><div class="vchips">${g.w.filter(o=>!g.got.includes(o)).map(o=>`<button class="ds-chip" data-w="${o.i}">${E(o.x)}</button>`).join("")}</div><button class="btn alt" id="vreset">↺ Start again</button>`;
      box.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{const o=g.w.find(x=>x.i===+b.dataset.w);if(o.i===g.got.length){g.got.push(o);if(g.got.length===g.w.length){V.step=2;V.ref=null;setTimeout(drawVerse,500)}else drawVerse()}else{b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}],{duration:260});toast("Not that one. Try again 🙂")}});
      document.getElementById("vreset").onclick=()=>{g.got=[];drawVerse()};return}
    const filled=g.fill;
    box.innerHTML=`${head}<div class="parch"><div class="pk">Step 2 of 3. Fill the missing words</div><p class="ptxt" aria-live="polite">${g.parts.map(p=>p.b?`<span class="vblank ${p.done?"ok":""}">${p.done?E(p.x):"_____"}</span> `:E(p.x)+" ").join("")}</p></div><div class="vchips">${g.opts.filter(o=>!o.used).map(o=>`<button class="ds-chip" data-o="${E(o.x)}">${E(o.x)}</button>`).join("")}</div>`;
    box.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const nxt=g.parts.find(p=>p.b&&!p.done);if(clean(nxt.x)===clean(b.dataset.o)){nxt.done=true;g.opts.find(o=>o.x===b.dataset.o&&!o.used).used=true;if(!g.parts.some(p=>p.b&&!p.done)){V.step=2;V.ref=null;setTimeout(drawVerse,500)}else drawVerse()}else{b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}],{duration:260});toast("Not that one. Try again 🙂")}});return}
  if(s===2){if(!V.ref){const others=shuffle(pool("little").concat(pool("older")).map(x=>x.ref).filter(r=>r!==v.ref));V.ref=shuffle([v.ref,others[0],others[1]])}
    box.innerHTML=`${head}<div class="parch"><div class="pk">Step 3 of 3. Where is this verse?</div><p class="ptxt">“${E(v.text)}”</p></div><div class="vchips col">${V.ref.map(r=>`<button class="btn alt" data-r="${E(r)}">${E(r)}</button>`).join("")}</div>`;
    box.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{if(b.dataset.r===v.ref)finishVerse();else{b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}],{duration:260});toast("Almost! Try another one 🙂")}});return}
  if(s===4||s===3){const jar=Object.keys(vstate().days).sort().reverse();
    box.innerHTML=`${head}<div class="parch glow"><div class="pk">${s===3?"Well done! You learned it!":"Today's verse is done ✅"}</div><p class="ptxt">“${E(v.text)}”</p><div class="pref on">${E(v.ref)}</div></div>
    <div class="two"><button class="btn alt" id="vlisten">🔊 Listen</button><button class="btn gold" data-go="prayers">🙏 Say a prayer</button></div>
    <section class="card sec"><h2>🫙 My verse jar (${jar.length})</h2><div class="jar">${jar.slice(0,30).map(k=>{const x=vstate().days[k];return `<div class="jv"><b>${E(x.ref)}</b><span>${E(x.text)}</span><small>${k}</small></div>`}).join("")}</div></section>`;
    document.getElementById("vlisten").onclick=()=>speak(v.text+". "+v.ref)}}
function blanks(w){const idx=w.map((x,i)=>({x,i,l:clean(x).length})).filter(o=>o.l>=4).sort((a,b)=>b.l-a.l).slice(0,Math.min(3,Math.max(1,Math.floor(w.length/4)))).map(o=>o.i);
  const parts=w.map((x,i)=>({x,b:idx.includes(i),done:false}));const real=parts.filter(p=>p.b).map(p=>p.x.replace(/[^A-Za-z']/g,""));
  const decoys=["love","light","peace","joy","faith","hope","praise","truth"].filter(d=>!real.map(clean).includes(d)).slice(0,2);
  return {t:"fill",parts,opts:shuffle(real.concat(decoys).map(x=>({x,used:false})))}}
function finishVerse(){
  const k=dkey(today()),st=vstate();st.days[k]={ref:V.v.ref,text:V.v.text};jset("hv_verse",st);
  V.step=3;drawVerse();if(window.confetti)confetti();
  if(window.hvFx)hvFx.burst(innerWidth/2,innerHeight/3,"✨",14);
  if(window.hvAward)hvAward("verse",k,"Daily verse")}

/* ========== PRAYERS ========== */
const PRAYERS=[
{id:"morning",ic:"🌅",t:"Morning prayer",when:"am",x:["Thank You, God, for a new day.","Please be with me at school and at home.","Help me to be kind, honest and brave.","Amen."]},
{id:"before-meal",ic:"🍎",t:"Before a meal",when:"",x:["Thank You, Lord, for this food.","Bless it, and bless the hands that made it.","Please help children who are hungry.","Amen."]},
{id:"after-meal",ic:"🥣",t:"After a meal",when:"",x:["Thank You, Lord, for filling us.","We are grateful for everything You give us.","Amen."]},
{id:"study",ic:"📚",t:"Before study",when:"",x:["Lord Jesus, open my mind to learn.","Help me to listen and to do my best.","Amen."]},
{id:"family",ic:"👨‍👩‍👧",t:"For my family",when:"",x:["Lord, please bless my family.","Keep us safe and help us love one another.","Bless my friends and my teachers too.","Amen."]},
{id:"thanks",ic:"💛",t:"Thank You, God",when:"",x:["Thank You, God, for my family, my friends and my church.","Thank You for the sun, the rain and every good thing.","Thank You for loving me.","Amen."]},
{id:"night",ic:"🌙",t:"Night prayer",when:"pm",x:["Thank You, Jesus, for today.","Forgive me for the times I was not kind.","Keep me safe while I sleep, and send Your angels to watch over me.","Amen."]},
{id:"lords",ic:"🙏",t:"The Lord's Prayer",when:"",x:["Our Father who art in heaven, hallowed be Thy name.","Thy kingdom come. Thy will be done on earth as it is in heaven.","Give us this day our daily bread.","And forgive us our trespasses, as we forgive those who trespass against us.","And lead us not into temptation, but deliver us from the evil one.","For Thine is the kingdom and the power and the glory forever. Amen."],src:"Matthew 6:9-13"},
{id:"trisagion",ic:"✨",t:"Holy God (Trisagion)",when:"",x:["Holy God, Holy Mighty, Holy Immortal,","Who was crucified for us,","Have mercy on us."],src:"Church prayer"},
{id:"psalm23",ic:"🐑",t:"The Lord is my Shepherd",when:"",x:["The Lord is my shepherd; I shall not want.","He makes me to lie down in green pastures; He leads me beside the still waters.","He restores my soul; He leads me in the paths of righteousness for His name's sake.","Surely goodness and mercy shall follow me all the days of my life, and I will dwell in the house of the Lord forever."],src:"Psalm 23 (KJV, adapted)"}];
const prayedToday=()=>(jget("hv_prayed",{})[dkey(today())])||[];
function prayersPage(){
  const done=prayedToday();
  app.innerHTML=`${topbar("Prayers","🙏","Talk to God","home")}<div class="note">Our servants are still checking these prayers. More are coming soon.</div>
  <div class="grid prgrid">${PRAYERS.map(p=>`<button class="tile prtile ${done.includes(p.id)?"done":""}" style="--c:#a86fd0" data-go="pr-${p.id}"><span class="ic">${p.ic}</span><span class="nm">${E(p.t)}</span><span class="ct">${done.includes(p.id)?"Prayed today ✅":"Tap to pray"}</span></button>`).join("")}</div>`}
function prayerPage(id){
  const p=PRAYERS.find(x=>x.id===id);if(!p)return prayersPage();const done=prayedToday().includes(id);
  app.innerHTML=`${topbar(E(p.t),p.ic,p.src?E(p.src):"A prayer for you","prayers")}
  <div class="prayer"><div class="candle" aria-hidden="true"><i></i><b></b></div><div class="ptext">${p.x.map(l=>`<p>${E(l)}</p>`).join("")}</div></div>
  <div class="two"><button class="btn alt" id="plisten">🔊 Read to me</button><button class="btn gold" id="pdone" ${done?"disabled":""}>${done?"Prayed today ✅":"🙏 I prayed"}</button></div>${voicePicker()}`;
  document.getElementById("plisten").onclick=()=>speak(p.x.join(" "));wirePicker();
  const b=document.getElementById("pdone");b.onclick=()=>{const m=jget("hv_prayed",{}),k=dkey(today());m[k]=(m[k]||[]).concat(id);Object.keys(m).sort().slice(0,-14).forEach(x=>delete m[x]);jset("hv_prayed",m);
    b.disabled=true;b.textContent="Prayed today ✅";if(window.hvFx){const r=b.getBoundingClientRect();hvFx.burst(r.left+r.width/2,r.top,"🕯️",8)}
    if(window.hvAward)hvAward("prayer",id+"-"+k,p.t);else toast("God bless you 🙏")}}
window.hvPrayerNudge=function(){const h=today().getHours(),d=prayedToday();
  if(h>=5&&h<11&&!d.includes("morning"))return {id:"morning",t:"Good morning! Say your morning prayer 🌅"};
  if(h>=19&&!d.includes("night"))return {id:"night",t:"Time for your night prayer 🌙"};return null};

/* ========== COPTIC CALENDAR ========== */
const CM=["Tout","Baba","Hator","Kiahk","Toba","Amshir","Baramhat","Baramouda","Bashans","Paoni","Epep","Mesori","Nasie"];
function jdnOf(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045}
function gregOfJdn(j){const a=j+32044,b=Math.floor((4*a+3)/146097),c=a-Math.floor(146097*b/4),d=Math.floor((4*c+3)/1461),e=c-Math.floor(1461*d/4),m=Math.floor((5*e+2)/153);return new Date(100*b+d-4800+Math.floor(m/10),m+3-12*Math.floor(m/10)-1,e-Math.floor((153*m+2)/5)+1)}
function gregOfCoptic(Y,M,D){return gregOfJdn(1825030-1+365*(Y-1)+Math.floor(Y/4)+30*(M-1)+D)}
function copticYearsFor(gy){return [gy-285,gy-284,gy-283]}
function easter(gy){const a=gy%4,b=gy%7,c=gy%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,m=Math.floor((d+e+114)/31),day=((d+e+114)%31)+1;return new Date(gy,m-1,day+13)}
const FEASTS=[[1,1,"nayrouz","Feast of Nayrouz","🌴","The Coptic New Year. We remember the martyrs."],[1,17,"cross","Feast of the Cross","✝️","We remember the Cross of Jesus."],[4,29,"nativity","The Nativity of Jesus","🎄","Jesus was born in Bethlehem."],[5,6,"circumcision","Circumcision of Jesus","👶","Jesus was brought to the temple as a baby."],[5,11,"theophany","Feast of Theophany","🕊️","Jesus was baptized and the Holy Spirit came like a dove."],[5,13,"cana","Wedding at Cana","🍷","Jesus did His first miracle."],[6,8,"presentation","Presentation of Jesus","🕯️","Simeon held baby Jesus in the temple."],[7,10,"findcross","Finding of the Cross","✝️","St. Helena found the Cross."],[7,29,"annunciation","The Annunciation","👼","The angel told St. Mary she would have Jesus."],[9,24,"egypt","Jesus Enters Egypt","🐪","The Holy Family came to Egypt."],[11,5,"apostles","Feast of the Apostles","🔥","Saints Peter and Paul."],[12,13,"transfig","The Transfiguration","🌟","Jesus shone like light on the mountain."],[12,16,"dormition","St. Mary's Departure","💙","We remember St. Mary, the mother of Jesus."]];
const SAINTS=[
[7,23,"george","St. George","🐴","St. George was a brave soldier. He loved Jesus more than anything. When the emperor told him to stop believing, he said no and stayed faithful. The Church calls him the Prince of Martyrs.","Be brave and keep loving Jesus, even when it is hard."],
[3,15,"mina","St. Mina","⭐","St. Mina was a soldier in Egypt who became a monk and loved to pray. He told everyone about Jesus, even when it was dangerous. Many people are healed through his prayers. His monastery is near Alexandria.","Be bold about your faith."],
[5,13,"demiana","St. Demiana","🌸","St. Demiana lived in Egypt and gave her life to Jesus. She and forty young women prayed together and cared for each other. They were brave and faithful. The Church remembers them with love.","Friends can help each other love God."],
[8,7,"athanasius","St. Athanasius","📜","St. Athanasius was a pope of Alexandria. He taught that Jesus is truly God. He stood up for the true faith, even when leaders were against him. We remember him as the defender of the faith.","Stand for what is true."],
[5,22,"antony","St. Antony","🏜️","St. Antony is called the father of monks. He went to the desert to pray and be close to God. Many people came to learn from him. He showed that prayer is powerful.","Make time to talk with God."],
[9,14,"pachomius","St. Pachomius","🏠","St. Pachomius started monasteries where many monks lived together. He taught them to share, to work and to pray. He is called the father of community life.","We are stronger when we help each other."],
[3,25,"philopater","St. Philopater Mercurius","⚔️","St. Philopater Mercurius, also called Abu Seifein, was a brave soldier who followed Jesus. He would not give up his faith. Many churches in Egypt are named for him.","Be loyal to Jesus."],
[4,8,"barbara","St. Barbara","🗼","St. Barbara loved Jesus and would not give up her faith, even when her family was against her. She is remembered for her courage.","Have courage to follow Jesus."],
[4,10,"nicholas","St. Nicholas","🎁","St. Nicholas was a bishop who loved helping the poor. He was known for his kindness and for giving secretly to people in need.","Be generous and kind."],
[3,12,"michael","Archangel Michael","🛡️","The Archangel Michael is one of God's great angels. He protects God's people and helps them. The Church asks for his prayers every month on the 12th.","God sends angels to take care of us."],
[11,24,"abanoub","St. Abanoub","🌟","St. Abanoub was a young boy who loved Jesus very much. He was brave and told people about Jesus, even though he was a child. Children can be heroes of faith too.","You are never too young to love Jesus."],
[11,8,"bishoy","St. Bishoy","💧","St. Bishoy was a monk who loved Jesus and cared for people. He is remembered for his kindness and his love for visitors.","Welcome and love everyone."],
[7,30,"kyrillos","Pope Kyrillos VI","🕊️","Pope Kyrillos VI was the 116th pope of Alexandria. He was a man of deep prayer who prayed the liturgy every day. Many people say they were helped through his prayers.","Prayer can change lives."],
[3,29,"peter","St. Peter, Seal of the Martyrs","✝️","Pope Peter of Alexandria was the last pope to be martyred in the early persecutions. He guided the church with love and courage.","Be faithful until the end."],
[8,30,"mark","St. Mark the Apostle","🦁","St. Mark brought the good news of Jesus to Egypt. He wrote the Gospel of Mark and started the church in Alexandria. We are his spiritual children.","Share the good news of Jesus."],
[11,26,"joseph","St. Joseph the Carpenter","🔨","St. Joseph took care of St. Mary and baby Jesus. He listened to God and obeyed right away. He worked hard as a carpenter.","Listen to God and obey."],
[10,13,"gabriel","Archangel Gabriel","👼","The Archangel Gabriel is the angel who brought good news. He told Zechariah about John and told St. Mary that she would have Jesus.","God sends us good news."],
[1,3,"raphael","Archangel Raphael","💫","Archangel Raphael helps and heals. In the book of Tobit he guided and protected Tobias on his journey.","God guides us."],
[1,4,"john","St. John the Beloved","💛","St. John was the apostle who stayed close to Jesus. He wrote a Gospel and told us that God is love.","Stay close to Jesus."]];
const FASTS=(gy)=>{const e=easter(gy);const cy=copticYearsFor(gy);const out=[{id:"lent",t:"Great Lent",s:addDays(e,-55),e:addDays(e,-1)},{id:"nineveh",t:"Fast of Nineveh",s:addDays(e,-69),e:addDays(e,-67)},{id:"apostles",t:"Apostles' Fast",s:addDays(e,50),e:null}];
  out[2].e=(()=>{for(const y of cy){const d=gregOfCoptic(y,11,4);if(d.getFullYear()===gy&&d>=out[2].s)return d}return addDays(e,50)})();
  cy.forEach(y=>{[[3,16,4,28,"nativity","Nativity Fast"],[12,1,12,15,"stmary","Fast of St. Mary"]].forEach(f=>{const s=gregOfCoptic(y,f[0],f[1]),en=gregOfCoptic(y,f[2],f[3]);if(s.getFullYear()===gy||en.getFullYear()===gy)out.push({id:f[4],t:f[5],s,e:en})})});return out};
function eventsOf(gy){const ev=[];const e=easter(gy);
  [[-8,"lazarus","Lazarus Saturday","🌿"],[-7,"palm","Palm Sunday","🌴"],[-2,"goodfri","Good Friday","✝️"],[0,"easter","Resurrection (Easter)","🌅"],[39,"ascension","Ascension of Jesus","☁️"],[49,"pentecost","Pentecost","🔥"],[-66,"ninevehfeast","Feast of Nineveh","🐋"]].forEach(m=>ev.push({d:addDays(e,m[0]),type:"feast",id:m[1],t:m[2],ic:m[3],note:""}));
  copticYearsFor(gy).forEach(y=>{FEASTS.forEach(f=>{const d=gregOfCoptic(y,f[0],f[1]);if(d.getFullYear()===gy)ev.push({d,type:"feast",id:f[2],t:f[3],ic:f[4],note:f[5]})});
    SAINTS.forEach(f=>{const d=gregOfCoptic(y,f[0],f[1]);if(d.getFullYear()===gy)ev.push({d,type:"saint",id:f[2],t:f[3],ic:f[4],note:f[5],learn:f[6]})})});
  return ev.sort((a,b)=>a.d-b.d)}
const _ev={};const evOf=gy=>_ev[gy]||(_ev[gy]=eventsOf(gy));
const _fa={};const fastsOf=gy=>_fa[gy]||(_fa[gy]=FASTS(gy));
function allEv(from,to){const o=[];for(let y=from.getFullYear();y<=to.getFullYear();y++)evOf(y).forEach(x=>{if(x.d>=from&&x.d<=to)o.push(x)});return o}
function activeFast(d){const k=d.getFullYear();for(const y of [k-1,k,k+1])for(const f of fastsOf(y)){const s=new Date(f.s.getFullYear(),f.s.getMonth(),f.s.getDate()),e=new Date(f.e.getFullYear(),f.e.getMonth(),f.e.getDate());if(d>=s&&d<=e)return f}return null}
function copticOf(d){const n=window.hvCopticDate(d);return n}
window.hvCalToday=function(){const t=today(),ev=evOf(t.getFullYear()).filter(x=>diffDays(t,x.d)===0),f=activeFast(t);return {ev,fast:f,coptic:copticOf(t)}};
const CNT=n=>n===0?"Today":n===1?"Tomorrow":"in "+n+" days";
const LINK={nayrouz:"quiz-nayrouz",pentecost:"quiz-pentecost",george:"quiz-stgeorge",mary:"quiz-stmary",nativity:"m-feasts",annunciation:"quiz-stmary",dormition:"quiz-stmary",demiana:"m-saints",mark:"m-g2"};
let CALM=null;
function calendarPage(){
  const t=today(),c=copticOf(t),f=activeFast(t),evs=evOf(t.getFullYear()).filter(x=>diffDays(t,x.d)===0);
  const sa=evs.find(x=>x.type==="saint"),fe=evs.find(x=>x.type==="feast");
  const fb=[];[t.getFullYear(),t.getFullYear()+1].forEach(y=>fastsOf(y).forEach(f=>{if(f.s>t&&diffDays(t,f.s)<=400&&!fb.some(z=>z.id==="fast-"+f.id&&diffDays(z.d,f.s)===0))fb.push({d:f.s,type:"feast",ic:"🌙",t:f.t+" begins",id:"fast-"+f.id})}));
  const up=allEv(addDays(t,1),addDays(t,400)).filter(x=>x.type==="feast").concat(fb).sort((x,y)=>x.d-y.d).slice(0,7);
  const nextSaint=!sa?allEv(addDays(t,1),addDays(t,120)).find(x=>x.type==="saint"):null;
  if(!CALM)CALM={y:t.getFullYear(),m:t.getMonth()};
  app.innerHTML=`${topbar("Calendar","📅","Coptic and regular dates","home")}
  <section class="card tcal"><div class="tag">${t.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div><div class="cbig">${c.day} ${c.name}, ${c.year}</div><div class="tag">Coptic calendar</div>
   ${f?`<div class="fastban">🌙 ${E(f.t)} is on now. Fasting reminds us to pray and love God more.</div>`:""}
   ${fe?`<div class="fe">${fe.ic} <b>${E(fe.t)}</b> today. ${E(fe.note||"")}</div>`:""}</section>
  ${sa?saintCard(sa,true):nextSaint?`<div class="tag">Next saint: ${E(nextSaint.t)} ${CNT(diffDays(t,nextSaint.d))}</div>`:""}
  <section class="card sec"><h2>Coming up</h2><div class="list">${up.map(x=>`<div class="upr"><span class="upi">${x.ic}</span><span class="upn"><b>${E(x.t)}</b><small>${x.d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</small></span><span class="upc">${CNT(diffDays(t,x.d))}</span>${LINK[x.id]?`<button class="mini" data-go="${LINK[x.id]}" aria-label="Learn about ${E(x.t)}">📺</button>`:""}</div>`).join("")}</div></section>
  <section class="card sec"><div class="calnav"><button class="btn alt" id="cprev" aria-label="Previous month">◀</button><h2 style="margin:0" id="cmt"></h2><button class="btn alt" id="cnext" aria-label="Next month">▶</button></div><div id="cgrid"></div>
   <div class="as-leg" style="display:flex;gap:12px;flex-wrap:wrap;font-size:.78rem;font-weight:800;color:var(--muted)"><span>🟡 Feast</span><span>🟣 Fast</span><span>🔵 Saint</span><span>🟢 Event</span></div><div id="cday" class="tag" role="status">Tap a day to see what it is.</div></section>`;
  drawMonth();if(window.hvLoadEvents)hvLoadEvents().then(()=>{if(document.getElementById("cgrid"))drawMonth()});
  document.getElementById("cprev").onclick=()=>{CALM.m--;if(CALM.m<0){CALM.m=11;CALM.y--}drawMonth()};
  document.getElementById("cnext").onclick=()=>{CALM.m++;if(CALM.m>11){CALM.m=0;CALM.y++}drawMonth()}}
function saintCard(x,big){return `<section class="card saint${big?" big":""}" style="--tc:var(--c-cal)"><div class="saintic" aria-hidden="true">${x.ic}</div><div class="k">Saint of the day</div><h2 style="margin:0">${E(x.t)}</h2><p>${E(x.note)}</p><div class="learn">💡 ${E(x.learn||"")}</div>${LINK[x.id]?`<button class="btn alt" data-go="${LINK[x.id]}">📺 Learn more</button>`:""}</section>`}
function drawMonth(){
  const y=CALM.y,m=CALM.m,first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),lead=first.getDay();
  document.getElementById("cmt").textContent=first.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const evs=allEv(first,new Date(y,m,days)),t=today();let cells="";
  for(let i=0;i<lead;i++)cells+=`<span></span>`;
  for(let d=1;d<=days;d++){const dt=new Date(y,m,d),e=evs.filter(x=>diffDays(dt,x.d)===0),fast=activeFast(dt),cd=copticOf(dt);
    const my=(window.hvEvCache||[]).filter(x=>x.date<=dkey(dt)&&(x.end||x.date)>=dkey(dt));
    cells+=`<button class="cd ${diffDays(t,dt)===0?"now":""}" data-d="${dkey(dt)}" aria-label="${dt.toLocaleDateString("en-US",{month:"long",day:"numeric"})}${e.length?", "+e.map(x=>x.t).join(", "):""}${fast?", "+fast.t:""}${my.length?", "+my.map(x=>x.title).join(", "):""}"><b>${d}</b><small>${cd.day}</small><span class="dots">${e.some(x=>x.type==="feast")?`<i style="background:#e3b45c"></i>`:""}${fast?`<i style="background:#8e6bd1"></i>`:""}${e.some(x=>x.type==="saint")?`<i style="background:#4a8fd8"></i>`:""}${my.length?`<i style="background:#3fae6a"></i>`:""}</span></button>`}
  document.getElementById("cgrid").innerHTML=`<div class="cgrid">${(window.hvWeekdayInitials?hvWeekdayInitials():["S","M","T","W","T","F","S"]).map(x=>`<span class="ch">${x}</span>`).join("")}${cells}</div>`;
  document.getElementById("cgrid").onclick=e=>{const b=e.target.closest("[data-d]");if(!b)return;const p=b.dataset.d.split("-"),dt=new Date(+p[0],+p[1]-1,+p[2]),ev=allEv(dt,dt),f=activeFast(dt),c=copticOf(dt);
    document.getElementById("cday").innerHTML=`<b>${dt.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</b> (${c.day} ${c.name})${ev.map(x=>`<br>${x.ic} ${E(x.t)}${x.note?": "+E(x.note):""}`).join("")}${f?`<br>🌙 ${E(f.t)}`:""}${(window.hvEvCache||[]).filter(x=>x.date<=b.dataset.d&&(x.end||x.date)>=b.dataset.d).map(x=>`<br>${E(x.ic||"🎉")} ${E(x.title)}${x.place?" at "+E(x.place):""}`).join("")}${!ev.length&&!f&&!(window.hvEvCache||[]).some(x=>x.date<=b.dataset.d&&(x.end||x.date)>=b.dataset.d)?"<br>A normal day.":""}`}}
window.hvSaintToday=function(){const t=today();return evOf(t.getFullYear()).find(x=>x.type==="saint"&&diffDays(t,x.d)===0)||null};

/* ---------- routes ---------- */
window.faithRoute=function(h){
  if(h==="verse"){versePage();return true}
  if(h==="prayers"){prayersPage();return true}
  if(h.startsWith("pr-")){prayerPage(h.slice(3));return true}
  if(h==="calendar"){CALM=null;calendarPage();return true}
  return false};

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
.vtop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.vflame{display:flex;align-items:center;gap:6px;font-weight:900}.vflame .fl{display:inline-block;animation:floaty 2.4s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(255,150,40,.8))}.vflame small{color:var(--muted);font-weight:700}
.vweek{display:flex;gap:6px}.vweek span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);font-weight:900;font-size:.8rem;color:var(--muted)}.vweek .on{background:var(--gold);border-color:var(--gold);color:#2b1d05}.vweek .now{box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 40%,transparent)}
.parch{position:relative;border-radius:24px;padding:22px 18px;text-align:center;background:linear-gradient(160deg,color-mix(in srgb,#f6d27a 26%,var(--glass)),var(--glass));border:2px solid color-mix(in srgb,var(--gold) 70%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--gold) 14%,transparent),var(--sh)}
.parch.glow{box-shadow:0 0 34px rgba(246,210,122,.55),var(--sh)}
.pk{font-weight:900;font-size:var(--fs-s);letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.ptxt{font-family:var(--display);font-size:clamp(1.25rem,1.2vw + 1rem,1.8rem);line-height:1.5;margin:0;font-weight:700}
.ptxt span{opacity:0;animation:wfade .6s ease forwards}.pref{margin-top:12px;font-weight:900;color:var(--gold);opacity:0;animation:wfade .6s ease forwards}.pref.on{opacity:1;animation:none}
@keyframes wfade{to{opacity:1}}
.vchips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.vchips.col{flex-direction:column}
.vblank{display:inline-block;min-width:3.4em;border-bottom:3px dashed var(--gold);color:transparent}.vblank.ok{color:var(--good);border-bottom-style:solid;color:inherit}
.jar{display:flex;flex-direction:column;gap:8px}.jv{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:14px;background:var(--gold-soft);color:var(--ink)}.jv b{color:var(--gold)}.jv span{font-size:var(--fs-s)}.jv small{color:var(--muted)}
.prgrid .prtile.done{opacity:.8}
.prayer{position:relative;border-radius:var(--r-l);padding:26px 18px 22px;text-align:center;background:radial-gradient(circle at 50% 0,rgba(255,200,110,.28),transparent 60%),var(--glass);border:1px solid var(--glass-b)}
.candle{position:relative;width:26px;height:70px;margin:0 auto 14px}.candle b{position:absolute;left:0;bottom:0;width:26px;height:46px;border-radius:5px;background:linear-gradient(90deg,#f1e6c8,#fff8e6,#e8d9b0)}
.candle i{position:absolute;left:50%;top:0;width:14px;height:26px;margin-left:-7px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(ellipse at 50% 70%,#fff3a8,#ffb23c 60%,#ff7a1f);filter:drop-shadow(0 0 12px rgba(255,170,60,.9));transform-origin:50% 90%;animation:flick 1.6s ease-in-out infinite}
@keyframes flick{0%,100%{transform:scale(1,1) rotate(-2deg)}30%{transform:scale(.94,1.06) rotate(2deg)}60%{transform:scale(1.04,.96) rotate(-1deg)}}
.ptext p{font-size:clamp(1.15rem,1vw + 1rem,1.5rem);line-height:1.6;font-weight:700;margin:0 0 .6em}
.tcal{display:flex;flex-direction:column;gap:6px}.cbig{font-family:var(--display);font-size:var(--fs-xl);font-weight:800;color:var(--gold)}
.fastban{margin-top:6px;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,#8e6bd1 24%,transparent);font-weight:800}.fe{margin-top:6px;padding:10px 12px;border-radius:14px;background:var(--gold-soft);color:var(--ink);font-weight:700}
.saint{position:relative;display:flex;flex-direction:column;gap:8px;overflow:hidden}.saint .k{font-weight:900;font-size:var(--fs-s);letter-spacing:.08em;text-transform:uppercase;color:var(--c-cal)}.saintic{position:absolute;right:14px;top:10px;font-size:3.4rem;animation:floaty 5.5s ease-in-out infinite}
.saint p{margin:0;font-weight:700;line-height:1.5}.learn{padding:10px 12px;border-radius:14px;background:var(--sky-soft);font-weight:800;color:var(--ink)}
.upr{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.upi{font-size:1.6rem}.upn{flex:1;display:flex;flex-direction:column}.upn small{color:var(--muted);font-weight:700}.upc{font-weight:900;color:var(--gold)}
.calnav{display:flex;justify-content:space-between;align-items:center;gap:8px}.calnav .btn{padding:8px 14px;min-height:44px}
.cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.cgrid .ch{text-align:center;font-weight:900;font-size:.75rem;color:var(--muted)}
.cd{aspect-ratio:1;border-radius:12px;border:1.5px solid var(--line);background:transparent;color:var(--ink);padding:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:inherit;line-height:1.1;min-height:44px}.cd b{font-size:.9rem}.cd small{font-size:.6rem;color:var(--muted);font-weight:700}
.cd.now{border-color:var(--gold);background:var(--gold-soft)}.dots{display:flex;gap:2px;height:6px}.dots i{width:6px;height:6px;border-radius:50%;display:block}
@media (prefers-reduced-motion:reduce){.ptxt span,.pref{opacity:1;animation:none}.candle i,.vflame .fl,.saintic{animation:none}}
`;
document.head.appendChild(st);
})();
