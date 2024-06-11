// config/pinecone.js
// import { PineconeClient } from '@pinecone-database/pinecone';
// import pkg from '@pinecone-database/pinecone';
// const { PineconeClient } = pkg;
// import dotenv from 'dotenv';

// dotenv.config();

// const pinecone = new PineconeClient();
// await pinecone.init({
//   apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT
// });

// export default pinecone;


import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  // environment: process.env.PINECONE_ENVIRONMENT
});
export default pinecone;
