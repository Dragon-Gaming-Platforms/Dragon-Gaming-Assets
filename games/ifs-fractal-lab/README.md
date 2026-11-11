# IFS Fractal Lab

Six iterated function systems drawn point by point, with the map weights under your thumb.

## Features

- Barnsley fern, fern leaf, Sierpinski triangle, Sierpinski carpet, Heighway dragon and Barspiral
- Live map-weight bias so you can starve or favour individual transforms
- Colour by map to see which transform painted which part of the attractor
- Burst mode adds 400,000 points at once; the canvas can be saved as a PNG

## Controls

- Fractal presets, points per frame, map-weight bias, palette and colour options; burst, clear and save; Space pauses, R restarts, C clears, S saves a PNG

## Implementation

Each attractor is a list of affine maps applied in sequence; the orbit is drawn straight into the canvas in per-map batches. Bounds are estimated from a 12,000-step probe so the drawing always fits the frame.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom iterated function system renderer with live map weighting, six attractors and PNG export; no third-party assets, libraries or network services)
