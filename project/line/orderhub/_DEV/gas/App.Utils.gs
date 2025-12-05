// ==========================================
// App.Utils.gs - 通用工具箱
// (包含：HTTP回應, 日期處理, ID生成, LINE訊息發送)
// ==========================================

// --- HTTP & JSON Utils ---
const _json = (obj) => {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
};

const log = (title, obj) => {
  console.log(`=== ${title} ===`, JSON.stringify(obj, null, 2));
};

// --- LINE Messaging Utils ---
function replyMessage(replyToken, msgs) {
  const token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token) return console.error('缺少 LINE_CHANNEL_ACCESS_TOKEN');

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ replyToken, messages: msgs }),
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });
}

function sendLinePush_(to, text) {
  if (!to) return console.warn('sendLinePush_ skipped: no "to" userId');

  const token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token) throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN');

  try {
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        to: to,
        messages: [{ type: 'text', text: text }]
      }),
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error('[sendLinePush_] error:', err);
  }
}

// --- Date Utils ---
function getNextFriday_(d) {
  var date = new Date(d);
  var day = date.getDay();
  var diff = (5 - day + 7) % 7;
  if (diff === 0 && day !== 5) diff = 7;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function filterByDateRange_(rows, dateField, range, customMonth) {
  if (!range || (range !== 'this-week' && range !== 'this-month' && range !== 'month')) return rows;
  if (range === 'month' && !customMonth) return rows;

  var now = new Date();
  var start, end;

  switch (range) {
    case 'this-week':
      start = new Date(now); start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay());
      end = new Date(start); end.setDate(end.getDate() + 7);
      break;
    case 'this-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'month':
      var ym = String(customMonth).split('-');
      var yy = Number(ym[0] || 0), mm = Number(ym[1] || 0) - 1;
      start = new Date(yy, mm, 1); end = new Date(yy, mm + 1, 1);
      break;
  }

  return rows.filter(function(r) {
    var d = new Date(r[dateField]);
    return !isNaN(d.getTime()) && (d >= start && d < end);
  });
}

// --- ID & Sheet Utils ---
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
    lock.waitLock(LIMITS.LOCK_TIMEOUT); // LIMITS 來自 config.js
    var n = Number(p.getProperty(key) || 0) + 1;
    p.setProperty(key, String(n));
    lock.releaseLock();
    return y + m + d + '-' + String(n).padStart(3, '0') + '-00';
  } catch (e) {
    throw new Error('無法生成訂單編號');
  }
}

function ensureHeader_(name) {
  var sh = SH(ENV.ORDERS_SHEET); // SH/ENV 來自 Repo.js/config.js
  var headers = HDR(ENV.ORDERS_SHEET).headers;
  if (headers.indexOf(name) === -1) {
    sh.insertColumnAfter(headers.length || 1);
    sh.getRange(1, headers.length + 1).setValue(name);
  }
}

function findById_(orderId) {
  try { return FINDROW(ENV.ORDERS_SHEET, '訂單編號', orderId); }
  catch (e) { throw new Error('請先在 Orders 表第1列建立「訂單編號」欄位'); }
}

const sanitizePhone_ = (obj) => {
  Object.keys(obj).forEach(k => {
    if (/電話/.test(k) && obj[k] != null && obj[k] !== '') {
      obj[k] = "'" + String(obj[k]);
    }
  });
  return obj;
};