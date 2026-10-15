import { readJson, writeJson } from './_util.js';
import { SHOP_SEED } from './_shopseed.js';

export const PFILE = 'data/shop-products.json';
export const OFILE = 'data/shop-orders.json';
const S = (v, n) => String(v == null ? '' : v).slice(0, n);
const N = (v, max) => { const x = Math.round(Number(v) * 100) / 100; return isFinite(x) && x >= 0 ? Math.min(x, max) : 0; };
const I = (v, max) => { const x = parseInt(v, 10); return isFinite(x) && x >= 0 ? Math.min(x, max) : 0; };
const URLOK = u => /^https:\/\//i.test(String(u || '')) ? S(u, 500) : '';

export async function loadProducts() {
  const p = await readJson(PFILE, null);
  return Array.isArray(p) ? p : JSON.parse(JSON.stringify(SHOP_SEED));
}
export const saveProducts = p => writeJson(PFILE, p);
export const seedProducts = () => JSON.parse(JSON.stringify(SHOP_SEED));

export function cleanProduct(x) {
  x = x || {};
  const source = x.source === 'kitlocker' ? 'kitlocker' : 'club';
  const id = S(x.id, 60).replace(/[^a-z0-9-]/gi, '') || ((source === 'club' ? 'c-' : 'k-') + Date.now().toString(36));
  const out = {
    id, source,
    name: S(x.name, 120).trim(),
    cat: S(x.cat, 60).trim() || 'Souvenirs & Accessories',
    desc: S(x.desc, 1200),
    img: URLOK(x.img) || (String(x.img || '').startsWith('/') ? S(x.img, 300) : ''),
    was: N(x.was, 9999),
    clearance: !!x.clearance, featured: !!x.featured, active: x.active !== false,
    sort: I(x.sort, 100000)
  };
  if (source === 'kitlocker') {
    out.url = URLOK(x.url);
    out.price = N(x.price, 9999);
    out.colours = (Array.isArray(x.colours) ? x.colours : []).slice(0, 20)
      .map(c => ({ name: S(c && c.name, 40), url: URLOK(c && c.url), img: URLOK(c && c.img) })).filter(c => c.name);
    out.variants = [];
  } else {
    out.variants = (Array.isArray(x.variants) ? x.variants : []).slice(0, 40).map(v => ({
      size: S(v && v.size, 30).trim() || 'One Size',
      sku: S(v && v.sku, 40).trim(),
      stock: I(v && v.stock, 99999),
      price: N(v && v.price, 9999)
    }));
  }
  return out;
}

// what the public site sees
export function publicProduct(p) {
  const o = { id: p.id, source: p.source, name: p.name, cat: p.cat, desc: p.desc, img: p.img, was: p.was, clearance: p.clearance, featured: p.featured, sort: p.sort };
  if (p.source === 'kitlocker') { o.url = p.url; o.price = p.price; o.colours = p.colours || []; }
  else o.variants = (p.variants || []).map(v => ({ size: v.size, price: v.price, stock: Math.min(v.stock, 20) }));
  return o;
}
export { readJson, writeJson };
