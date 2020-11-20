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
    },
    ball: {
        dx: 10,
        dy: -10,
        plus: .5,
        color: "#FF0000"
    },
    brick: {
        rowCount: 3,
        columnCount: 4,
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
    "do it!", "just do it!"
    ],
    sounds: {
        bg: '',
        lv1: ['lv11', 'lv12'],
        lv2: ['lv2'],
        lv3: ['lv31', 'lv32'],
        break: ['break'],
        paddle: ['paddle'],
        wall: ['wall']
    },
    btn: {
        soundmute: document.getElementById('btn-soundmute'),
    }
}
// ========================================
// Define
// ========================================
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = document.getElementById("game").offsetWidth;
ctx.canvas.height = document.getElementById("game").offsetHeight;

var game = {
    status: 'ready',
    isPaused: false
};

// score
var score = _DEFAULT.score.point;

// lives
var lives = _DEFAULT.lives.point;

// timer
var timer = [_DEFAULT.timer.point, _DEFAULT.timer.second.point];
var timerSetInterval = '';

// paddle
var paddle = new function () {
    this.w = canvas.width / 4;
    this.h = 10;
    this.x = (canvas.width - this.w) / 2;
    this.y = canvas.height - this.h;
};
// ball
var ball = new function () {
    this.radius = 10; // 球半徑
    this.dx = _DEFAULT.ball.dx; // Number((Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 X
    this.dy = _DEFAULT.ball.dy; // Number(-(Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 Y
    this.x = canvas.width / 2; // 球位置 X
    this.y = canvas.height - paddle.h - this.radius; // 球位置 Y
    this.plus = _DEFAULT.ball.plus;
    this.color = _DEFAULT.ball.color;
};
// brick
var bricks;
var brick = new function () {
    this.rowCount = _DEFAULT.brick.rowCount;
    this.columnCount = _DEFAULT.brick.columnCount;
    this.count = _DEFAULT.brick.rowCount * _DEFAULT.brick.columnCount;
    this.padding = _DEFAULT.brick.padding;
    this.offsetTop = 30;
    this.offsetLeft = 30;
    // this.w = 75;
    this.w = ((canvas.width - ((this.offsetTop + this.offsetLeft) + ((this.padding) * (this.columnCount - 1)))) / this.columnCount);
    this.h = _DEFAULT.brick.h;
    this.color = _DEFAULT.brick.color;
};
function buildBricks() {
    bricks = [];
    for (c = 0; c < brick.columnCount; c++) { // column
        bricks[c] = [];
        for (r = 0; r < brick.rowCount; r++) { // row
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
buildBricks();


// ========================================
// Click Event
// ========================================

_DEFAULT.btn.soundmute.addEventListener("click", (e) => {
    var $mute = e.target.getAttribute('data-mute');
    if ($mute == 0) {
        e.target.setAttribute('data-mute', 1);
        buzz.all().mute();
    } else {
        e.target.setAttribute('data-mute', 0);
        buzz.all().unmute();
    }
}, false);


// ========================================
// Helper
// ========================================
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function playSounds(sound, isBg) {
    var $path = './public/sounds/';
    var $sound = _DEFAULT.sounds[sound];
    var $isBg = isBg || false;
    if ($isBg) {
        $path += 'bg-' + sound + '.mp3';
        _DEFAULT.sounds.bg = (new buzz.sound($path)).play().loop().setVolume(0).fadeTo(30, 1000);
    } else {
        var $rand = Math.floor((Math.random() * $sound.length));
        $path += $sound[$rand] + '.mp3';
        (new buzz.sound($path)).play();
    }
    // console.log($path);
}
playSounds('lv1');