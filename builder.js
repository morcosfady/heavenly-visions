/* Heavenly Visions: Game Builder (servant view).
   Servants pick a template, fill a form, preview the game, and mark it Ready.
   Games are saved on this device (localStorage key hv_games); the student view will read Ready games later. */

(function(){
/* ---------- styles ---------- */
const css=`
.gb-sec{display:flex;flex-direction:column;gap:10px}
.gb-head{display:flex;align-items:center;gap:10px}
.gb-head h2{flex:1}
.pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 10px;font-weight:900;font-size:.78rem;white-space:nowrap}
.pill.live{background:#fde3d6;color:#a63d17}.pill.self{background:#d8f1e2;color:#1f7a48}
.pill.ready{background:#d8f1e2;color:#1f7a48}.pill.draft{background:var(--gold-soft);color:#7a5414}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .pill.live{background:#4a2516;color:#ffb995}:root:not([data-theme="light"]) .pill.self,:root:not([data-theme="light"]) .pill.ready{background:#173a28;color:#8fe0b0}:root:not([data-theme="light"]) .pill.draft{color:#f1d08a}}
:root[data-theme="dark"] .pill.live{background:#4a2516;color:#ffb995}:root[data-theme="dark"] .pill.self,:root[data-theme="dark"] .pill.ready{background:#173a28;color:#8fe0b0}:root[data-theme="dark"] .pill.draft{color:#f1d08a}
.gt{min-height:118px}.gt .ct{line-height:1.3}
.mygame{display:grid;grid-template-columns:44px 1fr;gap:10px;align-items:center;background:var(--surface);border-radius:18px;padding:12px;box-shadow:var(--shadow)}
.mygame .gi{font-size:1.8rem;text-align:center}
.mygame .gt2{font-weight:900;line-height:1.2;min-width:0;overflow-wrap:anywhere}
.mygame .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;align-items:center}
.mygame .acts{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.mini{border:1px solid var(--line);background:var(--bg);border-radius:12px;padding:8px 4px;font-weight:800;font-size:.85rem}
.mini.danger{color:var(--bad)}
.filters{display:flex;gap:6px;flex-wrap:wrap}
.filters button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px;font-weight:800;font-size:.85rem}
.filters button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.field textarea{border:1.5px solid var(--line);background:var(--bg);border-radius:14px;padding:12px 14px;width:100%;font:inherit;color:inherit;resize:vertical;min-height:84px}
.field textarea:focus{border-color:var(--sky);outline:none}
.field small{font-weight:700;color:var(--muted)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.two .full{grid-column:1/-1}
.item{background:var(--surface);border-radius:18px;padding:14px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px;border-left:5px solid var(--c,var(--gold))}
.item-h{display:flex;align-items:center;gap:6px}
.item-h b{flex:1;font-family:var(--display)}
.icon-btn{border:1px solid var(--line);background:var(--bg);border-radius:10px;width:36px;height:34px;font-weight:900}
.icon-btn:disabled{opacity:.3}
.add{border:2px dashed var(--line);background:transparent;border-radius:18px;padding:14px;font-weight:900;color:var(--sky)}
.savebar{position:sticky;bottom:0;z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 0 calc(6px + env(safe-area-inset-bottom,0px));background:linear-gradient(transparent,var(--bg) 22%)}
.saved{font-size:.8rem;font-weight:800;color:var(--muted);text-align:center}
.probs{background:color-mix(in srgb,var(--bad) 12%,var(--surface));border-radius:16px;padding:12px 16px;font-weight:700}
.probs ul{margin:6px 0 0;padding-left:20px}
.imgprev{width:100%;max-height:200px;object-fit:contain;border-radius:12px;background:var(--bg)}
.hint{font-weight:700;color:var(--muted);font-size:.88rem;margin:0}
/* players */
.stage{background:var(--surface);border-radius:22px;padding:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:14px}
.bigq{font-size:clamp(1.25rem,4.5vw,1.9rem);font-weight:900;text-align:center;line-height:1.3;overflow-wrap:anywhere}
.timer{height:10px;border-radius:10px;background:var(--line);overflow:hidden}.timer i{display:block;height:100%;background:var(--gold)}
.kopts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kopt{border:0;border-radius:16px;min-height:86px;padding:12px;color:#fff;font-weight:900;font-size:1.05rem;display:flex;align-items:center;gap:10px;text-align:left;box-shadow:var(--shadow);overflow-wrap:anywhere}
.kopt .sh{font-size:1.4rem;flex:none}
.k0{background:#d64545}.k1{background:#2f6fd0}.k2{background:#d19a12}.k3{background:#2e9b5b}
.kopt.dim{opacity:.3}.kopt.win{outline:5px solid #fff;box-shadow:0 0 0 8px var(--good)}
.scoreline{display:flex;justify-content:space-between;font-weight:900;font-variant-numeric:tabular-nums}
.clues{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.clues li{background:var(--sky-soft);border-radius:14px;padding:12px 14px;font-weight:800;animation:pop .35s ease}
@keyframes pop{from{transform:scale(.92);opacity:0}}
.reveal{font-family:var(--display);font-size:1.8rem;text-align:center;color:var(--good)}
.board{display:grid;gap:6px}
.board .cat{background:#1d3f8f;color:#fff;border-radius:10px;padding:8px 4px;font-weight:900;font-size:.8rem;text-align:center;display:grid;place-items:center;min-height:52px;overflow-wrap:anywhere}
.board .sq{border:0;background:#2f6fd0;color:#ffd75e;border-radius:10px;font-weight:900;font-size:1.2rem;min-height:56px;font-variant-numeric:tabular-nums}
.board .sq:disabled{background:var(--line);color:transparent}
.teams{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.team{background:var(--surface);border-radius:14px;padding:10px;text-align:center;box-shadow:var(--shadow)}
.team b{display:block;font-size:1.5rem;font-variant-numeric:tabular-nums}
.wheelbox{position:relative;width:min(340px,86vw);aspect-ratio:1;margin:0 auto}
.wheelbox canvas{width:100%;height:100%}
.wheelbox .ptr{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-top:28px solid var(--ink);filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}
.chk{display:flex;align-items:center;gap:8px;font-weight:800}
.chk input{width:22px;height:22px}
.olist{display:flex;flex-direction:column;gap:8px}
.ochip{border:2px solid var(--line);background:var(--bg);border-radius:14px;padding:12px;text-align:left;font-weight:800;display:flex;gap:10px;align-items:center}
.ochip .n{flex:none;width:28px;height:28px;border-radius:50%;background:var(--gold);color:#fff;display:grid;place-items:center;font-size:.85rem}
.ochip.right{border-color:var(--good)}.ochip.wrong{border-color:var(--bad)}
.vtext{font-size:1.25rem;font-weight:800;line-height:2.1;text-align:center}
.blank{display:inline-block;min-width:80px;border:0;border-bottom:3px solid var(--gold);background:var(--gold-soft);border-radius:8px 8px 0 0;padding:0 8px;margin:0 2px;font-weight:900;line-height:1.6}
.blank.right{background:color-mix(in srgb,var(--good) 25%,transparent);border-color:var(--good)}.blank.wrong{background:color-mix(in srgb,var(--bad) 22%,transparent);border-color:var(--bad)}
.bank{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.wbtn{border:0;background:var(--sky);color:#fff;border-radius:12px;padding:10px 14px;font-weight:900}
.wbtn:disabled{opacity:.25}
.ws{display:grid;gap:3px;user-select:none;touch-action:manipulation;margin:0 auto;width:100%;max-width:520px}
.ws button{aspect-ratio:1;border:0;border-radius:6px;background:var(--bg);font-weight:900;font-size:clamp(.8rem,3.6vw,1.2rem);padding:0;color:var(--ink)}
.ws button.sel{background:var(--gold);color:#fff}
.ws button.f0{background:#f7c6c6;color:#222}.ws button.f1{background:#c6dcf7;color:#222}.ws button.f2{background:#f7e3b0;color:#222}.ws button.f3{background:#c9efd6;color:#222}.ws button.f4{background:#e1d2f7;color:#222}
.wlist{display:flex;flex-wrap:wrap;gap:8px}
.wlist span{background:var(--bg);border-radius:999px;padding:5px 12px;font-weight:900;font-size:.9rem}
.wlist span.done{text-decoration:line-through;opacity:.5}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.mcard{border:0;border-radius:14px;min-height:96px;padding:8px;background:linear-gradient(140deg,var(--sky),#1d5f8f);color:#fff;font-weight:900;font-size:.9rem;box-shadow:var(--shadow);overflow-wrap:anywhere}
.mcard.open{background:var(--bg);color:var(--ink);outline:2px solid var(--sky)}
.mcard.got{background:color-mix(in srgb,var(--good) 22%,var(--bg));color:var(--ink);outline:2px solid var(--good)}
.mcard.side1.open,.mcard.side1.got{font-weight:700}
.hword{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.hword span{width:34px;height:44px;border-bottom:4px solid var(--ink);display:grid;place-items:end center;font-size:1.5rem;font-weight:900}
.hword span.sp{border:0;width:16px}
.lamp{text-align:center;font-size:2.4rem;letter-spacing:.05em}
.keys{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:6px}
.keys button{border:0;border-radius:10px;padding:10px 0;font-weight:900;background:var(--gold);color:#fff}
.keys button:disabled{opacity:.25}
.keys button.no{background:var(--bad)}.keys button.yes{background:var(--good)}
.cw{display:grid;gap:2px;margin:0 auto;width:max-content;max-width:100%}
.cw div{width:var(--cs);height:var(--cs);position:relative}
.cw .cell{background:#fff;border:1.5px solid #333;border-radius:3px}
.cw input{width:100%;height:100%;border:0;background:transparent;text-align:center;font-weight:900;font-size:calc(var(--cs) * .55);text-transform:uppercase;padding:0;color:#111}
.cw input:focus{outline:none;background:#fff3c4}
.cw .num{position:absolute;left:2px;top:0;font-size:calc(var(--cs) * .28);font-weight:900;color:#333;pointer-events:none}
.cw .cell.right{background:#c9efd6}.cw .cell.wrong{background:#f7c6c6}
.clist{display:grid;gap:12px}
.clist ol{margin:4px 0 0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-weight:700}
.pic{position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:4/3;max-width:100%}
.pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.tiles{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr)}
.tiles i{background:linear-gradient(140deg,#8e6bd1,#5d3fa3);border:1px solid rgba(255,255,255,.25);transition:opacity .4s}
.tiles i.off{opacity:0}
.guess{display:flex;gap:8px}.guess input{flex:1;min-width:0;border:1.5px solid var(--line);background:var(--bg);border-radius:14px;padding:12px 14px;font:inherit;color:inherit}
.toast{width:max-content;max-width:calc(100vw - 32px);text-align:center}
.prevbar{background:var(--gold-soft);border-radius:14px;padding:8px 14px;font-weight:800;font-size:.88rem;text-align:center}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

/* ---------- templates ---------- */
const KC=["▲","◆","●","■"];
const T={
 kahoot:{name:"Kahoot Quiz",ic:"🏆",c:"#d64545",mode:"live",desc:"Race to answer, live leaderboard",item:"Question",min:1,max:30,
  extra:[{k:"timer",label:"Time per question",type:"select",opts:[["10","10 seconds"],["20","20 seconds"],["30","30 seconds"],["60","60 seconds"]],def:"20"}],
  fields:[{k:"q",label:"Question",type:"textarea",req:1,full:1,ph:"Who threw Daniel into the lions' den?"},
   {k:"a",label:"▲ Choice 1",req:1,ph:"King Darius"},{k:"b",label:"◆ Choice 2",req:1,ph:"Pharaoh"},
   {k:"c",label:"● Choice 3 (optional)",ph:"King Herod"},{k:"d",label:"■ Choice 4 (optional)",ph:"Goliath"},
   {k:"ok",label:"✅ Right answer",type:"select",opts:[["a","Choice 1"],["b","Choice 2"],["c","Choice 3"],["d","Choice 4"]],def:"a",full:1}],
  check:(it,n)=>it.q&&!it[it.ok||"a"]?[`${n}: the right answer choice is empty`]:[]},
 whoami:{name:"Who Am I?",ic:"🕵️",c:"#2f6fd0",mode:"live",desc:"Clues reveal a Bible character or saint",item:"Character",min:1,max:20,
  fields:[{k:"ans",label:"Answer (who it is)",req:1,full:1,ph:"St. George"},
   {k:"clues",label:"Clues, one per line (hardest first)",type:"textarea",req:1,full:1,ph:"I was a soldier.\nI never stopped believing in Jesus.\nI ride a white horse in icons."}],
  check:(it,n)=>it.ans&&lines(it.clues).length<2?[`${n}: add at least 2 clues`]:[]},
 jeopardy:{name:"Jeopardy Board",ic:"🟦",c:"#1d3f8f",mode:"live",desc:"Teams pick squares, 100 to 500 points",item:"Category",min:1,max:5,
  extra:[{k:"teams",label:"Number of teams",type:"select",opts:[["2","2 teams"],["3","3 teams"],["4","4 teams"]],def:"2"}],
  fields:[{k:"name",label:"Category name",req:1,full:1,ph:"Old Testament"},
   ...[100,200,300,400,500].flatMap(p=>[{k:"q"+p,label:"⭐ "+p+" pts question",full:1,ph:p===100?"Who built the ark?":""},{k:"a"+p,label:"Answer",full:1,ph:p===100?"Noah":""}])],
  check:(it,n)=>{const e=[];if(it.name&&![100,200,300,400,500].some(p=>it["q"+p]))e.push(`${n}: add at least one question`);
   [100,200,300,400,500].forEach(p=>{if(it["q"+p]&&!it["a"+p])e.push(`${n}: the ${p} pts question needs an answer`)});return e}},
 wheel:{name:"Wheel Spin",ic:"🎡",c:"#d19a12",mode:"live",desc:"Spin picks a question or a kid",item:"Slice",min:2,max:24,
  extra:[{k:"kind",label:"What's on the wheel?",type:"select",opts:[["q","Questions"],["n","Kids' names"]],def:"q"}],
  fields:[{k:"text",label:"Question or name",req:1,full:1,ph:"Who was the first man?"},{k:"ans",label:"Answer (optional)",full:1,ph:"Adam"}]},
 order:{name:"Story Order",ic:"📜",c:"#8a5f1c",mode:"self",desc:"Put the story events in order",item:"Event",min:3,max:10,
  hintTop:"Type the events in the RIGHT order. The game shuffles them for the kids.",
  fields:[{k:"text",label:"What happens",req:1,full:1,ph:"God tells Noah to build an ark"}]},
 verse:{name:"Verse Builder",ic:"✍️",c:"#2e9b5b",mode:"self",desc:"Put the missing words back in the verse",item:"Verse",min:1,max:10,
  hintTop:"Put * around the words to hide, like: The Lord is my *shepherd*. If you don't mark any, the game hides 3 words for you.",
  fields:[{k:"text",label:"Verse",type:"textarea",req:1,full:1,ph:"The Lord is my *shepherd*; I shall not *want*."},{k:"ref",label:"Reference",full:1,ph:"Psalm 23:1"}]},
 wordsearch:{name:"Word Search",ic:"🔍",c:"#2f8fc0",mode:"self",desc:"Find hidden lesson words in a grid",item:"Word",min:3,max:12,
  extra:[{k:"size",label:"Grid size",type:"select",opts:[["8","Small 8×8 (Pre K to Grade 2)"],["10","Medium 10×10"],["12","Big 12×12"]],def:"10"}],
  fields:[{k:"w",label:"Word",req:1,ph:"ARK"},{k:"hint",label:"Hint (optional)",ph:"Noah built it"}],
  check:(it,n,g)=>{const w=clean(it.w),sz=+(g.data.size||10);return it.w&&!w?[`${n}: use letters only`]:w.length>sz?[`${n}: "${it.w}" is longer than the grid (${sz})`]:[]}},
 match:{name:"Matching Pairs",ic:"🃏",c:"#e86f8a",mode:"self",desc:"Memory flip game, match the pairs",item:"Pair",min:3,max:10,
  fields:[{k:"l",label:"Card A",req:1,ph:"🦁 Daniel"},{k:"r",label:"Card B (its match)",req:1,ph:"Lions' den"}]},
 hangman:{name:"Guess the Word",ic:"🪔",c:"#c24d2c",mode:"self",desc:"Guess letters before the lamp goes out",item:"Word",min:1,max:20,
  fields:[{k:"w",label:"Word or name",req:1,ph:"GOLIATH"},{k:"hint",label:"Hint",ph:"The giant David beat"}],
  check:(it,n)=>it.w&&!clean(it.w)?[`${n}: use letters only`]:[]},
 crossword:{name:"Crossword",ic:"➕",c:"#5d3fa3",mode:"self",desc:"Auto-built crossword from your words",item:"Word",min:3,max:14,
  fields:[{k:"w",label:"Answer word",req:1,ph:"NOAH"},{k:"clue",label:"Clue",req:1,ph:"He built the ark"}],
  checkAll:g=>{const its=filled(g).filter(i=>clean(i.w));if(its.length<3)return[];const cw=buildCross(its);return cw.left.length?[`These words don't cross any other word, so they were left out: ${cw.left.map(i=>i.w).join(", ")}. Add words that share letters, or remove them.`]:[]},
  check:(it,n)=>it.w&&clean(it.w).length<2?[`${n}: the word is too short`]:[]},
 picture:{name:"Picture Guess",ic:"🖼️",c:"#8e6bd1",mode:"self",desc:"The picture is revealed piece by piece",item:"Picture",min:1,max:15,
  fields:[{k:"img",label:"Picture",type:"image",req:1,full:1},{k:"ans",label:"Answer",req:1,ph:"Noah's Ark"},{k:"hint",label:"Hint (optional)",ph:"It floated for 40 days"}]},
};
const ORDER={live:["kahoot","whoami","jeopardy","wheel"],self:["order","verse","wordsearch","match","hangman","crossword","picture"]};

