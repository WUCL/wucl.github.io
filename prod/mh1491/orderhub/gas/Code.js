// ==========================================
// Code.gs - API Gateway (Controller)
// 職責：接收 HTTP 請求、路由分發、回傳標準 JSON
// ==========================================

function doGet(e) {
  const isApi = e?.parameter?.api === '1';
  if (isApi) return _json({ ok: true, pong: true, ts: new Date() });
  return ContentService.createTextOutput('OK');
}

function doPost(e) {
  let req = {};
  try {
    req = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return _json({ ok: false, msg: 'bad-json' });
  }

  if (e?.parameter?.probe === '1') {
    return _json({
      ok: true, probe: true,
      contentType: e.postData?.type,
      rawSnippet: (e.postData?.contents || '').slice(0, 200)
    });
  }

  if (e?.parameter?.api === '1') {
    return handleApiRequest_(req);
  }

  return handleLineWebhook_(req);
}

function handleApiRequest_(req) {
  const action = String(req.action || '').trim();
  const actor = req.actor || 'WEB';
  const lineName = req.lineName || '';
  const lineId = req.lineId || '';

  // 【關鍵修改：增加 targetId】
  const targetId = req.targetId || '';

  // 統一參數物件，傳遞給 Service
  const opt = {
    lineName,
    lineId,
    targetId: targetId // 讓後面的 Service 知道要發給誰
  };

  switch (action) {
    case 'create':
      // 現在 Code.js 不用管通知格式了，直接交給 Service
      const orderId = Orders_newOrder(req.data || {}, actor, opt);
      return _json({ ok: true, orderId });

    case 'create_weekly':
      const repeat = Math.max(1, Math.min(LIMITS.MAX_WEEKLY_REPEAT, Number(req.repeat || 1)));
      const wResult = Orders_createWeekly(req.data || {}, repeat, actor, opt);
      return _json(wResult);

    case 'list':
      // List 的參數轉換邏輯比較單純，保留在這裡或搬進 Service 都可以
      // 這裡維持現狀，將 HTTP 參數轉為 Service 參數
      const params = {
        orderStatus: String(req.orderStatus || ''),
        shipStatus: String(req.shipStatus || ''),
        payStatus: String(req.payStatus || ''),
        range_order: String(req.range_order || ''),
        range_ship: String(req.range_ship || ''),
        month_order: String(req.month_order || ''),
        month_ship: String(req.month_ship || ''),
        year: Number(req.year || 0) || null,
        limit: req.limit, 
        page: req.page
      };
      return _json(Orders_list(params));

    case 'get':
      const id = String(req.id || '').trim();
      if (!id) return _json({ ok: false, msg: 'missing-id' });
      const item = Orders_getById(id);
      return item ? _json({ ok: true, item }) : _json({ ok: false, msg: 'not-found' });

    case 'update':
      const uid = String(req.id || '').trim();
      if (!uid) return _json({ ok: false, msg: 'missing-id' });
      const uResult = Orders_updateByPatch(uid, req.patch || {}, actor, opt);
      return _json(uResult);

    default:
      return _json({ ok: false, msg: 'unknown-action' });
  }
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