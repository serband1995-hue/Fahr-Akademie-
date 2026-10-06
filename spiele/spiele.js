/* Spiele-Bereich (06.10.2026): Startseite mit allen Spielen und Weiche zum einzelnen Spiel.
   Wird von index.html erst beim Öffnen von „Spiele“ geladen (wie verkehr/spieler.js) -- wer nie spielt,
   lädt nichts. Ein neues Spiel = Eintrag in SPIELE + eigene Datei, die `starte(platz, k)` exportiert.

   starte(platz, opt)
     platz   Element, in das gezeichnet wird
     opt     { sprache, api(body), vorschau, vorschauGeraet, spiel (null = Startseite | "ampel" …), offen(id) }
       vorschau        true = Übungsmodus, nichts wird gespeichert
       vorschauGeraet  true = Vorschau-Gerät (Vorschau der Verwaltung oder ?spiele=1): sieht auch Spiele mit nurVorschau
   Rückgabe { zerstoeren() } -- räumt Zeitgeber und Listener auf (die App ruft es vor jedem Neuzeichnen). */
import { erzeugeK, cssLaden, esc, profilKarte } from "./rahmen.js";

/* ein Spiel: id, Datei (für den Import), Schlüssel von Titel/Kurztext, Einheit des Bestwerts, Symbol.
   bestKey   Text-Schlüssel für „Dein Bestwert“ (Zeit bei Ampel, Höchsttempo beim Tempo-Sprint)
   format    (optional) wert, k -> Text für den Bestwert an der Karte (sonst „wert einheit“), z. B. Sekunden statt Millisekunden
   nurVorschau  true = nur auf Vorschau-Geräten sichtbar und spielbar (neues Spiel erst selbst prüfen, dann auf false) */
export const SPIELE = [
  {
    id: "ampel", name: "ampelName", kurz: "ampelKurz", einheit: "ms", bestKey: "bestzeit", nurVorschau: false,
    laden: function () { return import("./ampel.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="7.5" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor" opacity=".45"/><circle cx="12" cy="16.5" r="1.9" fill="currentColor" opacity=".25"/></svg>'
  },
  {
    id: "sprint", name: "tempoName", kurz: "tempoKurz", einheit: "m", bestKey: "tempoBestwert", nurVorschau: false,   // 08.10.2026 umgebaut: Strecke in 10 s (Id neu, damit die alten km/h-Bestwerte nicht mit Metern vermischt werden)
    laden: function () { return import("./tempo.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 17a8.5 8.5 0 1 1 17 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 17l4.2-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.6" fill="currentColor"/></svg>'
  }
,
  {
    id: "memory", name: "memoryName", kurz: "memoryKurz", einheit: "s", bestKey: "bestzeit", nurVorschau: false,
    format: function (ms, k) { return k.zahl(ms / 1000, 1) + " s"; },
    laden: function () { return import("./memory.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="8" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="10" width="8" height="10" rx="2" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="1.8"/><path d="M7 7.5l.01 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  },
  {
    id: "vorfahrt", name: "vorName", kurz: "vorKurz", einheit: "", bestKey: "vorBestwert", nurVorschau: false,
    format: function (w, k) { return w + " " + k.tx("vorPunkte"); },
    laden: function () { return import("./vorfahrt.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2v7H2M15 2v7h7M9 22v-7H2M15 22v-7h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>'
  }
];

/* Wer ein Spiel sehen und starten darf: alle, außer bei nurVorschau (dann nur Vorschau-Geräte). */
function erlaubt(spiel, opt) { return !spiel.nurVorschau || !!opt.vorschauGeraet; }

export function starte(platz, opt) {
  let spielInstanz = null;
  let weg = false;
  const k = erzeugeK(opt);
  platz.classList.add("sp-wurzel");
  platz.setAttribute("dir", k.rtl ? "rtl" : "ltr");

  cssLaden().then(function () {
    if (weg) return;
    // Ein direkt aufgerufenes Spiel mit nurVorschau öffnet für normale Schüler NICHT (dann Startseite).
    const spiel = typeof opt.spiel === "string" && SPIELE.find(function (s) { return s.id === opt.spiel; });
    if (spiel && erlaubt(spiel, opt)) zeigeSpiel(spiel); else zeigeStart();
  });

  function zeigeStart() {
    platz.innerHTML =
      '<div class="tagline sp-titel">' + esc(k.tx("titel")) + "</div>" +
      '<div class="admin-sub sp-intro">' + esc(k.tx("intro")) + "</div>" +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-karten"></div>';
    profilKarte(k, platz.querySelector(".sp-profil-platz"));
    const karten = platz.querySelector(".sp-karten");
    SPIELE.filter(function (s) { return erlaubt(s, opt); }).forEach(function (s) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "karte sp-karte"; b.dataset.spiel = s.id;
      b.innerHTML =
        '<span class="sp-karte-symbol">' + s.symbol + "</span>" +
        '<span class="sp-karte-text"><span class="sp-karte-titel">' + esc(k.tx(s.name)) + "</span>" +
          '<span class="sp-karte-kurz">' + esc(k.tx(s.kurz)) + "</span>" +
          (s.nurVorschau ? '<span class="sp-karte-marke">' + esc(k.tx("vorschauMarke")) + "</span>" : "") +
          '<span class="sp-karte-best" data-best="' + s.id + '"></span></span>';
      b.addEventListener("click", function () { if (opt.offen) opt.offen(s.id); });
      karten.appendChild(b);
    });
    // eigene Bestwerte nachtragen (kommt aus demselben Aufruf wie der Name; fehlt er, bleibt die Zeile leer)
    k.profilLaden().then(function (p) {
      SPIELE.forEach(function (s) {
        const z = platz.querySelector('[data-best="' + s.id + '"]');
        if (!z) return;
        const w = p.bestwerte && p.bestwerte[s.id];
        z.textContent = w ? k.tx(s.bestKey) + ": " + (s.format ? s.format(w, k) : w + " " + s.einheit) : k.tx("nochNicht");
      });
    }).catch(function () {});
  }

  function zeigeSpiel(spiel) {
    platz.innerHTML = '<div class="admin-sub">' + esc(k.tx("laden")) + "</div>";
    spiel.laden().then(function (modul) {
      if (weg) return;
      platz.innerHTML = "";
      spielInstanz = modul.starte(platz, k);
    }).catch(function () {
      if (!weg) platz.innerHTML = '<div class="leer-hinweis">' + esc(k.tx("fehler")) + "</div>";
    });
  }

  return {
    zerstoeren: function () {
      weg = true;
      try { if (spielInstanz && spielInstanz.zerstoeren) spielInstanz.zerstoeren(); } catch (e) {}
      spielInstanz = null;
    }
  };
}
