/* Spiel 9: Schilder-Wisch (Familie D: einzeln, wischen), Id „ninja“, 08.10.2026.
   Verkehrsschilder gleiten über das Spielfeld. In jeder der 3 Runden gilt eine Regel („Wische alle Verbotsschilder“, …).
   Passende Schilder werden mit dem Finger (oder der Maus) durchwischt oder angetippt; ein falsches Schild kostet Punkte.
   Pro Runde höchstens 25 Sekunden; die Schilder werden von Runde zu Runde schneller. Nach jeder Runde steht jedes vorgekommene
   Schild mit Nummer, Name und Kategorie nach StVO da (Lerneffekt), die falsch gewischten und verpassten zuerst.

   Nur die amtlichen Bilder aus verkehr/vorfahrt-zeichen/ (siehe QUELLEN.md dort), nichts nachgezeichnet.
   Das Spielprinzip „durchwischen, Falsches meiden“ ist allgemein; Name, Figuren und Bilder sind eigen.

   Punkte (reine Rechnung, siehe punkteRunde):
     je richtig gewischtem Schild +10, je falsch gewischtem Schild −15 (eine Runde nie unter 0),
     alle 9 richtigen Schilder gewischt UND kein falsches: +20 Bonus. Höchstwert 3 x 110 = 330.
   Ranking: Punkte (größer ist besser). Der Server prüft richtig / falsch / voll gegen den Wert;
   siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „ninja“. Die Zahlen unten (N_RICHTIG, N_FALSCH, PKT_RICHTIG,
   ABZUG_FALSCH, BONUS_VOLL, RUNDEN, MIN_RUNDE_MS) stehen dort noch einmal; werkzeuge/pruefe-ninja.mjs vergleicht beides.

   Fachliche Einordnung (Quelle: StVO Anlage 1 „Gefahrzeichen“, Anlage 2 „Vorschriftzeichen“, Anlage 3 „Richtzeichen“,
   gesetze-im-internet.de/stvo_2013): jedes Schild hat GENAU eine Gruppe (SCHILDER). Was die StVO selbst nicht eindeutig
   einer Regel zuordnet oder was in der Fahrschule unterschiedlich gelehrt wird, kommt in dieser Regel NICHT als falsches
   Schild vor (Feld `nicht`, siehe REGELN). Zufall: Math.random, im Test ersetzbar (jede Funktion nimmt `rnd`). */
import { rankingKarte, profilKarte } from "./rahmen.js";
import { schildBild, zeichen274, schilderVorladen } from "./schilder.js";

/* ===================== Regeln (reine Rechnung) ===================== */
export const RUNDEN = 3;
export const ZEIT_MS = 25000;                  // höchstens so lange dauert eine Runde
export const MIN_RUNDE_MS = 12000;             // kürzeste mögliche Runde (letztes Schild erscheint frühestens dann); der Server rechnet damit
export const N_RICHTIG = 9, N_FALSCH = 8;      // Schilder je Runde
export const PKT_RICHTIG = 10, ABZUG_FALSCH = 15, BONUS_VOLL = 20;
export const DAUER_MS = [6500, 5200, 4200];    // so lange braucht ein Schild über das Feld, je Runde (steigende Geschwindigkeit)
export const LANGSAM = 1.5;                    // prefers-reduced-motion: Schilder gleiten 1,5-mal so langsam
export const BAHNEN = 5;                       // Spuren, in denen die Schilder gleiten
export const MIN_SCHILD_PX = 44, MAX_SCHILD_PX = 64;
export const TREFFER_RAND_PX = 4;              // Wischfläche: halbe Schildbreite + 4 px
export const BAHN_ABSTAND = 0.25;              // zwei Schilder in einer Bahn erscheinen mindestens 0,25 Überquerungszeiten auseinander
export const MAX_RICHTIG = RUNDEN * N_RICHTIG;                              // 27
export const MAX_FALSCH = RUNDEN * N_FALSCH;                                // 24
export const MAX_PUNKTE = MAX_RICHTIG * PKT_RICHTIG + RUNDEN * BONUS_VOLL;  // 330

/* Punkte einer Runde. richtig/falsch = gewischte Schilder dieser Runde. Bonus nur bei allen richtigen und keinem falschen. Nie unter 0. */
export function punkteRunde(richtig, falsch) {
  const voll = richtig >= N_RICHTIG && falsch === 0;
  return Math.max(0, richtig * PKT_RICHTIG - falsch * ABZUG_FALSCH + (voll ? BONUS_VOLL : 0));
}
export const istVoll = (richtig, falsch) => richtig >= N_RICHTIG && falsch === 0;

