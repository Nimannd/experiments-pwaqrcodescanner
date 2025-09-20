const CACHE = 'qr-scan-exp-v2';
// Determine base path (GitHub Pages deploys at /<repo>/). We treat anything after origin up to the second slash as base.
const base = self.registration.scope.replace(location.origin, '').replace(/[^/]+\.html$/,'');
const ASSETS = [
  base,
  base + 'index.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    try { await c.addAll(ASSETS); } catch (err) { /* ignore */ }
  }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
