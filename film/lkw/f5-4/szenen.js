/* Szenen des Films 5.4 „Abstand“ – Seitenansicht (Kapitel 1 bis 3, 5) und Draufsicht (Kapitel 4).
   Alle Bewegungen kommen aus dem Rechenmodell (kern/modell.js: folgefahrt, Bahn/simuliere für den Spurwechsel des Lastzugs).
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, SE = window.LKW_SEITE, F = BK.FARBE, FZ = M.FAHRZEUGE;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Abstand" });
    const starts = P.starts;
    const klemme = (u) => Math.max(0, Math.min(1, u));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    const V0 = 80 / 3.6;                       // Beispielgeschwindigkeit (kommt im Film nicht als Zahl vor)
    const GRUEN = "#8FD6A6";

    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    // Pille, die der Zeichnung folgt (Mitte x, y), sichtbar zwischen t0 und t1
    function folgPille(st, text, farbe, gross) {
      const p = BK.pille(st, text, 0, 0, { punkt: farbe, klasse: gross ? "gross" : "" });
      return { el: p, setze: function (x, y, an) { const w = p.offsetWidth || 300, xx = Math.max(w / 2 + 30, Math.min(1050 - w / 2, x)); p.style.left = BK.f(xx) + "px"; p.style.top = BK.f(y) + "px"; p.style.opacity = an; } };
    }
    const fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.4)), klemme((b - t) / (d || 0.4)));

    /* ---------- Seitenansicht: Lkw (oder Bus) hinter Pkw ---------- */
    function seitenBuehne(st) {
      const V = SE.szene(st, { S: 14.5, px0: 150, boden: 700 });
      const lkw = SE.lkw(V), bus = SE.bus(V), pkw = SE.pkw(V), kl = SE.klammer(V, 570);
      bus.g.style.visibility = "hidden";
      return {
        V: V, kl: kl,
        // xH: Front des Lkw, xV: Heck des Pkw, bremstH/bremstV, zeigeBus, deckkraft
        setze: function (xH, xV, bremstH, bremstV, opt) {
          opt = opt || {};
          V.kamera(xH);
          const fahr = opt.bus ? bus : lkw;
          lkw.g.style.visibility = opt.bus ? "hidden" : "visible"; bus.g.style.visibility = opt.bus ? "visible" : "hidden";
          fahr.setze(xH, bremstH, xH); pkw.setze(xV, bremstV, xV);
          V.gFz.style.opacity = opt.deckkraft != null ? opt.deckkraft : 1;
        }
      };
    }
    const frageZeichen = (V) => {
      const g = BK.el("g", { opacity: 0 }, V.gUeber);
      BK.el("circle", { r: 28, fill: F.creme, stroke: F.gold, "stroke-width": 5 }, g);
      const t = BK.el("text", { "text-anchor": "middle", y: 15, "font-size": 42, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#2F4A34" }, g); t.textContent = "?";
      return g;
    };

    /* ---------- K1: Die Frage ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = seitenBuehne(st), q = frageZeichen(B.V);
      const GAP = 35, tq = ch.punkte[1].t;
      uhr(T0, ch.dauer, function (t) {
        const xH = V0 * t;
        B.setze(xH, xH + GAP, false, false);
        const m = B.kl.setze(xH, xH + GAP); B.kl.g.style.opacity = klemme((t - tq) / 0.6);
        q.setAttribute("transform", "translate(" + BK.f(m[0]) + " " + BK.f(m[1] - 90) + ") scale(" + (1 + 0.07 * Math.sin(t * 6)).toFixed(3) + ")"); q.style.opacity = klemme((t - tq) / 0.6);
      });
    }

    /* ---------- K2: Grundregel, zwei Durchläufe (genug / zu wenig Abstand) ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = seitenBuehne(st);
      const basis = { v0: V0, aVorn: 8, aHinten: 5, reaktion: 1.0, dauer: 14 };
      const A = M.folgefahrt(Object.assign({ luecke: 50 }, basis)), Bn = M.folgefahrt(Object.assign({ luecke: 20 }, basis));
      const tA = 17.8, tUm = 26.5, tB = 30.0, tFrei = tB + Bn.kollision - 0.25, tC = 37.5;   // Durchlauf B wird kurz vor der Berührung angehalten
      const pg = folgPille(st, tx("l_genug"), GRUEN, true), pz = folgPille(st, tx("l_zuwenig"), F.gold, true);
      const zust = (t) => {
        if (t < tUm) { const tau = t - tA, z = tau < 0 ? { xV: V0 * tau, xH: -50 + V0 * tau, bremstV: false, bremstH: false } : A.bei(tau); return { z: z, gap: 50, run: "A" }; }
        if (t < tC) { const tau = Math.min(t, tFrei) - tB, z = tau < 0 ? { xV: V0 * tau, xH: -20 + V0 * tau, bremstV: false, bremstH: false } : Bn.bei(tau); return { z: z, gap: 20, run: "B" }; }
        const tau = t - tC; return { z: { xV: V0 * tau, xH: -50 + V0 * tau, bremstV: false, bremstH: false }, gap: 50, run: "C" };
      };
      uhr(T0, ch.dauer, function (t) {
        const s = zust(t), z = s.z;
        const dunkel = Math.min(1, Math.abs(t - tUm) / 0.3, Math.abs(t - tC) / 0.3);
        B.setze(z.xH, z.xV, z.bremstH, z.bremstV, { deckkraft: dunkel });
        const zeigeKl = (s.run === "A" && t >= tA) || (s.run === "B" && t >= tB);
        const m = B.kl.setze(z.xH, z.xV); B.kl.g.style.opacity = zeigeKl ? dunkel : 0;
        B.kl.farbe(s.run === "A" ? GRUEN : F.gold);
        pg.setze(m[0], 400, fenster(t, 23.5, tUm - 0.6)); pz.setze(m[0], 400, fenster(t, tFrei + 0.2, tC - 0.6));
      });
    }

    /* ---------- K3: Autobahn, 50 m ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), B = seitenBuehne(st);
      const pm = folgPille(st, tx("l_mindest"), GRUEN, true), pk = folgPille(st, tx("l_zukurz"), F.gold, true);
      const tBus = ch.punkte[2].t;
      const abstand = (t) => t < 5 ? 56 : t < 11 ? 56 - 6 * glatt((t - 5) / 6) : t < 28 ? 50 : 50 - 14 * glatt((t - 28) / 5);
      uhr(T0, ch.dauer, function (t) {
        const xH = V0 * t, gap = abstand(t);
        B.setze(xH, xH + gap, false, false, { bus: t >= tBus });
        const ok = gap >= 49.99, m = B.kl.setze(xH, xH + gap);
        B.kl.g.style.opacity = klemme((t - 3.0) / 0.6); B.kl.farbe(ok ? GRUEN : F.gold);
        pm.setze(m[0], 400, fenster(t, 11.5, 27.5)); pk.setze(m[0], 400, fenster(t, 34, ch.dauer - 1));
      });
    }

    /* ---------- K4: Außerorts, Zug länger als 7 m (Draufsicht) ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const S = 16, W = BK.welt(st, { S: S, ox: 0, oy: 700, id: "k4", raster: false, massstab: false });
      st.style.background = "#35503F";
      const gras = BK.el("g", null, W.gBand), baeume = [];
      for (let k = 0; k < 60; k++) {          // Bäume (feste Verteilung, laufen mit der Straße)
        const h = (k * 2654435761) % 1000, ob = k % 2 === 0, dy = 40 + (h % 260), r = 14 + (h % 17);
        baeume.push([BK.el("circle", { r: r, cy: ob ? 616 - dy : 728 + dy, fill: ["#2B4A38", "#31543F", "#264233"][k % 3], opacity: 0.95 }, gras), k * 17 + (h % 13)]);
      }
      const strasse = BK.el("g", null, W.gBand);
      BK.el("rect", { x: 0, y: 616, width: 1080, height: 112, fill: "#4A524C" }, strasse);
      BK.el("rect", { x: 0, y: 616, width: 1080, height: 4, fill: "rgba(250,246,236,.8)" }, strasse); BK.el("rect", { x: 0, y: 724, width: 1080, height: 4, fill: "rgba(250,246,236,.8)" }, strasse);
      const dash = [], pfeile = [];
      for (let k = -2; k < 26; k++) dash.push([BK.el("rect", { y: 670, width: 48, height: 4, fill: "rgba(250,246,236,.75)" }, strasse), k * 9]);
      const pfGroup = BK.el("g", { opacity: 0 }, W.gBand);
      for (let k = -2; k < 16; k++) pfeile.push([BK.el("path", { d: "M0 -8 L38 -8 L38 -17 L58 0 L38 17 L38 8 L0 8 Z", fill: "rgba(250,246,236,.8)" }, pfGroup), k * 20]);
      let cam = 0; const pos = (x) => x - cam + 26;
      const rund = (v, p) => ((v % p) + p) % p;
      const kam = (c) => {
        cam = c;
        dash.forEach((d) => d[0].setAttribute("x", BK.f(rund(d[1] - c, 252) * S - 60)));
        pfeile.forEach((a) => a[0].setAttribute("transform", "translate(" + BK.f(rund(a[1] - c, 340) * S - 120) + " 644)"));
        baeume.forEach((b) => b[0].setAttribute("cx", BK.f(rund(b[1] * 5 - c, 1020) * S / 5 * 1.0 - 60)));
      };
      const lz = BK.fahrzeug(W.gFz, FZ.lastzug, W), pkwV = BK.pkwOben(W.gFz, W, "#D9954C"), pkwO = BK.pkwOben(W.gFz, W, "#5E7C8F");
      const fzL = FZ.lastzug;
      const zGerade = (xF, y, h) => {
        const A = { x: xF - fzL.L, y: y }, K = { x: A.x + fzL.e, y: y };
        return { A: A, hz: 0, F: { x: xF, y: y, h: 0 }, K: K, T: { x: K.x - fzL.D, y: y }, ha: 0 };
      };
      // Teil B: der Lastzug schert aus und überholt den Pkw (Bahn aus zwei Spurwechseln, gerechnet)
      const TB0 = 38, TENDE = ch.dauer, DT = 0.01;
      const vB = (t) => { const u = t - TB0; return u < 3 ? 14 : u < 6.5 ? 14 + 2 * (u - 3) : t < 52.5 ? 21 : t < 56 ? 21 - 2 * (t - 52.5) : 14; };
      const sB = [0]; for (let t = TB0; t < TENDE; t += DT) sB.push(sB[sB.length - 1] + vB(t) * DT);
      const sBei = (t) => sB[Math.max(0, Math.min(sB.length - 1, Math.round((t - TB0) / DT)))];
      const R = 70, a = Math.acos(1 - 3.5 / (2 * R)), lenArc = R * a;
      const carRear = (t) => 25 + 14 * (t - TB0);
      let tRet = TB0 + 3; for (let t = TB0 + 3; t < TENDE; t += DT) { if (sBei(t) - 17.6 - (carRear(t) + 4.4) >= 14) { tRet = t; break; } }
      const sOut = sBei(TB0 + 3), sRet = sBei(tRet);
      const bahnB = M.bahn([{ gerade: sOut }, { bogen: R, winkel: a, rechts: false }, { bogen: R, winkel: a, rechts: true }, { gerade: sRet - sOut - 2 * lenArc }, { bogen: R, winkel: a, rechts: true }, { bogen: R, winkel: a, rechts: false }, { gerade: 400 }]);
      const simB = M.simuliere(fzL, bahnB, -25, sB[sB.length - 1] + 5, 0.05);
      const pl = folgPille(st, tx("l_zug"), F.gold), pp = folgPille(st, tx("l_platz"), GRUEN);
      const kl = BK.el("g", { opacity: 0 }, W.gUeber), klL = BK.el("line", { stroke: F.gold, "stroke-width": 5 }, kl), klA = BK.el("line", { stroke: F.gold, "stroke-width": 5 }, kl), klB = BK.el("line", { stroke: F.gold, "stroke-width": 5 }, kl);
      const klGap = BK.el("g", { opacity: 0 }, W.gUeber), kgL = BK.el("line", { stroke: GRUEN, "stroke-width": 5 }, klGap), kgA = BK.el("line", { stroke: GRUEN, "stroke-width": 5 }, klGap), kgB = BK.el("line", { stroke: GRUEN, "stroke-width": 5 }, klGap);
      const linie = (l, a1, b1, x1, x2, y) => { l.setAttribute("x1", BK.f(x1)); l.setAttribute("x2", BK.f(x2)); l.setAttribute("y1", y); l.setAttribute("y2", y); a1.setAttribute("x1", BK.f(x1)); a1.setAttribute("x2", BK.f(x1)); a1.setAttribute("y1", y - 14); a1.setAttribute("y2", y + 14); b1.setAttribute("x1", BK.f(x2)); b1.setAttribute("x2", BK.f(x2)); b1.setAttribute("y1", y - 14); b1.setAttribute("y2", y + 14); };
      const tU = 2, tPfeil = ch.punkte[1].t, tm = tU + (8 + 45) / 4, tmD = 2.0;   // tm: Überholer beginnt einzuscheren (8 m vor dem Zug-Ende nach vorn), tmD: Dauer
      uhr(T0, ch.dauer, function (t) {
        let vis;
        if (t < TB0) {
          // Teil A: Zug und Pkw fahren gleich schnell; ein Überholer schert zwischen beiden ein
          const xF = 14 * t; kam(xF);
          lz.setze(zGerade(pos(xF), 0, 0), 0);
          pkwV.setze(pos(xF + 30 + 2.2), 0, 0, false, false);
          const u = glatt((t - tm) / tmD), rel = t < tm + tmD ? -45 + 4 * (t - tU) : 16;
          const y = -3.5 * (1 - u), tau = klemme((t - tm) / tmD), dydt = 3.5 * 6 * tau * (1 - tau) / tmD;
          pkwO.setze(pos(xF + rel), y, Math.atan2(dydt, 18), t > tm - 1.2 && t < tm + tmD + 0.6, false);
          pl.setze(pos(xF - 17.6 / 2) * S, 830, fenster(t, 4.5, 17.5)); linie(klL, klA, klB, pos(xF - 17.6) * S, pos(xF) * S, 770); kl.style.opacity = fenster(t, 4.5, 17.5);
          pp.setze(pos(xF + 15) * S, 545, fenster(t, 9.5, 19.5)); linie(kgL, kgA, kgB, pos(xF) * S, pos(xF + 30) * S, 590); klGap.style.opacity = fenster(t, 9.5, 19.5);
          pfGroup.style.opacity = t >= tPfeil ? klemme((t - tPfeil) / 0.8) : 0;
          vis = Math.min(1, (TB0 - 0.2 - t) / 0.4);
          pkwO.g.style.visibility = "visible";
        } else {
          // Teil B: der Lastzug schert aus und überholt den Pkw (Spurwechsel-Bahn gerechnet)
          const s = sBei(t), idx = Math.max(0, Math.min(simB.zustaende.length - 1, Math.round((s + 25) / 0.05))), z = simB.zustaende[idx];
          kam(z.F.x);
          const sh = (p) => ({ x: pos(p.x), y: p.y });
          const zz = { A: sh(z.A), hz: z.hz, F: { x: pos(z.F.x), y: z.F.y, h: z.F.h }, K: sh(z.K), T: sh(z.T), ha: z.ha };
          const links = t > TB0 + 1.2 && s < sOut + 2 * lenArc, rechts = s > sRet - 12 && s < sRet + 2 * lenArc + 4;
          const bl = Math.floor(t * 3) % 2 === 0; lz.setze(zz, rechts && bl ? 1 : 0, false, links && bl ? 1 : 0);
          pkwV.setze(pos(carRear(t) + 2.2), 0, 0, false, false);
          pkwO.g.style.visibility = "hidden";
          pl.setze(0, 0, 0); pp.setze(0, 0, 0); kl.style.opacity = 0; klGap.style.opacity = 0; pfGroup.style.opacity = 0;
          vis = Math.min(1, (t - TB0) / 0.4);
        }
        W.gFz.style.opacity = Math.max(0, vis);
      });
    }

    /* ---------- K5: Merke (Seitenansicht, ruhig) ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), B = seitenBuehne(st), pm = folgPille(st, tx("l_mindest"), GRUEN, true);
      uhr(T0, ch.dauer, function (t) {
        const xH = V0 * t; B.setze(xH, xH + 50, false, false);
        const m = B.kl.setze(xH, xH + 50); B.kl.g.style.opacity = 1; B.kl.farbe(GRUEN); pm.setze(m[0], 400, klemme((t - 1) / 0.6));
      });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5 };
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);
