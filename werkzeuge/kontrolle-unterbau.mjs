// Unterbau für die Prüfungen von Spiel 6 „Verkehrskontrolle“ (07.10.2026).
// Die Integration (spiele/spiele.js, spiele/texte.js, academy-spiele.ts) macht der Hauptagent. Damit das Spiel schon VORHER
// geprüft werden kann, setzt dieser Unterbau die drei Teile zur Laufzeit ein (nur im Speicher bzw. beim Ausliefern der Dateien,
// nichts davon wird auf die Platte geschrieben). Steht ein Teil schon in der echten Datei, wird er NICHT doppelt eingesetzt.
// Die Texte unten sind genau die, die in die echten Dateien gehören.
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const hier = dirname(fileURLToPath(import.meta.url));
export const wurzel = join(hier, "..");

/* --- 1. Server: academy-spiele.ts (Konstante vor `const istGanz`, Eintrag im Objekt SPIELE vor „vorfahrt“) --- */
export const SERVER_KONSTANTE =
`// Verkehrskontrolle (07.10.2026): 8 Fahrzeuge, je 5 Entscheidungen (4 Stationen + Gesamtentscheidung), je richtige Entscheidung 20 bis 30 Punkte
// (siehe punkteFuer in spiele/kontrolle.js); falscher Alarm zieht ab, je Fahrzeug nie unter 0.
const KONTROLLE = { ENTSCHEIDUNGEN: 40, MAX_JE_ENTSCHEIDUNG: 30 };
`;
export const SERVER_EINTRAG =
`  // Verkehrskontrolle: Wert = Punkte 0–1200; richtig = Anzahl richtiger Entscheidungen (0–40), höchstens 30 Punkte je richtiger Entscheidung.
  // Vorlauf 30 s: 8 Fahrzeuge brauchen mindestens 72 Fingertipps (je Fahrzeug 4 Stationen antippen + 4 Urteile + 1 Gesamturteil).
  kontrolle: {
    aufsteigend: false, min: 0, max: KONTROLLE.ENTSCHEIDUNGEN * KONTROLLE.MAX_JE_ENTSCHEIDUNG, vorlauf_ms: 30_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > KONTROLLE.ENTSCHEIDUNGEN) return "richtig_ungueltig";
      if (wert > r * KONTROLLE.MAX_JE_ENTSCHEIDUNG) return "punkte_passen_nicht";
      return null;
    },
  },
`;
export function serverQuelle(text) {
  if (/^\s*kontrolle:\s*\{/m.test(text)) return text;     // schon eingebaut
  let t = text.replace("const istGanz =", SERVER_KONSTANTE + "const istGanz =");
  t = t.replace(/^(\s*)\/\/ Rechts vor Links: Wert = Punkte/m, SERVER_EINTRAG + "$1// Rechts vor Links: Wert = Punkte");
  if (!/^\s*kontrolle:\s*\{/m.test(t) || !t.includes("const KONTROLLE")) throw new Error("Einbaustelle in academy-spiele.ts nicht gefunden");
  return t;
}
/* Muss VOR dem Laden von spiele-im-speicher.mjs aufgerufen werden: dann liest dieses die Function MIT dem Eintrag. */
export function serverEinsetzen() {
  const echt = fs.readFileSync;
  fs.readFileSync = function (pfad, ...rest) {
    const r = echt.call(this, pfad, ...rest);
    if (typeof pfad === "string" && pfad.endsWith("academy-spiele.ts") && typeof r === "string") return serverQuelle(r);
    return r;
  };
  syncBuiltinESMExports();
  return function zurueck() { fs.readFileSync = echt; syncBuiltinESMExports(); };
}

/* --- 2. Spiele-Liste: Eintrag in SPIELE in spiele/spiele.js (am Ende der Liste) --- */
export const SPIELE_JS_EINTRAG =
`  {
    id: "kontrolle", name: "koName", kurz: "koKurz", einheit: "", bestKey: "koBestwert", nurVorschau: true,
    format: function (w, k) { return w + " " + k.tx("koPunkte"); },
    laden: function () { return import("./kontrolle.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15.5l1.6-4.6A2 2 0 0 1 6.5 9.5h7a2 2 0 0 1 1.9 1.4l1.6 4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="2.5" y="15" width="15" height="4" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6.5" cy="19.5" r="1.4" fill="currentColor"/><circle cx="13.5" cy="19.5" r="1.4" fill="currentColor"/><circle cx="20" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 8.5v6M20 10.5l-2.5 2M20 14.5l-1.5 3.5M20 14.5l1.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  }`;
export function spieleJsQuelle(text) {
  if (/id:\s*"kontrolle"/.test(text)) return text;
  const t = text.replace(/\n\];\n/, ",\n" + SPIELE_JS_EINTRAG + "\n];\n");
  if (!/id:\s*"kontrolle"/.test(t)) throw new Error("Einbaustelle in spiele.js nicht gefunden");
  return t;
}

/* --- 3. Texte: spiele/texte.js bekommt am Ende die Texte des Spiels dazugemischt --- */
export const TEXTE_ANHANG =
`
import { TEXTE_KONTROLLE } from "./texte-kontrolle.js";
Object.keys(TEXTE_KONTROLLE).forEach(function (l) { Object.assign(TEXTE[l], TEXTE_KONTROLLE[l]); });
`;
export function texteQuelle(text) {
  if (text.includes("texte-kontrolle.js")) return text;
  return text + TEXTE_ANHANG;
}
