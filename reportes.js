// api/reportes.js
import clientPromise from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await clientPromise;
    const db = client.db('transired');
    const col = db.collection('reportes');

    // POST → guardar nuevo reporte ciudadano
    if (req.method === 'POST') {
      const { tipo, descripcion, ubicacion, usuario, direccion } = req.body;

      if (!tipo || !descripcion) {
        return res.status(400).json({ error: 'Tipo y descripción son requeridos' });
      }

      const nuevoReporte = {
        tipo,           // Ej: "accidente", "semáforo roto", "bache", etc.
        descripcion,
        ubicacion: ubicacion || null,   // { lat, lng }
        direccion: direccion || '',
        usuario: usuario || 'anónimo',
        estado: 'pendiente',            // pendiente | en revisión | resuelto
        fecha: new Date()
      };

      const result = await col.insertOne(nuevoReporte);
      return res.status(201).json({ ok: true, id: result.insertedId });
    }

    // GET → obtener todos los reportes (con filtro opcional por estado)
    if (req.method === 'GET') {
      const { estado } = req.query;
      const filtro = estado ? { estado } : {};
      const reportes = await col
        .find(filtro)
        .sort({ fecha: -1 })
        .limit(50)
        .toArray();
      return res.status(200).json(reportes);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en /api/reportes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}