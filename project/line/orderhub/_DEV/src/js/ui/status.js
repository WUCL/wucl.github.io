/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — UI: Status Bar + Progress
 * 用法：
 *   APP.status.start('載入清單');      // 開始（進度 0%）
 *   APP.status.tick('呼叫 API');       // 中途事件（進度 +20%）
 *   APP.status.done(true, '完成');     // 結束（成功/失敗，進度 100%）
 */
;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});
    var barId = 'oh-status';

    function ensureBar() {
        if (document.getElementById(barId)) return;
        var html =
            '<div id="oh-status" class="oh-status">' +
            '<div class="oh-status__head">' +
            '<b>狀態</b>' +
            '<button type="button" class="oh-status__clear">清空</button>' +
            '</div>' +
            '<div class="oh-status__prog"><div class="oh-status__bar" style="width:0%"></div></div>' +
            '<div class="oh-status__list"></div>' +
            '</div>';
        document.body.insertAdjacentHTML('afterbegin', html);
        $('.oh-status__clear').on('click', function() { $('.oh-status__list').empty(); });
    }

    function ts() {
        var d = new Date();
        var pad = function(n, w) { n = String(n); return ('000' + n).slice(-w); };
        return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2) + '.' + pad(d.getMilliseconds(), 3);
    }

    function pushLine(txt, level) {
        var $list = $('.oh-status__list');
        if (!$list.length) return;
        var cls = (level === 'error') ? 'err' : (level === 'warn' ? 'warn' : 'ok');
        var line = '<div class="oh-status__line ' + cls + '">[' + ts() + '] ' + txt + '</div>';
        $list.append(line);
        $list[0].scrollTop = $list[0].scrollHeight;
    }

    APP.status = {
        _t0: 0,
        _p: 0,
        start: function(label) {
            ensureBar();
            this._t0 = performance.now ? performance.now() : Date.now();
            this._p = 0;
            $('.oh-status__bar').css('width', '0%');
            pushLine('開始：' + (label || ''), 'ok');
        },
        tick: function(label, step) {
            ensureBar();
            var inc = (typeof step === 'number' ? step : 20);
            this._p = Math.max(0, Math.min(100, this._p + inc));
            $('.oh-status__bar').css('width', this._p + '%');
            if (label) pushLine('進度：' + label, 'ok');
        },
        done: function(success, label) {
            ensureBar();
            this._p = 100;
            $('.oh-status__bar').css('width', '100%');
            var t1 = performance.now ? performance.now() : Date.now();
            var ms = Math.max(0, Math.round(t1 - this._t0));
            var s = (ms / 1000).toFixed(2);
            var msg = (success ? '完成' : '失敗') + '：' + (label || '') + '（' + s + 's）';
            pushLine(msg, success ? 'ok' : 'error');
        }
    };
})(window, jQuery);