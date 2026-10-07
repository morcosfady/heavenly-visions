/* One-time edit script for Home v2 (Sky Garden). Already applied; kept so the change is easy to read. */
const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');
if (!h.includes('design.js')) h = h.replace('<script src="theme.js?v=1"></script>', '<script src="theme.js?v=1"></script>\n<script src="design.js?v=1"></script>');
const a = h.indexOf('  app.innerHTML=`${window.hvTopBar?hvTopBar():""}\n  <header class="hubhead">');
const b = h.indexOf('  ${window.hvPostBtn?hvPostBtn():""}', a);
const ic = n => '${hvIcon("' + n + '",96)}';
const door = (cls, go, icon, t, s, wide) => '    <button class="door ' + cls + (wide ? ' wide' : '') + '" data-go="' + go + '"><span class="big">' + ic(icon) + '</span><b>' + t + '</b><small>' + s + '</small></button>\n';
const cont = '  ${(()=>{const L=store.get("lastLesson",null),l=L&&lessonOf(L.g,L.n);if(!l)return "";const vs=lessonVids(L.g,L.n),th=vs[0]?`<img src="https://i.ytimg.com/vi/${vs[0][0]}/hqdefault.jpg" alt="" loading="lazy" width="96" height="64">`:"";return `<button class="cont2" data-go="l-${L.g}-${L.n}"><span class="th">${th}<span class="pl">${hvIcon("play2",14)}</span></span><span><small>Continue</small><b>${esc(l[0]+" "+l[1])}</b></span></button>`})()}\n';
const nw = '  app.innerHTML=`${window.hvTopBar?hvTopBar():""}\n  <header class="hubhead"><img src="${LOGO}" alt="Heavenly Visions"></header>\n  ${window.hvGreeting?hvGreeting():""}\n' + cont +
  '  <nav class="doors" aria-label="Main">\n' +
  door('d-media', 'media', 'clap', 'Sunday School', 'Lesson videos by grade', true) +
  door('d-att', 'attendance', 'hand', 'Attendance', "I'm here today!") +
  door('d-games', 'games', 'game', 'Games', 'Play &amp; learn') +
  door('d-quiz', 'quizzes', 'trophy', 'Quizzes', 'Test what you know') +
  door('d-bible', 'bible', 'book', 'The Bible', "Read God's Word") + '  </nav>\n';
h = h.slice(0, a) + nw + h.slice(b);
h = h.replace('  ${window.hvMoreDoors?hvMoreDoors():""}\n  <footer>', '  ${window.hvMoreDoors?hvMoreDoors():""}\n  ${window.hvLumiTip?hvLumiTip():""}\n  <footer>');
h = h.replace('<button class="workshop" data-go="servants">🛠️ Servants Workshop</button>', '<button class="workshop" data-go="servants">${window.hvIcon?hvIcon("tools",18):""}Servants Workshop</button>');
fs.writeFileSync('index.html', h);

let s = fs.readFileSync('shell.js', 'utf8');
const R = (a, b) => { if (!s.includes(a)) console.log('MISSING in shell.js: ' + a.slice(0, 50)); s = s.replace(a, b) };
R('`<button class="sb-login" data-go="login">👤 Login</button>`', '`<button class="sb-login" data-go="login">${window.hvIcon?hvIcon("login",20):""}Login</button>`');
R('<i>⭐</i><span id="sbN">', '<i>${window.hvIcon?hvIcon("starline",20):"⭐"}</i><span id="sbN">');
R('aria-label="Notifications">🔔<i', 'aria-label="Notifications">${window.hvIcon?hvIcon("bell",22):"🔔"}<i');
R('<div class="sb-right">${bell}${stars}</div>', '<div class="sb-right">${window.hvThemeButton?hvThemeButton():""}${bell}${stars}</div>');
R('<span class="k">📖 Verse of the day', '<span class="k">${window.hvIcon?hvIcon("book",16):""}Verse of the day');
R('<span class="k">📅 ${E(g)}', '<span class="k">${window.hvIcon?hvIcon("calendar",16):""}${E(g)}');
R('<span class="k">🎉 Next event', '<span class="k">${window.hvIcon?hvIcon("flag",16):""}Next event');
R('["kids","🌟",', '["kids","star",'); R('["bedtime","🛏️",', '["bedtime","moon",'); R('["coloring","🎨",', '["coloring","palette",');
R('calIcon():m[1]}', 'calIcon():(window.hvIcon?hvIcon(m[1],54):m[1])}');
fs.writeFileSync('shell.js', s);

let l = fs.readFileSync('lumi-chat.js', 'utf8');
const x = l.indexOf('window.hvLumiDoor=');
if (x >= 0) {
  const y = l.indexOf('function fabShow', x), z = l.indexOf('\n', y);
  l = l.slice(0, x) + 'window.hvLumiDoor=function(){return ""};' + l.slice(z);
  const c = l.indexOf('.lm-fab{position'), d = l.indexOf('.lm-wrap{');
  if (c >= 0 && d > c) l = l.slice(0, c) + l.slice(d);
  fs.writeFileSync('lumi-chat.js', l);
}
let w = fs.readFileSync('sw.js', 'utf8');
if (!w.includes('design.js')) w = w.replace("'ds.js',", "'ds.js','design.js',");
fs.writeFileSync('sw.js', w);
console.log('done');
