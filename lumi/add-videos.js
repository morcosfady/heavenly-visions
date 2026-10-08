/* Puts the channel videos on the Lumi cards. Run: node lumi/add-videos.js
   Each card gets "videos": [YouTube ids] (best first). Only videos that really exist in index.html (the V list) are allowed,
   so Lumi never points a child to a video that is "coming soon". When a new video is published, add it to V in index.html,
   add it below, run this file, then node lumi/build-cards.js. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8') + ' ' + fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const V = eval('[' + html.match(/const V=\[([\s\S]*?)\n\];/)[1] + ']');
const known = new Set(V.map(v => v[0]));

const MAP = {
  'bible-creation': ['ArIC3kr3um0', '_volkElfX1k'],
  'bible-adam-eve': ['apX8Aj9cmkI', 'XXrEYm55i0c'],
  'bible-daniel': ['iuXjBbh0kp0', 'S3xfjAHz2d4'],
  'bible-prodigal-son': ['lrN2Cwo0xWE'],
  'bible-nativity': ['nf9nTCL1GMk'],
  'bible-pentecost': ['CMnye7L_E2o'],
  'bible-what-is': ['hS4Ux62FcJ0'],
  'bible-old-new-testament': ['hS4Ux62FcJ0'],
  'bible-resurrection': ['ZH6C0fpF_Vc'],
  'bible-last-supper': ['2CEJrgi4uGc'],
  'feast-cross-good-friday': ['Do41H2mzad8'],
  'feast-resurrection': ['ZH6C0fpF_Vc'],
  'feast-palm-sunday': ['6ZfefQb5R6U'],
  'feast-nayrouz': ['BHKgrAQCs3A'],
  'feast-coptic-calendar-nayrouz': ['BHKgrAQCs3A'],
  'feast-annunciation': ['nf9nTCL1GMk'],
  'feast-nativity': ['alqMhECRjw0', 'BqnM-BuA9MY'],
  'feast-ascension': ['UQfpRmoRAAI'],
  'feast-pentecost': ['CMnye7L_E2o'],
  'feast-transfiguration': ['gMAFxDCTzr8'],
  'feast-apostles': ['sGdE0I9DA8w', 'I_iuKkKC_Zg'],
  'fast-apostles': ['I_iuKkKC_Zg', 'sGdE0I9DA8w'],
  'fast-nativity': ['alqMhECRjw0', 'BqnM-BuA9MY'],
  'fast-great-lent': ['B1APrQsFZ1E'],
  'fast-basics': ['YjAI1Rkck-U'],
  'faith-theotokos': ['7fVngbW80HY', 'ZDRMmShq1jg', 'cjRS8Zs58Dk'],
  'faith-theotokos-why-honor': ['ZDRMmShq1jg'],
  'word-theotokos': ['7fVngbW80HY'],
  'faith-angels': ['u9PhDJkbQHM'],
  'saint-michael': ['u9PhDJkbQHM', 'O94kIqHBOYA'],
  'saint-george': ['wzs5AUAI8AI', 'NeeQC_AwgdQ'],
  'saint-mark': ['FwCOA9rChw4', '7TxD6UvY9G4', 'KyOjtZjBBQ4'],
  'hist-st-mark': ['7TxD6UvY9G4', 'FwCOA9rChw4'],
  'saint-moses-black': ['9LJMzNc5w9w'],
  'saint-demiana': ['wzEpgARzpo4'],
  'saint-abraam': ['2L2h8Wxv9fo'],
  'saint-philopater': ['1Cjo-Zxt-Cs', 'LtLLDDaH56I'],
  'saint-athanasius': ['pvg0arL3GfU', 'WQ-viHh3seU'],
  'saint-john-baptist': ['el-9WkiWryU', 'duAYMBpBRe8'],
  'church-priest': ['ALQ2yXi4Yzc'],
  'church-door-nave': ['WhiR1XqxIBM'],
  'church-haykal': ['WhiR1XqxIBM'],
  'church-iconostasis': ['WhiR1XqxIBM'],
  'church-altar': ['WhiR1XqxIBM'],
  'church-domes-cross': ['WhiR1XqxIBM'],
  'sac-eucharist': ['2CEJrgi4uGc', 'Rq7UcDSDdLg'],
  'sac-communion-ready': ['2CEJrgi4uGc'],
  'pray-meal': ['sRSsgo4-D0o'],
  'virtue-gratitude': ['sRSsgo4-D0o']
};

let n = 0, bad = 0;
fs.readdirSync(__dirname).filter(f => /^cards-.+\.json$/.test(f)).forEach(f => {
  const file = path.join(__dirname, f), cards = JSON.parse(fs.readFileSync(file, 'utf8'));
  cards.forEach(c => {
    const ids = MAP[c.id];
    if (ids) {
      ids.forEach(id => { if (!known.has(id)) { console.log('NOT IN V: ' + id + ' (' + c.id + ')'); bad++ } });
      c.videos = ids.filter(id => known.has(id)); n++;
    } else delete c.videos;
  });
  fs.writeFileSync(file, JSON.stringify(cards, null, 1) + '\n');
});
Object.keys(MAP).forEach(id => { /* every mapped card must exist */ });
console.log(n + ' cards have videos. ' + (bad ? bad + ' ids are not in V.' : 'All video ids exist.'));
process.exit(bad ? 1 : 0);
