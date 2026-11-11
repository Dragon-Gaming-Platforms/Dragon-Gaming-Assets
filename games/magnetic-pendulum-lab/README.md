# Magnetic Pendulum Lab

A swinging bob over two to six magnets, and the fractal basin map that decides where it lands.

## Features

- Real-time bob with trail, energy readout and settle detection over two to six magnets
- Basin-of-attraction map computed incrementally, one release point at a time
- Chaos metric: the share of neighbouring release points that disagree about the winner
- Click the plate to release the bob exactly there, or the map for a cell verdict

## Controls

- Magnet count, strength, damping, gravity and map resolution sliders; Drop bob, Reset map; click the plate to release from a point; Space pauses, D drops, R clears the map

## Implementation

Motion integrates the magnetic inverse-square pull with Symplectic Euler at a fixed micro-step. The basin map runs the same solver headlessly per grid cell, breaking symmetry at saddle points so every cell resolves.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom magnetic pendulum simulation with live basin-of-attraction map and chaos metric; no third-party assets, libraries or network services)
