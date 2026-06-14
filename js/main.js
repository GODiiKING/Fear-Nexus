"use strict";

// Import our encapsulated, object-oriented modules
import { player } from './player.js';
import { demon } from './demon.js';

// --- CANVAS & CONTEXT SETUP ---
const canvas = document.getElementById("canvas"); // Make sure your HTML has <canvas id="canvas" width="1280" height="720"></canvas>
const ctx = canvas.getContext("2d");
const imagesScale = 0.6;

// --- AUDIO REGISTRY ---
const shootSound = new Audio('shootaudio.mp3');
const alienDeathSound = new Audio('demondie.mp3');
const alienSpeakSound = new Audio('demontalk.mp3');
const alienSpeakSound2 = new Audio('demontalk2.mp3');
const alienSpeakSound3 = new Audio('demontalk3.mp3');

// --- PRELOAD DEMON ASSETS ---
// The main file holds the arrays so we only load them into memory once, passing them to the demons as needed.
const zombieMovementAnimation = Array.from({length: 16}, (_, i) => {
    let img = new Image(); img.src = `images/tds_zombie-Copy/export/Movement/skeleton-move_${i}.png`; return img;
});
const zombieAttackAnimation = Array.from({length: 8}, (_, i) => {
    let img = new Image(); img.src = `images/tds_zombie-Copy/export/Attack/skeleton-attack_${i}.png`; return img;
});
const zombieSprite = "images/tds_zombie-Copy/export/Movement/skeleton-move_0.png";

// --- GAME STATE VARIABLES ---
let p1; // The player instance
let crosshair, restartScreen;
let bullet1, bullet2, bullet3;
let grassArray = [];
let zombies = []; // Will hold our 'demon' instances

// Input & Movement State
let moveForward = false;
let moveBackwards = false;
let movementSpeed = 0.5;

// Scoring & Game Execution States
let highscore = 0;
let score = 0;
let gameOver = false;

// Bullet States
let bulletAngle = 0;
let bulletSpeed = 25;
let canShoot = true;
let shootAnimationOver = true;
let bulletActive = false;

// Spawning Variables (Optimized to prevent instant-zero collapse)
let difficulty = 0.25; 
let baseMaxTime = 5000;
let baseMinTime = 100;
let gameSpawnsCount = 0;
let spawnTimer;

// --- HELPER COMPONENT (For Grass, Bullets, and UI) ---
class Component {
    constructor(width, height, color_or_src, x, y, type) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = 0;
        
        if (this.type === "image") {
            this.image = new Image();
            this.image.src = color_or_src;
        } else {
            this.color = color_or_src;
        }
    }

    update() {
        if (this.type === "image") {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// --- INITIALIZATION ---
function startGame() {
    gameOver = false;
    score = 0;
    zombies = [];
    grassArray = [];
    gameSpawnsCount = 0;

    // Initialize Player
    p1 = new player(imagesScale);

    // Initialize UI & Environment
    crosshair = new Component(50, 50, "images/crosshair.png", 640, 360, "image");
    restartScreen = new Component(1280, 720, "images/gameover.png", 0, 0, "image"); // Placeholder path
    
    bullet1 = new Component(10, 10, "yellow", 640, 360, "color");
    bullet2 = new Component(10, 10, "yellow", 640, 360, "color");
    bullet3 = new Component(10, 10, "yellow", 640, 360, "color");

    // Initialize 3x3 Infinite Grass Grid
    for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
            let g = new Component(1280, 720, "images/grass.png", col * 1280, row * 720, "image");
            grassArray.push(g);
        }
    }

    // Start Loops
    clearTimeout(spawnTimer);
    scheduleNextSpawn();
}

// --- SPAWN LOGIC ---
function getRandomInterval() {
    let currentMax = Math.max(baseMinTime + 200, baseMaxTime - (gameSpawnsCount * 150));
    return Math.floor(Math.random() * (currentMax - baseMinTime + 1) + baseMinTime);
}

