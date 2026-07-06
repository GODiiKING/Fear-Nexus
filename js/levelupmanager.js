// ==========================================
// LEVEL UP AND PROGRESSION SYSTEM
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

    // ADD THESE TWO FUNCTIONS HERE
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

/**
 * Progression logic for XP tracking
 */
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
        
        // Trigger the visual/pause logic
        LevelUpManager.open();
    },

    // REPLACED FUNCTION BELOW
    renderXpProgress() {
        const fillElement = document.getElementById("xp-fill");
        const textElement = document.getElementById("xp-text");
        
        // Defensive check: Only attempt to update if the elements exist
        if (!fillElement || !textElement) {
            return;
        }

        const progress = Math.min((this.currentXp / this.requiredXp) * 100, 100);
        fillElement.style.width = `${progress}%`;
        textElement.textContent = `Level ${this.currentLevel}`;
    }
};