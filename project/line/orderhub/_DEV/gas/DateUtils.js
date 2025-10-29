// ==========================================
// DateUtils.js - 日期處理工具
// ==========================================

/**
 * 計算日期範圍
 * @param {string} range - 'this-week' | 'this-month' | 'month'
 * @param {string} customMonth - 'YYYY-MM'
 * @returns {Object|null} { start, end } 或 null
 */
function getDateRange_(range, customMonth) {
  if (!range || (range !== 'this-week' && range !== 'this-month' && range !== 'month')) {
	return null;
  }

  if (range === 'month' && !customMonth) {
	return null;
  }

  var now = new Date();
  var start, end;

  switch (range) {
	case 'this-week':
	  start = new Date(now);
	  start.setHours(0, 0, 0, 0);
	  start.setDate(start.getDate() - start.getDay());
	  end = new Date(start);
	  end.setDate(end.getDate() + 7);
	  break;

	case 'this-month':
	  start = new Date(now.getFullYear(), now.getMonth(), 1);
	  end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	  break;

	case 'month':
	  var ym = String(customMonth).split('-');
	  var yy = Number(ym[0] || 0);
	  var mm = Number(ym[1] || 0) - 1;
	  start = new Date(yy, mm, 1);
	  end = new Date(yy, mm + 1, 1);
	  break;
  }

  return { start: start, end: end };
}

/**
 * 根據日期欄位和時間範圍過濾資料
 */
function filterByDateRange_(rows, dateField, range, customMonth) {
  var dateRange = getDateRange_(range, customMonth);

  if (!dateRange) {
	return rows;
  }

  return rows.filter(function(r) {
	var d = new Date(r[dateField]);
	if (isNaN(d.getTime())) return false;
	return (d >= dateRange.start && d < dateRange.end);
  });
}

/**
 * 取得指定日期之後最近的週五
 */
function getNextFriday_(d) {
  var date = new Date(d);
  var day = date.getDay();
  var diff = (5 - day + 7) % 7;
  if (diff === 0 && day !== 5) diff = 7;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}