"use strict"; // Enables strict mode, which helps catch errors and prevents the use of potentially unsafe features.

//Variables //* Building Blocks 
//?---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Game Objects
let player; // The player character, controlled by the user.
let bullet1; // The first bullet fired by the player.
let bullet2; // The second bullet fired by the player.
let bullet3; // The third bullet fired by the player.
let crosshair; // The crosshair that follows the player's mouse movements.
// Grass tiles used to create the infinite scrolling background.
let grass1; // Grass tile 1
let grass2; // Grass tile 2 
let grass3; // Grass tile 3
let grass4; // Grass tile 4
let grass5; // Grass tile 5
let grass6; // Grass tile 6
let grass7; // Grass tile 7
let grass8; // Grass tile 8
let grass9; // Grass tile 9

//Game Objects Arrays
let bullets; //* Array to store bullets fired by the player.
let zombies = []; //* Array to store zombie objects in the game.
let grassArray = []; //* Array to store grass tiles for the environment/background.

//Player Movement Variables
let moveForward; // Boolean to track if the player is moving forward.
let moveBackwards; // Boolean to track if the player is moving backward.
let angle; // The angle at which the player is facing or moving (used for rotation or aiming).
let movementSpeed = 0.5; //! The speed at which the player moves.

//Zombie Variables
let zombiesWaitTime = []; // Array to manage the wait time between zombie spawns.
let zombiesAnimationPosition = []; // Array to store animation states or positions for each zombie.
let zombiesPlayerCollision = []; // Array to check for collisions between zombies and the player.
let spawnZombiesInterval; // Interval timer for spawning zombies at regular intervals.

// Score Variables
// These variables are used to track the player's score and the game's high score.
let highscore = 0; // Stores the highest score achieved across all game sessions.
let score = 0;     // Tracks the player's current score during the game.


// Gameplay Variables
// These variables control the game's state and behavior during gameplay.
let gameOver = false; // Indicates whether the game is over. Set to true when the player loses.
let restartScreen;    // Represents the restart screen element displayed when the game ends.

// Audio files //! here audio files
let shootSound = new Audio('shootaudio.mp3'); // Shooting sound
let alienDeathSound = new Audio('demondie.mp3'); // Alien death sound
let alienSpeakSound = new Audio('demontalk.mp3'); // Alien death sound
let alienSpeakSound2 = new Audio('demontalk2.mp3'); // Alien death sound
let alienSpeakSound3 = new Audio('demontalk3.mp3'); // Alien death sound
let gameOverSound = new Audio('gameoveraudio.mp3'); // Game over sound (you need to provide this)


// Shoot Variables
// These variables manage the mechanics of shooting bullets in the game.
let bulletAngle; // The angle at which the bullet is fired, based on player direction.
let bulletSpeed = 25; //! The speed of the bullet when fired. was 20
let canShoot = true;  // Boolean flag indicating if the player can shoot. Prevents rapid firing.
let shootAnimationOver = true; // Indicates if the shooting animation has finished before another shot can be made.
let bulletActive = false; // Tracks whether a bullet is currently active and in motion.


// Grass Variables
// These variables define the boundaries for the placement of grass objects in the game world.
let currentMaxX = 1280; // Maximum x-coordinate boundary for grass placement.
let currentMinX = -1280; // Minimum x-coordinate boundary for grass placement.
let currentMaxY = 720;  // Maximum y-coordinate boundary for grass placement.
let currentMinY = -720; // Minimum y-coordinate boundary for grass placement.
//?--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Animation variables
// The player's sprite image, set to the idle shotgun state of the survivor
let playerSprite = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_0.png"; //! IMPORTANT
// The zombie's sprite image, set to the movement animation of a skeleton zombie
let zombieSprite = "images/tds_zombie-Copy/export/Movement/skeleton-move_0.png"; //! IMPORTANT
// Scale factor for the images, controlling how large the sprites are rendered
let imagesScale = 0.6; //! IMPORTANT was 0.8
//!!-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Array to store the player's movement animation frames
let playerMovementAnimation = [];
// Loop to load 20 frames of the player's movement animation
for(let i = 0; i<20;i++)
{
    // Create a new Image object for each frame of the animation
    playerMovementAnimation.push(new Image());
     // Set the source of each image to the corresponding sprite for the player's movement animation
    playerMovementAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/move/survivor-move_shotgun_"+i.toString()+".png"; //! IMPORTANT
}

