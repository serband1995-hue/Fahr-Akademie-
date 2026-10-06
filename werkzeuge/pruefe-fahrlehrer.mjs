// Prüfung des Fahrlehrer-Simulators (Spiel 5) OHNE Browser: reine Rechnung, Szenarien-Pool, Texte in allen 18 Sprachen, Server-Eintrag.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-fahrlehrer.mjs
//   (Der Server-Teil lädt die echte Function academy-spiele.ts gegen die Datenbank im Speicher; Unterbau: werkzeuge/fahrlehrer-server.mjs)
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as F from "../spiele/fahrlehrer.js";
import { TEXTE_FAHRLEHRER } from "../spiele/texte-fahrlehrer.js";
import { TEXTE, RTL } from "../spiele/texte.js";
import { ladeServer, SERVER_KONSTANTE, SERVER_EINTRAG } from "./fahrlehrer-server.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
let ok = 0;
const pruefe = async (name, f) => { try { await f(); ok++; console.log("  ok   " + name); } catch (e) { console.log("  FEHL " + name + "\n       " + e.message); process.exitCode = 1; } };

// Zufallsquelle mit festem Startwert (reproduzierbar)
const lcg = (seed) => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const SPRACHEN = Object.keys(TEXTE);     // die 18 Sprachen der App (aus spiele/texte.js)
const UI_SCHLUESSEL = ["flName", "flKurz", "flBestwert", "flNeu", "flBereit", "flLegende", "flRunde", "flSchritt", "flPunkte", "flFrage1", "flFrage2", "flRichtig", "flFalsch",
  "flZeitAus", "flWeiter", "flErgebnisZeigen", "flRichtigVon", "flHinweis", "flLabelFehler", "flLabelAnweisung", "flLabelRegel"];
const platzhalter = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join(",");

console.log("Spielregeln (Rechnung)");
await pruefe("Punkte: 75 bei 0 ms, 50 ab BONUS_MS, dazwischen fallend, immer ganze Zahl 50–75", () => {
  assert.equal(F.punkteFuer(0), F.PUNKTE_MAX);
  assert.equal(F.punkteFuer(F.BONUS_MS), F.PUNKTE_MIN);
  assert.equal(F.punkteFuer(F.LIMIT_MS), F.PUNKTE_MIN);
  assert.equal(F.PUNKTE_MIN, 50); assert.equal(F.PUNKTE_MAX, 75);
  let davor = Infinity;
  for (let ms = 0; ms <= F.LIMIT_MS; ms += 50) { const p = F.punkteFuer(ms); assert.ok(Number.isInteger(p) && p >= 50 && p <= 75, "ms " + ms + " -> " + p); assert.ok(p <= davor); davor = p; }
});
await pruefe("8 Runden à 2 Fragen, Höchstpunktzahl 1200", () => {
  assert.equal(F.ANZAHL_RUNDEN, 8); assert.equal(F.FRAGEN_JE_RUNDE, 2);
  assert.equal(F.MAX_PUNKTE, 8 * 2 * 75); assert.equal(F.MAX_PUNKTE, 1200);
});
await pruefe("Zeiten: Limit je Frage > Bonusfenster, Pause kurz", () => { assert.ok(F.LIMIT_MS > F.BONUS_MS); assert.ok(F.PAUSE_MS >= 500 && F.PAUSE_MS <= 2000); });

