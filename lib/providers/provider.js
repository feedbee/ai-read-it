class Provider {
    /**
     * Initializes the AI Read It provider.
     * @param {Object} options - AI Read It provider configuration.
     */
    constructor(options) {}

    /**
     * Returns the maximum itext input size the provider supports
     * @returns {number} Maximum input length for the provider supports
     */
    get maxInputLength() {
        return 0;
    }

    /**
     * Converts text to speech using the pre-configured text-to-speech API.
     * Supported options may defer based on the provider.
     * @param {string} text - [Open AI, Google] The input text to be converted to speech.
     * @param {Object} options - [Open AI, Google] Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - [Open AI, Google] The model to use for the conversion
     * @param {string} options.voice - [Open AI, Google] The voice to use for the conversion.
     * @param {string} options.response_format - [Open AI, Google] The format of the response audio (default: 'mp3').
     * @param {number} options.speed - [Open AI, Google] The speed of the speech (defaut: 1).
     * @param {number} options.pitch - [Google] Speaking pitch (default: 0).
     * @param {boolean} options.is_ssml – [Google] Is the input text in SSML format (default: false).
     * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
     * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
     */
    async textToSpeech(text, options = {}) {
        throw new Error('textToSpeech method is not implemented in the adapter');
    }
}

module.exports = Provider;
