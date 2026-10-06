/* Heavenly Visions: Attendance Sheet.
   Students see only their own history. Servants see themselves and the kids of their own class.
   Coordinators see their grade, priests see every grade of their church. The server decides who gets what,
   this file only draws what comes back. */
(function(){
const st=document.createElement("style");
st.textContent=`
:root{--as-good:#2c9c5a;--as-mid:#c98a1f;--as-low:#d4604b;--as-soft:#4a8fd8;--as-na:#9a98a8}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--as-good:#5fd08f;--as-mid:#f0b84f;--as-low:#ff8a70;--as-soft:#7cc4ea;--as-na:#8a89a0}}
:root[data-theme=dark]{--as-good:#5fd08f;--as-mid:#f0b84f;--as-low:#ff8a70;--as-soft:#7cc4ea;--as-na:#8a89a0}
.as-grid{display:grid;gap:14px}
@media (min-width:900px){.as-grid{grid-template-columns:1fr 1fr;align-items:start}.as-span{grid-column:1/-1}}
.as-card{display:flex;flex-direction:column;gap:12px}
.as-card h2{font-size:1.1rem}
.as-ringbox{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.as-ring{width:190px;height:190px;position:relative}
.as-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.as-ring-bg{fill:none;stroke:var(--line);stroke-width:11}
.as-ring-fg{fill:none;stroke-width:11;stroke-linecap:round;stroke-dasharray:0 400;transition:stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)}
.go .as-ring-fg{stroke-dasharray:var(--d) 400}
.as-ring-t{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--display);font-size:2.6rem;font-weight:800;line-height:1}
.as-ring-t small{font-family:var(--body,inherit);font-size:.78rem;font-weight:800;color:var(--muted);margin-top:4px}
.as-say{font-weight:800;font-size:1.05rem;max-width:30ch}
.as-good{color:var(--as-good)}.as-mid{color:var(--as-mid)}.as-low{color:var(--as-low)}.as-soft{color:var(--as-soft)}.as-na{color:var(--as-na)}
.as-counts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}
.as-counts div{background:var(--gold-soft);border-radius:14px;padding:10px 4px;font-weight:800;font-size:.8rem;color:var(--ink)}
.as-counts b{display:block;font-size:1.5rem;font-family:var(--display)}
.as-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.as-stat{background:var(--gold-soft);border-radius:16px;padding:12px;text-align:center;font-weight:800;color:var(--ink);font-size:.82rem}
.as-stat b{display:block;font-size:1.6rem;font-family:var(--display);line-height:1.1}
.as-stat small{display:block;color:var(--muted);font-weight:700;margin-top:2px}
.as-cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:6px}
.as-cal button,.as-cal span{aspect-ratio:1;border-radius:12px;border:1.5px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:.64rem;font-weight:800;color:var(--ink);background:transparent;padding:0;line-height:1.1}
.as-cal .p{background:var(--gold);border-color:var(--gold);color:#2b1d05}
.as-cal .m{background:color-mix(in srgb,var(--as-na) 22%,transparent);border-color:transparent;color:var(--muted)}
.as-cal .n{background:color-mix(in srgb,var(--sky) 20%,transparent);border-color:transparent}
.as-cal .f{border-style:dashed;color:var(--muted);opacity:.7}
.as-cal i{font-style:normal;font-size:1rem}
.as-leg{display:flex;flex-wrap:wrap;gap:10px;font-size:.75rem;font-weight:800;color:var(--muted)}
.as-bars{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:18px}
.as-col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:.7rem;font-weight:800;gap:3px}
.as-col .bx{width:100%;max-width:38px;flex:1;display:flex;align-items:flex-end}
.as-col i{display:block;width:100%;border-radius:8px 8px 3px 3px;background:var(--gold);transform-origin:bottom;animation:asgrow .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes asgrow{from{transform:scaleY(0)}}
.as-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.as-badge{background:var(--gold-soft);border-radius:16px;padding:10px 6px;text-align:center;font-weight:800;font-size:.74rem;color:var(--ink)}
.as-badge i{display:block;font-style:normal;font-size:1.8rem}
.as-badge small{display:block;color:var(--muted);font-weight:700;font-size:.66rem}
.as-badge.lock{opacity:.5;filter:grayscale(1)}
.as-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.as-tabs button,.as-chips button{padding:10px 8px;border-radius:14px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:800;font-size:.9rem}
.as-tabs button[aria-pressed=true],.as-chips button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft)}
.as-chips{display:flex;flex-wrap:wrap;gap:6px}
.as-chips button{padding:7px 12px;font-size:.82rem}
.as-sum{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.as-sum>:last-child:nth-child(odd){grid-column:1/-1}.as-sum.k3{grid-template-columns:repeat(3,1fr)}.as-sum.k3 .as-stat{padding:10px 4px;font-size:.74rem}.as-sum.k3 .as-stat b{font-size:1.35rem}
@media (min-width:600px){.as-sum.k6{grid-template-columns:repeat(5,1fr)}.as-sum.k6>:last-child:nth-child(odd){grid-column:auto}}
.as-list{display:flex;flex-direction:column;gap:8px}
.as-row{display:grid;grid-template-columns:30px 40px 1fr auto;gap:10px;align-items:center;text-align:left;width:100%;border:1px solid var(--glass-b,var(--line));background:var(--glass,var(--surface));border-radius:16px;padding:10px;color:var(--ink);font:inherit}
.as-rk{font-weight:900;text-align:center;font-size:1.1rem;color:var(--muted)}
.as-av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:.85rem;background:linear-gradient(135deg,var(--sky),var(--gold));color:#fff}
.as-nm{min-width:0;display:flex;flex-direction:column;gap:3px}
.as-nm b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.as-nm small{color:var(--muted);font-weight:700;font-size:.74rem}
.as-bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden}
.as-bar i{display:block;height:100%;border-radius:99px;width:0;transition:width .9s cubic-bezier(.2,.8,.2,1)}
.go .as-bar i{width:var(--w)}
.as-pc{font-weight:900;font-size:1.05rem;text-align:right;min-width:48px}
.as-pc small{display:block;font-size:.72rem;color:var(--muted)}
.as-sp{grid-column:3/5;display:flex;gap:4px;align-items:center}
.as-sp i{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--as-na);display:block}
.as-sp i.on{background:var(--gold);border-color:var(--gold)}
.as-sp small{margin-left:4px;color:var(--muted);font-weight:700;font-size:.7rem}
.as-fu{display:flex;justify-content:space-between;gap:8px;align-items:center;width:100%;text-align:left;padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:800}
.as-fu small{display:block;color:var(--muted);font-weight:700}
.as-search{border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:11px 14px;width:100%;font:inherit}
.as-skel{border-radius:20px;background:linear-gradient(90deg,var(--line),transparent,var(--line));background-size:200% 100%;animation:asshim 1.4s linear infinite;opacity:.6}
@keyframes asshim{to{background-position:-200% 0}}
.as-hb{display:flex;align-items:center;gap:8px;font-weight:800}
.as-cb{display:flex;align-items:center;gap:8px;font-size:.84rem;font-weight:700;width:100%;background:none;border:0;padding:5px 0;color:var(--ink);font-family:inherit;text-align:left}
.as-cb .lb{width:92px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.as-cb .as-bar{flex:1;height:14px}
.as-cb b{width:44px;text-align:right}
.as-line{width:100%;height:auto}
.as-line .ln{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.go .as-line .ln{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s ease}
.as-line text{fill:var(--muted);font-size:9px;font-weight:700}
.as-trendbox{display:flex;gap:8px;flex-wrap:wrap}
.as-sel{border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:8px 10px;font:inherit;font-weight:700}
.as-hist{display:flex;flex-direction:column}
.as-hist div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-weight:700;font-size:.9rem}
@media (prefers-reduced-motion:reduce){.as-ring-fg{transition:none;stroke-dasharray:var(--d) 400}.as-bar i{transition:none;width:var(--w)}.as-col i{animation:none}.as-line .ln{stroke-dashoffset:0;transition:none}.as-skel{animation:none}}
`;
document.head.appendChild(st);

const A=()=>window.hvAcct&&hvAcct();
const API=()=>{try{const q=new URLSearchParams(location.search).get("api");if(q&&location.hostname==="localhost")return q}catch{}return window.GAMES_URL};
async function call(body){const a=A();const r=await fetch(API(),{method:"POST",body:JSON.stringify(Object.assign({id:a.user.id,token:a.token},body))});return r.json()}
const RANGES=[["all","All time"],["year","This school year"],["3m","Last 3 months"],["month","This month"]];
const S={tab:"my",range:"all",filter:"all",q:"",lv:"all",cls:"all"};
const pretty=d=>{const a=d.split("-");return new Date(+a[0],+a[1]-1,+a[2]).toLocaleDateString("en-US",{month:"short",day:"numeric"})};
const prettyLong=d=>{const a=d.split("-");return new Date(+a[0],+a[1]-1,+a[2]).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})};
const mon=m=>new Date(+m.slice(0,4),+m.slice(5,7)-1,1).toLocaleDateString("en-US",{month:"short"});
const ini=n=>String(n).trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
const lvl=(p,kid)=>p===null||p===undefined?"na":p>=80?"good":p>=50?"mid":kid?"soft":"low";
const lvName=l=>({good:"Great",mid:"Growing",low:"Needs a visit",soft:"Keep going",na:"Not enough data yet"}[l]);
const COL=l=>`var(--as-${l})`;
const medal=i=>["🥇","🥈","🥉"][i]||"";

