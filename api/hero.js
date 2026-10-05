import { readJson, writeJson, ok, isAuthed } from './_util.js';

// Homepage hero: headline, intro, buttons and background photo — editable from the admin panel.
const EMPTY = { on: false };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/hero.json', EMPTY));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    const data = {
      on: b.on !== false,
      eyebrow: String(b.eyebrow || '').slice(0, 80),
      title: String(b.title || '').slice(0, 120),
      lead: String(b.lead || '').slice(0, 400),
      btn1: String(b.btn1 || '').slice(0, 40),
      url1: String(b.url1 || '').slice(0, 300),
      btn2: String(b.btn2 || '').slice(0, 40),
      url2: String(b.url2 || '').slice(0, 300),
      img: String(b.img || '').slice(0, 300),
      updated: new Date().toISOString()
    };
    await writeJson('data/hero.json', data);
    return ok(res, { saved: true });
  }
  res.status(405).json({ error: 'method not allowed' });
}