function scheduleNextSpawn() {
    if (gameOver) return;
    spawnTimer = setTimeout(() => {
        spawnZombie();
        gameSpawnsCount++;
        scheduleNextSpawn();
    }, getRandomInterval());
}

function spawnZombie() {
    let newZombie = new demon(0, 0, imagesScale, zombieSprite);
    let randomPosition = Math.floor(Math.random() * 4) + 1;

    if (randomPosition === 1) {
        newZombie.x = 0 - newZombie.width / 2;
        newZombie.y = Math.random() * 720 - newZombie.height / 2;
    } else if (randomPosition === 2) {
        newZombie.x = 1280 - newZombie.width / 2;
        newZombie.y = Math.random() * 720 - newZombie.height / 2;
    } else if (randomPosition === 3) {
        newZombie.x = Math.random() * 1280 - newZombie.width / 2;
        newZombie.y = 720 - newZombie.height / 2;
    } else if (randomPosition === 4) {
        newZombie.x = Math.random() * 1280 - newZombie.width / 2;
        newZombie.y = 0 - newZombie.height / 2;
    }
    zombies.push(newZombie);
}

function endGame() {
    gameOver = true;
    if (highscore < score) {
        highscore = score;
    }
}

// --- INFINITE SCROLLING LOGIC ---
function moveLeft() {
    grassArray[2].x -= 1280 * 3; grassArray[5].x -= 1280 * 3; grassArray[8].x -= 1280 * 3;
    grassArray = [grassArray[2], grassArray[0], grassArray[1], grassArray[5], grassArray[3], grassArray[4], grassArray[8], grassArray[6], grassArray[7]];
}
function moveRight() {
    grassArray[0].x += 1280 * 3; grassArray[3].x += 1280 * 3; grassArray[6].x += 1280 * 3;
    grassArray = [grassArray[1], grassArray[2], grassArray[0], grassArray[4], grassArray[5], grassArray[3], grassArray[7], grassArray[8], grassArray[6]];
}
function moveUp() {
    grassArray[6].y += 720 * 3; grassArray[7].y += 720 * 3; grassArray[8].y += 720 * 3;
    grassArray = [grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2], grassArray[3], grassArray[4], grassArray[5]];
}
function moveDown() {
    grassArray[0].y -= 720 * 3; grassArray[1].y -= 720 * 3; grassArray[2].y -= 720 * 3;
    grassArray = [grassArray[3], grassArray[4], grassArray[5], grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2]];
}

// --- EVENT LISTENERS ---
window.addEventListener('keydown', (e) => {
    let key = e.keyCode;
    if (key === 87) moveForward = true;
    else if (key === 83) moveBackwards = true;
    
    if (key === 82 && gameOver) startGame();
});

window.addEventListener('keyup', (e) => {
    let key = e.keyCode;
    if (key === 87) moveForward = false;
    else if (key === 83) moveBackwards = false;
});

window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && canShoot && !gameOver) {
        shootAnimationOver = false;
        bulletActive = true;
        bulletAngle = p1.angle;
        
        // Reset bullets to center
        [bullet1, bullet2, bullet3].forEach(b => {
            b.x = 640; b.y = 360; b.angle = p1.angle;
        });
        
        canShoot = false;
        shootSound.cloneNode(true).play(); // Play sound securely overlapping
    }
});

window.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    crosshair.x = e.clientX - rect.left - crosshair.width / 2;
    crosshair.y = e.clientY - rect.top - crosshair.height / 2;
    
    if (p1 && !gameOver) {
        p1.angle = Math.atan2(e.clientY - rect.top - 360, e.clientX - rect.left - 640);
    }
});

