/* ==========================================
   FILE: app.base.js
   INCLUDES: eventdevice, templates, status, api, form
   所有 UI 工具、樣板引擎、API 呼叫與表單輔助函式。這是 Feature 運作的基石。
   ========================================== */

/* --- SOURCE: eventdevice.js --- */
// src/js/ui/eventdevice.js
// === Device Info Utility ===
window.deviceObj = {
    name: 'PC',
    pvtag: '',
    isMobile: function() {
        return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
    },
    getDeviceName: function() {
        return this.isMobile() ? 'Mobile' : 'PC';
    },
    getPVtag: function() {
        return this.isMobile() ? '/mobile' : '';
    },
    init: function() {
        this.name = this.getDeviceName();
        this.pvtag = this.getPVtag();
    }
};
window.deviceObj.init();
window.isMobile = function() { return window.deviceObj.isMobile(); };


/* --- SOURCE: templates.js --- */
/* eslint-env browser, es2020 */
/*! OrderHub — UI/Templates (TPL) */
;(function(w) {
    'use strict';
    function renderTextNodes(node, data) {
        // 把所有文字節點拿出來做 {{key}} 置換（ES5 寫法）
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        var toReplace = [];
        while (walker.nextNode()) toReplace.push(walker.currentNode);
        for (var i = 0; i < toReplace.length; i++) {
            var txt = toReplace[i];
            var s = txt.nodeValue;
            if (s && s.indexOf('{{') !== -1) {
                txt.nodeValue = s.replace(/\{\{([^}]+)\}\}/g, function(_, k) {
                    var key = String(k || '').trim();
                    return (data && data.hasOwnProperty(key) && data[key] != null) ? String(data[key]) : '';
                });
            }
        }
    }
    // === 載入模板、回傳 DOM 節點 ===
    function tpl(id, data) {
        var t = document.getElementById(id);
        if (!t) throw new Error('template not found: ' + id);
        var node = t.content.cloneNode(true);
        if (data) renderTextNodes(node, data);
        return node;
    }
    // === 掛載模板到指定容器 ===
    function mount(container, node, replace) {
        var el = (container && container.nodeType === 1) ? container : document.querySelector(container);
        if (!el) throw new Error('mount target not found');
        if (replace === undefined) replace = true;
        if (replace) el.innerHTML = '';
        el.appendChild(node);
        return el;
    }
    function msg(text, cls) {
        var frag = tpl('tpl-msg', { text: text, cls: cls || '' });
        return frag;
    }
    w.TPL = { tpl: tpl, mount: mount, msg: msg };
})(window);


/* --- SOURCE: status.js --- */
/* eslint-env browser, jquery, es2020 */
/*! OrderHub — UI: Status Bar + Progress */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});
    var ROOT_ID = 'oh-status';

    function ensureBar() {
        if (document.getElementById(ROOT_ID)) return;
        const frag = TPL.tpl('tpl-status');
        var main = document.getElementById('main');
        if (main) {
            main.insertBefore(frag, main.firstChild);
        } else {
            document.body.insertBefore(frag, document.body.firstChild);
        }
        $('.oh-status__clear').on('click', function() { $('.oh-status__list').empty(); });
        $('.oh-status__toggle').on('click', function(e) {
            e.preventDefault();
            var $list = $('.oh-status__list').first();
            $list.stop(true, true).slideToggle(160);
            return;
        });
    }
    function now() {
        var d = new Date();
        var p = function(n, w) { n = String(n); return ('000' + n).slice(-w); };
        return p(d.getHours(), 2) + ':' + p(d.getMinutes(), 2) + ':' + p(d.getSeconds(), 2) + '.' + p(d.getMilliseconds(), 3);
    }
    function pushLine(text, level) {
        var $list = $('.oh-status__list');
        if (!$list.length) return;
        var cls = (level === 'error') ? 'err' : (level === 'warn' ? 'warn' : 'ok');
        var line = '<div class="oh-status__line ' + cls + '">[' + now() + '] ' + text + '</div>';
        $list.append(line);
        $list[0].scrollTop = $list[0].scrollHeight;
    }
    APP.status = {
        _t0: 0, _pct: 0,
        start: function(label) {
            ensureBar();
            this._t0 = (w.performance && performance.now) ? performance.now() : Date.now();
            this._pct = 0;
            $('.oh-status__bar').css('width', '0%');
            pushLine('開始：' + (label || ''), 'ok');
            console.log('[STATUS] start:', label);
        },
        tick: function(label, inc) {
            ensureBar();
            var step = (typeof inc === 'number') ? inc : 20;
            this._pct = Math.max(0, Math.min(100, this._pct + step));
            $('.oh-status__bar').css('width', this._pct + '%');
            if (label) pushLine('進度：' + label, 'warn');
            console.log('[STATUS] tick:', label, step);
        },
        done: function(ok, label) {
            ensureBar();
            this._pct = 100;
            $('.oh-status__bar').css('width', '100%');
            var t1 = (w.performance && performance.now) ? performance.now() : Date.now();
            var ms = Math.max(0, Math.round(t1 - this._t0));
            var s = (ms / 1000).toFixed(2);
            var msg = (ok ? '完成' : '失敗') + '：' + (label || '') + '（' + s + 's）';
            pushLine(msg, ok ? 'ok' : 'error');
            console.log('[STATUS] done:', ok, label, s + 's');
        }
    };
})(window, jQuery);


