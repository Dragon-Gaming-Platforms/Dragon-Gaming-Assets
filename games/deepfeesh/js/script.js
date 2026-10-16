//elementi iz html-ja
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const winScreen = document.getElementById('winScreen');

const fishSpecies = [
    { 
        name: "Yellowfin Tuna", minWeight: 20, maxWeight: 300, 
        svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='yft' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#192f6a'/><stop offset='45%' stop-color='#4a90e2'/><stop offset='55%' stop-color='#f1c40f'/><stop offset='100%' stop-color='#e0e0e0'/></linearGradient></defs><path d='M90,50 Q70,25 40,35 Q20,38 10,50 Q20,62 40,65 Q70,75 90,50 Z' fill='url(#yft)'/><path d='M40,35 L20,0 L35,32 Z' fill='#f1c40f'/><path d='M40,65 L20,100 L35,68 Z' fill='#f1c40f'/><path d='M10,50 L-5,25 L15,45 Z' fill='#2c3e50'/><path d='M10,50 L-5,75 L15,55 Z' fill='#2c3e50'/><circle cx='78' cy='45' r='3' fill='white'/><circle cx='78' cy='45' r='1.5' fill='black'/><path d='M85,50 Q65,55 40,50' stroke='#f1c40f' stroke-width='1.5' fill='none'/></svg>`
    },
    { 
        name: "Amberjack", minWeight: 5, maxWeight: 40, 
        svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='aj' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#5c5c42'/><stop offset='40%' stop-color='#b2a26c'/><stop offset='100%' stop-color='#f5f5f5'/></linearGradient></defs><path d='M92,50 Q75,20 35,30 Q15,35 5,50 Q15,65 35,70 Q75,80 92,50 Z' fill='url(#aj)'/><path d='M85,45 Q50,45 15,50' stroke='#d4af37' stroke-width='4' fill='none'/><path d='M35,30 Q50,20 70,40' fill='#5c5c42'/><path d='M5,50 L-2,30 L12,45 Z' fill='#5c5c42'/><path d='M5,50 L-2,70 L12,55 Z' fill='#5c5c42'/><circle cx='82' cy='42' r='2.5' fill='white'/><circle cx='82' cy='42' r='1' fill='black'/></svg>`
    },
    { 
        name: "Wahoo", minWeight: 10, maxWeight: 80, 
        svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='wh' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#1b4f72'/><stop offset='50%' stop-color='#85c1e9'/><stop offset='100%' stop-color='#ffffff'/></linearGradient></defs><path d='M98,50 L80,45 Q50,38 25,43 Q10,46 2,50 Q10,54 25,57 Q50,62 80,55 Z' fill='url(#wh)'/><path d='M25,43 L23,57 M35,41 L33,59 M45,40 L43,60 M55,40 L53,60 M65,42 L64,58' stroke='#154360' stroke-width='2' fill='none'/><path d='M2,50 L-8,35 L6,46 Z' fill='#1b4f72'/><path d='M2,50 L-8,65 L6,54 Z' fill='#1b4f72'/><circle cx='88' cy='48' r='1.5' fill='black'/></svg>`
    }
];

// slike za vabe
const lureImages = [
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='l1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#ff4757'/><stop offset='50%' stop-color='#f1f2f6'/><stop offset='100%' stop-color='#a4b0be'/></linearGradient></defs><path d='M15,85 C40,105 85,55 85,15 C60,-5 5,45 15,85 Z' fill='url(#l1)' stroke='#57606f' stroke-width='1'/><path d='M85,15 Q95,0 95,20' fill='none' stroke='#2f3542' stroke-width='2'/><path d='M95,20 Q85,15 80,30' fill='none' stroke='silver' stroke-width='2'/><circle cx='75' cy='25' r='5' fill='#eccc68'/><circle cx='75' cy='25' r='2' fill='black'/></svg>`, 
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='l2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#1e90ff'/><stop offset='50%' stop-color='#dfe4ea'/><stop offset='100%' stop-color='#70a1ff'/></linearGradient></defs><path d='M10,90 L45,55 L85,15 L90,20 L50,60 L15,95 Z' fill='url(#l2)' stroke='#2f3542' stroke-width='1'/><path d='M85,15 L95,5' fill='none' stroke='silver' stroke-width='3'/><path d='M95,5 Q100,10 90,20' fill='none' stroke='#2f3542' stroke-width='2'/><circle cx='80' cy='25' r='3' fill='white'/><circle cx='80' cy='25' r='1.5' fill='black'/></svg>`
];

