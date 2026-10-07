/* Heavenly Visions: live Kahoot style games.
   Host (servant, on the TV) and players (kids, on phones) talk through Firebase Realtime Database.
   The host keeps the answer key on its own device, so kids can never see the right answers.
   Points for the final places are given by the Google script (live_finish), not by the phones. */
(function(){
const FB="https://heavenly-visions-live-default-rtdb.firebaseio.com";
const APP_URL="https://morcosfady.github.io/heavenly-visions/";
const GU=()=>window.GAMES_URL||"";
const acct=()=>window.hvAcct&&hvAcct();
const SHAPES=["▲","◆","●","■"];

const st=document.createElement("style");
st.textContent=`
.lv{display:flex;flex-direction:column;gap:14px}
.lv-pin{font-family:var(--display);font-weight:900;text-align:center;letter-spacing:.12em;font-size:clamp(2.8rem,13vw,6.5rem);line-height:1.05;color:var(--gold);text-shadow:0 4px 24px rgba(227,180,92,.45)}
.lv-join{display:grid;grid-template-columns:1fr;gap:14px;align-items:center;justify-items:center;text-align:center}
.lv-qr{background:#fff;padding:8px;border-radius:16px;line-height:0;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}
.lv-qr svg{width:clamp(150px,34vw,260px);height:auto}
.lv-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.lv-chip{background:var(--glass);border:1px solid var(--glass-b);border-radius:999px;padding:6px 14px;font-weight:800;animation:pop .3s ease}
.lv-big{font-size:clamp(1.3rem,4.5vw,2.4rem)}
.lv-count{font-family:var(--display);font-size:clamp(2.2rem,8vw,4rem);font-weight:900;text-align:center}
.lv-bars{display:grid;gap:8px}
.lv-bar{display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;font-weight:900}
.lv-bar i{display:block;height:34px;border-radius:10px;min-width:6px}
.lv-bar.ok{outline:3px solid var(--good);outline-offset:3px;border-radius:12px}
.lv-row{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;background:var(--glass);border:1px solid var(--glass-b);border-radius:14px;padding:10px 14px;font-weight:800}
.lv-row b{font-variant-numeric:tabular-nums}
.lv-pod{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:10px;align-items:end;text-align:center}
.lv-pod>div{border-radius:18px 18px 0 0;padding:14px 6px;background:var(--glass);border:1px solid var(--glass-b)}
.lv-pod .p1{min-height:190px;background:linear-gradient(180deg,rgba(246,210,122,.5),var(--glass))}
.lv-pod .p2{min-height:140px}.lv-pod .p3{min-height:110px}
.lv-pod .m{font-size:2.4rem}
.lv-pod .n{font-weight:900;overflow-wrap:anywhere}
.lv-res{text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center}
.lv-res .em{font-size:4rem;line-height:1}
.lv-pts{font-family:var(--display);font-size:2.4rem;font-weight:900;color:var(--gold)}
.lv-pinput{font-size:2.2rem;text-align:center;letter-spacing:.3em;font-weight:900;padding-left:.3em}
`;
document.head.appendChild(st);

/* ---------- Firebase helpers ---------- */
const fb=(path,method,body)=>fetch(FB+"/"+path+".json",{method:method||"GET",body:body===undefined?undefined:JSON.stringify(body)})
  .then(r=>r.ok?r.json():Promise.reject(r.status));
function setAt(root,path,val){const parts=String(path).split("/").filter(Boolean);
  if(!parts.length)return val;
  if(root==null||typeof root!=="object")root={};
  let cur=root;
  for(let i=0;i<parts.length-1;i++){if(cur[parts[i]]==null||typeof cur[parts[i]]!=="object")cur[parts[i]]={};cur=cur[parts[i]]}
  const last=parts[parts.length-1];if(val===null)delete cur[last];else cur[last]=val;return root}
function stream(path,onChange){let es,data=null,closed=false,pend=0;
  const fire=()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;if(!closed)onChange(data)})};
  const open=()=>{es=new EventSource(FB+"/"+path+".json");
    es.addEventListener("put",e=>{const m=JSON.parse(e.data);data=setAt(data,m.path,m.data);fire()});
    es.addEventListener("patch",e=>{const m=JSON.parse(e.data);Object.keys(m.data||{}).forEach(k=>{data=setAt(data,(m.path==="/"?"":m.path)+"/"+k,m.data[k])});fire()});
    es.onerror=()=>{if(es.readyState===2&&!closed)setTimeout(open,2000)}};
  open();
  return {close(){closed=true;es.close()},get:()=>data}}
