/* Heavenly Visions: the main app script (was inline in index.html). Loaded last, deferred, so the page paints before the scripts run. */
const LOGO="logo.webp";
const CHANNEL="https://www.youtube.com/@Heavenly-Visions1";
const PLAYLIST="https://www.youtube.com/playlist?list=PLODEsfRWZ4X_2gHH9xGWFMAk50Q9iNGzF";
// Attendance web app (Google Apps Script). Empty = attendance not switched on yet.
const GAMES_URL=(()=>{try{const q=new URLSearchParams(location.search).get("api");if(q&&location.hostname==="localhost")return q}catch{}return "https://script.google.com/macros/s/AKfycbw8IM61QcNvGL6X0gvueC3GCxzpPtARXKgdD0MyPMFEWUNYJpKKAf8R6Msx5ZRh_4Nt/exec"})();window.GAMES_URL=GAMES_URL;
const ATTEND_URL="https://script.google.com/macros/s/AKfycbw1GmjKo9zVdUrvA0br7lfDJcNRGYSJaaMyBzQ305vv38G2lxoYRM5KtSqjsEf5R_sz/exec";
const IS_LIVE=/github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem("hv_"+k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem("hv_"+k,JSON.stringify(v))}catch{}if(window.hvSyncSoon&&k!=="games")hvSyncSoon()}};
const app=$("#app");

