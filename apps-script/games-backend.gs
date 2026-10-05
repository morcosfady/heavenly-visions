/* Heavenly Visions: Games backend (Google Apps Script).
   Stores published games in Script Properties (no extra Google permissions needed).
   Each game is cut into 8000 character pieces because one property holds about 9 KB. */

var PIN = '496691';

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = PropertiesService.getScriptProperties();
  var a = e.parameter.action;
  if (a === 'list') {
    return out({ ok: true, games: JSON.parse(p.getProperty('index') || '[]') });
  }
  if (a === 'get') {
    var id = e.parameter.id;
    var n = Number(p.getProperty('n_' + id));
    if (!n) return out({ ok: false });
    var s = '';
    for (var i = 0; i < n; i++) s += p.getProperty('c_' + id + '_' + i);
    return out({ ok: true, game: JSON.parse(s) });
  }
  return out({ ok: false });
}

function removeGame(p, id) {
  var n = Number(p.getProperty('n_' + id)) || 0;
  for (var i = 0; i < n; i++) p.deleteProperty('c_' + id + '_' + i);
  p.deleteProperty('n_' + id);
  var index = JSON.parse(p.getProperty('index') || '[]');
  return index.filter(function (g) { return g.id !== id; });
}

function doPost(e) {
  var b = JSON.parse(e.postData.contents);
  if (b.pin !== PIN) return out({ ok: false, error: 'pin' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = PropertiesService.getScriptProperties();
    if (b.action === 'check') return out({ ok: true });
    if (b.action === 'delete') {
      p.setProperty('index', JSON.stringify(removeGame(p, b.id)));
      return out({ ok: true });
    }
    if (b.action === 'save') {
      var g = b.game;
      var index = removeGame(p, g.id);
      var s = JSON.stringify(g);
      var n = Math.ceil(s.length / 8000);
      try {
        for (var i = 0; i < n; i++) p.setProperty('c_' + g.id + '_' + i, s.substr(i * 8000, 8000));
        p.setProperty('n_' + g.id, String(n));
        index.unshift({ id: g.id, t: g.t, title: g.title, grade: g.grade, lesson: g.lesson, updated: g.updated });
        p.setProperty('index', JSON.stringify(index));
      } catch (err) {
        p.setProperty('index', JSON.stringify(removeGame(p, g.id)));
        return out({ ok: false, error: 'full' });
      }
      return out({ ok: true });
    }
    return out({ ok: false });
  } finally {
    lock.releaseLock();
  }
}
