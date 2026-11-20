# Image Lab

Every pixel becomes a weighted average of its neighbours. The weights are the kernel — blur, sharpen, edge-detect and emboss are all just different 3×3 grids of numbers.

## Features

- Convolution with 3×3 and 5×5 kernels over a generated test pattern (gradient, shapes, noise)
- Four kernels: blur (box), sharpen, edge (Laplacian), emboss (directional derivative)
- Strength slider blends the kernel toward identity
- Mean brightness, edge energy, variance and kernel-sum readouts; kernel grid visualisation

## Controls

Kernel-size and strength sliders, four presets (blur/sharpen/edge/emboss), original and kernel-grid toggles; keys 1–4 load presets, O toggles original, K toggles kernel

## Implementation

Each output pixel is Σ kernel·neighbourhood with edge clamping. Kernels summing to 1 (blur, sharpen) preserve flat-area brightness; kernels summing to 0 (edge, emboss) annihilate flat areas. The harness verifies the identity kernel leaves the image unchanged, blur reduces variance, the edge kernel gives 0 on a flat image, blur/sharpen kernels sum to 1, and edge/emboss kernels sum to 0.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom image-convolution lab with kernels, edge energy and a generated test pattern; no third-party assets, libraries or network services)
