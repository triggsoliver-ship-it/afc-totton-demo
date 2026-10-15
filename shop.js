/* AFC Totton club shop — click & collect (pay in the club shop) + Kitlocker fanwear link-outs */
(function(){
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gbp = n => '&pound;' + Number(n || 0).toFixed(2);
const CREST = '/img/crest.svg';
let PRODUCTS = [], FILTER = 'All';
let BASKET = [];
try { BASKET = JSON.parse(localStorage.getItem('afct_basket') || '[]') || []; } catch(e){ BASKET = []; }
const saveBasket = () => { try { localStorage.setItem('afct_basket', JSON.stringify(BASKET)); } catch(e){} renderBadge(); };

const minPrice = p => p.source === 'kitlocker' ? p.price : Math.min.apply(null, (p.variants || []).map(v => v.price).concat([Infinity]));
const totalStock = p => (p.variants || []).reduce((s, v) => s + v.stock, 0);
const CATS = ['All', 'Match Shirts', 'Souvenirs & Accessories', 'Clearance', 'Fanwear (Kitlocker)'];

function catsFor(list){
  const extra = [];
  list.forEach(p => { if (!CATS.includes(p.cat) && !extra.includes(p.cat)) extra.push(p.cat); });
  return CATS.slice(0, 3).concat(extra, CATS.slice(3)).filter(c => c === 'All' || list.some(p => p.cat === c || (c === 'Clearance' && p.clearance)));
}

function card(p){
  const out = p.source === 'club' && totalStock(p) === 0;
  const mp = minPrice(p);
  const multi = p.source === 'club' ? new Set((p.variants || []).map(v => v.price)).size > 1 : true;
  const badge = p.source === 'kitlocker' ? '<span class="sb kl">KITLOCKER</span>'
    : p.clearance ? '<span class="sb cl">CLEARANCE</span>'
    : (p.was && p.was > mp) ? '<span class="sb cl">SALE</span>' : (out ? '<span class="sb so">SOLD OUT</span>' : '');
  return `<button class="scard${out ? ' out' : ''}" data-id="${esc(p.id)}">
    <div class="sph${p.img ? '' : ' noimg'}"><img src="${esc(p.img || CREST)}" alt="${esc(p.name)}" loading="lazy">${badge}</div>
    <div class="sbd"><div class="scat">${esc(p.cat)}</div><h3>${esc(p.name)}</h3>
    <div class="spr">${multi ? '<small>From</small> ' : ''}${p.was && p.was > mp ? `<s>${gbp(p.was)}</s> ` : ''}<b>${gbp(mp)}</b></div>
    <div class="sst">${p.source === 'kitlocker' ? 'Made to order &middot; posted by Kitlocker' : out ? 'Sold out' : 'Reserve &amp; collect at the Snows'}</div></div></button>`;
}

function render(){
  const cats = catsFor(PRODUCTS);
  if (!cats.includes(FILTER)) FILTER = 'All';
  $('#shopchips').innerHTML = cats.map(c => `<button class="chip${c === FILTER ? ' on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  const list = PRODUCTS.filter(p => FILTER === 'All' || p.cat === FILTER || (FILTER === 'Clearance' && p.clearance));
  $('#shopgrid').innerHTML = list.map(card).join('') || '<p class="sempty">Nothing here right now &mdash; check back soon.</p>';
}

/* ---------- product modal ---------- */
let CUR = null, SEL = null, COL = 0;
function openProduct(id){
  CUR = PRODUCTS.find(p => p.id === id); if (!CUR) return;
  SEL = null; COL = 0;
  if (CUR.source === 'club'){
    const avail = (CUR.variants || []).filter(v => v.stock > 0);
    if (avail.length === 1 && (CUR.variants || []).length === 1) SEL = avail[0].size;
  }
  drawProduct();
  $('#smodal').classList.add('open'); document.documentElement.classList.add('navlock');
}
function drawProduct(){
  const p = CUR, k = p.source === 'kitlocker';
  const col = k && p.colours && p.colours[COL];
  const img = (col && col.img) || p.img || CREST;
  const v = !k && SEL ? p.variants.find(x => x.size === SEL) : null;
  const price = k ? p.price : v ? v.price : minPrice(p);
  let body = `<div class="mimg${(img === CREST) ? ' noimg' : ''}"><img src="${esc(img)}" alt="${esc(p.name)}"></div><div class="minfo">
    <div class="scat">${esc(p.cat)}${p.clearance ? ' &middot; CLEARANCE' : ''}</div><h2>${esc(p.name)}</h2>
    <div class="mpr">${!k && !v && new Set(p.variants.map(x => x.price)).size > 1 ? '<small>From</small> ' : ''}${p.was && p.was > price ? `<s>${gbp(p.was)}</s> ` : ''}${gbp(price)}</div>
    ${p.desc ? `<p class="mdesc">${esc(p.desc)}</p>` : ''}`;
  if (k){
    if (p.colours && p.colours.length > 1) body += `<div class="mlab">Colour: <b>${esc(col.name)}</b></div><div class="sizes">${p.colours.map((c, i) => `<button class="sz${i === COL ? ' on' : ''}" data-col="${i}">${esc(c.name)}</button>`).join('')}</div>`;
    body += `<a class="btn mbuy" style="color:#fff" href="${esc((col && col.url) || p.url)}" target="_blank" rel="noopener">Buy on Kitlocker &#8599;</a>
      <p class="mnote">Fanwear is made to order and posted to you by Kitlocker, the club&rsquo;s official kit partner. Sizes, payment and delivery are handled on their site. Prices shown were correct when last checked.</p>`;
  } else {
    const sizes = p.variants;
    if (!(sizes.length === 1 && sizes[0].size === 'One Size')){
      body += `<div class="mlab">Size${SEL ? ': <b>' + esc(SEL) + '</b>' : ''}</div><div class="sizes">${sizes.map(s => `<button class="sz${s.size === SEL ? ' on' : ''}" data-size="${esc(s.size)}"${s.stock ? '' : ' disabled'}>${esc(s.size)}${s.stock ? '' : '<i>sold out</i>'}</button>`).join('')}</div>`;
    }
    const left = v ? v.stock : (sizes.length === 1 ? sizes[0].stock : null);
    if (left !== null && left > 0 && left <= 3) body += `<div class="mlow">Only ${left} left</div>`;
    const can = !!(v && v.stock > 0);
    body += `<div class="mqty"><label>Qty <select id="mq">${Array.from({length: Math.max(1, Math.min(10, v ? v.stock : 1))}, (_, i) => `<option>${i + 1}</option>`).join('')}</select></label>
      <button class="btn mbuy" id="madd"${can ? '' : ' disabled'} style="color:#fff">${can ? 'Add to basket' : (sizes.every(s => !s.stock) ? 'Sold out' : 'Choose a size')}</button></div>
      <p class="mnote">Reserve online and pay when you collect from the club shop at the Snows Stadium. We&rsquo;ll hold your items for 7 days.</p>`;
  }
  $('#smbody').innerHTML = body + '</div>';
}
function closeModal(){ document.querySelectorAll('.smod.open').forEach(m => m.classList.remove('open')); document.documentElement.classList.remove('navlock'); }

/* ---------- basket ---------- */
function renderBadge(){
  const n = BASKET.reduce((s, l) => s + l.qty, 0);
  const b = $('#sbasket'); if (!b) return;
  b.style.display = n ? 'flex' : 'none';
  b.querySelector('b').textContent = n;
}
function addToBasket(){
  const v = CUR.variants.find(x => x.size === SEL); if (!v) return;
  const q = parseInt(($('#mq') || {}).value, 10) || 1;
  const ex = BASKET.find(l => l.id === CUR.id && l.size === SEL);
  if (ex) ex.qty = Math.min(v.stock, ex.qty + q); else BASKET.push({ id: CUR.id, size: SEL, qty: Math.min(v.stock, q) });
  saveBasket(); closeModal(); openBasket();
}
function lineInfo(l){
  const p = PRODUCTS.find(x => x.id === l.id); if (!p) return null;
  const v = (p.variants || []).find(x => x.size === l.size); if (!v) return null;
  return { p, v };
}
function openBasket(step){
  BASKET = BASKET.filter(l => lineInfo(l));
  const lines = BASKET.map((l, i) => { const { p, v } = lineInfo(l); return { l, p, v, i }; });
  const total = lines.reduce((s, x) => s + x.v.price * x.l.qty, 0);
  let h = '<h2>Your basket</h2>';
  if (!lines.length){ h += '<p class="mnote">Your basket is empty.</p>'; }
  else {
    h += '<div class="blines">' + lines.map(x => `<div class="bl"><img src="${esc(x.p.img || CREST)}" alt=""><div><b>${esc(x.p.name)}</b><span>${x.v.size === 'One Size' ? '' : 'Size ' + esc(x.v.size) + ' &middot; '}${gbp(x.v.price)}</span>${x.v.stock < x.l.qty ? '<em>Only ' + x.v.stock + ' left</em>' : ''}</div>
      <div class="bq"><button data-dec="${x.i}" aria-label="One fewer">&minus;</button><span>${x.l.qty}</span><button data-inc="${x.i}" aria-label="One more">+</button></div></div>`).join('') + '</div>';
    h += `<div class="btot"><span>Total to pay on collection</span><b>${gbp(total)}</b></div>`;
    h += `<form id="sform" class="sform" autocomplete="on">
      <input name="name" placeholder="Full name" required autocomplete="name">
      <input name="email" type="email" placeholder="Email address" required autocomplete="email">
      <input name="phone" type="tel" placeholder="Mobile number" required autocomplete="tel">
      <textarea name="note" placeholder="Anything we should know? (optional)" rows="2"></textarea>
      <input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
      <button class="btn mbuy" type="submit" style="color:#fff">Reserve for collection</button>
      <p class="mnote">No payment now. Pay by card or cash when you collect from the club shop at the Snows Stadium (Mally&rsquo;s Way, SO40 2DE). We&rsquo;ll hold your items for 7 days. By reserving you agree to our <a href="/privacy">privacy policy</a>.</p>
      <div id="serr" class="serr"></div></form>`;
  }
  $('#sbbody').innerHTML = h;
  $('#sbmod').classList.add('open'); document.documentElement.classList.add('navlock');
}
async function submitOrder(form){
  const err = $('#serr'); err.textContent = '';
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Reserving...';
  const fd = new FormData(form);
  const body = { action: 'reserve', name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), note: fd.get('note'), website: fd.get('website'), items: BASKET };
  try {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok){ err.textContent = d.error || 'Something went wrong — please try again.'; btn.disabled = false; btn.textContent = 'Reserve for collection'; load(true); return; }
    BASKET = []; saveBasket();
    $('#sbbody').innerHTML = `<div class="sdone"><div class="tick">&#10003;</div><h2>Reserved!</h2>
      <p>Your reference is <b class="sref">${esc(d.ref)}</b></p>
      <p>Pay <b>${gbp(d.total)}</b> when you collect from the club shop at the Snows Stadium. Please quote your reference. We&rsquo;ll hold your items for 7 days.</p>
      <p class="mnote">Questions? Email <a href="mailto:Enquires@afctotton.com?subject=Club%20shop%20order%20${esc(d.ref)}">Enquires@afctotton.com</a> or call 023 8086 8981.</p>
      <button class="btn mbuy" data-close style="color:#fff">Done</button></div>`;
    load(true);
  } catch(e){ err.textContent = 'Connection problem — please try again.'; btn.disabled = false; btn.textContent = 'Reserve for collection'; }
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const c = t.closest('#shopchips .chip'); if (c){ FILTER = c.dataset.c; render(); return; }
  const sc = t.closest('.scard'); if (sc){ openProduct(sc.dataset.id); return; }
  if (t.closest('[data-close]') || t.classList.contains('smod')){ closeModal(); return; }
  const sz = t.closest('#smbody .sz'); if (sz){
    if (sz.dataset.col !== undefined) COL = +sz.dataset.col; else if (!sz.disabled) SEL = sz.dataset.size;
    drawProduct(); return; }
  if (t.closest('#madd')){ addToBasket(); return; }
  if (t.closest('#sbasket')){ openBasket(); return; }
  const inc = t.closest('[data-inc]'), dec = t.closest('[data-dec]');
  if (inc || dec){
    const i = +(inc || dec).dataset[inc ? 'inc' : 'dec'], l = BASKET[i], info = l && lineInfo(l);
    if (l){ l.qty += inc ? 1 : -1; if (info && l.qty > info.v.stock) l.qty = info.v.stock; if (l.qty < 1) BASKET.splice(i, 1); saveBasket(); openBasket(); }
  }
});
document.addEventListener('submit', e => { if (e.target.id === 'sform'){ e.preventDefault(); submitOrder(e.target); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

async function load(quiet){
  try {
    const r = await fetch('/api/shop?ts=' + Date.now());
    PRODUCTS = await r.json();
    if (!Array.isArray(PRODUCTS)) PRODUCTS = [];
  } catch(e){ if (!quiet) $('#shopgrid').innerHTML = '<p class="sempty">The shop couldn&rsquo;t load &mdash; please refresh the page.</p>'; return; }
  render(); renderBadge();
}
load();
})();
