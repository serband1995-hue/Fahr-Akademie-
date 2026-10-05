/* GENERIERT von film/vorfahrt/app-bauen.mjs – nicht von Hand ändern (Quellen: film/vorfahrt/*.js, buehne.css, app.css, sprachen/*.json).
   Erklärfilm „Vorfahrt“ für „Verkehr verstehen“: Animation läuft live (GSAP), nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache, zeichen }) -> { zerstoeren }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ".vf .stagewrap{position:relative;}\n.vf .stage{position:absolute; left:0; top:0; width:1080px; height:1080px; overflow:hidden; background:#E8E0CB; direction:ltr;}\n.vf .stage > *{position:absolute;}\n.vf .road{left:0; top:0;}\n.vf .car{left:0; top:0; width:125px; height:65px; margin:-32.5px 0 0 -62.5px; transform-origin:62.5px 32.5px; filter:drop-shadow(0 7px 7px rgba(43,42,34,.30));}\n.vf .sign{filter:drop-shadow(0 8px 8px rgba(43,42,34,.35));}\n.vf .badge{width:76px; height:76px; margin:-38px 0 0 -38px; border-radius:50%; background:var(--vf-gold,#D9954C); color:#2B2A22; font:700 50px/70px var(--vf-titel,'Playfair Display',serif); text-align:center; box-shadow:0 6px 14px rgba(43,42,34,.30); border:3px solid #FFF8E8;}\n.vf .pill{padding:8px 26px; border-radius:42px; background:#FAF6EC; color:#2F4A34; border:3px solid var(--vf-gold,#D9954C); font:700 46px/1.15 var(--vf-text,'Barlow',sans-serif); text-align:center; max-width:420px; box-shadow:0 5px 12px rgba(43,42,34,.25);}\n.vf .arrow{filter:drop-shadow(0 4px 5px rgba(43,42,34,.3));}\n.vf .tier{left:0; width:1080px; height:200px;}\n.vf .tier .shape{left:0; top:0; width:1080px; height:200px; position:absolute;}\n.vf .tier .ct{position:absolute; left:0; top:0; width:1080px; height:200px; display:flex; align-items:center; justify-content:center; gap:30px;}\n.vf .tier .nm{font:700 58px/1.05 var(--vf-titel,'Playfair Display',serif); text-align:center;}\n.vf .tier .signs{display:flex; gap:16px;}\n.vf .tier .signs img{width:104px; height:104px; filter:drop-shadow(0 5px 5px rgba(0,0,0,.30));}\n.vf .bigcard{left:60px; top:400px; width:960px; padding:44px 54px; background:#2F4A34; color:#FAF6EC; border-left:14px solid var(--vf-gold,#D9954C); border-radius:8px 22px 22px 8px; font:600 60px/1.2 var(--vf-titel,'Playfair Display',serif); box-shadow:0 14px 30px rgba(43,42,34,.3);}\n.vf .zonepill{left:60px; bottom:60px; padding:10px 28px; border-radius:999px; background:#FAF6EC; border:6px solid #C0392B; font:700 56px/1.1 var(--vf-text,'Barlow',sans-serif); color:#2B2A22; box-shadow:0 6px 14px rgba(43,42,34,.3);}\n.vf-rtl .pill,.vf-rtl .tier .nm,.vf-rtl .bigcard{direction:rtl;}\n.vf .panel .kicker{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#8F5A14;}\n.vf .panel .ttl{font-family:var(--vf-titel,'Playfair Display',serif); font-weight:700; color:#2F4A34;}\n.vf .panel .sub{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#6F6857; opacity:0;}\n.vf .pts{display:grid;}\n.vf .pts > *{grid-area:1 / 1; align-self:start; opacity:0;}\n.vf .pt .tx{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; color:#2B2A22;}\n.vf .pt.gold .tx{color:#8F5A14;}\n.vf .pt .rf,.vf .step .rf{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#6F6857;}\n.vf .step .nr{font-family:var(--vf-titel,'Playfair Display',serif); font-weight:700; color:#D9954C; line-height:1;}\n.vf .step .nm{font-family:var(--vf-titel,'Playfair Display',serif); font-weight:700; color:#2F4A34;}\n.vf .step .tx{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; color:#2B2A22;}\n.vf .step .px{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#6F6857;}\n.vf .merk{background:#2F4A34; color:#FAF6EC; border-left:12px solid #D9954C; border-radius:6px 18px 18px 6px; font-family:var(--vf-titel,'Playfair Display',serif); font-weight:600; box-shadow:0 10px 24px rgba(43,42,34,.25);}\n\n/* Erklärfilm „Vorfahrt“ in der App: Bild oben, Text darunter, Steuerung darunter (keine Knöpfe auf dem Bild).\n   Handy zuerst (360–412 px). Ab ~660 px Breite (Querformat/Tablet) steht der Text neben dem Bild. */\n.vf { --vf-titel:var(--ff-titel,'Playfair Display',Georgia,serif); --vf-text:var(--ff-body,'Barlow',sans-serif); --vf-gold:var(--gold,#D9954C); margin:var(--sp-m,12px) 0 var(--sp-l,18px); }\n.vf-kopf { font-family:var(--vf-titel); font-weight:600; font-size:19px; margin:0 0 4px; }\n.vf-intro { color:var(--muted,#6F6857); font-size:14.5px; line-height:1.45; margin:0 0 10px; }\n.vf-kasten { background:var(--surface,#EEE6D3); border:1px solid var(--border,rgba(43,40,30,.16)); border-radius:var(--r-l,16px); padding:10px; overflow:hidden; }\n.vf-szenen { display:grid; position:relative; }\n.vf-szenen .scene { grid-area:1 / 1; display:flex; flex-direction:column; gap:12px; min-width:0; pointer-events:none; direction:ltr; }\n.vf-szenen .stagewrap { width:100%; aspect-ratio:1 / 1; border-radius:var(--r-m,12px); overflow:hidden; flex:none; background:#E8E0CB; }\n.vf-szenen .stage { transform-origin:0 0; transform:scale(var(--vf-s,.3)); }\n.vf-szenen .panel { min-width:0; padding:2px 4px 4px; }\n.vf-szenen .dots, .vf-szenen .foot { display:none; }\n.vf-szenen .kicker { font-size:12.5px; line-height:1.3; letter-spacing:.12em; }\n.vf-szenen .ttl { font-size:24px; line-height:1.15; margin:4px 0 0; }\n.vf-szenen .sub { font-size:16px; line-height:1.4; margin-top:8px; }\n.vf-szenen .pts { margin-top:12px; }\n.vf-szenen .pt .tx { font-size:18px; line-height:1.42; }\n.vf-szenen .pt .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.vf-szenen .step .nr { font-size:36px; }\n.vf-szenen .step .nm { font-size:22px; line-height:1.2; margin-top:2px; }\n.vf-szenen .step .tx { font-size:17px; line-height:1.42; margin-top:8px; }\n.vf-szenen .step .px { font-size:15px; line-height:1.4; margin-top:8px; }\n.vf-szenen .step .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.vf-szenen .merk { padding:14px 16px; font-size:20px; line-height:1.3; border-left-width:8px; }\n.vf-breit .vf-szenen .scene { flex-direction:row; align-items:flex-start; gap:20px; }\n.vf-breit .vf-szenen .stagewrap { flex:0 0 46%; }\n.vf-breit .vf-szenen .panel { flex:1; }\n.vf-rtl .vf-szenen .panel, .vf-rtl .vf-text, .vf-rtl .vf-intro, .vf-rtl .vf-kopf { direction:rtl; text-align:right; }\n.vf-steuer { display:flex; flex-direction:column; gap:10px; margin-top:12px; }\n.vf-reihe { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }\n.vf-knopf { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:600 15px/1.2 var(--vf-text); display:inline-flex; align-items:center; gap:8px; cursor:pointer; }\n.vf-knopf svg { width:18px; height:18px; flex:none; fill:currentColor; }\n.vf-play { background:var(--vf-gold); color:var(--auf-gold,#2B2A22); border-color:transparent; }\n.vf-zeit { margin-inline-start:auto; font-size:13px; color:var(--muted,#6F6857); font-variant-numeric:tabular-nums; direction:ltr; }\n.vf-regler { width:100%; height:28px; margin:0; accent-color:var(--gold-text,#8F5A14); direction:ltr; }\n.vf-kapitel { display:flex; gap:8px; direction:ltr; }\n.vf-kap { flex:1; min-width:44px; min-height:44px; border-radius:12px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:700 15px/1 var(--vf-text); cursor:pointer; }\n.vf-kap[aria-current=\"true\"] { background:var(--gruen,#2F4A34); color:var(--auf-tief,#fff); border-color:transparent; }\n.vf-knopf:focus-visible, .vf-kap:focus-visible, .vf-regler:focus-visible, .vf-text summary:focus-visible { outline:3px solid var(--gold-text,#8F5A14); outline-offset:2px; }\n.vf-text { margin-top:12px; font-size:15px; line-height:1.5; }\n.vf-text summary { min-height:44px; display:flex; align-items:center; cursor:pointer; font-weight:600; }\n.vf-text h3 { font-family:var(--vf-titel); font-size:16px; margin:14px 0 4px; }\n.vf-text p { margin:0 0 6px; }\n.vf-text .vf-ref { color:var(--muted,#6F6857); font-size:13px; }\n@media (prefers-reduced-motion: reduce) { .vf-szenen .stage { transition:none; } }\n";
// ---- baukasten.js ----
(function (window) {
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
    d.innerHTML = `<img src="${BK.zeichenBase}${file}" alt="" width="${size}" height="${size}">`;
    parent.appendChild(d); return d;
  }
  function badge(parent, txt, x, y, cls) {
    const d = document.createElement("div");
    d.className = "badge " + (cls || ""); d.textContent = txt;
    d.style.cssText = `left:${x}px;top:${y}px`; parent.appendChild(d); return d;
  }
  /* anchor: "m" (Mitte, Standard), "l" (linke Kante bei x), "r" (rechte Kante bei x): so wächst ein langer Text weg vom Pfeil */
  function pill(parent, txt, x, y, rot, anchor) {
    const d = document.createElement("div");
    d.className = "pill"; d.textContent = txt;
    const tr = anchor === "l" ? "translate(0,-50%)" : anchor === "r" ? "translate(-100%,-50%)" : "translate(-50%,-50%)";
    d.style.cssText = `left:${x}px;top:${y}px;transform:${tr} rotate(${rot || 0}deg);transform-origin:${anchor === "l" ? "0 50%" : anchor === "r" ? "100% 50%" : "50% 50%"}`; parent.appendChild(d); return d;
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
  /* Schrift in der Bühne an die Breite anpassen (lange Wörter in anderen Sprachen). Erst verkleinern, dann umbrechen. */
  function fit(el, maxW, startPx, minPx) {
    el.style.fontSize = startPx + "px";
    let px = startPx;
    while (px > minPx && el.scrollWidth > maxW) { px -= 2; el.style.fontSize = px + "px"; }
  }
  const BK = { P, CARS, BOX, carSVG, makeCar, carBits, roadSVG, sign, badge, pill, arrow, policeSVG, ampelSVG, miniCross, pose, mv, arc, blink, lights, pulse, fit, zeichenBase: "assets/zeichen/" };
  window.BK = BK;
})();

})(W);

