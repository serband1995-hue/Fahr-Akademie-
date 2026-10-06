/* Spiel 5: Fahrlehrer-Simulator (Familie B: Szene + Auswahl).
   Der Spieler ist der Fahrlehrer. Pro Runde sieht er eine kleine, selbst gezeichnete Szene von oben (Fahrschüler = blaues Auto)
   mit einem Fahrfehler und beantwortet zwei Fragen mit je drei Antworten:
     1. Was hat der Fahrschüler falsch gemacht?   2. Was sagst du als Fahrlehrer?
   Es gibt genau EINE richtige Antwort je Frage. Danach steht die Regel dabei (Lerneffekt, Quellen im Kopf von texte-fahrlehrer.js).
   8 Runden aus 14 Szenarien, zufällig gezogen, jedes Szenario höchstens einmal je Durchgang.
   Punkte: je richtige Teilantwort 50 bis 75 (schneller = mehr), Wert = Gesamtpunkte (größer ist besser).

   Verkehrszeichen: NUR die amtlichen Bilder aus verkehr/vorfahrt-zeichen/ (siehe QUELLEN.md und spiele/schilder.js), eingebunden als
   <image> in der Szene. Alles andere (Autos, Menschen, Fahrräder, Straßen) ist selbst gezeichnet und zeigt kein Zeichen nach.

   Die Regeln des Spiels stehen als reine Rechnung (ohne Bildschirm) oben, damit sich der Pool prüfen lässt (werkzeuge/pruefe-fahrlehrer.mjs).
   Ranking: Wert = Punkte 0–1200; richtig = Zahl der richtigen Teilantworten (0–16), je richtiger 50–75 Punkte; der Server prüft das,
   siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „fahrlehrer“. */
import { rankingKarte, profilKarte } from "./rahmen.js";

/* ===================== Regeln und Pool (reine Rechnung) ===================== */
export const ANZAHL_RUNDEN = 8;
export const FRAGEN_JE_RUNDE = 2;
export const PUNKTE_MIN = 50, PUNKTE_MAX = 75;            // je richtiger Teilantwort
export const BONUS_MS = 10000, LIMIT_MS = 30000;           // so schnell gibt es den vollen Bonus / so lange hat man je Frage
export const PAUSE_MS = 1000;                              // kurze Anzeige „richtig/falsch“ nach der ersten Frage
export const MAX_PUNKTE = ANZAHL_RUNDEN * FRAGEN_JE_RUNDE * PUNKTE_MAX;
export function punkteFuer(ms) { return PUNKTE_MIN + Math.round((PUNKTE_MAX - PUNKTE_MIN) * Math.max(0, 1 - ms / BONUS_MS)); }

/* Ein Szenario: id, Szene (Zeichnung), Texte. In den Texten (texte-fahrlehrer.js) ist e1/k1 die RICHTIGE Antwort; die Anzeige-Reihenfolge wird gemischt. */
const nr2 = (n) => (n < 10 ? "0" + n : "" + n);
function szenario(n, id) {
  const p = "flS" + nr2(n);
  return {
    id: id, bild: p, regel: p + "x",
    fehler: { richtig: p + "e1", falsch: [p + "e2", p + "e3"] },
    korrektur: { richtig: p + "k1", falsch: [p + "k2", p + "k3"] }
  };
}
export const SZENARIEN = [
  szenario(1, "schulterblick"), szenario(2, "blinker"), szenario(3, "abstand"), szenario(4, "stopp"), szenario(5, "zebra"),
  szenario(6, "radfahrer"), szenario(7, "tuer"), szenario(8, "reissverschluss"), szenario(9, "fernlicht"), szenario(10, "rettungsgasse"),
  szenario(11, "tempo30"), szenario(12, "nass"), szenario(13, "rechtsabbieger"), szenario(14, "kurve")
];
/* Alle Textschlüssel, die ein Szenario braucht (für Prüfungen) */
export function schluesselVon(s) { return [s.bild, s.regel, s.fehler.richtig].concat(s.fehler.falsch, [s.korrektur.richtig], s.korrektur.falsch); }

