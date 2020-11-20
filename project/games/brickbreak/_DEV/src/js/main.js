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
        if (e.keyCode == 32) { // space
            gameStart();
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
    if (_DEFAULT.control.mouse) {
        document.addEventListener("mousemove", mouseMoveHandler, false);
        document.addEventListener("click", mouseClickHandler, false);
        function mouseMoveHandler(e) {
            var $relativeX = e.clientX - canvas.offsetLeft;
            var $paddleW = (paddle.w / 2);
            if (($relativeX - $paddleW) > 0 && ($relativeX + $paddleW) < canvas.width) {
                paddle.x = $relativeX - (paddle.w / 2);
                if (game.status != 'start') {
                    ball.x = (canvas.width / 2) + ($relativeX - (canvas.width / 2));
                }
            }
        }
        function mouseClickHandler(e) {
            gameStart();
        }
    }

    // collision brick
    function collisionDetection() {
        for (c = 0; c < brick.columnCount; c++) {
            for (r = 0; r < brick.rowCount; r++) {
                var b = bricks[c][r];
                if (b.status == 1) { // 撞到磚
                    if (ball.x > b.x
                        && ball.x < b.x + brick.w + ball.radius
                        && ball.y > b.y
                        && ball.y < b.y + brick.h + ball.radius) {
                        callMsg();
                        playSounds('break');
                        brick.count--;
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 3;
                        if (brick.count == 0) {
                            gameOver('w');
                        }
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
                    ctx.fillStyle = brick.color;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    function drawTimer() {
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
    function drawScore() {
        ctx.font = _DEFAULT.score.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = _DEFAULT.score.color;
        ctx.fillText("Score: " + score, 30, 15);
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
        if (game.status == 'start') drawTimer();
        if (_DEFAULT.score.enable) drawScore();
        drawBricks();
        drawPaddle();
        drawBall();
        if (_DEFAULT.lives.enable) drawLives();
        collisionDetection();

        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) { // wall collision
            playSounds('wall');
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            playSounds('wall');
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius - paddle.h) {
            if (ball.x > (paddle.x - 10) && ball.x < (paddle.x + paddle.w + 10)) { // paddle collision
                callMsg();
                playSounds('paddle');
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

        if (!game.isPaused) requestAnimationFrame(draw);
    }

    // gameReset
    function gameReset() {
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
            buildBricks();
        }
        return;
    }

    // gameStart
    function gameStart() {
        if (game.status != 'start' && game.status != 'over') {
            playSounds('paddle');
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
    function gameOver(cmd) {
        playSounds('end', true);
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
    function gameStatus(status) {
        game.status = status;
        document.body.setAttribute("data-status", status);
    }

    // gameLevel
    function gameLevel(lv) {
        var lvCurrent = document.body.getAttribute("data-lv");
        document.getElementById("level").innerHTML = _DEFAULT.level.mapping[_DEFAULT.level.point];
        document.body.setAttribute("data-lv", _DEFAULT.level.point);
        playSounds('lv' + lv);
        if (lv != lvCurrent) {
            playSounds('lv' + lv, true);
            if (lv == '0') {
                brick.columnCount = 3;
            }
            if (lv == '1') {
                brick.columnCount = 5;
            }
            brick.count = brick.rowCount * brick.columnCount;
            brick.w = ((canvas.width - ((brick.offsetTop + brick.offsetLeft) + ((brick.padding) * (brick.columnCount - 1)))) / brick.columnCount);
            buildBricks();
        }
    }

    // gameReady
    function gameReady() {
        buildBricks();
        draw();
        gameStatus('ready');
        gameLevel(1);
    }

    // callMsg
    function callMsg(msg) {
        var $msg = msg || _DEFAULT.msgs[Math.floor(Math.random() * _DEFAULT.msgs.length)];
        _DEFAULT.msgbox.innerHTML = $msg;
    }

    gameReady();
// })();