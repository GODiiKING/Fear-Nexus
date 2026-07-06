"use strict";

// ==========================================
// PLAYER ANIMATION ARRAYS & VARIABLES
// ==========================================
let playerMovementAnimation = [];
for (let i = 0; i < 20; i++) {
    playerMovementAnimation.push(new Image());
    playerMovementAnimation[i].src = "images/player/zizius/normal/move/zizius-move_shotgun_" + i.toString() + ".png";
}

let playerShootAnimation = [];
for (let i = 0; i < 10; i++) {
    playerShootAnimation.push(new Image());
    playerShootAnimation[i].src = "images/player/zizius/normal/shoot/zizius-shoot_shotgun_" + i.toString() + ".png";
}

let playerIdleAnimation = [];
for (let i = 0; i < 20; i++) {
    playerIdleAnimation.push(new Image());
    playerIdleAnimation[i].src = "images/player/zizius/normal/idle/zizius-idle_shotgun_" + i.toString() + ".png";
}

let i = 0;
let r = 0;
let waitTime = 10;

// ==========================================
// INPUT HANDLING
// ==========================================
function handleMovementPress(event) {
    const key = event.keyCode;

    if (key === 87) {
        moveForward = true;
    } else if (key === 83) {
        moveBackwards = true;
    }

    if (key === 82 && gameOver) {
        startGame();
    }
}

function handleMovementRelease(event) {
    let key = event.keyCode;

    if (key === 87) {
        moveForward = false;
    } else if (key === 83) {
        moveBackwards = false;
    }
}

function Shoot(event) {
    if (event.button === 0 && canShoot && !gameOver) {
        shootAnimationOver = false;
        bulletActive = true;
        bulletAngle = player.angle;

        bullets.forEach(bullet => {
            bullet.x = 640;
            bullet.y = 360;
            bullet.angle = player.angle;
        });

        canShoot = false;
    }
}

// ==========================================
// PLAYER ANIMATION CONTROLLERS
// ==========================================
function playerMovementAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerMovementAnimation[i % playerMovementAnimation.length].src;
        i = (i + 1) % playerMovementAnimation.length;
        waitTime = 10;
    } else {
        waitTime--;
    }
}

function playerShootAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerShootAnimation[i % playerShootAnimation.length].src;
        i = (i + 1) % playerShootAnimation.length;
        waitTime = 20;

        if (playerSprite === playerShootAnimation[2].src) {
            shootAnimationOver = true;
            console.log("done");
        }
    } else {
        waitTime--;
    }
}

function playerIdleAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerIdleAnimation[i % playerIdleAnimation.length].src;
        i = (i + 1) % playerIdleAnimation.length;
        waitTime = 30;
    } else {
        waitTime--;
    }
}