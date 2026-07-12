"use strict";

import { enemy } from './enemy.js';

/**
 * Represents a specialized hostile entity (Demon/Zombie).
 * Extends the base enemy class with tracking AI and specialized animations.
 */
export class demon extends enemy {
    constructor(x, y, scale, zombieSprite) {
        // Pass base properties up to the parent 'enemy' class
        super(x, y, 288 * scale, 311 * scale, "demon", zombieSprite);
        
        this.scale = scale;
        // Calculated from your original procedural 'movementSpeed * 5'
        this.baseSpeed = 0.5 * 5; 
    }

    /**
     * Calculates the angle to the player and moves the demon towards them using trigonometry.
     * @param {number} playerX - The player's current X coordinate.
     * @param {number} playerY - The player's current Y coordinate.
     */
    moveTowardsPlayer(playerX, playerY) {
        // Calculate the angle between the demon and the player
        this.angle = Math.atan2(this.y - playerY, this.x - playerX) + Math.PI;
        
        // Update position using sine and cosine for fluid directional movement
        this.x -= this.baseSpeed * Math.cos(Math.atan2(this.y - playerY, this.x - playerX));
        this.y -= this.baseSpeed * Math.sin(Math.atan2(this.y - playerY, this.x - playerX));
    }

    /**
     * Cycles through the running/walking sequence frames.
     * @param {Array} frames - The preloaded array of movement images.
     */
    animateMovement(frames) {
        if (this.waitTime === 0) {
            this.image.src = frames[this.animationPosition % frames.length].src;
            this.animationPosition = (this.animationPosition + 1) % frames.length;
            this.waitTime = 5; // Reset delay based on your original logic
        } else {
            this.waitTime--;
        }
    }

    /**
     * Cycles through the striking sequence frames and validates collision damage.
     * @param {Array} frames - The preloaded array of attack images.
     * @param {Function} onStrike - Callback triggered if the attack animation completes while in collision.
     */
    animateAttack(frames, onStrike) {
        if (this.waitTime === 0) {
            this.image.src = frames[this.animationPosition % frames.length].src;
            this.animationPosition = (this.animationPosition + 1) % frames.length;
            this.waitTime = 5;

            // Check if we hit the specific attack frame (index 6) from your original logic
            if (this.image.src === frames[6].src) {
                // If the collision flag is false (meaning they are currently touching the player)
                if (this.playerCollision === false) {
                    onStrike(); // Triggers Game Over sequence in the main loop
                }
            }
        } else {
            this.waitTime--;
        }
    }
}