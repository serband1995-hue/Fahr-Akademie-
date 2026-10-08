/* Szenen des Films 5.1 „Schleppkurven“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Jede Szene zeichnet sich als reine Funktion der Zeit: Fahrzeuge, Spuren, Flächen kommen aus dem Rechenmodell (kern/modell.js),
   nichts ist von Hand animiert. Die GSAP-Zeitleiste steuert nur Einblenden und eine „Uhr“ je Kapitel (zeichne(t)).

   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, F = BK.FARBE;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Schleppkurven" });
    const starts = P.starts;
    const FZ = M.FAHRZEUGE;

    /* ---------- gemeinsame Bahn der Vorderachse: Rechtskurve 90°, Radius 10,75 m (alle drei Fahrzeuge gleich) ---------- */
    const RT = 10.75, BOGEN = RT * Math.PI / 2, S_START = -14, S_ENDE = BOGEN + 30, DS = 0.02;   // 30 m nach der Kurve: auch der Anhänger ist wieder gerade
    const bahn = M.bahn([{ bogen: RT, winkel: Math.PI / 2, rechts: true }, { gerade: 60 }]);
    const sims = {};
    const sim = (id) => sims[id] || (sims[id] = M.simuliere(FZ[id], bahn, S_START, S_ENDE, DS));
    const idxVon = (s) => Math.max(0, Math.min(Math.round((S_ENDE - S_START) / DS), Math.round((s - S_START) / DS)));
    const klemme = (u) => Math.max(0, Math.min(1, u));
    // Bewegungsprofil: anfahren (TA s), gleichmäßig fahren, bremsen (TB s) bis zum Stand. Bremslicht nur beim Bremsen und im Stand (Logikregel).
    const TA = 1.5, TB = 2.5;
    const profilU = (t, t0, t1) => {            // Anteil 0..1 des Weges zur Zeit t
      const T = t1 - t0, v = 1 / (T - TA / 2 - TB / 2), x = klemme((t - t0) / T) * T;
      if (x <= TA) return v * x * x / (2 * TA);
      if (x <= T - TB) return v * TA / 2 + v * (x - TA);
      const r = T - x; return 1 - v * r * r / (2 * TB);
    };
    const bremstZeit = (t, t1) => t >= t1 - TB - 0.001;
    const OX = 340, OY = 110;                                                           // Bühnenpunkt des Kurvenanfangs (Meter 0/0)

    // Uhr je Kapitel: ruft zeichne(t) mit der Kapitelzeit auf (immer genau, auch beim Springen und Zurückspulen)
    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    const px = (W, p) => W.px(p.x, p.y);

    /* ---------- eine Fahrt: Fahrzeug + Spuren + Fläche + Band ---------- */
    function fahrt(st, W, id, opt) {
      const fz = FZ[id], s = sim(id), v = BK.fahrzeug(W.gFz, fz, W);
      const fuss = BK.fussflaeche(W, s, { farbe: "#FAF6EC" });
      const spurHinten = fz.anh ? (id === "sattelzug" ? F.auflieger : F.anhaenger) : F.hinten;
      const sV = BK.spur(W, s, (z) => z.F, F.vorn);
      const sA = BK.spur(W, s, (z) => z.A, F.hinten);
      const sT = fz.anh ? BK.spur(W, s, (z) => z.T, spurHinten) : null;
      const innen = fz.anh ? (z) => z.T : (z) => z.A;
      const bd = BK.band(W, s, (z) => z.F, s, innen);
      bd.zeige(0); sA.zeige(opt && opt.hintenAus ? 0 : 1);
      return {
        fz: fz, sim: s, v: v, spuren: { v: sV, a: sA, t: sT }, band: bd, fuss: fuss,
        // sNow: Weg der Vorderachse (Meter), t: Zeit für das Blinken
        zeichne: function (sNow, t, bremst) {
          const i = idxVon(sNow), z = s.zustaende[i];
          const blinkt = sNow > -9 && sNow < BOGEN + 2.5 && Math.floor(t * 3) % 2 === 0;
          v.setze(z, blinkt ? 1 : 0, !!bremst);
          sV.bis(i); sA.bis(i); if (sT) sT.bis(i); bd.bis(i); fuss.bis(i);
          return z;
        },
        punkt: function (sw, wahl) { return px(W, wahl(s.zustaende[idxVon(sw)])); }
      };
    }
    const fahrtS = (t, tA, tB) => S_START + (S_ENDE - S_START) * profilU(t, tA, tB);

    // Pille mit Leitlinie zu einem Punkt. pos = [x, y, "l"|"r"]: "l" = linker Rand der Pille bei x, "r" = rechter Rand bei x (lange Texte wachsen nach innen, nie aus dem Bild)
    const alle = [];   // alle Beschriftungen: Leitlinien beginnen am Rand der Pille (nach dem Laden der Schrift neu gemessen), damit sie nie hinter anderen Pillen laufen
    function etikett(st, W, text, pos, ziel, farbe, T0, t) {
      const links = pos[2] !== "r";
      const p = BK.pille(st, text, pos[0], pos[1], { punkt: farbe, ax: links ? "0" : "-100%" });
      const l = BK.leitlinie(W, pos[0], pos[1], ziel[0], ziel[1], farbe);
      const e = { p: p, l: l, links: links, x: pos[0], y: pos[1], messen: function () { const w = p.offsetWidth || 150, ln = l.querySelector("line"); ln.setAttribute("x1", BK.f(links ? pos[0] + w : pos[0] - w)); } };
      alle.push(e); e.messen();
      P.zeige(p, T0 + t); P.zeige(l, T0 + t + 0.15);
      return e;
    }
    // Zeit, zu der die Vorderachse so weit gefahren ist, dass die Spur „wahl“ den Kurvenwinkel WK erreicht (Beschriftung erst dann, nie ins Leere)
    function erreicht(id, wahl, tA, tB) {
      const zs = sim(id).zustaende; let sz = S_ENDE;
      for (let i = 0; i < zs.length; i++) { const p = wahl(zs[i]), th = Math.atan2(p.x, -(p.y - RT)); if (p.x > 0 && th >= WK) { sz = zs[i].s; break; } }
      let lo = tA, hi = tB; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (fahrtS(m, tA, tB) < sz) lo = m; else hi = m; }
      return hi;
    }
    // Beschriftung einer Achsspur: erscheint mit dem Satz (tSatz), frühestens wenn die Spur den Zielpunkt erreicht hat
    function etk(st, W, T0, ID, fz, text, pos, wahl, farbe, tSatz, mitte) {
      const tr = fz.tB > fz.tA ? Math.max(tSatz, erreicht(ID, wahl, fz.tA, fz.tB) + 0.3) : tSatz;
      return etikett(st, W, text, pos, mitte ? zielMitte(W, ID, wahl) : ziel(W, ID, wahl), farbe, T0, tr);
    }
    // Punkt einer Spur bei Kurvenwinkel theta (0 = Kurvenanfang, 90° = Kurvenende), gemessen vom Kurvenmittelpunkt (0 / RT)
    function beiWinkel(id, wahl, theta) {
      const s = sim(id), zs = s.zustaende;
      for (let i = 0; i < zs.length; i++) { const p = wahl(zs[i]), th = Math.atan2(p.x, -(p.y - RT)); if (p.x > 0 && th >= theta) return p; }
      return wahl(zs[zs.length - 1]);
    }
    const BUEHNE = { S: 22, ox: OX, oy: OY, fussOpazitaet: 0.2 };

    /* ---------- K1: Die Frage ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, Object.assign({ id: "k1" }, BUEHNE)), a = fahrt(st, W, "solo", { hintenAus: true });
      // „?“ an der Hinterachse (Satz 2), Spuren der Hinterachse erscheinen mit Satz 3
      const fragez = BK.el("g", { opacity: 0 }, W.gUeber);
      BK.el("circle", { r: 26, fill: F.creme, stroke: F.gold, "stroke-width": 5 }, fragez);
      const tq = BK.el("text", { "text-anchor": "middle", y: 14, "font-size": 40, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#2F4A34" }, fragez); tq.textContent = "?";
      const tA = 1.2, tB = 21.0, tFrage = ch.punkte[1].t, tReveal = ch.punkte[2].t;
      uhr(T0, ch.dauer, function (t) {
        const z = a.zeichne(fahrtS(t, tA, tB), t, bremstZeit(t, tB));
        const q = px(W, { x: z.A.x, y: z.A.y });
        fragez.setAttribute("transform", "translate(" + BK.f(q[0]) + " " + BK.f(q[1]) + ")");
        const an = t >= tFrage && t < tReveal - 0.2 ? 1 : 0, pulsiert = 1 + 0.08 * Math.sin(t * 6);
        fragez.style.opacity = an ? Math.min(1, (t - tFrage) / 0.4) : 0; fragez.setAttribute("transform", "translate(" + BK.f(q[0]) + " " + BK.f(q[1]) + ") scale(" + pulsiert.toFixed(3) + ")");
        a.spuren.a.zeige(t >= tReveal ? klemme((t - tReveal) / 0.8) : 0);
      });
      const fz1 = { tA: tA, tB: tB };
      etk(st, W, T0, "solo", fz1, tx("l_vorn"), POS.rechts1, (z) => z.F, F.vorn, ch.punkte[0].t + 0.3);
      etk(st, W, T0, "solo", fz1, tx("l_hinten"), POS.links1, (z) => z.A, F.hinten, tReveal + 0.5);
    }

    /* ---------- K2/K3/K4: ein Fahrzeug fährt die Kurve ---------- */
    function fahrKapitel(id, tA, tB, etiketten, bandT) {
      const fz = { tA: tA, tB: tB };
      return function (sc, i, T0, ch) {
        const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
        const W = BK.welt(st, Object.assign({ id: id + i }, BUEHNE)), a = fahrt(st, W, id);
        const extra = [];
        // Knickwinkel (Sattelzug): Bogen am Königszapfen zwischen den Längsachsen
        let knick = null, knickPille = null;
        if (id === "sattelzug") {
          knick = BK.el("path", { fill: "rgba(237,174,79,.55)", stroke: F.gold, "stroke-width": 3, opacity: 0 }, W.gUeber);
          knickPille = BK.pille(st, tx("l_knick"), 0, 0, { klasse: "klein", ax: "0" });
        }
        const tKnick = id === "sattelzug" ? ch.punkte[1].t : 0;
        uhr(T0, ch.dauer, function (t) {
          const z = a.zeichne(fahrtS(t, tA, tB), t, bremstZeit(t, tB));
          a.band.zeige(t >= bandT ? klemme((t - bandT) / 1.2) : 0);
          if (knick) {
            const K = px(W, z.K), r = 3.6 * W.S, h1 = z.hz + Math.PI, h2 = z.ha + Math.PI;
            const p1 = [K[0] + Math.cos(h1) * r, K[1] + Math.sin(h1) * r], p2 = [K[0] + Math.cos(h2) * r, K[1] + Math.sin(h2) * r];
            let dd = h2 - h1; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI;
            const gross = Math.abs(dd) > 0.035;
            knick.setAttribute("d", "M" + BK.f(K[0]) + " " + BK.f(K[1]) + " L" + BK.f(p1[0]) + " " + BK.f(p1[1]) + " A" + BK.f(r) + " " + BK.f(r) + " 0 0 " + (dd > 0 ? 1 : 0) + " " + BK.f(p2[0]) + " " + BK.f(p2[1]) + " Z");
            const an = t >= tKnick && gross ? klemme((t - tKnick) / 0.5) : 0;
            knick.style.opacity = an;
            knickPille.style.left = BK.f(K[0] + 62) + "px"; knickPille.style.top = BK.f(K[1]) + "px";
            knickPille.style.opacity = an;
          }
        });
        etiketten(st, W, a, T0, ch, fz);
      };
    }
    // Beschriftung: rechts außen die Vorderachse und der Gefahrenbereich, links innen die hinteren Achsen; alle Leitlinien enden bei Kurvenwinkel WK (gleiche Stelle der Kurve),
    // damit sich keine Linien kreuzen (oben = außen, unten = innen)
    const WK = 50 * Math.PI / 180, POS = { rechts1: [1040, 205, "r"], rechts2: [1040, 292, "r"], links1: [40, 540, "l"], links2: [40, 660, "l"] };
    // Zielpunkte der Leitlinien: alle bei Kurvenwinkel WK (oben = außen, unten = innen, Linien kreuzen sich nicht)
    const ziel = (W, id, wahl) => px(W, beiWinkel(id, wahl, WK));
    const zielMitte = (W, id, wahl) => { const a = beiWinkel(id, (z) => z.F, WK), b = beiWinkel(id, wahl, WK); return px(W, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }); };
    // Marke am Kupplungspunkt bzw. Königszapfen: folgt dem Fahrzeug, Pille rechts daneben (von tVon bis tBis)
    function markerFolgt(st, W, a, T0, fz, id, text, tVon, tBis, dauer) {
      const g = BK.el("g", { opacity: 0 }, W.gUeber);
      BK.el("circle", { r: 11, fill: F.gold, stroke: "#101410", "stroke-width": 3 }, g);
      const pl = BK.pille(st, text, 0, 0, { klasse: "klein", ax: "0" }); pl.style.opacity = 0;
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () {
        const t = proxy.t, an = t >= tVon && t < tBis ? klemme(Math.min((t - tVon) / 0.5, (tBis - t) / 0.4)) : 0;
        g.style.opacity = an; pl.style.opacity = an;
        if (!an) return;
        const z = a.sim.zustaende[idxVon(fahrtS(t, fz.tA, fz.tB))], q = px(W, z.K);
        g.setAttribute("transform", "translate(" + BK.f(q[0]) + " " + BK.f(q[1]) + ")");
        pl.style.left = BK.f(q[0] - 20) + "px"; pl.style.top = BK.f(q[1] - 62) + "px";
      } }, T0);
    }
    const K2 = fahrKapitel("solo", 1.5, 24.0, function (st, W, a, T0, ch, fz) {
      const e = (...x) => etk(st, W, T0, "solo", fz, ...x);
      e(tx("l_vorn"), POS.rechts1, (z) => z.F, F.vorn, ch.punkte[0].t + 0.3);
      e(tx("l_hinten"), POS.links1, (z) => z.A, F.hinten, ch.punkte[1].t + 0.3);
      e(tx("l_gefahr"), POS.rechts2, (z) => z.A, F.gold, ch.punkte[3].t + 0.3, true);
    }, 19.0);
    const K3 = fahrKapitel("lastzug", 1.5, 28.5, function (st, W, a, T0, ch, fz) {
      const e = (...x) => etk(st, W, T0, "lastzug", fz, ...x);
      e(tx("l_vorn"), POS.rechts1, (z) => z.F, F.vorn, ch.punkte[0].t + 0.3);
      e(tx("l_hinten"), POS.links1, (z) => z.A, F.hinten, ch.punkte[0].t + 0.3);
      e(tx("l_anhaenger"), POS.links2, (z) => z.T, F.anhaenger, ch.punkte[0].t + 0.6);
      e(tx("l_gefahr"), POS.rechts2, (z) => z.T, F.gold, ch.punkte[2].t + 0.3, true);
      markerFolgt(st, W, a, T0, fz, "lastzug", tx("l_kupplung"), ch.punkte[0].t, ch.punkte[1].t - 0.4, ch.dauer);
    }, 21.0);
    const K4 = fahrKapitel("sattelzug", 1.5, 30.0, function (st, W, a, T0, ch, fz) {
      const e = (...x) => etk(st, W, T0, "sattelzug", fz, ...x);
      e(tx("l_vorn"), POS.rechts1, (z) => z.F, F.vorn, ch.punkte[0].t + 0.3);
      e(tx("l_hinten"), POS.links1, (z) => z.A, F.hinten, ch.punkte[0].t + 0.3);
      e(tx("l_auflieger"), POS.links2, (z) => z.T, F.auflieger, ch.punkte[2].t + 0.3);
      e(tx("l_gefahr"), POS.rechts2, (z) => z.T, F.gold, ch.punkte[2].t + 0.6, true);
      markerFolgt(st, W, a, T0, fz, "sattelzug", tx("l_zapfen"), ch.punkte[0].t, ch.punkte[1].t - 0.4, ch.dauer);
    }, 20.0);

    /* ---------- K5 (und K7): Vergleich auf derselben Vorderachsbahn ---------- */
    function vergleich(sc, i, T0, ch, statisch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, !!ch.merk);
      const W = BK.welt(st, Object.assign({ id: "v" + i }, BUEHNE));
      const daten = ["solo", "lastzug", "sattelzug"].map((id) => {
        const fz = FZ[id], s = sim(id), farbe = id === "solo" ? F.hinten : id === "lastzug" ? F.anhaenger : F.auflieger;
        const wahl = fz.anh ? (z) => z.T : (z) => z.A;
        return { id: id, fz: fz, s: s, farbe: farbe, spur: BK.spur(W, s, wahl, farbe, { kopf: 9 }), wahl: wahl };
      });
      const sF = BK.spur(W, sim("solo"), (z) => z.F, F.vorn, { kopf: 9 });
      const bd = BK.band(W, sim("sattelzug"), (z) => z.F, sim("sattelzug"), (z) => z.T); bd.zeige(0);
      const fuss = BK.fussflaeche(W, sim("sattelzug"), { farbe: "#FAF6EC" });
      const tA = 1.0, tB = statisch ? 1.0 : 14.0;
      uhr(T0, ch.dauer, function (t) {
        const sNow = statisch ? S_ENDE : fahrtS(t, tA, tB), i2 = idxVon(sNow);
        sF.bis(i2); daten.forEach((d) => d.spur.bis(i2));
        if (statisch) { bd.zeige(1); bd.bis(i2); fuss.bis(i2); } else { bd.zeige(0); }
      });
      const namen = { solo: "l_lkw", lastzug: "l_lastzug", sattelzug: "l_sattel" }, ys = { solo: 540, lastzug: 628, sattelzug: 716 };
      const vz = { tA: tA, tB: tB };
      etk(st, W, T0, "solo", vz, tx("l_vorn"), POS.rechts1, (z) => z.F, F.vorn, statisch ? 0.5 : ch.punkte[0].t + 0.1);
      daten.forEach((d, k) => {
        const tr = statisch ? 0.6 + k * 0.2 : Math.max(ch.punkte[0].t + 0.3 + k * 0.4, erreicht(d.id, d.wahl, tA, tB) + 0.3);
        etikett(st, W, tx(namen[d.id]), [40, ys[d.id], "l"], ziel(W, d.id, d.wahl), d.farbe, T0, tr);
      });
      if (statisch) etikett(st, W, tx("l_gefahr"), POS.rechts2, zielMitte(W, "sattelzug", (z) => z.T), F.gold, T0, 1.2);
    }
    const K5 = (sc, i, T0, ch) => vergleich(sc, i, T0, ch, false);
    const K7 = (sc, i, T0, ch) => vergleich(sc, i, T0, ch, true);

    /* ---------- K6: Das Gesetz – Kreisring ---------- */
    function K6(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const S = 25, CX = 540, CY = 560, RA = 12.5 * S, RI = 5.3 * S;
      const W = BK.welt(st, { S: S, ox: CX - 40 * S, oy: CY - 12.5 * S, id: "k6", fussOpazitaet: 0.36 });
      const fz = FZ.sattelzug;
      // Kreis 570° (anderthalb Runden): der Auflieger läuft dem Zugfahrzeug um ca. 55° hinterher; so überstreichen auch die inneren Achsen den ganzen Ring im Dauerzustand
      const WINKEL = 19 * Math.PI / 6, bahnEcke = M.bahn([{ gerade: 40 }, { bogen: 12.5, winkel: WINKEL, rechts: true }]);
      const sS = 18, sE = 40 + 12.5 * WINKEL + 1;
      const sm = M.simuliere(fz, bahnEcke, sS, sE, DS, "ecke");
      const v = BK.fahrzeug(W.gFz, fz, W), fuss = BK.fussflaeche(W, sm, { farbe: "#FAF6EC" });
      const g = W.gBand, el = BK.el;
      // freie Innenfläche, erlaubter Ring (Umrisse), Gerade
      const ring = el("circle", { cx: CX, cy: CY, r: RA, fill: "rgba(250,246,236,.045)", stroke: F.creme, "stroke-width": 3, "stroke-dasharray": "14 10", opacity: 0 }, g);
      const innen = el("circle", { cx: CX, cy: CY, r: RI, fill: "rgba(143,214,166,.20)", stroke: F.hinten, "stroke-width": 3.5, opacity: 0 }, g);
      const y0 = CY - RA;   // tangierende Gerade
      const gerade = el("line", { x1: 0, y1: y0, x2: CX, y2: y0, stroke: F.creme, "stroke-width": 3, "stroke-dasharray": "14 10", opacity: 0 }, g);
      const limit = el("rect", { x: 0, y: y0 - 0.8 * S, width: CX, height: 0.8 * S, fill: "rgba(250,246,236,.22)", stroke: "rgba(250,246,236,.7)", "stroke-width": 2, opacity: 0 }, g);
      const mitte = el("circle", { cx: CX, cy: CY, r: 6, fill: F.creme, opacity: 0 }, W.gUeber);
      // Maße (über den Fahrzeugen)
      const polar = (r, grad) => [CX + r * Math.cos(grad * Math.PI / 180), CY + r * Math.sin(grad * Math.PI / 180)];
      const mAussen = BK.mass(W, ...polar(0, 0), ...polar(RA, 200), F.creme);
      const mRing = BK.mass(W, ...polar(RA, 38), ...polar(RI, 38), F.gold, 4);
      const mInnen = BK.mass(W, ...polar(0, 0), ...polar(RI, 90), F.hinten, 3.5);
      const mGerade = BK.mass(W, 250, y0, 250, y0 - 0.8 * S, F.gold, 3);
      const pAussen = BK.pille(st, tx("l_r_aussen"), 40, Math.round(polar(RA, 200)[1]), { ax: "0" });
      const pRing = BK.pille(st, tx("l_r_ring"), 1040, 800, { ax: "-100%" });
      const pInnen = BK.pille(st, tx("l_r_innen"), CX, CY - 52, { punkt: F.hinten });
      const pGerade = BK.pille(st, tx("l_r_gerade"), 60, y0 - 75, { punkt: F.gold, ax: "0" });
      const lGerade = BK.leitlinie(W, 200, y0 - 75, 250, y0 - 0.4 * S, F.gold);
      const t1 = ch.punkte[0].t, t2 = ch.punkte[1].t, t3 = ch.punkte[2].t, t4 = ch.punkte[3].t, tFahrt = t4 - 1.0, tEnde = ch.dauer - 1.5;
      // Einblenden (Deckkraft über GSAP; Kreise zeichnen sich nicht, sie blenden ein)
      [[ring, t1], [mAussen, t1 + 0.4], [pAussen, t1 + 0.6], [mitte, t1 + 0.2], [mRing, t2], [pRing, t2 + 0.3], [innen, t3], [mInnen, t3 + 0.4], [pInnen, t3 + 0.7], [gerade, t4], [limit, t4], [mGerade, t4 + 0.4], [pGerade, t4 + 0.7], [lGerade, t4 + 0.9]]
        .forEach((e) => P.zeige(e[0], T0 + e[1], 0.7));
      uhr(T0, ch.dauer, function (t) {
        const s = sS + (sE - sS) * profilU(t, tFahrt, tEnde), i2 = Math.max(0, Math.min(sm.zustaende.length - 1, Math.round((s - sS) / DS)));
        const z = sm.zustaende[i2];
        v.setze(z, 0, bremstZeit(t, tEnde)); fuss.bis(i2);
        v.zeige(t >= tFahrt - 0.01);
      });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7 };
    T.kapitel.forEach((ch, i) => {
      const sc = o.scenes[i], T0 = starts[i];
      bauer[ch.id](sc, i, T0, ch);
      if (ch.id === "k7") { /* Merksatz steht im Text-Feld */ }
      P.sceneFade(sc, T0, ch.dauer);
    });
    return { starts: starts, gesamt: P.gesamt, refit: function () { alle.forEach((e) => e.messen()); } };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
