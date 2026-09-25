# 🛠️ G-Code CLI Analyzer

A lightweight, zero-dependency Node.js command-line interface (CLI) tool designed to extract key metrics and bounding box dimensions from G-code files.

## ✨ Features

- **Bounding Box Calculation**: Calculates total X, Y, and Z dimensions.
- **Temperature Detection**: Extracts target hotend and bed temperatures.
- **Layer & Line Statistics**: Counts total lines, layer changes, and toolhead swaps.
- **Zero External Dependencies**: Built entirely using native Node.js core modules (`fs`, `readline`, `path`).

## 🚀 Quick Start

1. **Clone repository**:
   ```bash
   git clone [https://github.com/your-username/gcode-analyzer-cli.git](https://github.com/your-username/gcode-analyzer-cli.git)
   cd gcode-analyzer-cli
