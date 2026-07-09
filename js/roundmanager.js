"use strict";

window.RoundManager = {
    round: 1,
    killsThisRound: 0,

    roundRequirements: {
        1: 1,
        2: "boss",
        3: 1,
        4: "boss",
        5: 1,
        6: "boss",
        7: 1,
        8: "boss",
        9: 1,
        10: "boss"
    },

    registerKill(isBoss) {
        // FIX: Use NovelEngine instead of StoryManager
        if (window.NovelEngine && window.NovelEngine.isActive) {
            return;
        }

        if (this.roundRequirements[this.round] === "boss") {
            if (isBoss) {
                this.completeRound();
            }
            return;
        }

        this.killsThisRound++;

        if (this.killsThisRound >= this.roundRequirements[this.round]) {
            this.completeRound();
        }
    },

    completeRound() {
        console.log("Round " + this.round + " complete!");

        this.killsThisRound = 0;
        window.bossSpawnedThisRound = false;

        this.round++;

        const incomingRoundScenes = {
            2: "scene2",
            4: "scene3",
            6: "scene4",
            8: "scene5",
            10: "scene6"
        };

        let sceneKey = incomingRoundScenes[this.round] || null;

        // FIX: Use NovelEngine instead of StoryManager
        if (
            sceneKey &&
            window.NovelEngine &&
            window.visualNovelData &&
            window.visualNovelData[sceneKey]
        ) {
            window.NovelEngine.startScene(sceneKey);
        } else {
            console.log("No story scene mapped for entering round " + this.round);
            this.resumeAfterScene();
        }
    },

    resumeAfterScene() {
        console.log("Round manager tracking active loop state for round " + this.round);

        if (this.round > 10) {
            console.log("VICTORY! You have completed all the testing rounds!");

            const victoryPanel = document.getElementById("victory-panel");
            if (victoryPanel) {
                victoryPanel.classList.remove("hidden");
            }
            return;
        }

        // Game loop resumes automatically in NovelEngine.completeScene()
    },

    getEnemyMaxHP() {
        return 2 + (this.round * 2);
    },

    getBossMaxHP() {
        return 20 + (this.round * 10);
    },

    isBossRound() {
        return this.roundRequirements[this.round] === "boss";
    }
};
