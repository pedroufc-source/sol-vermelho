#!/usr/bin/env node

/**
 * GTA 1 Asset Extractor CLI
 *
 * Usage:
 *   node extract.js <file> [options]
 *
 * Supports:
 *   - .G24 files (sprites, vehicles, palettes)
 *   - .CMP files (maps, zones, terrain)
 *   - .INI files (missions)
 *
 * Examples:
 *   node extract.js ../../assets/gta1/STYLE001.G24 -o ./output
 *   node extract.js ../../assets/gta1/NYC.CMP -o ./output
 *   node extract.js ../../assets/gta1/MISSION.INI -o ./output
 */

import { readFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { program } from 'commander';

import { G24Parser } from './src/g24-parser.js';
import { VehicleExtractor } from './src/vehicle-extractor.js';
import { SpriteExtractor } from './src/sprite-extractor.js';
import { CMPParser } from './src/cmp-parser.js';
import { MapExtractor } from './src/map-extractor.js';
import { MissionParser } from './src/mission-parser.js';
import { MissionExtractor } from './src/mission-extractor.js';
import { FXTParser } from './src/fxt-parser.js';
import { FXTExtractor } from './src/fxt-extractor.js';
import { SDTParser } from './src/sdt-parser.js';
import { AudioExtractor } from './src/audio-extractor.js';
import { FONParser } from './src/fon-parser.js';
import { FONExtractor } from './src/fon-extractor.js';
import { CUTParser } from './src/cut-parser.js';
import { CUTExtractor } from './src/cut-extractor.js';
import { REPParser } from './src/rep-parser.js';
import { REPExtractor } from './src/rep-extractor.js';

program
    .name('gta1-extractor')
    .description('Extracts assets from GTA 1 .G24, .CMP, .INI, .FXT, .SDT, .FON, .ACT, .RAT, and .REP files')
    .version('1.7.0')
    .argument('<file>', 'G24, CMP, INI, FXT, SDT, FON, ACT, RAT, or REP file to extract')
    .option('-o, --output <dir>', 'Output directory', './output')
    .option('--vehicles-only', 'Extract only vehicle data (G24)')
    .option('--sprites-only', 'Extract only sprites (G24)')
    .option('--atlas-only', 'Extract only sprite atlas (G24)')
    .option('--info-only', 'Extract only info (no images)')
    .option('--compare', 'Print vehicle comparison table (G24)')
    .option('--zones-only', 'Extract only zone data (CMP)')
    .option('--heightmap', 'Generate heightmap (CMP)')
    .option('--separate', 'Save missions separately (INI)')
    .parse();

const options = program.opts();
const [inputFile] = program.args;

async function extractG24(arrayBuffer, outputDir) {
    // Parse G24
    const parser = new G24Parser(arrayBuffer);
    const data = parser.parse();

    // Vehicle extraction
    if (!options.spritesOnly && !options.atlasOnly) {
        const vehicleExtractor = new VehicleExtractor(data);

        if (options.compare) {
            vehicleExtractor.printComparison();
        }

        if (!options.infoOnly) {
            vehicleExtractor.save(join(outputDir, 'vehicles.json'));
        }
    }

    // Sprite extraction
    if (!options.vehiclesOnly) {
        const spriteExtractor = new SpriteExtractor(data);

        // Always generate sprite info
        spriteExtractor.generateSpriteInfo(join(outputDir, 'sprites.json'));

        // Always save game objects (boxes, lamps, phone booths, etc.)
        spriteExtractor.saveGameObjects(join(outputDir, 'game-objects.json'));

        if (!options.infoOnly) {
            // Create sprite atlas
            spriteExtractor.createSpriteAtlas(join(outputDir, 'sprite-atlas.png'));

            // Extract individual sprites (unless atlas-only)
            if (!options.atlasOnly) {
                spriteExtractor.extractByType(join(outputDir, 'sprites'));
            }
        }
    }
}

async function extractCMP(arrayBuffer, outputDir) {
    // Parse CMP
    const parser = new CMPParser(arrayBuffer);
    const data = parser.parse();

    const extractor = new MapExtractor(data);

    // Print summary
    extractor.printSummary();

    // Save map info
    extractor.saveMapData(join(outputDir, 'map-info.json'));

    // Save zones
    extractor.saveZones(join(outputDir, 'zones.json'));

    // Always save object positions (vehicles and objects in the world)
    extractor.saveObjects(join(outputDir, 'objects.json'));

    // Always save routes (traffic paths)
    extractor.saveRoutes(join(outputDir, 'routes.json'));

    if (!options.zonesOnly) {
        // Save block definitions
        extractor.saveBlocks(join(outputDir, 'blocks.json'));

        // Save column data (full 3D map structure)
        extractor.saveColumns(join(outputDir, 'columns.json'));

        // Save ASCII preview
        extractor.saveAsciiPreview(join(outputDir, 'preview.txt'));

        if (options.heightmap) {
            extractor.saveHeightmap(join(outputDir, 'heightmap.json'));
            extractor.saveGroundTypeMap(join(outputDir, 'ground-types.json'));
        }
    }
}

async function extractINI(text, outputDir) {
    // Parse MISSION.INI
    const parser = new MissionParser(text);
    parser.parse();

    const extractor = new MissionExtractor(parser);

    // Print summary
    extractor.printSummary();

    // Save stats
    extractor.saveStats(join(outputDir, 'mission-stats.json'));

    // Save all missions
    extractor.saveAllMissions(join(outputDir, 'missions.json'));

    // Save extracted data
    extractor.saveTelephones(join(outputDir, 'telephones.json'));
    extractor.saveParkedVehicles(join(outputDir, 'parked-vehicles.json'));
    extractor.saveSprayShops(join(outputDir, 'spray-shops.json'));
    extractor.saveBombShops(join(outputDir, 'bomb-shops.json'));

    // Optionally save missions separately
    if (options.separate) {
        extractor.saveMissionsSeparately(join(outputDir, 'missions'));
    }
}

async function extractFXT(buffer, outputDir) {
    // Parse FXT
    const parser = new FXTParser(buffer);
    parser.parse();

    const extractor = new FXTExtractor(parser);

    // Print summary
    extractor.printSummary();

    // Save all data
    extractor.saveAllStrings(join(outputDir, 'strings.json'));
    extractor.saveStats(join(outputDir, 'stats.json'));
    extractor.saveAsText(join(outputDir, 'strings.txt'));
}

async function extractSDT(sdtBuffer, rawBuffer, outputDir, sourceName) {
    // Parse SDT
    const parser = new SDTParser(sdtBuffer, rawBuffer);
    parser.parse();

    const extractor = new AudioExtractor(parser, sourceName);

    // Print summary
    extractor.printSummary();

    // Save all WAV files
    extractor.saveAllWAV(join(outputDir, 'wav'));

    // Save metadata
    extractor.saveMetadata(join(outputDir, 'audio-metadata.json'));
}

async function extractFON(buffer, outputDir, sourceName) {
    // Parse FON
    const parser = new FONParser(buffer);
    parser.parse();

    const extractor = new FONExtractor(parser, sourceName);

    // Print summary
    extractor.printSummary();

    // Create sprite sheet
    extractor.createSpriteSheet(join(outputDir, 'font-atlas.png'));

    // Create raw visualization for debugging
    extractor.createRawVisualization(join(outputDir, 'font-raw.png'));

    // Save metadata
    extractor.saveMetadata(join(outputDir, 'font-metadata.json'));
}

async function extractCUT(actBuffer, ratBuffer, rawBuffer, outputDir, sourceName) {
    // Parse cutscene
    const parser = new CUTParser(actBuffer, ratBuffer, rawBuffer);
    parser.parse();

    const extractor = new CUTExtractor(parser, sourceName);

    // Print summary
    extractor.printSummary();

    // Save indexed image (using palette)
    extractor.saveIndexedImage(join(outputDir, 'cutscene.png'));

    // Save RAW as separate image if it's RGB
    extractor.saveRAWImage(join(outputDir, 'cutscene-raw.png'));

    // Save palette visualization
    extractor.savePaletteImage(join(outputDir, 'palette.png'));

    // Save metadata
    extractor.saveMetadata(join(outputDir, 'cutscene-metadata.json'));
}

async function extractREP(buffer, outputDir, sourceName) {
    // Parse replay
    const parser = new REPParser(buffer);
    parser.parse();

    const extractor = new REPExtractor(parser, sourceName);

    // Print summary
    extractor.printSummary();

    // Save all records
    extractor.saveAllRecords(join(outputDir, 'records.json'));

    // Save stats
    extractor.saveStats(join(outputDir, 'stats.json'));

    // Save timeline
    extractor.saveTimeline(join(outputDir, 'timeline.txt'));
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║     GTA 1 Asset Extractor v1.6.0      ║');
    console.log('║  Based on WebGL-GTA by Niklas Hertzen ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log();

    // Detect file type
    const ext = extname(inputFile).toUpperCase();

    // Read input file
    console.log(`Reading: ${inputFile}`);
    const buffer = readFileSync(inputFile);

    // Get output name from input file
    const fileName = basename(inputFile, ext).toLowerCase();
    const outputDir = join(options.output, fileName);

    console.log(`Output directory: ${outputDir}`);
    console.log();

    if (ext === '.G24') {
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        await extractG24(arrayBuffer, outputDir);
    } else if (ext === '.CMP') {
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        await extractCMP(arrayBuffer, outputDir);
    } else if (ext === '.INI') {
        const text = buffer.toString('utf-8');
        await extractINI(text, outputDir);
    } else if (ext === '.FXT') {
        await extractFXT(buffer, outputDir);
    } else if (ext === '.SDT') {
        // SDT requires matching RAW file
        const rawPath = inputFile.replace(/\.SDT$/i, '.RAW');
        console.log(`Looking for RAW file: ${rawPath}`);

        try {
            const rawBuffer = readFileSync(rawPath);
            await extractSDT(buffer, rawBuffer, outputDir, fileName);
        } catch (err) {
            console.error(`Error: Could not find matching RAW file at ${rawPath}`);
            console.error('SDT files require a matching .RAW file in the same directory');
            process.exit(1);
        }
    } else if (ext === '.FON') {
        await extractFON(buffer, outputDir, fileName);
    } else if (ext === '.ACT') {
        // ACT requires matching RAT and optionally RAW file
        const ratPath = inputFile.replace(/\.ACT$/i, '.RAT');
        const rawPath = inputFile.replace(/\.ACT$/i, '.RAW');
        console.log(`Looking for RAT file: ${ratPath}`);
        console.log(`Looking for RAW file: ${rawPath}`);

        try {
            const ratBuffer = readFileSync(ratPath);
            let rawBuffer = null;
            try {
                rawBuffer = readFileSync(rawPath);
            } catch (e) {
                console.log('RAW file not found (optional)');
            }
            await extractCUT(buffer, ratBuffer, rawBuffer, outputDir, fileName);
        } catch (err) {
            console.error(`Error: Could not find matching RAT file at ${ratPath}`);
            console.error('ACT files require a matching .RAT file in the same directory');
            process.exit(1);
        }
    } else if (ext === '.RAT') {
        // RAT can use either matching ACT or shared F_PAL.RAW palette
        const actPath = inputFile.replace(/\.RAT$/i, '.ACT');
        const rawPath = inputFile.replace(/\.RAT$/i, '.RAW');
        const palPath = join(inputFile, '..', 'F_PAL.RAW');
        console.log(`Looking for palette: ${actPath} or ${palPath}`);
        console.log(`Looking for RAW file: ${rawPath}`);

        let palBuffer;
        try {
            palBuffer = readFileSync(actPath);
            console.log('Using ACT palette');
        } catch (e) {
            try {
                palBuffer = readFileSync(palPath);
                console.log('Using shared F_PAL.RAW palette');
            } catch (e2) {
                console.error('Error: Could not find palette file (ACT or F_PAL.RAW)');
                process.exit(1);
            }
        }

        let rawBuffer = null;
        try {
            rawBuffer = readFileSync(rawPath);
        } catch (e) {
            console.log('RAW file not found (optional)');
        }

        await extractCUT(palBuffer, buffer, rawBuffer, outputDir, fileName);
    } else if (ext === '.REP') {
        await extractREP(buffer, outputDir, fileName);
    } else {
        console.error(`Unknown file type: ${ext}`);
        console.error('Supported formats: .G24 (styles), .CMP (maps), .INI (missions), .FXT (text), .SDT (audio), .FON (fonts), .ACT/.RAT (cutscenes/images), .REP (replays)');
        process.exit(1);
    }

    console.log('\n✓ Extraction complete!');
}

main().catch(err => {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
