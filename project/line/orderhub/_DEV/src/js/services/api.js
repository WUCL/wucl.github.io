/* =======================
	/js/services/api.js
	內容： 單一 API 出口與寬鬆 JSON 解析工具（原本在 api 內的 parseJSONLoose 仍放在此檔內、作為內部函式）。
	來源方法：api（其內嵌的 parseJSONLoose 保留在此檔，不對外暴露）
	======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // 基礎 API：以 text/plain 傳 JSON 字串，GAS 端 doPost(e) 解析
    APP.api = function(action, payload) {
        return new Promise(function(resolve) {
            var url = (APP.var.apiEndpoint || '').trim();
            if (!url) {
                resolve({ ok: false, msg: 'no-endpoint' });
                return;
            }
            var body = JSON.stringify(Object.assign({ action: action }, payload || {}));
            fetch(url + '?api=1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: body
                })
                .then(function(r) { return r.text().then(function(t) { return { r: r, t: t }; }); })
                .then(function(o) {
                    var ct = (o.r.headers.get('content-type') || '').toLowerCase();
                    if (ct.indexOf('application/json') !== -1) {
                        try { resolve(JSON.parse(o.t)); return; } catch (e) {}
                    }
                    resolve({ ok: false, msg: 'invalid-json', status: o.r.status, contentType: ct, snippet: o.t.slice(0, 120) });
                })
                .catch(function() { resolve({ ok: false, msg: 'network-error' }); });
        });
    };

})(window);