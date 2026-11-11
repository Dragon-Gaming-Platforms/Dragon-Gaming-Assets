# Percolation Lab

Fill a lattice at random and watch a spanning cluster appear at the critical probability — a hands-on phase transition.

## Features

- Site percolation on 80² or 120² square lattices with a single uniform random field per sample
- Union-find cluster labelling with top/bottom flags, so spanning is a direct check rather than a search
- Animated p sweep that records the probability where spanning first appears
- Bisection estimate of the critical probability from repeated crossing trials, plus click-to-flip cells and a spanning-only view

## Controls

p slider, click cells to flip them, sweep and estimate buttons, 80²/120² resolution, highlight toggle; Space reseeds, S sweeps, E estimates the critical point

## Implementation

Each draw creates one random field; dragging p thresholds that same field, so cells are added to a stable landscape instead of the world being redrawn. Cluster statistics come from a union-find with size and edge flags merged through the roots. The p_c estimate bisects on the fraction of 18–24 independent samples that span, nine levels deep.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom site-percolation sandbox with union-find spanning detection, animated sweep and bisection estimate of the critical probability; no third-party assets, libraries or network services)
