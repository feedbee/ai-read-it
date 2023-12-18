#!/usr/bin/env node

// ai-read-it-cli.js

const aiReadIt = require('../lib/ai-read-it');
const { Readable } = require('stream');

// Initialize OpenAI API key from the environment
aiReadIt.init(process.env.OPENAI_API_KEY);

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
