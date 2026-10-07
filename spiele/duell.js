/* Spiel 10: Duell gegen Mitschüler (Familie B: Szene + Auswahl, asynchron).
   Zwei Schüler bekommen dieselben 8 Verkehrsfragen (je 3 Antworten, genau eine richtig) und spielen sie NICHT gleichzeitig:
   A legt ein Duell an und spielt sofort; danach wartet es offen. B sieht A als „Offene Herausforderung“ (nur Vorname + 1 Buchstabe),
   nimmt an und spielt dieselben Fragen. Wer mehr Punkte hat, gewinnt. A sieht das Ergebnis beim nächsten Öffnen unter „Deine Duelle“.

   Was wo liegt (und warum):
   - Die Fragen (Text, Antworten, Erklärung in 18 Sprachen) stehen in spiele/duell-fragen.js, die RICHTIGE Antwort nicht. Sie kennt nur der Server.
   - Der Server (academy-spiele.ts, Aktionen duell_*) zieht die 8 Fragen, startet die Uhr beim ersten Start (die Runde zählt einmal; nach einem Netzfehler
     darf dieselbe offene Runde mit denselben Fragen und derselben Uhr weitergespielt werden: Knopf „Weiterspielen“), rechnet die Punkte aus
     den abgegebenen Antworten und Zeiten selbst und schickt erst NACH der Auswertung die Lösungen. Erklärungen zeigt das Spiel daher erst im Ergebnis.
   - Punkte je Frage: richtig 100 + Tempo-Bonus bis 50 (linear über 10 s), falsch/keine Antwort 0. Dieselben Zahlen stehen im Server (REGELN unten;
     werkzeuge/pruefe-duell.mjs vergleicht beides).
   Ranking-Bestwerte (academy_spiele_bestwerte) werden NICHT benutzt: das Spiel zeigt Siege/Unentschieden/Niederlagen und die Duell-Listen.

   Texte: spiele/texte-duell.js (Präfix du), eigene CSS: spiele/duell.css (lädt dieses Modul selbst). */
import { profilKarte } from "./rahmen.js";
import { schildBild, schilderVorladen } from "./schilder.js";
import { TEXTE_DUELL } from "./texte-duell.js";
import { FRAGEN_NACH_ID } from "./duell-fragen.js";

export const REGELN = { FRAGEN: 8, LIMIT_MS: 20000, BONUS_MS: 10000, PUNKTE_RICHTIG: 100, BONUS_MAX: 50, MIN_MS: 700, MAX_LAUFEND: 3, WEITER_MS: 450 };

/* Punkte einer Frage (gleiche Rechnung wie duellPunkte() im Server) */
export function punkteFuer(richtig, ms) {
  if (!richtig) return 0;
  const eff = Math.max(ms, REGELN.MIN_MS);
  return REGELN.PUNKTE_RICHTIG + Math.floor(REGELN.BONUS_MAX * Math.max(0, 1 - eff / REGELN.BONUS_MS));
}

/* Fehlercodes des Servers, bei denen ein erneutes Senden nichts ändert */
const ENDGUELTIG = ["duell_schon_gespielt", "duell_verfallen", "duell_unbekannt", "runde_abgelaufen", "ergebnis_ungueltig", "zeit_unmoeglich", "zu_schnell", "duell_nicht_gestartet", "eingabe_fehlt"];

let cssVersprechen = null;
function cssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-duell-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = new URL("./duell.css", import.meta.url).href;
      l.setAttribute("data-duell-css", "");
      l.onload = fertig; l.onerror = fertig;
      document.head.appendChild(l);
      setTimeout(fertig, 2500);
    } catch (e) { fertig(); }
  });
  return cssVersprechen;
}

