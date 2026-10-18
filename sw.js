const CACHE = 'mycaptcareer-v1';
const CORE = [
  './', './index.html', './manifest.webmanifest', './CaptIcon.png',
  './apple-touch-icon-v2.png', './assets/icon-192.png', './assets/icon-512.png',
  './assets/apps/wordahead.png', './assets/apps/triptail.png', './assets/apps/homets.png',
  './assets/apps/notamhighlighter.png', './assets/apps/ic_launcher-playstore.png',
  './assets/apps/app_icon.png', './assets/apps/sajulottoicon.png',
  './assets/projects/chart-holder.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('mycaptcareer-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const local = url.origin === self.location.origin && url.href.startsWith(self.registration.scope);
  const font = ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!local && !font) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
          return response;
        }
        return (await cache.match('./index.html')) || response;
      } catch (error) {
        const saved = await cache.match('./index.html');
        if (saved) return saved;
        throw error;
      }
    }
    const saved = await cache.match(request);
    if (saved) return saved;
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
    return response;
  })());
});
