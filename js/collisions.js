"use strict";

// ==========================================
// BULLET MOVEMENT
// ==========================================

function updateBullets() {

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

        if (bullet1.x > 1280) {
            canShoot = true;
        }
        else if (bullet1.x < 0) {
            canShoot = true;
        }
        else if (bullet1.y < 0) {
            canShoot = true;
        }
        else if (bullet1.y > 720) {
            canShoot = true;
        }
    }
}


// ==========================================
// BULLET HIT DETECTION
// ==========================================

function checkBulletCollisions() {

    for (let j = 0; j < bullets.length; j++) {

        for (let i = 0; i < enemies.length; i++) {

            let isHitX =
                bullets[j].x > enemies[i].x + 27 * imagesScale &&
                bullets[j].x < enemies[i].x + (27 + 206) * imagesScale;

            let isHitY =
                bullets[j].y > enemies[i].y + 77 * imagesScale &&
                bullets[j].y < enemies[i].y + (77 + 197) * imagesScale;

            if (isHitX && isHitY) {

                shootSound.pause();
                shootSound.currentTime = 0;
                shootSound.volume = 0.5;
                shootSound.play();

                alienDeathSound.volume = 0.9;

                if (alienDeathSound.paused) {
                    alienDeathSound.play();
                }

                let randomSpeak = Math.random();

                let soundToPlay =
                    randomSpeak < 0.33
                        ? alienSpeakSound
                        : (randomSpeak < 0.66
                            ? alienSpeakSound2
                            : alienSpeakSound3);

                soundToPlay.volume = 0.9;
                soundToPlay.play();

                enemies.splice(i, 1);
                enemiesWaitTime.splice(i, 1);
                enemiesAnimationPosition.splice(i, 1);
                enemiesPlayerCollision.splice(i, 1);

                score += 1;

                bullets[j].x = 9999;
                bullets[j].y = 9999;
            }
        }
    }

}


// ==========================================
// ENEMY TOUCHING PLAYER
// ==========================================

function checkEnemyPlayerCollisions() {

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

            enemiesPlayerCollision[i] = false;
            enemyAttackAnimationFunction(i);

        } else {

            if (enemiesPlayerCollision[i] === false) {
                enemiesAnimationPosition[i] = 0;
            }

            enemiesPlayerCollision[i] = true;
        }
    }

}


// ==========================================
// ENEMY MOVEMENT
// ==========================================

function moveEnemies() {

    for (let i = 0; i < enemies.length; i++) {

        if (enemiesPlayerCollision[i]) {

            let dx = enemies[i].x - player.x;
            let dy = enemies[i].y - player.y;

            let angleToPlayer = Math.atan2(dy, dx);

            enemies[i].angle = angleToPlayer + Math.PI;

            enemies[i].x -= movementSpeed * 5 * Math.cos(angleToPlayer);
            enemies[i].y -= movementSpeed * 5 * Math.sin(angleToPlayer);

            enemyMovementAnimationFunction(i);
        }

    }

}