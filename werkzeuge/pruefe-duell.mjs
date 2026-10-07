// Prüfung von Spiel 10 „Duell gegen Mitschüler“ OHNE Browser (06.10.2026):
//   1. Fragenpool: eindeutig, lösbar, 18 Sprachen, Zahlen in allen Sprachen gleich, keine Lösung im App-Pool, fachliche Eckwerte
//   2. Lösungsschlüssel (PRIVAT, außerhalb des Repos: werkzeuge/duell-schluessel.mjs) passt zum Pool; nirgends im Repo steht eine Lösung; erzeugte Dateien passen zur Quelle
//   3. Texte (Präfix du) in allen 18 Sprachen, Platzhalter gleich, alle benutzten Schlüssel vorhanden
//   4. Zahlen im Spiel = Zahlen im Server
//   5. Edge Function academy-spiele (Aktionen duell_*) gegen die Datenbank im Speicher: Ablauf A->B, Fremdzugriff, Selbst-Duell, Verfall, Limit,
//      Wiederholung verboten, ausgeblendete Spieler, gefälschte Antworten/Zeiten, gleichzeitige Annahme, Eingaben wie SQL-Injection, Datensparsamkeit
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-duell.mjs
// Die Lösungen liegen NICHT im Repo (öffentlich). Fehlt die private Schlüsseldatei (DUELL_LOESUNGEN_PFAD, Standard /home/user/duell-private/loesungen.json),
// lehnt jede Prüfung, die Lösungen braucht, laut ab (FEHL, Exit 1; nie stilles Überspringen); alle anderen Prüfungen laufen weiter.
// Für den Mutationstest (werkzeuge/mutationstest-duell.mjs) kann die Function-Datei per SPIELE_FUNCTION_DATEI ersetzt werden.
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db, rufe, warte, LOESUNGEN, LOESUNGEN_FEHLER } from "./edge-functions/spiele-im-speicher.mjs";
import { META, SPRACHEN } from "./duell-quelle/meta.mjs";
import { quelleLesen, poolText, schluesselGegenPool, POOL_DATEI } from "./duell-loesungen-erzeugen.mjs";
import { FRAGEN, FRAGEN_NACH_ID, SPRACHEN as POOL_SPRACHEN } from "../spiele/duell-fragen.js";
import { TEXTE_DUELL } from "../spiele/texte-duell.js";
import { REGELN, punkteFuer } from "../spiele/duell.js";
import { SCHILD_IDS } from "../spiele/schilder.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const FUNKTION = process.env.SPIELE_FUNCTION_DATEI || join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts");
const funktionText = readFileSync(FUNKTION, "utf8");
const LOESUNG = LOESUNGEN || {};   // privater Schlüssel (null, wenn die Datei fehlt)

let ok = 0;
const pruefe = async (name, f) => { try { await f(); ok++; console.log("  ok   " + name); } catch (e) { console.log("  FEHL " + name + "\n       " + String(e.message).split("\n").slice(0, 4).join("\n       ")); process.exitCode = 1; } };
/* Prüfung, die den privaten Lösungsschlüssel braucht: ohne Schlüssel laut ablehnen (FEHL), nie still überspringen */
const mitSchluessel = (name, f) => LOESUNGEN ? pruefe(name, f) : pruefe(name, () => { throw new Error("braucht den privaten Lösungsschlüssel, der nicht geladen werden konnte: " + LOESUNGEN_FEHLER); });

