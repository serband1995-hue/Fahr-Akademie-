/* Spiel 1: Ampel-Bremsweg (06.10.2026).
   Fünf Lichter gehen nacheinander an, nach einer zufälligen Wartezeit alle aus -- dann so schnell wie möglich
   bremsen. Aus der Reaktionszeit und der gewählten Geschwindigkeit entsteht der Anhalteweg.

   Rechnung (Fahrschul-Faustformeln, trockene Straße):
     Reaktionsweg  = (v / 10) * 3          ≈ 1 Sekunde Reaktionszeit im echten Verkehr
     Bremsweg      = (v / 10)²             Normalbremsung
     Anhalteweg    = Reaktionsweg + Bremsweg
     bei Nässe     = Bremsweg etwa doppelt
   "Dein Anhalteweg" nimmt statt der Faustformel-Sekunde die gemessene Reaktionszeit (v / 3,6 * Zeit):
   Handy-Reaktionen sind kürzer als im Verkehr, deshalb steht die Faustformel als „Auf der Straße“ daneben.

   Ranking: schnellste Reaktion (ms). Der Server startet jede Runde und prüft das Ergebnis
   (Grenzen 120–1500 ms, Mindestdauer, einmal einlösbar) -- siehe werkzeuge/edge-functions/academy-spiele.ts.
   Die Zeiten hier (Licht-Abstand, Mindest-Wartezeit) und im Server (vorlauf_ms 4600 = 5 x 800 + 600) gehören zusammen. */
import { rankingKarte, profilKarte } from "./rahmen.js";

const TEMPI = [30, 50, 100];
const LICHT_ABSTAND = 800;            // ms zwischen den fünf Lichtern
const HALTE_MIN = 600;                // kürzeste Wartezeit nach dem 5. Licht (Server: vorlauf_ms rechnet damit)
const HALTE_SPANNE = 2000;            // dazu zufällig 0–2 s
const MIN_MS = 120, MAX_MS = 1500;    // wie im Server: darunter Fehlstart, darüber zu langsam
const START_ZEITLIMIT = 6000;         // dauert der Rundenstart beim Server länger: ohne Speichern weiterspielen

/* Reine Rechnung (ohne Bildschirm), damit sie sich prüfen lässt. v in km/h, ms = Reaktionszeit */
export function wege(v, ms) {
  const brems = Math.pow(v / 10, 2);
  const strasseR = (v / 10) * 3;
  const deinR = (v / 3.6) * (ms / 1000);
  return {
    deinR: deinR, brems: brems, dein: deinR + brems,
    strasseR: strasseR, strasse: strasseR + brems,
    nassBrems: brems * 2, nass: strasseR + brems * 2
  };
}