/* ---------- examples (for "Fill an example") ---------- */
const EX={
 kahoot:{title:"Daniel in the Lions' Den",data:{timer:"20"},items:[
  {q:"Who threw Daniel into the lions' den?",a:"King Darius",b:"Pharaoh",c:"King Herod",d:"Goliath",ok:"a"},
  {q:"How many times a day did Daniel pray?",a:"One",b:"Two",c:"Three",d:"Seven",ok:"c"},
  {q:"Who shut the lions' mouths?",a:"Daniel",b:"An angel of God",c:"The king",d:"A soldier",ok:"b"},
  {q:"What did the king do the next morning?",a:"He went back to sleep",b:"He ran to check on Daniel",c:"He went on a trip",d:"He fed the lions",ok:"b"}]},
 whoami:{title:"Saints and Heroes",items:[
  {ans:"St. George",clues:"I was a soldier in the Roman army.\nI would not stop believing in Jesus.\nIn icons I ride a white horse.\nI am shown killing a dragon."},
  {ans:"Moses",clues:"As a baby I was found in a basket on the river.\nI saw a bush that burned but did not burn up.\nGod gave me the Ten Commandments."},
  {ans:"Noah",clues:"God told me a big flood was coming.\nI built something very big out of wood.\nAnimals came to me two by two."}]},
 jeopardy:{title:"Bible Jeopardy",data:{teams:"2"},items:[
  {name:"Old Testament",q100:"Who built the ark?",a100:"Noah",q200:"Who was swallowed by a big fish?",a200:"Jonah",q300:"Who beat Goliath?",a300:"David",q400:"Who led God's people out of Egypt?",a400:"Moses",q500:"On which day did God rest?",a500:"The 7th day"},
  {name:"New Testament",q100:"Where was Jesus born?",a100:"Bethlehem",q200:"How many disciples did Jesus choose?",a200:"Twelve",q300:"Who denied Jesus three times?",a300:"St. Peter",q400:"What did Jesus turn water into at Cana?",a400:"Wine",q500:"How many loaves fed the 5,000?",a500:"Five"},
  {name:"Our Church",q100:"What is the Coptic New Year called?",a100:"Nayrouz",q200:"Which saint is shown on a white horse with a dragon?",a200:"St. George",q300:"Who is the Mother of God?",a300:"St. Mary",q400:"What feast do we celebrate on January 7?",a400:"The Nativity (Christmas)",q500:"Which feast comes 50 days after the Resurrection?",a500:"Pentecost"}]},
 wheel:{title:"Sunday Review Wheel",data:{kind:"q"},items:[
  {text:"Who was the first man?",ans:"Adam"},{text:"What did God make on day 1?",ans:"Light"},{text:"Who built the ark?",ans:"Noah"},
  {text:"Name one of the 12 disciples",ans:""},{text:"Say a Bible verse you know",ans:""},{text:"Where was Jesus born?",ans:"Bethlehem"}]},
 order:{title:"Noah's Ark",items:[{text:"God tells Noah to build an ark"},{text:"Noah builds the ark"},{text:"The animals come two by two"},{text:"It rains for 40 days and 40 nights"},{text:"A dove brings back an olive leaf"},{text:"God puts a rainbow in the sky"}]},
 verse:{title:"Memory Verses",items:[{text:"The Lord is my *shepherd*; I shall not *want*.",ref:"Psalm 23:1"},{text:"I can do *all* things through *Christ* who *strengthens* me.",ref:"Philippians 4:13"},{text:"For God so *loved* the *world* that He gave His only begotten *Son*.",ref:"John 3:16"}]},
 wordsearch:{title:"The 7 Days of Creation",data:{size:"10"},items:[{w:"LIGHT",hint:"Day 1"},{w:"SKY",hint:"Day 2"},{w:"PLANTS",hint:"Day 3"},{w:"STARS",hint:"Day 4"},{w:"FISH",hint:"Day 5"},{w:"BIRDS",hint:"Day 5"},{w:"ANIMALS",hint:"Day 6"},{w:"ADAM",hint:"The first man"}]},
 match:{title:"Bible Heroes",items:[{l:"🚢 Noah",r:"Built the ark"},{l:"🦁 Daniel",r:"Lions' den"},{l:"🪨 David",r:"Beat Goliath"},{l:"🐋 Jonah",r:"Big fish"},{l:"📜 Moses",r:"Ten Commandments"},{l:"💙 St. Mary",r:"Said yes to God"}]},
 hangman:{title:"Bible Words",items:[{w:"GOLIATH",hint:"The giant David beat"},{w:"MANNA",hint:"Bread from heaven"},{w:"RAINBOW",hint:"God's promise to Noah"},{w:"PENTECOST",hint:"The Holy Spirit came"}]},
 crossword:{title:"Bible People and Places",items:[{w:"NOAH",clue:"He built the ark"},{w:"MOSES",clue:"Received the Ten Commandments"},{w:"DAVID",clue:"Beat Goliath with a stone"},{w:"JONAH",clue:"Swallowed by a big fish"},{w:"MARY",clue:"The Mother of Jesus"},{w:"PETER",clue:"Walked on water to Jesus"},{w:"BETHLEHEM",clue:"Town where Jesus was born"},{w:"CROSS",clue:"Sign of our salvation"}]},
 picture:{title:"Guess the Bible Picture",items:[{img:"@🦁",ans:"Lion",hint:"Daniel was safe with them"},{img:"@🌈",ans:"Rainbow",hint:"God's promise to Noah"},{img:"@🕊️",ans:"Dove",hint:"It brought an olive leaf"}]},
};

