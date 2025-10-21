/** 環境設定 */
const ENV = {
  SPREADSHEET_ID: SpreadsheetApp.getActive().getId(),
  ORDERS_SHEET: 'Orders',
  CHANGELOG_SHEET: 'ChangeLog'
};

/** 共用：開啟試算表 */
function SS() {
  return SpreadsheetApp.openById(ENV.SPREADSHEET_ID);
}
