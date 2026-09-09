import { put, list } from '@vercel/blob';

export async function readJson(name, fallback) {
  try {
    const { blobs } = await list({ prefix: name });
    const b = blobs.find(x => x.pathname === name);
    if (!b) return fallback;
    const r = await fetch(b.url + '?ts=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return fallback;
    return await r.json();
  } catch (e) { return fallback; }
}

export async function writeJson(name, data) {
  await put(name, JSON.stringify(data), {
    access: 'public', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: 60
  });
}

export function ok(res, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(data);
}

export function isAuthed(req) {
  const k = req.headers['x-admin-key'];
  return !!k && !!process.env.ADMIN_PASSWORD && k === process.env.ADMIN_PASSWORD;
}
