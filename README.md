# AI-Read-It: Text-to-Speech Node.js Module

## Overview

AI-Read-It is a Node.js module that utilizes the OpenAI text-to-speech model to convert text input into natural-sounding voice. This module is designed to be easily integrated into projects that require text-to-speech functionality.

## Installation

To use AI-Read-It in your project, follow these simple steps:

1. Install Node.js on your machine if you haven't already.

2. Install the module using npm:

   ```bash
   npm install ai-read-it


## Usage

Import the module into your Node.js script. Configure it with your OpenAI API key.

Use the convertToSpeech function to convert text to speech:
    
```js
const aiReadIt = require('ai-read-it');

const textToConvert = "Hello, world! This is AI-Read-It in action.";

aiReadIt.init(process.env.OPENAI_API_KEY);

aiReadIt.convertToSpeech(textToConvert)
    .then(audioBuffer => {
        // Handle the audio buffer (e.g., play it or save it to a file)
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

## CLI

```bash
cat text-to-read.txt | ./bin/ai-read-it-cli.js > tts-audio.mp3
```

## API

`textToSpeech(text: string): Promise<Buffer>`

- Converts the provided text into a speech audio buffer.
- Returns a Promise that resolves with the audio buffer.

## Example

Check out the `main.js` file in the project repository for a simple example of using AI-Read-It.

You can run the example:

```bash
OPENAI_API_KEY="___PUT_YOUR_OPENAI_API_KEY_HERE___" node main.js
```

Alternatively, save your key into a `.env` file:

```bash
OPENAI_API_KEY="___PUT_YOUR_OPENAI_API_KEY_HERE___"
```

Then get the key from the file and export it:

```bash
source .env
export OPENAI_API_KEY
```

Run the application:

```bash
node main.js
```

## Issues and Contributions

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/feedbee/ai-read-it/issues/new). Contributions are also welcome!

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