/* ======================= 1. Fragenpool ======================= */
console.log("Fragenpool");
await pruefe("mindestens 60 Fragen, IDs eindeutig und im Format q00, genau 18 Sprachen", () => {
  assert.ok(FRAGEN.length >= 60, "nur " + FRAGEN.length + " Fragen");
  assert.equal(new Set(FRAGEN.map((q) => q.id)).size, FRAGEN.length);
  FRAGEN.forEach((q) => assert.match(q.id, /^q[0-9]{2}$/));
  assert.equal(SPRACHEN.length, 18); assert.deepEqual(POOL_SPRACHEN, SPRACHEN);
  assert.deepEqual(Object.keys(TEXTE_DUELL).sort(), SPRACHEN.slice().sort());
});
await pruefe("jede Frage: Text, genau 3 verschiedene Antworten und Erklärung in allen 18 Sprachen, keine Platzhalter-Reste", () => {
  for (const q of FRAGEN) for (const s of SPRACHEN) {
    const t = q.t[s]; assert.ok(t, q.id + "/" + s + " fehlt");
    for (const x of [t.f, t.e, ...t.a]) { assert.equal(typeof x, "string"); assert.ok(x.trim().length > 0, q.id + "/" + s + " leer"); assert.ok(!/[{}]|undefined|null|TODO/.test(x), q.id + "/" + s + ": " + x); }
    assert.equal(t.a.length, 3, q.id + "/" + s); assert.equal(new Set(t.a).size, 3, q.id + "/" + s + " gleiche Antworten");
    assert.deepEqual(Object.keys(t).sort(), ["a", "e", "f"]);
  }
});
await pruefe("Zahlen und Zeichennummern: jede Sprache nennt in Frage, Antworten und Erklärung dieselben Zahlen wie Deutsch (Komma oder Punkt egal)", () => {
  const zahlen = (t) => Array.from(new Set((([t.f, ...t.a, t.e]).join(" ").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g)) || [])).sort();
  for (const q of FRAGEN) {
    const soll = zahlen(q.t.de);
    for (const s of SPRACHEN) {
      const monate = q.id === "q43" ? ["3", "10"] : [];   // „1. Oktober bis 31. März“: manche Sprachen schreiben die Monate als Zahl (tháng 10)
      const ist = zahlen(q.t[s]).filter((z) => !monate.includes(z));
      // Eine Sprache darf eine Zahl ausschreiben (Arabisch: „zwei Jahre“ als ein Wort), aber keine fremde Zahl nennen
      for (const z of ist) assert.ok(soll.includes(z), q.id + "/" + s + ": Zahl " + z + " steht nicht im Deutschen (" + soll.join(",") + ")");
      // Zahlen, die in Frage/Antwort stehen, müssen in jeder Sprache vorkommen (außer ausgeschrieben)
      const ausgeschrieben = (s === "ar" || s === "ckb") && q.id === "q23";   // „ein Jahr“/„zwei Jahre“ als ein Wort
      if (!ausgeschrieben) assert.deepEqual(ist, soll, q.id + "/" + s + ": " + ist.join(",") + " statt " + soll.join(","));
    }
  }
});
await pruefe("Zahlen in den Antworten stehen für jede Antwort an derselben Stelle (nicht vertauscht)", () => {
  const num = (x) => (x.replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) || []).join("|");
  for (const q of FRAGEN) { if (q.id === "q43") continue; const soll = q.t.de.a.map(num); for (const s of SPRACHEN) q.t[s].a.forEach((x, i) => { if (num(x) !== "") assert.equal(num(x), soll[i], q.id + "/" + s + " Antwort " + (i + 1)); }); }
});
await pruefe("meta.mjs und der App-Pool enthalten keine Lösung (öffentliches Repo): kein Feld richtig/loesung, keine Lösungsnummer je Frage", () => {
  assert.equal(META.length, FRAGEN.length);
  for (const m of META) assert.ok(!("richtig" in m) && !("loesung" in m), m.id + ": Lösung in meta.mjs");
  const text = readFileSync(POOL_DATEI, "utf8");
  assert.ok(!/richtig\s*:|"richtig"|loesung/i.test(text.replace(/\/\*[\s\S]*?\*\//, "")), "Lösung im App-Pool gefunden");
  FRAGEN.forEach((q) => assert.deepEqual(Object.keys(q).sort(), ["bild", "id", "t"]));
});
await mitSchluessel("Lösbar und eindeutig: genau eine Lösung 0-2 je Frage im privaten Schlüssel, keine überzählige", () => {
  assert.deepEqual(schluesselGegenPool(LOESUNG, FRAGEN), []);
  assert.deepEqual(Object.keys(LOESUNG).sort(), FRAGEN.map((q) => q.id).sort());
});
await mitSchluessel("richtige Antworten sind gleichmäßig verteilt (je Nummer mindestens 15 mal) und wiederholen sich nie mehr als 3 mal hintereinander", () => {
  const z = [0, 0, 0]; META.forEach((m) => z[LOESUNG[m.id]]++);
  z.forEach((n, i) => assert.ok(n >= 15, "Nummer " + i + " nur " + n + " mal: " + z.join("/")));
  for (let i = 3; i < META.length; i++) { const r = (k) => LOESUNG[META[i - k].id]; assert.ok(!(r(0) === r(1) && r(0) === r(2) && r(0) === r(3)), "Serie bei " + META[i].id); }
});
await pruefe("Verkehrszeichen: nur amtliche Bilder (Schlüssel aus schilder.js, Datei in verkehr/vorfahrt-zeichen/, in QUELLEN.md genannt)", () => {
  const quellen = readFileSync(join(wurzel, "verkehr/vorfahrt-zeichen/QUELLEN.md"), "utf8");
  let mitBild = 0;
  for (const q of FRAGEN) if (q.bild) {
    mitBild++;
    assert.ok(SCHILD_IDS.includes(q.bild), q.id + ": " + q.bild + " kennt schilder.js nicht");
    const datei = q.bild + ".svg"; assert.ok(existsSync(join(wurzel, "verkehr/vorfahrt-zeichen", datei)), datei + " fehlt");
    assert.ok(quellen.includes(datei), datei + " nicht in QUELLEN.md");
  }
  assert.ok(mitBild >= 16, "nur " + mitBild + " Bildfragen");
  const bildPfad = readFileSync(join(wurzel, "spiele/duell.js"), "utf8");
  assert.ok(/schildBild\(/.test(bildPfad) && !/<svg|<path|<polygon|<circle/.test(bildPfad.replace(/<svg viewBox[^]*?<\/svg>/g, "")), "duell.js darf keine Zeichen selbst zeichnen");
});
await mitSchluessel("fachlich: Eckwerte der Fragen (Deutsch) stimmen, keine Bußgelder/Punkte/Fahrverbot/Geldbeträge", () => {
  const richtigDe = (id) => FRAGEN_NACH_ID[id].t.de.a[LOESUNG[id]];
  assert.equal(richtigDe("q15"), "50 km/h"); assert.equal(richtigDe("q16"), "100 km/h"); assert.equal(richtigDe("q17"), "130 km/h");
  assert.equal(richtigDe("q25"), "25 m"); assert.equal(richtigDe("q27"), "15 m"); assert.equal(richtigDe("q29"), "1,5 m");
  assert.equal(richtigDe("q30"), "5 m"); assert.equal(richtigDe("q31"), "15 m"); assert.equal(richtigDe("q40"), "≈ 100 m"); assert.equal(richtigDe("q44"), "50 m");
  assert.match(richtigDe("q22"), /0,0 Promille/); assert.match(richtigDe("q23"), /2 Jahre/); assert.match(richtigDe("q26"), /Viermal/);
  // q22: § 24c StVG gilt für Alkohol UND Cannabis (THC) -- die Erklärung darf nicht nur den Alkohol nennen
  assert.match(FRAGEN_NACH_ID.q22.t.de.e, /Alkohol/); assert.match(FRAGEN_NACH_ID.q22.t.de.e, /Cannabis \(THC\)/);
  // q30 (Kreuzung: bis zu 5 m, 8 m bei Radweg) darf nicht mit q31 (Haltestelle: 15 m) verwechselt sein; kein missverständliches „mindestens“
  assert.match(FRAGEN_NACH_ID.q30.t.de.f, /^Bis zu wie viel Metern vor einer Kreuzung ist das Parken verboten/); assert.ok(!/mindestens/i.test(FRAGEN_NACH_ID.q30.t.de.f));
  assert.match(FRAGEN_NACH_ID.q30.t.de.e, /8 m/); assert.match(FRAGEN_NACH_ID.q30.t.de.e, /Haltestellen/); assert.match(FRAGEN_NACH_ID.q31.t.de.f, /Haltestellenschild/);
  // q35 (Grünpfeil): genau eine Antwort ist sicher richtig; „nur bei Grün“ und „ohne Halt“ sind falsch, Warten bleibt erlaubt (steht in der Erklärung)
  assert.match(FRAGEN_NACH_ID.q35.t.de.f, /Was gilt, wenn du rechts abbiegen willst/); assert.match(richtigDe("q35"), /nach dem Anhalten/);
  assert.match(FRAGEN_NACH_ID.q35.t.de.a[0], /ohne Halt/); assert.match(FRAGEN_NACH_ID.q35.t.de.a[1], /nur bei Grün/); assert.match(FRAGEN_NACH_ID.q35.t.de.e, /warten, bis die Ampel Grün zeigt/);
  // neue Fragen q45-q60
  assert.equal(richtigDe("q52"), "150–250 m"); assert.equal(richtigDe("q53"), "10 m"); assert.equal(richtigDe("q54"), "50 km/h");
  assert.match(richtigDe("q45"), /Überholverbot für Kraftfahrzeuge aller Art/); assert.match(richtigDe("q51"), /nicht blinken/); assert.match(richtigDe("q55"), /nicht überholt/);
  assert.match(richtigDe("q56"), /nicht einfahren/); assert.match(richtigDe("q57"), /^Möglichst weit rechts$/); assert.match(richtigDe("q58"), /engen und unübersichtlichen/);
  assert.match(richtigDe("q59"), /^Möglichst weit rechts$/); assert.match(richtigDe("q60"), /Abblendlicht/); assert.match(richtigDe("q47"), /Nur Fußgänger/);
  // dieselben Faustformeln wie im Ampel-Bremsweg-Spiel: Reaktionsweg (v/10)*3, Bremsweg (v/10)^2
  assert.equal((50 / 10) ** 2, 25); assert.equal((50 / 10) * 3, 15); assert.equal((100 / 10) ** 2 / (50 / 10) ** 2, 4);
  assert.match(FRAGEN_NACH_ID.q06.t.de.a[LOESUNG.q06], /3 Minuten.*nicht parken/);
  assert.match(FRAGEN_NACH_ID.q05.t.de.a[LOESUNG.q05], /nicht halten/);
  const verboten = /Bußgeld|Euro|€|Flensburg|Fahrverbot|Punkte in|Verwarnung|Geldbuße|Strafe/i;
  for (const q of FRAGEN) for (const x of [q.t.de.f, q.t.de.e, ...q.t.de.a]) assert.ok(!verboten.test(x), q.id + ": " + x);
});

/* ======================= 2. Server-Tabelle = Quelle ======================= */
console.log("Lösungsschlüssel (privat) und erzeugte Dateien");
await pruefe("kein Quelltext der Edge Function enthält eine Lösungstabelle; sie liest die Lösungen aus der Tabelle academy_duell_loesungen", () => {
  assert.ok(!/DUELL_LOESUNGEN\b(?!_TABELLE)|DUELL-LOESUNGEN/.test(funktionText), "alte Lösungstabelle im Quelltext");
  assert.ok(!/\bq[0-9]{2}\s*:\s*[0-2]\b/.test(funktionText), "Frage-ID mit Lösung im Quelltext");
  assert.match(funktionText, /from\(DUELL_LOESUNGEN_TABELLE\)/); assert.match(funktionText, /DUELL_LOESUNGEN_TABELLE = "academy_duell_loesungen"/);
});
await pruefe("nirgends im Repo steht die Lösung einer Frage (alle Textdateien im Arbeitsbaum, ohne .git): weder als Paar Frage-ID und Lösungsnummer (JSON, TypeScript, SQL) noch als Feld richtig in der Fragenquelle", () => {
  const stellen = [];
  const lauf = (ordner) => {
    for (const e of readdirSync(ordner, { withFileTypes: true })) {
      if (e.name === ".git" || e.name === ".claude" || e.name === "node_modules" || e.name === "vendor" || e.name === "spiele-bilder") continue;
      const p = join(ordner, e.name);
      if (e.isDirectory()) { lauf(p); continue; }
      if (!/\.(js|mjs|ts|json|md|sql|html|css|txt|yml|yaml)$/i.test(e.name)) continue;
      const text = readFileSync(p, "utf8");
      if (/duell-quelle\/[a-z]+\.mjs$|duell-quelle\\[a-z]+\.mjs$/.test(p) && /\brichtig\s*:\s*[0-2]\b/.test(text)) stellen.push(p + ": richtig: N in der Fragenquelle");
      if (!LOESUNGEN) continue;
      for (const [id, r] of Object.entries(LOESUNGEN)) {
        const muster = new RegExp("[\"'`]?\\b" + id + "[\"'`]?\\s*[:,]\\s*" + r + "\\b");
        if (muster.test(text)) stellen.push(p.slice(wurzel.length + 1) + ": " + id + " -> " + r);
      }
    }
  };
  lauf(wurzel);
  assert.deepEqual(stellen.slice(0, 5), [], stellen.length + " Treffer");
  assert.ok(LOESUNGEN, "der Suchlauf nach den Lösungen selbst braucht den privaten Schlüssel (nur die Fragenquelle wurde geprüft): " + LOESUNGEN_FEHLER);
});
await pruefe("spiele/duell-fragen.js ist genau das, was die Quelle (werkzeuge/duell-quelle/) ergibt", async () => {
  const { fragen } = await quelleLesen();
  assert.equal(readFileSync(POOL_DATEI, "utf8"), poolText(fragen), "duell-fragen.js ist veraltet: node werkzeuge/duell-loesungen-erzeugen.mjs");
});

/* ======================= 3. Texte ======================= */
console.log("Texte (Präfix du)");
await pruefe("alle 18 Sprachen haben dieselben Schlüssel wie Deutsch, alle mit du, keine leeren Texte, keine Reste", () => {
  const de = Object.keys(TEXTE_DUELL.de);
  assert.ok(de.length >= 60);
  for (const s of SPRACHEN) {
    assert.deepEqual(Object.keys(TEXTE_DUELL[s]).sort(), de.slice().sort(), s);
    for (const [k, v] of Object.entries(TEXTE_DUELL[s])) { assert.match(k, /^du[A-Z]/); assert.equal(typeof v, "string"); assert.ok(v.trim() && v === v.trim(), s + "." + k + " leer"); assert.ok(!/undefined|TODO/.test(v), s + "." + k); }
  }
});
await pruefe("Platzhalter ({n} {m} {a} {b} {name}) in jeder Sprache wie im Deutschen", () => {
  const ph = (t) => (t.match(/\{[a-z]+\}/g) || []).sort().join(",");
  for (const k of Object.keys(TEXTE_DUELL.de)) { const soll = ph(TEXTE_DUELL.de[k]); for (const s of SPRACHEN) assert.equal(ph(TEXTE_DUELL[s][k]), soll, s + "." + k); }
});
await pruefe("jeder in duell.js benutzte Schlüssel gibt es; die Karte (duName, duKurz) ist da; Sprachen nutzen lateinische Ziffern", () => {
  const quelle = readFileSync(join(wurzel, "spiele/duell.js"), "utf8");
  const benutzt = new Set(Array.from(quelle.matchAll(/T\("(du[A-Za-z]+)"/g)).map((m) => m[1]));
  for (const m of quelle.matchAll(/"(du[A-Z][A-Za-z]+)"/g)) benutzt.add(m[1]);
  for (const k of benutzt) assert.ok(k in TEXTE_DUELL.de, "Schlüssel fehlt: " + k);
  assert.ok("duName" in TEXTE_DUELL.de && "duKurz" in TEXTE_DUELL.de);
  const andereZiffern = /[٠-٩۰-۹०-९]/;
  for (const s of SPRACHEN) { for (const v of Object.values(TEXTE_DUELL[s])) assert.ok(!andereZiffern.test(v), s + ": " + v); for (const q of FRAGEN) for (const x of [q.t[s].f, q.t[s].e, ...q.t[s].a]) assert.ok(!andereZiffern.test(x), q.id + "/" + s); }
});
await pruefe("nur diese Texte sind nicht Deutsch-Reste: jede Sprache weicht in mindestens 90 % der Texte vom Deutschen ab", () => {
  for (const s of SPRACHEN) if (s !== "de") {
    const gleich = Object.keys(TEXTE_DUELL.de).filter((k) => TEXTE_DUELL[s][k] === TEXTE_DUELL.de[k]).length;
    assert.ok(gleich <= Object.keys(TEXTE_DUELL.de).length * 0.1, s + ": " + gleich + " Texte gleich Deutsch");
  }
});

/* ======================= 4. Zahlen im Spiel = Zahlen im Server ======================= */
console.log("Zahlen Spiel und Server");
await pruefe("REGELN in spiele/duell.js = DUELL in academy-spiele.ts", () => {
  const m = funktionText.match(/const DUELL = \{([\s\S]*?)\n\};/); assert.ok(m, "DUELL-Block nicht gefunden");
  const w = {}; for (const p of m[1].matchAll(/([A-Z_]+): ([\d_]+)/g)) w[p[1]] = +p[2].replace(/_/g, "");
  for (const k of ["FRAGEN", "MAX_LAUFEND", "LIMIT_MS", "BONUS_MS", "PUNKTE_RICHTIG", "BONUS_MAX", "MIN_MS"]) assert.equal(w[k], REGELN[k], k);
  assert.ok(REGELN.MIN_MS * REGELN.FRAGEN < 10_000 && w.RUNDE_MAX_MS >= REGELN.FRAGEN * REGELN.LIMIT_MS + 60_000, "Rundenzeit reicht nicht für 8 × 20 s");
  assert.ok(w.UEBERHANG_MS >= REGELN.FRAGEN * REGELN.WEITER_MS + 8_000 && w.UEBERHANG_MS <= 20_000, "erlaubte Pausen sind zu knapp (Pause je Frage + Netz)");
  assert.equal(w.VERFALL_TAGE, 7); assert.equal(w.ANNAHME_FRIST_MS, 86_400_000); assert.equal(w.LOESUNGEN_CACHE_MS, 300_000); assert.equal(w.AUFRAEUM_ABSTAND_MS, 60_000);
  assert.equal(w.UEBERSICHT_PRO_ZEHN_MIN, 60); assert.equal(w.MAX_ZEILEN_JE_LAUF, 50); assert.equal(w.RUNDE_MAX_MS, 600_000);
  assert.equal(punkteFuer(true, 0), 100 + Math.floor(50 * (1 - 700 / 10000))); assert.equal(punkteFuer(true, 10_000), 100); assert.equal(punkteFuer(false, 0), 0); assert.equal(punkteFuer(true, 20_000), 100);
});

/* ======================= 5. Server ======================= */
console.log("Server: Ablauf A -> B");
const inEinemJahr = new Date(Date.now() + 400 * 86_400_000).toISOString();
let zaehler = 0;
const neuerSchueler = (name, extra) => {
  zaehler++; const id = "sid-" + String(zaehler).padStart(4, "0");
  db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null, ...extra });
  db.academy_sessions.push({ session_token: "tok-" + id, schueler_id: id, expires_at: inEinemJahr });
  return { id, name, rufe: (o) => rufe({ session_token: "tok-" + id, ...o }) };
};
const duelle = () => db.academy_spiele_duelle;
const antw = (ids, wie, ms) => ids.map((id, i) => {
  const r = LOESUNG[id]; const t = typeof ms === "function" ? ms(i) : ms;
  return { a: wie === "richtig" ? r : wie === "falsch" ? (r + 1) % 3 : null, ms: wie === "keine" ? 20000 : t };
});
const erwartet = (anzahlRichtig, ms) => anzahlRichtig * (100 + Math.floor(50 * (1 - Math.max(ms, 700) / 10000)));
/* eine ganze Runde wie ein Mensch: starten, "vor" ms vergehen lassen, Antworten abgeben */
async function runde(sp, duell, o = {}) {
  const s = await sp.rufe({ aktion: "duell_start", duell }); assert.equal(s.ok, true, "start: " + JSON.stringify(s));
  const ms = typeof o.ms === "number" ? o.ms : 3000;
  warte(o.vor ?? Math.max(5_500, 8 * ms + 6_000));
  const e = await sp.rufe({ aktion: "duell_ende", duell, antworten: antw(s.fragen, o.wie || "richtig", o.ms ?? 3000) });
  return { s, e };
}
const keys = (o) => Object.keys(o).sort();
/* Jeder Server-Test beginnt mit leerer Duell-Tabelle (sonst stehen Duelle früherer Tests in „Offene Herausforderungen“) */
const ptest = (name, f) => mitSchluessel(name, async () => { db.academy_spiele_duelle = []; await f(); });

await pruefe("ohne Anmeldung: 401; unbekannte duell_-Aktion: 400", async () => {
  const r = await rufe({ aktion: "duell_uebersicht" }); assert.equal(r.status, 401);
  const A = neuerSchueler("Mira Kaya"); const x = await A.rufe({ aktion: "duell_gibtesnicht" }); assert.equal(x.status, 400); assert.equal(x.error, "aktion unbekannt");
});

let ablauf;
await pruefe("A legt ein Duell an: 8 verschiedene Fragen aus dem Pool; vor dem Spielen sieht niemand das Duell", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); assert.equal(n.status, 200); assert.match(n.duell, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  const z = duelle().find((d) => d.id === n.duell);
  assert.equal(z.fragen.length, 8); assert.equal(new Set(z.fragen).size, 8); z.fragen.forEach((f) => assert.ok(f in LOESUNG));
  assert.equal(z.ersteller, A.id); assert.equal(z.gegner, null); assert.equal(z.status, "offen");
  const u = await B.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.offene.length, 0, "unfertiges Duell darf nicht in der Liste stehen");
  const an = await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(an.status, 404); assert.equal(an.code, "duell_unbekannt");
  ablauf = { A, B, duell: n.duell };
});
await pruefe("A startet: bekommt 8 IDs OHNE Lösung; spielt alles richtig: Punkte = 100 + Tempo-Bonus; Lösungen kommen erst jetzt", async () => {
  const { A, duell } = ablauf;
  const s = await A.rufe({ aktion: "duell_start", duell });
  assert.equal(s.ok, true); assert.equal(s.fragen.length, 8);
  assert.deepEqual(keys(s), ["duell", "fragen", "limit_ms", "ok", "status"]); assert.ok(!/loesung|richtig/i.test(JSON.stringify(s)));
  assert.deepEqual(s.fragen, duelle().find((d) => d.id === duell).fragen);
  warte(30_000);
  const e = await A.rufe({ aktion: "duell_ende", duell, antworten: antw(s.fragen, "richtig", 3000) });
  assert.equal(e.ok, true); assert.equal(e.richtig, 8); assert.equal(e.punkte, erwartet(8, 3000)); assert.equal(e.punkte, 8 * 135);
  assert.equal(e.fertig, false); assert.deepEqual(e.loesung, s.fragen.map((id) => LOESUNG[id])); assert.equal(e.bonus, true);
  ablauf.fragen = s.fragen;
});
await pruefe("B sieht die Herausforderung (nur id, Name „Mira K.“, Zeit), nimmt an, bekommt DIESELBEN Fragen in derselben Reihenfolge", async () => {
  const { B, duell, fragen } = ablauf;
  const u = await B.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.offene.length, 1);
  assert.deepEqual(keys(u.offene[0]), ["erstellt_am", "id", "name"]); assert.equal(u.offene[0].name, "Mira K."); assert.equal(u.offene[0].id, duell);
  const an = await B.rufe({ aktion: "duell_annehmen", duell }); assert.equal(an.ok, true); assert.equal(an.name, "Mira K.");
  const s = await B.rufe({ aktion: "duell_start", duell }); assert.deepEqual(s.fragen, fragen);
  const u2 = await B.rufe({ aktion: "duell_uebersicht" }); assert.equal(u2.offene.length, 0, "angenommenes Duell darf nicht mehr offen sein");
  ablauf.sB = s;
});
await pruefe("B spielt alles falsch: Ergebnis steht fest (Niederlage, 0 Punkte); A sieht beim nächsten Öffnen den Sieg mit Gegnername und Bilanz", async () => {
  const { A, B, duell, sB } = ablauf;
  warte(30_000);
  const e = await B.rufe({ aktion: "duell_ende", duell, antworten: antw(sB.fragen, "falsch", 2500) });
  assert.equal(e.fertig, true); assert.equal(e.ergebnis, "niederlage"); assert.equal(e.punkte, 0); assert.equal(e.richtig, 0); assert.equal(e.punkte_gegner, 1080); assert.equal(e.name, "Mira K.");
  const ua = await A.rufe({ aktion: "duell_uebersicht" });
  assert.equal(ua.meine.length, 1); const m = ua.meine[0];
  assert.equal(m.zustand, "fertig"); assert.equal(m.ergebnis, "sieg"); assert.equal(m.punkte_ich, 1080); assert.equal(m.punkte_gegner, 0); assert.equal(m.name, "Jonas W."); assert.equal(m.rolle, "ersteller");
  assert.deepEqual(ua.bilanz, { siege: 1, unentschieden: 0, niederlagen: 0 });
  const ub = await B.rufe({ aktion: "duell_uebersicht" }); assert.deepEqual(ub.bilanz, { siege: 0, unentschieden: 0, niederlagen: 1 }); assert.equal(ub.meine[0].ergebnis, "niederlage"); assert.equal(ub.meine[0].name, "Mira K.");
  assert.equal(duelle().find((d) => d.id === duell).status, "fertig");
});
await ptest("Unentschieden bei gleichen Punkten; Tempo-Bonus entscheidet bei gleich vielen richtigen Antworten", async () => {
  const A = neuerSchueler("Lea Fischer"), B = neuerSchueler("Ali Reza Karimi");
  let n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell, { ms: 4000 }); await B.rufe({ aktion: "duell_annehmen", duell: n.duell });
  let r = await runde(B, n.duell, { ms: 4000 }); assert.equal(r.e.ergebnis, "unentschieden"); assert.equal(r.e.punkte, r.e.punkte_gegner);
  n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell, { ms: 6000 }); await B.rufe({ aktion: "duell_annehmen", duell: n.duell });
  r = await runde(B, n.duell, { ms: 1000 }); assert.equal(r.e.ergebnis, "sieg"); assert.equal(r.e.punkte, erwartet(8, 1000)); assert.equal(r.e.punkte_gegner, erwartet(8, 6000));
  const u = await A.rufe({ aktion: "duell_uebersicht" }); assert.deepEqual(u.bilanz, { siege: 0, unentschieden: 1, niederlagen: 1 });
  assert.equal(r.e.name, "Lea F.");
});
await ptest("Punkte werden vom Server gerechnet: Mischung richtig/falsch/keine Antwort; höchstens 8 × 146 = 1168 (Zeit unter 700 ms zählt 700 ms)", async () => {
  const A = neuerSchueler("Tom Bauer");
  const n = await A.rufe({ aktion: "duell_neu" });
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(50_000);
  const ant = s.fragen.map((id, i) => i < 3 ? { a: LOESUNG[id], ms: 100 } : i < 5 ? { a: (LOESUNG[id] + 2) % 3, ms: 500 } : i === 5 ? { a: null, ms: 20000 } : { a: LOESUNG[id], ms: 9999 });
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: ant });
  assert.equal(e.richtig, 5); assert.equal(e.punkte, 3 * 146 + 2 * (100 + Math.floor(50 * (1 - 9999 / 10000)))); assert.equal(e.punkte, 438 + 200);
  assert.ok(e.punkte <= 8 * 146);
});

