/* Spiel 4: Rechts vor Links (Familie B: Szene + Auswahl).
   Eine Kreuzung OHNE Schilder und OHNE Ampel von oben, 2–4 Autos warten, jedes fährt geradeaus, rechts oder links.
   Man tippt das Auto an, das zuerst fahren darf. 10 Aufgaben; je schneller richtig, desto mehr Punkte.
   Nach jeder Antwort steht die Regel dabei (Lerneffekt).

   Die Regeln stehen unten als reine Rechnung (ohne Bildschirm), damit sie sich prüfen lassen:
     1. Wo sich zwei Wege kreuzen oder in dieselbe Ausfahrt münden, muss einer warten (Konflikt).
     2. Normalfall: Wer von rechts kommt, hat Vorfahrt (rechts vor links), auch wenn er selbst abbiegt.
     3. Ausnahme Gegenverkehr: Wer links abbiegt, lässt entgegenkommende Autos durch, die geradeaus fahren oder rechts abbiegen.
        Zwei entgegenkommende Linksabbieger behindern sich nicht (sie fahren voreinander ab).
   Ein Auto „darf zuerst fahren“, wenn kein anderes Auto Vorrang vor ihm hat. Jede Aufgabe hat genau EIN solches Auto.

   Ranking: Punkte (größer ist besser, 0–1500). Der Server prüft: richtig (0–10), Punkte zwischen 100 und 150 je richtiger Aufgabe,
   Mindestdauer, einmal einlösbar; siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „vorfahrt“. */
import { rankingKarte, profilKarte } from "./rahmen.js";

/* ===================== Regeln (reine Rechnung) ===================== */
/* Arme im Uhrzeigersinn: 0 = unten (Süd), 1 = links (West), 2 = oben (Nord), 3 = rechts (Ost).
   Ein Auto „aus Arm a“ kommt von dort an die Kreuzung. */
export const ARME = ["unten", "links", "oben", "rechts"];
export const RICHTUNGEN = ["gerade", "rechts", "links"];
const rechtsVon = (a) => (a + 3) % 4;       // der Arm, aus dem von rechts gesehen ein Auto kommt (Süd: Ost)
const gegenueber = (a) => (a + 2) % 4;
export function ausfahrt(arm, richtung) { return richtung === "gerade" ? gegenueber(arm) : richtung === "rechts" ? (arm + 3) % 4 : (arm + 1) % 4; }

/* Wege in der Kreuzung (Mathematik-Koordinaten, y nach oben, Kreuzung = Quadrat −1…1, Rechtsverkehr).
   Basis = Auto aus Arm 0 (unten, fährt nach oben, rechte Spur x = +0,5). Für die anderen Arme wird im Uhrzeigersinn gedreht. */
const BASIS = {
  gerade: [[0.5, -1], [0.5, 1]],
  rechts: [[0.5, -1], [0.5, -0.75], [0.75, -0.5], [1, -0.5]],
  links: [[0.5, -1], [0.5, -0.2], [0.3, 0.25], [-0.1, 0.5], [-1, 0.5]]
};
const drehe = (p, n) => { let x = p[0], y = p[1]; for (let i = 0; i < n; i++) { const t = x; x = y; y = -t; } return [x, y]; };
export function weg(arm, richtung) { return BASIS[richtung].map((p) => drehe(p, arm)); }

