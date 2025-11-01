// ==========================================
// OrdersService.js - 訂單業務邏輯
// ==========================================

function Orders_newOrder(payload, actor) {
  ensureHeader_('訂單編號');

  var obj = Object.assign({
    '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd'),
    '訂單狀態': 'doing'
  }, payload || {});

  var orderId = genId_(obj['訂單日期']);
  obj['訂單編號'] = orderId;

  if (obj['訂購人電話']) obj['訂購人電話'] = "'" + String(obj['訂購人電話']);
  if (obj['收件者電話']) obj['收件者電話'] = "'" + String(obj['收件者電話']);

  APPEND(ENV.ORDERS_SHEET, obj);
  return orderId;
}

/**
 * 建立週花訂單：同一訂單編號，建立 N 筆
 * @param {Object} data - 來源表單資料
 * @param {number} repeat - 建立筆數（1-12）
 * @param {string} actor - 操作者
 * @param {Object} opt - 額外選項 { lineName, lineId }
 * @returns {Object} { ok:true, orderId, created }
 */
function Orders_createWeekly(data, repeat, actor, opt) {
  repeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(repeat || 1)));
  opt = opt || {};

  var orderId = genId_(data['訂單日期']);

  var baseDefaults = {
    '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd'),
    '訂單狀態': 'doing'
  };

  // 計算第一筆的基準週五
  var firstDate = data['交貨日期']
    ? new Date(data['交貨日期'])
    : getNextFriday_(new Date(data['訂單日期'] || new Date()));

  var baseFriday = getNextFriday_(firstDate);

  for (var i = 1; i <= repeat; i++) {
    var obj = Object.assign({}, baseDefaults, data || {});

    // === 生成唯一編號 ===
    var suffix = String(i).padStart(2, '0');
    var subId = orderId.replace(/-00$/, '-' + suffix);
    obj['訂單編號'] = subId;

    // === 商品項目 ===
    if (String(obj['品項分類'] || '') === '週花') {
      var baseName = (obj['商品項目'] && String(obj['商品項目']).trim()) || '週花';
      obj['商品項目'] = baseName + (repeat > 1 ? (' ' + i + '/' + repeat) : '');
    }

    // === 訂單金額：只有第1筆有金額 ===
    if (i > 1) {
      obj['訂單金額'] = 0;
    }

    // === 交貨日期 === 第1筆維持原值或最近週五，後續逐週 +7
    if (i === 1) {
      obj['交貨日期'] = Utilities.formatDate(firstDate, 'Asia/Taipei', 'yyyy/MM/dd');
    } else {
      var nextFriday = new Date(baseFriday);
      nextFriday.setDate(baseFriday.getDate() + 7 * (i - 1));
      obj['交貨日期'] = Utilities.formatDate(nextFriday, 'Asia/Taipei', 'yyyy/MM/dd');
    }

    APPEND(ENV.ORDERS_SHEET, obj);
  }

  // 寫 ChangeLog
  try {
    ChangeLog_append({
      time: new Date(),
      action: 'create_weekly',
      orderId: orderId,
      actor: actor || '',
      lineName: opt.lineName || '',
      lineId: opt.lineId || '',
      snapshot: Object.assign({}, data, { repeat: repeat })
    });
  } catch (_) {}

  return { ok: true, orderId: orderId, created: repeat };
}

function Orders_getById(orderId) {
  var row = findById_(orderId);
  if (row === -1) return null;

  var headers = HDR(ENV.ORDERS_SHEET).headers;
  var vals = SH(ENV.ORDERS_SHEET).getRange(row, 1, 1, headers.length).getValues()[0];

  var obj = {};
  headers.forEach(function(h, i) {
    obj[h] = vals[i];
  });

  return obj;
}

/**
 * 更新訂單並記錄差異
 */
function Orders_updateByPatch(orderId, patch, actor, opt) {
  var row = findById_(orderId);
  if (row === -1) return { ok: false, msg: 'not-found' };

  opt = opt || {};
  var before = Orders_getById(orderId) || {};
  UPDATE(ENV.ORDERS_SHEET, row, patch);
  var after = Orders_getById(orderId) || {};

  // 建立差異紀錄
  var diff = {};
  Object.keys(patch).forEach(function(k) {
    var o = (before[k] != null ? String(before[k]) : '');
    var n = (after[k] != null ? String(after[k]) : '');
    if (o !== n) {
      diff[k] = { old: o, new: n };
    }
  });

  // 記錄異動
  if (Object.keys(diff).length > 0) {
    ChangeLog_append({
      time: new Date(),
      action: 'update',
      orderId: orderId,
      actor: actor || '',
      lineName: opt.lineName || '',
      lineId: opt.lineId || '',
      diff: diff
    });
  }

  return { ok: true, order: after };
}

/**
 * 訂單列表查詢（支援篩選與分頁）
 */
function Orders_list(params) {
  params = params || {};
  
  var limit = Math.min(Number(params.limit || LIMITS.DEFAULT_LIST_ITEMS), LIMITS.MAX_LIST_ITEMS);
  var orderStatus = String(params.orderStatus || '');
  var shipStatus = String(params.shipStatus || '');
  var payStatus = String(params.payStatus || '');
  var range_order = String(params.range_order || '');
  var range_ship = String(params.range_ship || '');
  var month_order = String(params.month_order || '');
  var month_ship = String(params.month_ship || '');

  function _norm(s) {
    return String(s || '').trim();
  }

  var rows = ROWS(ENV.ORDERS_SHEET);
  rows = rows.reverse(); // 最新在前

  // 訂單狀態篩選
  if (orderStatus) {
    var wantedOrder = _norm(orderStatus);
    rows = rows.filter(function(r) {
      return _norm(r['訂單狀態']).indexOf(wantedOrder) !== -1;
    });
  }

  // 出貨狀態篩選
  if (shipStatus) {
    var wantedShip = _norm(shipStatus);
    rows = rows.filter(function(r) {
      return _norm(r['是否已交貨']).indexOf(wantedShip) !== -1;
    });
  }

  // 付款狀態篩選
  if (payStatus) {
    var wantedPay = _norm(payStatus);
    rows = rows.filter(function(r) {
      return _norm(r['是否已付款']).indexOf(wantedPay) !== -1;
    });
  }

  // 日期區間篩選（使用優化後的函數）
  rows = filterByDateRange_(rows, '訂單日期', range_order, month_order);
  rows = filterByDateRange_(rows, '交貨日期', range_ship, month_ship);

  var total = rows.length;

  // 分頁處理
  var pages = Math.ceil(total / limit);
  var page = Math.max(1, Number(params.page || 1));
  var startIdx = (page - 1) * limit;
  var endIdx = startIdx + limit;
  var pagedRows = rows.slice(startIdx, endIdx);

  return {
    ok: true,
    items: pagedRows,
    total: total,
    page: page,
    pages: pages
  };
}