console.log("Szenarien-Pool");
await pruefe("mindestens 14 Szenarien, eindeutige Ids und Textschlüssel", () => {
  assert.ok(F.SZENARIEN.length >= 14, "nur " + F.SZENARIEN.length);
  assert.equal(new Set(F.SZENARIEN.map((s) => s.id)).size, F.SZENARIEN.length);
  const alle = F.SZENARIEN.flatMap((s) => F.schluesselVon(s));
  assert.equal(new Set(alle).size, alle.length, "doppelter Textschlüssel im Pool");
  assert.ok(F.ANZAHL_RUNDEN <= F.SZENARIEN.length);
});
await pruefe("jedes Szenario hat eine Zeichnung (Szene mit Inhalt)", () => {
  const k = { esc: (s) => String(s), zahl: (n) => String(n) };
  for (const s of F.SZENARIEN) {
    const svg = F.szeneSvg(s.id, k, "x");
    assert.ok(svg.length > 600 && svg.includes("<rect") && svg.includes("</svg>"), s.id + ": Szene fehlt/leer");
    assert.ok((svg.match(/<g transform=/g) || []).length >= 2, s.id + ": weniger als 2 Fahrzeuge/Personen");
  }
});
await pruefe("Zeichnungen: Verkehrszeichen nur aus verkehr/vorfahrt-zeichen/ und die Dateien gibt es", () => {
  const k = { esc: (s) => String(s), zahl: (n) => String(n) };
  let gesamt = 0;
  for (const s of F.SZENARIEN) {
    const svg = F.szeneSvg(s.id, k, "x");
    for (const m of svg.matchAll(/<image href="([^"]+)"/g)) {
      gesamt++;
      const pfad = fileURLToPath(m[1]).slice(wurzel.length);
      assert.ok(/\/verkehr\/vorfahrt-zeichen\/z[0-9-]+\.svg$/.test(pfad), s.id + ": fremde Bilddatei " + pfad);
      assert.ok(existsSync(join(wurzel, pfad)), s.id + ": Datei fehlt " + pfad);
    }
    assert.ok(!/<text[^>]*>\s*(STOP|30|50|100)\s*</.test(svg), s.id + ": Zeichen selbst als Text gezeichnet");
  }
  assert.ok(gesamt >= 5, "erwartet: mehrere amtliche Zeichen in den Szenen, gefunden " + gesamt);
});
await pruefe("genau EINE richtige Antwort je Frage, in jeder Mischung (3000 Mischungen je Frage), richtige steht an allen Plätzen", () => {
  const rnd = lcg(7);
  for (const s of F.SZENARIEN) for (const g of [s.fehler, s.korrektur]) {
    assert.equal(g.falsch.length, 2);
    const plaetze = new Set();
    for (let i = 0; i < 3000; i++) {
      const a = F.antwortenFuer(g, rnd);
      assert.equal(a.length, 3);
      assert.equal(a.filter((x) => x.richtig).length, 1, s.id);
      assert.equal(new Set(a.map((x) => x.schluessel)).size, 3);
      assert.equal(a.find((x) => x.richtig).schluessel, g.richtig);
      plaetze.add(a.findIndex((x) => x.richtig));
    }
    assert.equal(plaetze.size, 3, s.id + ": richtige Antwort steht nicht an allen Plätzen");
  }
});
await pruefe("Ziehen: 8 verschiedene Szenarien, kein Szenario doppelt, über viele Durchgänge kommt jedes dran", () => {
  const rnd = lcg(42), gesehen = new Map();
  for (let i = 0; i < 2000; i++) {
    const z = F.ziehe(F.ANZAHL_RUNDEN, rnd);
    assert.equal(z.length, 8);
    assert.equal(new Set(z.map((s) => s.id)).size, 8, "Szenario doppelt im Durchgang");
    z.forEach((s) => gesehen.set(s.id, (gesehen.get(s.id) || 0) + 1));
  }
  assert.equal(gesehen.size, F.SZENARIEN.length);
  const erwartet = 2000 * 8 / F.SZENARIEN.length;
  for (const [id, n] of gesehen) assert.ok(n > erwartet * 0.85 && n < erwartet * 1.15, id + " kommt " + n + "-mal vor, erwartet ca. " + Math.round(erwartet));
});
await pruefe("Mischen verliert nichts und verändert die Eingabe nicht", () => {
  const a = [1, 2, 3, 4, 5], kopie = a.slice();
  const m = F.mischen(a, lcg(3));
  assert.deepEqual(a, kopie); assert.deepEqual(m.slice().sort(), kopie);
});

