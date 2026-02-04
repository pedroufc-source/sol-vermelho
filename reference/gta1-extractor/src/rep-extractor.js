/**
 * GTA 1 Replay Extractor
 * Exports replay data as JSON
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class REPExtractor {
    constructor(parser, sourceName) {
        this.parser = parser;
        this.records = parser.records;
        this.sourceName = sourceName || 'replay';
        this.stats = parser.getStats();
    }

    // Save all records
    saveAllRecords(outputPath) {
        console.log('Saving replay records...');

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(this.records, null, 2));
        console.log(`Saved ${this.records.length} records to ${outputPath}`);
    }

    // Save stats and summary
    saveStats(outputPath) {
        console.log('Saving replay stats...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const data = {
            source: this.sourceName,
            stats: this.stats,
            movement: this.parser.getMovementSummary()
        };

        writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved stats to ${outputPath}`);
    }

    // Save as simple text timeline
    saveTimeline(outputPath) {
        console.log('Saving timeline...');

        mkdirSync(dirname(outputPath), { recursive: true });

        let text = `Replay: ${this.sourceName}\n`;
        text += `Records: ${this.records.length}\n`;
        text += `Duration: ${this.stats.durationEstimate}\n`;
        text += `\n--- Timeline ---\n\n`;

        for (const r of this.records) {
            const flags = r.decoded.length > 0 ? r.decoded.join('+') : 'NONE';
            text += `Frame ${String(r.frame).padStart(6)}: ${flags}\n`;
        }

        writeFileSync(outputPath, text);
        console.log(`Saved timeline to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== Replay Summary ===');
        console.log(`Source: ${this.sourceName}`);
        console.log(`Total records: ${this.stats.totalRecords}`);
        console.log(`Frame range: ${this.stats.firstFrame} - ${this.stats.lastFrame}`);
        console.log(`Duration: ${this.stats.durationEstimate}`);
        console.log(`Unique input states: ${this.stats.uniqueInputs}`);

        console.log('\nMost common inputs:');
        for (const { hex, count } of this.stats.mostCommonInputs.slice(0, 5)) {
            console.log(`  ${hex}: ${count} times`);
        }

        const movement = this.parser.getMovementSummary();
        console.log('\nMovement summary:');
        console.log(`  UP: ${movement.directions.UP}, DOWN: ${movement.directions.DOWN}`);
        console.log(`  LEFT: ${movement.directions.LEFT}, RIGHT: ${movement.directions.RIGHT}`);
        console.log('\nAction summary:');
        console.log(`  FIRE: ${movement.actions.FIRE}, ENTER: ${movement.actions.ENTER}`);
        console.log(`  JUMP: ${movement.actions.JUMP}, BRAKE: ${movement.actions.BRAKE}`);
    }
}
