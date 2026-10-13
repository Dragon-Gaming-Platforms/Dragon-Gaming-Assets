// takes permission to draw to the canvas
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const framerate = 60;

// sets canvas dimensions
canvas.width = 500;
canvas.height = 500;

// platform stats
const platformHeight = 200;
const platformCount = 8;
let platforms = [];

// allows moving platforms
let positioned = true;
let clicked = false;
let prevClicked = false;

// stick's stats
const maxStick = 30;
const stickSect = 7;
const stickWidth = 10;

let stick = 0;
let angle = 0;

let builtStick = false;

let score = 0;

// platform blueprint
class Platform {
    constructor(x) {
        this.width = Math.floor(Math.random() * 31) + 30;
        this.height = platformHeight;
        this.x = x;
        this.y = canvas.height - this.height;
    }
}

// fills array with initial platforms on launch
function initializePlatforms() {
    let firstPlatform = new Platform(40);
    platforms.push(firstPlatform);
    for (let i = 1; i < platformCount; i++) {
        let temp = new Platform(Math.floor(Math.random() * 51) + 100 + platforms[i - 1].x + platforms[i - 1].width);
        platforms.push(temp);
    }
}

// shifts platforms to the left
function movePlatforms() {
    for (let i = 0; i < platformCount; i++) {
        if (platforms[1].x !== 40 && !positioned) {
            platforms[i].x -= 5;
            if (Math.abs(platforms[1].x - 40) <= 4) {
                platforms[1].x = 40;
            }
        }
    }

    if (platforms[1].x === 40 && !positioned) {
        // stops shifting platforms
        positioned = true;

        // removes first platform and adds one to the end
        platforms.shift();
        let temp = new Platform(Math.floor(Math.random() * 51) + 100 + platforms[platformCount - 2].x + platforms[platformCount - 2].width);
        platforms.push(temp);
        
        stick = 0;
        angle = 0;
        builtStick = false;
    }
}

// draws rectangle to the screen
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

// draws platforms to the screen
function drawPlatforms() {
    drawRect(platforms[0].x, platforms[0].y, platforms[0].width, platforms[0].height, "#F02D3A");
    for (let i = 1; i < platformCount; i++) {
        drawRect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height, "#273043");
    }
}

// allows holding mouse button
window.addEventListener("mousedown", () => {
    clicked = true;
});

window.addEventListener("mouseup", () => {
    clicked = false;
});

// resets stats to default
function resetGame() {
    clicked = false;
    prevClicked = false;

    stick = 0;
    angle = 0;
    
    builtStick = false;
    score = 0;
}

// draws and rotates the stick
function drawStick() {
    context.save();

    context.translate(platforms[0].x + platforms[0].width / 2 + stickWidth / 2, platforms[0].y);
    context.rotate(angle * Math.PI / 180);
    context.translate(-platforms[0].x - platforms[0].width / 2 - stickWidth / 2, -platforms[0].y)
    drawRect(platforms[0].x + platforms[0].width / 2 - stickWidth / 2, platforms[0].y - stick * stickSect, stickWidth, stick * stickSect, "#FFD275");

    context.restore();

    if (builtStick) {
        if (angle < 90) {
            angle += 90 / 30;
        }
        else {
            angle = 90;
            
            // caculates right position of stick when lying
            let rightPos = platforms[0].x + platforms[0].width / 2 + stickWidth / 2 + stick * stickSect;
            if (rightPos <= platforms[1].width + platforms[1].x
            && (rightPos >= platforms[1].x)) {
                if (positioned) {
                    score++;
                    positioned = false;
                }
            }
            else {
                resetGame();
            }
        }
    }
}

// draws score to screen
function drawScore(color) {
    context.fillStyle = color;
    context.font = "700 10em Poppins";
    context.textBaseline = 'middle';
    context.textAlign = "center"; 
    context.fillText(score, canvas.width / 2, canvas.height / 2 + 20);
}

// redraws screen every frame
function draw() {
    // clears screen
    drawRect(0, 0, canvas.width, canvas.height, "#EFF6EE");
    
    drawPlatforms();
    if (stick > 0) {
        drawStick();
    }
    drawScore("#00000050");
}

// updates stats every frame
function update() {
    // increases stick size
    if (clicked && !builtStick) {
        stick++;
    }
    // lays stick
    if ((!clicked && !builtStick && prevClicked === true) || stick === maxStick) {
        builtStick = true;
    }

    prevClicked = clicked;
    movePlatforms();
}

// repeats logic each frame
function loop() {
    draw();
    update();
}

window.onload = initializePlatforms;
setInterval(loop, 1000 / 60);