const asArr=x=>Array.isArray(x)?x:x&&typeof x==="object"?Object.keys(x).sort((a,b)=>a-b).map(k=>x[k]):[];
const shortName=n=>{const p=String(n||"Player").trim().split(/\s+/);return p.length>1?p[0]+" "+p[p.length-1][0]+".":p[0]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- secrets ----------
   The host makes a secret when the room opens. It is stored at hostkeys/PIN, which nobody can read.
   Every host write also carries the secret at hs/PIN, and the rules only accept it if it matches.
   Players do the same with their own key (pk/PIN/ID, proof at ps/PIN/ID), so they can only write their own things. */
const newKey=()=>Array.from(crypto.getRandomValues(new Uint8Array(18)),b=>b.toString(16).padStart(2,"0")).join("");
const keep=(store,name,make)=>{let v="";
  try{v=window[store].getItem(name)||""}catch{}
  if(!v&&make){v=newKey();try{window[store].setItem(name,v)}catch{}}
  return v};
const hostKey=(pin,make)=>keep("sessionStorage","hv_hk_"+pin,make);
const playerKey=(pin,uid)=>keep("localStorage","hv_pk_"+pin+"_"+uid,true);
const fbRoot=body=>fetch(FB+"/.json",{method:"PATCH",body:JSON.stringify(body)}).then(r=>r.ok?r.json():Promise.reject(r.status));
const inRoom=(pin,updates)=>{const o={};Object.keys(updates).forEach(k=>o["live/"+pin+"/"+k]=updates[k]);return o};
/* sends the update with the proof; a leftover proof from an earlier write is removed and the write is tried once more */
async function proven(proofPath,key,body){body[proofPath]=key;
  try{await fbRoot(body)}catch{await fb(proofPath,"DELETE").catch(()=>{});await fbRoot(body)}
  fb(proofPath,"DELETE").catch(()=>{})}
const hostWrite=(pin,updates)=>proven("hs/"+pin,hostKey(pin),inRoom(pin,updates));
const playerWrite=(pin,uid,updates)=>{const k=playerKey(pin,uid),o=inRoom(pin,updates);o["pk/"+pin+"/"+uid]=k;return proven("ps/"+pin+"/"+uid,k,o)};
async function cleanKeys(pin){for(const p of ["hostkeys/"+pin,"hs/"+pin,"pk/"+pin,"ps/"+pin]){try{await fb(p,"DELETE")}catch{}}
  try{sessionStorage.removeItem("hv_hk_"+pin)}catch{}}
let H=null,P=null,C=null,W=null;
function stopAll(){if(C){C.closed=true;C.s&&C.s.close();C=null}if(W){W.closed=true;clearInterval(W.tick);W.s&&W.s.close();W=null}if(H){H.closed=true;clearInterval(H.tick);H.s&&H.s.close();H=null}if(P){P.closed=true;clearInterval(P.tick);P.s&&P.s.close();P=null}}
addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(!(h.startsWith("live-")||h.startsWith("j-")||h==="join"||h.startsWith("cls-")))stopAll()});

/* ================= HOST (TV) ================= */
function questionsOf(g){
  return (g.items||[]).map(it=>{const L=["a","b","c","d"].filter(k=>String(it[k]||"").trim());
    return {q:String(it.q||"").trim(),L,ch:L.map(k=>String(it[k]).trim()),ok:Math.max(0,L.indexOf(it.ok))}})
    .filter(x=>x.q&&x.ch.length>=2).slice(0,50)}

