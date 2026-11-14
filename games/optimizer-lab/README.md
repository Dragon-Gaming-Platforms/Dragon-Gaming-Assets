# Optimizer Lab

SGD, momentum, RMSProp and Adam descending the same landscape from the same point — with the gradients checked against finite differences.

## Features

- Himmelblau, Rosenbrock, an anisotropic bowl and a rippled surface, each with its own minima
- Four optimizers with their real update rules, trajectories drawn over a contour map
- Log-scale loss chart per optimizer plus a live current-loss table
- Gradient verification against central differences, reported as a numeric error

## Controls

Four landscapes, log learning-rate slider, steps per frame, trajectory toggle, single step, restart and random start; Space pauses, R restarts, N steps once, X random start

## Implementation

Gradients are analytic for each surface and checked against central differences at four probe points; the residual is shown as the gradient check error. Rippled minima have no closed form, so they are located once by multi-start descent and cached. Momentum, RMSProp and Adam use the standard 0.9 / 0.999 constants with bias correction, and divergence is detected rather than silently plotted.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom optimizer comparison lab with four descent methods, four analytic landscapes, contour rendering and finite-difference gradient checks; no third-party assets, libraries or network services)
