/**
 * Map Data Extractor
 * Exports GTA 1 map data as JSON
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class MapExtractor {
    constructor(parsedData) {
        this.header = parsedData.header;
        this.blocks = parsedData.blocks;
        this.columns = parsedData.columns;
        this.navData = parsedData.navData;
        this.objects = parsedData.objects;
        this.routes = parsedData.routes || [];
        this.locationData = parsedData.locationData || [];
        this.stats = parsedData.stats;
    }

    // Save complete map data as JSON
    saveMapData(outputPath) {
        console.log('Saving map data...');

        const mapData = {
            header: this.header,
            stats: this.stats,
            zones: this.navData,
            // Don't include full grid in main file (too large)
            gridInfo: {
                width: 256,
                height: 256,
                totalColumns: 256 * 256,
                note: 'Full grid data saved separately'
            }
        };

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(mapData, null, 2));
        console.log(`Saved map info to ${outputPath}`);
    }

    // Save navigation zones separately
    saveZones(outputPath) {
        console.log('Saving navigation zones...');

        const zones = this.navData.map((zone, index) => ({
            id: index,
            name: zone.name,
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height,
            sample: zone.sample,
            // Calculate center for easy reference
            centerX: zone.x + Math.floor(zone.width / 2),
            centerY: zone.y + Math.floor(zone.height / 2)
        }));

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(zones, null, 2));
        console.log(`Saved ${zones.length} zones to ${outputPath}`);
    }

    // Save block definitions (tile/geometry info)
    saveBlocks(outputPath) {
        console.log('Saving block definitions...');

        // Save compact version with only essential data
        const blocks = this.blocks.map((block, index) => ({
            id: index,
            type: block.groundTypeName,
            tiles: block.tiles,
            slope: block.slope,
            flat: block.flat,
            railway: block.railway,
            trafficLights: block.trafficLights
        }));

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(blocks, null, 2));
        console.log(`Saved ${blocks.length} block definitions to ${outputPath}`);
    }

    // Save heightmap as simple 2D array
    saveHeightmap(outputPath) {
        console.log('Generating heightmap...');

        const heightmap = [];
        for (let y = 0; y < 256; y++) {
            heightmap[y] = [];
            for (let x = 0; x < 256; x++) {
                heightmap[y][x] = this.columns[y][x].height;
            }
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(heightmap));
        console.log(`Saved heightmap to ${outputPath}`);
    }

    // Save ground type map (2D array of ground types at surface)
    saveGroundTypeMap(outputPath) {
        console.log('Generating ground type map...');

        const groundMap = [];
        for (let y = 0; y < 256; y++) {
            groundMap[y] = [];
            for (let x = 0; x < 256; x++) {
                const column = this.columns[y][x];
                if (column.height > 0) {
                    const topBlockIndex = column.blockIndices[column.height - 1];
                    const block = this.blocks[topBlockIndex];
                    groundMap[y][x] = block ? block.groundType : 0;
                } else {
                    groundMap[y][x] = 0;
                }
            }
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(groundMap));
        console.log(`Saved ground type map to ${outputPath}`);
    }

    // Generate and save a simple ASCII preview of the map
    saveAsciiPreview(outputPath) {
        console.log('Generating ASCII preview...');

        const chars = {
            0: ' ', // air
            1: '~', // water
            2: '#', // road
            3: '.', // pavement
            4: ',', // field
            5: 'X', // building
            6: '?', // unused
            7: '?'  // unused
        };

        let ascii = '';
        // Sample every 4 tiles for a smaller preview
        for (let y = 0; y < 256; y += 4) {
            for (let x = 0; x < 256; x += 4) {
                const column = this.columns[y][x];
                if (column.height > 0) {
                    const topBlockIndex = column.blockIndices[column.height - 1];
                    const block = this.blocks[topBlockIndex];
                    ascii += chars[block ? block.groundType : 0];
                } else {
                    ascii += ' ';
                }
            }
            ascii += '\n';
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, ascii);
        console.log(`Saved ASCII preview to ${outputPath}`);
    }

    // Save object positions (vehicles and game objects)
    saveObjects(outputPath) {
        console.log('Saving object positions...');

        const objects = this.objects.map((obj, index) => ({
            id: index,
            x: obj.x,
            y: obj.y,
            z: obj.z,
            type: obj.type,
            remap: obj.remap,
            isVehicle: obj.isVehicle,
            rotation: obj.rotation,
            rotationDeg: Math.round((obj.rotation / 65535) * 360),
            pitch: obj.pitch,
            roll: obj.roll
        }));

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(objects, null, 2));

        const vehicles = objects.filter(o => o.isVehicle);
        const gameObjects = objects.filter(o => !o.isVehicle);
        console.log(`Saved ${objects.length} objects (${vehicles.length} vehicles, ${gameObjects.length} game objects) to ${outputPath}`);
    }

    // Save routes (traffic paths)
    saveRoutes(outputPath) {
        console.log('Saving routes...');

        const routes = this.routes.map((route, index) => ({
            id: index,
            waypoints: route.map(wp => ({
                x: wp.x,
                y: wp.y,
                z: wp.z,
                direction: wp.direction
            })),
            length: route.length
        }));

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(routes, null, 2));
        console.log(`Saved ${routes.length} routes to ${outputPath}`);
    }

    // Save full column data (for engine to rebuild 3D map)
    saveColumns(outputPath) {
        console.log('Saving column data...');

        // Save as compact format: array of { x, y, height, blocks: [blockIndex...] }
        const columns = [];
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const col = this.columns[y][x];
                if (col.height > 0) {
                    columns.push({
                        x,
                        y,
                        h: col.height,
                        b: col.blockIndices
                    });
                }
            }
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(columns));
        console.log(`Saved ${columns.length} columns to ${outputPath}`);
    }

    // Print summary to console
    printSummary() {
        console.log('\n=== Map Summary ===');
        console.log(`Style file: STYLE00${this.header.styleNumber}.G24`);
        console.log(`Version: ${this.header.versionCode}`);
        console.log(`Total blocks: ${this.stats.totalBlocks}`);
        console.log(`Max column height: ${this.stats.maxColumnHeight}`);
        console.log(`Avg column height: ${this.stats.avgColumnHeight}`);
        console.log(`Navigation zones: ${this.stats.navigationZones}`);
        console.log(`Object positions: ${this.stats.objectPositions}`);
        console.log('\nGround type distribution:');
        for (const [type, count] of Object.entries(this.stats.groundTypes)) {
            if (count > 0) {
                console.log(`  ${type}: ${count}`);
            }
        }
        if (this.navData.length > 0) {
            console.log('\nNeighborhoods/Zones:');
            for (const zone of this.navData.slice(0, 10)) {
                console.log(`  - ${zone.name} (${zone.x},${zone.y}) ${zone.width}x${zone.height}`);
            }
            if (this.navData.length > 10) {
                console.log(`  ... and ${this.navData.length - 10} more`);
            }
        }
    }
}
