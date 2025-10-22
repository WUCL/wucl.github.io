/* =======================
	/js/features/add.js
	內容： 新增頁面。
	來源方法：renderAdd
	======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    Object.assign(APP, {
        renderAdd: function() {
            TPL.render('#main', 'tpl-add');

            var $form = $('#formAdd');
            var $slot = $form.find('[data-slot="msg"]');
            if (w.ORDER_OPTIONS && ORDER_OPTIONS.populateAll) ORDER_OPTIONS.populateAll($form[0]);

            // 預設今天（若欄位存在）
            var $od = $form.find('[name="訂單日期"]');
            if ($od.length && !$od.val()) {
                var d = new Date();
                var mm = ('0' + (d.getMonth() + 1)).slice(-2);
                var dd = ('0' + d.getDate()).slice(-2);
                $od.val(d.getFullYear() + '-' + mm + '-' + dd);
            }

            $form.off('submit.addNS').on('submit.addNS', function(e) {
                e.preventDefault();
                var data = APP.formToObject($form);
                var errs = APP.validateAddData(data);
                APP.showFieldErrors($form, errs);
                APP.logValidationDebug('新增訂單', data, errs);
                if (Object.keys(errs).length) {
                    APP.renderErrorSummary($slot, errs);
                    APP.scrollToFirstError($form);
                    return;
                }

                // 取得 LIFF 使用者（可空）
                var lineName = '',
                    lineId = '';
                (function getProfileMaybe() {
                    try {
                        if (w.liff && liff.isLoggedIn && liff.isLoggedIn()) {
                            liff.getProfile().then(function(p) {
                                lineName = p.displayName || '';
                                lineId = p.userId || '';
                                submitNow();
                            }).catch(submitNow);
                            return;
                        }
                    } catch (e) {}
                    submitNow();
                })();

                function submitNow() {
                    var $btn = $form.find('button[type="submit"]');
                    $btn.prop('disabled', true).text('送出中…');

                    APP.api('create', { data: data, actor: APP.var.actor, lineName: lineName, lineId: lineId })
                        .then(function(res) {
                            $btn.prop('disabled', false).text('送出');
                            $slot.removeClass('ok err').addClass(res && res.ok ? 'msg ok' : 'msg err')
                                .text(res && res.ok ? ('✅ 已建立：' + res.orderId) : ('❌ 失敗：' + ((res && res.msg) || '未知錯誤')));

                            if (res && res.ok) {
                                $form[0].reset();
                                APP.showFieldErrors($form, {});
                                if (ORDER_OPTIONS && ORDER_OPTIONS.populateAll) ORDER_OPTIONS.populateAll($form[0]);
                            }
                        })
                        .catch(function() {
                            $btn.prop('disabled', false).text('送出');
                            $slot.removeClass('ok').addClass('msg err').text('❌ 失敗：network-error');
                        });
                }
            });
        }
    });
})(window);