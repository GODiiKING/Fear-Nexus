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

    // -------------------------------------------------------------
    // DYNAMIC HEALTH SCALING
    // -------------------------------------------------------------
    let currentKills = typeof score !== 'undefined' ? score : 0; 
    let extraHp = Math.floor(currentKills / 10);
    
    newEnemy.maxHp = 2 + extraHp; 
    newEnemy.hp = newEnemy.maxHp;   
    newEnemy.lastHitTime = 0; 
    // -------------------------------------------------------------

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

// ==========================================
// ENEMY HEALTH BAR RENDERER
// ==========================================
// FIXED: Added 'ctx' parameter to cleanly receive the rendering tool from your main loop
function drawEnemyHealthBars(ctx) {
    const currentTime = Date.now();

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        // Only draw the health bar if they've been hit within the last 3000ms (3 seconds)
        if (enemy.lastHitTime && (currentTime - enemy.lastHitTime < 3000)) {
            const barWidth = 60;  // Width of the bar adjusted for the skeleton scale
            const barHeight = 6;  // Height of the health bar
            
            // Calculate health percentage container
            const healthPercentage = enemy.hp / enemy.maxHp;
            const currentBarWidth = barWidth * healthPercentage;
            
            // Center the bar horizontally right above the enemy's head
            const barX = enemy.x + (enemy.width / 2) - (barWidth / 2);
            const barY = enemy.y - 15; 
            
            // 1. Draw dark background backing container
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 2. Draw active red progress indicator
            ctx.fillStyle = '#ff0000'; 
            ctx.fillRect(barX, barY, currentBarWidth, barHeight);
        }
    }
}