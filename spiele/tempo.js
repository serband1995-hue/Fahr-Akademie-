/* Spiel 2: Tempo-Sprint (Familie A: Tippen).
   Man fährt auf der Autobahn, Schilder laufen vorbei. Jedes Tippen macht das Auto schneller, ohne Tippen verliert es
   Tempo. Über dem Schild löst ein Blitzer aus. Nach 30 Sekunden Lernphase kommt „Ende aller Streckenverbote“
   (Zeichen 282) und 10 Sekunden Endspurt: so schnell wie möglich. Ranking = höchste Geschwindigkeit im Endspurt.

   Ablauf (alle Zeiten ab dem Fingertipp auf „Start“; der Server startet die Runde davor):
     3 s Countdown · 6 Schilder je 5 s (Lernphase) · 10 s Endspurt
   Regeln (Zahlen in REGELN -- die Obergrenze für den Server steht in werkzeuge/edge-functions/academy-spiele.ts
   und MUSS dieselben Zahlen haben; die Prüfung vergleicht beide):
     Tippen   v = v + GAIN * (1 - v / VTOP)        (je schneller, desto weniger bringt ein Tipp)
     Spielraum nach oben (07.10.2026, Wunsch Serban: wer richtig gut ist, soll SEHR schnell werden): im Endspurt hält sich das Tempo bei
     v* = VTOP * (1 - DECAY / (GAIN * Tipps pro Sekunde)); gemütlich (6/s) ~160 km/h, flott (10/s) ~235, sehr gut (14/s) ~285, Grenze (16/s) ~300.
     Rollen   v = v - DECAY pro Sekunde            (ohne Tippen wird man langsamer)
     Blitzer  v > Schild + TOL (erst KULANZ_MS nach dem Schild): Tippen 2 s gesperrt, Tempo * BLITZ_FAKTOR
   Mehr als ~16 Tipps pro Sekunde schafft kein Mensch: ein Tipp zählt erst TAP_ABSTAND_MS nach dem letzten gezählten
   (der Server lehnt mehr als TAPS_MAX Tipps im Endspurt ab). Mehrere Finger zählen alle -- innerhalb dieser Grenze.

   Aufräumen: Zeitgeber, Animationsbild und Listener werden in zerstoeren() entfernt; wer die App verlässt
   (Seite unsichtbar), bricht die Runde ab, wie bei der Ampel. */
import { rankingKarte, profilKarte } from "./rahmen.js";
import { zeichen274, zeichen282, schilderVorladen } from "./schilder.js";

export const REGELN = {
  GAIN: 5, VTOP: 420, DECAY: 16,            // km/h je Tipp (bei v = 0), Höchsttempo-Grenze, km/h Verlust je Sekunde
  TOL: 5, BLITZ_FAKTOR: 0.6, SPERRE_MS: 2000,
  LIMITS: [80, 100, 80, 60, 100, 120],      // Z 274, je SEGMENT_MS; das letzte ist das höchste (Endspurt startet davon)
  SEGMENT_MS: 5000, ANKUENDIGUNG_MS: 2000, KULANZ_MS: 2500,
  COUNTDOWN_MS: 3000, SPURT_MS: 10000,
  V_START: 50, V0_MAX: 130,                 // Startgeschwindigkeit; Obergrenze fürs Tempo bei Beginn des Endspurts (120 + TOL + ein Tipp)
  TAP_ABSTAND_MS: 63, TAPS_MAX: 160,         // 160 Tipps in 10 s = 16 pro Sekunde
  OBERGRENZE_ABSTAND_MS: 60                  // Server rechnet seine Obergrenze mit diesem (etwas dichteren) Abstand: gilt für jeden ehrlichen Lauf
};
export const LERN_MS = REGELN.LIMITS.length * REGELN.SEGMENT_MS;                        // 30 s
export const GESAMT_MS = REGELN.COUNTDOWN_MS + LERN_MS + REGELN.SPURT_MS;              // 43 s: früheste mögliche Ergebnis-Zeit

