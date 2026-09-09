import { readJson, writeJson, ok, isAuthed } from './_util.js';

const MAX_AGE_H = 48;

export default async function handler(req, res) {
  const all = await readJson('data/stories.json', []);
  const cutoff = Date.now() - MAX_AGE_H * 3600 * 1000;
  const fresh = all.filter(s => new Date(s.ts).getTime() > cutoff);
  if (req.method === 'GET') return ok(res, fresh);
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.img) return res.status(400).json({ error: 'a photo is required' });
    const item = {
      id: Date.now().toString(36),
      img: String(b.img).slice(0, 500),
      caption: String(b.caption || '').slice(0, 200),
      link: String(b.link || '').slice(0, 300),
      ts: new Date().toISOString()
    };
    fresh.unshift(item);
    await writeJson('data/stories.json', fresh.slice(0, 30));
    return ok(res, { added: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/stories.json', fresh.filter(s => s.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
