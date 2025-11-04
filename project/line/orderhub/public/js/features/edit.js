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
		APP.var.featureMode = 'edit';
		const orderId = fromHashId();
		const frag = TPL.tpl('tpl-form', { orderId: orderId || '' });
		const $form = $(frag).find('form');
		const node = TPL.mount('#main', frag);

		//
		$form.attr('data-mode', APP.var.featureMode);
		$form.find('[data-show="edit"]').toggle(APP.var.featureMode === 'edit');
		const $btn = $form.find('button[type="submit"]');
		$btn.text('儲存變更'); // 預設文字
		//

		const $slot = $form.find('.msg[data-slot="msg"]');

		let $originalData = {}; // 確認 diff 存取比對用
		const $diff = {};

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

		// === 訂單狀態，判斷done之前是否已付款已出貨 ===
		APP.bindIsPayShip($form);

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

					let pCat_el = $form.find('[name="品項分類"]');
					if (pCat_el.val() === '週花') {
						[
							pCat_el,
							$form.find('[name="週花週期"]')
						].forEach(function ($el) {
							$el.prop('disabled', true);
						});
					}

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
			const $patch = APP.formToObject($form);
			// const $btn = $form.find('button[type="submit"]');

			// 若需要，這裡可做型別/格式正規化（數字、日期、去頭尾空白…）
			function normalize(v) {
				if (v == null) return ''; // 統一 null → ''
				if (typeof v === 'string') return v.trim(); // 去空白避免誤判
				return String(v);
			}

			// 只保留真的有變更的鍵（允許空字串作為「清空」）
			Object.keys($patch).forEach(k => {
				const oldVal = normalize($originalData[k]);
				const newVal = normalize($patch[k]);
				if (oldVal !== newVal) $diff[k] = $patch[k]; // 注意：保留原樣（不要 normalize 往後送）
			});

			// 不送 undefined（通常不會有，但保險）
			Object.keys($diff).forEach(k => {
				if ($diff[k] === undefined) delete $diff[k];
			});

			// 若完全沒有變更
			if (Object.keys($diff).length === 0) {
				$slot.removeClass('ok').addClass('msg err').text('⚠️ 沒有變更任何欄位');
				document.querySelector(`body`).scrollIntoView({ behavior: 'smooth', block: 'start' });
				return;
			}
			console.log($diff);

			if (APP.status && APP.status.start) APP.status.start('送出更新，' + orderId);
			$slot.removeClass('err').removeClass('ok').empty();
			APP.lockForm($form, true);
			$btn.text('更新中…');

			// $btn.prop('disabled', true).text('更新中…');
			if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);

			APP.api('update', { id: orderId, patch: $diff, actor: APP.var.actor })
			.then(function(res) {
				$btn.text('儲存變更');
				APP.lockForm($form, false);

				if (res && res.ok) {
					renderConfirmSummary($slot, orderId, $diff, 1);
					if (APP.status && APP.status.done) APP.status.done(true, '完成更新，' + orderId);
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
			document.querySelector(`body`).scrollIntoView({ behavior: 'smooth', block: 'start' });
		});

		// === 輔助：填入欄位 ===
		function fillForm(data) {
			const $sameAsBuyer_check = $form.find('#sameAsBuyer');
			const $isStranger_check = $form.find('#isStranger');

			let buyerName = '';
			let recvName = '';

			Object.keys(data).forEach(function (k) {
				const $field = $form.find('[name="' + k + '"]');
				let v = data[k];
				if (!$field.length) return;

				// format date
                if ($field.attr('type') === 'date' && v) v = toDateInputValue(v);
				$originalData[k] = v; // 確認日期格式後才存入

				// show/hide field
				if (k === '付款方式' && v === '匯款') $form.find('#field-moneyTransfer').toggle(true);
				if (k === '品項分類' && v === '週花') $form.find('#field-weeklyFlower').toggle(true);
				if (k === '取貨方式' && (v === '宅配' || v === '郵寄')) $form.find('#field-trackingNumber').toggle(true);

				// extra check
				if (k === '訂購人姓名' && v === APP.var.stranger) $isStranger_check.prop('checked', true).trigger('change');
				if (k === '訂購人姓名') buyerName = v;
				if (k === '收件者姓名') recvName = v;

				$field.val(v);
			});

			// === 檢查是否「同訂購人資訊」 ===
			if (buyerName && recvName && buyerName === recvName) {
				$sameAsBuyer_check.prop('checked', true).trigger('change');
			}
		}

		function toDateInputValue(isoString) {
			if (!isoString) return '';
			const d = new Date(isoString);
			// 修正為本地時間
			const offset = d.getTimezoneOffset();
			const local = new Date(d.getTime() - offset * 60000);
			return local.toISOString().split('T')[0]; // 取 YYYY-MM-DD
		}


		// === 成功摘要顯示 ===
		function renderConfirmSummary($slot, $id, $data, $orderCount) {
			let html = ($orderCount > 1)
				? (`<div class="msg-h">✅ 已建立訂單<span>${$id}</span>（共 ${$orderCount} 筆）</div>`)
				: (`<div class="msg-h">✅ 已建立訂單<span>${$id}</span></div>`);

			var lis = [];
			Object.keys($data).forEach(k => {
				lis.push(`<li><b>${k}</b><span class="span-old">${$originalData[k]}</span><span class="span-new">${$data[k]}</span></li>`);
			});
			// Object.keys($data).forEach(function(k) {
			// 	lis.push('<li><b>' + k + '</b><span>' + $data[k] + '</span></li>');
			// });
			html += '<div class="msg-b"><ul class="confirm-list">' + lis.join('') + '</ul></div>';
			$slot.removeClass('err').addClass('msg ok').html(html);
			document.querySelector(`body`).scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};
})(window, jQuery);