// Lets the app open without internet. Bump VERSION when files change.
const VERSION = 'v4';
const CACHE = 'workers-' + VERSION; // prefixed: other apps on this github.io origin share Cache Storage
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('workers-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (so updates arrive), but use the saved copy if the network
// fails or takes more than 3 seconds. Only good responses are saved.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  let saved = Promise.resolve();
  const network = fetch(e.request).then(res => {
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      saved = caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    }
    return res;
  });
  e.waitUntil(network.then(() => saved, () => {}));
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  e.respondWith(new Promise(resolve => {
    const timer = setTimeout(() => cached().then(r => r && resolve(r)), 3000);
    network.then(
      res => { clearTimeout(timer); resolve(res); },
      () => { clearTimeout(timer); cached().then(r => resolve(r || Response.error())); }
    );
  }));
});
