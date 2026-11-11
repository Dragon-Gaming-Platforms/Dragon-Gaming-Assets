# Color Lab

Build an HSL harmony, then test it for WCAG contrast and simulated colour-vision deficiency.

## Features

- HSL palette generation with complementary, analogous, triadic, tetradic and split-complementary harmonies
- WCAG 2.1 contrast ratio with AA/AAA grading for normal and large text
- Protanopia, deuteranopia and tritanopia simulations of both the palette and the chosen text pair
- Live preview at display and body-text sizes, luminance breakdown, colour pickers and night, paper and sunset presets

## Controls

Hue, saturation and lightness sliders; harmony and vision-simulation buttons; colour pickers, swap, random and theme presets; click a swatch for text, shift-click for background; keys 1-5, S, R

## Implementation

Contrast follows the WCAG 2.1 relative-luminance definition with the sRGB transfer function. Palettes are generated in HSL and converted to sRGB by hand. The vision simulations use the widely published Brettel-style 3×3 dichromacy matrices applied in gamma-encoded sRGB and clamped — an approximation for checking designs, not a medical model.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom custom colour palette and accessibility tool with HSL harmonies, WCAG contrast grading and dichromacy simulation; no third-party assets, libraries or network services)
