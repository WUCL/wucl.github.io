$(function() {
    var DATA = {
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
            console.log('data');
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
    };
    DATA.init();
});