const LanguageDetectionPlugin = require('../../../lib/helpers/language-detection');

// Mock the TranslationServiceClient
jest.mock('@google-cloud/translate', () => {
    return {
        TranslationServiceClient: jest.fn().mockImplementation(() => {
            return {
                detectLanguage: jest.fn((request) => {
                    // Simulate different responses based on the input text
                    if (request.content === 'text in english') {
                        return Promise.resolve([
                            { languages: [{ languageCode: 'en', confidence: 0.9 }] },
                        ]);
                    } else if (request.content === 'text in spanish') {
                        return Promise.resolve([
                            { languages: [{ languageCode: 'es', confidence: 1 }] },
                        ]);
                    } else if (request.content === 'текст по-русски') {
                        return Promise.resolve([
                            { languages: [{ languageCode: 'ru', confidence: 1 }] },
                        ]);
                    } else if (request.content === 'text in unsupported language') {
                        return Promise.resolve([
                            { languages: [{ languageCode: 'xx', confidence: 0.9 }] },
                        ]);
                    } else if (request.content === 'low confidence text') {
                        return Promise.resolve([
                            { languages: [{ languageCode: 'en', confidence: 0.05 }] },
                        ]);
                    } else {
                        return Promise.resolve([{ languages: [] }]);
                    }
                }),
            };
        }),
    };
});

describe('LanguageDetectionPlugin', () => {
    describe('Initialization', () => {
        it('should throw an error if options.credentials is missing', () => {
            expect(() => {
                new LanguageDetectionPlugin({ });
            }).toThrow(/options.credentials/);
        });
        it('should throw an error if project_id is missing', () => {
            expect(() => {
                new LanguageDetectionPlugin({ credentials: {} });
            }).toThrow(/project_id/);
        });
    });

    describe('detectLanguage method', () => {
        let plugin;

        beforeEach(() => {
            plugin = new LanguageDetectionPlugin({ credentials: { project_id: 'test-project' } });
        });

        it('should detect valid language', async () => {
            let detectedLanguage = await plugin.detectLanguage('text in english');
            expect(detectedLanguage).toBe('en');
            detectedLanguage = await plugin.detectLanguage('text in spanish');
            expect(detectedLanguage).toBe('es');
            detectedLanguage = await plugin.detectLanguage('текст по-русски');
            expect(detectedLanguage).toBe('ru');
            detectedLanguage = await plugin.detectLanguage('low confidence text');
            expect(detectedLanguage).toBe('en');
        });

        it('should default to "en" for unsupported languages', async () => {
            const detectedLanguage = await plugin.detectLanguage('text in unsupported language');
            expect(detectedLanguage).toBe('en');
        });

        it('should return "en" when no languages are detected', async () => {
            const detectedLanguage = await plugin.detectLanguage('');
            expect(detectedLanguage).toBe('en');
        });

        it('should return "en" when no languages are detected', async () => {
            const detectedLanguage = await plugin.detectLanguage('text in spanish');
            expect(detectedLanguage).toBe('es');
        });
    });

    describe('matchDefaultRegion method', () => {
        /**
         * @type {LanguageDetectionPlugin}
         */
        let plugin;

        beforeEach(() => {
            plugin = new LanguageDetectionPlugin({ credentials: { project_id: 'test-project' } });
        });

        it('should return the default region for a known language', () => {
            const region = plugin.matchDefaultRegion('en');
            expect(region).toEqual(['US', 'AU', 'GB', 'IN']);
        });

        it('should return undefined for an unknown language', () => {
            const region = plugin.matchDefaultRegion('xx');
            expect(region).toBeUndefined();
        });
    });

    describe('detectLanguageAndRegion method', () => {
        /**
         * @type {LanguageDetectionPlugin}
         */
        let plugin;

        beforeEach(() => {
            plugin = new LanguageDetectionPlugin({ credentials: { project_id: 'test-project' } });
        });

        it('should detect language and region for valid text', async () => {
            let detectedLanguageRegion = await plugin.detectLanguageAndRegion('text in english');
            expect(detectedLanguageRegion).toBe('en-US');
            detectedLanguageRegion = await plugin.detectLanguageAndRegion('text in spanish');
            expect(detectedLanguageRegion).toBe('es-ES');
            detectedLanguageRegion = await plugin.detectLanguageAndRegion('текст по-русски');
            expect(detectedLanguageRegion).toBe('ru-RU');
        });

        it('should default to English and its region for unsupported languages', async () => {
            const detectedLanguageRegion = await plugin.detectLanguageAndRegion('text in unsupported language');
            expect(detectedLanguageRegion).toBe('en-US');
        });
    });
});
