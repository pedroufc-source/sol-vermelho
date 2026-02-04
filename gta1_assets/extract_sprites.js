/**
 * GTA 1 G24 Sprite Extractor
 * Baseado no código do WebGL-GTA por Niklas von Hertzen
 * Extrai tiles e sprites dos arquivos .G24 do GTA 1
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

class DataViewReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.view = new DataView(buffer.buffer);
        this.pos = 0;
        this.littleEndian = true;
    }

    getUint8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }

    getUint16() {
        const val = this.view.getUint16(this.pos, this.littleEndian);
        this.pos += 2;
        return val;
    }

    getUint32() {
        const val = this.view.getUint32(this.pos, this.littleEndian);
        this.pos += 4;
        return val;
    }

    skip(bytes) {
        this.pos += bytes;
    }

    seek(pos) {
        this.pos = pos;
    }

    getPos() {
        return this.pos;
    }
}

class Sprite {
    constructor() {
        this.deltas = [];
    }

    loadData(data) {
        this.width = data.getUint8();
        this.height = data.getUint8();
        const deltaCount = data.getUint8();
        data.skip(1); // scaling flag
        this.size = data.getUint16();
        this.clut = data.getUint16();
        this.x = data.getUint8();
        this.y = data.getUint8();
        this.page = data.getUint16();
        this.y += this.page * 256;

        for (let i = 0; i < deltaCount; i++) {
            const delta = {
                size: data.getUint16(),
                w: data.getUint32()
            };
            this.deltas.push(delta);
        }
    }
}

function loadClut(data, clutSize) {
    const clutPages = [];
    const numPages = clutSize / (64 * 256 * 4);

    for (let page = 0; page < numPages; page++) {
        const clutData = [];
        for (let i = 0; i < 64; i++) {
            clutData[i] = [];
        }

        for (let p = 0; p < (64 * 256); p++) {
            const b = data.getUint8();
            const g = data.getUint8();
            const r = data.getUint8();
            const a = data.getUint8();
            clutData[p % 64].push([b, g, r, a]);
        }
        clutPages.push(clutData);
    }

    return clutPages;
}

function parseG24(buffer, outputDir) {
    const data = new DataViewReader(buffer);

    // Parse header
    const styleInfo = {
        versionCode: data.getUint32(),
        sideSize: data.getUint32(),
        lidSize: data.getUint32(),
        auxSize: data.getUint32(),
        animSize: data.getUint32(),
        clutSize: data.getUint32(),
        tileClutSize: data.getUint32(),
        spriteClutSize: data.getUint32(),
        newCarClutSize: data.getUint32(),
        fontClutSize: data.getUint32(),
        paletteIndexSize: data.getUint32(),
        objectInfoSize: data.getUint32(),
        carSize: data.getUint32(),
        spriteInfoSize: data.getUint32(),
        spriteGraphicsSize: data.getUint32(),
        spriteNumbersSize: data.getUint32(),
        headerSize: data.getPos()
    };

    console.log('Style Info:', styleInfo);

    styleInfo.clutSizeRounded = styleInfo.clutSize + (65536 - (styleInfo.clutSize % 65536));

    const numTiles = (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize) / (64 * 64);
    styleInfo.blockPad = (numTiles % 4) * 64 * 64;

    // Load palette index
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize +
        styleInfo.clutSizeRounded
    );

    const paletteLength = styleInfo.paletteIndexSize / 2;
    const palette = [];
    for (let p = 0; p < paletteLength; p++) {
        palette[p] = data.getUint16();
    }

    // Load sprites
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize +
        styleInfo.clutSizeRounded +
        styleInfo.paletteIndexSize +
        styleInfo.objectInfoSize +
        styleInfo.carSize
    );

    const spriteStartPos = data.getPos();
    const sprites = [];
    const spriteClut = [];

    while (spriteStartPos + styleInfo.spriteInfoSize > data.getPos()) {
        const sprite = new Sprite();
        sprite.loadData(data);
        sprites.push(sprite);

        // Build sprite clut map
        for (let y = sprite.y; y < (sprite.height + sprite.y); y++) {
            for (let x = sprite.x; x < (sprite.width + sprite.x); x++) {
                spriteClut[(y * 256) + x] = sprite.clut;
            }
        }
    }

    console.log(`Found ${sprites.length} sprites`);

    // Load CLUT data for sprites
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize
    );

    const clutPages = loadClut(data, styleInfo.spriteClutSize + styleInfo.tileClutSize);

    // Load sprite graphics
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize +
        styleInfo.clutSizeRounded +
        styleInfo.paletteIndexSize +
        styleInfo.objectInfoSize +
        styleInfo.carSize +
        styleInfo.spriteInfoSize
    );

    const spriteWidth = 256;
    const spriteHeight = Math.ceil(styleInfo.spriteGraphicsSize / 256);
    const spriteCanvas = createCanvas(spriteWidth, spriteHeight);
    const ctx = spriteCanvas.getContext('2d');
    const imageData = ctx.createImageData(spriteWidth, spriteHeight);
    const pixels = imageData.data;

    let d = 0;
    for (let p = 0; p < styleInfo.spriteGraphicsSize; p++) {
        const color = data.getUint8();
        const tileId = spriteClut[p];

        if (tileId !== undefined) {
            const clutId = palette[tileId + (styleInfo.tileClutSize / 1024)];
            const clutPage = Math.floor(clutId / 64);

            if (clutPages[clutPage] && clutPages[clutPage][clutId % 64] && clutPages[clutPage][clutId % 64][color]) {
                const colorData = clutPages[clutPage][clutId % 64][color];
                pixels[d] = colorData[2];     // R
                pixels[d + 1] = colorData[1]; // G
                pixels[d + 2] = colorData[0]; // B
            }
        }

        pixels[d + 3] = color === 0 ? 0 : 255; // A
        d += 4;
    }

    ctx.putImageData(imageData, 0, 0);

    // Save full sprite sheet
    const spriteSheetPath = path.join(outputDir, 'spritesheet.png');
    const spriteSheetBuffer = spriteCanvas.toBuffer('image/png');
    fs.writeFileSync(spriteSheetPath, spriteSheetBuffer);
    console.log(`Saved sprite sheet to ${spriteSheetPath}`);

    // Extract individual sprites
    const spritesDir = path.join(outputDir, 'sprites');
    if (!fs.existsSync(spritesDir)) {
        fs.mkdirSync(spritesDir, { recursive: true });
    }

    // Sprite types
    const spriteTypes = [
        "ARROW", "DIGITS", "BOAT", "BOX", "BUS", "CAR", "OBJECT", "PED",
        "SPEEDO", "TANK", "TRAFFIC_LIGHTS", "TRAIN", "TRDOORS", "BIKE",
        "TRAM", "WBUS", "WCAR", "EX", "TUMCAR", "TUMTRUCK", "FERRY"
    ];

    // Read sprite numbers
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize +
        styleInfo.clutSizeRounded +
        styleInfo.paletteIndexSize +
        styleInfo.objectInfoSize +
        styleInfo.carSize +
        styleInfo.spriteInfoSize +
        styleInfo.spriteGraphicsSize
    );

    const spriteCounts = {};
    const spriteOffsets = {};
    let offset = 0;

    for (const type of spriteTypes) {
        spriteCounts[type] = data.getUint16();
        spriteOffsets[type] = offset;
        offset += spriteCounts[type];
    }

    console.log('Sprite counts:', spriteCounts);

    // Extract each sprite
    for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i];
        if (sprite.width <= 0 || sprite.height <= 0) continue;

        const spriteCanvas2 = createCanvas(sprite.width, sprite.height);
        const spriteCtx = spriteCanvas2.getContext('2d');

        spriteCtx.drawImage(
            spriteCanvas,
            sprite.x, sprite.y, sprite.width, sprite.height,
            0, 0, sprite.width, sprite.height
        );

        // Determine sprite type
        let typeName = 'unknown';
        for (const type of spriteTypes) {
            if (i >= spriteOffsets[type] && i < spriteOffsets[type] + spriteCounts[type]) {
                typeName = type.toLowerCase();
                break;
            }
        }

        const typeDir = path.join(spritesDir, typeName);
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }

        const spritePath = path.join(typeDir, `sprite_${i}_${sprite.width}x${sprite.height}.png`);
        const buffer = spriteCanvas2.toBuffer('image/png');
        fs.writeFileSync(spritePath, buffer);
    }

    console.log(`Extracted ${sprites.length} sprites to ${spritesDir}`);

    // Now extract tiles
    const tilesDir = path.join(outputDir, 'tiles');
    if (!fs.existsSync(tilesDir)) {
        fs.mkdirSync(tilesDir, { recursive: true });
    }

    // Load tile CLUT
    data.seek(
        styleInfo.headerSize +
        (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + styleInfo.blockPad) +
        styleInfo.animSize
    );

    const tileClutPages = loadClut(data, styleInfo.tileClutSize);

    // Draw tiles
    const xLen = 64 * 4;
    const yLen = (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize + (numTiles % 4) * 64 * 64) / xLen;

    const tileCanvas = createCanvas(xLen, yLen);
    const tileCtx = tileCanvas.getContext('2d');
    const tileImageData = tileCtx.createImageData(xLen, yLen);
    const tilePixels = tileImageData.data;

    data.seek(64); // Skip header to tile data

    for (let y = 0; y < yLen; y++) {
        for (let x = 0; x < xLen; x++) {
            const color = data.getUint8();
            const tileId = Math.floor(((Math.floor(y / 64) * xLen) + x) / 64);
            const clutId = palette[4 * tileId];
            const clutPage = Math.floor(clutId / 64);

            const idx = (y * xLen * 4) + (x * 4);

            if (tileClutPages[clutPage] && tileClutPages[clutPage][clutId % 64] && tileClutPages[clutPage][clutId % 64][color]) {
                const colorData = tileClutPages[clutPage][clutId % 64][color];
                tilePixels[idx] = colorData[2];     // R
                tilePixels[idx + 1] = colorData[1]; // G
                tilePixels[idx + 2] = colorData[0]; // B
            }

            tilePixels[idx + 3] = color === 0 ? 0 : 255;
        }
    }

    tileCtx.putImageData(tileImageData, 0, 0);

    // Save tile sheet
    const tileSheetPath = path.join(outputDir, 'tilesheet.png');
    const tileBuffer = tileCanvas.toBuffer('image/png');
    fs.writeFileSync(tileSheetPath, tileBuffer);
    console.log(`Saved tile sheet to ${tileSheetPath}`);

    // Extract individual tiles
    for (let i = 0; i < numTiles; i++) {
        const tileX = (i % 4) * 64;
        const tileY = Math.floor(i / 4) * 64;

        const singleTile = createCanvas(64, 64);
        const singleCtx = singleTile.getContext('2d');

        singleCtx.drawImage(
            tileCanvas,
            tileX, tileY, 64, 64,
            0, 0, 64, 64
        );

        // Categorize tiles
        let category = 'aux';
        const sideTiles = styleInfo.sideSize / (64 * 64);
        const lidTiles = styleInfo.lidSize / (64 * 64);

        if (i < sideTiles) {
            category = 'side';
        } else if (i < sideTiles + lidTiles) {
            category = 'lid';
        }

        const catDir = path.join(tilesDir, category);
        if (!fs.existsSync(catDir)) {
            fs.mkdirSync(catDir, { recursive: true });
        }

        const tilePath = path.join(catDir, `tile_${i}.png`);
        const buffer2 = singleTile.toBuffer('image/png');
        fs.writeFileSync(tilePath, buffer2);
    }

    console.log(`Extracted ${numTiles} tiles to ${tilesDir}`);

    return { sprites, numTiles, styleInfo };
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node extract_sprites.js <input.G24> <output_dir>');
    console.log('Example: node extract_sprites.js STYLE001.G24 ./output');
    process.exit(1);
}

const inputFile = args[0];
const outputDir = args[1];

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Reading ${inputFile}...`);
const buffer = fs.readFileSync(inputFile);
const nodeBuffer = Buffer.from(buffer);

parseG24(nodeBuffer, outputDir);
console.log('Done!');
