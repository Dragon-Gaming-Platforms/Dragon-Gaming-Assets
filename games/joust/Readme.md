# Joust Game Clone

This project is a modern implementation of the classic arcade game Joust, built using JavaScript and the Phaser 3 game framework.

## Description

Joust is a 2D platformer where players control a knight riding a flying ostrich, battling against enemy knights. The goal is to defeat enemies by colliding with them from a higher position.

## Features

- Player controlled knight on a flying ostrich
- Multiple enemy AI opponents
- Score tracking system
- Lives system
- Platform-based level design
- Collision detection for combat mechanics

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js installed on your local machine
- npm (Node Package Manager) installed

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/cschladetsch/JSoust.git
   ```
2. Navigate to the project directory:
   ```
   cd JSoust
   ```
3. Install the necessary dependencies:
   ```
   npm install
   ```

## Running the Game

To run the game locally:

1. Build the project:
   ```
   npm run build
   ```
2. Start the development server:
   ```
   npm start
   ```
3. Open your web browser and navigate to `http://localhost:8080` (or whichever port your webpack-dev-server is configured to use)

## How to Play

- Use the left and right arrow keys to move your knight horizontally
- Press the spacebar to flap and gain altitude
- Collide with enemies from above to defeat them
- Avoid colliding with enemies from below or the sides
- Survive as long as possible and achieve the highest score!

## Controls

- Left Arrow: Move left
- Right Arrow: Move right
- Spacebar: Flap/Gain altitude
- ESC: Restart the game

## Development

This game is built using the following technologies:
- JavaScript
- Phaser 3 game framework
- Webpack for bundling

The main game logic is contained in `JoustGame.js`, with separate modules for the player (`Player.js`), enemies (`EnemyAI.js`), and the game map (`GameMap.js`).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Joust game by Williams Electronics
- Phaser 3 game framework
- All contributors to this project
