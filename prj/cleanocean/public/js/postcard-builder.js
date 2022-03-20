$(function() {
    var MEMBER = {
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
            console.log('postcard-builder');
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
    };
    MEMBER.init();
});