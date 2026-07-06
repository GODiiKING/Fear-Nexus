window.PerkManager = {
    souls: 0,
    trees: {
        healthRegen: {
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                PlayerStats.healthRegen += 0.5;
            }
        }
    },

    addSouls(amount) {
        this.souls += amount;
        UI_PerkStore.notify();
    },

    buy(treeName) {
        let tree = this.trees[treeName];
        if (this.souls >= tree.cost && tree.level < tree.maxLevel) {
            this.souls -= tree.cost;
            tree.level++;
            tree.apply();
            tree.cost = Math.floor(tree.cost * 1.25);
        }
    }
};

window.PerkManager = {
    souls: 0,
    trees: {
        healthRegen: {
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                PlayerStats.healthRegen += 0.5; // +0.5 HP/sec
            }
        },
        magicRegen: {
            cost: 100,
            level: 0,
            maxLevel: 16,
            apply() {
                PlayerStats.magicRegen += 0.5; // +0.5 MP/sec
            }
        },
        damageMitigation: {
            cost: 150,
            level: 0,
            maxLevel: 10,
            apply() {
                PlayerStats.damageMitigation += 0.05; // +5% reduction
            }
        },
        cooldownReduction: {
            cost: 200,
            level: 0,
            maxLevel: 10,
            apply() {
                PlayerStats.cooldownReduction += 0.05; // +5% faster cooldowns
            }
        },
        moveSpeed: {
            cost: 120,
            level: 0,
            maxLevel: 10,
            apply() {
                PlayerStats.moveSpeedBonus += 0.2; // +0.2 movement speed
            }
        },
        attackSpeed: {
            cost: 120,
            level: 0,
            maxLevel: 10,
            apply() {
                PlayerStats.attackSpeedBonus += 0.2; // +0.2 attack speed
            }
        }
    },

    addSouls(amount) {
        this.souls += amount;
        UI_PerkStore.notify();
    },

    buy(treeName) {
        let tree = this.trees[treeName];
        if (this.souls >= tree.cost && tree.level < tree.maxLevel) {
            this.souls -= tree.cost;
            tree.level++;
            tree.apply();
            tree.cost = Math.floor(tree.cost * 1.25);
        }
    }
};
