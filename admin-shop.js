/* Admin: Club Shop — products, sizes & stock, click-and-collect orders. Uses api/$/esc/show/uploadFile from admin.html */
(function(){
const gbp = n => '&pound;' + Number(n || 0).toFixed(2);
let SP = [], SO = [], SEDIT = null, SFILT = 'all';
const CATS = ['Match Shirts', 'Souvenirs & Accessories', 'Outerwear', 'Clearance', 'Fanwear (Kitlocker)'];
const ADULT = ['XS','S','M','L','XL','XXL','3XL'], YOUTH = ['YXS','YS','YM','YL','YXL'];

function shell(){
  const el = document.getElementById('shoppanel'); if (!el) return;
  el.innerHTML = `<h2>Club shop</h2>
  <div class="hint" style="margin-bottom:12px">Fans reserve online and pay when they collect from the club shop. Ring each order through the till under <b>Department 17</b> in TouchOffice when it&rsquo;s collected. Kitlocker items link out to Kitlocker, which takes payment and posts them.</div>
  <h2 style="font-size:15px;margin-top:6px">Orders to collect <span id="so_count" class="hint"></span></h2>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <select id="so_f" style="padding:8px;border:1px solid #C9D0E0;border-radius:4px"><option value="open">Open (reserved + ready)</option><option value="all">All orders</option><option value="collected">Collected</option><option value="cancelled">Cancelled</option></select>
    <button class="btn dark" type="button" id="so_csv">Download CSV for TouchOffice</button>
  </div>
  <div id="so_list" class="hint">Loading&hellip;</div>
  <h2 style="font-size:15px;margin-top:26px">Products</h2>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <select id="sp_f" style="padding:8px;border:1px solid #C9D0E0;border-radius:4px"><option value="all">All products</option><option value="club">Club shop stock</option><option value="kitlocker">Kitlocker fanwear</option><option value="low">Low or out of stock</option><option value="hidden">Hidden</option></select>
    <button class="btn" type="button" id="sp_new">+ Add club shop item</button>
    <button class="btn" type="button" id="sp_newk">+ Add Kitlocker item</button>
  </div>
  <div id="sp_list" class="hint">Loading&hellip;</div>
  <div id="sp_form" class="hidden" style="margin-top:18px;border-top:2px solid #151C36;padding-top:16px"></div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('change', e => {
    if (e.target.id === 'so_f') drawOrders();
    if (e.target.id === 'sp_f'){ SFILT = e.target.value; drawProducts(); }
  });
}

async function loadAll(){
  try {
    const [p, o] = await Promise.all([api('/api/shop?all=1&ts=' + Date.now()).then(r => r.json()), api('/api/orders?ts=' + Date.now()).then(r => r.json())]);
    SP = Array.isArray(p) ? p : []; SO = Array.isArray(o) ? o : [];
  } catch(e){ $('so_list').textContent = 'Could not load the shop.'; return; }
  drawOrders(); drawProducts();
}

/* ---------- orders ---------- */
const STAT = { reserved: ['RESERVED', '#C9A24B'], ready: ['READY TO COLLECT', '#5B7AB8'], collected: ['COLLECTED', '#1F7A46'], cancelled: ['CANCELLED', '#B33A3A'] };
function drawOrders(){
  const f = ($('so_f') || {}).value || 'open';
  const list = SO.filter(o => f === 'all' ? true : f === 'open' ? (o.status === 'reserved' || o.status === 'ready') : o.status === f);
  const open = SO.filter(o => o.status === 'reserved' || o.status === 'ready').length;
  $('so_count').textContent = open ? '(' + open + ' open)' : '';
  $('so_list').innerHTML = list.map(o => {
    const s = STAT[o.status] || [o.status, '#8a90a0'];
    const age = Math.floor((Date.now() - Date.parse(o.ts)) / 864e5);
    const ready = 'mailto:' + encodeURIComponent(o.email) + '?subject=' + encodeURIComponent('AFC Totton club shop: your order ' + o.ref + ' is ready') + '&body=' + encodeURIComponent('Hi ' + o.name.split(' ')[0] + ',\n\nYour club shop order ' + o.ref + ' is ready to collect from the club shop at the Snows Stadium. Please bring your reference and pay on collection (£' + o.total.toFixed(2) + ').\n\nWe will hold it for 7 days.\n\nUp the Stags!\nAFC Totton');
    return `<div style="border:1px solid #DDE2ED;border-radius:5px;padding:12px 14px;margin-bottom:10px;font-size:13.5px;color:#1B1B1B">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="font-size:15px">${esc(o.ref)}</b>
        <span style="background:${s[1]};color:#fff;font-size:10px;font-weight:800;letter-spacing:.08em;padding:3px 7px;border-radius:3px">${s[0]}</span>
        <span class="hint">${esc(new Date(o.ts).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }))}${(o.status === 'reserved' || o.status === 'ready') && age >= 7 ? ' &middot; <b style="color:#B33A3A">held ' + age + ' days</b>' : ''}</span>
        <b style="margin-left:auto">${gbp(o.total)}</b></div>
      <div style="margin:6px 0">${esc(o.name)} &middot; <a href="mailto:${esc(o.email)}">${esc(o.email)}</a> &middot; <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></div>
      <div>${o.items.map(l => `${l.qty} &times; ${esc(l.name)}${l.size !== 'One Size' ? ' (' + esc(l.size) + ')' : ''} <span class="hint">${esc(l.sku || '')} &middot; ${gbp(l.price)}</span>`).join('<br>')}</div>
      ${o.note ? `<div class="hint" style="margin-top:6px">Note: ${esc(o.note)}</div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        ${o.status === 'reserved' ? `<button class="edt" style="margin:0;background:#5B7AB8;color:#fff;border:0;border-radius:3px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer" data-st="ready" data-ref="${esc(o.ref)}">Mark ready</button><a href="${ready}" style="font-size:11px;font-weight:800;padding:6px 10px;border:1px solid #5B7AB8;border-radius:3px;color:#5B7AB8;text-decoration:none">Email &ldquo;ready&rdquo;</a>` : ''}
        ${o.status === 'reserved' || o.status === 'ready' ? `<button style="background:#1F7A46;color:#fff;border:0;border-radius:3px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer" data-st="collected" data-ref="${esc(o.ref)}">Paid &amp; collected</button><button style="background:#B33A3A;color:#fff;border:0;border-radius:3px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer" data-st="cancelled" data-ref="${esc(o.ref)}">Cancel (restock)</button>` : ''}
        ${o.status === 'cancelled' ? `<button style="background:#fff;color:#5B7AB8;border:1px solid #5B7AB8;border-radius:3px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer" data-st="reserved" data-ref="${esc(o.ref)}">Re-open</button>` : ''}
      </div></div>`;
  }).join('') || '<span class="hint">No orders here.</span>';
}

