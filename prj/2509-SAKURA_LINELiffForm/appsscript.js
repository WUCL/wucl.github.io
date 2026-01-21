/** 設定你的工作表分頁名稱 */
const SHEET_NAME = 'thisisfortest';
const LOG_SHEET = 'AuditLog';

// 寫一筆審計紀錄到 AuditLog 分頁
function logEvent({ uid = '', action = '', ok = true, message = '' } = {}) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName(LOG_SHEET);
  if (!logSheet) logSheet = ss.insertSheet(LOG_SHEET);
  logSheet.appendRow([new Date(), uid, action, ok ? 'OK' : 'FAIL', message]);
}

/** 外部前端用 POST 送 JSON 字串進來，就寫一列到 Sheet */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty POST body');

    // 解析 JSON
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);

    const uid = data.lineUid || '';
    if (!uid) throw new Error('缺少 LINE UID');

    // 檢查是否重複（UID 在第 3 欄）
    const uidCol = 3;
    const totalRows = sheet.getLastRow();
    const exists = totalRows > 1
      ? sheet.getRange(2, uidCol, totalRows - 1, 1).getValues().flat().includes(uid)
      : false;

    if (exists) {
      logEvent({ uid, action: 'skip-duplicate', ok: true, message: 'UID exists' });
      return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'UID exists, skipped' }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // 寫入主表
    // 建議先在 Sheet 第 1 列打上對應標題（見 Step 3）
    const row = [
      new Date(),                 // ServerTime
      data.timestamp || '',       // ClientTime
      data.lineUid || '',
      data.displayName || '',
      data.pictureUrl || '',
      data.t1 || '',
      data.t2 || '',
      data.t3 || '',
      data.t4 || '',
      data.t5 || '',
      data.t6 || '',
      data.t7 || '',
      data.name || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.consent ? '同意' : '不同意'
    ];
    sheet.appendRow(row);

    // 回應（若前端用 no-cors 看不到也沒關係）
    logEvent({ uid, action: 'append', ok: true, message: 'row added' });
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // 失敗也寫一筆 log
    logEvent({ uid: '', action: 'error', ok: false, message: String(err) });
    return ContentService.createTextOutput(JSON.stringify({ ok: false, message: String(err) }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/** 手動測試：在編輯器直接執行一次，應該會寫入一列 */
function testAppend() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);
  sheet.appendRow([new Date(), 'TEST']);
}
