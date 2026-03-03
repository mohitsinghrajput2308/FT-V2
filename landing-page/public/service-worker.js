/* FinTrack Service Worker
   Strategy: Cache-first for assets, network-first for API calls.
   Version bump the CACHE_NAME to force a full refresh on deploy.
*/

const CACHE_NAME = 'fintrack-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Install: pre-cache shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: remove stale caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for static assets, network-first for API ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin API / Supabase requests
  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('supabase.in')) return;
  if (url.hostname.includes('paddle.com')) return;
  if (url.hostname.includes('crisp.chat')) return;
  if (url.hostname.includes('googletagmanager.com')) return;
  if (url.hostname.includes('google-analytics.com')) return;
  if (url.hostname.includes('exchangerate-api.com')) return;
  if (url.hostname.includes('fonts.googleapis.com')) return;
  if (url.hostname.includes('fonts.gstatic.com')) return;

  // Network-first for HTML navigations (always get fresh shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets (.js, .css, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache valid same-origin responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
