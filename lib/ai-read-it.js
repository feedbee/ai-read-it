const OpenAIProvider = require('./providers/openai.js');
const { optimizeText, splitTextIntoChunks } = require('./split-text.js');

/**
 * @type OpenAIProvider
 */
let openaiProviderInstance;

/**
 * Initializes the AI Read It library with the provided API key.
 * @param {string} apiKey - The API key for accessing the OpenAI service.
 */
function init(apiKey) {
    openaiProviderInstance = new OpenAIProvider({ apiKey });
}

/**
 * Converts small text to speech using the OpenAI text-to-speech API. Limited to 4096 chars as per OpenAI API.
 * @param {string} text - The input text to be converted to speech.
 * @param {Object} options - Optional parameters for the text-to-speech conversion.
 * @param {string} options.model - The model to use for the conversion (default: 'tts-1').
 * @param {string} options.voice - The voice to use for the conversion (default: 'fable').
 * @param {string} options.response_format - The format of the response audio (default: 'mp3').
 * @param {number} options.speed - The speed of the speech (default: 1.0).
 * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
 * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
 */
async function smallTextToSpeech(text, options = {}) {
    text = optimizeText(text);

    return openaiProviderInstance.textToSpeech(text);
}

/**
 * Converts medium-sized text into speech by splitting it into chunks and using smallTextToSpeech function.
 * @param {string} text - The text to be converted into speech.
 * @param {Object} options - Optional parameters for the text-to-speech conversion.
 * @param {string} options.model - The model to use for the conversion (default: 'tts-1').
 * @param {string} options.voice - The voice to use for the conversion (default: 'fable').
 * @param {string} options.response_format - The format of the response audio (default: 'mp3').
 * @param {number} options.speed - The speed of the speech (default: 1.0).
 * @returns {Promise<Buffer>} - A promise that resolves to the concatenated audio buffers of the converted text.
 */
async function mediumTextToSpeech(text, options = {}) {
    // Remove extra spaces
    text = optimizeText(text);

    // Split into chunks
    const chunks = splitTextIntoChunks(text);

    // For each chunk
    const buffers = [];
    for (const chunk of chunks) {
        buffers.push(await smallTextToSpeech(chunk, options));
    }
    return Buffer.concat(buffers);
}

/**
 * Converts a large text into speech by splitting it into smaller chunks and generating speech for each chunk.
 * @param {string} text - The large text to convert into speech.
 * @param {Object} [options] - Optional parameters for text-to-speech conversion.
 * @param {string} options.model - The model to use for the conversion (default: 'tts-1').
 * @param {string} options.voice - The voice to use for the conversion (default: 'fable').
 * @param {string} options.response_format - The format of the response audio (default: 'mp3').
 * @param {number} options.speed - The speed of the speech (default: 1.0).
 * @param {number} options.chunkSize - Set a maximum character limit for each text chunk processed (up to 4096 characters).
 * Note that smaller chunks lead to quicker initial responses, but increase the number of requests sent per minute to the OpenAI API.
 * @returns {AsyncGenerator} - An async generator that yields the speech for each chunk of the text.
 */
async function* largeTextToSpeech(text, options = {}) {
    // Remove extra spaces
    text = optimizeText(text);

    // Split into chunks
    let chunkSize = 'chunkSize' in options ? options.chunkSize : 4096;
    const chunks = splitTextIntoChunks(text, chunkSize);

    // For each chunk
    for (const chunk of chunks) {
        yield await smallTextToSpeech(chunk, options);
    }
}

// Export the init and textToSpeech functions
module.exports = { init, smallTextToSpeech, mediumTextToSpeech, largeTextToSpeech };
