/**
 * GTA 1 Font File Parser (.FON)
 *
 * FON files contain bitmap fonts with:
 * - Header with font metrics
 * - Palette-indexed pixel data for each character
 *
 * Based on reverse engineering of GTA 1 font files.
 * Format appears to be:
 *   - Byte 0: 'v' marker (0x76)
 *   - Byte 1: Font height
 *   - Bytes 2-3: Unknown/padding
 *   - Bytes 4+: Character width table (96 entries for ASCII 32-127)
 *   - Rest: Pixel data (palette indices)
 */

export class FONParser {
    constructor(buffer) {
        this.buffer = buffer;
        this.header = {};
        this.charWidths = [];
        this.pixelData = null;
        this.numChars = 96; // ASCII 32 (space) to 127 (DEL)
    }

    parse() {
        console.log('Parsing FON file...');
        console.log(`File size: ${this.buffer.length} bytes`);

        const view = new DataView(
            this.buffer.buffer,
            this.buffer.byteOffset,
            this.buffer.byteLength
        );

        // Parse header
        // Byte 0 is usually 'v' (0x76)
        const marker = this.buffer[0];
        const height = this.buffer[1];
        const unknown1 = view.getUint16(2, true);

        this.header = {
            marker: marker === 0x76 ? 'v' : `0x${marker.toString(16)}`,
            height: height,
            unknown1: unknown1
        };

        console.log(`Font height: ${height} pixels`);

        // Try to detect font format based on file structure
        // Some fonts have different header sizes

        // Calculate expected character data start
        // Standard format: 4 byte header + 96 byte width table = 100 bytes
        let widthTableStart = 4;
        let widthTableSize = this.numChars;

        // Check if width table looks valid (values should be small, 0-32 typically)
        let validWidths = true;
        for (let i = 0; i < Math.min(10, this.numChars); i++) {
            const w = this.buffer[widthTableStart + i];
            if (w > 64) {
                validWidths = false;
                break;
            }
        }

        // If widths look invalid, try different offset
        if (!validWidths) {
            // Some files might have 2-byte widths or different header
            widthTableStart = 4;
            widthTableSize = 0; // Skip width table, use fixed width

            // Calculate fixed width from file size
            const pixelDataSize = this.buffer.length - widthTableStart;
            const totalCharsEstimate = 96;
            const charDataSize = Math.floor(pixelDataSize / totalCharsEstimate);
            const fixedWidth = Math.floor(charDataSize / height);

            console.log(`Using fixed width: ${fixedWidth} (estimated)`);

            for (let i = 0; i < this.numChars; i++) {
                this.charWidths.push(fixedWidth);
            }

            this.header.fixedWidth = fixedWidth;
            this.header.charDataSize = charDataSize;
        } else {
            // Read character widths
            for (let i = 0; i < this.numChars; i++) {
                this.charWidths.push(this.buffer[widthTableStart + i]);
            }
        }

        // Calculate pixel data start
        const pixelDataStart = widthTableStart + (validWidths ? widthTableSize : 0);

        // Store pixel data
        this.pixelData = this.buffer.slice(pixelDataStart);

        // Calculate total width (sum of all character widths)
        const totalWidth = this.charWidths.reduce((a, b) => a + b, 0);

        this.header.totalWidth = totalWidth;
        this.header.pixelDataSize = this.pixelData.length;
        this.header.expectedPixels = totalWidth * height;

        console.log(`Parsed ${this.numChars} characters`);
        console.log(`Total width: ${totalWidth}px, Height: ${height}px`);
        console.log(`Pixel data: ${this.pixelData.length} bytes`);

        return {
            header: this.header,
            charWidths: this.charWidths,
            numChars: this.numChars,
            firstChar: 32, // ASCII space
            lastChar: 127  // ASCII DEL
        };
    }

    // Get character info
    getCharInfo(charCode) {
        if (charCode < 32 || charCode > 127) return null;

        const index = charCode - 32;
        const width = this.charWidths[index];

        // Calculate offset in pixel data
        let offset = 0;
        for (let i = 0; i < index; i++) {
            offset += this.charWidths[i] * this.header.height;
        }

        return {
            char: String.fromCharCode(charCode),
            charCode,
            index,
            width,
            height: this.header.height,
            offset
        };
    }

    // Get pixel data for a character (returns palette indices)
    getCharPixels(charCode) {
        const info = this.getCharInfo(charCode);
        if (!info || !this.pixelData) return null;

        const size = info.width * info.height;
        if (info.offset + size > this.pixelData.length) return null;

        return this.pixelData.slice(info.offset, info.offset + size);
    }

    // Get statistics
    getStats() {
        const widths = this.charWidths.filter(w => w > 0);

        return {
            fileSize: this.buffer.length,
            fontHeight: this.header.height,
            numCharacters: this.numChars,
            totalWidth: this.header.totalWidth,
            averageWidth: widths.length > 0 ? Math.round(widths.reduce((a, b) => a + b, 0) / widths.length) : 0,
            minWidth: Math.min(...widths.filter(w => w > 0)),
            maxWidth: Math.max(...widths),
            nonEmptyChars: widths.length,
            pixelDataSize: this.header.pixelDataSize
        };
    }

    // Generate a grayscale palette (for visualization)
    getDefaultPalette() {
        const palette = [];
        for (let i = 0; i < 256; i++) {
            // Use different shades of gray/colors for visualization
            // 0 = transparent, others = shades
            if (i === 0) {
                palette.push({ r: 0, g: 0, b: 0, a: 0 }); // Transparent
            } else if (i < 0x60) {
                palette.push({ r: 0, g: 0, b: 0, a: 255 }); // Black (background)
            } else if (i < 0x68) {
                palette.push({ r: 64, g: 64, b: 64, a: 255 }); // Dark gray
            } else if (i < 0x70) {
                palette.push({ r: 128, g: 128, b: 128, a: 255 }); // Gray
            } else {
                palette.push({ r: 255, g: 255, b: 255, a: 255 }); // White (text)
            }
        }
        return palette;
    }
}
