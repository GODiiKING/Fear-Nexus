"use strict";

// ==========================================
// ENEMY STATE & VARIABLES
// ==========================================
let enemies = [];
let enemiesWaitTime = [];
let enemiesAnimationPosition = [];
let enemiesPlayerCollision = [];
let spawnEnemiesInterval;

let enemySprite = "images/tds_zombie-Copy/export/Movement/skeleton-move_0.png";

let difficulty = 0.25;
let maxTime = 5000;
let minTime = 100;

// ==========================================
// ENEMY ANIMATION ASSETS
// ==========================================
let enemyMovementAnimation = [];
for (let i = 0; i < 16; i++) {
    enemyMovementAnimation.push(new Image());
    enemyMovementAnimation[i].src = "images/tds_zombie-Copy/export/Movement/skeleton-move_" + i.toString() + ".png";
}

let enemyAttackAnimation = [];
for (let i = 0; i < 8; i++) {
    enemyAttackAnimation.push(new Image());
    enemyAttackAnimation[i].src = "images/tds_zombie-Copy/export/Attack/skeleton-attack_" + i.toString() + ".png";
}

// ==========================================
// ENEMY LOGIC & SPAWNING
// ==========================================
function spawnEnemy() {
    let newEnemy = new Component(
        288 * imagesScale, 
        311 * imagesScale, 
        enemySprite, 
        640 - (288 * imagesScale) / 2, 
        360 - (311 * imagesScale) / 2, 
        "image"
    );

    let randomPosition = Math.floor(Math.random() * 4) + 1;
    let eW = 288 * imagesScale;
    let eH = 311 * imagesScale;

    if (randomPosition === 1) {
        newEnemy.x = -eW / 2;
        newEnemy.y = Math.random() * 720 - eH / 2;
    } else if (randomPosition === 2) {
        newEnemy.x = 1280 - eW / 2;
        newEnemy.y = Math.random() * 720 - eH / 2;
    } else if (randomPosition === 3) {
        newEnemy.x = Math.random() * 1280 - eW / 2;
        newEnemy.y = 720 - eH / 2;
    } else if (randomPosition === 4) {
        newEnemy.x = Math.random() * 1280 - eW / 2;
        newEnemy.y = -eH / 2;
    }

    enemies.push(newEnemy);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);
}

function getRandomInterval() {
    maxTime -= maxTime * difficulty;
    minTime -= minTime * difficulty;
    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
}

// ==========================================
// ENEMY ANIMATION CONTROLLERS
// ==========================================
function enemyMovementAnimationFunction(enemyNum) {
    if (enemiesWaitTime[enemyNum] === 0) {
        enemies[enemyNum].image.src = enemyMovementAnimation[enemiesAnimationPosition[enemyNum] % enemyMovementAnimation.length].src;
        enemiesAnimationPosition[enemyNum] = (enemiesAnimationPosition[enemyNum] + 1) % enemyMovementAnimation.length;
        enemiesWaitTime[enemyNum] = 5;
    } else {
        enemiesWaitTime[enemyNum]--;
    }
}

function enemyAttackAnimationFunction(enemyNum) {
    if (enemiesWaitTime[enemyNum] === 0) {
        enemies[enemyNum].image.src = enemyAttackAnimation[enemiesAnimationPosition[enemyNum] % enemyAttackAnimation.length].src;
        enemiesAnimationPosition[enemyNum] = (enemiesAnimationPosition[enemyNum] + 1) % enemyAttackAnimation.length;
        enemiesWaitTime[enemyNum] = 5;

        if (enemies[enemyNum].image.src === enemyAttackAnimation[6].src && enemiesPlayerCollision[enemyNum] === false) {
            endGame();
        }
    } else {
        enemiesWaitTime[enemyNum]--;
    }
}