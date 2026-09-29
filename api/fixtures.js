import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { id: 'fx1', date: '2026-08-08', ko: '15:00', opp: 'Farnham Town', venue: 'away', ground: 'The Memorial Ground', comp: 'National League South', status: 'played', hg: 1, ag: 0, scorers: '' },
  { id: 'fx2', date: '2026-08-15', ko: '15:00', opp: 'Billericay Town', venue: 'home', ground: 'The Snows Stadium', comp: 'National League South', status: 'played', hg: 1, ag: 0, scorers: '' },
  { id: 'fx3', date: '2026-08-18', ko: '19:45', opp: 'Dorking Wanderers', venue: 'home', ground: 'The Snows Stadium', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' },
  { id: 'fx4', date: '2026-08-22', ko: '15:00', opp: 'Ebbsfleet United', venue: 'away', ground: 'Kuflink Stadium', comp: 'National League South', status: 'postponed', hg: null, ag: null, scorers: '' },
  { id: 'fx5', date: '2026-08-29', ko: '15:00', opp: 'Chesham United', venue: 'home', ground: 'The Snows Stadium', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' },
  { id: 'fx6', date: '2026-08-31', ko: '15:00', opp: 'Maidenhead United', venue: 'away', ground: 'York Road', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' },
  { id: 'fx7', date: '2026-09-05', ko: '15:00', opp: 'Hampton & Richmond Borough', venue: 'tbc', ground: 'Venue TBC', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' },
  { id: 'fx8', date: '2026-09-08', ko: '19:45', opp: 'Weston-super-Mare', venue: 'tbc', ground: 'Venue TBC', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' },
  { id: 'fx9', date: '2026-09-12', ko: '15:00', opp: 'Slough Town', venue: 'tbc', ground: 'Venue TBC', comp: 'National League South', status: 'scheduled', hg: null, ag: null, scorers: '' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readJson('data/fixtures.json', SEED);
    items.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return ok(res, items);
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const items = await readJson('data/fixtures.json', SEED);
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.opp || !b.date) return res.status(400).json({ error: 'opponent and date required' });
    const num = v => (v === '' || v == null || isNaN(parseInt(v, 10))) ? null : Math.max(0, parseInt(v, 10));
    const item = {
      id: String(b.id || Date.now().toString(36)),
      date: String(b.date).slice(0, 10),
      ko: String(b.ko || '15:00').slice(0, 5),
      opp: String(b.opp).slice(0, 60),
      venue: ['home', 'away', 'tbc'].includes(b.venue) ? b.venue : 'tbc',
      ground: String(b.ground || '').slice(0, 80),
      comp: String(b.comp || 'National League South').slice(0, 60),
      status: ['scheduled', 'played', 'postponed'].includes(b.status) ? b.status : 'scheduled',
      hg: num(b.hg), ag: num(b.ag),
      scorers: String(b.scorers || '').slice(0, 200)
    };
    const i = items.findIndex(x => x.id === item.id);
    if (i >= 0) items[i] = item; else items.push(item);
    await writeJson('data/fixtures.json', items.slice(0, 80));
    return ok(res, { saved: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/fixtures.json', items.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