async function host(gameId){
  stopAll();
  const a=acct();
  const g=(JSON.parse(localStorage.getItem("hv_games")||"[]")).find(x=>x.id===gameId);
  if(!a||!g||g.t!=="kahoot"){go("builder");return}
  const qs=questionsOf(g);
  if(!qs.length){toast("Add at least 1 question first");go("bedit-"+gameId);return}
  const dur=Math.max(5,Math.min(120,+(g.data&&g.data.timer)||20));
  app.innerHTML=`${topbar("Live game","📺",esc(g.title||"Kahoot"),"builder")}<div class="lv" id="lv"><div class="tag" style="text-align:center">Opening the room…</div></div>`;
  let pin="";
  try{for(let i=0;i<8;i++){const c=String(Math.floor(100000+Math.random()*900000));if(await fb("live/"+c+"/meta")===null){pin=c;break}}
    if(!pin)throw 0;
    const sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    const hk=hostKey(pin,true);
    await fbRoot({["live/"+pin+"/meta"]:{title:String(g.title||"Kahoot").slice(0,100),n:qs.length,state:"lobby",host:shortName(a.user.name),sid},["hostkeys/"+pin]:hk});
    H={pin,sid,g,qs,dur,k:-1,phase:"lobby",scores:{},closed:false,cache:null,t0Local:0,rank:()=>rankOf()};
  }catch{app.innerHTML=`${topbar("Live game","📺","","builder")}<div class="empty">Could not open a live room. Check the internet and try again.</div>`;return}
  H.s=stream("live/"+pin,d=>{H.cache=d;hostPatch()});
  hostRender()}

function hostRender(){if(!H)return;const box=document.getElementById("lv");if(!box)return;const {phase,pin,qs,k}=H;
  if(phase==="lobby"){
    const url=APP_URL+"#j-"+H.pin;
    box.innerHTML=`<div class="card sec lv-join"><div class="lv-big">Join at <b>morcosfady.github.io/heavenly-visions</b> and tap <b>Join a live game</b>, or scan:</div>
      <div class="lv-qr">${window.hvQRsvg(url,260)}</div>
      <div class="tag">Game PIN</div><div class="lv-pin">${esc(pin)}</div></div>
      <div class="card sec"><div class="lv-count" id="lvN">0 players</div><div class="lv-chips" id="lvP"></div></div>
      <button class="btn gold lv-big" id="lvStart" disabled>▶ Start the game</button>
      <button class="btn alt" id="lvClose">Cancel</button>`;
    document.getElementById("lvStart").onclick=()=>ask(0);
    document.getElementById("lvClose").onclick=()=>closeRoom(true);
    hostPatch();return}
  if(phase==="q"){const q=qs[k];
    box.innerHTML=`<div class="stat"><span>Question ${k+1} of ${qs.length}</span><span id="lvA">0 answered</span></div>
      <div class="stage"><div class="bigq">${esc(q.q)}</div><div class="timer"><i id="lvT" style="width:100%"></i></div><div class="scoreline"><span id="lvS">${H.dur}s</span><span></span></div></div>
      <div class="kopts">${q.ch.map((c,i)=>`<div class="kopt k${i}"><span class="sh">${SHAPES[i]}</span>${esc(c)}</div>`).join("")}</div>
      <button class="btn alt" id="lvSkip">Show the answer now</button>`;
    document.getElementById("lvSkip").onclick=()=>reveal();return}
  if(phase==="rev"){const q=qs[k],r=H.rev||{cnt:[]},mx=Math.max(1,...r.cnt);
    const top=H.rank().slice(0,5);
    box.innerHTML=`<div class="stage"><div class="bigq">${esc(q.q)}</div>
      <div class="lv-bars">${q.ch.map((c,i)=>`<div class="lv-bar ${i===q.ok?"ok":""}"><span class="kopt k${i}" style="min-height:0;padding:6px;justify-content:center">${SHAPES[i]}</span><div><i class="k${i}" style="width:${Math.round((r.cnt[i]||0)/mx*100)}%"></i><div class="tag">${esc(c)}</div></div><b>${r.cnt[i]||0}</b></div>`).join("")}</div></div>
      <div class="card sec"><b>🏅 Leaderboard</b>${top.map((p,i)=>`<div class="lv-row"><span>${["🥇","🥈","🥉"][i]||i+1}</span><span>${esc(p.n)}</span><b>${p.s}</b></div>`).join("")||`<div class="tag">Nobody answered.</div>`}</div>
      <button class="btn gold lv-big" id="lvNext">${k+1<qs.length?"Next question →":"🏆 Show the winners"}</button>`;
    document.getElementById("lvNext").onclick=()=>k+1<qs.length?ask(k+1):finish();return}
  if(phase==="end"){const r=H.rank(),top=r.slice(0,3);
    box.innerHTML=`<div class="lv-res"><div class="em">🏆</div><div class="lv-big"><b>${esc(H.g.title||"Game over")}</b></div></div>
      <div class="lv-pod">${[1,0,2].map(i=>top[i]?`<div class="p${i+1}"><div class="m">${["🥇","🥈","🥉"][i]}</div><div class="n">${esc(top[i].n)}</div><div class="lv-pts" style="font-size:1.4rem">${top[i].s}</div></div>`:"<div></div>").join("")}</div>
      <div class="card sec"><b>Everyone</b>${r.map((p,i)=>`<div class="lv-row"><span>${i+1}</span><span>${esc(p.n)}</span><b>${p.s}</b></div>`).join("")}</div>
      <div class="note" id="lvAward">Giving points…</div>
      <button class="btn gold" id="lvClose">Close the room</button>`;
    document.getElementById("lvClose").onclick=()=>closeRoom(false);confetti();return}}

