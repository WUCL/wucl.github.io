$(function() { // 如要直接使用main的function 把此$(function()背著掉
    var main = {
        el: {
            // core // 核心元素
            $window: $(window),
            $doc: $(document),
            $main: $("#main"),
            $section: $(".section__item"),
            $section_index: $(".section__item.section__item--1"),
            $section_rule: $(".section__item.section__item--2"),
            $section_game: $(".section__item.section__item--3"),
            $section_result: $(".section__item.section__item--4"),
            $time: $("#game--time"),
            $score: $('#game--score'),
            $game: $('#game'),

            // other // 其他元素由此往下新增
            $textalert: $('#textalert'),
            $ballroll: $('#ballroll'),
            $pokes: $('#pokes'),
            $finger: $('#finger'),
            $result_score: $('#result_score'),
        },
        var: {
            // share // 主要分享的資訊
            $_share: {
                FB: { // FB
                    text: '',
                    link: '',
                },
                LINE: { // LINE
                    text: '',
                    link: '',
                },
                OUT: { // OUT
                    text: '',
                    link: 'https://www.tryit3on3.com.tw/?utm_source=pixnet&utm_medium=mobilefly&utm_campaign=no2#skilltestpage',
                }
            },

            // core // 核心參數
                // rule
                $_ruleTime: 3, // 規則時間
                $_ruleTimeReal: 1150, // 實際每1秒規則時間, ms
                $_ruleTimeSet: null, // 規則時間倒數計時器
                $_ruleTimeCountdown: null, // 實際遊戲時間倒數計時暫存

                // game
                $_gameTime: 10, // 遊戲時間
                $_gameTimeReal: 1350, // 實際每1秒遊戲時間, ms
                $_gameTimeSet: null, // 遊戲時間倒數計時器
                $_gameTimeCountdown: null, // 實際遊戲時間倒數計時暫存
                $_gameStart: false, // 遊戲是否開始
                $_gameStop: false, // 遊戲是否結束
                $_gameFail: false, // 遊戲是否失敗
                $_gameScore: 0, // 遊戲暫存分數
                $_scoreY: 1, // 得分
                $_scoreN: 0, // 扣分

            // other // 其他元素由此往下新增
                $_ballRollingCount: 0,

                $_alertOrder: 0,
                $_alertText: ['1', '2'],
                $_alertTimeSet: null, // 遊戲時間倒數計時器
                $_windComming: false,

                $spinCounter: 0, // 轉圈次數計數器
                $spinSpell: 7, // 幾次算一圈

                $_wind: ['right', 'left'], // 風來的方向有哪些
                $_wind_orientation: '', // 設定風來的方向
                $_ball_el: '#ballroll', // 要轉動的球元素
                $_finger_el: '#finger', // 要轉動的球元素
                $__tl: {
                    ball_rotate: new TimelineMax(), // 球體
                    ball_rotate_r: new TimelineMax(), // 球體逆轉用
                    ball_falling: new TimelineMax(), // 球體落下用
                    finger_down: new TimelineMax(), // 手指縮掉用
                },

                $_rotate_deg_center: 0, // 原始角度
                $_rotate_deg_max: 40, // 最大角度
                $_rotate_deg_max_each: 9, // 倒轉回來每次角度
                $_rotate_deg_max_time: 3.5, // 5, // 最大角度轉動耗時
        },

        // Function
        init: function() {
            var $this = this;
            // ga_pv("首頁");
            $this.bindEvent();

            // dev mode
                // console.log("Is it still test mode? " + window.__dev);
                // this.beforeGameGo(); // dev mode
                // this.gameGo(); // dev mode
        },
        bind: function(obj, method) { return function() { return method.apply(obj, [].slice.call(arguments)); }; },
        bindEvent: function() {
            var $this = this;
            // start, section_index
            $this.el.$section_index.find(".start_btn").on("click", function() {
                // ck_count("立即挑戰");
                $this.switchToRulePage();
            });

            // share // 主要分享的元素
                // OUT
                $this.el.$section.find(".btns .link").on("click", function(e) {
                    // ck_count("挑戰更多關卡_" + $this.var.$_share.OUT.text);
                    window.open($this.var.$_share.OUT.link);
                });
                // FB
                $this.el.$section.find(".btns .share.fb").on("click", function(e) {
                    // ck_count("FB");
                    window.open("http://www.facebook.com/sharer.php?u=" + $this.var.$_share.FB.link);
                });
                // LINE
                $this.el.$section.find(".btns .share.line").on("click", function(e) {
                    // ck_count("Line");
                    var _text = encodeURIComponent($this.var.$_share.LINE.text);
                    var _url = encodeURIComponent($this.var.$_share.LINE.link);
                    if (_text != "") window.open("http://line.naver.jp/R/msg/text/?" + _text + "%0D%0A" + _url);
                    else window.open("http://line.naver.jp/R/msg/text/?" + _url);
                });

            // again
            $this.el.$section.find('.btns .again').on('click', function(e) {
                // ck_count('再Try一次');
                $this.gameReset();
                $this.switchToSection(1);
            });

            // game  // 遊戲點擊由此往下新增
            $this.el.$pokes.find('.poke').on('click', function(e) {
                var _el = e.currentTarget;
                TweenMax.to(_el, 0, {
                    scale: .5,
                    onComplete: function() {
                        TweenMax.to(_el, .1, {
                            scale: 1,
                        });
                    }
                });

                var _orientation = $(_el).attr('data-orientation');
                // 點反方向救球
                if ($this.var.$_wind_orientation == _orientation) {
                    $this.doFault();
                    return;
                }

                var _current_rotation = $this.el.$ballroll[0]._gsTransform.rotation;
                var _each_rotation = $this.var.$_rotate_deg_max_each;
                if (_orientation == 'left') {
                    _each_rotation = -(_each_rotation);
                }
                var _new_rotation = _current_rotation - _each_rotation;
                if (_orientation == 'left') {
                    if (_new_rotation > .1) _new_rotation = 0;
                } else {
                    if (_new_rotation < -.1) _new_rotation = 0;
                }

                $this.var.$__tl.ball_rotate_r.clear();
                $this.var.$__tl.ball_rotate_r = new TimelineMax();

                $this.var.$__tl.ball_rotate_r.to($this.var.$_ball_el, .1, {
                    rotation: _new_rotation,
                    onUpdate: function() {
                        $this.var.$__tl.ball_rotate.pause();
                    },
                    onComplete: function() {
                        if (_new_rotation == 0) {
                            $this.switchWindComming(0);
                            $this.var.$__tl.ball_rotate_r.pause();
                            return;
                        }
                        $this.doRotate($this.var.$_wind_orientation, $this.var.$_rotate_deg_max);
                    }
                });
            });
            // other // 其他元素由此往下新增

        },

        // change section
        switchToSection: function(_page) {
            this.el.$main.attr("data-section", _page);
        },

        /* =======================
        Rule Page
        ======================= */
            switchToRulePage: function() {
                this.switchToSection(2); // changing to section 2
                // ga_pv("倒數畫面");
                this.startToRuleCountdown(); // start to rule countdown
                this.beforeGameGo(); // before game go
            },
            startToRuleCountdown: function() {
                console.log("startToRuleCountdown");
                var $this = this;
                $this.var.$_ruleTimeCountdown = $this.var.$_ruleTime;
                $this.el.$section_rule.attr("data-countdown", $this.var.$_ruleTimeCountdown);
                $this.var.$_ruleTimeSet = setInterval(
                    function() {
                        $this.var.$_ruleTimeCountdown--;
                        $this.el.$section_rule.attr("data-countdown", $this.var.$_ruleTimeCountdown);
                        if ($this.var.$_ruleTimeCountdown > 0) return;
                        clearInterval($this.var.$_ruleTimeSet);
                        // done
                        /********** game start **********/
                        $this.gameGo();
                        /********************************/
                    }, $this.var.$_ruleTimeReal
                );
            },

        /* =======================
        Game Page
        ======================= */
            beforeGameGo: function() {
                console.log("beforeGameGo");
                // set default game time of the begin
                this.el.$time.html(this.var.$_gameTime);
                this.el.$section_game.attr("data-countdown", this.var.$_gameTime);

                this.el.$section_game.attr('data-alert', 1);
                this.doBallSpin();
            },
            // gameGo
            gameGo: function() {
                console.log("gameGo");
                var $this = this;

                $this.switchToSection(3); // switch to section 3
                // ga_pv("遊戲畫面");

                $this.var.$_gameStart = true; // game start

                // do game time countdown
                $this.gameCountdown(); // dev mode

                // 秀輪播文字
                $this.doIntervalAlert();
            },
            // gameCountdown
            gameCountdown: function() {
                console.log("gameCountdown");
                // return;

                var $this = this;
                if ($this.var.$_gameStop) {
                    clearInterval($this.var.$_gameTimeSet);
                    return;
                }
                $this.var.$_gameTimeSet = setInterval(
                    function() {
                        $this.var.$_gameTimeCountdown = $this.el.$section_game.attr("data-countdown");
                        $this.var.$_gameTimeCountdown--;
                        $this.el.$section_game.attr("data-countdown", $this.var.$_gameTimeCountdown);
                        $this.el.$time.html($this.var.$_gameTimeCountdown);
                        if ($this.var.$_gameTimeCountdown == 8 || $this.var.$_gameTimeCountdown == 5 || $this.var.$_gameTimeCountdown == 2) {
                            // 起風
                            $this.switchWindComming(1);
                        }
                        if ($this.var.$_gameTimeCountdown > 0) return;
                        // done
                        if (!$this.var.$_gameStop) $this.doGameOver();
                    }, $this.var.$_gameTimeReal
                );
            },

            // score count
            /***
            使用方法
            scoreCount(1), 加分
            scoreCount(0), 減分
            ***/
            scoreCount: function(num) {
                if (num == 1) this.var.$_gameScore += this.var.$_scoreY;
                else this.var.$_gameScore -= this.var.$_scoreN;
                if (this.var.$_gameScore < 0) this.var.$_gameScore = 0;
                this.el.$score.html(this.var.$_gameScore);
                // console.log(this.var.$_gameScore);
                this.el.$main.attr('data-score', this.var.$_gameScore);
            },

            doIntervalAlert: function() {
                console.log('doIntervalAlert');
                var $this = this;
                var doSelfAgain = function() {
                    console.log('doSelfAgain');
                    if ($this.var.$_gameStop) {
                        clearInterval($this.var.$_alertTimeSet);
                        return;
                    }
                    if ($this.var.$_windComming) return;
                    $this.doShowAlert($this.var.$_alertText[$this.var.$_alertOrder]);
                    $this.var.$_alertOrder = ($this.var.$_alertOrder == 0)?1:0;
                }
                doSelfAgain();
                $this.var.$_alertTimeSet = setInterval(function() {
                    doSelfAgain();
                }, 2500);
            },

            doBallSpin: function() {
                var $this = this;
                /** BEGIN 旋轉 **/
                $this.el.$ballroll.spritespin({
                    source: SpriteSpin.sourceArray('dist/img/ball/{frame}.png', { frame: [1,8], digits: 2 }),
                    width: 210, // width in pixels of the window/frame
                    height: 186, // height in pixels of the window/frame
                    sense: 1,
                    animate: false,
                    responsive: true,
                    sizeMode: 'original',
                    reverse: false,
                    plugins: [
                      '360',
                      'drag',
                      'ease',
                      'blur',
                    ],
                });
                var api = $this.el.$ballroll.spritespin("api");
                $this.el.$ballroll.bind("onFrameChanged", function(){
                    $this.el.$ballroll.attr('data-line', Math.floor(((Math.random()*10)+1)/2));
                    $this.var.$spinCounter++;
                    if (($this.var.$spinCounter % $this.var.$spinSpell) == 0) {
                        $this.scoreCount(1);
                    }
                    $this.el.$ballroll.addClass('lineheight');
                    clearTimeout($.data(this, 'changeTimer'));
                    $.data(this, 'changeTimer', setTimeout(function() {
                        $this.el.$ballroll.removeClass('lineheight');
                    }, 250));
                });
                /** END 旋轉 **/
            },

            doRotate: function(_orientation, _rotation) {
                console.log('doRotate');
                var $this = this;
                $this.el.$section_game.attr('data-wind', _orientation);
                var _orientation = _orientation;
                var _max_rotation = _rotation;
                $this.var.$_wind_orientation = _orientation; // 記錄目前的球往的方向

                if (_orientation == 'right') {
                    _max_rotation = -(_max_rotation);
                }

                $this.var.$__tl.ball_rotate.clear();
                $this.var.$__tl.ball_rotate = new TimelineMax();

                $this.var.$__tl.ball_rotate.to($this.var.$_ball_el, $this.var.$_rotate_deg_max_time, {
                    rotation: _max_rotation,
                    onUpdate: function() {
                    },
                    onComplete: function() {
                        $this.doFault();
                        return;
                    }
                });
            },

            doShowAlert: function(text) {
                console.log('doShowAlert');
                var $this = this;
                var _which = text;

                $this.el.$textalert.find('.alertlabel').animate({
                    bottom: '-100%',
                }, 600, function() {
                    $this.el.$section_game.attr('data-alert', _which);
                    $this.el.$textalert.find('.alertlabel').animate({
                        bottom: 0,
                    }, 600);
                });
            },

            // 起風了
            /* 用法
            switchWindComming(1) 開啟
            switchWindComming(0) 關閉
            */
            switchWindComming: function(_switch) {
                console.log('windsComming');
                if (_switch) {
                    if (this.el.$main.hasClass('windsComming')) return;
                    this.var.$_windComming = true;
                    this.el.$main.addClass('windsComming');
                    this.doShowAlert(3);
                    this.doRotate(this.var.$_wind[Math.round(Math.random())], this.var.$_rotate_deg_max);
                } else {
                    this.var.$_windComming = false;
                    this.el.$main.removeClass('windsComming');
                }
            },
            doFault: function() {
                console.log('doFault');
                var $this = this;
                $this.switchWindComming(0);
                clearInterval($this.var.$_gameTimeSet); // 刪除計時器
                clearInterval($this.var.$_alertTimeSet); // 刪除計時器
                $this.var.$__tl.ball_rotate.pause();
                $this.var.$__tl.ball_rotate_r.pause();
                $this.var.$_gameFail = true;
                $this.doBallFalling();
            },
            doBallFalling: function() {
                console.log('doBallFalling');
                var $this = this;
                $this.var.$__tl.ball_falling.clear();
                $this.var.$__tl.finger_down.clear();
                $this.var.$__tl.ball_falling = new TimelineMax();
                $this.var.$__tl.finger_down = new TimelineMax();

                var _x = ($this.var.$_wind_orientation == 'left')?$this.var.$_rotate_deg_max:(-($this.var.$_rotate_deg_max));

                $this.var.$__tl.finger_down.to($this.var.$_finger_el, 1, {
                    y: 500,
                    delay: .3,
                    onComplete: function() {
                        console.log('finger_down done');
                    }
                });
                $this.var.$__tl.ball_falling.to($this.var.$_ball_el, 1.3, {
                    y: 500,
                    x: (_x*2.5),
                    delay: 1,
                    onComplete: function() {
                        console.log('doBallFalling done');
                        setTimeout(function() {
                            $this.doGameOver();
                        }, 1000);
                    }
                });
            },

        /* =======================
        Result Page
        ======================= */
            gameReset: function() {
                // core // 核心
                this.el.$main.attr('data-score', '');
                this.el.$main.attr('data-result', '');
                this.el.$main.attr('data-countdown', '');
                this.var.$_gameStart = false;
                this.var.$_gameStop = false;
                this.var.$_gameFail = false;
                this.var.$_gameScore = 0;
                this.el.$score.html(0);

                // other // 其他由此往下新增
                this.el.$main.removeClass('windsComming');
                this.el.$main.removeClass('show_btn');
                this.var.$spinCounter = 0;
                this.el.$textalert.find('label').empty().attr('style', '');
                this.el.$result_score.html(0);
                this.el.$section_game.removeClass('lineheight');
                this.el.$section_game.attr('data-alert', '');
                this.el.$section_game.attr('data-wind', '');
                this.el.$ballroll.attr('data-line', '');
                // destroy the instance
                this.el.$ballroll.spritespin('destroy');
                // remove any HTML leftovers
                this.el.$ballroll.html('');
                // remove any Style leftovers
                this.el.$ballroll.attr('style', '');
                this.el.$finger.attr('style', '');
            },

            // do game over
            doGameOver: function() {
                console.log("doGameOver");
                // return; // dev mode
                var $this = this;
                var _result = 'fault';

                clearInterval(this.var.$_gameTimeSet); // 刪除計時器

                // $this.var.$__tl.catcher_bg.reverse(.01);
                this.var.$__tl.ball_rotate.reverse(.01);
                this.var.$__tl.ball_rotate_r.reverse(.01);
                this.var.$__tl.ball_falling.reverse(.01);
                this.var.$__tl.finger_down.reverse(.01);
                TweenMax.killAll();

                this.var.$_gameStop = true;

                // count result
                if (this.var.$_gameFail) {
                    // ga_pv('結果頁-失敗');
                } else {
                    _result = 'success';
                    _helper.magicNum(this.el.$result_score, this.var.$_gameScore, 3500);
                    // ga_pv('結果頁-成功');
                }
                this.el.$main.attr('data-result', _result);

                this.switchToSection(4); // switch to section 4
                setTimeout(function() {
                    $this.el.$main.addClass('show_btn');
                }, 200)
                // ga_pv("結果畫面");
            },
    };

    if (deviceObj.isMobile()) {
        main.init();
    } else {
        $('body').append(`
            <style>
            #overlay-mb {
                position: fixed;
                z-index: 1;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, .95);
            }
            #overlay-mb .inner {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            #overlay-mb h2 {
                font-size: 18px;
                letter-spacing: 1px;
                color: #fff;
                margin: 15px 0;
            }
            #overlay-mb img {
                width: 200px;
                object-fit: fill;
                display: block;
                margin: 0 auto;
            }
            </style>
            <div id="overlay-mb"><div class="inner"><img class="qrcode" src="qrcode.png"><h2>手機蓋板廣告 - 統一小時光灰熊失禮</h2><img class="screen" src="screen.png"></div></div>
        `);
    }

    function preloadImg() {
        var index = 0,
        len = window.imgs.length;

        //图片预加载
        $.preload(window.imgs, {
            // 是否有序加载
            order: false,
            minTimer: 1300,
            //每加载完一张执行的方法
            each: function (count) {
                // var percent = Math.round((count+1) / len * 100) + '%';
            },
            // 加载完所有的图片执行的方法
            end: function () {
                console.log((index + 1) + '/' + len);
            }
        });
    }
    preloadImg();
});
var _helper = new function() {
    this.magicNum = function(_target, _endNum, _duration) {
        $({Counter: _target.text()}).animate({
            Counter: _endNum
        }, {
            duration: _duration || 800,
            easing: 'easeInOutQuint',
            step: function() {
                _target.text(Math.ceil(this.Counter));
            }
        });
    };
}