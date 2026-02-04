/**
 * GTA 1 Map File Parser (.CMP)
 * Based on WebGL-GTA by Niklas von Hertzen (hertzen.com)
 *
 * CMP files contain:
 * - Map grid (256x256 columns)
 * - Block definitions (tile types, textures, slopes)
 * - Object positions
 * - Route/path data
 * - Navigational zones (neighborhoods)
 */

import { BinaryReader } from './reader.js';

// Block ground types
const GROUND_TYPES = {
    0: 'air',
    1: 'water',
    2: 'road',
    3: 'pavement',
    4: 'field',
    5: 'building',
    6: 'unused',
    7: 'unused'
};

// Slope type descriptions
const SLOPE_TYPES = {
    0: 'flat',
    1: 'up_front_low', 2: 'up_front_high',
    3: 'down_front_low', 4: 'down_front_high',
    5: 'left_low', 6: 'left_high',
    7: 'right_low', 8: 'right_high',
    // 9-16: diagonal slopes (8 levels, up front)
    // 17-24: diagonal slopes (8 levels, down front)
    // 25-32: diagonal slopes (8 levels, left)
    // 33-40: diagonal slopes (8 levels, right)
    // 41+: corner slopes
};

export class CMPParser {
    constructor(buffer) {
        this.reader = new BinaryReader(buffer);
        this.header = null;
        this.blocks = [];
        this.columns = [];
        this.navData = [];
        this.objects = [];
        this.routes = [];
        this.locationData = [];
    }

    parse() {
        console.log('Parsing CMP file...');
        console.log(`File size: ${this.reader.getLength()} bytes`);

        // Read header
        this.header = this.parseHeader();
        console.log('Header:', this.header);

        // Parse block definitions
        this.parseBlocks();

        // Parse column data (map grid)
        this.parseColumns();

        // Parse object positions (vehicles and objects in the world)
        this.parseObjectPositions();

        // Parse route data (traffic paths)
        this.parseRouteData();

        // Parse location data (spawn points, etc.)
        this.parseLocationData();

        // Parse navigational data (zone names)
        this.parseNavData();

        return {
            header: this.header,
            blocks: this.blocks,
            columns: this.columns,
            navData: this.navData,
            objects: this.objects,
            routes: this.routes,
            locationData: this.locationData,
            stats: this.getStats()
        };
    }

    parseHeader() {
        const reader = this.reader;

        return {
            versionCode: reader.getUint32(),
            styleNumber: reader.getUint8(),
            sampleNumber: reader.getUint8(),
            reserved: reader.getUint16(), // padding
            routeSize: reader.getUint32(),
            objectPosSize: reader.getUint32(),
            columnSize: reader.getUint32(),
            blockSize: reader.getUint32(),
            navDataSize: reader.getUint32()
        };
    }

    parseBlocks() {
        const reader = this.reader;
        const header = this.header;

        // Block data starts after column pointers
        // Column pointers: 28 bytes header + 256*256*4 bytes = 262172
        const blockDataOffset = 262172 + header.columnSize;
        reader.seek(blockDataOffset);

        const numBlocks = header.blockSize / 8; // Each block is 8 bytes
        console.log(`Parsing ${numBlocks} blocks...`);

        for (let i = 0; i < numBlocks; i++) {
            const block = this.parseBlock();
            this.blocks.push(block);
        }

        console.log(`Loaded ${this.blocks.length} blocks`);
    }

    parseBlock() {
        const reader = this.reader;

        // Read raw values
        const typeMap = reader.getUint16();
        const typeMapExt = reader.getUint8();
        const left = reader.getUint8();
        const right = reader.getUint8();
        const top = reader.getUint8();
        const bottom = reader.getUint8();
        const lid = reader.getUint8();

        // Decode type_map bits
        const directions = {
            up: (typeMap & 1) !== 0,
            down: (typeMap & 2) !== 0,
            left: (typeMap & 4) !== 0,
            right: (typeMap & 8) !== 0
        };

        const groundType = (typeMap & 0x70) >> 4;
        const flat = (typeMap & 128) !== 0;
        const flipX = (typeMap & 64) !== 0;
        const flipY = (typeMap & 32) !== 0;
        const slope = (typeMap & 0x3F00) >> 8;
        const lidRotation = (typeMap & 0xC000) >> 14;

        // Decode type_map_ext bits
        const railway = (typeMapExt & 128) !== 0;
        const trafficLights = typeMapExt & 0x7;
        const remap = (typeMapExt & 0x18) >> 3;

        return {
            // Tile IDs for each face (0 = no tile)
            tiles: { left, right, top, bottom, lid },
            // Movement directions allowed
            directions,
            // Ground type
            groundType,
            groundTypeName: GROUND_TYPES[groundType],
            // Geometry
            flat,
            slope,
            flipX,
            flipY,
            lidRotation, // 0=0deg, 1=90deg, 2=180deg, 3=270deg
            // Special features
            railway,
            trafficLights,
            remap
        };
    }

