"use strict";

window.StoryManager = {
    isActive: false,
    currentSceneKey: "",
    currentLineIndex: 0,
    
    images: {},
    assetsLoaded: false,

    preloadAssets: function() {
        const paths = {
            "zizius": "images/characters/zizius.png",
            "asmodeus": "images/characters/asmodeus.png",
            "textbox": "images/ui/storybox.png"
        };

        let loadedCount = 0;
        const total = Object.keys(paths).length;

        for (let key in paths) {
            this.images[key] = new Image();
            this.images[key].src = paths[key];
            this.images[key].onload = () => {
                loadedCount++;
                if (loadedCount === total) {
                    this.assetsLoaded = true;
                    console.log("Story assets linked successfully.");
                }
            };
        }
    },

    startScene: function(sceneKey) {
        if (!window.visualNovelData || !window.visualNovelData[sceneKey]) {
            console.error("Missing narrative segment for reference:", sceneKey);
            return;
        }

        console.log("Intercepting engine state. Triggering scene: " + sceneKey);
        this.isActive = true;
        this.currentSceneKey = sceneKey;
        this.currentLineIndex = 0;

        // PAUSE: Kill the game heartbeat and the enemy spawn timer
        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
        }
        if (typeof spawnEnemiesInterval !== "undefined") {
            clearInterval(spawnEnemiesInterval);
        }
        console.log("[STORY START] Game and spawn timers paused.");

        if (typeof hideUI === "function") hideUI();
    },

    update: function() {
        if (!this.isActive) return;

        let ctx = GameArea.context;
        const lines = window.visualNovelData[this.currentSceneKey];
        const currentData = lines[this.currentLineIndex];

        ctx.fillStyle = "rgba(2, 2, 36, 0.85)";
        ctx.fillRect(0, 0, 1280, 720);

        if (currentData.sprite) {
            let spriteImg = null;
            let targetX = 100;
            let targetY = 200;
            let sWidth = 300;
            let sHeight = 400;

            if (currentData.sprite.includes("zizius")) {
                spriteImg = this.images["zizius"];
                targetX = 150; 
            } else if (currentData.sprite.includes("asmodeus")) {
                spriteImg = this.images["asmodeus"];
                targetX = 830;
            }

            if (spriteImg && spriteImg.complete) {
                ctx.drawImage(spriteImg, targetX, targetY, sWidth, sHeight);
            }
        }

        const boxX = 140;
        const boxY = 520;
        const boxWidth = 1000;
        const boxHeight = 160;

        ctx.fillStyle = "rgba(6, 6, 14, 0.95)";
        ctx.strokeStyle = "#291f22";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#ff6b9d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4, 10);
        ctx.stroke();

        if (currentData.speaker) {
            ctx.textAlign = "left";
            ctx.font = "bold 22px Acme";
            ctx.fillStyle = "#ffc048";
            ctx.fillText(currentData.speaker, boxX + 40, boxY + 45);
        }

        ctx.textAlign = "left";
        ctx.font = "16px Lexend Exa";
        ctx.fillStyle = "#ffffff";
        
        let dialogText = currentData.text || "";
        ctx.fillText(dialogText, boxX + 40, boxY + 95, boxWidth - 80);
    },

    advanceLine: function() {
        if (!this.isActive) return;

        const lines = window.visualNovelData[this.currentSceneKey];
        this.currentLineIndex++;

        if (this.currentLineIndex < lines.length) {
            console.log("Advancing dialogue progression.");
        } else {
            this.completeScene();
        }
    },

    completeScene: function() {
        this.isActive = false;
        console.log("Scene sequence resolved. Resuming loop and spawn timers.");
        
        // RESUME: Restart the game heartbeat and spawn timer
        if (typeof GameArea !== "undefined") {
            GameArea.interval = setInterval(updateGameArea, 20);
        }
        if (typeof spawnEnemy === "function") {
            spawnEnemiesInterval = setInterval(spawnEnemy, typeof getRandomInterval === "function" ? getRandomInterval() : 2000);
        }
        
        if (typeof showUI === "function") showUI();

        if (window.RoundManager && typeof window.RoundManager.resumeAfterScene === "function") {
            window.RoundManager.resumeAfterScene();
        }
    }
};

if (typeof visualNovelData !== "undefined") {
    window.visualNovelData = visualNovelData;
}