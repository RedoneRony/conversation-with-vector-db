import mongoose from 'mongoose';

// langchain conversation schema
const conversationSchema = new mongoose.Schema({
    conversationId: String,
    messages: [{
        sender: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    feedback: [{
        messageId: String,
        feedback: String
    }]
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
