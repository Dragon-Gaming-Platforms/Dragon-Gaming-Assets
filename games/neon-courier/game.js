const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start-button");
const statusText = document.querySelector("#status");
const scoreText = document.querySelector("#score");
const bestText = document.querySelector("#best");

const WIDTH = 900;
const HEIGHT = 520;
const keys = new Set();
let animationFrame;
let game;
let best = Number(localStorage.getItem("neon-courier-best") || 0);

canvas.width = WIDTH;
canvas.height = HEIGHT;
bestText.textContent = best;

function resetGame() {
  game = {
    active: true,
    score: 0,
    speed: 2.7,
    lastTime: 0,
    spawnTimer: 0,
    sparkTimer: 0,
    player: { x: WIDTH / 2 - 22, y: HEIGHT - 70, width: 44, height: 28, speed: 7 },
    blocks: [],
    sparks: [],
    particles: [],
    stars: Array.from({ length: 70 }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.7 + 0.15,
    })),
  };
  overlay.classList.add("hidden");
  statusText.textContent = "Run active — collect the yellow sparks.";
  scoreText.textContent = "0";
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(loop);
}

function spawnBlock() {
  const width = 25 + Math.random() * 48;
  game.blocks.push({
    x: Math.random() * (WIDTH - width),
    y: -40,
    width,
    height: 18 + Math.random() * 26,
    speed: game.speed * (0.85 + Math.random() * 0.5),
  });
}

function spawnSpark() {
  game.sparks.push({ x: 16 + Math.random() * (WIDTH - 32), y: -20, size: 7, speed: game.speed * 0.8 });
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function playerIsNear(spark) {
  return Math.abs(game.player.x + game.player.width / 2 - spark.x) < 30 &&
    Math.abs(game.player.y + game.player.height / 2 - spark.y) < 30;
}

function addParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i += 1) {
    game.particles.push({ x, y, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4, life: 1, color });
  }
}

function update(delta) {
  const { player } = game;
  if (keys.has("arrowleft") || keys.has("a")) player.x -= player.speed * delta;
  if (keys.has("arrowright") || keys.has("d")) player.x += player.speed * delta;
  player.x = Math.max(12, Math.min(WIDTH - player.width - 12, player.x));
  game.spawnTimer += delta;
  game.sparkTimer += delta;
  game.speed += delta * 0.003;
  if (game.spawnTimer > Math.max(24, 54 - game.score * 0.08)) {
    spawnBlock();
    game.spawnTimer = 0;
  }
  if (game.sparkTimer > 90) {
    spawnSpark();
    game.sparkTimer = 0;
  }
  game.blocks.forEach((block) => { block.y += block.speed * delta; });
  game.sparks.forEach((spark) => { spark.y += spark.speed * delta; });
  game.particles.forEach((particle) => {
    particle.x += particle.dx * delta;
    particle.y += particle.dy * delta;
    particle.life -= 0.025 * delta;
  });
  game.blocks = game.blocks.filter((block) => block.y < HEIGHT + 50);
  game.sparks = game.sparks.filter((spark) => spark.y < HEIGHT + 30);
  game.particles = game.particles.filter((particle) => particle.life > 0);
  if (game.blocks.some((block) => overlaps(player, block))) return endGame();
  game.sparks = game.sparks.filter((spark) => {
    if (playerIsNear(spark)) {
      game.score += 25;
      addParticles(spark.x, spark.y, "#ffe66d", 14);
      return false;
    }
    return true;
  });
  game.score += Math.floor(delta * 0.04);
  scoreText.textContent = game.score;
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#0b1a31");
  gradient.addColorStop(1, "#07101f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "rgba(119, 236, 255, 0.7)";
  game.stars.forEach((star) => { context.globalAlpha = star.alpha; context.fillRect(star.x, star.y, star.size, star.size); });
  context.globalAlpha = 1;
  context.strokeStyle = "rgba(119, 236, 255, 0.1)";
  context.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 45) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, HEIGHT); context.stroke(); }
  for (let y = 0; y < HEIGHT; y += 45) { context.beginPath(); context.moveTo(0, y); context.lineTo(WIDTH, y); context.stroke(); }
  game.blocks.forEach((block) => {
    context.shadowBlur = 16;
    context.shadowColor = "#ff6ec7";
    context.fillStyle = "#ff6ec7";
    context.fillRect(block.x, block.y, block.width, block.height);
    context.shadowBlur = 0;
  });
  game.sparks.forEach((spark) => {
    context.shadowBlur = 20;
    context.shadowColor = "#ffe66d";
    context.fillStyle = "#ffe66d";
    context.beginPath();
    context.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  });
  game.particles.forEach((particle) => {
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;
    context.fillRect(particle.x, particle.y, 4, 4);
  });
  context.globalAlpha = 1;
  const { player } = game;
  context.shadowBlur = 22;
  context.shadowColor = "#77ecff";
  context.fillStyle = "#77ecff";
  context.beginPath();
  context.moveTo(player.x, player.y + player.height);
  context.lineTo(player.x + player.width / 2, player.y);
  context.lineTo(player.x + player.width, player.y + player.height);
  context.closePath();
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = "#07101f";
  context.fillRect(player.x + 17, player.y + 13, 10, 7);
}

function loop(timestamp) {
  if (!game.active) return;
  const delta = Math.min((timestamp - game.lastTime) / 16.67 || 1, 2);
  game.lastTime = timestamp;
  update(delta);
  draw();
  if (game.active) animationFrame = requestAnimationFrame(loop);
}

function endGame() {
  game.active = false;
  addParticles(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2, "#ff6ec7", 25);
  draw();
  if (game.score > best) {
    best = game.score;
    localStorage.setItem("neon-courier-best", String(best));
    bestText.textContent = best;
  }
  statusText.textContent = "Signal lost. Ready for another run?";
  startButton.textContent = "Try again";
  overlay.querySelector("h2").textContent = `Run ended: ${game.score} points`;
  overlay.querySelector("p").textContent = "The city is still humming. Take another shot at the high score.";
  overlay.classList.remove("hidden");
}

startButton.addEventListener("click", resetGame);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "a", "d", " "].includes(key)) event.preventDefault();
  keys.add(key);
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
document.querySelectorAll("[data-direction]").forEach((button) => {
  const key = button.dataset.direction === "left" ? "arrowleft" : "arrowright";
  button.addEventListener("pointerdown", () => keys.add(key));
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});
