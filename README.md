# ConfQL Map

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A client-side web application to instantly visualize your YAML & JSON configuration files as an interactive, explorable mind map.

ConfQL Map helps you untangle complex configuration files by transforming them into a beautiful and intuitive graph, making it easy to understand relationships, hierarchies, and the overall structure of your data.

![ConfQL Map in action](https://i.imgur.com/example.gif)
*(Note: You can replace the image link above with a real screenshot or GIF of the application.)*

---

## Features

*   **Interactive Mind Map:** Pan, zoom, expand, and collapse nodes to explore your configuration files with ease.
*   **YAML & JSON Support:** Simply upload your `.yml`, `.yaml`, or `.json` files to get started.
*   **Multiple Layouts:** Switch between **Horizontal**, **Vertical**, and **Radial** layouts to find the best view for your data.
*   **Focus Mode:** Right-click on any node and select "Focus" to collapse all other branches and drill down into a specific part of the tree.
*   **Node Search:** Instantly find any node with the search bar. Matching nodes will be highlighted with a crimson border.
*   **Automatic Clustering:** For large files, parent nodes with many children are automatically grouped into expandable clusters to keep the view clean and performant.
*   **Export to PNG:** Save a snapshot of your current mind map view as a high-resolution PNG image.
*   **Fully Client-Side:** Your files are processed directly in the browser. Nothing is ever uploaded to a server, ensuring your data remains private.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your_username/confcrack.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd confcrack/confcrack-app
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Usage

To start the development server, run:

```sh
npm run dev
```

This will open the application in your default browser, typically at `http://localhost:5173`.

To create a production-ready build, run:

```sh
npm run build
```

The optimized files will be located in the `dist/` directory.

## Technology Stack

*   **Vite:** A blazing-fast frontend build tool.
*   **TypeScript:** For robust, type-safe code.
*   **Apache ECharts:** A powerful and highly configurable charting and visualization library.
*   **js-yaml:** A JavaScript YAML parser.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
