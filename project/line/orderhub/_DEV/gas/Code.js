/** =======================
 * Entry & API Router
 * - doGet: 健康檢查
 * - doPost:
 *   - ?api=1  → LIFF 前端 API (create / list / get / update)
 *   - else    → LINE Webhook（維持回 OK）
 * ======================= */
const ENV = {
  SPREADSHEET_ID: SpreadsheetApp.getActive().getId(),
  ORDERS_SHEET:   'Orders',
  CHANGELOG_SHEET:'ChangeLog'
};

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
    // 偵錯探針：POST .../exec?api=1&probe=1
    if (e && e.parameter && e.parameter.api == '1' && e.parameter.probe == '1') {
      var ct = e.postData ? e.postData.type : null;
      var raw = e.postData ? e.postData.contents : null;
      return _json({ ok:true, probe:true, contentType:ct, rawSnippet:(raw||'').slice(0,200) });
    }

    // ===== ① LIFF 前端 API =====
    if (e && e.parameter && e.parameter.api == '1') {
      var raw = (e.postData && e.postData.contents) || '{}';
      var req = {};
      try { req = JSON.parse(raw); } catch (_) { return _json({ ok:false, msg:'bad-json' }); }

      var action = String(req.action || '').trim();
      var actor  = req.actor || 'WEB';
      var lineName = req.lineName || '';
      var lineId   = req.lineId   || '';

      // 路由
      if (action === 'create') {
        var orderId = Orders_newOrder(req.data || {}, actor);
        ChangeLog_append({ // 建立快照
          time: new Date(),
          action: 'create',
          orderId: orderId,
          actor: actor, lineName: lineName, lineId: lineId,
          snapshot: req.data || {}
        });
        return _json({ ok:true, orderId: orderId });
      }

      // === List (with filters) ===
      // if (action === 'list') {
      //   var params = req || {};
      //   // 保留上限，避免一次回太多筆（可自行調整預設/上限）
      //   params.limit = Math.min(Number(params.limit || 20), 200);
      //   var result = Orders_list(params);
      //   return _json(result); // { ok, items, total }
      // }
      if (action === 'list') {
        var params = {
          shipStatus: String(req.shipStatus || ''), // '已出貨' / '未出貨'（UI用詞）
          payStatus:  String(req.payStatus  || ''), // '已付款' / '未付款'
          range:      String(req.range      || ''), // '', 'this-week', 'this-month', 'month'
          month:      String(req.month      || ''), // 'YYYY-MM'
          year:       Number(req.year || 0) || null,
          limit:      Math.min(Number(req.limit || 20), 200)
        };
        var result = Orders_list(params);
        return _json(result);
      }


      if (action === 'get') {
        var id = String(req.id || '').trim();
        if (!id) return _json({ ok:false, msg:'missing-id' });
        var item = Orders_getById(id);
        if (!item) return _json({ ok:false, msg:'not-found' });
        return _json({ ok:true, item: item });
      }

      if (action === 'update') {
        var id2   = String(req.id || '').trim();
        var patch = req.patch || {};
        if (!id2) return _json({ ok:false, msg:'missing-id' });
        var r = Orders_updateByPatch(id2, patch, actor, { lineName: lineName, lineId: lineId });
        return _json(r);
      }

      return _json({ ok:false, msg:'unknown-action' });
    }

    // ===== ② LINE Webhook（保留最小可運作）=====
    var body = {};
    try { body = JSON.parse(e.postData.contents || '{}'); } catch (_){}
    var ev = (body.events && body.events[0]) || null;
    if (!ev || !ev.replyToken) return ContentService.createTextOutput('OK');

    // 只給說明或主選單（你可換回原本 flex）
    replyMessage(ev.replyToken, [{ type:'text', text:'您好！請從 LIFF 頁面操作清單/新增/編輯。' }]);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    Logger.log('ERROR doPost: ' + err + '\n' + (err && err.stack));
    return ContentService.createTextOutput('OK');
  }
}

/** ————（必要：若你在這專案裡用到 Messaging API）———— */
function replyMessage(replyToken, msgs){
  var token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!token) { Logger.log('缺少 LINE_CHANNEL_ACCESS_TOKEN'); return; }
  var url = 'https://api.line.me/v2/bot/message/reply';
  var payload = { replyToken: replyToken, messages: msgs };
  var params = {
    method:'post',
    contentType:'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, params);
}
