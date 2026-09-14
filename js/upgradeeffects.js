"use strict";

/*
==============================================================
 UPGRADE PAYOFFS
 Implements the actual gameplay effects for upgrades that were
 previously just flags (hasSanguineAura, hasManaZone, hasAstra,
 hasAsmodeus). Written standalone so it doesn't need script.js —
 it only touches globals already shared across the other classic
 <script> files (enemies, player, moveForward, etc.) and the
 resolveEnemyKill() helper exposed by collisions.js.

 Load this AFTER config.js, enemy.js, and collisions.js.
==============================================================
*/

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
                // source is null: these are passive procs, not attributed
                // to either ability's healthKills/magicKills counter
                window.resolveEnemyKill(i, null);
            }
        }
    }
}

// ==========================================
// SANGUINE AURA
// Triggered from abilitysystem.js every 2nd HP-ability cast
// ==========================================
const SANGUINE_AURA_RADIUS = 250;
const SANGUINE_AURA_DAMAGE = 3;

window.triggerSanguineAura = function() {
    if (!window.hasSanguineAura) return;
    damageEnemiesInRadius(SANGUINE_AURA_RADIUS, SANGUINE_AURA_DAMAGE);
    console.log("[SANGUINE AURA] Pulse triggered.");
};

// ==========================================
// MANA ZONE
// Standing still (not holding W or S) for 3s opens a field that
// ticks damage to nearby enemies every 0.5s while you stay still
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
// ASTRA
// Right-click special attack: nova damage to every enemy currently
// on screen, on a cooldown. Only claims right-click once unlocked,
// so the browser's normal context menu still works until then.
// ==========================================
const ASTRA_COOLDOWN_MS = 8000;
const ASTRA_DAMAGE = 15;
window.astraLastUsed = 0;

document.addEventListener('contextmenu', function(event) {
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
// ASMODEUS
// Once unlocked, a rare bonus boss has a chance to appear (outside
// scripted boss rounds). Defeating it grants a guaranteed level-up
// via resolveEnemyKill()'s isAsmodeus branch.
// ==========================================
const ASMODEUS_CHECK_INTERVAL_MS = 5000;
const ASMODEUS_SPAWN_CHANCE = 0.15;
let asmodeusAlive = false;

window.onAsmodeusDefeated = function() {
    asmodeusAlive = false;
};

setInterval(() => {
    if (typeof enemies === 'undefined') return;

    // Self-correct if the boss disappeared some other way (e.g. a
    // manual restart) instead of through resolveEnemyKill.
    if (asmodeusAlive && !enemies.some(e => e && e.isAsmodeus)) {
        asmodeusAlive = false;
    }

    if (!window.hasAsmodeus || asmodeusAlive || gameOver || window.playerDead) return;
    if (window.NovelEngine && window.NovelEngine.isActive) return;
    if (window.RoundManager && window.RoundManager.isBossRound()) return; // don't compete with the scripted round boss
    if (enemies.length >= 8) return;

    if (Math.random() < ASMODEUS_SPAWN_CHANCE) {
        spawnAsmodeusBoss();
    }
}, ASMODEUS_CHECK_INTERVAL_MS);

function spawnAsmodeusBoss() {
    if (typeof Component !== 'function' || typeof imagesScale === 'undefined') return;

    let w = 400 * imagesScale;
    let h = 400 * imagesScale;

    let asmodeusBoss = new Component(
        w, h,
        "images/boss/demon-lord.png",
        1280 + w,
        360 - (h / 2),
        "image"
    );

    let currentRound = (window.RoundManager && window.RoundManager.round) || 1;
    asmodeusBoss.maxHp = 40 + (currentRound * 15);
    asmodeusBoss.hp = asmodeusBoss.maxHp;
    asmodeusBoss.isBoss = true;
    asmodeusBoss.isAsmodeus = true;

    enemies.push(asmodeusBoss);
    enemiesWaitTime.push(5);
    enemiesAnimationPosition.push(0);
    enemiesPlayerCollision.push(true);

    asmodeusAlive = true;
    console.log("[ASMODEUS] A rare pact-boss has appeared!");
}