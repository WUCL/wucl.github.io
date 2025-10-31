/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Add
 * 職責：新增訂單頁面
 * 安全版：不觸發 LIFF 初始化、在本機模擬資料、異常時自動 fallback
 */
;
(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	APP.renderAdd = function() {
		const frag = TPL.tpl('tpl-add');
		const node = TPL.mount('#main', frag);

		const $form = $('#formAdd');
		const $slot = $form.find('.msg[data-slot="msg"]');

		// 自動灌入 select
		if (typeof this.populateAllSelects === 'function') {
			this.populateAllSelects($form);
		}

		// 預設今天日期
		$('#formAdd').find('[name="訂單日期"]').val(new Date().toISOString().split('T')[0]);

		// === checkbox，是陌生人 ===
		APP.bindIsStranger($form);

		// === checkbox，同訂購人資訊 ===
		APP.bindSameAsBuyer($form);

		// === 取貨方式，自取自動帶入地址 / 宅配顯示物流單號 ===
		APP.bindMappingRecvAddr($form);

		// === 週花 UI（顯示/隱藏「週期」欄，並預填商品項目），只在 add 發生 ===
		var $pCat = $form.find('[name="品項分類"]');
		var $weeklyFlowerWrap = $('#field-weeklyFlower');
		var $item = $form.find('[name="商品項目"]');

		function updateWeeklyUI() {
			if (!$pCat.length) return;
			var isWeekly = String($pCat.val() || '') === '週花';

			$weeklyFlowerWrap.css('display', isWeekly ? '' : 'none');
			if (isWeekly) $item.val('週花');
		}
		$pCat.on('change', updateWeeklyUI);


		// submit 送出
		$form.off('submit').on('submit', async (e) => {
			e.preventDefault();

			// === 狀態列：開始 ===
			if (APP.status && APP.status.start) APP.status.start('新增訂單');

			const data = this.formToObject($form);
			const $btn = $form.find('button[type="submit"]');

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


			// [週花]邏輯：是否批次建立
			var isWeekly = String(data['品項分類'] || '') === '週花';
			var repeatN  = 1;
			if (isWeekly) {
				console.log('[週花]');
				var rawN = Number(data['週期'] || 1);
				repeatN  = Math.max(1, Math.min(12, isNaN(rawN) ? 1 : rawN));
				// 若使用者沒填商品項目，預設為「週花」
				if (!data['商品項目']) data['商品項目'] = '週花';
			}

			// 送出
			if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);
			$btn.prop('disabled', true).text('送出中…');

			let res;
			try {
				// === [週花]批次建立（後端會產單一 orderId + 拆 N 筆 + 商品項目 1/N…）===
				if (isWeekly && repeatN > 1) {
					res = await this.api('create_weekly', {
						data: data,
						repeat: repeatN,
						actor: this.var.actor,
						lineName: lineName,
						lineId: lineId
					});
					} else {
					// === 一般單筆建立（或週花但 n=1）===
					res = await this.api('create', {
						data: data,
						actor: this.var.actor,
						lineName: lineName,
						lineId: lineId
					});
				}

			} catch (err) {
				console.error('[API] create error:', err);
				res = { ok: false, msg: 'network-error' };
			}

			$btn.prop('disabled', false).text('送出');

			if (res && res.ok) {
				if (APP.status && APP.status.tick) APP.status.tick('處理回應', 30);
				console.log(data);
				console.log(res);
				$slot.removeClass('err').addClass('ok');

				// 週花顯示建立成功訊息
				var html = (res.created && res.created > 1)
					? ('<div class="msg-h">✅ 已建立訂單<span>' + res.orderId + '</span>（共 ' + res.created + ' 筆）</div>')
					: ('<div class="msg-h">✅ 已建立訂單<span>' + res.orderId + '</span></div>');

				var lis = [];

				for (let key in data) {
					if (!data.hasOwnProperty(key)) return;
					lis.push('<li><b>' + key + '</b><span>' + data[key] + '</span></li>');
				}
				html += '<div class="msg-b"><ul class="confirm-list">' + lis.join('') + '</ul></div>';
				$slot.html(html);

				document.querySelector(`body`).scrollIntoView({ behavior: 'smooth', block: 'start' });

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
				// done & reset
				if ($form[0] && $form[0].reset) $form[0].reset();
				$('#formAdd').find('[name="訂單日期"]').val(new Date().toISOString().split('T')[0]);
				$weeklyFlowerWrap.css('display', 'none');
				$trackingNumberWrap.css('display', 'none');

				if (APP.status && APP.status.done) APP.status.done(true, '完成（' + res.orderId + '）');

				// [週花]顯示方式
				if (APP.status && APP.status.done) {
					var okMsg = (res.created && res.created > 1)
					? ('完成（' + res.orderId + '，共 ' + res.created + ' 筆）')
					: ('完成（' + res.orderId + '）');
					APP.status.done(true, okMsg);
				}

			} else {
				// 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
				if (res && res.msg === 'invalid-json') {
					console.warn('[API] invalid-json detail:', {
						status: res.status,
						contentType: res.contentType,
						snippet: res.snippet
					});
				}
				$slot.removeClass('ok').addClass('err').text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));

				if (APP.status && APP.status.done) APP.status.done(false, (res && res.msg) || '未知錯誤');
			}
		});

	};
})(window, jQuery);