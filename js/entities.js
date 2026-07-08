"use strict";

// ==========================================
// COMPONENTS & RENDERING
// ==========================================

function Component(width, height, source, x, y, type, angle = 0) {
    this.type = type;
    this.angle = angle;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.imageLoaded = false;

    if (type === "image" || type === "grass") {
        this.image = new Image();
        this.image.src = source;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    } else if (type === "player") {
        this.image = new Image();
        this.image.src = playerSprite;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    this.update = function() {
        const ctx = GameArea.context;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        if (this.imageLoaded) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        if (type === "grass") {

            if (moveForward) {

                if (!shootAnimationOver) {
                    playerShootAnimationFunction();
                } else {
                    playerMovementAnimationFunction();
                }

                this.x -= movementSpeed * 10 * Math.cos(player.angle);
                this.y -= movementSpeed * 10 * Math.sin(player.angle);

                bullet1.x -= movementSpeed * Math.cos(bulletAngle);
                bullet1.y -= movementSpeed * Math.sin(bulletAngle);

                bullet2.x -= movementSpeed * Math.cos(bulletAngle);
                bullet2.y -= movementSpeed * Math.sin(bulletAngle);

                bullet3.x -= movementSpeed * Math.cos(bulletAngle);
                bullet3.y -= movementSpeed * Math.sin(bulletAngle);

                for (let i = 0; i < enemies.length; i++) {
                    enemies[i].x -= movementSpeed * Math.cos(player.angle);
                    enemies[i].y -= movementSpeed * Math.sin(player.angle);
                }

                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft();
                    currentMaxX += 1280;
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight();
                    currentMinX -= 1280;
                }

                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown();
                    currentMaxY += 720;
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp();
                    currentMinY -= 720;
                }

            } else if (moveBackwards) {

                if (!shootAnimationOver) {
                    playerShootAnimationFunction();
                } else {
                    playerMovementAnimationFunction();
                }

                this.x += movementSpeed * Math.cos(player.angle);
                this.y += movementSpeed * Math.sin(player.angle);

                bullet1.x += movementSpeed * Math.cos(bulletAngle);
                bullet1.y += movementSpeed * Math.sin(bulletAngle);

                bullet2.x += movementSpeed * Math.cos(bulletAngle);
                bullet2.y += movementSpeed * Math.sin(bulletAngle);

                bullet3.x += movementSpeed * Math.cos(bulletAngle);
                bullet3.y += movementSpeed * Math.sin(bulletAngle);

                for (let i = 0; i < enemies.length; i++) {
                    enemies[i].x += movementSpeed * Math.cos(player.angle);
                    enemies[i].y += movementSpeed * Math.sin(player.angle);
                }

                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft();
                    currentMaxX += 1280;
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight();
                    currentMinX -= 1280;
                }

                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown();
                    currentMaxY += 720;
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp();
                    currentMinY -= 720;
                }

            } else {

                if (shootAnimationOver) {
                    playerIdleAnimationFunction();
                } else {
                    playerShootAnimationFunction();
                }

            }
        }

        ctx.restore();
    };
}