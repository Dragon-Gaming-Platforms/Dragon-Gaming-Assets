# Ising Model Lab

Metropolis Monte Carlo on a square lattice: heat it up, cool it down, and watch order appear and dissolve.

## Features

- Metropolis single-spin-flip dynamics with periodic boundary conditions
- Live magnetisation, energy per spin, susceptibility and acceptance rate
- Magnetisation history chart plus a cold-to-hot temperature gauge marked at Tc
- Four lattice sizes and a slow-warming preset that walks the temperature up

## Controls

- Temperature slider and presets, lattice size, Run, Sweep and Reset; Space runs or pauses, S sweeps, R resets

## Implementation

Each sweep attempts one flip per spin. The lattice renders through an offscreen ImageData buffer scaled up with smoothing disabled, so 16,384 spins stay cheap. No libraries are used.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Metropolis Monte Carlo Ising simulation with magnetisation, energy and susceptibility readouts; no third-party assets, libraries or network services)
