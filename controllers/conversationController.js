import client from '../constants/redisClient.js';
import Conversation from '../models/userConversationModels.js';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { loadQAStuffChain } from 'langchain/chains'
import { Document } from 'langchain/document'
import mongoose from 'mongoose';
import pinecone from '../constants/pinecone.js';


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

    const index = pinecone.Index('irfan-ai');

    // 3. Create query embedding
    const queryEmbedding = await new OpenAIEmbeddings({ openAIApiKey: process.env.CHATGPTAPIKEY, model: "text-embedding-ada-002" }).embedQuery(message);
    // 4. Query Pinecone index and return top 10 matches
    let queryResponse = await index.namespace("pinecone-index").query({
        vector: queryEmbedding,
        topK: 10,
        includeValues: true,
    });

    if (queryResponse.matches.length) {
        // 7. Create an OpenAI instance and load the QAStuffChain
        const llm = new OpenAI({ openAIApiKey: process.env.CHATGPTAPIKEY, modelName: 'gpt-3.5-turbo' });
        const chain = loadQAStuffChain(llm);
        // 8. Extract and concatenate page content from matched documents
        const concatenatedPageContent = queryResponse.matches
            .map((match) => match?.metadata?.pageContent)
            .join(" ");
        // 9. Execute the chain with input documents and question
        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPageContent })],
            question: message,
        });

        // user information in future i will take from db

        conversationData.messages.push({ sender: 'user', message });
        conversationData.messages.push({ receiver: 'bot', message: result?.text });

        await client.set(conversation_id, JSON.stringify(conversationData), 'EX', 900); // Reset TTL

        if (stream) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            res.write(`data: ${result?.text}\n\n`);
            res.end();
        } else {
            res.status(200).json(conversationData);
        }

    } else {

        // if there are no matches, so GPT-3 will not be queried
        // user information in future i will take from db
        conversationData.messages.push({ sender: 'user', message });
        conversationData.messages.push({ receiver: 'bot', message: "please provide relevant questions...." });

        await client.set(conversation_id, JSON.stringify(conversationData), 'EX', 900); // Reset TTL

        if (stream) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            res.write(`data: ${conversationData}\n\n`);
            res.end();
        } else {
            res.status(200).json(conversationData);
        }
    }

};

// Collect feedback
export const collectFeedback = async (req, res) => {
    const { conversation_id, feedback } = req.body;
    const conversationData = JSON.parse(await client.get(conversation_id));

    if (!conversationData) {
        return res.status(404).json({ error: 'Conversation not found or expired' });
    }

    const conversation = await Conversation.findOne({ conversationId: conversation_id });
    if (conversation) {
        conversation.feedback.push({ feedback });
        await conversation.save();
    } else {
        await Conversation.create({ conversationId: conversation_id, feedback: [{ feedback }] });
    }

    res.status(200).json({ status: 'Feedback recorded' });
};

// End conversation
export const endConversation = async (req, res) => {
    const { conversation_id } = req.body;
    await client.del(conversation_id);
    res.status(200).json({ status: 'Conversation ended' });
};
