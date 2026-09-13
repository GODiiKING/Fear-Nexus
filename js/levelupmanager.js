"use strict";

/*
==============================================================
 SINGLE SOURCE OF TRUTH: window.PlayerStats.souls
 Both the Perk Store and the Upgrade Store read/write through
 it — there is only one soul pool.
==============================================================
*/

// Refreshes BOTH HUD soul badges (🏪 upgrades and 💀 perks) from the
// single shared pool. Call this any time souls change, from either store.
function refreshSoulHUDs() {
    const souls = window.PlayerStats ? window.PlayerStats.souls : 0;
    const perksHud = document.getElementById("hud-perks-count");
    const upgradesHud = document.getElementById("hud-upgrades-count");
    if (perksHud) perksHud.innerText = souls;
    if (upgradesHud) upgradesHud.innerText = souls;
}
window.refreshSoulHUDs = refreshSoulHUDs;

window.PerkManager = {
    get souls() {
        return window.PlayerStats ? window.PlayerStats.souls : 0;
    },
    set souls(val) {
        if (window.PlayerStats) window.PlayerStats.souls = val;
    },

    trees: {
        healthRegen: {
            name: "Celestial Vitality",
            desc: "Regenerate health passively over time",
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                if (window.PlayerStats) window.PlayerStats.healthRegen = this.level;
            }
        },
        magicRegen: {
            name: "Astral Attunement",
            desc: "Regenerate mana points over time",
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                if (window.PlayerStats) window.PlayerStats.magicRegen = this.level;
            }
        },
        mobDamage: {
            name: "Horde Cleaver",
            desc: "Deal increased permanent strike damage to standard minions",
            cost: 120,
            level: 0,
            maxLevel: 16,
            apply() {
                if (window.PlayerStats) window.PlayerStats.mobDamageBonus = this.level * 1;
            }
        },
        bossDamage: {
            name: "Titan Slayer",
            desc: "Deal increased permanent strike damage against catastrophic bosses",
            cost: 150,
            level: 0,
            maxLevel: 16,
            apply() {
                if (window.PlayerStats) window.PlayerStats.bossDamageBonus = this.level * 2;
            }
        },
        damageMitigation: {
            name: "Cosmic Shell",
            desc: "Permanently mitigate a percentage of incoming enemy damage",
            cost: 150,
            level: 0,
            maxLevel: 10,
            apply() {
                if (window.PlayerStats) window.PlayerStats.damageMitigation = this.level * 0.05;
            }
        },
        cooldownReduction: {
            name: "Time Warp",
            desc: "Accelerate cosmic ability reload frequencies",
            cost: 200,
            level: 0,
            maxLevel: 10,
            apply() {
                if (window.PlayerStats) window.PlayerStats.cooldownReduction = this.level * 0.05;
            }
        },
        xpGain: {
            name: "Starlight Wisdom",
            desc: "Amplify total combat experience acquisition values",
            cost: 120,
            level: 0,
            maxLevel: 10,
            apply() {
                if (window.PlayerStats) window.PlayerStats.xpMultiplier = 1 + (this.level * 0.05);
            }
        }
    },

    addSouls(amount) {
        if (window.PlayerStats && typeof window.PlayerStats.addSouls === "function") {
            window.PlayerStats.addSouls(amount);
        } else {
            this.souls += amount;
        }
        window.PerkStoreManager.updateUI();
    },

    buy(treeName) {
        let tree = this.trees[treeName];
        if (!tree) return;

        if (this.souls >= tree.cost && tree.level < tree.maxLevel) {
            this.souls -= tree.cost;
            tree.level++;
            tree.apply();
            tree.cost = Math.floor(tree.cost * 1.25);

            if (window.PlayerStats && typeof window.PlayerStats.renderSoulCounter === "function") {
                window.PlayerStats.renderSoulCounter();
            }

            window.PerkStoreManager.updateUI();

            // Keep the Upgrade Store's HUD badge + lock states in sync too -
            // both stores share this same soul pool.
            if (window.UpgradeManager && typeof window.UpgradeManager.updateStoreUI === "function") {
                window.UpgradeManager.updateStoreUI();
            }

            console.log(`[PERK PURCHASED] ${tree.name} upgraded to rank ${tree.level}`);
        } else {
            console.log("Not enough souls available or perk maxed out.");
        }
    }
};

window.PerkStoreManager = {
    open() {
        const panel = document.getElementById("perk-panel");
        if (panel) panel.classList.remove("hidden");

        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[PERK STORE OPEN] Game paused.");
        }

        this.updateUI();
    },

    toggleStore() {
        const panel = document.getElementById("perk-panel");
        if (panel) {
            if (panel.classList.contains("hidden")) {
                this.open();
            } else {
                this.close();
            }
        }
    },

    buyPerk(treeName) {
        window.PerkManager.buy(treeName);
    },

    close() {
        const panel = document.getElementById("perk-panel");
        if (panel) panel.classList.add("hidden");

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval);
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[PERK STORE CLOSED] Game resumed.");
        }
    },

    updateUI() {
        refreshSoulHUDs();

        Object.keys(window.PerkManager.trees).forEach(key => {
            const tree = window.PerkManager.trees[key];
            const costBadge = document.getElementById(`cost-${key}`);
            const levelText = document.getElementById(`level-${key}`);
            const cardElement = document.getElementById(`card-${key}`);
            const isMaxed = tree.level >= tree.maxLevel;

            if (costBadge) {
                costBadge.innerText = isMaxed ? "MAXED" : `${tree.cost} Souls`;
            }
            if (levelText) {
                levelText.innerText = `Rank: ${tree.level}/${tree.maxLevel}`;
            }
            if (cardElement) {
                cardElement.classList.toggle("maxed-perk", isMaxed);
            }
        });
    }
};

