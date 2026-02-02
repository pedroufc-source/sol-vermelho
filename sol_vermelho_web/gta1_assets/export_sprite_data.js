/**
 * Exporta dados dos sprites para JSON
 */

const fs = require('fs');
const path = require('path');

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

function exportSpriteData(buffer) {
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

    styleInfo.clutSizeRounded = styleInfo.clutSize + (65536 - (styleInfo.clutSize % 65536));
    const numTiles = (styleInfo.sideSize + styleInfo.lidSize + styleInfo.auxSize) / (64 * 64);
    styleInfo.blockPad = (numTiles % 4) * 64 * 64;

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

    while (spriteStartPos + styleInfo.spriteInfoSize > data.getPos()) {
        const width = data.getUint8();
        const height = data.getUint8();
        const deltaCount = data.getUint8();
        data.skip(1);
        const size = data.getUint16();
        const clut = data.getUint16();
        const x = data.getUint8();
        let y = data.getUint8();
        const page = data.getUint16();
        y += page * 256;

        // Skip deltas
        for (let i = 0; i < deltaCount; i++) {
            data.skip(6);
        }

        sprites.push({ width, height, x, y, page });
    }

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

    const spriteTypes = [
        "arrow", "digits", "boat", "box", "bus", "car", "object", "ped",
        "speedo", "tank", "traffic_lights", "train", "trdoors", "bike",
        "tram", "wbus", "wcar", "ex", "tumcar", "tumtruck", "ferry"
    ];

    const spriteCounts = {};
    const spriteOffsets = {};
    let offset = 0;

    for (const type of spriteTypes) {
        spriteCounts[type] = data.getUint16();
        spriteOffsets[type] = offset;
        offset += spriteCounts[type];
    }

    // Build organized sprite data
    const spriteData = {
        sheetWidth: 256,
        sheetHeight: Math.ceil(styleInfo.spriteGraphicsSize / 256),
        categories: {}
    };

    for (const type of spriteTypes) {
        if (spriteCounts[type] === 0) continue;

        spriteData.categories[type] = [];
        const start = spriteOffsets[type];
        const count = spriteCounts[type];

        for (let i = start; i < start + count; i++) {
            if (sprites[i]) {
                spriteData.categories[type].push({
                    id: i,
                    x: sprites[i].x,
                    y: sprites[i].y,
                    w: sprites[i].width,
                    h: sprites[i].height
                });
            }
        }
    }

    // Add tile info
    spriteData.tiles = {
        count: numTiles,
        size: 64,
        sheetWidth: 256,
        sheetHeight: Math.ceil((numTiles * 64 * 64) / 256)
    };

    return spriteData;
}

// Main
const inputFile = process.argv[2] || './gta1_extracted/gta1_data/Program_Executable_Files/GTADATA/STYLE001.G24';
const outputFile = process.argv[3] || './sprite_data.json';

console.log(`Reading ${inputFile}...`);
const buffer = fs.readFileSync(inputFile);
const nodeBuffer = Buffer.from(buffer);

const data = exportSpriteData(nodeBuffer);
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log(`Exported to ${outputFile}`);
console.log(`Categories: ${Object.keys(data.categories).join(', ')}`);
