"use strict";

window.abilitySystem = {
    data: {
        square: { charges: 3, maxCharges: 3, ids: ['ab1', 'ab2', 'ab3'], costType: 'hp', costAmount: 10 },
        triangle: { charges: 3, maxCharges: 3, ids: ['ab4', 'ab5', 'ab6'], costType: 'magic', costAmount: 15 }
    },
    debugText: "System Loaded...",

    // Counts successful HP-ability (square) casts, so Sanguine Aura can
    // proc on every 2nd use as described: "Every second health ability
    // activates an aura that damages nearby enemies."
    healthAbilityUseCount: 0,

    // Holds the current regen setInterval id so Time Warp can restart it
    // at a faster rate without stacking duplicate intervals.
    _regenInterval: null,

    handleKey: function(key) {
        console.log("System received key:", key);
        if (key === '1') this.use('square');
        if (key === '2') this.use('triangle');
    },

    use: function(type) {
        if (!canShoot || gameOver) return;

        let ability = this.data[type];
        if (ability.charges > 0) {

            // Health Cost Check
            if (ability.costType === 'hp') {
                if (player && player.hp !== undefined && player.hp >= ability.costAmount) {
                    player.hp -= ability.costAmount;

                    if (window.playerHealth !== undefined) {
                        window.playerHealth = player.hp;
                    }

                    if (window.hasLifesteal) {
                        console.log("Lifesteal weapon active HP deducted on launch");
                    }

                    // SANGUINE AURA: proc every 2nd HP-ability cast
                    if (window.hasSanguineAura) {
                        this.healthAbilityUseCount++;
                        if (this.healthAbilityUseCount % 2 === 0 && typeof window.triggerSanguineAura === 'function') {
                            window.triggerSanguineAura();
                        }
                    }
                } else {
                    console.log("Not enough health");
                    return;
                }
            }

            // Magic Cost Check
            if (ability.costType === 'magic') {
                if (player && player.magic !== undefined && player.magic >= ability.costAmount) {
                    player.magic -= ability.costAmount;

                    if (window.playerMagic !== undefined) {
                        window.playerMagic = player.magic;
                    }
                } else {
                    console.log("Not enough magic");
                    return;
                }
            }

            // Tag the shot about to fire so collisions.js can attribute a
            // resulting kill correctly: 'square' -> healthKills, 'triangle' -> magicKills.
            window.activeBulletType = type;

            ability.charges--;

            if (typeof executeProjectileLaunch === 'function') {
                executeProjectileLaunch();
            }

            window.abilitySystem.updateUI();
            this.debugText = `Used ${type}`;
            setTimeout(() => { this.debugText = ""; }, 1000);
        }
    },

    updateUI: function() {
        for (let type in this.data) {
            this.data[type].ids.forEach((id, index) => {
                let el = document.getElementById(id);
                if (el) {
                    el.style.opacity = (index < this.data[type].charges) ? "1" : "0.3";
                }
            });
        }
    },

    regen: function() {
        for (let type in this.data) {
            if (this.data[type].charges < this.data[type].maxCharges) {
                this.data[type].charges++;
            }
        }
        window.abilitySystem.updateUI();
    },

    // TIME WARP: recalculates the regen tick rate from PlayerStats.cooldownReduction
    // (0 to 0.5 range across 10 levels) and restarts the interval so purchases
    // take effect immediately instead of waiting for the old interval to cycle.
    applyCooldownReduction: function() {
        if (this._regenInterval) clearInterval(this._regenInterval);

        let reduction = (window.PlayerStats && window.PlayerStats.cooldownReduction) || 0;
        reduction = Math.min(reduction, 0.9); // safety clamp, never reach ~0ms
        let intervalMs = Math.max(1000, Math.floor(10000 * (1 - reduction)));

        this._regenInterval = setInterval(() => this.regen(), intervalMs);
    }
};

// Establishes the initial regen interval (10000ms with no Time Warp levels yet).
window.abilitySystem.applyCooldownReduction();