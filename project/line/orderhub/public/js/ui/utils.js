/* =======================
	/js/ui/utils.js
	內容： 共用小工具（表單、選項與錯誤顯示等）。
	來源方法：
	formToObject, qs, setMeta
	populateSelect, populateAllSelects, getOptionsStatic
	validateAddData, validateEditPatch
	showFieldErrors, renderErrorSummary, logValidationDebug, scrollToFirstError
	======================= */
Object.assign(APP, {
	formToObject: function($form) {
		const out = {};
		($form.serializeArray() || []).forEach(p => out[p.name] = p.value);
		return out;
	},
	qs: function(k) {
		const q = new URLSearchParams((location.hash.split('?')[1] || '')); return q.get(k);
	},
	setMeta: function(t) {
		this.el.$meta.text(t || '');
	},

	// 塞進單一 <select>
	populateSelect: function($select, items, opts) {
		const el = $select[0];
		if (!el) return;
		const doc = document;
		const ph = ($select.attr('data-placeholder') || '請選擇');
		const withOther = $select.attr('data-with-other') == '1';

		el.innerHTML = '';
		// placeholder
		const phOpt = doc.createElement('option');
		phOpt.value = '';
		phOpt.text = ph;
		phOpt.disabled = true;
		phOpt.selected = true;
		el.appendChild(phOpt);

		// items: ["A","B"] 或 [{value,label}]
		(items || []).forEach(it => {
			const v = (typeof it === 'string') ? it : (it.value ?? it.label);
			const l = (typeof it === 'string') ? it : (it.label ?? it.value);
			if (!v) return;
			const opt = doc.createElement('option');
			opt.value = v;
			opt.text = l;
			el.appendChild(opt);
		});

		if (withOther) {
			const o = doc.createElement('option');
			o.value = '__OTHER__';
			o.text = '其他（請填備註）';
			el.appendChild(o);
		}
	},
	// 🔑 一次掃描容器內所有 [data-opt]，自動填入對應 options
	populateAllSelects: function($scope) {
		const self = this;
		($scope || $(document)).find('select[data-opt]').each(function() {
			const key = $(this).attr('data-opt');
			const items = self.getOptionsStatic(key);
			self.populateSelect($(this), items);
		});
	},
	// 取靜態 options（之後可改 API 讀取）
	getOptionsStatic: function(key) {
		return (window.ORDER_OPTIONS && window.ORDER_OPTIONS[key]) ? window.ORDER_OPTIONS[key] : [];
	},

	validateAddData: function(data) {
		const errs = {};
		const $form = $('#formAdd'); // ← 指向目前新增用的 form

		// 安全檢查器：欄位存在才驗證
		const hasField = (name) => $form.find('[name="' + name + '"]').length > 0;

		// 接單平台（必填）
		if (hasField('接單平台') && !data['接單平台']) errs['接單平台'] = '請選擇接單平台';

		// 訂購人姓名（至少 2 字）
		if (hasField('訂購人姓名') && (!data['訂購人姓名'] || data['訂購人姓名'].trim().length < 2)) errs['訂購人姓名'] = '至少 2 個字';

		// 訂購人電話（必填 + 格式）
		if (hasField('訂購人電話')) {
			if (!data['訂購人電話']) {
				errs['訂購人電話'] = '必填';
			} else {
				const phone = data['訂購人電話'].replace(/\s/g, '');
				if (!/^(\+?886-?|0)?[0-9\-]{8,13}$/.test(phone)) {
					errs['訂購人電話'] = '電話格式不正確';
				}
			}
		}

		// 訂單金額（數字）
		if (hasField('訂單金額')) {
			const amt = Number(data['訂單金額']);
			if (!(amt >= 0)) errs['訂單金額'] = '請輸入數字';
		}

		// 交貨日期（可空；若填則 YYYY-MM-DD）
		if (hasField('交貨日期') && data['交貨日期'] && !/^\d{4}-\d{2}-\d{2}$/.test(data['交貨日期'])) errs['交貨日期'] = '日期格式需為 YYYY-MM-DD';

		return errs;
	},

	validateEditPatch: function(patch) {
		const errs = {};
		if ('貨運單號' in patch && patch['貨運單號'] && patch['貨運單號'].length > 50) errs['貨運單號'] = '字數過長';
		if ('是否已付款' in patch && !/^(未付款|已付款|貨到付款)$/.test(patch['是否已付款'])) errs['是否已付款'] = '選項不合法';
		if ('是否已交貨' in patch && !/^(未交貨|已交貨)$/.test(patch['是否已交貨'])) errs['是否已交貨'] = '選項不合法';
		return errs;
	},

	showFieldErrors: function($form, errs) {
		// 清除舊錯誤
		$form.find('.field-error').remove();
		$form.find('input,select,textarea').removeClass('is-error').attr('aria-invalid', 'false');
		$form.find('.field').removeClass('has-error');

		// 畫出新錯誤
		Object.keys(errs).forEach(function(name) {
			const $el = $form.find('[name="' + name + '"]');
			if ($el.length) {
				$el.addClass('is-error').attr('aria-invalid', 'true');
				$el.closest('.field').addClass('has-error');
				$el.after('<div class="field-error">' + errs[name] + '</div>');
			}
		});
	},

	// 將錯誤顯示在表單頂部 slot（同時回傳條目陣列）
	renderErrorSummary: function($slot, errs) {
		const keys = Object.keys(errs);
		if (!keys.length) { $slot.empty(); return keys; }

		const list = keys.map(k => `<li><strong>${k}</strong>：${errs[k]}</li>`).join('');
		const html = `<div class="msg err">
		請修正下列欄位後再送出：
		<ul style="margin:6px 0 0 18px">${list}</ul>
		</div>`;
		$slot.html(html);
		return keys;
	},
	// 在 console 檢查錯誤與目前值
	logValidationDebug: function(context, data, errs) {
		try {
			console.groupCollapsed(`[Validate] ${context} — 共 ${Object.keys(errs).length} 筆錯誤`);
			console.log('表單值 =', data);
			if (Object.keys(errs).length) console.table(errs);
			console.groupEnd();
		} catch (_) {}
	},

	// 捲到第一個錯誤並聚焦
	scrollToFirstError: function($form) {
		const $first = $form.find('.is-error').first();
		if ($first.length) {
			$first[0].focus?.();
			$first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	},
});