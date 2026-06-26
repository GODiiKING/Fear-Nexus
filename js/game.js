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
    // 1. Update Health Bar (FIXED: Now reads player.hp and assumes 100 max)
    let maxHealth = 100;
    let currentHp = (player && player.hp !== undefined) ? player.hp : 100;
    let healthPercentage = (currentHp / maxHealth) * 100;
    
    let healthFill = document.getElementById('health-fill');
    let healthText = document.getElementById('health-text');
    
    if (healthFill) healthFill.style.width = healthPercentage + '%';
    if (healthText) healthText.innerText = currentHp + '/' + maxHealth;

    // 2. Update Magic Bar (FIXED: Now reads player.magic and assumes 100 max)
    let maxMagic = 100;
    let currentMagic = (player && player.magic !== undefined) ? player.magic : 100;
    let magicPercentage = (currentMagic / maxMagic) * 100;
    
    let magicFill = document.getElementById('magic-fill');
    let magicText = document.getElementById('magic-text');
    
    if (magicFill) magicFill.style.width = magicPercentage + '%';
    if (magicText) magicText.innerText = currentMagic + '/' + maxMagic;

    // 3. Update Ability Glows
    for (let i = 1; i <= 6; i++) {
        let abId = 'ab' + i;
        let icon = document.getElementById(abId);
        
        if (icon && typeof abilitiesReady !== 'undefined' && abilitiesReady[abId]) {
            icon.classList.remove('cooldown');
            icon.classList.add('ready');
        } else if (icon) {
            icon.classList.remove('ready');
            icon.classList.add('cooldown');
        }
    }
}

