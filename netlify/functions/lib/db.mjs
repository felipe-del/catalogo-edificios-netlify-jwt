import dns from 'node:dns';
import { MongoClient } from 'mongodb';

// Solo en local (netlify dev): se fuerza un DNS público para las consultas SRV
if (process.env.NETLIFY_DEV) dns.setServers(['8.8.8.8', '1.1.1.1']);

// La promesa se guarda fuera del handler: Netlify reutiliza el contenedor
// entre invocaciones "calientes", así la conexión a Atlas se reutiliza.
let clientPromise;

export async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI no está configurada');
  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 });
    clientPromise = client.connect().catch((err) => {
      clientPromise = undefined; // permite reintentar en la próxima invocación
      throw err;
    });
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'edificios');
}
