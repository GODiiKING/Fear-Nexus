"use strict";

// ==========================================
// ENEMY TYPE DEFINITIONS
// ==========================================
// Demon is the only enemy type. The table is kept (instead of hardcoding
// paths) so adding a new type later is just one new entry here.
const ENEMY_TYPES = {
    demon: {
        movementFrames: 16,
        attackFrames: 8,
        movementPath: "images/enemy/demon/movement/demon-move_",
        attackPath: "images/enemy/demon/attack/demon-attack_",
        bossSprite: "images/boss/demon-lord.png"
    }
};

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
// PRELOAD ANIMATION FRAMES
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
            console.log("BOSS SPAWNED (Demon Lord)!");
        }
        return;
    } else {
        spawnRegularEnemy();
    }
}

// Boss rounds spawn a single Demon Lord. The counter is what
// RoundManager uses to decide when the round is cleared.
function spawnBossWave() {
    spawnBoss('demon', 360);
    window.bossesRemainingThisRound = 1;
}

function spawnBoss(typeName, yPosition) {
    var def = ENEMY_TYPES[typeName];
    if (!def || !def.bossSprite) return null;

    var bossWidth = 400 * imagesScale;
    var bossHeight = 400 * imagesScale;

    var boss = new Component(
        bossWidth, bossHeight, def.bossSprite,
        1280 + bossWidth, yPosition - (bossHeight / 2), "image"
    );

    boss.enemyType = typeName;
    boss.isBoss = true;
    boss.maxHp = window.RoundManager ? window.RoundManager.getBossMaxHP() : 30;
    boss.hp = boss.maxHp;

    enemies.push(boss);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);

    return boss;
}

function spawnRegularEnemy() {
    var typeName = 'demon';
    var def = ENEMY_TYPES[typeName];

    var eW = 288 * imagesScale;
    var eH = 311 * imagesScale;
    var newEnemy = new Component(eW, eH, def.movementPath + "0.png", 0, 0, "image");
    newEnemy.enemyType = typeName;
    newEnemy.wobbleSeed = Math.random() * Math.PI * 2;
    newEnemy.speedVariance = 0.85 + Math.random() * 0.3;

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
// ENEMY MOVEMENT AI
// Seek the player + separation from nearby enemies (so they spread out
// instead of stacking) + a gentle per-enemy wobble + per-enemy speed
// variance so they don't all move in lockstep.
// ==========================================
const SEPARATION_RADIUS = 120;
const SEPARATION_WEIGHT = 1.6;
const WOBBLE_STRENGTH = 0.35;
const WOBBLE_PERIOD_MS = 500;

function moveEnemies() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) {
        return;
    }

    const now = Date.now();

    for (let i = 0; i < enemies.length; i++) {
        if (!enemiesPlayerCollision[i]) continue;

        let enemy = enemies[i];

        let dx = enemy.x - player.x;
        let dy = enemy.y - player.y;
        let distToPlayer = Math.sqrt(dx * dx + dy * dy) || 1;

        let angleToPlayer = Math.atan2(dy, dx);
        enemy.angle = angleToPlayer + Math.PI;

        let seekX = -dx / distToPlayer;
        let seekY = -dy / distToPlayer;

        let sepX = 0, sepY = 0;
        for (let j = 0; j < enemies.length; j++) {
            if (j === i) continue;
            let other = enemies[j];
            let ox = enemy.x - other.x;
            let oy = enemy.y - other.y;
            let d = Math.sqrt(ox * ox + oy * oy);
            if (d > 0 && d < SEPARATION_RADIUS) {
                let strength = (SEPARATION_RADIUS - d) / SEPARATION_RADIUS;
                sepX += (ox / d) * strength;
                sepY += (oy / d) * strength;
            }
        }

        if (enemy.wobbleSeed === undefined) enemy.wobbleSeed = Math.random() * Math.PI * 2;
        let wobble = Math.sin(now / WOBBLE_PERIOD_MS + enemy.wobbleSeed) * WOBBLE_STRENGTH;
        let perpX = -seekY;
        let perpY = seekX;

        let moveX = seekX + sepX * SEPARATION_WEIGHT + perpX * wobble;
        let moveY = seekY + sepY * SEPARATION_WEIGHT + perpY * wobble;
        let moveLen = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
        moveX /= moveLen;
        moveY /= moveLen;

        if (enemy.speedVariance === undefined) enemy.speedVariance = 0.85 + Math.random() * 0.3;
        let speed = movementSpeed * 5 * enemy.speedVariance;

        enemy.x += moveX * speed;
        enemy.y += moveY * speed;

        if (typeof enemyMovementAnimationFunction === 'function') {
            enemyMovementAnimationFunction(i);
        }
    }
}

// ==========================================
// BOSS AURA
// Pulsing glow behind boss sprites so bosses read at a glance.
// Red for the Demon Lord, purple for Asmodeus.
// ==========================================
const BOSS_AURA_PULSE_MS = 1400;
const BOSS_AURA_COLORS = {
    demon: '255,60,60'
};

function bossAuraColor(enemy) {
    if (enemy.isAsmodeus) return '176,86,255';
    return BOSS_AURA_COLORS[enemy.enemyType] || '255,60,60';
}

function drawBossAuras(ctx) {
    const now = Date.now();

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (!enemy.isBoss) continue;

        let cx = enemy.x + (enemy.width || 0) / 2;
        let cy = enemy.y + (enemy.height || 0) / 2;
        let baseRadius = Math.max(enemy.width || 0, enemy.height || 0) / 2 + 15;
        let pulse = (Math.sin((now / BOSS_AURA_PULSE_MS) * Math.PI * 2) + 1) / 2;
        let radius = baseRadius + pulse * 10;
        let color = bossAuraColor(enemy);

        ctx.save();
        let gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(' + color + ', 0)');
        gradient.addColorStop(0.7, 'rgba(' + color + ', 0.28)');
        gradient.addColorStop(1, 'rgba(' + color + ', 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ==========================================
// ENEMY ANIMATION CONTROLLERS
// Bosses (demon-lord / asmodeus) are single static portraits, not frame
// sequences, so they're skipped here.
// ==========================================
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