// Array to store the player's shoot animation frames
let playerShootAnimation = [];
//! Loop to load 3 frames of the player's shoot animation
for(let i = 0; i<10;i++) // Was 3
{
     // Create a new Image object for each frame of the shoot animation
    playerShootAnimation.push(new Image());
     // Set the source of each image to the corresponding sprite for the player's shoot animation
    playerShootAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/shoot/survivor-shoot_shotgun_"+i.toString()+".png"; //! IMPORTANT
}

// Array to store the player's idle animation frames
let playerIdleAnimation = [];
//! Loop to load 20 frames of the player's idle animation
for(let i = 0; i<20;i++)
{
    // Create a new Image object for each frame of the idle animation
    playerIdleAnimation.push(new Image());
    // Set the source of each image to the corresponding sprite for the player's idle animation
    playerIdleAnimation[i].src = "images/Top_Down_Survivor-Copy/Top_Down_Survivor/shotgun/idle/survivor-idle_shotgun_"+i.toString()+".png"; //! IMPORTANT
}

// Array to store the zombie's movement animation frames
let zombieMovementAnimation = [];
//! Loop to load 16 frames of the zombie's movement animation
for(let i = 0; i<16;i++)
{
    // Create a new Image object for each frame of the zombie's movement animation
    zombieMovementAnimation.push(new Image());
    // Set the source of each image to the corresponding sprite for the zombie's movement animation
    zombieMovementAnimation[i].src = "images/tds_zombie-Copy/export/Movement/skeleton-move_"+i.toString()+".png"; //! IMPORTANT
}

// Array to store the zombie's attack animation frames
let zombieAttackAnimation = [];
//! Loop to load 8 frames of the zombie's attack animation
for(let i = 0; i<8;i++)
{
     // Create a new Image object for each frame of the zombie's attack animation
    zombieAttackAnimation.push(new Image());
    // Set the source of each image to the corresponding sprite for the zombie's attack animation
    zombieAttackAnimation[i].src = "images/tds_zombie-Copy/export/Attack/skeleton-attack_"+i.toString()+".png"; //! IMPORTANT
}

// Function to start the game
function startGame()
{
    GameArea.start(); // Initialize the game area
    //!--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Initialize Game Objects
    //! Initialize player object with position, size, and sprite
    player = new Component(313*imagesScale,207*imagesScale,playerSprite,640-(313*imagesScale)/2,360-(202*imagesScale)/2,"player",0); 
     // Initialize grass components for the background, positioning them off-screen to create a scrolling effect
    grass1 = new Component(1280,720,"images/bg4.jpg",-1280,720,"grass"); // right down //! change here
    grass2 = new Component(1280,720,"images/bg4.jpg",0,720,"grass"); // down //! change here
    grass3 = new Component(1280,720,"images/bg4.jpg",1280,720,"grass"); // left down //! change here
    grass4 = new Component(1280,720,"images/bg4.jpg",-1280,0,"grass"); // left beside me //! change here
    grass5 = new Component(1280,720,"images/bg3.jpg",0,0,"grass"); // start here
    grass6 = new Component(1280,720,"images/bg4.jpg",1280,0,"grass"); // right beside me //! change here
    grass7 = new Component(1280,720,"images/bg4.jpg",-1280,-720,"grass"); // right up //! change here
    grass8 = new Component(1280,720,"images/bg2-Copy.jpg",0,-720,"grass"); // up //! change here
    grass9 = new Component(1280,720,"images/bg4.jpg",1280,-720,"grass"); //right left //! change here
    // Initialize bullet components with specific size, sprite, and initial position
    // Create the first bullet component
    // Parameters: width (10), height (2), image source ("images/bullet.png"),
    bullet1 = new Component(100,2,"images/bullet1.png",-10,-2,"image"); // initial x-position (-10), initial y-position (-2), and type ("image"). // was 10
    bullet2 = new Component(100,2,"images/bullet2.png",-10,-2,"image"); // This bullet has the same dimensions, image source, and initial position as bullet1. // was 10
    bullet3 = new Component(100,2,"images/bullet1.png",-10,-2,"image"); // Like the first two, this bullet uses the same dimensions, image source, and initial position. // was 10
    // Initialize crosshair component with position and size
    crosshair = new Component(40,40,"images/crosshair097.png",640,360,"image");// Initialize the restart screen image (Game Over screen)
    restartScreen = new Component(1280,720,"images/gameoverbg.png", 0,0,"image");
     // Store bullet components in an array
    bullets = [bullet1,bullet2,bullet3];
    // Store all grass components in an array
    grassArray = [grass1, grass2, grass3, grass4, grass5, grass6, grass7, grass8, grass9];
    //!--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Reset Game
    // Reset the game by clearing previous game data and initializing new values
    zombies = []; // Empty the zombies array
    spawnZombiesInterval = setInterval(spawnZombie, getRandomInterval()); // Start spawning zombies at random intervals
    score = 0; // Reset the score to 0
    gameOver = false; // Set the game over flag to false

    //Get Input
    // Set up event listeners for player input
    // Listen for keydown event to handle movement presses (e.g., WASD or arrow keys)
    window.addEventListener("keydown", handleMovementPress); 
    // Listen for keyup event to handle movement releases (e.g., stop movement when key is released)
    window.addEventListener("keyup", handleMovementRelease);
    // Listen for mousedown event to trigger shooting action when the mouse is pressed
    window.addEventListener("mousedown", Shoot);


}

