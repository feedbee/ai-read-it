#!/usr/bin/env node

const { AiReadIt, createProvider } = require('../lib/ai-read-it');
const { Readable } = require('stream');

// Initialize the provider
let providerName = 'OpenAI'; // default provider
const providerArgIndex = process.argv.findIndex(arg => arg === '--provider' || arg === '-p');
if (providerArgIndex !== -1 && process.argv.length > providerArgIndex + 1) {
    providerName = process.argv[providerArgIndex + 1];
}
// Provider is initialized with the API Key from the environment:
// - Open AI: process.env.OPENAI_API_KEY
// - Google: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
const aiReadIt = new AiReadIt(createProvider(providerName));

// Read input text from stdin
let inputText = '';

process.stdin.on('data', (chunk) => {
    inputText += chunk.toString();
});

process.stdin.on('end', async () => {
    try {
        // Convert text to speech
        const readable = Readable.from(await aiReadIt.largeTextToSpeech(inputText));
        readable.pipe(process.stdout);
    } catch (error) {
        console.error("Error:", error);
    }
});
