/* Builds design-icons.js: the Lucide (ISC license) line icons used to replace emojis in the UI.
   Run: node design/build-icons.js   (needs internet once; the result is committed).
   To add an emoji: add a line to MAP below ("emoji": ["lucide-name", "color"]), run this, bump design-icons.js?v= in index.html. */
const fs = require('fs'), path = require('path'), https = require('https');

const G = '#2c9c5a', R = '#d4604b', Y = '#d79a24', O = '#e8794a', B = '#3b82c4', P = '#7a55c8', K = '#e8587a';
/* emoji (no variation selector) -> [lucide icon, color or "" for the text color] */
const MAP = {
  '✅': ['circle-check', G], '❌': ['circle-x', R], '✖': ['x', ''], '⚠': ['triangle-alert', Y], '❓': ['circle-help', B], '🚫': ['ban', R],
  '⭐': ['star', Y], '🌟': ['sparkle', Y], '✨': ['sparkles', Y], '💫': ['sparkles', Y], '🎉': ['party-popper', Y], '🎁': ['gift', K],
  '🏆': ['trophy', Y], '🏅': ['medal', Y], '🥇': ['medal', Y], '🥈': ['medal', '#9aa3b2'], '🥉': ['medal', '#b9783a'], '👑': ['crown', Y],
  '📖': ['book-open', B], '📘': ['book-open', B], '📚': ['library', B], '📜': ['scroll-text', Y], '📝': ['square-pen', ''], '✏': ['pencil', ''], '✍': ['pencil-line', ''],
  '📄': ['file-text', ''], '📋': ['clipboard-list', ''], '📁': ['folder', ''], '🗂': ['folders', ''], '📌': ['pin', R], '📍': ['map-pin', R],
  '🙏': ['hand-heart', P], '✝': ['cross', Y], '⛪': ['church', P], '🕊': ['bird', B], '🕯': ['flame', O], '🪔': ['flame', O], '🔥': ['flame', O],
  '🎮': ['gamepad-2', P], '🃏': ['layers', P], '🧩': ['puzzle', P], '🎯': ['target', R], '🎲': ['dice-5', P], '🎡': ['sparkles', Y],
  '▶': ['play', ''], '⬅': ['arrow-left', ''], '➡': ['arrow-right', ''], '◀': ['chevron-left', ''], '↗': ['arrow-up-right', ''], '⬇': ['download', ''],
  '↩': ['undo-2', ''], '↪': ['redo-2', ''], '🔁': ['repeat', ''], '🔀': ['shuffle', ''], '🔄': ['refresh-cw', ''],
  '📢': ['megaphone', K], '📣': ['megaphone', K], '💬': ['message-circle', B], '📞': ['phone', ''], '📲': ['smartphone', ''], '✉': ['mail', ''],
  '📊': ['chart-column', B], '📈': ['trending-up', G], '💡': ['lightbulb', Y], '🧠': ['brain', K], '🎓': ['graduation-cap', ''], '🏫': ['school', ''],
  '👤': ['user', ''], '👥': ['users', ''], '🧑‍🏫': ['presentation', ''], '🙂': ['smile', Y], '😊': ['smile', Y], '😇': ['smile', Y], '😮': ['meh', Y], '😅': ['smile', Y], '😕': ['frown', Y], '🙈': ['eye-off', ''], '🤔': ['circle-help', B],
  '🧒': ['user-round', ''], '👧': ['user-round', ''], '👶': ['baby', ''], '👼': ['baby', ''], '🙋': ['hand', Y], '✋': ['hand', Y], '👋': ['hand', Y], '🤝': ['handshake', ''], '👀': ['eye', ''],
  '👍': ['thumbs-up', G], '👎': ['thumbs-down', R], '💛': ['heart', Y], '💙': ['heart', B], '❤': ['heart', R],
  '➕': ['plus', ''], '➖': ['minus', ''], '🗑': ['trash-2', R], '💾': ['save', ''], '🔗': ['link', ''], '✂': ['scissors', ''], '🔨': ['hammer', ''], '🛠': ['wrench', ''], '⚙': ['settings', ''],
  '🔍': ['search', ''], '🔎': ['search', ''], '🔒': ['lock', ''], '🔑': ['key-round', Y], '🛡': ['shield', B], '🚨': ['siren', R], '🔔': ['bell', Y],
  '📅': ['calendar', B], '🗓': ['calendar', B], '⏳': ['hourglass', Y], '🕒': ['clock', ''], '🕘': ['clock', ''], '⏰': ['alarm-clock', R],
  '🎬': ['clapperboard', B], '📺': ['tv', ''], '📷': ['camera', ''], '🖼': ['image', ''], '🎨': ['palette', K], '🖌': ['paintbrush', K], '🖨': ['printer', ''],
  '🎵': ['music', P], '🎶': ['music', P], '🌙': ['moon', P], '💤': ['moon', P], '🛏': ['bed', P], '🌅': ['sunrise', O], '🌈': ['rainbow', P], '☁': ['cloud', B], '🌊': ['waves', B], '💧': ['droplet', B], '💨': ['wind', B], '⚡': ['zap', Y],
  '🌍': ['globe', B], '🧭': ['compass', ''], '🏠': ['house', ''], '🚪': ['door-open', ''], '🏛': ['landmark', ''], '⛺': ['tent', ''], '🚌': ['bus', ''], '🚢': ['ship', B], '⛵': ['sailboat', B], '🚀': ['rocket', P],
  '🌱': ['sprout', G], '🌿': ['leaf', G], '🌴': ['tree-palm', G], '🎄': ['tree-pine', G], '🌸': ['flower-2', K], '🌺': ['flower-2', K], '🌻': ['flower', Y], '🏔': ['mountain', ''],
  '🐟': ['fish', B], '🍕': ['pizza', O], '🎂': ['cake', K], '🍷': ['wine', R], '🍇': ['grape', P], '🛍': ['shopping-bag', K], '🎒': ['backpack', ''], '⚔': ['swords', ''],
  '🦁': ['paw-print', O], '🦊': ['paw-print', O], '🐼': ['paw-print', ''], '🦄': ['paw-print', K], '🐘': ['paw-print', ''], '🦒': ['paw-print', Y], '🐧': ['bird', ''], '🐴': ['paw-print', ''], '🐖': ['paw-print', K], '🐪': ['paw-print', Y], '🐋': ['fish', B], '🐬': ['fish', B], '🐢': ['turtle', G], '🦅': ['bird', Y], '🦋': ['origami', P], '🕵': ['search', ''], '⚽': ['circle-dot', ''], '🪈': ['music', Y], '🧺': ['shopping-basket', Y], '🪣': ['paint-bucket', B], '🧽': ['sparkles', Y], '🫙': ['container', ''], '🏜': ['sun', O],
  '📭': ['inbox', ''], '📡': ['radio', ''], '📴': ['wifi-off', ''], '🔤': ['type', ''], '🏖': ['umbrella', O], '🗼': ['landmark', ''], '🪨': ['mountain', ''], '🧸': ['teddy-bear', K], '🎈': ['party-popper', K], '🆕': ['sparkles', Y]
};
/* colored dots (circles and squares) are drawn directly by the swapper, no download needed */
const DOTS = { '🟢': '#3fae6a', '🔴': '#d4604b', '🟡': '#f0b84f', '🔵': '#4a8fd8', '🟣': '#8e6bd1', '🟦': '#4a8fd8', '⬜': '#cfd3e6', '⚪': '#e4e6f2', '▫': '#aab0cc', '🌑': '#3a3f6a' };

