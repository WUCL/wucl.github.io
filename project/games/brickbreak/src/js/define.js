const _DEFAULT = { // default
    lives: {
        point: 2,
        font: "16px Oswald",
        color: "rgba(0, 0, 0, .78)"
    },
    score: {
        point: 0,
        font: "240px Oswald",
        color: "rgba(0, 0, 0, .35)"
    },
    ball: {
        color: "#FF0000"
    },
    brick: {
        rowCount: 7,
        columnCount: 7,
    }
}
// ========================================
// Define
// ========================================
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var game = {
    status: 'ready',
};

// score
var score = _DEFAULT.score.point;

// lives
var lives = _DEFAULT.lives.point;

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
    this.dx = Number((Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 X
    this.dy = Number(-(Math.random() * 2 + 1.5).toFixed(1)); // 每次移動減多少 Y
    this.x = canvas.width / 2; // 球位置 X
    this.y = canvas.height - paddle.h - this.radius; // 球位置 Y
    this.plus = .5;
    this.color = _DEFAULT.ball.color;
};
// brick
var bricks;
var brick = new function () {
    this.rowCount = _DEFAULT.brick.rowCount;
    this.columnCount = _DEFAULT.brick.columnCount;
    this.count = _DEFAULT.brick.rowCount * _DEFAULT.brick.columnCount;
    this.padding = 7;
    this.offsetTop = 30;
    this.offsetLeft = 30;
    // this.w = 75;
    this.w = ((canvas.width - ((this.offsetTop + this.offsetLeft) + ((this.padding) * (this.columnCount - 1)))) / this.columnCount);
    this.h = 20;
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