/* ===================== Die Schilder ===================== */
/* id      = Bildname in schilder.js (Zeichen 274: id z274-<Zahl>, Bild über zeichen274)
   erkl    = Eintrag in der Erklärliste (alle Tempo-Zahlen sind ein Eintrag „274“)
   nr      = amtliche Nummer
   name    = Textschlüssel des Namens (z…l aus texte.js, sonst niZ… aus texte-ninja.js)
   kat     = Textschlüssel der Kategorie
   gruppe  = GENAU eine: gefahr | vorfahrt | gebot | verbot | tempo | halt | richt
   nicht   = Regeln, in denen das Schild NICHT als falsches Schild auftaucht (fachlich nicht eindeutig) */
const S = (id, nr, name, kat, gruppe, nicht, extra) => Object.assign({ id: id, erkl: id, nr: nr, name: name, kat: kat, gruppe: gruppe, nicht: nicht || [] }, extra || {});
export const SCHILDER = [
  // Gefahrzeichen (Anlage 1)
  S("z101", "101", "z101l", "niKgefahr", "gefahr"), S("z103", "103", "niZ103", "niKgefahr", "gefahr"), S("z112", "112", "niZ112", "niKgefahr", "gefahr"),
  S("z114", "114", "niZ114", "niKgefahr", "gefahr"), S("z133", "133", "niZ133", "niKgefahr", "gefahr"), S("z136", "136", "niZ136", "niKgefahr", "gefahr"),
  S("z142", "142", "niZ142", "niKgefahr", "gefahr"),
  // Vorfahrt regeln: 205/206 (Anlage 2, Warte- und Haltgebote), 301/306 (Anlage 3, Vorrangzeichen). Sie sind amtlich „Ge- oder Verbot“,
  // deshalb nie falsches Schild bei Geboten, Verboten und Haltverboten (306 enthält selbst ein Parkverbot außerorts).
  S("z205", "205", "z205l", "niK205", "vorfahrt", ["gebot", "verbot", "halt"]), S("z206", "206", "z206l", "niK206", "vorfahrt", ["gebot", "verbot", "halt"]),
  S("z301", "301", "niZ301", "niKvorrang", "vorfahrt", ["gebot", "verbot", "halt"]), S("z306", "306", "z306l", "niKvorrang", "vorfahrt", ["gebot", "verbot", "halt"]),
  // Gebotszeichen (Anlage 2). 215/237/239 enthalten neben dem Gebot auch Verbote für anderen Verkehr: nie falsches Schild bei den Verboten.
  S("z209", "209", "niZ209", "niKgebot", "gebot"), S("z222", "222", "niZ222", "niKgebot", "gebot"),
  S("z215", "215", "z215l", "niKgebot", "gebot", ["verbot", "vorfahrt", "halt"]), S("z237", "237", "z237l", "niKgebot", "gebot", ["verbot"]),
  S("z239", "239", "niZ239", "niKgebot", "gebot", ["verbot"]),
  // Verbotszeichen (Anlage 2)
  S("z250", "250", "z250l", "niKverbot", "verbot", ["halt"]), S("z267", "267", "z267l", "niKverbot", "verbot", ["halt"]), S("z276", "276", "niZ276", "niKueberhol", "verbot"),
  // Geschwindigkeitsbeschränkungen (Anlage 2, Abschnitt 7)
  S("z274-50", "274", "z274l", "niKtempo", "tempo", [], { erkl: "z274", zahl: 50 }), S("z274-60", "274", "z274l", "niKtempo", "tempo", [], { erkl: "z274", zahl: 60 }),
  S("z274-80", "274", "z274l", "niKtempo", "tempo", [], { erkl: "z274", zahl: 80 }), S("z274-100", "274", "z274l", "niKtempo", "tempo", [], { erkl: "z274", zahl: 100 }),
  S("z274-120", "274", "z274l", "niKtempo", "tempo", [], { erkl: "z274", zahl: 120 }), S("z2741", "274.1", "z2741l", "niKtempo", "tempo"),
  // Halt- und Parkverbote (Anlage 2, Abschnitt 8)
  S("z283", "283", "z283l", "niKhalt", "halt"), S("z286", "286", "z286l", "niKhalt", "halt"), S("z2901", "290.1", "niZ2901", "niKhalt", "halt"),
  // Richtzeichen (Anlage 3, Hinweise). Fußgängerüberweg: Vorrang der Fußgänger und Halteverbot davor stehen in der StVO, nicht im Schild -> nicht bei Vorfahrt/Haltverbot.
  S("z350", "350", "z350l", "niKricht", "richt", ["vorfahrt", "halt"])
];
const SCHILD = {};
SCHILDER.forEach((s) => { SCHILD[s.id] = s; });
export const schildMitId = (id) => SCHILD[id] || null;
/* Bild eines Schildes (amtliche Datei, <img>); beschriftung leer = Dekoration (der Name steht daneben bzw. am Knopf) */
export function bildHtml(s, beschriftung) {
  return s.zahl ? zeichen274(s.zahl, beschriftung || "") : schildBild(s.id, { beschriftung: beschriftung || "" });
}

