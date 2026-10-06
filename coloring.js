/* Heavenly Visions: Coloring Pages. 14 original line-art pages (drawn in code), tap to fill, free brush, rainbow brush,
   eraser, stickers, undo and redo, pinch zoom, My Gallery (saved on this phone) and PNG download. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};

/* ---------- art helpers (viewBox 0 0 400 400) ---------- */
const c=(x,y,r)=>`<circle class="r" cx="${x}" cy="${y}" r="${r}"/>`;
const e=(x,y,rx,ry)=>`<ellipse class="r" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const rc=(x,y,w,h,r)=>`<rect class="r" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r||0}"/>`;
const p=d=>`<path class="r" d="${d}"/>`;
const pg=pts=>`<polygon class="r" points="${pts}"/>`;
const ln=d=>`<path class="ln" d="${d}"/>`;
const star=(cx,cy,R,r)=>{let o=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r:R;o.push((cx+Math.cos(a)*rad).toFixed(1)+","+(cy+Math.sin(a)*rad).toFixed(1))}return pg(o.join(" "))};
const sky=()=>rc(0,0,400,400);
const sun=(x,y,r)=>c(x,y,r);
const cloud=(x,y)=>e(x,y,42,18)+e(x+26,y-12,26,16)+e(x-24,y-8,22,14);
const waves=(y)=>p(`M0 ${y} Q50 ${y-30} 100 ${y} T200 ${y} T300 ${y} T400 ${y} V400 H0Z`);
const grass=(x,y)=>ln(`M${x} ${y} l-6 -16 M${x} ${y} l0 -20 M${x} ${y} l6 -16`);
const flower=(x,y,col)=>ln(`M${x} ${y} v40`)+c(x,y,11)+c(x-14,y+4,8)+c(x+14,y+4,8)+c(x,y-14,8);
const PAGES=[
{id:"cross",t:"The Cross",ic:"✝️",svg:sky()+sun(325,75,36)+cloud(90,70)+p("M0 300 Q100 230 200 290 T400 270 V400 H0Z")+p("M0 345 Q200 305 400 345 V400 H0Z")+rc(180,70,40,230,6)+rc(120,130,160,40,6)+c(200,150,16)+flower(70,350,1)+flower(330,350,1)+grass(150,350)+grass(250,355)},
{id:"dove",t:"The Dove",ic:"🕊️",svg:sky()+sun(70,70,34)+cloud(300,80)+p("M120 232 L50 262 L72 212Z")+e(200,215,88,48)+p("M180 205 Q140 100 245 112 Q262 165 218 222Z")+c(285,172,32)+pg("312,166 350,177 312,188")+c(294,164,5)+ln("M300 235 Q340 270 370 235")+e(350,240,20,8)+e(372,230,16,7)+e(330,252,16,7)+grass(60,380)+grass(330,385)},
{id:"ark",t:"Noah's Ark",ic:"🌈",svg:sky()+sun(60,60,30)+p("M20 260 A180 180 0 0 1 380 260 L350 260 A150 150 0 0 0 50 260Z")+p("M50 260 A150 150 0 0 1 350 260 L322 260 A122 122 0 0 0 78 260Z")+p("M78 260 A122 122 0 0 1 322 260 L296 260 A96 96 0 0 0 104 260Z")+cloud(330,60)+p("M80 285 L320 285 L290 345 L110 345Z")+rc(140,235,120,50)+pg("128,235 200,190 272,235")+c(170,260,10)+c(200,260,10)+c(230,260,10)+pg("200,190 200,162 228,176")+waves(325)},
{id:"shepherd",t:"The Good Shepherd",ic:"🐑",svg:sky()+sun(60,65,32)+cloud(320,70)+p("M0 265 Q200 175 400 265 V400 H0Z")+pg("120,180 182,180 205,330 98,330")+c(150,148,27)+e(188,225,28,18)+c(166,216,12)+ln("M215 125 Q245 112 240 150 L232 330")+e(300,285,46,32)+c(348,272,18)+e(356,258,8,12)+rc(278,308,11,28,3)+rc(314,308,11,28,3)+grass(60,380)+grass(380,385)},
{id:"daniel",t:"Daniel and the Lions",ic:"🦁",svg:sky()+star(60,50,16,7)+star(340,60,14,6)+rc(0,330,400,70)+p("M150 195 L250 195 L278 335 L122 335Z")+e(200,112,36,10)+c(200,150,30)+c(160,235,11)+c(240,235,11)+c(72,258,52)+c(72,266,34)+c(38,222,14)+c(106,222,14)+pg("64,270 80,270 72,282")+c(328,258,52)+c(328,266,34)+c(294,222,14)+c(362,222,14)+pg("320,270 336,270 328,282")},
{id:"david",t:"David and Goliath",ic:"🪨",svg:sky()+sun(60,60,30)+p("M0 330 Q200 290 400 330 V400 H0Z")+pg("84,255 118,255 124,330 78,330")+c(101,232,18)+c(140,224,7)+ln("M120 250 Q150 200 135 224")+rc(246,160,92,128,10)+c(292,122,36)+p("M254 112 Q292 58 330 112Z")+rc(256,288,32,70,6)+rc(298,288,32,70,6)+c(250,220,32)+pg("352,70 364,38 376,70")+ln("M364 70 V360")},
{id:"jonah",t:"Jonah and the Whale",ic:"🐋",svg:sky()+sun(335,60,32)+cloud(80,60)+p("M190 170 Q165 100 135 90 Q172 120 196 170Z")+p("M210 170 Q235 100 265 90 Q228 120 204 170Z")+p("M60 262 Q80 160 200 168 Q322 176 342 252 Q332 304 200 312 Q92 316 60 262Z")+p("M338 250 Q372 205 388 160 Q398 208 366 248 Q392 258 396 288 Q362 278 338 268Z")+p("M92 272 Q200 322 322 272 Q200 298 92 272Z")+c(122,228,9)+ln("M84 262 Q108 280 134 266")+waves(310)},
{id:"nativity",t:"The Nativity",ic:"⭐",svg:sky()+star(200,56,34,14)+star(60,120,12,5)+star(340,110,12,5)+pg("52,172 200,98 348,172")+rc(80,172,240,170,0)+p("M168 342 V258 Q200 222 232 258 V342Z")+c(130,238,16)+pg("110,258 150,258 166,330 96,330")+c(272,238,16)+pg("252,258 292,258 306,330 238,330")+rc(172,310,56,26,6)+c(200,302,12)+rc(0,342,400,58)},
{id:"mary",t:"St. Mary",ic:"💙",svg:sky()+c(200,118,72)+p("M138 120 Q138 55 200 50 Q262 55 262 120 Q278 220 296 335 L104 335 Q122 220 138 120Z")+e(200,128,42,54)+c(262,268,28)+e(256,320,30,34)+c(262,268,38)+star(200,62,10,4)+flower(60,350,1)+flower(340,350,1)},
{id:"george",t:"St. George",ic:"🛡️",svg:sky()+sun(330,60,30)+rc(0,340,400,60)+p("M164 92 Q200 48 236 92 L236 132 L164 132Z")+rc(160,132,80,110,12)+rc(166,242,30,92,6)+rc(204,242,30,92,6)+p("M252 140 L322 140 L322 222 Q287 262 252 222Z")+rc(283,150,8,62)+rc(263,172,48,8)+pg("92,60 102,30 112,60")+ln("M102 60 V330")+e(80,330,48,22)+c(42,314,17)+pg("66,322 88,268 108,322")+p("M124 336 Q158 338 168 360 Q140 344 124 346Z")},
{id:"church",t:"Our Church",ic:"⛪",svg:sky()+sun(60,60,30)+cloud(320,70)+rc(0,340,400,60)+rc(110,192,180,150)+p("M128 192 Q200 92 272 192Z")+rc(195,46,10,56)+rc(180,62,40,10)+p("M178 342 V272 Q200 246 222 272 V342Z")+e(150,252,14,24)+e(250,252,14,24)+rc(300,160,56,182)+pg("294,160 328,112 362,160")+rc(325,84,6,32)+c(52,296,32)+rc(46,318,12,26)+p("M178 342 L222 342 L270 400 L130 400Z")},
{id:"creation",t:"Seven Days",ic:"🌍",svg:[[20,20],[150,20],[280,20],[20,150],[150,150],[280,150],[150,280]].map(a=>rc(a[0],a[1],100,100,12)).join("")+c(70,70,24)+e(200,70,32,14)+e(184,78,20,10)+rc(318,64,10,28)+c(323,56,22)+c(70,200,20)+star(100,172,10,4)+e(200,200,30,16)+pg("232,200 252,184 252,216")+p("M290 215 Q315 160 345 200 Q320 215 290 215Z")+c(200,330,28)+c(188,322,6)+c(212,322,6)+p("M70 285 C20 260 40 225 70 250 C100 225 120 260 70 285Z")+ln("M60 330 q10 10 20 0")},
{id:"bible",t:"The Holy Bible",ic:"📖",svg:sky()+pg("200,150 170,40 190,40")+pg("200,150 230,40 210,40")+pg("200,150 130,80 142,66")+pg("200,150 270,80 258,66")+rc(190,40,20,90)+rc(165,66,70,20)+p("M56 168 Q130 136 200 168 V340 Q130 308 56 340Z")+p("M344 168 Q270 136 200 168 V340 Q270 308 344 340Z")+p("M44 340 Q130 308 200 340 Q270 308 356 340 V362 Q270 330 200 362 Q130 330 44 362Z")+ln("M80 200 Q130 185 180 205 M80 230 Q130 215 180 235 M80 260 Q130 245 180 265 M220 205 Q270 185 320 200 M220 235 Q270 215 320 230 M220 265 Q270 245 320 260")},
{id:"lamb",t:"The Lamb",ic:"🐑",svg:sky()+sun(335,60,30)+cloud(80,60)+p("M0 300 Q200 250 400 300 V400 H0Z")+rc(130,320,12,36,3)+rc(176,322,12,36,3)+rc(246,320,12,36,3)+rc(290,322,12,36,3)+c(170,300,50)+c(220,285,54)+c(268,300,48)+c(200,325,40)+c(120,262,36)+e(92,248,12,22)+e(150,248,12,22)+c(112,258,5)+pg("236,230 236,140 330,160 330,215")+ln("M236 230 V140")+rc(274,162,12,44)+rc(258,176,44,12)+flower(50,350,1)+grass(360,360)}
];

