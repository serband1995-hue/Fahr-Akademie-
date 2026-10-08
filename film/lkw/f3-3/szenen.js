/* Szenen des Films 3.3 „Gelb zuerst, rot nie allein“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Druck: kern/modell.js (anhaengerBremse); Wegrollen: kern/modell.js (rollen). Die Szenen zeigen die FOLGE (Rot löst die Betriebsbremse des Anhängers; ohne Sicherung rollt der Zug), nicht den Ventilvorgang.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, KU = window.LKW_KUPPELN, PN = window.LKW_PNEU, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Gelb zuerst, rot nie allein" });
    const starts = P.starts, SA = M.SATTEL, MA = KU.MASS, C = PN.C;
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, GELB = KU.GELB, ROT = KU.ROT, platz = KU.platz, leiter = KU.leiter;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); }, lerp = (a, b, u) => a + (b - a) * u;
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    const A_G = -SA.e, LUFT_K = SA.unterkante - SA.plattenOben;
    // Verzögerung erster Ordnung (Druck baut sich auf/ab): Werte im Raster dt vorab rechnen
    function verlauf(dauer, ziel, tau, start) { const dt = 0.05, n = Math.round(dauer / dt) + 1, a = new Array(n); let p = start || 0; for (let i = 0; i < n; i++) { p += (ziel(i * dt) - p) * (1 - Math.exp(-dt / tau)); a[i] = p; } return (t) => a[Math.max(0, Math.min(n - 1, Math.round(t / dt)))]; }

    const schema = (st, zustand, dauer) => PN.zweileitung(st, tx, zustand, dauer);

    /* ---------- K1: zwei Leitungen, zwei Aufgaben ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const z = (t) => { const pedal = t < 32 ? 0 : t < 36 ? glatt((t - 32) / 3) : t < 42 ? 1 : t < 46 ? 1 - glatt((t - 42) / 3) : t < 50 ? 0 : t < 53 ? 0.5 * glatt((t - 50) / 3) : t < 58 ? 0.5 : 0.5 * (1 - glatt((t - 58) / 3)); return { rotV: 1, gelbV: 1, pedal: klemme(pedal), res0: 0 }; };
      const S = schema(st, z, ch.dauer);
      const p = P.standardPanel(sc, ch, i, T0, false);
      const pr = pille(st, tx("l_rot"), ROT), pg = pille(st, tx("l_gelb"), GELB);
      uhr(T0, ch.dauer, function (t) {
        S.zeichne(t);
        const a1 = fenster(t, 3.5, ch.dauer - 1, 0.6), a2 = fenster(t, 16, ch.dauer - 1, 0.6);
        platz(pr, 540, 880, a1); platz(pg, 540, 950, a2);
      });
    }

    /* ---------- K2: Rot löst die Bremse ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc);
      const z = (t) => {
        const rotV = t < 18 ? 0 : t < 24 ? glatt((t - 18) / 6) : 1, gelbV = t < 54 ? 0 : t < 60 ? glatt((t - 54) / 6) : 1;
        const pedal = t < 32 ? 0 : t < 36 ? glatt((t - 32) / 3) : t < 44 ? 1 : t < 47 ? 1 - glatt((t - 44) / 3) : t < 64 ? 0 : t < 67 ? glatt((t - 64) / 3) : t < 74 ? 1 : 1 - glatt((t - 74) / 3);
        return { rotV: rotV, gelbV: gelbV, pedal: klemme(pedal), res0: 1 };
      };
      const S = schema(st, z, ch.dauer);
      const p = P.standardPanel(sc, ch, i, T0, false);
      const pa = pille(st, tx("l_gebremst"), WARN, { klasse: "gross" }), pb = pille(st, tx("l_geloest"), GRUEN, { klasse: "gross" }), pk = pille(st, tx("l_kein_signal"), WARN, { klasse: "gross" }), pm = pille(st, tx("l_bremst_mit"), GRUEN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) {
        const r = S.zeichne(t);
        platz(pa, 540, 880, fenster(t, 4, 17, 0.5)); platz(pb, 540, 880, fenster(t, 26, 31, 0.5));
        platz(pk, 540, 880, fenster(t, 33, 52, 0.5)); platz(pm, 540, 880, fenster(t, 66, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- Hang (K3, K4, K5): Zugmaschine + Auflieger, Schläuche, Knöpfe, Keile ---------- */
    function hang(st, S) {
      const W = KU.szene(st, { S: S, ox: 540, boden: 720, winkel: 4 });
      const au = KU.auflieger(W), zm = KU.zugmaschine(W);
      const gk = el("g", null, W.gVorn);                                       // Knöpfe und Markierungen, wandern mit dem Zug
      const kz = el("g", { opacity: 0 }, gk); el("circle", { cx: 4.1, cy: -1.55, r: 0.22, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kz);
      const kt = el("text", { x: 4.1, y: -1.46, "text-anchor": "middle", "font-size": 0.3, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kz); kt.textContent = "P";
      const ka = el("g", { opacity: 0 }, gk); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.08 }, ka); el("circle", { cx: 0.9, cy: -0.95, r: 0.16, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, ka);
      const fehl = el("g", { opacity: 0 }, gk);                                // fehlende Sicherung (gestrichelte Kreise)
      [[4.1, -1.55, 0.36], [0.9, -1.0, 0.3], [MA.auflieger.achsX - 2.05, -0.25, 0.4]].forEach((c) => el("circle", { cx: c[0], cy: c[1], r: c[2], fill: "none", stroke: WARN, "stroke-width": 0.07, "stroke-dasharray": "0.2 0.14" }, fehl));
      const sch = { gelb: KU.schlauch(W, GELB, { laenge: 1.05 }), rot: KU.schlauch(W, ROT, { laenge: 1.05 }) };
      return { W: W, au: au, zm: zm, kz: kz, ka: ka, fehl: fehl, gk: gk, sch: sch,
        setze: function (X, o2) {
          o2 = o2 || {}; au.setze(X, { stuetze: 1, keil: o2.keil ? 1 : 0, bremst: !!o2.bremst }); zm.setze(X + A_G, LUFT_K); zm.kupplung(1); gk.setAttribute("transform", "translate(" + f(X) + " 0)");
          const verb = { gelb: o2.gelb == null ? 0 : o2.gelb, rot: o2.rot == null ? 0 : o2.rot };
          [["gelb", 0], ["rot", 1]].forEach((p) => { const k = p[1], u = verb[p[0]], a = KU.ankerWelt(X, k), ruhe = KU.ruheWelt(X, k), d = { x: X + MA.steckdose.x, y: MA.steckdose.y[k] }; sch[p[0]].setze(a, { x: lerp(ruhe.x, d.x, u), y: lerp(ruhe.y, d.y, u) - Math.sin(Math.PI * u) * 0.35 }); });
        } };
    }
    // Wegrollen: Beschleunigung nur, wenn das Modell „rollt“ meldet; Bremsung nach dem Trennen von rot
    function rollweg(dauer, tRot, tLos, tTrenn) {
      const dt = 0.02, n = Math.round(dauer / dt) + 1, xs = new Array(n); let x = 0, v = 0;
      for (let i = 0; i < n; i++) {
        const t = i * dt, rotAn = t >= tRot && t < tTrenn;
        const rl = M.rollen({ rot: rotAn || (t >= tTrenn && false), festZug: false, festAnh: false, keile: false, gefaelle: 0.07 });
        if (t >= tLos && t < tTrenn && rl.rollt) v += 0.2 * dt; else if (t >= tTrenn) v = Math.max(0, v - 0.8 * dt);
        x += v * dt; xs[i] = { x: x, v: v };
      }
      return (t) => xs[Math.max(0, Math.min(n - 1, Math.round(t / dt)))];
    }

    /* ---------- K3: Rot allein, der Zug rollt ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), H = hang(st, 64), W = H.W;
      const rw = rollweg(ch.dauer, 18, 18, 42), X0 = -2;
      if (!M.rollen({ rot: true, gefaelle: 0.07 }).rollt || M.rollen({ rot: false, gefaelle: 0.07 }).rollt) throw new Error("Rollbeispiel passt nicht zum Modell");
      const pn = pille(st, tx("l_nichts"), WARN), pr = pille(st, tx("l_rollt"), WARN, { klasse: "gross" }), pt = pille(st, tx("l_rot_trennen"), GOLD);
      uhr(T0, ch.dauer, function (t) {
        const s = rw(t), X = X0 + s.x, xc = Math.max(0, X + 2 - 3) * 1;
        W.kamera(Math.max(0, s.x - 2) - 1);
        const rotU = t < 12 ? 0 : t < 18 ? glatt((t - 12) / 6) : t < 40 ? 1 : 1 - glatt((t - 40) / 4);
        const bremst = rotU < 1 - 1e-6 && (t < 18 || t >= 44);
        H.setze(X, { rot: rotU, bremst: bremst, keil: false }); H.fehl.style.opacity = fenster(t, 3, 30, 0.6);
        const a1 = fenster(t, 3.5, 24, 0.6), a2 = fenster(t, 22, 40, 0.6), a3 = fenster(t, 36, ch.dauer - 1, 0.6);
        platz(pn, 540, 220, a1); platz(pr, 540, 880, a2); platz(pt, 540, 220, a3);
      });
    }

    /* ---------- K4: richtig ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), H = hang(st, 64), W = H.W, X = -2;
      const kam = [[0, -1], [4, -1], [8, -6], [14, -6], [18, -1], [ch.dauer, -1]], interp = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let q = 1; q < kf.length; q++) if (t <= kf[q][0]) { const a = kf[q - 1], b = kf[q]; return a[1] + (b[1] - a[1]) * glatt((t - a[0]) / (b[0] - a[0])); } return kf[kf.length - 1][1]; };
      W.kamera(-1);
      if (M.rollen({ rot: true, festZug: true, festAnh: true, keile: true, gefaelle: 0.07 }).rollt) throw new Error("Sicherungsbeispiel passt nicht zum Modell");
      const kombi = el("g", { opacity: 0 }, W.svg); el("rect", { x: 780, y: 150, width: 200, height: 84, rx: 40, fill: "#2B3631", stroke: "#C9CFC6", "stroke-width": 5 }, kombi); el("circle", { cx: 830, cy: 192, r: 24, fill: "none", stroke: GELB, "stroke-width": 8 }, kombi); el("circle", { cx: 930, cy: 192, r: 24, fill: "none", stroke: ROT, "stroke-width": 8 }, kombi);
      const pg = pille(st, tx("l_gesichert"), GRUEN), ps = pille(st, tx("l_steht"), GRUEN, { klasse: "gross" }), pko = pille(st, tx("l_kombi"), GOLD);
      uhr(T0, ch.dauer, function (t) {
        W.kamera(interp(kam, t));
        const gU = t < 14 ? 0 : t < 22 ? glatt((t - 14) / 8) : 1, rU = t < 24 ? 0 : t < 32 ? glatt((t - 24) / 8) : 1;
        H.setze(X, { gelb: gU, rot: rU, keil: t >= 6, bremst: rU < 0.98 });
        H.kz.style.opacity = fenster(t, 3.5, ch.dauer - 1, 0.5) * (t >= 3.5 ? 1 : 0); H.ka.style.opacity = H.kz.style.opacity;
        const a1 = fenster(t, 5, 30, 0.6), a2 = fenster(t, 32, ch.dauer - 1, 0.6);
        platz(pg, 540, 220, a1); platz(ps, 540, 880, a2); kombi.style.opacity = fenster(t, 38, ch.dauer - 1, 0.6); platz(pko, 880, 290, fenster(t, 38, ch.dauer - 1, 0.6));
      });
    }

    /* ---------- K5: Abkuppeln, erst rot ab ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), H = hang(st, 64), W = H.W, X = -2;
      W.kamera(-1);
      const pr = pille(st, tx("l_rot_ab"), ROT), pg = pille(st, tx("l_gelb_ab"), GELB), pn = pille(st, tx("l_reicht_nicht"), WARN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) {
        const rU = t < 8 ? 1 : t < 16 ? 1 - glatt((t - 8) / 8) : 0, gU = t < 24 ? 1 : t < 32 ? 1 - glatt((t - 24) / 8) : 0;
        H.setze(X, { gelb: gU, rot: rU, keil: true, bremst: rU < 0.98 }); H.kz.style.opacity = 1; H.ka.style.opacity = 1;
        platz(pr, 540, 220, fenster(t, 5, 19, 0.5)); platz(pg, 540, 220, fenster(t, 22, 36, 0.5)); platz(pn, 540, 880, fenster(t, 20, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K6: Merke ---------- */
    function K6(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), H = hang(st, 64); H.W.kamera(-1); H.setze(-2, { gelb: 1, rot: 1, keil: true }); H.kz.style.opacity = 1; H.ka.style.opacity = 1;
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