//svg v sliko
function createSafeImage(svgString) {
    let img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    return img;
}

// spremenljivke za trenutne vabe in ribe
let currentLureImg;
let targetFishImg;
let currentFish = null; 

//velikost
const cols = 25; 
const rows = 25;
const cellSize = canvas.width / cols;
let grid = [];

//pozicije igralca in visuals
let player = { x: 1, y: 1, visualX: 1, visualY: 1 };
let target = { x: cols - 2, y: rows - 2 }; 

let isPlaying = false;
let isAutoSolving = false;
let trail = []; 

// spremenljivke za stoparico
let startTime = 0;
let elapsedTime = 0;

// dfs algoritem - iskanje v globino za gradnjo labirinta
function generateMaze() {
    // naredimo prazno mrežo in vse napolnimo z 1
    grid = [];
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            grid[i][j] = 1; 
        }
    }

    // gremo na zacetek in ga oznacimo kot pot
    let stack = [{x: 1, y: 1}];
    grid[1][1] = 0;

    // kopljemo dokler stack ni prazen
    while(stack.length > 0) {
        let current = stack[stack.length - 1]; // vzamemo zadnjo lokacijo
        let directions = [[0, -2], [2, 0], [0, 2], [-2, 0]]; // preverjamo 2 polja naprej
        
        //da labirint ni vedno isti
        for (let i = directions.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        let carved = false; // belezimo ce smo skopali novo pot
        for (let i = 0; i < directions.length; i++) { 
            let nx = current.x + directions[i][0]; // nova tarca
            let ny = current.y + directions[i][1];

            // pogledamo ce smo znotraj mape
            if (ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1) {
                // ce je tam zid, podremo njega in umesni zid
                if (grid[ny][nx] === 1) {
                    grid[current.y + directions[i][1] / 2][current.x + directions[i][0] / 2] = 0; 
                    grid[ny][nx] = 0; 
                    stack.push({x: nx, y: ny}); // damo novo lokacijo na sklad
                    carved = true; // da je skopalo
                    break;
                }
            }
        }
        if (!carved) { // ce ni poti, gremo en korak nazaj
            stack.pop(); 
        }
    }
    grid[target.y][target.x] = 0; // da ni riba v zidu
}

// bfs algoritem - iskanje v sirino da racunalnik sam najde pot do cilja
function solveMaze() {
    let queue = [ [{ x: player.x, y: player.y }] ];
    let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[player.y][player.x] = true; // si zapomnemo kje smo ze bli

    let moves = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // premiki za 1 polje

    // dokler imamo poti, isemo
    while (queue.length > 0) {
        let path = queue.shift();
        let current = path[path.length - 1];

        // ce smo na cilju, vrnemo celo pot nazaj
        if (current.x === target.x && current.y === target.y) return path;

        // preverimo vse 4 smeri okoli sebe
        for (let i = 0; i < moves.length; i++) {
            let nx = current.x + moves[i][0];
            let ny = current.y + moves[i][1];

            // ce je prazno (0) in tam se nismo bli, gremo naprej
            if (grid[ny][nx] === 0 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([...path, { x: nx, y: ny }]);
            }
        }
    }
    return [];
}

// pobrise prejsnjo igro in nastavi vse od zacetka
function startGame() {
    generateMaze(); // naredi nov labirint
    
    // zbere random vabo
    let randomLureIndex = Math.floor(Math.random() * lureImages.length);
    currentLureImg = createSafeImage(lureImages[randomLureIndex]);

    // random riba
    let randomFishIndex = Math.floor(Math.random() * fishSpecies.length);
    currentFish = fishSpecies[randomFishIndex];
    targetFishImg = createSafeImage(currentFish.svg);

    // postavi igralca na start
    player.x = 1; player.y = 1;
    player.visualX = 1; player.visualY = 1;
    
    trail = [{x: 1, y: 1}]; // zbrise staro sled
    
    startTime = 0; elapsedTime = 0; // resetira timer
    isPlaying = true; isAutoSolving = false;
    
    winScreen.style.display = 'none'; // skrije okno za zmago
    document.getElementById('btnSolve').disabled = false;
    document.getElementById('timeDisplay').innerText = "0.00";
}

