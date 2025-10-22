/* eslint-env browser, jquery, es2020 */
/* global TPL, liff, deviceObj */
$(function() {
    'use strict';

    var APP = {
        env: 'html',
        el: {
            $win: $(window),
            $body: $('body'),
            $main: $('#main'),
            $meta: $('#meta')
        },
        var: {
            actor: 'LIFF', // 送到後端用的操作人（預設 LIFF，初始化後換成 userId）
            isDev: false,
            isStaging: false,
            envLabel: 'PROD', // DEV / STAGING / PROD
            LIFF_ID: '2008325627-Nk6d1Z64', // ← 改成你的 LIFF ID
            API_URL: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec?api=1' // ← 改成你的 GAS /exec
        },

        /* 入口 */
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            if (window.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }
            try {
                // 若你的 ESLint 不允許 console，可在專案層級關掉 no-console 或這裡加 // eslint-disable-next-line no-console
                console.table({
                    envDevice: (window.deviceObj && deviceObj.envDevice) || 'web',
                    envMode: (window.deviceObj && deviceObj.name) || 'unknown'
                });
            } catch (e) {}

            // 偵測環境 + 徽章
            var env = this.detectEnv_();
            this.var.isDev = env.isDev;
            this.var.isStaging = env.isStaging;
            this.var.envLabel = env.label;
            this.showEnvBadge_(env);

            // LIFF
            var self = this;
            this.initLiff().then(function() {
                self.route();
                self.el.$win.on('hashchange', function() { self.route(); });
            });

            this.bindEvent();
        },

        bindEvent: function() {
            // 保留位置（未使用）
        },

        /* ===== Router ===== */
        navHighlight: function() {
            var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
            var links = document.querySelectorAll('.nav-link');
            for (var i = 0; i < links.length; i++) {
                var el = links[i];
                el.classList.toggle('active', el.getAttribute('data-nav') === name);
            }
        },

        route: function() {
            // 預設導向 list
            if (!location.hash) { location.hash = '#/list'; }
            this.navHighlight();

            var h = (location.hash || '').replace(/^#\//, '');
            var name = h.split('?')[0];

            if (name === 'add') { this.renderAdd(); return; }
            // 預設：list（如果你還沒做 renderList，先顯示新增）
            if (typeof this.renderList === 'function') {
                this.renderList();
            } else {
                this.renderAdd();
            }
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
                const $btn = $form.find('button[type="submit"]');
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
                let lineId = '';

                try {
                    const isDev = location.hostname === 'localhost' || location.hostname.startsWith('192.168.');
                    if (!isDev && window.liff && liff.isLoggedIn && liff.isLoggedIn()) {
                        const profile = await liff.getProfile();
                        lineName = profile.displayName || '';
                        lineId = profile.userId || '';
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
                    if (typeof this.populateAllSelects === 'function') {
						this.populateAllSelects($form); // 重灌 placeholder
					}
                } else {
                    // 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
                    if (res && res.msg === 'invalid-json') {
                        console.warn('[API] invalid-json detail:', {
                            status: res.status,
                            contentType: res.contentType,
                            snippet: res.snippet
                        });
                    }
                    $slot.removeClass('ok').addClass('msg err')
                        .text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));
                }
            });
        },

        /* ===== API ===== */
        api: function(action, payload) {
            var url = this.var.API_URL;
            var bodyStr = JSON.stringify($.extend({ action: action }, payload || {}));

            // 小工具：寬鬆 JSON 解析（strip BOM/XSSI、擷取花括號區間）
            function parseJSONLoose(s) {
                if (typeof s !== 'string') return null;
                var t = s.replace(/^\uFEFF/, ''); // BOM
                t = t.replace(/^\)\]\}',?\s*/, ''); // XSSI 前綴
                try { return JSON.parse(t); } catch (e) {}
                var i = t.indexOf('{');
                var j = t.lastIndexOf('}');
                if (i >= 0 && j > i) {
                    try { return JSON.parse(t.slice(i, j + 1)); } catch (e2) {}
                }
                return null;
            }

            return new Promise(function(resolve) {
                fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 避免 preflight
                        body: bodyStr,
                        redirect: 'follow'
                    })
                    .then(function(r) { return r.text().then(function(t) { return { r: r, t: t }; }); })
                    .then(function(o) {
                        var status = o.r.status;
                        var ct = (o.r.headers.get('content-type') || '').toLowerCase();
                        var text = o.t || '';

                        try {
                            // eslint-disable-next-line no-console
                            console.groupCollapsed('[API] POST ' + url + ' → ' + status + ' (' + ct + ')');
                            // eslint-disable-next-line no-console
                            console.log('request body =', bodyStr);
                            // eslint-disable-next-line no-console
                            console.log('raw response =', text);
                            // eslint-disable-next-line no-console
                            console.groupEnd();
                        } catch (e3) {}

                        var json = parseJSONLoose(text);
                        if (json && typeof json === 'object') { resolve(json); return; }

                        resolve({
                            ok: false,
                            msg: 'invalid-json',
                            status: status,
                            contentType: ct,
                            snippet: text.slice(0, 400)
                        });
                    })
                    .catch(function(e) {
                        try { console.error('[API] fetch error:', e); } catch (e4) {}
                        resolve({ ok: false, msg: 'network-error', err: String(e && e.message || e) });
                    });
            });
        },

        /* ===== Utils ===== */
        formToObject: function($form) {
            var out = {};
            var arr = ($form && $form.serializeArray) ? $form.serializeArray() : [];
            for (var i = 0; i < arr.length; i++) out[arr[i].name] = arr[i].value;
            return out;
        },

        qs: function(k) {
            try {
                var part = (location.hash.split('?')[1] || '');
                var usp = new URLSearchParams(part);
                return usp.get(k);
            } catch (e) {
                return null;
            }
        },

        setMeta: function(t) { if (this.el.$meta && this.el.$meta.length) this.el.$meta.text(t || ''); },

        // 塞進單一 <select>
        populateSelect: function($select, items) {
            var el = $select && $select[0];
            if (!el) return;
            var doc = document;
            var ph = $select.attr('data-placeholder') || '請選擇';
            var withOther = $select.attr('data-with-other') === '1';

            el.innerHTML = '';

            // placeholder
            var phOpt = doc.createElement('option');
            phOpt.value = '';
            phOpt.text = ph;
            phOpt.disabled = true;
            phOpt.selected = true;
            el.appendChild(phOpt);

            // items: ["A","B"] 或 [{value,label}]
            var list = items || [];
            for (var i = 0; i < list.length; i++) {
                var it = list[i];
                var v = (typeof it === 'string') ? it : (it && (it.value || it.label));
                var l = (typeof it === 'string') ? it : (it && (it.label || it.value));
                if (!v) continue;
                var opt = doc.createElement('option');
                opt.value = v;
                opt.text = l;
                el.appendChild(opt);
            }

            if (withOther) {
                var o = doc.createElement('option');
                o.value = '__OTHER__';
                o.text = '其他（請填備註）';
                el.appendChild(o);
            }
        },

        // 一次掃描容器內所有 [data-opt]，自動填入對應 options
        populateAllSelects: function($scope) {
            var self = this;
            var root = $scope && $scope.length ? $scope : $(document);
            root.find('select[data-opt]').each(function() {
                var key = $(this).attr('data-opt');
                var items = self.getOptionsStatic(key);
                self.populateSelect($(this), items);
            });
        },

        // 取靜態 options（之後可改 API 讀取）
        getOptionsStatic: function(key) {
            if (window.ORDER_OPTIONS && window.ORDER_OPTIONS.hasOwnProperty(key)) {
                return window.ORDER_OPTIONS[key];
            }
            return [];
        },

        validateAddData: function(data) {
            var errs = {};
            var $form = $('#formAdd'); // ← 指向目前新增用的 form

            // 安全檢查器：欄位存在才驗證
            function hasField(name) { return $form.find('[name="' + name + '"]').length > 0; }

            // 接單平台（必填）
            if (hasField('接單平台') && !data['接單平台']) errs['接單平台'] = '請選擇接單平台';

            // 訂購人姓名（至少 2 字）
            if (hasField('訂購人姓名')) {
                var nm = (data['訂購人姓名'] || '').trim();
                if (!nm || nm.length < 2) errs['訂購人姓名'] = '至少 2 個字';
            }

            // 訂購人電話（必填 + 格式）
            if (hasField('訂購人電話')) {
                var tel = (data['訂購人電話'] || '').replace(/\s/g, '');
                if (!tel) {
                    errs['訂購人電話'] = '必填';
                } else if (!/^(\+?886-?|0)?[0-9\-]{8,13}$/.test(tel)) {
                    errs['訂購人電話'] = '電話格式不正確';
                }
            }

            // 訂單金額（數字）
            if (hasField('訂單金額')) {
                var amt = Number(data['訂單金額']);
                if (!(amt >= 0)) errs['訂單金額'] = '請輸入數字';
            }

            // 交貨日期（可空；若填則 YYYY-MM-DD）
            if (hasField('交貨日期') && data['交貨日期'] && !/^\d{4}-\d{2}-\d{2}$/.test(data['交貨日期'])) {
                errs['交貨日期'] = '日期格式需為 YYYY-MM-DD';
            }

            return errs;
        },

        validateEditPatch: function(patch) {
            var errs = {};
            if (patch.hasOwnProperty('貨運單號') && patch['貨運單號'] && String(patch['貨運單號']).length > 50) errs['貨運單號'] = '字數過長';
            if (patch.hasOwnProperty('是否已付款') && patch['是否已付款'] && !/^(未付款|已付款|貨到付款)$/.test(patch['是否已付款'])) errs['是否已付款'] = '選項不合法';
            if (patch.hasOwnProperty('是否已交貨') && patch['是否已交貨'] && !/^(未交貨|已交貨)$/.test(patch['是否已交貨'])) errs['是否已交貨'] = '選項不合法';
            return errs;
        },

        showFieldErrors: function($form, errs) {
            $form.find('.field-error').remove();
            $form.find('input,select,textarea').removeClass('is-error').attr('aria-invalid', 'false');
            $form.find('.field').removeClass('has-error');

            var names = Object.keys(errs);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                var $el = $form.find('[name="' + name + '"]');
                if ($el.length) {
                    $el.addClass('is-error').attr('aria-invalid', 'true');
                    $el.closest('.field').addClass('has-error');
                    $el.after('<div class="field-error">' + errs[name] + '</div>');
                }
            }
        },

        renderErrorSummary: function($slot, errs) {
            var keys = Object.keys(errs);
            if (!keys.length) { $slot.empty(); return keys; }
            var list = '';
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                list += '<li><strong>' + k + '</strong>：' + errs[k] + '</li>';
            }
            var html = '<div class="msg err">請修正下列欄位後再送出：<ul style="margin:6px 0 0 18px">' + list + '</ul></div>';
            $slot.html(html);
            return keys;
        },

        logValidationDebug: function(context, data, errs) {
            try {
                // eslint-disable-next-line no-console
                console.groupCollapsed('[Validate] ' + context + ' — 共 ' + Object.keys(errs).length + ' 筆錯誤');
                // eslint-disable-next-line no-console
                console.log('表單值 =', data);
                if (Object.keys(errs).length && console.table) {
                    // eslint-disable-next-line no-console
                    console.table(errs);
                }
                // eslint-disable-next-line no-console
                console.groupEnd();
            } catch (e) {}
        },

        scrollToFirstError: function($form) {
            var $first = $form.find('.is-error').first();
            if ($first.length) {
                try { if ($first[0].focus) $first[0].focus(); } catch (e) {}
                try { if ($first[0].scrollIntoView) $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e2) {}
            }
        },

        /* ===== Env & LIFF ===== */
        detectEnv_: function() {
            var h = location.hostname || '';
            var proto = location.protocol || '';
            var qs = '';
            try { qs = location.search || ''; } catch (e) {}
            var q;
            try { q = new URLSearchParams(qs); } catch (e2) { q = { get: function() { return null; } }; }

            if (q.get && q.get('dev') === '1') return { isDev: true, isStaging: false, label: 'DEV' };
            if (q.get && q.get('staging') === '1') return { isDev: false, isStaging: true, label: 'STAGING' };

            var isLocal = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' ||
                /^192\.168\./.test(h) || /^10\./.test(h) ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) || /\.local$/.test(h) || /\.test$/.test(h));

            var looksStaging = /ngrok\.io$/.test(h) || /ngrok-free\.app$/.test(h) ||
                (/\.vercel\.app$/.test(h) && /-(git|preview)/i.test(h)) ||
                (/\.netlify\.app$/.test(h) && /--/.test(h)) ||
                /\.cloudfront\.net$/.test(h);

            if (isLocal) return { isDev: true, isStaging: false, label: 'DEV' };
            if (looksStaging) return { isDev: false, isStaging: true, label: 'STAGING' };
            return { isDev: false, isStaging: false, label: 'PROD' };
        },

        showEnvBadge_: function(env) {
            if (!(env.isDev || env.isStaging)) return;
            if (document.getElementById('env-badge')) return;
            var frag = TPL.tpl('tpl-badge', { label: env.label });
            TPL.mount(document.body, frag, false);
            $('#env-badge').on('click', function() { $(this).remove(); });
        },

        initLiff: function() {
            var self = this;
            return new Promise(function(resolve) {
                // DEV/STAGING 與私網一律略過登入
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
                if (!window.liff || !self.var.LIFF_ID || self.var.LIFF_ID.indexOf('REPLACE_') === 0) {
                    self.setMeta('(未啟用 LIFF)');
                    resolve();
                    return;
                }
                try {
                    liff.init({ liffId: self.var.LIFF_ID }).then(function() {
                        if (!liff.isLoggedIn()) { liff.login();
                            resolve(); return; }
                        liff.getProfile().then(function(p) {
                            self.var.actor = 'LIFF'; // 或 p.userId
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
                } catch (e) {
                    self.setMeta('(LIFF 初始化例外)');
                    resolve();
                }
            });
        }
    };

    APP.init();
});