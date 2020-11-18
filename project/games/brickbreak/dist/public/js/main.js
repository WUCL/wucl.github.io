// (function() {
    // "use strict";
    // ========================================
    // Process
    // ========================================
    // key handler
    var pressed = new function () {
        this.right = false;
        this.left = false;
    };
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    function keyDownHandler(e) {
        // if(e.key == "Right" || e.key == "ArrowRight") {
        // if(e.key == "Left" || e.key == "ArrowLeft") {
        if (e.keyCode == 39) { // right
            pressed.right = true;
        } else if (e.keyCode == 37) { // left
            pressed.left = true;
        }
    }
    function keyUpHandler(e) {
        if (e.keyCode == 39) { // right
            pressed.right = false;
        } else if (e.keyCode == 37) { // left
            pressed.left = false;
        }
    }

    // mouse handler
    document.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("click", mouseClickHandler, false);
    function mouseMoveHandler(e) {
        var $relativeX = e.clientX - canvas.offsetLeft;
        var $paddleW = (paddle.w / 2);
        if (($relativeX - $paddleW) > 0 && ($relativeX + $paddleW) < canvas.width) {
            paddle.x = $relativeX - (paddle.w / 2);
            if (game.status == 'ready' || game.status == 'again') {
                ball.x = (canvas.width / 2) + ($relativeX - (canvas.width / 2));
            }
        }
    }
    function mouseClickHandler(e) {
        console.log(e);
        game.status = 'start';
    }

    // collision brick
    function collisionDetection() {
        for (c = 0; c < brick.columnCount; c++) {
            for (r = 0; r < brick.rowCount; r++) {
                var b = bricks[c][r];
                if (b.status == 1) {
                    if (ball.x > b.x
                        && ball.x < b.x + brick.w + ball.radius
                        && ball.y > b.y
                        && ball.y < b.y + brick.h + ball.radius) {
                        brick.count--;
                        // console.log(brick.count);
                        // ball.color = getRandomColor();
                        ball.dy = -ball.dy;
                        b.status = 0;
                        // if (score == 0) score++;
                        // else score *= 2;
                        score += 3;
                    }
                }
            }
        }
    }

    // draw
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }
    function drawBricks() {
        for (c = 0; c < brick.columnCount; c++) {
            for (r = 0; r < brick.rowCount; r++) {
                if (bricks[c][r].status == 1) {
                    var brickX = (c*(brick.w + brick.padding)) + brick.offsetLeft;
                    var brickY = (r*(brick.h + brick.padding)) + brick.offsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brick.w, brick.h);
                    ctx.fillStyle = "#000000";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    function drawScore() {
        ctx.font = _DEFAULT.score.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = _DEFAULT.score.color;
        ctx.fillText(score, canvas.width / 2, canvas.height / 2);
    }
    function drawLives() {
        ctx.font = _DEFAULT.lives.font;
        // ctx.textBaseline = "left";
        // ctx.textAlign = "top";
        ctx.fillStyle = _DEFAULT.lives.color;
        ctx.fillText("Lives: " + lives, 30, 15);
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 每次清除畫板重新繪製
        drawScore();
        drawBricks();
        drawPaddle();
        drawBall();
        drawLives();
        collisionDetection();

        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius - paddle.h) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) { // paddle collision
                ball.color = getRandomColor();
                ball.dy = -ball.dy;
                ball.dx += ball.plus;
                ball.dy -= ball.plus;
            } else {
                lives--;
                if (!lives) {
                    console.log("GAME OVER");
                    game.status = 'over';
                    // document.location.reload();
                    reset();
                } else {
                    console.log("GAME again");
                    game.status = 'again';
                    // ball.x = canvas.width / 2;
                    // ball.y = canvas.height - paddle.h - ball.radius;
                    // ball.dx = Number((Math.random() * 2 + 1.5).toFixed(1));
                    // ball.dy = Number(-(Math.random() * 2 + 1.5).toFixed(1));
                    // paddle.x = (canvas.width - ball.w) / 2;
                    // paddle.y = canvas.height - paddle.h;
                }
            }
        }

        if (pressed.right && paddle.x < canvas.width - paddle.w) {
            paddle.x += 7;
        } else if (pressed.left && paddle.x > 0) {
            paddle.x -= 7;
        }

        if (game.status == 'start') {
            ball.x += ball.dx;
            ball.y += ball.dy;
        }

        requestAnimationFrame(draw);
    }

    // reset
    function reset() {
        // reset score
        score = _DEFAULT.score.point;

        // reset ball
        ball.x = canvas.width / 2;
        ball.y = canvas.height - paddle.h - ball.radius;
        ball.dx = Number((Math.random() * 2 + 1.5).toFixed(1));
        ball.dy = Number(-(Math.random() * 2 + 1.5).toFixed(1));
        ball.color = _DEFAULT.ball.color;

        // reset paddle
        paddle.x = (canvas.width - paddle.w) / 2;
        paddle.y = canvas.height - paddle.h;

        // reset bricks
        brick.count = brick.rowCount * brick.columnCount;
        buildBricks();
    }

    // setInterval(draw, 10);
    draw();

// })();