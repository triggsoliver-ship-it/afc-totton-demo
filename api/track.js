import { readJson, writeJson, ok } from './_util.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};
    const bucket = b.type === 'click' ? 'clicks' : 'pv';
    const key = bucket === 'clicks'
      ? String(b.target || 'other').slice(0, 80)
      : String(b.page || '/').slice(0, 80);
    const day = new Date().toISOString().slice(0, 10);
    const stats = await readJson('data/stats.json', {});
    const d = stats[day] = stats[day] || { pv: {}, clicks: {} };
    d[bucket][key] = (d[bucket][key] || 0) + 1;
    const days = Object.keys(stats).sort();
    while (days.length > 400) delete stats[days.shift()];
    await writeJson('data/stats.json', stats);
    return ok(res, { t: true });
  }
  if (req.method === 'GET') {
    const q = parseInt(req.query.days, 10);
    const n = Math.max(0, Math.min(366, isNaN(q) ? 7 : q));
    const stats = await readJson('data/stats.json', {});
    const cutoff = new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
    const out = { since: cutoff, days: {}, totals: { pv: {}, clicks: {}, pageviews: 0 } };
    for (const day of Object.keys(stats).sort()) {
      if (day < cutoff) continue;
      out.days[day] = stats[day];
      for (const k in (stats[day].pv || {})) { out.totals.pv[k] = (out.totals.pv[k] || 0) + stats[day].pv[k]; out.totals.pageviews += stats[day].pv[k]; }
      for (const k in (stats[day].clicks || {})) out.totals.clicks[k] = (out.totals.clicks[k] || 0) + stats[day].clicks[k];
    }
    return ok(res, out);
  }
  res.status(405).json({ error: 'method not allowed' });
}
