/*
Image Processing Script for Node.js
Author: @sahillangoo
Functions:
- Recursively scan a directory for images
- Process each image and save it to the output directory
- Resize the image to a specified width and height
- Convert the image to a specified format
- Compress the image to a specified quality
- Overwrite existing files or skip them
- Display the space saved
Usage:
- Place the script in the directory containing the images
- Run the script using Node.js
- The processed images will be saved in the output directory
*/

// Import required modules
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Define input and output directories
const inputDir = path.resolve(process.cwd(), 'input');
const outputDir = path.resolve(process.cwd(), 'output');

// Define image processing options
const outputFormat = 'webp'; // can be 'png', 'jpg', 'webp', 'avif'
const resizeWidth = null; // resize width, null or number= 1920
const resizeHeight = null; // resize height, null or number = 1080
const compressionQuality = 90; // compression quality, 0-100
const overwrite = true; // overwrite option, true or false

// Additional options for webp and avif
const webpOptions = {
	lossless: false,
	nearLossless: false,
	effort: 6, // 0 (fastest) to 6 (slowest)
};

const avifOptions = {
	lossless: true,
	effort: 4, // 0 (fastest) to 9 (slowest)
};

// Function to convert bytes to KB or MB
const formatBytes = (bytes) => {
	if (bytes >= 1048576) {
		return (bytes / 1048576).toFixed(2) + ' MB';
	} else {
		return (bytes / 1024).toFixed(2) + ' KB';
	}
};

// Function to process an image
const processImage = async (file) => {
	const inputPath = path.join(inputDir, path.basename(file));
	const outputPath = path.join(
		outputDir,
		`${path.parse(path.basename(file)).name}.${outputFormat}`
	);

	try {
		// Check if the output file already exists
		await checkOutputFile(outputPath);

		// Get the initial size of the image
		const initialSize = await getFileSize(inputPath);

		// Process the image
		await processImageFile(inputPath, outputPath);

		// Get the final size of the image
		const finalSize = await getFileSize(outputPath);

		console.log(
			chalk.green(`Image processed: ${path.basename(outputPath)}`)
		);
		console.log(
			`Compressed from: ${formatBytes(initialSize)} ==> ${formatBytes(
				finalSize
			)} 🔥`
		);

		// Return the difference in size
		return initialSize - finalSize;
	} catch (err) {
		console.error(chalk.red(`Error processing image: ${err.message}`));
		return 0;
	}
};

const checkOutputFile = async (outputPath) => {
	try {
		await fs.access(outputPath);
		if (!overwrite) {
			console.log(
				chalk.yellow(
					`Image already exists, skipping: ${path.basename(
						outputPath
					)}`
				)
			);
			return 0;
		}
	} catch {
		// File does not exist, continue processing
	}
};

const getFileSize = async (filePath) => {
	return (await fs.stat(filePath)).size;
};

const processImageFile = async (inputPath, outputPath) => {
	try {
		let image = sharp(inputPath);

		// Resize the image if resizeWidth or resizeHeight is set
		if (resizeWidth || resizeHeight) {
			image = image.resize(resizeWidth, resizeHeight, {
				fit: 'inside', // This will resize the image to fit inside the specified dimensions
				position: 'center', // This will position the image at the center
			});
		}

		image = applyImageFormat(image);

		await image.toFile(outputPath);
	} catch (err) {
		console.error(chalk.red(`Error processing image: ${err.message}`));
		return 0;
	}
};

const applyImageFormat = (image) => {
	switch (outputFormat) {
		case 'png':
			return image.png({ quality: compressionQuality });
		case 'jpg':
			return image.jpeg({ quality: compressionQuality });
		case 'webp':
			return image.webp({
				quality: compressionQuality,
				lossless: webpOptions.lossless,
				nearLossless: webpOptions.nearLossless,
				effort: webpOptions.effort,
			});
		case 'avif':
			return image.avif({
				quality: compressionQuality,
				lossless: avifOptions.lossless,
				effort: avifOptions.effort,
			});
		default:
			return image;
	}
};

// Function to recursively scan a directory
const scanDirectory = async (dir) => {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? scanDirectory(res) : res;
		})
	);
	return files.flat();
};

// Function to process all images
const processImages = async () => {
	console.time('Image processing time');

	try {
		const files = await scanDirectory(inputDir);
		const fileCount = files.length;

		// Inform the user about the number of files found
		console.log(
			chalk.blue(`Found ${fileCount} files in the input directory.`)
		);

		// If more than 50 files, inform the user that it may take some time
		if (fileCount > 50) {
			console.log(
				chalk.yellow(
					'Processing more than 50 files, this may take some time...'
				)
			);
		}

		// Process each file concurrently and sum up the space saved
		const spaceSaved = (await Promise.allSettled(files.map(processImage)))
			.filter((result) => result.status === 'fulfilled')
			.reduce((a, b) => a + b.value, 0);

		console.log(chalk.green(`Job done! ${fileCount} files compressed.`));
		console.log(chalk.green(`Hooray! ${formatBytes(spaceSaved)} saved.`));
		console.timeEnd('Image processing time');
	} catch (err) {
		console.error(chalk.red(`Error reading directory: ${err.message}`));
	}
};

// Start processing images
processImages();
