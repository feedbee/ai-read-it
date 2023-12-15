// test/lib/split-text.test.js

const { optimizeText, splitTextIntoChunks } = require('../../lib/split-text.js');

describe('splitTextIntoChunks', () => {
    it('should split text into sentences', () => {
        const text = 'This is a sentence. This is another sentence? And this is the last one! Two small ones. Yes';
        const chunkSize = 30;
        const expectedSentences = [
            'This is a sentence.',
            'This is another sentence?',
            'And this is the last one!',
            'Two small ones. Yes'
        ];

        const sentences = splitTextIntoChunks(text, chunkSize);

        expect(sentences).toEqual(expectedSentences);
    });

    it('should split text into chunks of specified size', () => {
        const text = 'This is a test text for the splitTextIntoChunks function.';
        const chunkSize = 10;
        const expectedChunks = ['This is a ', 'test text ', 'for the sp', 'litTextInt', 'oChunks fu', 'nction.'];

        const chunks = splitTextIntoChunks(text, chunkSize);

        expect(chunks).toEqual(expectedChunks);
    });

    it('should return an array with empty string for empty text', () => {
        const text = '';
        const chunkSize = 10;

        const chunks = splitTextIntoChunks(text, chunkSize);

        expect(chunks).toEqual(['']);
    });

    it('should handle text with no sentences', () => {
        const text = 'This is a text with no sentences';
        const expectedSentences = ['This is a text with no sentences'];

        const sentences = splitTextIntoChunks(text);

        expect(sentences).toEqual(expectedSentences);
    });

    it('should split medium-sized text into chunks', () => {
        const text = `Artificial intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that would normally require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI is an interdisciplinary field that incorporates elements from various fields, including computer science, psychology, linguistics, philosophy, and neuroscience.

        AI can be classified into two main types. Narrow AI, which is designed to perform a narrow task (such as facial recognition or internet searches). General AI, which can perform any intellectual task that a human being can do. While narrow AI is a reality today and is being used in a wide range of applications, general AI is still largely theoretical, with no practical implementations in use today.
        
        AI technologies have the potential to bring immense benefits to society. They can help improve productivity, enhance the quality of services, and solve complex problems. However, they also pose significant challenges and risks. These include concerns about privacy, security, job displacement, and the ethical implications of AI decision-making.
        
        As AI continues to advance and become more integrated into our daily lives, it is crucial that we continue to explore these issues and develop strategies to mitigate the potential negative impacts of AI, while maximizing its benefits. This will require ongoing research, thoughtful policy-making, and a commitment to ethical principles in the development and use of AI technologies.`;
        const chunkSize = 300;
        const expectedSentences = [
            "Artificial intelligence (AI) is a branch of computer science that aims to create systems capable of performing tasks that would normally require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding.",
            "AI is an interdisciplinary field that incorporates elements from various fields, including computer science, psychology, linguistics, philosophy, and neuroscience. AI can be classified into two main types.",
            "Narrow AI, which is designed to perform a narrow task (such as facial recognition or internet searches). General AI, which can perform any intellectual task that a human being can do.",
            "While narrow AI is a reality today and is being used in a wide range of applications, general AI is still largely theoretical, with no practical implementations in use today. AI technologies have the potential to bring immense benefits to society.",
            "They can help improve productivity, enhance the quality of services, and solve complex problems. However, they also pose significant challenges and risks. These include concerns about privacy, security, job displacement, and the ethical implications of AI decision-making.",
            "As AI continues to advance and become more integrated into our daily lives, it is crucial that we continue to explore these issues and develop strategies to mitigate the potential negative impacts of AI, while maximizing its benefits.",
            "This will require ongoing research, thoughtful policy-making, and a commitment to ethical principles in the development and use of AI technologies.",
        ];
        
        const sentences = splitTextIntoChunks(text, chunkSize);

        expect(sentences).toEqual(expectedSentences);
    });
});

describe('splitTextIntoChunks', () => {
    it('should remove all extra spaces', () => {
        const text = 'This   is a   text   with   multiple spaces.';
        const expected = 'This is a text with multiple spaces.';

        const result = optimizeText(text);

        expect(result).toEqual(expected);
    });

    it('should trim extra spaces and new lines and tabs on the boundaries', () => {
        const text = '  \n  Left-right \t';
        const expected = 'Left-right';

        const result = optimizeText(text);

        expect(result).toEqual(expected);
    });

    it('should remove all extra spaces including new lines and tabs', () => {
        const text = '\nThis  \n is a\t\t\ttext\n\nwith   multiple spaces.\r';
        const expected = 'This is a text with multiple spaces.';

        const result = optimizeText(text);

        expect(result).toEqual(expected);
    });
});
