// api/noticias.js
import clientPromise from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await clientPromise;
    const db = client.db('transired');
    const col = db.collection('noticias');

    // GET → obtener noticias para mostrar en Noticias.html
    if (req.method === 'GET') {
      const noticias = await col
        .find({ activa: true })
        .sort({ fecha: -1 })
        .limit(20)
        .toArray();
      return res.status(200).json(noticias);
    }

    // POST → crear noticia (para uso administrativo futuro)
    if (req.method === 'POST') {
      const { titulo, contenido, imagen, categoria } = req.body;
      if (!titulo || !contenido) {
        return res.status(400).json({ error: 'Título y contenido son requeridos' });
      }

      const noticia = {
        titulo,
        contenido,
        imagen: imagen || null,
        categoria: categoria || 'general',
        activa: true,
        fecha: new Date()
      };

      const result = await col.insertOne(noticia);
      return res.status(201).json({ ok: true, id: result.insertedId });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en /api/noticias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}