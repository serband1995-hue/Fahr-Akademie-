/* Spiel 7: Gefahren finden (Familie C: Bild antippen), 07.10.2026.
   Ein selbst gezeichnetes Straßenbild von oben (innerorts) zeigt 4–5 Gefahren. Man tippt alle Gefahren an.
   Pro Durchgang 4 Bilder (aus 6, zufällig gemischt), je Bild 30 Sekunden. Ein Tipp ohne Gefahr kostet Punkte und 2 Sekunden.
   Nach jedem Bild werden ALLE Gefahren markiert und erklärt: warum gefährlich, wie verhält man sich richtig (Lerneffekt).

   Punkte (reine Rechnung, siehe punkteBild):
     je gefundener Gefahr +100, je falschem Tipp −30 (ein Bild nie unter 0), alle Gefahren des Bildes gefunden: +2 je übrige Sekunde.
   Ranking: Punkte (größer ist besser). Der Server prüft gefunden / fehltipps / vollstaendig gegen den Wert;
   siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „gefahren“.

   Fachliche Quellen der Erklärungen: StVO (§ 3 Abs. 1 und 2a, § 5, § 6, § 9, § 10, § 14, § 20, § 26) und Fahrschul-Lehrstoff;
   Zusammenstellung je Gefahr im Bericht zu diesem Spiel. Keine Bußgelder, keine Verkehrszeichen außer den amtlichen Dateien
   aus verkehr/vorfahrt-zeichen/ (hier Zeichen 274.1 und 350). Figuren sind neutrale Fantasie-Figuren, Fahrzeuge ohne Kennzeichen. */
import { rankingKarte, profilKarte } from "./rahmen.js";

/* ===================== Regeln (reine Rechnung) ===================== */
export const BILD_B = 360, BILD_H = 240;           // Koordinaten aller Bilder (viewBox)
export const BILDER_JE_RUNDE = 4;
export const MIN_JE_BILD = 4, MAX_JE_BILD = 6;
export const ZEIT_MS = 30000;                      // Zeit je Bild
export const STRAFE_MS = 2000;                     // Zeit, die ein falscher Tipp kostet
export const PKT_GEFAHR = 100, ABZUG_TIPP = 30, BONUS_JE_S = 2;
export const SPERRE_MS = 250;                      // nach einem falschen Tipp zählt ein Tipp 0,25 s lang nicht (kein Doppeltipp)
export const MIN_RADIUS_PX = 22;                   // Trefferfläche mindestens 44 px breit (Radius 22), auch auf kleinen Handys
export const BONUS_MAX = Math.floor(ZEIT_MS / 1000) * BONUS_JE_S;   // 60

/* Punkte eines Bildes. rest = übrige Zeit in ms (nach Abzug der Strafzeit), alle = jede Gefahr gefunden. Nie unter 0. */
export function punkteBild(gefunden, fehltipps, restMs, alle) {
  const bonus = alle ? Math.floor(Math.max(0, restMs) / 1000) * BONUS_JE_S : 0;
  return Math.max(0, gefunden * PKT_GEFAHR - fehltipps * ABZUG_TIPP + bonus);
}
/* Höchstwerte, die der Server übernimmt (gleiche Zahlen im Eintrag „gefahren“ der Function) */
export const MAX_GEFUNDEN = BILDER_JE_RUNDE * MAX_JE_BILD;                 // 24
export const MAX_FEHLTIPPS = BILDER_JE_RUNDE * Math.floor(ZEIT_MS / STRAFE_MS);   // 60
export const MAX_PUNKTE = MAX_GEFUNDEN * PKT_GEFAHR + BILDER_JE_RUNDE * BONUS_MAX;   // 2640

/* Welche Gefahr trifft ein Tipp (x, y in Bildkoordinaten)? minRadius = Mindest-Trefferradius in Bildeinheiten (aus Pixeln). Nächste Gefahr gewinnt. */
export function treffer(gefahren, x, y, minRadius) {
  let best = null, bestD = Infinity;
  gefahren.forEach(function (g) {
    const d = Math.hypot(x - g.x, y - g.y);
    if (d <= Math.max(g.r, minRadius || 0) && d < bestD) { best = g; bestD = d; }
  });
  return best;
}

/* ===================== Zeichnen (Texte-freie SVG-Teile) ===================== */
const ASPHALT = "#4a4d54", ASPHALT_NASS = "#3b424d", GRAS = "#7da45f", GEHWEG = "#c9c3b4", HECKE = "#3f7a43", DACH1 = "#b5593f", DACH2 = "#7b8794";
const R = (x, y, w, h, fill, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || "") + "/>";
const KONTUR = ' stroke="rgba(0,0,0,.45)" stroke-width="1"';
const BILD = (name) => new URL("../verkehr/vorfahrt-zeichen/" + name, import.meta.url).href;
const zeichenImg = (name, x, y, b) => '<image href="' + BILD(name) + '" x="' + x + '" y="' + y + '" width="' + b + '" height="' + b + '"/>';

