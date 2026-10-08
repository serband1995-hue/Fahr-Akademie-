/* Szenen des Films 6.3 „Federspeicherbremse“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Prinzipbild des Kombizylinders aus kern/pneu.js (kombi) mit den Werten aus kern/modell.js (federspeicher). Keine Herstellerpläne, keine bar-Werte.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, PN = window.LKW_PNEU, F = BK.FARBE, KU = window.LKW_KUPPELN, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Federspeicherbremse" });
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, LUFT = PN.C.luft, platz = KU.platz;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    if (M.federspeicher({ pFeder: 0, pMembran: 0 }).geloest || !M.federspeicher({ pFeder: 1, pMembran: 0 }).geloest || !M.federspeicher({ pFeder: 0, pMembran: 0 }).gebremst) throw new Error("Federspeicher passt nicht zum Modell");

    const ZX = 330, ZY = 400, ZW = 680, ZH = 240;
    function zyl(st) { const B = PN.buehne(st), k = PN.kombi(B, { x: ZX, y: ZY, w: ZW, h: ZH }); return { B: B, k: k, mx: ZX + ZW * 0.21, fx: k.wandX + (k.endeX - k.wandX) / 2 }; }

    /* ---------- K1: Feder bremst, Luft löst ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st);
      const pt = pille(st, tx("l_trommel"), GOLD), pf = pille(st, tx("l_feder"), WARN), pl = pille(st, tx("l_luft"), LUFT), pz = pille(st, tx("l_zu"), WARN, { klasse: "gross" }), pr = pille(st, tx("l_frei"), GRUEN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) {
        const pF = t < 22 ? 0 : t < 32 ? glatt((t - 22) / 10) : 1, r = Z.k.setze(0, pF);
        platz(pt, 300, 300, fenster(t, 2, ch.dauer - 1, 0.5));
        platz(pf, Z.fx, 330, fenster(t, 3.5, ch.dauer - 1, 0.5));
        platz(pl, Z.fx, 720, fenster(t, 23, ch.dauer - 1, 0.5));
        platz(pz, 540, 900, fenster(t, 8, 23, 0.5) * (r.gebremst ? 1 : 0));
        platz(pr, 540, 900, fenster(t, 31, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K2: Membranteil und Federteil ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st);
      const pm = pille(st, tx("l_membran"), LUFT), pfe = pille(st, tx("l_federteil"), WARN), pb = pille(st, tx("l_betrieb"), GOLD, { klasse: "gross" }), pfs = pille(st, tx("l_fest"), WARN, { klasse: "gross" }), pe = pille(st, tx("l_entlueftet"), WARN);
      const foto = window.LKW_FOTO.karte(st, "federspeicher", tx("f_feder"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 0.8, 10.0, 0.7));
        const pF = t < 30 ? 1 : t < 40 ? 1 - glatt((t - 30) / 10) : t < 52 ? 0 : t < 62 ? glatt((t - 52) / 10) : 1;
        const pM = t < 12 ? 0 : t < 18 ? glatt((t - 12) / 6) : t < 24 ? 1 : t < 28 ? 1 - glatt((t - 24) / 4) : 0;
        Z.k.setze(pM, pF);
        platz(pm, Z.mx, 330, fenster(t, 3.5, ch.dauer - 1, 0.5)); platz(pfe, Z.fx, 330, fenster(t, 7, ch.dauer - 1, 0.5));
        platz(pb, 540, 900, fenster(t, 13, 28, 0.5)); platz(pfs, 540, 900, fenster(t, 33, ch.dauer - 1, 0.5));
        platz(pe, Z.fx, 720, fenster(t, 32, 50, 0.5));
      });
    }

    /* ---------- K3: Druckverlust ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st), g = Z.B.ueber;
      const bx = 130, by = 170, bw = 820, bh = 44;
      PN.text(g, tx("l_druck"), bx, by - 18, { anker: "start", gr: 28, fett: true });
      el("rect", { x: bx, y: by, width: bw, height: bh, rx: 10, fill: "#2B3631", stroke: PN.C.stahl, "stroke-width": 5 }, g);
      const fuell = el("rect", { x: bx + 3, y: by + 3, width: 0, height: bh - 6, rx: 7, fill: LUFT, opacity: 0.9 }, g);
      const mk = M.FEDER.haltedruck, mx = bx + 3 + (bw - 6) * mk;
      el("line", { x1: mx, y1: by - 10, x2: mx, y2: by + bh + 10, stroke: WARN, "stroke-width": 5, "stroke-dasharray": "8 6" }, g);
      const pg = pille(st, tx("l_zieht_zu"), WARN), pk = pille(st, tx("l_leck"), WARN), pa = pille(st, tx("l_aufbau"), GRUEN), pz = pille(st, tx("l_bremst_selbst"), WARN, { klasse: "gross" }), ps = pille(st, tx("l_gespannt"), GRUEN, { klasse: "gross" });
      const druck = (t) => t < 8 ? 1 : t < 40 ? Math.exp(-(t - 8) / 9) : t < 44 ? Math.exp(-32 / 9) * (1 - glatt((t - 40) / 4)) : t < 56 ? glatt((t - 44) / 12) : 1;
      uhr(T0, ch.dauer, function (t) {
        const pF = druck(t), r = Z.k.setze(0, pF);
        fuell.setAttribute("width", f((bw - 6) * pF));
        platz(pg, mx, 330, fenster(t, 17, 40, 0.5)); platz(pk, 540, 780, fenster(t, 9, 17, 0.5));
        platz(pz, 540, 900, fenster(t, 24, 42, 0.5) * (r.gebremst ? 1 : 0)); platz(pa, 540, 780, fenster(t, 45, ch.dauer - 1, 0.5)); platz(ps, 540, 900, fenster(t, 57, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K4: Merke ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), Z = zyl(st);
      uhr(T0, ch.dauer, function (t) { Z.k.setze(0, t < 8 ? 1 : t < 14 ? 1 - glatt((t - 8) / 6) : 0); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4 };
    const starts = P.starts;
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
