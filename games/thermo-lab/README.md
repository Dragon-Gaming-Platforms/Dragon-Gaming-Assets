# Thermo Lab

The heat equation ∂T/∂t = α·∂²T/∂x²: heat flows from hot to cold until everything evens out. The diffusivity α sets the pace; the boundary conditions decide the ending.

## Features

- Explicit FTCS scheme (stability number r = 0.4 ≤ 0.5) on 100 cells
- Three boundary conditions: insulated (Neumann), fixed cold, hot/cold ends (Dirichlet)
- Four initial conditions: hot spot, gradient, sine, step
- Max/min/mean temperature, total energy and steady-state readouts

## Controls

Diffusivity and boundary-condition sliders, four initial-condition presets (hot spot/gradient/sine/step), run/pause and reset buttons; keys 1–4 load presets, Space runs/pauses, R resets

## Implementation

T_i^{n+1} = T_i^n + r·(T_{i-1}^n − 2T_i^n + T_{i+1}^n) with r = α·dt/dx² = 0.4. Insulated ends mirror the interior value (zero flux); Dirichlet ends are pinned. The harness verifies energy is conserved under insulated boundaries to 1e-9 over 500 steps, that a hot spot's max decreases while its min increases, that fixed-cold ends drain energy toward 0, and that hot/cold ends converge to a linear gradient.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom heat-equation lab with FTCS integration and boundary-condition comparison; no third-party assets, libraries or network services)