/* ================= DATA ================= */
const SECTIONS=[
 {id:"songs",name:"Songs",ic:"🎶",c:"#e86f8a"},
 {id:"prek",name:"Pre K",ic:"🧸",c:"#f2a65a"},{id:"kg",name:"KG",ic:"🎈",c:"#e86f8a"},
 {id:"g1",name:"Grade 1",ic:"⭐",c:"#2f8fc0"},{id:"g2",name:"Grade 2",ic:"🦁",c:"#6aa84f"},
 {id:"g3",name:"Grade 3",ic:"📖",c:"#8e6bd1"},{id:"g4",name:"Grade 4",ic:"🕊️",c:"#3fb6a8"},
 {id:"g5",name:"Grade 5",ic:"⛪",c:"#d98a2b"},{id:"g6",name:"Grade 6",ic:"✝️",c:"#b9852b"},
 {id:"g7",name:"Grade 7",ic:"🌍",c:"#4a7bd0"},{id:"g8",name:"Grade 8",ic:"🔥",c:"#d4553b"},
 {id:"g9",name:"Grade 9",ic:"🛡️",c:"#5b6b8c"},{id:"g10",name:"Grade 10",ic:"👑",c:"#a0782f"},{id:"g11",name:"Grade 11",ic:"🕯️",c:"#7a5ab8"},{id:"g12",name:"Grade 12",ic:"🎓",c:"#2e8b8b"},
 {id:"feasts",name:"Feasts & Seasons",ic:"🗓️",c:"#2f8fc0"},{id:"saints",name:"Saints",ic:"😇",c:"#b9852b"},
];
const V=[
 ["ArIC3kr3um0","The 7 Days of Creation","2:23","prek"],["apX8Aj9cmkI","Adam and Eve's Fall and God's Love","4:12","prek"],
 ["u9PhDJkbQHM","Archangel Michael","2:00","prek"],["hboXmJYMZEo","Samuel's Call from God","4:10","prek"],
 ["7fVngbW80HY","St. Mary Said Yes","3:35","saints"],["hS4Ux62FcJ0","The Bible: God's Special Gift to Us","2:03","kg"],
 ["ALQ2yXi4Yzc","God Gave Us Abouna!","2:30","kg"],["WhiR1XqxIBM","Tour of the Coptic Orthodox Church","2:49","kg"],
 ["2CEJrgi4uGc","Holy Communion: The Greatest Gift","2:04","kg"],["ZsH9dHvy41U","Together With God: The Family Jesus Loved","2:52","kg"],
 ["sRSsgo4-D0o","Thank You, God, In Every Moment","1:54","kg"],["6Iyg0UPx7Nk","Jesus Brings Light Into the Darkness","1:58","kg"],
 ["N47YmrfnJYo","God Made You Special: Discover Your Gift","3:51","kg"],["ZDRMmShq1jg","The Story of St. Mary (Part 2)","2:07","saints"],
 ["wzs5AUAI8AI","St. George: The Brave Soldier of Faith","2:30","saints"],["9LJMzNc5w9w","St. Moses the Strong","3:06","saints"],
 ["wzEpgARzpo4","St. Demiana and the Forty Virgins","3:00","saints"],["2L2h8Wxv9fo","St. Abraam: God Wants Us to Help the Poor","1:43","saints"],
 ["UQfpRmoRAAI","The Ascension of Jesus","2:16","kg"],["CMnye7L_E2o","Pentecost: The Day the Holy Spirit Came","2:04","kg"],
 ["I_iuKkKC_Zg","What Is the Apostles' Fast?","1:51","kg"],["sGdE0I9DA8w","The Feast of the Holy Apostles","2:15","kg"],
 ["gMAFxDCTzr8","The Transfiguration of Jesus","2:54","kg"],["BHKgrAQCs3A","Happy Coptic New Year! The Story of Nayrouz","2:39","kg"],
 ["iuXjBbh0kp0","Daniel and the Lions' Den","2:25","g1"],["FwCOA9rChw4","St. Mark: The Roar of Faith","3:12","g2"],
 ["7TxD6UvY9G4","St. Mark's Mission to Egypt","1:45","g2"],["RzKpf-uI1gA","God's Love and the Fall","3:14","g6"],
 ["Rq7UcDSDdLg","The Sacrament of the Eucharist","2:59","g6"],["BqnM-BuA9MY","The Month of Kiahk","2:13","feasts"],
 ["alqMhECRjw0","The Fast of Nativity","2:43","feasts"],["nf9nTCL1GMk","Mary and the Angel Gabriel","1:57","feasts"],
 ["s4Qo9-oABQ0","Mary Meets Elizabeth","2:26","feasts"],["el-9WkiWryU","The Birth of John the Baptist","2:58","feasts"],
 ["B1APrQsFZ1E","Treasures in Heaven (Great Lent, 1st Sunday)","1:59","feasts"],["S_ON5DE_nxs","Jesus Defeats Temptation (Lent, 2nd Sunday)","3:02","feasts"],
 ["lrN2Cwo0xWE","The Prodigal Son (Lent, 3rd Sunday)","3:04","feasts"],["bNAVYOueJfE","Jesus and the Samaritan Woman (Lent, 4th Sunday)","1:56","feasts"],
 ["dg3AfECkK_Q","Jesus Heals the Paralytic (Lent, 5th Sunday)","2:11","feasts"],["ghpnx_TAW58","The Man Born Blind (Lent, 6th Sunday)","2:16","feasts"],
 ["3K9qe15m0Ag","Doubting Thomas Learns to Believe","2:25","feasts"],["1Cjo-Zxt-Cs","St. Philopater Mercurius","2:49","saints"],
 ["pvg0arL3GfU","St. Athanasius and the Council of Nicaea","3:37","saints"],["f7vl5pEVHnI","The Story of St. Mary (Part 1)","2:05","saints"],
 ["ZH6C0fpF_Vc","Jesus Is Alive! The Resurrection (song)","4:02","songs"],
 ["6ZfefQb5R6U","The King Has Arrived: Jesus Enters Jerusalem (song)","7:56","songs"],
 ["Do41H2mzad8","The Greatest Love Story Ever Told: Good Friday (song)","3:22","songs"],
 ["YjAI1Rkck-U","Living for You: Fasting Song","1:27","songs"],
 ["duAYMBpBRe8","God Keeps His Promises: Zechariah and Baby John (song)","2:36","songs"],
 ["LtLLDDaH56I","The Story of St. Philopater Mercurius (song)","2:41","songs"],
 ["NeeQC_AwgdQ","The Legend of St. George (song)","2:04","songs"],
 ["-ULmTcp3A5s","Family Is God's Gift (song)","1:21","songs"],
 ["Uj3bTGkBdYw","We Are God's Gifts: Every Talent Shines (song)","2:58","songs"],
 ["S3xfjAHz2d4","Daniel and the Lions' Den (song)","2:46","songs"],
 ["cjRS8Zs58Dk","St. Mary Said Yes (song)","2:46","songs"],
 ["KyOjtZjBBQ4","St. Mark: Run With Jesus (song)","4:29","songs"],
 ["rNiY9PFe_3g","Speak, Lord, I Am Listening: Samuel (song)","4:10","songs"],
 ["XXrEYm55i0c","Adam and Eve: God's Promise of Love (song)","2:02","songs"],
 ["U87gJlu_qg4","Coptic Alphabet Song","2:25","songs"],
 ["_volkElfX1k","God Made the World in Seven Days (song)","2:25","songs"],
 ["O94kIqHBOYA","Archangel Michael Song","2:05","songs"],
 ["WQ-viHh3seU","St. Athanasius and the Council of Nicea (song)","2:30","songs"],
];
const QUIZZES=[
 {id:"creation",name:"Creation",ic:"🌍",c:"#3fb6a8",v:"ArIC3kr3um0",q:[
  ["What did God create on the first day?",["Light","Animals","Trees","The sea"],0],
  ["On which day did God rest?",["The 1st day","The 3rd day","The 7th day","The 5th day"],2],
  ["When did God make the sun, moon, and stars?",["Day 4","Day 1","Day 6","Day 2"],0],
  ["Who were the first man and woman?",["Abraham and Sarah","Adam and Eve","Noah and his wife","Joseph and Mary"],1],
  ["What was the name of the garden God made?",["Gethsemane","Eden","Babylon","Canaan"],1]]},
 {id:"daniel",name:"Daniel & the Lions",ic:"🦁",c:"#d98a2b",v:"iuXjBbh0kp0",q:[
  ["Why was Daniel thrown into the lions' den?",["He stole food","He kept praying to God","He ran away","He lied to the king"],1],
  ["How many times a day did Daniel pray?",["Once","Three times","Ten times","Never"],1],
  ["Which king threw Daniel into the den?",["King David","King Darius","King Herod","King Saul"],1],
  ["Who shut the lions' mouths?",["A soldier","An angel sent by God","Daniel's friends","The king"],1],
  ["What does Daniel teach us?",["Be brave and faithful to God","Lions are friendly","Never pray","Hide from danger"],0]]},
 {id:"stmary",name:"St. Mary",ic:"💙",c:"#2f8fc0",v:"7fVngbW80HY",q:[
  ["Which angel visited St. Mary?",["Michael","Raphael","Gabriel","Suriel"],2],
  ["In which town did St. Mary live when the angel came?",["Nazareth","Rome","Jericho","Alexandria"],0],
  ["What did St. Mary say to the angel?",["I am afraid","Let it be to me according to your word","Ask someone else","Not now"],1],
  ["Who was the baby of Elizabeth, St. Mary's cousin?",["Peter","John the Baptist","Samuel","Moses"],1],
  ["Where was Jesus born?",["Jerusalem","Bethlehem","Cairo","Nazareth"],1]]},
 {id:"pentecost",name:"Pentecost",ic:"🔥",c:"#d4553b",v:"CMnye7L_E2o",q:[
  ["How did the Holy Spirit appear on the disciples?",["As rain","As tongues of fire","As a cloud","As a star"],1],
  ["Pentecost is how many days after the Resurrection?",["7","40","50","100"],2],
  ["Which apostle preached to the crowd that day?",["Peter","Thomas","Judas","Paul"],0],
  ["About how many people were baptized that day?",["12","About 3,000","Only 5","1 million"],1],
  ["In which city did Pentecost happen?",["Bethlehem","Jerusalem","Nazareth","Rome"],1]]},
 {id:"prodigal",name:"The Prodigal Son",ic:"🐖",c:"#8e6bd1",v:"lrN2Cwo0xWE",q:[
  ["What did the younger son ask his father for?",["A horse","His share of the money","A new house","A party"],1],
  ["What job did he get when he ran out of money?",["Fisherman","Feeding pigs","Shepherd of sheep","Carpenter"],1],
  ["What did the father do when he saw his son coming back?",["Closed the door","Ran, hugged, and kissed him","Got angry","Ignored him"],1],
  ["Who was upset about the party?",["The servants","The older brother","The neighbors","The mother"],1],
  ["What does this story teach us?",["God forgives us when we come back to Him","Money is bad","Never leave home","Pigs are dirty"],0]]},
 {id:"stgeorge",name:"St. George",ic:"🐴",c:"#5b6b8c",v:"wzs5AUAI8AI",q:[
  ["What was St. George's job?",["Fisherman","Soldier","Doctor","Shepherd"],1],
  ["What did St. George refuse to do?",["Help the poor","Deny Christ and worship idols","Go to church","Pray"],1],
  ["What title does the Church give St. George?",["Prince of Martyrs","King of Egypt","Father of Monks","The Apostle"],0],
  ["In icons, St. George is usually shown riding a…",["Camel","Horse","Donkey","Lion"],1],
  ["What does St. George teach us?",["Be brave for Jesus","Fighting is fun","Hide your faith","Be rich"],0]]},
 {id:"nayrouz",name:"Nayrouz",ic:"🌴",c:"#c24d2c",v:"BHKgrAQCs3A",q:[
  ["Nayrouz is the start of which year?",["The Coptic New Year","The school year","The Chinese New Year","The Jewish New Year"],0],
  ["What is the first Coptic month?",["Kiahk","Tout","Baramhat","Amshir"],1],
  ["The Coptic calendar is called the Calendar of the…",["Kings","Martyrs","Pharaohs","Apostles"],1],
  ["Which red fruit with a white inside do we eat at Nayrouz?",["Banana","Dates","Grapes","Apples"],1],
  ["The red color of the dates reminds us of…",["The martyrs' blood","Fire","Roses","Tomatoes"],0]]},
 {id:"church",name:"Our Church",ic:"⛪",c:"#b9852b",v:"WhiR1XqxIBM",q:[
  ["What do we receive in Holy Communion?",["Bread and juice only","The Body and Blood of Christ","Candy","Holy water"],1],
  ["Who gives us Holy Communion?",["Abouna (the priest)","The choir","Our friends","Anyone"],0],
  ["Which direction does the altar face?",["West","North","East","South"],2],
  ["What do we do before taking Communion?",["Eat breakfast","Fast and confess","Play games","Sleep"],1],
  ["What is the church?",["God's house","A school","A shop","A playground"],0]]},
];
const BOOKS=[["Genesis",50],["Exodus",40],["Leviticus",27],["Numbers",36],["Deuteronomy",34],["Joshua",24],["Judges",21],["Ruth",4],["1 Samuel",31],["2 Samuel",24],["1 Kings",22],["2 Kings",25],["1 Chronicles",29],["2 Chronicles",36],["Ezra",10],["Nehemiah",13],["Esther",10],["Job",42],["Psalms",150],["Proverbs",31],["Ecclesiastes",12],["Song of Solomon",8],["Isaiah",66],["Jeremiah",52],["Lamentations",5],["Ezekiel",48],["Daniel",12],["Hosea",14],["Joel",3],["Amos",9],["Obadiah",1],["Jonah",4],["Micah",7],["Nahum",3],["Habakkuk",3],["Zephaniah",3],["Haggai",2],["Zechariah",14],["Malachi",4],
 ["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],["1 Corinthians",16],["2 Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],["Colossians",4],["1 Thessalonians",5],["2 Thessalonians",3],["1 Timothy",6],["2 Timothy",4],["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["1 Peter",5],["2 Peter",3],["1 John",5],["2 John",1],["3 John",1],["Jude",1],["Revelation",22]];
const VERSES=[["The Lord is my shepherd; I shall not want.","Psalm 23:1"],["Let the little children come to Me.","Matthew 19:14"],["I can do all things through Christ who strengthens me.","Philippians 4:13"],["God is love.","1 John 4:8"],["Your word is a lamp to my feet and a light to my path.","Psalm 119:105"],["Be kind to one another.","Ephesians 4:32"],["This is the day the Lord has made; let us rejoice and be glad in it.","Psalm 118:24"]];
const GRADES=["Pre K","KG","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];

/* ================= INTRO ================= */
function runIntro(){
  const intro=$("#intro"),end=$("#introEnd");$("#introLogo").src=LOGO;
  if(window.hvIntro){hvIntro(intro,end);return}
  requestAnimationFrame(()=>requestAnimationFrame(()=>end.classList.add("show")));
  setTimeout(()=>{intro.classList.add("out");setTimeout(()=>intro.remove(),600)},1600);
}

/* ================= HUB ================= */
function hub(){
  const v=VERSES[new Date().getDay()%VERSES.length];
  app.innerHTML=`${window.hvTopBar?hvTopBar():""}
  <header class="hubhead"><img src="${LOGO}" alt="Heavenly Visions"></header>
  ${window.hvGreeting?hvGreeting():""}
  ${(()=>{const L=store.get("lastLesson",null),l=L&&lessonOf(L.g,L.n);if(!l)return "";const vs=lessonVids(L.g,L.n),th=vs[0]?`<img src="https://i.ytimg.com/vi/${vs[0][0]}/hqdefault.jpg" alt="" loading="lazy" width="96" height="64">`:"";const tot=(CUR[L.g]||[]).reduce((a,b)=>a+b[1].length,0),dn=(CUR[L.g]||[]).reduce((a,b)=>a+b[1].filter(x=>isDone(L.g,x[0])).length,0),pct=tot?Math.max(4,Math.round(dn/tot*100)):0;return `<button class="cont2" data-go="l-${L.g}-${L.n}"><span class="th">${th}<span class="pl">${hvIcon("play2",14)}</span></span><span class="cn"><small>Continue watching</small><b>${esc(l[0]+" "+l[1])}</b><span class="cbar" aria-label="${dn} of ${tot} lessons done"><i style="width:${pct}%"></i></span></span></button>`})()}
  <nav class="doors" aria-label="Main">
    <button class="door d-media wide" data-go="media"><span class="big"><span class="medal"><span class="medal-in"><img src="${LOGO}" alt="" width="96" height="96"></span></span><svg class="medal-sp" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffe29a"/></svg></span><b>Sunday School</b><small>Lesson videos by grade</small></button>
    <button class="door d-att" data-go="attendance"><span class="big">${hvIcon("notes",96)}</span><b>Attendance</b><small>I'm here today!</small></button>
    <button class="door d-games" data-go="games"><span class="big">${hvIcon("game",96)}</span><b>Games</b><small>Play &amp; learn</small></button>
    <button class="door d-quiz" data-go="quizzes"><span class="big">${hvIcon("trophy",96)}</span><b>Quizzes</b><small>Test what you know</small></button>
    <button class="door d-bible" data-go="bible"><span class="big">${hvIcon("book",96)}</span><b>The Bible</b><small>Read God's Word</small></button>
  </nav>
  ${window.hvPostBtn?hvPostBtn():""}
  <div id="annbox"></div>
  ${window.hvToday?hvToday(v):`<div class="verse">“${esc(v[0])}”<cite>${v[1]}</cite></div>`}
  ${window.hvMoreDoors?hvMoreDoors():""}
  ${window.hvLumiTip?hvLumiTip():""}
  <footer><button class="workshop" data-go="servants">🔒 Servants Workshop <small>for servants</small></button><div id="offchip"></div><a class="tag privlink" href="privacy.html">Privacy policy</a><div class="tag" style="opacity:.85;font-size:.72rem;margin-top:6px">Version 114 · heavenlyvisions.app</div></footer>`;
  if(window.hvHomeInit)hvHomeInit();
}
function topbar(title,ic,sub,back="home",chips){
  if(window.hvHero)return hvHero(title,ic,sub,back,chips);
  return `<div class="topbar"><button class="back" data-go="${back}">← Back</button></div>
  <div class="title-row"><span style="font-size:2rem">${ic}</span><div><h1>${title}</h1>${sub?`<div class="tag">${sub}</div>`:""}</div></div>`;
}

/* ================= MEDIA ================= */
const sec=id=>SECTIONS.find(s=>s.id===id);
const inSec=id=>V.filter(v=>v[3]===id);
function rowHTML(v,showSec){const s=sec(v[3]);
  return `<button class="row" data-v="${v[0]}"><span class="thumb">${s.ic}<img src="https://i.ytimg.com/vi/${v[0]}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="dur">${v[2]}</span></span>
  <span style="min-width:0"><span class="t">${esc(v[1])}</span>${showSec?`<div class="g">${s.ic} ${s.name}</div>`:""}</span></button>`}
function media(){
  app.innerHTML=`${topbar("Sunday School","🎬",V.length+" lesson videos")}
  <label class="search"><span aria-hidden="true">🔍</span><input id="q" type="search" placeholder="Search lessons (e.g. St. Mary, Pentecost)" autocomplete="off"></label>
  <div id="results" class="list cols" hidden></div>
  <section class="sec" id="grades"><h2>Choose your class</h2><div class="grid">${SECTIONS.map(s=>{const n=CUR[s.id]?CUR[s.id].reduce((a,b)=>a+b[1].length,0):inSec(s.id).length,dn=CUR[s.id]?CUR[s.id].reduce((a,b)=>a+b[1].filter(l=>isDone(s.id,l[0])).length,0):0,pc=n?Math.round(dn/n*100):0;
    return `<button class="tile ${n?"":"soon"}" style="--c:${s.c}" data-go="m-${s.id}">${CUR[s.id]&&n&&pc>0?`<span class="pring" style="--p:${pc}" role="img" aria-label="${dn} of ${n} lessons done"><b>${pc}%</b></span>`:""}<span class="ic">${s.ic}</span><span class="nm">${s.name}</span><span class="ct">${n?n+(CUR[s.id]?" lesson":" video")+(n>1?"s":""):"Coming soon"}</span></button>`}).join("")}</div></section>
  <section class="sec"><h2>Newest lessons</h2><div class="list cols">${["BHKgrAQCs3A","gMAFxDCTzr8","ZDRMmShq1jg"].map(id=>rowHTML(V.find(v=>v[0]===id),true)).join("")}</div></section>`;
  const q=$("#q"),res=$("#results"),gr=$("#grades");
  q.addEventListener("input",()=>{const t=q.value.trim().toLowerCase();if(!t){res.hidden=true;gr.hidden=false;return}
    const m=V.filter(v=>v[1].toLowerCase().includes(t)||sec(v[3]).name.toLowerCase().includes(t));
    res.innerHTML=m.length?m.map(v=>rowHTML(v,true)).join(""):`<div class="empty">No lessons match "${esc(q.value)}"</div>`;res.hidden=false;gr.hidden=true});
}
const LV={
"prek|1.1":["ArIC3kr3um0","_volkElfX1k"],
"prek|1.2":["ArIC3kr3um0","_volkElfX1k"],
"prek|1.5":["ArIC3kr3um0","_volkElfX1k"],
"prek|2.3":["u9PhDJkbQHM","O94kIqHBOYA"],
"prek|3.1":["apX8Aj9cmkI","XXrEYm55i0c"],
"prek|3.3":["el-9WkiWryU","duAYMBpBRe8"],
"prek|3.4":["nf9nTCL1GMk","7fVngbW80HY","cjRS8Zs58Dk"],
"prek|4.4":["WhiR1XqxIBM"],
"prek|4.5":["hboXmJYMZEo","rNiY9PFe_3g"],
"prek|5.3":["hS4Ux62FcJ0"],
"prek|5.4":["ALQ2yXi4Yzc"],
"prek|6.2":["hboXmJYMZEo","rNiY9PFe_3g"],
"prek|6.3":["7fVngbW80HY","ZDRMmShq1jg","cjRS8Zs58Dk"],
"prek|7.2":["el-9WkiWryU","duAYMBpBRe8"],
"prek|7.6":["sRSsgo4-D0o"],
"kg|1.1":["BHKgrAQCs3A"],
"kg|1.4":["hboXmJYMZEo","rNiY9PFe_3g"],
"kg|1.5":["hboXmJYMZEo","rNiY9PFe_3g"],
"kg|2.1":["ArIC3kr3um0","_volkElfX1k"],
"kg|2.2":["ZsH9dHvy41U","-ULmTcp3A5s"],
"kg|2.5":["ALQ2yXi4Yzc"],
"kg|2.6":["hS4Ux62FcJ0"],
"kg|2.7":["2L2h8Wxv9fo"],
"kg|3.7":["ghpnx_TAW58"],
"kg|4.1S":["6ZfefQb5R6U","Do41H2mzad8"],
"kg|4.2S":["ZH6C0fpF_Vc"],
"kg|4.3S":["CMnye7L_E2o"],
"kg|4.9":["WhiR1XqxIBM"],
"kg|5.4":["lrN2Cwo0xWE"],
"kg|7.1":["apX8Aj9cmkI","XXrEYm55i0c","RzKpf-uI1gA"],
"kg|8.2":["CMnye7L_E2o"],
"kg|S.2":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g1|1.1S":["BHKgrAQCs3A"],
"g1|1.2":["ArIC3kr3um0","_volkElfX1k"],
"g1|1.5":["iuXjBbh0kp0","S3xfjAHz2d4"],
"g1|2.3":["CMnye7L_E2o"],
"g1|2.4":["ZsH9dHvy41U","-ULmTcp3A5s"],
"g1|2.8":["sRSsgo4-D0o"],
"g1|2.9":["2L2h8Wxv9fo"],
"g1|3.4":["ALQ2yXi4Yzc"],
"g1|4.1S":["lrN2Cwo0xWE"],
"g1|4.2":["el-9WkiWryU"],
"g1|5.2":["hS4Ux62FcJ0"],
"g1|5.4":["hS4Ux62FcJ0"],
"g1|6.2S":["sGdE0I9DA8w"],
"g2|1.1S":["BHKgrAQCs3A"],
"g2|1.5":["FwCOA9rChw4","7TxD6UvY9G4","KyOjtZjBBQ4"],
"g2|2.10":["WhiR1XqxIBM"],
"g2|2.5":["wzEpgARzpo4"],
"g2|2.6":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g2|2.9":["WhiR1XqxIBM"],
"g2|3.4":["ZDRMmShq1jg"],
"g2|4.1S":["ZDRMmShq1jg"],
"g2|5.4":["2L2h8Wxv9fo"],
"g2|6.4":["dg3AfECkK_Q"],
"g3|1.13":["ZsH9dHvy41U","-ULmTcp3A5s"],
"g3|1.2":["apX8Aj9cmkI","XXrEYm55i0c"],
"g3|2.12S":["YjAI1Rkck-U"],
"g3|2.13S":["nf9nTCL1GMk","7fVngbW80HY","cjRS8Zs58Dk"],
"g3|2.5":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g3|2.9":["sRSsgo4-D0o"],
"g3|3.1S":["CMnye7L_E2o"],
"g3|4.2":["u9PhDJkbQHM","O94kIqHBOYA"],
"g3|S.2":["ZH6C0fpF_Vc"],
"g4|1.1S":["wzs5AUAI8AI","NeeQC_AwgdQ"],
"g4|1.14S":["ZDRMmShq1jg"],
"g4|1.6":["2CEJrgi4uGc","Rq7UcDSDdLg"],
"g4|1.9":["iuXjBbh0kp0","S3xfjAHz2d4"],
"g4|2.1":["hS4Ux62FcJ0"],
"g4|4.1":["YjAI1Rkck-U"],
"g4|4.2":["I_iuKkKC_Zg","alqMhECRjw0"],
"g4|4.4S":["YjAI1Rkck-U"],
"g4|4.8":["I_iuKkKC_Zg"],
"g4|5.5":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g4|6.1":["sGdE0I9DA8w"],
"g4|6.3":["ZDRMmShq1jg"],
"g4|6.5":["ALQ2yXi4Yzc"],
"g5|1.1":["BHKgrAQCs3A"],
"g5|1.2":["3K9qe15m0Ag"],
"g5|3.5":["el-9WkiWryU","s4Qo9-oABQ0","duAYMBpBRe8"],
"g5|4.1S":["6ZfefQb5R6U","Do41H2mzad8"],
"g5|4.2S":["lrN2Cwo0xWE"],
"g5|4.3S":["ZH6C0fpF_Vc"],
"g5|4.7":["9LJMzNc5w9w"],
"g6|1.1":["hS4Ux62FcJ0"],
"g6|3.3":["RzKpf-uI1gA"],
"g6|4.5":["iuXjBbh0kp0","S3xfjAHz2d4"],
"g6|8.2":["Rq7UcDSDdLg","2CEJrgi4uGc"],
"g7|5.4":["S_ON5DE_nxs"],
"g8|8.4":["pvg0arL3GfU","WQ-viHh3seU"],
"g8|8.6":["WhiR1XqxIBM"],
"g8|9.4":["S_ON5DE_nxs"],
"g9|6.2":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g9|7.2":["6Iyg0UPx7Nk"],
"g10|4.2":["pvg0arL3GfU","WQ-viHh3seU"],
"g10|6.1":["S_ON5DE_nxs"],
"g10|7.S2":["sGdE0I9DA8w"],
"g10|8.2":["2CEJrgi4uGc","Rq7UcDSDdLg"],
"g11|6.5":["ghpnx_TAW58"],
"g12|4.2":["N47YmrfnJYo","Uj3bTGkBdYw"],
"g12|7.7":["2CEJrgi4uGc","Rq7UcDSDdLg"]};
const lessonOf=(g,n)=>{for(const b of CUR[g]||[])for(const l of b[1])if(l[0]===n)return l};
const lessonVids=(g,n)=>(LV[g+"|"+n]||[]).map(id=>V.find(v=>v[0]===id)).filter(Boolean);
const isStaffNow=()=>{const a=window.hvAcct&&hvAcct();return !!(a&&a.user&&a.user.role!=="student")};
function mediaSection(id){const s=sec(id);if(!s)return media();const vs=inSec(id);
  if(CUR[id])return gradeLessons(s);
  app.innerHTML=`${topbar(s.name,s.ic,vs.length?vs.length+" lesson"+(vs.length>1?"s":""):"Lessons coming soon","media")}
  <div class="list">${vs.length?vs.map(v=>rowHTML(v,false)).join(""):`<div class="empty">📚 ${s.name} lessons are on the way.<br>Check back soon!</div>`}</div>`}
function gradeLessons(s){const bl=CUR[s.id],n=bl.reduce((a,b)=>a+b[1].length,0),has=l=>!!lessonVids(s.id,l[0])[0];
  const soonN=bl.reduce((a,b)=>a+b[1].filter(l=>!has(l)).length,0),showSoon=!!(store.get("showsoon",{})[s.id]);
  const NEWV=["BHKgrAQCs3A","gMAFxDCTzr8","ZDRMmShq1jg"];
  const row=l=>{const v=lessonVids(s.id,l[0])[0],dn=isDone(s.id,l[0]),ti=`${l[0]} - ${esc(l[1])}`;
    return v?`<button class="row${dn?" isdone":""}" data-go="l-${s.id}-${l[0]}"><span class="thumb">${s.ic}<img src="https://i.ytimg.com/vi/${v[0]}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="dur">${v[2]}</span>${NEWV.includes(v[0])?`<span class="newb">New</span>`:""}</span><span style="min-width:0"><span class="t">${ti}</span>${dn?`<span class="dnchip">${hvIcon("check",16)} Done</span>`:""}</span></button>`
    :`<button class="row soonrow" data-go="l-${s.id}-${l[0]}"><span class="t">${ti}</span><small>Video coming soon</small></button>`};
  const blocks=bl.map(b=>{const ls=showSoon?b[1]:b[1].filter(has);return ls.length?`<section class="sec"><h2>${esc(b[0])}</h2><div class="list cols">${ls.map(row).join("")}</div></section>`:""}).join("");
  app.innerHTML=`${topbar(s.name,s.ic,n+" lessons · "+bl.reduce((a,b)=>a+b[1].filter(l=>isDone(s.id,l[0])).length,0)+" done ✅","media")}
  ${blocks||`<div class="empty">🎬 Videos for ${esc(s.name)} are on the way.<br>Check back soon!</div>`}
  ${soonN?`<button class="btn alt soontoggle" id="soonT" aria-pressed="${showSoon}">${showSoon?"Hide":"Show"} coming soon (${soonN})</button>`:""}`;
  const t=document.getElementById("soonT");if(t)t.onclick=()=>{const m=store.get("showsoon",{});m[s.id]=!showSoon;store.set("showsoon",m);gradeLessons(s)}}
const verseOf=(g,n)=>LVERSE[g+"|"+n];
const isDone=(g,n)=>store.get("done",[]).includes(g+"|"+n);
function bibleLink(ref){const m=(ref||"").match(/^((?:[1-3]\s?)?[A-Za-z]+(?:\s(?:of\s)?[A-Za-z]+)*?)\s*(\d+)/);if(!m)return "";let nm=m[1].replace(/\s+/g," ").trim().replace(/^(\d)(?=[A-Za-z])/,"$1 ");if(nm==="Psalm")nm="Psalms";const b=BOOKS.find(x=>x[0]===nm);return b?"b-"+b[0]+"-"+m[2]:""}
function lessonPage(g,n){const s=sec(g),l=lessonOf(g,n);if(!s||!l)return media();store.set("lastLesson",{g,n});const c=lessonVids(g,n).length,staff=isStaffNow(),dn=isDone(g,n),at=`data-g="${g}" data-n="${n}"`;
  app.innerHTML=`${topbar(l[0]+" - "+l[1],s.ic,s.name,"m-"+g)}
  <div class="list">
   ${(()=>{const vs=lessonVids(g,n),v=vs[0];if(!v)return `<div class="vhero soon">${hvScene("clap","sleepy",96)}<b>Video coming soon</b><small>Check back soon!</small></div>`;
     return `<button class="vhero" ${vs.length>1?`data-go="lv-${g}-${n}"`:`data-v="${v[0]}"`} aria-label="${vs.length>1?"Watch the videos":"Watch the video"}"><img src="https://i.ytimg.com/vi/${v[0]}/hqdefault.jpg" alt=""><span class="vglow" aria-hidden="true"></span><span class="vplay2" aria-hidden="true">${hvIcon("play2",30)}</span><span class="vdur">${v[2]}</span><span class="vlab"><b>${vs.length>1?"Watch the videos ("+vs.length+")":"Watch the video"}</b><small>${esc(v[1])}</small></span></button>`})()}
   <div class="grid">
    <button class="acard" style="--c:#3fae6a" data-la="verse" ${at}><span class="ai">${hvIcon("verse",52)}</span><span class="an"><b>Bible verse</b><small>Read it and learn it</small></span></button>
    <button class="acard" style="--c:#8e6bd1" data-la="quiz" ${at}><span class="ai">${hvIcon("trophy",52)}</span><span class="an"><b>Quiz</b><small>Test what you learned</small></span></button>
    <button class="acard" style="--c:#d4553b" data-la="game" ${at}><span class="ai">${hvIcon("game",52)}</span><span class="an"><b>Games</b><small>Play with the verse</small></span></button>
    <button class="acard${dn?" done":""}" style="--c:#e3b45c" data-la="done" ${at} aria-pressed="${dn}"><span class="ai">${dn?hvIcon("check",52):`<span class="emptyck"></span>`}</span><span class="an"><b>${dn?"Done!":"Mark as done"}</b><small>${dn?"Great job. Tap to undo":"Earn stars for this lesson"}</small></span></button>
   </div>
   ${staff?`<a class="curcard" href="https://drive.google.com/file/d/${CUR_PDF[g]}/view" target="_blank" rel="noopener"><span class="ai">${hvIcon("book",44)}</span><span class="an"><b>Curriculum material</b><small>${l[3]?"Open the book, page "+l[3]:"Open the book"}</small></span><span class="cg">Open</span></a>`
   :`<button class="curcard locked" data-act="lockmsg"><span class="ai">${hvIcon("lock",44)}</span><span class="an"><b>Curriculum material</b><small>For servants only</small></span></button>`}
  </div>${l[2]!==l[1]?`<div class="card sec"><div class="tag">${esc(l[2])}</div></div>`:""}`}
function lessonAction(act,g,n){const l=lessonOf(g,n);if(!l)return;const v=verseOf(g,n),vt=v&&v[0]?v[0]:"";
  if(act==="verse"){if(!v)return toast("Bible verse coming soon 📖");const bl=bibleLink(v[1]);
    sheet(`<h3>📖 Bible verse</h3>${vt?`<p style="font-size:1.2rem;font-weight:800">“${esc(vt)}”</p>`:""}<div class="tag">${esc(v[1]||"")}</div>
     <div class="btns">${bl?`<button class="btn gold" data-go="${bl}" data-close>📖 Read it in the Bible</button>`:""}</div>`,"Bible verse");return}
  if(act==="quiz"){const q=lessonVids(g,n).map(x=>QUIZZES.find(z=>z.v===x[0])).find(Boolean);if(q)return go("quiz-"+q.id);
    const vq=verseQuiz(g,n);if(vq)return go("quiz-"+vq);return toast("Quiz coming soon 🏆")}
  if(act==="game"){if(!vt)return toast("Game coming soon 🎮");return go("gm-"+g+"-"+n)}
  if(act==="done"){const d=store.get("done",[]),k=g+"|"+n,i=d.indexOf(k);if(i>=0)d.splice(i,1);else{d.push(k);if(window.hvAward)hvAward("lesson",g+"-"+n,"Lesson "+n);confetti();toast("Lesson done! 🎉")}
    store.set("done",d);lessonPage(g,n)}}
function verseQuiz(g,n){const v=verseOf(g,n),t=v&&v[0];if(!t)return "";const id="vq-"+g+"-"+n;
  const clean=w=>w.replace(/[^A-Za-z']/g,""),words=t.split(/\s+/);
  const idx=words.map((w,i)=>i).filter(i=>clean(words[i]).length>=4);if(idx.length<2)return "";
  const pool=[...new Set(Object.values(LVERSE).flatMap(x=>(x[0]||"").split(/\s+/).map(clean)).filter(w=>w.length>=4).map(w=>w.toLowerCase()))];
  const q=idx.sort(()=>Math.random()-.5).slice(0,4).map(i=>{const ans=clean(words[i]),low=ans.toLowerCase();
    const bad=pool.filter(w=>w!==low).sort(()=>Math.random()-.5).slice(0,3);
    return ["Fill the missing word: “"+words.map((w,k)=>k===i?"_____":w).join(" ")+"”",[ans,...bad],0]});
  const j=QUIZZES.findIndex(x=>x.id===id),Q={id,name:"Verse quiz",ic:"🏆",c:"#8e6bd1",v:"",q};if(j>=0)QUIZZES[j]=Q;else QUIZZES.push(Q);return id}
function versePuzzle(g,n){const l=lessonOf(g,n),v=verseOf(g,n);if(!l||!v||!v[0])return lessonPage(g,n);
  const words=v[0].split(/\s+/);let pick=[];const bank=words.map((w,i)=>i).sort(()=>Math.random()-.5);
  function draw(){const left=bank.filter(i=>!pick.includes(i)),fin=pick.length===words.length;
    app.innerHTML=`${topbar("Verse puzzle","🎮",l[0]+" - "+l[1],"l-"+g+"-"+n)}
    <div class="card sec"><div class="tag">Tap the words in the right order</div><div style="font-size:1.2rem;font-weight:800;min-height:3.2em">${pick.length?esc(pick.map(i=>words[i]).join(" ")):"…"}</div>${fin?`<div class="tag">${esc(v[1]||"")}</div>`:""}</div>
    ${fin?`<div class="card sec" style="text-align:center"><div class="stars">⭐⭐⭐</div><b>Well done! 🎉</b><div class="btns"><button class="btn gold" data-vp="again">🔁 Play again</button><button class="btn alt" data-go="l-${g}-${n}">Back to lesson</button></div></div>`
    :`<div>${left.map(i=>`<button class="chip" data-vp="${i}">${esc(words[i])}</button>`).join("")}</div><div class="btns"><button class="btn alt" data-vp="undo">↩️ Undo</button></div>`}`;
    if(fin){confetti();if(window.hvAward)hvAward("selfplay","vp-"+g+"-"+n,"Verse puzzle")}
    app.querySelectorAll("[data-vp]").forEach(b=>b.onclick=()=>{const k=b.dataset.vp;
      if(k==="again"){pick=[];bank.sort(()=>Math.random()-.5);return draw()}
      if(k==="undo"){pick.pop();return draw()}
      if(words[+k]===words[pick.length]){pick.push(+k);draw()}else toast("Not that one, try again 🙂")})}
  draw()}
function lessonVideos(g,n){const s=sec(g),l=lessonOf(g,n);if(!s||!l)return media();const vs=lessonVids(g,n);
  app.innerHTML=`${topbar("Media","🎬",l[0]+" - "+l[1],"l-"+g+"-"+n)}
  <div class="list">${vs.length?vs.map(v=>rowHTML(v,false)).join(""):`<div class="empty">🎬 Videos for this lesson are on the way.<br>Check back soon!</div>`}</div>`}
function openLesson(id){const v=V.find(x=>x[0]===id);if(!v)return;const s=sec(v[3]);const yt=`https://www.youtube.com/watch?v=${id}`;
  const quiz=QUIZZES.find(q=>q.v===id);
  sheet(`${IS_LIVE?`<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" title="${esc(v[1])}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
   :`<a class="thumb" href="${yt}" target="_blank" rel="noopener" style="font-size:3rem">${s.ic}<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" onerror="this.remove()"></a>`}
   <div><h3>${esc(v[1])}</h3><div class="tag">${s.ic} ${s.name} · ${v[2]}</div></div>
   <div class="btns"><a class="btn yt" href="${yt}" target="_blank" rel="noopener">▶ Watch on YouTube</a>
   ${quiz?`<button class="btn gold" data-go="quiz-${quiz.id}" data-close>🏆 Take the quiz</button>`:""}
   <button class="btn alt" data-copy="${yt}">🔗 Copy link</button></div>`,v[1])}
let _sheetFrom=null;
function sheet(html,label){closeSheet(true);_sheetFrom=document.activeElement;const scrim=document.createElement("div");scrim.className="scrim";
  scrim.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label||"")}" tabindex="-1"><button class="close" data-close>✕ Close</button>${html}</div>`;
  document.body.appendChild(scrim);document.body.classList.add("sheet-open");scrim.addEventListener("click",e=>{if(e.target===scrim)closeSheet()});
  const sh=scrim.querySelector(".sheet");
  /* focus trap: Tab stays inside the sheet */
  scrim.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const f=[...sh.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex=\"-1\"])")].filter(x=>x.offsetParent!==null);if(!f.length){e.preventDefault();return}const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
  /* swipe down to close (only when the sheet is scrolled to the top) */
  let y0=null;sh.addEventListener("touchstart",e=>{y0=sh.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
  sh.addEventListener("touchmove",e=>{if(y0===null)return;const dy=e.touches[0].clientY-y0;if(dy>0)sh.style.transform=`translateY(${Math.min(dy,200)}px)`},{passive:true});
  sh.addEventListener("touchend",e=>{if(y0===null)return;const dy=(e.changedTouches[0].clientY)-y0;y0=null;if(dy>90)closeSheet();else sh.style.transform=""});
  setTimeout(()=>{const c=sh.querySelector("[autofocus],input,textarea,select");(c||sh).focus({preventScroll:true})},30);
  return scrim}
function closeSheet(keep){document.querySelector(".scrim")?.remove();document.body.classList.remove("sheet-open");if(!keep&&_sheetFrom&&_sheetFrom.isConnected&&_sheetFrom!==document.body){try{_sheetFrom.focus({preventScroll:true})}catch{}}if(!keep)_sheetFrom=null}

/* ================= ATTENDANCE ================= */
const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function attendance(){
  const acc=window.hvAcct&&hvAcct();
  if(!acc){app.innerHTML=`${topbar("Attendance","✋","Check in every Sunday")}${hvGate({scene:"notes",title:"Check in every Sunday",lead:"Make a profile and your Sundays are saved.",benefits:[["star","Earn stars every Sunday"],["flame","See your streak grow"],["notes","Your teacher sees you came"]],preview:"streak",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`;return}
  const me={name:acc.user.name,grade:acc.user.grade};
  const hist=store.get("attended",[]);const already=hist.includes(todayKey());
  const day=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  app.innerHTML=`${topbar("Attendance","✋",day)}
    <div class="card"><b>Hi ${esc(me.name)}! 👋</b><div class="tag">${esc(me.grade||"")}</div></div>
    <button class="here ${already?"done":""}" data-act="attend">${already?"✅ You're checked in!":"✋ I'm here!"}<small>${already?"See you next Sunday 🙏":"Tap, then enter today's code"}</small></button>
    ${["student","servant","coordinator","priest","master"].includes(acc.user.role)?`<button class="btn" data-go="attsheet">📊 Attendance Sheet</button>`:""}
    ${isCoord()?`<button class="btn gold" data-act="setcode">🔑 Set attendance code for today's Sunday School</button>`:""}
    <section class="sec"><h2>My Sundays</h2>${hist.length?`<div class="hist">${hist.slice().reverse().map(d=>`<span>✅ ${d}</span>`).join("")}</div><div class="tag">${hist.length} day${hist.length>1?"s":""} at Sunday School. Keep it up!</div>`:`<div class="empty">Your check-ins will show here.</div>`}</section>`;
}
const isCoord=()=>{const a=window.hvAcct&&hvAcct();return !!(a&&a.user&&["coordinator","priest","master"].includes(a.user.role))};
async function gpost(body){const r=await fetch(GAMES_URL,{method:"POST",body:JSON.stringify(body)});return r.json()}
function attendSheet(){
  const acc=window.hvAcct&&hvAcct();if(!acc)return go("login");const me={name:acc.user.name,grade:acc.user.grade};
  if(store.get("attended",[]).includes(todayKey()))return toast("You're already checked in today ✅");
  const s=sheet(`<h3>Enter today's code</h3><div class="tag">Your coordinator will tell you the 3-digit code.</div>
   <form id="codeForm" class="sec"><label class="field"><span class="tag">Code</span><input id="code" class="codebox" inputmode="numeric" pattern="[0-9]{3,4}" maxlength="4" required autocomplete="off"></label>
   <div id="codeMsg" role="status"></div><button class="btn" type="submit" id="codeBtn">Check me in</button></form>`,"Enter code");
  const inp=$("#code");inp.focus();
  $("#codeForm").addEventListener("submit",async e=>{e.preventDefault();const msg=$("#codeMsg"),btn=$("#codeBtn");
    btn.disabled=true;btn.textContent="Checking…";msg.textContent="";
    try{let j=null;const body={action:"attend",id:acc.user.id,token:acc.token,code:inp.value.trim()};
      j=await gpost(body);
      if(j.ok||j.error==="already"){const h=store.get("attended",[]);if(!h.includes(todayKey()))h.push(todayKey());store.set("attended",h);if(window.hvAward)hvAward("attend",todayKey(),"Sunday School");closeSheet();attendance();confetti();toast(j.ok?"You're checked in! 🎉":"Already checked in today ✅")}
      else{msg.innerHTML=`<span class="err">${j.error==="nocode"?"Today's code isn't set yet. Ask your coordinator.":j.error==="code"?"That code isn't right. Check with your coordinator and try again.":j.error==="auth"?"Please login again.":j.error==="nograde"?"Pick your class in your profile first.":j.error==="nosunday"?"There is no Sunday School today.":"Something went wrong. Try again."}</span>`;btn.disabled=false;btn.textContent="Check me in"}}
    catch{msg.innerHTML=`<span class="err">No internet connection. Try again.</span>`;btn.disabled=false;btn.textContent="Check me in"}});
}
async function setCodeSheet(){
  const a=window.hvAcct&&hvAcct();if(!a||!isCoord())return;
  const auth={id:a.user.id,token:a.token};
  sheet(`<h3>🔑 Today's attendance code</h3><div id="scBox" class="tag">Loading…</div>`,"Attendance code");
  const draw=j=>{const box=$("#scBox");if(!box)return;
    if(!j.ok){box.innerHTML=`<span class="err">${j.error==="denied"||!j.error?"The attendance update isn't switched on yet. Ask the app owner.":"Could not load. Try again."}</span>`;return}
    box.outerHTML=`<div id="scBox">${j.code?`<div class="tag">Today's code (${esc(j.day)})</div><div style="font-size:2.6rem;font-weight:800;letter-spacing:8px;text-align:center">${esc(j.code)}</div>`:`<div class="tag">No code set for today yet.</div>`}
     <form id="scForm" class="sec"><label class="field">${j.code?"Change the code":"Set the code"} (3 digits)<input id="scCode" class="codebox" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" required autocomplete="off"></label><button class="btn gold" type="submit">Save code</button><div id="scMsg" role="status"></div></form>
     <div class="tag">${j.list.length} checked in today${j.list.length?":":""}</div>${j.list.length?`<div class="hist">${j.list.map(x=>`<span>✅ ${esc(x.n)} · ${esc(x.g)}</span>`).join("")}</div>`:""}</div>`;
    $("#scForm").addEventListener("submit",async e=>{e.preventDefault();const m=$("#scMsg");m.textContent="Saving…";
      try{const r=await gpost(Object.assign({action:"att_set",code:$("#scCode").value.trim()},auth));
        if(r.ok){toast("Code saved ✅");draw(await gpost(Object.assign({action:"att_state"},auth)))}else m.innerHTML=`<span class="err">${r.error==="code"?"The code must be exactly 3 digits.":"Could not save. Try again."}</span>`}
      catch{m.innerHTML=`<span class="err">No internet connection.</span>`}})};
  try{draw(await gpost(Object.assign({action:"att_state"},auth)))}catch{const b=$("#scBox");if(b)b.innerHTML=`<span class="err">No internet connection.</span>`}
}

/* ================= SERVANTS ================= */
function servants(){
  if(window.hvLock&&hvLock())return;
  app.innerHTML=`${topbar("Servants","🙏","Tools for class")}
  ${window.hvQuickNews?hvQuickNews():""}
  ${window.hvSvTools?hvSvTools():""}
  <section class="card sec"><h2>Attendance</h2>
   <form id="pinForm" class="sec"><label class="field">Servant PIN<input id="pin" type="password" inputmode="numeric" maxlength="8" required autocomplete="off"></label>
   <button class="btn gold" type="submit">Show code & attendance</button></form><div id="codeOut" role="status"></div></section>
  <button class="door d-games wide" data-go="builder" style="min-height:110px"><span class="big">🛠️</span><b>Game Builder</b><small>Make Kahoot, Jeopardy, Word Search and more</small></button>
  <div class="card"><b>📲 Share a lesson</b><p class="tag" style="margin:4px 0 0">Open any lesson and tap "Copy link" to send it to parents on WhatsApp.</p></div>
  <div class="card"><b>📌 Install the app</b><p class="tag" style="margin:4px 0 0">Android: Chrome menu, then "Add to Home screen". iPhone: Safari Share button, then "Add to Home Screen".</p></div>
  <a class="btn yt" href="${PLAYLIST}" target="_blank" rel="noopener">▶ All lessons playlist on YouTube</a>`;
  $("#pinForm").addEventListener("submit",e=>{e.preventDefault();servantPin=$("#pin").value;loadAtt()});
  hvLoad("lumi").then(()=>{lazyDone.lumi=1;if(window.hvLumiBadge&&document.getElementById("pinForm"))hvLumiBadge()}).catch(()=>{});
}
let servantPin="";
async function loadAtt(day){const out=$("#codeOut");
  if(!ATTEND_URL){out.innerHTML=`<p class="err">Attendance isn't switched on yet.</p>`;return}
  out.innerHTML=`<p class="tag">Loading…</p>`;
  try{const j=await (await fetch(ATTEND_URL+"?action=list&pin="+encodeURIComponent(servantPin)+(day?"&day="+day:""))).json();
    if(!j.ok){out.innerHTML=`<p class="err">Wrong PIN.</p>`;return}
    $("#pinForm").hidden=true;
    const days=j.days.includes(j.date)?j.days:[j.date,...j.days];
    const byClass={};j.list.forEach(r=>{(byClass[r[2]]=byClass[r[2]]||[]).push(r)});
    const order=GRADES.filter(g=>byClass[g]).concat(Object.keys(byClass).filter(g=>!GRADES.includes(g)));
    out.innerHTML=`<div class="bigcode">${j.code}</div><p class="tag" style="text-align:center;margin:0">Today's code (${j.date}). It changes every day.</p>
    <label class="field" style="margin-top:10px">Attendance for<select id="attDay">${days.map(d=>`<option ${d===j.day?"selected":""}>${d}</option>`).join("")}</select></label>
    <div class="stat"><span>✅ ${j.list.length} checked in</span><button class="back" id="attRefresh" style="padding:4px 12px">↻ Refresh</button></div>
    ${j.list.length?order.map(g=>`<div><b>${esc(g)} (${byClass[g].length})</b><div class="list" style="margin-top:6px">${byClass[g].map(r=>`<div class="card" style="padding:10px 14px;display:flex;justify-content:space-between;gap:10px"><span style="font-weight:800">${esc(r[1])}</span><span class="tag">${esc(r[0])}</span></div>`).join("")}</div></div>`).join(""):`<div class="empty">No check-ins yet for this day.</div>`}`;
    $("#attDay").onchange=e=>loadAtt(e.target.value);$("#attRefresh").onclick=()=>loadAtt($("#attDay").value);}
  catch{out.innerHTML=`<p class="err">No internet connection.</p>`}}

/* ================= QUIZZES ================= */
function quizzes(){const best=store.get("best",{});
  const diff=n=>n<=5?"Easy":n<=8?"Medium":"Hard",star=(q)=>{const n=best[q.id]!=null?starsFor(best[q.id],q.q.length):0;return `<span class="qstars" aria-label="${n} of 3 stars">${"★".repeat(n)}${"☆".repeat(3-n)}</span>`};
  const rec=QUIZZES.find(q=>best[q.id]==null),done=QUIZZES.filter(q=>best[q.id]!=null).length;
  const card=q=>`<button class="qcov" style="--c:${q.c}" data-go="quiz-${q.id}"><span class="ic" aria-hidden="true">${q.ic}</span><span class="qc-t"><b>${q.name}</b><small>${best[q.id]!=null?"Best: "+best[q.id]+" of "+q.q.length:q.q.length+" questions"}</small></span><span class="qc-m"><i>${diff(q.q.length)}</i>${star(q)}</span></button>`;
  app.innerHTML=`${topbar("Quizzes","🏆","Pick a quiz, earn stars","home",[QUIZZES.length+" quizzes",done+" done"])}
  ${rec?`<section class="sec"><h2 class="sech"><span>Recommended for you</span></h2><div class="grid qlist qrec">${card(rec)}</div></section>`:""}
  <section class="sec"><h2 class="sech"><span>All quizzes</span></h2><div class="grid qlist">${QUIZZES.map(card).join("")}</div></section>
  <div class="note">🆕 More quizzes come with new lessons.</div>`}
const starsFor=(s,n)=>s===n?3:s>=n-1?2:s>=Math.ceil(n/2)?1:0;
function quiz(id){const Q=QUIZZES.find(q=>q.id===id);if(!Q)return quizzes();let i=0,score=0;
  const order=Q.q.map(x=>({t:x[0],o:x[1].map((s,k)=>({s,k})).sort(()=>Math.random()-.5),a:x[2]}));
  function draw(){const x=order[i];
    app.innerHTML=`${topbar(Q.name,Q.ic,`Question ${i+1} of ${order.length}`,"quizzes")}
    <div class="qcard"><div class="qprog"><i style="width:${i/order.length*100}%"></i></div><div class="qdots" aria-hidden="true">${order.map((_,j)=>`<i class="${j<i?"dn":j===i?"now":""}"></i>`).join("")}</div><div class="q">${esc(x.t)}</div>
    <div class="opts">${x.o.map((o,j)=>`<button class="opt" data-k="${o.k}"><i class="ab">${"ABCD"[j]}</i><span>${esc(o.s)}</span></button>`).join("")}</div><div id="fb" role="status"></div></div>
    <div class="qhint"><span class="qh-l" aria-hidden="true">${window.hvLumiSvg?hvLumiSvg("thinking",44):""}</span><p>Take your time. Read every answer first.</p></div>
    ${Q.v?`<button class="qlesson" data-v="${Q.v}"><span class="qth"><img src="https://i.ytimg.com/vi/${Q.v}/mqdefault.jpg" alt="" loading="lazy"><i>${hvIcon("play2",14)}</i></span><span><small>Need a hint?</small><b>Watch the lesson</b></span></button>`:""}`;
    app.querySelectorAll(".opt").forEach(b=>b.addEventListener("click",()=>{
      const k=+b.dataset.k;app.querySelectorAll(".opt").forEach(o=>{o.disabled=true;if(+o.dataset.k===x.a)o.classList.add("right")});
      if(k===x.a){score++;$("#fb").innerHTML=`<p class="ok">Correct! 🎉</p>`}else{b.classList.add("wrong");$("#fb").innerHTML=`<p class="err">Not quite. The right answer is in green.</p>`}
      setTimeout(()=>{i++;i<order.length?draw():end()},1300)}))}
  function end(){const st=starsFor(score,order.length);if(window.hvAward){hvAward("quiz",id+"-"+todayKey(),Q.name,score);if(st===3)hvAward("quizbonus",id+"-"+todayKey(),Q.name)}const best=store.get("best",{});if(best[id]==null||score>best[id]){best[id]=score;store.set("best",best)}
    if(st===3)confetti();
    app.innerHTML=`${topbar(Q.name,Q.ic,"Quiz complete","quizzes")}
    <div class="qcard" style="text-align:center"><div class="stars stq-row" aria-label="${st} of 3 stars">${[1,2,3].map(n=>`<span class="stq${n<=st?"":" off"}" style="--i:${n}">${hvIcon("star",56)}</span>`).join("")}</div>
    <h2 id="qsc" data-count="${score}" data-of="${order.length}" style="font-size:1.6rem">0 / ${order.length}</h2><p class="tag" style="margin:0">${st===3?"Perfect! God bless you!":st===2?"Great job!":st===1?"Good try! Watch the lesson and try again.":"Watch the lesson and try again!"}</p>
    <div class="btns"><button class="btn gold" data-go="quiz-${id}" data-again>🔁 Try again</button>${Q.v?`<button class="btn" data-v="${Q.v}">▶ Watch the lesson</button>`:""}<button class="btn alt" data-go="quizzes">All quizzes</button></div></div>`}
  draw()}

/* ================= GAMES ================= */
function games(){
  const last=store.get("lastGame",""),LG={"g-memory":["Bible Match","cards"],"g-scramble":["Name Scramble","abc"],"g-trivia":["Bible Trivia","target"],"g-wordsearch":["Word Search","frame"],"g-storyorder":["Story Order","scroll"],"g-versequest":["Verse Quest","verse"]}[last];
  app.innerHTML=`${topbar("Games","🎮","Play & learn","home",["6 games","play every day"])}
  <button class="ticket" data-go="join"><span class="tk-l"><b>Enter a game code</b><small>Join your servant's live game</small></span><span class="tk-r" aria-hidden="true">${hvIcon("target",52)}</span></button>
  ${LG?`<button class="lastrow" data-go="${last}"><span aria-hidden="true">${hvIcon(LG[1],38)}</span><span><small>Last played</small><b>${LG[0]}</b></span><span class="lr-go">Play again</span></button>`:""}
  <section class="sec"><h2 class="sech"><span>Play now</span></h2>
  <div class="grid ggrid">
   <button class="gcard" style="--c:#2f8fc0" data-go="g-memory"><span class="gc-art" aria-hidden="true">${hvIcon("cards",92)}</span><span class="gc-t"><b>Bible Match</b><small>Find the pairs</small></span><span class="gc-m"><i>2 min</i><i>Easy</i></span></button>
   <button class="gcard" style="--c:#d98a2b" data-go="g-scramble"><span class="gc-art" aria-hidden="true">${hvIcon("abc",92)}</span><span class="gc-t"><b>Name Scramble</b><small>Fix the Bible names</small></span><span class="gc-m"><i>3 min</i><i>Medium</i></span></button>
  </div></section>
  <div id="kidGames"></div>
  <section class="sec"><h2 class="sech"><span>More games</span></h2>
  <div class="grid ggrid">
   <button class="gcard" style="--c:#8e6bd1" data-go="g-trivia"><span class="gc-art" aria-hidden="true">${hvIcon("target",92)}</span><span class="gc-t"><b>Bible Trivia</b><small>10 questions from every lesson</small></span><span class="gc-m"><i>3 min</i><i>Medium</i></span></button>
   <button class="gcard" style="--c:#3fae6a" data-go="g-wordsearch"><span class="gc-art" aria-hidden="true">${hvIcon("frame",92)}</span><span class="gc-t"><b>Word Search</b><small>Find the hidden words</small></span><span class="gc-m"><i>4 min</i><i>Easy</i></span></button>
   <button class="gcard" style="--c:#e86f8a" data-go="g-storyorder"><span class="gc-art" aria-hidden="true">${hvIcon("scroll",92)}</span><span class="gc-t"><b>Story Order</b><small>Put the story in order</small></span><span class="gc-m"><i>2 min</i><i>Easy</i></span></button>
   <button class="gcard" style="--c:#d4553b" data-go="g-versequest"><span class="gc-art" aria-hidden="true">${hvIcon("verse",92)}</span><span class="gc-t"><b>Verse Quest</b><small>Find the missing word</small></span><span class="gc-m"><i>3 min</i><i>Medium</i></span></button>
  </div></section>`;
  hvLoad("play").then(()=>{lazyDone.play=1;const b=document.getElementById("kidGames");if(b&&window.kidGames)kidGames(b)}).catch(()=>{})}
const MEM=[["🚢","Noah's Ark"],["🦁","Daniel"],["🕊️","Holy Spirit"],["⭐","Star of Bethlehem"],["🐟","5 Loaves & 2 Fish"],["🌈","God's Promise"],["🐑","Good Shepherd"],["👑","King David"]];
function memory(){const cards=[...MEM,...MEM].map((m,i)=>({m,i,id:MEM.indexOf(m)})).sort(()=>Math.random()-.5);let open=[],got=0,moves=0,lock=false;
  app.innerHTML=`${topbar("Bible Match","🃏","Find all 8 pairs","games")}<div class="stat"><span id="mv">Moves: 0</span><span id="pr">Pairs: 0/8</span></div>
  <div class="memgrid">${cards.map((c,k)=>`<button class="mc" data-k="${k}" aria-label="Card"><span>✝️</span></button>`).join("")}</div>
  <button class="btn alt" data-go="g-memory" data-again>🔁 New game</button>`;
  app.querySelectorAll(".mc").forEach(b=>b.addEventListener("click",()=>{if(lock||b.classList.contains("open")||b.classList.contains("got"))return;
    const c=cards[+b.dataset.k];b.classList.add("open");b.innerHTML=`<span class="f">${c.m[0]}<small>${c.m[1]}</small></span>`;open.push(b);
    if(open.length===2){moves++;$("#mv").textContent="Moves: "+moves;const [a,d]=open;
      if(cards[+a.dataset.k].id===cards[+d.dataset.k].id){a.classList.add("got");d.classList.add("got");open=[];got++;$("#pr").textContent=`Pairs: ${got}/8`;if(got===8){confetti();setTimeout(()=>toast(`You won in ${moves} moves! 🎉`),400)}}
      else{lock=true;setTimeout(()=>{open.forEach(x=>{x.classList.remove("open");x.innerHTML="<span>✝️</span>"});open=[];lock=false},850)}}}))}
const WORDS=[["NOAH","Built the ark"],["MOSES","Led God's people out of Egypt"],["DAVID","Beat Goliath with a stone"],["DANIEL","Safe in the lions' den"],["JONAH","Swallowed by a big fish"],["MARY","The mother of Jesus"],["PETER","Walked on water to Jesus"],["SAMUEL","Heard God call his name at night"],["JOSEPH","Had a coat of many colors"],["GEORGE","The Prince of Martyrs"],["ABRAHAM","Father of many nations"],["ESTHER","The brave queen"]];
function scramble(){let pool=WORDS.slice().sort(()=>Math.random()-.5).slice(0,6),i=0,score=0;
  function draw(){const [w,h]=pool[i];let L=w.split("").map((c,k)=>({c,k}));do{L.sort(()=>Math.random()-.5)}while(L.map(x=>x.c).join("")===w);let picked=[];
    app.innerHTML=`${topbar("Name Scramble","🔤",`Word ${i+1} of ${pool.length} · Score ${score}`,"games")}
    <div class="qcard"><div class="q">💡 ${esc(h)}</div><div class="answer" id="ans"></div><div class="letters">${L.map((x,j)=>`<button class="lt" data-j="${j}">${x.c}</button>`).join("")}</div>
    <div class="btns" style="grid-template-columns:1fr 1fr"><button class="btn alt" id="undo">↩ Undo</button><button class="btn alt" id="skipw">Skip ›</button></div><div id="fb" role="status"></div></div>`;
    const ans=$("#ans");const show=()=>ans.innerHTML=picked.map(j=>`<span>${L[j].c}</span>`).join("");
    app.querySelectorAll(".lt").forEach(b=>b.addEventListener("click",()=>{picked.push(+b.dataset.j);b.disabled=true;show();
      if(picked.length===w.length){const guess=picked.map(j=>L[j].c).join("");
        if(guess===w){score++;$("#fb").innerHTML=`<p class="ok">Yes! ${w} 🎉</p>`;setTimeout(next,1000)}
        else{$("#fb").innerHTML=`<p class="err">Not yet. Tap Undo and try again.</p>`}}}));
    $("#undo").onclick=()=>{const j=picked.pop();if(j!=null){app.querySelector(`.lt[data-j="${j}"]`).disabled=false;show();$("#fb").textContent=""}};
    $("#skipw").onclick=()=>{$("#fb").innerHTML=`<p class="tag">It was ${w}</p>`;setTimeout(next,900)}}
  function next(){i++;i<pool.length?draw():end()}
  function end(){if(score>=5)confetti();app.innerHTML=`${topbar("Name Scramble","🔤","Game over","games")}<div class="qcard" style="text-align:center"><div class="stars">🔤</div><h2 style="font-size:1.6rem">${score} / ${pool.length}</h2><div class="btns"><button class="btn gold" data-go="g-scramble" data-again>🔁 Play again</button><button class="btn alt" data-go="games">All games</button></div></div>`}
  draw()}

/* ================= BIBLE ================= */
const BGROUPS=[["Law",0,5,"#d98a2b"],["History",5,17,"#4a8fd8"],["Wisdom",17,22,"#8e6bd1"],["Prophets",22,39,"#e8584f"],["Gospels",39,43,"#3fae6a"],["Acts",43,44,"#2eb5a6"],["Letters",44,65,"#e3b45c"],["Revelation",65,66,"#d4553b"]];
function bible(){const last=store.get("lastRead",null),recent=store.get("recent",[]),tab=store.get("btab","ot");
  const grp=g=>`<section class="bgrp" style="--gc:${g[3]}"><h3><i></i>${g[0]}<small>${g[2]-g[1]} books</small></h3><div class="books">${BOOKS.slice(g[1],g[2]).map(b=>`<button class="bk" data-book="${b[0].toLowerCase()}" data-go="b-${encodeURIComponent(b[0])}">${b[0]}<small>${b[1]} ch</small></button>`).join("")}</div></section>`;
  app.innerHTML=`${topbar("The Bible","📖","Choose a book","home",["66 books",last?"Reading "+esc(last.b)+" "+last.c:""])}
  ${window.hvPlanCard?hvPlanCard():""}
  ${last?`<button class="bcont" data-go="b-${encodeURIComponent(last.b)}-${last.c}"><span aria-hidden="true">${hvIcon("book",36)}</span><span><small>Continue reading</small><b>${esc(last.b)} ${last.c}</b></span><i>Open</i></button>`:""}
  ${recent.length?`<div class="brec" aria-label="Recently read"><small>Recently read</small>${recent.map(r=>`<button class="ds-chip" data-go="b-${encodeURIComponent(r.b)}-${r.c}">${esc(r.b)} ${r.c}</button>`).join("")}</div>`:""}
  <label class="search"><span aria-hidden="true">🔍</span><input id="bq" type="search" placeholder="Find a book (e.g. John, Psalms)" autocomplete="off"></label>
  <div class="ds-seg bseg" id="btab" role="group"><button data-t="ot" aria-pressed="${tab==="ot"}">Old Testament</button><button data-t="nt" aria-pressed="${tab==="nt"}">New Testament</button></div>
  <div id="bgroups">${BGROUPS.filter(g=>tab==="ot"?g[1]<39:g[1]>=39).map(grp).join("")}</div>
  <div id="bres" class="books" hidden></div>`;
  $("#btab").onclick=e=>{const b=e.target.closest("[data-t]");if(!b)return;store.set("btab",b.dataset.t);bible()};
  $("#bq").addEventListener("input",e=>{const t=e.target.value.trim().toLowerCase(),res=$("#bres"),gr=$("#bgroups");
    if(!t){res.hidden=true;gr.hidden=false;return}
    const m=BOOKS.filter(b=>b[0].toLowerCase().includes(t));
    res.innerHTML=m.length?m.map(b=>`<button class="bk" data-go="b-${encodeURIComponent(b[0])}">${b[0]}<small>${b[1]} ch</small></button>`).join(""):`<div class="empty">No book matches "${esc(e.target.value)}"</div>`;res.hidden=false;gr.hidden=true})}
function bibleBook(name){const b=BOOKS.find(x=>x[0]===name);if(!b)return bible();
  app.innerHTML=`${topbar(b[0],"📖","Choose a chapter","bible",[b[1]+" chapters"])}<div class="chaps">${Array.from({length:b[1]},(_,i)=>`<button class="ch" data-go="b-${encodeURIComponent(b[0])}-${i+1}">${i+1}</button>`).join("")}</div>`}
async function bibleRead(name,ch){const b=BOOKS.find(x=>x[0]===name);if(!b)return bible();ch=Math.min(Math.max(1,ch),b[1]);
  const fs=store.get("fs",1.08),bt=store.get("bt","web")==="kjv"?"kjv":"web";store.set("lastRead",{b:name,c:ch});
  store.set("recent",[{b:name,c:ch}].concat(store.get("recent",[]).filter(r=>r.b!==name)).slice(0,5));
  if(window.hvAward)hvAward("bible",name+"-"+ch,name+" "+ch);if(window.hvPlanRead)hvPlanRead(name,ch);
  const bi=BOOKS.indexOf(b),prev=ch>1?[name,ch-1]:bi>0?[BOOKS[bi-1][0],BOOKS[bi-1][1]]:null,next=ch<b[1]?[name,ch+1]:bi<BOOKS.length-1?[BOOKS[bi+1][0],1]:null;
  const gt=x=>x?`b-${encodeURIComponent(x[0])}-${x[1]}`:"";
  const link=(x,l)=>x?`<button class="btn alt" data-go="${gt(x)}">${l}</button>`:"";
  app.innerHTML=`<div class="rprog" aria-hidden="true"><i id="rpi"></i></div>
  <div class="topbar hvbar"><button class="back" data-go="b-${encodeURIComponent(name)}">← Back</button><span class="hvmini" aria-hidden="true"><b>${name} ${ch}</b></span></div>
  <header class="chead"><small>${bt==="kjv"?"King James Version":"World English Bible"}</small><h1>${name} ${ch}</h1><i class="orn" aria-hidden="true"></i></header>
  <article class="reader" id="rd" style="--fs:${fs}rem">${window.hvSkeleton?hvSkeleton("text"):"<p class=\"tag\">Loading…</p>"}</article>
  <div class="navrow">${link(prev,"‹ Previous")}${link(next,"Next ›")}</div>
  <a class="btn alt" href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(name+" "+ch)}&version=NKJV" target="_blank" rel="noopener">Read in NKJV ↗</a>
  <div class="rpill" role="toolbar" aria-label="Reading options"><div class="seg" role="group" aria-label="Translation"><button data-bt="web" aria-pressed="${bt==="web"}">WEB</button><button data-bt="kjv" aria-pressed="${bt==="kjv"}">KJV</button></div><span class="rsep"></span><div class="seg" role="group" aria-label="Text size"><button data-fs="-1" aria-label="Smaller text">A−</button><button data-fs="1" aria-label="Bigger text">A+</button></div></div>`;
  app.querySelectorAll("[data-bt]").forEach(x=>x.onclick=()=>{store.set("bt",x.dataset.bt);bibleRead(name,ch)});
  app.querySelectorAll("[data-fs]").forEach(x=>x.onclick=()=>{let f=store.get("fs",1.08)+(+x.dataset.fs)*.1;f=Math.min(1.8,Math.max(.9,f));store.set("fs",f);$("#rd").style.setProperty("--fs",f+"rem")});
  /* reading progress and swipe between chapters */
  const pr=()=>{const i=document.getElementById("rpi");if(!i){removeEventListener("scroll",pr);return}const m=document.documentElement.scrollHeight-innerHeight;i.style.width=(m>0?Math.min(100,scrollY/m*100):0)+"%"};
  addEventListener("scroll",pr,{passive:true});
  const rd=$("#rd");let sx=0,sy=0,st=0;
  rd.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
  rd.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Date.now()-st<700&&Math.abs(dx)>90&&Math.abs(dx)>Math.abs(dy)*2){const t=dx<0?next:prev;if(t)go(gt(t))}});
  try{const r=await fetch(`https://bible-api.com/${encodeURIComponent(name+" "+ch)}?translation=${bt}`);const j=await r.json();if(!j.verses)throw 0;
    $("#rd").innerHTML=j.verses.map(v=>`<sup>${v.verse}</sup>${esc(v.text.trim())} `).join("")}
  catch{const rd=$("#rd");if(rd)rd.innerHTML=`<p class="err">Couldn't load this chapter. Check your internet, or tap "Read in NKJV".</p>`}}

/* ================= HELPERS ================= */
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(t._h);t._h=setTimeout(()=>t.hidden=true,2200)}
function confetti(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const c=$("#confetti"),x=c.getContext("2d");c.hidden=false;c.width=innerWidth;c.height=innerHeight;
  const cols=["#e3b45c","#2f8fc0","#e86f8a","#3fae6a","#8e6bd1"];let P=Array.from({length:140},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vy:2+Math.random()*3,vx:(Math.random()-.5)*2,r:Math.random()*6.3,s:6+Math.random()*6,c:cols[Math.floor(Math.random()*5)]}));
  const t0=performance.now();(function f(t){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.y+=p.vy;p.x+=p.vx;p.r+=.1;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
    t-t0<2600?requestAnimationFrame(f):(c.hidden=true)})(t0)}

/* ================= ROUTER ================= */
/* big tools that only servants or a few screens need are loaded the first time they are used (faster first open) */
const LZ={play:["builder.js?v=7","live.js?v=3"],att:["attsheet.js?v=2"],arena:["arena.js?v=4"],lumi:["lumi.js?v=4"]},LZP={};
function hvLoad(k){return LZP[k]||(LZP[k]=LZ[k].reduce((p,src)=>p.then(()=>new Promise((ok,no)=>{const e=document.createElement("script");e.src=src;e.async=false;e.onload=ok;e.onerror=no;document.head.appendChild(e)})),Promise.resolve()).catch(e=>{delete LZP[k];throw e}))}
window.hvLoad=hvLoad;
const lazyKey=h=>h==="builder"||h==="join"||/^(bnew|bedit|bplay|gplay|j|cls|live)-/.test(h)?"play":h==="attsheet"?"att":h==="report"?"arena":h==="servants"||/^lumi-(cards|gold|report|alerts|settings)$/.test(h)?"lumi":"";
const lazyDone={};
function route(){closeSheet();const h=decodeURIComponent(location.hash.slice(1)||"home");
  const lk=lazyKey(h);if(lk&&!lazyDone[lk]){app.innerHTML=`<div class="ds-skel" style="height:160px;margin:24px 0"></div>`;hvLoad(lk).then(()=>{lazyDone[lk]=1;if(decodeURIComponent(location.hash.slice(1)||"home")===h)route()}).catch(()=>{app.innerHTML=`<div class="card sec" style="text-align:center"><b>Could not load this page</b><p class="tag">Check your internet and try again.</p><button class="btn gold" data-go="home">Home</button></div>`});return}
  if(h==="home")hub();else if(h==="media")media();else if(h.startsWith("m-"))mediaSection(h.slice(2));
  else if(h.startsWith("vp-")){const p=h.slice(3).split("-");versePuzzle(p[0],p[1])}else if(h.startsWith("lv-")){const p=h.slice(3).split("-");lessonVideos(p[0],p[1])}else if(h.startsWith("l-")){const p=h.slice(2).split("-");lessonPage(p[0],p[1])}
  else if(h==="attendance")attendance();else if(h==="attsheet")attSheet();else if(h==="servants")servants();
  else if(h==="quizzes")quizzes();else if(h.startsWith("quiz-"))quiz(h.slice(5));
  else if(h==="games")games();else if(h==="g-memory"){store.set("lastGame","g-memory");memory()}else if(h==="g-scramble"){store.set("lastGame","g-scramble");scramble()}
  else if(h==="bible")bible();
  else if(h.startsWith("b-")){const m=h.slice(2).match(/^(.*?)(?:-(\d+))?$/);m[2]?bibleRead(m[1],+m[2]):bibleBook(m[1])}
  else if(!(window.builderRoute&&builderRoute(h))&&!(window.profileRoute&&profileRoute(h))&&!(window.liveRoute&&liveRoute(h))&&!(window.lgRoute&&lgRoute(h))&&!(window.kidsRoute&&kidsRoute(h))&&!(window.faithRoute&&faithRoute(h))&&!(window.bedtimeRoute&&bedtimeRoute(h))&&!(window.prayRoute&&prayRoute(h))&&!(window.permRoute&&permRoute(h))&&!(window.coloringRoute&&coloringRoute(h))&&!(window.servantsRoute&&servantsRoute(h))&&!(window.churchRoute&&churchRoute(h))&&!(window.arenaRoute&&arenaRoute(h))&&!(window.aiRoute&&aiRoute(h))&&!(window.lumiRoute&&lumiRoute(h))&&!(window.lumiChatRoute&&lumiChatRoute(h))&&!(window.games2Route&&games2Route(h))&&!(window.shellRoute&&shellRoute(h))){hub();if(h!=="home"){try{history.replaceState(null,"","#home")}catch{}toast("That page moved")}}window.scrollTo(0,0)}
function go(h){const t="#"+h;if(location.hash===t)route();else location.hash=h}
document.addEventListener("click",async e=>{
  const g=e.target.closest("[data-go]");if(g){if(g.hasAttribute("data-close"))closeSheet();go(g.dataset.go);return}
  const v=e.target.closest("[data-v]");if(v)return openLesson(v.dataset.v);
  const la=e.target.closest("[data-la]");if(la)return lessonAction(la.dataset.la,la.dataset.g,la.dataset.n);
  if(e.target.closest("[data-act=lockmsg]"))return toast("Curriculum material is for servants only 🔒");
  if(e.target.closest("[data-close]"))return closeSheet();
  const a=e.target.closest("[data-act]");if(a){if(a.dataset.act==="attend")attendSheet();if(a.dataset.act==="setcode")setCodeSheet();if(a.dataset.act==="editme"){store.set("me",null);attendance()}return}
  const c=e.target.closest("[data-copy]");if(c){try{await navigator.clipboard.writeText(c.dataset.copy);toast("Link copied ✅")}catch{toast(c.dataset.copy)}}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSheet()});
addEventListener("hashchange",()=>window.hvTransition?hvTransition(route):route());
runIntro();route();
if(IS_LIVE){const l=document.createElement("link");l.rel="manifest";l.href="manifest.json";document.head.appendChild(l);
  const a=document.createElement("link");a.rel="apple-touch-icon";a.href="icon-180.png";document.head.appendChild(a);
  if("serviceWorker" in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had&&!window._hvr&&performance.now()<20000){window._hvr=1;location.reload()}});navigator.serviceWorker.register("sw.js").catch(()=>{})}}
