"use strict";

const PLAYER_SCREEN_X = 640;
const PLAYER_SCREEN_Y = 360;

function enemyCenter(e) {
    return {
        x: e.x + (e.width || 0) / 2,
        y: e.y + (e.height || 0) / 2
    };
}

function damageEnemiesInRadius(radius, amount) {
    if (typeof enemies === 'undefined' || enemies.length === 0) return;

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i]) continue;

        const c = enemyCenter(enemies[i]);
        const dist = Math.hypot(c.x - PLAYER_SCREEN_X, c.y - PLAYER_SCREEN_Y);

        if (dist <= radius) {
            enemies[i].hp -= amount;
            enemies[i].lastHitTime = Date.now();

            if (enemies[i].hp <= 0 && typeof window.resolveEnemyKill === 'function') {
                window.resolveEnemyKill(i, null);
            }
        }
    }
}

// ==========================================
// SANGUINE AURA - every 2nd HP-ability cast
// ==========================================
const SANGUINE_AURA_RADIUS = 250;
const SANGUINE_AURA_DAMAGE = 3;

function flashSanguineAura() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.left = '50%';
    flash.style.top = '50%';
    flash.style.width = (SANGUINE_AURA_RADIUS * 2) + 'px';
    flash.style.height = (SANGUINE_AURA_RADIUS * 2) + 'px';
    flash.style.marginLeft = (-SANGUINE_AURA_RADIUS) + 'px';
    flash.style.marginTop = (-SANGUINE_AURA_RADIUS) + 'px';
    flash.style.borderRadius = '50%';
    flash.style.background = 'radial-gradient(circle, rgba(255,51,102,0.35), transparent 70%)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '400';
    flash.style.opacity = '1';
    flash.style.transform = 'scale(0.6)';
    flash.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.appendChild(flash);

    requestAnimationFrame(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'scale(1)';
    });
    setTimeout(() => flash.remove(), 350);
}

window.triggerSanguineAura = function () {
    if (!window.hasSanguineAura) return;
    damageEnemiesInRadius(SANGUINE_AURA_RADIUS, SANGUINE_AURA_DAMAGE);
    flashSanguineAura();
    console.log("[SANGUINE AURA] Pulse triggered.");
};

// ==========================================
// MANA ZONE - stand still 3s, field ticks every 0.5s
// ==========================================
const MANA_ZONE_TRIGGER_MS = 3000;
const MANA_ZONE_TICK_MS = 500;
const MANA_ZONE_RADIUS = 220;
const MANA_ZONE_DAMAGE = 2;
const MANA_ZONE_POLL_MS = 100;

let manaZoneStationaryTimer = 0;
let manaZoneActive = false;
let manaZoneTickTimer = 0;

setInterval(() => {
    if (!window.hasManaZone || gameOver || window.playerDead) {
        manaZoneStationaryTimer = 0;
        manaZoneActive = false;
        return;
    }
    if (window.NovelEngine && window.NovelEngine.isActive) return;

    const isStationary = !moveForward && !moveBackwards;

    if (isStationary) {
        manaZoneStationaryTimer += MANA_ZONE_POLL_MS;
        if (manaZoneStationaryTimer >= MANA_ZONE_TRIGGER_MS) {
            manaZoneActive = true;
        }
    } else {
        manaZoneStationaryTimer = 0;
        manaZoneActive = false;
        manaZoneTickTimer = 0;
    }

    if (manaZoneActive) {
        manaZoneTickTimer += MANA_ZONE_POLL_MS;
        if (manaZoneTickTimer >= MANA_ZONE_TICK_MS) {
            manaZoneTickTimer = 0;
            damageEnemiesInRadius(MANA_ZONE_RADIUS, MANA_ZONE_DAMAGE);
        }
    }
}, MANA_ZONE_POLL_MS);

// ==========================================
// ASTRA - right-click nova, on a cooldown
// ==========================================
const ASTRA_COOLDOWN_MS = 8000;
const ASTRA_DAMAGE = 15;
window.astraLastUsed = 0;

