# Penrose Tiling Lab

Five families of parallel lines are cut into a patch of thick and thin rhombi that never repeats.

## Features

- Pentagrid construction: each crossing of two line families becomes one rhombus
- Live count of thick and thin rhombi with the ratio against φ ≈ 1.618
- Four palettes, optional seam lines and a colour-by-family mode
- Drag-free interaction: click the canvas to shift the grid origin and reshuffle the patch

## Controls

- Patch size, rotation and zoom sliders; palette and colour-mode options; click to shift the grid; Space reshuffles, R resets

## Implementation

The five line families use irrational offsets so no three lines meet. Every pair crossing is converted into its dual cell vertices, which are sorted into cyclic order and drawn as a rhombus. No tiles, textures or fonts are loaded from the network.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom pentagrid-to-rhombus Penrose tiling explorer with golden-ratio readout; no third-party assets, libraries or network services)
