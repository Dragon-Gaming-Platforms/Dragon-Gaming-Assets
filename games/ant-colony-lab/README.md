# Ant Colony Lab

Hundreds of foragers with no map and no leader build a pheromone highway between nest and food.

## Features

- Two-state foragers that search by scent gradient and return by dead reckoning
- Pheromone field with adjustable deposit strength and per-frame evaporation
- Click anywhere to move the food and watch the colony rebuild its route
- Live delivery count, carrying count, trail coverage and best trip time

## Controls

- Forager count, deposit strength and evaporation sliders; presets; click the field to move the food; Space runs or pauses, S scatters, C clears trails

## Implementation

The trail lives in a Float32Array sampled at a quarter of the canvas resolution and rendered through an offscreen ImageData buffer. Ant steering compares five look-ahead sensors against the trail plus a distance-based food scent; everything is original, dependency-free JavaScript.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom pheromone-trail ant colony simulation with click-to-move food and live evaporation; no third-party assets, libraries or network services)
