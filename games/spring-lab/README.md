# Spring Lab

A driven mass-spring-damper: tune mass, stiffness, damping and drive frequency, and watch the displacement trace settle into resonance or die away.

## Features

- Semi-implicit Euler integration at 480 Hz substeps for the driven equation m·x″ + c·x′ + k·x = F₀·sin(ωt)
- Closed-form steady-state amplitude and phase lag, checked against the simulated trace
- Natural frequency ωₙ = √(k/m), damping ratio ζ = c/(2√(km)), and energy readouts
- Five presets: undamped, underdamped, critically damped, overdamped and resonant
- Spring/mass animation plus a scrolling displacement-vs-time trace with the drive force behind it

## Controls

Mass, stiffness, damping, drive-frequency and drive-amplitude sliders, five damping/resonance presets, play/pause, kick and reset; keys 1–5 load presets, Space pauses, K kicks, R resets

## Implementation

The steady-state amplitude X = F₀/√((k − mω²)² + (cω)²) and phase lag φ = atan2(cω, k − mω²) are exact for the linear ODE. The harness verifies ωₙ and ζ for the critical preset (ζ = 1.0), that the simulated amplitude converges to the closed-form steady state within 15% after 8 s, and that an undamped kick conserves energy to within 5%.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom mass-spring-damper lab with resonance analysis, closed-form steady state and scrolling displacement trace; no third-party assets, libraries or network services)
