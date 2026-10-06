// Gemeinsamer Unterbau der Prüfungen von Spiel 8 „Fahrzeug-Check“ (08.10.2026).
// Die Dateien spiele/spiele.js, spiele/texte.js und werkzeuge/edge-functions/academy-spiele.ts kennen das Spiel erst, wenn der
// Hauptagent es einbaut. Damit es sich vorher UND nachher prüfen lässt, setzt dieser Unterbau die Einträge zur Laufzeit ein,
// aber nur, wenn sie noch fehlen (nichts wird doppelt eingesetzt): beim Browser-Test in die ausgelieferten Dateien, beim
// Server-Test in eine Kopie der Function. Sind die Einträge schon in den echten Dateien, wird der echte Eintrag geprüft
// (und für die „Prüfung der Prüfung“ gezielt verändert).
// Die Textblöcke SERVER_KONSTANTE / SERVER_EINTRAG und SPIELE_EINTRAG sind genau die, die in die echten Dateien gehören.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --- gehört in werkzeuge/edge-functions/academy-spiele.ts: Konstante nach `const VORFAHRT = …` (bzw. vor `const istGanz`) --- */
export const SERVER_KONSTANTE = `// Fahrzeug-Check (08.10.2026): 4 Bilder je 4–6 Mängel, je Bild 40 s. Je gefundenem Mangel 100 Punkte, je Tipp ohne Mangel −30 (ein Bild nie unter 0),
// alle Mängel eines Bildes gefunden: bis +80 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Mangel kostet 2 s Zeit, also höchstens 20 je Bild.
// Dieselben Zahlen wie in spiele/fahrzeug.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_MANGEL, ABZUG_TIPP, BONUS_MAX); pruefe-fahrzeug.mjs vergleicht sie.
const FAHRZEUG = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 6, PKT: 100, ABZUG: 30, BONUS_MAX: 80, FEHL_JE_BILD: 20 };`;

/* --- gehört in das Objekt SPIELE von academy-spiele.ts (nach „vorfahrt“ bzw. „gefahren“) --- */
export const SERVER_EINTRAG = `  // Fahrzeug-Check: Wert = Punkte 0–2720; gefunden = Mängel insgesamt (0–24), fehltipps = Tipps ohne Mangel (0–80), vollstaendig = Bilder mit allen Mängeln (0–4).
  fahrzeug: {
    aufsteigend: false, min: 0, max: FAHRZEUG.BILDER * (FAHRZEUG.MAX_JE_BILD * FAHRZEUG.PKT + FAHRZEUG.BONUS_MAX), vorlauf_ms: 8000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > FAHRZEUG.BILDER * FAHRZEUG.MAX_JE_BILD) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > FAHRZEUG.BILDER || v * FAHRZEUG.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > FAHRZEUG.BILDER * FAHRZEUG.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * FAHRZEUG.PKT + v * FAHRZEUG.BONUS_MAX) return "punkte_zu_hoch";
      if (wert < g * FAHRZEUG.PKT - f * FAHRZEUG.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },`;

/* --- gehört in das Feld SPIELE von spiele/spiele.js (nach dem letzten Eintrag, mit Komma davor) --- */
export const SPIELE_EINTRAG = `  {
    id: "fahrzeug", name: "fzName", kurz: "fzKurz", einheit: "", bestKey: "fzBestwert", nurVorschau: true,
    format: function (w, k) { return w + " " + k.tx("fzPunkte"); },
    laden: function () { return import("./fahrzeug.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="3" y="11" width="18" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7.5" cy="14" r="1.2" fill="currentColor"/><circle cx="16.5" cy="14" r="1.2" fill="currentColor"/><path d="M6 17v2.5M18 17v2.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
  }`;

