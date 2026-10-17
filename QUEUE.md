# QUEUE.md — vendoring queue for three parallel agents

Three agents add games/tools/emulators to `games/` at the same time. This file
splits the work so nobody steps on anyone.

## How to work from this queue

1. **Pull only from your own section** (Agent 1 / Agent 2 / Agent 3). Never
   vend an entry from another section — that is how conflicts happen.
2. **This file is READ-ONLY.** Do not edit it. Report what you added or
   dropped (and why) in your PR description instead.
3. **Follow AGENTS.md**: self-contained build (no CDN/account/server
   dependencies), explicit per-game license, `game.json`, a
   `THIRD_PARTY.md` row in the same commit, verified runnable before pushing.
4. **Check for slug collisions before committing**: `ls games/`. If your slug
   already exists, either drop the entry or use a distinguishing suffix
   (`rush-hour-2`). Never touch another agent's folder.
5. **Commit only**: your game folder(s) + `game.json` + your `THIRD_PARTY.md`
   row(s). Two agents appending to `THIRD_PARTY.md` concurrently may cause a
   rebase conflict — the resolution is simply to keep **both** rows.
6. **PRs are fine** (hard rule 1 in AGENTS.md was updated: the old sandbox
   lockout that made PRs unusable no longer happens).
7. If a section runs dry, **stop** — do not raid the other sections.

Entries are written `title — search hint / known repo (license status)`.
"no-lic as of 2026-10-16" means every repo found for that title was
unlicensed *on that date* — new repositories appear constantly, so retrying
the search later is allowed.

---

## Agent 1 — arcade classics & action

Catalog already has (do NOT re-add): asteroids, breakout, space-invaders,
alien-invaders, andromeda-invaders, frogger, reqbert, missile-command,
commando, centipede, lode-runner, pinball, pimenta, tanks, aim-and-shoot,
gauntlet, river-raid, afterglow, 90s-games (hub), cheesetoast, vampire-survivors,
sneakers/runners, moonlander, lunar-lander, skifree, enduro, road-racing family.

### Hunt list (in priority order)

1. **Bullet-hell / danmaku shooter** — search `danmaku+game+javascript`,
   `bullet+hell+game+html5`, `touhou+style+shooter+javascript`. MUST be
   original art: code-drawn bullets/ship, no Touhou or Nintendo assets.
2. **Defender-style side-scrolling rescue shooter** — `defender+arcade+game+javascript`.
3. **Tower of Druaga** — `tower+of+druaga+game+javascript` (labyrinth shooter).
4. **Scramble / vertical rail shooter** — `scramble+shooter+game+javascript`.
5. **Spy Hunter-style road shooter** — `spy+hunter+game+javascript+arcade`.
6. **Zaxxon-style isometric shooter** — `zaxxon+game+javascript`.
7. **Micro Machines** (top-down micro cars only — normal racing is covered).
8. **Battle City / 8-bit tank** (catalog `tanks` is a different game — an
   8-bit destructible-walls variant is distinct enough).
9. **Red Baron** — `red+baron+game+javascript`.
10. **Phozon / air-combat arcade** — `phozon+game+javascript`.
11. **Wave shooter with original theme** — clear mechanics difference from
    `pimenta` and `vampire-survivors` required.
12. **Twin-stick arena shooter (original, code-drawn)** — nothing in catalog.

### Classics searched 2026-10-16 — every repo unlicensed (retry later)

Galaga-style, Joust (one MIT repo needs a webpack build with no committed
`dist/` — skip unless a prebuilt fork appears), Dig Dug, Rampart,
Robotron 2084, Skyfire, Zero Wing, Time Channel, Gorf, Starcaster (Star
Castle), Fire Beach, Moon Patrol, Battlezone, Chase.HQ.

---

## Agent 2 — puzzles, boards, cards & words

