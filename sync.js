/* Heavenly Visions: saves a person's data online so a new phone gets it back after login.
   Synced: attended days, quiz stars, Bible text size / version / place, picture, and servant game drafts (without pictures). */
(function(){
const KEYS=["attended","best","fs","tr","lastRead"];
const GU=()=>window.GAMES_URL||"";
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const acct=()=>lsGet("hv_acct");
async function api(b){const r=await fetch(GU(),{method:"POST",body:JSON.stringify(b)});return r.json()}

function stripImages(g){const c=JSON.parse(JSON.stringify(g));let cut=false;
  (c.items||[]).forEach(it=>Object.keys(it).forEach(k=>{if(typeof it[k]==="string"&&it[k].startsWith("data:")){it[k]="";cut=true}}));
  if(cut)c.noimg=true;return c}
function localPrefs(a){const p={};KEYS.forEach(k=>{const v=lsGet("hv_"+k);if(v!=null)p[k]=v});if(a&&a.avatar)p.avatar=a.avatar;return p}
function localDrafts(){return (lsGet("hv_games")||[]).filter(g=>g.status!=="x").map(stripImages)}

async function push(){const a=acct();if(!a||!GU())return;
  try{const j=await api({action:"sync_set",id:a.user.id,token:a.token,prefs:localPrefs(a),drafts:localDrafts()});
    if(!j.ok&&j.error==="full"&&window.toast)toast("Online backup is full. Use fewer drafts.")}catch{}}
let timer=0;
window.hvSyncSoon=function(){clearTimeout(timer);timer=setTimeout(push,4000)};

window.hvSyncPull=async function(){const a=acct();if(!a||!GU())return;
  let j;try{j=await api({action:"sync_get",id:a.user.id,token:a.token})}catch{return}
  if(!j||!j.ok)return;const rp=j.prefs||{};
  if(rp.attended){lsSet("hv_attended",[...new Set([...(lsGet("hv_attended")||[]),...rp.attended])])}
  if(rp.best){const b=lsGet("hv_best")||{};Object.keys(rp.best).forEach(k=>{b[k]=Math.max(b[k]||0,rp.best[k])});lsSet("hv_best",b)}
  ["fs","tr","lastRead"].forEach(k=>{if(rp[k]!=null&&lsGet("hv_"+k)==null)lsSet("hv_"+k,rp[k])});
  if(rp.avatar){let m=lsGet("hv_avmap")||{};if(!m[a.user.id]){m[a.user.id]=rp.avatar;lsSet("hv_avmap",m);a.avatar=rp.avatar;lsSet("hv_acct",a)}}
  if(!lsGet("hv_me")&&a.user.name)lsSet("hv_me",{name:a.user.name,grade:a.user.grade||""});
  const local=lsGet("hv_games")||[];let changed=false;
  (j.drafts||[]).forEach(rg=>{const i=local.findIndex(x=>x.id===rg.id);
    if(i<0){local.push(rg);changed=true;return}
    if((rg.updated||0)>(local[i].updated||0)){const lg=local[i];(rg.items||[]).forEach((it,n)=>{const li=(lg.items||[])[n]||{};Object.keys(li).forEach(k=>{if(!it[k]&&typeof li[k]==="string"&&li[k].startsWith("data:"))it[k]=li[k]})});local[i]=rg;changed=true}});
  if(changed){local.sort((x,y)=>(y.updated||0)-(x.updated||0));lsSet("hv_games",local)}
  push()};

if(acct())setTimeout(()=>window.hvSyncPull(),1500);
})();
