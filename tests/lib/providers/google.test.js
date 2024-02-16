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
        provider = new GoogleProvider({ credentials: { test: 'apiKey' } });
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

// Test language detection capabilities

// Mocking @google-cloud/translate with direct access to detectLanguage mock
const{ TranslationServiceClient, detectLanguageMock } = require('@google-cloud/translate');
jest.mock('@google-cloud/translate', () => {
    const detectLanguageMock = jest.fn((request) => {
        // Simulate different responses based on the input text
        if (request.content === 'Hi there!') {
            return Promise.resolve([
                { languages: [{ languageCode: 'en', confidence: 0.9 }] },
            ]);
        } else if (request.content === 'Hola, mundo!') {
            return Promise.resolve([
                { languages: [{ languageCode: 'es', confidence: 1 }] },
            ]);
        } else {
            return Promise.resolve([{ languages: [] }]);
        }
    });

    return {
        TranslationServiceClient: jest.fn().mockImplementation(() => ({
            detectLanguage: detectLanguageMock,
        })),
        detectLanguageMock, // Export this mock for direct access in tests
    };
});

describe('GoogleProvider Language Detection constructor is called properly', () => {
    beforeEach(() => {
        TranslationServiceClient.mockClear();
    });

    test('TranslationServiceClient constructor has been called when language detection is enabled', async () => {
        new GoogleProvider({ credentials: { project_id: 'test-project' }, detect_language: true });
        expect(TranslationServiceClient).toHaveBeenCalled();
    });

    test('TranslationServiceClient constructor has not been called when language detection is disabled', async () => {
        new GoogleProvider({ credentials: { project_id: 'test-project' }, detect_language: false });
        expect(TranslationServiceClient).not.toHaveBeenCalled();
    });

    test('TranslationServiceClient constructor has not been called when language detection option is skipped', async () => {
        new GoogleProvider({ credentials: { project_id: 'test-project' } });
        expect(TranslationServiceClient).not.toHaveBeenCalled();
    });
});

describe('GoogleProvider Language Detection when enabled', () => {
    let provider;
    const defaultLanguage = 'en-US'; // Default language is English

    beforeEach(() => {
        detectLanguageMock.mockClear();
        provider = new GoogleProvider({ credentials: { project_id: 'test-project' }, detect_language: true });
    });

    test('textToSpeech detects language when not specified', async () => {
        let text = 'Hola, mundo!';
        let detectedLanguage = 'es-ES';

        await provider.textToSpeech(text, { /* options without language specified */ });
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: detectedLanguage,
            }),
        }));

        expect(detectLanguageMock).toHaveBeenCalled();

        text = 'Hi there!';
        detectedLanguage = 'en-US';

        await provider.textToSpeech(text, { /* options without language specified */ });
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: detectedLanguage,
            }),
        }));

        expect(detectLanguageMock).toHaveBeenCalledTimes(2);
    });

    test('textToSpeech uses provided language without detection', async () => {
        const text = 'Hello, world!';
        const specifiedLanguage = 'de-DE'; // User-specified language
        await provider.textToSpeech(text, { language: specifiedLanguage });
        // Verify that synthesizeSpeech was called with the specified language, bypassing detection
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: specifiedLanguage,
            }),
        }));
        expect(detectLanguageMock).not.toHaveBeenCalled();
    });

    test('textToSpeech defaults to English when language detection fails', async () => {
        const text = 'Unrecognizable text';
        await provider.textToSpeech(text);
        // Verify that the default language is used when detection fails
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: defaultLanguage,
            }),
        }));
        expect(detectLanguageMock).toHaveBeenCalled();
    });
});

describe('GoogleProvider Language Detection is not called when disabled', () => {
    let provider;
    const defaultLanguage = 'en-US'; // Default language is English

    beforeEach(() => {
        detectLanguageMock.mockClear();
        provider = new GoogleProvider({ credentials: { project_id: 'test-project' } });
    });

    test('textToSpeech detects language when not specified', async () => {
        let text = 'Hola, mundo!';
        let defaultLanguage = 'en-US';

        await provider.textToSpeech(text, { /* options without language specified */ });
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: defaultLanguage,
            }),
        }));
        expect(detectLanguageMock).not.toHaveBeenCalled();

        text = 'Hi there!';
        detectedLanguage = 'en-US';

        await provider.textToSpeech(text, { /* options without language specified */ });
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: defaultLanguage,
            }),
        }));

        expect(detectLanguageMock).not.toHaveBeenCalled();
    });

    test('textToSpeech uses provided language without detection', async () => {
        const text = 'Hello, world!';
        const specifiedLanguage = 'de-DE'; // User-specified language
        await provider.textToSpeech(text, { language: specifiedLanguage });
        // Verify that synthesizeSpeech was called with the specified language, bypassing detection
        expect(synthesizeSpeechMock).toHaveBeenCalledWith(expect.objectContaining({
            voice: expect.objectContaining({
                languageCode: specifiedLanguage,
            }),
        }));
        expect(detectLanguageMock).not.toHaveBeenCalled();
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