function kreuzt(p1, p2, p3, p4) {            // echte Überschneidung zweier Strecken
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
/* Behindern sich zwei Autos (a, b = { arm, richtung })? Ja bei gleicher Ausfahrt (Zusammenführung) oder wenn sich die Wege kreuzen. */
export function konflikt(a, b) {
  if (a.arm === b.arm) return true;
  // Zwei entgegenkommende Linksabbieger biegen voreinander ab und behindern sich nicht (Regel, nicht Zeichnung der Wege)
  if (b.arm === gegenueber(a.arm) && a.richtung === "links" && b.richtung === "links") return false;
  if (ausfahrt(a.arm, a.richtung) === ausfahrt(b.arm, b.richtung)) return true;
  const wa = weg(a.arm, a.richtung), wb = weg(b.arm, b.richtung);
  for (let i = 0; i < wa.length - 1; i++) for (let j = 0; j < wb.length - 1; j++) if (kreuzt(wa[i], wa[i + 1], wb[j], wb[j + 1])) return true;
  return false;
}
/* Hat a Vorrang vor b (nur sinnvoll, wenn sie in Konflikt stehen)? */
export function vorrang(a, b) {
  if (b.arm === gegenueber(a.arm)) return b.richtung === "links" && a.richtung !== "links";   // Linksabbieger lässt Gegenverkehr durch
  return a.arm === rechtsVon(b.arm);                                                          // rechts vor links
}
/* Alle Autos, vor denen kein anderes Vorrang hat (autos = [{ arm, richtung }, …]) */
export function freieAutos(autos) {
  return autos.filter((c) => !autos.some((d) => d !== c && konflikt(c, d) && vorrang(d, c)));
}
/* Warum darf `sieger` zuerst? → "frei" (niemand im Weg) | "rechts" | "gegen" */
export function grundFuerSieger(autos, sieger) {
  const wartende = autos.filter((d) => d !== sieger && konflikt(sieger, d) && vorrang(sieger, d));
  if (!wartende.length) return "frei";
  return wartende.some((d) => d.arm !== gegenueber(sieger.arm) && sieger.arm === rechtsVon(d.arm)) ? "rechts" : "gegen";
}
/* Warum muss `auto` warten? → "rechts" (jemand von rechts) | "gegen" (Gegenverkehr, Linksabbieger) */
export function grundWarten(autos, auto) {
  const davor = autos.filter((d) => d !== auto && konflikt(auto, d) && vorrang(d, auto));
  if (!davor.length) return null;
  return davor.some((d) => d.arm === rechtsVon(auto.arm)) ? "rechts" : "gegen";
}

/* ---- Aufgaben erzeugen ---- */
const GEWICHT = [["gerade", 5], ["rechts", 2.5], ["links", 2.5]];
function ziehRichtung(rnd) {
  let r = rnd() * 10;
  for (const [name, w] of GEWICHT) { if (r < w) return name; r -= w; }
  return "gerade";
}
export function schluessel(autos) { return autos.map((c) => c.arm + c.richtung[0]).sort().join("-"); }
/* Eine Aufgabe mit n Autos: genau ein Auto darf zuerst. */
export function erzeugeAufgabe(n, rnd, nicht) {
  const zufall = rnd || Math.random;
  for (let versuch = 0; versuch < 500; versuch++) {
    const arme = [0, 1, 2, 3].sort(() => zufall() - 0.5).slice(0, n).sort((a, b) => a - b);
    const autos = arme.map((arm) => ({ arm: arm, richtung: ziehRichtung(zufall) }));
    if (freieAutos(autos).length !== 1) continue;
    if (nicht && schluessel(autos) === nicht) continue;
    const sieger = freieAutos(autos)[0];
    return { autos: autos, sieger: sieger, grund: grundFuerSieger(autos, sieger) };
  }
  throw new Error("keine Aufgabe gefunden");
}
export const ANZAHL_AUFGABEN = 10;
const AUTOS_JE_AUFGABE = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4];     // leicht -> schwer
export function hatGegenverkehrKonflikt(autos) {
  return autos.some((a) => autos.some((b) => b.arm === gegenueber(a.arm) && a.richtung === "links" && b.richtung !== "links" && konflikt(a, b)));
}
/* Zehn Aufgaben; mindestens 2 mit „Linksabbieger gegen Gegenverkehr“ und 3 mit „von rechts“, damit beide Regeln drankommen. */
export function aufgabenSatz(rnd) {
  const zufall = rnd || Math.random;
  for (let runde = 0; runde < 200; runde++) {
    const satz = [];
    let davor = null;
    for (const n of AUTOS_JE_AUFGABE) { const a = erzeugeAufgabe(n, zufall, davor); davor = schluessel(a.autos); satz.push(a); }
    const gegen = satz.filter((a) => hatGegenverkehrKonflikt(a.autos)).length;
    const rechts = satz.filter((a) => a.grund === "rechts").length;
    if (gegen >= 2 && rechts >= 3) return satz;
  }
  throw new Error("kein Aufgabensatz gefunden");
}

