// deifine meteor asteroid; meteor was just easier to write and read

//const { threadId } = require("node:worker_threads");

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
        this.shipImg.src = "images/ship.jpg";
        this.immortalShipImg.src = "images/immortal_ship.jpg";
        this.enemy1Image.src = "";
        this.Boss1Image.src = "";
    }
}



let obstacles = [];
let enemies = [];

let waves_left = 0;
let until_next_wave = 0;

let game_stage = 0;
let my_bullets = [];
let enemy_bullets = [];

let immortality_ticks_left = 0;
let id = 0;
let game_state = "menu";
let play_type = "none";

let SPressed, rightPressed, leftPressed, spacePressed, LMKPressed, RMKPressed, screenPressed = false;




class Player {
    constructor () {
        this.health = 3;
        this.position_y = canvas.height * 0.95;
        this.position_x = canvas.width * 0.5;
        this.score = 0;
        this.reload_ticks_left = 0;
    }
    keyboard_move() {
        if (this.reload_ticks_left > 0){  // reloading
            this.reload_ticks_left--;
        }
        for (let i = 0; i < obstacles.length; i++){  // checking collisions with meteors
            if (((this.position_x - obstacles[i].position_x)**2 + (this.position_y - obstacles[i].position_y)**2)**0.5 < 30 && immortality_ticks_left == 0){
                this.health--;
                obstacles[i].health--;
                immortality_ticks_left = 200;
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
        if (spacePressed && this.reload_ticks_left == 0){
            let new_my_bullet = new Bullet(this.position_x + 10, this.position_y + 10, 0, -10, "friend");
            this.reload_ticks_left = 15;
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
        this.health = 5;
        obstacles.push(this);
    }
    move (){
        this.position_y += this.dy;
        this.position_x += this.dx;
        if (this.health == 0){
            ship.score += 10;
        }
        if (this.position_y > canvas.height + 30 || this.position_x < 0 || this.position_x > canvas.width || this.health <= 0){
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
    constructor (position_x, position_y, type, width, height){
        super(position_x, position_y, type, width, height);
        if (type == "common1"){
            this.dx = Math.floor(Math.random() * 3) - 1;
            this.dy = 1;
            this.reload_ticks_left = Math.floor(Math.random() * 100) + 100;
            this.health = 3;
            this.type = "common1";
        }
        if (type == "boss1"){
            this.dx = Math.floor(Math.random() * 3) - 1;
            this.dy = 1;
            this.reload_ticks_left = 200;
            this.reload_special_weapon_ticks_left = 500;
            this.health = 20;
            this.type = "boss1";
        }
        if (type == "common2"){
            this.dx = Math.floor(Math.random() * 3) - 1;
            this.dy = 1;
            this.reload_ticks_left = Math.floor(Math.random() * 100) + 100;
            this.health = 5;
            this.type = "common2";
        }
        if (type == "boss2"){
            this.dx = Math.floor(Math.random() * 3) - 1;
            this.dy = 1;
            this.reload_ticks_left = 200;
            this.reload_special_weapon_ticks_left = 750;
            this.health = 40;
            this.type = "boss2";
        }
        enemies.push(this);
    }

    delete_this(){
        for (let i = 0; i < enemies.length; i++){
            if (enemies[i].id == this.id){
                enemies.splice(i, 1);
            }
        }
    }

    move(){
        this.position_x += this.dx;
        this.position_y += this.dy;
        if (this.position_x < 30 || this.position_x > canvas.width - 30){
            this.dx = -this.dx;
        }
        if (this.position_y > canvas.height / 2){
            this.dy = -this.dy;
        }
        if (this.position_y < 30 && this.dy < 0){
            this.dy = -this.dy;
        }

        if (this.type == "common1"){
            if (this.health <= 0){
                ship.score += 50;
                this.delete_this();
            }
            if (this.reload_ticks_left > 0){
                this.reload_ticks_left--;
            }
            else {
                let new_enemy_bullet = new Bullet(this.position_x, this.position_y + 30, 0, 3, "foe");
                this.reload_ticks_left = 150;
            }
        }

        if (this.type == "boss1"){
            if (this.health <= 0){
                ship.score += 1000;
                this.delete_this();
            }
            if (this.reload_ticks_left > 0){
                this.reload_ticks_left--;
            }
            else {
                let new_enemy_bullet = new Bullet(this.position_x, this.position_y + 50, 0, 5, "foe");
                this.reload_ticks_left = 100;
            }

            if (this.reload_special_weapon_ticks_left > 0){
                this.reload_special_weapon_ticks_left--;
            }
            else {
                let distance = ((this.position_y - ship.position_y)**2 + (this.position_x - ship.position_x)**2)**0.5;
                let x_speed = -Math.floor((this.position_x - ship.position_x) * (10 / distance));
                let y_speed = -Math.floor((this.position_y - ship.position_y) * (10 / distance));
                let new_unguided_missile = new Bullet(this.position_x, this.position_y + 50, x_speed, y_speed, "unguided_missile");
                this.reload_special_weapon_ticks_left = 250;
            }
        }

        if (this.type == "common2"){
            if (this.health <= 0){
                ship.score += 100;
                this.delete_this();
            }
            if (this.reload_ticks_left > 0){
                this.reload_ticks_left--;
            }
            else {
                let new_enemy_bullet_1 = new Bullet(this.position_x + 20, this.position_y + 30, 0, 3, "foe");
                let new_enemy_bullet_2 = new Bullet(this.position_x - 20, this.position_y + 30, 0, 3, "foe");
                this.reload_ticks_left = 150;
            }
        }

        if (this.type == "boss2"){
            if (this.health <= 0){
                ship.score += 2000;
                this.delete_this();
            }
            if (this.reload_ticks_left > 0){
                this.reload_ticks_left--;
            }
            else {
                let new_enemy_bullet_l = new Bullet(this.position_x, this.position_y + 50, -3, 5, "foe");
                let new_enemy_bullet_c = new Bullet(this.position_x, this.position_y + 50, 0, 5, "foe");
                let new_enemy_bullet_r = new Bullet(this.position_x, this.position_y + 50, 3, 5, "foe");
                this.reload_ticks_left = 200;
            }

            if (this.reload_special_weapon_ticks_left > 0){
                this.reload_special_weapon_ticks_left--;
            }
            else {
                let bos_bullet_1 = new Bullet(this.position_x, this.position_y + 50, 9, 1, "foe");
                let bos_bullet_2 = new Bullet(this.position_x, this.position_y + 50, 8, 2, "foe");
                let bos_bullet_3 = new Bullet(this.position_x, this.position_y + 50, 7, 3, "foe");
                let bos_bullet_4 = new Bullet(this.position_x, this.position_y + 50, 6, 4, "foe");
                let bos_bullet_5 = new Bullet(this.position_x, this.position_y + 50, 4, 5, "foe");
                let bos_bullet_6 = new Bullet(this.position_x, this.position_y + 50, 2, 6, "foe");
                let bos_bullet_7 = new Bullet(this.position_x, this.position_y + 50, 0, 6, "foe");
                let bos_bullet_8 = new Bullet(this.position_x, this.position_y + 50, -2, 6, "foe");
                let bos_bullet_9 = new Bullet(this.position_x, this.position_y + 50, -4, 5, "foe");
                let bos_bullet_10 = new Bullet(this.position_x, this.position_y + 50, -6, 4, "foe");
                let bos_bullet_11 = new Bullet(this.position_x, this.position_y + 50, -7, 3, "foe");
                let bos_bullet_12 = new Bullet(this.position_x, this.position_y + 50, -8, 2, "foe");
                let bos_bullet_13 = new Bullet(this.position_x, this.position_y + 50, -9, 1, "foe");
                this.reload_special_weapon_ticks_left = 500;
            }
        }
    }
}



class Bullet {
    constructor (position_x, position_y, dx, dy, type){
        this.position_x = position_x;
        this.position_y = position_y;
        this.type = type;
        this.dy = dy;
        this.dx = dx;
        this.exists = true;
        this.id = id;
        id++;
        if (type == "friend"){
            my_bullets.push(this);
        }
        else {
            enemy_bullets.push(this);
        }
    }

    delete_this(){
        for (let i = 0; i < my_bullets.length; i++){
            if (my_bullets[i].id == this.id){
                my_bullets.splice(i, 1);
                this.exists = false;
                break;
            }
        }
        for (let i = 0; i < enemy_bullets.length; i++){
            if (enemy_bullets[i].id == this.id){
                enemy_bullets.splice(i, 1);
                this.exists = false;
                break;
            }
        }
    }

    move(){  // moving bullets and checking hits
        this.position_y += this.dy;
        this.position_x += this.dx;
        if (this.type == "friend"){
            if (this.position_y < 0){   // reaching ceiling
                this.delete_this();
            }
            if (this.exists){
                for (let i = 0; i < obstacles.length; i++){  // checking collisions with meteors
                    if (((obstacles[i].position_x - this.position_x)**2 + (obstacles[i].position_y - this.position_y)**2)**0.5 < obstacles[i].width){
                        obstacles[i].health--;
                        this.delete_this();
                    }
                }
            }
            if (this.exists){
                for (let i = 0; i < enemies.length; i++){   // checking collisions with enemies
                    if (((enemies[i].position_x - this.position_x)**2 + (enemies[i].position_y - this.position_y)**2)**0.5 < enemies[i].width){
                        enemies[i].health--;
                        this.delete_this();
                    }
                }
            }
        }
        else if (this.type == "foe" || this.type == "unguided_missile"){
            if (this.position_y > canvas.height){  // enemy bullet reaching floor
                this.delete_this();
            }
            if (this.exists){   // enemy bullet reaching player
                if (((ship.position_y - this.position_y)**2 + (ship.position_x - this.position_x)**2)**0.5 < 30){
                    if (immortality_ticks_left == 0){
                        ship.health--;
                        immortality_ticks_left = 200;
                    }
                    this.delete_this();
                }
            }
        }
    }

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
        ctx.fillText("Press space to play with keyboard", canvas.width * 0.05, canvas.height * 0.05);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.1);
        ctx.fillText("Press left mouse key to play with mouse", canvas.width * 0.05, canvas.height * 0.15);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.2);
        ctx.fillText("Press touchscreen to play", canvas.width * 0.05, canvas.height * 0.25);
        ctx.fillText("Best score: " + high_score, canvas.width * 0.2, canvas.height * 0.4)
        if (spacePressed){
            game_state = "playing";
            play_type = "keyboard";
            game_stage = 1;
            waves_left = 2;
            until_next_wave = 10000;
        }
    }
    else if (game_state == "playing"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillText("Score: " + ship.score, canvas.width * 0.01, canvas.height * 0.05);
        if (ship.health == 3){
            ctx.fillText(three_hearts, canvas.width * 0.9, 50);
        }
        else if (ship.health == 2){
            ctx.fillText(two_hearts, canvas.width * 0.9, 50);
        }
        else if (ship.health == 1){
            ctx.fillText(heart, canvas.width * 0.9, 50);
        }

        if (obstacles.length < 2){  // generating a meteor
            let new_obstacle_position_x = Math.floor(Math.random() * canvas.width); // x position of new asteroid
            let new_dx = Math.floor(Math.random() * 4) - 2;
            asteroid = new Obstacle(new_obstacle_position_x, -30, new_dx);
        }
        if (obstacles.length > 0){  // displaying meteors
            for (let i = 0; i < obstacles.length; i++){
                obstacles[i].move();
                ctx.drawImage(sprites.meteorImg, obstacles[i].position_x, obstacles[i].position_y);
                //ctx.fillText("M", obstacles[i].position_x, obstacles[i].position_y);
            }
        }

        if (enemy_bullets.length > 0){    // displaying bullets
            for (let i = 0; i < enemy_bullets.length; i++){
                enemy_bullets[i].move();
                ctx.fillText("*", enemy_bullets[i].position_x, enemy_bullets[i].position_y);
            }
        }

        if (my_bullets.length > 0){        // displaying bullets
            for (let i = 0; i < my_bullets.length; i++){
                my_bullets[i].move();
                ctx.beginPath();
                ctx.arc(my_bullets[i].position_x, my_bullets[i].position_y - 30, 4, 0, Math.PI*2, true);
                ctx.fill();
                // ctx.fillText("*", my_bullets[i].position_x, my_bullets[i].position_y);
            }
        }

        if (game_stage == 1){
            if ((enemies.length == 0 || until_next_wave == 0) && waves_left > 0){//если волны еще будут и врагов нет или начинается след. волна
                for (let i = 0; i < 5; i++){
                    enemy = new Enemy(Math.floor(Math.random() * (canvas.width - 100) + 50), -50, "common1", 30, 30);
                }
                until_next_wave = 1000;
                waves_left--;
            }
            if (until_next_wave > 0){
                until_next_wave--;
            }
            if (enemies.length == 0 && waves_left == 0){
                waves_left = 1;
                game_stage = 2;
            }
        }

        if (game_stage == 2){
            if (enemies.length == 0 && waves_left > 0){
                boss = new Enemy(Math.floor(Math.random() * (canvas.width - 500) + 250), -100, "boss1", 50, 50);
                waves_left--;
            }
            enemies[0].move();
            if (enemies.length == 0){
                game_stage = 3;
                waves_left = 4;
            }
        }

        if (game_stage == 3){
            if ((enemies.length == 0 || until_next_wave == 0) && waves_left > 0){
                for (let i = 0; i < 5; i++){
                    enemy = new Enemy(Math.floor(Math.random() * (canvas.width - 100) + 50), -50, "common2", 30, 30);
                }
                until_next_wave = 1500;
                waves_left--;
            }
            if (until_next_wave > 0){
                until_next_wave--;
            }
            if (enemies.length == 0 && waves_left == 0){
                waves_left = 1;
                game_stage = 4;
            }
        }

        if (game_stage == 4){
            if (enemies.length == 0 && waves_left > 0){
                boss = new Enemy(Math.floor(Math.random() * (canvas.width - 500) + 250), -100, "boss2", 50, 50);
                waves_left--;
            }
            enemies[0].move();
            if (enemies.length == 0){
                game_stage = 5;
            }
        }

        if (game_stage == 5){
            game_state = "win";
            ship.score += ship.health * 1000;
        }




        if (enemies.length > 0){
            for (let i = 0; i < enemies.length; i++){
                enemies[i].move();
                if (enemies[i].type == "common1" || enemies[i].type == "common2"){
                    ctx.fillText("E", enemies[i].position_x, enemies[i].position_y);
                }
                else if (enemies[i].type == "boss1" || enemies[i].type == "boss2"){
                    ctx.font = "100px Calibri";
                    ctx.fillText("B", enemies[i].position_x, enemies[i].position_y);
                    ctx.font = "35px Calibri";
                }
            }
        }

        if (play_type == "keyboard"){
            ship.keyboard_move();
            if (immortality_ticks_left == 0){
                ctx.fillText("S", ship.position_x, ship.position_y);
                //ctx.drawImage(sprites.shipImg, ship.position_x, ship.position_y);
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
    else if (game_state == "game_over" || game_state == "win"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (game_state == "game_over"){
            ctx.fillText("You lost!", canvas.width * 0.25, canvas.height * 0.2);
        }
        else {
            ctx.fillText("You win", canvas.width * 0.25, canvas.height * 0.2);
        }
        if (ship.score > high_score){
            ctx.fillText("New high score: " + ship.score, canvas.width * 0.25, canvas.height * 0.25);
        }
        else {
            ctx.fillText("Your score is " + ship.score, canvas.width * 0.25, canvas.height * 0.25)
        }
        if (play_type == "keyboard"){
            ctx.fillText("Press S to go to main menu", canvas.width * 0.25, canvas.height * 0.35);
        }
        else if (play_type == "mouse"){
            ctx.fillText("Press left mouse key to go to main menu", canvas.width * 0.25, canvas.height * 0.35);
        }
        else if (play_type == "touchscreen"){ // tba

        }
        if (SPressed){
            immortality_ticks_left = 0;
            ship.health = 3;
            ship.position_y = canvas.height * 0.95;
            ship.position_x = canvas.width * 0.5;
            if (high_score < ship.score){
                high_score = ship.score;
            }
            ship.score = 0;
            obstacles = [];
            enemies = [];
            my_bullets = [];
            enemy_bullets = [];
            id = 0;
            game_state = "menu";
        }
    }
}



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


setInterval(draw, 15);