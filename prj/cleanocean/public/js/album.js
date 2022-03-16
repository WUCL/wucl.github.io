$(function() {
    var ALBUM = {
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
            console.log('album');
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
        },
    };
    ALBUM.init();
});