/** API + Webhook 分流入口 */
function doPost(e) {
  // ---- 偵錯探針：POST .../exec?api=1&probe=1 ----
  if (e && e.parameter && e.parameter.probe == '1') {
    var isApiProbe = e.parameter.api == '1';
    var ctProbe = e.postData ? e.postData.type : null;
    var rawProbe = e.postData ? e.postData.contents : null;
    return _json({ ok:true, probe:true, isApi:isApiProbe, contentType:ctProbe, rawSnippet:(rawProbe||'').slice(0,120) });
  }

  var isApi = e && e.parameter && e.parameter.api == '1';
  if (isApi) {
    try {
      return handleApi_(e);
    } catch (err) {
      // ←← 不要吞掉：把真實錯誤回 JSON
      Logger.log('API ERROR: ' + err + '\n' + (err && err.stack));
      return _json({ ok:false, msg:'server-error', err:String(err) });
    }
  }

  // Webhook 照舊
  try {
    return handleWebhook_(e);
  } catch (err) {
    Logger.log('WEBHOOK ERROR: ' + err + '\n' + (err && err.stack));
    return ContentService.createTextOutput('OK');
  }
}

/** LIFF 前端呼叫的 API */
function handleApi_(e) {
  var raw = (e.postData && e.postData.contents) || '{}';
  var obj = JSON.parse(raw); // 前端用 text/plain 傳 JSON 字串

  if (obj.action === 'create') {
    const actor    = obj.actor || 'WEB';
    const lineName = obj.lineName || '';
    const lineId   = obj.lineId   || '';
    const data     = obj.data  || {};

    const id = Orders_newOrder(data, actor);

    // 只在 API 分支寫一次 ChangeLog
    ChangeLog_append({
      action: 'create',
      orderId: id,
      actor, lineName, lineId,
      snapshot: data
    });

    return _json({ ok: true, orderId: id });
  }

  return _json({ ok: false, msg: 'unknown-action' });
}
