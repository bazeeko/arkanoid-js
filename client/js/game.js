const field = {
    width: 800,
    height: 1200
}

// game variables and constants
let TIME = "00:00"
let LIFE = 2;
let LEVEL = 1;
let SCORE = 0; const SCORE_UNIT = 13;
let GAME_OVER = false;
let GAME_PAUSED = false;
let GAME_STORY = false;
let BROKEN_BRICKS = 0

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50;
const BALL_RADIUS = 8;

let leftArrow = false;
let rightArrow = false;

let requestId;

// create a paddle
const paddle = {
    x: field.width / 2 - PADDLE_WIDTH / 2,
    y: field.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5
}

let ball = {
    x: field.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 8,
    dx: 4 * (Math.random() * 2 - 1)
}
ball.dy = -Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx)


function onLoad() {
    field.dom = document.getElementById('field');
    ball.dom = document.getElementById('ball');
    paddle.dom = document.getElementById('platform');
    // showGameStats();
    text(1);
    // await waitForCondition();
    document.getElementById('start').style.visibility = 'visible';
    timeSet();
    createLevel();
}


// controlling the paddle
document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37) leftArrow = true;
    else if (event.keyCode == 39) rightArrow = true;
});

document.addEventListener("keyup", function (event) {
    if (event.keyCode == 37) leftArrow = false;
    else if (event.keyCode == 39) rightArrow = false;
});


// pause the game
document.addEventListener("keydown", function (event) {
    if (event.keyCode == 32) {
        GAME_PAUSED = !GAME_PAUSED;
        document.getElementById('start').innerHTML = "Press SPACE to continue the game";
        document.getElementById('start').style.fontSize = 34 + 'px';
        if (GAME_PAUSED) document.getElementById('start').style.visibility = 'visible';
        else document.getElementById('start').style.visibility = 'hidden';
    }
});


// restart the game
document.addEventListener("keydown", function (event) {
    if (event.keyCode == 82 && (!GAME_OVER || document.getElementById('board').style.display == 'block')) {
        cancelAnimationFrame(requestId);
        location.reload();
    }
});


// moving the paddle
function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < field.width) paddle.x += paddle.dx;
    else if (leftArrow && paddle.x > 0) paddle.x -= paddle.dx;
    paddle.dom.style.left = paddle.x + 'px';
}


// move the ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    ball.dom.style.top = ball.y - ball.radius + 'px';
    ball.dom.style.left = ball.x - ball.radius + 'px';
}


// collision of the ball with the wall
function ballWallCollision() {
    if (ball.x + ball.radius > field.width || ball.x - ball.radius < 0) ball.dx = -ball.dx;
    if (ball.y - ball.radius < 0) ball.dy = -ball.dy;

    if (ball.y + ball.radius > field.height) {
        LIFE--;
        resetBall()
    }
}


// reset the ball when life is lost
function resetBall() {
    GAME_PAUSED = true;
    ball.speed = 8;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dom.style.top = ball.y - ball.radius + 'px';
    ball.dom.style.left = ball.x - ball.radius + 'px';
    ball.dx = 1 * (Math.random() * 2 - 1);
    ball.dy = -Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx);
}


// collision of the ball with the paddle
function ballPaddleCollision() {
    if (ball.y > paddle.y && ball.y < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);
        let angle = collidePoint * Math.PI / 3;
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
        // ball.dy *= -1;
        // if(leftArrow) ball.dx = ball.dx * (ball.dx > 0 ? 0.75 : 1.3);
        // if(rightArrow) ball.dx = ball.dx * (ball.dx < 0 ? 0.75 : 1.3);
    }
}


// create the bricks
const brick = {
    row: MAPS[LEVEL].length,
    column: MAPS[LEVEL][0].length,
    width: 80,
    height: 40,
    marginTop: 0
}


let bricks = [];
function createBricks() {
    for (let i = 0; i < brick.row; i++) {
        bricks[i] = [];
        for (let j = 0; j < brick.column; j++) {
            bricks[i][j] = {
                x: j * brick.width,
                y: i * brick.height + brick.marginTop,
                center: {
                    x: j * brick.width + brick.width / 2,
                    y: i * brick.height + brick.height / 2 + brick.marginTop
                },
                status: MAPS[LEVEL][i][j] != 0 ? true : false
            };
        }
    }
}

