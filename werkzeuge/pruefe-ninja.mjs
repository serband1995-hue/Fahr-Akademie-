// Prüfung von Spiel 9 „Schilder-Wisch“ (Id ninja), 07.10.2026, ohne Browser.
//   - Schilder: jede Gruppe eindeutig, Kategorie stimmt mit der StVO überein (Anlage 1/2/3, Abschnitt; Tabelle unten aus
//     gesetze-im-internet.de/stvo_2013/anlage_1|2|3.html), Bilder vorhanden und in QUELLEN.md genannt, Namen/Kategorien in 18 Sprachen
//   - Regeln: nie ein falsches Schild, das auch zur Regel passt (eigene Gegenprobe über Merkmale), fachlich heikle Schilder fehlen
//     dort, wo sie nicht eindeutig sind
//   - Runden: für viele Zufallszahlen und alle Regeln/Runden/Bewegungsarten lösbar (9 richtige, 8 falsche, genug Zeit, nichts liegt
//     übereinander, Wischfläche trifft nur das gemeinte Schild), Fahrplan mit gleichem Zufall gleich
//   - Punkterechnung, Auswertung der Runde (Erklärliste), Geometrie
//   - Texte: alle 18 Sprachen, gleiche Schlüssel und Platzhalter, Fachzahlen, Schlüssel im Code vorhanden
//   - Server-Eintrag gegen die echte Function auf Datenbank im Speicher; danach „Prüfung der Prüfung“ (absichtliche Fehler müssen auffallen)
// Aufruf: node --experimental-strip-types werkzeuge/pruefe-ninja.mjs
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { db, warte } from "./edge-functions/spiele-im-speicher.mjs";
import * as N from "../spiele/ninja.js";
import { TEXTE, RTL } from "../spiele/texte.js";
import { TEXTE_NINJA } from "../spiele/texte-ninja.js";
import { SCHILD_DATEIEN } from "../spiele/schilder.js";
import { serverMitEintrag, SERVER_KONSTANTE, SERVER_EINTRAG, SPIELE_EINTRAG, wurzel } from "./ninja-testbasis.mjs";

let bestanden = 0, fehler = 0;
function pruefe(name, bedingung, detail) {
  if (bedingung) { bestanden++; if (process.env.LEISE !== "1") console.log("  ok   " + name); }
  else { fehler++; console.log("  FEHL " + name + (detail ? " -> " + detail : "")); process.exitCode = 1; }
}
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const text = (sp, key) => (TEXTE_NINJA[sp] && TEXTE_NINJA[sp][key]) || (TEXTE[sp] && TEXTE[sp][key]);

/* Zufall mit festem Startwert (Prüfungen müssen wiederholbar sein) */
function zufall(start) { let z = (start * 2654435761) >>> 0; const f = () => ((z = (Math.imul(z, 1664525) + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < 8; i++) f(); return f; }

/* ===================== Die StVO (Gegenprobe, unabhängig vom Spielcode) ===================== */
/* Nummer -> { anlage, abschnitt } laut gesetze-im-internet.de/stvo_2013 (Anlage 1: Gefahrzeichen, 2: Vorschriftzeichen, 3: Richtzeichen), abgerufen 07.10.2026 */
const STVO = {
  "101": [1, 1], "103": [1, 1], "112": [1, 1], "114": [1, 1], "133": [1, 1], "136": [1, 1], "142": [1, 1],
  "205": [2, 1], "206": [2, 1],                                  // A2/1 Wartegebote und Haltgebote
  "209": [2, 2], "215": [2, 2],                                  // A2/2 Vorgeschriebene Fahrtrichtungen
  "222": [2, 3],                                                 // A2/3 Vorgeschriebene Vorbeifahrt
  "237": [2, 5], "239": [2, 5],                                  // A2/5 Sonderwege
  "250": [2, 6], "267": [2, 6],                                  // A2/6 Verkehrsverbote
  "274": [2, 7], "274.1": [2, 7], "276": [2, 7],                 // A2/7 Geschwindigkeitsbeschränkungen und Überholverbote
  "283": [2, 8], "286": [2, 8], "290.1": [2, 8],                 // A2/8 Halt- und Parkverbote
  "301": [3, 1], "306": [3, 1],                                  // A3/1 Vorrangzeichen
  "350": [3, 9]                                                  // A3/9 Hinweise
};
/* Merkmale der Gruppen (eigene Zuordnung für die Gegenprobe der Regeln): Verbote enthalten Tempo- und Haltverbote */
const MERKMALE = { gefahr: ["gefahr"], vorfahrt: ["vorfahrt"], gebot: ["gebot"], verbot: ["verbot"], tempo: ["verbot", "tempo"], halt: ["verbot", "halt"], richt: ["richt"] };
const REGEL_MERKMAL = { gefahr: "gefahr", verbot: "verbot", gebot: "gebot", vorfahrt: "vorfahrt", tempo: "tempo", halt: "halt" };
/* Kategorie-Schlüssel -> erlaubte Anlage */
const KAT_ANLAGE = { niKgefahr: 1, niK205: 2, niK206: 2, niKgebot: 2, niKverbot: 2, niKtempo: 2, niKueberhol: 2, niKhalt: 2, niKvorrang: 3, niKricht: 3 };
/* Fachlich heikle Schilder: in diesen Regeln darf das Schild WEDER richtig NOCH falsch vorkommen (nicht eindeutig oder in der Fahrschule verschieden gelehrt) */
const HEIKEL = {
  vorfahrt: { // 205/206 sind amtlich Warte-/Haltgebote, 306 enthält ein Parkverbot
    z205: ["gebot", "verbot", "halt"], z206: ["gebot", "verbot", "halt"], z301: ["gebot", "verbot", "halt"], z306: ["gebot", "verbot", "halt"]
  },
  kreisverkehr: { z215: ["verbot", "vorfahrt", "halt"] },                 // Gebot, enthält aber Verbote (Mittelinsel, Halten) und betrifft die Vorfahrt im Kreis
  sonderwege: { z237: ["verbot"], z239: ["verbot"] },                      // „anderer Verkehr darf ihn nicht benutzen“
  haltBeiFahrzeugverbot: { z250: ["halt"], z267: ["halt"] },               // verbieten das Fahren, nicht ausdrücklich das Halten
  fussgaengerueberweg: { z350: ["vorfahrt", "halt"] }                      // Vorrang/Haltverbot stehen in der StVO (§ 26, § 12), nicht im Zeichen
};

/* ===================== Schilder ===================== */
console.log("Schilder");
const ids = N.SCHILDER.map((s) => s.id);
pruefe("mindestens 25 Schilder-Einträge", ids.length >= 25, String(ids.length));
pruefe("Ids eindeutig", new Set(ids).size === ids.length);
pruefe("jedes Schild hat genau eine bekannte Gruppe", N.SCHILDER.every((s) => typeof s.gruppe === "string" && Object.keys(MERKMALE).includes(s.gruppe)));
pruefe("Gruppen sind GENAU eine (Feld ist Text, keine Liste)", N.SCHILDER.every((s) => !Array.isArray(s.gruppe)));
const quellen = readFileSync(join(wurzel, "verkehr/vorfahrt-zeichen/QUELLEN.md"), "utf8");
for (const s of N.SCHILDER) {
  const st = STVO[s.nr];
  pruefe("Schild " + s.id + ": Nummer " + s.nr + " steht in der StVO-Tabelle", !!st);
  if (!st) continue;
  pruefe("Schild " + s.id + ": Kategorie-Text (" + s.kat + ") passt zur Anlage " + st[0], KAT_ANLAGE[s.kat] === st[0], s.kat);
  const g = s.gruppe;
  const abschnittOk = {
    gefahr: st[0] === 1, vorfahrt: (st[0] === 2 && st[1] === 1) || (st[0] === 3 && st[1] === 1), gebot: st[0] === 2 && [2, 3, 5].includes(st[1]),
    verbot: st[0] === 2 && [6, 7].includes(st[1]), tempo: st[0] === 2 && st[1] === 7 && s.nr.startsWith("274"), halt: st[0] === 2 && st[1] === 8, richt: st[0] === 3 && st[1] === 9
  }[g];
  pruefe("Schild " + s.id + ": Gruppe " + g + " passt zum StVO-Abschnitt " + st.join("/"), abschnittOk);
  pruefe("Schild " + s.id + ": Name- und Kategorie-Schlüssel haben deutschen Text", !!text("de", s.name) && !!text("de", s.kat), s.name + " " + s.kat);
  const html = N.bildHtml(s, "");
  const m = /src="([^"]+)"/.exec(html);
  const datei = m ? decodeURIComponent(m[1].split("/").pop()) : "";
  pruefe("Schild " + s.id + ": Bild ist <img> aus verkehr/vorfahrt-zeichen/", html.startsWith("<img ") && !!m && /\/verkehr\/vorfahrt-zeichen\/z[0-9-]+\.svg$/.test(m[1]), html);
  const pfad = join(wurzel, "verkehr/vorfahrt-zeichen", datei);
  pruefe("Schild " + s.id + ": Datei " + datei + " vorhanden, SVG, nicht leer", existsSync(pfad) && statSync(pfad).size > 500 && /<svg[\s>]/.test(readFileSync(pfad, "utf8").slice(0, 4000)));
  pruefe("Schild " + s.id + ": Datei in SCHILD_DATEIEN und in QUELLEN.md genannt", SCHILD_DATEIEN.includes(datei) && quellen.includes(datei), datei);
}
pruefe("Zeichen 274: alle fünf Tempo-Zahlen als Schild", ["50", "60", "80", "100", "120"].every((z) => N.SCHILDER.some((s) => s.id === "z274-" + z && s.zahl === +z && s.erkl === "z274")));
pruefe("Nummern: Gefahrzeichen alle Anlage 1, Vorfahrt-Schilder 205/206/301/306", gleich(N.SCHILDER.filter((s) => s.gruppe === "vorfahrt").map((s) => s.nr).sort(), ["205", "206", "301", "306"]));

