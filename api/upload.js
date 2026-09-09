import { put } from '@vercel/blob';
import { isAuthed, ok } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const b = req.body || {};
  if (!b.data || !b.filename) return res.status(400).json({ error: 'filename and data required' });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(b.data));
  if (!m) return res.status(400).json({ error: 'expected a base64 image data URL (jpeg/png/webp)' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3.5 * 1024 * 1024) return res.status(400).json({ error: 'image too large' });
  const safe = String(b.filename).toLowerCase().replace(/[^a-z0-9.-]+/g, '-').slice(0, 60);
  const blob = await put('uploads/' + Date.now() + '-' + safe, buf, {
    access: 'public', contentType: m[1]
  });
  return ok(res, { url: blob.url });
}
