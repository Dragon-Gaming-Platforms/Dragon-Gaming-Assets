# L-System Lab

An axiom and a few rewrite rules, applied again and again, grow into fractals. A turtle reads the string — F draws, + and − turn — and the curve appears.

## Features

- Parallel string rewriting (L-systems) with turtle graphics and a push/pop stack for branches
- Four presets: Koch snowflake, dragon curve, plant (fern), Sierpinski triangle
- Iteration and turn-angle sliders, grow/reset controls
- String length, segment count and fractal-dimension readouts

## Controls

Iteration and turn-angle sliders, four presets (Koch/dragon/plant/Sierpinski), grow/reset buttons; keys 1–4 load presets, Space grows, R resets

## Implementation

Each iteration replaces every symbol by its rule simultaneously. The turtle walks the final string: F steps forward, +/− turn by the angle, [ pushes position+heading and ] pops. Koch has dimension log(4)/log(3) ≈ 1.26, Sierpinski log(3)/log(2) ≈ 1.58. The harness verifies Koch segment counts (4ⁿ), dragon segment counts (2ⁿ), that expansion is parallel (no cascading within one iteration), and that the turtle returns to its start for a closed curve.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom L-system lab with turtle graphics and fractal-dimension readouts; no third-party assets, libraries or network services)