/* ---------- helpers ---------- */
const lines=s=>String(s||"").split("\n").map(x=>x.trim()).filter(Boolean);
const clean=s=>String(s||"").toUpperCase().replace(/[^A-Z]/g,"");
const norm=s=>String(s||"").toLowerCase().replace(/^\s*(st\.?|saint|the|a|an)\s+/,"").replace(/[^a-z0-9]/g,"");
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const games=()=>store.get("games",[]);
function saveGames(list){try{localStorage.setItem("hv_games",JSON.stringify(list));return true}catch{toast("Phone storage is full. Use smaller pictures.");return false}}
const getGame=id=>games().find(g=>g.id===id);
function putGame(g){const l=games();const i=l.findIndex(x=>x.id===g.id);g.updated=Date.now();if(i<0)l.unshift(g);else l[i]=g;return saveGames(l)}
const isEmpty=(it,t)=>!Object.entries(it).some(([k,v])=>{const f=t&&t.fields.find(x=>x.k===k);return String(v||"").trim()&&!(f&&f.def&&v===f.def)});
const filled=g=>(g.items||[]).filter(it=>!isEmpty(it,T[g.t]));
const pl=(n,w)=>{w=w.toLowerCase();return n===1?w:w.endsWith("y")?w.slice(0,-1)+"ies":w+"s"};
const secName=id=>(SECTIONS.find(s=>s.id===id)||{}).name||"";
const live=el=>el&&document.body.contains(el);
const imgSrc=s=>s&&s.startsWith("@")?emojiImg(s.slice(1)):s;
const emojiCache={};
function emojiImg(e){if(emojiCache[e])return emojiCache[e];const c=document.createElement("canvas");c.width=480;c.height=360;const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,480,360);g.addColorStop(0,"#d9eef8");g.addColorStop(1,"#f1dcb2");x.fillStyle=g;x.fillRect(0,0,480,360);
  x.font="240px serif";x.textAlign="center";x.textBaseline="middle";x.fillText(e,240,190);return emojiCache[e]=c.toDataURL("image/jpeg",.8)}
function problems(g){const t=T[g.t],e=[];if(!String(g.title||"").trim())e.push("Give the game a title");
  const its=filled(g);its.forEach((it,i)=>{const n=`${t.item} ${g.items.indexOf(it)+1}`;
    t.fields.filter(f=>f.req&&!String(it[f.k]||"").trim()).forEach(f=>e.push(`${n}: fill in "${f.label}"`));
    if(t.check)e.push(...t.check(it,n,g))});
  if(its.length<t.min)e.push(`Add at least ${t.min} ${pl(t.min,t.item)}`);
  if(!e.length&&t.checkAll)e.push(...t.checkAll(g));return e}
function resizeImg(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{
  const m=640,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.72))};im.src=r.result};r.readAsDataURL(file)})}
const win=(msg)=>{confetti();toast(msg)};

