$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
            console.log('%cHi This is Allen','padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;');
        },
        bindEvent: function() {
        },
    };
    MAIN.init();
});
