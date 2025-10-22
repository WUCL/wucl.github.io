/* =======================
	/js/core/boot.js
	內容： 啟動器（等同你原本的 $(function(){ APP.init(); })）。
	來源：把整個最外層 $(function(){ ... APP.init(); }); 的外層，改為只保留 boot 啟動。
	======================= */
// 等同 $(function(){ APP.init(); })
(function() {
	function start(){ APP.init(); }
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();