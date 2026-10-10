// Fahr-Akademie Service Worker
// 1) Macht die App installierbar (PWA-Grundvoraussetzung)
// 2) Empfängt Web-Push-Nachrichten und zeigt sie als Systembenachrichtigung an
// 3) Öffnet beim Antippen der Benachrichtigung den passenden Deep-Link
//
// WICHTIGE KORREKTUR 24.08.2026:
// Die Vorversion (v1) hat ALLE Anfragen "cache-first" beantwortet -- also immer zuerst
// die gespeicherte Kopie genutzt. Dadurch bekam jedes Gerät, das die App einmal geöffnet
// hatte, dauerhaft die ALTE index.html ausgeliefert, egal wie oft auf GitHub Pages eine
// neue Version hochgeladen wurde. Symptom: Datenbank-Inhalte (Videoanzahl) waren aktuell,
// aber neue Bereiche/Funktionen tauchten nie auf.
//
// Jetzt: HTML/Navigation immer NETWORK-FIRST (frisch aus dem Netz, Cache nur als
// Notfall-Rückfall bei Offline). Nur statische Beiwerk-Dateien (Icons, manifest)
// bleiben cache-first, die ändern sich praktisch nie.
// CACHE_NAME wurde auf v2 erhöht -> der alte, verklebte Cache wird beim Aktivieren gelöscht.

// v3 (26.09.2026): supabase-js liegt jetzt im Repo. Der Dateiname traegt die Version,
// deshalb ist cache-first hier sicher -- eine neue Version bekommt einen neuen Namen.
// v4 (26.09.2026): Logo als eigene kleine Datei (vorher 46 KB im HTML).
// v5 (05.10.2026): GSAP 3.14.2 (Erklärfilm „Vorfahrt“ in „Verkehr verstehen“) liegt in vendor/, Dateiname trägt die Version.
// v6 (06.10.2026): neues Logo (transparentes PNG) + neue App-Icons.
// v7 (07.10.2026): Android-/iPhone-Icons neu: Kachel auf Creme statt randlos beschnitten (kein Block auf dem Startbild, sauberer Ausschnitt im Launcher).
// v23 (10.10.2026): Icons wieder randlos (-v2-Dateinamen), auf Wunsch von Serban: kein Creme-Ring, nur das Logo. Schriften selbst ausgeliefert.
const CACHE_NAME = "fahr-akademie-shell-v25";
const STATIC_ASSETS = [
  "./vendor/supabase-js-2.117.2.min.js",
  "./vendor/gsap-3.14.2.min.js",
  "./logo-264.png",
  "./manifest.json",
  "./icon-192-v2.png",
  "./icon-512-v2.png",
  "./apple-touch-icon.png",
  "./schrift/Barlow-400.ttf",
  "./schrift/Barlow-500.ttf",
  "./schrift/Barlow-600.ttf",
  "./schrift/Barlow-700.ttf",
  "./schrift/GreatVibes-latin.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const istSeitenAufruf =
    event.request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/manifest.json");   // 10.10.2026: das Manifest immer frisch holen, sonst bleibt eine geaenderte App-Kennung (id) im Cache haengen

  if (istSeitenAufruf) {
    // NETWORK-FIRST: immer die aktuelle Version holen, Cache nur wenn offline.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const kopie = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, kopie)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./")))
    );
    return;
  }

  // Statisches Beiwerk: cache-first ist hier unproblematisch.
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
      icon: "./icon-192-v2.png",
      badge: "./icon-192-v2.png",
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
