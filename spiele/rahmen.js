/* Gemeinsamer Rahmen aller Mini-Spiele (06.10.2026).
   Was jedes Spiel braucht, steht EINMAL hier: Stil laden, Texte, Server-Aufrufe, Name/Sichtbarkeit im
   Ranking und die Bestenliste. Ein neues Spiel bekommt dieses Objekt `k` und muss nur sein Spiel bauen.

   k.tx(schluessel, werte)   Text in der Sprache der App
   k.esc(text)               HTML-sicher machen (IMMER bei Text, der nicht von uns kommt)
   k.api(body)               Server-Aufruf academy-spiele; wirft Error(code). Ohne Konto (Vorschau/Demo): wirft "vorschau"
   k.vorschau                true = nichts wird gespeichert, kein Server-Aufruf
   k.zahl(n, stellen)        Zahl mit Komma/Punkt der Sprache, immer lateinische Ziffern
   profilKarte(k, el, nachAenderung)   Name im Ranking + Schalter "sichtbar"
   rankingKarte(k, spiel, einheit, el, format) Bestenliste; gibt { aktualisieren() } zurück
                                     format(wert) -> Text (optional; sonst „wert einheit“, z. B. Sekunden statt Millisekunden) */
import { tx, RTL } from "./texte.js";

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