console.log("Server: Fremdzugriff, Selbst-Duell, Wiederholung");
await ptest("Selbst-Duell: das eigene Duell annehmen geht nicht; die Tabelle lässt gegner = ersteller nicht zu", async () => {
  const A = neuerSchueler("Eva Roth"); const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
  const r = await A.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(r.status, 400); assert.equal(r.code, "eigenes_duell");
  const ua = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(ua.offene.length, 0, "eigene Herausforderung darf in der eigenen Liste nicht stehen");
  const d = duelle().find((x) => x.id === n.duell); assert.equal(d.gegner, null);
  const c = await (async () => { const res = await rufe({ session_token: "tok-" + A.id, aktion: "duell_annehmen", duell: n.duell }); return res; })(); assert.notEqual(c.ok, true);
});
await ptest("Fremde: weder starten noch auswerten noch Daten sehen (sieht aus wie „gibt es nicht“); Zweitannahme eines schon vergebenen Duells sieht für Fremde ebenfalls aus wie „gibt es nicht“ (404)", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber"), C = neuerSchueler("Nora Klein");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
  await B.rufe({ aktion: "duell_annehmen", duell: n.duell });
  for (const aktion of ["duell_start", "duell_ende"]) { const r = await C.rufe({ aktion, duell: n.duell, antworten: antw(duelle().find((d) => d.id === n.duell).fragen, "richtig", 3000) }); assert.equal(r.status, 404, aktion); assert.equal(r.code, "duell_unbekannt"); }
  const z = await C.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(z.status, 404); assert.equal(z.code, "duell_unbekannt");
  const selbst = await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(selbst.status, 409); assert.equal(selbst.code, "duell_vergeben", "wer das Duell selbst angenommen hat, darf „vergeben“ erfahren");
  const uc = await C.rufe({ aktion: "duell_uebersicht" }); assert.equal(uc.meine.length, 0); assert.equal(uc.offene.length, 0); assert.deepEqual(uc.bilanz, { siege: 0, unentschieden: 0, niederlagen: 0 });
  assert.equal(duelle().find((d) => d.id === n.duell).gegner, B.id);
  const unbekannt = await C.rufe({ aktion: "duell_start", duell: "00000000-0000-4000-8000-0000000fffff" }); assert.equal(unbekannt.code, "duell_unbekannt");
});
await ptest("Wiederholung: eine Runde zählt nur einmal. Zweiter Start einer OFFENEN Runde liefert dieselben Fragen und stellt die Uhr nicht neu; nach der Abgabe sind Start und Abgabe verboten", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" });
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(s.ok, true);
  const start1 = duelle().find((d) => d.id === n.duell).ersteller_gestartet_am; warte(2_000);
  const s2 = await A.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(s2.status, 200); assert.equal(s2.fortgesetzt, true); assert.deepEqual(s2.fragen, s.fragen, "dieselben Fragen");
  assert.equal(duelle().find((d) => d.id === n.duell).ersteller_gestartet_am, start1, "die Startzeit bleibt (Uhr läuft weiter)"); assert.ok(!/loesung/i.test(JSON.stringify(s2)));
  warte(30_000);
  const ant = antw(s.fragen, "richtig", 3000);
  assert.equal((await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: ant })).ok, true);
  const e2 = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "falsch", 3000) }); assert.equal(e2.status, 409); assert.equal(e2.code, "duell_schon_gespielt");
  assert.equal(duelle().find((d) => d.id === n.duell).punkte_ersteller, 1080, "Ergebnis darf sich nicht ändern");
  const s3 = await A.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(s3.code, "duell_schon_gespielt");
  await B.rufe({ aktion: "duell_annehmen", duell: n.duell });
  const sb = await B.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(sb.ok, true);
  const sb2 = await B.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(sb2.fortgesetzt, true); assert.deepEqual(sb2.fragen, sb.fragen);
  warte(30_000); await B.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(sb.fragen, "richtig", 3000) });
  assert.equal((await B.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(sb.fragen, "richtig", 3000) })).code, "duell_schon_gespielt");
  assert.equal((await B.rufe({ aktion: "duell_start", duell: n.duell })).code, "duell_schon_gespielt");
});
await ptest("Ende ohne Start wird abgelehnt (keine Punkte ohne Runde)", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" });
  const ids = duelle().find((d) => d.id === n.duell).fragen;
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(ids, "richtig", 3000) }); assert.equal(e.status, 409); assert.equal(e.code, "duell_nicht_gestartet");
  assert.equal(duelle().find((d) => d.id === n.duell).punkte_ersteller, null);
});

