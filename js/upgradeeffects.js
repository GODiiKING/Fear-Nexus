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

    const icon = document.createElement('img');
    icon.src = 'images/sanguine-aura.png';
    icon.style.position = 'absolute';
    icon.style.left = '50%';
    icon.style.top = '50%';
    icon.style.width = '90px';
    icon.style.height = '90px';
    icon.style.marginLeft = '-45px';
    icon.style.marginTop = '-45px';
    icon.style.pointerEvents = 'none';
    icon.style.zIndex = '401';
    icon.style.opacity = '0.95';
    icon.style.transform = 'scale(0.5)';
    icon.style.filter = 'drop-shadow(0 0 12px rgba(255,51,102,0.8))';
    icon.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    container.appendChild(icon);

    requestAnimationFrame(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'scale(1)';
        icon.style.transform = 'scale(1.15)';
    });
    setTimeout(() => { flash.remove(); }, 350);
    setTimeout(() => { icon.style.opacity = '0'; }, 250);
    setTimeout(() => { icon.remove(); }, 650);
}

window.triggerSanguineAura = function () {
    if (!window.hasSanguineAura) return;
    damageEnemiesInRadius(SANGUINE_AURA_RADIUS, SANGUINE_AURA_DAMAGE);
    flashSanguineAura();
    console.log("[SANGUINE AURA] Pulse triggered.");
};

// ==========================================
// MANA ZONE - stand still 3s, field ticks every 0.5s
// Shows a persistent pulsing icon over the player for as long as the
// zone is active, using your mana-zone.png sprite.
// ==========================================
const MANA_ZONE_TRIGGER_MS = 3000;
const MANA_ZONE_TICK_MS = 500;
const MANA_ZONE_RADIUS = 220;
const MANA_ZONE_DAMAGE = 2;
const MANA_ZONE_POLL_MS = 100;

let manaZoneStationaryTimer = 0;
let manaZoneActive = false;
let manaZoneTickTimer = 0;
let manaZoneWasActive = false;
let manaZoneIconEl = null;

function showManaZoneIcon() {
    if (manaZoneIconEl) return;
    const container = document.getElementById('game-container');
    if (!container) return;

    const size = MANA_ZONE_RADIUS * 1.3;
    const icon = document.createElement('img');
    icon.src = 'images/mana-zone.png';
    icon.style.position = 'absolute';
    icon.style.left = '50%';
    icon.style.top = '50%';
    icon.style.width = size + 'px';
    icon.style.height = size + 'px';
    icon.style.marginLeft = (-size / 2) + 'px';
    icon.style.marginTop = (-size / 2) + 'px';
    icon.style.pointerEvents = 'none';
    icon.style.zIndex = '399';
    icon.style.opacity = '0.55';
    icon.style.filter = 'drop-shadow(0 0 14px rgba(51,204,255,0.7))';
    icon.style.animation = 'manaZonePulse 1.6s ease-in-out infinite';
    container.appendChild(icon);

    manaZoneIconEl = icon;
}

function hideManaZoneIcon() {
    if (manaZoneIconEl) {
        manaZoneIconEl.remove();
        manaZoneIconEl = null;
    }
}

setInterval(() => {
    if (!window.hasManaZone || gameOver || window.playerDead) {
        manaZoneStationaryTimer = 0;
        manaZoneActive = false;
    } else if (!(window.NovelEngine && window.NovelEngine.isActive)) {
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
    }

    if (manaZoneActive && !manaZoneWasActive) {
        showManaZoneIcon();
    } else if (!manaZoneActive && manaZoneWasActive) {
        hideManaZoneIcon();
    }
    manaZoneWasActive = manaZoneActive;
}, MANA_ZONE_POLL_MS);

// ==========================================
// ASTRA - right-click nova, on a cooldown
// Locked entirely until purchased: this listener is the ONLY thing
// right-click does now (the old magic-cost shot on right-click was
// removed from script.js), and it no-ops until window.hasAstra is true.
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

    const icon = document.createElement('img');
    icon.src = 'images/astra.png';
    icon.style.position = 'absolute';
    icon.style.left = '50%';
    icon.style.top = '50%';
    icon.style.width = '160px';
    icon.style.height = '160px';
    icon.style.marginLeft = '-80px';
    icon.style.marginTop = '-80px';
    icon.style.pointerEvents = 'none';
    icon.style.zIndex = '501';
    icon.style.opacity = '0.95';
    icon.style.transform = 'scale(0.4) rotate(0deg)';
    icon.style.filter = 'drop-shadow(0 0 20px rgba(176,86,255,0.9))';
    icon.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    container.appendChild(icon);

    requestAnimationFrame(() => {
        flash.style.opacity = '0';
        icon.style.transform = 'scale(1.3) rotate(90deg)';
    });
    setTimeout(() => { flash.remove(); }, 450);
    setTimeout(() => { icon.style.opacity = '0'; }, 350);
    setTimeout(() => { icon.remove(); }, 850);
}

// ==========================================
// ASMODEUS - rare bonus boss, bigger than the round bosses
// ==========================================
const ASMODEUS_SPRITE = "images/boss/asmodeus.png";
const ASMODEUS_SCALE_MULTIPLIER = 1.4;
const ASMODEUS_CHECK_INTERVAL_MS = 5000;
const ASMODEUS_SPAWN_CHANCE = 1.0;
let asmodeusAlive = false;

window.onAsmodeusDefeated = function () {
    asmodeusAlive = false;
};

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