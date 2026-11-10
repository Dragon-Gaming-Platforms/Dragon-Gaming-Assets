# Turing Machine Lab

A single tape, a finite state table and one head that reads, writes and moves — the simplest complete computer.

## Features

- Three worked programs: binary increment, binary complement and the 3-state busy beaver
- Editable JSON rule table with validation for every state/symbol entry
- Animated tape strip with head, write history and move arrow
- Halting detection, step budget and a decimal readout of the tape

## Controls

- Program presets or a JSON rule table; tape input and start-cell field; Run, Step and Reset; speed slider; Space runs or pauses, S steps, R resets

## Implementation

The tape is a sparse map from cell index to symbol, so it grows in both directions without pre-allocation. Each frame runs the table at the selected rate; rendering is pure Canvas 2D.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom single-tape Turing machine simulator with editable rule table and animated tape; no third-party assets, libraries or network services)
