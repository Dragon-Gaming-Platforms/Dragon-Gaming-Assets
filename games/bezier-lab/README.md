# Bézier Lab

A draggable Bézier curve with de Casteljau's construction, the control hull, curvature and the osculating circle — all checked against each other.

## Features

- Bézier curves of degree 1–7 with draggable control points and a live control polygon
- de Casteljau's construction drawn layer by layer for the current parameter
- Analytic first and second derivatives feeding a real curvature readout and an osculating circle
- Convex hull of the control points drawn behind the curve, with the containment property reported in the status line
- Arc-length measurement with a chord-to-length ratio bar, plus a derivative sanity panel comparing the analytic derivative against a central difference

## Controls

Parameter, degree and curvature-scale sliders, three shape presets, hull and construction toggles, draggable control points, click to pick a parameter; keys 1–3 load presets, H and D toggle overlays

## Implementation

Three evaluations of the same curve are cross-checked: the Bernstein sum, de Casteljau's repeated interpolation and a dense polyline used for length and the curvature scan. Curvature is |x'y'' − y'x''| / |(x',y')|³ from the exact derivative Béziers, and the osculating circle is centred one radius along the normal. The harness verifies the two point evaluations agree to 1e-9, that a straight line reports zero curvature, and that a quadratic matches the closed-form curvature.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom Bézier curve lab with de Casteljau construction, curvature, osculating circles and arc length; no third-party assets, libraries or network services)
