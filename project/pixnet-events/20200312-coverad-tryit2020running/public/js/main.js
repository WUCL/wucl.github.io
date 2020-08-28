window.downSpeed = { // 物品最快和最慢掉落速度
    min: 3000, // 3500
    max: 5000, // 4500
}
$(function() {
    var main = {
        dev: false,
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $main: $('#main'),
            $section: $('.section__item'),
            $section1: $('.section__item.section__item--1'),
            $section2: $('.section__item.section__item--2'),
            $section3: $('.section__item.section__item--3'),
            $section4: $('.section__item.section__item--4'),
            $stuffs: $('#stuffs'),
            $time: $('#game--time'),
            $score: $('#game--score'),
            $catcher: $('#catcher'),
            $milestone: $('#milestone'),

            $btnAgain: $('#btn-again'),
            $btnLink: $('#btn-link'),
        },
        var: {
            $outLink: 'https://youtu.be/xOY9Mt_rnzY',

            $_objectItem: {  // 物件的大小
                w: 48,
                h: 48,
            },
            $_objectQuantity: 2, // 物件總數
            $_gameStop: false, // 遊戲是否結束
            $_gameScore: 0, // 遊戲暫存分數

            $_ruleTime: 5, // 規則時間
            $_ruleCDTime: 1100, // 規則時間實際1秒
            $_ruleTimeCountdown: null, // 實際遊戲時間倒數計時暫存
            $_ruleTimeSet: null, // 規則時間倒數計時器
            $_gameTime: 15, // 遊戲時間
            $_gameCDTime: 900, // 遊戲時間實際1秒
            $_gameTimeSet: null, // 遊戲時間倒數計時器
            $_gameTimeCountdown: null, // 實際遊戲時間倒數計時暫存
            $_deafultNum: 6, // 初始要有幾個東西開始掉落
            // $_doTouchmove: false, // 暫存做過一次即可
            // $_tempLastFace: '', // 紀錄上一張是使用什麼臉

            $_downSpeedMin: window.downSpeed.min, // 物品最慢掉落速度
            $_downSpeedMax: window.downSpeed.max, // 物品最快掉落速度
            $_doFaster: true, // 是否越來越快
            $_doFasterSpeed: 123, // 每遊戲1秒減多少
            $_pointScoreY: 5, // 物品得分
            $_pointScoreN: 10, // 物品扣分

            $_temp: { // 暫存用
                stuffCount: 0, // 掉落物不重複計數器
                pointCount: 0, // 分數不重複計數器
            },
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
            this.el.$body.attr('data-game', 'ready');
            this.el.$section2.attr('data-countdown', this.var.$_ruleTime);

            if (this.dev) this.gameReady();
            this.doRule(); // 3/18 改成直接開始
        },
        bindEvent: function() {
            var $this = this;

            // start, section1
            $this.el.$section1.find('.btns').on('click', function() {
                // ck_count('按鈕-開始');
                $this.doRule();
            });

            // game controller
            $game_el = $this.el.$section3.find('.game');
            $game_el.on('touchmove', function(e) {
                e.preventDefault();
                let moveX = event.touches[0].clientX;
                let $target = $this.el.$catcher;
                TweenMax.to(
                    $target,
                    .1,
                    {
                        ease: Power0.easeNone,
                        left: moveX,
                    },
                );
                return;
            });

            // again
            $this.el.$btnAgain.on('click', function(e) {
                // ck_count('按鈕-再玩一次');
                $this.gameReset();
                // return $this.doChangeSection(1);
                return $this.doRule();
            });
            // link
            $this.el.$btnLink.on('click', function(e) {
                // ck_count('按鈕-看更多');
                return window.open($this.var.$outLink);
            });
        },
        // change section
        doChangeSection: function(index) {
            this.el.$main.attr('data-section', index);
        },

        /* =======================
        rule page
        ======================= */
        doRule: function() {
            // ga_pv('畫面-倒數');
            this.doChangeSection(2);
            this.ruleCountDown();
        },
        ruleCountDown: function() {
            let $this = this;
            $this.el.$body.attr('data-game', 'rule');
            let $ruleTimeCountdown = $this.var.$_ruleTime;
            // $this.el.$section2.attr('data-countdown', $this.var.$_ruleTimeCountdown);
            $this.var.$_ruleTimeSet = setInterval(
                function() {
                    $ruleTimeCountdown--;
                    $this.el.$section2.attr('data-countdown', $ruleTimeCountdown);
                    if ($ruleTimeCountdown > 0) return;
                    clearInterval($this.var.$_ruleTimeSet);
                    // done
                    $this.gameReady();
                }, $this.var.$_ruleCDTime
            );
        },

        /* =======================
        game page
        ======================= */
        gameReset: function() { // gameReset
            console.log('gameReset');
            this.el.$main.attr('data-score', '');
            this.el.$main.attr('data-result', '');
            this.el.$section2.attr('data-countdown', this.var.$_ruleTime);
            // this.var.$_gameStop = false;
            this.var.$_gameScore = 0;
            // this.var.$_gameFirstTime = true;
            this.el.$score.html(0);
            this.el.$catcher.css('left', '');

            this.el.$milestone.attr('data-milestone-1', '').attr('data-milestone-2', '').attr('data-milestone-3', '')

            // remove Tween style
            this.el.$catcher.removeAttr('style');
            this.el.$section3.find('.bg').removeAttr('style');
            this.el.$section3.find('.side-l, .side-r').removeAttr('style');

            window.bgScrollSide.restart().pause();
            window.bgScrollBg.restart().pause();
            window.bgScrollCatcher.restart().pause();


            this.var.$_downSpeedMin = window.downSpeed.min;
            this.var.$_downSpeedMax = window.downSpeed.max;
        },
        gameReady: function() { // gameReady
            console.log('gameReady');
            // ga_pv('畫面-遊戲');
            this.doChangeSection(3);

            // set default game time of the begin
            this.el.$section3.attr("data-countdown", this.var.$_gameTime);

            // game start
            this.gameGo();
        },
        gameGo: function() { // gameGo
            console.log('gameGo');
            this.var.$_gameStop = false;
            // if (this.dev) return;

            // do game time countdown
            this.el.$body.attr('data-game', 'go');
            this.gameCountDown();

            // create stuff
            for (var i = 0; i < this.var.$_deafultNum; i++) {
                this.createStuff();
            }

            // process bg
            this.bgScroll();
        },
        bgScroll: function() {
            console.log('bgScroll');
            let $this = this;

            window.bgScrollSide = new TimelineLite(); // fadeIn
            window.bgScrollBg = new TimelineLite(); // fadeIn
            window.bgScrollCatcher = new TimelineLite(); // fadeIn

            window.bgScrollSide = TweenMax.to(
                $this.el.$section3.find('.side-l, .side-r'),
                ($this.var.$_gameCDTime * $this.var.$_gameTime) / 1000,
                {
                    ease: Power0.easeNone,
                    y: '200vh',
                },
            );
            window.bgScrollBg = TweenMax.to(
                $this.el.$section3.find('.bg'),
                ($this.var.$_gameCDTime * $this.var.$_gameTime) / 1000,
                {
                    ease: Power0.easeNone,
                    backgroundPositionY: '0%', // calc(850px / 2)
                },
            );
            window.bgScrollCatcher = TweenMax.to(
                $this.el.$catcher,
                ($this.var.$_gameCDTime * $this.var.$_gameTime) / 1000,
                {
                    ease: Power0.easeNone,
                    y: '-25vh',
                },
            );
            return;
        },
        createStuff: function() { // createStuff
            // console.log('createStuff');
            let $this = this;
            if ($this.var.$_gameStop) return;
            $this.var.$_temp.stuffCount++;
            let _class = 'stuff breakable';
            let _uid = 'stuff-' + $this.var.$_temp.stuffCount;
            let _object_type = Math.floor((Math.random() * $this.var.$_objectQuantity)+1);
            let move_time = (
                Math.round(
                    Math.random() *
                    ($this.var.$_downSpeedMax - $this.var.$_downSpeedMin)
                )
                + $this.var.$_downSpeedMin
                ) / 1000;
            // set stuff x
            let position_x = Math.round(Math.random() * ($this.el.$section3.find('.game').width() - $this.var.$_objectItem.w));
            let position_y = -((Math.round(Math.random() * (($this.el.$section3.find('.game').height() - $this.var.$_objectItem.h) - $this.var.$_objectItem.h)))*2);
            // console.log(position_y);

            // create stuff, set stuff left and top
            $this.el.$stuffs.append('<div id="' + _uid + '" class="' + _class + '" data-object="' + _object_type + '"></div>');
            let _class2 = $('#' + _uid);
            _class2.css(
                {
                    'left': position_x,
                    'top': position_y,
                }
            );

            // bind click
            _class2.on('click', function(e) {
                $this.clickStuff(e);
            });

            // start falling
            TweenMax.to(
                _class2,
                move_time,
                {
                    ease: Power0.easeNone,
                    y: ($this.el.$section3.height() + Math.abs(_class2.position().top)) + "px",
                    onCompleteParams:["{self}"],
                    onComplete: (e) => {
                        $(e.target).remove();
                        if($(e.target).hasClass('_isCollision')) {
                            // console.log('yess');
                            return;
                        }
                        // console.log('noo');
                        $this.createStuff();
                    },
                    onUpdate: function() {
                        $this.showOverlap();
                    }
                },
            );
        },
        clickStuff: function(e) { // clickStuff
            console.log('clickStuff');
            var _score = parseInt(this.el.$score.html()) || 0;
            this.el.$score.html(_score += 1);
            TweenMax.to(
                $(e.target),
                .2,
                {
                    ease: Power0.easeNone,
                    scale: .95,
                    opacity: 0,
                }
            );
        },
        gameCountDown: function() { // gameCountDown
            console.log('gameCountDown');
            // if (this.dev) return;

            var $this = this;
            $this.el.$time.html($this.var.$_gameTime);
            if ($this.var.$_gameStop) {
                clearInterval($this.var.$_gameTimeSet);
                return;
            }
            $this.var.$_gameTimeSet = setInterval(
                function() {
                    $this.var.$_gameTimeCountdown = $this.el.$section3.attr("data-countdown");
                    $this.var.$_gameTimeCountdown--;
                    $this.el.$section3.attr("data-countdown", $this.var.$_gameTimeCountdown);
                    $this.el.$time.html(($this.var.$_gameTimeCountdown < 10)?("0" + $this.var.$_gameTimeCountdown):$this.var.$_gameTimeCountdown);
                    if ($this.var.$_doFaster) { // 越跑越快的設定
                        $this.var.$_downSpeedMin -= $this.var.$_doFasterSpeed;
                        $this.var.$_downSpeedMax -= $this.var.$_doFasterSpeed;
                    }
                        $this.scoreCount(2); // for this game use
                    if ($this.var.$_gameTimeCountdown > 0) return;
                    clearInterval($this.var.$_gameTimeSet);
                    // done
                    $this.doGameOver();
                }, $this.var.$_gameCDTime
            );
        },

        doGameOver: function() { // do game over
            console.log('doGameOver');
            if (this.dev) return;
            this.el.$body.attr('data-game', 'over');
            this.var.$_gameStop = true;
            this.el.$stuffs.empty();

            // count result
            if (this.var.$_gameScore > 90) {
                // ga_pv('畫面-結果1');
                this.el.$main.attr('data-result', 1);
            } else if (this.var.$_gameScore > 60) {
                // ga_pv('畫面-結果2');
                this.el.$main.attr('data-result', 2);
            } else {
                // ga_pv('畫面-結果3');
                this.el.$main.attr('data-result', 3);
            }

            this.doChangeSection(4);
            // ga_pv('結果頁');
        },

        // detect collision
        showOverlap: function(event,ui) {
            $(".overlap").remove();
            let $this = this;
            // var overlap = this.el.$catcher.collision( ".obstacle", { as: "<div/>" } );
            // overlap.addClass("overlap").appendTo("body");
            let breakable = $this.el.$catcher.collision( ".breakable" ); // no "as", so we get the things we collided with instead of new div's
            breakable.remove();
            if (breakable.length > 0) { // 確定有碰撞
                breakable.addClass('_isCollision');
                $this.createStuff();

                $this.var.$_temp.pointCount++;
                let _type = breakable[0].dataset.object;
                let _class = 'point';
                let _uid = 'point-' + $this.var.$_temp.pointCount;
                let _target_talk = $this.el.$catcher;
                let _target_score = $this.el.$section3.find('.score'); // show point position
                // 判斷分數間隔
                if (_type == '1') { //_type == '1' || _type == '2' || _type == '3' || _type == '4'
                    $this.scoreCount(1);
                    _class += ' _y';
                    $this.el.$body.attr('data-point', 'y');
                } else {
                    $this.scoreCount(0);
                    _class += ' _n';
                    $this.el.$body.attr('data-point', 'n');
                }

                $('.point._talk').remove();
                _target_talk.append('<div id="' + _uid + '_talk" class="' + _class + ' _talk"></div>');
                _target_score.append('<div id="' + _uid + '_score" class="' + _class + ' _score"></div>');
                TweenMax.to(
                    $('#' + _uid + '_score'),
                    1.35,
                    {
                        ease: Power0.easeNone,
                        top: -50,
                        opacity: 0,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                            $this.el.$body.attr('data-point', '');
                        }
                    },
                );
                TweenMax.to(
                    $('#' + _uid + '_talk'),
                    1.5,
                    {
                        ease: Power0.easeNone,
                        opacity: .1,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                        }
                    },
                );
            }
        },


        scoreCount: function(num) { // score count // 1 = 得分, 0 = 扣分, 2 = 特殊
            if (this.var.$_gameStop) return;
            if (num == 1) this.var.$_gameScore += this.var.$_pointScoreY;
            else if (num == 2) this.var.$_gameScore += 3;
            else if (num == 0) this.var.$_gameScore -= this.var.$_pointScoreN;
            if (this.var.$_gameScore < 0) this.var.$_gameScore = 0;
            window.helper.magicNum(this.el.$score, this.var.$_gameScore);
            // console.log(this.var.$_gameScore);
            this.el.$main.attr('data-score', this.var.$_gameScore);
            this.checkMilestone();
        },

        checkMilestone: function() {
            let $milestone = this.el.$milestone
            if ($milestone.attr('data-milestone-3') !== 'done' && this.var.$_gameScore >= 90) {
                $milestone.attr('data-milestone-3', 1);
                TweenMax.to(
                    $milestone,
                    1.35,
                    {
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).attr('data-milestone-3', 'done');
                        }
                    },
                );
            } else if ($milestone.attr('data-milestone-2') !== 'done' && this.var.$_gameScore >= 60) {
                $milestone.attr('data-milestone-2', 1);
                TweenMax.to(
                    $milestone,
                    1.35,
                    {
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).attr('data-milestone-2', 'done');
                        }
                    },
                );
            } else if ($milestone.attr('data-milestone-1') !== 'done' && this.var.$_gameScore >= 30) {
                $milestone.attr('data-milestone-1', 1);
                TweenMax.to(
                    $milestone,
                    1.35,
                    {
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).attr('data-milestone-1', 'done');
                        }
                    },
                );
            }
        },
    };

    if (deviceObj.isMobile()) {
        main.init();
    } else {
        $('body').append(`
            <style>
            #overlay-mb { position: fixed;z-index: 9;top: 0;left: 0;width: 100vw;height: 100vh;background: rgba(0, 0, 0, .95); }
            #overlay-mb .inner { position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%); }
            #overlay-mb h2 { font-size: 18px;letter-spacing: 1px;color: #fff;margin: 15px 0; }
            #overlay-mb img { width: 200px;object-fit: fill;display: block;margin: 0 auto; }
            </style>
            <div id="overlay-mb"><div class="inner"><img class="qrcode" src="qrcode.png"><h2>手機蓋板廣告 - 統一小時光灰熊失禮</h2><img class="screen" src="screen.png"></div></div>
        `);
    }
});

/* =======================
helper
======================= */
window.helper = {
    magicNum: function(_target, _endNum, _duration) {
        $({Counter: _target.text()}).animate({
            Counter: _endNum
        }, {
            duration: _duration || 200,
            easing: 'swing',
            step: function() {
                _target.text(Math.floor(this.Counter));
            },
            complete: function () {
                _target.html(this.Counter);
                // alert('finished');
            }
        });
    },
    getRandom: function(min, max) {
        return Math.floor(Math.random()*(max-min+1))+min;
    },
};