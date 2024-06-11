// models/embeddingModel.js
import pinecone from '../constants/pinecone.js';
import axios from "axios";
export const upsertEmbeddings = async (namespace, vectors) => {
  // const index = pinecone.index('chat-bot');
  // const properties = await index.describe();
  const indexProterties = await pinecone.describeIndex('chat-bot');
  // console.log(await pinecone.describeIndex('chat-bot'));
  
  console.log(indexProterties);

  // try {
  //   const response = await axios.post(
  //     `${indexProterties?.host}/vectors/upsert`,
  //     {
  //       vectors: [
  //         {
  //           "id": "sample-id-3",
  //           "values": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
  //         }
          
  //       ],
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Api-Key': process.env.PINECONE_API_KEY,
  //       },
  //     }
  //   );
  //   console.log(response);
  // } catch (error) {
  //   console.error('Error upserting record:', error);

  // }


    // await index.namespace('ns1').upsert([
    //   {
    //      id: 'vec1', 
    //      values: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    //      metadata: { genre: 'drama' }
    //   },
    //   {
    //      id: 'vec2', 
    //      values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
    //      metadata: { genre: 'action' }
    //   },
    //   {
    //      id: 'vec3', 
    //      values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    //      metadata: { genre: 'drama' }
    //   },
    //   {
    //      id: 'vec4', 
    //      values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
    //      metadata: { genre: 'action' }
    //   }
    // ]);
//   const index = pinecone.Index(namespace);
//   await index.upsert(vectors);
};

export const deleteEmbeddingsByIds = async (namespace, ids) => {
  const index = pinecone.Index(namespace);
  await index.delete({ ids });
};

export const deleteAllEmbeddingsInNamespace = async (namespace) => {
  const index = pinecone.Index(namespace);
  await index.deleteAll();
};
