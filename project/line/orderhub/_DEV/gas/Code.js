// ==========================================
// Code.js - Entry & API Router
// ==========================================

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var isApi = e && e.parameter && e.parameter.api == '1';
  if (isApi) return _json({ ok: true, pong: true, ts: new Date() });
  return ContentService.createTextOutput('OK');
}

function doPost(e) {
  try {
    // 探測模式：POST .../exec?api=1&probe=1
    if (e && e.parameter && e.parameter.api == '1' && e.parameter.probe == '1') {
      return handleProbeRequest_(e);
    }

    // LIFF 前端 API
    if (e && e.parameter && e.parameter.api == '1') {
      return handleApiRequest_(e);
    }

    // LINE Webhook (保留最小可運作)
    return handleLineWebhook_(e);
  } catch (err) {
    Logger.log('ERROR doPost: ' + err + '\n' + (err && err.stack));
    return ContentService.createTextOutput('OK');
  }
}

function handleProbeRequest_(e) {
  var ct = e.postData ? e.postData.type : null;
  var raw = e.postData ? e.postData.contents : null;
  return _json({ 
    ok: true, 
    probe: true, 
    contentType: ct, 
    rawSnippet: (raw || '').slice(0, 200) 
  });
}

function handleApiRequest_(e) {
  var raw = (e.postData && e.postData.contents) || '{}';
  var req = {};
  
  try { 
    req = JSON.parse(raw); 
  } catch (_) { 
    return _json({ ok: false, msg: 'bad-json' }); 
  }

  var action = String(req.action || '').trim();
  var actor = req.actor || 'WEB';
  var lineName = req.lineName || '';
  var lineId = req.lineId || '';

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

function handleCreateOrder_(req, actor, lineName, lineId) {
  var orderId = Orders_newOrder(req.data || {}, actor);
  ChangeLog_append({
    time: new Date(),
    action: 'create',
    orderId: orderId,
    actor: actor,
    lineName: lineName,
    lineId: lineId,
    snapshot: req.data || {}
  });
  return _json({ ok: true, orderId: orderId });
}

function handleCreateWeekly_(req, actor, lineName, lineId) {
  var data = req.data || {};
  var repeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(req.repeat || 1)));
  var result = Orders_createWeekly(data, repeat, actor, { lineName: lineName, lineId: lineId });
  return _json(result);
}

function handleListOrders_(req) {
  var params = {
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
  var result = Orders_list(params);
  return _json(result);
}

function handleGetOrder_(req) {
  var id = String(req.id || '').trim();
  if (!id) return _json({ ok: false, msg: 'missing-id' });
  
  var item = Orders_getById(id);
  if (!item) return _json({ ok: false, msg: 'not-found' });
  
  return _json({ ok: true, item: item });
}

function handleUpdateOrder_(req, actor, lineName, lineId) {
  var id = String(req.id || '').trim();
  var patch = req.patch || {};
  
  if (!id) return _json({ ok: false, msg: 'missing-id' });
  
  var r = Orders_updateByPatch(id, patch, actor, { lineName: lineName, lineId: lineId });
  return _json(r);
}

function handleLineWebhook_(e) {
  var body = {};
  try { 
    body = JSON.parse(e.postData.contents || '{}'); 
  } catch (_) {}
  
  var ev = (body.events && body.events[0]) || null;
  if (!ev || !ev.replyToken) {
    return ContentService.createTextOutput('OK');
  }

  replyMessage(ev.replyToken, [{
    type: 'text',
    text: '您好!請從 LIFF 頁面操作清單/新增/編輯。'
  }]);
  
  return ContentService.createTextOutput('OK');
}

function replyMessage(replyToken, msgs) {
  var token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token) {
    Logger.log('缺少 LINE_CHANNEL_ACCESS_TOKEN');
    return;
  }
  
  var url = 'https://api.line.me/v2/bot/message/reply';
  var payload = { replyToken: replyToken, messages: msgs };
  var params = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, params);
}