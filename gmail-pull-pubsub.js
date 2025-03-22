import { v1 } from '@google-cloud/pubsub';
import { fetchMessage } from './gmail-fetch-message.js';

// Initialize PubSub client
const subClient = new v1.SubscriberClient();

const subscriptionName = 'projects/gmail-webhook-454508/subscriptions/MailHook-sub';

// The maximum number of messages returned for this request.
// Pub/Sub may return fewer than the number specified.
const request = {
    subscription: subscriptionName,
    maxMessages: 1,
};

async function pullMessages() {
    // The subscriber pulls a specified number of messages.
    const [response] = await subClient.pull(request);

    // Process the messages.
    const ackIds = [];
    for (const message of response.receivedMessages || []) {
        const messageData = JSON.parse(message.message.data);
        const historyId = messageData.historyId;
        const messageInfo = await fetchMessage(historyId);
        console.log(JSON.stringify(messageInfo, null, 2));
        if (message.ackId) {
            ackIds.push(message.ackId);
        }
    }

    if (ackIds.length !== 0) {
        // Acknowledge all of the messages. You could also acknowledge
        // these individually, but this is more efficient.
        const ackRequest = {
            subscription: subscriptionName,
            ackIds: ackIds,
        };

        await subClient.acknowledge(ackRequest);
    }
}

// Run the script
pullMessages(); 