console.log("Server: Limit, Verfall, ausgeblendete Spieler");
await ptest("höchstens 3 laufende Duelle (neu und annehmen); ein beendetes Duell macht Platz", async () => {
  const L = neuerSchueler("Lena Voss"), M = neuerSchueler("Max Brandt"), N = neuerSchueler("Nils Berg");
  const ids = [];
  for (let i = 0; i < 3; i++) { const n = await L.rufe({ aktion: "duell_neu" }); assert.equal(n.ok, true, "Duell " + (i + 1)); ids.push(n.duell); }
  const vier = await L.rufe({ aktion: "duell_neu" }); assert.equal(vier.status, 409); assert.equal(vier.code, "duell_zu_viele");
  assert.equal(duelle().filter((d) => d.ersteller === L.id).length, 3);
  // auch Duelle als Gegner zählen: M hat 3 offene, N nimmt an -> 4. Annahme scheitert nicht (N hat nichts), aber M selbst kann nicht annehmen
  const o = await N.rufe({ aktion: "duell_neu" }); await runde(N, o.duell);
  for (let i = 0; i < 3; i++) { const n = await M.rufe({ aktion: "duell_neu" }); assert.equal(n.ok, true); }
  const nein = await M.rufe({ aktion: "duell_annehmen", duell: o.duell }); assert.equal(nein.status, 409); assert.equal(nein.code, "duell_zu_viele");
  assert.equal(duelle().find((d) => d.id === o.duell).gegner, null, "gescheiterte Annahme darf das Duell nicht belegen");
  // Platz schaffen: L spielt Duell 1 mit M... M hat selbst 3 -> ein anderer Gegner nimmt an
  await runde(L, ids[0]); const P = neuerSchueler("Paul Ernst"); await P.rufe({ aktion: "duell_annehmen", duell: ids[0] }); await runde(P, ids[0]);
  const wieder = await L.rufe({ aktion: "duell_neu" }); assert.equal(wieder.ok, true, "nach einem beendeten Duell ist wieder Platz");
  const u = await L.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.laufend, 3); assert.equal(u.max_laufend, 3);
});
await ptest("Rate-Limit: 30 neue/angenommene Duelle in 10 Minuten -> 429 zu_viele_runden", async () => {
  const R = neuerSchueler("Rita Sommer");
  for (let i = 0; i < 30; i++) duelle().push({ id: "x" + i, erstellt_am: new Date(Date.now()).toISOString(), ersteller: R.id, gegner: "sid-fremd", fragen: Array(8).fill("q01"), status: "fertig", angenommen_am: null, punkte_ersteller: 0, punkte_gegner: 0, fertig_am: new Date().toISOString() });
  const n = await R.rufe({ aktion: "duell_neu" }); assert.equal(n.status, 429); assert.equal(n.code, "zu_viele_runden");
  warte(601_000);
  const spaeter = await R.rufe({ aktion: "duell_neu" }); assert.equal(spaeter.ok, true, "nach 10 Minuten wieder erlaubt");
});
await ptest("ausgeblendet (sichtbar=false): kann keine Herausforderung stellen (niemand sähe sie), kann aber offene annehmen und spielen", async () => {
  const A = neuerSchueler("Mira Kaya"), H = neuerSchueler("Hanna Sehr");
  await H.rufe({ aktion: "profil", sichtbar: false });
  const n = await H.rufe({ aktion: "duell_neu" }); assert.equal(n.status, 403); assert.equal(n.code, "duell_ausgeblendet");
  assert.equal(duelle().filter((d) => d.ersteller === H.id).length, 0);
  const d1 = await A.rufe({ aktion: "duell_neu" }); await runde(A, d1.duell);
  const u = await H.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.sichtbar, false); assert.equal(u.offene.length, 1, "Ausgeblendete dürfen Herausforderungen anderer sehen");
  assert.equal((await H.rufe({ aktion: "duell_annehmen", duell: d1.duell })).ok, true);
  const r = await runde(H, d1.duell, { wie: "falsch" }); assert.equal(r.e.fertig, true); assert.equal(r.e.ergebnis, "niederlage");
  // A sieht den Namen des ausgeblendeten Gegners NICHT
  const ua = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(ua.meine[0].name, null); assert.ok(!/Hanna|Sehr/.test(JSON.stringify(ua)));
});
await ptest("wer sich NACH dem Anlegen ausblendet, verschwindet aus der Liste und kann nicht mehr angenommen werden; Einblenden stellt es wieder her", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 1);
  await A.rufe({ aktion: "profil", sichtbar: false });
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 0);
  const r = await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(r.status, 404); assert.equal(duelle().find((d) => d.id === n.duell).gegner, null);
  await A.rufe({ aktion: "profil", sichtbar: true });
  assert.equal((await B.rufe({ aktion: "duell_annehmen", duell: n.duell })).ok, true);
});
await ptest("gesperrte, archivierte und abgelaufene Konten erscheinen nicht in der Liste", async () => {
  const B = neuerSchueler("Jonas Weber");
  for (const extra of [{ aktiv: false }, { archiviert_am: new Date().toISOString() }]) {
    const X = neuerSchueler("Karl Fremd", extra); const z = { id: "dx" + zaehler, erstellt_am: new Date().toISOString(), ersteller: X.id, gegner: null, fragen: Array(8).fill("q01"), status: "offen", ersteller_gestartet_am: new Date().toISOString(), ersteller_fertig_am: new Date().toISOString(), punkte_ersteller: 100, richtig_ersteller: 1 };
    duelle().push(z); const u = await B.rufe({ aktion: "duell_uebersicht" }); assert.ok(!u.offene.some((o) => o.id === z.id), JSON.stringify(extra));
    const r = await B.rufe({ aktion: "duell_annehmen", duell: "00000000-0000-4000-8000-000000000999" }); assert.equal(r.status, 404);
  }
});
await ptest("Duelle von heute stehen in der Liste mit Alter (neuestes zuerst), höchstens 20", async () => {
  const B = neuerSchueler("Jonas Weber");
  for (let i = 0; i < 25; i++) { const A = neuerSchueler("Spieler " + String.fromCharCode(65 + (i % 26))); const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell, { vor: 6000, ms: 500 }); warte(1000); }
  const u = await B.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.offene.length, 20);
  const zeiten = u.offene.map((o) => o.erstellt_am); assert.deepEqual(zeiten, zeiten.slice().sort().reverse());
});

