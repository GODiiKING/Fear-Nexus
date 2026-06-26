"use strict";

// ==========================================
// BACKGROUND MOVEMENT (CAMERA) CONTROLLERS
// ==========================================

function moveLeft() {
    grassArray[2].x -= 3840;
    grassArray[5].x -= 3840;
    grassArray[8].x -= 3840;

    grassArray = [grassArray[2], grassArray[0], grassArray[1], grassArray[5], grassArray[3], grassArray[4], grassArray[8], grassArray[6], grassArray[7]];
}

function moveRight() {
    grassArray[0].x += 3840;
    grassArray[3].x += 3840;
    grassArray[6].x += 3840;

    grassArray = [grassArray[1], grassArray[2], grassArray[0], grassArray[4], grassArray[5], grassArray[3], grassArray[7], grassArray[8], grassArray[6]];
}

function moveUp() {
    grassArray[6].y += 2160;
    grassArray[7].y += 2160;
    grassArray[8].y += 2160;

    grassArray = [grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2], grassArray[3], grassArray[4], grassArray[5]];
}

function moveDown() {
    grassArray[0].y -= 2160;
    grassArray[1].y -= 2160;
    grassArray[2].y -= 2160;

    grassArray = [grassArray[3], grassArray[4], grassArray[5], grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2]];
}

// ==========================================
// UI RENDER LOOP
// ==========================================
function updateUI() {
    // 1. Update Health Bar
    let healthPercentage = (playerHealth / maxHealth) * 100;
    document.getElementById('health-fill').style.width = healthPercentage + '%';
    document.getElementById('health-text').innerText = playerHealth + '/' + maxHealth;

    // 2. Update Magic Bar
    let magicPercentage = (playerMagic / maxMagic) * 100;
    document.getElementById('magic-fill').style.width = magicPercentage + '%';
    document.getElementById('magic-text').innerText = playerMagic + '/' + maxMagic;

    // 3. Update Ability Glows
    for (let i = 1; i <= 6; i++) {
        let abId = 'ab' + i;
        let icon = document.getElementById(abId);
        
        if (abilitiesReady[abId]) {
            icon.classList.remove('cooldown');
            icon.classList.add('ready');
        } else {
            icon.classList.remove('ready');
            icon.classList.add('cooldown');
        }
    }
}

