/* Heavenly Visions: Bedtime Corner. Night mode with written bedtime Bible stories and the night prayer. No audio. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const STORIES=[
 {id:"creation",ic:"🌍",t:"God made the world",ref:"Genesis 1",x:["In the beginning, there was nothing but God. God said, Let there be light, and the light came.","Then God made the sky, the sea and the dry land. He made trees, flowers and fruit.","He made the sun for the day and the moon and stars for the night.","He made fish to swim, birds to fly and animals to run. Last, God made people, and He loved them very much.","Then God rested. And tonight, God is watching over you. Good night."]},
 {id:"noah",ic:"🌈",t:"Noah and the rainbow",ref:"Genesis 6 to 9",x:["Noah loved God and listened to Him. God told Noah to build a big boat called an ark.","Noah built it, and God sent two of every animal to come inside. Then the rain began, and the ark floated safely.","After many days the rain stopped, and the water went down. Noah sent out a dove, and it came back with an olive leaf.","Then God put a rainbow in the sky. It was His promise to take care of us. Good night."]},
 {id:"moses",ic:"🧺",t:"Baby Moses in the basket",ref:"Exodus 2",x:["A long time ago, a mother had a baby boy. She wanted to keep him safe, so she made a little basket.","She put the baby in the basket and set it gently by the river. His big sister Miriam watched from far away.","A kind princess found the basket and loved the baby. Miriam ran to her and said, I can find someone to take care of him. And she brought his own mother.","God took care of baby Moses, and He takes care of you too. Good night."]},
 {id:"daniel",ic:"🦁",t:"Daniel and the lions",ref:"Daniel 6",x:["Daniel loved to pray to God three times every day.","Some men did not like that, and the king had to put Daniel in a den with lions.","Daniel was not afraid. He trusted God. All night, God sent an angel who closed the mouths of the lions.","In the morning, Daniel was safe and happy. God was with him all night. God is with you tonight too. Good night."]},
 {id:"shepherd",ic:"🐑",t:"The Good Shepherd",ref:"Luke 15 and John 10",x:["Jesus told a story about a shepherd who had one hundred sheep. One night, one little sheep got lost.","The shepherd left the others safe and went to look for the lost one. He looked high and low until he found it.","He lifted the sheep onto his shoulders and carried it home with joy.","Jesus is our Good Shepherd. He knows your name, and He will never leave you. Good night."]},
 {id:"storm",ic:"⛵",t:"Jesus calms the storm",ref:"Mark 4",x:["One evening Jesus and His friends were in a little boat. Jesus was tired, and He fell asleep.","Suddenly the wind blew hard, and the waves splashed into the boat. The friends were afraid and woke Jesus.","Jesus stood up and said, Peace. Be still. And the wind stopped, and the sea became calm.","When you feel afraid, Jesus is with you. Take a deep breath and rest. Good night."]}];

/* ---------- night mode ---------- */
function night(on){document.documentElement.classList.toggle("bed",on)}
addEventListener("hashchange",()=>{if(location.hash.slice(1)!=="bedtime")night(false)});

/* ---------- page ---------- */
const S={tab:"stories"};
const NIGHT=["Thank You, Jesus, for today.","Forgive me for the times I was not kind.","Keep me safe while I sleep, and send Your angels to watch over me.","Amen."];
function bedPage(){
  night(true);
  app.innerHTML=`<div class="bedhead"><button class="back" data-go="home">← Back</button></div><div class="moon" aria-hidden="true"><i></i></div>
  <div class="title-row"><span style="font-size:2rem">🛏️</span><div><h1>Bedtime</h1><div class="tag">Sleepy stories and a night prayer</div></div></div>
  <div class="ds-seg" id="btabs" role="tablist">${[["stories","📚 Stories"],["prayer","🙏 Night prayer"]].map(t=>`<button data-tab="${t[0]}" aria-pressed="${S.tab===t[0]}" role="tab">${t[1]}</button>`).join("")}</div>
  <div id="bbody" class="sec"></div>`;
  document.getElementById("btabs").onclick=e=>{const b=e.target.closest("[data-tab]");if(!b)return;S.tab=b.dataset.tab;document.querySelectorAll("#btabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()};
  draw()}
function draw(){
  const body=document.getElementById("bbody");
  if(S.tab==="stories"){
    body.innerHTML=`<div class="grid">${STORIES.map(s=>`<button class="tile" style="--c:#4a4fb5" data-st="${s.id}"><span class="ic">${s.ic}</span><span class="nm">${E(s.t)}</span><span class="ct">${E(s.ref)}</span></button>`).join("")}</div><div id="bstory"></div>`;
    body.onclick=e=>{const t=e.target.closest("[data-st]");if(!t)return;const s=STORIES.find(x=>x.id===t.dataset.st);
      document.getElementById("bstory").innerHTML=`<article class="card sec bstory"><h2>${s.ic} ${E(s.t)}</h2><div class="tag">${E(s.ref)}</div>${s.x.map(p=>`<p>${E(p)}</p>`).join("")}</article>`;
      document.getElementById("bstory").scrollIntoView({behavior:"smooth",block:"start"})};return}
  body.innerHTML=`<article class="card sec bstory" style="text-align:center"><div style="font-size:3.4rem">🙏</div><h2>Night prayer</h2>${NIGHT.map(p=>`<p>${E(p)}</p>`).join("")}<button class="btn gold" data-go="pr-night">🕯️ I prayed</button></article>`;body.onclick=null}

window.bedtimeRoute=function(h){if(h==="bedtime"){bedPage();return true}return false};

const st=document.createElement("style");
st.textContent=`
html.bed:root{--bg-base:#070a22;--sky-top:#060920;--sky-mid:#0d1235;--sky-bot:#1a1744;--aur1:rgba(120,110,230,.24);--aur2:rgba(70,120,220,.2);--aur3:rgba(150,90,200,.18);--rays:transparent;--halo:rgba(140,150,255,.25);--stars-op:1;--cloud:rgba(160,170,230,.1);
  --glass:rgba(22,28,64,.62);--glass-b:rgba(255,255,255,.08);--glass-hi:rgba(255,255,255,.07);--bg:#0b1030;--surface:#141a3d;--ink:#e9e4d6;--muted:#9a9ec4;--line:#273058;--gold:#e8c987;--gold-soft:#2a2c52;--sky-soft:#1c2750;color-scheme:dark}
html.bed .hubhead::before{display:none}
.bedhead{display:flex}.moon{position:relative;height:120px;display:flex;justify-content:center}
.moon i{display:block;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fffbe8,#f3e3a8 60%,#d9c27a);box-shadow:0 0 50px 12px rgba(243,227,168,.35);animation:floaty 9s ease-in-out infinite}
.bstory p{font-size:clamp(1.1rem,.9vw + 1rem,1.4rem);line-height:1.7;margin:0;font-weight:600}
@media (prefers-reduced-motion:reduce){.moon i{animation:none}}
`;
document.head.appendChild(st);
})();
