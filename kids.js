/* Heavenly Visions: My Treasures (was Kids Corner) (stars, levels, avatar, rewards shop, badges).
   The server decides everything that counts (stars, prices, what you own). This file draws it.
   The shop list must match SHOP in apps-script/games-backend.gs (tests/backend-sim.js checks that). */
(function(){
const A=()=>window.hvAcct&&hvAcct();
const GU=()=>window.GAMES_URL;
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- levels ---------- */
const LEVELS=[[0,"Little Lamb","🐑"],[50,"Shepherd's Helper","🪈"],[150,"Faithful Friend","🤝"],[300,"Light Bearer","🕯️"],[600,"Temple Builder","⛪"],[1000,"Saint in Training","😇"]];
function levelOf(score){let i=0;LEVELS.forEach((l,k)=>{if(score>=l[0])i=k});const cur=LEVELS[i],nx=LEVELS[i+1];
  return {i,name:cur[1],ic:cur[2],pct:nx?Math.round((score-cur[0])/(nx[0]-cur[0])*100):100,next:nx?nx[0]-score:0,nxName:nx?nx[1]:""}}
window.hvLevelOf=levelOf;

/* ---------- what earns stars (display only, the numbers live on the server) ---------- */
const EARN=[["✋","Check in at class","+10"],["🔥","4 Sundays in a row","+10 bonus"],["🏆","Quiz: each right answer","+1"],["🌟","Quiz: all 3 stars","+5 bonus"],["🎮","Finish a game","+3 to +10"],["📖","Daily verse challenge","+5"],["📚","Read a Bible chapter","+2"],["🎨","Finish a coloring page","+2"],["🎓","Mark a lesson done","+5"]];

/* ---------- shop: id, slot, name, price, rarity (c common, r rare, l legendary) ---------- */
const CATALOG=[
["hat_cap","hat","Baseball cap",15,"c"],["hat_shepherd","hat","Shepherd hat",30,"c"],["hat_crown","hat","Golden crown",80,"r"],["hat_mitre","hat","Bishop's mitre",150,"l"],
["halo_gold","halo","Golden halo",40,"c"],["halo_stars","halo","Star halo",90,"r"],
["wings_white","wings","Angel wings",70,"r"],["wings_gold","wings","Golden wings",160,"l"],
["robe_blue","robe","Blue robe",20,"c"],["robe_green","robe","Green robe",25,"c"],["robe_royal","robe","Royal robe",70,"r"],["robe_light","robe","Robe of light",130,"l"],
["pet_fish","pet","Little fish",25,"c"],["pet_lamb","pet","Lamb",40,"c"],["pet_dove","pet","Dove",60,"r"],["pet_lion","pet","Lion cub",110,"r"],
["bg_cloud","bg","Clouds",20,"c"],["bg_desert","bg","Desert",30,"c"],["bg_church","bg","Church",40,"c"],["bg_stars","bg","Starry night",50,"r"],["bg_ark","bg","Noah's ark",60,"r"],["bg_rainbow","bg","Rainbow",120,"l"],
["frame_gold","frame","Gold frame",40,"c"],["frame_rainbow","frame","Rainbow frame",90,"r"],["frame_glow","frame","Glowing frame",150,"l"]];
const ITEM={};CATALOG.forEach(c=>ITEM[c[0]]={id:c[0],slot:c[1],name:c[2],price:c[3],rar:c[4]});
const SLOTS=[["hat","Hats"],["halo","Halos"],["wings","Wings"],["robe","Robes"],["pet","Pets"],["bg","Backgrounds"],["frame","Frames"]];
const RAR={c:["Common","#9aa3b5"],r:["Rare","#4a8fd8"],l:["Legendary","#e3b45c"]};

/* ---------- badges (the server decides when you get one) ---------- */
const BADGES=[["first_star","⭐","First star","Earn your first star"],["stars_100","💫","100 stars","Earn 100 stars in total"],["stars_500","🌟","500 stars","Earn 500 stars in total"],
["first_sunday","🌱","First Sunday","Check in at class"],["sunday_10","🏅","10 Sundays","Check in 10 times"],["streak_4","🔥","4 in a row","Come 4 Sundays in a row"],
["shopper","🛍️","First purchase","Buy something in the shop"],["collector","🎁","Collector","Own 8 shop items"],["quiz_whiz","🧠","Quiz whiz","Get 3 stars on 3 quizzes"],
["gamer","🎮","Gamer","Finish 10 games"],["scholar","🎓","Scholar","Mark 10 lessons done"],["reader","📚","Bible reader","Read 10 Bible chapters"],
["artist","🎨","Artist","Finish 5 coloring pages"],["verse_7","📜","Verse jar","Learn 7 daily verses"]];

/* ---------- avatar parts ---------- */
const SKIN=["#fbd9bd","#f3c29b","#e0a678","#c68642","#8d5524","#5c3a1e"];
const HAIRC=["#2b1d12","#5a3a22","#8b5a2b","#d9a441","#c0392b","#8e8e93","#e86f8a","#2f5fb3"];
const FIT=["#4a90d9","#e0605a","#3fae6a","#e3b45c","#8e6bd1","#f2a65a"];
const HAIRN=["Short","Long","Curly","Buzz","Pigtails","Side part"],EYEN=["Dots","Happy","Sparkle","Lashes"],ACCN=["None","Glasses","Freckles"];
const DEF={skin:1,hair:0,hc:1,eyes:0,fit:0,acc:0,hat:"",halo:"",wings:"",robe:"",pet:"",bg:"",frame:""};
let uid=0;

function bgArt(id,g){
  switch(id){
    case"bg_cloud":return `<rect width="100" height="100" fill="#bfe3f7"/><g fill="#fff"><ellipse cx="25" cy="30" rx="16" ry="7"/><ellipse cx="36" cy="26" rx="10" ry="8"/><ellipse cx="75" cy="52" rx="18" ry="7"/><ellipse cx="66" cy="48" rx="9" ry="7"/></g>`;
    case"bg_desert":return `<rect width="100" height="100" fill="#f7d9a0"/><circle cx="78" cy="22" r="10" fill="#fff3b0"/><path d="M0 80Q25 62 50 76T100 70V100H0Z" fill="#e0b46a"/>`;
    case"bg_church":return `<rect width="100" height="100" fill="#c9d9f5"/><g fill="#f4efe3"><rect x="62" y="40" width="26" height="42"/><path d="M58 42L75 24L92 42Z"/></g><rect x="73.5" y="14" width="3" height="11" fill="#e3b45c"/><rect x="70.5" y="17" width="9" height="3" fill="#e3b45c"/><rect x="71" y="62" width="8" height="20" rx="4" fill="#8a6a3a"/>`;
    case"bg_stars":return `<rect width="100" height="100" fill="#1b2352"/><g fill="#ffe9a8"><circle cx="18" cy="20" r="1.8"/><circle cx="82" cy="16" r="1.4"/><circle cx="70" cy="40" r="1.6"/><circle cx="12" cy="56" r="1.3"/><circle cx="90" cy="64" r="1.8"/><circle cx="30" cy="10" r="1.2"/></g><circle cx="84" cy="30" r="7" fill="#fff3c4"/>`;
    case"bg_ark":return `<rect width="100" height="100" fill="#cfe9f7"/><path d="M0 78Q25 70 50 78T100 76V100H0Z" fill="#5aa6d6"/><path d="M14 66h40l-6 12H20Z" fill="#8a5a2b"/><rect x="26" y="56" width="18" height="10" fill="#c98a4a"/><path d="M22 56L35 48L48 56Z" fill="#a8672e"/>`;
    case"bg_rainbow":return `<rect width="100" height="100" fill="#d7ecff"/><g fill="none" stroke-width="5"><path d="M-6 90A56 56 0 0 1 106 90" stroke="#e0605a"/><path d="M0 90A50 50 0 0 1 100 90" stroke="#f2a65a"/><path d="M6 90A44 44 0 0 1 94 90" stroke="#f1d56a"/><path d="M12 90A38 38 0 0 1 88 90" stroke="#5fd08f"/><path d="M18 90A32 32 0 0 1 82 90" stroke="#4a90d9"/></g>`;
    default:return `<rect width="100" height="100" fill="url(#bg${g})"/>`}}

function petArt(id){
  switch(id){
    case"pet_lamb":return `<g transform="translate(72 74)"><circle cx="0" cy="2" r="9" fill="#fff"/><circle cx="-6" cy="-2" r="5" fill="#fff"/><circle cx="6" cy="-3" r="5" fill="#fff"/><ellipse cx="-3" cy="2" rx="4.4" ry="4" fill="#3a2f2a"/><circle cx="-4.4" cy="1" r=".9" fill="#fff"/><circle cx="-1.6" cy="1" r=".9" fill="#fff"/><rect x="-6" y="8" width="2.4" height="6" rx="1" fill="#3a2f2a"/><rect x="3" y="8" width="2.4" height="6" rx="1" fill="#3a2f2a"/></g>`;
    case"pet_dove":return `<g transform="translate(76 70)"><ellipse cx="0" cy="3" rx="9" ry="6" fill="#fff"/><circle cx="-7" cy="-2" r="4.5" fill="#fff"/><path d="M-11 -2l-4 1.5 4 1z" fill="#f2a65a"/><path d="M-2 0Q5 -12 12 -7Q6 -2 4 4Z" fill="#e8eefb"/><circle cx="-8" cy="-3" r=".9" fill="#333"/></g>`;
    case"pet_lion":return `<g transform="translate(72 74)"><circle cx="0" cy="0" r="11" fill="#d98a2b"/><circle cx="0" cy="1" r="7.5" fill="#f3c46a"/><circle cx="-2.6" cy="-.5" r=".9" fill="#333"/><circle cx="2.6" cy="-.5" r=".9" fill="#333"/><path d="M-1.6 2.2h3.2l-1.6 1.6z" fill="#8a4a2b"/><circle cx="-8" cy="-8" r="3" fill="#f3c46a"/><circle cx="8" cy="-8" r="3" fill="#f3c46a"/></g>`;
    case"pet_fish":return `<g transform="translate(74 76)"><ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#4aa8e0"/><path d="M8 0l7 -5v10z" fill="#2f86bd"/><circle cx="-4.5" cy="-1" r="1.1" fill="#fff"/><circle cx="-4.5" cy="-1" r=".5" fill="#222"/><path d="M-9 0Q-7 1.5 -5 .6" stroke="#1d5f8f" fill="none" stroke-width=".8"/></g>`;
    default:return ""}}

function hatArt(id){
  switch(id){
    case"hat_cap":return `<path d="M33 36Q50 14 67 36Z" fill="#e0605a"/><path d="M62 35h20q-3 5-20 4Z" fill="#c4463f"/><circle cx="50" cy="19" r="2.4" fill="#c4463f"/>`;
    case"hat_shepherd":return `<ellipse cx="50" cy="31" rx="24" ry="5.5" fill="#c98a4a"/><path d="M36 31Q38 14 50 14Q62 14 64 31Z" fill="#b0743a"/><rect x="36" y="25" width="28" height="3.5" fill="#6d4a24"/>`;
    case"hat_crown":return `<path d="M34 34L36 17L44 26L50 14L56 26L64 17L66 34Z" fill="#f1c24d" stroke="#c9972b" stroke-width="1"/><circle cx="36" cy="17" r="2" fill="#e0605a"/><circle cx="50" cy="14" r="2.2" fill="#4a90d9"/><circle cx="64" cy="17" r="2" fill="#e0605a"/>`;
    case"hat_mitre":return `<path d="M36 34Q36 10 50 6Q64 10 64 34Z" fill="#f4efe3" stroke="#e3b45c" stroke-width="1.5"/><rect x="48.4" y="12" width="3.2" height="16" fill="#e3b45c"/><rect x="43" y="17.5" width="14" height="3.2" fill="#e3b45c"/>`;
    default:return ""}}

function haloArt(id){
  if(id==="halo_gold")return `<ellipse cx="50" cy="14" rx="15" ry="4" fill="none" stroke="#f6d27a" stroke-width="3"/><ellipse cx="50" cy="14" rx="15" ry="4" fill="none" stroke="#fff3c4" stroke-width="1" opacity=".8"/>`;
  if(id==="halo_stars")return `<g fill="#f6d27a"><circle cx="34" cy="14" r="2"/><circle cx="42" cy="9" r="2.4"/><circle cx="50" cy="7" r="2.8"/><circle cx="58" cy="9" r="2.4"/><circle cx="66" cy="14" r="2"/></g><ellipse cx="50" cy="12" rx="17" ry="5" fill="none" stroke="#fff3c4" stroke-width=".8" opacity=".7"/>`;
  return ""}

function wingsArt(id){
  const c=id==="wings_gold"?["#f6d27a","#e3b45c"]:["#ffffff","#dfe8f8"];
  return id?`<g><path d="M44 66Q14 44 8 70Q22 70 30 80Q36 76 44 80Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.2"/><path d="M56 66Q86 44 92 70Q78 70 70 80Q64 76 56 80Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.2"/></g>`:""}

function robeFill(id,fit){return id==="robe_blue"?"#3f7fd0":id==="robe_green"?"#3b9a62":id==="robe_royal"?"#7a45b8":id==="robe_light"?"#fff8e1":FIT[fit]}

function hairBack(h,c){
  if(h===1)return `<path d="M30 46Q28 22 50 22Q72 22 70 46L72 70Q60 66 58 56L42 56Q40 66 28 70Z" fill="${c}"/>`;
  if(h===4)return `<circle cx="30" cy="52" r="7" fill="${c}"/><circle cx="70" cy="52" r="7" fill="${c}"/>`;
  return ""}
function hairFront(h,c){
  switch(h){
    case 0:return `<path d="M32 42Q30 22 50 22Q70 22 68 42Q60 30 50 32Q40 30 32 42Z" fill="${c}"/>`;
    case 1:return `<path d="M32 42Q32 22 50 22Q68 22 68 42Q58 30 50 33Q42 30 32 42Z" fill="${c}"/>`;
    case 2:return `<g fill="${c}"><circle cx="35" cy="32" r="7"/><circle cx="44" cy="26" r="8"/><circle cx="56" cy="26" r="8"/><circle cx="65" cy="32" r="7"/><circle cx="50" cy="30" r="7"/></g>`;
    case 3:return `<path d="M33 40Q33 26 50 26Q67 26 67 40Q60 34 50 35Q40 34 33 40Z" fill="${c}"/>`;
    case 4:return `<path d="M32 42Q30 22 50 22Q70 22 68 42Q60 31 50 33Q40 31 32 42Z" fill="${c}"/>`;
    default:return `<path d="M32 44Q28 22 50 21Q72 22 68 44Q64 34 56 32Q44 38 32 44Z" fill="${c}"/>`}}

function eyesArt(e){
  switch(e){
    case 1:return `<path d="M39 44q3-4 6 0M55 44q3-4 6 0" fill="none" stroke="#2b1d12" stroke-width="2" stroke-linecap="round"/>`;
    case 2:return `<g><circle cx="42" cy="44" r="3.8" fill="#2b1d12"/><circle cx="58" cy="44" r="3.8" fill="#2b1d12"/><circle cx="43.2" cy="42.8" r="1.4" fill="#fff"/><circle cx="59.2" cy="42.8" r="1.4" fill="#fff"/></g>`;
    case 3:return `<g><circle cx="42" cy="44" r="2.8" fill="#2b1d12"/><circle cx="58" cy="44" r="2.8" fill="#2b1d12"/><path d="M38 41l-2-1.4M41 39.6l-.6-2M62 41l2-1.4M59 39.6l.6-2" stroke="#2b1d12" stroke-width="1.2" stroke-linecap="round"/></g>`;
    default:return `<g><circle cx="42" cy="44" r="2.6" fill="#2b1d12"/><circle cx="58" cy="44" r="2.6" fill="#2b1d12"/></g>`}}

function frameArt(id,g){
  if(id==="frame_gold")return `<circle cx="50" cy="50" r="47" fill="none" stroke="#e3b45c" stroke-width="5"/><circle cx="50" cy="50" r="44.4" fill="none" stroke="#fff3c4" stroke-width="1" opacity=".7"/>`;
  if(id==="frame_rainbow")return `<circle cx="50" cy="50" r="47" fill="none" stroke="url(#rb${g})" stroke-width="5"/>`;
  if(id==="frame_glow")return `<circle cx="50" cy="50" r="46" fill="none" stroke="#fff3c4" stroke-width="3" filter="url(#gl${g})"/><circle cx="50" cy="50" r="47" fill="none" stroke="#f6d27a" stroke-width="2"/>`;
  return `<circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>`}

/* the character: layers from back to front */
function hvAvatar(cfg,size,o){
  o=o||{};const c=Object.assign({},DEF,cfg||{});const g=++uid;
  const skin=SKIN[c.skin]||SKIN[1],hair=HAIRC[c.hc]||HAIRC[0],robe=robeFill(c.robe,c.fit);
  const body=`<path d="M18 100Q20 66 50 64Q80 66 82 100Z" fill="${robe}"/>${c.robe==="robe_royal"?`<path d="M50 64V100" stroke="#f1c24d" stroke-width="3"/><path d="M34 70Q50 82 66 70" fill="none" stroke="#f1c24d" stroke-width="2.5"/>`:""}${c.robe==="robe_light"?`<path d="M18 100Q20 66 50 64Q80 66 82 100Z" fill="url(#lt${g})"/>`:""}<rect x="44" y="56" width="12" height="11" rx="4" fill="${skin}"/>`;
  const face=`<circle cx="50" cy="45" r="19" fill="${skin}"/><circle cx="31.5" cy="46" r="3.4" fill="${skin}"/><circle cx="68.5" cy="46" r="3.4" fill="${skin}"/>`;
  const cheeks=`<circle cx="38" cy="52" r="3" fill="#f08a8a" opacity=".35"/><circle cx="62" cy="52" r="3" fill="#f08a8a" opacity=".35"/>`;
  const mouth=`<path d="M44 54q6 6 12 0" fill="none" stroke="#9a4a3a" stroke-width="2" stroke-linecap="round"/>`;
  const acc=c.acc===1?`<g fill="none" stroke="#3a2f2a" stroke-width="1.8"><circle cx="42" cy="44" r="6"/><circle cx="58" cy="44" r="6"/><path d="M48 44h4"/></g>`:c.acc===2?`<g fill="#b8704a" opacity=".6"><circle cx="39" cy="50" r=".9"/><circle cx="42" cy="51.5" r=".9"/><circle cx="36.5" cy="51.5" r=".9"/><circle cx="61" cy="50" r=".9"/><circle cx="58" cy="51.5" r=".9"/><circle cx="63.5" cy="51.5" r=".9"/></g>`:"";
  return `<svg class="hvav" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${E(o.label||"Avatar")}" style="display:block;overflow:visible">
  <defs><clipPath id="cl${g}"><circle cx="50" cy="50" r="49"/></clipPath><linearGradient id="bg${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff"/><stop offset="1" stop-color="#fbe7c4"/></linearGradient>
  <linearGradient id="rb${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0605a"/><stop offset=".3" stop-color="#f1d56a"/><stop offset=".6" stop-color="#5fd08f"/><stop offset="1" stop-color="#4a90d9"/></linearGradient>
  <linearGradient id="lt${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f6d27a"/></linearGradient><filter id="gl${g}"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
  <g clip-path="url(#cl${g})">${bgArt(c.bg,g)}${wingsArt(c.wings)}${petArt(c.pet)}${body}${hairBack(c.hair,hair)}${face}${hairFront(c.hair,hair)}<g class="av-blink">${eyesArt(c.eyes)}</g>${cheeks}${mouth}${acc}${hatArt(c.hat)}${haloArt(c.halo)}</g>${frameArt(c.frame,g)}</svg>`}
window.hvAvatar=hvAvatar;
window.hvAvatarOf=(a,px)=>a&&a.user&&a.user.av?hvAvatar(a.user.av,px):null;

/* ---------- helpers ---------- */
const bal=u=>(u.score||0)-(u.spent||0);
async function post(body){const a=A();const r=await fetch(GU(),{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
function saveUser(u){const a=A();a.user=u;try{localStorage.setItem("hv_acct",JSON.stringify(a))}catch{}if(window.hvStarsRefresh)hvStarsRefresh(0);if(window.hvRefreshBarAvatar)hvRefreshBarAvatar()}
const S={tab:"avatar",slot:"all",cur:null};

/* ---------- level up, badges ---------- */
window.hvLevelUp=function(lv){
  const o=document.createElement("div");o.className="lvup";o.setAttribute("role","dialog");o.setAttribute("aria-label","Level up");
  o.innerHTML=`<div class="lvbox"><div class="lvglow"></div>${window.hvLumiSvg?`<div class="lvlumi" aria-hidden="true">${hvLumiSvg("excited",110)}</div>`:""}<div class="lvic">${lv.ic}</div><div class="lvk">LEVEL UP!</div><div class="lvn">${E(lv.name)}</div><button class="btn gold" id="lvok">Wonderful!</button></div>`;
  document.body.appendChild(o);if(window.confetti)confetti();
  const close=()=>o.remove();o.querySelector("#lvok").onclick=close;o.addEventListener("click",e=>{if(e.target===o)close()});o.querySelector("#lvok").focus()};
window.hvBadgeToast=function(keys){(keys||[]).forEach((k,i)=>{const b=BADGES.find(x=>x[0]===k);if(b)setTimeout(()=>toast("🏅 New badge: "+b[2]),900+i*2300)})};

/* ---------- pages ---------- */
function loginNeeded(){app.innerHTML=`${topbar("Me","🌟","Your stars, avatar and account")}${hvGate({scene:"star",title:"Your treasures are waiting",lead:"Make a profile to collect stars, build your avatar and win badges.",benefits:[["star","Collect stars as you learn"],["user","Build your own avatar"],["trophy","Win badges and level up"]],preview:"stars",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`}

function statCards(u){let done=0,quiz=0;try{done=(JSON.parse(localStorage.getItem("hv_done")||"[]")||[]).length}catch{}try{quiz=Object.keys(JSON.parse(localStorage.getItem("hv_best")||"{}")||{}).length}catch{}
  const cards=[["star",bal(u),"Stars to spend"],["check",done,"Lessons done"],["trophy",quiz,"Quizzes taken"],["crown",(u.badges||[]).length,"Badges"]];
  return `<div class="kc-stats">${cards.map(c=>`<div class="kc-st"><span aria-hidden="true">${window.hvIcon?hvIcon(c[0],40):""}</span><b>${c[1]}</b><small>${c[2]}</small></div>`).join("")}</div>`}
function hero(u){
  const lv=levelOf(u.score||0);
  return `<section class="kc-hero"><div class="kc-ped"><div class="kc-glow"></div><div id="kcAv" class="kc-av">${hvAvatar(S.cur||u.av,150,{label:"My avatar"})}</div><div class="kc-base"></div></div>
   <div class="kc-name">${E(u.name)}</div><div class="kc-lv"><span>${lv.ic}</span> ${E(lv.name)}</div>
   <div class="kc-stars"><b id="kcBal">${bal(u)}</b> ⭐ to spend <small>${u.score||0} earned in total</small></div>
   <div class="ds-bar" id="kcBar" aria-label="Level progress"><i style="--w:${lv.pct}%"></i></div><div class="tag" style="text-align:center">${lv.next?`${lv.next} more stars to ${E(lv.nxName)}`:"Top level! Wonderful!"}</div></section>`}

function avatarTab(u){
  const c=S.cur,own=u.own||[];
  const sw=(arr,key,labels)=>arr.map((v,i)=>`<button class="kc-sw${c[key]===i?" on":""}" data-set="${key}" data-v="${i}" style="${typeof v==="string"?`background:${v}`:""}" aria-label="${labels?labels[i]:v}" aria-pressed="${c[key]===i}">${typeof v==="string"?"":v}</button>`).join("");
  const worn=SLOTS.map(([sl,nm])=>{const mine=CATALOG.filter(x=>x[1]===sl&&own.includes(x[0]));return mine.length?`<div class="kc-row"><span class="kc-lab">${nm}</span><div class="ds-chips"><button class="ds-chip" data-wear="${sl}" data-id="" aria-pressed="${!c[sl]}">None</button>${mine.map(x=>`<button class="ds-chip" data-wear="${sl}" data-id="${x[0]}" aria-pressed="${c[sl]===x[0]}">${E(x[2])}</button>`).join("")}</div></div>`:""}).join("");
  return `<div class="kc-grid"><div class="kc-row"><span class="kc-lab">Skin</span><div class="kc-sws">${sw(SKIN,"skin",["Skin 1","Skin 2","Skin 3","Skin 4","Skin 5","Skin 6"])}</div></div>
  <div class="kc-row"><span class="kc-lab">Hair</span><div class="ds-chips">${HAIRN.map((n,i)=>`<button class="ds-chip" data-set="hair" data-v="${i}" aria-pressed="${c.hair===i}">${n}</button>`).join("")}</div></div>
  <div class="kc-row"><span class="kc-lab">Hair color</span><div class="kc-sws">${sw(HAIRC,"hc")}</div></div>
  <div class="kc-row"><span class="kc-lab">Eyes</span><div class="ds-chips">${EYEN.map((n,i)=>`<button class="ds-chip" data-set="eyes" data-v="${i}" aria-pressed="${c.eyes===i}">${n}</button>`).join("")}</div></div>
  <div class="kc-row"><span class="kc-lab">Outfit</span><div class="kc-sws">${sw(FIT,"fit")}</div></div>
  <div class="kc-row"><span class="kc-lab">Extra</span><div class="ds-chips">${ACCN.map((n,i)=>`<button class="ds-chip" data-set="acc" data-v="${i}" aria-pressed="${c.acc===i}">${n}</button>`).join("")}</div></div>
  ${worn||`<div class="tag">Buy hats, wings, pets and more in the Shop, then wear them here.</div>`}
  <div class="two"><button class="btn alt" id="kcRand">🎲 Surprise me</button><button class="btn gold" id="kcSave">💾 Save my avatar</button></div><div id="kcMsg" role="status" class="tag"></div></div>`}

function shopTab(u){
  const own=u.own||[],b=bal(u);
  const list=CATALOG.filter(x=>S.slot==="all"||x[1]===S.slot);
  return `<div class="ds-chips" id="kcSlots"><button class="ds-chip" data-slot="all" aria-pressed="${S.slot==="all"}">All</button>${SLOTS.map(s=>`<button class="ds-chip" data-slot="${s[0]}" aria-pressed="${S.slot===s[0]}">${s[1]}</button>`).join("")}</div>
  <div class="kc-shop">${list.map(x=>{const r=RAR[x[4]],has=own.includes(x[0]);
    return `<button class="kc-item ${has?"own":""}" data-buy="${x[0]}" style="--rc:${r[1]}" aria-label="${E(x[2])}, ${r[0]}, ${has?"owned":x[3]+" stars"}"><span class="kc-pv" data-pv="${x[0]}">${hvAvatar(Object.assign({},DEF,{[x[1]]:x[0]}),84,{label:x[2]})}</span><b>${E(x[2])}</b><span class="kc-r">${r[0]}</span>${has?`<span class="kc-price own">✓ Yours</span>`:`<span class="kc-price ${b<x[3]?"low":""}">${x[3]} ⭐</span>`}</button>`}).join("")}</div>`}

function badgesTab(u){
  const got=u.badges||[];
  return `<div class="tag">${got.length} of ${BADGES.length} earned</div><div class="kc-badges">${BADGES.map(b=>`<div class="ds-badge ${got.includes(b[0])?"on":"lock"}"><i>${b[1]}</i>${E(b[2])}<small>${got.includes(b[0])?"Earned!":E(b[3])}</small></div>`).join("")}</div>`}

function earnTab(){return `<div class="kc-earn">${EARN.map(e=>`<div class="kc-erow"><span>${e[0]}</span><b>${E(e[1])}</b><span class="kc-ev">${e[2]}</span></div>`).join("")}</div><div class="tag">Some things can only be done a few times a day, so come back tomorrow for more!</div>`}

const bodyOf=u=>S.tab==="avatar"?avatarTab(u):S.tab==="shop"?shopTab(u):S.tab==="badges"?badgesTab(u):S.tab==="account"?`<div id="kcAcct"></div>`:earnTab();
const drawAcct=()=>{if(S.tab==="account"&&window.hvAccountTab)hvAccountTab(document.getElementById("kcAcct"))};
function kidsPage(){
  const a=A();if(!a){loginNeeded();return}
  const u=a.user;if(!S.cur)S.cur=Object.assign({},DEF,u.av||{});
  app.innerHTML=`${topbar("Me","🌟","Your stars, avatar and account")}<div class="kc-wrap">${hero(u)}${statCards(u)}<div class="kc-main">
  <div class="ds-seg" id="kcTabs" role="tablist">${[["avatar","🧒 Avatar"],["shop","🛍️ Shop"],["badges","🏅 Badges"],["earn","⭐ Earn"],["account","⚙️ Account"]].map(t=>`<button data-tab="${t[0]}" aria-pressed="${S.tab===t[0]}" role="tab">${t[1]}</button>`).join("")}</div>
  <section class="card sec" id="kcBody">${bodyOf(u)}</section></div></div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById("kcBar")?.classList.add("go")));
  wire(u);drawAcct()}

function refresh(){const a=A();if(!a)return;const u=a.user;document.getElementById("kcAv").innerHTML=hvAvatar(S.cur,150,{label:"My avatar"});
  const body=document.getElementById("kcBody");body.innerHTML=bodyOf(u);wireBody(u);drawAcct()}

function wire(u){
  document.getElementById("kcTabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;S.tab=b.dataset.tab;document.querySelectorAll("#kcTabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));refresh()});
  wireBody(u)}

function wireBody(u){
  const body=document.getElementById("kcBody");
  body.onclick=async e=>{
    const set=e.target.closest("[data-set]");if(set){S.cur[set.dataset.set]=+set.dataset.v;refresh();return}
    const wear=e.target.closest("[data-wear]");if(wear){S.cur[wear.dataset.wear]=wear.dataset.id;refresh();return}
    const sl=e.target.closest("[data-slot]");if(sl){S.slot=sl.dataset.slot;refresh();return}
    const buy=e.target.closest("[data-buy]");if(buy){buySheet(buy.dataset.buy,buy);return}
    if(e.target.closest("#kcRand")){const own=(A().user.own||[]);const r=n=>Math.floor(Math.random()*n);
      S.cur=Object.assign({},S.cur,{skin:r(6),hair:r(6),hc:r(8),eyes:r(4),fit:r(6),acc:r(3)});
      SLOTS.forEach(([s])=>{const m=CATALOG.filter(x=>x[1]===s&&own.includes(x[0]));S.cur[s]=m.length&&Math.random()<.6?m[r(m.length)][0]:""});refresh();return}
    if(e.target.closest("#kcSave"))saveAvatar()}}

async function saveAvatar(){
  const msg=document.getElementById("kcMsg"),btn=document.getElementById("kcSave");btn.disabled=true;msg.textContent="Saving...";
  try{const j=await post({action:"avatar_set",av:S.cur});if(j.ok){saveUser(j.user);msg.textContent="Saved! Looking great ✨";if(window.hvFx){const r=btn.getBoundingClientRect();hvFx.burst(r.left+r.width/2,r.top,"✨",8)}}else msg.innerHTML=`<span class="err">Could not save. Try again.</span>`}
  catch{msg.innerHTML=`<span class="err">No internet connection.</span>`}
  btn.disabled=false}

function buySheet(id,card){
  const it=ITEM[id],u=A().user,own=(u.own||[]).includes(id),b=bal(u),r=RAR[it.rar];
  const sh=sheet(`<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px"><div class="kc-bigpv" style="--rc:${r[1]}">${hvAvatar(Object.assign({},S.cur,{[it.slot]:id}),170,{label:it.name})}</div><h3>${E(it.name)}</h3><span class="kc-r" style="--rc:${r[1]}">${r[0]}</span>
   ${own?`<div class="tag">You already have this one. Wear it in the Avatar tab.</div>`:`<div class="kc-price">${it.price} ⭐</div><div class="tag">You have ${b} ⭐. After buying: ${Math.max(0,b-it.price)} ⭐</div><button class="btn gold" id="kcBuy" ${b<it.price?"disabled":""}>${b<it.price?`Need ${it.price-b} more stars`:"Buy it!"}</button><div id="kcBm" role="status" class="tag"></div>`}</div>`,"Buy "+it.name);
  const bb=sh.querySelector("#kcBuy");if(!bb)return;
  bb.onclick=async()=>{bb.disabled=true;try{const j=await post({action:"shop_buy",item:id});
    if(j.ok){const from=sh.querySelector(".kc-bigpv"),to=document.getElementById("kcAv");saveUser(j.user);S.cur[it.slot]=id;
      if(window.hvFx)hvFx.fly(from,to,"🎁",5);closeSheet();S.tab="avatar";kidsPage();
      toast("Yours now! Don't forget to save 💾");hvBadgeToast(j.badges)}
    else{sh.querySelector("#kcBm").innerHTML=`<span class="err">${j.error==="poor"?"Not enough stars yet.":j.error==="owned"?"You already own it.":"Could not buy. Try again."}</span>`;bb.disabled=false}}
    catch{sh.querySelector("#kcBm").innerHTML=`<span class="err">No internet connection.</span>`;bb.disabled=false}}}

window.kidsRoute=function(h){if(h==="kids"||h==="profile"||h==="me"){S.cur=null;kidsPage();return true}return false};

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
.kc-hero{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.kc-ped{position:relative;width:200px;height:190px;display:grid;place-items:center}
.kc-glow{position:absolute;left:50%;top:44%;width:240px;height:240px;margin:-120px;border-radius:50%;background:radial-gradient(closest-side,var(--halo),transparent);animation:halo 6s ease-in-out infinite}
.kc-av{position:relative;width:150px;height:150px;animation:floaty 5.5s ease-in-out infinite}
.kc-base{position:absolute;left:50%;bottom:4px;width:150px;height:26px;margin-left:-75px;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,rgba(255,243,196,.95),rgba(227,180,92,.55) 55%,transparent 72%)}
.kc-name{font-family:var(--display);font-size:var(--fs-l);font-weight:800}
.kc-lv{display:inline-flex;gap:6px;align-items:center;padding:4px 14px;border-radius:999px;background:var(--gold-soft);font-weight:900;color:var(--ink)}
.kc-stars{font-size:var(--fs-l);font-weight:900}.kc-stars small{display:block;font-size:var(--fs-s);color:var(--muted);font-weight:700}
#kcBar{width:min(320px,90%);height:14px}
.kc-grid,.kc-erow{display:flex;flex-direction:column;gap:12px}
.kc-row{display:flex;flex-direction:column;gap:6px}.kc-lab{font-weight:900;font-size:var(--fs-s);color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.kc-sws{display:flex;flex-wrap:wrap;gap:8px}
.kc-sw{width:44px;height:44px;border-radius:50%;border:3px solid transparent;box-shadow:inset 0 0 0 2px rgba(0,0,0,.15)}
.kc-sw.on,.kc-sw[aria-pressed=true]{border-color:var(--gold);box-shadow:0 0 0 2px var(--bg),0 0 12px var(--gold)}
.kc-shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}
.kc-item{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:12px 8px;border-radius:var(--r-m);border:1.5px solid color-mix(in srgb,var(--rc) 55%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--rc) 16%,var(--glass)),var(--glass));color:var(--ink);font:inherit;text-align:center;box-shadow:0 0 18px -6px var(--rc);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.kc-item:active{transform:scale(.96)}.kc-item b{font-size:var(--fs-s);line-height:1.2}
.kc-r{font-size:.7rem;font-weight:900;color:var(--rc);text-transform:uppercase;letter-spacing:.06em}
.kc-price{font-weight:900;font-size:var(--fs-m)}.kc-price.low{opacity:.55}.kc-price.own{color:var(--good)}
.kc-item.own{opacity:.8}
.kc-bigpv{padding:10px;border-radius:50%;box-shadow:0 0 34px -4px var(--rc)}
.kc-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}
.ds-badge small{display:block;color:var(--muted);font-weight:700;font-size:.66rem}
.kc-erow{flex-direction:row;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}.kc-erow b{flex:1}.kc-ev{font-weight:900;color:var(--gold)}
.kc-earn{display:flex;flex-direction:column}
.hvav .av-blink{transform-box:fill-box;transform-origin:center;animation:avblink 5s infinite}
@keyframes avblink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
.lvup{position:fixed;inset:0;z-index:2700;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(255,215,120,.45),rgba(8,12,34,.92));animation:lvfade .4s ease both}
.lvbox{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:30px;color:#fff}
.lvglow{position:absolute;left:50%;top:30%;width:300px;height:300px;margin:-150px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,225,140,.9),transparent);animation:halo 3s ease-in-out infinite}
.lvic{position:relative;font-size:7rem;line-height:1.15;margin-bottom:14px;animation:lvpop .9s cubic-bezier(.34,1.56,.64,1) both;filter:drop-shadow(0 0 24px rgba(255,220,120,.9))}
.lvk{position:relative;font-family:var(--display);letter-spacing:.3em;font-weight:800;color:#f6d27a}.lvn{position:relative;font-family:var(--display);font-size:2rem;font-weight:800;text-shadow:0 2px 12px rgba(0,0,0,.5)}
@keyframes lvpop{from{transform:scale(.2) rotate(-20deg);opacity:0}}@keyframes lvfade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.kc-av,.kc-glow,.lvglow,.lvic,.hvav .av-blink,.lvup{animation:none!important}}
`;
document.head.appendChild(st);
})();
