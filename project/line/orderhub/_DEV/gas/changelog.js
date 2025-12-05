// ==========================================
// ChangeLog.js - 變更紀錄
// ==========================================

function ChangeLog_append(entry) {
  var ss = SS();
  var sh = SH(ENV.CHANGELOG_SHEET);

  // [優化] 如果 Sheet 不存在才建立，避免每次檢查邏輯
  if (!sh) {
    sh = ss.insertSheet(ENV.CHANGELOG_SHEET);
    sh.appendRow(['ts', 'action', 'order_id', 'actor', 'line_name', 'line_id', 'field', 'old', 'new', 'snapshot', 'note']);
  }

  // [優化] 預定義好的欄位順序，避免每次運算
  // 注意：這裡移除了每次檢查第一列是否為 ts 的邏輯，提升寫入速度

  var now = Utilities.formatDate(
    entry.time || new Date(),
    'Asia/Taipei',
    'yyyy/MM/dd HH:mm:ss'
  );

  // A) diff：每個欄位一列 (Bulk Write)
  if (entry.diff && typeof entry.diff === 'object') {
    var rows = Object.keys(entry.diff).map(function(k) {
      var d = entry.diff[k] || {};
      return [
        now,
        entry.action || 'update',
        entry.orderId || '',
        entry.actor || '',
        entry.lineName || '',
        entry.lineId || '',
        k,                            // field
        (d.old != null ? d.old : ''), // old
        (d.new != null ? d.new : ''), // new
        '',                           // snapshot
        entry.note || ''
      ];
    });

    // [優化] 只有當真的有 rows 時才寫入
    if (rows.length > 0) {
      // 這裡直接 append 即可，不需要計算 lastRow，appendRow 本身是原子的 (Atomic) 較安全
      // 但因為是多行寫入，用 getRange + setValues 效能較好
      var lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, rows.length, 11).setValues(rows);
    }
    return;
  }

  // B) snapshot：建立時寫一列
  var snapshot = '';
  try {
    snapshot = entry.snapshot
      ? (typeof entry.snapshot === 'string' ? entry.snapshot : JSON.stringify(entry.snapshot))
      : '';
  } catch (_) {
    snapshot = '';
  }

  sh.appendRow([
    now,
    entry.action || '',
    entry.orderId || '',
    entry.actor || '',
    entry.lineName || '',
    entry.lineId || '',
    entry.field || '',
    (entry.old != null ? entry.old : ''),
    (entry.new != null ? entry.new : ''),
    snapshot,
    entry.note || ''
  ]);
}