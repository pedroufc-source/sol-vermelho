/**
 * GTA 1 Text File Parser (.FXT)
 *
 * FXT files contain game text strings with:
 * - Caesar cipher encoding (shift of -1)
 * - String IDs prefixed with control codes
 * - Newlines as string separators
 */

export class FXTParser {
    constructor(buffer) {
        this.buffer = buffer;
        this.strings = {};
    }

    parse() {
        console.log('Parsing FXT file...');
        console.log(`File size: ${this.buffer.length} bytes`);

        // Convert buffer to string (keeping raw bytes for decoding)
        const rawText = this.buffer.toString('latin1');

        // FXT format: \x01\<ID>^<text>
        // Where \x01\ is the literal bytes 0x01 0x5C
        // ID is decimal digits
        // ^ separates ID from text

        let currentId = null;
        let currentText = '';

        for (let i = 0; i < rawText.length; i++) {
            const charCode = rawText.charCodeAt(i);

            // Check for string start marker: 0x01 followed by backslash
            if (charCode === 0x01 && i + 1 < rawText.length && rawText.charCodeAt(i + 1) === 0x5C) {
                // Save previous string if we have one
                if (currentId !== null && currentText.length > 0) {
                    this.strings[currentId] = this.decodeText(currentText.trim());
                }

                // Skip the 0x01\
                i += 2;

                // Read ID digits
                let idStr = '';
                while (i < rawText.length && rawText[i] >= '0' && rawText[i] <= '9') {
                    idStr += rawText[i];
                    i++;
                }

                if (idStr.length > 0) {
                    currentId = idStr;
                    currentText = '';

                    // Skip the ^ separator if present
                    if (i < rawText.length && rawText[i] === '^') {
                        i++;
                    }
                    i--; // Back up since loop will increment
                }
                continue;
            }

            // Accumulate text
            if (currentId !== null) {
                currentText += rawText[i];
            } else if (i >= 8) {
                // Before first ID, after header, capture intro text as ID 0
                if (!this.strings['0']) {
                    this.strings['0'] = '';
                }
                // Don't include control characters
                if (charCode >= 0x20) {
                    this.strings['0'] += rawText[i];
                }
            }
        }

        // Save last string
        if (currentId !== null && currentText.length > 0) {
            this.strings[currentId] = this.decodeText(currentText.trim());
        }

        // Decode the intro text if present
        if (this.strings['0']) {
            this.strings['0'] = this.decodeText(this.strings['0'].trim());
        }

        console.log(`Parsed ${Object.keys(this.strings).length} strings`);
        return this.strings;
    }

    // Decode text using Caesar cipher (shift -1)
    decodeText(text) {
        let decoded = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);

            // Only decode printable ASCII characters (space to ~)
            if (charCode >= 0x20 && charCode <= 0x7E) {
                // Shift down by 1, wrapping space to tilde
                if (charCode === 0x20) {
                    decoded += String.fromCharCode(0x7E); // space becomes ~
                } else if (charCode === 0x21) {
                    decoded += ' '; // ! becomes space
                } else {
                    decoded += String.fromCharCode(charCode - 1);
                }
            } else if (charCode === 0x0D || charCode === 0x0A) {
                // Keep newlines
                decoded += text[i];
            } else {
                // Keep other characters as-is
                decoded += text[i];
            }
        }
        return decoded;
    }

    // Get statistics
    getStats() {
        const stats = {
            totalStrings: Object.keys(this.strings).length,
            byIdRange: {},
            totalCharacters: 0,
            longestString: { id: null, length: 0 },
            shortestString: { id: null, length: Infinity }
        };

        for (const [id, text] of Object.entries(this.strings)) {
            const len = text.length;
            stats.totalCharacters += len;

            if (len > stats.longestString.length) {
                stats.longestString = { id, length: len, preview: text.substring(0, 100) };
            }
            if (len < stats.shortestString.length && len > 0) {
                stats.shortestString = { id, length: len, text };
            }

            // Group by ID range
            const idNum = parseInt(id, 10);
            const range = Math.floor(idNum / 1000) * 1000;
            const rangeKey = `${range}-${range + 999}`;
            stats.byIdRange[rangeKey] = (stats.byIdRange[rangeKey] || 0) + 1;
        }

        return stats;
    }

    // Search strings
    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const [id, text] of Object.entries(this.strings)) {
            if (text.toLowerCase().includes(lowerQuery)) {
                results.push({ id, text });
            }
        }

        return results;
    }

    // Get strings by ID range
    getRange(start, end) {
        const results = {};
        for (const [id, text] of Object.entries(this.strings)) {
            const idNum = parseInt(id, 10);
            if (idNum >= start && idNum <= end) {
                results[id] = text;
            }
        }
        return results;
    }
}
