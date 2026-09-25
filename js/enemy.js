"use strict";

// ==========================================
// ENEMY TYPE DEFINITIONS
// ==========================================
const ENEMY_TYPES = {
    demon: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/demon/movement/demon-move_",
        attackPath: "images/enemy/demon/attack/demon-attack_",
        bossSprite: "images/boss/demon-lord.png",
        unlockRound: 1, ranged: false
    },
    nexial: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/nexial/movement/nexial-move_",
        attackPath: "images/enemy/nexial/attack/nexial-attack_",
        bossSprite: "images/boss/nexial-lord.png",
        unlockRound: 2, ranged: false
    },
    gharrox: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/gharrox/movement/gharrox-move_",
        attackPath: "images/enemy/gharrox/attack/gharrox-attack_",
        bossSprite: null,
        unlockRound: 4, ranged: false
    },
    grint: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/grint/movement/grint-move_",
        attackPath: "images/enemy/grint/attack/grint-attack_",
        bossSprite: null,
        unlockRound: 6, ranged: false
    },
    lumen: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/lumen/movement/lumen-move_",
        attackPath: "images/enemy/lumen/attack/lumen-attack_",
        bossSprite: null,
        unlockRound: 8, ranged: true
    },
    murm: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/murm/movement/murm-move_",
        attackPath: "images/enemy/murm/attack/murm-attack_",
        bossSprite: null,
        unlockRound: 8, ranged: true
    },
    skryx: {
        movementFrames: 16, attackFrames: 8,
        movementPath: "images/enemy/skryx/movement/skryx-move_",
        attackPath: "images/enemy/skryx/attack/skryx-attack_",
        bossSprite: "images/boss/skryx-lord.png",
        unlockRound: 10, ranged: true
    }
};

const SKRYX_BOSS_CYCLE = 3;

// ==========================================
// ENEMY STATE & VARIABLES
// ==========================================
var enemies = [];
var enemiesWaitTime = [];
var enemiesAnimationPosition = [];
var enemiesPlayerCollision = [];
var enemyBullets = [];
var spawnEnemiesInterval;
var difficulty = 0.60;
var maxTime = 5000;
var minTime = 100;
var killCount = 0;

window.bossSpawnedThisRound = false;
window.bossesRemainingThisRound = 0;
window.skryxLastSpawnedRound = 0;

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

// Enemy projectiles reuse your bullet2.png art, tinted per-type via
// canvas hue-rotate so they read as distinct without needing new sprites.
var enemyBulletImage = new Image();
var enemyBulletImageLoaded = false;
enemyBulletImage.onload = function () { enemyBulletImageLoaded = true; };
enemyBulletImage.src = "images/bullet/bullet2.png";

// ==========================================
// ENEMY LOGIC & SPAWNING
// ==========================================
function spawnEnemy() {
    const MAX_ENEMIES = 10;
    if (enemies.length >= MAX_ENEMIES) return;

    maybeSpawnSkryxLord();

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

function maybeSpawnSkryxLord() {
    if (!window.RoundManager) return;

    let round = window.RoundManager.round;
    if (round % SKRYX_BOSS_CYCLE !== 0) return;
    if (window.skryxLastSpawnedRound === round) return;
    if (enemies.length >= 10) return;

    spawnBoss('skryx', 360, {
        isSkryxSpecial: true,
        maxHp: Math.round((window.RoundManager.getBossMaxHP() || 30) * 1.3)
    });
    window.skryxLastSpawnedRound = round;
    console.log("SKRYX LORD HAS ARRIVED!");
}

function spawnBossWave() {
    spawnBoss('demon', 200);
    spawnBoss('nexial', 480);
    window.bossesRemainingThisRound = 2;
}

function spawnBoss(typeName, yPosition, extraFlags) {
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
    boss.ranged = def.ranged || false;
    boss.nextShotTime = 0;

    if (extraFlags) Object.assign(boss, extraFlags);

    if (!boss.maxHp) {
        boss.maxHp = window.RoundManager ? window.RoundManager.getBossMaxHP() : 30;
    }
    boss.hp = boss.maxHp;

    enemies.push(boss);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);

    return boss;
}

