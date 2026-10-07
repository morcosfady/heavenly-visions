/* Lists every emoji in the UI source. Run: node design/inventory.js  (prints counts per emoji and per file) */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = fs.readdirSync(root).filter(f => /\.(js|html|css)$/.test(f) && !/^(sw|qr)\.js$/.test(f));
const re = /(?:\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)/gu;
const by = {}, perFile = {};
files.forEach(f => {
  const t = fs.readFileSync(path.join(root, f), 'utf8');
  (t.match(re) || []).forEach(e => { const k = e.replace(/️/g, ''); (by[k] = by[k] || { n: 0, files: new Set() }); by[k].n++; by[k].files.add(f); perFile[f] = (perFile[f] || 0) + 1 });
});
const rows = Object.entries(by).sort((a, b) => b[1].n - a[1].n);
console.log(rows.length + ' different emojis, ' + rows.reduce((s, r) => s + r[1].n, 0) + ' uses');
console.log(Object.entries(perFile).sort((a, b) => b[1] - a[1]).map(([f, n]) => f + ':' + n).join('  '));
console.log(rows.map(([e, v]) => e + ' ' + v.n + ' (' + [...v.files].slice(0, 4).join(',') + ')').join('\n'));
