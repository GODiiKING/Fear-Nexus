"use strict";

window.NovelEngine = {
    isActive: false, // Flag to indicate if a scene is currently playing
    currentSceneKey: "scene1",
    currentLineIndex: 0,

    init: function() {
        const textWindow = document.getElementById("interactiveBox");
        if (textWindow) {
            textWindow.onclick = () => this.advanceLine();
        }
    },

    // Triggered directly by RoundManager when a round clears
    startScene: function(sceneKey) {
        if (!window.visualNovelData || !window.visualNovelData[sceneKey]) {
            console.error("Requested storyboard layout scene missing:", sceneKey);
            return;
        }
        
        this.isActive = true;
        this.currentSceneKey = sceneKey;
        this.currentLineIndex = 0;

        // ⭐ PAUSE GAME LOOP ⭐
        if (typeof GameArea !== "undefined" && GameArea.interval) {
            clearInterval(GameArea.interval);
            console.log("GAME PAUSED (NovelEngine)");
        }
        
        // Remove hidden class container structural layer block element
        const panel = document.getElementById("story-panel");
        if (panel) panel.classList.remove("hidden");

        this.renderCurrentLine();
    },

    renderCurrentLine: function() {
        const lines = window.visualNovelData[this.currentSceneKey];
        const currentData = lines[this.currentLineIndex];
        
        const textElement = document.getElementById("sceneText");
        const nameElement = document.getElementById("speakerName");
        const ziziusSprite = document.getElementById("ziziusSprite");
        const asmodeusSprite = document.getElementById("asmodeusSprite");
        
        if (!textElement) return;

        textElement.style.transition = "none";
        textElement.style.opacity = "0";
        
        if (nameElement) {
            nameElement.innerText = currentData.speaker || "";
        }
        
        if (ziziusSprite && asmodeusSprite) {
            ziziusSprite.classList.remove("active");
            asmodeusSprite.classList.remove("active");

            if (currentData.sprite) {
                if (currentData.sprite.includes("zizius")) {
                    ziziusSprite.src = currentData.sprite;
                    ziziusSprite.classList.add("active");
                } else if (currentData.sprite.includes("asmodeus")) {
                    asmodeusSprite.src = currentData.sprite;
                    asmodeusSprite.classList.add("active");
                }
            }
        }
        
        setTimeout(() => {
            textElement.innerText = currentData.text;
            textElement.style.transition = "opacity 0.3s ease";
            textElement.style.opacity = "1";
        }, 150);
    },

    advanceLine: function() {
        const lines = window.visualNovelData[this.currentSceneKey];
        this.currentLineIndex++;

        if (this.currentLineIndex < lines.length) {
            this.renderCurrentLine();
        } else {
            this.completeScene();
        }
    },

    completeScene: function() {
        this.isActive = false;
        
        // Re-hide the display interface structure setup container layer overlay
        const panel = document.getElementById("story-panel");
        if (panel) panel.classList.add("hidden");

        const nameElement = document.getElementById("speakerName");
        const ziziusSprite = document.getElementById("ziziusSprite");
        const asmodeusSprite = document.getElementById("asmodeusSprite");

        if (nameElement) nameElement.innerText = "";
        if (ziziusSprite) ziziusSprite.classList.remove("active");
        if (asmodeusSprite) asmodeusSprite.classList.remove("active");

        console.log("Scene finished execution thread. Resuming Nexus wave progression parameters.");

        // ⭐ RESUME GAME LOOP ⭐
        if (typeof GameArea !== "undefined") {
            GameArea.interval = setInterval(updateGameArea, 20);
            console.log("GAME RESUMED (NovelEngine)");
        }
        
        // Callback hook execution pipeline trigger loop sequence
        if (window.RoundManager && typeof window.RoundManager.resumeAfterScene === "function") {
            window.RoundManager.resumeAfterScene();
        }
    }
};

const visualNovelData = {
    scene1: [
        { 
            speaker: "", 
            text: "Zizius awakens disoriented in heavy darkness.", 
            sprite: "" 
        },
        { 
            speaker: "Zizius", 
            text: "I don't recognize this place... where am I?", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "You never left, Zizius. You are bound here.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "", 
            text: "He steels himself and prepares to fight the first wave of enemies.", 
            sprite: "images/zizius.png" 
        }
    ],
    scene2: [
        { 
            speaker: "Zizius", 
            text: "I'm still here... I won't give up.", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "You can't win. Your soul is already mine.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "", 
            text: "Zizius pushes forward relentlessly toward the next battle.", 
            sprite: "images/zizius.png" 
        }
    ],
    scene3: [
        { 
            speaker: "Zizius", 
            text: "I need to understand why I'm here.", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "No one will save you. The fear is endless.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "", 
            text: "Zizius braces himself tightly for the next round.", 
            sprite: "images/zizius.png" 
        }
    ],
    scene4: [
        { 
            speaker: "", 
            text: "Zizius fights on, but flashbacks hit. He recalls Aien... his last memory is that historic battle.", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "Give me your soul, Zizius. I can leave through you.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "Zizius", 
            text: "No... I won't let you possess me.", 
            sprite: "images/zizius.png" 
        }
    ],
    scene5: [
        { 
            speaker: "Zizius", 
            text: "I won't let him take me.", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "This cycle never ends. You belong to me.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "", 
            text: "Zizius fights back with every single ounce of remaining human will.", 
            sprite: "images/zizius.png" 
        }
    ],
    scene6: [
        { 
            speaker: "Zizius", 
            text: "I don't know who I was, but I know who I am now.", 
            sprite: "images/zizius.png" 
        },
        { 
            speaker: "Asmodeus", 
            text: "You will never escape.", 
            sprite: "images/asmodeus.png" 
        },
        { 
            speaker: "", 
            text: "With a massive final burst of defiance, Zizius rejects him completely.", 
            sprite: "" 
        }
    ]
};

// Bind the script scope data to the window context safely
window.visualNovelData = visualNovelData;

// Run basic element link setup
window.NovelEngine.init();
