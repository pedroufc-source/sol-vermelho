/**
 * Mission Data Extractor
 * Exports GTA 1 mission data as JSON
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export class MissionExtractor {
    constructor(parser) {
        this.missions = parser.missions;
        this.stats = parser.getStats();
        this.parser = parser;
    }

    // Save all missions to a single JSON file
    saveAllMissions(outputPath) {
        console.log('Saving all missions...');

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(this.missions, null, 2));
        console.log(`Saved ${this.stats.totalMissions} missions to ${outputPath}`);
    }

    // Save mission summary/stats
    saveStats(outputPath) {
        console.log('Saving mission stats...');

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(this.stats, null, 2));
        console.log(`Saved mission stats to ${outputPath}`);
    }

    // Save individual mission files
    saveMissionsSeparately(outputDir) {
        console.log('Saving missions separately...');

        mkdirSync(outputDir, { recursive: true });

        for (const [id, mission] of Object.entries(this.missions)) {
            const fileName = `mission_${id}_${mission.name.replace(/\s+/g, '_').toLowerCase()}.json`;
            writeFileSync(
                join(outputDir, fileName),
                JSON.stringify(mission, null, 2)
            );
        }

        console.log(`Saved ${this.stats.totalMissions} mission files to ${outputDir}`);
    }

    // Save all telephones for a specific map/level
    saveTelephones(outputPath) {
        console.log('Extracting telephones...');

        const telephones = this.parser.getAllTelephones();

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(telephones, null, 2));
        console.log(`Saved ${telephones.length} telephones to ${outputPath}`);
    }

    // Save all parked vehicles
    saveParkedVehicles(outputPath) {
        console.log('Extracting parked vehicles...');

        const vehicles = this.parser.getAllParkedVehicles();

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));
        console.log(`Saved ${vehicles.length} parked vehicles to ${outputPath}`);
    }

    // Save all spray shops
    saveSprayShops(outputPath) {
        console.log('Extracting spray shops...');

        const shops = this.parser.getAllSprayShops();

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(shops, null, 2));
        console.log(`Saved ${shops.length} spray shops to ${outputPath}`);
    }

    // Save all bomb shops
    saveBombShops(outputPath) {
        console.log('Extracting bomb shops...');

        const shops = this.parser.getAllBombShops();

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(shops, null, 2));
        console.log(`Saved ${shops.length} bomb shops to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== Mission Summary ===');
        console.log(`Total missions: ${this.stats.totalMissions}`);
        console.log(`Total objects: ${this.stats.totalObjects}`);
        console.log(`Total actions: ${this.stats.totalActions}`);

        console.log('\nObject type counts:');
        const sorted = Object.entries(this.stats.objectTypes)
            .sort((a, b) => b[1] - a[1]);
        for (const [type, count] of sorted.slice(0, 15)) {
            console.log(`  ${type}: ${count}`);
        }
        if (sorted.length > 15) {
            console.log(`  ... and ${sorted.length - 15} more types`);
        }

        console.log('\nMissions by map:');
        const byMap = {};
        for (const m of this.stats.missionList) {
            const map = m.mapFile || 'UNKNOWN';
            if (!byMap[map]) byMap[map] = [];
            byMap[map].push(m);
        }
        for (const [map, missions] of Object.entries(byMap)) {
            console.log(`  ${map}: ${missions.length} missions`);
            for (const m of missions.slice(0, 3)) {
                console.log(`    - [${m.id}] ${m.name} (${m.objects} objects, ${m.actions} actions)`);
            }
            if (missions.length > 3) {
                console.log(`    ... and ${missions.length - 3} more`);
            }
        }
    }
}
