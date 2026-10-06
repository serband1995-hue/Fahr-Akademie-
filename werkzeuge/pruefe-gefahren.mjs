// Prüfung von Spiel 7 „Gefahren finden“ (07.10.2026), ohne Browser.
//   - Bildpool: genug Bilder, je Bild 4–6 Gefahren, Gefahrenpunkte liegen im Bild (samt Markierung), überlappen sich nicht,
//     Tippziele groß genug; jede Gefahr hat Name + Erklärung; amtliche Zeichen nur aus verkehr/vorfahrt-zeichen/
//   - Treffer-Rechnung (nächste Gefahr, Mindestradius aus Pixeln) und Punkterechnung (Grenzfälle, Höchstwerte)
//   - Texte: alle 18 Sprachen, gleiche Schlüssel, gleiche Platzhalter, nichts leer, lateinische Ziffern, kein Schlüssel ungenutzt/fehlend
//   - Server-Eintrag: Function mit dem Eintrag gegen die Datenbank im Speicher (ehrliche Läufe angenommen, unmögliche abgelehnt);
//     danach „Prüfung der Prüfung“: absichtlich fehlerhafte Einträge müssen auffallen.
// Aufruf: node --experimental-strip-types werkzeuge/pruefe-gefahren.mjs
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { db, warte } from "./edge-functions/spiele-im-speicher.mjs";
import * as G from "../spiele/gefahren.js";
import { TEXTE } from "../spiele/texte.js";
import { TEXTE_GEFAHREN } from "../spiele/texte-gefahren.js";
import { RTL } from "../spiele/texte.js";
import { serverMitEintrag, SERVER_KONSTANTE, SERVER_EINTRAG, SPIELE_EINTRAG, wurzel } from "./gefahren-testbasis.mjs";

let bestanden = 0, fehler = 0;
function pruefe(name, bedingung, detail) {
  if (bedingung) { bestanden++; if (process.env.LEISE !== "1") console.log("  ok   " + name); }
  else { fehler++; console.log("  FEHL " + name + (detail ? " -> " + detail : "")); process.exitCode = 1; }
}
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ===================== Bildpool ===================== */
console.log("Bildpool");
pruefe("mindestens 6 Bilder", G.BILDER.length >= 6, String(G.BILDER.length));
pruefe("Bilder haben eindeutige Namen", new Set(G.BILDER.map((b) => b.id)).size === G.BILDER.length);
for (const b of G.BILDER) {
  const n = b.gefahren.length;
  pruefe(b.id + ": " + G.MIN_JE_BILD + "–" + G.MAX_JE_BILD + " Gefahren (" + n + ")", n >= G.MIN_JE_BILD && n <= G.MAX_JE_BILD);
  pruefe(b.id + ": Gefahren-IDs eindeutig", new Set(b.gefahren.map((g) => g.id)).size === n);
  const ausserhalb = b.gefahren.filter((g) => !(g.x - g.r >= 0 && g.x + g.r <= G.BILD_B && g.y - g.r >= 0 && g.y + g.r <= G.BILD_H));
  pruefe(b.id + ": Trefferflächen liegen ganz im Bild", ausserhalb.length === 0, ausserhalb.map((g) => g.id).join(","));
  // Markierung: Ring (Radius 21) und Nummernscheibe (Mitte +15/−15, Radius 8) müssen im Bild liegen
  const markeRaus = b.gefahren.filter((g) => g.x - 21 < 0 || g.x + 23 > G.BILD_B || g.y - 23 < 0 || g.y + 21 > G.BILD_H);
  pruefe(b.id + ": Ring und Nummer liegen im Bild", markeRaus.length === 0, markeRaus.map((g) => g.id).join(","));
  const klein = b.gefahren.filter((g) => !(g.r >= 24));
  pruefe(b.id + ": Trefferradius mindestens 24 Bildeinheiten", klein.length === 0, klein.map((g) => g.id).join(","));
  const ueber = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = b.gefahren[i], c = b.gefahren[j];
    if (Math.hypot(a.x - c.x, a.y - c.y) < a.r + c.r) ueber.push(a.id + "/" + c.id);
  }
  pruefe(b.id + ": Trefferflächen überlappen sich nicht", ueber.length === 0, ueber.join(" "));
  const ringe = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = b.gefahren[i], c = b.gefahren[j];
    if (Math.hypot(a.x - c.x, a.y - c.y) < 2 * 24) ringe.push(a.id + "/" + c.id);   // Markierungen (Ring + Nummer) nicht ineinander
  }
  pruefe(b.id + ": Markierungen überlappen sich nicht", ringe.length === 0, ringe.join(" "));
  pruefe(b.id + ": Name-Schlüssel vorhanden", !!TEXTE_GEFAHREN.de[b.name], b.name);
  pruefe(b.id + ": Zeichnung ist SVG-Text ohne Skripte", typeof b.svgInnen === "string" && b.svgInnen.length > 500 && !/<script|onload|onclick|javascript:/i.test(b.svgInnen));
  // Bilder aus fremden Quellen sind verboten: nur Dateien aus verkehr/vorfahrt-zeichen
  const hrefs = [...b.svgInnen.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const fremd = hrefs.filter((h) => !/\/verkehr\/vorfahrt-zeichen\/z[0-9-]+\.svg$/.test(h));
  pruefe(b.id + ": eingebundene Zeichen nur aus verkehr/vorfahrt-zeichen/", fremd.length === 0, fremd.join(" "));
  hrefs.forEach((h) => pruefe(b.id + ": Zeichen-Datei vorhanden " + h.split("/").pop(), existsSync(join(wurzel, "verkehr/vorfahrt-zeichen", h.split("/").pop()))));
}
const typen = G.GEFAHR_TYPEN;
pruefe("jede Gefahrenart hat Name und Erklärung in Deutsch", typen.every((t) => TEXTE_GEFAHREN.de[G.gefahrTitel(t)] && TEXTE_GEFAHREN.de[G.gefahrText(t)]), typen.join(","));
pruefe("alle Zeichen aus QUELLEN.md genannt", (() => {
  const q = readFileSync(join(wurzel, "verkehr/vorfahrt-zeichen/QUELLEN.md"), "utf8");
  return G.BILDER.every((b) => [...b.svgInnen.matchAll(/vorfahrt-zeichen\/(z[0-9-]+\.svg)/g)].every((m) => q.includes(m[1])));
})());

