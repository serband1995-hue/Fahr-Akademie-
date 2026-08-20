// Fahr-Akademie Service Worker
// 1) Macht die App installierbar (PWA-Grundvoraussetzung)
// 2) Empfängt Web-Push-Nachrichten und zeigt sie als Systembenachrichtigung an
// 3) Öffnet beim Antippen der Benachrichtigung den passenden Deep-Link
//
// Stand 20.08.2026: Push-Teil neu ergänzt für die "Neues Video"-Benachrichtigung
// und die Kompass-Push-Brücke. Cache-Teil bewusst minimal gehalten (nur App-Shell),
// damit Video-Inhalte (Bunny Stream) nie versehentlich alt zwischengespeichert werden.

const CACHE_NAME = "fahr-akademie-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Nur die App-Shell aus dem Cache bedienen, alles andere (API-Calls, Videos) geht
// immer live ins Netz -- kein Offline-Zwischenspeichern von Schülerdaten/Videos.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// --- Push-Empfang ---
self.addEventListener("push", (event) => {
  let data = { title: "Fahr-Akademie", body: "Es gibt Neuigkeiten für dich.", url: "./" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      data: { url: data.url || "./" }
    })
  );
});

// --- Klick auf die Benachrichtigung: passendes Fenster fokussieren oder neu öffnen ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
