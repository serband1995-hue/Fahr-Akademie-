/* Verkehrszeichen der Mini-Spiele (07.10.2026).
   - Zeichen 205, 206, 306 und 274.1 sind die amtlichen Bilder aus verkehr/vorfahrt-zeichen/ (als <img>).
   - Alle anderen Zeichen sind hier in amtlicher Form selbst gezeichnet (die Bilddateien von Wikimedia lassen sich aus der Cloud
     nicht abrufen): Farben, Formen und Bildzeichen vereinfacht, aber richtig. Keine ids/clipPath, weil dasselbe Zeichen mehrfach
     auf einer Seite stehen kann.
   schildBild(id, opt) -> HTML-String; opt = { beschriftung, zahl (nur Zeichen 274) } */

const ROT = "#c8161d", BLAU = "#0b57a4", GELB = "#f4c400", SCHWARZ = "#161616";
const BILD = (name) => new URL("../verkehr/vorfahrt-zeichen/" + name, import.meta.url).href;

function svg(inhalt, beschriftung) {
  return '<svg viewBox="0 0 100 100" role="img" aria-label="' + beschriftung + '" focusable="false">' + inhalt + "</svg>";
}
function img(name, beschriftung) {
  return '<img src="' + BILD(name) + '" alt="' + beschriftung + '" draggable="false" decoding="async">';
}
const punkt = (r, grad, m) => [50 + (m || 0) + r * Math.cos(grad * Math.PI / 180), 50 - r * Math.sin(grad * Math.PI / 180)];
const f = (p) => p[0].toFixed(2) + "," + p[1].toFixed(2);

/* Zeichen 274: Höchstgeschwindigkeit (weiß, roter Rand, schwarze Zahl) */
export function zeichen274(v, beschriftung) {
  const z = String(v), gross = z.length <= 2;
  return svg('<circle cx="50" cy="50" r="49" fill="#fff"/>' +
    '<circle cx="50" cy="50" r="42.4" fill="none" stroke="' + ROT + '" stroke-width="14.4"/>' +
    '<text x="50" y="' + (gross ? 64 : 61) + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + (gross ? 40 : 29) + '" fill="#111">' + z + "</text>", beschriftung);
}

/* Zeichen 282: Ende sämtlicher streckenbezogener Geschwindigkeitsbeschränkungen und Überholverbote
   (weiße Scheibe, schmaler dunkler Rand, fünf schräge Streifen von links unten nach rechts oben).
   Jeder Streifen endet innerhalb des dunklen Randes. */
export function zeichen282(beschriftung) {
  const R = 46;
  let streifen = "";
  for (let i = -2; i <= 2; i++) {
    const o = i * 13;
    const h = Math.sqrt(R * R - o * o);
    const mx = 50 + o / Math.SQRT2, my = 50 + o / Math.SQRT2;
    const dx = h / Math.SQRT2;
    streifen += '<line x1="' + (mx - dx).toFixed(2) + '" y1="' + (my + dx).toFixed(2) + '" x2="' + (mx + dx).toFixed(2) + '" y2="' + (my - dx).toFixed(2) + '" stroke="#2b2b2b" stroke-width="5.2"/>';
  }
  return svg('<circle cx="50" cy="50" r="49" fill="#fff"/>' + streifen + '<circle cx="50" cy="50" r="47.5" fill="none" stroke="#2b2b2b" stroke-width="3"/>', beschriftung);
}

