"use strict";

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
let zombies = [];
let grassArray = [];

let moveForward;
let moveBackwards;
let angle;
let movementSpeed = 0.5;

let zombiesWaitTime = [];
let zombiesAnimationPosition = [];
let zombiesPlayerCollision = [];
let spawnZombiesInterval;

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
let currentMinY = -720;let playerSprite = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png";
let zombieSprite = "images/tds_zombie-Copy/export/Movement/skeleton-move_0.png";
let imagesScale = 0.6;

let playerMovementAnimation = [];
for (let i = 0; i < 20; i++) {
    playerMovementAnimation.push(new Image());
    playerMovementAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/move/survivor-move_shotgun_" + i.toString() + ".png";
}

let playerShootAnimation = [];
for (let i = 0; i < 10; i++) {
    playerShootAnimation.push(new Image());
    playerShootAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/shoot/survivor-shoot_shotgun_" + i.toString() + ".png";
}

let playerIdleAnimation = [];
for (let i = 0; i < 20; i++) {
    playerIdleAnimation.push(new Image());
    playerIdleAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_" + i.toString() + ".png";
}

let zombieMovementAnimation = [];
for (let i = 0; i < 16; i++) {
    zombieMovementAnimation.push(new Image());
    zombieMovementAnimation[i].src = "images/tds_zombie-Copy/export/Movement/skeleton-move_" + i.toString() + ".png";
}

let zombieAttackAnimation = [];
for (let i = 0; i < 8; i++) {
    zombieAttackAnimation.push(new Image());
    zombieAttackAnimation[i].src = "images/tds_zombie-Copy/export/Attack/skeleton-attack_" + i.toString() + ".png";
}

function startGame() {
    GameArea.start();

    player = new Component(313 * imagesScale, 207 * imagesScale, playerSprite, 640 - (313 * imagesScale) / 2, 360 - (202 * imagesScale) / 2, "player", 0);
    grass1 = new Component(1280, 720, "images/bg4.jpg", -1280, 720, "grass");
    grass2 = new Component(1280, 720, "images/bg4.jpg", 0, 720, "grass");
    grass3 = new Component(1280, 720, "images/bg4.jpg", 1280, 720, "grass");
    grass4 = new Component(1280, 720, "images/bg4.jpg", -1280, 0, "grass");
    grass5 = new Component(1280, 720, "images/bg3.jpg", 0, 0, "grass");
    grass6 = new Component(1280, 720, "images/bg4.jpg", 1280, 0, "grass");
    grass7 = new Component(1280, 720, "images/bg4.jpg", -1280, -720, "grass");
    grass8 = new Component(1280, 720, "images/bg2-Copy.jpg", 0, -720, "grass");
    grass9 = new Component(1280, 720, "images/bg4.jpg", 1280, -720, "grass");

    bullet1 = new Component(100, 2, "images/bullet1.png", -10, -2, "image");
    bullet2 = new Component(100, 2, "images/bullet2.png", -10, -2, "image");
    bullet3 = new Component(100, 2, "images/bullet1.png", -10, -2, "image");
    crosshair = new Component(40, 40, "images/crosshair097.png", 640, 360, "image");
    restartScreen = new Component(1280, 720, "images/gameoverbg.png", 0, 0, "image");

    bullets = [bullet1, bullet2, bullet3];
    grassArray = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9];

    zombies = [];
    spawnZombiesInterval = setInterval(spawnZombie, getRandomInterval());
    score = 0;
    gameOver = false;

    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    window.addEventListener("mousedown", Shoot);
}

let GameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(GameArea.interval);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "Game-Window";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        let h1Element = document.querySelector("h1.Game-Title");
        h1Element.insertAdjacentElement("afterend", this.canvas);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function Component(width, height, source, x, y, type, angle = 0) {
    this.type = type;
    this.angle = angle;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.imageLoaded = false;

    if (type === "image" || type === "grass") {
        this.image = new Image();
        this.image.src = source;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    } else if (type === "player") {
        this.image = new Image();
        this.image.src = playerSprite;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    this.update = function() {
        const ctx = GameArea.context;

        if (gameOver === false) {
            ctx.font = "50px Comic Sans MS";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText(score.toString(), 640, 100);
        } else {
            ctx.font = "60px Comic Sans MS";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("High Score: " + highscore.toString(), 640, 700);
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        if (this.imageLoaded) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        if (type === "grass") {
            if (moveForward) {
                if (!shootAnimationOver) {
                    playerShootAnimationFunction();
                } else {
                    playerMovementAnimationFunction();
                }
                this.x -= movementSpeed * 10 * Math.cos(player.angle);
                this.y -= movementSpeed * 10 * Math.sin(player.angle);
                
                bullet1.x -= movementSpeed * Math.cos(bulletAngle);
                bullet1.y -= movementSpeed * Math.sin(bulletAngle);
                bullet2.x -= movementSpeed * Math.cos(bulletAngle);
                bullet2.y -= movementSpeed * Math.sin(bulletAngle);
                bullet3.x -= movementSpeed * Math.cos(bulletAngle);
                bullet3.y -= movementSpeed * Math.sin(bulletAngle);

                for (let i = 0; i < zombies.length; i++) {
                    zombies[i].x -= movementSpeed * Math.cos(player.angle);
                    zombies[i].y -= movementSpeed * Math.sin(player.angle);
                }

                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft();
                    currentMaxX += 1280;
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight();
                    currentMinX -= 1280;
                }

                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown();
                    currentMaxY += 720;
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp();
                    currentMinY -= 720;
                }
            } else if (moveBackwards) {
                if (!shootAnimationOver) {
                    playerShootAnimationFunction();
                } else {
                    playerMovementAnimationFunction();
                }
                this.x += movementSpeed * Math.cos(player.angle);
                this.y += movementSpeed * Math.sin(player.angle);

                bullet1.x += movementSpeed * Math.cos(bulletAngle);
                bullet1.y += movementSpeed * Math.sin(bulletAngle);
                bullet2.x += movementSpeed * Math.cos(bulletAngle);
                bullet2.y += movementSpeed * Math.sin(bulletAngle);
                bullet3.x += movementSpeed * Math.cos(bulletAngle);
                bullet3.y += movementSpeed * Math.sin(bulletAngle);

                for (let i = 0; i < zombies.length; i++) {
                    zombies[i].x += movementSpeed * Math.cos(player.angle);
                    zombies[i].y += movementSpeed * Math.sin(player.angle);
                }

                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft();
                    currentMaxX += 1280;
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight();
                    currentMinX -= 1280;
                }

                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown();
                    currentMaxY += 720;
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp();
                    currentMinY -= 720;
                }
            } else {
                if (shootAnimationOver) {
                    playerIdleAnimationFunction();
                } else {
                    playerShootAnimationFunction();
                }
            }
        }
        ctx.restore();
    };
}

