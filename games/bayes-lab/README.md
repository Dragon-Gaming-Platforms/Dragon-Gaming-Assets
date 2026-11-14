# Bayes Lab

A rare-disease test and a biased coin: watch Bayes' rule turn a scary positive into a modest probability, and belief tighten flip by flip.

## Features

- Diagnostic test calculator with prior, sensitivity, false positives and repeated independent positives
- A 10,000-person dot tree so the arithmetic is visible instead of asserted
- Beta-Bernoulli coin learning with a live posterior density and a 95% credible interval
- Posterior-mean trace on a log flip axis, with true bias marker and adjustable prior strength

## Controls

Prevalence, sensitivity, false-positive rate and repeat-test sliders; true bias and prior strength; flip 1, 10 or 100 times; Space flips, H flips ten, R resets the coin

## Implementation

The test side applies Bayes' rule in odds form for repeated positives. The coin side is conjugate: a Beta prior updated by Bernoulli flips gives Beta(a,h) posteriors, whose density is evaluated in log space via a Lanczos lgamma and integrated numerically for the credible interval. A prior strength of zero falls back to Jeffreys Beta(0.5, 0.5) instead of the undefined Beta(0, 0).

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom Bayesian inference lab with diagnostic-test arithmetic, a scaled population tree, conjugate Beta-Bernoulli coin learning and credible intervals; no third-party assets, libraries or network services)
