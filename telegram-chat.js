import telegramifyMarkdown from 'telegramify-markdown';
import dotenv from 'dotenv';

dotenv.config();

const allowedChatId = process.env.TELEGRAM_CHAT_ID;
const botToken = process.env.TELEGRAM_BOT_TOKEN;

export class TelegramChat {
    constructor(incomingChat) {
        console.log('incomingChat:', incomingChat);
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
        console.log('messageText:', this.incomingChat.message.text);
        return this.incomingChat.message.text;
    }

    getChatId() {
        console.log('getChatId:', this.incomingChat.message.chat.id);
        return this.incomingChat.message.chat.id;
    }
}
