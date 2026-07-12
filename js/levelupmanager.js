"use strict";

// ==========================================
// METAGAME PERK DATA & MANAGEMENT
// ==========================================
window.PerkManager = {
    // We point this directly to PlayerStats via getter/setter to avoid duplication bugs!
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
            
            // Post purchase cost scaling mechanics
            tree.cost = Math.floor(tree.cost * 1.25);
            
            // Sync display layouts completely
            if (window.PlayerStats && typeof window.PlayerStats.renderSoulCounter === "function") {
                window.PlayerStats.renderSoulCounter();
            }
            window.PerkStoreManager.updateUI();
            console.log(`[PERK PURCHASED] ${tree.name} upgraded to rank ${tree.level}`);
        } else {
            console.log("Not enough souls available or perk maxed out.");
        }
    }
};

// ==========================================
// UNIFIED PERMANENT PERK STORE MANAGER
// ==========================================
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
        // Routes card selection directly through the scaling pricing architecture above
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
        // Synchronize display text directly with current core global currency state
        const hudCount = document.getElementById("hud-perks-count");
        if (hudCount) {
            hudCount.innerText = window.PerkManager.souls;
        }

        // Dynamically iterate through cards to adjust badges, ranks and maxed conditions
        Object.keys(window.PerkManager.trees).forEach(key => {
            const tree = window.PerkManager.trees[key];
            const costBadge = document.getElementById(`cost-${key}`);
            const levelText = document.getElementById(`level-${key}`);
            const cardElement = document.getElementById(`card-${key}`);

            if (costBadge) {
                costBadge.innerText = tree.level >= tree.maxLevel ? "MAXED" : `${tree.cost} Souls`;
            }
            if (levelText) {
                levelText.innerText = `Rank: ${tree.level}/${tree.maxLevel}`;
            }
            if (cardElement && tree.level >= tree.maxLevel) {
                cardElement.classList.add("maxed-perk"); 
            }
        });
    }
};

// ==========================================
// IN-RUN LEVEL UP SELECTION MANAGER
// ==========================================
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

// ==========================================
// TEMPORARY RUN UPGRADE STORE MANAGER (🏪)
// ==========================================
window.UpgradeManager = {
    // Define the specific gating data for each mod
    upgrades: {
        lifesteal: {
            requirement: () => !!(window.PlayerStats && window.PlayerStats.healthKills >= 2),
            apply: () => { window.hasLifesteal = true; console.log("Lifesteal unlocked"); }
        },
        manasteal: {
            requirement: () => !!(window.PlayerStats && window.PlayerStats.magicKills >= 2),
            apply: () => { window.hasManasteal = true; console.log("Manasteal unlocked"); }
        },
        revival: {
            requirement: () => !!(window.RoundManager && window.RoundManager.round >= 1),
            apply: () => { window.hasRevival = true; console.log("Revival safety shield ready"); }
        },
        sanguineAura: {
            requirement: () => !!window.hasLifesteal,
            apply: () => { window.hasSanguineAura = true; console.log("Sanguine Aura passive activated"); }
        },
        manaZone: {
            requirement: () => !!window.hasManasteal,
            apply: () => { window.hasManaZone = true; console.log("Mana Zone field presence activated"); }
        },
        astra: {
            requirement: () => !!(window.RoundManager && window.RoundManager.round >= 2),
            apply: () => { window.hasAstra = true; console.log("Astra cosmic alignment unlocked"); }
        },
        asmodeus: {
            requirement: () => !!(window.PlayerStats && window.PlayerStats.kills >= 10),
            apply: () => { window.hasAsmodeus = true; console.log("Asmodeus pact initialized"); }
        }
    },

    open() {
        const panel = document.getElementById("upgrade-panel");
        if (panel) panel.classList.remove("hidden");
        
        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[UPGRADE STORE OPEN] Game paused.");
        }
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

    selectUpgrade(upgradeType) {
        console.log(`Selected upgrade modifier: ${upgradeType}`);
        const upgrade = this.upgrades[upgradeType];
        
        if (!upgrade) {
            this.close();
            return;
        }

        // Validate the tracking variables before executing the unlock
        if (upgrade.requirement()) {
            upgrade.apply();
            this.close();
        } else {
            console.log("Unlock prerequisites not achieved yet");
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
    }
};

// ==========================================
// PLAYER PROGRESSION TRACKING
// ==========================================
const PlayerProgression = {
    currentLevel: 1,
    currentXp: 0,
    requiredXp: 100,

    gainExperience(amount) {
        this.currentXp += amount;
        while (this.currentXp >= this.requiredXp) {
            this.triggerLevelUp();
        }
        this.renderXpProgress();
    },

    triggerLevelUp() {
        this.currentXp -= this.requiredXp;
        this.currentLevel += 1;
        this.requiredXp = Math.floor(this.requiredXp * 1.5);
        
        LevelUpManager.open();
    },

    renderXpProgress() {
        const fillElement = document.getElementById("xp-fill");
        const textElement = document.getElementById("xp-text");
        
        if (!fillElement || !textElement) {
            return;
        }

        const progress = Math.min((this.currentXp / this.requiredXp) * 100, 100);
        fillElement.style.width = `${progress}%`;
        textElement.textContent = `Level ${this.currentLevel}`;
    }
};