/* ===================== Auswahl der Bilder ===================== */
console.log("Auswahl");
let zahl = 0; const rnd = () => ((zahl = (zahl * 1664525 + 1013904223) % 4294967296) / 4294967296);
let allesGut = true, gesehen = new Set();
for (let i = 0; i < 300; i++) {
  const w = G.waehleBilder(rnd);
  if (w.length !== G.BILDER_JE_RUNDE || new Set(w.map((b) => b.id)).size !== w.length) allesGut = false;
  w.forEach((b) => gesehen.add(b.id));
}
pruefe("jede Runde: 4 verschiedene Bilder", allesGut);
pruefe("über viele Runden kommen alle Bilder vor", gesehen.size === G.BILDER.length);
pruefe("Reihenfolge wird gemischt", new Set(Array.from({ length: 40 }, () => G.waehleBilder(rnd).map((b) => b.id).join())).size > 10);

/* ===================== Treffer ===================== */
console.log("Treffer-Rechnung");
const bsp = [{ id: "a", x: 100, y: 100, r: 27 }, { id: "b", x: 160, y: 100, r: 27 }];
pruefe("Tipp genau auf Gefahr trifft", G.treffer(bsp, 100, 100, 0).id === "a");
pruefe("Tipp am Rand der Fläche trifft", G.treffer(bsp, 100 + 27, 100, 0).id === "a");
pruefe("Tipp knapp außerhalb trifft nicht", G.treffer(bsp, 100 + 27.5, 100, 0) === null);
pruefe("Tipp im leeren Bild trifft nicht", G.treffer(bsp, 300, 200, 0) === null);
pruefe("liegt der Tipp nahe an zwei Flächen, gewinnt die nähere", G.treffer([{ id: "a", x: 100, y: 100, r: 40 }, { id: "b", x: 130, y: 100, r: 40 }], 118, 100, 0).id === "b");
pruefe("... auch wenn die nähere Gefahr zuerst in der Liste steht", G.treffer([{ id: "b", x: 130, y: 100, r: 40 }, { id: "a", x: 100, y: 100, r: 40 }], 118, 100, 0).id === "b");
pruefe("Mindestradius aus Pixeln vergrößert kleine Flächen", G.treffer([{ id: "a", x: 100, y: 100, r: 10 }], 125, 100, 30).id === "a" && G.treffer([{ id: "a", x: 100, y: 100, r: 10 }], 125, 100, 0) === null);
for (const b of G.BILDER) for (const g of b.gefahren) {
  pruefe(b.id + "/" + g.id + ": Mitte trifft genau diese Gefahr", G.treffer(b.gefahren, g.x, g.y, 0).id === g.id);
}