// se sprozi ko prides do ribe
function winGame() {
    isPlaying = false;
    document.getElementById('btnSolve').disabled = true;

    // izracuna tezo ribe
    let finalWeight = (Math.random() * (currentFish.maxWeight - currentFish.minWeight) + currentFish.minWeight).toFixed(2);

    // vpise podatke v html okno ob zmagi
    document.getElementById('winFishImg').src = targetFishImg.src;
    document.getElementById('catchMessage').innerText = "You caught a " + currentFish.name + "!";
    document.getElementById('weightMessage').innerText = "Weight: " + finalWeight + " kg";
    document.getElementById('timeMessage').innerText = "Time to surface: " + elapsedTime.toFixed(2) + " seconds";
    
    winScreen.style.display = 'flex';
}

// osvezi sliko 60x na sekundo
function gameLoop() {
    let currentTime = Date.now();

    // timer casovnik
    if (startTime > 0 && isPlaying) {
        elapsedTime = (currentTime - startTime) / 1000;
        document.getElementById('timeDisplay').innerText = elapsedTime.toFixed(2);
    }

    // animacija premikanja
    player.visualX += (player.x - player.visualX) * 0.35;
    player.visualY += (player.y - player.visualY) * 0.35;

    // spraznimo cel ekran preden na novo narisemo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // stene labirinta
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = 'rgba(2, 6, 15, 0.9)'; 
                ctx.fillRect(j * cellSize, i * cellSize, cellSize + 1, cellSize + 1);
            }
        }
    }

    // narise crto do vabe
    if (trail.length > 0) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x * cellSize + cellSize / 2, trail[0].y * cellSize + cellSize / 2);
        for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x * cellSize + cellSize / 2, trail[i].y * cellSize + cellSize / 2);
        }
        ctx.lineTo(player.visualX * cellSize + cellSize / 2, player.visualY * cellSize + cellSize / 2);
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // riba na cilju
    if (targetFishImg && targetFishImg.complete) {
        ctx.drawImage(targetFishImg, target.x * cellSize - 3, target.y * cellSize - 3, cellSize + 6, cellSize + 6);
    }

    // narise vabo
    if (currentLureImg && currentLureImg.complete) {
        ctx.drawImage(currentLureImg, player.visualX * cellSize, player.visualY * cellSize, cellSize, cellSize);
    }

    // klicemo funkcijo seenkrat in loopa
    requestAnimationFrame(gameLoop);
}

// nova igra
document.getElementById('btnNew').addEventListener('click', startGame);
document.getElementById('btnPlayAgain').addEventListener('click', startGame);

// gumb avtomatsko resevanje (Auto Jig)
document.getElementById('btnSolve').addEventListener('click', function() {
    if (!isPlaying || isAutoSolving) return;
    if (startTime === 0) startTime = Date.now();
    
    isAutoSolving = true;
    document.getElementById('btnSolve').disabled = true;
    
    trail = [{x: player.visualX, y: player.visualY}];
    // klicemo bfs algoritem da nam da korake do cilja
    let path = solveMaze();
    let step = 0;
    
    // premika za 1 korak naprej na 70 milisekund
    let solveInterval = setInterval(function() {
        if (step < path.length) {
            player.x = path[step].x; player.y = path[step].y;
            
            trail.push({x: player.visualX, y: player.visualY});
            if (trail.length > 50) trail.shift(); 

            step++;
        } else {
            // ko pride na konec poti..zmaga
            clearInterval(solveInterval);
            winGame();
        }
    }, 70);
});

// prvi zagon igre preden karkoli stisnemo
startGame();
requestAnimationFrame(gameLoop);

// ester egg
let egg = "";

window.addEventListener('keydown', function(e) {
    egg += e.key; 

    if (egg.toLowerCase().includes("rene")) {
        alert("Made by: Rene Krmac 😎");
        egg = ""; // pobrišemo spomin
    }
});
