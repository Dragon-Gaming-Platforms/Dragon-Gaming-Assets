const bombsOnTheMove = new Audio('sounds/Ticking.mp3');
const bombExplosion = new Audio('sounds/Bomb+Explosion.mp3');
const waterDrops = new Audio('sounds/420227__14fpanska-nemec-petr__37-2-water-drop-stone.wav');

class Projectile {
  constructor(gun) {
    this.gun = gun;

    const { EndOfGunX, EndOfGunY, orientation, currentAngle, shootingForce, gunWidth } = gun;
    this.game = gun.game;

    this.EndOfGunX = EndOfGunX;
    this.EndOfGunY = EndOfGunY;
    this.orientation = orientation;
    this.currentAngle = currentAngle;
    this.shootingForce = shootingForce;
    this.gunWidth = gunWidth;

    this.speed = 5; // Number of moved pixels per "time"

    this.shootDisplaySpeed = 1000 / 30;
    this.gravityForce = 10;
    this.time = 0;
  }

  draw(x, y) {
    const context = this.game.context;

    context.save();
    context.beginPath();
    context.fillStyle = 'orange';
    context.strokeStyle = 'black';
    context.arc(x, y, this.gunWidth, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();
    context.fill();
    // context.drawImage(bomb, x, y, this.gunWidth * 2, this.gunWidth * 2);
    // context.drawImage(bomb, x, y, 30, 30);
    context.restore();
  }

  shootsInMotion(shootingTeam) {
    this.game.eventRuns = true;

    if (this.orientation === 'right') {
      //orientation === 'left'
      this.Fx = this.shootingForce * Math.cos(this.currentAngle);
      this.Fy = -1 * this.shootingForce * Math.sin(this.currentAngle);
    } else if (this.orientation === 'left') {
      //orientation === 'right'
      this.Fx = -1 * this.shootingForce * Math.cos(this.currentAngle);
      this.Fy = -1 * this.shootingForce * Math.sin(this.currentAngle);
    }
    // Values have to be instanciated inside of this method.
    this.x = this.EndOfGunX; // Inicial value of X
    this.y = this.EndOfGunY; // Inicial value of Y

    this.newX = this.x + this.Fx * this.time;
    this.newY = this.y - this.Fy * this.time + (1 / 2) * this.gravityForce * this.time ** 2;

    this.game.clearEverything();
    this.game.drawCurrentStatus();
    this.draw(this.newX, this.newY);
    bombsOnTheMove.play();
    this.time += 0.1;

    const collidesWithEnvironment = this.collision(shootingTeam);
    const collidesWithEnemies = this.collisionWithEnemies(shootingTeam);

    if (!collidesWithEnvironment && !collidesWithEnemies) {
      setTimeout(() => {
        this.shootsInMotion(shootingTeam);
      }, this.shootDisplaySpeed);
    }
  }

  collision(shootingTeam) {
    //Checks if hit the enemy

    // console.log('collision with Enemies', this.collisionWithEnimies());
    // checks if out of canvas or hit the ground.
    if (
      this.newX + this.gunWidth * 2 > this.game.width || // Right
      this.newX - this.gunWidth * 2 < 0 || // Left
      this.newY + this.gunWidth * 2 > this.game.height - this.game.ground.groundHeight || // Ground
      this.newY - this.gunWidth * 2 < 0 // Top
    ) {
      this.game.eventRuns = false;
      // this.game.characterTurn++;
      this.game.playGame();
      // Sounds
      bombsOnTheMove.pause();
      this.game.shootingSound.pause();
      waterDrops.play();

      return true;
    } else {
      return false;
    }
  }

  collisionWithEnemies(shootingTeam) {
    const receivingTeam = shootingTeam === this.game.team1 ? this.game.team2 : this.game.team1;

    let collides = false;

    for (let item of receivingTeam) {
      const x = item.x;
      const y = item.y;
      const width = item.width;
      const height = item.height;

      if (
        this.newX >= item.x &&
        this.newX <= item.x + item.width &&
        this.newY >= item.y &&
        this.newY <= item.y + item.height
      ) {
        collides = true;
        item.charWasHit(item.gun.damage);

        const index = receivingTeam.indexOf(item);
        if (item.dead) {
          receivingTeam.splice(index, 1);
        }
      }
    }

    if (collides) {
      // Pauses all sounds
      bombsOnTheMove.pause();
      this.game.shootingSound.pause();
      bombExplosion.play();

      this.game.eventRuns = false;
      this.game.characterTurn++;
      this.game.playGame();
    }
    return collides;
  }

  drawExplosion() {
    // ball location
    // explosion radius
  }

  friendlyFire() {
    // Nice to have feature!
  }
}
