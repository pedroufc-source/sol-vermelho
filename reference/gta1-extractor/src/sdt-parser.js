/**
 * GTA 1 Audio Index Parser (.SDT)
 *
 * SDT files contain an index of sounds stored in matching .RAW files
 * Each entry is 12 bytes:
 *   - uint32: start offset in RAW file
 *   - uint32: length in bytes
 *   - uint32: sample rate (Hz)
 *
 * Audio is 8-bit mono PCM
 */

export class SDTParser {
    constructor(sdtBuffer, rawBuffer) {
        this.sdtBuffer = sdtBuffer;
        this.rawBuffer = rawBuffer;
        this.sounds = [];
    }

    parse() {
        console.log('Parsing SDT file...');
        console.log(`SDT size: ${this.sdtBuffer.length} bytes`);
        console.log(`RAW size: ${this.rawBuffer.length} bytes`);

        const sdtView = new DataView(
            this.sdtBuffer.buffer,
            this.sdtBuffer.byteOffset,
            this.sdtBuffer.byteLength
        );

        // Each entry is 12 bytes (3 x uint32)
        const numSounds = this.sdtBuffer.length / 12;

        console.log(`Found ${numSounds} sound entries`);

        for (let i = 0; i < numSounds; i++) {
            const offset = i * 12;

            const start = sdtView.getUint32(offset, true);      // Little endian
            const length = sdtView.getUint32(offset + 4, true);
            const sampleRate = sdtView.getUint32(offset + 8, true);

            // Validate
            if (start + length > this.rawBuffer.length) {
                console.warn(`Sound ${i}: Invalid range (${start}+${length} > ${this.rawBuffer.length})`);
                continue;
            }

            // Skip empty entries
            if (length === 0) {
                continue;
            }

            this.sounds.push({
                id: i,
                start,
                length,
                sampleRate,
                durationMs: Math.round((length / sampleRate) * 1000)
            });
        }

        console.log(`Parsed ${this.sounds.length} valid sounds`);
        return this.sounds;
    }

    // Get raw PCM data for a sound
    getRawPCM(soundIndex) {
        const sound = this.sounds.find(s => s.id === soundIndex);
        if (!sound) return null;

        return this.rawBuffer.slice(sound.start, sound.start + sound.length);
    }

    // Convert a sound to WAV format
    toWAV(soundIndex) {
        const sound = this.sounds.find(s => s.id === soundIndex);
        if (!sound) return null;

        const pcmData = this.getRawPCM(soundIndex);
        if (!pcmData) return null;

        return this.createWAV(pcmData, sound.sampleRate);
    }

    // Create WAV file from PCM data
    createWAV(pcmData, sampleRate) {
        const numChannels = 1;      // Mono
        const bitsPerSample = 8;    // 8-bit
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);

        // WAV header is 44 bytes
        const headerSize = 44;
        const dataSize = pcmData.length;
        const fileSize = headerSize + dataSize;

        const wavBuffer = Buffer.alloc(fileSize);

        // RIFF header
        wavBuffer.write('RIFF', 0);                          // ChunkID
        wavBuffer.writeUInt32LE(fileSize - 8, 4);            // ChunkSize
        wavBuffer.write('WAVE', 8);                          // Format

        // fmt subchunk
        wavBuffer.write('fmt ', 12);                         // Subchunk1ID
        wavBuffer.writeUInt32LE(16, 16);                     // Subchunk1Size (16 for PCM)
        wavBuffer.writeUInt16LE(1, 20);                      // AudioFormat (1 = PCM)
        wavBuffer.writeUInt16LE(numChannels, 22);            // NumChannels
        wavBuffer.writeUInt32LE(sampleRate, 24);             // SampleRate
        wavBuffer.writeUInt32LE(byteRate, 28);               // ByteRate
        wavBuffer.writeUInt16LE(blockAlign, 32);             // BlockAlign
        wavBuffer.writeUInt16LE(bitsPerSample, 34);          // BitsPerSample

        // data subchunk
        wavBuffer.write('data', 36);                         // Subchunk2ID
        wavBuffer.writeUInt32LE(dataSize, 40);               // Subchunk2Size

        // Copy PCM data
        pcmData.copy(wavBuffer, 44);

        return wavBuffer;
    }

    // Get statistics
    getStats() {
        if (this.sounds.length === 0) {
            return { totalSounds: 0 };
        }

        const sampleRates = {};
        let totalDuration = 0;
        let totalBytes = 0;
        let shortest = Infinity;
        let longest = 0;

        for (const sound of this.sounds) {
            sampleRates[sound.sampleRate] = (sampleRates[sound.sampleRate] || 0) + 1;
            totalDuration += sound.durationMs;
            totalBytes += sound.length;

            if (sound.durationMs < shortest) shortest = sound.durationMs;
            if (sound.durationMs > longest) longest = sound.durationMs;
        }

        return {
            totalSounds: this.sounds.length,
            totalBytes,
            totalDurationMs: totalDuration,
            totalDurationFormatted: this.formatDuration(totalDuration),
            averageDurationMs: Math.round(totalDuration / this.sounds.length),
            shortestMs: shortest,
            longestMs: longest,
            sampleRates
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
}