function hostPatch(){if(!H)return;const c=H.cache||{},players=c.players||{},ids=Object.keys(players);
  if(H.phase==="lobby"){const n=document.getElementById("lvN"),p=document.getElementById("lvP"),b=document.getElementById("lvStart");
    if(n)n.textContent=ids.length+(ids.length===1?" player":" players");
    if(p)p.innerHTML=ids.map(id=>`<span class="lv-chip">${esc(players[id].a||"🙂")} ${esc(players[id].n)}</span>`).join("");
    if(b)b.disabled=!ids.length}
  if(H.phase==="q"){const ans=c.ans&&c.ans[H.k]?Object.keys(c.ans[H.k]).length:0,el=document.getElementById("lvA");
    if(el)el.textContent=ans+" of "+ids.length+" answered";
    if(H.cur0&&!H.t0Local&&c.cur&&c.cur.k===H.k&&c.cur.t0){H.t0Local=performance.now();startTimer()}
    if(ans&&ans>=ids.length&&H.t0Local&&!H.revealing)setTimeout(()=>reveal(),700)}}
function startTimer(){const bar=document.getElementById("lvT");
  if(bar){bar.style.transition="width "+H.dur+"s linear";requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.width="0%"}))}
  clearInterval(H.tick);H.tick=setInterval(()=>{if(!H||H.phase!=="q")return clearInterval(H&&H.tick);
    const left=Math.max(0,H.dur-(performance.now()-H.t0Local)/1000),el=document.getElementById("lvS");if(el)el.textContent=Math.ceil(left)+"s";
    if(left<=0&&performance.now()-H.t0Local>(H.dur+1.5)*1000)reveal()},250)}

async function ask(k){if(!H)return;const q=H.qs[k];H.k=k;H.phase="q";H.revealing=false;H.t0Local=0;H.cur0=false;
  hostRender();
  try{await hostWrite(H.pin,{rev:null,cur:{k,text:q.q.slice(0,300),ch:q.ch,dur:H.dur,t0:{".sv":"timestamp"},open:true},"meta/state":"q"});H.cur0=true;hostPatch()}
  catch{toast("Connection problem. Try again.")}}

async function reveal(){if(!H||H.phase!=="q"||H.revealing)return;H.revealing=true;clearInterval(H.tick);const k=H.k,q=H.qs[k];
  try{await hostWrite(H.pin,{"cur/open":false});await sleep(700);
    const [cur,ans]=await Promise.all([fb("live/"+H.pin+"/cur"),fb("live/"+H.pin+"/ans/"+k)]);
    const t0=cur&&cur.t0||0,cnt=q.ch.map(()=>0),pts={};
    Object.keys(ans||{}).forEach(u=>{const a=ans[u];if(!(a.c>=0&&a.c<q.ch.length))return;cnt[a.c]++;
      if(a.c===q.ok){const el=Math.min(H.dur,Math.max(0,(a.t-t0)/1000));const p=Math.round(1000*(1-(el/H.dur)/2));pts[u]=p;H.scores[u]=(H.scores[u]||0)+p}});
    H.rev={k,ok:q.ok,cnt,pts};H.phase="rev";
    await hostWrite(H.pin,{rev:{k,ok:q.ok,cnt,pts},sc:H.scores,"meta/state":"rev"});
    hostRender()}
  catch{toast("Connection problem");H.revealing=false}}

