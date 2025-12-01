// ==========================================
// Repo.js - Sheets Repository Utils
// ==========================================

const SS = () => SpreadsheetApp.openById(ENV.SPREADSHEET_ID);
const SH = (name) => SS().getSheetByName(name);

function HDR(name) {
  const sh = SH(name);
  if (!sh) throw new Error(`找不到試算表分頁：${name}`);

  const lastCol = sh.getLastColumn() || 1;
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const map = headers.reduce((acc, h, i) => ({ ...acc, [h]: i }), {});

  return { sh, headers, map };
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
  const row = headers.map(h => (obj[h] != null ? obj[h] : ''));
  sh.appendRow(row);
  return sh.getLastRow();
}

function UPDATE(name, rowIdx, patch) {
  const { sh, headers } = HDR(name);
  const range = sh.getRange(rowIdx, 1, 1, headers.length);
  const curr = range.getValues()[0];

  headers.forEach((h, i) => {
    if (h in patch) curr[i] = patch[h];
  });

  range.setValues([curr]);
}

function FINDROW(name, header, value) {
  const { sh, map } = HDR(name);
  const col = map[header];
  if (col == null) throw new Error(`缺少欄位：${header}`);

  const last = sh.getLastRow();
  if (last < 2) return -1;

  // 抓取單欄比較，效能較佳
  const vals = sh.getRange(2, col + 1, last - 1, 1).getValues().flat();
  const target = String(value).trim();

  const idx = vals.findIndex(v => String(v).trim() === target);
  return idx !== -1 ? idx + 2 : -1;
}