/* Szenen des Films 5.2 „Toter Winkel“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Alles kommt aus dem Rechenmodell (kern/modell.js): Sichtfeld des Fahrers (sichtfeld, sichtPolygone, verdecktVorn) und die Abbiegeszene mit
   Radfahrer (radfahrerAbbiegen, Art A = ohne neuen Blick, Art B = warten und durchlassen). Die Szenen zeichnen nur; sie behaupten nichts, was das Modell nicht gerechnet hat.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, SE = window.LKW_SEITE, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Toter Winkel" });
    const starts = P.starts, FZ = M.FAHRZEUGE.solo, SF = M.sichtfeld(FZ), POLY = M.sichtPolygone(FZ);
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", BLAU = "#7FC6E8", GOLD = F.gold;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    const pille = (st, text, x, y, farbe, o2) => BK.pille(st, text, x, y, Object.assign({ punkt: farbe }, o2 || {}));
    const zeige = (p, a) => { p.style.opacity = a; };
    const pfad = (pts, s) => "M" + pts.map((p) => f(p.x * (s || 1)) + " " + f(p.y * (s || 1))).join(" L") + " Z";
    const interp = (kf, t) => {   // Zeitverlauf: Stützpunkte [[Filmzeit, Rechenzeit], ...], dazwischen linear
      if (t <= kf[0][0]) return kf[0][1];
      for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i]; return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
      return kf[kf.length - 1][1];
    };

    /* ---------- Radfahrer von oben (Ursprung Mitte, x vorn) ---------- */
    function radfahrer(layer, W) {
      const g = el("g", null, layer), S = W.S;
      g.style.filter = "drop-shadow(0 " + (5 / S).toFixed(3) + "px " + (5 / S).toFixed(3) + "px rgba(0,0,0,.4))";
      const ring = el("ellipse", { cx: 0, cy: 0, rx: 1.35, ry: 0.85, fill: "none", stroke: WARN, "stroke-width": 0.1, opacity: 0, "stroke-dasharray": "0.3 0.2" }, g);
      el("rect", { x: -0.98, y: -0.07, width: 0.34, height: 0.14, rx: 0.06, fill: "#1B1D1A" }, g);   // Rücklicht-Seite nicht nötig: neutrales Rad hinten
      el("rect", { x: -1.0, y: -0.06, width: 0.38, height: 0.12, rx: 0.05, fill: "#23262A" }, g);
      el("rect", { x: 0.58, y: -0.06, width: 0.38, height: 0.12, rx: 0.05, fill: "#23262A" }, g);
      el("line", { x1: -0.7, y1: 0, x2: 0.75, y2: 0, stroke: "#B9BEC4", "stroke-width": 0.07, "stroke-linecap": "round" }, g);          // Rahmen
      el("line", { x1: 0.68, y1: -0.3, x2: 0.68, y2: 0.3, stroke: "#23262A", "stroke-width": 0.06, "stroke-linecap": "round" }, g);      // Lenker
      el("line", { x1: 0.05, y1: -0.2, x2: 0.66, y2: -0.28, stroke: "#59A8A0", "stroke-width": 0.1, "stroke-linecap": "round" }, g);      // Arme
      el("line", { x1: 0.05, y1: 0.2, x2: 0.66, y2: 0.28, stroke: "#59A8A0", "stroke-width": 0.1, "stroke-linecap": "round" }, g);
      el("ellipse", { cx: 0.02, cy: 0, rx: 0.17, ry: 0.3, fill: "#59A8A0", stroke: "#2E6B66", "stroke-width": 0.04 }, g);                 // Schultern
      el("circle", { cx: 0.2, cy: 0, r: 0.15, fill: "#F2C16E", stroke: "#8F5A14", "stroke-width": 0.04 }, g);                              // Kopf mit Helm (ohne Gesicht)
      return { g: g, setze: function (x, y) { const p = W.px(x, y); g.setAttribute("transform", "translate(" + f(p[0]) + " " + f(p[1]) + ") scale(" + S + ")"); }, ring: ring };
    }
    // Sichtfelder (Spiegelkeile blau, Blick durch die Scheibe grün) in Fahrzeugkoordinaten; die Gruppe wird mit dem Lkw bewegt
    function sichtGruppe(layer, W, az) {
      const g = el("g", { opacity: 0 }, layer), gm = el("g", { opacity: 0 }, g), gs = el("g", { opacity: 0 }, g);
      POLY.scheibe.forEach((q) => el("path", { d: pfad(q.pts), fill: "rgba(143,214,166,.20)", stroke: "rgba(143,214,166,.55)", "stroke-width": 0.06 }, gs));
      POLY.spiegel.forEach((q) => el("path", { d: pfad(q.pts), fill: "rgba(127,198,232,.26)", stroke: "rgba(127,198,232,.65)", "stroke-width": 0.06 }, gm));
      return { g: g, spiegel: gm, scheibe: gs, setze: function (z) { const A = W.px(z.A.x, z.A.y); g.setAttribute("transform", "translate(" + f(A[0]) + " " + f(A[1]) + ") rotate(" + f(z.hz * BK.DEG) + ") scale(" + W.S + ")"); } };
    }
    const stat = (x, y) => ({ A: { x: x, y: y }, hz: 0, F: { x: x + FZ.L, y: y, h: 0 } });

    /* ---------- K1: Fahrer sitzt hoch (Seitenansicht, gerechnete Sichtlinie) ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const V = SE.szene(st, { S: 50, px0: 400, boden: 720 }); V.kamera(0);
      const lk = SE.lkw(V, 6.6); lk.setze(0, false, 0);
      const svg = V.gUeber.ownerSVGElement, defs = el("defs", null, svg);
      const pat = el("pattern", { id: "sch52", width: 0.3, height: 0.3, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
      el("rect", { width: 0.3, height: 0.3, fill: "rgba(237,174,79,.22)" }, pat); el("rect", { width: 0.12, height: 0.3, fill: "rgba(237,174,79,.8)" }, pat);
      const G = el("g", { transform: "translate(400 720) scale(50)" }, V.gUeber);
      const E = { x: SF.auge.x - FZ.L - FZ.vorn, y: -M.SICHT.he }, Q = { x: 0, y: -M.SICHT.hw }, H = { x: M.verdecktVorn(0), y: 0 };
      // Hatch unter der Sichtlinie: Boden, den der Fahrer nicht sieht
      const hatch = el("path", { d: "M0 -" + M.SICHT.hw + " L" + H.x + " 0 L0 0 Z", fill: "url(#sch52)", opacity: 0 }, G);
      const strahl = el("line", { x1: E.x, y1: E.y, x2: E.x, y2: E.y, stroke: GOLD, "stroke-width": 0.05, "stroke-dasharray": "0.22 0.16", "stroke-linecap": "round" }, G);
      const auge = el("g", { opacity: 0 }, G); el("circle", { cx: E.x, cy: E.y, r: 0.17, fill: F.creme, stroke: "#23262A", "stroke-width": 0.05 }, auge); el("circle", { cx: E.x + 0.04, cy: E.y, r: 0.07, fill: "#23262A" }, auge);
      // Kind (ohne Gesicht), 1,2 m
      const kind = el("g", { opacity: 0 }, G), HK = 1.2, kf = "#F2C16E";
      el("rect", { x: -0.11, y: -0.5, width: 0.07, height: 0.5, rx: 0.03, fill: kf }, kind); el("rect", { x: 0.04, y: -0.5, width: 0.07, height: 0.5, rx: 0.03, fill: kf }, kind);
      el("rect", { x: -0.16, y: -0.98, width: 0.32, height: 0.52, rx: 0.1, fill: kf }, kind); el("circle", { cx: 0, cy: -(HK - 0.14), r: 0.14, fill: kf }, kind);
      const geist = el("rect", { x: -0.3, y: -HK - 0.08, width: 0.6, height: HK + 0.16, rx: 0.2, fill: "none", stroke: WARN, "stroke-width": 0.05, "stroke-dasharray": "0.14 0.1" }, kind);
      const pa = pille(st, tx("l_auge"), 230, 400, F.creme), pb = pille(st, tx("l_boden"), 720, 330, GOLD), pk1 = pille(st, tx("l_kind_weg"), 0, 0, WARN), pk2 = pille(st, tx("l_kind_da"), 0, 0, GRUEN);
      const xE = V.px(E.x), yE = 720 + E.y * 50, ln = BK.leitlinie(V, 230, 436, xE, yE, F.creme), lb = BK.leitlinie(V, 700, 366, V.px(1.9), 700, GOLD);
      const xk = (t) => t < 14 ? 14 : t < 26 ? 14 - 13.4 * (t - 14) / 12 : t < 33.5 ? 0.6 : t < 41 ? 0.6 + 7.4 * (t - 33.5) / 7.5 : 8;
      uhr(T0, ch.dauer, function (t) {
        const u = klemme((t - 5) / 3);
        strahl.setAttribute("x2", f(E.x + (H.x - E.x) * u)); strahl.setAttribute("y2", f(E.y + (H.y - E.y) * u)); strahl.style.opacity = klemme((t - 5) / 0.5);
        auge.style.opacity = klemme((t - 3.5) / 0.6); zeige(pa, fenster(t, 3.8, 40, 0.5)); ln.style.opacity = fenster(t, 3.8, 40, 0.5);
        hatch.style.opacity = klemme((t - 11.5) / 1.2); zeige(pb, fenster(t, 12.5, 40, 0.5)); lb.style.opacity = fenster(t, 12.5, 40, 0.5);
        const x = xk(t), sichtbar = x >= M.verdecktVorn(1.2) - 1e-9;
        kind.setAttribute("transform", "translate(" + f(x) + " 0)"); kind.style.opacity = klemme((t - 13.5) / 0.6);
        geist.style.opacity = sichtbar ? 0 : 1;
        const px = V.px(x), py = 720 - HK * 50 - 120;
        pk1.style.left = pk2.style.left = f(Math.min(920, Math.max(px + 110, 580))) + "px"; pk1.style.top = pk2.style.top = f(py) + "px";
        zeige(pk1, t > 14 && !sichtbar ? klemme((t - 14) / 0.4) : 0); zeige(pk2, t > 14 && sichtbar ? klemme((t - 14) / 0.4) : 0);
      });
    }

    /* ---------- K2: Draufsicht, Sichtfelder und toter Winkel ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, { S: 28, ox: 392, oy: 540, fussOpazitaet: 0.9, id: "k2" });
      const fz = BK.fahrzeug(W.gFz, FZ, W); fz.setze(stat(0, 0), 0, false, 0);
      const sg = sichtGruppe(W.gBand, W); sg.setze(stat(0, 0)); sg.g.style.opacity = 1;
      // Toter Winkel: Boden, den keine Sichtquelle erreicht (Zellen 0,1 m, gerechnet mit sichtfeld.quelle)
      const ctx = W.ctx, cell = 0.1, c = W.S * cell + 1;
      ctx.fillStyle = W.muster;
      for (let x = -13; x <= 16; x += cell) for (let y = -7; y <= 7; y += cell) if (SF.quelle(x, y, 0) === null) { const q = W.px(x, y); ctx.fillRect(q[0], q[1], c, c); }
      W.canvas.style.opacity = 0;
      const lp = (text, wx, wy, farbe, px, py) => { const q = W.px(wx, wy), e = pille(st, text, px, py, farbe), l = BK.leitlinie(W, px, py + (py < q[1] ? 34 : -34), q[0], q[1], farbe); return { e: e, l: l, an: (a) => { zeige(e, a); l.style.opacity = a; } }; };
      const pS = lp(tx("l_spiegel"), 5.02, 1.65, BLAU, 760, 760), pW = lp(tx("l_scheibe"), 8.0, -2.2, GRUEN, 760, 300);
      const pT = pille(st, tx("l_toter"), 540, 150, GOLD, { klasse: "gross" });
      const pR = lp(tx("l_rechts"), 7.0, 3.6, GOLD, 760, 900), pV = lp(tx("l_vorn"), 8.2, 0, GOLD, 760, 150), pH = lp(tx("l_hinten"), -8, 0, GOLD, 220, 400);
      uhr(T0, ch.dauer, function (t) {
        sg.spiegel.style.opacity = glatt((t - 5) / 1.5); sg.scheibe.style.opacity = glatt((t - 15) / 1.5);
        pS.an(fenster(t, 6, 24, 0.5)); pW.an(fenster(t, 16, 24, 0.5));
        W.canvas.style.opacity = 0.9 * glatt((t - 25) / 1.5);
        zeige(pT, fenster(t, 26, 36, 0.5)); pR.an(fenster(t, 37, ch.dauer - 1, 0.5)); pV.an(fenster(t, 37.5, ch.dauer - 1, 0.5)); pH.an(fenster(t, 49, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K3 / K4: Rechtsabbiegen mit Radfahrer (Rechenmodell radfahrerAbbiegen) ---------- */
    const OFF = 30;   // Rechenkoordinate x − OFF = Bühnenkoordinate (Kurvenanfang bei x = 2 m)
    function abbiegen(sc, i, T0, ch, art) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, { S: 36, ox: 540, oy: 380, raster: false, id: "k" + i });
      const R = M.radfahrerAbbiegen(art), fr = R.frames, dt = R.P.dt;
      const raster = st.querySelector(".raster"), base = el("g", null, null); raster.insertBefore(base, raster.firstChild);
      const X = (x) => W.px(x, 0)[0], Y = (y) => W.px(0, y)[1], px26 = W.S;
      // Straßenbild: Gras, Fahrbahnen, Radstreifen, Gehweg mit gerundeter Ecke (Radius 8 m), Markierungen
      const rc = 10, sx = 11, sw = 7;
      el("rect", { x: -3000, y: -1000, width: 7000, height: 4000, fill: "#34513A" }, base);
      el("rect", { x: X(-70), y: Y(-5.25), width: X(48) - X(-70), height: Y(1.75) - Y(-5.25), fill: "#4A524C" }, base);              // Hauptstraße (zwei Fahrstreifen)
      el("rect", { x: X(sx), y: Y(-5.25), width: sw * px26, height: 1200, fill: "#4A524C" }, base);                                   // Seitenstraße
      el("path", { d: "M" + X(sx - rc) + " " + Y(3.25) + " L" + X(sx) + " " + Y(3.25) + " L" + X(sx) + " " + Y(3.25 + rc) + " A" + rc * px26 + " " + rc * px26 + " 0 0 0 " + X(sx - rc) + " " + Y(3.25) + " Z", fill: "#4A524C" }, base);   // Ausrundung
      el("rect", { x: X(-70), y: Y(1.75), width: X(48) - X(-70), height: (1.5) * px26, fill: "#8E5A4E" }, base);                         // Radstreifen
      const gw = el("path", { d: "M" + X(-70) + " " + Y(4.375) + " L" + X(sx - rc) + " " + Y(4.375) + " A" + (rc - 1.125) * px26 + " " + (rc - 1.125) * px26 + " 0 0 1 " + X(sx - 1.125) + " " + Y(3.25 + rc) + " L" + X(sx - 1.125) + " 1200", fill: "none", stroke: "#8A8F88", "stroke-width": 2.25 * px26 }, base);   // Gehweg
      el("rect", { x: X(sx + sw), y: Y(3.25), width: 2.25 * px26, height: 1200, fill: "#8A8F88" }, base);                                // Gehweg Ostseite
      el("rect", { x: X(sx + sw), y: Y(3.25), width: X(48) - X(sx + sw), height: 2.25 * px26, fill: "#8A8F88" }, base);
      const strich = (x1, y1, x2, y2, d, w, c) => el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c || "rgba(250,246,236,.85)", "stroke-width": w || 3, "stroke-dasharray": d || "none" }, base);
      strich(X(-70), Y(-1.75), X(sx), Y(-1.75), "26 22");                                  // Mittellinie Hauptstraße
      strich(X(sx + sw), Y(-1.75), X(48), Y(-1.75), "26 22");
      strich(X(-70), Y(1.75), X(sx - rc), Y(1.75), "none", 3);                             // Radstreifenlinie
      strich(X(sx + sw / 2), Y(5.5), X(sx + sw / 2), 1200, "26 22");                      // Mittellinie Seitenstraße
      // Hinweis „Radstreifen“: Fahrradsymbol (Piktogramm) kommt nicht vor; die Farbe zeigt ihn
      const lkw = BK.fahrzeug(W.gFz, FZ, W), rad = radfahrer(W.gFz, W), sg = sichtGruppe(W.gBand, W), pan = [base, W.gBand, W.gFz, W.gSpur, W.gUeber];
      const pLabel = pille(st, tx("l_sp_sicht"), 0, 0, GRUEN), pGefahr = pille(st, tx("l_gefahr"), 540, 930, WARN, { klasse: "gross" }), pWarten = pille(st, tx("l_warten"), 540, 960, F.creme, { klasse: "gross" });
      // stabile Sichtanzeige (nur wechseln, wenn der neue Zustand 0,5 s anhält)
      const stabil = []; { let akt = fr[0].sicht, kand = akt, seit = 0; fr.forEach((q, k) => { if (q.sicht !== kand) { kand = q.sicht; seit = 0; } else seit += dt; if (kand !== akt && seit >= 0.45) akt = kand; stabil.push(akt); }); }
      const kf = art === "A" ? [[0, 0], [4, 0], [13, 2.95], [19, 5.95], [24, 5.95], [25, 5.95], [36, R.frames[fr.length - 1].t], [ch.dauer, R.frames[fr.length - 1].t]]
        : [[0, 0], [4, 0], [16, 2.5], [25, 5.9], [33, R.losBei], [52, fr[fr.length - 1].t], [ch.dauer, fr[fr.length - 1].t]];
      uhr(T0, ch.dauer, function (t) {
        const idx = Math.max(0, Math.min(fr.length - 1, Math.round(interp(kf, t) / dt))), q = fr[idx], z = q.z;
        const zz = { A: { x: z.A.x - OFF, y: z.A.y }, hz: z.hz, F: { x: z.F.x - OFF, y: z.F.y, h: z.F.h } };
        const bl = Math.floor(t * 2.5) % 2 === 0, brems = art === "A" ? (idx > 0 && q.v < fr[Math.max(0, idx - 1)].v + 1e-9 && q.t < 2.0) : (q.t >= 2.5 && q.t < R.losBei - 0.3);
        const xc = Math.min(11, zz.F.x + 2), yc = Math.max(0, zz.F.y - 7), dxp = -xc * W.S, dyp = -yc * W.S;
        pan.forEach((g) => g.setAttribute("transform", "translate(" + f(dxp) + " " + f(dyp) + ")"));
        lkw.setze(zz, bl ? 1 : 0, brems, 0); sg.setze(zz);
        sg.g.style.opacity = 0.7 * glatt((t - 1.0) / 1.0); sg.spiegel.style.opacity = 1; sg.scheibe.style.opacity = 1;
        rad.setze(q.bx - OFF, q.by, 0);
        const sicht = stabil[idx], farbe = sicht === "verdeckt" ? WARN : GRUEN, txt = sicht === "spiegel" ? tx("l_sp_sicht") : sicht === "scheibe" ? tx("l_sch_sicht") : tx("l_verdeckt");
        pLabel.lastChild.nodeValue = txt; pLabel.querySelector("i").style.background = farbe; pLabel.style.borderColor = farbe;
        const pp = W.px(q.bx - OFF, q.by); pLabel.style.left = f(Math.max(290, Math.min(790, pp[0] + dxp))) + "px"; pLabel.style.top = f(pp[1] + dyp + 120) + "px"; const auf = pp[0] + dxp > 60 && pp[0] + dxp < 1020 && pp[1] + dyp > 0 && pp[1] + dyp < 1000;
        zeige(pLabel, auf ? glatt((t - 2) / 0.6) : 0);
        rad.ring.style.opacity = sicht === "verdeckt" && auf ? 0.6 + 0.4 * Math.sin(t * 6) : 0;
        const ende = art === "A" && R.kontakt && idx === fr.length - 1;
        zeige(pGefahr, art === "A" ? (ende ? fenster(t, 35, ch.dauer, 0.4) * (0.75 + 0.25 * Math.sin(t * 7)) : 0) : 0);
        zeige(pWarten, art === "B" ? fenster(t, 25.5, 32.5, 0.5) : 0);
      });
    }
    function K3(sc, i, T0, ch) { abbiegen(sc, i, T0, ch, "A"); }
    function K4(sc, i, T0, ch) { abbiegen(sc, i, T0, ch, "B"); }

    /* ---------- K5: Merke ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true);
      const W = BK.welt(st, { S: 26, ox: 364, oy: 540, raster: false, id: "k5" });
      const lkw = BK.fahrzeug(W.gFz, FZ, W); lkw.setze(stat(-5, 0), 1, false, 0);
      const sg = sichtGruppe(W.gBand, W); sg.setze(stat(-5, 0)); sg.g.style.opacity = 1; sg.spiegel.style.opacity = 1;
      const rad = radfahrer(W.gFz, W); rad.setze(3, 2.4, 0);
      uhr(T0, ch.dauer, function (t) { lkw.setze(stat(-5, 0), Math.floor(t * 2.5) % 2 === 0 ? 1 : 0, false, 0); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
