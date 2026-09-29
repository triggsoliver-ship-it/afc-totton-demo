import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = {
  updated: '2026-08-16',
  link: 'https://www.thenationalleague.org.uk',
  rows: [
    { pos: 1, club: 'Dagenham & Redbridge', p: 2, w: 2, d: 0, l: 0, gd: 3, pts: 6 },
    { pos: 2, club: 'AFC Totton', p: 2, w: 2, d: 0, l: 0, gd: 2, pts: 6 },
    { pos: 3, club: 'Truro City', p: 2, w: 1, d: 1, l: 0, gd: 2, pts: 4 },
    { pos: 4, club: 'Torquay United', p: 2, w: 1, d: 1, l: 0, gd: 1, pts: 4 },
    { pos: 5, club: 'Maidstone United', p: 2, w: 1, d: 1, l: 0, gd: 1, pts: 4 },
    { pos: 6, club: 'Chelmsford City', p: 2, w: 1, d: 0, l: 1, gd: 0, pts: 3 },
    { pos: 7, club: 'Dorking Wanderers', p: 2, w: 0, d: 1, l: 1, gd: -2, pts: 1 },
    { pos: 8, club: 'Billericay Town', p: 2, w: 0, d: 0, l: 2, gd: -3, pts: 0 }
  ]
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/table.json', SEED));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!Array.isArray(b.rows) || !b.rows.length) return res.status(400).json({ error: 'rows required' });
    const n = v => parseInt(v, 10) || 0;
    const data = {
      updated: new Date().toISOString().slice(0, 10),
      link: String(b.link || SEED.link).slice(0, 300),
      rows: b.rows.slice(0, 30).map((r, i) => ({
        pos: n(r.pos) || i + 1,
        club: String(r.club || '').slice(0, 60),
        p: n(r.p), w: n(r.w), d: n(r.d), l: n(r.l), gd: parseInt(r.gd, 10) || 0, pts: n(r.pts)
      })).filter(r => r.club)
    };
    await writeJson('data/table.json', data);
    return ok(res, { saved: data.rows.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
