const CACHE = 'p-d80cba352d', PRIV = 'p-private';
const ASSETS = ['./', './index.html', './bundle.enc', './manifest.webmanifest', './robots.txt', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== PRIV).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; const url = new URL(e.request.url); if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/manifest.webmanifest')) { e.respondWith(caches.open(PRIV).then(c => c.match('manifest')).then(r => r || caches.match('./manifest.webmanifest').then(x => x || fetch(e.request)))); return; }
  if (e.request.mode === 'navigate') { e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html'))); return; }
  if (url.pathname.endsWith('/bundle.enc')) { // network first so updates arrive on the next open; cached copy when offline
    e.respondWith(Promise.race([fetch(e.request, {cache: 'no-cache'}).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put('./bundle.enc', c)); } return r; }),
      new Promise((_, rej) => setTimeout(rej, 6000))]).catch(() => caches.match('./bundle.enc'))); return; }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request)));
});
