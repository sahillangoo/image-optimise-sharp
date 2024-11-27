# Basic Image Compressor

A basic image compressor using [sharp](https://sharp.pixelplumbing.com/).

## Prerequisites

- Node.js (LTS version recommended)

## Installation

### Windows

1. Install Node.js:
   ```sh
   winget install "OpenJS.NodeJS.LTS"
   ```

2. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Place images in the `input` directory.

2. Run the compression script:
   ```sh
   npm run compress
   ```

3. Check the `output` folder for the processed images.

## Configuration

You can configure the script by modifying the following options in [`index.mjs`](index.mjs):

- `outputFormat`: The format to convert images to (e.g., 'png', 'jpg', 'webp', 'avif').
- `resizeWidth` and `resizeHeight`: The dimensions to resize images to.
- `compressionQuality`: The quality of the compression (0-100).
- `overwrite`: Whether to overwrite existing files in the output directory.

Additional options for `webp` and `avif` formats can also be configured in [`index.mjs`](index.mjs).

## License

This project is licensed under the ISC License.