    parseColumns() {
        const reader = this.reader;

        console.log('Parsing 256x256 map grid...');

        // Initialize 256x256 grid
        for (let y = 0; y < 256; y++) {
            this.columns[y] = [];
            for (let x = 0; x < 256; x++) {
                this.columns[y][x] = this.parseColumn(x, y);
            }
        }

        console.log('Map grid parsed');
    }

    parseColumn(x, y) {
        const reader = this.reader;

        // Column pointer is at offset 28 + (x*4) + (y*4*256)
        const pointerOffset = 28 + (x * 4) + (y * 4 * 256);
        const columnOffset = reader.getUint32(pointerOffset) + 262172;

        // Save position and read column
        const savedPos = reader.getPosition();
        reader.seek(columnOffset);

        // First 2 bytes: height offset (6 - actual height)
        const heightOffset = reader.getUint16();
        const height = 6 - heightOffset;

        // Read block indices for each level
        const blockIndices = [];
        for (let z = 0; z < height; z++) {
            blockIndices.push(reader.getUint16());
        }

        // Blocks are stored top-to-bottom, reverse to get bottom-to-top
        blockIndices.reverse();

        // Restore position
        reader.seek(savedPos);

        return {
            x,
            y,
            height,
            blockIndices
        };
    }

    parseNavData() {
        const reader = this.reader;
        const header = this.header;

        // Nav data offset
        const navOffset = 262172 +
            header.columnSize +
            header.blockSize +
            header.objectPosSize +
            header.routeSize +
            (3 * 6 * 6); // Location data size

        reader.seek(navOffset);

        const numZones = Math.floor(header.navDataSize / 35); // Each zone is 35 bytes
        console.log(`Parsing ${numZones} navigation zones...`);

        for (let i = 0; i < numZones; i++) {
            const zone = {
                x: reader.getUint8(),
                y: reader.getUint8(),
                width: reader.getUint8(),
                height: reader.getUint8(),
                sample: reader.getUint8(),
                name: reader.getString(30).trim()
            };

            if (zone.name) {
                this.navData.push(zone);
            }
        }

        console.log(`Loaded ${this.navData.length} navigation zones`);
    }

    parseObjectPositions() {
        const reader = this.reader;
        const header = this.header;

        // Object positions come after block data
        const objectOffset = 262172 + header.columnSize + header.blockSize;
        reader.seek(objectOffset);

        // Each object position is 14 bytes (not 6!)
        const numObjects = Math.floor(header.objectPosSize / 14);
        console.log(`Parsing ${numObjects} object positions...`);

        for (let i = 0; i < numObjects; i++) {
            const obj = {
                x: reader.getUint16(),
                y: reader.getUint16(),
                z: reader.getUint16(),
                type: reader.getUint8(),
                remap: reader.getUint8(),
                rotation: reader.getUint16(),
                pitch: reader.getUint16(),
                roll: reader.getUint16()
            };

            // If remap >= 128, it's a vehicle; otherwise it's a game object
            obj.isVehicle = obj.remap >= 128;

            // Convert rotation to radians (0-65535 -> 0-2π)
            obj.rotationRad = (obj.rotation / 65535) * Math.PI * 2;

            this.objects.push(obj);
        }

        console.log(`Loaded ${this.objects.length} object positions (${this.objects.filter(o => o.isVehicle).length} vehicles)`);
    }

