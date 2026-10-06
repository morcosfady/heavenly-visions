/* Merges lumi/cards-*.json into lumi/cards.json (the file the app and the helper read). Run: node lumi/build-cards.js */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => /^cards-.+\.json$/.test(f)).sort();
const all = [], seen = new Set();
files.forEach(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).forEach(c => {
  if (seen.has(c.id)) throw new Error('duplicate id ' + c.id);
  seen.add(c.id); all.push(c);
}));
fs.writeFileSync(path.join(dir, 'cards.json'), JSON.stringify(all, null, 1) + '\n');
console.log(all.length + ' cards from ' + files.length + ' files written to lumi/cards.json');
