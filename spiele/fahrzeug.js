/* Spiel 8: Fahrzeug-Check (Familie C: Bild antippen), 08.10.2026.
   Technische Abfahrtskontrolle durch den Fahrer (NICHT die Papier-/Ausrüstungskontrolle von Spiel 6 „Verkehrskontrolle“).
   Selbst gezeichnete Fahrzeugansichten (Pkw von vorn / hinten / von der Seite, Cockpit mit Kontrollleuchten, Motorraum-Schema)
   zeigen je 4–5 Mängel. Man tippt alle Mängel an. Pro Durchgang 4 Bilder (aus 7, zufällig gemischt), je Bild 40 Sekunden.
   Ein Tipp ohne Mangel kostet Punkte und 2 Sekunden. Nach jedem Bild werden ALLE Mängel markiert und erklärt
   (Was ist es? Warum wichtig? Was tun? Bei Kontrollleuchten: Farbe und Name der Leuchte).

   Punkte (reine Rechnung, siehe punkteBild):
     je gefundenem Mangel +100, je falschem Tipp −30 (ein Bild nie unter 0), alle Mängel des Bildes gefunden: +2 je übrige Sekunde.
   Ranking: Punkte (größer ist besser). Der Server prüft gefunden / fehltipps / vollstaendig gegen den Wert;
   siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „fahrzeug“.

   Fachliche Quellen der Erklärungen: StVZO § 36 (Mindestprofiltiefe 1,6 mm), StVO § 23 (Sicht), § 21a (Gurt), Fahrschul-Lehrstoff
   Fahrzeugtechnik / Abfahrtskontrolle, ADAC (Reifen, Kontrollleuchten), Farbcode der Kontrollleuchten nach ISO 2575
   (rot = Gefahr, gelb = Warnung, grün/blau = Information). Zusammenstellung je Mangel im Bericht zu diesem Spiel.
   Keine Markenlogos, keine Bußgelder, keine Verkehrszeichen. Die Kontrollleuchten sind vereinfachte, eigene Piktogramme;
   in der Erklärung steht immer der Name der Leuchte als Wort. */
import { rankingKarte, profilKarte } from "./rahmen.js";

/* ===================== Regeln (reine Rechnung) ===================== */
export const BILD_B = 360, BILD_H = 240;           // Koordinaten aller Bilder (viewBox)
export const BILDER_JE_RUNDE = 4;
export const MIN_JE_BILD = 4, MAX_JE_BILD = 6;
export const ZEIT_MS = 40000;                      // Zeit je Bild (Mängel suchen dauert etwas länger als Gefahren)
export const STRAFE_MS = 2000;                     // Zeit, die ein falscher Tipp kostet
export const PKT_MANGEL = 100, ABZUG_TIPP = 30, BONUS_JE_S = 2;
export const SPERRE_MS = 250;                      // nach einem falschen Tipp zählt ein Tipp 0,25 s lang nicht (kein Doppeltipp)
export const MIN_RADIUS_PX = 22;                   // Trefferfläche mindestens 44 px breit (Radius 22), auch auf kleinen Handys
export const BONUS_MAX = Math.floor(ZEIT_MS / 1000) * BONUS_JE_S;   // 80

/* Punkte eines Bildes. rest = übrige Zeit in ms (nach Abzug der Strafzeit), alle = jeder Mangel gefunden. Nie unter 0. */
export function punkteBild(gefunden, fehltipps, restMs, alle) {
  const bonus = alle ? Math.floor(Math.max(0, restMs) / 1000) * BONUS_JE_S : 0;
  return Math.max(0, gefunden * PKT_MANGEL - fehltipps * ABZUG_TIPP + bonus);
}
/* Höchstwerte, die der Server übernimmt (gleiche Zahlen im Eintrag „fahrzeug“ der Function) */
export const MAX_GEFUNDEN = BILDER_JE_RUNDE * MAX_JE_BILD;                 // 24
export const MAX_FEHLTIPPS = BILDER_JE_RUNDE * Math.floor(ZEIT_MS / STRAFE_MS);   // 80
export const MAX_PUNKTE = MAX_GEFUNDEN * PKT_MANGEL + BILDER_JE_RUNDE * BONUS_MAX;   // 2720

/* Welchen Mangel trifft ein Tipp (x, y in Bildkoordinaten)? minRadius = Mindest-Trefferradius in Bildeinheiten (aus Pixeln). Nächster Mangel gewinnt. */
export function treffer(maengel, x, y, minRadius) {
  let best = null, bestD = Infinity;
  maengel.forEach(function (g) {
    const d = Math.hypot(x - g.x, y - g.y);
    if (d <= Math.max(g.r, minRadius || 0) && d < bestD) { best = g; bestD = d; }
  });
  return best;
}

/* ===================== Zeichnen (Text-freie SVG-Teile, außer der Abkürzung „ABS“) ===================== */
const R = (x, y, w, h, fill, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || "") + "/>";
const KONTUR = ' stroke="rgba(0,0,0,.45)" stroke-width="1"';
const LACK = "#3d73c9", LACK_HELL = "#5a8fe0", LACK_DUNKEL = "#2a569b", GLAS = "#bcd8ee", REIFEN = "#1b1d21", FELGE = "#c3c8d0";
const hintergrund = (boden) => R(0, 0, BILD_B, BILD_H, "#d3dae3") + R(0, boden, BILD_B, BILD_H - boden, "#80858e") + R(0, boden, BILD_B, 2, "rgba(0,0,0,.25)") +
  '<ellipse cx="180" cy="' + (boden + 4) + '" rx="140" ry="9" fill="rgba(0,0,0,.26)"/>';

