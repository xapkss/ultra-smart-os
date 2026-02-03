/* FILENAME: sw.js
   PURPOSE: Offline Caching Engine (Service Worker)
*/

const CACHE_NAME = 'ultra-os-core-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './pic.png'
    // 'my.mp4' hum cache nahi karenge kyunki wo heavy ho sakta hai
];

// 1. INSTALL: Cache Core Files
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
    );
});

// 2. FETCH: Network First, Fallback to Cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Agar Online hai: Clone response & Update Cache
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return res;
            })
            .catch(() => {
                // Agar Offline hai: Return Cached Version
                return caches.match(e.request).then(cachedRes => {
                    if (cachedRes) return cachedRes;
                    // Agar cache me bhi nahi hai to fallback (Optional)
                });
            })
    );
});
