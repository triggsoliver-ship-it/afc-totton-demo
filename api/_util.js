import { put, list, del } from '@vercel/blob';
import { createHash } from 'node:crypto';

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

// Personal data never goes at a guessable address: it lives under a secret folder derived from the
// server-only blob token (public blob URLs can only be found by listing, which needs that token).
// If the blob token is ever rotated, the old folder is still in the store under private/ — list it to recover.
export function privateName(name) {
  const t = process.env.BLOB_READ_WRITE_TOKEN || '';
  if (!t) throw new Error('blob storage not configured');
  return 'private/' + createHash('sha256').update('afct-private:' + t).digest('hex').slice(0, 40) + '/' + name;
}

// Strict read: says whether the file exists, and THROWS on a failed read (instead of quietly returning an
// empty fallback), so a storage hiccup can never cause a list to be overwritten with nothing.
export async function readJsonStrict(name) {
  const { blobs } = await list({ prefix: name });
  const b = blobs.find(x => x.pathname === name);
  if (!b) return { found: false, data: null, url: null };
  const r = await fetch(b.url + '?ts=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('blob read failed ' + r.status);
  return { found: true, data: await r.json(), url: b.url };
}

// Load a personal-data file from the private folder, falling back to its old public file until that has been moved.
// Once moved, the old public file only holds a {moved:true} marker: if the private copy ever looks missing after
// that, refuse (throw) rather than start an empty list.
export async function loadPrivate(name, legacy) {
  const p = await readJsonStrict(privateName(name));
  if (p.found) return p.data;
  const l = await readJsonStrict(legacy);
  if (!l.found) return null;
  if (l.data && l.data.moved) throw new Error('private copy of ' + name + ' not found');
  return l.data;
}

// One-off move of an old public file into the private folder. The public copy is only cleared (replaced by a
// {moved:true} marker) after the private copy has been read back and every record is confirmed present.
export async function securePrivate(name, legacy, keyOf, order) {
  const l = await readJsonStrict(legacy);
  if (!l.found || !Array.isArray(l.data)) return { done: true, note: l.found ? 'already moved' : 'nothing to move' };
  const p = await readJsonStrict(privateName(name));
  const priv = p.found && Array.isArray(p.data) ? p.data : [];
  const have = new Set(priv.map(keyOf));
  const merged = order(priv.concat(l.data.filter(x => !have.has(keyOf(x)))));
  await writeJson(privateName(name), merged);
  const back = await readJsonStrict(privateName(name));
  const got = new Set((back.found && Array.isArray(back.data) ? back.data : []).map(keyOf));
  const missing = l.data.filter(x => !got.has(keyOf(x))).length;
  if (missing) return { done: false, public: l.data.length, private: got.size, missing, note: 'not verified yet - try again in a minute' };
  await writeJson(legacy, { moved: true, at: new Date().toISOString() });
  return { done: true, public: l.data.length, private: got.size, missing: 0 };
}
export { del };
