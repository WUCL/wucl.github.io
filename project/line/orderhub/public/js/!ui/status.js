/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — UI: Status Bar + Progress
 * 用法：
 *   APP.status.start('載入清單');
 *   APP.status.tick('呼叫 API', 40);
 *   APP.status.done(true, '完成');
 */
;
(function(w, $) {
	'use strict';
	var APP = w.APP || (w.APP = {});
	var ROOT_ID = 'oh-status';

	function ensureBar() {
		if (document.getElementById(ROOT_ID)) return;

		const frag = TPL.tpl('tpl-status');

	 	// 插入到 #main 最前面；若沒有 #main 則插到 body 開頭
		var main = document.getElementById('main');
		if (main) {
			main.insertBefore(frag, main.firstChild);
		} else {
			// 你也可以用 TPL.mount(document.body, frag, false)（append），但這裡要插到最前面
			document.body.insertBefore(frag, document.body.firstChild);
		}

		$('.oh-status__clear').on('click', function() { $('.oh-status__list').empty(); });
        $('.oh-status__toggle').on('click', function(e) {
			e.preventDefault();
			var $list = $('.oh-status__list').first();
			$list.stop(true, true).slideToggle(160);
			return;
		});
	}

	function now() {
		var d = new Date();
		var p = function(n, w) { n = String(n); return ('000' + n).slice(-w); };
		return p(d.getHours(), 2) + ':' + p(d.getMinutes(), 2) + ':' + p(d.getSeconds(), 2) + '.' + p(d.getMilliseconds(), 3);
	}

	function pushLine(text, level) {
		var $list = $('.oh-status__list');
		if (!$list.length) return;
		var cls = (level === 'error') ? 'err' : (level === 'warn' ? 'warn' : 'ok');
		var line = '<div class="oh-status__line ' + cls + '">[' + now() + '] ' + text + '</div>';
		$list.append(line);
		$list[0].scrollTop = $list[0].scrollHeight;
	}

	APP.status = {
		_t0: 0,
		_pct: 0,
		start: function(label) {
			ensureBar();
			this._t0 = (w.performance && performance.now) ? performance.now() : Date.now();
			this._pct = 0;
			$('.oh-status__bar').css('width', '0%');
			pushLine('開始：' + (label || ''), 'ok');
			console.log('[STATUS] start:', label);
		},
		tick: function(label, inc) {
			ensureBar();
			var step = (typeof inc === 'number') ? inc : 20;
			this._pct = Math.max(0, Math.min(100, this._pct + step));
			$('.oh-status__bar').css('width', this._pct + '%');
			if (label) pushLine('進度：' + label, 'warn');
			console.log('[STATUS] tick:', label, step);
		},
		done: function(ok, label) {
			ensureBar();
			this._pct = 100;
			$('.oh-status__bar').css('width', '100%');
			var t1 = (w.performance && performance.now) ? performance.now() : Date.now();
			var ms = Math.max(0, Math.round(t1 - this._t0));
			var s = (ms / 1000).toFixed(2);
			var msg = (ok ? '完成' : '失敗') + '：' + (label || '') + '（' + s + 's）';
			pushLine(msg, ok ? 'ok' : 'error');
			console.log('[STATUS] done:', ok, label, s + 's');
		}
	};
})(window, jQuery);