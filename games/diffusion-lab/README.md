# Diffusion Lab

Hundreds of random walkers, with the mean squared displacement measured live against time.

## Features

- Brownian, Levy-flight and persistent walkers in one arena, up to 3,000 at a time
- Live mean squared displacement with a log-log slope fit (about 1 for diffusion, 2 for ballistic motion)
- Diffusion-coefficient estimate, RMS radius and an accumulating trail cloud
- Click anywhere to move the release point and restart the clock

## Controls

- Walker count, step length, drift sliders, walk type and pattern presets; click to move the release point; Space pauses, R resets, C clears the paths

## Implementation

Walkers are plain objects advanced on a fixed 30 Hz accumulator. The MSD chart fits log(t) against log(MSD) by least squares over the first two thirds of the run so reflecting walls do not bend the slope.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom random-walk diffusion sandbox with live log-log MSD fit and three walk laws; no third-party assets, libraries or network services)