/* spiele.js / texte.js mit dem Spiel versehen (Text der Datei rein, Text raus); schon eingebaut -> unverändert */
export function spielePatch(quelle) {
  if (/id:\s*"fahrzeug"/.test(quelle)) return quelle;
  const ende = quelle.lastIndexOf("\n];");
  if (ende < 0) throw new Error("SPIELE-Ende nicht gefunden");
  return quelle.slice(0, ende) + ",\n" + SPIELE_EINTRAG + quelle.slice(ende);
}
export function textePatch(quelle) {
  if (quelle.includes("texte-fahrzeug.js")) return quelle;
  return quelle + '\nimport { TEXTE_FAHRZEUG } from "./texte-fahrzeug.js";\nfor (const sp of Object.keys(TEXTE_FAHRZEUG)) Object.assign(TEXTE[sp], TEXTE_FAHRZEUG[sp]);\n';
}

/* Quelltext der echten Function (für Prüfungen der Zahlen) */
export function functionQuelle() { return readFileSync(join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts"), "utf8"); }
/* Steht der Eintrag „fahrzeug“ schon in der echten Function? */
export const eingebaut = () => /\n\s*fahrzeug:\s*\{/.test(functionQuelle());
/* Die Konstante FAHRZEUG: aus der echten Function, wenn schon eingebaut, sonst der Vorschlag */
export const konstanteText = () => { const m = functionQuelle().match(/const FAHRZEUG = \{[^}]*\};?/); return eingebaut() && m ? m[0] : SERVER_KONSTANTE; };
/* Der Eintrag: aus der echten Function, wenn schon eingebaut, sonst der Vorschlag */
export function eintragText() {
  const q = functionQuelle();
  const a = q.search(/\n\s*fahrzeug:\s*\{/);
  if (a < 0) return SERVER_EINTRAG;
  const b = q.indexOf("\n  },", a);
  return q.slice(a + 1, b + 5);
}

/* Die Function mit dem Eintrag: eigene Kopie der echten Datei, läuft gegen dieselbe Datenbank im Speicher wie spiele-im-speicher.mjs.
   Muss NACH dem Import von spiele-im-speicher.mjs aufgerufen werden (das stellt Deno-Attrappe und Datenbank bereit).
   mutation(text) -> veränderter Eintrag (Prüfung der Prüfung); wirkungslose Mutation wirft "MUTATION_WIRKUNGSLOS". */
export async function serverMitEintrag(mutation) {
  let quelle = functionQuelle();
  quelle = quelle.replace(/import \{ createClient \} from "[^"]+";/, "const createClient = globalThis.__createClient;");
  const schon = eingebaut();
  if (!schon) {
    const a = "const istGanz = (x: unknown): x is number => typeof x === \"number\" && Number.isInteger(x);";
    if (!quelle.includes(a)) throw new Error("Anker istGanz nicht gefunden");
    quelle = quelle.replace(a, a + "\n" + SERVER_KONSTANTE);
    const b = "\n};\nconst RUNDE_MAX_MS";
    if (!quelle.includes(b)) throw new Error("Anker SPIELE-Ende nicht gefunden");
    const eintrag = mutation ? mutation(SERVER_EINTRAG) : SERVER_EINTRAG;
    if (mutation && eintrag === SERVER_EINTRAG) throw new Error("MUTATION_WIRKUNGSLOS");
    quelle = quelle.replace(b, "\n" + eintrag + b);
  } else if (mutation) {
    const a = quelle.search(/\n\s*fahrzeug:\s*\{/);
    const e = quelle.indexOf("\n  },", a) + 5;
    const alt = quelle.slice(a, e), neu = mutation(alt);
    if (neu === alt) throw new Error("MUTATION_WIRKUNGSLOS");
    quelle = quelle.slice(0, a) + neu + quelle.slice(e);
  }
  let handler = null;
  const altDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: () => "x" }, serve: (h) => { handler = h; } };
  const tmp = join(mkdtempSync(join(tmpdir(), "fahrzeug-")), "fn.ts");
  writeFileSync(tmp, quelle);
  await import(tmp + "?" + Math.random());
  globalThis.Deno = altDeno;
  return async (body) => {
    const res = await handler(new Request("http://x/", { method: "POST", body: JSON.stringify(body) }));
    return { status: res.status, ...(await res.json()) };
  };
}
