import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDb } from './lib/db.mjs';
import { json, readBody } from './lib/http.mjs';
import { signToken, authenticate } from './lib/auth.mjs';

// Todas las rutas /api/* llegan a esta función (mismas rutas que el Proyecto 1).
export const config = { path: '/api/*' };

const OID = /^[a-f\d]{24}$/i;

// [campo, tipo (s=texto, n=número, r=referencia ObjectId), obligatorio]
const RES = {
  ciudades: {
    fields: [['nombre', 's', 1], ['pais', 's', 1], ['continente', 's', 1], ['poblacion', 'n', 1], ['imagen_url', 's', 0]],
  },
  arquitectos: {
    fields: [['nombre', 's', 1], ['nacionalidad', 's', 1], ['anio_nacimiento', 'n', 0], ['biografia', 's', 0], ['imagen_url', 's', 0]],
  },
  edificios: {
    fields: [
      ['nombre', 's', 1], ['altura_metros', 'n', 1], ['pisos', 'n', 1], ['anio_finalizacion', 'n', 1],
      ['descripcion', 's', 0], ['imagen_url', 's', 0], ['ciudad_id', 'r', 1], ['arquitecto_id', 'r', 1],
    ],
    refs: { ciudad_id: 'ciudades', arquitecto_id: 'arquitectos' },
  },
};
// Para ciudades/arquitectos: campo de edificios que los referencia
const FK = { ciudades: 'ciudad_id', arquitectos: 'arquitecto_id' };

// _id -> id (string) y ObjectId -> string, para que el frontend no cambie.
const ser = (d) =>
  d && {
    id: String(d._id),
    ...Object.fromEntries(
      Object.entries(d).filter(([k]) => k !== '_id').map(([k, v]) => [k, v instanceof ObjectId ? String(v) : v])
    ),
  };

function validate(cfg, body) {
  const data = {};
  const errors = [];
  for (const [k, t, req] of cfg.fields) {
    let v = body[k];
    if (v === undefined || v === null || v === '') {
      if (req) errors.push(`${k} es obligatorio`);
      else data[k] = null;
      continue;
    }
    if (t === 's') {
      if (typeof v !== 'string') { errors.push(`${k} debe ser texto`); continue; }
      v = v.trim();
    } else if (t === 'n') {
      v = Number(v);
      if (!Number.isFinite(v)) { errors.push(`${k} debe ser numérico`); continue; }
    } else if (t === 'r') {
      if (!OID.test(String(v))) { errors.push(`${k} es un id inválido`); continue; }
      v = new ObjectId(String(v));
    }
    data[k] = v;
  }
  return { data, errors };
}

async function checkRefs(db, cfg, data) {
  for (const [campo, coleccion] of Object.entries(cfg.refs || {})) {
    if (!(await db.collection(coleccion).findOne({ _id: data[campo] }, { projection: { _id: 1 } })))
      return `${campo} no existe en ${coleccion}`;
  }
  return null;
}

