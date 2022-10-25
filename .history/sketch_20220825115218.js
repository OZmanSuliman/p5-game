/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/


*/



var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft = false;
var isRight = false;
var isFalling = false;
var isPlummeting = false;
var isContact = false;
var isOverCanyon = false;
var stepsUp = 0;
var stepedUp = 0;
var stepsDown = 0;
var StepedDown = 0;
var stepsInCanyon = 0;
var gravity = 10;
var speed = 4;
var temporary

var clouds;
var mountains;
var trees_x;
var collectables;

var game_score;
var flagpole;
var lives;
var isRestarting = false;
var isGameEnded = false;

var jumpSound;
var collectSound;
var fallSound;
var backgroundSound;
var winSound;

var platforms;

function preload() {
    soundFormats('mp3', 'wav');

    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    collectSound = loadSound('assets/collect.mp3');
    collectSound.setVolume(0.1);
    fallSound = loadSound('assets/fall.mp3');
    fallSound.setVolume(0.1);
    backgroundSound = loadSound('assets/background.mp3');
    backgroundSound.setVolume(0.1);
    winSound = loadSound('assets/win.mp3');
    winSound.setVolume(0.1);
}


function setup() {
    createCanvas(1024, 576);
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    startGame()
    platforms = []
    platforms.push(createPlatforms(300, floorPos_y - 80, 200))
}

function draw() {
    background(100, 155, 255); // fill the sky blue
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height / 4); // draw some green ground

    push();
    translate(scrollPos, 0);


    // Draw clouds.
    for (var i = 0; i < clouds.length; i++) {
        const element = clouds[i];
        drawCloud(element);

    }

    // Draw mountains.
    for (let i = 0; i < mountains.length; i++) {
        const element = mountains[i];
        drawMountain(element);
    }

    // Draw trees.
    for (var i = 0; i < trees_x.length; i++) {
        const element = trees_x[i];
        drawTree(element);

    }

    // Draw canyons
    for (let i = 0; i < canyon.length; i++) {
        const element = canyon[i];
        checkCanyon(element);
        drawCanyon(element);
    }

    // Draw collectable items
    for (let i = 0; i < collectables.length; i++) {
        const element = collectables[i];
        checkCollectable(element);
        if (!element.isFound) {
            drawCollectable(element)
        }

    }
    for (let index = 0; index < platforms.length; index++) {
        const element = platforms[index];
        element.draw()
    }

    renderFlagpole();
    checkPlayerDie();

    pop();
    fill(250, 250, 0);
    for (let i = 0; i < lives; i++) {
        star(30 + 20 * i, 40, 5, 10, 5);
    }

    if (lives < 1) {
        isGameEnded = true;
        fill(255)
        text("Game over. Press space to continue.", width / 2, height / 2)
    } else if (flagpole.isReached) {
        isGameEnded = true;
        fill(255)
        text("Level complete. Press space to continue.", width / 2, height / 2)
    }


    // Draw game character.
    drawGameChar();


    fill(255);
    noStroke();
    text("Score: " + game_score, 20, 20);
    // Logic to make the game character move or the background scroll.
    if (!isOverCanyon) {
        if (isLeft) {
            if (gameChar_x > width * 0.2) {
                gameChar_x -= 5;
            }
            else {
                scrollPos += 5;
            }
        }

        if (isRight) {
            if (gameChar_x < width * 0.8) {
                gameChar_x += 5;
            }
            else {
                scrollPos -= 5; // negative for moving against the background
            }
        }
        if (!flagpole.isReached) {
            checkflagpole()
        }

        // Logic to make the game character rise and fall.
        // Update real position of gameChar for collision detection.
        gameChar_world_x = gameChar_x - scrollPos;
    }
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
    if (isGameEnded) {
        if (keyCode == "32") {
            isGameEnded = false;
            lives = 3;
            startGame()
        }
    } else if (!isOverCanyon) {
        if (keyCode == "39") {
            isRight = true;
        } else if (keyCode == "37") {
            isLeft = true;
        } else if (keyCode == "32" && (floorPos_y == gameChar_y || isContact)) {
            isPlummeting = true;
            jumpSound.play();
        }
    }
}

