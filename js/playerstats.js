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

    // Kill counters used by UpgradeManager.requirement()
    healthKills: 0,   // kills scored via the HP-cost (square) ability -> Lifesteal
    magicKills: 0,    // kills scored via the magic-cost (triangle) ability -> Manasteal
    kills: 0,         // ALL kills, any source -> Asmodeus (PlayerStats.kills >= 10)

    /**
     * Increments run experience points and handles leveling thresholds
     * @param {number} amount - The quantity of experience earned
     */
    addXP(amount) {
        this.xp = this.xp + amount;

        while (this.xp >= this.xpToNext) {
            this.level++;
            this.xp = this.xp - this.xpToNext;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);

            if (typeof LevelUpManager !== "undefined" && typeof LevelUpManager.open === "function") {
                LevelUpManager.open();
            } else {
                console.log("[LEVEL UP] Character reached Level " + this.level + " but LevelUpManager.open() is not built yet.");
            }
        }

        this.renderXpBar();
    },

    /**
     * Collects persistent currency drops from defeated entities
     * @param {number} amount - The number of souls harvested
     */
    addSouls(amount) {
        this.souls = this.souls + amount;

        this.renderSoulCounter();
        console.log("[SOULS] Earned " + amount + " souls. Total: " + this.souls);

        if (window.UpgradeManager && typeof window.UpgradeManager.updateStoreUI === "function") {
            try {
                window.UpgradeManager.updateStoreUI();
            } catch (e) {
                console.warn("[UpgradeManager] updateStoreUI() threw:", e);
            }
        }

        if (window.PerkStoreManager && typeof window.PerkStoreManager.updateUI === "function") {
            try {
                window.PerkStoreManager.updateUI();
            } catch (e) {
                console.warn("[PerkStoreManager] updateUI() threw:", e);
            }
        }
    },

    increaseHealth() {
        this.maxHealth = this.maxHealth + 20;
        if (typeof player !== "undefined") {
            player.hp = this.maxHealth;
        }
    },

    increaseMagic() {
        this.maxMagic = this.maxMagic + 20;
        if (typeof player !== "undefined") {
            player.magic = this.maxMagic;
        }
    },

    renderXpBar() {
        const fillElement = document.getElementById("xp-fill");
        const textElement = document.getElementById("xp-text");
        if (!fillElement || !textElement) return;

        const progressPercentage = Math.min((this.xp / this.xpToNext) * 100, 100);
        fillElement.style.width = `${progressPercentage}%`;
        textElement.textContent = `Level ${this.level}`;
    },

    renderSoulCounter() {
        const soulDisplay = document.getElementById("hud-perks-count");
        if (soulDisplay) {
            soulDisplay.textContent = this.souls;
        }
        // Keep the upgrade-store HUD badge in sync too - same pool.
        if (window.refreshSoulHUDs) window.refreshSoulHUDs();
    }
};

// NOTE: LevelUpManager used to be duplicated here with a different
// implementation. levelupmanager.js loads after this file and overwrites
// window.LevelUpManager, so the old copy here never actually ran - it was
// dead code. LevelUpManager now lives only in levelupmanager.js.