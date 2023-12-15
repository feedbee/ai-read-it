// tests/lib/ai-read-it.test
const { init, smallTextToSpeech } = require('../../lib/ai-read-it.js');
const { OpenAI } = require('openai');

jest.mock('openai');

describe('smallTextToSpeech', () => {
    beforeEach(() => {
        OpenAI.mockClear();
    });

    it('should convert small text to speech', async () => {
        const apiKey = 'YOUR_API_KEY';
        const text = 'This is a test text.';
        const expectedAudioBuffer = Buffer.from('audio data');

        // Mock the OpenAI constructor and audio.speech.create method
        const createFn = jest.fn().mockResolvedValue({
            arrayBuffer: jest.fn().mockResolvedValue(expectedAudioBuffer),
        });
        OpenAI.mockImplementation(() => ({
            audio: {
                speech: {
                    create: createFn,
                },
            },
        }));

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function
        const audioBuffer = await smallTextToSpeech(text);

        // Verify the OpenAI constructor and audio.speech.create method were called with the correct parameters
        expect(OpenAI).toHaveBeenCalledWith({ apiKey });
        expect(createFn).toHaveBeenCalledWith({
            model: 'tts-1',
            input: text,
            voice: 'fable',
            response_format: 'mp3',
            speed: 1.0,
        });

        // Verify the returned audio buffer
        expect(audioBuffer).toEqual(expectedAudioBuffer);
    });

    it('should throw an error if input text exceeds the maximum allowed length', async () => {
        const apiKey = 'YOUR_API_KEY';
        const longText = 'a'.repeat(5000);

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function and expect it to throw an error
        await expect(smallTextToSpeech(longText)).rejects.toThrow(
            'Failed to convert text to speech: input text must be less or equal to 4096 characters'
        );
    });

    it('should throw an error if the conversion fails', async () => {
        const apiKey = 'YOUR_API_KEY';
        const text = 'This is a test text.';

        // Mock the OpenAI constructor and audio.speech.create method to throw an error
        OpenAI.mockImplementation(() => ({
            audio: {
                speech: {
                    create: jest.fn().mockRejectedValue(new Error('Conversion failed')),
                },
            },
        }));

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function and expect it to throw an error
        await expect(smallTextToSpeech(text)).rejects.toThrow('Failed to convert text to speech: Conversion failed');
    });
});
