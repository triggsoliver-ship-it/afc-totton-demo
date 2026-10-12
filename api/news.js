import crypto from 'crypto';
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

// Scheduled (embargoed) articles live in a separate blob whose name is derived
// from the admin password, so the public can't guess its URL before go-live.
const QNAME = () => 'data/newsq-' + crypto.createHash('sha256')
  .update('newsq:' + (process.env.ADMIN_PASSWORD || '')).digest('hex').slice(0, 32) + '.json';

const fmtDate = t => new Date(t).toLocaleDateString('en-GB',
  { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });

// sort key: scheduled items use their go-live time, normal items the time encoded in their id
const ts = x => {
  if (x.publishAt) return Date.parse(x.publishAt) || 0;
  const id = String(x.id || '');
  return /^[0-9a-z]+$/.test(id) ? (parseInt(id, 36) || 0) : 0;
};

function merge(items, due) {
  const ids = new Set(items.map(x => x.id));
  return items.concat(due.filter(x => !ids.has(x.id)))
    .map((x, i) => [x, i])
    .sort((a, b) => (ts(b[0]) - ts(a[0])) || (a[1] - b[1]))
    .map(p => p[0]);
}

const isDue = (x, now) => Date.parse(x.publishAt) <= now;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [items, queue] = await Promise.all([readJson('data/news.json', SEED), readJson(QNAME(), [])]);
    const now = Date.now();
    const out = merge(items, queue.filter(x => isDue(x, now)));
    if (req.query.all === '1' && isAuthed(req)) {
      const scheduled = queue.filter(x => !isDue(x, now)).sort((a, b) => ts(a) - ts(b));
      return ok(res, { items: out, scheduled });
    }
    return ok(res, out);
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const [news, queue] = await Promise.all([readJson('data/news.json', SEED), readJson(QNAME(), [])]);
  const now = Date.now();
  // fold any articles whose time has passed into the main list
  const due = queue.filter(x => isDue(x, now));
  let items = merge(news, due);
  let q = queue.filter(x => !isDue(x, now));

  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.title || !b.body) return res.status(400).json({ error: 'title and body are required' });
    let when = 0;
    if (b.publishAt) {
      when = Date.parse(b.publishAt);
      if (!when) return res.status(400).json({ error: 'publish time is not a valid date' });
      if (when > now + 400 * 864e5) return res.status(400).json({ error: 'publish time is too far ahead' });
    }
    const item = {
      id: Date.now().toString(36),
      cat: String(b.cat || 'CLUB NEWS').slice(0, 40).toUpperCase(),
      date: fmtDate(when > now ? when : now),
      title: String(b.title).slice(0, 140),
      standfirst: String(b.standfirst || '').slice(0, 300),
      body: String(b.body).slice(0, 20000),
      img: String(b.img || '').slice(0, 500)
    };
    if (when > now + 30000) {
      item.publishAt = new Date(when).toISOString();
      q = q.concat(item).slice(-50);
      await writeJson(QNAME(), q);
      if (due.length) await writeJson('data/news.json', items.slice(0, 200));
      return ok(res, { scheduled: item.id, publishAt: item.publishAt });
    }
    items.unshift(item);
    await writeJson('data/news.json', items.slice(0, 200));
    if (due.length) await writeJson(QNAME(), q);
    return ok(res, { added: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/news.json', items.filter(x => x.id !== id));
    if (due.length || q.some(x => x.id === id)) await writeJson(QNAME(), q.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
