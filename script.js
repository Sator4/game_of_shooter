//const { uptime } = require("node:process");

//const { setInterval } = require("node:timers");

//sconst { lookupService } = require("node:dns");

let canvas = document.getElementById("playground");
canvas.width  = window.innerWidth * 0.985;
canvas.height = window.innerHeight * 0.97;
let ctx = canvas.getContext("2d");

let high_score = 0;

let SPressed, rightPressed, leftPressed, spacePressed, LMKPressed, RMKPressed, screenPressed = false;

let still_alive = true;


function main(){                ///////////////////////////   MAIN  ///////////////////////////////
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "35px Calibri";
    ctx.fillText("Press S for playing with keyboard", canvas.width * 0.05, canvas.height * 0.05);
    ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.1);
    ctx.fillText("Press left mouse key to play with mouse", canvas.width * 0.05, canvas.height * 0.15);
    ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.2);
    ctx.fillText("Press touchscreen to play", canvas.width * 0.05, canvas.height * 0.25);
    ctx.fillText("Best score: " + high_score, canvas.width * 0.2, canvas.height * 0.4)
    if (spacePressed){
        play_with_keyboard();
    }
}




function lose_game(){
    
}

function keyDownHandler(e) {
    if (e.keyCode == 83){
        SPressed = true;
    }
    else if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
    else if (e.keyCode == 32) {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 83){
        SPressed = false;
    }
    else if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
    else if (e.keyCode == 32) {
        spacePressed = false;
    }
}

function play_with_keyboard(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let timerId = setTimeout()
}



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

main();