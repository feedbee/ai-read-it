// main.js

const readline = require('readline');
const fs = require('fs');
const aiReadIt = require('./lib/ai-read-it');

// Initialize OpenAI API key from the environment
aiReadIt.init(process.env.OPENAI_API_KEY);

// Function to convert text to speech
async function convertTextToSpeech(text) {
    try {
        // Convert the text to speech
        const audioBuffer = await aiReadIt.textToSpeech(text);

        // Handle the audio buffer (e.g., play it or save it to a file)
        console.log("Successfully converted text to speech!");

        // For demonstration purposes, log the audio buffer length
        console.log("Audio Buffer Length:", audioBuffer.length);

        // Prompt the user to save the output into a file
        const saveToFile = await promptUser(
            'Do you want to save the output to a file? (Y/N)',
            ['y', 'n', 'yes', 'no']
        );

        if (['yes', 'y'].includes(saveToFile.toLowerCase())) {
            // Ask the user for a filename, defaulting to demo.mp3
            const filename = await promptUser('Enter a filename (default: demo.mp3):') || 'demo.mp3';

            // Write the audio buffer to the specified file
            fs.writeFileSync(filename, audioBuffer);
            console.log(`Audio saved to ${filename}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to prompt the user with validation and return a promise with the response
function promptUser(question, validResponses) {
    return new Promise(async (resolve) => {
        let response;
        do {
            response = await promptUserInt(question);
            response = response.toLowerCase();
        } while (validResponses && !validResponses.includes(response));

        resolve(response);
    });
}

// Function to prompt the user and return a promise with the response
function promptUserInt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question + ' ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Example text to convert
const exampleText = "Hello, world! This is AI-Read-It in action.";

// Call the function with the example text
convertTextToSpeech(exampleText);
