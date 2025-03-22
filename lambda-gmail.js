import { askAi } from './ai-chat.js';
import { TelegramChat } from './telegram-chat.js';
import { fetchMessage } from './gmail-fetch-message.js';

/**
 * AWS Lambda function that implements a similar REST service as server.js.
 * It expects an API Gateway event with a POST method and a JSON body containing a 'prompt' field.
 * The function uses ai-chat.js to communicate with the AI.
 *
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} API Gateway Lambda Proxy Output Format
 */
export const handler = async (event) => {
    try {
        // console.log('Received event:', JSON.stringify(event, null, 2));

        // Check if we have a body
        if (!event.body) {
            console.error('No body received in the event');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'No request body provided' })
            };
        }

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (parseError) {
            console.error('Failed to parse body:', event.body);
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }
        // console.log("Event body:\n", JSON.stringify(body, null, 2));
        const messageInfo = await fetchMessage(body.historyId);
        if (!!messageInfo && messageInfo.valid) {
            // console.log("Email message info:\n", JSON.stringify(messageInfo, null, 2));
            const chatMessage = `**Neue E-Mail:**\n_Von:_ ${messageInfo.from}\n_Betreff:_ ${messageInfo.subject}\n_Text:_\n${messageInfo.body.substring(0, 1000)}`;
            // console.log("Chat message:\n", chatMessage);

            // Call the AI chat function
            // const completion = await askAi(prompt);
            const telegramChat = new TelegramChat();
            await telegramChat.sendResponse(chatMessage);
        } else {
            console.info("No added message for historyId:", body.historyId);
        }

        // Return the successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify("")
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
