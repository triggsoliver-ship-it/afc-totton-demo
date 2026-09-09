// lock zoom on mobile
(function(){var v=document.querySelector('meta[name=viewport]');if(v)v.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
 var s=document.createElement('style');s.textContent='html{touch-action:manipulation}';document.head.appendChild(s);
 document.addEventListener('gesturestart',function(e){e.preventDefault();});
 var lt=0;document.addEventListener('touchend',function(e){var n=Date.now();if(n-lt<350){e.preventDefault();}lt=n;},{passive:false});})();
function tab(btn,id){document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
 document.querySelectorAll('.tabpane').forEach(p=>p.style.display='none');document.getElementById(id).style.display='block';}
function demo(e){if(e)e.preventDefault();alert('This is a demo site — checkout, downloads and form submissions are disabled.');return false;}
function shareIt(){const d={title:document.title,text:document.title,url:location.href};
 if(navigator.share){navigator.share(d).catch(()=>{});}else{navigator.clipboard&&navigator.clipboard.writeText(location.href);alert('Link copied to clipboard.');}}
let deferred=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show();});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
function show(){if(standalone||localStorage.getItem('ip'))return;
 const el=document.getElementById('install');if(!el)return;
 if(isIOS){document.getElementById('instx').innerHTML="Tap <b>Share</b>, then <b>Add to Home Screen</b>.";}
 el.style.display='flex';}
