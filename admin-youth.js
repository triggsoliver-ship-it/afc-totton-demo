/* Admin: Youth enquiries — player enquiries from the Youth page form. Uses api/$/esc from admin.html */
(function(){
let YE = [], YF = 'open', YCFG = {};
const ST = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
const COL = { new: '#B3261E', contacted: '#5B7AB8', closed: '#8a90a0' };
const when = iso => { try { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e){ return iso; } };
const dob = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? (+m[3]) + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m[2] - 1] + ' ' + m[1] : (d || ''); };

function shell(){
  const el = document.getElementById('youthpanel'); if (!el) return;
  el.innerHTML = `<h2>Youth enquiries <span id="ye_count" class="hint"></span></h2>
  <div class="hint" style="margin-bottom:10px;background:#FFF6E0;border-left:3px solid #C9A227;padding:9px 12px;border-radius:3px">These are <b>children&rsquo;s personal details</b>. Only open this if you help with youth recruitment, don&rsquo;t download or share them unless you need to, and delete enquiries once they&rsquo;re dealt with. Anything older than 12 months is deleted automatically.</div>
  <div id="ye_cfg" class="hint" style="margin-bottom:12px"></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <select id="ye_f" style="padding:8px;border:1px solid #C9D0E0;border-radius:4px"><option value="open">Open (new + contacted)</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option><option value="all">All enquiries</option></select>
    <button class="btn dark" type="button" id="ye_csv">Download CSV</button>
    <button class="btn" type="button" id="ye_reload">Refresh</button>
  </div>
  <div id="ye_list" class="hint">Loading&hellip;</div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('change', e => { if (e.target.id === 'ye_f'){ YF = e.target.value; draw(); } });
}

function drawCfg(){
  const c = $('ye_cfg'); if (!c) return;
  const to = (YCFG.to || []).join(', ');
  c.innerHTML = (YCFG.emailReady
      ? `<b style="color:#1E7B34">Email alerts ON</b> &mdash; each new enquiry is emailed to <b>${esc(to)}</b> (reply goes straight to the parent).`
      : `<b style="color:#B3261E">Email alerts not switched on yet</b> &mdash; enquiries are still saved here. Alerts will go to <b>${esc(to)}</b> once email is set up.`)
    + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center">
      <input id="ye_to" value="${esc(to)}" style="flex:1;min-width:220px;padding:8px;border:1px solid #C9D0E0;border-radius:4px" aria-label="Alert email addresses">
      <button class="btn" type="button" id="ye_tosave">Save alert emails</button>
      <button class="btn" type="button" id="ye_test">Send test email</button></div>
      <div id="ye_cmsg" class="msg"></div>`;
}

function draw(){
  const box = $('ye_list'); if (!box) return;
  const list = YE.filter(e => YF === 'all' ? true : YF === 'open' ? e.status !== 'closed' : e.status === YF);
  const nNew = YE.filter(e => e.status === 'new').length;
  $('ye_count').textContent = YE.length ? '· ' + YE.length + ' total' + (nNew ? ', ' + nNew + ' new' : '') : '';
  if (!list.length){ box.innerHTML = YE.length ? 'Nothing in this view.' : 'No enquiries yet. They&rsquo;ll appear here as soon as someone uses the form on the Youth page.'; return; }
  box.innerHTML = list.map(e => {
    const al = e.alert || {};
    const tel = String(e.phone || '').replace(/[^\d+]/g, '');
    return `<div style="border:1px solid #E3E7EF;border-left:4px solid ${COL[e.status] || '#8a90a0'};border-radius:4px;padding:12px 14px;margin-bottom:10px;background:#fff">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div><b style="font-size:15px;color:#151C36">${esc(e.first)} ${esc(e.last)}</b> &middot; <b>U${esc(e.ageGroup)}</b> <span class="hint">(${esc(e.season)})</span> &middot; ${esc(e.teamType)}</div>
        <div class="hint">${esc(when(e.ts))} &middot; <b style="color:${COL[e.status] || '#8a90a0'}">${ST[e.status] || esc(e.status)}</b></div>
      </div>
      <div style="font-size:13px;color:#5b6272;line-height:1.7;margin-top:6px">
        Born ${esc(dob(e.dob))} &middot; Position: ${esc(e.position || 'not sure / any')} &middot; Current club: ${esc(e.club || '—')}<br>
        Parent/guardian: <b style="color:#151C36">${esc(e.parent)}</b> &middot; <a href="mailto:${esc(e.email)}?subject=${encodeURIComponent('AFC Totton Youth — ' + e.first + ' ' + e.last)}">${esc(e.email)}</a> &middot; <a href="tel:${esc(tel)}">${esc(e.phone)}</a>
        ${e.message ? `<div style="margin-top:6px;padding:8px 10px;background:#F4F6FA;border-radius:3px;white-space:pre-wrap;color:#151C36">${esc(e.message)}</div>` : ''}
        <div style="margin-top:6px;font-size:12px">${al.sent ? '&#9993; Emailed to ' + esc((al.to || []).join(', ')) : '<span style="color:#B3261E">&#9888; Email alert not sent' + (al.error ? ' (' + esc(al.error) + ')' : '') + '</span>'}</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        ${e.status !== 'contacted' ? `<button class="btn" type="button" data-yst="contacted" data-id="${esc(e.id)}">Mark contacted</button>` : ''}
        ${e.status !== 'closed' ? `<button class="btn" type="button" data-yst="closed" data-id="${esc(e.id)}">Close</button>` : `<button class="btn" type="button" data-yst="new" data-id="${esc(e.id)}">Reopen</button>`}
        ${!al.sent ? `<button class="btn" type="button" data-yresend="${esc(e.id)}">Send email alert</button>` : ''}
        <button class="btn" type="button" data-ydel="${esc(e.id)}" style="background:#fff;color:#B3261E;border:1px solid #E5B4B0">Delete</button>
      </div></div>`;
  }).join('');
}

