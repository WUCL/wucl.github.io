const _DEFAULT = { // default
    control: {
        mouse: false,
    },
    lives: {
        enable: false,
        point: 2,
        font: "16px Oswald",
        color: "rgba(0, 0, 0, .78)"
    },
    timer: {
        point: 0,
        font: "240px Oswald",
        color: "rgba(0, 0, 0, .35)",
        second: {
            point: 0,
            font: "30px Oswald",
        }
    },
    score: {
        enable: false,
        point: 0,
        font: "16px Oswald",
        color: "rgba(0, 0, 0, .78)"
    },
    paddle: {
        move: 10,
        h: 10,
    },
    ball: {
        dx: 10,
        dy: -10,
        plus: .5,
        color: "#FF0000"
    },
    brick: {
        rowCount: 3,
        columnCount: 5,
        h: 25,
        padding: 7,
        color: "rgba(0, 0, 0, .78)",
    },
    msgbox: document.getElementById('msgbox'),
    msgs: [
    "真假", "欸真假啦！", "水喔！", "水", "水水水！",
    "是不是！", "有點東西","好像有點東西", "是不是有點東西！！！！",
    "不錯！", "不錯喔！", "欸！不錯", "欸！不錯喔", "喔喔喔喔！",
    "可以可以", "可以欸", "很可以", "有！你有", "有點厲害",
    "繼續", "繼續繼續", "欸欸欸欸欸！繼續", "哇賽", "哇say",
    ],
    sounds: {
        lv0: ['lv01', 'lv02'],
        lv1: ['lv1'],
        lv2: ['lv21', 'lv22'],
        break: ['break'],
        paddle: ['paddle'],
        wall: ['wall']
    },
    btn: {
        soundmute: document.getElementById('btn-soundmute'),
        lv: [document.getElementById('btn-lv-minus'), document.getElementById('btn-lv-plus'),]
    },
    level: {
        point: 1,
        mapping: ["菜逼巴", "正常人", "來自地獄"]
    }
}
// ========================================
// Define
// ========================================
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = document.getElementById("game").offsetWidth;
ctx.canvas.height = document.getElementById("game").offsetHeight;
var $app = new Vue({
    el: "#app",
    data: {
        el: {
            $body: document.body,
        },
        game: {
            status: 'ready',
            isPaused: false
        },
        score: _DEFAULT.score.point,
        lives: _DEFAULT.lives.point,
        timer: [_DEFAULT.timer.point, _DEFAULT.timer.second.point],
        timerSetInterval: '',
        soundBg: '',

        ////////////////////
        ////////////////////

        pressed: new function () {
            this.right = false;
            this.left = false;
        },

        ////////////////////
        ////////////////////

        paddle: new function () {
            this.w = canvas.width / 4;
            this.h = _DEFAULT.paddle.h;
            this.x = (canvas.width - this.w) / 2;
            this.y = canvas.height - this.h;
        },
        ball: new function (e) {
            this.radius = 10; // 球半徑
            this.dx = _DEFAULT.ball.dx; // Number((Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 X
            this.dy = _DEFAULT.ball.dy; // Number(-(Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 Y
            this.x = canvas.width / 2; // 球位置 X
            this.y = canvas.height - _DEFAULT.paddle.h - this.radius; // 球位置 Y
            this.plus = _DEFAULT.ball.plus;
            this.color = _DEFAULT.ball.color;
        },
        bricks: [],
        brick: new function () {
            this.rowCount = _DEFAULT.brick.rowCount;
            this.columnCount = _DEFAULT.brick.columnCount;
            this.count = this.rowCount * this.columnCount;
            this.padding = _DEFAULT.brick.padding;
            this.offsetTop = 30;
            this.offsetLeft = 30;
            this.w = ((canvas.width - ((this.offsetTop + this.offsetLeft) + ((this.padding) * (this.columnCount - 1)))) / this.columnCount);
            this.h = _DEFAULT.brick.h;
            this.color = _DEFAULT.brick.color;
        },
    },
    mounted: function() {
        console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        // this.el.$body.classList.add(deviceObj.name);

        ctx.canvas.width  = document.getElementById("game").offsetWidth;
        ctx.canvas.height = document.getElementById("game").offsetHeight;
        this.gameReady();
    },
    watch: {
        // exps: function (val) {
        //     // this.$nextTick(() => {
        //     Vue.nextTick(() => {
        //         this.status.loading.exp = false;
        //     });
        // },
        // skills: function (val) {
        //     // this.$nextTick(() => {
        //     Vue.nextTick(() => {
        //         this.status.loading.skill = false;
        //     });
        // },
    },
    created: function () {
    },
    methods: {
        buildBricks() {
            var brick = this.brick;
            var bricks = this.bricks;
            for (c = 0; c < brick.columnCount; c++) { // column
                bricks[c] = [];
                for (r = 0; r < brick.rowCount; r++) { // row
                    bricks[c][r] = { x: 0, y: 0, status: 1 };
                }
            }
        }
        ,toggleMute() {
            var $mute = e.target.getAttribute('data-mute');
            if ($mute == 0) e.target.setAttribute('data-mute', 1);
            else e.target.setAttribute('data-mute', 0);
            buzz.all().toggleMute();
        }
        ,lvMinus() {
            if (_DEFAULT.level.point > 0) _DEFAULT.level.point--;
            gameLevel(_DEFAULT.level.point);
        }
        ,lvPlus() {
            if (_DEFAULT.level.point < 2) _DEFAULT.level.point++;
            gameLevel(_DEFAULT.level.point);
        }

        ////////////////////
        ////////////////////

        // draw
        ,drawBall() {
            var ball = this.ball;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
        }
        ,drawPaddle() {
            ctx.beginPath();
            ctx.rect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }
        ,drawBricks() {
            var brick = this.brick;
            var bricks = this.bricks;
            for (c = 0; c < brick.columnCount; c++) {
                for (r = 0; r < brick.rowCount; r++) {
                    if (bricks[c][r].status == 1) {
                        var brickX = (c*(brick.w + brick.padding)) + brick.offsetLeft;
                        var brickY = (r*(brick.h + brick.padding)) + brick.offsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brick.w, brick.h);
                        ctx.fillStyle = brick.color;
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }
        ,drawTimer() {
            ctx.font = _DEFAULT.timer.font;
            ctx.textBaseline = "middle";
            ctx.textAlign = "right";
            ctx.fillStyle = _DEFAULT.timer.color;
            if (`${timer[0]}`.length == 2) ctx.fillText(timer[0], (canvas.width / 2) + 105, (canvas.height / 2) + 40);
            else ctx.fillText(timer[0], (canvas.width / 2) + 60, (canvas.height / 2) + 40);
            // second
            ctx.font = _DEFAULT.timer.second.font;
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            ctx.fillStyle = _DEFAULT.timer.color;
            if (`${timer[0]}`.length == 2) ctx.fillText("." + timer[1], (canvas.width / 2) + 105, (canvas.height / 2) + 49 + 40);
            else ctx.fillText("." + timer[1], (canvas.width / 2) + 60, (canvas.height / 2) + 49 + 40);
        }
        ,drawScore() {
            ctx.font = _DEFAULT.score.font;
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillStyle = _DEFAULT.score.color;
            ctx.fillText("Score: " + score, 30, 15);
        }
        ,drawLives() {
            ctx.font = _DEFAULT.lives.font;
            // ctx.textBaseline = "left";
            // ctx.textAlign = "top";
            ctx.fillStyle = _DEFAULT.lives.color;
            ctx.fillText("Lives: " + lives, 30, 15);
        }
        ,draw() {
            var ball = this.ball;
            var paddle = this.paddle;
            var game = this.game;
            var pressed = this.pressed;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // 每次清除畫板重新繪製
            if (game.status == 'start') this.drawTimer();
            if (_DEFAULT.score.enable) this.drawScore();
            this.drawBricks();
            this.drawPaddle();
            this.drawBall();
            if (_DEFAULT.lives.enable) this.drawLives();
            this.collisionDetection();

            if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) { // wall collision
                this.playSounds('wall');
                ball.dx = -ball.dx;
            }
            if (ball.y + ball.dy < ball.radius) {
                this.playSounds('wall');
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > canvas.height - ball.radius - paddle.h) {
                if (ball.x > (paddle.x - 10) && ball.x < (paddle.x + paddle.w + 10)) { // paddle collision
                    callMsg();
                    this.playSounds('paddle');
                    // ball.color = getRandomColor();
                    ball.dy = -ball.dy;
                    ball.dx += ball.plus;
                    ball.dy -= ball.plus;
                } else {
                    if (_DEFAULT.lives.enable) {
                        lives--;
                        if (!lives) {
                            gameOver('l');
                            // document.location.reload();
                        } else {
                            console.log("GAME again");
                            gameStatus('again');
                        }
                    } else {
                        gameOver('l');
                        return;
                    }
                    gameReset();
                }
            }

            // paddle move
            if (game.status != 'over') {
                if (pressed.right && paddle.x < canvas.width - paddle.w) {
                    paddle.x += _DEFAULT.paddle.move;
                    if (game.status != 'start') {
                        ball.x += _DEFAULT.paddle.move;
                    }
                } else if (pressed.left && paddle.x > 0) {
                    paddle.x -= _DEFAULT.paddle.move;
                    if (game.status != 'start') {
                        ball.x -= _DEFAULT.paddle.move;
                    }
                }
            }

            if (game.status == 'start') {
                ball.x += ball.dx;
                ball.y += ball.dy;
            }

            if (!game.isPaused) requestAnimationFrame(this.draw);
        }

        ////////////////////
        ////////////////////

        // gameReset
        ,gameReset() {
            var ball = this.ball;
            var paddle = this.paddle;
            var brick = this.brick;
            var game = this.game;
            var score = this.score;

            // reset ball
            ball.x = canvas.width / 2;
            ball.y = canvas.height - paddle.h - ball.radius;
            ball.dx = _DEFAULT.ball.dx;
            ball.dy = _DEFAULT.ball.dy;
            ball.color = _DEFAULT.ball.color;

            // reset paddle
            paddle.x = (canvas.width - paddle.w) / 2;
            paddle.y = canvas.height - paddle.h;

            if (game.status == 'over') {
                // reset score
                score = _DEFAULT.score.point;

                // reset bricks
                brick.count = brick.rowCount * brick.columnCount;
                this.buildBricks();
            }
            return;
        }

        // gameStart
        ,gameStart() {
            if (game.status != 'start' && game.status != 'over') {
                this.playSounds('paddle');
                gameStatus('start');
                callMsg("來喔！開始！");
                timerSetInterval = setInterval(() => {
                    timer[1]++;
                    if (timer[1] == 100) {
                        timer[0]++;
                        timer[1] = 0;
                    }
                }, 10);
            }
            return;
        }

        // gameOver
        ,gameOver(cmd) {
            this.playSounds('end', true);
            document.body.setAttribute("data-wl", cmd);
            setTimeout(() => { game.isPaused = true; }, 100)
            gameStatus('over');
            clearInterval(timerSetInterval);

            var $msg = '';
            if (cmd == 'w') {
                console.log("YOU WIN, CONGRATS!");
                $msg = "給你拍手你贏了！"; // 水喔！你厲害";
            }
            if (cmd == 'l') {
                console.log("GAME OVER! ");
                $msg = "居居哭哭輸了Sorry"; // ";
            }
            _DEFAULT.msgbox.innerHTML = $msg;
            return;
        }

        // gameStatus
        ,gameStatus(status) {
            game.status = status;
            document.body.setAttribute("data-status", status);
        }

        // gameLevel
        ,gameLevel(lv) {
            var brick = this.brick;
            var lvCurrent = document.body.getAttribute("data-lv");
            document.getElementById("level").innerHTML = _DEFAULT.level.mapping[_DEFAULT.level.point];
            document.body.setAttribute("data-lv", _DEFAULT.level.point);
            this.playSounds('lv' + lv);
            if (lv != lvCurrent) {
                this.playSounds('lv' + lv, true);
                if (lv == '0') {
                    brick.rowCount = 3;
                    brick.columnCount = 3;
                    brick.count = brick.rowCount * brick.columnCount;
                    brick.w = brick.w;
                }
                this.buildBricks();
            }
        }

        // gameReady
        ,gameReady() {
            console.log(123);
            this.buildBricks();
            this.draw();
            this.gameStatus('ready');
            this.gameLevel(1);
        }

        // callMsg
        ,callMsg(msg) {
            var $msg = msg || _DEFAULT.msgs[Math.floor(Math.random() * _DEFAULT.msgs.length)];
            _DEFAULT.msgbox.innerHTML = $msg;
        }

        // collision brick
        ,collisionDetection() {
            var ball = this.ball;
            var brick = this.brick;
            var bricks = this.bricks;

            for (c = 0; c < brick.columnCount; c++) {
                for (r = 0; r < brick.rowCount; r++) {
                    var b = bricks[c][r];
                    if (b.status == 1) { // 撞到磚
                        if (ball.x > b.x
                            && ball.x < b.x + brick.w + ball.radius
                            && ball.y > b.y
                            && ball.y < b.y + brick.h + ball.radius) {
                            callMsg();
                            this.playSounds('break');
                            brick.count--;
                            ball.dy = -ball.dy;
                            b.status = 0;
                            score += 3;
                            if (brick.count == 0) {
                                this.gameOver('w');
                            }
                        }
                    }
                }
            }
        }

        ////////////////////
        ////////////////////

        // helper
        ,getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        ,playSounds(sound, isBg) {
            var soundBg = this.soundBg;
            var $path = 'public/sounds/';
            var $sound = _DEFAULT.sounds[sound];
            var $isBg = isBg || false;
            if ($isBg) {
                $path += 'bg-' + sound + '.mp3';
                if (soundBg) soundBg.stop();
                soundBg = (new buzz.sound($path)).play().loop().setVolume(0).fadeTo(15, 1000);
            } else {
                var $rand = Math.floor((Math.random() * $sound.length));
                $path += $sound[$rand] + '.mp3';
                (new buzz.sound($path)).play();
            }
            // console.log($path);
        }
    }
});

// var canvas = document.getElementById("myCanvas");
// var ctx = canvas.getContext("2d");
// ctx.canvas.width  = document.getElementById("game").offsetWidth;
// ctx.canvas.height = document.getElementById("game").offsetHeight;


// var game = {
//     status: 'ready',
//     isPaused: false
// };

// // score
// var score = _DEFAULT.score.point;

// // lives
// var lives = _DEFAULT.lives.point;

// // timer
// var timer = [_DEFAULT.timer.point, _DEFAULT.timer.second.point];
// var timerSetInterval = '';

// // sounds
// var soundBg = '';

// // paddle
// var paddle = new function () {
//     this.w = canvas.width / 4;
//     this.h = 10;
//     this.x = (canvas.width - this.w) / 2;
//     this.y = canvas.height - this.h;
// };
// // ball
// var ball = new function () {
//     this.radius = 10; // 球半徑
//     this.dx = _DEFAULT.ball.dx; // Number((Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 X
//     this.dy = _DEFAULT.ball.dy; // Number(-(Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 Y
//     this.x = canvas.width / 2; // 球位置 X
//     this.y = canvas.height - paddle.h - this.radius; // 球位置 Y
//     this.plus = _DEFAULT.ball.plus;
//     this.color = _DEFAULT.ball.color;
// };
// // brick
// var bricks;
// var brick = new function () {
//     this.rowCount = _DEFAULT.brick.rowCount;
//     this.columnCount = _DEFAULT.brick.columnCount;
//     this.count = this.rowCount * this.columnCount;
//     this.padding = _DEFAULT.brick.padding;
//     this.offsetTop = 30;
//     this.offsetLeft = 30;
//     this.w = ((canvas.width - ((this.offsetTop + this.offsetLeft) + ((this.padding) * (this.columnCount - 1)))) / this.columnCount);
//     this.h = _DEFAULT.brick.h;
//     this.color = _DEFAULT.brick.color;
// };
// function buildBricks() {
//     bricks = [];
//     for (c = 0; c < brick.columnCount; c++) { // column
//         bricks[c] = [];
//         for (r = 0; r < brick.rowCount; r++) { // row
//             bricks[c][r] = { x: 0, y: 0, status: 1 };
//         }
//     }
// }


// ========================================
// Click Event
// ========================================

// _DEFAULT.btn.soundmute.addEventListener("click", (e) => {
//     var $mute = e.target.getAttribute('data-mute');
//     if ($mute == 0) e.target.setAttribute('data-mute', 1);
//     else e.target.setAttribute('data-mute', 0);
//     buzz.all().toggleMute();
// }, false);
// _DEFAULT.btn.lv[0].addEventListener("click", () => {
//     if (_DEFAULT.level.point > 0) _DEFAULT.level.point--;
//     gameLevel(_DEFAULT.level.point);
// }, false);
// _DEFAULT.btn.lv[1].addEventListener("click", () => {
//     if (_DEFAULT.level.point < 2) _DEFAULT.level.point++;
//     gameLevel(_DEFAULT.level.point);
// }, false);


// ========================================
// Helper
// ========================================
/*
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function playSounds(sound, isBg) {
    var $path = 'public/sounds/';
    var $sound = _DEFAULT.sounds[sound];
    var $isBg = isBg || false;
    if ($isBg) {
        $path += 'bg-' + sound + '.mp3';
        if (soundBg) soundBg.stop();
        soundBg = (new buzz.sound($path)).play().loop().setVolume(0).fadeTo(15, 1000);
    } else {
        var $rand = Math.floor((Math.random() * $sound.length));
        $path += $sound[$rand] + '.mp3';
        (new buzz.sound($path)).play();
    }
    // console.log($path);
}
*/