pruefe("Mindest-Trefferradius mindestens 22 px (Tippziel 44 px)", G.MIN_RADIUS_PX >= 22);
for (const b of G.BILDER) for (const g of b.gefahren) {
  // kleinstes Handy: Bild ca. 288 px breit -> Trefferradius in px = max(r * 288/360, MIN_RADIUS_PX)
  pruefe(b.id + "/" + g.id + ": auf 320-px-Handy mindestens 44 px breit", Math.max(g.r * 288 / G.BILD_B, G.MIN_RADIUS_PX) * 2 >= 44);
}

/* ===================== Punkte ===================== */
console.log("Punkterechnung");
const P = G.punkteBild;
pruefe("0 gefunden, 0 Fehler = 0", P(0, 0, 20000, false) === 0);
pruefe("3 gefunden ohne Bonus = 300", P(3, 0, 20000, false) === 300);
pruefe("Fehltipp zieht 30 ab", P(3, 2, 0, false) === 240);
pruefe("ein Bild nie unter 0", P(1, 5, 0, false) === 0 && P(0, 3, 0, false) === 0);
pruefe("alle gefunden: 2 je volle übrige Sekunde (20,9 s = 40)", P(5, 0, 20900, true) === 500 + 40);
pruefe("alle gefunden mit 30 s übrig = Höchstbonus 60", P(5, 0, 30000, true) === 500 + 60 && G.BONUS_MAX === 60);
pruefe("negative Restzeit gibt keinen Bonus", P(4, 0, -5, true) === 400);
pruefe("Bonus nur bei allen Gefahren", P(4, 0, 25000, false) === 400);
pruefe("Konstanten wie beschrieben", G.ZEIT_MS === 30000 && G.STRAFE_MS === 2000 && G.PKT_GEFAHR === 100 && G.ABZUG_TIPP === 30 && G.BILDER_JE_RUNDE === 4);
pruefe("MAX_PUNKTE = 2640, MAX_GEFUNDEN = 24, MAX_FEHLTIPPS = 60", G.MAX_PUNKTE === 2640 && G.MAX_GEFUNDEN === 24 && G.MAX_FEHLTIPPS === 60);
const hoechstes = G.BILDER.map((b) => P(b.gefahren.length, 0, 30000, true)).sort((a, b) => b - a).slice(0, 4).reduce((s, x) => s + x, 0);
pruefe("echter Höchstwert einer Runde (" + hoechstes + ") liegt unter dem Server-Höchstwert", hoechstes <= G.MAX_PUNKTE);
// ein Bild kann nie mehr Strafzeit sammeln als 15 Fehltipps (15 * 2 s = 30 s)
pruefe("höchstens 15 Fehltipps je Bild", Math.floor(G.ZEIT_MS / G.STRAFE_MS) === 15);