function ring(p,kid,sub){
  const l=lvl(p,kid),c=2*Math.PI*52,d=p===null?0:c*p/100;
  return `<div class="as-ring"><svg viewBox="0 0 120 120" role="img" aria-label="${p===null?"Not enough data yet":p+" percent attendance"}"><circle class="as-ring-bg" cx="60" cy="60" r="52"/><circle class="as-ring-fg" cx="60" cy="60" r="52" style="--d:${d.toFixed(1)};stroke:${COL(l)}"/></svg>
  <div class="as-ring-t ${"as-"+l}">${p===null?"…":p+"%"}<small>${sub||lvName(l)}</small></div></div>`}

function cal(days,today){
  if(!days.length)return `<div class="empty">No Sunday School days yet. See you Sunday! 🙏</div>`;
  const cells=days.map(c=>{const t=c.s==="p"?`Present, checked in at ${c.t}`:c.s==="m"?"Not here this day":"No Sunday School";
    return `<button class="${c.s}" data-day="${c.d}" data-t="${esc(t)}" aria-label="${prettyLong(c.d)}. ${t}"><i>${c.s==="p"?"✅":c.s==="n"?"🎉":""}</i>${pretty(c.d)}</button>`}).join("");
  const nx=new Date(today+"T12:00:00");nx.setDate(nx.getDate()+(7-nx.getDay())%7||7);
  const f=[0,1].map(k=>{const d=new Date(nx);d.setDate(d.getDate()+7*k);return `<span class="f" aria-hidden="true">${d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>`}).join("");
  return `<div class="as-cal">${cells}${f}</div><div class="as-leg"><span>✅ Here</span><span>⬜ Not here</span><span>🎉 No Sunday School</span><span>Dashed: coming up</span></div>`}

