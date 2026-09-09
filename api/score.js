import { readJson, writeJson, ok, isAuthed } from './_util.js';

const EMPTY = { status: 'none' };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/score.json', EMPTY));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    const status = ['none', 'upcoming', 'live', 'ht', 'ft'].includes(b.status) ? b.status : 'none';
    const data = {
      status,
      opp: String(b.opp || '').slice(0, 60),
      venue: b.venue === 'away' ? 'away' : 'home',
      home: Math.max(0, parseInt(b.home, 10) || 0),
      away: Math.max(0, parseInt(b.away, 10) || 0),
      minute: String(b.minute || '').slice(0, 8),
      note: String(b.note || '').slice(0, 140),
      updated: new Date().toISOString()
    };
    await writeJson('data/score.json', data);
    return ok(res, { saved: true });
  }
  res.status(405).json({ error: 'method not allowed' });
}
