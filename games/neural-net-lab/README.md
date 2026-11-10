# Neural Net Lab

A two-layer network learns where to draw the boundary between two colours of dots, and you can watch it think.

## Features

- Four datasets: circle-in-ring, two moons, XOR quadrants and twin spirals
- Hand-written forward pass and backpropagation for a 2-h-32-h-1 network, no libraries
- Decision field sampled every few epochs and shaded under the training points
- Training-loss chart plus live loss, accuracy and parameter count

## Controls

- Dataset, hidden units, learning rate, label noise and activation options; Run, Epoch and New run; Space runs or pauses, S trains one epoch, R restarts

## Implementation

Weights are Float64Arrays with full-batch gradient descent on binary cross-entropy. tanh, ReLU and sine activations are selectable; changing width, dataset or activation rebuilds the network from fresh random weights.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom two-hidden-layer perceptron with hand-written backpropagation and live decision-boundary rendering; no third-party assets, libraries or network services)
