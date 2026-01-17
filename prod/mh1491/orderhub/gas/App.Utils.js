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
  if (!range || (range !== 'last-7-days' && range !== 'last-30-days' && range !== 'month')) return rows;
  if (range === 'month' && !customMonth) return rows;

  var now = new Date();
  var currentYear = now.getFullYear();

  // 取得今天的凌晨 00:00:00 (本地時間)，作為起始點
  var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  var start, end;

  if (range === 'month') {
    // 【指定月】邏輯保持不變：該月 1 號 00:00 ~ 下個月 1 號 00:00
    var ym = String(customMonth).split('-');
    var yy = Number(ym[0]), mm = Number(ym[1]) - 1;
    start = new Date(yy, mm, 1);
    end = new Date(yy, mm + 1, 1);
  } else {
    // 【未來天數】邏輯：從今天凌晨開始往後算
    var dayCount = (range === 'last-7-days') ? 7 : 30;

    // 開始 1/1
    start = new Date(currentYear, 0, 1);

    // 結束時間：今天 + N 天後的凌晨 00:00
    // 例如：14 號看「近 7 天」，範圍會是 14 號凌晨 ~ 21 號凌晨 (包含 14, 15, 16, 17, 18, 19, 20 整天)
    end = new Date(todayMidnight.getTime() + dayCount * 24 * 60 * 60 * 1000);
  }

  return rows.filter(function(r) {
    var val = r[dateField];
    if (!val) return false;

    // 將資料中的日期轉換成 Date 物件
    var d = (val instanceof Date) ? val : new Date(val);
    if (isNaN(d.getTime())) return false;

    // 將比對資料的時間也歸零，確保只比對日期
    var targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    // 判斷是否在區間內： start <= targetDate < end
    return targetDate >= start && targetDate < end;
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
    // if (/電話/.test(k) && obj[k] != null && obj[k] !== '') {
    //   obj[k] = "'" + String(obj[k]);
    // }
    if (/電話/.test(k) && obj[k] != null && obj[k] !== '') {
      let val = String(obj[k]).trim();
      val = val.replace(/^'/, '');
      obj[k] = "'" + val;
    }
  });
  return obj;
};

// ==========================================
// 專用排版函式 (放在檔案最下方或 Utils 裡)
// ==========================================
function formatNewOrderMsg_(data) {
  // 定義顯示群組與順序
  const groups = [
    // Group 1: 訂單核心資訊
    ['客戶類型', '接單平台', '訂單日期', '交貨日期'],

    ['是否已付款', '是否已交貨', '訂單金額', '商品金額', '運費金額', '付款方式', '匯款後五碼'],

    // Group 2: 訂購人 (開頭加分隔線)
    ['訂購人姓名', '訂購人電話', '訂購人Email'],

    // Group 3: 商品內容
    ['品項分類', '週花週期', '購買用途', '商品項目'],

    // Group 4: 收件/取貨 (開頭加分隔線)
    ['取貨方式', '貨運單號', '收件者姓名', '收件者電話', '收件者地址'],

    // Group 5: 備註
    ['訂單備註', '小卡內容']
  ];

  const lines = [];

  groups.forEach((fields, groupIndex) => {
    // 1. 判斷是否需要分隔線
    // 邏輯：如果是「訂購人」或「取貨方式」群組，且不是第一組，就加分隔線
    const isSpecialGroup = fields.includes('訂購人姓名') || fields.includes('取貨方式') || fields.includes('訂單備註');

    if (groupIndex > 0 && isSpecialGroup) {
       lines.push('━');
    }

    // 2. 遍歷該群組所有欄位
    fields.forEach(k => {
      let v = data[k];

      // [修正] 判斷是否為空值 (null, undefined, 或空字串)
      // 如果是空值，就顯示 '-'，否則顯示原值
      if (v == null || String(v).trim() === '') {
        v = '-';
      }

      // [修正] 不論是否有值，都強制加入列表
      lines.push(`${k}：${v}`);
    });
  });

  return lines.join('\n');
}

/**
 * 在 Google 日曆建立全天事件
 * @param {Object} obj 訂單資料物件
 */
function createCalendarEvent_(obj) {
  try {
    // 0. 取得日曆 ID (若沒設定則使用主日曆)
    const props = PropertiesService.getScriptProperties();
    const calendarId = props.getProperty('CALENDAR_ID') || 'primary';
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) return console.error('找不到指定的日曆：' + calendarId);

    // --- 1. 處理支付資訊邏輯 ---
    let payStatus = obj['是否已付款'];
    if (payStatus === '已付款') {
      const payMethod = obj['付款方式'] || '';
      const last5 = obj['匯款後五碼'] || '';

      if (payMethod === '匯款' && last5) {
        payStatus = `已付款（匯款，${last5}）`;
      } else if (payMethod) {
        payStatus = `已付款（${payMethod}）`;
      } else {
        payStatus = `已付款`;
      }
    }

    // --- 2. 處理訂購人 ID 邏輯 ---
    // 註：這裡假設你的資料物件中有 'lineId' 或是您想顯示的 ID 欄位
    const bName = obj['訂購人姓名'] || '-';
    const bPhone = obj['訂購人電話'] || '-';
    const bId = obj['訂購人ID'] || '';
    const buyerInfo = bId ? `${bName}（${bId}）(${bPhone})` : `${bName}(${bPhone})`;

    // --- 3. 準備事件內容 ---
    const title = `[訂單][${obj['取貨方式']}] ${bName} - ${obj['商品項目']}`;
    const deliveryDate = new Date(obj['交貨日期']);

    if (isNaN(deliveryDate.getTime())) return console.warn('日期無效');

    const description = [
      `訂單編號：${obj['訂單編號']}`,
      `訂單日期：${obj['訂單日期'] || '-'}`,
      `交貨日期：${obj['交貨日期'] || '-'}`,
      `-`,
      `客戶類型：${obj['客戶類型']}（${obj['接單平台']}）`,
      `訂購人：${buyerInfo}`,
      `商品：${obj['商品項目'] || '-'}`,
      `支付：${payStatus}`,
      `金額：${obj['訂單金額']}（${obj['商品金額']} + 運 ${obj['運費金額'] || '0'}）`,
      `-`,
      `取貨方式：${obj['取貨方式']}`,
      `收件人：${obj['收件者姓名']}（${obj['收件者電話'] || '-'}）`,
      `收件地址：${obj['收件者地址']}`,
      `-`,
      `備註：${obj['訂單備註'] || '-'}`,
      `小卡：${obj['小卡內容'] || '-'}`
    ].join('\n');

    // --- 4. 建立事件 ---
    const event = calendar.createAllDayEvent(title, deliveryDate, {
      description: description
    });

    // 針對特定的品項分類上色（例如週花用橘色，其他用綠色）
    if (String(obj['品項分類']) === '週花') {
      event.setColor(CalendarApp.EventColor.ORANGE);
    } else {
      event.setColor(CalendarApp.EventColor.PALE_GREEN);
    }

    console.log('日曆事件建立成功，ID:', event.getId());
  } catch (e) {
    console.error('日曆錯誤:', e.toString());
  }
}

function triggerAuth() {
  // 隨便呼叫一個日曆功能，強迫觸發授權
  CalendarApp.getDefaultCalendar().getName();
  Logger.log('授權成功！');
}