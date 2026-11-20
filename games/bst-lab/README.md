# BST Lab

An AVL tree: a binary search tree that rebalances itself with rotations after every insert and delete, so the height stays logarithmic no matter what order you feed it.

## Features

- Full AVL implementation: insert/delete with LL/RR/LR/RL rotations, balance factors at every node
- Random, sorted and reverse insert presets — sorted order degenerates a plain BST to a linked list, but the AVL tree stays logarithmic
- Search with highlighted path and comparison count
- Height, node count, root balance factor, rotation count and inorder readouts

## Controls

Insert-count and value-range sliders, three presets (random/sorted/reverse), insert/delete/search/clear buttons, balance-factor toggle; keys 1–3 load presets, I inserts, D deletes, S searches, C clears

## Implementation

BF = height(left) − height(right); rotations restore |BF| ≤ 1 after each update. The AVL height bound is h ≤ 1.44·log₂(n+2). The harness verifies the inorder traversal is sorted after random inserts, every node satisfies |BF| ≤ 1, height respects the AVL bound, search finds all inserted keys, delete removes exactly one key, and sorted inserts keep height ≤ 6 for 30 nodes (vs 30 for a plain BST).

## License

MIT — Original build (Dragon Gaming Assets)

## Attribution

Original work — MIT (custom AVL-tree lab with rotations, balance factors and height-bound readouts; no third-party assets, libraries or network services)
