/* Only the offline screen and app icons are cached. Account pages and API data stay online. */
const CACHE = 'cordova-pwa-v1';
const SHELL = ['/offline.html', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('cordova-pwa-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
  } else if (SHELL.includes(url.pathname) && !url.search) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
