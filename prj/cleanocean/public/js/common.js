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
            $twimg: $('#twimg'),
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
            this.loadTWSvg();

            this.builSlider();

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
        loadTWSvg: function() {
            return this.el.$twimg.load('./public/img/tw.svg');
        },

        builSlider: function() {
            let $myflipster = $('.my-flipster');
            if ($myflipster.length) {
                $myflipster.flipster({
                    itemContainer: 'ul',
                    // [string|object]
                    // Selector for the container of the flippin' items.

                    itemSelector: 'li',
                    // [string|object]
                    // Selector for children of `itemContainer` to flip

                    start: 'center',
                    // ['center'|number]
                    // Zero based index of the starting item, or use 'center' to start in the middle

                    fadeIn: 400,
                    // [milliseconds]
                    // Speed of the fade in animation after items have been setup

                    loop: true,
                    // [true|false]
                    // Loop around when the start or end is reached

                    autoplay: false,
                    // [false|milliseconds]
                    // If a positive number, Flipster will automatically advance to next item after that number of milliseconds

                    pauseOnHover: true,
                    // [true|false]
                    // If true, autoplay advancement will pause when Flipster is hovered

                    style: 'coverflow',
                    // [coverflow|carousel|flat|...]
                    // Adds a class (e.g. flipster--coverflow) to the flipster element to switch between display styles
                    // Create your own theme in CSS and use this setting to have Flipster add the custom class

                    spacing: -0.6,
                    // [number]
                    // Space between items relative to each item's width. 0 for no spacing, negative values to overlap

                    click: true,
                    // [true|false]
                    // Clicking an item switches to that item

                    keyboard: true,
                    // [true|false]
                    // Enable left/right arrow navigation

                    scrollwheel: false,
                    // [true|false]
                    // Enable mousewheel/trackpad navigation; up/left = previous, down/right = next

                    touch: true,
                    // [true|false]
                    // Enable swipe navigation for touch devices

                    nav: false,
                    // [true|false|'before'|'after']
                    // If not false, Flipster will build an unordered list of the items
                    // Values true or 'before' will insert the navigation before the items, 'after' will append the navigation after the items

                    buttons: true,
                    // [true|false|'custom']
                    // If true, Flipster will insert Previous / Next buttons with SVG arrows
                    // If 'custom', Flipster will not insert the arrows and will instead use the values of `buttonPrev` and `buttonNext`

                    buttonPrev: 'Previous',
                    // [text|html]
                    // Changes the text for the Previous button

                    buttonNext: 'Next',
                    // [text|html]
                    // Changes the text for the Next button

                    onItemSwitch: false
                    // [function]
                    // Callback function when items are switched
                    // Arguments received: [currentItem, previousItem]
                });
            }
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


window.album = [
    {
        id: 1,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
        featured: 'public/img/album-pic-a.png',
        source: '尼古拉拉科技股份有限公司'
    },
    {
        id: 2,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
        featured: 'public/img/album-pic-a.png',
        source: '尼古拉拉科技股份有限公司'
    },
    {
        id: 3,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
        featured: 'public/img/album-pic-a.png',
        source: '尼古拉拉科技股份有限公司'
    }
];
window.dataDl = [
    {
        id: 1,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
    },
    {
        id: 2,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
    },
    {
        id: 3,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
    },
    {
        id: 4,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
    },
    {
        id: 5,
        county: '彰化',
        date: '2020/04/24',
        campaign: '王功淨灘',
    },
];