Catalog already has (do NOT re-add): 2048 family, boggle, klotski, hitori,
halma, bloxorz, chess, shogi, xiangqi, gomoku, go, backgammon, reversi,
tower-of-hanoi, tangram, sudoku, mahjong, mancala, 7 solitaires, binairo,
futoshiki, kakuro, mathdoku, nonogram, star-battle, mini-crossword,
spelling-bee, anagrams, typing-rush, typing-speed-test, rhythm-tap,
blackjack, video-poker, dice-poker, craps, baccarat, slot-machine,
fruit-slots, jigsaw, plinko, connect-four, checkers, ludo, hangman (first-party).

### Hunt list (in priority order)

1. **Rush Hour** — the sliding-car puzzle; a genuine gap.
   `rush+hour+game+javascript`.
2. **Lights Out** — the grid-flip puzzle; a genuine gap.
   `lights+out+game+javascript`.
3. **15 Puzzle as a real game** — move counter, timer, win screen (the one
   repo found, `Kirilllive/Fifteen_puzzle_maker`, is a picture-puzzle
   *generator* with a 4-button UI — too thin, do not vendor it).
4. **Yahtzee** — dice scorecard game; gap.
5. **Roulette** — casino shelf gap (no wheel in catalog).
6. **Hearts** — classic card game; all repos no-lic 2026-10-16, retry.
7. **Spades** — the one found was a Vite/React build, retry other repos.
8. **Killer / jigsaw / samurai sudoku** — any one is a distinct entry.
9. **Pente** — `pente+board+game+javascript` (no-lic 2026-10-16, retry).
10. **Hex (the board game)** — NOT Hextris; no-lic 2026-10-16, retry.
11. **Sokoban** — `klevze/sokoban` was excluded (CDN + no root index); find a
    clean static repo. `rover` is sokoban-*style* but a different game, so a
    classic Sokoban with a level pack is still a valid add.
12. **Pencil puzzles** — Slitherlink, Masyu, Kuromasu, Arukone, Fillomine,
    Hashi, Nurikabe. All searched no-lic 2026-10-16; retry, one per repo found.
13. **Niche board games** — Amoebeng, Jungle Chess, Chines (race board game),
    Abalone, Siam, Chomp. All empty/no-lic 2026-10-16; retry.
14. **3D tic-tac-toe (3×3×3)** — gap.
15. **Wordle** — ONLY a build with a fully local word list and zero API calls
    (`bonavida/wordle` = Nuxt build — skip; `Prajjwal-Chauhan/Wordle-Clone`
    calls RapidAPI — skip).
16. **The 24 game** — math puzzle; `24+game+javascript+math`.
17. **Color nonogram / picture-cross** — distinct from the existing nonogram.
18. **Checkers with a proper AI** — catalog checkers may be 2P-only; a
    single-player AI variant is a distinct entry.

---

## Agent 3 — strategy, RPG, experiments, emulators & tools

Catalog already has (do NOT re-add): tower-defense, server-survival,
xiuxian-idle, particle-clicker, yet-another-idle-rpg, isocity,
crayon-contraptions, dog-playground, afterglow, tama-pets, game-of-life,
besogo, coffee-playground, dungeons, frodos-quest, glade-game, metroidvania,
pixel-princess-platformer, prison-break, vampire-survivors, violencetown,
racer/racing family, emulators (below), tools (below).

### Experiments & interactive (thinnest shelf — good targets)

1. **Falling-sand / "Noita-style" grid simulation** — a genuine gap.
   `falling+sand+game+javascript`, `sand+game+html5`.
2. **Boids / flocking simulator** — `boids+simulation+javascript+canvas`.
3. **Particle-life / chemistry toy** — must differ from game-of-life and
   particle-clicker.
4. **Physics contraption / rope-and-pulley toy** — must differ from
   crayon-contraptions.
5. **Fluid or ink toy** — `fluid+simulation+canvas+javascript`.

### Strategy & RPG

6. **Risk** — `nullobject/risk` is MIT but a React build (skip unless a
   static port appears); search other repos.
7. **City / idle tycoon lite** — must differ from isocity and the existing
   three idle games.
8. **Static zero-dependency browser RPG** — every RPG found 2026-10-16 was
   no-lic or a build project; new repos land weekly, keep re-running:
   `rpg+game+javascript+vanilla`, `dungeon+rpg+browser+javascript`.