/* ================= BUILDER HOME ================= */
let filt="all";
function builderHome(){
  const all=games(),list=all.filter(g=>filt==="all"||g.status===filt);
  const tile=k=>{const t=T[k];return `<button class="tile gt" style="--c:${t.c}" data-go="bnew-${k}"><span class="ic">${t.ic}</span><span class="nm">${t.name}</span><span class="ct">${t.desc}</span></button>`};
  app.innerHTML=`${topbar("Game Builder","🛠️","Pick a template, fill it in, and it's ready","servants")}
  <section class="gb-sec"><div class="gb-head"><h2>🔴 Live class games</h2><span class="pill live">Big screen</span></div>
   <p class="hint">Play together in class on the TV or projector.</p><div class="grid">${ORDER.live.map(tile).join("")}</div></section>
  <section class="gb-sec"><div class="gb-head"><h2>🟢 Self play games</h2><span class="pill self">Kids play alone</span></div>
   <p class="hint">Kids play on their own phone, in class or at home.</p><div class="grid">${ORDER.self.map(tile).join("")}</div></section>
  <section class="gb-sec" id="mine"><div class="gb-head"><h2>📁 My games (${all.length})</h2></div>
   ${all.length?`<div class="filters" role="group" aria-label="Filter">${[["all","All"],["ready","✅ Ready"],["draft","📝 Drafts"]].map(([k,l])=>`<button data-filt="${k}" aria-pressed="${filt===k}">${l}</button>`).join("")}</div>`:""}
   <div class="list">${list.length?list.map(myGameHTML).join(""):`<div class="empty">${all.length?"No games here yet.":"No games yet. Pick a template above to make your first one ✨"}</div>`}</div></section>
  <div class="note">💡 Games are saved on this phone. Tap 🌍 Publish on a Ready self play game to show it in the kids' Games tab.</div>`;
  app.querySelectorAll("[data-filt]").forEach(b=>b.onclick=()=>{filt=b.dataset.filt;builderHome();$("#mine").scrollIntoView()});
  app.querySelectorAll("[data-gact]").forEach(b=>b.onclick=()=>{const g=getGame(b.dataset.id);if(!g)return;const a=b.dataset.gact;
    if(a==="copy"){const c=JSON.parse(JSON.stringify(g));c.id=uid();c.title=(g.title||"Untitled")+" (copy)";c.status="draft";putGame(c);toast("Copied ✅");builderHome()}
    if(a==="pub"||a==="unpub"){publish(g,a==="pub").then(ok=>ok&&builderHome());return}
    if(a==="del"){if(confirm(`Delete "${g.title||"Untitled"}"? This can't be undone.`)){if(g.pub)publish(g,false);saveGames(games().filter(x=>x.id!==g.id));toast("Deleted");builderHome()}}});
}
function myGameHTML(g){const t=T[g.t];if(!t)return"";const n=filled(g).length;
  return `<div class="mygame"><div class="gi">${t.ic}</div><div><div class="gt2">${esc(g.title||"Untitled")}</div>
   <div class="meta"><span class="pill ${g.status==="ready"?"ready":"draft"}">${g.status==="ready"?"✅ Ready":"📝 Draft"}</span>${g.pub?`<span class="pill self">🌍 Online</span>`:""}<span class="tag">${t.name} · ${n} ${pl(n,t.item)}${g.grade?" · "+esc(secName(g.grade)):""}</span></div></div>
   <div class="acts"><button class="mini" data-go="bplay-${g.id}">▶ Play</button><button class="mini" data-go="bedit-${g.id}">✏️ Edit</button><button class="mini" data-gact="copy" data-id="${g.id}">⧉ Copy</button>${pubBtn(g,t)}<button class="mini danger" data-gact="del" data-id="${g.id}">🗑 Delete</button></div></div>`}
function pubBtn(g,t){if(t.mode!=="self"||g.status!=="ready")return"";
  if(!g.pub)return `<button class="mini" data-gact="pub" data-id="${g.id}">🌍 Publish</button>`;
  return (g.updated>g.pub?`<button class="mini" data-gact="pub" data-id="${g.id}">🔄 Update</button>`:"")+`<button class="mini" data-gact="unpub" data-id="${g.id}">🚫 Unpublish</button>`}

/* ================= EDITOR ================= */
let ed=null,saveT=0;
function newGame(k){const t=T[k];const g={id:uid(),t:k,title:"",grade:"",lesson:"",status:"draft",data:{},items:[]};
  (t.extra||[]).forEach(f=>g.data[f.k]=f.def);for(let i=0;i<Math.max(t.min,1);i++)g.items.push(blankItem(t));return g}
function blankItem(t){const o={};t.fields.forEach(f=>o[f.k]=f.def||"");return o}
function editor(g,isNew){ed={g,isNew,saved:!isNew};renderEd()}
function fieldHTML(f,val,attrs){const v=val==null?"":val;const lab=`<span>${f.label}${f.req?"":""}</span>`;
  if(f.type==="textarea")return `<label class="field ${f.full?"full":""}">${lab}<textarea ${attrs} rows="3" placeholder="${esc(f.ph||"")}">${esc(v)}</textarea></label>`;
  if(f.type==="select")return `<label class="field ${f.full?"full":""}">${lab}<select ${attrs}>${f.opts.map(([a,b])=>`<option value="${a}" ${String(v)===a?"selected":""}>${esc(b)}</option>`).join("")}</select></label>`;
  if(f.type==="image")return `<div class="field full">${lab}${v?`<img class="imgprev" src="${esc(imgSrc(v))}" alt="Picture">`:""}
    <label class="btn alt" style="cursor:pointer">📷 ${v?"Change picture":"Choose picture"}<input type="file" accept="image/*" ${attrs} data-img hidden></label>
    <input ${attrs} data-url placeholder="or paste an image link (https://...)" value="${v&&!v.startsWith("data:")&&!v.startsWith("@")?esc(v):""}" style="border:1.5px solid var(--line);background:var(--bg);border-radius:14px;padding:10px 12px;width:100%"></div>`;
  return `<label class="field ${f.full?"full":""}">${lab}<input ${attrs} value="${esc(v)}" placeholder="${esc(f.ph||"")}" autocomplete="off"></label>`}
