/* Spiel 3: Schilder-Memory (Familie D: einzeln).
   12 Karten (3 x 4): 6 Verkehrsschilder und die 6 passenden Bedeutungen, verdeckt gemischt. Man deckt zwei Karten auf;
   ein Schild und seine Bedeutung gehören zusammen. Nach jedem Treffer erscheint eine Karte mit dem Schild, seiner
   Nummer und einer kurzen Erklärung nach StVO (das ist der Lerneffekt), die Uhr steht solange.
   Pro Spiel werden 6 von 14 gängigen Schildern gezogen (Liste SCHILDER).

   Ranking: Zeit in Millisekunden (kleiner ist besser), nur die Zeit mit laufender Uhr (ohne das Lesen der Erklärungen).
   Der Server startet jede Runde und prüft das Ergebnis (zuege = 6 + fehler, Mindestzeit je Zug, einmal einlösbar);
   siehe werkzeuge/edge-functions/academy-spiele.ts, Eintrag „memory“. Die Zahlen PAARE und ZUG_MIN_MS gehören zusammen.

   Aufräumen: Zeitgeber und Listener werden in zerstoeren() entfernt; wer die App verlässt (Seite unsichtbar), bricht die
   Runde ab, wie bei den anderen Spielen. */
import { rankingKarte, profilKarte } from "./rahmen.js";
import { schildBild } from "./schilder.js";

/* Die Schilder: id (= Bildname in schilder.js, = Textschlüssel z…l / z…m), amtliche Nummer fürs Popup */
export const SCHILDER = [
  { id: "z205", nr: "205" }, { id: "z206", nr: "206" }, { id: "z306", nr: "306" }, { id: "z274", nr: "274", zahl: 50 },
  { id: "z2741", nr: "274.1" }, { id: "z267", nr: "267" }, { id: "z283", nr: "283" }, { id: "z286", nr: "286" },
  { id: "z250", nr: "250" }, { id: "z220", nr: "220" }, { id: "z101", nr: "101" }, { id: "z237", nr: "237" },
  { id: "z350", nr: "350" }, { id: "z215", nr: "215" }
];
export const PAARE = 6;
export const ZURUECK_MS = 900;      // so lange bleiben zwei falsche Karten sichtbar, dann drehen sie sich zurück
export const ZUG_MIN_MS = 100;      // kürzeste Zeit für einen Zug (zwei Tipps) – der Server rechnet damit

