/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Edit (unified)
 * 職責：編輯單筆訂單
 */
;
(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	// 取得 URL Hash 中的 id 參數
	function fromHashId() {
		try {
			const part = (location.hash.split('?')[1] || '');
			const usp = new URLSearchParams(part);
			return usp.get('id');
		} catch (_e) {
			return null;
		}
	}

	// 統一取得 LIFF 使用者資訊 (從 add.js 移植過來的邏輯)
	async function getLineProfile() {
		let lineName = '';
		let lineId = '';
		try {
			const isDev = location.hostname === 'localhost' || location.hostname.startsWith('192.168.');

			// 優先使用 APP 全域變數 (如果 boot.js 有先做好的話)
			if (APP.var.lineId) {
				return { lineName: APP.var.lineName, lineId: APP.var.lineId };
			}

			if (!isDev && window.liff && liff.isLoggedIn && liff.isLoggedIn()) {
				const profile = await liff.getProfile();
				lineName = profile.displayName || '';
				lineId = profile.userId || '';
			} else if (isDev) {
				lineName = 'DEV-LOCAL';
				lineId = 'LOCAL-TEST-ID';
			}
		} catch (e) {
			console.warn('getProfile error', e);
			lineName = 'DEV-FALLBACK';
			lineId = 'FALLBACK-ID';
		}
		return { lineName, lineId };
	}

	APP.renderEdit = function() {
		APP.var.featureMode = 'edit';
		const orderId = fromHashId();

		// 載入模板
		const frag = TPL.tpl('tpl-form', { orderId: orderId || '' });
		const $form = $(frag).find('form');
		const node = TPL.mount('#main', frag);

		// UI 初始化設定
		$form.attr('data-mode', APP.var.featureMode);
		$form.find('[data-show="edit"]').toggle(true);
		const $btn = $form.find('button[type="submit"]');
		$btn.text('儲存變更');
		const $slot = $form.find('.msg[data-slot="msg"]');

		// 狀態變數
		let $originalData = {};
		const $diff = {};

		if (!orderId) {
			$slot.addClass('msg err').text('❌ 缺少訂單編號 id');
			return;
		}

		// === 狀態列：開始 ===
		if (APP.status?.start) APP.status.start('編輯訂單，' + orderId);

		// 自動灌入 select 選單
		if (typeof this.populateAllSelects === 'function') {
			this.populateAllSelects($form);
		}

		APP.bindSharedForm($form);
		APP.bindIsPayShip($form);

		// === Step 1. 讀取資料 ===
		const loadingHtml = `<div class="msg-h">編輯訂單<span>${orderId}</span></div><div class="msg-b">讀取中…</div>`;
		$slot.removeClass('ok err').addClass('msg').html(loadingHtml);
		APP.lockForm($form, true);

		if (APP.status?.tick) APP.status.tick('呼叫 API', 40);

		APP.api('get', { id: orderId })
			.then(function(res) {
				if (res && res.ok && res.item) {
					console.log('[Edit] Loaded:', res.item);
					fillForm(res.item);

					$slot.removeClass('msg err ok').empty();
					APP.lockForm($form, false);
					disabledWeeklyFlower($form);

                    if (APP.status?.done) APP.status.done(true, '完成載入');
				} else {
					const hint = `❌ 讀取失敗 ${res?.msg ? `（${res.msg}）` : ''}`;
					$slot.removeClass('ok').addClass('msg err').text(hint);
					if (APP.status?.done) APP.status.done(false, hint);
				}
			})
			.catch(function(err) {
				const hint = '❌ 錯誤：' + String(err?.message || err || 'network-error');
				$slot.removeClass('ok').addClass('msg err').text(hint);
				if (APP.status?.done) APP.status.done(false, hint);
			});

		// === Step 2. 表單送出 ===
		$form.off('submit').on('submit', async function(e) {
			e.preventDefault();
			const $patch = APP.formToObject($form);

			// 正規化函式
			function normalize(v) {
				if (v == null) return '';
				if (typeof v === 'string') return v.trim();
				return String(v);
			}

			// 比對差異
			Object.keys($patch).forEach(k => {
				const oldVal = normalize($originalData[k]);
				const newVal = normalize($patch[k]);
				if (oldVal !== newVal) $diff[k] = $patch[k]; 
			});

			// 清除 undefined
			Object.keys($diff).forEach(k => { if ($diff[k] === undefined) delete $diff[k]; });

			// 若無變更
			if (Object.keys($diff).length === 0) {
				$slot.removeClass('ok').addClass('msg err').text('⚠️ 沒有變更任何欄位');
				document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
				return;
			}

			// 準備送出
			if (APP.status?.start) APP.status.start('送出更新，' + orderId);
			$slot.removeClass('err ok').empty();
			APP.lockForm($form, true);
			$btn.text('更新中…');
			if (APP.status?.tick) APP.status.tick('呼叫 API', 35);

			// ⚠️ 關鍵修復：確保取得 LINE ID
			const lineProfile = await getLineProfile();

			APP.api('update', {
				id: orderId,
				patch: $diff,
				actor: APP.var.actor,
				lineName: lineProfile.lineName,
				lineId: lineProfile.lineId
			})
			.then(function(res) {
				$btn.text('儲存變更');
				APP.lockForm($form, false);
				disabledWeeklyFlower($form);

				if (res && res.ok) {
					// 更新成功後，更新本地的 originalData，避免重複觸發 diff
					Object.assign($originalData, $diff);

					// 渲染成功訊息
					renderConfirmSummary($slot, orderId, $diff, 1);

					if (APP.status?.done) APP.status.done(true, '完成更新，' + orderId);

					// 嘗試使用 LIFF 前端發送訊息 (做為後端 Push 的備援)
					if (window.liff && liff.isInClient()) {
						liff.sendMessages([{
							type: 'text',
							text: `✅ 訂單已更新：${orderId}`
						}]).catch(err => console.warn('LIFF send msg fail', err));
					}

				} else {
					const hint = (res && res.msg) ? ('❌ 失敗：' + res.msg) : '❌ 未知錯誤';
					$slot.removeClass('ok').addClass('msg err').text(hint);
					if (APP.status?.done) APP.status.done(false, hint);
				}
			})
			.catch(function(err) {
				$btn.prop('disabled', false).text('儲存變更');
				const hint = '❌ 錯誤：' + String(err?.message || err);
				$slot.removeClass('ok').addClass('msg err').text(hint);
				if (APP.status?.done) APP.status.done(false, hint);
			});

			document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});

		// === 輔助函式區 ===

		function fillForm(data) {
			const $sameAsBuyer_check = $form.find('#sameAsBuyer');
			const $isStranger_check = $form.find('#isStranger');
			let buyerInfo = { name: '', phone: '' };
			let recvInfo = { name: '', phone: '' };

			Object.keys(data).forEach(function (k) {
				const $field = $form.find('[name="' + k + '"]');
				let v = data[k];
				if (!$field.length) return;

				if ($field.attr('type') === 'date' && v) v = toDateInputValue(v);

				// 存入原始資料以供比對
				$originalData[k] = v;

				// UI 連動控制
				if (k === '付款方式' && v === '匯款') $form.find('#field-moneyTransfer').toggle(true);
				if (k === '品項分類' && v === '週花') $form.find('#field-weeklyFlower').toggle(true);
				if (k === '取貨方式' && ['宅配', '郵寄'].includes(v)) $form.find('#field-trackingNumber').toggle(true);

				// 陌生人檢查
				if (k === '訂購人姓名' && v === APP.var.stranger) {
					$isStranger_check.prop('checked', true).trigger('change');
				}

				// 同步檢查用資料
				if (k === '訂購人姓名') buyerInfo.name = v;
				if (k === '訂購人電話') buyerInfo.phone = v;
				if (k === '收件者姓名') recvInfo.name = v;
				if (k === '收件者電話') recvInfo.phone = v;

				$field.val(v);
			});

			// 自動勾選「同訂購人」
			const isSame = (buyerInfo.name === recvInfo.name && buyerInfo.phone === recvInfo.phone);
			$sameAsBuyer_check.prop('checked', isSame).trigger('change');
		}

		function toDateInputValue(isoString) {
			if (!isoString) return '';
			const d = new Date(isoString);
			const offset = d.getTimezoneOffset();
			const local = new Date(d.getTime() - offset * 60000);
			return local.toISOString().split('T')[0];
		}

		function disabledWeeklyFlower($f) {
			if ($f.find('[name="品項分類"]').val() === '週花') {
				const fieldsToLock = ['訂單金額', '品項分類', '週花週期', '商品項目'];
				fieldsToLock.forEach(name => $f.find(`[name="${name}"]`).prop('disabled', true));
			}
		}

		function renderConfirmSummary($slot, $id, $data, $orderCount) {
			console.log($orderCount);
			console.log($data);
			let html = `<div class="msg-h">✅ 已更新訂單<span>${$id}</span></div>`;

			const lis = Object.keys($data).map(k =>
				`<li><b>${k}</b><span class="span-old">${$originalData[k] || '(空)'}</span><span class="span-new">${$data[k]}</span></li>`
			);

			html += `<div class="msg-b"><ul class="confirm-list">${lis.join('')}</ul></div>`;
			$slot.removeClass('err').addClass('msg ok').html(html);
		}
	};
})(window, jQuery);