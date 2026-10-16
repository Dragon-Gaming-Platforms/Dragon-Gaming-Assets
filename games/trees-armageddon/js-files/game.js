/* 
  Game Ideas:

  Each team will make one shoot at a time
      - if more than one character per team, make them shoot one at a time.
  Team that reaches zero health first will loose

  User interactions per turn,
    - move worm -> set coordinates
    - sets direction -> left/right values
    - set shooting position -> up/down arrows
    - shoot
    
  Game calculations after user shoots gun,
    - set shoot trajectory
    - check shoot collision on each movement, until it is out of the canvas or collides with ground or any char
    - make shoot explode
    - calculate life for each char
    - update each char life
    - remove dead char
    - update board scores
    - check if any team has zero char left
    - assign winning team
*/
const shootsFired = new Audio('sounds/Gun+357+Magnum.mp3');
const backgroundSound = new Audio('sounds/2018-10-06_-_Silly_Chicken_-_David_Fesliyan.mp3');
backgroundSound.loop = true;
const backgroundImage = new Image();
backgroundImage.src = 'images/background-image.png';

class Game {
  constructor($canvas) {
    this.$canvas = $canvas;
    this.context = $canvas.getContext('2d');

    this.width = $canvas.width;
    this.height = $canvas.height;

    this.teamsGameArea = this.width * 0.35;

    this.eventRuns = false;
    this.gameover = false;

    this.characterTurn = 0;

    this.setKeyBindings();

    this.shootingSound = shootsFired;
  }

  createsTeam(team, teamSize, orientation) {
    for (let i = 0; i < teamSize; i++) {
      let x = 50 + i * 70;
      if (orientation === 'left') {
        x = this.width - x - 20;
      }
      const char = new Character(this, orientation, x);
      team.push(char);
    }
    // team.push(orient);
  }

  drawTeam(team) {
    for (let character of team) {
      if (character.life > 0) {
        character.draw();
        character.gun.draw();
      }
    }
  }

  drawTeamsLife(team) {
    for (let character of team) {
      if (character.life > 0) {
        character.drawCharacterLife();
      }
    }
  }

  calculateTeamLife(team) {
    let charslife = [];
    for (let character of team) {
      charslife.push(character.life);
    }

    return charslife.reduce((acc, value) => acc + value, 0);
  }

  drawTeamTotalLife(team) {
    const context = this.context;

    const team1TotalLife = this.calculateTeamLife(this.team1);
    const team2TotalLife = this.calculateTeamLife(this.team2);
    // Dimensions
    const boxWidth = 300;
    const bodHeight = 30;
    const distFromTop = 60;
    const border = 0.5;

    context.save();
    // Draws Border
    context.fillStyle = 'black';
    context.fillRect(
      bodHeight - border,
      distFromTop - border,
      boxWidth + border * 2,
      bodHeight + border * 2
    ); // make boxWidth has total life at the beginning
    context.fillRect(
      this.width - boxWidth - bodHeight - border,
      distFromTop - border,
      boxWidth + border * 2,
      bodHeight + border * 2
    ); // make boxWidth has total life at the beginning

    // Draws life's background
    context.fillStyle = 'red';
    context.fillRect(bodHeight, distFromTop, boxWidth, bodHeight); // make boxWidth has total life at the beginning
    context.fillRect(this.width - boxWidth - bodHeight, distFromTop, boxWidth, bodHeight); // make boxWidth has total life at the beginning

    // Draws Current total life
    // Team 1
    context.fillStyle = 'lime';
    context.fillRect(bodHeight, distFromTop, boxWidth * (team1TotalLife / boxWidth), bodHeight);
    // Team 2
    context.fillStyle = 'lime';
    context.fillRect(
      this.width - boxWidth - bodHeight,
      distFromTop,
      boxWidth * (team2TotalLife / boxWidth),
      bodHeight
    );
    context.restore();

    // Writes Team Names
    context.save();
    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText('A - Team', 100, 45, 200);
    context.fillText('B - Team', this.width - boxWidth, 45, 200);
    context.restore();
  }

