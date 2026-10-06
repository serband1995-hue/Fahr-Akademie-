/* Bild-Kacheln für „Verkehr verstehen“ (06.10.2026)
   Je Kategorie eine Wisch-Zeile (.vk-reihe). Beim Wischen wird die Kachel, die den Platz vorn verlässt,
   kleiner, dunkler und weicher; die nächste wird größer und scharf. Darunter steht die Kurzinfo der Kachel
   im Blick (.vk-info). Das Markup baut renderVerkehrHtml() in index.html, die Optik steht dort im CSS.
   Dieser Code setzt nur die Variable --p (0..1) je Kachel und schaltet die Info um. Keine Bibliothek.
   Fehlt ein Vorschaubild (verkehr/vorschau/<id>.webp), bleibt die ruhige Ersatzfläche stehen. */

// Letzte Kachel je Zeile: nach „Zurück“ aus einer Szene steht die Zeile wieder an derselben Stelle.
const merk = {};

export function starte(wurzel){
  const weg = [];
  const ruhig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  wurzel.querySelectorAll("[data-vk-zeile]").forEach(function(zeile){
    const reihe = zeile.querySelector(".vk-reihe");
    const info = zeile.querySelector(".vk-info");
    const karten = Array.prototype.slice.call(reihe.querySelectorAll(".vk-karte"));
    const texte = Array.prototype.slice.call(info.querySelectorAll(".vk-t"));
    if(!karten.length) return;
    const name = zeile.dataset.vkZeile;
    let aktiv = 0, bild = 0;

    // Fehlt ein Vorschaubild, weg mit dem kaputten Bild (die Ersatzfläche dahinter bleibt)
    karten.forEach(function(k){
      const img = k.querySelector("img");
      if(!img) return;
      const ab = function(){ img.remove(); };
      img.addEventListener("error", ab);
      if(img.complete && img.naturalWidth === 0 && img.getAttribute("src")) ab();
    });

    function lage(){
      const cs = getComputedStyle(reihe), rtl = cs.direction === "rtl";
      const r = reihe.getBoundingClientRect();
      const rand = parseFloat(cs.paddingInlineStart) || 0;
      return { rtl: rtl, kante: rtl ? r.right - rand : r.left + rand };
    }
    // Abstand der Kachel vom Platz vorn, in Kachel-Schritten (0 = genau vorn, 1 = eine Kachel weiter)
    function abstand(k, l, schritt){
      const kr = k.getBoundingClientRect();
      return Math.abs(l.rtl ? l.kante - kr.right : kr.left - l.kante) / schritt;
    }
    function schrittMass(){
      if(karten.length < 2) return reihe.clientWidth || 1;
      return Math.abs(karten[1].getBoundingClientRect().left - karten[0].getBoundingClientRect().left) || 1;
    }

    function zeigeInfo(i){
      aktiv = i;
      texte.forEach(function(x, n){ x.classList.toggle("an", n === i); });
      info.dataset.vvSzene = karten[i].dataset.vvSzene;
      merk[name] = karten[i].dataset.vvSzene;
    }

    function messen(){
      bild = 0;
      const l = lage(), schritt = schrittMass();
      let bester = aktiv, bd = Infinity;
      karten.forEach(function(k, i){
        const d = abstand(k, l, schritt);
        k.style.setProperty("--p", ruhig ? (d < 0.5 ? "1" : "0") : Math.max(0, 1 - d).toFixed(3));
        if(d < bd){ bd = d; bester = i; }
      });
      if(bester !== aktiv) zeigeInfo(bester);
    }
    function geplant(){ if(!bild) bild = requestAnimationFrame(messen); }

    reihe.style.setProperty("--ursprung", getComputedStyle(reihe).direction === "rtl" ? "right center" : "left center");

    // Zurück an die zuletzt gesehene Stelle (sofort, ohne Animation)
    const zuletzt = karten.findIndex(function(k){ return k.dataset.vvSzene === merk[name]; });
    if(zuletzt > 0){
      const l = lage(), kr = karten[zuletzt].getBoundingClientRect();
      reihe.scrollTo({ left: reihe.scrollLeft + (l.rtl ? kr.right - l.kante : kr.left - l.kante), behavior: "instant" });
    }
    messen();
    zeigeInfo(aktiv);

    reihe.addEventListener("scroll", geplant, { passive: true });
    let ro = null;
    if(window.ResizeObserver){ ro = new ResizeObserver(geplant); ro.observe(reihe); }
    weg.push(function(){
      reihe.removeEventListener("scroll", geplant);
      if(ro) ro.disconnect();
      if(bild) cancelAnimationFrame(bild);
    });
  });

  return { zerstoeren: function(){ weg.forEach(function(f){ f(); }); weg.length = 0; } };
}
