/** ChangeLog 寫入（新版 schema）
 * 表頭：ts | action | order_id | actor | line_name | line_id | field | old | new | snapshot | note
 *
 * 用法：
 *  A) 建立（快照）：
 *     ChangeLog_append({
 *       action: 'create',
 *       orderId, actor, lineName, lineId,
 *       snapshot: data
 *     })
 *
 *  B) 更新（逐欄差異）：
 *     ChangeLog_append({
 *       action: 'update',
 *       orderId, actor, lineName, lineId,
 *       diff: { '是否已付款': {old:'未付款', new:'已付款'}, ... },
 *       note: 'LIFF 編輯'
 *     })
 */

function ChangeLog_append(entry) {
  const ss = SS();
  const sh = ss.getSheetByName(ENV.CHANGELOG_SHEET);
  if (!sh) throw new Error('找不到表：' + ENV.CHANGELOG_SHEET);

  // 保險：確保表頭正確
  ensureChangelogHeader_(sh);

  const now = nowStr_();

  // A) 有 diff → 多列寫入（每欄一列）
  if (entry.diff && typeof entry.diff === 'object') {
    const keys = Object.keys(entry.diff);
    if (keys.length) {
      const rows = keys.map(function(k) {
        const d = entry.diff[k] || {};
        return [
          now, (entry.action || 'update'), (entry.orderId || ''), (entry.actor || ''),
          (entry.lineName || ''), (entry.lineId || ''),
          k, (d.old == null ? '' : d.old), (d.new == null ? '' : d.new),
          '', (entry.note || '')
        ];
      });
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
    return;
  }

  // B) 沒 diff → 單列寫入（建立快照或單欄位變更）
  sh.appendRow([
    now, (entry.action || ''), (entry.orderId || ''), (entry.actor || ''),
    (entry.lineName || ''), (entry.lineId || ''),
    (entry.field || ''), (entry.old == null ? '' : entry.old), (entry.new == null ? '' : entry.new),
    entry.snapshot ? (typeof entry.snapshot === 'string' ? entry.snapshot : JSON.stringify(entry.snapshot)) : '',
    (entry.note || '')
  ]);
}

function ensureChangelogHeader_(sh) {
  const headers = ['ts','action','order_id','actor','line_name','line_id','field','old','new','snapshot','note'];
  const need = headers.length;
  const first = sh.getRange(1,1,1,Math.max(need, sh.getLastColumn())).getValues()[0];
  if (first[0] !== 'ts' || sh.getLastColumn() !== need) {
    sh.clear();
    sh.appendRow(headers);
  } else {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  }
}
