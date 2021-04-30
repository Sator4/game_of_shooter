// deifine meteor asteroid; meteor was just easier to write and read




let canvas = document.getElementById("playground");
canvas.width  = window.innerWidth * 0.985;
canvas.height = window.innerHeight * 0.97;
let ctx = canvas.getContext("2d");
ctx.font = "35px Calibri";

let high_score = 0;
let heart = "❤️", two_hearts = "❤️❤️", three_hearts = "❤️❤️❤️";


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

let PPressed, RPressed, SPressed, rightPressed, leftPressed, spacePressed, LMKPressed, RMKPressed, screenPressed = false;

let meteor_size = Math.floor(canvas.width / 30);
let common_enemy_size = Math.floor(canvas.width / 30);
let boss_size = Math.floor(canvas.width / 10);
let player_size = Math.floor(canvas.width / 30);
let bullet_size = Math.ceil(canvas.width / 70);

let meteor_image = new Image();
let enemy_image = new Image();
let boss_image = new Image();
let ship_image = new Image();
let immortal_ship_image = new Image();
let bullet_image = new Image();

meteor_image.src = "images/meteor.png";
enemy_image.src = "images/enemy_1.png";
boss_image.src = "images/boss.png";
ship_image.src = "images/ship.png";
immortal_ship_image.src = "images/immortal_ship.png";
bullet_image.src = "images/bullet.png";


