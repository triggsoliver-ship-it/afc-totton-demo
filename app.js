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
// PWA install
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

// ===== v2 makeover: display font + glass header + scroll reveal =====
(function(){
if (!document.querySelector('header.site')) return; // not on admin
const fl = document.createElement('link'); fl.rel = 'stylesheet';
fl.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap';
document.head.appendChild(fl);
const hd = document.querySelector('header.site');
const onScroll = () => hd.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('rv-in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
const SEL = '.card,.tier,.suite,.agegrp,.mgcard,.course,.pc,.sponsors>div,.evcard,.gph,.roomcard';
let pend = null;
const mark = () => {
  document.querySelectorAll(SEL).forEach(el => {
    if (el.classList.contains('rv')) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0){ el.classList.add('rv','rv-in'); return; }
    el.classList.add('rv'); io.observe(el);
  });
};
mark();
new MutationObserver(() => { if (pend) return; pend = setTimeout(() => { pend = null; mark(); }, 120); })
  .observe(document.body, { childList: true, subtree: true });
})();

// ===== dark / light mode (follows device, manual override persisted) =====
(function(){
if (!document.querySelector('header.site')) return; // not on admin
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const M = {'#151C36':'#EEF1F8','#5b6272':'#9AA5BF','#8a90a0':'#8E99B2','#FAFBFD':'#0E1630','#33384a':'#B9C2D8','#EEF1F8':'#1A2442','#C9D0E0':'#2A3658','#1B1B1B':'#CBD5EA'};
const MRX = /#(?:151C36|5b6272|8a90a0|FAFBFD|33384a|EEF1F8|C9D0E0|1B1B1B)/g;
function darkNow(){ const t = localStorage.getItem('theme'); return t === 'dark' || (t !== 'light' && mq.matches); }
function remap(on){
  document.querySelectorAll('[style]').forEach(el => {
    if (el.closest('#storyview,.storyrail,.fanband,.band,.hero,.scorecard,footer,.strip,header')) return;
    if (!el.dataset.ls) el.dataset.ls = el.getAttribute('style');
    let s = el.dataset.ls;
    if (on) s = s.replace(MRX, m => M[m]);
    el.setAttribute('style', s);
  });
}
function apply(){
  const on = darkNow();
  document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
  const tc = document.querySelector('meta[name=theme-color]');
  if (tc) tc.setAttribute('content', on ? '#0B1122' : '#151C36');
  remap(on);
  const b = document.getElementById('themebtn');
  if (b) b.innerHTML = on ? '&#9788;' : '&#9789;';
}
const hdr = document.querySelector('.hdr');
if (hdr && !document.getElementById('themebtn')){
  const b = document.createElement('button');
  b.id = 'themebtn'; b.setAttribute('aria-label','Toggle dark mode');
  b.style.cssText = 'background:none;border:1px solid rgba(255,255,255,.3);color:#fff;font-size:15px;width:34px;height:34px;border-radius:50%;cursor:pointer;margin-left:6px;flex:0 0 auto';
  b.onclick = () => { localStorage.setItem('theme', darkNow() ? 'light' : 'dark'); apply(); };
  const burger = hdr.querySelector('.burger');
  hdr.insertBefore(b, burger || null);
}
mq.addEventListener && mq.addEventListener('change', apply);
// re-run remap after hydration inserts content
window.__applyTheme = apply;
apply();
setTimeout(apply, 800); setTimeout(apply, 2500);
})();

