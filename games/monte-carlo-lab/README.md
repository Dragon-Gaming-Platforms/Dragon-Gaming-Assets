# Monte Carlo Lab

Estimate π three ways — darts, an integral and Buffon's needle — and watch the error fall like 1/√N.

## Features

- Three estimators of π: quarter-circle darts, the ∫₀¹ 4/(1+x²) integral, and Buffon's needle at an adjustable length
- Live convergence chart on a log sample axis with ±1 standard-error bands and the true value marked
- Chi-style honesty checks: standard error, z-score, and a measured 10× scaling ratio that should come out near √10
- A 200-run repeat experiment plotting the sampling distribution against the predicted spread

## Controls

Pick an experiment, set samples per frame and needle length, pause, burst a million throws or run 200 repeats; Space pauses, R resets, B throws a million

## Implementation

Every estimator is a sample mean with a closed-form variance: 4·√(p(1−p)/N) for the darts, the numeric variance of the integrand for the integral, and the delta method 2L/p²·√(p(1−p)/N) for the needle. The scaling button throws 24 paired runs at N and 10N and reports the ratio of their RMS errors, which should land near 3.16 rather than being asserted in prose.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom Monte Carlo estimator lab with darts, numerical integration, Buffon's needle, standard-error bands and a measured 1/√N scaling check; no third-party assets, libraries or network services)
