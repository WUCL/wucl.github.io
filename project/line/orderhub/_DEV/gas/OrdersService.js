/** =======================
 * Orders Service
 * - create / list / get / update
 * - genId / ensureHeader
 * ======================= */

function Orders_newOrder(payload, actor){
  ensureHeader_('訂單編號');
  var obj = Object.assign({
    '訂單日期': Utilities.formatDate(new Date(),'Asia/Taipei','yyyy/MM/dd'),
    '訂單狀態': 'doing'
  }, payload || {});

  var orderId = genId_(obj['訂單日期']);
  obj['訂單編號'] = orderId;

  APPEND(ENV.ORDERS_SHEET, obj);
  return orderId;
}

/**
 * Orders_createWeekly：同一訂單編號，建立 N 筆週花訂單
 * - data: 來源表單資料
 * - repeat: 建立筆數（1–12）
 * - actor / opt.lineName / opt.lineId：記錄 ChangeLog 用
 * 回傳：{ ok:true, orderId:'YYMMDD-XXX', created:N }
 */
function Orders_createWeekly(data, repeat, actor, opt) {
  repeat = Math.max(1, Math.min(12, Number(repeat || 1)));

  // 產生「同一個」訂單編號：依「訂單日期」
  var orderId = genId_(data['訂單日期']);

  // 標準預設（與 Orders_newOrder 保持一致）
  var baseDefaults = {
    '訂單日期': Utilities.formatDate(new Date(),'Asia/Taipei','yyyy/MM/dd'),
    '訂單狀態': 'doing'
  };

  for (var i = 1; i <= repeat; i++) {
    var obj = Object.assign({}, baseDefaults, data || {});
    obj['訂單編號'] = orderId;

    // 商品項目：若是週花，做 1/N 標記；若不是或沒填，保留原值
    if (String(obj['品項分類'] || '') === '週花') {
      var baseName = (obj['商品項目'] && String(obj['商品項目']).trim()) || '週花';
      obj['商品項目'] = baseName + (repeat > 1 ? (i + '/' + repeat) : '');
    }

    // --- [1] 訂單金額：僅第一筆保留，其餘設為 0 ---
    if (i > 1) {
      obj['訂單金額'] = 0;
    }

    // --- [2] 交貨日期：第1筆維持；第2筆起：先對齊最近週五，再逐週 +7 ---
    if (repeat > 1) {
      if (i === 1) {
        // 1) 第1筆：若原始有給交貨日 → 直接用；沒有就「找最近週五」
        var firstDate = obj['交貨日期']
          ? new Date(obj['交貨日期'])
          : getNextFriday_(new Date(obj['訂單日期'] || new Date()));
        obj['交貨日期'] = Utilities.formatDate(firstDate, 'Asia/Taipei', 'yyyy/MM/dd');

        // 2) 後續的基準：一定「對齊最近週五」（不影響第1筆顯示）
        var baseFriday = getNextFriday_(firstDate);
      } else {
        // 3) 第2筆 = 最近週五；第3筆起每筆 +7
        var nextFriday = new Date(baseFriday);
        if (i > 2) nextFriday.setDate(baseFriday.getDate() + 7 * (i - 2));
        obj['交貨日期'] = Utilities.formatDate(nextFriday, 'Asia/Taipei', 'yyyy/MM/dd');
      }
    }

    APPEND(ENV.ORDERS_SHEET, obj);
  }

  // 寫一次 ChangeLog（快照）
  try {
    ChangeLog_append({
      time: new Date(),
      action: 'create_weekly',
      orderId: orderId,
      actor: actor || '',
      lineName: (opt && opt.lineName) || '',
      lineId:   (opt && opt.lineId)   || '',
      snapshot: Object.assign({}, data, { repeat: repeat })
    });
  } catch (_){}

  return { ok:true, orderId: orderId, created: repeat };
}





/** list：取最近 N 筆；若 q 有值做簡易過濾（編號/姓名/電話/品項/貨運單號/平台） */
// function Orders_listLatest(limit, q){
//   var rows = ROWS(ENV.ORDERS_SHEET);
//   // 以資料尾端為新 → 倒序
//   rows = rows.reverse();
//   if (q) {
//     var k = String(q).trim();
//     rows = rows.filter(function(r){
//       var s = [r['訂單編號'], r['訂購人姓名'], r['訂購人電話'], r['商品項目'], r['貨運單號'], r['接單平台']].join(' ');
//       return String(s).indexOf(k) >= 0;
//     });
//   }
//   if (limit && rows.length > limit) rows = rows.slice(0, limit);
//   return rows;
// }