const rankOf=()=>{const pl=(H.cache&&H.cache.players)||{};
  return Object.keys(pl).map(u=>({u,n:pl[u].n,i:pl[u].i,s:H.scores[u]||0})).sort((x,y)=>y.s-x.s)};

async function finish(){if(!H)return;H.phase="end";const r=H.rank();
  try{await hostWrite(H.pin,{fin:{rank:r.slice(0,10).map(p=>({u:p.u,n:p.n,s:p.s}))},"meta/state":"end"})}catch{}
  hostRender();
  const a=acct(),el=()=>document.getElementById("lvAward");
  try{const results=r.filter(p=>p.i).map((p,i)=>({u:p.i,p:r.indexOf(p)+1}));
    const j=await (await fetch(GU(),{method:"POST",body:JSON.stringify({action:"live_finish",id:a.user.id,token:a.token,sid:H.sid,title:H.g.title||"Live game",results})})).json();
    if(el())el().textContent=j.ok?"✅ Points given to "+j.awarded+" students: 1st +50, 2nd +30, 3rd +20, everyone else +10":"Could not give points. Ask the Master."}
  catch{if(el())el().textContent="Could not give points (no internet)."}}

async function closeRoom(back){if(!H)return;const pin=H.pin;
  try{await hostWrite(pin,{meta:null,cur:null,rev:null,sc:null,fin:null,players:null,ans:null})}catch{}
  await cleanKeys(pin);
  stopAll();go(back?"builder":"games")}

/* ================= PLAYER (phone) ================= */
function joinPage(pin){
  stopAll();const a=acct();
  if(!a){app.innerHTML=`${topbar("Join a live game","🎯","You need a profile","games")}${hvGate({scene:"target",title:"Join the class game",lead:"Make a profile so your points are saved.",benefits:[["trophy","Win stars with your class"],["star","Your score is saved"]],primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`;return}
  app.innerHTML=`${topbar("Join a game","🎯","Type the code from your servant or the big screen","games")}
   <form class="card sec" id="jf"><label class="field">Game code<input id="jp" class="lv-pinput" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required autocomplete="off" value="${esc(pin||"")}"></label>
   <button class="btn gold" type="submit">Join</button><div id="jm" class="tag" role="status"></div></form>`;
  const go2=async p=>{const m=document.getElementById("jm");m.textContent="Looking for the game…";
    try{const meta=await fb("live/"+p+"/meta");
      if(!meta||meta.state==="end"){m.innerHTML=`<span class="err">No game found with that PIN.</span>`;return}
      if(meta.kind==="class")return classJoin(p,meta,a);
      const uid=a.user.id;
      const have=await fb("live/"+p+"/players/"+uid);
      if(!have)await playerWrite(p,uid,{["players/"+uid]:{n:shortName(a.user.name),i:uid,a:a.avatar&&a.avatar!=="logo"?a.avatar:"🙂"}});
      play(p,meta)}
    catch{m.innerHTML=`<span class="err">Could not join. Check your internet.</span>`}};
  document.getElementById("jf").onsubmit=e=>{e.preventDefault();go2(document.getElementById("jp").value.trim())};
  if(/^\d{6}$/.test(pin||""))go2(pin)}

function play(pin,meta0){stopAll();const a=acct(),uid=a.user.id;
  P={pin,uid,closed:false,answered:-1,shown:"",tick:0};
  app.innerHTML=`${topbar(esc(meta0.title||"Live game"),"🎯","PIN "+pin,"games")}<div class="lv" id="pv"></div>`;
  P.s=stream("live/"+pin,d=>playRender(d));
  playRender(null)}

