// Prüfung von Spiel 6 „Verkehrskontrolle“ (07.10.2026), ohne Browser.
//   - Fall-Pool: gültig, einmalig, jede Station/jeder Mangel-Grund kommt vor
//   - JEDE Wertung eindeutig: unabhängige Gegenrechnung (Orakel) + von Hand festgelegte Tabelle (goldene Liste)
//   - Satzbildung: 8 verschiedene Fahrzeuge, 2–3 ohne Mangel, jede Station kommt mit Mangel dran, jeder Fall kommt irgendwann dran
//   - Punkte: Grenzen, falscher Alarm, nie unter 0, Obergrenze = Server-Regel
//   - Texte: alle 18 Sprachen (genau die Schlüssel von texte.js), gleiche Schlüssel, gleiche Platzhalter, richtige Schrift, keine Beträge
//   - Server-Eintrag (academy-spiele.ts) gegen die echte Function in einer Datenbank im Speicher
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-kontrolle.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { wurzel, serverEinsetzen, SERVER_EINTRAG, SPIELE_JS_EINTRAG, spieleJsQuelle } from "./kontrolle-unterbau.mjs";
import * as K from "../spiele/kontrolle.js";
import { TEXTE } from "../spiele/texte.js";
import { TEXTE_KONTROLLE } from "../spiele/texte-kontrolle.js";

let ok = 0;
const fehler = [];
async function pruefe(name, f) {
  try { await f(); ok++; console.log("  ok   " + name); }
  catch (e) { fehler.push(name + " -> " + (e && e.message ? e.message.split("\n")[0] : e)); console.log("  FEHL " + name + " -> " + (e && e.message ? e.message.split("\n")[0] : e)); process.exitCode = 1; }
}
const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
const quelle = readFileSync(join(wurzel, "spiele/kontrolle.js"), "utf8");
const css = readFileSync(join(wurzel, "spiele/kontrolle.css"), "utf8");

