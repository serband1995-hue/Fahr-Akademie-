/* Szenen des Films 6.1 „Zweikreis- und Zweileitungsbremse“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Prinzipbilder aus kern/pneu.js (zweikreis, zweileitung) mit den Druckwerten aus kern/modell.js (zweikreis, anhaengerBremse). Keine Herstellerpläne, keine bar-Werte.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, PN = window.LKW_PNEU, F = BK.FARBE, KU = window.LKW_KUPPELN;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Zweikreis- und Zweileitungsbremse" });
    const starts = P.starts, ROT = PN.C.rot, GELB = PN.C.gelb, GRUEN = "#8FD6A6", WARN = "#FF9A5C", platz = KU.platz;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    const puls = (t, a, b, h) => (t < a ? 0 : t < a + 3 ? glatt((t - a) / 3) : t < b ? 1 : t < b + 3 ? 1 - glatt((t - b) / 3) : 0) * (h == null ? 1 : h);

    /* ---------- K1: Zweikreisbremse ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const zu = (t) => ({ pedal: klemme(puls(t, 26, 36) + puls(t, 58, 68) + puls(t, 70.5, 74, 0.0)), leck: [false, t >= 44] });
      const S = PN.zweikreis(st, tx, zu, ch.dauer), p = P.standardPanel(sc, ch, i, T0, false);
      const pl = pille(st, tx("l_leck"), WARN), pg = pille(st, tx("l_geringer"), WARN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) {
        S.zeichne(t);
        platz(pl, 165, 660, fenster(t, 44, ch.dauer - 1, 0.6));
        platz(pg, 540, 975, fenster(t, 56, 74, 0.6));
      });
    }

    /* ---------- K2: Zweileitungsbremse ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const zu = (t) => ({ rotV: 1, gelbV: 1, pedal: klemme(puls(t, 26, 33, 1) + puls(t, 38, 46, 0.5) + puls(t, 56, 62, 0.8)), res0: 0 });
      const S = PN.zweileitung(st, tx, zu, ch.dauer), p = P.standardPanel(sc, ch, i, T0, false);
      const pr = pille(st, tx("l_rot"), ROT), pg = pille(st, tx("l_gelb"), GELB);
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); platz(pr, 540, 880, fenster(t, 12, ch.dauer - 1, 0.6)); platz(pg, 540, 950, fenster(t, 24, ch.dauer - 1, 0.6)); });
    }

    /* ---------- K3: Fällt rot ab, bremst der Anhänger selbsttätig ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const zu = (t) => ({ rotV: t < 12 ? 1 : t < 20 ? 1 - glatt((t - 12) / 8) : 0, gelbV: 1, pedal: 0, res0: 1 });
      const S = PN.zweileitung(st, tx, zu, ch.dauer), p = P.standardPanel(sc, ch, i, T0, false);
      const pv = pille(st, tx("l_verbunden"), GRUEN), pt = pille(st, tx("l_getrennt"), WARN), ps = pille(st, tx("l_selbst"), WARN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); platz(pv, 540, 880, fenster(t, 2, 12, 0.5)); platz(pt, 540, 880, fenster(t, 20, ch.dauer - 1, 0.5)); platz(ps, 540, 950, fenster(t, 22, ch.dauer - 1, 0.5)); });
    }

    /* ---------- K4: Merke ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true);
      const zu = () => ({ rotV: 1, gelbV: 1, pedal: 0, res0: 1 }), S = PN.zweileitung(st, tx, zu, ch.dauer);
      uhr(T0, ch.dauer, function (t) { S.zeichne(t); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
