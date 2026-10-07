/* Heavenly Visions: layout components (premium upgrade, Phase 3).
   hvHero(title, icon, sub, back, chips)  the section hero header (replaces the plain icon + title row; collapses into a sticky glass bar on scroll)
   hvGate({...})                           the login gate: a Lumi scene, benefits, a preview and big buttons
   hvEmpty(scene, title, text, action)     an empty state with a Lumi scene
   hvScene(prop, mood, size)               Lumi holding a clay prop (key, notes, toolbox, megaphone, jar, crayons...)
   Loaded after design.js and clay2.js. If this file fails, index.html falls back to the old header. */
(function(){
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icn=(ic,px)=>{ /* an emoji or a clay name given by a caller; the swapper turns emojis into icons later */ return window.HV_CLAY&&HV_CLAY[ic]?hvIcon(ic,px):ic};

/* ---------- hero header ---------- */
window.hvHero=function(title,ic,sub,back,chips){
  chips=(chips||[]).filter(Boolean);
  return `<div class="topbar hvbar"><button class="back" data-go="${back||"home"}">← Back</button><span class="hvmini" aria-hidden="true"><i>${icn(ic,28)}</i><b>${title}</b></span></div>
  <section class="hvhero title-row"><div class="hvh-t"><h1>${title}</h1>${sub?`<div class="tag">${sub}</div>`:""}${chips.length?`<div class="hvh-chips">${chips.map(c=>`<span>${c}</span>`).join("")}</div>`:""}</div><span class="hvh-ic" aria-hidden="true">${icn(ic,76)}</span></section>`};
let ticking=false;
addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;document.body.classList.toggle("scrolled",scrollY>110)})},{passive:true});
addEventListener("hashchange",()=>document.body.classList.remove("scrolled"));

/* ---------- scenes: Lumi with a prop ---------- */
window.hvScene=function(prop,mood,size){
  size=size||120;
  return `<div class="hvg-scene" aria-hidden="true"><span class="hvg-glow"></span><span class="hvg-lumi">${window.hvLumiSvg?hvLumiSvg(mood||"happy",size):""}</span>${prop?`<span class="hvg-prop">${icn(prop,Math.round(size*.52))}</span>`:""}</div>`};

/* ---------- login gate ---------- */
const PREVIEWS={
  streak:()=>`<div class="hvg-prev"><div class="pv-days">${["S","M","T","W","T","F","S"].map((d,i)=>`<span class="${i%2||i===0?"on":""}">${d}</span>`).join("")}</div><div class="pv-bar"><i></i></div><div class="pv-row"><b>4 Sundays in a row</b><small>Keep it going!</small></div></div>`,
  chat:()=>`<div class="hvg-prev"><div class="pv-b l">Who is St. Mary?</div><div class="pv-b r">She is the Mother of Jesus. We love her and ask for her prayers.</div></div>`,
  stars:()=>`<div class="hvg-prev"><div class="pv-row"><b>Level 3 Little Lamb</b><small>13 more stars to the next level</small></div><div class="pv-bar"><i></i></div></div>`,
  work:()=>`<div class="hvg-prev"><div class="pv-row"><b>Lesson planner</b><small>One card for each Sunday</small></div><div class="pv-row"><b>Attendance sheet</b><small>Your class at a glance</small></div></div>`
};
window.hvGate=function(o){
  const ben=(o.benefits||[]).map(b=>`<li><span>${icn(b[0],34)}</span><div>${E(b[1])}</div></li>`).join("");
  return `<section class="hvgate${o.calm?" calm":""}">${hvScene(o.scene,o.mood,o.calm?96:124)}<h2>${E(o.title)}</h2>${o.lead?`<p class="hvg-lead">${E(o.lead)}</p>`:""}
   <ul class="hvg-ben">${ben}</ul>${o.preview&&PREVIEWS[o.preview]?PREVIEWS[o.preview]():""}
   ${o.primary?`<button class="btn gold hvg-main" data-go="${o.primary[1]}">${E(o.primary[0])}</button>`:""}${o.secondary?`<button class="btn alt hvg-sec" data-go="${o.secondary[1]}">${E(o.secondary[0])}</button>`:""}
   ${o.note?`<p class="hvg-note">${E(o.note)}</p>`:""}</section>`};

/* ---------- empty state ---------- */
window.hvEmpty=function(prop,title,text,action){
  return `<div class="hvempty">${hvScene(prop,"happy",96)}<b>${E(title)}</b>${text?`<p>${E(text)}</p>`:""}${action?`<button class="btn gold" data-go="${action[1]}">${E(action[0])}</button>`:""}</div>`};

