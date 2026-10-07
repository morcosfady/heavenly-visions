/* Builds the three static HOME mockups (Phase 0). Run: node design/mockups/build.js
   The 3D icons here are quick SVG stand-ins in the clay style, only to judge the layout and mood. The real set is made in Phase 1. */
const fs = require('fs'), path = require('path');
const lumi = fs.readFileSync(path.join(__dirname, 'lumi.svg.txt'), 'utf8');

const defs = `<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ea"/><stop offset="1" stop-color="#2f6fb8"/></linearGradient>
<linearGradient id="gG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd69a"/><stop offset="1" stop-color="#2c9c5a"/></linearGradient>
<linearGradient id="gP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cf0"/><stop offset="1" stop-color="#6a47c2"/></linearGradient>
<linearGradient id="gO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb27a"/><stop offset="1" stop-color="#e0622f"/></linearGradient>
<linearGradient id="gY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="#d79a24"/></linearGradient>
<linearGradient id="gS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3c2"/><stop offset="1" stop-color="#f0a86a"/></linearGradient>
<radialGradient id="shine" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#10163a" flood-opacity=".38"/></filter>
</defs></svg>`;

const I = {
  clap: s => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" filter="url(#soft)"><rect x="12" y="38" width="76" height="46" rx="11" fill="url(#gB)"/><rect x="12" y="38" width="76" height="46" rx="11" fill="url(#shine)"/><g transform="rotate(-11 50 33)"><rect x="10" y="18" width="80" height="19" rx="7" fill="#fff"/><g fill="#2f6fb8"><rect x="20" y="18" width="10" height="19" transform="skewX(-25)"/><rect x="40" y="18" width="10" height="19" transform="skewX(-25)"/><rect x="60" y="18" width="10" height="19" transform="skewX(-25)"/></g></g><circle cx="50" cy="62" r="11" fill="#fff" opacity=".9"/><path d="M46 56 L58 62 L46 68Z" fill="#2f6fb8"/></svg>`,
  hand: s => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" filter="url(#soft)"><g fill="url(#gS)"><rect x="27" y="22" width="11" height="44" rx="5.5"/><rect x="39" y="12" width="11" height="52" rx="5.5"/><rect x="51" y="16" width="11" height="48" rx="5.5"/><rect x="63" y="26" width="11" height="40" rx="5.5"/><rect x="22" y="50" width="56" height="38" rx="19"/><rect x="10" y="48" width="11" height="32" rx="5.5" transform="rotate(-38 15 64)"/></g><rect x="22" y="50" width="56" height="38" rx="19" fill="url(#shine)"/></svg>`,
  game: s => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" filter="url(#soft)"><rect x="8" y="30" width="84" height="46" rx="23" fill="url(#gP)"/><rect x="8" y="30" width="84" height="46" rx="23" fill="url(#shine)"/><rect x="24" y="47" width="22" height="8" rx="4" fill="#fff"/><rect x="31" y="40" width="8" height="22" rx="4" fill="#fff"/><circle cx="66" cy="48" r="6" fill="#ffd36b"/><circle cx="77" cy="57" r="6" fill="#ff8aa6"/></svg>`,
  trophy: s => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" filter="url(#soft)"><path d="M26 18h48v24a24 24 0 0 1-48 0z" fill="url(#gY)"/><path d="M26 24H14v8a14 14 0 0 0 14 14M74 24h12v8a14 14 0 0 1-14 14" fill="none" stroke="#d79a24" stroke-width="7" stroke-linecap="round"/><rect x="43" y="62" width="14" height="14" fill="#d79a24"/><rect x="30" y="76" width="40" height="12" rx="6" fill="url(#gP)"/><path d="M50 26l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#fff" opacity=".85"/></svg>`,
  book: s => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" filter="url(#soft)"><path d="M8 30Q30 20 50 30V82Q30 72 8 82Z" fill="#fff"/><path d="M92 30Q70 20 50 30V82Q70 72 92 82Z" fill="#f3ead8"/><path d="M50 30V82" stroke="#d79a24" stroke-width="3"/><path d="M16 42Q30 37 42 42M16 54Q30 49 42 54M58 42Q70 37 84 42M58 54Q70 49 84 54" stroke="#9db4d8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 12h12v22H44z" fill="#e0622f"/><path d="M8 82Q30 72 50 82Q70 72 92 82V88Q70 78 50 88Q30 78 8 88Z" fill="url(#gB)"/></svg>`,
  lumi: s => `<span style="display:inline-block;width:${s}px;height:${s}px">${lumi.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"')}</span>`
};
const T = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  learn: '<path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0zM21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z"/>',
  play: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="16" cy="12" r=".6"/><circle cx="18" cy="14" r=".6"/>',
  lumi: '<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>'
};
const tab = (k, label, on) => `<a class="tb${on ? ' on' : ''}"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${T[k]}</svg><span>${label}</span></a>`;
const tabs = on => `${tab('home', 'Home', on === 0)}${tab('learn', 'Learn', on === 1)}${tab('play', 'Play', on === 2)}${tab('lumi', 'Lumi', on === 3)}${tab('me', 'Me', on === 4)}`;

const base = `
*{box-sizing:border-box;margin:0}html{background:#0b1030}
:root{--ink:#f4f1ff;--mute:#aeb4dc;--gold:#e3b45c;--glass:rgba(29,37,64,.62);--gb:rgba(255,255,255,.12);--bg1:#0a0f2e;--bg2:#1a2147;--bg3:#2e2347;--tab:rgba(18,23,52,.82)}
body.light{--ink:#2b2340;--mute:#6a6486;--glass:rgba(255,250,242,.72);--gb:rgba(185,133,43,.30);--bg1:#a9d8f2;--bg2:#e8f1f1;--bg3:#fbe7c4;--tab:rgba(255,250,242,.86)}
body{font-family:Nunito,system-ui,sans-serif;color:var(--ink);background:linear-gradient(180deg,var(--bg1),var(--bg2) 55%,var(--bg3));min-height:100vh;display:flex;justify-content:center}
.ph{width:390px;min-height:960px;position:relative;padding:14px 16px 110px;overflow:hidden}
.glow{position:absolute;left:50%;top:-80px;width:520px;height:420px;margin-left:-260px;background:radial-gradient(closest-side,rgba(255,196,92,.38),transparent);pointer-events:none}
.top{display:flex;justify-content:space-between;align-items:center;position:relative}
.chip{display:flex;align-items:center;gap:8px;height:44px;padding:0 14px 0 6px;border-radius:999px;background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(14px);font-weight:800;font-size:.95rem}
.av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ffe29a,#d79a24);display:grid;place-items:center;font-weight:900;color:#5b3d05}
.stat{display:flex;gap:8px}.stat .chip{padding:0 14px}
h1,h2{font-family:Cinzel,serif}
.tbar{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-around;padding:8px 8px 22px;background:var(--tab);backdrop-filter:blur(18px);border-top:1px solid var(--gb)}
.tb{display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--mute);font-weight:800;font-size:.72rem;min-width:62px;min-height:48px;position:relative;justify-content:center}
.tb.on{color:var(--gold)}.tb.on::before{content:"";position:absolute;top:-9px;width:26px;height:4px;border-radius:4px;background:var(--gold)}
.tb.on svg{fill:rgba(227,180,92,.22)}
.lbl{position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:.7rem;font-weight:800;color:#fff;background:#0007;padding:3px 8px;border-radius:99px;z-index:9}
`;

function page(title, css, body, on) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@500;700;800;900&display=swap">
<style>${base}${css}</style></head><body><script>if(location.search.includes("light"))document.body.className="light"</script>${defs}<div class="ph"><div class="glow"></div>${body}<nav class="tbar">${tabs(on)}</nav></div></body></html>`;
}

const topbar = `<div class="top"><div class="chip"><div class="av">F</div>Fady</div><div class="stat"><div class="chip">🔔</div><div class="chip" style="color:var(--gold)">★ 37</div></div></div>`.replace('🔔', '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/></svg>');
const logo = `<div style="text-align:center;margin:14px 0 4px;position:relative"><img src="../../logo.png" width="150" alt="Heavenly Visions" style="filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))"></div>`;

/* ---------- A: Sky Garden ---------- */
const A = page('Home A: Sky Garden', `
.hello{margin:6px 0 14px;position:relative}.hello h1{font-size:1.5rem;line-height:1.15}.hello p{color:var(--mute);font-weight:700;font-size:.92rem;margin-top:2px}
.cont{display:flex;gap:12px;align-items:center;padding:12px;border-radius:24px;background:linear-gradient(135deg,rgba(124,196,234,.28),var(--glass));border:1px solid var(--gb);backdrop-filter:blur(14px);margin-bottom:14px}
.cont .th{width:92px;height:64px;border-radius:14px;background:linear-gradient(135deg,#2f6fb8,#7cc4ea);display:grid;place-items:center;flex:none}
.cont b{display:block;font-size:.98rem}.cont small{color:var(--mute);font-weight:700}
.bar{height:6px;border-radius:6px;background:rgba(255,255,255,.18);margin-top:7px;overflow:hidden}.bar i{display:block;width:62%;height:100%;border-radius:6px;background:linear-gradient(90deg,#ffe29a,#e3b45c)}
.bento{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.d{position:relative;border-radius:26px;padding:14px;min-height:132px;color:#fff;overflow:hidden;border:1px solid rgba(255,255,255,.22);display:flex;flex-direction:column;justify-content:flex-end;box-shadow:0 14px 28px -14px rgba(0,0,0,.55)}
.d::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.28),transparent 45%);pointer-events:none}
.d b{font-family:Cinzel,serif;font-size:1.12rem;letter-spacing:.02em}.d small{font-weight:800;font-size:.8rem;opacity:.92}
.d .ic{position:absolute;right:6px;top:6px}.wide{grid-column:1/-1;min-height:118px}.wide .ic{right:12px;top:4px}
.k1{background:linear-gradient(135deg,#4fa6dc,#2b6fb8)}.k2{background:linear-gradient(135deg,#4cc785,#25915a)}.k3{background:linear-gradient(135deg,#f08a55,#d0562a)}.k4{background:linear-gradient(135deg,#a387e8,#6a47c2)}.k5{background:linear-gradient(135deg,#e5b552,#b9822a)}
.tip{display:flex;gap:10px;align-items:center;margin-top:14px;padding:10px 14px;border-radius:20px;background:var(--glass);border:1px solid var(--gb)}
.tip p{font-weight:700;font-size:.9rem}
`, `${topbar}${logo.replace('width="150"', 'width="120"')}
<div class="hello"><h1>Good morning, Fady</h1><p>Ready for today's story?</p></div>
<div class="cont"><div class="th">${I.clap(46)}</div><div style="flex:1"><small>Continue</small><b>4.10 The Agpeya</b><div class="bar"><i></i></div></div></div>
<div class="bento">
<div class="d wide k1"><span class="ic">${I.clap(104)}</span><b>Sunday School</b><small>Lesson videos by grade</small></div>
<div class="d k2"><span class="ic">${I.hand(78)}</span><b>Attendance</b><small>I'm here today!</small></div>
<div class="d k3"><span class="ic">${I.game(80)}</span><b>Games</b><small>Play &amp; learn</small></div>
<div class="d k4"><span class="ic">${I.trophy(78)}</span><b>Quizzes</b><small>Test what you know</small></div>
<div class="d k5"><span class="ic">${I.book(80)}</span><b>The Bible</b><small>Read God's Word</small></div>
</div>
<div class="tip">${I.lumi(48)}<p>Lumi tip: Tap a lesson and press play. Then try its quiz!</p></div>`, 0);

/* ---------- B: Stained Glass ---------- */
const B = page('Home B: Stained Glass', `
body{background:radial-gradient(120% 60% at 50% 0%,#2a2a6a,transparent 70%),linear-gradient(180deg,var(--bg1),#10163a 60%,var(--bg3))}
body.light{background:linear-gradient(180deg,#f7ead0,#f1dfc0)}
.hello{text-align:center;margin:2px 0 12px;position:relative}.hello h1{font-size:1.35rem;color:var(--gold)}.hello p{color:var(--mute);font-weight:700;font-size:.88rem}
.arches{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px}
.ar{position:relative;border-radius:999px 999px 22px 22px;padding:58px 10px 14px;text-align:center;color:#fff;border:2px solid var(--gold);box-shadow:inset 0 0 0 4px rgba(255,255,255,.10),0 14px 26px -14px rgba(0,0,0,.6);overflow:hidden;min-height:176px}
.ar::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(60deg,transparent 0 22px,rgba(255,255,255,.07) 22px 23px),repeating-linear-gradient(-60deg,transparent 0 22px,rgba(255,255,255,.07) 22px 23px)}
.ar::after{content:"";position:absolute;left:50%;top:-30%;width:120%;height:70%;margin-left:-60%;background:radial-gradient(closest-side,rgba(255,255,255,.4),transparent)}
.ar .ic{position:absolute;left:50%;top:20px;transform:translateX(-50%);z-index:2}.ar b{display:block;font-family:Cinzel,serif;margin-top:46px;font-size:1.02rem;position:relative}.ar small{font-weight:800;font-size:.76rem;opacity:.92;position:relative}
.ar.c1{background:linear-gradient(180deg,#3b8fd0,#1d4f93)}.ar.c2{background:linear-gradient(180deg,#3fb87a,#1d7a4c)}.ar.c3{background:linear-gradient(180deg,#e8794a,#b24420)}.ar.c4{background:linear-gradient(180deg,#8e6bd1,#503091)}
.big{grid-column:1/-1;display:flex;align-items:center;gap:14px;border-radius:26px;padding:12px 14px;background:linear-gradient(135deg,#c99a3c,#8a5f18);border:2px solid #ffe29a;color:#fff;box-shadow:0 14px 26px -14px #000a}
.big b{font-family:Cinzel,serif;font-size:1.1rem;display:block}.big small{font-weight:800;opacity:.92}
.cont{margin-top:14px;display:flex;align-items:center;gap:10px;justify-content:center;height:50px;border-radius:999px;background:var(--glass);border:1px solid var(--gb);font-weight:900}
`, `${topbar}${logo.replace('width="150"', 'width="110"')}
<div class="hello"><h1>Peace be with you, Fady</h1><p>Tuesday · Day 3 of your streak</p></div>
<div class="arches">
<div class="ar c1"><span class="ic">${I.clap(74)}</span><b>Sunday School</b><small>Lesson videos</small></div>
<div class="ar c2"><span class="ic">${I.hand(70)}</span><b>Attendance</b><small>I'm here today!</small></div>
<div class="ar c3"><span class="ic">${I.game(76)}</span><b>Games</b><small>Play &amp; learn</small></div>
<div class="ar c4"><span class="ic">${I.trophy(70)}</span><b>Quizzes</b><small>Test what you know</small></div>
<div class="big"><span>${I.book(66)}</span><div><b>The Bible</b><small>Read God's Word</small></div></div>
</div>
<div class="cont">▶ Continue: 4.10 The Agpeya</div>`, 0);

/* ---------- C: The Journey ---------- */
const C = page('Home C: The Journey', `
.hero{display:flex;align-items:center;gap:10px;margin:8px 0 6px;position:relative}.hero h1{font-size:1.35rem;line-height:1.15}.hero p{color:var(--mute);font-weight:700;font-size:.86rem}
.bub{position:relative;background:var(--glass);border:1px solid var(--gb);border-radius:18px;padding:8px 12px;flex:1;font-weight:700;font-size:.88rem}
.path{position:relative;height:560px;margin-top:6px}
.path svg.line{position:absolute;inset:0}
.n{position:absolute;display:flex;align-items:center;gap:10px;flex-direction:column;text-align:center;width:130px}
.n .orb{width:104px;height:104px;border-radius:50%;display:grid;place-items:center;border:3px solid rgba(255,255,255,.7);box-shadow:0 14px 26px -10px rgba(0,0,0,.6),inset 0 -10px 18px rgba(0,0,0,.18)}
.n b{font-family:Cinzel,serif;font-size:.98rem}.n small{color:var(--mute);font-weight:800;font-size:.76rem;margin-top:-6px}
.o1{background:radial-gradient(circle at 30% 25%,#8fd0f2,#2b6fb8)}.o2{background:radial-gradient(circle at 30% 25%,#7fe0a8,#25915a)}.o3{background:radial-gradient(circle at 30% 25%,#ffb27a,#d0562a)}.o4{background:radial-gradient(circle at 30% 25%,#c6aef5,#6a47c2)}.o5{background:radial-gradient(circle at 30% 25%,#ffe29a,#b9822a)}
.cont{display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:20px;background:var(--glass);border:1px solid var(--gb);margin-top:6px;font-weight:800;font-size:.9rem}
.mid{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);width:66px;height:66px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#7cc4ea,#2b6fb8);border:3px solid #ffe29a;box-shadow:0 10px 22px -6px #000a;z-index:5}
.tbar .tb:nth-child(3){margin-right:34px}.tbar .tb:nth-child(4){margin-left:34px}
`, `${topbar}
<div class="hero">${I.lumi(78)}<div class="bub"><b style="font-family:Cinzel,serif">Good morning, Fady!</b><br>Pick a door and let's go.</div></div>
<div class="cont">▶ Continue: 4.10 The Agpeya</div>
<div class="path"><svg class="line" viewBox="0 0 358 560" fill="none"><path d="M70 60C210 80 300 120 290 190S60 250 70 330 300 400 290 470" stroke="#e3b45c" stroke-opacity=".7" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/></svg>
<div class="n" style="left:0;top:0"><div class="orb o1">${I.clap(66)}</div><b>Sunday School</b><small>Lesson videos</small></div>
<div class="n" style="right:0;top:118px"><div class="orb o2">${I.hand(60)}</div><b>Attendance</b><small>I'm here today!</small></div>
<div class="n" style="left:0;top:236px"><div class="orb o3">${I.game(66)}</div><b>Games</b><small>Play &amp; learn</small></div>
<div class="n" style="right:0;top:352px"><div class="orb o4">${I.trophy(62)}</div><b>Quizzes</b><small>Test what you know</small></div>
<div class="n" style="left:0;top:456px"><div class="orb o5" style="width:84px;height:84px">${I.book(56)}</div><b>The Bible</b></div></div>
<div class="mid">${I.lumi(52)}</div>`, 0);

fs.writeFileSync(path.join(__dirname, 'home-a.html'), A);
fs.writeFileSync(path.join(__dirname, 'home-b.html'), B);
fs.writeFileSync(path.join(__dirname, 'home-c.html'), C);
console.log('3 mockups written');