function playRender(d){if(!P)return;const box=document.getElementById("pv");if(!box)return;
  d=d||{};const meta=d.meta,cur=d.cur,rev=d.rev,uid=P.uid;
  const sig=JSON.stringify([meta&&meta.state,cur&&cur.k,cur&&cur.open,rev&&rev.k,P.answered]);
  if(P.s&&P.s.get()===null&&!meta){box.innerHTML=`<div class="tag" style="text-align:center">Connecting…</div>`;return}
  if(!meta){clearInterval(P.tick);box.innerHTML=`<div class="lv-res"><div class="em">👋</div><b>The game has ended.</b><button class="btn gold" data-go="games">Back to Games</button></div>`;return}
  if(sig===P.shown)return;P.shown=sig;clearInterval(P.tick);
  if(meta.state==="lobby"){box.innerHTML=`<div class="lv-res"><div class="em">✨</div><div class="lv-big"><b>You are in!</b></div><div class="tag">Look at the big screen. The game will start soon.</div></div>`;return}
  if(meta.state==="q"&&cur&&cur.open){
    if(P.answered===cur.k){box.innerHTML=`<div class="lv-res"><div class="em">✅</div><div class="lv-big"><b>Answer locked in</b></div><div class="tag">Wait for the others…</div></div>`;return}
    const ch=asArr(cur.ch);
    box.innerHTML=`<div class="stat"><span>Question ${cur.k+1} of ${meta.n}</span><span id="pt">${cur.dur}s</span></div>
      <div class="timer"><i id="pb" style="width:100%"></i></div>
      <div class="bigq">${esc(cur.text)}</div>
      <div class="kopts">${ch.map((c,i)=>`<button class="kopt k${i}" data-c="${i}"><span class="sh">${SHAPES[i]}</span>${esc(c)}</button>`).join("")}</div>`;
    const bar=document.getElementById("pb");requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition="width "+cur.dur+"s linear";bar.style.width="0%"}));
    const t0=performance.now();P.tick=setInterval(()=>{const el=document.getElementById("pt");if(el)el.textContent=Math.max(0,Math.ceil(cur.dur-(performance.now()-t0)/1000))+"s"},300);
    box.querySelectorAll("[data-c]").forEach(b=>b.onclick=async()=>{if(P.answered===cur.k)return;const c=+b.dataset.c;P.answered=cur.k;
      box.querySelectorAll("[data-c]").forEach(x=>x.disabled=true);
      try{await playerWrite(P.pin,uid,{["ans/"+cur.k+"/"+uid]:{c,t:{".sv":"timestamp"}}})}
      catch{toast("Too late for that one")}
      playRender(P.s.get())});
    return}
  if((meta.state==="rev"||meta.state==="q")&&rev&&cur&&rev.k===cur.k){
    const ch=asArr(cur.ch),mine=d.ans&&d.ans[cur.k]&&d.ans[cur.k][uid],got=(rev.pts||{})[uid]||0,ok=mine&&mine.c===rev.ok;
    const sc=d.sc||{},order=Object.keys(sc).sort((x,y)=>sc[y]-sc[x]),rank=order.indexOf(uid)+1;
    box.innerHTML=`<div class="lv-res"><div class="em">${ok?"🎉":mine?"😅":"⏰"}</div><div class="lv-big"><b>${ok?"Correct!":mine?"Not this time":"No answer"}</b></div>
      ${ok?`<div class="lv-pts">+${got}</div>`:`<div class="tag">Right answer: ${esc(ch[rev.ok]||"")}</div>`}
      <div class="stat" style="width:100%"><span>Your score: <b>${sc[uid]||0}</b></span><span>${rank?"Place: #"+rank:""}</span></div></div>`;return}
  if(meta.state==="end"){
    const sc=d.sc||{},order=Object.keys(sc).sort((x,y)=>sc[y]-sc[x]),rank=order.indexOf(uid)+1,pts=rank===1?50:rank===2?30:rank===3?20:10;
    box.innerHTML=`<div class="lv-res"><div class="em">${["🥇","🥈","🥉"][rank-1]||"🏅"}</div><div class="lv-big"><b>${rank?"You finished #"+rank:"Game over"}</b></div>
      <div class="lv-pts">+${pts} points</div><div class="tag">Your points will show on your profile.</div><button class="btn gold" data-go="profile">My profile</button></div>`;confetti();return}
  box.innerHTML=`<div class="tag" style="text-align:center">Get ready…</div>`}

