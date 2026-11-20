# Circuit Lab

A battery, a resistor and a capacitor in a loop. The capacitor charges exponentially: V_c(t) = V₀(1 − e^(−t/RC)). The time constant τ = RC sets the pace — after 5τ the capacitor is 99% full.

## Features

- RC charging and discharging with exact exponential solutions
- Circuit diagram (battery, resistor, capacitor) with current-direction arrow
- Voltage and current curves vs time with τ marker and supply line
- Time constant, V_c, I_c, charge Q = C·V_c and energy ½C·V_c² readouts
- Four presets: fast (τ=0.01 s), medium (1 s), slow (25 s), huge (100 s)

## Controls

Resistance, capacitance and supply-voltage sliders, four presets (fast/medium/slow/huge), charge/discharge buttons, curves toggle; keys 1–4 load presets, Space charges, D discharges

## Implementation

V_c(t) = V₀(1 − e^(−t/RC)) and I_c(t) = (V₀/R)e^(−t/RC) solve Kirchhoff's loop law for the series RC circuit; discharge is V₀·e^(−t/RC). The harness verifies V_c(0) = 0, V_c(τ) = V₀(1 − 1/e) ≈ 0.632·V₀, V_c(5τ) > 0.99·V₀, I_c(0) = V₀/R, Q = C·V and E = ½CV², and that discharge decays with the same τ.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom RC-circuit lab with exponential charge curves and energy readouts; no third-party assets, libraries or network services)