console.log("Server: gefälschte Antworten und Zeiten");
await ptest("falsche Form der Antworten wird abgelehnt (Länge, Typen, Zahlen außerhalb) - und die Runde bleibt danach spielbar", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" });
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(30_000);
  const gut = antw(s.fragen, "richtig", 3000);
  const kaputt = [
    ["keine Liste", "abc"], ["null", null], ["Objekt", { a: 1 }], ["7 Antworten", gut.slice(0, 7)], ["9 Antworten", [...gut, gut[0]]], ["leer", []],
    ["a = 3", gut.map((x, i) => i === 0 ? { a: 3, ms: 3000 } : x)], ["a = -1", gut.map((x, i) => i === 0 ? { a: -1, ms: 3000 } : x)],
    ["a = Text", gut.map((x, i) => i === 0 ? { a: "1", ms: 3000 } : x)], ["a = 1.5", gut.map((x, i) => i === 0 ? { a: 1.5, ms: 3000 } : x)], ["a fehlt", gut.map((x, i) => i === 0 ? { ms: 3000 } : x)],
    ["ms negativ", gut.map((x, i) => i === 0 ? { a: 0, ms: -5 } : x)], ["ms 21001", gut.map((x, i) => i === 0 ? { a: 0, ms: 21_001 } : x)], ["ms Kommazahl", gut.map((x, i) => i === 0 ? { a: 0, ms: 3000.5 } : x)],
    ["ms Text", gut.map((x, i) => i === 0 ? { a: 0, ms: "3000" } : x)], ["ms fehlt", gut.map((x, i) => i === 0 ? { a: 0 } : x)], ["ms NaN/Infinity", gut.map((x, i) => i === 0 ? { a: 0, ms: 1e999 } : x)],
    ["Eintrag Zahl", gut.map((x, i) => i === 0 ? 1 : x)], ["Eintrag null", gut.map((x, i) => i === 0 ? null : x)], ["Eintrag Liste", gut.map((x, i) => i === 0 ? [1, 3000] : x)],
  ];
  for (const [name, a] of kaputt) { const r = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: a }); assert.equal(r.status, 400, name); assert.ok(["eingabe_fehlt", "ergebnis_ungueltig"].includes(r.code), name + ": " + r.code); }
  assert.equal(duelle().find((d) => d.id === n.duell).ersteller_fertig_am, null, "Ablehnung darf die Runde nicht verbrauchen");
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: gut }); assert.equal(e.ok, true); assert.equal(e.punkte, 1080);
});
await ptest("kein Orakel: abgelehnte Abgaben verraten nie die Lösung", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" }); const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(30_000);
  for (const a of [[], "x", antw(s.fragen, "richtig", -1)]) { const r = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: a }); assert.ok(!/loesung|richtig|"punkte"/i.test(JSON.stringify(r).replace(/"error":"[a-z_]+"|"code":"[a-z_]+"/g, "")), JSON.stringify(r)); }
});
await ptest("Zeiten: sofort abgegeben (unter 5,1 s) -> zu_schnell; mehr Zeit gemeldet als vergangen -> zeit_unmoeglich", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" }); const s = await A.rufe({ aktion: "duell_start", duell: n.duell });
  const sofort = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 800) }); assert.equal(sofort.code, "zu_schnell");
  warte(10_000);
  const luege = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 20_000) }); assert.equal(luege.code, "zeit_unmoeglich");
  const ok = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 1100) }); assert.equal(ok.ok, true, "ehrlich knapp: 8 × 1,1 s in 10 s ist möglich");
});
await ptest("Zeit-Schummelei: viel länger gebraucht als gemeldet -> kein Tempo-Bonus, nur 100 je richtige Antwort; ehrliche Pausen behalten den Bonus", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  let n = await A.rufe({ aktion: "duell_neu" }); const sA = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(300_000);   // 5 Minuten offline nachgedacht
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(sA.fragen, "richtig", 800) }); assert.equal(e.ok, true); assert.equal(e.bonus, false); assert.equal(e.punkte, 800);
  n = await B.rufe({ aktion: "duell_neu" }); const sB = await B.rufe({ aktion: "duell_start", duell: n.duell }); warte(8 * 3000 + 8 * 600 + 2000);   // 3 s je Frage + Pausen + Netz
  const e2 = await B.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(sB.fragen, "richtig", 3000) }); assert.equal(e2.bonus, true); assert.equal(e2.punkte, erwartet(8, 3000));
});
await ptest("Runde zu lange offen: Abgabe nach über 10 Minuten -> runde_abgelaufen; als Ersteller verfällt das Duell, als Gegner zählt die Seite 0 Punkte", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(601_000);
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 3000) }); assert.equal(e.status, 410); assert.equal(e.code, "runde_abgelaufen");
  assert.ok(!duelle().some((d) => d.id === n.duell), "Duell des Erstellers ohne gültige Runde muss verschwinden");
  // Gegner startet und gibt nie ab
  const m = await A.rufe({ aktion: "duell_neu" }); await runde(A, m.duell); await B.rufe({ aktion: "duell_annehmen", duell: m.duell });
  const sb = await B.rufe({ aktion: "duell_start", duell: m.duell }); assert.equal(sb.ok, true); warte(601_000);
  const ua = await A.rufe({ aktion: "duell_uebersicht" });
  const eintrag = ua.meine.find((x) => x.id === m.duell); assert.equal(eintrag.zustand, "fertig"); assert.equal(eintrag.ergebnis, "sieg"); assert.equal(eintrag.punkte_gegner, 0);
  const spaet = await B.rufe({ aktion: "duell_ende", duell: m.duell, antworten: antw(sb.fragen, "richtig", 3000) }); assert.equal(spaet.status, 409); assert.equal(duelle().find((d) => d.id === m.duell).punkte_gegner, 0);
});
await ptest("liegengebliebene Runde des Erstellers: das Duell steht nie als Herausforderung in der Liste", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await A.rufe({ aktion: "duell_start", duell: n.duell });
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 0, "Ersteller ist noch mitten in der Runde");
  warte(601_000); assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 0);
  assert.ok(!duelle().some((d) => d.id === n.duell));
});
await ptest("unbekannte Frage im Duell (Pool später verändert): zählt für beide Seiten als richtig, nichts bricht", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" });
  duelle().find((d) => d.id === n.duell).fragen[7] = "q99";
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(30_000);
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen.map((id) => id === "q99" ? "q01" : id), "falsch", 3000).map((x, i) => i === 7 ? { a: 2, ms: 3000 } : x) });
  assert.equal(e.ok, true); assert.equal(e.richtig, 1); assert.equal(e.loesung[7], -1);
});

