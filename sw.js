// Minimaler Service Worker für Fahr-Akademie
// Zweck: erfüllt die technische Voraussetzung, damit Android das Icon beim
// "Zum Startbildschirm hinzufügen" korrekt aus der manifest.json übernimmt
// (Installierbarkeits-Kriterium), und die App im eigenen Fenster ohne
// Browser-Adressleiste öffnet (display: standalone).
//
// Bewusst ohne Offline-Cache: Fahr-Akademie braucht ohnehin eine
// Internetverbindung (Supabase, Bunny Stream), Offline-Nutzung wäre eh
// nicht möglich. Dieser Service Worker leitet daher nur alle Anfragen
// direkt ans Netz weiter, ohne etwas zwischenzuspeichern.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
