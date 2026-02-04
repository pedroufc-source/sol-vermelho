/**
 * Sprite Extractor
 * Exports GTA 1 sprites as PNG images
 */

import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { SPRITE_TYPES } from './g24-parser.js';

export class SpriteExtractor {
    constructor(parsedData) {
        this.sprites = parsedData.sprites;
        this.spriteNumbers = parsedData.spriteNumbers;
        this.spriteOffsets = parsedData.spriteOffsets;
        this.clutPages = parsedData.clutPages;
        this.palette = parsedData.palette;
        this.header = parsedData.header;
        this.spriteGraphics = parsedData.spriteGraphics;
        this.gameObjects = parsedData.gameObjects || [];
    }

    // Get color from CLUT
    getColor(colorIndex, clutId) {
        const clutPage = Math.floor(clutId / 64);
        const clutIndex = clutId % 64;

        if (this.clutPages[clutPage] && this.clutPages[clutPage][clutIndex]) {
            const [b, g, r, a] = this.clutPages[clutPage][clutIndex][colorIndex];
            // Color index 0 is transparent
            return { r, g, b, a: colorIndex === 0 ? 0 : 255 };
        }

        return { r: 255, g: 0, b: 255, a: 255 }; // Magenta for missing
    }

    // Create sprite atlas PNG (all sprites in one image)
    createSpriteAtlas(outputPath) {
        console.log('Creating sprite atlas...');

        if (!this.spriteGraphics || this.spriteGraphics.length === 0) {
            console.log('Warning: No sprite graphics data available');
            return null;
        }

        // Calculate atlas dimensions
        // Sprite graphics are stored as 256 pixels wide
        const atlasWidth = 256;
        const atlasHeight = Math.ceil(this.spriteGraphics.length / 256);

        const png = new PNG({ width: atlasWidth, height: atlasHeight });

        // Build sprite CLUT mapping
        const spriteClut = this.buildSpriteClutMap();

        // Render sprite graphics using CLUT
        for (let i = 0; i < this.spriteGraphics.length; i++) {
            const colorIndex = this.spriteGraphics[i];
            const clutId = spriteClut[i];

            if (clutId !== undefined) {
                const paletteIndex = this.palette[clutId + (this.header.tileClutSize / 1024)] || 0;
                const color = this.getColor(colorIndex, paletteIndex);

                const idx = i * 4;
                png.data[idx] = color.r;
                png.data[idx + 1] = color.g;
                png.data[idx + 2] = color.b;
                png.data[idx + 3] = color.a;
            }
        }

        // Ensure directory exists
        mkdirSync(dirname(outputPath), { recursive: true });

        // Write PNG
        const buffer = PNG.sync.write(png);
        writeFileSync(outputPath, buffer);

        console.log(`Saved sprite atlas to ${outputPath} (${atlasWidth}x${atlasHeight})`);
        return { width: atlasWidth, height: atlasHeight };
    }

    // Build map of pixel position -> CLUT ID
    buildSpriteClutMap() {
        const spriteClut = [];

        for (const sprite of this.sprites) {
            for (let y = sprite.y; y < sprite.y + sprite.height; y++) {
                for (let x = sprite.x; x < sprite.x + sprite.width; x++) {
                    const pixelIndex = (y * 256) + x;
                    spriteClut[pixelIndex] = sprite.clut;
                }
            }
        }

        return spriteClut;
    }

    // Extract individual sprites by type
    extractByType(outputDir) {
        console.log('Extracting sprites by type...');

        mkdirSync(outputDir, { recursive: true });

        const stats = {};

        for (const type of SPRITE_TYPES) {
            const count = this.spriteNumbers[type] || 0;
            const offset = this.spriteOffsets[type] || 0;

            if (count === 0) continue;

            // Create type directory
            const typeDir = join(outputDir, type.toLowerCase());
            mkdirSync(typeDir, { recursive: true });

            stats[type] = { count: 0, extracted: 0 };

            for (let i = 0; i < count; i++) {
                const spriteIndex = offset + i;
                if (spriteIndex >= this.sprites.length) break;

                const sprite = this.sprites[spriteIndex];
                const result = this.extractSingleSprite(sprite, join(typeDir, `${i}.png`));

                stats[type].count++;
                if (result) stats[type].extracted++;
            }
        }

        console.log('Extraction stats:', stats);
        return stats;
    }

    // Extract a single sprite to PNG
    extractSingleSprite(sprite, outputPath) {
        if (sprite.width === 0 || sprite.height === 0) {
            return false;
        }

        const png = new PNG({ width: sprite.width, height: sprite.height });

        // Get palette index for this sprite's CLUT
        const paletteIndex = this.palette[sprite.clut + (this.header.tileClutSize / 1024)] || 0;

        // Read pixels from sprite graphics
        for (let y = 0; y < sprite.height; y++) {
            for (let x = 0; x < sprite.width; x++) {
                const srcX = sprite.x + x;
                const srcY = sprite.y + y;
                const srcIndex = (srcY * 256) + srcX;

                if (srcIndex < this.spriteGraphics.length) {
                    const colorIndex = this.spriteGraphics[srcIndex];
                    const color = this.getColor(colorIndex, paletteIndex);

                    const dstIndex = (y * sprite.width + x) * 4;
                    png.data[dstIndex] = color.r;
                    png.data[dstIndex + 1] = color.g;
                    png.data[dstIndex + 2] = color.b;
                    png.data[dstIndex + 3] = color.a;
                }
            }
        }

        // Write PNG
        const buffer = PNG.sync.write(png);
        writeFileSync(outputPath, buffer);

        return true;
    }

    // Generate sprite info JSON
    generateSpriteInfo(outputPath) {
        const info = {
            total: this.sprites.length,
            byType: {},
            sprites: []
        };

        // Count by type
        for (const type of SPRITE_TYPES) {
            info.byType[type] = {
                count: this.spriteNumbers[type] || 0,
                offset: this.spriteOffsets[type] || 0
            };
        }

        // Sprite details
        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            const type = this.getSpriteType(i);

            info.sprites.push({
                index: i,
                type,
                width: sprite.width,
                height: sprite.height,
                x: sprite.x,
                y: sprite.y,
                page: sprite.page,
                clut: sprite.clut,
                deltas: sprite.deltas.length
            });
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(info, null, 2));

        console.log(`Saved sprite info to ${outputPath}`);
        return info;
    }

    // Get sprite type name by index
    getSpriteType(index) {
        for (const type of SPRITE_TYPES) {
            const offset = this.spriteOffsets[type] || 0;
            const count = this.spriteNumbers[type] || 0;

            if (index >= offset && index < offset + count) {
                return type;
            }
        }
        return 'UNKNOWN';
    }

    // Save game object definitions (boxes, lamps, etc.)
    saveGameObjects(outputPath) {
        console.log('Saving game objects...');

        const objectOffset = this.spriteOffsets.OBJECT || 0;

        const objects = this.gameObjects.map((obj, index) => ({
            id: index,
            width: obj.width,
            height: obj.height,
            depth: obj.depth,
            sprite: obj.sprite,
            spriteIndex: obj.sprite + objectOffset, // Absolute sprite index
            weight: obj.weight,
            aux: obj.aux,
            status: obj.status,
            statusName: obj.statusName,
            numInto: obj.numInto
        }));

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(objects, null, 2));

        console.log(`Saved ${objects.length} game objects to ${outputPath}`);
        return objects;
    }
}
