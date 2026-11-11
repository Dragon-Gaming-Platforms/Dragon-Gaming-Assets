# Genetics Lab

Run replicate Wright–Fisher populations and watch drift, selection and mutation fight over allele frequencies.

## Features

- Up to 24 replicate populations evolving side by side under Wright–Fisher sampling
- Adjustable population size (10–400), selection coefficient (−0.20 to +0.20) and symmetric mutation rate
- Scrolling 600-generation chart with live mean, fixation markers and a heterozygosity inset against the drift-only prediction
- Presets for neutral drift, strong selection and mutation–drift balance

## Controls

Population size, selection, mutation, replicate and speed sliders; pause, step, restart and three presets; Space pauses, R restarts, S advances 100 generations

## Implementation

Every generation applies viability selection, then mutation, then samples exactly N Bernoulli alleles from the resulting frequency. Sampling exactly (rather than with a normal approximation) keeps the absorbing states and the small-N behaviour correct. Each replicate carries its own trajectory; heterozygosity is averaged as 2p(1−p) and compared with H₀(1−1/N)^t.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom Wright–Fisher population genetics simulator with replicate lineages, selection, mutation, fixation tracking and heterozygosity decay; no third-party assets, libraries or network services)