/* Auto von oben, Länge 34, Breite 17, Mitte (x, y). Standard: Front nach rechts. o: links (Front links), dreh (Grad), brems, blink (orange Blinker an allen Ecken), blinkSeite (-1 oben, 1 unten, 0 beide) */
function auto(x, y, farbe, o) {
  o = o || {};
  const spiegel = o.links ? " scale(-1 1)" : "";
  let s = '<g transform="translate(' + x + " " + y + ") rotate(" + (o.dreh || 0) + ")" + spiegel + '">' +
    '<rect x="-17" y="-8.5" width="34" height="17" rx="5" fill="' + farbe + '"' + KONTUR + "/>" +
    '<rect x="3" y="-6.2" width="7" height="12.4" rx="1.5" fill="#cfe3f2"/><rect x="-13" y="-6" width="5" height="12" rx="1.5" fill="#cfe3f2"/>' +
    '<rect x="-7" y="-6" width="10" height="12" rx="2" fill="rgba(0,0,0,.2)"/>' +
    '<rect x="15" y="-7.5" width="2.6" height="4" rx="1" fill="#fff6c2"/><rect x="15" y="3.5" width="2.6" height="4" rx="1" fill="#fff6c2"/>' +
    '<rect x="-17.6" y="-7.5" width="2.6" height="4" rx="1" fill="' + (o.brems ? "#ff2a2a" : "#9a3b3b") + '"/><rect x="-17.6" y="3.5" width="2.6" height="4" rx="1" fill="' + (o.brems ? "#ff2a2a" : "#9a3b3b") + '"/>';
  if (o.blink) {
    const ys = o.blinkSeite === 1 ? [8.5] : o.blinkSeite === -1 ? [-8.5] : [-8.5, 8.5];
    ys.forEach(function (yy) { s += '<circle class="ge-blink" cx="-16" cy="' + yy + '" r="2.4"/><circle class="ge-blink" cx="16" cy="' + yy + '" r="2.4"/>'; });
  }
  return s + "</g>";
}
/* Bus von oben, Länge 76, Breite 22, Front nach rechts */
function bus(x, y, blink) {
  let s = '<g transform="translate(' + x + " " + y + ')">' +
    '<rect x="-38" y="-11" width="76" height="22" rx="5" fill="#c9473d"' + KONTUR + "/>" +
    '<rect x="-34" y="-7" width="60" height="14" rx="2" fill="rgba(255,255,255,.55)"/>';
  for (let i = -26; i <= 18; i += 11) s += '<rect x="' + i + '" y="-7" width="1.6" height="14" fill="rgba(0,0,0,.25)"/>';
  s += '<rect x="28" y="-8" width="8" height="16" rx="2" fill="#cfe3f2"/><rect x="-6" y="-4" width="16" height="8" rx="2" fill="rgba(0,0,0,.18)"/>';
  if (blink) [[-36, -10], [-36, 10], [36, -10], [36, 10]].forEach(function (p) { s += '<circle class="ge-blink" cx="' + p[0] + '" cy="' + p[1] + '" r="2.6"/>'; });
  return s + "</g>";
}
/* Lkw von oben (Koffer + Führerhaus), Länge 66, Breite 22, Front nach rechts; blinkSeite 1 = Blinker unten (rechts in Fahrtrichtung nach Osten) */
function lkw(x, y, blinkUnten) {
  let s = '<g transform="translate(' + x + " " + y + ')">' +
    '<rect x="-33" y="-11" width="46" height="22" rx="3" fill="#e9e9e4"' + KONTUR + "/>" +
    '<rect x="15" y="-10" width="18" height="20" rx="4" fill="#2d6cdf"' + KONTUR + "/>" +
    '<rect x="24" y="-8" width="7" height="16" rx="2" fill="#cfe3f2"/>';
  if (blinkUnten) s += '<circle class="ge-blink" cx="-32" cy="10" r="2.6"/><circle class="ge-blink" cx="32" cy="10" r="2.6"/>';
  return s + "</g>";
}
/* Lieferwagen von oben, Länge 44, Breite 20, Front nach rechts */
function lieferwagen(x, y, blink) {
  let s = '<g transform="translate(' + x + " " + y + ')">' +
    '<rect x="-22" y="-10" width="44" height="20" rx="4" fill="#f0f0ea"' + KONTUR + "/>" +
    '<rect x="8" y="-8" width="11" height="16" rx="3" fill="#cfe3f2"/><rect x="-18" y="-6" width="24" height="12" rx="2" fill="rgba(0,0,0,.1)"/>';
  if (blink) s += '<circle class="ge-blink" cx="-21" cy="-9" r="2.4"/><circle class="ge-blink" cx="21" cy="-9" r="2.4"/><circle class="ge-blink" cx="-21" cy="9" r="2.4"/><circle class="ge-blink" cx="21" cy="9" r="2.4"/>';
  return s + "</g>";
}
/* Person von oben (neutrale Figur): Schultern + Kopf; kind = kleiner, mit Ranzen; dreh = Blickrichtung in Grad (0 = nach rechts) */
function person(x, y, farbe, kind, dreh) {
  const rx = kind ? 3.2 : 4.2, ry = kind ? 4.8 : 6.4, kopf = kind ? 2.9 : 3.5;
  return '<g transform="translate(' + x + " " + y + ") rotate(" + (dreh || 0) + ')">' +
    (kind ? '<rect x="-6" y="-3.2" width="3.6" height="6.4" rx="1.2" fill="#d9a521"' + KONTUR + "/>" : "") +
    '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '" fill="' + farbe + '"' + KONTUR + "/>" +
    '<circle cx="1" cy="0" r="' + kopf + '" fill="#f0dcc0" stroke="rgba(0,0,0,.5)" stroke-width=".9"/></g>';
}
function radler(x, y, dreh, farbe) {
  return '<g transform="translate(' + x + " " + y + ") rotate(" + (dreh || 0) + ')">' +
    '<rect x="-11" y="-1.5" width="22" height="3" rx="1.5" fill="#222"/><rect x="6" y="-5.5" width="2" height="11" rx="1" fill="#222"/>' +
    '<ellipse cx="-1" cy="0" rx="3.6" ry="6" fill="' + (farbe || "#2d9cdb") + '"' + KONTUR + "/>" +
    '<circle cx="1.5" cy="0" r="3.2" fill="#f0dcc0" stroke="rgba(0,0,0,.5)" stroke-width=".9"/></g>';
}
function ball(x, y) {
  return '<g transform="translate(' + x + " " + y + ')"><circle r="5" fill="#fff"' + KONTUR + '/><path d="M-5 0 A5 5 0 0 1 0 -5 M5 0 A5 5 0 0 1 0 5" fill="none" stroke="#e0442a" stroke-width="2"/></g>';
}
function hund(x, y, dreh) {
  return '<g transform="translate(' + x + " " + y + ") rotate(" + (dreh || 0) + ')">' +
    '<ellipse cx="0" cy="0" rx="7" ry="3.4" fill="#8a5a36"' + KONTUR + '/><circle cx="8" cy="0" r="3" fill="#8a5a36"' + KONTUR + '/><path d="M-7 0 Q-11 -3 -12 -6" fill="none" stroke="#8a5a36" stroke-width="2" stroke-linecap="round"/></g>';
}
function baum(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#3d7040"' + KONTUR + '/><circle cx="' + (x - r * 0.25) + '" cy="' + (y - r * 0.25) + '" r="' + r * 0.6 + '" fill="#4f8a4a"/>'; }
function haus(x, y, b, h, dach) {
  return R(x, y, b, h, dach, ' rx="2"' + KONTUR) + '<path d="M' + x + " " + (y + h / 2) + "H" + (x + b) + '" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>' + R(x, y + h / 2, b, h / 2, "rgba(0,0,0,.14)");
}
function hecke(x, y, b, h) { return R(x, y, b, h, HECKE, ' rx="3"' + KONTUR); }
function mittellinie(y, x0, x1) { let s = ""; for (let x = x0; x < x1; x += 26) s += R(x, y - 1, 13, 2, "#e9e9e9"); return s; }
function mittellinieV(x, y0, y1) { let s = ""; for (let y = y0; y < y1; y += 26) s += R(x - 1, y, 2, 13, "#e9e9e9"); return s; }
function absperrung(x, y, b, h) {   // rot-weiße Schranke
  let s = R(x, y, b, h, "#fff", KONTUR);
  const hor = b >= h, n = Math.round((hor ? b : h) / (hor ? h * 1.2 : b * 1.2));
  for (let i = 0; i < n; i += 2) s += hor ? R(x + (b / n) * i, y, b / n, h, "#d6382b") : R(x, y + (h / n) * i, b, h / n, "#d6382b");
  return s + R(x, y, b, h, "none", ' stroke="rgba(0,0,0,.5)" stroke-width="1"');
}
function leitkegel(x, y) { return '<polygon points="' + x + "," + (y - 5) + " " + (x - 4) + "," + (y + 4) + " " + (x + 4) + "," + (y + 4) + '" fill="#f0771d"' + KONTUR + "/>"; }
function arbeiter(x, y) {
  return '<g transform="translate(' + x + " " + y + ')"><ellipse rx="4.4" ry="6.4" fill="#f0771d"' + KONTUR + '/><circle cx="1" r="3.8" fill="#f2d21a" stroke="rgba(0,0,0,.5)" stroke-width=".9"/></g>';
}
function regen(n, w, h) {
  let s = '<g class="ge-regen" stroke="rgba(220,235,255,.75)" stroke-width="1" stroke-linecap="round">';
  for (let i = 0; i < n; i++) { const x = (i * 47 + (i % 5) * 13) % w, y = (i * 29 + (i % 7) * 11) % h; s += '<path d="M' + x + " " + y + "l-3 7\"/>"; }
  return s + "</g>";
}
function laub(x, y) {
  const farben = ["#c8641d", "#e0a21f", "#a8431a", "#d98a1c"];
  let s = "";
  [[0, 0], [9, 4], [-8, 5], [4, -8], [-3, 10], [13, -3], [-12, -4], [18, 8], [-16, 9], [8, 12]].forEach(function (p, i) {
    s += '<ellipse cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" rx="4.4" ry="2.6" fill="' + farben[i % 4] + '" transform="rotate(' + (i * 37) + " " + (x + p[0]) + " " + (y + p[1]) + ')"/>';
  });
  return s;
}

/* ---- 1. Wohnstraße ---- */
function szeneWohn() {
  let s = R(0, 0, BILD_B, BILD_H, GRAS);
  s += haus(18, 6, 84, 46, DACH1) + haus(128, 8, 84, 44, DACH2) + haus(232, 6, 56, 46, DACH1) + haus(332, 8, 26, 44, DACH2);
  s += hecke(0, 56, 292, 9) + hecke(330, 56, 30, 9);
  s += R(0, 66, BILD_B, 12, GEHWEG) + R(296, 56, 30, 22, "#b8b2a3");
  s += R(0, 78, BILD_B, 84, ASPHALT) + R(0, 78, BILD_B, 1.5, "rgba(255,255,255,.35)") + R(0, 160.5, BILD_B, 1.5, "rgba(255,255,255,.35)");
  s += mittellinie(120, 6, BILD_B) + R(0, 101, BILD_B, 1, "rgba(255,255,255,.3)") + R(0, 139, BILD_B, 1, "rgba(255,255,255,.3)");
  s += R(0, 162, BILD_B, 12, GEHWEG) + hecke(0, 176, BILD_B, 9) + haus(30, 192, 80, 40, DACH2) + haus(150, 192, 80, 40, DACH1) + haus(260, 192, 80, 40, DACH2);
  // Tempo-30-Zone (amtliches Zeichen 274.1)
  s += R(14, 62, 2, 6, "#777") + zeichenImg("z2741.svg", 4, 38, 24);
  // parkende Autos oben (Front nach links), Lücke bei x 102..158
  [[40, "#2d6cdf"], [85, "#b24ec6"], [177, "#2e9e5b"], [217, "#e8e8e8"], [257, "#d9a521"]].forEach(function (c) { s += auto(c[0], 90, c[1], { links: true }); });
  // parkende Autos unten (Front nach rechts), Lücke bei x 67..83
  [[50, "#e0442a"], [100, "#2d6cdf"], [150, "#e8e8e8"], [250, "#2e9e5b"]].forEach(function (c) { s += auto(c[0], 151, c[1]); });
  s += auto(205, 151, "#d9a521", { brems: true, blink: true, blinkSeite: -1 });
  // Autotür geht auf (Auto unten rechts)
  s += auto(305, 151, "#b24ec6") + '<g transform="translate(296 142.5) rotate(-58)"><rect x="0" y="-1.5" width="14" height="3" rx="1.2" fill="#b24ec6"' + KONTUR + "/></g>";
  // Kind zwischen den Autos
  s += person(75, 146, "#2d9cdb", true, -90);
  // Ball rollt aus der Lücke
  s += '<path d="M134 92 L137 100" stroke="rgba(255,255,255,.7)" stroke-width="1.6" stroke-dasharray="3 3"/>' + ball(138, 106);
  // verdeckte Ausfahrt: Auto schaut aus der Einfahrt, Hecke davor
  s += auto(311, 60, "#e0442a", { dreh: 90 }) + hecke(286, 56, 10, 9) + hecke(326, 56, 4, 9);
  return { svg: s, hazards: [
    { id: "ball", typ: "ball", x: 138, y: 106, r: 27 },
    { id: "zwischen", typ: "zwischen", x: 75, y: 147, r: 27 },
    { id: "fahrer", typ: "fahrer", x: 205, y: 151, r: 27 },
    { id: "tuer", typ: "tuer", x: 303, y: 148, r: 27 },
    { id: "ausfahrt", typ: "ausfahrt", x: 311, y: 74, r: 27 }
  ] };
}

/* ---- 2. Bushaltestelle ---- */
function szeneHalt() {
  let s = R(0, 0, BILD_B, BILD_H, GRAS);
  s += haus(20, 6, 86, 40, DACH1) + haus(140, 8, 80, 38, DACH2) + haus(256, 6, 90, 40, DACH1) + baum(118, 30, 12);
  s += R(0, 52, BILD_B, 12, GEHWEG);
  s += R(0, 64, BILD_B, 88, ASPHALT) + mittellinie(108, 6, BILD_B);
  s += R(0, 152, BILD_B, 40, GEHWEG) + R(0, 152, BILD_B, 1.5, "rgba(0,0,0,.25)") + R(0, 192, BILD_B, 48, GRAS);
  // Haltestelle: Dach, Bank (Zeichen nur als Dekoration weggelassen)
  s += R(60, 160, 62, 18, "#9fb5c4", KONTUR + ' rx="3"') + R(60, 160, 62, 18, "rgba(255,255,255,.35)") + R(64, 180, 54, 5, "#7a5a3a");
  s += baum(300, 196, 14) + baum(30, 205, 12);
  // Bus hält mit Warnblinklicht
  s += bus(168, 134, true);
  // Auto, das hinter dem Bus ankommt
  s += auto(48, 134, "#2d6cdf");
  // Kinder an der Haltestelle
  s += person(86, 167, "#d6382b", true, 90) + person(98, 172, "#2e9e5b", true, 100) + person(108, 166, "#8e44ad", true, 80) + person(97, 188, "#2d6cdf", false, -90);
  // Fußgänger tritt vor dem Bus auf die Fahrbahn (vom Auto dahinter nicht zu sehen)
  s += person(230, 118, "#d9a521", false, -90);
  // Radfahrer vor dem Bus in der eigenen Spur
  s += radler(305, 136, 0);
  // Gegenverkehr
  s += auto(255, 90, "#e8e8e8", { links: true });
  return { svg: s, hazards: [
    { id: "busblinker", typ: "busblinker", x: 168, y: 134, r: 28 },
    { id: "haltestelle", typ: "haltestelle", x: 96, y: 170, r: 28 },
    { id: "hinterfahrzeug", typ: "hinterfahrzeug", x: 230, y: 116, r: 24 },
    { id: "radfahrer", typ: "radfahrer", x: 305, y: 136, r: 28 }
  ] };
}

/* ---- 3. Kreuzung ---- */
function szeneKreuzung() {
  let s = R(0, 0, BILD_B, BILD_H, GRAS);
  s += haus(10, 6, 112, 52, DACH1) + haus(236, 6, 112, 40, DACH2) + haus(10, 188, 112, 46, DACH2) + haus(236, 190, 112, 44, DACH1);
  s += R(0, 66, BILD_B, 14, GEHWEG) + R(0, 168, BILD_B, 14, GEHWEG);
  s += R(142, 0, 16, 240, GEHWEG) + R(202, 0, 16, 240, GEHWEG);
  s += R(0, 80, BILD_B, 88, ASPHALT) + R(158, 0, 44, 240, ASPHALT);
  s += mittellinie(122, 6, 150) + mittellinie(122, 214, BILD_B) + mittellinieV(180, 6, 74) + mittellinieV(180, 176, 236);
  // Radfahrstreifen unten links
  s += R(0, 148, 150, 20, "#a9524a") + R(0, 148, 150, 1.5, "rgba(255,255,255,.7)") + R(0, 124, 150, 1, "rgba(255,255,255,.0)");
  // Tiefgarage oben rechts: Rampe, Hecke
  s += R(256, 46, 36, 20, "#8f8a7c") + hecke(236, 48, 20, 16) + hecke(292, 48, 20, 16) + auto(274, 58, "#e0442a", { dreh: 90 });
  // Lkw biegt rechts ab (Blinker unten), Radfahrer daneben
  s += lkw(98, 136, true) + radler(112, 158, 0);
  // Fußgänger quert die Seitenstraße
  s += person(180, 190, "#d9a521", false, 90);
  // geparkter Lieferwagen, Person tritt vorn hervor
  s += lieferwagen(262, 152, false) + person(292, 142, "#8e44ad", false, 90);
  // Gegenverkehr
  s += auto(70, 100, "#2e9e5b", { links: true });
  return { svg: s, hazards: [
    { id: "toterwinkel", typ: "toterwinkel", x: 112, y: 157, r: 27 },
    { id: "abbiegerfuss", typ: "abbiegerfuss", x: 180, y: 190, r: 27 },
    { id: "hinterfahrzeug", typ: "hinterfahrzeug", x: 292, y: 142, r: 27 },
    { id: "ausfahrt", typ: "ausfahrt", x: 274, y: 66, r: 27 }
  ] };
}

/* ---- 4. Schulweg ---- */
function szeneSchule() {
  let s = R(0, 0, BILD_B, BILD_H, GRAS);
  s += haus(12, 8, 130, 44, DACH1) + haus(220, 8, 74, 40, DACH2) + baum(330, 30, 14);
  s += R(0, 62, BILD_B, 14, GEHWEG) + R(0, 166, BILD_B, 14, GEHWEG) + R(0, 180, BILD_B, 60, GRAS);
  s += R(0, 76, BILD_B, 90, ASPHALT) + mittellinie(121, 6, 150) + mittellinie(121, 212, BILD_B);
  // Fußgängerüberweg mit amtlichem Zeichen 350
  for (let y = 78; y < 166; y += 11) s += R(160, y, 40, 6, "#f1f1f1");
  s += R(212, 58, 2, 8, "#777") + zeichenImg("z350.svg", 206, 38, 24);
  // parkende Autos oben (Front links) + Lieferwagen in zweiter Reihe
  s += auto(36, 87, "#2d6cdf", { links: true }) + auto(84, 87, "#d9a521", { links: true }) + auto(130, 87, "#e8e8e8", { links: true });
  s += lieferwagen(70, 108, true);
  // parkende Autos unten, Kind dazwischen
  s += auto(226, 156, "#2e9e5b") + auto(274, 156, "#b24ec6") + auto(60, 156, "#e0442a");
  s += person(250, 152, "#2d9cdb", true, -90);
  // Fußgänger wartet am Überweg
  s += person(180, 172, "#d9a521", false, -90);
  // Kinder mit Ranzen am Fahrbahnrand (obere Seite, rechts)
  s += person(284, 70, "#d6382b", true, 90) + person(296, 74, "#2d6cdf", true, 80) + person(306, 68, "#2e9e5b", true, 100) + person(317, 73, "#8e44ad", true, 90);
  return { svg: s, hazards: [
    { id: "zebra", typ: "zebra", x: 180, y: 170, r: 28 },
    { id: "kinder", typ: "kinder", x: 300, y: 71, r: 28 },
    { id: "zweitereihe", typ: "zweitereihe", x: 70, y: 108, r: 28 },
    { id: "zwischen", typ: "zwischen", x: 250, y: 152, r: 28 }
  ] };
}

/* ---- 5. Nasse Straße im Herbst ---- */
function szeneHerbst() {
  let s = R(0, 0, BILD_B, BILD_H, "#6e8f59");
  // Straße: waagerecht (unten), biegt nach oben ab (rechts)
  s += R(0, 120, 300, 66, ASPHALT_NASS) + R(240, 0, 60, 186, ASPHALT_NASS);
  s += R(0, 186, BILD_B, 14, GEHWEG) + R(300, 0, 14, 200, GEHWEG) + R(0, 200, BILD_B, 40, "#6e8f59");
  // Innenseite der Kurve: Haus mit Hecke und Zaun nehmen die Sicht
  s += R(0, 108, 232, 12, GEHWEG) + R(228, 108, 12, 12, GEHWEG) + R(228, 0, 12, 108, GEHWEG);
  s += haus(60, 20, 120, 52, DACH2) + hecke(20, 82, 212, 12) + hecke(220, 20, 10, 74) + baum(34, 44, 18) + baum(200, 40, 14);
  s += mittellinie(153, 6, 236) + mittellinieV(270, 6, 112);
  s += R(0, 119, 240, 1.2, "rgba(255,255,255,.35)");
  // nasser Glanz
  s += '<ellipse cx="170" cy="168" rx="26" ry="6" fill="rgba(180,205,235,.28)"/><ellipse cx="60" cy="140" rx="20" ry="4.5" fill="rgba(180,205,235,.25)"/>';
  // nasses Laub
  s += laub(70, 172) + laub(230, 168);
  // Radfahrer vor uns
  s += radler(150, 172, 0, "#d6382b");
  // Hund ohne Leine am Straßenrand
  s += hund(204, 194, -20) + person(176, 214, "#2d6cdf", false, -20);
  s += regen(70, BILD_B, BILD_H);
  return { svg: s, hazards: [
    { id: "laub", typ: "laub", x: 70, y: 172, r: 28 },
    { id: "radfahrer", typ: "radfahrer", x: 150, y: 172, r: 27 },
    { id: "hund", typ: "hund", x: 204, y: 195, r: 24 },
    { id: "kurve", typ: "kurve", x: 236, y: 110, r: 32 }
  ] };
}

/* ---- 6. Baustelle ---- */
function szeneBau() {
  let s = R(0, 0, BILD_B, BILD_H, "#8b9a78");
  s += haus(14, 6, 110, 42, DACH1) + haus(250, 6, 96, 42, DACH2);
  s += R(0, 56, BILD_B, 18, GEHWEG) + R(0, 74, BILD_B, 88, ASPHALT) + mittellinie(118, 6, BILD_B) + R(0, 162, BILD_B, 18, GEHWEG);
  s += R(0, 180, BILD_B, 60, "#8b9a78") + haus(24, 190, 100, 40, DACH2) + haus(240, 192, 100, 38, DACH1);
  // Baustelle in der unteren Spur (Absperrung, Grube, Bagger, Kegel)
  s += R(168, 122, 90, 40, "#9a8468", KONTUR) + R(176, 130, 40, 24, "#6b5a45") + absperrung(150, 124, 8, 38) + absperrung(150, 120, 112, 6) + absperrung(262, 124, 8, 38);
  s += '<g transform="translate(240 144)"><rect x="-13" y="-8" width="26" height="16" rx="3" fill="#f2c21a"' + KONTUR + '/><rect x="-5" y="-5" width="10" height="10" rx="2" fill="#cfe3f2"/><path d="M13 0 L34 -10" stroke="#f2c21a" stroke-width="4" stroke-linecap="round"/></g>';
  [[146, 134], [132, 142], [118, 150], [104, 157]].forEach(function (p) { s += leitkegel(p[0], p[1]); });
  // Arbeiter am Rand der Baustelle
  s += arbeiter(250, 112);
  // Gehweg gesperrt, Fußgänger auf der Fahrbahn
  s += absperrung(298, 162, 8, 18) + absperrung(292, 162, 20, 5) + person(286, 150, "#8e44ad", false, 0);
  // Gegenverkehr
  s += auto(300, 98, "#2e9e5b", { links: true });
  // Radfahrer in der unteren Spur
  s += radler(42, 140, 0, "#d6382b");
  return { svg: s, hazards: [
    { id: "baustelle", typ: "baustelle", x: 190, y: 138, r: 32 },
    { id: "arbeiter", typ: "arbeiter", x: 250, y: 112, r: 24 },
    { id: "gehwegsperre", typ: "gehwegsperre", x: 286, y: 152, r: 26 },
    { id: "radfahrer", typ: "radfahrer", x: 42, y: 140, r: 27 }
  ] };
}

/* Die Bilder: id, Textschlüssel des Namens, Gefahren, Zeichnung (liefert SVG-Text). Gefahren mit Mittelpunkt (x, y) und Trefferradius r. */
const DEFS = [
  ["wohnstrasse", "geB1", szeneWohn], ["haltestelle", "geB2", szeneHalt], ["kreuzung", "geB3", szeneKreuzung],
  ["schulweg", "geB4", szeneSchule], ["herbst", "geB5", szeneHerbst], ["baustelle", "geB6", szeneBau]
];
export const BILDER = DEFS.map(function (d) {
  const szene = d[2]();
  return { id: d[0], name: d[1], gefahren: szene.hazards, svgInnen: szene.svg };
});
/* Textschlüssel einer Gefahr: Titel und Erklärung */
export const gefahrTitel = (typ) => "geH_" + typ;
export const gefahrText = (typ) => "geH_" + typ + "_x";
export const GEFAHR_TYPEN = Array.from(new Set([].concat.apply([], BILDER.map((b) => b.gefahren.map((g) => g.typ)))));

/* Vier verschiedene Bilder in zufälliger Reihenfolge */
export function waehleBilder(rnd) {
  const zufall = rnd || Math.random;
  const idx = BILDER.map((b, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  return idx.slice(0, BILDER_JE_RUNDE).map((i) => BILDER[i]);
}

export function bildSvg(bild, k) {
  return '<svg class="ge-svg" data-bild="' + bild.id + '" viewBox="0 0 ' + BILD_B + " " + BILD_H + '" role="img" aria-label="' + k.esc(k.tx("geSzeneAria")) + '" focusable="false" preserveAspectRatio="xMidYMid meet">' +
    bild.svgInnen + '<g class="ge-marken"></g></svg>';
}

/* ===================== Bildschirm ===================== */
let cssVersprechen = null;
function eigenesCssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-gefahren-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = new URL("./gefahren.css", import.meta.url).href;
      l.setAttribute("data-gefahren-css", "");
      l.onload = fertig; l.onerror = fertig;
      document.head.appendChild(l);
      setTimeout(fertig, 2500);
    } catch (e) { fertig(); }
  });
  return cssVersprechen;
}

