/** =======================
 * ChangeLog
 * 欄位（建議表頭）：
 * ts, action, order_id, actor, line_name, line_id, field, old, new, snapshot, note
 * ======================= */

function ChangeLog_append(entry){
  var ss = SS();
  var sh = SH(ENV.CHANGELOG_SHEET) || ss.insertSheet(ENV.CHANGELOG_SHEET);

  // 確保表頭
  var headers = ['ts','action','order_id','actor','line_name','line_id','field','old','new','snapshot','note'];
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  else {
    // 對齊第一列（避免舊專案表頭不同）
    var first = sh.getRange(1,1,1,headers.length).getValues()[0];
    if (String(first[0]).trim() !== 'ts') {
      sh.clear();
      sh.appendRow(headers);
    }
  }

  var now = Utilities.formatDate(entry.time || new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');

  // A) diff：每個欄位一列
  if (entry.diff && typeof entry.diff === 'object') {
    var rows = Object.keys(entry.diff).map(function(k){
      var d = entry.diff[k] || {};
      return [
        now, entry.action || 'update', entry.orderId || '', entry.actor || '',
        entry.lineName || '', entry.lineId || '',
        k, (d.old != null ? d.old : ''), (d.new != null ? d.new : ''),
        '', entry.note || ''
      ];
    });
    if (rows.length) sh.getRange(sh.getLastRow()+1, 1, rows.length, headers.length).setValues(rows);
    return;
  }

  // B) snapshot：建立時寫一列
  var snapshot = '';
  try {
    snapshot = entry.snapshot ? (typeof entry.snapshot === 'string' ? entry.snapshot : JSON.stringify(entry.snapshot)) : '';
  } catch (_){ snapshot = ''; }

  sh.appendRow([
    now, entry.action || '', entry.orderId || '', entry.actor || '',
    entry.lineName || '', entry.lineId || '',
    entry.field || '', (entry.old != null ? entry.old : ''), (entry.new != null ? entry.new : ''),
    snapshot, entry.note || ''
  ]);
}
