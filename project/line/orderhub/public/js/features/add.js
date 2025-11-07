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
		APP.var.featureMode = 'add';
		const frag = TPL.tpl('tpl-form');
		const $form = $(frag).find('form');
		const node = TPL.mount('#main', frag);

		//
		console.log(APP.var.featureMode);

		$form.attr('data-mode', APP.var.featureMode);
		$form.find('[data-show="edit"]').remove();
		const $btn = $form.find('button[type="submit"]');
		$btn.text('送出'); // 預設文字
		//

		const $slot = $form.find('.msg[data-slot="msg"]');

		// 自動灌入 select
		if (typeof this.populateAllSelects === 'function') {
			this.populateAllSelects($form);
		}

		// 預設今天日期
		$form.find('[name="訂單日期"]').val(new Date().toISOString().split('T')[0]);

		APP.bindSharedForm($form);

		// === 週花 UI（show/hide[週花週期]，並預填商品項目），只在 add 發生 ===
		var $pCatWrap = $form.find('[name="品項分類"]');
		var $item = $form.find('[name="商品項目"]');
		var $weeklyFlowerWrap = $('#field-weeklyFlower');

		function updateWeeklyUI() {
			if (!$pCatWrap.length) return;
			var isWeekly = String($pCatWrap.val() || '') === '週花';
			var wasWeekly = $item.hasClass('wasWeekly');
			$weeklyFlowerWrap.toggle(isWeekly);
			if (isWeekly && !wasWeekly) {
				$item.data('ORIG_KEY', $item.val()).addClass('wasWeekly');
				$item.val('週花');
			}
			if (!isWeekly && wasWeekly) {
				$item.val($item.data('ORIG_KEY'));
				$item.removeData('ORIG_KEY').removeClass('wasWeekly');
			}
			return;
		}
		$pCatWrap.on('change', updateWeeklyUI);

		// submit 送出
		$form.off('submit').on('submit', async (e) => {
			e.preventDefault();

			// === 狀態列：開始 ===
			if (APP.status && APP.status.start) APP.status.start('新增訂單');

			const data = this.formToObject($form);
			// const $btn = $form.find('button[type="submit"]');

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


			// [週花週期]邏輯：是否批次建立
			var isWeekly = String(data['品項分類'] || '') === '週花';
			var repeatN  = 1;
			if (isWeekly) {
				var rawN = Number(data['週花週期'] || 1);
				repeatN  = Math.max(1, Math.min(12, isNaN(rawN) ? 1 : rawN));
				// 若使用者沒填商品項目，預設為「週花」
				if (!data['商品項目']) data['商品項目'] = '週花';
			}

			// 送出
			// $btn.prop('disabled', true).text('送出中…');
			// 先鎖表單 + 換按鈕文字
			if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);
			$slot.removeClass('ok err').empty();
			APP.lockForm($form, true);
			$btn.text('送出中…');
			document.querySelector(`body`).scrollIntoView({ behavior: 'smooth', block: 'start' });

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

			// $btn.prop('disabled', false).text('送出');
			// 還原按鈕 & 解鎖表單（不論成功/失敗都會執行）
			$btn.text('送出');
			APP.lockForm($form, false);

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
				$form.find('[name="訂單日期"]').val(new Date().toISOString().split('T')[0]);
				// $form.find('[name="訂購人姓名"]').prop('readonly', false);
				$form.find('#isStranger').prop('checked', false).trigger('change');
        		$form.find('.field.showhide').css('display', 'none');

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