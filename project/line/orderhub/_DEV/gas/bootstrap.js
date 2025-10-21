/** 初始化／校正 ChangeLog 表頭 */
function initProject() {
  const ss = SS();
  if (!ss.getSheetByName(ENV.ORDERS_SHEET)) {
    throw new Error('找不到 Orders 表：' + ENV.ORDERS_SHEET);
  }

  let sh = ss.getSheetByName(ENV.CHANGELOG_SHEET);
  if (!sh) sh = ss.insertSheet(ENV.CHANGELOG_SHEET);

  const headers = ['ts','action','order_id','actor','line_name','line_id','field','old','new','snapshot','note'];
  const needCols = headers.length;
  const firstRow = sh.getRange(1, 1, 1, Math.max(needCols, sh.getLastColumn())).getValues()[0];

  // 若表頭不是我們規格，重設
  if (firstRow[0] !== 'ts' || sh.getLastColumn() !== needCols) {
    sh.clear();
    sh.appendRow(headers);
  } else {
    // 保險：逐欄覆蓋一次表頭
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function testToken() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN'));
}
