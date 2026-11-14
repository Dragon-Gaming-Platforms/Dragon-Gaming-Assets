# Voting Lab

One voter profile, five counting rules, and four different winners: plurality, IRV, Borda, approval and Condorcet side by side.

## Features

- Plurality, instant-runoff with real transfers and elimination rounds, Borda (4-3-2-1), approval (top two) and Condorcet on the same ballots
- Full pairwise matrix with win and loss counts, highlighting the selected candidate's row
- Head-to-head cycle detection that names the three candidates in the loop when no Condorcet winner exists
- Bloc-share slider that re-normalises the other blocs, so a small change can flip a rule that looked stable
- Status line that reports how many distinct winners the same electorate produced

## Controls

Four profile presets, third-bloc share and voter-count sliders, click a first-choice bar to highlight that candidate in the matrix; keys 1–4 switch profiles

## Implementation

Ballots are bloc rankings with integer voter counts, and every rule is computed from those counts: pairwise preferences by summing blocs that rank one candidate above another, IRV by transferring eliminated candidates' ballots to their next surviving preference, and Borda by awarding n, n−1, … points. The presets are chosen so plurality, IRV, Borda and Condorcet genuinely disagree, and the cycle preset produces a real three-way Condorcet loop.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom social-choice lab with plurality, IRV, Borda, approval and Condorcet counting plus cycle detection; no third-party assets, libraries or network services)
