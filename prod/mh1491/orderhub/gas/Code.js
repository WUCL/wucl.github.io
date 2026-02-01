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

// function handleApiRequest_(req) {
//   var t0 = Date.now(); // 紀錄開始時間
//   const action = String(req.action || '').trim();
//   const actor = req.actor || 'WEB';
//   const lineName = req.lineName || '';
//   const lineId = req.lineId || '';
//   const targetId = req.targetId || '';
//   const displayActor = lineName ? (lineName + ' (' + actor + ')') : actor;

//   const opt = {
//     lineName,
//     lineId,
//     targetId: targetId
//   };

//   var result;

//   try {
//     // 執行原有邏輯
//     switch (action) {
//       case 'summary':
//         result = Orders_getSummary();
//         break;
//       case 'create':
//         const orderId = Orders_newOrder(req.data || {}, actor, opt);
//         result = { ok: true, orderId };
//         break;
//       case 'create_weekly':
//         result = Orders_createWeekly(req.data || {}, req.repeat, actor, opt);
//         break;
//       case 'list':
//         const params = {
//           orderStatus: String(req.orderStatus || ''),
//           shipStatus: String(req.shipStatus || ''),
//           payStatus: String(req.payStatus || ''),
//           range_order: String(req.range_order || ''),
//           range_ship: String(req.range_ship || ''),
//           month_order: String(req.month_order || ''),
//           month_ship: String(req.month_ship || ''),
//           year: Number(req.year || 0) || null,
//           limit: req.limit,
//           page: req.page
//         };
//         result = Orders_list(params);
//         break;
//       case 'get':
//         const item = Orders_getById(String(req.id || ''));
//         result = item ? { ok: true, item } : { ok: false, msg: 'not-found' };
//         break;
//       case 'update':
//         result = Orders_updateByPatch(String(req.id || ''), req.patch || {}, actor, opt);
//         break;
//       default:
//         result = { ok: false, msg: 'unknown-action' };
//     }

//     // --- 【紀錄成功日誌】 ---
//     SystemLog_append('INFO', action, {
//       actor: displayActor,
//       duration: Date.now() - t0,
//       status: 'SUCCESS',
//       details: { params: req.data || req.id || req.patch || '' }
//     });

//     return _json(result);

//   } catch (err) {
//     // --- 【紀錄錯誤日誌】 ---
//     SystemLog_append('ERROR', action, {
//       actor: displayActor,
//       duration: Date.now() - t0,
//       status: 'FAILED',
//       details: err.toString()
//     });

//     return _json({ ok: false, msg: 'system-error', error: err.toString() });
//   }
// }

function handleApiRequest_(req) {
  var t0 = Date.now();
  const action = String(req.action || '').trim();

  // 1. 身份與環境識別 (確保 targetId 被提取)
  const lineName = req.lineName || '';
  const lineId = req.lineId || '';
  const platform = req.platform || 'Web';
  const targetId = req.targetId || '';

  const actorDisplay = lineName ? (lineId ? `${lineName} (${lineId})` : lineName) : 'System';

  // 2. 封裝傳遞給 Service 層的完整選項 (供通知與日曆使用)
  const opt = {
    lineName,
    lineId,
    targetId,
    platform,
    actor: actorDisplay
  };

  var result;
  var logData = {
    targetId: targetId,
    view: action
  };

  try {
    switch (action) {
      case 'summary': // 前台稱為 Dashboard
        result = Orders_getSummary();
        break;

      case 'create':
        const newId = Orders_newOrder(req.data || {}, lineName, opt);
        result = { ok: true, orderId: newId };
        logData.orderId = newId;
        logData.customer = req.data['訂購人姓名'] || 'N/A';
        break;

      case 'create_weekly':
        result = Orders_createWeekly(req.data || {}, req.repeat, lineName, opt);
        logData.orderId = result.orderId;
        logData.repeat = req.repeat;
        break;

      case 'update':
        result = Orders_updateByPatch(req.id, req.patch || {}, lineName, opt);
        logData.orderId = req.id;
        logData.changedFields = Object.keys(req.patch || {});
        break;

      case 'list':
        result = Orders_list(req);
        logData.filters = {
          // 1. 三大狀態
          status: req.orderStatus || '',
          ship: req.shipStatus || '',
          pay: req.payStatus || '',

          // 2. 下訂區間 (Order Range)
          order_mode: req.range_order || '',
          order_val: req.month_order || '', // 這裡會存「指定月」

          // 3. 交貨區間 (Ship Range)
          ship_mode: req.range_ship || '',
          ship_val: req.month_ship || '',  // 這裡會存「指定月」或 Dashboard 的「單一日期」

          // 4. 分頁
          page: req.page || 1
        };
        break;

      case 'get':
        const item = Orders_getById(req.id);
        result = item ? { ok: true, item } : { ok: false, msg: 'not-found' };

        logData.queryId = req.id;
        break;

      default:
        result = { ok: false, msg: 'unknown-action' };

        logData.error = "Unknown Action: " + action;
    }

    // --- 【寫入 SystemLog (成功)】 ---
    SystemLog_append('INFO', action, {
      actor: actorDisplay,
      platform: platform,
      ms: Date.now() - t0,
      status: 'SUCCESS',
      details: logData // 存入結構化的 JSON
    });

    return _json(result);

  } catch (err) {
    // --- 【寫入 SystemLog (失敗)】 ---
    SystemLog_append('ERROR', action, {
      actor: actorDisplay,
      platform: platform,
      ms: Date.now() - t0,
      status: 'FAILED',
      details: {
        msg: err.toString(),
        stack: err.stack ? err.stack.split('\n')[0] : '', // 只抓第一行報錯位置
        inputData: logData // 把失敗前的上下文也記下來
      }
    });
    return _json({ ok: false, msg: 'server-error', error: err.toString() });
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