/* ===================== Regeln ===================== */
console.log("Regeln");
pruefe("6 Regeln, eindeutige Ids", N.REGELN.length === 6 && new Set(N.REGELN.map((r) => r.id)).size === 6);
pruefe("mindestens so viele Regeln wie Runden", N.REGELN.length >= N.RUNDEN);
for (const r of N.REGELN) {
  const tag = REGEL_MERKMAL[r.id];
  pruefe("Regel " + r.id + ": Text-, Erklär-Schlüssel haben Text", !!text("de", r.text) && !!text("de", r.warum));
  const richtig = N.richtigePool(r), falsch = N.falschePool(r);
  const richtigIds = new Set(richtig.map((s) => s.id));
  pruefe("Regel " + r.id + ": richtige Schilder = genau die mit dem Merkmal " + tag, N.SCHILDER.every((s) => richtigIds.has(s.id) === MERKMALE[s.gruppe].includes(tag)), [...richtigIds].join(","));
  pruefe("Regel " + r.id + ": mindestens 3 verschiedene richtige Bilder und 2 verschiedene Zeichen", new Set(richtig.map((s) => s.id)).size >= 3 && new Set(richtig.map((s) => s.erkl)).size >= 2, String(richtig.length));
  pruefe("Regel " + r.id + ": mindestens 6 verschiedene falsche Schilder", falsch.length >= 6, String(falsch.length));
  const doppelt = falsch.filter((s) => MERKMALE[s.gruppe].includes(tag) || richtigIds.has(s.id));
  pruefe("Regel " + r.id + ": KEIN falsches Schild passt auch zur Regel", doppelt.length === 0, doppelt.map((s) => s.id).join(","));
  pruefe("Regel " + r.id + ": richtige und falsche Gruppen überschneiden sich nicht", r.richtigGruppen.every((g) => !r.falschGruppen.includes(g)));
  // heikle Schilder: weder richtig noch falsch
  for (const [thema, tabelle] of Object.entries(HEIKEL)) for (const [sid, regeln] of Object.entries(tabelle)) {
    if (!regeln.includes(r.id)) continue;
    const drin = N.falschePool(r).some((s) => s.id === sid) || richtigIds.has(sid);
    pruefe("Regel " + r.id + ": heikles Schild " + sid + " (" + thema + ") kommt nicht vor", !drin);
  }
}
// Unabhängige Spot-Checks der Fachlehre
const gruppeVon = (nr) => N.SCHILDER.find((s) => s.nr === nr).gruppe;
pruefe("274 und 274.1 sind Tempo-Verbote, 276 Überholverbot (Verbot), 283/286/290.1 Haltverbote, 301/306 Vorfahrt", gruppeVon("274") === "tempo" && gruppeVon("274.1") === "tempo" && gruppeVon("276") === "verbot" && ["283", "286", "290.1"].every((n) => gruppeVon(n) === "halt") && gruppeVon("301") === "vorfahrt" && gruppeVon("306") === "vorfahrt");
pruefe("Tempo-Regel: Überholverbot 276 ist KEIN Tempo-Schild, Haltverbote auch nicht", !N.richtigePool(N.regelMitId("tempo")).some((s) => ["276", "283", "286", "290.1"].includes(s.nr)));
pruefe("Halt-Regel: Tempo-Schilder sind falsch", N.falschePool(N.regelMitId("halt")).some((s) => s.gruppe === "tempo"));
pruefe("Verbots-Regel zählt Tempo- und Haltverbote als richtig", ["274", "274.1", "283", "286", "290.1", "250", "267", "276"].every((n) => N.richtigePool(N.regelMitId("verbot")).some((s) => s.nr === n)));
pruefe("Gebots-Regel: 215, 237, 239, 209, 222 richtig, Verbote falsch", ["215", "237", "239", "209", "222"].every((n) => N.richtigePool(N.regelMitId("gebot")).some((s) => s.nr === n)) && N.falschePool(N.regelMitId("gebot")).some((s) => s.nr === "250"));
pruefe("Gefahr-Regel: nur Anlage-1-Schilder richtig", N.richtigePool(N.regelMitId("gefahr")).every((s) => STVO[s.nr][0] === 1) && N.richtigePool(N.regelMitId("gefahr")).length === 7);
const regelMitSchild = (regel, nr) => ({ r: N.richtigePool(N.regelMitId(regel)).some((s) => s.nr === nr), f: N.falschePool(N.regelMitId(regel)).some((s) => s.nr === nr) });
pruefe("Vorfahrt-Regel: Kreisverkehr 215 und Fußgängerüberweg 350 fehlen ganz", !regelMitSchild("vorfahrt", "215").r && !regelMitSchild("vorfahrt", "215").f && !regelMitSchild("vorfahrt", "350").f);
pruefe("Haltverbots-Regel: 250, 267, 350, 306, 206, 215 fehlen ganz", ["250", "267", "350", "306", "206", "215"].every((n) => { const x = regelMitSchild("halt", n); return !x.r && !x.f; }));