/* ---------- state ---------- */
const COLORS=["#e0393e","#f26b3a","#f6a623","#f6d33a","#a7d63a","#4cae4f","#1f9d7a","#2fb5c9","#2f8fe0","#3a5fd0","#6c4ad0","#a24bd0","#e04bb0","#f08aa8","#fbd4c4","#c98a5a","#8a5a3a","#5a3a22","#ffffff","#d9d9d9","#9a9a9a","#555555","#222222","#f2e6c2"];
const STICKERS=["⭐","❤️","✝️","✨","🕊️","🌈","🌟","👼"];
const S={page:null,tool:"fill",col:COLORS[0],size:10,sticker:"⭐",ops:[],redo:[],scale:1,tx:0,ty:0,rainbow:false,hue:0};

function pastel(svg){let i=0;return svg.replace(/class="r"/g,()=>`class="r" style="fill:hsl(${(i++*53)%360},70%,84%)"`)}
const artSvg=(pg,extra)=>`<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="cart" ${extra||""} role="img" aria-label="${E(pg.t)}">${pg.svg}</svg>`;

/* ---------- picker ---------- */
function picker(){
  const g=jget("hv_gallery",[]);
  app.innerHTML=`${topbar("Coloring","🎨","Pick a picture","home")}
  <button class="btn" data-go="color-gallery">🖼️ My gallery (${g.length})</button>
  <div class="grid cgal">${PAGES.map(pg=>`<button class="tile cpick" data-go="color-${pg.id}" style="--c:#e8584f"><span class="cprev">${pastel(artSvg(pg))}</span><span class="nm">${pg.ic} ${E(pg.t)}</span></button>`).join("")}</div>`}

