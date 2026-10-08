/* Heavenly Visions: engagement. Weekly goal, Bible reading plan, install prompt, Sunday reminder, bedtime streak.
   Everything is saved on the phone (localStorage), so it works offline and without an account. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=(k,d)=>{try{const v=localStorage.getItem("hv_"+k);return v?JSON.parse(v):d}catch{return d}};
const set=(k,v)=>{try{localStorage.setItem("hv_"+k,JSON.stringify(v))}catch{}};
const pad=n=>String(n).padStart(2,"0"),dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>dkey(new Date());
const weekKey=()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());return dkey(d)};

/* ---------- weekly goal: 3 lessons, 1 quiz, 2 Bible chapters (week starts on Sunday) ---------- */
const GOAL=[["lesson","Watch lessons",3,"clap"],["quiz","Finish a quiz",1,"trophy"],["bible","Read Bible chapters",2,"book"]];
function wk(){const w=get("wk",null);return w&&w.w===weekKey()?w:{w:weekKey(),ev:{}}}
function count(w,k){return (w.ev[k]||[]).length}
function done(w){return GOAL.every(g=>count(w,g[0])>=g[2])}
function record(kind,ref){
  if(!GOAL.some(g=>g[0]===kind))return;
  const w=wk(),a=w.ev[kind]=w.ev[kind]||[],id=String(ref);if(a.includes(id))return;a.push(id);
  const was=get("wkdone",[]).includes(w.w);set("wk",w);
  if(!was&&done(w)){const l=get("wkdone",[]);l.push(w.w);set("wkdone",l);setTimeout(celebrate,1200)}}
function celebrate(){
  const n=get("wkdone",[]).length;
  if(window.confetti)confetti();
  if(window.sheet)sheet(`<div style="text-align:center"><div style="font-size:3.4rem" aria-hidden="true">🏅</div><h3>Weekly goal done!</h3><p class="tag">You watched, played and read this week. God bless you!</p><p style="font-weight:900;font-size:1.2rem">${n} ${n===1?"week":"weeks"} completed</p><div class="btns"><button class="btn gold" data-close>Amen</button></div></div>`,"Weekly goal done")}
/* count every award the app gives, even when nobody is logged in */
function hook(){
  if(!window.hvAward||hook.done)return;hook.done=1;const o=window.hvAward;
  window.hvAward=function(kind,ref,label,n){try{record(kind,ref)}catch{}return o.apply(this,arguments)}}
hook();addEventListener("DOMContentLoaded",hook);setTimeout(hook,0);

function goalCard(){
  const w=wk(),ok=done(w),total=GOAL.reduce((a,g)=>a+g[2],0),have=GOAL.reduce((a,g)=>a+Math.min(count(w,g[0]),g[2]),0),weeks=get("wkdone",[]).length;
  return `<section class="wkgoal${ok?" ok":""}" aria-label="This week's goal"><div class="wk-h"><b>${ok?"Goal done this week!":"This week's goal"}</b>${weeks?`<span class="wk-b" title="Weeks completed">🏅 ${weeks}</span>`:""}</div>
  <div class="wk-bar" role="img" aria-label="${have} of ${total} steps done"><i style="width:${Math.round(have/total*100)}%"></i></div>
  <div class="wk-steps">${GOAL.map(g=>{const c=Math.min(count(w,g[0]),g[2]),d=c>=g[2];return `<button class="wk-s${d?" d":""}" data-go="${g[0]==="lesson"?"media":g[0]==="quiz"?"quizzes":"bible"}"><span class="wk-i" aria-hidden="true">${d?"✅":({lesson:"🎬",quiz:"🏆",bible:"📖"})[g[0]]}</span><span><b>${g[1]}</b><small>${c} / ${g[2]}</small></span></button>`}).join("")}</div></section>`}

/* ---------- Bible reading plan: one chapter a day ---------- */
const PLAN=[["John",21],["Mark",16],["Luke",24],["Matthew",28],["Acts",28],["Psalms",150]];
const PLAN_LEN=PLAN.reduce((a,p)=>a+p[1],0);
const spot=i=>{let n=i;for(const p of PLAN){if(n<p[1])return [p[0],n+1];n-=p[1]}return null};
function plan(){return get("plan",{i:0,days:[]})}
window.hvPlanCard=function(){
  const p=plan(),s=spot(p.i),dn=p.days.includes(today());
  if(!s)return `<section class="plancard"><b>Reading plan finished!</b><small>You read ${PLAN_LEN} chapters. God bless you.</small></section>`;
  let streak=0;const d=new Date();if(!p.days.includes(dkey(d)))d.setDate(d.getDate()-1);while(p.days.includes(dkey(d))){streak++;d.setDate(d.getDate()-1)}
  return `<section class="plancard${dn?" dn":""}" aria-label="Reading plan"><span class="pl-i" aria-hidden="true">📖</span><span class="pl-t"><small>One chapter a day${streak>1?" · "+streak+" day streak":""}</small><b>${dn?"Done for today!":"Today: "+s[0]+" "+s[1]}</b><small>Chapter ${p.i+(dn?0:1)} of ${PLAN_LEN}</small></span>
  <button class="btn gold pl-go" data-go="b-${s[0]}-${s[1]}">${dn?"Read again":"Read now"}</button></section>`};
window.hvPlanRead=function(name,ch){
  const p=plan(),s=spot(p.i);if(!s||s[0]!==name||s[1]!==+ch||p.days.includes(today()))return;
  p.days.push(today());p.i++;set("plan",p);
  if(window.toast)toast("Today's chapter done! See you tomorrow")};

