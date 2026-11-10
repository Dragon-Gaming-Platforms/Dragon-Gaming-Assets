# Harmonograph Lab

Two damped pendulums per axis draw a single decaying curve — change the frequency ratios and the figure changes character.

## Features

- Two damped sinusoids per axis summed into one continuous, self-terminating curve
- Six frequency presets from the classic 3:2 figure to near-equal beating ratios
- Live damping, speed, line weight and tail-fade controls
- Pointer drag retunes the phases; S exports the current figure as a PNG

## Controls

- Damping, speed and line weight sliders; six presets; fade-tail toggle; Space pauses, R redraws, S saves a PNG

## Implementation

The curve is a parametric harmonograph, x(t) = Σ aᵢ sin(fᵢt + pᵢ)·e^(−dᵢt), sampled incrementally onto a Canvas 2D layer until both axes settle. Everything is drawn in the browser with no external data.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom damped-pendulum harmonograph with six presets, live damping and PNG export; no third-party assets, libraries or network services)
