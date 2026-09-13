"use strict";

/*
UpgradeManager — full implementation
- Uses shared soul pool via window.PerkManager.souls (same as PerkManager)
- Writes cost text into DOM elements with IDs like cost-<key>
- Updates the shared HUD element hud-perks-count so values are visible
- Calls updateStoreUI after purchases and exposes addSoulsToPool helper
*/

window.UpgradeManager = {
    upgrades: {
        lifesteal: {
            name: "LIFESTEAL",
            desc: "Health abilities gain a baseline chance to restore health on enemy elimination",
            cost: 100,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.PlayerStats && window.PlayerStats.healthKills >= 2),
            apply() {
                window.hasLifesteal = true;
                console.log("Lifesteal unlocked");
            }
        },
        manasteal: {
            name: "MANASTEAL",
            desc: "Magic abilities gain a baseline chance to replenish spent mana on enemy elimination",
            cost: 100,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.PlayerStats && window.PlayerStats.magicKills >= 2),
            apply() {
                window.hasManasteal = true;
                console.log("Manasteal unlocked");
            }
        },
        revival: {
            name: "REVIVAL",
            desc: "Grants one automatic resurrection when health hits zero",
            cost: 150,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.RoundManager && window.RoundManager.round >= 1),
            apply() {
                window.hasRevival = true;
                console.log("Revival safety shield ready");
            }
        },
        sanguineAura: {
            name: "SANGUINE AURA",
            desc: "Every second health ability activates an aura that damages nearby enemies",
            cost: 200,
            level: 0,
            maxLevel: 1,
            requirement: () => !!window.hasLifesteal,
            apply() {
                window.hasSanguineAura = true;
                console.log("Sanguine Aura passive activated");
            }
        },
        manaZone: {
            name: "MANA ZONE",
            desc: "Remaining stationary for three seconds generates a localized projectile field",
            cost: 200,
            level: 0,
            maxLevel: 1,
            requirement: () => !!window.hasManasteal,
            apply() {
                window.hasManaZone = true;
                console.log("Mana Zone field presence activated");
            }
        },
        astra: {
            name: "ASTRA",
            desc: "Unlocks a powerful right-click special attack for catastrophic celestial damage",
            cost: 250,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.RoundManager && window.RoundManager.round >= 2),
            apply() {
                window.hasAstra = true;
                console.log("Astra cosmic alignment unlocked");
            }
        },
        asmodeus: {
            name: "ASMODEUS",
            desc: "Grants a permanent chance for an optional boss to appear, rewarding an instant level up on victory",
            cost: 300,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.PlayerStats && window.PlayerStats.kills >= 10),
            apply() {
                window.hasAsmodeus = true;
                console.log("Asmodeus pact initialized");
            }
        }
    },

    open() {
        const panel = document.getElementById("upgrade-panel") || document.getElementById("upgrade-store");
        if (panel) panel.classList.remove("hidden");

        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[UPGRADE STORE OPEN] Game paused.");
        }
        this.updateStoreUI();
    },

    toggleStore() {
        const panel = document.getElementById("upgrade-panel") || document.getElementById("upgrade-store");
        if (!panel) return;
        if (panel.classList.contains("hidden")) this.open(); else this.close();
    },

    close() {
        const panel = document.getElementById("upgrade-panel") || document.getElementById("upgrade-store");
        if (panel) panel.classList.add("hidden");

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval);
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[UPGRADE STORE CLOSED] Game resumed.");
        }
    },

    // inside window.UpgradeManager