let cssVersprechen = null;
export function cssLaden() {
  if (cssVersprechen) return cssVersprechen;
  cssVersprechen = new Promise(function (fertig) {
    try {
      if (document.querySelector("link[data-spiele-css]")) { fertig(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = new URL("./spiele.css", import.meta.url).href;
      l.setAttribute("data-spiele-css", "");
      l.onload = fertig; l.onerror = fertig; // ohne Stil lieber trotzdem zeigen als gar nichts
      document.head.appendChild(l);
      setTimeout(fertig, 2500);
    } catch (e) { fertig(); }
  });
  return cssVersprechen;
}

const KOMMA = ["de", "tr", "es", "ru", "sr", "vi", "el", "kmr", "rif"];

export function erzeugeK(opt) {
  const sprache = opt.sprache || "de";
  const k = {
    sprache: sprache,
    rtl: RTL.indexOf(sprache) !== -1,
    vorschau: !!opt.vorschau,
    tx: function (schluessel, werte) { return tx(sprache, schluessel, werte); },
    esc: esc,
    api: function (body) {
      if (k.vorschau || !opt.api) return Promise.reject(new Error("vorschau"));
      return opt.api(body);
    },
    zahl: function (n, stellen) {
      const f = Math.pow(10, stellen || 0), r = Math.round(n * f) / f;
      const s = Number.isInteger(r) ? String(r) : r.toFixed(stellen || 0);   // 40 statt 40,0
      return KOMMA.indexOf(sprache) !== -1 ? s.replace(".", ",") : s;
    },
    profil: null,
    profilLaden: function () {
      if (k.profil) return Promise.resolve(k.profil);
      return k.api({ aktion: "uebersicht" }).then(function (d) {
        k.profil = { anzeigename: d.anzeigename, sichtbar: d.sichtbar !== false, bestwerte: d.bestwerte || {} };
        return k.profil;
      });
    },
    sichtbarSetzen: function (b) {
      return k.api({ aktion: "profil", sichtbar: b }).then(function () { if (k.profil) k.profil.sichtbar = b; });
    }
  };
  return k;
}

/* Name im Ranking (kommt vom Konto, nicht vom Gerät) + Schalter "im Ranking sichtbar". */
export function profilKarte(k, el, nachAenderung) {
  if (k.vorschau) { el.hidden = true; return; }
  el.className = "karte sp-profil";
  el.innerHTML = '<div class="admin-sub">' + esc(k.tx("laden")) + "</div>";
  function zeichnen(p, fehler) {
    el.innerHTML =
      '<div class="sp-profil-zeile">' +
        '<div class="sp-profil-text"><div class="sp-label">' + esc(k.tx("profilName")) + "</div>" +
          '<div class="sp-name" dir="auto">' + esc(p.anzeigename) + "</div></div>" +
        '<button type="button" class="sp-schalter" role="switch" aria-checked="' + (p.sichtbar ? "true" : "false") + '" aria-label="' + esc(k.tx("profilSichtbar")) + '"><span></span></button>' +
      "</div>" +
      '<div class="admin-sub sp-hinweis">' + esc(k.tx(p.sichtbar ? "profilHinweis" : "profilAus")) + "</div>" +
      (fehler ? '<div class="sp-fehler" role="alert">' + esc(k.tx("fehler")) + "</div>" : "");
    const b = el.querySelector(".sp-schalter");
    b.addEventListener("click", function () {
      const neu = b.getAttribute("aria-checked") !== "true";
      b.disabled = true;
      k.sichtbarSetzen(neu).then(function () {
        if (!document.body.contains(el)) return;
        zeichnen(k.profil);
        if (nachAenderung) nachAenderung();
      }).catch(function () {
        if (document.body.contains(el)) zeichnen(k.profil, true);
      });
    });
  }
  k.profilLaden().then(function (p) { if (document.body.contains(el)) zeichnen(p); })
    .catch(function () { if (document.body.contains(el)) el.hidden = true; });
}

/* Bestenliste: die Besten (nur sichtbare Schüler) und, falls man nicht darunter ist, die eigene Platzierung. */
export function rankingKarte(k, spiel, einheit, el, format) {
  const zeige = function (w) { return format ? format(w) : w + " " + einheit; };
  el.className = "karte sp-ranking";
  if (k.vorschau) { el.hidden = true; return { aktualisieren: function () {} }; }
  let nr = 0; // nur die jüngste Antwort zeichnet (schnelles Hin und Her)
  function zeichnen(d) {
    const zeilen = (d.top || []).map(function (z) {
      return '<li class="sp-zeile' + (z.ich ? " ich" : "") + '"><span class="sp-platz">' + esc(z.platz) + "</span>" +
        '<span class="sp-rname" dir="auto">' + esc(z.name) + (z.ich ? ' <span class="sp-du">· ' + esc(k.tx("du")) + "</span>" : "") + "</span>" +
        '<span class="sp-wert" dir="ltr">' + esc(zeige(z.wert)) + "</span></li>";
    });
    const eigenInTop = (d.top || []).some(function (z) { return z.ich; });
    if (d.ich && !eigenInTop) {
      zeilen.push('<li class="sp-zeile sp-luecke" aria-hidden="true"><span>…</span></li>');
      zeilen.push('<li class="sp-zeile ich"><span class="sp-platz">' + esc(d.ich.platz) + "</span>" +
        '<span class="sp-rname">' + esc(k.tx("du")) + "</span>" +
        '<span class="sp-wert" dir="ltr">' + esc(zeige(d.ich.wert)) + "</span></li>");
    }
    el.innerHTML = '<h3 class="sp-ueberschrift">' + esc(k.tx("rankingTitel")) + "</h3>" +
      (zeilen.length ? '<ol class="sp-liste">' + zeilen.join("") + "</ol>" : '<div class="admin-sub">' + esc(k.tx("rankingLeer")) + "</div>");
  }
  function aktualisieren() {
    const mein = ++nr;
    if (!el.firstChild) el.innerHTML = '<div class="admin-sub">' + esc(k.tx("laden")) + "</div>";
    return k.api({ aktion: "rangliste", spiel: spiel, limit: 10 }).then(function (d) {
      if (mein === nr && document.body.contains(el)) zeichnen(d);
    }).catch(function () {
      if (mein === nr && document.body.contains(el)) el.innerHTML = '<div class="admin-sub">' + esc(k.tx("rankingFehler")) + "</div>";
    });
  }
  aktualisieren();
  return { aktualisieren: aktualisieren };
}
