/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Edit (unified)
 * 職責：編輯單筆訂單
 */
;
(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	function fromHashId() {
		try {
			var part = (location.hash.split('?')[1] || '');
			var usp = new URLSearchParams(part);
			return usp.get('id');
		} catch (_e) {
			return null;
		}
	}

	APP.renderEdit = function() {
		const orderId = fromHashId();
		const frag = TPL.tpl('tpl-edit', { orderId: orderId || '' });
		const node = TPL.mount('#main', frag);

		const $form = $('#formEdit');
		const $slot = $form.find('.msg[data-slot="msg"]');

		if (!orderId) {
			$slot.addClass('msg err').text('❌ 缺少訂單編號 id');
			return;
		}

		// === 狀態列：開始 ===
		if (APP.status && APP.status.start) APP.status.start('編輯訂單，' + orderId);

		// 自動灌入 select
		if (typeof this.populateAllSelects === 'function') {
			this.populateAllSelects($form);
		}

		// === checkbox，是陌生人 ===
		APP.bindIsStranger($form);

		// === checkbox，同訂購人資訊 ===
		APP.bindSameAsBuyer($form);

		// === 取貨方式，自取自動帶入地址 / 宅配顯示物流單號 ===
		APP.bindMappingRecvAddr($form);


		// === Step 1. 讀取資料 ===
		// $slot.removeClass('ok err').addClass('msg').text('讀取中…');
		var html = '<div class="msg-h">編輯訂單<span>' + orderId + '</span></div><div class="msg-b">讀取中…</div>';
		$slot.removeClass('ok err').addClass('msg').html(html);
		APP.lockForm($form, true);

		if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 40);

		APP.api('get', { id: orderId })
			.then(function(res) {
				if (res && res.ok && res.item) {
					console.log(res);
					fillForm(res.item);
					$slot.removeClass('msg err ok').empty();
					APP.lockForm($form, false);
                    if (APP.status && APP.status.done) APP.status.done(true, '完成載入');
				} else {
					const note = res && res.msg ? `（${res.msg}）` : '';
					const hint = '❌ 讀取失敗 ' + note;
					$slot.removeClass('ok').addClass('msg err').text(hint);
					if (APP.status && APP.status.done) APP.status.done(false, hint);
				}
			})
			.catch(function(err) {
				const hint = '❌ 錯誤：' + String(err && err.message || err || 'network-error');
				$slot.removeClass('ok').addClass('msg err').text(hint);
				if (APP.status && APP.status.done) APP.status.done(false, hint);
			});

		// === Step 2. 表單送出 ===
		$form.off('submit').on('submit', function(e) {
			e.preventDefault();
			const patch = APP.formToObject($form);
			const $btn = $form.find('button[type="submit"]');

			// 移除空字串欄位
			Object.keys(patch).forEach(k => {
				if (patch[k] == null || patch[k] === '') delete patch[k];
			});

			if (APP.status && APP.status.start) APP.status.start('送出更新，' + orderId);
			$slot.removeClass('err').removeClass('ok').empty();
			APP.lockForm($form, true);
			$btn.text('更新中…');

			// $btn.prop('disabled', true).text('更新中…');
			if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);

			APP.api('update', { id: orderId, patch: patch, actor: APP.var.actor })
				.then(function(res) {

					$btn.text('儲存變更');
					APP.lockForm($form, false);

					if (res && res.ok) {
						renderConfirmSummary($slot, orderId, patch);
            			if (APP.status && APP.status.done) APP.status.done(true, '完成更新，' + id);
					} else {
						const hint = (res && res.msg) ? ('❌ 失敗：' + res.msg) : '❌ 未知錯誤';
						$slot.removeClass('ok').addClass('msg err').text(hint);
						if (APP.status && APP.status.done) APP.status.done(false, hint);
					}
				})
				.catch(function(err) {
					$btn.prop('disabled', false).text('儲存變更');
					const hint = '❌ 錯誤：' + String(err && err.message || err);
					$slot.removeClass('ok').addClass('msg err')
						.text(hint);
					if (APP.status && APP.status.done) APP.status.done(false, hint);
				});
		});

		// === 輔助：填入欄位 ===
		function fillForm(data) {
			console.log("fillForm ::", data);
			const $sameAsBuyer = $form.find('#sameAsBuyer');

			let buyerName = '';
			let recvName = '';

			Object.keys(data).forEach(function (k) {
				console.log(k);
				const $field = $form.find('[name="' + k + '"]');
				const val = data[k];
				console.log(k);
				if ($field.length) $field.val(val);

				if (k === '貨運單號' && val !== '') $form.find('#field-trackingNumber').toggle(true);
				if (k === '訂購人姓名') buyerName = val;
				if (k === '收件者姓名') recvName = val;
			});

			// === 檢查是否「同訂購人資訊」 ===
			if (buyerName && recvName && buyerName === recvName) {
				$sameAsBuyer.prop('checked', true).trigger('change');
			}
		}

		// === 成功摘要顯示 ===
		function renderConfirmSummary($slot, id, patch) {
			let html = `<div class="msg-head">✅ 已更新訂單：${id}</div>`;
			html += '<div class="msg-body"><ul class="confirm-list">';
			Object.keys(patch).forEach(function(k) {
				html += `<li><b>${k}：</b>${patch[k]}</li>`;
			});
			html += '</ul></div>';
			$slot.removeClass('err').addClass('msg ok').html(html);
		}
	};
})(window, jQuery);