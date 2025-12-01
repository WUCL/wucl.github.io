// ==========================================
// Code.js - Entry & API Router
// ==========================================

const _json = (obj) => {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
};

function doGet(e) {
  const isApi = e?.parameter?.api === '1';
  if (isApi) return _json({ ok: true, pong: true, ts: new Date() });
  return ContentService.createTextOutput('OK');
}

function doPost(e) {
  // log("doPost Raw", e); // 視需求開啟

  let req = {};
  try {
    req = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return _json({ ok: false, msg: 'bad-json' });
  }

  // 探測模式
  if (e?.parameter?.probe === '1') {
    return handleProbeRequest_(e);
  }

  // LIFF 前端 API
  if (e?.parameter?.api === '1') {
    return handleApiRequest_(req);
  }

  // LINE Webhook
  return handleLineWebhook_(req);
}

function handleProbeRequest_(e) {
  return _json({
    ok: true,
    probe: true,
    contentType: e.postData?.type,
    rawSnippet: (e.postData?.contents || '').slice(0, 200)
  });
}

function handleApiRequest_(req) {
  const action = String(req.action || '').trim();
  const actor = req.actor || 'WEB';
  const lineName = req.lineName || '';
  const lineId = req.lineId || ''; // ⚠️ 確保前端有傳這個，編輯通知才會響

  // 路由分發
  switch (action) {
    case 'create':
      return handleCreateOrder_(req, actor, lineName, lineId);
    case 'create_weekly':
      return handleCreateWeekly_(req, actor, lineName, lineId);
    case 'list':
      return handleListOrders_(req);
    case 'get':
      return handleGetOrder_(req);
    case 'update':
      return handleUpdateOrder_(req, actor, lineName, lineId);
    default:
      return _json({ ok: false, msg: 'unknown-action' });
  }
}

// --- Handlers ---

function handleCreateOrder_(req, actor, lineName, lineId) {
  const orderId = Orders_newOrder(req.data || {}, actor);

  ChangeLog_append({
    time: new Date(),
    action: 'create',
    orderId, actor, lineName, lineId,
    snapshot: req.data || {}
  });

  // 建構通知訊息
  const infoList = [];
  const breakKeywords = ['訂購人', '取貨方式'];

  Object.entries(req.data || {}).forEach(([k, v]) => {
    if (breakKeywords.some(kw => k.startsWith(kw))) infoList.push('─');
    infoList.push(`${k}：${v || '-'}`);
  });

  const msg = `🆕 新增訂單\n${orderId}\n─\n${infoList.join('\n')}`;
  sendLinePush_(lineId, msg);

  return _json({ ok: true, orderId });
}

function handleCreateWeekly_(req, actor, lineName, lineId) {
  const repeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(req.repeat || 1)));
  const result = Orders_createWeekly(req.data || {}, repeat, actor, { lineName, lineId });
  return _json(result);
}

function handleListOrders_(req) {
  const params = {
    orderStatus: String(req.orderStatus || ''),
    shipStatus: String(req.shipStatus || ''),
    payStatus: String(req.payStatus || ''),
    range_order: String(req.range_order || ''),
    range_ship: String(req.range_ship || ''),
    month_order: String(req.month_order || ''),
    month_ship: String(req.month_ship || ''),
    year: Number(req.year || 0) || null,
    limit: Math.min(Number(req.limit || LIMITS.DEFAULT_LIST_ITEMS), LIMITS.MAX_LIST_ITEMS),
    page: Math.max(1, Number(req.page || 1))
  };
  return _json(Orders_list(params));
}

function handleGetOrder_(req) {
  const id = String(req.id || '').trim();
  if (!id) return _json({ ok: false, msg: 'missing-id' });

  const item = Orders_getById(id);
  return item ? _json({ ok: true, item }) : _json({ ok: false, msg: 'not-found' });
}

function handleUpdateOrder_(req, actor, lineName, lineId) {
  const id = String(req.id || '').trim();
  if (!id) return _json({ ok: false, msg: 'missing-id' });

  const result = Orders_updateByPatch(id, req.patch || {}, actor, { lineName, lineId });
  return _json(result);
}

function handleLineWebhook_(body) {
  const ev = body.events?.[0];
  if (!ev || !ev.replyToken) return ContentService.createTextOutput('OK');

  replyMessage(ev.replyToken, [{
    type: 'text',
    text: '您好! 請從 LIFF 頁面操作清單/新增/編輯。'
  }]);

  return ContentService.createTextOutput('OK');
}

// --- Utils ---

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

function log(title, obj) {
  console.log(`=== ${title} ===`, JSON.stringify(obj, null, 2));
}