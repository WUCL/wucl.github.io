/** ====== Repository 層（純資料工具） ====== */
// 用 env.gs 的 SS()，避免重複定義
function SH_(name){ return SS().getSheetByName(name); }

function HDR_(name){
  const sh = SH_(name);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(v=>String(v).trim());
  const map = {}; headers.forEach((h,i)=> h && (map[h]=i));
  return {sh, headers, map};
}

function ROWS_(name){
  const {sh, headers} = HDR_(name);
  const last = sh.getLastRow(); if (last < 2) return [];
  const vals = sh.getRange(2,1,last-1,headers.length).getValues();
  return vals.map((row,i)=>{
    const o={__row:i+2}; headers.forEach((h,idx)=>o[h]=row[idx]); return o;
  });
}

function APPEND_(name,obj){
  const {sh, headers} = HDR_(name);
  const row = headers.map(h => obj[h] ?? '');
  sh.appendRow(row);
  return sh.getLastRow();
}

function UPDATE_(name,rowIdx,patch){
  const {sh, headers} = HDR_(name);
  const curr = sh.getRange(rowIdx,1,1,headers.length).getValues()[0];
  headers.forEach((h,i)=>{ if (h in patch) curr[i]=patch[h]; });
  sh.getRange(rowIdx,1,1,headers.length).setValues([curr]);
}

function FINDROW_(name, header, value){
  const {sh, map} = HDR_(name);
  const col = map[header]; if (col==null) throw new Error('缺少欄位：'+header);
  const last = sh.getLastRow(); if (last<2) return -1;
  const vals = sh.getRange(2,col+1,last-1,1).getValues().map(r=>r[0]);
  const i = vals.findIndex(v => String(v).trim() === String(value).trim());
  return i>=0 ? i+2 : -1;
}

/** ====== Orders Service（只保留查詢 / 更新；新增交由 orders.gs） ====== */

/**
 * 依關鍵字查詢（與你原本相同，最多回 10 筆）
 */
function Orders_queryByKeyword(k){
  const rows = ROWS_(ENV.ORDERS_SHEET);
  k = String(k||'').trim();
  if (!k || k==='全部') return rows.slice(0,10);
  if (/未交貨/.test(k)) return rows.filter(r => String(r['是否已交貨']).includes('未')).slice(0,10);
  if (/未付款|未收款/.test(k)) return rows.filter(r => String(r['是否已付款']).includes('未')).slice(0,10);
  if (/今天/.test(k)) {
    const d = Utilities.formatDate(new Date(),'Asia/Taipei','yyyy/MM/dd');
    return rows.filter(r => String(r['交貨日期'])===d).slice(0,10);
  }
  if (/明天/.test(k)) {
    const t = new Date(); t.setDate(t.getDate()+1);
    const d = Utilities.formatDate(t,'Asia/Taipei','yyyy/MM/dd');
    return rows.filter(r => String(r['交貨日期'])===d).slice(0,10);
  }
  return rows.filter(r=>{
    const s = [r['訂單編號'], r['訂購人姓名'], r['訂購人電話'], r['收件者姓名'], r['接單平台'], r['貨運單號'], r['商品項目']].join(' ');
    return String(s).includes(k);
  }).slice(0,10);
}

/**
 * 依「#單號」＋ patch 更新；同時把欄位差異寫入 ChangeLog（新版欄位：field/old/new）
 * @param {string} orderId
 * @param {Object} patch 例：{ '是否已付款':'已付款', '貨運單號':'SEVEN123' }
 * @param {string} actor  例：userId 或 DEV-TEST
 * @param {string=} lineName  LIFF/LINE 顯示名稱（可選）
 * @param {string=} lineId    LINE userId（可選）
 */
function Orders_updateByCommand(orderId, patch, actor, lineName, lineId){
  const row = findById_(orderId);
  if (row === -1) return { ok:false, msg:'找不到訂單：'+orderId };

  // 取更新前快照（單列）
  const all = ROWS_(ENV.ORDERS_SHEET);
  const before = all.find(r=>r.__row===row) || {};

  // 寫入更新
  UPDATE_(ENV.ORDERS_SHEET, row, patch);

  // 取更新後快照
  const after = ROWS_(ENV.ORDERS_SHEET).find(r=>r.__row===row) || {};

  // 組 diff（只對 patch 中有給的欄位比對 old/new）
  const diff = {};
  Object.keys(patch).forEach(function(k){
    const o = (before[k] == null ? '' : String(before[k]));
    const n = (after[k]  == null ? '' : String(after[k]));
    if (o !== n) diff[k] = { old: o, new: n };
  });

  // 有變更才寫 ChangeLog（新版 schema）
  if (Object.keys(diff).length){
    try{
      ChangeLog_append({
        action: 'update',
        orderId: orderId,
        actor: actor || '',
        lineName: lineName || '',
        lineId: lineId || '',
        diff: diff,
        note: 'Orders_updateByCommand'
      });
    } catch (e) {
      Logger.log('ChangeLog_append error: ' + e);
    }
  }

  return { ok:true, order: after };
}

/** ====== 工具（僅供本檔內使用） ====== */

function findById_(orderId){
  try { return FINDROW_(ENV.ORDERS_SHEET, '訂單編號', orderId); }
  catch(e){ throw new Error('請先在 Orders 表第1列建立「訂單編號」欄位'); }
}