export function starte(platz, k) {
  let weg = false;
  let ansicht = "hub";                 // hub | bereit | frage | senden | ergebnis
  let nr = 0;                          // zählt Bildschirmwechsel: späte Antworten alter Aufrufe werden verworfen
  let beschaeftigt = false;            // genau ein Server-Aufruf zur Zeit (Doppeltipp)
  let raf = 0, zeitgeber = [];
  let lauf = null;                     // { duell, fragen:[id], i, antworten:[{a,ms}], tStart }
  let letztesErgebnis = null;

  /* eigener Text: erst texte-duell.js, dann der gemeinsame Rahmen (laden, fehler, du …) */
  function T(schluessel, werte) {
    const roh = (TEXTE_DUELL[k.sprache] && TEXTE_DUELL[k.sprache][schluessel]) || (TEXTE_DUELL.de && TEXTE_DUELL.de[schluessel]);
    if (roh === undefined) return k.tx(schluessel, werte);
    if (!werte) return roh;
    return Object.keys(werte).reduce(function (s, n) { return s.split("{" + n + "}").join(werte[n]); }, roh);
  }
  const E = k.esc;

  function raeumeAuf() {
    zeitgeber.forEach(clearTimeout); zeitgeber = [];
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  function lebt() { return !weg && document.body.contains(platz); }
  function neuerBildschirm(name) { raeumeAuf(); nr++; ansicht = name; return nr; }
  function nachOben() { try { platz.scrollIntoView({ block: "start" }); } catch (e) {} }

  /* ---------- Übersicht ---------- */
  function ladeHub(meldung) {
    const mein = neuerBildschirm("hub");
    if (k.vorschau) {
      platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + '</h2><p class="admin-sub du-hinweis">' + E(T("duVorschau")) + "</p></div>";
      return;
    }
    if (!platz.querySelector(".du-spiel")) {
      platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + '</h2><div class="admin-sub">' + E(k.tx("laden")) + "</div></div>";
    }
    k.api({ aktion: "duell_uebersicht" }).then(function (d) {
      if (mein !== nr || !lebt()) return;
      zeichneHub(d, meldung);
    }).catch(function () {
      if (mein !== nr || !lebt()) return;
      platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + '</h2><p class="du-fehler" role="alert">' + E(T("duLadenFehler")) + '</p>' +
        '<button type="button" class="du-knopf zweit" data-aktion="hub">' + E(T("duAktualisieren")) + "</button></div>";
    });
  }

  function alter(iso) {
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (min < 1) return T("duJetzt");
    if (min < 60) return T("duVorMin", { n: min });
    if (min < 1440) return T("duVorStd", { n: Math.floor(min / 60) });
    return T("duVorTag", { n: Math.floor(min / 1440) });
  }

  function zeileMeine(e) {
    const gegnerName = e.name || T("duMitschueler");
    const titel = (e.name || e.rolle === "gegner" || e.zustand === "fertig") ? T("duGegen", { name: gegnerName }) : T("duDeinDuell");
    let sub = "", rechts = "", marke = "";
    if (e.zustand === "fertig") {
      marke = '<span class="du-marke ' + (e.ergebnis === "sieg" ? "sieg" : e.ergebnis === "niederlage" ? "niederlage" : "gleich") + '">' +
        E(T(e.ergebnis === "sieg" ? "duSieg" : e.ergebnis === "niederlage" ? "duNiederlage" : "duUnentschieden")) + "</span>";
      sub = '<span dir="ltr">' + E(T("duPunkteZeile", { a: e.punkte_ich, b: e.punkte_gegner })) + "</span>";
    } else {
      sub = E(T({ du_bist_dran: "duStDran", laeuft: "duStLaeuft", wartet_auf_gegner: "duStWartetGegner", gegner_spielt: "duStGegnerSpielt" }[e.zustand] || "duStDran"));
      if (e.zustand === "wartet_auf_gegner" || e.zustand === "gegner_spielt") sub += ' · <span dir="ltr">' + E(T("duPunkteIch", { n: e.punkte_ich })) + "</span>";
      if (e.zustand === "du_bist_dran") rechts = '<button type="button" class="du-klein" data-aktion="spielen" data-id="' + E(e.id) + '">' + E(T("duJetztSpielen")) + "</button>";
      // Runde gestartet, aber nicht abgegeben und noch nicht abgelaufen (z. B. Netzfehler): dieselbe Runde weiterspielen (Server liefert dieselben Fragen, die Uhr läuft weiter)
      if (e.zustand === "laeuft" && e.runde_offen) rechts = '<button type="button" class="du-klein" data-aktion="spielen" data-weiter="1" data-id="' + E(e.id) + '">' + E(T("duWeiterspielen")) + "</button>";
    }
    return '<li class="du-zeile">' +
      '<div class="du-zeile-text">' + marke + '<span class="du-zeile-titel" dir="auto">' + E(titel) + '</span><span class="du-zeile-sub">' + sub + "</span></div>" + rechts + "</li>";
  }

  function zeichneHub(d, meldung) {
    const voll = (d.laufend || 0) >= (d.max_laufend || REGELN.MAX_LAUFEND);
    const meine = d.meine || [], offene = d.offene || [];
    const b = d.bilanz || { siege: 0, unentschieden: 0, niederlagen: 0 };
    let html = '<div class="du-spiel">' +
      '<h2 class="sp-spieltitel">' + E(T("duName")) + "</h2>" +
      '<p class="admin-sub du-hinweis">' + E(T("duIntro")) + "</p>" +
      '<p class="du-fehler" role="alert"' + (meldung ? "" : " hidden") + ">" + E(meldung || "") + "</p>" +
      '<div class="karte du-karte"><h3 class="du-ueberschrift">' + E(T("duBilanz")) + "</h3>" +
        '<div class="du-bilanz">' +
          '<div class="s"><b dir="ltr">' + E(b.siege) + '</b><span class="sp-label">' + E(T("duSiege")) + "</span></div>" +
          '<div><b dir="ltr">' + E(b.unentschieden) + '</b><span class="sp-label">' + E(T("duUnentschieden")) + "</span></div>" +
          '<div class="n"><b dir="ltr">' + E(b.niederlagen) + '</b><span class="sp-label">' + E(T("duNiederlagen")) + "</span></div>" +
        "</div>" +
        '<p class="du-wegweiser">' + E(T("duBilanzFrist")) + "</p></div>" +
      '<div class="karte du-karte">' +
        '<button type="button" class="du-knopf" data-aktion="neu"' + (voll || d.sichtbar === false ? " disabled" : "") + ">" + E(T("duNeu")) + "</button>" +
        '<p class="du-wegweiser">' + E(voll ? T("duLimit", { n: d.max_laufend || REGELN.MAX_LAUFEND }) : d.sichtbar === false ? T("duAusgeblendet") : T("duNeuHinweis")) + "</p></div>" +
      '<div class="karte du-karte"><h3 class="du-ueberschrift">' + E(T("duMeine")) + "</h3>" +
        (meine.length ? '<ul class="du-liste">' + meine.map(zeileMeine).join("") + "</ul>" : '<p class="admin-sub du-hinweis">' + E(T("duMeineLeer")) + "</p>") + "</div>" +
      '<div class="karte du-karte"><h3 class="du-ueberschrift">' + E(T("duOffene")) + "</h3>" +
        (offene.length ? '<ul class="du-liste">' + offene.map(function (o) {
          return '<li class="du-zeile"><div class="du-zeile-text"><span class="du-zeile-titel" dir="auto">' + E(o.name || T("duMitschueler")) + '</span>' +
            '<span class="du-zeile-sub">' + E(alter(o.erstellt_am)) + '</span></div>' +
            '<button type="button" class="du-klein" data-aktion="annehmen" data-id="' + E(o.id) + '"' + (voll ? " disabled" : "") + ">" + E(T("duAnnehmen")) + "</button></li>";
        }).join("") + "</ul>" : '<p class="admin-sub du-hinweis">' + E(T("duOffeneLeer")) + "</p>") +
        '<p class="du-wegweiser">' + E(T("duVerfall")) + "</p></div>" +
      '<button type="button" class="du-knopf zweit" data-aktion="hub">' + E(T("duAktualisieren")) + "</button>" +
      '<div class="du-profil sp-profil-platz"></div>' +
      "</div>";
    platz.innerHTML = html;
    profilKarte(k, platz.querySelector(".du-profil"), function () { if (ansicht === "hub") ladeHub(); });
  }

  /* ---------- Aktionen mit dem Server ---------- */
  function fehlerText(code) {
    return T({
      duell_zu_viele: "duLimitKurz", duell_ausgeblendet: "duAusgeblendet", zu_viele_runden: "duFehlerRate",
      duell_vergeben: "duFehlerVergeben", duell_verfallen: "duFehlerVerfallen", duell_unbekannt: "duFehlerVerfallen",
      duell_schon_gespielt: "duSchonGespielt", eigenes_duell: "duFehlerVergeben"
    }[code] || "duFehlerAllgemein");
  }
  function aufruf(body, ok, bei) {
    if (beschaeftigt) return;
    beschaeftigt = true;
    k.api(body).then(function (d) { beschaeftigt = false; if (lebt()) ok(d); })
      .catch(function (e) { beschaeftigt = false; if (lebt()) bei(String((e && e.message) || "fehler")); });
  }
  function neuesDuell() {
    aufruf({ aktion: "duell_neu" }, function (d) { zeigeBereit(d.duell, null); },
      function (code) { ladeHub(fehlerText(code)); });
  }
  function annehmen(id) {
    aufruf({ aktion: "duell_annehmen", duell: id }, function (d) { zeigeBereit(d.duell, d.name || null); },
      function (code) { ladeHub(fehlerText(code)); });
  }

  /* ---------- Bereit ---------- */
  function zeigeBereit(duell, gegnerName, fehler, weiter) {
    neuerBildschirm("bereit");
    platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + "</h2>" +
      '<div class="karte du-karte du-bereit"><h3 class="du-ueberschrift">' + E(T("duBereitTitel")) + "</h3>" +
        (gegnerName ? '<p class="du-zeile-titel" dir="auto">' + E(T("duGegen", { name: gegnerName })) + "</p>" : "") +
        '<p class="du-hinweis">' + E(T(weiter ? "duWeiterText" : "duBereitText")) + "</p>" +
        '<p class="du-fehler" role="alert"' + (fehler ? "" : " hidden") + ">" + E(fehler || "") + "</p>" +
        '<button type="button" class="du-knopf" data-aktion="los" data-id="' + E(duell) + '">' + E(T(weiter ? "duWeiterspielen" : "duLos")) + "</button>" +
        '<button type="button" class="du-knopf zweit" data-aktion="hub">' + E(T("duZurueck")) + "</button>" +
      "</div></div>";
    nachOben();
  }
  function los(duell) {
    aufruf({ aktion: "duell_start", duell: duell }, function (d) {
      const ids = Array.isArray(d.fragen) ? d.fragen.slice(0, REGELN.FRAGEN) : [];
      lauf = { duell: duell, fragen: ids, i: 0, antworten: [], tStart: 0 };
      schilderVorladen(ids.map(function (id) { return FRAGEN_NACH_ID[id] && FRAGEN_NACH_ID[id].bild; }).filter(Boolean).map(function (s) { return s + ".svg"; }));
      zeigeFrage();
    }, function (code) { ladeHub(fehlerText(code)); });
  }

  /* ---------- Frage ---------- */
  function frageText(id) { const q = FRAGEN_NACH_ID[id]; return q ? (q.t[k.sprache] || q.t.de) : null; }

  function zeigeFrage() {
    const mein = neuerBildschirm("frage");
    const i = lauf.i, id = lauf.fragen[i], q = FRAGEN_NACH_ID[id], t = frageText(id);
    if (!q || !t) {                                    // unbekannte Frage (Pool und Server auseinander): überspringen, zählt 0 Punkte
      lauf.antworten.push({ a: null, ms: REGELN.LIMIT_MS });
      return naechste();
    }
    platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + "</h2>" +
      '<div class="karte du-buehne">' +
        '<div class="du-kopf" dir="auto"><span role="status" aria-live="polite">' + E(T("duFrage", { n: i + 1, m: REGELN.FRAGEN })) + "</span></div>" +
        '<div class="du-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="du-vorn">' +
          (q.bild ? '<div class="du-schild" role="img" aria-label="' + E(T("duZeichenAlt")) + '">' + schildBild(q.bild, {}) + "</div>" : "") +
          '<p class="du-frage" dir="auto">' + E(t.f) + "</p>" +
        "</div>" +
        '<div class="du-antworten">' + t.a.map(function (a, n) {
          return '<button type="button" class="du-antwort" data-aktion="antwort" data-n="' + n + '" dir="auto">' + E(a) + "</button>";
        }).join("") + "</div>" +
      "</div></div>";
    if (i === 0) { try { platz.querySelector(".du-buehne").scrollIntoView({ block: "start" }); } catch (e) {} }
    const leiste = platz.querySelector(".du-leiste i");
    lauf.tStart = performance.now();
    const meineFrage = i;
    function bild() {
      raf = 0;
      if (ansicht !== "frage" || mein !== nr || meineFrage !== lauf.i) return;
      const t0 = performance.now() - lauf.tStart;
      const rest = Math.max(0, 1 - t0 / REGELN.LIMIT_MS);
      leiste.style.width = rest * 100 + "%";
      leiste.className = rest < 0.25 ? "knapp" : "";
      if (t0 >= REGELN.LIMIT_MS) { antwort(null); return; }
      raf = requestAnimationFrame(bild);
    }
    raf = requestAnimationFrame(bild);
  }

  function antwort(n) {
    if (ansicht !== "frage") return;
    const ms = Math.max(0, Math.min(REGELN.LIMIT_MS, Math.round(performance.now() - lauf.tStart)));
    ansicht = "frage-fest";                              // weitere Tipps zählen nicht
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    lauf.antworten.push({ a: n, ms: n == null ? REGELN.LIMIT_MS : ms });
    platz.querySelectorAll(".du-antwort").forEach(function (b) {
      b.disabled = true;
      if (n != null && parseInt(b.dataset.n, 10) === n) { b.classList.add("gewaehlt"); b.setAttribute("aria-pressed", "true"); } else b.classList.add("blass");
    });
    const mein = nr;
    zeitgeber.push(setTimeout(function () { if (mein === nr && lebt()) naechste(); }, REGELN.WEITER_MS));
  }
  function naechste() {
    lauf.i++;
    if (lauf.i >= lauf.fragen.length) return senden();
    zeigeFrage();
  }

  /* ---------- Senden + Ergebnis ---------- */
  function senden(fehler) {
    neuerBildschirm("senden");
    platz.innerHTML = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + "</h2>" +
      '<div class="karte du-karte"><p class="du-hinweis" role="status">' + E(fehler ? "" : T("duAuswerten")) + "</p>" +
      (fehler ? '<p class="du-fehler" role="alert">' + E(fehler) + '</p><button type="button" class="du-knopf" data-aktion="nochmal">' + E(T("duNochmalSenden")) + "</button>" : "") +
      "</div></div>";
    if (fehler) return;
    const body = { aktion: "duell_ende", duell: lauf.duell, antworten: lauf.antworten };
    const mein = nr;
    beschaeftigt = false;
    aufruf(body, function (d) { if (mein === nr) zeigeErgebnis(d); }, function (code) {
      if (mein !== nr) return;
      if (code === "duell_schon_gespielt") { zeigeErgebnis(null, T("duSchonGespielt")); return; }
      if (ENDGUELTIG.indexOf(code) !== -1) { zeigeErgebnis(null, T("duNichtGespeichertEndgueltig")); return; }
      senden(T("duNichtGespeichert"));
    });
  }

  function zeigeErgebnis(d, hinweis) {
    neuerBildschirm("ergebnis");
    letztesErgebnis = d;
    let html = '<div class="du-spiel"><h2 class="sp-spieltitel">' + E(T("duName")) + "</h2>";
    if (!d) {
      html += '<div class="karte du-karte"><p class="du-hinweis" role="status">' + E(hinweis || T("duFehlerAllgemein")) + "</p></div>";
    } else {
      const fertig = !!d.fertig;
      html += '<div class="karte du-erg">' +
        '<div class="du-erg-kopf"><span class="sp-label">' + E(T("duErgebnis")) + '</span><span class="du-gross" dir="ltr">' + E(d.punkte) + "</span></div>" +
        '<p class="du-pr-zeile"><b>' + E(T("duRichtigVon", { n: d.richtig, m: REGELN.FRAGEN })) + "</b></p>" +
        (fertig
          ? '<div class="du-urteil ' + (d.ergebnis === "sieg" ? "sieg" : d.ergebnis === "niederlage" ? "niederlage" : "") + '" role="status">' +
              E(T(d.ergebnis === "sieg" ? "duSiegGross" : d.ergebnis === "niederlage" ? "duNiederlageGross" : "duUnentschiedenGross")) + "</div>" +
            '<p class="du-pr-zeile" dir="auto">' + E(T("duGegnerPunkte", { name: d.name || T("duMitschueler"), n: d.punkte_gegner })) + "</p>"
          : '<p class="admin-sub du-hinweis" role="status">' + E(T("duWartet")) + "</p>") +
        "</div>";
      html += '<div class="karte du-karte"><h3 class="du-ueberschrift">' + E(T("duAuswertung")) + '</h3><div class="du-pruefung">' + pruefungHtml(d) + "</div></div>";
    }
    html += '<button type="button" class="du-knopf" data-aktion="hub">' + E(T("duZurUebersicht")) + "</button></div>";
    platz.innerHTML = html;
    nachOben();
  }

  /* Auswertung: je Frage deine Antwort, die richtige Antwort (vom Server) und die Erklärung (aus dem Fragenpool) */
  function pruefungHtml(d) {
    const ids = (d.fragen || (lauf && lauf.fragen) || []).slice(0, REGELN.FRAGEN);
    const meine = (lauf && lauf.antworten) || [];
    return ids.map(function (id, i) {
      const q = FRAGEN_NACH_ID[id], t = frageText(id);
      if (!q || !t) return "";
      const richtig = d.loesung ? d.loesung[i] : -1;
      const a = meine[i] ? meine[i].a : null;
      const stimmt = richtig === -1 || a === richtig;
      return '<div class="du-pr ' + (stimmt ? "ok" : "nein") + '">' +
        '<div class="du-pr-kopf"><span class="du-pr-nr">' + E(T("duFrage", { n: i + 1, m: REGELN.FRAGEN })) + '</span>' +
          '<span class="du-pr-urteil">' + E(T(stimmt ? "duRichtigLabel" : "duFalschLabel")) + "</span></div>" +
        (q.bild ? '<div class="du-pr-bild" role="img" aria-label="' + E(T("duZeichenAlt")) + '">' + schildBild(q.bild, {}) + "</div>" : "") +
        '<p class="du-pr-frage" dir="auto">' + E(t.f) + "</p>" +
        '<p class="du-pr-zeile" dir="auto"><b>' + E(T("duDeineAntwort")) + ":</b> " + "<bdi>" + E(a == null ? T("duKeineAntwort") : t.a[a]) + "</bdi></p>" +
        (!stimmt && richtig >= 0 ? '<p class="du-pr-zeile" dir="auto"><b>' + E(T("duRichtigeAntwort")) + ":</b> " + "<bdi>" + E(t.a[richtig]) + "</bdi></p>" : "") +
        '<p class="du-pr-erkl" dir="auto">' + E(t.e) + "</p></div>";
    }).join("");
  }

  /* ---------- Klicks (ein Zuhörer für alles) ---------- */
  function klick(ev) {
    const el = ev.target && ev.target.closest ? ev.target.closest("[data-aktion]") : null;
    if (!el || !platz.contains(el) || el.disabled) return;
    const a = el.dataset.aktion, id = el.dataset.id;
    if (a === "hub") { if (ansicht !== "frage" && ansicht !== "frage-fest" && ansicht !== "senden") ladeHub(); }
    else if (a === "neu") neuesDuell();
    else if (a === "annehmen") annehmen(id);
    else if (a === "spielen") zeigeBereit(id, null, null, el.dataset.weiter === "1");
    else if (a === "los") los(id);
    else if (a === "antwort") antwort(parseInt(el.dataset.n, 10));
    else if (a === "nochmal") senden();
  }
  platz.addEventListener("click", klick);

  cssLaden().then(function () { if (!weg) ladeHub(); });

  return {
    zerstoeren: function () {
      weg = true; raeumeAuf(); nr++;
      platz.removeEventListener("click", klick);
    }
  };
}