function keyReleased() {
    if (keyCode == "39") {
        isRight = false;
    } else if (keyCode == "37") {
        isLeft = false;
    }
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar() {
    //the game character
    if (isLeft && isFalling) {
        // add your jumping-left code
        jumpingLeft()
    }
    else if (isRight && isFalling) {
        // add your jumping-right code
        jumpingRight()
    }
    else if (isLeft) {
        // add your walking left code
        walkingLeft()
    }
    else if (isRight) {
        // add your walking right code
        walkingRight()
    }
    else if (isFalling || isPlummeting) {
        // add your jumping facing forwards code
        jumpingForwards()
    }
    else {
        // add your standing front facing code
        standingFront()
    }

    ///////////INTERACTION CODE//////////
    if (!isOverCanyon) {
        if (isPlummeting && floorPos_y - gameChar_y < 100 && stepsUp < gravity && !isOverCanyon) {
            // rising
            stepsUp++;
            sleep(200).then(function () {
                gameChar_y -= 100 / gravity;
                stepedUp++;
            })
        } else if (stepedUp == gravity && !isOverCanyon) {
            // end rising
            isPlummeting = false;
            stepsUp = 0;
            stepedUp = 0;
        }

        if ((floorPos_y != gameChar_y) && !isPlummeting && stepsDown < gravity && !isOverCanyon) {
            // pulling char down
            console.log(gameChar_y - floorPos_y);

            sleep(200).then(function () {
                for (let index = 0; index < platforms.length; index++) {
                    isContact = platforms[index].checkContact(gameChar_world_x, gameChar_y);
                    if (isContact) {
                        // is over platform
                        isFalling = false;
                        stepsDown = 0;
                        StepedDown = 0;
                        break;
                    } else if (floorPos_y - gameChar_y > 0) {
                        // is a free falling
                        stepsDown++;
                        isFalling = true;
                        gameChar_y += 100 / gravity;
                        StepedDown++;
                    } else {
                        // is end falling
                        isFalling = false;
                        stepsDown = 0;
                        StepedDown = 0;
                    }
                }
            })

        } else if (StepedDown == gravity && !isOverCanyon) {
            // end pulling
            isFalling = false;
            gameChar_y = floorPos_y
            stepsDown = 0;
            StepedDown = 0;
        }

        if (isContact && isPlummeting && floorPos_y - gameChar_y < 100 && stepsUp < gravity && !isOverCanyon) {
            // rising
            console.log('fuck');

            stepsUp++;
            sleep(200).then(function () {
                gameChar_y -= 100 / gravity;
                stepedUp++;
            })
        } else if (stepedUp == gravity && !isOverCanyon) {
            // end rising
            isPlummeting = false;
            stepsUp = 0;
            stepedUp = 0;
        }
    }
}

function sleep(millisecondsDuration) {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecondsDuration);
    })
}
// ---------------------------
// Background render functions
// ---------------------------

function drawCloud(cloud) {
    noStroke();
    fill(255);
    ellipse(cloud.x_pos, cloud.y_pos, 60, 40);
    ellipse(cloud.x_pos - 20, cloud.y_pos + 10, 60, 40);
    ellipse(cloud.x_pos + 20, cloud.y_pos + 10, 60, 40);
}

function drawMountain(mountain) {
    noStroke();
    fill(150, 150, 150);
    triangle(mountain.x_pos, mountain.y_pos,
        mountain.x_pos - (mountain.width / 2), mountain.y_pos + mountain.height,
        mountain.x_pos + (mountain.width / 2), mountain.y_pos + mountain.height);
}

