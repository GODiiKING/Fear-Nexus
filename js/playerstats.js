// ==========================================
// FEAR NEXUS UNIFIED PROGRESSION SYSTEM
// ==========================================

window.PlayerStats = {
    // IN RUN PROGRESSION TARGETS
    level: 1,
    xp: 0,
    xpToNext: 20, // Baseline target requirement for first tier shift
    souls: 0,

    // CORE PLAYER STATS
    maxHealth: 100,
    maxMagic: 100,

    // METAGAME PERK TRACKERS
    healthRegen: 0,
    magicRegen: 0,
    damageMitigation: 0,
    cooldownReduction: 0,
    moveSpeedBonus: 0,
    attackSpeedBonus: 0,

    /**
     * Increments run experience points and handles leveling thresholds
     * @param {number} amount - The quantity of experience earned
     */
    addXP(amount) {
        this.xp = this.xp + amount;
        
        // Process multiple level shifts if huge experience drops occur
        while (this.xp >= this.xpToNext) {
            this.level++;
            this.xp = this.xp - this.xpToNext;
            
            // Scaling threshold per your design document requirements
            this.xpToNext = Math.floor(this.xpToNext * 1.5);

            // Stronger safety guard checks if the manager AND the open function exist
            if (typeof LevelUpManager !== "undefined" && typeof LevelUpManager.open === "function") {
                LevelUpManager.open();
            } else {
                console.log("[LEVEL UP] Character reached Level " + this.level + " but LevelUpManager.open() is not built yet.");
            }
        }
        
        // Physically update the green progress layout elements
        this.renderXpBar();
    },

    /**
     * Collects persistent currency drops from defeated entities
     * @param {number} amount - The number of souls harvested
     */
    addSouls(amount) {
        this.souls = this.souls + amount;
        
        // Physically update the interface numerical display tracker
        this.renderSoulCounter();
        console.log("[SOULS] Earned " + amount + " souls. Total: " + this.souls);
    },

    /**
     * Increases the maximum vitality pool for the current session loop
     */
    increaseHealth() {
        this.maxHealth = this.maxHealth + 20;
        if (typeof player !== "undefined") {
            player.hp = this.maxHealth;
        }
    },

    /**
     * Increases the maximum energy pool for the current session loop
     */
    increaseMagic() {
        this.maxMagic = this.maxMagic + 20;
        if (typeof player !== "undefined") {
            player.magic = this.maxMagic;
        }
    },

    /**
     * Controls the physical movement and text scale of your green UI element
     */
    renderXpBar() {
        const fillElement = document.getElementById("xp-fill");
        const textElement = document.getElementById("xp-text");
        
        if (!fillElement || !textElement) return;

        // Calculate filling percentage securely based on your variables
        const progressPercentage = Math.min((this.xp / this.xpToNext) * 100, 100);
        
        // Alter your style sheet width property directly
        fillElement.style.width = `${progressPercentage}%`;
        textElement.textContent = `Level ${this.level}`;
    },

    /**
     * Syncs your permanent currency variable with your display screen container
     */
    renderSoulCounter() {
        const soulDisplay = document.getElementById("hud-perks-count");
        if (soulDisplay) {
            soulDisplay.textContent = this.souls;
        }
    }
};

// ==========================================
// INTERFACE CONTROLLER FOR LEVEL REWARDS
// ==========================================

window.LevelUpManager = {
    /**
     * Pauses the battlefield view and displays your upgrade selections
     */
    open() {
        const panel = document.getElementById("levelup-panel");
        if (panel) {
            panel.classList.remove("hidden");
        }

        // HARD PAUSE: Clear the game interval loop instantly
        if (typeof gameInterval !== "undefined") {
            clearInterval(gameInterval);
            console.log("[GAME PAUSED] Update loop cleared for choice selection.");
        }
    },

    /**
     * Execution link tied directly to your health choice interaction buttons
     */
    chooseHealth() {
        console.log("Temporary run health points increased via panel choice");
        window.PlayerStats.increaseHealth();
        this.close();
    },

    /**
     * Execution link tied directly to your magic choice interaction buttons
     */
    chooseMagic() {
        console.log("Temporary run magic points increased via panel choice");
        window.PlayerStats.increaseMagic();
        this.close();
    },

    /**
     * Hides the screen overlay and returns control back to your game engine loops
     */
    close() {
        const panel = document.getElementById("levelup-panel");
        if (panel) {
            panel.classList.add("hidden");
        }

        // RESUME COMBAT: Restart the frame update cycle loop
        if (typeof updateGameArea === "function") {
            window.gameInterval = setInterval(updateGameArea, 20);
            console.log("[GAME RESUMED] Update loop restarted.");
        }
    }
};