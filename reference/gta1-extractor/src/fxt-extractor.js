/**
 * FXT Text Extractor
 * Exports GTA 1 text strings as JSON
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class FXTExtractor {
    constructor(parser) {
        this.strings = parser.strings;
        this.stats = parser.getStats();
        this.parser = parser;
    }

    // Save all strings to JSON
    saveAllStrings(outputPath) {
        console.log('Saving all strings...');

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(this.strings, null, 2));
        console.log(`Saved ${this.stats.totalStrings} strings to ${outputPath}`);
    }

    // Save stats
    saveStats(outputPath) {
        console.log('Saving stats...');

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(this.stats, null, 2));
        console.log(`Saved stats to ${outputPath}`);
    }

    // Save as plain text (for easy reading)
    saveAsText(outputPath) {
        console.log('Saving as plain text...');

        let text = '# GTA 1 Game Text\n\n';

        // Sort by ID
        const sortedIds = Object.keys(this.strings)
            .map(id => parseInt(id, 10))
            .sort((a, b) => a - b);

        for (const id of sortedIds) {
            const str = this.strings[id.toString()];
            text += `[${id}]\n${str}\n\n`;
        }

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, text);
        console.log(`Saved text to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== FXT Summary ===');
        console.log(`Total strings: ${this.stats.totalStrings}`);
        console.log(`Total characters: ${this.stats.totalCharacters}`);

        console.log('\nStrings by ID range:');
        const sortedRanges = Object.entries(this.stats.byIdRange)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        for (const [range, count] of sortedRanges) {
            console.log(`  ${range}: ${count} strings`);
        }

        console.log(`\nLongest string: [${this.stats.longestString.id}] (${this.stats.longestString.length} chars)`);
        if (this.stats.longestString.preview) {
            console.log(`  "${this.stats.longestString.preview}..."`);
        }

        console.log('\nSample strings:');
        const sampleIds = ['2113', '2114', '2115', '1000', '1001'];
        for (const id of sampleIds) {
            if (this.strings[id]) {
                const text = this.strings[id].substring(0, 80);
                console.log(`  [${id}] ${text}${this.strings[id].length > 80 ? '...' : ''}`);
            }
        }
    }
}
