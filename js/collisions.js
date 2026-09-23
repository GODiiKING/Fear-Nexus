"use strict";

// ==========================================
// BULLET MOVEMENT (player bullets)
// ==========================================
function updateBullets() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) {
        return;
    }

    if (bulletActive) {
        let bullet1Turn = ((Math.random()) * 3) * Math.PI / 180;
        let bullet2Turn = 0;
        let bullet3Turn = ((Math.random() - 1) * 3) * Math.PI / 180;

        bullet1.x += bulletSpeed * Math.cos(bulletAngle + bullet1Turn);
        bullet1.y += bulletSpeed * Math.sin(bulletAngle + bullet1Turn);

        bullet2.x += bulletSpeed * Math.cos(bulletAngle + bullet2Turn);
        bullet2.y += bulletSpeed * Math.sin(bulletAngle + bullet2Turn);

        bullet3.x += bulletSpeed * Math.cos(bulletAngle + bullet3Turn);
        bullet3.y += bulletSpeed * Math.sin(bulletAngle + bullet3Turn);

        if (bullet1.x > 1280 || bullet1.x < 0 || bullet1.y < 0 || bullet1.y > 720) {
            canShoot = true;
        }
    }
}

// ==========================================
// SHARED DAMAGE-TO-PLAYER HELPER
// Used by both melee contact and enemy ranged bullets so Cosmic Shell
// mitigation and Revival only need to be handled in one place.
// ==========================================
function applyDamageToPlayer(rawDamage) {
    if (!player || typeof player.hp === 'undefined') return 0;

    let mitigation = (window.PlayerStats && window.PlayerStats.damageMitigation) || 0;
    let finalDamage = Math.max(0, Math.round(rawDamage * (1 - mitigation)));

    player.hp -= finalDamage;

    if (player.hp <= 0) {
        if (window.hasRevival && !window.revivalConsumed) {
            window.revivalConsumed = true;
            let maxHpRef = (window.PlayerStats && window.PlayerStats.maxHealth) || window.maxHealth || 100;
            player.hp = Math.floor(maxHpRef * 0.5);
            console.log("[REVIVAL] Safety net triggered - restored " + player.hp + " HP");
        } else {
            player.hp = 0;
            window.playerDead = true;
        }
    }

    return finalDamage;
}
window.applyDamageToPlayer = applyDamageToPlayer;

// ==========================================
// SHARED ENEMY-DEATH RESOLUTION
// ==========================================
function resolveEnemyKill(i, source) {
    if (!enemies[i]) return;

    let isBoss = enemies[i].isBoss === true;
    let isAsmodeus = enemies[i].isAsmodeus === true;
    let isSkryxSpecial = enemies[i].isSkryxSpecial === true;

    score += isBoss ? 10 : 1;

    if (window.PlayerStats) {
        if (isAsmodeus) {
            window.PlayerStats.addSouls(200);
            window.PlayerStats.addXP(window.PlayerStats.xpToNext);
            console.log("[ASMODEUS] Pact-boss defeated - instant level up granted!");
            if (typeof window.onAsmodeusDefeated === 'function') {
                window.onAsmodeusDefeated();
            }
        } else if (isSkryxSpecial) {
            window.PlayerStats.addXP(40);
            window.PlayerStats.addSouls(150);
            console.log("[SKRYX LORD] Special boss defeated!");
        } else {
            window.PlayerStats.addXP(isBoss ? 25 : 5);
            window.PlayerStats.addSouls(isBoss ? 100 : 50);
        }

        window.PlayerStats.kills = (window.PlayerStats.kills || 0) + 1;

        if (source === 'square') {
            window.PlayerStats.healthKills = (window.PlayerStats.healthKills || 0) + 1;
        } else if (source === 'triangle') {
            window.PlayerStats.magicKills = (window.PlayerStats.magicKills || 0) + 1;
        }
    }

    if (window.RoundManager) {
        // Asmodeus and Skryx Lord are bonus encounters - they never gate
        // clearing a scheduled boss round.
        window.RoundManager.registerKill(isBoss && !isAsmodeus && !isSkryxSpecial);
    }

    enemies.splice(i, 1);
    enemiesWaitTime.splice(i, 1);
    enemiesAnimationPosition.splice(i, 1);
    enemiesPlayerCollision.splice(i, 1);
}
window.resolveEnemyKill = resolveEnemyKill;

