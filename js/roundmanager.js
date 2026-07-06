window.RoundManager = {
    round: 1,
    killsThisRound: 0,

    // Round requirements based on your design doc
    roundRequirements: {
        1: 50,
        2: "boss",
        3: 75,
        4: "boss",
        5: 100,
        6: "boss",
        7: 125,
        8: "boss",
        9: 150,
        10: "boss"
    },

    registerKill(isBoss) {
        // Boss rounds
        if (this.roundRequirements[this.round] === "boss") {
            if (isBoss) {
                this.completeRound();
            }
            return;
        }

        // Normal rounds
        this.killsThisRound++;

        if (this.killsThisRound >= this.roundRequirements[this.round]) {
            this.completeRound();
        }
    },

    completeRound() {
    console.log("Round " + this.round + " complete!");

    // Reset kill counter
    this.killsThisRound = 0;

    // Reset boss spawn flag so next boss round can spawn a boss
    window.bossSpawnedThisRound = false;

    // Advance round
    this.round++;

    // Open Upgrade Store
    UpgradeManager.open();
},

    isRoundComplete() {
        // game.js calls this, but we handle completion inside registerKill()
        return false;
    }
};