// ===== dynamic content hydration =====
(function(){
const page = document.body.getAttribute('data-page');
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J = (u) => fetch(u + (u.indexOf('?')<0?'?':'&') + 'ts=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null);
const fmtD = d => { try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); } catch(e){ return d; } };
const fmtDL = d => { try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); } catch(e){ return d; } };

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
.spchip{position:absolute;top:10px;left:10px;z-index:2;background:rgba(255,255,255,.94);border-radius:3px;padding:3px 7px;display:flex;align-items:center;gap:5px;font-size:8.5px;font-weight:800;letter-spacing:.06em;color:#151C36;text-transform:uppercase;max-width:70%}
.spchip img{height:14px;width:auto}
.pc{cursor:pointer}
#pmodal{position:fixed;inset:0;background:rgba(5,8,20,.94);z-index:210;display:none;align-items:center;justify-content:center;padding:20px}
#pmodal .bx{background:#fff;border-radius:8px;max-width:460px;width:100%;max-height:86vh;overflow:auto;position:relative}
#pmodal .ph2{background:linear-gradient(170deg,#151C36,#0A0F22);aspect-ratio:16/10;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
#pmodal .ph2 img{height:96%;width:auto;object-fit:contain}
#pmodal .bd2{padding:20px 22px 24px}
#pmodal .bd2 h3{font-size:22px;color:#151C36;font-weight:800}
#pmodal .bd2 .ps{font-size:11px;letter-spacing:.12em;color:#5B7AB8;font-weight:800;text-transform:uppercase;margin:4px 0 12px}
#pmodal .bd2 p{font-size:14.5px;line-height:1.65;color:#33384a}
#pmodal .bd2 .spl{margin-top:16px;padding-top:14px;border-top:1px solid #DDE2ED;font-size:12px;color:#5b6272;display:flex;align-items:center;gap:10px}
#pmodal .bd2 .spl img{height:26px;width:auto}
#pmodal .x2{position:absolute;top:10px;right:14px;font-size:26px;color:#fff;background:none;border:0;cursor:pointer;z-index:2}
.evcard .when{font-size:11px;font-weight:800;letter-spacing:.1em;color:#C9A24B;text-transform:uppercase}
.sponsors .ntile{font-size:11.5px;font-weight:800;letter-spacing:.05em;color:#2A3658;text-align:center;line-height:1.35;text-transform:uppercase;padding:4px}
.sponsors a.splink{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
nav.main a{white-space:nowrap}
.brand span{white-space:nowrap}
nav.main .nvg{position:relative}
nav.main .nvg>button{background:none;border:0;cursor:pointer;font:inherit;font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#cfd8ea;padding:6px 0;border-bottom:2px solid transparent;display:flex;align-items:center;gap:5px;white-space:nowrap}
nav.main .nvg>button i{font-style:normal;font-size:8px;opacity:.65;transform:translateY(1px)}
nav.main .nvg:hover>button,nav.main .nvg.act>button,nav.main .nvg.openg>button{color:#fff;border-color:var(--blue)}
nav.main .nvg .dd{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:14px;display:none;z-index:230}
nav.main .nvg:hover .dd,nav.main .nvg.openg .dd{display:block}
nav.main .nvg .dd .in2{background:#0E1630;border:1px solid rgba(255,255,255,.09);border-radius:6px;box-shadow:0 18px 44px rgba(3,6,18,.55);padding:8px;min-width:216px}
nav.main .nvg .dd a{display:block;padding:11px 14px;border-bottom:0;border-radius:4px;font-size:11.5px;white-space:nowrap;color:#cfd8ea}
nav.main .nvg .dd a:hover,nav.main .nvg .dd a.on{background:rgba(91,122,184,.22);color:#fff}
@media(max-width:1000px){
 nav.main.open .nvg{position:static;display:flex;flex-direction:column;align-items:center}
 nav.main.open .nvg>button{color:#C9A24B;font-size:10.5px;letter-spacing:.16em;pointer-events:none;border:0;margin-top:16px;padding:0 0 4px}
 nav.main.open .nvg>button i{display:none}
 nav.main.open .nvg .dd{display:block;position:static;transform:none;padding:0}
 nav.main.open .nvg .dd .in2{background:none;border:0;box-shadow:none;padding:0;min-width:0;text-align:center}
 nav.main.open .nvg .dd a{font-size:16px;padding:8px 0}
}
html[data-theme=dark] #pmodal .bx{background:#111A33}
html[data-theme=dark] #pmodal .bd2 h3{color:#EEF1F8}
html[data-theme=dark] #pmodal .bd2 p{color:#B9C2D8}
html[data-theme=dark] #pmodal .bd2 .spl{border-color:#232E4E}
`;
document.head.appendChild(css);
const rethemed = () => { window.__applyTheme && window.__applyTheme(); };

// ---- nav + footer injection (Events / Hospitality / contacts / safeguarding) ----
(function(){
  const nav = document.querySelector('nav.main');
  if (nav){
    const P = p => page === p;
    const a = (href, label, p) => '<a href="' + href + '" class="' + (P(p) ? 'on' : '') + '">' + label + '</a>';
    const g = (label, kids) => '<div class="nvg' + (kids.some(k => P(k[2])) ? ' act' : '') + '"><button type="button">' + label + ' <i>&#9660;</i></button><div class="dd"><div class="in2">'
      + kids.map(k => '<a href="' + k[0] + '" class="' + (P(k[2]) ? 'on' : '') + '">' + k[1] + '</a>').join('') + '</div></div></div>';
    nav.innerHTML =
      a('/match-centre.html', 'Match Centre', 'match-centre')
      + g('Teams', [['/teams.html', 'First Team', 'teams'], ['/youth.html', 'Youth Football', 'youth'], ['/academy.html', 'Academy 16&ndash;19', 'academy'], ['/provision.html', 'Alternative Provision', 'provision']])
      + g('News', [['/news.html', 'Latest News', 'news'], ['/gallery.html', 'Gallery', 'gallery'], ['/fanzone.html', 'Fan Zone', 'fanzone'], ['/archive.html', 'News Archive', 'archive']])
      + g('Events', [['/events.html', 'What&rsquo;s On', 'events'], ['/hospitality.html', 'Hospitality', 'hospitality']])
      + g('Club', [['/club.html', 'The Club', 'club'], ['/community.html', 'Community', 'community']])
      + a('/commercial.html', 'Commercial', 'commercial')
      + a('/shop.html', 'Shop', 'shop')
      + '<a href="/tickets.html" class="btn' + (P('tickets') ? ' on' : '') + '" style="color:#fff">Buy Tickets</a>';
    nav.addEventListener('click', e => {
      const b = e.target.closest('.nvg>button'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const grp = b.parentNode, was = grp.classList.contains('openg');
      nav.querySelectorAll('.nvg.openg').forEach(x => x.classList.remove('openg'));
      if (!was) grp.classList.add('openg');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('nav.main')) nav.querySelectorAll('.nvg.openg').forEach(x => x.classList.remove('openg'));
    });
  }
  const burger = document.querySelector('.burger');
  if (burger && nav){
    burger.onclick = null;
    const close = () => { nav.classList.remove('open'); nav.style.display = ''; };
    burger.addEventListener('click', e => {
      e.preventDefault();
      nav.style.display = ''; nav.classList.add('open');
      if (!nav.querySelector('.navx')){
        const x = document.createElement('button'); x.className = 'navx'; x.innerHTML = '&times;';
        x.addEventListener('click', close); nav.appendChild(x);
      }
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  }
  document.querySelectorAll('footer.site').forEach(f => {
    const cols = f.querySelectorAll('.cols > div');
    if (!cols.length) return;
    // league principal partners — required by the Enterprise National League South
    if (!f.querySelector('.lgp')){
      const LG = 'https://lh3.googleusercontent.com/d/';
      const lps = [
        ['1Yd1dmZk5vu8LyG7OO4vRf00qxaaGjGQx', 'Enterprise', 'https://www.enterprise.co.uk'],
        ['1QgPkms7yOISj_RWXi1SOovDQS2a8Tp9s', 'DAZN', 'https://www.dazn.com'],
        ['1xRlThTn0CisOnEY94H8f_HHaZ1TOw2mC', 'TIC Health', 'https://tichealth.co.uk/services/scans/mri/'],
        ['1V23jY2Fvi2jvxwtJdfcNhvI98uFQSlJN', 'Utility Warehouse', 'https://uw.co.uk'],
        ['1n9D1wx28onAAvNiTwjq8KeUrrYpYOFE0', 'Errèa', 'https://www.errea.com'],
        ['1qwtnbDi5kVPvFwxsSPZOi-JEHrmt7z2u', 'Mitre', 'https://www.mitre.com']
      ];
      const c0 = f.querySelector('.cols');
      if (c0) c0.insertAdjacentHTML('beforebegin',
        '<div class="lgp"><span>Enterprise National League South &middot; Principal Partners</span><div class="in3">'
        + lps.map(p => '<a href="' + p[2] + '" target="_blank" rel="noopener" title="' + p[1] + '"><img src="' + LG + p[0] + '=w200" alt="' + p[1] + '" loading="lazy"></a>').join('')
        + '</div></div>');
    }
    const addr = cols[0].querySelector('p');
    if (addr) addr.innerHTML = 'Snows Stadium<br>Mally&rsquo;s Way, Totton SO40 2DE<br><a href="tel:02380868981" style="display:inline;padding:0">02380 868981</a> &middot; Capacity 3,000 &middot; Founded 1886';
    const socials = {
      'X': 'https://x.com/afctotton',
      'Facebook': 'https://www.facebook.com/afctottonofficial/',
      'Instagram': 'https://www.instagram.com/afctottonofficial',
      'TikTok': 'https://www.tiktok.com/@afc.totton1886',
      'YouTube': 'https://www.youtube.com/@AFCTottonTV1886',
      'LinkedIn': 'https://uk.linkedin.com/company/afc-totton'
    };
    const sIcon = {
      'X': 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
      'Facebook': 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
      'Instagram': 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
      'TikTok': 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
      'YouTube': 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
      'LinkedIn': 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
    };
    f.querySelectorAll('.social a[aria-label]').forEach(a => {
      const k = a.getAttribute('aria-label');
      if (k === 'LinkedIn' && !socials[k]) { a.remove(); return; }
      const u = socials[k]; if (u) a.href = u;
      if (sIcon[k]) a.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + sIcon[k] + '"/></svg>';
    });
    const explore = cols[1];
    if (explore && !explore.querySelector('a[href="/events.html"]'))
      explore.insertAdjacentHTML('beforeend','<a href="/events.html">Events</a><a href="/hospitality.html">Hospitality</a>');
    if (explore && !explore.querySelector('a[href="/youth.html"]'))
      explore.insertAdjacentHTML('beforeend','<a href="/youth.html">Youth</a>');
    if (explore && !explore.querySelector('a[href="/provision.html"]'))
      explore.insertAdjacentHTML('beforeend','<a href="/provision.html">Alternative Provision</a>');
    if (explore && !explore.querySelector('a[href="/gallery.html"]'))
      explore.insertAdjacentHTML('beforeend','<a href="/gallery.html">Gallery</a>');
    const contact = cols[3];
    if (contact) contact.innerHTML = '<h4>CONTACT</h4>'
      + '<a href="mailto:Enquires@afctotton.com">Enquires@afctotton.com</a>'
      + '<a href="tel:02380868981">02380 868981</a>'
      + '<a href="mailto:events@afctotton.com">Events &amp; hospitality</a>'
      + '<a href="mailto:salesandmarketing@afctotton.com">Commercial &amp; sponsorship</a>'
      + '<p style="margin-top:12px;font-size:11px;line-height:1.7"><b style="color:#fff">SAFEGUARDING</b><br>'
      + 'Dan Woodnutt &middot; <a href="mailto:dan.woodnutt@afctottonyouth.com" style="display:inline;padding:0">dan.woodnutt@afctottonyouth.com</a> &middot; 07879 868311<br>'
      + 'Caroline Keats &middot; <a href="mailto:Safeguarding@afctottondp.com" style="display:inline;padding:0">Safeguarding@afctottondp.com</a> &middot; 07395 292386</p>'
      + '<p style="margin-top:12px;font-size:11.5px">AFC Totton in the Community<br>Registered Charity 1206854</p>';
    const btm = f.querySelector('.btm');
    if (btm && !f.querySelector('.own')) btm.insertAdjacentHTML('afterend', '<p class="own" style="margin-top:14px;font-size:10.5px;line-height:1.7;color:#93a2c0">For the purpose of Football Association rule 2.13, AFC Totton can confirm ownership details of the company AFC Totton 1886 Ltd is 100% owned by its shareholders. The company is considered to be controlled by Mr S Brookwell, Mr P Davies, Mr T Croft, Mr K Hebenton and Mr S. Snow by reason of their shareholdings and financial commitment to the company. Company address: AFC Totton 1886 LTD, The Snows Stadium, Salisbury Road, Totton, Southampton, SO40 2DE. Registered in England No.11293572. &middot; <a href="/privacy.html" style="display:inline;padding:0">Privacy policy</a> &middot; <a href="/club.html" style="display:inline;padding:0">Club policies &amp; documents</a>'
      + (['teams','academy','youth'].indexOf(page) > -1 ? ' <a href="https://athvora.co.uk" target="_blank" rel="noopener" style="display:inline;padding:0;opacity:.4" title="Athvora">&#9671;</a>' : '')
      + '</p>'
      + '<p class="credit" style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:10.5px;letter-spacing:.06em;color:#7C87A2;text-transform:uppercase">Website design by <a href="https://shipitstudio.co.uk" target="_blank" rel="noopener" style="display:inline;padding:0;color:#A8BFE0;font-weight:700">shipitstudio.co.uk</a> &nbsp;&middot;&nbsp; Grow your club with <a href="https://scaleyourclub.com" target="_blank" rel="noopener" style="display:inline;padding:0;color:#C9A24B;font-weight:700">scaleyourclub.com</a></p>');
  });
})();

// ---- social stories (homepage) ----
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

// ---- AFC Totton TV (homepage: always shows the latest upload) ----
if (page === 'index'){
  const band1 = document.querySelector('section.band');
  if (band1){
    const sec = document.createElement('section');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>AFC Totton TV</h2><a href="https://www.youtube.com/@AFCTottonTV1886" target="_blank" rel="noopener">Watch more on YouTube &rsaquo;</a></div>'
      + '<div style="position:relative;aspect-ratio:16/9;border-radius:7px;overflow:hidden;box-shadow:0 18px 44px rgba(21,28,54,.18);background:#0A0F22">'
      + '<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=UUDhhBntICd-3iwiYZJWg39g" title="AFC Totton TV" style="position:absolute;inset:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
      + '<p style="margin-top:12px;font-size:12.5px;color:#8a90a0">Match highlights and interviews, straight from the club &mdash; this player always opens on our latest upload.</p></div>';
    band1.parentNode.insertBefore(sec, band1);
    rethemed();
  }
}

// ---- fixtures / results / next-match strip ----
function fxRow(f){
  const score = f.status === 'played'
    ? `<div class="v" style="font-weight:800;color:#151C36">${f.venue==='away' ? (f.ag+'-'+f.hg) : (f.hg+'-'+f.ag)}</div><div class="g"><span class="pill ${f.hg>f.ag?'w':(f.hg===f.ag?'t':'p')}">${f.hg>f.ag?'W':(f.hg===f.ag?'D':'L')}</span></div>`
    : `<div class="v">${esc(f.ko)}</div><div class="g" style="font-size:12px;color:#8a90a0">${f.status==='postponed'?'POSTPONED':esc(f.ground||'Venue TBC')}</div>`;
  const pill = f.status==='postponed' ? '<span class="pill p">POSTPONED</span>'
    : (f.venue==='home' ? '<span class="pill h">HOME</span>' : f.venue==='away' ? '<span class="pill a">AWAY</span>' : '<span class="pill t">TBC</span>');
  return `<div class="r"><div class="d">${esc(fmtD(f.date))}</div><div class="o">${esc(f.opp)}</div><div>${pill}</div>${score}</div>`;
}
const fxP = (page==='index'||page==='match-centre') ? J('/api/fixtures') : null;
if (fxP) fxP.then(items => {
  if (!items || !items.length) return;
  const upcoming = items.filter(f => f.status !== 'played');
  const played = items.filter(f => f.status === 'played').reverse();
  // next-match strip (all pages with strip get this via the shared fetch below too)
  if (page === 'index'){
    const grid = document.querySelector('.fx');
    if (grid) grid.innerHTML = upcoming.slice(0,5).map(fxRow).join('');
    // "Last time out" card: most recent result from the fixtures data
    // (the live-score feed overrides this while a match is live / just finished)
    const card = document.querySelector('.scorecard');
    if (card && !card.classList.contains('livecard')){
      const last = played.slice().sort((x,y) => String(y.date||'').localeCompare(String(x.date||'')))[0];
      if (last){
        const us = 'AFC Totton', them = last.opp || 'Opponent';
        const a = last.venue === 'away' ? them : us, b = last.venue === 'away' ? us : them;
        const ag = last.venue === 'away' ? last.ag : last.hg, bg = last.venue === 'away' ? last.hg : last.ag;
        const res = last.hg > last.ag ? 'WIN' : (last.hg === last.ag ? 'DRAW' : 'DEFEAT');
        card.innerHTML = `<div class="t">LAST TIME OUT &middot; ${res}</div>
          <div class="row"><span>${esc(a)}</span><span>${ag}</span></div>
          <div class="row"><span style="color:#b9c6de">${esc(b)}</span><span style="color:#b9c6de">${bg}</span></div>
          <div style="margin-top:12px;font-size:11px;color:#8fa3c7;letter-spacing:.05em">${esc((last.comp || 'National League South').toUpperCase())} &middot; ${esc(fmtD(last.date)).toUpperCase()}</div>
          ${last.scorers ? `<div style="margin-top:6px;font-size:12px;color:#b9c6de">&#9917; ${esc(last.scorers.replace(/\s+,/g, ','))}</div>` : ''}`;
      } else if (upcoming[0]){
        const n = upcoming[0];
        card.innerHTML = `<div class="t">NEXT UP</div>
          <div class="row"><span>${n.venue === 'away' ? esc(n.opp) : 'AFC Totton'}</span><span></span></div>
          <div class="row"><span style="color:#b9c6de">${n.venue === 'away' ? 'AFC Totton' : esc(n.opp)}</span><span></span></div>
          <div style="margin-top:12px;font-size:11px;color:#8fa3c7;letter-spacing:.05em">${esc(fmtD(n.date)).toUpperCase()} &middot; KO ${esc(n.ko)}</div>`;
      }
    }
  }
  if (page === 'match-centre'){
    const fx = document.querySelector('#fx .fx');
    if (fx) fx.innerHTML = upcoming.map(fxRow).join('');
    const rs = document.querySelector('#rs .fx');
    if (rs) rs.innerHTML = played.map(fxRow).join('') || '<div class="r"><div class="d"></div><div class="o" style="color:#8a90a0">No results yet this season.</div></div>';
  }
  rethemed();
});
// strip on every page
J('/api/fixtures').then(items => {
  if (!items) return;
  const next = items.find(f => f.status === 'scheduled');
  const strip = document.querySelector('.strip .in');
  if (!next || !strip) return;
  const b = strip.querySelector('b'), m = strip.querySelector('.meta');
  const title = next.venue === 'away' ? `${next.opp} v AFC Totton` : `AFC Totton v ${next.opp}`;
  if (b) b.textContent = title;
  if (m) m.innerHTML = `${esc(next.comp)} &middot; ${esc(fmtDL(next.date))} &middot; KO ${esc(next.ko)} &middot; ${esc(next.ground || 'Venue TBC')}`;
});

// ---- league table (live link to the official table) ----
if (page === 'match-centre'){
  const pane = document.getElementById('tb');
  if (pane){ pane.innerHTML = `<div style="border:1px solid var(--line);border-radius:5px;padding:44px 24px;text-align:center">
    <div class="eyebrow" style="color:#5B7AB8">ENTERPRISE NATIONAL LEAGUE SOUTH</div>
    <h3 style="font-size:24px;color:#151C36;margin:12px 0 10px;font-weight:800">The live league table</h3>
    <p style="color:#5b6272;font-size:14.5px;max-width:54ch;margin:0 auto 22px;line-height:1.6">Always up to date, straight from the source \u2014 updated automatically after every match.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a class="btn" style="color:#fff" href="https://www.bbc.co.uk/sport/football/national-league-south/table" target="_blank" rel="noopener">View the live table \u2014 BBC Sport</a>
    <a class="btn dark" style="color:#fff" href="https://www.thenationalleague.org.uk/match-hub/tables" target="_blank" rel="noopener">Official league site</a></div></div>`;
  rethemed(); }
}

// ---- live score (homepage card + match centre live tab + results) ----
function scoreLines(s){
  const us = 'AFC Totton', them = s.opp || 'Opponent';
  const a = s.venue === 'away' ? them : us, b = s.venue === 'away' ? us : them;
  const ag = s.venue === 'away' ? s.away : s.home, bg = s.venue === 'away' ? s.home : s.away;
  return {a, b, ag, bg};
}
function applyScore(s){
  if (!s) return;
  // headline sponsor in the matchday strip (pre-match + live)
  if (s.sponsor){
    const strip = document.querySelector('.strip .in');
    if (strip && !strip.querySelector('.msp')){
      const el = document.createElement('span');
      el.className = 'lbl msp'; el.style.background = '#C9A24B'; el.style.color = '#231B00';
      el.innerHTML = s.sponsorUrl ? `<a href="${esc(s.sponsorUrl)}" target="_blank" rel="noopener" style="color:inherit">MATCHDAY SPONSOR &middot; ${esc(s.sponsor).toUpperCase()}</a>` : `MATCHDAY SPONSOR &middot; ${esc(s.sponsor).toUpperCase()}`;
      const btn = strip.querySelector('.btn');
      strip.insertBefore(el, btn || null);
    }
  }
  // matchday mode cleanup when not live
  if (page === 'index' && !(s.status === 'live' || s.status === 'ht')){
    document.body.classList.remove('matchday');
    const md0 = document.getElementById('mdm'); if (md0) md0.remove();
  }
  if (!s.status || s.status === 'none' || s.status === 'upcoming') return;
  const L = scoreLines(s);
  // goal flash: celebrate the moment Totton score while a fan has the page open
  try {
    const key = 'afct_ls', prev = sessionStorage.getItem(key);
    const cur = s.opp + '|' + s.home + '|' + s.away;
    if ((s.status === 'live' || s.status === 'ht') && prev){
      const p = prev.split('|');
      if (p[0] === s.opp && Number(s.home) > Number(p[1]) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        let gf = document.getElementById('goalflash');
        if (!gf){ gf = document.createElement('div'); gf.id = 'goalflash'; document.body.appendChild(gf);
          gf.addEventListener('click', () => gf.classList.remove('on')); }
        gf.innerHTML = '<b>GOOOAL!</b><span>' + esc(L.a) + ' ' + L.ag + ' &ndash; ' + L.bg + ' ' + esc(L.b) + (s.note ? ' &middot; ' + esc(s.note) : '') + '</span>';
        gf.classList.add('on');
        setTimeout(() => gf.classList.remove('on'), 5000);
      }
    }
    sessionStorage.setItem(key, cur);
  } catch(e){}
  // matchday mode: homepage scoreboard takeover while the Stags are playing
  if (page === 'index' && (s.status === 'live' || s.status === 'ht')){
    document.body.classList.add('matchday');
    let md = document.getElementById('mdm');
    if (!md){
      md = document.createElement('section'); md.id = 'mdm'; md.className = 'mdm';
      const hero = document.querySelector('.hero');
      if (hero) hero.parentNode.insertBefore(md, hero);
    }
    md.innerHTML = '<div class="lv' + (s.status === 'ht' ? ' ht' : '') + '">' + (s.status === 'ht' ? 'HALF-TIME' : 'LIVE &middot; ' + esc(s.minute || '')) + '</div>'
      + '<div class="comp">Enterprise National League South' + (s.venue === 'away' ? '' : ' &middot; The Snows Stadium') + '</div>'
      + '<div class="teams"><span class="tm">' + esc(L.a) + '</span><span class="sc">' + L.ag + '<i>&ndash;</i>' + L.bg + '</span><span class="tm">' + esc(L.b) + '</span></div>'
      + (s.note ? '<div class="note">' + esc(s.note) + '</div>' : '')
      + (s.sponsor ? '<div class="sp">Matchday sponsor &middot; ' + esc(s.sponsor) + '</div>' : '')
      + '<div class="cta"><a class="btn" style="color:#fff" href="/match-centre.html">Match Centre</a><a class="btn ghost" href="/gallery.html">Matchday photos</a></div>';
  }
  const badge = s.status === 'live' ? `<span class="lp">LIVE ${esc(s.minute)}</span>` : (s.status === 'ht' ? '<span class="lp" style="animation:none;background:#5B7AB8">HALF-TIME</span>' : 'FULL TIME');
  const spLine = s.sponsor ? ` &middot; MATCHDAY SPONSOR: ${esc(s.sponsor).toUpperCase()}` : '';
  const card = document.querySelector('.scorecard');
  if (card){
    card.classList.add('livecard');
    card.innerHTML = `<div class="t">${s.status==='ft'?'RESULT · FULL TIME':'MATCH IN PROGRESS'} ${s.status!=='ft'?badge:''}</div>
      <div class="row"><span>${esc(L.a)}</span><span>${L.ag}</span></div>
      <div class="row"><span style="color:#b9c6de">${esc(L.b)}</span><span style="color:#b9c6de">${L.bg}</span></div>
      <div style="margin-top:12px;font-size:11px;color:#8fa3c7;letter-spacing:.05em">${esc(s.note) || 'SNOWS STADIUM · NATIONAL LEAGUE SOUTH'}${spLine}</div>`;
  }
  const lv = document.getElementById('lv');
  if (lv) lv.innerHTML = `<div style="border:1px solid var(--line);border-radius:5px;padding:34px;text-align:center">
    <div style="margin-bottom:12px">${badge}</div>
    <div style="font-size:26px;font-weight:800;color:#151C36">${esc(L.a)} ${L.ag} &ndash; ${L.bg} ${esc(L.b)}</div>
    <div style="margin-top:10px;color:#5b6272;font-size:14px">${esc(s.note)||''}</div>
    ${s.sponsor?`<div style="margin-top:14px;font-size:11px;letter-spacing:.1em;color:#C9A24B;font-weight:800">MATCHDAY HEADLINE SPONSOR &middot; ${esc(s.sponsor).toUpperCase()}</div>`:''}</div>`;
  // live banner at the top of the Results tab
  const rs = document.querySelector('#rs');
  if (rs && (s.status === 'live' || s.status === 'ht')){
    let lb = rs.querySelector('.liverow');
    if (!lb){ lb = document.createElement('div'); lb.className = 'liverow'; rs.insertBefore(lb, rs.firstChild); }
    lb.innerHTML = `<div style="border:1px solid #C0392B;border-radius:5px;padding:14px 18px;margin-bottom:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <span class="lp">LIVE ${esc(s.minute)}</span><b style="font-size:16px">${esc(L.a)} ${L.ag} &ndash; ${L.bg} ${esc(L.b)}</b>
      <span style="font-size:12px;color:#8a90a0">Full result appears here automatically after the final whistle.</span></div>`;
  }
  rethemed();
}
if (page === 'index' || page === 'match-centre'){
  const tick = () => J('/api/score').then(applyScore);
  tick(); setInterval(tick, 45000);
} else {
  J('/api/score').then(applyScore); // sponsor strip on other pages
}

// ---- squad (teams page) ----
if (page === 'teams') J('/api/players').then(items => {
  if (!items || !items.length) return;
  const firstGrp = document.querySelector('.grp');
  if (!firstGrp) return;
  const host = firstGrp.parentNode;
  const marker = document.createElement('div');
  host.insertBefore(marker, firstGrp);
  host.querySelectorAll('.grp, .sq').forEach(el => el.remove());
  const gname = {gk:'GOALKEEPERS',df:'DEFENDERS',mf:'MIDFIELDERS',fw:'FORWARDS'};
  let html = '';
  ['gk','df','mf','fw'].forEach(g => {
    const list = items.filter(p => p.group === g).sort((a,b) => a.num - b.num);
    if (!list.length) return;
    html += `<div class="grp">${gname[g]}</div><div class="sq">` + list.map(p => {
      const chip = p.sponsor ? `<span class="spchip">${p.sponsorLogo?`<img src="${esc(p.sponsorLogo)}" alt="">`:''}${esc(p.sponsor)}</span>` : '';
      return `<div class="pc ${p.img?'':'empty'}" data-id="${esc(p.id)}">${chip}<span class="no">${p.num||''}</span>${p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`:''}<div class="nm"><b>${esc(p.name)}</b><span>${esc(p.pos)}</span></div></div>`;
    }).join('') + '</div>';
  });
  marker.insertAdjacentHTML('afterend', html);
  marker.remove();
  // the squad's quiet extra — tap the diamond
  const lastSq = Array.from(host.querySelectorAll('.sq')).pop();
  if (lastSq) lastSq.insertAdjacentHTML('beforeend',
    '<a class="pc athx" href="https://athvora.co.uk" target="_blank" rel="noopener" title="Athvora"><div class="nm"><b>Athvora</b><span>Every name has value</span></div></a>');
  let modal = document.getElementById('pmodal');
  if (!modal){
    modal = document.createElement('div'); modal.id = 'pmodal';
    modal.innerHTML = '<div class="bx"><button class="x2">&times;</button><div class="ph2"></div><div class="bd2"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal || e.target.className === 'x2') modal.style.display = 'none'; });
  }
  host.addEventListener('click', e => {
    const pc = e.target.closest('.pc'); if (!pc) return;
    if (e.target.closest('.spchip')) return;
    const p = items.find(x => x.id === pc.getAttribute('data-id')); if (!p) return;
    modal.querySelector('.ph2').innerHTML = p.img ? `<img src="${esc(p.img)}" alt="">` : '<span style="color:rgba(255,255,255,.3);font-size:11px;letter-spacing:.12em;font-weight:800;align-self:center">PHOTO TO FOLLOW</span>';
    const multiKit = !!(p.sponsorAway || p.sponsorThird);
    const spRow = (label, nm, url, logo) => nm ? `<div class="spl">${logo?`<img src="${esc(logo)}" alt="">`:''}<span><b style="font-size:9.5px;letter-spacing:.12em;color:#8a90a0">${label}</b>&nbsp; <b>${esc(nm)}</b>${url?` &middot; <a href="${esc(url)}" target="_blank" rel="noopener" style="color:#5B7AB8;font-weight:700">Visit site &rsaquo;</a>`:''}</span></div>` : '';
    modal.querySelector('.bd2').innerHTML = `<h3>${p.num?p.num+' · ':''}${esc(p.name)}</h3><div class="ps">${esc(p.pos)}</div>`
      + `<p>${esc(p.bio) || 'Player profile to follow.'}</p>`
      + spRow(multiKit ? 'HOME KIT SPONSOR' : 'PLAYER SPONSOR', p.sponsor, p.sponsorUrl, p.sponsorLogo)
      + spRow('AWAY KIT SPONSOR', p.sponsorAway, p.sponsorAwayUrl)
      + spRow('THIRD KIT SPONSOR', p.sponsorThird, p.sponsorThirdUrl);
    modal.style.display = 'flex';
  });
  const spu = {};
  items.forEach(p => { if (p.sponsorUrl) spu[p.id] = p.sponsorUrl; });
  host.addEventListener('click', e => {
    const chip = e.target.closest('.spchip'); if (!chip) return;
    const pc = chip.closest('.pc'); const u = spu[pc.getAttribute('data-id')];
    if (u) window.open(u, '_blank');
  });
  rethemed();
});

// ---- events (events page + homepage teaser) ----
function evCard(e){
  const d = fmtDL(e.date);
  return `<div class="card evcard"><div class="ph"><img src="${esc(e.img)||'https://lh3.googleusercontent.com/d/19SIqXsPGjVk7sh9T7NCBA6OKhec-zliQ=w1000'}" alt="" loading="lazy"></div>
  <div class="bd"><span class="when">${esc(d)}${e.time?' · '+esc(e.time):''}</span><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p>
  <div class="meta">${esc(e.where)}</div>
  <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
    ${e.tickets?`<a class="btn" style="color:#fff" href="${esc(e.tickets)}" target="_blank" rel="noopener">Tickets on Fan Base</a>`:''}
    <a class="btn dark" style="color:#fff" href="mailto:events@afctotton.com?subject=${encodeURIComponent(e.title)}">Ask about this event</a>
  </div></div></div>`;
}
if (page === 'events') J('/api/events').then(items => {
  if (!items) return;
  const grid = document.getElementById('evgrid');
  if (grid) grid.innerHTML = items.map(evCard).join('') || '<p style="color:#8a90a0">No events currently listed — check back soon.</p>';
  const cal = document.getElementById('evcal');
  if (cal && items.length){
    const months = {};
    items.forEach(e => { const m = new Date(e.date+'T12:00:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'}); (months[m] = months[m] || []).push(e); });
    cal.innerHTML = Object.keys(months).map(m => `<div style="margin-bottom:22px"><div class="grp" style="margin:0 0 10px">${esc(m)}</div>`
      + months[m].map(e => `<div style="display:flex;gap:14px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px;align-items:baseline"><b style="min-width:92px;color:#151C36">${esc(fmtD(e.date))}</b><span style="flex:1"><b>${esc(e.title)}</b> &middot; ${esc(e.where)}${e.time?' &middot; '+esc(e.time):''}</span>${e.tickets?`<a href="${esc(e.tickets)}" target="_blank" rel="noopener" style="color:#5B7AB8;font-weight:700;font-size:12px">TICKETS &rsaquo;</a>`:''}</div>`).join('')
      + '</div>').join('');
  }
  rethemed();
});

// ---- youth page: youth news + youth photos ----
if (page === 'youth'){
  J('/api/news').then(items => {
    if (!items) return;
    const yn = items.filter(i => String(i.cat || '').toUpperCase() === 'YOUTH').slice(0, 3);
    if (!yn.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Youth news</h2><a href="/news.html">All news &rsaquo;</a></div><div class="grid g3">' + yn.map(card).join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
  J('/api/gallery').then(items => {
    const yg = (items || []).filter(i => (i.cat || '') === 'YOUTH').slice(0, 8);
    if (!yg.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section'); sec.setAttribute('style', 'background:#FAFBFD');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Youth in pictures</h2><a href="/gallery.html">Full gallery &rsaquo;</a></div><div class="grid g4">' + yg.map(g => '<a class="card" href="/gallery.html"><div class="ph"><img src="' + esc(g.img) + '" alt="" loading="lazy"></div>' + (g.caption ? '<div class="bd"><p>' + esc(g.caption) + '</p></div>' : '') + '</a>').join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
}

// ---- alternative provision page: provision news + photos ----
if (page === 'provision'){
  J('/api/news').then(items => {
    if (!items) return;
    const pn = items.filter(i => String(i.cat || '').toUpperCase() === 'PROVISION').slice(0, 3);
    if (!pn.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Provision news</h2><a href="/news.html">All news &rsaquo;</a></div><div class="grid g3">' + pn.map(card).join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
  J('/api/gallery').then(items => {
    const pg = (items || []).filter(i => (i.cat || '') === 'PROVISION').slice(0, 8);
    if (!pg.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section'); sec.setAttribute('style', 'background:#FAFBFD');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Life at the provision</h2><a href="/gallery.html">Full gallery &rsaquo;</a></div><div class="grid g4">' + pg.map(g => '<a class="card" href="/gallery.html"><div class="ph"><img src="' + esc(g.img) + '" alt="" loading="lazy"></div>' + (g.caption ? '<div class="bd"><p>' + esc(g.caption) + '</p></div>' : '') + '</a>').join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
}

// ---- community page: community news + photos ----
if (page === 'community'){
  J('/api/news').then(items => {
    if (!items) return;
    const cn = items.filter(i => String(i.cat || '').toUpperCase() === 'COMMUNITY').slice(0, 3);
    if (!cn.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Community news</h2><a href="/news.html">All news &rsaquo;</a></div><div class="grid g3">' + cn.map(card).join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
  J('/api/gallery').then(items => {
    const cg = (items || []).filter(i => (i.cat || '') === 'COMMUNITY').slice(0, 8);
    if (!cg.length) return;
    const band = document.querySelector('section.band'); if (!band) return;
    const sec = document.createElement('section'); sec.setAttribute('style', 'background:#FAFBFD');
    sec.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Community in pictures</h2><a href="/gallery.html">Full gallery &rsaquo;</a></div><div class="grid g4">' + cg.map(g => '<a class="card" href="/gallery.html"><div class="ph"><img src="' + esc(g.img) + '" alt="" loading="lazy"></div>' + (g.caption ? '<div class="bd"><p>' + esc(g.caption) + '</p></div>' : '') + '</a>').join('') + '</div></div>';
    band.parentNode.insertBefore(sec, band); rethemed();
  });
}

// ---- fan zone: homepage banner while a vote is open ----
if (page === 'index') J('/api/fanzone').then(cfg => {
  if (!cfg || !cfg.vote || !cfg.vote.open) return;
  const sec = document.createElement('section'); sec.className = 'band'; sec.style.padding = '30px 0';
  sec.innerHTML = '<div class="wrap" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">'
    + '<span class="lbl" style="background:#C0392B;font-weight:800;letter-spacing:.12em;font-size:10.5px;padding:5px 10px;border-radius:2px;color:#fff">VOTE OPEN</span>'
    + '<b style="font-size:17px;flex:1;min-width:220px">' + esc(cfg.vote.title) + ' &mdash; have your say</b>'
    + '<a class="btn" style="color:#fff" href="/fanzone.html">Vote now</a></div>';
  const anchor = document.querySelector('.fanband') || Array.from(document.querySelectorAll('section')).pop();
  if (anchor) anchor.parentNode.insertBefore(sec, anchor);
  rethemed();
});

// ---- gallery page ----
if (page === 'gallery') J('/api/gallery').then(items => {
  const grid = document.getElementById('galgrid'), chips = document.getElementById('galchips');
  if (!grid) return;
  if (!items || !items.length){ grid.innerHTML = '<p style="color:#8a90a0">No photos yet \u2014 the club team adds them from the admin panel, and they appear here instantly.</p>'; return; }
  const cats = ['ALL'].concat(Array.from(new Set(items.map(i => i.cat || 'CLUB'))));
  let cur = 'ALL';
  const draw = () => {
    grid.innerHTML = items.filter(i => cur === 'ALL' || (i.cat || 'CLUB') === cur)
      .map(g => '<div class="gph" data-i="' + items.indexOf(g) + '"><img src="' + esc(g.img) + '" loading="lazy" alt="' + esc(g.caption) + '">' + (g.caption ? '<div class="gc">' + esc(g.caption) + '</div>' : '') + '</div>').join('');
    rethemed();
  };
  chips.innerHTML = cats.map(c => '<button class="chip ' + (c === cur ? 'on' : '') + '" data-c="' + c + '">' + c + '</button>').join('');
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; cur = b.getAttribute('data-c'); chips.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
  const v = document.createElement('div'); v.id = 'storyview';
  v.innerHTML = '<button class="x">&times;</button><img alt=""><div class="cap"></div>';
  document.body.appendChild(v);
  grid.addEventListener('click', e => {
    const el = e.target.closest('.gph'); if (!el) return;
    const g = items[+el.getAttribute('data-i')];
    v.querySelector('img').src = g.img;
    v.querySelector('.cap').innerHTML = esc(g.caption || 'AFC Totton') + ' &nbsp; <button class="btn" style="padding:8px 14px" id="gshare">Share photo</button>';
    v.style.display = 'flex';
    v.querySelector('#gshare').onclick = ev => { ev.stopPropagation();
      if (navigator.share) navigator.share({ title: 'AFC Totton', text: g.caption || 'AFC Totton', url: g.img }).catch(() => {});
      else { navigator.clipboard && navigator.clipboard.writeText(g.img); alert('Photo link copied \u2014 paste it anywhere.'); } };
  });
  v.addEventListener('click', e => { if (e.target === v || e.target.className === 'x') v.style.display = 'none'; });
});

// ---- dynamic news cards ----
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
  rethemed();
});

// ---- sponsor wall (dynamic: every sponsor in the registry, linked where we have a site) ----
if (document.querySelector('.sponsors')) J('/api/sponsors').then(list => {
  if (!list || !list.length) return;
  document.querySelectorAll('.sponsors').forEach(gridEl => {
    gridEl.innerHTML = list.map(s => {
      const src = s.src || (s.gid ? 'https://lh3.googleusercontent.com/d/' + s.gid + '=w320' : '');
      const inner = src
        ? '<img src="' + esc(src) + '" alt="' + esc(s.name) + '" loading="lazy">'
        : '<span class="ntile">' + esc(s.name) + '</span>';
      return s.url
        ? '<div><a class="splink" href="' + esc(s.url) + '"' + (s.url.indexOf('/') === 0 ? '' : ' target="_blank" rel="noopener sponsored"') + ' data-sp="' + esc(s.name) + '" title="' + esc(s.name) + '">' + inner + '</a></div>'
        : '<div>' + inner + '</div>';
    }).join('');
  });
  rethemed();
});

// ---- analytics beacons (pageviews + clicks) ----
(function(){
  const send = (type, target) => { try {
    navigator.sendBeacon('/api/track', new Blob([JSON.stringify({ type, page: location.pathname, target })], { type: 'application/json' }));
  } catch(e){} };
  send('pageview');
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    const h = a.getAttribute('href') || '';
    if (a.getAttribute('data-sp')) send('click', 'sponsor:' + a.getAttribute('data-sp'));
    else if (h.indexOf('mailto:') === 0) send('click', 'email:' + h.slice(7).split('?')[0]);
    else if (h.indexOf('fanbase') > -1) send('click', 'fanbase-tickets');
    else if (a.classList.contains('btn')) send('click', 'btn:' + (a.textContent || '').trim().slice(0, 40));
  }, true);
})();

// ---- fan capture band (homepage) ----
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