console.log("Server: gleichzeitige Aufrufe");
await ptest("Doppelannahme gleichzeitig: genau einer bekommt das Duell, der andere erfährt nur „gibt es nicht“", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber"), C = neuerSchueler("Nora Klein");
  for (let runde_ = 0; runde_ < 5; runde_++) {
    const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
    const [x, y] = await Promise.all([B.rufe({ aktion: "duell_annehmen", duell: n.duell }), C.rufe({ aktion: "duell_annehmen", duell: n.duell })]);
    assert.equal([x, y].filter((r) => r.ok).length, 1, JSON.stringify([x, y])); assert.equal([x, y].filter((r) => r.code === "duell_unbekannt" && r.status === 404).length, 1);
    const d = duelle().find((z) => z.id === n.duell); assert.ok(d.gegner === B.id || d.gegner === C.id); assert.equal(d.status, "angenommen");
    // erledigen, damit A nicht ans Limit kommt
    const gewinner = d.gegner === B.id ? B : C; await runde(gewinner, n.duell);
  }
});
await ptest("gleichzeitig starten: alle bekommen dieselben Fragen, die Uhr startet genau einmal; gleichzeitig abgeben: nur ein Aufruf zählt", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" });
  const st = await Promise.all([1, 2, 3].map(() => A.rufe({ aktion: "duell_start", duell: n.duell }))); assert.equal(st.filter((r) => r.ok).length, 3, JSON.stringify(st)); assert.equal(st.filter((r) => !r.fortgesetzt).length, 1, "genau einer startet die Runde");
  const fragen = st[0].fragen; st.forEach((r) => assert.deepEqual(r.fragen, fragen)); warte(30_000);
  const en = await Promise.all([1, 2, 3].map(() => A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(fragen, "richtig", 3000) }))); assert.equal(en.filter((r) => r.ok).length, 1);
});
await ptest("gleichzeitig neu anlegen am Limit: nie mehr als 3 laufende Duelle", async () => {
  const A = neuerSchueler("Mira Kaya"); await A.rufe({ aktion: "duell_neu" }); await A.rufe({ aktion: "duell_neu" });
  const r = await Promise.all([1, 2, 3, 4].map(() => A.rufe({ aktion: "duell_neu" })));
  assert.ok(duelle().filter((d) => d.ersteller === A.id && d.status !== "fertig").length <= 3, "mehr als 3 laufende Duelle");
  assert.ok(r.filter((x) => x.ok).length <= 1);
});

console.log("Server: Verfall nach 7 Tagen und Aufräumen");
await ptest("offene Duelle verfallen nach 7 Tagen: nicht mehr in der Liste, nicht annehmbar, nicht spielbar; nach 14 Tagen gelöscht", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
  const m = await A.rufe({ aktion: "duell_neu" });   // noch ungespielt
  warte(6.9 * 86_400_000);
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 1, "nach 6,9 Tagen ist es noch offen");
  warte(0.2 * 86_400_000);
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).offene.length, 0, "nach 7,1 Tagen verfallen");
  const r = await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); assert.equal(r.status, 410); assert.equal(r.code, "duell_verfallen");
  assert.equal((await A.rufe({ aktion: "duell_start", duell: m.duell })).code, "duell_verfallen");
  const ua = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(ua.meine.length, 0); assert.equal(ua.laufend, 0, "verfallene Duelle zählen nicht gegen das Limit");
  warte(7 * 86_400_000);
  await A.rufe({ aktion: "duell_uebersicht" }); assert.ok(!duelle().some((d) => d.id === n.duell || d.id === m.duell), "nach 14 Tagen wird gelöscht");
});
await ptest("verfallene Duelle zählen nicht gegen das Limit von 3", async () => {
  const A = neuerSchueler("Mira Kaya");
  for (let i = 0; i < 3; i++) assert.equal((await A.rufe({ aktion: "duell_neu" })).ok, true);
  assert.equal((await A.rufe({ aktion: "duell_neu" })).code, "duell_zu_viele");
  warte(7.1 * 86_400_000);
  for (let i = 0; i < 3; i++) assert.equal((await A.rufe({ aktion: "duell_neu" })).ok, true, "nach dem Verfall ist wieder Platz");
});
await ptest("fertige Duelle werden nach 90 Tagen gelöscht, davor zählen sie zur Bilanz", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell); await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); await runde(B, n.duell, { wie: "falsch" });
  warte(80 * 86_400_000); assert.equal((await A.rufe({ aktion: "duell_uebersicht" })).bilanz.siege, 1);
  warte(11 * 86_400_000); const u = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.bilanz.siege, 0); assert.ok(!duelle().some((d) => d.id === n.duell));
});
await ptest("letzte 20 Duelle in „Deine Duelle“, laufende zuerst; Bilanz zählt alle fertigen der letzten 90 Tage", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  for (let i = 0; i < 24; i++) { const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell, { vor: 6000, ms: 500 }); await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); await runde(B, n.duell, { vor: 6000, ms: 500, wie: i % 2 ? "richtig" : "falsch" }); warte(1000); }
  const n = await A.rufe({ aktion: "duell_neu" });
  const u = await A.rufe({ aktion: "duell_uebersicht" });
  assert.equal(u.meine.length, 20); assert.equal(u.meine[0].zustand, "du_bist_dran"); assert.equal(u.meine[0].id, n.duell);
  assert.equal(u.bilanz.siege + u.bilanz.unentschieden + u.bilanz.niederlagen, 24); assert.equal(u.bilanz.siege, 12); assert.equal(u.bilanz.unentschieden, 12);
});

console.log("Server: Eingaben wie SQL-Injection, Datensparsamkeit");
await ptest("seltsame Duell-IDs und Eingaben werden abgelehnt, nichts passiert in der Datenbank", async () => {
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" });
  duelle().find((d) => d.id === n.duell).id = n.duell = "abcdef12-3456-4789-abcd-ef0123456789";   // echte UUIDs enthalten Buchstaben (Großschreibung wird getestet)
  const vorher = JSON.stringify(duelle()); const tabellen = Object.keys(db).join();
  const bose = ["'; drop table academy_spiele_duelle; --", n.duell + "' or '1'='1", "x".repeat(5000), n.duell.toUpperCase(), n.duell + "\n", " " + n.duell, "%", "*", "__proto__", "constructor", "00000000-0000-4000-8000-000000000001/../x", 12345, true, null, [n.duell], { duell: n.duell }, { "$ne": "" }];
  for (const b of bose) for (const aktion of ["duell_annehmen", "duell_start", "duell_ende"]) {
    const r = await A.rufe({ aktion, duell: b, antworten: antw(["q01", "q02", "q03", "q04", "q05", "q06", "q07", "q08"], "richtig", 3000) });
    assert.equal(r.status, 400, aktion + " " + JSON.stringify(b).slice(0, 40) + " -> " + r.status);   // ungültige Form wird schon vor der Datenbank abgewiesen
    assert.notEqual(r.ok, true);
  }
  assert.equal(JSON.stringify(duelle()), vorher, "Datenbank wurde verändert"); assert.equal(Object.keys(db).join(), tabellen);
  for (const aktion of ["duell_neu ", "duell_", "duell_neu\u0000", "DUELL_NEU", "duell_neu;drop"]) assert.equal((await A.rufe({ aktion })).status, 400, JSON.stringify(aktion));
  // Antworten als SQL-Text
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(30_000);
  const r = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: s.fragen.map(() => ({ a: "0; drop table x", ms: "1 or 1=1" })) }); assert.equal(r.status, 400);
  assert.equal((await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 3000) })).ok, true, "Runde bleibt gültig");
});
await ptest("Namen kommen nie vom Gerät: Schüler-Felder name/anzeigename/ersteller im Aufruf werden ignoriert", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu", name: "HACKER", anzeigename: "Admin", ersteller: B.id, gegner: B.id, status: "fertig", punkte_ersteller: 9999, fragen: Array(8).fill("q01") });
  const d = duelle().find((z) => z.id === n.duell); assert.equal(d.ersteller, A.id); assert.equal(d.gegner, null); assert.equal(d.status, "offen"); assert.equal(d.punkte_ersteller, null); assert.equal(new Set(d.fragen).size, 8, "Fragen kommen vom Server, nicht vom Gerät");
  await runde(A, n.duell); const u = await B.rufe({ aktion: "duell_uebersicht", ich: A.id, schueler_id: A.id }); assert.equal(u.offene[0].name, "Mira K.");
  assert.equal(u.meine.length, 0, "fremde Schüler-ID im Aufruf darf nichts öffnen");
});
await ptest("Datensparsamkeit: Antworten enthalten nur Anzeigenamen (Vorname + 1 Buchstabe), nie Schüler-IDs, Nachnamen, Telefon, Klasse; in der DB keine einzelnen Antworten", async () => {
  const A = neuerSchueler("Mira Kaya", { telefon: "0100-geheim", klasse: "B" }), B = neuerSchueler("Jonas Weber", { telefon: "0200-geheim" });
  const n = await A.rufe({ aktion: "duell_neu" }); const ra = await runde(A, n.duell); await B.rufe({ aktion: "duell_annehmen", duell: n.duell }); const rb = await runde(B, n.duell, { wie: "falsch" });
  const alle = [JSON.stringify(await A.rufe({ aktion: "duell_uebersicht" })), JSON.stringify(await B.rufe({ aktion: "duell_uebersicht" })), JSON.stringify(ra), JSON.stringify(rb)];
  for (const t of alle) { for (const verboten of [A.id, B.id, "Kaya", "Weber", "geheim", "0100", "0200", "tok-"]) assert.ok(!t.includes(verboten), "enthält " + verboten + ": " + t.slice(0, 120)); }
  const ub = JSON.parse(alle[1]); ub.meine.forEach((m) => assert.deepEqual(keys(m).filter((k) => !["erstellt_am", "ergebnis", "fertig_am", "id", "name", "punkte_gegner", "punkte_ich", "richtig_gegner", "richtig_ich", "rolle", "runde_offen", "zustand", "verfaellt_am"].includes(k)), []));
  const d = duelle().find((z) => z.id === n.duell); assert.deepEqual(keys(d).filter((k) => /antwort|ms|zeiten/i.test(k)), [], "einzelne Antworten dürfen nicht gespeichert werden");
});
await ptest("Duelle laufen nicht über die Ranking-Tabellen: academy_spiele_bestwerte/-runden bleiben unberührt; start/ergebnis kennen kein Spiel „duell“", async () => {
  const vorher = JSON.stringify([db.academy_spiele_bestwerte, db.academy_spiele_runden]);
  const A = neuerSchueler("Mira Kaya"); const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell); await A.rufe({ aktion: "duell_uebersicht" });
  assert.equal(JSON.stringify([db.academy_spiele_bestwerte, db.academy_spiele_runden]), vorher);
  const s = await A.rufe({ aktion: "start", spiel: "duell" }); assert.equal(s.status, 400); assert.equal((await A.rufe({ aktion: "rangliste", spiel: "duell" })).status, 400);
});
await ptest("bisherige Aktionen und Spiele arbeiten unverändert (uebersicht, profil, start)", async () => {
  const A = neuerSchueler("Mira Kaya"); const u = await A.rufe({ aktion: "uebersicht" }); assert.equal(u.ok, true); assert.equal(u.anzeigename, "Mira K."); assert.deepEqual(u.bestwerte, {});
  assert.equal((await A.rufe({ aktion: "start", spiel: "ampel" })).ok, true); assert.equal((await A.rufe({ aktion: "gibtesnicht" })).status, 400);
});

