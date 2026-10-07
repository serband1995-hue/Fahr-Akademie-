// Gemeinsamer Unterbau der Prüfungen von Spiel 9 „Schilder-Wisch“ (Id ninja), 08.10.2026.
// Die Dateien spiele/spiele.js, spiele/texte.js und werkzeuge/edge-functions/academy-spiele.ts kennen das Spiel vielleicht noch nicht
// (der Hauptagent baut es ein). Damit es sich trotzdem wie im fertigen Zustand prüfen lässt, setzt dieser Unterbau die
// Einträge zur Laufzeit ein: beim Browser-Test in die ausgelieferten Dateien, beim Server-Test in eine Kopie der Function.
// Steht der Einbau schon in den echten Dateien, wird NICHTS doppelt eingesetzt (jede Funktion prüft das zuerst).
// Die Textblöcke SERVER_KONSTANTE / SERVER_EINTRAG und SPIELE_EINTRAG sind genau die, die in die echten Dateien gehören.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --- gehört in werkzeuge/edge-functions/academy-spiele.ts: Konstante nach `const istGanz = …` --- */
export const SERVER_KONSTANTE = `// Schilder-Wisch (08.10.2026, Id "ninja"): 3 Runden mit je 9 richtigen und 8 falschen Schildern, je Runde höchstens 25 s. Je richtig gewischtem Schild +10,
// je falsch gewischtem −15 (eine Runde nie unter 0), alle 9 richtigen und kein falsches: +20 Bonus. Höchstens 3 x 110 = 330 Punkte.
// Dieselben Zahlen wie in spiele/ninja.js (RUNDEN, N_RICHTIG, N_FALSCH, PKT_RICHTIG, ABZUG_FALSCH, BONUS_VOLL, MIN_RUNDE_MS); pruefe-ninja.mjs vergleicht sie.
const NINJA = { RUNDEN: 3, N_RICHTIG: 9, N_FALSCH: 8, PKT: 10, ABZUG: 15, BONUS: 20, MIN_RUNDE_MS: 12_000 };`;

/* --- gehört in das Objekt SPIELE von academy-spiele.ts (nach dem letzten Spiel, vor dem schließenden `};`) --- */
export const SERVER_EINTRAG = `  // Schilder-Wisch: Wert = Punkte 0–330; richtig = richtig gewischte Schilder (0–27), falsch = falsch gewischte (0–24), voll = fehlerfreie Runden (0–3).
  // Vorlauf: 3 Runden dauern mindestens je MIN_RUNDE_MS (das letzte Schild erscheint frühestens nach 12 s); das Lesen der Erklärungen kommt dazu.
  ninja: {
    aufsteigend: false, min: 0, max: NINJA.RUNDEN * (NINJA.N_RICHTIG * NINJA.PKT + NINJA.BONUS), vorlauf_ms: NINJA.RUNDEN * NINJA.MIN_RUNDE_MS, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig, f = body.falsch, v = body.voll;
      if (!istGanz(r) || r < 0 || r > NINJA.RUNDEN * NINJA.N_RICHTIG) return "richtig_ungueltig";
      if (!istGanz(f) || f < 0 || f > NINJA.RUNDEN * NINJA.N_FALSCH) return "falsch_ungueltig";
      if (!istGanz(v) || v < 0 || v > NINJA.RUNDEN || v * NINJA.N_RICHTIG > r) return "voll_ungueltig";
      if (v > NINJA.RUNDEN - Math.ceil(f / NINJA.N_FALSCH)) return "voll_passt_nicht";
      if (wert > r * NINJA.PKT + v * NINJA.BONUS) return "punkte_zu_hoch";
      if (wert < r * NINJA.PKT - f * NINJA.ABZUG + v * NINJA.BONUS) return "punkte_zu_niedrig";
      return null;
    },
  },`;

