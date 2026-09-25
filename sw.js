// Millhollow — offline play. Code and page come from the network when it's there, so an
// update shows up on the next open; faces never change, so they're served from the cache.
const CACHE = "millhollow-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png",
  ...["themes", "data", "names", "game", "combat", "sprite", "icons", "juice", "ui"].map((f) => `js/ds/${f}.js`)];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const keep = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  };
  if (req.url.includes("/assets/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(keep)));
  } else {
    e.respondWith(fetch(req).then(keep).catch(() => caches.match(req, { ignoreSearch: true })));
  }
});