function renderEd(probs){const {g}=ed,t=T[g.t];const y=scrollY;
  const lessonOpts=SECTIONS.map(s=>{const vs=V.filter(v=>v[3]===s.id);return vs.length?`<optgroup label="${esc(s.name)}">${vs.map(v=>`<option value="${v[0]}" ${g.lesson===v[0]?"selected":""}>${esc(v[1])}</option>`).join("")}</optgroup>`:""}).join("");
  app.innerHTML=`${topbar(t.name,t.ic,`<span class="pill ${t.mode}">${t.mode==="live"?"🔴 Live class game":"🟢 Self play game"}</span>`,"builder")}
  <section class="card sec">
   ${fieldHTML({label:"Game title"},g.title,`data-top="title" placeholder="${esc(EX[g.t].title)}"`)}
   <div class="two">${fieldHTML({type:"select",label:"Class",opts:[["","All classes"],...SECTIONS.map(s=>[s.id,s.name])]},g.grade,'data-top="grade"')}
   <label class="field">Lesson (optional)<select data-top="lesson"><option value="">None</option>${lessonOpts}</select></label></div>
   ${(t.extra||[]).map(f=>fieldHTML(f,g.data[f.k],`data-x="${f.k}"`)).join("")}
   ${t.hintTop?`<p class="hint">💡 ${t.hintTop}</p>`:""}
  </section>
  <div class="list" id="items">${g.items.map((it,i)=>`<div class="item" style="--c:${t.c}"><div class="item-h"><b>${t.item} ${i+1}</b>
    <button class="icon-btn" data-mv="${i}" data-d="-1" aria-label="Move up" ${i?"":"disabled"}>↑</button><button class="icon-btn" data-mv="${i}" data-d="1" aria-label="Move down" ${i<g.items.length-1?"":"disabled"}>↓</button>
    <button class="icon-btn" data-rm="${i}" aria-label="Remove" style="color:var(--bad)">✕</button></div>
    <div class="two">${t.fields.map(f=>fieldHTML(i?{...f,ph:""}:f,it[f.k],`data-i="${i}" data-f="${f.k}"`)).join("")}</div></div>`).join("")}</div>
  ${g.items.length<t.max?`<button class="add" id="addItem">＋ Add ${t.item.toLowerCase()}</button>`:`<p class="hint">Max ${t.max} ${pl(2,t.item)}.</p>`}
  <button class="btn alt" id="fillEx">✨ Fill an example</button>
  ${probs&&probs.length?`<div class="probs" role="alert">⚠️ Before it's ready:<ul>${probs.map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div>`:""}
  <div class="saved" id="savedMsg">${ed.saved?(g.status==="ready"?"✅ Ready for students":"📝 Saved as draft"):"Not saved yet"}</div>
  <div class="savebar"><button class="btn alt" id="prevBtn">▶ Preview</button>
   ${g.status==="ready"?`<button class="btn gold" id="draftBtn">↩ Back to draft</button>`:`<button class="btn gold" id="readyBtn">✅ Mark ready</button>`}</div>`;
  scrollTo(0,y);
  const root=app;
  const onIn=e=>{const el=e.target;if(el.dataset.img!=null)return;
    if(el.dataset.top)g[el.dataset.top]=el.value;else if(el.dataset.x)g.data[el.dataset.x]=el.value;
    else if(el.dataset.i!=null){g.items[+el.dataset.i][el.dataset.f]=el.value}else return;
    if(g.status==="ready"&&problems(g).length){g.status="draft";clearTimeout(saveT);save();renderEd();toast("Moved back to draft, something is missing");return}
    clearTimeout(saveT);saveT=setTimeout(save,350)};
  root.querySelectorAll("input:not([type=file]),textarea,select").forEach(el=>el.addEventListener(el.tagName==="SELECT"?"change":"input",onIn));
  root.querySelectorAll("[data-img]").forEach(el=>el.addEventListener("change",async()=>{const f=el.files[0];if(!f)return;
    try{g.items[+el.dataset.i][el.dataset.f]=await resizeImg(f);save();renderEd()}catch{toast("Couldn't open that picture")}}));
  root.querySelectorAll("[data-url]").forEach(el=>el.addEventListener("change",()=>{if(/^https?:\/\//.test(el.value.trim())){g.items[+el.dataset.i][el.dataset.f]=el.value.trim();save();renderEd()}}));
  root.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{const i=+b.dataset.rm;if(!isEmpty(g.items[i],t)&&!confirm(`Remove ${t.item.toLowerCase()} ${i+1}?`))return;g.items.splice(i,1);if(!g.items.length)g.items.push(blankItem(t));save();renderEd()});
  root.querySelectorAll("[data-mv]").forEach(b=>b.onclick=()=>{const i=+b.dataset.mv,j=i+ +b.dataset.d;[g.items[i],g.items[j]]=[g.items[j],g.items[i]];save();renderEd()});
  $("#addItem")&&($("#addItem").onclick=()=>{g.items.push(blankItem(t));save();renderEd();const its=app.querySelectorAll(".item");its[its.length-1].scrollIntoView({block:"center"});its[its.length-1].querySelector("input,textarea")?.focus()});
  $("#fillEx").onclick=()=>{if(filled(g).length&&!confirm("Replace what you typed with the example?"))return;const ex=JSON.parse(JSON.stringify(EX[g.t]));
    g.title=ex.title;g.data=Object.assign(g.data,ex.data||{});g.items=ex.items.map(it=>Object.assign(blankItem(t),it));save();renderEd();toast("Example added ✨")};
  $("#prevBtn").onclick=()=>{const p=problems(g).filter(x=>!x.startsWith("Give the game"));if(!filled(g).length||p.some(x=>x.startsWith("Add at least"))){renderEd(problems(g));$(".probs")?.scrollIntoView({block:"center"});return}save();go("bplay-"+g.id)};
  $("#readyBtn")&&($("#readyBtn").onclick=()=>{const p=problems(g);if(p.length){renderEd(p);$(".probs").scrollIntoView({block:"center"});return}g.status="ready";save();renderEd();confetti();toast("Ready for students ✅")});
  $("#draftBtn")&&($("#draftBtn").onclick=()=>{g.status="draft";save();renderEd()});
}
function save(){const {g}=ed;if(ed.isNew&&!ed.saved){history.replaceState(null,"","#bedit-"+g.id)}ed.saved=true;
  if(putGame(g)){const m=$("#savedMsg");if(m)m.textContent=g.status==="ready"?"✅ Ready for students":"📝 Saved as draft"}}

/* ================= PLAYERS ================= */
function playScreen(g){const t=T[g.t];
  return `${topbar(esc(g.title||"Untitled"),t.ic,t.name,"builder")}
  <div class="prevbar">👀 Preview · <button class="back" data-go="bedit-${g.id}" style="display:inline-flex;padding:3px 10px">✏️ Edit</button> · <button class="back" data-go="bplay-${g.id}" style="display:inline-flex;padding:3px 10px">🔁 Restart</button></div>
  <div id="game" class="sec"></div>`}
function play(g){app.innerHTML=playScreen(g);const el=$("#game");(P[g.t]||(()=>el.innerHTML=`<div class="empty">Not available.</div>`))(g,el)}
function endCard(el,title,sub,g){const kid=g.kid;if(kid&&window.hvAward)hvAward("selfplay",g.id+":"+new Date().toISOString().slice(0,10),g.title);el.innerHTML=`<div class="stage" style="text-align:center"><div class="stars">🎉</div><div class="bigq">${title}</div><p class="tag" style="margin:0">${sub}</p>
  <div class="btns"><button class="btn gold" data-go="${kid?"gplay-":"bplay-"}${g.id}">🔁 Play again</button><button class="btn alt" data-go="${kid?"games":"builder"}">${kid?"Back to Games":"Back to Game Builder"}</button></div></div>`;confetti()}

/* ================= STUDENT VIEW ================= */
async function kidPlay(id){
  app.innerHTML=`${topbar("Loading…","🎮","","games")}<p class="tag" style="text-align:center">Getting the game…</p>`;
  try{const j=await (await fetch(GU()+"?action=get&id="+encodeURIComponent(id))).json();
    if(!j.ok)throw 0;const g=j.game;g.kid=true;const t=T[g.t];
    app.innerHTML=`${topbar(esc(g.title||"Game"),t.ic,t.name,"games")}<div id="game" class="sec"></div>`;P[g.t](g,$("#game"))}
  catch{app.innerHTML=`${topbar("Oops","😕","","games")}<div class="empty">Could not open this game. Check your internet.</div>`}}
window.kidGames=async function(box){
  if(!GU())return;
  const me=store.get("me",null);let all=[];
  try{all=(await (await fetch(GU()+"?action=list")).json()).games||[]}catch{return}
  if(!all.length)return;
  const mine=g=>!me||!g.grade||secName(g.grade)===me.grade;
  const draw=showAll=>{const list=showAll?all:all.filter(mine);
    box.innerHTML=`<h2 style="margin:18px 0 8px">🌟 New games</h2><div class="grid">${list.map(g=>{const t=T[g.t]||{ic:"🎮",c:"#2f8fc0",name:""};
      return `<button class="tile" style="--c:${t.c}" data-go="gplay-${g.id}"><span class="ic">${t.ic}</span><span class="nm">${esc(g.title||"Game")}</span><span class="ct">${g.grade?esc(secName(g.grade)):"Everyone"}</span></button>`}).join("")}</div>
      ${!showAll&&all.length>list.length?`<button class="btn alt" id="showAllG" style="margin-top:10px">Show games for all classes</button>`:""}`;
    const b=box.querySelector("#showAllG");if(b)b.onclick=()=>draw(true)};
  draw(false)};

/* ================= PIN LOCK + PUBLISH ================= */
const GU=()=>window.GAMES_URL||"";
const myPin=()=>{try{return localStorage.getItem("hv_spin")||""}catch{return""}};
function pinGate(h){
  app.innerHTML=`${topbar("Servants Workshop","🛠️","Enter the servant PIN","servants")}
  <form class="card sec" id="gatePin"><label class="field">Servant PIN<input id="gp" type="password" inputmode="numeric" maxlength="8" required autocomplete="off"></label>
  <button class="btn gold" type="submit">Unlock</button><div id="gpMsg" class="tag"></div></form>`;
  $("#gatePin").onsubmit=async e=>{e.preventDefault();const pin=$("#gp").value,m=$("#gpMsg");m.textContent="Checking…";
    try{const j=await (await fetch(ATTEND_URL+"?action=list&pin="+encodeURIComponent(pin))).json();
      if(!j.ok){m.textContent="❌ Wrong PIN";return}
      try{localStorage.setItem("hv_spin",pin)}catch{}servantPin=pin;window.builderRoute(h);}
    catch{m.textContent="No internet connection."}}}
async function publish(g,on){
  if(!GU()){toast("Publishing is not switched on yet");return false}
  try{const body=on?{action:"save",pin:myPin(),game:{id:g.id,t:g.t,title:g.title,grade:g.grade,lesson:g.lesson,data:g.data,items:filled(g),updated:g.updated}}:{action:"delete",pin:myPin(),id:g.id};
    const j=await (await fetch(GU(),{method:"POST",body:JSON.stringify(body)})).json();
    if(!j.ok){toast(j.error==="pin"?"Wrong PIN, unlock again":j.error==="full"?"Online storage is full. Use fewer or smaller pictures.":"Could not publish");if(j.error==="pin")try{localStorage.removeItem("hv_spin")}catch{}return false}
    g.pub=on?g.updated:0;saveGames(games().map(x=>x.id===g.id?g:x));toast(on?"Published for kids 🌍":"Removed from kids' games");if(on&&window.hvAward)hvAward("publish",g.id,g.title);return true}
  catch{toast("No internet connection");return false}}

const P={
/* --- Kahoot --- */
kahoot(g,el){const qs=filled(g),secs=+(g.data.timer||20);let i=0,score=0,right=0,iv;
  function show(){if(i>=qs.length)return endCard(el,`${score} points`,`${right} of ${qs.length} right`,g);
    const q=qs[i],ch=["a","b","c","d"].filter(k=>String(q[k]||"").trim());let left=secs*10,done=false;
    el.innerHTML=`<div class="scoreline"><span>Question ${i+1}/${qs.length}</span><span>⭐ ${score}</span></div>
    <div class="stage"><div class="bigq">${esc(q.q)}</div><div class="timer"><i id="tb" style="width:100%"></i></div><div class="tag" style="text-align:center" id="tl">${secs}s</div></div>
    <div class="kopts">${ch.map(k=>{const n="abcd".indexOf(k);return `<button class="kopt k${n}" data-k="${k}"><span class="sh">${KC[n]}</span><span>${esc(q[k])}</span></button>`}).join("")}</div><div id="after"></div>`;
    const finish=pick=>{if(done)return;done=true;clearInterval(iv);const ok=q.ok||"a";
      el.querySelectorAll(".kopt").forEach(b=>{b.disabled=true;b.classList.add(b.dataset.k===ok?"win":"dim")});
      let msg;if(pick===ok){const pts=Math.round(500+500*left/(secs*10));score+=pts;right++;msg=`✅ Correct! +${pts}`}else msg=pick?"❌ Not this time":"⏰ Time's up!";
      $("#after").innerHTML=`<div class="stage" style="text-align:center"><div class="bigq">${msg}</div><button class="btn gold" id="nx">${i<qs.length-1?"Next question ›":"See score ›"}</button></div>`;
      $("#nx").onclick=()=>{i++;show()};$("#nx").focus()};
    el.querySelectorAll(".kopt").forEach(b=>b.onclick=()=>finish(b.dataset.k));
    iv=setInterval(()=>{if(!live(el)||done)return clearInterval(iv);left--;$("#tb").style.width=(left/(secs*10)*100)+"%";$("#tl").textContent=Math.ceil(left/10)+"s";if(left<=0)finish(null)},100)}
  show()},
/* --- Who Am I --- */
whoami(g,el){const cs=filled(g);let i=0,score=0;
  function show(){if(i>=cs.length)return endCard(el,`${score} points`,`You played ${cs.length} character${cs.length>1?"s":""}`,g);
    const c=cs[i],cl=lines(c.clues);let n=1,over=false;
    const draw=()=>{const pts=(cl.length-n+1)*100;
      el.innerHTML=`<div class="scoreline"><span>Who am I? ${i+1}/${cs.length}</span><span>⭐ ${score}</span></div>
      <div class="stage"><div class="bigq">🕵️ Who am I?</div><ol class="clues">${cl.slice(0,over?cl.length:n).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      ${over?`<div class="reveal">${esc(c.ans)}</div><button class="btn gold" id="nx">${i<cs.length-1?"Next ›":"See score ›"}</button>`:
      `<div class="tag" style="text-align:center">Worth ${pts} points now</div>
       <form class="guess" id="gf"><input id="gi" placeholder="Type your guess" autocomplete="off" aria-label="Your guess"><button class="btn" type="submit">Guess</button></form>
       <div class="two"><button class="btn alt" id="more" ${n>=cl.length?"disabled":""}>💡 Next clue</button><button class="btn alt" id="rv">👀 Reveal</button></div>`}</div>`;
      if(over){$("#nx").onclick=()=>{i++;show()};return}
      $("#gf").onsubmit=e=>{e.preventDefault();const v=$("#gi").value;if(!v.trim())return;if(norm(v)===norm(c.ans)){score+=pts;over=true;draw();win(`Yes! +${pts}`)}else{toast("Not quite, try again");$("#gi").select()}};
      $("#more").onclick=()=>{n++;draw()};$("#rv").onclick=()=>{over=true;draw()}};
    draw()}
  show()},
/* --- Jeopardy --- */
jeopardy(g,el){const cats=filled(g).filter(c=>c.name),P5=[100,200,300,400,500],nt=+(g.data.teams||2);
  const teams=Array.from({length:nt},(_,i)=>({n:"Team "+(i+1),s:0})),used=new Set();
  const total=cats.reduce((a,c)=>a+P5.filter(p=>c["q"+p]).length,0);
  function draw(){el.innerHTML=`<div class="teams">${teams.map(t=>`<div class="team"><span class="tag">${t.n}</span><b>${t.s}</b></div>`).join("")}</div>
    <div class="board" style="grid-template-columns:repeat(${cats.length},1fr)">${cats.map(c=>`<div class="cat">${esc(c.name)}</div>`).join("")}
    ${P5.map(p=>cats.map((c,ci)=>c["q"+p]?`<button class="sq" data-c="${ci}" data-p="${p}" ${used.has(ci+"-"+p)?"disabled":""} aria-label="${esc(c.name)} ${p}">${p}</button>`:`<div></div>`).join("")).join("")}</div>`;
    el.querySelectorAll(".sq").forEach(b=>b.onclick=()=>ask(+b.dataset.c,+b.dataset.p));
    if(used.size===total){const best=Math.max(...teams.map(t=>t.s)),w=teams.filter(t=>t.s===best);
      el.insertAdjacentHTML("beforeend",`<div class="stage" style="text-align:center"><div class="bigq">🏆 ${w.length>1?"It's a tie!":w[0].n+" wins!"}</div><button class="btn gold" data-go="bplay-${g.id}">🔁 Play again</button></div>`);confetti()}}
  function ask(ci,p){const c=cats[ci];
    sheet(`<button class="close" data-close>Close ✕</button><div class="tag">${esc(c.name)} · ${p} pts</div><div class="bigq">${esc(c["q"+p])}</div>
     <button class="btn alt" id="sa">👀 Show answer</button><div id="ja"></div>`,"Question");
    $("#sa").onclick=()=>{$("#sa").remove();$("#ja").innerHTML=`<div class="reveal">${esc(c["a"+p])}</div><p class="tag" style="text-align:center;margin:0">Who got it?</p>
     <div class="btns">${teams.map((t,ti)=>`<button class="btn" data-t="${ti}">+${p} ${t.n}</button>`).join("")}<button class="btn alt" data-t="-1">Nobody</button></div>`;
     document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const ti=+b.dataset.t;if(ti>=0)teams[ti].s+=p;used.add(ci+"-"+p);closeSheet();draw()})}}
  draw()},
/* --- Wheel --- */
wheel(g,el){let items=filled(g).filter(x=>x.text);const cols=["#d64545","#2f6fd0","#d19a12","#2e9b5b","#8e6bd1","#e8794a","#3fb6a8","#e86f8a"];let rot=0,spinning=false;
  el.innerHTML=`<div class="stage"><div class="wheelbox"><div class="ptr"></div><canvas id="wc" width="680" height="680"></canvas></div>
   <button class="btn gold" id="spin" style="font-size:1.2rem">🎡 SPIN!</button>
   <label class="chk"><input type="checkbox" id="rmv" ${g.data.kind==="n"?"checked":""}> Remove the slice after it's picked</label><div class="tag" id="wleft"></div></div>`;
  const cv=$("#wc"),x=cv.getContext("2d"),R=340;
  function drawW(){const n=items.length,s=2*Math.PI/n;x.clearRect(0,0,680,680);
    items.forEach((it,i)=>{x.beginPath();x.moveTo(R,R);x.arc(R,R,R-6,rot+i*s,rot+(i+1)*s);x.closePath();x.fillStyle=cols[i%cols.length];if(n%cols.length===1&&i===n-1)x.fillStyle=cols[3];x.fill();x.strokeStyle="#fff";x.lineWidth=4;x.stroke();
      x.save();x.translate(R,R);x.rotate(rot+(i+.5)*s);x.fillStyle="#fff";x.font=`900 ${n>12?22:28}px Nunito,sans-serif`;x.textAlign="right";x.textBaseline="middle";
      let tx=it.text;if(tx.length>18)tx=tx.slice(0,17)+"…";x.fillText(tx,R-26,0);x.restore()});
    x.beginPath();x.arc(R,R,40,0,2*Math.PI);x.fillStyle="#fff";x.fill();x.font="40px serif";x.textAlign="center";x.textBaseline="middle";x.fillText("✝️",R,R+2);
    $("#wleft").textContent=`${items.length} slice${items.length===1?"":"s"} left`}
  drawW();
  $("#spin").onclick=()=>{if(spinning||!items.length)return;spinning=true;const n=items.length,s=2*Math.PI/n,start=rot,end=rot+2*Math.PI*(5+Math.random()*3)+Math.random()*2*Math.PI,t0=performance.now(),D=4200;
    (function f(t){if(!live(el))return;const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,4);rot=start+(end-start)*e;drawW();
      if(k<1)return requestAnimationFrame(f);spinning=false;rot%=2*Math.PI;
      const a=((1.5*Math.PI-rot)%(2*Math.PI)+2*Math.PI)%(2*Math.PI),idx=Math.floor(a/s)%n,it=items[idx];
      sheet(`<button class="close" data-close>Close ✕</button><div class="bigq" style="padding:10px 0">${g.data.kind==="n"?"🙋 ":"❓ "}${esc(it.text)}</div>
        ${it.ans?`<button class="btn alt" id="wa">👀 Show answer</button>`:""}<button class="btn gold" data-close>OK</button>`,"Result");
      $("#wa")&&($("#wa").onclick=e=>{e.currentTarget.outerHTML=`<div class="reveal">${esc(it.ans)}</div>`});
      if($("#rmv").checked){items.splice(idx,1);drawW();if(!items.length){$("#spin").disabled=true;$("#wleft").textContent="All slices picked! 🎉"}}})(t0)}},