export function starte(platz, k) {
  let tempo = TEMPI[1];
  let zustand = "bereit";       // bereit | start | licht | go | fertig
  let timer = [];
  let t0 = null;                // Zeitpunkt, an dem die Lichter ausgingen
  let runde = null;             // Runden-ID vom Server; null = nichts wird gespeichert
  let letzteMs = null;
  let speicherInfo = "";        // HTML unter dem Ergebnis (Platz / Bestzeit / Hinweis)
  let sperreBis = 0;            // kurz nach dem Start zählt ein Zweittipp nicht als Fehlstart
  let nr = 0;                   // Rundenzähler: späte Antworten alter Runden werden verworfen
  let ergId = 0;                // zählt Ergebnisse: eine späte Speicher-Antwort darf ein neueres nicht überschreiben

  platz.innerHTML =
    '<div class="sp-ampel">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("ampelName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-tempo-karte">' +
        '<div class="sp-label" id="sp-tempo-label">' + k.esc(k.tx("speed")) + "</div>" +
        '<div class="sp-tempo" role="radiogroup" aria-labelledby="sp-tempo-label">' +
          TEMPI.map(function (v) {
            return '<button type="button" role="radio" class="sp-tempo-knopf" data-tempo="' + v + '" aria-checked="' + (v === tempo ? "true" : "false") + '"><span dir="ltr">' + v + " km/h</span></button>";
          }).join("") +
        "</div>" +
      "</div>" +
      '<div class="karte sp-buehne">' +
        '<div class="sp-gantry" aria-hidden="true">' +
          '<span class="sp-licht"></span><span class="sp-licht"></span><span class="sp-licht"></span><span class="sp-licht"></span><span class="sp-licht"></span>' +
        "</div>" +
        '<div class="sp-status" role="status" aria-live="polite"></div>' +
        '<button type="button" class="sp-knopf start"></button>' +
      "</div>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const lichter = Array.prototype.slice.call(platz.querySelectorAll(".sp-licht"));
  const gantry = platz.querySelector(".sp-gantry");
  const status = platz.querySelector(".sp-status");
  const knopf = platz.querySelector(".sp-knopf");
  const ergebnis = platz.querySelector(".sp-ergebnis");
  const tempoKnoepfe = Array.prototype.slice.call(platz.querySelectorAll(".sp-tempo-knopf"));
  const rank = rankingKarte(k, "ampel", "ms", platz.querySelector(".sp-rank-platz"));
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  /* ---- Anzeige ---- */
  function setStatus(schluessel, art) {
    status.textContent = k.tx(schluessel);
    status.className = "sp-status" + (art ? " " + art : "");
  }
  function setKnopf(art, text) {
    knopf.className = "sp-knopf " + art;
    knopf.textContent = text;
  }
  function lichterAus() { lichter.forEach(function (l) { l.classList.remove("an"); }); gantry.classList.remove("frei"); }
  function stopTimer() { timer.forEach(clearTimeout); timer = []; }
  function inRunde() { return zustand === "start" || zustand === "licht" || zustand === "go"; }
  function tempoSperre() { tempoKnoepfe.forEach(function (b) { b.disabled = inRunde(); }); }
  function bereitMachen() {
    zustand = "bereit"; lichterAus(); tempoSperre();
    setStatus("bereit"); setKnopf("start", k.tx("start"));
  }

  /* ---- Ablauf einer Runde ---- */
  function starteRunde() {
    const meine = ++nr;
    zustand = "start"; runde = null; letzteMs = null; speicherInfo = ""; ergId++;
    ergebnis.hidden = true; ergebnis.innerHTML = "";
    lichterAus(); tempoSperre();
    setStatus("warte"); setKnopf("bremse", "…");
    sperreBis = performance.now() + 400;
    // Knopf ins Bild holen, falls er (z. B. im Querformat) unter der Menüleiste liegt
    const rc = knopf.getBoundingClientRect();
    if (rc.top < 0 || rc.bottom > window.innerHeight - 90) knopf.scrollIntoView({ block: "center" });
    // Die Runde beim Server anmelden, BEVOR die Lichter laufen: dann ist die Serverzeit nie kürzer als die Spielzeit.
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "ampel" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, START_ZEITLIMIT)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== nr || zustand !== "start") return;
      runde = r;
      lichterLaufen();
    });
  }

  function lichterLaufen() {
    zustand = "licht";
    setStatus("warte"); setKnopf("bremse", k.tx("bremsen"));
    for (let i = 0; i < lichter.length; i++) {
      timer.push(setTimeout(function () { lichter[i].classList.add("an"); }, (i + 1) * LICHT_ABSTAND));
    }
    const halte = HALTE_MIN + Math.random() * HALTE_SPANNE;
    timer.push(setTimeout(los, lichter.length * LICHT_ABSTAND + halte));
  }

  function los() {
    zustand = "go"; t0 = null;
    lichterAus(); gantry.classList.add("frei");
    setStatus("jetzt", "go");
    // Die Zeit läuft ab dem Bild, in dem die Lichter wirklich aus sind (nicht ab dem Befehl dazu)
    requestAnimationFrame(function () { if (zustand === "go") t0 = performance.now(); });
    timer.push(setTimeout(zuLangsam, MAX_MS + 150));
  }

  function fehlstart() {
    stopTimer(); nr++;
    zustand = "fertig"; lichterAus(); tempoSperre();
    setStatus("fehlstart", "warn"); setKnopf("start", k.tx("nochmal"));
  }

  function zuLangsam() {
    stopTimer(); nr++;
    zustand = "fertig"; tempoSperre();
    setStatus("zuLangsam", "warn"); setKnopf("start", k.tx("nochmal"));
  }

  function bremse(zeitstempel) {
    if (t0 == null) { fehlstart(); return; }   // vor dem ersten Bild nach "aus": unmöglich schnell
    const jetzt = performance.now();
    // event.timeStamp ist bei modernen Browsern auf derselben Uhr wie performance.now(); ältere liefern Epoche -> dann jetzt
    const zeit = (typeof zeitstempel === "number" && zeitstempel > 0 && zeitstempel < 1e11) ? zeitstempel : jetzt;
    let ms = Math.round(zeit - t0);
    if (!(ms >= 0 && ms < 10000)) ms = Math.round(jetzt - t0);
    if (ms < MIN_MS) { fehlstart(); return; }
    if (ms > MAX_MS) { zuLangsam(); return; }
    stopTimer();
    zustand = "fertig"; tempoSperre();
    letzteMs = ms;
    setStatus("bereit"); setKnopf("start", k.tx("nochmal"));
    ergId++;
    zeichneErgebnis();
    speichern(ms);
  }

  /* ---- Ergebnis zeichnen ---- */
  function balken(titel, sub, w, rW, bW, maxW) {
    const rP = Math.max(1, Math.round((rW / maxW) * 100)), bP = Math.max(1, Math.round((bW / maxW) * 100));
    return '<div class="sp-bz"><div class="sp-bz-kopf"><span class="sp-bz-text"><b>' + k.esc(titel) + "</b>" +
        (sub ? "<small>" + k.esc(sub) + "</small>" : "") + "</span>" +
        '<span class="sp-bz-wert" dir="ltr">' + k.zahl(w, 1) + " m</span></div>" +
      '<div class="sp-bz-balken" dir="ltr"><i class="r" style="width:' + rP + '%"></i><i class="b" style="width:' + bP + '%"></i></div></div>';
  }

  function zeichneErgebnis() {
    if (letzteMs == null) return;
    const w = wege(tempo, letzteMs);
    ergebnis.hidden = false;
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("deineReaktion")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + letzteMs + " <span>ms</span></div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<div class="sp-bz-liste">' +
          balken(k.tx("ergDein"), k.tx("ergDeinSub"), w.dein, w.deinR, w.brems, w.nass) +
          balken(k.tx("ergStrasse"), k.tx("ergStrasseSub"), w.strasse, w.strasseR, w.brems, w.nass) +
          balken(k.tx("ergNass"), "", w.nass, w.strasseR, w.nassBrems, w.nass) +
        "</div>" +
        '<div class="sp-legende"><span><i class="sp-chip r"></i>' + k.esc(k.tx("legReaktion")) + "</span>" +
          '<span><i class="sp-chip b"></i>' + k.esc(k.tx("legBrems")) + "</span></div>" +
        '<p class="admin-sub sp-hinweis-strasse">' + k.esc(k.tx("hinweisStrasse")) + "</p>" +
      "</div>";
  }

  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }

  function speichern(ms) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: ms }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;   // inzwischen neue Runde / Seite verlassen
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("neuerRekord")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("bestzeit")) + ': <b dir="ltr">' + k.esc(d.bestwert) + " ms</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.ampel = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  /* ---- Eingaben ---- */
  function antippen(zeitstempel) {
    if (zustand === "bereit" || zustand === "fertig") { starteRunde(); return; }
    if (zustand === "licht") { if (performance.now() >= sperreBis) fehlstart(); return; }
    if (zustand === "go") { bremse(zeitstempel); }
  }
  let tastenSperre = 0;
  knopf.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    antippen(e.timeStamp);
  });
  knopf.addEventListener("keydown", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    tastenSperre = performance.now() + 400;   // der Klick, den Tastatur/Screenreader danach noch auslösen, zählt nicht doppelt
    antippen(e.timeStamp);
  });
  knopf.addEventListener("click", function (e) {
    if (e.detail !== 0 || performance.now() < tastenSperre) return;   // nur Klicks ohne Zeiger (z. B. Screenreader)
    antippen(performance.now());
  });
  tempoKnoepfe.forEach(function (b) {
    b.addEventListener("click", function () {
      if (inRunde()) return;
      tempo = parseInt(b.dataset.tempo, 10);
      tempoKnoepfe.forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
      zeichneErgebnis();   // gleiche Reaktion, neues Tempo: Strecken sofort neu
    });
  });
  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und von vorn
  function sichtbarkeit() {
    if (document.hidden && inRunde()) { stopTimer(); nr++; bereitMachen(); }
  }
  document.addEventListener("visibilitychange", sichtbarkeit);

  bereitMachen();
  // Querformat am Handy: die Bühne liegt sonst teils unter der Menüleiste -- gleich in die Mitte holen
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) {
    requestAnimationFrame(function () { platz.querySelector(".sp-buehne").scrollIntoView({ block: "center" }); });
  }

  return {
    zerstoeren: function () {
      stopTimer(); nr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
