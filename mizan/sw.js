// Increase the version number with every update to the app files.
const CACHE = 'mizan-v3';
const FONTS = 'mizan-fonts-v1';
const FILES = ['./', 'index.html', 'pwa.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first, so updates arrive; after 3 seconds or offline, use the saved copy.
async function appFile(request) {
  const cache = await caches.open(CACHE);
  const key = request.mode === 'navigate' ? './' : request;
  const network = fetch(request).then(res => {
    if (res.ok) cache.put(key, res.clone());
    return res;
  });
  const saved = await cache.match(key, { ignoreSearch: true });
  if (!saved) return network;
  const late = new Promise(done => setTimeout(() => done(saved), 3000));
  return Promise.race([network.catch(() => saved), late]);
}

async function font(request) {
  const cache = await caches.open(FONTS);
  const saved = await cache.match(request);
  const network = fetch(request).then(res => {
    if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
    return res;
  });
  if (saved) { network.catch(() => {}); return saved; }
  return network;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') e.respondWith(font(e.request));
  else if (url.origin === location.origin) e.respondWith(appFile(e.request));
});