async function loadAll(){
  try {
    const r = await api('/api/enquiries?ts=' + Date.now());
    const j = await r.json();
    YE = Array.isArray(j.items) ? j.items : []; YCFG = { to: j.to || [], emailReady: !!j.emailReady };
  } catch(e){ $('ye_list').textContent = 'Could not load enquiries — try Refresh.'; return; }
  drawCfg(); draw();
}

async function onClick(e){
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'ye_reload') return loadAll();
  if (t.id === 'ye_csv'){
    const r = await api('/api/enquiries?format=csv&ts=' + Date.now());
    if (!r.ok) return alert('Could not download the CSV.');
    const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'youth-enquiries.csv'; a.click(); return;
  }
  if (t.id === 'ye_tosave'){
    const r = await api('/api/enquiries', { method: 'POST', body: JSON.stringify({ action: 'settings', to: $('ye_to').value }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok){ YCFG.to = j.to; drawCfg(); show($('ye_cmsg'), 'Saved — alerts will go to ' + j.to.join(', '), true); }
    else show($('ye_cmsg'), j.error || 'Could not save.', false);
    return;
  }
  if (t.id === 'ye_test'){
    t.disabled = true;
    const r = await api('/api/enquiries', { method: 'POST', body: JSON.stringify({ action: 'test' }) });
    const j = await r.json().catch(() => ({}));
    t.disabled = false;
    show($('ye_cmsg'), r.ok ? 'Test email sent to ' + (j.to || []).join(', ') + ' — check the inbox (and junk folder).' : 'Test email failed: ' + (j.error || 'unknown error'), r.ok);
    return;
  }
  if (t.dataset.yst){
    t.disabled = true;
    const r = await api('/api/enquiries', { method: 'POST', body: JSON.stringify({ action: 'status', id: t.dataset.id, status: t.dataset.yst }) });
    if (r.ok){ const x = YE.find(q => q.id === t.dataset.id); if (x) x.status = t.dataset.yst; draw(); }
    else { t.disabled = false; alert('Could not update — try again.'); }
    return;
  }
  if (t.dataset.yresend){
    t.disabled = true; t.textContent = 'Sending…';
    const r = await api('/api/enquiries', { method: 'POST', body: JSON.stringify({ action: 'resend', id: t.dataset.yresend }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok){ const x = YE.find(q => q.id === t.dataset.yresend); if (x) x.alert = j.alert; draw(); }
    else { t.disabled = false; t.textContent = 'Send email alert'; alert('Email not sent: ' + (j.error || 'unknown error')); }
    return;
  }
  if (t.dataset.ydel){
    const x = YE.find(q => q.id === t.dataset.ydel);
    if (!confirm('Delete the enquiry for ' + (x ? x.first + ' ' + x.last : 'this player') + '? This can’t be undone.')) return;
    t.disabled = true;
    const r = await api('/api/enquiries', { method: 'POST', body: JSON.stringify({ action: 'delete', id: t.dataset.ydel }) });
    if (r.ok){ YE = YE.filter(q => q.id !== t.dataset.ydel); draw(); }
    else { t.disabled = false; alert('Could not delete — try again.'); }
  }
}

window.loadYouth = function(){ if (!$('ye_list')) shell(); loadAll(); };
if (document.getElementById('app') && !document.getElementById('app').classList.contains('hidden')) window.loadYouth();
})();