document.addEventListener('contextmenu', function (event) {
    if (!window.hasAstra) return;
    event.preventDefault();

    if (gameOver || window.playerDead) return;
    if (window.NovelEngine && window.NovelEngine.isActive) return;

    const now = Date.now();
    if (now - window.astraLastUsed < ASTRA_COOLDOWN_MS) {
        console.log("[ASTRA] Still recharging.");
        return;
    }
    window.astraLastUsed = now;

    if (typeof enemies !== 'undefined') {
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (!enemies[i]) continue;
            enemies[i].hp -= ASTRA_DAMAGE;
            enemies[i].lastHitTime = Date.now();

            if (enemies[i].hp <= 0 && typeof window.resolveEnemyKill === 'function') {
                window.resolveEnemyKill(i, null);
            }
        }
    }

    flashAstraScreen();
    console.log("[ASTRA] Celestial nova unleashed!");
});

function flashAstraScreen() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.inset = '0';
    flash.style.background = 'radial-gradient(circle, rgba(176,86,255,0.55), transparent 70%)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '500';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.4s ease';
    container.appendChild(flash);

    requestAnimationFrame(() => {
        flash.style.opacity = '0';
    });
    setTimeout(() => flash.remove(), 450);
}

// ==========================================
// ASMODEUS - rare bonus boss, bigger than the round bosses
// ==========================================
const ASMODEUS_SPRITE = "images/boss/asmodeus.png";
const ASMODEUS_SCALE_MULTIPLIER = 1.4; // 40% bigger than demon-lord / nexial-lord
const ASMODEUS_CHECK_INTERVAL_MS = 5000;
const ASMODEUS_SPAWN_CHANCE = 1.0;
let asmodeusAlive = false;

window.onAsmodeusDefeated = function () {
    asmodeusAlive = false;
};

// Callable directly (e.g. on purchase) or from the periodic chance-roll below.
// Self-guards so it's always safe to call.
window.spawnAsmodeusBoss = function () {
    if (typeof Component !== 'function' || typeof imagesScale === 'undefined') return;
    if (asmodeusAlive) {
        console.log("[ASMODEUS] He's already here.");
        return;
    }
    if (typeof enemies !== 'undefined' && enemies.length >= 50) {
        console.log("[ASMODEUS] Battlefield too crowded to summon him right now.");
        return;
    }

    let w = 400 * ASMODEUS_SCALE_MULTIPLIER * imagesScale;
    let h = 400 * ASMODEUS_SCALE_MULTIPLIER * imagesScale;

    let asmodeusBoss = new Component(
        w, h,
        ASMODEUS_SPRITE,
        1280 + w,
        360 - (h / 2),
        "image"
    );

    let currentRound = (window.RoundManager && window.RoundManager.round) || 1;
    asmodeusBoss.maxHp = 60 + (currentRound * 20);
    asmodeusBoss.hp = asmodeusBoss.maxHp;
    asmodeusBoss.isBoss = true;
    asmodeusBoss.isAsmodeus = true;
    asmodeusBoss.enemyType = 'asmodeus';

    enemies.push(asmodeusBoss);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);

    asmodeusAlive = true;
    console.log("[ASMODEUS] The pact-boss has appeared!");
};

setInterval(() => {
    if (typeof enemies === 'undefined') return;

    if (asmodeusAlive && !enemies.some(e => e && e.isAsmodeus)) {
        asmodeusAlive = false;
    }

    if (!window.hasAsmodeus || asmodeusAlive || gameOver || window.playerDead) return;
    if (window.NovelEngine && window.NovelEngine.isActive) return;
    if (window.RoundManager && window.RoundManager.isBossRound()) return;

    if (Math.random() < ASMODEUS_SPAWN_CHANCE) {
        window.spawnAsmodeusBoss();
    }
}, ASMODEUS_CHECK_INTERVAL_MS);