/* Reine Teile (ohne Bildschirm), damit sie sich prüfen lassen */
export function mischen(liste, rnd) {
  const z = rnd || Math.random, a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(z() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/* 6 verschiedene Schilder ziehen und daraus 12 Karten machen: je Paar eine Schild-Karte und eine Text-Karte */
export function neueKarten(rnd) {
  const gezogen = mischen(SCHILDER, rnd).slice(0, PAARE);
  const karten = [];
  gezogen.forEach(function (s) { karten.push({ paar: s.id, art: "schild" }); karten.push({ paar: s.id, art: "text" }); });
  return mischen(karten, rnd).map(function (c, i) { return { i: i, paar: c.paar, art: c.art, offen: false, gefunden: false }; });
}
export function passen(a, b) { return a !== b && a.paar === b.paar && a.art !== b.art; }
export function zeitText(k, ms) { return k.zahl(ms / 1000, 1) + " s"; }

export function starte(platz, k) {
  let zustand = "bereit";          // bereit | start | lauf | popup | fertig
  let karten = [];
  let offen = [];                  // gerade aufgedeckt (0–2 Karten)
  let sperre = false;              // während zwei falsche Karten zu sehen sind
  let timer = [];
  let raf = 0;
  let runde = null;                // Runden-ID vom Server; null = nichts wird gespeichert
  let nr = 0, ergId = 0;
  let zuege = 0, fehler = 0, gefunden = 0;
  let summe = 0, segStart = null;  // laufende Zeit in ms ohne die Pausen beim Lesen der Erklärungen
  let letzterInhalt = null;        // Schild, dessen Erklärung gerade steht
  let ergebnisDaten = null, speicherInfo = "";
  let tastenSperre = 0;

  platz.innerHTML =
    '<div class="sp-memory">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("memoryName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-m-buehne">' +
        '<div class="sp-m-hud" dir="auto">' +
          '<div><span class="sp-label">' + k.esc(k.tx("memoryZeit")) + '</span><b class="sp-m-zeit" dir="ltr">0 s</b></div>' +
          '<div><span class="sp-label">' + k.esc(k.tx("memoryZuege")) + '</span><b class="sp-m-zuege" dir="ltr">0</b></div>' +
          '<div><span class="sp-label">' + k.esc(k.tx("memoryFehlversuche")) + '</span><b class="sp-m-fehler" dir="ltr">0</b></div>' +
        "</div>" +
        '<div class="sp-m-paare" role="status" aria-live="polite"></div>' +
        '<div class="sp-m-brett"><div class="sp-m-feld"></div><button type="button" class="sp-m-knopf start"></button></div>' +
        '<div class="sp-m-popup" role="dialog" hidden></div>' +
      "</div>" +
      '<p class="admin-sub sp-m-anleitung">' + k.esc(k.tx("memoryBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const zeitEl = platz.querySelector(".sp-m-zeit"), zuegeEl = platz.querySelector(".sp-m-zuege"), fehlerEl = platz.querySelector(".sp-m-fehler");
  const paareEl = platz.querySelector(".sp-m-paare");
  const feld = platz.querySelector(".sp-m-feld"), popup = platz.querySelector(".sp-m-popup");
  const knopf = platz.querySelector(".sp-m-knopf");
  const anleitung = platz.querySelector(".sp-m-anleitung");
  const ergebnis = platz.querySelector(".sp-ergebnis");
  const format = function (ms) { return zeitText(k, ms); };
  const rank = rankingKarte(k, "memory", "s", platz.querySelector(".sp-rank-platz"), format);
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  /* ---- Uhr: läuft nur zwischen erstem Aufdecken und letztem Treffer, steht beim Lesen der Erklärung ---- */
  function aktivMs() { return summe + (segStart == null ? 0 : performance.now() - segStart); }
  function uhrStart() { if (segStart == null) segStart = performance.now(); if (!raf) raf = requestAnimationFrame(uhrBild); }
  function uhrPause() { if (segStart != null) { summe += performance.now() - segStart; segStart = null; } }
  function uhrBild() { raf = 0; zeitEl.textContent = zeitText(k, aktivMs()); if (segStart != null) raf = requestAnimationFrame(uhrBild); }
  function stopTimer() { timer.forEach(clearTimeout); timer = []; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function imSpiel() { return zustand === "start" || zustand === "lauf" || zustand === "popup"; }
  function anleitungZeigen() { anleitung.hidden = imSpiel(); }
  function hudSetzen() {
    zeitEl.textContent = zeitText(k, aktivMs()); zuegeEl.textContent = String(zuege); fehlerEl.textContent = String(fehler);
    paareEl.textContent = k.tx("memoryPaare", { n: gefunden, m: PAARE });
  }

  /* ---- Brett ---- */
  function kartenZeichnen() {
    feld.innerHTML = "";
    karten.forEach(function (c) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "sp-m-karte"; b.dataset.i = String(c.i); b.dataset.paar = c.paar; b.dataset.art = c.art;
      const s = SCHILDER.find(function (x) { return x.id === c.paar; });
      const front = c.art === "schild"
        ? '<span class="sp-m-front sp-m-schild">' + schildBild(c.paar, { beschriftung: k.esc(k.tx("memoryDasSchild")), zahl: s && s.zahl }) + "</span>"
        : '<span class="sp-m-front sp-m-text" dir="auto">' + k.esc(k.tx(c.paar + "l")) + "</span>";
      b.innerHTML = '<span class="sp-m-back" aria-hidden="true"><i>?</i></span>' + front;
      b.setAttribute("aria-label", k.tx("memoryKarteZu", { n: c.i + 1 }));
      feld.appendChild(b);
    });
  }
  function karteEl(c) { return feld.children[c.i]; }
  function zeigen(c, an) {
    const e = karteEl(c);
    e.classList.toggle("offen", an);
    if (an) e.setAttribute("aria-label", c.art === "schild" ? k.tx("memoryDasSchild") : k.tx(c.paar + "l")); else e.setAttribute("aria-label", k.tx("memoryKarteZu", { n: c.i + 1 }));
  }
  function bereitMachen() {
    stopTimer(); nr++;
    zustand = "bereit"; anleitungZeigen();
    karten = neueKarten(); offen = []; sperre = false; zuege = 0; fehler = 0; gefunden = 0; summe = 0; segStart = null;
    popup.hidden = true; popup.innerHTML = "";
    feld.classList.add("aus");
    kartenZeichnen(); hudSetzen();
    knopf.className = "sp-m-knopf start"; knopf.textContent = k.tx("start");
  }
  function buehneInsBild() {
    try { platz.querySelector(".sp-m-buehne").scrollIntoView({ block: "start" }); } catch (e) {}
  }

  /* ---- Ablauf ---- */
  function starteRunde() {
    bereitMachen();
    const meine = ++nr;
    zustand = "start"; anleitungZeigen(); ergId++; runde = null; ergebnis.hidden = true; ergebnis.innerHTML = ""; ergebnisDaten = null; speicherInfo = "";
    knopf.className = "sp-m-knopf warte"; knopf.textContent = "…";
    buehneInsBild();
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "memory" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== nr || zustand !== "start") return;
      runde = r;
      zustand = "lauf"; feld.classList.remove("aus");
      knopf.hidden = true;
    });
  }

  function aufdecken(c) {
    if (zustand !== "lauf" || sperre || c.offen || c.gefunden || offen.length >= 2) return;
    uhrStart();
    c.offen = true; offen.push(c); zeigen(c, true);
    if (offen.length < 2) return;
    zuege++;
    const a = offen[0], b = offen[1];
    if (passen(a, b)) { treffer(a, b); return; }
    fehler++; sperre = true; hudSetzen();
    timer.push(setTimeout(function () {
      [a, b].forEach(function (x) { x.offen = false; zeigen(x, false); });
      offen = []; sperre = false;
    }, ZURUECK_MS));
  }

  function treffer(a, b) {
    a.gefunden = b.gefunden = true; gefunden++;
    [a, b].forEach(function (x) { karteEl(x).classList.add("gefunden"); karteEl(x).disabled = true; });
    offen = [];
    uhrPause(); hudSetzen();
    const fertig = gefunden >= PAARE;
    let wert = 0;
    if (fertig) {
      wert = Math.max(1, Math.round(summe));
      ergebnisDaten = { wert: wert, zuege: zuege, fehler: fehler };
      ergId++; speichern(wert, zuege, fehler);
    }
    erklaerungZeigen(a.paar, fertig);
  }

  /* Karte mit Schild, Nummer, Name und Erklärung; die Uhr steht. Weiter per Knopf. */
  function erklaerungZeigen(id, letzte) {
    zustand = "popup"; letzterInhalt = id;
    const s = SCHILDER.find(function (x) { return x.id === id; });
    popup.innerHTML =
      '<div class="sp-m-pop-kopf"><span class="sp-badge neu">' + k.esc(k.tx("memoryTreffer")) + "</span></div>" +
      '<div class="sp-m-pop-schild">' + schildBild(id, { beschriftung: k.esc(k.tx(id + "l")), zahl: s && s.zahl }) + "</div>" +
      '<div class="sp-m-pop-nr" dir="auto">' + k.esc(k.tx("memoryZeichen", { n: s ? s.nr : "" })) + "</div>" +
      '<div class="sp-m-pop-name" dir="auto">' + k.esc(k.tx(id + "l")) + "</div>" +
      '<p class="sp-m-pop-text" dir="auto">' + k.esc(k.tx(id + "m")) + "</p>" +
      '<button type="button" class="sp-m-weiter">' + k.esc(letzte ? (k.tx("memoryGeschafft")) : k.tx("memoryWeiter")) + "</button>";
    popup.hidden = false;
    popup.setAttribute("aria-label", k.tx(id + "l"));
    const w = popup.querySelector(".sp-m-weiter");
    w.addEventListener("click", function () { weiter(letzte); });
    try { w.focus({ preventScroll: true }); } catch (e) {}
  }
  function weiter(letzte) {
    if (zustand !== "popup") return;
    popup.hidden = true; popup.innerHTML = "";
    if (letzte) { beenden(); return; }
    zustand = "lauf";
    uhrStart();   // Die Uhr steht nur WÄHREND der Erklärung. Sofort danach läuft sie weiter (sonst wäre Nachdenken gratis).
  }

  function beenden() {
    stopTimer(); nr++;
    zustand = "fertig"; anleitungZeigen();
    feld.classList.add("aus");
    knopf.hidden = false; knopf.className = "sp-m-knopf start"; knopf.textContent = k.tx("nochmal");
    zeichneErgebnis();
  }

  /* ---- Ergebnis ---- */
  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    ergebnis.hidden = false;
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("memoryZeit")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + k.esc(zeitText(k, e.wert)) + "</div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<ul class="sp-t-zahlen">' +
          "<li><span>" + k.esc(k.tx("memoryZuege")) + '</span><b dir="ltr">' + e.zuege + "</b></li>" +
          "<li><span>" + k.esc(k.tx("memoryFehlversuche")) + '</span><b dir="ltr">' + e.fehler + "</b></li>" +
        "</ul>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }
  function speichern(wert, z, f) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: wert, zuege: z, fehler: f }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("neuerRekord")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("bestzeit")) + ': <b dir="ltr">' + k.esc(zeitText(k, d.bestwert)) + "</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.memory = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  /* ---- Eingaben ---- */
  feld.addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest(".sp-m-karte") : null;
    if (!b) return;
    const c = karten[parseInt(b.dataset.i, 10)];
    if (c) aufdecken(c);
  });
  knopf.addEventListener("click", function () {
    if (zustand === "bereit" || zustand === "fertig") { knopf.hidden = false; starteRunde(); }
  });
  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und neu mischen
  function sichtbarkeit() {
    if (document.hidden && imSpiel()) { knopf.hidden = false; bereitMachen(); }
  }
  document.addEventListener("visibilitychange", sichtbarkeit);

  bereitMachen();
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      stopTimer(); nr++; zustand = "bereit";
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
