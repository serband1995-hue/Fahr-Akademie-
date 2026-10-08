/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/f3-3/*).
   Erklärfilm „f3-3“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ".lk .stagewrap{position:relative;}\n.lk .stage{position:absolute; left:0; top:0; width:1080px; height:1080px; overflow:hidden; background:#434B45; direction:ltr;}\n.lk .stage > *{position:absolute;}\n.lk .pill{padding:10px 28px; border-radius:42px; background:#FAF6EC; color:#2F4A34; border:3px solid var(--lk-gold,#D9954C); font:700 44px/1.15 var(--lk-text,'Barlow',sans-serif); text-align:center; max-width:560px; box-shadow:0 5px 12px rgba(0,0,0,.35);}\n.lk .pill.gross{font-size:62px; padding:16px 44px; border-radius:60px; max-width:900px;}\n.lk .pill.klein{font-size:38px; padding:6px 20px;}\n.lk .lkw-pill{text-wrap:balance;}\n.lk-rtl .pill{direction:rtl;}\n.lk .panel .kicker{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#8F5A14;}\n.lk .panel .ttl,.lk .panel .merk{font-variant-numeric:lining-nums;}\n.lk .panel .ttl{font-family:var(--lk-titel,'Playfair Display',serif); font-weight:700; color:#2F4A34;}\n.lk .panel .sub{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857; opacity:0;}\n.lk .pts{display:grid;}\n.lk .pts > *{grid-area:1 / 1; align-self:start; opacity:0;}\n.lk .pt .tx{text-wrap:balance; font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; color:#2B2A22;}\n.lk .pt.gold .tx{color:#8F5A14;}\n.lk .pt .rf{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857;}\n.lk .merk{font-variant-numeric:lining-nums; background:#2F4A34; color:#FAF6EC; border-left:12px solid #D9954C; border-radius:6px 18px 18px 6px; font-family:var(--lk-titel,'Playfair Display',serif); font-weight:600; box-shadow:0 10px 24px rgba(43,42,34,.25);}\n\n/* Erklärfilme „Lkw und Zug verstehen“ in der App: Bild oben, Text darunter, Steuerung darunter (keine Knöpfe auf dem Bild).\n   Handy zuerst (360–412 px). Ab ~660 px Breite (Querformat/Tablet) steht der Text neben dem Bild. */\n.lk { --lk-titel:var(--ff-titel,'Playfair Display',Georgia,serif); --lk-text:var(--ff-body,'Barlow',sans-serif); --lk-gold:var(--gold,#D9954C); margin:var(--sp-m,12px) 0 var(--sp-l,18px); }\n.lk-kopf { font-family:var(--lk-titel); font-weight:600; font-size:19px; margin:0 0 4px; }\n.lk-intro { color:var(--muted,#6F6857); font-size:14.5px; line-height:1.45; margin:0 0 10px; }\n.lk-kasten { background:var(--surface,#EEE6D3); border:1px solid var(--border,rgba(43,40,30,.16)); border-radius:var(--r-l,16px); padding:10px; overflow:hidden; }\n.lk-szenen { display:grid; position:relative; }\n.lk-szenen .scene { grid-area:1 / 1; display:flex; flex-direction:column; gap:12px; min-width:0; pointer-events:none; direction:ltr; }\n.lk-szenen .stagewrap { width:100%; aspect-ratio:1 / 1; border-radius:var(--r-m,12px); overflow:hidden; flex:none; background:#434B45; }\n.lk-szenen .stage { transform-origin:0 0; transform:scale(var(--lk-s,.3)); }\n.lk-szenen .panel { min-width:0; padding:2px 4px 4px; }\n.lk-szenen .dots, .lk-szenen .foot { display:none; }\n.lk-szenen .kicker { font-size:12.5px; line-height:1.3; letter-spacing:.12em; }\n.lk-szenen .ttl { font-size:24px; line-height:1.15; margin:4px 0 0; }\n.lk-szenen .sub { font-size:16px; line-height:1.4; margin-top:8px; }\n.lk-szenen .pts { margin-top:12px; }\n.lk-szenen .pt .tx { font-size:18px; line-height:1.42; }\n.lk-szenen .pt .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .step .nr { font-size:36px; }\n.lk-szenen .step .nm { font-size:22px; line-height:1.2; margin-top:2px; }\n.lk-szenen .step .tx { font-size:17px; line-height:1.42; margin-top:8px; }\n.lk-szenen .step .px { font-size:15px; line-height:1.4; margin-top:8px; }\n.lk-szenen .step .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .merk { padding:14px 16px; font-size:20px; line-height:1.3; border-left-width:8px; }\n.lk-breit .lk-szenen .scene { flex-direction:row; align-items:flex-start; gap:20px; }\n.lk-breit .lk-szenen .stagewrap { flex:0 0 46%; }\n.lk-breit .lk-szenen .panel { flex:1; }\n.lk-rtl .lk-szenen .panel, .lk-rtl .lk-text, .lk-rtl .lk-intro, .lk-rtl .lk-kopf { direction:rtl; text-align:right; }\n.lk-steuer { display:flex; flex-direction:column; gap:10px; margin-top:12px; }\n.lk-reihe { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }\n.lk-knopf { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:600 15px/1.2 var(--lk-text); display:inline-flex; align-items:center; gap:8px; cursor:pointer; }\n.lk-knopf svg { width:18px; height:18px; flex:none; fill:currentColor; }\n.lk-play { background:var(--lk-gold); color:var(--auf-gold,#2B2A22); border-color:transparent; }\n.lk-zeit { margin-inline-start:auto; font-size:13px; color:var(--muted,#6F6857); font-variant-numeric:tabular-nums; direction:ltr; }\n.lk-regler { width:100%; height:28px; margin:0; accent-color:var(--gold-text,#8F5A14); direction:ltr; }\n.lk-kapitel { display:grid; grid-template-columns:repeat(auto-fit,minmax(40px,1fr)); gap:4px; direction:ltr; }   /* 7 Kapitel müssen bei 360 px in eine Zeile passen, sonst wickeln sie um */\n.lk-kap { min-width:0; min-height:44px; border-radius:12px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:700 15px/1 var(--lk-text); cursor:pointer; }\n.lk-kap[aria-current=\"true\"] { background:var(--gruen,#2F4A34); color:var(--auf-tief,#fff); border-color:transparent; }\n.lk-knopf:focus-visible, .lk-kap:focus-visible, .lk-regler:focus-visible, .lk-text summary:focus-visible { outline:3px solid var(--gold-text,#8F5A14); outline-offset:2px; }\n.lk-text { margin-top:12px; font-size:15px; line-height:1.5; }\n.lk-text summary { min-height:44px; display:flex; align-items:center; cursor:pointer; font-weight:600; }\n.lk-text h3 { font-family:var(--lk-titel); font-size:16px; margin:14px 0 4px; }\n.lk-text p { margin:0 0 6px; }\n.lk-text .lk-ref { color:var(--muted,#6F6857); font-size:13px; }\n@media (prefers-reduced-motion: reduce) { .lk-szenen .stage { transition:none; } }\n/* Paragrafen-Verweise nie verdrehen (RTL-Sprachen), Regel 8 der Sprachen-Notiz */\n.lk-szenen .rf, .lk-szenen .step .rf, .lk-text .lk-ref { unicode-bidi:plaintext; }\n/* Schriften ohne Playfair-Zeichen (ar, ckb, ur, hi, fa, ps, el, am, ti): Überschriften in Barlow, mehr Zeilenhöhe */\n.lk-barlow { --lk-titel:var(--ff-body,'Barlow',sans-serif); }\n.lk-barlow .ttl, .lk-barlow .nm, .lk-barlow .merk, .lk-barlow .bigcard, .lk-barlow .lk-kopf, .lk-barlow .lk-text h3 { font-weight:700; }\n.lk[lang=\"ur\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ur\"] .lk-text, .lk[lang=\"ur\"] .lk-intro { line-height:1.7; }\n.lk[lang=\"ps\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ps\"] .lk-text, .lk[lang=\"ps\"] .lk-intro { line-height:1.55; }\n";
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
      z.push({ t: t, xV: xV, xH: xH, vV: vV, vH: vH, bremstV: t >= 0, bremstH: t >= o.reaktion, abstand: xV - xH });
      if (xV - xH <= 0 && kollision == null) kollision = t;
      vV = Math.max(0, vV - o.aVorn * dt); xV += vV * dt;
      if (t >= o.reaktion) vH = Math.max(0, vH - o.aHinten * dt);
      xH += vH * dt;
    }
    return { zustaende: z, dt: dt, kollision: kollision, minAbstand: Math.min.apply(null, z.map((q) => q.abstand)), bei: function (t) { return z[Math.max(0, Math.min(n, Math.round(t / dt)))]; } };
  }


  /* ---------- Sozialvorschriften (Film 8.1): Lenk-, Pausen- und Ruhezeiten nach VO (EG) Nr. 561/2006 ----------
     Regeln (Wortlaut Stand Konsolidierung 2020/21, gelesen am 08.10.2026): Art. 6 Abs. 1 (9 h, zweimal je Woche 10 h), Art. 7 (nach 4,5 h Lenkdauer 45 min Pause,
     ersatzweise erst ≥ 15 min, danach ≥ 30 min), Art. 8 Abs. 2 (24-Stunden-Zeitraum; Teil der Ruhezeit im Zeitraum ≥ 11 h regelmäßig, 9 bis < 11 h reduziert), Art. 4 Buchst. g.
     ev: Liste { art: "fahren" | "arbeit" | "pause" | "ruhe", min } in zeitlicher Reihenfolge ab dem Ende der vorigen Ruhezeit; die letzte Ruhe ist die Tagesruhe.
     Gibt { fehler: [..], lenkMin, ruhe: "regelmaessig" | "reduziert" | "zuKurz" | null } zurück. */
  function pruefeTag(ev, opt) {
    opt = opt || {};
    const fehler = []; let seit = 0, teil15 = false, lenk = 0, zeit = 0, ruheTeil = null; const ruheListe = [];
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.art === "fahren") {
        seit += e.min; lenk += e.min; zeit += e.min;
        if (seit > 270) fehler.push("Lenkdauer über 4:30 h ohne ausreichende Pause (nach " + zeit + " min)");
      } else if (e.art === "arbeit") { zeit += e.min; }
      else if (e.art === "pause") {
        zeit += e.min;
        if (e.min >= 45) { seit = 0; teil15 = false; }
        else if (e.min >= 30 && teil15) { seit = 0; teil15 = false; }
        else if (e.min >= 15 && !teil15) { teil15 = true; }
      } else if (e.art === "ruhe") {
        zeit += 0; ruheListe.push(Math.min(e.min, 24 * 60 - zeit)); zeit += e.min;
      }
    }
    // tägliche Ruhezeit (Art. 4 Buchst. g, Art. 8 Abs. 2): eine Ruhezeit ≥ 11 h regelmäßig, ≥ 9 h reduziert; zwei Abschnitte: erst ≥ 3 h, dann ≥ 9 h = regelmäßig, geteilt
    if (ruheListe.length === 1) ruheTeil = ruheListe[0] >= 660 ? "regelmaessig" : ruheListe[0] >= 540 ? "reduziert" : "zuKurz";
    else if (ruheListe.length === 2) ruheTeil = ruheListe[0] >= 180 && ruheListe[1] >= 540 ? "regelmaessigGeteilt" : "zuKurz";
    if (ruheTeil === "zuKurz") fehler.push("Tagesruhe im 24-Stunden-Zeitraum kürzer als 9 h");
    const grenze = opt.verlaengert ? 600 : 540;
    if (lenk > grenze) fehler.push("Tageslenkzeit über " + (grenze / 60) + " h");
    return { fehler: fehler, lenkMin: lenk, ruhe: ruheTeil, ok: fehler.length === 0 };
  }

  // Verlauf der „Lenkdauer seit der letzten anrechenbaren Pause“ (Art. 7) zu einer Minute m des Ablaufs ev (für das Messgerät im Film 8.1)
  function lenkdauerBei(ev, m) {
    let seit = 0, teil15 = false, t = 0, lenk = 0;
    for (let i = 0; i < ev.length && t < m; i++) {
      const e = ev[i], d = Math.min(e.min, m - t), voll = d >= e.min;
      if (e.art === "fahren") { seit += d; lenk += d; }
      else if (e.art === "pause" && voll) {
        if (e.min >= 45) { seit = 0; teil15 = false; } else if (e.min >= 30 && teil15) { seit = 0; teil15 = false; } else if (e.min >= 15 && !teil15) teil15 = true;
      }
      t += d;
    }
    return { seit: seit, lenk: lenk, teil15: teil15 };
  }
  // Woche: Lenkstunden je Tag (Mo..So) -> Prüfung Art. 6 Abs. 1–3 (Tag 9 h, höchstens zweimal 10 h; Woche 56 h; zwei Wochen 90 h)
  function pruefeWochen(wochen) {
    const fehler = []; let vorher = null;
    wochen.forEach((w, k) => {
      const summe = w.reduce((a, b) => a + b, 0), lang = w.filter((h) => h > 9).length;
      if (w.some((h) => h > 10)) fehler.push("Woche " + (k + 1) + ": ein Tag über 10 h");
      if (lang > 2) fehler.push("Woche " + (k + 1) + ": mehr als zweimal über 9 h");
      if (summe > 56) fehler.push("Woche " + (k + 1) + ": " + summe + " h über 56 h");
      if (vorher != null && vorher + summe > 90) fehler.push("Woche " + k + " und " + (k + 1) + ": " + (vorher + summe) + " h über 90 h");
      vorher = summe;
    });
    return { fehler: fehler, ok: fehler.length === 0 };
  }

  /* ---------- Sichtfeld des Fahrers (Film 5.2 „Toter Winkel“) ----------
     Vereinfachtes Modell eines Solo-Lkw (Maße schematisch, siehe SICHT): Draufsicht, Koordinaten im Fahrzeug (Ursprung Hinterachse, x vorn, y rechts).
     Direkt gesehen wird, was hinter der Unterkante einer Scheibe liegt (Strahl von der Augenhöhe über die Kante auf den Boden, Höhe des Objekts zählt);
     Spiegel sind Sichtkeile ab der Spiegelposition nach hinten; der eigene Aufbau verdeckt (Strahl-Rechteck-Test). Kein Frontspiegel, keine Kamera. */
  const SICHT = {
    he: 2.55, hw: 1.85, hs: 1.35,                       // Augenhöhe, Unterkante Frontscheibe, Unterkante Seitenscheibe (m)
    spiegel: [                                            // Keile: Achsrichtung nach hinten, um phi nach außen gedreht, Halbwinkel alpha, Reichweite
      { id: "haupt", seite: 1, phi: 5, alpha: 7.5, reichweite: 50 }, { id: "weit", seite: 1, phi: 22, alpha: 12, reichweite: 30 },
      { id: "haupt", seite: -1, phi: 5, alpha: 7.5, reichweite: 50 }, { id: "weit", seite: -1, phi: 22, alpha: 12, reichweite: 30 }
    ]
  };
  function sichtfeld(fz) {
    const b2 = fz.breite / 2, xv = fz.L + fz.vorn, kl = 2.3;
    const auge = { x: xv - 1.45, y: -0.55 }, mx = xv - 1.35 + 0.17, my = b2 + 0.4;
    // Öffnungen: Frontscheibe (Ebene x = xv), rechte und linke Seitenscheibe (Ebene y = ±(b2 − 0.1))
    const oeff = [
      { id: "front", A: { x: xv, y: -b2 + 0.16 }, B: { x: xv, y: b2 - 0.16 }, h: SICHT.hw },
      { id: "rechts", A: { x: auge.x - 0.4, y: b2 - 0.1 }, B: { x: auge.x + 0.4, y: b2 - 0.1 }, h: SICHT.hs },
      { id: "links", A: { x: auge.x - 0.4, y: -b2 + 0.1 }, B: { x: auge.x + 0.4, y: -b2 + 0.1 }, h: SICHT.hs }
    ];
    const spiegel = SICHT.spiegel.map(function (m) {
      const ph = m.phi * Math.PI / 180, al = m.alpha * Math.PI / 180;
      return { id: m.id, seite: m.seite, pos: { x: mx, y: m.seite * my }, achse: Math.atan2(m.seite * Math.sin(ph), -Math.cos(ph)), halb: al, reichweite: m.reichweite };
    });
    const koerper = { x0: -fz.hinten, x1: xv, y0: -b2, y1: b2 };
    function schnittKoerper(a, b) {     // Strecke a→b trifft das Rechteck?
      const r = koerper; let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y;
      const pr = [-dx, dx, -dy, dy], qr = [a.x - r.x0 - 1e-9, r.x1 - a.x - 1e-9, a.y - r.y0 - 1e-9, r.y1 - a.y - 1e-9];
      for (let i = 0; i < 4; i++) {
        if (pr[i] === 0) { if (qr[i] < 0) return false; } else {
          const u = qr[i] / pr[i]; if (pr[i] < 0) { if (u > t1) return false; if (u > t0) t0 = u; } else { if (u < t0) return false; if (u < t1) t1 = u; }
        }
      }
      return t0 < t1;
    }
    // Strahl vom Auge durch die Öffnung: sichtbar, wenn der Punkt hinter der auf Faktor k gestreckten Öffnungslinie liegt
    function ueberOeffnung(o, x, y, ho) {
      const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - o.h));
      const ax = auge.x + k * (o.A.x - auge.x), ay = auge.y + k * (o.A.y - auge.y), bx = auge.x + k * (o.B.x - auge.x), by = auge.y + k * (o.B.y - auge.y);
      const dx = x - auge.x, dy = y - auge.y, ex = bx - ax, ey = by - ay, det = dx * (-ey) - dy * (-ex);
      if (Math.abs(det) < 1e-12) return false;
      const rx = ax - auge.x, ry = ay - auge.y, t = (rx * (-ey) - ry * (-ex)) / det, u = (dx * ry - dy * rx) / det;
      return u >= 0 && u <= 1 && t > 0 && t <= 1;   // Punkt liegt (auf dem Strahl) hinter oder auf der gestreckten Öffnungslinie
    }
    function imKeil(m, x, y) {
      const dx = x - m.pos.x, dy = y - m.pos.y, d = Math.hypot(dx, dy); if (d > m.reichweite || d < 0.3) return false;
      let w = Math.atan2(dy, dx) - m.achse; while (w > Math.PI) w -= 2 * Math.PI; while (w < -Math.PI) w += 2 * Math.PI;
      return Math.abs(w) <= m.halb && !schnittKoerper(m.pos, { x: x, y: y });
    }
    /* Quelle der Sicht: "front" | "rechts" | "links" | spiegel-id+Seite | null (verdeckt). ho = Höhe des Objekts (m) */
    function quelle(x, y, ho) {
      ho = ho || 0;
      if (x >= koerper.x0 && x <= koerper.x1 && y >= koerper.y0 && y <= koerper.y1) return "fahrzeug";
      for (let i = 0; i < oeff.length; i++) if (ueberOeffnung(oeff[i], x, y, ho)) return oeff[i].id;
      for (let i = 0; i < spiegel.length; i++) if (imKeil(spiegel[i], x, y)) return spiegel[i].id + (spiegel[i].seite > 0 ? "R" : "L");
      return null;
    }
    return { auge: auge, oeff: oeff, spiegel: spiegel, koerper: koerper, quelle: quelle, sichtbar: (x, y, ho) => { const q = quelle(x, y, ho); return q != null && q !== "fahrzeug"; } };
  }
  // Weltpunkt -> Fahrzeugkoordinaten (z: Zustand der Simulation mit A, hz)
  function insFahrzeug(z, p) { const c = Math.cos(z.hz), s = Math.sin(z.hz), dx = p.x - z.A.x, dy = p.y - z.A.y; return { x: c * dx + s * dy, y: -s * dx + c * dy }; }


  // Kleinster Abstand zweier Vielecke (0, wenn sie sich berühren oder überlappen); Eckenlisten [{x,y}]
  function polyAbstand(P, Q) {
    const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
    const segD = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0; return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
    if (P.some((p) => inside(p, Q)) || Q.some((q) => inside(q, P))) return 0;
    let d = Infinity;
    P.forEach((p, i) => { const n = Q.length; for (let j = 0; j < n; j++) d = Math.min(d, segD(p, Q[j], Q[(j + 1) % n])); });
    Q.forEach((q, i) => { const n = P.length; for (let j = 0; j < n; j++) d = Math.min(d, segD(q, P[j], P[(j + 1) % n])); });
    return d;
  }
  // Wie weit vor der Stoßstange (m) ein Objekt der Höhe ho vom Fahrerauge aus noch verdeckt ist (Strahl über die Unterkante der Frontscheibe)
  function verdecktVorn(ho) { const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - SICHT.hw)); return 1.45 * (k - 1); }

  /* ---------- Rechtsabbiegen mit Radfahrer (Film 5.2) ----------
     Weltkoordinaten der Rechnung: der Lkw fährt in x-Richtung, die Vorderachse beginnt die Rechtskurve (Radius 10,75 m) bei x = 32 m; y nach rechts.
     Der Radfahrer fährt auf dem Radstreifen rechts vom Lkw geradeaus (y = 2,4 m, Länge 1,8 m, Breite 0,6 m, Höhe der Sichtprobe 1,0 m).
     art "A": Lkw wird langsamer, biegt ab, ohne neu zu schauen. art "B": Lkw hält vor dem Abbiegen, lässt den Radfahrer durch, biegt dann mit Schrittgeschwindigkeit ab. */
  const ABBIEGEN = { R: 10.75, S0: 32, dt: 0.05, yb: 2.4, vb: 4.0, xb0: 9, s0: 9, v0: 5.0, v1: 3.5, ta: 2.0, vSchritt: 1.8, sBremse: 21.7, aBremse: 1.5, stopp: 0.2 };
  function radfahrerAbbiegen(art, opt) {
    const P = Object.assign({}, ABBIEGEN, opt || {}), fz = FAHRZEUGE.solo, sf = sichtfeld(fz);
    const bogenL = P.R * Math.PI / 2, b = bahn([{ gerade: P.S0 }, { bogen: P.R, winkel: Math.PI / 2, rechts: true }, { gerade: 60 }]);
    const sim = simuliere(fz, b, 0, P.S0 + bogenL + 40, P.dt), zs = (s) => sim.zustaende[Math.max(0, Math.min(sim.zustaende.length - 1, Math.round(s / P.dt)))];
    const frames = []; let s = P.s0, v = art === "B" ? P.v0 : P.v0, t = 0, haelt = false, losBei = null, kontakt = false;
    for (let i = 0; i < 4000; i++) {
      t = i * P.dt;
      const bx = P.xb0 + P.vb * t, z = zs(s);
      const bp = [{ x: bx - 0.9, y: P.yb - 0.3 }, { x: bx + 0.9, y: P.yb - 0.3 }, { x: bx + 0.9, y: P.yb + 0.3 }, { x: bx - 0.9, y: P.yb + 0.3 }];
      const d = polyAbstand(koerper(fz, z)[0].poly, bp);
      // Sicht: Radfahrer wird gesehen, wenn mindestens ein Punkt (hinten, Mitte, vorn) sichtbar ist
      let art2 = "verdeckt";
      [bx + 0.8, bx, bx - 0.8].forEach(function (x) { const l = insFahrzeug(z, { x: x, y: P.yb }), q = sf.quelle(l.x, l.y, 1.0); if (q && q !== "fahrzeug") { if (/^(haupt|weit)/.test(q)) art2 = "spiegel"; else if (art2 === "verdeckt") art2 = "scheibe"; } });
      frames.push({ t: t, s: s, z: z, v: v, bx: bx, by: P.yb, abstand: d, sicht: art2 });
      if (art === "A" && d < P.stopp) { kontakt = true; break; }
      if (s > P.S0 + bogenL + 14) break;
      // Lkw-Geschwindigkeit
      if (art === "A") v = t < P.ta ? P.v0 + (P.v1 - P.v0) * t / P.ta : P.v1;
      else {
        if (losBei == null) {
          if (s >= P.sBremse) v = Math.max(0, v - P.aBremse * P.dt);       // bremsen bis zum Stillstand
          if (v === 0 && s >= P.sBremse) { haelt = true; if (bx - 0.9 > P.S0 + P.R + 3) losBei = t; }   // erst wenn der Radfahrer vorbei ist
        } else v = Math.min(P.vSchritt, v + 1.8 * P.dt);
      }
      s += v * P.dt;
    }
    return { frames: frames, kontakt: kontakt, P: P, losBei: losBei, bogenL: bogenL, minAbstand: Math.min.apply(null, frames.map((f) => f.abstand)) };
  }

  // Umrisse der Sichtfelder (Meter im Fahrzeug) zum Zeichnen: Spiegelkeile mit Schatten des Aufbaus (Strahlverfolgung), Blickfelder durch die Scheiben (Boden)
  function sichtPolygone(fz, ho) {
    ho = ho || 0;
    const sf = sichtfeld(fz), r = sf.koerper, out = { spiegel: [], scheibe: [] };
    function trifftKoerper(o, w) {      // Abstand bis zum Rechteck entlang des Strahls (Infinity: kein Treffer)
      const dx = Math.cos(w), dy = Math.sin(w); let t0 = 0, t1 = Infinity;
      const pr = [-dx, dx, -dy, dy], qr = [o.x - r.x0, r.x1 - o.x, o.y - r.y0, r.y1 - o.y];
      for (let i = 0; i < 4; i++) {
        if (Math.abs(pr[i]) < 1e-12) { if (qr[i] < 0) return Infinity; } else {
          const u = qr[i] / pr[i]; if (pr[i] < 0) { if (u > t1) return Infinity; if (u > t0) t0 = u; } else { if (u < t0) return Infinity; if (u < t1) t1 = u; }
        }
      }
      return t0 < t1 && t0 > 1e-6 ? t0 : Infinity;
    }
    sf.spiegel.forEach(function (m) {
      const pts = [{ x: m.pos.x, y: m.pos.y }], n = 24;
      for (let k = 0; k <= n; k++) { const w = m.achse - m.halb + (2 * m.halb) * k / n, d = Math.min(m.reichweite, trifftKoerper(m.pos, w)); pts.push({ x: m.pos.x + d * Math.cos(w), y: m.pos.y + d * Math.sin(w) }); }
      out.spiegel.push({ id: m.id, seite: m.seite, pts: pts });
    });
    sf.oeff.forEach(function (o) {
      const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - o.h)), ex = (p, f) => ({ x: sf.auge.x + f * (p.x - sf.auge.x), y: sf.auge.y + f * (p.y - sf.auge.y) });
      const dA = Math.hypot(o.A.x - sf.auge.x, o.A.y - sf.auge.y), dB = Math.hypot(o.B.x - sf.auge.x, o.B.y - sf.auge.y), far = 12;
      out.scheibe.push({ id: o.id, pts: [ex(o.A, k), ex(o.B, k), ex(o.B, Math.max(k, far / dB)), ex(o.A, Math.max(k, far / dA))] });
    });
    return out;
  }

  /* ---------- Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Prinzipmodell, Drücke als Anteil 0…1 (keine bar-Werte) ----------
     Das Modell bildet die Wirkrichtung ab, nicht die Größe: wer Druck hat, bremst; wer Vorrat hat, kann bremsen; Feder bremst, Luft löst. */
  const DRUCK = { schwelle: 0.5 };   // Versorgungsdruck, ab dem die Anhängerbremse „versorgt“ ist (Anteil des vollen Vorratsdrucks)
  // Zweikreis-Betriebsbremse: zwei voneinander getrennte Bremskreise (z. B. Vorder- und Hinterachse); jeder hat eigenen Vorrat
  function zweikreis(o) {
    const pedal = Math.max(0, Math.min(1, o.pedal || 0)), leck = o.leck || [false, false];
    const vorrat = leck.map((l) => (l ? 0 : 1)), zyl = vorrat.map((v) => Math.min(v, pedal));
    return { vorrat: vorrat, zyl: zyl, wirkung: (zyl[0] + zyl[1]) / 2, kreiseOk: vorrat.filter((v) => v > 0).length };
  }
  // Anhängerbremsventil der Zweileitungsbremse: rot = Vorratsleitung (versorgt, hält den Anhänger gelöst), gelb = Bremsleitung (Steuerdruck: Druck rein = bremsen)
  // Fällt der Druck in der roten Leitung unter die Schwelle, bremst der Anhänger selbsttätig aus seinem eigenen Vorratsbehälter.
  function anhaengerBremse(o) {
    const rot = o.rot, gelb = o.gelb, vorrat = o.vorratAnh == null ? 1 : o.vorratAnh;
    const versorgt = rot >= DRUCK.schwelle;
    const zyl = versorgt ? Math.min(gelb, vorrat) : vorrat;
    return { versorgt: versorgt, zyl: zyl, selbsttaetig: !versorgt && vorrat > 0, gebremst: zyl > 0.05, vomZugSteuerbar: versorgt && o.gelbVerbunden !== false };
  }
  // Kombizylinder (Betriebsbremse = Membran, Feststell-/Hilfsbremse = Federspeicher): Feder bremst, Druck im Federspeicherraum löst
  const FEDER = { haltedruck: 0.6 };   // ab diesem Anteil des Vorratsdrucks ist die Feder ganz gespannt (Bremse gelöst)
  function federspeicher(o) {
    const pF = Math.max(0, Math.min(1, o.pFeder)), pM = Math.max(0, Math.min(1, o.pMembran || 0));
    const federKraft = Math.max(0, 1 - pF / FEDER.haltedruck);             // 1 = Feder voll entspannt (volle Federkraft), 0 = ganz gespannt
    const kraft = Math.min(1, federKraft + pM);                             // Betriebsbremse und Feder addieren sich (Begrenzung auf volle Bremskraft)
    return { federKraft: federKraft, kraft: kraft, geloest: federKraft === 0 && pM === 0, gebremst: kraft > 0.02 };
  }
  // Anschlussreihenfolge Zug ↔ Anhänger: Zustand nach jedem Schritt (rot = Vorratsleitung, gelb = Bremsleitung)
  function kuppelnZustand(verbunden) {
    const rot = !!verbunden.rot, gelb = !!verbunden.gelb;
    const angehaengt = verbunden.angehaengt !== false;
    // Ohne Versorgung (rot nicht verbunden) bremst der Anhänger selbsttätig; mit Versorgung ist er gelöst
    const ab = anhaengerBremse({ rot: rot ? 1 : 0, gelb: 0, vorratAnh: 1, gelbVerbunden: gelb });
    const geloest = ab.versorgt;
    const unsicher = geloest && !gelb;     // Anhänger gelöst, aber der Zug kann ihn nicht bremsen
    return { geloest: geloest, bremstSelbst: ab.selbsttaetig, vomZugSteuerbar: geloest && gelb, unsicher: unsicher };
  }

  /* ---------- Sattelzug kuppeln (Filme 3.1, 3.2, 3.3): Beispielhöhen eines neutralen Fahrzeugs, Prüfungen für Höhe, Fluchten und Wegrollen ---------- */
  const SATTEL = { unterkante: 1.30, plattenOben: 1.25, zapfenUnten: 1.18, fluchtToleranz: 0.10, e: 0.55 };   // m; Zapfen ragt 0,12 m unter die Aufgleitplatte, Sattelplatte soll ihn seitlich fassen
  // Höhe: Die Sattelplatte muss beim Unterfahren unter dem Zapfen und der Aufgleitplatte bleiben; erst danach wird die Zugmaschine bis zum Kontakt angehoben (Auflieger darf nicht angehoben werden)
  function sattelUnterfahren(luft) {
    const oben = SATTEL.plattenOben + luft;
    return { plattenOben: oben, passtUnter: oben < SATTEL.zapfenUnten - 1e-9, kontakt: oben >= SATTEL.unterkante - 1e-9, hebtAuf: oben > SATTEL.unterkante + 1e-9 };
  }
  // Fluchten: Die Zugmaschine fährt gerade zurück; sie startet mit seitlichem Versatz (m) und Winkel (Grad) zur Auflieger-Mittellinie, Weg bis zum Zapfen d (m)
  function sattelTreffer(o) {
    const quer = (o.versatz || 0) + (o.abstand || 6) * Math.tan((o.winkel || 0) * Math.PI / 180);
    return { quer: quer, ok: Math.abs(quer) <= SATTEL.fluchtToleranz };
  }
  // Wegrollen beim Anschließen der roten Leitung (DGUV Information 214-080): Rot löst die Betriebsbremse des Anhängers; ohne Feststellbremse und Keile rollt der Zug schon bei kleinem Gefälle
  function rollen(o) {
    const betriebsbremseAnhaenger = !o.rot;                          // rot angeschlossen = Betriebsbremse des Anhängers gelöst
    const gesichert = !!(o.festZug || o.festAnh || o.keile);
    return { rollt: !betriebsbremseAnhaenger && !gesichert && (o.gefaelle || 0) > 0, betriebsbremseAnhaenger: betriebsbremseAnhaenger, gesichert: gesichert };
  }

  // Abreißen (Film 6.2): Was passiert mit dem Anhänger, wenn die rote Vorratsleitung bzw. nur die gelbe Bremsleitung abreißt?
  // rot weg: Druckabfall in der Vorratsleitung → Anhänger bremst sofort selbsttätig (aus dem eigenen Vorrat). gelb weg: beim Fahren unbemerkt; erst wenn die Zugmaschine bremst, fehlt der Gegendruck,
  // das Anhängersteuerventil entlüftet die rote Leitung und der Anhänger bremst. Die Bremskreise der Zugmaschine bleiben durch Überström- und Vierkreisschutzventil gefüllt.
  function abreissen(o) {
    const rot = !!o.rot, gelb = !!o.gelb && !rot, bremst = !!o.bremst;
    return { anhaengerBremst: rot || (gelb && bremst), sofort: rot, wartetAufBremsung: gelb && !bremst, zugBremstWeiter: true };
  }
  // Zeit-Weg des Abreißens: beide Fahrzeuge fahren mit v0; die Kupplung reißt bei t = 0; der Anhänger bremst nach der Verzögerung tV mit a, die Zugmaschine bremst nach der Reaktionszeit tR mit aZ
  function abrissFahrt(o) {
    const P = Object.assign({ v0: 15, tV: 0.4, a: 4.5, tR: 1.2, aZ: 3.0, dt: 0.02, dauer: 12 }, o || {}), n = Math.round(P.dauer / P.dt) + 1, z = [];
    let xA = 0, vA = P.v0, xZ = 0, vZ = P.v0;
    for (let i = 0; i < n; i++) {
      const t = i * P.dt; z.push({ t: t, xA: xA, vA: vA, bremstA: t >= P.tV && vA > 0, xZ: xZ, vZ: vZ, bremstZ: t >= P.tR && vZ > 0 });
      if (t >= P.tV) vA = Math.max(0, vA - P.a * P.dt); if (t >= P.tR) vZ = Math.max(0, vZ - P.aZ * P.dt);
      xA += vA * P.dt; xZ += vZ * P.dt;
    }
    return { zustaende: z, P: P };
  }

  const api = { lenkdauerBei: lenkdauerBei, pruefeTag: pruefeTag, pruefeWochen: pruefeWochen, folgefahrt: folgefahrt, FAHRZEUGE: FAHRZEUGE, bahn: bahn, simuliere: simuliere, koerper: koerper, rechteck: rechteck, maxUeberschnitt: maxUeberschnitt, gesamtLaenge: gesamtLaenge, radien: radien, vorderachsRadius: vorderachsRadius, innenRadius: innenRadius, abstandLinks: abstandLinks, folge: folge, SICHT: SICHT, sichtfeld: sichtfeld, insFahrzeug: insFahrzeug, polyAbstand: polyAbstand, verdecktVorn: verdecktVorn, radfahrerAbbiegen: radfahrerAbbiegen, ABBIEGEN: ABBIEGEN, sichtPolygone: sichtPolygone, zweikreis: zweikreis, anhaengerBremse: anhaengerBremse, federspeicher: federspeicher, kuppelnZustand: kuppelnZustand, DRUCK: DRUCK, FEDER: FEDER, SATTEL: SATTEL, sattelUnterfahren: sattelUnterfahren, sattelTreffer: sattelTreffer, rollen: rollen, abreissen: abreissen, abrissFahrt: abrissFahrt };
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
  function ruecklichter(g, xh, b2, blinker, halos, hid, blinkerL, halosL) {
    rect(g, xh, b2 - 0.55, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03); rect(g, xh, -b2 + 0.23, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03);
    // Blinker rechts hinten (Fahrtrichtung rechts = +y), links stets aus
    blinker.push(rect(g, xh, b2 - 0.25, 0.12, 0.22, FARBE.blinkAus, "none", 0.03)); halo(g, xh - 0.1, b2 - 0.25, 0.12, 0.22, halos, hid);
    blinkerL.push(rect(g, xh, -b2 + 0.03, 0.12, 0.22, FARBE.blinkAus, "none", 0.03)); halo(g, xh - 0.1, -b2 + 0.03, 0.12, 0.22, halosL, hid);
  }

  function fahrzeug(layer, fz, W, o) {
    o = o || {};
    const S = W.S, b2 = fz.breite / 2, blinker = [], halos = [], bremsen = [], blinkerL = [], halosL = [], rv = {};
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
    blinkerL.push(rect(gZug, xv - 0.2, -b2 + 0.02, 0.2, 0.24, FARBE.blinkAus, "none", 0.04)); halo(gZug, xv, -b2 + 0.02, 0.2, 0.24, halosL, W.haloId);
    if (!fz.anh) { ruecklichter(gZug, -fz.hinten, b2, blinker, halos, W.haloId, blinkerL, halosL); bremslicht(gZug, -fz.hinten, b2, bremsen); }

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
      ruecklichter(gAnh, x0, b2, blinker, halos, W.haloId, blinkerL, halosL); bremslicht(gAnh, x0, b2, bremsen);
    }

    const obj = {
      /* z: Rechenzustand (modell.simuliere), blink: 0 oder 1 */
      setze: function (z, blink, bremst, blinkL) {
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
        blinkerL.forEach((l) => l.setAttribute("fill", blinkL ? FARBE.blinkAn : FARBE.blinkAus));
        halosL.forEach((h) => h.setAttribute("opacity", blinkL ? 0.9 : 0));
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
    d.style.cssText = "position:absolute;width:max-content;max-width:" + ((o.klasse || "").indexOf("gross") >= 0 ? 900 : 520) + "px;" + h + ";top:" + y + "px;transform:" + tr + ";opacity:0" + (o.farbe ? ";border-color:" + o.farbe : "");
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


  /* ---------- Pkw von oben (Ursprung Mitte, x vorn) ---------- */
  function pkwOben(layer, W, farbe) {
    const g = el("g", null, layer), S = W.S;
    g.style.filter = "drop-shadow(0 " + (5 / S).toFixed(3) + "px " + (5 / S).toFixed(3) + "px rgba(0,0,0,.4))";
    const c = farbe || "#D9954C", d = "#8F5A14";
    [[-1.35, 0.95], [-1.35, -0.95], [1.4, 0.95], [1.4, -0.95]].forEach((p) => rect(g, p[0] - 0.33, p[1] - 0.12, 0.66, 0.26, FARBE.reifen, "none", 0.08));
    rect(g, -2.2, -0.9, 4.4, 1.8, c, d, 0.45, 0.07);
    rect(g, -0.6, -0.72, 1.7, 1.44, "#E8B77F", d, 0.3, 0.05);
    rect(g, 0.55, -0.7, 0.45, 1.4, FARBE.glas, "none", 0.15); rect(g, -1.05, -0.66, 0.35, 1.32, FARBE.glas, "none", 0.12);
    rect(g, 2.1, 0.45, 0.1, 0.3, FARBE.scheinwerfer, "none", 0.04); rect(g, 2.1, -0.75, 0.1, 0.3, FARBE.scheinwerfer, "none", 0.04);
    rect(g, -2.2, 0.45, 0.1, 0.3, FARBE.ruecklicht, "none", 0.04); rect(g, -2.2, -0.75, 0.1, 0.3, FARBE.ruecklicht, "none", 0.04);
    const bl = rect(g, 2.0, 0.78, 0.2, 0.14, FARBE.blinkAus, "none", 0.04), bll = rect(g, 2.0, -0.92, 0.2, 0.14, FARBE.blinkAus, "none", 0.04);
    return { g: g, laenge: 4.4, setze: function (x, y, h, blinkR, blinkL) {
      const p = W.px(x, y); g.setAttribute("transform", "translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(h * DEG) + ") scale(" + S + ")");
      bl.setAttribute("fill", blinkR ? FARBE.blinkAn : FARBE.blinkAus); bll.setAttribute("fill", blinkL ? FARBE.blinkAn : FARBE.blinkAus);
    } };
  }
  window.LKW_BK = { pkwOben: pkwOben, FARBE: FARBE, el: el, welt: welt, fahrzeug: fahrzeug, fussflaeche: fussflaeche, spur: spur, band: band, pille: pille, leitlinie: leitlinie, mass: mass, f: f, DEG: DEG };
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

// ---- kern/seite.js ----
(function (window) {
/* Seitenansicht (Filme mit Abstand, Bremsen): Straße, Lkw und Pkw von der Seite, Maßklammer, mitlaufende Kamera.
   Fahrtrichtung nach RECHTS (Rechtsverkehr, wir sehen die Fahrerseite nicht: Seitenansicht von der Beifahrerseite des nach rechts fahrenden Fahrzeugs ist die rechte Seite; Details bleiben neutral).
   Alle Zeichnungen in Metern, Gruppe skaliert mit S Pixel je Meter. Kamera: camX = Weltposition, die auf px0 steht. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;

  function szene(stage, o) {
    o = o || {};
    const S = o.S || 12, px0 = o.px0 || 200, boden = o.boden || 760;
    const W = { S: S, boden: boden, px0: px0, cam: 0 };
    W.px = (x) => px0 + (x - W.cam) * S;
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#3A463F 55%,#434B45 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    // Hügel (Parallaxe) und Straße
    const huegel = el("path", { fill: "#2F3B35" }, svg);
    el("rect", { x: 0, y: boden, width: 1080, height: 1080 - boden, fill: "#4A524C" }, svg);
    el("rect", { x: 0, y: boden, width: 1080, height: 8, fill: "#7A837C" }, svg);
    el("rect", { x: 0, y: boden + 8, width: 1080, height: 60, fill: "#3F4742" }, svg);      // Fahrbahnrand (Seitenstreifen)
    const marken = el("g", null, svg), ticks = el("g", null, svg);
    W.gFz = el("g", null, svg); W.gUeber = el("g", null, svg);
    // Streckenmarken alle 10 m (Maßstab): Striche auf dem Boden; alle 50 m kräftiger
    const strich = [];
    for (let i = -10; i < 120; i++) { const l = el("line", { y1: boden + 20, y2: boden + 46, stroke: "rgba(250,246,236,.32)", "stroke-width": 3 }, ticks); strich.push([l, i * 10]); }
    const mittel = []; for (const dy of [130, 215]) for (let i = -10; i < 130; i++) { const r = el("rect", { y: boden + dy, width: 3 * S, height: 6, fill: "rgba(250,246,236,.55)" }, marken); mittel.push([r, i * 8]); }
    W.kamera = function (x) {
      W.cam = x;
      strich.forEach((s) => { const p = W.px(s[1]); s[0].setAttribute("x1", f(p)); s[0].setAttribute("x2", f(p)); });
      mittel.forEach((s) => s[0].setAttribute("x", f(W.px(s[1]))));
      const sh = -((x * S * 0.12) % 360); let d = "M" + (sh - 360) + " " + boden;
      for (let k = -1; k < 5; k++) { const b = sh + k * 360; d += " Q" + (b + 90) + " " + (boden - 130) + " " + (b + 180) + " " + (boden - 40) + " T" + (b + 360) + " " + boden; }
      huegel.setAttribute("d", d + " L1500 " + boden + " L-400 " + boden + " Z");
    };
    W.kamera(0);
    return W;
  }

  function rad(g, cx, r) {
    const w = el("g", { transform: "translate(" + cx + " -" + r + ")" }, g);
    el("circle", { r: r, fill: F.reifen, stroke: "#000", "stroke-width": 0.04 }, w);
    const dreh = el("g", null, w);
    el("circle", { r: r * 0.55, fill: "#8D949C" }, dreh);
    el("line", { x1: -r * 0.5, y1: 0, x2: r * 0.5, y2: 0, stroke: "#4B5057", "stroke-width": 0.09 }, dreh);
    el("line", { x1: 0, y1: -r * 0.5, x2: 0, y2: r * 0.5, stroke: "#4B5057", "stroke-width": 0.09 }, dreh);
    return dreh;
  }

  // Lkw (Kastenwagen) von der Seite. Ursprung: Boden unter der Stoßstange vorn, Fahrzeug erstreckt sich nach links (−8,4 m).
  function lkw(W, laenge) {
    const L = laenge || 8.4, g = el("g", null, W.gFz), s = W.S;
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    const dreher = [];
    el("rect", { x: -L, y: -1.0, width: L, height: 0.38, fill: "#3A3E43" }, g);
    el("rect", { x: -L, y: -3.45, width: L - 2.4, height: 2.55, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = -L + 0.9; x < -2.6; x += 1.2) el("line", { x1: x, y1: -3.35, x2: x, y2: -1.0, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    el("path", { d: "M-2.3 -0.9 L-2.3 -3.1 L-1.0 -3.1 L0 -1.85 L0 -0.9 Z", fill: F.kabine, stroke: F.kabineD, "stroke-width": 0.07 }, g);
    el("path", { d: "M-2.0 -1.9 L-2.0 -2.85 L-1.1 -2.85 L-0.45 -1.9 Z", fill: F.glas }, g);
    el("rect", { x: -0.12, y: -1.5, width: 0.12, height: 0.3, fill: F.scheinwerfer }, g);
    const brems = el("rect", { x: -L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: "#FF3B2B", opacity: 0 }, g);
    el("rect", { x: -L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: F.ruecklicht, opacity: 0.9 }, g);
    g.appendChild(brems);
    [-0.9, -L + 1.2, -L + 2.5].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: L, setze: function (xFront, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xFront)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }
  // Pkw von der Seite. Ursprung: Boden unter dem Heck; Fahrzeug erstreckt sich nach rechts (4,4 m).
  function pkw(W) {
    const g = el("g", null, W.gFz), s = W.S, dreher = [];
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("path", { d: "M0 -0.55 L0 -1.0 Q0.05 -1.15 0.6 -1.2 L1.2 -1.25 L1.9 -1.85 Q2.2 -2.0 3.0 -2.0 L3.5 -1.4 L4.2 -1.25 Q4.4 -1.2 4.4 -0.95 L4.4 -0.55 Z", fill: "#D9954C", stroke: "#8F5A14", "stroke-width": 0.06 }, g);
    el("path", { d: "M2.0 -1.25 L2.35 -1.8 L2.95 -1.8 L3.35 -1.25 Z", fill: F.glas }, g);
    el("rect", { x: 4.3, y: -1.15, width: 0.1, height: 0.22, fill: F.scheinwerfer }, g);
    el("rect", { x: -0.02, y: -1.05, width: 0.12, height: 0.25, fill: F.ruecklicht, opacity: 0.9 }, g);
    const brems = el("rect", { x: -0.02, y: -1.05, width: 0.12, height: 0.25, fill: "#FF3B2B", opacity: 0 }, g);
    [0.95, 3.45].forEach((cx) => dreher.push(rad(g, cx, 0.34)));
    return { g: g, laenge: 4.4, setze: function (xHeck, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xHeck)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.34) * 57.2958 % 360) + ")"));
    } };
  }

  // Reisebus von der Seite (Ursprung Boden unter der Front, erstreckt sich nach links 12 m)
  function bus(W) {
    const L = 12, g = el("g", null, W.gFz), s = W.S, dreher = [];
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: -L, y: -3.4, width: L, height: 2.75, rx: 0.4, fill: "#E7E1D0", stroke: F.kastenD, "stroke-width": 0.07 }, g);
    el("rect", { x: -L + 0.5, y: -3.0, width: L - 1.0, height: 1.0, rx: 0.15, fill: F.glas }, g);
    for (let x = -L + 2.2; x < -0.7; x += 2.2) el("line", { x1: x, y1: -3.0, x2: x, y2: -2.0, stroke: "#B9AE93", "stroke-width": 0.09 }, g);
    el("rect", { x: -L, y: -1.2, width: L, height: 0.2, fill: F.gold }, g);
    el("rect", { x: -0.12, y: -1.45, width: 0.12, height: 0.3, fill: F.scheinwerfer }, g);
    const brems = el("rect", { x: -L - 0.02, y: -1.6, width: 0.12, height: 0.4, fill: "#FF3B2B", opacity: 0 }, g);
    [-1.6, -L + 1.6, -L + 3.0].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: L, setze: function (xFront, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xFront)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }

  // Anhänger mit Deichsel (Zentralachs) von der Seite. Ursprung: Zugöse (vorn), Boden; Fahrzeug erstreckt sich nach links (Deichsel 1,6 m, Aufbau 7,5 m).
  function anhaenger(W) {
    const g = el("g", null, W.gFz), s = W.S, dreher = [], D = 1.6, L = 7.5;
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: -D, y: -1.05, width: D, height: 0.14, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.04 }, g);                   // Deichsel
    el("circle", { cx: 0, cy: -0.98, r: 0.2, fill: "none", stroke: "#C4C9CF", "stroke-width": 0.09 }, g);                                     // Zugöse
    el("rect", { x: -D - L, y: -1.0, width: L, height: 0.3, fill: "#3A3E43" }, g);
    el("rect", { x: -D - L, y: -3.45, width: L, height: 2.45, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = -D - L + 0.9; x < -D - 0.4; x += 1.2) el("line", { x1: x, y1: -3.35, x2: x, y2: -1.1, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    const glut = el("circle", { cx: -D - L, cy: -1.4, r: 0.55, fill: "rgba(255,59,43,.7)", opacity: 0 }, g);
    el("rect", { x: -D - L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: F.ruecklicht, opacity: 0.9 }, g);
    const brems = el("rect", { x: -D - L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: "#FF3B2B", opacity: 0 }, g);
    [-D - L + 2.2, -D - L + 3.5].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: D + L, setze: function (xTip, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xTip)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0); glut.setAttribute("opacity", bremst ? 0.45 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }
  // Maßklammer zwischen zwei Weltpunkten über der Straße (Pille mit Text kommt von außen)
  function klammer(W, y, farbe) {
    const g = el("g", { opacity: 0 }, W.gUeber), c = farbe || F.gold;
    const l = el("line", { y1: y, y2: y, stroke: c, "stroke-width": 5 }, g), a = el("line", { y1: y - 16, y2: y + 16, stroke: c, "stroke-width": 5 }, g), b = el("line", { y1: y - 16, y2: y + 16, stroke: c, "stroke-width": 5 }, g);
    const flaeche = el("rect", { y: y, height: W.boden - y, fill: c, opacity: 0.13 }, g);
    return { g: g, farbe: function (c2) { [l, a, b].forEach((e) => e.setAttribute("stroke", c2)); flaeche.setAttribute("fill", c2); }, setze: function (x1, x2) {
      const p1 = W.px(x1), p2 = W.px(x2);
      l.setAttribute("x1", f(p1)); l.setAttribute("x2", f(p2)); a.setAttribute("x1", f(p1)); a.setAttribute("x2", f(p1)); b.setAttribute("x1", f(p2)); b.setAttribute("x2", f(p2));
      flaeche.setAttribute("x", f(Math.min(p1, p2))); flaeche.setAttribute("width", f(Math.abs(p2 - p1)));
      return [(p1 + p2) / 2, y];
    } };
  }
  window.LKW_SEITE = { anhaenger: anhaenger, szene: szene, bus: bus, lkw: lkw, pkw: pkw, klammer: klammer };
})(window);

})(W);

// ---- kern/zeit.js ----
(function (window) {
/* Zeitbilder (Film 8.1 Lenk- und Ruhezeiten): 24-Stunden-Leiste, Mess-Balken, Wochenkalender.
   Reine Zeichnung aus Zahlen; die Regeln selbst prüft kern/modell.js (pruefeTag, pruefeWochen, lenkdauerBei). Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  const ART = { fahren: F.gold, pause: "#79C6EE", ruhe: "#8190E8", arbeit: "#A6ADA6" };

  function buehne(stage) {
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#36423B 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    return { svg: svg, g: el("g", null, svg), ueber: el("g", null, svg) };
  }
  function text(parent, t, x, y, o) {
    o = o || {};
    const e = el("text", { x: x, y: y, "text-anchor": o.anker || "middle", "font-size": o.gr || 30, "font-weight": o.fett ? 700 : 600, "font-family": "Barlow, sans-serif", fill: o.farbe || F.creme }, parent);
    e.textContent = t; return e;
  }
  const hm = (min) => Math.floor(min / 60) + ":" + String(Math.round(min % 60)).padStart(2, "0");

  /* 24-Stunden-Leiste. ev: [{art,min}], hNow: Stunden seit Beginn; x0..x1 = 0..24 h */
  function leiste(B, o) {
    const span = o.span || 24, tick = o.tick || (span > 12 ? 3 : 1), x0 = o.x0 || 70, x1 = o.x1 || 1010, y = o.y, h = o.h || 96, st = (x1 - x0) / span;
    const g = el("g", null, B.g);
    el("rect", { x: x0 - 6, y: y - 6, width: x1 - x0 + 12, height: h + 12, rx: 18, fill: "rgba(250,246,236,.07)", stroke: "rgba(250,246,236,.25)", "stroke-width": 2 }, g);
    for (let k = 0; k <= span; k += tick) { el("line", { x1: x0 + k * st, y1: y + h + 14, x2: x0 + k * st, y2: y + h + 30, stroke: "rgba(250,246,236,.5)", "stroke-width": 3 }, g); text(g, String(k), x0 + k * st, y + h + 62, { gr: 28, farbe: "rgba(250,246,236,.75)" }); }
    const segs = [], rahmen = el("g", { "clip-path": "inset(0 round 14px)" }, g);
    const marke = el("line", { y1: y - 16, y2: y + h + 16, stroke: F.creme, "stroke-width": 4 }, g);
    const api = {
      g: g, x0: x0, st: st, y: y, h: h,
      px: (hh) => x0 + hh * st,
      zeichne: function (ev, hNow, start) {
        start = start || 0; let m = start * 60;
        while (segs.length < ev.length) segs.push(el("rect", { y: y, height: h, rx: 6 }, g));
        ev.forEach((e, i) => {
          const a = m / 60, b = Math.min(hNow, (m + e.min) / 60), r = segs[i];
          if (b <= a) { r.setAttribute("width", 0); m += e.min; return; }
          r.setAttribute("x", f(x0 + a * st)); r.setAttribute("width", f((b - a) * st)); r.setAttribute("fill", ART[e.art]); r.setAttribute("stroke", "#1B1D1A"); r.setAttribute("stroke-width", 2);
          m += e.min;
        });
        const px = x0 + Math.min(span, hNow) * st; marke.setAttribute("x1", f(px)); marke.setAttribute("x2", f(px));
      },
      zeige: (a) => { g.style.opacity = a; }
    };
    return api;
  }

  /* Mess-Balken: Wert in Minuten, Maximum max; Marken [{min, farbe, text}] */
  function messer(B, o) {
    const x = o.x || 70, w = o.w || 940, y = o.y, h = o.h || 44, max = o.max;
    const g = el("g", null, B.g);
    el("rect", { x: x, y: y, width: w, height: h, rx: 14, fill: "rgba(250,246,236,.1)", stroke: "rgba(250,246,236,.3)", "stroke-width": 2 }, g);
    const fuell = el("rect", { x: x, y: y, width: 0, height: h, rx: 14, fill: ART.fahren }, g);
    const wert = text(g, "0:00", x + w - 16, y + h + 40, { anker: "end", gr: 38, fett: true });
    (o.marken || []).forEach((mk) => {
      const px = x + mk.min / max * w;
      el("line", { x1: px, y1: y - 12, x2: px, y2: y + h + 12, stroke: mk.farbe || F.creme, "stroke-width": 5 }, g);
      text(g, mk.text || hm(mk.min), px, y - 20, { gr: 30, fett: true, farbe: mk.farbe || F.creme });
    });
    return { g: g, setze: function (min, farbe) { fuell.setAttribute("width", f(Math.max(0, Math.min(1, min / max)) * w)); fuell.setAttribute("fill", farbe || ART.fahren); wert.textContent = hm(min); wert.setAttribute("fill", farbe && farbe !== ART.fahren ? farbe : F.creme); }, zeige: (a) => { g.style.opacity = a; } };
  }

  /* Kalender: zwei Wochen, je 7 Tage; stunden: [[Mo..So],[Mo..So]]; Kopfzeilen von außen (Tageskürzel) */
  function kalender(B, o) {
    const x0 = o.x0 || 80, breite = o.breite || 120, hoeheMax = o.hoehe || 150, ys = o.ys || [330, 690], g = el("g", null, B.g), tage = o.tage || ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const bars = [], summen = [], marken = [];
    o.stunden.forEach((woche, wi) => {
      const y = ys[wi];
      el("rect", { x: x0 - 20, y: y - hoeheMax - 62, width: breite * 7 + 40 - 20, height: hoeheMax + 190, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.2)", "stroke-width": 2 }, g);
      el("line", { x1: x0 - 8, y1: y, x2: x0 + breite * 7 - 28, y2: y, stroke: "rgba(250,246,236,.4)", "stroke-width": 3 }, g);
      woche.forEach((h, di) => {
        const cx = x0 + di * breite + 46;
        const r = el("rect", { x: cx - 30, y: y, width: 60, height: 0, rx: 8, fill: ART.fahren }, g), t = text(g, "", cx, y - 14, { gr: 34, fett: true });
        text(g, tage[di], cx, y + 44, { gr: 30, farbe: "rgba(250,246,236,.8)" });
        bars.push({ r: r, t: t, h: h, y: y, wi: wi, di: di });
      });
      summen.push(text(g, "", x0 + breite * 3.5 - 14, y + 100, { gr: 42, fett: true }));
    });
    return { g: g, summen: summen, setze: function (anteilTage, o2) {
      o2 = o2 || {};
      bars.forEach((b) => {
        const idx = b.wi * 7 + b.di, a = Math.max(0, Math.min(1, anteilTage - idx)), hh = b.h * a;
        b.r.setAttribute("y", f(b.y - hh / 10 * hoeheMax)); b.r.setAttribute("height", f(hh / 10 * hoeheMax));
        b.r.setAttribute("fill", b.h > 9 ? "#F2C16E" : ART.fahren);
        b.t.textContent = a > 0.99 && b.h > 0 ? String(b.h) : ""; b.t.setAttribute("y", f(b.y - hh / 10 * hoeheMax - 14));
      });
      o.stunden.forEach((w, wi) => {
        const bis = Math.max(0, Math.min(7, anteilTage - wi * 7)), n = Math.floor(bis + 0.001), s = w.slice(0, n).reduce((a, c) => a + c, 0);
        summen[wi].textContent = n > 0 ? (o2.vorlage ? o2.vorlage(wi, s) : String(s)) : "";
      });
    }, zeige: (a) => { g.style.opacity = a; } };
  }
  window.LKW_ZEIT = { ART: ART, buehne: buehne, text: text, leiste: leiste, messer: messer, kalender: kalender, hm: hm };
})(window);

})(W);

// ---- kern/pneu.js ----
(function (window) {
/* Schaltbilder der Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Behälter, Leitungen, Zylinder, Ventile, Kupplungsköpfe.
   Reine Zeichnung: jede Komponente hat setze(Wert) mit Werten 0…1 aus kern/modell.js (zweikreis, anhaengerBremse, federspeicher, kuppelnZustand).
   Farben: Druckluft blau, Bremsleitung (Kupplungskopf) gelb, Vorratsleitung rot. Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  let clipZaehler = 0;
  const C = { luft: "#6EC1E4", gelb: "#F2C94C", rot: "#E5584B", stahl: "#C9CFC6", dunkel: "#23262A", linie: "rgba(250,246,236,.30)", feder: "#E8B77F", belag: "#B08A5A" };

  function buehne(stage) {
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#36423B 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    return { svg: svg, g: el("g", null, svg), ueber: el("g", null, svg) };
  }
  function text(parent, t, x, y, o) {
    o = o || {};
    const e = el("text", { x: x, y: y, "text-anchor": o.anker || "middle", "font-size": o.gr || 28, "font-weight": o.fett ? 700 : 600, "font-family": "Barlow, sans-serif", fill: o.farbe || F.creme }, parent);
    e.textContent = t; return e;
  }
  const pfadD = (pts) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
  const mix = (a, b, u) => a + (b - a) * u;

  /* Leitung: graue Röhre, darüber die Füllung (Farbe), Deckkraft/Dicke nach Druck p; ungefüllt = nur Röhre. o: { farbe, w } */
  function leitung(B, pts, o) {
    o = o || {}; const w = o.w || 14, g = el("g", null, o.layer || B.g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "rgba(250,246,236,.22)", "stroke-width": w + 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "#2B3631", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    const fuell = el("path", { d: pfadD(pts), fill: "none", stroke: o.farbe || C.luft, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    return { g: g, setze: function (p) { fuell.setAttribute("opacity", f(Math.max(0, Math.min(1, p)) * 0.95)); }, farbe: (c) => fuell.setAttribute("stroke", c), pts: pts };
  }
  /* Behälter (Vorratsbehälter): Füllstand von unten */
  function behaelter(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: h / 2, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const cp = "cl" + (++clipZaehler) + "_" + Math.round(x) + "_" + Math.round(y) + "_" + (o.id || "");
    const defs = el("defs", null, g), clip = el("clipPath", { id: cp }, defs); el("rect", { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: h / 2 - 3 }, clip);
    const fuell = el("rect", { x: x, y: y + h, width: w, height: 0, fill: o.farbe || C.luft, opacity: 0.85, "clip-path": "url(#" + cp + ")" }, g);
    if (o.name) text(g, o.name, x + w / 2, y + h + 34, { gr: 26 });
    return { g: g, setze: function (p) { p = Math.max(0, Math.min(1, p)); fuell.setAttribute("y", f(y + h - p * h)); fuell.setAttribute("height", f(p * h)); }, x: x, y: y, w: w, h: h };
  }
  /* Bremszylinder (Membran) waagerecht mit Schubstange nach rechts auf eine Bremstrommel-Scheibe. setze(p): Druck 0…1 → Stange fährt aus, Belag drückt */
  function zylinder(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 80, hub = o.hub || 60;
    const kam = el("rect", { x: x, y: y, width: w * 0.6, height: h, rx: 10, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const luft = el("rect", { x: x + 4, y: y + 4, width: 0, height: h - 8, rx: 6, fill: o.farbe || C.luft, opacity: 0.85 }, g);
    const kolben = el("rect", { x: x + 4, y: y + 4, width: 10, height: h - 8, rx: 3, fill: C.stahl }, g);
    const stange = el("rect", { x: x + w * 0.6, y: y + h / 2 - 7, width: w * 0.4, height: 14, fill: C.stahl }, g);
    const beleg = el("rect", { x: x + w, y: y + h / 2 - 28, width: 14, height: 56, rx: 4, fill: C.belag }, g);
    const trommel = el("circle", { cx: x + w + 14 + 70, cy: y + h / 2, r: 62, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 10 }, g);
    return { g: g, setze: function (p) {
      p = Math.max(0, Math.min(1, p));
      const lw = (w * 0.6 - 8 - 12) * 0.9;
      luft.setAttribute("width", f(p * lw)); kolben.setAttribute("x", f(x + 4 + p * lw)); luft.setAttribute("opacity", f(p > 0 ? 0.85 : 0));
      const s = p * hub * 0.35;
      stange.setAttribute("x", f(x + w * 0.6 + s)); stange.setAttribute("width", f(w * 0.4 - s * 0 + 0)); beleg.setAttribute("x", f(x + w + s));
      trommel.setAttribute("stroke", p > 0.05 ? C.belag : "rgba(250,246,236,.45)");
    } };
  }
  /* Ventil (Kasten mit Beschriftung); setze(aktiv 0…1) färbt den Rand */
  function ventil(B, o) {
    const g = el("g", null, B.g), w = o.w || 110, h = o.h || 90;
    const r = el("rect", { x: o.x, y: o.y, width: w, height: h, rx: 14, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    el("path", { d: "M" + (o.x + w * 0.3) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.3) + " " + (o.y + h * 0.25) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.25), fill: "none", stroke: "rgba(250,246,236,.7)", "stroke-width": 4, "stroke-linejoin": "round" }, g);
    if (o.name) text(g, o.name, o.x + w / 2, o.y - 14, { gr: 26 });
    return { g: g, setze: function (a) { r.setAttribute("stroke", a > 0.5 ? (o.farbe || F.gold) : C.stahl); } };
  }
  /* Kupplungskopf (rot/gelb) als Kreis mit Ring; setze(verbunden): 1 = zusammen, 0 = getrennt (Hälften auseinander) */
  function kupplung(B, o) {
    const g = el("g", null, B.g), col = o.farbe, r = o.r || 24, d = o.abstand || 70;
    const a = el("g", null, g), b = el("g", null, g);
    el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, a); el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, b);
    el("circle", { r: r * 0.4, fill: col }, a); el("circle", { r: r * 0.4, fill: col }, b);
    return { g: g, setze: function (v) { const s = (1 - Math.max(0, Math.min(1, v))) * d / 2; a.setAttribute("transform", "translate(" + f(o.x - s - r) + " " + o.y + ")"); b.setAttribute("transform", "translate(" + f(o.x + s + r) + " " + o.y + ")"); } };
  }
  /* Kombizylinder (Schnittbild, vereinfacht): links der Raum der Betriebsbremse (Membran: Druck schiebt die Platte nach links = bremst),
     rechts der Federspeicher (Feder schiebt den Federkolben zur Trennwand und über die Schubstange die Platte nach links = bremst; Druck zwischen Wand und Federkolben spannt die Feder = löst).
     setze(pMembran, pFeder) rechnet mit modell.federspeicher; Stange fährt bei Bremskraft nach links zur Bremse aus. Gibt das Modell-Ergebnis zurück. */
  function kombi(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 560, h = o.h || 200, M = window.LKW_MODELL;
    const mem = w * 0.42, wand = x + mem, ende = x + w, ym = y + h / 2, hub = mem - 70, weg = ende - wand - 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: 22, fill: "#2B3631", stroke: C.stahl, "stroke-width": 7 }, g);
    const luftM = el("rect", { x: x + 8, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    const luftF = el("rect", { x: wand + 6, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    el("rect", { x: wand - 6, y: y + 4, width: 12, height: h - 8, fill: C.stahl }, g);                                  // Trennwand
    const platte = el("rect", { x: wand - 16, y: y + 12, width: 14, height: h - 24, rx: 4, fill: C.stahl }, g);       // Membranplatte
    const kolbenF = el("rect", { x: wand + 6, y: y + 12, width: 16, height: h - 24, rx: 4, fill: C.stahl }, g);        // Federkolben
    const feder = el("path", { d: "", fill: "none", stroke: C.feder, "stroke-width": 9, "stroke-linejoin": "round" }, g);
    const stange = el("rect", { x: x - 70, y: ym - 10, width: 90, height: 20, fill: C.stahl }, g);
    const belag = el("rect", { x: x - 100, y: ym - 42, width: 28, height: 84, rx: 6, fill: C.belag }, g);
    const trommel = el("circle", { cx: x - 100 - 24 - 80, cy: ym, r: 86, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 12 }, g);
    function federPfad(l, r) { const n = 9, a = h * 0.28; let d = "M" + f(l) + " " + f(ym); for (let k = 0; k < n; k++) d += " L" + f(l + (r - l) * (k + 0.5) / n) + " " + f(ym + (k % 2 ? a : -a)); return d + " L" + f(r) + " " + f(ym); }
    return { g: g, x: x, y: y, w: w, h: h, wandX: wand, endeX: ende, setze: function (pM, pF) {
      const r = M.federspeicher({ pFeder: pF, pMembran: pM }), pl = Math.min(1, pF / M.FEDER.haltedruck);
      const xk = wand + 12 + weg * pl;                                              // Federkolben: bei Druck nach rechts (Feder gespannt)
      kolbenF.setAttribute("x", f(xk)); luftF.setAttribute("width", f(Math.max(0, xk - wand - 6))); luftF.setAttribute("opacity", f(pF > 0.02 ? 0.85 : 0));
      feder.setAttribute("d", federPfad(xk + 16, ende - 14));
      const px = wand - 16 - hub * r.kraft;                                          // Membranplatte: je größer die Bremskraft, desto weiter links
      platte.setAttribute("x", f(px)); luftM.setAttribute("x", f(px + 14)); luftM.setAttribute("width", f(Math.max(0, wand - 16 - px) * (pM > 0.02 ? 1 : 0))); luftM.setAttribute("opacity", f(pM > 0.02 ? 0.85 : 0));
      const aus = 40 * r.kraft; stange.setAttribute("x", f(x - 70 - aus)); belag.setAttribute("x", f(x - 100 - aus));
      trommel.setAttribute("stroke", r.gebremst ? C.belag : "rgba(250,246,236,.45)"); return r;
    } };
  }

  /* Verzögerung erster Ordnung (Druck baut sich auf/ab): Werte im Raster dt vorab rechnen, Abruf per Zeit */
  function verlauf(dauer, ziel, tau, start) { const dt = 0.05, n = Math.round(dauer / dt) + 1, a = new Array(n); let p = start || 0; for (let i = 0; i < n; i++) { p += (ziel(i * dt) - p) * (1 - Math.exp(-dt / tau)); a[i] = p; } return (t) => a[Math.max(0, Math.min(n - 1, Math.round(t / dt)))]; }
  const klemme = (u) => Math.max(0, Math.min(1, u));

  /* Schema der Zweileitungsbremse (Zugmaschine links, Anhänger rechts, Köpfe in der Mitte). Bühne B (aus buehne()), tx = Textfunktion.
     zustand(t) -> { rotV, gelbV (Verbindung 0…1), pedal (0…1), res0 (Vorrat des Anhängers, solange rot nicht verbunden), rotDruck (optional, Druck auf der roten Leitung; Standard 1), gelbDefekt (optional: gelbe Leitung abgerissen) }
     Die Drücke im Anhänger kommen aus modell.anhaengerBremse. zeichne(t) -> { c (Zylinderdruck), r (Vorrat) } */
  function zweileitung(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, ROT = C.rot, GELB = C.gelb;
    el("rect", { x: 40, y: 150, width: 250, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    el("rect", { x: 580, y: 150, width: 460, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    text(g, tx("l_zug"), 165, 120, { gr: 30, fett: true }); text(g, tx("l_anh"), 810, 120, { gr: 30, fett: true });
    const vorratZ = behaelter(B, { x: 70, y: 190, w: 190, h: 90 });
    const pedal = el("g", null, g), pedalPlatte = el("rect", { x: 100, y: 620, width: 130, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, pedal);
    text(g, tx("l_pedal"), 165, 720, { gr: 26 });
    const rot = { y: 300 }, gelb = { y: 520 };
    const teil = (y, farbe) => ({ l: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: "#2B3631", "stroke-width": 16, "stroke-linecap": "round" }, g), f: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: farbe, "stroke-width": 16, "stroke-linecap": "round", opacity: 0 }, g) });
    const rz = teil(rot.y, ROT), ra = teil(rot.y, ROT), gz = teil(gelb.y, GELB), ga = teil(gelb.y, GELB);
    const setzeTeil = (t, x1, x2, p) => { [t.l, t.f].forEach((e) => { e.setAttribute("x1", f(x1)); e.setAttribute("x2", f(x2)); }); t.f.setAttribute("opacity", f(klemme(p) * 0.95)); };
    const kr = kupplung(B, { x: 430, y: rot.y, farbe: ROT, r: 26, abstand: 150 }), kg = kupplung(B, { x: 430, y: gelb.y, farbe: GELB, r: 26, abstand: 150 });
    const ventil1 = ventil(B, { x: 660, y: 380, w: 130, h: 100 }); text(g, tx("l_ventil"), 725, 360, { gr: 24 });
    const vorratA = behaelter(B, { x: 840, y: 190, w: 170, h: 90 }); text(g, tx("l_behaelter"), 955, 322, { gr: 22 });
    const zyl = zylinder(B, { x: 640, y: 650, w: 150, h: 80 });
    const l1 = leitung(B, [[580, rot.y], [725, rot.y], [725, 380]], { farbe: ROT }), l2 = leitung(B, [[790, 430], [865, 430], [865, 280]], { farbe: ROT });
    const l3 = leitung(B, [[580, gelb.y], [620, gelb.y], [620, 430], [660, 430]], { farbe: GELB }), l4 = leitung(B, [[725, 480], [725, 650]], { farbe: C.luft });
    const rotP = (z) => (z.rotV >= 1 ? (z.rotDruck == null ? 1 : z.rotDruck) : 0);
    const res = verlauf(dauer, (t) => { const z = zustand(t); return rotP(z) >= M.DRUCK.schwelle ? 1 : z.res0; }, 1.5, zustand(0).res0);
    const zielZyl = (t) => { const z = zustand(t); return M.anhaengerBremse({ rot: rotP(z), gelb: z.gelbV >= 1 ? z.pedal : 0, vorratAnh: res(t) }).zyl; };
    const zy = verlauf(dauer, zielZyl, 0.5, zielZyl(0));
    const rotZug = verlauf(dauer, (t) => { const z = zustand(t); return z.rotDruck == null ? 1 : z.rotDruck; }, 0.25, 1);
    return { B: B, zeichne: function (t) {
      const z = zustand(t), r = res(t), c = zy(t), rd = rotZug(t), rp = rotP(z) >= M.DRUCK.schwelle ? Math.min(1, rd) : 0;
      pedalPlatte.setAttribute("y", f(620 + 16 * z.pedal)); pedalPlatte.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      vorratZ.setze(1);
      kr.setze(z.rotV); kg.setze(z.gelbV);
      const dr = (1 - z.rotV) * 75, dg = (1 - z.gelbV) * 75;
      setzeTeil(rz, 290, 430 - 26 - dr, rd); setzeTeil(ra, 430 + 26 + dr, 580, z.rotV >= 1 ? rd : 0);
      setzeTeil(gz, 290, 430 - 26 - dg, z.gelbDefekt ? 0 : z.pedal); setzeTeil(ga, 430 + 26 + dg, 580, z.gelbV >= 1 ? z.pedal : 0);
      l1.setze(rp); l2.setze(rp); l3.setze(z.gelbV >= 1 ? z.pedal : 0); l4.setze(c); vorratA.setze(r); zyl.setze(c); ventil1.setze(c > 0.05 ? 1 : 0);
      return { c: c, r: r };
    }, g: g, kr: kr, kg: kg };
  }


  /* Schema der Zweikreis-Betriebsbremse: zwei Vorratsbehälter (Kreis 1 und 2), Bremsventil mit zwei Ausgängen, zwei Bremszylinder (Vorder- und Hinterachse).
     zustand(t) -> { pedal (0…1), leck: [bool, bool] }. Rechnet mit modell.zweikreis; Behälter entleeren sich bei Leck, der andere Kreis bleibt gefüllt. Gibt { wirkung } zurück. */
  function zweikreis(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, K = [C.luft, "#8FD6A6"];
    const r1 = behaelter(B, { x: 70, y: 200, w: 190, h: 90, farbe: K[0] }), r2 = behaelter(B, { x: 70, y: 480, w: 190, h: 90, farbe: K[1] });
    text(g, tx("l_kreis1"), 165, 180, { gr: 26 }); text(g, tx("l_kreis2"), 165, 460, { gr: 26 });
    const vent = ventil(B, { x: 420, y: 340, w: 150, h: 130 }); text(g, tx("l_bremsventil"), 495, 320, { gr: 26 });
    const z1 = zylinder(B, { x: 700, y: 190, w: 150, h: 80, farbe: K[0] }), z2 = zylinder(B, { x: 700, y: 480, w: 150, h: 80, farbe: K[1] });
    text(g, tx("l_vorderachse"), 790, 170, { gr: 26 }); text(g, tx("l_hinterachse"), 790, 460, { gr: 26 });
    const a1 = leitung(B, [[260, 245], [340, 245], [340, 375], [420, 375]], { farbe: K[0] }), a2 = leitung(B, [[260, 525], [340, 525], [340, 440], [420, 440]], { farbe: K[1] });
    const o1 = leitung(B, [[570, 380], [640, 380], [640, 230], [700, 230]], { farbe: K[0] }), o2 = leitung(B, [[570, 435], [640, 435], [640, 520], [700, 520]], { farbe: K[1] });
    const pedal = el("rect", { x: 420, y: 640, width: 150, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, g); text(g, tx("l_pedal"), 495, 730, { gr: 26 });
    el("rect", { x: 70, y: 850, width: 520, height: 44, rx: 14, fill: "rgba(250,246,236,.1)", stroke: "rgba(250,246,236,.3)", "stroke-width": 2 }, g);
    const wBalken = el("rect", { x: 70, y: 850, width: 0, height: 44, rx: 14, fill: C.gelb }, g); text(g, tx("l_wirkung"), 70, 835, { gr: 26, anker: "start" });
    // Leck: Tropfen unter Behälter 2
    const leck = el("g", { opacity: 0 }, g); [[130, 600], [180, 612], [225, 598]].forEach((p) => el("path", { d: "M" + p[0] + " " + p[1] + " q-10 20 0 28 q10 -8 0 -28", fill: "#FF9A5C" }, leck));
    const V = [0, 1].map((k) => verlauf(dauer, (t) => (zustand(t).leck[k] ? 0 : 1), 1.6, 1));
    const Z = [0, 1].map((k) => verlauf(dauer, (t) => M.zweikreis({ pedal: zustand(t).pedal, leck: [V[0](t) < 0.05, V[1](t) < 0.05] }).zyl[k], 0.4, 0));
    return { B: B, zeichne: function (t) {
      const z = zustand(t), v = [V[0](t), V[1](t)], c = [Z[0](t), Z[1](t)];
      r1.setze(v[0]); r2.setze(v[1]); a1.setze(v[0]); a2.setze(v[1]); o1.setze(c[0]); o2.setze(c[1]); z1.setze(c[0]); z2.setze(c[1]);
      vent.setze(z.pedal > 0.05 ? 1 : 0); pedal.setAttribute("y", f(640 + 16 * z.pedal)); pedal.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      const w = (c[0] + c[1]) / 2; wBalken.setAttribute("width", f(w * 520)); leck.setAttribute("opacity", z.leck[1] || z.leck[0] ? 1 : 0);
      return { wirkung: w, v: v, c: c };
    } };
  }

  window.LKW_PNEU = { zweikreis: zweikreis, zweileitung: zweileitung, verlauf: verlauf, C: C, buehne: buehne, text: text, leitung: leitung, behaelter: behaelter, zylinder: zylinder, ventil: ventil, kupplung: kupplung, kombi: kombi, mix: mix };
})(window);

})(W);

// ---- kern/kuppeln.js ----
(function (window) {
/* Seitenbilder zum Kuppeln (Filme 3.1, 3.2, 3.3): Sattelzugmaschine, Auflieger mit Stützwinden und Keilen, Druckluftschläuche, geneigter Boden.
   Alle Zeichnungen in Metern (Boden y = 0, Höhe nach oben = negatives y), Fahrtrichtung nach rechts. Die Höhen sind Beispielwerte eines neutralen Fahrzeugs
   (Sattelplatte knapp unter der Unterkante des Aufliegers), Zahlen kommen nicht ins Bild. Bewegungen und Prüfungen: kern/modell.js (sattelUnterfahren, kuppelnZustand, rollen). */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f, SA = window.LKW_MODELL.SATTEL;
  const GELB = "#F2C94C", ROT = "#E5584B", ELEK = "#B9BEC4";
  // Beispielmaße (m): Unterkante des Aufliegers über dem Boden, Sattelplatte der Zugmaschine bei normaler Fahrhöhe
  const MASS = { auflieger: { unterkante: SA.unterkante, zapfenUnten: SA.zapfenUnten, stuetzX: -2.4, achsX: -7.6, vorderKante: 1.55, hinterKante: -10.9, hoehe: 4.0 }, zug: { plattenOben: SA.plattenOben, hinterachse: 0, vorderachse: 3.7, kabineHinten: 2.9, kabineVorn: 5.1, rahmenHinten: -1.2 }, steckdose: { x: 1.56, y: [-2.55, -2.30, -2.05] }, anker: { x: 2.9, y: [-2.55, -2.30, -2.05] } };

  /* Bühne mit geneigtem Boden: Gruppe G in Metern, x entlang des Bodens. winkel in Grad (positiv: Boden fällt nach rechts ab). kamera(xc): Weltpunkt xc liegt auf ox */
  function szene(stage, o) {
    o = o || {}; const S = o.S || 48, ox = o.ox || 540, boden = o.boden || 760, sl = o.winkel || 0;
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#3A463F 60%,#434B45 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    const G = el("g", null, svg), W = { S: S, G: G, svg: svg, xc: 0, ox: ox, boden: boden, winkel: sl };
    el("rect", { x: -400, y: 0, width: 800, height: 400, fill: "#4A524C" }, G);
    el("rect", { x: -400, y: -0.06, width: 800, height: 0.12, fill: "#7A837C" }, G);
    for (let i = -80; i <= 80; i++) el("line", { x1: i * 5, y1: 0.35, x2: i * 5, y2: 0.8, stroke: "rgba(250,246,236,.30)", "stroke-width": 0.06 }, G);   // Streckenmarken alle 5 m
    W.gHinten = el("g", null, G); W.gFz = el("g", null, G); W.gVorn = el("g", null, G);
    W.kamera = function (xc) { W.xc = xc; G.setAttribute("transform", "translate(" + f(ox) + " " + f(boden) + ") rotate(" + f(sl) + ") scale(" + S + ") translate(" + f(-xc) + " 0)"); };
    W.kamera(0);
    // Bildschirmposition eines Punktes (Meter in G) ohne Neigung: für Beschriftungen
    W.px = (x, y) => { const a = sl * Math.PI / 180, dx = (x - W.xc) * S, dy = (y || 0) * S; return [ox + dx * Math.cos(a) - dy * Math.sin(a), boden + dx * Math.sin(a) + dy * Math.cos(a)]; };
    return W;
  }
  function rad(g, cx, r) {
    const w = el("g", { transform: "translate(" + cx + " -" + r + ")" }, g);
    el("circle", { r: r, fill: F.reifen, stroke: "#000", "stroke-width": 0.04 }, w);
    const d = el("g", null, w); el("circle", { r: r * 0.55, fill: "#8D949C" }, d); el("line", { x1: -r * 0.5, y1: 0, x2: r * 0.5, y2: 0, stroke: "#4B5057", "stroke-width": 0.09 }, d);
    return d;
  }

  /* Auflieger (Ursprung: Königszapfen am Boden; x = Fahrtrichtung). setze({ stuetze: 0…1 (ausgefahren), keil: 0/1, licht: 0/1 }) */
  function auflieger(W, o) {
    o = o || {}; const A = MASS.auflieger, g = el("g", null, o.layer || W.gFz);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    const kasten = el("rect", { x: A.hinterKante, y: -A.hoehe, width: A.vorderKante - A.hinterKante, height: A.hoehe - 1.45, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = A.hinterKante + 1.0; x < A.vorderKante - 0.5; x += 1.2) el("line", { x1: x, y1: -A.hoehe + 0.1, x2: x, y2: -1.55, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    el("rect", { x: A.hinterKante + 0.2, y: -1.45, width: A.vorderKante - A.hinterKante - 0.4, height: 0.15, fill: "#3A3E43" }, g);                   // Fahrgestell
    el("path", { d: "M" + A.vorderKante + " -" + (A.unterkante + 0.12) + " L0.6 -" + A.unterkante + " L" + A.vorderKante + " -" + A.unterkante + " Z", fill: "#5A5F66" }, g);   // Aufgleitplatte (vorn angeschrägt)
    el("rect", { x: -0.09, y: -A.unterkante, width: 0.18, height: A.unterkante - A.zapfenUnten, fill: "#33373C" }, g);                                                            // Königszapfen
    el("rect", { x: A.vorderKante - 0.05, y: -3.2, width: 0.06, height: 1.7, fill: "#9AA3AC" }, g);                                                      // Stirnwand
    // Stützwinde (Seitenansicht: ein Bein)
    const bein = el("rect", { x: A.stuetzX - 0.1, y: -A.unterkante, width: 0.2, height: 0.85, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.04 }, g);
    const fuss = el("rect", { x: A.stuetzX - 0.3, y: -0.12, width: 0.6, height: 0.1, rx: 0.03, fill: "#33373C" }, g);
    const kurbel = el("g", null, g); el("line", { x1: A.stuetzX + 0.1, y1: -0.9, x2: A.stuetzX + 0.55, y2: -0.9, stroke: "#23262A", "stroke-width": 0.06 }, kurbel); el("circle", { cx: A.stuetzX + 0.55, cy: -0.9, r: 0.07, fill: "#23262A" }, kurbel);
    // Räder (drei Achsen)
    const dreherA = [A.achsX - 1.3, A.achsX, A.achsX + 1.3].map((cx) => rad(g, cx, 0.5));
    // Keile (vor und hinter dem letzten Rad)
    const keil = el("g", { opacity: 0 }, g);
    el("path", { d: "M" + (A.achsX - 1.3 - 0.52) + " 0 L" + (A.achsX - 1.3 - 0.95) + " 0 L" + (A.achsX - 1.3 - 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#8F5A14", "stroke-width": 0.04 }, keil);
    el("path", { d: "M" + (A.achsX - 1.3 + 0.52) + " 0 L" + (A.achsX - 1.3 + 0.95) + " 0 L" + (A.achsX - 1.3 + 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#8F5A14", "stroke-width": 0.04 }, keil);
    // Steckdosen an der Stirnwand: gelb (Bremse), rot (Vorrat), elektrisch
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.steckdose.x, cy: MASS.steckdose.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, g));
    const glut = el("circle", { cx: A.hinterKante, cy: -1.75, r: 0.55, fill: "rgba(255,59,43,.7)", opacity: 0 }, g), licht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: F.ruecklicht, opacity: 0.9 }, g), bremslicht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: "#FF3B2B", opacity: 0 }, g);
    return { g: g, setze: function (x, s) {
      s = s || {}; g.setAttribute("transform", "translate(" + f(x) + " 0)"); dreherA.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + A.achsX) / 0.5) * 57.2958 % 360) + ")"));
      const e = s.stuetze == null ? 1 : s.stuetze; bein.setAttribute("height", f(A.unterkante - 0.45 * (1 - e))); fuss.setAttribute("y", f(-0.12 - 0.45 * (1 - e) * 1));
      kurbel.setAttribute("transform", "translate(0 " + f(-0.45 * (1 - e) * 0) + ")");
      keil.setAttribute("opacity", s.keil == null ? 0 : Number(s.keil)); bremslicht.setAttribute("opacity", s.bremst ? 1 : 0); glut.setAttribute("opacity", s.bremst ? 0.45 : 0); licht.setAttribute("opacity", s.licht == null ? 0.9 : (s.licht ? 1 : 0.35));
    } };
  }

  /* Sattelzugmaschine (Ursprung: Hinterachse am Boden). setze(x, luft): luft = Höhenänderung der Luftfederung in m (positiv = angehoben) */
  function zugmaschine(W, o) {
    o = o || {}; const Z = MASS.zug, g = el("g", null, o.layer || W.gFz), karo = el("g", null, g);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: Z.rahmenHinten, y: -1.15, width: 5.9, height: 0.16, fill: "#3A3E43" }, karo);
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 1.5, height: 0.12, rx: 0.03, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.03 }, karo);               // Sattelplatte (Oberseite bei −1,25 m)
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 0.3, height: 0.12, fill: "#5A5F66" }, karo);
    el("path", { d: "M" + Z.kabineHinten + " -1.1 L" + Z.kabineHinten + " -3.3 L4.3 -3.3 L" + Z.kabineVorn + " -2.0 L" + Z.kabineVorn + " -1.1 Z", fill: F.kabine, stroke: F.kabineD, "stroke-width": 0.07 }, karo);
    el("path", { d: "M3.2 -2.2 L3.2 -3.05 L4.2 -3.05 L4.85 -2.2 Z", fill: F.glas }, karo);
    el("rect", { x: Z.kabineVorn - 0.12, y: -1.5, width: 0.12, height: 0.3, fill: F.scheinwerfer }, karo);
    el("rect", { x: 3.0, y: -1.0, width: 1.0, height: 0.55, rx: 0.05, fill: "#5A5F66" }, karo);
    // Anschlusspunkte hinter der Kabine (gelb, rot, Elektrik)
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.anker.x, cy: MASS.anker.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, karo));
    // Betätigung der Sattelkupplung: Hebel hinten an der Platte (offen = angehoben) und Sicherung (Falle); zu = 1: geschlossen und gesichert
    const hebel = el("g", { transform: "translate(-0.15 -1.34)" }, karo); el("line", { x1: 0, y1: 0, x2: -0.45, y2: 0, stroke: "#23262A", "stroke-width": 0.08, "stroke-linecap": "round" }, hebel); el("circle", { cx: -0.45, cy: 0, r: 0.07, fill: "#23262A" }, hebel);
    const falle = el("rect", { x: -0.12, y: -1.36, width: 0.2, height: 0.1, rx: 0.03, fill: "#FF9A5C", stroke: "#23262A", "stroke-width": 0.03 }, karo);
    const dreher = [rad(g, Z.hinterachse, 0.5), rad(g, Z.vorderachse, 0.5)];
    return { g: g, karo: karo, hebelPos: { x: -0.4, y: -1.34 }, setze: function (x, luft) { g.setAttribute("transform", "translate(" + f(x) + " 0)"); karo.setAttribute("transform", "translate(0 " + f(-(luft || 0)) + ")"); dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + SA.e) / 0.5) * 57.2958 % 360) + ")")); },
      kupplung: function (zu) { hebel.setAttribute("transform", "translate(-0.15 -1.34) rotate(" + f((1 - zu) * -55) + ")"); falle.setAttribute("fill", zu > 0.5 ? "#8FD6A6" : "#FF9A5C"); falle.setAttribute("y", f(zu > 0.5 ? -1.31 : -1.40)); } };
  }

  /* Schlauch von (x1,y1) nach (x2,y2) mit Durchhang; Länge L (m): je kürzer der Abstand, desto mehr Durchhang. */
  function schlauch(W, farbe, o) {
    o = o || {}; const g = el("g", null, o.layer || W.gVorn), L = o.laenge || 1.6;
    const p = el("path", { d: "", fill: "none", stroke: farbe, "stroke-width": 0.1, "stroke-linecap": "round" }, g), kopf = el("circle", { r: 0.12, fill: farbe, stroke: "#23262A", "stroke-width": 0.04 }, g);
    return { g: g, setze: function (a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y), sack = Math.max(0.1, Math.sqrt(Math.max(0, L * L - d * d)) * 0.5), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + sack;
      p.setAttribute("d", "M" + f(a.x) + " " + f(a.y) + " Q" + f(mx) + " " + f(my + sack * 0.3) + " " + f(b.x) + " " + f(b.y)); kopf.setAttribute("cx", f(b.x)); kopf.setAttribute("cy", f(b.y));
    } };
  }
  // Anschlusspunkt k (0 gelb, 1 rot, 2 Elektrik) hinter der Kabine in Weltkoordinaten, wenn der Zug mit dem Königszapfen bei kp gekuppelt steht (Zugmaschine bei kp − e, angehoben bis Kontakt)
  const ankerWelt = (kp, k) => ({ x: kp - SA.e + MASS.anker.x, y: MASS.anker.y[k] - (SA.unterkante - SA.plattenOben) });
  const ruheWelt = (kp, k) => { const a = ankerWelt(kp, k); return { x: a.x - 0.15, y: a.y + 0.55 }; };
  /* Pille an Bildschirmposition (Mitte) mit Deckkraft a; Hinweislinie (Pixel) von der Pille zum Punkt */
  function platz(p, x, y, a) { p.style.left = f(Math.max(270, Math.min(810, x))) + "px"; p.style.top = f(y) + "px"; p.style.opacity = a; }
  function leiter(W, farbe) {
    const g = el("g", { opacity: 0 }, W.svg), l = el("line", { stroke: farbe || F.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g), c = el("circle", { r: 5, fill: farbe || F.creme }, g);
    return { g: g, setze: (x1, y1, x2, y2, a) => { l.setAttribute("x1", f(x1)); l.setAttribute("y1", f(y1)); l.setAttribute("x2", f(x2)); l.setAttribute("y2", f(y2)); c.setAttribute("cx", f(x2)); c.setAttribute("cy", f(y2)); g.style.opacity = a; } };
  }
  // Seitenansicht mit Zugmaschine und Auflieger (Maßstab S, Kamera xc, Blickhöhe yc)
  function seite(st, S, xc, yc, ox) { const W = szene(st, { S: S, ox: ox || 540, boden: 540 + yc * S }); W.kamera(xc); return { W: W, au: auflieger(W), zm: zugmaschine(W) }; }
  window.LKW_KUPPELN = { ankerWelt: ankerWelt, ruheWelt: ruheWelt, platz: platz, leiter: leiter, seite: seite, MASS: MASS, GELB: GELB, ROT: ROT, szene: szene, auflieger: auflieger, zugmaschine: zugmaschine, schlauch: schlauch };
})(window);

})(W);

