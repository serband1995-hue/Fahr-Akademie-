// Mutationstest für Spiel 10 (06./07.10.2026): baut absichtlich Fehler in eine Kopie der Edge Function ein und prüft, dass werkzeuge/pruefe-duell.mjs anschlägt.
// Überlebt eine Mutation (Prüfung bleibt grün), fehlt der Prüfung ein Fall.
// Braucht den PRIVATEN Lösungsschlüssel (werkzeuge/duell-schluessel.mjs); ohne ihn bricht der Test mit klarer Meldung ab (ohne Schlüssel wäre jede Mutation „gefangen“, weil die Prüfung ohnehin scheitert).
// Aufruf:  node --experimental-strip-types werkzeuge/mutationstest-duell.mjs
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { schluesselOderFehler } from "./duell-schluessel.mjs";

const hier = dirname(fileURLToPath(import.meta.url));
const { fehler: schluesselFehler } = schluesselOderFehler();
if (schluesselFehler) { console.error("Mutationstest abgelehnt: " + schluesselFehler); process.exit(2); }
const original = readFileSync(join(hier, "edge-functions/academy-spiele.ts"), "utf8");
// [Name, Stelle, Ersatz, gleichwertig?]  (gleichwertig = die Mutation ändert das Verhalten nicht, darf überleben)
const M = [
  ["Selbst-Duell erlaubt", 'if (d.ersteller === ich) return nein("eigenes_duell", 400);', ""],
  ["Annahme nicht atomar (.is gegner null fehlt)", '.eq("id", id).eq("status", "offen").is("gegner", null).neq("ersteller", ich)', '.eq("id", id).neq("ersteller", ich)'],
  ["Nicht-Beteiligte erfahren „vergeben“ statt „gibt es nicht“", 'return d.gegner === ich ? nein("duell_vergeben", 409) : nein("duell_unbekannt", 404);', 'return nein("duell_vergeben", 409);'],
  ["Limit um eins zu hoch (neu)", "if (lauf >= DUELL.MAX_LAUFEND) return nein(\"duell_zu_viele\", 409);\n    // Fragen-IDs", "if (lauf > DUELL.MAX_LAUFEND) return nein(\"duell_zu_viele\", 409);\n    // Fragen-IDs", true],   // gleichwertig: die Zählung nach dem Anlegen fängt es
  ["Verfall nicht beachtet (verfallen() immer false)", "const verfallen = (d: { erstellt_am: string; status: string }) => d.status !== \"fertig\" &&", "const verfallen = (d: { erstellt_am: string; status: string }) => false &&"],
  ["Verfall zählt auch für eine schon laufende Runde (N6)", 'if (verfallen(d) && !laeuft) return nein("duell_verfallen", 410);', 'if (verfallen(d)) return nein("duell_verfallen", 410);'],
  ["Start nicht atomar (Startzeit wird überschrieben)", '.eq("id", id).eq(seite, ich).is(seite + "_gestartet_am", null).gt("erstellt_am", verfallGrenze())', '.eq("id", id).eq(seite, ich).gt("erstellt_am", verfallGrenze())'],
  ["Weiterspielen stellt die Uhr neu", 'if (d[seite + "_gestartet_am"]) return await weiter(d[seite + "_gestartet_am"], d.fragen);', 'if (d[seite + "_gestartet_am"]) { await supa.from(T).update({ [seite + "_gestartet_am"]: jetztIso() }).eq("id", id); return await weiter(jetztIso(), d.fragen); }'],
  ["Weiterspielen läuft nie ab", "if (Date.now() - new Date(gestartetAm).getTime() > DUELL.RUNDE_MAX_MS) {", "if (false) {"],
  ["Start nach der Abgabe erlaubt (Weiterspielen ohne Fertig-Prüfung)", 'if (d[seite + "_fertig_am"]) return nein("duell_schon_gespielt", 409);\n      // Runde offen', "// Runde offen"],
  ["Weiterspielen verrät die Lösung", "return json({ ok: true, duell: id, fragen, limit_ms: DUELL.LIMIT_MS, fortgesetzt: true });", "return json({ ok: true, duell: id, fragen, limit_ms: DUELL.LIMIT_MS, fortgesetzt: true, loesung: [0] });"],
  ["zweite Abgabe erlaubt", 'if (d[seite + "_fertig_am"]) return nein("duell_schon_gespielt", 409);\n    const vergangen', "const vergangen"],
  ["Abgabe nicht atomar", '.not(seite + "_gestartet_am", "is", null).is(seite + "_fertig_am", null).select("id")', '.not(seite + "_gestartet_am", "is", null).select("id")'],
  ["Ende ohne Start erlaubt", 'if (!d[seite + "_gestartet_am"]) return nein("duell_nicht_gestartet", 409);', ""],
  ["gemeldete Zeit nicht gegen echte Zeit geprüft", "if (summe > vergangen + DUELL.LUFT_MS) return nein(\"zeit_unmoeglich\", 400);", ""],
  ["zu schnell nicht geprüft", "if (vergangen < DUELL.FRAGEN * DUELL.MIN_MS - 500) return nein(\"zu_schnell\", 400);", ""],
  ["Bonus-Schummelei nicht erkannt", "const mitBonus = vergangen - summeEff <= DUELL.UEBERHANG_MS;", "const mitBonus = true;"],
  ["jede Antwort zählt als richtig", "const ok = r === null ? true : antworten[i].a === r;", "const ok = true;"],
  ["Mindestzeit je Frage nicht begrenzt", "const eff = Math.max(ms, DUELL.MIN_MS);", "const eff = ms;"],
  ["Lösung falsch aus der Tabelle gelesen", "const r = Object.prototype.hasOwnProperty.call(loesungen, fid) ? loesungen[fid] : null;", "const r = Object.prototype.hasOwnProperty.call(loesungen, fid) ? (loesungen[fid] + 1) % 3 : null;"],
  ["Lösungstabelle bleibt für immer im Speicher", "if (loesungenCache && Date.now() - loesungenCache.am < DUELL.LOESUNGEN_CACHE_MS) return loesungenCache.karte;", "if (loesungenCache) return loesungenCache.karte;"],
  ["Lösungstabelle wird nie zwischengespeichert", "if (loesungenCache && Date.now() - loesungenCache.am < DUELL.LOESUNGEN_CACHE_MS) return loesungenCache.karte;", ""],
  ["Fragen-IDs nicht aus der Lösungstabelle", "duellZiehen(Object.keys(loesungen), DUELL.FRAGEN, meiden)", "duellZiehen(Array.from({ length: 99 }, (_, i) => \"q\" + String(i + 1).padStart(2, \"0\")), DUELL.FRAGEN, meiden)"],
  ["Lösung schon beim Start verraten", "return json({ ok: true, duell: id, fragen: d.fragen, limit_ms: DUELL.LIMIT_MS });", "return json({ ok: true, duell: id, fragen: d.fragen, limit_ms: DUELL.LIMIT_MS, loesung: [0, 1, 2] });"],
  ["Annahme ohne Sichtbarkeits-Prüfung des Erstellers", "if (!Object.prototype.hasOwnProperty.call(namen, d.ersteller)) return nein(\"duell_unbekannt\", 404);", ""],
  ["Ausgeblendete dürfen Duelle anlegen", 'if (!(await sichtbarLesen())) return nein("duell_ausgeblendet", 403);', ""],
  ["Annahme, bevor der Ersteller gespielt hat", 'if (!d.ersteller_fertig_am) return nein("duell_unbekannt", 404);', ""],
  ["Fremde dürfen starten/auswerten", "if (!d || (d.ersteller !== ich && d.gegner !== ich)) return nein(\"duell_unbekannt\", 404);", "if (!d) return nein(\"duell_unbekannt\", 404);"],
  ["Länge der Antworten nicht geprüft", "if (!Array.isArray(arr) || arr.length !== DUELL.FRAGEN) return nein(\"eingabe_fehlt\");", "if (!Array.isArray(arr)) return nein(\"eingabe_fehlt\");"],
  ["Wert a nicht geprüft", "if (!(a === null || (istGanz(a) && a >= 0 && a <= 2))) return nein(\"ergebnis_ungueltig\");", ""],
  ["Zeit ms nicht geprüft", "if (!istGanz(ms) || ms < 0 || ms > DUELL.LIMIT_MS + 1000) return nein(\"ergebnis_ungueltig\");", ""],
  ["UUID-Form nicht geprüft", "const duellId = (v: unknown): v is string => typeof v === \"string\" && UUID_FORM.test(v);", "const duellId = (v: unknown): v is string => typeof v === \"string\";"],
  ["liegengebliebene Gegner-Runde nicht abgerechnet", '.is("gegner_fertig_am", null).lt("gegner_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS)).limit(MAX);', '.is("gegner_fertig_am", null).lt("gegner_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS * 1000)).limit(MAX);'],
  ["Gegner-Runden ohne Zeilengrenze (50)", '.lt("gegner_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS)).limit(MAX);', '.lt("gegner_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS));'],
  ["liegengebliebene Ersteller-Runde bleibt stehen", '.is("ersteller_fertig_am", null).lt("ersteller_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS))', '.is("ersteller_fertig_am", null).lt("ersteller_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS * 1000))'],
  ["fertige Duelle nie gelöscht", '.eq("status", "fertig").lt("erstellt_am", vorTagen(DUELL.FERTIG_TAGE))', '.eq("status", "fertig").lt("erstellt_am", vorTagen(DUELL.FERTIG_TAGE * 1000))'],
  ["angenommen, aber nie gestartet: wird nicht zurückgesetzt (N3)", '.eq("status", "angenommen").is("gegner_gestartet_am", null).lt("angenommen_am", vorMs(DUELL.ANNAHME_FRIST_MS)).select("id");', '.eq("status", "angenommen").is("gegner_gestartet_am", null).lt("angenommen_am", vorMs(DUELL.ANNAHME_FRIST_MS * 1000)).select("id");'],
  ["Zurücksetzen lässt den Gegner stehen (N3)", 'const r5 = await supa.from(T).update({ gegner: null, status: "offen", angenommen_am: null })', 'const r5 = await supa.from(T).update({ status: "offen", angenommen_am: null })'],
  ["Start-Aufruf prüft die 24-Stunden-Frist nicht (N3)", 'if (seite === "gegner" && annahmeZuAlt(d)) {', "if (false) {"],
  ["Übersicht zeigt eine verfallene Annahme noch an (N3)", 'if (seite === "gegner" && annahmeZuAlt(d)) continue;', ""],
  ["Duelle mit beiden Ergebnissen bleiben unfertig (M4)", 'const r6 = await supa.from(T).update({ status: "fertig", fertig_am: jetztIso() }).in("id", idsFertig).neq("status", "fertig");', 'const r6 = await supa.from(T).update({ status: "fertig", fertig_am: jetztIso() }).in("id", []).neq("status", "fertig");'],
  ["Fertig-Reparatur ohne Zeilengrenze (50)", '.not("gegner_fertig_am", "is", null).limit(MAX);', '.not("gegner_fertig_am", "is", null);'],
  ["Aufräumen ohne Pause (N2)", "if (!erzwingen && Date.now() - letztesAufraeumen < DUELL.AUFRAEUM_ABSTAND_MS) return true;", ""],
  ["Übersicht ohne Bremse (N2)", 'if (!uebersichtErlaubt(ich)) return nein("zu_viele_runden", 429);', ""],
  ["Bremse ohne 10-Minuten-Fenster (N2)", "const liste = (uebersichtZeiten.get(ich) || []).filter((z) => z > ab);", "const liste = (uebersichtZeiten.get(ich) || []);"],
  ["Bremse gilt für alle Schüler gemeinsam (N2)", "const liste = (uebersichtZeiten.get(ich) || []).filter((z) => z > ab);", "const liste = (uebersichtZeiten.get(\"alle\") || []).filter((z) => z > ab);"],
  ["Rücknahme beim Limit fehlt (N4)", "if (nachher === null || nachher > DUELL.MAX_LAUFEND) {\n      const rb", "if (false) {\n      const rb"],
  ["Rücknahme zerstört auch ein gestartetes Duell (N4)", '.eq("id", id).eq("gegner", ich).eq("status", "angenommen").is("gegner_gestartet_am", null).select("id");', '.eq("id", id).eq("gegner", ich).eq("status", "angenommen").select("id");'],
  ["Rücknahme meldet Fehler, obwohl das Duell bleibt (N4)", "if (rb.data && rb.data.length) return nachher === null ? db503() : nein(\"duell_zu_viele\", 409);", "return nachher === null ? db503() : nein(\"duell_zu_viele\", 409);"],
  ["Rate-Limit aus", "return (a.count || 0) + (b.count || 0) >= RUNDEN_PRO_10_MIN;", "return false;"],
  ["Gegner-Name wird nicht gefiltert (unsichtbare Gegner erscheinen)", 'x.eintrag.name = x.andere && Object.prototype.hasOwnProperty.call(namen, x.andere) ? namen[x.andere] : null;', 'x.eintrag.name = x.andere ? (namen[x.andere] || "Geheim Voll") : null;'],
  ["Schüler-ID im Ergebnis verraten", "return json({ ok: true, anzeigename: await anzeigename(),", "return json({ ok: true, ich, anzeigename: await anzeigename(),"],
  ["runde_offen immer wahr (Weiterspielen-Knopf nach Ablauf)", 'eintrag.runde_offen = Date.now() - new Date(d[seite + "_gestartet_am"]).getTime() <= DUELL.RUNDE_MAX_MS;', "eintrag.runde_offen = true;"],
  ["Bilanz zählt Niederlagen als Siege", 'if (u === "sieg") bilanz.siege++; else if (u === "niederlage") bilanz.niederlagen++;', 'if (u === "sieg" || u === "niederlage") bilanz.siege++;'],
  ["Gleichstand wird Niederlage", 'const duellUrteil = (ich: number, er: number) => ich > er ? "sieg" : ich < er ? "niederlage" : "unentschieden";', 'const duellUrteil = (ich: number, er: number) => ich > er ? "sieg" : "niederlage";'],
  ["verfallene Duelle zählen gegen das Limit", ".neq(\"status\", \"fertig\").gt(\"erstellt_am\", grenze);\n    const b", ".neq(\"status\", \"fertig\");\n    const b"],
  ["Ersteller stellt Fragen aus Client-Eingabe", "const { data, error } = await supa.from(T).insert({ ersteller: ich, fragen }).select(\"id\").single();", "const { data, error } = await supa.from(T).insert({ ersteller: ich, fragen: Array.isArray(body.fragen) ? body.fragen : fragen }).select(\"id\").single();"],
  ["Body muss kein Objekt sein (N1)", 'if (typeof roh !== "object" || roh === null || Array.isArray(roh)) return json({ error: "eingabe_fehlt", code: "eingabe_fehlt" }, 400);', ""],
  ["Fehlermeldung geht an den Client (N1)", 'return json({ error: "voruebergehend", code: "voruebergehend" }, 500);', 'return json({ error: String(e), code: "voruebergehend" }, 500);'],
  ["Lösungstabelle liegt (wieder) im Quelltext", "const DUELL_LOESUNGEN_TABELLE = \"academy_duell_loesungen\";", "const DUELL_LOESUNGEN_TABELLE = \"academy_duell_loesungen\";\nconst DUELL_LOESUNGEN: Record<string, number> = { q99: 1 };"],
];
const ordner = mkdtempSync(join(tmpdir(), "mutation-"));
let ueberlebt = 0, nichtGefunden = 0;
for (const [name, a, b, gleichwertig] of M) {
  if (!original.includes(a)) { console.log("  ??   Stelle nicht gefunden (Mutationstest veraltet): " + name); nichtGefunden++; continue; }
  const datei = join(ordner, "academy-spiele-mutiert.ts"); writeFileSync(datei, original.replace(a, () => b));
  const r = spawnSync(process.execPath, ["--experimental-strip-types", join(hier, "pruefe-duell.mjs")], { env: { ...process.env, SPIELE_FUNCTION_DATEI: datei }, encoding: "utf8" });
  const gefangen = r.status !== 0;
  if (!gefangen && !gleichwertig) ueberlebt++;
  const erste = (r.stdout.match(/FEHL ([^\n]+)/) || [])[1] || (r.stderr || "").split("\n")[0];
  console.log((gefangen ? "  ok   gefangen: " : gleichwertig ? "  ok   gleichwertig (darf überleben): " : "  FEHL ÜBERLEBT: ") + name + (gefangen ? "  <- " + erste.slice(0, 80) : ""));
}
console.log("\n" + (M.length - ueberlebt - nichtGefunden) + " von " + M.length + " Fehlern gefangen" + (ueberlebt || nichtGefunden ? ", " + ueberlebt + " überlebt, " + nichtGefunden + " nicht gefunden" : ""));
process.exitCode = ueberlebt || nichtGefunden ? 1 : 0;