/* ---- Piktogramme der Kontrollleuchten (Box -14..14, vereinfacht; Bedeutung steht immer auch als Wort in der Erklärung) ---- */
const PIKTO = {
  oel: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-8 -1h13v9h-13z"/><path d="M5 1l5-5h3"/><path d="M-8 1l-7-5"/><path d="M-15 4.5q-2.4 3 0 4.5q2.4-1.5 0-4.5z" fill="' + c + '"/></g>',
  kuehl: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-8.2 -11h4.4v10.5a4.8 4.8 0 1 1 -4.4 0z"/><path d="M1 -4q3-3 5.5 0t5.5 0M1 3q3-3 5.5 0t5.5 0"/></g>',
  batterie: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="-12" y="-6" width="24" height="14" rx="1.5"/><path d="M-8 -9v3M8 -9v3M-8 1h5M-5.5 -1.5v5M5 1h5"/></g>',
  bremse: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"><circle r="7.5"/><path d="M-11.5 -7a13 13 0 0 0 0 14M11.5 -7a13 13 0 0 1 0 14"/><path d="M0 -4v4.5M0 4h.01"/></g>',
  gurt: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="-2" cy="-8" r="3" fill="' + c + '"/><path d="M-2 -4v7h9v6"/><path d="M-6.5 -5l9.5 9" stroke-width="2.6"/><circle cx="3" cy="4" r="1.4" fill="' + c + '"/></g>',
  motor: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-9 -3h14v10h-14z"/><path d="M-5 -3v-4h6v4"/><path d="M-9 0h-4v5h4"/><path d="M5 -1h5v9h-5"/></g>',
  abs: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"><circle r="8.5"/><path d="M-12 -6a14 14 0 0 0 0 12M12 -6a14 14 0 0 1 0 12"/><text y="2.6" text-anchor="middle" font-family="sans-serif" font-size="7.2" font-weight="700" fill="' + c + '" stroke="none">ABS</text></g>',
  esp: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-9 1l2-5.5h10l3.5 5.5z"/><circle cx="-5" cy="3" r="1.4" fill="' + c + '"/><circle cx="4.5" cy="3" r="1.4" fill="' + c + '"/><path d="M-10 8q2.5-3 5 0t5 0t5 0M-10 12q2.5-3 5 0t5 0t5 0" stroke-width="1.7"/></g>',
  rdks: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-10 8v-8a10 9 0 0 1 20 0v8h-4v-8a6 5 0 0 0 -12 0v8z"/><path d="M0 -2.5v4M0 5h.01"/></g>',
  reserve: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-8 -10h11v19h-11z"/><path d="M-6 -8h7v6h-7z"/><path d="M3 -4h3q3 0 3 3v8q0 2 2 2q2 0 2 -2v-9l-3 -3"/><path d="M-10 9h15"/></g>',
  blinkL: (c) => '<path d="M-12 0l9-8v5h12v6h-12v5z" fill="' + c + '"/>',
  blinkR: (c) => '<path d="M12 0l-9-8v5h-12v6h12v5z" fill="' + c + '"/>',
  abblend: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"><path d="M3 -8c-11 0 -11 16 0 16z"/><path d="M7 -6l6 2M7 -1l6 2M7 4l6 2"/></g>',
  fern: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round"><path d="M3 -8c-11 0 -11 16 0 16z"/><path d="M7 -6h6M7 -1h6M7 4h6"/></g>',
  wasch: (c) => '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-10 7q10-15 20 0z"/><path d="M-5 -2q0-5-3-8M0 -3v-8M5 -2q0 -5 3 -8"/></g>'
};
const FARBE = { rot: "#ff3b30", gelb: "#ffb800", gruen: "#2ee06b", blau: "#3ea0ff", aus: "#4b525c" };
/* Eine Kontrollleuchte im Kombiinstrument: an (Farbe) oder aus (dunkelgrau) */
function leuchte(ico, x, y, farbe) {
  const an = farbe !== "aus", c = FARBE[farbe];
  return '<g transform="translate(' + x + " " + y + ')"' + (an ? "" : ' opacity=".55"') + ">" + (an ? '<circle r="18" fill="' + c + '" opacity=".17"/>' : "") + PIKTO[ico](c) + "</g>";
}
function zifferblatt(x, y, nadel) {
  let s = '<circle cx="' + x + '" cy="' + y + '" r="52" fill="#0c0e12" stroke="#343b46" stroke-width="3"/><circle cx="' + x + '" cy="' + y + '" r="44" fill="none" stroke="#1f242b" stroke-width="1"/>';
  for (let i = 0; i <= 10; i++) {
    const w = (135 + i * 27) * Math.PI / 180, l = i % 5 === 0 ? 9 : 5;
    s += '<path d="M' + (x + Math.cos(w) * 44).toFixed(1) + " " + (y + Math.sin(w) * 44).toFixed(1) + "L" + (x + Math.cos(w) * (44 - l)).toFixed(1) + " " + (y + Math.sin(w) * (44 - l)).toFixed(1) + '" stroke="#cfd5de" stroke-width="' + (i % 5 === 0 ? 2 : 1.2) + '"/>';
  }
  const w = (135 + nadel * 270) * Math.PI / 180;
  return s + '<path d="M' + x + " " + y + "L" + (x + Math.cos(w) * 36).toFixed(1) + " " + (y + Math.sin(w) * 36).toFixed(1) + '" stroke="#ff7a1a" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="4" fill="#2b313a"/>';
}
/* Kombiinstrument: 2 Reihen mit je 6 Plätzen (x = 60 + 52·i), dazwischen Drehzahl- und Tempo-Anzeige. oben/unten: [[Piktogramm, Farbe], …] */
function cockpit(oben, unten) {
  let s = R(0, 0, BILD_B, BILD_H, "#0b0d10") + R(8, 8, 344, 224, "#15181d", ' rx="22" stroke="#2a3038" stroke-width="2"');
  s += zifferblatt(88, 122, 0.12) + zifferblatt(272, 122, 0);
  s += R(142, 92, 76, 60, "#0f1a22", ' rx="6" stroke="#2a3a46" stroke-width="1.5"') + R(150, 102, 60, 6, "#1d6f8a", ' rx="3"') + R(150, 116, 44, 4, "#2a4a5a", ' rx="2"') + R(150, 128, 52, 4, "#2a4a5a", ' rx="2"') + R(150, 140, 30, 4, "#2a4a5a", ' rx="2"');
  oben.forEach(function (p, i) { s += leuchte(p[0], 60 + 52 * i, 34, p[1]); });
  unten.forEach(function (p, i) { s += leuchte(p[0], 60 + 52 * i, 212, p[1]); });
  return s;
}