function spawnRegularEnemy() {
    var round = window.RoundManager ? window.RoundManager.round : 1;
    var availableTypes = Object.keys(ENEMY_TYPES).filter(function (t) {
        return round >= ENEMY_TYPES[t].unlockRound;
    });
    if (availableTypes.length === 0) availableTypes = ['demon'];

    var typeName = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    var def = ENEMY_TYPES[typeName];

    var eW = 288 * imagesScale;
    var eH = 311 * imagesScale;
    var newEnemy = new Component(eW, eH, def.movementPath + "0.png", 0, 0, "image");
    newEnemy.enemyType = typeName;
    newEnemy.ranged = def.ranged || false;
    newEnemy.nextShotTime = 0;
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

        if (enemy.ranged) {
            tryEnemyRangedAttack(enemy, distToPlayer, now);
        }
    }
}

// ==========================================
// RANGED ENEMY ATTACKS (lumen, murm, skryx)
// ==========================================
const RANGED_ATTACK_RANGE = 650;
const RANGED_ATTACK_COOLDOWN_MS = 2200;
const RANGED_BULLET_SPEED = 9;
const RANGED_BULLET_DAMAGE = 6;
const RANGED_BOSS_DAMAGE_MULTIPLIER = 2;

function tryEnemyRangedAttack(enemy, distToPlayer, now) {
    if (distToPlayer > RANGED_ATTACK_RANGE) return;
    if (enemy.nextShotTime === undefined) enemy.nextShotTime = 0;
    if (now < enemy.nextShotTime) return;

    enemy.nextShotTime = now + RANGED_ATTACK_COOLDOWN_MS;

    let ex = enemy.x + (enemy.width || 0) / 2;
    let ey = enemy.y + (enemy.height || 0) / 2;
    let px = player.x + (player.width || 0) / 2;
    let py = player.y + (player.height || 0) / 2;

    let angle = Math.atan2(py - ey, px - ex);
    let damage = RANGED_BULLET_DAMAGE * (enemy.isBoss ? RANGED_BOSS_DAMAGE_MULTIPLIER : 1);

    enemyBullets.push({
        x: ex, y: ey, angle: angle,
        speed: RANGED_BULLET_SPEED,
        damage: damage,
        enemyType: enemy.enemyType
    });
}

function updateEnemyBullets() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) return;

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;

        if (b.x < -50 || b.x > 1330 || b.y < -50 || b.y > 770) {
            enemyBullets.splice(i, 1);
        }
    }
}

// Hue-rotate applied to the real bullet sprite so each ranged type's
// shots read as distinct without new art. Tune the angles below if the
// tint looks off against your actual bullet2.png color.
const ENEMY_BULLET_HUE = {
    lumen: '10deg',
    murm: '250deg',
    skryx: '150deg'
};

function drawEnemyBullets(ctx) {
    for (let i = 0; i < enemyBullets.length; i++) {
        let b = enemyBullets[i];
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        if (enemyBulletImageLoaded) {
            ctx.filter = 'hue-rotate(' + (ENEMY_BULLET_HUE[b.enemyType] || '0deg') + ') saturate(1.4)';
            ctx.drawImage(enemyBulletImage, -14, -4, 28, 8);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// ==========================================
// BOSS AURA
// Pulsing glow behind boss sprites so bosses read at a glance, colored
// per type. Drawn before the boss sprite itself in the render loop.
// ==========================================
const BOSS_AURA_PULSE_MS = 1400;
const BOSS_AURA_COLORS = {
    demon: '255,60,60',
    nexial: '255,150,0',
    skryx: '0,229,199'
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