# Chladni Lab

Sand on a vibrating plate, settling into the nodal lines of mode (n, m).

## Features

- Standing-wave modes sin(n pi u) sin(m pi v) on a square plate, 1 to 9 in both directions
- Up to 20,000 sand grains kicked proportionally to local vibration and drawn to the quiet lines
- Optional heat map of the vibration field and a nodal-line overlay
- Live settled fraction, node coverage and relative modal frequency

## Controls

- Mode n and m sliders, shake strength, grain count, field and overlay toggles; next-mode button; Space pauses, R re-sprinkles, N advances the mode

## Implementation

Grains feel a kick proportional to |amplitude| and a downhill pull computed from finite differences of |amplitude|, so no precomputed advection field is needed. Drawing batches grains by tone into a handful of fillRect runs.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Chladni plate simulation with modal standing waves, sand migration and nodal-line overlay; no third-party assets, libraries or network services)
