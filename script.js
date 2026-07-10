"use strict";

// ==========================================
// GAME AREA
// ==========================================

let lastStoryClickTime = 0;
const STORY_CLICK_DELAY = 350; // Cooldown duration measured in milliseconds

let GameArea = {
    canvas: document.createElement("canvas"),

    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(this.interval);

        // Only start the game loop if NOT in a story scene
        if (!window.StoryManager || !window.StoryManager.isActive) {
            this.interval = setInterval(updateGameArea, 20);
        }

        this.canvas.id = "GameWindow";

        let container = document.getElementById("gamecontainer");
        if (!container) container = document.getElementById("game-container"); 
        container.insertBefore(this.canvas, container.firstChild);
    },

    clear: function () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

function startGame() {

    // ⭐ FIX: Start canvas FIRST
    GameArea.start();

    // ⭐ FIX: Start story SECOND using NovelEngine instead of StoryManager
    if (window.NovelEngine) {
        window.NovelEngine.startScene("scene1");
    }

    // ⭐ FIX: DO NOT start game loop again
    // (GameArea.start already did it, and NovelEngine paused it)

    // FIX: Only show combat UI if a narrative scene is not active
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

    // Keyboard listeners
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
    restartScreen = new Component(1280, 720, "images/gameover/gameoverbg.png", 0, 0, "image");

    bullets = [bullet1, bullet2, bullet3];
    grassArray = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9];
    enemies = [];

    // ⭐ FIX: Only spawn enemies if story is NOT active
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
        // FIX: Route mouse clicks to NovelEngine
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
        else if (e.button === 2) {
            if (player.magic >= 10) {
                player.magic -= 10; 
                let fakeLeftClickEvent = { button: 0, clientX: e.clientX, clientY: e.clientY };
                Shoot(fakeLeftClickEvent); 
            }
        }
    });
}

// ==========================================
// MAIN REFRESH TICK LOOP
// ==========================================

function updateGameArea() {
    // ⭐ FIX: If story is active, STOP everything
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
    
    runPassiveRegeneration();
    runStorePassiveUpgrades(); 

    if (typeof abilitySystem !== 'undefined' && abilitySystem.debugText) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(abilitySystem.debugText, 50, 50);
    }

    grassArray.forEach(grass => grass.update());
    player.update();
    bullets.forEach(bullet => bullet.update());
    crosshair.update();

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

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

// ==========================================
// BULLETPROOF ENEMY HEALTH BAR RENDERING
// ==========================================

function drawEnemyHealthBars(ctx) {
    const currentTime = Date.now();

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.maxHp === undefined || isNaN(enemy.maxHp)) {
            let currentKills = typeof score !== 'undefined' ? score : 0;
            enemy.maxHp = 2 + Math.floor(currentKills / 10);
        }
        if (enemy.hp === undefined || isNaN(enemy.hp)) {
            enemy.hp = enemy.maxHp;
        }

        if (enemy.lastHitTime && (currentTime - enemy.lastHitTime < 3000)) {
            const barWidth = 50;  
            const barHeight = 5;  
            
            let healthPercentage = enemy.hp / enemy.maxHp;
            let currentBarWidth = barWidth * healthPercentage;
            
            let enemyWidth = enemy.width || (288 * imagesScale);
            
            const barX = enemy.x + (enemyWidth / 2) - (barWidth / 2);
            const barY = enemy.y - 15; 
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0000'; 
            ctx.fillRect(barX, barY, currentBarWidth, barHeight);
        }
    }
}

// ==========================================
// PASSIVE REGENERATION SYSTEM (PERK HOOKS)
// ==========================================

let passiveRegenTimer = 0;

function runPassiveRegeneration() {
    let statsSource = window.PlayerStats;
    if (!statsSource || gameOver) return;

    if ((statsSource.healthRegen && statsSource.healthRegen > 0) || 
        (statsSource.magicRegen && statsSource.magicRegen > 0)) {
        
        passiveRegenTimer++;

        if (passiveRegenTimer >= 250) { 
            passiveRegenTimer = 0;
            let needsVisualRefresh = false;

            if (statsSource.healthRegen && statsSource.healthRegen > 0) {
                if (playerHealth < maxHealth) {
                    playerHealth = Math.min(maxHealth, playerHealth + statsSource.healthRegen);
                    if (player) player.hp = playerHealth; 
                    needsVisualRefresh = true;
                    console.log("[PERK REGEN] Restored " + statsSource.healthRegen + " HP. Current: " + playerHealth);
                }
            }

            if (statsSource.magicRegen && statsSource.magicRegen > 0) {
                if (playerMagic < maxMagic) {
                    playerMagic = Math.min(maxMagic, playerMagic + statsSource.magicRegen);
                    if (player) player.magic = playerMagic; 
                    needsVisualRefresh = true;
                    console.log("[PERK REGEN] Restored " + statsSource.magicRegen + " MAGIC. Current: " + playerMagic);
                }
            }

            if (needsVisualRefresh && typeof updateUI === "function") {
                updateUI();
            }
        }
    }
}

// ==========================================
// PASSIVE STORE UPGRADE PROCESSING HOOKS
// ==========================================

function runStorePassiveUpgrades() {
    if (!player || gameOver) return;

    if (window.hasSanguineAura && enemies.length > 0) {
        if (!window.auraTimer) window.auraTimer = 0;
        window.auraTimer++;

        if (window.auraTimer >= 15) {
            window.auraTimer = 0;
            
            let auraRadius = 160;
            let auraDamage = 1;

            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                let dx = enemy.x - player.x;
                let dy = enemy.y - player.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < auraRadius) {
                    enemy.hp -= auraDamage;
                    enemy.lastHitTime = Date.now();

                    let maxHpRef = player.maxHp || window.maxHealth || 100;
                    player.hp = Math.min(maxHpRef, player.hp + 0.2);
                    if (window.playerHealth !== undefined) window.playerHealth = player.hp;

                    if (enemy.hp <= 0) {
                        let isBoss = (enemy.hasOwnProperty('isBoss') && enemy.isBoss);
                        score += isBoss ? 10 : 1;

                        if (window.PlayerStats) {
                            window.PlayerStats.addXP(isBoss ? 25 : 5);
                            window.PlayerStats.addSouls(isBoss ? 100 : 50);
                        }

                        enemies.splice(i, 1);
                        if(typeof enemiesWaitTime !== 'undefined') enemiesWaitTime.splice(i, 1);
                        if(typeof enemiesAnimationPosition !== 'undefined') enemiesAnimationPosition.splice(i, 1);
                        if(typeof enemiesPlayerCollision !== 'undefined') enemiesPlayerCollision.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }

    if (window.hasManaZone) {
        if (window.lastTrackedX === undefined) {
            window.lastTrackedX = player.x;
            window.lastTrackedY = player.y;
            window.stillFramesCounter = 0;
        }

        if (player.x === window.lastTrackedX && player.y === window.lastTrackedY) {
            window.stillFramesCounter++;
            
            if (window.stillFramesCounter >= 30) {
                let maxMagicRef = player.maxMagic || window.maxMagic || 100;
                player.magic = Math.min(maxMagicRef, player.magic + 0.4);
                if (window.playerMagic !== undefined) window.playerMagic = player.magic;
            }
        } else {
            window.stillFramesCounter = 0;
        }

        window.lastTrackedX = player.x;
        window.lastTrackedY = player.y;
    }
}
