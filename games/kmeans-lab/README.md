# K-Means Lab

Points from Gaussian blobs, k centres, and Lloyd's algorithm: assign each point to its nearest centre, move each centre to its cluster's mean, repeat until the inertia stops falling.

## Features

- Lloyd's algorithm with k-means++ seeding, inertia tracked every iteration (monotonically decreasing)
- Gaussian blob point generation (Box–Muller, seeded RNG) plus a rings preset that defeats k-means
- Step / Run-to-convergence / Reset controls, draggable centres, assignment lines
- Cluster sizes, empty-cluster count, mean distance and convergence readouts

## Controls

Cluster-count, point-count and blob-spread sliders, four presets (2/3/4 blobs, rings), step/run/reset buttons, draggable centres; keys 1–4 load presets, S steps, G runs, R resets

## Implementation

Each iteration assigns points to the nearest centre (squared Euclidean), recomputes centres as cluster means, and recomputes inertia. Convergence is declared when centres move less than 1e-6. The harness verifies inertia falls monotonically over 10 steps, that the 3-blob preset converges with all clusters non-empty, and that the rings preset converges to a two-halves split (the true disc/ring centres coincide at the middle, so k-means cannot represent the true partition) with higher inertia than the blob case.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom k-means clustering lab with k-means++ seeding, inertia tracking and a non-convex rings counterexample; no third-party assets, libraries or network services)
