const { TranslationServiceClient } = require('@google-cloud/translate');

// All supported languages by Google TTS API as of 2/12/2024
const languageRegionsMapping = {
    'af': ['ZA'],
    'ar': ['XA'],
    'bg': ['BG'],
    'bn': ['IN'],
    'ca': ['ES'],
    'cmn': ['CN', 'TW'],
    'cs': ['CZ'],
    'da': ['DK'],
    'de': ['DE'],
    'el': ['GR'],
    'en': ['US', 'AU', 'GB', 'IN'],
    'es': ['ES', 'US'],
    'eu': ['ES'],
    'fi': ['FI'],
    'fil': ['PH'],
    'fr': ['FR', 'CA'],
    'gl': ['ES'],
    'gu': ['IN'],
    'he': ['IL'],
    'hi': ['IN'],
    'hu': ['HU'],
    'id': ['ID'],
    'is': ['IS'],
    'it': ['IT'],
    'ja': ['JP'],
    'kn': ['IN'],
    'ko': ['KR'],
    'lt': ['LT'],
    'lv': ['LV'],
    'ml': ['IN'],
    'mr': ['IN'],
    'ms': ['MY'],
    'nb': ['NO'],
    'nl': ['NL', 'BE'],
    'pa': ['IN'],
    'pl': ['PL'],
    'pt': ['PT', 'BR'],
    'ro': ['RO'],
    'ru': ['RU'],
    'sk': ['SK'],
    'sr': ['RS'],
    'sv': ['SE'],
    'ta': ['IN'],
    'te': ['IN'],
    'th': ['TH'],
    'tr': ['TR'],
    'uk': ['UA'],
    'vi': ['VN'],
    'yue': ['HK'],
};

class LanguageDetectionPlugin {
    #projectId

    constructor(options) {
        if (!options.credentials) {
            throw new Error(`Language detection plugin requires valid GCP Service Role API token to be provided as options.credentials`);
        }
        if (!options.credentials.project_id) {
            throw new Error(`Language detection plugin requires project_id to be part of the API token JSON`);
        }
        this.translationClient = new TranslationServiceClient(options);
        this.#projectId = options.credentials.project_id;
    }

    /**
     * 
     * @param {string} text 
     * @returns {string}
     */
    async detectLanguage(text) {
        const request = {
            parent: `projects/${this.#projectId}/locations/global`,
            content: text,
        };
      
        const [response] = await this.translationClient.detectLanguage(request);

        if (response.languages.length > 0) {
            let language = response.languages[0];
            if (language.confidence > 0.1) {
                if (!languageRegionsMapping[language.languageCode]) {
                    return 'en';
                }
                return language.languageCode;
            }
        }

        return 'en';
    }

    /**
     * 
     * @param {string} language 
     * @returns {string[]}
     */
    matchDefaultRegion(language) {
        return languageRegionsMapping[language];
    }

    /**
     * 
     * @param {string} text 
     * @returns {string}
     */
    async detectLanguageAndRegion(text) {
        const language = await this.detectLanguage(text);
        const region = this.matchDefaultRegion(language);
        return `${language}-${region[0]}`;
    }
}

module.exports = LanguageDetectionPlugin;
