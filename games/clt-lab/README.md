# CLT Lab

Roll n dice and add them up. One die is flat, two dice make a triangle, and by ten dice the histogram is already a bell curve — the central limit theorem in action.

## Features

- Histogram of dice sums with the theoretical normal curve overlaid
- Sample mean/sd/skewness vs theory readouts (μ = n(f+1)/2, σ² = n(f²−1)/12)
- Three dice presets: d4, d6, d20; 1–20 dice per roll; 200–5000 samples
- Seeded RNG for reproducible batches

## Controls

Dice-per-roll and sample-count sliders, three dice presets (d6/d4/d20), roll button, normal-curve toggle; keys 1–3 switch dice, Space rolls

## Implementation

The sum of n independent dice with f faces has mean n(f+1)/2 and variance n(f²−1)/12. The harness verifies the sample mean and sd match theory within 3% at n = 10 with 5000 samples, that the normal PDF integrates to 1, that a single d6 histogram is roughly uniform (max/min bin ratio < 1.3), and that skewness shrinks as n grows from 1 to 10.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom central-limit-theorem lab with dice-sum histograms and theoretical normal overlay; no third-party assets, libraries or network services)
