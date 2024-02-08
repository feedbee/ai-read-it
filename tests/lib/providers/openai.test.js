const { OpenAI } = require('openai');
const { OpenAIProvider, CreateOpenAIProvider } = require('../../../lib/providers/openai');

jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
        audio: {
            speech: {
                create: jest.fn().mockResolvedValue({
                    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked_audio_content')),
                }),
            },
        },
    })),
}));

describe('CreateOpenAIProvider Function', () => {
    test('creates OpenAIProvider with apiKey', () => {
        const apiKey = 'test-api-key';
        const provider = CreateOpenAIProvider(apiKey);
        expect(provider).toBeInstanceOf(OpenAIProvider);
        expect(OpenAI).toHaveBeenCalledWith({ apiKey });
    });

    test('throws error without apiKey or environment variable', () => {
        // Temporarily remove the environment variable for this test
        const originalEnv = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        expect(() => CreateOpenAIProvider()).toThrow();

        // Restore the environment variable after the test
        process.env.OPENAI_API_KEY = originalEnv;
    });
});

describe('OpenAIProvider Class', () => {
    let provider;

    beforeEach(() => {
        provider = new OpenAIProvider({ apiKey: 'test-api-key' });
    });

    test('textToSpeech converts text successfully', async () => {
        const text = 'Hello, world!';
        const buffer = await provider.textToSpeech(text);
        expect(buffer).toEqual(Buffer.from('mocked_audio_content'));
        expect(provider.openai.audio.speech.create).toHaveBeenCalled();
    });

    test('textToSpeech throws error for text exceeding max length', async () => {
        const longText = 'a'.repeat(provider.maxInputLength + 1); // Exceeds the OPENAI_TTS_MAX_INPUT
        await expect(provider.textToSpeech(longText)).rejects.toThrow();
    });

    test('textToSpeech uses default options when none are provided', async () => {
        const text = 'Hello, default world!';
        await provider.textToSpeech(text); // This call is just to ensure no error is thrown with default options
        expect(provider.openai.audio.speech.create).toHaveBeenCalledWith({
            model: 'tts-1',
            input: text,
            voice: 'fable',
            response_format: 'mp3',
            speed: 1.0,
        });
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
