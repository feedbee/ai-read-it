const { TextToSpeechClient, synthesizeSpeechMock } = require('@google-cloud/text-to-speech');
const { GoogleProvider, CreateGoogleProvider } = require('../../../lib/providers/google');

jest.mock('@google-cloud/text-to-speech', () => {
    const synthesizeSpeechMock = jest.fn().mockResolvedValue([{ audioContent: 'mocked_audio_content' }]);
    return {
        TextToSpeechClient: jest.fn().mockImplementation(() => ({
            synthesizeSpeech: synthesizeSpeechMock,
        })),
        synthesizeSpeechMock, // Exporting it for direct access in tests
    };
});

describe('CreateGoogleProvider Function', () => {
    test('creates GoogleProvider with apiKey as a string', () => {
        const apiKey = JSON.stringify({ test: 'apiKey' });
        const provider = CreateGoogleProvider(apiKey);
        expect(provider).toBeInstanceOf(GoogleProvider);
        expect(TextToSpeechClient).toHaveBeenCalledWith({
            credentials: JSON.parse(apiKey),
        });
    });
    
    test('creates GoogleProvider with apiKey as an object', () => {
        const apiKeyObject = { test: 'apiKey' };
        const provider = CreateGoogleProvider(apiKeyObject);
        expect(provider).toBeInstanceOf(GoogleProvider);
        expect(TextToSpeechClient).toHaveBeenCalledWith({
            credentials: apiKeyObject,
        });
    });

    test('throws error without apiKey or environment variable', () => {
        // Temporarily remove the environment variable for this test
        const originalEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

        expect(() => CreateGoogleProvider()).toThrow();

        // Restore the environment variable after the test
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = originalEnv;
    });
});

describe('GoogleProvider Class', () => {
    let provider;

    beforeEach(() => {
        provider = new GoogleProvider({ credentials: {test: 'apiKey'} });
    });

    test('textToSpeech converts text successfully', async () => {
        const text = 'Hello, world!';
        const buffer = await provider.textToSpeech(text);
        expect(buffer).toEqual('mocked_audio_content');
        expect(synthesizeSpeechMock).toHaveBeenCalled();
    });

    test('textToSpeech throws error for text exceeding max length', async () => {
        const longText = 'a'.repeat(provider.maxInputLength + 1); // Exceeds the GOOGLE_TTS_MAX_INPUT
        await expect(provider.textToSpeech(longText)).rejects.toThrow();
    });

    test('textToSpeech uses default options when none are provided', async () => {
        const text = 'Hello, default world!';
        await provider.textToSpeech(text); // This call is just to ensure no error is thrown with default options
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.anything());
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
