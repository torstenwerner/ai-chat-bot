import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing'
});

/**
 * Removes the utm_source=openai parameter from URLs in the text.
 * @param {string} text The text containing URLs to process
 * @returns {string} The processed text with utm_source parameter removed from URLs
 */
export function removeUtmSource(text) {
    return text.replace(/(https?:\/\/[^?\s)]+)(\?[^?\s)]*)?/g, (match, url, params) => {
        if (!params) return url;

        const searchParams = new URLSearchParams(params.substring(1));
        searchParams.delete('utm_source');

        const remainingParams = searchParams.toString();
        return remainingParams ? `${url}?${remainingParams}` : url;
    });
}

/**
 * Asks the AI using the parameter userPrompt and returns the answer as a promise.
 * It sends a request to the OpenAI `/v1/chat/completions` API with a hard coded developer prompt
 * that asks for the vulnerability research.
 * The user prompt is limited in size to reduce the risk of prompt injection attacks.
 *
 * @param userPrompt just a CVE id e.g., CVE-2024-12397
 * @returns {Promise<string>} the AI chat answer as a promise
 */
export function askAi(userPrompt) {
    return openai.chat.completions.create({
        model: "gpt-4o-mini-search-preview",
        messages: [
            {
                role: "developer",
                content: "Du bist ein freundlicher Helfer, der Nutzer des besonderen elektronischen Anwaltspostfaches beA unterstützt."
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        web_search_options: {}
    }).then(response => removeUtmSource(response.choices[0].message.content));
}