/* --- Story order --- */
order(g,el){const ev=filled(g).map(x=>x.text);let pool=shuffle(ev.map((t,i)=>i));while(ev.length>1&&pool.every((v,i)=>v===i))pool=shuffle(pool);let pick=[],tries=0;
  function draw(res){el.innerHTML=`<div class="stage"><div class="bigq">📜 Put the story in order</div><p class="tag" style="text-align:center;margin:0">Tap the events from first to last.</p>
    <div class="olist">${pick.map((p,i)=>`<button class="ochip ${res?(res[i]?"right":"wrong"):""}" data-un="${i}"><span class="n">${i+1}</span>${esc(ev[p])}</button>`).join("")||`<div class="empty">Your story goes here</div>`}</div></div>
    ${pool.length?`<div class="olist">${pool.map(p=>`<button class="ochip" data-p="${p}"><span class="n">?</span>${esc(ev[p])}</button>`).join("")}</div>`:
     `<button class="btn gold" id="chk">✅ Check my order</button>`}`;
    el.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const p=+b.dataset.p;pool=pool.filter(x=>x!==p);pick.push(p);draw()});
    el.querySelectorAll("[data-un]").forEach(b=>b.onclick=()=>{const i=+b.dataset.un;pool.push(pick[i]);pick.splice(i,1);draw()});
    $("#chk")&&($("#chk").onclick=()=>{tries++;const r=pick.map((p,i)=>p===i);if(r.every(Boolean))return endCard(el,"Perfect order! 🎉",`You got it in ${tries} ${tries>1?"tries":"try"}`,g);
      draw(r);toast(`${r.filter(Boolean).length} of ${r.length} in the right place. Tap a red one to fix it.`)})}
  draw()},
