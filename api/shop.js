import { ok, isAuthed } from './_util.js';
import { loadProducts, saveProducts, seedProducts, cleanProduct, publicProduct } from './_shoplib.js';

// Club shop catalogue.
//   GET              -> active products for the public shop
//   GET ?all=1       -> (admin) everything incl. SKUs and full stock
//   POST (admin)     -> {action:'save', product} | {action:'delete', id} | {action:'reset'}
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await loadProducts();
    if (req.query.all === '1' && isAuthed(req)) return ok(res, items);
    return ok(res, items.filter(p => p.active && p.name).sort((a, b) => a.sort - b.sort).map(publicProduct));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const b = req.body || {};
  if (b.action === 'reset') {
    const s = seedProducts();
    await saveProducts(s);
    return ok(res, { reset: true, count: s.length });
  }
  const items = await loadProducts();
  if (b.action === 'delete') {
    const id = String(b.id || '');
    const next = items.filter(p => p.id !== id);
    await saveProducts(next);
    return ok(res, { deleted: id, count: next.length });
  }
  if (b.action === 'save') {
    const p = cleanProduct(b.product);
    if (!p.name) return res.status(400).json({ error: 'product name is required' });
    if (p.source === 'club' && !p.variants.length) return res.status(400).json({ error: 'add at least one size' });
    if (p.source === 'kitlocker' && !p.url) return res.status(400).json({ error: 'Kitlocker link is required' });
    const i = items.findIndex(x => x.id === p.id);
    if (i >= 0) items[i] = p; else { if (!b.product || !b.product.sort) p.sort = items.reduce((m, x) => Math.max(m, x.sort || 0), 0) + 1; items.push(p); }
    if (items.length > 500) return res.status(400).json({ error: 'too many products' });
    await saveProducts(items);
    return ok(res, { saved: p.id, product: p });
  }
  res.status(400).json({ error: 'unknown action' });
}
