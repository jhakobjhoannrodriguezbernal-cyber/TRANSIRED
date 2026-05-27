// api/noticias.js
import { conectarDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await conectarDB();
    const col = client.db('transired').collection('noticias');

    if (req.method === 'GET') {
      const noticias = await col
        .find({ activa: true })
        .sort({ fecha: -1 })
        .limit(20)
        .toArray();
      return res.status(200).json(noticias);
    }

    if (req.method === 'POST') {
      const { titulo, contenido, imagen, categoria } = req.body;
      if (!titulo || !contenido) {
        return res.status(400).json({ error: 'Título y contenido son requeridos' });
      }

      const result = await col.insertOne({
        titulo,
        contenido,
        imagen: imagen || null,
        categoria: categoria || 'general',
        activa: true,
        fecha: new Date()
      });
      return res.status(201).json({ ok: true, id: result.insertedId });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en /api/noticias:', err);
    res.status(500).json({ error: err.message });
  }
}
