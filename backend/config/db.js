const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function connectToMongoDB() {
  try {
    await client.connect();
    await client.db('LogistiX').command({ ping: 1 });
    console.log('Connected to MongoDB');
    return client.db('LogistiX');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

connectToMongoDB().catch(console.dir);

module.exports = { connectToMongoDB };


