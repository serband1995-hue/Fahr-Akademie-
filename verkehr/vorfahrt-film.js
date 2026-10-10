/* GENERIERT von film/vorfahrt/app-bauen.mjs – nicht von Hand ändern (Quellen: film/vorfahrt/*.js, buehne.css, app.css, sprachen/*.json).
   Erklärfilm „Vorfahrt“ für „Verkehr verstehen“: Animation läuft live (GSAP), nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache, zeichen }) -> { zerstoeren }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ".vf .stagewrap{position:relative;}\n.vf .stage{position:absolute; left:0; top:0; width:1080px; height:1080px; overflow:hidden; background:#E3E9E2; direction:ltr;}\n.vf .stage > *{position:absolute;}\n.vf .road{left:0; top:0;}\n.vf .car{left:0; top:0; width:125px; height:65px; margin:-32.5px 0 0 -62.5px; transform-origin:62.5px 32.5px; filter:drop-shadow(0 7px 7px rgba(43,42,34,.30));}\n.vf .sign{filter:drop-shadow(0 8px 8px rgba(43,42,34,.35));}\n.vf .badge{width:76px; height:76px; margin:-38px 0 0 -38px; border-radius:50%; background:var(--vf-gold,#E8A33D); color:#1E241F; font:700 50px/70px var(--vf-titel,'Barlow',serif); text-align:center; box-shadow:0 6px 14px rgba(43,42,34,.30); border:3px solid #FAFBF7;}\n.vf .pill{padding:8px 26px; border-radius:42px; background:#F5F6F3; color:#1F5A41; border:3px solid var(--vf-gold,#E8A33D); font:700 46px/1.15 var(--vf-text,'Barlow',sans-serif); text-align:center; max-width:420px; box-shadow:0 5px 12px rgba(43,42,34,.25);}\n.vf .arrow{filter:drop-shadow(0 4px 5px rgba(43,42,34,.3));}\n.vf .tier{left:0; width:1080px; height:200px;}\n.vf .tier .shape{left:0; top:0; width:1080px; height:200px; position:absolute;}\n.vf .tier .ct{position:absolute; left:0; top:0; width:1080px; height:200px; display:flex; align-items:center; justify-content:center; gap:30px;}\n.vf .tier .nm{font:700 58px/1.05 var(--vf-titel,'Barlow',serif); text-align:center;}\n.vf .tier .signs{display:flex; gap:16px;}\n.vf .tier .signs img{width:104px; height:104px; filter:drop-shadow(0 5px 5px rgba(0,0,0,.30));}\n.vf .bigcard{left:60px; top:400px; width:960px; padding:44px 54px; background:#1F5A41; color:#F5F6F3; border-left:14px solid var(--vf-gold,#E8A33D); border-radius:8px 22px 22px 8px; font:600 60px/1.2 var(--vf-titel,'Barlow',serif); box-shadow:0 14px 30px rgba(43,42,34,.3);}\n.vf .zonepill{left:60px; bottom:60px; padding:10px 28px; border-radius:999px; background:#F5F6F3; border:6px solid #C0392B; font:700 56px/1.1 var(--vf-text,'Barlow',sans-serif); color:#1E241F; box-shadow:0 6px 14px rgba(43,42,34,.3);}\n.vf-rtl .pill,.vf-rtl .tier .nm,.vf-rtl .bigcard{direction:rtl;}\n.vf .panel .kicker{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#845408;}\n.vf .panel .ttl{font-family:var(--vf-titel,'Barlow',serif); font-weight:700; color:#1F5A41;}\n.vf .panel .sub{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#58625B; opacity:0;}\n.vf .pts{display:grid;}\n.vf .pts > *{grid-area:1 / 1; align-self:start; opacity:0;}\n.vf .pt .tx{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; color:#1E241F;}\n.vf .pt.gold .tx{color:#845408;}\n.vf .pt .rf,.vf .step .rf{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#58625B;}\n.vf .step .nr{font-family:var(--vf-titel,'Barlow',serif); font-weight:700; color:#E8A33D; line-height:1;}\n.vf .step .nm{font-family:var(--vf-titel,'Barlow',serif); font-weight:700; color:#1F5A41;}\n.vf .step .tx{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:600; color:#1E241F;}\n.vf .step .px{font-family:var(--vf-text,'Barlow',sans-serif); font-weight:500; color:#58625B;}\n.vf .merk{background:#1F5A41; color:#F5F6F3; border-left:12px solid #E8A33D; border-radius:6px 18px 18px 6px; font-family:var(--vf-titel,'Barlow',serif); font-weight:600; box-shadow:0 10px 24px rgba(43,42,34,.25);}\n\n/* Erklärfilm „Vorfahrt“ in der App: Bild oben, Text darunter, Steuerung darunter (keine Knöpfe auf dem Bild).\n   Handy zuerst (360–412 px). Ab ~660 px Breite (Querformat/Tablet) steht der Text neben dem Bild. */\n.vf { --vf-titel:var(--ff-titel,'Barlow',Georgia,serif); --vf-text:var(--ff-body,'Barlow',sans-serif); --vf-gold:var(--gold,#E8A33D); margin:var(--sp-m,12px) 0 var(--sp-l,18px); }\n.vf-kopf { font-family:var(--vf-titel); font-weight:600; font-size:19px; margin:0 0 4px; }\n.vf-intro { color:var(--muted,#58625B); font-size:14.5px; line-height:1.45; margin:0 0 10px; }\n.vf-kasten { background:var(--surface,#E8ECE7); border:1px solid var(--border,rgba(30,36,31,.16)); border-radius:var(--r-l,16px); padding:10px; overflow:hidden; }\n.vf-szenen { display:grid; position:relative; }\n.vf-szenen .scene { grid-area:1 / 1; display:flex; flex-direction:column; gap:12px; min-width:0; pointer-events:none; direction:ltr; }\n.vf-szenen .stagewrap { width:100%; aspect-ratio:1 / 1; border-radius:var(--r-m,12px); overflow:hidden; flex:none; background:#E3E9E2; }\n.vf-szenen .stage { transform-origin:0 0; transform:scale(var(--vf-s,.3)); }\n.vf-szenen .panel { min-width:0; padding:2px 4px 4px; }\n.vf-szenen .dots, .vf-szenen .foot { display:none; }\n.vf-szenen .kicker { font-size:12.5px; line-height:1.3; letter-spacing:.12em; }\n.vf-szenen .ttl { font-size:24px; line-height:1.15; margin:4px 0 0; }\n.vf-szenen .sub { font-size:16px; line-height:1.4; margin-top:8px; }\n.vf-szenen .pts { margin-top:12px; }\n.vf-szenen .pt .tx { font-size:18px; line-height:1.42; }\n.vf-szenen .pt .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.vf-szenen .step .nr { font-size:36px; }\n.vf-szenen .step .nm { font-size:22px; line-height:1.2; margin-top:2px; }\n.vf-szenen .step .tx { font-size:17px; line-height:1.42; margin-top:8px; }\n.vf-szenen .step .px { font-size:15px; line-height:1.4; margin-top:8px; }\n.vf-szenen .step .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.vf-szenen .merk { padding:14px 16px; font-size:20px; line-height:1.3; border-left-width:8px; }\n.vf-breit .vf-szenen .scene { flex-direction:row; align-items:flex-start; gap:20px; }\n.vf-breit .vf-szenen .stagewrap { flex:0 0 46%; }\n.vf-breit .vf-szenen .panel { flex:1; }\n.vf-rtl .vf-szenen .panel, .vf-rtl .vf-text, .vf-rtl .vf-intro, .vf-rtl .vf-kopf { direction:rtl; text-align:right; }\n.vf-steuer { display:flex; flex-direction:column; gap:10px; margin-top:12px; }\n.vf-reihe { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }\n.vf-knopf { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid var(--border,rgba(30,36,31,.16)); background:var(--bg,#F5F6F3); color:var(--text,#1E241F); font:600 15px/1.2 var(--vf-text); display:inline-flex; align-items:center; gap:8px; cursor:pointer; }\n.vf-knopf svg { width:18px; height:18px; flex:none; fill:currentColor; }\n.vf-play { background:var(--vf-gold); color:var(--auf-gold,#1E241F); border-color:transparent; }\n.vf-zeit { margin-inline-start:auto; font-size:13px; color:var(--muted,#58625B); font-variant-numeric:tabular-nums; direction:ltr; }\n.vf-regler { width:100%; height:28px; margin:0; accent-color:var(--gold-text,#845408); direction:ltr; }\n.vf-kapitel { display:flex; gap:8px; direction:ltr; }\n.vf-kap { flex:1; min-width:44px; min-height:44px; border-radius:12px; border:1px solid var(--border,rgba(30,36,31,.16)); background:var(--bg,#F5F6F3); color:var(--text,#1E241F); font:700 15px/1 var(--vf-text); cursor:pointer; }\n.vf-kap[aria-current=\"true\"] { background:var(--gruen,#1F5A41); color:var(--auf-tief,#fff); border-color:transparent; }\n.vf-knopf:focus-visible, .vf-kap:focus-visible, .vf-regler:focus-visible, .vf-text summary:focus-visible { outline:3px solid var(--gold-text,#845408); outline-offset:2px; }\n.vf-text { margin-top:12px; font-size:15px; line-height:1.5; }\n.vf-text summary { min-height:44px; display:flex; align-items:center; cursor:pointer; font-weight:600; }\n.vf-text h3 { font-family:var(--vf-titel); font-size:16px; margin:14px 0 4px; }\n.vf-text p { margin:0 0 6px; }\n.vf-text .vf-ref { color:var(--muted,#58625B); font-size:13px; }\n@media (prefers-reduced-motion: reduce) { .vf-szenen .stage { transition:none; } }\n/* Paragrafen-Verweise nie verdrehen (RTL-Sprachen), Regel 8 der Sprachen-Notiz */\n.vf-szenen .rf, .vf-szenen .step .rf, .vf-text .vf-ref { unicode-bidi:plaintext; }\n/* Schriften ohne Playfair-Zeichen (ar, ckb, ur, hi, fa, ps, el, am, ti): Überschriften in Barlow, mehr Zeilenhöhe */\n.vf-barlow { --vf-titel:var(--ff-body,'Barlow',sans-serif); }\n.vf-barlow .ttl, .vf-barlow .nm, .vf-barlow .merk, .vf-barlow .bigcard, .vf-barlow .vf-kopf, .vf-barlow .vf-text h3 { font-weight:700; }\n.vf[lang=\"ur\"] .vf-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .vf[lang=\"ur\"] .vf-text, .vf[lang=\"ur\"] .vf-intro { line-height:1.7; }\n.vf[lang=\"ps\"] .vf-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .vf[lang=\"ps\"] .vf-text, .vf[lang=\"ps\"] .vf-intro { line-height:1.55; }\n";
// ---- baukasten.js ----
(function (window) {
/* Baukasten: Kreuzung, Autos, Schilder, Figuren. Alles deterministisch (kein Zufall, keine Uhr).
   Bühne 1080 x 1080, Kreuzungsmitte (540,540), Straßen 220 breit, Rechtsverkehr.
   Spuren: Ost-fahrend y=595 · West-fahrend y=485 · Nord-fahrend x=595 · Süd-fahrend x=485.
   Drehung (rotation, Grad): Ost 0 · Süd 90 · West 180 · Nord -90 (bzw. 270). */
(function () {
  const P = { ground: "#E3E9E2", walk: "#EEF2EC", b1: "#D3DBD2", b2: "#C7D0C5", road: "#575E55", line: "#F5F6F3", ink: "#1F5A41", green: "#2E7D5B", gold: "#E8A33D", text: "#1E241F" };
  const CARS = {
    ivory: { b: "#F2F4F0", d: "#B3BCB1" }, gold: { b: "#E8A33D", d: "#B87830" },
    green: { b: "#3F9B75", d: "#1F5A41" }, slate: { b: "#5E7C8F", d: "#3E566A" }
  };
  const BOX = { x0: 430, x1: 650, y0: 430, y1: 650 };

  function carSVG(c) {
    return `<svg viewBox="0 0 104 54" width="104" height="54" xmlns="http://www.w3.org/2000/svg">
<rect x="16" y="0" width="16" height="6" rx="2" fill="#1E241F"/><rect x="70" y="0" width="16" height="6" rx="2" fill="#1E241F"/>
<rect x="16" y="48" width="16" height="6" rx="2" fill="#1E241F"/><rect x="70" y="48" width="16" height="6" rx="2" fill="#1E241F"/>
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
      s += `<circle cx="${t[0] + 3}" cy="${t[1] + 5}" r="20" fill="#1E241F" opacity=".12"/><circle cx="${t[0]}" cy="${t[1]}" r="19" fill="#8FA97C"/><circle cx="${t[0] - 5}" cy="${t[1] - 5}" r="9" fill="#A9C093" opacity=".8"/>`;
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
    d.innerHTML = `<svg viewBox="0 0 ${len} 70" width="${len}" height="70"><path d="M6 24 H${len - 46} V6 L${len - 6} 35 L${len - 46} 64 V46 H6 Z" fill="${P.gold}" stroke="#845408" stroke-width="3" stroke-linejoin="round"/></svg>`;
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
<rect x="8" y="4" width="64" height="130" rx="16" fill="#1E241F"/>
<circle cx="40" cy="36" r="17" fill="#E0503B"/><circle cx="40" cy="69" r="17" fill="#6B5B2A"/><circle cx="40" cy="102" r="17" fill="#2F5A3C"/>
<circle cx="35" cy="30" r="5" fill="#fff" opacity=".35"/>
</svg>`;
  }
  function miniCross(size) {
    return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="160" rx="16" fill="${P.ground}"/>
<rect x="0" y="46" width="160" height="68" fill="${P.road}"/><rect x="46" y="0" width="68" height="160" fill="${P.road}"/>
<g transform="translate(24 97)"><rect x="-24" y="-13" width="48" height="26" rx="9" fill="#F2F4F0" stroke="#B3BCB1" stroke-width="2"/><rect x="2" y="-9" width="13" height="18" rx="4" fill="#34464E"/></g>
<g transform="translate(97 128) rotate(-90)"><rect x="-24" y="-13" width="48" height="26" rx="9" fill="${P.gold}" stroke="#B87830" stroke-width="2"/><rect x="2" y="-9" width="13" height="18" rx="4" fill="#34464E"/></g>
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

W.FILM_SPRACHEN = {"_quelle-de":{"titel":"Vorfahrt – wer fährt zuerst?","ui_ueber":"Überblick: Vorfahrt in 5 Minuten","ui_intro":"Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.","ui_start":"Film starten","ui_pause":"Anhalten","ui_weiter":"Weiter","ui_neu":"Von vorn","ui_kapitel":"Kapitel","ui_lesen":"Den ganzen Text lesen","k1_kicker":"Die Frage","k1_titel":"Wer fährt zuerst?","k1_sub":"Eine Kreuzung. Keine Ampel, keine Schilder, kein Polizist.","k1_p1":"Drei Autos kommen gleichzeitig an. Alle wollen geradeaus.","k1_p2":"Wer darf zuerst fahren?","k1_p3":"Die Antwort kommt am Ende. Dafür brauchst du eine Idee: die Vorfahrtspyramide.","k2_kicker":"Die Ordnung","k2_titel":"Die Vorfahrtspyramide","k2_intro":"Es gibt eine feste Reihenfolge. Was höher steht, geht vor.","k2_vorrang":"Vorrang","s1_name":"Polizei","s1_text":"Zeichen und Weisungen der Polizei gehen allen anderen Regeln, Ampeln und Schildern vor.","s1_plus":"Auch dann musst du selbst aufpassen.","s2_name":"Ampel","s2_text":"Lichtzeichen gehen Vorfahrtschildern und rechts vor links vor.","s2_plus":"Auch bei Grün musst du aufpassen.","s3_name":"Schilder","s3_text":"Vorfahrt gewähren, Halt, Vorfahrtstraße: Wo diese Schilder stehen, gilt rechts vor links nicht.","s3_plus":"Du erkennst sie an der Form: Dreieck, Achteck, Raute.","s4_name":"Rechts vor links","s4_text":"Gibt es nichts Höheres: Wer von rechts kommt, hat Vorfahrt.","s4_plus":"Das gilt an Kreuzungen und Einmündungen – es ist die Grundlage.","k2_merk":"Was höher steht, gewinnt.","k3_kicker":"Die Grundregel","k3_titel":"Rechts vor links","k3_pill":"von rechts","k3_p1":"Wer von rechts kommt, hat Vorfahrt – an Kreuzungen und Einmündungen ohne Schilder und Ampel.","k3_p2":"Wer warten muss, wird früh langsamer. So sieht jeder: Ich warte.","k3_p3":"Das Auto von rechts hat Vorfahrt. Das andere Auto wartet.","k3_p4":"Du fährst erst weiter, wenn du den anderen weder gefährdest noch wesentlich behinderst.","k3_p5":"Aus der Gegenrichtung gilt dasselbe: Auch dort hat Vorfahrt, wer von rechts kommt.","k3_p6":"Typischer Fehler: nicht nach rechts schauen oder einfach vordrängeln.","k3_merk":"Rechts vor links gilt nur, wenn nichts Höheres etwas anderes sagt.","k4_kicker":"Gegenverkehr","k4_titel":"Links abbiegen","k4_pill":"voreinander","k4_p1":"Rechtzeitig blinken, zur Mitte einordnen, nach hinten schauen.","k4_p2":"Dann wartest du: Der Gegenverkehr geht vor.","k4_p3":"Gegenverkehr, der geradeaus fährt: durchlassen.","k4_p4":"Auch Gegenverkehr, der rechts abbiegt: durchlassen.","k4_p5":"Erst wenn du niemanden behinderst oder gefährdest, biegst du ab.","k4_p6":"Zwei Linksabbieger von gegenüber biegen in der Regel voreinander ab.","k4_p7":"Nur wenn Verkehrslage oder Kreuzung es verlangen, biegen sie hintereinander ab.","k4_merk":"Linksabbieger lassen den Gegenverkehr durch.","k5_kicker":"Tempo 30","k5_titel":"Die 30er-Zone","k5_p1":"Schild 274.1: Hier beginnt die Tempo-30-Zone. Du darfst höchstens 30 km/h fahren.","k5_p2":"In der Zone gilt an Kreuzungen grundsätzlich rechts vor links – meistens ohne Vorfahrtschilder.","k5_p3":"Parkende Autos nehmen dir die Sicht? Taste dich langsam hinein, bis du alles übersehen kannst.","k5_p4":"Fahre langsam und sei bremsbereit – auch wenn du Vorfahrt hast.","k5_merk":"Wer von rechts kommt, hat Vorfahrt.","k6_kicker":"Zum Schluss","k6_titel":"Zurück zur Frage","k6_a1":"Das Auto rechts im Bild fährt zuerst: Von seiner rechten Seite kommt niemand.","k6_a2":"Dann das Auto unten: Das Auto von rechts ist weg.","k6_a3":"Zuletzt das Auto links: Auch hier ist das Auto von rechts weg.","k6_merk":"Was höher steht, gewinnt. Gibt es nichts Höheres: rechts vor links.","k6_b1":"Eigene Regeln haben: Kreisverkehr, Grundstücksausfahrt, Feld- und Waldweg.","k6_b2":"Gibt es Polizei, Ampel oder Schilder, entscheiden zuerst sie – nicht rechts vor links.","k6_b3":"Jetzt üben: Die 3D-Szenen in der Fahr-Akademie zeigen es aus jedem Blickwinkel."},"am":{"titel":"ቅድሚያ – ማን መጀመሪያ ይሄዳል?","ui_ueber":"አጠቃላይ እይታ፦ ቅድሚያ በ5 ደቂቃ","ui_intro":"ድምፅ የሌለው አጭር ፊልም፦ ሁሉም ነገር በምስሉ ላይ በጽሑፍ ይታያል። በማንኛውም ጊዜ ማቆም ወይም ምዕራፍ መምረጥ ይችላሉ።","ui_start":"ፊልሙን ጀምር","ui_pause":"አቁም","ui_weiter":"ቀጥል","ui_neu":"ከመጀመሪያ","ui_kapitel":"ምዕራፍ","ui_lesen":"ሙሉውን ጽሑፍ አንብብ","k1_kicker":"ጥያቄው","k1_titel":"ማን መጀመሪያ ይሄዳል?","k1_sub":"አንድ መገናኛ። የትራፊክ መብራት የለም፣ ምልክት የለም፣ ፖሊስ የለም።","k1_p1":"ሦስት መኪኖች በአንድ ጊዜ ይደርሳሉ። ሁሉም ቀጥታ መሄድ ይፈልጋሉ።","k1_p2":"መጀመሪያ እንዲሄድ የተፈቀደለት ማን ነው?","k1_p3":"መልሱ መጨረሻ ላይ ይመጣል። ለዚህ አንድ ሐሳብ ያስፈልግዎታል፦ የቅድሚያ ፒራሚድ።","k2_kicker":"ሥርዓቱ","k2_titel":"የቅድሚያ ፒራሚድ","k2_intro":"የተወሰነ ቅደም ተከተል አለ። ከፍ ብሎ የሚገኘው ይቀድማል።","k2_vorrang":"ቅድሚያ","s1_name":"ፖሊስ","s1_text":"የፖሊስ ምልክቶችና መመሪያዎች ከሌሎች ደንቦች ሁሉ፣ ከትራፊክ መብራቶችና ከምልክቶች ይቀድማሉ።","s1_plus":"ያኔም ቢሆን ራስዎ መጠንቀቅ አለብዎት።","s2_name":"መብራት","s2_text":"የመብራት ምልክቶች ከቅድሚያ ምልክቶችና ከ„ከቀኝ የሚመጣ ቅድሚያ አለው“ ደንብ ይቀድማሉ።","s2_plus":"አረንጓዴ ሲበራም መጠንቀቅ አለብዎት።","s3_name":"ምልክቶች","s3_text":"ቅድሚያ ይስጡ፣ ቁም፣ የቅድሚያ መንገድ፦ እነዚህ ምልክቶች ባሉበት ቦታ „ከቀኝ የሚመጣ ቅድሚያ አለው“ ደንብ አይሠራም።","s3_plus":"በቅርጻቸው ያውቋቸዋል፦ ሦስት ማዕዘን፣ ስምንት ማዕዘን፣ ሮምብ።","s4_name":"ከቀኝ ቅድሚያ","s4_text":"ከዚህ የሚበልጥ ከሌለ፦ ከቀኝ የሚመጣ ቅድሚያ አለው።","s4_plus":"ይህ በመገናኛዎችና በሚገናኙ መንገዶች ላይ ይሠራል – መሠረቱ ነው።","k2_merk":"ከፍ ብሎ የሚገኘው ያሸንፋል።","k3_kicker":"መሠረታዊው ደንብ","k3_titel":"ከቀኝ የሚመጣ ቅድሚያ አለው","k3_pill":"ከቀኝ","k3_p1":"ከቀኝ የሚመጣ ቅድሚያ አለው – ምልክትና የትራፊክ መብራት በሌለባቸው መገናኛዎችና በሚገናኙ መንገዶች ላይ።","k3_p2":"መጠበቅ ያለበት ቀድሞ ፍጥነቱን ይቀንሳል። ሁሉም እንዲያይ፦ እየጠበቅሁ ነው።","k3_p3":"ከቀኝ የሚመጣው መኪና ቅድሚያ አለው። ሌላኛው መኪና ይጠብቃል።","k3_p4":"ሌላውን ሳያሰጉና በከፍተኛ ሁኔታ ሳያውኩ ሲቀሩ ብቻ ይቀጥላሉ።","k3_p5":"ከተቃራኒው አቅጣጫም ተመሳሳይ ነው፦ እዚያም ከቀኝ የሚመጣ ቅድሚያ አለው።","k3_p6":"የተለመደ ስህተት፦ ወደ ቀኝ አለማየት ወይም ዝም ብሎ ጣልቃ መግባት።","k3_merk":"„ከቀኝ የሚመጣ ቅድሚያ አለው“ የሚሠራው ከዚህ የሚበልጥ ሌላ ነገር ካልተናገረ ብቻ ነው።","k4_kicker":"ተቃራኒ ትራፊክ","k4_titel":"ወደ ግራ መታጠፍ","k4_pill":"እርስ በርስ","k4_p1":"በጊዜ ፍሬቻ ያብሩ፣ ወደ መሃል ይግቡ፣ ወደ ኋላ ይመልከቱ።","k4_p2":"ከዚያ ይጠብቃሉ፦ ተቃራኒ ትራፊክ ይቀድማል።","k4_p3":"ቀጥታ የሚሄድ ተቃራኒ ትራፊክ፦ ያሳልፉት።","k4_p4":"ወደ ቀኝ የሚታጠፍ ተቃራኒ ትራፊክም፦ ያሳልፉት።","k4_p5":"ማንንም ሳያውኩና ሳያሰጉ ሲቀሩ ብቻ ይታጠፋሉ።","k4_p6":"ከፊት ለፊት የሚመጡ ሁለት ወደ ግራ የሚታጠፉ መኪኖች በተለምዶ እርስ በርስ እየተላለፉ ይታጠፋሉ።","k4_p7":"የትራፊክ ሁኔታ ወይም መገናኛው ሲጠይቅ ብቻ አንዱ ከሌላው በኋላ ይታጠፋሉ።","k4_merk":"ወደ ግራ የሚታጠፉ ተቃራኒ ትራፊክን ያሳልፋሉ።","k5_kicker":"ፍጥነት 30","k5_titel":"የ30 ዞን","k5_p1":"ምልክት 274.1፦ እዚህ የ30 ዞን ይጀምራል። ቢበዛ 30 km/h መንዳት ይችላሉ።","k5_p2":"በዞኑ ውስጥ በመገናኛዎች ላይ በመርህ ደረጃ ከቀኝ የሚመጣ ቅድሚያ አለው – ብዙውን ጊዜ ያለ ቅድሚያ ምልክቶች።","k5_p3":"የቆሙ መኪኖች እይታዎን ከለከሉ? ሁሉንም ማየት እስኪችሉ ድረስ ቀስ ብለው ወደ ውስጥ ይጠጉ።","k5_p4":"ቀስ ብለው ይንዱ፣ ፍሬን ለመያዝ ዝግጁ ይሁኑ – ቅድሚያ ቢኖርዎትም።","k5_merk":"ከቀኝ የሚመጣ ቅድሚያ አለው።","k6_kicker":"በመጨረሻ","k6_titel":"ወደ ጥያቄው እንመለስ","k6_a1":"በምስሉ በቀኝ በኩል ያለው መኪና መጀመሪያ ይሄዳል፦ ከቀኙ በኩል ማንም አይመጣም።","k6_a2":"ከዚያ ከታች ያለው መኪና፦ ከቀኝ የሚመጣው መኪና ሄዷል።","k6_a3":"በመጨረሻ በግራ በኩል ያለው መኪና፦ እዚህም ከቀኝ የሚመጣው መኪና ሄዷል።","k6_merk":"ከፍ ብሎ የሚገኘው ያሸንፋል። ከዚህ የሚበልጥ ከሌለ፦ ከቀኝ የሚመጣ ቅድሚያ አለው።","k6_b1":"የራሳቸው ደንብ አላቸው፦ አደባባይ፣ ከግቢ መውጫ፣ የእርሻና የደን መንገድ።","k6_b2":"ፖሊስ፣ የትራፊክ መብራት ወይም ምልክቶች ካሉ መጀመሪያ እነሱ ይወስናሉ – „ከቀኝ የሚመጣ ቅድሚያ አለው“ ደንብ አይደለም።","k6_b3":"አሁን ይለማመዱ፦ በFahr-Akademie ውስጥ ያሉት የ3D ትዕይንቶች ከየትኛውም አቅጣጫ ያሳያሉ።"},"ar":{"titel":"الأولوية – من يمرّ أولًا؟","ui_ueber":"نظرة عامة: الأولوية في 5 دقائق","ui_intro":"فيلم قصير بلا صوت: كل شيء مكتوب على الشاشة. يمكنك الإيقاف في أي وقت أو اختيار فصل.","ui_start":"ابدأ الفيلم","ui_pause":"إيقاف مؤقت","ui_weiter":"متابعة","ui_neu":"من البداية","ui_kapitel":"الفصول","ui_lesen":"اقرأ النص كاملًا","k1_kicker":"السؤال","k1_titel":"من يمرّ أولًا؟","k1_sub":"تقاطع واحد. بلا إشارة ضوئية، بلا لوحات، بلا شرطي.","k1_p1":"تصل ثلاث سيارات في وقت واحد. كلها تريد المتابعة مستقيمة.","k1_p2":"من يحق له المرور أولًا؟","k1_p3":"الجواب في النهاية. ولذلك تحتاج إلى فكرة: هرم الأولوية.","k2_kicker":"الترتيب","k2_titel":"هرم الأولوية","k2_intro":"هناك ترتيب ثابت. ما هو أعلى يتقدّم.","k2_vorrang":"الأسبقية","s1_name":"الشرطة","s1_text":"إشارات الشرطة وتعليماتها تتقدّم على كل القواعد الأخرى والإشارات الضوئية واللوحات.","s1_plus":"حتى حينها عليك أنت أن تنتبه.","s2_name":"الإشارة","s2_text":"الإشارات الضوئية تتقدّم على لوحات الأولوية وعلى اليمين قبل اليسار.","s2_plus":"حتى عند الضوء الأخضر عليك أن تنتبه.","s3_name":"اللوحات","s3_text":"أعطِ الأولوية، قف، طريق ذو أولوية: حيث توجد هذه اللوحات لا تنطبق قاعدة اليمين قبل اليسار.","s3_plus":"تعرفها من شكلها: مثلث، مثمّن، معيّن.","s4_name":"اليمين قبل اليسار","s4_text":"إذا لم يوجد ما هو أعلى: من يأتي من اليمين له حق الأولوية.","s4_plus":"وهذا ينطبق عند التقاطعات والتفرعات – وهو الأساس.","k2_merk":"ما هو أعلى يفوز.","k3_kicker":"القاعدة الأساسية","k3_titel":"اليمين قبل اليسار","k3_pill":"من اليمين","k3_p1":"من يأتي من اليمين له حق الأولوية – عند التقاطعات والتفرعات بلا لوحات وبلا إشارة ضوئية.","k3_p2":"من عليه الانتظار يخفف سرعته مبكرًا. هكذا يرى الجميع: أنا أنتظر.","k3_p3":"السيارة القادمة من اليمين لها حق الأولوية. والسيارة الأخرى تنتظر.","k3_p4":"تتابع السير فقط عندما لا تعرّض الآخر للخطر ولا تعيقه إعاقة كبيرة.","k3_p5":"من الاتجاه المقابل ينطبق الأمر نفسه: هناك أيضًا لمن يأتي من اليمين حق الأولوية.","k3_p6":"خطأ شائع: عدم النظر إلى اليمين أو التقدّم بالقوة.","k3_merk":"اليمين قبل اليسار ينطبق فقط إذا لم يقرّر ما هو أعلى خلاف ذلك.","k4_kicker":"حركة المرور المقابلة","k4_titel":"الانعطاف إلى اليسار","k4_pill":"أمام بعضهما","k4_p1":"شغّل إشارة الانعطاف مبكرًا، واصطفّ نحو المنتصف، وانظر إلى الخلف.","k4_p2":"ثم تنتظر: حركة المرور المقابلة لها الأسبقية.","k4_p3":"حركة المرور المقابلة التي تسير مستقيمة: دعها تمرّ.","k4_p4":"وكذلك حركة المرور المقابلة التي تنعطف إلى اليمين: دعها تمرّ.","k4_p5":"فقط عندما لا تعيق أحدًا ولا تعرّضه للخطر، تنعطف.","k4_p6":"سيارتان متقابلتان تنعطفان إلى اليسار تنعطفان عادةً الواحدة أمام الأخرى.","k4_p7":"فقط إذا اقتضت حالة المرور أو شكل التقاطع ذلك، تنعطفان الواحدة بعد الأخرى.","k4_merk":"المنعطفون إلى اليسار يدعون حركة المرور المقابلة تمرّ.","k5_kicker":"السرعة 30","k5_titel":"منطقة السرعة 30","k5_p1":"اللوحة 274.1: هنا تبدأ منطقة السرعة 30. يجوز لك السير بسرعة 30 km/h كحد أقصى.","k5_p2":"في المنطقة تنطبق عند التقاطعات من حيث المبدأ قاعدة اليمين قبل اليسار – غالبًا بلا لوحات أولوية.","k5_p3":"السيارات المتوقفة تحجب الرؤية؟ تقدّم ببطء حتى ترى كل شيء.","k5_p4":"سِر ببطء وكن مستعدًا للفرملة – حتى لو كان لك حق الأولوية.","k5_merk":"من يأتي من اليمين له حق الأولوية.","k6_kicker":"في الختام","k6_titel":"العودة إلى السؤال","k6_a1":"السيارة التي على يمين الصورة تمرّ أولًا: لا أحد يأتي من جهتها اليمنى.","k6_a2":"ثم السيارة في الأسفل: السيارة القادمة من اليمين مضت.","k6_a3":"أخيرًا السيارة على اليسار: هنا أيضًا السيارة القادمة من اليمين مضت.","k6_merk":"ما هو أعلى يفوز. وإذا لم يوجد ما هو أعلى: اليمين قبل اليسار.","k6_b1":"لها قواعدها الخاصة: الدوّار، الخروج من العقار، الطريق الزراعي وطريق الغابة.","k6_b2":"إذا وُجدت شرطة أو إشارة ضوئية أو لوحات، فهي التي تقرّر أولًا – لا اليمين قبل اليسار.","k6_b3":"الآن تدرّب: مشاهد 3D في Fahr-Akademie تعرضها من كل زاوية."},"ckb":{"titel":"مافی تێپەڕین – کێ یەکەم جار دەڕوات؟","ui_ueber":"پوختە: مافی تێپەڕین لە 5 خولەکدا","ui_intro":"فیلمێکی کورت بێ دەنگ: هەموو شتێک وەک نووسین لە وێنەکەدایە. دەتوانیت هەر کاتێک بوەستێنیت یان بەشێک هەڵبژێریت.","ui_start":"فیلمەکە دەست پێ بکە","ui_pause":"ڕایبگرە","ui_weiter":"بەردەوام بە","ui_neu":"لە سەرەتاوە","ui_kapitel":"بەشەکان","ui_lesen":"هەموو دەقەکە بخوێنەرەوە","k1_kicker":"پرسیارەکە","k1_titel":"کێ یەکەم جار دەڕوات؟","k1_sub":"چوارڕێیانێک. بێ ترافیک لایت، بێ تابلۆ، بێ پۆلیس.","k1_p1":"سێ ئۆتۆمبێل هاوکات دەگەن. هەموویان دەیانەوێت ڕاستەوڕاست بڕۆن.","k1_p2":"کێ ڕێگەی هەیە یەکەم جار بڕوات؟","k1_p3":"وەڵامەکە لە کۆتاییدا دێت. بۆ ئەوە بیرۆکەیەکت پێویستە: هەرەمی مافی تێپەڕین.","k2_kicker":"ڕیزبەندی","k2_titel":"هەرەمی مافی تێپەڕین","k2_intro":"ڕیزبەندییەکی جێگیر هەیە. ئەوەی بەرزترە، پێش دەکەوێت.","k2_vorrang":"پێشینە","s1_name":"پۆلیس","s1_text":"نیشانە و فەرمانەکانی پۆلیس پێش هەموو یاسا و ترافیک لایت و تابلۆکانی تر دەکەون.","s1_plus":"لەو کاتەشدا دەبێت خۆت ئاگادار بیت.","s2_name":"ترافیک لایت","s2_text":"ڕووناکییەکانی ترافیک لایت پێش تابلۆکانی مافی تێپەڕین و لای ڕاست پێش لای چەپ دەکەون.","s2_plus":"لە کاتی سەوزیشدا دەبێت ئاگادار بیت.","s3_name":"تابلۆ","s3_text":"مافی تێپەڕین بدە، وەستان، ڕێگای سەرەکی: لەو شوێنانەی ئەم تابلۆیانە هەن، لای ڕاست پێش لای چەپ جێبەجێ نابێت.","s3_plus":"لە شێوەکەیانەوە دەیانناسیتەوە: سێگۆشە، هەشتگۆشە، لوزی.","s4_name":"ڕاست پێش چەپ","s4_text":"ئەگەر هیچ شتێکی بەرزتر نەبێت: ئەوەی لە لای ڕاستەوە دێت مافی تێپەڕینی هەیە.","s4_plus":"ئەمە لە چوارڕێیان و سێڕێیانەکاندا جێبەجێ دەبێت – بنەمای سەرەکییە.","k2_merk":"ئەوەی بەرزترە، دەبات.","k3_kicker":"یاسا بنەڕەتییەکە","k3_titel":"لای ڕاست پێش لای چەپ","k3_pill":"لە ڕاستەوە","k3_p1":"ئەوەی لە لای ڕاستەوە دێت مافی تێپەڕینی هەیە – لە چوارڕێیان و سێڕێیانەکانی بێ تابلۆ و ترافیک لایت.","k3_p2":"ئەوەی دەبێت چاوەڕێ بکات، زوو هێواش دەبێتەوە. بەم شێوەیە هەموو کەس دەبینێت: من چاوەڕێ دەکەم.","k3_p3":"ئۆتۆمبێلی لای ڕاست مافی تێپەڕینی هەیە. ئۆتۆمبێلەکەی تر چاوەڕێ دەکات.","k3_p4":"تەنها کاتێک بەردەوام دەبیت کە ئەوی تر نە دەخەیتە مەترسییەوە و نە بە شێوەیەکی بەرچاو ڕێگری دەکەیت.","k3_p5":"لە ئاراستەی بەرامبەریشەوە هەمان شتە: ئەوێش ئەوەی لە لای ڕاستەوە دێت مافی تێپەڕینی هەیە.","k3_p6":"هەڵەی باو: سەیرنەکردنی لای ڕاست یان خۆ پێشخستن بە زۆر.","k3_merk":"لای ڕاست پێش لای چەپ تەنها کاتێک جێبەجێ دەبێت کە هیچ شتێکی بەرزتر شتێکی تر نەڵێت.","k4_kicker":"هاتوچۆی بەرامبەر","k4_titel":"پێچکردنەوە بەرەو چەپ","k4_pill":"لە پێش یەک","k4_p1":"لە کاتی خۆیدا ئیشارەت بدە، بچۆ ناوەڕاست، سەیری دواوە بکە.","k4_p2":"پاشان چاوەڕێ دەکەیت: هاتوچۆی بەرامبەر پێش دەکەوێت.","k4_p3":"هاتوچۆی بەرامبەر کە ڕاستەوڕاست دەڕوات: ڕێگەی بدە.","k4_p4":"هاتوچۆی بەرامبەر کە بەرەو ڕاست پێچ دەکاتەوەش: ڕێگەی بدە.","k4_p5":"تەنها کاتێک کەسێک ڕێگر نەکەیت و نەیخەیتە مەترسییەوە، پێچ دەکەیتەوە.","k4_p6":"دوو پێچکەرەوەی بەرەو چەپ لە بەرامبەر یەکەوە، بە گشتی لە پێش یەکەوە پێچ دەکەنەوە.","k4_p7":"تەنها ئەگەر دۆخی هاتوچۆ یان چوارڕێیانەکە پێویستی کرد، لە پشتی یەکەوە پێچ دەکەنەوە.","k4_merk":"ئەوانەی بەرەو چەپ پێچ دەکەنەوە ڕێگە بە هاتوچۆی بەرامبەر دەدەن.","k5_kicker":"خێرایی 30","k5_titel":"ناوچەی 30","k5_p1":"تابلۆی 274.1: لێرەوە ناوچەی 30 دەست پێ دەکات. دەتوانیت بە زۆرترین 30 km/h بڕۆیت.","k5_p2":"لە ناوچەکەدا لە چوارڕێیانەکاندا بە گشتی لای ڕاست پێش لای چەپ جێبەجێ دەبێت – زۆربەی جار بێ تابلۆی مافی تێپەڕین.","k5_p3":"ئۆتۆمبێلە پارککراوەکان بینینیان لێ گرتوویت؟ بە هێواشی بچۆ ناوەوە تا هەموو شتێک دەبینیت.","k5_p4":"هێواش بڕۆ و ئامادەی برێک بە – ئەگەر مافی تێپەڕینیشت هەبێت.","k5_merk":"ئەوەی لە لای ڕاستەوە دێت مافی تێپەڕینی هەیە.","k6_kicker":"لە کۆتاییدا","k6_titel":"گەڕانەوە بۆ پرسیارەکە","k6_a1":"ئۆتۆمبێلی لای ڕاستی وێنەکە یەکەم جار دەڕوات: لە لای ڕاستی ئەوەوە کەس نایەت.","k6_a2":"پاشان ئۆتۆمبێلی خوارەوە: ئۆتۆمبێلی لای ڕاستی ڕۆیشتووە.","k6_a3":"لە کۆتاییدا ئۆتۆمبێلی لای چەپ: لێرەشدا ئۆتۆمبێلی لای ڕاست ڕۆیشتووە.","k6_merk":"ئەوەی بەرزترە، دەبات. ئەگەر هیچ شتێکی بەرزتر نەبێت: لای ڕاست پێش لای چەپ.","k6_b1":"یاسای تایبەتی خۆیان هەیە: فلکە، دەرچوونی شوێنی تایبەت، ڕێگای کێڵگە و دارستان.","k6_b2":"ئەگەر پۆلیس، ترافیک لایت یان تابلۆ هەبێت، ئەوان یەکەم جار بڕیار دەدەن – نەک لای ڕاست پێش لای چەپ.","k6_b3":"ئێستا ڕاهێنان بکە: دیمەنە 3D ەکانی فەر-ئەکادیمی لە هەموو گۆشەیەکەوە نیشانی دەدەن."},"el":{"titel":"Προτεραιότητα – ποιος περνά πρώτος;","ui_ueber":"Επισκόπηση: η προτεραιότητα σε 5 λεπτά","ui_intro":"Μια σύντομη ταινία χωρίς ήχο: όλα γράφονται ως κείμενο στην εικόνα. Μπορείς να σταματήσεις ή να επιλέξεις κεφάλαιο όποτε θέλεις.","ui_start":"Έναρξη ταινίας","ui_pause":"Παύση","ui_weiter":"Συνέχεια","ui_neu":"Από την αρχή","ui_kapitel":"Κεφάλαια","ui_lesen":"Διάβασε ολόκληρο το κείμενο","k1_kicker":"Το ερώτημα","k1_titel":"Ποιος περνά πρώτος;","k1_sub":"Μια διασταύρωση. Χωρίς φανάρι, χωρίς πινακίδες, χωρίς αστυνομικό.","k1_p1":"Τρία αυτοκίνητα φτάνουν ταυτόχρονα. Όλα θέλουν να πάνε ευθεία.","k1_p2":"Ποιο επιτρέπεται να περάσει πρώτο;","k1_p3":"Η απάντηση έρχεται στο τέλος. Για αυτήν χρειάζεσαι μια ιδέα: την πυραμίδα της προτεραιότητας.","k2_kicker":"Η σειρά","k2_titel":"Η πυραμίδα της προτεραιότητας","k2_intro":"Υπάρχει σταθερή σειρά. Ό,τι βρίσκεται ψηλότερα προηγείται.","k2_vorrang":"Προβάδισμα","s1_name":"Αστυνομία","s1_text":"Τα σήματα και οι εντολές της αστυνομίας προηγούνται όλων των άλλων κανόνων, των φαναριών και των πινακίδων.","s1_plus":"Ακόμα και τότε πρέπει να προσέχεις μόνος σου.","s2_name":"Φανάρι","s2_text":"Τα φωτεινά σήματα προηγούνται των πινακίδων προτεραιότητας και της προτεραιότητας από δεξιά.","s2_plus":"Ακόμα και με πράσινο πρέπει να προσέχεις.","s3_name":"Πινακίδες","s3_text":"Παραχώρηση προτεραιότητας, Στοπ, οδός προτεραιότητας: όπου υπάρχουν αυτές οι πινακίδες, δεν ισχύει η προτεραιότητα από δεξιά.","s3_plus":"Τις αναγνωρίζεις από το σχήμα: τρίγωνο, οκτάγωνο, ρόμβος.","s4_name":"Από δεξιά","s4_text":"Αν δεν υπάρχει κάτι ψηλότερο: όποιος έρχεται από δεξιά έχει προτεραιότητα.","s4_plus":"Ισχύει σε διασταυρώσεις και συμβολές – είναι η βάση.","k2_merk":"Ό,τι βρίσκεται ψηλότερα, κερδίζει.","k3_kicker":"Ο βασικός κανόνας","k3_titel":"Προτεραιότητα από δεξιά","k3_pill":"από δεξιά","k3_p1":"Όποιος έρχεται από δεξιά έχει προτεραιότητα – σε διασταυρώσεις και συμβολές χωρίς πινακίδες και φανάρι.","k3_p2":"Όποιος πρέπει να περιμένει, επιβραδύνει νωρίς. Έτσι όλοι βλέπουν: περιμένω.","k3_p3":"Το αυτοκίνητο από δεξιά έχει προτεραιότητα. Το άλλο αυτοκίνητο περιμένει.","k3_p4":"Προχωράς μόνο όταν δεν θέτεις σε κίνδυνο τον άλλον ούτε τον εμποδίζεις σημαντικά.","k3_p5":"Από την αντίθετη κατεύθυνση ισχύει το ίδιο: κι εκεί προτεραιότητα έχει όποιος έρχεται από δεξιά.","k3_p6":"Τυπικό λάθος: να μην κοιτάς δεξιά ή να περνάς πρώτος με το ζόρι.","k3_merk":"Η προτεραιότητα από δεξιά ισχύει μόνο όταν τίποτα ψηλότερο δεν λέει κάτι άλλο.","k4_kicker":"Αντίθετο ρεύμα","k4_titel":"Αριστερή στροφή","k4_pill":"ταυτόχρονα","k4_p1":"Βάλε φλας εγκαίρως, μπες προς το κέντρο, κοίτα πίσω.","k4_p2":"Μετά περιμένεις: το αντίθετο ρεύμα προηγείται.","k4_p3":"Οχήματα από απέναντι που πάνε ευθεία: άφησέ τα να περάσουν.","k4_p4":"Και όσα από απέναντι στρίβουν δεξιά: άφησέ τα να περάσουν.","k4_p5":"Στρίβεις μόνο όταν δεν εμποδίζεις ούτε θέτεις σε κίνδυνο κανέναν.","k4_p6":"Δύο οχήματα απέναντι που στρίβουν αριστερά, στρίβουν κατά κανόνα ταυτόχρονα, χωρίς διασταύρωση.","k4_p7":"Μόνο αν το απαιτεί η κίνηση ή η διασταύρωση, στρίβουν το ένα πίσω από το άλλο.","k4_merk":"Όποιος στρίβει αριστερά αφήνει να περάσει το αντίθετο ρεύμα.","k5_kicker":"Όριο 30","k5_titel":"Η ζώνη 30","k5_p1":"Πινακίδα 274.1: εδώ αρχίζει η ζώνη 30. Επιτρέπεται να οδηγείς το πολύ 30 km/h.","k5_p2":"Στη ζώνη, σε διασταυρώσεις ισχύει κατά κανόνα η προτεραιότητα από δεξιά – συνήθως χωρίς πινακίδες προτεραιότητας.","k5_p3":"Τα σταθμευμένα αυτοκίνητα σου κρύβουν την ορατότητα; Προχώρα αργά, ψηλαφητά, μέχρι να βλέπεις τα πάντα.","k5_p4":"Οδήγα αργά και να είσαι έτοιμος για φρένο – ακόμα κι αν έχεις προτεραιότητα.","k5_merk":"Όποιος έρχεται από δεξιά έχει προτεραιότητα.","k6_kicker":"Στο τέλος","k6_titel":"Πίσω στο ερώτημα","k6_a1":"Το αυτοκίνητο δεξιά στην εικόνα περνά πρώτο: από τη δεξιά του πλευρά δεν έρχεται κανείς.","k6_a2":"Μετά το αυτοκίνητο κάτω: το αυτοκίνητο από δεξιά έφυγε.","k6_a3":"Τελευταίο το αυτοκίνητο αριστερά: κι εδώ το αυτοκίνητο από δεξιά έφυγε.","k6_merk":"Ό,τι βρίσκεται ψηλότερα, κερδίζει. Αν δεν υπάρχει κάτι ψηλότερο: προτεραιότητα από δεξιά.","k6_b1":"Δικούς τους κανόνες έχουν: κυκλικός κόμβος, έξοδος ιδιοκτησίας, αγροτικός και δασικός δρόμος.","k6_b2":"Αν υπάρχει αστυνομία, φανάρι ή πινακίδες, αποφασίζουν πρώτα αυτά – όχι η προτεραιότητα από δεξιά.","k6_b3":"Τώρα εξασκήσου: οι σκηνές 3D της Fahr-Akademie το δείχνουν από κάθε οπτική γωνία."},"en":{"titel":"Right of way – who goes first?","ui_ueber":"Overview: right of way in 5 minutes","ui_intro":"A short film without sound: everything is shown as text on screen. You can pause at any time or pick a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Resume","ui_neu":"Restart","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"The question","k1_titel":"Who goes first?","k1_sub":"A junction. No traffic light, no signs, no police officer.","k1_p1":"Three cars arrive at the same time. All want to go straight ahead.","k1_p2":"Who may go first?","k1_p3":"The answer comes at the end. For that you need one idea: the right-of-way pyramid.","k2_kicker":"The order","k2_titel":"The right-of-way pyramid","k2_intro":"There is a fixed order. What ranks higher comes first.","k2_vorrang":"Priority","s1_name":"Police","s1_text":"Signals and instructions from the police take precedence over all other rules, traffic lights and signs.","s1_plus":"Even then, you must watch out yourself.","s2_name":"Lights","s2_text":"Traffic lights take precedence over right-of-way signs and right before left.","s2_plus":"Even on green, you must watch out.","s3_name":"Signs","s3_text":"Give way, Stop, priority road: where these signs stand, right before left does not apply.","s3_plus":"You recognise them by their shape: triangle, octagon, diamond.","s4_name":"Right before left","s4_text":"If nothing ranks higher: whoever comes from the right has right of way.","s4_plus":"This applies at junctions and side-road entrances – it is the foundation.","k2_merk":"What ranks higher wins.","k3_kicker":"The basic rule","k3_titel":"Right before left","k3_pill":"from the right","k3_p1":"Whoever comes from the right has right of way – at junctions and side-road entrances without signs or traffic lights.","k3_p2":"Whoever has to wait slows down early. That way everyone sees: I am waiting.","k3_p3":"The car from the right has right of way. The other car waits.","k3_p4":"You only drive on once you neither endanger nor significantly hinder the other driver.","k3_p5":"The same applies from the opposite direction: there, too, whoever comes from the right has right of way.","k3_p6":"Typical mistake: not looking to the right, or just pushing in.","k3_merk":"Right before left only applies if nothing higher says otherwise.","k4_kicker":"Oncoming traffic","k4_titel":"Turning left","k4_pill":"Past each other","k4_p1":"Indicate in good time, move to the middle, look behind you.","k4_p2":"Then you wait: oncoming traffic goes first.","k4_p3":"Oncoming traffic going straight ahead: let it through.","k4_p4":"Oncoming traffic turning right: let it through as well.","k4_p5":"Only when you are not hindering or endangering anyone do you turn.","k4_p6":"Two oncoming cars turning left generally turn in front of each other.","k4_p7":"Only if the traffic situation or the junction requires it do they turn one behind the other.","k4_merk":"Left-turners let oncoming traffic through.","k5_kicker":"30 km/h","k5_titel":"The 30 zone","k5_p1":"Sign 274.1: the 30 km/h zone begins here. You may drive 30 km/h at most.","k5_p2":"In the zone, right before left generally applies at junctions – mostly without right-of-way signs.","k5_p3":"Parked cars block your view? Edge slowly forward until you can see everything.","k5_p4":"Drive slowly and be ready to brake – even if you have right of way.","k5_merk":"Whoever comes from the right has right of way.","k6_kicker":"To finish","k6_titel":"Back to the question","k6_a1":"The car on the right of the picture goes first: nobody comes from its right-hand side.","k6_a2":"Then the car at the bottom: the car from the right is gone.","k6_a3":"Last the car on the left: here, too, the car from the right is gone.","k6_merk":"What ranks higher wins. If nothing ranks higher: right before left.","k6_b1":"These have their own rules: roundabouts, driveway exits, farm and forest tracks.","k6_b2":"If there are police, traffic lights or signs, they decide first – not right before left.","k6_b3":"Now practise: the 3D scenes in the Fahr-Akademie show it from every angle."},"es":{"titel":"Prioridad – ¿quién pasa primero?","ui_ueber":"Resumen: la prioridad en 5 minutos","ui_intro":"Una película corta sin sonido: todo aparece como texto en la imagen. Puedes parar en cualquier momento o elegir un capítulo.","ui_start":"Iniciar película","ui_pause":"Pausa","ui_weiter":"Continuar","ui_neu":"Desde el principio","ui_kapitel":"Capítulos","ui_lesen":"Leer todo el texto","k1_kicker":"La pregunta","k1_titel":"¿Quién pasa primero?","k1_sub":"Un cruce. Sin semáforo, sin señales, sin policía.","k1_p1":"Llegan tres coches a la vez. Todos quieren seguir recto.","k1_p2":"¿Quién puede pasar primero?","k1_p3":"La respuesta llega al final. Para ello necesitas una idea: la pirámide de la prioridad.","k2_kicker":"El orden","k2_titel":"La pirámide de la prioridad","k2_intro":"Hay un orden fijo. Lo que está más arriba va primero.","k2_vorrang":"Prioridad","s1_name":"Policía","s1_text":"Las señales y órdenes de la policía están por encima de todas las demás reglas, semáforos y señales.","s1_plus":"Aun así, tienes que prestar atención por tu cuenta.","s2_name":"Semáforo","s2_text":"Los semáforos están por encima de las señales de prioridad y de la prioridad a la derecha.","s2_plus":"Incluso con luz verde tienes que prestar atención.","s3_name":"Señales","s3_text":"Ceda el paso, Stop, calle con prioridad: donde están estas señales no rige la prioridad a la derecha.","s3_plus":"Las reconoces por su forma: triángulo, octógono, rombo.","s4_name":"Prior. derecha","s4_text":"Si no hay nada superior: quien viene por la derecha tiene prioridad.","s4_plus":"Rige en cruces y bocacalles – es la base.","k2_merk":"Lo que está más arriba gana.","k3_kicker":"La regla básica","k3_titel":"Prioridad a la derecha","k3_pill":"de la derecha","k3_p1":"Quien viene por la derecha tiene prioridad – en cruces y bocacalles sin señales ni semáforo.","k3_p2":"Quien tiene que esperar reduce la velocidad pronto. Así todos ven: yo espero.","k3_p3":"El coche de la derecha tiene prioridad. El otro coche espera.","k3_p4":"Sigues solo cuando no pones en peligro ni obstaculizas de forma notable al otro.","k3_p5":"Desde el sentido contrario es igual: allí también tiene prioridad quien viene por la derecha.","k3_p6":"Error típico: no mirar a la derecha o colarse sin más.","k3_merk":"La prioridad a la derecha solo rige si nada superior dice otra cosa.","k4_kicker":"Tráfico en sentido contrario","k4_titel":"Girar a la izquierda","k4_pill":"uno por delante","k4_p1":"Pon el intermitente a tiempo, colócate hacia el centro, mira hacia atrás.","k4_p2":"Luego esperas: el tráfico en sentido contrario tiene preferencia.","k4_p3":"Tráfico en sentido contrario que sigue recto: déjalo pasar.","k4_p4":"También el que gira a la derecha: déjalo pasar.","k4_p5":"Solo cuando no obstaculizas ni pones en peligro a nadie, giras.","k4_p6":"Dos coches que giran a la izquierda desde sentidos opuestos suelen girar uno por delante del otro.","k4_p7":"Solo si el tráfico o el cruce lo exigen, giran uno por detrás del otro.","k4_merk":"Quien gira a la izquierda deja pasar al tráfico en sentido contrario.","k5_kicker":"Velocidad 30","k5_titel":"La zona 30","k5_p1":"Señal 274.1: aquí empieza la zona 30. Puedes ir como máximo a 30 km/h.","k5_p2":"En la zona, en los cruces rige en principio la prioridad a la derecha – casi siempre sin señales de prioridad.","k5_p3":"¿Los coches aparcados te tapan la vista? Avanza despacio hasta que lo veas todo.","k5_p4":"Ve despacio y listo para frenar – incluso si tienes prioridad.","k5_merk":"Quien viene por la derecha tiene prioridad.","k6_kicker":"Para terminar","k6_titel":"Volvemos a la pregunta","k6_a1":"El coche situado a la derecha en la imagen pasa primero: por su lado derecho no viene nadie.","k6_a2":"Después el coche de abajo: el coche de su derecha ya se ha ido.","k6_a3":"Por último el coche de la izquierda: también aquí se ha ido el coche que venía por la derecha.","k6_merk":"Lo que está más arriba gana. Si no hay nada superior: prioridad a la derecha.","k6_b1":"Tienen reglas propias: rotonda, salida de una propiedad, camino rural y forestal.","k6_b2":"Si hay policía, semáforo o señales, deciden ellos primero – no la prioridad a la derecha.","k6_b3":"Ahora a practicar: las escenas 3D de la Fahr-Akademie lo muestran desde cualquier ángulo."},"fa":{"titel":"حق تقدم – چه کسی اول می‌رود؟","ui_ueber":"مرور: حق تقدم در 5 دقیقه","ui_intro":"یک فیلم کوتاه بدون صدا: همه‌چیز به صورت متن روی تصویر است. هر زمان بخواهید می‌توانید متوقف کنید یا یک فصل انتخاب کنید.","ui_start":"شروع فیلم","ui_pause":"توقف","ui_weiter":"ادامه","ui_neu":"از اول","ui_kapitel":"فصل‌ها","ui_lesen":"خواندن کل متن","k1_kicker":"پرسش","k1_titel":"چه کسی اول می‌رود؟","k1_sub":"یک تقاطع. بدون چراغ راهنمایی، بدون تابلو، بدون پلیس.","k1_p1":"سه خودرو هم‌زمان می‌رسند. همه می‌خواهند مستقیم بروند.","k1_p2":"چه کسی اجازه دارد اول برود؟","k1_p3":"پاسخ در پایان می‌آید. برای آن به یک ایده نیاز دارید: هرم حق تقدم.","k2_kicker":"ترتیب","k2_titel":"هرم حق تقدم","k2_intro":"یک ترتیب ثابت وجود دارد. هرچه بالاتر باشد، مقدم است.","k2_vorrang":"حق تقدم","s1_name":"پلیس","s1_text":"علائم و دستورهای پلیس بر همه قواعد دیگر، چراغ‌های راهنمایی و تابلوها مقدم است.","s1_plus":"حتی در این صورت خودتان باید مراقب باشید.","s2_name":"چراغ","s2_text":"چراغ راهنمایی بر تابلوهای حق تقدم و حق تقدم با سمت راست مقدم است.","s2_plus":"حتی با چراغ سبز هم باید مراقب باشید.","s3_name":"تابلوها","s3_text":"«حق تقدم دهید»، «ایست»، «راه دارای حق تقدم»: هرجا این تابلوها هست، حق تقدم با سمت راست اعمال نمی‌شود.","s3_plus":"آن‌ها را از شکلشان می‌شناسید: مثلث، هشت‌ضلعی، لوزی.","s4_name":"حق تقدم با راست","s4_text":"اگر چیزی بالاتر نباشد: کسی که از راست می‌آید حق تقدم دارد.","s4_plus":"این در تقاطع‌ها و سه‌راهی‌ها اعمال می‌شود – پایه و اساس است.","k2_merk":"هرچه بالاتر باشد، برنده است.","k3_kicker":"قاعده پایه","k3_titel":"حق تقدم با سمت راست","k3_pill":"از راست","k3_p1":"کسی که از راست می‌آید حق تقدم دارد – در تقاطع‌ها و سه‌راهی‌های بدون تابلو و چراغ راهنمایی.","k3_p2":"کسی که باید منتظر بماند، زود سرعتش را کم می‌کند. این‌طور همه می‌بینند: من منتظرم.","k3_p3":"خودروی سمت راست حق تقدم دارد. خودروی دیگر منتظر می‌ماند.","k3_p4":"فقط وقتی ادامه می‌دهید که دیگری را نه به خطر بیندازید و نه به‌طور محسوس مزاحم شوید.","k3_p5":"از جهت مقابل هم همین‌طور است: آنجا هم کسی که از راست می‌آید حق تقدم دارد.","k3_p6":"اشتباه رایج: به راست نگاه نکردن یا ناگهان جلو زدن.","k3_merk":"حق تقدم با سمت راست فقط وقتی اعمال می‌شود که چیزی بالاتر خلافش را نگوید.","k4_kicker":"ترافیک روبه‌رو","k4_titel":"گردش به چپ","k4_pill":"از جلوی هم","k4_p1":"به‌موقع راهنما بزنید، به وسط بروید، به عقب نگاه کنید.","k4_p2":"سپس منتظر می‌مانید: ترافیک روبه‌رو مقدم است.","k4_p3":"ترافیک روبه‌رو که مستقیم می‌رود: بگذارید عبور کند.","k4_p4":"ترافیک روبه‌رو که به راست می‌پیچد هم: بگذارید عبور کند.","k4_p5":"فقط وقتی هیچ‌کس را در خطر نمی‌اندازید و مزاحم نمی‌شوید، می‌پیچید.","k4_p6":"دو خودرو که از روبه‌رو به چپ می‌پیچند، معمولاً هم‌زمان و از جلوی هم می‌پیچند.","k4_p7":"فقط اگر وضعیت ترافیک یا شکل تقاطع ایجاب کند، پشت سر هم می‌پیچند.","k4_merk":"خودروهای گردش به چپ، ترافیک روبه‌رو را عبور می‌دهند.","k5_kicker":"سرعت 30","k5_titel":"منطقه سرعت 30","k5_p1":"تابلوی 274.1: اینجا منطقه سرعت 30 شروع می‌شود. حداکثر مجاز 30 km/h است.","k5_p2":"در این منطقه، در تقاطع‌ها اصولاً حق تقدم با سمت راست است – بیشتر وقت‌ها بدون تابلوی حق تقدم.","k5_p3":"خودروهای پارک‌شده جلوی دید را گرفته‌اند؟ آهسته جلو بروید تا همه‌چیز را ببینید.","k5_p4":"آهسته برانید و آماده ترمز باشید – حتی وقتی حق تقدم دارید.","k5_merk":"کسی که از راست می‌آید حق تقدم دارد.","k6_kicker":"در پایان","k6_titel":"بازگشت به پرسش","k6_a1":"خودروی سمت راست تصویر اول می‌رود: از سمت راستش کسی نمی‌آید.","k6_a2":"بعد خودروی پایین: خودروی سمت راستش رفته است.","k6_a3":"آخر خودروی سمت چپ: اینجا هم خودروی سمت راست رفته است.","k6_merk":"هرچه بالاتر باشد، برنده است. اگر چیزی بالاتر نباشد: حق تقدم با سمت راست.","k6_b1":"قواعد خاص خودشان را دارند: میدان، خروجی ملک، جاده خاکی مزرعه و جنگل.","k6_b2":"اگر پلیس، چراغ راهنمایی یا تابلو باشد، اول آن‌ها تعیین می‌کنند – نه حق تقدم با سمت راست.","k6_b3":"حالا تمرین کنید: صحنه‌های 3D در Fahr-Akademie همه‌چیز را از هر زاویه نشان می‌دهند."},"hi":{"titel":"राइट ऑफ़ वे – पहले कौन जाए?","ui_ueber":"एक नज़र: 5 मिनट में राइट ऑफ़ वे","ui_intro":"आवाज़ के बिना एक छोटी फ़िल्म: सब कुछ तस्वीर में लिखा है। आप कभी भी रोक सकते हैं या कोई अध्याय चुन सकते हैं।","ui_start":"फ़िल्म शुरू करें","ui_pause":"रोकें","ui_weiter":"आगे","ui_neu":"शुरू से","ui_kapitel":"अध्याय","ui_lesen":"पूरा टेक्स्ट पढ़ें","k1_kicker":"सवाल","k1_titel":"पहले कौन जाए?","k1_sub":"एक चौराहा। न ट्रैफ़िक लाइट, न संकेत, न पुलिस।","k1_p1":"तीन गाड़ियाँ एक साथ पहुँचती हैं। सब सीधे जाना चाहती हैं।","k1_p2":"पहले कौन जाए?","k1_p3":"जवाब आख़िर में मिलेगा। उसके लिए एक विचार चाहिए: राइट ऑफ़ वे का पिरामिड।","k2_kicker":"क्रम","k2_titel":"राइट ऑफ़ वे का पिरामिड","k2_intro":"एक तय क्रम है। जो ऊपर है, वह पहले।","k2_vorrang":"प्राथमिकता","s1_name":"पुलिस","s1_text":"पुलिस के संकेत और निर्देश बाकी सभी नियमों, ट्रैफ़िक लाइट और संकेतों से ऊपर हैं।","s1_plus":"तब भी आपको ख़ुद ध्यान रखना है।","s2_name":"लाइट","s2_text":"ट्रैफ़िक लाइट राइट ऑफ़ वे के संकेतों और दाएँ से आने वाले को पहले नियम से ऊपर है।","s2_plus":"हरी लाइट पर भी ध्यान रखना है।","s3_name":"संकेत","s3_text":"राइट ऑफ़ वे दें, स्टॉप, प्राथमिकता वाली सड़क: जहाँ ये संकेत हैं, वहाँ दाएँ से आने वाले को पहले नियम लागू नहीं होता।","s3_plus":"आप इन्हें आकार से पहचानते हैं: त्रिकोण, अष्टकोण, हीरा।","s4_name":"दाएँ से पहले","s4_text":"अगर इससे ऊपर कुछ नहीं है: जो दाएँ से आता है, उसे राइट ऑफ़ वे है।","s4_plus":"यह चौराहों और तिराहों पर लागू होता है – यही बुनियाद है।","k2_merk":"जो ऊपर है, वही जीतता है।","k3_kicker":"बुनियादी नियम","k3_titel":"दाएँ से आने वाले को पहले","k3_pill":"दाएँ से","k3_p1":"जो दाएँ से आता है, उसे राइट ऑफ़ वे है – बिना संकेत और ट्रैफ़िक लाइट वाले चौराहों और तिराहों पर।","k3_p2":"जिसे रुकना है, वह पहले से धीमा हो जाता है। इससे सब देख लेते हैं: मैं रुक रहा हूँ।","k3_p3":"दाएँ से आने वाली गाड़ी को राइट ऑफ़ वे है। दूसरी गाड़ी रुकती है।","k3_p4":"आप तभी आगे बढ़ते हैं, जब दूसरे को न ख़तरे में डालें और न उसे ज़्यादा रोकें।","k3_p5":"सामने की दिशा से भी यही लागू होता है: वहाँ भी जो दाएँ से आता है, उसे राइट ऑफ़ वे है।","k3_p6":"आम ग़लती: दाईं ओर न देखना या ज़बरदस्ती आगे निकल जाना।","k3_merk":"दाएँ से आने वाले को पहले नियम तभी लागू होता है, जब ऊपर का कोई नियम कुछ और न कहे।","k4_kicker":"सामने से आता ट्रैफ़िक","k4_titel":"बाएँ मुड़ना","k4_pill":"एक-दूसरे के आगे","k4_p1":"समय पर इंडिकेटर दें, बीच में आएँ, पीछे देखें।","k4_p2":"फिर आप इंतज़ार करते हैं: सामने से आता ट्रैफ़िक पहले।","k4_p3":"सामने से सीधे आने वाले ट्रैफ़िक को निकलने दें।","k4_p4":"सामने से दाएँ मुड़ने वाले ट्रैफ़िक को भी निकलने दें।","k4_p5":"आप तभी मुड़ते हैं, जब किसी को न रोकें और न ख़तरे में डालें।","k4_p6":"सामने से आने वाले दो बाएँ मुड़ने वाले आम तौर पर एक-दूसरे के आगे से मुड़ते हैं।","k4_p7":"सिर्फ़ जब ट्रैफ़िक की स्थिति या चौराहा माँगे, तब वे एक-दूसरे के पीछे से मुड़ते हैं।","k4_merk":"बाएँ मुड़ने वाले सामने के ट्रैफ़िक को निकलने देते हैं।","k5_kicker":"30 की स्पीड","k5_titel":"30 ज़ोन","k5_p1":"संकेत 274.1: यहाँ से 30 ज़ोन शुरू होता है। आप ज़्यादा से ज़्यादा 30 km/h चला सकते हैं।","k5_p2":"ज़ोन में चौराहों पर मूल रूप से दाएँ से आने वाले को पहले नियम लागू होता है – अकसर राइट ऑफ़ वे के संकेतों के बिना।","k5_p3":"खड़ी गाड़ियों से आगे की सड़क नहीं दिखती? धीरे-धीरे आगे बढ़ें, जब तक सब कुछ दिखने न लगे।","k5_p4":"धीरे चलें और ब्रेक के लिए तैयार रहें – राइट ऑफ़ वे होने पर भी।","k5_merk":"जो दाएँ से आता है, उसे राइट ऑफ़ वे है।","k6_kicker":"आख़िर में","k6_titel":"सवाल पर वापस","k6_a1":"तस्वीर में दाईं ओर की गाड़ी पहले जाती है: उसके दाएँ से कोई नहीं आ रहा।","k6_a2":"फिर नीचे की गाड़ी: दाएँ से आने वाली गाड़ी जा चुकी है।","k6_a3":"आख़िर में बाईं ओर की गाड़ी: यहाँ भी दाएँ से आने वाली गाड़ी जा चुकी है।","k6_merk":"जो ऊपर है, वही जीतता है। अगर ऊपर कुछ नहीं: दाएँ से आने वाले को पहले।","k6_b1":"अपने ख़ास नियम हैं: गोल चक्कर, घर या प्लॉट से निकलना, खेत और जंगल का रास्ता।","k6_b2":"पुलिस, ट्रैफ़िक लाइट या संकेत हों, तो पहले वे तय करते हैं – दाएँ से आने वाले को पहले नियम नहीं।","k6_b3":"अब अभ्यास करें: फ़ाह्र-अकादेमी के 3D दृश्य इसे हर कोण से दिखाते हैं।"},"kmr":{"titel":"Mafê pêşîyê – kî pêşî diçe?","ui_ueber":"Nêrîna giştî: Mafê pêşîyê di 5 deqeyan de","ui_intro":"Fîlmeke kurt bê deng: Her tişt di wêneyê de wek nivîs e. Tu dikarî her dem bisekinî an beşekê hilbijêrî.","ui_start":"Fîlmê dest pê bike","ui_pause":"Raweste","ui_weiter":"Bidomîne","ui_neu":"Ji nû ve","ui_kapitel":"Beş","ui_lesen":"Hemû nivîsê bixwîne","k1_kicker":"Pirs","k1_titel":"Kî pêşî diçe?","k1_sub":"Xaçerêyek. Bê çiraya trafîkê, bê nîşan, bê polîs.","k1_p1":"Sê erebe bi hev re digihîjin. Hemû dixwazin rasterast biçin.","k1_p2":"Kî dikare pêşî biçe?","k1_p3":"Bersiv di dawiyê de tê. Ji bo wê ramanek hewce ye: pîramîda mafê pêşîyê.","k2_kicker":"Rêz","k2_titel":"Pîramîda mafê pêşîyê","k2_intro":"Rêzek sabît heye. Yê ku bilindtir e pêşî tê.","k2_vorrang":"Pêşînî","s1_name":"Polîs","s1_text":"Nîşan û fermanên polîsê ji hemû qaîdeyên din, çirayên trafîkê û nîşanan pêşîtir in.","s1_plus":"Hingê jî divê tu bi xwe baldar bî.","s2_name":"Çira","s2_text":"Çirayên trafîkê ji nîşanên mafê pêşîyê û rast berî çep pêşîtir in.","s2_plus":"Bi kesk jî divê tu baldar bî.","s3_name":"Nîşan","s3_text":"Mafê pêşîyê bide, Raweste, Rêya bi mafê pêşîyê: Li ku ev nîşan hebin, rast berî çep derbasdar nîne.","s3_plus":"Tu wan ji şeklê wan nas dikî: sêgoşe, heştgoşe, lozenj.","s4_name":"Rast berî çep","s4_text":"Heke tiştekî bilindtir tune be: Yê ji rastê tê, mafê pêşîyê heye.","s4_plus":"Ev li xaçeran û devê rêyan derbasdar e – ev bingeh e.","k2_merk":"Yê bilindtir e, bi ser dikeve.","k3_kicker":"Qaîdeya bingehîn","k3_titel":"Rast berî çep","k3_pill":"ji rastê","k3_p1":"Yê ji rastê tê, mafê pêşîyê heye – li xaçeran û devê rêyan bê nîşan û çiraya trafîkê.","k3_p2":"Yê ku divê bisekine, zû hêdî dibe. Wiha her kes dibîne: Ez disekinim.","k3_p3":"Erebeya ji rastê mafê pêşîyê heye. Erebeya din disekine.","k3_p4":"Tu tenê dema berdewam dikî ku yê din ne bixî xeterê û ne jî bi giranî asteng bikî.","k3_p5":"Ji aliyê beramber jî heman tişt derbasdar e: Li wir jî yê ji rastê tê mafê pêşîyê heye.","k3_p6":"Xeletiya tîpîk: li rastê nenêrîn an bi zorê pêşî çûn.","k3_merk":"Rast berî çep tenê derbasdar e dema tiştekî bilindtir tiştekî din nebêje.","k4_kicker":"Trafîka hember","k4_titel":"Zivirîna çepê","k4_pill":"li pêşberî hev","k4_p1":"Di wextê xwe de sînyal bide, bi navîn ve rêz bibe, li paş binêre.","k4_p2":"Paşê tu li bendê dimînî: Trafîka hember pêşî diçe.","k4_p3":"Trafîka hember a ku rasterast diçe: bila derbas bibe.","k4_p4":"Trafîka hember a ku rastê dizivire jî: bila derbas bibe.","k4_p5":"Tenê dema tu kesî asteng nekî û nexî xeterê, tu dizivirî.","k4_p6":"Du erebeyên ji beramberî ku çepê dizivirin, bi gelemperî li pêşberî hev dizivirin.","k4_p7":"Tenê heke rewşa trafîkê an xaçer wiha bixwaze, ew li pişt hev dizivirin.","k4_merk":"Yên ku çepê dizivirin, dihêlin trafîka hember derbas bibe.","k5_kicker":"Lez 30","k5_titel":"Herêma 30","k5_p1":"Nîşana 274.1: Li vir herêma 30 dest pê dike. Tu dikarî herî zêde 30 km/h biajoyî.","k5_p2":"Di herêmê de li xaçeran bi gelemperî rast berî çep derbasdar e – piranî bê nîşanên mafê pêşîyê.","k5_p3":"Erebeyên parkkirî dîtina te digirin? Hêdî hêdî xwe bikişîne hundir, heta ku tu her tiştî bibînî.","k5_p4":"Hêdî biajo û ji bo frenê amade be – heke mafê te yê pêşîyê hebe jî.","k5_merk":"Yê ji rastê tê, mafê pêşîyê heye.","k6_kicker":"Di dawiyê de","k6_titel":"Vegere ser pirsê","k6_a1":"Erebeya li aliyê rastê yê wêneyê pêşî diçe: Ji aliyê wê yê rastê kes nayê.","k6_a2":"Paşê erebeya jêrîn: Erebeya ji rastê çûye.","k6_a3":"Di dawiyê de erebeya li çepê: Li vir jî erebeya ji rastê çûye.","k6_merk":"Yê bilindtir e, bi ser dikeve. Heke tiştekî bilindtir tune be: rast berî çep.","k6_b1":"Qaîdeyên xwe hene: dorhêl, derketina ji mal, rêya zevî û daristanê.","k6_b2":"Heke polîs, çiraya trafîkê an nîşan hebin, pêşî ew biryarê didin – ne rast berî çep.","k6_b3":"Niha tamrîn bike: Dîmenên 3D yên di Fahr-Akademie de ji her goşeyê nîşan didin."},"ps":{"titel":"د تېرېدو حق – څوک لومړی ځي؟","ui_ueber":"لنډه کتنه: د تېرېدو حق په 5 دقیقو کې","ui_intro":"لنډ فلم بې غږه: ټول متن په انځور کې دی. هر وخت یې درولی یا څپرکی ټاکلی شئ.","ui_start":"فلم پیل کړئ","ui_pause":"درول","ui_weiter":"دوام","ui_neu":"له سره","ui_kapitel":"څپرکي","ui_lesen":"ټول متن ولولئ","k1_kicker":"پوښتنه","k1_titel":"څوک لومړی ځي؟","k1_sub":"یوه څلورلاره. نه ترافیکي څراغ، نه نښې، نه پولیس.","k1_p1":"درې موټرې په یوه وخت راورسېږي. ټولې سمې مخې ته ځي.","k1_p2":"څوک باید لومړی ولاړ شي؟","k1_p3":"ځواب په پای کې دی. مخکې یو فکر پکار دی: د تېرېدو حق هرم.","k2_kicker":"ترتیب","k2_titel":"د تېرېدو حق هرم","k2_intro":"یو ټاکلی ترتیب شته. څه چې لوړ وي، مخکې دی.","k2_vorrang":"لومړیتوب","s1_name":"پولیس","s1_text":"د پولیسو نښې او امرونه له ټولو نورو قاعدو، ترافیکي څراغونو او نښو مخکې دي.","s1_plus":"بیا هم باید پخپله پام وکړئ.","s2_name":"څراغ","s2_text":"څراغي اشارې د تېرېدو حق له نښو او ښي لوري ته لومړیتوب مخکې دي.","s2_plus":"په شین څراغ کې هم باید پام وکړئ.","s3_name":"نښې","s3_text":"لار ورکړئ، ودرېږئ، اصلي سړک: چېرته چې دا نښې وي، ښي لوري ته لومړیتوب نه چلېږي.","s3_plus":"له شکل یې پېژنئ: درې‌کونجی، اته‌کونجی، لوزی.","s4_name":"ښي ته لومړیتوب","s4_text":"که لوړ څه نه وي: څوک چې له ښي لوري راځي، د تېرېدو حق لري.","s4_plus":"دا په څلورلارو او درېلارو کې چلېږي – دا بنسټ دی.","k2_merk":"څه چې لوړ وي، ګټي.","k3_kicker":"بنسټیزه قاعده","k3_titel":"ښي لوري ته لومړیتوب","k3_pill":"له ښي لوري","k3_p1":"څوک چې له ښي لوري راځي، د تېرېدو حق لري – په هغو څلورلارو او درېلارو کې چې نښې او ترافیکي څراغ نه لري.","k3_p2":"څوک چې باید انتظار وکړي، وختي ورو کېږي. نو هر څوک ویني: زه انتظار کوم.","k3_p3":"له ښي لوري موټر د تېرېدو حق لري. بل موټر انتظار کوي.","k3_p4":"تاسو یوازې هغه مهال ځئ چې بل نه په خطر کې اچوئ او نه ورته د پام وړ خنډ جوړوئ.","k3_p5":"له مخامخ لوري هم همداسې دی: هلته هم هغه د تېرېدو حق لري چې له ښي لوري راځي.","k3_p6":"ډېره عامه تېروتنه: ښي خوا ته نه کتل یا په زور مخکې کېدل.","k3_merk":"ښي لوري ته لومړیتوب یوازې هغه مهال چلېږي چې لوړ څه بل ډول نه وايي.","k4_kicker":"مخامخ ترافیک","k4_titel":"چپ ته اوښتل","k4_pill":"د یو بل مخې ته","k4_p1":"په وخت اشاره ورکړئ، منځ ته لېن ونیسئ، شا ته وګورئ.","k4_p2":"بیا انتظار کوئ: مخامخ ترافیک لومړی دی.","k4_p3":"مخامخ ترافیک چې سمې مخې ته ځي: ورکړئ چې تېر شي.","k4_p4":"هغه مخامخ ترافیک هم چې ښي ته اوړي: ورکړئ چې تېر شي.","k4_p5":"یوازې هغه مهال چې هیچا ته خنډ یا خطر نه جوړوئ، اوړئ.","k4_p6":"دوه چپ ته اوښتونکي له مخامخ لوري په عموم کې د یو بل مخې ته اوړي.","k4_p7":"یوازې که د ترافیک حالت یا څلورلاره دا وغواړي، یو له بل تر شا اوړي.","k4_merk":"چپ ته اوښتونکي مخامخ ترافیک ته لار ورکوي.","k5_kicker":"چټکتیا 30","k5_titel":"د 30 سیمه","k5_p1":"نښه 274.1: دلته د 30 چټکتیا سیمه پیل کېږي. تر ټولو ډېر 30 km/h چلولی شئ.","k5_p2":"په سیمه کې په څلورلارو کې په عموم کې ښي لوري ته لومړیتوب چلېږي – اکثره بې د تېرېدو حق له نښو.","k5_p3":"ولاړې موټرې لید بندوي؟ ورو ورو ځان مخکې کړئ، تر هغه چې ټول وګورئ.","k5_p4":"ورو چلوئ او بریک ته تیار اوسئ – که د تېرېدو حق هم لرئ.","k5_merk":"څوک چې له ښي لوري راځي، د تېرېدو حق لري.","k6_kicker":"په پای کې","k6_titel":"پوښتنې ته بیرته","k6_a1":"په انځور کې ښي خوا موټر لومړی ځي: له ښي خوا یې هیڅوک نه راځي.","k6_a2":"بیا لاندې موټر: له ښي لوري موټر تللی دی.","k6_a3":"په پای کې چپ موټر: دلته هم له ښي لوري موټر تللی دی.","k6_merk":"څه چې لوړ وي، ګټي. که لوړ څه نه وي: ښي لوري ته لومړیتوب.","k6_b1":"خپلې قاعدې لري: ګردي څلورلاره، له ملکیت وتنه، د کروندې او ځنګل لار.","k6_b2":"که پولیس، ترافیکي څراغ یا نښې وي، هغوی لومړی پرېکړه کوي – نه ښي لوري ته لومړیتوب.","k6_b3":"اوس تمرین وکړئ: د Fahr-Akademie 3D صحنې دا له هر لوري ښيي."},"rif":{"titel":"Lpriyuriti – wi ad yezwar?","ui_ueber":"Amezzuɣ: lpriyuriti di 5 n ddqayeq","ui_intro":"Yiwen n lfilm cwayt bla ṣṣut: kulci yella am aḍris di twalit. Tzemmreḍ ad tḥebseḍ di kra n lweqt niɣ ad txtaṛeḍ aḥric.","ui_start":"Bdu lfilm","ui_pause":"Ḥbes","ui_weiter":"Kemmel","ui_neu":"Zi tazwara","ui_kapitel":"Iḥricen","ui_lesen":"Ɣeṛ aḍris kamel","k1_kicker":"Asteqsi","k1_titel":"Wi ad yezwar?","k1_sub":"Yiwen n lkaṛfuṛ. Bla lfiṛu, bla lpanuwat, bla lbulis.","k1_p1":"Kraḍ n ṭumubilat ttasent-d di yiwen n lweqt. Maṛṛa xsent ad ṛuḥent nican.","k1_p2":"Wi ad yezwar?","k1_p3":"Tiririt ad d-tas di taggara. Ixeṣṣa-c yiwet n tikti: tapiramit n lpriyuriti.","k2_kicker":"Ttertib","k2_titel":"Tapiramit n lpriyuriti","k2_intro":"Yella yiwen n ttertib i yeqqimen. Win yellan ɣer ufella, yezwar.","k2_vorrang":"Lpriyuriti","s1_name":"Lbulis","s1_text":"Tilɣa d tiwtilin n lbulis zwarent ɣer maṛṛa lqawaɛid, lfiṛu d lpanuwat.","s1_plus":"Ḥetta dinni ixeṣṣa ad txẓeṛeḍ s yiman-nnec.","s2_name":"Lfiṛu","s2_text":"Lfiṛu tezwar ɣer lpanuwat n lpriyuriti d ɣer lqaɛida zi ufus ɛad ag izeggʷar.","s2_plus":"Ḥetta s ḍḍew azegzaw ixeṣṣa ad txẓeṛeḍ.","s3_name":"Lpanuwat","s3_text":"Ejj lpriyuriti, Stop, abrid n lpriyuriti: mani llan lpanuwat-a, lqaɛida zi ufus ɛad ag izeggʷar war tetteddu ca.","s3_plus":"Ad ten-tessneḍ s lcekl: lmutellet, lmutemmen, lmeɛin.","s4_name":"Zi ufus","s4_text":"Mala war llin ca win yellan ɣer ufella: win i d-itasen zi ufus ɣaṛ-s lpriyuriti.","s4_plus":"Aya yetteddu di lkaṛfuṛ d di iberdan n yidis – d lasas.","k2_merk":"Win yellan ɣer ufella, yezwar.","k3_kicker":"Lqaɛida tagejdant","k3_titel":"Zi ufus ɛad ag izeggʷar","k3_pill":"zi ufus","k3_p1":"Win i d-itasen zi ufus ɣaṛ-s lpriyuriti – di lkaṛfuṛ d di iberdan n yidis bla lpanuwat d bla lfiṛu.","k3_p2":"Win ixeṣṣan ad iṛaǧu, ittsenqis ssuṛɛa zik. S waya kul yiwen ixeẓẓeṛ: ttṛaǧuɣ.","k3_p3":"Ṭumubil i d-itasen zi ufus ɣaṛ-s lpriyuriti. Ṭumubil nniḍen tṛaǧa.","k3_p4":"Tkemmleḍ ɣir mala war tessekcmeḍ nniḍen di lxaṭaṛ, war t-teḥbiseḍ aṭṭas.","k3_p5":"Zi tama n zzat yetteddu ɛad aya: ḥetta dinni ɣaṛ-s lpriyuriti win i d-itasen zi ufus.","k3_p6":"Axeṭṭa i yettɛawaden: war txẓaṛeḍ ca ɣer ufus niɣ ad tezwaṛeḍ bla ma ixeṣṣa.","k3_merk":"Zi ufus ɛad ag izeggʷar tetteddu ɣir mala war yella ca win yellan ɣer ufella i yenna nniḍen.","k4_kicker":"Ṭumubilat n zzat","k4_titel":"Adewweṛ ɣer uzelmaḍ","k4_pill":"zzat wa i wa","k4_p1":"Ssekker ligno zik, kcem ɣer tlemmast, xẓeṛ ɣer deffir.","k4_p2":"Dɣa tṛaǧuḍ: ṭumubilat i d-yetteddun zzat-c zwarent.","k4_p3":"Ṭumubilat n zzat i yetteddun nican: ejj-itent ad ɛeddint.","k4_p4":"Ḥetta wid ittdewwiṛen ɣer ufus: ejj-itent ad ɛeddint.","k4_p5":"Ɣir mala war tḥebbseḍ ca ḥedd, war tessekcmeḍ ca di lxaṭaṛ, ad tdewweṛeḍ.","k4_p6":"Sin n wid ittdewwiṛen ɣer uzelmaḍ zi tama n zzat, di lqaɛida ttdewwiṛen zzat wa i wa.","k4_p7":"Ɣir mala lḥala n ubrid niɣ lkaṛfuṛ ssutren aya, ttdewwiṛen deffir wa i wa.","k4_merk":"Wid ittdewwiṛen ɣer uzelmaḍ ttejjan ṭumubilat n zzat ad ɛeddint.","k5_kicker":"Ssuṛɛa 30","k5_titel":"Tamnaḍt n 30","k5_p1":"Lpanu 274.1: da tebda tamnaḍt n 30. Tzemmreḍ ad teddiḍ s ugar 30 km/h.","k5_p2":"Di tamnaḍt, di lkaṛfuṛ, di lqaɛida tetteddu zi ufus ɛad ag izeggʷar – aṭṭas n tikkal bla lpanuwat n lpriyuriti.","k5_p3":"Ṭumubilat i ibedden ḥebsent-ac axẓaṛ? Qqeṛṛeb s ttawil, alami tẓaṛeḍ kulci.","k5_p4":"Ddu s ttawil d qqim wajed i lfrinu – ḥetta mala ɣaṛ-c lpriyuriti.","k5_merk":"Win i d-itasen zi ufus ɣaṛ-s lpriyuriti.","k6_kicker":"Deg taggara","k6_titel":"Uɣal ɣer usteqsi","k6_a1":"Ṭumubil n ufus di twalit tezwar: zi tama-s n ufus war d-yusi ca ḥedd.","k6_a2":"Dɣa ṭumubil n lqaɛ: ṭumubil i d-itasen zi ufus tɛedda.","k6_a3":"Taneggarut ṭumubil n uzelmaḍ: ḥetta dinni ṭumubil i d-itasen zi ufus tɛedda.","k6_merk":"Win yellan ɣer ufella, yezwar. Mala war llin ca: zi ufus ɛad ag izeggʷar.","k6_b1":"Ɣaṛ-sen lqawaɛid n yiman-nsen: ṛṛunpwan, tuffɣa zi lmilk, abrid n lḥeqlat d lɣaba.","k6_b2":"Mala llan lbulis, lfiṛu niɣ lpanuwat, nutni i yezwaren – macci zi ufus ɛad ag izeggʷar.","k6_b3":"Ṛux ṭṭeṛṛeb: tiswiriwin 3D n Fahr-Akademie ssknent-ak aya zi yal tama."},"ru":{"titel":"Приоритет – кто едет первым?","ui_ueber":"Обзор: приоритет за 5 минут","ui_intro":"Короткий фильм без звука: всё написано в кадре. Ты можешь в любой момент остановить его или выбрать главу.","ui_start":"Начать фильм","ui_pause":"Пауза","ui_weiter":"Продолжить","ui_neu":"Сначала","ui_kapitel":"Главы","ui_lesen":"Прочитать весь текст","k1_kicker":"Вопрос","k1_titel":"Кто едет первым?","k1_sub":"Перекрёсток. Ни светофора, ни знаков, ни полицейского.","k1_p1":"Три машины подъезжают одновременно. Все хотят ехать прямо.","k1_p2":"Кто может ехать первым?","k1_p3":"Ответ будет в конце. Для этого нужна идея: пирамида приоритета.","k2_kicker":"Порядок","k2_titel":"Пирамида приоритета","k2_intro":"Есть твёрдый порядок. Что выше, то главнее.","k2_vorrang":"Приоритет","s1_name":"Полиция","s1_text":"Сигналы и указания полиции главнее всех других правил, светофоров и знаков.","s1_plus":"Даже тогда нужно самому быть внимательным.","s2_name":"Светофор","s2_text":"Сигналы светофора главнее знаков приоритета и помехи справа.","s2_plus":"Даже на зелёный нужно быть внимательным.","s3_name":"Знаки","s3_text":"«Уступите дорогу», «Стоп», «Главная дорога»: где стоят эти знаки, помеха справа не действует.","s3_plus":"Их можно узнать по форме: треугольник, восьмиугольник, ромб.","s4_name":"Помеха справа","s4_text":"Если нет ничего выше: у того, кто едет справа, приоритет.","s4_plus":"Это действует на перекрёстках и примыканиях – это основа.","k2_merk":"Что выше, то побеждает.","k3_kicker":"Основное правило","k3_titel":"Помеха справа","k3_pill":"справа","k3_p1":"У того, кто едет справа, приоритет – на перекрёстках и примыканиях без знаков и светофора.","k3_p2":"Кто должен ждать, заранее замедляется. Так все видят: я жду.","k3_p3":"У машины справа приоритет. Другая машина ждёт.","k3_p4":"Ты едешь дальше, только когда не создаёшь другому опасность и существенно не мешаешь ему.","k3_p5":"Со встречного направления то же самое: и там приоритет у того, кто едет справа.","k3_p6":"Типичная ошибка: не посмотреть направо или просто вклиниться.","k3_merk":"Помеха справа действует, только если ничто более важное не говорит иное.","k4_kicker":"Встречное движение","k4_titel":"Поворот налево","k4_pill":"одновременно","k4_p1":"Заранее включить поворотник, занять место ближе к середине, посмотреть назад.","k4_p2":"Потом ты ждёшь: встречное движение имеет приоритет.","k4_p3":"Встречных, которые едут прямо: пропустить.","k4_p4":"И встречных, которые поворачивают направо: пропустить.","k4_p5":"Поворачиваешь, только когда никому не мешаешь и не создаёшь опасность.","k4_p6":"Два встречных, поворачивающих налево, как правило, поворачивают друг перед другом.","k4_p7":"Только если этого требуют обстановка или перекрёсток, они поворачивают друг за другом.","k4_merk":"Поворачивающие налево пропускают встречное движение.","k5_kicker":"Скорость 30","k5_titel":"Зона 30","k5_p1":"Знак 274.1: здесь начинается зона 30. Можно ехать не быстрее 30 км/ч.","k5_p2":"В зоне на перекрёстках по общему правилу действует помеха справа – чаще всего без знаков приоритета.","k5_p3":"Припаркованные машины закрывают обзор? Медленно продвигайся вперёд, пока не увидишь всё.","k5_p4":"Езжай медленно и будь готов затормозить – даже если у тебя приоритет.","k5_merk":"У того, кто едет справа, приоритет.","k6_kicker":"В конце","k6_titel":"Вернёмся к вопросу","k6_a1":"Машина справа в кадре едет первой: с её правой стороны никто не едет.","k6_a2":"Потом машина внизу: машины справа уже нет.","k6_a3":"Последней едет машина слева: и здесь машины справа уже нет.","k6_merk":"Что выше, то побеждает. Если нет ничего выше: помеха справа.","k6_b1":"Свои правила: круговое движение, выезд с прилегающей территории, полевая и лесная дорога.","k6_b2":"Если есть полиция, светофор или знаки, решают сначала они – а не помеха справа.","k6_b3":"Теперь практика: 3D-сцены в Fahr-Akademie показывают это с любого ракурса."},"sr":{"titel":"Prvenstvo prolaza – ko prolazi prvi?","ui_ueber":"Pregled: prvenstvo prolaza za 5 minuta","ui_intro":"Kratak film bez zvuka: sve piše na slici. Možeš da zaustaviš film ili da izabereš poglavlje kad god želiš.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Nastavi","ui_neu":"Od početka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Pitanje","k1_titel":"Ko prolazi prvi?","k1_sub":"Jedna raskrsnica. Bez semafora, bez znakova, bez policajca.","k1_p1":"Tri auta stižu istovremeno. Svi hoće pravo.","k1_p2":"Ko sme prvi?","k1_p3":"Odgovor stiže na kraju. Za to ti treba jedna ideja: piramida prvenstva prolaza.","k2_kicker":"Redosled","k2_titel":"Piramida prvenstva prolaza","k2_intro":"Postoji čvrst redosled. Ono što je više, ima prednost.","k2_vorrang":"Prednost","s1_name":"Policija","s1_text":"Znaci i naredbe policije važe ispred svih drugih pravila, semafora i znakova.","s1_plus":"Ni tada ne smeš da prestaneš da paziš.","s2_name":"Semafor","s2_text":"Svetlosni signali važe ispred znakova prvenstva prolaza i pravila desne strane.","s2_plus":"Pazi i na zeleno.","s3_name":"Znakovi","s3_text":"Ustupi prvenstvo prolaza, Stop, put sa prvenstvom prolaza: gde stoje ovi znakovi, pravilo desne strane ne važi.","s3_plus":"Prepoznaćeš ih po obliku: trougao, osmougao, romb.","s4_name":"Desna strana","s4_text":"Ako nema ničeg višeg: ko dolazi zdesna, ima prvenstvo prolaza.","s4_plus":"To važi na raskrsnicama i ulivanjima – to je osnova.","k2_merk":"Ono što je više, pobeđuje.","k3_kicker":"Osnovno pravilo","k3_titel":"Pravilo desne strane","k3_pill":"zdesna","k3_p1":"Ko dolazi zdesna, ima prvenstvo prolaza – na raskrsnicama i ulivanjima bez znakova i semafora.","k3_p2":"Ko mora da čeka, rano uspori. Tako svi vide: čekam.","k3_p3":"Auto zdesna ima prvenstvo prolaza. Drugi auto čeka.","k3_p4":"Nastavljaš tek kad drugog ne ugrožavaš niti bitno ometaš.","k3_p5":"Iz suprotnog smera važi isto: i tamo prvenstvo prolaza ima ko dolazi zdesna.","k3_p6":"Tipična greška: ne pogledati udesno ili se jednostavno ubaciti.","k3_merk":"Pravilo desne strane važi samo ako nijedno više pravilo ne kaže drugačije.","k4_kicker":"Vozila iz suprotnog smera","k4_titel":"Skretanje levo","k4_pill":"ispred drugog","k4_p1":"Na vreme uključi migavac, pređi na sredinu, pogledaj unazad.","k4_p2":"Zatim čekaš: vozila iz suprotnog smera imaju prednost.","k4_p3":"Vozilo iz suprotnog smera koje ide pravo: propusti ga.","k4_p4":"I vozilo iz suprotnog smera koje skreće desno: propusti ga.","k4_p5":"Skreneš tek kad nikoga ne ometaš niti ugrožavaš.","k4_p6":"Dva vozila iz suprotnih smerova koja skreću levo, u pravilu skreću ispred jedno drugog.","k4_p7":"Samo ako saobraćajna situacija ili raskrsnica to zahtevaju, skreću jedno iza drugog.","k4_merk":"Ko skreće levo, propušta vozila iz suprotnog smera.","k5_kicker":"Tempo 30","k5_titel":"Zona 30","k5_p1":"Znak 274.1: ovde počinje zona 30. Smeš da voziš najviše 30 km/h.","k5_p2":"U zoni na raskrsnicama u principu važi pravilo desne strane – najčešće bez znakova prvenstva prolaza.","k5_p3":"Parkirani auti ti zaklanjaju pogled? Polako se primiči dok ne vidiš sve.","k5_p4":"Vozi polako i budi spreman za kočenje – i kad imaš prvenstvo prolaza.","k5_merk":"Ko dolazi zdesna, ima prvenstvo prolaza.","k6_kicker":"Za kraj","k6_titel":"Nazad na pitanje","k6_a1":"Auto desno na slici prolazi prvi: sa njegove desne strane niko ne dolazi.","k6_a2":"Zatim auto dole: auto zdesna je otišao.","k6_a3":"Na kraju auto levo: i tu je auto zdesna otišao.","k6_merk":"Ono što je više, pobeđuje. Ako nema ničeg višeg: pravilo desne strane.","k6_b1":"Imaju svoja pravila: kružni tok, izlazak iz dvorišta, poljski i šumski put.","k6_b2":"Ako postoje policija, semafor ili znakovi, prvo oni odlučuju – ne pravilo desne strane.","k6_b3":"Sada vežbaj: 3D scene u Fahr-Akademie prikazuju to iz svakog ugla."},"ti":{"titel":"ቀዳምነት ምሕላፍ – መን ቅድም ይኸይድ?","ui_ueber":"ጽማቐ፦ ቀዳምነት ምሕላፍ ኣብ 5 ደቓይቕ","ui_intro":"ብዘይ ድምጺ ሓጺር ፊልሚ፦ ኩሉ ከም ጽሑፍ ኣብ ስእሊ ይርአ። ኣብ ዝኾነ እዋን ከተቋርጹ ወይ ክፍሊ ክትመርጹ ትኽእሉ።","ui_start":"ፊልሚ ጀምሩ","ui_pause":"ኣቋርጹ","ui_weiter":"ቀጽሉ","ui_neu":"ካብ መጀመርታ","ui_kapitel":"ክፍልታት","ui_lesen":"ኩሉ ጽሑፍ ኣንብቡ","k1_kicker":"እቲ ሕቶ","k1_titel":"መን ቅድም ይኸይድ?","k1_sub":"ሓንቲ መስቀላዊ መገዲ። መብራህቲ ትራፊክ የለን፣ ታቤላ የለን፣ ፖሊስ የለን።","k1_p1":"ሰለስተ ማካይን ብሓደ ግዜ ይበጽሓ። ኩለን ብቐጥታ ክኸዳ ይደልያ።","k1_p2":"መን ቅድም ክኸይድ ይፍቀደሉ?","k1_p3":"እቲ መልሲ ኣብ መወዳእታ ይመጽእ። ንሱ ክትርድእዎ ሓደ ሓሳብ የድልየኩም፦ ፒራሚድ ቀዳምነት ምሕላፍ።","k2_kicker":"እቲ ስርዓት","k2_titel":"ፒራሚድ ቀዳምነት ምሕላፍ","k2_intro":"ጽኑዕ ስርዓት ኣሎ። እቲ ልዕል ዝበለ ይቐድም።","k2_vorrang":"ቀዳምነት","s1_name":"ፖሊስ","s1_text":"ምልክታትን ትእዛዛትን ፖሊስ ኣብ ልዕሊ ኩሎም ካልኦት ሕግታት፣ መብራህቲ ትራፊክን ታቤላታትን ይቐድሙ።","s1_plus":"ሽዑ እውን ባዕልኹም ክትጥንቀቑ ኣለኩም።","s2_name":"መብራህቲ","s2_text":"መብራህቲ ትራፊክ ኣብ ልዕሊ ታቤላታት ቀዳምነት ምሕላፍን የማን ቅድሚ ጸጋምን ይቐድም።","s2_plus":"ኣብ ቀጠልያ እውን ክትጥንቀቑ ኣለኩም።","s3_name":"ታቤላታት","s3_text":"ቀዳምነት ሃቡ፣ ደው በሉ፣ ቀዳምነት ዘለዎ ጽርግያ፦ እዞም ታቤላታት ኣብ ዘለዉሉ የማን ቅድሚ ጸጋም ኣይሰርሕን።","s3_plus":"ብቅርጺኦም ትፈልጥዎም፦ ሰለስተ ኩርናዕ፣ ሸሞንተ ኩርናዕ፣ ኣልማዝ።","s4_name":"የማን ቅድሚ ጸጋም","s4_text":"ልዕሊኡ ዝኾነ ዘየለ እንተኾይኑ፦ እቲ ካብ የማን ዝመጽእ ቀዳምነት ምሕላፍ ኣለዎ።","s4_plus":"እዚ ኣብ መስቀላዊ መገድታትን መእተውቲ ጽርግያታትን ይሰርሕ – እዚ መሰረት እዩ።","k2_merk":"እቲ ልዕል ዝበለ ይዕወት።","k3_kicker":"እቲ መሰረታዊ ሕጊ","k3_titel":"የማን ቅድሚ ጸጋም","k3_pill":"ካብ የማን","k3_p1":"እቲ ካብ የማን ዝመጽእ ቀዳምነት ምሕላፍ ኣለዎ – ኣብ መስቀላዊ መገድታትን መእተውቲ ጽርግያታትን ብዘይ ታቤላታትን መብራህቲ ትራፊክን።","k3_p2":"እቲ ክጽበ ዘለዎ ቀደም ኢሉ ናህሪ የንክይ። ከምኡ ኩሉ ይርኣይ፦ ይጽበ ኣለኹ።","k3_p3":"እታ ካብ የማን ዝመጸት ማኪና ቀዳምነት ምሕላፍ ኣለዋ። እታ ካልእ ማኪና ትጽበ።","k3_p4":"ነቲ ካልእ ሓደጋ ኣብ ዘየእተዉን ብዓቢ መጠን ኣብ ዘይዕንቅፉን እዋን ጥራይ ኢኹም ትቕጽሉ።","k3_p5":"ካብ ኣንጻር ኣንፈት እውን ከምኡ እዩ፦ ኣብኡ እውን እቲ ካብ የማን ዝመጽእ ቀዳምነት ምሕላፍ ኣለዎ።","k3_p6":"ልሙድ ጌጋ፦ ናብ የማን ዘይምጥማት ወይ ብሓይሊ ቅድሚ ካልእ ምእታው።","k3_merk":"የማን ቅድሚ ጸጋም እቲ ልዕል ዝበለ ካልእ ዘይኣዘዘ እንተኾይኑ ጥራይ ይሰርሕ።","k4_kicker":"ካብ ቅድሚት ዝመጽእ ትራፊክ","k4_titel":"ንጸጋም ምጥዋይ","k4_pill":"ሓድሕደን","k4_p1":"ብግዜኡ ፍረቻ ሃቡ፣ ናብ ማእከል ተሰርዑ፣ ንድሕሪት ጠምቱ።","k4_p2":"ሽዑ ትጽበዩ፦ እቲ ካብ ቅድሚት ዝመጽእ ትራፊክ ይቐድም።","k4_p3":"ካብ ቅድሚት ብቐጥታ ዝመጽእ ትራፊክ፦ ኣሕልፍዎ።","k4_p4":"ንየማን ዝጥውይ ካብ ቅድሚት ዝመጽእ ትራፊክ እውን፦ ኣሕልፍዎ።","k4_p5":"ንዝኾነ ሰብ ክሳብ ዘይዕንቅፉን ሓደጋ ክሳብ ዘየእተዉን ጥራይ ኢኹም ትጥውዩ።","k4_p6":"ክልተ ካብ ኣንጻር ንጸጋም ዝጥውዩ ብልሙድ ሓድሕደን ይጥውዩ።","k4_p7":"ኩነታት ትራፊክ ወይ ቅርጺ መስቀላዊ መገዲ እንተጠለበ ጥራይ ሓደ ድሕሪ ሓደ ይጥውዩ።","k4_merk":"እቲ ንጸጋም ዝጥውይ ንካብ ቅድሚት ዝመጽእ ትራፊክ የሕልፎ።","k5_kicker":"ፍጥነት 30","k5_titel":"ዞና 30","k5_p1":"ምልክት 274.1፦ ኣብዚ ዞና 30 ይጅምር። ክሳብ 30 km/h ጥራይ ክትዝውሩ ትኽእሉ።","k5_p2":"ኣብ ዞና ኣብ መስቀላዊ መገድታት ብመሰረት የማን ቅድሚ ጸጋም ይሰርሕ – መብዛሕትኡ ግዜ ብዘይ ታቤላታት ቀዳምነት ምሕላፍ።","k5_p3":"ደው ዝበላ ማካይን ምርኣይኩም ይዕንቅፋ ዶ? ክሳብ ኩሉ ክትርእዩ ብቐስታ ቁሩብ ቁሩብ ቅረቡ።","k5_p4":"ብቐስታ ዝውሩ፣ ንፍረኖ ድሉዋት ኩኑ – ቀዳምነት ምሕላፍ እንተለኩም እውን።","k5_merk":"እቲ ካብ የማን ዝመጽእ ቀዳምነት ምሕላፍ ኣለዎ።","k6_kicker":"ኣብ መወዳእታ","k6_titel":"ናብቲ ሕቶ ምምላስ","k6_a1":"እታ ኣብ ስእሊ የማን ዘላ ማኪና ቅድም ትኸይድ፦ ካብ የማናይ ጎኒኣ ዝመጽእ የለን።","k6_a2":"ድሕሪኡ እታ ኣብ ታሕቲ ዘላ፦ እታ ካብ የማን ዝመጸት ማኪና ከይዳ።","k6_a3":"ኣብ መወዳእታ እታ ጸጋም ዘላ፦ ኣብዚ እውን እታ ካብ የማን ዝመጸት ማኪና ከይዳ።","k6_merk":"እቲ ልዕል ዝበለ ይዕወት። ልዕሊኡ ዘየለ እንተኾይኑ፦ የማን ቅድሚ ጸጋም።","k6_b1":"ናይ ርእሶም ሕግታት ዘለዎም፦ ሮቶንዳ፣ መውጽኢ ካብ ናይ ባዕሉ መሬት፣ መገዲ ግራትን ዱርን።","k6_b2":"ፖሊስ፣ መብራህቲ ትራፊክ ወይ ታቤላታት እንተሎ፣ ንሳቶም ቀዳምነት ይውስኑ – የማን ቅድሚ ጸጋም ኣይኮነን።","k6_b3":"ሕጂ ተለማመዱ፦ እቲ 3D ኩነታት ኣብ Fahr-Akademie ካብ ዝኾነ ኩርናዕ የርእዮ።"},"tr":{"titel":"İlk geçiş hakkı – kim önce geçer?","ui_ueber":"Genel bakış: 5 dakikada ilk geçiş hakkı","ui_intro":"Sessiz kısa bir film: Her şey görüntüde yazıyla yer alır. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"Devam","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"Soru","k1_titel":"Kim önce geçer?","k1_sub":"Bir kavşak. Trafik ışığı yok, levha yok, polis yok.","k1_p1":"Üç araç aynı anda geliyor. Hepsi düz gitmek istiyor.","k1_p2":"Kim önce geçebilir?","k1_p3":"Cevap en sonda. Bunun için bir fikir gerekli: ilk geçiş hakkı piramidi.","k2_kicker":"Sıralama","k2_titel":"İlk geçiş hakkı piramidi","k2_intro":"Sabit bir sıra var. Üstte olan önce gelir.","k2_vorrang":"Öncelik","s1_name":"Polis","s1_text":"Polisin işaret ve talimatları diğer tüm kuralların, trafik ışıklarının ve levhaların önündedir.","s1_plus":"O zaman bile kendin dikkat etmelisin.","s2_name":"Işıklar","s2_text":"Trafik ışıkları, ilk geçiş hakkı levhalarının ve sağdan gelenin önceliğinin önündedir.","s2_plus":"Yeşilde de dikkat etmelisin.","s3_name":"Levhalar","s3_text":"Yol ver, Dur, Ana yol: Bu levhaların olduğu yerde sağdan gelen öncelikli değildir.","s3_plus":"Onları şekilden tanırsın: üçgen, sekizgen, eşkenar dörtgen.","s4_name":"Sağdan gelen","s4_text":"Daha üstte bir şey yoksa: Sağdan gelenin ilk geçiş hakkı vardır.","s4_plus":"Bu, kavşaklarda ve yan yol ağızlarında geçerlidir – temel kuraldır.","k2_merk":"Üstte olan kazanır.","k3_kicker":"Temel kural","k3_titel":"Sağdan gelen önceliklidir","k3_pill":"sağdan","k3_p1":"Sağdan gelenin ilk geçiş hakkı vardır – levhasız ve trafik ışığı olmayan kavşaklarda ve yan yol ağızlarında.","k3_p2":"Bekleyecek olan erken yavaşlar. Böylece herkes görür: Ben bekliyorum.","k3_p3":"Sağdan gelen aracın ilk geçiş hakkı var. Diğer araç bekler.","k3_p4":"Ancak diğerini ne tehlikeye atmıyor ne de önemli ölçüde engelliyorsan devam edersin.","k3_p5":"Karşı yönden de aynısı geçerli: Orada da sağdan gelenin ilk geçiş hakkı vardır.","k3_p6":"Tipik hata: sağa bakmamak veya kendini öne atmak.","k3_merk":"Sağdan gelen, ancak daha üstte bir şey aksini söylemiyorsa önceliklidir.","k4_kicker":"Karşıdan gelen trafik","k4_titel":"Sola dönüş","k4_pill":"önlerinden","k4_p1":"Zamanında sinyal ver, ortaya yerleş, arkaya bak.","k4_p2":"Sonra beklersin: Karşıdan gelen trafiğin önceliği var.","k4_p3":"Düz giden karşıdan gelen trafik: geçir.","k4_p4":"Sağa dönen karşıdan gelen trafik de: geçir.","k4_p5":"Ancak kimseyi engellemediğinde veya tehlikeye atmadığında dönersin.","k4_p6":"Karşıdan gelen iki sola dönen araç, kural olarak birbirinin önünden döner.","k4_p7":"Yalnızca trafik durumu veya kavşak gerektiriyorsa art arda dönerler.","k4_merk":"Sola dönenler karşıdan gelen trafiği geçirir.","k5_kicker":"Tempo 30","k5_titel":"30 km/h bölgesi","k5_p1":"Levha 274.1: Burada 30 km/h bölgesi başlıyor. En fazla 30 km/h ile gidebilirsin.","k5_p2":"Bölgede kavşaklarda genel olarak sağdan gelen önceliklidir – çoğunlukla ilk geçiş hakkı levhası olmadan.","k5_p3":"Park etmiş araçlar görüşünü mü kapatıyor? Her yeri görene kadar yavaşça ilerle.","k5_p4":"Yavaş git ve frene hazır ol – ilk geçiş hakkın olsa bile.","k5_merk":"Sağdan gelenin ilk geçiş hakkı vardır.","k6_kicker":"Son olarak","k6_titel":"Soruya geri dönelim","k6_a1":"Görüntünün sağındaki araç önce geçer: Onun sağ tarafından kimse gelmiyor.","k6_a2":"Sonra alttaki araç: Sağdan gelen araç gitti.","k6_a3":"En son soldaki araç: Burada da sağdan gelen araç gitti.","k6_merk":"Üstte olan kazanır. Daha üstte bir şey yoksa: sağdan gelen önceliklidir.","k6_b1":"Kendi kuralları olanlar: dönel kavşak, özel mülk çıkışı, tarla ve orman yolu.","k6_b2":"Polis, trafik ışığı veya levha varsa önce onlar karar verir – sağdan gelen değil.","k6_b3":"Şimdi alıştırma yap: Fahr-Akademie'deki 3D sahneler bunu her açıdan gösterir."},"ur":{"titel":"پہلے گزرنے کا حق – پہلے کون جائے؟","ui_ueber":"خلاصہ: 5 منٹ میں پہلے گزرنے کا حق","ui_intro":"آواز کے بغیر ایک مختصر فلم: سب کچھ تصویر میں تحریر ہے۔ آپ جب چاہیں روک سکتے ہیں یا کوئی باب چن سکتے ہیں۔","ui_start":"فلم شروع کریں","ui_pause":"روکیں","ui_weiter":"جاری رکھیں","ui_neu":"شروع سے","ui_kapitel":"باب","ui_lesen":"پوری تحریر پڑھیں","k1_kicker":"سوال","k1_titel":"پہلے کون جائے؟","k1_sub":"ایک چوراہا۔ نہ سگنل، نہ نشان، نہ پولیس والا۔","k1_p1":"تین گاڑیاں ایک ساتھ پہنچتی ہیں۔ سب سیدھا جانا چاہتی ہیں۔","k1_p2":"پہلے کسے جانے کا حق ہے؟","k1_p3":"جواب آخر میں ملے گا۔ اس کے لیے ایک خیال چاہیے: پہلے گزرنے کے حق کا اہرام۔","k2_kicker":"ترتیب","k2_titel":"پہلے گزرنے کے حق کا اہرام","k2_intro":"ایک طے شدہ ترتیب ہے۔ جو اوپر ہے وہ پہلے۔","k2_vorrang":"ترجیح","s1_name":"پولیس","s1_text":"پولیس کے اشارے اور ہدایات باقی سب قاعدوں، سگنلوں اور نشانوں پر مقدم ہیں۔","s1_plus":"تب بھی آپ کو خود چوکس رہنا ہے۔","s2_name":"سگنل","s2_text":"سگنل کی روشنیاں پہلے گزرنے کے نشانوں اور دائیں والے کو پہلے سے مقدم ہیں۔","s2_plus":"سبز سگنل پر بھی چوکس رہیں۔","s3_name":"نشان","s3_text":"پہلے گزرنے کا حق دیں، رکیں، ترجیحی سڑک: جہاں یہ نشان ہوں وہاں دائیں والے کو پہلے لاگو نہیں ہوتا۔","s3_plus":"آپ انہیں شکل سے پہچانتے ہیں: تکون، آٹھ کونے، ہیرا۔","s4_name":"دائیں والا پہلے","s4_text":"اوپر کچھ نہ ہو تو: جو دائیں سے آئے اسے پہلے گزرنے کا حق ہے۔","s4_plus":"یہ چوراہوں اور جنکشنوں پر لاگو ہوتا ہے – یہی بنیاد ہے۔","k2_merk":"جو اوپر ہے وہ جیتتا ہے۔","k3_kicker":"بنیادی قاعدہ","k3_titel":"دائیں والے کو پہلے","k3_pill":"دائیں سے","k3_p1":"جو دائیں سے آئے اسے پہلے گزرنے کا حق ہے – نشان اور سگنل کے بغیر چوراہوں اور جنکشنوں پر۔","k3_p2":"جسے رکنا ہے وہ پہلے سے رفتار کم کرتا ہے۔ یوں سب دیکھ لیتے ہیں: میں رک رہا ہوں۔","k3_p3":"دائیں سے آنے والی گاڑی کو پہلے گزرنے کا حق ہے۔ دوسری گاڑی رکتی ہے۔","k3_p4":"آپ تبھی آگے بڑھیں جب آپ دوسرے کو نہ خطرے میں ڈالیں نہ اس کا راستہ نمایاں طور پر روکیں۔","k3_p5":"سامنے والی سمت سے بھی یہی ہے: وہاں بھی جو دائیں سے آئے اسے پہلے گزرنے کا حق ہے۔","k3_p6":"عام غلطی: دائیں طرف نہ دیکھنا یا زبردستی آگے نکل جانا۔","k3_merk":"دائیں والے کو پہلے تبھی لاگو ہے جب اوپر کا کوئی قاعدہ کچھ اور نہ کہے۔","k4_kicker":"سامنے سے آنے والی ٹریفک","k4_titel":"بائیں مڑنا","k4_pill":"ایک دوسرے کے آگے","k4_p1":"وقت پر انڈیکیٹر دیں، درمیان کی طرف آئیں، پیچھے دیکھیں۔","k4_p2":"پھر آپ رکتے ہیں: سامنے سے آنے والی ٹریفک کو ترجیح ہے۔","k4_p3":"سامنے سے سیدھی آنے والی ٹریفک: گزرنے دیں۔","k4_p4":"سامنے سے دائیں مڑنے والی ٹریفک کو بھی: گزرنے دیں۔","k4_p5":"صرف تب مڑیں جب آپ کسی کو نہ روکیں اور نہ خطرے میں ڈالیں۔","k4_p6":"سامنے سے آنے والے بائیں مڑنے والے دو، عام طور پر ایک دوسرے کے آگے سے مڑتے ہیں۔","k4_p7":"صرف جب ٹریفک کی صورتحال یا چوراہا تقاضا کرے، تو وہ ایک کے پیچھے ایک مڑتے ہیں۔","k4_merk":"بائیں مڑنے والے سامنے کی ٹریفک کو گزرنے دیتے ہیں۔","k5_kicker":"رفتار 30","k5_titel":"30 زون","k5_p1":"نشان 274.1: یہاں 30 کا زون شروع ہوتا ہے۔ آپ زیادہ سے زیادہ 30 km/h چلا سکتے ہیں۔","k5_p2":"زون میں چوراہوں پر بنیادی طور پر دائیں والے کو پہلے لاگو ہے – اکثر پہلے گزرنے کے نشانوں کے بغیر۔","k5_p3":"کھڑی گاڑیاں نظر روکتی ہیں؟ آہستہ آہستہ آگے بڑھیں، یہاں تک کہ سب کچھ نظر آ جائے۔","k5_p4":"آہستہ چلیں اور بریک کے لیے تیار رہیں – پہلے گزرنے کا حق ہو تب بھی۔","k5_merk":"جو دائیں سے آئے اسے پہلے گزرنے کا حق ہے۔","k6_kicker":"آخر میں","k6_titel":"سوال کی طرف واپس","k6_a1":"تصویر میں دائیں طرف کی گاڑی پہلے جاتی ہے: اس کے دائیں طرف سے کوئی نہیں آ رہا۔","k6_a2":"پھر نیچے والی گاڑی: دائیں سے آنے والی گاڑی جا چکی ہے۔","k6_a3":"آخر میں بائیں طرف کی گاڑی: یہاں بھی دائیں سے آنے والی گاڑی جا چکی ہے۔","k6_merk":"جو اوپر ہے وہ جیتتا ہے۔ اوپر کچھ نہ ہو تو: دائیں والے کو پہلے۔","k6_b1":"اپنے الگ قاعدے ہیں: راؤنڈ اباؤٹ، گھر یا احاطے سے نکلنے کا راستہ، کھیت اور جنگل کا راستہ۔","k6_b2":"پولیس، سگنل یا نشان ہوں تو پہلے وہ فیصلہ کرتے ہیں – دائیں والا پہلے نہیں۔","k6_b3":"اب مشق کریں: Fahr-Akademie کے 3D مناظر اسے ہر زاویے سے دکھاتے ہیں۔"},"vi":{"titel":"Quyền ưu tiên – ai đi trước?","ui_ueber":"Tổng quan: quyền ưu tiên trong 5 phút","ui_intro":"Một phim ngắn không tiếng: mọi thứ hiện bằng chữ trên hình. Bạn có thể dừng bất cứ lúc nào hoặc chọn một chương.","ui_start":"Bắt đầu phim","ui_pause":"Tạm dừng","ui_weiter":"Tiếp tục","ui_neu":"Xem lại từ đầu","ui_kapitel":"Chương","ui_lesen":"Đọc toàn bộ văn bản","k1_kicker":"Câu hỏi","k1_titel":"Ai đi trước?","k1_sub":"Một giao lộ. Không đèn giao thông, không biển báo, không cảnh sát.","k1_p1":"Ba xe đến cùng lúc. Tất cả đều muốn đi thẳng.","k1_p2":"Ai được đi trước?","k1_p3":"Câu trả lời ở cuối phim. Để hiểu, bạn cần một ý tưởng: kim tự tháp quyền ưu tiên.","k2_kicker":"Thứ tự","k2_titel":"Kim tự tháp quyền ưu tiên","k2_intro":"Có một thứ tự cố định. Cái nào cao hơn thì được ưu tiên trước.","k2_vorrang":"Ưu tiên","s1_name":"Cảnh sát","s1_text":"Tín hiệu và chỉ dẫn của cảnh sát được ưu tiên hơn mọi quy tắc, đèn giao thông và biển báo khác.","s1_plus":"Dù vậy, bạn vẫn phải tự chú ý.","s2_name":"Đèn","s2_text":"Đèn giao thông được ưu tiên hơn biển quyền ưu tiên và quy tắc bên phải được ưu tiên.","s2_plus":"Ngay cả khi đèn xanh, bạn vẫn phải chú ý.","s3_name":"Biển báo","s3_text":"Nhường đường, Dừng, Đường ưu tiên: nơi có các biển này thì bên phải được ưu tiên không áp dụng.","s3_plus":"Bạn nhận ra chúng qua hình dạng: tam giác, bát giác, hình thoi.","s4_name":"Bên phải ưu tiên","s4_text":"Không có gì cao hơn: xe đến từ bên phải có quyền ưu tiên.","s4_plus":"Quy tắc này áp dụng ở giao lộ và ngã ba – đây là nền tảng.","k2_merk":"Cái nào cao hơn thì thắng.","k3_kicker":"Quy tắc cơ bản","k3_titel":"Bên phải được ưu tiên","k3_pill":"từ bên phải","k3_p1":"Xe đến từ bên phải có quyền ưu tiên – ở giao lộ và ngã ba không có biển báo và đèn giao thông.","k3_p2":"Ai phải chờ thì giảm tốc sớm. Như vậy ai cũng thấy: tôi đang chờ.","k3_p3":"Xe từ bên phải có quyền ưu tiên. Xe kia chờ.","k3_p4":"Bạn chỉ đi tiếp khi không gây nguy hiểm cho người khác và không cản trở họ đáng kể.","k3_p5":"Từ hướng ngược lại cũng vậy: ở đó xe đến từ bên phải cũng có quyền ưu tiên.","k3_p6":"Lỗi thường gặp: không nhìn sang phải hoặc cứ thế chen lên trước.","k3_merk":"Bên phải được ưu tiên chỉ áp dụng khi không có gì cao hơn quy định khác.","k4_kicker":"Xe ngược chiều","k4_titel":"Rẽ trái","k4_pill":"rẽ phía trước nhau","k4_p1":"Bật xi nhan kịp thời, vào làn giữa, quan sát phía sau.","k4_p2":"Rồi bạn chờ: xe ngược chiều được ưu tiên.","k4_p3":"Xe ngược chiều đi thẳng: nhường cho đi qua.","k4_p4":"Xe ngược chiều rẽ phải cũng vậy: nhường cho đi qua.","k4_p5":"Chỉ khi không cản trở hay gây nguy hiểm cho ai, bạn mới rẽ.","k4_p6":"Hai xe rẽ trái từ hai phía đối diện thường rẽ phía trước nhau.","k4_p7":"Chỉ khi tình hình giao thông hoặc giao lộ đòi hỏi, họ mới rẽ nối đuôi nhau.","k4_merk":"Xe rẽ trái nhường đường cho xe ngược chiều.","k5_kicker":"Tốc độ 30","k5_titel":"Khu vực tốc độ 30","k5_p1":"Biển 274.1: tại đây bắt đầu khu vực tốc độ 30. Bạn được chạy tối đa 30 km/h.","k5_p2":"Trong khu vực này, ở giao lộ về nguyên tắc áp dụng bên phải được ưu tiên – hầu như không có biển quyền ưu tiên.","k5_p3":"Xe đỗ che khuất tầm nhìn? Hãy từ từ nhích vào cho đến khi nhìn thấy mọi thứ.","k5_p4":"Chạy chậm và sẵn sàng phanh – kể cả khi bạn có quyền ưu tiên.","k5_merk":"Xe đến từ bên phải có quyền ưu tiên.","k6_kicker":"Kết thúc","k6_titel":"Quay lại câu hỏi","k6_a1":"Xe bên phải trong hình đi trước: từ bên phải của nó không có xe nào đến.","k6_a2":"Rồi đến xe phía dưới: xe từ bên phải đã đi rồi.","k6_a3":"Cuối cùng là xe bên trái: ở đây xe từ bên phải cũng đã đi rồi.","k6_merk":"Cái nào cao hơn thì thắng. Không có gì cao hơn: bên phải được ưu tiên.","k6_b1":"Có quy tắc riêng: vòng xuyến, lối ra khỏi lô đất, đường làm ruộng và đường rừng.","k6_b2":"Nếu có cảnh sát, đèn giao thông hoặc biển báo thì họ quyết định trước – không phải bên phải được ưu tiên.","k6_b3":"Giờ hãy luyện tập: các cảnh 3D trong Fahr-Akademie cho bạn thấy từ mọi góc nhìn."}};
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
      const st = stageBase(sc, { noRoad: true }); st.style.background = "#EBEFE8";
      const p = panel(sc, ch, i);
      const widths = [300, 460, 620, 780, 940], fills = ["#1F5A41", "#2E7D5B", "#9CBF9F", "#E8A33D"], cols = ["#F5F6F3", "#F5F6F3", "#1E241F", "#1E241F"];
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
        g.innerHTML = `<div class="shape" style="background:#D3DBD2;clip-path:polygon(${poly})"></div>`;
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
const BARLOW_SPRACHEN = ["ar", "ckb", "ur", "hi", "fa", "ps", "el", "am", "ti"];   // Playfair hat diese Schriften nicht
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

  const wurzel = el("section", "vf" + (rtl ? " vf-rtl" : "") + (BARLOW_SPRACHEN.indexOf(lang) >= 0 ? " vf-barlow" : "")); wurzel.lang = lang;
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
