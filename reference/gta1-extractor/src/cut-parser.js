/**
 * GTA 1 Cutscene Parser
 *
 * Cutscene files consist of three components:
 * - .ACT: Color palette (256 RGB triplets = 768 bytes)
 * - .RAT: Indexed image data (640x480 = 307,200 bytes)
 * - .RAW: Additional image data (possibly RGB or multiple frames)
 *
 * Screen dimensions: 640x480
 */

export class CUTParser {
    constructor(actBuffer, ratBuffer, rawBuffer = null) {
        this.actBuffer = actBuffer;
        this.ratBuffer = ratBuffer;
        this.rawBuffer = rawBuffer;

        this.palette = [];
        this.width = 640;
        this.height = 480;
    }

    parse() {
        console.log('Parsing cutscene files...');
        console.log(`ACT (palette) size: ${this.actBuffer.length} bytes`);
        console.log(`RAT (indexed) size: ${this.ratBuffer.length} bytes`);
        if (this.rawBuffer) {
            console.log(`RAW (additional) size: ${this.rawBuffer.length} bytes`);
        }

        // Parse palette from ACT file
        this.parsePalette();

        // Detect dimensions based on RAT size
        this.detectDimensions();

        console.log(`Image dimensions: ${this.width}x${this.height}`);
        console.log(`Palette: ${this.palette.length} colors`);

        return {
            width: this.width,
            height: this.height,
            paletteSize: this.palette.length
        };
    }

    detectDimensions() {
        const size = this.ratBuffer.length;

        // Known GTA 1 image sizes
        const knownSizes = [
            { w: 640, h: 480, size: 307200 },  // Cutscenes
            { w: 448, h: 240, size: 107520 },  // Logos
            { w: 320, h: 200, size: 64000 },   // Small screens
            { w: 320, h: 240, size: 76800 },   // Menu screens
            { w: 640, h: 200, size: 128000 },  // Wide banners
            { w: 256, h: 256, size: 65536 },   // Square textures
        ];

        // Check known sizes first
        for (const known of knownSizes) {
            if (size === known.size) {
                this.width = known.w;
                this.height = known.h;
                console.log(`Detected known size: ${this.width}x${this.height}`);
                return;
            }
        }

        // Try to find common aspect ratios
        const aspectRatios = [
            { ratio: 4/3, name: '4:3' },    // 640x480, 320x240
            { ratio: 16/9, name: '16:9' },  // Widescreen
            { ratio: 1.866, name: 'logo' }, // 448x240
            { ratio: 1, name: '1:1' },      // Square
            { ratio: 8/5, name: '8:5' },    // 320x200
        ];

        for (const ar of aspectRatios) {
            // height = sqrt(size / ratio)
            const h = Math.sqrt(size / ar.ratio);
            if (Number.isInteger(h) || Math.abs(h - Math.round(h)) < 0.001) {
                const height = Math.round(h);
                const width = Math.round(size / height);
                if (width * height === size) {
                    this.width = width;
                    this.height = height;
                    console.log(`Detected dimensions from ${ar.name} ratio: ${this.width}x${this.height}`);
                    return;
                }
            }
        }

        // Try common widths
        const commonWidths = [640, 480, 448, 400, 320, 256, 200, 160, 128, 64];
        for (const w of commonWidths) {
            if (size % w === 0) {
                const h = size / w;
                if (h > 0 && h <= 1024) {
                    this.width = w;
                    this.height = h;
                    console.log(`Detected dimensions from common width: ${this.width}x${this.height}`);
                    return;
                }
            }
        }

        // Fallback: keep default or use square
        const sqrt = Math.sqrt(size);
        if (Number.isInteger(sqrt)) {
            this.width = sqrt;
            this.height = sqrt;
            console.log(`Detected square image: ${this.width}x${this.height}`);
        } else {
            console.warn(`Could not detect dimensions for ${size} bytes, using default ${this.width}x${this.height}`);
        }
    }

    parsePalette() {
        // ACT file is 256 RGB triplets
        const expectedSize = 256 * 3;
        if (this.actBuffer.length !== expectedSize) {
            console.warn(`ACT size mismatch: expected ${expectedSize}, got ${this.actBuffer.length}`);
        }

        const numColors = Math.floor(this.actBuffer.length / 3);
        for (let i = 0; i < numColors; i++) {
            this.palette.push({
                r: this.actBuffer[i * 3],
                g: this.actBuffer[i * 3 + 1],
                b: this.actBuffer[i * 3 + 2]
            });
        }
    }

    // Get indexed image pixels as array of palette indices
    getIndexedPixels() {
        return Array.from(this.ratBuffer);
    }

    // Get RGBA pixels using palette
    getRGBAPixels() {
        const pixels = new Uint8Array(this.width * this.height * 4);

        for (let i = 0; i < this.ratBuffer.length; i++) {
            const paletteIdx = this.ratBuffer[i];
            const color = this.palette[paletteIdx] || { r: 0, g: 0, b: 0 };

            const pngIdx = i * 4;
            pixels[pngIdx] = color.r;
            pixels[pngIdx + 1] = color.g;
            pixels[pngIdx + 2] = color.b;
            pixels[pngIdx + 3] = 255; // Opaque
        }

        return pixels;
    }

    // Get RAW data as RGB (if available)
    getRAWAsRGB() {
        if (!this.rawBuffer) return null;

        // RAW is 921,600 bytes = 640 * 480 * 3 (RGB)
        const expectedSize = this.width * this.height * 3;
        if (this.rawBuffer.length !== expectedSize) {
            console.warn(`RAW size doesn't match RGB format`);
            return null;
        }

        const pixels = new Uint8Array(this.width * this.height * 4);

        for (let i = 0; i < this.width * this.height; i++) {
            const rgbIdx = i * 3;
            const rgbaIdx = i * 4;

            pixels[rgbaIdx] = this.rawBuffer[rgbIdx];         // R
            pixels[rgbaIdx + 1] = this.rawBuffer[rgbIdx + 1]; // G
            pixels[rgbaIdx + 2] = this.rawBuffer[rgbIdx + 2]; // B
            pixels[rgbaIdx + 3] = 255;                        // A
        }

        return pixels;
    }

    // Get statistics
    getStats() {
        // Count unique colors used
        const usedColors = new Set();
        for (const idx of this.ratBuffer) {
            usedColors.add(idx);
        }

        // Find color distribution
        const colorCounts = new Array(256).fill(0);
        for (const idx of this.ratBuffer) {
            colorCounts[idx]++;
        }

        const nonZeroColors = colorCounts.filter(c => c > 0).length;

        return {
            width: this.width,
            height: this.height,
            totalPixels: this.width * this.height,
            paletteSize: this.palette.length,
            uniqueColorsUsed: usedColors.size,
            mostUsedColor: colorCounts.indexOf(Math.max(...colorCounts)),
            hasRAW: !!this.rawBuffer,
            rawSize: this.rawBuffer ? this.rawBuffer.length : 0
        };
    }

    // Get palette as array of hex colors
    getPaletteHex() {
        return this.palette.map(c =>
            '#' + [c.r, c.g, c.b].map(x => x.toString(16).padStart(2, '0')).join('')
        );
    }
}
