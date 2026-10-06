/* Spiele-Bereich (06.10.2026): Startseite mit allen Spielen und Weiche zum einzelnen Spiel.
   Wird von index.html erst beim Öffnen von „Spiele“ geladen (wie verkehr/spieler.js) -- wer nie spielt,
   lädt nichts. Ein neues Spiel = Eintrag in SPIELE + eigene Datei, die `starte(platz, k)` exportiert.

   starte(platz, opt)
     platz   Element, in das gezeichnet wird
     opt     { sprache, api(body), vorschau, spiel (null = Startseite | "ampel" …), offen(id) }
   Rückgabe { zerstoeren() } -- räumt Zeitgeber und Listener auf (die App ruft es vor jedem Neuzeichnen). */
import { erzeugeK, cssLaden, esc, profilKarte } from "./rahmen.js";

/* ein Spiel: id, Datei (für den Import), Schlüssel von Titel/Kurztext, Einheit des Bestwerts, Symbol */
const SPIELE = [
  {
    id: "ampel", name: "ampelName", kurz: "ampelKurz", einheit: "ms",
    laden: function () { return import("./ampel.js"); },
    symbol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="7.5" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor" opacity=".45"/><circle cx="12" cy="16.5" r="1.9" fill="currentColor" opacity=".25"/></svg>'
  }
];

export function starte(platz, opt) {
  let spielInstanz = null;
  let weg = false;
  const k = erzeugeK(opt);
  platz.classList.add("sp-wurzel");
  platz.setAttribute("dir", k.rtl ? "rtl" : "ltr");

  cssLaden().then(function () {
    if (weg) return;
    const spiel = opt.spiel && SPIELE.find(function (s) { return s.id === opt.spiel; });
    if (spiel) zeigeSpiel(spiel); else zeigeStart();
  });

  function zeigeStart() {
    platz.innerHTML =
      '<div class="tagline sp-titel">' + esc(k.tx("titel")) + "</div>" +
      '<div class="admin-sub sp-intro">' + esc(k.tx("intro")) + "</div>" +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-karten"></div>';
    profilKarte(k, platz.querySelector(".sp-profil-platz"));
    const karten = platz.querySelector(".sp-karten");
    SPIELE.forEach(function (s) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "karte sp-karte"; b.dataset.spiel = s.id;
      b.innerHTML =
        '<span class="sp-karte-symbol">' + s.symbol + "</span>" +
        '<span class="sp-karte-text"><span class="sp-karte-titel">' + esc(k.tx(s.name)) + "</span>" +
          '<span class="sp-karte-kurz">' + esc(k.tx(s.kurz)) + "</span>" +
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
        z.textContent = w ? k.tx("bestzeit") + ": " + w + " " + s.einheit : k.tx("nochNicht");
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