9. **ASCII roguelike** — must clearly differ from `dungeons`.
10. **Turn-based tactics (small, static)** — `tactics+rpg+browser+javascript`.

### Emulators (catalog has: NES ×2, SNES, Game Boy, CHIP-8, DCPU-16, Hack,
8086, bash, Amstrad CPC BASIC, Linux & DOS-on-Scratch). Verify the license of
each candidate before vendoring; GPL is fine, no-license is not.

11. **Sega Genesis / Mega Drive** — e.g. GSP-WASM or Redream (both GPL-class).
12. **Commodore 64** — js-c64-style ports; check license.
13. **Atari 2600** — Stella ports (GPL-class); check license.
14. **MSX** — FMSX (GPL-3) or similar.
15. **Game & Watch** — small static ports exist; great fit for this repo.
16. **ZX Spectrum** — any clean JS port with an explicit license.
17. **Arcade framework (EmulatorJS, MIT)** — it loads user-provided ROMs;
    flag in the PR description and let the user decide (ROMs themselves are
    copyrighted and are NOT to be committed).

### Tools (catalog has: 3d-graphing-calculator, aim-trainer, beepbox,
besogo, coffee-playground, game-of-life, jsfxr, jspaint, jv1010-tool,
morse-tool, pixel-sprite-generator, pixelcraft, sdf-maker, slip39-tool,
spectrum-tool, svgedit, typing-speed-test, web-jjy)

18. **Mandelbrot / fractal explorer** — gap.
19. **Chiptune tracker** — Famitracker-style; check license.
20. **Waveform synthesizer** — must clearly differ from beepbox.
21. **ASCII art converter** — text → ASCII images.
22. **QR code generator** — fully local, no API.
23. **Unit converter** — static conversion tables only (no network).
24. **JS code playground** — a sandboxed in-page script pad.
25. **Audio spectrum visualizer toy** — mic/file driven, all local.

---

## Dead ends — do not re-suggest unless the situation changed

- **IP/copyright (hard no)**: Eaglercraft/Minecraft builds, Zork I
  re-creations (`8eight8toes8/zork-game` — Infocom content), Pokémon
  assets/names, Touhou assets, Nintendo/Sega game code or assets. Voxelcraft
  (`bridge-mind/voxelcraft`, MIT) is the licensed Minecraft-style alternative
  but the **user explicitly declined it** — do not add without a fresh
  explicit request.
- **Server/backend-dependent (hard no)**: squeak-and-destroy &
  block-and-destroy (PHP backend + custom asset license), Socket-Rummy
  (Socket.IO server), Prajjwal-Chauhan/Wordle-Clone (RapidAPI keys),
  crcc (Unity, empty gh-pages).
- **Build projects with no committed build (skip)**: JsJoust (webpack, no
  `dist/`), bonavida/wordle (Nuxt), nullobject/risk (React), spadeswithcats
  (Vite/React), Pokemon-RPG- (GSAP — non-OSI license — plus CDNs).
- **Library, not a game**: danguilherme/uno (game-logic library, no UI).
- **Too thin / a tool, not a game**: Kirilllive/Fifteen_puzzle_maker.
- **Already in the catalog** (don't re-vendor): server-survival, tangram,
  backgammon, reversi, tower-of-hanoi, frogger, reqbert, commando,
  centipede, pinball, pong, word/casino/typing titles listed in Agent 2's
  header.
- **All repos searched no-lic on 2026-10-16** (retry allowed, but they are
  the least likely to change): pachinko, qix, tempest, zuma, ice-climber,
  tapper, zombie games, crossy-road, hidden-object, raycaster, raiden,
  snooker, netwalk, parking, truck, sailing, angry-birds, harrier,
  bubble-bobble, hovercraft, bartender, tamagotchi clones (Tama-Pets added
  the slot), mario-style clones (Super Pixel Bros added the slot), uno UIs,
  visual-novel engines (all engines, no finished games), text adventures
  (no-lic or Node-terminal).
