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
            $points: $('#points'),
            $dialogs: $('#dialogs'),
            $game: $('#game'),

            // other // 其他元素由此往下新增
            $catcher_box: $('#catcher_box'),
            $catcher: $('#catcher'),
            $stuffs: $('#stuffs'),

        },
        var: {
            // share // 主要分享的資訊
            $_share: {
                FB: { // FB
                    text: "",
                    link: "https://www.youtube.com/watch?v=2tF9i9fQIKs",
                },
                LINE: { // LINE
                    text: "",
                    link: "https://www.youtube.com/watch?v=2tF9i9fQIKs",
                },
                OUT: { // OUT
                    text: "",
                    link: "https://www.youtube.com/watch?v=2tF9i9fQIKs",
                }
            },

            // core // 核心參數
                // rule
                $_ruleTime: 3, // 規則時間
                $_ruleTimeReal: 1150, // 實際每1秒規則時間, ms
                $_ruleTimeSet: null, // 規則時間倒數計時器
                $_ruleTimeCountdown: null, // 實際遊戲時間倒數計時暫存

                // game
                $_gameTime: 15, // 遊戲時間
                $_gameTimeReal: 1150, // 實際每1秒遊戲時間, ms
                $_gameTimeSet: null, // 遊戲時間倒數計時器
                $_gameTimeCountdown: null, // 實際遊戲時間倒數計時暫存
                $_gameStart: false, // 遊戲是否開始
                $_gamePause: false, // 遊戲是否暫停
                $_gamePauseSet: null, // 遊戲時間暫停計時器
                $_gameStop: false, // 遊戲是否結束
                $_gameStartScore: 0, // 遊戲起始分數
                $_gameScore: 0, // 遊戲暫存分數
                $_scoreY: 10, // 得分
                $_scoreN: 5, // 扣分
                $_maxScore: 100, // 最大分數
                $_minScore: 0, // 最小分數

            // other // 其他元素由此往下新增
                // stuff

                $_delayToNext: 500, // 排序的delay時間
                $_speedMin: 0, // 物品最慢掉落速度
                $_speedMax: 1600, // 物品最快掉落速度
                $_stuff:
                [
                    // good // 加分的
                    { // plus1
                        w: $('#item_plus_1').width(),
                        h: $('#item_plus_1').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                    { // plus2
                        w: $('#item_plus_2').width(),
                        h: $('#item_plus_2').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                    { // plus3
                        w: $('#item_plus_3').width(),
                        h: $('#item_plus_3').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                    // bed // 扣分的
                    { // minus1
                        w: $('#item_minus_3').width(),
                        h: $('#item_minus_3').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                    { // minus2
                        w: $('#item_minus_2').width(),
                        h: $('#item_minus_2').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                    { // minus3
                        w: $('#item_minus_3').width(),
                        h: $('#item_minus_3').height(),
                        initAmount: 1, // 初始要有幾個東西開始掉落
                    },
                ],
                $signOrder: 0,
                // $signArr: [[0, 1, 2],[3, 4, 5]],
                $signArr: [1, 2, 3, 4, 5],
                $_lastheight: 0,
                $_doduplicate: '1',
                $_queue: '',

        },

        // Function
        init: function() {
            var $this = this;
            // ga_pv("首頁");

            $this.bindEvent();
            $this.var.$score = this.var.$_gameStartScore;
            $this.var.$_gameScore = this.var.$_gameStartScore;

            // dev mode
                console.log("Is it still test mode? " + window.__dev);
                // this.beforeGameGo(); // dev mode
                // this.gameGo(); // dev mode

            if ($this.var.$windowopen) {
                $this.switchToRulePage();
            }
        },
        bind: function(obj, method) { return function() { return method.apply(obj, [].slice.call(arguments)); }; },

        shuffleArr: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        },
        bindEvent: function() {
            var $this = this;
            // start, section_index
            $this.el.$section_index.find(".main_text").on("click", function() {
                // ck_count("有我！立即協助");
                $this.switchToRulePage();
            });

            // share // 主要分享的元素
                // OUT
                $this.el.$section.find(".btns .link").on("click", function(e) {
                    // ck_count("更多媽媽的難題_" + $this.var.$_share.OUT.text);
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
            $this.el.$section.find(".btns .again").on("click", function(e) {
                // ck_count("再次協助");
                $this.doGameReset();
                $this.switchToSection(1);
            });

            // game  // 遊戲點擊由此往下新增
            $( ".draggable" ).each(function(){$(this).draggable({ containment: "parent" });});
            $this.el.$catcher.on('touchmove', function(e) {
                var _target = $(e.target);
                var _target_w = Math.round(_target.width() / 2);
                var moveX = event.touches[0].clientX - _target_w;
                TweenMax.to(_target, 0, {
                    ease: Power0.easeNone,
                    left: moveX,
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
                        if ($this.var.$_ruleTimeCountdown == 1) {
                            $this.var.$signArr = $this.shuffleArr($this.var.$signArr);
                            $this.runStuff();
                        }
                        if ($this.var.$_ruleTimeCountdown > 0) return;
                        clearInterval($this.var.$_ruleTimeSet);
                        // done
                        $this.beforeGameGo();
                    }, $this.var.$_ruleTimeReal
                );
            },

        /* =======================
        Game Page
        ======================= */
            doGameReset: function() {
                // core // 核心
                this.el.$main.attr("data-score", this.var.$_gameStartScore);
                this.el.$main.attr("data-result", "");
                this.el.$main.attr("data-countdown", "");
                this.var.$_gameStop = false;
                this.var.$_gameScore = this.var.$_gameStartScore;
                this.el.$score.html(this.var.$_gameStartScore);

                // other // 其他由此往下新增
                this.el.$stuffs.empty();
                this.el.$points.empty();
                this.el.$dialogs.empty();
            },
            beforeGameGo: function() {
                console.log("beforeGameGo");
                this.switchToSection(3); // switch to section 3
                // ga_pv("遊戲畫面");

                /********** game start **********/
                this.gameGo();
                /********************************/
            },
            // gameGo
            gameGo: function() {
                console.log("gameGo");

                this.var.$_gameStart = true;

                // do game time countdown
                this.gameCountdown(); // dev mode, to be hide

                // 開始跑Stuff
                // this.var.$signArr[0] = this.shuffleArr(this.var.$signArr[0]);
                // this.var.$signArr[1] = this.shuffleArr(this.var.$signArr[1]);

                // this.var.$signArr = this.shuffleArr(this.var.$signArr);
                // this.runStuff();
            },
            // gameCountdown
            gameCountdown: function() {
                console.log("gameCountdown");
                // return;

                var $this = this;
                // set default game time of the begin
                $this.el.$section_game.attr("data-countdown", this.var.$_gameTime);
                $this.el.$time.html($this.var.$_gameTime);
                if ($this.var.$_gameStop) {
                    clearInterval($this.var.$_gameTimeSet);
                    return;
                }
                $this.var.$_gameTimeSet = setInterval(
                    function() {
                        if ($this.var.$_gamePause) return;
                        $this.var.$_gameTimeCountdown = $this.el.$section_game.attr("data-countdown");
                        $this.var.$_gameTimeCountdown--;
                        $this.el.$section_game.attr("data-countdown", $this.var.$_gameTimeCountdown);
                        $this.el.$time.html($this.var.$_gameTimeCountdown);
                        if ($this.var.$_gameTimeCountdown > 0) return;
                        clearInterval($this.var.$_gameTimeSet);
                        // done
                        $this.doGameOver();
                    }, $this.var.$_gameTimeReal
                );
            },

            // runStuff
            runStuff: function() {
                var $this = this;
                console.log("runStuff");
                // return;

                // create good stuff
                // for (var i = 0; i < 1; i++) {
                //     $this.createStuff(0);
                // }

                // create stuff
                for (var i = 0; i < 3; i++) {
                    $this.createStuff($this.var.$signArr[$this.var.$signOrder]);
                }
            },
            // createStuff
            createStuff: function(type) {
                // console.log("createStuff");
                // console.log(type); return;
                // console.log(type);
                var $this = this;
                $this.var.$signOrder = ($this.var.$signOrder < ($this.var.$signArr.length-1))?($this.var.$signOrder+1):0; // order bad stuff
                // console.log($this.var.$signOrder);
                if ($this.var.$_gameStop) return;

                $(this).delay($this.var.$_delayToNext).queue(function(next){

                    var _class = "stuff";
                    var _class_unique_id = Date.now();
                    var _item_type = type;
                    var _class_no = "_no" + _item_type;
                    _class_unique_id++;

                    var move_time = ($this.var.$_speedMax)/1000;
                    // set stuff x
                    console.log(_item_type);
                    var position_x = Math.round(Math.random() * ($this.el.$game.width() - $this.var.$_stuff[_item_type].w));
                    var position_y = -($this.el.$game.height());
                    position_y = -$this.var.$_stuff[_item_type].h;

                    if (_item_type == 0) {
                        position_y*=2
                    }

                    // create stuff, set stuff left and top
                    _class_unique_id = "_" + _class_unique_id;
                    $this.el.$stuffs.append('<div class="breakable ' + _class + ' ' + _class_unique_id + ' ' + _class_no + ' _du' + $this.var.$_doduplicate + '" data-id="' + _class_unique_id + '" data-type="' + _item_type + '"></div>');
                    var _class2 = $('.breakable[data-id="' + _class_unique_id + '"]');
                    _class2.css(
                        {
                            'left': position_x,
                            'top': position_y,
                        }
                    );

                    // start falling
                    TweenMax.to(
                        _class2,
                        move_time,
                        {
                            ease: Power0.easeNone,
                            y: $this.el.$section_game.height() + "px",
                            onComplete: function() {
                                _class2.remove();
                                if(_class2.hasClass('_isCollision')) {
                                    // console.log('碰到了');
                                    return;
                                }
                                // console.log('沒碰到');
                                console.log($this.var.$signOrder);
                                console.log($this.var.$signArr[$this.var.$signOrder]);
                                $this.createStuff($this.var.$signArr[$this.var.$signOrder]);
                            },
                            onUpdate: function() {
                                $this.detectCollision();
                            }
                        },
                    );

                next();
                });

                return;
            },
            // detect collision
            detectCollision: function(event, ui) {
                // return;
                var $this = this;
                $(".overlap").remove();
                var breakable = $this.el.$catcher.collision(".breakable"); // no "as", so we get the things we collided with instead of new div's
                breakable.remove();
                if (breakable.length > 0) { // 確定有碰撞
                    breakable.addClass("_isCollision");

                    var _type = breakable[0].dataset.type;
                    $this.createStuff($this.var.$signArr[$this.var.$signOrder]);

                    var _class = "_point";
                    var _class_unique_id = "_" + Date.now();
                    if (_type == "0" || _type == "1" || _type == "2") {
                        $this.scoreCount(1);
                        _class += " _y";
                    } else  {
                        $this.scoreCount(0);
                        _class += " _n";
                    }
                    _class += (" " + _class_unique_id);
                    // 顯示 point1
                    $this.el.$points.append("<div class='" + _class + "1'></div>");
                    TweenMax.to($("." + _class_unique_id + "1"), 1, {
                        ease: Power0.easeNone,
                        marginTop: -20,
                        opacity: .1,
                        onComplete: function() {
                            $(this.target).remove();
                        },
                    });
                    // 顯示 point2
                    $this.el.$dialogs.append("<div class='" + _class + "2'></div>");
                    TweenMax.to($("." +_class_unique_id + "2"), 1.8, {
                        marginTop: -1,
                        opacity: .1,
                        onComplete: function() {
                            $(this.target).remove();
                        },
                    });
                }
            },

            // do game over
            doGameOver: function() {
                console.log("doGameOver");
                // return; // dev mode

                $(this).clearQueue();
                var $this = this;
                // count result
                if ($this.var.$_gameScore > 80) {
                    // ga_pv('結果頁100');
                    $this.el.$main.attr('data-result', 1);
                } else if (this.var.$_gameScore > 50) {
                    // ga_pv('結果頁80');
                    $this.el.$main.attr('data-result', 2);
                } else {
                    // ga_pv('結果頁50');
                    $this.el.$main.attr('data-result', 3);
                }

                $this.switchToSection(4); // switch to section 4

                $this.var.$_gameStop = true;
                TweenMax.killAll();

                // ga_pv("結果畫面");
            },

            // score count
            /***
            使用方法
            scoreCount(1), 加分
            scoreCount(0), 減分
            ***/
            scoreCount: function(num) {
                // console.log((num)?'加分啦':'扣分啦');
                if (this.var.$_gameStop) return;
                if (num == 1) this.var.$_gameScore += this.var.$_scoreY;
                else this.var.$_gameScore -= this.var.$_scoreN;
                if (this.var.$_gameScore > this.var.$_maxScore) this.var.$_gameScore = this.var.$_maxScore; // 最大分數
                if (this.var.$_gameScore < this.var.$_minScore) this.var.$_gameScore = this.var.$_minScore; // 最小分數

                this.el.$score.html(this.var.$_gameScore);
                this.el.$main.attr('data-score', this.var.$_gameScore);
            },

        /* =======================
        Result Page
        ======================= */

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
});

