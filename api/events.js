import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { id: 'ev1', date: '2026-10-16', time: '19:30', title: 'Stags Race Night', where: 'Monarch Suite',
    desc: 'An evening at the races in the Monarch Suite — bar open, tote in the room, all proceeds to the club. Tables of 8.',
    img: 'https://lh3.googleusercontent.com/d/1-IGGdlHxwuzi5bjDSMI1zo5NnuldoDtR=w1000', tickets: 'https://www.fanbaseclub.com' },
  { id: 'ev2', date: '2026-11-20', time: '19:45', title: 'Sportsman’s Dinner with guest speaker', where: 'Monarch Suite',
    desc: 'Three-course dinner, guest speaker from the professional game, Q&A and auction in support of the Academy.',
    img: 'https://lh3.googleusercontent.com/d/1WfhRiFuDdj0BjrbeXbaxBe7tPpPwwz99=w1000', tickets: 'https://www.fanbaseclub.com' },
  { id: 'ev3', date: '2026-12-12', time: '19:00', title: 'Christmas Party Night', where: 'Monarch Suite',
    desc: 'Festive party night at the Snows Stadium — dinner, DJ and dancing. Ideal for office parties and groups.',
    img: 'https://lh3.googleusercontent.com/d/1DXX1ab16pb2UPR_S6RXGT2C8vj9f3Eic=w1000', tickets: 'https://www.fanbaseclub.com' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readJson('data/events.json', SEED);
    items.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return ok(res, items);
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const items = await readJson('data/events.json', SEED);
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.title || !b.date) return res.status(400).json({ error: 'title and date required' });
    const item = {
      id: String(b.id || Date.now().toString(36)),
      date: String(b.date).slice(0, 10),
      time: String(b.time || '').slice(0, 5),
      title: String(b.title).slice(0, 120),
      where: String(b.where || 'The Snows Stadium').slice(0, 80),
      desc: String(b.desc || '').slice(0, 1000),
      img: String(b.img || '').slice(0, 500),
      tickets: String(b.tickets || '').slice(0, 300)
    };
    const i = items.findIndex(x => x.id === item.id);
    if (i >= 0) items[i] = item; else items.push(item);
    await writeJson('data/events.json', items.slice(0, 100));
    return ok(res, { saved: item.id });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    await writeJson('data/events.json', items.filter(x => x.id !== id));
    return ok(res, { deleted: id });
  }
  res.status(405).json({ error: 'method not allowed' });
}
