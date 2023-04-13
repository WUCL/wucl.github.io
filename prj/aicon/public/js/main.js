$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $s_1: $('#s-1'),
            $s_2: $('#s-2'),
            $s_3: $('#s-3'),

            $btn_s1: $('#btn-s_1'),
            $btn_s2: $('#btn-s_2'),

            $progress: $('#progress'),
            $counting: $('#counting'),
            $form: $('#form'),
            // $result: $('#result-box'),
            $score: $('#result-score'),
            $slickList: $('#slick-list'),
            $cover: $('#cover'),
            $btn_coverClose: $('#btn-cover_close'),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            // alert(deviceObj.name);
            this.bindEvent();
            this.buildSlick();
        },
        bindEvent: function() {
            let $this = this;

            // s1
            $this.el.$btn_s1.on('click', (e) => {
                $this.el.$s_1.attr('data-layer', 2);
                doProgress();
            });
            function doProgress() {
                let $_counting = 10
                , $_timer;
                $_timer = setInterval(( () => {
                    $_counting -= 1;
                    // $this.el.$progress.attr('data-progress', $_counting);
                    $this.el.$counting.html($_counting);
                    if ($_counting < 0){
                        console.log($_counting);
                        clearInterval($_timer);
                        $this.el.$s_1.attr('data-layer', 3);
                    }
                }), 1050);
            }

            // s2
            $this.el.$btn_s2.on('click', (e) => {
                let $_result
                , $_score = 0
                , $_count1 = 0
                , $_count2 = 6;
                $.each($this.el.$form.serializeArray(), function() {
                    $_count1++;
                    console.log(this.value);
                    $_score += parseInt(this.value);
                    console.log($_score);
                });
                if ($_count1 == $_count2) {
                    if ($_score > 10) {
                        $_result = 3;
                    } else if ($_score > 4) {
                        $_result = 2;
                    } else {
                        $_result = 1;
                    }
                    $this.el.$form.find('input[type="radio"]').attr('disabled','disabled');
                    $this.el.$score.attr('data-score', $_score);
                    $this.el.$s_2.attr('data-result', $_result).attr('data-layer', 2);
                    return;
                } else {
                    return alert('尚有未選擇項目');
                }
            });

            // s3
            $this.el.$slickList.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                event.preventDefault();
            });
            $this.el.$slickList.find('.slick-item').on('click', (e) => {
                let $_item = $(e.target).attr('data-item');
                return $this.el.$s_3.attr('data-cover', $_item);
            });
            $this.el.$btn_coverClose.on('click', (e) => {
                $this.el.$s_3.attr('data-cover', '');
            });
        },
        buildSlick: function() {
            this.el.$slickList.slick({
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                autoplay: false,
                autoplaySpeed: 2000,
            });
        }
    };
    MAIN.init();
});