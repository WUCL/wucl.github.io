/** 寫入一筆訂單並回傳 orderId */
function Orders_newOrder(data, actor) {
  var ss = SS();
  var sh = ss.getSheetByName(ENV.ORDERS_SHEET);
  if (!sh) throw new Error('找不到表：' + ENV.ORDERS_SHEET);

  // 標題列
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  // 訂單編號欄位索引（1-based）
  var orderIdCol = headers.indexOf('訂單編號') + 1;
  if (orderIdCol <= 0) throw new Error('Orders 缺少「訂單編號」欄位');

  // 產編：O-YYYYMM-00001，當月序號累加
  var now = new Date();
  var ym = Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMM');
  var prefix = 'O-' + ym + '-';

  var lastRow = sh.getLastRow();
  var seq = 0;
  if (lastRow >= 2) {
    var colVals = sh.getRange(2, orderIdCol, lastRow - 1, 1).getValues().flat();
    colVals.forEach(function(v) {
      if (typeof v === 'string' && v.indexOf(prefix) === 0) {
        var n = parseInt(v.slice(prefix.length), 10);
        if (n > seq) seq = n;
      }
    });
  }
  var nextSeq = Utilities.formatString('%05d', seq + 1);
  var orderId = prefix + nextSeq;

  // 組資料列
  var row = headers.map(function(h) {
    if (h === '訂單編號') return orderId;
    if (h === '建立時間') return nowStr_();
    if (h === '建立人')   return actor || '';
    return (data[h] != null ? data[h] : '');
  });

  sh.appendRow(row);
  return orderId;
}
