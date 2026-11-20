# Recursion Lab

Three classic recursions, made visible: the Tower of Hanoi, the Fibonacci call tree, and factorial. Each one solves a big problem by calling itself on smaller ones.

## Features

- Tower of Hanoi with the optimal 2ⁿ − 1 move sequence, steppable
- Fibonacci call tree showing the exponential blowup of naive recursion
- Factorial call chain from n down to the base case
- Call count, max depth, move count and optimal-count readouts

## Controls

Disk-count and Fibonacci-n sliders, three presets (Hanoi/Fibonacci/Factorial), step/run/reset buttons; keys 1–3 switch demos, Space steps, G runs, R resets

## Implementation

Hanoi: T(n) = 2T(n−1) + 1, so T(n) = 2ⁿ − 1 moves, and the recursion proves optimality. Naive fib(n) makes 2·fib(n+1) − 1 calls (memoisation would need only n+1). Factorial is linear: n+1 calls, depth n+1. The harness verifies hanoiMoves(3) = 7 and hanoiMoves(8) = 255, that the generated solution is legal (never larger-on-smaller) and complete, fib(10) = 55, fibCallCount(10) = 177, factorial(5) = 120, and that the call-tree count matches fibCallCount.

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom recursion lab with Hanoi, Fibonacci call tree and factorial chain; no third-party assets, libraries or network services)
