# FFT Lab

A signal built from a few sine waves, and its discrete Fourier transform. The DFT asks: how much of each frequency is in the signal? The answer is the spectrum below.

## Features

- Direct DFT (N = 64) over one period of a 4-harmonic signal
- Magnitude spectrum with optional log scale and phase ticks
- Dominant-bin, peak-magnitude, energy and Parseval readouts
- Four presets: sine, square (odd harmonics), sawtooth (1/n), chord

## Controls

Four harmonic-amplitude sliders, four presets (sine/square/saw/chord), log-scale and phase toggles; keys 1–4 load presets, L toggles log scale, P toggles phase

## Implementation

X[k] = Σₙ x[n]·e^(−2πi·k·n/N) computed directly. Parseval's theorem (Σx² = (1/N)Σ|X|²) is checked every frame. The harness verifies a pure sine puts all energy in one bin, Parseval holds to 1e-9, the square preset has empty even bins, the saw preset's harmonic magnitudes fall as 1/n, and the dominant bin of a chord matches the strongest harmonic.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom DFT lab with magnitude spectrum, phase ticks and Parseval verification; no third-party assets, libraries or network services)
