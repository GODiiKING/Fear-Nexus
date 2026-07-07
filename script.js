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
        
        if (e.key === '1' || e.key === '2') {
            console.log("Key captured in main loop:", e.key);
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

    ctx.fillText(score.toString(), 640, 60);

    updateUI(); 

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

    grassArray.forEach(grass => grass.update());
    player.update();
    bullets.forEach(bullet => bullet.update());
    crosshair.update();

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    drawEnemyHealthBars(ctx);

    if (player && player.hp <= 0 && !gameOver) {
        endGame();
    }

    if (gameOver) {
        restartScreen.update();
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