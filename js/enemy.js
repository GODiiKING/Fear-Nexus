"use strict";

/**
 * Base class for all hostile entities.
 * Handles foundational properties like positioning, rendering, and base state.
 */
export class enemy {
    constructor(x, y, width, height, type, initialSprite) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.angle = 0;
        
        // Image setup and async load tracking
        this.image = new Image();
        this.image.src = initialSprite;
        this.imageLoaded = false;
        this.image.onload = () => { 
            this.imageLoaded = true; 
        };

        // Encapsulated state tracking variables (replacing your old parallel arrays)
        this.waitTime = 5;
        this.animationPosition = 0;
        
        // True means NO collision yet, matching your original logic
        this.playerCollision = true; 
    }

    /**
     * Renders the enemy on the canvas context with rotational tracking.
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
}