const C = 'afct-demo-v4';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(res => {
    // only cache good (or opaque cross-origin) responses — never errors
    if (res && (res.ok || res.type === 'opaque')) {
      const cp = res.clone();
      caches.open(C).then(c => c.put(e.request, cp).catch(() => {}));
    }
    return res;
  }).catch(() => caches.match(e.request).then(r => {
    if (r) return r;
    // the index fallback is for page navigations ONLY —
    // serving HTML to a failed image/script request renders broken assets
    if (e.request.mode === 'navigate') return caches.match('/index.html');
    return Response.error();
  })));
});
