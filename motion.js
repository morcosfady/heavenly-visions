/* Heavenly Visions: motion presets and behaviours (premium upgrade, Phase 5). No animation library: the app works offline, so this is CSS plus small vanilla JS.
   hvMotion.press / enter / exit / pop / celebrate / stagger / count   presets (Web Animations API, skipped with reduced motion)
   hvTransition(run)    page transitions (View Transitions API: slide forward, slide back, cross-fade between tabs, shared element morphs)
   Also: pull to refresh on News, swipe to dismiss toasts, long press on a lesson for a preview, hover tilt on desktop, pause when the tab is hidden. */
(function(){
const root=document.documentElement;
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const T={press:120,fast:200,mid:300,slow:400,cele:700},EASE={out:"cubic-bezier(.2,.8,.2,1)",in:"cubic-bezier(.4,0,1,1)",spring:"cubic-bezier(.34,1.56,.64,1)"};
const anim=(el,kf,o)=>reduce()||!el||!el.animate?null:el.animate(kf,Object.assign({duration:T.mid,easing:EASE.out,fill:"both"},o));

window.hvMotion={
  T,EASE,
  press:el=>anim(el,[{transform:"scale(1)"},{transform:"scale(.96)"},{transform:"scale(1)"}],{duration:T.fast}),
  enter:(el,o)=>anim(el,[{opacity:0,transform:"translateY(12px)"},{opacity:1,transform:"none"}],o),
  exit:(el,done)=>{const a=anim(el,[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(8px)"}],{duration:T.fast,easing:EASE.in});if(a)a.onfinish=()=>done&&done();else if(done)done()},
  pop:el=>anim(el,[{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:T.slow,easing:EASE.spring}),
  celebrate:el=>{const r=el&&el.getBoundingClientRect();if(window.hvFx&&r&&!reduce())hvFx.burst(r.left+r.width/2,r.top,"⭐",10);return anim(el,[{transform:"scale(1)"},{transform:"scale(1.1) rotate(-3deg)"},{transform:"scale(1)"}],{duration:T.cele,easing:EASE.spring})},
  stagger:(list,ms)=>{[...list].slice(0,8).forEach((el,i)=>anim(el,[{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{delay:i*(ms||45)}))},
  /* count a number up from 0, text like "3 / 5" */
  count:(el,to,of)=>{if(!el)return;if(reduce()){el.textContent=of?to+" / "+of:String(to);return}const t0=performance.now(),d=700;(function f(t){const k=Math.min(1,(t-t0)/d),v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=of?v+" / "+of:String(v);if(k<1)requestAnimationFrame(f)})(t0)}
};

/* ---------- first Home visit of the session: the doors rise in ---------- */
try{if(!sessionStorage.getItem("hv_home_in")&&!reduce()){sessionStorage.setItem("hv_home_in","1");root.classList.add("hv-home-first");setTimeout(()=>root.classList.remove("hv-home-first"),1600)}}catch{}

/* ---------- pause ambient animation when the tab is hidden ---------- */
document.addEventListener("visibilitychange",()=>root.classList.toggle("hv-paused",document.hidden));

/* ---------- page transitions ---------- */
const TABS=new Set(["home","media","games","me","profile","kids"]);
let stack=[decodeURIComponent(location.hash.slice(1)||"home")];
function dirOf(to){const from=stack[stack.length-1];if(to===from)return "tab";if(TABS.has(to)&&TABS.has(from)){stack=[to];return "tab"}
  const i=stack.lastIndexOf(to);if(i>=0){stack=stack.slice(0,i+1);return "back"}
  stack.push(to);if(stack.length>30)stack.shift();return "fwd"}
/* the element the person tapped, so it can morph into the next page */
document.addEventListener("click",e=>{window.__vtFrom=e.target.closest(".tile,.qcov,.row,.gcard,.sb-me,.sb-stars,.acard")||null},true);
const targetOf=from=>{const q=s=>document.querySelector(s);if(!from)return null;if(from.matches(".sb-me,.sb-stars"))return q(".kc-av");if(from.matches(".row"))return q(".vhero")||q(".hvhero");return q(".hvhero")};
window.hvTransition=function(run){
  const to=decodeURIComponent(location.hash.slice(1)||"home"),dir=dirOf(to);
  if(reduce()||!document.startViewTransition||document.hidden){run();return}
  const from=window.__vtFrom;window.__vtFrom=null;
  if(from&&from.isConnected&&dir==="fwd")from.style.viewTransitionName="hvshared";
  root.dataset.vt=dir;
  let t;try{t=document.startViewTransition(()=>{run();if(from){from.style.viewTransitionName="";const tg=dir==="fwd"?targetOf(from):null;if(tg)tg.style.viewTransitionName="hvshared"}})}catch{run();return}
  t.finished.catch(()=>{}).finally(()=>{delete root.dataset.vt;document.querySelectorAll('[style*="hvshared"]').forEach(e=>e.style.viewTransitionName="")})};

/* ---------- counters: any element with data-count counts up once when it appears ---------- */
(function(){const app=document.getElementById("app");if(!app)return;const run=()=>{document.querySelectorAll("[data-count]:not([data-ran])").forEach(e=>{e.dataset.ran="1";hvMotion.count(e,+e.dataset.count,e.dataset.of?+e.dataset.of:0)})};new MutationObserver(run).observe(app,{childList:true,subtree:true});run()})();

/* ---------- hover tilt (mouse only, max 6 degrees) ---------- */
if(matchMedia("(hover:hover) and (pointer:fine)").matches&&!reduce()){
  document.addEventListener("pointermove",e=>{const el=e.target.closest&&e.target.closest(".door,.gcard,.qcov,.tile,.acard,.mdoor");if(!el)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty("--ry",(x*12).toFixed(1)+"deg");el.style.setProperty("--rx",(-y*12).toFixed(1)+"deg")},{passive:true});
  document.addEventListener("pointerout",e=>{const el=e.target.closest&&e.target.closest(".door,.gcard,.qcov,.tile,.acard,.mdoor");if(el&&!el.contains(e.relatedTarget)){el.style.removeProperty("--rx");el.style.removeProperty("--ry")}},{passive:true})}

/* ---------- pull to refresh (News and Home) ---------- */
(function(){
  let y0=null,ind=null;
  const ok=()=>/^#(news|home)?$/.test(location.hash)&&scrollY<=0&&!document.body.classList.contains("sheet-open");
  addEventListener("touchstart",e=>{y0=ok()?e.touches[0].clientY:null},{passive:true});
  addEventListener("touchmove",e=>{if(y0===null)return;const dy=e.touches[0].clientY-y0;if(dy>70){if(!ind){ind=document.createElement("div");ind.className="ptr";ind.setAttribute("role","status");ind.innerHTML=(window.hvLumiSvg?`<span style="width:26px;height:26px">${hvLumiSvg("happy",26)}</span>`:"")+"<span>Release to refresh</span>";document.body.appendChild(ind)}ind.classList.add("on")}else if(ind)ind.classList.remove("on")},{passive:true});
  addEventListener("touchend",e=>{if(y0===null)return;const dy=e.changedTouches[0].clientY-y0;y0=null;const was=ind&&ind.classList.contains("on");if(ind){const i=ind;ind=null;i.classList.remove("on");setTimeout(()=>i.remove(),250)}
    if(was&&dy>110){try{navigator.vibrate&&navigator.vibrate(10)}catch{}if(typeof route==="function")route();if(window.toast)toast("Refreshed")}});
})();

/* ---------- swipe a toast away ---------- */
(function(){let y0=null;
  document.addEventListener("touchstart",e=>{const t=e.target.closest&&e.target.closest("#toast");y0=t?e.touches[0].clientY:null},{passive:true});
  document.addEventListener("touchend",e=>{if(y0===null)return;const dy=e.changedTouches[0].clientY-y0;y0=null;if(dy>24){const t=document.getElementById("toast");if(t)t.hidden=true}},{passive:true})})();

/* ---------- long press on a lesson: a quick preview ---------- */
(function(){let timer=0,sx=0,sy=0,fired=false;
  const rowOf=e=>e.target.closest&&e.target.closest('.row[data-go^="l-"]');
  document.addEventListener("pointerdown",e=>{const r=rowOf(e);if(!r||e.pointerType==="mouse")return;fired=false;sx=e.clientX;sy=e.clientY;
    timer=setTimeout(()=>{fired=true;r.classList.add("lp");try{navigator.vibrate&&navigator.vibrate(10)}catch{}
      const m=r.dataset.go.slice(2).match(/^([^-]+)-(.+)$/);if(!m||typeof lessonOf!=="function"||!window.sheet)return;const l=lessonOf(m[1],m[2]),v=typeof lessonVids==="function"?lessonVids(m[1],m[2])[0]:null;if(!l)return;
      sheet(`<h3>${String(l[0]).replace(/[<>&]/g,"")} - ${String(l[1]).replace(/[<>&]/g,"")}</h3>${v?`<img src="https://i.ytimg.com/vi/${v[0]}/hqdefault.jpg" alt="" style="width:100%;border-radius:16px;aspect-ratio:16/9;object-fit:cover">`:""}<div class="btns"><button class="btn gold" data-go="${r.dataset.go}" data-close>Open lesson</button></div>`,"Lesson preview");setTimeout(()=>r.classList.remove("lp"),300)},550)},{passive:true});
  const cancel=()=>{clearTimeout(timer)};
  document.addEventListener("pointermove",e=>{if(timer&&(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10))cancel()},{passive:true});
  document.addEventListener("pointerup",cancel,{passive:true});document.addEventListener("pointercancel",cancel,{passive:true});
  document.addEventListener("click",e=>{if(fired){fired=false;e.preventDefault();e.stopPropagation()}},true);
  document.addEventListener("contextmenu",e=>{if(rowOf(e))e.preventDefault()})})();

/* ---------- skeletons that match each layout ---------- */
window.hvSkeleton=function(kind){
  if(kind==="rows")return `<div class="list">${[1,2,3,4].map(()=>`<div class="sk sk-row"><i></i><div><div class="sk-line"></div><div class="sk-line s"></div></div></div>`).join("")}</div>`;
  if(kind==="text")return `<div>${[100,96,88,100,92,70].map(w=>`<div class="sk sk-line" style="width:${w}%"></div>`).join("")}</div>`;
  return `<div class="grid">${[1,2].map(()=>`<div class="sk sk-card"></div>`).join("")}</div>`};
})();