function Orders_getById(orderId){
  var row = findById_(orderId);
  if (row === -1) return null;
  var headers = HDR(ENV.ORDERS_SHEET).headers;
  var vals = SH(ENV.ORDERS_SHEET).getRange(row, 1, 1, headers.length).getValues()[0];
  var obj = {};
  headers.forEach(function(h, i){ obj[h] = vals[i]; });
  return obj;
}

/** update：patch 指定欄位，並寫入 ChangeLog（diff） */
function Orders_updateByPatch(orderId, patch, actor, opt){
  var row = findById_(orderId);
  if (row === -1) return { ok:false, msg:'not-found' };

  var before = Orders_getById(orderId) || {};
  UPDATE(ENV.ORDERS_SHEET, row, patch);
  var after = Orders_getById(orderId) || {};

  // 建 diff
  var diff = {};
  Object.keys(patch).forEach(function(k){
    var o = (before[k] != null ? String(before[k]) : '');
    var n = (after[k]  != null ? String(after[k])  : '');
    if (o !== n) diff[k] = { old:o, new:n };
  });

  // 記錄異動
  ChangeLog_append({
    time: new Date(),
    action: 'update',
    orderId: orderId,
    actor: actor || '',
    lineName: (opt && opt.lineName) || '',
    lineId:   (opt && opt.lineId)   || '',
    diff: diff
  });

  return { ok:true, order: after };
}

/**
 * Orders_list：支援前端 filters
 * 參數：
 * - limit:     最大回傳筆數（預設 20，上限 200）
 * - shipStatus:'已出貨' | '未出貨' | '' (不過濾)
 * - payStatus: '已付款' | '未付款' | '' (不過濾)
 * - range_order:     '' | 'this-week' | 'this-month' | 'month'
 * - range_ship:     '' | 'this-week' | 'this-month' | 'month'
 * - month_order:     'YYYY-MM'（當 range==='month' 時才會用到）
 * - month_ship:     'YYYY-MM'（當 range==='month' 時才會用到）
 * - year:      例如 2025（目前不強制；你要可再限制）
 * 回傳：{ ok:true, items:[], total:n }
 */
