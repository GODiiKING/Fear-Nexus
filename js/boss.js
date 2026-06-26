"use strict";

class Boss {
    constructor(level) {
        this.width = 400; 
        this.height = 400;
        this.x = 1280; 
        this.y = 200;
        this.level = level;
        this.maxHp = 50 + (level * 20); 
        this.hp = this.maxHp;
        this.speed = 1 + (level * 0.2);
        this.sprite = "images/boss/demon-lord.png";
    }
    update() {
        this.x -= this.speed;
        // Add your draw/logic call here
    }
}