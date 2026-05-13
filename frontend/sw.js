const CACHE_NAME = 'uniformity-cache-v13';

const APP_SHELL = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/login.html',
  '/register.html',
  '/cart.html',
  '/checkout.html',
  '/my-orders.html',
  '/my-order-details.html',
  '/my-listings.html',
  '/add-listing.html',
  '/product-detail.html',
  '/profile.html',
  '/admin.html',
  '/css/style.css',
  '/js/api.js',
  '/js/forgot-password.js',
  '/js/main.js',
  '/js/dashboard.js',
  '/js/cart.js',
  '/js/profile.js',
  '/js/my-orders.js',
  '/js/my-order-details.js',
  '/js/my-listings.js',
  '/js/product-detail.js',
  '/js/admin.js',
  '/img/logo.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET') return;
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
          .then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          });
      })
  );
});
