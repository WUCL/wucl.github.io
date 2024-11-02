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

            $btn_s2_1next: $('#btn-s_2-1-next'),
            $btn_s2_2next: $('#btn-s_2-2-next'),

            $progress: $('#progress'),
            $counting: $('#counting'),
            $form: $('#form'),
            // $result: $('#result-box'),
            $score: $('#result-score'),
            $slickList: $('#slick-list'),
            $cover: $('#cover'),
            $btn_coverClose: $('#btn-cover_close'),

            $new_result: $('#new_result'),
            $btn_download: $('#btn-download'),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            // alert(deviceObj.name);
            this.bindEvent();
            // this.buildSlick();

            // this.go_html2canvas();
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
            $this.el.$btn_s2_1next.on('click', (e) => {
                // console.log('$btn-s_2-1-next');
                let _topic = 1 // topic 1
                , _q = 5 // 題數
                , _qid = 'q-' + _topic + '-'; // NAME

                for (let i = 1; i <= _q; i++ ){
                    // console.log(_qid + i);
                    _checks =  $("input[name='" + _qid + i + "']");
                    if (!_checks.is(":checked")) {
                        // console.log("not check; " + i);
                        return alert('尚有未選擇項目');
                    }
                }
                console.log('step 1, pass;')
                // document.getElementById("s-2").scrollIntoView(); // scroll to view
                return $this.el.$s_2.attr('data-step', 2); // chagne steps
            });
            $this.el.$btn_s2_2next.on('click', (e) => {
                // console.log('$btn-s_2-2-next');
                let _topic = 2 // topic 2
                , _q = 4 // 題數
                , _qid = 'q-' + _topic + '-'; // NAME

                for (let i = 1; i <= _q; i++ ){
                    // console.log(_qid + i);
                    _checks =  $("input[name='" + _qid + i + "']");
                    if (!_checks.is(":checked")) {
                        // console.log("not check; " + i);
                        return alert('尚有未選擇項目');
                    }
                }
                console.log('step 2, pass;');
                // document.getElementById("s-2").scrollIntoView(); // scroll to view
                return $this.el.$s_2.attr('data-step', 3); // chagne steps
            });

            // final check
            $this.el.$btn_s2.on('click', (e) => {
                let $_result
                , $_score = 0
                , $_count1 = 0
                , $_count2 = 12 // 題數 5 + 4 + 3;
                , $_osdi // 公式
                , $_download;
                $.each($this.el.$form.serializeArray(), function() {
                    $_count1++;
                    // console.log('this.value :: ' + this.value);
                    $_score += parseInt(this.value);
                    // console.log('$_score :: ' + $_score);
                    // console.log('$_count1 :: ' + $_count1);
                });
                if ($_count1 == $_count2) {
                    $_osdi = parseInt(($_score*25) / $_count2); // 乾眼症評分方式 OSDI = (總和x25)/答題數
                    console.log('$_osdi :: ' + $_osdi);
                    if ($_osdi >= 33) { // 重度
                        $_result = 4;
                    } else if ($_osdi >= 23) { // 中度
                        $_result = 3;
                    } else if ($_osdi >= 13) { // 輕度
                        $_result = 2;
                    } else { // 正常
                        $_result = 1;
                    }
                    console.log($_result);

                    $this.el.$form.find('input[type="radio"]').attr('disabled','disabled'); // lock radio
                    $this.el.$score.attr('data-score', $_score);
                    $this.el.$s_2.attr('data-result', $_result).attr('data-layer', 2); // chagne layer

                    $_download = $this.el.$new_result.find(' > img[data-rimg="' + $_result + '"]').attr('src');
                    // console.log($_download);
                    $this.el.$btn_download.attr('href', $_download);

                    // document.getElementById("s-2").scrollIntoView(); // scroll to view

                    /*
                    html2canvas(document.querySelector("#capture")).then(canvas => {
                        console.log(456);
                        document.querySelector("#capture").appendChild(canvas);
                    });
                    */
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
        },
        go_html2canvas: function() {
            html2canvas(document.querySelector("#go_capture")).then(canvas => {
                // console.log(123);
                document.body.appendChild(canvas);
            });
        }
    };
    MAIN.init();
});