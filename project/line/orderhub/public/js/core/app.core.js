/* core/app.core.js — 全域命名空間初始化（第一支載入） */
(function(w) {
    'use strict';
    w.APP = w.APP || {};
    APP.el = APP.el || {}; // jQuery/DOM 快取
    APP.var = APP.var || {}; // 環境變數/狀態
    APP.api = APP.api || function() { throw new Error('APP.api not ready'); };
})(window);