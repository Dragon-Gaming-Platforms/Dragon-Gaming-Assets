let timer = 0

function cycle() {
  timer++

  if (timer % 5 === 0) {
    cpu.tick()
    timer = 0
  }

  if (!cpu.halted) {
    cpu.step()
  }

  setTimeout(cycle, 3)
}

// Load a local ROM selected by the user. No ROMs are distributed with this emulator.
async function loadRom(event) {
  const file = event.target.files[0]
  if (!file) return
  const arrayBuffer = await file.arrayBuffer()
  const romBuffer = new RomBuffer(new Uint8Array(arrayBuffer))

  cpu.interface.clearDisplay()
  cpu.interface.disableSound()
  cpu.load(romBuffer)
  displayInstructions(file.name)
}

function displayInstructions(rom) {
  let instructions = `Use the CHIP-8 keypad shown above to play this ROM.`

  switch (rom) {
    case 'CONNECT4':
      instructions = `Q = go left
E = go right
W = drop a coin

The coin color alternates with each play. 
This game has no win detection.
`
      break
    case 'TETRIS':
      instructions = `W = go left
E = go right
R = fall faster
Q = rotate piece`
      break
    case 'PONG':
      instructions = `Player 1:
      
2 = go up
Q = go down

Player 2:

Z = go up
X = go down`
      break
    case 'INVADERS':
      instructions = `W = start game
W = shoot
Q = go left
E = go right`
      break
  }

  const instructionsDisplay = document.querySelector('.instructions')
  instructionsDisplay.textContent = instructions
}

document.querySelector('#rom-file').addEventListener('change', loadRom)

cycle()
