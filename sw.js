/* ==========================================================
   Bar La Esquina - sw.js (service worker)
   Estrategia: "primero la caché" (cache first)
   ========================================================== */

// Versión de la caché. Cada vez que cambies un archivo de la app,
// subila (v2, v3...) para que los celulares descarguen todo de nuevo.
const VERSION = "v1";

// Nombre de la caché de esta versión (queda "bar-la-esquina-v1").
const NOMBRE_CACHE = "bar-la-esquina-" + VERSION;

// Lista de archivos que se guardan para usar la app sin internet.
// Las rutas empiezan con "./" porque la app vive dentro de una subcarpeta.
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png"
];

/* ---------- INSTALL: se ejecuta una vez, al instalar esta versión ---------- */
self.addEventListener("install", function (evento) {
  // waitUntil: le pide al navegador que espere a que termine el trabajo
  // antes de dar la instalación por completada.
  evento.waitUntil(
    // Abre (o crea) la caché con el nombre de esta versión.
    caches.open(NOMBRE_CACHE).then(function (cache) {
      // Descarga todos los archivos de la lista y los guarda en la caché.
      // Si uno solo falla, la instalación entera falla (no queda a medias).
      return cache.addAll(ARCHIVOS);
    })
  );
});

/* ---------- ACTIVATE: se ejecuta cuando esta versión toma el control ---------- */
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    // Pide el nombre de todas las cachés que hay guardadas.
    caches.keys().then(function (nombres) {
      // Promise.all espera a que terminen todos los borrados.
      return Promise.all(
        nombres
          // Se queda solo con las cachés de la app que NO son la actual.
          .filter(function (nombre) {
            return nombre.startsWith("bar-la-esquina-") && nombre !== NOMBRE_CACHE;
          })
          // Borra cada una de esas cachés viejas.
          .map(function (nombre) {
            return caches.delete(nombre);
          })
      );
    })
  );
});

/* ---------- FETCH: se ejecuta en cada pedido que hace la página ---------- */
self.addEventListener("fetch", function (evento) {
  // Solo se manejan pedidos GET (leer). Los demás se dejan pasar sin tocar.
  if (evento.request.method !== "GET") return;

  // respondWith: nosotros decidimos qué se le responde a la página.
  evento.respondWith(
    // Busca el pedido en la caché.
    caches.match(evento.request).then(function (copiaGuardada) {
      // Si hay copia guardada, se devuelve enseguida (rápido y sin internet).
      if (copiaGuardada) return copiaGuardada;

      // Si no está en la caché, se busca en internet.
      return fetch(evento.request);
    })
  );
});