/* Die Regeln. richtigGruppen = Schilder dieser Gruppen zählen. falschGruppen = daraus werden die falschen Schilder gezogen,
   außer Schildern, die diese Regel in `nicht` haben. Eine Gruppe steht nie in beiden Listen. */
export const REGELN = [
  { id: "gefahr", text: "niRegelGefahr", warum: "niWarumGefahr", richtigGruppen: ["gefahr"], falschGruppen: ["vorfahrt", "gebot", "verbot", "tempo", "halt", "richt"] },
  { id: "verbot", text: "niRegelVerbot", warum: "niWarumVerbot", richtigGruppen: ["verbot", "tempo", "halt"], falschGruppen: ["gefahr", "gebot", "richt"] },
  { id: "gebot", text: "niRegelGebot", warum: "niWarumGebot", richtigGruppen: ["gebot"], falschGruppen: ["gefahr", "verbot", "tempo", "halt", "richt"] },
  { id: "vorfahrt", text: "niRegelVorfahrt", warum: "niWarumVorfahrt", richtigGruppen: ["vorfahrt"], falschGruppen: ["gefahr", "gebot", "verbot", "tempo", "halt", "richt"] },
  { id: "tempo", text: "niRegelTempo", warum: "niWarumTempo", richtigGruppen: ["tempo"], falschGruppen: ["gefahr", "gebot", "verbot", "halt", "richt", "vorfahrt"] },
  { id: "halt", text: "niRegelHalt", warum: "niWarumHalt", richtigGruppen: ["halt"], falschGruppen: ["gefahr", "gebot", "verbot", "tempo", "richt"] }
];
export const regelMitId = (id) => REGELN.find((r) => r.id === id) || null;
export function richtigePool(regel) { return SCHILDER.filter((s) => regel.richtigGruppen.indexOf(s.gruppe) !== -1); }
export function falschePool(regel) {
  return SCHILDER.filter((s) => regel.falschGruppen.indexOf(s.gruppe) !== -1 && s.nicht.indexOf(regel.id) === -1);
}

