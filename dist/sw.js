const CACHE_NAME = 'jerayawara-v11';
const TILE_CACHE_NAME = 'jerayawara-tiles-v1';
const KEEP_CACHES = [CACHE_NAME, TILE_CACHE_NAME];

function isMapTile(url) {
  return (
    url.includes('tile.openstreetmap.org') ||
    url.includes('/tiles/') ||
    url.includes('cartocdn.com') ||
    url.includes('openfreemap.org') ||
    /\/\d+\/\d+\/\d+\.(png|jpg|pbf|webp)/.test(url)
  );
}

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const staticAssets = [
    scope,
    `${scope}index.html`,
    `${scope}manifest.json`,
    `${scope}icons/icon-192.svg`,
    `${scope}icons/icon-512.svg`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(staticAssets).catch((err) => {
        console.warn('JerayaWara SW pre-cache notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => !KEEP_CACHES.includes(key)).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through non-GET requests
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const scope = self.registration.scope;

  // 1. Map Tiles: Dedicated Cache-First strategy with cross-origin support
  if (isMapTile(url)) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((tileCache) => {
        return tileCache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (
                networkResponse &&
                (networkResponse.status === 200 || networkResponse.type === 'opaque')
              ) {
                tileCache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Graceful return if offline and tile not yet in cache
              return new Response('', { status: 404, statusText: 'Tile Not Cached' });
            });
        });
      })
    );
    return;
  }

  // 2. Navigation requests: Network-First to ensure fresh app updates
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(`${scope}index.html`).then((res) => res || caches.match(scope));
        })
    );
    return;
  }

  // 3. Static App Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(`${scope}index.html`).then(res => res || caches.match(scope));
          }
        });
    })
  );
});
