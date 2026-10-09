/* Heavenly Visions: the opening moment. Light rays, rings of light, rising gold dust, the logo blooming in with a shine and the tagline appearing letter by letter.
   A soft heavenly chime plays with the full intro (made with Web Audio, no file; off if hv_mute is 1). Full intro (max 2.5 s) on the first open of the day, a quick 0.6 s logo fade after that, none with reduced motion. Tap anywhere to skip. */
(function(){
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

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
.intro-logo p span{display:inline-block;opacity:0;transform:translateY(8px);animation:inlet .5s calc(.8s + var(--i)*20ms) ease-out forwards;white-space:pre}
@keyframes inlet{to{opacity:1;transform:none}}
@property --hvr{syntax:'<percentage>';inherits:false;initial-value:0%}
#intro.out{pointer-events:none;-webkit-mask-image:radial-gradient(circle at 50% 46%,transparent var(--hvr),#000 calc(var(--hvr) + 22%));mask-image:radial-gradient(circle at 50% 46%,transparent var(--hvr),#000 calc(var(--hvr) + 22%));animation:inbloom 1s cubic-bezier(.45,0,.2,1) forwards}
@keyframes inbloom{from{--hvr:0%}to{--hvr:125%}}
#intro.out .intro-logo{animation:inlogoout .8s cubic-bezier(.5,0,.8,.4) forwards}
@keyframes inlogoout{0%{opacity:1;transform:scale(1);filter:brightness(1)}35%{filter:brightness(1.5)}100%{opacity:0;transform:scale(1.35) translateY(-4vh);filter:brightness(1.4) blur(3px)}}
body.hv-enter #app>*{animation:hvrise .75s cubic-bezier(.2,.8,.2,1) both}
body.hv-enter #app .doors>*{animation:hvrise .7s cubic-bezier(.2,.8,.2,1) both}
body.hv-enter #app .doors>*:nth-child(1){animation-delay:.18s}body.hv-enter #app .doors>*:nth-child(2){animation-delay:.27s}body.hv-enter #app .doors>*:nth-child(3){animation-delay:.36s}body.hv-enter #app .doors>*:nth-child(4){animation-delay:.45s}body.hv-enter #app .doors>*:nth-child(n+5){animation-delay:.54s}
body.hv-enter #tabbar,body.hv-enter .lm-fab{animation:hvrise .7s .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes hvrise{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}
#intro.short .in-rays,#intro.short .in-ring,#intro.short .in-ring2,#intro.short .in-dust{display:none}#intro.short.go .intro-logo{animation:inshort .3s ease-out both}#intro.short .intro-logo p span{animation:none;opacity:1;transform:none}#intro.short.go .intro-logo img{animation:none}#intro.short.out{animation:inout2 .35s forwards;-webkit-mask-image:none;mask-image:none}
@keyframes inshort{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
@keyframes inout2{to{opacity:0}}
@media (prefers-reduced-motion:reduce){.in-rays,.in-ring,.in-ring2,.in-dust{display:none}#intro.go .intro-logo,#intro.go .intro-logo img{animation:none!important;opacity:1}.intro-logo p span{animation:none;opacity:1;transform:none}#intro.out{animation:inout2 .4s forwards;-webkit-mask-image:none;mask-image:none}}
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


/* ---------- heavenly sound: a soft harp-and-bell chord made with Web Audio (no file) ---------- */
function chime(){
  let ac;try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch{return}
  const go=()=>{
    const t0=ac.currentTime+.05,out=ac.createGain();out.gain.value=.55;
    /* a small hall: decaying noise as the reverb */
    const len=ac.sampleRate*2.4,buf=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    const rv=ac.createConvolver();rv.buffer=buf;const wet=ac.createGain();wet.gain.value=.55;out.connect(ac.destination);out.connect(rv);rv.connect(wet);wet.connect(ac.destination);
    /* rising D major arpeggio, then a warm pad under it */
    const notes=[[293.66,0],[369.99,.18],[440,.36],[587.33,.54],[739.99,.78],[880,1.02]];
    for(const [f,d] of notes){
      for(const [m,v,dec] of [[1,.22,1.9],[2,.07,1.1],[3.01,.025,.6]]){
        const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=f*m;
        g.gain.setValueAtTime(0,t0+d);g.gain.linearRampToValueAtTime(v,t0+d+.012);g.gain.exponentialRampToValueAtTime(.0008,t0+d+dec);
        o.connect(g);g.connect(out);o.start(t0+d);o.stop(t0+d+dec+.05)}}
    for(const f of [146.83,220,293.66]){
      const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=f;
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.06,t0+.9);g.gain.linearRampToValueAtTime(0,t0+2.6);
      o.connect(g);g.connect(out);o.start(t0);o.stop(t0+2.7)}
    setTimeout(()=>{try{ac.close()}catch{}},4200)};
  /* browsers keep sound off until the person touches the page, so wait for the first touch if needed */
  if(ac.state==="running"){go();return}
  ac.resume().then(()=>{if(ac.state==="running")go();else wait()}).catch(wait);
  function wait(){const h=()=>{removeEventListener("pointerdown",h,true);removeEventListener("keydown",h,true);ac.resume().then(go).catch(()=>{})};addEventListener("pointerdown",h,true);addEventListener("keydown",h,true)}
}

/* ---------- the intro ---------- */
window.hvIntro=function(intro,end){
  if(reduce){intro.remove();return}
  const day=new Date().toDateString();let first=true;try{first=localStorage.getItem("hv_intro_day")!==day;localStorage.setItem("hv_intro_day",day)}catch{}
  let done=false;
  const finish=()=>{if(done)return;done=true;intro.classList.add("out");if(first){document.body.classList.add("hv-enter");setTimeout(()=>document.body.classList.remove("hv-enter"),1800)}setTimeout(()=>intro.remove(),first?1000:360)};
  /* layers */
  const rays=document.createElement("div");rays.className="in-rays";
  const r1=document.createElement("div");r1.className="in-ring";const r2=document.createElement("div");r2.className="in-ring2";
  const cv=document.createElement("canvas");cv.className="in-dust";
  intro.prepend(cv);intro.prepend(r2);intro.prepend(r1);intro.prepend(rays);
  /* tagline letter by letter */
  const p=end.querySelector("p");if(p){const t=p.textContent;p.innerHTML=[...t].map((c,i)=>`<span style="--i:${i}">${c===" "?" ":c.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>`).join("");p.setAttribute("aria-label",t)}
  if(!first)intro.classList.add("short");
  requestAnimationFrame(()=>requestAnimationFrame(()=>{intro.classList.add("go");end.classList.add("show");if(first){dust(cv,performance.now()+2600);try{if(localStorage.getItem('hv_mute')!=='1')chime()}catch{chime()}}}));
  intro.addEventListener("pointerdown",finish,{once:true});
  setTimeout(finish,first?1650:600)};
})();