/* ---------- products ---------- */
function stockOf(p){ return (p.variants || []).reduce((s, v) => s + v.stock, 0); }
function drawProducts(){
  const list = SP.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)).filter(p =>
    SFILT === 'all' ? true : SFILT === 'hidden' ? !p.active : SFILT === 'low' ? (p.source === 'club' && (p.variants || []).some(v => v.stock <= 2)) : p.source === SFILT);
  $('sp_list').innerHTML = list.map(p => {
    const club = p.source === 'club';
    const st = club ? stockOf(p) : null;
    const lo = club ? (p.variants || []).filter(v => v.stock === 0).map(v => v.size) : [];
    return `<div class="newsitem"><img src="${esc(p.img) || '/img/crest.svg'}" alt="" style="width:44px;height:44px;object-fit:cover;background:#151C36"><span><b>${esc(p.name)}</b>${p.active ? '' : ' <span class="hint">(hidden)</span>'}${p.clearance ? ' <span style="color:#9A6B00;font-size:11px;font-weight:800">CLEARANCE</span>' : ''}<br>
      <span class="hint">${esc(p.cat)} &middot; ${club ? st + ' in stock' + (lo.length ? ' &middot; <b style="color:#B33A3A">out: ' + esc(lo.join(', ')) + '</b>' : '') : 'Kitlocker &middot; ' + gbp(p.price)}</span></span>
      <button class="edt" data-edit="${esc(p.id)}">Edit</button></div>`;
  }).join('') || '<span class="hint">No products.</span>';
}

