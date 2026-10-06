/* Heavenly Visions: Ask Lumi, Phase 5 (servant dashboard). FIFTH FILE in the helper Apps Script project (name it lumi-admin).
   FREE. Every action here is for approved servants, coordinators, priests and masters only (checked in lumiPost). Kids can never reach it.
     lumi_gold_list / lumi_gold_save / lumi_gold_delete   gold answers: the official answer to a question, used word for word (stored in lmg_<id>)
     lumi_report {month}                                  most asked, unanswered and thumbs down questions (anonymous counts, no kid names)
     lumi_cfg_get / lumi_cfg_set                          settings: on/off, limits, grades. Setting is for coordinators, priests and masters only
   Alerts (lumi_alerts, lumi_alert_seen) and a kid's recent questions (lumi_hist with kid) live in lumi-ask.gs. */
var LM_GRADES = ['Pre K', 'KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
var LM_GOLD_MAX = 60;

function lmIsTop(u) { return u.role === 'coordinator' || u.role === 'priest' || u.role === 'master'; }
function lmGoldKeys(p) { return Object.keys(p.getProperties()).filter(function (k) { return k.indexOf('lmg_') === 0; }); }
function lmGoldClean(g) {
  var qs = (Array.isArray(g.q) ? g.q : []).map(function (t) { return clip(String(t).replace(/[<>]/g, ' '), 120); }).filter(function (t) { return lmWords(t).length >= 1 && t.length >= 4; }).slice(0, 4);
  var a = lmDash(clip(String(g.a || '').replace(/[<>]/g, ' '), 700));
  if (!qs.length || a.length < 20) return null;
  var v = g.v && g.v.text && g.v.ref ? { text: clip(g.v.text, 300), ref: clip(g.v.ref, 50) } : null;
  return { q: qs, a: a, v: v };
}

function lmAdmin(b, u) {
  var p = PropertiesService.getScriptProperties(), act = b.action;
  if (act === 'lumi_gold_list') {
    var items = lmGoldKeys(p).map(function (k) { var g = lmJson(p, k, null); if (g) g.id = k.slice(4); return g; }).filter(Boolean);
    items.sort(function (x, y) { return (y.ts || 0) - (x.ts || 0); });
    return { ok: true, items: items };
  }
  if (act === 'lumi_gold_save') {
    var c = lmGoldClean(b.gold || {});
    if (!c) return { ok: false, error: 'missing' };
    var id = /^[a-z0-9]{6,12}$/.test(String(b.gold.id || '')) ? b.gold.id : '';
    var keys = lmGoldKeys(p);
    if (!id) { if (keys.length >= LM_GOLD_MAX) return { ok: false, error: 'full' }; id = Utilities.getUuid().replace(/-/g, '').slice(0, 8); }
    else if (keys.indexOf('lmg_' + id) < 0) return { ok: false, error: 'none' };
    c.by = clip(u.name, 40); c.role = u.role; c.ts = lmNow();
    p.setProperty('lmg_' + id, JSON.stringify(c));
    return { ok: true, id: id };
  }
  if (act === 'lumi_gold_delete') {
    var gid = clip(b.gid, 20);
    if (!/^[a-z0-9]{6,12}$/.test(gid)) return { ok: false, error: 'bad' };
    p.deleteProperty('lmg_' + gid);
    return { ok: true };
  }
  if (act === 'lumi_report') {
    var m = /^\d{4}-\d{2}$/.test(String(b.month || '')) ? b.month : lmMonth();
    var top = lmJson(p, 'lmr_' + m, []), un = lmJson(p, 'lmu_' + m, []), down = lmJson(p, 'lmd_' + m, []);
    return {
      ok: true, month: m,
      totals: { asked: top.reduce(function (n, x) { return n + (x.n || 0); }, 0), distinct: top.length, unanswered: un.reduce(function (n, x) { return n + (x.n || 0); }, 0), down: down.length },
      top: top.slice(0, 15).map(function (x) { return { q: x.q, n: x.n, u: x.u || 0, dn: x.dn || 0 }; }),
      unanswered: un.slice(0, 20).map(function (x) { return { q: x.q, n: x.n, d: x.d }; }),
      down: down.slice(0, 15).map(function (x) { return { q: x.q, a: x.a, ts: x.ts, g: x.g }; })
    };
  }
  if (act === 'lumi_cfg_get') {
    var cfg = lmCfg(p), day = today();
    return { ok: true, cfg: cfg, today: Number(p.getProperty('lmq_all_' + day) || 0), canEdit: lmIsTop(u), grades: LM_GRADES };
  }
  if (act === 'lumi_cfg_set') {
    if (!lmIsTop(u)) return { ok: false, error: 'denied' };
    var s = b.cfg || {}, old = lmCfg(p);
    var out = {
      on: s.on === false ? false : true,
      perKid: Math.max(1, Math.min(100, Math.floor(Number(s.perKid)) || old.perKid)),
      perDay: Math.max(10, Math.min(1000, Math.floor(Number(s.perDay)) || old.perDay)),
      grades: (Array.isArray(s.grades) ? s.grades : []).filter(function (g) { return LM_GRADES.indexOf(g) >= 0; })
    };
    p.setProperty('lm_cfg', JSON.stringify(out));
    return { ok: true, cfg: out };
  }
  return { ok: false, error: 'bad' };
}
