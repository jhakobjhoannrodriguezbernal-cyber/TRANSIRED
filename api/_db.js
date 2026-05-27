// api/_db.js - Conexión compartida a MongoDB Atlas
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Falta la variable de entorno MONGODB_URI en Vercel');
}

// Reutilizar conexión entre llamadas en producción
let cachedClient = null;

export async function conectarDB() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}
