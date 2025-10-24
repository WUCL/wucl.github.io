/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Edit
 * 職責：編輯單筆訂單
 */
;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    function fromHashId() {
        try {
            var part = (location.hash.split('?')[1] || '');
            var usp = new URLSearchParams(part);
            return usp.get('id');
        } catch (_e) { return null; }
    }

    APP.renderEdit = function() {
        var orderId = fromHashId();
        var tpl = TPL.tpl('tpl-edit', { orderId: orderId || '' });
        TPL.mount('#main', tpl);

        var $box = $('#editBox');
        var $slot = $('#editMsg');
        var $form = $('#editForm');

        if (!orderId) {
            $slot.addClass('msg err').text('缺少訂單編號 id');
            return;
        }

        // 1) 讀取單筆
        $slot.removeClass('ok err').addClass('msg').text('讀取中…');
        APP.api('get', { id: orderId }).then(function(res) {
            if (res && res.ok && res.item) {
                fillForm(res.item);
                $slot.removeClass('msg err ok').empty();
            } else {
                var note = (res && res.msg) ? ('（' + res.msg + '）') : '';
                $slot.removeClass('ok').addClass('msg err').text('尚未開啟 get API ' + note + '。請在 GAS 加入 action="get"。');
            }
        }).catch(function(err) {
            $slot.removeClass('ok').addClass('msg err').text('讀取失敗：' + String(err && err.message || err || 'network-error'));
        });

        // 2) 綁訂送出
        $form.off('submit').on('submit', function(e) {
            e.preventDefault();
            var patch = APP.formToObject($form);
            // 清空空字串的欄位，僅保留有填的（代表要更新）
            Object.keys(patch).forEach(function(k) {
                if (patch[k] == null || patch[k] === '') delete patch[k];
            });

            // 簡單驗證（可擴充）
            var errs = APP.validateEditPatch ? APP.validateEditPatch(patch) : {};
            APP.showFieldErrors($form, errs);
            if (Object.keys(errs).length) {
                APP.renderErrorSummary($slot, errs);
                APP.scrollToFirstError($form);
                return;
            }

            var $btn = $form.find('button[type="submit"]');
            $btn.prop('disabled', true).text('更新中…');
            APP.api('update', { id: orderId, patch: patch, actor: APP.var.actor }).then(function(res) {
                $btn.prop('disabled', false).text('儲存');
                if (res && res.ok) {
                    $slot.removeClass('err').addClass('msg ok').text('✅ 已更新 ' + orderId);
                } else {
                    var hint = (res && res.msg === 'not-implemented') ?
                        '尚未開啟 update API（請在 GAS doPost 的 api 分支加入 action="update"）。' :
                        ('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));
                    $slot.removeClass('ok').addClass('msg err').text(hint);
                }
            }).catch(function(err) {
                $btn.prop('disabled', false).text('儲存');
                $slot.removeClass('ok').addClass('msg err').text('❌ 失敗：' + String(err && err.message || err || 'network-error'));
            });
        });

        function fillForm(o) {
            // 只放常用欄位；其餘你可依需要加在樣板中
            $form.find('[name="是否已付款"]').val(o['是否已付款'] || '');
            $form.find('[name="是否已交貨"]').val(o['是否已交貨'] || '');
            $form.find('[name="貨運單號"]').val(o['貨運單號'] || '');
            $form.find('[name="訂單備註"]').val(o['訂單備註'] || '');
        }
    };
})(window, jQuery);