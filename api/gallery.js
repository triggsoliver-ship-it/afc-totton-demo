import { readJson, writeJson, ok, isAuthed } from './_util.js';

const CATS = ['MATCHDAY', 'YOUTH', 'PROVISION', 'EVENTS', 'COMMUNITY', 'HOSPITALITY', 'CLUB'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/gallery.json', []));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const items = await readJson('data/gallery.json', []);
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.img) return res.status(400).json({ error: 'photo required' });
    items.unshift({
      id: Date.now().toString(36),
      img: String(b.img).slice(0, 500),
      caption: String(b.caption || '').slice(0, 160),
      cat: CATS.includes(String(b.cat || '').toUpperCase()) ? String(b.cat).toUpperCase() : 'CLUB',
      ts: new Date().toISOString()
    });
    await writeJson('data/gallery.json', items.slice(0, 60));
    return ok(res, { added: true });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/gallery.json', items.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
