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
        userName: '',
        stranger: '陌生人',
        actor: 'LIFF',
        targetId: '',
        liffReady: false,
        envLabel: 'DEV', // 只有 DEV 或 PROD
        LIFF_ID: '',
        API_URL: '',

        isFetchingList: false,
        isFetchingSummary: false,
        cache: {
            summary: null, // 用來存放 Dashboard 的數據
            list: {} // 改為物件，用來儲存不同篩選條件的結果
        }
    };

    /* ========== A. 環境偵測 ========== */
    APP.detectEnv_ = function() {
        var h = location.hostname || '';
        var currentUrl = window.location.href;

        // 1. 判斷是否為正式站路徑
        var isProd = currentUrl.includes('/prod/mh1491/orderhub/');

        // 2. 判斷是否為本機環境 (isLocal)
        // 涵蓋範圍：
        // - localhost / 127.0.0.1
        // - 10.x.x.x (內網)
        // - 172.16.x.x ~ 172.31.x.x (內網，涵蓋你的 172.20.10.4)
        // - 192.168.x.x (內網)
        // - *.local (Mac/iOS 常用域名)
        var isLocal = (
            h === 'localhost' ||
            h === '127.0.0.1' ||
            h.endsWith('.local') ||
            /^10\./.test(h) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) ||
            /^172\.20\./.test(h) || // 針對你目前的網段加強判斷
            /^192\.168\./.test(h)
        );

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
                self.var.liffReady = false;
                self.setMetaUser('本地開發模式 (未登入)');
                console.log('--- [Local Mode Detected] Skip LIFF ---');
                resolve(); return;
            }

            // 只要不是本機，或是正式站，就執行 LINE 登入
            if (!w.liff) { self.setMetaUser('(未載入 SDK)'); resolve(); return; }

            liff.init({ liffId: self.var.LIFF_ID }).then(function() {
                if (!liff.isLoggedIn()) { liff.login(); resolve(); return; }

                // 抓取 Group / Room / User ID
                var context = liff.getContext();
                if (context) {
                    // 優先順序：群組 ID > 聊天室 ID > 個人 User ID > 空值
                    self.var.targetId = context.groupId || context.roomId || context.userId || '';

                    // 根據 type 決定顯示的標籤名稱
                    var debugLabel = "";
                    if (context.groupId) { debugLabel = "【群組】"; }
                    else if (context.roomId) { debugLabel = "【聊天室】"; }
                    else { debugLabel = "【個人/外部】"; }

                    $('.for-debug').append('<div>' + debugLabel + (self.var.targetId || '無法取得ID') + '</div>');

                    console.log('[LIFF] Context Type:', context.type);
                    console.log('[LIFF] Target ID:', self.var.targetId);
                }

                liff.getProfile().then(function(p) {
                    self.var.actor = 'LIFF';
                    self.var.liffReady = true;
                    self.var.userName = p.displayName;
                    self.var.userId = p.userId;
                    self.setMetaUser(p.displayName || '');
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
        console.log(env);

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

        // --- 綁定重新整理按鈕 ---
        $(document).on('click', '#btn-refresh', function(e) {
            e.preventDefault();
            var $btn = $(this);

            // 1. 清空記憶體快取
            APP.clearCache();

            // 2. 清空手機儲存空間 (Persistent Cache)
            localStorage.removeItem('LAST_DATA_VERSION');
            localStorage.removeItem('CACHE_SUMMARY');

            // 3. 額外保險：清空所有以 CACHE_LIST_ 或 PERSIST_LIST_ 開頭的項目
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('CACHE_LIST_') || key.startsWith('PERSIST_LIST_')) {
                    localStorage.removeItem(key);
                }
            });

            // 4. 視覺回饋與狀態啟動
            $btn.addClass('is-loading');
            if (APP.status?.start) APP.status.start('手動強制更新全站資料');

            // 5. 重新驅動路由 (這時因為快取已空，會強迫跑 API)
            APP.route();

            // 6. 延遲恢復按鈕樣式
            setTimeout(function() {
                $btn.removeClass('is-loading');
            }, 1000);
        });

        // --- 綁定新增訂單按鈕 ---
        $(document).on('click', '#btn-createOrder', function(e) {
            // 如目前已在新增頁面時
            if (window.location.hash.indexOf('#/add') === 0) { $('.msg[data-slot="msg"]').removeClass('ok err').empty(); }
            if (typeof APP.scrollTop === 'function') { APP.scrollTop(); }
        });
    };

    /* ========== D. Router & UI Helpers ========== */
    APP.navHighlight = function() {
        var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
        $('.nav-link').each(function() { $(this).toggleClass('active', $(this).attr('data-nav') === name); });
    };

    // APP.updateBreadcrumb = function(name) {
    //     var map = { list: '訂單列表', add: '新增訂單', edit: '編輯訂單' };
    //     $('#breadcrumb .current').text(map[name] || '訂單列表');
    // };
    APP.updateBreadcrumb = function(name) {
        // var map = { dashboard: '數據總覽', list: '訂單列表', add: '新增訂單', edit: '編輯訂單' };
        // $('#breadcrumb .current').text(map[name] || '數據總覽');

        // 1. 先移除所有 li 的 current 類別
        var $breadcrumb = $('#breadcrumb');
        $breadcrumb.find('li').removeClass('current');

        // 2. 決定誰該亮起來
        // 如果是 add 或 edit，通常邏輯上屬於「訂單列表」的子項目，所以讓「訂單列表」亮起
        var activeRoute = name;
        if (name === 'add' || name === 'edit') {
            activeRoute = 'list';
        }

        // 3. 根據 activeRoute 找到對應的 li 並加上 current
        $breadcrumb.find('li[data-route="' + activeRoute + '"]').addClass('current');
    };

    APP.route = function() {
        // landing page
        const h = location.hash || '#/dashboard'; // '#/list';

        this.navHighlight();
        var name = (h.replace(/^#\//, '')).split('?')[0];
        this.updateBreadcrumb(name);

        if (h.indexOf('#/dashboard') === 0) { if (this.renderDashboard) return this.renderDashboard(); }

        if (h.indexOf('#/list') === 0) { if (this.renderList) return this.renderList(); }
        if (h.indexOf('#/add') === 0) { if (this.renderAdd) return this.renderAdd(); }
        if (h.indexOf('#/edit') === 0) { if (this.renderEdit) return this.renderEdit(); }

        // 預設回首頁
        // if (this.renderList) this.renderList();
        if (this.renderDashboard) this.renderDashboard();
    };
    APP.setMetaUser = function(t) { if (this.el.$metaUser.length) this.el.$metaUser.text(t || ''); };
    APP.setMetaEnv = function(t) { if (this.el.$metaEnv.length) this.el.$metaEnv.text(t || ''); };

})(window, jQuery);