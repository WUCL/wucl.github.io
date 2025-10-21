/** LINE Webhook（保持你原本邏輯；這裡不再寫 ChangeLog，避免雙寫） */
function handleWebhook_(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  const ev = (body.events && body.events[0]) || null;
  if (!ev || !ev.replyToken) return ContentService.createTextOutput('OK');

  if (ev.type === 'message' && ev.message && ev.message.type === 'text') {
    const text = (ev.message.text || '').trim();
    const userId = (ev.source && ev.source.userId) || 'UNKNOWN';

    // 1) 查詢
    if (text.startsWith('查 ')) {
      const query = text.slice(2).trim();
      const list = Orders_queryByKeyword(query);
      return replyMessage(ev.replyToken, Templates_flexOrderList(list, '查詢：' + query));
    }

    // 2) 新增 測試（這裡僅回覆訊息，不寫 ChangeLog）
    if (text === '新增 測試') {
      const id = Orders_newOrder({
        '接單平台': 'LINE',
        '訂購人姓名': '測試客戶',
        '訂購人電話': '0900000000',
        '訂單金額': 1000,
        '是否已付款': '未付款',
        '是否已交貨': '未交貨',
        '交貨日期': Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd'),
        '商品項目': '測試品項 x1',
        '訂單備註': '測試建立'
      }, userId);
      return replyMessage(ev.replyToken, [{ type: 'text', text: '✅ 已建立測試訂單：' + id }]);
    }

    // 3) 修改
    if (text.startsWith('改 ')) {
      const parsed = parseUpdateCommand_(text);
      if (!parsed) {
        return replyMessage(ev.replyToken, [{
          type: 'text',
          text: '格式：\n改 #O-YYYYMM-00001 欄位=值 欄位=值\n例：改 #O-202510-00001 是否已付款=已付款 貨運單號=SEVEN123'
        }]);
      }
      const r = Orders_updateByCommand(parsed.orderId, parsed.patch, userId);
      return replyMessage(ev.replyToken, r.ok
        ? [{ type: 'text', text: formatOrder_(r.order, '✅ 已更新') }]
        : [{ type: 'text', text: '❌ 修改失敗：' + r.msg }]);
    }

    // 主選單
    return replyMessage(ev.replyToken, [Templates_mainMenuQR_()]);
  }

  return ContentService.createTextOutput('OK');
}

/** —— 你原本的工具保留在這裡 —— */
function renderQueryList_(list, title) {
  if (!list || !list.length) return [{ type:'text', text:`${title}\n查無資料` }];
  const first3 = list.slice(0, 3).map(o => formatOrder_(o));
  return [{ type:'text', text: `${title}\n共 ${list.length} 筆，顯示前 ${first3.length} 筆：\n\n${first3.join('\n\n')}` }];
}
function formatOrder_(o, prefix) {
  const parts = [];
  if (prefix) parts.push(prefix);
  parts.push(`#${o['訂單編號']||''}｜${o['接單平台']||''}`);
  parts.push(`${o['訂購人姓名']||''}（${o['訂購人電話']||''}）｜金額：${o['訂單金額']||''}`);
  parts.push(`交貨日：${o['交貨日期']||''}｜交貨：${o['是否已交貨']||''}｜付款：${o['是否已付款']||''}`);
  if (o['貨運單號']) parts.push(`貨運單號：${o['貨運單號']}`);
  if (o['商品項目']) parts.push(`品項：${o['商品項目']}`);
  return parts.join('\n');
}
function parseUpdateCommand_(t) {
  const m = t.match(/^改\s+#([^\s]+)\s+(.+)$/);
  if (!m) return null;
  const orderId = m[1].trim();
  const pairs = m[2].split(/\s+/);
  const patch = {};
  pairs.forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) patch[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return { orderId, patch };
}