/* Mischen (Fisher-Yates) mit austauschbarer Zufallsquelle */
export function mischen(liste, rnd) {
  const zufall = rnd || Math.random, a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/* n verschiedene Szenarien ziehen: nie dasselbe zweimal */
export function ziehe(n, rnd) { return mischen(SZENARIEN, rnd).slice(0, n); }
/* Antworten einer Frage in zufälliger Reihenfolge: [{ schluessel, richtig }] */
export function antwortenFuer(gruppe, rnd) {
  return mischen([{ schluessel: gruppe.richtig, richtig: true }].concat(gruppe.falsch.map((s) => ({ schluessel: s, richtig: false }))), rnd);
}

/* ===================== Zeichnungen (alles selbst gezeichnet, Draufsicht, 320 x 180) ===================== */
const BLAU = "#2d6cdf", ROT = "#d64545", GELB = "#f2a900", GRUEN = "#2e9e5b";
const ASPHALT = "#4a4d54", WIESE = "#6f9a5a", WEG = "#c9c2b0";
const BILD = (name) => new URL("../verkehr/vorfahrt-zeichen/" + name, import.meta.url).href;
const schild = (name, x, y, g) => '<image href="' + BILD(name) + '" x="' + x + '" y="' + y + '" width="' + g + '" height="' + g + '"/>';
const rect = (x, y, w, h, f, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (extra || "") + "/>";
const mittellinie = (x1, y1, x2, y2) => '<path d="M' + x1 + " " + y1 + " L" + x2 + " " + y2 + '" stroke="#e9e9e9" stroke-width="2" stroke-dasharray="10 8" fill="none"/>';
const pfeil = (d, farbe) => '<path d="' + d + '" fill="none" stroke="' + (farbe || "#fff") + '" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round" marker-end="url(#fl-spitze)"/>';
const pille = (cx, cy, text, b) => '<g><rect x="' + (cx - b / 2) + '" y="' + (cy - 11) + '" width="' + b + '" height="22" rx="11" fill="#fff" fill-opacity=".94" stroke="rgba(0,0,0,.35)"/>' +
  '<text x="' + cx + '" y="' + (cy + 4.5) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1d1d1b" font-family="system-ui,Arial,sans-serif">' + text + "</text></g>";
const DEFS = '<defs><marker id="fl-spitze" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fff"/></marker></defs>';

/* Auto von oben. Front zeigt bei rot = 0 nach oben, rot = 90 nach rechts. o: blinkL, blinkR, bremse, schule, licht ("aus") */
function auto(cx, cy, rot, farbe, o) {
  o = o || {};
  const blinker = (an, x, y) => an
    ? '<circle class="fl-blink" cx="' + x + '" cy="' + y + '" r="3.3" fill="#ffb000"/>'
    : '<circle cx="' + x + '" cy="' + y + '" r="1.9" fill="#8a8a8a"/>';
  const hinten = (an, x) => (an ? '<circle class="fl-blink" cx="' + x + '" cy="13" r="3" fill="#ffb000"/>' : "");
  return '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ')">' +
    '<rect x="-8" y="-15" width="16" height="30" rx="5" fill="' + farbe + '" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
    '<rect x="-5.5" y="-8.5" width="11" height="7" rx="2" fill="#d8e8f5"/><rect x="-5.5" y="6" width="11" height="5" rx="2" fill="#d8e8f5"/>' +
    '<rect x="-7" y="-15.6" width="4" height="2.4" rx="1" fill="' + (o.licht === "aus" ? "#b8b8a0" : "#fff6c2") + '"/><rect x="3" y="-15.6" width="4" height="2.4" rx="1" fill="' + (o.licht === "aus" ? "#b8b8a0" : "#fff6c2") + '"/>' +
    '<rect x="-7" y="13.2" width="4" height="2.4" rx="1" fill="' + (o.bremse ? "#ff2a2a" : "#7a1f1f") + '"/><rect x="3" y="13.2" width="4" height="2.4" rx="1" fill="' + (o.bremse ? "#ff2a2a" : "#7a1f1f") + '"/>' +
    (o.bremse ? '<ellipse cx="0" cy="19" rx="10" ry="4" fill="#ff2a2a" opacity=".35"/>' : "") +
    blinker(o.blinkL, -8, -12.5) + blinker(o.blinkR, 8, -12.5) + hinten(o.blinkL, -7) + hinten(o.blinkR, 7) +
    (o.schule ? '<rect x="-4.2" y="-2" width="8.4" height="5" rx="1" fill="#fff" stroke="#1d3f8f" stroke-width=".9"/>' : "") +
    "</g>";
}
function lkw(cx, cy, rot) {
  return '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ')">' +
    '<rect x="-9" y="-30" width="18" height="16" rx="4" fill="' + GELB + '" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
    '<rect x="-6.5" y="-27" width="13" height="6" rx="2" fill="#d8e8f5"/>' +
    '<rect x="-8.5" y="-12" width="17" height="42" rx="2" fill="#e9e4d4" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
    '<rect x="-6" y="27" width="4" height="2.4" fill="#7a1f1f"/><rect x="2" y="27" width="4" height="2.4" fill="#7a1f1f"/></g>';
}
/* Mensch von oben (Schultern + Kopf); kind = kleiner */
function mensch(x, y, rot, farbe, kind) {
  const s = kind ? 0.75 : 1;
  return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + s + ')"><ellipse cx="0" cy="0" rx="7" ry="3.8" fill="' + farbe + '" stroke="rgba(0,0,0,.4)" stroke-width="1"/><circle cx="0" cy="0" r="3.4" fill="#e8c39e" stroke="rgba(0,0,0,.35)" stroke-width=".8"/></g>';
}
/* Fahrrad von oben; Fahrer sitzt in der Mitte. rot = 90: fährt nach rechts */
function rad(x, y, rot, farbe) {
  return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ')">' +
    '<ellipse cx="0" cy="0" rx="2" ry="10" fill="#2b2b2b"/><rect x="-6" y="-7" width="12" height="2" rx="1" fill="#2b2b2b"/>' +
    '<ellipse cx="0" cy="1" rx="5.5" ry="3.6" fill="' + farbe + '" stroke="rgba(0,0,0,.4)" stroke-width="1"/><circle cx="0" cy="-1" r="3.2" fill="#e8c39e" stroke="rgba(0,0,0,.35)" stroke-width=".8"/></g>';
}
const baum = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#3f7a3a" stroke="rgba(0,0,0,.25)"/><circle cx="' + (x - r / 4) + '" cy="' + (y - r / 4) + '" r="' + r / 2 + '" fill="#4f8d49"/>';
const mast = (x, y1, y2) => '<path d="M' + x + " " + y1 + " V" + y2 + '" stroke="#8b8d94" stroke-width="2.4"/>';

