const { init, smallTextToSpeech, mediumTextToSpeech, largeTextToSpeech, maxInputLength } = require('../../lib/ai-read-it');
const { CreateGoogleProvider } = require('../../lib/providers/google.js');
const { CreateOpenAIProvider } = require('../../lib/providers/openai.js');
const { splitTextIntoChunks } = require('../../lib/split-text.js');
const crypto = require('crypto');

const DEFAULT_CHUNK_SIZE = 4096;

// Helper function to generate a hash for a given text
const hashText = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Mock the dependencies
jest.mock('../../lib/providers/openai.js', () => ({
    CreateOpenAIProvider: jest.fn().mockImplementation(() => ({
        textToSpeech: jest.fn((text) => Promise.resolve(Buffer.from(hashText(text)))),
        get maxInputLength() {
            return DEFAULT_CHUNK_SIZE;
        },
    })),
}));
jest.mock('../../lib/providers/google.js', () => ({
    CreateGoogleProvider: jest.fn().mockImplementation(() => ({
        textToSpeech: jest.fn((text) => Promise.resolve(Buffer.from(hashText(text))))
    })),
}));
jest.mock('../../lib/split-text.js', () => ({
    optimizeText: jest.fn((text) => text),
    splitTextIntoChunks: jest.fn((text, chunkSize) => {
        chunkSize = chunkSize || DEFAULT_CHUNK_SIZE;
        let chunkCount = Math.ceil(text.length / chunkSize);
        return new Array(chunkCount).fill('').map((_, i) => text.substr(i * chunkSize, chunkSize));
    }),
}));
afterAll(() => {
    jest.restoreAllMocks(); // Restores all mocks back to their original value
});

describe('init function tests', () => {
    beforeEach(() => {
        // Clear all mock calls before each test
        jest.clearAllMocks();
    });

    test('initializes OpenAI provider with apiKey', () => {
        const apiKey = 'test-openai-api-key';
        init(apiKey, 'openai');

        expect(CreateOpenAIProvider).toHaveBeenCalledWith(apiKey);
        expect(CreateGoogleProvider).not.toHaveBeenCalled();
    });

    test('initializes Google provider with apiKey when specified', () => {
        const apiKey = 'test-google-api-key';
        init(apiKey, 'google');

        expect(CreateGoogleProvider).toHaveBeenCalledWith(apiKey);
        expect(CreateOpenAIProvider).not.toHaveBeenCalled();
    });

    test('defaults to OpenAI provider when providerName is not specified', () => {
        const apiKey = 'default-openai-api-key';
        init(apiKey);

        expect(CreateOpenAIProvider).toHaveBeenCalledWith(apiKey);
        expect(CreateGoogleProvider).not.toHaveBeenCalled();
    });

    test('throws error for unknown provider', () => {
        const apiKey = 'some-api-key';
        const initUnknownProvider = () => {
            init(apiKey, 'unknownProvider');
        };

        expect(initUnknownProvider).toThrowError('Unknown TTS provider: unknownProvider');
    });
});

describe('Text to Speech Tests', () => {
    beforeAll(() => {
        // Initialize with an OpenAI provider for simplicity
        init('fake-api-key', 'openai');
    });

    describe('smallTextToSpeech', () => {
        test('converts text to speech correctly', async () => {
            const text = 'Hello, world!';
            const buffer = await smallTextToSpeech(text);
            const expectedHash = hashText(text);

            expect(buffer.toString()).toEqual(expectedHash);
        });
    });

    describe('mediumTextToSpeech', () => {
        test('splits medium text and converts each chunk', async () => {
            const mediumText = 'Hello, world! '.repeat(300); // Creates a medium-sized text
            const buffer = await mediumTextToSpeech(mediumText);

            // For mediumTextToSpeech, we expect it to concatenate the hash values of each chunk.
            // The actual verification would depend on how the hashes are concatenated in your implementation.
            // This is a simplified check to ensure that the returned buffer contains expected hash values.
            const chunks = splitTextIntoChunks(mediumText);
            const expectedHashes = chunks.map(chunk => hashText(chunk));

            expectedHashes.forEach(hash => {
                expect(buffer.toString()).toContain(hash);
            });
        });
    });

    describe('largeTextToSpeech', () => {
        test('yields speech for each chunk of large text', async () => {
            const largeText = 'Goodbye, world! '.repeat(1000); // Creates a large-sized text
            const chunkSize = maxInputLength();
            const chunks = splitTextIntoChunks(largeText, chunkSize);
            const expectedHashes = chunks.map(chunk => hashText(chunk));

            const generator = largeTextToSpeech(largeText, { chunkSize });
            for await (const buffer of generator) {
                // Convert each yielded buffer to string and check if it matches one of the expected hashes.
                const resultHash = buffer.toString();
                expect(expectedHashes).toContain(resultHash);
                // Remove the matched hash to ensure duplicates are not counted.
                const index = expectedHashes.indexOf(resultHash);
                if (index > -1) {
                    expectedHashes.splice(index, 1);
                }
            }

            // After processing all chunks, expectedHashes should be empty if every chunk was correctly processed.
            expect(expectedHashes.length).toBe(0);
        });
    });
});