/* --- SOURCE: api.js --- */
/* eslint-env browser, jquery, es2020 */
/*! OrderHub — Services/API */
;(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});
    function parseJSONLoose(s) {
        if (typeof s !== 'string') return null;
        var t = s.replace(/^\uFEFF/, '').replace(/^\)\]\}',?\s*/, '');
        try { return JSON.parse(t); } catch (_e) {}
        var i = t.indexOf('{'), j = t.lastIndexOf('}');
        if (i >= 0 && j > i) { try { return JSON.parse(t.slice(i, j + 1)); } catch (_e2) {} }
        return null;
    }
    APP.api = function(action, payload) {
        var url = this.var.API_URL;
        // var bodyStr = JSON.stringify($.extend({ action: action }, payload || {}));

        var bodyStr = JSON.stringify($.extend({
            action: action,
            targetId: this.var.targetId || '' // 把剛才存好的群組 ID 塞進去
        }, payload || {}));

        return new Promise(function(resolve) {
            fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: bodyStr,
                    redirect: 'follow'
                })
                .then(function(r) { return r.text().then(function(t) { return { r: r, t: t }; }); })
                .then(function(o) {
                    var status = o.r.status;
                    var ct = (o.r.headers.get('content-type') || '').toLowerCase();
                    var text = o.t || '';
                    var json = parseJSONLoose(text);
                    if (json && typeof json === 'object') { resolve(json); return; }
                    resolve({ ok: false, msg: 'invalid-json', status: status, contentType: ct, snippet: text.slice(0, 400) });
                })
                .catch(function(e) {
                    resolve({ ok: false, msg: 'network-error', err: String(e && e.message || e) });
                });
        });
    };
})(window);


