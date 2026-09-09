import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { id: 'seed-preview', cat: 'MATCH PREVIEW', date: '17 August 2026',
    title: 'Stags host Dorking Wanderers chasing three from three',
    standfirst: "Scott Rendell's side return to the Snows Stadium on Tuesday evening for their third fixture of the 2026/27 campaign.",
    img: 'https://lh3.googleusercontent.com/d/1vsB9N1GG3GJfCVJ9AlKhqM91ESEK7F2k=w1000',
    url: '/news/match-preview-dorking.html', body: '' },
  { id: 'seed-ebbsfleet', cat: 'CLUB STATEMENT', date: '20 August 2026',
    title: 'Club statement: Ebbsfleet United fixture postponed',
    standfirst: 'AFC Totton can confirm that our scheduled away fixture against Ebbsfleet United on Saturday 22 August will not go ahead.',
    img: 'https://lh3.googleusercontent.com/d/1iMf2rXCUjh9Q6EJSaYNeaiEhujdUoxf3=w1000',
    url: '/news/ebbsfleet-postponed.html', body: '' },
  { id: 'seed-community', cat: 'COMMUNITY', date: '15 August 2026',
    title: 'We are your club. We are your community.',
    standfirst: 'AFC Totton in the Community begins a new season with more than £30,000 raised for local causes in the last year alone.',
    img: 'https://lh3.googleusercontent.com/d/1pOnbnPoJl-OG9LvRPmZLr9udFocxxWpr=w1000',
    url: '/news/community-intro-2627.html', body: '' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readJson('data/news.json', SEED);
    return ok(res, items);
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const items = await readJson('data/news.json', SEED);
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.title || !b.body) return res.status(400).json({ error: 'title and body are required' });
    const item = {
      id: Date.now().toString(36),
      cat: String(b.cat || 'CLUB NEWS').slice(0, 40).toUpperCase(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      title: String(b.title).slice(0, 140),
      standfirst: String(b.standfirst || '').slice(0, 300),
      body: String(b.body).slice(0, 20000),
      img: String(b.img || '').slice(0, 500)
    };
    items.unshift(item);
    await writeJson('data/news.json', items.slice(0, 200));
    return ok(res, { added: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/news.json', items.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
