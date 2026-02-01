// ==========================================
// ChangeLog.js - 變更紀錄
// ==========================================

function ChangeLog_append(entry) {
  var ss = SS();
  var sh = SH(ENV.CHANGELOG_SHEET);

  if (!sh) {
    sh = ss.insertSheet(ENV.CHANGELOG_SHEET);
    sh.appendRow(['ts', 'action', 'order_id', 'actor', 'line_name', 'line_id', 'field', 'old', 'new', 'snapshot', 'note']);
    sh.setFrozenRows(1);
  }

  var now = Utilities.formatDate(entry.time || new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');

  // A) 修改模式：每個變動欄位寫一行
  if (entry.diff && typeof entry.diff === 'object') {
    var rows = Object.keys(entry.diff).map(function(k) {
      var d = entry.diff[k] || {};
      return [
        now, 'update', entry.orderId || '', entry.actor || '',
        entry.lineName || '', entry.lineId || '',
        k, String(d.old || ''), String(d.new || ''), '', ''
      ];
    });

    if (rows.length > 0) {
      var lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, rows.length, 11).setValues(rows);
    }
    return;
  }

  // B) 新增/刪除模式：寫入一整列快照
  sh.appendRow([
    now, entry.action || '', entry.orderId || '', entry.actor || '',
    entry.lineName || '', entry.lineId || '',
    '', '', '', JSON.stringify(entry.snapshot || {}), entry.note || ''
  ]);
}

/**
 * 紀錄系統運作日誌
 * @param {string} level 級別 (INFO/ERROR)
 * @param {string} action 動作名稱
 * @param {object} opt 包含 actor, duration, details 等資訊
 */
function SystemLog_append(level, action, opt) {
  try {
    const ss = SS();
    let sh = SH(ENV.SYSTEMLOG_SHEET);

    if (!sh) {
      sh = ss.insertSheet(ENV.SYSTEMLOG_SHEET);
      sh.appendRow(['ts', 'level', 'action', 'actor', 'platform', 'ms', 'details', 'status']);
      sh.setFrozenRows(1);
    }

    sh.appendRow([
      new Date(),
      level || 'INFO',
      action || '',
      opt.actor || '',
      opt.platform || '',
      opt.ms || 0,
      typeof opt.details === 'object' ? JSON.stringify(opt.details) : String(opt.details || ''),
      opt.status || 'OK'
    ]);

    // 【自動維護】維持效能，超過 2000 筆時刪除最早的 500 筆
    var lastRow = sh.getLastRow();
    if (lastRow > (LIMITS.MAX_LOG_ROWS || 2000)) {
      sh.deleteRows(2, 500);
    }
  } catch (e) {
    console.error('[SystemLog_append] Critical Error:', e.toString());
  }
}