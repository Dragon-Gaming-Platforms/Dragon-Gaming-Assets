# Tank Bastion

A standalone, browser-playable arcade tank-defense game adapted from
[SD-Sagar/Battle-City-Inspired-Tank-Game](https://github.com/SD-Sagar/Battle-City-Inspired-Tank-Game).
The upstream repository declares Apache-2.0 at its root; its license is included
in `LICENSE`.

## Play

Open `index.html` or serve this folder with any static HTTP server. No build
step, account, backend, third-party library, or network request is required.

- **Arrow keys:** move
- **Space:** fire; hold for rapid fire
- **P:** pause or resume

Destroy the enemy tanks while keeping your base intact. Walls, water, steel,
and forest tiles affect the battlefield; enemy waves, power-ups, successive
levels, and a locally saved high score add variety.

## Adaptation and provenance

The game is rebranded as **Tank Bastion** and is an unaffiliated arcade-style
tank-defense game. Its playfield and tanks are drawn by the upstream Canvas
code; no original console ROM, official logo, or copied console game artwork is
included. The title/menu copy, external Google Fonts import, and forced
fullscreen behavior were changed for a self-contained embedded build. Small
upstream input/audio issues were also corrected. Prominent notices in modified
source files identify these changes.

The upstream `assets/audio/*.wav` files contain MPEG Layer III audio frames,
not RIFF/WAVE data. Their bytes are preserved exactly; their local filenames
and HTML references use `.mp3` so static hosts serve them as `audio/mpeg`.
The upstream repository provides a root Apache-2.0 license but no separate
audio-asset credits or provenance file; see `THIRD_PARTY.md` in the parent
repository for that limitation.
