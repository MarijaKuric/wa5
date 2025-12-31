import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;
const dbName = process.env.MONGO_DB_NAME;

const mongoURI = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

let client;

async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(mongoURI);
      await client.connect();
      console.log('Uspješno povezano na MongoDB');
    }
    return client.db(dbName);
  } catch (error) {
    console.error('Greška pri povezivanju na MongoDB:', error);
    throw error;
  }
}

export { connectToDatabase };
