/* Spiel 6: Verkehrskontrolle (Familie B: Szene + Auswahl).
   Der Spieler kontrolliert 8 Fahrzeuge. Jedes Fahrzeug hat 4 Prüfstationen zum Antippen:
     Papiere | Ausrüstung | Beleuchtung | Reifen und HU-Plakette.
   An jeder Station sieht man, was das Fahrzeug dabeihat bzw. wie es aussieht, und entscheidet „in Ordnung“ oder „Mangel“.
   Danach entscheidet man über das ganze Fahrzeug: „Weiterfahren lassen“ oder „Mängel festhalten“.
   Nach jedem Fahrzeug steht kurz dabei, was wirklich Pflicht ist und was nicht (Lerneffekt).

   Die Regeln stehen unten als reine Rechnung (ohne Bildschirm), damit sich jede Wertung prüfen lässt.
   Was in Deutschland im Pkw vorgeschrieben ist (Quellen: siehe Bericht / PROJEKTGEDAECHTNIS):
     Papiere:     Führerschein und Zulassungsbescheinigung Teil I müssen mitgeführt werden (Teil I: § 13 Abs. 6 FZV, FZV 2023 seit 01.09.2023; die digitale
                  Zulassungsbescheinigung in der i-Kfz-App genügt auch). Teil II (Fahrzeugbrief) soll NICHT
                  im Auto liegen, ein Versicherungsnachweis muss im Inland nicht mitgeführt werden.
     Ausrüstung:  Warnweste (mind. eine), Warndreieck und Verbandkasten (Erste-Hilfe-Material) gehören in den Pkw.
                  Feuerlöscher, Abschleppseil, Ersatzrad, Starthilfekabel, Eiskratzer sind im Pkw keine Pflicht.
     Beleuchtung: Die vorgeschriebene Beleuchtung (Abblendlicht, Bremslicht, Blinker) muss funktionieren.
     Reifen:      Profil mindestens 1,6 mm (genau 1,6 mm ist erlaubt); HU-Plakette hinten am Kennzeichen, gültig bis zum Ende des
                  angezeigten Monats; bei Glatteis, Schneeglätte, Schneematsch, Eis- oder Reifglätte nur mit Winterreifen (Alpine-Symbol; M+S allein genügt seit 01.10.2024 nicht mehr).
   Ein Fahrzeug „hat einen Mangel“, wenn mindestens eine Station einen Mangel hat.

   Punkte: je richtige Entscheidung 20 bis 30 (Zeit-Bonus bis 8 s), falscher Alarm −15, übersehener Mangel 0.
   Pro Fahrzeug nie unter 0. Ranking: Gesamtpunkte (größer ist besser, 0–1200). Der Server prüft: richtig (0–40) und
   Punkte höchstens 30 je richtiger Entscheidung, Mindestdauer, einmal einlösbar; siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „kontrolle“. */
import { rankingKarte, profilKarte } from "./rahmen.js";

/* ===================== Regeln (reine Rechnung) ===================== */
export const STATIONEN = ["papiere", "ausruestung", "licht", "reifen"];
export const PAPIERE_ALLE = ["fs", "zb1", "zb2", "vers"];
export const PAPIERE_PFLICHT = ["fs", "zb1"];
export const AUSR_ALLE = ["weste", "dreieck", "verband", "feuer", "seil", "rad", "kabel", "kratzer"];
export const AUSR_PFLICHT = ["weste", "dreieck", "verband"];
export const MIN_PROFIL = 16;                     // Zehntel Millimeter: mindestens 1,6 mm
export const ANZAHL_FAHRZEUGE = 8;
export const ENTSCHEIDUNGEN_JE_FAHRZEUG = 5;       // 4 Stationen + Gesamtentscheidung
export const ENTSCHEIDUNGEN = ANZAHL_FAHRZEUGE * ENTSCHEIDUNGEN_JE_FAHRZEUG;

/* Eine Station prüfen. Ergebnis: { mangel, zeilen: [{ k: Textschlüssel, art: "mangel" | "ok" | "info" }] }
   `ok` und `info` sind keine Mängel; `info` erklärt etwas, das KEIN Mangel ist (typischer Irrtum). */
export function pruefeStation(fall, station) {
  const z = [];
  if (station === "papiere") {
    if (!fall.papiere.includes("fs")) z.push({ k: "koPFs", art: "mangel" });
    if (!fall.papiere.includes("zb1")) z.push({ k: "koPZb", art: "mangel" });
    if (!z.length) z.push({ k: "koPOk", art: "ok" });
    if (fall.papiere.includes("zb2")) z.push({ k: "koPTeil2", art: "info" });
    if (fall.papiere.includes("vers")) z.push({ k: "koPVers", art: "info" });
  } else if (station === "ausruestung") {
    if (!fall.ausr.includes("weste")) z.push({ k: "koAWeste", art: "mangel" });
    if (!fall.ausr.includes("dreieck")) z.push({ k: "koADreieck", art: "mangel" });
    if (!fall.ausr.includes("verband")) z.push({ k: "koAVerband", art: "mangel" });
    if (!z.length) z.push({ k: "koAOk", art: "ok" });
    ["feuer", "seil", "rad", "kabel", "kratzer"].forEach(function (id) { if (fall.ausr.includes(id)) z.push({ k: "koX" + id, art: "info" }); });
  } else if (station === "licht") {
    const L = fall.licht;
    if (L.ab.includes(false)) z.push({ k: "koLAb", art: "mangel" });
    if (L.br.includes(false)) z.push({ k: "koLBr", art: "mangel" });
    if (L.bl.includes(false)) z.push({ k: "koLBl", art: "mangel" });
    if (!z.length) z.push({ k: "koLOk", art: "ok" });
  } else if (station === "reifen") {
    const r = fall.reifen;
    z.push(r.profil < MIN_PROFIL ? { k: "koRProfBad", art: "mangel" } : { k: "koRProfOk", art: "ok" });
    if (fall.hu == null) z.push({ k: "koRPlFehlt", art: "mangel" });
    else if (fall.hu < 0) z.push({ k: "koRPlAb", art: "mangel" });
    else z.push({ k: "koRPlOk", art: "ok" });
    if (r.wetter === "schnee") z.push(r.typ === "winter" ? { k: "koRWinterDa", art: "ok" } : { k: "koRWinterFehlt", art: "mangel" });
    else if (r.typ === "winter") z.push({ k: "koRWinterSommer", art: "info" });
  } else throw new Error("unbekannte Station " + station);
  return { mangel: z.some(function (x) { return x.art === "mangel"; }), zeilen: z };
}
export function stationMangel(fall, station) { return pruefeStation(fall, station).mangel; }
export function fahrzeugMangel(fall) { return STATIONEN.some(function (s) { return stationMangel(fall, s); }); }