/* Reifen von vorn/hinten gesehen (Lauffläche): profil = Rillen sichtbar */
function reifenVorn(x, profil) {
  let s = R(x, 150, 24, 50, REIFEN, ' rx="6"');
  if (profil) for (let y = 156; y < 196; y += 8) s += R(x + 2, y, 20, 3.5, "#59606a", ' rx="1"');
  else s += R(x + 3, 154, 6, 42, "rgba(255,255,255,.08)", ' rx="3"');
  return s;
}

/* ---- 1. Auto von vorn, Licht an ---- */
function szeneVorn() {
  let s = hintergrund(198);
  // Karosserie
  s += '<path d="M92 148L108 118H252L268 148Z" fill="' + LACK_HELL + '"' + KONTUR + "/>";                       // Motorhaube
  s += '<path d="M112 116L128 62H232L248 116Z" fill="' + GLAS + '"' + KONTUR + "/>" + R(126, 50, 108, 12, LACK, ' rx="5"' + KONTUR);   // Frontscheibe, Dach
  s += '<path d="M112 116L128 62M248 116L232 62" stroke="' + LACK_DUNKEL + '" stroke-width="5"/>';
  s += R(76, 146, 208, 48, LACK, ' rx="12"' + KONTUR) + R(120, 176, 120, 14, "#16181c", ' rx="4"') + R(142, 160, 76, 12, "#16181c", ' rx="3"');
  for (let x = 148; x < 216; x += 10) s += R(x, 161, 2.5, 10, "#4a4f57");
  s += reifenVorn(62, true) + reifenVorn(274, false);                 // rechts: abgefahren (glatt)
  // Scheinwerfer: rechts (im Bild) an, links (im Bild) ausgefallen; an = Licht an (Strahl nach vorn)
  s += '<ellipse cx="246" cy="156" rx="44" ry="24" fill="rgba(255,240,150,.38)"/>' + R(220, 146, 52, 20, "#fff8c4", ' rx="8"' + KONTUR) + R(228, 150, 18, 8, "#ffffff", ' rx="4"');
  s += R(88, 146, 52, 20, "#4b5159", ' rx="8"' + KONTUR) + R(96, 150, 18, 6, "rgba(255,255,255,.14)", ' rx="3"');
  // Spiegel: rechts in Ordnung, links hängt lose am Kabel
  s += R(272, 106, 24, 14, LACK_DUNKEL, ' rx="5"' + KONTUR) + R(268, 111, 6, 4, "#222");
  s += '<path d="M90 110Q84 120 80 128" fill="none" stroke="#111" stroke-width="2.2"/><g transform="translate(76 130) rotate(72)">' + R(-15, -7, 26, 14, LACK_DUNKEL, ' rx="5"' + KONTUR) + R(-10, -4, 16, 8, "rgba(255,255,255,.45)", ' rx="2"') + "</g>";
  // Scheibenwischer: rechts (im Bild) in Ordnung, links Gummi eingerissen und hängt
  s += '<path d="M194 112L242 101" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>';
  s += '<path d="M138 112L160 107" stroke="#111" stroke-width="4.5" stroke-linecap="round"/><path d="M160 107L182 98" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/><path d="M170 106Q176 114 172 124" fill="none" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>';
  // Riss in der Scheibe vor dem Fahrer (rechts im Bild), strahlenförmig
  s += '<g stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".95"><path d="M216 82l-14-8M216 82l12-12M216 82l15 4M216 82l-6 16M216 82l-1 -16"/><path d="M228 70l6-6M231 86l9 2"/></g><g stroke="#4a5560" stroke-width=".8" fill="none"><path d="M216 82l-14-8M216 82l12-12M216 82l15 4M216 82l-6 16"/></g>';
  return { svg: s, maengel: [
    { id: "scheinwerfer", typ: "scheinwerfer", x: 114, y: 156, r: 26 },
    { id: "wischer", typ: "wischer", x: 160, y: 108, r: 24 },
    { id: "riss", typ: "scheibenriss", x: 217, y: 84, r: 25 },
    { id: "spiegel", typ: "spiegel", x: 74, y: 120, r: 24 },
    { id: "profil", typ: "profil", x: 282, y: 176, r: 26 }
  ] };
}

