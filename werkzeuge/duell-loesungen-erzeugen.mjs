// Erzeugt aus der Quelle des Duell-Fragenpools (werkzeuge/duell-quelle/) und dem PRIVATEN Lösungsschlüssel (06./07.10.2026):
//   1. spiele/duell-fragen.js  -- der Fragenpool für die App: Frage, drei Antworten, Erklärung in allen 18 Sprachen, OHNE die richtige Antwort
//   2. loesungen.sql           -- INSERTs für die Tabelle academy_duell_loesungen (db/duell-2.sql); wird NEBEN den Schlüssel geschrieben,
//                                 nie ins Repo (Standard: /home/user/duell-private/loesungen.sql)
// Die Lösungen stehen nirgends im Repo (es ist öffentlich). Den Schlüssel (JSON-Objekt Frage-ID -> Nummer 0-2) liest das Skript aus DUELL_LOESUNGEN_PFAD
// (Standard /home/user/duell-private/loesungen.json, siehe werkzeuge/duell-schluessel.mjs). Die Edge Function liest die Lösungen aus der Datenbank.
//
// Aufruf:   node werkzeuge/duell-loesungen-erzeugen.mjs            schreibt spiele/duell-fragen.js und loesungen.sql (prüft vorher, dass Schlüssel und Pool zusammenpassen)
//           node werkzeuge/duell-loesungen-erzeugen.mjs --pruefen   schreibt nichts: prüft, dass Schlüssel und Pool zusammenpassen (jede Frage hat genau eine
//                                                                    Lösung 0-2, keine Lösung ohne Frage) und dass duell-fragen.js zur Quelle passt; Exit 1 sonst
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { META, SPRACHEN, KOMMA } from "./duell-quelle/meta.mjs";
import { schluesselLesen, SCHLUESSEL_PFAD, SQL_PFAD } from "./duell-schluessel.mjs";

const hier = dirname(fileURLToPath(import.meta.url));
export const POOL_DATEI = join(hier, "..", "spiele", "duell-fragen.js");

/* Quelle lesen und streng prüfen; liefert { fragen } (ohne Lösung) */
export async function quelleLesen() {
  const fehler = [];
  const texte = {};
  for (const s of SPRACHEN) {
    const datei = join(hier, "duell-quelle", s + ".mjs");
    if (!existsSync(datei)) { fehler.push("Sprachdatei fehlt: " + s + ".mjs"); continue; }
    texte[s] = (await import(pathToFileURL(datei).href)).default;
  }
  const ids = META.map((m) => m.id);
  if (new Set(ids).size !== ids.length) fehler.push("doppelte Frage-ID in meta.mjs");
  const fragen = [];
  for (const m of META) {
    if (!/^q[0-9]{2}$/.test(m.id)) fehler.push(m.id + ": ID muss q + zwei Ziffern sein");
    if ("richtig" in m || "loesung" in m) fehler.push(m.id + ": die Lösung gehört NICHT in meta.mjs (öffentliches Repo), sondern in den privaten Schlüssel");
    if (m.a && (!Array.isArray(m.a) || m.a.length !== 3)) fehler.push(m.id + ": meta.a braucht genau 3 Antworten");
    const t = {};
    for (const s of SPRACHEN) {
      const q = texte[s] && texte[s][m.id];
      if (!q) { fehler.push(s + "/" + m.id + ": fehlt"); continue; }
      const antworten = m.a ? m.a.map((x) => x.split("{,}").join(KOMMA.includes(s) ? "," : ".")) : q.a;
      if (m.a && q.a) fehler.push(s + "/" + m.id + ": hat eigene Antworten, obwohl meta.mjs sie für alle Sprachen festlegt");
      if (!Array.isArray(antworten) || antworten.length !== 3) { fehler.push(s + "/" + m.id + ": braucht genau 3 Antworten"); continue; }
      for (const x of [q.f, q.e, ...antworten]) if (typeof x !== "string" || !x.trim() || x !== x.trim()) fehler.push(s + "/" + m.id + ": leerer Text oder Leerzeichen am Rand");
      if (new Set(antworten).size !== 3) fehler.push(s + "/" + m.id + ": zwei gleiche Antworten");
      t[s] = { f: q.f, a: antworten, e: q.e };
    }
    fragen.push({ id: m.id, bild: m.bild, t });
  }
  for (const s of Object.keys(texte)) for (const id of Object.keys(texte[s])) if (!ids.includes(id)) fehler.push(s + "/" + id + ": unbekannte ID (nicht in meta.mjs)");
  if (fehler.length) throw new Error("Quelle fehlerhaft:\n  " + fehler.join("\n  "));
  return { fragen };
}

