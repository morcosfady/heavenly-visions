/* Heavenly Visions: Bedtime Corner. Night mode, sleeping songs (our own YouTube playlist, played through the YouTube player so views count),
   bedtime Bible stories read aloud, and a sleep timer that fades the volume out. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const SONGS=[
 ["2h-a","2 Hours of Gentle Christian Sleep Music","cjrVfitV9_M","2 hours",true],
 ["2h-b","2 Hours of Peaceful Sleep Music for Prayer and Rest","5ycpDISg0rI","2 hours",true],
 ["10h-1","Sleeping Songs, 10 Hours (1)","5-vSC1XDrcA","10 hours",false],
 ["10h-2","Sleeping Songs, 10 Hours (2)","c7oeYTO-8jQ","10 hours",false],
 ["10h-3","10 Hours of Heavenly Sleep Music","CLG8ZCDQSg4","10 hours",false]];
const STORIES=[
 {id:"creation",ic:"🌍",t:"God made the world",ref:"Genesis 1",x:["In the beginning, there was nothing but God. God said, Let there be light, and the light came.","Then God made the sky, the sea and the dry land. He made trees, flowers and fruit.","He made the sun for the day and the moon and stars for the night.","He made fish to swim, birds to fly and animals to run. Last, God made people, and He loved them very much.","Then God rested. And tonight, God is watching over you. Good night."]},
 {id:"noah",ic:"🌈",t:"Noah and the rainbow",ref:"Genesis 6 to 9",x:["Noah loved God and listened to Him. God told Noah to build a big boat called an ark.","Noah built it, and God sent two of every animal to come inside. Then the rain began, and the ark floated safely.","After many days the rain stopped, and the water went down. Noah sent out a dove, and it came back with an olive leaf.","Then God put a rainbow in the sky. It was His promise to take care of us. Good night."]},
 {id:"moses",ic:"🧺",t:"Baby Moses in the basket",ref:"Exodus 2",x:["A long time ago, a mother had a baby boy. She wanted to keep him safe, so she made a little basket.","She put the baby in the basket and set it gently by the river. His big sister Miriam watched from far away.","A kind princess found the basket and loved the baby. Miriam ran to her and said, I can find someone to take care of him. And she brought his own mother.","God took care of baby Moses, and He takes care of you too. Good night."]},
 {id:"daniel",ic:"🦁",t:"Daniel and the lions",ref:"Daniel 6",x:["Daniel loved to pray to God three times every day.","Some men did not like that, and the king had to put Daniel in a den with lions.","Daniel was not afraid. He trusted God. All night, God sent an angel who closed the mouths of the lions.","In the morning, Daniel was safe and happy. God was with him all night. God is with you tonight too. Good night."]},
 {id:"shepherd",ic:"🐑",t:"The Good Shepherd",ref:"Luke 15 and John 10",x:["Jesus told a story about a shepherd who had one hundred sheep. One night, one little sheep got lost.","The shepherd left the others safe and went to look for the lost one. He looked high and low until he found it.","He lifted the sheep onto his shoulders and carried it home with joy.","Jesus is our Good Shepherd. He knows your name, and He will never leave you. Good night."]},
 {id:"storm",ic:"⛵",t:"Jesus calms the storm",ref:"Mark 4",x:["One evening Jesus and His friends were in a little boat. Jesus was tired, and He fell asleep.","Suddenly the wind blew hard, and the waves splashed into the boat. The friends were afraid and woke Jesus.","Jesus stood up and said, Peace. Be still. And the wind stopped, and the sea became calm.","When you feel afraid, Jesus is with you. Take a deep breath and rest. Good night."]}];

/* ---------- speech (calm voice) ---------- */
let utter=null;
function speakStory(text){if(!window.speechSynthesis)return toast("This phone cannot read aloud");speechSynthesis.cancel();utter=new SpeechSynthesisUtterance(text);utter.rate=.78;utter.pitch=.95;utter.volume=.8;
  const want=jget("hv_voice",""),v=speechSynthesis.getVoices().find(x=>x.name===want);if(v)utter.voice=v;speechSynthesis.speak(utter)}