function gallery(){
  const g=jget("hv_gallery",[]);
  app.innerHTML=`${topbar("My Gallery","🖼️","Saved on this phone","coloring")}${g.length?`<div class="grid cgal">${g.map((x,i)=>`<div class="card cgi"><img src="${x.img}" alt="${E(x.t)}" loading="lazy"><b>${E(x.t)}</b><div class="two"><a class="btn alt" href="${x.img}" download="${E(x.t)}.png">⬇️ Download</a><button class="btn" data-del="${i}">🗑️ Delete</button></div></div>`).join("")}</div>`:`<div class="ds-empty"><div class="em">🖼️</div><b>No pictures yet</b>Color a page and press Save to keep it here.</div>`}`;
  app.onclick=ev=>{const d=ev.target.closest("[data-del]");if(!d)return;if(!confirm("Delete this picture?"))return;const g2=jget("hv_gallery",[]);g2.splice(+d.dataset.del,1);jset("hv_gallery",g2);gallery()}}

/* ---------- editor ---------- */
let cv,cx,stage,wrap,svgEl;
function editor(id){
  const pg=PAGES.find(x=>x.id===id);if(!pg)return picker();
  S.page=pg;S.ops=[];S.redo=[];S.scale=1;S.tx=0;S.ty=0;S.tool="fill";S.rainbow=false;
  app.innerHTML=`${topbar(E(pg.t),pg.ic,"Tap a color, then tap the picture","coloring")}
  <div class="ctools" role="toolbar" aria-label="Tools">${[["fill","🪣","Fill"],["brush","🖌️","Brush"],["erase","🧽","Eraser"],["sticker","⭐","Stickers"]].map(t=>`<button class="ctool" data-tool="${t[0]}" aria-pressed="${t[0]==="fill"}" aria-label="${t[2]}"><span>${t[1]}</span><small>${t[2]}</small></button>`).join("")}
   <button class="ctool" id="cundo" aria-label="Undo"><span>↩️</span><small>Undo</small></button><button class="ctool" id="credo" aria-label="Redo"><span>↪️</span><small>Redo</small></button></div>
  <div class="cstage" id="cstage"><div class="cwrap" id="cwrap">${artSvg(pg,'id="cart"')}<canvas id="ccv" width="800" height="800"></canvas></div>
   <div class="czoom"><button id="czi" aria-label="Zoom in">➕</button><button id="czo" aria-label="Zoom out">➖</button><button id="czr" aria-label="Reset zoom">⟲</button></div></div>
  <div class="cpal crayons" id="cpal" role="group" aria-label="Colors">${COLORS.map(k=>`<button class="cc" data-col="${k}" style="background:${k}" aria-label="Color ${k}" aria-pressed="${k===S.col}"></button>`).join("")}<button class="cc rainbow" data-col="rainbow" aria-label="Rainbow" aria-pressed="false">🌈</button></div>
  <div class="csz" id="csz"><span class="tag">Brush size</span>${[[5,"S"],[10,"M"],[18,"L"],[30,"XL"]].map(s=>`<button class="ds-chip" data-size="${s[0]}" aria-pressed="${s[0]===S.size}">${s[1]}</button>`).join("")}</div>
  <div class="cstk" id="cstk" hidden>${STICKERS.map(s=>`<button class="ds-chip" data-stk="${s}" aria-pressed="${s===S.sticker}">${s}</button>`).join("")}</div>
  <div class="two"><button class="btn gold" id="csave">💾 Save to my gallery</button><button class="btn alt" id="cdl">⬇️ Download</button></div><div id="cmsg" role="status" class="tag"></div>`;
  stage=document.getElementById("cstage");wrap=document.getElementById("cwrap");cv=document.getElementById("ccv");cx=cv.getContext("2d");svgEl=document.getElementById("cart");
  svgEl.querySelectorAll(".r").forEach((r,i)=>{r.dataset.i=i;r.style.fill="#fff"});
  wireEditor()}
