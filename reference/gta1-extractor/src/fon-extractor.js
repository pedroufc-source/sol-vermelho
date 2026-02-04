/**
 * GTA 1 Font Extractor
 * Exports fonts as PNG sprite sheets
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { PNG } from 'pngjs';

export class FONExtractor {
    constructor(parser, sourceName) {
        this.parser = parser;
        this.sourceName = sourceName || 'font';
        this.stats = parser.getStats();
        this.header = parser.header;
    }

    // Create a sprite sheet of all characters
    createSpriteSheet(outputPath) {
        console.log('Creating font sprite sheet...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const height = this.header.height || 12;
        const charWidths = this.parser.charWidths;
        const pixelData = this.parser.pixelData;

        // Calculate atlas dimensions
        // Arrange characters in rows of 16
        const charsPerRow = 16;
        const numRows = Math.ceil(this.parser.numChars / charsPerRow);

        // Calculate max width for each column
        const maxWidths = [];
        for (let col = 0; col < charsPerRow; col++) {
            let maxW = 8; // Minimum width
            for (let row = 0; row < numRows; row++) {
                const idx = row * charsPerRow + col;
                if (idx < charWidths.length) {
                    maxW = Math.max(maxW, charWidths[idx] || 8);
                }
            }
            maxWidths.push(maxW);
        }

        const atlasWidth = maxWidths.reduce((a, b) => a + b, 0) + charsPerRow; // +1 padding per char
        const atlasHeight = numRows * (height + 1); // +1 padding per row

        // Create PNG
        const png = new PNG({
            width: atlasWidth,
            height: atlasHeight,
            colorType: 6 // RGBA
        });

        // Fill with transparent
        for (let i = 0; i < png.data.length; i += 4) {
            png.data[i] = 0;     // R
            png.data[i + 1] = 0; // G
            png.data[i + 2] = 0; // B
            png.data[i + 3] = 0; // A (transparent)
        }

        // Get default palette
        const palette = this.parser.getDefaultPalette();

        // Draw each character
        let pixelOffset = 0;
        for (let charIdx = 0; charIdx < this.parser.numChars; charIdx++) {
            const charWidth = charWidths[charIdx] || 0;
            if (charWidth === 0) continue;

            const row = Math.floor(charIdx / charsPerRow);
            const col = charIdx % charsPerRow;

            // Calculate X position
            let startX = 0;
            for (let c = 0; c < col; c++) {
                startX += maxWidths[c] + 1;
            }
            const startY = row * (height + 1);

            // Draw character pixels
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < charWidth; x++) {
                    if (pixelOffset >= pixelData.length) break;

                    const paletteIdx = pixelData[pixelOffset++];
                    const color = palette[paletteIdx] || { r: 0, g: 0, b: 0, a: 0 };

                    const pngX = startX + x;
                    const pngY = startY + y;
                    const pngIdx = (pngY * atlasWidth + pngX) * 4;

                    png.data[pngIdx] = color.r;
                    png.data[pngIdx + 1] = color.g;
                    png.data[pngIdx + 2] = color.b;
                    png.data[pngIdx + 3] = color.a;
                }
            }
        }

        // Write PNG
        const pngBuffer = PNG.sync.write(png);
        writeFileSync(outputPath, pngBuffer);
        console.log(`Saved sprite sheet to ${outputPath}`);
    }

    // Create a raw visualization (linear layout)
    createRawVisualization(outputPath) {
        console.log('Creating raw visualization...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const pixelData = this.parser.pixelData;
        const width = 256; // Fixed width
        const height = Math.ceil(pixelData.length / width);

        const png = new PNG({
            width: width,
            height: height,
            colorType: 6
        });

        // Fill with transparent
        for (let i = 0; i < png.data.length; i += 4) {
            png.data[i] = 0;
            png.data[i + 1] = 0;
            png.data[i + 2] = 0;
            png.data[i + 3] = 0;
        }

        const palette = this.parser.getDefaultPalette();

        // Draw pixels
        for (let i = 0; i < pixelData.length; i++) {
            const paletteIdx = pixelData[i];
            const color = palette[paletteIdx] || { r: 0, g: 0, b: 0, a: 0 };

            const pngIdx = i * 4;
            if (pngIdx + 3 < png.data.length) {
                png.data[pngIdx] = color.r;
                png.data[pngIdx + 1] = color.g;
                png.data[pngIdx + 2] = color.b;
                png.data[pngIdx + 3] = color.a;
            }
        }

        const pngBuffer = PNG.sync.write(png);
        writeFileSync(outputPath, pngBuffer);
        console.log(`Saved raw visualization to ${outputPath}`);
    }

    // Save font metadata
    saveMetadata(outputPath) {
        console.log('Saving font metadata...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const metadata = {
            source: this.sourceName,
            header: this.header,
            stats: this.stats,
            characters: []
        };

        // Add character info
        for (let charCode = 32; charCode < 128; charCode++) {
            const info = this.parser.getCharInfo(charCode);
            if (info) {
                metadata.characters.push({
                    char: info.char === ' ' ? '(space)' : info.char,
                    charCode: info.charCode,
                    width: info.width,
                    height: info.height
                });
            }
        }

        writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
        console.log(`Saved metadata to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== Font Summary ===');
        console.log(`Source: ${this.sourceName}`);
        console.log(`Font height: ${this.stats.fontHeight} pixels`);
        console.log(`Characters: ${this.stats.numCharacters}`);
        console.log(`Non-empty characters: ${this.stats.nonEmptyChars}`);
        console.log(`Width range: ${this.stats.minWidth}-${this.stats.maxWidth} pixels`);
        console.log(`Average width: ${this.stats.averageWidth} pixels`);
        console.log(`Pixel data size: ${this.stats.pixelDataSize} bytes`);

        // Show character width preview
        console.log('\nWidth preview (first 32 chars):');
        let preview = '';
        for (let i = 0; i < Math.min(32, this.parser.charWidths.length); i++) {
            const charCode = 32 + i;
            const char = String.fromCharCode(charCode);
            const width = this.parser.charWidths[i];
            if (width > 0) {
                preview += `'${char}':${width} `;
            }
        }
        console.log(`  ${preview.trim()}`);
    }
}
