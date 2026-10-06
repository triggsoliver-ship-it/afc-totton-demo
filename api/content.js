import { readJson, writeJson, ok, isAuthed } from './_util.js';

// Small admin-editable content blocks.
//   staff      — management team cards on the Teams page
//   supporters — Supporter Sponsors names under the sponsor wall
//   banners    — per-page hero photos { pagekey: imageUrl }
const S = (v, n) => String(v == null ? '' : v).slice(0, n);
const BANNER_PAGES = ['commercial', 'hospitality', 'facility-hire', 'club', 'community', 'teams', 'events', 'tickets', 'youth', 'academy', 'provision', 'walking'];

const CLEAN = {
  staff: d => (Array.isArray(d) ? d : []).slice(0, 30).map(x => ({
    name: S(x && x.name, 80), role: S(x && x.role, 120), bio: S(x && x.bio, 900)
  })).filter(x => x.name),
  supporters: d => (Array.isArray(d) ? d : []).slice(0, 200).map(x => S(x, 80).trim()).filter(Boolean),
  banners: d => {
    const o = {};
    if (d && typeof d === 'object') for (const k of BANNER_PAGES) if (d[k]) o[k] = S(d[k], 300);
    return o;
  }
};
const EMPTY = { staff: [], supporters: [], banners: {} };

export default async function handler(req, res) {
  const key = String((req.query && req.query.key) || (req.body && req.body.key) || '');
  if (!CLEAN[key]) return res.status(400).json({ error: 'unknown key' });
  const file = 'data/content-' + key + '.json';
  if (req.method === 'GET') return ok(res, await readJson(file, EMPTY[key]));
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const data = CLEAN[key]((req.body || {}).data);
    await writeJson(file, data);
    return ok(res, { saved: true, count: Array.isArray(data) ? data.length : Object.keys(data).length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
