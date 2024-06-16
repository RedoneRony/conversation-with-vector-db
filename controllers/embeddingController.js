// controllers/embeddingController.js
import { upsertEmbeddings, deleteEmbeddingsByIds, deleteAllEmbeddingsInNamespace } from '../models/embeddingmodel.js';
import EmbeddedData from '../models/embeddedModel.js';
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

    // Creating a new Embedded Data
    const newEmbeddedData = new EmbeddedData({
      text: text,
      values: formattedVectors[0]?.values,
      metadata: formattedVectors[0]?.metadata,
      namspace_itemId: formattedVectors[0]?.id,
      nameSpaceName: namespace
    });

    // Saving Embedded Data
    await newEmbeddedData.save();

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

    // filter data based on id
    const data = await EmbeddedData.findOne({ namspace_itemId: ids });

    // update text field value
    if (data) {
      data.text = text;
      await data.save();
    }

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
    // delete data based on id
    await EmbeddedData.deleteOne({ namspace_itemId: ids });

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
