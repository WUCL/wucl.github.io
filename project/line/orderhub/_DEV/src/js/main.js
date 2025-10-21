$(function() {
    var APP = {
        env: 'html',
        el: {
            $win: $(window),
            $body: $('body'),
            // $header: $('#header'),
            $main: $('#main'), // 內頁容器（用 #main 做為 LIFF 的掛載處）
            // $footer: $('#footer'),

            $tabAdd: $('#tab-add'),
            $tabEdit: $('#tab-edit'),
            $meta: $('#meta')
        },
        var: {
            actor: 'LIFF', // 送到後端用的操作人（預設 LIFF，初始化後換成 userId）
            isDev: false,
            isStaging: false,
            envLabel: 'PROD', // DEV / STAGING / PROD

            LIFF_ID: '2008325627-Nk6d1Z64', // ← 改成你的 LIFF ID
            API_URL: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec?api=1', // ← 改成你的 GAS /exec
        },

        /* 入口 */
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            if (window.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }
            console.table({
                envDevice: (window.deviceObj && deviceObj.envDevice) || 'web',
                envMode: (window.deviceObj && deviceObj.name) || 'unknown',
            });

            // 偵測環境 + 徽章
            const env = this.detectEnv_();
            this.var.isDev = env.isDev;
            this.var.isStaging = env.isStaging;
            this.var.envLabel = env.label;
            this.showEnvBadge_(env);

            // LIFF
            this.initLiff().then(() => {
                this.route();
                this.el.$win.on('hashchange', this.route.bind(this));
            });

            this.bindEvent();
        },

        bindEvent: function() {
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

        /* ===== Router ===== */
        route: function() {
            const h = location.hash || '#/add';
            this.el.$tabAdd.toggleClass('active', h.startsWith('#/add'));
            this.el.$tabEdit.toggleClass('active', h.startsWith('#/edit'));
            if (h.startsWith('#/add')) return this.renderAdd();
            if (h.startsWith('#/edit')) return this.renderEdit();
            location.hash = '#/add';
        },

        /* ===== Render: Add ===== */
        renderAdd: function() {
            const frag = TPL.tpl('tpl-add');
            const node = TPL.mount('#main', frag);

            const $form = $('#formAdd');
            const $slot = $form.find('[data-slot="msg"]');

            this.populateAllSelects($form); // ← 一次自動灌入所有 select

            $form.find('[name="訂單日期"]').each(function() {
                if (!this.value) {
                    const today = new Date().toISOString().split('T')[0];
                    this.value = today;
                }
            });

            $form.off('submit').on('submit', async (e) => {
                e.preventDefault();

                const data = this.formToObject($form);
                const $btn  = $form.find('button[type="submit"]');
                const $slot = $form.find('[data-slot="msg"]');

                // 驗證
                const errs = this.validateAddData(data);
                this.showFieldErrors($form, errs);
                this.logValidationDebug('新增訂單', data, errs);

                if (Object.keys(errs).length) {
                    this.renderErrorSummary($slot, errs);
                    this.scrollToFirstError($form);
                    return; // 停止送出
                }

                // 取得 LINE 使用者資訊（若已登入）
                let lineName = '';
                let lineId   = '';

                try {
                    const isDev = location.hostname === 'localhost' || location.hostname.startsWith('192.168.');
                    if (!isDev && window.liff && liff.isLoggedIn && liff.isLoggedIn()) {
                        const profile = await liff.getProfile();
                        lineName = profile.displayName || '';
                        lineId   = profile.userId || '';
                    } else if (isDev) {
                        // 本機測試時給模擬資料
                        lineName = 'DEV-LOCAL';
                        lineId = 'LOCAL-TEST-ID';
                    }
                } catch (e) {
                      console.warn('getProfile error', e);
                      // 補救：如果 LINE 初始化還沒完成，也用模擬資料
                      lineName = 'DEV-FALLBACK';
                      lineId = 'FALLBACK-ID';
                }

                // 送出
                $btn.prop('disabled', true).text('送出中…');
                let res;
                try {
                    res = await this.api('create', {
                        data,
                        actor: this.var.actor,
                        lineName,
                        lineId
                    });
                } catch (err) {
                    console.error('[API] create error:', err);
                    res = { ok: false, msg: 'network-error' };
                }
                $btn.prop('disabled', false).text('送出');

                if (res && res.ok) {
                    $slot.removeClass('err').addClass('msg ok').text('✅ 已建立：' + res.orderId);
                    try {
                        if (window.liff) {
                            await liff.sendMessages([{ type: 'text', text: '✅ 新增訂單：' + res.orderId }]);
                        }
                    } catch (_) {}
                    // 清空表單與錯誤
                    $form[0].reset();
                    this.showFieldErrors($form, {}); // 清錯
                    this.populateAllSelects?.($form); // 重灌 placeholder
                } else {
                    // 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
                    if (res && res.msg === 'invalid-json') {
                        console.warn('[API] invalid-json detail:', {
                            status: res.status, contentType: res.contentType, snippet: res.snippet
                        });
                    }
                    $slot.removeClass('ok').addClass('msg err')
                      .text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));
                }
            });
        },

        /* ===== Render: Edit ===== */
        renderEdit: async function() {
            const id = this.qs('id') || '';
            const frag = TPL.tpl('tpl-edit', { orderId: id });
            const node = TPL.mount('#main', frag);

            const $oid = $('#oid');
            const $btn = $('#btnLoad');
            const $form = $('#formEdit');
            const $slot = $form.find('[data-slot="msg"]');

            $btn.off('click').on('click', () => {
                const target = ($oid.val() || '').trim();
                if (!target) { $slot.html(TPL.msg('請輸入訂單編號', 'err')); return; }
                location.hash = '#/edit?id=' + encodeURIComponent(target);
            });

            if (!id) return; // 等使用者輸入

            const res = await this.api('getOrder', { orderId: id });
            if (!res || !res.ok || !res.order) { $slot.html(TPL.msg('❌ 找不到訂單', 'err')); return; }

            $form.show();
            $form.find('[name]').each(function() {
                const name = this.name;
                if (res.order[name] != null) this.value = res.order[name];
            });

            $form.off('submit').on('submit', async (e) => {
                e.preventDefault();
                const patch = this.formToObject($form);

                const errs = this.validateEditPatch(patch);
                this.showFieldErrors($form, errs);
                if (Object.keys(errs).length) {
                    $slot.html(TPL.msg('請修正紅框欄位後再送出', 'err'));
                    return;
                }

                const $btnSave = $form.find('button[type="submit"]');
                $btnSave.prop('disabled', true).text('儲存中…');

                const r = await this.api('update', { orderId: id, patch, actor: this.var.actor });

                $btnSave.prop('disabled', false).text('儲存更新');

                if (r && r.ok) $slot.html(TPL.msg('✅ 已更新', 'ok'));
                else $slot.html(TPL.msg('❌ 失敗：' + (r && r.msg || '未知錯誤'), 'err'));
            });
        },

        /* ===== API ===== */
        api: async function (action, payload) {
            const url = this.var.API_URL;
            const bodyStr = JSON.stringify(Object.assign({ action }, payload || {}));

            // 小工具：寬鬆 JSON 解析（strip BOM/XSSI、擷取花括號區間）
            function parseJSONLoose(s) {
                if (typeof s !== 'string') return null;
                let t = s.replace(/^\uFEFF/, '');         // BOM
                t = t.replace(/^\)\]\}',?\s*/, '');       // XSSI 前綴
                try { return JSON.parse(t); } catch (e) {}
                const i = t.indexOf('{'); const j = t.lastIndexOf('}');
                if (i >= 0 && j > i) {
                  try { return JSON.parse(t.slice(i, j + 1)); } catch (e) {}
                }
                return null;
            }

            try {
                const res = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 避免 preflight
                  body: bodyStr,
                  redirect: 'follow',
                });

                const status = res.status;
                const ct = (res.headers.get('content-type') || '').toLowerCase();
                const text = await res.text();

                console.groupCollapsed(`[API] POST ${url} → ${status} (${ct})`);
                console.log('request body =', bodyStr);
                console.log('raw response =', text);
                console.groupEnd();

                // 嘗試寬鬆解析
                const json = parseJSONLoose(text);
                if (json && typeof json === 'object') return json;

                // 不是 JSON，就回診斷物件
                return {
                  ok: false,
                  msg: 'invalid-json',
                  status,
                  contentType: ct,
                  snippet: (text || '').slice(0, 400) // UI 顯示前 400 字方便判讀
                };
            } catch (e) {
                console.error('[API] fetch error:', e);
                return { ok: false, msg: 'network-error', err: String(e) };
            }
        },

        /* ===== Utils ===== */
        formToObject: function($form) {
            const out = {};
            ($form.serializeArray() || []).forEach(p => out[p.name] = p.value);
            return out;
        },
        qs: function(k) { const q = new URLSearchParams((location.hash.split('?')[1] || '')); return q.get(k); },
        setMeta: function(t) { this.el.$meta.text(t || ''); },

        // 塞進單一 <select>
        populateSelect: function($select, items, opts) {
            const el = $select[0];
            if (!el) return;
            const doc = document;
            const ph = ($select.attr('data-placeholder') || '請選擇');
            const withOther = $select.attr('data-with-other') == '1';

            el.innerHTML = '';
            // placeholder
            const phOpt = doc.createElement('option');
            phOpt.value = '';
            phOpt.text = ph;
            phOpt.disabled = true;
            phOpt.selected = true;
            el.appendChild(phOpt);

            // items: ["A","B"] 或 [{value,label}]
            (items || []).forEach(it => {
                const v = (typeof it === 'string') ? it : (it.value ?? it.label);
                const l = (typeof it === 'string') ? it : (it.label ?? it.value);
                if (!v) return;
                const opt = doc.createElement('option');
                opt.value = v;
                opt.text = l;
                el.appendChild(opt);
            });

            if (withOther) {
                const o = doc.createElement('option');
                o.value = '__OTHER__';
                o.text = '其他（請填備註）';
                el.appendChild(o);
            }
        },

        // 🔑 一次掃描容器內所有 [data-opt]，自動填入對應 options
        populateAllSelects: function($scope) {
            const self = this;
            ($scope || $(document)).find('select[data-opt]').each(function() {
                const key = $(this).attr('data-opt');
                const items = self.getOptionsStatic(key);
                self.populateSelect($(this), items);
            });
        },

        // 取靜態 options（之後可改 API 讀取）
        getOptionsStatic: function(key) {
            return (window.ORDER_OPTIONS && window.ORDER_OPTIONS[key]) ? window.ORDER_OPTIONS[key] : [];
        },

        validateAddData: function(data) {
            const errs = {};
            const $form = $('#formAdd'); // ← 指向目前新增用的 form

            // 安全檢查器：欄位存在才驗證
            const hasField = (name) => $form.find('[name="' + name + '"]').length > 0;

            // 接單平台（必填）
            if (hasField('接單平台') && !data['接單平台']) errs['接單平台'] = '請選擇接單平台';

            // 訂購人姓名（至少 2 字）
            if (hasField('訂購人姓名') && (!data['訂購人姓名'] || data['訂購人姓名'].trim().length < 2)) errs['訂購人姓名'] = '至少 2 個字';

            // 訂購人電話（必填 + 格式）
            if (hasField('訂購人電話')) {
                if (!data['訂購人電話']) {
                    errs['訂購人電話'] = '必填';
                } else {
                    const phone = data['訂購人電話'].replace(/\s/g, '');
                    if (!/^(\+?886-?|0)?[0-9\-]{8,13}$/.test(phone)) {
                        errs['訂購人電話'] = '電話格式不正確';
                    }
                }
            }

             // 訂單金額（數字）
            if (hasField('訂單金額')) {
                const amt = Number(data['訂單金額']);
                if (!(amt >= 0)) errs['訂單金額'] = '請輸入數字';
            }

            // 交貨日期（可空；若填則 YYYY-MM-DD）
            if (hasField('交貨日期') && data['交貨日期'] && !/^\d{4}-\d{2}-\d{2}$/.test(data['交貨日期'])) errs['交貨日期'] = '日期格式需為 YYYY-MM-DD';

            return errs;
        },

        validateEditPatch: function(patch) {
            const errs = {};
            if ('貨運單號' in patch && patch['貨運單號'] && patch['貨運單號'].length > 50) errs['貨運單號'] = '字數過長';
            if ('是否已付款' in patch && !/^(未付款|已付款|貨到付款)$/.test(patch['是否已付款'])) errs['是否已付款'] = '選項不合法';
            if ('是否已交貨' in patch && !/^(未交貨|已交貨)$/.test(patch['是否已交貨'])) errs['是否已交貨'] = '選項不合法';
            return errs;
        },
        showFieldErrors: function($form, errs) {
            // 清除舊錯誤
            $form.find('.field-error').remove();
            $form.find('input,select,textarea').removeClass('is-error').attr('aria-invalid', 'false');
            $form.find('.field').removeClass('has-error');

            // 畫出新錯誤
            Object.keys(errs).forEach(function(name) {
                const $el = $form.find('[name="' + name + '"]');
                if ($el.length) {
                    $el.addClass('is-error').attr('aria-invalid', 'true');
                    $el.closest('.field').addClass('has-error');
                    $el.after('<div class="field-error">' + errs[name] + '</div>');
                }
            });
        },
        // 將錯誤顯示在表單頂部 slot（同時回傳條目陣列）
        renderErrorSummary: function($slot, errs) {
            const keys = Object.keys(errs);
            if (!keys.length) { $slot.empty(); return keys; }

            const list = keys.map(k => `<li><strong>${k}</strong>：${errs[k]}</li>`).join('');
            const html = `<div class="msg err">
            請修正下列欄位後再送出：
            <ul style="margin:6px 0 0 18px">${list}</ul>
            </div>`;
            $slot.html(html);
            return keys;
        },

        // 在 console 檢查錯誤與目前值
        logValidationDebug: function(context, data, errs) {
            try {
                console.groupCollapsed(`[Validate] ${context} — 共 ${Object.keys(errs).length} 筆錯誤`);
                console.log('表單值 =', data);
                if (Object.keys(errs).length) console.table(errs);
                console.groupEnd();
            } catch (_) {}
        },

        // 捲到第一個錯誤並聚焦
        scrollToFirstError: function($form) {
            const $first = $form.find('.is-error').first();
            if ($first.length) {
                $first[0].focus?.();
                $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },


        /* ===== Env & LIFF ===== */
        detectEnv_: function() {
            const h = location.hostname || '',
                proto = location.protocol || '',
                q = new URLSearchParams(location.search || '');
            if (q.get('dev') === '1') return { isDev: true, isStaging: false, label: 'DEV' };
            if (q.get('staging') === '1') return { isDev: false, isStaging: true, label: 'STAGING' };
            const isLocal = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) || /\.local$/.test(h) || /\.test$/.test(h));
            const looksStaging = /ngrok\.io$/.test(h) || /ngrok-free\.app$/.test(h) || (/\.vercel\.app$/.test(h) && /-(git|preview)/i.test(h)) || (/\.netlify\.app$/.test(h) && /--/.test(h)) || /\.cloudfront\.net$/.test(h);
            if (isLocal) return { isDev: true, isStaging: false, label: 'DEV' };
            if (looksStaging) return { isDev: false, isStaging: true, label: 'STAGING' };
            return { isDev: false, isStaging: false, label: 'PROD' };
        },
        showEnvBadge_: function(env) {
            if (!(env.isDev || env.isStaging)) return;
            if (document.getElementById('env-badge')) return;
            const frag = TPL.tpl('tpl-badge', { label: env.label });
            TPL.mount(document.body, frag, false);
            $('#env-badge').on('click', function() { $(this).remove(); });
        },
        initLiff: async function() {
            // DEV/STAGING 與私網一律略過登入
            const h = location.hostname || '',
                proto = location.protocol || '';
            const isPrivate = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h));
            if (this.var.isDev || this.var.isStaging || isPrivate) {
                this.var.actor = (this.var.envLabel || 'LOCAL') + '-TEST';
                this.setMeta(`（${this.var.envLabel} 模式，未登入）`);
                return;
            }
            if (!window.liff || !this.var.LIFF_ID || this.var.LIFF_ID.indexOf('REPLACE_') === 0) { this.setMeta('(未啟用 LIFF)'); return; }
            try {
                await liff.init({ liffId: this.var.LIFF_ID });
                if (!liff.isLoggedIn()) { liff.login(); return; }
                const p = await liff.getProfile();
                this.var.actor = 'LIFF';// p.userId || 'LIFF';
                this.setMeta('使用者：' + (p.displayName || ''));
            } catch (e) {
                this.setMeta('(LIFF 初始化失敗)');
                console.warn(e);
            }
        }
    };
    APP.init();
});