# Projectile Lab

Launch speed, angle and air drag set the flight. With no drag the range is v₀²·sin(2θ)/g — drag always steals distance, and the best angle drops below 45°.

## Features

- Quadratic air drag (x″ = −k·vx·|v|, y″ = −g − k·vy·|v|) integrated with RK4 at 240 Hz
- Dashed no-drag parabola overlaid on the real flight; landing flag at the predicted range
- Four planetary gravities: Earth 9.8, Mars 3.7, Moon 1.6, Jupiter 24.8 m/s²
- Drag-aware optimum angle found by scanning 10–60°; click-to-aim on the canvas
- Range, apex, flight time, impact speed, no-drag range and drag-loss readouts

## Controls

Launch-speed, angle and drag sliders, four gravity presets (Earth/Mars/Moon/Jupiter), launch/reset buttons, trail toggle, click-to-aim; keys 1–4 switch planets, Space launches, R resets

## Implementation

The shell obeys x″ = −k·vx·|v| and y″ = −g − k·vy·|v|, integrated with classic RK4 at 240 Hz. With k = 0 the flight is the textbook parabola: range = v₀²·sin(2θ)/g, apex = (v₀·sinθ)²/(2g), time = 2·v₀·sinθ/g. The harness verifies the no-drag simulation matches all three closed forms to within 0.5%, that drag strictly reduces range, that the drag-aware optimum angle is ≤ 45°, and that Mars (g = 3.7) flies farther than Earth for the same shot.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom projectile-motion lab with quadratic drag, RK4 integration and drag-aware optimum-angle analysis; no third-party assets, libraries or network services)