// ==========================================
// BULLET HIT DETECTION (player bullets vs enemies)
// ==========================================
function checkBulletCollisions() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) {
        return;
    }

    for (let j = 0; j < bullets.length; j++) {
        for (let i = 0; i < enemies.length; i++) {

            if (!enemies[i]) continue;

            let isHitX =
                bullets[j].x > enemies[i].x + 27 * imagesScale &&
                bullets[j].x < enemies[i].x + (27 + 206) * imagesScale;

            let isHitY =
                bullets[j].y > enemies[i].y + 77 * imagesScale &&
                bullets[j].y < enemies[i].y + (77 + 197) * imagesScale;

            if (isHitX && isHitY) {

                if (shootSound) {
                    try {
                        shootSound.pause();
                        shootSound.currentTime = 0;
                        shootSound.play().catch(() => {});
                    } catch (audioError) {}
                }

                if (alienDeathSound) {
                    alienDeathSound.volume = 0.9;
                    if (alienDeathSound.paused) {
                        alienDeathSound.play().catch(() => {});
                    }
                }

                let randomSpeak = Math.random();
                let soundToPlay = randomSpeak < 0.33 ? alienSpeakSound : (randomSpeak < 0.66 ? alienSpeakSound2 : alienSpeakSound3);
                if (soundToPlay) {
                    soundToPlay.volume = 0.9;
                    soundToPlay.play().catch(() => {});
                }

                let dmg = 1;
                if (window.PlayerStats) {
                    if (enemies[i].isBoss && window.PlayerStats.bossDamageBonus) {
                        dmg += window.PlayerStats.bossDamageBonus;
                    } else if (!enemies[i].isBoss && window.PlayerStats.mobDamageBonus) {
                        dmg += window.PlayerStats.mobDamageBonus;
                    }
                }

                enemies[i].hp -= dmg;
                enemies[i].lastHitTime = Date.now();

                if (window.hasLifesteal && player) {
                    let maxHpRef = player.maxHp || window.maxHealth || 100;
                    player.hp = Math.min(maxHpRef, player.hp + 5);
                }

                if (window.hasManasteal && player) {
                    let maxMagicRef = player.maxMagic || window.maxMagic || 100;
                    player.magic = Math.min(maxMagicRef, player.magic + 5);
                }

                if (enemies[i].hp <= 0) {
                    resolveEnemyKill(i, window.activeBulletType);
                    i--;
                }

                bullets[j].x = 9999;
                bullets[j].y = 9999;
                break;
            }
        }
    }
}

// ==========================================
// ENEMY MELEE TOUCHING PLAYER
// ==========================================
function checkEnemyPlayerCollisions() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) {
        return;
    }

    const currentTime = Date.now();

    if (!window.globalPlayerInvincibleTime) {
        window.globalPlayerInvincibleTime = 0;
    }

    for (let i = 0; i < enemies.length; i++) {

        let playerXStart = 640 - 37 - player.width * imagesScale;
        let playerXEnd = 640 + (256 - 37) * imagesScale - player.width * imagesScale;

        let playerYStart = 360 - 38 * imagesScale - player.height * imagesScale - 80;
        let playerYEnd = 360 + (150 - 38) * imagesScale - player.height * imagesScale + 50;

        let inRangeX =
            enemies[i].x + 27 * imagesScale > playerXStart &&
            enemies[i].x + 27 * imagesScale < playerXEnd;

        let inRangeY =
            enemies[i].y + 79 * imagesScale > playerYStart &&
            enemies[i].y + 79 * imagesScale < playerYEnd;

        if (inRangeX && inRangeY) {

            if (currentTime - window.globalPlayerInvincibleTime > 2000) {
                if (typeof player.hp !== 'undefined') {
                    let dmg = applyDamageToPlayer(10);
                    window.globalPlayerInvincibleTime = currentTime;
                    console.log(`[DAMAGE APPLIED] Took ${dmg} damage! New HP: ${player.hp}`);
                }
            }

            enemiesPlayerCollision[i] = false;

            if (typeof enemyAttackAnimationFunction === 'function') {
                enemyAttackAnimationFunction(i);
            }

        } else {
            if (enemiesPlayerCollision[i] === false) {
                enemiesAnimationPosition[i] = 0;
            }
            enemiesPlayerCollision[i] = true;
        }
    }
}

// ==========================================
// ENEMY RANGED BULLETS vs PLAYER (new)
// ==========================================
function checkEnemyBulletPlayerCollisions() {
    if ((window.NovelEngine && window.NovelEngine.isActive) || window.playerDead === true) return;
    if (!player || typeof enemyBullets === 'undefined') return;

    let px = player.x + (player.width || 0) / 2;
    let py = player.y + (player.height || 0) / 2;
    let hitRadius = 55 * imagesScale;

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i];
        let dx = b.x - px;
        let dy = b.y - py;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hitRadius) {
            let dmg = applyDamageToPlayer(b.damage);
            console.log(`[ENEMY RANGED HIT] Took ${dmg} damage from ${b.enemyType}`);
            enemyBullets.splice(i, 1);
        }
    }
}
window.checkEnemyBulletPlayerCollisions = checkEnemyBulletPlayerCollisions;

// ==========================================
// ENEMY MOVEMENT
// (kept here for reference - the actual movement/AI logic now lives in
// enemy.js's moveEnemies(), which is what actually runs since enemy.js
// loads after this file)
// ==========================================