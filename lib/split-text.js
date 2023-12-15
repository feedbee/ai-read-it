// lib/split-text.js

/**
 * Splits a given text into chunks of a maximum size.
 * If the text length is less than or equal to the maximum chunk size, the text is returned as a single chunk.
 * If the text length exceeds the maximum chunk size, it is split into chunks based on sentence boundaries.
 * If a sentence exceeds the maximum chunk size, it is split by length.
 * 
 * @param {string} text - The text to be split into chunks.
 * @param {number} [maxChunkSize=4096] - The maximum size of each chunk.
 * @returns {string[]} An array of text chunks.
 */
function splitTextIntoChunks(text, maxChunkSize = 4096) {
    if (text.length <= maxChunkSize) {
        return [text];
    }

    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];

    let currentChunk = '';
    for (var sentence of sentences) {
        while (sentence.length > maxChunkSize) {
            // TODO: split by words, but currently just hard split by length
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            chunks.push(sentence.substring(0, maxChunkSize));
            sentence = sentence.substring(maxChunkSize);
        }

        const potentialChunk = `${currentChunk} ${sentence}`.trim();
        if (potentialChunk.length <= maxChunkSize) {
            currentChunk = potentialChunk;
        } else {
            chunks.push(currentChunk);
            currentChunk = sentence;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

/**
 * Optimizes the given text by removing extra whitespace and trimming it.
 * 
 * @param {string} text - The text to be optimized.
 * @returns {string} The optimized text.
 */
function optimizeText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

// Export the init and textToSpeech functions
module.exports = { optimizeText, splitTextIntoChunks };