function monthly(list,kid){
  if(!list.length)return `<div class="empty">Your months will show here.</div>`;
  return `<div class="as-bars" role="img" aria-label="Attendance by month">${list.map(m=>{const p=Math.round(m.p*100/m.n),l=lvl(p,kid);
    return `<div class="as-col"><span>${p}%</span><div class="bx"><i style="height:${Math.max(p,3)}%;background:${COL(l==="na"?"mid":l)}"></i></div><span>${mon(m.m)}</span><span style="color:var(--muted);font-weight:700">${m.p}/${m.n}</span></div>`}).join("")}</div>`}

function badges(list){return `<div class="as-badges">${list.map(b=>`<div class="as-badge ${b.got?"":"lock"}"><i>${b.ic}</i>${esc(b.name)}<small>${b.got?"Earned":esc(b.how)}</small></div>`).join("")}</div>`}

function spark(a){return `<span class="as-sp" aria-label="Last ${a.length} Sundays">${a.map(x=>`<i class="${x?"on":""}"></i>`).join("")}<small>last ${a.length}</small></span>`}

function say(me,adult){
  if(!me.sessions)return adult?"No check-ins yet. See you Sunday! 🙏":"No check-ins yet. See you Sunday! 🙏";
  if(me.pct===null)return "Not enough data yet. Come again this Sunday! 🌱";
  const w=`${me.present} of ${me.sessions} Sundays`;
  if(adult)return me.pct>=80?`Thank you for serving faithfully. ${w} so far.`:me.pct>=50?`${w} so far. Every Sunday counts.`:`${w} so far. We would love to see you this Sunday.`;
  return me.pct>=90?`Amazing! You came ${w}! 🌟`:me.pct>=80?`Great job! You came ${w}! 🎉`:me.pct>=50?`Good going! You came ${w}. Keep it up 💛`:`We miss you! Come join us this Sunday 🙏`}