/* ---- Reine Rechnung (ohne Bildschirm), damit sie sich prüfen lässt ---- */
export function tipp(v) { return Math.min(REGELN.VTOP, v + REGELN.GAIN * (1 - v / REGELN.VTOP)); }
export function rollen(v, ms) { return Math.max(0, v - REGELN.DECAY * ms / 1000); }
/* Höchste Geschwindigkeit, die mit n Tipps im Endspurt überhaupt möglich ist: Start bei V0_MAX, alle Tipps gleich am Anfang
   im dichtesten Abstand (spätere Tipps bringen nie mehr, weil das Tempo dazwischen nur sinkt), dazwischen der Rollverlust.
   Gleiche Rechnung wie tempoObergrenze() im Server. */
export function obergrenze(n) {
  let v = REGELN.V0_MAX;
  for (let i = 0; i < n; i++) {
    if (i > 0) v = Math.max(0, v - REGELN.DECAY * REGELN.OBERGRENZE_ABSTAND_MS / 1000);
    v = tipp(v);
  }
  return v;
}
/* Was gilt zur Zeit t (ms ab Lernphasen-Beginn)?  { phase:"lern"|"spurt"|"ende", limit, naechstes, frei, ankuendigung, blitzerAktiv, segmentZeit } */
export function lage(t) {
  const R = REGELN;
  if (t >= LERN_MS + R.SPURT_MS) return { phase: "ende", limit: null, frei: true };
  if (t >= LERN_MS) return { phase: "spurt", limit: null, frei: true, spurtZeit: t - LERN_MS };
  const seg = Math.min(R.LIMITS.length - 1, Math.max(0, Math.floor(t / R.SEGMENT_MS)));
  const imSeg = t - seg * R.SEGMENT_MS;
  const ankuendigung = imSeg >= R.SEGMENT_MS - R.ANKUENDIGUNG_MS;
  return {
    phase: "lern", seg: seg, limit: R.LIMITS[seg], segmentZeit: imSeg,
    ankuendigung: ankuendigung,
    naechstes: ankuendigung ? (seg + 1 < R.LIMITS.length ? R.LIMITS[seg + 1] : "frei") : null,
    blitzerAktiv: imSeg >= R.KULANZ_MS                  // kurz nach einem neuen Schild darf man noch langsamer werden
  };
}
export function blitzer(v, limit) { return v > limit + REGELN.TOL; }

/* Zeichen 274 und 282 (amtliche Bilder) kommen aus schilder.js; hier nur wieder ausgegeben, damit die Prüfungen sie hier finden. */
export { zeichen274, zeichen282 };

