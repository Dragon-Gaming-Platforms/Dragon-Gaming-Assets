/* 
Each Gun will have,
        - amount of damage
        - amout of damage per pixel?
          - in case of area damage, how to solve it?
        - bullet movement equation
          - check required variables for it
        - ammo changes color through the canvas, before explosion (black, yellow, orange, red)
        NICE TO HAVE
          - sounds:
            - shooting
            - exploding
        CRAZY STUFF
          - images:
            - gun
            - ammo


*/
class Gun {
  constructor(character) {
    this.character = character;
    const { x, y, width, height, orientation } = this.character;

    this.game = character.game;

    // Char current values of,
    this.x = x; //Coordinates of body
    this.y = y || 500 - 156 - 40; //Coordinates of body = canvas.hight - ground.hight - char.hight
    this.width = width; // char body
    this.height = height; // char body
    this.orientation = orientation; // where is looking at

    // Gun size (aka stroke length and width)
    this.length = 30;
    this.gunWidth = 5;

    // Gun Damage
    this.damage = 99;

    // Pointing angle
    this.angle = -1 * 0.15 * Math.PI;
    this.speedOfAngleChanges = 0.05 * ((1 / 2) * Math.PI);
    this.currentAngle = this.angle;

    // Gun shooting force
    this.shootingForce = 80;

    this.projectile = new Projectile(this);
  }

  extractVarsFromGun() {
    return [this.EndOfGunX, this.EndOfGunY, this.orientation, this.currentAngle, this.shootingForce, this.gunWidth];
  }

  draw() {
    const game = this.game;
    const context = game.context;

    if (this.orientation === 'right') {
      // Starting coordinates of gun. (same as, center of the character)
      this.CenterX = this.x + this.width / 2;
      this.CenterY = this.y + this.height / 2;

      // Final coordinates of Gun. (using 45º as default)
      this.EndOfGunX = this.CenterX + this.length * Math.cos(this.currentAngle);
      this.EndOfGunY = this.CenterY + this.length * Math.sin(this.currentAngle);
    } else if (this.orientation === 'left') {
      // Starting coordinates of gun. (same as, center of the character)
      this.CenterX = this.x + this.width / 2;
      this.CenterY = this.y + this.height / 2;

      // Final coordinates of Gun. (using 45º as default)
      this.EndOfGunX = this.CenterX - this.length * Math.cos(this.currentAngle);
      this.EndOfGunY = this.CenterY - this.length * -1 * Math.sin(this.currentAngle);
    }

    // Draw gun
    context.save();

    context.lineWidth = this.gunWidth;
    context.strokeStyle = 'black';

    context.beginPath();
    context.moveTo(this.CenterX, this.CenterY);
    context.lineTo(this.EndOfGunX, this.EndOfGunY);
    context.stroke();
    context.closePath();

    context.restore();
  }

  pointsTo(direction) {
    if (!this.game.eventRuns) {
      // Prevents it from running when projectile is in motion.

      // Moves gun direction
      if (direction === 'up') {
        this.angle -= this.speedOfAngleChanges;
      } else if (direction === 'down') {
        this.angle += this.speedOfAngleChanges;
      }

      // Boundaries of gun movement, between 0 and PI/2.
      if (this.angle > 0) {
        this.angle = 0;
      } else if (this.angle < -1 * (1 / 2) * Math.PI) {
        this.angle += this.speedOfAngleChanges;
      }

      this.currentAngle = this.angle;
    }
  }
}