// draw the bricks
function drawBricks() {
    for (let i = 0; i < brick.row; i++) {
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < brick.column; j++) {
            bricks[i][j].dom = document.createElement('div');
            bricks[i][j].dom.className = "brick0" + MAPS[LEVEL][i][j];
            row.appendChild(bricks[i][j].dom);
            if (!bricks[i][j].status) bricks[i][j].dom.className += " hidden";
        }
        field.dom.appendChild(row);
    }
}

// check if there are bricks left
function bricksExist() {
    for (let i = 0; i < brick.row; i++) {
        for (let j = 0; j < brick.column; j++) {
            if (bricks[i][j].status) return true;
        }
    }
    return false
}


// delete bricks
function deleteBricks() {
    for (let i = 0; i < brick.row; i++) {
        document.getElementsByClassName('row')[0].remove();
    }
}


function detectCollision(b) {
    let xDist = Math.abs(ball.x - b.center.x) - b.width / 2;
    let yDist = Math.abs(ball.y - b.center.y) - b.height / 2;

    if (xDist < ball.r && yDist < ball.r) return true;
    else return false;
}

//collision of the ball with the brick
function ballBrickCollision() {
    for (let i = 0; i < brick.row; i++) {
        for (let j = 0; j < brick.column; j++) {
            let b = bricks[i][j];
            if (b.status) {
                // if (ball.x + ball.radius > b.x+2 && ball.x - ball.radius < b.x + brick.width-2 && ball.y + ball.radius > b.y+2 && ball.y - ball.radius < b.y + brick.height-2) {
                //     if (ball.x )

                //     b.status = false;
                //     ball.dy = - ball.dy;
                //     SCORE += SCORE_UNIT;
                // }
                let xDist = Math.abs(ball.x - b.center.x) - brick.width / 2;
                let yDist = Math.abs(ball.y - b.center.y) - brick.height / 2;


                if (xDist <= ball.radius && yDist <= 0 || yDist <= ball.radius && xDist <= 0 || xDist ** 2 + yDist ** 2 <= ball.radius ** 2) {
                    if (LEVEL == 1 && i == 6) {
                        document.getElementsByClassName('row')[i].getElementsByClassName('brick0' + MAPS[LEVEL][i][j])[j].className += " hidden";
                        b.status = false;
                        SCORE += LEVEL * SCORE_UNIT;
                    }

                    if (LEVEL == 2) {
                        document.getElementsByClassName('row')[i].getElementsByClassName('brick0' + MAPS[LEVEL][i][j])[j].className += " hidden";
                        b.status = false;
                        if (!bricksExist()) {
                            BROKEN_BRICKS++;
                            let randomX = Math.floor(Math.random() * 10); let randomY = Math.floor(Math.random() * 4 + 3);
                            document.getElementsByClassName('row')[randomY].getElementsByClassName('brick0' + MAPS[LEVEL][randomY][randomX])[randomX].classList.remove("hidden");
                            bricks[randomY][randomX].status = true;
                            continue;
                        }
                        SCORE += LEVEL * SCORE_UNIT;
                    }

                    if (xDist < yDist) ball.dy = -ball.dy;
                    // else if (xDist == yDist) { //should be 45 degrees, but which direction??
                    //     ball.dx = 3;
                    //     ball.dy = 3;
                    // }
                    else ball.dx = -ball.dx;
                }
            }
        }
    }
}


// timer
function timeSet() {
    timerId = setInterval(() => {
        let min = Number(TIME.slice(0, 2))
        let sec = Number(TIME.slice(3))
        if (!GAME_PAUSED) {
            sec += 1
            if (sec == 60) {
                min += 1
                sec = 0
            }
            if (sec < 10) {
                sec = '0' + sec
            }
            if (min < 10) {
                min = '0' + min
            }
            TIME = `${min}:${sec}`
        }
    }, 1000);
}


