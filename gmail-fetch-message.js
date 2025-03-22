import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials from the file
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
);

// Load token from file
const token = JSON.parse(fs.readFileSync(path.join(__dirname, 'token.json')));
oauth2Client.setCredentials(token);

// Create Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function fetchMessage(historyId) {
    try {
        // First, get the history to find the message ID
        const history = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: historyId,
            // historyTypes: ['messageAdded']
        });
        // console.log("History:\n", JSON.stringify(history, null, 2));

        if (!history.data.history || history.data.history.length === 0) {
            console.log('No messages found for historyId:', historyId);
            return;
        }

        // Get the first message ID from the history
        const messageId = history.data.history[0].messages[0].id;
        console.log("Message ID:\n", messageId);

        // Get the full message
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });
        // console.log("Message:\n", JSON.stringify(message, null, 2));

        // Parse the message headers
        const headers = message.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';

        // Get the message body
        let body = '';
        if (message.data.payload.parts) {
            // Multipart message
            const textPart = message.data.payload.parts.find(part => 
                part.mimeType === 'text/plain'
            );
            if (textPart) {
                body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
        } else if (message.data.payload.body.data) {
            // Single part message
            body = Buffer.from(message.data.payload.body.data, 'base64').toString('utf-8');
        }

        return {
            from,
            subject,
            body,
            messageId
        };
    } catch (error) {
        console.error('Error fetching message:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
    }
}

// Execute the function
// console.log(JSON.stringify(await fetchMessage(12032725), null, 2));