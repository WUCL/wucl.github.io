/** =======================
 * Sheets Repository Utils
 * - SS/SH/HDR/ROWS/APPEND/UPDATE/FINDROW
 * ======================= */
function SS() { return SpreadsheetApp.openById(ENV.SPREADSHEET_ID); }
function SH(name){ return SS().getSheetByName(name); }

function HDR(name){
  var sh = SH(name); if (!sh) throw new Error('找不到試算表分頁：' + name);
  var lastCol = sh.getLastColumn() || 1;
  var headers = sh.getRange(1,1,1,lastCol).getValues()[0].map(function(v){ return String(v).trim(); });
  var map = {}; headers.forEach(function(h,i){ if (h) map[h]=i; });
  return { sh: sh, headers: headers, map: map };
}

function ROWS(name){
  var hh = HDR(name);
  var sh = hh.sh, headers = hh.headers;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var vals = sh.getRange(2,1,lastRow-1,headers.length).getValues();
  return vals.map(function(row, i){
    var o = { __row: i+2 };
    headers.forEach(function(h, idx){ o[h] = row[idx]; });
    return o;
  });
}

function APPEND(name, obj){
  var hh = HDR(name);
  var sh = hh.sh, headers = hh.headers;
  var row = headers.map(function(h){ return (obj[h] != null ? obj[h] : ''); });
  sh.appendRow(row);
  return sh.getLastRow();
}

function UPDATE(name, rowIdx, patch){
  var hh = HDR(name);
  var sh = hh.sh, headers = hh.headers;
  var curr = sh.getRange(rowIdx, 1, 1, headers.length).getValues()[0];
  headers.forEach(function(h, i){
    if (h in patch) curr[i] = patch[h];
  });
  sh.getRange(rowIdx, 1, 1, headers.length).setValues([curr]);
}

function FINDROW(name, header, value){
  var hh = HDR(name);
  var sh = hh.sh, map = hh.map;
  var col = map[header]; if (col == null) throw new Error('缺少欄位：' + header);
  var last = sh.getLastRow(); if (last < 2) return -1;
  var vals = sh.getRange(2, col+1, last-1, 1).getValues().map(function(r){ return r[0]; });
  var target = String(value).trim();
  for (var i=0; i<vals.length; i++){
    if (String(vals[i]).trim() === target) return i+2; // 轉成工作表列號
  }
  return -1;
}
