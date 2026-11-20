# Wave Lab

A string fixed at both ends, plucked and released. It vibrates as a sum of standing-wave modes — the fundamental plus harmonics at fₙ = n·c/(2L) — and the pluck position decides which harmonics sound.

## Features

- Modal superposition: y(x,t) = Σ Aₙ·sin(nπx/L)·cos(ωₙt)·e^(−γt), ωₙ = nπc/L, c = √(T/μ)
- Triangular-pluck coefficients Aₙ ∝ sin(nπx₀/L)/n² — modes with a node at the pluck vanish
- Mode-shape overlay (first three modes), click-to-set pluck point
- Fundamental, 2nd/3rd harmonic, period, wave-speed and strongest-mode readouts
- Four presets: guitar, violin, bass, harp

## Controls

Tension, density, pluck-position and damping sliders, four presets (guitar/violin/bass/harp), pluck button, modes toggle, click-to-set-pluck; keys 1–4 load presets, Space plucks

## Implementation

The string obeys the wave equation with fixed ends, so the modes are sin(nπx/L) with frequencies fₙ = n·c/(2L), c = √(T/μ). A triangular pluck at x₀ gives Aₙ ∝ sin(nπx₀/L)/n². The harness verifies c = √(T/μ), f₁ = c/(2L), that a centre pluck kills all even harmonics, that an L/3 pluck kills every third harmonic, and that displacement at t=0 reproduces the triangle shape.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom vibrating-string lab with modal superposition and pluck-point harmonic analysis; no third-party assets, libraries or network services)
