/* Schaltbilder der Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Behälter, Leitungen, Zylinder, Ventile, Kupplungsköpfe.
   Reine Zeichnung: jede Komponente hat setze(Wert) mit Werten 0…1 aus kern/modell.js (zweikreis, anhaengerBremse, federspeicher, kuppelnZustand).
   Farben: Druckluft blau, Bremsleitung (Kupplungskopf) gelb, Vorratsleitung rot. Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  const C = { luft: "#6EC1E4", gelb: "#F2C94C", rot: "#E5584B", stahl: "#C9CFC6", dunkel: "#23262A", linie: "rgba(250,246,236,.30)", feder: "#E8B77F", belag: "#B08A5A" };

  function buehne(stage) {
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#36423B 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    return { svg: svg, g: el("g", null, svg), ueber: el("g", null, svg) };
  }
  function text(parent, t, x, y, o) {
    o = o || {};
    const e = el("text", { x: x, y: y, "text-anchor": o.anker || "middle", "font-size": o.gr || 28, "font-weight": o.fett ? 700 : 600, "font-family": "Barlow, sans-serif", fill: o.farbe || F.creme }, parent);
    e.textContent = t; return e;
  }
  const pfadD = (pts) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
  const mix = (a, b, u) => a + (b - a) * u;

  /* Leitung: graue Röhre, darüber die Füllung (Farbe), Deckkraft/Dicke nach Druck p; ungefüllt = nur Röhre. o: { farbe, w } */
  function leitung(B, pts, o) {
    o = o || {}; const w = o.w || 14, g = el("g", null, o.layer || B.g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "rgba(250,246,236,.22)", "stroke-width": w + 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "#2B3631", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    const fuell = el("path", { d: pfadD(pts), fill: "none", stroke: o.farbe || C.luft, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    return { g: g, setze: function (p) { fuell.setAttribute("opacity", f(Math.max(0, Math.min(1, p)) * 0.95)); }, farbe: (c) => fuell.setAttribute("stroke", c), pts: pts };
  }
  /* Behälter (Vorratsbehälter): Füllstand von unten */
  function behaelter(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: h / 2, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const cp = "cl" + Math.round(x) + "_" + Math.round(y) + "_" + (o.id || "");
    const defs = el("defs", null, g), clip = el("clipPath", { id: cp }, defs); el("rect", { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: h / 2 - 3 }, clip);
    const fuell = el("rect", { x: x, y: y + h, width: w, height: 0, fill: C.luft, opacity: 0.85, "clip-path": "url(#" + cp + ")" }, g);
    if (o.name) text(g, o.name, x + w / 2, y + h + 34, { gr: 26 });
    return { g: g, setze: function (p) { p = Math.max(0, Math.min(1, p)); fuell.setAttribute("y", f(y + h - p * h)); fuell.setAttribute("height", f(p * h)); }, x: x, y: y, w: w, h: h };
  }
  /* Bremszylinder (Membran) waagerecht mit Schubstange nach rechts auf eine Bremstrommel-Scheibe. setze(p): Druck 0…1 → Stange fährt aus, Belag drückt */
  function zylinder(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 80, hub = o.hub || 60;
    const kam = el("rect", { x: x, y: y, width: w * 0.6, height: h, rx: 10, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const luft = el("rect", { x: x + 4, y: y + 4, width: 0, height: h - 8, rx: 6, fill: C.luft, opacity: 0.85 }, g);
    const kolben = el("rect", { x: x + 4, y: y + 4, width: 10, height: h - 8, rx: 3, fill: C.stahl }, g);
    const stange = el("rect", { x: x + w * 0.6, y: y + h / 2 - 7, width: w * 0.4, height: 14, fill: C.stahl }, g);
    const beleg = el("rect", { x: x + w, y: y + h / 2 - 28, width: 14, height: 56, rx: 4, fill: C.belag }, g);
    const trommel = el("circle", { cx: x + w + 14 + 70, cy: y + h / 2, r: 62, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 10 }, g);
    return { g: g, setze: function (p) {
      p = Math.max(0, Math.min(1, p));
      const lw = (w * 0.6 - 8 - 12) * 0.9;
      luft.setAttribute("width", f(p * lw)); kolben.setAttribute("x", f(x + 4 + p * lw)); luft.setAttribute("opacity", f(p > 0 ? 0.85 : 0));
      const s = p * hub * 0.35;
      stange.setAttribute("x", f(x + w * 0.6 + s)); stange.setAttribute("width", f(w * 0.4 - s * 0 + 0)); beleg.setAttribute("x", f(x + w + s));
      trommel.setAttribute("stroke", p > 0.05 ? C.belag : "rgba(250,246,236,.45)");
    } };
  }
  /* Ventil (Kasten mit Beschriftung); setze(aktiv 0…1) färbt den Rand */
  function ventil(B, o) {
    const g = el("g", null, B.g), w = o.w || 110, h = o.h || 90;
    const r = el("rect", { x: o.x, y: o.y, width: w, height: h, rx: 14, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    el("path", { d: "M" + (o.x + w * 0.3) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.3) + " " + (o.y + h * 0.25) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.25), fill: "none", stroke: "rgba(250,246,236,.7)", "stroke-width": 4, "stroke-linejoin": "round" }, g);
    if (o.name) text(g, o.name, o.x + w / 2, o.y - 14, { gr: 26 });
    return { g: g, setze: function (a) { r.setAttribute("stroke", a > 0.5 ? (o.farbe || F.gold) : C.stahl); } };
  }
  /* Kupplungskopf (rot/gelb) als Kreis mit Ring; setze(verbunden): 1 = zusammen, 0 = getrennt (Hälften auseinander) */
  function kupplung(B, o) {
    const g = el("g", null, B.g), col = o.farbe, r = o.r || 24, d = o.abstand || 70;
    const a = el("g", null, g), b = el("g", null, g);
    el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, a); el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, b);
    el("circle", { r: r * 0.4, fill: col }, a); el("circle", { r: r * 0.4, fill: col }, b);
    return { g: g, setze: function (v) { const s = (1 - Math.max(0, Math.min(1, v))) * d / 2; a.setAttribute("transform", "translate(" + f(o.x - s - r) + " " + o.y + ")"); b.setAttribute("transform", "translate(" + f(o.x + s + r) + " " + o.y + ")"); } };
  }
  /* Kombizylinder (Schnittbild, vereinfacht): links der Raum der Betriebsbremse (Membran: Druck schiebt die Platte nach links = bremst),
     rechts der Federspeicher (Feder schiebt den Federkolben zur Trennwand und über die Schubstange die Platte nach links = bremst; Druck zwischen Wand und Federkolben spannt die Feder = löst).
     setze(pMembran, pFeder) rechnet mit modell.federspeicher; Stange fährt bei Bremskraft nach links zur Bremse aus. Gibt das Modell-Ergebnis zurück. */
  function kombi(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 560, h = o.h || 200, M = window.LKW_MODELL;
    const mem = w * 0.42, wand = x + mem, ende = x + w, ym = y + h / 2, hub = mem - 70, weg = ende - wand - 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: 22, fill: "#2B3631", stroke: C.stahl, "stroke-width": 7 }, g);
    const luftM = el("rect", { x: x + 8, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    const luftF = el("rect", { x: wand + 6, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    el("rect", { x: wand - 6, y: y + 4, width: 12, height: h - 8, fill: C.stahl }, g);                                  // Trennwand
    const platte = el("rect", { x: wand - 16, y: y + 12, width: 14, height: h - 24, rx: 4, fill: C.stahl }, g);       // Membranplatte
    const kolbenF = el("rect", { x: wand + 6, y: y + 12, width: 16, height: h - 24, rx: 4, fill: C.stahl }, g);        // Federkolben
    const feder = el("path", { d: "", fill: "none", stroke: C.feder, "stroke-width": 9, "stroke-linejoin": "round" }, g);
    const stange = el("rect", { x: x - 70, y: ym - 10, width: 90, height: 20, fill: C.stahl }, g);
    const belag = el("rect", { x: x - 100, y: ym - 42, width: 28, height: 84, rx: 6, fill: C.belag }, g);
    const trommel = el("circle", { cx: x - 100 - 24 - 80, cy: ym, r: 86, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 12 }, g);
    function federPfad(l, r) { const n = 9, a = h * 0.28; let d = "M" + f(l) + " " + f(ym); for (let k = 0; k < n; k++) d += " L" + f(l + (r - l) * (k + 0.5) / n) + " " + f(ym + (k % 2 ? a : -a)); return d + " L" + f(r) + " " + f(ym); }
    return { g: g, x: x, y: y, w: w, h: h, wandX: wand, endeX: ende, setze: function (pM, pF) {
      const r = M.federspeicher({ pFeder: pF, pMembran: pM }), pl = Math.min(1, pF / M.FEDER.haltedruck);
      const xk = wand + 12 + weg * pl;                                              // Federkolben: bei Druck nach rechts (Feder gespannt)
      kolbenF.setAttribute("x", f(xk)); luftF.setAttribute("width", f(Math.max(0, xk - wand - 6))); luftF.setAttribute("opacity", f(pF > 0.02 ? 0.85 : 0));
      feder.setAttribute("d", federPfad(xk + 16, ende - 14));
      const px = wand - 16 - hub * r.kraft;                                          // Membranplatte: je größer die Bremskraft, desto weiter links
      platte.setAttribute("x", f(px)); luftM.setAttribute("x", f(px + 14)); luftM.setAttribute("width", f(Math.max(0, wand - 16 - px) * (pM > 0.02 ? 1 : 0))); luftM.setAttribute("opacity", f(pM > 0.02 ? 0.85 : 0));
      const aus = 40 * r.kraft; stange.setAttribute("x", f(x - 70 - aus)); belag.setAttribute("x", f(x - 100 - aus));
      trommel.setAttribute("stroke", r.gebremst ? C.belag : "rgba(250,246,236,.45)"); return r;
    } };
  }
  window.LKW_PNEU = { C: C, buehne: buehne, text: text, leitung: leitung, behaelter: behaelter, zylinder: zylinder, ventil: ventil, kupplung: kupplung, kombi: kombi, mix: mix };
})(window);
