$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
        // doAos: function() {
        //     return AOS.init({
        //         duration: 300,
        //         offset: 150,
        //         delay: 0,
        //         once: true,
        //         easing: 'ease-in'
        //     });
        // },
    };
    MAIN.init();
});