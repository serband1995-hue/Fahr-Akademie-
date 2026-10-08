/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/f5-1/*).
   Erklärfilm „f5-1“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ".lk .stagewrap{position:relative;}\n.lk .stage{position:absolute; left:0; top:0; width:1080px; height:1080px; overflow:hidden; background:#434B45; direction:ltr;}\n.lk .stage > *{position:absolute;}\n.lk .pill{padding:10px 28px; border-radius:42px; background:#FAF6EC; color:#2F4A34; border:3px solid var(--lk-gold,#D9954C); font:700 44px/1.15 var(--lk-text,'Barlow',sans-serif); text-align:center; max-width:560px; box-shadow:0 5px 12px rgba(0,0,0,.35);}\n.lk .pill.klein{font-size:38px; padding:6px 20px;}\n.lk .lkw-pill{max-width:520px; text-wrap:balance;}\n.lk-rtl .pill{direction:rtl;}\n.lk .panel .kicker{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#8F5A14;}\n.lk .panel .ttl{font-family:var(--lk-titel,'Playfair Display',serif); font-weight:700; color:#2F4A34;}\n.lk .panel .sub{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857; opacity:0;}\n.lk .pts{display:grid;}\n.lk .pts > *{grid-area:1 / 1; align-self:start; opacity:0;}\n.lk .pt .tx{text-wrap:balance; font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; color:#2B2A22;}\n.lk .pt.gold .tx{color:#8F5A14;}\n.lk .pt .rf{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857;}\n.lk .merk{background:#2F4A34; color:#FAF6EC; border-left:12px solid #D9954C; border-radius:6px 18px 18px 6px; font-family:var(--lk-titel,'Playfair Display',serif); font-weight:600; box-shadow:0 10px 24px rgba(43,42,34,.25);}\n\n/* Erklärfilme „Lkw und Zug verstehen“ in der App: Bild oben, Text darunter, Steuerung darunter (keine Knöpfe auf dem Bild).\n   Handy zuerst (360–412 px). Ab ~660 px Breite (Querformat/Tablet) steht der Text neben dem Bild. */\n.lk { --lk-titel:var(--ff-titel,'Playfair Display',Georgia,serif); --lk-text:var(--ff-body,'Barlow',sans-serif); --lk-gold:var(--gold,#D9954C); margin:var(--sp-m,12px) 0 var(--sp-l,18px); }\n.lk-kopf { font-family:var(--lk-titel); font-weight:600; font-size:19px; margin:0 0 4px; }\n.lk-intro { color:var(--muted,#6F6857); font-size:14.5px; line-height:1.45; margin:0 0 10px; }\n.lk-kasten { background:var(--surface,#EEE6D3); border:1px solid var(--border,rgba(43,40,30,.16)); border-radius:var(--r-l,16px); padding:10px; overflow:hidden; }\n.lk-szenen { display:grid; position:relative; }\n.lk-szenen .scene { grid-area:1 / 1; display:flex; flex-direction:column; gap:12px; min-width:0; pointer-events:none; direction:ltr; }\n.lk-szenen .stagewrap { width:100%; aspect-ratio:1 / 1; border-radius:var(--r-m,12px); overflow:hidden; flex:none; background:#434B45; }\n.lk-szenen .stage { transform-origin:0 0; transform:scale(var(--lk-s,.3)); }\n.lk-szenen .panel { min-width:0; padding:2px 4px 4px; }\n.lk-szenen .dots, .lk-szenen .foot { display:none; }\n.lk-szenen .kicker { font-size:12.5px; line-height:1.3; letter-spacing:.12em; }\n.lk-szenen .ttl { font-size:24px; line-height:1.15; margin:4px 0 0; }\n.lk-szenen .sub { font-size:16px; line-height:1.4; margin-top:8px; }\n.lk-szenen .pts { margin-top:12px; }\n.lk-szenen .pt .tx { font-size:18px; line-height:1.42; }\n.lk-szenen .pt .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .step .nr { font-size:36px; }\n.lk-szenen .step .nm { font-size:22px; line-height:1.2; margin-top:2px; }\n.lk-szenen .step .tx { font-size:17px; line-height:1.42; margin-top:8px; }\n.lk-szenen .step .px { font-size:15px; line-height:1.4; margin-top:8px; }\n.lk-szenen .step .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .merk { padding:14px 16px; font-size:20px; line-height:1.3; border-left-width:8px; }\n.lk-breit .lk-szenen .scene { flex-direction:row; align-items:flex-start; gap:20px; }\n.lk-breit .lk-szenen .stagewrap { flex:0 0 46%; }\n.lk-breit .lk-szenen .panel { flex:1; }\n.lk-rtl .lk-szenen .panel, .lk-rtl .lk-text, .lk-rtl .lk-intro, .lk-rtl .lk-kopf { direction:rtl; text-align:right; }\n.lk-steuer { display:flex; flex-direction:column; gap:10px; margin-top:12px; }\n.lk-reihe { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }\n.lk-knopf { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:600 15px/1.2 var(--lk-text); display:inline-flex; align-items:center; gap:8px; cursor:pointer; }\n.lk-knopf svg { width:18px; height:18px; flex:none; fill:currentColor; }\n.lk-play { background:var(--lk-gold); color:var(--auf-gold,#2B2A22); border-color:transparent; }\n.lk-zeit { margin-inline-start:auto; font-size:13px; color:var(--muted,#6F6857); font-variant-numeric:tabular-nums; direction:ltr; }\n.lk-regler { width:100%; height:28px; margin:0; accent-color:var(--gold-text,#8F5A14); direction:ltr; }\n.lk-kapitel { display:grid; grid-template-columns:repeat(auto-fit,minmax(40px,1fr)); gap:4px; direction:ltr; }   /* 7 Kapitel müssen bei 360 px in eine Zeile passen, sonst wickeln sie um */\n.lk-kap { min-width:0; min-height:44px; border-radius:12px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:700 15px/1 var(--lk-text); cursor:pointer; }\n.lk-kap[aria-current=\"true\"] { background:var(--gruen,#2F4A34); color:var(--auf-tief,#fff); border-color:transparent; }\n.lk-knopf:focus-visible, .lk-kap:focus-visible, .lk-regler:focus-visible, .lk-text summary:focus-visible { outline:3px solid var(--gold-text,#8F5A14); outline-offset:2px; }\n.lk-text { margin-top:12px; font-size:15px; line-height:1.5; }\n.lk-text summary { min-height:44px; display:flex; align-items:center; cursor:pointer; font-weight:600; }\n.lk-text h3 { font-family:var(--lk-titel); font-size:16px; margin:14px 0 4px; }\n.lk-text p { margin:0 0 6px; }\n.lk-text .lk-ref { color:var(--muted,#6F6857); font-size:13px; }\n@media (prefers-reduced-motion: reduce) { .lk-szenen .stage { transition:none; } }\n/* Paragrafen-Verweise nie verdrehen (RTL-Sprachen), Regel 8 der Sprachen-Notiz */\n.lk-szenen .rf, .lk-szenen .step .rf, .lk-text .lk-ref { unicode-bidi:plaintext; }\n/* Schriften ohne Playfair-Zeichen (ar, ckb, ur, hi, fa, ps, el, am, ti): Überschriften in Barlow, mehr Zeilenhöhe */\n.lk-barlow { --lk-titel:var(--ff-body,'Barlow',sans-serif); }\n.lk-barlow .ttl, .lk-barlow .nm, .lk-barlow .merk, .lk-barlow .bigcard, .lk-barlow .lk-kopf, .lk-barlow .lk-text h3 { font-weight:700; }\n.lk[lang=\"ur\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ur\"] .lk-text, .lk[lang=\"ur\"] .lk-intro { line-height:1.7; }\n.lk[lang=\"ps\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ps\"] .lk-text, .lk[lang=\"ps\"] .lk-intro { line-height:1.55; }\n";
// ---- kern/modell.js ----
(function (window) {
/* Rechenmodell „Lkw und Zug“ (Kinematik, Draufsicht). EINE Quelle für Film UND Test: Bewegungen werden gerechnet, nicht gezeichnet.
   Läuft im Browser (window.LKW_MODELL) und in Node (module.exports).

   Koordinaten in Metern: x nach Osten, y nach Süden (wie am Bildschirm), Winkel 0 = Osten, positiv = im Uhrzeigersinn (Rechtskurve = Winkel wächst).
   Rechtsverkehr: Bei Fahrt nach Osten liegt rechts = Süden (+y). Fahrerseite (links) = −y im Fahrzeugsystem.

   Modell (langsame Fahrt, kein Reifenschlupf, „Verfolgerkette“):
   - Die gelenkte Vorderachse (Mitte) F läuft genau auf der vorgegebenen Bahn.
   - Jede weitere Achse/Kupplung ist durch eine starre Strecke mit dem Vorderglied verbunden und läuft dem Vorderglied hinterher:
       Hinterachse A       folgt F   im Abstand L (Radstand)
       Kupplungspunkt K    liegt auf der Längsachse des Zugfahrzeugs im Abstand e von A (e > 0 vor, e < 0 hinter der Hinterachse)
       Anhängerachse T     folgt K   im Abstand D
   - Stationär (Kreisfahrt) ergibt das die bekannten Formeln: R_A = √(R_F² − L²), R_K = √(R_A² + e²), R_T = √(R_K² − D²).
   Quelle der Formeln: Vault „Recherche C-CE – Fahrdynamik und Grundfahraufgaben“ 2.3 (eigene Herleitung, Standard-Kinematik).
   Alle Fahrzeugmaße sind BEISPIELWERTE (Annahmen), keine Daten eines bestimmten Fahrzeugs. */
(function (root) {
  "use strict";
  const PI = Math.PI;

  /* ---------- Beispiel-Fahrzeuge (Meter) ----------
     breite  Fahrzeugbreite (Gesetz: höchstens 2,55 m, § 32 Abs. 1 StVZO)
     L       Radstand (Vorderachse – Hinterachse)
     vorn    Überhang vor der Vorderachse
     hinten  Überhang hinter der Hinterachse
     e       Lage des Kupplungspunkts relativ zur Hinterachse (+ vor, − hinter)
     D       Abstand Kupplungspunkt – Mitte der Anhängerachsen
     anh     { vorn, hinten }: Aufbau des Anhängers vor bzw. hinter der Achsmitte (vorn gemessen von der Achsmitte nach vorn)
     Gesamtlängen werden im Test gegen § 32 Abs. 3, 4 StVZO geprüft (Sattelzug ≤ 15,50 m; Lastzug 17,60 m liegt unter der einfachen Grenze 18,00 m, die 18,75 m gelten nur mit Ladeflächen-Teillängen). */
  const FAHRZEUGE = {
    solo: { id: "solo", breite: 2.55, L: 4.8, vorn: 1.4, hinten: 2.2, anh: null },
    lastzug: {
      id: "lastzug", breite: 2.55, L: 4.8, vorn: 1.4, hinten: 2.2,
      e: -2.3, D: 5.4,                       // starre Deichsel (Zentralachse), Anhängerachsen als Gruppe in der Mitte
      anh: { typ: "zentral", vorn: 3.8, hinten: 3.7 }   // Aufbau 7,5 m lang, Deichsel 1,6 m davor
    },
    sattelzug: {
      id: "sattelzug", breite: 2.55, L: 3.7, vorn: 1.4, hinten: 1.2,
      e: 0.55, D: 7.6,                       // Sattelvormaß 0,55 m, Königszapfen bis Achsmitte 7,60 m (Folie CE, Rechenbeispiel)
      anh: { typ: "sattel", vorn: 9.15, hinten: 3.3 }   // Aufbau beginnt 1,55 m vor dem Zapfen
    }
  };

  /* ---------- Bahn der Vorderachse ----------
     Segmente: { gerade: Länge } | { bogen: Radius, winkel: Bogenmaß, rechts: true|false }.
     Start bei (0,0) mit Richtung 0 (Osten). Für s < 0 wird die erste Gerade nach hinten verlängert. */
  function bahn(segmente) {
    const teile = []; let x = 0, y = 0, h = 0, s0 = 0;
    segmente.forEach(function (sg) {
      if (sg.gerade != null) {
        teile.push({ art: "g", s0: s0, len: sg.gerade, x: x, y: y, h: h });
        x += Math.cos(h) * sg.gerade; y += Math.sin(h) * sg.gerade; s0 += sg.gerade;
      } else {
        const R = sg.bogen, dir = sg.rechts === false ? -1 : 1, len = R * sg.winkel;
        // Mittelpunkt: rechts der Fahrtrichtung (Rechtskurve) = Richtung h + 90° bei „y nach unten“
        const cx = x + Math.cos(h + dir * PI / 2) * R, cy = y + Math.sin(h + dir * PI / 2) * R;
        teile.push({ art: "b", s0: s0, len: len, x: x, y: y, h: h, R: R, dir: dir, cx: cx, cy: cy });
        h += dir * sg.winkel;
        x = cx + Math.cos(h - dir * PI / 2) * R; y = cy + Math.sin(h - dir * PI / 2) * R; s0 += len;
      }
    });
    const gesamt = s0;
    function punkt(s) {
      if (s <= 0) { const t = teile[0]; return { x: t.x + Math.cos(t.h) * s, y: t.y + Math.sin(t.h) * s, h: t.h }; }
      if (s >= gesamt) {   // nach dem Ende gerade weiter
        const t = teile[teile.length - 1], e = punktIn(t, t.len), d = s - gesamt;
        return { x: e.x + Math.cos(e.h) * d, y: e.y + Math.sin(e.h) * d, h: e.h };
      }
      let i = 0; while (i < teile.length - 1 && s >= teile[i + 1].s0) i++;
      return punktIn(teile[i], s - teile[i].s0);
    }
    function punktIn(t, d) {
      if (t.art === "g") return { x: t.x + Math.cos(t.h) * d, y: t.y + Math.sin(t.h) * d, h: t.h };
      const w = t.h + t.dir * d / t.R;
      return { x: t.cx + Math.cos(w - t.dir * PI / 2) * t.R, y: t.cy + Math.sin(w - t.dir * PI / 2) * t.R, h: w };
    }
    return { punkt: punkt, laenge: gesamt, teile: teile };
  }

  /* ---------- Simulation ----------
     Gibt für jeden Schritt (ds Meter Vorderachsweg) die Lage aller Punkte zurück.
     Anfangszustand: alles gerade hinter der Vorderachse (stationäre Gerade), dann Verfolgerkette.
     Zustand z: { s, F:{x,y,h(Bahnrichtung)}, A, hz (Richtung Zugfahrzeug), K, T, ha (Richtung Anhänger) }. */
  function simuliere(fz, b, sStart, sEnde, ds, fuehrung) {
    ds = ds || 0.02;
    const ecke = fuehrung === "ecke";     // „ecke“: die Bahn führt die äußerste vordere Ecke (so verlangt es § 32d Abs. 1 Satz 2), sonst die Vorderachse
    const n = Math.round((sEnde - sStart) / ds);
    const P0 = b.punkt(sStart), u0 = { x: Math.cos(P0.h), y: Math.sin(P0.h) };
    // Anfangszustand: alles gerade in Richtung der ersten Geraden
    let F = ecke ? versetzt(P0, 0, fz) : { x: P0.x, y: P0.y };
    let A = { x: F.x - u0.x * fz.L, y: F.y - u0.y * fz.L };
    let K = null, T = null;
    if (fz.anh) {
      K = { x: A.x + u0.x * fz.e, y: A.y + u0.y * fz.e };
      T = { x: K.x - u0.x * fz.D, y: K.y - u0.y * fz.D };
    }
    let hz = P0.h, Fvor = { x: F.x, y: F.y };
    const zust = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      const s = sStart + i * ds, P = b.punkt(s);
      if (i > 0) {
        if (ecke) {                         // Vorderachse so setzen, dass die Ecke auf der Bahn bleibt (zwei Verbesserungsschritte)
          for (let k = 0; k < 3; k++) { F = versetzt(P, hz, fz); const a2 = folge(F, A, fz.L); hz = Math.atan2(F.y - a2.y, F.x - a2.x); }
        } else F = { x: P.x, y: P.y };
        A = folge(F, A, fz.L);
        hz = Math.atan2(F.y - A.y, F.x - A.x);
        if (fz.anh) {
          K = { x: A.x + Math.cos(hz) * fz.e, y: A.y + Math.sin(hz) * fz.e };
          T = folge(K, T, fz.D);
        }
      }
      // Richtung der Vorderräder = Richtung, in die sich die Vorderachse bewegt (bei Eckenführung aus der Bewegung gerechnet)
      const vh = ecke ? (i > 0 ? Math.atan2(F.y - Fvor.y, F.x - Fvor.x) : hz) : P.h; Fvor = { x: F.x, y: F.y };
      const z = { s: s, F: { x: F.x, y: F.y, h: vh }, A: { x: A.x, y: A.y }, hz: hz };
      if (fz.anh) { z.K = { x: K.x, y: K.y }; z.T = { x: T.x, y: T.y }; z.ha = Math.atan2(K.y - T.y, K.x - T.x); }
      zust[i] = z;
    }
    return { fz: fz, ds: ds, sStart: sStart, zustaende: zust, bei: function (s) { const i = Math.max(0, Math.min(n, Math.round((s - sStart) / ds))); return zust[i]; } };
  }
  // Vorderachse aus der Lage der äußersten vorderen Ecke (Rechtskurve: äußere Seite = links): Ecke = F + Drehung(hz)·(vorn, −breite/2)
  function versetzt(P, hz, fz) {
    const c = Math.cos(hz), s = Math.sin(hz);
    return { x: P.x - (c * fz.vorn + s * fz.breite / 2), y: P.y - (s * fz.vorn - c * fz.breite / 2) };
  }
  // Nachläufer: bleibt im festen Abstand d hinter dem Vorderpunkt p, auf der Verbindungslinie zu seiner alten Lage
  function folge(p, alt, d) {
    const dx = alt.x - p.x, dy = alt.y - p.y, l = Math.hypot(dx, dy) || 1;
    return { x: p.x + dx / l * d, y: p.y + dy / l * d };
  }

  /* ---------- Körper (für Zeichnung und Messung) ---------- */
  // Rechteck in Fahrzeugkoordinaten (x nach vorn, y nach rechts) -> Weltkoordinaten
  function rechteck(o, h, x0, x1, y0, y1) {
    const c = Math.cos(h), s = Math.sin(h);
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return { x: o.x + c * p[0] - s * p[1], y: o.y + s * p[0] + c * p[1] }; });
  }
  // Umrisse der tragenden Körper eines Zustands: Zugfahrzeug (Ursprung Hinterachse) und Anhänger/Auflieger (Ursprung Anhängerachse)
  function koerper(fz, z) {
    const b2 = fz.breite / 2, teile = [];
    teile.push({ name: "zug", poly: rechteck(z.A, z.hz, -fz.hinten, fz.L + fz.vorn, -b2, b2) });
    if (fz.anh) teile.push({ name: "anh", poly: rechteck(z.T, z.ha, -fz.anh.hinten, fz.anh.vorn, -b2, b2) });
    return teile;
  }

  /* ---------- Messungen (werden im Test und für Hinweise im Film benutzt) ---------- */
  // Signierter Abstand eines Punkts von einer Linie (Punkt p0, Richtung h0): positiv = links der Linie (bei Osten: Norden = −y)
  function abstandLinks(p, p0, h0) { return (-(p.x - p0.x) * Math.sin(h0) + (p.y - p0.y) * Math.cos(h0)) * -1; }
  function eckpunkte(fz, z) { const r = []; koerper(fz, z).forEach(function (k) { k.poly.forEach(function (p) { r.push(p); }); }); return r; }
  // Wie weit ragt irgendein Eckpunkt über die Gerade g (Punkt p0, Richtung h0) nach LINKS hinaus (links = Kurvenaußenseite bei Rechtskurve)?
  function maxUeberschnitt(sim, p0, h0, sBis) {
    let m = -1e9;
    sim.zustaende.forEach(function (z) {
      if (z.s > sBis) return;
      eckpunkte(sim.fz, z).forEach(function (p) { const d = abstandLinks(p, p0, h0); if (d > m) m = d; });
    });
    return m;
  }
  // Länge des Zuges (Meter), gemessen von der vordersten bis zur hintersten Ecke bei Geradeausfahrt
  function gesamtLaenge(fz) {
    if (!fz.anh) return fz.vorn + fz.L + fz.hinten;
    // vorderste Ecke -> Vorderachse (vorn) -> Kupplungspunkt (L − e) -> Anhängerachse (D) -> Ende des Aufbaus
    return fz.vorn + (fz.L - fz.e) + fz.D + fz.anh.hinten;
  }
  // Stationäre Radien einer Kreisfahrt, wenn die Vorderachse auf Radius RF läuft
  function radien(fz, RF) {
    const A = Math.sqrt(RF * RF - fz.L * fz.L), r = { F: RF, A: A };
    if (fz.anh) { r.K = Math.sqrt(A * A + fz.e * fz.e); r.T = Math.sqrt(r.K * r.K - fz.D * fz.D); }
    return r;
  }
  // Radius der Vorderachse, bei dem die äußerste vordere Ecke genau auf dem Kreis Raußen läuft (§ 32d Abs. 1 Satz 2).
  // Die Ecke liegt (L + vorn) vor und breite/2 neben der Hinterachse, deren Mittelpunkt auf der Hinterachslinie liegt: (R_A + b/2)² + (L + vorn)² = Raußen²
  function vorderachsRadius(fz, Raussen) { const RA = Math.sqrt(Raussen * Raussen - (fz.L + fz.vorn) * (fz.L + fz.vorn)) - fz.breite / 2; return Math.sqrt(RA * RA + fz.L * fz.L); }
  // Innerster Radius des Fahrzeugs (innere Ecke der letzten Achse) bei Kreisfahrt
  function innenRadius(fz, RF) { const r = radien(fz, RF); return (fz.anh ? r.T : r.A) - fz.breite / 2; }


  /* ---------- Folgefahrt (Abstand, Seitenansicht) ----------
     Ein Pkw bremst plötzlich bis zum Stand, der Lkw dahinter reagiert nach „reaktion“ Sekunden und bremst mit „aHinten“.
     Alle Werte sind BEISPIELWERTE (keine Aussage über Anhaltewege; Zahlen kommen im Film nicht vor):
     v0 Anfangsgeschwindigkeit m/s, luecke Abstand Stoßstange–Heck bei Bremsbeginn (m), aVorn/aHinten Verzögerungen (m/s²).
     Gibt Lage der Fahrzeugfronten über der Zeit zurück: x ist der Weg seit Bremsbeginn (m), Kollision = Abstand ≤ 0. */
  function folgefahrt(o) {
    const dt = 0.01, n = Math.round((o.dauer || 14) / dt), z = [];
    let vV = o.v0, vH = o.v0, xV = 0, xH = -o.luecke;   // xV = Heck des Vordermanns, xH = Front des Lkw
    let kollision = null;
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      z.push({ t: t, xV: xV, xH: xH, vV: vV, vH: vH, bremstV: t >= 0 && vV > 0, bremstH: t >= o.reaktion && vH > 0, abstand: xV - xH });
      if (xV - xH <= 0 && kollision == null) kollision = t;
      vV = Math.max(0, vV - o.aVorn * dt); xV += vV * dt;
      if (t >= o.reaktion) vH = Math.max(0, vH - o.aHinten * dt);
      xH += vH * dt;
    }
    return { zustaende: z, dt: dt, kollision: kollision, minAbstand: Math.min.apply(null, z.map((q) => q.abstand)), bei: function (t) { return z[Math.max(0, Math.min(n, Math.round(t / dt)))]; } };
  }

  const api = { folgefahrt: folgefahrt, FAHRZEUGE: FAHRZEUGE, bahn: bahn, simuliere: simuliere, koerper: koerper, rechteck: rechteck, maxUeberschnitt: maxUeberschnitt, gesamtLaenge: gesamtLaenge, radien: radien, vorderachsRadius: vorderachsRadius, innenRadius: innenRadius, abstandLinks: abstandLinks, folge: folge };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LKW_MODELL = api;
})(typeof window !== "undefined" ? window : globalThis);

})(W);

