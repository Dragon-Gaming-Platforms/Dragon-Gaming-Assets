# Pathfinding Lab

Four search algorithms race across the same weighted grid — paint terrain, build mazes, and compare every route they find.

## Features

- Breadth-first, Dijkstra, A* and greedy best-first search on a 38 × 26 grid
- Weighted terrain: plain costs 1, sand 3, water 8, walls are impassable
- Drag-painting brushes for terrain, start and goal, plus a recursive-backtracker maze generator
- Settled-order replay with adjustable speed, and readouts for expanded cells, peak frontier, path cost, efficiency and search time

## Controls

Click and drag to paint walls, sand, water or the start and goal; algorithm and brush buttons; speed slider; Space reruns, M builds a maze, C clears, 1-4 switch algorithm

## Implementation

Each search runs to completion on a binary min-heap with lazy deletion (BFS uses a ring-buffer queue). Equal f-scores are broken towards the deeper node so A* does not fan out across an open grid. The animation only replays the recorded settle order, so every displayed number is the real search result. Manhattan distance is an admissible heuristic because the cheapest move costs 1.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom pathfinding comparison lab with four searches, weighted terrain painting, maze generator and step-by-step replay; no third-party assets, libraries or network services)