/* ---- 2. Auto von hinten, Bremse getreten ---- */
function szeneHinten() {
  let s = hintergrund(198);
  // Karosserie
  s += R(92, 108, 176, 44, LACK, ' rx="10"' + KONTUR);                                                          // Kofferraumdeckel
  s += '<path d="M104 112L122 58H238L256 112Z" fill="' + GLAS + '"' + KONTUR + "/>" + R(120, 48, 120, 11, LACK, ' rx="5"' + KONTUR);   // Heckscheibe, Dach
  s += R(78, 150, 204, 44, LACK, ' rx="12"' + KONTUR) + R(150, 176, 60, 10, "#16181c", ' rx="3"');                   // Stoßfänger
  s += '<ellipse cx="236" cy="190" rx="9" ry="5" fill="#2a2d33" stroke="#8a9099" stroke-width="1.5"/>';           // Auspuffrohr
  s += reifenVorn(62, true) + reifenVorn(274, true);
  // Reifen rechts: Schraube steckt in der Lauffläche
  s += '<circle cx="286" cy="174" r="4.6" fill="#b9c0c9" stroke="#2a2d33" stroke-width="1"/><path d="M282.5 174h7" stroke="#2a2d33" stroke-width="1.3"/><path d="M279 168l-3 -4M289 168l3 -4" stroke="#2a2d33" stroke-width="0"/>';
  // Heckscheibe: vereist bis auf ein kleines Guckloch
  s += '<path d="M104 112L122 58H238L256 112Z" fill="rgba(238,246,255,.93)"/><ellipse cx="170" cy="92" rx="22" ry="11" fill="' + GLAS + '"/><g stroke="rgba(255,255,255,.95)" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M130 100l12-8M200 76l16 8M216 100l14 4M140 72l12 10M180 68l-6 8"/></g>';
  // dritte Bremsleuchte (leuchtet: Bremse ist getreten)
  s += '<ellipse cx="180" cy="66" rx="26" ry="9" fill="rgba(255,60,50,.35)"/>' + R(162, 62, 36, 6, "#ff2a24", ' rx="3"');
  // Rückleuchte links (im Bild): leuchtet rot, aber Glas gebrochen, weißes Licht scheint durch
  s += '<ellipse cx="116" cy="136" rx="40" ry="20" fill="rgba(255,60,50,.32)"/>' + R(92, 126, 48, 20, "#ff2f28", ' rx="6"' + KONTUR);
  s += '<path d="M104 126l8 10l-5 10M112 136l14 -3l12 8" fill="none" stroke="#2a1010" stroke-width="1.4"/><path d="M110 134l9 -4l3 7l-8 5z" fill="#fff"/>';
  // Rückleuchte rechts (im Bild): Bremsleuchte ausgefallen, bleibt dunkel
  s += R(220, 126, 48, 20, "#5a2326", ' rx="6"' + KONTUR) + R(228, 130, 18, 6, "rgba(255,255,255,.13)", ' rx="3"');
  // Spiegel in Ordnung
  s += R(76, 100, 20, 12, LACK_DUNKEL, ' rx="5"' + KONTUR) + R(264, 100, 20, 12, LACK_DUNKEL, ' rx="5"' + KONTUR);
  return { svg: s, maengel: [
    { id: "bremslicht", typ: "bremslicht", x: 244, y: 136, r: 26 },
    { id: "streuscheibe", typ: "streuscheibe", x: 116, y: 136, r: 26 },
    { id: "eis", typ: "eis", x: 190, y: 92, r: 26 },
    { id: "fremdkoerper", typ: "fremdkoerper", x: 286, y: 176, r: 24 }
  ] };
}

