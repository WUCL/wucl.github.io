$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $nav: $('#nav'),

            // 內頁容器（用 #main 做為 LIFF 的掛載處）
            $meta: $('#meta'),          // 顯示使用者名稱（若不存在就略過）
            $tabs: $('.tab'),           // 若你有 .tab 切換鈕
            $tabAdd: $('#tab-add'),
            $tabEdit: $('#tab-edit'),
        },
        var: {
            isDev: false,
            isStaging: false,
            envLabel: 'PROD',   // DEV / STAGING / PROD

            LIFF_ID: '2008325627-Nk6d1Z64', // ← 改成你的 LIFF ID
            API_URL: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec', // ← 改成你的 GAS /exec
            actor: 'LIFF',               // 送到後端用的操作人（預設 LIFF，初始化後換成 userId）
        },

        /* 入口 */
        init: function () {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            if (window.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }
            console.table({
                envDevice: (window.deviceObj && deviceObj.envDevice) || 'web',
                envMode: (window.deviceObj && deviceObj.name) || 'unknown',
            });

            // 先偵測環境，顯示徽章＋套用 body class
            const env = this.detectEnv_();
            this.var.isDev = env.isDev;
            this.var.isStaging = env.isStaging;
            this.var.envLabel = env.label;
            this.el.$body.addClass(env.isDev ? 'env-dev' : (env.isStaging ? 'env-staging' : 'env-prod'));
            this.showEnvBadge_(env);

            this.bindEvent();
            this.initLiff().then(() => {
                this.route();   // 初始路由
                this.el.$window.on('hashchange', this.route.bind(this));
            });
        },

        bindEvent: function () {
            let $this = this;

            // switch menu
            // if ($this.el.$navSwitch && $this.el.$navSwitch.length) {
            //     $this.el.$navSwitch.on('click', function () {
            //         $this.el.$body.toggleClass('openheader');
            //     });
            // }
            // if ($this.el.$nav && $this.el.$nav.length) {
            //     $this.el.$nav.on('click', function () {
            //         $this.el.$body.removeClass('openheader');
            //     });
            // }
        },

        /* ====== LIFF 初始化 ====== */
        initLiff: async function () {
            // 在 DEV 或 STAGING 下，預設略過登入（避免本機一直跳 LINE Login）
            if (this.var.isDev || this.var.isStaging) {
                console.log(`[LIFF] ${this.var.envLabel} 模式，略過登入流程`);
                this.var.actor = this.var.envLabel + '-TEST';
                this.setMeta(`（${this.var.envLabel} 模式，未登入）`);
                return;
            }

            // PROD 才走正式登入
            if (!window.liff || !this.var.LIFF_ID || this.var.LIFF_ID.indexOf('REPLACE_') === 0) {
                this.setMeta("(未啟用 LIFF)");
                return;
            }

            try {
                await liff.init({ liffId: this.var.LIFF_ID });
                if (!liff.isLoggedIn()) {
                    console.log("[LIFF] 未登入，準備跳轉登入...");
                    liff.login();
                    return;
                }
                const profile = await liff.getProfile();
                this.var.actor = profile.userId || "LIFF";
                this.setMeta("使用者：" + (profile.displayName || ""));
                console.log("[LIFF] 登入成功：" + profile.displayName);
            } catch (e) {
                this.setMeta("(LIFF 初始化失敗)");
                console.warn("LIFF init error:", e);
            }
        },

        /* ====== LIFF 初始化（支援本機免登入） ====== */
        initLiff: async function () {
            // 🧩 偵測是否為本機或測試環境
            const isLocal =
                location.hostname === "localhost" ||
                location.hostname === "127.0.0.1" ||
                location.protocol === "file:";

            if (isLocal) {
                console.log("[LIFF] 本機開發模式，略過登入流程");
                this.var.actor = "LOCAL-TEST";
                this.setMeta("（本機測試模式，未登入）");
                return;
            }

            // 🚀 線上模式：執行正式的 LIFF 流程
            if (!window.liff || !this.var.LIFF_ID || this.var.LIFF_ID.indexOf("REPLACE_") === 0) {
                this.setMeta("(未啟用 LIFF)");
                return;
            }

            try {
                await liff.init({ liffId: this.var.LIFF_ID });
                if (!liff.isLoggedIn()) {
                    console.log("[LIFF] 未登入，準備跳轉登入...");
                    liff.login();
                    return;
                }

                const profile = await liff.getProfile();
                this.var.actor = profile.userId || "LIFF";
                this.setMeta("使用者：" + (profile.displayName || ""));
                console.log("[LIFF] 登入成功：" + profile.displayName);

            } catch (e) {
                this.setMeta("(LIFF 初始化失敗)");
                console.warn("LIFF init error:", e);
            }
        },

        /* ====== Router：#/add 與 #/edit?id=... ====== */
        route: function () {
            const h = location.hash || '#/add';
            if (this.el.$tabs && this.el.$tabs.length) {
                this.el.$tabs.removeClass('active');
                if (h.indexOf('#/add') === 0 && this.el.$tabAdd.length) this.el.$tabAdd.addClass('active');
                if (h.indexOf('#/edit') === 0 && this.el.$tabEdit.length) this.el.$tabEdit.addClass('active');
            }
            if (h.indexOf('#/add') === 0) return this.renderAdd();
            if (h.indexOf('#/edit') === 0) return this.renderEdit();
            location.hash = '#/add';
        },

        /* ====== 新增頁 ====== */
        renderAdd: function () {
            const html = [
            '<form id="fAdd">',
            '  <div class="row">',
            '    <div>',
            '      <label>接單平台</label>',
            '      <input name="接單平台" placeholder="LINE/Shopee" required>',
            '    </div>',
            '    <div>',
            '      <label>交貨日期 <span class="hint">（可留空）</span></label>',
            '      <input name="交貨日期" type="date">',
            '    </div>',
            '  </div>',
            '  <label>訂購人姓名</label>',
            '  <input name="訂購人姓名" required>',
            '  <label>訂購人電話</label>',
            '  <input name="訂購人電話" inputmode="tel" required>',
            '  <label>訂單金額</label>',
            '  <input name="訂單金額" type="number" min="0" step="1" required>',
            '  <label>商品項目</label>',
            '  <input name="商品項目" placeholder="SKU×數量…">',
            '  <label>訂單備註</label>',
            '  <textarea name="訂單備註" rows="3"></textarea>',
            '  <button class="primary" type="submit">送出</button>',
            '  <div class="msg" id="msgAdd"></div>',
            '</form>'
            ].join('\n');

            this.el.$main.html(html);
            var $form = $('#fAdd');
            var $msg = $('#msgAdd');

            $form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                const data = this.formToObject($form);
                if (!data['訂購人電話'] || !data['訂單金額']) {
                    return this.showMsg($msg, '請填電話與金額', 'err');
                }

                const res = await this.api('create', { data, actor: this.var.actor });
                if (res && res.ok) {
                    this.showMsg($msg, '✅ 已建立：' + res.orderId, 'ok');
                    try { if (window.liff) { await liff.sendMessages([{ type: 'text', text: '✅ 新增訂單：' + res.orderId }]); } } catch (_) { }
                    $form[0].reset();
                } else {
                    this.showMsg($msg, '❌ 失敗：' + (res && res.msg || '未知錯誤'), 'err');
                }
            });
        },

        /* ====== 編輯頁 ====== */
        renderEdit: async function () {
            const id = this.qs('id') || '';
            const html = [
                '<div style="margin-bottom:8px; font-size:14px; color:#666">請在網址加上 <code>#/edit?id=訂單編號</code> 或由卡片按「編輯」開啟。</div>',
                '<div class="row">',
                '  <div>',
                '    <label>訂單編號</label>',
                '    <input id="oid" placeholder="O-YYYYMM-00001" value="' + this.escape(id) + '">',
                '  </div>',
                '  <div style="display:flex;align-items:end">',
                '    <button type="button" id="btnLoad">載入</button>',
                '  </div>',
                '</div>',
                '<form id="fEdit" style="display:none">',
                '  <label>是否已付款</label>',
                '  <select name="是否已付款">',
                '    <option>未付款</option><option>已付款</option><option>貨到付款</option>',
                '  </select>',
                '  <label>是否已交貨</label>',
                '  <select name="是否已交貨">',
                '    <option>未交貨</option><option>已交貨</option>',
                '  </select>',
                '  <label>貨運單號</label>',
                '  <input name="貨運單號">',
                '  <label>訂單備註</label>',
                '  <textarea name="訂單備註" rows="3"></textarea>',
                '  <button class="primary" type="submit">儲存更新</button>',
                '  <div class="msg" id="msgEdit"></div>',
                '</form>'
            ].join('\n');

            this.el.$main.html(html);
            var $btnLoad = $('#btnLoad');
            var $oid = $('#oid');
            var $form = $('#fEdit');
            var $msg = $('#msgEdit');

            // 事件：載入指定 id
            $btnLoad.off('click').on('click', () => {
                var target = ($oid.val() || '').trim();
                if (!target) return this.showMsg($msg, '請輸入訂單編號', 'err');
                location.hash = '#/edit?id=' + encodeURIComponent(target);
            });

            if (!id) return; // 沒 id 就等使用者輸入

            // 讀單
            const res = await this.api('getOrder', { orderId: id });
            if (!res || !res.ok || !res.order) {
                return this.showMsg($msg, '❌ 找不到訂單', 'err');
            }
            $form.show();

            // 填值
            $form.find('[name]').each(function () {
                var name = $(this).attr('name');
                if (res.order[name] != null) $(this).val(res.order[name]);
            });

            // 送出更新
            $form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                const patch = this.formToObject($form);
                const r = await this.api('update', { orderId: id, patch, actor: this.var.actor });
                if (r && r.ok) this.showMsg($msg, '✅ 已更新', 'ok');
                else this.showMsg($msg, '❌ 失敗：' + (r && r.msg || '未知錯誤'), 'err');
            });

        },

        /* ====== API 呼叫 ====== */
        api: async function (action, payload) {
            try {
                const res = await fetch(this.var.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify($.extend({ action: action }, payload || {}))
                });
                return await res.json();
            } catch (e) {
                console.warn('API error:', e);
                return { ok: false, msg: 'network-error' };
            }
        },

        /* ====== 小工具 ====== */

        /* ====== 自動偵測環境（DEV / STAGING / PROD）====== */
        detectEnv_: function () {
            const h = location.hostname || '';
            const proto = location.protocol || '';
            const hash = location.hash || '';
            const search = location.search || '';
            const q = new URLSearchParams(search);

            // 允許用 query 強制覆寫
            if (q.get('dev') === '1')  return { isDev:true,  isStaging:false, label:'DEV', reason:'?dev=1' };
            if (q.get('staging') === '1') return { isDev:false, isStaging:true,  label:'STAGING', reason:'?staging=1' };

            // 本機 / 檔案
            const isLocal = (proto === 'file:') || h === 'localhost' || h === '127.0.0.1' || /\.local$/.test(h) || /\.test$/.test(h);

            // 常見臨時/預覽域名（視你的流程可調整）
            const looksLikeStaging =
                /ngrok\.io$/.test(h) ||
                /ngrok-free\.app$/.test(h) ||
                /\.vercel\.app$/.test(h) && /-(git|preview)/i.test(h) ||
                /\.netlify\.app$/.test(h) && /--/.test(h) ||
                /\.cloudfront\.net$/.test(h);

            if (isLocal) return { isDev:true, isStaging:false, label:'DEV', reason:'local' };
            if (looksLikeStaging) return { isDev:false, isStaging:true, label:'STAGING', reason:'preview-domain' };

            return { isDev:false, isStaging:false, label:'PROD', reason:'default' };
        },

        /* ====== 右上角環境徽章 ====== */
        showEnvBadge_: function (env) {
            // 只在 DEV / STAGING 顯示徽章
            if (!(env.isDev || env.isStaging)) return;

            // 若已存在就不重複插入
            if (document.getElementById('env-badge')) return;

            const badge = document.createElement('div');
            badge.id = 'env-badge';
            badge.textContent = env.label;
            badge.style.cssText = [
                'position:fixed','top:10px','right:10px','z-index:9999',
                'padding:6px 10px','border-radius:999px',
                'font:600 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Noto Sans,Helvetica,Arial',
                'letter-spacing:.5px','box-shadow:0 2px 8px rgba(0,0,0,.12)',
                'cursor:pointer','user-select:none'
            ].join(';');

            // 色系
            if (env.isDev) {
                badge.style.background = '#FFEFD5';
                badge.style.border = '1px solid #F59E0B';
                badge.style.color = '#92400E';
            } else {
                badge.style.background = '#E5F3FF';
                badge.style.border = '1px solid #3B82F6';
                badge.style.color = '#1E3A8A';
            }

            // 點擊關閉
            badge.title = '點我關閉徽章（僅本次）';
            // badge.addEventListener('click', () => badge.remove());

            document.body.appendChild(badge);
        },


        formToObject: function ($form) {
            var out = {};
            ($form.serializeArray() || []).forEach(function (p) { out[p.name] = p.value; });
            return out;
        },
        qs: function (k) {
            // 從 hash 的 query 抓參數：#/edit?id=O-xxxx
            var hash = location.hash || '';
            var q = hash.split('?')[1] || '';
            var params = new URLSearchParams(q);
            return params.get(k);
        },
        showMsg: function ($el, text, cls) {
            $el.removeClass('ok err').addClass(cls || '').text(text || '');
        },
        setMeta: function (t) {
            if (this.el.$meta && this.el.$meta.length) this.el.$meta.text(t);
        },
        escape: function (s) {
            return String(s || '').replace(/[&<>"']/g, function (c) {
                return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
            });
        },
    };
    MAIN.init();
});