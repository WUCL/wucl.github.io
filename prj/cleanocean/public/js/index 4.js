$(function() {
    var INDEX = {
        env: 'html',
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
            console.log('index');
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
    };
    INDEX.init();
});