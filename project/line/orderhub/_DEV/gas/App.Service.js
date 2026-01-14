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

  // 1. 取得所有原始資料 (先不 reverse)
  // let rows = ROWS(ENV.ORDERS_SHEET).reverse();
  let rows = ROWS(ENV.ORDERS_SHEET);

  // 2. 執行過濾 (狀態、篩選條件等...)
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

  // === 【重點修改：根據交貨日期排序】 ===
  rows.sort((a, b) => {
    // 轉化為 Date 物件進行比對
    let dateA = new Date(a['交貨日期']);
    let dateB = new Date(b['交貨日期']);

    // 如果日期無效，則放到最後面
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    // 由舊到新排序 (Ascending)
    if (dateA - dateB !== 0) {
      return dateA - dateB;
    }

    // 如果交貨日期相同，則按訂單編號排序 (讓顯示更穩定)
    return String(a['訂單編號']).localeCompare(String(b['訂單編號']));
  });
  // =====================================

  const total = rows.length;
  const page = Math.max(1, Number(params.page || 1));
  const startIdx = (page - 1) * limit;

  // 格式化輸出日期 // 確保回傳給前端的日期格式統一
  const items = rows.slice(startIdx, startIdx + limit).map(item => {
      if (item['訂單日期'] instanceof Date) item['訂單日期'] = Utilities.formatDate(item['訂單日期'], 'Asia/Taipei', 'yyyy-MM-dd');
      if (item['交貨日期'] instanceof Date) item['交貨日期'] = Utilities.formatDate(item['交貨日期'], 'Asia/Taipei', 'yyyy-MM-dd');
      return item;
  });

  return {
    ok: true,
    items: items,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

// for dashboard
/**
 * Dashboard 數據統計中控函式
 */
function Orders_getSummary() {
  const result = {
    ok: true,
    data: {},
    ts: new Date().getTime()
  };

  try {
    // 定義所有的數據收集任務
    // 未來想加新的數據，只需在此處增加一列
    const tasks = {
      unfinished: getUnfinishedOrdersList_,
      goals: getSalesGoals_,
      monthlyStats: getMonthlyDashboardStats_
    };

    // 執行所有註冊的任務
    Object.keys(tasks).forEach(key => {
      try {
        result.data[key] = tasks[key]();
      } catch (e) {
        console.error(`Task [${key}] failed:`, e.toString());
        result.data[key] = null; // 單一任務失敗不影響整體回傳
      }
    });

    return result;

  } catch (e) {
    return { ok: false, msg: e.toString() };
  }
}

// ==========================================
// 數據收集器區域 (Collectors)
// ==========================================
/**
 * 收集器: 列出訂單未完成數
 */
function getUnfinishedOrdersList_() {
  const sheetName = 'Dashboard_訂單未完成數';
  const sh = SS().getSheetByName(sheetName);
  if (!sh) return [];

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  // 取得所有資料 (日期, 數量)
  const rawData = sh.getRange(2, 1, lastRow - 1, 2).getValues();

  return rawData.map(row => {
    let dateVal = row[0];
    // 確保日期轉為字串 YYYY-MM-DD
    if (dateVal instanceof Date) {
      dateVal = Utilities.formatDate(dateVal, 'Asia/Taipei', 'yyyy-MM-dd');
    }
    return {
      date: dateVal,
      count: Number(row[1] || 0)
    };
  });
}

/**
 * 收集器：僅抓取當年度的月目標與年目標
 */
function getSalesGoals_() {
  const sheetName = 'Dashboard_目標';
  const sh = SS().getSheetByName(sheetName);
  if (!sh) return { monthGoal: 0, yearGoal: 0 };

  const currYear = new Date().getFullYear();
  const data = sh.getDataRange().getValues();

  // 尋找符合今年的那一行 (第0欄是年份)
  const targetRow = data.find(r => r[0] == currYear);

  return {
    monthGoal: targetRow ? Number(targetRow[1] || 0) : 0,
    yearGoal: targetRow ? Number(targetRow[2] || 0) : 0
  };
}


/**
 * 收集器：從 "Dashboard" 抓取特定年份與月份的指標
 */
function getMonthlyDashboardStats_() {
  const sheetName = 'Dashboard';
  const sh = SS().getSheetByName(sheetName);
  if (!sh) return null;

  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // 定義目前的目標：2026 年 1 月 (之後可以改為動態抓取當月)
  const targetYear = 2026;
  const targetMonth = 1;

  // 尋找符合條件的那一列
  const targetRow = rows.find(r => r[0] == targetYear && r[1] == targetMonth);
  if (!targetRow) return null;

  // 輔助函式：根據標題名稱抓取該列對應的值
  const getV = (name) => {
    const idx = headers.indexOf(name);
    return (idx > -1) ? targetRow[idx] : 0;
  };

  // 僅抓取目前需要的欄位，擴充性極佳
  return {
    year: targetYear,
    month: targetMonth,
    totalOrders: getV('月訂單'),
    momDiff: getV('上月相差'),
    revenue: getV('營業收入'),
    unpaid: getV('未收款'),
    aov: getV('平均客單')
  };
}