/* ---- 3. Auto von der Seite ---- */
function reifenSeite(cx, cy, r) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + REIFEN + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.62) + '" fill="' + FELGE + '" stroke="#8a9099" stroke-width="1.5"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.16) + '" fill="#6a7079"/>' + [0, 72, 144, 216, 288].map((w) => '<path d="M' + cx + " " + cy + "L" + (cx + Math.cos(w * Math.PI / 180) * r * 0.55).toFixed(1) + " " + (cy + Math.sin(w * Math.PI / 180) * r * 0.55).toFixed(1) + '" stroke="#8a9099" stroke-width="3"/>').join("");
}
function szeneSeite() {
  let s = hintergrund(202);
  // Pfütze unter dem Fahrzeug, Tropfen
  s += '<ellipse cx="182" cy="209" rx="38" ry="7" fill="#2f2620"/><ellipse cx="174" cy="207" rx="14" ry="2" fill="rgba(255,255,255,.18)"/>';
  s += '<path d="M176 178q-3 5 0 7q3 -2 0 -7zM186 190q-3 5 0 7q3 -2 0 -7z" fill="#4a3a2a"/>';
  // Karosserie (Front rechts)
  s += R(38, 118, 296, 54, LACK, ' rx="16"' + KONTUR);
  s += '<path d="M112 122L130 84Q134 78 142 78H214Q222 78 228 84L258 122Z" fill="' + LACK + '"' + KONTUR + "/>";
  s += '<path d="M122 120L136 88H178V120Z" fill="' + GLAS + '"/><path d="M186 120V88H216L242 120Z" fill="' + GLAS + '"/>';
  s += '<path d="M180 88V172M112 122L96 172" stroke="' + LACK_DUNKEL + '" stroke-width="2.2" fill="none"/><path d="M248 124V172" stroke="' + LACK_DUNKEL + '" stroke-width="2" fill="none"/>';
  s += R(150, 132, 16, 4, LACK_DUNKEL, ' rx="2"') + R(214, 132, 16, 4, LACK_DUNKEL, ' rx="2"');
  s += R(318, 128, 16, 14, "#fff2a8", ' rx="4"' + KONTUR) + R(38, 128, 8, 14, "#d03030", ' rx="3"' + KONTUR) + R(38, 164, 296, 8, "#16181c", ' rx="3"');
  // Radhäuser
  s += '<path d="M66 172a34 34 0 0 1 68 0z" fill="#111317"/><path d="M216 172a34 34 0 0 1 68 0z" fill="#111317"/>';
  // Tür vorn: nicht eingerastet, dunkler Spalt an der hinteren Kante und Tür steht vor
  s += R(181, 120, 8, 52, "#0d0e10") + '<path d="M189 122V170" stroke="#9fc0ef" stroke-width="2"/>';
  // Außenspiegel hängt lose am Kabel
  s += '<path d="M250 112Q256 118 258 126" fill="none" stroke="#111" stroke-width="2.2"/><g transform="translate(260 134) rotate(78)">' + R(-13, -7, 24, 14, LACK_DUNKEL, ' rx="5"' + KONTUR) + R(-9, -4, 15, 8, "rgba(255,255,255,.4)", ' rx="2"') + "</g>";
  // Räder: hinten Seitenwand mit Beule, vorn zu wenig Luft (platt gedrückt)
  s += reifenSeite(100, 172, 30);
  s += '<circle cx="126" cy="156" r="9" fill="#2b2e34"/><circle cx="127" cy="154" r="5" fill="rgba(255,255,255,.18)"/>';
  s += '<ellipse cx="250" cy="180" rx="35" ry="24" fill="' + REIFEN + '"/><ellipse cx="250" cy="178" rx="21" ry="14" fill="' + FELGE + '" stroke="#8a9099" stroke-width="1.5"/><circle cx="250" cy="178" r="4" fill="#6a7079"/>';
  s += '<path d="M217 184q4 14 33 16q29 -2 33 -16" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3"/>';
  return { svg: s, maengel: [
    { id: "luftdruck", typ: "luftdruck", x: 250, y: 182, r: 28 },
    { id: "seitenwand", typ: "seitenwand", x: 124, y: 158, r: 24 },
    { id: "leck", typ: "leck", x: 182, y: 207, r: 26 },
    { id: "spiegel", typ: "spiegel", x: 262, y: 128, r: 24 },
    { id: "tuer", typ: "tuer", x: 186, y: 142, r: 24 }
  ] };
}

/* ---- 4. Cockpit 1: Motor läuft, mehrere rote Leuchten ---- */
function szeneCockpit1() {
  const s = cockpit(
    [["blinkL", "gruen"], ["oel", "rot"], ["kuehl", "rot"], ["batterie", "rot"], ["bremse", "rot"], ["blinkR", "aus"]],
    [["abs", "aus"], ["gurt", "rot"], ["motor", "aus"], ["abblend", "gruen"], ["rdks", "aus"], ["reserve", "aus"]]);
  return { svg: s, maengel: [
    { id: "oel", typ: "oeldruck", x: 112, y: 34, r: 24 },
    { id: "kuehl", typ: "kuehlTemp", x: 164, y: 34, r: 24 },
    { id: "batterie", typ: "batterie", x: 216, y: 34, r: 24 },
    { id: "bremse", typ: "bremse", x: 268, y: 34, r: 24 },
    { id: "gurt", typ: "gurt", x: 112, y: 212, r: 24 }
  ] };
}

/* ---- 5. Cockpit 2: Motor läuft, mehrere gelbe Leuchten ---- */
function szeneCockpit2() {
  const s = cockpit(
    [["oel", "aus"], ["motor", "gelb"], ["abs", "gelb"], ["esp", "gelb"], ["rdks", "gelb"], ["batterie", "aus"]],
    [["reserve", "gelb"], ["gurt", "aus"], ["fern", "blau"], ["bremse", "aus"], ["blinkR", "gruen"], ["abblend", "aus"]]);
  return { svg: s, maengel: [
    { id: "motor", typ: "motor", x: 112, y: 34, r: 24 },
    { id: "abs", typ: "abs", x: 164, y: 34, r: 24 },
    { id: "esp", typ: "esp", x: 216, y: 34, r: 24 },
    { id: "rdks", typ: "rdks", x: 268, y: 34, r: 24 },
    { id: "reserve", typ: "reserve", x: 60, y: 212, r: 24 }
  ] };
}