/* ---------- styles ---------- */
const st=document.createElement("style");
st.textContent=`
.hvbar{position:sticky;top:0;z-index:40;margin:0 -16px;padding:8px 16px;min-height:56px;transition:background .2s,box-shadow .2s;align-items:center}
body.scrolled .hvbar{background:var(--glass);-webkit-backdrop-filter:blur(16px) saturate(150%);backdrop-filter:blur(16px) saturate(150%);box-shadow:0 8px 20px -14px rgba(0,0,0,.6);border-bottom:1px solid var(--glass-b)}
.hvmini{display:flex;align-items:center;gap:8px;min-width:0;opacity:0;transform:translateY(6px);transition:opacity .2s,transform .2s;font-family:var(--display);font-weight:700;font-size:1.05rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hvmini i{display:grid;place-items:center;font-style:normal;flex:none}.hvmini b{overflow:hidden;text-overflow:ellipsis}
body.scrolled .hvmini{opacity:1;transform:none}
.hvhero{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:6px 0 16px;padding:16px 14px 16px 18px;min-height:112px;border-radius:26px;overflow:hidden;
  background:radial-gradient(120% 150% at 100% 0%,color-mix(in srgb,var(--accent,#e3b45c) 42%,transparent),transparent 64%),var(--glass);border:1px solid var(--glass-b);box-shadow:var(--sh)}
.hvhero::before{content:"";position:absolute;right:-30px;top:-40px;width:220px;height:220px;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.10) 0 5deg,transparent 5deg 14deg);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 68%);mask-image:radial-gradient(circle,#000 0,transparent 68%);pointer-events:none}
.hvh-t{position:relative;min-width:0;flex:1}.hvh-t h1{font-size:var(--fs-xl);line-height:1.1}.hvh-t .tag{margin-top:4px}
.hvh-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.hvh-chips span{padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid var(--glass-b);font-weight:800;font-size:.78rem}
.hvh-ic{position:relative;flex:none;display:grid;place-items:center;font-size:3rem!important;animation:hvfloat 5.5s ease-in-out infinite}
.hvhero .hve-clay,.hvhero .hvi.clay{width:76px;height:76px}
.hvhero .hve-lumi{width:84px;height:84px}
@media (min-width:900px){.hvhero{min-height:132px;padding:20px 28px}.hvhero .hve-clay,.hvhero .hvi.clay{width:96px;height:96px}}
/* scenes */
.hvg-scene{position:relative;display:grid;place-items:center;width:min(220px,70%);margin:0 auto}
.hvg-glow{position:absolute;inset:-14%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,205,120,.55),transparent)}
.hvg-lumi{position:relative;display:block}
.hvg-prop{position:absolute;right:2%;bottom:0;filter:drop-shadow(0 6px 10px rgba(0,0,0,.4));animation:hvfloat 4.5s ease-in-out infinite}
/* gate */
.hvgate{display:flex;flex-direction:column;gap:12px;align-items:stretch;padding:18px 16px 20px;border-radius:28px;background:var(--glass);border:1px solid var(--glass-b);box-shadow:var(--sh);text-align:center;max-width:560px;margin:8px auto}
.hvgate h2{font-size:var(--fs-xl);margin:2px 0 0;text-align:center}.hvgate h2::after{display:none}.hvg-lead{margin:0;color:var(--muted);font-weight:700}
.hvg-ben{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;text-align:left}
.hvg-ben li{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:16px;background:rgba(255,255,255,.1);border:1px solid var(--glass-b);font-weight:800}
.hvg-ben li span{flex:none;display:grid;place-items:center;width:40px;height:40px}
.hvg-prev{position:relative;padding:12px;border-radius:18px;background:rgba(255,255,255,.08);border:1px dashed var(--glass-b);filter:blur(1.6px) saturate(.9);opacity:.85;pointer-events:none;text-align:left}
.pv-days{display:flex;justify-content:space-between}.pv-days span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);font-weight:900;font-size:.8rem}.pv-days .on{background:var(--gold);color:#2b1d05;border-color:var(--gold)}
.pv-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.18);margin:10px 0 6px;overflow:hidden}.pv-bar i{display:block;width:62%;height:100%;border-radius:8px;background:linear-gradient(90deg,#ffe29a,#e3b45c)}
.pv-row{display:flex;flex-direction:column;margin-top:4px}.pv-row small{color:var(--muted)}
.pv-b{max-width:80%;padding:8px 12px;border-radius:14px;font-weight:700;font-size:.9rem;margin:4px 0}.pv-b.l{background:var(--gold);color:#2b1d05;margin-left:auto}.pv-b.r{background:rgba(255,255,255,.14)}
.hvg-main{min-height:56px;font-size:1.1rem}.hvg-note{margin:0;font-size:.85rem;color:var(--muted)}
.hvgate.calm{box-shadow:none;background:rgba(255,255,255,.06)}.hvgate.calm .hvg-glow{background:radial-gradient(closest-side,rgba(160,190,255,.3),transparent)}
/* empty */
.hvempty{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:22px 16px;border-radius:24px;border:1.5px dashed var(--glass-b);background:rgba(255,255,255,.05)}
.hvempty b{font-size:var(--fs-l);font-family:var(--display)}.hvempty p{margin:0 0 6px;color:var(--muted);font-weight:700;max-width:34ch}
@media (prefers-reduced-motion:reduce){.hvh-ic,.hvg-prop{animation:none!important}}
`;
document.head.appendChild(st);
})();