// ! Create Canvas
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Create the GameArea object to manage the game canvas and its operations
let GameArea = {
    // Create a new canvas element
    canvas: document.createElement("canvas"),
    // Start the game by initializing the canvas and setting up the game loop
    start: function() {
        // Set the canvas dimensions
        this.canvas.width = 1280;
        this.canvas.height = 720;
        // Get the 2D drawing context of the canvas
        this.context = this.canvas.getContext("2d");
        // Clear any previously set game intervals
        clearInterval(GameArea.interval);
        // Set up a new interval to update the game area every 20 milliseconds
        this.interval = setInterval(updateGameArea, 20);
        // Assign an ID to the canvas element
        this.canvas.id = "Game-Window";

        //Put the canvas underneath the Game Title
        // Insert the canvas underneath the Game Title in the document
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        // Find the game title (h1 element) and place the canvas after it
        let h1Element = document.querySelector("h1.Game-Title");
        h1Element.insertAdjacentElement("afterend", this.canvas);
    },

    // Clear the entire canvas for the next frame
    clear: function() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Create Game Components
// Create a function to define game components (player, images, etc.)
// Set the component type and angle (default is 0 if not specified)
function Component(width, height, source, x, y, type, angle = 0) {
    this.type = type;  // Type of the component (e.g., "image", "grass", "player")
    this.angle = angle; // Angle for rotation (default is 0)
    this.width = width; // Width of the component
    this.height = height; // Height of the component
    this.x = x; // Initial x-coordinate position
    this.y = y; // Initial y-coordinate position
    this.imageLoaded = false; // Flag to check if the image is loaded
    
    // Load image based on the component type
    if (type === "image" || type === "grass") {
        this.image = new Image(); // Create a new Image object
        this.image.src = source; // Set the source of the image
        this.image.onload = () => {
            this.imageLoaded = true; // Set the flag to true when the image is loaded
        };
    } else if (type === "player") {
        this.image = new Image(); // Create a new Image object
        this.image.src = playerSprite; // Set the source of the image to the player's sprite
        this.image.onload = () => {
            this.imageLoaded = true; // Set the flag to true when the image is loaded
        };
    }

    // Update function to refresh the game area every frame
    this.update = function() {
        const ctx = GameArea.context; // Get the drawing context of the GameArea

        // Display score and high score text based on game status
        if (gameOver === false) {
            ctx.font = "50px Comic Sans MS"; // Set font and text style for the score display
            ctx.fillStyle = "red"; // Set text color to red
            ctx.textAlign = "center"; // Align the text to the center
            ctx.fillText(score.toString(), 640, 100); // Display the current score at position (640, 100)
        } else {
            ctx.font = "60px Comic Sans MS"; // Set font and text style for the high score display
            ctx.fillStyle = "red"; // Set text color to red
            ctx.textAlign = "center"; // Align the text to the center
            ctx.fillText("High Score: " + highscore.toString(), 640, 700); // Display the high score at position (640, 700)
        }

        ctx.save(); // Save the current canvas state before applying transformations
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);  // Move the canvas origin to the center of the component
        ctx.rotate(this.angle); // Rotate the canvas context by the component's angle

        if (this.imageLoaded) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height); // Draw the image centered at the component's position
        }
        // Draw the image if it is loaded
        // Handle grass component specific logic
        if (type === "grass") {
            if (moveForward) { // Handle player shooting or movement animation
                if (!shootAnimationOver) {
                    playerShootAnimationFunction(); // Play the shooting animation
                } else {
                    playerMovementAnimationFunction(); // Play the movement animation
                }
                // Move the player based on the angle and movement speed
                this.x -= movementSpeed * 10 * Math.cos(player.angle);
                this.y -= movementSpeed * 10 * Math.sin(player.angle);
                // Move bullets based on the player's movement
                // Move bullet1 based on the player's movement and bullet angle
                bullet1.x -= movementSpeed * Math.cos(bulletAngle);
                bullet1.y -= movementSpeed * Math.sin(bulletAngle);
                // Move bullet2 based on the player's movement and bullet angle
                bullet2.x -= movementSpeed * Math.cos(bulletAngle);
                bullet2.y -= movementSpeed * Math.sin(bulletAngle);
                // Move bullet3 based on the player's movement and bullet angle
                bullet3.x -= movementSpeed * Math.cos(bulletAngle);
                bullet3.y -= movementSpeed * Math.sin(bulletAngle);

                // Loop through all zombies and move each one based on the player's movement
                for (let i = 0; i < zombies.length; i++) {
                    // Move each zombie along the x-axis based on the player's angle and movement speed
                    zombies[i].x -= movementSpeed * Math.cos(player.angle);
                    // Move each zombie along the y-axis based on the player's angle and movement speed
                    zombies[i].y -= movementSpeed * Math.sin(player.angle);
                }
                // Check if the right side of the current grass piece has moved beyond the screen boundary
                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft();  // Move the grass to the left to create an infinite scroll effect
                    currentMaxX += 1280; // Update the maximum x-coordinate to simulate new grass placement
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight(); // Move the grass to the right to create an infinite scroll effect
                    currentMinX -= 1280; // Update the minimum x-coordinate to simulate new grass placement
                }
                // Check if the bottom side of the current grass piece has moved beyond the screen boundary
                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown(); // Move the grass down to create an infinite scroll effect
                    currentMaxY += 720; // Update the maximum y-coordinate to simulate new grass placement
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp(); // Move the grass up to create an infinite scroll effect
                    currentMinY -= 720; // Update the minimum y-coordinate to simulate new grass placement
                }
                // Handle player movement when moving backwards
            } else if (moveBackwards) {
                if (!shootAnimationOver) {
                    playerShootAnimationFunction(); // Play the shooting animation
                } else {
                    playerMovementAnimationFunction(); // Play the movement animation
                }
                // Move the player based on the angle and movement speed
                this.x += movementSpeed * Math.cos(player.angle);
                this.y += movementSpeed * Math.sin(player.angle);
                // Move bullets based on the player's movement and bullet angle
                bullet1.x += movementSpeed * Math.cos(bulletAngle);
                bullet1.y += movementSpeed * Math.sin(bulletAngle);
                bullet2.x += movementSpeed * Math.cos(bulletAngle);
                bullet2.y += movementSpeed * Math.sin(bulletAngle);
                bullet3.x += movementSpeed * Math.cos(bulletAngle);
                bullet3.y += movementSpeed * Math.sin(bulletAngle);

                // Loop through all zombies and move each one based on the player's movement
                for (let i = 0; i < zombies.length; i++) {
                    zombies[i].x += movementSpeed * Math.cos(player.angle); // Move each zombie along the x-axis based on the player's angle and movement speed
                    zombies[i].y += movementSpeed * Math.sin(player.angle); // Move each zombie along the y-axis based on the player's angle and movement speed
                }

                // Check if the right side of the current grass piece has moved beyond the screen boundary
                if (grassArray[4].x + currentMaxX > currentMaxX) {
                    moveLeft(); // Move the grass to the left to create an infinite scroll effect
                    currentMaxX += 1280; // Update the maximum x-coordinate to simulate new grass placemen
                } else if (grassArray[4].x + currentMinX < currentMinX) {
                    moveRight(); // Move the grass to the right to create an infinite scroll effect
                    currentMinX -= 1280; // Update the minimum x-coordinate to simulate new grass placement
                }
                // Check if the bottom side of the current grass piece has moved beyond the screen boundary
                if (grassArray[4].y + currentMaxY > currentMaxY) {
                    moveDown(); // Move the grass down to create an infinite scroll effect
                    currentMaxY += 720; // Update the maximum y-coordinate to simulate new grass placement
                } else if (grassArray[4].y + currentMinY < currentMinY) {
                    moveUp(); // Move the grass up to create an infinite scroll effect
                    currentMinY -= 720; // Update the minimum y-coordinate to simulate new grass placement
                }
            } else {
                 // Handle player idle or shooting animation when not moving
                if (shootAnimationOver) {
                    playerIdleAnimationFunction();  // Play the idle animation if the shoot animation is over
                } else {
                    playerShootAnimationFunction(); // Play the shoot animation if it's still ongoing
                }
            }
        }

        ctx.restore(); // Restore the original state, undoing the translate and rotate
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

