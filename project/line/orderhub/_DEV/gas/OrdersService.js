// ==========================================
// OrdersService.js - 訂單業務邏輯
// ==========================================

const sanitizePhone = (obj) => {
  Object.keys(obj).forEach(k => {
    if (/電話/.test(k) && obj[k]) obj[k] = "'" + String(obj[k]);
  });
  return obj;
};

function Orders_newOrder(payload, actor) {
  ensureHeader_('訂單編號');

  const obj = {
    '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd'),
    '訂單狀態': 'doing',
    ...payload
  };

  const orderId = genId_(obj['訂單日期']);
  obj['訂單編號'] = orderId;

  sanitizePhone(obj);
  APPEND(ENV.ORDERS_SHEET, obj);
  return orderId;
}

function Orders_createWeekly(data, repeat, actor, opt = {}) {
  // 修正 repeat 範圍
  const safeRepeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(repeat || 1)));
  const orderId = genId_(data['訂單日期']);

  const firstDate = data['交貨日期']
    ? new Date(data['交貨日期'])
    : getNextFriday_(new Date(data['訂單日期'] || new Date()));

  const baseFriday = getNextFriday_(firstDate);
  let firstOrderObj = null; // 用於紀錄第一筆資料給 Log 使用

  for (let i = 1; i <= safeRepeat; i++) {
    const obj = {
      '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd'),
      '訂單狀態': 'doing',
      ...data
    };

    // ID 處理
    const suffix = String(i).padStart(2, '0');
    obj['訂單編號'] = orderId.replace(/-00$/, '-' + suffix);

    // 商品名稱處理
    if (String(obj['品項分類'] || '') === '週花') {
      const baseName = (obj['商品項目'] && String(obj['商品項目']).trim()) || '週花';
      obj['商品項目'] = baseName + (safeRepeat > 1 ? ` ${i}/${safeRepeat}` : '');
    }

    // 金額處理：僅第一筆有金額
    if (i > 1) obj['訂單金額'] = 0;

    // 日期處理
    if (i === 1) {
      obj['交貨日期'] = Utilities.formatDate(firstDate, 'Asia/Taipei', 'yyyy/MM/dd');
    } else {
      const nextFriday = new Date(baseFriday);
      nextFriday.setDate(baseFriday.getDate() + 7 * (i - 1));
      obj['交貨日期'] = Utilities.formatDate(nextFriday, 'Asia/Taipei', 'yyyy/MM/dd');
    }

    sanitizePhone(obj);
    APPEND(ENV.ORDERS_SHEET, obj);

    if (i === 1) firstOrderObj = obj;
  }

  // Log & Notify
  try {
    ChangeLog_append({
      time: new Date(),
      action: 'create_weekly',
      orderId,
      actor: actor || '',
      lineName: opt.lineName || '',
      lineId: opt.lineId || '',
      snapshot: { ...data, repeat: safeRepeat }
    });

    // 建立通知訊息 (使用第一筆資料為範本，但標註總數)
    const infoList = Object.keys(firstOrderObj || {}).map(k => `${k}：${firstOrderObj[k] || '-'}`);
    const msg = `🆕 新增訂單 (週花 x${safeRepeat})\n${orderId}\n-\n${infoList.join('\n')}`;

    sendLinePush_(opt.lineId, msg);
  } catch (e) {
    console.error('Create Weekly Log Error', e);
  }

  return { ok: true, orderId, created: safeRepeat };
}

function Orders_getById(orderId) {
  const row = findById_(orderId);
  if (row === -1) return null;

  const { headers } = HDR(ENV.ORDERS_SHEET);
  const vals = SH(ENV.ORDERS_SHEET).getRange(row, 1, 1, headers.length).getValues()[0];

  const obj = {};
  headers.forEach((h, i) => obj[h] = vals[i]);
  return obj;
}

function Orders_updateByPatch(orderId, patch, actor, opt = {}) {
  const row = findById_(orderId);
  if (row === -1) return { ok: false, msg: 'not-found' };

  sanitizePhone(patch);

  const before = Orders_getById(orderId) || {};
  UPDATE(ENV.ORDERS_SHEET, row, patch);
  const after = Orders_getById(orderId) || {};

  // 比對差異
  const diff = {};
  Object.keys(patch).forEach(k => {
    const o = (before[k] != null ? String(before[k]) : '');
    const n = (after[k] != null ? String(after[k]) : '');
    if (o !== n) diff[k] = { old: o, new: n };
  });

  if (Object.keys(diff).length > 0) {
    ChangeLog_append({
      time: new Date(),
      action: 'update',
      orderId,
      actor: actor || '',
      lineName: opt.lineName || '',
      lineId: opt.lineId || '',
      diff
    });

    const diffText = Object.keys(diff)
      .map(k => `${k}：${diff[k].old || '-'} → ${diff[k].new || '-'}`)
      .join('\n');

    const msg = `✏️ 修改訂單\n${orderId}\n-\n${diffText}`;

    // Debug Log
    console.log("Push Update:", { to: opt.lineId, msg });

    sendLinePush_(opt.lineId, msg);
  }

  return { ok: true, order: after };
}

function Orders_list(params = {}) {
  const limit = Math.min(Number(params.limit || LIMITS.DEFAULT_LIST_ITEMS), LIMITS.MAX_LIST_ITEMS);
  const _norm = (s) => String(s || '').trim();

  let rows = ROWS(ENV.ORDERS_SHEET).reverse(); // 最新在前

  // 篩選條件 Map
  const filters = [
    { key: '訂單狀態', val: _norm(params.orderStatus) },
    { key: '是否已交貨', val: _norm(params.shipStatus) },
    { key: '是否已付款', val: _norm(params.payStatus) }
  ];

  filters.forEach(f => {
    if (f.val) rows = rows.filter(r => _norm(r[f.key]).includes(f.val));
  });

  // 日期篩選
  rows = filterByDateRange_(rows, '訂單日期', params.range_order, params.month_order);
  rows = filterByDateRange_(rows, '交貨日期', params.range_ship, params.month_ship);

  const total = rows.length;
  const page = Math.max(1, Number(params.page || 1));
  const startIdx = (page - 1) * limit;

  return {
    ok: true,
    items: rows.slice(startIdx, startIdx + limit),
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}