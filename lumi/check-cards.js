/* Checks Lumi card files. Run: node lumi/check-cards.js lumi/cards-faith.json [more files]
   With no arguments it checks lumi/cards.json. Prints problems and exits with 1 if there are any. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(__dirname, 'cards.json')];

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const quizIds = new Set([...html.matchAll(/id:\s*"([a-z0-9-]+)"\s*,\s*(?:t|title|name)/g)].map(m => m[1]));
const knownVideos = new Set((() => { try { return eval('[' + html.match(/const V=\[([\s\S]*?)\n\];/)[1] + ']').map(v => v[0]) } catch (e) { return [] } })());
const quizBlock = (html.match(/const QUIZZES=\[[\s\S]*?\n\];/) || [''])[0];
[...quizBlock.matchAll(/\{id:"([a-z0-9-]+)"/g)].forEach(m => quizIds.add(m[1]));
const cur = fs.readFileSync(path.join(root, 'curriculum.js'), 'utf8');
const lessonIds = new Set();
['prek', 'kg', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12'].forEach(g => {
  const m = cur.match(new RegExp('"' + g + '":\\[(.*?)\\](?=,"g|\\};)', 's'));
  if (m) [...m[1].matchAll(/\["([0-9A-Z.]+)","/g)].forEach(x => lessonIds.add('l-' + g + '-' + x[1]));
});
const okRoute = r => /^(m-saints|m-feasts|calendar|verse|bible|games|bedtime|coloring|quizzes)$/.test(r) || /^b-[A-Za-z0-9 ]+-\d+$/.test(r) ||
  (/^quiz-/.test(r) && (quizIds.size === 0 || quizIds.has(r.slice(5)))) || (/^l-/.test(r) && (lessonIds.size === 0 || lessonIds.has(r)));
const TAGS = ['saint', 'feast', 'fast', 'sacrament', 'prayer', 'bible', 'church', 'history', 'virtue', 'trinity', 'mary', 'jesus', 'liturgy', 'calendar', 'martyr', 'angel', 'prophet', 'icon'];
const SOURCES = ['Bible (KJV)', 'Bible (WEB)', 'Heavenly Visions kid summary of Coptic Orthodox teaching', 'Heavenly Visions kid summary, Synaxarium style', 'Heavenly Visions app content', 'St-Takla.org (our own words)'];

let bad = 0, total = 0;
const seen = new Set();
const say = (f, id, m) => { bad++; console.log(path.basename(f) + ' ' + id + ': ' + m) };
files.forEach(f => {
  let cards;
  try { cards = JSON.parse(fs.readFileSync(f, 'utf8')) } catch (e) { say(f, '-', 'does not parse: ' + e.message); return }
  if (!Array.isArray(cards)) { say(f, '-', 'must be an array'); return }
  cards.forEach(c => {
    total++;
    const id = c.id || '(no id)';
    if (!/^[a-z0-9-]+$/.test(c.id || '')) say(f, id, 'bad id');
    if (seen.has(c.id)) say(f, id, 'duplicate id'); seen.add(c.id);
    if (!c.title || c.title.length > 80) say(f, id, 'title missing or too long');
    const words = String(c.text || '').trim().split(/\s+/).filter(Boolean).length;
    if (words < 40 || words > 320) say(f, id, 'text has ' + words + ' words (want about 70 to 200)');
    if (/[–—]/.test(JSON.stringify(c))) say(f, id, 'has an em dash or en dash');
    if (/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(c.text || '')) say(f, id, 'emoji inside text');
    if (!Array.isArray(c.tags) || c.tags.length < 2 || c.tags.length > 6) say(f, id, 'needs 2 to 6 tags');
    else if (!c.tags.some(t => TAGS.includes(t))) say(f, id, 'needs at least one topic tag from the allowed list');
    if (!Array.isArray(c.kw) || c.kw.length < 3) say(f, id, 'needs at least 3 kw words');
    if (!['little', 'older', 'all'].includes(c.level)) say(f, id, 'bad level');
    if (!SOURCES.includes(c.source)) say(f, id, 'source must be one of the allowed labels');
    if (c.url !== undefined && !/^https:\/\/(www\.)?st-takla\.org\//.test(c.url)) say(f, id, 'url must be a st-takla.org page');
    if (c.source === 'St-Takla.org (our own words)' && !c.url) say(f, id, 'St-Takla source needs a url');
    if (typeof c.ref !== 'string') say(f, id, 'ref must be a string');
    if (!Array.isArray(c.links)) say(f, id, 'links must be an array'); else c.links.forEach(r => { if (!okRoute(r)) say(f, id, 'unknown link route ' + r) });
    if (c.verse && (!c.verse.text || !c.verse.ref)) say(f, id, 'verse needs text and ref');
    if (c.videos !== undefined && (!Array.isArray(c.videos) || c.videos.length > 3 || c.videos.some(v => !knownVideos.has(v)))) say(f, id, 'videos must be 1 to 3 ids that exist in the V list of index.html');
    if (typeof c.verify !== 'boolean') say(f, id, 'verify must be true or false');
    if (c.approved !== false) say(f, id, 'approved must be false');
  });
});
console.log(total + ' cards checked, ' + bad + ' problems');
process.exit(bad ? 1 : 0);
