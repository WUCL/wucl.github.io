/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Add (Refactored)
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderAdd = function() {
        APP.var.featureMode = 'add';
        const frag = TPL.tpl('tpl-form');
        const $form = $(frag).find('form');
        TPL.mount('#main', frag);

        // UI 初始化
        $form.attr('data-mode', 'add');
        $form.find('[data-show="edit"]').remove();
        const $btn = $form.find('button[type="submit"]').text('送出');
        const $slot = $form.find('.msg[data-slot="msg"]');

        // 自動填充與綁定
        if (typeof APP.populateAllSelects === 'function') APP.populateAllSelects($form);
        APP.bindSharedForm($form);

        // 預設日期：今天
        $form.find('[name="訂單日期"]').val(APP.toDateInputValue(new Date()));

        // === 週花 UI 邏輯 ===
        const $pCat = $form.find('[name="品項分類"]');
        const $item = $form.find('[name="商品項目"]');
        const $weeklyWrap = $('#field-weeklyFlower');

        $pCat.on('change', function() {
            const isWeekly = $(this).val() === '週花';
            $weeklyWrap.toggle(isWeekly);

            // 自動帶入或還原「商品項目」
            if (isWeekly && !$item.hasClass('wasWeekly')) {
                $item.data('ORIG_KEY', $item.val()).addClass('wasWeekly').val('週花');
            } else if (!isWeekly && $item.hasClass('wasWeekly')) {
                $item.val($item.data('ORIG_KEY') || '').removeClass('wasWeekly');
            }
        });

        // === 表單送出 ===
        $form.off('submit').on('submit', async (e) => {
            e.preventDefault();
            if (APP.status?.start) APP.status.start('新增訂單');

            const data = APP.formToObject($form);

            // [優化] 使用共用函式取得 LINE 資訊
            const profile = await APP.getLineProfile();

            // 鎖定表單 UI
            $slot.removeClass('ok err').empty();
            APP.lockForm($form, true);
            $btn.text('送出中…');
            APP.scrollTop();

            // 週花邏輯：計算重複次數
            const isWeekly = (data['品項分類'] === '週花');
            let repeatN = 1;
            if (isWeekly) {
                const rawN = Number(data['週花週期'] || 1);
                repeatN = Math.max(1, Math.min(12, isNaN(rawN) ? 1 : rawN));
                if (!data['商品項目']) data['商品項目'] = '週花';
            }

            try {
                // 決定 API 動作
                const action = (isWeekly && repeatN > 1) ? 'create_weekly' : 'create';
                const payload = {
                    data: data,
                    repeat: repeatN, // 只有 create_weekly 會用到
                    actor: APP.var.actor,
                    lineName: profile.lineName,
                    lineId: profile.lineId
                };

                if (APP.status?.tick) APP.status.tick('呼叫 API', 35);

                const res = await APP.api(action, payload);

                // 解鎖表單
                $btn.text('送出');
                APP.lockForm($form, false);

                if (res && res.ok) {
                    // === 成功 ===
                    handleSuccess(res, data, $form, $slot);
                } else {
                    // === 失敗 ===
                    const msg = (res && res.msg) || '未知錯誤';
                    if (res?.msg === 'invalid-json') console.warn('JSON Error', res);

                    $slot.removeClass('ok').addClass('err').text('❌ 失敗：' + msg);
                    if (APP.status?.done) APP.status.done(false, msg);
                }

            } catch (err) {
                console.error('[Add] Error:', err);
                $btn.text('送出');
                APP.lockForm($form, false);

                const msg = '❌ 網絡錯誤：' + (err.message || err);
                $slot.removeClass('ok').addClass('err').text(msg);
                if (APP.status?.done) APP.status.done(false, 'Exception');
            }
        });

        // 成功後的處理 (抽離出來讓主邏輯更乾淨)
        async function handleSuccess(res, data, $f, $s) {
            if (APP.status?.done) APP.status.done(true, '完成 ' + res.orderId);

            // 1. 顯示訊息
            const countMsg = (res.created > 1) ? `（共 ${res.created} 筆）` : '';
            let html = `<div class="msg-h">✅ 已建立訂單<span>${res.orderId}</span>${countMsg}</div>`;

            const lis = Object.keys(data).map(k => `<li><b>${k}</b><span>${data[k]}</span></li>`).join('');
            html += `<div class="msg-b"><ul class="confirm-list">${lis}</ul></div>`;
            $s.removeClass('err').addClass('ok').html(html);

            // 2. LINE 通知 (非阻塞)
            if (window.liff && liff.isInClient()) {
                liff.sendMessages([{ type: 'text', text: '✅ 新增訂單：' + res.orderId }]).catch(()=>{});
            }

            // 3. 重置表單
            if ($f[0].reset) $f[0].reset();
            $f.find('[name="訂單日期"]').val(APP.toDateInputValue(new Date()));
            $f.find('.field.showhide').hide(); // 隱藏所有條件欄位
        }
    };
})(window, jQuery);