/* ---------- night mode ---------- */
function night(on){document.documentElement.classList.toggle("bed",on)}
addEventListener("hashchange",()=>{if(location.hash.slice(1)!=="bedtime"&&!location.hash.startsWith("#bed-")){night(false);stopAll()}});

/* ---------- YouTube player ---------- */
let YT_P=null,YT_READY=null,cur=0,timerEnd=0,timerH=null,progH=null,paused=true;
function loadYT(){if(YT_READY)return YT_READY;YT_READY=new Promise(res=>{if(window.YT&&YT.Player)return res();const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";window.onYouTubeIframeAPIReady=res;document.head.appendChild(s)});return YT_READY}
async function play(i){cur=i;await loadYT();const box=document.getElementById("bplayer");if(!box)return;
  if(YT_P&&YT_P.loadVideoById&&document.getElementById("ytp")){YT_P.loadVideoById(SONGS[i][2]);YT_P.setVolume(90)}
  else{box.innerHTML=`<div id="ytp"></div>`;YT_P=new YT.Player("ytp",{videoId:SONGS[i][2],width:"100%",height:"100%",playerVars:{playsinline:1,rel:0,modestbranding:1,autoplay:1,controls:0,disablekb:1},events:{onReady:e=>{e.target.setVolume(90);e.target.playVideo()},onStateChange:e=>{paused=e.data!==1;paintControls();if(e.data===0)next()}}})}
  document.querySelectorAll(".bsong").forEach((b,k)=>b.classList.toggle("on",k===i));
  media(i);paintControls();startProg()}
function media(i){if(!("mediaSession" in navigator))return;try{navigator.mediaSession.metadata=new MediaMetadata({title:SONGS[i][1],artist:"Heavenly Visions",album:"Bedtime",artwork:[{src:"icon-512.png",sizes:"512x512",type:"image/png"}]});
  navigator.mediaSession.setActionHandler("play",()=>YT_P&&YT_P.playVideo());navigator.mediaSession.setActionHandler("pause",()=>YT_P&&YT_P.pauseVideo());navigator.mediaSession.setActionHandler("nexttrack",next)}catch{}}
function toggle(){if(!YT_P||!YT_P.getPlayerState)return play(cur);YT_P.getPlayerState()===1?YT_P.pauseVideo():YT_P.playVideo()}
function next(){play((cur+1)%SONGS.length)}
function paintControls(){const b=document.getElementById("bplay");if(b){b.textContent=paused?"▶":"⏸";b.setAttribute("aria-label",paused?"Play":"Pause")}}
function fmt(s){s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s%60).padStart(2,"0")}
function startProg(){clearInterval(progH);progH=setInterval(()=>{const bar=document.getElementById("bbar");if(!bar||!YT_P||!YT_P.getDuration){clearInterval(progH);return}
  const d=YT_P.getDuration(),t=YT_P.getCurrentTime();if(d){bar.style.width=(t/d*100)+"%";const tt=document.getElementById("btime");if(tt)tt.textContent=fmt(t)+" / "+fmt(d)}},1000)}
function stopAll(){clearInterval(progH);clearInterval(timerH);timerEnd=0;try{if(YT_P&&YT_P.stopVideo)YT_P.stopVideo();if(YT_P&&YT_P.destroy)YT_P.destroy()}catch{}YT_P=null;if(window.speechSynthesis)speechSynthesis.cancel()}

/* ---------- sleep timer: fades the volume out over the last 40 seconds ---------- */
function setTimer(min){clearInterval(timerH);const lab=document.getElementById("btimer");
  if(!min){timerEnd=0;if(lab)lab.textContent="Sleep timer is off";document.querySelectorAll("[data-min]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.min==="0"));return}
  timerEnd=Date.now()+min*60000;document.querySelectorAll("[data-min]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.min===min));
  timerH=setInterval(()=>{const left=timerEnd-Date.now(),l=document.getElementById("btimer");
    if(left<=0){clearInterval(timerH);timerEnd=0;try{YT_P&&YT_P.pauseVideo()}catch{}if(window.speechSynthesis)speechSynthesis.cancel();if(l)l.textContent="Sweet dreams. Goodnight 🌙";document.querySelectorAll("[data-min]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.min==="0"));try{YT_P&&YT_P.setVolume(90)}catch{}return}
    if(left<40000){try{YT_P&&YT_P.setVolume(Math.max(2,Math.round(90*left/40000)))}catch{}}
    if(l)l.textContent="Stops in "+Math.ceil(left/60000)+" min"},1000);
  if(lab)lab.textContent="Stops in "+min+" min"}

/* ---------- page ---------- */
const S={tab:"songs"};
function bedPage(){
  night(true);
  app.innerHTML=`<div class="bedhead"><button class="back" data-go="home">← Back</button></div><div class="moon" aria-hidden="true"><i></i></div>
  <div class="title-row"><span style="font-size:2rem">🛏️</span><div><h1>Bedtime</h1><div class="tag">Soft songs and sleepy stories</div></div></div>
  <div class="ds-seg" id="btabs" role="tablist">${[["songs","🎵 Songs"],["stories","📚 Stories"],["prayer","🙏 Prayer"]].map(t=>`<button data-tab="${t[0]}" aria-pressed="${S.tab===t[0]}" role="tab">${t[1]}</button>`).join("")}</div>
  <div id="bbody" class="sec"></div>`;
  document.getElementById("btabs").onclick=e=>{const b=e.target.closest("[data-tab]");if(!b)return;S.tab=b.dataset.tab;document.querySelectorAll("#btabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()};
  draw()}
function timerBox(){return `<div class="card sec"><b>😴 Sleep timer</b><div class="ds-chips">${[[0,"Off"],[10,"10 min"],[20,"20 min"],[30,"30 min"]].map(m=>`<button class="ds-chip" data-min="${m[0]}" aria-pressed="${m[0]===0&&!timerEnd}">${m[1]}</button>`).join("")}</div><div class="tag" id="btimer" role="status">${timerEnd?"Timer is on":"Sleep timer is off"}</div></div>`}
function draw(){
  const body=document.getElementById("bbody");
  if(S.tab==="songs"){
    body.innerHTML=`<div class="bcard"><div id="bplayer" class="bvid"><button class="bbig" id="bstart" aria-label="Play">▶</button></div>
      <div class="bctl"><div class="bprog"><i id="bbar"></i></div><div class="tag" id="btime">${E(SONGS[cur][1])}</div>
      <div class="bbtns"><button class="bround" id="bplay" aria-label="Play">▶</button><button class="bround" id="bnext" aria-label="Next song">⏭</button></div></div></div>
      ${timerBox()}
      <div class="list">${SONGS.map((s,i)=>`<button class="bsong ${i===cur?"on":""}" data-song="${i}"><span class="bi">🌙</span><span><b>${E(s[1])}</b><small>${s[3]}${s[4]?" · good for tonight":" · all night"}</small></span></button>`).join("")}</div>
      <div class="tag">Songs play through YouTube. On some phones the music stops when the screen locks. Keep the screen on, or lower the brightness.</div>`;
    body.onclick=e=>{const s=e.target.closest("[data-song]");if(s)return play(+s.dataset.song);if(e.target.closest("#bstart"))return play(cur);if(e.target.closest("#bplay"))return toggle();if(e.target.closest("#bnext"))return next();const m=e.target.closest("[data-min]");if(m)setTimer(+m.dataset.min)};return}
  if(S.tab==="stories"){
    body.innerHTML=`<div class="grid">${STORIES.map(s=>`<button class="tile" style="--c:#4a4fb5" data-st="${s.id}"><span class="ic">${s.ic}</span><span class="nm">${E(s.t)}</span><span class="ct">${E(s.ref)}</span></button>`).join("")}</div>
      ${timerBox()}<div id="bstory"></div>`;
    body.onclick=e=>{const m=e.target.closest("[data-min]");if(m)return setTimer(+m.dataset.min);const t=e.target.closest("[data-st]");if(!t)return;const s=STORIES.find(x=>x.id===t.dataset.st);
      document.getElementById("bstory").innerHTML=`<article class="card sec bstory"><h2>${s.ic} ${E(s.t)}</h2><div class="tag">${E(s.ref)}</div>${s.x.map(p=>`<p>${E(p)}</p>`).join("")}<div class="two"><button class="btn alt" id="bread">🔊 Read to me</button><button class="btn" id="bstop">⏹ Stop</button></div></article>`;
      document.getElementById("bread").onclick=()=>speakStory(s.x.join(" "));document.getElementById("bstop").onclick=()=>speechSynthesis.cancel();document.getElementById("bstory").scrollIntoView({behavior:"smooth",block:"start"})};return}
  body.innerHTML=`<div class="card sec" style="text-align:center"><div style="font-size:3.4rem">🙏</div><b>Night prayer</b><p class="tag" style="margin:0">Thank God for today before you sleep.</p><button class="btn gold" data-go="pr-night">🕯️ Say your night prayer</button></div>`;body.onclick=null}

window.bedtimeRoute=function(h){if(h==="bedtime"){bedPage();return true}return false};

const st=document.createElement("style");
st.textContent=`
html.bed:root{--bg-base:#070a22;--sky-top:#060920;--sky-mid:#0d1235;--sky-bot:#1a1744;--aur1:rgba(120,110,230,.24);--aur2:rgba(70,120,220,.2);--aur3:rgba(150,90,200,.18);--rays:transparent;--halo:rgba(140,150,255,.25);--stars-op:1;--cloud:rgba(160,170,230,.1);
  --glass:rgba(22,28,64,.62);--glass-b:rgba(255,255,255,.08);--glass-hi:rgba(255,255,255,.07);--bg:#0b1030;--surface:#141a3d;--ink:#e9e4d6;--muted:#9a9ec4;--line:#273058;--gold:#e8c987;--gold-soft:#2a2c52;--sky-soft:#1c2750;color-scheme:dark}
html.bed .hubhead::before{display:none}
.bedhead{display:flex}.moon{position:relative;height:120px;display:flex;justify-content:center}
.moon i{display:block;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fffbe8,#f3e3a8 60%,#d9c27a);box-shadow:0 0 50px 12px rgba(243,227,168,.35);animation:floaty 9s ease-in-out infinite}
.bcard{border-radius:var(--r-l);overflow:hidden;border:1px solid var(--glass-b);background:var(--glass)}
.bvid{position:relative;aspect-ratio:16/9;background:radial-gradient(circle at 50% 40%,#252a66,#0b1030);display:grid;place-items:center}
.bvid iframe{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:.85}
.bbig{width:84px;height:84px;min-height:84px;border-radius:50%;border:0;font-size:2rem;background:var(--gold);color:#241d05;box-shadow:0 0 34px rgba(232,201,135,.6)}
.bctl{padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.bprog{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.bprog i{display:block;height:100%;width:0;background:var(--gold)}
.bbtns{display:flex;justify-content:center;gap:14px}.bround{width:60px;height:60px;min-height:60px;border-radius:50%;border:1.5px solid var(--glass-b);background:var(--surface);color:var(--ink);font-size:1.4rem}
.bsong{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border-radius:var(--r-m);border:1px solid var(--glass-b);background:var(--glass);color:var(--ink);font:inherit}.bsong small{display:block;color:var(--muted);font-weight:700}.bsong.on{border-color:var(--gold);box-shadow:0 0 18px -4px var(--gold)}.bi{font-size:1.6rem}
.bstory p{font-size:clamp(1.1rem,.9vw + 1rem,1.4rem);line-height:1.7;margin:0;font-weight:600}
@media (prefers-reduced-motion:reduce){.moon i{animation:none}}
`;
document.head.appendChild(st);
})();
