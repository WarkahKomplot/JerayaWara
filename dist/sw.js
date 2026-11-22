const CACHE_NAME = 'jerayawara-v12';
const TILE_CACHE_NAME = 'jerayawara-tiles-v1';
const KEEP_CACHES = [CACHE_NAME, TILE_CACHE_NAME];
// Viewed tiles are cached forever by the fetch handler; without a cap an
// install grows until the browser evicts the whole origin. 3,000 tiles is
// roughly 45–60 MB at OSM's z16–18 tile sizes.
const TILE_CACHE_MAX_ENTRIES = 3000;
const TILE_TRIM_INTERVAL = 100;
let tilePutsSinceTrim = 0;

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
    `${scope}icons/icon-512.svg`,
    `${scope}icons/icon-192.png`,
    `${scope}icons/icon-512.png`,
    `${scope}icons/icon-maskable-512.png`,
    `${scope}apple-touch-icon.png`
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

async function trimTileCache() {
  try {
    const tileCache = await caches.open(TILE_CACHE_NAME);
    const keys = await tileCache.keys();
    const excess = keys.length - TILE_CACHE_MAX_ENTRIES;
    if (excess <= 0) return;
    // Cache API keys are returned in insertion order in practice, so the oldest
    // viewed tiles are evicted first.
    for (let i = 0; i < excess; i++) {
      await tileCache.delete(keys[i]);
    }
    console.log(`JerayaWara SW trimmed ${excess} old map tiles`);
  } catch (err) {
    console.warn('JerayaWara SW tile trim skipped:', err);
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys.filter((key) => !KEEP_CACHES.includes(key)).map((key) => caches.delete(key))
      );
      await trimTileCache();
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
                tilePutsSinceTrim += 1;
                if (tilePutsSinceTrim >= TILE_TRIM_INTERVAL) {
                  tilePutsSinceTrim = 0;
                  trimTileCache();
                }
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
