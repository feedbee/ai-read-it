const { CreateOpenAIProvider } = require('./providers/openai.js');
const { CreateGoogleProvider } = require('./providers/google.js');
const { optimizeText, splitTextIntoChunks } = require('./helpers/split-text.js');
const Provider = require('./providers/provider.js');

/**
 * @type {AiReadIt}
 */
let aiReadItInstance;

/**
 * Initializes the AI Read It library with the provided API key.
 * @param {string|Object} apiKey - The API key for accessing the OpenAI service.
 * @param {string} [providerName] – Optional. TTS provider name: OpenAI or Google (default: OpenAI).
 * @param {string} [options] – Optional. Additional configuration options.
 * @param {string} [options.provider] – Optional. Additional configuration options for the provider.
 */
function init(apiKey, providerName, options = {}) {
    const provider = createProvider(providerName, apiKey, options.provider || {});
    aiReadItInstance = new AiReadIt(provider);
}

/**
 * Converts small text to speech using the OpenAI text-to-speech API. Limited to 4096 chars for OpenAI API and 5000 chars for Google.
 * @param {string} text - [Open AI, Google] The input text to be converted to speech.
 * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
 * @param {string} options.model - [Open AI, Google] The model to use for the conversion
 * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
 * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
 * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
 * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
 * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
 * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
 * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
 * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
 */
async function smallTextToSpeech(text, options) {
    return aiReadItInstance.smallTextToSpeech(text, options);
}

/**
 * Converts medium-sized text into speech by splitting it into chunks and using smallTextToSpeech function.
 * @param {string} text - [Open AI, Google] The input text to be converted to speech.
 * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
 * @param {string} options.model - [Open AI, Google] The model to use for the conversion
 * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
 * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
 * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
 * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
 * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
 * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
 * @returns {Promise<Buffer>} - A promise that resolves to the concatenated audio buffers of the converted text.
 */
async function mediumTextToSpeech(text, options) {
    return aiReadItInstance.mediumTextToSpeech(text, options);
}

/**
 * Converts a large text into speech by splitting it into smaller chunks and generating speech for each chunk.
 * @param {string} text - [Open AI, Google] The input text to be converted to speech.
 * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
 * @param {string} options.model - [Open AI, Google] The model to use for the conversion
 * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
 * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
 * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
 * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
 * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
 * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
 * @param {number} options.chunkSize - Set a maximum character limit for each text chunk processed (must be under the provider limit).
 * Note that smaller chunks lead to quicker initial responses, but increase the number of requests sent per minute to the OpenAI API.
 * @returns {AsyncGenerator} - An async generator that yields the speech for each chunk of the text.
 */
async function* largeTextToSpeech(text, options) {
    yield* aiReadItInstance.largeTextToSpeech(text, options);
}

/**
 * Returns the maximum itext input size the choosen provider supports
 * @returns {number} Maximum input length for the provider supports
 */
function maxInputLength() {
    return aiReadItInstance.maxInputLength();
}

/**
 * AIReadIt library object-oriented version
 */
class AiReadIt {
    /**
     * Library initialization. 
     * @param {Provider} provider
     */
    constructor(provider) {
        if (typeof provider !== 'object') {
            throw new Error('provider is not object');
        }
        this.provider = provider;
    }

    /**
     * Converts small text to speech using the OpenAI text-to-speech API. Limited to 4096 chars for OpenAI API and 5000 chars for Google.
     * @param {string} text - [Open AI, Google] The input text to be converted to speech.
     * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - [Open AI, Google] The model to use for the conversion
     * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
     * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
     * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
     * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
     * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
     * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
     * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
     * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
     */
    async smallTextToSpeech(text, options = {}) {
        text = optimizeText(text);

        return this.provider.textToSpeech(text, options);
    }

    /**
     * Converts medium-sized text into speech by splitting it into chunks and using smallTextToSpeech function.
     * @param {string} text - [Open AI, Google] The input text to be converted to speech.
     * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - [Open AI, Google] The model to use for the conversion
     * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
     * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
     * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
     * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
     * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
     * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
     * @returns {Promise<Buffer>} - A promise that resolves to the concatenated audio buffers of the converted text.
     */
    async mediumTextToSpeech(text, options = {}) {
        // Remove extra spaces
        text = optimizeText(text);

        // Split into chunks
        const chunks = splitTextIntoChunks(text, this.provider.maxInputLength);

        // For each chunk
        const buffers = [];
        for (const chunk of chunks) {
            buffers.push(await this.smallTextToSpeech(chunk, options));
        }
        return Buffer.concat(buffers);
    }

    /**
     * Converts a large text into speech by splitting it into smaller chunks and generating speech for each chunk.
     * @param {string} text - [Open AI, Google] The input text to be converted to speech.
     * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - [Open AI, Google] The model to use for the conversion
     * @param {string} options.language – [Google] The language-region code (BCP-47) for non-multilanguage models
     * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
     * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
     * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
     * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
     * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
     * @param {number} options.chunkSize - Set a maximum character limit for each text chunk processed (must be under the provider limit).
     * Note that smaller chunks lead to quicker initial responses, but increase the number of requests sent per minute to the OpenAI API.
     * @returns {AsyncGenerator} - An async generator that yields the speech for each chunk of the text.
     */
    async *largeTextToSpeech(text, options = {}) {
        // Remove extra spaces
        text = optimizeText(text);

        // Split into chunks
        let chunkSize = 'chunkSize' in options ? options.chunkSize : this.provider.maxInputLength;
        const chunks = splitTextIntoChunks(text, chunkSize);

        // For each chunk
        for (const chunk of chunks) {
            yield await this.smallTextToSpeech(chunk, options);
        }
    }

    /**
     * Returns the maximum itext input size the choosen provider supports
     * @returns {number} Maximum input length for the provider supports
     */
    maxInputLength() {
        return this.provider.maxInputLength;
    }
}

/**
 * Providers fabric for object-oriented version
 * 
 * @param {string} providerName 
 * @param {string|Object} apiKey 
 * @returns {Provider}
 */
function createProvider(providerName, apiKey, options = {}) {
    if (!providerName || providerName.toLocaleLowerCase() === 'openai') {
        return CreateOpenAIProvider(apiKey, options);
    } else if (providerName.toLocaleLowerCase() === 'google') {
        return CreateGoogleProvider(apiKey, options);
    } else {
        throw new Error('Unknown TTS provider: ' + providerName);
    }
}

// Export the init and textToSpeech functions
module.exports = { AiReadIt, createProvider, init, smallTextToSpeech, mediumTextToSpeech, largeTextToSpeech, maxInputLength };