// ---- kern/baukasten.js ----
(function (window) {
/* Baukasten „Lkw und Zug“: Bühne (Asphalt, Raster), Fahrzeuge in Draufsicht, Spuren, Gefahrenbereich, Maßlinien.
   Alles deterministisch: die Zeichnung ist eine reine Funktion von Rechenzustand (modell.js) und Zeit. Kein Zufall, keine Uhr.
   Bühne 1080 x 1080 (Pixel). Maßstab S Pixel je Meter (Standard 25). Rechtsverkehr, Fahrerseite links. */
(function (window) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const DEG = 180 / Math.PI;
  const FARBE = {
    asphalt: "#434B45", raster: "rgba(250,246,236,.075)", rasterFein: "rgba(250,246,236,.035)",
    creme: "#FAF6EC", gold: "#EDAE4F", goldDunkel: "#8F5A14", gruen: "#2F4A34",
    vorn: "#EDAE4F", hinten: "#8FD6A6", anhaenger: "#79C6EE", auflieger: "#C9A9F2",
    kabine: "#5E7C8F", kabineD: "#3E566A", kasten: "#F3EDE0", kastenD: "#B9AE93", glas: "#1F2A30", reifen: "#1B1D1A",
    blinkAn: "#FFA81F", blinkAus: "#8A5A18", ruecklicht: "#8E2B1E", scheinwerfer: "#FFF3C4"
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f = (v) => (Math.round(v * 100) / 100);

  /* ---------- Welt: Abbildung Meter -> Pixel, Ebenen ---------- */
  function welt(stage, o) {
    o = o || {};
    const S = o.S || 25, ox = o.ox || 0, oy = o.oy || 0;
    const W = { S: S, ox: ox, oy: oy };
    W.px = (x, y) => [ox + x * S, oy + y * S];
    stage.style.background = FARBE.asphalt;
    const canvas = document.createElement("canvas");   // überstrichene Fläche (wächst mit der Fahrt)
    canvas.width = 1080; canvas.height = 1080; canvas.className = "fuss";
    canvas.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1080px;opacity:" + (o.fussOpazitaet != null ? o.fussOpazitaet : 0.34);
    const raster = el("svg", { class: "raster", viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    raster.style.cssText = "position:absolute;left:0;top:0";
    const svg = el("svg", { class: "welt", viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(raster); stage.appendChild(canvas); stage.appendChild(svg);

    // Raster alle 5 m (fein alle 1 m nur bei Bedarf), Maßstabsbalken
    if (o.raster !== false) {
      const g = el("g", null, raster);
      const x0 = ox - Math.ceil(ox / (5 * S)) * 5 * S, y0 = oy - Math.ceil(oy / (5 * S)) * 5 * S;
      for (let x = x0; x <= 1080; x += 5 * S) el("line", { x1: f(x), y1: 0, x2: f(x), y2: 1080, stroke: FARBE.raster, "stroke-width": 1.5 }, g);
      for (let y = y0; y <= 1080; y += 5 * S) el("line", { x1: 0, y1: f(y), x2: 1080, y2: f(y), stroke: FARBE.raster, "stroke-width": 1.5 }, g);
    }
    // Maßstabsbalken 5 m (links unten): zeigt, dass Fahrzeuge und Kurven maßstäblich gezeichnet sind
    if (o.massstab !== false) {
      const g = el("g", { transform: "translate(56 1018)" }, raster), L = 5 * S;
      el("rect", { x: -2, y: -14, width: L + 4 + 74, height: 40, rx: 10, fill: "rgba(5,8,10,.45)" }, g);
      el("line", { x1: 8, y1: 8, x2: 8 + L, y2: 8, stroke: FARBE.creme, "stroke-width": 4, "stroke-linecap": "round" }, g);
      el("line", { x1: 8, y1: 0, x2: 8, y2: 16, stroke: FARBE.creme, "stroke-width": 3 }, g); el("line", { x1: 8 + L, y1: 0, x2: 8 + L, y2: 16, stroke: FARBE.creme, "stroke-width": 3 }, g);
      const t = el("text", { x: 8 + L + 14, y: 15, "font-size": 30, "font-weight": 600, "font-family": "Barlow, sans-serif", fill: FARBE.creme }, g); t.textContent = "5 m";
    }
    const defs = el("defs", null, svg);
    // Schraffur „Gefahrenbereich“ (Gold, 45°)
    const pat = el("pattern", { id: "schraf" + (o.id || ""), width: 14, height: 14, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 14, height: 14, fill: "rgba(237,174,79,.20)" }, pat);
    el("rect", { width: 6, height: 14, fill: "rgba(237,174,79,.78)" }, pat);
    W.schrafId = "schraf" + (o.id || "");
    W.haloId = "blinkhalo" + (o.id || "");
    const rg = el("radialGradient", { id: W.haloId }, defs);
    el("stop", { offset: "0%", "stop-color": "#FFB020", "stop-opacity": 0.85 }, rg); el("stop", { offset: "100%", "stop-color": "#FFB020", "stop-opacity": 0 }, rg);
    const glow = el("filter", { id: "glow" + (o.id || ""), x: "-80%", y: "-80%", width: "260%", height: "260%" }, defs);
    el("feGaussianBlur", { stdDeviation: 0.12, result: "b" }, glow);   // in Metern, wird mit der Gruppe skaliert
    const merge = el("feMerge", null, glow); el("feMergeNode", { in: "b" }, merge); el("feMergeNode", { in: "SourceGraphic" }, merge);
    W.glowId = "glow" + (o.id || "");
    W.gBand = el("g", null, svg); W.gFz = el("g", null, svg); W.gSpur = el("g", null, svg); W.gUeber = el("g", null, svg);
    W.svg = svg; W.canvas = canvas; W.ctx = canvas.getContext("2d");
    // Muster für die Fläche auf der Leinwand
    const pc = document.createElement("canvas"); pc.width = 14; pc.height = 14; const pctx = pc.getContext("2d");
    pctx.fillStyle = "rgba(237,174,79,.30)"; pctx.fillRect(0, 0, 14, 14);
    pctx.fillStyle = "#EDAE4F"; pctx.beginPath(); pctx.moveTo(0, 14); pctx.lineTo(7, 14); pctx.lineTo(14, 7); pctx.lineTo(14, 0); pctx.lineTo(7, 0); pctx.lineTo(0, 7); pctx.closePath(); pctx.fill();
    W.muster = W.ctx.createPattern(pc, "repeat");
    return W;
  }

  /* ---------- Fahrzeug (Draufsicht, Meter-Koordinaten in der Gruppe, Ursprung = Achse) ---------- */
  function rect(g, x, y, w, h, fill, stroke, rx, sw) {
    return el("rect", { x: f(x), y: f(y), width: f(w), height: f(h), rx: rx || 0, fill: fill, stroke: stroke || "none", "stroke-width": sw || 0.07 }, g);
  }
  function rad(g, cx, cy, laenge, breite) {   // Reifen von oben
    const r = el("g", null, g); rect(r, cx - laenge / 2, cy - breite / 2, laenge, breite, FARBE.reifen, "#000", 0.12, 0.03); return r;
  }
  function radPaar(g, x, b2, aussen, innen) {   // beidseitig, außen + (optional) Zwillingsreifen innen
    rad(g, x, b2 - 0.2, 1.0, 0.32); rad(g, x, -(b2 - 0.2), 1.0, 0.32);
    if (innen) { rad(g, x, b2 - 0.58, 1.0, 0.32); rad(g, x, -(b2 - 0.58), 1.0, 0.32); }
  }
  function kabine(g, fz, xv) {   // Kabine von oben, vorn bei xv
    const b2 = fz.breite / 2, kl = 2.3, x0 = xv - kl;
    rect(g, x0, -b2, kl, fz.breite, FARBE.kabine, FARBE.kabineD, 0.35, 0.09);
    rect(g, x0 + 0.5, -b2 + 0.26, kl - 1.0, fz.breite - 0.52, "#6F8FA3", FARBE.kabineD, 0.22, 0.05);    // Dach
    rect(g, xv - 0.62, -b2 + 0.16, 0.42, fz.breite - 0.32, FARBE.glas, "none", 0.14);                   // Frontscheibe
    rect(g, x0 + 0.1, -b2 + 0.05, 0.36, 0.12, FARBE.glas, "none", 0.05); rect(g, x0 + 0.1, b2 - 0.17, 0.36, 0.12, FARBE.glas, "none", 0.05);
    // Spiegel links (Fahrerseite) und rechts
    rect(g, xv - 1.35, b2, 0.34, 0.2, "#23262A", "none", 0.05); rect(g, xv - 1.35, -b2 - 0.2, 0.34, 0.2, "#23262A", "none", 0.05);
    rect(g, xv - 1.35, b2 + 0.1, 0.1, 0.3, "#23262A", "none", 0.03); rect(g, xv - 1.35, -b2 - 0.4, 0.1, 0.3, "#23262A", "none", 0.03);
    // Scheinwerfer
    rect(g, xv - 0.1, b2 - 0.5, 0.1, 0.34, FARBE.scheinwerfer, "none", 0.04); rect(g, xv - 0.1, -b2 + 0.16, 0.1, 0.34, FARBE.scheinwerfer, "none", 0.04);
  }
  function rippen(g, x0, x1, b2) {   // Dachrippen des Kastens
    for (let x = x0 + 0.8; x < x1 - 0.3; x += 1.15) el("line", { x1: f(x), y1: f(-b2 + 0.12), x2: f(x), y2: f(b2 - 0.12), stroke: "rgba(120,108,80,.30)", "stroke-width": 0.04 }, g);
  }
  function halo(g, x, y, w, h, halos, hid) {   // Leuchtfleck um einen Blinker (nur sichtbar, solange er an ist)
    const c = el("circle", { cx: f(x + w / 2), cy: f(y + h / 2), r: 0.55, fill: "url(#" + hid + ")", opacity: 0 }, g); halos.push(c); return c;
  }
  function bremslicht(g, xh, b2, liste) {   // leuchtet nur beim Bremsen (Bremslicht = hell rot, das normale Rücklicht bleibt dunkel)
    [b2 - 0.55, -b2 + 0.23].forEach((y) => { liste.push(rect(g, xh - 0.04, y, 0.14, 0.32, "#FF3B2B", "none", 0.03)); liste[liste.length - 1].setAttribute("opacity", 0); });
  }
  function ruecklichter(g, xh, b2, blinker, halos, hid) {
    rect(g, xh, b2 - 0.55, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03); rect(g, xh, -b2 + 0.23, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03);
    // Blinker rechts hinten (Fahrtrichtung rechts = +y), links stets aus
    blinker.push(rect(g, xh, b2 - 0.25, 0.12, 0.22, FARBE.blinkAus, "none", 0.03)); halo(g, xh - 0.1, b2 - 0.25, 0.12, 0.22, halos, hid);
    rect(g, xh, -b2 + 0.03, 0.12, 0.22, FARBE.blinkAus, "none", 0.03);
  }

  function fahrzeug(layer, fz, W, o) {
    o = o || {};
    const S = W.S, b2 = fz.breite / 2, blinker = [], halos = [], bremsen = [], rv = {};
    const gAnh = fz.anh ? el("g", { class: "anhaenger" }, layer) : null;   // Anhänger zuerst (liegt unter dem Zugfahrzeug)
    const gZug = el("g", { class: "zug" }, layer);
    const schatten = "drop-shadow(0 " + (6 / S).toFixed(3) + "px " + (6 / S).toFixed(3) + "px rgba(0,0,0,.40))";   // Einheit = Meter (Gruppe ist skaliert)
    gZug.style.filter = schatten; if (gAnh) gAnh.style.filter = schatten;
    const xv = fz.L + fz.vorn;

    // Zugfahrzeug
    if (fz.anh && fz.anh.typ === "sattel") {
      rect(gZug, -fz.hinten, -0.55, xv - 2.4 + fz.hinten, 1.1, "#5A5F66", "#33373C", 0.12, 0.06);              // Rahmen
      rect(gZug, 1.0, -b2 + 0.05, 1.7, 0.55, "#AEB4BB", "#6D7379", 0.14, 0.05); rect(gZug, 1.0, b2 - 0.6, 1.7, 0.55, "#AEB4BB", "#6D7379", 0.14, 0.05);   // Tanks
      el("circle", { cx: f(fz.e), cy: 0, r: 0.62, fill: "#7A8088", stroke: "#33373C", "stroke-width": 0.06 }, gZug);                                     // Sattelplatte
      rect(gZug, fz.e - 0.62, -0.06, 0.62, 0.12, "#33373C", "none", 0.03);
      radPaar(gZug, 0, b2, true, true); radPaar(gZug, -1.35 + 0, b2, true, true);
    } else {
      const kl = xv - 2.45;
      rect(gZug, -fz.hinten, -b2, kl + fz.hinten, fz.breite, FARBE.kasten, FARBE.kastenD, 0.14, 0.08);          // Kastenaufbau
      rippen(gZug, -fz.hinten, kl, b2);
      radPaar(gZug, 0, b2, true, true);
      if (fz.anh) {                                                                                             // Anhängerkupplung am Heck
        rect(gZug, -fz.hinten + 0.1, -0.12, fz.hinten + fz.e - 0.1 < 0 ? -fz.e - fz.hinten + 0.1 : 0.1, 0.24, "#33373C", "none", 0.03);
        el("circle", { cx: f(fz.e), cy: 0, r: 0.2, fill: "#33373C" }, gZug);
      }
    }
    kabine(gZug, fz, xv);
    rv.vr = rad(gZug, fz.L, b2 - 0.2, 1.0, 0.32); rv.vl = rad(gZug, fz.L, -(b2 - 0.2), 1.0, 0.32);              // lenkbare Vorderräder
    rv.vr.setAttribute("class", "vr"); rv.vl.setAttribute("class", "vl");
    // Blinker rechts vorn; Rücklicht hinten (nur Zug ohne Anhänger / Sattelzugmaschine zeigt kein Heck)
    blinker.push(rect(gZug, xv - 0.2, b2 - 0.26, 0.2, 0.24, FARBE.blinkAus, "none", 0.04)); halo(gZug, xv, b2 - 0.26, 0.2, 0.24, halos, W.haloId);
    rect(gZug, xv - 0.2, -b2 + 0.02, 0.2, 0.24, FARBE.blinkAus, "none", 0.04);
    if (!fz.anh) { ruecklichter(gZug, -fz.hinten, b2, blinker, halos, W.haloId); bremslicht(gZug, -fz.hinten, b2, bremsen); }

    // Anhänger / Auflieger
    if (gAnh) {
      const a = fz.anh, x0 = -a.hinten, x1 = a.vorn;
      if (a.typ === "zentral") {
        rect(gAnh, x1, -0.2, fz.D - x1, 0.4, "#C4C9CF", "#1E2022", 0.08, 0.06);                                  // Deichsel
        el("circle", { cx: f(fz.D), cy: 0, r: 0.32, fill: "none", stroke: "#C4C9CF", "stroke-width": 0.13 }, gAnh);   // Zugöse
      }
      rect(gAnh, x0, -b2, x1 - x0, fz.breite, FARBE.kasten, FARBE.kastenD, 0.14, 0.08);
      rippen(gAnh, x0, x1, b2);
      if (a.typ === "sattel") {
        el("circle", { cx: f(fz.D), cy: 0, r: 0.18, fill: "#33373C" }, gAnh);                                      // Königszapfen
        radPaar(gAnh, -1.3, b2, true, true); radPaar(gAnh, 0, b2, true, true); radPaar(gAnh, 1.3, b2, true, true);
      } else { radPaar(gAnh, -0.65, b2, true, true); radPaar(gAnh, 0.65, b2, true, true); }
      ruecklichter(gAnh, x0, b2, blinker, halos, W.haloId); bremslicht(gAnh, x0, b2, bremsen);
    }

    const obj = {
      /* z: Rechenzustand (modell.simuliere), blink: 0 oder 1 */
      setze: function (z, blink, bremst) {
        const A = W.px(z.A.x, z.A.y);
        gZug.setAttribute("transform", "translate(" + f(A[0]) + " " + f(A[1]) + ") rotate(" + f(z.hz * DEG) + ") scale(" + S + ")");
        // Vorderräder zeigen in Bewegungsrichtung der Vorderachse: Winkel gegen die Fahrzeuglängsachse
        let d = z.F.h - z.hz; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        const tf = "rotate(" + f(d * DEG) + " " + fz.L + " ";
        rv.vr.setAttribute("transform", tf + f(b2 - 0.2) + ")"); rv.vl.setAttribute("transform", tf + f(-(b2 - 0.2)) + ")");
        if (gAnh) {
          const T = W.px(z.T.x, z.T.y);
          gAnh.setAttribute("transform", "translate(" + f(T[0]) + " " + f(T[1]) + ") rotate(" + f(z.ha * DEG) + ") scale(" + S + ")");
        }
        const farbe = blink ? FARBE.blinkAn : FARBE.blinkAus;
        blinker.forEach((b) => b.setAttribute("fill", farbe));
        halos.forEach((h) => h.setAttribute("opacity", blink ? 0.9 : 0));
        bremsen.forEach((r) => r.setAttribute("opacity", bremst ? 1 : 0));
      },
      zeige: function (an) { const v = an ? "visible" : "hidden"; gZug.style.visibility = v; if (gAnh) gAnh.style.visibility = v; },
      groups: { zug: gZug, anh: gAnh }
    };
    return obj;
  }

  /* ---------- Überstrichene Fläche (Leinwand, wächst mit der Fahrt) ---------- */
  function fussflaeche(W, sim, o) {
    o = o || {};
    const ctx = W.ctx; let bis = -1; const schritt = o.schritt || 3;   // alle 3 Rechenschritte = 6 cm
    const fz = sim.fz;
    function malen(i) {
      const z = sim.zustaende[i], ks = M().koerper(fz, z);
      ctx.beginPath();
      ks.forEach((k) => { k.poly.forEach((p, j) => { const q = W.px(p.x, p.y); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); });
      ctx.fill();
    }
    return {
      bis: function (idx) {
        idx = Math.max(0, Math.min(sim.zustaende.length - 1, idx));
        if (idx < bis) { ctx.clearRect(0, 0, 1080, 1080); bis = -1; }
        ctx.fillStyle = o.muster ? W.muster : (o.farbe || "#FAF6EC");
        for (let i = bis < 0 ? 0 : bis + schritt; i <= idx; i += schritt) { malen(i); bis = i; }
        if (idx > bis && idx === sim.zustaende.length - 1) { malen(idx); bis = idx; }
      },
      leeren: function () { ctx.clearRect(0, 0, 1080, 1080); bis = -1; }
    };
  }
  const M = () => window.LKW_MODELL;

  /* ---------- Spuren und Band ---------- */
  function spur(W, sim, wahl, farbe, o) {   // wahl: Funktion z -> Punkt (Meter)
    o = o || {};
    const g = el("g", null, W.gSpur);
    const lin = el("polyline", { fill: "none", stroke: farbe, "stroke-width": o.breite || 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    if (o.gestrichelt) lin.setAttribute("stroke-dasharray", "10 8");
    const kopf = el("circle", { r: o.kopf || 8, fill: farbe, stroke: "#101410", "stroke-width": 2.5 }, g);
    const sch = o.schritt || 5;
    const pts = [];
    for (let i = 0; i < sim.zustaende.length; i += sch) { const p = wahl(sim.zustaende[i]), q = W.px(p.x, p.y); pts.push(f(q[0]) + "," + f(q[1])); }
    const lastIdx = Math.floor((sim.zustaende.length - 1) / sch);
    return {
      g: g, punkte: pts, schritt: sch,
      bis: function (idx) {
        const n = Math.max(1, Math.min(lastIdx, Math.floor(idx / sch)) + 1);
        lin.setAttribute("points", pts.slice(0, n).join(" "));
        const p = wahl(sim.zustaende[Math.max(0, Math.min(sim.zustaende.length - 1, idx))]), q = W.px(p.x, p.y);
        kopf.setAttribute("cx", f(q[0])); kopf.setAttribute("cy", f(q[1]));
      },
      zeige: function (a) { g.style.opacity = a; }
    };
  }
  function band(W, simA, wahlA, simB, wahlB, o) {   // Fläche zwischen zwei Spuren, bis Rechenstand idx
    const pol = el("polygon", { fill: "url(#" + W.schrafId + ")", stroke: "rgba(237,174,79,.85)", "stroke-width": 1.5 }, W.gBand);
    const sch = (o && o.schritt) || 10;
    const a = [], b = [];
    for (let i = 0; i < simA.zustaende.length; i += sch) { const p = wahlA(simA.zustaende[i]), q = W.px(p.x, p.y); a.push(f(q[0]) + "," + f(q[1])); }
    for (let i = 0; i < simB.zustaende.length; i += sch) { const p = wahlB(simB.zustaende[i]), q = W.px(p.x, p.y); b.push(f(q[0]) + "," + f(q[1])); }
    return {
      el: pol,
      bis: function (idx) {
        const n = Math.max(1, Math.min(a.length, Math.floor(idx / sch) + 1));
        pol.setAttribute("points", a.slice(0, n).join(" ") + " " + b.slice(0, n).reverse().join(" "));
      },
      zeige: function (a2) { pol.style.opacity = a2; }
    };
  }

  /* ---------- Beschriftung (HTML-Pillen auf der Bühne, über die Sprachen austauschbar) ---------- */
  function pille(stage, text, x, y, o) {
    o = o || {};
    const d = document.createElement("div");
    d.className = "pill lkw-pill" + (o.klasse ? " " + o.klasse : "");
    d.textContent = text;
    // ax "0": linker Rand bei x · "-100%": rechter Rand bei x (per right:, damit die Breite nicht zusammengedrückt wird) · sonst mittig
    const h = o.ax === "-100%" ? "right:" + (1080 - x) + "px" : "left:" + x + "px";
    const tr = o.ax === "-100%" ? "translate(0," + (o.ay != null ? o.ay : "-50%") + ")" : "translate(" + (o.ax != null ? o.ax : "-50%") + "," + (o.ay != null ? o.ay : "-50%") + ")";
    d.style.cssText = "position:absolute;width:max-content;max-width:520px;" + h + ";top:" + y + "px;transform:" + tr + ";opacity:0" + (o.farbe ? ";border-color:" + o.farbe : "");
    if (o.punkt) { const p = document.createElement("i"); p.style.cssText = "display:inline-block;width:22px;height:22px;border-radius:50%;margin-inline-end:12px;vertical-align:-1px;background:" + o.punkt; d.insertBefore(p, d.firstChild); }
    stage.appendChild(d);
    return d;
  }
  // Hinweislinie von der Pille zum Punkt
  function leitlinie(W, x1, y1, x2, y2, farbe) {
    const g = el("g", { opacity: 0 }, W.gUeber);
    el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: farbe || FARBE.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g);
    el("circle", { cx: f(x2), cy: f(y2), r: 5, fill: farbe || FARBE.creme }, g);
    return g;
  }
  // Maßpfeil mit Endstrichen
  function mass(W, x1, y1, x2, y2, farbe, w) {
    const g = el("g", { opacity: 0 }, W.gUeber), c = farbe || FARBE.creme, sw = w || 3;
    el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: c, "stroke-width": sw }, g);
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 11, ny = Math.cos(a) * 11;
    [[x1, y1], [x2, y2]].forEach((p) => el("line", { x1: f(p[0] - nx), y1: f(p[1] - ny), x2: f(p[0] + nx), y2: f(p[1] + ny), stroke: c, "stroke-width": sw }, g));
    return g;
  }

  window.LKW_BK = { FARBE: FARBE, el: el, welt: welt, fahrzeug: fahrzeug, fussflaeche: fussflaeche, spur: spur, band: band, pille: pille, leitlinie: leitlinie, mass: mass, f: f, DEG: DEG };
})(window);

})(W);

// ---- kern/panel.js ----
(function (window) {
/* Text-Feld (Panel) und Einblendungen – gleicher Aufbau wie beim Film „Vorfahrt“, nur als gemeinsamer Baustein für alle Lkw-Filme.
   Nutzung: const P = LKW_PANEL.neu({ tl, T, tx, logo }); P.szene(sc, kapitelNr) ... */
(function (window) {
  "use strict";
  function neu(o) {
    const tl = o.tl, T = o.T, tx = o.tx;
    const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };
    const fade = (target, t, d, from) => tl.fromTo(target, from || { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: d || 0.6, ease: "power2.out" }, t);
    const starts = []; let acc = 0;
    T.kapitel.forEach((k) => { starts.push(acc); acc += k.dauer; });

    function buehne(sc) {
      const wrap = el("div", "stagewrap"), st = el("div", "stage");
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
      if (o.logo) { const f = el("div", "foot"); const im = el("img"); im.src = o.logo; im.alt = ""; f.appendChild(im); f.appendChild(el("span", "", "Fahr-Akademie · " + (o.fussName || "Lkw und Zug verstehen"))); p.appendChild(f); }
      sc.appendChild(p); return p;
    }
    // Immer nur EIN Satz sichtbar: der nächste ersetzt den vorigen
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
      const items = (ch.punkte || []).map((pt) => ({ t: pt.t, el: ptEl(pt) }));
      if (mitMerk && ch.merk) items.push({ t: ch.merk.t, el: merkEl(ch.merk) });
      stapel(p, items, T0);
      // Titel und Untertitel
      tl.fromTo(p.querySelector(".ttl"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T0 + 0.3);
      if (ch.sub) fade(p.querySelector(".sub"), T0 + ch.sub.t, 0.7, { opacity: 0, y: 20 });
      return p;
    }
    function sceneFade(sc, T0, dur) {
      // autoAlpha: unsichtbare Kapitel werden gar nicht gezeichnet (spart auf dem Handy Rechenzeit)
      tl.fromTo(sc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, T0);
      tl.to(sc, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, T0 + dur - 0.4);
    }
    // Einblenden eines Elements zum Zeitpunkt t (nur Deckkraft: Pillen sind per CSS zentriert)
    const zeige = (e, t, d) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: d || 0.5, ease: "power1.out" }, t);
    return { el: el, fade: fade, starts: starts, gesamt: acc, buehne: buehne, panel: panel, stapel: stapel, ptEl: ptEl, merkEl: merkEl, standardPanel: standardPanel, sceneFade: sceneFade, zeige: zeige };
  }
  window.LKW_PANEL = { neu: neu };
})(window);

})(W);

// ---- f5-1/text.js ----
(function (window) {
/* Film 5.1 „Schleppkurven: Solo, Lastzug, Sattelzug“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. KEINE Stimme: alles steht als Text im Bild.
   Faktenblatt (jede Aussage mit Norm/Wortlaut): Obsidian-Vault, „Film 5.1 Schleppkurven – Faktenblatt“.
   Norm: § 32d StVZO (Kurvenlaufeigenschaften), Wortlaut geprüft am 07.10.2026 gegen gesetze-im-internet.de. Die Spuren im Bild sind GERECHNET
   (kern/modell.js, Tests in test/modell.test.mjs), die Fahrzeugmaße sind Beispielwerte, keine Daten eines bestimmten Fahrzeugs.

   Aufbau wie beim Film „Vorfahrt“: de = alle Sätze mit Schlüssel (werden in 17 Sprachen übersetzt, Schlüssel bleiben gleich);
   kapitel = Reihenfolge, Zeiten (t = Sekunden ab Kapitelanfang). Paragrafen-Verweise ("ref") sind Zitate und werden NICHT übersetzt.
   Lesezeit: jeder Satz bleibt mindestens 2,0 s + 0,5 s je Wort stehen (Deutsch); geprüft mit `node pruefe-lesezeit.mjs`. */
window.FILM_TEXT = {
  film: "lkw-f5-1",
  de: {
    titel: "Schleppkurven – wo fährt der Anhänger?",
    ui_ueber: "Überblick: Schleppkurven in 4 Minuten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten",
    ui_pause: "Anhalten",
    ui_weiter: "Weiter",
    ui_neu: "Von vorn",
    ui_kapitel: "Kapitel",
    ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage",
    k1_titel: "Wohin läuft das Heck?",
    k1_sub: "Ein Lkw biegt rechts ab.",
    k1_p1: "Die Vorderräder fahren eine Kurve.",
    k1_p2: "Aber wo fahren die hinteren Räder? Und wo der Anhänger?",
    k1_p3: "Die Spuren aller Achsen in der Kurve heißen Schleppkurven.",

    k2_kicker: "Der Lkw allein",
    k2_titel: "Die Hinterachse läuft enger",
    k2_sub: "Ein Lkw ohne Anhänger, maßstabsgetreu gezeichnet.",
    k2_p1: "Beim Lkw im Beispiel lenkt nur die Vorderachse. Die Hinterachse läuft hinterher.",
    k2_p2: "Darum läuft die Hinterachse auf einem engeren Radius.",
    k2_p3: "Der Raum zwischen den Spuren wird überstrichen.",
    k2_p4: "Das ist der Gefahrenbereich.",
    l_vorn: "Vorderachse",
    l_hinten: "Hinterachse",
    l_gefahr: "Gefahrenbereich",

    k3_kicker: "Mit Anhänger",
    k3_titel: "Der Lastzug",
    k3_sub: "Lkw mit Anhänger an einer starren Deichsel.",
    k3_p1: "Die Anhängerachse folgt dem Kupplungspunkt, nicht dem Lkw.",
    k3_p2: "In diesem Beispiel läuft sie noch enger als die Hinterachse.",
    k3_p3: "Im Beispiel wird der Gefahrenbereich breiter.",
    l_anhaenger: "Anhängerachse",
    l_kupplung: "Kupplungspunkt",

    k4_kicker: "Mit Auflieger",
    k4_titel: "Der Sattelzug",
    k4_sub: "Zugmaschine und Auflieger.",
    k4_p1: "Der Auflieger hängt am Königszapfen der Sattelkupplung.",
    k4_p2: "In der Kurve knickt der Auflieger nach und nach ab.",
    k4_p3: "Im Beispiel läuft seine Spur am weitesten innen.",
    l_auflieger: "Aufliegerachsen",
    l_zapfen: "Königszapfen",
    l_knick: "Knickwinkel",

    k5_kicker: "Im Vergleich",
    k5_titel: "Gleiche Kurve, drei Fahrzeuge",
    k5_sub: "Die Vorderachse fährt jedes Mal dieselbe Kurve.",
    k5_p1: "Im Beispiel rückt die hintere Spur immer weiter nach innen: Lkw, Lastzug, Sattelzug.",
    l_lkw: "Lkw",
    l_lastzug: "Lastzug",
    l_sattel: "Sattelzug",

    k6_kicker: "Das Gesetz",
    k6_titel: "Der Kreisring",
    k6_sub: "Wie viel Platz darf die Bauart eines Fahrzeugs brauchen?",
    k6_p1: "Eine Kreisfahrt hat den äußeren Radius 12,50 m.",
    k6_p2: "Die überstrichene Ringfläche darf höchstens 7,20 m breit sein.",
    k6_p3: "Der freie Innenkreis hat also mindestens 5,30 m Radius.",
    k6_p4: "Beim Einfahren in den Kreis darf kein Teil die gerade Anfahrlinie um mehr als 0,80 m nach außen überschreiten.",
    k6_p5: "Der Beispiel-Sattelzug hält beides ein.",
    l_r_aussen: "12,50 m",
    l_r_ring: "höchstens 7,20 m",
    l_r_innen: "5,30 m",
    l_r_gerade: "0,80 m",

    k7_kicker: "Merke",
    k7_titel: "Zum Mitnehmen",
    k7_merk: "Meist läuft hinten enger. Zwischen den Spuren ist Gefahrenbereich."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 24,
      sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.2 }, { k: "k1_p2", t: 8.8 }, { k: "k1_p3", t: 16.4 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 36,
      sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 4.5 }, { k: "k2_p2", t: 13.5 }, { k: "k2_p3", t: 20.0 }, { k: "k2_p4", t: 26.5, stil: "gold" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 34,
      sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 4.5 }, { k: "k3_p2", t: 12.5 }, { k: "k3_p3", t: 21.0, stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 36,
      sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 4.5 }, { k: "k4_p2", t: 12.0 }, { k: "k4_p3", t: 20.0, stil: "gold" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 20,
      sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 5.0, stil: "gold" }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 76,
      sub: { k: "k6_sub", t: 0.6 },
      punkte: [
        { k: "k6_p1", t: 4.5, ref: "§ 32d Abs. 1 StVZO" },
        { k: "k6_p2", t: 11.5, ref: "§ 32d Abs. 1 StVZO" },
        { k: "k6_p3", t: 19.5, ref: "§ 32d Abs. 1 StVZO: 12,50 m − 7,20 m" },
        { k: "k6_p4", t: 28.0, ref: "§ 32d Abs. 2 StVZO" },
        { k: "k6_p5", t: 69.0, stil: "gold" }] },
    { id: "k7", titel: "k7_titel", kicker: "k7_kicker", dauer: 14,
      merk: { k: "k7_merk", t: 1.2 } }
  ]
};

})(W);

