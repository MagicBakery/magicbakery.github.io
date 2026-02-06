// This is the Service Worker file (sw.js)

// 1. Install Event: Occurs when the browser first registers the worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    // Forces the waiting service worker to become the active service worker
    self.skipWaiting();
});

// 2. Activate Event: Occurs after installation
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
});

// 3. Fetch Event: REQUIRED for the "Install" prompt to appear.
// This allows the app to work (or at least try to work) offline.
self.addEventListener('fetch', (event) => {
    // For a minimal setup, we just let the request pass through to the network
    event.respondWith(fetch(event.request));
});