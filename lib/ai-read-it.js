// lib/ai-read-it.js

const { OpenAI } = require('openai');

let openai;

// Initialize the OpenAI instance with the provided API key
function init(apiKey) {
    openai = new OpenAI({ apiKey });
}

// Function to convert text to speech
async function textToSpeech(text, options = {}) {
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

// Export the init and textToSpeech functions
module.exports = { init, textToSpeech };
