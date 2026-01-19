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
                $('input[name="週花週期"]').val('1');
            } else if (!isWeekly && $item.hasClass('wasWeekly')) {
                $item.val($item.data('ORIG_KEY') || '').removeClass('wasWeekly');
                $('input[name="週花週期"]').val('');
            }
        });

        // === 表單送出 ===
        $form.off('submit').on('submit', async (e) => {
            e.preventDefault();
            if (APP.status?.start) APP.status.start('新增訂單');

            const data = APP.formToObject($form);

            // 運費為空，則補 0
            if (!data['運費金額'] || String(data['運費金額']).trim() === '') {
                data['運費金額'] = '0';
            }

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

            // 【重要】資料已異動，清空清單快取，確保回列表時看到最新的
            APP.var.cache.list = {};
            APP.var.cache.summary = null;

            // --- [新增] 組裝要發送到群組的詳細文字 ---
            const formatMsg = (res, data) => {
                const actorName = APP.var.userName || '使用者'; // 確保你有抓到使用者名字

                let lines = [
                    `🆕 新增訂單`,
                    `${res.orderId}`,
                    `-`,
                    `${actorName} 編輯`,
                    `-`,
                    `客戶類型：${data['客戶類型'] || '-'}`,
                    `接單平台：${data['接單平台'] || '-'}`,
                    `訂單日期：${data['訂單日期'] || '-'}`,
                    `交貨日期：${data['交貨日期'] || '-'}`,
                    `是否已付款：${data['是否已付款'] || '-'}`,
                    `是否已交貨：${data['是否已交貨'] || '-'}`,
                    `訂單金額：${data['訂單金額'] || '-'}`,
                    `商品金額：${data['商品金額'] || '-'}`,
                    `運費金額：${data['運費金額'] || '-'}`,
                    `付款方式：${data['付款方式'] || '-'}`
                ];

                // 1. 如果 付款方式 等於 匯款 再顯示 匯款後五碼
                if (data['付款方式'] === '匯款') { lines.push(`匯款後五碼：${data['匯款後五碼'] || '-'}`); }

                lines.push(`━`);
                lines.push(`訂購人姓名：${data['訂購人姓名'] || '-'}`);
                lines.push(`訂購人ID：${data['訂購人ID'] || '-'}`);
                lines.push(`訂購人電話：${data['訂購人電話'] || '-'}`);
                lines.push(`訂購人Email：${data['訂購人Email'] || '-'}`);
                lines.push(`品項分類：${data['品項分類'] || '-'}`);

                // 2. 如果 品項分類 等於 週花 再顯示 週花週期
                if (data['品項分類'] === '週花') { lines.push(`週花週期：${data['週花週期'] || '-'}`); }

                lines.push(`購買用途：${data['購買用途'] || '-'}`);
                lines.push(`商品項目：${data['商品項目'] || '-'}`);
                lines.push(`━`);
                lines.push(`取貨方式：${data['取貨方式'] || '-'}`);

                // 3. 如果 取貨方式 等於 宅配 再顯示 貨運單號
                // (註：如果您的選項包含 "郵寄" 也可以一併加入判斷)
                if (data['取貨方式'] === '宅配' || data['取貨方式'] === '郵寄') { lines.push(`貨運單號：${data['貨運單號'] || '-'}`); }

                lines.push(`收件者姓名：${data['收件者姓名'] || '-'}`);
                lines.push(`收件者電話：${data['收件者電話'] || '-'}`);
                lines.push(`收件者地址：${data['收件者地址'] || '-'}`);
                lines.push(`━`);
                lines.push(`訂單備註：${data['訂單備註'] || '-'}`);
                lines.push(`小卡內容：${data['小卡內容'] || '-'}`);

                return lines.join('\n');
            };

            const fullText = formatMsg(res, data);

            // 2. LINE 通知 (發送給群組)
            if (APP.var.liffReady && window.liff && liff.isInClient()) {
                liff.sendMessages([{ type: 'text', text: fullText }])
                .then(() => console.log('詳細清單已發送'))
                .catch((err) => {
                    console.error('發送失敗', err);
                    liff.sendMessages([{ type: 'text', text: '✅ 新增訂單：' + res.orderId }]).catch(()=>{});
                });
            }

            // 3. 顯示網頁訊息
            const countMsg = (res.created > 1) ? `（共 ${res.created} 筆）` : '';
            let html = `<div class="msg-h">✅ 新增訂單<span>${res.orderId}</span>${countMsg}</div>`;
            const lis = Object.keys(data).map(k => `<li><b>${k}</b><span>${data[k]}</span></li>`).join('');
            html += `<div class="msg-b"><ul class="confirm-list">${lis}</ul></div>`;
            $s.removeClass('err').addClass('ok').html(html);

            // 4. 重置表單
            if ($f[0].reset) $f[0].reset();
            $f.find('[name="訂單日期"]').val(APP.toDateInputValue(new Date()));
            $f.find('.field.showhide').hide(); // 隱藏所有條件欄位
        }
    };
})(window, jQuery);