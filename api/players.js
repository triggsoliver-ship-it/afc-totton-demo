import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { id: 'p13', num: 13, name: 'Ryan Gosney', pos: 'Goalkeeper', group: 'gk', img: '/img/p-13.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p2', num: 2, name: 'Charlie Betts', pos: 'Right Back', group: 'df', img: '/img/p-2.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p3', num: 3, name: 'Reuben Austin', pos: 'Left Back', group: 'df', img: '/img/p-3.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p5', num: 5, name: 'Luke Hallett', pos: 'Centre Back', group: 'df', img: '/img/p-5.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p6', num: 6, name: 'Matt Chandler', pos: 'Centre Back', group: 'df', img: '/img/p-6.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p17', num: 17, name: 'Declan Rose', pos: 'Right Back', group: 'df', img: '/img/p-17.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p22', num: 22, name: 'Luke Bennett', pos: 'Right Midfield / Right Back', group: 'df', img: '/img/p-22.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p26', num: 26, name: 'Tyler Cordner', pos: 'Centre Back', group: 'df', img: '', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p4', num: 4, name: 'Mike Carter', pos: 'Centre Midfield', group: 'mf', img: '/img/p-4.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p8', num: 8, name: 'Reece Fleet', pos: 'Centre Midfield', group: 'mf', img: '/img/p-8.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p19', num: 19, name: 'Christie Ward', pos: 'Centre Midfield', group: 'mf', img: '/img/p-19.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p25', num: 25, name: 'Dylan Andrews', pos: 'Centre Midfield', group: 'mf', img: '/img/p-25.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p27', num: 27, name: 'Craig Tanner', pos: 'Centre Midfield', group: 'mf', img: '/img/p-27.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p7', num: 7, name: 'Josh Sims', pos: 'Winger', group: 'fw', img: '/img/p-7.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p10', num: 10, name: 'Tony Lee', pos: 'Striker', group: 'fw', img: '/img/p-10.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p11', num: 11, name: 'Sol Wanjau-Smith', pos: 'Winger', group: 'fw', img: '/img/p-11.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p14', num: 14, name: 'Ibby Olateju', pos: 'Striker', group: 'fw', img: '/img/p-14.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p23', num: 23, name: 'Ralph Vigrass', pos: 'Winger', group: 'fw', img: '/img/p-23.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p24', num: 24, name: 'Vaughn Covil', pos: 'Winger / Attacking Midfield', group: 'fw', img: '/img/p-24.webp', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/players.json', SEED));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const items = await readJson('data/players.json', SEED);
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ error: 'name required' });
    const item = {
      id: String(b.id || Date.now().toString(36)),
      num: Math.max(0, Math.min(99, parseInt(b.num, 10) || 0)),
      name: String(b.name).slice(0, 60),
      pos: String(b.pos || '').slice(0, 50),
      group: ['gk', 'df', 'mf', 'fw'].includes(b.group) ? b.group : 'mf',
      img: String(b.img || '').slice(0, 500),
      bio: String(b.bio || '').slice(0, 2000),
      sponsor: String(b.sponsor || '').slice(0, 80),
      sponsorUrl: String(b.sponsorUrl || '').slice(0, 300),
      sponsorLogo: String(b.sponsorLogo || '').slice(0, 500)
    };
    const i = items.findIndex(x => x.id === item.id);
    if (i >= 0) items[i] = item; else items.push(item);
    await writeJson('data/players.json', items.slice(0, 60));
    return ok(res, { saved: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/players.json', items.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
