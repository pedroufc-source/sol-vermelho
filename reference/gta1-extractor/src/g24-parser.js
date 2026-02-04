/**
 * GTA 1 Style File Parser (.G24)
 * Based on WebGL-GTA by Niklas von Hertzen (hertzen.com)
 *
 * G24 files contain:
 * - Tiles (64x64 textures for ground, walls, roofs)
 * - Sprites (cars, pedestrians, objects)
 * - Color palettes (CLUT - Color Look-Up Table)
 * - Vehicle physics data
 * - Object information
 */

import { BinaryReader } from './reader.js';

// Sprite type names and order
const SPRITE_TYPES = [
    'ARROW', 'DIGITS', 'BOAT', 'BOX', 'BUS', 'CAR', 'OBJECT', 'PED',
    'SPEEDO', 'TANK', 'TRAFFIC_LIGHTS', 'TRAIN', 'TRDOORS', 'BIKE',
    'TRAM', 'WBUS', 'WCAR', 'EX', 'TUMCAR', 'TUMTRUCK', 'FERRY'
];

// Object status types
const OBJECT_STATUS = {
    0: 'normal',
    1: 'ignorable',
    2: 'smashable',
    3: 'invisible',
    4: 'unknown4',
    5: 'animation',
    6: 'car_upgrade',
    7: 'unknown7',
    8: 'helipad',
    9: 'powerup',
    10: 'unknown10',
    11: 'unknown11',
    12: 'unknown12'
};

export class G24Parser {
    constructor(buffer) {
        this.reader = new BinaryReader(buffer);
        this.header = null;
        this.sprites = [];
        this.spriteNumbers = {};
        this.spriteOffsets = {};
        this.vehicles = [];
        this.gameObjects = [];  // Object definitions (boxes, lamps, etc.)
        this.animData = null;   // Raw animation data
        this.clutPages = [];
        this.palette = [];
        this.tileData = null;
        this.spriteGraphics = null;
    }

    parse() {
        console.log('Parsing G24 file...');
        console.log(`File size: ${this.reader.getLength()} bytes`);

        // Read header
        this.header = this.parseHeader();
        console.log('Header:', this.header);

        // Calculate derived values
        // clutSizeRounded rounds up to next 64KB boundary
        const clutMod = this.header.clutSize % 65536;
        this.header.clutSizeRounded = clutMod === 0
            ? this.header.clutSize
            : this.header.clutSize + (65536 - clutMod);
        const numTiles = (this.header.sideSize + this.header.lidSize + this.header.auxSize) / (64 * 64);
        this.header.blockPad = (numTiles % 4) * 64 * 64;

        // Load CLUT (Color Look-Up Table)
        try { this.loadClut(); } catch(e) { console.log('Warning: CLUT load failed:', e.message); }

        // Load palette index
        try { this.loadPalette(); } catch(e) { console.log('Warning: Palette load failed:', e.message); }

        // Load game object definitions (boxes, lamps, etc.)
        try { this.loadGameObjects(); } catch(e) { console.log('Warning: GameObjects load failed:', e.message); }

        // Load vehicle data
        try { this.loadVehicles(); } catch(e) { console.log('Warning: Vehicles load failed:', e.message); }

        // Load sprites info
        try { this.loadSprites(); } catch(e) { console.log('Warning: Sprites load failed:', e.message); }

        // Load sprite numbers (count per type)
        try { this.loadSpriteNumbers(); } catch(e) { console.log('Warning: Sprite numbers load failed:', e.message); }

        // Load tile graphics
        try { this.loadTileData(); } catch(e) { console.log('Warning: Tile data load failed:', e.message); }

        // Load sprite graphics
        try { this.loadSpriteGraphics(); } catch(e) { console.log('Warning: Sprite graphics load failed:', e.message); }

        // Load animation data
        try { this.loadAnimData(); } catch(e) { console.log('Warning: AnimData load failed:', e.message); }

        return {
            header: this.header,
            sprites: this.sprites,
            spriteNumbers: this.spriteNumbers,
            spriteOffsets: this.spriteOffsets,
            vehicles: this.vehicles,
            gameObjects: this.gameObjects,
            animData: this.animData,
            clutPages: this.clutPages,
            palette: this.palette,
            tileData: this.tileData,
            spriteGraphics: this.spriteGraphics
        };
    }

    parseHeader() {
        const reader = this.reader;

        return {
            versionCode: reader.getUint32(),
            sideSize: reader.getUint32(),
            lidSize: reader.getUint32(),
            auxSize: reader.getUint32(),
            animSize: reader.getUint32(),
            clutSize: reader.getUint32(),
            tileClutSize: reader.getUint32(),
            spriteClutSize: reader.getUint32(),
            newCarClutSize: reader.getUint32(),
            fontClutSize: reader.getUint32(),
            paletteIndexSize: reader.getUint32(),
            objectInfoSize: reader.getUint32(),
            carSize: reader.getUint32(),
            spriteInfoSize: reader.getUint32(),
            spriteGraphicsSize: reader.getUint32(),
            spriteNumbersSize: reader.getUint32(),
            headerSize: reader.getPosition()
        };
    }

