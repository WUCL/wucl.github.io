/* =======================
	/js/core/env.liff.js
	內容： 環境偵測、徽章、LIFF 初始化。
	來源方法：detectEnv_, showEnvBadge_, initLiff
	======================= */
/* core/env.liff.js — ES5, no optional chaining */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // ---- 環境偵測：決定 endpoint / 標籤 ----
    APP.detectEnv_ = function() {
        var href = String(location.href || '');
        var host = String(location.host || '');
        var isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.)/i.test(href);

        // 來源優先級：
        // 1) <html data-api-endpoint="...">（最優先）
        // 2) window.APP_ENDPOINT（可在 index.html 先行設定）
        // 3) 若本機 → 使用 window.DEV_ENDPOINT（可選）
        // 4) 其他 → 不動，由你在後面手動設定
        var attrEP = (document.documentElement.getAttribute('data-api-endpoint') || '').trim();
        var winEP = (w.APP_ENDPOINT || '').trim();
        var devEP = (w.DEV_ENDPOINT || '').trim();

        var endpoint = APP.var.apiEndpoint || attrEP || winEP || '';
        if (!endpoint && isLocal && devEP) endpoint = devEP;

        // 標記環境
        var env = isLocal ? 'local' : (/workers\.dev/i.test(host) ? 'worker' : 'prod');

        APP.var.env = env;
        APP.var.apiEndpoint = endpoint; // 可能是空字串，後面會再驗證
        return { env: env, endpoint: endpoint, isLocal: isLocal };
    };

    // ---- 顯示右上角徽章（不依賴 TPL）----
    APP.showEnvBadge_ = function() {
        try {
            var info = APP.detectEnv_();
            var badge = document.getElementById('env-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'env-badge';
                badge.style.cssText = '' +
                    'position:fixed;top:8px;right:8px;z-index:9999;' +
                    'padding:4px 8px;border-radius:12px;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;' +
                    'background:#111;color:#fff;opacity:.75';
                document.body.appendChild(badge);
            }
            var tag = info.env.toUpperCase();
            var ep = APP.var.apiEndpoint ? '✓EP' : '✗EP';
            var liffId = APP.var.liffId ? '✓LIFF' : '—';
            badge.textContent = tag + ' · ' + ep + ' · ' + liffId;
        } catch (e) {}
    };

    // ---- 視需要初始化 LIFF（避免本機一直跳登入）----
    APP.initLiffIfNeeded = function() {
        try {
            var info = APP.detectEnv_();
            if (info.isLocal) return; // 本機不啟動 LIFF
            if (!w.liff) return;
            if (!APP.var.liffId) return;

            // liff.init 只需一次
            if (!liff.isInitialized) {
                liff.init({ liffId: APP.var.liffId });
            }
        } catch (e) {}
    };

    // DOM Ready 之後顯示徽章（可選）
    function bootBadge() {
        APP.showEnvBadge_();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootBadge);
    } else {
        bootBadge();
    }
})(window);