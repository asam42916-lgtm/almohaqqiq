/* المحقق — Service Worker 0.2.0
   القاعدة: التطبيق يتحدّث خلف نفس الرابط، والمحتوى لا يُخزَّن أبداً (قضية الأسبوع الماضي لا تظهر).
   - ملفات التطبيق (index.html, manifest, icons): network-first مع نسخة احتياطية للعمل دون اتصال.
   - كل طلب إلى الخادم (api.almohaqqiq.com أو /v1/): network-only، لا تخزين. */
const CACHE = "almohaqqiq-beta-v0.4.0";
const APP_FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_FILES).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isApi = url.pathname.startsWith("/v1/") || url.hostname.startsWith("api.");
  if (isApi || e.request.method !== "GET") return;   // المحتوى من الخادم دائماً
  e.respondWith(
    fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