function drawTree(trees_x) {
    noStroke();
    fill(102, 51, 0);
    rect(trees_x, - 200 / 2 + floorPos_y - 20, 50, 130);
    fill(0, 153, 0);
    triangle(trees_x - 30, - 200 / 2 + floorPos_y - 30, trees_x + 80, - 200 / 2 + floorPos_y - 30, trees_x + 25, - 200 / 2 + floorPos_y - 92);
    triangle(trees_x - 30, - 200 / 2 + floorPos_y + 30, trees_x + 80, - 200 / 2 + floorPos_y + 30, trees_x + 25, - 200 / 2 + floorPos_y - 72);
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(canyon) {
    noStroke();
    fill(255);
    fill(222, 184, 135)
    rect(canyon.x_pos, floorPos_y, canyon.width, 110);
    rect(canyon.x_pos + 50, floorPos_y, canyon.width, 110);
    fill(135, 206, 235)
    rect(canyon.x_pos + 20, floorPos_y, canyon.width + 10, 110);
}

// Function to check character is over a canyon.

function checkCanyon(canyon) {

    if (dist(canyon.x_pos + (canyon.width * 1.5), 0, gameChar_world_x, 0) < 10 && floorPos_y == gameChar_y && stepsInCanyon < gravity) {
        stepsInCanyon++;
        isFalling = true;
        isOverCanyon = true;
        sleep(200).then(function () {
            gameChar_y += 300 / gravity;
        })

    }
}

async function checkPlayerDie() {
    if (isOverCanyon) {
        fallSound.play()
        backgroundSound.stop()
        await sleep(600)
        if (!isRestarting) {
            gameChar_x = width / 2;
            gameChar_world_x = gameChar_x
            stepsInCanyon = 0
            isFalling = false
            isOverCanyon = false



            isRestarting = true
            if (lives > 1) {
                startGame()
            }
            lives -= 1
            await sleep(600)
            isRestarting = false
        }
    }

}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(collectable) {
    noStroke();
    fill(244, 164, 96);
    rect(collectable.x_pos, collectable.y_pos - 10, collectable.size, collectable.size);
    fill(235, 0, 0);
    ellipse(collectable.x_pos + 10, collectable.y_pos - 10, collectable.size * 1.5, collectable.size);
    stroke(255);
    strokeWeight(collectable.size / 3.3);
    point(collectable.x_pos + 1, collectable.y_pos - 12);
    strokeWeight(collectable.size / 5);
    point(collectable.x_pos + 17, collectable.y_pos - 7);
    noStroke();
}

// Function to check character has collected an item.

function checkCollectable(collectable) {
    // collectable interaction


    if (dist(gameChar_world_x, gameChar_y, collectable.x_pos, collectable.y_pos) < 30 && !collectable.isFound) {
        collectable.isFound = true
        game_score += 1;
        collectSound.play();
    }
}

function renderFlagpole() {
    push()
    strokeWeight(5);
    stroke(180);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250)
    fill(255, 0, 0);
    noStroke()
    if (flagpole.isReached) {
        rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
    } else {
        rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
    }
    pop()
}


function checkflagpole() {
    var d = abs(gameChar_world_x - flagpole.x_pos);
    if (d < 15) {
        winSound.play()
        backgroundSound.stop()
        flagpole.isReached = true
    }
}


function startGame() {
    backgroundSound.loop()
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    game_score = 0;

    // Variable to control the background scrolling.
    scrollPos = 0;
    flagpole = { isReached: false, x_pos: 2100 };
    // Variable to store the real position of the gameChar in the game
    // world. Needed for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    // Initialise arrays of scenery objects.
    trees_x = [100, 300, 500, 1000, 1200, 1450, 1800, 1900];

    clouds = [{ x_pos: 200, y_pos: 200 },
    { x_pos: 600, y_pos: 100 },
    { x_pos: 800, y_pos: 200 },
    { x_pos: 900, y_pos: 150 },
    { x_pos: 1300, y_pos: 200 },
    { x_pos: 1700, y_pos: 100 }];

    mountains = [{ x_pos: 700, y_pos: floorPos_y - 170, height: 175, width: 210 },
    { x_pos: 1300, y_pos: floorPos_y - 170, height: 175, width: 210 },
    { x_pos: 2200, y_pos: floorPos_y - 170, height: 175, width: 210 }];

    canyon = [{ x_pos: 200, width: 30 },
    { x_pos: 850, width: 30 },
    { x_pos: 1500, width: 30 }]

    collectables = [{ x_pos: 460, y_pos: floorPos_y, size: 20, isFound: false },
    { x_pos: 950, y_pos: floorPos_y, size: 20, isFound: false },
    { x_pos: 1245, y_pos: floorPos_y, size: 20, isFound: false },
    { x_pos: 1945, y_pos: floorPos_y, size: 20, isFound: false }]
}

function standingFront() {
    fill(255, 228, 196);
    rect(gameChar_x - 4.5, gameChar_y - 65, 9, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 25, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x + 10, gameChar_y - 44.5,
        gameChar_x + 18, gameChar_y - 30.5);
    line(gameChar_x - 10, gameChar_y - 44.5,
        gameChar_x - 20, gameChar_y - 30.5);
    stroke(205, 133, 63);
    line(gameChar_x - 8, gameChar_y - 18.5,
        gameChar_x - 12, gameChar_y - 2.5);
    line(gameChar_x + 8, gameChar_y - 18.5,
        gameChar_x + 12, gameChar_y - 2.5);
    strokeWeight(1);
}

