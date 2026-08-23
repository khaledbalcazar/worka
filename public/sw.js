// Service worker de Worka.
//
// Existe por dos motivos: sin él Chrome no ofrece "Instalar la app", y sin él
// la app instalada muestra el dinosaurio de sin conexión en cuanto el
// colectivo entra en una zona sin señal (el caso normal de nuestra gente).
//
// Es deliberadamente conservador: en la duda, va a la red. Nunca cachea
// respuestas de API, de autenticación ni nada que no sea GET, para no servir
// datos de sesión viejos ni romper las Server Actions.

const VERSION = "worka-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline";

// Lo mínimo para que la app abra sin señal.
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // Si algo del precache falla, la instalación sigue igual: es preferible
      // un service worker sin página de respaldo a no tener ninguno.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Rutas que jamás se cachean: sesión, datos y acciones.
function isPrivate(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/ingresar") ||
    url.pathname.startsWith("/perfil") ||
    url.pathname.startsWith("/mensajes") ||
    url.pathname.startsWith("/postulaciones")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url)) return;

  // Recursos con hash de Next: inmutables, así que caché primero.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Navegación: primero la red (los empleos cambian todo el tiempo), y si no
  // hay señal, la última versión vista; si tampoco, la pantalla sin conexión.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGES_CACHE).then((c) => c.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return (
            offline ||
            new Response("Sin conexión", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        })
    );
  }
});
