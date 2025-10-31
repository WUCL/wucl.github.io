// ==========================================
// IdGenerator.js - 訂單編號生成
// ==========================================

/**
 * 產生訂單編號：YYMMDD-XXX
 * 例如 2025/10/26 → 251026-001
 */
function genId_(orderDate) {
  var date = orderDate ? new Date(orderDate) : new Date();
  if (isNaN(date.getTime())) date = new Date();

  var y = String(date.getFullYear()).slice(-2);
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var d = ('0' + date.getDate()).slice(-2);
  var key = 'SEQ_' + y + m + d;

  var p = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(LIMITS.LOCK_TIMEOUT);
    var n = Number(p.getProperty(key) || 0) + 1;
    p.setProperty(key, String(n));
    lock.releaseLock();

    var seq = String(n).padStart(3, '0');
    return y + m + d + '-' + seq + '-00';
  } catch (e) {
    Logger.log('Lock error in genId_: ' + e);
    throw new Error('無法生成訂單編號，請稍後再試');
  }
}

function ensureHeader_(name) {
  var sh = SH(ENV.ORDERS_SHEET);
  var headers = HDR(ENV.ORDERS_SHEET).headers;

  if (headers.indexOf(name) === -1) {
    sh.insertColumnAfter(headers.length || 1);
    sh.getRange(1, headers.length + 1).setValue(name);
  }
}

function findById_(orderId) {
  try {
    return FINDROW(ENV.ORDERS_SHEET, '訂單編號', orderId);
  } catch (e) {
    throw new Error('請先在 Orders 表第1列建立「訂單編號」欄位');
  }
}