//! Kill Zombies + audio effects
// Check for collisions between bullets and zombies (kill zombies)
for (let j = 0; j < bullets.length; j++) { // Loop through each bullet
    for (let i = 0; i < zombies.length; i++) { // Loop through each zombie
        // Check if the bullet's x-coordinate is within the horizontal bounds of the zombie's hitbox
        if (bullets[j].x > zombies[i].x + 27 * imagesScale && bullets[j].x < zombies[i].x + (27 + 206) * imagesScale) {
            // Check if the bullet's y-coordinate is within the vertical bounds of the zombie's hitbox
            if (bullets[j].y > zombies[i].y + 77 * imagesScale && bullets[j].y < zombies[i].y + (77 + 197) * imagesScale) {
                // If the bullet hits the zombie, remove the zombie from the game

                //! Set the volume and play the shooting sound
                shootSound.pause(); // Stop any currently playing sound
                shootSound.currentTime = 0; // Reset the audio to the start
                shootSound.volume = 0.5; //! Set volume to 50%
                shootSound.play(); // Play the shooting sound

                //! Set the volume and play the alien death sound
                alienDeathSound.volume = 0.9;
                if (alienDeathSound.paused) {
                    alienDeathSound.play();
                }

                //! Play a random demon speak sound
                let randomSpeak = Math.random(); // Generate a random number between 0 and 1
                if (randomSpeak < 0.33) {
                    alienSpeakSound.volume = 0.9; //! Set volume to
                    alienSpeakSound.play();
                } else if (randomSpeak < 0.66) {
                    alienSpeakSound2.volume = 0.9; //! Set volume to
                    alienSpeakSound2.play();
                } else {
                    alienSpeakSound3.volume = 0.9; //! Set volume to
                    alienSpeakSound3.play();
                }

                zombies.splice(i, 1); // Remove the zombie from the zombies array
                zombiesWaitTime.splice(i, 1); // Remove corresponding wait time data
                zombiesAnimationPosition.splice(i, 1); // Remove the zombie's animation position data
                zombiesPlayerCollision.splice(i, 1); // Remove the zombie's collision data with the player

                score += 1; // Increment the player's score by 1 for killing the zombie

                // Move the bullet off-screen (or out of bounds) so it doesn't keep interacting with other objects
                bullets[j].x = 9999; // Set bullet's x position out of the screen
                bullets[j].y = 9999; // Set bullet's y position out of the screen
            }
        }
    }
}



    //Collision detection
    // Collision detection between zombies and the player
