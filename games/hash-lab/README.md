# Hash Lab

Linear, quadratic and double hashing on a real table, with measured probe counts against Knuth's formulas and a hash-quality slider.

## Features

- Open addressing with linear, quadratic (triangular) and double-hashing probe sequences, plus chaining for comparison
- Hover any slot to read its contents; the table redraws the probe layout as keys land
- Measured average probes for hits and misses against the classic uniform-hashing predictions, plotted as a function of load
- A hash-quality slider that sends part of the key space into a small set of buckets, demonstrating clustering from a bad hash
- Chain-length histogram for the same key set, with the ideal Poisson mean marked

## Controls

Table size, insertion count and hash-quality sliders, three probe schemes, insert/fill/clear buttons, hover inspection; Space inserts, C clears, 1–3 switch schemes

## Implementation

Insertions run a genuine probe loop; a hit probe count is recorded per insert and misses are averaged over 200 absent keys, so the numbers are measured rather than predicted. The chart draws the closed-form curves for each scheme and plots the current table's measured averages on top. Quadratics use triangular numbers, which visit every slot when the table size is prime, and double hashing derives its step from the key.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom hash table lab with three open-addressing schemes, chaining, measured probe costs and a tunable hash function; no third-party assets, libraries or network services)