console.log("Server: Überarbeitung nach der Sicherheitsprüfung (07.10.2026)");
await pruefe("Request-Body muss ein JSON-Objekt sein: null, Liste, Text, Zahl, true, kaputtes oder leeres JSON -> 400 eingabe_fehlt; {} -> 401 nicht_angemeldet", async () => {
  const roh = async (text) => { const res = await globalThis.__handler(new Request("http://x/", { method: "POST", body: text })); return { status: res.status, ...(await res.json()) }; };
  for (const t of ["null", "[]", '[{"aktion":"duell_uebersicht"}]', '"text"', "5", "true", "{kaputt", ""]) { const r = await roh(t); assert.equal(r.status, 400, JSON.stringify(t)); assert.equal(r.code, "eingabe_fehlt", JSON.stringify(t)); assert.equal(r.error, "eingabe_fehlt"); }
  const leer = await roh("{}"); assert.equal(leer.status, 401); assert.equal(leer.code, "nicht_angemeldet");
});
await mitSchluessel("Fehler im Server: der Client bekommt nur den festen Text (500, voruebergehend), nie die Fehlermeldung - für Duell-Aktionen und die alten Aktionen", async () => {
  const A = neuerSchueler("Mira Kaya");
  const alt = console.error; console.error = () => {};
  try {
    for (const [tabelle, aufruf] of [["academy_spiele_duelle", { aktion: "duell_uebersicht" }], ["academy_spiele_duelle", { aktion: "duell_neu" }], ["academy_spiele_bestwerte", { aktion: "uebersicht" }], ["academy_spiele_runden", { aktion: "start", spiel: "ampel" }]]) {
      const gesichert = db[tabelle]; db[tabelle] = null;
      try {
        const r = await A.rufe(aufruf);
        assert.equal(r.status, 500, tabelle + " " + aufruf.aktion);
        assert.deepEqual(Object.keys(r).sort(), ["code", "error", "status"]);
        assert.equal(r.error, "voruebergehend"); assert.equal(r.code, "voruebergehend");
        assert.ok(!/TypeError|Cannot|null|filter|undefined|at /.test(JSON.stringify(r)), JSON.stringify(r));
      } finally { db[tabelle] = gesichert; }
    }
  } finally { console.error = alt; }
});
await mitSchluessel("Lösungen kommen aus der Tabelle academy_duell_loesungen und bleiben 5 Minuten im Speicher: eine geänderte Zeile wirkt erst danach", async () => {
  db.academy_spiele_duelle = [];
  const A = neuerSchueler("Mira Kaya");
  warte(301_000); await A.rufe({ aktion: "duell_neu" });                               // lädt die Tabelle neu
  const zeile = db.academy_duell_loesungen.find((z) => z.frage_id === "q01"); const alt = zeile.richtig; const neu = (alt + 1) % 3;
  const spiele = async () => {
    const n = await A.rufe({ aktion: "duell_neu" }); const d = duelle().find((x) => x.id === n.duell); d.fragen[0] = "q01";
    const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); warte(30_000);
    const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: s.fragen.map((id, i) => ({ a: i === 0 ? alt : null, ms: 3000 })) }); return e;
  };
  zeile.richtig = neu;
  try {
    const e1 = await spiele(); assert.equal(e1.loesung[0], alt, "innerhalb von 5 Minuten gilt die Kopie im Speicher"); assert.equal(e1.richtig, 1);
    for (const d of duelle()) if (d.ersteller === A.id && d.ersteller_fertig_am) d.status = "fertig";   // Limit freihalten
    warte(301_000);
    const e2 = await spiele(); assert.equal(e2.loesung[0], neu, "nach 5 Minuten wird die Tabelle neu gelesen"); assert.equal(e2.richtig, 0);
  } finally { zeile.richtig = alt; warte(301_000); await A.rufe({ aktion: "duell_neu" }).catch(() => {}); db.academy_spiele_duelle = []; }
});
await ptest("Netzfehler beim Start: duell_start ist für dieselbe Seite wiederholbar, solange die Runde offen ist (dieselben Fragen, dieselbe Uhr); die Übersicht meldet runde_offen", async () => {
  const A = neuerSchueler("Mira Kaya");
  const n = await A.rufe({ aktion: "duell_neu" });
  const s1 = await A.rufe({ aktion: "duell_start", duell: n.duell }); const t0 = duelle()[0].ersteller_gestartet_am; assert.ok(!s1.fortgesetzt);
  warte(30_000); const s2 = await A.rufe({ aktion: "duell_start", duell: n.duell });   // die Antwort auf den ersten Start ging verloren
  assert.equal(s2.ok, true); assert.equal(s2.fortgesetzt, true); assert.deepEqual(s2.fragen, s1.fragen); assert.equal(duelle()[0].ersteller_gestartet_am, t0, "Startzeit bleibt");
  const u = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.meine[0].zustand, "laeuft"); assert.equal(u.meine[0].runde_offen, true);
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s1.fragen, "richtig", 3000) }); assert.equal(e.ok, true); assert.equal(e.punkte, 8 * 135);
  assert.equal((await A.rufe({ aktion: "duell_start", duell: n.duell })).code, "duell_schon_gespielt", "nach der Abgabe keine neue Runde");
});
await ptest("Offene Runde läuft ab: nach 10 Minuten kein Weiterspielen mehr (runde_offen false, Start -> 410 runde_abgelaufen); Duell des Erstellers verfällt, Gegner bekommt 0 Punkte", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await A.rufe({ aktion: "duell_start", duell: n.duell });
  warte(595_000); assert.equal((await A.rufe({ aktion: "duell_uebersicht" })).meine[0].runde_offen, true, "nach 9 Min 55 s noch offen");
  warte(10_000); const u = await A.rufe({ aktion: "duell_uebersicht" });   // das Aufräumen pausiert eine Minute: der Eintrag steht noch da, aber nicht mehr offen
  assert.equal(u.meine[0].zustand, "laeuft"); assert.equal(u.meine[0].runde_offen, false);
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(s.status, 410); assert.equal(s.code, "runde_abgelaufen"); assert.ok(!s.fragen);
  assert.ok(!duelle().some((d) => d.id === n.duell), "Duell des Erstellers ohne gültige Runde verschwindet");
  // Gegner
  const m = await A.rufe({ aktion: "duell_neu" }); await runde(A, m.duell); await B.rufe({ aktion: "duell_annehmen", duell: m.duell });
  await B.rufe({ aktion: "duell_start", duell: m.duell }); warte(601_000);
  const sb = await B.rufe({ aktion: "duell_start", duell: m.duell }); assert.equal(sb.status, 410); assert.equal(sb.code, "runde_abgelaufen");
  const d = duelle().find((x) => x.id === m.duell); assert.equal(d.status, "fertig"); assert.equal(d.punkte_gegner, 0);
});
await ptest("Aufräumen: Duelle mit beiden Ergebnissen, aber Status nicht fertig, werden auf fertig gesetzt (fertig_am gesetzt); höchstens 50 Zeilen je Lauf; höchstens einmal pro Minute", async () => {
  const A = neuerSchueler("Mira Kaya");
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" });                  // Aufräumen läuft jetzt, danach eine Minute Pause
  const jetzt = new Date(Date.now()).toISOString();
  const kaputt = (i) => ({ id: "00000000-0000-4000-8000-0000009" + String(i).padStart(5, "0"), erstellt_am: jetzt, ersteller: "sid-x", gegner: "sid-y", fragen: Array(8).fill("q01"), status: "angenommen", angenommen_am: jetzt, ersteller_gestartet_am: jetzt, ersteller_fertig_am: jetzt, punkte_ersteller: 500, richtig_ersteller: 4, gegner_gestartet_am: jetzt, gegner_fertig_am: jetzt, punkte_gegner: 300, richtig_gegner: 2, fertig_am: null });
  for (let i = 0; i < 60; i++) duelle().push(kaputt(i));
  const fertig = () => duelle().filter((d) => d.status === "fertig").length;
  await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(fertig(), 0, "innerhalb einer Minute wird nicht erneut aufgeräumt");
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(fertig(), 50, "höchstens 50 Zeilen je Lauf");
  duelle().filter((d) => d.status === "fertig").forEach((d) => assert.ok(d.fertig_am, "fertig_am fehlt"));
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(fertig(), 60, "der Rest kommt im nächsten Lauf");
});
await ptest("Aufräumen ist begrenzt: höchstens 50 liegengebliebene Gegner-Runden je Lauf", async () => {
  const A = neuerSchueler("Mira Kaya");
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" });
  const alt = new Date(Date.now() - 700_000).toISOString(), jetzt = new Date(Date.now()).toISOString();
  for (let i = 0; i < 60; i++) duelle().push({ id: "00000000-0000-4000-8000-0000008" + String(i).padStart(5, "0"), erstellt_am: jetzt, ersteller: "sid-x", gegner: "sid-y", fragen: Array(8).fill("q01"), status: "angenommen", angenommen_am: alt, ersteller_gestartet_am: alt, ersteller_fertig_am: alt, punkte_ersteller: 500, richtig_ersteller: 4, gegner_gestartet_am: alt, gegner_fertig_am: null, punkte_gegner: null, richtig_gegner: null, fertig_am: null });
  const erledigt = () => duelle().filter((d) => d.gegner_fertig_am).length;
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(erledigt(), 50);
  warte(61_000); await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(erledigt(), 60);
  assert.ok(duelle().every((d) => d.status === "fertig" && d.punkte_gegner === 0));
});
await ptest("Bremse für duell_uebersicht: 60 Aufrufe in 10 Minuten je Schüler, der 61. wird mit 429 abgelehnt; nach 10 Minuten wieder frei; andere Schüler sind nicht betroffen", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  for (let i = 0; i < 60; i++) assert.equal((await A.rufe({ aktion: "duell_uebersicht" })).ok, true, "Aufruf " + (i + 1));
  const r = await A.rufe({ aktion: "duell_uebersicht" }); assert.equal(r.status, 429); assert.equal(r.code, "zu_viele_runden");
  assert.equal((await B.rufe({ aktion: "duell_uebersicht" })).ok, true);
  warte(601_000); assert.equal((await A.rufe({ aktion: "duell_uebersicht" })).ok, true, "nach 10 Minuten wieder erlaubt");
});
await ptest("Angenommen, aber 24 Stunden nicht gestartet: das Duell geht zurück auf offen (Gegner weg) und kann von anderen angenommen werden; ein gestartetes Duell bleibt beim Gegner", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber"), C = neuerSchueler("Nora Klein");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell);
  const p = await A.rufe({ aktion: "duell_neu" }); await runde(A, p.duell);
  assert.equal((await B.rufe({ aktion: "duell_annehmen", duell: n.duell })).ok, true); assert.equal((await B.rufe({ aktion: "duell_annehmen", duell: p.duell })).ok, true);
  warte(23 * 3_600_000);
  const u = await B.rufe({ aktion: "duell_uebersicht" }); assert.equal(u.meine.filter((x) => x.zustand === "du_bist_dran").length, 2, "nach 23 Stunden gehören beide noch B");
  assert.equal((await B.rufe({ aktion: "duell_start", duell: p.duell })).ok, true);
  warte(2 * 3_600_000);
  const ub = await B.rufe({ aktion: "duell_uebersicht" }); assert.ok(!ub.meine.some((x) => x.id === n.duell), "das nicht gestartete Duell steht nicht mehr bei B");
  const dn = duelle().find((d) => d.id === n.duell); assert.equal(dn.gegner, null); assert.equal(dn.status, "offen"); assert.equal(dn.angenommen_am, null);
  const dp = duelle().find((d) => d.id === p.duell); assert.equal(dp.gegner, B.id, "ein gestartetes Duell wird nie zurückgesetzt"); assert.equal(dp.status, "fertig"); assert.equal(dp.punkte_gegner, 0);
  const r = await B.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(r.status, 404); assert.equal(r.code, "duell_unbekannt");
  const uc = await C.rufe({ aktion: "duell_uebersicht" }); assert.ok(uc.offene.some((o) => o.id === n.duell), "für andere wieder offen");
  assert.equal((await C.rufe({ aktion: "duell_annehmen", duell: n.duell })).ok, true); assert.equal(duelle().find((d) => d.id === n.duell).gegner, C.id);
  assert.equal(ub.laufend, 0, "das zurückgegebene Duell zählt nicht mehr gegen B (und das abgerechnete ist fertig)");
});
await ptest("Angenommen, 24 Stunden vorbei, das Aufräumen pausiert noch: schon der Start-Aufruf verweigert (404) und gibt das Duell zurück", async () => {
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const n = await A.rufe({ aktion: "duell_neu" }); await runde(A, n.duell); assert.equal((await B.rufe({ aktion: "duell_annehmen", duell: n.duell })).ok, true);
  warte(24 * 3_600_000 - 30_000); await B.rufe({ aktion: "duell_uebersicht" });   // Aufräumen läuft (noch nichts zu tun), danach eine Minute Pause
  warte(40_000);
  assert.ok(!(await B.rufe({ aktion: "duell_uebersicht" })).meine.some((x) => x.id === n.duell), "die Übersicht zeigt ein verfallenes Duell nicht mehr als „du bist dran“");
  const r = await B.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(r.status, 404); assert.equal(r.code, "duell_unbekannt");
  const d = duelle().find((x) => x.id === n.duell); assert.equal(d.gegner, null); assert.equal(d.status, "offen");
  const e = await B.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(d.fragen, "richtig", 3000) }); assert.equal(e.status, 404);
});
await ptest("Limit von 3 bei gleichzeitigen Annahmen: nie mehr als 3 laufende; jede nicht erfolgreiche Annahme gibt das Duell wieder offen zurück", async () => {
  const M = neuerSchueler("Max Brandt"), X = neuerSchueler("Xaver Lang"), Y = neuerSchueler("Yara Stein");
  await M.rufe({ aktion: "duell_neu" }); await M.rufe({ aktion: "duell_neu" });
  const o1 = await X.rufe({ aktion: "duell_neu" }); await runde(X, o1.duell); const o2 = await Y.rufe({ aktion: "duell_neu" }); await runde(Y, o2.duell);
  const [r1, r2] = await Promise.all([M.rufe({ aktion: "duell_annehmen", duell: o1.duell }), M.rufe({ aktion: "duell_annehmen", duell: o2.duell })]);
  const laufend = duelle().filter((d) => (d.ersteller === M.id || d.gegner === M.id) && d.status !== "fertig").length; assert.ok(laufend <= 3, "mehr als 3 laufende Duelle: " + laufend);
  for (const [r, o] of [[r1, o1.duell], [r2, o2.duell]]) {
    const d = duelle().find((z) => z.id === o);
    if (r.ok) assert.equal(d.gegner, M.id); else { assert.equal(r.code, "duell_zu_viele"); assert.equal(d.gegner, null); assert.equal(d.status, "offen"); assert.equal(d.angenommen_am, null); }
  }
});
await ptest("Rücknahme beim Limit zerstört nie ein gestartetes Duell: hat der Gegner schon gestartet, bleibt ihm das Duell (Limit großzügig); die Annahme wird als Erfolg gemeldet", async () => {
  const A = neuerSchueler("Mira Kaya"), M = neuerSchueler("Max Brandt");
  await M.rufe({ aktion: "duell_neu" }); await M.rufe({ aktion: "duell_neu" });
  const o = await A.rufe({ aktion: "duell_neu" }); await runde(A, o.duell);
  const zeile = duelle().find((d) => d.id === o.duell); let g = zeile.gegner;
  // Simulation eines gleichzeitigen Aufrufs: sobald M die Zeile annimmt, startet M schon und ein weiteres Duell von M entsteht
  Object.defineProperty(zeile, "gegner", { enumerable: true, configurable: true, get() { return g; }, set(v) {
    g = v;
    if (v) { zeile.gegner_gestartet_am = new Date(Date.now()).toISOString(); duelle().push({ id: "00000000-0000-4000-8000-000000077777", erstellt_am: new Date(Date.now()).toISOString(), ersteller: M.id, gegner: null, fragen: Array(8).fill("q01"), status: "offen", angenommen_am: null, ersteller_gestartet_am: null, ersteller_fertig_am: null, punkte_ersteller: null, richtig_ersteller: null, gegner_gestartet_am: null, gegner_fertig_am: null, punkte_gegner: null, richtig_gegner: null, fertig_am: null }); }
  } });
  const r = await M.rufe({ aktion: "duell_annehmen", duell: o.duell });
  assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(g, M.id, "das gestartete Duell bleibt bei M"); assert.equal(zeile.status, "angenommen"); assert.ok(zeile.gegner_gestartet_am);
});
await ptest("Verfall knapp nach dem Start: wer kurz vor Ablauf der 7 Tage startet, darf seine Runde noch beenden; ein Start NACH dem Ablauf wird abgelehnt", async () => {
  const A = neuerSchueler("Mira Kaya");
  const n = await A.rufe({ aktion: "duell_neu" }); const m = await A.rufe({ aktion: "duell_neu" });
  warte(7 * 86_400_000 - 5 * 60_000);                     // noch 5 Minuten bis zum Verfall
  const s = await A.rufe({ aktion: "duell_start", duell: n.duell }); assert.equal(s.ok, true);
  warte(8 * 60_000);                                      // das Duell ist jetzt verfallen, die Runde läuft noch
  const e = await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: antw(s.fragen, "richtig", 3000) });
  assert.equal(e.ok, true, JSON.stringify(e)); assert.equal(e.richtig, 8); assert.equal(duelle().find((d) => d.id === n.duell).punkte_ersteller, e.punkte);
  const spaet = await A.rufe({ aktion: "duell_start", duell: m.duell }); assert.equal(spaet.status, 410); assert.equal(spaet.code, "duell_verfallen");
});

console.log("\n" + ok + " Prüfungen bestanden" + (process.exitCode ? ", ES GIBT FEHLER" : ""));