// show current score, life and level
function showGameStats() {
    document.getElementById('scoreimage').style.left = document.getElementById('field').getBoundingClientRect().left + 5 + 'px';
    document.getElementById('timerimage').style.left = document.getElementById('field').getBoundingClientRect().left - 4 + 'px';
    document.getElementById('lifeimage').style.left = document.getElementById('field').getBoundingClientRect().left + field.width - 49 + 'px';
    document.getElementById('levelimage').style.left = document.getElementById('field').getBoundingClientRect().left + field.width - 47 + 'px';

    document.getElementById('score').style.left = document.getElementById('field').getBoundingClientRect().left + 50 + 'px';
    document.getElementById('timer').style.left = document.getElementById('field').getBoundingClientRect().left + 50 + 'px';
    document.getElementById('lifes').style.left = document.getElementById('field').getBoundingClientRect().left + field.width - 75 + 'px';
    document.getElementById('level').style.left = document.getElementById('field').getBoundingClientRect().left + field.width - 75 + 'px';

    document.getElementById('controls').style.left = document.getElementById('field').getBoundingClientRect().left + field.width + 25 + 'px';
    document.getElementById('start').style.left = document.getElementById('field').getBoundingClientRect().left + 160 + 'px';
    if (LIFE >= 0) document.getElementById('lifes').innerHTML = LIFE;
    document.getElementById('level').innerHTML = LEVEL;
    document.getElementById('score').innerHTML = SCORE;
    document.getElementById('timer').innerHTML = TIME;

}


// create current level 
function createLevel() {
    brick.row = MAPS[LEVEL].length;
    brick.column = MAPS[LEVEL][0].length;
    createBricks();
    drawBricks();
    resetBall();
    loop();
}



// function waitForCondition() {
//     return new Promise(resolve => {
//         function checkFlag() {
//             if (GAME_STORY == false) resolve();
//             else setTimeout(checkFlag, 500);
//         }
//         checkFlag();
//     });
// }

// begin the story
function text(num) {
    let count = 1;
    document.getElementById('story').innerHTML = STORY[num][0];
    document.getElementById('story').style.display = 'block';
    let interval = setInterval(() => {
        if (!GAME_PAUSED) {
            if (count >= STORY[num].length) {
                document.getElementById('story').style.display = 'none';
                GAME_STORY = false;
                clearInterval(interval);
            }
            document.getElementById('story').innerHTML = STORY[num][count];
            count++
        }
    }, 8000)
}

function timeSet() {
    timerId = setInterval(() => {
        let min = Number(TIME.slice(0, 2))
        let sec = Number(TIME.slice(3))
        if (!GAME_PAUSED && !GAME_OVER) {
            sec += 1
            if (sec == 60) {
                min += 1
                sec = 0
            }
            if (sec < 10) {
                sec = '0' + sec
            }
            if (min < 10) {
                min = '0' + min
            }
            TIME = `${min}:${sec}`
        }
    }, 1000);
}





// check if the game is over
function gameOver() {
    if (LIFE < 0) {
        GAME_OVER = true;
        document.getElementById('player').style.display = 'block';
        document.getElementById('story').style.display = 'none'
        document.getElementById('gameovertext').innerHTML = 'Вы не смогли защитить свою планету и народ, и они были уничтожены.';
    }
}

// update the screen each iteration
function update() {
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
}
;
// main function with req aniframe
function loop() {
    showGameStats()
    // if (!bricksExist()) {
    //     cancelAnimationFrame(requestId);
    //     deleteBricks();
    //     if (GAME_OVER) {
    //         document.getElementById('player').style.display = 'block';
    //         return
    //     }
    //     LEVEL++;
    //     document.getElementById("level").innerHTML = LEVEL;
    //     createLevel();
    // }
    if (LEVEL == 1 && TIME == '01:20') {
        cancelAnimationFrame(requestId);
        deleteBricks();
        if (GAME_OVER) {
            document.getElementById('player').style.display = 'block';
            return
        }
        LEVEL++;
        document.getElementById("level").innerHTML = LEVEL;
        text(2);
        createLevel();
        return
    }
    if (BROKEN_BRICKS >= 5) {
        document.getElementById('gameovertext').innerHTML = 'Убивая всё больше и больше врагов, жажда мести Шмөнни превратилась в жажду крови. Хоть и битва уже давно была закончена, для него она всё ещё продолжалась. Он видел врагов везде, куда бы ни пошёл. Он пережил ту битву тысячи раз в своих мыслях и, в конце концов, потерял грань между реальностью и своим воображением. Своих близких его разум уже начал воспринимать за врагов. И так, в итоге, Шмөнни перебил всю свою нацию. Конец.';
        document.getElementById('player').style.display = 'block';
        cancelAnimationFrame(requestId);
        return
    }
    if (!GAME_PAUSED) update();
    if (!GAME_OVER) requestId = requestAnimationFrame(loop);
}