function updateGameArea(){
    // Clear the canvas to prepare for the next frame
    GameArea.clear();

    //Game context
    let ctx = GameArea.context;
    ctx.fillText(score.toString(), 640, 60); // Display the score at the top center of the screen

    //On mouse moved:
    // On mouse move, track the player's rotation and crosshair position
    onmousemove = function(e) {
        // Get the bounding rectangle of the canvas to calculate the mouse position relative to the canvas
        //Find players rotation
        let rect = GameArea.canvas.getBoundingClientRect();

         // Calculate the angle of rotation for the player based on the mouse position
        // atan2 is used to calculate the angle between the player and the mouse position
        angle = Math.atan2(e.clientY-rect.top - player.y-150/2, e.clientX-rect.left - player.x-256/2);
        player.angle = angle; // Set the calculated angle to the player’s angle

        //Set crosshair's position
        // Update the crosshair position to follow the mouse
        crosshair.x = e.clientX-rect.left-20;  // Subtract 20 to center the crosshair on the cursor
        crosshair.y = e.clientY-rect.top-17; // Subtract 17 to center the crosshair on the cursor
    };

    //Move bullets
    // Move bullets if they are active
    if (bulletActive) {
    // Randomly adjust the direction of each bullet to create spread effect
    let bullet1Turn = ((Math.random()) * 3) * Math.PI / 180; // Bullet 1 will randomly turn by a small angle between 0 and 3 degrees
    let bullet2Turn = 0; // Bullet 2 will have no turn (fired straight)
    let bullet3Turn = ((Math.random() - 1) * 3) * Math.PI / 180; // Bullet 3 will randomly turn by a small angle between -3 and 0 degrees

    // Update the position of bullet 1 with random direction adjustment
    bullet1.x += bulletSpeed * Math.cos(bulletAngle + bullet1Turn); // Update the x position based on the angle and speed
    bullet1.y += bulletSpeed * Math.sin(bulletAngle + bullet1Turn); // Update the y position based on the angle and speed

    // Update the position of bullet 2 with no random direction adjustment (straight shot)
    bullet2.x += bulletSpeed * Math.cos(bulletAngle + bullet2Turn); // Update the x position based on the angle and speed
    bullet2.y += bulletSpeed * Math.sin(bulletAngle + bullet2Turn); // Update the y position based on the angle and speed

    // Update the position of bullet 3 with random direction adjustment
    bullet3.x += bulletSpeed * Math.cos(bulletAngle + bullet3Turn); // Update the x position based on the angle and speed
    bullet3.y += bulletSpeed * Math.sin(bulletAngle + bullet3Turn); // Update the y position based on the angle and speed

        //Reload
        // Reload mechanism to check if bullets are off-screen and allow shooting again
        if(bullet1.x > 1280)
        { // If bullet1 goes past the right edge of the screen (x > 1280)
            canShoot = true; // Allow shooting again
        }
        else if(bullet1.x < 0)
        { // If bullet1 goes past the left edge of the screen (x < 0)
            canShoot = true; // Allow shooting again
        }
        else if(bullet1.y < 0)
        { // If bullet1 goes past the top edge of the screen (y < 0)
            canShoot = true; // Allow shooting again
        }
        else if(bullet1.y > 720)
        { // If bullet1 goes past the bottom edge of the screen (y > 720)
            canShoot = true;  // Allow shooting again
        }
    }

for (let j = 0; j < bullets.length; j++) {
    for (let i = 0; i < zombies.length; i++) {
        let isHitX = bullets[j].x > zombies[i].x + 27 * imagesScale && bullets[j].x < zombies[i].x + (27 + 206) * imagesScale;
        let isHitY = bullets[j].y > zombies[i].y + 77 * imagesScale && bullets[j].y < zombies[i].y + (77 + 197) * imagesScale;

        if (isHitX && isHitY) {
            shootSound.pause();
            shootSound.currentTime = 0;
            shootSound.volume = 0.5;
            shootSound.play();

            alienDeathSound.volume = 0.9;
            if (alienDeathSound.paused) {
                alienDeathSound.play();
            }

            let randomSpeak = Math.random();
            let soundToPlay = randomSpeak < 0.33 ? alienSpeakSound : (randomSpeak < 0.66 ? alienSpeakSound2 : alienSpeakSound3);
            soundToPlay.volume = 0.9;
            soundToPlay.play();

            zombies.splice(i, 1);
            zombiesWaitTime.splice(i, 1);
            zombiesAnimationPosition.splice(i, 1);
            zombiesPlayerCollision.splice(i, 1);

            score += 1;

            bullets[j].x = 9999;
            bullets[j].y = 9999;
        }
    }
}

for (let i = 0; i < zombies.length; i++) {
    let playerXStart = 640 - 37 - player.width * imagesScale;
    let playerXEnd = 640 + (256 - 37) * imagesScale - player.width * imagesScale;
    let playerYStart = 360 - 38 * imagesScale - player.height * imagesScale - 80;
    let playerYEnd = 360 + (150 - 38) * imagesScale - player.height * imagesScale + 50;

    let inRangeX = zombies[i].x + 27 * imagesScale > playerXStart && zombies[i].x + 27 * imagesScale < playerXEnd;
    let inRangeY = zombies[i].y + 79 * imagesScale > playerYStart && zombies[i].y + 79 * imagesScale < playerYEnd;

    if (inRangeX && inRangeY) {
        zombiesPlayerCollision[i] = false;
        zombieAttackAnimationFunction(i);
    } else {
        if (zombiesPlayerCollision[i] === false) {
            zombiesAnimationPosition[i] = 0;
        }
        zombiesPlayerCollision[i] = true;
    }
}

for (let i = 0; i < zombies.length; i++) {
    if (zombiesPlayerCollision[i]) {
        let dx = zombies[i].x - player.x;
        let dy = zombies[i].y - player.y;
        let angleToPlayer = Math.atan2(dy, dx);
        
        zombies[i].angle = angleToPlayer + Math.PI;
        
        zombies[i].x -= movementSpeed * 5 * Math.cos(angleToPlayer);
        zombies[i].y -= movementSpeed * 5 * Math.sin(angleToPlayer);
        
        zombieMovementAnimationFunction(i);
    }
}

grassArray.forEach(grass => grass.update());
player.update();
bullets.forEach(bullet => bullet.update());
crosshair.update();

    // Update all zombies
for(let i = 0; i < zombies.length; i++) {
    zombies[i].update(); // Update each zombie's state (position, animation, etc.)
}

// Check if the game is over
if(gameOver) {
    restartScreen.update(); // Update the restart screen (e.g., show a "Game Over" image)
    ctx.fillText("High Score: " + highscore.toString(), 640, 650); // Display the high score on the screen
}
}

