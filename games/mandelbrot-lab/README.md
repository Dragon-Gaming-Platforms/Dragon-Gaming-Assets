# Mandelbrot Lab

For each pixel, iterate z → z² + c and see whether it escapes. The points that never escape form the Mandelbrot set — infinite detail at every scale.

## Features

- Escape-time rendering with smooth (log-log) escape values for banding
- Pan (drag), zoom (scroll, +/− keys, slider) and four named regions: full set, seahorse valley, elephant valley, spiral
- Cursor readout: c value, escape iterations, in-set test
- Max-iterations slider (20–300) for deeper boundary detail

## Controls

Max-iterations and zoom sliders, four presets (full set/seahorse/elephant/spiral), zoom in/out and reset buttons, drag to pan, scroll to zoom; keys 1–4 load presets, +/− zoom, R resets

## Implementation

z starts at 0; if |z| exceeds 2 the orbit provably escapes (once |z| > 2, |z² + c| ≥ |z|² − |c| > |z| for |c| ≤ 2). Points surviving maxIter iterations are drawn black. The harness verifies c = 0 and c = 0.25 are in the set (main cardioid), c = 1 escapes in 2 iterations, c = 2 escapes immediately, c = −2 is in the set (boundary), and that the smooth value is finite and ordered by escape time.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Mandelbrot-set explorer with escape-time rendering and smooth coloring; no third-party assets, libraries or network services)
