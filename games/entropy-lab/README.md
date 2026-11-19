# Entropy Lab

Four outcomes, four probabilities. Shannon entropy H = −Σ p·log₂p measures the surprise in the distribution — maximum when every outcome is equally likely, zero when the outcome is certain.

## Features

- Four outcome sliders (raw weights, normalised to probabilities)
- Shannon entropy, max entropy, efficiency, KL divergence from uniform and perplexity readouts
- Probability bar chart with the uniform reference line and an entropy meter
- Flip-100 sampling check: empirical counts vs the probabilities
- Four presets: uniform, biased, skewed, certain

## Controls

Four outcome-probability sliders, four presets (uniform/biased/skewed/certain), flip-100 and reset buttons; keys 1–4 load presets, F flips, R resets

## Implementation

H = −Σ p·log₂(p) over the normalised probabilities; Hmax = log₂(4) = 2 bits; KL(p‖uniform) = log₂(4) − H(p); perplexity = 2^H. The harness verifies uniform gives exactly 2 bits, deterministic gives 0, entropy never exceeds the max, KL(p‖uniform) = 2 − H(p) for a skewed distribution, and perplexity of the uniform distribution is 4.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Shannon entropy lab with KL divergence, perplexity and a sampling check; no third-party assets, libraries or network services)