// ---- text.js ----
(function (window) {
/* Eine Quelle für allen Text im Film (Deutsch) samt Zeiten. KEINE Stimme: alles steht als Text im Bild.
   Fachgrundlage: StVO, geprüft am 05.10.2026 gegen gesetze-im-internet.de (stvo_2013):
   § 8 Abs. 1, 1a, 2 · § 9 Abs. 1, 3, 4 · § 10 · § 36 Abs. 1, 2 · § 37 Abs. 1, 2 · § 45 Abs. 1c.

   Aufbau
   - de:       alle Sätze mit Schlüssel (diese Texte werden in die 17 anderen Sprachen übersetzt, Schlüssel bleiben gleich)
   - kapitel:  Reihenfolge, Zeiten (t = Sekunden ab Kapitelanfang), Verweise auf Schlüssel
   - Paragrafen-Verweise ("ref") sind Zitate und werden NICHT übersetzt.

   Zeiten (Lesezeit): Jeder Satz bleibt mindestens 2,0 s + 0,5 s je Wort stehen (Deutsch). Das gibt Luft für die
   längste Sprache; geprüft wird das mit `node pruefe-lesezeit.mjs` (Zeichen pro Sekunde je Sprache).
   Stehen die Autos still (warten), ist das Absicht: Der Satz darf in Ruhe gelesen werden. */
window.FILM_TEXT = {
  de: {
    titel: "Vorfahrt – wer fährt zuerst?",
    ui_ueber: "Überblick: Vorfahrt in 5 Minuten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten",
    ui_pause: "Anhalten",
    ui_weiter: "Weiter",
    ui_neu: "Von vorn",
    ui_kapitel: "Kapitel",
    ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage",
    k1_titel: "Wer fährt zuerst?",
    k1_sub: "Eine Kreuzung. Keine Ampel, keine Schilder, kein Polizist.",
    k1_p1: "Drei Autos kommen gleichzeitig an. Alle wollen geradeaus.",
    k1_p2: "Wer darf zuerst fahren?",
    k1_p3: "Die Antwort kommt am Ende. Dafür brauchst du eine Idee: die Vorfahrtspyramide.",

    k2_kicker: "Die Ordnung",
    k2_titel: "Die Vorfahrtspyramide",
    k2_intro: "Es gibt eine feste Reihenfolge. Was höher steht, geht vor.",
    k2_vorrang: "Vorrang",
    s1_name: "Polizei",
    s1_text: "Zeichen und Weisungen der Polizei gehen allen anderen Regeln, Ampeln und Schildern vor.",
    s1_plus: "Auch dann musst du selbst aufpassen.",
    s2_name: "Ampel",
    s2_text: "Lichtzeichen gehen Vorfahrtschildern und rechts vor links vor.",
    s2_plus: "Auch bei Grün musst du aufpassen.",
    s3_name: "Schilder",
    s3_text: "Vorfahrt gewähren, Halt, Vorfahrtstraße: Wo diese Schilder stehen, gilt rechts vor links nicht.",
    s3_plus: "Du erkennst sie an der Form: Dreieck, Achteck, Raute.",
    s4_name: "Rechts vor links",
    s4_text: "Gibt es nichts Höheres: Wer von rechts kommt, hat Vorfahrt.",
    s4_plus: "Das gilt an Kreuzungen und Einmündungen – es ist die Grundlage.",
    k2_merk: "Was höher steht, gewinnt.",

    k3_kicker: "Die Grundregel",
    k3_titel: "Rechts vor links",
    k3_pill: "von rechts",
    k3_p1: "Wer von rechts kommt, hat Vorfahrt – an Kreuzungen und Einmündungen ohne Schilder und Ampel.",
    k3_p2: "Wer warten muss, wird früh langsamer. So sieht jeder: Ich warte.",
    k3_p3: "Das Auto von rechts hat Vorfahrt. Das andere Auto wartet.",
    k3_p4: "Du fährst erst weiter, wenn du den anderen weder gefährdest noch wesentlich behinderst.",
    k3_p5: "Aus der Gegenrichtung gilt dasselbe: Auch dort hat Vorfahrt, wer von rechts kommt.",
    k3_p6: "Typischer Fehler: nicht nach rechts schauen oder einfach vordrängeln.",
    k3_merk: "Rechts vor links gilt nur, wenn nichts Höheres etwas anderes sagt.",

    k4_kicker: "Gegenverkehr",
    k4_titel: "Links abbiegen",
    k4_pill: "voreinander",
    k4_p1: "Rechtzeitig blinken, zur Mitte einordnen, nach hinten schauen.",
    k4_p2: "Dann wartest du: Der Gegenverkehr geht vor.",
    k4_p3: "Gegenverkehr, der geradeaus fährt: durchlassen.",
    k4_p4: "Auch Gegenverkehr, der rechts abbiegt: durchlassen.",
    k4_p5: "Erst wenn du niemanden behinderst oder gefährdest, biegst du ab.",
    k4_p6: "Zwei Linksabbieger von gegenüber biegen in der Regel voreinander ab.",
    k4_p7: "Nur wenn Verkehrslage oder Kreuzung es verlangen, biegen sie hintereinander ab.",
    k4_merk: "Linksabbieger lassen den Gegenverkehr durch.",

    k5_kicker: "Tempo 30",
    k5_titel: "Die 30er-Zone",
    k5_p1: "Schild 274.1: Hier beginnt die Tempo-30-Zone. Du darfst höchstens 30 km/h fahren.",
    k5_p2: "In der Zone gilt an Kreuzungen grundsätzlich rechts vor links – meistens ohne Vorfahrtschilder.",
    k5_p3: "Parkende Autos nehmen dir die Sicht? Taste dich langsam hinein, bis du alles übersehen kannst.",
    k5_p4: "Fahre langsam und sei bremsbereit – auch wenn du Vorfahrt hast.",
    k5_merk: "Wer von rechts kommt, hat Vorfahrt.",

    k6_kicker: "Zum Schluss",
    k6_titel: "Zurück zur Frage",
    k6_a1: "Das Auto rechts im Bild fährt zuerst: Von seiner rechten Seite kommt niemand.",
    k6_a2: "Dann das Auto unten: Das Auto von rechts ist weg.",
    k6_a3: "Zuletzt das Auto links: Auch hier ist das Auto von rechts weg.",
    k6_merk: "Was höher steht, gewinnt. Gibt es nichts Höheres: rechts vor links.",
    k6_b1: "Eigene Regeln haben: Kreisverkehr, Grundstücksausfahrt, Feld- und Waldweg.",
    k6_b2: "Gibt es Polizei, Ampel oder Schilder, entscheiden zuerst sie – nicht rechts vor links.",
    k6_b3: "Jetzt üben: Die 3D-Szenen in der Fahr-Akademie zeigen es aus jedem Blickwinkel."
  },

  kapitel: [
    { id: "k1", dauer: 29, kicker: "k1_kicker", titel: "k1_titel", sub: { t: 2.4, k: "k1_sub" },
      punkte: [
        { t: 9.0, k: "k1_p1" },
        { t: 15.5, k: "k1_p2" },
        { t: 20.0, k: "k1_p3", stil: "gold" }
      ] },
    { id: "k2", dauer: 73, kicker: "k2_kicker", titel: "k2_titel", intro: { t: 0.6, k: "k2_intro" }, vorrang: "k2_vorrang",
      stufen: [
        { t: 7.0, nr: "1", name: "s1_name", text: "s1_text", plus: "s1_plus", ref: "§ 36 Abs. 1 StVO" },
        { t: 21.0, nr: "2", name: "s2_name", text: "s2_text", plus: "s2_plus", ref: "§ 37 Abs. 1, 2 StVO" },
        { t: 35.0, nr: "3", name: "s3_name", text: "s3_text", plus: "s3_plus", ref: "§ 8 Abs. 1 StVO · Z. 205 · 206 · 306" },
        { t: 49.0, nr: "4", name: "s4_name", text: "s4_text", plus: "s4_plus", ref: "§ 8 Abs. 1 Satz 1 StVO" }
      ],
      merk: { t: 63.0, k: "k2_merk" } },
    { id: "k3", dauer: 60, kicker: "k3_kicker", titel: "k3_titel", pill: "k3_pill",
      punkte: [
        { t: 1.0, k: "k3_p1", ref: "§ 8 Abs. 1 StVO" },
        { t: 10.5, k: "k3_p2", ref: "§ 8 Abs. 2 StVO" },
        { t: 18.5, k: "k3_p3" },
        { t: 25.5, k: "k3_p4", ref: "§ 8 Abs. 2 StVO" },
        { t: 34.5, k: "k3_p5" },
        { t: 43.0, k: "k3_p6" }
      ],
      merk: { t: 51.5, k: "k3_merk" } },
    { id: "k4", dauer: 55, kicker: "k4_kicker", titel: "k4_titel", pill: "k4_pill",
      punkte: [
        { t: 1.0, k: "k4_p1", ref: "§ 9 Abs. 1 StVO" },
        { t: 8.0, k: "k4_p2" },
        { t: 13.5, k: "k4_p3", ref: "§ 9 Abs. 3 StVO" },
        { t: 19.0, k: "k4_p4", ref: "§ 9 Abs. 4 StVO" },
        { t: 25.0, k: "k4_p5" },
        { t: 32.5, k: "k4_p6", ref: "§ 9 Abs. 4 StVO" },
        { t: 39.5, k: "k4_p7", ref: "§ 9 Abs. 4 StVO" }
      ],
      merk: { t: 47.5, k: "k4_merk" } },
    { id: "k5", dauer: 42, kicker: "k5_kicker", titel: "k5_titel",
      punkte: [
        { t: 1.5, k: "k5_p1", ref: "Z. 274.1 StVO" },
        { t: 10.5, k: "k5_p2", ref: "§ 8 Abs. 1 · § 45 Abs. 1c StVO" },
        { t: 19.5, k: "k5_p3", ref: "§ 8 Abs. 2 StVO" },
        { t: 29.0, k: "k5_p4" }
      ],
      merk: { t: 35.0, k: "k5_merk" } },
    { id: "k6", dauer: 60, kicker: "k6_kicker", titel: "k6_titel",
      punkte: [
        { t: 1.5, k: "k6_a1" },
        { t: 10.5, k: "k6_a2" },
        { t: 18.5, k: "k6_a3" },
        { t: 35.5, k: "k6_b1", ref: "§ 8 Abs. 1 Nr. 2, Abs. 1a · § 10 StVO" },
        { t: 42.0, k: "k6_b2" },
        { t: 51.0, k: "k6_b3", stil: "gold" }
      ],
      merk: { t: 26.0, k: "k6_merk" } }
  ]
};

})(W);

