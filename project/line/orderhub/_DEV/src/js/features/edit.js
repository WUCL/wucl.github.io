/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Edit (Refactored)
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderEdit = function() {
        APP.var.featureMode = 'edit';

        // 解析 ID
        const params = new URLSearchParams((location.hash.split('?')[1] || ''));
        const orderId = params.get('id');

        const frag = TPL.tpl('tpl-form', { orderId: orderId || '' });
        const $form = $(frag).find('form');
        const $btn = $form.find('button[type="submit"]').text('儲存變更');
        const $slot = $form.find('.msg[data-slot="msg"]');
        TPL.mount('#main', frag);

        // 狀態儲存
        let $originalData = {};
        const $diff = {};

        // 初始化 UI
        $form.attr('data-mode', 'edit');
        $form.find('[data-show="edit"]').show();

        if (!orderId) {
            $slot.addClass('msg err').text('❌ 缺少訂單編號 id');
            return;
        }

        if (typeof APP.populateAllSelects === 'function') APP.populateAllSelects($form);
        APP.bindSharedForm($form);
        APP.bindIsPayShip($form);

        // === Step 1. 讀取資料 ===
        loadData();

        function loadData() {
            if (APP.status?.start) APP.status.start('編輯訂單 ' + orderId);
            $slot.removeClass('ok err').addClass('msg').html(`<div class="msg-h">讀取中…</div>`);
            APP.lockForm($form, true);

            if (APP.status?.tick) APP.status.tick('讀取資料', 20);

            APP.api('get', { id: orderId }).then(res => {
                if (res && res.ok && res.item) {
                    fillForm(res.item);
                    $slot.removeClass('msg err ok').empty();
                    APP.lockForm($form, false);
                    checkWeeklyLock($form); // 週花鎖定檢查
                    if (APP.status?.done) APP.status.done(true, '載入完成');
                } else {
                    showError(res?.msg || '讀取失敗');
                }
            }).catch(err => showError(err));
        }

        // === Step 2. 送出更新 ===
        $form.off('submit').on('submit', async function(e) {
            e.preventDefault();
            const rawData = APP.formToObject($form);

            if (rawData['運費金額'] === '') rawData['運費金額'] = '0';

            // 計算差異
            Object.keys($diff).forEach(k => delete $diff[k]); // 清空舊 diff
            let hasChange = false;

            Object.keys(rawData).forEach(k => {
                const oldV = String($originalData[k] || '').trim();
                const newV = String(rawData[k] || '').trim();

                if (oldV !== newV) {
                    $diff[k] = newV;
                    hasChange = true;
                }
            });

            if (!hasChange) {
                $slot.removeClass('ok').addClass('msg err').text('⚠️ 沒有變更任何欄位');
                APP.scrollTop();
                return;
            }

            // 準備送出
            if (APP.status?.start) APP.status.start('更新訂單');
            $slot.removeClass('err ok').empty();
            APP.lockForm($form, true);
            $btn.text('更新中…');
            APP.scrollTop();

            try {
                // [優化] 使用共用函式
                const profile = await APP.getLineProfile();

                const res = await APP.api('update', {
                    id: orderId,
                    patch: $diff,
                    actor: APP.var.actor,
                    lineName: profile.lineName,
                    lineId: profile.lineId
                });

                $btn.text('儲存變更');
                APP.lockForm($form, false);
                checkWeeklyLock($form);

                // edit.js 內部的 submit 處理區塊
                if (res && res.ok) {
                    // 1. 渲染畫面上的訊息
                    renderSuccessSummary(orderId, $diff);

                    // --- [新增] 準備傳送到 LINE 群組的變更摘要 ---
                    if (APP.var.liffReady && window.liff && liff.isInClient()) {
                        const userName = APP.var.userName || '使用者'; // 確保有抓到名字

                        // 組裝訊息字串
                        let diffMsg = [
                            `✏️ 已更新訂單`,
                            `${orderId}`,
                            `-`,
                            `${userName} 編輯`,
                            `-`
                        ];

                        // 只遍歷有變動的欄位 ($diff 裡面只存放有變動的 key)
                        Object.keys($diff).forEach(k => {
                            const oldV = $originalData[k] || '(空)';
                            const newV = $diff[k];
                            diffMsg.push(`${k}：${oldV} ➝ ${newV}`);
                        });

                        const fullText = diffMsg.join('\n');

                        // 2. 執行 LINE 傳送 (使用者本人回話)
                        liff.sendMessages([
                            {
                                type: 'text',
                                text: fullText
                            }
                        ]).then(() => {
                            console.log('修改摘要已傳送');
                        }).catch((err) => {
                            console.error('發送失敗', err);
                            // 備援：如果詳細版失敗，發送簡易版
                            liff.sendMessages([{ type: 'text', text: `✏️ 已更新訂單：${orderId}` }]).catch(()=>{});
                        });
                    }

                    // 3. 更新本地原始資料 (這行原本就在你的 code 裡)
                    Object.assign($originalData, $diff);

                    if (APP.status?.done) APP.status.done(true, '更新成功');

                } else {
                    $slot.removeClass('ok').addClass('msg err').text('❌ 失敗：' + (res.msg || '未知'));
                }

            } catch (err) {
                console.error(err);
                APP.lockForm($form, false);
                $btn.text('儲存變更');
                showError(err);
            }
        });

        // === Helper Functions ===

        function showError(err) {
            const msg = String(err?.message || err || 'Error');
            $slot.removeClass('ok').addClass('msg err').text('❌ ' + msg);
            if (APP.status?.done) APP.status.done(false, msg);
        }

        function fillForm(data) {
            // 先重置以防殘留
            $form[0].reset();

            Object.keys(data).forEach(k => {
                const $el = $form.find(`[name="${k}"]`);
                if (!$el.length) return;

                let v = data[k];
                // 【修正】金額欄位：若資料庫是空值(null/undefined/"")，強迫標準化為 "0"
                if (['運費金額'].includes(k)) { if (v === '' || v == null) v = '0'; }

                // 如果是電話欄位，且值不是以 0 開頭 (代表被轉成數字了)，幫它補回來
                if (k.includes('電話') && v && !String(v).startsWith('0')) {
                    v = '0' + v;
                }

                // [優化] 使用共用日期轉換
                if ($el.attr('type') === 'date') v = APP.toDateInputValue(v);

                $originalData[k] = (v == null ? '' : String(v).trim());
                $el.val(v);

                // 觸發 UI 連動 (如: 匯款顯示欄位)
                // 這裡簡單觸發 change 事件讓 bindSharedForm 內的監聽器去處理顯示隱藏
                if (['付款方式', '品項分類', '取貨方式', '訂單狀態', '是否已付款', '是否已交貨'].includes(k)) {
                    $el.trigger('change');
                }
            });

            // 處理特殊邏輯: 陌生人 & 同訂購人
            const buyer = data['訂購人姓名'];
            if (buyer === APP.var.stranger) {
                $form.find('#isStranger').prop('checked', true).trigger('change');
            }
            // 檢查是否同訂購人 (簡單比對)
            if (data['訂購人姓名'] === data['收件者姓名'] && data['訂購人電話'] === data['收件者電話']) {
                $form.find('#sameAsBuyer').prop('checked', true).trigger('change');
            }
        }

        function checkWeeklyLock($f) {
            // 如果是週花，鎖定特定欄位
            if ($f.find('[name="品項分類"]').val() === '週花') {
                const locks = ['商品金額', '運費金額', '品項分類', '週花週期', '商品項目'];
                locks.forEach(n => $f.find(`[name="${n}"]`).prop('disabled', true));
            }
        }

        function renderSuccessSummary(id, diffData) {
            let html = `<div class="msg-h">✏️ 已更新訂單<span>${id}</span></div>`;
            const items = Object.keys(diffData).map(k => {
                // 處理顯示文字，避免 undefined
                const oldV = $originalData[k] || '(空)';
                const newV = diffData[k];
                return `<li><b>${k}</b><span class="span-old">${oldV}</span><span class="span-new">${newV}</span></li>`;
            });
            html += `<div class="msg-b"><ul class="confirm-list">${items.join('')}</ul></div>`;
            $slot.removeClass('err').addClass('msg ok').html(html);
        }
    };
})(window, jQuery);