/* ===================== Texte ===================== */
console.log("Texte");
const SPRACHEN = Object.keys(TEXTE);
pruefe("18 Sprachen in texte.js", SPRACHEN.length === 18, SPRACHEN.join(","));
pruefe("Sprachen von texte-gefahren.js = Sprachen von texte.js", gleich(Object.keys(TEXTE_GEFAHREN).sort(), SPRACHEN.slice().sort()));
const schluessel = Object.keys(TEXTE_GEFAHREN.de);
pruefe("alle Schlüssel mit Präfix ge", schluessel.every((s) => s.startsWith("ge")));
pruefe("kein Schlüssel kollidiert mit bestehenden Texten", schluessel.every((s) => !(s in TEXTE.de)), schluessel.filter((s) => s in TEXTE.de).join(","));
const platzhalter = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join("");
for (const sp of SPRACHEN) {
  const t = TEXTE_GEFAHREN[sp];
  const fehlt = schluessel.filter((s) => !(s in t)), zuviel = Object.keys(t).filter((s) => !(s in TEXTE_GEFAHREN.de));
  pruefe(sp + ": alle " + schluessel.length + " Schlüssel, keine fremden", fehlt.length === 0 && zuviel.length === 0, "fehlt: " + fehlt.join(",") + " zuviel: " + zuviel.join(","));
  const leer = schluessel.filter((s) => typeof t[s] !== "string" || !t[s].trim());
  pruefe(sp + ": nichts leer", leer.length === 0, leer.join(","));
  const pf = schluessel.filter((s) => platzhalter(String(t[s])) !== platzhalter(TEXTE_GEFAHREN.de[s]));
  pruefe(sp + ": Platzhalter wie Deutsch", pf.length === 0, pf.map((s) => s + " " + platzhalter(String(t[s])) + "≠" + platzhalter(TEXTE_GEFAHREN.de[s])).join(" | "));
  const ziffern = schluessel.filter((s) => /[٠-٩۰-۹०-९]/.test(String(t[s])));
  pruefe(sp + ": nur lateinische Ziffern", ziffern.length === 0, ziffern.join(","));
  const kaputt = schluessel.filter((s) => /[{}]|undefined|NaN|\\n|<|>/.test(String(t[s]).replace(/\{(n|m|v)\}/g, "")));
  pruefe(sp + ": keine kaputten Platzhalter / Markup", kaputt.length === 0, kaputt.join(","));
  if (sp !== "de" && sp !== "en") {
    const gleichDe = schluessel.filter((s) => t[s] === TEXTE_GEFAHREN.de[s] && !/^geB[0-9]$/.test(s));
    pruefe(sp + ": nicht einfach Deutsch kopiert", gleichDe.length === 0, gleichDe.join(","));
  }
  if (RTL.includes(sp)) pruefe(sp + ": enthält Schrift von rechts nach links", /[֐-ࣿ]/.test(t.geBereit));
}
// Schlüssel im Code <-> Schlüssel in den Texten
const code = readFileSync(join(wurzel, "spiele/gefahren.js"), "utf8");
const imCode = new Set([...code.matchAll(/k\.tx\("(ge[A-Za-z0-9_]*)"/g)].map((m) => m[1]));
const fest = new Set();
G.BILDER.forEach((b) => { fest.add(b.name); b.gefahren.forEach((g) => { fest.add(G.gefahrTitel(g.typ)); fest.add(G.gefahrText(g.typ)); }); });
const ohneText = [...imCode].filter((s) => !(s in TEXTE_GEFAHREN.de));
pruefe("jeder im Code benutzte Textschlüssel existiert", ohneText.length === 0, ohneText.join(","));
const imEintrag = new Set([...SPIELE_EINTRAG.matchAll(/(?:name|kurz|bestKey): "(ge[A-Za-z0-9_]*)"|k\.tx\("(ge[A-Za-z0-9_]*)"/g)].map((m) => m[1] || m[2]));
const unbenutzt = schluessel.filter((s) => !imCode.has(s) && !fest.has(s) && !imEintrag.has(s));
pruefe("kein Text ohne Verwendung", unbenutzt.length === 0, unbenutzt.join(","));
const andere = [...code.matchAll(/k\.tx\("([A-Za-z0-9_]+)"/g)].map((m) => m[1]).filter((s) => !s.startsWith("ge") && !(s in TEXTE.de));
pruefe("geteilte Schlüssel aus texte.js vorhanden (start, nochmal, uebung …)", andere.length === 0, andere.join(","));
// Fachlich wichtige Zahlen müssen in jeder Sprache gleich vorkommen
for (const sp of SPRACHEN) pruefe(sp + ": Überholabstand 1,5 m steht im Radfahrer-Text", /1[.,]5/.test(TEXTE_GEFAHREN[sp].geH_radfahrer_x), TEXTE_GEFAHREN[sp].geH_radfahrer_x);
for (const sp of SPRACHEN) pruefe(sp + ": Aufgabentext nennt 30 Sekunden und 4 Bilder", /30/.test(TEXTE_GEFAHREN[sp].geBereit) && /4/.test(TEXTE_GEFAHREN[sp].geBereit));
pruefe("keine Bußgelder / Euro in den Texten", SPRACHEN.every((sp) => schluessel.every((s) => !/€|euro|eur\b|bußgeld|bussgeld|fine\b|punkte in flensburg/i.test(TEXTE_GEFAHREN[sp][s]))));

/* ===================== Server-Eintrag ===================== */
console.log("Server-Eintrag");
const konst = Object.fromEntries([...SERVER_KONSTANTE.match(/const GEFAHREN = \{([^}]*)\}/)[1].matchAll(/([A-Z_]+): (\d+)/g)].map((m) => [m[1], +m[2]]));
pruefe("Zahlen im Server = Zahlen im Spiel", konst.BILDER === G.BILDER_JE_RUNDE && konst.MIN_JE_BILD === G.MIN_JE_BILD && konst.MAX_JE_BILD === G.MAX_JE_BILD &&
  konst.PKT === G.PKT_GEFAHR && konst.ABZUG === G.ABZUG_TIPP && konst.BONUS_MAX === G.BONUS_MAX && konst.FEHL_JE_BILD === G.ZEIT_MS / G.STRAFE_MS, JSON.stringify(konst));

const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
function aufbau() {
  db.academy_schueler.length = 0; db.academy_sessions.length = 0; db.academy_spiele_bestwerte.length = 0; db.academy_spiele_profil.length = 0;
  db.academy_schueler.push({ id: "t", name: "Test Schüler", aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
  db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
}
/* Alle Fälle gegen eine Function; gibt die Liste der Abweichungen zurück */
async function serverFaelle(rufe) {
  const abw = [];
  aufbau();
  const t = (o) => ({ session_token: "tok-t", ...o });
  async function lauf(body, optionen) {
    db.academy_spiele_runden.length = 0;
    const s = await rufe(t({ aktion: "start", spiel: "gefahren" }));
    if (!s.runde) return { status: 0, error: "kein Start: " + JSON.stringify(s) };
    if (!(optionen && optionen.zuSchnell)) warte((optionen && optionen.warte) || 9000);
    const r = await rufe(t({ aktion: "ergebnis", runde: s.runde, ...body }));
    return { ...r, runde: s.runde };
  }
  const ok = async (name, body) => { const r = await lauf(body); if (r.status !== 200) abw.push("sollte angenommen werden: " + name + " -> " + r.error); };
  const nein = async (name, body, fehlerName, opt) => { const r = await lauf(body, opt); if (r.status === 200 || (fehlerName && r.error !== fehlerName)) abw.push("sollte abgelehnt werden (" + fehlerName + "): " + name + " -> " + (r.status === 200 ? "angenommen" : r.error)); };

  await ok("nichts gefunden", { wert: 0, gefunden: 0, fehltipps: 0, vollstaendig: 0 });
  await ok("ein Treffer", { wert: 100, gefunden: 1, fehltipps: 0, vollstaendig: 0 });
  await ok("echter Höchstwert 17 Gefahren, 4 Bilder voll, 30 s übrig", { wert: 1700 + 240, gefunden: 17, fehltipps: 0, vollstaendig: 4 });
  await ok("ehrlich: 17 gefunden, 3 Fehltipps, 2 Bilder voll mit Bonus 50", { wert: 1700 - 90 + 50, gefunden: 17, fehltipps: 3, vollstaendig: 2 });
  await ok("theoretisches Maximum", { wert: 2640, gefunden: 24, fehltipps: 0, vollstaendig: 4 });
  await ok("viele Fehltipps drücken auf 0 (Bild nie negativ)", { wert: 0, gefunden: 2, fehltipps: 60, vollstaendig: 0 });
  await ok("untere Grenze genau", { wert: 940, gefunden: 10, fehltipps: 2, vollstaendig: 0 });
  { const r = await lauf({ wert: 700, gefunden: 7, fehltipps: 0, vollstaendig: 0 }, { warte: 10 * 60_000 }); if (r.status !== 200) abw.push("ehrliche Runde nach 10 Minuten (Lesen der Erklärungen) abgelehnt: " + r.error); }
  await ok("obere Grenze genau mit Bonus", { wert: 560, gefunden: 5, fehltipps: 0, vollstaendig: 1 });

  await nein("über dem Höchstwert", { wert: 2641, gefunden: 24, fehltipps: 0, vollstaendig: 4 }, "wert_ausserhalb");
  await nein("negativer Wert", { wert: -1, gefunden: 0, fehltipps: 0, vollstaendig: 0 }, "wert_ausserhalb");
  await nein("Wert keine ganze Zahl", { wert: 100.5, gefunden: 1, fehltipps: 0, vollstaendig: 0 }, "wert_ungueltig");
  await nein("25 Gefahren", { wert: 100, gefunden: 25, fehltipps: 0, vollstaendig: 4 }, "gefunden_ungueltig");
  await nein("gefunden fehlt", { wert: 100, fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("gefunden als Text", { wert: 100, gefunden: "1", fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("gefunden negativ", { wert: 0, gefunden: -1, fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("5 volle Bilder", { wert: 100, gefunden: 20, fehltipps: 0, vollstaendig: 5 }, "vollstaendig_ungueltig");
  await nein("volles Bild, aber weniger als 4 Gefahren", { wert: 100, gefunden: 3, fehltipps: 0, vollstaendig: 1 }, "vollstaendig_ungueltig");
  await nein("2 volle Bilder mit nur 7 Gefahren", { wert: 100, gefunden: 7, fehltipps: 0, vollstaendig: 2 }, "vollstaendig_ungueltig");
  await nein("vollstaendig fehlt", { wert: 100, gefunden: 1, fehltipps: 0 }, "vollstaendig_ungueltig");
  await nein("61 Fehltipps", { wert: 0, gefunden: 0, fehltipps: 61, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps negativ", { wert: 100, gefunden: 1, fehltipps: -1, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps keine ganze Zahl", { wert: 100, gefunden: 1, fehltipps: 0.5, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps fehlt", { wert: 100, gefunden: 1, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("zu viele Punkte für 5 Gefahren ohne volles Bild", { wert: 501, gefunden: 5, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("Bonus ohne volles Bild geschwindelt", { wert: 560, gefunden: 5, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("mehr als 60 Bonus je volles Bild", { wert: 561, gefunden: 5, fehltipps: 0, vollstaendig: 1 }, "punkte_zu_hoch");
  await nein("Punkte für Gefahren ohne Fund", { wert: 1000, gefunden: 0, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("weniger Punkte als möglich (Fehltipps stimmen nicht)", { wert: 939, gefunden: 10, fehltipps: 2, vollstaendig: 0 }, "punkte_zu_niedrig");
  await nein("zu schnell (Runde eben erst begonnen)", { wert: 100, gefunden: 1, fehltipps: 0, vollstaendig: 0 }, "zu_schnell", { zuSchnell: true });

  // Runde nur einmal einlösbar
  db.academy_spiele_runden.length = 0;
  const s = await rufe(t({ aktion: "start", spiel: "gefahren" })); warte(9000);
  const a = await rufe(t({ aktion: "ergebnis", runde: s.runde, wert: 300, gefunden: 3, fehltipps: 0, vollstaendig: 0 }));
  const b = await rufe(t({ aktion: "ergebnis", runde: s.runde, wert: 300, gefunden: 3, fehltipps: 0, vollstaendig: 0 }));
  if (a.status !== 200 || b.status === 200) abw.push("Runde ist nicht genau einmal einlösbar: " + a.status + "/" + b.status);
  // Runde nach 30 Minuten abgelaufen
  db.academy_spiele_runden.length = 0;
  const s2 = await rufe(t({ aktion: "start", spiel: "gefahren" })); warte(31 * 60_000);
  const c = await rufe(t({ aktion: "ergebnis", runde: s2.runde, wert: 100, gefunden: 1, fehltipps: 0, vollstaendig: 0 }));
  if (c.status === 200) abw.push("nach 31 Minuten noch angenommen");
  // Die Runde eines anderen Spiels gilt hier nicht (Server nimmt Regel des Spiels der Runde): Ampel-Runde mit Punkte-Feldern bleibt beim Ampel-Gesetz
  // Ranking: größer ist besser, Bestwert bleibt, Rekord wird erkannt
  aufbau(); db.academy_spiele_runden.length = 0;
  const wertAn = async (w, g) => { db.academy_spiele_runden.length = 0; const st = await rufe(t({ aktion: "start", spiel: "gefahren" })); warte(9000); return rufe(t({ aktion: "ergebnis", runde: st.runde, wert: w, gefunden: g, fehltipps: 0, vollstaendig: 0 })); };
  const r1 = await wertAn(500, 5), r2 = await wertAn(300, 3), r3 = await wertAn(700, 7);
  if (!(r1.rekord === true && r2.rekord === false && r2.bestwert === 500 && r3.rekord === true && r3.bestwert === 700)) abw.push("Ranking: größer ist besser stimmt nicht " + JSON.stringify([r1.rekord, r2.rekord, r2.bestwert, r3.rekord, r3.bestwert]));
  const rl = await rufe(t({ aktion: "rangliste", spiel: "gefahren", limit: 10 }));
  if (!(rl.status === 200 && rl.top && rl.top[0] && rl.top[0].wert === 700)) abw.push("Rangliste liefert nicht den besten Wert: " + JSON.stringify(rl));
  return abw;
}

const rufeEcht = await serverMitEintrag();
const abwEcht = await serverFaelle(rufeEcht);
pruefe("Server mit Eintrag: alle Fälle wie erwartet (" + "ok/abgelehnt/einmal/Ablauf/Ranking" + ")", abwEcht.length === 0, abwEcht.join(" | "));

/* Prüfung der Prüfung: fehlerhafte Einträge müssen auffallen */
console.log("Prüfung der Prüfung (absichtliche Fehler im Server-Eintrag)");
const mutationen = [
  ["Höchstwert zu hoch", (e) => e.replace("GEFAHREN.BONUS_MAX)", "GEFAHREN.BONUS_MAX) + 500")],
  ["Obergrenze für Punkte entfernt", (e) => e.replace(/if \(wert > g \* GEFAHREN\.PKT[^\n]*\n/, "")],
  ["Untergrenze für Punkte entfernt", (e) => e.replace(/if \(wert < g \* GEFAHREN\.PKT[^\n]*\n/, "")],
  ["Bonus je Bild nicht begrenzt (v * 600)", (e) => e.replace("v * GEFAHREN.BONUS_MAX", "v * 600")],
  ["volles Bild ohne Mindestzahl Gefahren", (e) => e.replace(" || v * GEFAHREN.MIN_JE_BILD > g", "")],
  ["Fehltipps nicht begrenzt", (e) => e.replace(" || f > GEFAHREN.BILDER * GEFAHREN.FEHL_JE_BILD", "")],
  ["gefunden nicht begrenzt", (e) => e.replace(" || g > GEFAHREN.BILDER * GEFAHREN.MAX_JE_BILD", "")],
  ["gefunden nicht als ganze Zahl geprüft", (e) => e.replace("if (!istGanz(g) || g < 0", "if (g < 0")],
  ["Vorlauf auf 0", (e) => e.replace("vorlauf_ms: 8000", "vorlauf_ms: 0")],
  ["Ranking aufsteigend (kleiner ist besser)", (e) => e.replace("aufsteigend: false", "aufsteigend: true")],
  ["Runde nur 1 Minute offen", (e) => e.replace("runde_max_ms: 1_800_000", "runde_max_ms: 60_000")],
  ["Abzug für Fehltipps falsch (0)", (e) => e.replace("f * GEFAHREN.ABZUG", "f * 0")]
];
for (const [name, fn] of mutationen) {
  let angeschlagen = false;
  try {
    const abw = await serverFaelle(await serverMitEintrag(fn));
    angeschlagen = abw.length > 0;
  } catch (e) { angeschlagen = true; }
  pruefe("Fehler fällt auf: " + name, angeschlagen);
}
// Kontrolle, dass die Ersetzungen überhaupt etwas ändern (sonst wäre die Prüfung der Prüfung wertlos)
for (const [name, fn] of mutationen) pruefe("Mutation ändert den Eintrag: " + name, fn(SERVER_EINTRAG) !== SERVER_EINTRAG);

console.log("\n" + bestanden + " bestanden, " + fehler + " fehlgeschlagen");
