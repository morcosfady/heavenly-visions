/* Heavenly Visions: design system v1, behaviour.
   Builds the sky layers, twinkling stars, section tint, door effects, ripple and parallax.
   Everything here is optional: if this file fails the app still works. */
(function(){
const root=document.documentElement;
const reduce=matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- sky layers ---------- */
const sky=document.createElement("div");
sky.id="sky";sky.setAttribute("aria-hidden","true");
sky.innerHTML='<div class="sk-px"><div class="au au1"></div><div class="au au2"></div><div class="au au3"></div><div class="au au4"></div></div>'
  +'<div class="rays"></div><canvas id="stars"></canvas><div class="sk-px"><div class="clouds"></div></div><div class="grain"></div>';
document.body.prepend(sky);
const [pxA,pxB]=sky.querySelectorAll(".sk-px"),cv=sky.querySelector("#stars"),cx=cv.getContext("2d");

/* ---------- section tint ---------- */
const ACC={media:"#2f8fc0",m:"#2f8fc0",attendance:"#3fae6a",attsheet:"#3fae6a",games:"#e8794a",g:"#e8794a",gplay:"#e8794a",builder:"#e8794a",bnew:"#e8794a",bedit:"#e8794a",bplay:"#e8794a",
  quizzes:"#8e6bd1",kids:"#e86f8a",bedtime:"#4a4fb5",prayers:"#a86fd0",coloring:"#e8584f",calendar:"#2eb5a6",quiz:"#8e6bd1",bible:"#c99a3c",b:"#c99a3c"};
function tint(){const h=location.hash.slice(1)||"home";const k=h.split("-")[0];
  root.dataset.route=k==="home"?"home":"page";root.style.setProperty("--accent",ACC[k]||"#e3b45c")}
addEventListener("hashchange",tint);tint();

/* ---------- stars ---------- */
let stars=[],W=0,H=0,dpr=1,raf=0,last=0;
const starsOn=()=>getComputedStyle(root).getPropertyValue("--stars-op").trim()!=="0";
function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
  const n=Math.max(18,Math.min(110,Math.round(W*H/11000)));
  stars=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H*.85,r:Math.random()*1.2+.3,p:Math.random()*6.28,s:.4+Math.random()*1.2,a:.25+Math.random()*.5,t:Math.random()<.25}))}
function draw(t){cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);cx.fillStyle="#fff7e0";
  for(const s of stars){cx.globalAlpha=s.a*(s.t?.55+.45*Math.sin(t/1000*s.s+s.p):1);cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill()}}
function loop(t){raf=requestAnimationFrame(loop);if(t-last<33)return;last=t;draw(t)}
function startStars(){cancelAnimationFrame(raf);raf=0;
  if(!starsOn()){cx.clearRect(0,0,cv.width,cv.height);return}
  draw(0);if(!reduce.matches&&!document.hidden)raf=requestAnimationFrame(loop)}
size();startStars();
let rt=0;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{size();startStars()},200)});
document.addEventListener("visibilitychange",startStars);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",startStars);
reduce.addEventListener("change",startStars);

/* ---------- parallax on scroll (transform only) ---------- */
let pend=0;
addEventListener("scroll",()=>{if(pend)return;pend=1;requestAnimationFrame(()=>{pend=0;const y=scrollY;
  pxA.style.transform="translate3d(0,"+(-y*.04)+"px,0)";pxB.style.transform="translate3d(0,"+(-y*.08)+"px,0)";cv.style.transform="translate3d(0,"+(-y*.02)+"px,0)"})},{passive:true});

/* ---------- one door shines at a time ---------- */
setInterval(()=>{if(document.hidden||reduce.matches)return;const ds=document.querySelectorAll(".door");if(!ds.length)return;
  const d=ds[Math.random()*ds.length|0];d.classList.remove("shine");void d.offsetWidth;d.classList.add("shine")},3500);

/* ---------- tilt (mouse only) ---------- */
if(matchMedia("(hover: hover) and (pointer: fine)").matches){
  let cur=null;
  const reset=d=>{if(!d)return;d.style.removeProperty("--rx");d.style.removeProperty("--ry");d.style.removeProperty("--mx");d.style.removeProperty("--my")};
  document.addEventListener("pointermove",e=>{if(reduce.matches)return;const d=e.target.closest&&e.target.closest(".door");
    if(cur&&cur!==d)reset(cur);cur=d;if(!d)return;
    const r=d.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    d.style.setProperty("--ry",((x-.5)*12).toFixed(2)+"deg");d.style.setProperty("--rx",((.5-y)*12).toFixed(2)+"deg");
    d.style.setProperty("--mx",(x*100).toFixed(0)+"%");d.style.setProperty("--my",(y*100).toFixed(0)+"%")});
  document.addEventListener("pointerleave",()=>{reset(cur);cur=null},true);
}

/* ---------- tap ripple ---------- */
document.addEventListener("pointerdown",e=>{if(reduce.matches)return;
  const el=e.target.closest&&e.target.closest(".door,.tile,.btn,.row,.bk,.ch,.opt,.kopt,.back,.mini");
  if(!el||el.disabled)return;
  const r=el.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement("span");
  s.className="ripple";s.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
  el.appendChild(s);setTimeout(()=>s.remove(),600)},{passive:true});
})();