// --- CORE GAME LOOP ---
function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Update Environment
    grassArray.forEach(g => g.update());

    if (!gameOver) {
        // 2. Handle Player Movement & World Sliding
        if (moveForward) {
            grassArray.forEach(g => {
                g.x -= movementSpeed * 10 * Math.cos(p1.angle);
                g.y -= movementSpeed * 10 * Math.sin(p1.angle);
            });
            zombies.forEach(z => {
                z.x -= movementSpeed * 10 * Math.cos(p1.angle);
                z.y -= movementSpeed * 10 * Math.sin(p1.angle);
            });
        }
        if (moveBackwards) {
            grassArray.forEach(g => {
                g.x += movementSpeed * 5 * Math.cos(p1.angle);
                g.y += movementSpeed * 5 * Math.sin(p1.angle);
            });
            zombies.forEach(z => {
                z.x += movementSpeed * 5 * Math.cos(p1.angle);
                z.y += movementSpeed * 5 * Math.sin(p1.angle);
            });
        }

        // Check bounds for infinite scroll
        if (grassArray[4].x < -1280) moveLeft();
        if (grassArray[4].x > 1280) moveRight();
        if (grassArray[4].y < -720) moveUp();
        if (grassArray[4].y > 720) moveDown();

        // 3. Player Animation Handling
        if (!shootAnimationOver) {
            p1.animateShoot(() => {
                shootAnimationOver = true;
            });
        } else if (moveForward || moveBackwards) {
            p1.animateMovement();
        } else {
            p1.animateIdle();
        }

        // 4. Bullet Logic
        if (bulletActive) {
            bullet1.x += bulletSpeed * Math.cos(bulletAngle);
            bullet1.y += bulletSpeed * Math.sin(bulletAngle);
            // Example spread for shotgun effect
            bullet2.x += bulletSpeed * Math.cos(bulletAngle - 0.1);
            bullet2.y += bulletSpeed * Math.sin(bulletAngle - 0.1);
            bullet3.x += bulletSpeed * Math.cos(bulletAngle + 0.1);
            bullet3.y += bulletSpeed * Math.sin(bulletAngle + 0.1);

            bullet1.update(); bullet2.update(); bullet3.update();

            // Reset shooting if bullets leave screen
            if (bullet1.x < 0 || bullet1.x > 1280 || bullet1.y < 0 || bullet1.y > 720) {
                bulletActive = false;
                canShoot = true;
            }
        }

        // 5. Enemy Logic & Collision
        for (let i = zombies.length - 1; i >= 0; i--) {
            let z = zombies[i];
            
            // Check Hitbox Collision with Player
            let inHitboxX = z.x + 27 * imagesScale > (640 - 37) - p1.width * imagesScale && 
                            z.x + 27 * imagesScale < (640 + (256 - 37) * imagesScale) - p1.width * imagesScale;
            
            let inHitboxY = z.y + 79 * imagesScale > (360 - 38 * imagesScale) - p1.height * imagesScale - 80 && 
                            z.y + 79 * imagesScale < (360 + (150 - 38) * imagesScale) - p1.height * imagesScale + 50;

            if (inHitboxX && inHitboxY) {
                z.playerCollision = false;
                z.animateAttack(zombieAttackAnimation, endGame);
            } else {
                if (z.playerCollision === false) { z.animationPosition = 0; }
                z.playerCollision = true;
            }

            // Move if not colliding
            if (z.playerCollision) {
                z.moveTowardsPlayer(640, 360); // Player is fixed at center
                z.animateMovement(zombieMovementAnimation);
            }
            z.update(ctx);
        }
    }

    // 6. Draw Player and UI overlays
    if (p1) p1.update(ctx);
    crosshair.update();
    
    // Draw Text/Score UI
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 20, 50);

    // 7. Game Over Screen Handler
    if (gameOver) {
        restartScreen.update();
        ctx.fillStyle = "red";
        ctx.fillText("High Score: " + highscore, 540, 650);
        ctx.fillText("Press 'R' to Restart", 530, 690);
    }

    // Recursive call
    requestAnimationFrame(updateGameArea);
}

// Start Game Loop on load
startGame();
updateGameArea();