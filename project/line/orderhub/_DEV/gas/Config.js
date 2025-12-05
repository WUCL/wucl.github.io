// ==========================================
// Config.js - 環境配置
// ==========================================
const ENV = {
  SPREADSHEET_ID: SpreadsheetApp.getActive().getId(),
  ORDERS_SHEET: 'Orders',
  CHANGELOG_SHEET: 'ChangeLog'
};

const LIMITS = {
  MAX_LIST_ITEMS: 200,
  DEFAULT_LIST_ITEMS: 20,
  MAX_WEEKLY_REPEAT: 12,
  LOCK_TIMEOUT: 5000
};