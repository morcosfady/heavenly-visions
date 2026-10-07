/* Heavenly Visions: the opening moment. A short heavenly chime (made live with the Web Audio API, no sound file, no cost),
   rotating light rays, rising gold dust, a ring of light, the logo blooming in, a shine across it and the tagline appearing letter by letter.
   Tap anywhere to skip. The chime can be switched off in Me, Account (localStorage hv_sound = "off").
   Browsers may block sound until the first tap; then the intro is simply silent. */
(function(){
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const soundOn=()=>{try{return localStorage.getItem("hv_sound")!=="off"}catch{return true}};

/* ---------- the chime: soft bells climbing in G major, a little shimmer, a warm pad underneath (about 1.8 s) ---------- */
function chime(){
  if(!soundOn())return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  let ctx;try{ctx=new AC()}catch{return}
  const go=()=>{
    const t0=ctx.currentTime+.05,master=ctx.createGain();master.gain.value=.16;
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=5200;master.connect(lp);lp.connect(ctx.destination);
    const bell=(f,t,dur,vol)=>{
      [[1,1],[2.01,.35],[3.97,.12]].forEach(([m,v])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=f*m;
        g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(vol*v,t0+t+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+t+dur);
        o.connect(g);g.connect(master);o.start(t0+t);o.stop(t0+t+dur+.05)})};
    [[784,0],[988,.09],[1175,.18],[1568,.3]].forEach(([f,t],i)=>bell(f,t,1.15-i*.08,.9));
    bell(2349,.46,.7,.35);bell(3136,.54,.6,.22);bell(3951,.62,.5,.14);
    [392,587].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.value=f*(i?1.003:.997);
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.22,t0+.5);g.gain.linearRampToValueAtTime(0,t0+1.9);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+2)});
    setTimeout(()=>{try{ctx.close()}catch{}},2600)};
  if(ctx.state==="running")go();
  else{ctx.resume().then(()=>{if(ctx.state==="running")go()}).catch(()=>{});
    /* blocked: wait for the first tap, but only while the intro is still on screen */
    const once=()=>{removeEventListener("pointerdown",once,true);if(document.getElementById("intro"))ctx.resume().then(go).catch(()=>{})};
    addEventListener("pointerdown",once,true)}}
window.hvChime=chime;

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
#intro{z-index:3000}
.in-rays{position:absolute;left:50%;top:50%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,215,130,.20) 0 4deg,transparent 4deg 14deg);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 45%);mask-image:radial-gradient(circle,#000 0,transparent 45%);opacity:0;animation:inrays 3s ease-out forwards,inspin 22s linear infinite}
@keyframes inrays{to{opacity:1}}@keyframes inspin{to{rotate:360deg}}
.in-ring,.in-ring2{position:absolute;left:50%;top:50%;width:46vmin;height:46vmin;margin:-23vmin 0 0 -23vmin;border-radius:50%;border:2px solid rgba(255,228,160,.85);box-shadow:0 0 30px rgba(255,210,120,.6),inset 0 0 24px rgba(255,210,120,.35);opacity:0;animation:inring 1.5s .3s cubic-bezier(.1,.7,.3,1) forwards}
.in-ring2{animation-delay:.55s;border-width:1px}
@keyframes inring{0%{transform:scale(.3);opacity:.95}100%{transform:scale(2.4);opacity:0}}
.in-dust{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#intro.go .intro-logo{opacity:1;transform:none;transition:none;animation:inlogo 1.05s .12s cubic-bezier(.2,.9,.2,1) both}
@keyframes inlogo{0%{opacity:0;transform:scale(.55);filter:blur(10px)}60%{opacity:1;filter:blur(0)}80%{transform:scale(1.05)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
#intro.go .intro-logo img{animation:inshine 1.3s .75s ease-in-out both,inhalo 3s .2s ease-in-out infinite alternate}
@keyframes inshine{0%,100%{filter:drop-shadow(0 0 28px rgba(255,220,140,.85)) brightness(1)}45%{filter:drop-shadow(0 0 46px rgba(255,240,190,1)) brightness(1.55)}}
@keyframes inhalo{from{transform:scale(1)}to{transform:scale(1.025)}}
.intro-logo p span{display:inline-block;opacity:0;transform:translateY(8px);animation:inlet .5s calc(1s + var(--i)*32ms) ease-out forwards;white-space:pre}
@keyframes inlet{to{opacity:1;transform:none}}
#intro.out{animation:inout .7s ease-in forwards}
@keyframes inout{0%{opacity:1;transform:scale(1);filter:brightness(1)}35%{filter:brightness(1.6)}100%{opacity:0;transform:scale(1.12);filter:brightness(1.2)}}
@media (prefers-reduced-motion:reduce){.in-rays,.in-ring,.in-ring2,.in-dust{display:none}#intro.go .intro-logo,#intro.go .intro-logo img{animation:none!important;opacity:1}.intro-logo p span{animation:none;opacity:1;transform:none}#intro.out{animation:inout2 .4s forwards}@keyframes inout2{to{opacity:0}}}
`;
document.head.appendChild(st);

/* ---------- gold dust ---------- */
function dust(cv,until){
  const cx=cv.getContext("2d"),dpr=Math.min(devicePixelRatio||1,2),W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.scale(dpr,dpr);
  const n=Math.round(Math.min(70,W*H/9000)),ps=Array.from({length:n},()=>({x:W*.5+(Math.random()-.5)*W*.8,y:H*.55+Math.random()*H*.45,r:Math.random()*1.8+.6,v:12+Math.random()*34,p:Math.random()*6.28,s:1+Math.random()*3,d:Math.random()*.9}));
  const t0=performance.now();let raf=0;
  (function f(t){const e=(t-t0)/1000;cx.clearRect(0,0,W,H);
    for(const p of ps){if(e<p.d)continue;const k=e-p.d,y=p.y-k*p.v,a=Math.max(0,Math.min(1,k*2))*(.45+.55*Math.sin(k*p.s+p.p))*Math.max(0,1-k/2.2);
      cx.globalAlpha=Math.max(0,a);cx.fillStyle="#ffe7a8";cx.shadowColor="#ffd37a";cx.shadowBlur=8;cx.beginPath();cx.arc(p.x+Math.sin(k*1.5+p.p)*8,y,p.r,0,6.283);cx.fill()}
    if(t<until&&document.getElementById("intro"))raf=requestAnimationFrame(f)})(t0)}

/* ---------- the intro ---------- */
window.hvIntro=function(intro,end){
  let done=false;
  const finish=()=>{if(done)return;done=true;intro.classList.add("out");setTimeout(()=>intro.remove(),reduce?420:720)};
  /* layers */
  const rays=document.createElement("div");rays.className="in-rays";
  const r1=document.createElement("div");r1.className="in-ring";const r2=document.createElement("div");r2.className="in-ring2";
  const cv=document.createElement("canvas");cv.className="in-dust";
  intro.prepend(cv);intro.prepend(r2);intro.prepend(r1);intro.prepend(rays);
  /* tagline letter by letter */
  const p=end.querySelector("p");if(p){const t=p.textContent;p.innerHTML=[...t].map((c,i)=>`<span style="--i:${i}">${c===" "?" ":c.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>`).join("");p.setAttribute("aria-label",t)}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{intro.classList.add("go");end.classList.add("show");if(!reduce)dust(cv,performance.now()+2600)}));
  chime();
  intro.addEventListener("pointerdown",finish,{once:true});
  setTimeout(finish,reduce?1200:2500)};
})();