/* HU-Plakette: `versatz` Monate ab dem aktuellen Monat (negativ = abgelaufen). jetzt = { jahr, monat (1–12) } */
export function plakettenMonat(versatz, jetzt) {
  const gesamt = jetzt.jahr * 12 + (jetzt.monat - 1) + versatz;
  return { jahr: Math.floor(gesamt / 12), monat: (gesamt % 12 + 12) % 12 + 1 };
}

/* ---- Punkte ---- */
export const BONUS_MS = 8000, PUNKTE_BASIS = 20, PUNKTE_BONUS = 10, ABZUG = 15, MAX_JE_ENTSCHEIDUNG = PUNKTE_BASIS + PUNKTE_BONUS;
export function punkteFuer(ms) { return PUNKTE_BASIS + Math.round(PUNKTE_BONUS * Math.max(0, 1 - ms / BONUS_MS)); }
/* wahr/antwort: true = „Mangel“. Ergebnis: { art: "richtig" | "alarm" | "uebersehen", punkte } */
export function entscheidung(wahr, antwort, ms) {
  if (wahr === antwort) return { art: "richtig", punkte: punkteFuer(ms) };
  return antwort ? { art: "alarm", punkte: -ABZUG } : { art: "uebersehen", punkte: 0 };
}
/* Ein Fahrzeug werten. ant = { papiere: bool, … } (true = Mangel gemeldet), ent = true (Mängel festhalten) / false (weiterfahren),
   zeiten = { papiere: ms, …, ent: ms }. Punkte nie unter 0. */
export function bewerteFahrzeug(fall, ant, ent, zeiten) {
  const stationen = STATIONEN.map(function (s) {
    const p = pruefeStation(fall, s);
    return Object.assign({ station: s, wahr: p.mangel, antwort: !!ant[s], zeilen: p.zeilen }, entscheidung(p.mangel, !!ant[s], zeiten[s]));
  });
  const wahrGesamt = stationen.some(function (x) { return x.wahr; });
  const endg = Object.assign({ wahr: wahrGesamt, antwort: !!ent }, entscheidung(wahrGesamt, !!ent, zeiten.ent));
  const alle = stationen.concat([endg]);
  return {
    stationen: stationen, ent: endg,
    summe: Math.max(0, alle.reduce(function (s, x) { return s + x.punkte; }, 0)),
    richtig: alle.filter(function (x) { return x.art === "richtig"; }).length
  };
}

/* ---- Fall-Pool (18 Fahrzeuge; 4 ohne Mangel). Jeder Fall ist einmalig. ----
   papiere: was der Fahrer reicht | ausr: was an Bord ist | licht: { ab, br, bl } je [links, rechts], true = funktioniert
   reifen: { profil (Zehntel mm, schlechtester Reifen), typ: "sommer" | "winter", wetter: "trocken" | "schnee" }
   hu: Monate bis zum Ablauf der Plakette (negativ = abgelaufen, null = keine Plakette); knapp vor/nach 0 (−1, −2) wird bewusst NICHT verwendet */
const LI = function (nicht) { const l = { ab: [true, true], br: [true, true], bl: [true, true] }; if (nicht) l[nicht[0]][nicht[1]] = false; return l; };
export const FAELLE = [
  { id: "ok-basis",      farbe: "#3b6fb6", form: "limo",  papiere: ["fs", "zb1"],               ausr: ["weste", "dreieck", "verband", "feuer"],        licht: LI(),            reifen: { profil: 38, typ: "sommer", wetter: "trocken" }, hu: 9 },
  { id: "ok-grenze",     farbe: "#b8442f", form: "klein", papiere: ["fs", "zb1", "vers"],       ausr: ["weste", "dreieck", "verband", "seil", "rad"],  licht: LI(),            reifen: { profil: 16, typ: "sommer", wetter: "trocken" }, hu: 0 },
  { id: "ok-winter",     farbe: "#6b7d8c", form: "kombi", papiere: ["fs", "zb1", "zb2"],        ausr: ["weste", "dreieck", "verband", "kabel"],        licht: LI(),            reifen: { profil: 45, typ: "winter", wetter: "trocken" }, hu: 20 },
  { id: "ok-schnee",     farbe: "#2f8f83", form: "limo",  papiere: ["fs", "zb1", "vers"],       ausr: ["weste", "dreieck", "verband", "kratzer"],      licht: LI(),            reifen: { profil: 52, typ: "winter", wetter: "schnee" },  hu: 3 },
  { id: "p-zb1",         farbe: "#c9a227", form: "klein", papiere: ["fs", "vers"],              ausr: ["weste", "dreieck", "verband", "feuer"],        licht: LI(),            reifen: { profil: 41, typ: "sommer", wetter: "trocken" }, hu: 14 },
  { id: "p-fs",          farbe: "#7a4e9c", form: "kombi", papiere: ["zb1", "zb2"],              ausr: ["weste", "dreieck", "verband", "rad"],          licht: LI(),            reifen: { profil: 30, typ: "sommer", wetter: "trocken" }, hu: 6 },
  { id: "a-weste",       farbe: "#3d8a4f", form: "limo",  papiere: ["fs", "zb1"],               ausr: ["dreieck", "verband", "kratzer"],               licht: LI(),            reifen: { profil: 35, typ: "sommer", wetter: "trocken" }, hu: 11 },
  { id: "a-dreieck",     farbe: "#d0772c", form: "klein", papiere: ["fs", "zb1"],               ausr: ["weste", "verband", "feuer", "rad"],            licht: LI(),            reifen: { profil: 28, typ: "sommer", wetter: "trocken" }, hu: 22 },
  { id: "a-verband",     farbe: "#8b8f96", form: "kombi", papiere: ["fs", "zb1", "vers"],       ausr: ["weste", "dreieck", "seil", "kabel"],           licht: LI(),            reifen: { profil: 44, typ: "sommer", wetter: "trocken" }, hu: 5 },
  { id: "l-brems",       farbe: "#a63a50", form: "limo",  papiere: ["fs", "zb1"],               ausr: ["weste", "dreieck", "verband"],                 licht: LI(["br", 1]),   reifen: { profil: 33, typ: "sommer", wetter: "trocken" }, hu: 8 },
  { id: "l-abblend",     farbe: "#2f5d8a", form: "kombi", papiere: ["fs", "zb1", "zb2"],        ausr: ["weste", "dreieck", "verband", "feuer"],        licht: LI(["ab", 0]),   reifen: { profil: 47, typ: "sommer", wetter: "trocken" }, hu: 16 },
  { id: "l-blinker",     farbe: "#5f6b3a", form: "klein", papiere: ["fs", "zb1"],               ausr: ["weste", "dreieck", "verband", "seil"],         licht: LI(["bl", 0]),   reifen: { profil: 29, typ: "sommer", wetter: "trocken" }, hu: 2 },
  { id: "r-profil",      farbe: "#4c4f58", form: "limo",  papiere: ["fs", "zb1", "vers"],       ausr: ["weste", "dreieck", "verband"],                 licht: LI(),            reifen: { profil: 11, typ: "sommer", wetter: "trocken" }, hu: 12 },
  { id: "r-hu-ab",       farbe: "#c05a7a", form: "klein", papiere: ["fs", "zb1"],               ausr: ["weste", "dreieck", "verband", "kabel", "kratzer"], licht: LI(),        reifen: { profil: 36, typ: "sommer", wetter: "trocken" }, hu: -8 },
  { id: "r-hu-fehlt",    farbe: "#2e7d9a", form: "kombi", papiere: ["fs", "zb1"],               ausr: ["weste", "dreieck", "verband", "feuer"],        licht: LI(),            reifen: { profil: 28, typ: "sommer", wetter: "trocken" }, hu: null },
  { id: "r-schnee-sommer", farbe: "#7d8e3c", form: "limo", papiere: ["fs", "zb1"],              ausr: ["weste", "dreieck", "verband", "kratzer"],      licht: LI(),            reifen: { profil: 40, typ: "sommer", wetter: "schnee" },  hu: 10 },
  { id: "m-fs-brems-hu", farbe: "#a0522d", form: "kombi", papiere: ["zb1", "vers"],             ausr: ["weste", "dreieck", "verband", "rad"],          licht: LI(["br", 0]),   reifen: { profil: 31, typ: "sommer", wetter: "trocken" }, hu: -14 },
  { id: "m-weste-profil", farbe: "#38588f", form: "klein", papiere: ["fs", "zb1", "zb2"],       ausr: ["dreieck", "verband", "seil"],                  licht: LI(),            reifen: { profil: 14, typ: "sommer", wetter: "trocken" }, hu: 7 }
];

