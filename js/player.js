"use strict";

/**
 * Represents the player character entity.
 * Handles state, positioning, asset preloading, and internal animation cycles.
 */
export class player {
    constructor(imagesScale = 0.6) {
        this.imagesScale = imagesScale;
        this.width = 313 * this.imagesScale;
        this.height = 207 * this.imagesScale;
        
        // Exact horizontal and vertical centering layout from original setup
        this.x = 640 - (313 * this.imagesScale) / 2;
        this.y = 360 - (202 * this.imagesScale) / 2;
        
        this.type = "player";
        this.angle = 0;
        
        // Image setup and async load tracking
        this.image = new Image();
        this.image.src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };

        // Internalized frame counters and delays to prevent global variable pollution
        this.animIndex = 0;
        this.waitTime = 10;

        // Preload array allocations inside the module
        this.movementAnimation = [];
        this.preloadMovementFrames();

        this.shootAnimation = [];
        this.preloadShootFrames();

        this.idleAnimation = [];
        this.preloadIdleFrames();
    }

    /**
     * Preloads all 20 frames for the movement animation cycle.
     */
    preloadMovementFrames() {
        for (let i = 0; i < 20; i++) {
            const img = new Image();
            img.src = `images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/move/survivor-move_shotgun_${i}.png`;
            this.movementAnimation.push(img);
        }
    }

    /**
     * Preloads all 10 frames for the shooting animation cycle.
     */
    preloadShootFrames() {
        for (let i = 0; i < 10; i++) {
            const img = new Image();
            img.src = `images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/shoot/survivor-shoot_shotgun_${i}.png`;
            this.shootAnimation.push(img);
        }
    }

    /**
     * Preloads all 20 frames for the idle animation cycle.
     */
    preloadIdleFrames() {
        for (let i = 0; i < 20; i++) {
            const img = new Image();
            img.src = `images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_${i}.png`;
            this.idleAnimation.push(img);
        }
    }

    /**
     * Resets the pacing counters when transitioning between different state loops.
     */
    resetAnimationCounters(newWaitTime = 0) {
        this.animIndex = 0;
        this.waitTime = newWaitTime;
    }

    /**
     * Renders the entity tracking current frame mutations and angle translations onto the canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering environment target.
     */
    update(ctx) {
        ctx.save();
        // Pivot around the center point for seamless rotation tracking
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        if (this.imageLoaded) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.restore();
    }

    /**
     * Cycles through the running locomotion sequence frames.
     */
    animateMovement() {
        if (this.waitTime === 0) {
            this.image.src = this.movementAnimation[this.animIndex % this.movementAnimation.length].src;
            this.animIndex = (this.animIndex + 1) % this.movementAnimation.length;
            this.waitTime = 10;
        } else {
            this.waitTime--;
        }
    }

    /**
     * Cycles through muzzle flash/discharge sequence frames.
     * @param {Function} onAnimationComplete - Handoff callback execution triggered upon matching index sequence criteria.
     */
    animateShoot(onAnimationComplete) {
        if (this.waitTime === 0) {
            const targetFrameSrc = this.shootAnimation[this.animIndex % this.shootAnimation.length].src;
            this.image.src = targetFrameSrc;
            this.animIndex = (this.animIndex + 1) % this.shootAnimation.length;
            this.waitTime = 20;

            // Preserves original structural behavior: signals completion instantly upon hitting frame index 2
            if (targetFrameSrc === this.shootAnimation[2].src) {
                onAnimationComplete();
            }
        } else {
            this.waitTime--;
        }
    }

    /**
     * Cycles through passive idle breathing sequence frames.
     */
    animateIdle() {
        if (this.waitTime === 0) {
            this.image.src = this.idleAnimation[this.animIndex % this.idleAnimation.length].src;
            this.animIndex = (this.animIndex + 1) % this.idleAnimation.length;
            this.waitTime = 30;
        } else {
            this.waitTime--;
        }
    }
}