    parseRouteData() {
        const reader = this.reader;
        const header = this.header;

        if (header.routeSize === 0) {
            console.log('No route data');
            return;
        }

        // Route data comes after object positions
        const routeOffset = 262172 + header.columnSize + header.blockSize + header.objectPosSize;
        reader.seek(routeOffset);

        // Route format: sequences of waypoints
        // Each entry is 4 bytes: x (uint8), y (uint8), z (uint8), direction (uint8)
        const numRouteEntries = Math.floor(header.routeSize / 4);
        console.log(`Parsing ${numRouteEntries} route entries...`);

        let currentRoute = [];
        for (let i = 0; i < numRouteEntries; i++) {
            const x = reader.getUint8();
            const y = reader.getUint8();
            const z = reader.getUint8();
            const direction = reader.getUint8();

            // Direction 255 typically marks end of a route segment
            if (x === 0 && y === 0 && z === 0) {
                if (currentRoute.length > 0) {
                    this.routes.push(currentRoute);
                    currentRoute = [];
                }
            } else {
                currentRoute.push({ x, y, z, direction });
            }
        }

        // Don't forget the last route
        if (currentRoute.length > 0) {
            this.routes.push(currentRoute);
        }

        console.log(`Loaded ${this.routes.length} routes`);
    }

    parseLocationData() {
        const reader = this.reader;
        const header = this.header;

        // Location data comes after route data
        // It's 3*6*6 = 108 bytes for spawn locations, multipliers, etc.
        const locationOffset = 262172 +
            header.columnSize +
            header.blockSize +
            header.objectPosSize +
            header.routeSize;

        reader.seek(locationOffset);

        // 3 cities × 6 levels × 6 bytes each = 108 bytes
        // Each entry has various multipliers/settings
        for (let city = 0; city < 3; city++) {
            const cityData = [];
            for (let level = 0; level < 6; level++) {
                cityData.push({
                    data: [
                        reader.getUint8(),
                        reader.getUint8(),
                        reader.getUint8(),
                        reader.getUint8(),
                        reader.getUint8(),
                        reader.getUint8()
                    ]
                });
            }
            this.locationData.push(cityData);
        }

        console.log('Loaded location data for 3 cities');
    }

    getStats() {
        // Count ground types
        const groundTypeCounts = {};
        for (const typeName of Object.values(GROUND_TYPES)) {
            groundTypeCounts[typeName] = 0;
        }

        let slopeCount = 0;
        let railwayCount = 0;
        let trafficLightCount = 0;

        for (const block of this.blocks) {
            groundTypeCounts[block.groundTypeName]++;
            if (block.slope > 0) slopeCount++;
            if (block.railway) railwayCount++;
            if (block.trafficLights > 0) trafficLightCount++;
        }

        // Calculate average column height
        let totalHeight = 0;
        let maxHeight = 0;
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const h = this.columns[y][x].height;
                totalHeight += h;
                if (h > maxHeight) maxHeight = h;
            }
        }

        // Count vehicles vs objects
        const vehicleCount = this.objects.filter(o => o.isVehicle).length;
        const gameObjectCount = this.objects.length - vehicleCount;

        // Count total waypoints in routes
        const totalWaypoints = this.routes.reduce((sum, r) => sum + r.length, 0);

        return {
            totalBlocks: this.blocks.length,
            groundTypes: groundTypeCounts,
            slopedBlocks: slopeCount,
            railwayBlocks: railwayCount,
            trafficLightBlocks: trafficLightCount,
            navigationZones: this.navData.length,
            objectPositions: this.objects.length,
            vehiclePositions: vehicleCount,
            gameObjectPositions: gameObjectCount,
            routes: this.routes.length,
            totalWaypoints: totalWaypoints,
            mapSize: '256x256',
            maxColumnHeight: maxHeight,
            avgColumnHeight: (totalHeight / (256 * 256)).toFixed(2)
        };
    }

    // Get block at specific position
    getBlock(x, y, z) {
        if (x < 0 || x >= 256 || y < 0 || y >= 256) return null;
        const column = this.columns[y][x];
        if (z < 0 || z >= column.height) return null;
        const blockIndex = column.blockIndices[z];
        return this.blocks[blockIndex];
    }

    // Get all zones containing a point
    getZonesAt(x, y) {
        return this.navData.filter(zone =>
            x >= zone.x &&
            x < zone.x + zone.width &&
            y >= zone.y &&
            y < zone.y + zone.height
        );
    }
}

export { GROUND_TYPES, SLOPE_TYPES };
