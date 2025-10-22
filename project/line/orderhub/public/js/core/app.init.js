/* =======================
	/js/core/app.init.js
	內容： 初始化與事件綁定。
	來源方法：init, bindEvent
	======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    Object.assign(APP, {
        init: function() {
            // 只快取節點與輕量初始化（不要在這裡用 TPL / API）
            APP.el.$body = $('body');
            APP.el.$main = $('#main');
            APP.el.$meta = $('#meta');

            // 預設一些執行時變數
            APP.var.actor = APP.var.actor || 'WEB';
            // 可在 HTML 以 data-api-endpoint 指定
            var ep = document.documentElement.getAttribute('data-api-endpoint') || '';
            APP.var.apiEndpoint = APP.var.apiEndpoint || ep;

            // 可選：裝置標籤（若有全域 deviceObj）
            if (w.deviceObj && deviceObj.name) APP.el.$body.addClass(deviceObj.name);

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

    // DOM Ready 後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { APP.init(); });
    } else {
        APP.init();
    }
})(window);