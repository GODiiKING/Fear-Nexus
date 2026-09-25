"use strict";

/*
==============================================================
 NPCs
 Placeholder standing NPCs: spawn once at round 2, no movement, no
 combat. Walk up and press SPACE to talk. Each offers a two-option
 prompt; one option is flagged "correct" (small buff), the other
 "incorrect" (small debuff). Positions, sizes, and dialogue text are
 all placeholders - easy to adjust below.
==============================================================
*/

const NPC_SPAWN_ROUND = 2;
const NPC_INTERACT_RADIUS = 140;
const NPC_WIDTH = 220;   // pre-scale; final size is this * imagesScale
const NPC_HEIGHT = 320;

const NPCS = [
    { id: 'soulvyr', name: 'Soulvyr', sprite: 'images/npc/soulvyr-ingame.png', x: 180, y: 220 },
    { id: 'dominion', name: 'Dominion', sprite: 'images/npc/dominion-ingame.png', x: 590, y: 120 },
    { id: 'wanderer', name: 'Wanderer', sprite: 'images/npc/wanderer-ingame.png', x: 1000, y: 220 }
];

const NPC_DIALOGUES = {
    soulvyr: {
        prompt: '"Power finds those who take it, not those who wait." Do you agree?',
        options: [
            { text: 'Agree', correct: true },
            { text: 'Disagree', correct: false }
        ]
    },
    dominion: {
        prompt: '"Order must be earned through discipline." Do you accept this?',
        options: [
            { text: 'Accept', correct: true },
            { text: 'Reject', correct: false }
        ]
    },
    wanderer: {
        prompt: '"The path forward is never the one you expect." Will you trust it?',
        options: [
            { text: 'Trust', correct: true },
            { text: 'Doubt', correct: false }
        ]
    }
};

var npcs = [];
var npcsSpawned = false;
var activeNpcDialogue = null;

function spawnNPCs() {
    if (npcsSpawned) return;
    npcsSpawned = true;

    NPCS.forEach(function (def) {
        var img = new Image();
        var npc = {
            id: def.id,
            name: def.name,
            x: def.x,
            y: def.y,
            width: NPC_WIDTH * imagesScale,
            height: NPC_HEIGHT * imagesScale,
            image: img,
            imageLoaded: false
        };
        img.onload = function () { npc.imageLoaded = true; };
        img.src = def.sprite;

        npcs.push(npc);
    });

    console.log("[NPC] Spawned:", NPCS.map(function (n) { return n.name; }).join(", "));
}

function updateNPCSpawning() {
    if (npcsSpawned) return;
    if (window.RoundManager && window.RoundManager.round >= NPC_SPAWN_ROUND) {
        spawnNPCs();
    }
}

function drawNPCs(ctx) {
    for (let i = 0; i < npcs.length; i++) {
        let npc = npcs[i];
        if (!npc.imageLoaded) continue;
        ctx.drawImage(npc.image, npc.x, npc.y, npc.width, npc.height);
    }
}

function getNearbyNPC() {
    if (!player) return null;

    let px = player.x + (player.width || 0) / 2;
    let py = player.y + (player.height || 0) / 2;

    for (let i = 0; i < npcs.length; i++) {
        let npc = npcs[i];
        let nx = npc.x + npc.width / 2;
        let ny = npc.y + npc.height / 2;
        let dist = Math.hypot(px - nx, py - ny);
        if (dist <= NPC_INTERACT_RADIUS) return npc;
    }

    return null;
}

function openNpcDialogue(npc) {
    let data = NPC_DIALOGUES[npc.id];
    if (!data) return;

    activeNpcDialogue = { npc: npc, data: data };

    let panel = document.getElementById('npc-dialogue-panel');
    let nameEl = document.getElementById('npc-dialogue-name');
    let promptEl = document.getElementById('npc-dialogue-prompt');
    let optionsEl = document.getElementById('npc-dialogue-options');
    let resultEl = document.getElementById('npc-dialogue-result');
    if (!panel || !nameEl || !promptEl || !optionsEl) return;

    nameEl.innerText = npc.name;
    promptEl.innerText = data.prompt;
    if (resultEl) resultEl.innerText = '';
    optionsEl.innerHTML = '';

    data.options.forEach(function (opt) {
        let btn = document.createElement('button');
        btn.className = 'npc-option-btn';
        btn.type = 'button';
        btn.innerText = opt.text;
        btn.onclick = function () { resolveNpcChoice(opt); };
        optionsEl.appendChild(btn);
    });

    panel.classList.remove('hidden');

    if (typeof GameArea !== 'undefined' && GameArea.interval) {
        clearInterval(GameArea.interval);
        console.log("[NPC] Dialogue open - game paused.");
    }
}

function closeNpcDialogue() {
    activeNpcDialogue = null;
    let panel = document.getElementById('npc-dialogue-panel');
    if (panel) panel.classList.add('hidden');

    if (typeof GameArea !== 'undefined' && typeof updateGameArea === 'function') {
        clearInterval(GameArea.interval);
        GameArea.interval = setInterval(updateGameArea, 20);
        console.log("[NPC] Dialogue closed - game resumed.");
    }
}

// Placeholder payoff: correct choice grants a small permanent max-health
// boost and a full heal; incorrect costs a chunk of current health
// (never lethal). Swap this out once real NPC quest logic is designed.
function resolveNpcChoice(option) {
    if (!player) { closeNpcDialogue(); return; }

    let resultEl = document.getElementById('npc-dialogue-result');

    if (option.correct) {
        let buffAmount = 15;
        if (window.PlayerStats) window.PlayerStats.maxHealth += buffAmount;
        player.maxHp = (player.maxHp || window.maxHealth || 100) + buffAmount;
        player.hp = player.maxHp;
        if (resultEl) resultEl.innerText = "A buff washes over you. (+" + buffAmount + " Max HP, fully healed)";
        console.log("[NPC] Correct choice - buff applied.");
    } else {
        let debuffAmount = 10;
        player.hp = Math.max(1, player.hp - debuffAmount);
        if (resultEl) resultEl.innerText = "A debuff strikes you. (-" + debuffAmount + " HP)";
        console.log("[NPC] Incorrect choice - debuff applied.");
    }

    if (typeof updateUI === 'function') updateUI();

    setTimeout(closeNpcDialogue, 1200);
}

function handleNpcInteractionKey(event) {
    if (event.code !== 'Space' && event.key !== ' ') return;
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;

    if (activeNpcDialogue) { event.preventDefault(); return; }
    if (window.NovelEngine && window.NovelEngine.isActive) return;
    if (gameOver || window.playerDead) return;

    let nearby = getNearbyNPC();
    if (nearby) {
        event.preventDefault();
        openNpcDialogue(nearby);
    }
}

window.addEventListener('keydown', handleNpcInteractionKey);