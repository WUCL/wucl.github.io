$(function() {
    var INDEX = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $postcardList: $('#postcard-list'),
            $topicsSwiper: $('#topics-swiper'),
        },
        var: {
        },
        init: function() {
            console.log('index');
            this.goInitial(); // 先 ajax 拿到資料先builder
            this.bindEvent();
            this.loadTopics();
            this.loadPostcard();
        },
        bindEvent: function() {
            let $this = this;
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
        },
        loadTopics: function() {
            console.log('loadTopics');
            let $this = this;

            let _source = window.annualTopic;
            let _target = $this.el.$topicsSwiper.find('.swiper-wrapper');
            let _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = '<div class="topic swiper-slide"><img src="' + _source[i] + '"></div>';
                _templates += _template;
            }
            _target.html(_templates);

            // build swiper
            var swiper = new Swiper("#topics-swiper", {
                loop: true,
                pagination: {
                    el: ".swiper-pagination",
                    dynamicBullets: true,
                },
            });
        },
        loadPostcard: function() { // window.postcards
            let $this = this;
            let _source = window.postcards;
            let _target = $this.el.$postcardList;
            let _template_postcards = window.helper.getTemplate('index__postcards');
            let _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = _template_postcards;
                _template = _template.replace(/\[POSTCARD_IMG\]/g,  _source[i]);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
            this.builSlider();
        },
        builSlider: function() {
            let $flipster = $('.postcard-flipster');
            if ($flipster.length) {
                $flipster.flipster({
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
    };
    INDEX.init();
});