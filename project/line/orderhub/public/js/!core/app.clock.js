/* eslint-env browser, es2020 */ ;
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});
    var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

    function pad(n) { return String(n).padStart(2, '0'); }

    APP.clock = {
        init: function() {
            var el = document.getElementById('clock');
            if (!el) return;

            function tick() {
                var now = new Date();
                var y = now.getFullYear();
                var m = pad(now.getMonth() + 1);
                var d = pad(now.getDate());
                var hh = pad(now.getHours());
                var mm = pad(now.getMinutes());
                var wk = WEEK[now.getDay()];
                el.textContent = y + '/' + m + '/' + d + ' ' + hh + ':' + mm + '（週' + wk + '）';
            }
            tick();
            setInterval(tick, 30 * 1000);
        }
    };
})(window);