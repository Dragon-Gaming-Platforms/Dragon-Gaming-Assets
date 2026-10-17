# ⚡ CYBERVOID: OVERDRIVE

> **A fast-paced, neon-drenched roguelite twin-stick bullet-hell shooter running directly in your browser with zero external dependencies.**

[![Live Demo](https://img.shields.io/badge/PLAY_NOW-ONLINE-00f0ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://hurayraiit.github.io/cybervoid-overdrive/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ff0055?style=for-the-badge)](LICENSE)
[![Pure Vanilla JS](https://img.shields.io/badge/Engine-Vanilla_JS_%2B_Canvas-ffea00?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Web_Audio-00ffcc?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 🎮 Overview

**CYBERVOID: OVERDRIVE** places you in the pilot seat of an experimental combat vessel trapped inside a rogue cyberpunk mainframe. Battle relentless swarm armadas, draft game-breaking matrix augments, master active reloads, and eliminate sector overlords across escalating waves.

Built with **100% pure vanilla JavaScript, HTML5 Canvas, and Web Audio API synthesis**. No external libraries, no downloaded sound files, no frameworks.

---

## ✨ Features

- 🎵 **Procedural Web Audio Synthesizer**: Every sound effect (lasers, explosions, railgun slugs, electric arcs, reload chimes) and the dynamic 16th-note synthwave soundtrack are generated mathematically in real-time.
- 🎯 **Gears-of-War Active Reload**: Hit `R` to reload, and press it again when the slider aligns with the marked sweet spot (45%–70%) for an instant reload + **4 seconds of +25% Fire Rate and +20% Critical Chance**!
- 📡 **Screen-Space Radar Chevrons**: Off-screen Elites and Bosses are tracked at viewport edges using ray-box trigonometric projection with real-time distance readouts in meters.
- 🃏 **Roguelite Matrix Augment Drafting**: Level up by collecting XP nanites and draft from 18 unique upgrade cards spanning Common, Rare, Epic, and Legendary tiers (Drones, Wall Ricochets, Tesla Dashes, Corpse Explosions, Lifesteal).
- 👾 **7 Enemy Archetypes & Multi-Phase Bosses**:
  - *Scout Swarm*, *Vanguard Bruiser*, *Sniper Interceptor*, *Kamikaze Drone*, *Stealth Stalker*, and *Phalanx Shielder*.
  - **Wave 5**: G-700 Titan Mech (Bullet-hell rings, homing rocket salvos, shockwaves).
  - **Wave 10**: Apex Nexus Overlord (Invulnerability generator shields, sweeping death lasers, minion summoning).
- ♾️ **Endless Overdrive Mode**: Continue past Wave 10 into infinite difficulty scaling with recurring boss encounters every 5 waves.
- 📱 **Full Mobile & Touch Controls**: Automatically detects touch displays and reveals a virtual analog stick and tactile action buttons.
- 💾 **Audio Settings Persistence**: Master, SFX, and Synth Music volume levels are automatically saved to `localStorage`.

---

## 🕹️ Controls

| Action | Desktop (Mouse & Keyboard) | Touch / Mobile |
| :--- | :--- | :--- |
| **Move / Strafe** | `W`, `A`, `S`, `D` or Arrow Keys | Left Virtual Joystick |
| **Aim & Fire** | Mouse Cursor + Left Click (Hold) | Right Virtual Fire Button |
| **Hyperspace Dash** | `Space` / `Shift` / Right Click | Right Virtual Dash Button |
| **Active Reload** | `R` (Press again in sweet spot) | Right Virtual Reload Button |
| **EMP Nova Bomb** | `Q` or `E` | Right Virtual EMP Button |
| **Cycle Weapon** | `1` – `7` or Mouse Wheel | Right Virtual Swap Button |
| **Toggle Auto-Fire**| `F` | — |
| **Quick Mute** | `M` (or HUD 🔊 button) | HUD 🔊 button |
| **Pause Mission** | `ESC` (or HUD ⏸ button) | HUD ⏸ button |

---

## 🔫 Arsenal

1. **Pulse Carbine**: Rapid-fire twin plasma bolts with fast cycling.
2. **Scatter Sweeper**: Heavy 8-pellet buckshot spread with immense kinetic knockback.
3. **Hyper Railgun**: High-velocity particle slug piercing all enemies in a line with heavy trauma camera shake.
4. **Seeker Swarm**: Micro-missiles tracking targets with explosive cluster radius.
5. **Arc Tesla Coil**: High-voltage lightning branching to up to 4 nearby hostiles simultaneously.
6. **Void Torch**: Continuous piercing plasma cone melting swarms with stacking Burn damage over time.
7. **Singularity Launcher**: Fires a collapsing gravitational sphere that pulls enemies into its vortex before detonating.

---

## 🚀 Quick Start / Local Development

Since this project has no build steps or node dependencies, you can run it with any static web server:

```bash
# Clone the repository
git clone https://github.com/HurayraIIT/cybervoid-overdrive.git
cd cybervoid-overdrive

# Start any local static server:
# Using Python 3:
python3 -m http.server 8080

# Or using Node:
npx serve .
```

Open `http://localhost:8080` in any modern web browser.

---

## 🌐 Free 1-Click Hosting

### Option A: Cloudflare Pages (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Compute (Workers & Pages)** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Select `HurayraIIT/cybervoid-overdrive`.
3. In Build settings:
   - **Framework preset**: `None`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/`
4. Click **Save and Deploy**.

### Option B: GitHub Pages
1. Go to repository **Settings** ➔ **Pages**.
2. Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
3. Branch: `main` / `root`. Click **Save**.

---

## 📜 License

Distributed under the [MIT License](LICENSE).
