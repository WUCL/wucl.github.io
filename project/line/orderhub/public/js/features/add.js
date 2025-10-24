/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Add
 * 職責：新增訂單頁面
 * 安全版：不觸發 LIFF 初始化、在本機模擬資料、異常時自動 fallback
 */
;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderAdd = function() {
        const frag = TPL.tpl('tpl-add');
        const node = TPL.mount('#main', frag);

        const $form = $('#formAdd');
        const $slot = $form.find('[data-slot="msg"]');

        // 自動灌入 select
        if (typeof this.populateAllSelects === 'function') {
            this.populateAllSelects($form);
        }

        // 預設今天日期
        $form.find('[name="訂單日期"]').each(function() {
            if (!this.value) {
                const today = new Date().toISOString().split('T')[0];
                this.value = today;
            }
        });

        $form.off('submit').on('submit', async (e) => {
            e.preventDefault();

            // === 狀態列：開始 ===
            if (APP.status && APP.status.start) APP.status.start('新增訂單');

            const data = this.formToObject($form);
            const $btn = $form.find('button[type="submit"]');
            const $slot = $form.find('[data-slot="msg"]');

            // 驗證
            if (APP.status && APP.status.tick) APP.status.tick('驗證資料', 25);
            const errs = this.validateAddData(data);
            this.showFieldErrors($form, errs);
            if (typeof this.logValidationDebug === 'function') {
                this.logValidationDebug('新增訂單', data, errs);
            }

            if (Object.keys(errs).length) {
                this.renderErrorSummary($slot, errs);
                this.scrollToFirstError($form);
                if (APP.status && APP.status.done) APP.status.done(false, '驗證失敗');
                return; // 停止送出
            }

            // 取得 LINE 使用者資訊（若已登入）
            let lineName = '';
            let lineId = '';

            try {
                const isDev =
                    location.hostname === 'localhost' ||
                    location.hostname.startsWith('192.168.');

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
            if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);
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
                if (APP.status && APP.status.tick) APP.status.tick('處理回應', 30);
                $slot.removeClass('err').addClass('msg ok').text('✅ 已建立：' + res.orderId);
                try {
                    if (window.liff) {
                        await liff.sendMessages([
                            { type: 'text', text: '✅ 新增訂單：' + res.orderId }
                        ]);
                    }
                } catch (_) {
                    // 不影響主要流程
                }

                // 清空表單與錯誤
                if ($form[0] && $form[0].reset) $form[0].reset();
                this.showFieldErrors($form, {}); // 清錯
                if (typeof this.populateAllSelects === 'function') {
                    this.populateAllSelects($form);
                }

                if (APP.status && APP.status.done) APP.status.done(true, '完成（' + res.orderId + '）');
            } else {
                // 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
                if (res && res.msg === 'invalid-json') {
                    console.warn('[API] invalid-json detail:', {
                        status: res.status,
                        contentType: res.contentType,
                        snippet: res.snippet
                    });
                }
                $slot
                    .removeClass('ok')
                    .addClass('msg err')
                    .text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));

                if (APP.status && APP.status.done) APP.status.done(false, (res && res.msg) || '未知錯誤');
            }
        });
    };
})(window, jQuery);