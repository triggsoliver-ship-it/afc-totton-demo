import { readJson, writeJson, ok, isAuthed } from './_util.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

// CORS: allow the old club site origin during the migration harvest only.
const CORS_ORIGIN = 'https://www.afctotton.com';
function cors(req, res) {
  if ((req.headers.origin || '') === CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, x-admin-key');
  }
}

const yr = y => String(y || '').replace(/[^0-9]/g, '').slice(0, 4);

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    const y = yr(req.query.year);
    if (y) return ok(res, await readJson('data/archive-' + y + '.json', []));
    return ok(res, await readJson('data/archive-index.json', []));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (Array.isArray(b.index)) {
      const idx = b.index.map(i => ({
        slug: String((i && i.slug) || '').slice(0, 160),
        title: String((i && i.title) || '').slice(0, 220),
        cat: String((i && i.cat) || '').trim().slice(0, 60),
        date: String((i && i.date) || '').slice(0, 30)
      })).filter(i => i.slug && i.title);
      idx.sort((a, c) => String(c.date).localeCompare(String(a.date)));
      await writeJson('data/archive-index.json', idx);
      return ok(res, { indexSaved: idx.length });
    }
    const y = yr(b.year);
    if (!y || !Array.isArray(b.items) || !b.items.length) return res.status(400).json({ error: 'year and items required' });
    const clean = b.items.map(i => ({
      slug: String((i && i.slug) || '').slice(0, 160),
      title: String((i && i.title) || '').slice(0, 220),
      cat: String((i && i.cat) || '').trim().slice(0, 60),
      date: String((i && i.date) || '').slice(0, 30),
      img: String((i && i.img) || '').slice(0, 400),
      body: String((i && i.body) || '').slice(0, 60000)
    })).filter(i => i.slug && i.title);
    clean.sort((a, c) => String(c.date).localeCompare(String(a.date)));
    await writeJson('data/archive-' + y + '.json', clean);
    return ok(res, { year: y, saved: clean.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