/* Je Szenario eine Funktion (k für Zahlen mit Komma/Punkt), liefert den Inhalt des <svg> (320 x 180) */
const SZENEN = {
  /* 1 Schulterblick: Auto wechselt nach links, ein anderes liegt im toten Winkel */
  schulterblick: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 40, 320, 100, ASPHALT) + mittellinie(0, 90, 320, 90) +
    '<polygon points="143,100 66,47 66,93" fill="#ffb000" fill-opacity=".25" stroke="#ffb000" stroke-width="1.5" stroke-dasharray="4 4"/>' +
    pfeil("M168 98 Q190 84 200 64") +
    auto(94, 68, 90, ROT) + auto(150, 110, 68, BLAU, { blinkL: true, schule: true }),
  /* 2 Blinker: Rechtsabbieger ohne Blinker, Hintermann bremst */
  blinker: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 55, 320, 70, ASPHALT) + rect(196, 124, 48, 56, ASPHALT) + mittellinie(0, 90, 320, 90) +
    pfeil("M176 114 Q208 120 218 152") +
    auto(110, 108, 90, ROT, { bremse: true }) + auto(163, 115, 112, BLAU, { schule: true }),
  /* 3 Abstand: 100 km/h, nur 20 m */
  abstand: (k) =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 55, 320, 70, ASPHALT) + rect(0, 57, 320, 2, "#e9e9e9") + rect(0, 121, 320, 2, "#e9e9e9") +
    auto(262, 90, 90, ROT) + auto(106, 90, 90, BLAU, { schule: true }) +
    '<path d="M123 66 H247" stroke="#fff" stroke-width="2" marker-end="url(#fl-spitze)" marker-start="url(#fl-spitze)"/>' +
    pille(185, 42, "20 m", 56) + pille(106, 150, "100 km/h", 84),
  /* 4 Stoppschild: Auto rollt über die Haltlinie, Querverkehr von links */
  stopp: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 20, 320, 60, ASPHALT) + rect(130, 78, 60, 102, ASPHALT) + mittellinie(0, 50, 320, 50) +
    rect(160, 111, 30, 4, "#f4f4f4") +
    '<path d="M168 150 V140 M182 156 V142" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>' +
    schild("z206.svg", 196, 104, 34) + mast(213, 138, 150) +
    auto(84, 65, 90, ROT) + auto(175, 99, 0, BLAU, { schule: true }),
  /* 5 Zebrastreifen: Fußgänger wartet, Auto fährt ohne zu bremsen heran */
  zebra: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 40, 320, 20, WEG) + rect(0, 120, 320, 20, WEG) + rect(0, 60, 320, 60, ASPHALT) + mittellinie(0, 90, 320, 90) +
    [62, 71, 80, 89, 98, 107].map((y) => rect(146, y, 44, 5, "#f4f4f4")).join("") +
    schild("z350.svg", 200, 6, 30) + mast(215, 36, 48) +
    mensch(168, 52, 0, "#9b59b6") +
    '<path d="M30 112 H44 M18 106 H40" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>' + pfeil("M118 106 H138") +
    auto(90, 106, 90, BLAU, { schule: true }),
  /* 6 Radfahrer überholen: nur 0,5 m Abstand */
  radfahrer: (k) =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 135, 320, 45, WEG) + rect(0, 50, 320, 85, ASPHALT) + mittellinie(0, 92, 320, 92) + rect(0, 133, 320, 2, "#e9e9e9") +
    auto(172, 108, 90, BLAU, { schule: true }) + rad(150, 124, 90, GRUEN) +
    '<path d="M160 118 V140" stroke="#fff" stroke-width="1.6"/>' + pille(160, 156, k.zahl(0.5, 1) + " m", 56),
  /* 7 Holländischer Griff: Fahrertür geht auf, Radfahrer kommt von hinten */
  tuer: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 125, 320, 55, WEG) + rect(0, 45, 320, 80, ASPHALT) + mittellinie(0, 82, 320, 82) + rect(0, 123, 320, 2, "#e9e9e9") +
    auto(160, 112, 90, BLAU, { schule: true }) + mensch(158, 112, 90, "#c0392b") +
    '<path d="M172 104 L164 88" stroke="#1d4fa8" stroke-width="4" stroke-linecap="round"/>' +
    pfeil("M128 92 H150") + rad(108, 92, 90, GRUEN),
  /* 8 Reißverschluss: rechte Spur endet, Fahrschüler lässt niemanden einfädeln */
  reissverschluss: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 55, 320, 40, ASPHALT) + '<polygon points="0,95 230,95 140,135 0,135" fill="' + ASPHALT + '"/>' +
    mittellinie(0, 95, 138, 95) + '<path d="M140 135 L230 95" stroke="#e9e9e9" stroke-width="2"/>' +
    pfeil("M176 112 Q196 106 188 88") +
    auto(208, 75, 90, GELB) + auto(150, 75, 90, BLAU, { schule: true }) + auto(150, 116, 90, ROT, { blinkL: true }),
  /* 9 Fernlicht bei Gegenverkehr (Nacht) */
  fernlicht: () =>
    '<defs><linearGradient id="fl-strahl" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff6c2" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c2" stop-opacity=".08"/></linearGradient>' +
    '<radialGradient id="fl-blend"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    rect(0, 0, 320, 180, "#1f2a38") + rect(0, 50, 320, 90, "#2f3239") + mittellinie(0, 95, 320, 95) +
    '<polygon points="106,112 106,124 316,152 316,78" fill="url(#fl-strahl)"/>' +
    '<polygon points="228,66 228,76 190,74 190,68" fill="#fff6c2" fill-opacity=".45"/>' +
    auto(90, 118, 90, BLAU, { schule: true }) + auto(250, 71, 270, ROT) +
    '<circle cx="226" cy="71" r="20" fill="url(#fl-blend)"/>',
  /* 10 Rettungsgasse: Fahrschüler steht auf der linken Spur zu weit in der Mitte */
  rettungsgasse: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 40, 320, 100, ASPHALT) + mittellinie(0, 90, 320, 90) +
    '<rect x="0" y="83" width="320" height="22" fill="#2ea84f" fill-opacity=".28"/>' +
    pfeil("M70 94 H270", "#8fe3a8") + '<path d="M146 84 L162 100 M162 84 L146 100" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/>' +
    auto(205, 128, 90, GRUEN) + auto(154, 76, 90, BLAU, { schule: true }) +
    '<g transform="translate(40 94) rotate(90)"><rect x="-9" y="-19" width="18" height="38" rx="4" fill="#fff" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/><rect x="-9" y="-3" width="18" height="5" fill="#d64545"/><rect x="-6" y="-14" width="12" height="6" rx="2" fill="#d8e8f5"/>' +
    '<circle class="fl-blink" cx="-4" cy="-1" r="3.2" fill="#3a8dff"/><circle class="fl-blink" cx="4" cy="-1" r="3.2" fill="#3a8dff"/></g>',
  /* 11 Tempo-30-Zone: 50 km/h, Kind am Straßenrand */
  tempo30: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 52, 320, 20, WEG) + rect(0, 72, 320, 70, ASPHALT) + mittellinie(0, 107, 320, 107) +
    schild("z2741.svg", 240, 4, 42) + mast(261, 44, 56) +
    mensch(196, 62, 180, "#e67e22", true) + '<circle cx="204" cy="66" r="3" fill="#e74c3c"/>' +
    '<path d="M60 124 H78 M50 118 H72" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>' +
    auto(130, 124, 90, BLAU, { schule: true }) + pille(130, 160, "50 km/h", 76),
  /* 12 Nässe: Regen, Schild 100, Fahrschüler genau 100, Vordermann bremst */
  nass: () =>
    rect(0, 0, 320, 180, "#5f7f58") + rect(0, 64, 320, 82, "#3d4046") + mittellinie(0, 105, 320, 105) +
    '<ellipse cx="60" cy="134" rx="26" ry="5" fill="#7d8da0" fill-opacity=".55"/><ellipse cx="236" cy="80" rx="30" ry="5" fill="#7d8da0" fill-opacity=".55"/><ellipse cx="170" cy="138" rx="18" ry="4" fill="#7d8da0" fill-opacity=".5"/>' +
    schild("z274-100.svg", 262, 10, 42) + mast(283, 52, 64) +
    auto(215, 124, 90, ROT, { bremse: true }) + auto(105, 124, 90, BLAU, { schule: true }) + pille(105, 160, "100 km/h", 84) +
    '<g stroke="#e8f1fb" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round">' +
    Array.from({ length: 46 }, (_, i) => { const x = (i * 53) % 324, y = (i * 37) % 176; return '<path d="M' + x + " " + y + " l-4 10" + '"/>'; }).join("") + "</g>",
  /* 13 Rechtsabbieger und Radfahrer auf dem Radweg */
  rechtsabbieger: () =>
    rect(0, 0, 320, 180, WIESE) + rect(0, 30, 320, 76, ASPHALT) + rect(196, 106, 54, 74, ASPHALT) + mittellinie(0, 68, 320, 68) +
    rect(0, 108, 196, 20, "#b9674d") + rect(250, 108, 70, 20, "#b9674d") + rect(196, 108, 54, 20, "#b9674d", ' fill-opacity=".75"') +
    schild("z237.svg", 30, 138, 32) + mast(46, 130, 138) +
    pfeil("M180 94 Q214 98 223 140") +
    auto(160, 95, 108, BLAU, { blinkR: true, schule: true }) + rad(150, 118, 90, GRUEN),
  /* 14 Überholen vor einer Kurve: Lkw, Gegenverkehr kommt aus der Kurve */
  kurve: () =>
    rect(0, 0, 320, 180, WIESE) +
    '<path d="M-10 130 H170 Q250 130 250 60 V-10" fill="none" stroke="' + ASPHALT + '" stroke-width="62" stroke-linejoin="round"/>' +
    '<path d="M-10 130 H170 Q250 130 250 60 V-10" fill="none" stroke="#e9e9e9" stroke-width="2" stroke-dasharray="10 8"/>' +
    baum(196, 84, 13) + baum(172, 62, 10) + baum(214, 62, 9) +
    pfeil("M178 114 Q226 112 232 84", "#ffb000") +
    lkw(104, 145, 90) + auto(160, 115, 90, BLAU, { schule: true }) + auto(235, 62, 180, ROT)
};