if(isIOS)setTimeout(show,2600);
document.addEventListener('click',e=>{if(e.target&&e.target.id==='installbtn'){
 if(deferred){deferred.prompt();deferred=null;}else if(isIOS){alert('Tap the Share button in Safari, then choose "Add to Home Screen".');}
 else{alert('Open this site on your phone, then use your browser menu to add it to your home screen.');}}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

// ===== dynamic content hydration (news / score / stories / fan capture) =====
(function(){
const page = document.body.getAttribute('data-page');
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J = (u) => fetch(u + (u.indexOf('?')<0?'?':'&') + 'ts=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null);

const css = document.createElement('style');
css.textContent = `
.storyrail{background:#0A0F22;padding:14px 0 10px}
.storyrail .in{display:flex;gap:14px;overflow-x:auto;padding:0 20px;max-width:1220px;margin:0 auto;scrollbar-width:none}
.storyrail .in::-webkit-scrollbar{display:none}
.story{flex:0 0 auto;width:72px;text-align:center;cursor:pointer}
.story .ring{width:64px;height:64px;border-radius:50%;padding:3px;background:linear-gradient(135deg,#5B7AB8,#A8BFE0);margin:0 auto}
.story img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:2px solid #0A0F22}
.story span{display:block;font-size:9.5px;color:#A8BFE0;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#storyview{position:fixed;inset:0;background:rgba(5,8,20,.96);z-index:200;display:none;align-items:center;justify-content:center;flex-direction:column;padding:20px}
#storyview img{max-width:min(94vw,480px);max-height:72vh;border-radius:10px}
#storyview .cap{color:#fff;font-size:15px;margin-top:14px;max-width:480px;text-align:center;line-height:1.5}
#storyview .x{position:absolute;top:16px;right:20px;color:#fff;font-size:30px;cursor:pointer;background:none;border:0}
#storyview a{color:#A8BFE0;font-weight:700}
.livecard .lp{display:inline-block;background:#C0392B;color:#fff;font-size:10px;font-weight:800;letter-spacing:.12em;padding:3px 8px;border-radius:2px;animation:lpulse 1.6s infinite}
@keyframes lpulse{50%{opacity:.55}}
.fanband{background:#151C36;color:#fff;padding:46px 0}
.fanband h2{font-size:clamp(20px,2.4vw,27px);font-weight:800;margin-bottom:8px}
.fanband p{color:#c3cee4;font-size:14.5px;margin-bottom:18px}
.fanband form{display:flex;gap:10px;flex-wrap:wrap}
.fanband input[type=text],.fanband input[type=email]{flex:1 1 180px;padding:12px 14px;border-radius:4px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:#fff;font:inherit}
.fanband label.c{display:flex;gap:8px;align-items:flex-start;font-size:11.5px;color:#93a2c0;margin-top:10px;line-height:1.5}
`;
document.head.appendChild(css);

if (page === 'index') J('/api/stories').then(items => {
  if (!items || !items.length) return;
  const rail = document.createElement('div'); rail.className = 'storyrail';
  rail.innerHTML = '<div class="in">' + items.map((s,i) =>
    `<div class="story" data-i="${i}"><div class="ring"><img src="${esc(s.img)}" alt=""></div><span>${esc(s.caption)||'Story'}</span></div>`).join('') + '</div>';
  const anchor = document.querySelector('.strip') || document.querySelector('header.site');
  anchor.parentNode.insertBefore(rail, anchor.nextSibling);
  const v = document.createElement('div'); v.id = 'storyview';
  v.innerHTML = '<button class="x">&times;</button><img alt=""><div class="cap"></div>';
  document.body.appendChild(v);
  rail.addEventListener('click', e => {
    const el = e.target.closest('.story'); if (!el) return;
    const s = items[+el.getAttribute('data-i')];
    v.querySelector('img').src = s.img;
    v.querySelector('.cap').innerHTML = esc(s.caption) + (s.link ? ` &middot; <a href="${esc(s.link)}">More &rsaquo;</a>` : '');
    v.style.display = 'flex';
  });
  v.addEventListener('click', e => { if (e.target === v || e.target.className === 'x') v.style.display = 'none'; });
});

function scoreLines(s){
  const us = 'AFC Totton', them = s.opp || 'Opponent';
  const a = s.venue === 'away' ? them : us, b = s.venue === 'away' ? us : them;
  const ag = s.venue === 'away' ? s.away : s.home, bg = s.venue === 'away' ? s.home : s.away;
  return {a, b, ag, bg};
}
function applyScore(s){
  if (!s || !s.status || s.status === 'none' || s.status === 'upcoming') return;
  const L = scoreLines(s);
  const badge = s.status === 'live' ? `<span class="lp">LIVE ${esc(s.minute)}</span>` : (s.status === 'ht' ? '<span class="lp" style="animation:none;background:#5B7AB8">HALF-TIME</span>' : 'FULL TIME');
  const card = document.querySelector('.scorecard');
  if (card){
    card.classList.add('livecard');
    card.innerHTML = `<div class="t">${s.status==='ft'?'RESULT · FULL TIME':'MATCH IN PROGRESS'} ${s.status!=='ft'?badge:''}</div>
      <div class="row"><span>${esc(L.a)}</span><span>${L.ag}</span></div>
      <div class="row"><span style="color:#b9c6de">${esc(L.b)}</span><span style="color:#b9c6de">${L.bg}</span></div>
      <div style="margin-top:12px;font-size:11px;color:#8fa3c7;letter-spacing:.05em">${esc(s.note) || 'SNOWS STADIUM · NATIONAL LEAGUE SOUTH'}</div>`;
  }
  const lv = document.getElementById('lv');
  if (lv) lv.innerHTML = `<div style="border:1px solid var(--line);border-radius:5px;padding:34px;text-align:center">
    <div style="margin-bottom:12px">${badge}</div>
    <div style="font-size:26px;font-weight:800;color:#151C36">${esc(L.a)} ${L.ag} &ndash; ${L.bg} ${esc(L.b)}</div>
    <div style="margin-top:10px;color:#5b6272;font-size:14px">${esc(s.note)||''}</div></div>`;
}
if (page === 'index' || page === 'match-centre'){
  const tick = () => J('/api/score').then(applyScore);
  tick(); setInterval(tick, 45000);
}

function card(i){
  const href = i.url || ('/news/article.html?id=' + encodeURIComponent(i.id));
  return `<a class="card" href="${esc(href)}"><div class="ph"><img src="${esc(i.img)||'/img/crest.svg'}" alt="" loading="lazy"></div>
  <div class="bd"><span class="tag">${esc(i.cat)}</span><h3>${esc(i.title)}</h3><p>${esc((i.standfirst||'').slice(0,120))}&hellip;</p>
  <div class="meta">${esc(i.date)}</div></div></a>`;
}
if (page === 'index' || page === 'news') J('/api/news').then(items => {
  if (!items || !items.length) return;
  const grid = document.querySelector('section .grid.g3');
  if (grid) grid.innerHTML = (page === 'index' ? items.slice(0,3) : items).map(card).join('');
});

if (page === 'index'){
  const sec = document.createElement('section'); sec.className = 'fanband';
  sec.innerHTML = `<div class="wrap"><h2>Join the Stags list</h2>
    <p>Team news, ticket releases and offers, straight from the club. No spam, unsubscribe any time.</p>
    <form id="fanform"><input type="text" name="name" placeholder="Your name"><input type="email" name="email" placeholder="Email address" required>
    <button class="btn" type="submit">Sign up</button></form>
    <label class="c"><input type="checkbox" id="fanconsent"> I&rsquo;m happy for AFC Totton to email me club news and offers. Demo notice: this form stores data for demonstration purposes only.</label>
    <p id="fanmsg" style="margin-top:10px;display:none"></p></div>`;
  const partners = Array.from(document.querySelectorAll('section')).pop();
  partners.parentNode.insertBefore(sec, partners);
  sec.querySelector('#fanform').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = sec.querySelector('#fanmsg'); msg.style.display = 'block';
    if (!sec.querySelector('#fanconsent').checked){ msg.textContent = 'Please tick the consent box first.'; return; }
    const r = await fetch('/api/fans', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: e.target.name.value, email: e.target.email.value, consent: true, source: 'homepage' }) });
    msg.textContent = r.ok ? 'Welcome to the Stags list — you’re signed up.' : 'That didn’t work — check the email address.';
    if (r.ok) e.target.reset();
  });
}
})();
