/* Verkehrszeichen der Mini-Spiele (07.10.2026).
   ALLE Zeichen sind die amtlichen Bilder (Wikimedia Commons, Vektorgrafiken der Verkehrszeichen der StVO, gemeinfrei),
   abgelegt in verkehr/vorfahrt-zeichen/ -- Herkunft und Dateinamen: verkehr/vorfahrt-zeichen/QUELLEN.md.
   Nichts hier ist nachgezeichnet. Die Bilder werden als <img> eingebunden (dasselbe Zeichen kann mehrfach auf einer Seite stehen).
   schildBild(id, opt) -> HTML-String; opt = { beschriftung } (Text für Screenreader; leer = nur Dekoration) */

const DATEI = {
  z205: "z205.svg",          // Vorfahrt gewähren
  z206: "z206.svg",          // Halt! Vorfahrt gewähren
  z306: "z306.svg",          // Vorfahrtstraße
  z274: "z274-50.svg",       // Zulässige Höchstgeschwindigkeit (hier 50; andere Zahlen: zeichen274)
  z2741: "z2741.svg",        // Beginn einer Tempo-30-Zone
  z267: "z267.svg",          // Verbot der Einfahrt
  z283: "z283.svg",          // Absolutes Haltverbot
  z286: "z286.svg",          // Eingeschränktes Haltverbot
  z250: "z250.svg",          // Verbot für Fahrzeuge aller Art
  z220: "z220.svg",          // Einbahnstraße (rechtsweisend)
  z101: "z101.svg",          // Gefahrstelle
  z237: "z237.svg",          // Radweg (Sonderweg Radfahrer)
  z350: "z350.svg",          // Fußgängerüberweg
  z215: "z215.svg",          // Kreisverkehr
  z282: "z282.svg"           // Ende sämtlicher Streckenverbote
};
/* Zeichen 274 gibt es für jede Zahl als eigenes amtliches Bild; der Tempo-Sprint braucht diese */
export const TEMPO_ZAHLEN = [50, 60, 80, 100, 120];

const BILD = (name) => new URL("../verkehr/vorfahrt-zeichen/" + name, import.meta.url).href;
function img(name, beschriftung) {
  return '<img src="' + BILD(name) + '" alt="' + (beschriftung || "") + '" draggable="false" decoding="async">';
}

/* Zeichen 274 mit Zahl (nur die Zahlen aus TEMPO_ZAHLEN) */
export function zeichen274(v, beschriftung) {
  if (TEMPO_ZAHLEN.indexOf(v) === -1) throw new Error("kein Bild für Zeichen 274-" + v);
  return img("z274-" + v + ".svg", beschriftung);
}
/* Zeichen 282: Ende sämtlicher Streckenverbote */
export function zeichen282(beschriftung) { return img(DATEI.z282, beschriftung); }

export function schildBild(id, opt) {
  const name = DATEI[id];
  if (!name) return "";
  return img(name, (opt && opt.beschriftung) || "");
}
export const SCHILD_IDS = Object.keys(DATEI);
/* Alle Dateinamen (für Prüfungen und zum Vorladen) */
export const SCHILD_DATEIEN = Object.keys(DATEI).map((k) => DATEI[k]).concat(TEMPO_ZAHLEN.map((v) => "z274-" + v + ".svg"))
  .filter((n, i, a) => a.indexOf(n) === i);
/* Bilder schon beim Spielstart laden, damit beim Schildwechsel nichts nachlädt/flackert */
export function schilderVorladen(namen) {
  (namen || SCHILD_DATEIEN).forEach(function (n) { try { const i = new Image(); i.src = BILD(n); } catch (e) {} });
}
