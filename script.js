"use strict";

// ==========================================
// INITIALIZATION
// ==========================================

function startGame() {

    GameArea.start();
    showUI();
    player = new Component(
        313 * imagesScale,
        207 * imagesScale,
        playerSprite,
        640 - (313 * imagesScale) / 2,
        360 - (202 * imagesScale) / 2,
        "player",
        0
    );

    // Consolidated keyboard listener with input field protection
    window.addEventListener("keydown", function(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }

        console.log("Keyboard activity detected: " + e.key);
        
        // Inside your startGame keyboard event listener
        if (e.key === '1' || e.key === '2') {
            console.log("Key captured in main loop: " + e.key);

            if (window.abilitySystem) {
                window.abilitySystem.handleKey(e.key);
            } else {
                console.error("Ability System not found!");
            }
        }
        
        // Z Key controls the temporary run Upgrade Store
        if (e.key === 'z' || e.key === 'Z') {
            console.log("Z key detected by the input listener!");
            if (window.UpgradeManager) {
                window.UpgradeManager.toggleStore();
            } else {
                console.error("UpgradeManager object could not be found on the window context!");
            }
        }

        // X Key controls the permanent celestial Perk Store
        if (e.key === 'x' || e.key === 'X') {
            console.log("X key detected by the input listener!");
            if (window.PerkStoreManager) {
                window.PerkStoreManager.toggleStore();
            } else {
                console.error("PerkStoreManager object could not be found on the window context!");
            }
        }
    });

    // Bulletproof: Force initialize stats if they aren't set yet
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

    crosshair = new Component(
        40,
        40,
        "images/crosshair/crosshair.png",
        640,
        360,
        "image"
    );

    restartScreen = new Component(
        1280,
        720,
        "images/gameover/gameoverbg.png",
        0,
        0,
        "image"
    );

    bullets = [bullet1, bullet2, bullet3];

    grassArray = [
        grass1,
        grass2,
        grass3,
        grass4,
        grass5,
        grass6,
        grass7,
        grass8,
        grass9
    ];

    enemies = [];

    spawnEnemiesInterval = setInterval(
        spawnEnemy,
        getRandomInterval()
    );

    score = 0;
    gameOver = false;

    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    
    window.addEventListener("mousedown", (e) => {
        if (gameOver) return;

        if (player.magic === undefined) player.magic = 100;

        if (e.button === 0) {
            Shoot(e);
        } 
        else if (e.button === 2) {
            if (player.magic >= 10) {
                player.magic -= 10; 
                
                let fakeLeftClickEvent = {
                    button: 0,
                    clientX: e.clientX,
                    clientY: e.clientY
                };
                
                Shoot(fakeLeftClickEvent); 
            } else {
                console.log("Out of magic!");
            }
        }
    });
}

// ==========================================
// GAME AREA
// ==========================================

let GameArea = {

    canvas: document.createElement("canvas"),

    start: function () {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(GameArea.interval);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "Game-Window";

        let container = document.getElementById("game-container");
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
// MAIN LOOP
// ==========================================

function updateGameArea() {
    const levelPanel = document.getElementById("levelup-panel");
    const upgradePanel = document.getElementById("upgrade-panel") || document.getElementById("upgrade-store");
    const perkPanel = document.getElementById("perk-panel");

    if (levelPanel && !levelPanel.classList.contains("hidden")) {
        return; 
    }
    if (upgradePanel && !upgradePanel.classList.contains("hidden")) {
        return; 
    }
    if (perkPanel && !perkPanel.classList.contains("hidden")) {
        return; 
    }

    GameArea.clear();

    let ctx = GameArea.context;

    updateUI(); 
    
    // Run core passive abilities
    runPassiveRegeneration();
    runStorePassiveUpgrades(); 

    if (typeof abilitySystem !== 'undefined' && abilitySystem.debugText) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(abilitySystem.debugText, 50, 50);
    }

    onmousemove = function (e) {
        let rect = GameArea.canvas.getBoundingClientRect();

        angle = Math.atan2(
            e.clientY - rect.top - player.y - 150 / 2,
            e.clientX - rect.left - player.x - 256 / 2
        );

        player.angle = angle;

        crosshair.x = e.clientX - rect.left - 20;
        crosshair.y = e.clientY - rect.top - 17;
    };

    updateBullets();
    checkBulletCollisions();
    checkEnemyPlayerCollisions();
    moveEnemies();

    // 1. Draw Environment and Entities first (Bottom layers)
    grassArray.forEach(grass => grass.update());
    player.update();
    bullets.forEach(bullet => bullet.update());
    crosshair.update();

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    drawEnemyHealthBars(ctx);

    // ==========================================
    // CENTRAL HUD VISUAL PROGRESSION LAYOUT (Top layer)
    // ==========================================
    ctx.textAlign = "center"; 

    // Draw Dynamic Round Progression Info cleanly in the center (Red trackers removed)
    if (window.RoundManager) {
        let currentRound = window.RoundManager.round;
        let req = window.RoundManager.roundRequirements[currentRound];
        
        ctx.fillStyle = "#ff0000"; 
        ctx.font = "bold 20px Arial"; 

        if (req === "boss") {
            ctx.fillText("ROUND " + currentRound + " - BOSS STAGE ENCOUNTER", 640, 60);
        } else {
            let kills = window.RoundManager.killsThisRound;
            ctx.fillText("ROUND " + currentRound + " • PROGRESS: " + kills + " / " + req + " KILLS", 640, 60);
        }
    }

    // ==========================================
    // UPGRADE SYSTEM INTERCEPTORS: REVIVAL CHECK
    // ==========================================
    if (player && player.hp <= 0 && !gameOver) {
        if (window.hasRevival) {
            window.hasRevival = false; 
            
            let maxHpRef = player.maxHp || window.maxHealth || 100;
            player.hp = Math.floor(maxHpRef * 0.5); 
            
            if (window.playerHealth !== undefined) {
                window.playerHealth = player.hp;
            }
            
            console.log("Revival triggered! Safety barrier shattered.");
        } else {
            endGame();
        }
    }

    if (gameOver) {
        restartScreen.update();
        ctx.fillStyle = "#ffffff"; 
        ctx.fillText(
            "High Score: " + highscore.toString(),
            640,
            650
        );
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
    document.querySelector('.health-group').classList.add('hidden');
    document.querySelector('.magic-group').classList.add('hidden');
    document.querySelector('.xp-group').classList.add('hidden');
}

function showUI() {
    document.querySelector('.health-group').classList.remove('hidden');
    document.querySelector('.magic-group').classList.remove('hidden');
    document.querySelector('.xp-group').classList.remove('hidden');
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
            
            const healthPercentage = enemy.hp / enemy.maxHp;
            const currentBarWidth = barWidth * healthPercentage;
            
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

            // Celestial Vitality (Health)
            if (statsSource.healthRegen && statsSource.healthRegen > 0) {
                if (playerHealth < maxHealth) {
                    playerHealth = Math.min(maxHealth, playerHealth + statsSource.healthRegen);
                    if (player) player.hp = playerHealth; 
                    needsVisualRefresh = true;
                    console.log("[PERK REGEN] Restored " + statsSource.healthRegen + " HP. Current: " + playerHealth);
                }
            }

            // Astral Attunement (Magic)
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

function runStorePassiveUpgrades() {
    if (!player || gameOver) return;

    // Sanguine Aura processing
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
                        enemiesWaitTime.splice(i, 1);
                        enemiesAnimationPosition.splice(i, 1);
                        enemiesPlayerCollision.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }

    // Mana Zone processing
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