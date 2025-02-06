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
    
    // Elegimos la base de datos según el entorno
    const dbName = process.env.NODE_ENV === 'test' ? 'LogistiXTest' : 'LogistiX';
    const db = client.db(dbName);

    await db.command({ ping: 1 });
    console.log(`Conectado a MongoDB: ${dbName}`);

    return db;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
}

connectToMongoDB().catch(console.dir);

module.exports = { connectToMongoDB };


