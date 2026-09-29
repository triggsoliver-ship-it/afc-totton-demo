import { readJson, writeJson, ok, isAuthed } from './_util.js';

export default async function handler(req, res) {
  if (req.method === 'POST' && Array.isArray((req.body || {}).import)) {
    if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
    const b = req.body;
    if (b.consentConfirmed !== true) return res.status(400).json({ error: 'confirm consent basis first' });
    const fans = await readJson('data/fans.json', []);
    const have = new Set(fans.map(f => f.email));
    let added = 0;
    for (const row of b.import.slice(0, 5000)) {
      const email = String((row && row.email) || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || have.has(email)) continue;
      have.add(email); added++;
      fans.push({
        name: String((row && row.name) || '').slice(0, 80),
        email,
        interest: String((row && row.interest) || '').slice(0, 60),
        consent: true,
        source: 'imported',
        ts: new Date().toISOString()
      });
    }
    await writeJson('data/fans.json', fans.slice(-5000));
    return ok(res, { imported: added, total: fans.length });
  }
  if (req.method === 'POST') {
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'valid email required' });
    if (b.consent !== true) return res.status(400).json({ error: 'consent required' });
    const fans = await readJson('data/fans.json', []);
    if (!fans.some(f => f.email === email)) {
      fans.push({
        name: String(b.name || '').slice(0, 80),
        email,
        interest: String(b.interest || '').slice(0, 60),
        consent: true,
        source: String(b.source || 'website').slice(0, 40),
        ts: new Date().toISOString()
      });
      await writeJson('data/fans.json', fans.slice(-5000));
    }
    return ok(res, { thanks: true });
  }
  if (req.method === 'GET' && req.query.count === '1') {
    const fans = await readJson('data/fans.json', []);
    return ok(res, { count: fans.length });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'GET') {
    const fans = await readJson('data/fans.json', []);
    if (req.query.format === 'csv') {
      const rows = [['name', 'email', 'interest', 'consent', 'source', 'timestamp']]
        .concat(fans.map(f => [f.name, f.email, f.interest, f.consent, f.source, f.ts]))
        .map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(','))
        .join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="stags-fans.csv"');
      return res.status(200).send(rows);
    }
    return ok(res, fans);
  }
  res.status(405).json({ error: 'method not allowed' });
}
