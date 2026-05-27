// api/usuarios.js
import { conectarDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await conectarDB();
    const col = client.db('transired').collection('usuarios');

    if (req.method === 'POST') {
      const { nombre, email, foto } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requerido' });

      await col.updateOne(
        { email },
        {
          $set: { nombre, foto, ultimoLogin: new Date() },
          $setOnInsert: { email, fechaRegistro: new Date(), rol: 'ciudadano' }
        },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const usuarios = await col
        .find({}, { projection: { nombre: 1, email: 1, rol: 1, fechaRegistro: 1 } })
        .toArray();
      return res.status(200).json(usuarios);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en /api/usuarios:', err);
    res.status(500).json({ error: err.message });
  }
}
