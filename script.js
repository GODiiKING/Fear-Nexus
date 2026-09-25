"use strict";

// ==========================================
// GAME AREA
// ==========================================

let lastStoryClickTime = 0;
const STORY_CLICK_DELAY = 350;

let GameArea = {
    canvas: document.createElement("canvas"),

    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(this.interval);

        if (!window.StoryManager || !window.StoryManager.isActive) {
            this.interval = setInterval(updateGameArea, 20);
        }

        this.canvas.id = "GameWindow";

        let container = document.getElementById("gamecontainer");
        if (!container) container = document.getElementById("game-container");
        container.insertBefore(this.canvas, container.firstChild);
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

function startGame() {

    GameArea.start();

    if (window.NovelEngine) {
        window.NovelEngine.startScene("scene1");
    }

    if (!window.NovelEngine || !window.NovelEngine.isActive) {
        showUI();
    }

    player = new Component(
        313 * imagesScale,
        207 * imagesScale,
        playerSprite,
        640 - (313 * imagesScale) / 2,
        360 - (202 * imagesScale) / 2,
        "player",
        0
    );

    window.addEventListener("keydown", function(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }

        console.log("Keyboard activity detected: " + e.key);

        if (e.key === '1' || e.key === '2') {
            if (window.abilitySystem) {
                window.abilitySystem.handleKey(e.key);
            }
        }

        if (e.key === 'z' || e.key === 'Z') {
            if (window.UpgradeManager) window.UpgradeManager.toggleStore();
        }

        if (e.key === 'x' || e.key === 'X') {
            if (window.PerkStoreManager) window.PerkStoreManager.toggleStore();
        }
    });

    player.hp = 100;
    player.magic = 100;

    grass1 = new Component(1280, 720, "images/background/bg3.png", -1280, 720, "grass");
    grass2 = new Component(1280, 720, "images/background/bg3.png", 0, 720, "grass");
    grass3 = new Component(1280, 720, "images/background/bg3.png", 1280, 720, "grass");
    grass4 = new Component(1280, 720, "images/background/bg3.png", -1280, 0, "grass");
    grass5 = new Component(1280, 720, "images/background/bg2.png", 0, 0, "grass");
    grass6 = new Component(1280, 720, "images/background/bg3.png", 1280, 0, "grass");
    grass7 = new Component(1280, 720, "images/background/bg3.png", -1280, -720, "grass");
    grass8 = new Component(1280, 720, "images/background/bg1.png", 0, -720, "grass");
    grass9 = new Component(1280, 720, "images/background/bg3.png", 1280, -720, "grass");

    bullet1 = new Component(100, 2, "images/bullet/bullet1.png", -10, -2, "image");
    bullet2 = new Component(100, 2, "images/bullet/bullet2.png", -10, -2, "image");
    bullet3 = new Component(100, 2, "images/bullet/bullet1.png", -10, -2, "image");

    crosshair = new Component(40, 40, "images/crosshair/crosshair.png", 640, 360, "image");
    restartScreen = new Component(1280, 720, "images/gameover/gameoverbg1.png", 0, 0, "image");

    bullets = [bullet1, bullet2, bullet3];
    grassArray = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9];
    enemies = [];
    if (typeof enemyBullets !== 'undefined') enemyBullets = [];

    if (!window.NovelEngine || !window.NovelEngine.isActive) {
        spawnEnemiesInterval = setInterval(spawnEnemy, getRandomInterval());
    }

    score = 0;
    gameOver = false;

    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("mousemove", function (e) {
        let rect = GameArea.canvas.getBoundingClientRect();
        angle = Math.atan2(
            e.clientY - rect.top - player.y - 75,
            e.clientX - rect.left - player.x - 128
        );
        player.angle = angle;
        crosshair.x = e.clientX - rect.left - 20;
        crosshair.y = e.clientY - rect.top - 17;
    });

    window.addEventListener("mousedown", (e) => {
        if (window.NovelEngine && window.NovelEngine.isActive) {
            if (e.button === 0) {
                let currentTime = Date.now();
                if (currentTime > lastStoryClickTime + STORY_CLICK_DELAY) {
                    lastStoryClickTime = currentTime;
                    window.NovelEngine.advanceLine();
                }
            }
            return;
        }

        if (gameOver) return;
        if (player.magic === undefined) player.magic = 100;

        if (e.button === 0) {
            Shoot(e);
        }
        // Right-click used to fire a cheap magic-cost shot here. That's
        // now Astra's job: see the 'contextmenu' listener in
        // upgradeeffects.js, which does nothing at all until
        // window.hasAstra is true, so right-click is fully locked until
        // the Astra perk is purchased.
    });
}

