import { removeUtmSource } from './ai-chat.js';
import { jest } from '@jest/globals';

describe('removeUtmSource', () => {
    test('should remove utm_source=openai when it is the only parameter', () => {
        const input = 'Check out this link: https://example.com?utm_source=openai';
        const expected = 'Check out this link: https://example.com';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should remove utm_source=openai when it is the first of multiple parameters', () => {
        const input = 'https://example.com?utm_source=openai&param=value';
        const expected = 'https://example.com?param=value';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should remove utm_source=openai when it is in the middle of parameters', () => {
        const input = 'https://example.com?param1=value1&utm_source=openai&param2=value2';
        const expected = 'https://example.com?param1=value1&param2=value2';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should remove utm_source=openai when it is the last parameter', () => {
        const input = 'https://example.com?param=value&utm_source=openai';
        const expected = 'https://example.com?param=value';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should handle multiple URLs in the same text', () => {
        const input = 'First link: https://example1.com?utm_source=openai and second link: https://example2.com?param=value&utm_source=openai';
        const expected = 'First link: https://example1.com and second link: https://example2.com?param=value';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should not modify URLs without utm_source parameter', () => {
        const input = 'https://example.com?param=value';
        expect(removeUtmSource(input)).toBe(input);
    });

    test('should handle text without any URLs', () => {
        const input = 'This is just regular text without any URLs';
        expect(removeUtmSource(input)).toBe(input);
    });

    test('should handle empty string', () => {
        expect(removeUtmSource('')).toBe('');
    });

    test('should handle parenthesized URLs', () => {
        const input = 'Check out this link: (https://example.com?utm_source=openai)';
        const expected = 'Check out this link: (https://example.com)';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should handle markdown links', () => {
        const input = 'Check out this link: [title](https://example.com?utm_source=openai)';
        const expected = 'Check out this link: [title](https://example.com)';
        expect(removeUtmSource(input)).toBe(expected);
    });

    test('should handle markdown links with parenthesis', () => {
        const input = 'Check out this link: ([title](https://example.com?utm_source=openai))';
        const expected = 'Check out this link: ([title](https://example.com))';
        expect(removeUtmSource(input)).toBe(expected);
    });
}); 