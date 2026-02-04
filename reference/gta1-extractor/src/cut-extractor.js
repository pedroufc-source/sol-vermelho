/**
 * GTA 1 Cutscene Extractor
 * Exports cutscene images as PNG
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { PNG } from 'pngjs';

export class CUTExtractor {
    constructor(parser, sourceName) {
        this.parser = parser;
        this.sourceName = sourceName || 'cutscene';
        this.stats = parser.getStats();
    }

    // Save indexed image as PNG
    saveIndexedImage(outputPath) {
        console.log('Saving indexed image...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const rgbaPixels = this.parser.getRGBAPixels();
        const width = this.parser.width;
        const height = this.parser.height;

        const png = new PNG({
            width: width,
            height: height,
            colorType: 6 // RGBA
        });

        // Copy pixel data
        for (let i = 0; i < rgbaPixels.length; i++) {
            png.data[i] = rgbaPixels[i];
        }

        const pngBuffer = PNG.sync.write(png);
        writeFileSync(outputPath, pngBuffer);
        console.log(`Saved indexed image to ${outputPath}`);
    }

    // Save RAW as RGB image if available
    saveRAWImage(outputPath) {
        if (!this.parser.rawBuffer) {
            console.log('No RAW data available');
            return false;
        }

        console.log('Saving RAW image...');

        const rgbaPixels = this.parser.getRAWAsRGB();
        if (!rgbaPixels) {
            console.log('RAW data is not in RGB format');
            return false;
        }

        mkdirSync(dirname(outputPath), { recursive: true });

        const width = this.parser.width;
        const height = this.parser.height;

        const png = new PNG({
            width: width,
            height: height,
            colorType: 6
        });

        for (let i = 0; i < rgbaPixels.length; i++) {
            png.data[i] = rgbaPixels[i];
        }

        const pngBuffer = PNG.sync.write(png);
        writeFileSync(outputPath, pngBuffer);
        console.log(`Saved RAW image to ${outputPath}`);
        return true;
    }

    // Save palette as a visual strip
    savePaletteImage(outputPath) {
        console.log('Saving palette image...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const palette = this.parser.palette;
        const cellSize = 16;
        const cols = 16;
        const rows = Math.ceil(palette.length / cols);

        const width = cols * cellSize;
        const height = rows * cellSize;

        const png = new PNG({
            width: width,
            height: height,
            colorType: 6
        });

        // Fill with black
        for (let i = 0; i < png.data.length; i += 4) {
            png.data[i] = 0;
            png.data[i + 1] = 0;
            png.data[i + 2] = 0;
            png.data[i + 3] = 255;
        }

        // Draw palette cells
        for (let i = 0; i < palette.length; i++) {
            const color = palette[i];
            const col = i % cols;
            const row = Math.floor(i / cols);

            const startX = col * cellSize;
            const startY = row * cellSize;

            // Fill cell
            for (let y = 0; y < cellSize; y++) {
                for (let x = 0; x < cellSize; x++) {
                    const pngX = startX + x;
                    const pngY = startY + y;
                    const pngIdx = (pngY * width + pngX) * 4;

                    png.data[pngIdx] = color.r;
                    png.data[pngIdx + 1] = color.g;
                    png.data[pngIdx + 2] = color.b;
                    png.data[pngIdx + 3] = 255;
                }
            }
        }

        const pngBuffer = PNG.sync.write(png);
        writeFileSync(outputPath, pngBuffer);
        console.log(`Saved palette to ${outputPath}`);
    }

    // Save metadata
    saveMetadata(outputPath) {
        console.log('Saving metadata...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const metadata = {
            source: this.sourceName,
            stats: this.stats,
            palette: this.parser.getPaletteHex()
        };

        writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
        console.log(`Saved metadata to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== Cutscene Summary ===');
        console.log(`Source: ${this.sourceName}`);
        console.log(`Dimensions: ${this.stats.width}x${this.stats.height}`);
        console.log(`Total pixels: ${this.stats.totalPixels}`);
        console.log(`Palette colors: ${this.stats.paletteSize}`);
        console.log(`Unique colors used: ${this.stats.uniqueColorsUsed}`);
        console.log(`Most common color index: ${this.stats.mostUsedColor}`);
        console.log(`Has RAW data: ${this.stats.hasRAW}`);
        if (this.stats.hasRAW) {
            console.log(`RAW size: ${this.stats.rawSize} bytes`);
        }
    }
}
