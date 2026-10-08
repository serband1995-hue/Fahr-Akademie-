/* Schaltbilder der Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Behälter, Leitungen, Zylinder, Ventile, Kupplungsköpfe.
   Reine Zeichnung: jede Komponente hat setze(Wert) mit Werten 0…1 aus kern/modell.js (zweikreis, anhaengerBremse, federspeicher, kuppelnZustand).
   Farben: Druckluft blau, Bremsleitung (Kupplungskopf) gelb, Vorratsleitung rot. Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  let clipZaehler = 0;
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
    const cp = "cl" + (++clipZaehler) + "_" + Math.round(x) + "_" + Math.round(y) + "_" + (o.id || "");
    const defs = el("defs", null, g), clip = el("clipPath", { id: cp }, defs); el("rect", { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: h / 2 - 3 }, clip);
    const fuell = el("rect", { x: x, y: y + h, width: w, height: 0, fill: o.farbe || C.luft, opacity: 0.85, "clip-path": "url(#" + cp + ")" }, g);
    if (o.name) text(g, o.name, x + w / 2, y + h + 34, { gr: 26 });
    return { g: g, setze: function (p) { p = Math.max(0, Math.min(1, p)); fuell.setAttribute("y", f(y + h - p * h)); fuell.setAttribute("height", f(p * h)); }, x: x, y: y, w: w, h: h };
  }
  /* Bremszylinder (Membran) waagerecht mit Schubstange nach rechts auf eine Bremstrommel-Scheibe. setze(p): Druck 0…1 → Stange fährt aus, Belag drückt */
  function zylinder(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 80, hub = o.hub || 60;
    const kam = el("rect", { x: x, y: y, width: w * 0.6, height: h, rx: 10, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const luft = el("rect", { x: x + 4, y: y + 4, width: 0, height: h - 8, rx: 6, fill: o.farbe || C.luft, opacity: 0.85 }, g);
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
    const mem = w * 0.42, wand = x + mem, ende = x + w, ym = y + h / 2, hub = o.hub || 100, weg = hub;     // Platte und Kolben fahren gleich weit (starre Verbindung über die Druckstange)
    const trommelX = x - 100 - hub - 24 - 86 + 20;
    el("rect", { x: x, y: y, width: w, height: h, rx: 22, fill: "#2B3631", stroke: C.stahl, "stroke-width": 7 }, g);
    const luftM = el("rect", { x: x + 8, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    const luftF = el("rect", { x: wand + 6, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    // Luftanschlüsse oben: blau, wenn im Raum Druck steht
    const portM = el("rect", { x: x + mem / 2 - 14, y: y - 34, width: 28, height: 34, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const portF = el("rect", { x: wand + (ende - wand) / 2 - 14, y: y - 34, width: 28, height: 34, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    el("rect", { x: wand - 6, y: y + 4, width: 12, height: h - 8, fill: C.stahl }, g);                                  // Trennwand
    const druckstange = el("rect", { x: 0, y: ym - 7, width: 0, height: 14, fill: "#AEB4AB" }, g);                      // Federkolben schiebt durch die Trennwand auf die Membranplatte
    const platte = el("rect", { x: wand - 16, y: y + 12, width: 14, height: h - 24, rx: 4, fill: C.stahl }, g);       // Membranplatte
    const kolbenF = el("rect", { x: wand + 6, y: y + 12, width: 16, height: h - 24, rx: 4, fill: C.stahl }, g);        // Federkolben
    const feder = el("path", { d: "", fill: "none", stroke: C.feder, "stroke-width": 9, "stroke-linejoin": "round" }, g);
    const stange = el("rect", { x: x - 70, y: ym - 10, width: 90, height: 20, fill: C.stahl }, g);                      // Schubstange: Platte -> Bremse
    const belag = el("rect", { x: x - 100, y: ym - 42, width: 28, height: 84, rx: 6, fill: C.belag }, g);
    const tcx = trommelX + 0, trommel = el("circle", { cx: tcx, cy: ym, r: 86, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 12 }, g);
    function federPfad(l, r) { const n = 9, a = h * 0.28; let d = "M" + f(l) + " " + f(ym); for (let k = 0; k < n; k++) d += " L" + f(l + (r - l) * (k + 0.5) / n) + " " + f(ym + (k % 2 ? a : -a)); return d + " L" + f(r) + " " + f(ym); }
    return { g: g, x: x, y: y, w: w, h: h, wandX: wand, endeX: ende, trommelX: tcx, belagX: x - 100, portMX: x + mem / 2, portFX: wand + (ende - wand) / 2, setze: function (pM, pF) {
      const r = M.federspeicher({ pFeder: pF, pMembran: pM }), pl = Math.min(1, pF / M.FEDER.haltedruck);
      const xk = wand + 12 + weg * pl;                                              // Federkolben: bei Druck nach rechts (Feder gespannt)
      kolbenF.setAttribute("x", f(xk)); luftF.setAttribute("width", f(Math.max(0, xk - wand - 6))); luftF.setAttribute("opacity", f(pF > 0.02 ? 0.85 : 0));
      feder.setAttribute("d", federPfad(xk + 16, ende - 14));
      const px = wand - 16 - hub * r.kraft;                                          // Membranplatte: je größer die Bremskraft, desto weiter links
      platte.setAttribute("x", f(px)); luftM.setAttribute("x", f(px + 14)); luftM.setAttribute("width", f(Math.max(0, wand - 16 - px) * (pM > 0.02 ? 1 : 0))); luftM.setAttribute("opacity", f(pM > 0.02 ? 0.85 : 0));
      druckstange.setAttribute("x", f(xk - (hub + 14))); druckstange.setAttribute("width", f(hub + 14));        // Rohr vom Kolben bis zur Platte (Länge so, dass sie bei entspannter Feder die Platte berührt)
      portM.setAttribute("fill", pM > 0.02 ? C.luft : "#2B3631"); portF.setAttribute("fill", pF > 0.02 ? C.luft : "#2B3631");
      const aus = hub * r.kraft;                                                     // Schubstange (Platte -> Bremse) und Belag fahren mit der Platte
      stange.setAttribute("x", f(x - 70 - aus)); stange.setAttribute("width", f(px - (x - 70 - aus)));
      belag.setAttribute("x", f(x - 100 - aus));
      trommel.setAttribute("stroke", r.gebremst ? C.belag : "rgba(250,246,236,.45)"); return r;
    } };
  }

  /* Verzögerung erster Ordnung (Druck baut sich auf/ab): Werte im Raster dt vorab rechnen, Abruf per Zeit */
  function verlauf(dauer, ziel, tau, start) { const dt = 0.05, n = Math.round(dauer / dt) + 1, a = new Array(n); let p = start || 0; for (let i = 0; i < n; i++) { p += (ziel(i * dt) - p) * (1 - Math.exp(-dt / tau)); a[i] = p; } return (t) => a[Math.max(0, Math.min(n - 1, Math.round(t / dt)))]; }
  const klemme = (u) => Math.max(0, Math.min(1, u));

  /* Schema der Zweileitungsbremse (Zugmaschine links, Anhänger rechts, Köpfe in der Mitte). Bühne B (aus buehne()), tx = Textfunktion.
     zustand(t) -> { rotV, gelbV (Verbindung 0…1), pedal (0…1), res0 (Vorrat des Anhängers, solange rot nicht verbunden), rotDruck (optional, Druck auf der roten Leitung; Standard 1), gelbDefekt (optional: gelbe Leitung abgerissen) }
     Die Drücke im Anhänger kommen aus modell.anhaengerBremse. zeichne(t) -> { c (Zylinderdruck), r (Vorrat) } */
  function zweileitung(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, ROT = C.rot, GELB = C.gelb;
    el("rect", { x: 40, y: 150, width: 250, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    el("rect", { x: 580, y: 150, width: 460, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    text(g, tx("l_zug"), 165, 120, { gr: 30, fett: true }); text(g, tx("l_anh"), 810, 120, { gr: 30, fett: true });
    const vorratZ = behaelter(B, { x: 70, y: 190, w: 190, h: 90 });
    const pedal = el("g", null, g), pedalPlatte = el("rect", { x: 100, y: 620, width: 130, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, pedal);
    text(g, tx("l_pedal"), 165, 720, { gr: 26 });
    const rot = { y: 300 }, gelb = { y: 520 };
    const teil = (y, farbe) => ({ l: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: "#2B3631", "stroke-width": 16, "stroke-linecap": "round" }, g), f: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: farbe, "stroke-width": 16, "stroke-linecap": "round", opacity: 0 }, g) });
    const rz = teil(rot.y, ROT), ra = teil(rot.y, ROT), gz = teil(gelb.y, GELB), ga = teil(gelb.y, GELB);
    const setzeTeil = (t, x1, x2, p) => { [t.l, t.f].forEach((e) => { e.setAttribute("x1", f(x1)); e.setAttribute("x2", f(x2)); }); t.f.setAttribute("opacity", f(klemme(p) * 0.95)); };
    const kr = kupplung(B, { x: 430, y: rot.y, farbe: ROT, r: 26, abstand: 150 }), kg = kupplung(B, { x: 430, y: gelb.y, farbe: GELB, r: 26, abstand: 150 });
    const ventil1 = ventil(B, { x: 660, y: 380, w: 130, h: 100 }); text(g, tx("l_ventil"), 752, 570, { gr: 26, anker: "start" });
    const vorratA = behaelter(B, { x: 840, y: 190, w: 170, h: 90 }); text(g, tx("l_behaelter"), 925, 172, { gr: 26 });
    const zyl = zylinder(B, { x: 640, y: 650, w: 150, h: 80 });
    const l1 = leitung(B, [[580, rot.y], [725, rot.y], [725, 380]], { farbe: ROT }), l2 = leitung(B, [[790, 430], [865, 430], [865, 280]], { farbe: ROT });
    const l3 = leitung(B, [[580, gelb.y], [620, gelb.y], [620, 430], [660, 430]], { farbe: GELB }), l4 = leitung(B, [[725, 480], [725, 650]], { farbe: C.luft });
    const rotP = (z) => (z.rotV >= 1 ? (z.rotDruck == null ? 1 : z.rotDruck) : 0);
    const res = verlauf(dauer, (t) => { const z = zustand(t); return rotP(z) >= M.DRUCK.schwelle ? 1 : z.res0; }, 1.5, zustand(0).res0);
    const zielZyl = (t) => { const z = zustand(t); return M.anhaengerBremse({ rot: rotP(z), gelb: z.gelbV >= 1 ? z.pedal : 0, vorratAnh: res(t) }).zyl; };
    const zy = verlauf(dauer, zielZyl, 0.5, zielZyl(0));
    const rotZug = verlauf(dauer, (t) => { const z = zustand(t); return z.rotDruck == null ? 1 : z.rotDruck; }, 0.25, 1);
    return { B: B, zeichne: function (t) {
      const z = zustand(t), r = res(t), c = zy(t), rd = rotZug(t), rp = rotP(z) >= M.DRUCK.schwelle ? Math.min(1, rd) : 0;
      pedalPlatte.setAttribute("y", f(620 + 16 * z.pedal)); pedalPlatte.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      vorratZ.setze(1);
      kr.setze(z.rotV); kg.setze(z.gelbV);
      const dr = (1 - z.rotV) * 75, dg = (1 - z.gelbV) * 75;
      setzeTeil(rz, 290, 430 - 26 - dr, rd); setzeTeil(ra, 430 + 26 + dr, 580, z.rotV >= 1 ? rd : 0);
      setzeTeil(gz, 290, 430 - 26 - dg, z.gelbDefekt ? 0 : z.pedal); setzeTeil(ga, 430 + 26 + dg, 580, z.gelbV >= 1 ? z.pedal : 0);
      l1.setze(rp); l2.setze(rp); l3.setze(z.gelbV >= 1 ? z.pedal : 0); l4.setze(c); vorratA.setze(r); zyl.setze(c); ventil1.setze(c > 0.05 ? 1 : 0);
      return { c: c, r: r };
    }, g: g, kr: kr, kg: kg };
  }


  /* Schema der Zweikreis-Betriebsbremse: zwei Vorratsbehälter (Kreis 1 und 2), Bremsventil mit zwei Ausgängen, zwei Bremszylinder (Vorder- und Hinterachse).
     zustand(t) -> { pedal (0…1), leck: [bool, bool] }. Rechnet mit modell.zweikreis; Behälter entleeren sich bei Leck, der andere Kreis bleibt gefüllt. Gibt { wirkung } zurück. */
  function zweikreis(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, K = [C.luft, "#8FD6A6"];
    const r1 = behaelter(B, { x: 70, y: 200, w: 190, h: 90, farbe: K[0] }), r2 = behaelter(B, { x: 70, y: 480, w: 190, h: 90, farbe: K[1] });
    text(g, tx("l_kreis1"), 165, 180, { gr: 26 }); text(g, tx("l_kreis2"), 165, 460, { gr: 26 });
    const vent = ventil(B, { x: 420, y: 340, w: 150, h: 130 }); text(g, tx("l_bremsventil"), 495, 320, { gr: 26 });
    const z1 = zylinder(B, { x: 700, y: 190, w: 150, h: 80, farbe: K[0] }), z2 = zylinder(B, { x: 700, y: 480, w: 150, h: 80, farbe: K[1] });
    text(g, tx("l_vorderachse"), 790, 170, { gr: 26 }); text(g, tx("l_hinterachse"), 790, 460, { gr: 26 });
    const a1 = leitung(B, [[260, 245], [340, 245], [340, 375], [420, 375]], { farbe: K[0] }), a2 = leitung(B, [[260, 525], [340, 525], [340, 440], [420, 440]], { farbe: K[1] });
    const o1 = leitung(B, [[570, 380], [640, 380], [640, 230], [700, 230]], { farbe: K[0] }), o2 = leitung(B, [[570, 435], [640, 435], [640, 520], [700, 520]], { farbe: K[1] });
    const pedal = el("rect", { x: 420, y: 640, width: 150, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, g); text(g, tx("l_pedal"), 495, 730, { gr: 26 });
    el("rect", { x: 70, y: 850, width: 520, height: 44, rx: 14, fill: "rgba(250,246,236,.1)", stroke: "rgba(250,246,236,.3)", "stroke-width": 2 }, g);
    const wBalken = el("rect", { x: 70, y: 850, width: 0, height: 44, rx: 14, fill: C.gelb }, g); text(g, tx("l_wirkung"), 70, 835, { gr: 26, anker: "start" });
    // Leck: Tropfen unter Behälter 2
    const leck = el("g", { opacity: 0 }, g); [[130, 600], [180, 612], [225, 598]].forEach((p) => el("path", { d: "M" + p[0] + " " + p[1] + " q-10 20 0 28 q10 -8 0 -28", fill: "#FF9A5C" }, leck));
    const V = [0, 1].map((k) => verlauf(dauer, (t) => (zustand(t).leck[k] ? 0 : 1), 1.6, 1));
    const Z = [0, 1].map((k) => verlauf(dauer, (t) => M.zweikreis({ pedal: zustand(t).pedal, leck: [V[0](t) < 0.05, V[1](t) < 0.05] }).zyl[k], 0.4, 0));
    return { B: B, zeichne: function (t) {
      const z = zustand(t), v = [V[0](t), V[1](t)], c = [Z[0](t), Z[1](t)];
      r1.setze(v[0]); r2.setze(v[1]); a1.setze(v[0]); a2.setze(v[1]); o1.setze(c[0]); o2.setze(c[1]); z1.setze(c[0]); z2.setze(c[1]);
      vent.setze(z.pedal > 0.05 ? 1 : 0); pedal.setAttribute("y", f(640 + 16 * z.pedal)); pedal.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      const w = (c[0] + c[1]) / 2; wBalken.setAttribute("width", f(w * 520)); leck.setAttribute("opacity", z.leck[1] || z.leck[0] ? 1 : 0);
      return { wirkung: w, v: v, c: c };
    } };
  }

  window.LKW_PNEU = { zweikreis: zweikreis, zweileitung: zweileitung, verlauf: verlauf, C: C, buehne: buehne, text: text, leitung: leitung, behaelter: behaelter, zylinder: zylinder, ventil: ventil, kupplung: kupplung, kombi: kombi, mix: mix };
})(window);
