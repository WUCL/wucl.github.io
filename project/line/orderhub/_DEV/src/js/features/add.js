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
		$form.find('[name="訂單日期"]').each(function() {
			if (!this.value) {
				const today = new Date().toISOString().split('T')[0];
				this.value = today;
			}
		});


		//=== 同訂購人資訊 ===
		const $sameAsBuyer = $('#sameAsBuyer'),
			$buyerName = $form.find('[name="訂購人姓名"]'),
			$buyerPhone = $form.find('[name="訂購人電話"]'),
			$recvName = $form.find('[name="收件者姓名"]'),
			$recvPhone = $form.find('[name="收件者電話"]');
		// 同步函式：即時把訂購人資訊複製到收件人
		function syncBuyerToReceiver() {
			if (!$sameAsBuyer.prop('checked')) return;
			$recvName.val($buyerName.val());
			$recvPhone.val($buyerPhone.val());
		}
		// 當訂購人欄位變動時，即時同步 & 當勾選狀態改變時
		$buyerName.on('input', syncBuyerToReceiver);
		$buyerPhone.on('input', syncBuyerToReceiver);
		$sameAsBuyer.on('change', function() { if (this.checked) syncBuyerToReceiver(); return; });


		//=== 取貨方式，自動帶入地址 ===
		const $receiptType = $form.find('[name="取貨方式"]'),
			$recvAddr = $form.find('[name="收件者地址"]');

		function mappingRecvAddr() {
			var v   = $receiptType.val() || '',
				map = (w.MAPPING_receiptType) || {},
				mapped = map.hasOwnProperty(v) ? map[v] : '';
			if (mapped === '') return;
			$recvAddr.val(mapped);
		}

		$receiptType.on('change', mappingRecvAddr);

		// === 週花 UI（顯示/隱藏「週期」欄，並預填商品項目） ===
		/*
		var $category   = $form.find('[name="品項分類"]');
		var $period     = $form.find('[name="週期"]');           // 可沒有，安全檢查
		var $periodWrap = $('#field-period');                    // 你模板裡包住週期欄位的容器
		var $item       = $form.find('[name="商品項目"]');

		function updateWeeklyUI() {
			if (!$category.length) return;
			var isWeekly = String($category.val() || '') === '週花';

			$periodWrap.css('display', isWeekly ? '' : 'none');
			if (isWeekly) $item.val('週花');
		}
		$category.on('change', updateWeeklyUI);
		*/


		// submit 送出
		$form.off('submit').on('submit', async (e) => {
			e.preventDefault();

			// === 狀態列：開始 ===
			if (APP.status && APP.status.start) APP.status.start('新增訂單');

			const data = this.formToObject($form);
			const $btn = $form.find('button[type="submit"]');
			// const $slot = $form.find('[data-slot="msg"]');

			// 驗證
			if (APP.status && APP.status.tick) APP.status.tick('驗證資料', 25);
			const errs = this.validateAddData(data);
			this.showFieldErrors($form, errs);
			if (typeof this.logValidationDebug === 'function') {
				this.logValidationDebug('新增訂單', data, errs);
			}

			if (Object.keys(errs).length) {
				this.renderErrorSummary($slot, errs);
				this.scrollToFirstError($form);
				if (APP.status && APP.status.done) APP.status.done(false, '驗證失敗');
				return; // 停止送出
			}

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


			// 週花邏輯：是否批次建立
			/*
			var isWeekly = String(data['品項分類'] || '') === '週花';
			var repeatN  = 1;
			if (isWeekly) {
				var rawN = Number(data['週期'] || 1);
				repeatN  = Math.max(1, Math.min(12, isNaN(rawN) ? 1 : rawN));
				// 若使用者沒填商品項目，預設為「週花」
				if (!data['商品項目']) data['商品項目'] = '週花';
			}
			*/


			// 送出
			if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 35);
			$btn.prop('disabled', true).text('送出中…');

			let res;
			try {
				res = await this.api('create', {
                    data,
                    actor: this.var.actor,
                    lineName,
                    lineId
                });

				// === 週花批次建立（後端會產單一 orderId + 拆 N 筆 + 商品項目 1/N…）===
				/*
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
				*/
			} catch (err) {
				console.error('[API] create error:', err);
				res = { ok: false, msg: 'network-error' };
			}

			$btn.prop('disabled', false).text('送出');

			if (res && res.ok) {
				if (APP.status && APP.status.tick) APP.status.tick('處理回應', 30);
				console.log(data);
				console.log(res);
				// $slot.removeClass('err').addClass('ok').text('✅ 已建立：' + res.orderId);
				$slot.removeClass('err').addClass('ok');

				// 週花顯示建立成功訊息
				/*
				var html = (res.created && res.created > 1)
					? ('<div class="msg-h">✅ 已建立訂單<sapn>' + res.orderId + '</span>（共 ' + res.created + ' 筆）</div>');
					: ('<div class="msg-h">✅ 已建立訂單<sapn>' + res.orderId + '</span></div>');
				*/

				var html = '<div class="msg-h">✅ 已建立訂單<sapn>' + res.orderId + '</span></div>';
				var lis = [];

				for (let key in data) {
					if (!data.hasOwnProperty(key)) return;
					console.log(key + ":" + data[key]);
					lis.push('<li><b>' + key + '</b><span>' + data[key] + '</span></li>');
				}
				html += '<div class="msg-b"><ul class="confirm-list">' + lis.join('') + '</ul></div>';
				$slot.html(html);

				document.querySelector(`[data-slot="msg"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });

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
				if ($form[0] && $form[0].reset) $form[0].reset();
				this.showFieldErrors($form, {}); // 清錯
				if (typeof this.populateAllSelects === 'function') this.populateAllSelects($form);

				if (APP.status && APP.status.done) APP.status.done(true, '完成（' + res.orderId + '）');

				// 週花顯示方式
				/*
				if (APP.status && APP.status.done) {
					var okMsg = (res.created && res.created > 1)
					? ('完成（' + res.orderId + '，共 ' + res.created + ' 筆）')
					: ('完成（' + res.orderId + '）');
					APP.status.done(true, okMsg);
				}
				*/
			} else {
				// 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
				if (res && res.msg === 'invalid-json') {
					console.warn('[API] invalid-json detail:', {
						status: res.status,
						contentType: res.contentType,
						snippet: res.snippet
					});
				}
				$slot
					.removeClass('ok')
					.addClass('err')
					.text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));

				if (APP.status && APP.status.done) APP.status.done(false, (res && res.msg) || '未知錯誤');
			}
		});

	};
})(window, jQuery);