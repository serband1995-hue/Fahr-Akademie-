// Einbau von Spiel 10 „Duell gegen Mitschüler“ in die bestehenden Dateien (06.10.2026). Nur die zwei kleinen Änderungen, die nicht im Spiel selbst liegen:
//   1. spiele/spiele.js : Eintrag { id: "duell", … } am Ende von SPIELE (Karte auf der Startseite der Spiele)
//   2. spiele/texte.js  : die Texte aus spiele/texte-duell.js in TEXTE einmischen (damit k.tx("duName") die Karte findet)
// Die Browser-Prüfung (werkzeuge/pruefe-duell-im-browser.mjs) wendet genau diese Änderungen im Speicher an; die Dateien bleiben unberührt.
//
//   node werkzeuge/duell-einbau.mjs --anwenden    schreibt die beiden Änderungen in spiele/spiele.js und spiele/texte.js (macht nichts, wenn schon eingebaut)
//   node werkzeuge/duell-einbau.mjs --pruefen     meldet nur, ob sie schon eingebaut sind
// Freigabe für alle Schüler: in dem Eintrag nurVorschau: true -> false (eigener kleiner Schritt nach Serbans „ok“).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

export const EINTRAG = `{
    id: "duell", name: "duName", kurz: "duKurz", einheit: "", bestKey: "duSiege", nurVorschau: true,   // zählt Siege/Unentschieden/Niederlagen im Spiel selbst, kein Bestwert im Ranking
    laden: function () { return import("./duell.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="7.5" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.8 18.5c0-3.2 2.1-5.3 4.7-5.3s4.7 2.1 4.7 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.5" cy="7.5" r="2.7" fill="currentColor" opacity=".35" stroke="currentColor" stroke-width="1.8"/><path d="M11.8 18.5c0-3.2 2.1-5.3 4.7-5.3s4.7 2.1 4.7 5.3" fill="currentColor" opacity=".35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  }`;

export function spielePatchen(text) {
  if (text.includes('id: "duell"')) return text;
  const start = text.indexOf("export const SPIELE = [");
  const ende = start < 0 ? -1 : text.indexOf("\n];", start);
  if (ende < 0) throw new Error("SPIELE-Liste in spiele.js nicht gefunden");
  return text.slice(0, ende) + ",\n  " + EINTRAG + text.slice(ende);
}

export function textePatchen(text) {
  if (text.includes("texte-duell.js")) return text;
  const a = text.indexOf("export const RTL");
  const b = text.indexOf("/* Text holen:");
  if (a < 0 || b < 0) throw new Error("Einbaustellen in texte.js nicht gefunden");
  const mischen = "/* Texte von Spiel 10 (Duell gegen Mitschüler) einmischen: spiele/texte-duell.js */\n" +
    "Object.keys(TEXTE_DUELL).forEach(function (l) { if (TEXTE[l]) Object.assign(TEXTE[l], TEXTE_DUELL[l]); });\n\n";
  return text.slice(0, a) + 'import { TEXTE_DUELL } from "./texte-duell.js";\n\n' + text.slice(a, b) + mischen + text.slice(b);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const dateien = [["spiele/spiele.js", spielePatchen], ["spiele/texte.js", textePatchen]];
  for (const [rel, f] of dateien) {
    const pfad = join(wurzel, rel), alt = readFileSync(pfad, "utf8"), neu = f(alt);
    if (neu === alt) { console.log(rel + ": schon eingebaut"); continue; }
    if (process.argv.includes("--anwenden")) { writeFileSync(pfad, neu); console.log(rel + ": eingebaut"); } else console.log(rel + ": noch NICHT eingebaut (mit --anwenden einbauen)");
  }
}