console.log("Texte in allen 18 Sprachen");
await pruefe("Sprachen: TEXTE_FAHRLEHRER hat genau die 18 Sprachen der App", () => {
  assert.equal(SPRACHEN.length, 18);
  assert.deepEqual(Object.keys(TEXTE_FAHRLEHRER).sort(), SPRACHEN.slice().sort());
});
const erwarteteSchluessel = UI_SCHLUESSEL.concat(F.SZENARIEN.flatMap((s) => F.schluesselVon(s)));
await pruefe("alle Schlüssel (UI + Pool) sind in Deutsch da, keine überzähligen", () => {
  const de = Object.keys(TEXTE_FAHRLEHRER.de);
  for (const key of erwarteteSchluessel) assert.ok(de.includes(key), "fehlt in de: " + key);
  for (const key of de) assert.ok(erwarteteSchluessel.includes(key), "unbenutzt in de: " + key);
});
for (const sp of SPRACHEN) {
  await pruefe(sp + ": alle Schlüssel da, nichts leer, Platzhalter wie in Deutsch, keine Reste von Schlüsselnamen", () => {
    const t = TEXTE_FAHRLEHRER[sp];
    assert.deepEqual(Object.keys(t).sort(), Object.keys(TEXTE_FAHRLEHRER.de).sort());
    for (const key of Object.keys(TEXTE_FAHRLEHRER.de)) {
      assert.equal(typeof t[key], "string", sp + "." + key);
      assert.ok(t[key].trim().length >= 2, sp + "." + key + " leer/zu kurz");
      assert.equal(platzhalter(t[key]), platzhalter(TEXTE_FAHRLEHRER.de[key]), sp + "." + key + ": Platzhalter anders");
      assert.ok(!/\bfl[A-Z]\w*/.test(t[key]), sp + "." + key + ": Schlüsselname im Text");
    }
    for (const key of ["flRunde", "flSchritt", "flRichtigVon"]) assert.ok(t[key].includes("{n}"), sp + "." + key + " ohne {n}");
    for (const key of ["flRunde", "flRichtigVon"]) assert.ok(t[key].includes("{m}"), sp + "." + key + " ohne {m}");
  });
  if (sp !== "de") await pruefe(sp + ": nicht einfach Deutsch kopiert (Antworttexte unterscheiden sich von de)", () => {
    const t = TEXTE_FAHRLEHRER[sp], de = TEXTE_FAHRLEHRER.de;
    const gleich = Object.keys(de).filter((key) => t[key] === de[key]);
    assert.equal(gleich.length, 0, "unverändert deutsch: " + gleich.slice(0, 5).join(","));
  });
  await pruefe(sp + ": je Frage drei verschiedene Antworten", () => {
    const t = TEXTE_FAHRLEHRER[sp];
    for (const s of F.SZENARIEN) for (const g of [s.fehler, s.korrektur]) {
      const texte = [g.richtig].concat(g.falsch).map((key) => t[key]);
      assert.equal(new Set(texte).size, 3, sp + " " + s.id + ": zwei gleiche Antworten");
    }
  });
}
await pruefe("Schriften ohne Lateinbuchstaben (ar, ckb, hi, ur, fa, ps, am, ti): nur km/h, m, StVO erlaubt", () => {
  for (const sp of ["ar", "ckb", "hi", "ur", "fa", "ps", "am", "ti"]) {
    for (const [key, text] of Object.entries(TEXTE_FAHRLEHRER[sp])) {
      const rest = text.replace(/\bkm\/h\b|\bStVO\b|\{[a-z]+\}|\bm\b/g, "");
      assert.ok(!/[A-Za-z]/.test(rest), sp + "." + key + ": Lateinbuchstaben im Text: " + (rest.match(/[A-Za-z]+/) || [])[0]);
    }
  }
});
await pruefe("keine Bußgeldbeträge und keine Euro-Angaben in den Texten", () => {
  for (const [sp, t] of Object.entries(TEXTE_FAHRLEHRER)) for (const [key, text] of Object.entries(t)) assert.ok(!/€|\bEUR\b|\beuro\b|\bPunkte in Flensburg\b/i.test(text), sp + "." + key);
});
await pruefe("Fachzahlen in der Begründung: 1,5 m / 2 m (Rad), 50 m bei 100 km/h, 30 km/h, 100 km/h stehen in jeder Sprache", () => {
  for (const [sp, t] of Object.entries(TEXTE_FAHRLEHRER)) {
    assert.match(t.flS06x, /1[.,]5 m/, sp + " flS06x 1,5 m"); assert.match(t.flS06x, /\b2 m/, sp + " flS06x 2 m");
    assert.match(t.flS03x, /50 m/, sp + " flS03x 50 m"); assert.match(t.flS03k1, /50 m/, sp + " flS03k1 50 m");
    assert.match(t.flS11x, /30 km\/h/, sp + " flS11x 30 km/h"); assert.match(t.flS11k1, /30 km\/h/, sp + " flS11k1");
    assert.match(t.flS12, /100 km\/h/, sp + " flS12 100");
    assert.match(t.flS06k1, /1[.,]5 m/, sp + " flS06k1"); assert.match(t.flS06k1, /\b2 m/, sp + " flS06k1 2 m");
    for (const key of ["flS03", "flS03e1", "flS03k1", "flS03k2", "flS03x"]) assert.ok(!/\b(5|10|15|25) ?m\b/.test(t[key].replace(/50 m/g, "")), sp + " " + key + ": falsche Metergröße");
  }
});
await pruefe("keine doppelten Schlüssel in der Textdatei (je Sprachblock)", () => {
  const q = readFileSync(join(wurzel, "spiele", "texte-fahrlehrer.js"), "utf8");
  const bloecke = q.split(/\n  (?=[a-z]{2,3}: \{)/).slice(1);
  assert.equal(bloecke.length, 18);
  for (const b of bloecke) {
    const sp = b.slice(0, b.indexOf(":"));
    const keys = [...b.matchAll(/^    (fl\w+): "/gm)].map((m) => m[1]);
    assert.equal(keys.length, new Set(keys).size, sp + ": doppelter Schlüssel");
    assert.equal(keys.length, Object.keys(TEXTE_FAHRLEHRER.de).length, sp + ": Zeilenzahl " + keys.length);
  }
});
await pruefe("Texte lassen sich mit der App zusammenführen: nur Schlüssel mit Präfix fl, keine Kollision mit texte.js", () => {
  for (const sp of SPRACHEN) for (const key of Object.keys(TEXTE_FAHRLEHRER[sp])) { assert.ok(key.startsWith("fl")); assert.ok(!(key in TEXTE[sp]) || key.startsWith("fl") === false, sp + "." + key + " gibt es schon in texte.js"); }
  for (const key of ["start", "nochmal", "uebung", "nichtGespeichert", "platz", "laden", "du", "rankingTitel"]) for (const sp of SPRACHEN) assert.ok(TEXTE[sp][key], sp + " fehlt Rahmen-Text " + key);
});
await pruefe("RTL-Sprachen der App: ar, ckb, ur, fa, ps", () => assert.deepEqual(RTL.slice().sort(), ["ar", "ckb", "fa", "ps", "ur"]));

console.log("Server-Eintrag „fahrlehrer“ (echte Function, Datenbank im Speicher)");
const S = await ladeServer();
const { db, rufe, warte } = S;
const inEinerStunde = new Date(Date.now() + 3_600_000).toISOString();
db.academy_schueler.push({ id: "a", name: "Vorname a", aktiv: true, ablauf_am: new Date(Date.now() + 30 * 86_400_000).toISOString(), schule_id: null, archiviert_am: null });
db.academy_sessions.push({ session_token: "tok-a", schueler_id: "a", expires_at: inEinerStunde });
const A = (o) => ({ session_token: "tok-a", ...o });
const neueRunde = async () => { db.academy_spiele_runden = []; const r = await rufe(A({ aktion: "start", spiel: "fahrlehrer" })); assert.equal(r.status, 200); return r.runde; };

await pruefe("Zahlen im Server-Eintrag = Zahlen des Spiels (16 Teile, 50, 75, Höchstwert 1200)", () => {
  const m = /TEILE: (\d+), MIN_PUNKTE: (\d+), MAX_PUNKTE: (\d+)/.exec(S.quelle);
  assert.ok(m, "Konstanten nicht gefunden");
  assert.equal(+m[1], F.ANZAHL_RUNDEN * F.FRAGEN_JE_RUNDE); assert.equal(+m[2], F.PUNKTE_MIN); assert.equal(+m[3], F.PUNKTE_MAX);
  assert.ok(SERVER_KONSTANTE.includes(m[0]));
  assert.ok(/max: FAHRLEHRER\.TEILE \* FAHRLEHRER\.MAX_PUNKTE/.test(S.quelle));
});
await pruefe("Runde starten für „fahrlehrer“ klappt, unbekanntes Spiel nicht", async () => {
  const r = await rufe(A({ aktion: "start", spiel: "fahrlehrer" })); assert.equal(r.status, 200); assert.ok(r.runde);
  const u = await rufe(A({ aktion: "start", spiel: "fahrlehrer2" })); assert.equal(u.status, 400);
});
await pruefe("gültiges Ergebnis: 12 richtig, 780 Punkte, nach genug Zeit -> gespeichert, Rekord, Platz", async () => {
  const runde = await neueRunde(); warte(20_000);
  const r = await rufe(A({ aktion: "ergebnis", runde, wert: 780, richtig: 12 }));
  assert.equal(r.status, 200); assert.equal(r.rekord, true); assert.equal(r.bestwert, 780); assert.equal(r.platz, 1);
});
await pruefe("Grenzen: 16 richtig mit 800 (Minimum) und 1200 (Maximum) gehen, 0 richtig mit 0 geht", async () => {
  for (const [w, r] of [[800, 16], [1200, 16], [0, 0], [50, 1], [75, 1]]) {
    const runde = await neueRunde(); warte(20_000);
    const x = await rufe(A({ aktion: "ergebnis", runde, wert: w, richtig: r }));
    assert.equal(x.status, 200, w + "/" + r + " -> " + JSON.stringify(x));
  }
});
const abgelehnt = async (name, wert, richtig, fehler, extra) => pruefe("abgelehnt: " + name, async () => {
  const runde = await neueRunde(); warte(20_000);
  const body = A({ aktion: "ergebnis", runde, wert, ...(richtig === undefined ? {} : { richtig }), ...(extra || {}) });
  const x = await rufe(body);
  assert.equal(x.status, 400, JSON.stringify(x)); assert.equal(x.error, fehler);
});
await abgelehnt("richtig fehlt", 600, undefined, "richtig_ungueltig");
await abgelehnt("richtig = 17 (mehr Teile als es gibt)", 900, 17, "richtig_ungueltig");
await abgelehnt("richtig negativ", 0, -1, "richtig_ungueltig");
await abgelehnt("richtig keine ganze Zahl", 500, 10.5, "richtig_ungueltig");
await abgelehnt("richtig als Text", 500, "10", "richtig_ungueltig");
await abgelehnt("zu viele Punkte für 10 richtig (751)", 751, 10, "punkte_passen_nicht");
await abgelehnt("zu wenige Punkte für 10 richtig (499)", 499, 10, "punkte_passen_nicht");
await abgelehnt("Punkte ohne richtige Antwort (0 richtig, 1 Punkt)", 1, 0, "punkte_passen_nicht");
await abgelehnt("Wert über dem Höchstwert (1201)", 1201, 16, "wert_ausserhalb");
await abgelehnt("negativer Wert", -5, 0, "wert_ausserhalb");
await pruefe("abgelehnt: zu schnell (Ergebnis nach 3 s statt mindestens 12 s)", async () => {
  const runde = await neueRunde(); warte(3_000);
  const x = await rufe(A({ aktion: "ergebnis", runde, wert: 700, richtig: 12 }));
  assert.equal(x.status, 400); assert.equal(x.error, "zu_schnell");
});
await pruefe("abgelehnt: zweites Einlösen derselben Runde; Runde zu lange offen (über 30 min)", async () => {
  const runde = await neueRunde(); warte(20_000);
  assert.equal((await rufe(A({ aktion: "ergebnis", runde, wert: 700, richtig: 12 }))).status, 200);
  const zwei = await rufe(A({ aktion: "ergebnis", runde, wert: 700, richtig: 12 })); assert.equal(zwei.error, "runde_schon_benutzt");
  const spaet = await neueRunde(); warte(31 * 60_000);
  const x = await rufe(A({ aktion: "ergebnis", runde: spaet, wert: 700, richtig: 12 })); assert.equal(x.error, "runde_abgelaufen");
});
await pruefe("Runde eines anderen Spiels zählt nach DEREN Regeln (Ampel-Runde landet nie als „fahrlehrer“)", async () => {
  db.academy_spiele_runden = [];
  const r = await rufe(A({ aktion: "start", spiel: "ampel" })); warte(20_000);
  await rufe(A({ aktion: "ergebnis", runde: r.runde, wert: 777, richtig: 16 }));
  assert.equal(db.academy_spiele_bestwerte.filter((b) => b.spiel === "fahrlehrer" && b.wert === 777).length, 0);
});
await pruefe("Rangliste „fahrlehrer“: größer ist besser", async () => {
  db.academy_schueler.push({ id: "b", name: "Zweite B", aktiv: true, ablauf_am: new Date(Date.now() + 30 * 86_400_000).toISOString(), schule_id: null, archiviert_am: null });
  db.academy_sessions.push({ session_token: "tok-b", schueler_id: "b", expires_at: inEinerStunde });
  db.academy_spiele_runden = [];
  const r = await rufe({ session_token: "tok-b", aktion: "start", spiel: "fahrlehrer" }); warte(20_000);
  const e = await rufe({ session_token: "tok-b", aktion: "ergebnis", runde: r.runde, wert: 1150, richtig: 16 });
  assert.equal(e.platz, 2);   // „a“ hat vorher 1200 erreicht
  const l = await rufe(A({ aktion: "rangliste", spiel: "fahrlehrer", limit: 10 }));
  const werte = l.top.map((z) => z.wert);
  assert.deepEqual(werte, werte.slice().sort((x, y) => y - x));
  assert.equal(l.top[0].wert, 1200); assert.equal(l.top[1].wert, 1150);
});

console.log("\n" + ok + " Prüfungen bestanden" + (process.exitCode ? ", es gab FEHLER" : ""));
// Hinweis für den Hauptagenten: der Eintrag steht hier als SERVER_KONSTANTE / SERVER_EINTRAG (werkzeuge/fahrlehrer-server.mjs).
void SERVER_EINTRAG;
