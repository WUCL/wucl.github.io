/* =======================
	/js/core/app.init.js
	內容： 初始化與事件綁定。
	來源方法：init, bindEvent
	======================= */
Object.assign(APP, {
	init: function() {
		if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
		if (window.deviceObj && deviceObj.name) { this.el.$body.addClass(deviceObj.name); }
		console.table({
			envDevice: (window.deviceObj && deviceObj.envDevice) || 'web',
			envMode: (window.deviceObj && deviceObj.name) || 'unknown',
		});

		// 偵測環境 + 徽章
		const env = this.detectEnv_();
		this.var.isDev = env.isDev;
		this.var.isStaging = env.isStaging;
		this.var.envLabel = env.label;
		this.showEnvBadge_(env);

		// LIFF
		this.initLiff().then(() => {
			this.route();
			this.el.$win.on('hashchange', this.route.bind(this));
		});

		this.bindEvent();
	},
	bindEvent: function() {
		let $this = this;

		// switch menu
		// if ($this.el.$navSwitch && $this.el.$navSwitch.length) {
		//     $this.el.$navSwitch.on('click', function () {
		//         $this.el.$body.toggleClass('openheader');
		//     });
		// }
		// if ($this.el.$nav && $this.el.$nav.length) {
		//     $this.el.$nav.on('click', function () {
		//         $this.el.$body.removeClass('openheader');
		//     });
		// }
	}
});