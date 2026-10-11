# Mahjong Solitaire

Mahjong solitaire that runs in any browser. Six boards, a full 144-tile set drawn
as SVG, and **every deal is guaranteed to have a solution**.

**▶ [Play it](https://ctbot000.github.io/mahjong-game/)**

No build step, no dependencies, no tracking, no network calls. The whole game is
static files.

## How to play

Clear the board by taking matching pairs. A tile can be taken only when it is
*free*: nothing lying on top of it, and its left or right edge clear. Blocked
tiles are dimmed.

Tiles match when their faces are the same, with the one exception the real game
has: **any flower matches any other flower**, and **any season matches any other
season**. Flowers carry an `F` in the top-right corner, seasons an `S`.

Every tile also carries a small index in its top-left corner — `5`, `E`, `R` —
so the set stays readable on a machine with no CJK font installed.

| Key | |
| --- | --- |
| <kbd>Tab</kbd>, then arrows | move between tiles |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | pick a tile up, and match it |
| <kbd>Esc</kbd> | put it back down |
| <kbd>H</kbd> <kbd>Z</kbd> <kbd>S</kbd> <kbd>N</kbd> | hint, undo, shuffle, new game |

## The boards

Every layout holds exactly one full set — 144 tiles, 72 pairs — and nothing
floats: each slot above the base rests on tiles below it.

The last column is measured, not guessed: it is how often a player who takes a
*random* legal pair every turn still clears the board, over 200 deals. It is a
reasonable proxy for how much room a layout leaves to go wrong.

| Board | Layers | Pairs open at the start | Cleared by random play |
| --- | ---: | ---: | ---: |
| Turtle — Classic | 5 | 11.3 | 41% |
| Terraces — Gentle | 2 | 27.9 | 82% |
| Butterfly — Easy | 3 | 16.6 | 37% |
| Fortress — Medium | 4 | 11.3 | 37% |
| Pyramid — Hard | 5 | 2.1 | 25% |
| Spider — Expert | 2 | 5.7 | 21% |

No board is above 95%: a deal a blind player always clears is not a puzzle, and
the test suite asserts it.

## Why every deal is solvable

The generator never builds a board and then hopes. It takes a *finished* board
apart:

1. Start with every slot filled by an unknown tile.
2. Find the slots that are free right now, pick two of them, and hand them a
   matching pair.
3. Remove those two and repeat until the board is empty.

Replaying those 72 removals in order is a legal game, so the arrangement they
describe always has at least one solution. Each board carries that solution with
it, and the test suite plays it back move by move to prove the deal is sound.

Solvable is not the same as easy. The order *you* take pairs in still decides
whether you get stuck — which is the game. **Shuffle** redeals the tiles still
standing into a fresh arrangement that can be finished, using the same
construction.

Deals are seeded, so `#board=turtle&deal=K7QM3X` reproduces one exactly. Click
the seed in the status bar to copy a link to the deal you are playing.

## Running it locally

Any static server will do — the game is `index.html` plus `css/` and `js/`:

```bash
python3 -m http.server 8000
```

The engine is plain ES modules with no DOM dependency, so the tests run in Node
with no install step:

```bash
npm test
```

## Layout of the source

| File | |
| --- | --- |
| `js/engine.js` | board model, free-tile rules, deal generation. No DOM. |
| `js/layouts.js` | the six board shapes, in half-cell coordinates. |
| `js/tiles.js` | the 144-tile set and the SVG for all 42 faces. |
| `js/main.js` | rendering, input, the clock, persistence. |
| `js/storage.js` | `localStorage` with an in-memory mirror, so a blocked browser loses persistence and nothing else. |
| `js/audio.js` | the Web Audio cues. |
| `test/engine.test.mjs` | the suite: `node --test`. |

Coordinates are stored in half-cells (`x2 = x * 2`), which keeps the half-step
overhangs that mahjong layouts rely on in integer arithmetic.

## Notes

- On a phone the whole board is scaled to fit so you can plan, which makes the
  tiles small on the wider layouts. Pinch to zoom; nothing blocks it.
- Best times are kept per board in `localStorage` and never leave the machine.

## Licence

MIT — see [LICENSE](LICENSE).
