// controllers/embeddingController.js
import fs from 'fs';
import { extractEmbeddingsFromHNSWLib, generateEmbeddings, splitText } from '../utils/textutils.js';
import { upsertEmbeddings, deleteEmbeddingsByIds, deleteAllEmbeddingsInNamespace } from '../models/embeddingmodel.js';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import natural from 'natural';


// Initialize a TF-IDF vectorizer
const tfidf = new natural.TfIdf();
// Function to convert text into numerical vector using TF-IDF
const textToVector = (text) => {
    // Add document to the TF-IDF vectorizer
    tfidf.addDocument(text);

    // Get TF-IDF vector representation
    const vector = tfidf.listTerms(0 /* Document index */)
        .map(({ term, tfidf }) => tfidf);

    return vector;
};


export const addEmbeddedText = async (req, res) => {
  try {
    
    const namespace = "pinecone-index"
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = file.buffer.toString('utf8');
    // const chunks = await splitText(text);
    let vectors;
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    vectors = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({openAIApiKey: process.env.CHATGPTAPIKEY}));
    vectors = extractEmbeddingsFromHNSWLib(vectors);
    

    const formattedVectors = vectors.map(vector => ({
        id: vector.id,
        values: textToVector(vector.values), // Wrap the values in an array
        metadata: vector.metadata
    }));

    // console.log(formattedVectors);
    // console.log("formattedVectors", formattedVectors);
    await upsertEmbeddings(namespace, formattedVectors);

    // fs.unlinkSync(file.path);

    res.status(200).json({ message: 'Text embedded and stored successfully.' });
  } catch (error) {
    console.error('Error adding embedded text:', error);
    res.status(500).json({ error: 'Failed to add embedded text.' });
  }
};

export const updateEmbeddedText = async (req, res) => {
  try {
    const { text, namespace, ids } = req.body;
    const chunks = await splitText(text);
    const embeddings = await generateEmbeddings(chunks);

    const vectors = embeddings.map((embedding, idx) => ({
      id: ids[idx],
      values: embedding,
    }));

    await upsertEmbeddings(namespace, vectors);

    res.status(200).json({ message: 'Embeddings updated successfully.' });
  } catch (error) {
    console.error('Error updating embeddings:', error);
    res.status(500).json({ error: 'Failed to update embeddings.' });
  }
};

export const deleteEmbeddings = async (req, res) => {
  try {
    const { namespace, ids } = req.body;
    await deleteEmbeddingsByIds(namespace, ids);
    res.status(200).json({ message: 'Embeddings deleted successfully.' });
  } catch (error) {
    console.error('Error deleting embeddings:', error);
    res.status(500).json({ error: 'Failed to delete embeddings.' });
  }
};

export const deleteNamespaceEmbeddings = async (req, res) => {
  try {
    const { namespace } = req.body;
    await deleteAllEmbeddingsInNamespace(namespace);
    res.status(200).json({ message: 'All embeddings in namespace deleted successfully.' });
  } catch (error) {
    console.error('Error deleting namespace embeddings:', error);
    res.status(500).json({ error: 'Failed to delete namespace embeddings.' });
  }
};
