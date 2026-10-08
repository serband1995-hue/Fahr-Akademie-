/* Szenen des Films 8.1 „Lenk- und Ruhezeiten“ – Zeitleisten und Kalender. Die Beispiele werden mit kern/modell.js geprüft (pruefeTag, pruefeWochen, lenkdauerBei);
   was im Bild als „erlaubt“ oder „nicht erlaubt“ steht, kommt aus der Prüfung, nicht aus einer Behauptung.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, Z = window.LKW_ZEIT, F = BK.FARBE, el = BK.el;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Lenk- und Ruhezeiten" });
    const starts = P.starts, A = Z.ART, GRUEN = "#8FD6A6", WARN = "#FF9A5C";
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.4)), klemme((b - t) / (d || 0.4)));
    const h = (x) => x * 60;
    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    // Pille mit Position (Mitte), Einblenden über „sichtbar(t)“ in der Uhr
    const pille = (st, text, x, y, farbe, gross) => { const p = BK.pille(st, text, x, y, { punkt: farbe, klasse: gross ? "gross" : "" }); return { el: p, setze: (a) => { p.style.opacity = a; } }; };
    // Zeit -> Stunden im Szenenablauf (gleichmäßig von t0 bis t1, danach stehen bleiben)
    const lauf = (t, t0, t1, ende) => ende * klemme((t - t0) / (t1 - t0));
    const summe = (ev) => ev.reduce((a, e) => a + e.min, 0) / 60;

    /* ---------- K1 ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const L = Z.leiste(B, { y: 420 });
      const ev = [{ art: "arbeit", min: h(1) }, { art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "arbeit", min: h(1) }, { art: "ruhe", min: h(11) }];
      const pl = [[tx("l_lenk"), A.fahren, 60 * 1 / 60], [tx("l_pause"), A.pause, 5.5], [tx("l_ruhe"), A.ruhe, 10.75], [tx("l_arbeit"), A.arbeit, 0]].map((d, k) => ({ d: d, p: pille(st, d[0], 230 + (k % 2) * 420 + (k > 1 ? 60 : 0), 640 + Math.floor(k / 2) * 100, d[1]) }));
      const hS = (t) => lauf(t, 3, 21, summe(ev));
      const zeigeAb = [5.0, 12.0, 17.0, 3.8];
      uhr(T0, ch.dauer, function (t) {
        L.zeichne(ev, hS(t));
        pl.forEach((q, k) => q.p.setze(t >= zeigeAb[k] ? klemme((t - zeigeAb[k]) / 0.5) : 0));
      });
    }

    /* ---------- K2: Tageslenkzeit ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const L = Z.leiste(B, { y: 330 }), Mm = Z.messer(B, { y: 560, max: h(11), marken: [{ min: h(9), farbe: A.fahren, text: "9:00" }, { min: h(10), farbe: "#F2C16E", text: "10:00" }] });
      const ev9 = [{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "arbeit", min: h(1) }, { art: "ruhe", min: h(11) }];
      const ev10 = [{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(1) }, { art: "ruhe", min: h(11) }];
      if (!M.pruefeTag(ev9).ok || !M.pruefeTag(ev10, { verlaengert: true }).ok || M.pruefeTag(ev10).ok) throw new Error("Beispieltage passen nicht zum Modell");
      const p9 = pille(st, tx("l_tag9"), 540, 200, A.fahren, true), p10 = pille(st, tx("l_tag10"), 540, 200, "#F2C16E", true);
      const lenkBei = (e, m) => { let s = 0, u = 0; for (const x of e) { const d = Math.max(0, Math.min(x.min, m - u)); if (x.art === "fahren") s += d; u += x.min; } return s; };
      const t9 = [3, 15], t10 = [18.5, 31.5];
      uhr(T0, ch.dauer, function (t) {
        const zweiter = t >= 17.5, ev = zweiter ? ev10 : ev9, hh = zweiter ? lauf(t, t10[0], t10[1], summe(ev10)) : lauf(t, t9[0], t9[1], summe(ev9));
        L.zeichne(ev, hh);
        Mm.setze(lenkBei(ev, hh * 60), zweiter && lenkBei(ev, hh * 60) > h(9) ? "#F2C16E" : A.fahren);
        p9.setze(!zweiter ? fenster(t, 3.5, 17, 0.5) : 0); p10.setze(zweiter ? fenster(t, 18.5, 40, 0.5) : 0);
      });
    }

    /* ---------- K3: Pause ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const L = Z.leiste(B, { y: 330, span: 9, tick: 1 }), Mm = Z.messer(B, { y: 560, max: h(5), marken: [{ min: 270, farbe: WARN, text: "4:30" }] });
      const szen = [
        { ev: [{ art: "fahren", min: 270 }, { art: "pause", min: 45 }, { art: "fahren", min: 90 }], name: tx("l_p45"), t0: 4, t1: 18 },
        { ev: [{ art: "fahren", min: 120 }, { art: "pause", min: 15 }, { art: "fahren", min: 150 }, { art: "pause", min: 30 }, { art: "fahren", min: 90 }], name: tx("l_p1530"), t0: 19, t1: 34 },
        { ev: [{ art: "fahren", min: 120 }, { art: "pause", min: 30 }, { art: "fahren", min: 150 }, { art: "pause", min: 15 }, { art: "fahren", min: 60 }], name: tx("l_p3015"), t0: 35, t1: 52 }
      ];
      const erg = szen.map((s) => M.pruefeTag(s.ev.concat([{ art: "ruhe", min: h(11) }])).ok);
      if (!(erg[0] && erg[1] && !erg[2])) throw new Error("Pausen-Beispiele passen nicht zum Modell: " + erg.join());
      const pn = szen.map((s, k) => pille(st, s.name, 540, 200, k < 2 ? A.pause : WARN, true));
      const pok = pille(st, tx("l_ok"), 540, 840, GRUEN, true), pnicht = pille(st, tx("l_nicht"), 540, 840, WARN, true), titel = pille(st, tx("l_dauer"), 540, 700, A.fahren);
      uhr(T0, ch.dauer, function (t) {
        let k = t < 18.8 ? 0 : t < 34.8 ? 1 : 2; const s = szen[k], hh = lauf(t, s.t0, s.t1, summe(s.ev));
        L.zeichne(s.ev, hh); const z = M.lenkdauerBei(s.ev, hh * 60);
        Mm.setze(z.seit, z.seit > 270 ? WARN : A.fahren);
        szen.forEach((_, j) => pn[j].setze(j === k ? fenster(t, szen[j].t0, szen[j].t1 + 1.5, 0.4) : 0));
        const fertig = t >= s.t1 + 0.3 && t < s.t1 + 1.6;
        pok.setze(k < 2 ? (fertig || (t > szen[k].t1 && t < szen[k].t1 + 1.6) ? 1 : 0) : 0);
        pnicht.setze(k === 2 && t >= s.t1 - 0.5 ? klemme((t - (s.t1 - 0.5)) / 0.4) : 0);
        titel.setze(t > 3 ? 1 : 0);
      });
    }

    /* ---------- K4: tägliche Ruhezeit ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const L = Z.leiste(B, { y: 400 });
      const szen = [
        { ev: [{ art: "arbeit", min: h(13) }, { art: "ruhe", min: h(11) }], t0: 4, t1: 16, name: tx("l_reg"), farbe: GRUEN },
        { ev: [{ art: "arbeit", min: h(15) }, { art: "ruhe", min: h(9) }], t0: 19, t1: 32, name: tx("l_red"), farbe: A.fahren },
        { ev: [{ art: "arbeit", min: h(16) }, { art: "ruhe", min: h(8) }], t0: 40, t1: 52, name: tx("l_kurz"), farbe: WARN }
      ];
      const kl = szen.map((s) => M.pruefeTag(s.ev).ruhe);
      if (kl.join() !== "regelmaessig,reduziert,zuKurz") throw new Error("Ruhezeit-Beispiele passen nicht zum Modell: " + kl.join());
      const pn = szen.map((s) => pille(st, s.name, 540, 250, s.farbe, true)), f24 = pille(st, tx("l_fenster"), 540, 620, A.ruhe);
      // Klammer 24 Stunden
      const kg = el("g", { opacity: 0.0 }, B.ueber), ky = 372; el("line", { x1: L.px(0), y1: ky, x2: L.px(24), y2: ky, stroke: F.creme, "stroke-width": 4 }, kg); [0, 24].forEach((hh) => el("line", { x1: L.px(hh), y1: ky - 12, x2: L.px(hh), y2: ky + 12, stroke: F.creme, "stroke-width": 4 }, kg));
      uhr(T0, ch.dauer, function (t) {
        const k = t < 18 ? 0 : t < 38 ? 1 : 2, s = szen[k];
        L.zeichne(s.ev, lauf(t, s.t0, s.t1, summe(s.ev)));
        kg.style.opacity = t > 4 ? 1 : 0; f24.setze(t > 4 ? 1 : 0);
        pn.forEach((q, j) => q.setze(j === k && t >= szen[j].t1 - 0.5 && (j < 2 ? t < szen[j].t1 + 5.5 : true) ? 1 : 0));
      });
    }

    /* ---------- K5: Woche ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const stunden = [[9, 9, 10, 10, 9, 9, 0], [9, 9, 8, 8, 0, 0, 0]];
      if (!M.pruefeWochen(stunden).ok) throw new Error("Wochen-Beispiel passt nicht zum Modell");
      const tage = ["l_mo", "l_di", "l_mi", "l_do", "l_fr", "l_sa", "l_so"].map((k) => tx(k));
      const Kal = Z.kalender(B, { stunden: stunden, ys: [330, 700], hoehe: 150, tage: tage, breite: 130, x0: 60 });
      const w1 = pille(st, tx("l_w1"), 150, 150, A.fahren), w2 = pille(st, tx("l_w2"), 150, 520, A.fahren), ruhe = pille(st, tx("l_wruhe"), 540, 950, A.ruhe);
      const wp = [pille(st, "", 800, 150, A.fahren), pille(st, "", 800, 520, A.fahren)];
      // Wochenruhe: Balken über Sa/So Woche 1
      const rb = el("rect", { x: 60 + 6 * 130 + 16, y: 215, width: 130 - 20, height: 170, rx: 14, fill: "rgba(129,144,232,.25)", stroke: A.ruhe, "stroke-width": 4, opacity: 0 }, B.ueber);
      uhr(T0, ch.dauer, function (t) {
        const a = lauf(t, 13, 27, 14); Kal.setze(a, { vorlage: (wi, s) => s + " " + tx("l_h") });
        w1.setze(t > 5 ? 1 : 0); w2.setze(t > 5 && a > 7 ? 1 : 0);
        const wh = (wi) => stunden[wi].reduce((x, y) => x + y, 0);
        wp[0].el.style.opacity = 0; wp[1].el.style.opacity = 0;
        rb.style.opacity = fenster(t, 41, ch.dauer - 1, 0.6); ruhe.setze(fenster(t, 43, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K6: Fahrschule und Beruf ---------- */
    function K6(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = Z.buehne(st);
      const kartei = (x, titel, farbe, ja) => {
        const g = el("g", { opacity: 0 }, B.g);
        el("rect", { x: x, y: 330, width: 440, height: 380, rx: 28, fill: "rgba(250,246,236,.08)", stroke: farbe, "stroke-width": 5 }, g);
        const c = ja ? F.gold : A.arbeit;
        if (ja) { el("path", { d: "M" + (x + 130) + " 520 L" + (x + 200) + " 590 L" + (x + 320) + " 450", fill: "none", stroke: GRUEN, "stroke-width": 26, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); }
        else { el("path", { d: "M" + (x + 150) + " 450 L" + (x + 290) + " 590 M" + (x + 290) + " 450 L" + (x + 150) + " 590", fill: "none", stroke: A.arbeit, "stroke-width": 26, "stroke-linecap": "round" }, g); }
        return g;
      };
      const ks = kartei(60, "", A.arbeit, false), kb = kartei(580, "", GRUEN, true);
      const ps = pille(st, tx("l_schule"), 280, 270, A.arbeit, true), pb = pille(st, tx("l_beruf"), 800, 270, GRUEN, true);
      uhr(T0, ch.dauer, function (t) {
        const a = fenster(t, 4.5, ch.dauer - 1, 0.6), b = fenster(t, 16.5, ch.dauer - 1, 0.6);
        ks.style.opacity = a; ps.setze(a); kb.style.opacity = b; pb.setze(b);
      });
    }

    /* ---------- K7: Merke ---------- */
    function K7(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), B = Z.buehne(st);
      const L = Z.leiste(B, { y: 420 });
      const ev = [{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "arbeit", min: h(1) }, { art: "ruhe", min: h(11) }];
      uhr(T0, ch.dauer, function (t) { L.zeichne(ev, lauf(t, 1.5, 9, summe(ev))); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
