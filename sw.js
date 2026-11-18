// Service worker (PWA instalável).
// Guarda em cache APENAS arquivos estáticos do próprio site (CSS, JS, imagens, manifest).
// Nunca guarda: páginas HTML (inclusive o painel do dono), nem qualquer requisição de outra
// origem (Firebase, Google, Instagram). Assim dados de clientes não ficam no aparelho.
const CACHE_NAME = 'barberpro-static-v4';
const STATIC_EXT = /\.(css|js|png|jpg|jpeg|webp|svg|json)$/i;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // outra origem: sem cache
  if (!STATIC_EXT.test(url.pathname)) return;        // HTML e navegação: sem cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
