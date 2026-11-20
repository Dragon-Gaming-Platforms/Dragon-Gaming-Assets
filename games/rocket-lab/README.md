# Rocket Lab

The Tsiolkovsky rocket equation: Δv = vₑ·ln(m₀/m_f). Your speed change depends only on the exhaust velocity and the mass ratio — not on how fast you burn.

## Features

- Tsiolkovsky Δv with mass-ratio, propellant-fraction and final-mass readouts
- Δv budget bar against LEO (9.4 km/s), Mars transfer (12 km/s) and escape (16 km/s) milestones
- Four engine presets: chemical (vₑ=3.0), nuclear thermal (9.0), ion (30), staged chemical (3.5, ratio 20)
- Launch animation with burn progress

## Controls

Exhaust-velocity, mass-ratio and payload sliders, four presets (chemical/nuclear/ion/staged), launch and reset buttons; keys 1–4 load presets, Space launches, R resets

## Implementation

Δv = vₑ·ln(m₀/m_f); the mass ratio needed for a target Δv is e^(Δv/vₑ); the propellant fraction is 1 − e^(−Δv/vₑ). The harness verifies Δv(3, e, 1) = 3, massRatio(3, 3) = e, that a chemical rocket needs mass ratio ≈ 23 for LEO, that the ion engine needs only ≈ 1.37, and that propellant fraction for LEO on chemical rockets exceeds 95%.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom rocket-equation lab with delta-v budgets and engine presets; no third-party assets, libraries or network services)
