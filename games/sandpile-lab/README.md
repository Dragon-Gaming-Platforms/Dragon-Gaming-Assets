# Sandpile Lab

Drop grains one at a time and watch avalanches of every size fall out of four simple rules.

## Features

- Abelian sandpile on a 190 x 120 lattice with open edges, so grains fall off the table
- Live avalanche chart plus largest-avalanche and over-100 counters showing the power-law tail
- Centre, random or edge sources; click the heap to move the drop point
- Three palettes and a glow that marks cells toppling in the current frame

## Controls

- Grains-per-frame slider, source and palette options, Drop 100, chart toggle; click the heap to move the source; Space pauses, R resets, C re-centres

## Implementation

Heights live in an Int32Array; toppling uses an explicit stack instead of recursion, and activity is drawn straight into an offscreen ImageData buffer scaled up with smoothing disabled.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom abelian sandpile simulation with self-organised criticality and avalanche-size chart; no third-party assets, libraries or network services)
