/** =======================
 * Orders Service
 * - create / list / get / update
 * - genId / ensureHeader
 * ======================= */

function Orders_newOrder(payload, actor){
  ensureHeader_('訂單編號');
  var obj = Object.assign({
    '接單日期': Utilities.formatDate(new Date(),'Asia/Taipei','yyyy/MM/dd'),
    '訂單狀態': 'NEW',
    '是否已付款': '未付款',
    '是否已交貨': '未交貨'
  }, payload || {});

  var orderId = genId_();
  obj['訂單編號'] = orderId;

  APPEND(ENV.ORDERS_SHEET, obj);
  return orderId;
}

/** list：取最近 N 筆；若 q 有值做簡易過濾（編號/姓名/電話/品項/貨運單號/平台） */
function Orders_listLatest(limit, q){
  var rows = ROWS(ENV.ORDERS_SHEET);
  // 以資料尾端為新 → 倒序
  rows = rows.reverse();
  if (q) {
    var k = String(q).trim();
    rows = rows.filter(function(r){
      var s = [r['訂單編號'], r['訂購人姓名'], r['訂購人電話'], r['商品項目'], r['貨運單號'], r['接單平台']].join(' ');
      return String(s).indexOf(k) >= 0;
    });
  }
  if (limit && rows.length > limit) rows = rows.slice(0, limit);
  return rows;
}

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
 * - range:     '' | 'this-week' | 'this-month' | 'month'
 * - month:     'YYYY-MM'（當 range==='month' 時才會用到）
 * - year:      例如 2025（目前不強制；你要可再限制）
 * 回傳：{ ok:true, items:[], total:n }
 */
function Orders_list(params){
  params = params || {};
  var limit      = Math.min(Number(params.limit || 20), 200);
  var orderStatus = String(params.orderStatus || '');
  var shipStatus = String(params.shipStatus || '');
  var payStatus  = String(params.payStatus  || '');
  var range      = String(params.range      || '');
  var month      = String(params.month      || '');
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

  // === 區間過濾（依「交貨日期」）===
  if (range === 'this-week' || range === 'this-month' || (range === 'month' && month)) {
    var now = new Date();
    var start, end;

    if (range === 'this-week') {
      start = new Date(now); start.setHours(0,0,0,0);
      start.setDate(start.getDate() - start.getDay()); // 週日為0
      end = new Date(start); end.setDate(end.getDate() + 7);
    } else if (range === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (range === 'month' && month) {
      var ym = String(month).split('-'); // e.g. ['2025','10']
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
  if (rows.length > limit) rows = rows.slice(0, limit);

  return { ok:true, items: rows, total: total };
}

/** —— 工具 —— */
function genId_(){
  var y = Utilities.formatDate(new Date(),'Asia/Taipei','yyyyMM');
  var key = 'SEQ_'+y;
  var p = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock(); lock.tryLock(5000);
  var n = Number(p.getProperty(key)||0) + 1;
  p.setProperty(key, String(n));
  lock.releaseLock();
  return 'O-' + y + '-' + String(n).padStart(5, '0');
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