/* --- gehört in das Feld SPIELE von spiele/spiele.js (nach dem letzten Spiel, mit Komma davor) --- */
export const SPIELE_EINTRAG = `  {
    id: "ninja", name: "niName", kurz: "niKurz", einheit: "", bestKey: "niBestwert", nurVorschau: true,
    format: function (w, k) { return w + " " + k.tx("niPunkte"); },
    laden: function () { return import("./ninja.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l6.6 11.3H5.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M2.8 19.6c5.4 1.6 12.2-.2 17-7.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20.4 16.4l-.4-4.4-4.2 1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }`;

export const schonEingebautSpiele = (q) => /id:\s*"ninja"/.test(q);
export const schonEingebautTexte = (q) => /TEXTE_NINJA|texte-ninja/.test(q);
export const schonEingebautServer = (q) => /\n\s*ninja:\s*\{/.test(q);

/* spiele.js / texte.js mit dem Spiel versehen (Text der Datei rein, Text raus); schon eingebaut -> unverändert */
export function spielePatch(quelle) {
  if (schonEingebautSpiele(quelle)) return quelle;
  const ende = quelle.lastIndexOf("\n];");
  if (ende < 0) throw new Error("SPIELE-Ende nicht gefunden");
  return quelle.slice(0, ende) + ",\n" + SPIELE_EINTRAG + quelle.slice(ende);
}
export function textePatch(quelle) {
  if (schonEingebautTexte(quelle)) return quelle;
  return quelle + '\nimport { TEXTE_NINJA } from "./texte-ninja.js";\nfor (const sp of Object.keys(TEXTE_NINJA)) Object.assign(TEXTE[sp], TEXTE_NINJA[sp]);\n';
}

/* Die Function mit dem Eintrag: eigene Kopie der echten Datei, läuft gegen dieselbe Datenbank im Speicher wie spiele-im-speicher.mjs.
   Muss NACH dem Import von spiele-im-speicher.mjs aufgerufen werden (das stellt Deno-Attrappe und Datenbank bereit).
   mutation(text): optionaler absichtlicher Fehler; ist der Eintrag noch nicht eingebaut, wird er auf den Eintrag angewendet, sonst auf die ganze Datei. */
export async function serverMitEintrag(mutation) {
  let quelle = readFileSync(join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts"), "utf8");
  quelle = quelle.replace(/import \{ createClient \} from "[^"]+";/, "const createClient = globalThis.__createClient;");
  if (schonEingebautServer(quelle)) {
    if (mutation) {   // nur der ninja-Block wird verändert (ähnliche Zeilen anderer Spiele bleiben)
      const m = /\n\s*ninja:\s*\{/.exec(quelle);
      const ende = quelle.indexOf("\n  },", m.index) + 5;
      const block = quelle.slice(m.index, ende), neu = mutation(block);
      if (neu === block) throw new Error("Mutation ändert nichts");
      quelle = quelle.slice(0, m.index) + neu + quelle.slice(ende);
    }
  } else {
    const a = "const istGanz = (x: unknown): x is number => typeof x === \"number\" && Number.isInteger(x);";
    if (!quelle.includes(a)) throw new Error("Anker istGanz nicht gefunden");
    quelle = quelle.replace(a, a + "\n" + SERVER_KONSTANTE);
    const b = "\n};\nconst RUNDE_MAX_MS";
    if (!quelle.includes(b)) throw new Error("Anker SPIELE-Ende nicht gefunden");
    quelle = quelle.replace(b, "\n" + (mutation ? mutation(SERVER_EINTRAG) : SERVER_EINTRAG) + b);
  }
  let handler = null;
  const alt = globalThis.Deno;
  globalThis.Deno = { env: { get: () => "x" }, serve: (h) => { handler = h; } };
  const tmp = join(mkdtempSync(join(tmpdir(), "ninja-")), "fn.ts");
  writeFileSync(tmp, quelle);
  await import(tmp + "?" + Math.random());
  globalThis.Deno = alt;
  return async (body) => {
    const res = await handler(new Request("http://x/", { method: "POST", body: JSON.stringify(body) }));
    return { status: res.status, ...(await res.json()) };
  };
}
