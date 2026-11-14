# Kalman Lab

A Kalman filter and a particle filter tracking the same noisy 1-D sensor, with ±2σ bands and a normalised-innovation consistency check.

## Features

- Closed-form Kalman predict/update for a random walk, with the posterior variance carried forward
- A bootstrap particle filter with weighted likelihoods, effective sample size and systematic resampling
- ±2σ bands for both filters plus an innovation strip with its ±2σ gate
- Normalised innovation squared averaged over the track, so over- and under-confidence are visible
- Autoscaling position axis, running RMSE for both filters, and manoeuvre presets that break the model on purpose

## Controls

Process and measurement noise sliders, particle-count slider, pause/reset/outlier buttons, calm/noisy/jumpy presets; Space pauses, R resets, O injects an outlier, click the plot to drop a wild measurement

## Implementation

The hidden state really is a random walk driven by the same process noise the filters assume, so NIS settles near 1 when the settings are honest. The particle filter propagates samples, weights them by a Gaussian likelihood, and resamples only when the effective sample size drops below half the population. Both filters consume the same measurements, in the same order, one per frame.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom state-estimation lab with a 1-D Kalman filter, a bootstrap particle filter and NIS consistency diagnostics; no third-party assets, libraries or network services)
