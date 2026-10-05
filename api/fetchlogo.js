import { put } from '@vercel/blob';
import { isAuthed, ok } from './_util.js';

// Admin-only helper: fetch an image from a sponsor's own website server-side
// and store a copy in the club's blob storage (no browser hand-offs, no corruption).
const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const b = req.body || {};
  const src = String(b.url || '');
  if (!/^https?:\/\//i.test(src)) return res.status(400).json({ error: 'http(s) url required' });
  let r;
  try {
    r = await fetch(src, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
        'accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
        'referer': new URL(src).origin + '/'
      }
    });
  } catch (e) { return res.status(502).json({ error: 'fetch failed: ' + e.message }); }
  if (!r.ok) return res.status(502).json({ error: 'upstream ' + r.status });
  const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED[ct]) return res.status(400).json({ error: 'not an image: ' + ct });
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 200) return res.status(400).json({ error: 'empty image' });
  if (buf.length > 5.5 * 1024 * 1024) return res.status(400).json({ error: 'file too large' });
  const safe = String(b.filename || 'logo').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 50);
  const blob = await put('uploads/' + Date.now() + '-' + safe + '.' + ALLOWED[ct], buf, {
    access: 'public', contentType: ct, addRandomSuffix: false, allowOverwrite: true
  });
  return ok(res, { url: blob.url, bytes: buf.length, type: ct });
}
