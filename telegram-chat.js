import telegramifyMarkdown from 'telegramify-markdown';
import dotenv from 'dotenv';

dotenv.config();

const allowedChatId = process.env.TELEGRAM_CHAT_ID;
if (!allowedChatId) {
    throw new Error('TELEGRAM_CHAT_ID is not set');
}
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

export class TelegramChat {
    constructor(incomingChat) {
        // console.log('incomingChat:', incomingChat);
        this.incomingChat = incomingChat;
    }
    
    getMessageText() {
        if (this.getChatId() != allowedChatId) {
            console.error('Chat ID is not authorized:', this.getChatId());
            return null;
        }
        if (!!this.incomingChat.message.voice) {
            console.error('voice is not supported', this.incomingChat.message.voice);
            return "Sag bitte, das Sprachanfragen nicht unterstützt werden.";
        }
        // console.log('messageText:', this.incomingChat.message.text);
        return this.incomingChat.message.text;
    }

    getChatId() {
        // console.log('getChatId:', this.incomingChat.message.chat.id);
        return this.incomingChat.message.chat.id;
    }

    async sendResponse(responseText) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: allowedChatId,
                    text: telegramifyMarkdown(responseText),
                    parse_mode: "MarkdownV2"
                })
            });
            // console.log('SendMessage Response:', await response.json());
        } catch (error) {
            console.error('SendMessage Error:', error);
        }
    }
}
