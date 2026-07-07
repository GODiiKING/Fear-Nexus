"use strict";

window.UpgradeManager = {
    unlocked: {},
    upgrades: {
        lifesteal: {
            id: "lifesteal",
            requirement: () => {
                // Safeguard against undefined stats: evaluates true only if kills are 2 or more
                return !!(window.PlayerStats && window.PlayerStats.healthKills >= 2);
            },
            apply: () => { 
                window.hasLifesteal = true; 
                console.log("Lifesteal unlocked");
            }
        },
        manasteal: {
            id: "manasteal",
            requirement: () => {
                return !!(window.PlayerStats && window.PlayerStats.magicKills >= 2);
            },
            apply: () => { 
                window.hasManasteal = true; 
                console.log("Manasteal unlocked");
            }
        },
        revival: {
            id: "revival",
            requirement: () => {
                return !!(window.RoundManager && window.RoundManager.round >= 1);
            },
            apply: () => { 
                window.hasRevival = true; 
                console.log("Revival safety shield ready");
            }
        },
        sanguineAura: {
            id: "sanguineAura",
            requirement: () => {
                // Requires lifesteal to be active first
                return !!window.hasLifesteal;
            },
            apply: () => {
                window.hasSanguineAura = true;
                console.log("Sanguine Aura passive activated");
            }
        },
        manaZone: {
            id: "manaZone",
            requirement: () => {
                // Requires manasteal to be active first
                return !!window.hasManasteal;
            },
            apply: () => {
                window.hasManaZone = true;
                console.log("Mana Zone field presence activated");
            }
        },
        astra: {
            id: "astra",
            requirement: () => {
                return !!(window.RoundManager && window.RoundManager.round >= 2);
            },
            apply: () => {
                window.hasAstra = true;
                console.log("Astra cosmic alignment unlocked");
            }
        },
        asmodeus: {
            id: "asmodeus",
            requirement: () => {
                return !!(window.PlayerStats && window.PlayerStats.kills >= 10);
            },
            apply: () => {
                window.hasAsmodeus = true;
                console.log("Asmodeus pact initialized");
            }
        }
    },

    toggleStore() {
        const panel = document.getElementById("upgrade-panel") || document.getElementById("upgrade-store");
        
        if (!panel) {
            console.error("Shop layout element not found in the DOM structure");
            return;
        }

        panel.classList.toggle("hidden");

        if (panel.classList.contains("hidden")) {
            panel.style.display = "none"; // Fixed the double style typo here
        } else {
            panel.style.display = "block";
            if (typeof this.updateStoreUI === "function") {
                this.updateStoreUI();
            }
        }
    },

    selectUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        if (upgrade.requirement()) {
            upgrade.apply();
            this.toggleStore(); 
        } else {
            console.log("Unlock prerequisites not achieved yet");
        }
    }
};

window.LevelUpManager = {
    chooseHealth() {
        if (window.player) {
            if (window.player.maxHp === undefined) {
                window.player.maxHp = 100;
            }
            window.player.maxHp += 20;
            window.player.hp = window.player.maxHp;
            console.log("Vitality expanded to " + window.player.maxHp);
        }
        this.dismissPanel();
    },

    chooseMagic() {
        if (window.player) {
            if (window.player.maxMagic === undefined) {
                window.player.maxMagic = 100;
            }
            window.player.maxMagic += 20;
            window.player.magic = window.player.maxMagic;
            console.log("Arcane reservoir expanded to " + window.player.maxMagic);
        }
        this.dismissPanel();
    },

    dismissPanel() {
        const panel = document.getElementById("levelup-panel");
        if (panel) {
            panel.classList.add("hidden");
            panel.style.display = "none";
        }
    }
};

window.PerkStoreManager = {
    open() {
        const panel = document.getElementById("perk_store_panel");
        if (panel) panel.classList.remove("hidden");
        
        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("[PERK STORE OPEN] Game paused.");
        }
    },

    toggleStore() {
        const panel = document.getElementById("perk_store_panel");
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
        const panel = document.getElementById("perk_store_panel");
        if (panel) panel.classList.add("hidden");

        if (typeof GameArea !== "undefined") {
            clearInterval(GameArea.interval); 
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("[PERK STORE CLOSED] Game resumed.");
        }
    }
};

// Initialize the regen loop
setInterval(() => {
    if (window.abilitySystem && typeof window.abilitySystem.regen === "function") {
        window.abilitySystem.regen();
    }
}, 10000);