window.downSpeed = { // 物品最快和最慢掉落速度
    min: 5000, // 3500
    max: 6500, // 4500
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

            $bggirl: $('#bggirl'),

            // $shareLine: $('.share-line'),
            // $shareFacebook: $('.share-facebook'),
        },
        var: {
            // $share: {
            //     facebookLink: location.origin,
            //     lineText: '我是LINE分享\n哈哈哈哈🥺',
            //     lineLink: location.origin,
            // },
            $outLink: 'https://www.youtube.com/watch?v=2e1VYYJavvg',

            $_objectItem: {  // 物件的大小
                w: 48,
                h: 48,
            },
            $_objectQuantity: 5, // 物件總數
            $_gameStop: false, // 遊戲是否結束
            $_gameScore: 0, // 遊戲暫存分數

            $_ruleTime: 3, // 規則時間
            $_ruleCDTime: 1350, // 規則時間實際1秒
            $_ruleTimeCountdown: null, // 實際遊戲時間倒數計時暫存
            $_ruleTimeSet: null, // 規則時間倒數計時器
            $_gameTime: 15, // 遊戲時間
            $_gameCDTime: 1110, // 遊戲時間實際1秒
            $_gameTimeSet: null, // 遊戲時間倒數計時器
            $_gameTimeCountdown: null, // 實際遊戲時間倒數計時暫存
            $_deafultNum: 11, // 初始要有幾個東西開始掉落
            // $_doTouchmove: false, // 暫存做過一次即可
            // $_tempLastFace: '', // 紀錄上一張是使用什麼臉

            $_downSpeedMin: window.downSpeed.min, // 物品最慢掉落速度
            $_downSpeedMax: window.downSpeed.max, // 物品最快掉落速度
            $_doFaster: true, // 是否越來越快
            $_doFasterSpeed: 200, // 每遊戲1秒減多少
            $_pointScoreY: 10, // 物品得分
            $_pointScoreN: 5, // 物品扣分

            $_temp: { // 暫存用
                stuffCount: 0, // 掉落物不重複計數器
                pointCount: 0, // 分數不重複計數器
                catcherdegree: 0,
                realonecount: 0,
            },
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
            this.el.$body.attr('data-game', 'ready');
            this.el.$section2.attr('data-countdown', this.var.$_ruleTime);
            // ga_pv('畫面-landing');

            if (this.dev) this.gameReady();
            this.doRule(); // 3/23 改成直接開始
        },
        bindEvent: function() {
            var $this = this;

            // start, section1
            $this.el.$section1.find('.btn-start').on('click', function() {
                // ck_count('按鈕-開始');
                $this.doRule();
            });

            // game controller
            $game_el = $this.el.$section3.find('.game');
            // $this.el.$catcher.on('touchmove', function(e) {
            $game_el.on('touchmove', function(e) {
                e.preventDefault();
                let moveX = event.touches[0].clientX - 180;
                let $target = $this.el.$catcher.find('.arrow');
                if (moveX > 60) moveX = 60;
                if (moveX < -70) moveX = -70;
                $this.var.$_temp.catcherdegree = moveX;

                window.catcherArrow = new TimelineLite();
                window.catcherArrow = TweenMax.to(
                    $target,
                    0,
                    {
                        ease: Power0.easeNone,
                        rotation: moveX,
                    }
                );
                return;
            });
            $game_el.on('touchend', function(e) {
                e.preventDefault();
                $this.var.$_temp.realonecount++;
                $this.el.$catcher.append('<div class="catcher real _' + $this.var.$_temp.realonecount + '"></div>');
                let $target = $('.catcher.real._' + $this.var.$_temp.realonecount);
                let $bottom = '100vh';
                let $x = $this.var.$_temp.catcherdegree*20;
                TweenMax.to(
                    $target,
                    1.78,
                    {
                        ease: Power0.easeNone,
                        bottom: $bottom,
                        left: '+=' + $x,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                        },
                    },
                );
                return;
            });

            // again
            $this.el.$section4.find('.btn-again').on('click', function(e) {
                // ck_count('按鈕-再玩一次');
                $this.gameReset();
                // return $this.doChangeSection(1);
                return $this.doRule();
            });
            // more
            $this.el.$section4.find('.btn-more').on('click', function(e) {
                // ck_count('按鈕-看更多');
                return window.open($this.var.$outLink);
            });
            // shares
            // $this.el.$shareLine.on('click', function() {
            //     console.log('share-line');
            //     let url = encodeURIComponent($this.var.$share.lineLink);
            //     let text = encodeURIComponent($this.var.$share.lineText);
            //     // if // link with text // else // only link
            //     if (text != '') window.open('http://line.naver.jp/R/msg/text/?' + text + "%0D%0A" + url);
            //     else window.open('http://line.naver.jp/R/msg/text/?' + url);
            // });
            // $this.el.$shareFacebook.on('click', function() {
            //     console.log('share-facebook');
            //     window.open('http://www.facebook.com/sharer.php?u=' + $this.var.$share.facebookLink);
            // });
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
            this.var.$_gameFirstTime = true;
            this.el.$score.html(0);
            this.el.$score.css('width', 0);

            // remove Tween style
            this.el.$catcher.find('.arrow').removeAttr('style');

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
        },
        createStuff: function(countdown7) { // createStuff
            // console.log('createStuff');
            let $this = this;
            if ($this.var.$_gameStop) return;
            $this.var.$_temp.stuffCount++;

            let torf = window.helper.getRandom(0, 3);
            let torfandlorr = window.helper.getRandom(0, 1);

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
            if (torf == 0) {
                position_x = window.helper.getRandom(110, 120) + 'vw';
                if (torfandlorr) {
                    position_x = window.helper.getRandom(-20, -30) + 'vw';
                }
                position_y = window.helper.getRandom(-20, -50) + 'vw';
            }
            if (countdown7) {
                _object_type = window.helper.getRandom(1, 3);
                position_x = '100vw';
                position_y = '30vw';
            }

            // create stuff, set stuff left and top
            $this.el.$stuffs.append('<div id="' + _uid + '" class="' + _class + '" data-object="' + _object_type + '"></div>');
            let _class2 = $('#' + _uid);
            _class2.css(
                {
                    'left': position_x,
                    'top': position_y,
                }
            );
            // return;

            // bind click
            _class2.on('click', function(e) {
                $this.clickStuff(e);
            });
            let rotationDegree = window.helper.getRandom(-21, 21);
            let _positionX = position_x;
            let _positionY = ($this.el.$section3.height() + Math.abs(_class2.position().top)) + "px"
            if (torf == 0) {
                _positionX = window.helper.getRandom(-110, -300) + 'vw';
                if (torfandlorr) {
                    _positionX = window.helper.getRandom(110, 300) + 'vw';
                }
                _positionY = window.helper.getRandom(170, 350) + 'vh';
            }
            if (countdown7) {
                _positionX = '-900vw';
            }
            // start falling
            if (torf == 0) {
                TweenMax.to(
                    _class2,
                    move_time,
                    {
                        ease: Power0.easeNone,
                        x: _positionX,
                        y: _positionY,
                        rotation: rotationDegree,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                            if(_class2.hasClass('_isCollision')) {
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
            } else {
                TweenMax.to(
                    _class2,
                    move_time,
                    {
                        ease: Power0.easeNone,
                        x: _positionX,
                        y: _positionY,
                        rotation: rotationDegree,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                            if(_class2.hasClass('_isCollision')) {
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
            }
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
                        if ($this.var.$_gameTimeCountdown == 7) {
                            $this.createStuff(true);
                        }
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
            if (this.var.$_gameScore >= 100) {
                // ga_pv('畫面-結果1');
                this.el.$main.attr('data-result', 1);
            } else if (this.var.$_gameScore >= 80) {
                // ga_pv('畫面-結果2');
                this.el.$main.attr('data-result', 2);
            } else if (this.var.$_gameScore >= 60) {
                // ga_pv('畫面-結果3');
                this.el.$main.attr('data-result', 3);
            } else {
                // ga_pv('畫面-結果4');
                this.el.$main.attr('data-result', 4);
            }

            this.doChangeSection(4);
            // ga_pv('結果頁');
        },

        // detect collision
        showOverlap: function(event, ui) {
            $(".overlap").remove();
            // var overlap = this.el.$catcher.collision( ".obstacle", { as: "<div/>" } );
            let $this = this;
            // overlap.addClass("overlap").appendTo("body");
            let breakable = $this.el.$catcher.find('.catcher.real').collision( ".breakable" ); // no "as", so we get the things we collided with instead of new div's
            let realcatcher = $this.el.$stuffs.find('.stuff.breakable').collision( ".catcher.real" ); // no "as", so we get the things we collided with instead of new div's
            breakable.remove();
            if (breakable.length > 0) { // 確定有碰撞
                breakable.addClass('_isCollision');
                $this.createStuff();

                $this.var.$_temp.pointCount++;
                let _stuff = breakable[0];
                let _type = _stuff.dataset.object;
                let _class = 'point';
                let _uid = 'point-' + $this.var.$_temp.pointCount;
                let _point_target = $this.el.$stuffs; // show point position
                let _talk_target = $this.el.$bggirl;
                let _yn = '';
                // 判斷分數間隔
                if (_type == '1' || _type == '2' || _type == '3') { //_type == '1' || _type == '2' || _type == '3' || _type == '4'
                    $this.scoreCount(1);
                    _yn = 'y';
                    // _class += ' _y';
                    // $this.el.$body.attr('data-point', 'y');
                } else {
                    $this.scoreCount(0);
                    _yn = 'n';
                    // _class += ' _n';
                    // $this.el.$body.attr('data-point', 'n');
                };
                _class += ' _' + _yn;

                // catcher remove
                let _realcatcher = realcatcher;
                let _offset = [_realcatcher.offset().top - 64/2, _realcatcher.offset().left - 67/2];
                _point_target.append('<div id="' + _uid + '_point" class="' + _class + '" style="top:' + _offset[0] + 'px;left:' + _offset[1] + 'px;"></div>');
                _talk_target.append('<div id="' + _uid + '_talk" class="' + _class + ' _talk"></div>');
                TweenMax.to(
                    $('#' + _uid + '_point'),
                    1.35,
                    {
                        ease: Power0.easeNone,
                        opacity: .1,
                        y: -50,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                        }
                    },
                );
                TweenMax.to(
                    $('#' + _uid + '_talk'),
                    1.78,
                    {
                        ease: Power0.easeNone,
                        opacity: .1,
                        onCompleteParams:["{self}"],
                        onComplete: (e) => {
                            $(e.target).remove();
                        }
                    },
                );
                _realcatcher.remove();
            }
        },


        scoreCount: function(num) { // score count // 1 = 得分, 0 = 扣分
            if (this.var.$_gameStop) return;
            if (num == 1) this.var.$_gameScore += this.var.$_pointScoreY;
            else this.var.$_gameScore -= this.var.$_pointScoreN;
            if (this.var.$_gameScore < 0) this.var.$_gameScore = 0;
                /* BEGIN low process */
                if (this.var.$_gameScore < 10) this.el.$score.addClass('low');
                else this.el.$score.removeClass('low');
                this.el.$score.css('width', this.var.$_gameScore + '%');
                /* END low process */
            window.helper.magicNum(this.el.$score, this.var.$_gameScore);
            console.log(this.var.$_gameScore);
            this.el.$main.attr('data-score', this.var.$_gameScore);
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