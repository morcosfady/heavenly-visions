/* Tests firebase/database.rules.json against the real Firebase Realtime Database emulator.
   Start the emulator first (needs Java), with firebase.json pointing at firebase/database.rules.json:
     firebase emulators:start --only database --project demo-hv
   Then run:  node tests/rules-test.js
   Uses plain REST calls, the same request shapes as live.js. */
const BASE=process.env.DB||"http://127.0.0.1:9000";
const NS="?ns=demo-hv-default-rtdb";
let pass=0,fail=0;

async function call(method,path,body){
  const r=await fetch(BASE+"/"+path+".json"+NS,{method,body:body===undefined?undefined:JSON.stringify(body)});
  let data=null;try{data=await r.json()}catch{}
  return {ok:r.ok,status:r.status,data}}
const patch=body=>call("PATCH","",body);
const tok=()=>require("crypto").randomBytes(18).toString("hex");

function check(name,res,shouldWork){
  const good=res.ok===shouldWork;
  if(good)pass++;else fail++;
  console.log((good?"PASS ":"FAIL ")+name+(good?"":"  (got status "+res.status+")"))}

const meta=n=>({title:"Test",n:n||2,state:"lobby",host:"Fady"});
const curOf=(k,open)=>({k,text:"Question "+k,ch:["a","b","c"],dur:20,t0:{".sv":"timestamp"},open:open!==false});
const ts={".sv":"timestamp"};

/* same shapes as hostWrite and playerWrite in live.js */
const hostWrite=async(pin,hk,updates)=>{
  const body={};Object.keys(updates).forEach(k=>body["live/"+pin+"/"+k]=updates[k]);
  body["hs/"+pin]=hk;
  let r=await patch(body);
  if(!r.ok){await call("DELETE","hs/"+pin);r=await patch(body)}
  await call("DELETE","hs/"+pin);return r};
const playerWrite=async(pin,uid,pk,updates)=>{
  const body={};Object.keys(updates).forEach(k=>body["live/"+pin+"/"+k]=updates[k]);
  body["pk/"+pin+"/"+uid]=pk;body["ps/"+pin+"/"+uid]=pk;
  let r=await patch(body);
  if(!r.ok){await call("DELETE","ps/"+pin+"/"+uid);r=await patch(body)}
  await call("DELETE","ps/"+pin+"/"+uid);return r};

