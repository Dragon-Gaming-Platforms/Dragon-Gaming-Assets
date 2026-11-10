# Flow Field Studio

Thousands of particles steered by a seeded noise field paint an image that nobody designed.

## Features

- Seeded value noise with fractal octaves bending a vector field across the canvas
- Up to 4,000 particles batched into five colour lanes for cheap strokes
- Drag the pointer to locally stir the field; palette switching recolours new strokes
- Reseed for a completely different painting, or save the canvas as a PNG

## Controls

- Particle count, field scale, turbulence, step size and trail sliders; palette and drift options; drag to stir; Space pauses, R reseeds, C clears, S saves a PNG

## Implementation

The field is a hand-written hash-noise fbm evaluated per particle step; strokes are collected into per-colour segment buffers and stroked in five batched paths so 3,000+ particles stay smooth.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom value-noise flow field renderer with seeded fields and PNG export; no third-party assets, libraries or network services)
