# Bloom Lab

A Bloom filter visualizer: bit-array size, hash count and item count sliders drive occupancy and the false-positive rate, checked against theory.

## Features

- Live bit-array grid with set/clear cells and the last query's k bits flashed in amber
- Double hashing (Kirsch–Mitzenmacher hᵢ = h₁ + i·h₂) over FNV-1a base hashes
- Measured false-positive rate over 1000 non-member trials, compared with the theory (1 − e^(−kn/m))^k
- Optimal-k readout ((m/n)·ln 2) with a status line that diagnoses too-few / too-many hashes
- Four presets including an optimal-k configuration for 1% FPR

## Controls

Bit-array, hash-count and item-count sliders, four presets, insert/query/reset buttons; keys 1–4 load presets, I inserts, Q queries, R resets

## Implementation

Inserting a word sets k bits; querying checks all k. The theory FPR assumes independent uniform hashes: occupancy ≈ 1 − e^(−kn/m), so FPR ≈ (1 − e^(−kn/m))^k. The harness verifies the medium preset's measured FPR lands within 1.5 percentage points of theory, that members never false-negative, and that the optimal preset (m ≈ 9.59n, k ≈ 6.64) beats a fixed k=3 at the same m/n.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Bloom filter lab with double hashing, measured-vs-theory false-positive rates and optimal-k analysis; no third-party assets, libraries or network services)