for (let i = 0; i < zombies.length; i++) { // Loop through each zombie
    // Check if the zombie is within the player's collision range horizontally (x-axis)
    if (zombies[i].x + 27 * imagesScale > (640 - 37) - player.width * imagesScale && 
        zombies[i].x + (27) * imagesScale < (640 + (256 - 37) * imagesScale) - player.width * imagesScale) {
        
        // Check if the zombie is within the player's collision range vertically (y-axis)
        if (zombies[i].y + 79 * imagesScale > (360 - 38 * imagesScale) - player.height * imagesScale - 80 && 
            zombies[i].y + (79) * imagesScale < (360 + (150 - 38) * imagesScale) - player.height * imagesScale + 50) {
            
            // If the zombie collides with the player, trigger zombie attack animation
            zombiesPlayerCollision[i] = false; // Mark the zombie's collision state as false (indicating a collision)
            zombieAttackAnimationFunction(i); // Trigger the zombie's attack animation
            
        } else {
            // If there is no collision with the player
            if (zombiesPlayerCollision[i] === false) {
                zombiesAnimationPosition[i] = 0; // Reset zombie animation position if it was previously in collision
            }
            zombiesPlayerCollision[i] = true; // Update zombie's collision state to true (no collision with player)
        }
    } else {
        // If the zombie is outside the collision range
        if (zombiesPlayerCollision[i] === false) {
            zombiesAnimationPosition[i] = 0; // Reset zombie animation position if it was previously in collision
        }
        zombiesPlayerCollision[i] = true; // Update zombie's collision state to true (no collision)
    }
}


    // Move Zombies
