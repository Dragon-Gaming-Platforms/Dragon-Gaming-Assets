# Queueing Lab

An M/M/1 queue you can push into saturation, with the measured wait time plotted against the theory.

## Features

- Event-driven M/M/1 queue with exponential inter-arrival and service times
- Live queue lane, server progress, queue-length sparkline and a Wq-versus-utilisation chart
- Exact time integrals for Lq, L and utilisation, compared with the closed-form M/M/1 results
- Little's law checked live as L against λW, plus a burn-in button and light, busy and edge-of-stability presets

## Controls

Arrival and service rate sliders, simulation speed, pause, burn-in and three load presets; Space pauses, R resets, B burns in 500 time units

## Implementation

The simulation advances from event to event, accumulating ∫Q dt, ∫(Q+1 busy) dt and busy time between events, so the run-time averages are exact for the sampled trajectory rather than sampled at frame boundaries. Theory uses Wq = ρ/(μ−λ), Lq = ρ²/(1−ρ) and L = λW. Service and arrival gaps are drawn from a seeded generator, so runs are reproducible.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom event-driven M/M/1 queue simulator with live queue animation, exact time-average statistics, Little's law check and Wq-versus-utilisation chart; no third-party assets, libraries or network services)
