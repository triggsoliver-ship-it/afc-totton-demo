import { ok, isAuthed } from './_util.js';
import { loadProducts, saveProducts, readJson, writeJson, OFILE } from './_shoplib.js';

// Click & collect reservations — fans reserve online and pay in the club shop (TouchOffice dept 17).
//   POST {action:'reserve', name, email, phone, items:[{id,size,qty}], note}   (public)
//   GET (admin)                -> orders, newest first   (?format=csv for TouchOffice keying)
//   POST (admin) {action:'status', ref, status}   status: reserved | ready | collected | cancelled
const S = (v, n) => String(v == null ? '' : v).slice(0, n).trim();
const STATUSES = ['reserved', 'ready', 'collected', 'cancelled'];
const money = n => Math.round(n * 100) / 100;

function ref() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = ''; for (let i = 0; i < 5; i++) r += a[Math.floor(Math.random() * a.length)];
  return 'STG-' + r;
}

export default async function handler(req, res) {
  const b = req.body || {};
  if (req.method === 'POST' && b.action === 'reserve') {
    if (b.website) return ok(res, { ref: 'STG-OK', total: 0 }); // honeypot
    const name = S(b.name, 80), email = S(b.email, 120).toLowerCase(), phone = S(b.phone, 30), note = S(b.note, 400);
    if (!name) return res.status(400).json({ error: 'Please enter your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (phone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Please enter a contact phone number.' });
    const want = (Array.isArray(b.items) ? b.items : []).slice(0, 20);
    if (!want.length) return res.status(400).json({ error: 'Your basket is empty.' });
    const products = await loadProducts();
    const lines = [];
    for (const w of want) {
      const p = products.find(x => x.id === String(w && w.id) && x.source === 'club' && x.active);
      const qty = Math.max(1, Math.min(10, parseInt(w && w.qty, 10) || 1));
      if (!p) return res.status(400).json({ error: 'An item in your basket is no longer available.' });
      const v = (p.variants || []).find(x => x.size === String(w.size));
      if (!v) return res.status(400).json({ error: `Size ${S(w.size, 20)} is no longer available for ${p.name}.` });
      if (v.stock < qty) return res.status(409).json({ error: v.stock ? `Only ${v.stock} left of ${p.name} (${v.size}).` : `${p.name} (${v.size}) has just sold out.` });
      v.stock -= qty;
      lines.push({ id: p.id, name: p.name, size: v.size, sku: v.sku, qty, price: v.price });
    }
    const order = {
      ref: ref(), ts: new Date().toISOString(), status: 'reserved',
      name, email, phone, note, items: lines,
      total: money(lines.reduce((s, l) => s + l.price * l.qty, 0))
    };
    const orders = await readJson(OFILE, []);
    orders.unshift(order);
    await saveProducts(products);
    await writeJson(OFILE, orders.slice(0, 2000));
    return ok(res, { ref: order.ref, total: order.total });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'GET') {
    const orders = await readJson(OFILE, []);
    if (req.query.format === 'csv') {
      const rows = [['ref', 'date', 'status', 'name', 'email', 'phone', 'product', 'size', 'sku', 'qty', 'unit_price', 'line_total', 'touchoffice_department']];
      orders.forEach(o => o.items.forEach(l => rows.push([o.ref, o.ts.slice(0, 16).replace('T', ' '), o.status, o.name, o.email, o.phone, l.name, l.size, l.sku, l.qty, l.price.toFixed(2), (l.price * l.qty).toFixed(2), '17'])));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="club-shop-orders.csv"');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n'));
    }
    return ok(res, orders);
  }
  if (req.method === 'POST' && b.action === 'status') {
    const status = String(b.status || '');
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'bad status' });
    const orders = await readJson(OFILE, []);
    const o = orders.find(x => x.ref === String(b.ref || ''));
    if (!o) return res.status(404).json({ error: 'order not found' });
    const was = o.status;
    if (was === status) return ok(res, { ref: o.ref, status });
    // stock goes back on the shelf when a reservation is cancelled (and comes off again if un-cancelled)
    if (status === 'cancelled' || was === 'cancelled') {
      const products = await loadProducts();
      const dir = status === 'cancelled' ? 1 : -1;
      for (const l of o.items) {
        const p = products.find(x => x.id === l.id);
        const v = p && (p.variants || []).find(x => x.size === l.size);
        if (v) v.stock = Math.max(0, v.stock + dir * l.qty);
      }
      await saveProducts(products);
    }
    o.status = status; o.updated = new Date().toISOString();
    await writeJson(OFILE, orders);
    return ok(res, { ref: o.ref, status });
  }
  res.status(405).json({ error: 'method not allowed' });
}
