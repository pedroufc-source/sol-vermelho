/**
 * Binary Data Reader
 * Based on WebGL-GTA by Niklas von Hertzen (hertzen.com)
 * Modernized for ES6 modules
 */

export class BinaryReader {
    constructor(buffer, littleEndian = true) {
        this.buffer = buffer;
        this.dataView = new DataView(buffer);
        this.position = 0;
        this.littleEndian = littleEndian;
    }

    // Position control
    skip(bytes) {
        this.position += bytes;
    }

    seek(offset) {
        this.position = offset;
    }

    getPosition() {
        return this.position;
    }

    getLength() {
        return this.buffer.byteLength;
    }

    // Integer reads
    getInt8(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getInt8(pos);
        if (offset === undefined) this.position += 1;
        return value;
    }

    getInt16(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getInt16(pos, this.littleEndian);
        if (offset === undefined) this.position += 2;
        return value;
    }

    getInt32(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getInt32(pos, this.littleEndian);
        if (offset === undefined) this.position += 4;
        return value;
    }

    // Unsigned integer reads
    getUint8(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getUint8(pos);
        if (offset === undefined) this.position += 1;
        return value;
    }

    getUint16(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getUint16(pos, this.littleEndian);
        if (offset === undefined) this.position += 2;
        return value;
    }

    getUint32(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getUint32(pos, this.littleEndian);
        if (offset === undefined) this.position += 4;
        return value;
    }

    // Float reads
    // Note: GTA 1 uses 32-bit fixed point (16 bits after point) for floats
    // They are converted when loaded
    getFloat32(offset) {
        const pos = offset ?? this.position;
        const value = this.dataView.getFloat32(pos, this.littleEndian);
        if (offset === undefined) this.position += 4;
        return value;
    }

    // String read
    getString(length, offset) {
        const pos = offset ?? this.position;
        const bytes = new Uint8Array(this.buffer, pos, length);
        let str = '';
        for (let i = 0; i < length; i++) {
            if (bytes[i] === 0) break; // Null terminator
            str += String.fromCharCode(bytes[i]);
        }
        if (offset === undefined) this.position += length;
        return str;
    }

    // Raw bytes
    getBytes(length, offset) {
        const pos = offset ?? this.position;
        // Clamp length to available data
        const available = this.buffer.byteLength - pos;
        const actualLength = Math.min(length, Math.max(0, available));
        if (actualLength <= 0) {
            return new Uint8Array(0);
        }
        const bytes = new Uint8Array(this.buffer, pos, actualLength);
        if (offset === undefined) this.position += actualLength;
        return bytes;
    }

    // Bit operations
    isBitSet(bit, value) {
        return (value & (1 << bit)) !== 0;
    }
}
