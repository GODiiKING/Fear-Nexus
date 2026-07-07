// ==========================================
// LEVEL UP MANAGER
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
// UPGRADE STORE MANAGER (🏪 Icon)
// ==========================================
window.UpgradeManager = {
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
        // Your logic for lifesteal, manasteal, or revival triggers goes here
        this.close();
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
// PERMANENT PERK STORE MANAGER (💀 Icon)
// ==========================================
window.PerkStoreManager = {
    open() {
        const panel = document.getElementById("perk-panel");
        if (panel) panel.classList.remove("hidden");
        
        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[PERK STORE OPEN] Game paused.");
        }
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

    buyPerk(perkType, cost) {
        if (typeof PlayerStats !== "undefined" && PlayerStats.souls >= cost) {
            PlayerStats.souls -= cost;
            console.log(`Purchased ${perkType} for ${cost} souls.`);
            
            if (perkType === "damage") PlayerStats.increaseDamage();
            if (perkType === "speed") PlayerStats.increaseSpeed();
            
            this.close();
        } else {
            console.log("Not enough souls available.");
        }
    },

    close() {
        const panel = document.getElementById("perk-panel");
        if (panel) panel.classList.add("hidden");

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval); 
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[PERK STORE CLOSED] Game resumed.");
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
