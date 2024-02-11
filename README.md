# AI-Read-It: Text-to-Speech Node.js Module

## Overview

AI-Read-It is a Node.js module that utilizes text-to-speech models, including OpenAI's, to convert text input into natural-sounding voice. This module is designed for easy integration into projects requiring text-to-speech functionality and supports multiple providers.

## Installation

To use AI-Read-It in your project, follow these simple steps:

1. Install Node.js on your machine if you haven't already.

2. Install the module using npm:

```bash
npm install ai-read-it
```

## Usage

The library provides two ways how to work with it, in other words – two interfaces: **functional** and **object-oriented**.
To start, in both cases you need to onfigure the library with your API key and optionally specify a provider (default is `OpenAI`).

**Functional interface** works as singleton. This approach works if you are connecting to a single provider using a single API key
in your application. It fits most of the useceses, but a simple explample when it does not work is allowing clients of your
accplication to provide their API keys and/or choosing providers.

Functional interface is simpler to use. Just import the library initialize it and use on of the provided functions to convert
your text to speech. `smallTextToSpeech` function is used in the following example:

```js
const aiReadIt = require('ai-read-it');

const textToConvert = "Hello, world! This is AI-Read-It in action.";

// Initialize with provider name (OpenAI is the default provider)
aiReadIt.init(process.env.API_KEY); // or pass "Google" as the second argument for Google Cloud Text-to-Speech

aiReadIt.smallTextToSpeech(textToConvert)
    .then(audioBuffer => {
        // Handle the audio buffer (e.g., play it or save it to a file)
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

**Object-oriented interface** provides ability to create multiple instances of `AiReadIt` library in your appication.

In the following example we create `Google` provider and use `mediumTextToSpeech` to handle a bigger text:

```js
const { AiReadIt, createProvider } = require('ai-read-it');

const textToConvert = "Hello, world! This is AI-Read-It in action. ".repeat(150);

// Initialize with provider name (OpenAI is the default provider)
const aiReadIt = new AiReadIt(createProvider("Google", process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)); // or "OpenAI" for OpenAI Text-to-Speech

aiReadIt.mediumTextToSpeech(textToConvert)
    .then(audioBuffer => {
        // Handle the audio buffer (e.g., play it or save it to a file)
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

You can create provider with `createProvider` fabric. This approach works unless you need to provide costom configuration options
to the provider (on top of the API key). In such case consider importing providers derectly as `ai-read-it/providers/***Provider`.

:warning: **Note the different import syntax** in the examples above. In the functional case the whole library is refferenced
with the `aiReadIt` variable while with object-oriented interface we import the `AiReadIt` class directly along with the 
provider fabric function `createProvider`.

```js
// Functional interface
const aiReadIt = require('ai-read-it');
// Functional interfaceObject-oriented interface
const { AiReadIt, createProvider } = require('ai-read-it');
```

Besides `smallTextToSpeech` and `mediumTextToSpeech` functions/methods, both interfaces provide `largeTextToSpeech` function to convert larger texts in the streaming mode in chunks to get the first faster and not wating till the whole text is processed. See the API details below.

## CLI

A CLI (Command Line Interface) tool for text-to-speech conversion is included. It takes text as input, processes it, and outputs the converted audio. Specify the provider with `--provider` or `-p` flag (the profiver is `OpenAI`).

```bash
cat text-to-read.txt | ./bin/ai-read-it-cli.js --provider OpenAI > tts-audio.mp3
```

## API

`smallTextToSpeech(text: string, options = {}): Promise<Buffer>`

- Converts small text to speech using the OpenAI text-to-speech API. Limited to 4096 chars as per OpenAI API.
- Returns a Promise that resolves with the audio buffer.

`mediumTextToSpeech(text: string, options = {}): Promise<Buffer>`

- Converts medium-sized text into speech by splitting it into chunks and using smallTextToSpeech function. Still keeps all data in memory, including the output audio.
- Returns a Promise that resolves with the audio buffer.

`largeTextToSpeech(text: string, options = {}): AsyncGenerator`

- Converts a large text into speech by splitting it into smaller chunks and generating speech for each chunk. Returns audio chanks one by one not keeping them all in memory at once. Fits for any size of the texts: from small to large ones.
- Returns a AsyncGenerator (AsyncIterator) that allows to iterated ower the chunks buffers one by one.

For all the functions the options is an array of the following values:
- `options.model` - The model to use for the conversion (default: 'tts-1'): `tts-1, tts-1-hd`
- `options.voice` - The voice to use for the conversion (default: 'fable'): `alloy, echo, fable, onyx, nova, shimmer`
- `options.response_format` - The format of the response audio (default: 'mp3'): `mp3, opus, aac, flac`
- `options.speed` - The speed of the speech (default: `1.0`): `0.25 .. 4.0`

`largeTextToSpeech()` additionally support `options.chunkSize` integer value from 1 till 4096 to set a maximum character limit
for each text chunk processed (up to 4096 characters). Note that smaller chunks lead to quicker initial responses, but increase
the number of requests sent per minute to the OpenAI API.

## Example

Check out the `main.js` file in the project repository for a simple example of using AI-Read-It.

You can run the example:

```bash
OPENAI_API_KEY="___PUT_YOUR_OPENAI_API_KEY_HERE___" node main.js --provider OpenAI
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
node main.js --provider OpenAI
```

## Supported Providers

AI-Read-It currently supports two text-to-speech providers:

### Google Text-to-Speech AI

Google's Text-to-Speech service converts text into natural-sounding speech using advanced deep learning techniques. It offers a wide range of voices and languages to choose from, allowing for highly customizable speech synthesis.

Configuration Options: Google Text-to-Speech supports various configuration options, including voice selection, speaking rate, and pitch adjustment.

Voices: A diverse set of voices across languages and dialects, including WaveNet voices for natural-sounding speech.
More Details: For a comprehensive overview of the supported configuration options and voices, please visit the [Google Cloud Text-to-Speech Documentation](https://cloud.google.com/text-to-speech/docs).

### OpenAI

OpenAI's text-to-speech capabilities are designed to generate human-like speech from text inputs. It provides options to customize the voice, speed, and other aspects of speech synthesis to fit various applications.

Configuration Options: OpenAI allows customization of the voice model, speaking speed, and response format among others.
Voices: OpenAI offers a selection of voices for different styles and use cases, ensuring versatility in speech generation.
More Details: For detailed information on the configuration options and available voices, please refer to the [OpenAI API Documentation](https://platform.openai.com/docs/guides/text-to-speech).

## Issues and Contributions

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/feedbee/ai-read-it/issues/new). Contributions are also welcome!

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
