import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Migra los datos del Proyecto 1 (seed.sql) a MongoDB Atlas.
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const sql = readFileSync(new URL('../seed.sql', import.meta.url), 'utf8');

// Lee los INSERT ... VALUES (...),(...); de una tabla y devuelve objetos.
function parseTable(table) {
  const m = new RegExp(`INSERT INTO ${table}\\s*\\(([^)]*)\\)\\s*VALUES`, 'i').exec(sql);
  if (!m) throw new Error(`No se encontró INSERT de ${table}`);
  const cols = m[1].split(',').map((c) => c.trim());
  const rows = [];
  let row = null, tok = '', inStr = false, wasStr = false;
  const push = () => {
    row.push(wasStr ? tok : tok.trim() === '' ? null : Number(tok.trim()));
    tok = ''; wasStr = false;
  };
  for (let i = m.index + m[0].length; i < sql.length; i++) {
    const c = sql[i];
    if (inStr) {
      if (c === "'") { if (sql[i + 1] === "'") { tok += "'"; i++; } else inStr = false; }
      else tok += c;
      continue;
    }
    if (c === "'") { inStr = true; wasStr = true; tok = ''; continue; }
    if (c === '(' && !row) { row = []; tok = ''; continue; }
    if (!row) { if (c === ';') break; continue; }
    if (c === ',') { push(); continue; }
    if (c === ')') { push(); rows.push(Object.fromEntries(cols.map((k, j) => [k, row[j]]))); row = null; continue; }
    if (!wasStr) tok += c; // fuera de comillas, ignora espacios tras un texto
  }
  return rows;
}

if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI en .env');
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || 'edificios');

for (const c of ['edificios', 'ciudades', 'arquitectos']) await db.collection(c).deleteMany({});

const ciudades = parseTable('ciudades');
const arquitectos = parseTable('arquitectos');
const edificios = parseTable('edificios');

// Los ids numéricos de SQL (1..n) se convierten en ObjectId manteniendo las relaciones.
const cIds = (await db.collection('ciudades').insertMany(ciudades)).insertedIds;
const aIds = (await db.collection('arquitectos').insertMany(arquitectos)).insertedIds;
await db.collection('edificios').insertMany(
  edificios.map((e) => ({ ...e, ciudad_id: cIds[e.ciudad_id - 1], arquitecto_id: aIds[e.arquitecto_id - 1] }))
);

// Usuarios: índice único por correo + administrador inicial (opcional)
await db.collection('usuarios').createIndex({ correo: 1 }, { unique: true });
if (process.env.ADMIN_CORREO && process.env.ADMIN_PASSWORD) {
  await db.collection('usuarios').updateOne(
    { correo: process.env.ADMIN_CORREO.toLowerCase() },
    {
      $set: { nombre: 'Administrador', password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10), rol: 'admin' },
      $setOnInsert: { creado: new Date() },
    },
    { upsert: true }
  );
  console.log('Admin listo:', process.env.ADMIN_CORREO);
}

console.log(`Insertados: ${ciudades.length} ciudades, ${arquitectos.length} arquitectos, ${edificios.length} edificios`);
await client.close();
