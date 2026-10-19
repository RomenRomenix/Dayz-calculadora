"use strict";

const CACHE_NAME = "dayz-calculadora-v2";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("dayz-calculadora-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const solicitud = event.request;

  if (solicitud.method !== "GET") return;

  const url = new URL(solicitud.url);

  if (url.origin !== self.location.origin) return;

  // Para la página principal, comprobar primero la versión publicada.
  if (solicitud.mode === "navigate") {
    event.respondWith(
      fetch(solicitud)
        .then(respuesta => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put("./index.html", copia));
          }
          return respuesta;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Para imágenes y otros archivos, utilizar la caché si están disponibles.
  event.respondWith(
    caches.match(solicitud)
      .then(cached => cached || fetch(solicitud))
      .catch(() => caches.match("./index.html"))
  );
});