// ------------------------- AUTENTICACIÓN -------------------------
async function handleAuth(req, db, action) {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  const body = await readBody(req);
  if (!body) return json({ error: 'Cuerpo JSON inválido' }, 400);
  const usuarios = db.collection('usuarios');
  const pub = (u) => ({ id: String(u._id), nombre: u.nombre, correo: u.correo, rol: u.rol });

  if (action === 'register') {
    const nombre = String(body.nombre || '').trim();
    const correo = String(body.correo || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!nombre || !/^\S+@\S+\.\S+$/.test(correo)) return json({ error: 'Nombre y correo válidos son obligatorios' }, 400);
    if (password.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
    if (await usuarios.findOne({ correo })) return json({ error: 'Ese correo ya está registrado' }, 409);
    const doc = { nombre, correo, password: await bcrypt.hash(password, 10), rol: 'user', creado: new Date() };
    try {
      doc._id = (await usuarios.insertOne(doc)).insertedId;
    } catch (e) {
      if (e.code === 11000) return json({ error: 'Ese correo ya está registrado' }, 409);
      throw e;
    }
    return json({ token: signToken(doc), user: pub(doc) }, 201);
  }

  if (action === 'login') {
    const correo = String(body.correo || '').trim().toLowerCase();
    const u = await usuarios.findOne({ correo });
    const ok = u && (await bcrypt.compare(String(body.password || ''), u.password));
    if (!ok) return json({ error: 'Credenciales inválidas' }, 401);
    return json({ token: signToken(u), user: pub(u) });
  }
  return json({ error: 'Ruta no encontrada' }, 404);
}

// ------------------------- HANDLER PRINCIPAL -------------------------
export default async (req) => {
  try {
    const url = new URL(req.url);
    const [res, id, extra] = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const db = await getDb();

    if (res === 'auth') return await handleAuth(req, db, id);

    const cfg = RES[res];
    if (!cfg || extra) return json({ error: 'Recurso no encontrado' }, 404);
    if (id && !OID.test(id)) return json({ error: 'ID inválido' }, 400);

    const col = db.collection(res);
    const m = req.method;

    // ---- Consultas públicas ----
    if (m === 'GET' && !id) {
      const docs = await col.find().sort(res === 'edificios' ? { altura_metros: -1 } : { nombre: 1 }).toArray();
      if (res !== 'edificios') return json(docs.map(ser));
      const [cs, as] = await Promise.all([db.collection('ciudades').find().toArray(), db.collection('arquitectos').find().toArray()]);
      const cm = new Map(cs.map((c) => [String(c._id), c.nombre]));
      const am = new Map(as.map((a) => [String(a._id), a.nombre]));
      return json(docs.map((d) => ({
        ...ser(d),
        ciudad_nombre: cm.get(String(d.ciudad_id)) ?? null,
        arquitecto_nombre: am.get(String(d.arquitecto_id)) ?? null,
      })));
    }

    if (m === 'GET') {
      const doc = await col.findOne({ _id: new ObjectId(id) });
      if (!doc) return json({ error: 'No encontrado' }, 404);
      const out = ser(doc);
      if (res === 'edificios') {
        out.ciudad = ser(await db.collection('ciudades').findOne({ _id: doc.ciudad_id }));
        out.arquitecto = ser(await db.collection('arquitectos').findOne({ _id: doc.arquitecto_id }));
        out.ciudad_nombre = out.ciudad?.nombre ?? null;
        out.arquitecto_nombre = out.arquitecto?.nombre ?? null;
      } else {
        const eds = await db.collection('edificios').find({ [FK[res]]: doc._id }).sort({ altura_metros: -1 }).toArray();
        out.edificios = eds.map(ser);
      }
      return json(out);
    }

    // ---- Operaciones protegidas (crear / editar / borrar) ----
    if (!['POST', 'PUT', 'DELETE'].includes(m)) return json({ error: 'Método no permitido' }, 405);
    const a = authenticate(req);
    if (a.error) return json({ error: a.error }, 401);

    if (m === 'DELETE') {
      if (!id) return json({ error: 'ID requerido' }, 400);
      if (a.user.rol !== 'admin') return json({ error: 'Solo un administrador puede eliminar registros' }, 403);
      if (FK[res] && (await db.collection('edificios').countDocuments({ [FK[res]]: new ObjectId(id) })))
        return json({ error: 'No se puede eliminar: tiene edificios relacionados' }, 409);
      const r = await col.deleteOne({ _id: new ObjectId(id) });
      return r.deletedCount ? json({ ok: true }) : json({ error: 'No encontrado' }, 404);
    }

    const body = await readBody(req);
    if (!body) return json({ error: 'Cuerpo JSON inválido' }, 400);
    const { data, errors } = validate(cfg, body);
    if (errors.length) return json({ error: errors.join('; ') }, 400);
    const refErr = await checkRefs(db, cfg, data);
    if (refErr) return json({ error: refErr }, 400);

    if (m === 'POST') {
      if (id) return json({ error: 'Método no permitido' }, 405);
      const r = await col.insertOne(data);
      return json(ser({ _id: r.insertedId, ...data }), 201);
    }

    // PUT
    if (!id) return json({ error: 'ID requerido' }, 400);
    const r = await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
    if (!r.matchedCount) return json({ error: 'No encontrado' }, 404);
    return json(ser({ _id: new ObjectId(id), ...data }));
  } catch (err) {
    console.error(err);
    return json({ error: 'Error interno del servidor' }, 500);
  }
};
