# Gamblers Lab

Start with i coins, win or lose 1 coin per round, stop at 0 (ruin) or N (the goal). Even a fair game is a slow bleed — the house only needs time.

## Features

- Exact ruin probability (q/p)ⁱ formula and expected-duration formula
- 50 simulated walks drawn against the theory
- Fair, unfair, favorable and long-shot presets
- Theory vs simulation readouts for ruin rate and duration

## Controls

Start, goal and win-probability sliders, four presets (fair/unfair/favorable/long shot), simulate and reset buttons; keys 1–4 load presets, Space simulates, R resets

## Implementation

P(ruin) = (1 − (q/p)ⁱ)/(1 − (q/p)ᴺ) for p ≠ ½, and 1 − i/N for p = ½. Expected duration is i(N−i) for p = ½ and (i − N·P(ruin))/(q−p) otherwise. The harness verifies the fair-game ruin probability (i=50, N=100 → 0.5), the fair duration (2500), that p=0.4 gives ruin probability > 0.95, that p=0.6 gives ruin probability < 0.05, and that the simulated ruin rate matches theory within 0.15 over 50 walks.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom gambler's-ruin lab with exact ruin formulas and walk simulation; no third-party assets, libraries or network services)