/* ---- Punkte ---- */
export const BONUS_MS = 8000, LIMIT_MS = 15000;
export function punkteFuer(ms) { return 100 + Math.round(50 * Math.max(0, 1 - ms / BONUS_MS)); }

/* ===================== Bildschirm ===================== */
const FARBEN = ["#2d6cdf", "#f2a900", "#2e9e5b", "#b24ec6"];     // je Arm eine feste Farbe (unten, links, oben, rechts)
/* Wege im Bild (SVG, 300 x 300, y nach unten) für ein Auto aus Arm 0 (unten, fährt nach oben); die anderen Arme drehen im Uhrzeigersinn */
const BILD_WEG = {
  gerade: { d: "M175 208 L175 100", spitze: "175,92 170,102 180,102" },
  rechts: { d: "M175 208 L175 192 Q175 175 192 175 L200 175", spitze: "208,175 198,170 198,180" },
  links: { d: "M175 208 L175 168 Q175 125 132 125 L100 125", spitze: "92,125 102,120 102,130" }
};
const POS_SCHLUESSEL = ["vorPosUnten", "vorPosLinks", "vorPosOben", "vorPosRechts"];
const RICHT_SCHLUESSEL = { gerade: "vorGerade", rechts: "vorRechtsAb", links: "vorLinksAb" };

function autoSvg(c, k) {
  const farbe = FARBEN[c.arm], drehung = c.arm * 90;
  const bl = c.richtung === "links" ? '<circle class="sp-v-blink" cx="-10" cy="-20" r="3.4"/>' : c.richtung === "rechts" ? '<circle class="sp-v-blink" cx="10" cy="-20" r="3.4"/>' : "";
  const beschr = k.tx("vorAuto", { pos: k.tx(POS_SCHLUESSEL[c.arm]), richtung: k.tx(RICHT_SCHLUESSEL[c.richtung]) });
  return '<g class="sp-v-auto" data-arm="' + c.arm + '" data-richtung="' + c.richtung + '" role="button" tabindex="0" aria-label="' + k.esc(beschr) + '" transform="rotate(' + drehung + " 150 150)" + '">' +
    '<path class="sp-v-weg" d="' + BILD_WEG[c.richtung].d + '" stroke="' + farbe + '" fill="none"/>' +
    '<polygon class="sp-v-spitze" points="' + BILD_WEG[c.richtung].spitze + '" fill="' + farbe + '"/>' +
    '<g transform="translate(175 233)">' +
      '<rect class="sp-v-ring" x="-17" y="-29" width="34" height="58" rx="10" fill="none"/>' +
      '<rect x="-11" y="-21" width="22" height="42" rx="6" fill="' + farbe + '" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>' +
      '<rect x="-8" y="-13" width="16" height="9" rx="2" fill="#d8e8f5"/><rect x="-8" y="7" width="16" height="7" rx="2" fill="#d8e8f5"/>' +
      '<rect x="-9" y="-21.5" width="5" height="2.6" rx="1" fill="#fff6c2"/><rect x="4" y="-21.5" width="5" height="2.6" rx="1" fill="#fff6c2"/>' +
      bl +
    "</g>" +
    '<rect class="sp-v-treffer" x="143" y="200" width="64" height="66" fill="transparent"/>' +
  "</g>";
}
export function szeneSvg(autos, k) {
  return '<svg class="sp-v-svg" viewBox="0 0 300 300" focusable="false">' +
    '<rect width="300" height="300" fill="#6f9a5a"/>' +
    '<rect x="100" y="0" width="100" height="300" fill="#4a4d54"/><rect x="0" y="100" width="300" height="100" fill="#4a4d54"/>' +
    '<g stroke="#e9e9e9" stroke-width="2.5" stroke-dasharray="12 10" fill="none"><path d="M150 0 V92"/><path d="M150 208 V300"/><path d="M0 150 H92"/><path d="M208 150 H300"/></g>' +
    autos.map((c) => autoSvg(c, k)).join("") +
    "</svg>";
}

