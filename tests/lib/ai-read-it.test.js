// tests/lib/ai-read-it.test
const { init, smallTextToSpeech, mediumTextToSpeech } = require('../../lib/ai-read-it.js');
const { optimizeText, splitTextIntoChunks } = require('../../lib/split-text.js');
const { OpenAI } = require('openai');

jest.mock('openai');

describe('smallTextToSpeech', () => {
    beforeEach(() => {
        OpenAI.mockClear();
    });

    it('should convert small text to speech', async () => {
        const apiKey = 'YOUR_API_KEY';
        const text = 'This is a test text.';
        const expectedAudioBuffer = Buffer.from('audio data');

        // Mock the OpenAI constructor and audio.speech.create method
        const createFn = jest.fn().mockResolvedValue({
            arrayBuffer: jest.fn().mockResolvedValue(expectedAudioBuffer),
        });
        OpenAI.mockImplementation(() => ({
            audio: {
                speech: {
                    create: createFn,
                },
            },
        }));

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function
        const audioBuffer = await smallTextToSpeech(text);

        // Verify the OpenAI constructor and audio.speech.create method were called with the correct parameters
        expect(OpenAI).toHaveBeenCalledWith({ apiKey });
        expect(createFn).toHaveBeenCalledWith({
            model: 'tts-1',
            input: text,
            voice: 'fable',
            response_format: 'mp3',
            speed: 1.0,
        });

        // Verify the returned audio buffer
        expect(audioBuffer).toEqual(expectedAudioBuffer);
    });

    it('should throw an error if input text exceeds the maximum allowed length', async () => {
        const apiKey = 'YOUR_API_KEY';
        const longText = 'a'.repeat(5000);

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function and expect it to throw an error
        await expect(smallTextToSpeech(longText)).rejects.toThrow(
            'Failed to convert text to speech: input text must be less or equal to 4096 characters'
        );
    });

    it('should throw an error if the conversion fails', async () => {
        const apiKey = 'YOUR_API_KEY';
        const text = 'This is a test text.';

        // Mock the OpenAI constructor and audio.speech.create method to throw an error
        OpenAI.mockImplementation(() => ({
            audio: {
                speech: {
                    create: jest.fn().mockRejectedValue(new Error('Conversion failed')),
                },
            },
        }));

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function and expect it to throw an error
        await expect(smallTextToSpeech(text)).rejects.toThrow('Failed to convert text to speech: Conversion failed');
    });

    it('should convert meduim text to speech in chunks', async () => {
        const apiKey = 'YOUR_API_KEY';
        const text = `Artificial intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that would normally require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI is an interdisciplinary field that incorporates elements from various fields, including computer science, psychology, linguistics, philosophy, and neuroscience. AI can be classified into two main types. Narrow AI, which is designed to perform a narrow task (such as facial recognition or internet searches). General AI, which can perform any intellectual task that a human being can do. While narrow AI is a reality today and is being used in a wide range of applications, general AI is still largely theoretical, with no practical implementations in use today. AI technologies have the potential to bring immense benefits to society. They can help improve productivity, enhance the quality of services, and solve complex problems. However, they also pose significant challenges and risks. These include concerns about privacy, security, job displacement, and the ethical implications of AI decision-making. As AI continues to advance and become more integrated into our daily lives, it is crucial that we continue to explore these issues and develop strategies to mitigate the potential negative impacts of AI, while maximizing its benefits. This will require ongoing research, thoughtful policy-making, and a commitment to ethical principles in the development and use of AI technologies.
        Artificial intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that would normally require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI is an interdisciplinary field that incorporates elements from various fields, including computer science, psychology, linguistics, philosophy, and neuroscience. AI can be classified into two main types. Narrow AI, which is designed to perform a narrow task (such as facial recognition or internet searches). General AI, which can perform any intellectual task that a human being can do. While narrow AI is a reality today and is being used in a wide range of applications, general AI is still largely theoretical, with no practical implementations in use today. AI technologies have the potential to bring immense benefits to society. They can help improve productivity, enhance the quality of services, and solve complex problems. However, they also pose significant challenges and risks. These include concerns about privacy, security, job displacement, and the ethical implications of AI decision-making. As AI continues to advance and become more integrated into our daily lives, it is crucial that we continue to explore these issues and develop strategies to mitigate the potential negative impacts of AI, while maximizing its benefits. This will require ongoing research, thoughtful policy-making, and a commitment to ethical principles in the development and use of AI technologies.
        Artificial intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that would normally require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI is an interdisciplinary field that incorporates elements from various fields, including computer science, psychology, linguistics, philosophy, and neuroscience. AI can be classified into two main types. Narrow AI, which is designed to perform a narrow task (such as facial recognition or internet searches). General AI, which can perform any intellectual task that a human being can do. While narrow AI is a reality today and is being used in a wide range of applications, general AI is still largely theoretical, with no practical implementations in use today. AI technologies have the potential to bring immense benefits to society. They can help improve productivity, enhance the quality of services, and solve complex problems. However, they also pose significant challenges and risks. These include concerns about privacy, security, job displacement, and the ethical implications of AI decision-making. As AI continues to advance and become more integrated into our daily lives, it is crucial that we continue to explore these issues and develop strategies to mitigate the potential negative impacts of AI, while maximizing its benefits. This will require ongoing research, thoughtful policy-making, and a commitment to ethical principles in the development and use of AI technologies.`;
        const expectedAudioBuffer = Buffer.from(splitTextIntoChunks(optimizeText(text)).join(''));

        // Mock the OpenAI constructor and audio.speech.create method
        const createFn = jest.fn(options => {
            return {
                arrayBuffer: jest.fn().mockResolvedValue(options.input)
            };
        });
        OpenAI.mockImplementation(() => ({
            audio: {
                speech: {
                    create: createFn,
                },
            },
        }));

        // Initialize the AI Read It library
        init(apiKey);

        // Call the smallTextToSpeech function
        const audioBuffer = await mediumTextToSpeech(text);

        // Verify the OpenAI constructor and audio.speech.create method were called with the correct parameters
        expect(OpenAI).toHaveBeenCalledWith({ apiKey });
        expect(createFn).toHaveBeenCalledTimes(2);

        // Verify the returned audio buffer
        expect(audioBuffer).toEqual(expectedAudioBuffer);
    });
});
