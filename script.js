//const { uptime } = require("node:process");

//const { deflateRaw } = require("node:zlib");

//const { setInterval } = require("node:timers");

//sconst { lookupService } = require("node:dns");

let canvas = document.getElementById("playground");
canvas.width  = window.innerWidth * 0.985;
canvas.height = window.innerHeight * 0.97;
let ctx = canvas.getContext("2d");
ctx.font = "35px Calibri";

let high_score = 0;
let heart = "❤️", two_hearts = "❤️❤️", three_hearts = "❤️❤️❤️";
let sprites = {
    meteorImg : new Image(),
    shipImg : new Image(),
    immortalShipImg : new Image(),
    enemy1Image : new Image(),
    Boss1Image : new Image(),
    
    initial(){
        this.meteorImg.src = "images/meteor.jpg";
        this.meteorImg.style.width = '60px';
        
        this.shipImg.src = "images/ship.jpg";
        this.shipImg.style.width = '60px';

        this.immortalShipImg.src = "images/immortal_ship.jpg";
        this.immortalShipImg.style.width = '60px';
    }
}



let obstacles = [];
let enemies = [];

let immortality_ticks_left = 0;
let id = 0;
let game_state = "menu";
let play_type = "none";

let SPressed, rightPressed, leftPressed, spacePressed, LMKPressed, RMKPressed, screenPressed = false;

let still_alive = true;



class Player {
    constructor () {
        this.health = 3;
        this.position_y = canvas.height * 0.95;
        this.position_x = canvas.width * 0.5;
        this.score = 0;
    }
    keyboard_move() {
        for (let i = 0; i < obstacles.length; i++){
            if (((this.position_x - obstacles[i].position_x)**2 + (this.position_y - obstacles[i].position_y)**2)**0.5 < 30 && immortality_ticks_left == 0){
                this.health--;
                immortality_ticks_left = 300;
                break;
            }
        }
        if (rightPressed){  // moving ship left and right via <- ->
            if (this.position_x < canvas.width - 30){
                this.position_x += 5;
            }
        }
        if (leftPressed) {
            if (this.position_x >= 30){
                this.position_x -= 5;
            }
        }
    }


}

class Danger {
    constructor (position_x, position_y, type, width, height) {
        this.position_x = position_x;
        this.position_y = position_y;
        this.type = type;
        this.width = width;
        this.height = height;
        this.id = id;
        id++;
    }
}

class Obstacle extends Danger {
    constructor (position_x, position_y, dx){
        super(position_x, position_y, "meteor", 30, 30);
        this.dx = dx;
        this.dy = 2;
        obstacles.push(this);
    }
    move (){
        this.position_y += this.dy;
        this.position_x += this.dx;
        if (this.position_y > canvas.height + 30 || this.position_x < 0 || this.position_x > canvas.width){
            for (let i = 0; i < obstacles.length; i++){
                if (obstacles[i].id == this.id){
                    obstacles.splice(i, 1);
                    break;
                }
            }
        }
    }
}

class Enemy extends Danger {

}

class Bullet {

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


let ship = new Player();

function draw() {  // drawing everything, generating enemies and controll ship
    if (game_state == "menu"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font
        ctx.fillText("Press space to play with keyboard", canvas.width * 0.05, canvas.height * 0.05);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.1);
        ctx.fillText("Press left mouse key to play with mouse", canvas.width * 0.05, canvas.height * 0.15);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.2);
        ctx.fillText("Press touchscreen to play", canvas.width * 0.05, canvas.height * 0.25);
        ctx.fillText("Best score: " + high_score, canvas.width * 0.2, canvas.height * 0.4)
        if (spacePressed){
            game_state = "playing";
            play_type = "keyboard";
        }
    }
    else if (game_state == "playing"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (ship.health == 3){
            ctx.fillText(three_hearts, canvas.width * 0.9, 50);
        }
        else if (ship.health == 2){
            ctx.fillText(two_hearts, canvas.width * 0.9, 50);
        }
        else if (ship.health == 1){
            ctx.fillText(heart, canvas.width * 0.9, 50);
        }
        if (obstacles.length < 2){
            let new_obstacle_position_x = Math.floor(Math.random() * canvas.width); // x position of new asteroid
            let new_dx = Math.floor(Math.random() * 4) - 2;
            asteroid = new Obstacle(new_obstacle_position_x, -30, new_dx);
        }
        else {
            for (let i = 0; i < obstacles.length; i++){
                obstacles[i].move();
                // ctx.drawImage(sprites.meteorImg, obstacles[i].position_x, obstacles[i].position_y);
                ctx.fillText("M", obstacles[i].position_x, obstacles[i].position_y);
            }
        }
        if (play_type == "keyboard"){
            ship.keyboard_move();
            if (immortality_ticks_left == 0){
                ctx.fillText("S", ship.position_x, ship.position_y);
                // ctx.drawImage(sprites.shipImg, ship.position_x, ship.position_y);
            }
            else {
                immortality_ticks_left--;
                ctx.fillText("IM", ship.position_x, ship.position_y);
                // ctx.drawImage(sprites.immortalShipImg, ship.position_x, ship.position_y);
            }
        }

        if (ship.health == 0){
            game_state = "game_over";
        }
    }
    else if (game_state == "game_over"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText("You lose!", canvas.width * 0.25, canvas.height * 0.2);
        if (ship.score > high_score){
            high_score = ship.score;
            ctx.fillText("New high score - " + high_score, canvas.width * 0.25, canvas.height * 0.25);
        }
        else {
            ctx.fillText("Your score is " + ship.score, canvas.width * 0.25, canvas.height * 0.25)
        }
        if (play_type == "keyboard"){
            ctx.fillText("Press S to go to main menu", canvas.width * 0.25, canvas.height * 0.35);
        }
        else if (play_type == "mouse"){   // tba

        }
        else if (play_type == "touchscreen"){ // tba

        }
        if (SPressed){
            ship.health = 3;
            ship.position_y = canvas.height * 0.95;
            ship.position_x = canvas.width * 0.5;
            score = 0;
            game_state = "menu";
        }
    }
}



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


setInterval(draw, 10);