export function starte(platz, k) {
  let zustand = "bereit";            // bereit | start | frage | antwort | fertig
  let aufgaben = [], nr = 0, runde = null, ergId = 0;
  let idx = 0, punkte = 0, richtig = 0, tStart = 0, raf = 0, timer = [];
  let ergebnisDaten = null, speicherInfo = "";
  let rundenNr = 0;                  // zählt Spielrunden: späte Antworten alter Runden werden verworfen

  platz.innerHTML =
    '<div class="sp-vorfahrt">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("vorName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-v-buehne">' +
        '<div class="sp-v-hud" dir="auto">' +
          '<span class="sp-v-aufgabe" role="status" aria-live="polite"></span>' +
          '<span class="sp-v-punkte"><span class="sp-label">' + k.esc(k.tx("vorPunkte")) + '</span> <b dir="ltr">0</b></span>' +
        "</div>" +
        '<div class="sp-t-leiste sp-v-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="sp-v-frage" dir="auto"></div>' +
        '<div class="sp-v-szene"></div>' +
        '<div class="sp-v-antwort" hidden role="status" aria-live="polite"></div>' +
        '<div class="sp-v-hinweis" dir="auto">' + k.esc(k.tx("vorKeineSchilder")) + "</div>" +
      "</div>" +
      '<button type="button" class="sp-v-knopf start"></button>' +
      '<p class="admin-sub sp-v-anleitung">' + k.esc(k.tx("vorBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const aufgabeEl = platz.querySelector(".sp-v-aufgabe"), punkteEl = platz.querySelector(".sp-v-punkte b");
  const leiste = platz.querySelector(".sp-v-leiste i"), frageEl = platz.querySelector(".sp-v-frage");
  const szene = platz.querySelector(".sp-v-szene"), antwortEl = platz.querySelector(".sp-v-antwort");
  const knopf = platz.querySelector(".sp-v-knopf"), anleitung = platz.querySelector(".sp-v-anleitung");
  const ergebnis = platz.querySelector(".sp-ergebnis");
  const format = function (w) { return w + " " + k.tx("vorPunkte"); };
  const rank = rankingKarte(k, "vorfahrt", "", platz.querySelector(".sp-rank-platz"), format);
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "frage" || zustand === "antwort"; }
  function anleitungZeigen() { anleitung.hidden = imSpiel(); }
  function buehneInsBild() { try { platz.querySelector(".sp-v-buehne").scrollIntoView({ block: "start" }); } catch (e) {} }
  function setPunkte(p) { punkteEl.textContent = String(p); }

  function bereitMachen() {
    stopTimer(); rundenNr++;
    zustand = "bereit"; anleitungZeigen();
    idx = 0; punkte = 0; richtig = 0;
    szene.innerHTML = szeneSvg([], k);
    antwortEl.hidden = true; antwortEl.innerHTML = "";
    aufgabeEl.textContent = "";
    frageEl.textContent = ""; setPunkte(0); leiste.style.width = "0%";
    knopf.hidden = false; knopf.className = "sp-v-knopf start"; knopf.textContent = k.tx("start");
  }

  /* ---- Ablauf ---- */
  function starteRunde() {
    bereitMachen();
    const meine = rundenNr;
    zustand = "start"; anleitungZeigen(); ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "sp-v-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "vorfahrt" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== rundenNr || zustand !== "start") return;
      runde = r; aufgaben = aufgabenSatz(); idx = 0;
      knopf.hidden = true;
      frage();
    });
  }

  function frage() {
    zustand = "frage"; antwortEl.hidden = true; antwortEl.innerHTML = "";
    const a = aufgaben[idx];
    aufgabeEl.textContent = k.tx("vorAufgabe", { n: idx + 1, m: ANZAHL_AUFGABEN });
    frageEl.textContent = k.tx("vorFrage");
    szene.innerHTML = szeneSvg(a.autos, k);
    szene.querySelectorAll(".sp-v-auto").forEach(function (g) {
      const wahl = function () { antworten(parseInt(g.dataset.arm, 10)); };
      g.addEventListener("click", wahl);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); wahl(); } });
    });
    tStart = performance.now();
    leiste.style.width = "100%"; leiste.className = "";
    const meine = rundenNr, nrAufgabe = idx;
    function bild() {
      raf = 0;
      if (zustand !== "frage" || meine !== rundenNr || nrAufgabe !== idx) return;
      const t = performance.now() - tStart;
      leiste.style.width = Math.max(0, 1 - t / BONUS_MS) * 100 + "%";
      if (t >= LIMIT_MS) { antworten(null); return; }
      raf = requestAnimationFrame(bild);
    }
    raf = requestAnimationFrame(bild);
  }

  function antworten(arm) {
    if (zustand !== "frage") return;
    const jetzt = performance.now(), ms = jetzt - tStart;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    zustand = "antwort";
    const a = aufgaben[idx];
    const gewaehlt = arm == null ? null : a.autos.find(function (c) { return c.arm === arm; });
    const stimmt = !!gewaehlt && gewaehlt.arm === a.sieger.arm;
    let gewinn = 0;
    if (stimmt) { gewinn = punkteFuer(ms); punkte += gewinn; richtig++; setPunkte(punkte); }
    // Auswahl im Bild kennzeichnen
    szene.querySelectorAll(".sp-v-auto").forEach(function (g) {
      const ar = parseInt(g.dataset.arm, 10);
      g.classList.add("fest");
      if (ar === a.sieger.arm) g.classList.add("richtig");
      else if (gewaehlt && ar === gewaehlt.arm) g.classList.add("falsch");
      else g.classList.add("blass");
    });
    const letzte = idx >= ANZAHL_AUFGABEN - 1;
    const zeilen = [];
    zeilen.push('<div class="sp-v-urteil ' + (stimmt ? "ja" : "nein") + '">' + k.esc(stimmt ? k.tx("vorRichtig") + " +" + gewinn : (arm == null ? k.tx("vorZeitAus") : k.tx("vorFalsch"))) + "</div>");
    zeilen.push('<p class="sp-v-regel gruen" dir="auto">' + k.esc(k.tx({ frei: "vorGFrei", rechts: "vorGRechts", gegen: "vorGGegen" }[a.grund])) + "</p>");   // grünes Zeichen = das grün umrandete Auto
    if (gewaehlt && !stimmt) {
      const w = grundWarten(a.autos, gewaehlt);
      if (w) zeilen.push('<p class="sp-v-regel warten rot" dir="auto">' + k.esc(k.tx(w === "rechts" ? "vorWRechts" : "vorWGegen")) + "</p>");
    }
    zeilen.push('<button type="button" class="sp-v-weiter">' + k.esc(letzte ? k.tx("vorErgebnisZeigen") : k.tx("vorWeiter")) + "</button>");
    antwortEl.innerHTML = zeilen.join("");
    antwortEl.hidden = false;
    const w = antwortEl.querySelector(".sp-v-weiter");
    w.addEventListener("click", function () { weiter(letzte); });
    try { w.focus({ preventScroll: true }); } catch (e) {}
    if (stimmt === false) { /* nichts: falsche Antwort gibt keine Punkte */ }
  }

  function weiter(letzte) {
    if (zustand !== "antwort") return;
    if (letzte) { beenden(); return; }
    idx++; frage();
  }

  function beenden() {
    stopTimer(); rundenNr++;
    zustand = "fertig"; anleitungZeigen();
    antwortEl.hidden = true; antwortEl.innerHTML = "";
    frageEl.textContent = ""; aufgabeEl.textContent = "";
    leiste.style.width = "100%"; leiste.className = "spurt";
    knopf.hidden = false; knopf.className = "sp-v-knopf start"; knopf.textContent = k.tx("nochmal");
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
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("vorPunkte")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<p class="sp-v-richtigzahl" dir="auto">' + k.esc(k.tx("vorRichtigVon", { n: e.richtig, m: ANZAHL_AUFGABEN })) + "</p>" +
        '<p class="admin-sub sp-hinweis-strasse">' + k.esc(k.tx("vorHinweis")) + "</p>" +
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
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("vorNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("vorBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.vorfahrt = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

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