function Orders_list(params){
  params = params || {};
  var limit      = Math.min(Number(params.limit || 20), 200);
  var orderStatus = String(params.orderStatus || '');
  var shipStatus = String(params.shipStatus || '');
  var payStatus  = String(params.payStatus  || '');
  var range_order      = String(params.range_order      || '');
  var range_ship      = String(params.range_ship      || '');
  var month_order      = String(params.month_order      || '');
  var month_ship      = String(params.month_ship      || '');
  var year       = Number(params.year || 0); // 你若要只看某年，可再用

  function _norm(s){ return String(s||'').trim(); }

  var rows = ROWS(ENV.ORDERS_SHEET);
  // 以尾端為新 → 倒序，維持你目前清單習慣
  rows = rows.reverse();

  // === 訂單狀態 ===
  if (orderStatus) {
    // var wantedList = String(orderStatus).split(',').map(function(s){ return s.trim(); });
    var wantedOrder = _norm(orderStatus); // 'doing' / 'done' / 'cancel'
    rows = rows.filter(function(r){
      return _norm(r['訂單狀態']).indexOf(wantedOrder) !== -1;
    });
  }

  // === 出貨狀態 ===
  if (shipStatus) {
    var wantedShip = _norm(shipStatus); // '已交貨' / '未交貨'
    rows = rows.filter(function(r){
      return _norm(r['是否已交貨']).indexOf(wantedShip) !== -1;
    });
  }

  // === 付款狀態 ===
  if (payStatus) {
    var wantedPay = _norm(payStatus); // '已付款' / '未付款'
    rows = rows.filter(function(r){
      return _norm(r['是否已付款']).indexOf(wantedPay) !== -1;
    });
  }

  // === order區間過濾（依「交貨日期」）===
  if (range_order === 'this-week' || range_order === 'this-month' || (range_order === 'month' && month_order)) {
    var now = new Date();
    var start, end;

    if (range_order === 'this-week') {
      start = new Date(now); start.setHours(0,0,0,0);
      start.setDate(start.getDate() - start.getDay()); // 週日為0
      end = new Date(start); end.setDate(end.getDate() + 7);
    } else if (range_order === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (range_order === 'month' && month_order) {
      var ym = String(month_order).split('-'); // e.g. ['2025','10']
      var yy = Number(ym[0] || 0);
      var mm = Number(ym[1] || 0) - 1;   // JS 月份 0-based
      start = new Date(yy, mm, 1);
      end   = new Date(yy, mm + 1, 1);
    }

    rows = rows.filter(function(r){
      var d = new Date(r['訂單日期']);
      if (isNaN(d.getTime())) return false;
      if (start && end) {
        return (d >= start && d < end);
      }
      return true;
    });
  }

  // === ship區間過濾（依「交貨日期」）===
  if (range_ship === 'this-week' || range_ship === 'this-month' || (range_ship === 'month' && month_ship)) {
    var now = new Date();
    var start, end;

    if (range_ship === 'this-week') {
      start = new Date(now); start.setHours(0,0,0,0);
      start.setDate(start.getDate() - start.getDay()); // 週日為0
      end = new Date(start); end.setDate(end.getDate() + 7);
    } else if (range_ship === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (range_ship === 'month' && month_ship) {
      var ym = String(month_ship).split('-'); // e.g. ['2025','10']
      var yy = Number(ym[0] || 0);
      var mm = Number(ym[1] || 0) - 1;   // JS 月份 0-based
      start = new Date(yy, mm, 1);
      end   = new Date(yy, mm + 1, 1);
    }

    rows = rows.filter(function(r){
      var d = new Date(r['交貨日期']);
      if (isNaN(d.getTime())) return false;
      if (start && end) {
        return (d >= start && d < end);
      }
      return true;
    });
  }

  //（可選）若要限定年份：
  // if (year) {
  //   rows = rows.filter(function(r){
  //     var d = new Date(r['交貨日期']);
  //     return !isNaN(d.getTime()) && d.getFullYear() === year;
  //   });
  // }

  var total = rows.length;

  // === 新增分頁邏輯 ===
  var pages = Math.ceil(total / limit);
  var page = Math.max(1, Number(params.page || 1));
  var startIdx = (page - 1) * limit;
  var endIdx = startIdx + limit;
  var pagedRows = rows.slice(startIdx, endIdx);

  return { ok: true, items: pagedRows, total: total, page: page, pages: pages };

  // if (rows.length > limit) rows = rows.slice(0, limit);
  // return { ok:true, items: rows, total: total };
}

/** —— 工具 —— */
/**
 * 產生訂單編號：YYMMDD-XXX
 * 例如 2025/10/26 → 251026-001
 */
function genId_(orderDate) {
  var date = orderDate ? new Date(orderDate) : new Date();
  if (isNaN(date.getTime())) date = new Date();

  // 取西元年後兩位 + 月 + 日
  var y = String(date.getFullYear()).slice(-2);
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var d = ('0' + date.getDate()).slice(-2);
  var key = 'SEQ_' + y + m + d; // 每日唯一 key，例如 SEQ_251026

  var p = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  lock.waitLock(5000); // 等候最多 5 秒以避免重複

  var n = Number(p.getProperty(key) || 0) + 1;
  p.setProperty(key, String(n));
  lock.releaseLock();

  var seq = String(n).padStart(3, '0');
  return y + m + d + '-' + seq; // 回傳例如 251026-001
}

function ensureHeader_(name){
  var sh = SH(ENV.ORDERS_SHEET);
  var headers = HDR(ENV.ORDERS_SHEET).headers;
  if (headers.indexOf(name) === -1){
    sh.insertColumnAfter(headers.length || 1);
    sh.getRange(1, headers.length+1).setValue(name);
  }
}

function findById_(orderId){
  try { return FINDROW(ENV.ORDERS_SHEET, '訂單編號', orderId); }
  catch(e){ throw new Error('請先在 Orders 表第1列建立「訂單編號」欄位'); }
}

/**
 * 取得「指定日期之後」最近的週五（含當週）
 * 例：週一傳入 → 當週五；週六傳入 → 下週五。
 */
function getNextFriday_(d) {
  var date = new Date(d);
  var day = date.getDay(); // 0=日, 5=五, 6=六
  var diff = (5 - day + 7) % 7; // 距離週五的天數
  if (diff === 0 && day !== 5) diff = 7; // 若已過週五，跳到下週
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}