    loadClut() {
        const reader = this.reader;
        const header = this.header;

        // Seek to CLUT data
        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize
        );

        const clutSize = header.tileClutSize + header.spriteClutSize;
        const numPages = clutSize / (64 * 256 * 4);

        for (let page = 0; page < numPages; page++) {
            const clutData = [];

            for (let i = 0; i < 64; i++) {
                clutData[i] = [];
            }

            for (let p = 0; p < (64 * 256); p++) {
                const clutId = p % 64;
                // BGRA format
                const b = reader.getUint8();
                const g = reader.getUint8();
                const r = reader.getUint8();
                const a = reader.getUint8();
                clutData[clutId].push([b, g, r, a]);
            }

            this.clutPages.push(clutData);
        }

        console.log(`Loaded ${this.clutPages.length} CLUT pages`);
    }

    loadPalette() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded
        );

        const paletteLength = header.paletteIndexSize / 2;

        for (let p = 0; p < paletteLength; p++) {
            this.palette[p] = reader.getUint16();
        }

        console.log(`Loaded palette with ${this.palette.length} entries`);
    }

    loadSprites() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded +
            header.paletteIndexSize +
            header.objectInfoSize +
            header.carSize
        );

        const startPos = reader.getPosition();
        const endPos = startPos + header.spriteInfoSize;

        try {
            while (reader.getPosition() < endPos) {
                const sprite = this.parseSprite();
                this.sprites.push(sprite);
            }
        } catch (e) {
            console.log(`Warning: Stopped loading sprites at ${this.sprites.length} (${e.message})`);
        }

        console.log(`Loaded ${this.sprites.length} sprites`);
    }

    parseSprite() {
        const reader = this.reader;

        const sprite = {
            width: reader.getUint8(),
            height: reader.getUint8(),
            deltaCount: reader.getUint8()
        };

        reader.skip(1); // scaling flag for consoles

        sprite.size = reader.getUint16();
        sprite.clut = reader.getUint16();
        sprite.x = reader.getUint8();
        sprite.y = reader.getUint8();
        sprite.page = reader.getUint16();

        // Sprites are drawn vertically across pages
        sprite.y += sprite.page * 256;

        // Load deltas (animation frames)
        sprite.deltas = [];
        // Sanity check: deltaCount should be reasonable (< 100)
        const maxDeltas = Math.min(sprite.deltaCount, 100);
        for (let i = 0; i < maxDeltas; i++) {
            sprite.deltas.push({
                size: reader.getUint16(),
                w: reader.getUint32()
            });
        }

        return sprite;
    }

    loadSpriteNumbers() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded +
            header.paletteIndexSize +
            header.objectInfoSize +
            header.carSize +
            header.spriteInfoSize +
            header.spriteGraphicsSize
        );

        let offset = 0;
        for (const type of SPRITE_TYPES) {
            const count = reader.getUint16();
            this.spriteNumbers[type] = count;
            this.spriteOffsets[type] = offset;
            offset += count;
        }

        console.log('Sprite counts:', this.spriteNumbers);
    }

    loadGameObjects() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded +
            header.paletteIndexSize
        );

        // Each object is 20 bytes
        const numObjects = Math.floor(header.objectInfoSize / 20);
        console.log(`Parsing ${numObjects} game objects...`);

        for (let i = 0; i < numObjects; i++) {
            const obj = {
                width: reader.getUint32(),
                height: reader.getUint32(),
                depth: reader.getUint32(),
                sprite: reader.getUint16(),
                weight: reader.getUint16(),
                aux: reader.getUint16(),
                status: reader.getInt8(),
                numInto: reader.getUint8()
            };

            // Add status name
            obj.statusName = OBJECT_STATUS[obj.status] || `unknown_${obj.status}`;

            this.gameObjects.push(obj);
        }

        console.log(`Loaded ${this.gameObjects.length} game objects`);
    }

    loadVehicles() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded +
            header.paletteIndexSize +
            header.objectInfoSize
        );

        const startPos = reader.getPosition();
        const endPos = startPos + header.carSize;

        try {
            while (reader.getPosition() < endPos) {
                const vehicle = this.parseVehicle();
                this.vehicles.push(vehicle);
            }
        } catch (e) {
            console.log(`Warning: Stopped loading vehicles at ${this.vehicles.length} (${e.message})`);
        }

        console.log(`Loaded ${this.vehicles.length} vehicles`);
    }

    parseVehicle() {
        const reader = this.reader;

        const vehicle = {
            // Dimensions
            width: reader.getInt16(),
            height: reader.getInt16(),
            depth: reader.getInt16(),

            // Sprite reference
            sprite: reader.getInt16(),

            // Basic physics
            weight: reader.getInt16(),
            maxSpeed: reader.getInt16(),
            minSpeed: reader.getInt16(),
            acceleration: reader.getInt16(),
            braking: reader.getInt16(),
            grip: reader.getInt16(),
            handling: reader.getInt16(),

            // Color remaps
            remaps: []
        };

        // 12 color remaps (HLS values)
        for (let i = 0; i < 12; i++) {
            vehicle.remaps.push({
                h: reader.getInt16(), // Hue
                l: reader.getInt16(), // Lightness
                s: reader.getInt16()  // Saturation
            });
        }

        reader.skip(12); // 8-bit remaps (not used)

        vehicle.type = reader.getUint8();
        vehicle.model = reader.getUint8();
        vehicle.turning = reader.getUint8();
        vehicle.damagable = reader.getUint8();

        // Prices at different cranes
        vehicle.prices = [];
        for (let i = 0; i < 4; i++) {
            vehicle.prices.push(reader.getUint16());
        }

        vehicle.cx = reader.getUint8();
        vehicle.cy = reader.getUint8();
        vehicle.moment = reader.getUint32();

        // Advanced physics (floats)
        vehicle.mass = reader.getFloat32();
        vehicle.thrust = reader.getFloat32();
        vehicle.tyreAdhesionX = reader.getFloat32();
        vehicle.tyreAdhesionY = reader.getFloat32();
        vehicle.handbrakeFriction = reader.getFloat32();
        vehicle.footbrakeFriction = reader.getFloat32();
        vehicle.frontBrakeBias = reader.getFloat32();

        vehicle.turnRatio = reader.getInt16();
        vehicle.driveWheelOffset = reader.getInt16();
        vehicle.steeringWheelOffset = reader.getInt16();

        vehicle.backEndSlideValue = reader.getFloat32();
        vehicle.handbrakeSlideValue = reader.getFloat32();

        vehicle.convertible = reader.getUint8();
        vehicle.engine = reader.getUint8();
        vehicle.radio = reader.getUint8();
        vehicle.horn = reader.getUint8();
        vehicle.soundFunction = reader.getUint8();
        vehicle.fastChangeFlag = reader.getUint8();

        // Doors
        const doorCount = reader.getInt16();
        vehicle.doors = [];
        for (let i = 0; i < doorCount; i++) {
            vehicle.doors.push({
                rpx: reader.getInt16(),
                rpy: reader.getInt16(),
                gameObject: reader.getInt16(),
                delta: reader.getInt16()
            });
        }

        return vehicle;
    }

    loadTileData() {
        const reader = this.reader;
        const header = this.header;

        // Tiles start right after header
        reader.seek(header.headerSize);

        const tileDataSize = header.sideSize + header.lidSize + header.auxSize;
        this.tileData = reader.getBytes(tileDataSize);

        console.log(`Loaded ${tileDataSize} bytes of tile data`);
    }

    loadSpriteGraphics() {
        const reader = this.reader;
        const header = this.header;

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad) +
            header.animSize +
            header.clutSizeRounded +
            header.paletteIndexSize +
            header.objectInfoSize +
            header.carSize +
            header.spriteInfoSize
        );

        this.spriteGraphics = reader.getBytes(header.spriteGraphicsSize);

        console.log(`Loaded ${header.spriteGraphicsSize} bytes of sprite graphics`);
    }

    loadAnimData() {
        const reader = this.reader;
        const header = this.header;

        if (header.animSize === 0) {
            console.log('No animation data');
            return;
        }

        reader.seek(
            header.headerSize +
            (header.sideSize + header.lidSize + header.auxSize + header.blockPad)
        );

        // Animation data is raw bytes - format not fully documented
        // Store raw for now, can be parsed further if needed
        this.animData = reader.getBytes(header.animSize);

        console.log(`Loaded ${header.animSize} bytes of animation data`);
    }

    // Get color from CLUT
    getColor(colorIndex, clutId) {
        const clutPage = Math.floor(clutId / 64);
        const clutIndex = clutId % 64;

        if (this.clutPages[clutPage] && this.clutPages[clutPage][clutIndex]) {
            const [b, g, r, a] = this.clutPages[clutPage][clutIndex][colorIndex];
            return { r, g, b, a: colorIndex === 0 ? 0 : 255 };
        }

        return { r: 0, g: 0, b: 0, a: 0 };
    }
}

export { SPRITE_TYPES, OBJECT_STATUS };