/* ===================== Fahrplan jeder Runde ===================== */
console.log("Fahrplan der Runden");
pruefe("Konstanten wie beschrieben", N.RUNDEN === 3 && N.ZEIT_MS === 25000 && N.N_RICHTIG === 9 && N.N_FALSCH === 8 && N.PKT_RICHTIG === 10 && N.ABZUG_FALSCH === 15 && N.BONUS_VOLL === 20 && N.MIN_RUNDE_MS === 12000);
pruefe("Geschwindigkeit steigt von Runde zu Runde", N.DAUER_MS[0] > N.DAUER_MS[1] && N.DAUER_MS[1] > N.DAUER_MS[2] && N.DAUER_MS.length === N.RUNDEN);
pruefe("Jedes Schild ist bei der schnellsten Runde mindestens 3,5 s im Bild", Math.min(...N.DAUER_MS) >= 3500);
pruefe("langsamer Modus ist langsamer", N.LANGSAM > 1);
const FELDER = [[240, 264], [256, 281], [288, 317], [328, 361], [380, 418], [273, 273], [400, 440], [560, 560]];   // Breite x Höhe in px (320er Handy … Tablet, Querformat)
let planFehler = [], laeufe = 0, ausnahmen = 0, kleinsterAbstandPx = Infinity, kleinsterVertikal = Infinity, gesehenSchilder = new Set();
for (const regel of N.REGELN) for (let nr = 0; nr < N.RUNDEN; nr++) for (const langsam of [false, true]) for (let seed = 1; seed <= 60; seed++) {
  laeufe++;
  const p = N.neueRunde(regel, nr, zufall(seed * 7919 + nr * 31 + regel.id.length), langsam);
  const tag = REGEL_MERKMAL[regel.id], name = regel.id + "/" + nr + "/" + (langsam ? "langsam" : "normal") + "/" + seed;
  const fehl = (was) => { if (planFehler.length < 8) planFehler.push(name + ": " + was); };
  if (p.schilder.length !== N.N_RICHTIG + N.N_FALSCH) fehl("Anzahl " + p.schilder.length);
  if (p.schilder.filter((s) => s.richtig).length !== N.N_RICHTIG) fehl("Zahl richtiger Schilder");
  if (p.dauer !== Math.round(N.DAUER_MS[nr] * (langsam ? N.LANGSAM : 1))) fehl("Dauer");
  p.schilder.forEach((s, i) => {
    const sch = N.schildMitId(s.sid); gesehenSchilder.add(s.sid);
    if (!sch) { fehl("unbekanntes Schild " + s.sid); return; }
    if (s.i !== i) fehl("Nummerierung");
    const passt = MERKMALE[sch.gruppe].includes(tag);
    if (s.richtig !== passt) fehl("richtig-Flag falsch bei " + s.sid);
    if (!s.richtig && N.schildMitId(s.sid).nicht.includes(regel.id)) fehl("unerlaubtes falsches Schild " + s.sid);
    if (s.erkl !== sch.erkl) fehl("erkl");
    if (!(s.bahn >= 0 && s.bahn < N.BAHNEN) || s.richtung !== (s.bahn % 2 === 0 ? 1 : -1)) fehl("Bahn/Richtung");
    if (s.t < 0) fehl("negative Zeit");
  });
  const ts = p.schilder.map((s) => s.t);
  const letzter = Math.max(...ts);
  if (letzter < N.MIN_RUNDE_MS) fehl("letztes Schild erscheint schon bei " + letzter + " ms (< MIN_RUNDE_MS)");
  if (letzter + p.dauer > N.ZEIT_MS) fehl("letztes Schild nicht rechtzeitig durch: " + (letzter + p.dauer));
  if (Math.min(...ts) > 1500) fehl("erstes Schild zu spät");
  const sortiert = p.schilder.map((s) => s.t);
  if (!sortiert.every((t, i) => i === 0 || t >= sortiert[i - 1] - 1)) fehl("Zeiten nicht aufsteigend");
  // Bahn-Abstand
  for (let b = 0; b < N.BAHNEN; b++) {
    const inBahn = p.schilder.filter((s) => s.bahn === b).map((s) => s.t).sort((x, y) => x - y);
    for (let i = 1; i < inBahn.length; i++) if (inBahn[i] - inBahn[i - 1] < N.BAHN_ABSTAND * p.dauer - 1) fehl("Bahn " + b + " zu dicht: " + (inBahn[i] - inBahn[i - 1]));
  }
  // Geometrie für alle Feldgrößen: nichts liegt übereinander, ein Tipp in die Mitte trifft nur dieses Schild
  for (const [B, H] of FELDER) {
    const m = N.masse(B, H);
    const r = N.trefferRadius(m.s);
    if (m.s < N.MIN_SCHILD_PX || m.s > N.MAX_SCHILD_PX) fehl("Schildgröße " + m.s + " bei " + B + "x" + H);
    if (m.bahnH < m.s + 8 - 1e-9) fehl("Bahn zu niedrig für Schild bei " + B + "x" + H + " (" + m.bahnH + " < " + (m.s + 8) + ")");
    kleinsterVertikal = Math.min(kleinsterVertikal, m.bahnH - m.s);
    // richtige Schilder: Zeitpunkt = Mitte der Überquerung; dann Abstand zu allen anderen sichtbaren Schildern
    for (const s of p.schilder.filter((x) => x.richtig)) {
      const e = s.t + p.dauer / 2;
      const a = N.position(s, p.dauer, e, m);
      if (!a.sichtbar || a.x < 0 || a.x > B) fehl("richtiges Schild liegt zur Mitte nicht im Feld");
      for (const o of p.schilder) {
        if (o === s) continue;
        const q = N.position(o, p.dauer, e, m);
        if (!q.sichtbar) continue;
        const d = Math.hypot(q.x - a.x, q.y - a.y);
        kleinsterAbstandPx = Math.min(kleinsterAbstandPx, d - m.s);
        if (d < m.s) fehl("Schilder überlappen sich bei " + B + "x" + H + " d=" + d.toFixed(1));
        if (N.segmentTrifft(a.x, a.y, a.x, a.y, q.x, q.y, r)) ausnahmen++;
      }
    }
  }
}
pruefe("Fahrpläne (" + laeufe + " Läufe: alle Regeln, 3 Runden, normal/langsam): alle Zusicherungen gelten", planFehler.length === 0, planFehler.join(" | "));
pruefe("Ein Tipp in die Mitte eines richtigen Schildes trifft nie ein zweites Schild", ausnahmen === 0, String(ausnahmen));
pruefe("Schilder überlappen sich nie (kleinster Randabstand " + Math.round(kleinsterAbstandPx) + " px); Bahnen haben mindestens 8 px Luft", kleinsterAbstandPx > 0 && kleinsterVertikal >= 8 - 1e-9, kleinsterAbstandPx + " / " + kleinsterVertikal);
pruefe("über viele Läufe kommen alle Schilder vor", gesehenSchilder.size === N.SCHILDER.length, [...gesehenSchilder].length + "/" + N.SCHILDER.length);
{
  const a = N.neueRunde(N.regelMitId("tempo"), 1, zufall(42), false), b = N.neueRunde(N.regelMitId("tempo"), 1, zufall(42), false), c = N.neueRunde(N.regelMitId("tempo"), 1, zufall(43), false);
  pruefe("Zufall ist ersetzbar: gleicher Startwert = gleicher Fahrplan, anderer Startwert = anderer", gleich(a, b) && !gleich(a, c));
  const r3 = N.waehleRegeln(zufall(5));
  pruefe("drei verschiedene Regeln je Durchgang", r3.length === 3 && new Set(r3.map((r) => r.id)).size === 3);
  const alle = new Set(); for (let i = 0; i < 200; i++) N.waehleRegeln(zufall(i + 1)).forEach((r) => alle.add(r.id));
  pruefe("über viele Durchgänge kommen alle 6 Regeln vor", alle.size === 6);
  const richtigeVielfalt = new Set(N.neueRunde(N.regelMitId("gefahr"), 0, zufall(9), false).schilder.filter((s) => s.richtig).map((s) => s.sid));
  pruefe("Gefahr-Runde: die 9 richtigen sind möglichst verschieden (mindestens 7 Arten)", richtigeVielfalt.size >= 7, String(richtigeVielfalt.size));
}
// Ein perfekter Spieler (tippt jedes richtige Schild in der Mitte seiner Überquerung an, sonst nichts) schafft jede Runde
{
  let ok = true;
  for (const regel of N.REGELN) for (let nr = 0; nr < N.RUNDEN; nr++) for (const langsam of [false, true]) {
    const p = N.neueRunde(regel, nr, zufall(1000 + nr), langsam);
    const m = N.masse(288, 317);
    let treffer = 0, falsch = 0;
    const getroffen = {};
    for (const s of p.schilder.filter((x) => x.richtig)) {
      const e = s.t + p.dauer / 2;
      const a = N.position(s, p.dauer, e, m);
      for (const o of p.schilder) {
        const q = N.position(o, p.dauer, e, m);
        if (q.sichtbar && !getroffen[o.i] && N.segmentTrifft(a.x, a.y, a.x, a.y, q.x, q.y, N.trefferRadius(m.s))) { getroffen[o.i] = true; if (o.richtig) treffer++; else falsch++; }
      }
    }
    if (treffer !== N.N_RICHTIG || falsch !== 0 || N.punkteRunde(treffer, falsch) !== 110) ok = false;
  }
  pruefe("perfekter Spieler schafft jede Runde: 9 richtige, 0 falsche, 110 Punkte", ok);
}
// Ein Wisch quer über das Feld (waagerecht durch eine Bahn) trifft alle sichtbaren Schilder der Bahn und sonst keins
{
  const p = N.neueRunde(N.regelMitId("gebot"), 0, zufall(77), false), m = N.masse(288, 317);
  const e = 9000, y = m.bahnH * 1.5;
  const imBild = p.schilder.filter((s) => { const q = N.position(s, p.dauer, e, m); return q.sichtbar && q.y === y; });
  const getroffen = p.schilder.filter((s) => { const q = N.position(s, p.dauer, e, m); return q.sichtbar && N.segmentTrifft(0, y, m.breite, y, q.x, q.y, N.trefferRadius(m.s)); });
  pruefe("ein waagerechter Wisch durch Bahn 1 trifft genau die Schilder dieser Bahn (" + imBild.length + ")", imBild.length === getroffen.filter((s) => s.bahn === 1).length && getroffen.every((s) => s.bahn === 1));
}

