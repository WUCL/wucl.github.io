// ==========================================
// Repo.js - Sheets Repository Utils
// ==========================================

// [優化] 使用全域變數緩存 Spreadsheet 實例，避免重複 openById
let _SS_CACHE = null;
const SS = () => {
  if (!_SS_CACHE) {
    _SS_CACHE = SpreadsheetApp.openById(ENV.SPREADSHEET_ID);
  }
  return _SS_CACHE;
};

const SH = (name) => SS().getSheetByName(name);

// [優化] 簡單的記憶體緩存，避免在一次執行中重複讀取同個 Sheet 的表頭
const _HEADER_CACHE = {};

function HDR(name) {
  if (_HEADER_CACHE[name]) return _HEADER_CACHE[name];

  const sh = SH(name);
  if (!sh) throw new Error(`找不到試算表分頁：${name}`);

  const lastCol = sh.getLastColumn();
  if (lastCol === 0) return { sh, headers: [], map: {} }; // 防止空表報錯

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const map = headers.reduce((acc, h, i) => ({ ...acc, [h]: i }), {});

  const result = { sh, headers, map };
  _HEADER_CACHE[name] = result; // 存入緩存
  return result;
}

function ROWS(name) {
  const { sh, headers } = HDR(name);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const vals = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return vals.map((row, i) => {
    const o = { __row: i + 2 };
    headers.forEach((h, idx) => o[h] = row[idx]);
    return o;
  });
}

function APPEND(name, obj) {
  const { sh, headers } = HDR(name);

  // [優化] 關鍵：如果欄位不存在於 obj 中，回傳 null 而不是 ''
  // 這能確保 ARRAYFORMULA 欄位保持真空，公式才能正常運算
  const row = headers.map(h => (obj[h] !== undefined ? obj[h] : null));
  sh.appendRow(row);
  return sh.getLastRow();
}

function UPDATE(name, rowIdx, patch) {
  const { sh, headers } = HDR(name);

  // 1. 取得該行範圍
  const range = sh.getRange(rowIdx, 1, 1, headers.length);
  // 2. 取得目前在試算表看到的樣子 (用於比對)
  const curr = range.getDisplayValues()[0];

  // 3. 遍歷標題，找出哪些欄位在 patch 裡且值有變動
  headers.forEach((h, i) => {
    if (h in patch) {
      let newVal = String(patch[h]).trim();
      let oldVal = String(curr[i]).trim();

      // 4. 只有當值真的不同時，才執行寫入
      if (newVal !== oldVal) {

        // --- 【這就是你提到的那段邏輯，我把它整合在這裡】 ---
        // 如果欄位名稱包含「電話」，且內容不為空
        if (/電話/.test(h) && newVal !== '') {
          // 移除可能存在的重複單引號，並強迫加上一個單引號
          let cleanVal = newVal.replace(/^'/, '');
          newVal = "'" + cleanVal;
        }
        // --------------------------------------------------

        // 執行「單格」寫入，避開後方的公式欄
        sh.getRange(rowIdx, i + 1).setValue(newVal);

        console.log('欄位已更新:', h, '舊值:', oldVal, '新值:', newVal);
      }
    }
  });
}

function FINDROW(name, header, value) {
  const { sh, map } = HDR(name);
  const colIdx = map[header];
  if (colIdx == null) throw new Error(`缺少欄位：${header}`);

  // [優化] 改用 TextFinder，比讀取整個 Array 快非常多
  // 注意：colIdx 是 0-base，getRange 是 1-base，所以要 +1
  const finder = sh.getRange(2, colIdx + 1, sh.getLastRow(), 1).createTextFinder(String(value));
  const result = finder.matchEntireCell(true).findNext();

  if (result) {
    return result.getRow();
  }
  return -1;
}

/**
 * Repo.js 新增函式
 * 只抓取原始資料不轉物件，效能最快
 */
function RAW_DATA(name) {
  const { sh, headers } = HDR(name);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  return sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
}