/* =======================
	/js/features/edit.js
	內容： 編輯頁面（載入 → 填表單 → diff → update）
	來源方法：APP.renderEdit()
======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    Object.assign(APP, {
        renderEdit: function() {
            var id = APP.qs('id') || '';
            var frag = TPL.tpl('tpl-edit', { orderId: id });
            TPL.mount('#main', frag);

            var $form = $('#formEdit');
            var $slot = $form.find('[data-slot="msg"]');

            if (w.ORDER_OPTIONS && ORDER_OPTIONS.populateAll) ORDER_OPTIONS.populateAll($form[0]);

            if (!id) return; // 等使用者輸入或從 list 點擊導入

            // 載入
            APP.api('get', { id: id }).then(function(r) {
                if (!r || !r.ok || !r.order) {
                    $slot.html(TPL.msg('❌ 找不到訂單', 'err'));
                    return;
                }
                var data = r.order;
                $form.data('base', data);
                $form.find('[name]').each(function() { if (data.hasOwnProperty(this.name) && data[this.name] != null) this.value = data[this.name]; });
            });

            // 送出
            $(document).off('submit.editNS', '#formEdit').on('submit.editNS', '#formEdit', function(e) {
                e.preventDefault();
                var $btn = $form.find('button[type="submit"]');
                if ($btn.data('busy')) return;
                $btn.data('busy', true).prop('disabled', true).text('儲存中…');

                var curr = APP.formToObject($form);
                var base = $form.data('base') || {};
                var patch = diff(base, curr);
                if (!Object.keys(patch).length) {
                    $slot.html(TPL.msg('沒有任何變更', 'ok'));
                    $btn.data('busy', false).prop('disabled', false).text('儲存變更');
                    return;
                }

                // 產生 nonce（舊版相容）
                var clientNonce;
                if (w.crypto && typeof crypto.randomUUID === 'function') clientNonce = crypto.randomUUID();
                else clientNonce = (Date.now() + '_' + Math.random().toString(16).slice(2));

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
                    APP.api('update', { id: id, patch: patch, actor: APP.var.actor, lineName: lineName, lineId: lineId, clientNonce: clientNonce })
                        .then(function(res) {
                            $btn.data('busy', false).prop('disabled', false).text('儲存變更');
                            if (res && res.ok) {
                                $slot.html(TPL.msg('✅ 已更新', 'ok'));
                                $form.data('base', Object.assign({}, base, patch));
                            } else if (res && res.duplicate) {
                                $slot.html(TPL.msg('✅ 已處理（重複請求略過）', 'ok'));
                            } else {
                                $slot.html(TPL.msg('❌ 失敗：' + ((res && res.msg) || '未知錯誤'), 'err'));
                            }
                        })
                        .catch(function() {
                            $btn.data('busy', false).prop('disabled', false).text('儲存變更');
                            $slot.html(TPL.msg('❌ 失敗：network-error', 'err'));
                        });
                }

                function diff(a, b) {
                    var out = {};
                    var keys = {};
                    for (var k in a)
                        if (Object.prototype.hasOwnProperty.call(a, k)) keys[k] = 1;
                    for (var k2 in b)
                        if (Object.prototype.hasOwnProperty.call(b, k2)) keys[k2] = 1;
                    for (var key in keys) {
                        var av = a[key],
                            bv = b[key];
                        var as = (av == null ? '' : String(av)).trim();
                        var bs = (bv == null ? '' : String(bv)).trim();
                        if (as !== bs) out[key] = bs;
                    }
                    delete out['訂單編號'];
                    return out;
                }
            });
        }
    });
})(window);