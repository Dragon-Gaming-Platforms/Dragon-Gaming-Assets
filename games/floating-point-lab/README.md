# Floating Point Lab

IEEE-754 bit patterns, unit-in-the-last-place, catastrophic cancellation and a million additions of 0.1, all measured rather than illustrated.

## Features

- Live float32 and float64 bit strips with sign, exponent and mantissa colour-coded
- Neighbour ruler showing the four representable neighbours of the current value and the exact gap at each precision
- Naive, Kahan and float32 summation plotted against the true value for up to a million additions, with the current term count marked
- Cancellation curve for sqrt(x²+1) − x from x = 100 to x = 1e9, where the answer dissolves into rounding noise
- Status line that names the precision loss in digits rather than vague terms

## Controls

Value slider with 0.1, 1/3, π and 1e16 presets, terms slider from 1k to 1M, cancellation exponent slider; keys 1–4 load the value presets

## Implementation

Bit strings come straight out of a DataView, and the neighbour ruler walks the representation one integer step at a time, so the gaps are the machine's own. The summation chart compares three real accumulators over one pass to the term limit, and the cancellation curve is computed from the naive expression against the algebraically equal 1/(sqrt(x²+1)+x), which is stable.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom floating-point lab with IEEE-754 bit inspection, ULP exploration, summation-error curves and catastrophic cancellation; no third-party assets, libraries or network services)
