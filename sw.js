// Service Worker for IEEE Day 2026 PWA
// Enables offline functionality

const CACHE_NAME = 'ieee-day-2026-v22';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/data.js',
  '/navigation-graph.js',
  '/floor0.png',
  '/floor1.png',
  '/floor2.png',
  '/manifest.json',
  '/background.jpg'
];

// Install Service Worker and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(() => {})
  );
});

// Activate and take control immediately, purge all previous caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first fetch strategy: always get fresh files when connected
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          }).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