const NS = "http://www.w3.org/2000/svg";

export function starte(platz, k) {
  let zustand = "bereit";            // bereit | start | spiel | aufloesung | fertig
  let bilder = [], nr = 0, runde = null, ergId = 0, rundenNr = 0;
  let aktuell = null, gefundenIds = {}, fehl = 0, gesperrtBis = 0, tStart = 0, raf = 0, timer = [];
  let gesamt = 0, summeGefunden = 0, summeFehl = 0, vollstaendig = 0, summeAlle = 0;
  let ergebnisDaten = null, speicherInfo = "";
  let weg = false;

  platz.innerHTML =
    '<div class="sp-gefahren">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("geName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte ge-buehne">' +
        '<div class="ge-hud" dir="auto"><span class="ge-bild" role="status" aria-live="polite"></span>' +
          '<span class="ge-punkte"><span class="sp-label">' + k.esc(k.tx("gePunkte")) + '</span> <b dir="ltr">0</b></span></div>' +
        '<div class="ge-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="ge-info" dir="auto"><span class="ge-zaehler"></span><span class="ge-zeit" dir="ltr"></span></div>' +
        '<div class="ge-frage" dir="auto"></div>' +
        '<div class="ge-szene"><div class="ge-bildplatz"></div><button type="button" class="ge-knopf start"></button></div>' +
        '<div class="ge-meldung" role="status" aria-live="polite" dir="auto"></div>' +
        '<button type="button" class="ge-fertig" hidden></button>' +
        '<div class="ge-antwort" hidden></div>' +
      "</div>" +
      '<p class="admin-sub ge-anleitung">' + k.esc(k.tx("geBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const q = (s) => platz.querySelector(s);
  const bildEl = q(".ge-bild"), punkteEl = q(".ge-punkte b"), leiste = q(".ge-leiste i"), zaehlerEl = q(".ge-zaehler"), zeitEl = q(".ge-zeit");
  const frageEl = q(".ge-frage"), szeneEl = q(".ge-szene"), bildPlatz = q(".ge-bildplatz"), knopf = q(".ge-knopf"), meldung = q(".ge-meldung");
  const fertigKnopf = q(".ge-fertig"), antwortEl = q(".ge-antwort"), anleitung = q(".ge-anleitung"), ergebnis = q(".sp-ergebnis");
  const format = function (w) { return w + " " + k.tx("gePunkte"); };
  const rank = rankingKarte(k, "gefahren", "", q(".sp-rank-platz"), format);
  profilKarte(k, q(".sp-profil-platz"), function () { rank.aktualisieren(); });

  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "spiel" || zustand === "aufloesung"; }
  function buehneInsBild() { try { q(".ge-buehne").scrollIntoView({ block: "start" }); } catch (e) {} }
  function setPunkte(p) { punkteEl.textContent = String(p); }
  function sekunden(ms) { return k.zahl(Math.max(0, Math.ceil(ms / 1000))) + " s"; }
  const rest = () => ZEIT_MS - (performance.now() - tStart) - fehl * STRAFE_MS;

  function bereitMachen() {
    stopTimer(); rundenNr++;
    zustand = "bereit"; anleitung.hidden = false;
    aktuell = null; nr = 0; gesamt = 0; summeGefunden = 0; summeFehl = 0; vollstaendig = 0; summeAlle = 0;
    szeneEl.classList.add("leer"); bildPlatz.innerHTML = "";
    antwortEl.hidden = true; antwortEl.innerHTML = ""; fertigKnopf.hidden = true; meldung.textContent = "";
    bildEl.textContent = ""; frageEl.textContent = ""; zaehlerEl.textContent = ""; zeitEl.textContent = "";
    setPunkte(0); leiste.style.width = "0%"; leiste.className = "";
    knopf.hidden = false; knopf.className = "ge-knopf start"; knopf.textContent = k.tx("start");
  }

  function starteRunde() {
    bereitMachen();
    const meine = rundenNr;
    zustand = "start"; anleitung.hidden = true; ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "ge-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "gefahren" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (weg || meine !== rundenNr || zustand !== "start") return;
      runde = r; bilder = waehleBilder(); nr = 0;
      knopf.hidden = true;
      zeigeBild();
    });
  }

  function zaehlerZeichnen() {
    zaehlerEl.textContent = k.tx("geGefunden", { n: Object.keys(gefundenIds).length, m: aktuell.gefahren.length });
  }
  function liveStand() { return gesamt + Math.max(0, Object.keys(gefundenIds).length * PKT_GEFAHR - fehl * ABZUG_TIPP); }

  function zeigeBild() {
    zustand = "spiel";
    aktuell = bilder[nr]; gefundenIds = {}; fehl = 0; gesperrtBis = 0;
    szeneEl.classList.remove("leer");
    bildPlatz.innerHTML = bildSvg(aktuell, k);
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    bildEl.textContent = k.tx("geBild", { n: nr + 1, m: BILDER_JE_RUNDE }) + " · " + k.tx(aktuell.name);
    frageEl.textContent = k.tx("geFrage");
    fertigKnopf.hidden = false; fertigKnopf.textContent = k.tx("geFertig");
    zaehlerZeichnen(); setPunkte(liveStand());
    const svg = bildPlatz.querySelector("svg");
    svg.addEventListener("pointerdown", function (e) { if (e.isPrimary !== false) tipp(e, svg); });
    tStart = performance.now(); leiste.style.width = "100%"; leiste.className = "";
    const meine = rundenNr, dieses = nr;
    function bild() {
      raf = 0;
      if (zustand !== "spiel" || meine !== rundenNr || dieses !== nr) return;
      const r = rest();
      leiste.style.width = Math.max(0, r / ZEIT_MS) * 100 + "%";
      leiste.className = r < 8000 ? "knapp" : "";
      zeitEl.textContent = sekunden(r);
      if (r <= 0) { bildBeenden("zeit"); return; }
      raf = requestAnimationFrame(bild);
    }
    raf = requestAnimationFrame(bild);
  }

  function ring(g, klasse, zahl) {
    const e = document.createElementNS(NS, "g");
    e.setAttribute("class", "ge-ring " + klasse);
    e.innerHTML = '<circle cx="' + g.x + '" cy="' + g.y + '" r="21" fill="none"/>' +
      (zahl ? '<circle class="ge-nr-bg" cx="' + (g.x + 15) + '" cy="' + (g.y - 15) + '" r="8"/><text x="' + (g.x + 15) + '" y="' + (g.y - 11.6) + '" text-anchor="middle" class="ge-nr">' + zahl + "</text>" : "");
    return e;
  }

  function tipp(e, svg) {
    if (zustand !== "spiel") return;
    const jetzt = performance.now();
    if (jetzt < gesperrtBis) return;
    const rc = svg.getBoundingClientRect();
    if (!rc.width) return;
    const x = (e.clientX - rc.left) / rc.width * BILD_B, y = (e.clientY - rc.top) / rc.height * BILD_H;
    const minR = MIN_RADIUS_PX * BILD_B / rc.width;
    const t = treffer(aktuell.gefahren, x, y, minR);
    const marken = svg.querySelector(".ge-marken");
    if (t) {
      if (gefundenIds[t.id]) return;                    // schon gefunden: weder Punkte noch Abzug
      gefundenIds[t.id] = true;
      marken.appendChild(ring(t, "gefunden", 0));
      meldung.textContent = k.tx("geTreffer");
      zaehlerZeichnen(); setPunkte(liveStand());
      if (Object.keys(gefundenIds).length >= aktuell.gefahren.length) bildBeenden("alle");
    } else {
      fehl++;
      gesperrtBis = jetzt + SPERRE_MS;
      const m = document.createElementNS(NS, "g");
      m.setAttribute("class", "ge-fehltipp");
      m.innerHTML = '<path d="M' + (x - 7) + " " + (y - 7) + "L" + (x + 7) + " " + (y + 7) + "M" + (x + 7) + " " + (y - 7) + "L" + (x - 7) + " " + (y + 7) + '"/>';
      marken.appendChild(m);
      timer.push(setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 700));
      meldung.textContent = k.tx("geFehltipp", { v: ABZUG_TIPP, m: STRAFE_MS / 1000 });
      setPunkte(liveStand());
      szeneEl.classList.remove("wackeln"); void szeneEl.offsetWidth; szeneEl.classList.add("wackeln");
      if (rest() <= 0) bildBeenden("zeit");
    }
  }

  function bildBeenden(grund) {
    if (zustand !== "spiel") return;
    const restMs = rest();
    stopTimer();
    zustand = "aufloesung";
    const n = Object.keys(gefundenIds).length, m = aktuell.gefahren.length, alle = n === m;
    const punkte = punkteBild(n, fehl, restMs, alle);
    gesamt += punkte; summeGefunden += n; summeFehl += fehl; if (alle) vollstaendig++; summeAlle += m;
    setPunkte(gesamt); zeitEl.textContent = ""; leiste.style.width = "0%";
    fertigKnopf.hidden = true; meldung.textContent = "";
    const marken = bildPlatz.querySelector(".ge-marken");
    marken.innerHTML = "";
    aktuell.gefahren.forEach(function (g, i) { marken.appendChild(ring(g, gefundenIds[g.id] ? "gefunden" : "uebersehen", i + 1)); });
    bildPlatz.querySelector("svg").classList.add("fest");
    const letzte = nr >= bilder.length - 1;
    const bonus = alle ? Math.floor(Math.max(0, restMs) / 1000) * BONUS_JE_S : 0;
    let h = '<div class="ge-urteil ' + (alle ? "ja" : "nein") + '">' + k.esc(alle ? k.tx("geAlle", { v: bonus }) : grund === "zeit" ? k.tx("geZeitAus") : k.tx("geFertigMsg")) + "</div>" +
      '<div class="ge-zahlen" dir="auto">' + k.esc(k.tx("geGefunden", { n: n, m: m })) + " · " + k.esc(k.tx("geBildPunkte", { v: punkte })) + "</div>" +
      '<div class="ge-legende" dir="auto"><span class="ge-leg gefunden">' + k.esc(k.tx("geMarkGefunden")) + '</span><span class="ge-leg uebersehen">' + k.esc(k.tx("geMarkUebersehen")) + "</span></div>" +
      '<h3 class="ge-listentitel" dir="auto">' + k.esc(k.tx("geListe")) + '</h3><ol class="ge-liste">';
    aktuell.gefahren.forEach(function (g, i) {
      const f = gefundenIds[g.id];
      h += '<li class="ge-eintrag ' + (f ? "gefunden" : "uebersehen") + '" data-gefahr="' + g.id + '"><span class="ge-nummer" aria-hidden="true">' + (i + 1) + "</span>" +
        '<div class="ge-eintrag-text" dir="auto"><div class="ge-eintrag-kopf"><b>' + k.esc(k.tx(gefahrTitel(g.typ))) + '</b> <span class="ge-status">' + k.esc(k.tx(f ? "geMarkGefunden" : "geMarkUebersehen")) + "</span></div>" +
        '<p>' + k.esc(k.tx(gefahrText(g.typ))) + "</p></div></li>";
    });
    h += '</ol><button type="button" class="ge-weiter">' + k.esc(letzte ? k.tx("geErgebnisZeigen") : k.tx("geWeiter")) + "</button>";
    antwortEl.innerHTML = h; antwortEl.hidden = false;
    antwortEl.querySelector(".ge-weiter").addEventListener("click", function () { weiter(letzte); });
    try { buehneInsBild(); } catch (e) {}
  }

  function weiter(letzte) {
    if (zustand !== "aufloesung") return;
    if (letzte) { beenden(); return; }
    nr++; zeigeBild(); buehneInsBild();
  }

  function beenden() {
    stopTimer(); rundenNr++;
    zustand = "fertig"; anleitung.hidden = true;
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    bildPlatz.innerHTML = ""; szeneEl.classList.add("leer");
    frageEl.textContent = ""; bildEl.textContent = ""; zaehlerEl.textContent = ""; zeitEl.textContent = "";
    leiste.style.width = "0%";
    knopf.hidden = false; knopf.className = "ge-knopf start"; knopf.textContent = k.tx("nochmal");
    ergebnisDaten = { wert: gesamt, gefunden: summeGefunden, alle: summeAlle, fehl: summeFehl, vollstaendig: vollstaendig };
    ergId++;
    zeichneErgebnis();
    speichern(ergebnisDaten);
    try { knopf.focus({ preventScroll: true }); } catch (e) {}
  }

  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    ergebnis.hidden = false;
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("gePunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="ge-ergzeile" dir="auto">' + k.esc(k.tx("geErgGefunden", { n: e.gefunden, m: e.alle })) + "</p>" +
        '<p class="ge-ergzeile" dir="auto">' + k.esc(k.tx("geErgFehltipps", { n: e.fehl })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse" dir="auto">' + k.esc(k.tx("geHinweis")) + "</p>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }
  function speichern(e) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: e.wert, gefunden: e.gefunden, fehltipps: e.fehl, vollstaendig: e.vollstaendig }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("geNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("geBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.gefahren = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  knopf.addEventListener("click", function () { if (zustand === "bereit" || zustand === "fertig") starteRunde(); });
  fertigKnopf.addEventListener("click", function () { if (zustand === "spiel") bildBeenden("fertig"); });
  // Wer die App mitten im Bild verlässt, bekommt keine verschobene Zeit: Runde abbrechen und von vorn
  function sichtbarkeit() { if (document.hidden && (zustand === "spiel" || zustand === "start")) bereitMachen(); }
  document.addEventListener("visibilitychange", sichtbarkeit);

  // Bis gefahren.css geladen ist, bleibt der Bereich unsichtbar (sonst blitzt ungestalteter Text auf)
  const wurzel = q(".sp-gefahren");
  wurzel.style.visibility = "hidden";
  eigenesCssLaden().then(function () { wurzel.style.visibility = ""; });
  bereitMachen();
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      weg = true; stopTimer(); rundenNr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
