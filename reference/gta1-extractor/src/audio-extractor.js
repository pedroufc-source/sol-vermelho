/**
 * GTA 1 Audio Extractor
 * Exports sounds as WAV files
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export class AudioExtractor {
    constructor(parser, sourceName) {
        this.parser = parser;
        this.sounds = parser.sounds;
        this.stats = parser.getStats();
        this.sourceName = sourceName || 'audio';
    }

    // Save all sounds as WAV files
    saveAllWAV(outputDir) {
        console.log('Extracting sounds as WAV files...');

        mkdirSync(outputDir, { recursive: true });

        let savedCount = 0;
        for (const sound of this.sounds) {
            const wavBuffer = this.parser.toWAV(sound.id);
            if (wavBuffer) {
                const fileName = `${this.sourceName}_${String(sound.id).padStart(4, '0')}.wav`;
                writeFileSync(join(outputDir, fileName), wavBuffer);
                savedCount++;
            }
        }

        console.log(`Saved ${savedCount} WAV files to ${outputDir}`);
    }

    // Save sound metadata
    saveMetadata(outputPath) {
        console.log('Saving audio metadata...');

        mkdirSync(dirname(outputPath), { recursive: true });

        const metadata = {
            source: this.sourceName,
            stats: this.stats,
            sounds: this.sounds.map(s => ({
                id: s.id,
                sampleRate: s.sampleRate,
                durationMs: s.durationMs,
                sizeBytes: s.length,
                fileName: `${this.sourceName}_${String(s.id).padStart(4, '0')}.wav`
            }))
        };

        writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
        console.log(`Saved metadata to ${outputPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n=== Audio Summary ===');
        console.log(`Source: ${this.sourceName}`);
        console.log(`Total sounds: ${this.stats.totalSounds}`);
        console.log(`Total size: ${(this.stats.totalBytes / 1024).toFixed(1)} KB`);
        console.log(`Total duration: ${this.stats.totalDurationFormatted}`);
        console.log(`Average duration: ${this.stats.averageDurationMs} ms`);
        console.log(`Shortest: ${this.stats.shortestMs} ms`);
        console.log(`Longest: ${this.stats.longestMs} ms`);

        console.log('\nSample rates:');
        for (const [rate, count] of Object.entries(this.stats.sampleRates)) {
            console.log(`  ${rate} Hz: ${count} sounds`);
        }

        // Show first few sounds as preview
        console.log('\nPreview (first 10):');
        for (const sound of this.sounds.slice(0, 10)) {
            console.log(`  #${sound.id}: ${sound.durationMs}ms @ ${sound.sampleRate}Hz (${sound.length} bytes)`);
        }
        if (this.sounds.length > 10) {
            console.log(`  ... and ${this.sounds.length - 10} more`);
        }
    }
}
