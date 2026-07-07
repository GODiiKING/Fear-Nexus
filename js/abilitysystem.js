"use strict";

window.abilitySystem = {
    data: {
        square: { charges: 3, maxCharges: 3, ids: ['ab1', 'ab2', 'ab3'], costType: 'hp', costAmount: 10 },
        triangle: { charges: 3, maxCharges: 3, ids: ['ab4', 'ab5', 'ab6'], costType: 'magic', costAmount: 15 }
    },
    debugText: "System Loaded...",

    handleKey: function(key) {
        console.log("System received key:", key);
        if (key === '1') this.use('square');
        if (key === '2') this.use('triangle');
    },

    use: function(type) {
        if (!canShoot || gameOver) return;

        let ability = this.data[type];
        if (ability.charges > 0) {
            
            // Check and deduct Health for Key 1
            if (ability.costType === 'hp') {
                if (player && player.hp !== undefined && player.hp >= ability.costAmount) {
                    player.hp -= ability.costAmount;
                } else {
                    console.log("Not enough health!");
                    return;
                }
            }

            // Check and deduct Magic for Key 2
            if (ability.costType === 'magic') {
                if (player && player.magic !== undefined && player.magic >= ability.costAmount) {
                    player.magic -= ability.costAmount;
                } else {
                    console.log("Not enough magic!");
                    return;
                }
            }

            // Deduct ability charge
            ability.charges--;
            
            // Safe execution of your core shooting mechanics
            if (typeof executeProjectileLaunch === 'function') {
                executeProjectileLaunch();
            }

            window.abilitySystem.updateUI(); 
            this.debugText = `Used ${type}!`;
            setTimeout(() => { this.debugText = ""; }, 1000);
        }
    },

    updateUI: function() {
        for (let type in this.data) {
            this.data[type].ids.forEach((id, index) => {
                let el = document.getElementById(id);
                if (el) {
                    el.style.opacity = (index < this.data[type].charges) ? "1" : "0.3";
                }
            });
        }
    },

    regen: function() {
        for (let type in this.data) {
            if (this.data[type].charges < this.data[type].maxCharges) {
                this.data[type].charges++;
            }
        }
        window.abilitySystem.updateUI();
    }
};

// Initialize the regen loop
setInterval(() => window.abilitySystem.regen(), 10000);