for (let i = 0; i < zombies.length; i++) { // Loop through each zombie
    if (zombiesPlayerCollision[i]) { // If the zombie is not in collision with the player
        // Calculate the angle between the zombie and the player (angle for movement)
        zombies[i].angle = Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x) + Math.PI;
        
        // Move the zombie towards the player based on the calculated angle
        // Update zombie's x position using trigonometry (cosine for horizontal movement)
        zombies[i].x -= movementSpeed * 5 * Math.cos(Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x));
        
        // Update zombie's y position using trigonometry (sine for vertical movement)
        zombies[i].y -= movementSpeed * 5 * Math.sin(Math.atan2(zombies[i].y - player.y, zombies[i].x - player.x));
        
        // Call the zombie's movement animation function
        zombieMovementAnimationFunction(i);
    }
}


    // Update Game Objects
grass1.update(); // Update the first grass object
grass2.update(); // Update the second grass object
grass3.update(); // Update the third grass object
grass4.update(); // Update the fourth grass object
grass5.update(); // Update the fifth grass object
grass6.update(); // Update the sixth grass object
grass7.update(); // Update the seventh grass object
grass8.update(); // Update the eighth grass object
grass9.update(); // Update the ninth grass object
player.update(); // Update the player object
bullet1.update(); // Update the first bullet object
bullet2.update(); // Update the second bullet object
bullet3.update(); // Update the third bullet object
crosshair.update(); // Update the crosshair object


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


//Enable Movement Input
// Function to handle movement input when a key is pressed
function handleMovementPress(event) {
    let key = event.keyCode; // Get the key code from the event object
    
    // Check for the "W" key (keyCode 87) to move forward
    if (key === 87) {
        moveForward = true; // Set the moveForward flag to true, indicating the player should move forward
    }
    // Check for the "S" key (keyCode 83) to move backwards
    else if (key === 83) {
        moveBackwards = true; // Set the moveBackwards flag to true, indicating the player should move backward
    }

    // Check for the "R" key (keyCode 82) to restart the game
    if (key === 82) {
        if(gameOver) { // If the game is over, allow restarting
            startGame(); // Call startGame function to reset and start a new game
        }
    }
}


//Disable Movement Input
// Function to handle movement input when a key is released
function handleMovementRelease(event) {
    let key = event.keyCode; // Get the key code from the event object
    
    // Check for the "W" key (keyCode 87) to stop moving forward
    if (key === 87) {
        moveForward = false; // Set the moveForward flag to false, stopping the player from moving forward
    }
    // Check for the "S" key (keyCode 83) to stop moving backwards
    else if (key === 83) {
        moveBackwards = false; // Set the moveBackwards flag to false, stopping the player from moving backward
    }
}

// Move Grass to the left
function moveLeft() {
    // Move the specified grass components to the left by 1280 * 3 pixels
    grassArray[2].x -= 1280 * 3;
    grassArray[5].x -= 1280 * 3;
    grassArray[8].x -= 1280 * 3;

    // Rearrange the order of grass components to create the illusion of infinite scrolling to the left
    grassArray = [grassArray[2], grassArray[0], grassArray[1], grassArray[5], grassArray[3], grassArray[4], grassArray[8], grassArray[6], grassArray[7]];
}

// Move Grass to the right
function moveRight() {
    // Move the specified grass components to the right by 1280 * 3 pixels
    grassArray[0].x += 1280 * 3;
    grassArray[3].x += 1280 * 3;
    grassArray[6].x += 1280 * 3;

    // Rearrange the order of grass components to create the illusion of infinite scrolling to the right
    grassArray = [grassArray[1], grassArray[2], grassArray[0], grassArray[4], grassArray[5], grassArray[3], grassArray[7], grassArray[8], grassArray[6]];
}

