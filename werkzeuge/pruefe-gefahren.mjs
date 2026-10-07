// Prüfung von Spiel 7 „Gefahren finden“ (07.10.2026), ohne Browser.
//   - Bildpool: genug Bilder, je Bild 4–5 Gefahren, Gefahrenpunkte liegen im Bild (samt Markierung), überlappen sich nicht,
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
import { serverMitEintrag, SERVER_KONSTANTE, SERVER_EINTRAG, SPIELE_EINTRAG, wurzel, functionQuelle } from "./gefahren-testbasis.mjs";

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
  // weitere Trefferflächen einer Gefahr (zonen): ganz im Bild, groß genug, nur Zonen DERSELBEN Gefahr dürfen sich überlappen
  const alleZonen = b.gefahren.flatMap((g) => G.zonenVon(g).map((z) => ({ ...z, id: g.id })));
  pruefe(b.id + ": alle Zonen (auch weitere Flächen einer Gefahr) liegen ganz im Bild", alleZonen.every((z) => z.x - z.r >= 0 && z.x + z.r <= G.BILD_B && z.y - z.r >= 0 && z.y + z.r <= G.BILD_H), alleZonen.filter((z) => !(z.x - z.r >= 0 && z.x + z.r <= G.BILD_B && z.y - z.r >= 0 && z.y + z.r <= G.BILD_H)).map((z) => z.id).join(","));
  pruefe(b.id + ": jede Zone mindestens 24 Bildeinheiten Radius", alleZonen.every((z) => z.r >= 24));
  const zUeber = [];
  for (let i = 0; i < alleZonen.length; i++) for (let j = i + 1; j < alleZonen.length; j++) {
    const a = alleZonen[i], c = alleZonen[j];
    if (a.id !== c.id && Math.hypot(a.x - c.x, a.y - c.y) < a.r + c.r) zUeber.push(a.id + "/" + c.id);
  }
  pruefe(b.id + ": Zonen verschiedener Gefahren überlappen sich nicht", zUeber.length === 0, zUeber.join(" "));
  pruefe(b.id + ": Mitte jeder Zone trifft genau ihre Gefahr", alleZonen.every((z) => (G.treffer(b.gefahren, z.x, z.y, 0) || {}).id === z.id));
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

