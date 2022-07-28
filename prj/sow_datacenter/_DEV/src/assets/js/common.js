$(function() {
    var COMMON = {
        api: {
            url: window._comm.$api.url,
            param: {},
            path: {
                get_profile: 'get_profile',
            },
            data: {}
        },
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $nav: $('#nav'),
            $navSwitch: $('#hamburger'),
            $shareLine: $('.share-line'),
            $shareFacebook: $('.share-facebook'),

            $btnLogin: $('#btn-login'),
        },
        var: {
            // $share: {
            //     facebookLink: location.origin,
            //     lineText: '我是LINE分享\n哈哈哈哈🥺',
            //     lineLink: location.origin,
            // },
        },
        init: function() {
            console.log('common');
            window.page = this.el.$body.data('page');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);

            this.getProfile();

            this.processNavActive();
            this.bindEvent();
            this.detectScroll();
            // this.setPopup();
        },
        processNavActive: function() {
            let $this = this
            , _page = this.el.$body.data('page');
            console.log(_page);
            return $('.nav-' + _page).addClass('active');
        },
        bindEvent: function() {
            let $this = this;

            // switch menu
            $this.el.$navSwitch.on('click', function() {
                $this.el.$header.toggleClass('open');
            });
            $this.el.$nav.on('click', function() {
                $this.el.$header.removeClass('open');
            });

            // shares
            // $this.el.$shareLine.on('click', function() {
            //     console.log('share-line');
            //     let url = encodeURIComponent($this.var.$share.lineLink);

            //     // 1. link with text
            //     let text = encodeURIComponent($this.var.$share.lineText);
            //     window.open('http://line.naver.jp/R/msg/text/?' + text + "%0D%0A" + url);

            //     // 2. only link
            //     // window.open('http://line.naver.jp/R/msg/text/?' + _url);
            // });
            // $this.el.$shareFacebook.on('click', function() {
            //     console.log('share-facebook');
            //     window.open('http://www.facebook.com/sharer.php?u=' + $this.var.$share.facebookLink);
            // });
            // $this.el.$btnLogin.on('click', function() {
            //     console.log('how to login?');
            //     alert('how to login?');
            //     return;
            // })
        },
        detectScroll: function() {
            // console.log('detectScroll');
            let $this = this
            , lastScrollTop = 0;
            $(window).scroll(function(event) {
                let st = $(this).scrollTop();
                if (st > lastScrollTop) {
                    // console.log('downscrolwindow.assetsPathl');
                    $this.el.$body.attr('data-scroll', 'downscroll');
                } else {
                    // console.log('upscrollwindow.assetsPath');
                    $this.el.$body.attr('data-scroll', 'upscroll');
                }
                lastScrollTop = st; // initial
                // stopscroll
                // clearTimeout($.data(this, 'scrollTimer'));
                // $.data(this, 'scrollTimer', setTimeout(function() {
                //     // do something
                //     console.log("Haven't scrolled in 250ms!");
                // }, 250));

                // detect element in view
                //
                if ($('.total-value:not(".magin-done")').length > 0) {
                    if ($('.total-value:not(".magin-done")').inView('topOnly')) {
                        $('.total-value:not(".magin-done")').each(function () {
                            window.helper.magicNum($(this), $(this).attr('data-endnum'));
                        })
                    }
                }
                //
                if ($('#goUpdateTWDatas-freq:not(".magin-done")').length > 0) {
                    if ($('#goUpdateTWDatas-freq:not(".magin-done")').inView('topOnly')) {
                        window.helper.magicNum($('#goUpdateTWDatas-freq'), $('#goUpdateTWDatas-freq').attr('data-endnum'));
                    }
                }
                //
                if ($('.goUpdateTWDatas').length > 0) {
                    if ($('.goUpdateTWDatas').inView('topOnly')) {
                        $('.goUpdateTWDatas').addClass('magicing');
                    }
                }
            });
        },
        setPopup: function() {
            // let $this = this;
            $('#view-terms').popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
            });
        },
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

        getProfile: function() {
            console.log('getProfile');
            let $this = this;
            // call api // ajax url
            var _url = $this.api.url + $this.api.path.get_profile;
            console.log(_url);

            let _data = Object.assign({}, $this.api.data);
            console.log(_data);

            // ajax handle
            $.ajax({
                url: _url,
                type: "post",
                data: JSON.stringify(_data),
                dataType: "json",
                success: (response) => {
                    console.log(response);
                    if (response.is_success === 1) {
                        doSuccess(response);
                    }
                    return;
                },
                error: function(response) {
                    console.log("error");
                    console.log(response);
                }
            });
            function doSuccess(_r) { // to get the profile data
                if (_r.is_login === 1){
                    console.log('is login');
                    window._comm.$user.id = _r.data.user_id;
                    window._comm.$user.name = _r.data.name;
                    window._comm.$user.email = _r.data.email;
                } else {
                    console.log('is not login');
                    window._comm.$user.id = 1;
                }
            }
        }
    };
    COMMON.init();
});

window.assetsPath = './public';
window.tw_xy = {
    // 'test': [470, 190],
    '台北': [620, 180],
    '宜蘭': [675, 335],
    '花蓮': [605, 655],
    '台東': [485, 1020],
    '屏東': [305, 1160],
    '高雄': [195, 1090],
    '台南': [130, 945],
    '嘉義': [125, 815],
    '雲林': [140, 715],
    '彰化': [195, 610],
    '台中': [315, 510],
    '苗栗': [365, 385],
    '新竹': [435, 295],
    '桃園': [470, 190]
};

window.mappingTWName = {
    'ntpc': '新北市',
    'tpe': '臺北市',
    'kel': '基隆市',
    'ila': '宜蘭縣',
    'tyn': '桃園市',
    'hszc': '新竹縣',
    'hsz': '新竹市',
    'zmi': '苗栗縣',
    'txg': '臺中市',
    'chw': '彰化縣',
    'ntc': '南投市',
    'yun': '雲林縣',
    'cyic': '嘉義市',
    'cyi': '嘉義縣',
    'tnn': '臺南市',
    'khh': '高雄市',
    'pif': '屏東縣',
    'hun': '花蓮縣',
    'ttt': '臺東縣',
    'peh': '澎湖縣',
    'knh': '金門縣',
    'mzw': '連江縣',
};