function vrow(v){
  v = v || { size: '', sku: '', stock: 0, price: '' };
  return `<div class="row4 vr" style="grid-template-columns:1fr 1.4fr .8fr .9fr 34px;align-items:center">
    <input class="v_size" placeholder="Size" value="${esc(v.size)}"><input class="v_sku" placeholder="SKU / PLU" value="${esc(v.sku)}">
    <input class="v_stock" type="number" min="0" placeholder="Stock" value="${esc(v.stock)}"><input class="v_price" type="number" min="0" step="0.01" placeholder="&pound;" value="${esc(v.price)}">
    <button type="button" data-vdel style="border:0;background:#F8E4E4;color:#B33A3A;border-radius:4px;height:38px;cursor:pointer;font-weight:800">&times;</button></div>`;
}
function crow(c){
  c = c || { name: '', url: '', img: '' };
  return `<div class="row3 cr" style="grid-template-columns:.8fr 1.6fr 1.6fr 34px;align-items:center">
    <input class="c_name" placeholder="Colour" value="${esc(c.name)}"><input class="c_url" placeholder="Kitlocker product link" value="${esc(c.url)}"><input class="c_img" placeholder="Image link" value="${esc(c.img)}">
    <button type="button" data-cdel style="border:0;background:#F8E4E4;color:#B33A3A;border-radius:4px;height:38px;cursor:pointer;font-weight:800">&times;</button></div>`;
}
function openForm(p){
  SEDIT = p;
  const club = p.source === 'club';
  const f = $('sp_form'); f.classList.remove('hidden');
  f.innerHTML = `<h2 style="font-size:15px">${p.id ? 'Edit' : 'New'} ${club ? 'club shop item' : 'Kitlocker item'}</h2><div class="frm">
    <div class="row2"><div><label>Name</label><input id="spf_name" value="${esc(p.name)}" maxlength="120"></div>
      <div><label>Category</label><input id="spf_cat" list="spf_cats" value="${esc(p.cat || (club ? 'Souvenirs & Accessories' : 'Fanwear (Kitlocker)'))}"><datalist id="spf_cats">${CATS.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div></div>
    <div><label>Description (optional)</label><textarea id="spf_desc" class="short" maxlength="1200">${esc(p.desc)}</textarea></div>
    <div class="row2"><div><label>Photo</label><input id="spf_file" type="file" accept="image/*"><div class="hint" id="spf_imgnote">${p.img ? 'Current photo kept unless you choose a new one.' : 'No photo yet &mdash; the club crest shows instead.'}</div></div>
      <div><label>Was price &pound; (optional &mdash; shows as a sale)</label><input id="spf_was" type="number" min="0" step="0.01" value="${p.was || ''}"></div></div>
    ${club ? `<label>Sizes, stock &amp; prices</label>
      <div class="hint">Use the SKU / PLU from TouchOffice so tills and website match. Set stock to 0 to show &ldquo;sold out&rdquo;.</div>
      <div id="spf_vars" style="display:grid;gap:6px">${(p.variants && p.variants.length ? p.variants : [{ size: 'One Size', sku: '', stock: 0, price: '' }]).map(vrow).join('')}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn" data-vadd style="padding:8px 12px">+ Size</button>
        <button type="button" class="btn" data-vset="adult" style="padding:8px 12px">+ Adult sizes</button><button type="button" class="btn" data-vset="youth" style="padding:8px 12px">+ Youth sizes</button></div>`
    : `<div class="row2"><div><label>Price &pound; (as on Kitlocker)</label><input id="spf_price" type="number" min="0" step="0.01" value="${p.price || ''}"></div>
      <div><label>Main Kitlocker link</label><input id="spf_url" value="${esc(p.url)}" placeholder="https://afc-totton.kitlocker.store/product/..."></div></div>
      <label>Colours (optional)</label><div id="spf_cols" style="display:grid;gap:6px">${(p.colours || []).map(crow).join('')}</div>
      <div><button type="button" class="btn" data-cadd style="padding:8px 12px">+ Colour</button></div>`}
    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px">
      <label style="text-transform:none;letter-spacing:0;color:#1B1B1B;display:flex;gap:6px;align-items:center"><input type="checkbox" id="spf_active" style="width:auto"${p.active !== false ? ' checked' : ''}> Show on website</label>
      <label style="text-transform:none;letter-spacing:0;color:#1B1B1B;display:flex;gap:6px;align-items:center"><input type="checkbox" id="spf_clear" style="width:auto"${p.clearance ? ' checked' : ''}> Clearance / old stock</label>
      <label style="text-transform:none;letter-spacing:0;color:#1B1B1B;display:flex;gap:6px;align-items:center"><input type="checkbox" id="spf_feat" style="width:auto"${p.featured ? ' checked' : ''}> Featured</label></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn dark" data-save>Save product</button><button type="button" class="btn" data-cancel style="background:#8a90a0">Close</button>
      ${p.id ? '<button type="button" class="btn" data-delp style="background:#B33A3A;margin-left:auto">Delete</button>' : ''}</div>
    <div id="spf_msg" class="msg"></div></div>`;
  f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function saveForm(){
  const p = Object.assign({}, SEDIT);
  p.name = $('spf_name').value.trim(); p.cat = $('spf_cat').value.trim(); p.desc = $('spf_desc').value;
  p.was = parseFloat($('spf_was').value) || 0;
  p.active = $('spf_active').checked; p.clearance = $('spf_clear').checked; p.featured = $('spf_feat').checked;
  if (!p.name) return show($('spf_msg'), 'Give the product a name.', false);
  if (p.source === 'club'){
    p.variants = [...document.querySelectorAll('#spf_vars .vr')].map(r => ({ size: r.querySelector('.v_size').value.trim(), sku: r.querySelector('.v_sku').value.trim(), stock: parseInt(r.querySelector('.v_stock').value, 10) || 0, price: parseFloat(r.querySelector('.v_price').value) || 0 })).filter(v => v.size);
    if (!p.variants.length) return show($('spf_msg'), 'Add at least one size (use “One Size” for single items).', false);
    if (p.variants.some(v => !v.price)) return show($('spf_msg'), 'Every size needs a price.', false);
  } else {
    p.price = parseFloat($('spf_price').value) || 0; p.url = $('spf_url').value.trim();
    p.colours = [...document.querySelectorAll('#spf_cols .cr')].map(r => ({ name: r.querySelector('.c_name').value.trim(), url: r.querySelector('.c_url').value.trim(), img: r.querySelector('.c_img').value.trim() })).filter(c => c.name);
    if (!/^https:\/\//.test(p.url)) return show($('spf_msg'), 'Paste the Kitlocker product link (starting https://).', false);
    if (!p.img && p.colours[0] && p.colours[0].img) p.img = p.colours[0].img;
  }
  try {
    const file = $('spf_file').files[0];
    if (file){ show($('spf_msg'), 'Uploading photo…', true); p.img = await uploadFile(file); }
    const r = await api('/api/shop', { method: 'POST', body: JSON.stringify({ action: 'save', product: p }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return show($('spf_msg'), d.error || 'Save failed.', false);
    const i = SP.findIndex(x => x.id === d.product.id); if (i >= 0) SP[i] = d.product; else SP.push(d.product);
    SEDIT = d.product; drawProducts(); show($('spf_msg'), 'Saved — live on the shop page now.', true);
  } catch(e){ show($('spf_msg'), 'Something went wrong: ' + e.message, false); }
}

async function onClick(e){
  const t = e.target;
  if (t.id === 'so_csv'){
    const r = await api('/api/orders?format=csv&ts=' + Date.now()); const b = await r.blob();
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'club-shop-orders.csv'; a.click(); return;
  }
  if (t.dataset.st){
    const st = t.dataset.st;
    if (st === 'cancelled' && !confirm('Cancel order ' + t.dataset.ref + '? The items go back into stock.')) return;
    t.disabled = true;
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ action: 'status', ref: t.dataset.ref, status: st }) });
    if (r.ok) loadAll(); else { t.disabled = false; alert('Could not update the order — try again.'); }
    return;
  }
  if (t.id === 'sp_new') return openForm({ source: 'club', name: '', cat: 'Souvenirs & Accessories', variants: [], active: true });
  if (t.id === 'sp_newk') return openForm({ source: 'kitlocker', name: '', cat: 'Fanwear (Kitlocker)', colours: [], active: true });
  if (t.dataset.edit) return openForm(JSON.parse(JSON.stringify(SP.find(p => p.id === t.dataset.edit))));
  if (t.dataset.vadd !== undefined) return $('spf_vars').insertAdjacentHTML('beforeend', vrow());
  if (t.dataset.vset){
    const price = parseFloat((document.querySelector('#spf_vars .v_price') || {}).value) || '';
    const have = [...document.querySelectorAll('#spf_vars .v_size')].map(i => i.value.trim());
    if (have.length === 1 && have[0] === 'One Size') $('spf_vars').innerHTML = '';
    (t.dataset.vset === 'adult' ? ADULT : YOUTH).filter(s => !have.includes(s)).forEach(s => $('spf_vars').insertAdjacentHTML('beforeend', vrow({ size: s, sku: '', stock: 0, price })));
    return;
  }
  if (t.dataset.vdel !== undefined || t.dataset.cdel !== undefined) return t.parentElement.remove();
  if (t.dataset.cadd !== undefined) return $('spf_cols').insertAdjacentHTML('beforeend', crow());
  if (t.dataset.save !== undefined) return saveForm();
  if (t.dataset.cancel !== undefined){ $('sp_form').classList.add('hidden'); SEDIT = null; return; }
  if (t.dataset.delp !== undefined){
    if (!confirm('Delete ' + SEDIT.name + ' from the shop? (Untick “Show on website” instead if you might sell it again.)')) return;
    const r = await api('/api/shop', { method: 'POST', body: JSON.stringify({ action: 'delete', id: SEDIT.id }) });
    if (r.ok){ SP = SP.filter(p => p.id !== SEDIT.id); $('sp_form').classList.add('hidden'); drawProducts(); }
  }
}

window.loadShop = function(){ if (!$('so_list')) shell(); loadAll(); };
if (document.getElementById('app') && !document.getElementById('app').classList.contains('hidden')) window.loadShop();
})();
