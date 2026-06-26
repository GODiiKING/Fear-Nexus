"use strict";

// ==========================================
// GLOBAL VARIABLES & STATE
// ==========================================

let player;
let bullet1;
let bullet2;
let bullet3;
let crosshair;
let grass1;
let grass2;
let grass3;
let grass4;
let grass5;
let grass6;
let grass7;
let grass8;
let grass9;

let bullets;
let grassArray = [];

let moveForward;
let moveBackwards;
let angle;
let movementSpeed = 0.5;

let highscore = 0;
let score = 0;

let gameOver = false;
let restartScreen;

let shootSound = new Audio('audio/sfx/shootaudio.mp3');
let alienDeathSound = new Audio('audio/sfx/demondie.mp3');
let alienSpeakSound = new Audio('audio/sfx/demontalk.mp3');
let alienSpeakSound2 = new Audio('audio/sfx/demontalk2.mp3');
let alienSpeakSound3 = new Audio('audio/sfx/demontalk3.mp3');
let gameOverSound = new Audio('audio/sfx/gameoveraudio.mp3');

let bulletAngle;
let bulletSpeed = 25;
let canShoot = true;
let shootAnimationOver = true;
let bulletActive = false;

let currentMaxX = 1280;
let currentMinX = -1280;
let currentMaxY = 720;
let currentMinY = -720;

let playerSprite = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";
let imagesScale = 0.6;

// ==========================================
// UI, HEALTH & MAGIC STATS
// ==========================================
let maxHealth = 100;
let playerHealth = 100;

let maxMagic = 100;
let playerMagic = 100;

// Ability states (true = ready/purple, false = cooldown/yellow)
let abilitiesReady = {
    ab1: true, ab2: true, ab3: true,
    ab4: true, ab5: true, ab6: true
};