(async()=>{
  await call("DELETE","");
  const pin="123456",hk=tok(),bad=tok();

  console.log("-- host creates the game");
  check("host creates game (meta + hostkeys)",await patch({["live/"+pin+"/meta"]:meta(),["hostkeys/"+pin]:hk}),true);
  check("anyone can read the room",await call("GET","live/"+pin),true);
  check("hostkeys is not readable",await call("GET","hostkeys/"+pin),false);
  check("hostkeys root is not readable",await call("GET","hostkeys"),false);
  check("hs is not readable",await call("GET","hs"),false);
  check("pk is not readable",await call("GET","pk/"+pin),false);
  const room=await call("GET","live/"+pin);
  check("room data has no secret in it",{ok:!JSON.stringify(room.data).includes(hk)},true);

  console.log("-- attacker who knows only the PIN");
  check("overwrite meta",await call("PUT","live/"+pin+"/meta",meta(5)),false);
  check("overwrite meta/state",await call("PUT","live/"+pin+"/meta/state","end"),false);
  check("overwrite cur",await call("PUT","live/"+pin+"/cur",curOf(0)),false);
  check("write rev",await call("PUT","live/"+pin+"/rev",{k:0,ok:0,cnt:[1],pts:{}}),false);
  check("write sc",await call("PUT","live/"+pin+"/sc",{u1:99999}),false);
  check("write fin",await call("PUT","live/"+pin+"/fin",{rank:[{u:"x",n:"x",s:1}]}),false);
  check("delete the whole room",await call("DELETE","live/"+pin),false);
  check("delete players",await call("DELETE","live/"+pin+"/players"),false);
  check("delete ans",await call("DELETE","live/"+pin+"/ans"),false);
  check("multi-path update with a wrong secret",await patch({["live/"+pin+"/cur"]:curOf(0),["hs/"+pin]:bad}),false);
  check("multi-path update with no secret",await patch({["live/"+pin+"/cur"]:curOf(0)}),false);
  check("take over hostkeys",await patch({["hostkeys/"+pin]:bad,["hs/"+pin]:bad,["live/"+pin+"/cur"]:curOf(0)}),false);
  check("create meta again over a live game",await patch({["live/"+pin+"/meta"]:meta(9),["hostkeys/"+pin]:bad}),false);
  check("write hostkeys alone",await call("PUT","hostkeys/"+pin,bad),false);

  console.log("-- host runs the game");
  check("host sends the first question",await hostWrite(pin,hk,{rev:null,cur:curOf(0),"meta/state":"q"}),true);
  check("meta state is q",{ok:(await call("GET","live/"+pin+"/meta/state")).data==="q"},true);
  check("hs was cleaned up",{ok:(await call("GET","live/"+pin+"/hs")).data===null},true);

  console.log("-- stale proof left behind by a host write");
  check("host write that leaves the proof behind",await patch({["live/"+pin+"/cur/open"]:true,["hs/"+pin]:hk}),true);
  check("attacker can not ride the leftover proof",await patch({["live/"+pin+"/cur/open"]:false}),false);
  check("attacker can not ride it with a rewrite either",await patch({["live/"+pin+"/cur/open"]:false,["hs/"+pin]:hk}),false);
  await call("DELETE","hs/"+pin);

  console.log("-- players");
  const u1="u1",u2="u2",p1=tok(),p2=tok();
  check("player 1 joins",await playerWrite(pin,u1,p1,{["players/"+u1]:{n:"Mina",i:u1,a:"x"}}),true);
  check("player 2 joins",await playerWrite(pin,u2,p2,{["players/"+u2]:{n:"Mark",i:u2,a:"y"}}),true);
  check("player with an extra field refused",await playerWrite(pin,"u3",tok(),{"players/u3":{n:"Bad",evil:"x"}}),false);
  check("player 1 can not overwrite player 2 node",await playerWrite(pin,u1,p1,{["players/"+u2]:{n:"Hacked"}}),false);
  check("attacker with no key can not delete a player",await call("DELETE","live/"+pin+"/players/"+u1),false);
  check("player 1 answers",await playerWrite(pin,u1,p1,{["ans/0/"+u1]:{c:1,t:ts}}),true);
  check("player 1 answers again (overwrite refused)",await playerWrite(pin,u1,p1,{["ans/0/"+u1]:{c:2,t:ts}}),false);
  check("attacker writes player 2 answer with no key",await call("PUT","live/"+pin+"/ans/0/"+u2,{c:0,t:ts}),false);
  check("player 1 writes player 2 answer using own key",await playerWrite(pin,u2,p1,{["ans/0/"+u2]:{c:0,t:ts}}),false);
  check("player 1 proof sent for player 2 answer",await patch({["live/"+pin+"/ans/0/"+u2]:{c:0,t:ts},["ps/"+pin+"/"+u2]:p1}),false);
  check("answer for the wrong question number",await playerWrite(pin,u2,p2,{["ans/5/"+u2]:{c:0,t:ts}}),false);
  check("answer with choice 9",await playerWrite(pin,u2,p2,{["ans/0/"+u2]:{c:9,t:ts}}),false);
  check("answer with a fake time",await playerWrite(pin,u2,p2,{["ans/0/"+u2]:{c:1,t:123}}),false);
  check("player 2 answers",await playerWrite(pin,u2,p2,{["ans/0/"+u2]:{c:0,t:ts}}),true);
  check("player can not write cur",await playerWrite(pin,u1,p1,{cur:curOf(7)}),false);
  check("player can not write sc",await playerWrite(pin,u1,p1,{sc:{[u1]:99999}}),false);
  check("player can not write rev",await playerWrite(pin,u1,p1,{rev:{k:0,ok:1,cnt:[1],pts:{}}}),false);

  console.log("-- reveal, next question, finish");
  check("host closes the question",await hostWrite(pin,hk,{"cur/open":false}),true);
  check("late player joins",await playerWrite(pin,"u4",tok(),{"players/u4":{n:"Late"}}),true);
  const p4=tok();
  check("answer after the question closed is refused",await playerWrite(pin,u1,p1,{["ans/0/late"]:{c:0,t:ts}}),false);
  check("host reveals",await hostWrite(pin,hk,{rev:{k:0,ok:1,cnt:[1,1,0],pts:{[u1]:900}},sc:{[u1]:900,[u2]:0},"meta/state":"rev"}),true);
  check("host asks question 2",await hostWrite(pin,hk,{rev:null,cur:curOf(1),"meta/state":"q"}),true);
  check("player 1 answers question 2",await playerWrite(pin,u1,p1,{["ans/1/"+u1]:{c:0,t:ts}}),true);
  check("host finishes",await hostWrite(pin,hk,{fin:{rank:[{u:u1,n:"Mina",s:900}]},"meta/state":"end"}),true);

  console.log("-- class game (players write fin/uid)");
  const cp="654321",chk=tok();
  check("host creates class room",await patch({["live/"+cp+"/meta"]:{title:"C",n:1,state:"lobby",host:"F",kind:"class",gid:"g1",grade:"",church:"St"},["hostkeys/"+cp]:chk}),true);
  check("student gets ready",await playerWrite(cp,u1,p1,{["players/"+u1]:{n:"Mina",i:u1,a:"x"}}),true);
  check("host starts class",await hostWrite(cp,chk,{"meta/state":"go"}),true);
  check("student marks finished",await playerWrite(cp,u1,p1,{["fin/"+u1]:true}),true);
  check("someone else marks u1 finished (no key)",await call("PUT","live/"+cp+"/fin/"+u1,true),false);
  check("student writes fin with a non true value",await playerWrite(cp,u1,p1,{["fin/"+u1]:{x:1}}),false);
  check("student writes another student fin",await playerWrite(cp,u1,p1,{["fin/"+u2]:true}),false);
  check("late student with no player node marks finished",await playerWrite(cp,"u9",tok(),{"fin/u9":true}),true);
  check("student leaves (not ready)",await playerWrite(cp,u1,p1,{["players/"+u1]:null}),true);
  check("student comes back ready again",await playerWrite(cp,u1,p1,{["players/"+u1]:{n:"Mina",i:u1,a:"x"}}),true);

  console.log("-- close");
  check("attacker can not delete hostkeys while the game is open",await call("DELETE","hostkeys/"+pin),false);
  check("host closes the room",await hostWrite(pin,hk,{meta:null,cur:null,rev:null,sc:null,fin:null,players:null,ans:null}),true);
  check("room is gone",{ok:(await call("GET","live/"+pin)).data===null},true);
  check("hostkeys cleanup after close",await call("DELETE","hostkeys/"+pin),true);
  check("pk cleanup after close",await call("DELETE","pk/"+pin),true);
  check("ps cleanup after close",await call("DELETE","ps/"+pin),true);

  console.log("\n"+pass+" passed, "+fail+" failed");
  process.exit(fail?1:0)})();
