/* Heavenly Visions: the opening moment. Light rays, rings of light, rising gold dust, the logo blooming in with a shine and the tagline appearing letter by letter.
   A soft heavenly chime plays with the full intro (made with Web Audio, no file; off if hv_mute is 1). Full intro (about 3.6 s) on the first open of the day, a quick 0.6 s logo fade after that, none with reduced motion. Tap anywhere to skip. */
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
#intro.go .intro-logo{opacity:1;transform:none;transition:none;animation:inlogo 1.8s .2s cubic-bezier(.2,.8,.2,1) both}
@keyframes inlogo{0%{transform:scale(.86)}100%{transform:scale(1)}}
@property --rv{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes inreveal{from{--rv:-18%}to{--rv:112%}}
#intro.go .intro-logo img{-webkit-mask-image:radial-gradient(ellipse 72% 82% at 50% 50%,#000 var(--rv),transparent calc(var(--rv) + 18%));mask-image:radial-gradient(ellipse 72% 82% at 50% 50%,#000 var(--rv),transparent calc(var(--rv) + 18%));animation:inreveal 1.5s .3s cubic-bezier(.35,.55,.25,1) both,inshine 1.3s 1.75s ease-in-out both,inhalo 3.2s 1.9s ease-in-out infinite alternate}
@keyframes inshine{0%,100%{filter:brightness(1)}45%{filter:brightness(1.45)}}
#intro .intro-logo img{filter:none}
.intro-logo::before{content:"";position:absolute;left:50%;top:calc(min(64vmin,300px)*.35);width:min(112vmin,540px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,.55) 0,rgba(255,206,110,.22) 38%,transparent 66%);opacity:0;z-index:-1;pointer-events:none}
#intro.go .intro-logo::before{animation:inglow 1.4s .35s ease-out both,inglow2 3s 1.8s ease-in-out infinite alternate}
@keyframes inglow{from{opacity:0;transform:translate(-50%,-50%) scale(.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes inglow2{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:.75;transform:translate(-50%,-50%) scale(1.06)}}
@keyframes inhalo{from{transform:scale(1)}to{transform:scale(1.025)}}
.intro-logo p span{display:inline-block;opacity:0;transform:translateY(8px);animation:inlet .5s calc(2.1s + var(--i)*22ms) ease-out forwards;white-space:pre}
@keyframes inlet{to{opacity:1;transform:none}}
.in-ring3{position:absolute;left:50%;top:50%;width:46vmin;height:46vmin;margin:-23vmin 0 0 -23vmin;border-radius:50%;border:2px solid rgba(255,236,180,.9);box-shadow:0 0 36px rgba(255,214,130,.7),inset 0 0 26px rgba(255,214,130,.4);opacity:0;animation:inring 1.5s 1.65s cubic-bezier(.1,.7,.3,1) forwards}
.in-star{position:absolute;width:var(--z);height:var(--z);border-radius:50%;background:#fff;box-shadow:0 0 6px 1px rgba(255,236,190,.9);opacity:0;animation:intw var(--t) var(--d) ease-in-out infinite}
@keyframes intw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
.in-spark{position:absolute;width:var(--z);height:var(--z);margin:calc(var(--z)/-2) 0 0 calc(var(--z)/-2);background:radial-gradient(circle,#fff 0,#ffe7a8 35%,rgba(255,215,130,0) 70%);clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);filter:drop-shadow(0 0 5px #ffd98a);opacity:0;animation:insp 1.5s var(--d) ease-in-out both}
@keyframes insp{0%{opacity:0;transform:scale(0) rotate(0)}40%{opacity:1;transform:scale(1.15) rotate(45deg)}100%{opacity:0;transform:scale(.2) rotate(120deg)}}
.in-shoot{position:absolute;left:var(--x);top:var(--y);width:22vmin;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff);transform:rotate(28deg);transform-origin:100% 50%;opacity:0;animation:inshoot .9s var(--d) ease-out both}
@keyframes inshoot{0%{opacity:0;translate:-30vmin -14vmin}20%{opacity:1}100%{opacity:0;translate:24vmin 12vmin}}
.in-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(255,240,200,.85),rgba(255,214,130,.25) 35%,transparent 62%);opacity:0;animation:infl 1.1s 1.7s ease-out both;pointer-events:none}
@keyframes infl{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
#intro.short .in-ring3,#intro.short .in-star,#intro.short .in-spark,#intro.short .in-shoot,#intro.short .in-flash{display:none}
#intro.short.go .intro-logo img{-webkit-mask-image:none;mask-image:none}
@media (prefers-reduced-motion:reduce){.in-ring3,.in-star,.in-spark,.in-shoot,.in-flash{display:none}}

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
  const n=Math.round(Math.min(110,W*H/6000)),ps=Array.from({length:n},()=>({x:W*.5+(Math.random()-.5)*W*.8,y:H*.55+Math.random()*H*.45,r:Math.random()*1.8+.6,v:12+Math.random()*34,p:Math.random()*6.28,s:1+Math.random()*3,d:Math.random()*2.4}));
  const t0=performance.now();let raf=0;
  (function f(t){const e=(t-t0)/1000;cx.clearRect(0,0,W,H);
    for(const p of ps){if(e<p.d)continue;const k=e-p.d,y=p.y-k*p.v,a=Math.max(0,Math.min(1,k*2))*(.45+.55*Math.sin(k*p.s+p.p))*Math.max(0,1-k/2.2);
      cx.globalAlpha=Math.max(0,a);cx.fillStyle="#ffe7a8";cx.shadowColor="#ffd37a";cx.shadowBlur=8;cx.beginPath();cx.arc(p.x+Math.sin(k*1.5+p.p)*8,y,p.r,0,6.283);cx.fill()}
    if(t<until&&document.getElementById("intro"))raf=requestAnimationFrame(f)})(t0)}


/* ---------- heavenly sound, about 6 s, built with Web Audio (no file) ----------
   0 s: a choir-like pad swells in and a filter opens   0.3 to 1.7 s: twinkling bells climb   1.75 s: a big temple bell as the logo lands
   2.2 s: a soft harp arpeggio and a long echo */
function chime(){
  let ac;try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch{return}
  const go=()=>{
    const t0=ac.currentTime+.06;
    const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;
    const out=ac.createGain();out.gain.value=.8;out.connect(comp);comp.connect(ac.destination);
    /* a hall: decaying stereo noise */
    const len=Math.floor(ac.sampleRate*3.6),buf=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2)}
    const rv=ac.createConvolver();rv.buffer=buf;const wet=ac.createGain();wet.gain.value=.7;out.connect(rv);rv.connect(wet);wet.connect(comp);
    const tone=(f,t,dur,vol,type,dest,atk)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type||"sine";o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(atk||.01));g.gain.exponentialRampToValueAtTime(.0006,t+dur);
      o.connect(g);g.connect(dest||out);o.start(t);o.stop(t+dur+.05);return o};
    /* 1. choir pad: detuned triangles through a low-pass that slowly opens */
    const lp=ac.createBiquadFilter();lp.type="lowpass";lp.Q.value=.7;lp.frequency.setValueAtTime(350,t0);lp.frequency.exponentialRampToValueAtTime(2600,t0+1.7);
    const pad=ac.createGain();pad.gain.setValueAtTime(0,t0);pad.gain.linearRampToValueAtTime(.16,t0+1.6);pad.gain.linearRampToValueAtTime(.12,t0+2.6);pad.gain.exponentialRampToValueAtTime(.001,t0+5);
    lp.connect(pad);pad.connect(out);
    for(const f of [73.42,146.83,220,293.66,369.99,440])for(const dt of [-6,0,7]){const o=ac.createOscillator();o.type="triangle";o.frequency.value=f;o.detune.value=dt;
      const g=ac.createGain();g.gain.value=f<150?.5:.28;o.connect(g);g.connect(lp);o.start(t0);o.stop(t0+5.1)}
    /* 2. twinkling bells climbing up a D major pentatonic scale */
    const pent=[587.33,659.25,739.99,880,987.77,1174.66,1318.51,1479.98,1760];
    for(let i=0;i<14;i++){const t=t0+.3+i*.1+Math.random()*.04,f=pent[Math.min(pent.length-1,Math.floor(i*.65)+(i%2))];
      tone(f,t,1.1,.035+i*.003,"sine");tone(f*2.01,t,.5,.012,"sine")}
    /* 3. the big bell at 2.55 s: church-bell partials */
    const tb=t0+1.75;
    for(const [f0,v] of [[293.66,.2],[587.33,.16],[739.99,.09],[880,.1]])
      for(const [m,vv,dec] of [[1,1,4.2],[2.0,.55,3],[2.76,.3,2.2],[5.4,.14,1.4],[8.93,.07,.8]])tone(f0*m,tb,dec,v*vv,"sine",out,.006);
    tone(146.83,tb,3.4,.14,"sine",out,.02);
    /* a shimmer of tiny high bells right after the hit */
    for(let i=0;i<10;i++)tone(pent[(i*3)%pent.length]*2,tb+.05+i*.09,.8,.02,"sine");
    /* 4. harp arpeggio, then a final soft chord */
    [[293.66,0],[369.99,.17],[440,.34],[587.33,.51],[739.99,.68],[880,.85],[1174.66,1.02]].forEach(([f,d])=>{const t=tb+.45+d;tone(f,t,2.2,.07,"triangle");tone(f*2,t,1,.02,"sine")});
    setTimeout(()=>{try{ac.close()}catch{}},9500)};
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
  const r3=document.createElement("div");r3.className="in-ring3";
  const fl=document.createElement("div");fl.className="in-flash";
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const sky=document.createDocumentFragment();
  for(let i=0;i<46;i++){const e=document.createElement("i");e.className="in-star";e.style.cssText=`left:${rnd(2,98)}%;top:${rnd(2,98)}%;--z:${rnd(1.5,3.4).toFixed(1)}px;--t:${rnd(1.6,3.2).toFixed(2)}s;--d:${rnd(0,3).toFixed(2)}s`;sky.appendChild(e)}
  for(let i=0;i<16;i++){const a=rnd(0,6.283),rr=rnd(14,30);const e=document.createElement("i");e.className="in-spark";e.style.cssText=`left:${50+Math.cos(a)*rr*.9}%;top:${46+Math.sin(a)*rr*.62}%;--z:${rnd(12,30).toFixed(0)}px;--d:${(.6+i*.11+rnd(0,.15)).toFixed(2)}s`;sky.appendChild(e)}
  [[.3,.9,.1],[1,.55,.25],[2,.8,.15]].forEach(([d,x,y])=>{const e=document.createElement("i");e.className="in-shoot";e.style.cssText=`--d:${d}s;--x:${x*70}%;--y:${y*100}%`;sky.appendChild(e)});
  intro.prepend(fl);intro.prepend(r3);intro.prepend(sky);

  /* tagline letter by letter */
  const p=end.querySelector("p");if(p){const t=p.textContent;p.innerHTML=[...t].map((c,i)=>`<span style="--i:${i}">${c===" "?" ":c.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>`).join("");p.setAttribute("aria-label",t)}
  if(!first)intro.classList.add("short");
  requestAnimationFrame(()=>requestAnimationFrame(()=>{intro.classList.add("go");end.classList.add("show");if(first){dust(cv,performance.now()+3800);try{if(localStorage.getItem('hv_mute')!=='1')chime()}catch{chime()}}}));
  intro.addEventListener("pointerdown",finish,{once:true});
  setTimeout(finish,first?3600:600)};
})();
