/* Szenen des Films 6.2 „Abreißen der Kupplung“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Fahrt: kern/modell.js (abrissFahrt, abreissen); Drücke im Schema: kern/modell.js (anhaengerBremse) über kern/pneu.js (zweileitung).
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, PN = window.LKW_PNEU, SE = window.LKW_SEITE, KU = window.LKW_KUPPELN, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Abreißen der Kupplung" });
    const starts = P.starts, ROT = PN.C.rot, GELB = PN.C.gelb, GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, platz = KU.platz;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));

    /* ---------- K1: die Fahrt (Zeitlupe) ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), W = SE.szene(st, { S: 30, px0: 540, boden: 640 });
      const lk = SE.lkw(W, 6.6), an = SE.anhaenger(W), R = M.abrissFahrt({ v0: 10 }), z = R.zustaende, V0 = R.P.v0, TB = 12, FAKTOR = 0.3;
      if (!M.abreissen({ rot: true }).anhaengerBremst || !M.abreissen({ rot: true }).zugBremstWeiter) throw new Error("Abrissbeispiel passt nicht zum Modell");
      const funke = el("g", { opacity: 0 }, W.gUeber); el("path", { d: "M0 -34 L8 -12 L30 -10 L12 4 L18 28 L0 14 L-18 28 L-12 4 L-30 -10 L-8 -12 Z", fill: WARN, stroke: "#FAF6EC", "stroke-width": 3 }, funke);
      const pz = pille(st, tx("l_zeitlupe"), GOLD), pr = pille(st, tx("l_riss"), WARN), pa = pille(st, tx("l_anh_bremst"), WARN), pb = pille(st, tx("l_zug_bremst"), GRUEN);
      uhr(T0, ch.dauer, function (t) {
        const s = (t - TB) * FAKTOR, q = s < 0 ? { xA: V0 * s, xZ: V0 * s, bremstA: false, bremstZ: false } : z[Math.max(0, Math.min(z.length - 1, Math.round(s / R.P.dt)))];
        const xF = q.xZ, xT = q.xA - 6.3;                       // Front der Zugmaschine, Zugöse des Anhängers
        W.kamera((xF + xT - 9.1) / 2 + 1);
        lk.setze(xF, q.bremstZ, xF); an.setze(xT, q.bremstA, xT);
        const pb0 = W.px(xT), a1 = fenster(t, TB, TB + 3, 0.2);
        funke.setAttribute("transform", "translate(" + f(pb0) + " " + (W.boden - 60) + ")"); funke.style.opacity = a1 * (t < TB + 3 ? 1 : 0);
        platz(pz, 190, 150, fenster(t, 0.5, ch.dauer - 0.5, 0.5));
        platz(pr, 540, 200, fenster(t, TB, TB + 5, 0.4)); platz(pa, W.px(xT - 6), 280, fenster(t, 17, ch.dauer - 0.5, 0.5)); platz(pb, W.px(xF - 3), 280, fenster(t, 28, ch.dauer - 0.5, 0.5));
      });
    }

    /* ---------- K2: Schema, beide Leitungen reißen ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const zu = (t) => { const u = t < 10 ? 1 : 1 - glatt((t - 10) / 1.5); return { rotV: u, gelbV: u, pedal: 0, res0: 1 }; };
      const S = PN.zweileitung(st, tx, zu, ch.dauer), p = P.standardPanel(sc, ch, i, T0, false);
      const ps = pille(st, tx("l_selbst"), WARN, { klasse: "gross" }), pv = pille(st, tx("l_voll"), GRUEN);
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); platz(ps, 540, 880, fenster(t, 12, ch.dauer - 1, 0.5)); platz(pv, 300, 950, fenster(t, 38, ch.dauer - 1, 0.5)); });
    }

    /* ---------- K3: nur gelb reißt ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const pedal = (t) => (t < 20 ? 0 : t < 23 ? glatt((t - 20) / 3) : t < 34 ? 1 : t < 37 ? 1 - glatt((t - 34) / 3) : 0);
      const zu = (t) => { const defekt = t >= 8, pd = pedal(t); return { rotV: 1, gelbV: defekt ? 1 - glatt((t - 8) / 2) : 1, pedal: pd, res0: 1, gelbDefekt: defekt, rotDruck: defekt && pd > 0.05 ? 0 : 1 }; };
      const S = PN.zweileitung(st, tx, zu, ch.dauer), p = P.standardPanel(sc, ch, i, T0, false);
      const pg = pille(st, tx("l_gelb_weg"), WARN), pn = pille(st, tx("l_nichts"), GOLD, { klasse: "gross" }), pb = pille(st, tx("l_erst_bremsen"), WARN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); platz(pg, 540, 880, fenster(t, 9, ch.dauer - 1, 0.5)); platz(pn, 540, 960, fenster(t, 12, 19.5, 0.5)); platz(pb, 540, 960, fenster(t, 22, 40, 0.5)); });
    }

    /* ---------- K4: Merke ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), zu = () => ({ rotV: 1, gelbV: 1, pedal: 0, res0: 1 }), S = PN.zweileitung(st, tx, zu, ch.dauer);
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
