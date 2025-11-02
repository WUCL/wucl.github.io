/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — UI/Form helpers
 * 職責：表單序列化、select 選項灌入、欄位驗證、錯誤渲染、捲動
 * 依賴：jQuery、ORDER_OPTIONS（data/options.js）
 */
;
(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	// filter control
	// $(document).on('click', '.filter-dropdown .dropdown-toggle', function (e) {
	//     e.stopPropagation();
	//     var $menu = $(this).next('.dropdown-menu');
	//     $('.filter-dropdown .dropdown-menu').not($menu).hide(); // 關閉其他
	//     $menu.toggle();
	// });
	// $(document).on('click', function () {
	//     $('.filter-dropdown .dropdown-menu').hide(); // 點擊外部自動關閉
	// });

	// === 取表單物件 ===
	APP.formToObject = function($form) {
		var out = {};
		var arr = ($form && $form.serializeArray) ? $form.serializeArray() : [];
		for (var i = 0; i < arr.length; i++) out[arr[i].name] = arr[i].value;
		return out;
	};

	// === select 填充（優先保留 HTML 內原有選項） ===
	APP.populateSelect = function($select, items) {
		if (!$select || !$select.length) return;

		var el = $select[0];
		var doc = document;
		var list = items || [];

		for (var i = 0; i < list.length; i++) {
			var it = list[i];
			var v = (typeof it === 'string') ? it : (it && (it.value || it.label));
			var l = (typeof it === 'string') ? it : (it && (it.label || it.value));
			if (!v) continue;

			var opt = doc.createElement('option');
			opt.value = v;
			opt.text = l;

			if (!(el.options && el.options.length > 0)) {
				if (i === 0) opt.selected = true;
			}

			el.appendChild(opt);
		}

		// console.log('[populateSelect] 已自動建立 options:', el.name, list.length);
	};

	// === 取靜態選項（之後可改為遠端） ===
	APP.getOptionsStatic = function(key) {
		if (w.ORDER_OPTIONS && Object.prototype.hasOwnProperty.call(w.ORDER_OPTIONS, key)) {
			return w.ORDER_OPTIONS[key];
		}
		return [];
	};

	// === 掃描容器內所有 [data-opt] select，自動灌入 ===
	APP.populateAllSelects = function($scope) {
		var self = this;
		var root = $scope && $scope.length ? $scope : $(document);
		root.find('select[data-opt]').each(function() {
			var key = $(this).attr('data-opt');
			var items = self.getOptionsStatic(key);
			self.populateSelect($(this), items);
		});
	};

	// === 付款方式 UI（show/hide「匯款後五碼」） ===
	APP.bindIsPaied = function($form) {
		var $isPayWrap = $form.find('[name="是否已付款"]');
		var $payTypeWrap = $form.find('[name="付款方式"]');

		$isPayWrap.on('change', function() {
			if (!$isPayWrap.length) return;
			var $isPaied = $(this).val();
			if ($isPaied !== '未付款') $payTypeWrap.prop('required', true);
			else $payTypeWrap.prop('required', false);
			return;
		});
	};

	// === 付款方式 UI（show/hide「匯款後五碼」） ===
	APP.bindIsMoneyTransfer = function($form) {
		var $payTypeWrap = $form.find('[name="付款方式"]');
		var $moneyTransferWrap = $('#field-moneyTransfer');

		$payTypeWrap.on('change', function() {
			if (!$payTypeWrap.length) return;
			var isTransfer = String($payTypeWrap.val() || '') === '匯款';
			$moneyTransferWrap.toggle(isTransfer);
			if (!isTransfer) $moneyTransferWrap.find('[name="匯款後五碼"]').val('');
			return;
		});
	};

	// === checkbox，是陌生人 ===
	APP.bindIsStranger = function($form, $buyerName) {
		var self = this;
		var $isStranger = $form.find('#isStranger');
		$buyerName = $buyerName || $form.find('[name="訂購人姓名"]');
		if (!$isStranger.length || !$buyerName.length) return;

		$isStranger.off('.isStranger').on('change.isStranger', function() {
			if (this.checked) $buyerName.data('prevName', $buyerName.val() || '').val(APP.var.stranger).prop('readonly', true);
			else $buyerName.val($buyerName.data('prevName')).prop('readonly', false);
			self.syncBuyerToReceiver($form);
		});
	};

	// === checkbox，同訂購人資訊 ===
	APP.syncBuyerToReceiver = function($form) {
		var $sameAsBuyer = $form.find('#sameAsBuyer');
		if (!$sameAsBuyer.prop('checked')) return;

		var $buyerName = $form.find('[name="訂購人姓名"]');
		var $buyerPhone = $form.find('[name="訂購人電話"]');
		var $recvName = $form.find('[name="收件者姓名"]');
		var $recvPhone = $form.find('[name="收件者電話"]');

		$recvName.val($buyerName.val());
		$recvPhone.val($buyerPhone.val());
	};
	APP.bindSameAsBuyer = function($form) {
		var self = this;
		var $sameAsBuyer = $form.find('#sameAsBuyer');
		var $buyerName = $form.find('[name="訂購人姓名"]');
		var $buyerPhone = $form.find('[name="訂購人電話"]');
		if (!$sameAsBuyer.length) return;

		// 同訂購人欄位變動、或勾選狀態改變 → 同步
		$buyerName.add($buyerPhone)
			.off('.sameAsBuyer')
			.on('input.sameAsBuyer', function () {
				self.syncBuyerToReceiver($form);
			});

		$sameAsBuyer.off('.sameAsBuyer').on('change.sameAsBuyer', function() {
			self.syncBuyerToReceiver($form);
		});
	};

	// === 取貨方式，自取自動帶入地址 / 宅配顯示物流單號 ===
	APP.bindMappingRecvAddr = function($form) {
		var $receiptType = $form.find('[name="取貨方式"]');
		var $recvAddr = $form.find('[name="收件者地址"]');
		var $trackingNumberWrap = $form.find('#field-trackingNumber');

		if (!$receiptType.length || !$recvAddr.length) return;

		function mappingRecvAddr() {
			const v = String($receiptType.val() || '');
			const map = w.MAPPING_receiptType || {};

			// === 自取點：自動帶入地址 ===
			if (Object.prototype.hasOwnProperty.call(map, v) && map[v]) {
				$recvAddr.val(map[v]);
			}

			// === 宅配：顯示物流單號欄位 ===
			if ($trackingNumberWrap.length) {
				const isDelivery = (v === '宅配' || v === '郵寄');
				$trackingNumberWrap.toggle(isDelivery);
			}
		}

		$receiptType.off('.mappingRecvAddr').on('change.mappingRecvAddr', mappingRecvAddr);

		mappingRecvAddr(); // 初始執行一次
	};

	// 鎖住/解鎖整個表單（會保留原本已 disabled 的欄位狀態）
	APP.lockForm = function($form, lock) {
		if (!$form || !$form.length) return;

		var $fields = $form.find('input, select, textarea, button');

		if (lock) {
			$form.addClass('is-busy');
			$fields.each(function() { this.disabled = true; });
		} else {
			$form.removeClass('is-busy');
			$fields.each(function() { this.disabled = false; });
 		}
 	};

})(window, jQuery);