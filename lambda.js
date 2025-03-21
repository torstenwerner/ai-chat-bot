// import { askAi } from './ai-chat.js';

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

        const chatId = process.env.TELEGRAM_CHAT_ID;
        // console.log('Chat ID:', chatId);
        if (body.message.chat.id != chatId) {
            console.error('Chat ID is not authorized:', body.message.chat.id);
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Not authorized' })
            };
        }

        // Call the AI chat function
        const prompt = body.message.text;
        // const completion = await askAi(body.prompt);
        const completion = `Hello, ${prompt}`;

        // Send the response to the Telegram bot
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: completion
                })
            });
            console.log('SendMessage Response:', await response.json());
        } catch (error) {
            console.error('SendMessage Error:', error);
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
