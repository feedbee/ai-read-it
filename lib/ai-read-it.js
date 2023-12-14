// lib/ai-read-it.js

const { OpenAI } = require('openai');

/**
 * @type OpenAI
 */
let openai;
const OPENAI_TTS_MAX_INPUT = 4096;

// Initialize the OpenAI instance with the provided API key
function init(apiKey) {
    openai = new OpenAI({ apiKey });
}

/**
 * Function to convert text to speech. Limited to 4096 chars as per OpenAI API
 * 
 * @param string text 
 * @param {*} options 
 * @returns 
 */
async function smallTextToSpeech(text, options = {}) {
    if (text.length > OPENAI_TTS_MAX_INPUT) {
        throw new Error(`Failed to convert text to speech: input text must be less of equal ${OPENAI_TTS_MAX_INPUT} characters`);
    }

    // Default values for options
    const {
        model = 'tts-1', // tts-1, tts-1-hd
        voice = 'fable', // alloy, echo, fable, onyx, nova, shimmer
        response_format = 'mp3', // mp3, opus, aac, flac
        speed = 1.0, // 0.25 .. 4.0
    } = options;

    try {
        // Request to the OpenAI text-to-speech API
        // https://platform.openai.com/docs/api-reference/audio/createSpeech#audio-createspeech-input
        const response = await openai.audio.speech.create({
            model: model,
            input: text,
            voice: voice,
            response_format: response_format,
            speed: speed,
        });

        // Return audio buffer
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        return audioBuffer;
    } catch (error) {
        throw new Error(`Failed to convert text to speech: ${error.message}`);
    }
}

/**
 * Function to convert text to speech, splitting into chunks that OpenAI API can handle.
 * This function operates the whole input and output, requirening a lot of memory to
 * hold and return the data.
 *
 * @param string text 
 * @param {*} options 
 * @returns 
 */
async function mediumTextToSpeechExtended(text, options = {}) {
    // Split into chunks
    const chunks = splitTextIntoChunks(text);

    // For each chunk
    const buffers = [];
    for (const chunk of chunks) {
        buffers.push(await smallTextToSpeech(chunk, options));
    }
    return Buffer.concat(buffers);
}

// Function to split text into chunks by sentences
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

function mergeArrayOfBuffers(bufferArray) {
    // Calculate the total length of all the buffers
    const totalLength = bufferArray.reduce((acc, buffer) => acc + buffer.byteLength, 0);

    // Create a new Uint8Array with the combined length
    const mergedArray = new Uint8Array(totalLength);

    // Use a counter to keep track of the current position in the mergedArray
    let offset = 0;

    // Copy the content of each buffer into the mergedArray
    bufferArray.forEach(buffer => {
        const array = new Uint8Array(buffer);
        mergedArray.set(array, offset);
        offset += array.length;
    });

    // Convert the merged Uint8Array back to an ArrayBuffer
    const mergedBuffer = mergedArray.buffer;

    return mergedBuffer;
}

// Export the init and textToSpeech functions
module.exports = { init, smallTextToSpeech, mediumTextToSpeechExtended };
