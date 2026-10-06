/* TEST MODE ONLY. Serves the AI helper (ai-helper.gs + lumi.gs) on http://localhost:8789 with a fake AI answer and a fake games backend
   (ids starting with k and a digit are students, serv* servants, coord* coordinators, abouna a priest), so the AI Helper and Lumi cards screens can be tried:
   http://localhost:8001/?ai=http://localhost:8789#ai . No key, no internet, nothing real. */
const http = require('http');
const { make } = require('./lumi-env');
const GOOD = { games: [
  { t: 'kahoot', title: 'Noah and the Ark quiz', items: [{ q: 'Who built the ark?', a: 'Noah', b: 'Moses', c: 'David', d: 'Paul', ok: 'a' }, { q: 'How many of each animal came in?', a: 'One', b: 'Two', c: 'Three', d: 'Ten', ok: 'b' }, { q: 'What did the dove bring back?', a: 'A fish', b: 'A flower', c: 'An olive leaf', d: 'A stone', ok: 'c' }] },
  { t: 'verse', title: 'Verse for Noah', items: [{ text: 'I set My *rainbow* in the *cloud*.', ref: 'Genesis 9:13' }] },
  { t: 'wordsearch', title: 'Noah words', items: [{ w: 'ARK', hint: 'The big boat' }, { w: 'DOVE', hint: 'Brought a leaf' }, { w: 'RAIN', hint: 'Fell for days' }, { w: 'NOAH', hint: 'Built the ark' }] }] };
const env = make({ ai: () => JSON.stringify(GOOD) });
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return }
  let body = ''; req.on('data', c => body += c); req.on('end', () => { res.setHeader('Content-Type', 'application/json'); let b = {}; try { b = JSON.parse(body || '{}') } catch (e) { }
    setTimeout(() => res.end(JSON.stringify(env.post(Object.assign({}, b, { token: 'ok' })))), 250) });
}).listen(8789, () => console.log('fake AI helper on http://localhost:8789'));
