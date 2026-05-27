// api/_db.js - Conexión compartida a MongoDB Atlas
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!uri) {
  throw new Error('Por favor define la variable de entorno MONGODB_URI en Vercel');
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, reutilizar la conexión entre hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear una nueva conexión por instancia
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