/* ---- 6./7. Motorraum (Schema von oben, ohne Marke): Behälter mit MIN/MAX, Peilstab, Batterie ---- */
/* Behälter mit Flüssigkeit: pegel = 0..1 (Höhe der Füllung), min = 0.30, max = 0.80 als Strich links */
function behaelter(x, y, b, h, farbe, pegel, deckelIco, deckelFarbe) {
  const fuell = h * pegel;
  let s = R(x, y, b, h, "rgba(235,238,242,.28)", ' rx="6" stroke="#aeb6c2" stroke-width="2"');
  if (fuell > 0) s += R(x + 2, y + h - fuell, b - 4, fuell - 1, farbe, ' rx="4"');
  s += R(x - 6, y + h * 0.2, 6, 2, "#e8ecf2") + R(x - 6, y + h * 0.7, 6, 2, "#e8ecf2");     // MAX (oben) und MIN (unten)
  s += R(x + b / 2 - 11, y - 9, 22, 11, deckelFarbe, ' rx="3"' + KONTUR) + '<g transform="translate(' + (x + b / 2) + " " + (y - 3.5) + ') scale(.42)">' + PIKTO[deckelIco]("#fff") + "</g>";
  return s;
}
function motorraum(o) {
  let s = R(0, 0, BILD_B, BILD_H, "#2b2f36") + R(0, 0, BILD_B, 22, "#171a1f") + R(0, 218, BILD_B, 22, "#171a1f");
  s += R(8, 28, 20, 184, "#20242a", ' rx="8"') + R(332, 28, 20, 184, "#20242a", ' rx="8"');
  // Motor
  s += R(118, 70, 118, 94, "#4b525c", ' rx="10"' + KONTUR) + R(130, 78, 94, 40, "#69727f", ' rx="6"') + R(130, 126, 94, 28, "#3c424b", ' rx="6"');
  [138, 160, 182, 204].forEach(function (x) { s += R(x, 84, 10, 28, "rgba(0,0,0,.28)", ' rx="3"'); });
  s += '<path d="M236 100H252M236 140H248" stroke="#14171b" stroke-width="7" stroke-linecap="round"/><path d="M118 100H104V150" fill="none" stroke="#14171b" stroke-width="6" stroke-linecap="round"/>';
  // Öleinfülldeckel (gelb) oder offene Öffnung
  if (o.deckelFehlt) {
    s += '<circle cx="150" cy="98" r="10" fill="#050607" stroke="#f08a1c" stroke-width="2.5"/><g transform="translate(206 140) rotate(24)"><circle r="9" fill="#f2c21a"' + KONTUR + '/><g transform="scale(.5)">' + PIKTO.oel("#222") + "</g></g>";
  } else {
    s += '<circle cx="150" cy="98" r="10" fill="#f2c21a"' + KONTUR + '/><g transform="translate(150 98) scale(.5)">' + PIKTO.oel("#222") + "</g>";
  }
  // Bremsflüssigkeit oben links, Kühlmittel rechts, Waschwasser rechts unten
  s += behaelter(46, 40, 34, 40, "#d9a64a", o.brems === "low" ? 0.14 : 0.52, "bremse", "#333a44");
  s += behaelter(256, 46, 40, 62, "#e5506c", o.kuehl === "low" ? 0.14 : 0.52, "kuehl", "#3b7fd1");
  s += behaelter(262, 146, 54, 54, "#3b82d6", o.wasch === "leer" ? 0 : 0.58, "wasch", "#2c6cc0");
  if (o.wasch === "leer") s += '<path d="M276 196q2 3 0 5M296 196q2 3 0 5" stroke="#3b82d6" stroke-width="2" fill="none"/>';
  // Batterie unten links
  s += R(40, 150, 66, 46, "#203f6e", ' rx="5"' + KONTUR) + R(46, 158, 54, 6, "rgba(255,255,255,.12)", ' rx="3"');
  s += '<circle cx="54" cy="146" r="6.5" fill="#9aa1ab" stroke="#2a2d33" stroke-width="1.2"/><circle cx="92" cy="146" r="6.5" fill="#9aa1ab" stroke="#2a2d33" stroke-width="1.2"/>';
  s += '<path d="M51 146h6M89 146h6M92 143v6" stroke="#222" stroke-width="1.5"/>';
  if (o.batt === "korro") s += '<g fill="#d8f0e2" stroke="#7fb89a" stroke-width=".8"><circle cx="50" cy="141" r="3.8"/><circle cx="58" cy="140" r="3.4"/><circle cx="46" cy="147" r="3.2"/><circle cx="55" cy="151" r="3.6"/><circle cx="60" cy="146" r="3"/></g>';
  // Ölpeilstab (herausgezogen und abgewischt abgelesen): Strich MIN bei x 148, MAX bei x 196, Ölfilm von der Spitze (links) bis zum Pegel
  const pegel = o.oel === "min" ? 130 : o.oel === "max" ? 214 : 172;
  s += R(110, 196, 134, 14, "rgba(255,255,255,.1)", ' rx="4"') + R(112, 200, 128, 6, "#c9ced6", ' rx="3"') + R(112, 200, pegel - 112, 6, "#8a5a14", ' rx="3"') + '<ellipse cx="' + pegel + '" cy="206.5" rx="1.8" ry="3" fill="#8a5a14"/>';
  s += R(147, 195, 2.5, 16, "#14171b") + R(195, 195, 2.5, 16, "#14171b") + R(149.5, 195, 45.5, 2, "#14171b") + R(149.5, 209, 45.5, 2, "#14171b");
  s += '<circle cx="250" cy="203" r="8" fill="none" stroke="#f2c21a" stroke-width="3"/>';
  s += '<g font-family="sans-serif" font-size="7" font-weight="700" fill="#e8ecf2" text-anchor="middle"><text x="148" y="193">MIN</text><text x="196" y="193">MAX</text></g>';
  return s;
}
function szeneMotor1() {
  return { svg: motorraum({ oel: "min", kuehl: "low", brems: "ok", wasch: "leer", batt: "korro" }), maengel: [
    { id: "oel", typ: "oelMin", x: 172, y: 203, r: 34 },
    { id: "kuehl", typ: "kuehlMin", x: 276, y: 78, r: 32 },
    { id: "wasch", typ: "waschwasser", x: 288, y: 176, r: 30 },
    { id: "batterie", typ: "batteriepol", x: 54, y: 148, r: 26 }
  ] };
}
function szeneMotor2() {
  return { svg: motorraum({ oel: "max", kuehl: "ok", brems: "low", wasch: "leer", batt: "ok", deckelFehlt: true }), maengel: [
    { id: "brems", typ: "bremsMin", x: 62, y: 60, r: 28 },
    { id: "oel", typ: "oelMax", x: 172, y: 203, r: 34 },
    { id: "deckel", typ: "oeldeckel", x: 150, y: 98, r: 24 },
    { id: "wasch", typ: "waschwasser", x: 288, y: 176, r: 30 }
  ] };
}

