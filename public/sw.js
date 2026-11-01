/* eslint-disable no-restricted-globals */
// Bharat Pulse Offline & PWA Service Worker
const CACHE_NAME = 'bharat-pulse-v1';

const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
  '/hi/offline',
];

// Install: pre-cache critical offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for news & fallback to offline page on no network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET, API, and Chrome extension requests
  if (request.method !== 'GET' || request.url.includes('/api/') || request.url.includes('/admin/')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the latest visited news article
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // If offline / no network, try returning cached page
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Otherwise return offline reading room
          const offlinePage = await caches.match('/hi/offline');
          return offlinePage || new Response('<h1>आप ऑफ़लाइन हैं (You are Offline)</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 2. Images and static assets: Cache first with network fallback
  if (
    request.destination === 'image' ||
    request.url.includes('/uploads/') ||
    request.url.includes('images.unsplash.com') ||
    request.url.includes('placehold.co')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});

