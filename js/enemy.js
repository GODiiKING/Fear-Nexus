"use strict";

// ==========================================
// ENEMY STATE & VARIABLES
// ==========================================
let enemies = [];
let enemiesWaitTime = [];
let enemiesAnimationPosition = [];
let enemiesPlayerCollision = [];
let spawnEnemiesInterval;
let enemySprite = "images/enemy/demon/movement/demon-move_0.png";
let difficulty = 0.60;
let maxTime = 5000;
let minTime = 100;
let killCount = 0;

// ==========================================
// ENEMY LOGIC & SPAWNING
// ==========================================
function spawnEnemy() {
    const MAX_ENEMIES = 8; 

    // 1. CAP THE SPAWNS: Stop if we have too many enemies
    if (enemies.length >= MAX_ENEMIES) return;

    killCount++;

    // 2. BOSS LOGIC: Trigger every 10th enemy
    if (killCount % 10 === 0) {
        let bossWidth = 400 * imagesScale;
        let bossHeight = 400 * imagesScale;
        
        // Spawn off-screen to the right (x: 1280 + bossWidth)
        // This ensures the boss walks in instead of appearing on the player
        let boss = new Component(
            bossWidth, 
            bossHeight, 
            "images/boss/demon-lord.png", 
            1280 + bossWidth, 
            360 - (bossHeight / 2), 
            "image"
        );
        
        boss.maxHp = 50 + (killCount); 
        boss.hp = boss.maxHp;
        boss.isBoss = true;
        
        enemies.push(boss);
        enemiesWaitTime.push(5);
        enemiesAnimationPosition.push(0);
        enemiesPlayerCollision.push(true);
        console.log("BOSS SPAWNED OFF-SCREEN!");
    } 
    // 3. REGULAR ENEMY LOGIC
    else {
        let eW = 288 * imagesScale;
        let eH = 311 * imagesScale;
        let newEnemy = new Component(eW, eH, enemySprite, 0, 0, "image");

        // Random Position Logic
        let randomPosition = Math.floor(Math.random() * 4) + 1;
        if (randomPosition === 1) { newEnemy.x = -eW / 2; newEnemy.y = Math.random() * 720 - eH / 2; }
        else if (randomPosition === 2) { newEnemy.x = 1280 - eW / 2; newEnemy.y = Math.random() * 720 - eH / 2; }
        else if (randomPosition === 3) { newEnemy.x = Math.random() * 1280 - eW / 2; newEnemy.y = 720 - eH / 2; }
        else if (randomPosition === 4) { newEnemy.x = Math.random() * 1280 - eW / 2; newEnemy.y = -eH / 2; }

        let currentKills = typeof score !== 'undefined' ? score : 0; 
        newEnemy.maxHp = 2 + Math.floor(currentKills / 10);
        newEnemy.hp = newEnemy.maxHp;   
        newEnemy.lastHitTime = 0; 

        enemies.push(newEnemy);
        enemiesWaitTime.push(5);
        enemiesAnimationPosition.push(0);
        enemiesPlayerCollision.push(true);
    }
}

// ==========================================
// ENEMY ANIMATION ASSETS
// ==========================================
let enemyMovementAnimation = [];
for (let i = 0; i < 16; i++) {
    enemyMovementAnimation.push(new Image());
    enemyMovementAnimation[i].src = "images/enemy/demon/movement/demon-move_" + i.toString() + ".png";
}

let enemyAttackAnimation = [];
for (let i = 0; i < 8; i++) {
    enemyAttackAnimation.push(new Image());
    enemyAttackAnimation[i].src = "images/enemy/demon/attack/demon-attack_" + i.toString() + ".png";
}

function getRandomInterval() {
    // 1. Reduce the times to make it faster
    maxTime -= maxTime * difficulty;
    minTime -= minTime * difficulty;

    // 2. SAFETY FLOOR: Ensure the wait time never drops below a playable speed
    // This stops it from becoming 0 or negative
    const MIN_LIMIT = 200; 
    if (maxTime < MIN_LIMIT) maxTime = MIN_LIMIT;
    if (minTime < 50) minTime = 50;

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
function drawEnemyHealthBars(ctx) {
    const currentTime = Date.now();

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.lastHitTime && (currentTime - enemy.lastHitTime < 3000)) {
            const barWidth = 60;  
            const barHeight = 6;  
            const healthPercentage = enemy.hp / enemy.maxHp;
            const currentBarWidth = barWidth * healthPercentage;
            
            const barX = enemy.x + (enemy.width / 2) - (barWidth / 2);
            const barY = enemy.y - 15; 
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0000'; 
            ctx.fillRect(barX, barY, currentBarWidth, barHeight);
        }
    }
}