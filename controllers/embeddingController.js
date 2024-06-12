// controllers/embeddingController.js
import fs from 'fs';
import { extractEmbeddingsFromHNSWLib, generateEmbeddings, splitText } from '../utils/textutils.js';
import { upsertEmbeddings, deleteEmbeddingsByIds, deleteAllEmbeddingsInNamespace } from '../models/embeddingmodel.js';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import OpenAI from "openai";
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();


export const addEmbeddedText = async (req, res) => {
  try {

    const namespace = "pinecone-index"
    const index = 'irfan-ai';

    const openai = new OpenAI({
      apiKey: process.env.CHATGPTAPIKEY,
    });
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = file.buffer.toString('utf8');

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const formattedVectors = [{
      id: uuidv4(),
      values: embedding?.data[0].embedding,
      metadata: embedding?.usage
    }];

    const response = await upsertEmbeddings(namespace, index, formattedVectors);

    res.status(200).json({ message: `Text embedded and stored ${response}.` });
  } catch (error) {
    console.error('Error adding embedded text:', error);
    res.status(500).json({ error: 'Failed to add embedded text.' });
  }
};

export const updateEmbeddedText = async (req, res) => {
  try {
    const { text, namespace, ids } = req.body;
    const index = 'irfan-ai';

    const openai = new OpenAI({
      apiKey: process.env.CHATGPTAPIKEY,
    });

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const formattedVectors = [{
      id: ids,
      values: embedding?.data[0].embedding,
      metadata: embedding?.usage
    }];

    const response = await upsertEmbeddings(namespace, index, formattedVectors);
    res.status(200).json({ message: `Text embedded and stored ${response}.` });
  } catch (error) {
    console.error('Error updating embeddings:', error);
    res.status(500).json({ error: 'Failed to update embeddings.' });
  }
};

export const deleteEmbeddings = async (req, res) => {
  try {
    const { namespace, ids } = req.body;
    const index = 'irfan-ai';
    const response = await deleteEmbeddingsByIds(index, namespace, ids);
    res.status(200).json({ message: `Embeddings deletion ${response}` });
  } catch (error) {
    console.error('Error deleting embeddings:', error);
    res.status(500).json({ error: 'Failed to delete embeddings.' });
  }
};

export const deleteNamespaceEmbeddings = async (req, res) => {
  try {
    const { namespace } = req.body;
    const index = 'irfan-ai';
    const response = await deleteAllEmbeddingsInNamespace(index, namespace);
    res.status(200).json({ message: `All embeddings in namespace deleted ${response}.` });
  } catch (error) {
    console.error('Error deleting namespace embeddings:', error);
    res.status(500).json({ error: 'Failed to delete namespace embeddings.' });
  }
};
