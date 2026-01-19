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
  // [優化] 確保寫入順序與表頭一致，不存在的欄位補空字串
  const row = headers.map(h => (obj[h] != null ? obj[h] : ''));
  sh.appendRow(row);
  return sh.getLastRow();
}

function UPDATE(name, rowIdx, patch) {
  const { sh, headers } = HDR(name);
  // [優化] 只讀取需要的那一行，而非整個範圍
  const range = sh.getRange(rowIdx, 1, 1, headers.length);
  // const curr = range.getValues()[0];
  const curr = range.getDisplayValues()[0];

  let isChanged = false;
  headers.forEach((h, i) => {
    // 只有當 patch 有該欄位且值不同時才更新
    // if (h in patch && patch[h] != curr[i]) {
    //   curr[i] = patch[h];
    //   isChanged = true;
    // }

    if (h in patch) {
      // 統一轉成字串並去除空白後比對
      let newVal = String(patch[h]).trim();
      let oldVal = String(curr[i]).trim();

      if (newVal !== oldVal) {
        curr[i] = patch[h];
        isChanged = true;
      }
    }
  });

  if (isChanged) {
    // 在寫回 Sheets 之前，對整行所有「電話」欄位進行二次檢查
    // 防止那些「沒被 patch 改到」的電話號碼因為讀取轉型而丟失 0
    const rowToSave = curr.map((val, idx) => {
      const headerName = headers[idx];
      if (/電話/.test(headerName) && val != null && val !== '') {
        // 移除可能存在的重複單引號，並強制加上單引號
        let cleanVal = String(val).replace(/^'/, '');
        return "'" + cleanVal;
      }
      return val;
    });

    range.setValues([rowToSave]);
  }
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