export function szeneSvg(id, k, beschriftung) {
  const f = SZENEN[id];
  return '<svg class="sp-fl-svg" viewBox="0 0 320 180" focusable="false" role="img" aria-label="' + k.esc(beschriftung || "") + '">' + DEFS + (f ? f(k) : "") + "</svg>";
}
/* leere Straße für den Startbildschirm */
const leereSzene = () => '<svg class="sp-fl-svg" viewBox="0 0 320 180" aria-hidden="true" focusable="false">' + rect(0, 0, 320, 180, WIESE) + rect(0, 55, 320, 70, ASPHALT) + mittellinie(0, 90, 320, 90) + "</svg>";

/* ===================== Bildschirm ===================== */
let cssVersprechen = null;
function cssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-fahrlehrer-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = new URL("./fahrlehrer.css", import.meta.url).href;
      l.setAttribute("data-fahrlehrer-css", "");
      l.onload = fertig; l.onerror = fertig;     // ohne Stil lieber trotzdem zeigen als gar nichts
      document.head.appendChild(l);
      setTimeout(fertig, 2500);
    } catch (e) { fertig(); }
  });
  return cssVersprechen;
}

export function starte(platz, k) {
  let zustand = "bereit";            // bereit | start | frage | pause | antwort | fertig
  let runden = [], idx = 0, schritt = 1, runde = null, ergId = 0;
  let punkte = 0, richtig = 0, tStart = 0, raf = 0, timer = [];
  let rundePunkte = [0, 0], rundeRichtig = [false, false], rundeGewaehlt = [null, null], fragenListe = [null, null];
  let ergebnisDaten = null, speicherInfo = "";
  let spielNr = 0;                   // zählt Durchgänge: späte Antworten alter Durchgänge werden verworfen
  let weg = false, aufgebaut = false;
  const format = function (w) { return w + " " + k.tx("flPunkte"); };

  function bauen() {
    if (weg || aufgebaut) return;
    aufgebaut = true;
    platz.innerHTML =
      '<div class="sp-fahrlehrer">' +
        '<h2 class="sp-spieltitel">' + k.esc(k.tx("flName")) + "</h2>" +
        (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
        '<div class="karte sp-fl-buehne">' +
          '<div class="sp-fl-hud" dir="auto">' +
            '<span class="sp-fl-runde" role="status" aria-live="polite"></span>' +
            '<span class="sp-fl-punkte"><span class="sp-label">' + k.esc(k.tx("flPunkte")) + '</span> <b dir="ltr">0</b></span>' +
          "</div>" +
          '<div class="sp-fl-leiste" aria-hidden="true"><i></i></div>' +
          '<div class="sp-fl-brett">' +
            '<div class="sp-fl-szene" dir="ltr"></div>' +
            '<button type="button" class="sp-fl-knopf start"></button>' +
          "</div>" +
          '<p class="sp-fl-bild" dir="auto"></p>' +
          '<div class="sp-fl-frage" dir="auto" role="status" aria-live="polite"></div>' +
          '<div class="sp-fl-antworten" role="group" hidden></div>' +
          '<div class="sp-fl-aufloesung" hidden></div>' +
        "</div>" +
        '<p class="admin-sub sp-fl-anleitung">' + k.esc(k.tx("flBereit")) + "</p>" +
        '<div class="sp-ergebnis" hidden></div>' +
        '<div class="sp-profil-platz"></div>' +
        '<div class="sp-rank-platz"></div>' +
      "</div>";
    el.runde = platz.querySelector(".sp-fl-runde"); el.punkte = platz.querySelector(".sp-fl-punkte b");
    el.leiste = platz.querySelector(".sp-fl-leiste i"); el.szene = platz.querySelector(".sp-fl-szene");
    el.bild = platz.querySelector(".sp-fl-bild"); el.frage = platz.querySelector(".sp-fl-frage");
    el.antworten = platz.querySelector(".sp-fl-antworten"); el.aufloesung = platz.querySelector(".sp-fl-aufloesung");
    el.knopf = platz.querySelector(".sp-fl-knopf"); el.anleitung = platz.querySelector(".sp-fl-anleitung");
    el.ergebnis = platz.querySelector(".sp-ergebnis"); el.buehne = platz.querySelector(".sp-fl-buehne");
    el.rank = rankingKarte(k, "fahrlehrer", "", platz.querySelector(".sp-rank-platz"), format);
    profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { el.rank.aktualisieren(); });
    el.knopf.addEventListener("click", function () { if (zustand === "bereit" || zustand === "fertig") starteSpiel(); });
    bereitMachen();
    if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);
  }
  const el = {};

  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "frage" || zustand === "pause" || zustand === "antwort"; }
  function anleitungZeigen() { el.anleitung.hidden = imSpiel(); }
  function buehneInsBild() { try { el.buehne.scrollIntoView({ block: "start" }); } catch (e) {} }
  function setPunkte(p) { el.punkte.textContent = String(p); }
  function brettDimmen(an) { el.szene.classList.toggle("aus", an); }

  function bereitMachen() {
    stopTimer(); spielNr++;
    zustand = "bereit"; anleitungZeigen();
    idx = 0; punkte = 0; richtig = 0;
    el.szene.innerHTML = leereSzene(); brettDimmen(true);
    el.antworten.hidden = true; el.antworten.innerHTML = ""; el.aufloesung.hidden = true; el.aufloesung.innerHTML = "";
    el.runde.textContent = ""; el.bild.textContent = ""; el.frage.textContent = ""; el.frage.className = "sp-fl-frage";
    setPunkte(0); el.leiste.style.width = "0%";
    el.knopf.hidden = false; el.knopf.className = "sp-fl-knopf start"; el.knopf.textContent = k.tx("start");
  }

  /* ---- Ablauf ---- */
  function starteSpiel() {
    bereitMachen();
    const meine = spielNr;
    zustand = "start"; anleitungZeigen(); ergId++; runde = null; el.ergebnis.hidden = true; el.ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    el.knopf.className = "sp-fl-knopf warte"; el.knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "fahrlehrer" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== spielNr || zustand !== "start") return;
      runde = r; runden = ziehe(ANZAHL_RUNDEN); idx = 0;
      el.knopf.hidden = true; brettDimmen(false);
      neueRunde();
    });
  }

  function neueRunde() {
    const s = runden[idx];
    rundePunkte = [0, 0]; rundeRichtig = [false, false]; rundeGewaehlt = [null, null];
    fragenListe = [antwortenFuer(s.fehler), antwortenFuer(s.korrektur)];
    el.aufloesung.hidden = true; el.aufloesung.innerHTML = "";
    el.runde.textContent = k.tx("flRunde", { n: idx + 1, m: ANZAHL_RUNDEN });
    el.szene.innerHTML = szeneSvg(s.id, k, k.tx(s.bild));
    el.bild.innerHTML = k.esc(k.tx(s.bild)) + ' <span class="sp-fl-legende">' + k.esc(k.tx("flLegende")) + "</span>";
    frage(1);
  }

  function frage(n) {
    schritt = n; zustand = "frage";
    el.frage.className = "sp-fl-frage";
    el.frage.innerHTML = '<span class="sp-fl-schritt">' + k.esc(k.tx("flSchritt", { n: n, m: FRAGEN_JE_RUNDE })) + "</span> " + k.esc(k.tx(n === 1 ? "flFrage1" : "flFrage2"));
    el.antworten.innerHTML = fragenListe[n - 1].map(function (a, i) {
      return '<button type="button" class="sp-fl-wahl" data-i="' + i + '" dir="auto">' + k.esc(k.tx(a.schluessel)) + "</button>";
    }).join("");
    el.antworten.hidden = false;
    el.antworten.querySelectorAll(".sp-fl-wahl").forEach(function (b) {
      b.addEventListener("click", function () { antworten(parseInt(b.dataset.i, 10)); });
    });
    tStart = performance.now();
    el.leiste.style.width = "100%"; el.leiste.className = "";
    const meine = spielNr, nrRunde = idx, nrSchritt = n;
    function bild() {
      raf = 0;
      if (zustand !== "frage" || meine !== spielNr || nrRunde !== idx || nrSchritt !== schritt) return;
      const t = performance.now() - tStart;
      el.leiste.style.width = Math.max(0, 1 - t / BONUS_MS) * 100 + "%";
      if (t >= LIMIT_MS) { antworten(null); return; }
      raf = requestAnimationFrame(bild);
    }
    raf = requestAnimationFrame(bild);
  }

  function antworten(i) {
    if (zustand !== "frage") return;
    const ms = performance.now() - tStart;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    const n = schritt, liste = fragenListe[n - 1];
    const gewaehlt = i == null ? null : liste[i];
    const stimmt = !!gewaehlt && gewaehlt.richtig;
    let gewinn = 0;
    if (stimmt) { gewinn = punkteFuer(ms); punkte += gewinn; richtig++; setPunkte(punkte); }
    rundePunkte[n - 1] = gewinn; rundeRichtig[n - 1] = stimmt; rundeGewaehlt[n - 1] = gewaehlt ? gewaehlt.schluessel : null;
    el.antworten.querySelectorAll(".sp-fl-wahl").forEach(function (b, j) {
      b.disabled = true;
      if (liste[j].richtig) b.classList.add("richtig");
      else if (j === i) b.classList.add("falsch");
      else b.classList.add("blass");
    });
    const meldung = stimmt ? k.tx("flRichtig") + " +" + gewinn : (i == null ? k.tx("flZeitAus") : k.tx("flFalsch"));
    el.frage.className = "sp-fl-frage urteil " + (stimmt ? "ja" : "nein");
    el.frage.textContent = meldung;
    el.leiste.style.width = "0%";
    zustand = "pause";
    const meine = spielNr;
    timer.push(setTimeout(function () {
      if (meine !== spielNr || zustand !== "pause") return;
      if (n === 1) frage(2); else aufloesen();
    }, PAUSE_MS));
  }

  function aufloesen() {
    zustand = "antwort";
    const s = runden[idx], letzte = idx >= ANZAHL_RUNDEN - 1;
    el.antworten.hidden = true; el.antworten.innerHTML = "";
    el.frage.className = "sp-fl-frage"; el.frage.textContent = "";
    const zeile = function (n, label, schluessel) {
      const ok = rundeRichtig[n];
      return '<div class="sp-fl-zeile ' + (ok ? "ja" : "nein") + '">' +
        '<span class="sp-fl-marke" aria-hidden="true"></span>' +
        '<div class="sp-fl-zeilentext"><div class="sp-label">' + k.esc(label) + (ok ? ' <span class="sp-fl-plus" dir="ltr">+' + rundePunkte[n] + "</span>" : "") + "</div>" +
        '<div dir="auto">' + k.esc(k.tx(schluessel)) + "</div></div></div>";
    };
    el.aufloesung.innerHTML =
      zeile(0, k.tx("flLabelFehler"), s.fehler.richtig) +
      zeile(1, k.tx("flLabelAnweisung"), s.korrektur.richtig) +
      '<div class="sp-fl-regel" dir="auto"><div class="sp-label">' + k.esc(k.tx("flLabelRegel")) + "</div><p>" + k.esc(k.tx(s.regel)) + "</p></div>" +
      '<button type="button" class="sp-fl-weiter">' + k.esc(letzte ? k.tx("flErgebnisZeigen") : k.tx("flWeiter")) + "</button>";
    el.aufloesung.hidden = false;
    const w = el.aufloesung.querySelector(".sp-fl-weiter");
    w.addEventListener("click", function () { weiter(letzte); });
    try { w.focus({ preventScroll: true }); } catch (e) {}
    try { w.scrollIntoView({ block: "nearest" }); } catch (e) {}
  }

  function weiter(letzte) {
    if (zustand !== "antwort") return;
    if (letzte) { beenden(); return; }
    idx++;
    el.aufloesung.hidden = true; el.aufloesung.innerHTML = "";
    neueRunde();
    buehneInsBild();
  }

  function beenden() {
    stopTimer(); spielNr++;
    zustand = "fertig"; anleitungZeigen();
    el.aufloesung.hidden = true; el.aufloesung.innerHTML = "";
    el.antworten.hidden = true; el.antworten.innerHTML = "";
    el.frage.textContent = ""; el.frage.className = "sp-fl-frage"; el.runde.textContent = ""; el.bild.textContent = "";
    el.szene.innerHTML = leereSzene(); brettDimmen(true);
    el.leiste.style.width = "100%"; el.leiste.className = "spurt";
    el.knopf.hidden = false; el.knopf.className = "sp-fl-knopf start"; el.knopf.textContent = k.tx("nochmal");
    ergebnisDaten = { wert: punkte, richtig: richtig };
    ergId++;
    zeichneErgebnis();
    speichern(punkte, richtig);
    try { el.knopf.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---- Ergebnis ---- */
  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    el.ergebnis.hidden = false;
    el.ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("flPunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="sp-fl-richtigzahl" dir="auto">' + k.esc(k.tx("flRichtigVon", { n: e.richtig, m: ANZAHL_RUNDEN * FRAGEN_JE_RUNDE })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse">' + k.esc(k.tx("flHinweis")) + "</p>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = el.ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }
  function speichern(wert, r) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: wert, richtig: r }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("flNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("flBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.fahrlehrer = d.bestwert;
      setzeSpeicherInfo(html);
      el.rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und von vorn
  function sichtbarkeit() { if (document.hidden && aufgebaut && imSpiel()) bereitMachen(); }
  document.addEventListener("visibilitychange", sichtbarkeit);

  cssLaden().then(bauen);

  return {
    zerstoeren: function () {
      weg = true;
      stopTimer(); spielNr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
