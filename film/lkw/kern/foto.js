/* Fotokarte: blendet ein Beispielfoto (KI-erzeugt, siehe fotos/) über die Bühne, Rest der Bühne wird abgedunkelt.
   LKW_FOTO.karte(st, name, titel, hinweis) -> { setze(a) }  (a = 0…1). Die Bilddaten kommen in der App aus window.LKW_FOTOS[name] (Data-URI, von bauen.mjs eingebettet), im MP4-Film aus ../fotos/<name>.jpg.
   Das Foto ist Beispiel, kein Herstellerbild: Es trägt immer den Hinweis „Beispielbild, KI-erzeugt“ (hinweis). */
(function (window) {
  "use strict";
  function karte(st, name, titel, hinweis) {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1080px;background:rgba(24,31,27,.9);opacity:0;pointer-events:none";
    const rahmen = document.createElement("div");
    rahmen.style.cssText = "position:absolute;left:190px;top:150px;width:700px;height:700px;border-radius:26px;overflow:hidden;border:6px solid #F5F6F3;box-shadow:0 18px 50px rgba(0,0,0,.5);background:#222";
    const im = document.createElement("img"); im.alt = "";
    im.src = (window.LKW_FOTOS && window.LKW_FOTOS[name]) || ("../fotos/" + name + ".jpg");
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    rahmen.appendChild(im); d.appendChild(rahmen);
    const t = document.createElement("div"); t.textContent = titel;
    t.style.cssText = "position:absolute;left:90px;width:900px;top:880px;text-align:center;font:700 54px/1.1 'Barlow',sans-serif;color:#F5F6F3";
    const h = document.createElement("div"); h.textContent = hinweis;
    h.style.cssText = "position:absolute;left:90px;width:900px;top:960px;text-align:center;font:600 32px/1.1 'Barlow',sans-serif;color:rgba(250,246,236,.7)";
    d.appendChild(t); d.appendChild(h); st.appendChild(d);
    return { setze: function (a) { d.style.opacity = a; } };
  }
  window.LKW_FOTO = { karte: karte };
})(window);