// Function to end the game
function endGame() {
    gameOver = true; // Set the game state to "game over"
    
    // Check if the current score is higher than the high score
    if(highscore < score) {
        highscore = score; // Update the high score if the current score is higher
    }
}

function handleMovementPress(event) {
    const key = event.keyCode;

    if (key === 87) {
        moveForward = true;
    } else if (key === 83) {
        moveBackwards = true;
    }

    if (key === 82 && gameOver) {
        startGame();
    }
}

function handleMovementRelease(event) {
    let key = event.keyCode;

    if (key === 87) {
        moveForward = false;
    } else if (key === 83) {
        moveBackwards = false;
    }
}

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

function Shoot(event) {
    if (event.button === 0 && canShoot && !gameOver) {
        shootAnimationOver = false;
        bulletActive = true;
        bulletAngle = player.angle;

        bullets.forEach(bullet => {
            bullet.x = 640;
            bullet.y = 360;
            bullet.angle = player.angle;
        });

        canShoot = false;
    }
}

function spawnZombie() {
    let newZombie = new Component(
        288 * imagesScale, 
        311 * imagesScale, 
        zombieSprite, 
        640 - (288 * imagesScale) / 2, 
        360 - (311 * imagesScale) / 2, 
        "image"
    );

    let randomPosition = Math.floor(Math.random() * 4) + 1;
    let zW = 288 * imagesScale;
    let zH = 311 * imagesScale;

    if (randomPosition === 1) {
        newZombie.x = -zW / 2;
        newZombie.y = Math.random() * 720 - zH / 2;
    } else if (randomPosition === 2) {
        newZombie.x = 1280 - zW / 2;
        newZombie.y = Math.random() * 720 - zH / 2;
    } else if (randomPosition === 3) {
        newZombie.x = Math.random() * 1280 - zW / 2;
        newZombie.y = 720 - zH / 2;
    } else if (randomPosition === 4) {
        newZombie.x = Math.random() * 1280 - zW / 2;
        newZombie.y = -zH / 2;
    }

    zombies.push(newZombie);
    zombiesWaitTime.push(5);
    zombiesAnimationPosition.push(0);
    zombiesPlayerCollision.push(true);
}

let difficulty = 0.25;
let maxTime = 5000;
let minTime = 100;

function getRandomInterval() {
    maxTime -= maxTime * difficulty;
    minTime -= minTime * difficulty;
    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
}

let i = 0;
let r = 0;
let waitTime = 10;

function playerMovementAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerMovementAnimation[i % playerMovementAnimation.length].src;
        i = (i + 1) % playerMovementAnimation.length;
        waitTime = 10;
    } else {
        waitTime--;
    }
}

function playerShootAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerShootAnimation[i % playerShootAnimation.length].src;
        i = (i + 1) % playerShootAnimation.length;
        waitTime = 20;

        if (playerSprite === playerShootAnimation[2].src) {
            shootAnimationOver = true;
            console.log("done");
        }
    } else {
        waitTime--;
    }
}

function playerIdleAnimationFunction() {
    if (waitTime === 0) {
        playerSprite = playerIdleAnimation[i % playerIdleAnimation.length].src;
        i = (i + 1) % playerIdleAnimation.length;
        waitTime = 30;
    } else {
        waitTime--;
    }
}

function zombieMovementAnimationFunction(zombieNum) {
    if (zombiesWaitTime[zombieNum] === 0) {
        zombies[zombieNum].image.src = zombieMovementAnimation[zombiesAnimationPosition[zombieNum] % zombieMovementAnimation.length].src;
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieMovementAnimation.length;
        zombiesWaitTime[zombieNum] = 5;
    } else {
        zombiesWaitTime[zombieNum]--;
    }
}

function zombieAttackAnimationFunction(zombieNum) {
    if (zombiesWaitTime[zombieNum] === 0) {
        zombies[zombieNum].image.src = zombieAttackAnimation[zombiesAnimationPosition[zombieNum] % zombieAttackAnimation.length].src;
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieAttackAnimation.length;
        zombiesWaitTime[zombieNum] = 5;

        if (zombies[zombieNum].image.src === zombieAttackAnimation[6].src && zombiesPlayerCollision[zombieNum] === false) {
            endGame();
        }
    } else {
        zombiesWaitTime[zombieNum]--;
    }
}