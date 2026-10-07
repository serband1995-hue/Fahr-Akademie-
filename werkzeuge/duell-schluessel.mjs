// Der PRIVATE Lösungsschlüssel von Spiel 10 „Duell gegen Mitschüler“ (Frage-ID -> Nummer der richtigen Antwort 0-2).
// Das Repo ist öffentlich (GitHub Pages): der Schlüssel steht deshalb NICHT im Repo, sondern in einer Datei außerhalb davon:
//   Standard  /home/user/duell-private/loesungen.json     (anderer Ort: Umgebungsvariable DUELL_LOESUNGEN_PFAD)
//   Inhalt    JSON-Objekt: je Frage-ID (q01, q02, ...) die Nummer der richtigen Antwort 0, 1 oder 2
// Im Betrieb liegen die Lösungen in der Datenbank-Tabelle academy_duell_loesungen (db/duell-2.sql); die Datei dient dazu, die Tabelle
// zu füllen (werkzeuge/duell-loesungen-erzeugen.mjs schreibt loesungen.sql daneben) und die Prüfungen gegen die Datenbank im Speicher laufen zu lassen.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const STANDARD_PFAD = "/home/user/duell-private/loesungen.json";
export const SCHLUESSEL_PFAD = process.env.DUELL_LOESUNGEN_PFAD || STANDARD_PFAD;
export const SQL_PFAD = join(dirname(SCHLUESSEL_PFAD), "loesungen.sql");

/* liest und prüft den Schlüssel; wirft Error mit klarer Meldung, wenn die Datei fehlt oder kaputt ist */
export function schluesselLesen(pfad = SCHLUESSEL_PFAD) {
  if (!existsSync(pfad)) {
    throw new Error("Lösungsschlüssel fehlt: " + pfad + " existiert nicht. Die Lösungen von Spiel 10 sind privat und liegen nicht im Repo " +
      "(siehe docs/PROJEKTGEDAECHTNIS.md, Abschnitt Spiele). Datei bereitstellen oder DUELL_LOESUNGEN_PFAD setzen.");
  }
  let roh;
  try { roh = JSON.parse(readFileSync(pfad, "utf8")); } catch (e) { throw new Error("Lösungsschlüssel unlesbar (" + pfad + "): kein gültiges JSON"); }
  if (typeof roh !== "object" || roh === null || Array.isArray(roh)) throw new Error("Lösungsschlüssel " + pfad + ": erwartet ein Objekt { \"q01\": 0-2, ... }");
  const fehler = [];
  for (const [id, r] of Object.entries(roh)) {
    if (!/^q[0-9]{2,3}$/.test(id)) fehler.push(id + ": ungültige Frage-ID");
    if (![0, 1, 2].includes(r)) fehler.push(id + ": Lösung muss 0, 1 oder 2 sein");
  }
  if (!Object.keys(roh).length) fehler.push("leer");
  if (fehler.length) throw new Error("Lösungsschlüssel " + pfad + " fehlerhaft:\n  " + fehler.join("\n  "));
  return roh;
}

/* wie schluesselLesen, wirft aber nie: { schluessel, fehler } (genau eines von beiden ist null) */
export function schluesselOderFehler(pfad = SCHLUESSEL_PFAD) {
  try { return { schluessel: schluesselLesen(pfad), fehler: null }; } catch (e) { return { schluessel: null, fehler: e.message }; }
}