W.LKW_FOTOS = {"kupplungskoepfe":"data:image/jpeg;base64,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"};
// ---- kern/foto.js ----
(function (window) {
/* Fotokarte: blendet ein Beispielfoto (KI-erzeugt, siehe fotos/) über die Bühne, Rest der Bühne wird abgedunkelt.
   LKW_FOTO.karte(st, name, titel, hinweis) -> { setze(a) }  (a = 0…1). Die Bilddaten kommen in der App aus window.LKW_FOTOS[name] (Data-URI, von bauen.mjs eingebettet), im MP4-Film aus ../fotos/<name>.jpg.
   Das Foto ist Beispiel, kein Herstellerbild: Es trägt immer den Hinweis „Beispielbild, KI-erzeugt“ (hinweis). */
(function (window) {
  "use strict";
  function karte(st, name, titel, hinweis) {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1080px;background:rgba(24,31,27,.9);opacity:0;pointer-events:none";
    const rahmen = document.createElement("div");
    rahmen.style.cssText = "position:absolute;left:190px;top:150px;width:700px;height:700px;border-radius:26px;overflow:hidden;border:6px solid #FAF6EC;box-shadow:0 18px 50px rgba(0,0,0,.5);background:#222";
    const im = document.createElement("img"); im.alt = "";
    im.src = (window.LKW_FOTOS && window.LKW_FOTOS[name]) || ("../fotos/" + name + ".jpg");
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    rahmen.appendChild(im); d.appendChild(rahmen);
    const t = document.createElement("div"); t.textContent = titel;
    t.style.cssText = "position:absolute;left:90px;width:900px;top:880px;text-align:center;font:700 54px/1.1 'Barlow',sans-serif;color:#FAF6EC";
    const h = document.createElement("div"); h.textContent = hinweis;
    h.style.cssText = "position:absolute;left:90px;width:900px;top:960px;text-align:center;font:600 32px/1.1 'Barlow',sans-serif;color:rgba(250,246,236,.7)";
    d.appendChild(t); d.appendChild(h); st.appendChild(d);
    return { setze: function (a) { d.style.opacity = a; } };
  }
  window.LKW_FOTO = { karte: karte };
})(window);

})(W);

