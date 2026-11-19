# Lens Lab

Thin-lens ray optics: move the object, change the focal length, and watch the three principal rays meet (or diverge) at the image.

## Features

- The three principal rays (parallel-then-focal, focal-then-parallel, through-the-centre) drawn solid, with dashed backward extensions for virtual images
- Lens equation 1/f = 1/sₒ + 1/sᵢ with a live 1/f consistency check, magnification m = −sᵢ/sₒ, and real/virtual + inverted/upright + magnified/diminished classification
- Converging and diverging lenses (negative f), focal-point markers, draggable object tip
- Four presets: converging, diverging, telephoto and close-up

## Controls

Focal length, object distance and height sliders, four presets, ray and focal-point toggles, draggable object tip; keys 1–4 load presets, R toggles rays, F toggles focal points

## Implementation

Image distance comes from 1/sᵢ = 1/f − 1/sₒ (Infinity when the object sits at f), magnification from m = −sᵢ/sₒ. Rays are constructed geometrically: R1 bends at the lens toward/away from the far focal point, R2 passes through the near focal point then exits parallel, R3 goes straight through the centre. The harness verifies the converging preset (f=100, sₒ=250 → sᵢ≈166.7, m≈−0.67), the virtual regime (sₒ=50 < f → sᵢ=−100, m=+2), the diverging case (always virtual) and the 1/f identity to 1e-9.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom thin-lens optics lab with principal-ray construction, lens-equation readouts and virtual-image extensions; no third-party assets, libraries or network services)