/* --- Verse builder --- */
verse(g,el){const vs=filled(g);let i=0;
  function parse(text){let parts=[],hid=[];const re=/\*([^*]+)\*/g;
    if(re.test(text)){let last=0;text.replace(/\*([^*]+)\*/g,(m,w,o)=>{parts.push(text.slice(last,o));hid.push(w.trim());parts.push(null);last=o+m.length});parts.push(text.slice(last))}
    else{const toks=text.split(/(\s+)/),cand=toks.map((w,j)=>[w.replace(/[^\p{L}']/gu,""),j]).filter(([w])=>w.length>3).sort((a,b)=>b[0].length-a[0].length).slice(0,3).map(x=>x[1]);
      toks.forEach((w,j)=>{if(cand.includes(j)){const m=w.match(/^([^\p{L}']*)([\p{L}']+)(.*)$/u);parts.push(m[1]);hid.push(m[2]);parts.push(null);parts.push(m[3])}else parts.push(w)})}
    return {parts,hid}}
  function show(){if(i>=vs.length)return endCard(el,"All verses done! 📖",`${vs.length} verse${vs.length>1?"s":""} built`,g);
    const v=vs[i],{parts,hid}=parse(v.text),fill=hid.map(()=>null),bank=shuffle(hid.map((w,k)=>({w,k})));let res=null;
    const draw=()=>{let b=0;el.innerHTML=`<div class="scoreline"><span>Verse ${i+1}/${vs.length}</span><span>${esc(v.ref||"")}</span></div>
      <div class="stage"><div class="vtext">${parts.map(p=>p===null?(()=>{const k=b++;return `<button class="blank ${res?(res[k]?"right":"wrong"):""}" data-b="${k}">${fill[k]!=null?esc(bank[fill[k]].w):"&nbsp;"}</button>`})():esc(p)).join("")}</div>
      ${v.ref?`<div class="tag" style="text-align:center">${esc(v.ref)}</div>`:""}</div>
      <div class="bank">${bank.map((x,j)=>`<button class="wbtn" data-w="${j}" ${fill.includes(j)?"disabled":""}>${esc(x.w)}</button>`).join("")}</div>
      ${fill.every(x=>x!=null)?`<button class="btn gold" id="vc">✅ Check</button>`:`<p class="hint" style="text-align:center">Tap a word to put it in the next blank. Tap a blank to clear it.</p>`}`;
      el.querySelectorAll("[data-w]").forEach(btn=>btn.onclick=()=>{const k=fill.indexOf(null);if(k<0)return;fill[k]=+btn.dataset.w;res=null;draw()});
      el.querySelectorAll("[data-b]").forEach(btn=>btn.onclick=()=>{fill[+btn.dataset.b]=null;res=null;draw()});
      $("#vc")&&($("#vc").onclick=()=>{res=fill.map((j,k)=>norm(bank[j].w)===norm(hid[k]));if(res.every(Boolean)){win("Great job! 📖");setTimeout(()=>{if(live(el)){i++;show()}},1400);draw();$("#vc")?.remove()}else{draw();toast("Some words are in the wrong place")}})};
    draw()}
  show()},
/* --- Word search --- */
wordsearch(g,el){const its=filled(g).map(x=>({w:clean(x.w),h:x.hint})).filter(x=>x.w);const N=Math.max(+(g.data.size||10),...its.map(x=>x.w.length));
  const D=[[0,1],[1,0],[1,1],[-1,1]];let grid,placed;
  for(let attempt=0;attempt<30;attempt++){grid=Array.from({length:N},()=>Array(N).fill(""));placed=[];let ok=true;
    for(const it of shuffle(its).sort((a,b)=>b.w.length-a.w.length)){let done=false;
      for(let k=0;k<300&&!done;k++){const [dr,dc]=D[Math.floor(Math.random()*D.length)],L=it.w.length;
        const r0=dr<0?L-1+Math.floor(Math.random()*(N-L+1)):dr?Math.floor(Math.random()*(N-L+1)):Math.floor(Math.random()*N),c0=dc?Math.floor(Math.random()*(N-L+1)):Math.floor(Math.random()*N);
        if([...it.w].every((ch,j)=>{const v=grid[r0+dr*j][c0+dc*j];return !v||v===ch})){[...it.w].forEach((ch,j)=>grid[r0+dr*j][c0+dc*j]=ch);placed.push({...it,cells:[...it.w].map((_,j)=>(r0+dr*j)*N+c0+dc*j)});done=true}}
      if(!done){ok=false;break}}
    if(ok)break}
  const AZ="ABCDEFGHIJKLMNOPRSTUWY";grid.forEach(r=>r.forEach((v,j)=>{if(!v)r[j]=AZ[Math.floor(Math.random()*AZ.length)]}));
  const found=new Map();let a=null;
  el.innerHTML=`<div class="stage"><div class="scoreline"><span>🔍 Find ${placed.length} words</span><span id="wf">0/${placed.length}</span></div>
   <div class="ws" id="ws" style="grid-template-columns:repeat(${N},1fr)">${grid.flat().map((ch,k)=>`<button data-k="${k}">${ch}</button>`).join("")}</div>
   <p class="hint" style="text-align:center">Tap the first letter, then the last letter of a word.</p>
   <div class="wlist">${placed.map((p,j)=>`<span id="wl${j}">${p.w}${p.h?` <small class="tag">(${esc(p.h)})</small>`:""}</span>`).join("")}</div></div>`;
  const cells=[...el.querySelectorAll("#ws button")];
  cells.forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(a===null){a=k;b.classList.add("sel");return}
    const r1=Math.floor(a/N),c1=a%N,r2=Math.floor(k/N),c2=k%N,dr=Math.sign(r2-r1),dc=Math.sign(c2-c1),len=Math.max(Math.abs(r2-r1),Math.abs(c2-c1))+1;
    cells[a].classList.remove("sel");const first=a;a=null;if(first===k)return;
    if(!(r1===r2||c1===c2||Math.abs(r2-r1)===Math.abs(c2-c1))){toast("Pick letters in a straight line");return}
    const path=Array.from({length:len},(_,j)=>(r1+dr*j)*N+c1+dc*j),key=path.join(),rk=path.slice().reverse().join();
    const j=placed.findIndex((p,jj)=>!found.has(jj)&&(p.cells.join()===key||p.cells.join()===rk));
    if(j<0){toast("Not a word from the list");return}
    found.set(j,1);p_mark(path,found.size-1);$("#wl"+j).classList.add("done");$("#wf").textContent=`${found.size}/${placed.length}`;
    if(found.size===placed.length)setTimeout(()=>live(el)&&endCard(el,"You found them all! 🔍",`${placed.length} words`,g),700);else toast("Found "+placed[j].w+" ✅")});
  function p_mark(path,n){path.forEach(k=>{cells[k].className="f"+(n%5)})}},
/* --- Matching pairs --- */
match(g,el){const ps=filled(g);const cards=shuffle(ps.flatMap((p,i)=>[{i,s:0,t:p.l},{i,s:1,t:p.r}]));let open=[],got=0,moves=0,lock=false;
  el.innerHTML=`<div class="scoreline"><span id="mm">Moves: 0</span><span id="mp">Pairs: 0/${ps.length}</span></div>
   <div class="mgrid">${cards.map((c,k)=>`<button class="mcard side${c.s}" data-k="${k}" aria-label="Card">✝️</button>`).join("")}</div>`;
  el.querySelectorAll(".mcard").forEach(b=>b.onclick=()=>{if(lock||b.classList.contains("open")||b.classList.contains("got"))return;const c=cards[+b.dataset.k];
    b.classList.add("open");b.textContent=c.t;open.push(b);if(open.length<2)return;moves++;$("#mm").textContent="Moves: "+moves;
    const [x,y]=open.map(o=>cards[+o.dataset.k]);
    if(x.i===y.i&&x.s!==y.s){open.forEach(o=>{o.classList.remove("open");o.classList.add("got")});open=[];got++;$("#mp").textContent=`Pairs: ${got}/${ps.length}`;
      if(got===ps.length)setTimeout(()=>live(el)&&endCard(el,"All pairs matched! 🃏",`You did it in ${moves} moves`,g),700)}
    else{lock=true;setTimeout(()=>{open.forEach(o=>{o.classList.remove("open");o.textContent="✝️"});open=[];lock=false},1000)}})},
/* --- Hangman / Guess the word --- */
hangman(g,el){const ws=filled(g).filter(x=>clean(x.w));let i=0,wins=0;
  function show(){if(i>=ws.length)return endCard(el,`${wins} of ${ws.length} words!`,"Keep your lamp burning 🪔",g);
    const raw=ws[i].w.toUpperCase().trim(),letters=new Set(clean(raw)),got=new Set(),bad=new Set(),MAX=6;let over=false;
    const draw=()=>{const lives=MAX-bad.size,won=[...letters].every(l=>got.has(l));
      el.innerHTML=`<div class="scoreline"><span>Word ${i+1}/${ws.length}</span><span>✅ ${wins}</span></div>
      <div class="stage"><div class="lamp" aria-label="${lives} lives">${lives>0?"🪔":"🌑"}<br><span style="font-size:1.4rem">${"💧".repeat(lives)}${"▫️".repeat(MAX-lives)}</span></div>
      ${ws[i].hint?`<div class="tag" style="text-align:center">💡 ${esc(ws[i].hint)}</div>`:""}
      <div class="hword">${[...raw].map(ch=>/[A-Z]/.test(ch)?`<span>${got.has(ch)||over?ch:""}</span>`:`<span class="sp">${ch===" "?"":esc(ch)}</span>`).join("")}</div>
      ${over?`<div class="bigq">${won?"🎉 You got it!":"🌑 The lamp went out"}</div><button class="btn gold" id="nx">${i<ws.length-1?"Next word ›":"Finish ›"}</button>`:
      `<div class="keys">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>`<button data-l="${l}" class="${got.has(l)?"yes":bad.has(l)?"no":""}" ${got.has(l)||bad.has(l)?"disabled":""}>${l}</button>`).join("")}</div>`}</div>`;
      if(over){$("#nx").onclick=()=>{i++;show()};return}
      el.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{const l=b.dataset.l;(letters.has(l)?got:bad).add(l);
        if([...letters].every(x=>got.has(x))){over=true;wins++;confetti()}else if(bad.size>=MAX)over=true;draw()})};
    draw()}
  show()},
