# Logic Lab

Boolean gates are the atoms of every computer. Toggle the inputs and watch the output — then stack gates into adders and a multiplier.

## Features

- Seven gates (AND, OR, XOR, NAND, NOR, XNOR) plus half and full adders
- Live gate diagram with signal levels (bright = 1, dim = 0)
- Full truth tables with the current input row highlighted
- Sum and carry readouts for the adders

## Controls

A/B/C input toggles, eight presets (AND/OR/XOR/NAND/NOR/XNOR/half adder/full adder); keys A, B, C toggle inputs, keys 1–8 load presets

## Implementation

Each gate is its defining boolean function; the half adder is sum = A⊕B, carry = A·B; the full adder is sum = A⊕B⊕C, carry = majority(A,B,C). The harness verifies all four truth-table rows for AND/OR/XOR/NAND/NOR/XNOR, the half-adder table (sum = XOR, carry = AND), the full-adder table (sum = parity, carry = majority), and that NAND and NOR are functionally complete (each can build NOT and AND/OR).

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom boolean-logic lab with gates, adders and truth tables; no third-party assets, libraries or network services)
