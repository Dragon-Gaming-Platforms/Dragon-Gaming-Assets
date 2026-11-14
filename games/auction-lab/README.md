# Auction Lab

First-price, second-price and English auctions on the same private values, with revenue measured over thousands of draws against revenue equivalence.

## Features

- First-price equilibrium bidding b(v) = v(n−1)/n with a shading slider that can move bids off equilibrium
- Second-price and English-clock auctions on the same value draws, where bidding your value is weakly dominant
- Per-auction panel showing winner, value, winning bid, price, surplus and seller revenue
- Mean revenue over 2,000 simulated auctions for all three formats, drawn against the analytic expectation
- Revenue-vs-bidders curves for each format with a theory line, and a reserve price that can pass lots in

## Controls

Bidder count, bid-shading and reserve-price sliders, three formats, new-values and run-2,000 buttons, draggable value bars; Space redraws, R reruns, 1–3 switch format

## Implementation

Values are drawn uniformly on 0–100 from a seeded generator, and all three formats consume the same draws so the comparison is paired. The analytic benchmark is E[second-highest value] = 100(n−1)/(n+1). The harness checks that first-price and second-price means agree within sampling noise, that shading at 50% roughly halves first-price revenue while leaving second-price untouched, and that a high reserve raises pass-in rates.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom auction lab comparing first-price, second-price and English formats with revenue-equivalence measurement; no third-party assets, libraries or network services)
