/* Phase 3, part 2: gates, empty states, Home pieces, CSS. Already applied; kept to read the change. */
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  pairs.forEach(([a, b]) => {
    if (a instanceof RegExp) { if (!a.test(s)) console.log('MISSING in ' + file + ': ' + a); s = s.replace(a, () => b) }
    else { if (!s.includes(a)) console.log('MISSING in ' + file + ': ' + a.slice(0, 80)); s = s.replace(a, () => b) }
  });
  fs.writeFileSync(file, s);
};

/* ---------- gates ---------- */
edit('attsheet.js', [[/if\(!a\)\{app\.innerHTML=`\$\{topbar\("Attendance Sheet","📊","Your Sundays","attendance"\)\}<div class="card sec"[^\n]*<\/div>`;return\}/,
  'if(!a){app.innerHTML=`${topbar("Attendance Sheet","📊","Your Sundays","attendance")}${hvGate({scene:"chart",title:"See all your Sundays",lead:"Every student and servant needs a profile.",benefits:[["notes","Every Sunday you came"],["flame","Your streak and badges"],["chart","How your class is doing"]],preview:"streak",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`;return}']]);
edit('kids.js', [[/function loginNeeded\(\)\{app\.innerHTML=`[^\n]*`\}/,
  'function loginNeeded(){app.innerHTML=`${topbar("Me","🌟","Your stars, avatar and account")}${hvGate({scene:"star",title:"Your treasures are waiting",lead:"Make a profile to collect stars, build your avatar and win badges.",benefits:[["star","Collect stars as you learn"],["user","Build your own avatar"],["trophy","Win badges and level up"]],preview:"stars",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`}']]);
edit('profile.js', [
  ['if(h==="profile"||h==="me"){if(!acct()){authPage("login");return true}return false}', 'if(h==="profile"||h==="me")return false'],
  [/app\.innerHTML=`\$\{topbar\("Servants Workshop","🛠️","Servants only"\)\}<div class="card sec" style="text-align:center">[\s\S]*?Ask your coordinator or priest for access\.<\/p>`\}<\/div>`;/,
   'app.innerHTML=`${topbar("Servants Workshop","🛠️","For servants, coordinators and priests")}${!a?hvGate({calm:1,scene:"toolbox",title:"Servants Workshop",lead:"For servants, coordinators and priests.",benefits:[["pencilpad","Plan every Sunday lesson"],["notes","Take attendance for your class"],["megaphone","Post news to your class"]],preview:"work",primary:["Log in","login"],secondary:["Create a profile","signup"],note:"Servants need an approved profile."}):a.user.req?hvGate({calm:1,scene:"toolbox",title:"Waiting for approval",lead:"Your request to be a "+TIER[a.user.req][1]+" has not been approved yet."}):hvGate({calm:1,scene:"toolbox",title:"This is for servants",lead:"Ask your coordinator or priest for access."})}`;']
]);
edit('lumi-chat.js', [[/if\(!a\)\{app\.innerHTML=`\$\{top\}<div class="lm-wrap">\$\{hero\(\)\}<div class="card sec" style="text-align:center"><b>Login to chat with Lumi<\/b>[^\n]*<\/div><\/div>`;return\}/,
  'if(!a){app.innerHTML=`${top}<div class="lm-wrap">${hero()}${window.hvGate?hvGate({scene:"sparkles",title:"Chat with Lumi",lead:"Ask about God and the Church.",benefits:[["bulb","Easy answers for kids"],["book","With Bible verses"],["lock","Only you see your questions"]],preview:"chat",primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]}):""}</div>`;return}']]);
edit('live.js', [[/if\(!a\)\{app\.innerHTML=`\$\{topbar\("Join a live game","🎯","You need a profile","games"\)\}<div class="card sec"[^\n]*<\/div>`;return\}/,
  'if(!a){app.innerHTML=`${topbar("Join a live game","🎯","You need a profile","games")}${hvGate({scene:"target",title:"Join the class game",lead:"Make a profile so your points are saved.",benefits:[["trophy","Win stars with your class"],["star","Your score is saved"]],primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]})}`;return}']]);
edit('church.js', [[/if\(!a\)\{document\.getElementById\("evb"\)\.innerHTML=`<div class="card sec"[^\n]*<\/div>`;return\}/,
  'if(!a){document.getElementById("evb").innerHTML=hvGate({scene:"party",title:"Trips and events",lead:"See what is coming up at your church.",benefits:[["calendar","Dates and places"],["party","Trips, retreats and feasts"]],primary:["Create my profile","signup"],secondary:["I already have one, log in","login"]});return}']]);

/* ---------- empty states ---------- */
edit('servants.js', [[/`<div class="ds-empty"><div class="em">📢<\/div><b>No news right now<\/b>When your church posts something, it will show up here\.<\/div>`/, 'hvEmpty("megaphone","No news yet","Check back on Sunday!")']]);
edit('coloring.js', [[/`<div class="ds-empty"><div class="em">🖼️<\/div><b>No pictures yet<\/b>Color a page and press Save to keep it here\.<\/div>`/, 'hvEmpty("palette","Color your first picture","Color a page and press Save to keep it here.",["Pick a picture","coloring"])']]);
edit('faith.js', [
  ['app.innerHTML=`${topbar("Daily Verse","📜","One verse a day","home")}<div id="vbox" class="sec"></div>`;', 'app.innerHTML=`${topbar("Daily Verse","📜","One verse a day","home",[vstreak()+" day streak"])}<div id="vbox" class="sec"></div><div id="vjar"></div>`;'],
  ['function drawVerse(){', 'function drawJar(){const el=document.getElementById("vjar");if(!el)return;if(V.step>=3){el.innerHTML="";return}const jar=Object.keys(vstate().days).sort().reverse();\n  el.innerHTML=`<section class="card sec"><h2>🫙 My verse jar (${jar.length})</h2>${jar.length?`<div class="jar">${jar.slice(0,30).map(k=>{const x=vstate().days[k];return `<div class="jv"><b>${E(x.ref)}</b><span>${E(x.text)}</span><small>${k}</small></div>`}).join("")}</div>`:hvEmpty("jar","Your jar is empty","Learn today\'s verse and it goes in your jar.")}</section>`}\nfunction drawVerse(){setTimeout(drawJar,0);']
]);
edit('offline.js', [[/\.offchip\{[^\n]*/, '.offchip{display:none}\n.offdot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px color-mix(in srgb,var(--good) 28%,transparent)}']]);

/* ---------- design.js: Home pieces ---------- */
edit('design.js', [
  ['.title-row span{font-size:2.4rem!important}', '.title-row>span{font-size:2.4rem!important}'],
  ['.hubhead img{width:min(130px,36vw)}', '.hubhead img{width:min(190px,50vw);filter:drop-shadow(0 0 22px rgba(255,205,110,.65)) brightness(1.06)}'],
  ['.greet{margin:6px 0 14px}', '.greet{margin:2px 0 16px;text-align:center}'],
  [/return `<button class="tipbub" data-go="\$\{hasLumi\(\)\?"lumi":"home"\}">[^\n]*/, 'return `<button class="tipbub" data-go="${hasLumi()?"lumi":"home"}"><span class="tb-face" aria-hidden="true">${hvLumiSvg("happy",56)}</span><span class="tb-bub"><small>Lumi says</small><p>${tip}</p>${hasLumi()?`<span class="tb-ask">Ask now</span>`:""}</span></button>`};']
]);
console.log('part 2 done');