// ==========================================
// MAIN REFRESH TICK LOOP
// ==========================================

function updateGameArea() {
    if (window.StoryManager && window.StoryManager.isActive) {
        window.StoryManager.update();
        return;
    }

    GameArea.clear();

    let ctx = GameArea.context;

    moveEnemies();
    updateBullets();
    checkBulletCollisions();
    checkEnemyPlayerCollisions();
    updateEnemyBullets();
    if (typeof checkEnemyBulletPlayerCollisions === 'function') checkEnemyBulletPlayerCollisions();
    if (typeof updateNPCSpawning === 'function') updateNPCSpawning();

    runPassiveRegeneration();
    runStorePassiveUpgrades();

    if (typeof abilitySystem !== 'undefined' && abilitySystem.debugText) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(abilitySystem.debugText, 50, 50);
    }

    grassArray.forEach(grass => grass.update());

    if (typeof drawNPCs === 'function') drawNPCs(ctx);

    player.update();
    bullets.forEach(bullet => bullet.update());
    crosshair.update();

    if (typeof drawBossAuras === 'function') drawBossAuras(ctx);

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    if (typeof drawEnemyBullets === 'function') drawEnemyBullets(ctx);

    drawEnemyHealthBars(ctx);
    if (typeof updateUI === "function") updateUI();

    ctx.textAlign = "center";

    if (window.RoundManager) {
        let currentRound = window.RoundManager.round;
        let req = window.RoundManager.roundRequirements[currentRound];

        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 20px Arial";

        if (req === "boss") {
            ctx.fillText("ROUND " + currentRound + " SCOUTING ENEMY BOSS ENCOUNTER", 640, 60);
        } else {
            let kills = window.RoundManager.killsThisRound;
            ctx.fillText("ROUND " + currentRound + " PROGRESSION DETECTED " + kills + " / " + req + " KILLS", 640, 60);
        }
    }

    if (typeof getNearbyNPC === 'function') {
        let nearNpc = getNearbyNPC();
        if (nearNpc) {
            ctx.fillStyle = "#ffe066";
            ctx.font = "bold 18px Arial";
            ctx.fillText("Press SPACE to talk to " + nearNpc.name, 640, 630);
        }
    }

    if (player && player.hp <= 0 && !gameOver) {
        if (window.hasRevival) {
            window.hasRevival = false;

            let maxHpRef = player.maxHp || window.maxHealth || 100;
            player.hp = Math.floor(maxHpRef * 0.5);

            if (window.playerHealth !== undefined) {
                window.playerHealth = player.hp;
            }
        } else {
            endGame();
        }
    }

    if (gameOver) {
        restartScreen.update();
        ctx.fillStyle = "#ffffff";
        ctx.fillText("High Score: " + highscore.toString(), 640, 650);
    }
}

// ==========================================
// GAME OVER & UI UTILITIES
// ==========================================

function endGame() {
    gameOver = true;
    if (highscore < score) {
        highscore = score;
    }
    hideUI();
}

function hideUI() {
    if(document.querySelector('.health-group')) document.querySelector('.health-group').classList.add('hidden');
    if(document.querySelector('.magic-group')) document.querySelector('.magic-group').classList.add('hidden');
    if(document.querySelector('.xp-group')) document.querySelector('.xp-group').classList.add('hidden');
}

function showUI() {
    if(document.querySelector('.health-group')) document.querySelector('.health-group').classList.remove('hidden');
    if(document.querySelector('.magic-group')) document.querySelector('.magic-group').classList.remove('hidden');
    if(document.querySelector('.xp-group')) document.querySelector('.xp-group').classList.remove('hidden');
}

// NOTE: script.js used to also have its own copies of
// drawEnemyHealthBars(), passiveRegenTimer/runPassiveRegeneration(), and
// a full duplicate Sanguine Aura / Mana Zone implementation inside
// runStorePassiveUpgrades(). Because enemy.js, game.js, and
// upgradeeffects.js load after this file, their versions were always the
// ones actually running - these were dead code. Removed to avoid two
// people editing the wrong copy later. runStorePassiveUpgrades() is kept
// as a no-op below only because updateGameArea() (in this same file)
// still calls it by name.

function runStorePassiveUpgrades() {
    // Sanguine Aura and Mana Zone are fully handled in upgradeeffects.js
    // now (ability-cast-triggered and genuine-stillness-triggered
    // respectively), both routed through resolveEnemyKill() so kills
    // properly count toward round progress and kill-based perks.
}

const gameContainer = document.getElementById('game-container');

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());