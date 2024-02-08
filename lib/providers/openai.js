const { OpenAI } = require('openai');
const Provider = require('./provider.js');

const OPENAI_TTS_MAX_INPUT = 4096;

/**
 * Create OpenAI TTS Provider object
 * @param {string} apiKey [Optional] Open AI API key
 * @returns GoogleProvider
 */
const CreateOpenAIProvider = (apiKey) => {
    apiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('Neither apiKey was provided nor the environment variable "OPENAI_API_KEY" is set.');
    }
    return new OpenAIProvider({ apiKey });
};

class OpenAIProvider extends Provider {
    /**
     * Initializes the AI Read It Open AI provider with the provided API key.
     * @param {Object} options - Open AI provider configuration.
     * @param {string} options.apiKey - The API key for accessing the OpenAI service.
     */
    constructor(options) {
        super(options);
        if (!options.apiKey) {
            throw new Error(`Provider options must contain apiKey field with an appropriate Open AI API key`);
        }
        this.openai = new OpenAI(options);
    }

    /**
     * Returns the maximum itext input size the provider supports
     * @returns {number} Maximum input length for the provider supports
     */
    get maxInputLength() {
        return OPENAI_TTS_MAX_INPUT;
    }

    /**
     * Converts text to speech using the OpenAI text-to-speech API. Limited to 4096 chars as per OpenAI API.
     * @param {string} text - The input text to be converted to speech.
     * @param {Object} options - Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - The model to use for the conversion (default: 'tts-1').
     * @param {string} options.voice - The voice to use for the conversion (default: 'fable').
     * @param {string} options.response_format - The format of the response audio (default: 'mp3').
     * @param {number} options.speed - The speed of the speech (default: 1.0).
     * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
     * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
     */
    async textToSpeech(text, options = {}) {
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
            const response = await this.openai.audio.speech.create({
                model: model,
                input: text,
                voice: voice,
                response_format: response_format,
                speed: speed,
            });

            // Return audio buffer
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            throw new Error(`Failed to convert text to speech: ${error.message}`);
        }
    }
}

module.exports = { OpenAIProvider, CreateOpenAIProvider };
