// models/embeddingModel.js
import pinecone from '../constants/pinecone.js';

export const upsertEmbeddings = async (namespace, index, vectors) => {
  const indexData = pinecone.index(index);
  try {
    await indexData.namespace(namespace).upsert(vectors);
    return "successfully";
  } catch (error) {
    return "failed";
  }
};

export const deleteEmbeddingsByIds = async (index, namespace, ids) => {

  try {
    const indexData = pinecone.Index(index);
    const nameSpaceData = indexData.namespace(namespace);
    await nameSpaceData.deleteOne(ids);
    return "successfully";
  } catch (error) {
    return "failed";
  }
};

export const deleteAllEmbeddingsInNamespace = async (index, namespace) => {

  try {
    const indexData = pinecone.Index(index);
    await indexData.namespace(namespace).deleteAll();
    return "successfully";
  } catch (error) {
    return "failed";
  }
};
