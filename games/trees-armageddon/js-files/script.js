const $canvas = document.querySelector('canvas');

const game = new Game($canvas);
/*
window.addEventListener('load', () => {
  game.reset();
});
*/
game.drawFirstScreen();
const $buttonStart = document.getElementById('start');
$buttonStart.addEventListener('click', () => {
  game.start();
});

/* const $buttonReset = document.getElementById('reset');
$buttonReset.addEventListener('click', () => {
  game.reset();
}); */