function mische(a, rnd) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
/* 8 verschiedene Fahrzeuge: 2 oder 3 ohne Mangel, der Rest mit Mangel; jede der 4 Stationen kommt mindestens einmal mit Mangel dran. */
export function fahrzeugSatz(rnd) {
  const zufall = rnd || Math.random;
  const gut = FAELLE.filter(function (f) { return !fahrzeugMangel(f); }), schlecht = FAELLE.filter(fahrzeugMangel);
  for (let versuch = 0; versuch < 300; versuch++) {
    const nGut = zufall() < 0.5 ? 2 : 3;
    const satz = mische(gut, zufall).slice(0, nGut).concat(mische(schlecht, zufall).slice(0, ANZAHL_FAHRZEUGE - nGut));
    if (STATIONEN.every(function (s) { return satz.some(function (f) { return stationMangel(f, s); }); })) return mische(satz, zufall);
  }
  throw new Error("kein Fahrzeugsatz gefunden");
}

/* ===================== Bildschirm ===================== */
const SVG = function (vb, inhalt, extra) { return '<svg viewBox="' + vb + '" focusable="false" aria-hidden="true"' + (extra || "") + ">" + inhalt + "</svg>"; };

/* kleine Symbole der Stationen (24 x 24, currentColor) */
const STATION_ICON = {
  papiere: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  ausruestung: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M12 11v6M9 14h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  licht: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a6 6 0 0 1 6-6h1v12h-1a6 6 0 0 1-6-6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 8h5M15 12h5M15 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  reifen: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" stroke="currentColor" stroke-width="1.4"/></svg>'
};
const STATION_TEXT = { papiere: "koSPapiere", ausruestung: "koSAusr", licht: "koSLicht", reifen: "koSReifen" };

