/*
Each character have,
      - current position, x and y coordinates,
      - direction,
      - boundaries
      - Life, (display life with different colors)
      - movement
      - fire a gun, action

      NICE TO HAVE:
      - time to play (displaying countdown)
      - jump


*/
class Character {
  constructor(game, orientation, x, y, speed) {
    this.game = game;
    // Character coordinates
    this.x = x || undefined;
    this.y = y || this.game.height - this.height - this.game.ground.groundHeight; // Value is given in draw method. It needs that ground class is initiated.

    // Character Size
    this.width = 20;
    this.height = 40;

    // Character line width
    this.charLineWidth = 2;

    //Character Life
    this.life = 100;
    this.dead = false;
    // Movement Speed
    this.speed = speed || 5;

    this.orientation = orientation || 'right';

    this.gun = new Gun(this);
  }

  // extractVarsToGun() {
  extractVarsFromChar() {
    return [this.x, this.y, this.width, this.height, this.orientation];
  }

  charWasHit(damage) {
    this.life -= Math.floor(damage * Math.random());
    // this.life < 0 ? (this.life = 0) : this.life;
    if (this.life < 0) {
      this.life = 0;
      this.dead = true;
    }
  }

  drawCharTurn() {
    const game = this.game;
    const context = game.context;

    // Character Y coordinate
    this.y = this.game.height - this.height - this.game.ground.groundHeight;

    context.save();
    context.beginPath();
    context.fillStyle = 'darkblue';
    context.arc(this.x + this.width / 2, this.y - 15, 3, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();
    context.fill();
    context.restore();
  }

  drawCharacterLife() {
    const game = this.game;
    const context = game.context;

    // Character Y coordinate
    this.y = this.game.height - this.height - this.game.ground.groundHeight;

    context.save();
    context.fillStyle = 'lime';
    context.font = '15px serif';
    let tempXcoor;
    if (this.life < 100) {
      context.fillText(this.life, this.x + 2, this.y + this.height + this.width, this.width);
      // fillText coordinates are the left bottom corner of displaying text.
    } else {
      context.fillText(this.life, this.x - 1, this.y + this.height + this.width, this.width);
    }
    context.restore();
  }

  draw() {
    const game = this.game;
    const context = game.context;

    // Character Y coordinate
    this.y = this.game.height - this.height - this.game.ground.groundHeight;

    if (this.orientation === 'right') {
      // Character Body
      context.save();
      context.fillStyle = 'saddlebrown';
      context.fillRect(this.x, this.y, this.width, this.height);

      // character hat
      context.strokeStyle = 'green';
      context.lineWidth = this.charLineWidth;
      context.fillStyle = 'green';

      context.beginPath();
      context.moveTo(this.x - 10, this.y); // Back size of hat
      context.lineTo(this.x + this.width / 2, this.y - 40); // height of hat
      context.lineTo(this.x + this.width + 10, this.y); // Front size of hat
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    } else if (this.orientation === 'left') {
      context.save();
      // Character Body
      context.fillStyle = 'saddlebrown';
      context.fillRect(this.x, this.y, this.width, this.height);

      // character hat
      context.strokeStyle = 'green';
      context.lineWidth = this.charLineWidth;
      context.fillStyle = 'green';

      context.beginPath();
      context.moveTo(this.x - 10, this.y); // Back size of hat
      context.lineTo(this.x + this.width / 2, this.y - 40); // height of hat
      context.lineTo(this.x + this.width + 10, this.y); // Front size of hat
      context.closePath();
      context.fill();
      context.stroke();

      context.restore();
    }
  }

  move(direction) {
    if (!this.game.eventRuns) {
      // Prevents it from running when projectile is in motion.

      // Movement conditions
      if (direction === 'left') {
        this.x -= this.speed;
      } else if (direction === 'right') {
        this.x += this.speed;
      }

      // Team's area boundaries
      if (this.orientation === 'right' && this.x > this.game.teamsGameArea) {
        this.x = this.game.teamsGameArea;
      } else if (this.orientation === 'left' && this.x < this.game.width - this.game.teamsGameArea) {
        this.x = this.game.width - this.game.teamsGameArea;
      }

      // Canvas Boundary conditions
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.game.width - this.width) {
        this.x = this.game.width - this.width;
      }
    }
  }
}
