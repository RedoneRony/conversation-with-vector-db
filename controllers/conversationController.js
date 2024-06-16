import client from '../constants/redisClient.js';
import Conversation from '../models/userConversationModels.js';
// import { LangChain } from 'langchain';
import mongoose from 'mongoose';
// Start a new conversation
export const startConversation = async (req, res) => {
    const conversationId = new mongoose.Types.ObjectId().toString();
    await client.set(conversationId, JSON.stringify({ messages: [] }), 'EX', 900); // TTL 15 minutes
    res.status(200).json({ conversationId });
};

// Handle incoming message
export const handleMessage = async (req, res) => {
    const { conversation_id, message, stream = false } = req.body;
    const conversationData = JSON.parse(await client.get(conversation_id));

    if (!conversationData) {
        return res.status(404).json({ error: 'Conversation not found or expired' });
    }

    // Generate response using LangChain
    const response = await LangChain.generateResponse(message);
    conversationData.messages.push({ sender: 'user', message });
    conversationData.messages.push({ sender: 'bot', message: response });

    await client.set(conversation_id, JSON.stringify(conversationData), 'EX', 900); // Reset TTL

    if (stream) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write(`data: ${response}\n\n`);
        res.end();
    } else {
        res.json({ response });
    }
};

// Collect feedback
export const collectFeedback = async (req, res) => {
    const { conversation_id, messageId, feedback } = req.body;
    const conversationData = JSON.parse(await client.hGetAll(conversation_id));

    if (!conversationData) {
        return res.status(404).json({ error: 'Conversation not found or expired' });
    }

    const conversation = await Conversation.findOne({ conversationId: conversation_id });
    if (conversation) {
        conversation.feedback.push({ messageId, feedback });
        await conversation.save();
    } else {
        await Conversation.create({ conversationId: conversation_id, feedback: [{ messageId, feedback }] });
    }

    res.status(200).json({ status: 'Feedback recorded' });
};

// End conversation
export const endConversation = async (req, res) => {
    const { conversation_id } = req.body;
    await client.del(conversation_id);
    res.status(200).json({ status: 'Conversation ended' });
};
