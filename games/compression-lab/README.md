# Compression Lab

Run-length, Huffman and LZ78 applied to the same text, counted in exact bits including headers, against Shannon's entropy floor.

## Features

- Measured bitstreams: 8-bit raw, run-length with Elias-gamma counts, canonical Huffman payload plus its 12-bits-per-symbol header, and full LZ78 token cost
- Entropy floor drawn on the bar chart, so every coder is judged against the best a context-free code could do
- Huffman tree rendered with elbow edges, dot size by frequency, and a complete code table
- LZ78 token chips showing the dictionary index, the literal and the bits each token costs
- Presets for English prose, short repeats, DNA and uniform noise, plus repeat/corruption sliders that rebuild the text deterministically

## Controls

Editable text box, four corpus presets, repeat and corruption sliders; keys 1–4 load the corpora

## Implementation

Each coder emits into a counter rather than a buffer: run-length pays 8 bits per literal plus an Elias-gamma length, Huffman sums symbol frequency times code length and adds the table header it would need to transmit, and LZ78 charges ceil(log2(dictionary size + 1)) bits for each index plus 8 for the literal. The entropy floor is the first-order entropy of the same text, so the gap between the bars is the redundancy a context model would still have to find.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom compression lab with run-length, Huffman and LZ78 bit accounting plus an entropy floor; no third-party assets, libraries or network services)
