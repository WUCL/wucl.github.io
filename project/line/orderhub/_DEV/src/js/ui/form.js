/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — UI/Form helpers
 * 職責：表單序列化、select 選項灌入、欄位驗證、錯誤渲染、捲動
 * 依賴：jQuery、ORDER_OPTIONS（data/options.js）
 */
;(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	// 取表單物件
	APP.formToObject = function($form) {
		var out = {};
		var arr = ($form && $form.serializeArray) ? $form.serializeArray() : [];
		for (var i = 0; i < arr.length; i++) out[arr[i].name] = arr[i].value;
		return out;
	};

	// select 填充
	APP.populateSelect = function($select, items) {
		var el = $select && $select[0];
		if (!el) return;
		var doc = document;
		var ph = $select.attr('data-placeholder') || '請選擇';
		var withOther = $select.attr('data-with-other') === '1';
		el.innerHTML = '';

		var phOpt = doc.createElement('option');
		phOpt.value = '';
		phOpt.text = ph;
		phOpt.disabled = true;
		phOpt.selected = true;
		el.appendChild(phOpt);

		var list = items || [];
		for (var i = 0; i < list.length; i++) {
			var it = list[i];
			var v = (typeof it === 'string') ? it : (it && (it.value || it.label));
			var l = (typeof it === 'string') ? it : (it && (it.label || it.value));
			if (!v) continue;
			var opt = doc.createElement('option');
			opt.value = v;
			opt.text = l;
			el.appendChild(opt);
		}

		if (withOther) { var o = doc.createElement('option');
			o.value = '__OTHER__';
			o.text = '其他（請填備註）';
			el.appendChild(o); }
	};

	// 取靜態選項（之後可改為遠端）
	APP.getOptionsStatic = function(key) {
		if (w.ORDER_OPTIONS && Object.prototype.hasOwnProperty.call(w.ORDER_OPTIONS, key)) {
			return w.ORDER_OPTIONS[key];
		}
		return [];
	};

	// 掃描容器內所有 [data-opt] select，自動灌入
	APP.populateAllSelects = function($scope) {
		var self = this;
		var root = $scope && $scope.length ? $scope : $(document);
		root.find('select[data-opt]').each(function() {
			var key = $(this).attr('data-opt');
			var items = self.getOptionsStatic(key);
			self.populateSelect($(this), items);
		});
	};

	// 驗證（與你現有規則一致）
	APP.validateAddData = function(data) {
		var errs = {};
		var $form = $('#formAdd');

		function hasField(name) { return $form.find('[name="' + name + '"]').length > 0; }

		if (hasField('接單平台') && !data['接單平台']) errs['接單平台'] = '請選擇接單平台';

		if (hasField('訂購人姓名')) {
			var nm = (data['訂購人姓名'] || '').trim();
			if (!nm || nm.length < 2) errs['訂購人姓名'] = '至少 2 個字';
		}

		if (hasField('訂購人電話')) {
			var tel = (data['訂購人電話'] || '').replace(/\s/g, '');
			if (!tel) errs['訂購人電話'] = '必填';
			else if (!/^(\+?886-?|0)?[0-9\-]{8,13}$/.test(tel)) errs['訂購人電話'] = '電話格式不正確';
		}

		if (hasField('訂單金額')) {
			var amt = Number(data['訂單金額']);
			if (!(amt >= 0)) errs['訂單金額'] = '請輸入數字';
		}

		if (hasField('交貨日期') && data['交貨日期'] && !/^\d{4}-\d{2}-\d{2}$/.test(data['交貨日期'])) {
			errs['交貨日期'] = '日期格式需為 YYYY-MM-DD';
		}
		return errs;
	};

	APP.validateEditPatch = function(patch) {
		var errs = {};
		if (Object.prototype.hasOwnProperty.call(patch, '貨運單號') && patch['貨運單號'] && String(patch['貨運單號']).length > 50) errs['貨運單號'] = '字數過長';
		if (Object.prototype.hasOwnProperty.call(patch, '是否已付款') && patch['是否已付款'] && !/^(未付款|已付款|貨到付款)$/.test(patch['是否已付款'])) errs['是否已付款'] = '選項不合法';
		if (Object.prototype.hasOwnProperty.call(patch, '是否已交貨') && patch['是否已交貨'] && !/^(未交貨|已交貨)$/.test(patch['是否已交貨'])) errs['是否已交貨'] = '選項不合法';
		return errs;
	};

	// 欄位錯誤顯示
	APP.showFieldErrors = function($form, errs) {
		$form.find('.field-error').remove();
		$form.find('input,select,textarea').removeClass('is-error').attr('aria-invalid', 'false');
		$form.find('.field').removeClass('has-error');

		var names = Object.keys(errs);
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			var $el = $form.find('[name="' + name + '"]');
			if ($el.length) {
				$el.addClass('is-error').attr('aria-invalid', 'true');
				$el.closest('.field').addClass('has-error');
				$el.after('<div class="field-error">' + errs[name] + '</div>');
			}
		}
	};

	// 錯誤摘要
	APP.renderErrorSummary = function($slot, errs) {
		var keys = Object.keys(errs);
		if (!keys.length) { $slot.empty(); return keys; }
		var list = '';
		for (var i = 0; i < keys.length; i++) list += '<li><strong>' + keys[i] + '</strong>：' + errs[keys[i]] + '</li>';
		var html = '<div class="msg err">請修正下列欄位後再送出：<ul style="margin:6px 0 0 18px">' + list + '</ul></div>';
		$slot.html(html);
		return keys;
	};

	// 捲到第一個錯誤欄位
	APP.scrollToFirstError = function($form) {
		var $first = $form.find('.is-error').first();
		if ($first.length) {
			try { if ($first[0].focus) $first[0].focus(); } catch (_e) {}
			try { if ($first[0].scrollIntoView) $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_e2) {}
		}
	};
})(window, jQuery);