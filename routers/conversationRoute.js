import express from 'express';
import { startConversation, handleMessage, collectFeedback, endConversation } from '../controllers/conversationController.js';

const conversationRouter = express.Router();

conversationRouter.post('/start', startConversation);
conversationRouter.post('/message', handleMessage);
conversationRouter.post('/feedback', collectFeedback);
conversationRouter.delete('/end', endConversation);

export default conversationRouter;