/* --- SOURCE: form.js --- */
/* eslint-env browser, jquery, es2020 */
/*! OrderHub — UI/Form helpers */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // === 取表單物件 ===
    APP.formToObject = function($form) {
        var out = {};
        var arr = ($form && $form.serializeArray) ? $form.serializeArray() : [];
        for (var i = 0; i < arr.length; i++) out[arr[i].name] = arr[i].value;
        return out;
    };

    // === [優化] 統一取得 LINE Profile (支援 Dev 模擬) ===
    APP.getLineProfile = async function() {
        let lineName = '';
        let lineId = '';
        try {
            // 判斷是否為開發環境
            const isDev = location.hostname === 'localhost' ||
                          location.hostname.startsWith('192.168.') ||
                          location.hostname.startsWith('127.0.');

            // 優先讀取全域變數 (如果 boot.js 有先做)
            if (APP.var && APP.var.lineId && !APP.var.lineId.startsWith('REPLACE_')) {
                return { lineName: APP.var.actor || APP.var.lineName, lineId: APP.var.lineId };
            }

            // 嘗試從 LIFF 取得
            if (!isDev && window.liff && liff.isInClient() && liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                lineName = profile.displayName || '';
                lineId = profile.userId || '';
            } else if (isDev) {
                lineName = 'DEV-LOCAL';
                lineId = 'LOCAL-TEST-ID';
            } else {
                // 瀏覽器開啟但非 Dev (例如外部瀏覽器開啟正式站)
                lineName = 'WEB-GUEST';
                lineId = 'WEB-GUEST-ID';
            }
        } catch (e) {
            console.warn('getProfile error', e);
            lineName = 'DEV-FALLBACK';
            lineId = 'FALLBACK-ID';
        }
        return { lineName, lineId };
    };

    // === [優化] 日期顯示格式化 (YY/MM/DD 週X) ===
    APP.fmtDateDisplay = function(input) {
        if (!input) return '—';
        const d = new Date(input);
        if (isNaN(d.getTime())) return String(input);

        // 取得當地時間元件
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
        const wk = WEEK[d.getDay()];

        return `${yy}/${mm}/${dd} 週${wk}`;
    };

    // === [優化] 統一日期格式轉 Input Value (解決時區問題) ===
    APP.toDateInputValue = function(dateInput) {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        // 透過扣除時區偏移來取得正確的當地 ISO 日期字串
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - offset * 60000);
        return local.toISOString().split('T')[0];
    };

    // === [優化] 頁面滾動至頂部 ===
    APP.scrollTop = function() {
        // 嘗試多種兼容寫法
        if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
        else document.body.scrollTop = 0;
    };

    // === select 填充（優先保留 HTML 內原有選項） ===
    APP.populateSelect = function($select, items) {
        if (!$select || !$select.length) return;
        var el = $select[0];
        // el.innerHTML = '';
        var doc = document;
        var list = items || [];
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            var v = (typeof it === 'string') ? it : (it && (it.value || it.label));
            var l = (typeof it === 'string') ? it : (it && (it.label || it.value));
            if (!v) continue;
            var opt = doc.createElement('option');
            opt.value = v;
            opt.text = l;
            if (!(el.options && el.options.length > 0)) { if (i === 0) opt.selected = true; }
            el.appendChild(opt);
        }
    };

    // === 取靜態選項（之後可改為遠端） ===
    APP.getOptionsStatic = function(key) {
        if (w.ORDER_OPTIONS && Object.prototype.hasOwnProperty.call(w.ORDER_OPTIONS, key)) {
            return w.ORDER_OPTIONS[key];
        }
        return [];
    };

    // === 掃描容器內所有 [data-opt] select，自動灌入 ===
    APP.populateAllSelects = function($scope) {
        var self = this;
        var root = $scope && $scope.length ? $scope : $(document);
        root.find('select[data-opt]').each(function() {
            var key = $(this).attr('data-opt');
            var items = self.getOptionsStatic(key);
            self.populateSelect($(this), items);
            return
        });
    };

    // === 是否已付款 UI（已付款 > 付款方式為必填） ===
    APP.bindIsPaied = function($form) {
        var $isOrderStateWrap = $form.find('[name="是否已付款"]');
        var $payTypeWrap = $form.find('[name="付款方式"]');
        $isOrderStateWrap.on('change', function() {
            if (!$isOrderStateWrap.length) return;
            var $isPaied = $(this).val();
            if ($isPaied !== '未付款') $payTypeWrap.prop('required', true);
            else $payTypeWrap.prop('required', false);
            return;
        });
    };

    // === 付款方式 UI（匯款 > show/hide「匯款後五碼」） ===
    APP.bindIsMoneyTransfer = function($form) {
        var $payTypeWrap = $form.find('[name="付款方式"]');
        var $moneyTransferWrap = $('#field-moneyTransfer');
        $payTypeWrap.on('change', function() {
            if (!$payTypeWrap.length) return;
            var isTransfer = String($payTypeWrap.val() || '') === '匯款';
            $moneyTransferWrap.toggle(isTransfer);
            if (!isTransfer) $moneyTransferWrap.find('[name="匯款後五碼"]').val('');
            return;
        });
    };

    // === checkbox，是陌生人 ===
    APP.bindIsStranger = function($form, $buyerName) {
        var self = this;
        var $isStranger = $form.find('#isStranger');
        $buyerName = $buyerName || $form.find('[name="訂購人姓名"]');
        if (!$isStranger.length || !$buyerName.length) return;
        $isStranger.off('.isStranger').on('change.isStranger', function() {
            if (this.checked) $buyerName.data('prevName', $buyerName.val() || '').val(APP.var.stranger).prop('readonly', true);
            else $buyerName.val($buyerName.data('prevName')).prop('readonly', false);
            self.syncBuyerToReceiver($form);
        });
    };

    // === checkbox，同訂購人資訊 ===
    APP.syncBuyerToReceiver = function($form) {
        var $sameAsBuyer = $form.find('#sameAsBuyer');
        if (!$sameAsBuyer.prop('checked')) return;
        var $buyerName = $form.find('[name="訂購人姓名"]');
        var $buyerPhone = $form.find('[name="訂購人電話"]');
        var $recvName = $form.find('[name="收件者姓名"]');
        var $recvPhone = $form.find('[name="收件者電話"]');
        $recvName.val($buyerName.val());
        $recvPhone.val($buyerPhone.val());
    };
    APP.bindSameAsBuyer = function($form) {
        var self = this;
        var $sameAsBuyer = $form.find('#sameAsBuyer');
        var $buyerName = $form.find('[name="訂購人姓名"]');
        var $buyerPhone = $form.find('[name="訂購人電話"]');
        if (!$sameAsBuyer.length) return;
        // 同訂購人欄位變動、或勾選狀態改變 → 同步
        $buyerName.add($buyerPhone).off('.sameAsBuyer').on('input.sameAsBuyer', function () { self.syncBuyerToReceiver($form); });
        $sameAsBuyer.off('.sameAsBuyer').on('change.sameAsBuyer', function() { self.syncBuyerToReceiver($form); });
    };

    // === 取貨方式，自取自動帶入地址 / 宅配顯示物流單號 ===
    APP.bindMappingRecvAddr = function($form) {
        var $receiptType = $form.find('[name="取貨方式"]');
        var $recvAddr = $form.find('[name="收件者地址"]');
        var $trackingNumberWrap = $form.find('#field-trackingNumber');
        if (!$receiptType.length || !$recvAddr.length) return;
        function mappingRecvAddr() {
            const v = String($receiptType.val() || '');
            const map = w.MAPPING_receiptType || {};
            // === 自取點：自動帶入地址 ===
            if (Object.prototype.hasOwnProperty.call(map, v) && map[v]) { $recvAddr.val(map[v]); }

            // === 宅配：顯示物流單號欄位 ===
            if ($trackingNumberWrap.length) {
                const isDelivery = (v === '宅配' || v === '郵寄');
                $trackingNumberWrap.toggle(isDelivery);
            }
        }
        $receiptType.off('.mappingRecvAddr').on('change.mappingRecvAddr', mappingRecvAddr);
        mappingRecvAddr();
    };

    // === 訂單狀態，判斷done之前是否已付款已出貨 ===
    APP.bindIsPayShip = function($form) {
        var $isOrderStateWrap = $form.find('[name="訂單狀態"]');
        var $isPaidWrap = $form.find('[name="是否已付款"]');
        var $isShippedWrap = $form.find('[name="是否已交貨"]');
        $isOrderStateWrap.on('change', function() {
            if (!$isOrderStateWrap.length) return;
            var $isOrderState = String($(this).val() || '').trim(); // done / cancel / doing
            var $isPaied = String($isPaidWrap.val() || '');
            var $isShipped = String($isShippedWrap.val() || '');

            // === 狀態：完成（done）===
            if ($isOrderState === 'done') {
                if ($isPaied !== '已付款' || $isShipped !== '已交貨') {
                    alert('⚠️ 無法將狀態改為完成，請先確認訂單「已付款」與「已交貨」。');
                    // 回復原狀
                    $(this).val('doing');
                    return false;
                }
            }

            // === 狀態：取消（cancel）===
            if ($isOrderState === 'cancel') {
                var confirmCancel = confirm('⚠️ 確定要取消此訂單嗎？');
                // 若使用者按取消，還原舊值
                if (!confirmCancel) { $(this).val('doing'); return false; }
            }
            return;
        });
        [ $isPaidWrap, $isShippedWrap ].forEach(function ($el) {
            $el.off('change.statusSync').on('change.statusSync', function () { $isOrderStateWrap.trigger('change'); });
        });
    };

    // 鎖住/解鎖整個表單（會保留原本已 disabled 的欄位狀態）
    APP.lockForm = function($form, lock) {
        if (!$form || !$form.length) return;
        var $fields = $form.find('input, select, textarea, button');
        if (lock) { $form.addClass('is-busy'); $fields.each(function() { this.disabled = true; }); }
        else { $form.removeClass('is-busy'); $fields.each(function() { this.disabled = false; }); }
    };

    APP.bindSharedForm = function($form) {
        var self = this;
        self.bindIsPaied($form);
        self.bindIsMoneyTransfer($form);
        self.bindIsStranger($form);
        self.bindSameAsBuyer($form);
        self.bindMappingRecvAddr($form);
    };
})(window, jQuery);

/* --- SOURCE: app.clock.js --- */
/* eslint-env browser, es2020 */
;
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});
    var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
    function pad(n) { return String(n).padStart(2, '0'); }
    APP.clock = {
        init: function() {
            var el = document.getElementById('clock');
            if (!el) return;
            function tick() {
                var now = new Date();
                var y = now.getFullYear();
                var m = pad(now.getMonth() + 1);
                var d = pad(now.getDate());
                var hh = pad(now.getHours());
                var mm = pad(now.getMinutes());
                var wk = WEEK[now.getDay()];
                el.textContent = y + '/' + m + '/' + d + ' ' + hh + ':' + mm + '（週' + wk + '）';
            }
            tick();
            setInterval(tick, 30 * 1000);
        }
    };
})(window);