function myView(d,adult){
  const m=d.me,kid=!adult;
  return `<div class="as-grid">
   <section class="card as-card as-ringbox">${ring(m.pct,kid)}<div class="as-say">${say(m,adult)}</div>
    <div class="as-counts"><div><b>${m.present}</b>${adult?"Present":"Sundays attended"}</div><div><b>${m.missed}</b>${adult?"Missed":"Sundays missed"}</div><div><b>${m.sessions}</b>${adult?"Sessions":"Sundays since joining"}</div></div></section>
   <section class="card as-card"><h2>🔥 Streak</h2><div class="as-two"><div class="as-stat"><b>${m.streak}</b>Current streak<small>Sundays in a row</small></div><div class="as-stat"><b>${m.best}</b>Best streak<small>Sundays in a row</small></div></div></section>
   <section class="card as-card as-span"><h2>📅 ${adult?"Sunday calendar":"My Sundays"}</h2>${cal(m.cal,d.today)}<div class="tag" id="as-daymsg" role="status">Tap a day to see the time.</div></section>
   <section class="card as-card"><h2>📊 By month</h2>${monthly(m.monthly,kid)}</section>
   <section class="card as-card"><h2>🏅 Badges</h2>${badges(m.badges)}</section></div>`}

function classView(d,opts){
  opts=opts||{};
  const rows=d.rows,s=d.summary;
  const tr=s.trend===null?"Not enough data yet":s.trend>0?`▲ ${s.trend} points vs last month`:s.trend<0?`▼ ${-s.trend} points vs last month`:"Same as last month";
  const lv=lvl(s.avg,false);
  return `<div class="as-grid">
   <div class="as-sum as-span k3"><div class="as-stat"><b class="as-${lv}">${s.avg===null?"…":s.avg+"%"}</b>Class average</div><div class="as-stat"><b>${s.kids}</b>Kids</div><div class="as-stat"><b>${s.presentLast}</b>Here ${s.lastDay?pretty(s.lastDay):"last Sunday"}<small>of ${s.kids}</small></div></div>
   <div class="card as-span" style="text-align:center;font-weight:800">${tr}</div>
   ${d.followup.length?`<section class="card as-card as-span"><h2>💛 Needs a follow up</h2><div class="as-list">${d.followup.map(r=>`<button class="as-fu" data-pid="${r.id}"><span>${esc(r.name)}<small>${r.fu==="missed3"?"Hasn't come for 3 Sundays":"Under 50% so far"}</small></span><span>›</span></button>`).join("")}</div></section>`:""}
   <section class="card as-card as-span"><h2>🏆 ${esc(d.grade||"Class")} ranking</h2>
    <input class="as-search" id="as-q" type="search" placeholder="Search a name" value="${esc(S.q)}" aria-label="Search a name">
    <div class="as-chips" id="as-chips">${[["all","All"],["good","🟢 80%+"],["mid","🟡 50 to 79%"],["low","🔴 Under 50%"]].map(c=>`<button data-f="${c[0]}" aria-pressed="${S.filter===c[0]}">${c[1]}</button>`).join("")}</div>
    <div class="as-list" id="as-rows"></div></section></div>`}

function rowsHtml(rows,showClass){
  const q=S.q.trim().toLowerCase();
  const list=rows.filter(r=>(!q||r.name.toLowerCase().includes(q))&&(S.filter==="all"||(S.filter==="good"?r.pct!==null&&r.pct>=80:S.filter==="mid"?r.pct!==null&&r.pct>=50&&r.pct<80:r.pct!==null&&r.pct<50)));
  if(!rows.length)return `<div class="empty">No check-ins yet. See you Sunday! 🙏</div>`;
  if(!list.length)return `<div class="empty">Nobody matches. Try another filter.</div>`;
  return list.map(r=>{const i=rows.indexOf(r),l=lvl(r.pct,false);
    return `<button class="as-row" data-pid="${r.id}"><span class="as-rk">${medal(i)||i+1}</span><span class="as-av" aria-hidden="true">${esc(ini(r.name))}</span>
     <span class="as-nm"><b>${esc(r.name)}</b><span class="as-bar"><i class="" style="--w:${r.pct||0}%;background:${COL(l==="na"?"mid":l)}"></i></span><small>${r.last?"Last here "+pretty(r.last):"Not here yet"}${showClass?" · "+esc(r.grade):""}</small></span>
     <span class="as-pc as-${l}">${r.pct===null?"…":r.pct+"%"}<small>🔥 ${r.streak}</small></span>${spark(r.spark)}</button>`}).join("")}