  drawGameOver() {
    const context = this.context;

    let gameOverWidth = 450;
    let gameOverHeight = 250;
    let gameOverBorder = 15;

    let firstLineWidth = 300;
    let firstLineHeight = 70;
    let secondLineWidth = 200;
    let secondLineHeight = 40;
    let lineMargin = 30;

    // DRAW BOX BORDER
    if (this.gameover) {
      context.save();
      context.fillStyle = 'black';
      context.fillRect(
        this.width / 2 - gameOverWidth / 2,
        this.height / 2 - gameOverHeight / 2,
        gameOverWidth,
        gameOverHeight
      );

      context.fillStyle = 'white';
      context.fillRect(
        this.width / 2 - gameOverWidth / 2 + gameOverBorder,
        this.height / 2 - gameOverHeight / 2 + gameOverBorder,
        gameOverWidth - gameOverBorder * 2,
        gameOverHeight - gameOverBorder * 2
      );

      // DRAW TEXT
      context.fillStyle = 'black';
      // First Line
      context.font = '60px serif';
      context.fillText(
        this.winner + ' wins',
        this.width / 2 - firstLineWidth / 2,
        this.height / 2 - lineMargin / 2,
        firstLineWidth
      );
      // Second Line
      context.font = '30px serif';
      context.fillText(
        'by ' + this.winnerPoints + ' points.',
        this.width / 2 - firstLineWidth / 2,
        this.height / 2 + lineMargin / 2 + secondLineHeight,
        secondLineWidth
      );

      context.restore();
    }
  }

  clearEverything() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  drawBackGroundImage() {
    this.context.drawImage(backgroundImage, 0, 0, this.width, this.height);
  }

  drawCurrentStatus() {
    this.clearEverything();
    this.drawBackGroundImage();
    this.drawTeam(this.team1);
    this.drawTeam(this.team2);
    this.drawTeamsLife(this.team1);
    this.drawTeamsLife(this.team2);
    this.drawTeamTotalLife(this.team1);
    this.drawTeamTotalLife(this.team2);
  }

  characterTurnLogic() {
    this.drawCurrentStatus();

    this.currentTeam = this.currentTeam === this.team1 ? this.team2 : this.team1;

    this.currentCharacterIndex++;

    if (this.currentCharacterIndex > this.currentTeam.length - 1) {
      this.currentCharacterIndex = Math.floor(this.currentTeam.length * Math.random());
    }
  }

  gameOverLogic() {
    if (this.team1.length === 0) {
      this.gameover = true;
      this.winner = 'B - Team';
      this.looser = 'A - Team';
      this.winnerPoints = this.calculateTeamLife(this.team2);
    } else if (this.team2.length === 0) {
      this.gameover = true;
      this.winner = 'A - Team';
      this.looser = 'B - Team';
      this.winnerPoints = this.calculateTeamLife(this.team1);
    }
  }

  start() {
    this.reset();
    backgroundSound.play();
    this.playGame();
  }

  playGame() {
    this.gameLogic();
    this.gameDraw();
  }

  gameLogic() {
    this.characterTurnLogic();
    this.gameOverLogic();
  }

  gameDraw() {
    this.clearEverything();
    if (this.gameover) {
      this.drawCurrentStatus();
      this.drawGameOver();
    } else {
      this.drawCurrentStatus();
    }
  }

  resetCharacterTurn() {
    this.currentTeam = this.team2;
    this.currentCharacterIndex = -1;

    // constructor variables
    this.eventRuns = false;
    this.gameover = false;

    this.characterTurn = 0;
  }

  reset() {
    this.clearEverything();
    this.ground = new Ground(this);
    this.team1 = [];
    this.team2 = [];

    this.createsTeam(this.team1, 3, 'right');
    this.createsTeam(this.team2, 3, 'left');
    this.drawCurrentStatus();
    this.resetCharacterTurn();
  }

  drawFirstScreen() {
    console.log('im running');
    const gameInstructions = new Image();
    gameInstructions.src = 'images/game-instructions.png';
    gameInstructions.addEventListener('load', () => {
      this.context.drawImage(gameInstructions, 50, 120, this.width - 50 * 2, this.height - 150);
    });
  }

  setKeyBindings() {
    window.addEventListener('keydown', (event) => {
      const teamMembers = this.currentTeam;
      const characterNumber = this.currentCharacterIndex;
      const character = teamMembers[characterNumber];
      if (!this.eventRuns && !this.gameover) {
        const keyCode = event.keyCode;
        switch (keyCode) {
          case 37: // Left
            character.move('left');
            character.gun = new Gun(character);
            this.clearEverything();
            this.drawCurrentStatus();
            character.drawCharTurn();
            break;
          case 39: // Right
            character.move('right');
            character.gun = new Gun(character);
            this.clearEverything();
            this.drawCurrentStatus();
            character.drawCharTurn();
            break;
          case 38: // Up
            character.gun.pointsTo('up');
            this.clearEverything();
            this.drawCurrentStatus();
            character.drawCharTurn();
            break;
          case 40: // Down
            character.gun.pointsTo('down');
            this.clearEverything();
            this.drawCurrentStatus();
            character.drawCharTurn();
            break;
          case 32: // Space Bar
            event.preventDefault();
            this.clearEverything();
            this.drawCurrentStatus();
            this.shootingSound.play();
            character.gun.projectile = new Projectile(character.gun);
            character.gun.projectile.shootsInMotion(teamMembers);
        }
      }
    });
  }
}