class Player {
    constructor () {
        this.health = 3;
        this.position_y = canvas.height * 0.97;
        this.position_x = canvas.width * 0.5;
        this.score = 0;
        this.reload_ticks_left = 0;
    }
    keyboard_move() {
        if (RPressed){
            this.health = 3;
            this.position_y = canvas.height * 0.95;
            this.position_x = canvas.width * 0.5;
            this.score = 0;
            this.reload_ticks_left = 0;
            enemies = [];
            enemy_bullets = [];
            my_bullets = [];
            obstacles = [];
            game_state = "menu";
        }
        if (PPressed){
        }

        if (this.reload_ticks_left > 0){  // reloading
            this.reload_ticks_left--;
        }
        for (let i = 0; i < obstacles.length; i++){  // checking collisions with meteors
            if (((this.position_x + player_size - obstacles[i].position_x)**2 + 
            (this.position_y - obstacles[i].position_y)**2)**0.5 < meteor_size / 2 + player_size / 2 && immortality_ticks_left == 0){
                this.health--;
                obstacles[i].health--;
                immortality_ticks_left = 200;
                break;
            }
        }
        if (rightPressed){  // moving ship left and right via <- ->
            if (this.position_x < canvas.width - player_size){
                this.position_x += 5;
            }
        }
        if (leftPressed) {
            if (this.position_x >= player_size){
                this.position_x -= 5;
            }
        }
        if (spacePressed && this.reload_ticks_left == 0){
            let new_my_bullet = new Bullet(this.position_x, this.position_y - player_size, 0, -10, "friend");
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
        super(position_x, position_y, "meteor", meteor_size, meteor_size);
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
        if (this.position_y > canvas.height || this.position_x < 0 || this.position_x > canvas.width || this.health <= 0){
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
        if (this.position_x < common_enemy_size || this.position_x > canvas.width - common_enemy_size){
            this.dx = -this.dx;
        }
        if (this.position_y > canvas.height / 2){
            this.dy = -this.dy;
        }
        if (this.position_y < common_enemy_size && this.dy < 0){
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
                let new_enemy_bullet = new Bullet(this.position_x, this.position_y + common_enemy_size / 2, 0, 3, "foe");
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
                let new_enemy_bullet = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 0, 5, "foe");
                this.reload_ticks_left = 100;
            }

            if (this.reload_special_weapon_ticks_left > 0){
                this.reload_special_weapon_ticks_left--;
            }
            else {
                let distance = ((this.position_y - ship.position_y)**2 + (this.position_x - ship.position_x)**2)**0.5;
                let x_speed = -Math.round((this.position_x - ship.position_x) * (10 / distance));
                let y_speed = -Math.round((this.position_y - ship.position_y) * (10 / distance));
                let new_bullet = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, x_speed, y_speed * 0.8, "foe");
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
                let new_enemy_bullet_1 = new Bullet(this.position_x + common_enemy_size / 2, this.position_y + common_enemy_size / 2, 0, 3, "foe");
                let new_enemy_bullet_2 = new Bullet(this.position_x - common_enemy_size / 2, this.position_y + common_enemy_size / 2, 0, 3, "foe");
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
                let new_enemy_bullet_l = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -3, 5, "foe");
                let new_enemy_bullet_c = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 0, 5, "foe");
                let new_enemy_bullet_r = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 3, 5, "foe");
                this.reload_ticks_left = 200;
            }

            if (this.reload_special_weapon_ticks_left > 0){
                this.reload_special_weapon_ticks_left--;
            }
            else {
                let bos_bullet_1 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 9, 1, "foe");
                let bos_bullet_2 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 8, 2, "foe");
                let bos_bullet_3 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 7, 3, "foe");
                let bos_bullet_4 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 6, 4, "foe");
                let bos_bullet_5 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 4, 5, "foe");
                let bos_bullet_6 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 2, 6, "foe");
                let bos_bullet_7 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, 0, 6, "foe");
                let bos_bullet_8 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -2, 6, "foe");
                let bos_bullet_9 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -4, 5, "foe");
                let bos_bullet_10 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -6, 4, "foe");
                let bos_bullet_11 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -7, 3, "foe");
                let bos_bullet_12 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -8, 2, "foe");
                let bos_bullet_13 = new Bullet(this.position_x - boss_size * 0.1, this.position_y + boss_size / 2, -9, 1, "foe");
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
        else if (type == "foe"){
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
                    if (((obstacles[i].position_x - this.position_x)**2 + (obstacles[i].position_y - this.position_y)**2)**0.5 < obstacles[i].width / 2){
                        obstacles[i].health--;
                        this.delete_this();
                    }
                }
            }
            if (this.exists){
                for (let i = 0; i < enemies.length; i++){   // checking collisions with enemies
                    if (((enemies[i].position_x - this.position_x)**2 + (enemies[i].position_y - this.position_y)**2)**0.5 < enemies[i].width / 2){
                        enemies[i].health--;
                        this.delete_this();
                    }
                }
            }
        }
        else if (this.type == "foe"){
            if (this.position_y > canvas.height){  // enemy bullet reaching floor
                this.delete_this();
            }
            if (this.exists){   // enemy bullet reaching player
                if (((ship.position_y - this.position_y)**2 + (ship.position_x - this.position_x)**2)**0.5 < player_size / 2){
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
    else if (e.keyCode == 82){
        RPressed = true;
    }
    else if (e.keyCode == 80){
        PPressed = true;
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
    else if (e.keyCode == 82){
        RPressed = false;
    }
    else if (e.keyCode == 80){
        PPressed = false;
    }
}


let ship = new Player();

function draw() {  // drawing everything, generating enemies and controll ship
    if (game_state == "menu"){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillText("Press space to play with keyboard (R to restart, P to pause)", canvas.width * 0.05, canvas.height * 0.05);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.1);
        ctx.fillText("Press left mouse key to play with mouse", canvas.width * 0.05, canvas.height * 0.15);
        ctx.fillText("or", canvas.width * 0.2, canvas.height * 0.2);
        ctx.fillStyle = "black";
        ctx.fillText("Press touchscreen to play", canvas.width * 0.05, canvas.height * 0.25);
        ctx.fillText("Best score: " + high_score, canvas.width * 0.2, canvas.height * 0.4)
        if (spacePressed){
            game_state = "playing";
            play_type = "keyboard";
            game_stage = 2;   // 1
            waves_left = 1;   // 2
            until_next_wave = 10000;
        }
    }
    else if (game_state == "pause"){
        ctx.textAlign = "center";
        ctx.font = "50px Calibri";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText("Pause", canvas.width * 0.5, canvas.height * 0.3);
        ctx.font = "35px Calibri";
        ctx.fillText("Press space to resume",  canvas.width * 0.5, canvas.height * 0.4)
        ctx.textAlign = "start";
        if (spacePressed){
            game_state = "playing";
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
                ctx.drawImage(meteor_image, obstacles[i].position_x - meteor_size / 2, obstacles[i].position_y - meteor_size / 2, meteor_size, meteor_size);
                //ctx.fillText("M", obstacles[i].position_x, obstacles[i].position_y);
            }
        }

        if (enemy_bullets.length > 0){    // displaying bullets
            for (let i = 0; i < enemy_bullets.length; i++){
                enemy_bullets[i].move();
                ctx.drawImage(bullet_image, enemy_bullets[i].position_x, enemy_bullets[i].position_y, bullet_size, bullet_size);
                // ctx.fillText("*", enemy_bullets[i].position_x, enemy_bullets[i].position_y);
            }
        }

        if (my_bullets.length > 0){        // displaying my bullets
            for (let i = 0; i < my_bullets.length; i++){
                my_bullets[i].move();
                ctx.drawImage(bullet_image, my_bullets[i].position_x, my_bullets[i].position_y, bullet_size, bullet_size);
                // ctx.fillText("*", my_bullets[i].position_x, my_bullets[i].position_y);
            }
        }

        if (game_stage == 1){
            if ((enemies.length == 0 || until_next_wave == 0) && waves_left > 0){//если волны еще будут и врагов нет или начинается след. волна
                for (let i = 0; i < 5; i++){
                    enemy = new Enemy(Math.floor(Math.random() * (canvas.width - 100) + 50), -50, "common1", common_enemy_size, common_enemy_size);
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
                boss = new Enemy(Math.floor(Math.random() * (canvas.width - 500) + 250), -100, "boss1", boss_size, boss_size);
                waves_left--;
            }
            enemies[0].move();
            if (enemies.length == 0){
                game_stage = 3;
                waves_left = 2;
            }
        }

        if (game_stage == 3){
            if ((enemies.length == 0 || until_next_wave == 0) && waves_left > 0){
                for (let i = 0; i < 5; i++){
                    enemy = new Enemy(Math.floor(Math.random() * (canvas.width - 100) + 50), -50, "common2", common_enemy_size, common_enemy_size);
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
                boss = new Enemy(Math.floor(Math.random() * (canvas.width - 500) + 250), -100, "boss2", boss_size, boss_size);
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
                    ctx.drawImage(enemy_image, enemies[i].position_x - common_enemy_size / 3, enemies[i].position_y - common_enemy_size / 2, common_enemy_size, common_enemy_size * 1.5);
                    // ctx.fillText("E", enemies[i].position_x, enemies[i].position_y);
                }
                else if (enemies[i].type == "boss1" || enemies[i].type == "boss2"){
                    ctx.drawImage(boss_image, enemies[i].position_x - boss_size / 2, enemies[i].position_y - boss_size / 3, boss_size, boss_size);
                    // ctx.font = "100px Calibri";
                    // ctx.fillText("B", enemies[i].position_x, enemies[i].position_y);
                    // ctx.font = "35px Calibri";
                }
            }
        }

        if (play_type == "keyboard"){
            ship.keyboard_move();
            if (immortality_ticks_left == 0){
                // ctx.fillText("S", ship.position_x, ship.position_y);
                ctx.drawImage(ship_image, ship.position_x - player_size / 3, ship.position_y - player_size, player_size * 1.1, player_size);
            }
            else {
                immortality_ticks_left--;
                // ctx.fillText("IM", ship.position_x, ship.position_y);
                ctx.drawImage(immortal_ship_image, ship.position_x - player_size / 2, ship.position_y - player_size * 1.1, player_size * 1.6, player_size * 1.3);
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