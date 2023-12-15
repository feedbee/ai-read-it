// lib/ai-read-it.js

const { OpenAI } = require('openai');
const { optimizeText, splitTextIntoChunks } = require('./split-text.js');

/**
 * @type OpenAI
 */
let openai;
const OPENAI_TTS_MAX_INPUT = 4096;

/**
 * Initializes the AI Read It library with the provided API key.
 * @param {string} apiKey - The API key for accessing the OpenAI service.
 */
function init(apiKey) {
    openai = new OpenAI({ apiKey });
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

    if (text.length > OPENAI_TTS_MAX_INPUT) {
        throw new Error(`Failed to convert text to speech: input text must be less or equal to ${OPENAI_TTS_MAX_INPUT} characters`);
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

// Export the init and textToSpeech functions
module.exports = { init, smallTextToSpeech, mediumTextToSpeech };
