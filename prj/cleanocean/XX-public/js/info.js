$(function() {
    var INFO = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
        },
        var: {
        },
        init: function() {
            console.log('info');
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
    };
    INFO.init();
});