/* ---------- install prompt ---------- */
let deferred=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e});
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
(function(){const v=get("visits",0)+1;if(!sessionStorage.getItem("hv_vis")){try{sessionStorage.setItem("hv_vis","1")}catch{}set("visits",v)}})();
function installCard(){
  if(standalone()||get("noinstall",0)||get("visits",0)<2)return "";
  if(!deferred&&!ios())return "";
  return `<section class="tipcard" id="instcard"><span class="tp-i" aria-hidden="true">📲</span><span class="tp-t"><b>Add to your home screen</b><small>Open Heavenly Visions like an app, even without internet.</small></span><button class="btn gold" id="instgo">Add</button><button class="tp-x" id="instno" aria-label="Hide this">×</button></section>`}
document.addEventListener("click",async e=>{
  if(e.target.closest("#instgo")){
    if(deferred){deferred.prompt();try{await deferred.userChoice}catch{}deferred=null;document.getElementById("instcard")?.remove()}
    else if(window.sheet)sheet(`<h3>Add to home screen</h3><ol class="steps"><li>Tap the <b>Share</b> button at the bottom of Safari.</li><li>Scroll and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Done!</li></ol><div class="btns"><button class="btn gold" data-close>Got it</button></div>`,"Add to home screen");return}
  if(e.target.closest("#instno")){set("noinstall",1);document.getElementById("instcard")?.remove();return}
  if(e.target.closest("#remgo")){remindSheet();return}
  if(e.target.closest("#remdl")){remindFile(document.getElementById("remtime").value);return}
  if(e.target.closest("#remno")){set("noremind",1);document.getElementById("remcard")?.remove()}});

/* ---------- Sunday reminder: a repeating calendar event the phone's own calendar rings for ---------- */
function remindCard(){
  if(get("noremind",0)||get("remset",0))return "";
  return `<section class="tipcard" id="remcard"><span class="tp-i" aria-hidden="true">⏰</span><span class="tp-t"><b>Sunday reminder</b><small>Get a gentle nudge to check in every Sunday.</small></span><button class="btn" id="remgo">Set</button><button class="tp-x" id="remno" aria-label="Hide this">×</button></section>`}
function remindSheet(){
  if(!window.sheet)return;
  sheet(`<h3>Sunday reminder</h3><p class="tag">This adds a repeating event to your phone's calendar. Your phone will remind you every Sunday.</p><label class="field">What time?<select id="remtime"><option value="08:30">8:30 AM</option><option value="09:00" selected>9:00 AM</option><option value="09:30">9:30 AM</option><option value="10:00">10:00 AM</option><option value="10:30">10:30 AM</option><option value="11:00">11:00 AM</option></select></label><div class="btns"><button class="btn gold" id="remdl">Add to my calendar</button></div>`,"Sunday reminder")}
function remindFile(t){
  const [h,m]=t.split(":"),d=new Date();d.setDate(d.getDate()+((7-d.getDay())%7||7));
  const ds=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"T"+h+m+"00";
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Heavenly Visions//EN","BEGIN:VEVENT","UID:hv-sunday@heavenlyvisions","DTSTAMP:"+ds,"DTSTART:"+ds,"DURATION:PT1H","RRULE:FREQ=WEEKLY;BYDAY=SU","SUMMARY:Sunday School - check in on Heavenly Visions","DESCRIPTION:Open Heavenly Visions and tap Attendance.","BEGIN:VALARM","TRIGGER:-PT15M","ACTION:DISPLAY","DESCRIPTION:Sunday School time","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="sunday-school.ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
  set("remset",1);document.getElementById("remcard")?.remove();if(window.closeSheet)closeSheet();if(window.toast)toast("Open the file to add it to your calendar")}

/* ---------- Sunday banner: shows only on Sunday, until you check in ---------- */
function sundayBanner(){
  if(new Date().getDay()!==0)return "";
  const at=get("attended",[]);if(at.includes(today()))return "";
  return `<button class="tipcard sun" data-go="attendance"><span class="tp-i" aria-hidden="true">✋</span><span class="tp-t"><b>It's Sunday!</b><small>Tap here to check in.</small></span></button>`}

/* ---------- put the cards on Home ---------- */
const oldInit=window.hvHomeInit;
window.hvHomeInit=function(){
  if(oldInit)oldInit.apply(this,arguments);
  const nav=document.querySelector(".doors");if(!nav||document.getElementById("hvengage"))return;
  const box=document.createElement("div");box.id="hvengage";
  box.innerHTML=sundayBanner()+goalCard()+installCard()+remindCard();
  nav.parentNode.insertBefore(box,nav)};

/* ---------- bedtime prayer streak ---------- */
window.hvBedDone=function(){
  const d=get("bedn",[]);if(d.includes(today()))return false;d.push(today());set("bedn",d.slice(-120));return true};
window.hvBedStreak=function(){
  const d=get("bedn",[]);let s=0;const x=new Date();if(!d.includes(dkey(x)))x.setDate(x.getDate()-1);while(d.includes(dkey(x))){s++;x.setDate(x.getDate()-1)}return s};
window.hvFavs={get:()=>get("favstory",[]),toggle:id=>{const f=get("favstory",[]),i=f.indexOf(id);if(i>=0)f.splice(i,1);else f.push(id);set("favstory",f);return i<0}};
window.hvWeekly={goalCard,wk,done};
})();
