# Error Correction Lab

An extended Hamming(8,4) code you can corrupt by hand, with a real decoder and exact vs simulated failure statistics.

## Features

- Extended Hamming(8,4): four data bits, three Hamming parity bits and one overall parity bit, minimum distance 4
- A real decoder that reads the syndrome and the overall parity to distinguish a correctable single error from an uncorrectable double error
- Clickable bit strips for data, parity and transmitted bits, with the error position highlighted
- Exact enumeration of all 256 error patterns against a 20,000-block Monte Carlo pass, drawn as bars with simulated dots
- Silent-failure curve as a function of the channel error rate, showing the cost of an undetected triple error

## Controls

Channel error-rate slider, flip/random-data buttons, clean/noisy/bad presets, clickable data and transmitted bits; Space flips a bit, R redraws data, C repairs

## Implementation

The decoder computes the three check bits independently and reads them as a position, exactly as the textbook does; the overall parity bit turns the ambiguous two-error case into a clean rejection. The bar chart enumerates every error mask, weights it by p^k(1-p)^(8-k), and classifies the outcome by round-tripping the decoded data, so a silent failure is counted only when the data really came back wrong. The Monte Carlo pass runs the same decoder over simulated blocks.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom extended Hamming(8,4) coding lab with syndrome decoding and exact vs simulated failure statistics; no third-party assets, libraries or network services)
