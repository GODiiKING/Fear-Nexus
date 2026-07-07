window.PerkManager = {
    souls: 0,
    trees: {
        healthRegen: {
            name: "Celestial Vitality",
            desc: "Regenerate health passively over time",
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                // Active core functionality: scales linearly with level
                // Example: Level 1 = 1 HP/5s, Level 16 = 16 HP/5s
                PlayerStats.healthRegen = this.level; 
            }
        },
        magicRegen: {
            name: "Astral Attunement",
            desc: "Regenerate mana points over time",
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                // Placeholder logic for next implementation phase
                PlayerStats.magicRegen = this.level;
            }
        },
        mobDamage: {
            name: "Horde Cleaver",
            desc: "Deal increased permanent strike damage to standard minions",
            cost: 120,
            level: 0,
            maxLevel: 16,
            apply() {
                // Placeholder logic
                PlayerStats.mobDamageBonus = this.level * 1; 
            }
        },
        bossDamage: {
            name: "Titan Slayer",
            desc: "Deal increased permanent strike damage against catastrophic bosses",
            cost: 150,
            level: 0,
            maxLevel: 16,
            apply() {
                // Placeholder logic
                PlayerStats.bossDamageBonus = this.level * 2;
            }
        },
        damageMitigation: {
            name: "Cosmic Shell",
            desc: "Permanently mitigate a percentage of incoming enemy damage",
            cost: 150,
            level: 0,
            maxLevel: 10,
            apply() {
                // Placeholder logic
                PlayerStats.damageMitigation = this.level * 0.05;
            }
        },
        cooldownReduction: {
            name: "Time Warp",
            desc: "Accelerate cosmic ability reload frequencies",
            cost: 200,
            level: 0,
            maxLevel: 10,
            apply() {
                // Placeholder logic
                PlayerStats.cooldownReduction = this.level * 0.05;
            }
        },
        xpGain: {
            name: "Starlight Wisdom",
            desc: "Amplify total combat experience acquisition values",
            cost: 120,
            level: 0,
            maxLevel: 10,
            apply() {
                // Placeholder logic
                PlayerStats.xpMultiplier = 1 + (this.level * 0.05);
            }
        }
    },

    addSouls(amount) {
        this.souls += amount;
        if (window.PerkStoreManager && typeof window.PerkStoreManager.updateUI === "function") {
            window.PerkStoreManager.updateUI();
        }
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
            
            // Refresh layout elements smoothly
            if (window.PerkStoreManager && typeof window.PerkStoreManager.updateUI === "function") {
                window.PerkStoreManager.updateUI();
            }
        }
    }
};

// Interface binding proxy to prevent breaking HUD toggle functions
window.PerkStoreManager = {
    toggleStore() {
        const panel = document.getElementById("perk-panel");
        if (panel) {
            panel.classList.toggle("hidden");
            this.updateUI();
        }
    },
    buyPerk(treeName) {
        window.PerkManager.buy(treeName);
    },
    updateUI() {
        // Update HUD display token value
        const hudCount = document.getElementById("hud-perks-count");
        if (hudCount) {
            hudCount.innerText = window.PerkManager.souls;
        }

        // Dynamically update the HTML cards to match the true state values
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
                cardElement.classList.add("maxed-perk"); // CSS Hook for visually locked elements
            }
        });
    }
};