const names = [...new Set(Object.values(MAP).map(v => v[0]))];
const get = (u, n = 0) => new Promise((res, rej) => https.get(u, r => {
  if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 5) return res(get(new URL(r.headers.location, u).href, n + 1));
  if (r.statusCode !== 200) return rej(new Error(u + ' ' + r.statusCode));
  let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
}).on('error', rej));

(async () => {
  const icons = {}, missing = [];
  await Promise.all(names.map(async n => {
    try {
      const svg = await get('https://unpkg.com/lucide-static@latest/icons/' + n + '.svg');
      icons[n] = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replace(/\s+/g, ' ').trim();
    } catch (e) { missing.push(n) }
  }));
  /* fall back for names that do not exist in Lucide */
  const alt = { 'teddy-bear': 'smile', 'meh': 'smile', 'dice-5': 'puzzle' };
  missing.forEach(n => { if (alt[n] && icons[alt[n]]) icons[n] = icons[alt[n]] });
  const stillMissing = names.filter(n => !icons[n]);
  const out = '/* Generated by design/build-icons.js. Line icons from Lucide (ISC license, https://lucide.dev). Do not edit by hand. */\n' +
    'window.HV_LUCIDE=' + JSON.stringify(icons) + ';\nwindow.HV_EMOJI=' + JSON.stringify(MAP) + ';\nwindow.HV_DOTS=' + JSON.stringify(DOTS) + ';\n';
  fs.writeFileSync(path.join(__dirname, '..', 'design-icons.js'), out);
  console.log(names.length + ' icons, ' + Object.keys(MAP).length + ' emojis mapped, ' + Object.keys(DOTS).length + ' dots. Missing: ' + (stillMissing.join(', ') || 'none') + '. Size ' + Math.round(out.length / 1024) + ' KB');
})();