// ---- f3-3/text.js ----
(function (window) {
/* Film 3.3 „Gelb zuerst, rot nie allein“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quelle: DGUV Information 214-080 „Kuppeln“ (S. 20, 28/29; Kap. 2.2.1 Schritt 9 und 11, 2.3.1 Schritt 11), BG Verkehr („Richtige Reihenfolge beim Anschließen der Luftleitungen rettet Leben“; „Abstellen und kuppeln“),
   Prüfungsablauf Klasse CE, Theoriefragen 2.7.07-319/-320; Funktionsbeschreibung Zweileitungsbremse: Serbands Dropbox-Folien CE (Abend 6), WABCO-Katalog (Anhängerbremsventil). Belege im Vault, Faktenblatt Film 3.3.
   Der Film zeigt die FOLGE (Rot löst die Betriebsbremse des Anhängers, ohne Sicherung rollt der Zug), nicht den Ventilvorgang im Detail. Keine Zahlen im Bild.
   Druck und Bewegung kommen aus kern/modell.js (anhaengerBremse, kuppelnZustand, rollen) mit Tests. */
window.FILM_TEXT = {
  film: "lkw-f3-3",
  fotos: ["kupplungskoepfe"],
  poster: 60,
  de: {
    titel: "Gelb zuerst, rot nie allein",
    l_foto: "Beispielbild, KI-erzeugt", f_koepfe: "Gelb, rot und Elektrik",
    ui_ueber: "Überblick: Druckluftleitungen beim Kuppeln",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Leitungen", k1_titel: "Zwei Leitungen, zwei Aufgaben", k1_sub: "Schema der Zweileitungsbremse.",
    k1_p1: "Rot ist die Vorratsleitung: Sie füllt den Vorratsbehälter des Anhängers.",
    k1_p2: "Gelb ist die Bremsleitung: Sie überträgt das Bremssignal.",
    k1_p3: "Sind beide verbunden, bremst der Anhänger mit, wenn die Zugmaschine bremst.",
    l_rot: "Rot: Vorrat", l_gelb: "Gelb: Bremssignal", l_zug: "Zugmaschine", l_anh: "Anhänger", l_pedal: "Bremspedal", l_behaelter: "Vorratsbehälter", l_ventil: "Anhängerbremsventil",

    k2_kicker: "Die Gefahr", k2_titel: "Rot löst die Bremse", k2_sub: "Was passiert, wenn rot allein verbunden ist?",
    k2_p1: "Ein abgekuppelter Anhänger ist gebremst: In der Vorratsleitung fehlt der Druck.",
    k2_p2: "Wird rot angeschlossen, löst die Betriebsbremse des Anhängers.",
    k2_p3: "Ohne gelb kommt kein Bremssignal von der Zugmaschine.",
    k2_p4: "Erst mit gelb bremst der Anhänger wieder mit.",
    l_gebremst: "Anhänger gebremst", l_geloest: "Bremse gelöst", l_kein_signal: "Kein Bremssignal", l_bremst_mit: "Bremst mit",

    k3_kicker: "Am Hang", k3_titel: "Rot allein: der Zug rollt", k3_sub: "Keine Feststellbremse, keine Keile.",
    k3_p1: "Hier ist nichts gesichert: keine Feststellbremse, keine Keile.",
    k3_p2: "Rot wird allein angeschlossen. Die Betriebsbremse des Anhängers löst.",
    k3_p3: "Der Zug setzt sich in Bewegung, schon bei kleinem Gefälle.",
    k3_p4: "Rollt der Zug, trenne die rote Leitung. Versuche nie, ins Führerhaus zu gelangen.",
    l_nichts: "Nichts gesichert", l_rollt: "Der Zug rollt", l_rot_trennen: "Rot trennen",

    k4_kicker: "Richtig", k4_titel: "Erst sichern, dann gelb, dann rot", k4_sub: "Dieselbe Stelle, jetzt richtig.",
    k4_p1: "Erst sichern: Feststellbremsen und Keile.",
    k4_p2: "Dann gelb anschließen: die Bremsleitung.",
    k4_p3: "Dann rot: die Vorratsleitung. Der Zug bleibt stehen.",
    k4_p4: "Bei kombinierten Kupplungsköpfen gibt es keine Reihenfolge: Beide werden gleichzeitig angeschlossen.",
    k4_p5: "Die Feststellbremse der Zugmaschine gibt Druck auf gelb: Der Anhänger bleibt gebremst.",
    l_gesichert: "Gesichert", l_steht: "Der Zug steht", l_kombi: "Kombinierter Kopf",

    k5_kicker: "Abkuppeln", k5_titel: "Umgekehrt: erst rot ab", k5_sub: "Beim Trennen kommt rot zuerst.",
    k5_p1: "Beim Abkuppeln wird zuerst rot getrennt, dann gelb.",
    k5_p2: "Der Anhänger bremst danach selbsttätig. Das reicht zum Sichern nicht, denn die Luft entweicht mit der Zeit.",
    k5_p3: "Auch dann: Feststellbremsen und Keile.",
    l_rot_ab: "Rot zuerst ab", l_gelb_ab: "Dann gelb ab", l_reicht_nicht: "Reicht nicht zum Sichern",

    k6_kicker: "Merke", k6_titel: "Zum Mitnehmen",
    k6_merk: "Vorher sichern. Gelb zuerst, rot nie allein. Beim Abkuppeln erst rot, dann gelb."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 66, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k1_p2", t: 16.0 }, { k: "k1_p3", t: 28.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 80, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5 }, { k: "k2_p2", t: 16.0, ref: "DGUV Information 214-080" }, { k: "k2_p3", t: 30.0 }, { k: "k2_p4", t: 52.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 70, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5 }, { k: "k3_p2", t: 12.0, ref: "DGUV Information 214-080" }, { k: "k3_p3", t: 24.0, stil: "gold" }, { k: "k3_p4", t: 38.0, ref: "DGUV Information 214-080" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 68, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 3.5, ref: "DGUV Information 214-080; BG Verkehr" }, { k: "k4_p2", t: 14.0 }, { k: "k4_p5", t: 24.0, ref: "Folien CE, Abend 6" }, { k: "k4_p3", t: 34.0 }, { k: "k4_p4", t: 46.0, ref: "Theoriefrage 2.7.07-320" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 54, sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 3.5, ref: "DGUV Information 214-080; Theoriefrage 2.7.07-319" }, { k: "k5_p2", t: 20.0, ref: "DGUV Information 214-080, S. 20 und 33" }, { k: "k5_p3", t: 38.0 }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 20, merk: { k: "k6_merk", t: 1.2 } }
  ]
};

})(W);