/* Passen Schlüssel und Pool zusammen? Liefert eine Liste von Fehlern (leer = alles in Ordnung). */
export function schluesselGegenPool(schluessel, fragen) {
  const fehler = [];
  const poolIds = fragen.map((q) => q.id);
  for (const id of poolIds) if (!Object.prototype.hasOwnProperty.call(schluessel, id)) fehler.push(id + ": im Pool, aber keine Lösung im Schlüssel");
  for (const id of Object.keys(schluessel)) if (!poolIds.includes(id)) fehler.push(id + ": Lösung im Schlüssel, aber keine Frage im Pool (IDs werden nie entfernt: Frage wieder aufnehmen)");
  for (const [id, r] of Object.entries(schluessel)) if (![0, 1, 2].includes(r)) fehler.push(id + ": Lösung muss 0, 1 oder 2 sein");
  return fehler;
}

export function poolText(fragen) {
  const zeilen = fragen.map((q) =>
    "  { id: " + JSON.stringify(q.id) + ", bild: " + JSON.stringify(q.bild) + ", t: {\n" +
    SPRACHEN.map((s) => "    " + s + ": " + JSON.stringify({ f: q.t[s].f, a: q.t[s].a, e: q.t[s].e })).join(",\n") +
    "\n  } }");
  return "/* GENERIERT von werkzeuge/duell-loesungen-erzeugen.mjs aus werkzeuge/duell-quelle/ -- NICHT von Hand ändern (Änderungen in der Quelle machen, dann das Skript laufen lassen).\n" +
    "   Fragenpool für Spiel 10 „Duell gegen Mitschüler“: " + fragen.length + " Fragen, je drei Antworten und eine Erklärung in allen " + SPRACHEN.length + " Sprachen.\n" +
    "   Die richtige Antwort steht bewusst NICHT hier (öffentliches Repo): sie liegt nur in der Datenbank-Tabelle academy_duell_loesungen und wird vom Server erst nach der Auswertung geschickt.\n" +
    "   id      Frage-ID (wie in academy_spiele_duelle.fragen)\n" +
    "   bild    Schlüssel eines amtlichen Verkehrszeichens aus spiele/schilder.js (verkehr/vorfahrt-zeichen/) oder null\n" +
    "   t[sprache]  f = Frage, a = die drei Antworten (Reihenfolge ist fest), e = Erklärung (erst nach der Auswertung zeigen) */\n" +
    "export const FRAGEN = [\n" + zeilen.join(",\n") + "\n];\n" +
    "export const SPRACHEN = " + JSON.stringify(SPRACHEN) + ";\n" +
    "export const FRAGEN_NACH_ID = Object.fromEntries(FRAGEN.map(function (q) { return [q.id, q]; }));\n";
}

/* INSERTs für die Lösungstabelle (nur für die private Datei loesungen.sql; wiederholbar: bei vorhandener ID wird die Lösung überschrieben) */
export function sqlText(schluessel) {
  const ids = Object.keys(schluessel).sort();
  return "-- PRIVAT, NICHT INS REPO. Erzeugt von werkzeuge/duell-loesungen-erzeugen.mjs aus dem Lösungsschlüssel.\n" +
    "-- Füllt public.academy_duell_loesungen (Tabelle: db/duell-2.sql). Wiederholbar.\n" +
    "insert into public.academy_duell_loesungen (frage_id, richtig) values\n" +
    ids.map((id) => "  ('" + id + "', " + schluessel[id] + ")").join(",\n") + "\n" +
    "on conflict (frage_id) do update set richtig = excluded.richtig;\n";
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const pruefen = process.argv.includes("--pruefen");
  let schluessel, fragen;
  try {
    ({ fragen } = await quelleLesen());
    schluessel = schluesselLesen();
  } catch (e) { console.error(e.message); process.exit(2); }
  const fehler = schluesselGegenPool(schluessel, fragen);
  if (fehler.length) { console.error("Schlüssel (" + SCHLUESSEL_PFAD + ") und Pool passen nicht zusammen:\n  " + fehler.join("\n  ")); process.exit(1); }
  const pool = poolText(fragen);
  const poolAlt = existsSync(POOL_DATEI) ? readFileSync(POOL_DATEI, "utf8") : "";
  if (pruefen) {
    if (pool !== poolAlt) { console.error("spiele/duell-fragen.js passt nicht zur Quelle. Bitte node werkzeuge/duell-loesungen-erzeugen.mjs ausführen."); process.exit(1); }
    console.log("ok: " + fragen.length + " Fragen; Schlüssel und Pool passen zusammen (jede Frage genau eine Lösung 0-2, keine überzählige); duell-fragen.js passt zur Quelle");
  } else {
    writeFileSync(POOL_DATEI, pool);
    writeFileSync(SQL_PFAD, sqlText(schluessel), { mode: 0o600 });
    console.log("geschrieben: " + fragen.length + " Fragen -> spiele/duell-fragen.js; Lösungs-SQL -> " + SQL_PFAD + " (privat, nicht ins Repo)");
  }
}