/* Die Bilder: id, Textschlüssel des Namens, Mängel, Zeichnung (liefert SVG-Text). Mängel mit Mittelpunkt (x, y) und Trefferradius r. */
const DEFS = [
  ["vorn", "fzB1", szeneVorn], ["hinten", "fzB2", szeneHinten], ["seite", "fzB3", szeneSeite],
  ["cockpit1", "fzB4", szeneCockpit1], ["cockpit2", "fzB5", szeneCockpit2], ["motor1", "fzB6", szeneMotor1], ["motor2", "fzB7", szeneMotor2]
];
export const BILDER = DEFS.map(function (d) {
  const szene = d[2]();
  return { id: d[0], name: d[1], maengel: szene.maengel, svgInnen: szene.svg };
});
/* Textschlüssel eines Mangels: Titel und Erklärung */
export const mangelTitel = (typ) => "fzM_" + typ;
export const mangelText = (typ) => "fzM_" + typ + "_x";
export const MANGEL_TYPEN = Array.from(new Set([].concat.apply([], BILDER.map((b) => b.maengel.map((g) => g.typ)))));

/* Vier verschiedene Bilder in zufälliger Reihenfolge */
export function waehleBilder(rnd) {
  const zufall = rnd || Math.random;
  const idx = BILDER.map((b, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  return idx.slice(0, BILDER_JE_RUNDE).map((i) => BILDER[i]);
}

export function bildSvg(bild, k) {
  return '<svg class="fz-svg" data-bild="' + bild.id + '" viewBox="0 0 ' + BILD_B + " " + BILD_H + '" role="img" aria-label="' + k.esc(k.tx("fzSzeneAria")) + '" focusable="false" preserveAspectRatio="xMidYMid meet">' +
    bild.svgInnen + '<g class="fz-marken"></g></svg>';
}

/* ===================== Bildschirm ===================== */
let cssVersprechen = null;
function eigenesCssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-fahrzeug-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = new URL("./fahrzeug.css", import.meta.url).href;
      l.setAttribute("data-fahrzeug-css", "");
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
    '<div class="sp-fahrzeug">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("fzName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte fz-buehne">' +
        '<div class="fz-hud" dir="auto"><span class="fz-bild" role="status" aria-live="polite"></span>' +
          '<span class="fz-punkte"><span class="sp-label">' + k.esc(k.tx("fzPunkte")) + '</span> <b dir="ltr">0</b></span></div>' +
        '<div class="fz-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="fz-info" dir="auto"><span class="fz-zaehler"></span><span class="fz-zeit" dir="ltr"></span></div>' +
        '<div class="fz-frage" dir="auto"></div>' +
        '<div class="fz-szene"><div class="fz-bildplatz"></div><button type="button" class="fz-knopf start"></button></div>' +
        '<div class="fz-meldung" role="status" aria-live="polite" dir="auto"></div>' +
        '<button type="button" class="fz-fertig" hidden></button>' +
        '<div class="fz-antwort" hidden></div>' +
      "</div>" +
      '<p class="admin-sub fz-anleitung">' + k.esc(k.tx("fzBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const q = (s) => platz.querySelector(s);
  const bildEl = q(".fz-bild"), punkteEl = q(".fz-punkte b"), leiste = q(".fz-leiste i"), zaehlerEl = q(".fz-zaehler"), zeitEl = q(".fz-zeit");
  const frageEl = q(".fz-frage"), szeneEl = q(".fz-szene"), bildPlatz = q(".fz-bildplatz"), knopf = q(".fz-knopf"), meldung = q(".fz-meldung");
  const fertigKnopf = q(".fz-fertig"), antwortEl = q(".fz-antwort"), anleitung = q(".fz-anleitung"), ergebnis = q(".sp-ergebnis");
  const format = function (w) { return w + " " + k.tx("fzPunkte"); };
  const rank = rankingKarte(k, "fahrzeug", "", q(".sp-rank-platz"), format);
  profilKarte(k, q(".sp-profil-platz"), function () { rank.aktualisieren(); });

  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "spiel" || zustand === "aufloesung"; }
  function buehneInsBild() { try { q(".fz-buehne").scrollIntoView({ block: "start" }); } catch (e) {} }
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
    knopf.hidden = false; knopf.className = "fz-knopf start"; knopf.textContent = k.tx("start");
  }

  function starteRunde() {
    bereitMachen();
    const meine = rundenNr;
    zustand = "start"; anleitung.hidden = true; ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "fz-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "fahrzeug" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
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
    zaehlerEl.textContent = k.tx("fzGefunden", { n: Object.keys(gefundenIds).length, m: aktuell.maengel.length });
  }
  function liveStand() { return gesamt + Math.max(0, Object.keys(gefundenIds).length * PKT_MANGEL - fehl * ABZUG_TIPP); }

  function zeigeBild() {
    zustand = "spiel";
    aktuell = bilder[nr]; gefundenIds = {}; fehl = 0; gesperrtBis = 0;
    szeneEl.classList.remove("leer");
    bildPlatz.innerHTML = bildSvg(aktuell, k);
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    bildEl.textContent = k.tx("fzBild", { n: nr + 1, m: BILDER_JE_RUNDE }) + " · " + k.tx(aktuell.name);
    frageEl.textContent = k.tx("fzFrage");
    fertigKnopf.hidden = false; fertigKnopf.textContent = k.tx("fzFertig");
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
    e.setAttribute("class", "fz-ring " + klasse);
    e.innerHTML = '<circle cx="' + g.x + '" cy="' + g.y + '" r="21" fill="none"/>' +
      (zahl ? '<circle class="fz-nr-bg" cx="' + (g.x + 15) + '" cy="' + (g.y - 15) + '" r="8"/><text x="' + (g.x + 15) + '" y="' + (g.y - 11.6) + '" text-anchor="middle" class="fz-nr">' + zahl + "</text>" : "");
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
    const t = treffer(aktuell.maengel, x, y, minR);
    const marken = svg.querySelector(".fz-marken");
    if (t) {
      if (gefundenIds[t.id]) return;                    // schon gefunden: weder Punkte noch Abzug
      gefundenIds[t.id] = true;
      marken.appendChild(ring(t, "gefunden", 0));
      meldung.textContent = k.tx("fzTreffer");
      zaehlerZeichnen(); setPunkte(liveStand());
      if (Object.keys(gefundenIds).length >= aktuell.maengel.length) bildBeenden("alle");
    } else {
      fehl++;
      gesperrtBis = jetzt + SPERRE_MS;
      const m = document.createElementNS(NS, "g");
      m.setAttribute("class", "fz-fehltipp");
      m.innerHTML = '<path d="M' + (x - 7) + " " + (y - 7) + "L" + (x + 7) + " " + (y + 7) + "M" + (x + 7) + " " + (y - 7) + "L" + (x - 7) + " " + (y + 7) + '"/>';
      marken.appendChild(m);
      timer.push(setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 700));
      meldung.textContent = k.tx("fzFehltipp", { v: ABZUG_TIPP, m: STRAFE_MS / 1000 });
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
    const n = Object.keys(gefundenIds).length, m = aktuell.maengel.length, alle = n === m;
    const punkte = punkteBild(n, fehl, restMs, alle);
    gesamt += punkte; summeGefunden += n; summeFehl += fehl; if (alle) vollstaendig++; summeAlle += m;
    setPunkte(gesamt); zeitEl.textContent = ""; leiste.style.width = "0%";
    fertigKnopf.hidden = true; meldung.textContent = "";
    const marken = bildPlatz.querySelector(".fz-marken");
    marken.innerHTML = "";
    aktuell.maengel.forEach(function (g, i) { marken.appendChild(ring(g, gefundenIds[g.id] ? "gefunden" : "uebersehen", i + 1)); });
    bildPlatz.querySelector("svg").classList.add("fest");
    const letzte = nr >= bilder.length - 1;
    const bonus = alle ? Math.floor(Math.max(0, restMs) / 1000) * BONUS_JE_S : 0;
    let h = '<div class="fz-urteil ' + (alle ? "ja" : "nein") + '">' + k.esc(alle ? k.tx("fzAlle", { v: bonus }) : grund === "zeit" ? k.tx("fzZeitAus") : k.tx("fzFertigMsg")) + "</div>" +
      '<div class="fz-zahlen" dir="auto">' + k.esc(k.tx("fzGefunden", { n: n, m: m })) + " · " + k.esc(k.tx("fzBildPunkte", { v: punkte })) + "</div>" +
      '<div class="fz-legende" dir="auto"><span class="fz-leg gefunden">' + k.esc(k.tx("fzMarkGefunden")) + '</span><span class="fz-leg uebersehen">' + k.esc(k.tx("fzMarkUebersehen")) + "</span></div>" +
      '<h3 class="fz-listentitel" dir="auto">' + k.esc(k.tx("fzListe")) + '</h3><ol class="fz-liste">';
    aktuell.maengel.forEach(function (g, i) {
      const f = gefundenIds[g.id];
      h += '<li class="fz-eintrag ' + (f ? "gefunden" : "uebersehen") + '" data-mangel="' + g.id + '"><span class="fz-nummer" aria-hidden="true">' + (i + 1) + "</span>" +
        '<div class="fz-eintrag-text" dir="auto"><div class="fz-eintrag-kopf"><b>' + k.esc(k.tx(mangelTitel(g.typ))) + '</b> <span class="fz-status">' + k.esc(k.tx(f ? "fzMarkGefunden" : "fzMarkUebersehen")) + "</span></div>" +
        '<p>' + k.esc(k.tx(mangelText(g.typ))) + "</p></div></li>";
    });
    h += '</ol><button type="button" class="fz-weiter">' + k.esc(letzte ? k.tx("fzErgebnisZeigen") : k.tx("fzWeiter")) + "</button>";
    antwortEl.innerHTML = h; antwortEl.hidden = false;
    antwortEl.querySelector(".fz-weiter").addEventListener("click", function () { weiter(letzte); });
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
    knopf.hidden = false; knopf.className = "fz-knopf start"; knopf.textContent = k.tx("nochmal");
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
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("fzPunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="fz-ergzeile" dir="auto">' + k.esc(k.tx("fzErgGefunden", { n: e.gefunden, m: e.alle })) + "</p>" +
        '<p class="fz-ergzeile" dir="auto">' + k.esc(k.tx("fzErgFehltipps", { n: e.fehl })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse" dir="auto">' + k.esc(k.tx("fzHinweis")) + "</p>" +
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
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("fzNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("fzBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.fahrzeug = d.bestwert;
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

  // Bis fahrzeug.css geladen ist, bleibt der Bereich unsichtbar (sonst blitzt ungestalteter Text auf)
  const wurzel = q(".sp-fahrzeug");
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
