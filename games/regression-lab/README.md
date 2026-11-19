# Regression Lab

Click to add points, and the least-squares line follows. Slope = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)² — the line that minimises the squared residuals. R² says how much of the scatter the line explains.

## Features

- Least-squares fit with slope, intercept, R², RMSE and correlation readouts
- Residual lines drawn from each point to the fit; dashed true line for comparison
- Gaussian-noise point generation (Box–Muller, seeded RNG) with a wild-outlier preset
- Click-to-add-points, regenerate and clear controls
- Four presets: clean, noisy, outlier, flat

## Controls

True-slope, intercept, noise and point-count sliders, four presets (clean/noisy/outlier/flat), regenerate/clear buttons, residuals toggle, click-to-add-points; keys 1–4 load presets, R regenerates, C clears

## Implementation

The fit minimises Σ(y − (a + bx))²: b = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)², a = ȳ − b·x̄. R² = 1 − SSres/SStot and r = Σ(x−x̄)(y−ȳ)/√(Σ(x−x̄)²·Σ(y−ȳ)²). The harness verifies the fit recovers a perfect line exactly (R² = 1, slope exact), matches the closed form on hand-computed points, that R² = r², and that the outlier preset lowers R² versus the clean preset.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom least-squares regression lab with R², residuals and outlier analysis; no third-party assets, libraries or network services)
