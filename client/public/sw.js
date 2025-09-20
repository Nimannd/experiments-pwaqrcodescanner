const CACHE = 'qr-scan-exp-v1';
const ASSETS = [
  '/',
  '/index.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
