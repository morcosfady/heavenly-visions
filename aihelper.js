/* Heavenly Visions: AI Lesson Helper (servants). Asks the separate AI helper script for game content, then saves everything
   as DRAFTS in the Game Builder (never published). The key never touches this app: it lives in the helper script.
   While AI_URL is empty the page explains that the helper is not set up yet. */
(function(){
const AI_URL_LIVE="";   /* paste the web app URL of apps-script/ai-helper.gs here (setup steps are at the top of that file) */
const AI_URL=(()=>{try{const q=new URLSearchParams(location.search).get("ai");if(q&&location.hostname==="localhost")return q}catch{}return AI_URL_LIVE})();
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const A=()=>window.hvAcct&&hvAcct();
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const KINDS=[["kahoot","🏆","Kahoot quiz",6],["whoami","🕵️","Who Am I?",3],["order","📜","Story order",5],["verse","✍️","Verse builder",2],["wordsearch","🔍","Word search",8],["match","🃏","Matching pairs",6],["hangman","🪔","Guess the word",6],["crossword","➕","Crossword",7],["wheel","🎡","Wheel spin",8],["jeopardy","🟦","Jeopardy",1]];
const MSG={limit:"You used all your AI helps for today. Come back tomorrow.",busy:"The helper is busy today. Try again tomorrow.",nokey:"The helper is not finished being set up. Tell the app owner.",ai:"The helper could not write this one. Try again in a minute.",denied:"The helper is for approved servants only.",missing:"Type a topic or paste the lesson text, and pick at least one game."};
const S={sel:{kahoot:true,verse:true,wordsearch:true}};
const gradeId=g=>{const s=(typeof SECTIONS!=="undefined"?SECTIONS:[]).find(x=>x.name===g);return s?s.id:""};

window.hvAiTool=function(){return `<button class="svt" style="--tc:var(--c-kids)" data-go="ai"><span>✨</span><b>AI Helper</b><small>Make games fast</small></button>`};

function page(){
  if(window.hvLock&&hvLock())return;
  const a=A();if(!a||a.user.role==="student"||a.user.req){app.innerHTML=`${topbar("AI Lesson Helper","✨","Servants only","servants")}<div class="empty">This is for approved servants.</div>`;return}
  if(!AI_URL){app.innerHTML=`${topbar("AI Lesson Helper","✨","Make game drafts from a topic","servants")}<div class="soonbox" style="--sc:var(--c-kids)"><div class="em" aria-hidden="true">✨</div><span class="chipsoon">Not set up yet</span><p style="margin:0;font-weight:700">The AI helper needs the app owner to add a key once. After that you type a topic and get ready game drafts.</p></div>`;return}
  const grades=typeof GRADES!=="undefined"?GRADES:[];
  app.innerHTML=`${topbar("AI Lesson Helper","✨","Make game drafts from a topic","servants")}
  <div class="note">✨ The helper writes drafts. <b>Please review before using.</b> Nothing is shown to kids until you mark a game ready and publish it.</div>
  <form class="card sec" id="aif"><label class="field">Topic<input id="ait" maxlength="120" placeholder="Example: Noah and the ark"></label>
   <label class="field">Lesson text (optional, the helper will only use this)<textarea id="aix" rows="5" maxlength="3000" class="as-search" placeholder="Paste the lesson text here"></textarea></label>
   <label class="field">Class<select id="aig">${grades.map(g=>`<option ${g===a.user.grade?"selected":""}>${g}</option>`).join("")}</select></label>
   <div class="field"><span>Games to make</span><div class="ds-chips" id="aik">${KINDS.map(k=>`<button type="button" class="ds-chip" data-k="${k[0]}" aria-pressed="${!!S.sel[k[0]]}">${k[1]} ${k[2]}</button>`).join("")}</div></div>
   <button class="btn gold" type="submit" id="aigo">✨ Generate</button><div id="aimsg" role="status" class="tag"></div></form><div id="aiout" class="sec"></div>`;
  document.getElementById("aik").onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k;S.sel[k]=!S.sel[k];b.setAttribute("aria-pressed",!!S.sel[k])};
  document.getElementById("aif").onsubmit=async e=>{e.preventDefault();
    const topic=document.getElementById("ait").value.trim(),text=document.getElementById("aix").value.trim(),msg=document.getElementById("aimsg"),out=document.getElementById("aiout");
    const kinds=KINDS.filter(k=>S.sel[k[0]]).map(k=>({kind:k[0],n:k[3]}));
    if((!topic&&!text)||!kinds.length){msg.innerHTML=`<span class="err">${MSG.missing}</span>`;return}
    const btn=document.getElementById("aigo");btn.disabled=true;msg.textContent="";
    out.innerHTML=`<div class="aishim" role="status"><span>✨</span> Writing your games...</div>${kinds.map(()=>`<div class="ds-skel" style="height:70px"></div>`).join("")}`;
    try{const r=await (await fetch(AI_URL,{method:"POST",body:JSON.stringify({id:a.user.id,token:a.token,topic,text,grade:document.getElementById("aig").value,kinds})})).json();
      if(!r.ok){out.innerHTML="";msg.innerHTML=`<span class="err">${MSG[r.error]||MSG.ai}</span>`;btn.disabled=false;return}
      const gid=gradeId(document.getElementById("aig").value),list=jget("hv_games",[]),made=[];
      r.games.forEach(g=>{const game={id:uid(),t:g.t,title:g.title,grade:gid,lesson:"",status:"draft",data:{},items:g.items,ai:true,updated:Date.now()};
        if(g.t==="kahoot")game.data.timer="20";if(g.t==="wordsearch")game.data.size="10";if(g.t==="jeopardy")game.data.teams="2";if(g.t==="wheel")game.data.kind="q";
        list.unshift(game);made.push(game)});
      try{localStorage.setItem("hv_games",JSON.stringify(list));if(window.hvSyncSoon)hvSyncSoon()}catch{out.innerHTML="";msg.innerHTML=`<span class="err">Phone storage is full. Delete some old games first.</span>`;btn.disabled=false;return}
      out.innerHTML=`<h2>Your drafts</h2><div class="tag">${r.left} AI helps left today. Please review every game before you use it.</div>`;
      made.forEach((g,i)=>setTimeout(()=>{const d=document.createElement("div");d.className="card aigame";const t=(KINDS.find(k=>k[0]===g.t)||["","🎮",g.t]);
        d.innerHTML=`<div class="aigh"><span>${t[1]}</span><b>${E(g.title)}</b></div><div class="tag">${t[2]} · ${g.items.length} ${g.items.length===1?"item":"items"} · 📝 Draft</div><div class="aipre">${E(prev(g))}</div><div class="spl" style="--sc:#e8794a">Please review before using</div><button class="btn alt" data-go="bedit-${g.id}">✏️ Review and edit</button>`;
        document.getElementById("aiout").appendChild(d);d.scrollIntoView({block:"nearest",behavior:"smooth"})},i*450));
      setTimeout(()=>{const b2=document.createElement("button");b2.className="btn gold";b2.dataset.go="builder";b2.textContent="🛠️ Open the Game Builder";document.getElementById("aiout")?.appendChild(b2)},made.length*450+200);
      if(!made.length)out.innerHTML=`<span class="err">${MSG.ai}</span>`;btn.disabled=false}
    catch{out.innerHTML="";msg.innerHTML=`<span class="err">No internet connection.</span>`;btn.disabled=false}}}
function prev(g){const it=g.items[0]||{};return it.q||it.text||it.ans||it.w||it.l||it.name||""}

window.aiRoute=function(h){if(h==="ai"){page();return true}return false};
const st=document.createElement("style");
st.textContent=`.aishim{display:flex;align-items:center;gap:8px;font-weight:900;padding:10px 14px;border-radius:14px;background:linear-gradient(90deg,var(--gold-soft),transparent,var(--gold-soft));background-size:200% 100%;animation:dsshim 1.6s linear infinite}.aishim span{animation:floaty 2s ease-in-out infinite}
.aigame{display:flex;flex-direction:column;gap:6px;animation:rise .4s cubic-bezier(.2,.8,.2,1) both}.aigh{display:flex;gap:8px;align-items:center;font-family:var(--display);font-size:var(--fs-l)}.aipre{font-weight:700;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.aishim,.aishim span,.aigame{animation:none}}`;
document.head.appendChild(st);
})();
