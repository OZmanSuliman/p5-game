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
var isPlummeting = false
var isOverCanyon = false;
var stepsUp = 0;
var stepedUp = 0;
var stepsDown = 0;
var StepedDown = 0;
var stepsInCanyon = 0;
var gravity = 10;
var speed = 4;

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

function preload() {
    soundFormats('mp3', 'wav');

    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
}


function setup() {
    createCanvas(1024, 576);
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    startGame()
}


function keyPressed() {
    jumpSound.play();
}
