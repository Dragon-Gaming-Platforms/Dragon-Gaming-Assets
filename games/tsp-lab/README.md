# TSP Lab

Nearest neighbour, 2-opt and simulated annealing on the same cities, measured against a minimum spanning tree lower bound.

## Features

- Nearest-neighbour construction, deterministic 2-opt local search and simulated annealing over 2-opt moves
- A real lower bound: the minimum spanning tree weight, so the reported gap is a certificate rather than a guess
- Annealing temperature expressed in mean-edge units, so the same slider value means the same thing at 8 cities or 80
- Click-to-place and drag editing, jittered lattice, uniform scatter and clustered layouts
- History sparkline of the best tour per sweep, with tour overlays for greedy, 2-opt and annealing

## Controls

City count, start temperature and cooling sliders, run/pause, restart, grid/scatter/cluster layouts, click to add cities and drag to move them; Space pauses, R restarts, S rescatters

## Implementation

2-opt reverses the segment between the two cut edges and recomputes the delta from the four affected edges; annealing accepts the same move with probability exp(-delta/T) and cools geometrically per sweep. The MST bound uses Prim's algorithm on the complete graph. Every tour is verified as a permutation during testing, and the 2-opt result is checked to have no improving move left.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom travelling-salesperson lab with nearest-neighbour, 2-opt, simulated annealing and an MST lower bound; no third-party assets, libraries or network services)
