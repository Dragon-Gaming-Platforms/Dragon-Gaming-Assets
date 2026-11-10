# Quantum Tunneling Lab

A Gaussian wave packet hits a rectangular barrier and part of it comes out the other side.

## Features

- 1D time-dependent Schrödinger equation solved with split-step Fourier propagation on 1024 points
- Live transmitted and reflected percentages measured against a packet-averaged barrier prediction
- |ψ|² filled curve with a phase ribbon, plus a drawn potential barrier
- Four setups: tunnelling, over the top, thin wall and broad wall

## Controls

- Energy, barrier height, barrier width and speed sliders; four setups; Space pauses, R relaunches

## Implementation

An in-place radix-2 FFT (no libraries) applies the kinetic operator in momentum space while the barrier acts in position space. Sponge layers at both ends absorb outgoing probability so the periodic domain never wraps. The predicted transmission averages the plane-wave barrier formula over the packet's Gaussian energy spread.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom split-step Fourier Schrödinger solver with absorbing boundaries and packet-averaged transmission prediction; no third-party assets, libraries or network services)