buy(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return;

    const pool = window.PerkManager && typeof window.PerkManager.souls !== "undefined" ? window.PerkManager : null;
    if (!pool) {
        console.error("Shared soul pool (PerkManager) not available.");
        return;
    }

    // Validate requirement first (keeps UX consistent)
    if (!upgrade.requirement()) {
        console.log("Unlock prerequisites not achieved yet");
        return;
    }

    if (pool.souls >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
        // Deduct cost and apply upgrade
        pool.souls -= upgrade.cost;
        upgrade.level++;
        upgrade.apply();

        // Scale cost for future ranks (if any)
        upgrade.cost = Math.floor(upgrade.cost * 1.25);

        // Force all UI refreshes immediately
        if (window.PlayerStats && typeof window.PlayerStats.renderSoulCounter === "function") {
            window.PlayerStats.renderSoulCounter();
        }
        if (window.PerkStoreManager && typeof window.PerkStoreManager.updateUI === "function") {
            window.PerkStoreManager.updateUI();
        }

        // IMPORTANT: update this store UI last so DOM reflects new level/cost
        if (typeof this.updateStoreUI === "function") {
            this.updateStoreUI();
        }

        console.log(`[UPGRADE PURCHASED] ${upgrade.name} -> rank ${upgrade.level}`);
    } else {
        if (upgrade.level >= upgrade.maxLevel) {
            console.log(`${upgrade.name} is already maxed out.`);
        } else {
            console.log("Not enough souls available to unlock this upgrade.");
        }
    }
},

selectUpgrade(id) {
    const upgrade = this.upgrades[id];
    if (!upgrade) return;

    // Validate requirement first
    if (!upgrade.requirement()) {
        console.log("Unlock prerequisites not achieved yet");
        return;
    }

    // Try to buy; buy() will update UI
    this.buy(id);

    // Keep previous UX: close store after purchase
    this.close();

    // Ensure UI is refreshed after close as well
    if (typeof this.updateStoreUI === "function") {
        this.updateStoreUI();
    }
},


    selectUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        if (!upgrade.requirement()) {
            console.log("Unlock prerequisites not achieved yet");
            return;
        }

        const pool = window.PerkManager && typeof window.PerkManager.souls !== "undefined" ? window.PerkManager : null;
        if (!pool) {
            console.error("Shared soul pool (PerkManager) not available.");
            return;
        }

        if (pool.souls >= upgrade.cost) {
            this.buy(id);
            this.close();
        } else {
            console.log("Not enough souls available to unlock this upgrade.");
        }
    },

    updateStoreUI() {
    // Use the same HUD element PerkStoreManager uses
    const hudCount = document.getElementById("hud-perks-count");
    const poolSouls = window.PerkManager && typeof window.PerkManager.souls !== "undefined"
        ? window.PerkManager.souls
        : (window.PlayerStats && window.PlayerStats.souls) || 0;

    if (hudCount) hudCount.innerText = poolSouls;

    Object.keys(this.upgrades).forEach(key => {
        const upgrade = this.upgrades[key];
        const costBadge = document.getElementById(`cost-${key}`);
        const levelText = document.getElementById(`level-${key}`);
        const cardElement = document.getElementById(`card-${key}`);

        // cost and level only — no status badge handling
        if (costBadge) {
            costBadge.innerText = upgrade.level >= upgrade.maxLevel ? "UNLOCKED" : `${upgrade.cost} Souls`;
        }
        if (levelText) {
            levelText.innerText = `Rank: ${upgrade.level}/${upgrade.maxLevel}`;
        }

        if (cardElement) {
            if (upgrade.level >= upgrade.maxLevel) cardElement.classList.add("maxed-perk");
            else cardElement.classList.remove("maxed-perk");
        }
    });
}
};

// Helper to add souls into the shared pool and refresh UI
window.UpgradeManager.addSoulsToPool = function(amount) {
    if (window.PerkManager && typeof window.PerkManager.addSouls === "function") {
        window.PerkManager.addSouls(amount);
    } else if (window.PerkManager) {
        window.PerkManager.souls = (window.PerkManager.souls || 0) + amount;
        if (typeof window.UpgradeManager.updateStoreUI === "function") {
            window.UpgradeManager.updateStoreUI();
        }
    }
};
