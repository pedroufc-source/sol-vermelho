/**
 * GTA 1 Replay File Parser (.REP)
 *
 * REP files contain recorded gameplay input sequences.
 * Format: sequence of 8-byte records
 *   - uint32: frame/tick number
 *   - uint32: input flags/commands
 *
 * Input flags appear to encode:
 *   - Movement direction
 *   - Action buttons (fire, enter vehicle, etc.)
 *   - Camera/view controls
 */

// Possible input flag bits (based on observation)
const INPUT_FLAGS = {
    UP:         0x0001,
    DOWN:       0x0002,
    LEFT:       0x0004,
    RIGHT:      0x0008,
    FIRE:       0x0010,
    ENTER:      0x0020,
    JUMP:       0x0040,
    SPECIAL:    0x0080,
    CAMERA_L:   0x0100,
    CAMERA_R:   0x0200,
    BRAKE:      0x0400,
    HANDBRAKE:  0x0800,
    // Higher bits may encode analog values or combinations
};

export class REPParser {
    constructor(buffer) {
        this.buffer = buffer;
        this.records = [];
    }

    parse() {
        console.log('Parsing REP file...');
        console.log(`File size: ${this.buffer.length} bytes`);

        const view = new DataView(
            this.buffer.buffer,
            this.buffer.byteOffset,
            this.buffer.byteLength
        );

        // Each record is 8 bytes
        const recordSize = 8;
        const numRecords = Math.floor(this.buffer.length / recordSize);

        console.log(`Found ${numRecords} input records`);

        for (let i = 0; i < numRecords; i++) {
            const offset = i * recordSize;

            const frame = view.getUint32(offset, true);       // Little endian
            const input = view.getUint32(offset + 4, true);

            this.records.push({
                frame,
                input,
                inputHex: '0x' + input.toString(16).padStart(8, '0'),
                decoded: this.decodeInput(input)
            });
        }

        console.log(`Parsed ${this.records.length} records`);
        return this.records;
    }

    // Try to decode input flags
    decodeInput(input) {
        const flags = [];

        // Check common flag bits
        if (input & INPUT_FLAGS.UP) flags.push('UP');
        if (input & INPUT_FLAGS.DOWN) flags.push('DOWN');
        if (input & INPUT_FLAGS.LEFT) flags.push('LEFT');
        if (input & INPUT_FLAGS.RIGHT) flags.push('RIGHT');
        if (input & INPUT_FLAGS.FIRE) flags.push('FIRE');
        if (input & INPUT_FLAGS.ENTER) flags.push('ENTER');
        if (input & INPUT_FLAGS.JUMP) flags.push('JUMP');
        if (input & INPUT_FLAGS.SPECIAL) flags.push('SPECIAL');
        if (input & INPUT_FLAGS.CAMERA_L) flags.push('CAM_L');
        if (input & INPUT_FLAGS.CAMERA_R) flags.push('CAM_R');
        if (input & INPUT_FLAGS.BRAKE) flags.push('BRAKE');
        if (input & INPUT_FLAGS.HANDBRAKE) flags.push('HANDBRAKE');

        // Check for high byte values (might be analog or special commands)
        const highByte = (input >> 16) & 0xFFFF;
        if (highByte > 0) {
            flags.push(`HIGH:0x${highByte.toString(16)}`);
        }

        return flags;
    }

    // Get statistics
    getStats() {
        if (this.records.length === 0) {
            return { totalRecords: 0 };
        }

        const frames = this.records.map(r => r.frame);
        const uniqueInputs = new Set(this.records.map(r => r.input));

        // Count input frequency
        const inputCounts = {};
        for (const r of this.records) {
            inputCounts[r.inputHex] = (inputCounts[r.inputHex] || 0) + 1;
        }

        // Get most common inputs
        const sortedInputs = Object.entries(inputCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            totalRecords: this.records.length,
            totalFrames: Math.max(...frames) - Math.min(...frames),
            firstFrame: Math.min(...frames),
            lastFrame: Math.max(...frames),
            uniqueInputs: uniqueInputs.size,
            durationEstimate: `${(Math.max(...frames) / 30).toFixed(1)}s @ 30fps`,
            mostCommonInputs: sortedInputs.map(([hex, count]) => ({ hex, count }))
        };
    }

    // Get a summary of movements
    getMovementSummary() {
        const directions = { UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 };
        const actions = { FIRE: 0, ENTER: 0, JUMP: 0, BRAKE: 0 };

        for (const r of this.records) {
            if (r.input & INPUT_FLAGS.UP) directions.UP++;
            if (r.input & INPUT_FLAGS.DOWN) directions.DOWN++;
            if (r.input & INPUT_FLAGS.LEFT) directions.LEFT++;
            if (r.input & INPUT_FLAGS.RIGHT) directions.RIGHT++;
            if (r.input & INPUT_FLAGS.FIRE) actions.FIRE++;
            if (r.input & INPUT_FLAGS.ENTER) actions.ENTER++;
            if (r.input & INPUT_FLAGS.JUMP) actions.JUMP++;
            if (r.input & INPUT_FLAGS.BRAKE) actions.BRAKE++;
        }

        return { directions, actions };
    }
}
