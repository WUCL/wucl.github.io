// ==========================================
// App.Service.gs - 訂單業務邏輯 (Service Layer)
// 職責：處理資料邏輯、寫入資料庫、發送通知
// ==========================================

/**
 * 建立單筆訂單
 */
function Orders_newOrder(payload, actor, opt = {}) {
  ensureHeader_('訂單編號');
  const updater = opt.lineName || actor || '';

  const obj = {
    '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd'),
    '訂單狀態': 'doing',
    '更新者': updater,
    ...payload
  };

  const orderId = genId_(obj['訂單日期']);
  obj['訂單編號'] = orderId;

  sanitizePhone_(obj);
  APPEND(ENV.ORDERS_SHEET, obj);

  // 【新增：連動日曆】
  createCalendarEvent_(obj);

  // 記錄 Log
  ChangeLog_append({
    time: new Date(),
    action: 'create',
    orderId, actor,
    lineName: opt.lineName,
    lineId: opt.lineId,
    snapshot: payload
  });

  // === ✨ 發送通知 (邏輯從 Code.js 搬移至此，統一管理) ===
  // const infoList = [];
  // const breakKeywords = ['訂購人', '取貨方式'];

  // Object.entries(payload).forEach(([k, v]) => {
  //   if (breakKeywords.some(kw => k.startsWith(kw))) infoList.push('=-=-=-=');
  //   infoList.push(`${k}：${v || '-'}`);
  // });

  // const msg = `🆕 新增訂單\n${orderId}\n-\n${updater} 編輯\n-\n${infoList.join('\n')}`;
  // sendLinePush_(opt.lineId, msg);


  // === ✨ 通知的排版優化 ===
  // 使用專門的排版函式，確保順序與分隔線正確
  const infoText = formatNewOrderMsg_(obj);
  const msg = `🆕 新增訂單\n${orderId}\n-\n${updater} 編輯\n-\n${infoText}`;

  const notifyTarget = opt.targetId || opt.lineId; // 有群組發群組，沒群組發個人
  if (notifyTarget) {
    sendLinePush_(notifyTarget, msg);
  }
  // sendLinePush_(opt.lineId, msg);

  return orderId;
}

/**
 * 建立週花訂單
 */
function Orders_createWeekly(data, repeat, actor, opt = {}) {
  const safeRepeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(repeat || 1)));
  const orderId = genId_(data['訂單日期']);
  const updater = opt.lineName || actor || '';

  const firstDate = data['交貨日期']
    ? new Date(data['交貨日期'])
    : getNextFriday_(new Date(data['訂單日期'] || new Date()));

  const baseFriday = getNextFriday_(firstDate);
  let firstOrderObj = null;

  for (let i = 1; i <= safeRepeat; i++) {
    const obj = {
      '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd'),
      '訂單狀態': 'doing',
      '更新者': updater,
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

    // 金額與日期處理
    if (i > 1) obj['訂單金額'] = 0;

    if (i === 1) {
      obj['交貨日期'] = Utilities.formatDate(firstDate, 'Asia/Taipei', 'yyyy-MM-dd');
    } else {
      const nextFriday = new Date(baseFriday);
      nextFriday.setDate(baseFriday.getDate() + 7 * (i - 1));
      obj['交貨日期'] = Utilities.formatDate(nextFriday, 'Asia/Taipei', 'yyyy-MM-dd');
    }

    sanitizePhone_(obj);
    APPEND(ENV.ORDERS_SHEET, obj);

    if (i === 1) firstOrderObj = obj;
  }

  // 假設已執行完迴圈並寫入 DB，且 firstOrderObj 已被賦值
  // 這裡需要重新取得 firstOrderObj 或是利用 data 組合出第一筆的樣子來做通知
  // 為求精確，我們可以用 data + orderId + updater 組合一個臨時物件給通知用
  const notifyObj = {
    ...data,
    '訂單編號': orderId,
    '更新者': updater,
    '訂單日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd')
  };

  // Log & Notify
  try {
    ChangeLog_append({
      time: new Date(),
      action: 'create_weekly',
      orderId, actor,
      lineName: opt.lineName,
      lineId: opt.lineId,
      snapshot: { ...data, repeat: safeRepeat }
    });

    // 通知排版 (與單筆一致)
    // const infoList = [];
    // const breakKeywords = ['訂購人', '取貨方式'];

    // Object.keys(firstOrderObj || {}).forEach(k => {
    //   if (k === '訂單編號' || k === '更新者') return;
    //   if (breakKeywords.some(kw => k.startsWith(kw))) infoList.push('─');
    //   infoList.push(`${k}：${firstOrderObj[k] || '-'}`);
    // });

    // const msg = `🆕 新增訂單 (週花 x${safeRepeat})\n${orderId}\n-\n${updater} 編輯\n-\n${infoList.join('\n')}`;
    // sendLinePush_(opt.lineId, msg);

  } catch (e) {
    console.error('Create Weekly Log Error', e);
  }

  // === ✨ 通知的排版優化 ===
  const infoText = formatNewOrderMsg_(notifyObj);
  const msg = `🆕 新增訂單 (週花 x${safeRepeat})\n${orderId}\n-\n${updater} 編輯\n-\n${infoText}`;

  const notifyTarget = opt.targetId || opt.lineId; // 有群組發群組，沒群組發個人
  if (notifyTarget) {
    sendLinePush_(notifyTarget, msg);
  }
  // sendLinePush_(opt.lineId, msg);

  return { ok: true, orderId, created: safeRepeat };
}

