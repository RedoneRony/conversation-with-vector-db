// utils/textUtils.js
import { OpenAI } from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'; // Adjust the import based on your langchain package
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.CHATGPTAPIKEY,
});

export const generateEmbeddings = async (texts) => {
  const embeddings = await openai.createEmbedding({
    model: 'text-embedding-ada-002', // Example model
    input: texts,
  });
  return embeddings.data.map(embedding => embedding.embedding);
};

export const splitText = async (text) => {
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500 });
    const docs = await textSplitter.createDocuments([text]);
    return docs.map(doc => doc.pageContent);
};


export const extractEmbeddingsFromHNSWLib = (hnswLib) => {
    const documents = [...hnswLib.docstore._docs.entries()];
    const embeddings = documents.map(([, doc]) => doc.embedding);
    // console.log(documents)
    const vectors = documents.map(([id, doc], idx) => ({
      id: id,
      values: doc.pageContent,
      metadata: doc.metadata,
    }));
  
    return vectors;
  };
  