/* ================= CLASS GAME (servant starts a published self play game for the whole class) ================= */
const secName=id=>(SECTIONS.find(x=>x.id===id)||{}).name||"";
async function hostClass(gid){
  stopAll();const a=acct();
  const g=(JSON.parse(localStorage.getItem("hv_games")||"[]")).find(x=>x.id===gid);
  if(!a||!g){go("builder");return}
  app.innerHTML=`${topbar("Class game","🚀",esc(g.title||"Game"),"builder")}<div class="lv" id="cv"><div class="tag" style="text-align:center">Getting the game ready…</div></div>`;
  if(!g.pub||g.updated>g.pub){const ok=await window.hvPublish(g,true);if(!ok){go("builder");return}}
  const u=a.user,gr=g.grade||"";
  let code="";
  try{for(let i=0;i<8;i++){const c=String(Math.floor(100000+Math.random()*900000));if(await fb("live/"+c+"/meta")===null){code=c;break}}
    if(!code)throw 0;
    await fbRoot({["live/"+code+"/meta"]:{title:String(g.title||"Game").slice(0,100),n:1,state:"lobby",host:shortName(u.name),kind:"class",gid:gid,grade:gr,church:String(u.church||"").slice(0,60)},["hostkeys/"+code]:hostKey(code,true)});
    C={code,gid,g,gr,church:u.church||"",phase:"lobby",closed:false,cache:null};
  }catch{app.innerHTML=`${topbar("Class game","🚀","","builder")}<div class="empty">Could not open the room. Check the internet and try again.</div>`;return}
  C.s=stream("live/"+code,d=>{C.cache=d;classPatch()});
  classRender()}
function classRender(){if(!C)return;const box=document.getElementById("cv");if(!box)return;
  if(C.phase==="lobby"){
    box.innerHTML=`<div class="card sec lv-join"><div class="tag">Class code. Tell it to your kids.</div><div class="lv-pin">${esc(C.code)}</div>
      <div class="tag">${C.gr?esc(secName(C.gr)):"All classes"}${C.church?" · "+esc(C.church):""}</div></div>
      <div class="card sec"><div class="lv-count" id="cN">0 ready</div><div class="lv-chips" id="cP"></div></div>
      <button class="btn gold lv-big" id="cStart" disabled>▶ Start the game</button>
      <button class="btn alt" id="cClose">Cancel</button>`;
    document.getElementById("cStart").onclick=classStart;
    document.getElementById("cClose").onclick=()=>classClose(true);
    classPatch();return}
  box.innerHTML=`<div class="lv-res"><div class="em">🚀</div><div class="lv-big"><b>The game has started!</b></div></div>
    <div class="card sec"><div class="lv-count" id="cN">0 finished</div><div class="lv-chips" id="cP"></div></div>
    <button class="btn gold" id="cClose">Close the room</button>`;
  document.getElementById("cClose").onclick=()=>classClose(false);classPatch()}
function classPatch(){if(!C)return;const c=C.cache||{},pl=c.players||{},ids=Object.keys(pl),n=document.getElementById("cN"),p=document.getElementById("cP");
  if(C.phase==="lobby"){const b=document.getElementById("cStart");
    if(n)n.textContent=ids.length+" ready";
    if(p)p.innerHTML=ids.map(id=>`<span class="lv-chip">${esc(pl[id].a||"🙂")} ${esc(pl[id].n)}</span>`).join("");
    if(b)b.disabled=!ids.length;return}
  const fin=c.fin&&typeof c.fin==="object"?Object.keys(c.fin):[];
  if(n)n.textContent=fin.length+" of "+ids.length+" finished";
  if(p)p.innerHTML=ids.map(id=>`<span class="lv-chip">${fin.includes(id)?"✅":"⏳"} ${esc(pl[id].n)}</span>`).join("")}
async function classStart(){if(!C)return;const b=document.getElementById("cStart");if(b)b.disabled=true;
  try{await hostWrite(C.code,{"meta/state":"go"});C.phase="go";classRender()}
  catch{toast("Connection problem. Try again.");if(b)b.disabled=false}}