function jumpingForwards() {
    fill(255, 228, 196);
    rect(gameChar_x - 4.5, gameChar_y - 65, 9, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 25, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x + 10, gameChar_y - 44.5,
        gameChar_x + 22, gameChar_y - 37.5);
    line(gameChar_x - 10, gameChar_y - 44.5,
        gameChar_x - 22, gameChar_y - 37.5);
    stroke(205, 133, 63);
    line(gameChar_x - 8, gameChar_y - 18.5,
        gameChar_x - 12, gameChar_y - 8.5);
    line(gameChar_x + 8, gameChar_y - 18.5,
        gameChar_x + 12, gameChar_y - 8.5);
    strokeWeight(1);
}


function jumpingRight() {
    fill(255, 228, 196);
    rect(gameChar_x - 3.5, gameChar_y - 65, 7, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 15, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x + 6, gameChar_y - 44.5,
        gameChar_x + 20, gameChar_y - 40.5);
    line(gameChar_x + 6, gameChar_y - 44.5,
        gameChar_x + 23, gameChar_y - 46.5);
    stroke(205, 133, 63);
    line(gameChar_x, gameChar_y - 15.5,
        gameChar_x + 12, gameChar_y - 5.5);
    line(gameChar_x, gameChar_y - 15.5,
        gameChar_x + 17, gameChar_y - 7.5);
    strokeWeight(1);
}

function jumpingLeft() {
    fill(255, 228, 196);
    rect(gameChar_x - 3.5, gameChar_y - 65, 7, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 15, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x - 6, gameChar_y - 44.5,
        gameChar_x - 20, gameChar_y - 40.5);
    line(gameChar_x - 6, gameChar_y - 44.5,
        gameChar_x - 23, gameChar_y - 46.5);
    stroke(205, 133, 63);
    line(gameChar_x, gameChar_y - 15.5,
        gameChar_x - 12, gameChar_y - 5.5);
    line(gameChar_x, gameChar_y - 15.5,
        gameChar_x - 17, gameChar_y - 7.5);
    strokeWeight(1);
}

function walkingLeft() {
    fill(255, 228, 196);
    rect(gameChar_x - 3.5, gameChar_y - 65, 7, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 15, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x + 2, gameChar_y - 47.5,
        gameChar_x + 12, gameChar_y - 30.5);
    line(gameChar_x - 6, gameChar_y - 44.5,
        gameChar_x - 17, gameChar_y - 37.5);
    stroke(205, 133, 63);
    line(gameChar_x - 2, gameChar_y - 15.5,
        gameChar_x - 7, gameChar_y - 2.5);
    line(gameChar_x + 2, gameChar_y - 15.5,
        gameChar_x + 4, gameChar_y);
    strokeWeight(1);
}

function walkingRight() {
    fill(255, 228, 196);
    rect(gameChar_x - 3.5, gameChar_y - 65, 7, 14);
    fill(65, 105, 225);
    ellipse(gameChar_x, gameChar_y - 32.5, 15, 35);
    stroke(65, 105, 225);
    strokeWeight(3);
    line(gameChar_x + 6, gameChar_y - 44.5,
        gameChar_x + 17, gameChar_y - 37.5);
    line(gameChar_x - 2, gameChar_y - 47.5,
        gameChar_x - 12, gameChar_y - 30.5);
    stroke(205, 133, 63);
    line(gameChar_x - 2.5, gameChar_y - 15.5,
        gameChar_x - 3, gameChar_y);
    line(gameChar_x + 2, gameChar_y - 15.5,
        gameChar_x + 8, gameChar_y - 0.5);
    strokeWeight(1);
}



function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}


function createPlatforms(x, y, length,) {
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function () {
            fill(255, 0, 255);
            rect(this.x, this.y, this.length, 20);
        },
        checkContact: function (gc_x, gc_y) {
            if (gc_x > this.x && gc_x < this.x + this.length) {
                var d = this.y - gc_y;
                if (d >= 0 && d < 5) {
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}