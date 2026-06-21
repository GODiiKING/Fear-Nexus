"use strict";

// ==========================================
// INITIALIZATION
// ==========================================

function startGame() {

    GameArea.start();

    player = new Component(
        313 * imagesScale,
        207 * imagesScale,
        playerSprite,
        640 - (313 * imagesScale) / 2,
        360 - (202 * imagesScale) / 2,
        "player",
        0
    );

    grass1 = new Component(1280, 720, "images/background/bg3.png", -1280, 720, "grass");
    grass2 = new Component(1280, 720, "images/background/bg3.png", 0, 720, "grass");
    grass3 = new Component(1280, 720, "images/background/bg3.png", 1280, 720, "grass");
    grass4 = new Component(1280, 720, "images/background/bg3.png", -1280, 0, "grass");
    grass5 = new Component(1280, 720, "images/background/bg2.png", 0, 0, "grass");
    grass6 = new Component(1280, 720, "images/background/bg3.png", 1280, 0, "grass");
    grass7 = new Component(1280, 720, "images/background/bg3.png", -1280, -720, "grass");
    grass8 = new Component(1280, 720, "images/background/bg1.png", 0, -720, "grass");
    grass9 = new Component(1280, 720, "images/background/bg3.png", 1280, -720, "grass");

    bullet1 = new Component(100, 2, "images/bullet/bullet1.png", -10, -2, "image");
    bullet2 = new Component(100, 2, "images/bullet/bullet2.png", -10, -2, "image");
    bullet3 = new Component(100, 2, "images/bullet/bullet1.png", -10, -2, "image");

    crosshair = new Component(
        40,
        40,
        "images/crosshair/crosshair.png",
        640,
        360,
        "image"
    );

    restartScreen = new Component(
        1280,
        720,
        "images/gameover/gameoverbg.png",
        0,
        0,
        "image"
    );

    bullets = [bullet1, bullet2, bullet3];

    grassArray = [
        grass1,
        grass2,
        grass3,
        grass4,
        grass5,
        grass6,
        grass7,
        grass8,
        grass9
    ];

    enemies = [];

    spawnEnemiesInterval = setInterval(
        spawnEnemy,
        getRandomInterval()
    );

    score = 0;
    gameOver = false;

    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    window.addEventListener("mousedown", Shoot);

}


// ==========================================
// GAME AREA
// ==========================================

let GameArea = {

    canvas: document.createElement("canvas"),

    start: function () {

        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.context = this.canvas.getContext("2d");

        clearInterval(GameArea.interval);

        this.interval = setInterval(updateGameArea, 20);

        this.canvas.id = "Game-Window";

        document.body.insertBefore(
            this.canvas,
            document.body.childNodes[0]
        );

        let h1Element = document.querySelector("h1.Game-Title");

        h1Element.insertAdjacentElement(
            "afterend",
            this.canvas
        );
    },

    clear: function () {

        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

};


// ==========================================
// MAIN LOOP
// ==========================================

function updateGameArea() {

    GameArea.clear();

    let ctx = GameArea.context;

    ctx.fillText(score.toString(), 640, 60);

    onmousemove = function (e) {

        let rect = GameArea.canvas.getBoundingClientRect();

        angle = Math.atan2(
            e.clientY - rect.top - player.y - 150 / 2,
            e.clientX - rect.left - player.x - 256 / 2
        );

        player.angle = angle;

        crosshair.x = e.clientX - rect.left - 20;
        crosshair.y = e.clientY - rect.top - 17;

    };

    updateBullets();

    checkBulletCollisions();

    checkEnemyPlayerCollisions();

    moveEnemies();

    grassArray.forEach(grass => grass.update());

    player.update();

    bullets.forEach(bullet => bullet.update());

    crosshair.update();

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    if (gameOver) {

        restartScreen.update();

        ctx.fillText(
            "High Score: " + highscore.toString(),
            640,
            650
        );

    }

}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameOver = true;

    if (highscore < score) {
        highscore = score;
    }

}