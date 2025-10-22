/* =======================
	/js/features/add.js
	內容： 新增頁面。
	來源方法：renderAdd
	======================= */
Object.assign(APP, {
	renderAdd: function() {
		const frag = TPL.tpl('tpl-add');
		const node = TPL.mount('#main', frag);

		const $form = $('#formAdd');
		const $slot = $form.find('[data-slot="msg"]');

		this.populateAllSelects($form); // ← 一次自動灌入所有 select

		$form.find('[name="訂單日期"]').each(function() {
			if (!this.value) {
				const today = new Date().toISOString().split('T')[0];
				this.value = today;
			}
		});

		$form.off('submit').on('submit', async (e) => {
			e.preventDefault();

			const data = this.formToObject($form);
			const $btn  = $form.find('button[type="submit"]');
			const $slot = $form.find('[data-slot="msg"]');

			// 驗證
			const errs = this.validateAddData(data);
			this.showFieldErrors($form, errs);
			this.logValidationDebug('新增訂單', data, errs);

			if (Object.keys(errs).length) {
				this.renderErrorSummary($slot, errs);
				this.scrollToFirstError($form);
				return; // 停止送出
			}

			// 取得 LINE 使用者資訊（若已登入）
			let lineName = '';
			let lineId   = '';

			try {
				const isDev = location.hostname === 'localhost' || location.hostname.startsWith('192.168.');
				if (!isDev && window.liff && liff.isLoggedIn && liff.isLoggedIn()) {
					const profile = await liff.getProfile();
					lineName = profile.displayName || '';
					lineId   = profile.userId || '';
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

			// 送出
			$btn.prop('disabled', true).text('送出中…');
			let res;
			try {
				res = await this.api('create', {
					data,
					actor: this.var.actor,
					lineName,
					lineId
				});
			} catch (err) {
				console.error('[API] create error:', err);
				res = { ok: false, msg: 'network-error' };
			}
			$btn.prop('disabled', false).text('送出');

			if (res && res.ok) {
				$slot.removeClass('err').addClass('msg ok').text('✅ 已建立：' + res.orderId);
				try {
					if (window.liff) {
						await liff.sendMessages([{ type: 'text', text: '✅ 新增訂單：' + res.orderId }]);
					}
				} catch (_) {}
				// 清空表單與錯誤
				$form[0].reset();
				this.showFieldErrors($form, {}); // 清錯
				this.populateAllSelects?.($form); // 重灌 placeholder
			} else {
				// 額外診斷（若 api() 回傳 invalid-json 會有補充欄位）
				if (res && res.msg === 'invalid-json') {
					console.warn('[API] invalid-json detail:', {
						status: res.status, contentType: res.contentType, snippet: res.snippet
					});
				}
				$slot.removeClass('ok').addClass('msg err')
				  .text('❌ 失敗：' + ((res && res.msg) || '未知錯誤'));
			}
		});
	}
});