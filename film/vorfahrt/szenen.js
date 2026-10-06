/* Szenen des Erklärfilms „Vorfahrt“ – EIN Code für den MP4-Film (HyperFrames, index.html) und die App
   (verkehr/vorfahrt-film.js, gebaut mit app-bauen.mjs). Zeiten stehen in text.js, Bilder in baukasten.js.

   bauen({ tl, T, tx, scenes, logo }) hängt alle Kapitel an die GSAP-Zeitleiste `tl`.
     T       FILM_TEXT (Kapitel, Zeiten)
     tx(k)   Text zum Schlüssel in der gewählten Sprache (Fallback Deutsch)
     scenes  Array mit den sechs Szenen-Elementen (je Kapitel eines)
     logo    nur im MP4: Pfad zum Logo für die Fußzeile
   Gibt { starts, gesamt } zurück (Kapitelanfänge und Gesamtlänge in Sekunden). */
(function (window) {
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, BK = window.BK;
    const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };
    const fade = (target, t, d, from) => tl.fromTo(target, from || { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: d || 0.6, ease: "power2.out" }, t);

    const starts = []; let acc = 0;
    T.kapitel.forEach(k => { starts.push(acc); acc += k.dauer; });

    const fits = [];   // Schrift-Anpassungen der Pyramide, werden nach dem Laden der Schriften wiederholt
    function stageBase(sc, opt) {
      const wrap = el("div", "stagewrap"), st = el("div", "stage");
      if (!(opt && opt.noRoad)) st.innerHTML = BK.roadSVG(opt);
      wrap.appendChild(st); sc.appendChild(wrap); return st;
    }
    function panel(sc, ch, i) {
      const p = el("div", "panel");
      const dots = el("div", "dots"); T.kapitel.forEach((_, j) => dots.appendChild(el("i", j === i ? "on" : "")));
      const titel = tx(ch.titel);
      p.appendChild(dots);
      p.appendChild(el("div", "kicker", (i > 0 && i < T.kapitel.length - 1 ? i + " · " : "") + tx(ch.kicker)));
      p.appendChild(el("h1", "ttl" + (titel.length > 16 ? " lang" : ""), titel));
      if (ch.sub) p.appendChild(el("div", "sub", tx(ch.sub.k)));
      p.appendChild(el("div", "pts"));
      if (o.logo) { const f = el("div", "foot"); const im = el("img"); im.src = o.logo; im.alt = ""; f.appendChild(im); f.appendChild(el("span", "", "Fahr-Akademie · Vorfahrt")); p.appendChild(f); }
      sc.appendChild(p); return p;
    }
    // Einblenden / Ausblenden im Stapel: immer nur EIN Satz sichtbar, der nächste ersetzt den vorigen.
    function stapel(p, items, T0, endT) {
      const wrap = p.querySelector(".pts");
      items.forEach((it, i) => {
        wrap.appendChild(it.el);
        fade(it.el, T0 + it.t);
        const nxt = items[i + 1];
        const out = nxt ? T0 + nxt.t - 0.4 : (endT != null ? T0 + endT : null);
        if (out != null) tl.to(it.el, { opacity: 0, duration: 0.35 }, out);
      });
    }
    function ptEl(pt) {
      const d = el("div", "pt" + (pt.stil === "gold" ? " gold" : ""));
      d.appendChild(el("div", "tx", tx(pt.k)));
      if (pt.ref) d.appendChild(el("div", "rf", pt.ref));
      return d;
    }
    const merkEl = (m) => el("div", "merk", tx(m.k));
    function standardPanel(sc, ch, i, T0, mitMerk) {
      const p = panel(sc, ch, i);
      const items = (ch.punkte || []).map(pt => ({ t: pt.t, el: ptEl(pt) }));
      if (mitMerk && ch.merk) items.push({ t: ch.merk.t, el: merkEl(ch.merk) });
      stapel(p, items, T0);
      return p;
    }
    function sceneFade(sc, T0, dur) {
      tl.fromTo(sc, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, T0);
      tl.to(sc, { opacity: 0, duration: 0.4, ease: "power1.in" }, T0 + dur - 0.4);
    }
    const stopLights = (car, t0) => { const b = BK.carBits(car); tl.to(b.brk, { opacity: 1, duration: 0.25 }, t0); return b; };

    /* ---------- Kapitel 1: Die Frage ---------- */
    function startAnordnung(st, id, T0) {
      const A = BK.makeCar(st, id + "a", "ivory"), B = BK.makeCar(st, id + "b", "gold"), C = BK.makeCar(st, id + "c", "green");
      BK.pose(tl, A, -100, 595, 0); BK.pose(tl, B, 595, 1180, -90); BK.pose(tl, C, 1180, 485, 180);
      BK.mv(tl, A, 338, 595, 0, 4.2, "power2.out", T0 + 1.0);
      BK.mv(tl, B, 595, 742, -90, 4.4, "power2.out", T0 + 1.8);
      BK.mv(tl, C, 742, 485, 180, 4.4, "power2.out", T0 + 2.3);
      [A, B, C].forEach((c, k) => stopLights(c, T0 + 3.4 + k * 0.5));
    }
    function K1(sc, i, T0, ch) {
      const st = stageBase(sc), p = standardPanel(sc, ch, i, T0, false);
      startAnordnung(st, "k1", T0);
      const tB = ch.punkte[0].t;                      // die Fragezeichen erscheinen mit dem ersten Satz
      const qs = [BK.badge(st, "?", 338, 674), BK.badge(st, "?", 676, 742), BK.badge(st, "?", 742, 410)];
      qs.forEach((q, k) => { tl.fromTo(q, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, T0 + tB + k * 0.3); BK.pulse(tl, q, T0 + tB + 1.2 + k * 0.3, T0 + ch.dauer - 0.6); });
      tl.fromTo(p.querySelector(".ttl"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T0 + 0.6);
      fade(p.querySelector(".sub"), T0 + ch.sub.t, 0.7, { opacity: 0, y: 20 });
    }

    /* ---------- Kapitel 2: Pyramide ---------- */
    function K2(sc, i, T0, ch) {
      const st = stageBase(sc, { noRoad: true }); st.style.background = "#EFE8D5";
      const p = panel(sc, ch, i);
      const widths = [300, 460, 620, 780, 940], fills = ["#2F4A34", "#3F6B4B", "#9CBF9F", "#D9954C"], cols = ["#FAF6EC", "#FAF6EC", "#2B2A22", "#2B2A22"];
      const icons = [
        `<div>${BK.policeSVG(92)}</div>`,
        `<div>${BK.ampelSVG(130)}</div>`,
        `<div class="signs"><img src="${BK.zeichenBase}z205.svg" alt="" style="width:92px;height:92px"><img src="${BK.zeichenBase}z206.svg" alt="" style="width:92px;height:92px"><img src="${BK.zeichenBase}z306.svg" alt="" style="width:92px;height:92px"></div>`,
        `<div>${BK.miniCross(130)}</div>`
      ];
      const iconW = [92, 61, 300, 130], stacked = [true, false, false, false];
      for (let k = 0; k < 4; k++) {
        const y = 120 + 200 * k, wt = widths[k] + (widths[k + 1] - widths[k]) * 3 / 200, wb = widths[k] + (widths[k + 1] - widths[k]) * 197 / 200;
        const poly = `${(1080 - wt) / 2}px 3px, ${(1080 + wt) / 2}px 3px, ${(1080 + wb) / 2}px 197px, ${(1080 - wb) / 2}px 197px`;
        const t = el("div", "tier");
        t.innerHTML = `<div class="shape" style="background:${fills[k]};clip-path:polygon(${poly})"></div><div class="ct" style="color:${cols[k]}">${icons[k]}</div>`;
        const nm = el("div", "nm", tx(ch.stufen[k].name)); t.querySelector(".ct").appendChild(nm);
        if (stacked[k]) { const ct = t.querySelector(".ct"); ct.style.flexDirection = "column"; ct.style.gap = "6px"; }
        const avail = stacked[k] ? widths[k] - 60 : (widths[k] + widths[k + 1]) / 2 - iconW[k] - 30 - 70;
        nm.style.maxWidth = avail + "px";
        t.style.top = y + "px"; st.appendChild(t);
        const start = stacked[k] ? 50 : 58; fits.push([nm, avail, start]); BK.fit(nm, avail, start, 44);
        // blasse Umrisse der ganzen Pyramide stehen von Anfang an da; jede Stufe füllt sich zu ihrer Zeit
        const g = el("div", "tier ghost"); g.style.top = y + "px";
        g.innerHTML = `<div class="shape" style="background:#D9CFB3;clip-path:polygon(${poly})"></div>`;
        st.insertBefore(g, st.firstChild); tl.fromTo(g, { opacity: 0 }, { opacity: 0.7, duration: 0.8 }, T0 + 0.6 + (3 - k) * 0.2);
        tl.fromTo(t, { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, T0 + ch.stufen[k].t);
      }
      const ar = BK.arrow(st, 38, 520, -90, 760); tl.fromTo(ar, { opacity: 0 }, { opacity: 1, duration: 0.8 }, T0 + ch.stufen[3].t + 3);
      const vp = BK.pill(st, tx(ch.vorrang), 112, 520, -90); tl.fromTo(vp, { opacity: 0 }, { opacity: 1, duration: 0.8 }, T0 + ch.stufen[3].t + 3.5);
      const items = [{ t: ch.intro.t, el: (() => { const d = el("div", "pt intro"); d.appendChild(el("div", "tx", tx(ch.intro.k))); return d; })() }];
      ch.stufen.forEach(s => {
        const d = el("div", "step");
        d.appendChild(el("div", "nr", s.nr)); d.appendChild(el("div", "nm", tx(s.name)));
        d.appendChild(el("div", "tx", tx(s.text))); d.appendChild(el("div", "px", tx(s.plus))); d.appendChild(el("div", "rf", s.ref));
        items.push({ t: s.t + 0.2, el: d });
      });
      items.push({ t: ch.merk.t, el: merkEl(ch.merk) });
      stapel(p, items, T0);
    }

    /* ---------- Kapitel 3: Rechts vor links (zwei Durchgänge, der 2. um 180° gedreht) ---------- */
    function K3(sc, i, T0, ch) {
      const st = stageBase(sc), p = standardPanel(sc, ch, i, T0, true);
      function zyklus(Tz, k, cx, cy) {
        const f = k ? (x, y, r) => [1080 - x, 1080 - y, r + 180] : (x, y, r) => [x, y, r];
        const X = BK.makeCar(st, "k3x" + k, cx), Y = BK.makeCar(st, "k3y" + k, cy);
        BK.pose(tl, X, ...f(-100, 595, 0)); BK.pose(tl, Y, ...f(595, 1180, -90));
        BK.mv(tl, X, ...f(338, 595, 0), 7.0, "power2.out", Tz);                 // früh langsamer werden
        const b = BK.carBits(X); BK.lights(tl, b.brk, Tz + 3.0, Tz + 17.6);
        BK.mv(tl, Y, ...f(595, -100, -90), 3.9, "none", Tz + 12.5);              // Auto von rechts fährt durch
        BK.mv(tl, X, ...f(1180, 595, 0), 3.2, "power2.in", Tz + 17.5);           // erst danach fährt das wartende weiter
        const [ax, ay, ar_] = f(595, 835, -90), [px, py] = f(655, 835, 0);
        const a = BK.arrow(st, ax, ay, ar_, 150), pl = BK.pill(st, tx(ch.pill), px, py, 0, k ? "r" : "l");
        [a, pl].forEach(e => { tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.5 }, Tz + 6.0); tl.to(e, { opacity: 0, duration: 0.5 }, Tz + 15.5); });
      }
      zyklus(T0 + 8.0, 0, "ivory", "gold");
      zyklus(T0 + 34.0, 1, "slate", "green");
    }

    /* ---------- Kapitel 4: Links abbiegen ---------- */
    function K4(sc, i, T0, ch) {
      const st = stageBase(sc, { marks: "h" }), p = standardPanel(sc, ch, i, T0, true);
      const s1 = BK.sign(st, "z306.svg", 384, 706, 88), s2 = BK.sign(st, "z306.svg", 696, 374, 88);
      [s1, s2].forEach(s => tl.fromTo(s, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, T0 + 0.4));
      const L = BK.makeCar(st, "k4l", "ivory"), G = BK.makeCar(st, "k4g", "green"), R = BK.makeCar(st, "k4r", "slate");
      BK.pose(tl, L, -100, 595, 0); BK.pose(tl, G, 1180, 485, 180); BK.pose(tl, R, 1180, 485, 180);
      const bL = BK.carBits(L), bR = BK.carBits(R);
      BK.mv(tl, L, 358, 595, 0, 3.6, "power2.out", T0 + 3.0);                    // blinkt, ordnet sich ein, hält
      BK.blink(tl, bL.left, T0 + 3.4, T0 + 29.8); BK.lights(tl, bL.brk, T0 + 6.0, T0 + 25.2);
      BK.mv(tl, G, -100, 485, 180, 3.9, "none", T0 + 14.0);                      // Gegenverkehr geradeaus (Satz 3)
      BK.blink(tl, bR.right, T0 + 19.6, T0 + 22.9);                              // Gegenverkehr biegt rechts ab (Satz 4)
      let t = BK.mv(tl, R, 685, 485, 180, 1.65, "power1.out", T0 + 20.0);
      t = BK.arc(tl, R, 685, 395, 90, 90, 180, 90, 0.95, t, 12);
      BK.mv(tl, R, 595, -100, 270, 1.6, "power1.in", t);
      let u = BK.mv(tl, L, 430, 595, 0, 1.0, "power1.in", T0 + 25.5);            // erst jetzt biegt L links ab (Satz 5)
      u = BK.arc(tl, L, 430, 430, 165, 90, 0, -90, 1.5, u, 14);
      BK.mv(tl, L, 595, -100, -90, 1.8, "power1.in", u);
      // Beispiel 2: zwei Linksabbieger von gegenüber, voreinander (Sätze 6 und 7)
      const L2 = BK.makeCar(st, "k4l2", "ivory"), L3 = BK.makeCar(st, "k4l3", "gold");
      BK.pose(tl, L2, -100, 595, 0); BK.pose(tl, L3, 1180, 485, 180);
      const b2 = BK.carBits(L2), b3 = BK.carBits(L3), t2 = T0 + 33.0, go = t2 + 3.7;
      BK.mv(tl, L2, 358, 595, 0, 2.6, "power2.out", t2); BK.mv(tl, L3, 722, 485, 180, 2.6, "power2.out", t2 + 0.2);
      BK.blink(tl, b2.left, t2 + 0.3, go + 3.6); BK.blink(tl, b3.left, t2 + 0.3, go + 3.6);
      BK.lights(tl, b2.brk, t2 + 1.8, go - 0.3); BK.lights(tl, b3.brk, t2 + 1.8, go - 0.3);
      let a = BK.mv(tl, L2, 515, 595, 0, 0.9, "power1.in", go); a = BK.arc(tl, L2, 515, 515, 80, 90, 0, -90, 1.1, a, 10); BK.mv(tl, L2, 595, -100, -90, 1.6, "power1.in", a);
      let c = BK.mv(tl, L3, 565, 485, 180, 0.9, "power1.in", go); c = BK.arc(tl, L3, 565, 565, 80, 270, 180, -90, 1.1, c, 10); BK.mv(tl, L3, 485, 1180, 90, 1.6, "power1.in", c);
      const vp = BK.pill(st, tx(ch.pill), 540, 330, 0);
      tl.fromTo(vp, { opacity: 0 }, { opacity: 1, duration: 0.5 }, go - 0.4); tl.to(vp, { opacity: 0, duration: 0.5 }, go + 3.2);
    }

    /* ---------- Kapitel 5: Tempo-30-Zone ---------- */
    function K5(sc, i, T0, ch) {
      const st = stageBase(sc), p = standardPanel(sc, ch, i, T0, true);
      const z = BK.sign(st, "z2741.svg", 200, 330, 200); tl.fromTo(z, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }, T0 + 0.6);
      const zp = el("div", "zonepill", "30 km/h"); st.appendChild(zp); tl.fromTo(zp, { opacity: 0 }, { opacity: 1, duration: 0.6 }, T0 + 1.5);
      const pk = [BK.makeCar(st, "k5p1", "green"), BK.makeCar(st, "k5p2", "slate")];   // parkende Autos und Hecke verdecken die Sicht nach rechts
      BK.pose(tl, pk[0], 462, 722, -90); BK.pose(tl, pk[1], 462, 842, -90);
      const hedge = el("div"); hedge.style.cssText = "left:262px;top:654px;width:150px;height:30px;border-radius:15px;background:#6F8F63;box-shadow:inset 0 -6px 0 rgba(0,0,0,.12),0 5px 8px rgba(43,42,34,.25)"; st.appendChild(hedge);
      const X = BK.makeCar(st, "k5x", "ivory"), Y1 = BK.makeCar(st, "k5y1", "gold"), Y2 = BK.makeCar(st, "k5y2", "slate");
      BK.pose(tl, X, -100, 595, 0); BK.pose(tl, Y1, 595, 1180, -90); BK.pose(tl, Y2, 595, 1180, -90);
      const b = BK.carBits(X);
      BK.mv(tl, X, 260, 595, 0, 3.4, "power1.out", T0 + 3.0);
      BK.mv(tl, X, 338, 595, 0, 2.2, "power1.out", T0 + 6.4); BK.lights(tl, b.brk, T0 + 6.8, T0 + 28.2);
      BK.mv(tl, X, 392, 595, 0, 2.0, "power1.inOut", T0 + 21.0);   // vorsichtig hineintasten (Satz 3)
      BK.mv(tl, Y1, 595, -100, -90, 5.0, "none", T0 + 22.2);
      BK.mv(tl, Y2, 595, -100, -90, 5.0, "none", T0 + 25.0);
      BK.mv(tl, X, 1180, 595, 0, 3.4, "power2.in", T0 + 28.4);
    }

    /* ---------- Kapitel 6: Auflösung ---------- */
    function K6(sc, i, T0, ch) {
      const st = stageBase(sc), p = standardPanel(sc, ch, i, T0, false);
      const A = BK.makeCar(st, "k6a", "ivory"), B = BK.makeCar(st, "k6b", "gold"), C = BK.makeCar(st, "k6c", "green");
      BK.pose(tl, A, 338, 595, 0); BK.pose(tl, B, 595, 742, -90); BK.pose(tl, C, 742, 485, 180);
      [A, B, C].forEach(c => { tl.set(BK.carBits(c).brk, { opacity: 1 }, 0); });
      const nums = [[BK.badge(st, "1", 742, 410), ch.punkte[0].t], [BK.badge(st, "2", 676, 742), ch.punkte[1].t], [BK.badge(st, "3", 338, 674), ch.punkte[2].t]];
      nums.forEach(n => { tl.fromTo(n[0], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, T0 + n[1]); tl.to(n[0], { opacity: 0, duration: 0.5 }, T0 + n[1] + 5.0); });
      BK.mv(tl, C, -100, 485, 180, 2.9, "power2.in", T0 + 5.0);
      BK.mv(tl, B, 595, -100, -90, 3.2, "power2.in", T0 + 12.0);
      BK.mv(tl, A, 1180, 595, 0, 3.4, "power2.in", T0 + 20.0);
      const m = el("div", "bigcard", tx(ch.merk.k)); st.appendChild(m);
      tl.fromTo(m, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T0 + ch.merk.t);
    }

    const B = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6 };
    T.kapitel.forEach((ch, i) => {
      const sc = o.scenes[i], T0 = starts[i];
      B[ch.id](sc, i, T0, ch);
      sceneFade(sc, T0, ch.dauer);
    });
    return { starts: starts, gesamt: acc, refit: function () { fits.forEach(f => BK.fit(f[0], f[1], f[2], 44)); } };
  }
  window.VFSzenen = { bauen: bauen };
})(window);
