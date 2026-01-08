/* ==========================================
   FILE: app.main.js
   INCLUDES: app.core, app.clock
   包含 APP 初始化邏輯、環境偵測、LIFF 初始化、Router 路由控制。
   ========================================== */

/* --- SOURCE: app.core.js --- */
/* eslint-env browser, jquery, es2020 */
/*! OrderHub — Core (Consolidated Version) */
;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // --- 1. 定義環境對應的參數池 ---
    const ENV_CONFIG = {
        PROD: {
            LIFF_ID: '2008815338-ikQAWeY4',
            API_URL: 'https://script.google.com/macros/s/AKfycbxORq8QbKIyaWptrhjQfipCRMhysXck4N_s4UTCcRWRsUWVvP_tfePLUIz56sG-L1hQwg/exec?api=1'
        },
        DEV: {
            LIFF_ID: '2008325627-Nk6d1Z64',
            API_URL: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec?api=1'
        }
    };

    // --- 2. 基礎變數初始化 ---
    APP.el = {
        $win: $(window),
        $body: $('body'),
        $main: $('#main'),
        $metaUser: $('#metaUser'),
        $metaEnv: $('#metaEnv')
    };

    APP.var = {
        stranger: '陌生人',
        featureMode: '',
        actor: 'LIFF',
        isStaging: false,
        targetId: '',
        liffReady: false,
        envLabel: 'DEV', // 初始值，稍後由 detectEnv_ 更新
        isDev: true,
        LIFF_ID: '',
        API_URL: ''
    };

    /* ========== A. 環境偵測 (唯一邏輯來源) ========== */
    APP.detectEnv_ = function() {
        var h = location.hostname || '';
        var currentUrl = window.location.href;

        // 1. URL 參數強制切換 (優先度最高)
        var q = new URLSearchParams(window.location.search);
        if (q.get('dev') === '1') return { isDev: true, isStaging: false, label: 'DEV' };
        if (q.get('staging') === '1') return { isDev: false, isStaging: true, label: 'STAGING' };

        // 2. 正式站判斷：比對關鍵網址路徑 (忽略最後的 index.html)
        var isProd = currentUrl.includes('wucl.github.io/prod/mh1491/orderhub/');
        if (isProd) return { isDev: false, isStaging: false, label: 'PROD' };

        // 3. 本地開發判斷
        var isLocal = (h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\./.test(h));
        if (isLocal) return { isDev: true, isStaging: false, label: 'DEV' };

        // 4. 預設測試環境 (如 ngrok 或其他測試站)
        return { isDev: false, isStaging: true, label: 'STAGING' };
    };

    /* ========== B. LIFF 初始化 ========== */
    APP.initLiff = function() {
        var self = this;
        return new Promise(function(resolve) {
            // 如果不是正式站，進入模擬模式
            if (self.var.isDev || self.var.isStaging) {
                self.var.actor = (self.var.envLabel || 'LOCAL') + '-TEST';
                self.setMetaUser('未登入');
                self.setMetaEnv(self.var.envLabel);
                resolve(); return;
            }

            // 正式站邏輯：執行真正的 LIFF
            if (!w.liff || !self.var.LIFF_ID) {
                self.setMetaUser('(未載入 LIFF SDK)'); resolve(); return;
            }

            try {
                liff.init({ liffId: self.var.LIFF_ID }).then(function() {
                    if (!liff.isLoggedIn()) { liff.login(); resolve(); return; }

                    // --- 抓取 Group ID / Room ID ---
                    var context = liff.getContext();
                    if (context) {
                        self.var.targetId = context.groupId || context.roomId || '';

                        // Debug 顯示目標 ID
                        var debugLabel = context.groupId ? "【群組】" + context.groupId : (context.roomId ? "【聊天室】" + context.roomId : "【個人/外部】");
                        $('.for-debug').append('<div>目標 ID: ' + debugLabel + '</div>');
                    }

                    liff.getProfile().then(function(p) {
                        self.var.actor = 'LIFF';
                        self.var.liffReady = true;
                        self.setMetaUser('使用者：' + ((p && p.displayName) || ''));
                        self.setMetaEnv(self.var.envLabel); // 確保標籤正確顯示 PROD
                        resolve();
                    }).catch(function() {
                        self.setMetaUser('(個資讀取失敗)'); resolve();
                    });
                }).catch(function() {
                    self.setMetaUser('(LIFF 啟動失敗)'); resolve();
                });
            } catch (_e) {
                self.setMetaUser('(LIFF 例外錯誤)'); resolve();
            }
        });
    };

    /* ========== C. 路由與選單控制 ========== */
    APP.navHighlight = function() {
        var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
        $('.nav-link').each(function() {
            $(this).toggleClass('active', $(this).attr('data-nav') === name);
        });
    };
    APP.updateBreadcrumb = function(name) {
        var map = { list: '訂單列表', add: '新增訂單', edit: '編輯訂單' };
        $('#breadcrumb .current').text(map[name] || '訂單列表');
    };
    APP.route = function() {
        const h = location.hash || '#/list';
        this.navHighlight();
        var name = (h.replace(/^#\//, '')).split('?')[0];
        this.updateBreadcrumb(name);

        if (h.indexOf('#/list') === 0) { if (this.renderList) return this.renderList(); }
        if (h.indexOf('#/add') === 0) { if (this.renderAdd) return this.renderAdd(); }
        if (h.indexOf('#/edit') === 0) { if (this.renderEdit) return this.renderEdit(); }

        if (this.renderList) this.renderList();
    };

    /* ========== D. 常用輔助函式 ========== */
    APP.qs = function(k) {
        try { var usp = new URLSearchParams(location.hash.split('?')[1] || ''); return usp.get(k); } 
        catch (_e) { return null; }
    };
    APP.setMetaUser = function(t) { if (this.el.$metaUser.length) this.el.$metaUser.text(t || ''); };
    APP.setMetaEnv = function(t) { if (this.el.$metaEnv.length) this.el.$metaEnv.text(t || ''); };

    /* ========== E. 啟動總開關 ========== */
    APP.init = function() {
        // 1. 執行環境偵測
        var env = this.detectEnv_();

        // 2. 更新全域變數與對應 ID
        this.var.isDev = env.isDev;
        this.var.isStaging = env.isStaging;
        this.var.envLabel = env.label;

        var config = (env.label === 'PROD') ? ENV_CONFIG.PROD : ENV_CONFIG.DEV;
        this.var.LIFF_ID = config.LIFF_ID;
        this.var.API_URL = config.API_URL;

        // Debug 資訊
        console.log('[Init] Env detected:', env);
        $('.for-debug').empty().append('<div>環境 JSON: ' + JSON.stringify(env) + '</div>');

        // 3. 初始化 UI 與 LIFF
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        if (w.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }

        var self = this;
        this.initLiff().then(function() {
            self.route();
            self.el.$win.on('hashchange', function() { self.route(); });
        });

        if (APP.clock && typeof APP.clock.init === 'function') APP.clock.init();
    };

})(window, jQuery);