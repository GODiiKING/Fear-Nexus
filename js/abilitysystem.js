"use strict";

window.abilitySystem = {
    data: {
        square: { charges: 3, maxCharges: 3, ids: ['ab1', 'ab2', 'ab3'] },
        triangle: { charges: 3, maxCharges: 3, ids: ['ab4', 'ab5', 'ab6'] }
    },
    debugText: "System Loaded...",

    handleKey: function(key) {
        console.log("System received key:", key);
        if (key === '1') this.use('square');
        if (key === '2') this.use('triangle');
    },

    use: function(type) {
        if (this.data[type].charges > 0) {
            this.data[type].charges--;
            // FIXED: Directly call the function via the global object
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