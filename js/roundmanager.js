"use strict";

window.RoundManager = {
    round: 1,
    killsThisRound: 0,

    // Testing Mode: Every single step requires exactly 1 kill to progress!
    roundRequirements: {
        1: 1,      // 1 kill -> advances to Round 2 (Boss)
        2: "boss", // 1 boss kill -> advances to Round 3
        3: 1,      // 1 kill -> advances to Round 4 (Boss)
        4: "boss", // 1 boss kill -> advances to Round 5
        5: 1,      // 1 kill -> advances to Round 6 (Boss)
        6: "boss", // 1 boss kill -> advances to Round 7
        7: 1,      // 1 kill -> advances to Round 8 (Boss)
        8: "boss", // 1 boss kill -> advances to Round 9
        9: 1,      // 1 kill -> advances to Round 10 (Boss)
        10: "boss" // Beat this boss -> Win game!
    },

    registerKill(isBoss) {
        // Handle Boss Encounter Stages
        if (this.roundRequirements[this.round] === "boss") {
            if (isBoss) {
                this.completeRound();
            }
            return;
        }

        // Handle Normal Horde Stages
        this.killsThisRound++;

        if (this.killsThisRound >= this.roundRequirements[this.round]) {
            this.completeRound();
        }
    },

    completeRound() {
        console.log("Round " + this.round + " complete!");

        this.killsThisRound = 0;

        // Reset global boss spawn tracking flag so the next boss stage functions correctly
        window.bossSpawnedThisRound = false;

        if (this.round >= 10) {
            console.log("VICTORY! You have completed all 10 rounds!");
            alert("Victory! You have cleared Fear Nexus!");
            return;
        }

        this.round++;
        
        // AUTOMATIC UPGRADE STORE OPENING REMOVED FROM HERE
    },

    // Centralized Difficulty Scaling System
    getEnemyMaxHP() {
        // Return scaling value based clean on the current round number
        return 2 + (this.round * 2);
    },

    getBossMaxHP() {
        // Return boss base hitpoints based cleanly on the current round number
        return 20 + (this.round * 10);
    },

    isBossRound() {
        return this.roundRequirements[this.round] === "boss";
    }
};