const ZEICHEN = {
  z205: (b) => img("z205.svg", b),
  z206: (b) => img("z206.svg", b),
  z306: (b) => img("z306.svg", b),
  z2741: (b) => img("z2741.svg", b),
  z274: (b, o) => zeichen274((o && o.zahl) || 50, b),
  z282: (b) => zeichen282(b),
  /* Zeichen 267: Verbot der Einfahrt (roter Kreis, weißer Balken) */
  z267: (b) => svg('<circle cx="50" cy="50" r="49" fill="' + ROT + '"/><circle cx="50" cy="50" r="47" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="17" y="42" width="66" height="16" fill="#fff"/>', b),
  /* Zeichen 283: absolutes Haltverbot (blau, roter Rand, rotes Kreuz) */
  z283: (b) => svg('<circle cx="50" cy="50" r="49" fill="' + ROT + '"/><circle cx="50" cy="50" r="40" fill="' + BLAU + '"/>' +
    '<line x1="27" y1="27" x2="73" y2="73" stroke="' + ROT + '" stroke-width="10"/><line x1="73" y1="27" x2="27" y2="73" stroke="' + ROT + '" stroke-width="10"/>', b),
  /* Zeichen 286: eingeschränktes Haltverbot (blau, roter Rand, EIN roter Schrägbalken von links unten nach rechts oben) */
  z286: (b) => svg('<circle cx="50" cy="50" r="49" fill="' + ROT + '"/><circle cx="50" cy="50" r="40" fill="' + BLAU + '"/>' +
    '<line x1="25" y1="75" x2="75" y2="25" stroke="' + ROT + '" stroke-width="10"/>', b),
  /* Zeichen 250: Verbot für Fahrzeuge aller Art (weiß, roter Rand, leer) */
  z250: (b) => svg('<circle cx="50" cy="50" r="49" fill="#fff"/><circle cx="50" cy="50" r="42.4" fill="none" stroke="' + ROT + '" stroke-width="14.4"/>', b),
  /* Zeichen 220: Einbahnstraße (blaues Rechteck, weißer Pfeil nach rechts) */
  z220: (b) => svg('<rect x="3" y="24" width="94" height="52" rx="5" fill="' + BLAU + '"/><rect x="5.5" y="26.5" width="89" height="47" rx="3.5" fill="none" stroke="#fff" stroke-width="1.8"/>' +
    '<polygon points="14,43 56,43 56,31 86,50 56,69 56,57 14,57" fill="#fff"/>', b),
  /* Zeichen 101: Gefahrstelle (Dreieck, Spitze oben, roter Rand, schwarzes Ausrufezeichen) */
  z101: (b) => svg('<polygon points="50,15 88,82 12,82" fill="#fff" stroke="' + ROT + '" stroke-width="11" stroke-linejoin="round"/>' +
    '<rect x="46" y="38" width="8" height="25" rx="2" fill="' + SCHWARZ + '"/><circle cx="50" cy="71" r="4.6" fill="' + SCHWARZ + '"/>', b),
  /* Zeichen 237: Radweg (blaue Scheibe, weißes Fahrrad) */
  z237: (b) => svg('<circle cx="50" cy="50" r="49" fill="' + BLAU + '"/><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="1.8"/>' +
    '<g fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="31" cy="60" r="12"/><circle cx="69" cy="60" r="12"/>' +
    '<path d="M31 60 L44 38 L61 38 L69 60 M44 38 L50 60 L31 60 M50 60 L61 38"/><path d="M40 33 L49 33 M58 33 L68 35"/></g>', b),
  /* Zeichen 350: Fußgängerüberweg (blaues Quadrat, weißes Dreieck, schwarzer Fußgänger auf Streifen) */
  z350: (b) => svg('<rect x="4" y="4" width="92" height="92" rx="6" fill="' + BLAU + '"/><rect x="6.5" y="6.5" width="87" height="87" rx="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>' +
    '<polygon points="50,15 87,82 13,82" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>' +
    '<g stroke="' + SCHWARZ + '" stroke-width="5.2" stroke-linecap="round" fill="none"><path d="M51 44 L50 60 M50 60 L43 73 M50 60 L58 73 M51 47 L43 56 M51 47 L60 55"/></g><circle cx="52" cy="35" r="5.6" fill="' + SCHWARZ + '"/>' +
    '<g fill="' + SCHWARZ + '"><rect x="26" y="74" width="48" height="3.6"/><rect x="22" y="79" width="56" height="3.6"/></g>', b),
  /* Zeichen 215: Kreisverkehr (blaue Scheibe, drei weiße Pfeile gegen den Uhrzeigersinn) */
  z215: (b) => {
    let pfeile = "";
    for (let k = 0; k < 3; k++) {
      const a0 = 90 + k * 120 + 12, a1 = a0 + 78, r = 22;
      const p0 = punkt(r, a0), p1 = punkt(r, a1);
      // Pfeilspitze am Ende des Bogens, Richtung = Tangente bei wachsendem Winkel (gegen den Uhrzeigersinn)
      const t = [-Math.sin(a1 * Math.PI / 180), -Math.cos(a1 * Math.PI / 180)], n = [-t[1], t[0]];
      const tip = [p1[0] + t[0] * 9, p1[1] + t[1] * 9], l = [p1[0] + n[0] * 6.5, p1[1] + n[1] * 6.5], rr = [p1[0] - n[0] * 6.5, p1[1] - n[1] * 6.5];
      pfeile += '<path d="M' + f(p0) + " A" + r + " " + r + " 0 0 0 " + f(p1) + '" fill="none" stroke="#fff" stroke-width="6.4"/>' +
        '<polygon points="' + f(tip) + " " + f(l) + " " + f(rr) + '" fill="#fff"/>';
    }
    return svg('<circle cx="50" cy="50" r="49" fill="' + BLAU + '"/><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="1.8"/>' + pfeile, b);
  }
};

/* id = "z205" … ; opt.beschriftung = Text für Screenreader (leer = dekorativ) */
export function schildBild(id, opt) {
  const o = opt || {};
  const zeichne = ZEICHEN[id];
  if (!zeichne) return "";
  return zeichne(o.beschriftung || "", o);
}
export const SCHILD_IDS = Object.keys(ZEICHEN);
