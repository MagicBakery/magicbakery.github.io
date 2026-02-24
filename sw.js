// Change this every time you deploy new assets
const CACHE_NAME = 'mt-app-20260224';
const ASSETS_TO_CACHE = [
  '/',           // The root URL
  '/mt.html',     // Your main app file
  '/starterpack.json'
];

// 1. Install Event: Saves the app shell into the browser's storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Cleans up old caches if you ever change CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: The "Offline Magic"
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Start the network fetch to update the cache for next time
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // If the network request is good, save it to the cache
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If network fails (offline), we just do nothing and let the cache rule
        });

        // Return the cached response immediately if it exists, 
        // otherwise wait for the network response
        return cachedResponse || fetchedResponse;
      });
    })
  );
});