# Scheduling Lab

Five dispatch rules over identical machines with live Gantt charts, tardiness accounting and a makespan lower bound.

## Features

- FIFO, SPT, LPT, EDD and least-slack dispatch over 1–4 identical machines using the same list-scheduling assignment
- Live Gantt chart with per-job due dates, red outlines for tardy jobs and a lower-bound marker on the time axis
- Readouts for makespan, total flow, total tardiness, late count and maximum lateness, plus a comparison panel for all five rules
- Presets for balanced, tight and single-machine cases, where SPT and EDD become provably optimal
- Click any job block or chip to inspect when that job runs and whether it is late

## Controls

Job count, machines, processing spread and deadline slack sliders, four preset profiles, reshuffle and next-rule buttons, clickable Gantt blocks and job chips; Space cycles the rule, R reshuffles, 1–5 pick a rule

## Implementation

Every rule only reorders the jobs; the machine assignment is the same earliest-free-machine pass for all of them, so the comparison is fair. The lower bound is max(longest job, total work / machines). With one machine the harness verifies that SPT attains the minimum total flow and EDD attains the minimum maximum lateness computed across the other rules.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom scheduling lab with five dispatch rules, identical parallel machines, Gantt output and tardiness accounting; no third-party assets, libraries or network services)
