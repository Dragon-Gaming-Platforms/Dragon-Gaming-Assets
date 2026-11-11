# Epidemic Lab

A stochastic SIR outbreak on a contact lattice, with the curves and the herd-immunity threshold.

## Features

- 19,950 people on a four-neighbour contact lattice with wraparound edges
- Contact rate and infectious period jointly set R0 = beta x 4 x period, shown live
- Susceptible / infectious / immune curves with a dashed herd-immunity line
- Five scenarios from seasonal flu to measles, plus a vaccination slider applied on reset

## Controls

- Contact rate, infectious period, movement and vaccination sliders; five scenarios; Seed, Reset and pause; Space pauses, R resets, I seeds cases

## Implementation

Infections are queued per tick so a person infected this tick cannot infect anyone else until the next one. Recovery uses a geometric waiting time, and infectious people occasionally swap places with neighbours so outbreaks escape the seed cluster.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom stochastic SIR lattice epidemic simulation with live R0, herd threshold and compartment chart; no third-party assets, libraries or network services)
