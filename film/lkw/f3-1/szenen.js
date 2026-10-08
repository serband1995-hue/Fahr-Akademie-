/* Szenen des Films 3.1 „Ankuppeln“ (Sattelzug) – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Höhen und Bewegungen kommen aus kern/modell.js (SATTEL, sattelUnterfahren, sattelTreffer); Schrittfolge nach DGUV Information 214-080 (Kap. 2.3.1 Aufsatteln).
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, KU = window.LKW_KUPPELN, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Ankuppeln" });
    const starts = P.starts, FZ = M.FAHRZEUGE.sattelzug, SA = M.SATTEL, MA = KU.MASS;
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, GELB = KU.GELB, ROT = KU.ROT;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    const lerp = (a, b, u) => a + (b - a) * u;
    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    // Pille an Bildschirmposition setzen, mit Deckkraft a
    function platz(p, x, y, a) { p.style.left = f(Math.max(270, Math.min(810, x))) + "px"; p.style.top = f(y) + "px"; p.style.opacity = a; }
    // Hinweislinie (Pixel) von Pille zu Punkt; Gruppe in der Schicht der Bühne
    function leiter(W, farbe) {
      const g = el("g", { opacity: 0 }, W.svg), l = el("line", { stroke: farbe || F.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g), c = el("circle", { r: 5, fill: farbe || F.creme }, g);
      return { g: g, setze: (x1, y1, x2, y2, a) => { l.setAttribute("x1", f(x1)); l.setAttribute("y1", f(y1)); l.setAttribute("x2", f(x2)); l.setAttribute("y2", f(y2)); c.setAttribute("cx", f(x2)); c.setAttribute("cy", f(y2)); g.style.opacity = a; } };
    }
    const interp = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i], u = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * glatt(u); } return kf[kf.length - 1][1]; };

    /* gemeinsame Seitenansicht (Zugmaschine + Auflieger), Weltmaßstab S, Kamera xc, Blick auf Höhe yc (m) */
    function seite(st, S, xc, yc, ox) {
      const W = KU.szene(st, { S: S, ox: ox || 540, boden: 540 + yc * S });
      W.kamera(xc);
      const au = KU.auflieger(W), zm = KU.zugmaschine(W);
      return { W: W, au: au, zm: zm };
    }

    /* ---------- K1: Sichern ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 64, 1.5, 2.0), W = V.W;
      const xA = 4.6; V.zm.setze(xA, 0); V.zm.kupplung(0); V.au.setze(0, { stuetze: 1, keil: 0 });
      const defs = el("defs", null, W.svg), pat = el("pattern", { id: "gef31", width: 0.3, height: 0.3, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
      el("rect", { width: 0.3, height: 0.3, fill: "rgba(237,174,79,.20)" }, pat); el("rect", { width: 0.12, height: 0.3, fill: "rgba(237,174,79,.8)" }, pat);
      const knopf = el("g", { opacity: 0 }, W.gVorn); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.08 }, knopf); el("circle", { cx: 0.9, cy: -0.95, r: 0.16, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, knopf);
      const gef = el("rect", { x: MA.auflieger.vorderKante, y: -3.3, width: (xA + MA.zug.rahmenHinten) - MA.auflieger.vorderKante, height: 3.3, fill: "url(#gef31)", opacity: 0 }, W.gVorn);
      const pf = pille(st, tx("l_fest"), ROT), pk = pille(st, tx("l_keile"), GOLD), pn = pille(st, tx("l_niemand"), WARN), lf = leiter(W, ROT), lk = leiter(W, GOLD), ln = leiter(W, WARN);
      const keilX = MA.auflieger.achsX - 1.3 - 0.75, kam = [[0, 1.5], [10, 1.5], [14, -5.5], [22, -5.5], [26, 2.8], [ch.dauer, 2.8]];
      uhr(T0, ch.dauer, function (t) {
        W.kamera(interp(kam, t));
        const a1 = fenster(t, 3.5, ch.dauer - 1, 0.6), a2 = fenster(t, 12.5, ch.dauer - 1, 0.6), a3 = fenster(t, 24.5, ch.dauer - 1, 0.6);
        knopf.style.opacity = a1; V.au.setze(0, { stuetze: 1, keil: a2 }); gef.style.opacity = a3 * 0.9;
        const k = W.px(0.9, -1.0), kk = W.px(keilX, -0.15), g3 = W.px((MA.auflieger.vorderKante + xA + MA.zug.rahmenHinten) / 2, -1.7);
        platz(pf, 540, 260, a1); lf.setze(540, 294, k[0], k[1], a1);
        platz(pk, 540, kk[1] + 150, a2); lk.setze(540, kk[1] + 118, kk[0], kk[1], a2);
        platz(pn, 540, 200, a3); ln.setze(540, 234, g3[0], g3[1], a3);
      });
    }

    /* ---------- K2: Draufsicht, Gerade heranfahren ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, { S: 40, ox: 160, oy: 540, raster: false, id: "k2" });
      const fz = BK.fahrzeug(W.gFz, FZ, W);
      const Kx = FZ.D;   // Königszapfen des stehenden Aufliegers (Hinterachse des Aufliegers bei x = 0)
      const stand = (ax, ay, hz) => ({ A: { x: ax, y: ay }, hz: hz, F: { x: ax + FZ.L * Math.cos(hz), y: ay + FZ.L * Math.sin(hz), h: hz }, T: { x: 0, y: 0 }, ha: 0 });
      const mitte = BK.el("line", { stroke: "rgba(250,246,236,.55)", "stroke-width": 2.5, "stroke-dasharray": "14 10" }, W.gUeber);
      const q0 = W.px(-4, 0), q1 = W.px(24, 0); mitte.setAttribute("x1", f(q0[0])); mitte.setAttribute("y1", f(q0[1])); mitte.setAttribute("x2", f(q1[0])); mitte.setAttribute("y2", f(q1[1]));
      const ring = el("circle", { r: 26, fill: "none", stroke: WARN, "stroke-width": 5, opacity: 0 }, W.gUeber);
      const ps = BK.pille(st, tx("l_schief"), 270, 300, { punkt: WARN }), pg = BK.pille(st, tx("l_gerade"), 270, 300, { punkt: GRUEN }), pz1 = BK.pille(st, tx("l_zapfen_nicht"), 700, 780, { punkt: WARN, klasse: "gross" }), pz2 = BK.pille(st, tx("l_zapfen_ja"), 700, 780, { punkt: GRUEN, klasse: "gross" });
      const WINKEL = 7, D0 = 6.0;                 // schiefer Versuch: 7° schief, 6 m vor dem Zapfen
      const tr1 = M.sattelTreffer({ winkel: WINKEL, versatz: 0, abstand: D0 }), tr2 = M.sattelTreffer({ winkel: 0, versatz: 0, abstand: D0 });
      if (tr1.ok || !tr2.ok) throw new Error("Anfahrbeispiel passt nicht zum Modell");
      uhr(T0, ch.dauer, function (t) {
        const gerade = t < 22;                    // erst gerade (trifft), dann schief (trifft nicht)
        const u = gerade ? glatt((t - 4) / 14) : glatt((t - 26) / 14), h = gerade ? 0 : WINKEL * Math.PI / 180;
        // Punkt K (Sattelplatte) fährt rückwärts: Start in der Mittellinie, Fahrtrichtung h; Querfehler am Zapfen = Weg · tan(h), wie sattelTreffer rechnet
        const Kp = { x: Kx + D0 * (1 - u), y: -u * D0 * Math.tan(h) };
        const A = { x: Kp.x - SA.e * Math.cos(h), y: Kp.y - SA.e * Math.sin(h) };
        fz.setze(stand(A.x, A.y, h), 0, false, 0);
        W.gFz.style.opacity = gerade ? 1 : (t < 22.6 ? 1 - (t - 22) / 0.6 : t < 24 ? 0 : klemme((t - 24) / 0.6));
        const rp = W.px(Kx, 0); ring.setAttribute("cx", f(rp[0])); ring.setAttribute("cy", f(rp[1]));
        pg.style.opacity = gerade ? fenster(t, 3.5, 21.4, 0.6) : 0; ps.style.opacity = !gerade ? fenster(t, 25, ch.dauer - 1, 0.6) : 0;
        pz2.style.opacity = gerade ? fenster(t, 17, 21.4, 0.5) : 0; pz1.style.opacity = !gerade ? fenster(t, 38, ch.dauer - 1, 0.5) : 0;
        ring.setAttribute("opacity", gerade ? fenster(t, 17, 21.4, 0.5) : fenster(t, 38, ch.dauer - 1, 0.5)); ring.setAttribute("stroke", gerade ? GRUEN : WARN);
      });
    }

    /* ---------- K3: Unterfahren und kuppeln (Seitenansicht) ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 72, 2.0, 2.0), W = V.W;
      const A0 = 4.6, A1 = -SA.e, LUFT_TIEF = -0.12, LUFT_KONTAKT = SA.unterkante - SA.plattenOben;
      if (!M.sattelUnterfahren(LUFT_TIEF).passtUnter || M.sattelUnterfahren(0).passtUnter || !M.sattelUnterfahren(LUFT_KONTAKT).kontakt || M.sattelUnterfahren(LUFT_KONTAKT).hebtAuf) throw new Error("Höhenbeispiel passt nicht zum Modell");
      const kontakt = el("line", { x1: -0.2, y1: -SA.unterkante, x2: 1.3, y2: -SA.unterkante, stroke: GOLD, "stroke-width": 0.05, opacity: 0 }, W.gVorn);
      const ph = pille(st, tx("l_hoch"), GRUEN), po = pille(st, tx("l_offen"), GOLD), pa = pille(st, tx("l_nicht_anheben"), WARN), pr = pille(st, tx("l_ruck"), GOLD), l1 = leiter(W, GRUEN), l2 = leiter(W, GOLD), l3 = leiter(W, WARN);
      const pfeil = el("path", { d: "M0 -3.9 L0.9 -3.9 L0.9 -4.15 L1.5 -3.75 L0.9 -3.35 L0.9 -3.6 L0 -3.6 Z", fill: GOLD, opacity: 0 }, W.gVorn);
      const foto = window.LKW_FOTO.karte(st, "sattelkupplung", tx("f_sattel"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 15.5, 22.5, 0.7));
        const luft = t < 5 ? 0 : t < 9 ? lerp(0, LUFT_TIEF, glatt((t - 5) / 4)) : t < 46 ? LUFT_TIEF : t < 50 ? lerp(LUFT_TIEF, LUFT_KONTAKT, glatt((t - 46) / 4)) : LUFT_KONTAKT;
        const x = t < 26 ? A0 : t < 46 ? lerp(A0, A1, glatt((t - 26) / 20)) : A1;
        // Anfahrruck: kurze Vorwärtsbewegung, danach wieder Stand
        const ruck = t > 54 && t < 60 ? 0.2 * Math.sin(Math.PI * klemme((t - 54) / 6)) : 0;
        V.zm.setze(x + ruck, luft); V.zm.kupplung(t < 17 ? 0 : t < 50 ? 0 : glatt((t - 50) / 1.2));
        V.au.setze(0, { stuetze: 1, keil: 1 });
        kontakt.setAttribute("opacity", t > 50 ? 1 : 0);
        const hz = W.px(0.55, -1.25 - Math.max(0, luft)), ho = W.px(x - 0.15 - 0.45, -1.34 - luft), ha = W.px(0.6, -1.3);
        const a1 = fenster(t, 8, 22, 0.6), a2 = fenster(t, 16, 30, 0.6), a3 = fenster(t, 47, 62, 0.6), a4 = fenster(t, 54, ch.dauer - 1, 0.5);
        platz(ph, 540, 200, a1); l1.setze(540, 234, hz[0], hz[1] - 6, a1);
        platz(po, 540, 840, a2); l2.setze(540, 808, ho[0], ho[1], a2);
        platz(pa, 540, 200, a3); l3.setze(540, 234, ha[0], ha[1] - 6, a3);
        platz(pr, 700, 840, a4);
        pfeil.setAttribute("opacity", ruck > 0.005 ? 1 : 0); pfeil.setAttribute("transform", "translate(" + f(x + 3.6) + " 0)");
      });
    }

    /* ---------- K4: Sichtkontrolle (Nahaufnahme der Kupplung) ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 130, 0.35, 1.45), W = V.W;
      V.zm.setze(-SA.e, SA.unterkante - SA.plattenOben); V.zm.kupplung(1); V.au.setze(0, { stuetze: 1, keil: 1 });
      const kontakt = el("line", { x1: -0.2, y1: -SA.unterkante, x2: 1.3, y2: -SA.unterkante, stroke: GOLD, "stroke-width": 0.04, opacity: 0 }, W.gVorn);
      const pf = pille(st, tx("l_fest_zug"), ROT), ps = pille(st, tx("l_ohne_spalt"), GRUEN), pe = pille(st, tx("l_eingefallen"), GRUEN), lf = leiter(W, ROT), ls = leiter(W, GRUEN), le = leiter(W, GRUEN);
      const kn = el("g", { opacity: 0 }, W.gVorn); el("circle", { cx: 4.1, cy: -1.55, r: 0.22, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kn); const kt = el("text", { x: 4.1, y: -1.46, "text-anchor": "middle", "font-size": 0.3, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kn); kt.textContent = "P";
      const karabiner = el("g", { opacity: 0 }, W.gVorn); el("rect", { x: -0.62, y: -1.5, width: 0.16, height: 0.26, rx: 0.07, fill: "none", stroke: "#D9B35C", "stroke-width": 0.05 }, karabiner); el("line", { x1: -0.54, y1: -1.34, x2: -0.54, y2: -1.24, stroke: "#D9B35C", "stroke-width": 0.04 }, karabiner);
      uhr(T0, ch.dauer, function (t) {
        // Schritt 5: Kupplung wieder öffnen, Zugmaschine ein Stück vorziehen (Neuanfang)
        const auf = glatt((t - 51) / 3), x = -SA.e + 0.8 * glatt((t - 55) / 6);
        V.zm.setze(x, SA.unterkante - SA.plattenOben); V.zm.kupplung(1 - auf);
        kn.style.opacity = fenster(t, 3.5, ch.dauer - 1, 0.5); kontakt.setAttribute("opacity", fenster(t, 14, 50, 0.5)); karabiner.style.opacity = fenster(t, 36, 50, 0.5);
        const k = W.px(4.1, -1.55), s = W.px(0.55, -SA.unterkante), e = W.px(-SA.e - 0.02, -1.36);
        const a1 = fenster(t, 4, 40, 0.6), a2 = fenster(t, 15, 40, 0.6), a3 = fenster(t, 26, 50, 0.6);
        platz(pf, 780, 100, a1); lf.setze(780, 134, k[0], k[1], a1);
        platz(ps, 700, 860, a2); ls.setze(700, 828, s[0], s[1], a2);
        platz(pe, 330, 860, a3); le.setze(330, 828, e[0], e[1], a3);
      });
    }

    /* ---------- K5: Leitungen (Nahaufnahme) ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 190, 2.2, 2.35), W = V.W;
      V.zm.setze(-SA.e, SA.unterkante - SA.plattenOben); V.zm.kupplung(1); V.au.setze(0, { stuetze: 1, keil: 1 });
      const farben = [GELB, ROT, "#B9BEC4"], sch = farben.map((c) => KU.schlauch(W, c, { laenge: 1.05 }));
      const dose = (k) => ({ x: MA.steckdose.x, y: MA.steckdose.y[k] });
      const kn = el("g", { opacity: 0 }, W.gVorn); el("circle", { cx: 4.1, cy: -1.55, r: 0.2, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kn); const kt = el("text", { x: 4.1, y: -1.47, "text-anchor": "middle", "font-size": 0.28, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kn); kt.textContent = "P";
      const ka = el("g", { opacity: 0 }, W.gVorn); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.08 }, ka); el("circle", { cx: 0.9, cy: -0.95, r: 0.16, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, ka);
      const wann = [[12, 20], [22, 30], [32, 38]];
      const pv = pille(st, tx("l_vorher"), WARN), pg = pille(st, tx("l_gelb"), GELB), pr = pille(st, tx("l_rot"), ROT), pe = pille(st, tx("l_elektro"), "#B9BEC4"), lv = leiter(W, WARN), lg = leiter(W, GELB), lr = leiter(W, ROT), le = leiter(W, "#B9BEC4");
      const foto = window.LKW_FOTO.karte(st, "kupplungskoepfe", tx("f_koepfe"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 6.0, 13.5, 0.7));
        sch.forEach((s, k) => { const u = glatt((t - wann[k][0]) / (wann[k][1] - wann[k][0])), r = KU.ruheWelt(0, k), d = dose(k), a = KU.ankerWelt(0, k); s.setze(a, { x: lerp(r.x, d.x, u), y: lerp(r.y, d.y, u) - Math.sin(Math.PI * u) * 0.3 }); });
        kn.style.opacity = fenster(t, 4, ch.dauer - 1, 0.6); ka.style.opacity = kn.style.opacity;
        const kp = W.px(0.9, -1.0), g = W.px(MA.steckdose.x, MA.steckdose.y[0]), r = W.px(MA.steckdose.x, MA.steckdose.y[1]), e = W.px(MA.steckdose.x, MA.steckdose.y[2]);
        const a0 = fenster(t, 4, 14, 0.6), a1 = fenster(t, 14, ch.dauer - 1, 0.6), a2 = fenster(t, 24, ch.dauer - 1, 0.6), a3 = fenster(t, 34, ch.dauer - 1, 0.6);
        platz(pv, 540, 160, a0 * 0 + fenster(t, 4, 16, 0.6)); lv.setze(540, 194, kp[0], kp[1], fenster(t, 4, 16, 0.6));
        platz(pg, g[0] - 330, g[1] - 160, a1); lg.setze(g[0] - 330, g[1] - 134, g[0], g[1], a1);
        platz(pr, r[0] - 330, r[1] + 120, a2); lr.setze(r[0] - 330, r[1] + 94, r[0], r[1], a2);
        platz(pe, e[0] - 250, e[1] + 250, a3); le.setze(e[0] - 250, e[1] + 224, e[0], e[1], a3);
      });
    }

    /* ---------- K6: Fertig machen ---------- */
    function K6(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 64, 1.0, 2.0), W = V.W;
      V.zm.setze(-SA.e, SA.unterkante - SA.plattenOben); V.zm.kupplung(1);
      const kz = el("g", null, W.gVorn); const kzc = el("circle", { cx: 4.1, cy: -1.55, r: 0.22, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kz); const kzt = el("text", { x: 4.1, y: -1.46, "text-anchor": "middle", "font-size": 0.3, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kz); kzt.textContent = "P";
      const knopf = el("g", null, W.gVorn); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.08 }, knopf); const kk = el("circle", { cx: 0.9, cy: -0.95, r: 0.16, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, knopf);
      const schl = [GELB, ROT, "#B9BEC4"].map((c, k) => { const s = KU.schlauch(W, c, { laenge: 1.05 }); s.setze(KU.ankerWelt(0, k), { x: MA.steckdose.x, y: MA.steckdose.y[k] }); return s; });
      const ps = pille(st, tx("l_stuetzen"), GOLD), pf = pille(st, tx("l_fest_los"), GRUEN), pk = pille(st, tx("l_keile_weg"), GRUEN), pl = pille(st, tx("l_licht"), GRUEN), l1 = leiter(W, GOLD), l2 = leiter(W, GRUEN), l3 = leiter(W, GRUEN), l4 = leiter(W, GRUEN);
      const kam = [[0, -1.0], [20, -1.0], [26, -6.0], [36, -6.0], [40, -8.5], [50, -8.5], [56, 2.5], [ch.dauer, 2.5]];
      uhr(T0, ch.dauer, function (t) {
        W.kamera(interp(kam, t));
        const e = 1 - glatt((t - 5) / 6), gelost = t >= 16, keil = 1 - glatt((t - 26) / 2);
        const brems = t > 42 && t < 48, licht = t > 40;
        V.au.setze(0, { stuetze: e, keil: keil, bremst: brems, licht: licht }); V.zm.setze(-SA.e, SA.unterkante - SA.plattenOben);
        kk.setAttribute("cy", f(lerp(-0.95, -1.15, glatt((t - 16) / 1.5)))); kk.setAttribute("fill", gelost ? "#8FD6A6" : ROT); kzc.setAttribute("fill", t >= 60 ? "#8FD6A6" : ROT);
        const sx = W.px(MA.auflieger.stuetzX, -0.6), fx = W.px(0.9, -1.0), kx = W.px(MA.auflieger.achsX - 2.05, -0.15), lx = W.px(MA.auflieger.hinterKante, -1.75);
        const a1 = fenster(t, 4, 24, 0.6), a2 = fenster(t, 16, 28, 0.6), a3 = fenster(t, 24, 40, 0.6), a4 = fenster(t, 36, 52, 0.6), a5 = fenster(t, 58, ch.dauer - 1, 0.6);
        platz(ps, 540, 180, a1); l1.setze(540, 214, sx[0], sx[1], a1);
        platz(pf, 540, 290, a2); l2.setze(540, 324, fx[0], fx[1], a2);
        platz(pk, 540, kx[1] + 140, a3); l3.setze(540, kx[1] + 108, kx[0], kx[1], a3);
        platz(pl, 540, 840, a4); l4.setze(540, 808, lx[0], lx[1], a4);
      });
    }

    /* ---------- K7: Merke ---------- */
    function K7(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), V = seite(st, 51, -0.5, 2.0);
      V.zm.setze(-SA.e, SA.unterkante - SA.plattenOben); V.zm.kupplung(1); V.au.setze(0, { stuetze: 0, keil: 0 });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
