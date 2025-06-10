# My Firefox Extension

This is a simple Firefox extension that allows users to inject an HTML element into the current webpage and toggle its visibility.

## Features

- Injects a customizable HTML element into the webpage.
- Toggles the visibility of the injected element with a button click.
- Provides a user-friendly popup interface for interaction.

## Installation

1. Clone the repository or download the source code.
2. Open Firefox and navigate to `about:debugging`.
3. Click on "This Firefox" in the sidebar.
4. Click on "Load Temporary Add-on".
5. Select the `manifest.json` file from the extension directory.

## Usage

- Click on the extension icon in the Firefox toolbar to open the popup.
- Use the provided button to inject or remove the HTML element from the page.

## Development

- The extension consists of several key files:
  - `manifest.json`: Configuration file for the extension.
  - `background.js`: Background script for handling events.
  - `content_scripts/injector.js`: Logic for injecting and toggling the HTML element.
  - `content_scripts/styles.css`: Styles for the injected element.
  - `popup/popup.html`: Structure of the popup interface.
  - `popup/popup.js`: Logic for handling user interactions in the popup.
  - `popup/popup.css`: Styles for the popup interface.

## License

This project is licensed under the MIT License. See the LICENSE file for details.