// Move Grass up
function moveUp() {
    // Move the specified grass components upwards by 720 * 3 pixels
    grassArray[6].y += 720 * 3;
    grassArray[7].y += 720 * 3;
    grassArray[8].y += 720 * 3;

    // Rearrange the order of grass components to create the illusion of infinite scrolling upwards
    grassArray = [grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2], grassArray[3], grassArray[4], grassArray[5]];
}

// Move Grass down
function moveDown() {
    // Move the specified grass components downwards by 720 * 3 pixels
    grassArray[0].y -= 720 * 3;
    grassArray[1].y -= 720 * 3;
    grassArray[2].y -= 720 * 3;

    // Rearrange the order of grass components to create the illusion of infinite scrolling downwards
    grassArray = [grassArray[3], grassArray[4], grassArray[5], grassArray[6], grassArray[7], grassArray[8], grassArray[0], grassArray[1], grassArray[2]];
}


// Handle the shooting action
function Shoot(event) {
    // Check if the left mouse button (button 0) was clicked
    if (event.button === 0) {
        // Ensure the player can shoot and the game is not over
        if (canShoot && !gameOver) {
            // Set shoot animation flag to false, indicating animation is not yet complete
            shootAnimationOver = false;
            
            // Activate the bullets
            bulletActive = true;

            // Set the initial position and angle for each bullet
            bullet1.x = 640;  // Starting X position (center of screen)
            bullet1.y = 360;  // Starting Y position (center of screen)
            bullet1.angle = player.angle;  // Set the bullet's angle to the player's angle

            bullet2.x = 640;  // Same initial position for second bullet
            bullet2.y = 360;
            bullet2.angle = player.angle;

            bullet3.x = 640;  // Same initial position for third bullet
            bullet3.y = 360;
            bullet3.angle = player.angle;

            // Set the angle for all bullets to the player's angle
            bulletAngle = player.angle;

            // Prevent further shooting until the bullets leave the screen
            canShoot = false;
        }
    }
}


// Function to spawn a new zombie at a random position
function spawnZombie() {
    // Create a new zombie component with specific dimensions and sprite
    let newZombie = new Component(288 * imagesScale, 311 * imagesScale, zombieSprite, 
                                  640 - (288 * imagesScale) / 2, 360 - (311 * imagesScale) / 2, "image");

    // Randomly choose a position to spawn the zombie (1 to 4)
    let randomPosition = Math.floor(Math.random() * 4) + 1;

    // Determine the spawn position based on the random number
    if (randomPosition === 1) {
        // Spawn on the left edge of the screen
        newZombie.x = 0 - (288 * imagesScale) / 2;
        newZombie.y = Math.random() * 720 - (311 * imagesScale) / 2;
    } 
    else if (randomPosition === 2) {
        // Spawn on the right edge of the screen
        newZombie.x = 1280 - (288 * imagesScale) / 2;
        newZombie.y = Math.random() * 720 - (311 * imagesScale) / 2;
    } 
    else if (randomPosition === 3) {
        // Spawn at the bottom of the screen
        newZombie.x = Math.random() * 1280 - (288 * imagesScale) / 2;
        newZombie.y = 720 - (311 * imagesScale) / 2;
    } 
    else if (randomPosition === 4) {
        // Spawn at the top of the screen
        newZombie.x = Math.random() * 1280 - (288 * imagesScale) / 2;
        newZombie.y = 0 - (311 * imagesScale) / 2;
    }

    // Add the newly created zombie to the zombies array
    zombies.push(newZombie);

    // Add corresponding waiting time for the zombie before it can move (in seconds)
    zombiesWaitTime.push(5);

    // Set initial animation position for the zombie
    zombiesAnimationPosition.push(0);

    // Set the initial collision status with the player (true means no collision yet)
    zombiesPlayerCollision.push(true);
}

//!-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let difficulty = 0.25; // The rate at which difficulty increases over time // Was 5 //! IMPORTANT
let maxTime = 5000; // The maximum time interval (in milliseconds) for an event, like spawning a zombie or an attack
let minTime = 100; // The minimum time interval (in milliseconds) for an event, like spawning a zombie or an attack
//!-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function getRandomInterval() {
    // Adjust the maxTime and minTime based on difficulty
    maxTime -= maxTime * difficulty;
    minTime -= minTime * difficulty;
    
    // Random interval between minTime and maxTime
    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
}


