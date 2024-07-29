// cache.js

const CACHE_NAME = 'deltos-cloud-cache-v1';
const urlsToCache = [
  '/',
  '/res/images/icon.svg',
  '/res/css/icons.css',
  '/res/fonts/icons.woff2',
  '/res/fonts/GoogleSans.woff',
  '/manifest.json',
  'https://unpkg.com/htmx.org@2.0.1'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});