function wire(root,rows,showClass){
  const box=root.querySelector("#as-rows");if(!box)return;
  const draw=()=>{box.innerHTML=rowsHtml(rows,showClass);go()};
  const go=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add("go")));
  draw();
  root.querySelector("#as-q")?.addEventListener("input",e=>{S.q=e.target.value;draw()});
  root.querySelector("#as-chips")?.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;S.filter=b.dataset.f;
    root.querySelectorAll("#as-chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()})}

function trendChart(w){
  if(w.length<2)return `<div class="empty">The line appears after two Sundays. See you Sunday! 🙏</div>`;
  const W=320,H=150,L=30,R=30,T=10,B=24,n=w.length;
  const x=i=>L+(W-L-R)*i/(n-1),y=v=>T+(H-T-B)*(1-v/100);
  const path=k=>{let s="",pen=false;w.forEach((p,i)=>{if(p[k]===null){pen=false;return}s+=(pen?"L":"M")+x(i).toFixed(1)+" "+y(p[k]).toFixed(1)+" ";pen=true});return s};
  const last=k=>{for(let i=n-1;i>=0;i--)if(w[i][k]!==null)return [i,w[i][k]];return null};
  const lk=last("kids"),ls=last("servants");
  const lab=(p,c)=>p?`<text x="${W-R+3}" y="${y(p[1])+3}" style="fill:${c};font-weight:900">${p[1]}%</text>`:"";
  return `<svg class="as-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly attendance trend">
   ${[0,50,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="2" y="${y(v)+3}">${v}%</text>`).join("")}
   <text x="${L}" y="${H-6}">${pretty(w[0].d)}</text><text x="${W-R}" y="${H-6}" text-anchor="end">${pretty(w[n-1].d)}</text>
   <path class="ln" pathLength="1" d="${path("kids")}" stroke="var(--gold)"/><path class="ln" pathLength="1" d="${path("servants")}" stroke="var(--sky)"/>
   ${lab(lk,"var(--gold)")}${lab(ls,"var(--sky)")}</svg>
   <div class="as-leg"><span style="color:var(--gold)">● Kids</span><span style="color:var(--sky)">● Servants</span></div>
   <details><summary class="tag">Show the numbers</summary><div class="as-hist">${w.map(p=>`<div><span>${pretty(p.d)}</span><span>Kids ${p.kids===null?"none":p.kids+"%"} · Servants ${p.servants===null?"none":p.servants+"%"}</span></div>`).join("")}</div></details>`}

function dash(d,me){
  const k=d.kpi;
  const tr=k.trend===null?"Not enough data yet":k.trend>0?`▲ ${k.trend} vs last month`:k.trend<0?`▼ ${-k.trend} vs last month`:"Same as last month";
  const p=v=>v===null?"…":v+"%";
  const lvs=[["all","All levels"],["good","80%+"],["mid","50 to 79%"],["low","Under 50%"]];
  const grades=[...new Set(d.kids.map(r=>r.grade))];
  return `<div class="as-chips" id="as-range" role="group" aria-label="Date range">${RANGES.map(r=>`<button data-r="${r[0]}" aria-pressed="${S.range===r[0]}">${r[1]}</button>`).join("")}</div>
  <div class="as-grid">
   <div class="as-sum as-span k6"><div class="as-stat"><b class="as-${lvl(k.kidsPct)}">${p(k.kidsPct)}</b>Kids attendance<small>${tr}</small></div><div class="as-stat"><b class="as-${lvl(k.servantsPct)}">${p(k.servantsPct)}</b>Servants attendance</div><div class="as-stat"><b>${k.presentLast}</b>Kids here ${k.lastDay?pretty(k.lastDay):"last Sunday"}<small>of ${k.kids}</small></div><div class="as-stat"><b>${k.kids}</b>Kids</div><div class="as-stat"><b>${k.servants}</b>Servants</div></div>
   <section class="card as-card"><h2>📈 Weekly attendance</h2>${trendChart(d.weekly)}</section>
   <section class="card as-card"><h2>🏫 Classes</h2>${d.classes.length?d.classes.map(c=>{const l=lvl(c.avg,false);return `<button class="as-cb" data-cls="${esc(c.grade)}" data-ch="${esc(c.church)}" aria-label="${esc(c.grade)}, ${c.avg===null?"not enough data":c.avg+" percent"}, ${c.kids} kids"><span class="lb">${esc(c.grade)}</span><span class="as-bar"><i style="--w:${c.avg||0}%;background:${COL(l==="na"?"mid":l)}"></i></span><b class="as-${l}">${p(c.avg)}</b><span class="tag">${c.kids}</span></button>`}).join(""):`<div class="empty">No kids yet.</div>`}<div class="tag">Tap a class to see its kids.</div></section>
   ${d.followup.length?`<section class="card as-card as-span"><h2>💛 Needs a follow up</h2><div class="as-list">${d.followup.map(r=>`<button class="as-fu" data-pid="${r.id}"><span>${esc(r.name)} <small>${r.role==="servant"?"Servant":esc(r.grade)} · ${r.fu==="missed3"?"Hasn't come for 3 Sundays":"Under 50% so far"}</small></span><span>›</span></button>`).join("")}</div></section>`:""}
   <section class="card as-card"><h2>🙋 Servants</h2><div class="as-list">${d.servants.length?d.servants.map((r,i)=>{const l=lvl(r.pct,false);
     return `<button class="as-row" data-pid="${r.id}"><span class="as-rk">${medal(i)||i+1}</span><span class="as-av" aria-hidden="true">${esc(ini(r.name))}</span><span class="as-nm"><b>${esc(r.name)}</b><span class="as-bar"><i style="--w:${r.pct||0}%;background:${COL(l==="na"?"mid":l)}"></i></span><small>${esc(r.grade)}${r.last?" · last "+pretty(r.last):""}</small></span><span class="as-pc as-${l}">${p(r.pct)}<small>🔥 ${r.streak}</small></span>${spark(r.spark)}</button>`}).join(""):`<div class="empty">No servants yet.</div>`}</div></section>
   <section class="card as-card"><h2>👧 All kids</h2>
    <input class="as-search" id="as-q" type="search" placeholder="Search a name" value="${esc(S.q)}" aria-label="Search a name">
    <div class="as-trendbox"><select class="as-sel" id="as-cls" aria-label="Class"><option value="all">All classes</option>${grades.map(g=>`<option ${S.cls===g?"selected":""}>${esc(g)}</option>`).join("")}</select>
     <select class="as-sel" id="as-lv" aria-label="Level">${lvs.map(l=>`<option value="${l[0]}" ${S.lv===l[0]?"selected":""}>${l[1]}</option>`).join("")}</select></div>
    <div class="as-list" id="as-rows"></div></section>
   <section class="card as-card as-span"><h2>🗓️ No Sunday School days</h2><div class="tag">Mark holidays so nobody is counted absent.</div>
    <div class="as-trendbox"><input class="as-sel" id="as-day" type="date" aria-label="Date"><button class="btn gold" id="as-off" style="padding:8px 14px">Mark as no Sunday School</button><button class="btn" id="as-on" style="padding:8px 14px;background:var(--surface);color:var(--ink);border:1px solid var(--line)">Undo</button></div>
    ${d.off.length?`<div class="tag">Marked: ${d.off.map(pretty).join(", ")}</div>`:""}<div id="as-dmsg" role="status" class="tag"></div></section>
   <section class="card as-card as-span"><h2>⬇️ Export</h2><div class="as-trendbox"><button class="btn gold" data-csv="all" style="padding:8px 14px">Download everyone (CSV)</button><button class="btn" data-csv="class" style="padding:8px 14px">Download one class (CSV)</button>
     <select class="as-sel" id="as-csvcls" aria-label="Class for the CSV">${grades.map(g=>`<option>${esc(g)}</option>`).join("")}</select></div></section></div>`}

function skeleton(){return `<div class="as-grid"><div class="as-skel" style="height:300px"></div><div class="as-skel" style="height:180px"></div><div class="as-skel as-span" style="height:220px"></div></div>`}
function fail(retry){return `<div class="card sec" style="text-align:center"><div style="font-size:2.4rem">📡</div><b>Could not load</b><p class="tag">Check your internet and try again.</p><button class="btn gold" id="as-retry">Try again</button></div>`}

function player(root,fn){root.addEventListener("click",e=>{
  const d=e.target.closest("[data-day]");if(d){const m=root.querySelector("#as-daymsg");if(m)m.textContent=prettyLong(d.dataset.day)+": "+d.dataset.t;return}
  const pid=e.target.closest("[data-pid]");if(pid)return fn.person&&fn.person(pid.dataset.pid)})}

async function openPerson(id,back){
  const sh=sheet(`<div id="as-pbox">${skeleton()}</div>`,"Attendance detail");
  const box=sh.querySelector("#as-pbox");
  try{const d=await call({action:"att_person",target:id,range:S.range});
    if(!d.ok){box.innerHTML=`<div class="empty">You are not allowed to open this one.</div>`;return}
    const p=d.person,adult=true;
    box.innerHTML=`<button class="back" id="as-back">← Back</button><div class="as-ringbox"><h3>${esc(p.name)}</h3><div class="tag">${p.role==="servant"?"Servant":"Student"} · ${esc(p.grade)}</div>${ring(p.pct,false)}<div class="as-say">${say(p,true)}</div></div>
     <div class="as-counts"><div><b>${p.present}</b>Present</div><div><b>${p.missed}</b>Missed</div><div><b>${p.sessions}</b>Sessions</div></div>
     <div class="as-two"><div class="as-stat"><b>${p.streak}</b>Current streak</div><div class="as-stat"><b>${p.best}</b>Best streak</div></div>
     <div class="as-two"><div class="as-stat"><b style="font-size:1.1rem">${p.first?pretty(p.first):"None"}</b>First check in</div><div class="as-stat"><b style="font-size:1.1rem">${p.last?pretty(p.last):"None"}</b>Last check in</div></div>
     <div class="tag">Joined ${pretty(p.joined)}</div>
     <h3>📅 Calendar</h3>${cal(p.cal,d.today)}<div class="tag" id="as-daymsg" role="status">Tap a day to see the time.</div>
     <h3>📊 By month</h3>${monthly(p.monthly,false)}
     <h3>🕒 History</h3>${p.history.length?`<div class="as-hist">${p.history.map(h=>`<div><span>${prettyLong(h.d)}</span><span>${h.t}</span></div>`).join("")}</div>`:`<div class="empty">No check-ins yet.</div>`}`;
    player(box,{});box.querySelector("#as-back")?.addEventListener("click",back||closeSheet);
    sh.classList.add("go");requestAnimationFrame(()=>requestAnimationFrame(()=>sh.classList.add("go")))}
  catch{box.innerHTML=fail()}}

async function openClass(grade,church){
  const sh=sheet(`<div id="as-cbox">${skeleton()}</div>`,"Class");
  const box=sh.querySelector("#as-cbox");
  try{const d=await call({action:"att_class",grade,church,range:S.range});
    if(!d.ok){box.innerHTML=`<div class="empty">You are not allowed to open this one.</div>`;return}
    box.innerHTML=`<h3>${esc(d.grade)}</h3>`+classView(d);
    player(box,{person:id=>openPerson(id,()=>openClass(grade,church))});wire(box,d.rows,false);sh.classList.add("go")}
  catch{box.innerHTML=fail()}}

function download(name,text){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+text],{type:"text/csv"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

window.attSheet=async function(){
  const a=A();
  if(!a){app.innerHTML=`${topbar("Attendance Sheet","📊","Your Sundays","attendance")}<div class="card sec" style="text-align:center"><div style="font-size:3rem">🔒</div><b>Login to see your Sundays</b><p class="tag">Every student and servant needs a profile.</p><button class="btn gold" data-go="login">👤 Login or create profile</button></div>`;return}
  const role=a.user.role,top=role==="coordinator"||role==="priest"||role==="master";
  const adult=role!=="student";
  app.innerHTML=`${topbar("Attendance Sheet","📊",top?"Your classes":adult?"You and your class":"My Sundays","attendance")}<div id="as-root">${skeleton()}</div>`;
  const root=$("#as-root");
  const go=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add("go")));
  const retry=()=>root.querySelector("#as-retry")?.addEventListener("click",()=>attSheet());
  if(!top){
    const showMy=async()=>{root.classList.remove("go");root.querySelector("#as-body").innerHTML=skeleton();
      try{const d=await call({action:"att_my"});const b=root.querySelector("#as-body");
        if(!d.ok){b.innerHTML=`<div class="empty">${d.error==="auth"?"Please login again.":"We could not find your attendance."}</div>`;return}
        b.innerHTML=myView(d,adult);go()}catch{root.querySelector("#as-body").innerHTML=fail();retry()}};
    const showClass=async()=>{root.classList.remove("go");root.querySelector("#as-body").innerHTML=skeleton();
      try{const d=await call({action:"att_class"});const b=root.querySelector("#as-body");
        if(!d.ok){b.innerHTML=`<div class="empty">This is for servants.</div>`;return}
        b.innerHTML=classView(d);wire(b,d.rows,false);go()}catch{root.querySelector("#as-body").innerHTML=fail();retry()}};
    root.innerHTML=`${role==="servant"?`<div class="as-tabs" id="as-tabs"><button data-t="my" aria-pressed="${S.tab==="my"}">My attendance</button><button data-t="class" aria-pressed="${S.tab==="class"}">My class</button></div>`:""}<div id="as-body" style="margin-top:12px"></div>`;
    player(root,{person:id=>openPerson(id)});
    root.querySelector("#as-tabs")?.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;S.tab=b.dataset.t;
      root.querySelectorAll("#as-tabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));S.tab==="my"?showMy():showClass()});
    if(role==="servant"&&S.tab==="class")showClass();else showMy();return}
  const load=async()=>{
    root.innerHTML=skeleton();
    try{const d=await call({action:"att_all",range:S.range});
      if(!d.ok){root.innerHTML=`<div class="empty">This is for coordinators and priests.</div>`;return}
      root.innerHTML=dash(d,a.user);
      const rowsAll=()=>d.kids.filter(r=>(S.cls==="all"||r.grade===S.cls)&&(S.lv==="all"||(S.lv==="good"?r.pct!==null&&r.pct>=80:S.lv==="mid"?r.pct!==null&&r.pct>=50&&r.pct<80:r.pct!==null&&r.pct<50)));
      const draw=()=>{S.filter="all";root.querySelector("#as-rows").innerHTML=rowsHtml(rowsAll(),true);go()};
      draw();
      root.querySelector("#as-q").addEventListener("input",e=>{S.q=e.target.value;draw()});
      root.querySelector("#as-cls").addEventListener("change",e=>{S.cls=e.target.value;draw()});
      root.querySelector("#as-lv").addEventListener("change",e=>{S.lv=e.target.value;draw()});
      root.querySelector("#as-range").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;S.range=b.dataset.r;load()});
      root.addEventListener("click",async e=>{
        const c=e.target.closest("[data-cls]");if(c)return openClass(c.dataset.cls,c.dataset.ch);
        const pid=e.target.closest("[data-pid]");if(pid)return openPerson(pid.dataset.pid);
        const csv=e.target.closest("[data-csv]");if(csv){try{const r=await call({action:"att_csv",scope:csv.dataset.csv,grade:$("#as-csvcls")?.value,range:S.range});
          if(r.ok)download(csv.dataset.csv==="all"?"attendance-everyone.csv":"attendance-"+($("#as-csvcls").value||"class").replace(/\W+/g,"-")+".csv",r.csv);else toast("Not allowed")}catch{toast("No internet connection")}}
        const off=e.target.closest("#as-off,#as-on");if(off){const day=$("#as-day").value;if(!day)return toast("Pick a date first");
          try{const r=await call({action:"att_days",day,off:off.id==="as-off",grade:a.user.role==="coordinator"?a.user.grade:"*"});
            if(r.ok){toast(off.id==="as-off"?"Marked as no Sunday School ✅":"Back to a normal day ✅");load()}else toast("Not allowed")}catch{toast("No internet connection")}}});
      go()}catch{root.innerHTML=fail();retry()}};
  load()};
})();
