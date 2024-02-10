const textToSpeech = require('@google-cloud/text-to-speech');
const Provider = require('./provider.js');

const GOOGLE_TTS_MAX_INPUT = 5000;

/**
 * Create Google TTS Provider object
 * @param {string|Object} apiKey Optional, the JSON string that represents Google Service Account auth key
 * @returns GoogleProvider
 */
const CreateGoogleProvider = (apiKey) => {
    const serviceAccountKeyJson = apiKey || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!serviceAccountKeyJson) {
        throw new Error('Neither apiKey was provided nor the environment variable "GOOGLE_APPLICATION_CREDENTIALS_JSON" is set.');
    }
    const serviceAccount = typeof serviceAccountKeyJson === 'string' ? JSON.parse(serviceAccountKeyJson) : serviceAccountKeyJson;
    return new GoogleProvider({
        credentials: serviceAccount,
    });
};

class GoogleProvider extends Provider {
    /**
     * Initializes the AI Read It Google TTS provider with the provided API key.
     * @param {Object} options - Google TTS provider configuration.
     * @param {string} options.credentials - GCP service account API credentials object
     */
    constructor(options) {
        super(options);
        if (!options.credentials) {
            throw new Error(`Provider options must contain credentials field with an appropriate GCP auth credentials obejct`);
        }
        this.googleTtsClient = new textToSpeech.TextToSpeechClient(options);
    }

    /**
     * Returns the maximum itext input size the provider supports
     * @returns {number} Maximum input length for the provider supports
     */
    get maxInputLength() {
        return GOOGLE_TTS_MAX_INPUT;
    }

    /**
     * Converts text to speech using the OpenAI text-to-speech API. Limited to 4096 chars as per OpenAI API.
     * More information on supported configuration: https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
     * Supported voices: https://cloud.google.com/text-to-speech/docs/voices
     * Full voicess list: https://texttospeech.googleapis.com/v1/voices
     * @param {string} text - The input text to be converted to speech.
     * @param {Object} options - Optional parameters for the text-to-speech conversion.
     * @param {string} options.model - The voice type to use for the conversion (default: 'Standard').
     * @param {string} options.voice - The voice to use for the conversion (default: 'fable').
     * @param {string} options.response_format - The format of the response audio (default: 'mp3').
     * @param {number} options.speed - The speed of the speech (default: 1.0).
     * @param {number} options.pitch - Speaking pitch (default: 0).
     * @param {boolean} options.is_ssml – Is the input text in SSML format (default: false).
     * @returns {Promise<Buffer>} - A promise that resolves to the audio buffer of the converted speech.
     * @throws {Error} - If the input text exceeds the maximum allowed length or if the conversion fails.
     */
    async textToSpeech(text, options = {}) {
        if (text.length > GOOGLE_TTS_MAX_INPUT) {
            throw new Error(`Failed to convert text to speech: input text must be less or equal to ${GOOGLE_TTS_MAX_INPUT} characters`);
        }

        // Default values for options
        const {
            model = 'Standard', // Studio, Polyglot, Neural2, WaveNet, News, Standard
            voice = 'A', // A, B, C, ...
            response_format = 'mp3', // mp3, opus, linear16, mulaw, alaw
            speed = 1.0, // 0.25 .. 4.0
            pitch = 0, // -20 .. 20
            is_ssml = false, // true/false
            language = 'en-US' // BCP-47 language tag, e.g. "en-US"
            // TODO: introduce language detection with Translation API
            // https://cloud.google.com/translate/docs/advanced/detecting-language-v3
        } = options;

        const request = {
            input: {
                text: text
            },
            voice: {
                languageCode: language,
                name: `${language}-${model}-${voice}`,
            },
            audioConfig: {
                audioEncoding: response_format.toUpperCase(),
                speakingRate: speed,
                pitch: pitch,
            },
        };
        if (is_ssml) {
            request.input.ssml = text;
            delete request.input.text;
        }

        const [response] = await this.googleTtsClient.synthesizeSpeech(request);
        return response.audioContent;
    }
}

module.exports = { GoogleProvider, CreateGoogleProvider };