/* --- Crossword --- */
crossword(g,el){const its=filled(g).filter(x=>clean(x.w)&&x.clue),cw=buildCross(its);
  if(!cw.words.length){el.innerHTML=`<div class="empty">Couldn't build a crossword from these words.</div>`;return}
  const {W,H,words}=cw,cell={};words.forEach(w=>[...w.w].forEach((ch,j)=>{const k=(w.r+(w.d?j:0))*W+(w.c+(w.d?0:j));cell[k]=ch}));
  const num={};words.forEach(w=>{const k=w.r*W+w.c;num[k]=w.n});
  const across=words.filter(w=>!w.d).sort((a,b)=>a.n-b.n),down=words.filter(w=>w.d).sort((a,b)=>a.n-b.n);
  el.innerHTML=`<div class="stage" style="padding:12px"><div class="cw" style="--cs:min(36px,calc((100vw - 64px) / ${W}));grid-template-columns:repeat(${W},var(--cs))">
   ${Array.from({length:W*H},(_,k)=>cell[k]?`<div class="cell" data-k="${k}">${num[k]?`<span class="num">${num[k]}</span>`:""}<input maxlength="1" data-k="${k}" aria-label="Square" autocomplete="off" autocapitalize="characters"></div>`:`<div></div>`).join("")}</div></div>
   <div class="two"><button class="btn gold" id="cc">✅ Check</button><button class="btn alt" id="cr">👀 Show answers</button></div>
   <div class="clist card">${across.length?`<div><b>➡️ Across</b><ol>${across.map(w=>`<li><b>${w.n}.</b> ${esc(w.clue)} (${w.w.length})</li>`).join("")}</ol></div>`:""}
   ${down.length?`<div><b>⬇️ Down</b><ol>${down.map(w=>`<li><b>${w.n}.</b> ${esc(w.clue)} (${w.w.length})</li>`).join("")}</ol></div>`:""}</div>`;
  let dir=0;const inp=k=>el.querySelector(`input[data-k="${k}"]`);
  el.querySelectorAll(".cw input").forEach(i=>{
    i.addEventListener("focus",()=>{const k=+i.dataset.k;if(dir===0&&!cell[k+1]&&!cell[k-1])dir=1;else if(dir===1&&!cell[k+W]&&!cell[k-W])dir=0});
    i.addEventListener("input",()=>{i.value=clean(i.value).slice(-1);i.parentElement.classList.remove("right","wrong");const k=+i.dataset.k,n=dir?k+W:k+1;if(i.value&&cell[n]&&(dir||n%W))inp(n).focus()});
    i.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!i.value){const k=+i.dataset.k,p=dir?k-W:k-1;if(cell[p]&&(dir||k%W)){inp(p).focus();inp(p).value=""}}})});
  $("#cc").onclick=()=>{let all=true,any=false;Object.keys(cell).forEach(k=>{const i=inp(k),c=i.parentElement;c.classList.remove("right","wrong");if(!i.value){all=false;return}any=true;
    const ok=i.value.toUpperCase()===cell[k];c.classList.add(ok?"right":"wrong");if(!ok)all=false});
    if(all)win("Crossword complete! ➕");else toast(any?"Green is right, red needs fixing":"Type some letters first")};
  $("#cr").onclick=()=>{if(!confirm("Show all the answers?"))return;Object.keys(cell).forEach(k=>{inp(k).value=cell[k]})}},
/* --- Picture guess --- */
picture(g,el){const ps=filled(g).filter(x=>x.img&&x.ans);let i=0,score=0;
  function show(){if(i>=ps.length)return endCard(el,`${score} points`,`${ps.length} picture${ps.length>1?"s":""}`,g);
    const p=ps[i];let off=new Set(),over=false,hint=false;const order=shuffle([...Array(16).keys()]);
    const pts=()=>Math.max(10,160-off.size*10-(hint?20:0));
    const draw=()=>{el.innerHTML=`<div class="scoreline"><span>Picture ${i+1}/${ps.length}</span><span>⭐ ${score}</span></div>
      <div class="stage"><div class="pic"><img src="${esc(imgSrc(p.img))}" alt="Mystery picture"><div class="tiles">${[...Array(16).keys()].map(k=>`<i class="${over||off.has(k)?"off":""}"></i>`).join("")}</div></div>
      ${over?`<div class="reveal">${esc(p.ans)}</div><button class="btn gold" id="nx">${i<ps.length-1?"Next picture ›":"See score ›"}</button>`:
      `<div class="tag" style="text-align:center">Worth ${pts()} points now${hint&&p.hint?` · 💡 ${esc(p.hint)}`:""}</div>
       <form class="guess" id="gf"><input id="gi" placeholder="What is it?" autocomplete="off" aria-label="Your guess"><button class="btn" type="submit">Guess</button></form>
       <div class="two"><button class="btn alt" id="more" ${off.size>=16?"disabled":""}>🧩 Show a piece</button>${p.hint&&!hint?`<button class="btn alt" id="hn">💡 Hint</button>`:`<button class="btn alt" id="rv">👀 Reveal</button>`}</div>`}</div>`;
      if(over){$("#nx").onclick=()=>{i++;show()};return}
      $("#gf").onsubmit=e=>{e.preventDefault();const v=$("#gi").value;if(!v.trim())return;if(norm(v)===norm(p.ans)){score+=pts();win(`Yes! +${pts()}`);over=true;draw()}else{toast("Not quite, try again");$("#gi").select()}};
      $("#more").onclick=()=>{off.add(order[off.size]);draw()};$("#hn")&&($("#hn").onclick=()=>{hint=true;draw()});$("#rv")&&($("#rv").onclick=()=>{over=true;draw()})};
    off.add(order[0]);off.add(order[1]);draw()}
  show()},
};

/* ---------- crossword generator ---------- */
function buildCross(items){const ws=items.map(it=>({w:clean(it.w),clue:it.clue,src:it})).filter(x=>x.w.length>1);
  let best=null;
  for(let attempt=0;attempt<200;attempt++){const list=attempt===0?ws.slice().sort((a,b)=>b.w.length-a.w.length):attempt<100?shuffle(ws).sort((a,b)=>b.w.length-a.w.length+(Math.random()-.5)*4):shuffle(ws);
    const G=new Map(),placed=[],left=[];const at=(r,c)=>G.get(r+","+c);
    const can=(w,r,c,d)=>{let hits=0;const dr=d?1:0,dc=d?0:1;if(at(r-dr,c-dc)||at(r+dr*w.length,c+dc*w.length))return -1;
      for(let j=0;j<w.length;j++){const rr=r+dr*j,cc=c+dc*j,v=at(rr,cc);if(v){if(v!==w[j])return -1;hits++}else if(at(rr+dc,cc+dr)||at(rr-dc,cc-dr))return -1}return hits};
    const put=(x,r,c,d)=>{[...x.w].forEach((ch,j)=>G.set((r+(d?j:0))+","+(c+(d?0:j)),ch));placed.push({...x,r,c,d})};
    put(list[0],0,0,0);let pending=list.slice(1),progress=true;
    while(pending.length&&progress){progress=false;const next=[];
      for(const x of pending){let opt=null;
        for(const p of placed)for(let a=0;a<p.w.length;a++)for(let b=0;b<x.w.length;b++){if(p.w[a]!==x.w[b])continue;const d=p.d?0:1;
          const r=p.d?p.r+a:p.r-b,c=p.d?p.c-b:p.c+a;const h=can(x.w,r,c,d);if(h>0&&(!opt||h>opt.h))opt={r,c,d,h}}
        if(opt){put(x,opt.r,opt.c,opt.d);progress=true}else next.push(x)}
      pending=next}
    left.push(...pending);
    const rs=placed.flatMap(p=>[p.r,p.r+(p.d?p.w.length-1:0)]),cs=placed.flatMap(p=>[p.c,p.c+(p.d?0:p.w.length-1)]);
    const r0=Math.min(...rs),c0=Math.min(...cs),W=Math.max(...cs)-c0+1,H=Math.max(...rs)-r0+1;
    const sc=placed.length*1000-W*H-Math.abs(W-H)*4;
    if(!best||sc>best.sc)best={sc,W,H,left:left.map(x=>x.src),words:placed.map(p=>({...p,r:p.r-r0,c:p.c-c0}))};
    if(!left.length&&attempt>30)break}
  const starts=[...new Set(best.words.map(w=>w.r*best.W+w.c))].sort((a,b)=>a-b);best.words.forEach(w=>w.n=starts.indexOf(w.r*best.W+w.c)+1);
  return best}

/* ---------- routes ---------- */
window.builderRoute=function(h){
  if(h.startsWith("gplay-")){kidPlay(h.slice(6));return true}
  if((h==="builder"||/^b(new|edit|play)-/.test(h))&&!myPin()){pinGate(h);return true}
  if(h==="builder"){builderHome();return true}
  if(h.startsWith("bnew-")){const k=h.slice(5);if(!T[k])return false;editor(newGame(k),true);return true}
  if(h.startsWith("bedit-")){const g=getGame(h.slice(6));if(!g){builderHome();return true}editor(g,false);return true}
  if(h.startsWith("bplay-")){const g=getGame(h.slice(6));if(!g){builderHome();return true}play(g);return true}
  return false};
window.HV_TEMPLATES=T;
})();