W.FILM_SPRACHEN = {"en":{"titel":"Swept paths – where does the trailer go?","ui_ueber":"Overview: swept paths in 4 minutes","ui_intro":"A short film without sound: everything is shown as text on screen. You can pause at any time or pick a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Resume","ui_neu":"Restart","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"The question","k1_titel":"Where does the rear end go?","k1_sub":"A truck turns right.","k1_p1":"The front wheels follow a curve.","k1_p2":"But where do the rear wheels go? And the trailer?","k1_p3":"The tracks of all axles in a turn are called swept paths.","k2_kicker":"The truck alone","k2_titel":"The rear axle runs tighter","k2_sub":"A truck without a trailer, drawn to scale.","k2_p1":"On the example truck, only the front axle steers. The rear axle follows.","k2_p2":"That is why the rear axle follows a tighter radius.","k2_p3":"The area between the tracks is swept by the vehicle.","k2_p4":"That is the danger zone.","l_vorn":"Front axle","l_hinten":"Rear axle","l_gefahr":"Danger zone","k3_kicker":"With a trailer","k3_titel":"The truck-trailer combination","k3_sub":"A truck with a trailer on a rigid drawbar.","k3_p1":"The trailer axle follows the coupling point, not the truck.","k3_p2":"In this example it runs even tighter than the rear axle.","k3_p3":"In the example, the danger zone gets wider.","l_anhaenger":"Trailer axle","l_kupplung":"Coupling point","k4_kicker":"With a semi-trailer","k4_titel":"The articulated truck","k4_sub":"Tractor unit and semi-trailer.","k4_p1":"The semi-trailer is coupled to the kingpin of the fifth wheel.","k4_p2":"In a turn, the semi-trailer gradually bends away from the tractor unit.","k4_p3":"In the example, its track runs furthest inside.","l_auflieger":"Semi-trailer axles","l_zapfen":"Kingpin","l_knick":"Articulation angle","k5_kicker":"Comparison","k5_titel":"Same turn, three vehicles","k5_sub":"The front axle drives the same turn every time.","k5_p1":"In the example, the rear track moves further and further inside: truck, truck-trailer combination, articulated truck.","l_lkw":"Truck","l_lastzug":"Truck + trailer","l_sattel":"Articulated truck","k6_kicker":"The law","k6_titel":"The turning ring","k6_sub":"How much space may a vehicle's design need?","k6_p1":"A full-circle drive has an outer radius of 12.50 m.","k6_p2":"The swept ring area may be at most 7.20 m wide.","k6_p3":"So the free inner circle has a radius of at least 5.30 m.","k6_p4":"When entering the circle, no part may cross the straight approach line by more than 0.80 m to the outside.","k6_p5":"The example articulated truck meets both limits.","l_r_aussen":"12.50 m","l_r_ring":"at most 7.20 m","l_r_innen":"5.30 m","l_r_gerade":"0.80 m","k7_kicker":"Remember","k7_titel":"Take-away","k7_merk":"The rear usually runs tighter. Between the tracks is a danger zone."},"sr":{"titel":"Putanje u krivini – kuda ide prikolica?","ui_ueber":"Pregled: putanje u krivini za 4 minuta","ui_intro":"Kratak film bez zvuka: sve piše na ekranu. Možeš da zaustaviš film ili da izabereš poglavlje kad god želiš.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Nastavi","ui_neu":"Od početka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Pitanje","k1_titel":"Kuda ide zadnji deo?","k1_sub":"Kamion skreće udesno.","k1_p1":"Prednji točkovi prave luk.","k1_p2":"Ali kuda idu zadnji točkovi? A prikolica?","k1_p3":"Tragovi svih osovina u krivini zovu se putanje (Schleppkurve).","k2_kicker":"Kamion sam","k2_titel":"Zadnja osovina ide užim lukom","k2_sub":"Kamion bez prikolice, nacrtan u razmeri.","k2_p1":"Na primeru kamiona samo prednja osovina skreće. Zadnja osovina je prati.","k2_p2":"Zato zadnja osovina ide po užem poluprečniku.","k2_p3":"Prostor između tragova vozilo prekriva.","k2_p4":"To je opasna zona.","l_vorn":"Prednja osovina","l_hinten":"Zadnja osovina","l_gefahr":"Opasna zona","k3_kicker":"Sa prikolicom","k3_titel":"Kamion sa prikolicom","k3_sub":"Kamion sa prikolicom na krutoj rudi.","k3_p1":"Osovina prikolice prati tačku spajanja, a ne kamion.","k3_p2":"U ovom primeru ide još uže od zadnje osovine.","k3_p3":"U primeru se opasna zona širi.","l_anhaenger":"Osovina prikolice","l_kupplung":"Tačka spajanja","k4_kicker":"Sa poluprikolicom","k4_titel":"Šleper","k4_sub":"Tegljač i poluprikolica.","k4_p1":"Poluprikolica je spojena sa kingpinom sedlaste spojnice.","k4_p2":"U krivini se poluprikolica postepeno lomi.","k4_p3":"U primeru njen trag ide najviše unutra.","l_auflieger":"Osovine poluprikolice","l_zapfen":"Kingpin","l_knick":"Ugao loma","k5_kicker":"Poređenje","k5_titel":"Ista krivina, tri vozila","k5_sub":"Prednja osovina svaki put vozi istu krivinu.","k5_p1":"U primeru zadnji trag sve više ide unutra: kamion, kamion sa prikolicom, šleper.","l_lkw":"Kamion","l_lastzug":"Kamion + prikolica","l_sattel":"Šleper","k6_kicker":"Zakon","k6_titel":"Kružni prsten","k6_sub":"Koliko prostora sme da zauzme konstrukcija vozila?","k6_p1":"Vožnja u krugu ima spoljašnji poluprečnik 12,50 m.","k6_p2":"Površina prstena koju vozilo prekrije sme biti široka najviše 7,20 m.","k6_p3":"Dakle, slobodan unutrašnji krug ima poluprečnik od najmanje 5,30 m.","k6_p4":"Pri ulasku u krug nijedan deo ne sme da pređe ravnu liniju prilaza više od 0,80 m ka spolja.","k6_p5":"Šleper iz primera ispunjava oba uslova.","l_r_aussen":"12,50 m","l_r_ring":"najviše 7,20 m","l_r_innen":"5,30 m","l_r_gerade":"0,80 m","k7_kicker":"Zapamti","k7_titel":"Najvažnije","k7_merk":"Pozadi najčešće ide uže. Između tragova je opasna zona."},"tr":{"titel":"Dönüş izleri – römork nereden gider?","ui_ueber":"Genel bakış: 4 dakikada dönüş izleri","ui_intro":"Sessiz kısa bir film: Her şey görüntüde yazıyla yer alır. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"Devam","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"Soru","k1_titel":"Arka kısım nereye gider?","k1_sub":"Bir kamyon sağa dönüyor.","k1_p1":"Ön tekerlekler bir viraj alır.","k1_p2":"Peki arka tekerlekler nereden gider? Ya römork?","k1_p3":"Bir virajda tüm akslar tarafından bırakılan izlere dönüş izi (Schleppkurve) denir.","k2_kicker":"Tek başına kamyon","k2_titel":"Arka aks daha dar gider","k2_sub":"Römorksuz bir kamyon, ölçekli çizilmiştir.","k2_p1":"Örnekteki kamyonda yalnızca ön aks yönlendirir. Arka aks onu takip eder.","k2_p2":"Bu yüzden arka aks daha dar bir yarıçapta ilerler.","k2_p3":"İki iz arasındaki alan süpürülür.","k2_p4":"Burası tehlike bölgesidir.","l_vorn":"Ön aks","l_hinten":"Arka aks","l_gefahr":"Tehlike bölgesi","k3_kicker":"Römorklu","k3_titel":"Römorklu kamyon","k3_sub":"Sabit çeki koluna bağlı römorklu kamyon.","k3_p1":"Römork aksı kamyonu değil, bağlantı noktasını takip eder.","k3_p2":"Bu örnekte arka akstan bile daha dar gider.","k3_p3":"Örnekte tehlike bölgesi genişler.","l_anhaenger":"Römork aksı","l_kupplung":"Bağlantı noktası","k4_kicker":"Yarı römorklu","k4_titel":"Tır (çekici ve yarı römork)","k4_sub":"Çekici ve yarı römork.","k4_p1":"Yarı römork, beşinci tekerlek bağlantısının kingpin'ine takılıdır.","k4_p2":"Virajda yarı römork yavaş yavaş çekiciye göre açı yapar.","k4_p3":"Örnekte onun izi en içeriden gider.","l_auflieger":"Yarı römork aksları","l_zapfen":"Kingpin","l_knick":"Katlanma açısı","k5_kicker":"Karşılaştırma","k5_titel":"Aynı viraj, üç araç","k5_sub":"Ön aks her seferinde aynı virajı alır.","k5_p1":"Örnekte arka iz giderek daha içeri kayar: kamyon, römorklu kamyon, çekici ve yarı römork.","l_lkw":"Kamyon","l_lastzug":"Römorklu kamyon","l_sattel":"Çekici + yarı römork","k6_kicker":"Yasa","k6_titel":"Dairesel halka","k6_sub":"Bir aracın yapısı ne kadar yer kaplayabilir?","k6_p1":"Dairesel yolda sürüşte dış yarıçap 12,50 m'dir.","k6_p2":"Süpürülen halka alanı en fazla 7,20 m genişliğinde olabilir.","k6_p3":"Yani boş iç dairenin yarıçapı en az 5,30 m'dir.","k6_p4":"Daireye girerken hiçbir parça, düz yaklaşma çizgisini dışa doğru 0,80 m'den fazla aşamaz.","k6_p5":"Örnekteki çekici ve yarı römork her iki sınıra da uyar.","l_r_aussen":"12,50 m","l_r_ring":"en fazla 7,20 m","l_r_innen":"5,30 m","l_r_gerade":"0,80 m","k7_kicker":"Aklında tut","k7_titel":"Özet","k7_merk":"Çoğunlukla arka daha dar gider. İzlerin arasında tehlike bölgesi vardır."}};
// ---- f5-1/szenen.js ----
(function (window) {
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

})(W);

// ---- kern/host.js ----
/* App-Teil der Lkw-Erklärfilme (wird von bauen.mjs mit den Film-Quellen zu verkehr/lkw-<film>.js gebündelt).
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }
     sprache  Sprachcode der App (de, tr, en, ar, …); fehlt ein Satz in der Sprache, erscheint Deutsch
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
  
  if (!document.getElementById("lk-css")) { const s = document.createElement("style"); s.id = "lk-css"; s.textContent = CSS; document.head.appendChild(s); }
  const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };

  const wurzel = el("section", "lk" + (rtl ? " lk-rtl" : "") + (BARLOW_SPRACHEN.indexOf(lang) >= 0 ? " lk-barlow" : "")); wurzel.lang = lang;
  wurzel.setAttribute("aria-label", tx("titel"));
  wurzel.appendChild(el("h2", "lk-kopf", tx("ui_ueber")));
  wurzel.appendChild(el("p", "lk-intro", tx("ui_intro")));
  const kasten = el("div", "lk-kasten"), szenenBox = el("div", "lk-szenen");
  szenenBox.setAttribute("aria-hidden", "true");   // der Film ist Bild; den Text liest man unten (Liste) oder im Bild
  const scenes = T.kapitel.map(() => { const s = el("section", "scene"); szenenBox.appendChild(s); return s; });
  kasten.appendChild(szenenBox);

  // Steuerung (unter dem Bild, nie auf dem Bild)
  const steuer = el("div", "lk-steuer"), reihe = el("div", "lk-reihe");
  const playKnopf = el("button", "lk-knopf lk-play"); playKnopf.type = "button";
  const neuKnopf = el("button", "lk-knopf"); neuKnopf.type = "button"; neuKnopf.innerHTML = SVG.neu + "<span></span>"; neuKnopf.lastChild.textContent = tx("ui_neu");
  const zeitEl = el("span", "lk-zeit");
  reihe.appendChild(playKnopf); reihe.appendChild(neuKnopf); reihe.appendChild(zeitEl);
  const regler = el("input", "lk-regler"); regler.type = "range"; regler.min = 0; regler.step = 1; regler.value = 0;
  regler.setAttribute("aria-label", tx("titel"));
  const kapZeile = el("div", "lk-kapitel"); kapZeile.setAttribute("role", "group"); kapZeile.setAttribute("aria-label", tx("ui_kapitel"));
  const kapKnoepfe = T.kapitel.map((ch, i) => { const b = el("button", "lk-kap", String(i + 1)); b.type = "button"; b.setAttribute("aria-label", tx("ui_kapitel") + " " + (i + 1) + ": " + tx(ch.titel)); kapZeile.appendChild(b); return b; });
  steuer.appendChild(reihe); steuer.appendChild(regler); steuer.appendChild(kapZeile);
  kasten.appendChild(steuer);
  wurzel.appendChild(kasten);

  // Gesamter Text als Liste (Lesen im eigenen Tempo, Bildschirmleser, Übersetzungskontrolle)
  const det = el("details", "lk-text"), sum = el("summary", "", tx("ui_lesen")); det.appendChild(sum);
  T.kapitel.forEach((ch) => {
    det.appendChild(el("h3", "", tx(ch.titel)));
    const zeilen = [];
    if (ch.sub) zeilen.push([ch.sub.k]);
    if (ch.intro) zeilen.push([ch.intro.k]);
    (ch.stufen || []).forEach((s) => { zeilen.push([s.name]); zeilen.push([s.text, s.ref]); zeilen.push([s.plus]); });
    (ch.punkte || []).forEach((p) => zeilen.push([p.k, p.ref]));
    if (ch.merk) zeilen.push([ch.merk.k]);
    zeilen.forEach((z) => { const p = el("p", "", tx(z[0])); if (z[1]) p.appendChild(el("span", "lk-ref", " (" + z[1] + ")")); det.appendChild(p); });
  });
  wurzel.appendChild(det);
  platz.appendChild(wurzel);

  // Zeitleiste
  const tl = gsap.timeline({ paused: true });
  const r = W.LKWSzenen.bauen({ tl: tl, T: T, tx: tx, scenes: scenes });
  const gesamt = r.gesamt, POSTER = r.starts[0] + (T.poster != null ? T.poster : 6);   // Standbild vor dem Start
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
    wurzel.classList.toggle("lk-breit", kasten.clientWidth >= 660);
    const w = scenes[0].querySelector(".stagewrap");
    if (w && w.clientWidth) szenenBox.style.setProperty("--lk-s", String(w.clientWidth / 1080));
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
