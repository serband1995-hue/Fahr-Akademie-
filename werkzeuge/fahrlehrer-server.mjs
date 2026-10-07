// Unterbau für die Prüfungen des Fahrlehrer-Simulators (Spiel 5): lädt die ECHTE Function academy-spiele.ts gegen die Datenbank
// im Speicher -- und trägt den Eintrag „fahrlehrer“ dazu ein, solange er noch nicht in der Datei steht (der Hauptagent baut ihn
// beim Einbau ein; danach ist das hier ein Durchlauf ohne Änderung). So lässt sich der Eintrag prüfen, ohne die Function-Datei anzufassen.
// Die Kopie von spiele-im-speicher.mjs + academy-spiele.ts liegt in einem Temp-Ordner; im Repo ändert sich nichts.
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));

/* Der Eintrag, wie er in werkzeuge/edge-functions/academy-spiele.ts stehen soll */
export const SERVER_KONSTANTE = `// Fahrlehrer-Simulator (07.10.2026): 8 Runden mit je 2 Fragen = 16 Teilantworten, je richtige 50 bis 75 Punkte (siehe punkteFuer in spiele/fahrlehrer.js).
const FAHRLEHRER = { TEILE: 16, MIN_PUNKTE: 50, MAX_PUNKTE: 75 };
`;
export const SERVER_EINTRAG = `  // Fahrlehrer-Simulator: Wert = Punkte 0–1200; richtig = Anzahl richtiger Teilantworten (0–16), je richtige 50–75 Punkte.
  fahrlehrer: {
    aufsteigend: false, min: 0, max: FAHRLEHRER.TEILE * FAHRLEHRER.MAX_PUNKTE, vorlauf_ms: 15_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > FAHRLEHRER.TEILE) return "richtig_ungueltig";
      if (wert < r * FAHRLEHRER.MIN_PUNKTE || wert > r * FAHRLEHRER.MAX_PUNKTE) return "punkte_passen_nicht";
      return null;
    },
  },
`;

/* Liefert { db, rufe, warte, jetzt } der Function mit Eintrag „fahrlehrer“ */
export async function ladeServer() {
  let quelle = readFileSync(join(hier, "edge-functions", "academy-spiele.ts"), "utf8");
  if (/^\s*fahrlehrer:\s*\{/m.test(quelle)) {          // schon fest eingebaut: die echte Function und die echte Datenbank im Speicher verwenden
    const m = await import(pathToFileURL(join(hier, "edge-functions", "spiele-im-speicher.mjs")).href);
    return { db: m.db, rufe: m.rufe, warte: m.warte, jetzt: m.jetzt, quelle: quelle };
  }
  const dir = mkdtempSync(join(tmpdir(), "fahrlehrer-server-"));
  if (!/^\s*fahrlehrer:\s*\{/m.test(quelle)) {
    const a = quelle.indexOf("const istGanz");
    const b = quelle.indexOf("};\nconst RUNDE_MAX_MS");
    if (a < 0 || b < 0) throw new Error("academy-spiele.ts hat eine unerwartete Form (istGanz / RUNDE_MAX_MS nicht gefunden)");
    quelle = quelle.slice(0, a) + SERVER_KONSTANTE + quelle.slice(a, b) + SERVER_EINTRAG + quelle.slice(b);
  }
  writeFileSync(join(dir, "academy-spiele.ts"), quelle);
  copyFileSync(join(hier, "edge-functions", "spiele-im-speicher.mjs"), join(dir, "spiele-im-speicher.mjs"));
  const m = await import(pathToFileURL(join(dir, "spiele-im-speicher.mjs")).href);
  return { db: m.db, rufe: m.rufe, warte: m.warte, jetzt: m.jetzt, quelle: quelle };
}

/* ---- Einbau für die Browser-Prüfung (ohne die Dateien im Repo zu ändern) ---- */
/* Der Eintrag, wie er in SPIELE in spiele/spiele.js stehen soll */
export const SPIELE_JS_EINTRAG = `,
  {
    id: "fahrlehrer", name: "flName", kurz: "flKurz", einheit: "", bestKey: "flBestwert", nurVorschau: true,
    format: function (w, k) { return w + " " + k.tx("flPunkte"); },
    laden: function () { return import("./fahrlehrer.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M3.8 11h5.9M14.3 11h5.9M12 14.2v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  }`;
/* spiele.js: Eintrag vor dem Ende von SPIELE einfügen, falls er noch fehlt */
export function spieleJsMitFahrlehrer(quelle) {
  if (/id:\s*"fahrlehrer"/.test(quelle)) return quelle;
  const ende = quelle.indexOf("\n];\n\n/* Wer ein Spiel sehen");
  if (ende < 0) throw new Error("spiele.js hat eine unerwartete Form (Ende von SPIELE nicht gefunden)");
  return quelle.slice(0, ende) + SPIELE_JS_EINTRAG + quelle.slice(ende);
}
/* texte.js: Fahrlehrer-Texte je Sprache zusammenführen, falls sie noch fehlen */
export function texteJsMitFahrlehrer(quelle) {
  if (/flName:/.test(quelle)) return quelle;
  return quelle + '\nimport { TEXTE_FAHRLEHRER as __FL } from "./texte-fahrlehrer.js";\nfor (const __s of Object.keys(__FL)) Object.assign(TEXTE[__s], __FL[__s]);\n';
}
