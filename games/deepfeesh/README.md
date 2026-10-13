# 🐠 DeepFeesh - Interactive Pathfinding Game

Welcome to **Deepsea Fishing**! This is a vanilla JavaScript web game that combines classic maze mechanics with pathfinding algorithms. Drop your lure into the randomly generated depths and navigate to the target fish, or watch the computer solve it automatically!

## 🚀 Features
* **Randomized Procedural Generation**: Generates a new 25x25 underwater maze on every "New Drop" using an Iterative Depth-First Search algorithm (preventing browser call stack limits).
* **Auto-Solve Algorithm**: Built-in Breadth-First Search (BFS) pathfinding. Click "Auto-Jig" and watch the lure find the shortest possible route to the fish!
* **Smooth Rendering**: Uses Linear Interpolation (LERP) for fluid visual movement on the HTML5 Canvas.
* **Dynamic Trails**: A glowing visual trail follows the player, automatically fading/deleting after 50 steps to keep the screen clean.
* **100% Native Graphics**: No external image files needed! All fish and lures are drawn via raw SVG strings processed directly in JavaScript.

## 🛠️ Tech Stack
* **HTML5** (Structure & Canvas)
* **CSS3** (Styling, Flexbox, UI Overlay)
* **JavaScript (ES6+)** (Game Loop, Pathfinding Logic, Canvas API)

## 🎮 How to Play
1. Open `index.html` in your web browser.
2. Use **Arrow Keys** or **W A S D** to move your lure through the deep sea.
3. Reach the fish to catch it! A success screen will display your catch, weight, and time.
4. *Alternatively:* Click the **Auto-Jig** button to let the algorithm find the fish for you.

## 📂 Project Structure
```text
├── index.html   # Main layout and UI elements
├── style.css    # Styling, colors, and layout rules
├── script.js    # Canvas rendering, BFS/DFS algorithms, and game loop
└── README.md    # Project documentation
```

Author : Rene Krmac