W.FILM_SPRACHEN = {"en":{"titel":"Yellow first, red never alone","ui_ueber":"Overview: air lines when coupling","ui_intro":"A short film without sound: everything is shown as text in the picture. You can pause at any time or choose a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Next","ui_neu":"From the start","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"The lines","k1_titel":"Two lines, two jobs","k1_sub":"Diagram of the two-line brake system.","k1_p1":"Red is the supply line: it fills the air reservoir of the trailer.","k1_p2":"Yellow is the brake line: it transmits the brake signal.","k1_p3":"When both are connected, the trailer brakes along when the tractor unit brakes.","l_rot":"Red: supply","l_gelb":"Yellow: brake signal","l_zug":"Tractor unit","l_anh":"Trailer","l_pedal":"Brake pedal","l_behaelter":"Air reservoir","l_ventil":"Trailer brake valve","k2_kicker":"The danger","k2_titel":"Red releases the brake","k2_sub":"What happens when red is connected alone?","k2_p1":"An uncoupled trailer is braked: there is no pressure in the supply line.","k2_p2":"When red is connected, the service brake of the trailer releases.","k2_p3":"Without yellow, no brake signal comes from the tractor unit.","k2_p4":"Only with yellow does the trailer brake along again.","l_gebremst":"Trailer braked","l_geloest":"Brake released","l_kein_signal":"No brake signal","l_bremst_mit":"Brakes along","k3_kicker":"On a slope","k3_titel":"Red alone: the rig rolls away","k3_sub":"No parking brake, no chocks.","k3_p1":"Nothing is secured here: no parking brake, no chocks.","k3_p2":"Red is connected alone. The service brake of the trailer releases.","k3_p3":"The rig starts to move, even on a small downhill gradient.","k3_p4":"If the rig rolls away, disconnect the red line. Never try to get into the cab.","l_nichts":"Nothing secured","l_rollt":"The rig rolls away","l_rot_trennen":"Disconnect red","k4_kicker":"Correct","k4_titel":"Secure first, then yellow, then red","k4_sub":"The same place, now done correctly.","k4_p1":"Secure first: parking brakes and chocks.","k4_p2":"Then connect yellow: the brake line.","k4_p3":"Then red: the supply line. The rig stays put.","k4_p4":"With combined coupling heads there is no order: both are connected at the same time.","k4_p5":"The tractor's parking brake puts pressure on yellow: the trailer stays braked.","l_gesichert":"Secured","l_steht":"The rig stands still","l_kombi":"Combined head","k5_kicker":"Uncoupling","k5_titel":"The other way round: red off first","k5_sub":"When disconnecting, red comes first.","k5_p1":"When uncoupling, red is disconnected first, then yellow.","k5_p2":"The trailer then brakes by itself. That is not enough to secure it, because the air escapes over time.","k5_p3":"Even then: parking brakes and chocks.","l_rot_ab":"Red off first","l_gelb_ab":"Then yellow off","l_reicht_nicht":"Not enough to secure","k6_kicker":"Remember","k6_titel":"Take-away","k6_merk":"Secure first. Yellow first, red never alone. When uncoupling, red first, then yellow.","l_foto":"Example image, AI-generated","f_koepfe":"Yellow, red and electrics"},"sr":{"titel":"Prvo žuti, crveni nikad sam","ui_ueber":"Pregled: vazdušni vodovi pri spajanju","ui_intro":"Kratak film bez zvuka: sve stoji kao tekst na slici. Možeš da zaustaviš film u svakom trenutku ili da izabereš poglavlje.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Dalje","ui_neu":"Iz početka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Vodovi","k1_titel":"Dva voda, dva zadatka","k1_sub":"Šema dvovodne kočnice.","k1_p1":"Crveni je napojni vod: puni rezervoar vazduha prikolice.","k1_p2":"Žuti je kočioni vod: prenosi signal kočenja.","k1_p3":"Kad su oba spojena, prikolica koči zajedno sa tegljačem.","l_rot":"Crveni: napajanje","l_gelb":"Žuti: signal kočenja","l_zug":"Tegljač","l_anh":"Prikolica","l_pedal":"Pedala kočnice","l_behaelter":"Rezervoar vazduha","l_ventil":"Ventil kočnice prikol.","k2_kicker":"Opasnost","k2_titel":"Crveni otpušta kočnicu","k2_sub":"Šta se dešava kad je crveni spojen sam?","k2_p1":"Otkačena prikolica je zakočena: u napojnom vodu nema pritiska.","k2_p2":"Kad se crveni spoji, radna kočnica prikolice popušta.","k2_p3":"Bez žutog ne stiže signal kočenja od tegljača.","k2_p4":"Tek sa žutim prikolica ponovo koči zajedno.","l_gebremst":"Prikolica zakočena","l_geloest":"Kočnica otpuštena","l_kein_signal":"Nema signala kočenja","l_bremst_mit":"Koči zajedno","k3_kicker":"Na nagibu","k3_titel":"Crveni sam: kompozicija se otkotrljava","k3_sub":"Nema parkirne kočnice, nema klinova.","k3_p1":"Ovde ništa nije osigurano: nema parkirne kočnice, nema klinova.","k3_p2":"Crveni se spaja sam. Radna kočnica prikolice popušta.","k3_p3":"Kompozicija kreće, već i na malom nagibu.","k3_p4":"Ako se kompozicija otkotrljava, razdvoji crveni vod. Nikad ne pokušavaj da uđeš u kabinu.","l_nichts":"Ništa nije osigurano","l_rollt":"Vozilo se otkotrljava","l_rot_trennen":"Razdvoji crveni","k4_kicker":"Ispravno","k4_titel":"Prvo osigurati, pa žuti, pa crveni","k4_sub":"Isto mesto, sada ispravno.","k4_p1":"Prvo osiguraj: parkirne kočnice i klinovi.","k4_p2":"Zatim spoji žuti: kočioni vod.","k4_p3":"Zatim crveni: napojni vod. Kompozicija ostaje da stoji.","k4_p4":"Kod kombinovanih spojnih glava nema redosleda: obe se priključuju istovremeno.","k4_p5":"Parkirna kočnica tegljača daje pritisak na žuti vod: prikolica ostaje kočena.","l_gesichert":"Osigurano","l_steht":"Kompozicija stoji","l_kombi":"Kombinovana glava","k5_kicker":"Otkačinjanje","k5_titel":"Obrnuto: prvo crveni skinuti","k5_sub":"Pri razdvajanju crveni ide prvi.","k5_p1":"Pri otkačinjanju se prvo razdvaja crveni, pa žuti.","k5_p2":"Prikolica se zatim sama koči. To nije dovoljno za obezbeđenje, jer vazduh vremenom izlazi.","k5_p3":"I tada: parkirne kočnice i klinovi.","l_rot_ab":"Prvo crveni skinuti","l_gelb_ab":"Zatim žuti skinuti","l_reicht_nicht":"Ne osigurava dovoljno","k6_kicker":"Zapamti","k6_titel":"Za poneti","k6_merk":"Prvo osiguraj. Prvo žuti, crveni nikad sam. Pri otkačinjanju prvo crveni, pa žuti.","l_foto":"Primer slike, napravljen veštačkom inteligencijom","f_koepfe":"Žuto, crveno i struja"},"tr":{"titel":"Önce sarı, kırmızı asla tek başına değil","ui_ueber":"Genel bakış: kuplaj sırasında havalı hatlar","ui_intro":"Sessiz kısa bir film: Her şey görüntüde yazıyla yer alır. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"Devam","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"Hatlar","k1_titel":"İki hat, iki görev","k1_sub":"İki hatlı fren sisteminin şeması.","k1_p1":"Kırmızı besleme hattıdır: römorkun hava deposunu doldurur.","k1_p2":"Sarı fren hattıdır: fren sinyalini iletir.","k1_p3":"İkisi de bağlıysa, çekici frenlediğinde römork da frenler.","l_rot":"Kırmızı: besleme","l_gelb":"Sarı: fren sinyali","l_zug":"Çekici","l_anh":"Römork","l_pedal":"Fren pedalı","l_behaelter":"Hava deposu","l_ventil":"Römork fren valfi","k2_kicker":"Tehlike","k2_titel":"Kırmızı freni serbest bırakır","k2_sub":"Kırmızı tek başına bağlanırsa ne olur?","k2_p1":"Ayrılmış bir römork frenlidir: besleme hattında basınç yoktur.","k2_p2":"Kırmızı bağlanınca römorkun çalışma freni serbest kalır.","k2_p3":"Sarı olmadan çekiciden fren sinyali gelmez.","k2_p4":"Römork ancak sarı ile yine birlikte frenler.","l_gebremst":"Römork frenli","l_geloest":"Fren serbest","l_kein_signal":"Fren sinyali yok","l_bremst_mit":"Birlikte frenler","k3_kicker":"Yokuşta","k3_titel":"Kırmızı tek başına: araç kayıyor","k3_sub":"Park freni yok, takoz yok.","k3_p1":"Burada hiçbir şey emniyete alınmamış: park freni yok, takoz yok.","k3_p2":"Kırmızı tek başına bağlanır. Römorkun çalışma freni serbest kalır.","k3_p3":"Araç hareket eder, küçük bir eğimde bile.","k3_p4":"Araç kayıyorsa kırmızı hattı ayır. Asla kabine girmeye çalışma.","l_nichts":"Emniyet yok","l_rollt":"Araç kayıyor","l_rot_trennen":"Kırmızıyı ayır","k4_kicker":"Doğru","k4_titel":"Önce emniyet, sonra sarı, sonra kırmızı","k4_sub":"Aynı yer, bu kez doğru.","k4_p1":"Önce emniyete al: park frenleri ve takozlar.","k4_p2":"Sonra sarıyı bağla: fren hattı.","k4_p3":"Sonra kırmızı: besleme hattı. Araç yerinde kalır.","k4_p4":"Birleşik kaplin başlıklarında sıra yoktur: ikisi aynı anda bağlanır.","k4_p5":"Çekicinin park freni sarı hatta basınç verir: römork frenli kalır.","l_gesichert":"Emniyette","l_steht":"Araç duruyor","l_kombi":"Birleşik başlık","k5_kicker":"Ayırma","k5_titel":"Tersi: önce kırmızı çıkar","k5_sub":"Ayırırken önce kırmızı gelir.","k5_p1":"Ayırırken önce kırmızı, sonra sarı ayrılır.","k5_p2":"Römork bundan sonra kendiliğinden frenler. Bu, sabitlemek için yetmez, çünkü hava zamanla kaçar.","k5_p3":"O zaman da: park frenleri ve takozlar.","l_rot_ab":"Önce kırmızı çıkar","l_gelb_ab":"Sonra sarı çıkar","l_reicht_nicht":"Emniyete yetmez","k6_kicker":"Unutma","k6_titel":"Akılda kalsın","k6_merk":"Önce emniyete al. Önce sarı, kırmızı asla tek başına değil. Ayırırken önce kırmızı, sonra sarı.","l_foto":"Örnek görsel, yapay zekâ ile üretildi","f_koepfe":"Sarı, kırmızı ve elektrik"}};
// ---- f3-3/szenen.js ----
(function (window) {
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
      const foto = window.LKW_FOTO.karte(st, "kupplungskoepfe", tx("f_koepfe"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 6.0, 13.5, 0.7));
        S.zeichne(t);
        const a1 = fenster(t, 3.5, ch.dauer - 1, 0.6), a2 = fenster(t, 16, ch.dauer - 1, 0.6);
        platz(pr, 540, 900, a1); platz(pg, 540, 990, a2);
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
          o2 = o2 || {}; au.setze(X, { stuetze: o2.stuetze == null ? 1 : o2.stuetze, keil: o2.keil ? 1 : 0, bremst: !!o2.bremst }); zm.setze(X + A_G, LUFT_K); zm.kupplung(1); gk.setAttribute("transform", "translate(" + f(X) + " 0)");
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
        H.setze(X, { rot: rotU, bremst: bremst, keil: false, stuetze: 0 }); H.fehl.style.opacity = fenster(t, 3, 30, 0.6);
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
        const gU = t < 14 ? 0 : t < 22 ? glatt((t - 14) / 8) : 1, rU = t < 34 ? 0 : t < 42 ? glatt((t - 34) / 8) : 1;
        H.setze(X, { gelb: gU, rot: rU, keil: t >= 6, bremst: rU < 0.98 });
        H.kz.style.opacity = fenster(t, 3.5, ch.dauer - 1, 0.5) * (t >= 3.5 ? 1 : 0); H.ka.style.opacity = H.kz.style.opacity;
        const a1 = fenster(t, 5, 40, 0.6), a2 = fenster(t, 42, ch.dauer - 1, 0.6);
        platz(pg, 540, 220, a1); platz(ps, 540, 880, a2); kombi.style.opacity = fenster(t, 46, ch.dauer - 1, 0.6); platz(pko, 880, 290, fenster(t, 46, ch.dauer - 1, 0.6));
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