//Animation variables
let i = 0; // Likely an index used for animation frames or cycles
let r = 0; // Could be used for additional animation or randomization, possibly related to rotation or other transformations
let waitTime = 10; // Controls the delay between frames or actions, likely used to pace animation or event timing


// Player Movement Animation Function
function playerMovementAnimationFunction() {
    // Check if it's time to update the animation frame
    if (waitTime === 0) {
        // Update the player's sprite to the next frame in the animation array
        playerSprite = playerMovementAnimation[i % playerMovementAnimation.length].src;

        // Increment the index to move to the next animation frame
        i = (i + 1) % playerMovementAnimation.length;

        // Reset waitTime to create a delay for the next frame update
        waitTime = 10;
    } else {
        // Decrease waitTime to control the timing of frame updates
        waitTime--;
    }
}


// Player Shoot Animation Function
// Handles the animation for the player's shooting action
function playerShootAnimationFunction()
{
    // Check if it's time to update the animation
    if(waitTime === 0)
    {
        // Update the player sprite with the next frame in the shoot animation
        playerSprite = playerShootAnimation[i % playerShootAnimation.length].src;

        // Move to the next frame in the animation sequence
        i = (i + 1) % playerShootAnimation.length;

        // Reset the wait time for the next animation frame
        waitTime=20;

        // When the animation reaches the last frame, mark the shoot animation as done
        if(playerSprite === playerShootAnimation[2].src)
        {
            shootAnimationOver = true;
            console.log("done");
        }
    }
    else{
        // Decrease the wait time for the next frame update
        waitTime--;
    }
}


// Player Idle Animation Function
// Handles the animation for the player's idle state when not moving or shooting
function playerIdleAnimationFunction()
{
    // Check if it's time to update the animation
    if(waitTime === 0)
    {
        // Update the player sprite with the next frame in the idle animation
        playerSprite = playerIdleAnimation[i % playerIdleAnimation.length].src;

        // Move to the next frame in the animation sequence
        i = (i + 1) % playerIdleAnimation.length;

        // Reset the wait time for the next animation frame
        waitTime = 30;
    }
    else {
        // Decrease the wait time for the next frame update
        waitTime--;
    }
}

//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Zombie Movement Animation Function
// Handles the animation for each zombie's movement state
function zombieMovementAnimationFunction(zombieNum)
{
    // Check if it's time to update the zombie's movement animation
    if(zombiesWaitTime[zombieNum] === 0)
    {
        // Update the zombie's sprite with the next frame in the movement animation
        zombies[zombieNum].image.src = zombieMovementAnimation[zombiesAnimationPosition[zombieNum] % zombieMovementAnimation.length].src;

        // Move to the next frame in the animation sequence
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieMovementAnimation.length;

        // Reset the wait time for the next animation frame
        zombiesWaitTime[zombieNum] = 5;
    }
    else {
        // Decrease the wait time for the next frame update
        zombiesWaitTime[zombieNum]--;
    }
}
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Zombie Attack Animation Function
// This function handles the attack animation sequence for a specific zombie.
// It updates the zombie's animation frames, manages timing, and triggers the end of the game if the player is attacked.
function zombieAttackAnimationFunction(zombieNum)
{
    if(zombiesWaitTime[zombieNum] === 0)
    { // Check if the zombie's wait time for the next frame of animation has elapsed.
        zombies[zombieNum].image.src = zombieAttackAnimation[zombiesAnimationPosition[zombieNum] % zombieAttackAnimation.length].src;
        zombiesAnimationPosition[zombieNum] = (zombiesAnimationPosition[zombieNum] + 1) % zombieAttackAnimation.length;
        zombiesWaitTime[zombieNum]=5;

        // Update the zombie's image to the current frame in the attack animation sequence.
        // Check if the zombie's current frame is the last frame in the attack animation.
        if(zombies[zombieNum].image.src === zombieAttackAnimation[6].src)
        {   
            if(zombiesPlayerCollision[zombieNum] === false)  // If the zombie reaches the attack frame and hasn't already collided with the player, end the game.
            {
                endGame(); // Call the function to end the game.
            }
        }
    }
    else{
        zombiesWaitTime[zombieNum]--;  // Decrease the wait time until the next frame of animation is displayed.
    }
}
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------