/* ===================== Faire Trefferflächen (Befunde der Fachprüfung) ===================== */
console.log("Faire Trefferflächen");
{
  const bild = (id) => G.BILDER.find((b) => b.id === id);
  const trifft = (id, x, y) => { const t = G.treffer(bild(id).gefahren, x, y, 0); return t && t.id; };
  const alle = (id, gefahr, punkte) => punkte.every((p) => trifft(id, p[0], p[1]) === gefahr);
  // Herbst: nasse Pfützen und der Laubhaufen gehören zur Gefahr „laub“; nur ein Haufen
  pruefe("herbst: Laubhaufen und beide nassen Pfützen zählen als Treffer „laub“", alle("herbst", "laub", [[70, 172], [98, 161], [62, 140], [80, 165]]));
  pruefe("herbst: gezeichnet ist ein einziger Laubhaufen (keine ungültige zweite Stelle)", (bild("herbst").svgInnen.match(/fill="#c8641d"/g) || []).length === 3);
  // Baustelle: Grube, Bagger, beide Absperrungen und die Leitkegel zählen
  pruefe("baustelle: Grube, Bagger (176/144), rechte Absperrung (206/142), linke Absperrung (114/142) zählen", alle("baustelle", "baustelle", [[160, 142], [176, 144], [206, 142], [114, 142], [190, 136]]));
  pruefe("baustelle: alle vier Leitkegel zählen", alle("baustelle", "baustelle", [[104, 134], [92, 142], [80, 150], [68, 157]]));
  pruefe("baustelle: Arbeiter und Gehwegsperre bleiben eigene Gefahren", trifft("baustelle", 240, 112) === "arbeiter" && trifft("baustelle", 286, 152) === "gehwegsperre");
  // Bushaltestelle: jeder Punkt des Busses (Heck bis Front, x 80..156, y 111..133) zählt
  const busPunkte = []; for (let x = 80; x <= 156; x += 4) for (let y = 111; y <= 133; y += 4) busPunkte.push([x, y]);
  pruefe("haltestelle: jeder Punkt des ganzen Busses (Heck bis Front) zählt als „busblinker“", alle("haltestelle", "busblinker", busPunkte), busPunkte.filter((p) => trifft("haltestelle", p[0], p[1]) !== "busblinker").join(" "));
  pruefe("haltestelle: Bus steht an der Haltestelle (Bus x 80..156 überdeckt das Haltestellendach x 88..150), Radfahrer und Fußgänger vor dem Bus", (() => {
    const svg = bild("haltestelle").svgInnen;
    const dach = /<rect x="(\d+)" y="146" width="(\d+)" height="18" fill="#9fb5c4"/.exec(svg);
    const b = bild("haltestelle").gefahren, bus = b.find((g) => g.id === "busblinker"), fuss = b.find((g) => g.id === "hinterfahrzeug"), rad = b.find((g) => g.id === "radfahrer");
    return !!dach && +dach[1] >= bus.x - 38 && +dach[1] + +dach[2] <= bus.x + 38 && fuss.x > bus.x + 38 && rad.x > bus.x + 38;
  })());
  pruefe("haltestelle: Haltestellenzeichen 224 nicht eingebunden (keine amtliche Datei im Ordner)", !existsSync(join(wurzel, "verkehr/vorfahrt-zeichen/z224.svg")) && !/z224/.test(bild("haltestelle").svgInnen));
  // Kreuzung: Fußgänger quert die Seitenstraße (Blick quer), Lieferwagen weit genug von der Ecke
  const kr = bild("kreuzung").svgInnen;
  const fussg = /<g transform="translate\(168 192\) rotate\((-?\d+)\)">/.exec(kr);
  pruefe("kreuzung: Fußgänger „abbiegerfuss“ steht auf der Seitenstraße und blickt quer zur Straße (Blick nach rechts, 0 Grad)", !!fussg && +fussg[1] === 0 && trifft("kreuzung", 168, 192) === "abbiegerfuss");
  const wagen = /<g transform="translate\((\d+) (\d+)\)"><rect x="-22" y="-10" width="44" height="20"/.exec(kr);
  // Auto 34 Bildpunkte ≈ 4,5 m: 5 m ≈ 38 Bildpunkte. Ecke der Kreuzung (Fahrbahnkante der Seitenstraße) bei x = 202.
  pruefe("kreuzung: geparkter Lieferwagen mindestens 5 m (hier > 60 Bildpunkte) hinter der Kreuzungsecke (§ 12 Abs. 3 Nr. 1 StVO)", !!wagen && (+wagen[1] - 22) - 202 >= 60, wagen ? String((+wagen[1] - 22) - 202) : "kein Lieferwagen");
  pruefe("kreuzung: Person am Lieferwagen schaut zur Fahrbahn (nach oben, −90 Grad)", /<g transform="translate\(322 141\) rotate\(-90\)">/.test(kr));
  // Wohnstraße: Bild heißt Tempo-30-Zone; Autotür: Scharnier vorn, freies Ende hinten (Auto fährt nach rechts)
  pruefe("Wohnstraße heißt „Tempo-30-Zone“ (Zeichen 274.1 ist im Bild)", TEXTE_GEFAHREN.de.geB1 === "Tempo-30-Zone" && /z2741\.svg/.test(bild("wohnstrasse").svgInnen));
  const tuer = /<g transform="translate\(([\d.]+) ([\d.]+)\) rotate\((-?\d+)\)"><rect x="0" y="-1.5" width="14"/.exec(bild("wohnstrasse").svgInnen);
  pruefe("Autotür: Scharnier vorn, die Tür schwingt hinten nach außen (freies Ende liegt weiter hinten und weiter von der Karosserie weg)", !!tuer && (+tuer[1] + 14 * Math.cos(+tuer[3] * Math.PI / 180)) < +tuer[1] && (+tuer[2] + 14 * Math.sin(+tuer[3] * Math.PI / 180)) < +tuer[2], tuer && tuer.slice(1).join(","));
  // Texte zu den Befunden (alle Sprachen)
  for (const sp of Object.keys(TEXTE_GEFAHREN)) {
    const t = TEXTE_GEFAHREN[sp];
    pruefe(sp + ": Lkw über 3,5 t im Text zum toten Winkel", /3[.,]5/.test(t.geH_toterwinkel_x), t.geH_toterwinkel_x);
    pruefe(sp + ": Wohnstraße heißt Tempo-30-Zone (30 im Namen, nicht mehr „Wohn…“)", /30/.test(t.geB1), t.geB1);
    pruefe(sp + ": Zweite-Reihe-Text nennt § 6 StVO", /§ ?6\b/.test(t.geH_zweitereihe_x), t.geH_zweitereihe_x);
  }
  pruefe("de: Busblinker-Text nennt Linien- oder Schulbus, Gegenverkehr und warten", /Linienbus oder gekennzeichneter Schulbus/.test(TEXTE_GEFAHREN.de.geH_busblinker_x) && /Gegenverkehr auf derselben Fahrbahn/.test(TEXTE_GEFAHREN.de.geH_busblinker_x) && /warte/.test(TEXTE_GEFAHREN.de.geH_busblinker_x));
  pruefe("de: Kurve-Text nennt die halbe übersehbare Strecke", /halben übersehbaren Strecke/.test(TEXTE_GEFAHREN.de.geH_kurve_x));
  pruefe("de: Arbeiter-Text „auf oder neben der Fahrbahn“, Absperrungen und Schilder nur wenn vorhanden", /auf oder neben der Fahrbahn/.test(TEXTE_GEFAHREN.de.geH_arbeiter_x) && /Beachte Absperrungen und, wenn vorhanden, Schilder\./.test(TEXTE_GEFAHREN.de.geH_arbeiter_x));
  pruefe("de: Fußgänger hinter oder vor einem Fahrzeug", /hinter oder vor/.test(TEXTE_GEFAHREN.de.geH_hinterfahrzeug) && /Hinter oder vor einem haltenden Fahrzeug/.test(TEXTE_GEFAHREN.de.geH_hinterfahrzeug_x));
  pruefe("tr: „engeli soldan geçmek“ (kein „engelin“)", /engeli soldan geçmek/.test(TEXTE_GEFAHREN.tr.geH_baustelle_x) && !/engelin soldan/.test(TEXTE_GEFAHREN.tr.geH_baustelle_x));
  // Tastaturbedienung: neue Texte in jeder Sprache vorhanden (Platzhalter prüft die Schleife oben)
  pruefe("Tastatur-Texte (geTastaturAria / Treffer / Kein) in allen Sprachen", Object.keys(TEXTE_GEFAHREN).every((sp) => ["geTastaturAria", "geTastaturTreffer", "geTastaturKein"].every((k) => TEXTE_GEFAHREN[sp][k])));
  pruefe("Tastatur-Hinweis verrät keine Gefahr (kein Gefahrenname im Aria-Text)", Object.keys(TEXTE_GEFAHREN).every((sp) => G.GEFAHR_TYPEN.every((ty) => !TEXTE_GEFAHREN[sp].geTastaturAria.includes(TEXTE_GEFAHREN[sp][G.gefahrTitel(ty)]))));
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
const anzahlen = G.BILDER.map((b) => b.gefahren.length);
const poolMax = anzahlen.slice().sort((a, b) => b - a).slice(0, G.BILDER_JE_RUNDE).reduce((x, n) => x + n, 0);
pruefe("MAX_JE_BILD = größte Trefferzahl im Pool (" + Math.max(...anzahlen) + "), MIN_JE_BILD = kleinste (" + Math.min(...anzahlen) + ")", G.MAX_JE_BILD === Math.max(...anzahlen) && G.MIN_JE_BILD === Math.min(...anzahlen));
pruefe("MAX_GEFUNDEN = Summe der 4 größten Bilder aus dem Pool (" + poolMax + "), nicht Bilder x Höchstzahl", G.MAX_GEFUNDEN === poolMax && poolMax < G.BILDER_JE_RUNDE * G.MAX_JE_BILD + 1, String(G.MAX_GEFUNDEN));
pruefe("Zeitbonus je Bild höchstens BONUS_MAX − 2 (entsteht erst nach der ersten Sekunde); MAX_PUNKTE und MAX_FEHLTIPPS aus dem Pool", G.BONUS_JE_BILD_MAX === G.BONUS_MAX - 2 && G.MAX_PUNKTE === poolMax * G.PKT_GEFAHR + G.BILDER_JE_RUNDE * (G.BONUS_MAX - 2) && G.MAX_FEHLTIPPS === G.BILDER_JE_RUNDE * (G.ZEIT_MS / G.STRAFE_MS), G.MAX_PUNKTE + "/" + G.MAX_FEHLTIPPS);
const hoechstes = G.BILDER.map((b) => P(b.gefahren.length, 0, 29999, true)).sort((a, b) => b - a).slice(0, 4).reduce((s, x) => s + x, 0);
pruefe("echter Höchstwert einer Runde (" + hoechstes + ", Bonus nach der 1. Sekunde) = MAX_PUNKTE", hoechstes === G.MAX_PUNKTE);
// ein Bild kann nie mehr Strafzeit sammeln als 15 Fehltipps (15 * 2 s = 30 s)
pruefe("höchstens 15 Fehltipps je Bild", Math.floor(G.ZEIT_MS / G.STRAFE_MS) === 15);

/* ===================== Texte ===================== */
console.log("Texte");
const SPRACHEN = Object.keys(TEXTE);
pruefe("18 Sprachen in texte.js", SPRACHEN.length === 18, SPRACHEN.join(","));
pruefe("Sprachen von texte-gefahren.js = Sprachen von texte.js", gleich(Object.keys(TEXTE_GEFAHREN).sort(), SPRACHEN.slice().sort()));
const schluessel = Object.keys(TEXTE_GEFAHREN.de);
pruefe("alle Schlüssel mit Präfix ge", schluessel.every((s) => s.startsWith("ge")));
const texteJsQuelle = readFileSync(join(wurzel, "spiele/texte.js"), "utf8");   // nur die eigenen Schlüssel von texte.js (Spieltexte stehen in eigenen Dateien)
const kollision = schluessel.filter((s) => new RegExp("\\n\\s+" + s + ":").test(texteJsQuelle));
pruefe("kein Schlüssel kollidiert mit bestehenden Texten", kollision.length === 0, kollision.join(","));
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
const echteFunction = functionQuelle();
pruefe("Konstante und Eintrag „gefahren“ stehen in der echten Function, die Testbasis zeigt denselben Text", /\n\s*gefahren:\s*\{/.test(echteFunction) && echteFunction.includes(SERVER_KONSTANTE.split("\n").pop()) && echteFunction.includes(SERVER_EINTRAG.trim()));
const konst = Object.fromEntries([...echteFunction.match(/const GEFAHREN = \{([^}]*)\}/)[1].matchAll(/([A-Z_]+): (\d+)/g)].map((m) => [m[1], +m[2]]));
pruefe("Zahlen im Server = Zahlen im Spiel", konst.BILDER === G.BILDER_JE_RUNDE && konst.MIN_JE_BILD === G.MIN_JE_BILD && konst.MAX_JE_BILD === G.MAX_JE_BILD &&
  konst.PKT === G.PKT_GEFAHR && konst.ABZUG === G.ABZUG_TIPP && konst.BONUS_MAX === G.BONUS_MAX && konst.FEHL_JE_BILD === G.ZEIT_MS / G.STRAFE_MS &&
  konst.MAX_GESAMT === G.MAX_GEFUNDEN && konst.BONUS_JE_BILD === G.BONUS_JE_BILD_MAX && konst.BONUS_JE_BILD === konst.BONUS_MAX - 2, JSON.stringify(konst) + " / Spiel " + G.MAX_GEFUNDEN);
pruefe("Server-Höchstwert aus der Formel = MAX_PUNKTE des Spiels (Bilderpool, nicht 24 Treffer)", konst.MAX_GESAMT * konst.PKT + konst.BILDER * konst.BONUS_JE_BILD === G.MAX_PUNKTE);

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
  await ok("echter Höchstwert des Bilderpools: " + poolMax + " Gefahren, 4 Bilder voll, Bonus 58 je Bild", { wert: G.MAX_PUNKTE, gefunden: poolMax, fehltipps: 0, vollstaendig: 4 });
  await ok("ehrlich: 17 gefunden, 3 Fehltipps, 2 Bilder voll mit Bonus 50", { wert: 1700 - 90 + 50, gefunden: 17, fehltipps: 3, vollstaendig: 2 });
  await nein("24 Gefahren mit 4 vollen Bildern (früheres „theoretisches Maximum“) wird abgelehnt", { wert: 24 * 100 + 4 * 60, gefunden: 24, fehltipps: 0, vollstaendig: 4 }, "wert_ausserhalb");
  await nein("24 Gefahren mit 4 vollen Bildern abgelehnt, auch bei kleinem Wert", { wert: 100, gefunden: 24, fehltipps: 0, vollstaendig: 4 }, "gefunden_ungueltig");
  await nein("eine mehr als der Pool hergibt", { wert: 100, gefunden: poolMax + 1, fehltipps: 0, vollstaendig: 4 }, "gefunden_ungueltig");
  await ok("viele Fehltipps drücken auf 0 (Bild nie negativ)", { wert: 0, gefunden: 2, fehltipps: 60, vollstaendig: 0 });
  await ok("untere Grenze genau", { wert: 940, gefunden: 10, fehltipps: 2, vollstaendig: 0 });
  { const r = await lauf({ wert: 700, gefunden: 7, fehltipps: 0, vollstaendig: 0 }, { warte: 10 * 60_000 }); if (r.status !== 200) abw.push("ehrliche Runde nach 10 Minuten (Lesen der Erklärungen) abgelehnt: " + r.error); }
  await ok("obere Grenze genau mit Bonus", { wert: 558, gefunden: 5, fehltipps: 0, vollstaendig: 1 });

  await nein("über dem Höchstwert", { wert: G.MAX_PUNKTE + 1, gefunden: poolMax, fehltipps: 0, vollstaendig: 4 }, "wert_ausserhalb");
  await nein("negativer Wert", { wert: -1, gefunden: 0, fehltipps: 0, vollstaendig: 0 }, "wert_ausserhalb");
  await nein("Wert keine ganze Zahl", { wert: 100.5, gefunden: 1, fehltipps: 0, vollstaendig: 0 }, "wert_ungueltig");
  await nein("25 Gefahren", { wert: 100, gefunden: 25, fehltipps: 0, vollstaendig: 4 }, "gefunden_ungueltig");
  await nein("gefunden fehlt", { wert: 100, fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("gefunden als Text", { wert: 100, gefunden: "1", fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("gefunden negativ", { wert: 0, gefunden: -1, fehltipps: 0, vollstaendig: 0 }, "gefunden_ungueltig");
  await nein("5 volle Bilder", { wert: 100, gefunden: poolMax, fehltipps: 0, vollstaendig: 5 }, "vollstaendig_ungueltig");
  await nein("volles Bild, aber weniger als 4 Gefahren", { wert: 100, gefunden: 3, fehltipps: 0, vollstaendig: 1 }, "vollstaendig_ungueltig");
  await nein("2 volle Bilder mit nur 7 Gefahren", { wert: 100, gefunden: 7, fehltipps: 0, vollstaendig: 2 }, "vollstaendig_ungueltig");
  await nein("vollstaendig fehlt", { wert: 100, gefunden: 1, fehltipps: 0 }, "vollstaendig_ungueltig");
  await nein("61 Fehltipps", { wert: 0, gefunden: 0, fehltipps: 61, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps negativ", { wert: 100, gefunden: 1, fehltipps: -1, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps keine ganze Zahl", { wert: 100, gefunden: 1, fehltipps: 0.5, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("Fehltipps fehlt", { wert: 100, gefunden: 1, vollstaendig: 0 }, "fehltipps_ungueltig");
  await nein("zu viele Punkte für 5 Gefahren ohne volles Bild", { wert: 501, gefunden: 5, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("Bonus ohne volles Bild geschwindelt", { wert: 560, gefunden: 5, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("mehr als 58 Bonus je volles Bild (Bonus entsteht erst nach der 1. Sekunde)", { wert: 559, gefunden: 5, fehltipps: 0, vollstaendig: 1 }, "punkte_zu_hoch");
  await nein("voller Höchstbonus 60 je Bild geschwindelt", { wert: 560, gefunden: 5, fehltipps: 0, vollstaendig: 1 }, "punkte_zu_hoch");
  await nein("Punkte für Gefahren ohne Fund", { wert: 1000, gefunden: 0, fehltipps: 0, vollstaendig: 0 }, "punkte_zu_hoch");
  await nein("weniger Punkte als möglich (Fehltipps stimmen nicht)", { wert: 939, gefunden: 10, fehltipps: 2, vollstaendig: 0 }, "punkte_zu_niedrig");
  await nein("zu schnell (nach 4 s, Vorlauf 5 s)", { wert: 100, gefunden: 1, fehltipps: 0, vollstaendig: 0 }, "zu_schnell", { warte: 4000 });
  { const r = await lauf({ wert: 100, gefunden: 1, fehltipps: 0, vollstaendig: 0 }, { warte: 5600 }); if (r.status !== 200) abw.push("nach 5,6 s (Vorlauf 5 s) abgelehnt: " + r.error); }
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
  ["Höchstwert zu hoch", (e) => e.replace("GEFAHREN.BILDER * GEFAHREN.BONUS_JE_BILD, vorlauf_ms", "GEFAHREN.BILDER * GEFAHREN.BONUS_JE_BILD + 500, vorlauf_ms")],
  ["Obergrenze für Punkte entfernt", (e) => e.replace(/if \(wert > g \* GEFAHREN\.PKT[^\n]*\n/, "")],
  ["Untergrenze für Punkte entfernt", (e) => e.replace(/if \(wert < g \* GEFAHREN\.PKT[^\n]*\n/, "")],
  ["Bonus je Bild nicht begrenzt (v * 600)", (e) => e.replace("v * GEFAHREN.BONUS_JE_BILD", "v * 600")],
  ["volles Bild ohne Mindestzahl Gefahren", (e) => e.replace(" || v * GEFAHREN.MIN_JE_BILD > g", "")],
  ["Fehltipps nicht begrenzt", (e) => e.replace(" || f > GEFAHREN.BILDER * GEFAHREN.FEHL_JE_BILD", "")],
  ["gefunden nicht begrenzt", (e) => e.replace(" || g > GEFAHREN.MAX_GESAMT", "")],
  ["gefunden nicht als ganze Zahl geprüft", (e) => e.replace("if (!istGanz(g) || g < 0", "if (g < 0")],
  ["Vorlauf auf 0", (e) => e.replace("vorlauf_ms: 5000", "vorlauf_ms: 0")],
  ["gefunden-Grenze wieder 24 (altes Maximum)", (e) => e.replace("g > GEFAHREN.MAX_GESAMT", "g > 24")],
  ["Bonus je Bild wieder BONUS_MAX statt BONUS_MAX − 2", (e) => e.replace("v * GEFAHREN.BONUS_JE_BILD", "v * GEFAHREN.BONUS_MAX")],
  ["Vorlauf nur 2 s", (e) => e.replace("vorlauf_ms: 5000", "vorlauf_ms: 2000")],
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
