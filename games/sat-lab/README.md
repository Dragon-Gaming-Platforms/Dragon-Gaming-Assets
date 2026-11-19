# Sat Lab

A Keplerian orbit simulator: change the semi-major axis, eccentricity and inclination and watch the period, the apoapsis/periapsis velocities and the ground track respond.

## Features

- Keplerian orbits solved from Kepler's equation (Newton iterations on the eccentric anomaly) with true-anomaly conversion
- Vis-viva velocities at periapsis and apoapsis, plus live altitude/velocity/latitude readouts
- Ground-track map (longitude vs latitude) that subtracts Earth's rotation from the inertial longitude
- Five presets: LEO, ISS, GEO, Molniya and GTO, with eccentricity clamped so periapsis never dips inside Earth
- Satellite trail and apoapsis/periapsis markers on the orbit view

## Controls

Semi-major axis, eccentricity, inclination and time-scale sliders, five orbit presets (LEO, ISS, GEO, Molniya, GTO), play/pause and ground-track toggles; keys 1–5 load presets, Space pauses, T toggles the track

## Implementation

The period comes from Kepler's third law T = 2π√(a³/μ) with μ = 398600 km³/s². Position uses M = E − e·sinE solved by Newton iteration, r = a(1 − e·cosE), and v = √(μ(2/r − 1/a)). The ground track uses lat = asin(sin i · sin ν) and lon = atan2(cos i · sin ν, cos ν) − ω⊕t. The harness verifies the ISS preset period (~92.8 min), GEO period (1436 min), Molniya apoapsis (~39,700 km) and that a circular orbit reports equal periapsis/apoapsis velocities.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom satellite orbit lab with Kepler solver, vis-viva velocities and ground-track projection; no third-party assets, libraries or network services)