export function starte(platz, k) {
  const R = REGELN;
  schilderVorladen(["z274-" + 80 + ".svg", "z274-60.svg", "z274-100.svg", "z274-120.svg", "z282.svg"]);   // kein Nachladen beim Schildwechsel
  let zustand = "bereit";        // bereit | start | countdown | lauf | fertig
  let timer = [];
  let raf = 0;
  let runde = null;              // Runden-ID vom Server; null = nichts wird gespeichert
  let nr = 0;                    // Rundenzähler: späte Antworten alter Runden werden verworfen
  let ergId = 0;
  let speicherInfo = "";
  let sperreBis = 0;             // kurz nach dem Start zählt ein Zweittipp nicht als erster Tipp
  let tLauf0 = 0;                // performance.now() beim Start der Lernphase
  let letzt = 0;                 // Zeitpunkt des letzten Berechnungsschritts
  let v = 0, maxV = 0;
  let letzterTipp = -1e9, tippsSpurt = 0, blitzerAnzahl = 0, blitzBis = -1e9;
  let spurtBegonnen = false;
  let ergebnisDaten = null;
  let padSperreBis = 0;          // nach dem Ende: ein „Nachtipper“ darf nicht sofort die nächste Runde starten
  let tastenSperre = 0;
  let anzeige = { limit: null, status: "", zahl: null, restZeit: null, max: null, schild: null };

  platz.innerHTML =
    '<div class="sp-tempo-spiel">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("tempoName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-t-buehne">' +
        '<div class="sp-t-hud">' +
          '<div class="sp-t-schild" data-aktuell></div>' +
          '<div class="sp-t-tacho" dir="ltr"><span class="sp-t-zahl">0</span><small>km/h</small></div>' +
          '<div class="sp-t-rest" dir="ltr" aria-hidden="true"></div>' +
        "</div>" +
        '<div class="sp-t-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="sp-t-szene" aria-hidden="true">' +
          '<svg class="sp-t-svg" viewBox="0 0 320 150" preserveAspectRatio="none" focusable="false">' +
            '<defs><linearGradient id="sp-t-himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb8de"/><stop offset="1" stop-color="#dbe9f4"/></linearGradient></defs>' +
            '<rect width="320" height="150" fill="url(#sp-t-himmel)"/>' +
            '<rect y="58" width="320" height="92" fill="#6f9a5a"/>' +
            '<polygon points="160,58 14,150 306,150" fill="#4a4d54"/>' +
            '<polygon points="160,58 8,150 14,150" fill="#d9d9d9"/><polygon points="160,58 306,150 312,150" fill="#d9d9d9"/>' +
            '<g class="sp-t-striche" fill="#f2f2f2"></g>' +
          "</svg>" +
          '<div class="sp-t-weg" data-weg></div>' +
          '<div class="sp-t-blitz"></div>' +
        "</div>" +
        '<div class="sp-t-meldung" role="status" aria-live="polite"></div>' +
      "</div>" +
      '<button type="button" class="sp-t-pad start"></button>' +
      '<p class="admin-sub sp-t-anleitung">' + k.esc(k.tx("tempoBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const zahlEl = platz.querySelector(".sp-t-zahl");
  const restEl = platz.querySelector(".sp-t-rest");
  const leiste = platz.querySelector(".sp-t-leiste i");
  const schildEl = platz.querySelector("[data-aktuell]");
  const wegEl = platz.querySelector("[data-weg]");
  const szeneEl = platz.querySelector(".sp-t-szene");
  const blitzEl = platz.querySelector(".sp-t-blitz");
  const meldung = platz.querySelector(".sp-t-meldung");
  const striche = platz.querySelector(".sp-t-striche");
  const pad = platz.querySelector(".sp-t-pad");
  const anleitung = platz.querySelector(".sp-t-anleitung");
  const ergebnis = platz.querySelector(".sp-ergebnis");
  const rank = rankingKarte(k, "tempo", "km/h", platz.querySelector(".sp-rank-platz"));
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  // Fahrbahnmarkierung: ein paar Striche in der Mitte, die mit dem Tempo auf uns zulaufen
  const STRICHE = 7;
  let strichPhase = 0;
  for (let i = 0; i < STRICHE; i++) {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    striche.appendChild(p);
  }
  const strichEl = Array.prototype.slice.call(striche.children);
  function striche_zeichnen() {
    for (let i = 0; i < STRICHE; i++) {
      // Tiefe z in 0 (Horizont) … 1 (unten); Perspektive: y wächst quadratisch mit z
      const z0 = (i + strichPhase) / STRICHE, z1 = z0 + 0.5 / STRICHE;
      const y0 = 58 + 92 * z0 * z0, y1 = 58 + 92 * Math.min(1, z1) * Math.min(1, z1);
      const b0 = 0.4 + 5.2 * z0 * z0, b1 = 0.4 + 5.2 * Math.min(1, z1) * Math.min(1, z1);
      strichEl[i].setAttribute("points", (160 - b0) + "," + y0 + " " + (160 + b0) + "," + y0 + " " + (160 + b1) + "," + y1 + " " + (160 - b1) + "," + y1);
    }
  }

  /* ---- Anzeige ---- */
  function setMeldung(text, art) {
    if (anzeige.status === text + "|" + (art || "")) return;
    anzeige.status = text + "|" + (art || "");
    meldung.textContent = text;
    meldung.className = "sp-t-meldung" + (art ? " " + art : "");
  }
  function setPad(art, text) {
    pad.className = "sp-t-pad " + art;
    pad.textContent = text;
  }
  function schildZeigen(limit) {          // limit: Zahl | "frei" | null
    if (anzeige.schild === limit) return;
    anzeige.schild = limit;
    schildEl.innerHTML = limit == null ? "" :
      limit === "frei" ? zeichen282(k.esc(k.tx("tempoZ282"))) : zeichen274(limit, k.esc(k.tx("tempoZ274", { v: limit })));
  }
  /* Das nächste Schild läuft am Straßenrand heran (Tiefe z: 0 = weit weg am Horizont, 1 = vorbei).
     Alles in Prozent der Szene, damit es bei jeder Größe und im Querformat passt. */
  function wegSchild(naechstes, z) {
    if (naechstes == null) { if (wegEl.firstChild) wegEl.innerHTML = ""; wegEl.dataset.wert = ""; return; }
    if (wegEl.dataset.wert !== String(naechstes)) {
      wegEl.dataset.wert = String(naechstes);
      wegEl.innerHTML = '<div class="sp-t-mast"></div><div class="sp-t-weg-schild">' + (naechstes === "frei" ? zeichen282("") : zeichen274(naechstes, "")) + "</div>";
    }
    const mast = wegEl.children[0], sc = wegEl.children[1];
    const asp = (szeneEl.clientWidth / szeneEl.clientHeight) || 2;   // Breite : Höhe der Szene
    const z2 = Math.max(0, Math.min(1, z)); const q = z2 * z2;
    const w = 5 + 26 * q, cx = 56 + 40 * q, cy = 34 + 10 * q, boden = 40 + 56 * q;
    sc.style.width = w + "%"; sc.style.left = (cx - w / 2) + "%"; sc.style.top = (cy - w * asp / 2) + "%";
    mast.style.left = (cx - w * 0.03) + "%"; mast.style.width = (w * 0.06) + "%"; mast.style.top = cy + "%"; mast.style.height = Math.max(0, boden - cy) + "%";
    wegEl.style.opacity = z2 < 0.06 ? String(z2 / 0.06) : "1";
  }
  function wegLeer() { wegSchild(null, 0); }
  function setRest(ms) {
    const text = k.zahl(Math.max(0, ms) / 1000, 1) + " s";
    if (anzeige.restZeit !== text) { anzeige.restZeit = text; restEl.textContent = text; }
  }
  function setZahl(x) {
    const n = Math.round(x);
    if (anzeige.zahl !== n) { anzeige.zahl = n; zahlEl.textContent = String(n); }
  }
  function leisteSetzen(anteil, spurt) {
    leiste.style.width = Math.max(0, Math.min(1, anteil)) * 100 + "%";
    leiste.className = spurt ? "spurt" : "";
  }

  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "countdown" || zustand === "lauf"; }
  function anleitungZeigen() { anleitung.hidden = imSpiel(); }   // unter der Tippfläche: ändert nichts an ihrer Lage

  function bereitMachen() {
    zustand = "bereit"; anleitungZeigen(); v = 0; maxV = 0;
    schildZeigen(null); wegLeer(); blitzEl.classList.remove("an");
    setZahl(0); restEl.textContent = ""; anzeige.restZeit = null; leisteSetzen(0);
    strichPhase = 0; striche_zeichnen();
    setMeldung("");
    setPad("start", k.tx("start"));
  }

  /* Bühne (Tacho, Straße, Meldung) UND Tippfläche müssen zusammen im Bild sein: die Bühne wandert nach oben, die
     Tippfläche folgt direkt darunter (Größen in spiele.css sind darauf abgestimmt). */
  function buehneInsBild() {
    try { platz.querySelector(".sp-t-buehne").scrollIntoView({ block: "start" }); } catch (e) {}
  }

  /* ---- Ablauf ---- */
  function starteRunde() {
    const meine = ++nr;
    zustand = "start"; anleitungZeigen(); runde = null; ergebnisDaten = null; speicherInfo = ""; ergId++;
    ergebnis.hidden = true; ergebnis.innerHTML = "";
    v = R.V_START; maxV = v; tippsSpurt = 0; blitzerAnzahl = 0; blitzBis = -1e9; spurtBegonnen = false; letzterTipp = -1e9;
    setZahl(v); schildZeigen(null); wegLeer(); leisteSetzen(0);
    setMeldung(k.tx("tempoGleich"));
    setPad("warte", "…");
    sperreBis = performance.now() + 400;
    buehneInsBild();
    // Die Runde beim Server anmelden, BEVOR es losgeht: dann ist die Serverzeit nie kürzer als die Spielzeit.
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "tempo" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== nr || zustand !== "start") return;
      runde = r;
      countdown();
    });
  }

  function countdown() {
    zustand = "countdown";
    const t0 = performance.now();
    setPad("warte", "3");
    function schritt() {
      if (zustand !== "countdown") return;
      const rest = R.COUNTDOWN_MS - (performance.now() - t0);
      if (rest <= 0) { losGehts(); return; }
      setPad("warte", String(Math.ceil(rest / 1000)));
      raf = requestAnimationFrame(schritt);
    }
    raf = requestAnimationFrame(schritt);
  }

  function losGehts() {
    zustand = "lauf";
    tLauf0 = letzt = performance.now();
    setPad("tippen", k.tx("tempoTippen"));
    schildZeigen(R.LIMITS[0]);
    raf = requestAnimationFrame(frame);
  }

  /* Rechnet das Spiel bis `jetzt` fort (Rollen, Blitzer, Phasenwechsel). Wird vom Bildlauf UND vor jedem Tipp gerufen,
     damit ein Tipp immer auf dem aktuellen Stand landet. */
  function fortschritt(jetzt) {
    if (zustand !== "lauf") return;
    const t = jetzt - tLauf0;
    const dt = Math.max(0, Math.min(250, jetzt - letzt));    // ein hängendes Bild darf nicht plötzlich viel Tempo kosten
    letzt = jetzt;
    const l = lage(t);
    if (l.phase === "ende") { v = rollen(v, dt); beenden(); return; }
    if (l.phase === "spurt" && !spurtBegonnen) {                 // Zeichen 282: Endspurt beginnt, Sperre und Blitzer sind vorbei
      spurtBegonnen = true; blitzBis = -1e9; maxV = v;
      blitzEl.classList.remove("an");
    }
    v = rollen(v, dt);
    if (l.phase === "lern" && l.blitzerAktiv && blitzer(v, l.limit) && t >= blitzBis) blitzerAusloesen(t);
  }

  function blitzerAusloesen(t) {
    blitzerAnzahl++;
    v = Math.max(0, v * R.BLITZ_FAKTOR);
    blitzBis = t + R.SPERRE_MS;
    blitzEl.classList.remove("an"); void blitzEl.offsetWidth; blitzEl.classList.add("an");   // Aufblitzen neu starten
  }

  function frame() {
    raf = 0;
    if (zustand !== "lauf") return;
    const jetzt = performance.now();
    fortschritt(jetzt);
    if (zustand !== "lauf") return;
    const t = jetzt - tLauf0;
    const l = lage(t);
    const gesperrt = t < blitzBis;
    setZahl(v);
    // Fahrbahn läuft mit dem Tempo
    strichPhase = (strichPhase + (v / 140) * 0.016 * 1.0) % 1;
    striche_zeichnen();
    if (l.phase === "lern") {
      schildZeigen(l.limit);
      leisteSetzen(t / (LERN_MS + R.SPURT_MS), false);
      setRest(LERN_MS - t);
      if (gesperrt) { setMeldung(k.tx("tempoBlitzer"), "warn"); setPad("gesperrt", k.tx("tempoErgBlitzer")); }
      else {
        if (l.ankuendigung) {
          setMeldung(l.naechstes === "frei" ? k.tx("tempoNaechstesFrei") : k.tx("tempoNaechstes", { v: l.naechstes }));
          wegSchild(l.naechstes, (l.segmentZeit - (R.SEGMENT_MS - R.ANKUENDIGUNG_MS)) / R.ANKUENDIGUNG_MS);
        } else {
          setMeldung(k.tx("tempoErlaubt", { v: l.limit }));
          wegSchild(null, 0);
        }
        setPad("tippen", k.tx("tempoTippen"));
      }
    } else if (l.phase === "spurt") {
      schildZeigen("frei"); wegSchild(null, 0);
      leisteSetzen((LERN_MS + l.spurtZeit) / (LERN_MS + R.SPURT_MS), true);
      setRest(R.SPURT_MS - l.spurtZeit);
      setMeldung(k.tx("tempoSpurt"), "go");
      setPad("tippen spurt", k.tx("tempoTippen"));
    }
    raf = requestAnimationFrame(frame);
  }

  function antippenTempo() {
    const jetzt = performance.now();
    fortschritt(jetzt);
    if (zustand !== "lauf") return;
    const t = jetzt - tLauf0;
    if (t < blitzBis) return;                                         // Blitzer-Sperre
    if (jetzt - letzterTipp < R.TAP_ABSTAND_MS) return;               // schneller als ein Mensch tippt: zählt nicht
    letzterTipp = jetzt;
    v = tipp(v);
    if (lage(t).phase === "spurt") {
      tippsSpurt++;
      if (v > maxV) maxV = v;
    }
    // Blitzer sofort prüfen (nicht erst im nächsten Bild)
    const l = lage(t);
    if (l.phase === "lern" && l.blitzerAktiv && blitzer(v, l.limit)) blitzerAusloesen(t);
    setZahl(v);
  }

  function beenden() {
    stopTimer(); nr++;
    zustand = "fertig"; anleitungZeigen();
    padSperreBis = performance.now() + 1500;
    const wert = Math.round(maxV);
    ergebnisDaten = { wert: wert, tipps: tippsSpurt, blitzer: blitzerAnzahl };
    setZahl(maxV); setRest(0); leisteSetzen(1, true);
    wegSchild(null, 0); blitzEl.classList.remove("an");
    setMeldung("");
    setPad("start", k.tx("nochmal"));
    ergId++;
    zeichneErgebnis();
    speichern(wert, tippsSpurt);
  }

  /* ---- Ergebnis ---- */
  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    ergebnis.hidden = false;
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("tempoBestwert")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + " <span>km/h</span></div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<ul class="sp-t-zahlen">' +
          "<li><span>" + k.esc(k.tx("tempoErgTipps")) + '</span><b dir="ltr">' + e.tipps + "</b></li>" +
          "<li><span>" + k.esc(k.tx("tempoErgBlitzer")) + '</span><b dir="ltr">' + e.blitzer + "</b></li>" +
        "</ul>" +
        '<p class="admin-sub sp-hinweis-strasse">' + k.esc(k.tx("tempoHinweis")) + "</p>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }
  function speichern(wert, tipps) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: wert, tipps: tipps }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("tempoNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("tempoBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + " km/h</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.tempo = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  /* ---- Eingaben ---- */
  function antippen() {
    const jetzt = performance.now();
    if (zustand === "bereit" || zustand === "fertig") {
      if (zustand === "fertig" && jetzt < padSperreBis) return;       // wildes Weitertippen nach dem Ende startet keine neue Runde
      starteRunde(); return;
    }
    if (zustand === "lauf") antippenTempo();
  }
  pad.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    antippen();
  });
  pad.addEventListener("keydown", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    tastenSperre = performance.now() + 400;   // der Klick, den Tastatur/Screenreader danach auslösen, zählt nicht doppelt
    antippen();
  });
  pad.addEventListener("click", function (e) {
    if (e.detail !== 0 || performance.now() < tastenSperre) return;   // nur Klicks ohne Zeiger (z. B. Screenreader)
    antippen();
  });
  pad.addEventListener("contextmenu", function (e) { e.preventDefault(); });   // langes Drücken öffnet kein Menü
  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und von vorn
  function sichtbarkeit() {
    if (document.hidden && imSpiel()) { stopTimer(); nr++; bereitMachen(); }
  }
  document.addEventListener("visibilitychange", sichtbarkeit);

  bereitMachen();
  // Querformat am Handy: die Bühne liegt sonst teils unter der Menüleiste -- gleich ins Bild holen
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      stopTimer(); nr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
