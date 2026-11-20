# Logistic Lab

One line of maths — x → r·x(1−x) — and a slider. Turn r up and the population settles, then oscillates with period 2, 4, 8… then dissolves into chaos.

## Features

- Bifurcation diagram over r ∈ [2.5, 4.0] with the fixed-point curve x* = 1 − 1/r
- Live time series of the orbit at the current r
- Period detection (attractor clustering) and Lyapunov exponent estimation
- Four presets: fixed point (r=2.8), period-2 (3.2), period-4 (3.5), chaos (3.9)

## Controls

Parameter-r and start-x0 sliders, four presets (fixed/period-2/period-4/chaos), time-series toggle, reset; keys 1–4 load presets, R resets

## Implementation

x_{n+1} = r·x_n(1−x_n). The fixed point x* = 1 − 1/r is stable for r < 3; period-doubling bifurcations occur at r ≈ 3, 3.449, 3.544, converging to the accumulation point r ≈ 3.570. The Lyapunov exponent λ = mean(ln|r(1−2x)|) is negative for stable cycles and positive in chaos. The harness verifies r=2.8 converges to x* = 1 − 1/r, r=3.2 has period 2, r=3.5 has period 4, and r=3.9 has positive Lyapunov exponent with a wide attractor.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom logistic-map lab with bifurcation diagram, period detection and Lyapunov estimation; no third-party assets, libraries or network services)
