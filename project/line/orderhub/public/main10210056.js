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
            LIFF_ID: 'REPLACE_WITH_YOUR_LIFF_ID', // ← 改成你的 LIFF ID
            API_URL: 'https://script.google.com/macros/s/REPLACE_WITH_EXEC/exec', // ← 改成你的 GAS /exec
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

            this.bindEvent();
            this.initLiff().then(() => {
                this.route();                              // 初始路由
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
            if (!window.liff || !this.var.LIFF_ID || this.var.LIFF_ID.indexOf('REPLACE_') === 0) {
                // 沒有 LIFF SDK 或尚未填 LIFF_ID，就當一般網頁用
                this.setMeta('(未啟用 LIFF)');
                return;
            }
            try {
                await liff.init({ liffId: this.var.LIFF_ID });
                if (!liff.isLoggedIn()) liff.login();
                const profile = await liff.getProfile();
                this.var.actor = profile.userId || 'LIFF';
                this.setMeta('使用者：' + (profile.displayName || ''));
            } catch (e) {
                this.setMeta('(LIFF 初始化失敗)');
                console.warn('LIFF init error:', e);
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
            }.bind(this));
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