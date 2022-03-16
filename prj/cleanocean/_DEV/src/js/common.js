$(function() {
    var COMMON = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $nav: $('#nav'),
            $navSwitch: $('#switch'),

            $shareLine: $('.share-line'),
            $shareFacebook: $('.share-facebook'),
        },
        var: {
            $share: {
                facebookLink: location.origin,
                lineText: '我是LINE分享\n哈哈哈哈🥺',
                lineLink: location.origin,
            },
        },
        init: function() {
            console.log('common');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            // switch menu
            $this.el.$navSwitch.on('click', function() {
                $this.el.$body.toggleClass('openheader');
            });
            $this.el.$nav.on('click', function() {
                $this.el.$body.removeClass('openheader');
            });

            // shares
            $this.el.$shareLine.on('click', function() {
                console.log('share-line');
                let url = encodeURIComponent($this.var.$share.lineLink);

                // 1. link with text
                let text = encodeURIComponent($this.var.$share.lineText);
                window.open('http://line.naver.jp/R/msg/text/?' + text + "%0D%0A" + url);

                // 2. only link
                // window.open('http://line.naver.jp/R/msg/text/?' + _url);
            });
            $this.el.$shareFacebook.on('click', function() {
                console.log('share-facebook');
                window.open('http://www.facebook.com/sharer.php?u=' + $this.var.$share.facebookLink);
            });
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
        doScrollIt: function() {
            let $this = this;
            $.scrollIt({
                upKey: 38,             // key code to navigate to the next section
                downKey: 40,           // key code to navigate to the previous section
                easing: 'easeInOutExpo',      // the easing function for animation
                scrollTime: 600,       // how long (in ms) the animation takes
                activeClass: 'active', // class given to the active nav element
                onPageChange: function(e) {},    // function(pageIndex) that is called when page is changed
                topOffset: -130           // offste (in px) for fixed top navigation
            });
        },
    };
    COMMON.init();
});