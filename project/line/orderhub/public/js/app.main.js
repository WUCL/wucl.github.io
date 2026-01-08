/* ==========================================
   FILE: app.main.js
   包含 APP 初始化邏輯、環境偵測、LIFF 初始化。
   ========================================== */

;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // --- 1. 環境配置 (正式與測試兩套 ID) ---
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

    APP.el = {
        $win: $(window),
        $body: $('body'),
        $main: $('#main'),
        $metaUser: $('#metaUser'),
        $metaEnv: $('#metaEnv')
    };

    APP.var = {
        stranger: '陌生人',
        actor: 'LIFF',
        targetId: '',
        liffReady: false,
        envLabel: 'DEV', // 只有 DEV 或 PROD
        LIFF_ID: '',
        API_URL: ''
    };

    /* ========== A. 環境偵測 ========== */
    APP.detectEnv_ = function() {
        var h = location.hostname || '';
        var currentUrl = window.location.href;

        // 1. 判斷是否為正式站路徑
        var isProd = currentUrl.includes('/prod/mh1491/orderhub/');

        // 2. 判斷是否為本機開發環境 (localhost / 127.0.0.1 / 192.168.x.x)
        var isLocal = (h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h));

        return {
            label: isProd ? 'PROD' : 'DEV',
            isLocal: isLocal
        };
    };

    /* ========== B. LIFF 初始化 ========== */
    APP.initLiff = function(isLocal) {
        var self = this;
        return new Promise(function(resolve) {
            // 顯示當前環境標籤 (DEV 或 PROD)
            self.setMetaEnv(self.var.envLabel);

            // 【邏輯：只有在本機且是 DEV 模式時，才跳過登入】
            if (isLocal && self.var.envLabel === 'DEV') {
                self.var.actor = 'LOCAL-TEST';
                self.setMetaUser('本地開發模式 (未登入)');
                resolve(); return;
            }

            // 只要不是本機，或是正式站，就執行 LINE 登入
            if (!w.liff) { self.setMetaUser('(未載入 SDK)'); resolve(); return; }

            liff.init({ liffId: self.var.LIFF_ID }).then(function() {
                if (!liff.isLoggedIn()) { liff.login(); resolve(); return; }

                // 抓取 Group / Room ID
                var context = liff.getContext();
                if (context) {
                    self.var.targetId = context.groupId || context.roomId || '';
                    var debugLabel = context.groupId ? "【群組】" + context.groupId : (context.roomId ? "【聊天室】" + context.roomId : "【個人/外部】");
                    $('.for-debug').append('<div>' + debugLabel + ' :: ' + self.var.targetId + '</div>');
                }

                liff.getProfile().then(function(p) {
                    self.var.actor = 'LIFF';
                    self.var.liffReady = true;
                    self.setMetaUser('使用者：' + (p.displayName || ''));
                    resolve();
                }).catch(function() { self.setMetaUser('(讀取個資失敗)'); resolve(); });
            }).catch(function(err) {
                self.setMetaUser('(LIFF 啟動失敗)');
                console.error(err);
                resolve();
            });
        });
    };

    /* ========== C. 啟動核心 ========== */
    APP.init = function() {
        // 1. 偵測環境
        var env = this.detectEnv_();
        this.var.envLabel = env.label;

        // 2. 根據環境標籤分配 ID 與 API
        var config = (env.label === 'PROD') ? ENV_CONFIG.PROD : ENV_CONFIG.DEV;
        this.var.LIFF_ID = config.LIFF_ID;
        this.var.API_URL = config.API_URL;

        if (w.deviceObj) this.el.$body.addClass(deviceObj.name);

        var self = this;
        // 傳入是否為本機的判斷
        this.initLiff(env.isLocal).then(function() {
            self.route();
            self.el.$win.on('hashchange', function() { self.route(); });
        });

        if (APP.clock) APP.clock.init();
    };

    /* ========== D. Router & UI Helpers (保持不變) ========== */
    APP.navHighlight = function() {
        var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
        $('.nav-link').each(function() { $(this).toggleClass('active', $(this).attr('data-nav') === name); });
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
    APP.setMetaUser = function(t) { if (this.el.$metaUser.length) this.el.$metaUser.text(t || ''); };
    APP.setMetaEnv = function(t) { if (this.el.$metaEnv.length) this.el.$metaEnv.text(t || ''); };

})(window, jQuery);