window.LevelUpManager = {
    open() {
        const panel = document.getElementById("levelup-panel");
        if (panel) panel.classList.remove("hidden");

        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[GAME PAUSED] Loop stopped.");
        }
    },

    chooseHealth() {
        console.log("Vitality pool expanded plus 20 points");
        if (typeof PlayerStats !== "undefined") {
            PlayerStats.increaseHealth();
        }
        this.close();
    },

    chooseMagic() {
        console.log("Mana reservoir expanded plus 20 points");
        if (typeof PlayerStats !== "undefined") {
            PlayerStats.increaseMagic();
        }
        this.close();
    },

    close() {
        const panel = document.getElementById("levelup-panel");
        if (panel) panel.classList.add("hidden");

        if (typeof enemies !== "undefined") {
            enemies.forEach(enemy => {
                enemy.lastHitTime = Date.now();
            });
        }

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval);
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[GAME RESUMED] Timers reset and loop restarted.");
        }
    }
};

window.UpgradeManager = {
    upgrades: {
        lifesteal: {
            name: "LIFESTEAL",
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
            cost: 150,
            level: 0,
            maxLevel: 1,
            requirement: () => !!(window.RoundManager && window.RoundManager.round >= 1),
            apply() {
                window.hasRevival = true;
                window.revivalConsumed = false;
                console.log("Revival safety shield ready");
            }
        },
        sanguineAura: {
            name: "SANGUINE AURA",
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
        const panel = document.getElementById("upgrade-panel");
        if (panel) panel.classList.remove("hidden");

        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[UPGRADE STORE OPEN] Game paused.");
        }

        this.updateStoreUI();
    },

    toggleStore() {
        const panel = document.getElementById("upgrade-panel");
        if (panel) {
            if (panel.classList.contains("hidden")) {
                this.open();
            } else {
                this.close();
            }
        }
    },

    selectUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return;

        if (!upgrade.requirement()) {
            console.log(`[LOCKED] ${upgrade.name} requirement not yet met.`);
            return;
        }

        const pool = window.PlayerStats;
        if (!pool) {
            console.error("PlayerStats not available - cannot process purchase.");
            return;
        }

        if (pool.souls >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
            pool.souls -= upgrade.cost;
            upgrade.level++;

            // apply() must run before any UI refresh below, so cards that
            // depend on this one (e.g. Sanguine Aura needs hasLifesteal)
            // reflect the new state immediately, without reopening the panel.
            upgrade.apply();

            if (typeof pool.renderSoulCounter === "function") {
                pool.renderSoulCounter();
            }

            this.updateStoreUI();
            if (window.PerkStoreManager && typeof window.PerkStoreManager.updateUI === "function") {
                window.PerkStoreManager.updateUI();
            }

            console.log(`[UPGRADE PURCHASED] ${upgrade.name} -> rank ${upgrade.level}`);
        } else if (upgrade.level >= upgrade.maxLevel) {
            console.log(`${upgrade.name} is already unlocked.`);
        } else {
            console.log("Not enough souls to purchase this upgrade.");
        }
    },

    close() {
        const panel = document.getElementById("upgrade-panel");
        if (panel) panel.classList.add("hidden");

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval);
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[UPGRADE STORE CLOSED] Game resumed.");
        }
    },

    updateStoreUI() {
        refreshSoulHUDs();

        Object.keys(this.upgrades).forEach(key => {
            const upgrade = this.upgrades[key];
            const costBadge = document.getElementById(`cost-${key}`);
            const levelText = document.getElementById(`level-${key}`);
            const cardElement = document.getElementById(`card-${key}`);

            const isMaxed = upgrade.level >= upgrade.maxLevel;
            const meetsRequirement = upgrade.requirement();

            if (costBadge) {
                if (isMaxed) costBadge.innerText = "UNLOCKED";
                else if (!meetsRequirement) costBadge.innerText = "LOCKED";
                else costBadge.innerText = `${upgrade.cost} Souls`;
            }

            if (levelText) {
                levelText.innerText = `Rank: ${upgrade.level}/${upgrade.maxLevel}`;
            }

            if (cardElement) {
                cardElement.classList.toggle("maxed-perk", isMaxed);
                cardElement.classList.toggle("locked-upgrade", !isMaxed && !meetsRequirement);
            }
        });
    }
};

// Initialize HUD + store visuals as soon as this file loads, so badges
// never sit on placeholder text before the first purchase/kill happens.
refreshSoulHUDs();
window.UpgradeManager.updateStoreUI();
window.PerkStoreManager.updateUI();