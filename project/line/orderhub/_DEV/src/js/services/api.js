/* =======================
	/js/services/api.js
	內容： 單一 API 出口與寬鬆 JSON 解析工具（原本在 api 內的 parseJSONLoose 仍放在此檔內、作為內部函式）。
	來源方法：api（其內嵌的 parseJSONLoose 保留在此檔，不對外暴露）
	======================= */
Object.assign(APP, {
	api: async function(action, payload) {
		// ← 貼你的原 api 本體（不改）
		// （包含裡面的 parseJSONLoose 小工具；位置不變，仍寫在此函式內）
		const url = this.var.API_URL;
		const bodyStr = JSON.stringify(Object.assign({ action }, payload || {}));

		// 小工具：寬鬆 JSON 解析（strip BOM/XSSI、擷取花括號區間）
		function parseJSONLoose(s) {
			if (typeof s !== 'string') return null;
			let t = s.replace(/^\uFEFF/, '');         // BOM
			t = t.replace(/^\)\]\}',?\s*/, '');       // XSSI 前綴
			try { return JSON.parse(t); } catch (e) {}
			const i = t.indexOf('{'); const j = t.lastIndexOf('}');
			if (i >= 0 && j > i) {
			  try { return JSON.parse(t.slice(i, j + 1)); } catch (e) {}
			}
			return null;
		}

		try {
			const res = await fetch(url, {
			  method: 'POST',
			  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 避免 preflight
			  body: bodyStr,
			  redirect: 'follow',
			});

			const status = res.status;
			const ct = (res.headers.get('content-type') || '').toLowerCase();
			const text = await res.text();

			console.groupCollapsed(`[API] POST ${url} → ${status} (${ct})`);
			console.log('request body =', bodyStr);
			console.log('raw response =', text);
			console.groupEnd();

			// 嘗試寬鬆解析
			const json = parseJSONLoose(text);
			if (json && typeof json === 'object') return json;

			// 不是 JSON，就回診斷物件
			return {
			  ok: false,
			  msg: 'invalid-json',
			  status,
			  contentType: ct,
			  snippet: (text || '').slice(0, 400) // UI 顯示前 400 字方便判讀
			};
		} catch (e) {
			console.error('[API] fetch error:', e);
			return { ok: false, msg: 'network-error', err: String(e) };
		}
	}
});