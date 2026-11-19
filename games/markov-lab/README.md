# Markov Lab

A word-level Markov chain trained on a small built-in corpus. The next word depends only on the last few words — enough to fake the rhythm of English, not enough to understand it.

## Features

- Word-level Markov chain with order 1–3, trained on an original built-in corpus (30 sentences)
- Temperature-adjusted sampling (p^(1/T) renormalised): T > 1 flattens, T < 1 sharpens
- Transition-matrix heatmap over the 24 most frequent words
- Vocabulary, context count, transition count, average log-probability, unique-word and repeat readouts
- Seeded RNG: Generate and Retrain produce fresh text deterministically

## Controls

Chain-order, temperature and length sliders, three order presets, generate/retrain buttons, heatmap toggle; keys 1–3 set the order, G generates, R retrains

## Implementation

Training counts, for every context of `order` words, how often each word follows it. Generation samples the next word from the temperature-adjusted distribution p^(1/T) renormalised. The harness verifies every transition row sums to 1, that generated words all come from the vocabulary, that higher orders produce fewer contexts than tokens, and that temperature 2.0 yields a flatter distribution than temperature 0.5 for the same context.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Markov-chain text lab with temperature sampling and transition-matrix heatmap; corpus prose written for this lab; no third-party assets, libraries or network services)
