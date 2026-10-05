import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { id: 'p13', num: 13, name: 'Ryan Gosney', pos: 'Goalkeeper', group: 'gk', img: 'https://lh3.googleusercontent.com/d/1InwT999o4yyI4tAbbEKKmZXiRSW0waUJ=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p2', num: 2, name: 'Charlie Betts', pos: 'Right Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1qJPfbUbCiYr-Og5lTIUz5SNF7B9STxgc=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p3', num: 3, name: 'Reuben Austin', pos: 'Left Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1jSMspIpdQYXY8QYbd6CbdbcbhV6hBlU3=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p5', num: 5, name: 'Luke Hallett', pos: 'Centre Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1HR8Fl_6z4synJl0ydkgY7QEEF3YczFUI=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p6', num: 6, name: 'Matt Chandler', pos: 'Centre Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1JngErxf7z4riZZA36OlUPhNIXN8P2KzE=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p17', num: 17, name: 'Declan Rose', pos: 'Right Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1MsstFIOyA6f1q_0-Ogw-JJYlHtdYZjNN=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p22', num: 22, name: 'Luke Bennett', pos: 'Right Midfield / Right Back', group: 'df', img: 'https://lh3.googleusercontent.com/d/1eoiz0ALZ1Ul0PoErJ-lt4jbFHlMUWsEy=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p26', num: 26, name: 'Tyler Cordner', pos: 'Centre Back', group: 'df', img: '', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p4', num: 4, name: 'Mike Carter', pos: 'Centre Midfield', group: 'mf', img: 'https://lh3.googleusercontent.com/d/11xEQTJ06lcv15vrG28uL8a4XCSGTSBUI=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p8', num: 8, name: 'Reece Fleet', pos: 'Centre Midfield', group: 'mf', img: 'https://lh3.googleusercontent.com/d/1ekutPhB97Ak5nihdz_l17meDLLEnWnDX=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p19', num: 19, name: 'Christie Ward', pos: 'Centre Midfield', group: 'mf', img: 'https://lh3.googleusercontent.com/d/1iuYoqTcauQR_Y-dFBDTXQZEhHHKzouuV=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p25', num: 25, name: 'Dylan Andrews', pos: 'Centre Midfield', group: 'mf', img: 'https://lh3.googleusercontent.com/d/145Iwwxt-e5POxoPA8MxHj-EsM5dQrmWJ=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p27', num: 27, name: 'Craig Tanner', pos: 'Centre Midfield', group: 'mf', img: 'https://lh3.googleusercontent.com/d/13F3gJRqFcg9EjyBvH-6k7nJJkwJW2ucm=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p7', num: 7, name: 'Josh Sims', pos: 'Winger', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1m6EbYUg6eE6xEM6wUvnHMJYsm-UmFpr0=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p10', num: 10, name: 'Tony Lee', pos: 'Striker', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1tNyj01yAmChdCGRlDmOVLMQNUXdO2490=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p11', num: 11, name: 'Sol Wanjau-Smith', pos: 'Winger', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1IWkXYjzsocNLFQ2d_mFQHK1goyLA4giF=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p14', num: 14, name: 'Ibby Olateju', pos: 'Striker', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1Pc-H3-DjXtOXeQEnmU-tKqS_eaqizOF-=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p23', num: 23, name: 'Ralph Vigrass', pos: 'Winger', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1htIz8SnbRCZP4W1UFFmm5g8eOEQozO06=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' },
  { id: 'p24', num: 24, name: 'Vaughn Covil', pos: 'Winger / Attacking Midfield', group: 'fw', img: 'https://lh3.googleusercontent.com/d/1oiEFCjRwiSHEeChzqtjSP0HuWXNxluBv=w520', bio: '', sponsor: '', sponsorUrl: '', sponsorLogo: '' }
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
      sponsorLogo: String(b.sponsorLogo || '').slice(0, 500),
      sponsorAway: String(b.sponsorAway || '').slice(0, 80),
      sponsorAwayUrl: String(b.sponsorAwayUrl || '').slice(0, 300),
      sponsorThird: String(b.sponsorThird || '').slice(0, 80),
      sponsorThirdUrl: String(b.sponsorThirdUrl || '').slice(0, 300)
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
