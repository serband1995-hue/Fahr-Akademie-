// Gemeinsamer Unterbau der Prüfungen von Spiel 7 „Gefahren finden“ (07.10.2026).
// Die Dateien spiele/spiele.js, spiele/texte.js und werkzeuge/edge-functions/academy-spiele.ts kennen das Spiel noch nicht
// (der Hauptagent baut es ein). Damit es sich trotzdem wie im fertigen Zustand prüfen lässt, setzt dieser Unterbau die
// Einträge zur Laufzeit ein: beim Browser-Test in die ausgelieferten Dateien, beim Server-Test in eine Kopie der Function.
// Die zwei Textblöcke SERVER_KONSTANTE / SERVER_EINTRAG und SPIELE_EINTRAG sind genau die, die in die echten Dateien gehören.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --- gehört in werkzeuge/edge-functions/academy-spiele.ts: Konstante nach `const VORFAHRT = …` --- */
export const SERVER_KONSTANTE = `// Gefahren finden (07.10.2026): 4 Bilder je 4–6 Gefahren, je Bild 30 s. Je gefundener Gefahr 100 Punkte, je Tipp ohne Gefahr −30 (ein Bild nie unter 0),
// alle Gefahren eines Bildes gefunden: bis +60 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Gefahr kostet 2 s Zeit, also höchstens 15 je Bild.
// Dieselben Zahlen wie in spiele/gefahren.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_GEFAHR, ABZUG_TIPP, BONUS_MAX); pruefe-gefahren.mjs vergleicht sie.
const GEFAHREN = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 6, PKT: 100, ABZUG: 30, BONUS_MAX: 60, FEHL_JE_BILD: 15 };`;

/* --- gehört in das Objekt SPIELE von academy-spiele.ts (nach „vorfahrt“) --- */
export const SERVER_EINTRAG = `  // Gefahren finden: Wert = Punkte 0–2640; gefunden = Gefahren insgesamt (0–24), fehltipps = Tipps ohne Gefahr (0–60), vollstaendig = Bilder mit allen Gefahren (0–4).
  gefahren: {
    aufsteigend: false, min: 0, max: GEFAHREN.BILDER * (GEFAHREN.MAX_JE_BILD * GEFAHREN.PKT + GEFAHREN.BONUS_MAX), vorlauf_ms: 8000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > GEFAHREN.BILDER * GEFAHREN.MAX_JE_BILD) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > GEFAHREN.BILDER || v * GEFAHREN.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > GEFAHREN.BILDER * GEFAHREN.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * GEFAHREN.PKT + v * GEFAHREN.BONUS_MAX) return "punkte_zu_hoch";
      if (wert < g * GEFAHREN.PKT - f * GEFAHREN.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },`;

/* --- gehört in das Feld SPIELE von spiele/spiele.js (nach „vorfahrt“, mit Komma davor) --- */
export const SPIELE_EINTRAG = `  {
    id: "gefahren", name: "geName", kurz: "geKurz", einheit: "", bestKey: "geBestwert", nurVorschau: true,
    format: function (w, k) { return w + " " + k.tx("gePunkte"); },
    laden: function () { return import("./gefahren.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.6 15.6L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M10.5 7.6v3.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="10.5" cy="13.7" r="1.1" fill="currentColor"/></svg>'
  }`;

/* spiele.js / texte.js mit dem Spiel versehen (Text der Datei rein, Text raus) */
export function spielePatch(quelle) {
  const ende = quelle.lastIndexOf("\n];");
  if (ende < 0) throw new Error("SPIELE-Ende nicht gefunden");
  return quelle.slice(0, ende) + ",\n" + SPIELE_EINTRAG + quelle.slice(ende);
}
export function textePatch(quelle) {
  return quelle + '\nimport { TEXTE_GEFAHREN } from "./texte-gefahren.js";\nfor (const sp of Object.keys(TEXTE_GEFAHREN)) Object.assign(TEXTE[sp], TEXTE_GEFAHREN[sp]);\n';
}

/* Die Function mit dem Eintrag: eigene Kopie der echten Datei, läuft gegen dieselbe Datenbank im Speicher wie spiele-im-speicher.mjs.
   Muss NACH dem Import von spiele-im-speicher.mjs aufgerufen werden (das stellt Deno-Attrappe und Datenbank bereit). */
export async function serverMitEintrag(mutation) {
  let quelle = readFileSync(join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts"), "utf8");
  quelle = quelle.replace(/import \{ createClient \} from "[^"]+";/, "const createClient = globalThis.__createClient;");
  const a = "const istGanz = (x: unknown): x is number => typeof x === \"number\" && Number.isInteger(x);";
  if (!quelle.includes(a)) throw new Error("Anker istGanz nicht gefunden");
  quelle = quelle.replace(a, a + "\n" + SERVER_KONSTANTE);
  const b = "\n};\nconst RUNDE_MAX_MS";
  if (!quelle.includes(b)) throw new Error("Anker SPIELE-Ende nicht gefunden");
  quelle = quelle.replace(b, "\n" + (mutation ? mutation(SERVER_EINTRAG) : SERVER_EINTRAG) + b);
  let handler = null;
  const alt = globalThis.Deno;
  globalThis.Deno = { env: { get: () => "x" }, serve: (h) => { handler = h; } };
  const tmp = join(mkdtempSync(join(tmpdir(), "gefahren-")), "fn.ts");
  writeFileSync(tmp, quelle);
  await import(tmp + "?" + Math.random());
  globalThis.Deno = alt;
  return async (body) => {
    const res = await handler(new Request("http://x/", { method: "POST", body: JSON.stringify(body) }));
    return { status: res.status, ...(await res.json()) };
  };
}
