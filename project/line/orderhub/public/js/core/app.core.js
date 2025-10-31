/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Core
 * 職責：建立 APP 命名空間、環境偵測、LIFF 初始化、Router、啟動器
 * 依賴：jQuery、TPL、(可選) liff、eventdevice.js
 */
;
(function(w, $) {
    'use strict';

    // 全域命名空間
    var APP = w.APP || (w.APP = {});

    // DOM 快取
    APP.el = {
        $win: $(window),
        $body: $('body'),
        $main: $('#main'),
        $meta: $('#meta')
    };

    // 可調整參數（依環境）
    APP.var = {
        actor: 'LIFF',
        isDev: false,
        isStaging: false,
        envLabel: 'PROD',
        liffReady: false,
        // ← 依實際值調整
        LIFF_ID: '2008325627-Nk6d1Z64',
        API_URL: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec?api=1'
    };

    /* ========== Env & LIFF ========== */

    // 偵測環境：DEV / STAGING / PROD
    APP.detectEnv_ = function() {
        var h = location.hostname || '';
        var proto = location.protocol || '';
        var qs = '';
        try { qs = location.search || ''; } catch (_) {}
        var q;
        try { q = new URLSearchParams(qs); } catch (_) { q = { get: function() { return null; } }; }

        if (q.get && q.get('dev') === '1') return { isDev: true, isStaging: false, label: 'DEV' };
        if (q.get && q.get('staging') === '1') return { isDev: false, isStaging: true, label: 'STAGING' };

        var isLocal = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' ||
            /^192\.168\./.test(h) || /^10\./.test(h) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) || /\.local$/.test(h) || /\.test$/.test(h));

        var looksStaging =
            /ngrok\.io$/.test(h) || /ngrok-free\.app$/.test(h) ||
            (/\.vercel\.app$/.test(h) && /-(git|preview)/i.test(h)) ||
            (/\.netlify\.app$/.test(h) && /--/.test(h)) ||
            /\.cloudfront\.net$/.test(h);

        if (isLocal) return { isDev: true, isStaging: false, label: 'DEV' };
        if (looksStaging) return { isDev: false, isStaging: true, label: 'STAGING' };
        return { isDev: false, isStaging: false, label: 'PROD' };
    };

    // LIFF 初始化（本機與未設定 LIFF_ID 時，一律略過登入）
    APP.initLiff = function() {
        var self = this;
        return new Promise(function(resolve) {
            var h = location.hostname || '';
            var proto = location.protocol || '';
            var isPrivate = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' ||
                /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h));

            if (self.var.isDev || self.var.isStaging || isPrivate) {
                self.var.actor = (self.var.envLabel || 'LOCAL') + '-TEST';
                self.setMeta('（' + (self.var.envLabel || 'DEV') + ' 模式，未登入）');
                resolve();
                return;
            }
            if (!w.liff || !self.var.LIFF_ID || self.var.LIFF_ID.indexOf('REPLACE_') === 0) {
                self.setMeta('(未啟用 LIFF)');
                resolve();
                return;
            }
            try {
                liff.init({ liffId: self.var.LIFF_ID }).then(function() {
                    if (!liff.isLoggedIn()) {
                        liff.login();
                        resolve();
                        return;
                    }
                    liff.getProfile().then(function(p) {
                        self.var.actor = 'LIFF';
                        self.var.liffReady = true; // ← 只有成功才打開
                        self.setMeta('使用者：' + ((p && p.displayName) || ''));
                        resolve();
                    }).catch(function() {
                        self.setMeta('(LIFF 取用個資失敗)');
                        resolve();
                    });
                }).catch(function() {
                    self.setMeta('(LIFF 初始化失敗)');
                    resolve();
                });
            } catch (_e) {
                self.setMeta('(LIFF 初始化例外)');
                resolve();
            }
        });
    };

    /* ========== Router ========== */

    // 高亮當前分頁
    APP.navHighlight = function() {
        var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
        var links = document.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            var el = links[i];
            el.classList.toggle('active', el.getAttribute('data-nav') === name);
        }
    };

    // 麵包屑
    APP.updateBreadcrumb = function(name) {
        var map = { list: '訂單列表', add: '新增訂單', edit: '編輯訂單' };
        var label = map[name] || '訂單列表';
        var el = document.querySelector('#breadcrumb .current');
        if (el) el.textContent = label;
    };

    // 簡易路由（預設 list，若未實作則 fallback add）
    APP.route = function() {
        if (!location.hash) location.hash = '#/list';
        this.navHighlight();
        var h = (location.hash || '').replace(/^#\//, '');
        var name = h.split('?')[0];
        this.updateBreadcrumb(name);
        if (name === 'add') { this.renderAdd(); return; }
        if (name === 'edit') { this.renderEdit(); return; }
        if (this.renderList) this.renderList();
        else this.renderAdd();
    };

    // app.router.js
    APP.route = function() {
        const h = location.hash || '#/list';
        if (h.indexOf('#/list') === 0) return APP.renderList();
        if (h.indexOf('#/add') === 0) return APP.renderAdd();
        if (h.indexOf('#/edit') === 0) return APP.renderEdit();
        location.hash = '#/list';
    };

    /* ========== Common Utilities ========== */

    APP.qs = function(k) {
        try { var part = (location.hash.split('?')[1] || ''); var usp = new URLSearchParams(part); return usp.get(k); } catch (_e) { return null; }
    };
    APP.setMeta = function(t) { if (this.el.$meta && this.el.$meta.length) this.el.$meta.text(t || ''); };

    /* ========== 啟動器 ========== */
    APP.init = function() {
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        if (w.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }

        var env = this.detectEnv_();
        this.var.isDev = env.isDev;
        this.var.isStaging = env.isStaging;
        this.var.envLabel = env.label;

        var self = this;
        this.initLiff().then(function() {
            self.route();
            self.el.$win.on('hashchange', function() { self.route(); });
        });

        // APP.clock
        if (APP.clock && typeof APP.clock.init === 'function') APP.clock.init();
    };
})(window, jQuery);