/* ===================== Geometrie ===================== */
console.log("Geometrie");
{
  const m = N.masse(300, 330), s = N.schildMitId("z101");
  const sch = { t: 1000, bahn: 2, richtung: 1 }, rueck = { t: 1000, bahn: 1, richtung: -1 };
  const a0 = N.position(sch, 5000, 1000, m), a1 = N.position(sch, 5000, 6000, m), amitte = N.position(sch, 5000, 3500, m), davor = N.position(sch, 5000, 900, m), danach = N.position(sch, 5000, 6100, m);
  pruefe("Schild gleitet von links nach rechts: Start links außen, Ende rechts außen, Mitte in der Mitte", a0.x === -m.s / 2 && Math.abs(a1.x - (300 + m.s / 2)) < 1e-6 && Math.abs(amitte.x - 150) < 1e-6);
  pruefe("vor dem Erscheinen und nach dem Verlassen nicht sichtbar", !davor.sichtbar && !danach.sichtbar && a0.sichtbar && a1.sichtbar && amitte.sichtbar);
  const r0 = N.position(rueck, 5000, 1000, m), r1 = N.position(rueck, 5000, 6000, m);
  pruefe("ungerade Bahn gleitet von rechts nach links", r0.x === 300 + m.s / 2 && Math.abs(r1.x + m.s / 2) < 1e-6);
  pruefe("Bahn-Mitte: y = (Bahn + 0,5) * Bahnhöhe", Math.abs(amitte.y - (2.5 * 330 / 5)) < 1e-9);
  pruefe("segmentTrifft: Punkt auf der Strecke, am Ende, knapp daneben, weit weg", N.segmentTrifft(0, 0, 100, 0, 50, 0, 1) && N.segmentTrifft(0, 0, 100, 0, 104, 0, 5) && !N.segmentTrifft(0, 0, 100, 0, 106, 0, 5) && N.segmentTrifft(0, 0, 100, 0, 50, 4.9, 5) && !N.segmentTrifft(0, 0, 100, 0, 50, 5.1, 5));
  pruefe("segmentTrifft: Tipp (Länge 0) trifft nur im Radius", N.segmentTrifft(10, 10, 10, 10, 13, 14, 5) && !N.segmentTrifft(10, 10, 10, 10, 13, 14.1, 5));
  pruefe("segmentTrifft: Wisch schräg an der Mitte vorbei", N.segmentTrifft(0, 0, 100, 100, 50, 60, 8) && !N.segmentTrifft(0, 0, 100, 100, 50, 70, 8));
  pruefe("Trefferradius = halbe Schildbreite + 4 px, Schild mindestens 44 px (Wischfläche mindestens 52 px breit)", N.trefferRadius(44) === 26 && N.MIN_SCHILD_PX >= 44 && N.trefferRadius(N.MIN_SCHILD_PX) * 2 >= 52);
  pruefe("masse: kleines Feld 240x264 -> Schild mindestens 44, Bahn mindestens 52", N.masse(240, 264).s >= 44 && N.masse(240, 264).bahnH >= 52);
  pruefe("masse: großes Feld -> Schild höchstens 64", N.masse(900, 900).s === 64);
  pruefe("Schild-Bild für 274 mit Zahl: <img> mit der richtigen Zahl", N.bildHtml(N.schildMitId("z274-120"), "x").includes("z274-120.svg") && N.bildHtml(s, "").includes("z101.svg"));
}

/* ===================== Punkte und Auswertung ===================== */
console.log("Punkterechnung");
const P = N.punkteRunde;
pruefe("nichts gewischt = 0", P(0, 0) === 0);
pruefe("3 richtige = 30", P(3, 0) === 30);
pruefe("8 richtige, kein Fehler = 80 (kein Bonus)", P(8, 0) === 80);
pruefe("9 richtige, kein Fehler = 90 + 20 Bonus", P(9, 0) === 110);
pruefe("9 richtige, 1 falsches = 90 − 15, kein Bonus", P(9, 1) === 75);
pruefe("falsch zieht 15 ab", P(5, 2) === 20);
pruefe("eine Runde nie unter 0", P(1, 5) === 0 && P(0, 3) === 0);
pruefe("Höchstwert 330 = 3 x 110", N.MAX_PUNKTE === 330 && N.MAX_RICHTIG === 27 && N.MAX_FALSCH === 24);
pruefe("istVoll nur bei 9 richtigen und 0 falschen", N.istVoll(9, 0) && !N.istVoll(9, 1) && !N.istVoll(8, 0));
{
  const plan = N.neueRunde(N.regelMitId("tempo"), 0, zufall(3), false);
  const richtige = plan.schilder.filter((s) => s.richtig), falsche = plan.schilder.filter((s) => !s.richtig);
  const alleR = {}; richtige.forEach((s) => { alleR[s.i] = true; });
  const b1 = N.bewerteRunde(plan, alleR);
  pruefe("Auswertung: alle richtigen gewischt, nichts Falsches = voll, 110 Punkte, keine verpassten", b1.richtig === 9 && b1.falsch === 0 && b1.verpasst === 0 && b1.voll && b1.punkte === 110);
  pruefe("Auswertung: richtige Schilder 'gewischt', falsche 'gemieden', gemieden zuletzt", b1.eintraege.every((e) => (e.richtig ? e.status === "gewischt" : e.status === "gemieden")) && b1.eintraege[b1.eintraege.length - 1].status === "gemieden");
  pruefe("Auswertung: Tempo-Zahlen sind ein Eintrag (z274)", b1.eintraege.filter((e) => e.erkl === "z274").length <= 1 && b1.eintraege.every((e) => !e.erkl.startsWith("z274-")));
  const b2 = N.bewerteRunde(plan, {});
  pruefe("Auswertung: nichts gewischt: 9 verpasst, 0 Punkte", b2.verpasst === 9 && b2.richtig === 0 && b2.punkte === 0 && !b2.voll && b2.eintraege.filter((e) => e.status === "verpasst").length === b2.eintraege.filter((e) => e.richtig).length);
  const gemischt = {}; gemischt[richtige[0].i] = true; gemischt[falsche[0].i] = true; gemischt[falsche[1].i] = true;
  const b3 = N.bewerteRunde(plan, gemischt);
  pruefe("Auswertung: 1 richtig, 2 falsch gewischt: Punkte = max(0, 10 − 30) = 0, Erklärliste beginnt mit 'falsch'", b3.richtig === 1 && b3.falsch === 2 && b3.punkte === 0 && b3.eintraege[0].status === "falsch");
  const rang = { falsch: 0, verpasst: 1, gewischt: 2, gemieden: 3 };
  pruefe("Auswertung: Reihenfolge falsch, verpasst, gewischt, gemieden", b3.eintraege.every((e, i) => i === 0 || rang[b3.eintraege[i - 1].status] <= rang[e.status]));
  const einSchild = {}; richtige.forEach((s) => { einSchild[s.i] = true; }); einSchild[falsche[0].i] = true;
  const b4 = N.bewerteRunde(plan, einSchild);
  pruefe("Auswertung: alle richtigen + 1 falsches: kein Bonus, 90 − 15 = 75", b4.richtig === 9 && b4.falsch === 1 && !b4.voll && b4.punkte === 75);
  // mehrere Schilder derselben Art: ein verpasstes reicht für „verpasst“
  const fake = { regel: "tempo", nr: 0, dauer: 5000, schilder: [
    { i: 0, sid: "z274-50", erkl: "z274", richtig: true, t: 0, bahn: 0, richtung: 1 }, { i: 1, sid: "z274-80", erkl: "z274", richtig: true, t: 1000, bahn: 1, richtung: -1 },
    { i: 2, sid: "z250", erkl: "z250", richtig: false, t: 2000, bahn: 2, richtung: 1 }, { i: 3, sid: "z250", erkl: "z250", richtig: false, t: 3000, bahn: 3, richtung: -1 }] };
  const b5 = N.bewerteRunde(fake, { 0: true, 3: true });
  pruefe("Auswertung: gleiche Art mehrfach: eine verpasst = verpasst; eine falsch gewischt = falsch", b5.eintraege.find((e) => e.erkl === "z274").status === "verpasst" && b5.eintraege.find((e) => e.erkl === "z250").status === "falsch" && b5.eintraege.length === 2);
}

