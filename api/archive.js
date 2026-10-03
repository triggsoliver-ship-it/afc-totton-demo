import { readJson, writeJson, ok, isAuthed } from './_util.js';

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

// CORS: allow the old club site origin during the migration harvest only.
const CORS_ORIGIN = 'https://www.afctotton.com';
function cors(req, res) {
  if ((req.headers.origin || '') === CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, x-admin-key');
  }
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return ok(res, await readJson('data/archive.json', []));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!Array.isArray(b.items) || !b.items.length) return res.status(400).json({ error: 'items required' });
    const clean = b.items.map(i => ({
      slug: String((i && i.slug) || '').slice(0, 160),
      title: String((i && i.title) || '').slice(0, 220),
      cat: String((i && i.cat) || '').trim().slice(0, 60),
      date: String((i && i.date) || '').slice(0, 30),
      img: String((i && i.img) || '').slice(0, 400),
      body: String((i && i.body) || '').slice(0, 60000)
    })).filter(i => i.slug && i.title);
    let items;
    if (b.replace === true) {
      items = clean;
    } else {
      const cur = await readJson('data/archive.json', []);
      const map = {};
      cur.forEach(i => { map[i.slug] = i; });
      clean.forEach(i => { map[i.slug] = i; });
      items = Object.values(map);
    }
    items.sort((a, b2) => String(b2.date).localeCompare(String(a.date)));
    await writeJson('data/archive.json', items);
    return ok(res, { saved: items.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
