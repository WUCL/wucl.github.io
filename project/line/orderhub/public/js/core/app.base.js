/* =======================
	//js/core/app.base.js
	內容： 只建立 APP 物件的基本資料（env、el、var），不含任何方法。
	來源： 開頭 var APP = { ... } 內，只保留 env、el、var 三段。
	======================= */
// 建立唯一 APP 物件與基本欄位
window.APP = window.APP || {};
Object.assign(APP, {
	env: 'html',
	el: {
		$win: $(window),
		$body: $('body'),
		$main: $('#main'),
		$tabAdd: $('#tab-add'),
		$tabEdit: $('#tab-edit'),
		$meta: $('#meta')
	},
	var: {
		actor: 'LIFF',
		isDev: false,
		isStaging: false,
		envLabel: 'PROD',
		LIFF_ID: '2008325627-Nk6d1Z64',
		apiEndpoint: 'https://script.google.com/macros/s/AKfycbys--UCUGCa5VAIXf_Gc6uBnT2Ix8_UzeABt-YQ4Fy5Yz4v2JAiVuV-b8-QRLT1LSxL/exec?api=1'
	}
});