"use strict";

// ==========================================
// ENEMY TYPE DEFINITIONS
// ==========================================
// ASSUMPTION: nexial has the same frame counts as demon (16 movement
// frames numbered 0-15, 8 attack frames numbered 0-7) since only frame 0
// of each was provided. If nexial's actual counts differ, change
// movementFrames / attackFrames below — nothing else needs updating.
const ENEMY_TYPES = {
    demon: {
        movementFrames: 16,
        attackFrames: 8,
        movementPath: "images/enemy/demon/movement/demon-move_",
        attackPath: "images/enemy/demon/attack/demon-attack_",
        bossSprite: "images/boss/demon-lord.png"
    },
    nexial: {
        movementFrames: 16,
        attackFrames: 8,
        movementPath: "images/enemy/nexial/movement/nexial-move_",
        attackPath: "images/enemy/nexial/attack/nexial-attack_",
        bossSprite: "images/boss/nexial-lord.png"
    }
};

// The round from which nexial grunts start appearing alongside demons.
const NEXIAL_UNLOCK_ROUND = 2;

// ==========================================
// ENEMY STATE & VARIABLES
// ==========================================
var enemies = [];
var enemiesWaitTime = [];
var enemiesAnimationPosition = [];
var enemiesPlayerCollision = [];
var spawnEnemiesInterval;
var difficulty = 0.60;
var maxTime = 5000;
var minTime = 100;
var killCount = 0;

// Track boss-round state
window.bossSpawnedThisRound = false;
window.bossesRemainingThisRound = 0;

// ==========================================
// PRELOAD ANIMATION FRAMES PER TYPE
// ==========================================
var enemyAnimations = {};
Object.keys(ENEMY_TYPES).forEach(function (typeName) {
    var def = ENEMY_TYPES[typeName];

    var movement = [];
    for (var m = 0; m < def.movementFrames; m++) {
        var mImg = new Image();
        mImg.src = def.movementPath + m + ".png";
        movement.push(mImg);
    }

    var attack = [];
    for (var a = 0; a < def.attackFrames; a++) {
        var aImg = new Image();
        aImg.src = def.attackPath + a + ".png";
        attack.push(aImg);
    }

    enemyAnimations[typeName] = { movement: movement, attack: attack };
});

// ==========================================
// ENEMY LOGIC & SPAWNING
// ==========================================
function spawnEnemy() {
    const MAX_ENEMIES = 8;
    if (enemies.length >= MAX_ENEMIES) return;

    if (window.RoundManager && window.RoundManager.isBossRound()) {
        if (!window.bossSpawnedThisRound) {
            spawnBossWave();
            window.bossSpawnedThisRound = true;
            console.log("BOSS WAVE SPAWNED (Demon Lord + Nexial Lord)!");
        }
        return;
    } else {
        spawnRegularEnemy();
    }
}

// Spawns both round bosses together and sets how many must die to clear the round.
function spawnBossWave() {
    spawnBoss('demon', 200);
    spawnBoss('nexial', 480);
    window.bossesRemainingThisRound = 2;
}

function spawnBoss(typeName, yPosition) {
    var def = ENEMY_TYPES[typeName];
    if (!def) return;

    var bossWidth = 400 * imagesScale;
    var bossHeight = 400 * imagesScale;

    var boss = new Component(
        bossWidth,
        bossHeight,
        def.bossSprite,
        1280 + bossWidth,
        yPosition - (bossHeight / 2),
        "image"
    );

    boss.enemyType = typeName;
    boss.maxHp = window.RoundManager ? window.RoundManager.getBossMaxHP() : 30;
    boss.hp = boss.maxHp;
    boss.isBoss = true;

    enemies.push(boss);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);
}

function spawnRegularEnemy() {
    var availableTypes = ['demon'];
    var round = window.RoundManager ? window.RoundManager.round : NEXIAL_UNLOCK_ROUND;
    if (round >= NEXIAL_UNLOCK_ROUND) {
        availableTypes.push('nexial');
    }
    var typeName = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    var def = ENEMY_TYPES[typeName];

    var eW = 288 * imagesScale;
    var eH = 311 * imagesScale;
    var newEnemy = new Component(eW, eH, def.movementPath + "0.png", 0, 0, "image");
    newEnemy.enemyType = typeName;

    // Random Position Logic
    var randomPosition = Math.floor(Math.random() * 4) + 1;
    if (randomPosition === 1) { newEnemy.x = -eW / 2; newEnemy.y = Math.random() * 720 - eH / 2; }
    else if (randomPosition === 2) { newEnemy.x = 1280 - eW / 2; newEnemy.y = Math.random() * 720 - eH / 2; }
    else if (randomPosition === 3) { newEnemy.x = Math.random() * 1280 - eW / 2; newEnemy.y = 720 - eH / 2; }
    else if (randomPosition === 4) { newEnemy.x = Math.random() * 1280 - eW / 2; newEnemy.y = -eH / 2; }

    if (window.RoundManager) {
        newEnemy.maxHp = window.RoundManager.getEnemyMaxHP();
    } else {
        var currentKills = typeof score !== 'undefined' ? score : 0;
        newEnemy.maxHp = 2 + Math.floor(currentKills / 10);
    }

    newEnemy.hp = newEnemy.maxHp;
    newEnemy.lastHitTime = 0;

    enemies.push(newEnemy);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);
}

function getRandomInterval() {
    maxTime -= maxTime * difficulty;
    minTime -= minTime * difficulty;

    const MIN_LIMIT = 200;
    if (maxTime < MIN_LIMIT) maxTime = MIN_LIMIT;
    if (minTime < 50) minTime = 50;

    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
}

// ==========================================
// ENEMY ANIMATION CONTROLLERS
// ==========================================
// Bosses (demon-lord / nexial-lord / asmodeus) are single static portraits,
// not frame sequences — skip them so their art never gets overwritten by
// grunt walk-cycle frames.
function enemyMovementAnimationFunction(enemyNum) {
    var enemy = enemies[enemyNum];
    if (!enemy || enemy.isBoss) return;

    var anim = enemyAnimations[enemy.enemyType] || enemyAnimations.demon;

    if (enemiesWaitTime[enemyNum] === 0) {
        enemy.image.src = anim.movement[enemiesAnimationPosition[enemyNum] % anim.movement.length].src;
        enemiesAnimationPosition[enemyNum] = (enemiesAnimationPosition[enemyNum] + 1) % anim.movement.length;
        enemiesWaitTime[enemyNum] = 5;
    } else {
        enemiesWaitTime[enemyNum]--;
    }
}

// Was referenced by collisions.js but never defined before — attack
// animations were silently never playing. Defined properly now.
function enemyAttackAnimationFunction(enemyNum) {
    var enemy = enemies[enemyNum];
    if (!enemy || enemy.isBoss) return;

    var anim = enemyAnimations[enemy.enemyType] || enemyAnimations.demon;

    if (enemiesWaitTime[enemyNum] === 0) {
        enemy.image.src = anim.attack[enemiesAnimationPosition[enemyNum] % anim.attack.length].src;
        enemiesAnimationPosition[enemyNum] = (enemiesAnimationPosition[enemyNum] + 1) % anim.attack.length;
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