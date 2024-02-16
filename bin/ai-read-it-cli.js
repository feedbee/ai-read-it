#!/usr/bin/env node

const { AiReadIt, createProvider } = require('../lib/ai-read-it');
const { Readable } = require('stream');

// Commandline arguments
const providerName = getCmdArg('-p', '--provider') || 'OpenAI'; // default provider
const ttsOptions = {};
for (let key of ['model', 'language', 'voice', 'response_format', 'speed', 'pitch', 'is_ssml']) {
    const opt = getCmdArg(null, '--tts.' + key);
    if (opt) {
        ttsOptions[key] = opt;
    }
}
const providerOptions = {};
for (let key of ['detect_language']) {
    const opt = getCmdArg(null, '--p.' + key);
    if (opt) {
        providerOptions[key] = opt;
    }
}

// Provider is initialized with the API Key from the environment:
// - OpenAI: process.env.OPENAI_API_KEY
// - Google: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
const aiReadIt = new AiReadIt(createProvider(providerName, null, providerOptions));

// Read input text from stdin
let inputText = '';

process.stdin.on('data', (chunk) => {
    inputText += chunk.toString();
});

process.stdin.on('end', async () => {
    try {
        // Convert text to speech
        const readable = Readable.from(await aiReadIt.largeTextToSpeech(inputText, ttsOptions));
        readable.pipe(process.stdout);
    } catch (error) {
        console.error("Error:", error);
    }
});

function getCmdArg(argShortName, argFullName) {
    const argIndex = process.argv.findIndex(arg => arg === argShortName || arg === argFullName);
    if (argIndex !== -1 && process.argv.length > argIndex + 1) {
        return process.argv[argIndex + 1];
    }
    return undefined;
}
