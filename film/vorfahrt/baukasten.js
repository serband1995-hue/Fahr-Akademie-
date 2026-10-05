/* Baukasten: Kreuzung, Autos, Schilder, Figuren. Alles deterministisch (kein Zufall, keine Uhr).
   Bühne 1080 x 1080, Kreuzungsmitte (540,540), Straßen 220 breit, Rechtsverkehr.
   Spuren: Ost-fahrend y=595 · West-fahrend y=485 · Nord-fahrend x=595 · Süd-fahrend x=485.
   Drehung (rotation, Grad): Ost 0 · Süd 90 · West 180 · Nord -90 (bzw. 270). */
(function () {
  const P = { ground: "#E8E0CB", walk: "#F1EBDA", b1: "#D9CFB3", b2: "#CFC4A6", road: "#575E55", line: "#FAF6EC", ink: "#2F4A34", green: "#3F6B4B", gold: "#D9954C", text: "#2B2A22" };
  const CARS = {
    ivory: { b: "#F3EDE0", d: "#B9AE93" }, gold: { b: "#D9954C", d: "#A8692A" },
    green: { b: "#4B7A56", d: "#2F4A34" }, slate: { b: "#5E7C8F", d: "#3E566A" }
  };
  const BOX = { x0: 430, x1: 650, y0: 430, y1: 650 };

  function carSVG(c) {
    return `<svg viewBox="0 0 104 54" width="104" height="54" xmlns="http://www.w3.org/2000/svg">
<rect x="16" y="0" width="16" height="6" rx="2" fill="#2B2A22"/><rect x="70" y="0" width="16" height="6" rx="2" fill="#2B2A22"/>
<rect x="16" y="48" width="16" height="6" rx="2" fill="#2B2A22"/><rect x="70" y="48" width="16" height="6" rx="2" fill="#2B2A22"/>
<rect x="2" y="3" width="100" height="48" rx="15" fill="${c.b}" stroke="${c.d}" stroke-width="2.5"/>
<path d="M64 9 Q80 10 83 27 Q80 44 64 45 Z" fill="#34464E"/>
<path d="M34 9 Q22 12 20 27 Q22 42 34 45 Z" fill="#34464E"/>
<rect x="33" y="9" width="32" height="36" rx="8" fill="${c.b}" stroke="${c.d}" stroke-width="1.5"/>
<rect x="95" y="8" width="6" height="8" rx="3" fill="#FFF3C4"/><rect x="95" y="38" width="6" height="8" rx="3" fill="#FFF3C4"/>
<rect x="3" y="8" width="6" height="8" rx="3" fill="#8E2B1E"/><rect x="3" y="38" width="6" height="8" rx="3" fill="#8E2B1E"/>
<g class="brk" opacity="0"><rect x="1" y="6" width="9" height="12" rx="4" fill="#FF3B2B"/><rect x="1" y="36" width="9" height="12" rx="4" fill="#FF3B2B"/></g>
<g class="bl bl-l" opacity="0"><rect x="91" y="1" width="9" height="7" rx="3" fill="#FFB81C"/><rect x="2" y="1" width="9" height="7" rx="3" fill="#FFB81C"/></g>
<g class="bl bl-r" opacity="0"><rect x="91" y="46" width="9" height="7" rx="3" fill="#FFB81C"/><rect x="2" y="46" width="9" height="7" rx="3" fill="#FFB81C"/></g>
</svg>`;
  }
  function makeCar(parent, id, color) {
    const d = document.createElement("div");
    d.className = "car"; d.id = id; d.innerHTML = carSVG(CARS[color]);
    parent.appendChild(d); return d;
  }
  const carBits = (car) => ({ brk: car.querySelectorAll(".brk"), left: car.querySelectorAll(".bl-l"), right: car.querySelectorAll(".bl-r") });

  function roadSVG(o) {
    o = o || {};
    const blocks = [[20, 20, 384, 384], [676, 20, 384, 384], [20, 676, 384, 384], [676, 676, 384, 384]];
    let s = `<svg class="road" viewBox="0 0 1080 1080" width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">`;
    s += `<rect width="1080" height="1080" fill="${P.ground}"/>`;
    blocks.forEach((b, i) => {
      const [x, y, w, h] = b;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${P.walk}"/>`;
      s += `<rect x="${x + 26}" y="${y + 26}" width="${w - 52}" height="${h - 52}" rx="18" fill="${i % 2 ? P.b2 : P.b1}"/>`;
      s += `<rect x="${x + 54}" y="${y + 54}" width="${(w - 52) / 2 - 36}" height="${h - 108}" rx="10" fill="#fff" opacity=".16"/>`;
      s += `<rect x="${x + 54 + (w - 52) / 2}" y="${y + 54}" width="${(w - 52) / 2 - 36}" height="${h - 108}" rx="10" fill="#000" opacity=".05"/>`;
    });
    s += `<rect x="0" y="430" width="1080" height="220" fill="${P.road}"/><rect x="430" y="0" width="220" height="1080" fill="${P.road}"/>`;
    if (o.marks === "h") {
      s += `<g stroke="${P.line}" stroke-width="5" stroke-dasharray="34 26" opacity=".85"><line x1="0" y1="540" x2="404" y2="540"/><line x1="676" y1="540" x2="1080" y2="540"/></g>`;
    }
    // Bäume (feste Positionen)
    [[408, 70], [408, 340], [672, 70], [672, 340], [408, 740], [408, 1010], [672, 740], [672, 1010], [70, 408], [340, 408], [740, 408], [1010, 408], [70, 672], [340, 672], [740, 672], [1010, 672]].forEach(t => {
      s += `<circle cx="${t[0] + 3}" cy="${t[1] + 5}" r="20" fill="#2B2A22" opacity=".12"/><circle cx="${t[0]}" cy="${t[1]}" r="19" fill="#8FA97C"/><circle cx="${t[0] - 5}" cy="${t[1] - 5}" r="9" fill="#A9C093" opacity=".8"/>`;
    });
    s += `</svg>`;
    return s;
  }

  function sign(parent, file, x, y, size, cls) {
    const d = document.createElement("div");
    d.className = "sign " + (cls || "");
    d.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px`;
    d.innerHTML = `<img src="assets/zeichen/${file}" alt="" width="${size}" height="${size}">`;
    parent.appendChild(d); return d;
  }
  function badge(parent, txt, x, y, cls) {
    const d = document.createElement("div");
    d.className = "badge " + (cls || ""); d.textContent = txt;
    d.style.cssText = `left:${x}px;top:${y}px`; parent.appendChild(d); return d;
  }
  function pill(parent, txt, x, y, rot) {
    const d = document.createElement("div");
    d.className = "pill"; d.textContent = txt;
    d.style.cssText = `left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${rot || 0}deg)`; parent.appendChild(d); return d;
  }
  function arrow(parent, x, y, rot, len) {
    len = len || 150;
    const d = document.createElement("div");
    d.className = "arrow"; d.style.cssText = `left:${x}px;top:${y}px;width:${len}px;height:70px;margin:-35px 0 0 ${-len / 2}px;transform:rotate(${rot}deg)`;
    d.innerHTML = `<svg viewBox="0 0 ${len} 70" width="${len}" height="70"><path d="M6 24 H${len - 46} V6 L${len - 6} 35 L${len - 46} 64 V46 H6 Z" fill="${P.gold}" stroke="#8F5A14" stroke-width="3" stroke-linejoin="round"/></svg>`;
    parent.appendChild(d); return d;
  }

  /* Polizist: Vorderansicht, neutral, Arme seitlich (§ 36 Abs. 2 Nr. 1: Halt vor der Kreuzung) */
  function policeSVG(size) {
    return `<svg viewBox="0 0 160 170" width="${size}" height="${size * 170 / 160}" xmlns="http://www.w3.org/2000/svg">
<rect x="62" y="108" width="14" height="52" rx="5" fill="#2B3A4A"/><rect x="84" y="108" width="14" height="52" rx="5" fill="#2B3A4A"/>
<rect x="56" y="156" width="24" height="9" rx="4" fill="#1E2A36"/><rect x="80" y="156" width="24" height="9" rx="4" fill="#1E2A36"/>
<path d="M18 62 L56 58 L56 70 L20 76 Z" fill="#3E5C76"/><path d="M142 62 L104 58 L104 70 L140 76 Z" fill="#3E5C76"/>
<circle cx="14" cy="69" r="8" fill="#E7C8A4"/><circle cx="146" cy="69" r="8" fill="#E7C8A4"/>
<rect x="52" y="52" width="56" height="62" rx="12" fill="#3E5C76"/>
<rect x="52" y="96" width="56" height="8" fill="#2B3A4A"/><rect x="74" y="94" width="12" height="12" rx="2" fill="${P.gold}"/>
<rect x="72" y="46" width="16" height="10" fill="#E7C8A4"/>
<circle cx="80" cy="34" r="17" fill="#E7C8A4"/>
<path d="M60 30 Q60 12 80 12 Q100 12 100 30 Z" fill="#2B3A4A"/><rect x="56" y="28" width="48" height="6" rx="3" fill="#1E2A36"/><circle cx="80" cy="21" r="3.5" fill="${P.gold}"/>
</svg>`;
  }
  function ampelSVG(size) {
    return `<svg viewBox="0 0 80 170" width="${size * 80 / 170}" height="${size}" xmlns="http://www.w3.org/2000/svg">
<rect x="35" y="130" width="10" height="40" fill="#3A3F3A"/>
<rect x="8" y="4" width="64" height="130" rx="16" fill="#2B2A22"/>
<circle cx="40" cy="36" r="17" fill="#E0503B"/><circle cx="40" cy="69" r="17" fill="#6B5B2A"/><circle cx="40" cy="102" r="17" fill="#2F5A3C"/>
<circle cx="35" cy="30" r="5" fill="#fff" opacity=".35"/>
</svg>`;
  }
  function miniCross(size) {
    return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="160" rx="16" fill="${P.ground}"/>
<rect x="0" y="46" width="160" height="68" fill="${P.road}"/><rect x="46" y="0" width="68" height="160" fill="${P.road}"/>
<g transform="translate(24 97)"><rect x="-24" y="-13" width="48" height="26" rx="9" fill="#F3EDE0" stroke="#B9AE93" stroke-width="2"/><rect x="2" y="-9" width="13" height="18" rx="4" fill="#34464E"/></g>
<g transform="translate(97 128) rotate(-90)"><rect x="-24" y="-13" width="48" height="26" rx="9" fill="${P.gold}" stroke="#A8692A" stroke-width="2"/><rect x="2" y="-9" width="13" height="18" rx="4" fill="#34464E"/></g>
<path d="M150 150 L128 150 L128 138 L112 153 L128 168 L128 156 L150 156 Z" fill="none"/>
</svg>`;
  }

  /* Bewegungs-Hilfen (alle auf der gemeinsamen GSAP-Zeitleiste) */
  function pose(tl, el, x, y, r, t) { tl.set(el, { x: x, y: y, rotation: r }, t || 0); }
  function mv(tl, el, x, y, r, dur, ease, t) { tl.to(el, { x: x, y: y, rotation: r, duration: dur, ease: ease || "none" }, t); return t + dur; }
  function arc(tl, el, cx, cy, R, a0, a1, rOff, dur, t, n) {
    n = n || 12; let tt = t; const d = dur / n;
    for (let i = 1; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, rad = a * Math.PI / 180;
      tl.to(el, { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad), rotation: a + rOff, duration: d, ease: "none" }, tt); tt += d;
    }
    return tt;
  }
  function blink(tl, els, t0, t1) {
    for (let t = t0; t < t1 - 0.01; t += 0.7) { tl.set(els, { opacity: 1 }, t); tl.set(els, { opacity: 0.12 }, t + 0.35); }
    tl.set(els, { opacity: 0 }, t1);
  }
  function lights(tl, el, t0, t1) { tl.to(el, { opacity: 1, duration: 0.25 }, t0); tl.to(el, { opacity: 0, duration: 0.3 }, t1); }
  function pulse(tl, el, t0, t1) {
    for (let t = t0; t < t1 - 1.2; t += 1.2) { tl.to(el, { scale: 1.14, duration: 0.6, ease: "sine.inOut" }, t); tl.to(el, { scale: 1, duration: 0.6, ease: "sine.inOut" }, t + 0.6); }
  }
  window.BK = { P, CARS, BOX, carSVG, makeCar, carBits, roadSVG, sign, badge, pill, arrow, policeSVG, ampelSVG, miniCross, pose, mv, arc, blink, lights, pulse };
})();