/* Bilder der Gegenstände (40 x 40, neutral, ohne echte Vorlagen oder Verkehrszeichen) */
const ITEM_BILD = {
  fs: SVG("0 0 40 40", '<rect x="3" y="9" width="34" height="22" rx="3" fill="#dfe8f0" stroke="#5b6b7a" stroke-width="1.6"/><circle cx="14" cy="18" r="4" fill="#8da2b5"/><path d="M8 27c0-4 3-6 6-6s6 2 6 6" fill="#8da2b5"/><path d="M24 15h9M24 20h9M24 25h6" stroke="#5b6b7a" stroke-width="1.6" stroke-linecap="round"/>'),
  zb1: SVG("0 0 40 40", '<rect x="6" y="4" width="28" height="32" rx="3" fill="#eef1e6" stroke="#6b7a5a" stroke-width="1.6"/><path d="M11 12h18M11 17h18M11 22h12" stroke="#6b7a5a" stroke-width="1.6" stroke-linecap="round"/><text x="20" y="33" text-anchor="middle" font-size="9" font-weight="700" font-family="sans-serif" fill="#43502f">I</text>'),
  zb2: SVG("0 0 40 40", '<rect x="6" y="4" width="28" height="32" rx="3" fill="#f1e9dc" stroke="#8a6d3b" stroke-width="1.6"/><path d="M11 12h18M11 17h18M11 22h12" stroke="#8a6d3b" stroke-width="1.6" stroke-linecap="round"/><text x="20" y="33" text-anchor="middle" font-size="9" font-weight="700" font-family="sans-serif" fill="#5d4620">II</text>'),
  vers: SVG("0 0 40 40", '<rect x="5" y="5" width="30" height="30" rx="3" fill="#e8eef0" stroke="#5a7580" stroke-width="1.6"/><path d="M20 10l8 3v7c0 5-4 8-8 10-4-2-8-5-8-10v-7z" fill="#bcd3dc" stroke="#5a7580" stroke-width="1.5"/><path d="M16 20l3 3 5-6" fill="none" stroke="#3f5963" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  weste: SVG("0 0 40 40", '<path d="M12 5l8 6 8-6 6 8-4 3v19H10V16l-4-3z" fill="#ffb300" stroke="#8a5d00" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 24h20M10 30h20" stroke="#f4f4f0" stroke-width="3"/><path d="M20 11v24" stroke="#8a5d00" stroke-width="1.2"/>'),
  dreieck: SVG("0 0 40 40", '<path d="M20 6L35 32H5z" fill="#fff" stroke="#d3382c" stroke-width="5" stroke-linejoin="round"/><path d="M12 36h16" stroke="#555" stroke-width="3" stroke-linecap="round"/>'),
  verband: SVG("0 0 40 40", '<rect x="4" y="9" width="32" height="24" rx="4" fill="#2f8f5a" stroke="#1d5f3b" stroke-width="1.6"/><path d="M15 9V6.5h10V9" fill="none" stroke="#1d5f3b" stroke-width="1.6"/><path d="M20 15v12M14 21h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'),
  feuer: SVG("0 0 40 40", '<rect x="12" y="12" width="16" height="25" rx="5" fill="#d3382c" stroke="#8a1f17" stroke-width="1.5"/><path d="M16 12V8h8v4M24 9h6l3 4" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="19" width="8" height="8" rx="1" fill="#f4f4f0"/>'),
  seil: SVG("0 0 40 40", '<path d="M6 28c4-12 8-12 12 0s8 12 12 0 4-8 5-14" fill="none" stroke="#c96f1a" stroke-width="4" stroke-linecap="round"/><path d="M6 28c4-12 8-12 12 0s8 12 12 0 4-8 5-14" fill="none" stroke="#f1c27d" stroke-width="1.4" stroke-dasharray="3 4" stroke-linecap="round"/>'),
  rad: SVG("0 0 40 40", '<circle cx="20" cy="20" r="15" fill="#2b2d33" stroke="#111" stroke-width="1.5"/><circle cx="20" cy="20" r="8" fill="#b9bec6" stroke="#6c727c" stroke-width="1.5"/><circle cx="20" cy="20" r="2.5" fill="#6c727c"/><path d="M20 12v-3M20 31v-3M12 20H9M31 20h-3" stroke="#6c727c" stroke-width="1.5"/>'),
  kabel: SVG("0 0 40 40", '<path d="M8 12c10 0 6 16 16 16" fill="none" stroke="#d3382c" stroke-width="3" stroke-linecap="round"/><path d="M8 20c8 0 4 12 12 12" fill="none" stroke="#2b2d33" stroke-width="3" stroke-linecap="round"/><path d="M5 9l7 2-2 5-7-2zM28 25l7 2-2 5-7-2z" fill="#d3382c"/><path d="M5 20l7 2-2 5-7-2z" fill="#2b2d33"/>'),
  kratzer: SVG("0 0 40 40", '<path d="M8 32l14-20 8 6-14 20z" fill="#4aa3d8" stroke="#235f87" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 12l6-8 8 6-6 8" fill="#9fd3f0" stroke="#235f87" stroke-width="1.6" stroke-linejoin="round"/>')
};
const ITEM_TEXT = { fs: "koIfs", zb1: "koIzb1", zb2: "koIzb2", vers: "koIvers", weste: "koIweste", dreieck: "koIdreieck", verband: "koIverband", feuer: "koIfeuer", seil: "koIseil", rad: "koIrad", kabel: "koIkabel", kratzer: "koIkratzer" };

/* Fahrzeug von hinten mit Fahrer (Strichfigur), daneben eine Strichfigur der Kontrolle. Kennzeichen: Fantasie-Muster. */
const KABINE = {
  limo:  { d: "M98 72 L108 42 Q110 38 116 38 L184 38 Q190 38 192 42 L202 72 Z", fenster: "M108 70 L115 45 L185 45 L192 70 Z", unten: 76 },
  klein: { d: "M100 72 L106 36 Q108 32 114 32 L186 32 Q192 32 194 36 L200 72 Z", fenster: "M108 70 L112 40 L188 40 L192 70 Z", unten: 76 },
  kombi: { d: "M96 72 L102 38 Q104 34 110 34 L190 34 Q196 34 198 38 L204 72 Z", fenster: "M105 70 L109 42 L191 42 L195 70 Z", unten: 76 }
};
export function szeneSvg(fall) {
  const farbe = fall ? fall.farbe : "#8b8f96", kab = KABINE[fall ? fall.form : "limo"];
  return '<svg class="sp-k-svg" viewBox="0 0 300 150" focusable="false" aria-hidden="true">' +
    '<rect width="300" height="150" fill="#cfe0ec"/><rect y="104" width="300" height="46" fill="#5a5d64"/><path d="M0 128h300" stroke="#e9e9e9" stroke-width="2" stroke-dasharray="14 12"/>' +
    '<ellipse cx="150" cy="130" rx="86" ry="6" fill="rgba(0,0,0,.28)"/>' +
    '<rect x="88" y="108" width="20" height="22" rx="4" fill="#1d1e22"/><rect x="192" y="108" width="20" height="22" rx="4" fill="#1d1e22"/>' +
    '<path d="' + kab.d + '" fill="' + farbe + '" stroke="rgba(0,0,0,.45)" stroke-width="1.4"/>' +
    '<path d="' + kab.fenster + '" fill="#a9c6dc"/>' +
    '<circle cx="124" cy="55" r="7" fill="#4b5560"/><path d="M110 70c0-9 6-11 14-11s14 2 14 11z" fill="#4b5560"/>' +
    '<rect x="74" y="72" width="152" height="42" rx="12" fill="' + farbe + '" stroke="rgba(0,0,0,.45)" stroke-width="1.4"/>' +
    '<rect x="78" y="78" width="20" height="14" rx="3" fill="#d6372c"/><rect x="202" y="78" width="20" height="14" rx="3" fill="#d6372c"/>' +
    '<rect x="78" y="93" width="20" height="7" rx="2" fill="#f0a21b"/><rect x="202" y="93" width="20" height="7" rx="2" fill="#f0a21b"/>' +
    '<rect x="123" y="90" width="54" height="17" rx="2" fill="#f6f6f1" stroke="#33353b" stroke-width="1.2"/><rect x="123" y="90" width="7" height="17" rx="2" fill="#2a56b0"/>' +
    '<text x="153" y="102.5" text-anchor="middle" font-size="9" font-weight="700" font-family="sans-serif" fill="#222">XX AB 123</text>' +
    '<rect x="70" y="112" width="160" height="7" rx="3.5" fill="#2b2d33"/>' +
    // Strichfigur der Kontrolle (neutral): Kappe, Kopf, Körper, ein Arm hebt die Hand
    '<g stroke="#26334a" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="262" cy="64" r="7" fill="#f2d3b3" stroke-width="2"/><path d="M262 71v26M262 78l-12 10M262 78l14-14M262 97l-8 28M262 97l8 28"/></g>' +
    '<path d="M254 60a8 8 0 0 1 16 0z" fill="#26334a"/><rect x="252" y="59" width="20" height="3" rx="1.5" fill="#26334a"/>' +
    // Markierungen der vier Stationen (Zustand kommt per Klasse)
    '<g class="sp-k-pin" data-st="papiere" transform="translate(122 28)"><circle r="9"/><text></text></g>' +
    '<g class="sp-k-pin" data-st="ausruestung" transform="translate(150 66)"><circle r="9"/><text></text></g>' +
    '<g class="sp-k-pin" data-st="licht" transform="translate(236 92)"><circle r="9"/><text></text></g>' +
    '<g class="sp-k-pin" data-st="reifen" transform="translate(200 128)"><circle r="9"/><text></text></g>' +
    "</svg>";
}

/* Beleuchtung: Vorderansicht (Abblendlicht) und Rückansicht (Bremslicht + Blinker). an = true: Lampe leuchtet. */
function lampe(cx, cy, rx, ry, an, hell, dunkel, glut, id) {
  return '<g data-lampe="' + id + '" data-an="' + (an ? 1 : 0) + '">' +
    (an ? '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx + 5) + '" ry="' + (ry + 5) + '" fill="' + glut + '" opacity=".45"/>' : "") +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (an ? hell : dunkel) + '" stroke="#1b1c20" stroke-width="1.4"/></g>';
}
export function lichtVorneSvg(fall) {
  const L = fall.licht;
  return SVG("0 0 120 80", '<rect width="120" height="80" fill="#2c2f38" rx="6"/>' +
    '<path d="M24 56 L30 30 Q32 24 40 24 L80 24 Q88 24 90 30 L96 56 Z" fill="#6d7886"/><rect x="14" y="52" width="92" height="22" rx="8" fill="' + fall.farbe + '" stroke="rgba(0,0,0,.5)" stroke-width="1.4"/>' +
    '<rect x="46" y="62" width="28" height="9" rx="2" fill="#1f2025"/>' +
    lampe(28, 60, 9, 6, L.ab[0], "#fffbd0", "#3c3f46", "#ffe98a", "ab-0") + lampe(92, 60, 9, 6, L.ab[1], "#fffbd0", "#3c3f46", "#ffe98a", "ab-1"), ' class="sp-k-lichtbild" role="img"');
}
export function lichtHintenSvg(fall) {
  const L = fall.licht;
  return SVG("0 0 120 80", '<rect width="120" height="80" fill="#2c2f38" rx="6"/>' +
    '<path d="M24 52 L30 28 Q32 22 40 22 L80 22 Q88 22 90 28 L96 52 Z" fill="#6d7886"/><rect x="12" y="48" width="96" height="26" rx="8" fill="' + fall.farbe + '" stroke="rgba(0,0,0,.5)" stroke-width="1.4"/>' +
    '<rect x="42" y="60" width="36" height="11" rx="2" fill="#f6f6f1"/>' +
    lampe(22, 56, 8, 5, L.br[0], "#ff4b3e", "#3d2a2c", "#ff8a80", "br-0") + lampe(98, 56, 8, 5, L.br[1], "#ff4b3e", "#3d2a2c", "#ff8a80", "br-1") +
    lampe(22, 67, 8, 3.6, L.bl[0], "#ffb21a", "#3a3427", "#ffd36b", "bl-0") + lampe(98, 67, 8, 3.6, L.bl[1], "#ffb21a", "#3a3427", "#ffd36b", "bl-1"), ' class="sp-k-lichtbild" role="img"');
}

/* Farbe der HU-Plakette nach Ablaufjahr: Zyklus von 6 Jahren (Referenz 2026 = blau). 2025 orange, 2026 blau, 2027 gelb, 2028 braun,
   2029 rosa, 2030 grün, 2031 wieder orange. fill = Plakettenfarbe, dunkel = Rand/Kreis/Jahreszahl, ring = Monatszahlen auf der Plakette. */
export const PLAKETTEN_FOLGE = ["blau", "gelb", "braun", "rosa", "gruen", "orange"];       // ab 2026, danach wieder von vorn
export const PLAKETTEN_FARBEN = {
  blau:   { fill: "#2e6bb5", dunkel: "#173a66", ring: "#dce6f2" },
  gelb:   { fill: "#f2c500", dunkel: "#5c4a00", ring: "#3d3100" },
  braun:  { fill: "#8a5a2b", dunkel: "#4a2e12", ring: "#f1e1cf" },
  rosa:   { fill: "#f08fb4", dunkel: "#8a2b55", ring: "#5a1a37" },
  gruen:  { fill: "#3a9a4a", dunkel: "#1d5a28", ring: "#e3f5e6" },
  orange: { fill: "#f28c1e", dunkel: "#7a3f00", ring: "#4a2600" }
};
export function plakettenFarbe(jahr) {
  const name = PLAKETTEN_FOLGE[(((jahr - 2026) % 6) + 6) % 6];
  return Object.assign({ name: name }, PLAKETTEN_FARBEN[name]);
}

/* HU-Plakette (vergrößert) neben einem Kennzeichen-Ausschnitt (Fantasie-Muster). m = { jahr, monat } oder null.
   Farbe richtet sich nach dem Ablaufjahr (data-farbe am <svg>). */
export function plaketteSvg(m) {
  let ring = "", extra = ' class="sp-k-plakette" role="img"';
  if (m) {
    const c = plakettenFarbe(m.jahr);
    extra += ' data-farbe="' + c.name + '"';
    for (let i = 1; i <= 12; i++) {
      const w = (i - m.monat) * Math.PI / 6, x = 55 + 37 * Math.sin(w), y = 55 - 37 * Math.cos(w), top = i === m.monat;
      ring += '<text x="' + x.toFixed(1) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="middle" font-size="' + (top ? 12 : 9) + '" font-weight="' + (top ? 800 : 600) + '" font-family="sans-serif" fill="' + (top ? "#fff" : c.ring) + '">' + i + "</text>";
    }
    ring = '<circle cx="55" cy="55" r="50" fill="' + c.fill + '" stroke="' + c.dunkel + '" stroke-width="2"/><circle cx="55" cy="55" r="26" fill="#f3f6fa"/><circle cx="55" cy="18" r="9.5" fill="' + c.dunkel + '"/>' + ring +
      '<text x="55" y="61" text-anchor="middle" font-size="19" font-weight="800" font-family="sans-serif" fill="' + c.dunkel + '">' + String(m.jahr).slice(-2) + "</text>";
  } else ring = '<circle cx="55" cy="55" r="50" fill="none" stroke="#8a8f98" stroke-width="3" stroke-dasharray="6 6"/>';
  return SVG("0 0 240 110", ring +
    '<rect x="118" y="32" width="120" height="46" rx="6" fill="#f6f6f1" stroke="#33353b" stroke-width="2"/><rect x="118" y="32" width="14" height="46" rx="6" fill="#2a56b0"/>' +
    '<text x="182" y="62" text-anchor="middle" font-size="16" font-weight="800" font-family="sans-serif" fill="#222">XX AB 123</text>' +
    '<path d="M105 55H118" stroke="#8a8f98" stroke-width="2" stroke-dasharray="3 3"/>', extra);
}

function zeitText(jahr, monat) { return (monat < 10 ? "0" : "") + monat + "/" + jahr; }

export function starte(platz, k) {
  let zustand = "bereit";            // bereit | start | spiel | fertig
  let ansicht = "uebersicht";        // uebersicht | station | antwort
  let fahrzeuge = [], idx = 0, punkte = 0, richtig = 0, runde = null, ergId = 0, rundenNr = 0;
  let fz = null, jetzt = null, timer = [];
  let ergebnisDaten = null, speicherInfo = "";

  platz.innerHTML =
    '<div class="sp-kontrolle">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("koName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-k-buehne aus">' +
        '<div class="sp-k-hud" dir="auto"><span class="sp-k-fz" role="status" aria-live="polite"></span>' +
          '<span class="sp-k-punkte"><span class="sp-label">' + k.esc(k.tx("koPunkte")) + '</span> <b dir="ltr">0</b></span></div>' +
        '<div class="sp-k-szene"></div>' +
        '<div class="sp-k-haupt"></div>' +
        '<button type="button" class="sp-k-knopf start"></button>' +
      "</div>" +
      '<p class="admin-sub sp-k-anleitung">' + k.esc(k.tx("koBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const wurzel = platz.querySelector(".sp-kontrolle");
  const buehne = platz.querySelector(".sp-k-buehne"), fzEl = platz.querySelector(".sp-k-fz"), punkteEl = platz.querySelector(".sp-k-punkte b");
  const szene = platz.querySelector(".sp-k-szene"), haupt = platz.querySelector(".sp-k-haupt");
  const knopf = platz.querySelector(".sp-k-knopf"), anleitung = platz.querySelector(".sp-k-anleitung"), ergebnis = platz.querySelector(".sp-ergebnis");
  const format = function (w) { return w + " " + k.tx("koPunkte"); };
  const rank = rankingKarte(k, "kontrolle", "", platz.querySelector(".sp-rank-platz"), format);
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  /* eigener Stil in spiele/kontrolle.css (wie cssLaden in rahmen.js); bis er da ist, bleibt das Spiel unsichtbar statt ungestaltet */
  (function cssLaden() {
    try {
      let l = document.querySelector("link[data-kontrolle-css]");
      if (l && l.sheet) return;
      wurzel.style.visibility = "hidden";
      const frei = function () { wurzel.style.visibility = ""; };
      if (!l) {
        l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = new URL("./kontrolle.css", import.meta.url).href;
        l.setAttribute("data-kontrolle-css", "");
        document.head.appendChild(l);
      }
      l.addEventListener("load", frei); l.addEventListener("error", frei);
      setTimeout(frei, 2500);            // Sicherheitsnetz: bewusst NICHT in `timer` (bereitMachen/stopTimer würde es sofort löschen)
    } catch (e) { wurzel.style.visibility = ""; }
  })();

  function stopTimer() { timer.forEach(clearTimeout); timer = []; }
  function imSpiel() { return zustand === "start" || zustand === "spiel"; }
  function anleitungZeigen() { anleitung.hidden = imSpiel(); }
  function buehneInsBild() { try { buehne.scrollIntoView({ block: "start" }); } catch (e) {} }
  function setPunkte(p) { punkteEl.textContent = String(p); }
  function setAnsicht(a) { ansicht = a; buehne.setAttribute("data-ansicht", a); }
  function heute() { const d = new Date(); return { jahr: d.getFullYear(), monat: d.getMonth() + 1 }; }

  function bereitMachen() {
    stopTimer(); rundenNr++;
    zustand = "bereit"; anleitungZeigen(); setAnsicht("uebersicht");
    idx = 0; punkte = 0; richtig = 0; fz = null;
    buehne.classList.add("aus"); buehne.removeAttribute("data-fall");
    szene.innerHTML = szeneSvg(null);
    haupt.innerHTML = stationenHtml(null);
    fzEl.textContent = ""; setPunkte(0);
    knopf.hidden = false; knopf.className = "sp-k-knopf start"; knopf.textContent = k.tx("start");
  }

  /* ---- Ansichten ---- */
  function stationenHtml(f) {
    const alle = f && STATIONEN.every(function (s) { return f.ant[s] !== undefined; });
    return '<div class="sp-k-uebersicht">' +
      '<p class="sp-k-sage" dir="auto">' + k.esc(k.tx(alle ? "koSchluss" : "koWaehle")) + "</p>" +
      '<div class="sp-k-stationen">' + STATIONEN.map(function (s) {
        const a = f ? f.ant[s] : undefined;
        return '<button type="button" class="sp-k-station' + (a === undefined ? "" : a ? " mangel fest" : " ok fest") + '" data-station="' + s + '"' + (a === undefined && f ? "" : " disabled") + ">" +
          '<span class="sp-k-sicon">' + STATION_ICON[s] + "</span>" +
          '<span class="sp-k-stext" dir="auto">' + k.esc(k.tx(STATION_TEXT[s])) + "</span>" +
          '<span class="sp-k-chip' + (a === undefined ? " leer" : a ? " mangel" : " ok") + '" dir="auto">' + (a === undefined ? "" : k.esc(k.tx(a ? "koMangel" : "koOk"))) + "</span></button>";
      }).join("") + "</div>" +
      (alle ? '<div class="sp-k-wahl">' +
        '<button type="button" class="sp-k-ent weiter" data-ent="0">' + k.esc(k.tx("koWeiterfahren")) + "</button>" +
        '<button type="button" class="sp-k-ent halten" data-ent="1">' + k.esc(k.tx("koFesthalten")) + "</button></div>" : "") +
      "</div>";
  }
  function pinsSetzen() {
    szene.querySelectorAll(".sp-k-pin").forEach(function (p) {
      const a = fz ? fz.ant[p.getAttribute("data-st")] : undefined;
      p.setAttribute("class", "sp-k-pin" + (a === undefined ? "" : a ? " mangel" : " ok"));
      p.querySelector("text").textContent = a === undefined ? "" : a ? "!" : "✓";
    });
  }
  function uebersicht(fokus) {
    setAnsicht("uebersicht");
    haupt.innerHTML = stationenHtml(fz);
    pinsSetzen();
    if (fokus) {
      const b = haupt.querySelector(".sp-k-station:not([disabled])") || haupt.querySelector(".sp-k-ent");
      try { if (b) b.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function kartenHtml(ids, liste) {
    return '<div class="sp-k-karten">' + ids.map(function (id) {
      return '<div class="sp-k-karte" data-item="' + id + '">' + ITEM_BILD[id] + '<span dir="auto">' + k.esc(k.tx(ITEM_TEXT[id])) + "</span></div>";
    }).join("") + "</div>";
  }
  function lampenBeschriftung(fall) {
    const t = [];
    [["ab", "koLAbblend"], ["br", "koLBrems"], ["bl", "koLBlink"]].forEach(function (g) {
      [0, 1].forEach(function (i) { t.push(k.tx(g[1]) + " " + k.tx(i ? "koRechts" : "koLinks") + ": " + k.tx(fall.licht[g[0]][i] ? "koAn" : "koAus")); });
    });
    return t.join(", ");
  }
  function stationHtml(st) {
    const f = fz.fall;
    let inhalt = "", hinweis = "";
    if (st === "papiere") {
      hinweis = k.tx("koPapHinweis");
      inhalt = kartenHtml(f.papiere);
    } else if (st === "ausruestung") {
      hinweis = k.tx("koAusHinweis");
      inhalt = kartenHtml(f.ausr);
    } else if (st === "licht") {
      hinweis = k.tx("koLichtHinweis");
      inhalt = '<div class="sp-k-lichter" role="group" aria-label="' + k.esc(lampenBeschriftung(f)) + '">' +
        '<figure>' + lichtVorneSvg(f) + '<figcaption dir="auto">' + k.esc(k.tx("koLichtVorn")) + "</figcaption></figure>" +
        '<figure>' + lichtHintenSvg(f) + '<figcaption dir="auto">' + k.esc(k.tx("koLichtHinten")) + "</figcaption></figure></div>";
    } else {
      hinweis = k.tx("koReifHinweis");
      const m = f.hu == null ? null : plakettenMonat(f.hu, jetzt), r = f.reifen;
      inhalt = '<div class="sp-k-reifen">' +
        '<div class="sp-k-messung" data-profil="' + r.profil + '"><span class="sp-label" dir="auto">' + k.esc(k.tx("koProfil")) + '</span><b dir="ltr">' + k.esc(k.zahl(r.profil / 10, 1)) + " mm</b></div>" +
        '<div class="sp-k-chips" dir="auto"><span class="sp-k-etikett" data-typ="' + r.typ + '">' + k.esc(k.tx(r.typ === "winter" ? "koWinter" : "koSommer")) + "</span>" +
          '<span class="sp-k-etikett" data-wetter="' + r.wetter + '">' + k.esc(k.tx(r.wetter === "schnee" ? "koWetterSchnee" : "koWetterTrocken")) + "</span></div>" +
        '<div class="sp-k-plbild" data-hu="' + (m ? zeitText(m.jahr, m.monat) : "fehlt") + '">' + plaketteSvg(m) + "</div>" +
        '<p class="sp-k-plzeile" dir="auto">' + k.esc(m ? k.tx("koPlakette", { v: zeitText(m.jahr, m.monat) }) : k.tx("koPlaketteFehlt")) + " · " + k.esc(k.tx("koHeute", { v: zeitText(jetzt.jahr, jetzt.monat) })) + "</p></div>";
    }
    return '<div class="sp-k-panel" data-station="' + st + '">' +
      '<div class="sp-k-ptitel"><span class="sp-k-sicon">' + STATION_ICON[st] + '</span><span dir="auto">' + k.esc(k.tx(STATION_TEXT[st])) + "</span></div>" +
      '<p class="sp-k-sage" dir="auto">' + k.esc(hinweis) + "</p>" + inhalt +
      '<p class="sp-k-frage" dir="auto">' + k.esc(k.tx("koFrage")) + "</p>" +
      '<div class="sp-k-entscheid">' +
        '<button type="button" class="sp-k-ent weiter" data-mangel="0">' + k.esc(k.tx("koOk")) + "</button>" +
        '<button type="button" class="sp-k-ent halten" data-mangel="1">' + k.esc(k.tx("koMangel")) + "</button></div></div>";
  }

  function oeffneStation(st) {
    if (zustand !== "spiel" || ansicht !== "uebersicht" || !fz || fz.ant[st] !== undefined) return;
    fz.offen = st;
    setAnsicht("station");
    haupt.innerHTML = stationHtml(st);
    try { const b = haupt.querySelector(".sp-k-ent"); if (b) b.focus({ preventScroll: true }); } catch (e) {}
    fz.t = performance.now();         // die Uhr läuft nur, solange die Station offen ist
    buehneInsBild();
  }
  function entscheide(mangel) {
    if (zustand !== "spiel" || ansicht !== "station" || !fz || !fz.offen) return;
    const st = fz.offen, ms = performance.now() - fz.t;
    fz.ant[st] = mangel; fz.zeit[st] = ms; fz.offen = null;
    uebersicht(true);
    fz.t = performance.now();         // ab jetzt zählt (falls alle vier fertig sind) die Zeit der Gesamtentscheidung
    buehneInsBild();
  }
  function gesamtEntscheidung(halten) {
    if (zustand !== "spiel" || ansicht !== "uebersicht" || !fz || fz.ent !== undefined || !STATIONEN.every(function (s) { return fz.ant[s] !== undefined; })) return;
    fz.zeit.ent = performance.now() - fz.t; fz.ent = halten;
    const erg = bewerteFahrzeug(fz.fall, fz.ant, fz.ent, fz.zeit);
    punkte += erg.summe; richtig += erg.richtig; setPunkte(punkte);
    erklaerung(erg);
  }

  function artText(art) { return k.tx(art === "richtig" ? "koArtRichtig" : art === "alarm" ? "koArtAlarm" : "koArtUebersehen"); }
  function erklaerung(erg) {
    setAnsicht("antwort");
    const letzte = idx >= ANZAHL_FAHRZEUGE - 1;
    const e = erg.ent, endKey = e.wahr ? (e.antwort ? "koEndRichtigM" : "koEndFalschW") : (e.antwort ? "koEndFalschM" : "koEndRichtigW");
    haupt.innerHTML =
      '<div class="sp-k-antwort" role="status">' +
        '<div class="sp-k-urteil ' + (erg.richtig >= 4 ? "ja" : "nein") + '" dir="auto"><span dir="ltr">+' + erg.summe + "</span> " + k.esc(k.tx("koPunkte")) + "</div>" +
        '<p class="sp-k-richtigzahl" dir="auto">' + k.esc(k.tx("koRichtigVon", { n: erg.richtig, m: ENTSCHEIDUNGEN_JE_FAHRZEUG })) + "</p>" +
        '<button type="button" class="sp-k-weiter">' + k.esc(k.tx(letzte ? "koErgebnisZeigen" : "koWeiter")) + "</button>" +
        erg.stationen.map(function (s) {
          return '<div class="sp-k-zeile" data-station="' + s.station + '" data-art="' + s.art + '">' +
            '<div class="sp-k-zkopf" dir="auto"><span class="sp-k-zname">' + k.esc(k.tx(STATION_TEXT[s.station])) + "</span>" +
              '<span class="sp-k-chip ' + (s.wahr ? "mangel" : "ok") + '">' + k.esc(k.tx(s.wahr ? "koMangel" : "koOk")) + "</span>" +
              '<span class="sp-k-art ' + s.art + '">' + k.esc(artText(s.art)) + "</span></div>" +
            s.zeilen.map(function (z) { return '<p class="sp-k-satz ' + z.art + '" dir="auto">' + k.esc(k.tx(z.k)) + "</p>"; }).join("") + "</div>";
        }).join("") +
        '<div class="sp-k-zeile" data-station="ent" data-art="' + e.art + '">' +
          '<div class="sp-k-zkopf" dir="auto"><span class="sp-k-zname">' + k.esc(k.tx("koEntTitel")) + "</span>" +
            '<span class="sp-k-chip ' + (e.antwort ? "mangel" : "ok") + '">' + k.esc(k.tx(e.antwort ? "koFesthalten" : "koWeiterfahren")) + "</span>" +
            '<span class="sp-k-art ' + e.art + '">' + k.esc(artText(e.art)) + "</span></div>" +
          '<p class="sp-k-satz ' + (e.art === "richtig" ? "ok" : "mangel") + '" dir="auto">' + k.esc(k.tx(endKey)) + "</p></div>" +
      "</div>";
    pinsSetzen();
    const w = haupt.querySelector(".sp-k-weiter");
    w.addEventListener("click", function () { weiter(letzte); });
    try { w.focus({ preventScroll: true }); } catch (x) {}
    buehneInsBild();
  }
  function weiter(letzte) {
    if (zustand !== "spiel" || ansicht !== "antwort") return;
    if (letzte) { beenden(); return; }
    idx++; zeigeFahrzeug();
  }

  /* ---- Ablauf ---- */
  function starteRunde() {
    bereitMachen();
    const meine = rundenNr;
    zustand = "start"; anleitungZeigen(); ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "sp-k-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "kontrolle" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== rundenNr || zustand !== "start") return;
      runde = r; fahrzeuge = fahrzeugSatz(); idx = 0; jetzt = heute();
      zustand = "spiel"; knopf.hidden = true; buehne.classList.remove("aus");
      zeigeFahrzeug();
    });
  }
  function zeigeFahrzeug() {
    const fall = fahrzeuge[idx];
    fz = { fall: fall, ant: {}, zeit: {}, ent: undefined, offen: null, t: 0 };
    buehne.setAttribute("data-fall", fall.id);
    fzEl.textContent = k.tx("koFahrzeug", { n: idx + 1, m: ANZAHL_FAHRZEUGE });
    szene.innerHTML = szeneSvg(fall);
    uebersicht(false);
    buehneInsBild();
  }

  function beenden() {
    stopTimer(); rundenNr++;
    zustand = "fertig"; anleitungZeigen(); setAnsicht("uebersicht");
    fz = null; buehne.classList.add("aus"); buehne.removeAttribute("data-fall");
    szene.innerHTML = szeneSvg(null); haupt.innerHTML = stationenHtml(null);
    fzEl.textContent = "";
    knopf.hidden = false; knopf.className = "sp-k-knopf start"; knopf.textContent = k.tx("nochmal");
    ergebnisDaten = { wert: punkte, richtig: richtig };
    ergId++;
    zeichneErgebnis();
    speichern(punkte, richtig);
    try { knopf.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---- Ergebnis ---- */
  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    ergebnis.hidden = false;
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("koPunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="sp-k-richtigzahl" dir="auto">' + k.esc(k.tx("koRichtigVon", { n: e.richtig, m: ENTSCHEIDUNGEN })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse" dir="auto">' + k.esc(k.tx("koHinweis")) + "</p>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
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
      if (k.profil && d && d.bestwert != null) k.profil.bestwerte.kontrolle = d.bestwert;     // auch nach „Nochmal“ merken (nur die alte Ergebnisseite entfällt)
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("koNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("koBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  /* ---- Eingaben ---- */
  haupt.addEventListener("click", function (e) {
    const t = e.target.closest ? e.target.closest("button") : null;
    if (!t || !haupt.contains(t) || t.disabled) return;
    if (t.hasAttribute("data-station") && t.classList.contains("sp-k-station")) oeffneStation(t.getAttribute("data-station"));
    else if (t.hasAttribute("data-mangel")) entscheide(t.getAttribute("data-mangel") === "1");
    else if (t.hasAttribute("data-ent")) gesamtEntscheidung(t.getAttribute("data-ent") === "1");
  });
  knopf.addEventListener("click", function () { if (zustand === "bereit" || zustand === "fertig") starteRunde(); });
  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und von vorn
  function sichtbarkeit() { if (document.hidden && imSpiel()) bereitMachen(); }
  document.addEventListener("visibilitychange", sichtbarkeit);

  bereitMachen();
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      stopTimer(); rundenNr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