W.FILM_SPRACHEN = {};
// ---- szenen.js ----
(function (window) {
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

})(W);

// ---- app-host.js ----
/* App-Teil des Erklärfilms „Vorfahrt“ (wird von app-bauen.mjs mit den anderen Quellen zu verkehr/vorfahrt-film.js gebündelt).
   starte(platz, { sprache, zeichen }) -> { zerstoeren }
     sprache  Sprachcode der App (de, tr, en, ar, …); fehlt ein Satz in der Sprache, erscheint Deutsch
     zeichen  Pfad zum Ordner mit den Verkehrszeichen (SVG)
   Voraussetzung: GSAP ist als window.gsap geladen (vendor/gsap-3.14.2.min.js). */
const RTL_SPRACHEN = ["ar", "ckb", "ur", "fa", "ps"];
const SVG = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  neu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z"/></svg>'
};

export function starte(platz, opt) {
  opt = opt || {};
  const lang = opt.sprache || "de";
  const T = W.FILM_TEXT, DE = T.de, FREMD = (W.FILM_SPRACHEN || {})[lang] || {};
  const tx = (k) => FREMD[k] || DE[k] || k;
  const rtl = RTL_SPRACHEN.indexOf(lang) >= 0;
  W.BK.zeichenBase = opt.zeichen || "verkehr/vorfahrt-zeichen/";
  if (!document.getElementById("vf-css")) { const s = document.createElement("style"); s.id = "vf-css"; s.textContent = CSS; document.head.appendChild(s); }
  const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };

  const wurzel = el("section", "vf" + (rtl ? " vf-rtl" : "")); wurzel.lang = lang;
  wurzel.setAttribute("aria-label", tx("titel"));
  wurzel.appendChild(el("h2", "vf-kopf", tx("ui_ueber")));
  wurzel.appendChild(el("p", "vf-intro", tx("ui_intro")));
  const kasten = el("div", "vf-kasten"), szenenBox = el("div", "vf-szenen");
  szenenBox.setAttribute("aria-hidden", "true");   // der Film ist Bild; den Text liest man unten (Liste) oder im Bild
  const scenes = T.kapitel.map(() => { const s = el("section", "scene"); szenenBox.appendChild(s); return s; });
  kasten.appendChild(szenenBox);

  // Steuerung (unter dem Bild, nie auf dem Bild)
  const steuer = el("div", "vf-steuer"), reihe = el("div", "vf-reihe");
  const playKnopf = el("button", "vf-knopf vf-play"); playKnopf.type = "button";
  const neuKnopf = el("button", "vf-knopf"); neuKnopf.type = "button"; neuKnopf.innerHTML = SVG.neu + "<span></span>"; neuKnopf.lastChild.textContent = tx("ui_neu");
  const zeitEl = el("span", "vf-zeit");
  reihe.appendChild(playKnopf); reihe.appendChild(neuKnopf); reihe.appendChild(zeitEl);
  const regler = el("input", "vf-regler"); regler.type = "range"; regler.min = 0; regler.step = 1; regler.value = 0;
  regler.setAttribute("aria-label", tx("titel"));
  const kapZeile = el("div", "vf-kapitel"); kapZeile.setAttribute("role", "group"); kapZeile.setAttribute("aria-label", tx("ui_kapitel"));
  const kapKnoepfe = T.kapitel.map((ch, i) => { const b = el("button", "vf-kap", String(i + 1)); b.type = "button"; b.setAttribute("aria-label", tx("ui_kapitel") + " " + (i + 1) + ": " + tx(ch.titel)); kapZeile.appendChild(b); return b; });
  steuer.appendChild(reihe); steuer.appendChild(regler); steuer.appendChild(kapZeile);
  kasten.appendChild(steuer);
  wurzel.appendChild(kasten);

  // Gesamter Text als Liste (Lesen im eigenen Tempo, Bildschirmleser, Übersetzungskontrolle)
  const det = el("details", "vf-text"), sum = el("summary", "", tx("ui_lesen")); det.appendChild(sum);
  T.kapitel.forEach((ch) => {
    det.appendChild(el("h3", "", tx(ch.titel)));
    const zeilen = [];
    if (ch.sub) zeilen.push([ch.sub.k]);
    if (ch.intro) zeilen.push([ch.intro.k]);
    (ch.stufen || []).forEach((s) => { zeilen.push([s.name]); zeilen.push([s.text, s.ref]); zeilen.push([s.plus]); });
    (ch.punkte || []).forEach((p) => zeilen.push([p.k, p.ref]));
    if (ch.merk) zeilen.push([ch.merk.k]);
    zeilen.forEach((z) => { const p = el("p", "", tx(z[0])); if (z[1]) p.appendChild(el("span", "vf-ref", " (" + z[1] + ")")); det.appendChild(p); });
  });
  wurzel.appendChild(det);
  platz.appendChild(wurzel);

  // Zeitleiste
  const tl = gsap.timeline({ paused: true });
  const r = W.VFSzenen.bauen({ tl: tl, T: T, tx: tx, scenes: scenes });
  const gesamt = r.gesamt, POSTER = r.starts[0] + T.kapitel[0].punkte[0].t + 3;   // Standbild: Frage mit den Fragezeichen
  regler.max = Math.round(gesamt * 10);
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  let begonnen = false;
  function knopfText() {
    const spielt = !tl.paused() && tl.progress() < 1;
    const txt = spielt ? tx("ui_pause") : (begonnen && tl.progress() < 1 ? tx("ui_weiter") : tx("ui_start"));
    playKnopf.innerHTML = (spielt ? SVG.pause : SVG.play) + "<span></span>"; playKnopf.lastChild.textContent = txt;
  }
  function anzeigen() {
    const t = tl.time();
    zeitEl.textContent = mmss(t) + " / " + mmss(gesamt);
    regler.value = Math.round(t * 10);
    let k = 0; r.starts.forEach((s, i) => { if (t >= s - 0.01) k = i; });
    kapKnoepfe.forEach((b, i) => { if (i === k) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  tl.eventCallback("onUpdate", anzeigen);
  tl.eventCallback("onComplete", knopfText);
  tl.time(POSTER); tl.pause();
  if (opt.zustand) {                       // Seite wurde neu gezeichnet: dort weitermachen, wo der Film war
    begonnen = !!opt.zustand.begonnen; tl.time(opt.zustand.zeit || POSTER);
    if (opt.zustand.spielt) tl.play();
  }
  anzeigen(); knopfText();

  playKnopf.addEventListener("click", () => {
    if (!tl.paused() && tl.progress() < 1) { tl.pause(); }
    else if (!begonnen || tl.progress() >= 1) { begonnen = true; tl.restart(); }   // erster Start und Wiederholung: von vorn
    else tl.play();
    knopfText();
  });
  neuKnopf.addEventListener("click", () => { begonnen = true; tl.restart(); knopfText(); });
  regler.addEventListener("input", () => { tl.pause(); begonnen = true; tl.time(Number(regler.value) / 10); anzeigen(); knopfText(); });
  kapKnoepfe.forEach((b, i) => b.addEventListener("click", () => { begonnen = true; tl.time(r.starts[i] + 0.9); tl.play(); anzeigen(); knopfText(); }));

  // Bühne auf die Breite des Containers skalieren; ab ~660 px Text neben das Bild
  function groesse() {
    wurzel.classList.toggle("vf-breit", kasten.clientWidth >= 660);
    const w = scenes[0].querySelector(".stagewrap");
    if (w && w.clientWidth) szenenBox.style.setProperty("--vf-s", String(w.clientWidth / 1080));
  }
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(groesse) : null;
  if (ro) ro.observe(kasten); else window.addEventListener("resize", groesse);
  groesse();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { r.refit(); groesse(); });
  // Außerhalb des Bildschirms anhalten (kostet sonst Akku)
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((e) => { if (e[0] && !e[0].isIntersecting && !tl.paused()) { tl.pause(); knopfText(); } }, { threshold: 0.05 }) : null;
  if (io) io.observe(wurzel);

  return {
    zerstoeren: function () {
      tl.kill(); if (ro) ro.disconnect(); else window.removeEventListener("resize", groesse); if (io) io.disconnect();
      if (wurzel.parentNode) wurzel.parentNode.removeChild(wurzel);
    },
    zustand: function () { return { zeit: tl.time(), spielt: !tl.paused() && tl.progress() < 1, begonnen: begonnen }; },
    zeitleiste: tl, gesamt: gesamt
  };
}
