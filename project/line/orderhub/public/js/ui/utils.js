/* =======================
	/js/ui/utils.js
	內容： 共用小工具（表單、選項與錯誤顯示等）。
	來源方法：
	formToObject, qs, setMeta
	populateSelect, populateAllSelects, getOptionsStatic
	validateAddData, validateEditPatch
	showFieldErrors, renderErrorSummary, logValidationDebug, scrollToFirstError
	======================= */

(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    function formToObject($form) {
        var out = {};
        var arr = ($form && $form.serializeArray) ? $form.serializeArray() : [];
        for (var i = 0; i < arr.length; i++) out[arr[i].name] = arr[i].value;
        return out;
    }

    function qs(k) {
        try {
            var hashQ = (location.hash.split('?')[1] || '');
            var searchQ = (location.search || '').replace(/^\?/, '');
            var q = new URLSearchParams(hashQ || searchQ);
            return q.get(k);
        } catch (e) { return null; }
    }

    function setMeta(t) {
        if (APP.el && APP.el.$meta && APP.el.$meta.length) APP.el.$meta.text(t || '');
    }

    function validateAddData(data) {
        var errs = {};
        var $form = $('#formAdd');
        var has = function(name) { return $form.length && $form.find('[name="' + name + '"]').length > 0; };

        if (has('接單平台') && !data['接單平台']) errs['接單平台'] = '請選擇接單平台';
        if (has('訂購人姓名') && (!data['訂購人姓名'] || String(data['訂購人姓名']).trim().length < 2)) errs['訂購人姓名'] = '至少 2 個字';
        if (has('訂購人電話')) {
            if (!data['訂購人電話']) errs['訂購人電話'] = '必填';
            else {
                var phone = String(data['訂購人電話']).replace(/\s/g, '');
                if (!/^(\+?886-?|0)?[0-9\-]{8,13}$/.test(phone)) errs['訂購人電話'] = '電話格式不正確';
            }
        }
        if (has('訂單金額')) {
            var amt = Number(data['訂單金額']);
            if (!(amt >= 0)) errs['訂單金額'] = '請輸入數字';
        }
        if (has('交貨日期') && data['交貨日期'] && !/^\d{4}-\d{2}-\d{2}$/.test(data['交貨日期'])) {
            errs['交貨日期'] = '日期格式需為 YYYY-MM-DD';
        }
        return errs;
    }

    function validateEditPatch(patch) {
        var errs = {};
        if ('貨運單號' in patch && patch['貨運單號'] && String(patch['貨運單號']).length > 50) errs['貨運單號'] = '字數過長';
        if ('是否已付款' in patch && patch['是否已付款'] && !/^(未付款|已付款|貨到付款|公關|已退款|付訂金)$/.test(patch['是否已付款'])) errs['是否已付款'] = '選項不合法';
        if ('是否已交貨' in patch && patch['是否已交貨'] && !/^(未交貨|已交貨|不交貨|部分交)$/.test(patch['是否已交貨'])) errs['是否已交貨'] = '選項不合法';
        return errs;
    }

    function showFieldErrors($form, errs) {
        $form.find('.field-error').remove();
        $form.find('input,select,textarea').removeClass('is-error').attr('aria-invalid', 'false');
        $form.find('.field').removeClass('has-error');
        for (var name in errs)
            if (Object.prototype.hasOwnProperty.call(errs, name)) {
                var $el = $form.find('[name="' + name + '"]');
                if ($el.length) {
                    $el.addClass('is-error').attr('aria-invalid', 'true');
                    $el.closest('.field').addClass('has-error');
                    $el.after('<div class="field-error">' + errs[name] + '</div>');
                }
            }
    }

    function renderErrorSummary($slot, errs) {
        var keys = Object.keys(errs);
        if (!keys.length) { $slot.empty(); return keys; }
        var list = '';
        for (var i = 0; i < keys.length; i++) list += '<li><strong>' + keys[i] + '</strong>：' + errs[keys[i]] + '</li>';
        var html = '<div class="msg err">請修正下列欄位後再送出：<ul style="margin:6px 0 0 18px">' + list + '</ul></div>';
        $slot.html(html);
        return keys;
    }

    function logValidationDebug(context, data, errs) {
        try {
            if (console && console.groupCollapsed) {
                console.groupCollapsed('[Validate] ' + context + ' — ' + Object.keys(errs).length + ' error(s)');
                console.log('表單值 =', data);
                if (Object.keys(errs).length && console.table) console.table(errs);
                console.groupEnd();
            }
        } catch (_) {}
    }

    function scrollToFirstError($form) {
        var $first = $form.find('.is-error').first();
        if ($first.length) {
            if ($first[0] && typeof $first[0].focus === 'function') $first[0].focus();
            if ($first[0] && typeof $first[0].scrollIntoView === 'function') $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    APP.formToObject = formToObject;
    APP.qs = qs;
    APP.setMeta = setMeta;
    APP.validateAddData = validateAddData;
    APP.validateEditPatch = validateEditPatch;
    APP.showFieldErrors = showFieldErrors;
    APP.renderErrorSummary = renderErrorSummary;
    APP.logValidationDebug = logValidationDebug;
    APP.scrollToFirstError = scrollToFirstError;

})(window);