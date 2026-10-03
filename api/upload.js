import { put } from '@vercel/blob';
import { isAuthed, ok } from './_util.js';

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

// CORS: allow the old club site origin only, so archived documents can be
// lifted across browser-side during the migration (POST still needs the admin key).
const CORS_ORIGIN = 'https://www.afctotton.com';
function cors(req, res) {
  if ((req.headers.origin || '') === CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, x-admin-key');
  }
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const b = req.body || {};
  if (!b.data || !b.filename) return res.status(400).json({ error: 'filename and data required' });
  const m = /^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,(.+)$/.exec(String(b.data));
  if (!m) return res.status(400).json({ error: 'expected a base64 data URL (jpeg/png/webp/pdf)' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 5.5 * 1024 * 1024) return res.status(400).json({ error: 'file too large' });
  const safe = String(b.filename).toLowerCase().replace(/[^a-z0-9.-]+/g, '-').slice(0, 60);
  const prefix = m[1] === 'application/pdf' ? 'docs/' : 'uploads/';
  const key = m[1] === 'application/pdf' ? prefix + safe : prefix + Date.now() + '-' + safe;
  const blob = await put(key, buf, {
    access: 'public', contentType: m[1], addRandomSuffix: false, allowOverwrite: true
  });
  return ok(res, { url: blob.url });
}
