class Provider {
    /**
     * Initializes the AI Read It provider.
     * @param {Object} options - AI Read It provider configuration.
     */
    constructor(options) {}

    /**
     * Converts text to speech using the pre-configured text-to-speech API. Limited to 4096 chars as per OpenAI API.
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
        throw new Error('textToSpeech method is not implemented in the adapter');
    }
}

module.exports = Provider;
