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
