/* Mel's Dress Up Studio | offline support
   Saves the game files on the device so it can be played without internet.
   IMPORTANT: when you change any file, bump the version number below
   (e.g. "mel-v2") so devices pick up the new files. */
var CACHE = "mel-v1";
var FILES = [
  "./", "./index.html", "./gallery.html", "./shop.html", "./dreamland.html", "./404.html",
  "./style.css", "./data.js", "./app.js", "./render.js", "./dress-up.js", "./dreamland.js",
  "./mel.jpg", "./mel-mask-top.png", "./mel-mask-bottom.png", "./mel-mask-shoes.png",
  "./favicon.svg", "./icon-192.png", "./icon-512.png", "./manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Pages: try the network first so updates show, fall back to the saved copy.
   Everything else: use the saved copy, fetch it if missing. */
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match("./index.html"); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) {
    return r || fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res;
    });
  }));
});
