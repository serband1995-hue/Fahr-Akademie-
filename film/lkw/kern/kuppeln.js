/* Seitenbilder zum Kuppeln (Filme 3.1, 3.2, 3.3): Sattelzugmaschine, Auflieger mit Stützwinden und Keilen, Druckluftschläuche, geneigter Boden.
   Alle Zeichnungen in Metern (Boden y = 0, Höhe nach oben = negatives y), Fahrtrichtung nach rechts. Die Höhen sind Beispielwerte eines neutralen Fahrzeugs
   (Sattelplatte knapp unter der Unterkante des Aufliegers), Zahlen kommen nicht ins Bild. Bewegungen und Prüfungen: kern/modell.js (sattelUnterfahren, kuppelnZustand, rollen). */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f, SA = window.LKW_MODELL.SATTEL;
  const GELB = "#F2C94C", ROT = "#E5584B", ELEK = "#B9BEC4";
  // Beispielmaße (m): Unterkante des Aufliegers über dem Boden, Sattelplatte der Zugmaschine bei normaler Fahrhöhe
  const MASS = { auflieger: { unterkante: SA.unterkante, zapfenUnten: SA.zapfenUnten, stuetzX: -2.4, achsX: -7.6, vorderKante: 1.55, hinterKante: -10.9, hoehe: 4.0 }, zug: { plattenOben: SA.plattenOben, hinterachse: 0, vorderachse: 3.7, kabineHinten: 2.9, kabineVorn: 5.1, rahmenHinten: -1.2 }, steckdose: { x: 1.56, y: [-2.55, -2.30, -2.05] }, anker: { x: 2.9, y: [-2.55, -2.30, -2.05] } };

  /* Bühne mit geneigtem Boden: Gruppe G in Metern, x entlang des Bodens. winkel in Grad (positiv: Boden fällt nach rechts ab). kamera(xc): Weltpunkt xc liegt auf ox */
  function szene(stage, o) {
    o = o || {}; const S = o.S || 48, ox = o.ox || 540, boden = o.boden || 760, sl = o.winkel || 0;
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#3A463F 60%,#434B45 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    const G = el("g", null, svg), W = { S: S, G: G, svg: svg, xc: 0, ox: ox, boden: boden, winkel: sl };
    el("rect", { x: -400, y: 0, width: 800, height: 400, fill: "#4A524C" }, G);
    el("rect", { x: -400, y: -0.06, width: 800, height: 0.12, fill: "#7A837C" }, G);
    for (let i = -80; i <= 80; i++) el("line", { x1: i * 5, y1: 0.35, x2: i * 5, y2: 0.8, stroke: "rgba(250,246,236,.30)", "stroke-width": 0.06 }, G);   // Streckenmarken alle 5 m
    W.gHinten = el("g", null, G); W.gFz = el("g", null, G); W.gVorn = el("g", null, G);
    W.kamera = function (xc) { W.xc = xc; G.setAttribute("transform", "translate(" + f(ox) + " " + f(boden) + ") rotate(" + f(sl) + ") scale(" + S + ") translate(" + f(-xc) + " 0)"); };
    W.kamera(0);
    // Bildschirmposition eines Punktes (Meter in G) ohne Neigung: für Beschriftungen
    W.px = (x, y) => { const a = sl * Math.PI / 180, dx = (x - W.xc) * S, dy = (y || 0) * S; return [ox + dx * Math.cos(a) - dy * Math.sin(a), boden + dx * Math.sin(a) + dy * Math.cos(a)]; };
    return W;
  }
  function rad(g, cx, r) {
    const w = el("g", { transform: "translate(" + cx + " -" + r + ")" }, g);
    el("circle", { r: r, fill: F.reifen, stroke: "#000", "stroke-width": 0.04 }, w);
    const d = el("g", null, w); el("circle", { r: r * 0.55, fill: "#8D949C" }, d); el("line", { x1: -r * 0.5, y1: 0, x2: r * 0.5, y2: 0, stroke: "#4B5057", "stroke-width": 0.09 }, d);
    return d;
  }

  /* Auflieger (Ursprung: Königszapfen am Boden; x = Fahrtrichtung). setze({ stuetze: 0…1 (ausgefahren), keil: 0/1, licht: 0/1 }) */
  function auflieger(W, o) {
    o = o || {}; const A = MASS.auflieger, g = el("g", null, o.layer || W.gFz);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    const kasten = el("rect", { x: A.hinterKante, y: -A.hoehe, width: A.vorderKante - A.hinterKante, height: A.hoehe - 1.45, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = A.hinterKante + 1.0; x < A.vorderKante - 0.5; x += 1.2) el("line", { x1: x, y1: -A.hoehe + 0.1, x2: x, y2: -1.55, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    el("rect", { x: A.hinterKante + 0.2, y: -1.45, width: A.vorderKante - A.hinterKante - 0.4, height: 0.15, fill: "#3A3E43" }, g);                   // Fahrgestell
    el("path", { d: "M" + A.vorderKante + " -" + (A.unterkante + 0.12) + " L0.6 -" + A.unterkante + " L" + A.vorderKante + " -" + A.unterkante + " Z", fill: "#5A5F66" }, g);   // Aufgleitplatte (vorn angeschrägt)
    el("rect", { x: -0.09, y: -A.unterkante, width: 0.18, height: A.unterkante - A.zapfenUnten, fill: "#33373C" }, g);                                                            // Königszapfen
    el("rect", { x: A.vorderKante - 0.05, y: -3.2, width: 0.06, height: 1.7, fill: "#9AA3AC" }, g);                                                      // Stirnwand
    // Stützwinde (Seitenansicht: ein Bein)
    const bein = el("rect", { x: A.stuetzX - 0.1, y: -A.unterkante, width: 0.2, height: 0.85, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.04 }, g);
    const fuss = el("rect", { x: A.stuetzX - 0.3, y: -0.12, width: 0.6, height: 0.1, rx: 0.03, fill: "#33373C" }, g);
    const kurbel = el("g", null, g); el("line", { x1: A.stuetzX + 0.1, y1: -0.9, x2: A.stuetzX + 0.55, y2: -0.9, stroke: "#23262A", "stroke-width": 0.06 }, kurbel); el("circle", { cx: A.stuetzX + 0.55, cy: -0.9, r: 0.07, fill: "#23262A" }, kurbel);
    // Räder (drei Achsen)
    const dreherA = [A.achsX - 1.3, A.achsX, A.achsX + 1.3].map((cx) => rad(g, cx, 0.5));
    // Keile (vor und hinter dem letzten Rad)
    const keil = el("g", { opacity: 0 }, g);
    el("path", { d: "M" + (A.achsX - 1.3 - 0.52) + " 0 L" + (A.achsX - 1.3 - 0.95) + " 0 L" + (A.achsX - 1.3 - 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#845408", "stroke-width": 0.04 }, keil);
    el("path", { d: "M" + (A.achsX - 1.3 + 0.52) + " 0 L" + (A.achsX - 1.3 + 0.95) + " 0 L" + (A.achsX - 1.3 + 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#845408", "stroke-width": 0.04 }, keil);
    // Steckdosen an der Stirnwand: gelb (Bremse), rot (Vorrat), elektrisch
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.steckdose.x, cy: MASS.steckdose.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, g));
    const glut = el("circle", { cx: A.hinterKante, cy: -1.75, r: 0.55, fill: "rgba(255,59,43,.7)", opacity: 0 }, g), licht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: F.ruecklicht, opacity: 0.9 }, g), bremslicht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: "#FF3B2B", opacity: 0 }, g);
    return { g: g, setze: function (x, s) {
      s = s || {}; g.setAttribute("transform", "translate(" + f(x) + " 0)"); dreherA.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + A.achsX) / 0.5) * 57.2958 % 360) + ")"));
      const e = s.stuetze == null ? 1 : s.stuetze; bein.setAttribute("height", f(A.unterkante - 0.45 * (1 - e))); fuss.setAttribute("y", f(-0.12 - 0.45 * (1 - e) * 1));
      kurbel.setAttribute("transform", "translate(0 " + f(-0.45 * (1 - e) * 0) + ")");
      keil.setAttribute("opacity", s.keil == null ? 0 : Number(s.keil)); bremslicht.setAttribute("opacity", s.bremst ? 1 : 0); glut.setAttribute("opacity", s.bremst ? 0.45 : 0); licht.setAttribute("opacity", s.licht == null ? 0.9 : (s.licht ? 1 : 0.35));
    } };
  }

  /* Sattelzugmaschine (Ursprung: Hinterachse am Boden). setze(x, luft): luft = Höhenänderung der Luftfederung in m (positiv = angehoben) */
  function zugmaschine(W, o) {
    o = o || {}; const Z = MASS.zug, g = el("g", null, o.layer || W.gFz), karo = el("g", null, g);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: Z.rahmenHinten, y: -1.15, width: 5.9, height: 0.16, fill: "#3A3E43" }, karo);
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 1.5, height: 0.12, rx: 0.03, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.03 }, karo);               // Sattelplatte (Oberseite bei −1,25 m)
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 0.3, height: 0.12, fill: "#5A5F66" }, karo);
    el("path", { d: "M" + Z.kabineHinten + " -1.1 L" + Z.kabineHinten + " -3.3 L4.3 -3.3 L" + Z.kabineVorn + " -2.0 L" + Z.kabineVorn + " -1.1 Z", fill: F.kabine, stroke: F.kabineD, "stroke-width": 0.07 }, karo);
    el("path", { d: "M3.2 -2.2 L3.2 -3.05 L4.2 -3.05 L4.85 -2.2 Z", fill: F.glas }, karo);
    el("rect", { x: Z.kabineVorn - 0.12, y: -1.5, width: 0.12, height: 0.3, fill: F.scheinwerfer }, karo);
    el("rect", { x: 3.0, y: -1.0, width: 1.0, height: 0.55, rx: 0.05, fill: "#5A5F66" }, karo);
    // Anschlusspunkte hinter der Kabine (gelb, rot, Elektrik)
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.anker.x, cy: MASS.anker.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, karo));
    // Betätigung der Sattelkupplung: Hebel hinten an der Platte (offen = angehoben) und Sicherung (Falle); zu = 1: geschlossen und gesichert
    const hebel = el("g", { transform: "translate(-0.15 -1.34)" }, karo); el("line", { x1: 0, y1: 0, x2: -0.45, y2: 0, stroke: "#23262A", "stroke-width": 0.08, "stroke-linecap": "round" }, hebel); el("circle", { cx: -0.45, cy: 0, r: 0.07, fill: "#23262A" }, hebel);
    const falle = el("rect", { x: -0.12, y: -1.36, width: 0.2, height: 0.1, rx: 0.03, fill: "#FF9A5C", stroke: "#23262A", "stroke-width": 0.03 }, karo);
    const dreher = [rad(g, Z.hinterachse, 0.5), rad(g, Z.vorderachse, 0.5)];
    return { g: g, karo: karo, hebelPos: { x: -0.4, y: -1.34 }, setze: function (x, luft) { g.setAttribute("transform", "translate(" + f(x) + " 0)"); karo.setAttribute("transform", "translate(0 " + f(-(luft || 0)) + ")"); dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + SA.e) / 0.5) * 57.2958 % 360) + ")")); },
      kupplung: function (zu) { hebel.setAttribute("transform", "translate(-0.15 -1.34) rotate(" + f((1 - zu) * -55) + ")"); falle.setAttribute("fill", zu > 0.5 ? "#8FD6A6" : "#FF9A5C"); falle.setAttribute("y", f(zu > 0.5 ? -1.31 : -1.40)); } };
  }

  /* Schlauch von (x1,y1) nach (x2,y2) mit Durchhang; Länge L (m): je kürzer der Abstand, desto mehr Durchhang. */
  function schlauch(W, farbe, o) {
    o = o || {}; const g = el("g", null, o.layer || W.gVorn), L = o.laenge || 1.6;
    const p = el("path", { d: "", fill: "none", stroke: farbe, "stroke-width": 0.1, "stroke-linecap": "round" }, g), kopf = el("circle", { r: 0.12, fill: farbe, stroke: "#23262A", "stroke-width": 0.04 }, g);
    return { g: g, setze: function (a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y), sack = Math.max(0.1, Math.sqrt(Math.max(0, L * L - d * d)) * 0.5), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + sack;
      p.setAttribute("d", "M" + f(a.x) + " " + f(a.y) + " Q" + f(mx) + " " + f(my + sack * 0.3) + " " + f(b.x) + " " + f(b.y)); kopf.setAttribute("cx", f(b.x)); kopf.setAttribute("cy", f(b.y));
    } };
  }
  // Anschlusspunkt k (0 gelb, 1 rot, 2 Elektrik) hinter der Kabine in Weltkoordinaten, wenn der Zug mit dem Königszapfen bei kp gekuppelt steht (Zugmaschine bei kp − e, angehoben bis Kontakt)
  const ankerWelt = (kp, k) => ({ x: kp - SA.e + MASS.anker.x, y: MASS.anker.y[k] - (SA.unterkante - SA.plattenOben) });
  const ruheWelt = (kp, k) => { const a = ankerWelt(kp, k); return { x: a.x - 0.15, y: a.y + 0.55 }; };
  /* Pille an Bildschirmposition (Mitte) mit Deckkraft a; Hinweislinie (Pixel) von der Pille zum Punkt */
  function platz(p, x, y, a) { p.style.left = f(Math.max(270, Math.min(810, x))) + "px"; p.style.top = f(y) + "px"; p.style.opacity = a; }
  function leiter(W, farbe) {
    const g = el("g", { opacity: 0 }, W.svg), l = el("line", { stroke: farbe || F.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g), c = el("circle", { r: 5, fill: farbe || F.creme }, g);
    return { g: g, setze: (x1, y1, x2, y2, a) => { l.setAttribute("x1", f(x1)); l.setAttribute("y1", f(y1)); l.setAttribute("x2", f(x2)); l.setAttribute("y2", f(y2)); c.setAttribute("cx", f(x2)); c.setAttribute("cy", f(y2)); g.style.opacity = a; } };
  }
  // Seitenansicht mit Zugmaschine und Auflieger (Maßstab S, Kamera xc, Blickhöhe yc)
  function seite(st, S, xc, yc, ox) { const W = szene(st, { S: S, ox: ox || 540, boden: 540 + yc * S }); W.kamera(xc); return { W: W, au: auflieger(W), zm: zugmaschine(W) }; }
  window.LKW_KUPPELN = { ankerWelt: ankerWelt, ruheWelt: ruheWelt, platz: platz, leiter: leiter, seite: seite, MASS: MASS, GELB: GELB, ROT: ROT, szene: szene, auflieger: auflieger, zugmaschine: zugmaschine, schlauch: schlauch };
})(window);