async function classClose(back){if(!C)return;const code=C.code;
  try{await hostWrite(code,{meta:null,fin:null,players:null})}catch{}
  await cleanKeys(code);
  stopAll();go(back?"builder":"games")}

function classJoin(code,meta,a){stopAll();const u=a.user,staff=u.role!=="student",uid=u.id;
  const deny=t=>{app.innerHTML=`${topbar("Class game","🚀","","games")}<div class="lv-res"><div class="em">🙈</div><b>${esc(t)}</b><button class="btn gold" data-go="games">Back to Games</button></div>`};
  if(!staff){
    if(meta.church&&u.church!==meta.church)return deny("This game is for "+meta.church+".");
    if(meta.grade&&secName(meta.grade)!==u.grade)return deny("This game is for "+secName(meta.grade)+".")}
  if(meta.state==="go"){app.innerHTML=`${topbar(esc(meta.title||"Class game"),"🚀","Already started","games")}<div class="lv-res"><div class="em">⏰</div><b>This game already started.</b><button class="btn gold" id="late">▶ Play anyway</button></div>`;
    document.getElementById("late").onclick=()=>{window.hvClass={code,uid,gid:meta.gid};go("gplay-"+meta.gid)};return}
  W={code,uid,meta,closed:false,tick:0,started:false};
  app.innerHTML=`${topbar(esc(meta.title||"Class game"),"🚀","Class game","games")}<div class="lv" id="wv"></div>`;
  const draw=ready=>{const box=document.getElementById("wv");if(!box||!W)return;
    box.innerHTML=ready?`<div class="lv-res"><div class="em">✅</div><div class="lv-big"><b>You are ready!</b></div><div class="tag">Wait for your servant to start the game.</div><button class="btn alt" id="nr">↩️ Not ready yet</button></div>`
      :`<div class="lv-res"><div class="em">🎮</div><div class="lv-big"><b>${esc(meta.title||"Game")}</b></div><div class="tag">Tap when you are ready. Your servant starts the game for everyone.</div><button class="btn gold lv-big" id="rd">✅ I'm ready</button></div>`;
    const rd=document.getElementById("rd"),nr=document.getElementById("nr");
    if(rd)rd.onclick=async()=>{rd.disabled=true;
      try{await playerWrite(code,uid,{["players/"+uid]:{n:shortName(u.name),i:uid,a:a.avatar&&a.avatar!=="logo"?a.avatar:"🙂"}});draw(true)}
      catch{toast("Could not get ready. Try again.");rd.disabled=false}};
    if(nr)nr.onclick=async()=>{try{await playerWrite(code,uid,{["players/"+uid]:null})}catch{}draw(false)}};
  draw(false);
  W.s=stream("live/"+code,d=>{if(!W||W.started)return;const box=document.getElementById("wv");if(!box)return;
    if(!d||!d.meta){box.innerHTML=`<div class="lv-res"><div class="em">👋</div><b>The room was closed.</b><button class="btn gold" data-go="games">Back to Games</button></div>`;return}
    if(d.meta.state==="go"){W.started=true;let n=3;box.innerHTML=`<div class="lv-res"><div class="tag">Get ready…</div><div class="lv-pts" style="font-size:6rem" id="cd">3</div></div>`;
      W.tick=setInterval(()=>{n--;const el=document.getElementById("cd");if(n<=0){clearInterval(W.tick);window.hvClass={code,uid,gid:meta.gid};go("gplay-"+meta.gid);return}if(el)el.textContent=n},1000)}})}
window.hvClassDone=function(g){const c=window.hvClass;if(!c||c.gid!==g.id)return;
  playerWrite(c.code,c.uid,{["fin/"+c.uid]:true}).catch(()=>{});window.hvClass=null};

/* ---------- routes ---------- */
window.liveRoute=function(h){
  if(h==="join"){joinPage("");return true}
  if(h.startsWith("j-")){joinPage(h.slice(2));return true}
  if(h.startsWith("cls-")){if(window.hvLock&&hvLock())return true;hostClass(h.slice(4));return true}
  if(h.startsWith("live-")){if(window.hvLock&&hvLock())return true;host(h.slice(5));return true}
  return false};
})();
