// src/redis-client.js
import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_SERVER
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

await client.connect();

export default client;