/* ===================== Texte ===================== */
console.log("Texte");
const SPRACHEN = Object.keys(TEXTE);
pruefe("18 Sprachen in texte.js", SPRACHEN.length === 18, SPRACHEN.join(","));
pruefe("Sprachen von texte-ninja.js = Sprachen von texte.js", gleich(Object.keys(TEXTE_NINJA).sort(), SPRACHEN.slice().sort()));
const schluessel = Object.keys(TEXTE_NINJA.de);
pruefe("alle Schlüssel mit Präfix ni", schluessel.every((s) => s.startsWith("ni")));
// Kollision: nur mit Texten, die NICHT aus texte-ninja.js selbst kommen (ist das Spiel schon in texte.js eingebaut, stehen sie dort mit demselben Inhalt)
pruefe("kein Schlüssel kollidiert mit anderen Texten", schluessel.every((s) => !(s in TEXTE.de) || TEXTE.de[s] === TEXTE_NINJA.de[s]), schluessel.filter((s) => s in TEXTE.de && TEXTE.de[s] !== TEXTE_NINJA.de[s]).join(","));
const platzhalter = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join("");
for (const sp of SPRACHEN) {
  const t = TEXTE_NINJA[sp];
  const fehlt = schluessel.filter((s) => !(s in t)), zuviel = Object.keys(t).filter((s) => !(s in TEXTE_NINJA.de));
  pruefe(sp + ": alle " + schluessel.length + " Schlüssel, keine fremden", fehlt.length === 0 && zuviel.length === 0, "fehlt: " + fehlt.join(",") + " zuviel: " + zuviel.join(","));
  const leer = schluessel.filter((s) => typeof t[s] !== "string" || !t[s].trim());
  pruefe(sp + ": nichts leer", leer.length === 0, leer.join(","));
  const pf = schluessel.filter((s) => platzhalter(String(t[s])) !== platzhalter(TEXTE_NINJA.de[s]));
  pruefe(sp + ": Platzhalter wie Deutsch", pf.length === 0, pf.map((s) => s + " " + platzhalter(String(t[s])) + "≠" + platzhalter(TEXTE_NINJA.de[s])).join(" | "));
  const ziffern = schluessel.filter((s) => /[٠-٩۰-۹०-९፩-፼]/.test(String(t[s])));
  pruefe(sp + ": nur lateinische Ziffern", ziffern.length === 0, ziffern.join(","));
  const kaputt = schluessel.filter((s) => /[{}]|undefined|NaN|\\n|<|>/.test(String(t[s]).replace(/\{(n|m|v|f)\}/g, "")));
  pruefe(sp + ": keine kaputten Platzhalter / Markup", kaputt.length === 0, kaputt.join(","));
  if (sp !== "de" && sp !== "en") {
    const gleichDe = schluessel.filter((s) => t[s] === TEXTE_NINJA.de[s]);
    pruefe(sp + ": nicht einfach Deutsch kopiert", gleichDe.length === 0, gleichDe.join(","));
  }
  if (sp !== "de") {
    const gleichEn = sp === "en" ? [] : schluessel.filter((s) => t[s] === TEXTE_NINJA.en[s] && !/^niZ(2901|301)$/.test(s));
    if (!["sr", "kmr", "rif", "vi", "es", "tr", "el"].includes(sp)) pruefe(sp + ": nicht einfach Englisch kopiert", gleichEn.length === 0, gleichEn.join(","));
  }
  if (RTL.includes(sp)) pruefe(sp + ": enthält Schrift von rechts nach links", /[֐-ࣿ]/.test(t.niBereit) && /[֐-ࣿ]/.test(t.niName));
  // Fachzahlen müssen in jeder Sprache vorkommen
  pruefe(sp + ": Halt-Erklärung nennt 283, 286, 290.1 und 3 Minuten", /283/.test(t.niWarumHalt) && /286/.test(t.niWarumHalt) && /290\.1/.test(t.niWarumHalt) && /(^|[^0-9])3([^0-9.]|$)/.test(t.niWarumHalt), t.niWarumHalt);
  pruefe(sp + ": Tempo-Erklärung nennt 274, 274.1 und 30", /274/.test(t.niWarumTempo) && /274\.1/.test(t.niWarumTempo) && /30/.test(t.niWarumTempo));
  pruefe(sp + ": Vorfahrt-Erklärung nennt 205, 206, 301, 306", ["205", "206", "301", "306"].every((n) => t.niWarumVorfahrt.includes(n)));
  pruefe(sp + ": Aufgabentext nennt 3 Runden und 25 Sekunden", /(^|[^0-9])3([^0-9]|$)/.test(t.niBereit) && /25/.test(t.niBereit));
  pruefe(sp + ": Erklärungen und Kategorien nennen die Anlage (1, 2 oder 3)", /1/.test(t.niWarumGefahr) && /2/.test(t.niWarumVerbot) && /2/.test(t.niWarumGebot) && /1/.test(t.niKgefahr) && /2/.test(t.niKverbot) && /2/.test(t.niKgebot) && /3/.test(t.niKvorrang) && /3/.test(t.niKricht));
  pruefe(sp + ": Bonus und Punktwerte als {v} vorhanden", /\{v\}/.test(t.niRichtigMsg) && /\{v\}/.test(t.niFalschMsg) && /\{v\}/.test(t.niVollMsg));
}
for (const sp of SPRACHEN) {
  const t = TEXTE_NINJA[sp];
  pruefe(sp + ": Gefahrzeichen-Erklärung nennt, dass nicht jedes rote Dreieck ein Gefahrzeichen ist (Zeichen 205)", /205/.test(t.niWarumGefahr) && t.niWarumGefahr.length > TEXTE_NINJA.de.niWarumGefahr.length * 0.6, t.niWarumGefahr);
  pruefe(sp + ": „Richtzeichen“ steht im amtlichen Begriff (Vorfahrt-Erklärung, Kategorien), kein „guidance“/„yönlendirme“-Rest", /Richtzeichen/.test(t.niWarumVorfahrt) && /Richtzeichen/.test(t.niKvorrang) && /Richtzeichen/.test(t.niKricht) && !/guidance|yönlendirme levha/i.test(t.niWarumVorfahrt + t.niKvorrang + t.niKricht), t.niWarumVorfahrt);
}
pruefe("de: Gefahrzeichen-Erklärung mit Dreieck-Hinweis auf Zeichen 205 (Zeichen 301 ist eine gelbe Raute, kein Dreieck)", /Aber nicht jedes Dreieck mit rotem Rand warnt vor einer Gefahr: Zeichen 205 „Vorfahrt gewähren“ gehört nicht dazu\./.test(TEXTE_NINJA.de.niWarumGefahr));
pruefe("amtliche Schreibweise: Vorfahrtstraße, Haltverbot (Texte der Zeichen 306, 283, 286, 290.1 und Haltverbot-Regel)", (() => {
  const wirf = (x) => x.split("\u00ad").join("");
  return wirf(TEXTE.de.z306l) === "Vorfahrtstraße" && wirf(TEXTE.de.z283l) === "Absolutes Haltverbot" && wirf(TEXTE.de.z286l) === "Eingeschränktes Haltverbot" && /Haltverbot/.test(TEXTE_NINJA.de.niZ2901) && /Haltverbot/.test(TEXTE_NINJA.de.niRegelHalt) && /Vorfahrtstraße/.test(TEXTE_NINJA.de.niWarumVorfahrt)
    && !/Halteverbot|Vorfahrtsstraße/.test(JSON.stringify(TEXTE_NINJA.de) + wirf(TEXTE.de.z306l + TEXTE.de.z283l + TEXTE.de.z286l));
})());
pruefe("keine Bußgelder / Euro in den Texten", SPRACHEN.every((sp) => schluessel.every((s) => !/€|euro|bußgeld|bussgeld|\bfine\b|flensburg/i.test(TEXTE_NINJA[sp][s]))));
// Schildnamen: in jeder Sprache vorhanden (z…l aus texte.js oder niZ… aus texte-ninja.js), je Schild verschieden
for (const sp of SPRACHEN) {
  const namen = N.SCHILDER.map((s) => text(sp, s.name));
  pruefe(sp + ": jedes Schild hat einen Namen in der Sprache", namen.every((n) => typeof n === "string" && n.trim()), N.SCHILDER.filter((s, i) => !namen[i]).map((s) => s.id).join(","));
  const einmalig = new Set(N.SCHILDER.filter((s) => s.erkl === s.id || s.id === "z274-50").map((s) => String(text(sp, s.name)).replace(/­/g, "")));
  pruefe(sp + ": Schildnamen sind unterschiedlich (kein Schild mit dem Namen eines anderen)", einmalig.size === N.SCHILDER.filter((s) => s.erkl === s.id || s.id === "z274-50").length, "verschieden: " + einmalig.size);
  const kats = Object.keys(KAT_ANLAGE).map((k) => text(sp, k));
  pruefe(sp + ": alle 10 Kategorien übersetzt und verschieden", kats.every((x) => x && x.trim()) && new Set(kats).size === 10);
}
// Schlüssel im Code <-> Schlüssel in den Texten
const code = readFileSync(join(wurzel, "spiele/ninja.js"), "utf8");
const imCode = new Set([...code.matchAll(/k\.tx\("(ni[A-Z][A-Za-z0-9_]*)"/g)].map((m) => m[1]));
const fest = new Set();
N.SCHILDER.forEach((s) => { fest.add(s.name); fest.add(s.kat); });
N.REGELN.forEach((r) => { fest.add(r.text); fest.add(r.warum); });
const imEintrag = new Set([...SPIELE_EINTRAG.matchAll(/(?:name|kurz|bestKey): "(ni[A-Z][A-Za-z0-9_]*)"|k\.tx\("(ni[A-Z][A-Za-z0-9_]*)"/g)].map((m) => m[1] || m[2]));
// Schlüssel, die der Code über eine Tabelle holt (Status-Wörter)
const statusSchluessel = ["niStFalsch", "niStVerpasst", "niStGewischt", "niStGemieden"];
const ohneText = [...imCode].filter((s) => !(s in TEXTE_NINJA.de));
pruefe("jeder im Code benutzte Textschlüssel existiert", ohneText.length === 0, ohneText.join(","));
pruefe("Status-Schlüssel im Code vorhanden", statusSchluessel.every((s) => code.includes('"' + s + '"')));
const unbenutzt = schluessel.filter((s) => !imCode.has(s) && !fest.has(s) && !imEintrag.has(s) && !statusSchluessel.includes(s));
pruefe("kein Text ohne Verwendung", unbenutzt.length === 0, unbenutzt.join(","));
const andere = [...code.matchAll(/k\.tx\("([A-Za-z0-9_]+)"/g)].map((m) => m[1]).filter((s) => !/^ni[A-Z]/.test(s) && !(s in TEXTE.de));
pruefe("geteilte Schlüssel aus texte.js vorhanden (start, nochmal, uebung, platz, memoryZeichen …)", andere.length === 0, andere.join(","));

/* ===================== Dateien: Stil, Touch, Variablen ===================== */
console.log("Stil und Bedienung");
const css = readFileSync(join(wurzel, "spiele/ninja.css"), "utf8");
const index = readFileSync(join(wurzel, "index.html"), "utf8");
const definiert = new Set([...index.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const benutzt = [...new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))];
pruefe("ninja.css benutzt nur Variablen, die :root der App kennt", benutzt.every((v) => definiert.has(v)), benutzt.filter((v) => !definiert.has(v)).join(","));
pruefe("ninja.css: keine festen Hex-Farben (Dunkelmodus)", !/#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).join(","));
const touchNone = [...css.matchAll(/([^{}]+)\{[^{}]*touch-action:\s*none/g)].map((m) => m[1].trim());
pruefe("touch-action:none NUR auf Feld und Schildern während des Spiels", touchNone.length >= 1 && touchNone.every((sel) => /\.ni-spielfeld\.aktiv/.test(sel)), touchNone.join(" | "));
pruefe("ninja.css: prefers-reduced-motion beachtet", /prefers-reduced-motion:\s*reduce/.test(css));
pruefe("ninja.css: Querformat-Regel vorhanden", /max-height:\s*520px/.test(css));
pruefe("ninja.js lädt ninja.css selbst per <link>", /createElement\("link"\)/.test(code) && /ninja\.css/.test(code) && /data-ninja-css/.test(code));
pruefe("ninja.js: Pointer Events, kein Touch-Event", /pointerdown/.test(code) && /pointermove/.test(code) && !/touchstart|touchmove/.test(code));
pruefe("ninja.js: prefers-reduced-motion wird abgefragt (langsamer)", /prefers-reduced-motion/.test(code) && /wenigBewegung\(\)/.test(code));
pruefe("ninja.js: Tastatur/Screenreader: Schilder sind <button> mit Namen als aria-label und click-Behandlung", /createElement\("button"\)/.test(code) && /aria-label/.test(code) && /addEventListener\("click"/.test(code));
pruefe("ninja.js: Zufall über Math.random (im Test ersetzbar)", /Math\.random/.test(code));
pruefe("ninja.js: ruft start vor dem Durchgang und ergebnis mit richtig/falsch/voll", /aktion: "start", spiel: "ninja"/.test(code) && /aktion: "ergebnis"[^}]*richtig: e\.richtig, falsch: e\.falsch, voll: e\.voll/.test(code));
pruefe("ninja.js: räumt in zerstoeren() Zeitgeber und Listener auf", /zerstoeren/.test(code) && /removeEventListener\("visibilitychange"/.test(code) && /removeEventListener\("resize"/.test(code) && /cancelAnimationFrame/.test(code));
pruefe("ninja.js exportiert starte", typeof N.starte === "function");
pruefe("geschützte Dateien unverändert: spiele.css kennt .ni- nicht", !/\.ni-/.test(readFileSync(join(wurzel, "spiele/spiele.css"), "utf8")));
pruefe("SPIELE-Eintrag: id ninja, nurVorschau true, Symbol 24x24 currentColor", /id: "ninja"/.test(SPIELE_EINTRAG) && /nurVorschau: true/.test(SPIELE_EINTRAG) && /viewBox="0 0 24 24"/.test(SPIELE_EINTRAG) && /currentColor/.test(SPIELE_EINTRAG) && /name: "niName"/.test(SPIELE_EINTRAG));

/* ===================== Server-Eintrag ===================== */
console.log("Server-Eintrag");
const echteFunction = readFileSync(join(wurzel, "werkzeuge/edge-functions/academy-spiele.ts"), "utf8");
pruefe("Konstante und Eintrag „ninja“ stehen in der echten Function, die Testbasis zeigt denselben Text", /\n\s*ninja:\s*\{/.test(echteFunction) && echteFunction.includes(SERVER_KONSTANTE.split("\n").pop()) && echteFunction.includes(SERVER_EINTRAG.trim()));
const konst = Object.fromEntries([...echteFunction.match(/const NINJA = \{([^}]*)\}/)[1].matchAll(/([A-Z_]+): ([\d_]+)/g)].map((m) => [m[1], +m[2].replace(/_/g, "")]));
pruefe("Zahlen im Server = Zahlen im Spiel", konst.RUNDEN === N.RUNDEN && konst.N_RICHTIG === N.N_RICHTIG && konst.N_FALSCH === N.N_FALSCH && konst.PKT === N.PKT_RICHTIG &&
  konst.ABZUG === N.ABZUG_FALSCH && konst.BONUS === N.BONUS_VOLL && konst.MIN_RUNDE_MS === N.MIN_RUNDE_MS, JSON.stringify(konst));
/* Vorlauf: der kürzeste ehrliche Durchgang aus dem echten Fahrplan (reduzierte Bewegung, jedes Schild sofort gewischt, sobald das letzte erscheint) */
let kuerzesterDurchgang = Infinity;
for (let seed = 1; seed <= 40; seed++) for (const regel of N.REGELN) {
  let summe = 0;
  for (let nr = 0; nr < N.RUNDEN; nr++) { const p = N.neueRunde(regel, nr, zufall(seed * 104729 + nr), true); summe += Math.max(...p.schilder.map((x) => x.t)); }
  kuerzesterDurchgang = Math.min(kuerzesterDurchgang, summe);
}
pruefe("Vorlauf im Server (" + konst.VORLAUF_MS + " ms) liegt unter dem kürzesten ehrlichen Durchgang (" + Math.round(kuerzesterDurchgang) + " ms, 3 Runden, reduzierte Bewegung)", konst.VORLAUF_MS <= kuerzesterDurchgang - 1000, String(kuerzesterDurchgang));
pruefe("Vorlauf ist nicht zu großzügig (höchstens 8 s unter dem kürzesten Durchgang) und liegt über dem alten Wert 3 x MIN_RUNDE_MS", kuerzesterDurchgang - konst.VORLAUF_MS <= 8000 && konst.VORLAUF_MS > N.RUNDEN * N.MIN_RUNDE_MS, String(konst.VORLAUF_MS));
pruefe("kürzester Durchgang ca. 49,6 s (3 Runden, letztes Schild erscheint bei 25 s − Dauer − 0,5 s)", Math.abs(kuerzesterDurchgang - 49650) < 100, String(kuerzesterDurchgang));

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
    const s = await rufe(t({ aktion: "start", spiel: "ninja" }));
    if (!s.runde) return { status: 0, error: "kein Start: " + JSON.stringify(s) };
    if (!(optionen && optionen.zuSchnell)) warte((optionen && optionen.warte) || 50_000);
    const r = await rufe(t({ aktion: "ergebnis", runde: s.runde, ...body }));
    return { ...r, runde: s.runde };
  }
  const ok = async (name, body) => { const r = await lauf(body); if (r.status !== 200) abw.push("sollte angenommen werden: " + name + " -> " + r.error); };
  const nein = async (name, body, fehlerName, opt) => { const r = await lauf(body, opt); if (r.status === 200 || (fehlerName && r.error !== fehlerName)) abw.push("sollte abgelehnt werden (" + fehlerName + "): " + name + " -> " + (r.status === 200 ? "angenommen" : r.error)); };

  await ok("nichts gewischt", { wert: 0, richtig: 0, falsch: 0, voll: 0 });
  await ok("ein richtiges", { wert: 10, richtig: 1, falsch: 0, voll: 0 });
  await ok("Höchstwert 330: alles richtig, alle Runden fehlerfrei", { wert: 330, richtig: 27, falsch: 0, voll: 3 });
  await ok("echt: 2 Runden fehlerfrei, in der dritten 6 richtig und 2 falsch", { wert: 2 * 110 + (60 - 30), richtig: 24, falsch: 2, voll: 2 });
  await ok("Runde mit Fehler hat Bonus verloren, aber 8 richtig", { wert: 110 + 110 + 80, richtig: 26, falsch: 0, voll: 2 });
  await ok("viele Fehler drücken Runden auf 0 (Runde nie negativ): 1 richtig, 24 falsch", { wert: 0, richtig: 1, falsch: 24, voll: 0 });
  await ok("ehrlich mit Rundenklemme: Runde 1: 2 richtig 8 falsch (0), Runde 2: 9 richtig (110)", { wert: 110, richtig: 11, falsch: 8, voll: 1 });
  await ok("untere Grenze genau (kein Rundenklemme-Effekt)", { wert: 10 * 10 - 3 * 15, richtig: 10, falsch: 3, voll: 0 });
  { const r = await lauf({ wert: 220, richtig: 18, falsch: 0, voll: 2 }, { warte: 20 * 60_000 }); if (r.status !== 200) abw.push("ehrliche Runde nach 20 Minuten (Lesen der Erklärungen) abgelehnt: " + r.error); }

  await nein("über dem Höchstwert", { wert: 331, richtig: 27, falsch: 0, voll: 3 }, "wert_ausserhalb");
  await nein("negativer Wert", { wert: -1, richtig: 0, falsch: 0, voll: 0 }, "wert_ausserhalb");
  await nein("Wert keine ganze Zahl", { wert: 10.5, richtig: 1, falsch: 0, voll: 0 }, "wert_ungueltig");
  await nein("28 richtige", { wert: 100, richtig: 28, falsch: 0, voll: 3 }, "richtig_ungueltig");
  await nein("richtig fehlt", { wert: 100, falsch: 0, voll: 0 }, "richtig_ungueltig");
  await nein("richtig als Text", { wert: 100, richtig: "10", falsch: 0, voll: 0 }, "richtig_ungueltig");
  await nein("richtig negativ", { wert: 0, richtig: -1, falsch: 0, voll: 0 }, "richtig_ungueltig");
  await nein("richtig keine ganze Zahl", { wert: 10, richtig: 1.5, falsch: 0, voll: 0 }, "richtig_ungueltig");
  await nein("25 falsche", { wert: 0, richtig: 0, falsch: 25, voll: 0 }, "falsch_ungueltig");
  await nein("falsch negativ", { wert: 100, richtig: 10, falsch: -1, voll: 0 }, "falsch_ungueltig");
  await nein("falsch keine ganze Zahl", { wert: 100, richtig: 10, falsch: 0.5, voll: 0 }, "falsch_ungueltig");
  await nein("falsch fehlt", { wert: 100, richtig: 10, voll: 0 }, "falsch_ungueltig");
  await nein("4 fehlerfreie Runden", { wert: 100, richtig: 27, falsch: 0, voll: 4 }, "voll_ungueltig");
  await nein("fehlerfreie Runde ohne 9 richtige", { wert: 100, richtig: 8, falsch: 0, voll: 1 }, "voll_ungueltig");
  await nein("3 fehlerfreie Runden mit nur 20 richtigen", { wert: 100, richtig: 20, falsch: 0, voll: 3 }, "voll_ungueltig");
  await nein("voll fehlt", { wert: 100, richtig: 10, falsch: 0 }, "voll_ungueltig");
  await nein("voll negativ", { wert: 100, richtig: 10, falsch: 0, voll: -1 }, "voll_ungueltig");
  await nein("3 fehlerfreie Runden, aber 1 falsches (eine Runde hatte also einen Fehler)", { wert: 330, richtig: 27, falsch: 1, voll: 3 }, "voll_passt_nicht");
  await nein("2 fehlerfreie Runden, aber 9 falsche (mindestens 2 Runden mit Fehlern)", { wert: 220, richtig: 27, falsch: 9, voll: 2 }, "voll_passt_nicht");
  await nein("zu viele Punkte für 5 richtige ohne volle Runde", { wert: 51, richtig: 5, falsch: 0, voll: 0 }, "punkte_zu_hoch");
  await nein("Bonus ohne volle Runde geschwindelt", { wert: 70, richtig: 5, falsch: 0, voll: 0 }, "punkte_zu_hoch");
  await nein("mehr als 20 Bonus je volle Runde", { wert: 121, richtig: 9, falsch: 0, voll: 1 }, "punkte_zu_hoch");
  await nein("Punkte für nichts Gewischtes", { wert: 100, richtig: 0, falsch: 0, voll: 0 }, "punkte_zu_hoch");
  await nein("weniger Punkte als möglich (Fehler stimmen nicht)", { wert: 84, richtig: 10, falsch: 1, voll: 0 }, "punkte_zu_niedrig");
  await nein("volle Runde, aber Punkte ohne Bonus (zu niedrig)", { wert: 90, richtig: 9, falsch: 0, voll: 1 }, "punkte_zu_niedrig");
  await nein("zu schnell (Runde eben erst begonnen)", { wert: 10, richtig: 1, falsch: 0, voll: 0 }, "zu_schnell", { zuSchnell: true });
  await nein("zu schnell für 3 Runden (nach 30 s)", { wert: 10, richtig: 1, falsch: 0, voll: 0 }, "zu_schnell", { warte: 30_000 });
  await nein("zu schnell (nach 44 s, Vorlauf 45 s)", { wert: 10, richtig: 1, falsch: 0, voll: 0 }, "zu_schnell", { warte: 44_000 });
  { const r = await lauf({ wert: 330, richtig: 27, falsch: 0, voll: 3 }, { warte: Math.ceil(kuerzesterDurchgang) + 100 }); if (r.status !== 200) abw.push("schnellster ehrlicher Durchgang (" + Math.round(kuerzesterDurchgang) + " ms, reduzierte Bewegung) abgelehnt: " + r.error); }

  // Runde nur einmal einlösbar
  db.academy_spiele_runden.length = 0;
  const s = await rufe(t({ aktion: "start", spiel: "ninja" })); warte(50_000);
  const a = await rufe(t({ aktion: "ergebnis", runde: s.runde, wert: 30, richtig: 3, falsch: 0, voll: 0 }));
  const b = await rufe(t({ aktion: "ergebnis", runde: s.runde, wert: 30, richtig: 3, falsch: 0, voll: 0 }));
  if (a.status !== 200 || b.status === 200) abw.push("Runde ist nicht genau einmal einlösbar: " + a.status + "/" + b.status);
  // Runde nach 31 Minuten abgelaufen
  db.academy_spiele_runden.length = 0;
  const s2 = await rufe(t({ aktion: "start", spiel: "ninja" })); warte(31 * 60_000);
  const c = await rufe(t({ aktion: "ergebnis", runde: s2.runde, wert: 10, richtig: 1, falsch: 0, voll: 0 }));
  if (c.status === 200) abw.push("nach 31 Minuten noch angenommen");
  // Ranking: größer ist besser, Bestwert bleibt, Rekord wird erkannt
  aufbau(); db.academy_spiele_runden.length = 0;
  const wertAn = async (w, r) => { db.academy_spiele_runden.length = 0; const st = await rufe(t({ aktion: "start", spiel: "ninja" })); warte(50_000); return rufe(t({ aktion: "ergebnis", runde: st.runde, wert: w, richtig: r, falsch: 0, voll: 0 })); };
  const r1 = await wertAn(50, 5), r2 = await wertAn(30, 3), r3 = await wertAn(70, 7);
  if (!(r1.rekord === true && r2.rekord === false && r2.bestwert === 50 && r3.rekord === true && r3.bestwert === 70)) abw.push("Ranking: größer ist besser stimmt nicht " + JSON.stringify([r1.rekord, r2.rekord, r2.bestwert, r3.rekord, r3.bestwert]));
  const rl = await rufe(t({ aktion: "rangliste", spiel: "ninja", limit: 10 }));
  if (!(rl.status === 200 && rl.top && rl.top[0] && rl.top[0].wert === 70)) abw.push("Rangliste liefert nicht den besten Wert: " + JSON.stringify(rl));
  return abw;
}

const rufeEcht = await serverMitEintrag();
const abwEcht = await serverFaelle(rufeEcht);
pruefe("Server mit Eintrag: alle Fälle wie erwartet (angenommen/abgelehnt/einmal/Ablauf/Ranking)", abwEcht.length === 0, abwEcht.join(" | "));

/* Prüfung der Prüfung: fehlerhafte Einträge müssen auffallen */
console.log("Prüfung der Prüfung (absichtliche Fehler im Server-Eintrag)");
const mutationen = [
  ["Höchstwert zu hoch", (e) => e.replace("NINJA.N_RICHTIG * NINJA.PKT + NINJA.BONUS)", "NINJA.N_RICHTIG * NINJA.PKT + NINJA.BONUS) + 50")],
  ["Obergrenze für Punkte entfernt", (e) => e.replace(/if \(wert > r \* NINJA\.PKT[^\n]*\n/, "")],
  ["Untergrenze für Punkte entfernt", (e) => e.replace(/if \(wert < r \* NINJA\.PKT[^\n]*\n/, "")],
  ["Bonus nicht in der Untergrenze", (e) => e.replace(" + v * NINJA.BONUS) return \"punkte_zu_niedrig\"", ") return \"punkte_zu_niedrig\"")],
  ["Bonus je Runde nicht begrenzt (v * 60)", (e) => e.replace("r * NINJA.PKT + v * NINJA.BONUS) return", "r * NINJA.PKT + v * 60) return")],
  ["volle Runde ohne 9 richtige Schilder", (e) => e.replace(" || v * NINJA.N_RICHTIG > r", "")],
  ["volle Runden trotz vieler falscher", (e) => e.replace(/if \(v > NINJA\.RUNDEN - Math\.ceil[^\n]*\n/, "")],
  ["falsch nicht begrenzt", (e) => e.replace(" || f > NINJA.RUNDEN * NINJA.N_FALSCH", "")],
  ["richtig nicht begrenzt", (e) => e.replace(" || r > NINJA.RUNDEN * NINJA.N_RICHTIG", "")],
  ["richtig nicht als ganze Zahl geprüft", (e) => e.replace("if (!istGanz(r) || r < 0", "if (r < 0")],
  ["voll nicht als ganze Zahl geprüft", (e) => e.replace("if (!istGanz(v) || v < 0", "if (v < 0")],
  ["Vorlauf auf 0", (e) => e.replace("vorlauf_ms: NINJA.VORLAUF_MS", "vorlauf_ms: 0")],
  ["Vorlauf nur 1 Runde", (e) => e.replace("vorlauf_ms: NINJA.VORLAUF_MS", "vorlauf_ms: NINJA.MIN_RUNDE_MS")],
  ["Ranking aufsteigend (kleiner ist besser)", (e) => e.replace("aufsteigend: false, min: 0, max: NINJA", "aufsteigend: true, min: 0, max: NINJA")],
  ["Runde nur 1 Minute offen", (e) => e.replace("runde_max_ms: 1_800_000,\n    pruefe: (wert, body) => {\n      const r = body.richtig", "runde_max_ms: 60_000,\n    pruefe: (wert, body) => {\n      const r = body.richtig")],
  ["Abzug für falsche falsch (0)", (e) => e.replace("f * NINJA.ABZUG", "f * 0")],
  ["pruefe-Funktion fehlt ganz", (e) => e.replace("pruefe: (wert, body) => {\n      const r = body.richtig", "pruefeX: (wert, body) => {\n      const r = body.richtig")]
];
for (const [name, fn] of mutationen) {
  let angeschlagen = false, aendert = true;
  try {
    const abw = await serverFaelle(await serverMitEintrag(fn));
    angeschlagen = abw.length > 0;
  } catch (e) { angeschlagen = true; }
  pruefe("Fehler fällt auf: " + name, angeschlagen);
}
// Kontrolle, dass die Ersetzungen überhaupt etwas ändern (sonst wäre die Prüfung der Prüfung wertlos)
for (const [name, fn] of mutationen) pruefe("Mutation ändert den Eintrag: " + name, fn(SERVER_EINTRAG) !== SERVER_EINTRAG);

console.log("\n" + bestanden + " bestanden, " + fehler + " fehlgeschlagen");