/* ===================== Zufall und Fahrplan ===================== */
export function mischen(liste, rnd) {
  const z = rnd || Math.random, a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(z() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/* n Schilder aus dem Pool, möglichst alle verschieden (erst jedes einmal, dann wieder von vorn gemischt) */
function ziehe(pool, n, rnd) {
  const aus = [];
  let beutel = [];
  while (aus.length < n) {
    if (!beutel.length) beutel = mischen(pool, rnd);
    aus.push(beutel.pop());
  }
  return aus;
}
/* Drei verschiedene Regeln in zufälliger Reihenfolge */
export function waehleRegeln(rnd) { return mischen(REGELN, rnd).slice(0, RUNDEN); }

/* Fahrplan einer Runde. nr = 0…2 (Geschwindigkeit), langsam = reduzierte Bewegung.
   Liefert { regel, nr, dauer, schilder: [{ i, sid, erkl, richtig, t, bahn, richtung }] } mit
     t        Zeitpunkt (ms ab Rundenstart), zu dem das Schild am Rand erscheint; es braucht `dauer` ms bis zum anderen Rand
     bahn     0…BAHNEN-1; gerade Bahnen gleiten von links nach rechts (richtung +1), ungerade von rechts nach links (−1)
   Zusicherungen (prüft pruefe-ninja.mjs): N_RICHTIG richtige + N_FALSCH falsche Schilder, das letzte erscheint frühestens bei MIN_RUNDE_MS und
   alle sind spätestens bei ZEIT_MS durch; in einer Bahn erscheinen zwei Schilder mindestens BAHN_ABSTAND * dauer auseinander (alle gleich schnell,
   also nie übereinander). */
export function neueRunde(regel, nr, rnd, langsam) {
  const z = rnd || Math.random;
  const dauer = Math.round(DAUER_MS[Math.min(nr, DAUER_MS.length - 1)] * (langsam ? LANGSAM : 1));
  const richtig = ziehe(richtigePool(regel), N_RICHTIG, z).map((s) => ({ s: s, richtig: true }));
  const falsch = ziehe(falschePool(regel), N_FALSCH, z).map((s) => ({ s: s, richtig: false }));
  const folge = mischen(richtig.concat(falsch), z);
  const n = folge.length;
  const t0 = 600, tEnde = ZEIT_MS - dauer - 500;             // erstes Schild nach 0,6 s; das letzte muss vor Rundenende ganz durchgleiten
  const schritt = (tEnde - t0) / (n - 1);
  const abstand = BAHN_ABSTAND * dauer;
  const frei = [];                                            // frei[b] = frühester nächster Start in Bahn b
  for (let b = 0; b < BAHNEN; b++) frei.push(-Infinity);
  let letzteBahn = -1;
  const schilder = folge.map(function (e, i) {
    const ideal = t0 + i * schritt + (i > 0 && i < n - 1 ? (z() - 0.5) * 0.3 * schritt : 0);   // kleine Streuung, erstes und letztes fest
    let t = Math.max(ideal, 0);
    // freie Bahnen (zum Zeitpunkt t), möglichst nicht dieselbe wie das Schild davor
    let kandidaten = [];
    for (let b = 0; b < BAHNEN; b++) if (frei[b] <= t) kandidaten.push(b);
    if (!kandidaten.length) {                                 // (praktisch nie) dann in der Bahn, die zuerst frei wird
      let best = 0; for (let b = 1; b < BAHNEN; b++) if (frei[b] < frei[best]) best = b;
      t = frei[best]; kandidaten = [best];
    }
    const andere = kandidaten.filter((b) => b !== letzteBahn);
    const wahl = (andere.length ? andere : kandidaten)[Math.floor(z() * (andere.length ? andere.length : kandidaten.length))];
    frei[wahl] = t + abstand; letzteBahn = wahl;
    return { i: i, sid: e.s.id, erkl: e.s.erkl, richtig: e.richtig, t: Math.round(t), bahn: wahl, richtung: wahl % 2 === 0 ? 1 : -1 };
  });
  return { regel: regel.id, nr: nr, dauer: dauer, schilder: schilder };
}

/* ===================== Geometrie ===================== */
/* Größe der Schilder und Bahnhöhe aus der Größe des Feldes (Pixel) */
export function masse(breite, hoehe) {
  const bahnH = hoehe / BAHNEN;
  const s = Math.max(MIN_SCHILD_PX, Math.min(MAX_SCHILD_PX, Math.floor(breite * 0.2), Math.floor(bahnH - 8)));
  return { breite: breite, hoehe: hoehe, bahnH: bahnH, s: s };
}
/* Mitte eines Schildes zur Zeit `e` (ms seit Rundenstart); sichtbar = zwischen Erscheinen und Verlassen des Feldes */
export function position(sch, dauer, e, m) {
  const p = (e - sch.t) / dauer;
  const x = sch.richtung > 0 ? -m.s / 2 + p * (m.breite + m.s) : m.breite + m.s / 2 - p * (m.breite + m.s);
  return { x: x, y: m.bahnH * (sch.bahn + 0.5), p: p, sichtbar: p >= 0 && p <= 1 };
}
/* Abstand eines Punktes von einer Strecke ≤ r? (Wisch von (x0,y0) nach (x1,y1); ein Tipp ist eine Strecke der Länge 0) */
export function segmentTrifft(x0, y0, x1, y1, cx, cy, r) {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((cx - x0) * dx + (cy - y0) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(cx - (x0 + t * dx), cy - (y0 + t * dy)) <= r;
}
export const trefferRadius = (s) => s / 2 + TREFFER_RAND_PX;

/* ===================== Auswertung einer Runde ===================== */
/* ergebnisse: { [schild-i]: true } = gewischt. Liefert Zahlen und die Liste für die Erklärung (falsch gewischt, verpasst, richtig, gemieden). */
export function bewerteRunde(runde, gewischt) {
  let richtig = 0, falsch = 0, verpasst = 0;
  const gruppen = {};
  runde.schilder.forEach(function (sch) {
    const hit = !!gewischt[sch.i];
    if (sch.richtig) { if (hit) richtig++; else verpasst++; } else if (hit) falsch++;
    const g = gruppen[sch.erkl] || (gruppen[sch.erkl] = { erkl: sch.erkl, sid: sch.sid, richtig: sch.richtig, wischte: 0, verpasst: 0, n: 0 });
    g.n++;
    if (hit) g.wischte++; else g.verpasst++;
  });
  const eintraege = Object.keys(gruppen).map(function (k) {
    const g = gruppen[k];
    let status;
    if (g.richtig) status = g.verpasst > 0 ? "verpasst" : "gewischt";
    else status = g.wischte > 0 ? "falsch" : "gemieden";
    return { erkl: g.erkl, sid: g.sid, richtig: g.richtig, status: status, n: g.n, wischte: g.wischte };
  });
  const rang = { falsch: 0, verpasst: 1, gewischt: 2, gemieden: 3 };
  eintraege.sort((a, b) => rang[a.status] - rang[b.status]);
  return { richtig: richtig, falsch: falsch, verpasst: verpasst, voll: istVoll(richtig, falsch), punkte: punkteRunde(richtig, falsch), eintraege: eintraege };
}

/* ===================== Bildschirm ===================== */
let cssVersprechen = null;
function eigenesCssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-ninja-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = new URL("./ninja.css", import.meta.url).href;
      l.setAttribute("data-ninja-css", "");
      l.onload = fertig; l.onerror = fertig;
      document.head.appendChild(l);
      setTimeout(fertig, 2500);
    } catch (e) { fertig(); }
  });
  return cssVersprechen;
}
const wenigBewegung = () => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } };

export function starte(platz, k) {
  schilderVorladen();
  let zustand = "bereit";            // bereit | start | regel | spiel | aufloesung | fertig
  let weg = false;
  let runde = null;                  // Runden-ID vom Server; null = nichts wird gespeichert
  let rundenNr = 0, ergId = 0;       // rundenNr: erhöht sich bei jedem Abbruch/Neustart (alte Zeitgeber merken das)
  let regeln = [], nr = 0, plan = null;
  let gewischt = {}, elemente = {}, erledigt = {}, tStart = 0, raf = 0, timer = [], m = null;
  let gesamt = 0, summeRichtig = 0, summeFalsch = 0, summeVoll = 0;
  let rundeRichtig = 0, rundeFalsch = 0;
  let ergebnisDaten = null, speicherInfo = "";
  let zeiger = null;
  let sekundeAlt = -1;

  platz.innerHTML =
    '<div class="sp-ninja">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("niName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte ni-buehne">' +
        '<div class="ni-hud" dir="auto"><span class="ni-runde" role="status" aria-live="polite"></span>' +
          '<span class="ni-punkte"><span class="sp-label">' + k.esc(k.tx("niPunkte")) + '</span> <b dir="ltr">0</b></span></div>' +
        '<div class="ni-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="ni-info" dir="auto"><span class="ni-regel"></span><span class="ni-zeit" dir="ltr"></span></div>' +
        '<div class="ni-spielfeld"><div class="ni-feld" role="group"></div><button type="button" class="ni-knopf start"></button></div>' +
        '<div class="ni-meldung" role="status" aria-live="polite" dir="auto"></div>' +
        '<div class="ni-antwort" hidden></div>' +
      "</div>" +
      '<p class="admin-sub ni-anleitung">' + k.esc(k.tx("niBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const q = (s) => platz.querySelector(s);
  const rundeEl = q(".ni-runde"), punkteEl = q(".ni-punkte b"), leiste = q(".ni-leiste i"), regelEl = q(".ni-regel"), zeitEl = q(".ni-zeit");
  const spielfeld = q(".ni-spielfeld"), feld = q(".ni-feld"), knopf = q(".ni-knopf"), meldung = q(".ni-meldung");
  const antwortEl = q(".ni-antwort"), anleitung = q(".ni-anleitung"), ergebnis = q(".sp-ergebnis");
  const format = function (w) { return w + " " + k.tx("niPunkte"); };
  const rank = rankingKarte(k, "ninja", "", q(".sp-rank-platz"), format);
  profilKarte(k, q(".sp-profil-platz"), function () { rank.aktualisieren(); });
  feld.setAttribute("aria-label", k.tx("niFeldAria"));

  const jetzt = () => performance.now();
  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "regel" || zustand === "spiel" || zustand === "aufloesung"; }
  function buehneInsBild() { try { q(".ni-buehne").scrollIntoView({ block: "start" }); } catch (e) {} }
  function setPunkte(p) { punkteEl.textContent = String(p); }
  const sekunden = (ms) => k.zahl(Math.max(0, Math.ceil(ms / 1000))) + " s";
  const liveStand = () => gesamt + punkteRunde(rundeRichtig, rundeFalsch);

  function felderLeeren() { feld.innerHTML = ""; elemente = {}; }
  function bereitMachen() {
    stopTimer(); rundenNr++;
    zustand = "bereit"; anleitung.hidden = false; zeiger = null; spielfeld.classList.remove("aktiv");
    plan = null; nr = 0; gesamt = 0; summeRichtig = 0; summeFalsch = 0; summeVoll = 0; rundeRichtig = 0; rundeFalsch = 0;
    felderLeeren(); spielfeld.classList.add("leer");
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    rundeEl.textContent = ""; regelEl.textContent = ""; zeitEl.textContent = "";
    setPunkte(0); leiste.style.width = "0%"; leiste.className = "";
    knopf.hidden = false; knopf.className = "ni-knopf start"; knopf.textContent = k.tx("start");
  }

  function starteRunde() {
    bereitMachen();
    const meine = rundenNr;
    zustand = "start"; anleitung.hidden = true; ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "ni-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "ninja" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (weg || meine !== rundenNr || zustand !== "start") return;
      runde = r; regeln = waehleRegeln(function () { return Math.random(); }); nr = 0;
      regelZeigen();
    });
  }

  /* Vor jeder Runde: die Regel steht oben, in der Mitte des Feldes „Los!“ */
  function regelZeigen() {
    const regel = regeln[nr];
    zustand = "regel"; zeiger = null;
    felderLeeren(); spielfeld.classList.add("leer");
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    rundeEl.textContent = k.tx("niRunde", { n: nr + 1, m: RUNDEN });
    regelEl.textContent = k.tx(regel.text);
    zeitEl.textContent = ""; leiste.style.width = "100%"; leiste.className = "";
    rundeRichtig = 0; rundeFalsch = 0; setPunkte(gesamt);
    knopf.hidden = false; knopf.className = "ni-knopf los"; knopf.textContent = k.tx("niLos");
    try { knopf.focus({ preventScroll: true }); } catch (e) {}
  }

  function masseNeu() { m = masse(feld.clientWidth || 280, feld.clientHeight || 300); }

  function losGehts() {
    if (zustand !== "regel") return;
    const regel = regeln[nr];
    plan = neueRunde(regel, nr, function () { return Math.random(); }, wenigBewegung());
    gewischt = {}; erledigt = {}; rundeRichtig = 0; rundeFalsch = 0; sekundeAlt = -1;
    felderLeeren(); spielfeld.classList.remove("leer"); spielfeld.classList.add("aktiv"); knopf.hidden = true; meldung.textContent = "";
    masseNeu();
    zustand = "spiel";
    tStart = jetzt();
    setPunkte(liveStand());
    const meine = rundenNr, dieseRunde = nr;
    function bild() {
      raf = 0;
      if (zustand !== "spiel" || meine !== rundenNr || dieseRunde !== nr) return;
      const e = jetzt() - tStart;
      aktualisieren(e);
      const rest = ZEIT_MS - e;
      leiste.style.width = Math.max(0, rest / ZEIT_MS) * 100 + "%";
      leiste.className = rest < 6000 ? "knapp" : "";
      const sek = Math.max(0, Math.ceil(rest / 1000));
      if (sek !== sekundeAlt) { sekundeAlt = sek; zeitEl.textContent = sekunden(rest); }
      const letzter = plan.schilder[plan.schilder.length - 1].t;
      if (rest <= 0 || (e >= letzter && plan.schilder.every(function (s) { return erledigt[s.i]; }))) { rundeBeenden(); return; }
      raf = requestAnimationFrame(bild);
    }
    raf = requestAnimationFrame(bild);
  }

  /* Schilder anlegen, bewegen und entfernen */
  function schildElement(sch) {
    const s = schildMitId(sch.sid);
    const b = document.createElement("button");
    b.type = "button"; b.className = "ni-schild"; b.dataset.i = String(sch.i); b.dataset.sid = sch.sid;
    b.style.width = m.s + "px"; b.style.height = m.s + "px"; b.style.margin = (-m.s / 2) + "px 0 0 " + (-m.s / 2) + "px";
    b.setAttribute("aria-label", k.tx(s.name).replace(/­/g, ""));
    b.innerHTML = bildHtml(s, "");
    feld.appendChild(b);
    elemente[sch.i] = b;
    return b;
  }
  function aktualisieren(e) {
    plan.schilder.forEach(function (sch) {
      if (erledigt[sch.i]) return;
      const p = position(sch, plan.dauer, e, m);
      let el = elemente[sch.i];
      if (p.p > 1) { erledigt[sch.i] = true; if (el && el.parentNode) el.parentNode.removeChild(el); delete elemente[sch.i]; return; }
      if (p.p < 0) return;
      if (!el) el = schildElement(sch);
      el.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)";
    });
  }

  /* Treffer: ein Schild wurde durchwischt oder angetippt */
  function treffer(sch) {
    if (zustand !== "spiel" || gewischt[sch.i] || erledigt[sch.i]) return;
    gewischt[sch.i] = true; erledigt[sch.i] = true;
    const el = elemente[sch.i];
    if (sch.richtig) { rundeRichtig++; meldung.textContent = k.tx("niRichtigMsg", { v: PKT_RICHTIG }); }
    else { rundeFalsch++; meldung.textContent = k.tx("niFalschMsg", { v: ABZUG_FALSCH }); }
    setPunkte(liveStand());
    if (el) {
      el.classList.add(sch.richtig ? "treffer" : "fehl"); el.disabled = true; el.tabIndex = -1;
      timer.push(setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 420));
      delete elemente[sch.i];
    }
    if (!sch.richtig) { spielfeld.classList.remove("wackeln"); void spielfeld.offsetWidth; spielfeld.classList.add("wackeln"); }
  }
  function pruefeStrecke(x0, y0, x1, y1) {
    if (zustand !== "spiel") return;
    const e = jetzt() - tStart;
    const r = trefferRadius(m.s);
    plan.schilder.forEach(function (sch) {
      if (erledigt[sch.i]) return;
      const p = position(sch, plan.dauer, e, m);
      if (!p.sichtbar) return;
      if (segmentTrifft(x0, y0, x1, y1, p.x, p.y, r)) treffer(sch);
    });
  }
  const lokal = (ev) => { const rc = feld.getBoundingClientRect(); return { x: ev.clientX - rc.left, y: ev.clientY - rc.top }; };
  feld.addEventListener("pointerdown", function (ev) {
    if (zustand !== "spiel" || ev.isPrimary === false) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    try { feld.setPointerCapture(ev.pointerId); } catch (e) {}
    const p = lokal(ev);
    zeiger = { id: ev.pointerId, x: p.x, y: p.y };
    pruefeStrecke(p.x, p.y, p.x, p.y);
  });
  feld.addEventListener("pointermove", function (ev) {
    if (!zeiger || ev.pointerId !== zeiger.id) return;
    const punkte = (ev.getCoalescedEvents && ev.getCoalescedEvents().length) ? ev.getCoalescedEvents() : [ev];
    punkte.forEach(function (c) {
      const p = lokal(c);
      pruefeStrecke(zeiger.x, zeiger.y, p.x, p.y);
      zeiger.x = p.x; zeiger.y = p.y;
    });
  });
  function zeigerEnde(ev) { if (zeiger && ev.pointerId === zeiger.id) zeiger = null; }
  feld.addEventListener("pointerup", zeigerEnde);
  feld.addEventListener("pointercancel", zeigerEnde);
  feld.addEventListener("lostpointercapture", zeigerEnde);
  // Tastatur und Screenreader: ein Schild-Knopf wird „angeklickt“ (Antippen ohne Wischen). Maus/Finger laufen über die Zeigerereignisse; doppelt zählt nie.
  feld.addEventListener("click", function (ev) {
    const b = ev.target.closest ? ev.target.closest(".ni-schild") : null;
    if (!b || zustand !== "spiel") return;
    const sch = plan.schilder[parseInt(b.dataset.i, 10)];
    if (sch) treffer(sch);
  });
  feld.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });

  function rundeBeenden() {
    if (zustand !== "spiel") return;
    stopTimer();
    zustand = "aufloesung"; zeiger = null; spielfeld.classList.remove("aktiv");
    const b = bewerteRunde(plan, gewischt);
    gesamt += b.punkte; summeRichtig += b.richtig; summeFalsch += b.falsch; if (b.voll) summeVoll++;
    setPunkte(gesamt); zeitEl.textContent = ""; leiste.style.width = "0%"; meldung.textContent = "";
    felderLeeren(); spielfeld.classList.add("leer");
    const regel = regeln[nr];
    const letzte = nr >= RUNDEN - 1;
    let h = '<div class="ni-urteil ' + (b.voll ? "ja" : "nein") + '">' + k.esc(b.voll ? k.tx("niVollMsg", { v: BONUS_VOLL }) : k.tx("niRundeEnde")) + "</div>" +
      '<div class="ni-zahlen" dir="auto">' + k.esc(k.tx("niRundeZahlen", { n: b.richtig, m: N_RICHTIG, f: b.falsch })) + " · " + k.esc(k.tx("niRundePunkte", { v: b.punkte })) + "</div>" +
      '<p class="ni-warum" dir="auto"><b>' + k.esc(k.tx(regel.text)) + "</b> " + k.esc(k.tx(regel.warum)) + "</p>" +
      '<h3 class="ni-listentitel" dir="auto">' + k.esc(k.tx("niListe")) + '</h3><ol class="ni-liste">';
    b.eintraege.forEach(function (en) {
      const s = schildMitId(en.sid);
      const stKey = { falsch: "niStFalsch", verpasst: "niStVerpasst", gewischt: "niStGewischt", gemieden: "niStGemieden" }[en.status];
      h += '<li class="ni-eintrag ' + en.status + '" data-schild="' + en.erkl + '"><span class="ni-eintrag-bild">' + bildHtml(s, "") + "</span>" +
        '<div class="ni-eintrag-text" dir="auto"><div class="ni-eintrag-kopf"><b>' + k.esc(k.tx("memoryZeichen", { n: s.nr })) + " · " + k.esc(k.tx(s.name)) + '</b> <span class="ni-status">' + k.esc(k.tx(stKey)) + "</span></div>" +
        '<div class="ni-kat">' + k.esc(k.tx(s.kat)) + "</div></div></li>";
    });
    h += '</ol><button type="button" class="ni-weiter">' + k.esc(letzte ? k.tx("niErgebnisZeigen") : k.tx("niWeiter")) + "</button>";
    antwortEl.innerHTML = h; antwortEl.hidden = false;
    antwortEl.querySelector(".ni-weiter").addEventListener("click", function () { weiter(letzte); });
    try { buehneInsBild(); } catch (e) {}
  }

  function weiter(letzte) {
    if (zustand !== "aufloesung") return;
    if (letzte) { beenden(); return; }
    nr++; regelZeigen(); buehneInsBild();
  }

  function beenden() {
    stopTimer(); rundenNr++;
    zustand = "fertig"; anleitung.hidden = true;
    antwortEl.hidden = true; antwortEl.innerHTML = ""; meldung.textContent = "";
    felderLeeren(); spielfeld.classList.add("leer");
    rundeEl.textContent = ""; regelEl.textContent = ""; zeitEl.textContent = ""; leiste.style.width = "0%";
    knopf.hidden = false; knopf.className = "ni-knopf start"; knopf.textContent = k.tx("nochmal");
    ergebnisDaten = { wert: gesamt, richtig: summeRichtig, falsch: summeFalsch, voll: summeVoll };
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
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("niPunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="ni-ergzeile" dir="auto">' + k.esc(k.tx("niErgRichtig", { n: e.richtig, m: MAX_RICHTIG })) + "</p>" +
        '<p class="ni-ergzeile" dir="auto">' + k.esc(k.tx("niErgFalsch", { n: e.falsch })) + "</p>" +
        '<p class="ni-ergzeile" dir="auto">' + k.esc(k.tx("niErgVoll", { n: e.voll, m: RUNDEN })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse" dir="auto">' + k.esc(k.tx("niHinweis")) + "</p>" +
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
    k.api({ aktion: "ergebnis", runde: meine, wert: e.wert, richtig: e.richtig, falsch: e.falsch, voll: e.voll }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("niNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("niBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.ninja = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  knopf.addEventListener("click", function () {
    if (zustand === "bereit" || zustand === "fertig") starteRunde();
    else if (zustand === "regel") losGehts();
  });
  // Wer die App mitten im Spiel verlässt, bekommt keine verschobene Zeit: abbrechen und von vorn
  function sichtbarkeit() { if (document.hidden && imSpiel()) bereitMachen(); }
  document.addEventListener("visibilitychange", sichtbarkeit);
  function nachResize() { if (zustand === "spiel") masseNeu(); }
  window.addEventListener("resize", nachResize);

  // Bis ninja.css geladen ist, bleibt der Bereich unsichtbar (sonst blitzt ungestalteter Text auf)
  const wurzel = q(".sp-ninja");
  wurzel.style.visibility = "hidden";
  eigenesCssLaden().then(function () { wurzel.style.visibility = ""; });
  bereitMachen();
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      weg = true; stopTimer(); rundenNr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
      window.removeEventListener("resize", nachResize);
    }
  };
}