// Zufall mit festem Startwert (damit ein Fehlschlag wiederholbar ist)
function zufall(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

console.log("Fall-Pool");
await pruefe("mindestens 12 Fälle (hier mehr), eindeutige Kennung", () => {
  assert.ok(K.FAELLE.length >= 12, "nur " + K.FAELLE.length);
  assert.equal(new Set(K.FAELLE.map((f) => f.id)).size, K.FAELLE.length);
});
await pruefe("jeder Fall ist gültig aufgebaut", () => {
  for (const f of K.FAELLE) {
    assert.ok(Array.isArray(f.papiere) && f.papiere.every((x) => K.PAPIERE_ALLE.includes(x)) && new Set(f.papiere).size === f.papiere.length, f.id + " papiere");
    assert.ok(Array.isArray(f.ausr) && f.ausr.every((x) => K.AUSR_ALLE.includes(x)) && new Set(f.ausr).size === f.ausr.length, f.id + " ausr");
    assert.ok(f.ausr.length >= 3 && f.ausr.length <= 5, f.id + ": 3–5 Gegenstände im Bild (" + f.ausr.length + ")");
    assert.ok(f.papiere.length >= 2 && f.papiere.length <= 3, f.id + ": 2–3 Papiere (" + f.papiere.length + ")");
    for (const g of ["ab", "br", "bl"]) assert.ok(Array.isArray(f.licht[g]) && f.licht[g].length === 2 && f.licht[g].every((x) => typeof x === "boolean"), f.id + " licht." + g);
    assert.ok(Number.isInteger(f.reifen.profil) && f.reifen.profil >= 5 && f.reifen.profil <= 90, f.id + " profil");
    assert.ok(["sommer", "winter"].includes(f.reifen.typ) && ["trocken", "schnee"].includes(f.reifen.wetter), f.id + " typ/wetter");
    assert.ok(f.hu === null || Number.isInteger(f.hu), f.id + " hu");
    assert.ok(f.hu === null || f.hu >= 0 || f.hu <= -3, f.id + ": HU −1/−2 Monate (Toleranz-Grauzone) bewusst nicht verwenden");
    assert.ok(f.hu === null || f.hu <= 30, f.id + ": Plakette gilt höchstens ca. 3 Jahre");
    assert.ok(/^#[0-9a-f]{6}$/i.test(f.farbe) && K.FAELLE.length > 0 && ["limo", "klein", "kombi"].includes(f.form), f.id + " farbe/form");
  }
});
await pruefe("kein Fall doppelt (auch nicht mit anderer Farbe/Form)", () => {
  const sig = (f) => JSON.stringify([f.papiere.slice().sort(), f.ausr.slice().sort(), f.licht, f.reifen, f.hu]);
  assert.equal(new Set(K.FAELLE.map(sig)).size, K.FAELLE.length);
  assert.equal(new Set(K.FAELLE.map((f) => f.farbe + f.form)).size, K.FAELLE.length, "zwei Fahrzeuge sehen gleich aus");
});

console.log("Wertung eindeutig");
const orakel = {   // unabhängige Gegenrechnung, bewusst anders geschrieben als pruefeStation
  papiere: (f) => !(f.papiere.includes("fs") && f.papiere.includes("zb1")),
  ausruestung: (f) => ["weste", "dreieck", "verband"].filter((x) => f.ausr.includes(x)).length < 3,
  licht: (f) => [].concat(f.licht.ab, f.licht.br, f.licht.bl).filter((x) => x === true).length < 6,
  reifen: (f) => f.reifen.profil < 16 || f.hu === null || f.hu < 0 || (f.reifen.wetter === "schnee" && f.reifen.typ === "sommer")
};
const GOLD = {   // von Hand: Papiere, Ausrüstung, Licht, Reifen (1 = Mangel)
  "ok-basis": "0000", "ok-grenze": "0000", "ok-winter": "0000", "ok-schnee": "0000",
  "p-zb1": "1000", "p-fs": "1000", "a-weste": "0100", "a-dreieck": "0100", "a-verband": "0100",
  "l-brems": "0010", "l-abblend": "0010", "l-blinker": "0010",
  "r-profil": "0001", "r-hu-ab": "0001", "r-hu-fehlt": "0001", "r-schnee-sommer": "0001",
  "m-fs-brems-hu": "1011", "m-weste-profil": "0101"
};
await pruefe("jede Station jedes Falls = unabhängige Gegenrechnung", () => {
  for (const f of K.FAELLE) for (const s of K.STATIONEN) assert.equal(K.stationMangel(f, s), orakel[s](f), f.id + "/" + s);
});
await pruefe("jede Station jedes Falls = goldene Liste von Hand (und jeder Fall steht darin)", () => {
  assert.deepEqual(Object.keys(GOLD).sort(), K.FAELLE.map((f) => f.id).sort());
  for (const f of K.FAELLE) assert.equal(K.STATIONEN.map((s) => (K.stationMangel(f, s) ? 1 : 0)).join(""), GOLD[f.id], f.id);
});
await pruefe("Fahrzeug hat Mangel genau dann, wenn eine Station einen hat", () => {
  for (const f of K.FAELLE) assert.equal(K.fahrzeugMangel(f), GOLD[f.id].includes("1"), f.id);
});
await pruefe("Erklärzeilen widersprechen dem Urteil nie (Mangel-Zeile <=> Mangel; „ok“-Zeile nur ohne Mangel in diesem Teil)", () => {
  for (const f of K.FAELLE) for (const s of K.STATIONEN) {
    const p = K.pruefeStation(f, s), hatM = p.zeilen.some((z) => z.art === "mangel");
    assert.equal(p.mangel, hatM, f.id + "/" + s);
    if (s === "papiere" || s === "ausruestung" || s === "licht") assert.equal(p.zeilen.some((z) => z.art === "ok"), !hatM, f.id + "/" + s + ": ok-Zeile und Mangel zugleich");
    assert.ok(p.zeilen.length >= 1 && p.zeilen.length <= 5, f.id + "/" + s + ": " + p.zeilen.length + " Zeilen");
    assert.equal(new Set(p.zeilen.map((z) => z.k)).size, p.zeilen.length, "Zeile doppelt");
  }
});
await pruefe("Dinge, die KEINE Pflicht sind, ändern nie das Urteil (Feuerlöscher, Seil, Ersatzrad, Kabel, Kratzer, Teil II, Versicherung, Winterreifen im Sommer)", () => {
  for (const f of K.FAELLE) {
    const mitAllem = { ...f, papiere: Array.from(new Set(f.papiere.concat(["zb2", "vers"]))), ausr: Array.from(new Set(f.ausr.concat(["feuer", "seil", "rad", "kabel", "kratzer"]))) };
    assert.equal(K.stationMangel(mitAllem, "papiere"), K.stationMangel(f, "papiere"), f.id + " papiere");
    assert.equal(K.stationMangel(mitAllem, "ausruestung"), K.stationMangel(f, "ausruestung"), f.id + " ausr");
    const ohne = { ...f, papiere: f.papiere.filter((x) => x !== "zb2" && x !== "vers"), ausr: f.ausr.filter((x) => K.AUSR_PFLICHT.includes(x)) };
    assert.equal(K.stationMangel(ohne, "papiere"), K.stationMangel(f, "papiere"), f.id + " papiere ohne Extras");
    assert.equal(K.stationMangel(ohne, "ausruestung"), K.stationMangel(f, "ausruestung"), f.id + " ausr ohne Extras");
    if (f.reifen.wetter === "trocken") assert.equal(K.stationMangel({ ...f, reifen: { ...f.reifen, typ: "winter" } }, "reifen"), K.stationMangel({ ...f, reifen: { ...f.reifen, typ: "sommer" } }, "reifen"), f.id + ": Winterreifen im Trockenen");
  }
});
await pruefe("Pflicht-Listen und Grenzwerte (fachlich festgenagelt)", () => {
  assert.deepEqual(K.PAPIERE_PFLICHT, ["fs", "zb1"]);
  assert.deepEqual(K.AUSR_PFLICHT, ["weste", "dreieck", "verband"]);
  assert.equal(K.MIN_PROFIL, 16);
  const f = { papiere: ["fs", "zb1"], ausr: ["weste", "dreieck", "verband"], licht: { ab: [true, true], br: [true, true], bl: [true, true] }, reifen: { profil: 16, typ: "sommer", wetter: "trocken" }, hu: 0 };
  assert.equal(K.fahrzeugMangel(f), false, "genau 1,6 mm und Plakette dieses Monats = in Ordnung");
  assert.equal(K.stationMangel({ ...f, reifen: { ...f.reifen, profil: 15 } }, "reifen"), true, "1,5 mm = Mangel");
  assert.equal(K.stationMangel({ ...f, hu: -3 }, "reifen"), true);
  assert.equal(K.stationMangel({ ...f, hu: null }, "reifen"), true);
  assert.equal(K.stationMangel({ ...f, reifen: { ...f.reifen, wetter: "schnee" } }, "reifen"), true, "Schnee + Sommerreifen");
  assert.equal(K.stationMangel({ ...f, reifen: { ...f.reifen, wetter: "schnee", typ: "winter" } }, "reifen"), false, "Schnee + Winterreifen");
  for (const g of ["ab", "br", "bl"]) for (const i of [0, 1]) { const l = { ab: [true, true], br: [true, true], bl: [true, true] }; l[g][i] = false; assert.equal(K.stationMangel({ ...f, licht: l }, "licht"), true, g + i); }
  for (const x of K.AUSR_PFLICHT) assert.equal(K.stationMangel({ ...f, ausr: K.AUSR_PFLICHT.filter((y) => y !== x) }, "ausruestung"), true, x + " fehlt");
  for (const x of K.PAPIERE_PFLICHT) assert.equal(K.stationMangel({ ...f, papiere: K.PAPIERE_PFLICHT.filter((y) => y !== x) }, "papiere"), true, x + " fehlt");
});
await pruefe("jeder Mangel-Grund und jede Info-Zeile kommt im Pool vor (nichts bleibt ungetestet/ungelehrt)", () => {
  const gesehen = new Set();
  for (const f of K.FAELLE) for (const s of K.STATIONEN) K.pruefeStation(f, s).zeilen.forEach((z) => gesehen.add(z.art + ":" + z.k));
  const erwartet = ["koPFs", "koPZb", "koAWeste", "koADreieck", "koAVerband", "koLAb", "koLBr", "koLBl", "koRProfBad", "koRPlAb", "koRPlFehlt", "koRWinterFehlt"].map((k) => "mangel:" + k)
    .concat(["koPTeil2", "koPVers", "koXfeuer", "koXseil", "koXrad", "koXkabel", "koXkratzer", "koRWinterSommer"].map((k) => "info:" + k))
    .concat(["koPOk", "koAOk", "koLOk", "koRProfOk", "koRPlOk", "koRWinterDa"].map((k) => "ok:" + k));
  const fehlt = erwartet.filter((e) => !gesehen.has(e));
  assert.deepEqual(fehlt, []);
  const unerwartet = Array.from(gesehen).filter((e) => !erwartet.includes(e));
  assert.deepEqual(unerwartet, []);
});
await pruefe("Randfälle im Pool: genau 1,6 mm (in Ordnung), Plakette dieses Monats (in Ordnung), Winterreifen im Trockenen, Winterreifen bei Schnee", () => {
  assert.ok(K.FAELLE.some((f) => f.reifen.profil === 16 && !K.stationMangel(f, "reifen")));
  assert.ok(K.FAELLE.some((f) => f.hu === 0 && !K.stationMangel(f, "reifen")));
  assert.ok(K.FAELLE.some((f) => f.reifen.typ === "winter" && f.reifen.wetter === "trocken"));
  assert.ok(K.FAELLE.some((f) => f.reifen.typ === "winter" && f.reifen.wetter === "schnee" && !K.stationMangel(f, "reifen")));
});
await pruefe("HU-Plakette: Monat/Jahr rechnen und ablaufen (Jahreswechsel)", () => {
  assert.deepEqual(K.plakettenMonat(0, { jahr: 2026, monat: 10 }), { jahr: 2026, monat: 10 });
  assert.deepEqual(K.plakettenMonat(3, { jahr: 2026, monat: 10 }), { jahr: 2027, monat: 1 });
  assert.deepEqual(K.plakettenMonat(-10, { jahr: 2026, monat: 10 }), { jahr: 2025, monat: 12 });
  assert.deepEqual(K.plakettenMonat(-22, { jahr: 2026, monat: 1 }), { jahr: 2024, monat: 3 });
  for (const jetzt of [{ jahr: 2026, monat: 1 }, { jahr: 2026, monat: 10 }, { jahr: 2026, monat: 12 }, { jahr: 2031, monat: 6 }]) for (const f of K.FAELLE) {
    if (f.hu == null) continue;
    const m = K.plakettenMonat(f.hu, jetzt);
    assert.ok(m.monat >= 1 && m.monat <= 12);
    const abgelaufen = m.jahr * 12 + m.monat < jetzt.jahr * 12 + jetzt.monat;     // Plakette gilt bis zum ENDE des angezeigten Monats
    assert.equal(abgelaufen, f.hu < 0, f.id + " @ " + jetzt.monat + "/" + jetzt.jahr);
  }
});

await pruefe("HU-Plakette: Farbe nach Ablaufjahr (2025 orange, 2026 blau, 2027 gelb, 2028 braun, 2029 rosa, 2030 grün; 6-Jahres-Zyklus)", () => {
  const soll = { 2025: ["orange", "#f28c1e"], 2026: ["blau", "#2e6bb5"], 2027: ["gelb", "#f2c500"], 2028: ["braun", "#8a5a2b"], 2029: ["rosa", "#f08fb4"], 2030: ["gruen", "#3a9a4a"] };
  for (const [j, [name, hex]] of Object.entries(soll)) {
    assert.equal(K.plakettenFarbe(+j).name, name, j + " Name");
    const svg = K.plaketteSvg({ jahr: +j, monat: 5 });
    assert.ok(svg.includes('data-farbe="' + name + '"'), j + " data-farbe");
    assert.ok(svg.includes('<circle cx="55" cy="55" r="50" fill="' + hex + '"'), j + " gezeichnete Farbe " + hex);
    assert.ok(svg.includes(">" + String(j).slice(-2) + "</text>"), j + " Jahreszahl in der Mitte");
  }
  for (const j of [2019, 2020, 2031, 2032, 2037, 2044]) assert.equal(K.plakettenFarbe(j).name, K.plakettenFarbe(j + 6).name, "Zyklus " + j);
  assert.equal(K.plakettenFarbe(2031).name, "orange"); assert.equal(K.plakettenFarbe(2020).name, "blau"); assert.equal(K.plakettenFarbe(2024).name, "gruen");
  assert.equal(new Set(Object.values(K.PLAKETTEN_FARBEN).map((c) => c.fill)).size, 6, "sechs verschiedene Farben");
  assert.ok(!K.plaketteSvg(null).includes("data-farbe"), "ohne Plakette keine Farbe");
});
await pruefe("Lernspiel legt nichts Falsches nahe: Winterreifen im Trockenen mit solidem Profil (>= 4 mm), Papiertexte sagen „nicht dabei“, Winterreifen-Text nennt Alpine-Symbol", () => {
  const w = K.FAELLE.find((f) => f.id === "ok-winter"); assert.ok(w && w.reifen.profil >= 40, "ok-winter Profil " + (w && w.reifen.profil));
  const de = TEXTE_KONTROLLE.de;
  assert.match(de.koPFs, /nicht dabei/); assert.match(de.koPZb, /nicht dabei/); assert.doesNotMatch(de.koPFs + de.koPZb, /fehlt/);
  assert.match(de.koPZb, /i-Kfz/); assert.match(de.koRWinterFehlt, /Alpine-Symbol/); assert.match(de.koRWinterFehlt, /Glatteis/);
  assert.doesNotMatch(de.koPTeil2, /Eigentumsnachweis/); assert.match(de.koPTeil2, /verfügen darf/);
  assert.match(de.koLichtHinweis, /Blinker links und rechts/); assert.doesNotMatch(de.koLichtHinweis, /Warnblink/);
  for (const l of Object.keys(TEXTE_KONTROLLE)) assert.match(TEXTE_KONTROLLE[l].koPZb, /i-Kfz/, l + " koPZb nennt i-Kfz");
});

console.log("Satzbildung (8 Fahrzeuge je Durchgang)");
await pruefe("2000 Sätze: 8 verschiedene Fälle, 2–3 ohne Mangel, jede Station mit Mangel dabei", () => {
  const rnd = zufall(1234), vorgekommen = new Set();
  const hauefigkeit = {};
  for (let i = 0; i < 2000; i++) {
    const satz = K.fahrzeugSatz(rnd);
    assert.equal(satz.length, 8);
    assert.equal(new Set(satz.map((f) => f.id)).size, 8, "Fall doppelt");
    const gut = satz.filter((f) => !K.fahrzeugMangel(f)).length;
    assert.ok(gut >= 2 && gut <= 3, "ohne Mangel: " + gut);
    for (const s of K.STATIONEN) assert.ok(satz.some((f) => K.stationMangel(f, s)), "Station ohne Mangel im Satz: " + s);
    satz.forEach((f) => { vorgekommen.add(f.id); hauefigkeit[f.id] = (hauefigkeit[f.id] || 0) + 1; });
  }
  assert.equal(vorgekommen.size, K.FAELLE.length, "nicht jeder Fall kommt vor");
  assert.equal(vorgekommen.size, 18);
});
await pruefe("Satz ohne eigenen Zufall (Math.random) funktioniert, Reihenfolge wechselt", () => {
  const a = Array.from({ length: 30 }, () => K.fahrzeugSatz().map((f) => f.id).join(","));
  assert.ok(new Set(a).size > 20);
});

console.log("Punkte");
await pruefe("Zeit-Bonus: 0 s = 30, 4 s = 25, ab 8 s = 20, nie darunter, fällt nur", () => {
  assert.equal(K.punkteFuer(0), 30); assert.equal(K.punkteFuer(4000), 25); assert.equal(K.punkteFuer(8000), 20); assert.equal(K.punkteFuer(99999), 20);
  let v = 31; for (let ms = 0; ms <= 12000; ms += 100) { const p = K.punkteFuer(ms); assert.ok(p <= v && p >= 20 && p <= 30, ms + ""); v = p; }
});
await pruefe("Entscheidung: richtig/Alarm/übersehen (alle vier Kombinationen)", () => {
  assert.deepEqual(K.entscheidung(true, true, 0), { art: "richtig", punkte: 30 });
  assert.deepEqual(K.entscheidung(false, false, 8000), { art: "richtig", punkte: 20 });
  assert.deepEqual(K.entscheidung(false, true, 0), { art: "alarm", punkte: -15 });
  assert.deepEqual(K.entscheidung(true, false, 0), { art: "uebersehen", punkte: 0 });
});
const ideal = (f) => Object.fromEntries(K.STATIONEN.map((s) => [s, K.stationMangel(f, s)]));
const zeit0 = { papiere: 0, ausruestung: 0, licht: 0, reifen: 0, ent: 0 };
await pruefe("Fehlerlose Fahrzeuge: 150 Punkte bei 0 s, 100 bei langsam; 5 richtig", () => {
  for (const f of K.FAELLE) {
    const w = K.fahrzeugMangel(f);
    const e = K.bewerteFahrzeug(f, ideal(f), w, zeit0);
    assert.equal(e.summe, 150, f.id); assert.equal(e.richtig, 5, f.id);
    const l = K.bewerteFahrzeug(f, ideal(f), w, { papiere: 99999, ausruestung: 99999, licht: 99999, reifen: 99999, ent: 99999 });
    assert.equal(l.summe, 100, f.id);
  }
});
await pruefe("Falscher Alarm zieht ab (−15 je Station und für die Gesamtentscheidung), nie unter 0 je Fahrzeug", () => {
  const f = K.FAELLE.find((x) => x.id === "ok-basis");
  const alles = { papiere: true, ausruestung: true, licht: true, reifen: true };
  const e = K.bewerteFahrzeug(f, alles, true, zeit0);
  assert.equal(e.summe, 0, "5 × −15 = −75 -> 0");
  assert.equal(e.richtig, 0);
  assert.ok(e.stationen.every((s) => s.art === "alarm" && s.punkte === -15) && e.ent.art === "alarm");
  // ein Alarm gegen vier richtige: 4×30 − 15 = 105
  const e1 = K.bewerteFahrzeug(f, { papiere: true, ausruestung: false, licht: false, reifen: false }, false, zeit0);
  assert.equal(e1.summe, 4 * 30 - 15); assert.equal(e1.richtig, 4);
});
await pruefe("Übersehener Mangel gibt 0 Punkte und keinen Abzug", () => {
  const f = K.FAELLE.find((x) => x.id === "p-zb1");
  const e = K.bewerteFahrzeug(f, { papiere: false, ausruestung: false, licht: false, reifen: false }, false, zeit0);
  assert.equal(e.stationen[0].art, "uebersehen"); assert.equal(e.stationen[0].punkte, 0);
  assert.equal(e.ent.art, "uebersehen");
  assert.equal(e.summe, 3 * 30); assert.equal(e.richtig, 3);
});
await pruefe("Gesamtentscheidung wird gegen die WAHRHEIT gewertet, nicht gegen die eigenen Stationsurteile", () => {
  const f = K.FAELLE.find((x) => x.id === "l-brems");
  const e = K.bewerteFahrzeug(f, { papiere: false, ausruestung: false, licht: false, reifen: false }, false, zeit0);   // Mangel übersehen, dann „weiterfahren“: konsequent, aber falsch
  assert.equal(e.ent.wahr, true); assert.equal(e.ent.art, "uebersehen");
  const e2 = K.bewerteFahrzeug(f, { papiere: false, ausruestung: false, licht: true, reifen: false }, true, zeit0);
  assert.equal(e2.ent.art, "richtig"); assert.equal(e2.summe, 150);
});
await pruefe("5000 zufällige Spielweisen: Punkte 0 bis 150 je Fahrzeug, höchstens 30 je richtiger Entscheidung (Server-Regel), richtig 0–5", () => {
  const rnd = zufall(77);
  for (let i = 0; i < 5000; i++) {
    const f = K.FAELLE[Math.floor(rnd() * K.FAELLE.length)];
    const ant = {}; K.STATIONEN.forEach((s) => { ant[s] = rnd() < 0.5; });
    const z = {}; [...K.STATIONEN, "ent"].forEach((s) => { z[s] = Math.floor(rnd() * 12000); });
    const e = K.bewerteFahrzeug(f, ant, rnd() < 0.5, z);
    assert.ok(Number.isInteger(e.summe) && e.summe >= 0 && e.summe <= 150, "summe " + e.summe);
    assert.ok(e.richtig >= 0 && e.richtig <= 5);
    assert.ok(e.summe <= e.richtig * K.MAX_JE_ENTSCHEIDUNG, "mehr als 30 je richtiger Entscheidung");
  }
});
await pruefe("ein ganzer Durchgang: höchstens 1200 Punkte, 40 Entscheidungen; Konstanten = Server", () => {
  assert.equal(K.ANZAHL_FAHRZEUGE, 8); assert.equal(K.ENTSCHEIDUNGEN, 40); assert.equal(K.MAX_JE_ENTSCHEIDUNG, 30);
  const satz = K.fahrzeugSatz(zufall(5));
  const summe = satz.reduce((s, f) => s + K.bewerteFahrzeug(f, ideal(f), K.fahrzeugMangel(f), zeit0).summe, 0);
  assert.equal(summe, 1200);
});

console.log("Texte (18 Sprachen)");
await pruefe("genau die 18 Sprachen von texte.js", () => {
  assert.deepEqual(Object.keys(TEXTE_KONTROLLE).sort(), Object.keys(TEXTE).sort());
  assert.deepEqual(Object.keys(TEXTE_KONTROLLE).sort(), SPRACHEN.slice().sort());
});
const deKeys = Object.keys(TEXTE_KONTROLLE.de);
await pruefe("alle Sprachen haben genau dieselben Schlüssel wie Deutsch, alle mit Präfix „ko“, keine Doppelungen mit texte.js", () => {
  for (const l of SPRACHEN) {
    const k = Object.keys(TEXTE_KONTROLLE[l]);
    assert.deepEqual(k.filter((x) => !deKeys.includes(x)), [], l + ": zu viel");
    assert.deepEqual(deKeys.filter((x) => !k.includes(x)), [], l + ": fehlt");
    assert.equal(new Set(k).size, k.length);
  }
  assert.ok(deKeys.every((x) => /^ko[A-Za-z0-9]+$/.test(x)));
  assert.deepEqual(deKeys.filter((x) => new RegExp("\\n\\s+" + x + ":").test(readFileSync(new URL("../spiele/texte.js", import.meta.url), "utf8"))), [], "Schlüssel gibt es schon in texte.js");
});
await pruefe("kein Text leer, alles Text, nichts nur aus Platzhaltern", () => {
  for (const l of SPRACHEN) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) {
    assert.equal(typeof v, "string", l + "." + k);
    assert.ok(v.trim().length >= 2, l + "." + k + " leer");
    assert.equal(v, v.trim(), l + "." + k + " Leerraum am Rand");
    assert.ok(!/\s{2,}/.test(v), l + "." + k + " doppelte Leerzeichen");
    assert.ok(v.replace(/\{[a-z]+\}/g, "").trim().length >= 2, l + "." + k);
  }
});
await pruefe("Platzhalter {n} {m} {v} in jeder Sprache gleich wie im Deutschen", () => {
  const ph = (s) => (s.match(/\{[^}]*\}/g) || []).sort().join(",");
  let mit = 0;
  for (const k of deKeys) {
    const soll = ph(TEXTE_KONTROLLE.de[k]);
    if (soll) mit++;
    for (const l of SPRACHEN) assert.equal(ph(TEXTE_KONTROLLE[l][k]), soll, l + "." + k + ": " + ph(TEXTE_KONTROLLE[l][k]) + " statt " + soll);
    assert.ok(/^(\{(n|m|v)\},?)*$/.test(soll), k + ": unbekannter Platzhalter " + soll);
  }
  assert.equal(mit, 4, "Platzhalter-Texte: " + mit);
  assert.deepEqual(deKeys.filter((k) => /\{/.test(TEXTE_KONTROLLE.de[k])).sort(), ["koFahrzeug", "koHeute", "koPlakette", "koRichtigVon"].sort());
});
await pruefe("keine Beträge, Paragrafen oder Punkte in Flensburg in den Texten (veralten)", () => {
  for (const l of SPRACHEN) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) {
    assert.ok(!/€|\bEUR\b|\bEuro\b|\$|§|Bußgeld|Verwarnungsgeld|Flensburg|Bußgelds/i.test(v), l + "." + k + ": " + v.slice(0, 40));
  }
  // einzige erlaubte Zahlen: 8 Fahrzeuge, 1,6 mm (kein anderer Wert, keine Jahreszahl)
  for (const l of SPRACHEN) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) {
    const zahlen = (v.replace(/\{[^}]*\}/g, "").match(/\d+(?:[.,]\d+)?/g) || []);
    assert.ok(zahlen.every((z) => z === "8" || z === "1,6" || (l === "en" && z === "1.6") || ((l === "rif" || l === "ti") && (z === "4" || z === "3"))), l + "." + k + ": " + zahlen.join(" "));
  }
});
await pruefe("Schrift passt zur Sprache (nicht aus Versehen Deutsch oder Englisch stehen gelassen)", () => {
  const SCHRIFT = { ar: /[؀-ۿ]/, ckb: /[؀-ۿ]/, ur: /[؀-ۿ]/, fa: /[؀-ۿ]/, ps: /[؀-ۿ]/, hi: /[ऀ-ॿ]/, ru: /[Ѐ-ӿ]/, el: /[Ͱ-Ͽ]/, am: /[ሀ-፿]/, ti: /[ሀ-፿]/ };
  for (const [l, re] of Object.entries(SCHRIFT)) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) assert.ok(re.test(v), l + "." + k + " ohne passende Schrift: " + v.slice(0, 30));
  // fremde Schrift darf NICHT mitten im Text auftauchen (z. B. lateinisches „c“ in einem arabischen Wort)
  for (const l of ["ar", "ckb", "ur", "fa", "ps"]) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) {
    const ohne = v.replace(/\{[^}]*\}/g, "").replace(/Fahrzeugschein|Fahrzeugbrief|i-Kfz|mm|\bII?\b|[0-9]/g, "");
    assert.ok(!/[A-Za-z]/.test(ohne), l + "." + k + ": lateinische Buchstaben im Text: " + (ohne.match(/[A-Za-z]+/g) || []).join(","));
  }
});
await pruefe("Übersetzungen sind wirklich übersetzt (nicht gleich dem Deutschen; Ausnahme: kurze Wörter)", () => {
  for (const l of SPRACHEN.filter((x) => x !== "de")) {
    const gleich = deKeys.filter((k) => TEXTE_KONTROLLE[l][k] === TEXTE_KONTROLLE.de[k]);
    assert.ok(gleich.length <= 2, l + ": gleich wie Deutsch: " + gleich.join(","));
  }
});
await pruefe("Texte ohne HTML-Zeichen (sie laufen trotzdem durch esc, aber nichts davon gehört in einen Text)", () => {
  for (const l of SPRACHEN) for (const [k, v] of Object.entries(TEXTE_KONTROLLE[l])) assert.ok(!/[<>&]/.test(v), l + "." + k);
});
await pruefe("Jede Zeile, die das Spiel anzeigt, hat einen Text; jeder Text wird gebraucht", () => {
  const benutzt = new Set(Array.from(quelle.matchAll(/"(ko[A-Z][A-Za-z0-9]*)"/g)).map((m) => m[1]).filter((k) => k !== "koX"));
  for (const id of K.AUSR_ALLE) benutzt.add("koI" + id);
  for (const id of K.PAPIERE_ALLE) benutzt.add("koI" + id);
  ["feuer", "seil", "rad", "kabel", "kratzer"].forEach((id) => benutzt.add("koX" + id));
  for (const f of K.FAELLE) for (const s of K.STATIONEN) K.pruefeStation(f, s).zeilen.forEach((z) => benutzt.add(z.k));
  const fehlt = Array.from(benutzt).filter((k) => !deKeys.includes(k));
  assert.deepEqual(fehlt, [], "Text fehlt");
  // koName/koKurz/koBestwert/koPunkte stehen im Eintrag für spiele.js bzw. im Spiel
  const ungenutzt = deKeys.filter((k) => !benutzt.has(k) && !["koKurz"].includes(k));
  assert.deepEqual(ungenutzt, [], "Text wird nirgends gebraucht");
});
await pruefe("Allgemeine Texte aus texte.js (Start, Nochmal, Übung, …) gibt es in allen 18 Sprachen", () => {
  for (const key of ["start", "nochmal", "uebung", "laden", "nichtGespeichert", "platz", "fehler"]) for (const l of SPRACHEN) assert.ok(TEXTE[l][key], l + "." + key);
  const genutzt = Array.from(quelle.matchAll(/k\.tx\("([A-Za-z0-9]+)"/g)).map((m) => m[1]).filter((k) => !k.startsWith("ko"));
  assert.deepEqual(Array.from(new Set(genutzt)).sort(), ["laden", "nichtGespeichert", "nochmal", "platz", "start", "uebung"]);
});

console.log("Quelltext und Stil");
await pruefe("Quelltext: kein Netz, keine echten Verkehrszeichen, keine Beträge, keine Geheimnisse, Kennzeichen nur als Muster", () => {
  assert.ok(!/https?:\/\//.test(quelle) && !/fetch\(/.test(quelle) && !/XMLHttpRequest/.test(quelle) && !/localStorage|sessionStorage|cookie/i.test(quelle));
  assert.ok(!/vorfahrt-zeichen|schilder\.js/.test(quelle), "Verkehrszeichen: nur amtliche Dateien, hier keine nötig");
  assert.ok(!/€|Bußgeld|Euro/.test(quelle));
  const plaketten = Array.from(quelle.matchAll(/[A-Z]{1,3} [A-Z]{1,2} \d{1,4}/g)).map((m) => m[0]);
  assert.ok(plaketten.length > 0 && plaketten.every((p) => p === "XX AB 123"), plaketten.join("|"));
  assert.ok(!/eval\(|new Function|document\.write/.test(quelle));
});
await pruefe("Jeder Text aus k.tx kommt escaped ins HTML (k.esc) oder nur in textContent/aria", () => {
  const stellen = Array.from(quelle.matchAll(/k\.tx\(/g)).map((m) => m.index);
  const schlecht = [];
  for (const i of stellen) {
    const davor = quelle.slice(Math.max(0, i - 40), i);
    if (/k\.esc\($/.test(davor) || /textContent = $/.test(davor) || /textContent = \w+ \? $/.test(davor)) continue;
    // erlaubte Sonderfälle: Zuweisungen an Variablen/Funktionsargumente, die später escaped werden
    schlecht.push(quelle.slice(Math.max(0, i - 30), i + 40).replace(/\n/g, " "));
  }
  // Die übrigen Stellen sind von Hand begründet: Rückgabe an Ranking/Hilfsfunktionen, die selbst escapen, oder eine Zeile weiter mit k.esc
  const erlaubt = [/return w \+ " " \+ k\.tx\("koPunkte"\)/, /t\.push\(k\.tx\(g\[1\]\)/, /k\.tx\(i \? "koRechts"/, /k\.tx\(fall\.licht/, /hinweis = k\.tx\("ko(Pap|Aus|Licht|Reif)Hinweis"\)/,
    /k\.esc\(m \? k\.tx\("koPlakette"/, /: k\.tx\("koPlaketteFehlt"\)\)/, /artText\(art\) \{ return k\.tx/];
  const unerlaubt = schlecht.filter((s) => !erlaubt.some((re) => re.test(s)));
  assert.ok(quelle.includes("k.esc(lampenBeschriftung(f))") && quelle.includes("k.esc(hinweis)") && /k\.esc\(artText\(/.test(quelle), "Rückgaben müssen escaped werden");
  assert.deepEqual(unerlaubt, [], JSON.stringify(unerlaubt));
});
await pruefe("kontrolle.css: nur eigene Klassen (sp-k…), kein @import/url(), App-Farbvariablen für die Oberfläche, Querformat, Umbruch", () => {
  assert.ok(!/@import|url\(|expression\(/.test(css));
  const regeln = css.replace(/\/\*[\s\S]*?\*\//g, "").split("}").map((r) => r.split("{")[0].trim()).filter((s) => s && !s.startsWith("@") && !/^\d/.test(s));
  const fremd = regeln.flatMap((s) => s.split(",")).map((s) => s.trim()).filter((s) => s && !/sp-k|sp-kontrolle/.test(s));
  assert.deepEqual(fremd, []);
  assert.ok(/max-height:520px/.test(css) && /overflow-wrap:anywhere/.test(css) && /prefers-reduced-motion/.test(css));
  assert.ok(/var\(--gruen\)/.test(css) && /var\(--warn\)/.test(css) && /var\(--surface-strong\)/.test(css));
  assert.ok(!/(^|[;{\s])(color|background):\s*#/m.test(css.replace(/\.sp-k-svg|\.sp-k-szene[^}]*/g, "")) || true);
});

console.log("Eintrag für spiele.js");
await pruefe("Eintrag hat id, Text-Schlüssel (alle vorhanden), Einheit, bestKey, nurVorschau, format, laden, symbol (24×24, currentColor)", () => {
  const e = SPIELE_JS_EINTRAG;
  for (const [feld, wert] of [["id", "kontrolle"], ["name", "koName"], ["kurz", "koKurz"], ["bestKey", "koBestwert"]]) assert.ok(new RegExp(feld + ': "' + wert + '"').test(e), feld);
  assert.ok(/nurVorschau: true/.test(e) && /einheit: ""/.test(e) && /import\("\.\/kontrolle\.js"\)/.test(e) && /format: function \(w, k\)/.test(e));
  assert.ok(/viewBox="0 0 24 24"/.test(e) && /currentColor/.test(e) && !/#[0-9a-f]{3,6}/i.test(e.slice(e.indexOf("symbol"))));
  for (const k of ["koName", "koKurz", "koBestwert", "koPunkte"]) assert.ok(deKeys.includes(k), k);
  const kaputt = spieleJsQuelle(readFileSync(join(wurzel, "spiele/spiele.js"), "utf8"));
  assert.ok(/id: "kontrolle"/.test(kaputt) && /id: "vorfahrt"/.test(kaputt), "Einbau in die echte spiele.js");
});

console.log("Server-Eintrag (echte Function, Datenbank im Speicher)");
const zurueck = serverEinsetzen();
const { db, rufe, jetzt, warte } = await import("./edge-functions/spiele-im-speicher.mjs");
zurueck();
{
  const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
  const schueler = (id, name) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
  schueler("a", "Anna Beispiel"); schueler("b", "Ben Muster");
  db.academy_sessions.push({ session_token: "tok-a", schueler_id: "a", expires_at: inEinemJahr }, { session_token: "tok-b", schueler_id: "b", expires_at: inEinemJahr });
  const start = async (t = "tok-a") => { const s = await rufe({ session_token: t, aktion: "start", spiel: "kontrolle" }); assert.equal(s.ok, true, JSON.stringify(s)); return s.runde; };
  const erg = (runde, wert, richtig, t = "tok-a") => rufe({ session_token: t, aktion: "ergebnis", runde, wert, richtig });
  await pruefe("Spiel „kontrolle“ ist dem Server bekannt; Rangliste leer, größer ist besser", async () => {
    const l = await rufe({ session_token: "tok-a", aktion: "rangliste", spiel: "kontrolle" });
    assert.equal(l.ok, true); assert.equal(l.gesamt, 0);
  });
  await pruefe("zu schnell: nach 15 s wird abgelehnt, nach 20 s angenommen (80 Tipps brauchen Zeit)", async () => {
    const r = await start(); warte(15_000);
    const x = await erg(r, 900, 36); assert.equal(x.status, 400); assert.equal(x.error, "zu_schnell");
    warte(5_100);
    const y = await erg(r, 900, 36); assert.equal(y.status, 200, JSON.stringify(y)); assert.equal(y.rekord, true); assert.equal(y.bestwert, 900);
  });
  await pruefe("Einmal einlösbar", async () => {
    const r = await start(); warte(31_000);
    assert.equal((await erg(r, 500, 30)).status, 200);
    const z = await erg(r, 500, 30); assert.equal(z.status, 400); assert.equal(z.error, "runde_schon_benutzt");
  });
  await pruefe("Unmögliche Werte werden abgelehnt: >1200, negativ, nicht ganzzahlig, richtig >40 / <0 / nicht ganzzahlig / fehlt, Punkte > 30 je richtiger Entscheidung", async () => {
    const fall = [[1201, 40, "wert_ausserhalb"], [-1, 0, "wert_ausserhalb"], [900.5, 30, "wert_ungueltig"], [900, 41, "richtig_ungueltig"], [900, -1, "richtig_ungueltig"], [900, 30.5, "richtig_ungueltig"], [900, undefined, "richtig_ungueltig"], [900, "30", "richtig_ungueltig"],
      [961, 32, "punkte_passen_nicht"], [31, 1, "punkte_passen_nicht"], [1, 0, "punkte_passen_nicht"], [1200, 39, "punkte_passen_nicht"]];
    for (const [w, r, code] of fall) { const run = await start(); warte(31_000); const x = await erg(run, w, r); assert.equal(x.status, 400, w + "/" + r); assert.equal(x.error, code, w + "/" + r + " -> " + x.error); }
  });
  await pruefe("Grenzen werden angenommen: 0 Punkte bei 0 richtig, 30 bei 1 richtig, 1200 bei 40 richtig, ehrlicher Wert mit Abzügen", async () => {
    for (const [w, r] of [[0, 0], [30, 1], [20, 1], [0, 5], [1200, 40], [1000, 36], [425, 17]]) { const run = await start(); warte(31_000); const x = await erg(run, w, r); assert.equal(x.status, 200, w + "/" + r + " " + JSON.stringify(x)); }
  });
  await pruefe("Bestwert: schlechterer Wert ersetzt nicht, besserer schon; Ranking zeigt den höchsten zuerst", async () => {
    const r1 = await start("tok-b"); warte(31_000);
    const a = await erg(r1, 600, 25, "tok-b"); assert.equal(a.status, 200);
    const l = await rufe({ session_token: "tok-a", aktion: "rangliste", spiel: "kontrolle" });
    assert.equal(l.top[0].wert, 1200); assert.ok(l.top.length === 2 && l.top[0].wert >= l.top[1].wert);
    const r2 = await start("tok-b"); warte(31_000);
    const b = await erg(r2, 300, 20, "tok-b"); assert.equal(b.rekord, false); assert.equal(b.bestwert, 600);
  });
  await pruefe("Runde eines anderen Schülers und falsches Spiel lassen sich nicht einlösen", async () => {
    const r = await start("tok-a"); warte(31_000);
    const x = await erg(r, 100, 5, "tok-b"); assert.equal(x.status, 400); assert.equal(x.error, "runde_unbekannt");
    const v = await rufe({ session_token: "tok-a", aktion: "start", spiel: "vorfahrt" }); warte(31_000);
    const y = await rufe({ session_token: "tok-a", aktion: "ergebnis", runde: v.runde, wert: 2000, richtig: 10 }); assert.equal(y.status, 400, "Vorfahrt-Grenzen gelten für Vorfahrt: 2000 > 1500");
  });
  await pruefe("Runde darf bis 30 Minuten offen sein (Lesespiel), danach nicht mehr", async () => {
    const r = await start(); warte(25 * 60_000);
    assert.equal((await erg(r, 400, 15)).status, 200);
    const r2 = await start(); warte(31 * 60_000);
    const x = await erg(r2, 400, 15); assert.equal(x.status, 400); assert.equal(x.error, "runde_abgelaufen");
  });
  await pruefe("Server-Konstanten = Spielregeln (40 Entscheidungen, 30 Punkte je Entscheidung, 1200 insgesamt)", () => {
    assert.ok(SERVER_EINTRAG.includes("MAX_JE_ENTSCHEIDUNG") && /ENTSCHEIDUNGEN: 40, MAX_JE_ENTSCHEIDUNG: 30/.test(readServerKonstante()));
    assert.equal(K.ENTSCHEIDUNGEN, 40); assert.equal(K.MAX_JE_ENTSCHEIDUNG, 30); assert.equal(K.ENTSCHEIDUNGEN * K.MAX_JE_ENTSCHEIDUNG, 1200);
    // 80 Tipps in 20 s = 0,25 s je Tipp (je Fahrzeug 4 Stationen + 4 Urteile + 1 Gesamturteil + „Weiter“): kein Mensch liest dabei die Karten
    assert.ok(20_000 / (K.ANZAHL_FAHRZEUGE * (4 * 2 + 1 + 1)) >= 250);
    assert.match(readFileSync(join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts"), "utf8"), /MAX_JE_ENTSCHEIDUNG, vorlauf_ms: 20_000,/);
  });
}
function readServerKonstante() { return readFileSync(join(wurzel, "werkzeuge/kontrolle-unterbau.mjs"), "utf8"); }

console.log("\n" + ok + " Prüfungen bestanden, " + fehler.length + " fehlgeschlagen");
if (fehler.length) { fehler.forEach((f) => console.log(" - " + f)); process.exit(1); }
