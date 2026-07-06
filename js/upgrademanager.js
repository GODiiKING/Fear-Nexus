window.UpgradeManager = {
    unlocked: {},
    upgrades: {
        lifesteal: {
            id: "lifesteal",
            requirement: () => PlayerStats.healthKills >= 2,
            apply: () => { window.hasLifesteal = true; }
        },
        manasteal: {
            id: "manasteal",
            requirement: () => PlayerStats.magicKills >= 2,
            apply: () => { window.hasManasteal = true; }
        },
        revival: {
            id: "revival",
            requirement: () => RoundManager.round >= 1,
            apply: () => { window.hasRevival = true; }
        }
    },

    open() {
        gamePaused = true;
        document.getElementById("upgrade-store").style.display = "block";
    },

    choose(id) {
        this.upgrades[id].apply();
        document.getElementById("upgrade-store").style.display = "none";
        gamePaused = false;
    }
};
