/* Szenen des Films 3.2 „Abkuppeln“ (Sattelzug) – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Schrittfolge nach DGUV Information 214-080 (Kap. 2.3.2 Absatteln); Höhen aus kern/modell.js (SATTEL, sattelUnterfahren).
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, KU = window.LKW_KUPPELN, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Abkuppeln" });
    const starts = P.starts, FZ = M.FAHRZEUGE.sattelzug, SA = M.SATTEL, MA = KU.MASS;
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, GELB = KU.GELB, ROT = KU.ROT, platz = KU.platz, leiter = KU.leiter, seite = KU.seite;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); }, lerp = (a, b, u) => a + (b - a) * u;
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    const LUFT_KONTAKT = SA.unterkante - SA.plattenOben, LUFT_TIEF = -0.12, A_GEKUPPELT = -SA.e;
    if (!M.sattelUnterfahren(LUFT_TIEF).passtUnter || M.sattelUnterfahren(LUFT_KONTAKT).hebtAuf) throw new Error("Höhenbeispiel passt nicht zum Modell");
    // Knopf der Feststellbremse (rot) am Auflieger und „P“-Zeichen der Zugmaschine
    function knoepfe(W) {
      const kz = el("g", { opacity: 0 }, W.gVorn); el("circle", { cx: 4.1, cy: -1.55, r: 0.38, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kz);
      const t = el("text", { x: 4.1, y: -1.33, "text-anchor": "middle", "font-size": 0.5, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kz); t.textContent = "P";
      const ka = el("g", { opacity: 0 }, W.gVorn); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.14 }, ka); el("circle", { cx: 0.9, cy: -0.95, r: 0.32, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, ka);
      return { zug: kz, auf: ka };
    }

    /* ---------- K1: gestreckt abstellen (Draufsicht) ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), W = BK.welt(st, { S: 40, ox: 160, oy: 540, raster: false, id: "k1" }), fz = BK.fahrzeug(W.gFz, FZ, W);
      const A = { x: FZ.D - SA.e, y: 0 };
      fz.setze({ A: A, hz: 0, F: { x: A.x + FZ.L, y: 0, h: 0 }, T: { x: 0, y: 0 }, ha: 0 }, 0, false, 0);
      const mitte = BK.el("line", { stroke: "rgba(143,214,166,.8)", "stroke-width": 3, "stroke-dasharray": "14 10", opacity: 0 }, W.gUeber), q0 = W.px(-4, 0), q1 = W.px(24, 0);
      mitte.setAttribute("x1", f(q0[0])); mitte.setAttribute("y1", f(q0[1])); mitte.setAttribute("x2", f(q1[0])); mitte.setAttribute("y2", f(q1[1]));
      const x0 = A.x + FZ.L + FZ.vorn, fr = el("rect", { x: W.px(x0 + 0.5, -2.2)[0], y: W.px(0, -2.2)[1], width: 9 * 40, height: 4.4 * 40, rx: 12, fill: "rgba(143,214,166,.14)", stroke: GRUEN, "stroke-width": 4, "stroke-dasharray": "14 10", opacity: 0 }, W.gUeber);
      const pg = BK.pille(st, tx("l_gestreckt"), 300, 330, { punkt: GRUEN }), pp = BK.pille(st, tx("l_platz"), 800, 420, { punkt: GRUEN });
      uhr(T0, ch.dauer, function (t) { const a1 = fenster(t, 3, ch.dauer - 1, 0.6), a2 = fenster(t, 12, ch.dauer - 1, 0.6); mitte.setAttribute("opacity", a1); fr.setAttribute("opacity", a2); pg.style.opacity = a1; pp.style.opacity = a2; });
    }

    /* ---------- K1b: sichern (Seitenansicht) ---------- */
    function K1b(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 51, -0.5, 2.0), W = V.W, kn = knoepfe(W);
      V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); V.zm.kupplung(1); V.au.setze(0, { stuetze: 0, keil: 0 });
      const pz = pille(st, tx("l_fest_zug"), ROT), pa = pille(st, tx("l_fest_auf"), ROT), pk = pille(st, tx("l_keile"), GOLD), l1 = leiter(W, ROT), l2 = leiter(W, ROT), l3 = leiter(W, GOLD);
      uhr(T0, ch.dauer, function (t) {
        const a1 = fenster(t, 3, ch.dauer - 1, 0.6), a2 = fenster(t, 15, ch.dauer - 1, 0.6), a3 = fenster(t, 28, ch.dauer - 1, 0.6);
        kn.zug.style.opacity = a1; kn.auf.style.opacity = a2; V.au.setze(0, { stuetze: 0, keil: a3 > 0.5 ? 1 : 0 });
        const k = W.px(4.1, -1.55), k2 = W.px(0.9, -1.0), kk = W.px(MA.auflieger.achsX - 2.05, -0.15);
        platz(pz, 760, 190, a1); l1.setze(760, 224, k[0], k[1], a1);
        platz(pa, 380, 340, a2); l2.setze(380, 374, k2[0], k2[1], a2);
        platz(pk, 330, kk[1] + 150, a3); l3.setze(330, kk[1] + 118, kk[0], kk[1], a3);
      });
    }

    /* ---------- K2: Stützwinden ausfahren ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 72, 0.5, 2.0), W = V.W, kn = knoepfe(W);
      V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); V.zm.kupplung(1); kn.zug.style.opacity = 1; kn.auf.style.opacity = 1;
      const bohle = el("rect", { x: MA.auflieger.stuetzX - 0.55, y: 0.0, width: 1.1, height: 0.1, fill: "#B08A5A", stroke: "#6B4F2A", "stroke-width": 0.03, opacity: 0 }, W.gVorn);
      const kontakt = el("line", { x1: -0.2, y1: -SA.unterkante, x2: 1.3, y2: -SA.unterkante, stroke: GOLD, "stroke-width": 0.05 }, W.gVorn);
      const ps = pille(st, tx("l_stuetzen"), GOLD), pt = pille(st, tx("l_tragfaehig"), GRUEN), pn = pille(st, tx("l_nicht_abheben"), WARN), l1 = leiter(W, GOLD), l2 = leiter(W, GRUEN), l3 = leiter(W, WARN);
      uhr(T0, ch.dauer, function (t) {
        const e = glatt((t - 5) / 9);
        V.au.setze(0, { stuetze: e, keil: 1 }); V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT);
        const s = W.px(MA.auflieger.stuetzX, -0.5), b = W.px(MA.auflieger.stuetzX, 0.05), h = W.px(0.55, -SA.unterkante);
        bohle.setAttribute("opacity", 0);
        const a1 = fenster(t, 4, 40, 0.6), a2 = fenster(t, 17, ch.dauer - 1, 0.6), a3 = fenster(t, 28, ch.dauer - 1, 0.6);
        platz(ps, 320, 190, a1); l1.setze(320, 224, s[0], s[1], a1);
        platz(pt, 320, 790, a2); l2.setze(320, 758, b[0], b[1], a2);
        platz(pn, 760, 190, a3); l3.setze(760, 224, h[0], h[1], a3);
      });
    }

    /* ---------- K3: Leitungen trennen (Nahaufnahme, dann Gesamtbild) ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const Vn = seite(st, 190, 2.2, 2.35), Wn = Vn.W, Vw = seite(st, 51, -0.5, 2.0), Ww = Vw.W, knw = knoepfe(Ww);
      Vn.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); Vn.zm.kupplung(1); Vn.au.setze(0, { stuetze: 1, keil: 1 });
      Vw.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); Vw.zm.kupplung(1); Vw.au.setze(0, { stuetze: 1, keil: 1 }); knw.zug.style.opacity = 1; knw.auf.style.opacity = 1;
      const farben = [ROT, GELB, "#B9BEC4"], sch = farben.map((c) => KU.schlauch(Wn, c, { laenge: 1.05 }));
      const anker = (k) => KU.ankerWelt(0, k), dose = (k) => ({ x: MA.steckdose.x, y: MA.steckdose.y[k] }), ruhe = (k) => KU.ruheWelt(0, k);
      const idx = [1, 0, 2], wann = [[6, 13], [16, 22], [25, 31]];       // rot, gelb, Elektrik (Index in den Steckdosen: gelb 0, rot 1, Elektrik 2)
      const pr = pille(st, tx("l_rot_ab"), ROT), pg = pille(st, tx("l_gelb_ab"), GELB), pe = pille(st, tx("l_elektro_ab"), "#B9BEC4"), lr = leiter(Wn, ROT), lg = leiter(Wn, GELB), le = leiter(Wn, "#B9BEC4");
      const pb = pille(st, tx("l_reicht_nicht"), WARN, { klasse: "gross" }), pw = pille(st, "", GOLD);
      // Gesamtbild: Bremslicht des Aufliegers (selbsttätige Bremsung), Druck sinkt mit der Zeit
      const bl = el("ellipse", { cx: MA.auflieger.achsX, cy: -0.5, rx: 2.1, ry: 0.85, fill: "none", stroke: WARN, "stroke-width": 0.1, "stroke-dasharray": "0.3 0.2", opacity: 0 }, Ww.gVorn);
      const wn = Vn.W.svg, ww = Ww.svg;
      uhr(T0, ch.dauer, function (t) {
        const nah = t < 36 ? 1 : 1 - glatt((t - 36) / 1.5);
        wn.style.opacity = nah; ww.style.opacity = 1 - nah;
        sch.forEach((s, k) => { const ik = idx[k], u = glatt((t - wann[k][0]) / (wann[k][1] - wann[k][0])), r = ruhe(ik), d = dose(ik), a = anker(ik); s.setze(a, { x: lerp(d.x, r.x, u), y: lerp(d.y, r.y, u) - Math.sin(Math.PI * u) * 0.35 }); });
        const g = Wn.px(MA.steckdose.x, MA.steckdose.y[1]), gl = Wn.px(MA.steckdose.x, MA.steckdose.y[0]), e = Wn.px(MA.steckdose.x, MA.steckdose.y[2]);
        const a0 = fenster(t, 4, 35, 0.6) * nah, a1 = fenster(t, 14, 35, 0.6) * nah, a2 = fenster(t, 24, 35, 0.6) * nah;
        platz(pr, g[0] - 330, g[1] + 130, a0); lr.setze(g[0] - 330, g[1] + 100, g[0], g[1], a0);
        platz(pg, gl[0] - 330, gl[1] - 160, a1); lg.setze(gl[0] - 330, gl[1] - 134, gl[0], gl[1], a1);
        platz(pe, e[0] - 250, e[1] + 250, a2); le.setze(e[0] - 250, e[1] + 224, e[0], e[1], a2);
        const brems = fenster(t, 38, 54, 0.6) * (1 - nah) > 0 || (t > 38 && t < 54);
        bl.setAttribute("opacity", (t > 38 && t < 54) ? 0.6 + 0.4 * Math.sin(t * 6) : 0); Vw.au.setze(0, { stuetze: 1, keil: 1, bremst: false });
        platz(pb, 540, 840, fenster(t, 54, ch.dauer - 1, 0.6));
        pw.style.opacity = 0;
      });
    }

    /* ---------- K4: Kupplung öffnen und wegfahren ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 62, 1.6, 2.0), W = V.W;
      const po = pille(st, tx("l_oeffnen"), GOLD), pv = pille(st, tx("l_vorziehen"), GOLD), pa = pille(st, tx("l_absenken"), GOLD), l1 = leiter(W, GOLD), l2 = leiter(W, GOLD), l3 = leiter(W, GOLD);
      const A_VOR = A_GEKUPPELT + 0.9, A_ENDE = 4.4;
      const pfeil = el("path", { d: "M0 -3.9 L0.9 -3.9 L0.9 -4.15 L1.5 -3.75 L0.9 -3.35 L0.9 -3.6 L0 -3.6 Z", fill: GOLD, opacity: 0 }, W.gVorn);
      V.au.setze(0, { stuetze: 1, keil: 1 });
      uhr(T0, ch.dauer, function (t) {
        const zu = 1 - glatt((t - 6) / 5);
        const x = t < 16 ? A_GEKUPPELT : t < 24 ? lerp(A_GEKUPPELT, A_VOR, glatt((t - 16) / 8)) : t < 38 ? A_VOR : lerp(A_VOR, A_ENDE, glatt((t - 38) / 22));
        const luft = t < 30 ? LUFT_KONTAKT : t < 35 ? lerp(LUFT_KONTAKT, LUFT_TIEF, glatt((t - 30) / 5)) : LUFT_TIEF;
        V.zm.setze(x, luft); V.zm.kupplung(zu); V.au.setze(0, { stuetze: 1, keil: 1 });
        pfeil.setAttribute("opacity", (t > 17 && t < 24) || (t > 40 && t < 58) ? 1 : 0); pfeil.setAttribute("transform", "translate(" + f(x + 3.6) + " 0)");
        const ho = W.px(-0.4, -1.34), vz = W.px(x + 3.0, -3.3), ab = W.px(x + 0.4, -1.2 - Math.max(0, luft));
        const a1 = fenster(t, 4, 15, 0.6), a2 = fenster(t, 17, 30, 0.6), a3 = fenster(t, 30, 50, 0.6);
        platz(po, ho[0] - 100, ho[1] + 250, a1); l1.setze(ho[0] - 100, ho[1] + 218, ho[0], ho[1], a1);
        platz(pv, vz[0], 190, a2); l2.setze(vz[0], 224, vz[0], vz[1], a2);
        platz(pa, 330, 790, a3); l3.setze(330, 758, ab[0], ab[1], a3);
      });
    }

    /* ---------- K5: Merke ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), V = seite(st, 51, -2.5, 2.0), kn = knoepfe(V.W);
      V.zm.setze(40, LUFT_TIEF); V.au.setze(0, { stuetze: 1, keil: 1 }); kn.auf.style.opacity = 1;
    }

    const bauer = { k1: K1, k1b: K1b, k2: K2, k3: K3, k4: K4, k5: K5 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
