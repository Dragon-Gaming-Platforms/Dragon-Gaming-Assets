# Julia Lab

The Mandelbrot set fixes the starting point and varies c. A Julia set does the opposite: fix c, vary the starting point z₀. Same iteration, completely different picture.

## Features

- Filled Julia set rendering with smooth escape-time coloring
- c real/imag sliders to morph the set live; four named presets (rabbit, Siegel disk, spiral, dendrite)
- Connectedness readout: the Julia set is connected iff c is in the Mandelbrot set
- Cursor probe: z₀ value, escape iterations, in-set test

## Controls

c-real, c-imag and max-iterations sliders, four presets (rabbit/siegel/spiral/dendrite), reset button, move cursor to probe z₀; keys 1–4 load presets, R resets

## Implementation

z starts at z₀; if |z| exceeds 2 the orbit escapes. Points surviving maxIter iterations are in the filled set. The Julia set is connected iff the orbit of 0 under z → z² + c is bounded (c in the Mandelbrot set). The harness verifies c=0 gives the unit disk (z₀=0.5 in, z₀=2 out), c=−1 gives the dendrite (z₀=0 in), c=0.25 keeps z₀=0 in the set, and that the smooth value is ordered by escape time.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Julia-set explorer with escape-time rendering and connectedness analysis; no third-party assets, libraries or network services)
