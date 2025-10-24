/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Services/API
 * 職責：與外部服務（GAS 等）通訊，提供 APP.api(action, payload)
 * 依賴：fetch、jQuery（for $.extend）
 */
;(function(w) {
	'use strict';
	var APP = w.APP || (w.APP = {});

	// 鬆散解析 JSON（容忍 BOM / XSSI）
	function parseJSONLoose(s) {
		if (typeof s !== 'string') return null;
		var t = s.replace(/^\uFEFF/, '').replace(/^\)\]\}',?\s*/, '');
		try { return JSON.parse(t); } catch (_e) {}
		var i = t.indexOf('{'),
			j = t.lastIndexOf('}');
		if (i >= 0 && j > i) { try { return JSON.parse(t.slice(i, j + 1)); } catch (_e2) {} }
		return null;
	}

	APP.api = function(action, payload) {
		var url = this.var.API_URL;
		var bodyStr = JSON.stringify($.extend({ action: action }, payload || {}));

		return new Promise(function(resolve) {
			fetch(url, {
					method: 'POST',
					headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 避免 preflight
					body: bodyStr,
					redirect: 'follow'
				})
				.then(function(r) { return r.text().then(function(t) { return { r: r, t: t }; }); })
				.then(function(o) {
					var status = o.r.status;
					var ct = (o.r.headers.get('content-type') || '').toLowerCase();
					var text = o.t || '';
					var json = parseJSONLoose(text);
					if (json && typeof json === 'object') { resolve(json); return; }
					resolve({ ok: false, msg: 'invalid-json', status: status, contentType: ct, snippet: text.slice(0, 400) });
				})
				.catch(function(e) {
					resolve({ ok: false, msg: 'network-error', err: String(e && e.message || e) });
				});
		});
	};
})(window);