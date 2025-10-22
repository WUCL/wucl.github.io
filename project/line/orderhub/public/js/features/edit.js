/* =======================
	/js/features/edit.js
	內容： 編輯頁面。
	來源方法：renderEdit
	======================= */
Object.assign(APP, {
	renderEdit: function() {
		const id = this.qs('id') || '';
		const frag = TPL.tpl('tpl-edit', { orderId: id });
		const node = TPL.mount('#main', frag);

		const $oid = $('#oid');
		const $btn = $('#btnLoad');
		const $form = $('#formEdit');
		const $slot = $form.find('[data-slot="msg"]');

		$btn.off('click').on('click', () => {
			const target = ($oid.val() || '').trim();
			if (!target) { $slot.html(TPL.msg('請輸入訂單編號', 'err')); return; }
			location.hash = '#/edit?id=' + encodeURIComponent(target);
		});

		if (!id) return; // 等使用者輸入

		const res = await this.api('getOrder', { orderId: id });
		if (!res || !res.ok || !res.order) { $slot.html(TPL.msg('❌ 找不到訂單', 'err')); return; }

		$form.show();
		$form.find('[name]').each(function() {
			const name = this.name;
			if (res.order[name] != null) this.value = res.order[name];
		});

		$form.off('submit').on('submit', async (e) => {
			e.preventDefault();
			const patch = this.formToObject($form);

			const errs = this.validateEditPatch(patch);
			this.showFieldErrors($form, errs);
			if (Object.keys(errs).length) {
				$slot.html(TPL.msg('請修正紅框欄位後再送出', 'err'));
				return;
			}

			const $btnSave = $form.find('button[type="submit"]');
			$btnSave.prop('disabled', true).text('儲存中…');

			const r = await this.api('update', { orderId: id, patch, actor: this.var.actor });

			$btnSave.prop('disabled', false).text('儲存更新');

			if (r && r.ok) $slot.html(TPL.msg('✅ 已更新', 'ok'));
			else $slot.html(TPL.msg('❌ 失敗：' + (r && r.msg || '未知錯誤'), 'err'));
		});
	}
});