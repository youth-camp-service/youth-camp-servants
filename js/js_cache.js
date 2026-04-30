self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open("v1")
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/style.css",
          "/wp-content/plugins/carousel-slider/assets/js/frontend-v2.js%3Fver=2.2.0",
          "/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js%3Fver=3.6.5",
          "/wp-includes/js/jquery/jquery.min.js%3Fver=3.6.0' id='jquery-core-js",
          "/wp-includes/js/jquery/jquery-migrate.min.js%3Fver=3.3.2' id='jquery-migrate-js",
          "/wp-content/plugins/elementor/assets/js/frontend-modules.min.js%3Fver=3.6.5",
          "/wp-content/plugins/elementor/assets/lib/waypoints/waypoints.min.js%3Fver=4.0.2",
          "/wp-includes/js/jquery/ui/core.min.js%3Fver=1.13.1' id='jquery-ui-core-js",
          "/wp-includes/js/jquery/ui/core.min.js%3Fver=1.13.1",
          "/wp-content/plugins/elementor/assets/js/frontend.min.js%3Fver=3.6.5",
          "wp-includes/css/dist/block-library/style.min.css%3Fver=5.9.3.css",
          "/gallery/snowTroopers.jpg",
        ]),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request)
          .then((response) => {
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            let responseClone = response.clone();

            caches.open("v1").then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => caches.match("/gallery/myLittleVader.jpg"));
      }
    }),
  );
});
// Try to get data from the cache, but fall back to fetching it live.
async function getData() {
  const cacheVersion = 1;
  const cacheName = `myapp-${cacheVersion}`;
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  let cachedData = await getCachedData(cacheName, url);

  if (cachedData) {
    console.log("Retrieved cached data");
    return cachedData;
  }

  console.log("Fetching fresh data");

  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.add(url);
  cachedData = await getCachedData(cacheName, url);
  await deleteOldCaches(cacheName);

  return cachedData;
}

// Get data from the cache.
async function getCachedData(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return await cachedResponse.json();
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys();

  for (const key of keys) {
    const isOurCache = key.startsWith("myapp-");
    if (currentCache === key || !isOurCache) {
      continue;
    }
    caches.delete(key);
  }
}

try {
  const data = await getData();
  console.log({ data });
} catch (error) {
  console.error({ error });
}