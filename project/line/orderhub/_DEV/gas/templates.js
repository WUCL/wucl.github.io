/** ====== TemplatesFlex.gs ====== */
/** 建立查詢結果：最多 10 張卡一組（LINE 限制），超過就分批回覆 */
// ✅ 查詢回覆：前面先丟一則文字（帶 quickReply），後面接 Flex 卡片
function Templates_flexOrderList(list, title) {
  const messages = [];

  if (!list || !list.length) {
    messages.push({ type: 'text', text: `${title}\n查無資料` });
  } else {
    const chunks = chunk_(list, 10);
    // 先放總覽文字
    messages.push({ type: 'text', text: `${title}\n共 ${list.length} 筆，顯示 ${Math.min(list.length,10)} 筆${list.length>10?'（其餘分組顯示）':''}。` });
    // 再放一或多則 Flex
    chunks.forEach((chunk, i) => {
      messages.push({
        type: 'flex',
        altText: `${title}（第 ${i+1}/${chunks.length} 組，共 ${list.length} 筆）`,
        contents: { type: 'carousel', contents: chunk.map(o => flexOrderBubble_(o)) }
      });
    });
  }

  // ✅ 把 Quick Reply 掛在「最後一則訊息」上
  messages[messages.length - 1].quickReply = quickReplyForQuery_();
  return messages;
}


// ✅ 主選單四顆按鈕（被上面兩處呼叫）
function quickReplyForQuery_(){
  return {
    items: [
      { action:{ type:'message', label:'未交貨', text:'查 未交貨' } },
      { action:{ type:'message', label:'未付款', text:'查 未付款' } },
      { action:{ type:'message', label:'今天',   text:'查 今天' } },
      { action:{ type:'message', label:'明天',   text:'查 明天' } }
    ]
  };
}


/** 單張訂單卡片 */
function flexOrderBubble_(o) {
  const id = String(o['訂單編號']||'').trim();
  const platform = o['接單平台'] || '';
  const customer = o['訂購人姓名'] || '';
  const phone = o['訂購人電話'] || '';
  const total = o['訂單金額'] || '';
  const pay = o['是否已付款'] || '';
  const ship = o['是否已交貨'] || '';
  const due = o['交貨日期'] || '';
  const item = o['商品項目'] || '';
  const tracking = o['貨運單號'] || '';

  return {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      contents: [
        { type: "text", text: id || "（未有訂單編號）", weight: "bold", size: "lg" },
        { type: "text", text: platform, size: "xs", color: "#888888" }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "8px",
      contents: [
        row_("客戶", `${customer}（${phone}）`),
        row_("金額", String(total)),
        row_("付款", pay, statusColor_(pay)),
        row_("交貨", ship, statusColor_(ship)),
        row_("交貨日", String(due||'').replace(/-/g,'/')),
        item ? row_("品項", item) : { type:"box", layout:"vertical", contents:[], spacing:"none" },
        tracking ? row_("貨運單號", tracking) : { type:"box", layout:"vertical", contents:[], spacing:"none" }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "8px",
      contents: [
        {
          type: "button",
          style: "primary",
          height: "sm",
          action: {
            type: "message",
            label: "標記已付款",
            text: id ? `改 #${id} 是否已付款=已付款` : "（缺少訂單編號）"
          }
        },
        {
          type: "button",
          style: "secondary",
          height: "sm",
          action: {
            type: "message",
            label: "標記已交貨",
            text: id ? `改 #${id} 是否已交貨=已交貨` : "（缺少訂單編號）"
          }
        },
        {
          type: "button",
          height: "sm",
          style: "link",
          action: {
            type: "message",
            label: "填寫貨運單號",
            text: id ? `改 #${id} 貨運單號=` : "（缺少訂單編號）"
          }
        },
        // 之後有 LIFF 頁面時，可把這顆改成 openUrl 到編輯頁
        {
          type: "button",
          style: "link",
          height: "sm",
          action: {
            type: "uri",
            label: "編輯",
            // 二擇一：建議先用 http 連結，確認 OK 再換深連結
            uri: "https://wucl.github.io/project/line/orderhub/index.html#/edit?id=" + encodeURIComponent(id)
            // 或深連結：
            // uri: "https://liff.line.me/<你的LIFF_ID>?#/edit?id=" + encodeURIComponent(id)
          }
        },
      ]
    },
    styles: {
      header: { backgroundColor: "#F6F7FB" }
    }
  };
}

/** 小工具：輸出欄位行（標籤：值），可帶色 */
function row_(label, value, color) {
  return {
    type: "box",
    layout: "baseline",
    contents: [
      { type: "text", text: label, size: "sm", color: "#888888", flex: 3 },
      { type: "text", text: String(value||''), size: "sm", wrap: true, flex: 9, color: color || "#333333" }
    ]
  };
}

/** 狀態著色（簡單版） */
function statusColor_(val) {
  const s = String(val||'');
  if (/已/.test(s)) return "#0A7F2E";   // 綠
  if (/未/.test(s)) return "#C0392B";   // 紅
  return "#333333";
}

/** 陣列分塊 */
function chunk_(arr, size) {
  const out = [];
  for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
  return out;
}

function Templates_mainMenuQR_() {
  return {
    type: 'text',
    text: '請選擇操作：',
    quickReply: {
      items: [
        { action: { type:'message', label:'未交貨', text:'查 未交貨' } },
        { action: { type:'message', label:'未付款', text:'查 未付款' } },
        { action: { type:'message', label:'今天',   text:'查 今天' } },
        { action: { type:'message', label:'明天',   text:'查 明天' } }
      ]
    }
  };
}

/** ====== TemplatesMenu.gs ====== */
/** Quick Reply 主選單 */
function Templates_mainMenuQR_() {
  return {
    type: 'text',
    text: '請選擇操作：',
    quickReply: {
      items: [
        { action: { type:'message', label:'未交貨', text:'查 未交貨' } },
        { action: { type:'message', label:'未付款', text:'查 未付款' } },
        { action: { type:'message', label:'今天',   text:'查 今天' } },
        { action: { type:'message', label:'明天',   text:'查 明天' } }
      ]
    }
  };
}

