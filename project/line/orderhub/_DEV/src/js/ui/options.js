/* data/options.js — 凍結資料 & 方法分離 */ ;;
(function(w) {
    'use strict';

    var ORDER_DATA = Object.freeze({
        cType: ["新客", "複購", "親友", "員工", "公關", "合作"],
        platforms: [
            "IG", "LINE", "MH", "WhatsAPP", "FB", "市集", "Chic shock", "團購", "LR", "官網",
            "廣告", "表單", "Google", "email", "JG", "快閃", "FP", "電話", "面談"
        ],
        isDelivery: ["未交貨", "已交貨", "不交貨", "部分交"],
        isPay: ["未付款", "已付款", "公關", "已退款", "付訂金"]
    });

    var ORDER_OPTIONS = {
        data: ORDER_DATA,
        get: function(key) { var list = ORDER_DATA[key] || []; return list.slice(); },
        populateSelect: function(selectEl, list) {
            var el = (selectEl && selectEl.nodeType === 1) ? selectEl : document.querySelector(selectEl);
            if (!el) return;
            el.innerHTML = '';
            if (!el.hasAttribute('data-no-placeholder')) {
                var opt0 = document.createElement('option');
                opt0.value = '';
                opt0.textContent = el.getAttribute('data-placeholder') || '請選擇…';
                el.appendChild(opt0);
            }
            var arr = Array.isArray(list) ? list : [];
            for (var i = 0; i < arr.length; i++) {
                var it = arr[i],
                    opt = document.createElement('option');
                if (typeof it === 'string') { opt.value = it;
                    opt.textContent = it; } else {
                    var v = (it && it.value != null) ? it.value : (it && it.label) || '';
                    var l = (it && it.label != null) ? it.label : v;
                    opt.value = v;
                    opt.textContent = l;
                }
                el.appendChild(opt);
            }
        },
        populateAll: function(scope) {
            var root = (scope && scope.nodeType === 1) ? scope : document.querySelector(scope || 'body');
            if (!root) return;
            var sels = root.querySelectorAll('select[data-opt]');
            for (var i = 0; i < sels.length; i++) {
                var sel = sels[i],
                    key = sel.getAttribute('data-opt');
                ORDER_OPTIONS.populateSelect(sel, ORDER_OPTIONS.get(key));
            }
            var nameMap = { '客戶類型': 'cType', '接單平台': 'platforms', '是否已付款': 'isPay', '是否已交貨': 'isDelivery' };
            for (var field in nameMap)
                if (Object.prototype.hasOwnProperty.call(nameMap, field)) {
                    var list = ORDER_OPTIONS.get(nameMap[field]);
                    var olds = root.querySelectorAll('select[name="' + field + '"]:not([data-opt])');
                    for (var j = 0; j < olds.length; j++) ORDER_OPTIONS.populateSelect(olds[j], list);
                }
        }
    };

    w.ORDER_OPTIONS = ORDER_OPTIONS;
})(window);