/**
 * 取得訂單
 */
function Orders_getById(orderId) {
  const row = findById_(orderId);
  if (row === -1) return null;
  const { headers } = HDR(ENV.ORDERS_SHEET);
  const vals = SH(ENV.ORDERS_SHEET).getRange(row, 1, 1, headers.length).getValues()[0];
  const obj = {};
  headers.forEach((h, i) => {
    let v = vals[i];
    // 如果從 Sheet 讀出來的是 Date 物件，轉成字串傳給前端，避免 JSON 格式問題
    if (v instanceof Date) {
        v = Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd');
    }
    obj[h] = v;
  });
  return obj;
}

/**
 * 更新訂單
 */
function Orders_updateByPatch(orderId, patch, actor, opt = {}) {
  const row = findById_(orderId);
  if (row === -1) return { ok: false, msg: 'not-found' };

  const updater = opt.lineName || actor || '';
  if (updater) patch['更新者'] = updater;

  sanitizePhone_(patch);

  const before = Orders_getById(orderId) || {};
  UPDATE(ENV.ORDERS_SHEET, row, patch);
  const after = Orders_getById(orderId) || {};

  // Diff Log
  const diff = {};
  Object.keys(patch).forEach(k => {
    if (k === '更新者') return;
    const o = (before[k] != null ? String(before[k]) : '');
    const n = (after[k] != null ? String(after[k]) : '');
    if (o !== n) diff[k] = { old: o, new: n };
  });

  if (Object.keys(diff).length > 0) {
    ChangeLog_append({
      time: new Date(),
      action: 'update',
      orderId, actor,
      lineName: opt.lineName,
      lineId: opt.lineId,
      diff
    });

    // const diffText = Object.keys(diff)
    //   .map(k => `${k}：${diff[k].old || '-'} > ${diff[k].new || '-'}`)
    //   .join('\n');

    // const msg = `✏️ 修改訂單\n${orderId}\n-\n${updater} 編輯\n-\n${diffText}`;
    // console.log("Push Update:", { to: opt.lineId, msg });
    // sendLinePush_(opt.lineId, msg);

    // === Update 這裡維持原本的 diff 顯示，或是您想特別分組也可以 ===
    // 目前建議維持簡單列出差異即可，因為修改通常只改少數欄位
    const diffText = Object.keys(diff)
      .map(k => `${k}：${diff[k].old || '-'} ➝ ${diff[k].new || '-'}`)
      .join('\n');

    const msg = `✏️ 修改訂單\n${orderId}\n-\n${updater} 編輯\n-\n${diffText}`;

    const notifyTarget = opt.targetId || opt.lineId; // 有群組發群組，沒群組發個人
    if (notifyTarget) {
      sendLinePush_(notifyTarget, msg);
    }
    // sendLinePush_(opt.lineId, msg);
  }

  return { ok: true, order: after };
}

/**
 * 訂單列表
 */
function Orders_list(params = {}) {
  const limit = Math.min(Number(params.limit || LIMITS.DEFAULT_LIST_ITEMS), LIMITS.MAX_LIST_ITEMS);
  const _norm = (s) => String(s || '').trim();

  let rows = ROWS(ENV.ORDERS_SHEET).reverse();

  const filters = [
    { key: '訂單狀態', val: _norm(params.orderStatus) },
    { key: '是否已交貨', val: _norm(params.shipStatus) },
    { key: '是否已付款', val: _norm(params.payStatus) }
  ];

  filters.forEach(f => {
    if (f.val) rows = rows.filter(r => _norm(r[f.key]).includes(f.val));
  });

  rows = filterByDateRange_(rows, '訂單日期', params.range_order, params.month_order);
  rows = filterByDateRange_(rows, '交貨日期', params.range_ship, params.month_ship);

  const total = rows.length;
  const page = Math.max(1, Number(params.page || 1));
  const startIdx = (page - 1) * limit;

  // 格式化輸出日期
  const items = rows.slice(startIdx, startIdx + limit).map(item => {
      // 確保回傳給前端的日期格式統一
      if (item['訂單日期'] instanceof Date) item['訂單日期'] = Utilities.formatDate(item['訂單日期'], 'Asia/Taipei', 'yyyy-MM-dd');
      if (item['交貨日期'] instanceof Date) item['交貨日期'] = Utilities.formatDate(item['交貨日期'], 'Asia/Taipei', 'yyyy-MM-dd');
      return item;
  });

  return {
    ok: true,
    items: rows.slice(startIdx, startIdx + limit),
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}