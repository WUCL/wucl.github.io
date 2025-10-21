/** 前端 API 專用：回 JSON（不加 CORS header，避免 Apps Script preflight 限制） */
function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 健康檢查（?api=1 用 POST；GET 可簡易 ping） */
function doGet(e) {
  var isApi = e && e.parameter && e.parameter.api == '1';
  if (isApi) return _json({ ok: true, pong: true });
  return ContentService.createTextOutput('OK');
}

/** 簡單時間字串 */
function nowStr_() {
  return Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');
}
