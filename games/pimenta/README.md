![PIMENTA](docs/header.svg)

**[English](./README.md) | [日本語](./README.ja.md)**

# Pimenta

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![Play Now](https://img.shields.io/badge/Play_Now-FF4444?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/izag8216/pimenta/blob/main/index.html)

A cute retro-style vertical scrolling shooter (STG) featuring a chili pepper pilot defending the sky from food invaders.

![Gameplay](https://img.shields.io/badge/Gameplay-480x720-FF8C00?style=flat-square)

## Features

- **Cute Character Designs** - Hand-drawn style chili pepper, tomato, eggplant, pumpkin, and ice cream boss
- **3 Enemy Types + Boss** - Cherry tomatoes, eggplants, pumpkins, and a giant ice cream sundae boss
- **Power-up System** - Spread Shot, Speed Boost, and Shield
- **Combo Scoring** - Chain kills for multiplied points
- **Retro Visual Effects** - Scanlines, parallax starfield, particle explosions, screen shake
- **Procedural Audio** - Chiptune sound effects via Web Audio API
- **Zero Dependencies** - Single HTML file, no build tools required

## How to Play

### Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Auto-fire | Always enabled |
| P | Pause |
| M | Mute/Unmute |
| Enter | Start / Retry |

### Gameplay

1. Destroy waves of food invaders flying from above
2. Collect power-ups dropped by defeated enemies
3. Build combos by chaining kills within 2 seconds
4. Face a boss every 10 waves
5. Survive as long as possible and aim for a high score

### Enemies

| Enemy | HP | Behavior |
|-------|----|----------|
| Cherry Tomato | 1 | Fast, straight movement |
| Eggplant | 3 | Medium, shoots aimed bullets |
| Pumpkin | 5 | Slow, fires spread shots |
| Ice Cream Boss | 40+ | 3 attack phases, increasing aggression |

### Power-ups

| Power-up | Color | Effect |
|----------|-------|--------|
| Spread Shot | Red | 3-way bullets for 5 seconds |
| Speed Boost | Orange | 1.6x movement speed for 5 seconds |
| Shield | Green | Absorbs one hit |

## Quick Start

```bash
# Clone
git clone https://github.com/izag8216/pimenta.git

# Play
open pimenta/index.html
```

Or download `index.html` and open in your browser.

## Tech Stack

- **HTML5 Canvas** - 2D rendering
- **Vanilla JavaScript** - No frameworks, no dependencies
- **Web Audio API** - Procedural chiptune sound effects
- **localStorage** - High score persistence

## Project Structure

```
pimenta/
  index.html              Complete standalone game
  docs/
    header.svg            README header banner
  README.md               This file
  README.ja.md            Japanese README
  LICENSE                 MIT License
  CONTRIBUTING.md         Contribution guide
  .github/
    workflows/
      deploy.yml          GitHub Pages (optional)
```

## Browser Support

Works in any modern browser with Canvas and Web Audio API support (Chrome, Firefox, Safari, Edge).

## License

[MIT](./LICENSE)

---

Made with spice.
