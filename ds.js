/* Heavenly Visions: design system helpers. One tiny chart helper (inline SVG, animated, text labels) and a few effects.
   Charts return HTML strings. Wrap them in an element and add the class "go" a moment later to play the entrance. */
(function(){
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const lvlColor=(p,kid)=>p===null||p===undefined?"var(--muted)":p>=80?"var(--good)":p>=50?"var(--mid)":kid?"var(--soft)":"var(--low)";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const hvChart={
  ring(p,o){o=o||{};const size=o.size||160,w=o.w||11,r=50,c=2*Math.PI*r,d=p===null?0:c*p/100,col=o.color||lvlColor(p,o.kid);
    return `<div style="width:${size}px;height:${size}px;position:relative"><svg viewBox="0 0 120 120" style="width:100%;height:100%;transform:rotate(-90deg)" role="img" aria-label="${p===null?"No data":p+" percent"}">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--line)" stroke-width="${w}"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${reduce()?d.toFixed(1):0} 400" data-d="${d.toFixed(1)}" style="transition:stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)"/></svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--display);font-weight:800;font-size:${Math.round(size/4.6)}px;line-height:1;color:${col}">${p===null?"...":p+"%"}${o.label?`<small style="font-family:var(--body);font-size:.78rem;color:var(--muted);margin-top:4px">${esc(o.label)}</small>`:""}</div></div>`},
  bar(list,o){o=o||{};return `<div class="as-bars" style="display:flex;align-items:flex-end;gap:8px;height:${o.h||150}px;padding-top:18px">${list.map(x=>{const p=Math.max(0,Math.min(100,x.v));
    return `<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:.72rem;font-weight:800;gap:3px"><span>${x.v}${o.unit||"%"}</span><div style="width:100%;max-width:38px;flex:1;display:flex;align-items:flex-end"><i style="display:block;width:100%;height:${Math.max(p,3)}%;border-radius:8px 8px 3px 3px;background:${x.color||"var(--gold)"};transform-origin:bottom;animation:${reduce()?"none":"hvgrow .8s cubic-bezier(.2,.8,.2,1) both"}"></i></div><span>${esc(x.l)}</span></div>`}).join("")}</div>`},
  line(series,labels,o){o=o||{};const W=320,H=150,L=30,R=12,T=10,B=24,n=labels.length;if(n<2)return "";
    const x=i=>L+(W-L-R)*i/(n-1),y=v=>T+(H-T-B)*(1-v/100);
    const path=a=>{let s="",pen=false;a.forEach((v,i)=>{if(v===null){pen=false;return}s+=(pen?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)+" ";pen=true});return s};
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="${esc(o.label||"Trend")}">${[0,50,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="2" y="${y(v)+3}" style="fill:var(--muted);font-size:9px;font-weight:700">${v}%</text>`).join("")}
      <text x="${L}" y="${H-6}" style="fill:var(--muted);font-size:9px;font-weight:700">${esc(labels[0])}</text><text x="${W-R}" y="${H-6}" text-anchor="end" style="fill:var(--muted);font-size:9px;font-weight:700">${esc(labels[n-1])}</text>
      ${series.map(s=>`<path d="${path(s.v)}" pathLength="1" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1;stroke-dashoffset:${reduce()?0:1};animation:${reduce()?"none":"hvdraw 1.2s ease forwards"}"/>`).join("")}</svg>`},
  spark(a,o){o=o||{};return `<span style="display:inline-flex;gap:4px;align-items:center" aria-label="Last ${a.length}">${a.map(v=>`<i style="width:10px;height:10px;border-radius:50%;display:block;border:1.5px solid ${v?"var(--gold)":"var(--muted)"};background:${v?"var(--gold)":"transparent"}"></i>`).join("")}</span>`},
  heat(days,o){return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:6px">${days.map(d=>`<span title="${esc(d.l)}" style="aspect-ratio:1;border-radius:10px;display:grid;place-items:center;font-size:.62rem;font-weight:800;border:1.5px solid ${d.on?"var(--gold)":"var(--line)"};background:${d.on?"var(--gold)":"transparent"};color:${d.on?"#2b1d05":"var(--muted)"}">${esc(d.l)}</span>`).join("")}</div>`},
  play(root){if(!root)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{root.classList.add("go");root.querySelectorAll("circle[data-d]").forEach(c=>c.setAttribute("stroke-dasharray",c.dataset.d+" 400"))}))}
};
const st=document.createElement("style");
st.textContent="@keyframes hvgrow{from{transform:scaleY(0)}}@keyframes hvdraw{to{stroke-dashoffset:0}}";
document.head.appendChild(st);

/* small celebration: a few emoji fly out of a point */
const hvFx={
  burst(x,y,emoji,n){if(reduce())return;emoji=emoji||"⭐";n=n||10;
    for(let i=0;i<n;i++){const e=document.createElement("div");e.className="burst";e.textContent=emoji;e.style.left=x+"px";e.style.top=y+"px";document.body.appendChild(e);
      const a=Math.PI*2*i/n+Math.random()*.5,d=50+Math.random()*60;
      e.animate([{transform:"translate(-50%,-50%) scale(.4)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(1.1)`,opacity:0}],{duration:800+Math.random()*300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=()=>e.remove()}},
  fly(from,to,emoji,n){if(reduce()||!from||!to)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();emoji=emoji||"⭐";n=n||6;
    for(let i=0;i<n;i++){const e=document.createElement("div");e.className="burst";e.textContent=emoji;e.style.left=(a.left+a.width/2)+"px";e.style.top=(a.top+a.height/2)+"px";document.body.appendChild(e);
      e.animate([{transform:"translate(-50%,-50%) scale(.6)",opacity:1},{transform:`translate(calc(-50% + ${(b.left-a.left)}px),calc(-50% + ${(b.top-a.top)}px)) scale(1)`,opacity:.2}],{duration:700+i*90,delay:i*70,easing:"cubic-bezier(.5,0,.8,.4)",fill:"both"}).onfinish=()=>e.remove()}}
};
window.hvChart=hvChart;window.hvFx=hvFx;
})();