const regions=()=>[...svgEl.querySelectorAll(".r")];
function apply(){wrap.style.transform=`translate(${S.tx}px,${S.ty}px) scale(${S.scale})`}
function clampPan(){const w=stage.clientWidth,h=stage.clientHeight,mx=(S.scale-1)*w,my=(S.scale-1)*h;S.tx=Math.min(0,Math.max(-mx,S.tx));S.ty=Math.min(0,Math.max(-my,S.ty))}
function zoomAt(f,px,py){const ns=Math.min(4,Math.max(1,S.scale*f));if(ns===S.scale)return;const r=ns/S.scale;S.tx=px-(px-S.tx)*r;S.ty=py-(py-S.ty)*r;S.scale=ns;clampPan();apply()}
function point(ev){const r=cv.getBoundingClientRect();return [(ev.clientX-r.left)/r.width*800,(ev.clientY-r.top)/r.height*800]}
function paintOp(op){
  if(op.t==="stroke"){cx.save();cx.lineCap="round";cx.lineJoin="round";cx.lineWidth=op.size*2;cx.globalCompositeOperation=op.erase?"destination-out":"source-over";
    const pts=op.pts;if(pts.length===1){cx.fillStyle=op.erase?"#000":(op.rainbow?`hsl(${op.hue},90%,55%)`:op.col);cx.beginPath();cx.arc(pts[0][0],pts[0][1],op.size,0,7);cx.fill()}
    else for(let i=1;i<pts.length;i++){cx.strokeStyle=op.erase?"#000":(op.rainbow?`hsl(${(op.hue+i*6)%360},90%,55%)`:op.col);cx.beginPath();cx.moveTo(pts[i-1][0],pts[i-1][1]);cx.lineTo(pts[i][0],pts[i][1]);cx.stroke()}cx.restore()}
  else if(op.t==="stamp"){cx.save();cx.font=op.size*5+"px serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(op.e,op.x,op.y);cx.restore()}}
function redraw(){cx.clearRect(0,0,800,800);S.ops.forEach(o=>{if(o.t!=="fill")paintOp(o)})}
function doFill(r,col){const prev=r.style.fill;const to=col;if(prev===to||(prev==="rgb(255, 255, 255)"&&to==="#ffffff"))return;S.ops.push({t:"fill",i:+r.dataset.i,from:prev,to});S.redo=[];r.style.fill=to}
function undo(){const o=S.ops.pop();if(!o)return;S.redo.push(o);if(o.t==="fill")regions()[o.i].style.fill=o.from;else redraw();paintBtns()}
function redo(){const o=S.redo.pop();if(!o)return;S.ops.push(o);if(o.t==="fill")regions()[o.i].style.fill=o.to;else paintOp(o);paintBtns()}
function paintBtns(){const u=document.getElementById("cundo"),r=document.getElementById("credo");if(u)u.disabled=!S.ops.length;if(r)r.disabled=!S.redo.length}
function wireEditor(){
  const ptrs=new Map();let cur=null,moved=0,pinch=null;
  stage.style.touchAction="none";
  stage.addEventListener("pointerdown",ev=>{stage.setPointerCapture(ev.pointerId);ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
    if(ptrs.size===2){cur=null;const a=[...ptrs.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2};return}
    moved=0;if(S.tool==="brush"||S.tool==="erase"){const pt=point(ev);cur={t:"stroke",pts:[pt],col:S.col,size:S.size,erase:S.tool==="erase",rainbow:S.rainbow,hue:S.hue};if(S.rainbow)S.hue=(S.hue+40)%360;paintOp(cur)}else cur={t:"tap",x:ev.clientX,y:ev.clientY,target:ev.target}});
  stage.addEventListener("pointermove",ev=>{const p0=ptrs.get(ev.pointerId);if(!p0)return;
    if(ptrs.size===2&&pinch){p0.x=ev.clientX;p0.y=ev.clientY;const a=[...ptrs.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),mx=(a[0].x+a[1].x)/2,my=(a[0].y+a[1].y)/2,r=stage.getBoundingClientRect();
      S.tx+=mx-pinch.mx;S.ty+=my-pinch.my;zoomAt(d/pinch.d,mx-r.left,my-r.top);pinch.d=d;pinch.mx=mx;pinch.my=my;clampPan();apply();return}
    p0.x=ev.clientX;p0.y=ev.clientY;if(!cur)return;
    if(cur.t==="stroke"){const pt=point(ev),last=cur.pts[cur.pts.length-1];if(Math.hypot(pt[0]-last[0],pt[1]-last[1])<2)return;cur.pts.push(pt);const seg={t:"stroke",pts:[last,pt],col:cur.col,size:cur.size,erase:cur.erase,rainbow:cur.rainbow,hue:cur.hue+cur.pts.length*6};paintOp(seg)}
    else moved=Math.max(moved,Math.hypot(ev.clientX-cur.x,ev.clientY-cur.y))});
  const up=ev=>{ptrs.delete(ev.pointerId);if(ptrs.size<2)pinch=null;if(!cur)return;
    if(cur.t==="stroke"){S.ops.push(cur);S.redo=[];paintBtns()}
    else if(cur.t==="tap"&&moved<10){
      if(S.tool==="fill"||S.tool==="erase"){const r=document.elementFromPoint(cur.x,cur.y);const reg=r&&r.closest&&r.closest(".r");if(reg&&svgEl.contains(reg)){doFill(reg,S.tool==="erase"?"#ffffff":(S.rainbow?`hsl(${S.hue=(S.hue+47)%360},85%,60%)`:S.col));paintBtns()}}
      else if(S.tool==="sticker"){const pt=point(ev);const o={t:"stamp",x:pt[0],y:pt[1],e:S.sticker,size:S.size<8?10:S.size<20?14:20};S.ops.push(o);S.redo=[];paintOp(o);paintBtns()}}
    cur=null};
  stage.addEventListener("pointerup",up);stage.addEventListener("pointercancel",up);
  stage.addEventListener("wheel",ev=>{ev.preventDefault();const r=stage.getBoundingClientRect();zoomAt(ev.deltaY<0?1.15:.87,ev.clientX-r.left,ev.clientY-r.top)},{passive:false});
  document.getElementById("czi").onclick=()=>zoomAt(1.4,stage.clientWidth/2,stage.clientHeight/2);document.getElementById("czo").onclick=()=>zoomAt(.7,stage.clientWidth/2,stage.clientHeight/2);document.getElementById("czr").onclick=()=>{S.scale=1;S.tx=0;S.ty=0;apply()};
  document.querySelector(".ctools").onclick=ev=>{const t=ev.target.closest("[data-tool]");if(t){S.tool=t.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.setAttribute("aria-pressed",x===t));document.getElementById("cstk").hidden=S.tool!=="sticker";
      document.getElementById("csz").hidden=S.tool==="fill"||S.tool==="sticker"&&false}};
  document.getElementById("cundo").onclick=undo;document.getElementById("credo").onclick=redo;paintBtns();
  document.getElementById("cpal").onclick=ev=>{const b=ev.target.closest("[data-col]");if(!b)return;S.rainbow=b.dataset.col==="rainbow";if(!S.rainbow)S.col=b.dataset.col;document.querySelectorAll("#cpal .cc").forEach(x=>x.setAttribute("aria-pressed",x===b));if(S.tool==="erase"||S.tool==="sticker")document.querySelector("[data-tool=fill]").click()};
  document.getElementById("csz").onclick=ev=>{const b=ev.target.closest("[data-size]");if(!b)return;S.size=+b.dataset.size;document.querySelectorAll("#csz [data-size]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  document.getElementById("cstk").onclick=ev=>{const b=ev.target.closest("[data-stk]");if(!b)return;S.sticker=b.dataset.stk;document.querySelectorAll("#cstk [data-stk]").forEach(x=>x.setAttribute("aria-pressed",x===b))};
  document.getElementById("csave").onclick=save;document.getElementById("cdl").onclick=download}
/* picture to PNG: draw the SVG (with its fills) then the brush layer */
function compose(px){return new Promise(res=>{const clone=svgEl.cloneNode(true);clone.setAttribute("width",px);clone.setAttribute("height",px);
  clone.querySelectorAll(".r").forEach(r=>{r.setAttribute("fill",r.style.fill||"#fff");r.removeAttribute("style");r.setAttribute("stroke","#2b2433");r.setAttribute("stroke-width","4");r.setAttribute("stroke-linejoin","round")});
  clone.querySelectorAll(".ln").forEach(r=>{r.setAttribute("fill","none");r.setAttribute("stroke","#2b2433");r.setAttribute("stroke-width","4");r.setAttribute("stroke-linecap","round")});
  const img=new Image();img.onload=()=>{const o=document.createElement("canvas");o.width=o.height=px;const g=o.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,px,px);g.drawImage(img,0,0,px,px);g.drawImage(cv,0,0,px,px);res(o)};
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(clone))})}
async function save(){const m=document.getElementById("cmsg");m.textContent="Saving...";
  const o=await compose(420),img=o.toDataURL("image/jpeg",.78),g=jget("hv_gallery",[]);
  g.unshift({id:Date.now(),page:S.page.id,t:S.page.t,img});while(g.length>24)g.pop();
  if(!jset("hv_gallery",g)){g.splice(8);jset("hv_gallery",g)}
  m.textContent="Saved to My Gallery! 🎉";if(window.confetti)confetti();
  const d=new Date(),k=d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();if(window.hvAward)hvAward("color",S.page.id+"-"+k,S.page.t)}
async function download(){const o=await compose(1000);const a=document.createElement("a");a.href=o.toDataURL("image/png");a.download=S.page.t.replace(/\W+/g,"-")+".png";document.body.appendChild(a);a.click();a.remove()}

window.coloringRoute=function(h){
  if(h==="coloring"){picker();return true}
  if(h==="color-gallery"){gallery();return true}
  if(h.startsWith("color-")){editor(h.slice(6));return true}
  return false};

const st=document.createElement("style");
st.textContent=`
.cgal{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.cpick{padding:8px;gap:6px}.cprev{display:block;background:#fff;border-radius:14px;overflow:hidden;width:100%}.cprev svg{display:block;width:100%;height:auto}
.cart .r{stroke:#2b2433;stroke-width:4;stroke-linejoin:round;cursor:pointer}.cart .ln{fill:none;stroke:#2b2433;stroke-width:4;stroke-linecap:round;pointer-events:none}.cprev .r{stroke:#2b2433;stroke-width:5;stroke-linejoin:round}.cprev .ln{fill:none;stroke:#2b2433;stroke-width:5;stroke-linecap:round}
.ctools{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:2px}@media (min-width:480px){.ctools{grid-template-columns:repeat(6,1fr)}}.ctool{min-width:0;display:flex;flex-direction:column;align-items:center;gap:0;padding:6px 4px;border-radius:14px;border:2px solid var(--line);background:var(--glass);color:var(--ink);font:inherit;font-weight:800}.ctool span{font-size:1.4rem}.ctool small{font-size:.7rem}
.ctool[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft)}.ctool:disabled{opacity:.4}
.cstage{position:relative;overflow:hidden;background:#fff;border-radius:18px;border:3px solid var(--gold);aspect-ratio:1;width:min(100%,640px);margin-inline:auto;box-shadow:var(--sh)}
.cwrap{position:absolute;inset:0;transform-origin:0 0}.cwrap svg,.cwrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.cwrap canvas{pointer-events:none}
.czoom{position:absolute;right:8px;bottom:8px;display:flex;flex-direction:column;gap:6px}.czoom button{width:44px;height:44px;border-radius:50%;border:1px solid var(--glass-b);background:rgba(255,255,255,.9);color:#222;font-size:1.1rem}
.cpal{display:grid;grid-template-columns:repeat(6,minmax(44px,1fr));gap:6px;padding:8px;border-radius:var(--r-l);background:linear-gradient(180deg,var(--glass),color-mix(in srgb,var(--c-color) 14%,var(--glass)));border:1px solid var(--glass-b)}
.cc{aspect-ratio:1;min-height:0;min-width:0;border-radius:50%;border:3px solid transparent;box-shadow:inset 0 0 0 2px rgba(0,0,0,.18),0 3px 6px rgba(0,0,0,.25)}.cc[aria-pressed=true]{border-color:#fff;transform:scale(1.14);box-shadow:0 0 0 3px var(--gold),0 6px 12px rgba(0,0,0,.35)}
.cc.rainbow{background:conic-gradient(red,orange,yellow,green,cyan,blue,magenta,red)}
@media (min-width:600px){.cpal{grid-template-columns:repeat(12,1fr)}}
.csz,.cstk{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.cgi img{width:100%;border-radius:12px;background:#fff;display:block}.cgi{display:flex;flex-direction:column;gap:8px}
`;
document.head.appendChild(st);
})();
